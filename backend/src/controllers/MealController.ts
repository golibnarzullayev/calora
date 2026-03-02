import { Request, Response } from "express";
import { Meal } from "../models/Meal.js";
import { DailyStats } from "../models/DailyStats.js";
import { User } from "../models/User.js";
import { GeminiService } from "../services/GeminiService.js";
import { R2Service } from "../services/R2Service.js";
import mongoose from "mongoose";
import { FoodPreClassifier } from "../services/FoodPreClassifier.js";
import { FoodCache } from "../services/FoodCache.js";
import { ImageHashService } from "../services/ImageHashService.js";
import fs from "fs";

export class MealController {
  static async uploadMeal(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { date } = req.body;

      if (!req.file) {
        return res.status(400).json({ error: "No image provided" });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const r2Service = new R2Service();
      const fileName = `meals/${user._id}/${Date.now()}-${req.file.originalname}`;
      const imageUrl = await r2Service.uploadFile(req.file.path, fileName);

      const cache = new FoodCache();
      const hashService = new ImageHashService();
      const hash = await hashService.getHash(req.file.path);

      const cached = await cache.get(hash);
      if (cached) {
        const mealDate = new Date(date || new Date());
        mealDate.setHours(0, 0, 0, 0);

        const meal = new Meal({
          userId: user._id,
          date: mealDate,
          imageUrl: imageUrl,
          aiResult: cached,
          macros: {
            protein: cached.protein,
            carbs: cached.carbs,
            fat: cached.fat,
          },
        });

        await meal.save();

        fs.unlinkSync(req.file.path);

        return res.json({
          data: { meal: meal.toObject() },
          message: "Meal added successfully",
        });
      }

      const preClassifier = new FoodPreClassifier();
      await preClassifier.init();

      const isFoodCandidate = await preClassifier.isLikelyFood(req.file.path);

      if (!isFoodCandidate) {
        return res.status(400).json({
          error:
            "Bu rasm ovqatga o'xshamaydi. Iltimos, ovqat rasmini yuklang. (Model)",
          isFood: false,
        });
      }

      const geminiService = new GeminiService(process.env.GEMINI_API_KEY || "");
      const aiResult = await geminiService.detectFoodFromImage(req.file.path);

      if (!aiResult.isFood) {
        return res.status(400).json({
          error:
            "Bu rasm ovqatga o'xshamaydi. Iltimos, ovqat rasmini yuklang. (Gemini)",
          isFood: false,
        });
      }

      await cache.set(hash, aiResult);

      const mealDate = new Date(date || new Date());
      mealDate.setHours(0, 0, 0, 0);

      const meal = new Meal({
        userId: user._id,
        date: mealDate,
        imageUrl: imageUrl,
        aiResult: aiResult,
        macros: {
          protein: aiResult.protein,
          carbs: aiResult.carbs,
          fat: aiResult.fat,
        },
      });

      await meal.save();

      await MealController.updateDailyStats(
        user._id as mongoose.Types.ObjectId,
        mealDate,
      );

      fs.unlinkSync(req.file.path);

      res.json({
        data: { meal: meal.toObject() },
        message: "Meal added successfully",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload meal";
      res.status(500).json({ error: errorMessage });
    }
  }

  static async getTodayMeals(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const meals = await Meal.find({
        userId: user._id,
        date: { $gte: today, $lt: tomorrow },
      }).sort({ createdAt: -1 });

      res.json({ meals });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch meals" });
    }
  }

  static async getMealsByDate(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { date } = req.query;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const mealDate = new Date(date as string);
      mealDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(mealDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const meals = await Meal.find({
        userId: user._id,
        date: { $gte: mealDate, $lt: nextDay },
      }).sort({ createdAt: -1 });

      res.json({ meals });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch meals" });
    }
  }

  static async deleteMeal(req: Request, res: Response) {
    try {
      const { mealId } = req.params;
      const meal = await Meal.findByIdAndDelete(mealId);

      if (!meal) {
        return res.status(404).json({ error: "Meal not found" });
      }

      // Delete image from R2
      if (meal.imageUrl) {
        try {
          const r2Service = new R2Service();
          // Extract file key from R2 URL
          const urlParts = meal.imageUrl.split("/");
          const fileName = urlParts.slice(-3).join("/"); // Get meals/{userId}/{filename}
          await r2Service.deleteFile(fileName);
        } catch (r2Error) {
          // Log error but don't fail the meal deletion
          console.error("Failed to delete image from R2:", r2Error);
        }
      }

      await MealController.updateDailyStats(
        meal.userId as mongoose.Types.ObjectId,
        meal.createdAt,
      );

      res.json({ message: "Meal deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete meal" });
    }
  }

  private static async updateDailyStats(
    userId: mongoose.Types.ObjectId,
    date: Date,
  ): Promise<void> {
    const mealDate = new Date(date);
    mealDate.setHours(0, 0, 0, 0);

    const meals = await Meal.find({
      userId,
      date: {
        $gte: mealDate,
        $lt: new Date(mealDate.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    const totalCalories = meals.reduce(
      (sum, meal) => sum + meal.aiResult.calories,
      0,
    );
    const totalProtein = meals.reduce(
      (sum, meal) => sum + meal.aiResult.protein,
      0,
    );
    const totalCarbs = meals.reduce(
      (sum, meal) => sum + meal.aiResult.carbs,
      0,
    );
    const totalFat = meals.reduce((sum, meal) => sum + meal.aiResult.fat, 0);

    await DailyStats.findOneAndUpdate(
      { userId, date: mealDate },
      {
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
        mealCount: meals.length,
      },
      { upsert: true, new: true },
    );
  }
}
