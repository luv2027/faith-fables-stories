import sharp from "sharp";
import { mkdirSync } from "node:fs";

const SRC =
  process.argv[2] ||
  "/Users/atomicwork-12/Downloads/WhatsApp Image 2026-07-16 at 09.14.25.jpeg";

mkdirSync("public/brand", { recursive: true });

// Full lockup (optimized PNG) — for larger placements.
await sharp(SRC)
  .resize(1000, 1000, { fit: "inside" })
  .png()
  .toFile("public/brand/faith-fables-logo.png");

// Lotus mark: crop the top ~64% (lotus, above the wordmark) → centered square.
const meta = await sharp(SRC).metadata();
const width = meta.width ?? 1254;
const topHeight = Math.round(width * 0.64);
await sharp(SRC)
  .extract({ left: 0, top: 0, width, height: topHeight })
  .resize(512, 512, { fit: "cover", position: "top" })
  .png()
  .toFile("public/brand/faith-fables-mark.png");

// Favicon (Next serves app/icon.png automatically).
await sharp("public/brand/faith-fables-mark.png")
  .resize(256, 256)
  .png()
  .toFile("app/icon.png");

console.log("Generated: faith-fables-logo.png, faith-fables-mark.png, app/icon.png");
