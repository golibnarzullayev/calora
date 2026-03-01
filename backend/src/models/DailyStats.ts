import mongoose, { Schema, Document } from 'mongoose';

export interface IDailyStats extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  mealCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const dailyStatsSchema = new Schema<IDailyStats>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    totalCalories: {
      type: Number,
      default: 0,
    },
    totalProtein: {
      type: Number,
      default: 0,
    },
    totalCarbs: {
      type: Number,
      default: 0,
    },
    totalFat: {
      type: Number,
      default: 0,
    },
    mealCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

dailyStatsSchema.index({ userId: 1, date: 1 }, { unique: true });

export const DailyStats = mongoose.model<IDailyStats>('DailyStats', dailyStatsSchema);
