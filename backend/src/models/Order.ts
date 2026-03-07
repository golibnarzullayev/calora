import mongoose, { Schema, Document } from "mongoose";

export enum OrderStatus {
  Pending = "pending",
  Completed = "completed",
  Cancelled = "cancelled",
  Failed = "failed",
  Processing = "processing",
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  subscriptionId: mongoose.Types.ObjectId;
  amount: number;
  paidPrice: number;
  status: OrderStatus;
  paymentMethod: string;
  transactionId?: string;
  performedAt?: Date;
  canceledAt?: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: "Subscription",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paidPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Pending,
      index: true,
    },
    paymentMethod: {
      type: String,
      default: "payme",
    },
    transactionId: {
      type: String,
      sparse: true,
      index: true,
    },
    performedAt: {
      type: Date,
    },
    canceledAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

orderSchema.index({ userId: 1, status: 1 });
orderSchema.index({ userId: 1, createdAt: -1 });

export const Order = mongoose.model<IOrder>("Order", orderSchema);
