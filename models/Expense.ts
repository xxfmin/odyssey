import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IExpense extends Document {
  amount: number;
  type: string;
  date: Date;
  trip: Types.ObjectId;
}

export const ExpenseSchema: Schema<IExpense> = new Schema(
  {
    amount: { type: Number, required: true },
    type: { type: String, required: true },
    date: { type: Date, required: true },
    trip: { type: Schema.Types.ObjectId, ref: "Trip", required: true },
  },
  {
    timestamps: true,
  }
);

const Expense: Model<IExpense> =
  mongoose.models.Expense || mongoose.model<IExpense>("Expense", ExpenseSchema);

export default Expense;
