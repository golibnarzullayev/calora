import { Request, Response } from "express";
import { User } from "../models/User.js";
import { CalorieCalculator } from "../services/CalorieCalculator.js";

export class UserController {
  static async createOrUpdateUser(req: Request, res: Response) {
    try {
      const {
        telegramId,
        firstName,
        lastName,
        phoneNumber,
        age,
        weight,
        height,
        workoutFrequency,
        goal,
      } = req.body;

      let user = await User.findOne({ telegramId });
      let userWithPhoneNumber = await User.findOne({ phoneNumber });

      if (user) {
        user.firstName = firstName;
        user.lastName = lastName;
        user.phoneNumber = phoneNumber;
        user.age = age;
        user.weight = weight;
        user.height = height;
        user.workoutFrequency = workoutFrequency;
        user.goal = goal;
        await user.save();
      } else if (!user && !userWithPhoneNumber) {
        user = new User({
          telegramId: telegramId,
          firstName,
          lastName,
          phoneNumber,
          age,
          weight,
          height,
          workoutFrequency,
          goal,
        });
        await user.save();
      } else if (!user && userWithPhoneNumber) {
        user = userWithPhoneNumber;
        user.telegramId = telegramId;
        await user.save();
      }

      const calorieResult = CalorieCalculator.calculate({
        age,
        weight,
        height,
        workoutFrequency,
        goal,
      });

      res.json({
        user: user?.toObject(),
        calorieTarget: calorieResult,
      });
    } catch (error) {
      res.status(400).json({ error: "Failed to create/update user" });
    }
  }

  static async getUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const calorieResult = CalorieCalculator.calculate({
        age: user.age,
        weight: user.weight,
        height: user.height,
        workoutFrequency: user.workoutFrequency,
        goal: user.goal,
      });

      res.json({
        user: user.toObject(),
        calorieTarget: calorieResult,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  }

  static async updateWeight(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { weight } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      user.weight = weight;
      await user.save();

      const calorieResult = CalorieCalculator.calculate({
        age: user.age,
        weight: user.weight,
        height: user.height,
        workoutFrequency: user.workoutFrequency,
        goal: user.goal,
      });

      res.json({
        user: user.toObject(),
        calorieTarget: calorieResult,
      });
    } catch (error) {
      res.status(400).json({ error: "Failed to update weight" });
    }
  }
}
