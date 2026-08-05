import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {
  ILoginRequest,
  IAuthResponse,
  JwtPayload,
  IRegisterRequest,
} from "./auth.type";
import User, { IUser } from "./auth.model";
import Game, { IGame } from "../game/game.model";
import { populateRelatedData } from "../../utils/populate.util";
import { POPULATE_CONFIG } from "../game/game.type";
import crypto from "crypto";
import { AppError } from "../../utils/appError.util";

// Maps to store Tokens
// Token blacklist to store invalidated tokens (on logout)
// Accepted limits for blacklist to be wiped out as single instance deployment. Hence
// logout will still be functional even if the server restarts.
// In a multi instance deployment, consider using a shared cache or database for token management.
const tokenBlacklist = new Map<string, number>();

// Utility function to generate JWT token
const hashRefreshToken = (token: string): string =>
  crypto.createHash("sha256").update(token).digest("hex");

const refreshTokensMatch = (candidate: string, storedHash: string): boolean => {
  const candidateHash = Buffer.from(hashRefreshToken(candidate));
  const stored = Buffer.from(storedHash);
  if (candidateHash.length !== stored.length) return false;
  return crypto.timingSafeEqual(candidateHash, stored);
};

export const generateToken = async (payload: JwtPayload): Promise<string> => {
  const key = process.env.JWT_SECRET;
  const expire = process.env.JWT_EXPIRE_IN;
  if (!key) {
    throw new AppError("JWT_SECRET is not defined");
  }

  return jwt.sign(payload, key, {
    expiresIn: expire || "24h",
  } as jwt.SignOptions);
};

export const generateRefreshToken = async (
  payload: JwtPayload,
): Promise<string> => {
  const key = process.env.REFRESH_TOKEN_SECRET;
  const expire = process.env.REFRESH_TOKEN_EXPIRE_IN;
  if (!key) {
    throw new AppError("REFRESH_TOKEN_SECRET is not defined");
  }
  return jwt.sign(
    { ...payload, jti: crypto.randomUUID() }, // guarantees a unique token per issuance
    key,
    { expiresIn: expire || "7d" } as jwt.SignOptions,
  );
};

export const login = async (
  loginData: ILoginRequest,
): Promise<{ token: string; refreshToken: string }> => {
  const user = await User.findOne({ email: loginData.email }).select(
    "+password",
  );
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }
  if (user.isLoggedIn) {
    throw new AppError("User is already logged in", 400);
  }
  const isPasswordValid = await bcrypt.compare(
    loginData.password,
    user.password,
  );
  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  const payload = { userId: user.id, email: user.email };
  const token = await generateToken(payload);
  const refreshToken = await generateRefreshToken(payload);
  user.refreshTokenHash = hashRefreshToken(refreshToken);
  user.isLoggedIn = true;
  await user.save();

  return { token, refreshToken };
};

export const refreshAccessToken = async (
  refreshToken: string,
): Promise<{ token: string; refreshToken: string }> => {
  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string,
    ) as JwtPayload;
  } catch {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  const user = await User.findById(decoded.userId).select("+refreshTokenHash");
  if (!user || !user.refreshTokenHash) {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  const matches = refreshTokensMatch(refreshToken, user.refreshTokenHash);
  if (!matches) {
    user.refreshTokenHash = undefined;
    await user.save();
    throw new AppError("Invalid or expired refresh token", 401);
  }

  const payload = { userId: user.id, email: user.email };
  const newAccessToken = await generateToken(payload);
  const newRefreshToken = await generateRefreshToken(payload);
  user.refreshTokenHash = await hashRefreshToken(newRefreshToken);
  await user.save();

  return { token: newAccessToken, refreshToken: newRefreshToken };
};

export const logout = async (token: string) => {
  const decoded = jwt.decode(token) as jwt.JwtPayload;
  if (decoded?.exp) {
    tokenBlacklist.set(token, decoded.exp);
  }
  if (decoded?.userId) {
    await User.findByIdAndUpdate(decoded.userId, {
      isLoggedIn: false,
      $unset: { refreshTokenHash: "" },
    });
  }
};

export const verifyToken = async (token: string): Promise<JwtPayload> => {
  try {
    const blacklistedExp = tokenBlacklist.get(token);
    if (blacklistedExp !== undefined) {
      const currentTimeInSeconds = Math.floor(Date.now() / 1000);
      if (currentTimeInSeconds < blacklistedExp) {
        throw new AppError("Token has been invalidated (user logged out)");
      }
      tokenBlacklist.delete(token);
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as JwtPayload;

    return decoded;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Invalid or expired token", 401, { cause: error });
  }
};

export const getUserById = async (userId: string) => {
  const user = await User.findById(userId).lean();
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
};

export const getSavedGame = async (userId: string): Promise<IGame[]> => {
  const user = await User.findById(userId).lean();
  if (!user) {
    throw new AppError("User not found", 404);
  }
  const data = await Game.find({
    bgg_id: { $in: user?.fav_games_ids || [] },
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
      throw new AppError("Email is already registered", 400);
    }
    throw new AppError("Username is already taken", 400);
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

  return {
    message: "User registered successfully",
  } as unknown as IAuthResponse;
};

export const addSavedGame = async (
  userId: string,
  bggId: number,
): Promise<IGame[]> => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $addToSet: { fav_games_ids: bggId } },
    { new: true },
  ).lean();

  if (!user) {
    throw new AppError("User not found", 404);
  }
  const data = await Game.find({
    bgg_id: { $in: user?.fav_games_ids || [] },
  }).lean();
  const games = await populateRelatedData(data, POPULATE_CONFIG);
  return [...games];
};

export const removeSavedGame = async (
  userId: string,
  bggId: number,
): Promise<IGame[]> => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { fav_games_ids: bggId } },
    { new: true },
  ).lean();

  if (!user) {
    throw new AppError("User not found", 404);
  }
  const data = await Game.find({
    bgg_id: { $in: user?.fav_games_ids || [] },
  }).lean();
  const games = await populateRelatedData(data, POPULATE_CONFIG);
  return [...games];
};
