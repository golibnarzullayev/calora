import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
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
    this.model = this.client.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.2,
        topK: 1,
        topP: 0.8,
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            isFood: { type: SchemaType.BOOLEAN },
            mealName: { type: SchemaType.STRING },
            calories: { type: SchemaType.NUMBER },
            protein: { type: SchemaType.NUMBER },
            carbs: { type: SchemaType.NUMBER },
            fat: { type: SchemaType.NUMBER },
            confidence: { type: SchemaType.NUMBER },
          },
          required: [
            "isFood",
            "mealName",
            "calories",
            "protein",
            "carbs",
            "fat",
            "confidence",
          ],
        },
      },
    });
  }

  async detectFoodFromImage(imagePath: string): Promise<FoodDetectionResult> {
    try {
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString("base64");
      const mimeType = this.getMimeType(imagePath);

      const prompt = `You are a PROFESSIONAL computer vision AI specialized in **food recognition and nutrition estimation**.

Your task is to analyze an image and determine whether it contains **real edible food** intended for human consumption.
If food is detected, identify the dish and estimate nutritional values.

---

STEP 1 — STRICT FOOD VALIDATION

First determine if the image clearly contains FOOD.

Return isFood=false if ANY of these are true:

* No visible food items
* Humans, selfies, faces, documents, screens
* Rooms, landscapes, objects, tools
* Supplements or pills
* Packaging without visible food
* Empty plates or tables
* Blurry or unclear images
* Drawings, icons, logos, AI art
* Fitness photos or gym scenes
* Kitchen tools without food
* Confidence below 0.7

IMPORTANT:
If you are uncertain → it is NOT food.

False positives are worse than false negatives.

---

STEP 2 — UZBEK DISH IDENTIFICATION

If the image contains food, identify the **most likely dish**.

If the food looks like Uzbek cuisine, choose the name ONLY from this list:

Osh
Palov
Manti
Lagman
Samsa
Somsa
Tandir gosht
Qozon kabob
Shashlik
Chuchvara
Dimlama
Mastava
Shurpa
Norin
Tandir non
Non
Achichuk
Sabzavot salati

IMPORTANT RULES:

* Do NOT invent dish names
* Do NOT use generic names
* Do NOT say: "ovqat", "taom", "goshtli lagan", "food plate"
* Choose the closest dish from the list
* If you cannot confidently classify → return isFood=false

Dish names MUST be written in **Uzbek Latin alphabet only**.

Never use Cyrillic or Russian.

---

STEP 3 — VISUAL IDENTIFICATION HINTS

Use visual clues to identify dishes:

Osh / Palov
Rice with carrot strips and meat pieces.

Manti
Steamed dumplings with folded dough.

Lagman
Long noodles with vegetables and meat sauce.

Samsa / Somsa
Triangular baked pastry with meat filling.

Tandir gosht
Large roasted meat pieces with crispy brown exterior.

Shashlik
Grilled meat pieces on skewers.

Qozon kabob
Large fried meat and potatoes cooked in a cauldron.

Shurpa
Soup with large meat chunks and vegetables.

Chuchvara
Small dumplings in soup.

Norin
Thin noodles mixed with horse meat.

Non / Tandir non
Round flat bread baked in a clay oven.

Achichuk
Fresh tomato and onion salad.

Sabzavot salati
Mixed vegetable salad.

---

STEP 4 — PORTION SIZE ESTIMATION

Estimate approximate portion weight.

Typical ranges:

Small portion: 200–300 g
Medium portion: 350–450 g
Large portion: 500–700 g

---

STEP 5 — NUTRITION ESTIMATION

Estimate total nutrition for the portion.

Return:

* calories (kcal)
* protein (grams)
* carbs (grams)
* fat (grams)

Use realistic ranges.

Be conservative with calorie estimates.

---

STEP 6 — RESPONSE FORMAT

You MUST return ONLY valid JSON.

No explanations.
No markdown.
No extra text.

If NOT food:

{
"isFood": false,
"mealName": "",
"calories": 0,
"protein": 0,
"carbs": 0,
"fat": 0,
"confidence": 0
}

If food detected:

{
"isFood": true,
"mealName": "uzbek_latin_dish_name",
"calories": number,
"protein": number,
"carbs": number,
"fat": number,
"confidence": number_between_0_and_1
}

---

STRICT OUTPUT RULES

Your response MUST:

* start with {
* end with }
* contain valid JSON
* contain no text outside JSON

If the dish cannot be identified with confidence → return isFood=false.`;

      const response = await this.model.generateContent([
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: base64Image,
                mimeType: mimeType,
              },
            },
            {
              text: prompt,
            },
          ],
        },
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
