import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  bgg_id: number;
  name: string;
}

const CategorySchema: Schema = new Schema({
  bgg_id: { type: Number, required: true },
  name: { type: String, required: true },
});

export default mongoose.model<ICategory>("Category", CategorySchema);
