import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { CalorieCalculator } from "../services/CalorieCalculator";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const {
        firstName,
        lastName,
        phoneNumber,
        password,
        age,
        weight,
        height,
        workoutFrequency,
        goal,
      } = req.body;

      if (!firstName || !lastName || !phoneNumber || !password) {
        return res
          .status(400)
          .json({ error: "Majburiy maydonlarni to'ldiring" });
      }

      const existingUser = await User.findOne({ phoneNumber });
      if (existingUser) {
        return res.status(400).json({
          error: "Bu telefon raqami bilan foydalanuvchi allaqachon mavjud",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = new User({
        firstName,
        lastName,
        phoneNumber,
        password: hashedPassword,
        age,
        weight,
        height,
        workoutFrequency,
        goal,
      });

      await user.save();

      const token = jwt.sign(
        { userId: user._id, phoneNumber: user.phoneNumber },
        JWT_SECRET,
        { expiresIn: "30d" },
      );

      const calorieResult = CalorieCalculator.calculate({
        age,
        weight,
        height,
        workoutFrequency,
        goal,
      });

      res.json({
        token,
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          age: user.age,
          weight: user.weight,
          height: user.height,
          workoutFrequency: user.workoutFrequency,
          goal: user.goal,
        },
        calorieTarget: calorieResult,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res
        .status(500)
        .json({ error: "Foydalanuvchini ro'yxatdan o'tkazishda xato" });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { phoneNumber, password } = req.body;

      if (!phoneNumber || !password) {
        return res
          .status(400)
          .json({ error: "Telefon raqami va parol talab qilinadi" });
      }

      const user = await User.findOne({ phoneNumber });
      if (!user || !user.password) {
        return res
          .status(401)
          .json({ error: "Telefon raqami yoki parol noto'g'ri" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res
          .status(401)
          .json({ error: "Telefon raqami yoki parol noto'g'ri" });
      }

      const token = jwt.sign(
        { userId: user._id, phoneNumber: user.phoneNumber },
        JWT_SECRET,
        { expiresIn: "30d" },
      );

      const calorieResult = CalorieCalculator.calculate({
        age: user.age,
        weight: user.weight,
        height: user.height,
        workoutFrequency: user.workoutFrequency,
        goal: user.goal,
      });

      res.json({
        token,
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          age: user.age,
          weight: user.weight,
          height: user.height,
          workoutFrequency: user.workoutFrequency,
          goal: user.goal,
        },
        calorieTarget: calorieResult,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Kirishda xato yuz berdi" });
    }
  }

  static async verifyToken(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ error: "Token talab qilinadi" });
      }

      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(404).json({ error: "Foydalanuvchi topilmadi" });
      }

      const calorieResult = CalorieCalculator.calculate({
        age: user.age,
        weight: user.weight,
        height: user.height,
        workoutFrequency: user.workoutFrequency,
        goal: user.goal,
      });

      res.json({
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          age: user.age,
          weight: user.weight,
          height: user.height,
          workoutFrequency: user.workoutFrequency,
          goal: user.goal,
        },
        calorieTarget: calorieResult,
      });
    } catch (error) {
      res.status(401).json({ error: "Token noto'g'ri yoki muddati tugagan" });
    }
  }
}
