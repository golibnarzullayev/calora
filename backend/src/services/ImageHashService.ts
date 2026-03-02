import imghash from "imghash";

export class ImageHashService {
  async getHash(imagePath: string): Promise<string> {
    return await imghash.hash(imagePath, 16, "hex");
  }
}
