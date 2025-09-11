import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { IUser, ILoginRequest, IAuthResponse, JwtPayload } from "./auth.type";
import Game, { IGame } from "../game/game.model";
import { populateRelatedData } from "../../utils/populate.util";
import { POPULATE_CONFIG } from "../game/game.type";

// Hardcoded user data
const hardcodedUser: IUser = {
  id: "1",
  username: "boardgame_enthusiast",
  email: "user@boardgamelib.com",
  password: "$2b$10$ZEJkGtYJhSH0OXT1IwpqnuHCW/lK.2/yKyJxcnBx/p2.oy3EBq2Bi", // "password123" hashed
  savedGameIds: [35863, 313, 295564, 293014, 367375],
  isLoggedIn: false,
};

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
  // Check if user is already logged in
  if (hardcodedUser.isLoggedIn) {
    throw new Error("User is already logged in");
  }

  // Verify credentials against hardcoded user
  if (loginData.email !== hardcodedUser.email) {
    throw new Error("Invalid email or password 1");
  }

  // Check password (using bcrypt compare for the hashed password)
  const isPasswordValid = await bcrypt.compare(
    loginData.password,
    hardcodedUser.password,
  );
  if (!isPasswordValid) {
    throw new Error("Invalid email or password 2");
  }

  // Update login status
  hardcodedUser.isLoggedIn = true;

  // Generate token
  const token = await generateToken({
    userId: hardcodedUser.id,
    email: hardcodedUser.email,
  });

  // Store Active Tokens
  activeTokens.add(token);

  return {
    token,
  };
};

export const logout = (token: string) => {
  const decoded = jwt.decode(token) as jwt.JwtPayload;
  if (decoded && decoded.exp) {
    tokenBlacklist.set(token, decoded.exp);
    hardcodedUser.isLoggedIn = false;
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

export const getHardcodedUser = async (): Promise<
  Omit<IUser, "savedGameIds" | "isLoggedIn">
> => {
  const { savedGameIds, isLoggedIn, ...userWithoutSensitiveData } =
    hardcodedUser;
  return { ...userWithoutSensitiveData };
};

export const getSavedGame = async (): Promise<IGame[]> => {
  const data = await Game.find({
    bgg_id: { $in: hardcodedUser.savedGameIds },
  }).lean();
  const games = await populateRelatedData(data, POPULATE_CONFIG);
  return [...games];
};

export const isUserLoggedIn = async (): Promise<boolean> => {
  return hardcodedUser.isLoggedIn;
};
