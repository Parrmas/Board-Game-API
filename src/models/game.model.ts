import mongoose, { Schema, Document, Types } from "mongoose";
import { ICategory } from "./category.model";

export interface IGame extends Document {
  bgg_id: number;
  name: string;
  description: string;
  year_published: number;
  min_player: number;
  max_player: number;
  playing_time: number;
  min_playtime: number;
  max_playtime: number;
  min_age: number;
  image_url: string;
  thumbnail_url: string;
  average_rating: number;
  complexity_weight: number;
  categories?: Types.ObjectId[] | ICategory[];
}

const GameSchema: Schema = new Schema({
  bgg_id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  year_published: { type: Number, required: true },
  min_player: { type: Number, required: true },
  max_player: { type: Number, required: true },
  playing_time: { type: Number, required: true },
  min_playtime: { type: Number, required: true },
  max_playtime: { type: Number, required: true },
  min_age: { type: Number, required: true },
  image_url: { type: String, required: true },
  thumbnail_url: { type: String, required: true },
  average_rating: { type: Number, required: true },
  complexity_weight: { type: Number, required: true },
});

export default mongoose.model<IGame>("Game", GameSchema);
