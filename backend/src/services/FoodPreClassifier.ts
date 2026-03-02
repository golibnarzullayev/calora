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

    const tensor = tf.node.decodeImage(imageBuffer) as tf.Tensor3D;

    const predictions = await this.model.classify(tensor);

    tensor.dispose();

    // food related keywords
    const foodKeywords = [
      "food",
      "dish",
      "plate",
      "pizza",
      "burger",
      "meal",
      "spaghetti",
      "rice",
      "bread",
      "cake",
      "fruit",
      "vegetable",
    ];

    const score = predictions.find((p) =>
      foodKeywords.some((k) => p.className.toLowerCase().includes(k)),
    );

    return score ? score.probability > 0.4 : false;
  }
}
