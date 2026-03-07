import mongoose, { Schema, Document } from "mongoose";

export enum PaymeState {
  Pending = 1,
  Paid = 2,
  CanceledFromPending = -1,
  CanceledFromPaid = -2,
}

export interface IPaymeTransaction extends Document {
  id: string;
  orderId: mongoose.Types.ObjectId;
  amount: number;
  state: PaymeState;
  reason?: number;
  create_time: number;
  perform_time?: number;
  cancel_time?: number;
  createdAt: Date;
  updatedAt: Date;
}

const paymeTransactionSchema = new Schema<IPaymeTransaction>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    state: {
      type: Number,
      enum: [
        PaymeState.Pending,
        PaymeState.Paid,
        PaymeState.CanceledFromPending,
        PaymeState.CanceledFromPaid,
      ],
      default: PaymeState.Pending,
      index: true,
    },
    reason: {
      type: Number,
    },
    create_time: {
      type: Number,
      required: true,
    },
    perform_time: {
      type: Number,
    },
    cancel_time: {
      type: Number,
    },
  },
  {
    timestamps: true,
  },
);

paymeTransactionSchema.index({ orderId: 1, state: 1 });

export const PaymeTransaction = mongoose.model<IPaymeTransaction>(
  "PaymeTransaction",
  paymeTransactionSchema,
);
