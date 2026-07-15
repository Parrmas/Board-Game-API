import mongoose, { Schema } from "mongoose";
import { IGame } from "../game/game.model";

export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  fav_games_ids?: number[];
  fav_games?: IGame[];
  isLoggedIn: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema: Schema = new Schema({
  _id: { type: String, required: true, unique: true, select: false },
  email: { type: String, required: true, unique: true }, 
  password: { type: String, required: true, select: false },
  username: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  fav_games_ids: { type: [Number], default: [] },
  isLoggedIn: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now, select: false },
  updated_at: { type: Date, default: Date.now, select: false },
});

export default mongoose.model<IUser>("User", UserSchema);