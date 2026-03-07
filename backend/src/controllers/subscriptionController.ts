import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware.js";
import SubscriptionService from "../services/SubscriptionService.js";
import OrderService from "../services/OrderService.js";
import FeatureService from "../services/FeatureService.js";

const subscriptionService = new SubscriptionService();
const orderService = new OrderService();

export const getAllSubscriptions = async (req: any, res: Response) => {
  try {
    const subscriptions = await subscriptionService.getAllSubscriptions();
    res.json(subscriptions ?? []);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch subscriptions" });
  }
};

export const getSubscriptionById = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const subscription = await subscriptionService.getSubscriptionById(id);
    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch subscription" });
  }
};

export const createSubscription = async (req: any, res: Response) => {
  try {
    const subscription = await subscriptionService.createSubscription(req.body);
    res.status(201).json(subscription);
  } catch (error) {
    res.status(400).json({ error: "Failed to create subscription" });
  }
};

export const updateSubscription = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const subscription = await subscriptionService.updateSubscription(
      id,
      req.body,
    );
    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }
    res.json(subscription);
  } catch (error) {
    res.status(400).json({ error: "Failed to update subscription" });
  }
};

export const deleteSubscription = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const success = await subscriptionService.deleteSubscription(id);
    if (!success) {
      return res.status(404).json({ error: "Subscription not found" });
    }
    res.json({ message: "Subscription deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete subscription" });
  }
};

export const getUserActiveSubscription = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const subscription =
      await subscriptionService.getUserActiveSubscription(userId);
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user subscription" });
  }
};

export const getUserSubscriptionHistory = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const history =
      await subscriptionService.getUserSubscriptionHistory(userId);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch subscription history" });
  }
};

export const hasActiveSubscription = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const hasActive = await subscriptionService.hasActiveSubscription(userId);
    res.json({ hasActive });
  } catch (error) {
    res.status(500).json({ error: "Failed to check subscription status" });
  }
};

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { subscriptionId } = req.body;
    if (!subscriptionId) {
      return res.status(400).json({ error: "Subscription ID is required" });
    }

    const order = await orderService.createOrder(userId, subscriptionId);
    res.status(201).json(order);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to create order" });
  }
};

export const getOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderById(id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const userId = req.user?.id;
    if (order.userId.toString() !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch order" });
  }
};

export const getUserOrders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const orders = await orderService.getUserOrders(userId);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user orders" });
  }
};

export const getUserFeatures = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userFeatures = await FeatureService.getAllUserFeatures(userId);
    res.json(userFeatures);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user features" });
  }
};
