import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IActivity extends Document {
  title: string;
  time: string; // not required
  description: string; // not required
  location: { lat: number; lng: number };
  type: string;
  itineraryDay: Types.ObjectId;
}

export const ActivitySchema: Schema<IActivity> = new Schema({
  title: { type: String, required: true },
  time: { type: String },
  description: { type: String },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  type: { type: String, required: true },
  itineraryDay: {
    type: Schema.Types.ObjectId,
    ref: "ItineraryDay",
    required: true,
  },
});

const Activity: Model<IActivity> =
  mongoose.models.Activity ||
  mongoose.model<IActivity>("Activity", ActivitySchema);

export default Activity;
