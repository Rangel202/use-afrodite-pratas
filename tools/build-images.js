/* Regera as imagens do site a partir dos ORIGINAIS.
   Saída: WebP em 4 larguras + 1 JPEG de fallback.           */

const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const ROOT = "C:/Users/user1/Desktop/UseAfroditePratas";
const ORIG = path.join(ROOT, "assets/_originais");
const OUT_P = path.join(ROOT, "assets/images/produtos");
const OUT_I = path.join(ROOT, "assets/images");

// larguras: cobrem 320px(DPR1-2) ate 900px(desktop retina)
const CARD_W = [320, 480, 640, 900];
const HERO_W = [400, 600, 820];

const P = (n) => path.join(ORIG, n);

/* produtos: [saida, origem, regiao opcional {x,y,w,h} em fracao] */
const PRODUTOS = [
  ["colar-olho-grego", "use.afroditepratas_627675231_18053650727441960_3002184451451958966_n.jpg"],
  ["anel-solitario", "use.afroditepratas_641694622_18559461850006328_627795524317197873_n.jpg"],
  ["colar-borboleta", "use.afroditepratas_619992893_18012970100817468_458639496625697373_n.jpg"],
  ["anel-inicial", "use.afroditepratas_623258301_18078028619198436_8226393018210273768_n.jpg"],
  ["conjunto-coracao", "use.afroditepratas_627385870_18015115697816076_9017889323904345030_n.jpg"],
  ["colar-malha", "use.afroditepratas_624724369_18107576062779367_7749813804667492152_n.jpg"],
  ["pulseiras-mix", "use.afroditepratas_623216029_18080690111210874_217184164612510054_n.jpg"],
  ["colares-medalhas", "use.afroditepratas_484638853_17898588576158955_2208550182410895120_n.jpg"],
  ["conjunto-esmeralda", "use.afroditepratas_599924102_17929560180158955_5378035572747190288_n.jpg"],
  ["pulseira-baby", "a94394d4-ad7e-4f18-8c4a-8fd2e888a636.jpg"],
  ["pulseira-nome", "cb359f6f-fe0c-49ff-9fd7-30e092641b73.jpg"],
  ["anel-esmeralda", "use.afroditepratas_601655847_17929560192158955_2754538314471651309_n.jpg"],
  ["brinco-coracao", "use.afroditepratas_627385870_18015115697816076_9017889323904345030_n.jpg",
    { x: 0.48, y: 0.28, w: 0.44, h: 0.44 }],
  ["anel-duplo", "41305c83-ced1-4f05-bfc2-70dbefc47e81.jpg",
    { x: 0.42, y: 0.52, w: 0.46, h: 0.26 }],
];

async function base(src, region) {
  let img = sharp(src, { failOn: "none" }).rotate(); // respeita EXIF
  if (region) {
    const m = await sharp(src).metadata();
    img = img.extract({
      left: Math.round(m.width * region.x),
      top: Math.round(m.height * region.y),
      width: Math.round(m.width * region.w),
      height: Math.round(m.height * region.h),
    });
  }
  return img;
}

async function emit(src, region, outDir, name, widths, ratio, qWebp, qJpeg) {
  let total = 0;
  const written = [];

  for (const w of widths) {
    const h = Math.round(w / ratio);
    const img = await base(src, region);
    const buf = await img
      .resize(w, h, { fit: "cover", position: "centre" })
      .webp({ quality: qWebp, effort: 6 })
      .toBuffer();
    const f = path.join(outDir, `${name}-${w}.webp`);
    fs.writeFileSync(f, buf);
    total += buf.length;
    written.push(`${name}-${w}.webp ${Math.round(buf.length / 1024)}KB`);
  }

  // um JPEG de fallback (navegadores sem WebP)
  const fw = widths[widths.length - 2] || widths[0];
  const img = await base(src, region);
  const buf = await img
    .resize(fw, Math.round(fw / ratio), { fit: "cover", position: "centre" })
    .jpeg({ quality: qJpeg, mozjpeg: true, progressive: true })
    .toBuffer();
  fs.writeFileSync(path.join(outDir, `${name}-${fw}.jpg`), buf);
  total += buf.length;
  written.push(`${name}-${fw}.jpg ${Math.round(buf.length / 1024)}KB`);

  return { total, written };
}

(async () => {
  let grand = 0;

  console.log("=== PRODUTOS (1:1) ===");
  for (const [name, file, region] of PRODUTOS) {
    const r = await emit(P(file), region, OUT_P, name, CARD_W, 1, 72, 74);
    grand += r.total;
    console.log(`  ${name.padEnd(20)} ${Math.round(r.total / 1024)}KB total`);
  }

  console.log("\n=== HERO (3:4) ===");
  const hero = await emit(
    P("use.afroditepratas_627675231_18053650727441960_3002184451451958966_n.jpg"),
    { x: 0.18, y: 0.02, w: 0.72, h: 0.96 },
    OUT_I, "hero-lifestyle", HERO_W, 3 / 4, 70, 72
  );
  grand += hero.total;
  hero.written.forEach((w) => console.log("  " + w));

  console.log("\n=== SOBRE (4:5) ===");
  const sobre = await emit(
    P("0fa81873-83e3-4244-aa27-2485f3412535.jpg"),
    { x: 0.13, y: 0.52, w: 0.74, h: 0.36 },
    OUT_I, "sobre-garantia", [400, 640, 900], 4 / 5, 72, 74
  );
  grand += sobre.total;
  sobre.written.forEach((w) => console.log("  " + w));

  console.log(`\nTOTAL GERADO: ${(grand / 1024 / 1024).toFixed(2)} MB`);
})().catch((e) => {
  console.error("ERRO:", e.message);
  process.exit(1);
});
