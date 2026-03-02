import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";

export class R2Service {
  private client: S3Client;
  private bucketName: string;
  private publicUrl: string;

  constructor() {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
    const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || "meals";
    const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;

    if (!accountId || !accessKeyId || !secretAccessKey || !publicUrl) {
      throw new Error("Missing Cloudflare R2 configuration");
    }

    this.bucketName = bucketName;
    this.publicUrl = publicUrl;

    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async uploadFile(filePath: string, key: string): Promise<string> {
    try {
      const fileContent = fs.readFileSync(filePath);
      const mimeType = this.getMimeType(filePath);

      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: fileContent,
          ContentType: mimeType,
        }),
      );

      const publicUrl = `${this.publicUrl}/${key}`;

      return publicUrl;
    } catch (error) {
      console.error("R2 upload error:", error);
      throw new Error("Failed to upload file to R2");
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );
    } catch (error) {
      throw new Error("Failed to delete file from R2");
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
    return mimeTypes[ext] || "application/octet-stream";
  }
}
