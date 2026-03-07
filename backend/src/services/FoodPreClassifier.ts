import * as tf from "@tensorflow/tfjs-node";
import * as mobilenet from "@tensorflow-models/mobilenet";
import fs from "fs";

export class FoodPreClassifier {
  private model!: mobilenet.MobileNet;

  async init() {
    this.model = await mobilenet.load({
      version: 2,
      alpha: 1.0,
    });
  }

  async isLikelyFood(imagePath: string): Promise<boolean> {
    const imageBuffer = fs.readFileSync(imagePath);

    const tensor = tf.node.decodeImage(imageBuffer, 3) as tf.Tensor3D;

    const predictions = await this.model.classify(tensor, 10);

    tensor.dispose();

    if (!predictions.length) return false;

    const top1 = predictions[0];

    // Agar model ancha ishonch bilan aytsa
    if (top1.probability > 0.3) {
      if (!this.matches(top1.className, BLACKLIST)) {
        return true;
      }
    }

    const score = this.calculateFoodScore(predictions);

    return score > 0.15;
  }

  private calculateFoodScore(
    predictions: Array<{ className: string; probability: number }>,
  ) {
    let score = 0;

    for (const p of predictions) {
      const name = p.className.toLowerCase();

      if (this.matches(name, BLACKLIST)) continue;

      if (this.matches(name, STRONG_KEYWORDS)) {
        score += p.probability * 1.2;
      } else if (this.matches(name, MEDIUM_KEYWORDS)) {
        score += p.probability * 0.7;
      } else if (this.matches(name, WEAK_KEYWORDS)) {
        score += p.probability * 0.4;
      }
    }

    return score;
  }

  private matches(className: string, keywords: string[]) {
    const parts = className
      .toLowerCase()
      .split(",")
      .map((p) => p.trim());

    return parts.some((part) =>
      keywords.some((keyword) => part.includes(keyword)),
    );
  }
}

const STRONG_KEYWORDS = [
  "pizza",
  "burger",
  "cheeseburger",
  "hotdog",
  "sandwich",
  "taco",
  "burrito",
  "shawarma",
  "kebab",
  "shashlik",
  "rice",
  "pilaf",
  "risotto",
  "paella",
  "fried rice",
  "pasta",
  "spaghetti",
  "noodle",
  "ramen",
  "udon",
  "steak",
  "meat",
  "beef",
  "lamb",
  "chicken",
  "turkey",
  "sausage",
  "meatball",
  "cutlet",
  "roast",
  "grill",
  "sushi",
  "dumpling",
  "omelet",
  "omelette",
  "soup",
  "stew",
  "curry",
  "chili",
  "hot pot",
  "hotpot",
  "salad",
  "potpie",
  "pie",
  "cake",
  "dessert",
  "cookie",
  "biscuit",
  "pudding",
  "ice cream",
  "chocolate",
  "fruit",
  "apple",
  "banana",
  "orange",
  "grape",
  "melon",
  "watermelon",
  "berry",
  "vegetable",
  "tomato",
  "cucumber",
  "carrot",
  "potato",
  "onion",
  "pepper",
  "eggplant",
  "corn",
  "lobster",
  "crab",
  "shrimp",
  "fish",
];

const MEDIUM_KEYWORDS = [
  "dish",
  "meal",
  "entree",
  "main course",
  "side dish",
  "plate",
  "bowl",
  "platter",
  "bread",
  "bun",
  "roll",
  "bagel",
  "baguette",
  "croissant",
  "pretzel",
  "muffin",
  "pancake",
  "waffle",
  "cooked",
  "fried",
  "baked",
  "grilled",
  "roasted",
  "broth",
  "porridge",
  "cereal",
];

const WEAK_KEYWORDS = [
  "table",
  "restaurant",
  "kitchen",
  "food",
  "dinner",
  "lunch",
];

const BLACKLIST = [
  "plate rack",
  "restaurant interior",
  "grocery store",
  "supermarket",
  "butcher shop",
  "kitchen utensil",
  "spoon",
  "fork",
  "knife",
  "pan",
  "pot",
];
