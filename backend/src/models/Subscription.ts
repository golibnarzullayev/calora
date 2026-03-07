import mongoose, { Schema, Document } from "mongoose";

export interface ISubscription extends Document {
  name: string;
  description: string;
  price: number;
  duration: number;
  durationUnit: "month" | "year";
  isActive: boolean;
  discount: number;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    durationUnit: {
      type: String,
      enum: ["month", "year"],
      default: "month",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export const Subscription = mongoose.model<ISubscription>(
  "Subscription",
  subscriptionSchema,
);
