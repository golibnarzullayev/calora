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

const prompt = `You are a STRICT food detection and nutrition analysis AI.

Your FIRST task is classification, NOT description.

STEP 1 — FOOD VALIDATION (VERY STRICT):
Decide whether the image CLEARLY contains edible food intended for human consumption.

Return isFood = false if ANY of these are true:
- No visible food items
- Humans, faces, selfies, documents, screens, rooms, objects, landscapes
- Drinks without visible edible context
- Empty plates or tables
- Packaging only (without visible food)
- Blurry or unclear images
- AI-generated art, icons, logos, drawings
- Fitness photos, gym scenes, supplements, pills
- Kitchen tools without food
- Confidence below 0.6

IMPORTANT:
If you are unsure → IT IS NOT FOOD.

Only mark isFood=true when food is visually obvious.

STEP 2 — RESPONSE FORMAT

If this is NOT food, respond EXACTLY:

{
  "isFood": false,
  "mealName": "",
  "calories": 0,
  "protein": 0,
  "carbs": 0,
  "fat": 0,
  "confidence": 0
}

STEP 3 — IF FOOD IS CONFIRMED

Return JSON:

{
  "isFood": true,
  "mealName": "Uzbek name in LATIN script",
  "calories": estimated_calories_per_serving,
  "protein": estimated_protein_in_grams,
  "carbs": estimated_carbs_in_grams,
  "fat": estimated_fat_in_grams,
  "confidence": confidence_score_0_to_1
}

STRICT RULES:
- Only respond with VALID JSON
- NO explanations
- NO markdown
- NO extra text
- Be conservative with calories
- Confidence must reflect visual certainty
- If food is partially visible → reduce confidence
- If uncertain → return isFood=false

LANGUAGE RULES:
- mealName MUST be Uzbek Latin alphabet only
- NEVER use Cyrillic
- NEVER use Russian
- Translate international foods to Uzbek Latin

Examples:
"Osh", "Manti", "Lagman", "Samsa", "Qabob", "Shurpa"

REMEMBER:
False positives are WORSE than false negatives.
When in doubt → NOT FOOD.
`;

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
