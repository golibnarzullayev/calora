import { Request, Response } from "express";
import premiumFeatureService from "../services/PremiumFeatureService.js";

class PremiumController {
  // 0. Daily Analysis
  async getDailyAnalysis(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { date } = req.query;

      const analysisDate = date ? new Date(date as string) : new Date();

      const result = await premiumFeatureService.getDailyAnalysis(
        userId,
        analysisDate,
      );

      if (!result.hasAccess) {
        return res.status(403).json({
          error: result.message,
        });
      }

      res.json({
        data: result.data,
        message: "Kunlik tahlil muvaffaqiyatli olindi",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Xato yuz berdi";
      res.status(500).json({ error: errorMessage });
    }
  }

  // 1. Flow Statistics
  async getFlowStatistics(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { startDate, endDate } = req.query;

      const start = startDate
        ? new Date(startDate as string)
        : (() => {
            const d = new Date();
            d.setDate(d.getDate() - 7);
            return d;
          })();

      const end = endDate ? new Date(endDate as string) : new Date();

      const result = await premiumFeatureService.getFlowStatistics(
        userId,
        start,
        end,
      );

      if (!result.hasAccess) {
        return res.status(403).json({
          error: result.message,
        });
      }

      res.json({
        data: result.data,
        message: "Oqim statistikasi muvaffaqiyatli olindi",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Xato yuz berdi";
      res.status(500).json({ error: errorMessage });
    }
  }

  // 2. Unlimited Upload Access
  async checkUnlimitedUploadAccess(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const result = await premiumFeatureService.checkUnlimitedUploadAccess(
        userId,
      );

      res.json({
        data: {
          hasAccess: result.hasAccess,
          limit: result.limit,
        },
        message: result.message,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Xato yuz berdi";
      res.status(500).json({ error: errorMessage });
    }
  }

  // 3. AI Recommendations
  async getAIRecommendations(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { days } = req.query;

      const daysCount = days ? parseInt(days as string) : 7;

      const result = await premiumFeatureService.getAIRecommendations(
        userId,
        daysCount,
      );

      if (!result.hasAccess) {
        return res.status(403).json({
          error: result.message,
        });
      }

      res.json({
        data: result.data,
        message: "AI tavsiyalari muvaffaqiyatli olindi",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Xato yuz berdi";
      res.status(500).json({ error: errorMessage });
    }
  }

  // 4. Priority Support Status
  async getPrioritySupportStatus(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const result = await premiumFeatureService.getPrioritySupportStatus(
        userId,
      );

      res.json({
        data: {
          hasAccess: result.hasAccess,
          priority: result.priority,
        },
        message: result.message,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Xato yuz berdi";
      res.status(500).json({ error: errorMessage });
    }
  }

  // 5. Macro Nutrient Analysis
  async getMacroAnalysis(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { startDate, endDate } = req.query;

      const start = startDate
        ? new Date(startDate as string)
        : (() => {
            const d = new Date();
            d.setDate(d.getDate() - 7);
            return d;
          })();

      const end = endDate ? new Date(endDate as string) : new Date();

      const result = await premiumFeatureService.getMacroAnalysis(
        userId,
        start,
        end,
      );

      if (!result.hasAccess) {
        return res.status(403).json({
          error: result.message,
        });
      }

      res.json({
        data: result.data,
        message: "Makro nutrient tahlili muvaffaqiyatli olindi",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Xato yuz berdi";
      res.status(500).json({ error: errorMessage });
    }
  }

  // Get all user premium features
  async getUserPremiumFeatures(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const features =
        await premiumFeatureService.getUserPremiumFeatures(userId);

      res.json({
        data: features,
        message: "Premium xususiyatlar muvaffaqiyatli olindi",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Xato yuz berdi";
      res.status(500).json({ error: errorMessage });
    }
  }
}

export default new PremiumController();
