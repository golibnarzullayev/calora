import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

export interface FoodDetectionResult {
  isFood: boolean;
  mealName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: number;
}

export class GeminiService {
  private client: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = this.client.getGenerativeModel({ model: "gemini-2.5-flash" });
  }

  async detectFoodFromImage(imagePath: string): Promise<FoodDetectionResult> {
    try {
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString("base64");
      const mimeType = this.getMimeType(imagePath);

      const prompt = `You are a food detection and nutrition analysis AI. Analyze this image and provide a JSON response.

If this is NOT a food image, respond with:
{
  "isFood": false,
  "mealName": "",
  "calories": 0,
  "protein": 0,
  "carbs": 0,
  "fat": 0,
  "confidence": 0
}

If this IS a food image, respond with a JSON object containing:
{
  "isFood": true,
  "mealName": "Name of the meal/dish in Uzbek language",
  "calories": estimated_calories_per_serving,
  "protein": estimated_protein_in_grams,
  "carbs": estimated_carbs_in_grams,
  "fat": estimated_fat_in_grams,
  "confidence": confidence_score_0_to_1
}

IMPORTANT:
- Only respond with valid JSON, no other text
- Estimate portion size as a typical serving
- Confidence should be 0-1 (0.6 minimum for acceptance)
- Be conservative with calorie estimates
- MUST return mealName in Uzbek language using LATIN/ROMAN script (NOT Cyrillic)
- Use Latin alphabet for Uzbek: a, b, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, x, y, z
- If the dish is international, translate it to Uzbek in Latin script
- Examples: "Manti", "Shumlama", "Qabob", "Osh", "Lagman", "Samsa", "Shurpa"
- NEVER use Cyrillic characters (А, Б, В, Г, Д, etc.)
- NEVER use Russian language`;

      const response = await this.model.generateContent([
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
        prompt,
      ]);

      const text = response.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }

      const result = JSON.parse(jsonMatch[0]) as FoodDetectionResult;

      if (!result.isFood || result.confidence < 0.6) {
        return {
          isFood: false,
          mealName: "",
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          confidence: 0,
        };
      }

      return result;
    } catch (error) {
      console.error("Gemini service error:", error);
      throw new Error("Failed to analyze food image");
    }
  }

  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
    };
    return mimeTypes[ext] || "image/jpeg";
  }
}
