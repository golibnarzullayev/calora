import * as tf from "@tensorflow/tfjs-node";
import * as mobilenet from "@tensorflow-models/mobilenet";
import fs from "fs";

export class FoodPreClassifier {
  private model!: mobilenet.MobileNet;

  async init() {
    this.model = await mobilenet.load();
  }

  async isLikelyFood(imagePath: string): Promise<boolean> {
    const imageBuffer = fs.readFileSync(imagePath);

    const tensor = tf.node.decodeImage(imageBuffer, 3) as tf.Tensor3D;

    const predictions = await this.model.classify(tensor, 10);

    tensor.dispose();

    const score = this.calculateFoodScore(predictions);

    return score > 0.2;
  }

  private calculateFoodScore(
    predictions: Array<{ className: string; probability: number }>,
  ) {
    let score = 0;

    const FOOD_KEYWORDS = {
      strong: [
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
        "salad",
        "cake",
        "dessert",
        "cookie",
        "biscuit",
        "pie",
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
      ],

      medium: [
        "dish",
        "meal",
        "entree",
        "main course",
        "side dish",
        "plate",
        "bowl",
        "platter",
        "serving",
        "bread",
        "loaf",
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
      ],

      weak: [
        "kitchen",
        "restaurant",
        "cafeteria",
        "buffet",
        "dining table",
        "cutting board",
      ],
    };

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

    for (const p of predictions) {
      const name = p.className.toLowerCase();

      if (BLACKLIST.some((b) => name.includes(b))) continue;

      if (FOOD_KEYWORDS.strong.some((k) => name.includes(k))) {
        score += p.probability * 1.0;
      } else if (FOOD_KEYWORDS.medium.some((k) => name.includes(k))) {
        score += p.probability * 0.6;
      } else if (FOOD_KEYWORDS.weak.some((k) => name.includes(k))) {
        score += p.probability * 0.3;
      }
    }

    return score;
  }
}
