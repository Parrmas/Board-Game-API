import mongoose, { Schema, Document, Types } from "mongoose";
import { ICategory } from "../category/category.model";
import { IDesigner } from "../designer/designer.model";
import { IMechanic } from "../mechanic/mechanic.model";
import { IPublisher } from "../publisher/publisher.model";

export interface IGame extends Document {
  _id: string;
  bgg_id: number;
  name: string;
  description: string;
  year_published: number;
  min_players: number;
  max_players: number;
  playing_time: number;
  min_playtime: number;
  max_playtime: number;
  min_age: number;
  image_url: string;
  thumbnail_url: string;
  average_rating: number;
  complexity_weight: number;
  category_ids?: number[];
  categories?: ICategory[];
  mechanic_ids?: number[];
  mechanics?: IMechanic[];
  designer_ids?: number[];
  designers?: IDesigner[];
  publisher_ids?: number[];
  publishers?: IPublisher[];
  created_at: number;
  updated_at: number;
}

const GameSchema: Schema = new Schema({
  _id: { type: String, select: false },
  bgg_id: { type: Number, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  year_published: { type: Number, required: true },
  min_players: { type: Number, required: true },
  max_players: { type: Number, required: true },
  playing_time: { type: Number, required: true },
  min_playtime: { type: Number, required: true },
  max_playtime: { type: Number, required: true },
  min_age: { type: Number, required: true },
  image_url: { type: String, required: true },
  thumbnail_url: { type: String, required: true },
  average_rating: { type: Number, required: true },
  complexity_weight: { type: Number, required: true },
  category_ids: { type: [Number], default: [] },
  designer_ids: { type: [Number], default: [] },
  mechanic_ids: { type: [Number], default: [] },
  publisher_ids: { type: [Number], default: [] },
  created_at: { type: Date, default: Date.now, select: false },
  updated_at: { type: Date, default: Date.now, select: false },
});

export default mongoose.model<IGame>("Game", GameSchema);
