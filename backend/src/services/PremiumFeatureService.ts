import { UserSubscription } from "../models/UserSubscription.js";
import { Subscription } from "../models/Subscription.js";
import { Meal } from "../models/Meal.js";
import { DailyStats } from "../models/DailyStats.js";
import mongoose from "mongoose";

export enum PremiumFeature {
  DailyAnalysis = "Kunlik tahlil",
  FlowStatistics = "Oqim statistikasi",
  UnlimitedUploads = "Cheksiz rasm yuklash",
  AIRecommendations = "AI tavsiyalari",
  PrioritySupport = "Prioritet qo'llab-quvvatlash",
  MacroAnalysis = "Makro nutrient tahlili",
}

class PremiumFeatureService {
  /**
   * 0. Kunlik tahlil (Daily Analysis)
   * Provides daily calorie and nutrition analysis
   */
  async getDailyAnalysis(
    userId: string,
    date: Date,
  ): Promise<{
    hasAccess: boolean;
    data?: any;
    message?: string;
  }> {
    const hasPremium = await this.hasPremiumFeature(
      userId,
      PremiumFeature.DailyAnalysis,
    );

    if (!hasPremium) {
      return {
        hasAccess: false,
        message: "Kunlik tahlil uchun Premium obuna kerak",
      };
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const meals = await Meal.find({
      userId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    const totalCalories = meals.reduce(
      (sum, meal) => sum + (meal.aiResult?.calories || 0),
      0,
    );
    const totalProtein = meals.reduce(
      (sum, meal) => sum + (meal.macros?.protein || 0),
      0,
    );
    const totalCarbs = meals.reduce(
      (sum, meal) => sum + (meal.macros?.carbs || 0),
      0,
    );
    const totalFat = meals.reduce(
      (sum, meal) => sum + (meal.macros?.fat || 0),
      0,
    );

    return {
      hasAccess: true,
      data: {
        date,
        mealCount: meals.length,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
        meals: meals.map((m) => ({
          id: m._id,
          name: m.aiResult?.mealName,
          calories: m.aiResult?.calories,
          protein: m.macros?.protein,
          carbs: m.macros?.carbs,
          fat: m.macros?.fat,
        })),
      },
    };
  }

  /**
   * 1. Oqim statistikasi (Flow Statistics)
   * Provides weekly/monthly statistics and trends
   */
  async getFlowStatistics(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    hasAccess: boolean;
    data?: any;
    message?: string;
  }> {
    const hasPremium = await this.hasPremiumFeature(
      userId,
      PremiumFeature.FlowStatistics,
    );

    if (!hasPremium) {
      return {
        hasAccess: false,
        message: "Oqim statistikasi uchun Premium obuna kerak",
      };
    }

    const meals = await Meal.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    const dailyStats: Record<string, any> = {};

    meals.forEach((meal) => {
      const dateKey = meal.date.toISOString().split("T")[0];
      if (!dailyStats[dateKey]) {
        dailyStats[dateKey] = {
          date: dateKey,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          mealCount: 0,
        };
      }
      dailyStats[dateKey].calories += meal.aiResult?.calories || 0;
      dailyStats[dateKey].protein += meal.macros?.protein || 0;
      dailyStats[dateKey].carbs += meal.macros?.carbs || 0;
      dailyStats[dateKey].fat += meal.macros?.fat || 0;
      dailyStats[dateKey].mealCount += 1;
    });

    const stats = Object.values(dailyStats);
    const avgCalories =
      stats.length > 0
        ? stats.reduce((sum: number, s: any) => sum + s.calories, 0) /
          stats.length
        : 0;

    return {
      hasAccess: true,
      data: {
        period: { startDate, endDate },
        totalDays: stats.length,
        averageCalories: Math.round(avgCalories),
        dailyStats: stats,
        trend:
          stats.length > 1
            ? stats[stats.length - 1].calories > stats[0].calories
              ? "Ortib bormoqda"
              : "Kamayib bormoqda"
            : "Ma'lumot yetarli emas",
      },
    };
  }

  /**
   * 2. Cheksiz rasm yuklash (Unlimited Image Upload)
   * Allows unlimited meal image uploads
   */
  async checkUnlimitedUploadAccess(userId: string): Promise<{
    hasAccess: boolean;
    limit?: number | null;
    message?: string;
  }> {
    const hasPremium = await this.hasPremiumFeature(
      userId,
      PremiumFeature.UnlimitedUploads,
    );

    if (!hasPremium) {
      return {
        hasAccess: false,
        limit: 5,
        message:
          "Kuniga 5 ta rasm yuklashingiz mumkin. Cheksiz yuklash uchun Premium kerak",
      };
    }

    return {
      hasAccess: true,
      limit: null,
    };
  }

  /**
   * 3. AI tavsiyalari (AI Recommendations)
   * Provides AI-powered personalized nutrition recommendations
   */
  async getAIRecommendations(
    userId: string,
    days: number = 7,
  ): Promise<{
    hasAccess: boolean;
    data?: any;
    message?: string;
  }> {
    const hasPremium = await this.hasPremiumFeature(
      userId,
      PremiumFeature.AIRecommendations,
    );

    if (!hasPremium) {
      return {
        hasAccess: false,
        message: "AI tavsiyalari uchun Premium obuna kerak",
      };
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const meals = await Meal.find({
      userId,
      date: { $gte: startDate },
    });

    const avgCalories =
      meals.length > 0
        ? meals.reduce((sum, m) => sum + (m.aiResult?.calories || 0), 0) /
          meals.length
        : 0;
    const avgProtein =
      meals.length > 0
        ? meals.reduce((sum, m) => sum + (m.macros?.protein || 0), 0) /
          meals.length
        : 0;
    const avgCarbs =
      meals.length > 0
        ? meals.reduce((sum, m) => sum + (m.macros?.carbs || 0), 0) /
          meals.length
        : 0;
    const avgFat =
      meals.length > 0
        ? meals.reduce((sum, m) => sum + (m.macros?.fat || 0), 0) / meals.length
        : 0;

    const recommendations: string[] = [];

    if (avgCalories < 1500) {
      recommendations.push("Kuniga ko'proq kalori iste'mol qiling");
    } else if (avgCalories > 3000) {
      recommendations.push("Kuniga kamroq kalori iste'mol qiling");
    }

    if (avgProtein < 50) {
      recommendations.push("Protein miqdorini oshiring (go'sht, baliq, tuxum)");
    }

    if (avgCarbs > avgProtein * 3) {
      recommendations.push("Uglevod miqdorini kamayting");
    }

    if (avgFat > 80) {
      recommendations.push("Yog' miqdorini kamayting");
    }

    if (meals.length < 2) {
      recommendations.push("Kuniga kamida 3 ta ovqat iste'mol qiling");
    }

    return {
      hasAccess: true,
      data: {
        period: `Oxirgi ${days} kun`,
        averageNutrition: {
          calories: Math.round(avgCalories),
          protein: Math.round(avgProtein),
          carbs: Math.round(avgCarbs),
          fat: Math.round(avgFat),
        },
        recommendations:
          recommendations.length > 0
            ? recommendations
            : ["Siz yaxshi yo'lda borayotgan ko'rinasiz!"],
      },
    };
  }

  /**
   * 4. Prioritet qo'llab-quvvatlash (Priority Support)
   * Marks user as priority for support tickets
   */
  async getPrioritySupportStatus(userId: string): Promise<{
    hasAccess: boolean;
    priority?: string;
    message?: string;
  }> {
    const hasPremium = await this.hasPremiumFeature(
      userId,
      PremiumFeature.PrioritySupport,
    );

    if (!hasPremium) {
      return {
        hasAccess: false,
        priority: "normal",
        message: "Prioritet qo'llab-quvvatlash uchun Premium obuna kerak",
      };
    }

    return {
      hasAccess: true,
      priority: "high",
    };
  }

  /**
   * 5. Makro nutrient tahlili (Macro Nutrient Analysis)
   * Provides detailed macro nutrient breakdown and analysis
   */
  async getMacroAnalysis(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    hasAccess: boolean;
    data?: any;
    message?: string;
  }> {
    const hasPremium = await this.hasPremiumFeature(
      userId,
      PremiumFeature.MacroAnalysis,
    );

    if (!hasPremium) {
      return {
        hasAccess: false,
        message: "Makro nutrient tahlili uchun Premium obuna kerak",
      };
    }

    const meals = await Meal.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    });

    const totalProtein = meals.reduce(
      (sum, m) => sum + (m.macros?.protein || 0),
      0,
    );
    const totalCarbs = meals.reduce(
      (sum, m) => sum + (m.macros?.carbs || 0),
      0,
    );
    const totalFat = meals.reduce((sum, m) => sum + (m.macros?.fat || 0), 0);
    const totalCalories = meals.reduce(
      (sum, m) => sum + (m.aiResult?.calories || 0),
      0,
    );

    const proteinCalories = totalProtein * 4;
    const carbCalories = totalCarbs * 4;
    const fatCalories = totalFat * 9;

    const proteinPercent =
      totalCalories > 0 ? (proteinCalories / totalCalories) * 100 : 0;
    const carbPercent =
      totalCalories > 0 ? (carbCalories / totalCalories) * 100 : 0;
    const fatPercent =
      totalCalories > 0 ? (fatCalories / totalCalories) * 100 : 0;

    const idealProteinPercent = 30;
    const idealCarbPercent = 50;
    const idealFatPercent = 20;

    return {
      hasAccess: true,
      data: {
        period: { startDate, endDate },
        totalMacros: {
          protein: Math.round(totalProtein),
          carbs: Math.round(totalCarbs),
          fat: Math.round(totalFat),
          calories: Math.round(totalCalories),
        },
        macroPercentages: {
          protein: Math.round(proteinPercent),
          carbs: Math.round(carbPercent),
          fat: Math.round(fatPercent),
        },
        idealPercentages: {
          protein: idealProteinPercent,
          carbs: idealCarbPercent,
          fat: idealFatPercent,
        },
        analysis: {
          proteinStatus:
            proteinPercent < idealProteinPercent - 5
              ? "Kam"
              : proteinPercent > idealProteinPercent + 5
                ? "Ko'p"
                : "Optimal",
          carbStatus:
            carbPercent < idealCarbPercent - 5
              ? "Kam"
              : carbPercent > idealCarbPercent + 5
                ? "Ko'p"
                : "Optimal",
          fatStatus:
            fatPercent < idealFatPercent - 5
              ? "Kam"
              : fatPercent > idealFatPercent + 5
                ? "Ko'p"
                : "Optimal",
        },
      },
    };
  }

  /**
   * Helper method to check if user has a specific premium feature
   */
  private async hasPremiumFeature(
    userId: string,
    feature: PremiumFeature,
  ): Promise<boolean> {
    const userSubscription = await UserSubscription.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      isActive: true,
      endDate: { $gt: new Date() },
    }).populate("subscriptionId");

    if (!userSubscription) {
      return false;
    }

    const subscription = userSubscription.subscriptionId as any;
    return subscription.features?.includes(feature) || false;
  }

  /**
   * Get all premium features for a user
   */
  async getUserPremiumFeatures(userId: string): Promise<PremiumFeature[]> {
    const userSubscription = await UserSubscription.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      isActive: true,
      endDate: { $gt: new Date() },
    }).populate("subscriptionId");

    if (!userSubscription) {
      return [];
    }

    const subscription = userSubscription.subscriptionId as any;
    return subscription.features || [];
  }
}

export default new PremiumFeatureService();
