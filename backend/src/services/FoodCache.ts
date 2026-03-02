// FoodCache.ts
import { redis } from "./Redis.js";
import { FoodDetectionResult } from "./GeminiService.js";

export class FoodCache {
  private prefix = "food_hash:";

  async get(hash: string): Promise<FoodDetectionResult | null> {
    const data = await redis.get(this.prefix + hash);

    if (!data) return null;

    return JSON.parse(data) as FoodDetectionResult;
  }

  async set(
    hash: string,
    result: FoodDetectionResult,
    ttlSeconds: number = 60 * 60 * 24 * 7, // 7 kun
  ): Promise<void> {
    await redis.set(
      this.prefix + hash,
      JSON.stringify(result),
      "EX",
      ttlSeconds,
    );
  }
}
