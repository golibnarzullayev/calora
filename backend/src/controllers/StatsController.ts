import { Request, Response } from "express";
import { DailyStats } from "../models/DailyStats.js";
import { Weight } from "../models/Weight.js";
import { User } from "../models/User.js";

export class StatsController {
  static async getDailyStats(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { date } = req.query;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const statsDate = new Date(date as string);
      statsDate.setHours(0, 0, 0, 0);

      const nextDay = new Date(statsDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const stats = await DailyStats.findOne({
        userId: user._id,
        date: { $gte: statsDate, $lt: nextDay },
      });

      res.json({
        stats: stats || {
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFat: 0,
          mealCount: 0,
        },
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  }

  static async getWeeklyStats(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { startDate } = req.query;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const start = new Date(startDate as string);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);

      const stats = await DailyStats.find({
        userId: user._id,
        date: { $gte: start, $lt: end },
      }).sort({ date: 1 });

      res.json({ stats });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch weekly stats" });
    }
  }

  static async getMonthlyStats(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { year, month } = req.query;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const start = new Date(Number(year), Number(month) - 1, 1);
      const end = new Date(Number(year), Number(month), 1);

      const stats = await DailyStats.find({
        userId: user._id,
        date: { $gte: start, $lt: end },
      }).sort({ date: 1 });

      res.json({ stats });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch monthly stats" });
    }
  }

  static async recordWeight(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { weight, date } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const weightRecord = new Weight({
        userId: user._id,
        weight,
        date: new Date(date || new Date()),
      });

      await weightRecord.save();
      res.json({ weight: weightRecord.toObject() });
    } catch (error) {
      res.status(400).json({ error: "Failed to record weight" });
    }
  }

  static async getWeightProgress(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { days = 30 } = req.query;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Number(days));

      const weights = await Weight.find({
        userId: user._id,
        date: { $gte: startDate },
      }).sort({ date: 1 });

      res.json({ weights });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch weight progress" });
    }
  }
}
