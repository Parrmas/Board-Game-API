import mongoose, { Schema, Document, Types } from "mongoose";

export interface IDesigner extends Document {
  _id: string;
  bgg_id: number;
  name: string;
  description: string;
  created_at: number;
}

const DesignerSchema: Schema = new Schema({
  _id: { type: String, select: false },
  bgg_id: { type: Number, required: true },
  name: { type: String, required: true },
  description: { type: String, select: false },
  created_at: { type: Date, default: Date.now, select: false },
});

export default mongoose.model<IDesigner>("Designer", DesignerSchema);
