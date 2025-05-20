import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IItineraryDay {
  date: Date;
  activities: Types.ObjectId[];
}

export interface ITrip extends Document {
  title: string;
  destination: string;
  destinationLat: number;
  destinationLng: number;
  startDate: Date;
  endDate: Date;
  itinerary: Types.ObjectId[];
  expenses: Types.ObjectId[];
  user: Types.ObjectId; //user associated with the trip
}

export const ItineraryDaySchema: Schema<IItineraryDay> = new Schema({
  date: { type: Date, required: true },
  activities: {
    type: [{ type: Schema.Types.ObjectId, ref: "Activity" }],
    default: [],
  },
});

export const ItineraryDayModel: Model<IItineraryDay> =
  mongoose.models.ItineraryDay ||
  mongoose.model<IItineraryDay>("ItineraryDay", ItineraryDaySchema);

export const TripSchema: Schema<ITrip> = new Schema(
  {
    title: { type: String, required: true },
    destination: { type: String, required: true },
    destinationLat: { type: Number, required: true },
    destinationLng: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    itinerary: {
      type: [{ type: Schema.Types.ObjectId, ref: "ItineraryDay" }],
      default: [],
    },
    expenses: {
      type: [{ type: Schema.Types.ObjectId, ref: "Expense" }],
      default: [],
    },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

/* Custom functions */
// make sure that end date is after start date before saving the trip
TripSchema.pre("validate", function (next) {
  if (this.endDate < this.startDate) {
    next(new Error("End date must be after start date"));
  } else {
    next();
  }
});

// auto generate itinerary days based on start and end dates
TripSchema.pre("save", async function (next) {
  if (this.isNew && this.itinerary.length === 0) {
    const days = Math.ceil(
      (this.endDate.getTime() - this.startDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const ids: Types.ObjectId[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(this.startDate);
      date.setDate(date.getDate() + i);
      const dayDoc = await ItineraryDayModel.create({ date, activities: [] });
      ids.push(dayDoc._id);
    }
    this.itinerary = ids;
  }
  next();
});

const Trip: Model<ITrip> =
  mongoose.models.Trip || mongoose.model<ITrip>("Trip", TripSchema);

export default Trip;
