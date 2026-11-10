// Generátor prezentace „Jak nechat peníze pracovat“ (pptxgenjs).
// Spuštění:  cd prezentace && npm run build   (NODE_PATH kvůli apply_theme.js ze skillu pptx)
// Čísla se berou z ../docs/data (stejný zdroj jako webové kalkulačky).
// Ilustrace: Microsoft Fluent Emoji (MIT), ilustrace/svg/LICENSE.

const path = require("path");
const fs = require("fs");
const pptxgen = require("pptxgenjs");
const sharp = require("sharp");
const QRCode = require("qrcode");

const APPLY_THEME = path.join(
  process.env.HOME,
  ".claude/skills/synced/65686e4d-ee1f-470d-b27e-177b89c5bb66_92bb5caf-127e-4ba8-b000-b1431ca69b82/pptx/scripts/apply_theme.js",
);
const { applyTheme } = require(APPLY_THEME);

const VYSTUP = path.join(__dirname, "jak-nechat-penize-pracovat.pptx");
const DATA = path.join(__dirname, "..", "docs", "data");
const ILUSTRACE = path.join(__dirname, "ilustrace", "svg");
const WEB = "https://tomasmichal.github.io/kalkulacky/";

/* ---------- Téma ---------- */

const THEME = {
  name: "Jak nechat peníze pracovat",
  // Avenir Next je na každém Macu a má česká písmena (Arial Rounded MT Bold je nemá)
  headFontFace: "Avenir Next",
  bodyFontFace: "Avenir Next",
  colors: {
    dk1: "1D1B18",     // text
    lt1: "FFFFFF",     // karty
    dk2: "16325C",     // tmavě modrá (titulní a přechodové slajdy)
    lt2: "F7F2EA",     // teplé pozadí obsahových slajdů (stejné jako web)
    accent1: "2A78D6", // akcie / ETF
    accent2: "EB6834", // fond / poplatky / krátkodobá spekulace
    accent3: "1BAF7A", // spořák
    accent4: "F5B83D", // mince / zlato
    accent5: "6250D6",
    accent6: "D64545", // ztráta
    hlink: "1C5CAB",
    folHlink: "6250D6",
  },
};
const HEX = THEME.colors;

/* ---------- Pomocné funkce ---------- */

const cele = new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 0 });
const jednoDes = new Intl.NumberFormat("cs-CZ", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const NB = " ";
const milKc = (x) => `${jednoDes.format(x / 1e6)}${NB}mil.${NB}Kč`;

/** Budoucí hodnota pravidelných měsíčních vkladů (vklad na konci měsíce), stejně jako web. */
function budouciHodnota(mesicne, roky, rocniVynos, jednorazove = 0) {
  const m = Math.pow(1 + rocniVynos, 1 / 12) - 1;
  let h = jednorazove;
  for (let i = 0; i < roky * 12; i++) h = h * (1 + m) + mesicne;
  return h;
}

const cacheIlustraci = new Map();
/** Fluent Emoji SVG → PNG (base64 pro addImage). */
async function ilustrace(nazev) {
  if (!cacheIlustraci.has(nazev)) {
    const png = await sharp(path.join(ILUSTRACE, `${nazev}_color.svg`), { density: 300 })
      .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png().toBuffer();
    cacheIlustraci.set(nazev, "image/png;base64," + png.toString("base64"));
  }
  return cacheIlustraci.get(nazev);
}

async function qr(url) {
  const dataUrl = await QRCode.toDataURL(url, {
    margin: 1, width: 600, errorCorrectionLevel: "M",
    color: { dark: `#${HEX.dk1}`, light: "#FFFFFF" },
  });
  return dataUrl.replace(/^data:/, "");
}

const stin = () => ({ type: "outer", color: "000000", opacity: 0.1, blur: 10, offset: 2, angle: 90 });

/** Stručné poznámky pro řečníka v bodech. */
const body = (...radky) => radky.map((r) => `• ${r}`).join("\n");

/* ---------- Prezentace a layouty ---------- */

async function main() {
  const ztrata = JSON.parse(fs.readFileSync(path.join(DATA, "ztrata.json"), "utf8"));

  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE"; // 13,333 × 7,5 in
  pres.title = "Jak nechat peníze pracovat";
  pres.subject = "Dlouhodobé investování do akcií pro rodinu";
  pres.author = "Tomas Michal";
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  const C = pres.SchemeColor;

  /** Pastelová karta: barva tématu přes bílý podklad. */
  function karta(s, { x, y, w, h, barva, nazev }) {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y, w, h, rectRadius: 0.25, fill: { color: C.background1 }, line: { type: "none" }, shadow: stin(), objectName: `${nazev} podklad`,
    });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y, w, h, rectRadius: 0.25, fill: { color: barva, transparency: 86 }, line: { type: "none" }, objectName: nazev,
    });
  }

  /** Komiksová bublina s textem. */
  function bublina(s, text, { x, y, w, h, barva = C.accent4, otoceni = -3, velikost = 18 }) {
    s.addText(text, {
      shape: pres.shapes.ROUNDED_RECTANGULAR_CALLOUT, x, y, w, h, rotate: otoceni,
      fill: { color: barva }, line: { type: "none" }, fontSize: velikost, bold: true, color: C.text1,
      align: "center", valign: "middle", margin: 0.08, objectName: `Bublina: ${text}`,
    });
  }

  pres.defineSlideMaster({
    title: "TITUL",
    background: { color: C.text2 },
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: 0.8, y: 1.75, w: 7.2, h: 2.3, fontFace: THEME.headFontFace, fontSize: 54, bold: true, color: C.background1, align: "left", valign: "bottom", margin: 0 }, text: "" } },
      { placeholder: { options: { name: "body", type: "body", x: 0.8, y: 4.25, w: 7.4, h: 1.1, fontSize: 22, color: C.background2, valign: "top", margin: 0 }, text: "" } },
    ],
  });

  pres.defineSlideMaster({
    title: "OBSAH",
    background: { color: C.background2 },
    objects: [
      { text: { text: "Jak nechat peníze pracovat", options: { x: 0.6, y: 6.98, w: 6, h: 0.3, fontSize: 10, color: C.text2, margin: 0 } } },
      { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 0.4, w: 12.1, h: 0.95, fontFace: THEME.headFontFace, fontSize: 36, bold: true, color: C.text1, align: "left", valign: "middle", margin: 0 }, text: "" } },
    ],
    slideNumber: { x: 12.2, y: 6.98, w: 0.5, h: 0.3, fontSize: 10, color: C.text2, align: "right" },
  });

  /* ----- 1. Titulní slajd ----- */
  pres.addSection({ title: "Úvod" });
  {
    const s = pres.addSlide({ masterName: "TITUL", sectionTitle: "Úvod" });
    s.addText("Jak nechat peníze pracovat", { placeholder: "title" });
    s.addText("Proč dlouhodobé investování do akcií není hazard", { placeholder: "body" });
    s.addText("Rodinné povídání · 26. listopadu 2026", {
      x: 0.8, y: 5.65, w: 7, h: 0.4, fontSize: 16, color: C.background2, margin: 0, isTextBox: true,
    });

    // Ilustrace: sloupky mincí rostou čím dál rychleji a z nejvyššího vyrůstá rostlinka
    const sloupky = [1, 2, 3, 5, 8, 13];
    const sirkaMince = 0.62, vyskaMince = 0.17, mezera = 0.2, zaklad = 6.15, x0 = 8.35;
    sloupky.forEach((pocet, i) => {
      const x = x0 + i * (sirkaMince + mezera);
      for (let k = 0; k < pocet; k++) {
        s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
          x, y: zaklad - (k + 1) * vyskaMince, w: sirkaMince, h: vyskaMince, rectRadius: 0.08,
          fill: { color: C.accent4 }, line: { color: C.text2, width: 1.5 }, objectName: `Mince ${i + 1}-${k + 1}`,
        });
      }
    });
    s.addShape(pres.shapes.LINE, {
      x: x0 - 0.15, y: zaklad, w: sloupky.length * (sirkaMince + mezera) + 0.1, h: 0,
      line: { color: C.background2, width: 1.5 }, objectName: "Podložka mincí",
    });
    const xNejvyssi = x0 + 5 * (sirkaMince + mezera) + sirkaMince / 2;
    const vrchol = zaklad - 13 * vyskaMince;
    s.addImage({ data: await ilustrace("seedling"), x: xNejvyssi - 0.55, y: vrchol - 1.02, w: 1.1, h: 1.1, altText: "Rostlinka" });
    s.addImage({ data: await ilustrace("coin"), x: 9.35, y: 3.35, w: 0.5, h: 0.5, rotate: -15, altText: "" });
    s.addImage({ data: await ilustrace("coin"), x: 10.35, y: 2.55, w: 0.42, h: 0.42, rotate: 12, altText: "" });
    bublina(s, "Spoiler: není to kasino", { x: 8.55, y: 1.0, w: 3.2, h: 0.75 });

    s.addNotes(body(
      "Přivítání. Proč o tom mluvím: investuji od roku 2019.",
      "Cíl: ukázat, jak akcie fungují a proč dlouhodobé investování není hazard.",
      "Mince rostou čím dál rychleji = složené úročení (dostaneme se k němu).",
    ));
  }

  /* ----- 2. Graf: pravděpodobnost ztráty ----- */
  pres.addSection({ title: "Je to hazard?" });
  {
    const s = pres.addSlide({ masterName: "OBSAH", sectionTitle: "Je to hazard?" });
    s.addText("Čím déle držíte, tím menší šance na ztrátu", { placeholder: "title" });

    const vyber = [
      [0, "1 den"], [1, "1 měsíc"], [12, "1 rok"], [60, "5 let"], [120, "10 let"], [180, "15 let"], [240, "20 let"],
    ];
    const radek = (mes) => ztrata.radky.find((r) => r.mesicu === mes).nominalne;
    const hodnoty = vyber.map(([mes]) => Math.round(radek(mes).p * 1000) / 10); // v procentech

    s.addText("Jak často byla investice do S&P 500 ve ztrátě", {
      x: 0.6, y: 1.4, w: 8.0, h: 0.4, fontSize: 16, bold: true, color: C.text1, margin: 0, isTextBox: true,
    });
    // Legenda barev: krátkodobě loterie, dlouhodobě investice
    s.addShape(pres.shapes.OVAL, { x: 0.6, y: 1.94, w: 0.16, h: 0.16, fill: { color: C.accent2 }, line: { type: "none" }, objectName: "Legenda krátkodobě" });
    s.addText("krátkodobě: skoro loterie", { x: 0.85, y: 1.82, w: 2.6, h: 0.4, fontSize: 14, color: C.text1, margin: 0, isTextBox: true, valign: "middle" });
    s.addShape(pres.shapes.OVAL, { x: 3.4, y: 1.94, w: 0.16, h: 0.16, fill: { color: C.accent1 }, line: { type: "none" }, objectName: "Legenda dlouhodobě" });
    s.addText("dlouhodobě: investice", { x: 3.65, y: 1.82, w: 2.6, h: 0.4, fontSize: 14, color: C.text1, margin: 0, isTextBox: true, valign: "middle" });

    s.addChart(pres.charts.BAR, [{ name: "Ve ztrátě", labels: vyber.map(([, t]) => t), values: hodnoty }], {
      x: 0.5, y: 2.3, w: 8.1, h: 4.3,
      barDir: "col", barGapWidthPct: 55,
      chartColors: [HEX.accent2, HEX.accent2, HEX.accent2, HEX.accent1, HEX.accent1, HEX.accent1, HEX.accent1],
      showValue: true, dataLabelPosition: "outEnd", dataLabelFontFace: "+mn-lt", dataLabelFontSize: 18,
      dataLabelFontBold: true, dataLabelColor: HEX.dk1,
      // Bez desetinných míst: oddělovač by se lišil podle nastavení systému
      dataLabelFormatCode: '[=0]"0 %";[<1]"pod 1 %";0" %"',
      catAxisLabelFontFace: "+mn-lt", catAxisLabelFontSize: 16, catAxisLabelColor: HEX.dk1,
      catAxisLineShow: true, catAxisLineColor: "C3C2B7",
      valAxisHidden: true, valAxisMinVal: 0, valAxisMaxVal: 52,
      valGridLine: { style: "none" }, catGridLine: { style: "none" },
      showLegend: false,
      objectName: "Graf pravděpodobnosti ztráty",
    });

    const karty = [
      { obrazek: "turtle", barva: C.accent1, cislo: "0 %", text: "Kdo držel 20 let a déle, za 155 let ani jednou neprodělal." },
      { obrazek: "coin", barva: C.accent2, cislo: `${cele.format(Math.round(radek(0).p * 100))} %`, text: "Den po dni je to skoro hod mincí. Proto akcie nesledujte každý den." },
    ];
    for (const [i, k] of karty.entries()) {
      const y = 1.5 + i * 2.6;
      karta(s, { x: 8.95, y, w: 3.8, h: 2.35, barva: k.barva, nazev: `Karta ${i + 1}` });
      s.addImage({ data: await ilustrace(k.obrazek), x: 9.2, y: y + 0.2, w: 1.0, h: 1.0, altText: "" });
      s.addText(k.cislo, {
        x: 10.35, y: y + 0.25, w: 2.2, h: 0.9, fontFace: THEME.headFontFace, fontSize: 40, bold: true, color: C.text1,
        valign: "middle", margin: 0, isTextBox: true, objectName: `Číslo ${i + 1}`,
      });
      s.addText(k.text, {
        x: 9.25, y: y + 1.3, w: 3.3, h: 0.9, fontSize: 15, color: C.text1, valign: "top", margin: 0,
        isTextBox: true, objectName: `Text karty ${i + 1}`,
      });
    }

    s.addText("S&P 500 s reinvestovanými dividendami, všechna klouzavá období 1871–2026 (data R. Shillera). 1 den: denní data 1928–2026.", {
      x: 0.6, y: 6.62, w: 12.1, h: 0.3, fontSize: 11, color: C.text2, margin: 0, isTextBox: true, objectName: "Zdroj",
    });
    s.addNotes(body(
      "Odpověď na „je to hazard?“: koupě v kterémkoli měsíci od roku 1871.",
      "1 den: ztráta ve 46 % případů = hod mincí. Denní trading opravdu hazard je.",
      "1 rok 27 %, 5 let 10 %, 10 let 3 %, 20 let ani jednou.",
      "Rozdíl od kasina: tam má výhodu dům, tady se podílíte na zisku firem.",
      "Živě: kalkulačka „Je to hazard?“ (tomasmichal.github.io/kalkulacky).",
      "Zdroj: Shiller, scripts/statistiky.py, research/trh.md.",
    ));
  }

  /* ----- 3. Velká čísla: spořák vs. akcie ----- */
  pres.addSection({ title: "Složené úročení" });
  {
    const s = pres.addSlide({ masterName: "OBSAH", sectionTitle: "Složené úročení" });
    s.addText("Stejné peníze, čtyřikrát víc", { placeholder: "title" });

    const mesicne = 15000, roky = 30;
    const vlozeno = mesicne * 12 * roky;
    const sporak = budouciHodnota(mesicne, roky, 0.02 * 0.85);
    const akcie = budouciHodnota(mesicne, roky, 0.095);
    const nasobek = akcie / sporak;

    s.addText([
      { text: `${cele.format(mesicne)} Kč měsíčně po dobu ${roky} let`, options: { bold: true } },
      { text: `   ·   vložíte ${milKc(vlozeno)}` },
    ], { x: 0.6, y: 1.35, w: 12.1, h: 0.45, fontSize: 20, color: C.text1, margin: 0, isTextBox: true, objectName: "Zadání příkladu" });

    const karty = [
      { obrazek: "bank", barva: C.accent3, nazev: "Spořicí účet velké banky", hodnota: sporak, popis: "2 % úrok, po 15% dani 1,7 % ročně" },
      { obrazek: "rocket", barva: C.accent1, nazev: "Akcie (index S&P 500)", hodnota: akcie, popis: "9,5 % ročně, jako za posledních 30 let v korunách" },
    ];
    const sirkaKarty = 5.6, yKarty = 2.05, vyskaKarty = 3.3;
    for (const [i, k] of karty.entries()) {
      const x = 0.6 + i * (sirkaKarty + 0.9);
      karta(s, { x, y: yKarty, w: sirkaKarty, h: vyskaKarty, barva: k.barva, nazev: `Karta ${k.nazev}` });
      s.addImage({ data: await ilustrace(k.obrazek), x: x + 0.3, y: yKarty + 0.2, w: 1.0, h: 1.0, altText: "" });
      s.addText(k.nazev, {
        x: x + 1.45, y: yKarty + 0.3, w: sirkaKarty - 1.7, h: 0.8, fontSize: 20, bold: true, color: C.text1,
        valign: "middle", margin: 0, isTextBox: true,
      });
      s.addText(milKc(k.hodnota), {
        x: x + 0.35, y: yKarty + 1.25, w: sirkaKarty - 0.7, h: 1.0, fontFace: THEME.headFontFace, fontSize: 54, bold: true,
        color: C.text1, valign: "middle", margin: 0, isTextBox: true, objectName: `Hodnota ${i + 1}`,
      });
      // Pruh: šedá = vloženo, barva = co přidaly samotné peníze
      const plnaSirka = sirkaKarty - 0.7;
      const wVlozeno = (vlozeno / akcie) * plnaSirka;
      const wVynos = ((k.hodnota - vlozeno) / akcie) * plnaSirka;
      const yPruh = yKarty + 2.4;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 0.35, y: yPruh, w: wVlozeno, h: 0.3, rectRadius: 0.06, fill: { color: C.text2, transparency: 70 }, line: { type: "none" }, objectName: `Pruh vloženo ${i + 1}` });
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 0.35 + wVlozeno + 0.04, y: yPruh, w: Math.max(0.12, wVynos - 0.04), h: 0.3, rectRadius: 0.06, fill: { color: k.barva }, line: { type: "none" }, objectName: `Pruh výnos ${i + 1}` });
      s.addText(k.popis, {
        x: x + 0.35, y: yKarty + 2.8, w: plnaSirka, h: 0.35, fontSize: 14, color: C.text2, margin: 0, isTextBox: true,
      });
    }

    // Hvězdice s násobkem mezi kartami
    s.addText(`${cele.format(Math.round(nasobek))}×`, {
      shape: pres.shapes.STAR_12_POINT, x: 5.95, y: yKarty + 0.95, w: 1.45, h: 1.45, rotate: -8,
      fill: { color: C.accent4 }, line: { color: C.background2, width: 3 },
      fontFace: THEME.headFontFace, fontSize: 26, bold: true, color: C.text1, align: "center", valign: "middle", margin: 0,
      objectName: "Násobek",
    });

    // Legenda pruhu + QR kód na kalkulačku
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 5.72, w: 0.3, h: 0.2, rectRadius: 0.04, fill: { color: C.text2, transparency: 70 }, line: { type: "none" }, objectName: "Legenda vloženo" });
    s.addText("vložili jste vy", { x: 1.0, y: 5.62, w: 1.8, h: 0.4, fontSize: 14, color: C.text1, margin: 0, isTextBox: true, valign: "middle" });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 2.75, y: 5.72, w: 0.15, h: 0.2, rectRadius: 0.03, fill: { color: C.accent3 }, line: { type: "none" }, objectName: "Legenda výnos spořák" });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 2.93, y: 5.72, w: 0.15, h: 0.2, rectRadius: 0.03, fill: { color: C.accent1 }, line: { type: "none" }, objectName: "Legenda výnos akcie" });
    s.addText("přidaly samotné peníze", { x: 3.2, y: 5.62, w: 3.5, h: 0.4, fontSize: 14, color: C.text1, margin: 0, isTextBox: true, valign: "middle" });

    s.addImage({ data: await qr(`${WEB}slozene-uroceni.html`), x: 11.45, y: 5.5, w: 1.25, h: 1.25, altText: "QR kód na kalkulačku složeného úročení" });
    s.addText([
      { text: "Spočítejte si to sami", options: { bold: true, breakLine: true } },
      { text: "tomasmichal.github.io/kalkulacky" },
    ], { x: 7.6, y: 5.6, w: 3.7, h: 0.9, fontSize: 14, color: C.text1, align: "right", valign: "middle", margin: 0, isTextBox: true, objectName: "Odkaz na kalkulačku" });

    s.addText("Bez poplatků a inflace. Minulé výnosy nezaručují budoucí.", {
      x: 0.6, y: 6.62, w: 7, h: 0.3, fontSize: 11, color: C.text2, margin: 0, isTextBox: true, objectName: "Poznámka",
    });
    s.addNotes(body(
      `15 000 Kč měsíčně, 30 let, vloženo ${milKc(vlozeno)}.`,
      `Spořák velké banky (2 %, po dani 1,7 %): ${milKc(sporak)}.`,
      `Akcie 9,5 % ročně (S&P 500 v Kč za posledních 30 let): ${milKc(akcie)}, tedy ${jednoDes.format(nasobek)}× víc.`,
      "Šedá = vložili jste vy, barevná = přidaly samotné peníze (u akcií 4× víc než vklady).",
      "Pozor: 9,5 % je minulost. Výhledy institucí jsou nižší (J.P. Morgan ~7,5 %).",
      "Živě: kalkulačka složeného úročení, QR kód vpravo dole.",
    ));
  }

  await pres.writeFile({ fileName: VYSTUP });
  await applyTheme(VYSTUP, THEME);
  console.log(`Hotovo: ${VYSTUP}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
