import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { Order, OrderStatus, IOrder } from "../models/Order.js";
import { Subscription } from "../models/Subscription.js";
import {
  UserSubscription,
  IUserSubscription,
} from "../models/UserSubscription.js";

import base64 from "base-64";

dayjs.extend(utc);

class OrderService {
  private paymeCheckoutUrl = "https://checkout.paycom.uz";

  async createOrder(userId: string, subscriptionId: string): Promise<any> {
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      throw new Error("Subscription not found");
    }

    const expiresAt = dayjs().utc().add(12, "hour").toDate();

    const order = new Order({
      userId,
      subscriptionId,
      amount: subscription.price,
      paidPrice: subscription.price,
      status: OrderStatus.Pending,
      paymentMethod: "payme",
      expiresAt,
    });

    const savedOrder = await order.save();

    const paymeUrl = this.generatePaymeUrl(
      savedOrder._id.toString(),
      savedOrder.paidPrice,
    );

    const orderObj = savedOrder.toObject() as any;
    orderObj.paymeUrl = paymeUrl;

    return orderObj;
  }

  private generatePaymeUrl(orderId: string, amount: number): string {
    const merchantId = process.env.PAYME_MERCHANT_ID as string;
    const amountInTiyn = Math.floor(amount * 100);

    return `${this.paymeCheckoutUrl}/${base64.encode(
      `m=${merchantId};ac.order_id=${orderId};a=${amountInTiyn}`,
    )}`;
  }

  async getOrderById(id: string): Promise<IOrder | null> {
    return Order.findById(id).populate("subscriptionId").populate("userId");
  }

  async getOrderByTransactionId(transactionId: string): Promise<IOrder | null> {
    return Order.findOne({ transactionId })
      .populate("subscriptionId")
      .populate("userId");
  }

  async getUserOrders(userId: string): Promise<IOrder[]> {
    return Order.find({ userId })
      .populate("subscriptionId")
      .sort({ createdAt: -1 });
  }

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    transactionId?: string,
  ): Promise<IOrder | null> {
    const updateData: any = { status };

    if (status === OrderStatus.Completed) {
      updateData.performedAt = dayjs().utc().toDate();
    } else if (status === OrderStatus.Cancelled) {
      updateData.canceledAt = dayjs().utc().toDate();
    }

    if (transactionId) {
      updateData.transactionId = transactionId;
    }

    return Order.findByIdAndUpdate(orderId, updateData, { new: true });
  }

  async activateSubscription(orderId: string): Promise<IUserSubscription> {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status !== OrderStatus.Completed) {
      throw new Error("Order is not completed");
    }

    const subscription = await Subscription.findById(order.subscriptionId);
    if (!subscription) {
      throw new Error("Subscription not found");
    }

    const startDate = dayjs().utc().toDate();
    const endDate = dayjs(startDate)
      .utc()
      .add(subscription.duration, subscription.durationUnit as any)
      .toDate();

    const userSubscription = new UserSubscription({
      userId: order.userId,
      subscriptionId: order.subscriptionId,
      orderId: order._id,
      startDate,
      endDate,
      isActive: true,
      autoRenew: false,
    });

    return userSubscription.save();
  }

  async deactivateSubscription(userId: string): Promise<void> {
    await UserSubscription.updateMany(
      { userId, isActive: true },
      { isActive: false, updatedAt: dayjs().utc().toDate() },
    );
  }

  async cancelExpiredSubscriptions(): Promise<void> {
    const now = dayjs().utc().toDate();
    await UserSubscription.updateMany(
      { isActive: true, endDate: { $lt: now } },
      { isActive: false, updatedAt: now },
    );
  }

  async getRawOrderById(id: string): Promise<any> {
    return Order.findById(id).lean();
  }
}

export default OrderService;
