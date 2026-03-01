import mongoose, { Schema, Document } from 'mongoose';

export interface IWeight extends Document {
  userId: mongoose.Types.ObjectId;
  weight: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const weightSchema = new Schema<IWeight>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    weight: {
      type: Number,
      required: true,
      min: 30,
      max: 300,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

weightSchema.index({ userId: 1, date: 1 });

export const Weight = mongoose.model<IWeight>('Weight', weightSchema);
