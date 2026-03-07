import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { Subscription, ISubscription } from "../models/Subscription.js";
import {
  UserSubscription,
  IUserSubscription,
} from "../models/UserSubscription.js";

dayjs.extend(utc);

class SubscriptionService {
  async getAllSubscriptions(): Promise<ISubscription[]> {
    return Subscription.find({ isActive: true }).sort({ price: 1 });
  }

  async getSubscriptionById(id: string): Promise<ISubscription | null> {
    return Subscription.findById(id);
  }

  async createSubscription(
    data: Partial<ISubscription>,
  ): Promise<ISubscription> {
    const subscription = new Subscription(data);
    return subscription.save();
  }

  async updateSubscription(
    id: string,
    data: Partial<ISubscription>,
  ): Promise<ISubscription | null> {
    return Subscription.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteSubscription(id: string): Promise<boolean> {
    const result = await Subscription.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    );
    return !!result;
  }

  async getUserActiveSubscription(
    userId: string,
  ): Promise<IUserSubscription | null> {
    return UserSubscription.findOne({
      userId,
      isActive: true,
      endDate: { $gt: new Date() },
    })
      .populate("subscriptionId")
      .populate("orderId");
  }

  async getUserSubscriptionHistory(
    userId: string,
  ): Promise<IUserSubscription[]> {
    return UserSubscription.find({ userId })
      .populate("subscriptionId")
      .populate("orderId")
      .sort({ createdAt: -1 });
  }

  async hasActiveSubscription(userId: string): Promise<boolean> {
    const subscription = await UserSubscription.findOne({
      userId,
      isActive: true,
      endDate: { $gt: new Date() },
    });
    return !!subscription;
  }

  async getSubscriptionExpiryDate(userId: string): Promise<Date | null> {
    const subscription = await UserSubscription.findOne({
      userId,
      isActive: true,
    }).sort({ endDate: -1 });
    return subscription?.endDate || null;
  }
}

export default SubscriptionService;
