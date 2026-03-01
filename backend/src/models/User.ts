import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  telegramId?: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  password?: string;
  age: number;
  weight: number;
  height: number;
  workoutFrequency: number;
  goal: "lose" | "maintain" | "gain";
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    telegramId: {
      type: String,
      sparse: true,
      index: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    password: {
      type: String,
    },
    age: {
      type: Number,
      required: true,
      min: 10,
      max: 120,
    },
    weight: {
      type: Number,
      required: true,
      min: 30,
      max: 300,
    },
    height: {
      type: Number,
      required: true,
      min: 100,
      max: 250,
    },
    workoutFrequency: {
      type: Number,
      required: true,
      min: 0,
      max: 7,
    },
    goal: {
      type: String,
      enum: ["lose", "maintain", "gain"],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const User = mongoose.model<IUser>("User", userSchema);
