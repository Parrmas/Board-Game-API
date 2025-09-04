import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICategory extends Document {
  _id: string;
  bgg_id: number;
  name: string;
  description: string;
  created_at: number;
  gameCount?: number;
}

const CategorySchema: Schema = new Schema({
  _id: { type: String, select: false },
  bgg_id: { type: Number, required: true },
  name: { type: String, required: true },
  description: { type: String, select: false },
  created_at: { type: Date, default: Date.now, select: false },
});

// Add virtual for game count
CategorySchema.virtual("gameCount", {
  ref: "Game",
  localField: "_id",
  foreignField: "category_ids",
  count: true,
});

// Ensure virtuals are included in toJSON output
CategorySchema.set("toJSON", { virtuals: true });

export default mongoose.model<ICategory>("Category", CategorySchema);
