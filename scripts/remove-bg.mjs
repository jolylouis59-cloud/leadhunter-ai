import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";

const input = readFileSync("public/ChatGPT_Image_10_juin_2026__18_19_57.png");

const { data, info } = await sharp(input)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

for (let i = 0; i < data.length; i += 4) {
  const r = data[i],
    g = data[i + 1],
    b = data[i + 2];
  if (r < 30 && g < 30 && b < 30) {
    data[i + 3] = 0;
  }
}

const output = await sharp(data, {
  raw: { width: info.width, height: info.height, channels: 4 },
})
  .png()
  .toBuffer();

writeFileSync("public/logo.png", output);
console.log("✅ Logo avec fond transparent sauvegardé dans public/logo.png");
