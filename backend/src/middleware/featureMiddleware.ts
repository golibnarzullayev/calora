import { Request, Response, NextFunction } from 'express';
import FeatureService from '../services/FeatureService.js';
import { SubscriptionFeature } from '../constants/features.js';
import { AuthRequest } from './authMiddleware.js';

export const requireFeature = (feature: SubscriptionFeature) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.userId || req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Foydalanuvchi ID topilmadi' });
      }

      const hasAccess = await FeatureService.hasFeature(userId, feature);

      if (!hasAccess) {
        return res.status(403).json({
          error: `Bu xususiyat uchun obuna kerak: ${feature}`,
          requiresSubscription: true,
          requiredFeature: feature,
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ error: 'Xususiyat tekshirishda xato' });
    }
  };
};

export const checkFeatureLimit = (feature: SubscriptionFeature) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.userId || req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Foydalanuvchi ID topilmadi' });
      }

      const limit = await FeatureService.getFeatureLimit(userId, feature);

      if (limit === null) {
        return res.status(403).json({
          error: `Bu xususiyat uchun obuna kerak: ${feature}`,
          requiresSubscription: true,
          requiredFeature: feature,
        });
      }

      (req as any).featureLimit = limit;
      next();
    } catch (error) {
      res.status(500).json({ error: 'Xususiyat tekshirishda xato' });
    }
  };
};
