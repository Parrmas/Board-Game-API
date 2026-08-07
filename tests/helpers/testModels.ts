import mongoose, { Schema } from "mongoose";

export interface IWidget {
  _id: string;
  bgg_id: number;
  name: string;
}

const WidgetSchema = new Schema<IWidget>({
  _id: { type: String },
  bgg_id: { type: Number, required: true },
  name: { type: String, required: true },
});

// Guard against re-registration if this helper is imported by multiple test files
export const Widget =
  (mongoose.models.Widget as mongoose.Model<IWidget>) ||
  mongoose.model<IWidget>("Widget", WidgetSchema);
