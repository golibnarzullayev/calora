import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserSubscription } from "../models/UserSubscription.js";
import base64 from "base-64";
import { User } from "../models/User.js";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    phoneNumber: string;
  };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Token topilmadi" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret",
    ) as any;
    req.user = {
      id: decoded.userId || decoded.id,
      phoneNumber: decoded.phoneNumber,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: "Token noto'g'ri" });
  }
};

export const subscriptionRequiredMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.params.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Foydalanuvchi ID topilmadi" });
    }

    const user = await User.findById(userId).select("isAdmin");
    if (!user) {
      return res.status(401).json({ error: "Foydalanuvchi topilmadi" });
    }

    if (user.isAdmin) return next();

    const activeSubscription = await UserSubscription.findOne({
      userId,
      isActive: true,
      endDate: { $gt: new Date() },
    });

    if (!activeSubscription) {
      return res.status(403).json({
        error: "Obuna sotib olish kerak. Iltimos, obuna rejasini tanlang.",
        requiresSubscription: true,
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: "Obuna tekshirishda xato" });
  }
};

export const checkPaymeToken = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const paymeKey = process.env.PAYME_MERCHANT_KEY;
  if (!paymeKey) {
    res.status(500).json({ error: "Payme merchant key topilmadi" });
    return;
  }

  if (!checkTokenOrFail(req, res, paymeKey)) {
    return;
  }

  next();
};

export const checkTokenOrFail = (
  req: Request,
  res: Response,
  merchantKey: string,
): boolean => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(200).json({
      jsonrpc: "2.0",
      id: req.body?.id || 0,
      error: {
        code: -32504,
        message: "Invalid authorization",
      },
    });
    return false;
  }

  const data = base64.decode(token);
  if (!data.includes(merchantKey)) {
    res.status(200).json({
      jsonrpc: "2.0",
      id: req.body?.id || 0,
      error: {
        code: -32504,
        message: "Invalid authorization",
      },
    });
    return false;
  }

  return true;
};
