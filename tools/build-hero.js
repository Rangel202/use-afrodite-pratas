/* Hero refeita: a peca aparece no maximo com 440 CSS px
   (clamp(300px, 32vw, 440px) no desktop; clamp(210px, 62vw, 400px)
   no celular). Logo 880px cobre ate DPR 2 em tela grande.        */

const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const ROOT = "C:/Users/user1/Desktop/UseAfroditePratas";
const SRC = path.join(ROOT, "assets/_originais",
  "use.afroditepratas_627675231_18053650727441960_3002184451451958966_n.jpg");
const OUT = path.join(ROOT, "assets/images");

const REGION = { x: 0.18, y: 0.02, w: 0.72, h: 0.96 };
const WIDTHS = [320, 440, 600, 880];
const RATIO = 3 / 4;

(async () => {
  const m = await sharp(SRC).metadata();
  const ext = {
    left: Math.round(m.width * REGION.x),
    top: Math.round(m.height * REGION.y),
    width: Math.round(m.width * REGION.w),
    height: Math.round(m.height * REGION.h),
  };

  // limpa as variantes antigas
  fs.readdirSync(OUT)
    .filter((f) => /^hero-lifestyle/.test(f))
    .forEach((f) => fs.unlinkSync(path.join(OUT, f)));

  for (const w of WIDTHS) {
    const buf = await sharp(SRC).rotate().extract(ext)
      .resize(w, Math.round(w / RATIO), { fit: "cover" })
      .webp({ quality: 68, effort: 6, smartSubsample: true })
      .toBuffer();
    fs.writeFileSync(path.join(OUT, `hero-lifestyle-${w}.webp`), buf);
    console.log(`  hero-lifestyle-${w}.webp  ${Math.round(buf.length / 1024)} KB`);
  }

  // fallback JPEG unico
  const jb = await sharp(SRC).rotate().extract(ext)
    .resize(600, 800, { fit: "cover" })
    .jpeg({ quality: 70, mozjpeg: true, progressive: true })
    .toBuffer();
  fs.writeFileSync(path.join(OUT, "hero-lifestyle-600.jpg"), jb);
  console.log(`  hero-lifestyle-600.jpg   ${Math.round(jb.length / 1024)} KB (fallback)`);
})().catch((e) => { console.error(e.message); process.exit(1); });
