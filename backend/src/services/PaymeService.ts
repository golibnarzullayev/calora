import { isValidObjectId } from "mongoose";
import { Order, OrderStatus } from "../models/Order";
import { PaymeTransaction, PaymeState } from "../models/PaymeTransaction";
import { Subscription } from "../models/Subscription";
import { UserSubscription } from "../models/UserSubscription";

const TIMEOUT = 12 * 60 * 1000;

export const PaymeError = {
  OrderNotFound: { code: -31050, message: "Order not found" },
  Pending: { code: -31050, message: "Payment for the product is pending" },
  InvalidAmount: { code: -31001, message: "Invalid amount" },
  CantDoOperation: { code: -31008, message: "Cannot perform operation" },
  TransactionNotFound: { code: -31003, message: "Transaction not found" },
  AlreadyDone: { code: -31007, message: "Transaction already performed" },
};

class PaymeService {
  // CHECK PERFORM
  public checkPerformTransaction = async (params: any) => {
    const {
      amount: paymeAmount,
      account: { order_id: orderId },
    } = params;

    if (!isValidObjectId(orderId)) {
      return { error: PaymeError.OrderNotFound };
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return { error: PaymeError.OrderNotFound };
    }

    const amount = Math.floor(paymeAmount / 100);

    if (order.amount !== amount) {
      return { error: PaymeError.InvalidAmount };
    }

    if (order.status === OrderStatus.Completed) {
      return { error: PaymeError.AlreadyDone };
    }

    return { result: { allow: true } };
  };

  public createTransaction = async (params: any) => {
    const {
      id,
      time,
      amount: paymeAmount,
      account: { order_id: orderId },
    } = params;

    if (!isValidObjectId(orderId)) {
      return { error: PaymeError.OrderNotFound };
    }

    const amount = Math.floor(paymeAmount / 100);

    const order = await Order.findById(orderId);

    if (!order) {
      return { error: PaymeError.OrderNotFound };
    }

    if (order.amount !== amount) {
      return { error: PaymeError.InvalidAmount };
    }

    let transaction = await PaymeTransaction.findOne({ id });

    // idempotent
    if (transaction) {
      if (transaction.state === PaymeState.Paid) {
        return { error: PaymeError.AlreadyDone };
      }

      return {
        result: {
          create_time: transaction.create_time,
          transaction: transaction.id,
          state: transaction.state,
        },
      };
    }

    if (order.status === OrderStatus.Processing) {
      return { error: PaymeError.Pending };
    }

    await Order.updateOne({ _id: orderId }, { status: OrderStatus.Processing });

    transaction = await PaymeTransaction.create({
      id,
      orderId,
      amount,
      state: PaymeState.Pending,
      create_time: time,
    });

    return {
      result: {
        create_time: transaction.create_time,
        transaction: transaction.id,
        state: transaction.state,
      },
    };
  };

  // PERFORM TRANSACTION
  public performTransaction = async (params: any) => {
    const { id } = params;

    const transaction = await PaymeTransaction.findOne({ id });

    if (!transaction) {
      return { error: PaymeError.TransactionNotFound };
    }

    if (transaction.state === PaymeState.Paid) {
      return {
        result: {
          transaction: transaction.id,
          perform_time: transaction.perform_time,
          state: PaymeState.Paid,
        },
      };
    }

    const now = Date.now();

    if (transaction.state === PaymeState.Pending) {
      // TIMEOUT CHECK
      if (now - transaction.create_time > TIMEOUT) {
        await PaymeTransaction.updateOne(
          { _id: transaction._id },
          {
            state: PaymeState.CanceledFromPending,
            cancel_time: now,
            reason: 4,
          },
        );

        return { error: PaymeError.CantDoOperation };
      }
    }

    const order = await Order.findById(transaction.orderId);

    if (!order) return { error: PaymeError.OrderNotFound };

    // update transaction
    await PaymeTransaction.updateOne(
      { _id: transaction._id },
      {
        state: PaymeState.Paid,
        perform_time: now,
      },
    );

    // update order
    await Order.updateOne(
      { _id: transaction.orderId },
      {
        status: OrderStatus.Completed,
        performedAt: new Date(),
      },
    );

    // activate subscription
    const subscription = await Subscription.findById(order.subscriptionId);

    if (subscription) {
      const startDate = new Date();
      const endDate = new Date();

      if (subscription.durationUnit === "month") {
        endDate.setMonth(endDate.getMonth() + subscription.duration);
      } else if (subscription.durationUnit === "year") {
        endDate.setFullYear(endDate.getFullYear() + subscription.duration);
      }

      await UserSubscription.create({
        userId: order.userId,
        subscriptionId: order.subscriptionId,
        orderId: order._id,
        startDate,
        endDate,
        isActive: true,
        autoRenew: false,
      });
    }

    return {
      result: {
        transaction: transaction.id,
        perform_time: now,
        state: PaymeState.Paid,
      },
    };
  };

  // CHECK TRANSACTION
  public checkTransaction = async (params: any) => {
    const { id } = params;

    const transaction = await PaymeTransaction.findOne({ id });

    if (!transaction) {
      return { error: PaymeError.TransactionNotFound };
    }

    return {
      result: {
        create_time: transaction.create_time,
        transaction: id,
        state: transaction.state,
        perform_time: transaction.perform_time ?? 0,
        cancel_time: transaction.cancel_time ?? 0,
        reason: transaction.reason ?? null,
      },
    };
  };

  // CANCEL TRANSACTION
  public cancelTransaction = async (params: any) => {
    const { id, reason } = params;

    const transaction = await PaymeTransaction.findOne({ id });

    if (!transaction) {
      return { error: PaymeError.TransactionNotFound };
    }

    const now = Date.now();

    if (transaction.state === PaymeState.Pending) {
      await PaymeTransaction.updateOne(
        { _id: transaction._id },
        {
          state: PaymeState.CanceledFromPending,
          cancel_time: now,
          reason,
        },
      );

      await Order.updateOne(
        { _id: transaction.orderId },
        { status: OrderStatus.Cancelled },
      );
    }

    if (transaction.state === PaymeState.Paid) {
      await UserSubscription.updateOne(
        { orderId: transaction.orderId },
        {
          isActive: false,
          cancelledAt: new Date(),
        },
      );

      await PaymeTransaction.updateOne(
        { _id: transaction._id },
        {
          state: PaymeState.CanceledFromPaid,
          cancel_time: now,
          reason,
        },
      );

      await Order.updateOne(
        { _id: transaction.orderId },
        { status: OrderStatus.Cancelled },
      );
    }

    return {
      result: {
        transaction: transaction.id,
        cancel_time: now,
        state:
          transaction.state === PaymeState.Pending
            ? PaymeState.CanceledFromPending
            : PaymeState.CanceledFromPaid,
      },
    };
  };

  // GET STATEMENT
  public getStatement = async (params: any) => {
    const { from, to } = params;

    const transactions = await PaymeTransaction.find({
      create_time: { $gte: from, $lte: to },
    });

    return {
      result: {
        transactions: transactions.map((t) => ({
          id: t.id,
          time: t.create_time,
          amount: t.amount * 100,
          account: {
            order_id: t.orderId.toString(),
          },
          create_time: t.create_time,
          perform_time: t.perform_time ?? 0,
          cancel_time: t.cancel_time ?? 0,
          transaction: t.id,
          state: t.state,
          reason: t.reason ?? null,
        })),
      },
    };
  };
}

export default new PaymeService();
