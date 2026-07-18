import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { ILoginRequest, IAuthResponse, JwtPayload, IRegisterRequest } from "./auth.type";
import User, { IUser } from "./auth.model";
import Game, { IGame } from "../game/game.model";
import { populateRelatedData } from "../../utils/populate.util";
import { POPULATE_CONFIG } from "../game/game.type";
import crypto from "crypto";

// Hardcoded user data

// Maps to store Tokens
const activeTokens = new Set<string>();
const tokenBlacklist = new Map<string, number>();

export const generateToken = async (payload: JwtPayload): Promise<string> => {
  const key = process.env.JWT_SECRET;
  const expire = process.env.JWT_EXPIRE_IN;
  if (!key) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.sign(payload, key, {
    expiresIn: expire || "24h",
  } as jwt.SignOptions);
};

export const login = async (
  loginData: ILoginRequest,
): Promise<IAuthResponse> => {
  const user = await User.findOne({ email: loginData.email }).select("+password");
  // Check if user exists
  if (!user) {
    throw new Error("Invalid email or password");
  }
  // Check if user is already logged in
  if (user.isLoggedIn) {
    throw new Error("User is already logged in");
  }
  // Check password (using bcrypt compare for the hashed password)
  const isPasswordValid = await bcrypt.compare(
    loginData.password,
    user.password,
  );
  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  // Update login status
  user.isLoggedIn = true;
  await user.save();

  // Generate token
  const token = await generateToken({
    userId: user.id,
    email: user.email,
  });

  // Store Active Tokens
  activeTokens.add(token);

  return {
    token,
  };
};

export const logout = async (token: string) => {
  const decoded = jwt.decode(token) as jwt.JwtPayload;
  if (decoded?.exp) {
    tokenBlacklist.set(token, decoded.exp);
  }

  if (decoded?.userId) {
    activeTokens.delete(token);
    await User.findByIdAndUpdate(decoded.userId, { isLoggedIn: false });
  }
};

export const verifyToken = async (token: string): Promise<JwtPayload> => {
  try {
    if (tokenBlacklist.has(token)) {
      throw new Error("Token has been invalidated (user logged out)");
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as JwtPayload;

    return decoded;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

export const getUserById = async (userId: string) => {
  const user = await User.findById(userId).lean();
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

export const getSavedGame = async (userId: string): Promise<IGame[]> => {
  const user = await User.findById(userId).lean();
  if (!user) {
    throw new Error("User not found");
  }
  const data = await Game.find({
    bgg_id: { $in: user?.fav_games_ids  || [] },
  }).lean();
  const games = await populateRelatedData(data, POPULATE_CONFIG);
  return [...games];
};

export const isUserLoggedIn = async (userId: string): Promise<boolean> => {
  const user = await User.findById(userId).lean();
  return user?.isLoggedIn ?? false;
};

export const register = async (
  registerData: IRegisterRequest,
): Promise<IAuthResponse> => {
  const existingUser = await User.findOne({
    $or: [{ email: registerData.email }, { username: registerData.username }],
  });

  if (existingUser) {
    if (existingUser.email === registerData.email) {
      throw new Error("Email is already registered");
    }
    throw new Error("Username is already taken");
  }

  const hashedPassword = await bcrypt.hash(registerData.password, 10);

  const newUser = new User({
    _id: crypto.randomUUID(),
    email: registerData.email,
    password: hashedPassword,
    username: registerData.username,
    firstName: registerData.firstName,
    lastName: registerData.lastName,
    role: "user",
    isLoggedIn: false,
  });

  await newUser.save();

  return { message: "User registered successfully" } as unknown as IAuthResponse;
};