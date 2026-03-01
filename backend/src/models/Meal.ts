import mongoose, { Schema, Document } from 'mongoose';

export interface IAIResult {
  isFood: boolean;
  mealName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: number;
}

export interface IMeal extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  imageUrl: string;
  aiResult: IAIResult;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const mealSchema = new Schema<IMeal>(
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
    imageUrl: {
      type: String,
      required: true,
    },
    aiResult: {
      isFood: Boolean,
      mealName: String,
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
      confidence: Number,
    },
    macros: {
      protein: Number,
      carbs: Number,
      fat: Number,
    },
  },
  {
    timestamps: true,
  }
);

mealSchema.index({ userId: 1, date: 1 });

export const Meal = mongoose.model<IMeal>('Meal', mealSchema);
