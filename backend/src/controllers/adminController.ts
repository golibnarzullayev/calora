import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware.js";
import { User } from "../models/User.js";
import { Order } from "../models/Order.js";
import { PaymeState, PaymeTransaction } from "../models/PaymeTransaction.js";
import { UserSubscription } from "../models/UserSubscription.js";

// Middleware to check if user is admin
export const isAdminMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: any,
) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: "Admin huquqi kerak" });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: "Xato yuz berdi" });
  }
};

// Get all users
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const total = await User.countDocuments();

    const users = await User.find()
      .select("-password")
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Foydalanuvchilarni yuklashda xato" });
  }
};

// Toggle user admin status
export const toggleUserAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { isAdmin } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isAdmin },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({ error: "Foydalanuvchi topilmadi" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Xato yuz berdi" });
  }
};

// Delete user
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    // Don't allow deleting the requesting admin
    if (userId === req.user?.id) {
      return res.status(400).json({ error: "O'zingizni o'chira olmaysiz" });
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ error: "Foydalanuvchi topilmadi" });
    }

    // Also delete related data
    await Order.deleteMany({ userId });
    await UserSubscription.deleteMany({ userId });
    await PaymeTransaction.deleteMany({ userId });

    res.json({ message: "Foydalanuvchi o'chirildi" });
  } catch (error) {
    res.status(500).json({ error: "O'chirishda xato" });
  }
};

// Get all orders
export const getAllOrders = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const total = await Order.countDocuments();

    const orders = await Order.find()
      .populate("userId", "firstName lastName phoneNumber")
      .populate("subscriptionId", "name price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Buyurtmalarni yuklashda xato" });
  }
};

// Get admin statistics
export const getAdminStats = async (req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ isAdmin: true });
    const totalOrders = await Order.countDocuments();
    const paidOrders = await Order.countDocuments({ status: "paid" });
    const pendingOrders = await Order.countDocuments({ status: "pending" });
    const activeSubscriptions = await UserSubscription.countDocuments({
      isActive: true,
    });

    // Calculate revenue
    const paidOrdersData = await Order.find({ status: "paid" }).lean();
    const totalRevenue = paidOrdersData.reduce(
      (sum, order) => sum + order.amount,
      0,
    );

    // Calculate monthly revenue (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthlyOrdersData = await Order.find({
      status: "paid",
      createdAt: { $gte: thirtyDaysAgo },
    }).lean();
    const monthlyRevenue = monthlyOrdersData.reduce(
      (sum, order) => sum + order.amount,
      0,
    );

    res.json({
      totalUsers,
      adminUsers,
      totalOrders,
      paidOrders,
      pendingOrders,
      activeSubscriptions,
      totalRevenue,
      monthlyRevenue,
    });
  } catch (error) {
    res.status(500).json({ error: "Statistikani yuklashda xato" });
  }
};

// Get all payments
export const getAllPayments = async (req: AuthRequest, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const total = await PaymeTransaction.countDocuments({
      createdAt: { $gte: startDate },
    });

    const payments = await PaymeTransaction.find({
      createdAt: { $gte: startDate },
    })
      .populate({
        path: "orderId",
        select: "userId status",
        populate: {
          path: "userId",
          select: "firstName lastName phoneNumber",
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      data: payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "To'lovlarni yuklashda xato" });
  }
};
