#!/usr/bin/env node

/**
 * PWA Icon Generator
 * Generates required PNG icons for PWA manifest
 *
 * Usage: node scripts/generate-pwa-icons.js
 *
 * Requires: npm install sharp
 */

import sharp from "sharp";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, "../public");

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// SVG template for icons
const createSVG = (size, maskable = false) => {
  const radius = maskable ? size * 0.25 : 0;
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#2563eb;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${radius}" fill="url(#grad)"/>
      <text x="${size / 2}" y="${size / 2}" font-size="${size * 0.4}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif">C</text>
    </svg>
  `;
};

// Screenshot SVG
const createScreenshot = () => {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 720">
      <defs>
        <linearGradient id="screenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f0f9ff;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e0f2fe;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="540" height="720" fill="url(#screenGrad)"/>
      <rect width="540" height="120" fill="#3b82f6"/>
      <text x="270" y="60" font-size="48" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif">Calora</text>
      <text x="270" y="200" font-size="32" fill="#1e40af" text-anchor="middle" font-family="Arial, sans-serif">Food Tracker</text>
      <circle cx="270" cy="400" r="80" fill="#3b82f6" opacity="0.1"/>
      <circle cx="270" cy="400" r="60" fill="#3b82f6" opacity="0.2"/>
      <circle cx="270" cy="400" r="40" fill="#3b82f6"/>
    </svg>
  `;
};

async function generateIcons() {
  try {
    console.log("🎨 Generating PWA icons...\n");

    // Generate 192x192 icon
    console.log("📦 Creating logo-192.png...");
    await sharp(Buffer.from(createSVG(192)))
      .png()
      .toFile(path.join(publicDir, "logo-192.png"));
    console.log("✓ logo-192.png created");

    // Generate 192x192 maskable icon
    console.log("📦 Creating logo-192-maskable.png...");
    await sharp(Buffer.from(createSVG(192, true)))
      .png()
      .toFile(path.join(publicDir, "logo-192-maskable.png"));
    console.log("✓ logo-192-maskable.png created");

    // Generate 512x512 icon
    console.log("📦 Creating logo-512.png...");
    await sharp(Buffer.from(createSVG(512)))
      .png()
      .toFile(path.join(publicDir, "logo-512.png"));
    console.log("✓ logo-512.png created");

    // Generate 512x512 maskable icon
    console.log("📦 Creating logo-512-maskable.png...");
    await sharp(Buffer.from(createSVG(512, true)))
      .png()
      .toFile(path.join(publicDir, "logo-512-maskable.png"));
    console.log("✓ logo-512-maskable.png created");

    // Generate screenshot
    console.log("📦 Creating screenshot-1.png...");
    await sharp(Buffer.from(createScreenshot()))
      .png()
      .toFile(path.join(publicDir, "screenshot-1.png"));
    console.log("✓ screenshot-1.png created");

    console.log("\n✅ All PWA icons generated successfully!");
    console.log("\nGenerated files:");
    console.log("  • logo-192.png");
    console.log("  • logo-192-maskable.png");
    console.log("  • logo-512.png");
    console.log("  • logo-512-maskable.png");
    console.log("  • screenshot-1.png");
  } catch (error) {
    console.error("❌ Error generating icons:", error);
    process.exit(1);
  }
}

generateIcons();
