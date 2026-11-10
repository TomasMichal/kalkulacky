// Generátor prezentace „Jak nechat peníze pracovat“ (pptxgenjs).
// Spuštění:  cd prezentace && npm run build   (NODE_PATH kvůli apply_theme.js ze skillu pptx)
// Čísla se berou z ../docs/data (stejný zdroj jako webové kalkulačky).

const path = require("path");
const fs = require("fs");
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const QRCode = require("qrcode");
const fa = require("react-icons/fa6");

const APPLY_THEME = path.join(
  process.env.HOME,
  ".claude/skills/synced/65686e4d-ee1f-470d-b27e-177b89c5bb66_92bb5caf-127e-4ba8-b000-b1431ca69b82/pptx/scripts/apply_theme.js",
);
const { applyTheme } = require(APPLY_THEME);

const VYSTUP = path.join(__dirname, "jak-nechat-penize-pracovat.pptx");
const DATA = path.join(__dirname, "..", "docs", "data");
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
    accent2: "EB6834", // fond / poplatky
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

async function ikona(Komponenta, barva, velikost = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(Komponenta, { color: `#${barva}`, size: velikost }),
  );
  const png = await sharp(Buffer.from(svg)).resize(velikost, velikost).png().toBuffer();
  return "image/png;base64," + png.toString("base64");
}

async function qr(url) {
  const dataUrl = await QRCode.toDataURL(url, {
    margin: 1, width: 600, errorCorrectionLevel: "M",
    color: { dark: `#${HEX.dk1}`, light: "#FFFFFF" },
  });
  return dataUrl.replace(/^data:/, "");
}

const stin = () => ({ type: "outer", color: "000000", opacity: 0.1, blur: 10, offset: 2, angle: 90 });

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

  const PATICKA = [
    { text: { text: "Jak nechat peníze pracovat", options: { x: 0.6, y: 6.98, w: 6, h: 0.3, fontSize: 10, color: C.text2, margin: 0 } } },
  ];

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
      ...PATICKA,
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

    // Ilustrace: sloupky mincí rostou čím dál rychleji (složené úročení)
    const sloupky = [1, 2, 3, 5, 8, 13];
    const sirkaMince = 0.62, vyskaMince = 0.17, mezera = 0.2, zaklad = 6.15, x0 = 8.35;
    sloupky.forEach((pocet, i) => {
      const x = x0 + i * (sirkaMince + mezera);
      for (let k = 0; k < pocet; k++) {
        s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
          x, y: zaklad - (k + 1) * vyskaMince, w: sirkaMince, h: vyskaMince, rectRadius: 0.08,
          fill: { color: C.accent4 }, line: { color: C.text2, width: 1.5 },
          objectName: `Mince ${i + 1}-${k + 1}`,
        });
      }
    });
    s.addShape(pres.shapes.LINE, {
      x: x0 - 0.15, y: zaklad, w: sloupky.length * (sirkaMince + mezera) + 0.1, h: 0,
      line: { color: C.background2, width: 1.5 }, objectName: "Podložka mincí",
    });
    s.addNotes(
      "Přivítání. Dnes vám chci ukázat, jak funguje investování do akcií a proč si myslím, " +
      "že při dlouhodobém přístupu to není hazard, ale jedna z nejspolehlivějších cest k majetku. " +
      "Ilustrace vpravo: sloupky mincí rostou čím dál rychleji. To je složené úročení, ke kterému se dostaneme.",
    );
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
    const hodnoty = vyber.map(([mes]) => Math.round(radek(mes).p * 1000) / 10); // v procentech, 1 desetinné místo

    s.addChart(pres.charts.BAR, [{ name: "Ve ztrátě", labels: vyber.map(([, t]) => t), values: hodnoty }], {
      x: 0.6, y: 1.5, w: 7.9, h: 5.15,
      barDir: "col", barGapWidthPct: 55,
      chartColors: [HEX.accent1],
      showTitle: true, title: "Jak často byla investice do S&P 500 ve ztrátě",
      titleFontFace: "+mn-lt", titleFontSize: 16, titleColor: HEX.dk1,
      showValue: true, dataLabelPosition: "outEnd", dataLabelFontFace: "+mn-lt", dataLabelFontSize: 18,
      dataLabelFontBold: true, dataLabelColor: HEX.dk1,
      // Bez desetinných míst: oddělovač by se lišil podle nastavení systému
      dataLabelFormatCode: '[=0]"0 %";[<1]"pod 1 %";0" %"',
      catAxisLabelFontFace: "+mn-lt", catAxisLabelFontSize: 16, catAxisLabelColor: HEX.dk1,
      catAxisLineShow: true, catAxisLineColor: "C3C2B7",
      valAxisHidden: true, valAxisMinVal: 0, valAxisMaxVal: 50,
      valGridLine: { style: "none" }, catGridLine: { style: "none" },
      showLegend: false,
      objectName: "Graf pravděpodobnosti ztráty",
    });

    // Karty vpravo
    const karty = [
      {
        ikona: await ikona(fa.FaHourglassHalf, HEX.lt1), barva: C.accent1,
        cislo: "0 %", text: "Kdo držel 20 let a déle, za 155 let historie nikdy neprodělal.",
      },
      {
        ikona: await ikona(fa.FaCoins, HEX.dk1), barva: C.accent4,
        cislo: `${cele.format(Math.round(radek(0).p * 100))} %`, text: "Den po dni je to skoro hod mincí. Proto akcie nesledujte každý den.",
      },
    ];
    karty.forEach((k, i) => {
      const y = 1.6 + i * 2.55;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: 8.95, y, w: 3.8, h: 2.3, rectRadius: 0.2, fill: { color: C.background1 }, line: { type: "none" },
        shadow: stin(), objectName: `Karta ${i + 1}`,
      });
      s.addShape(pres.shapes.OVAL, { x: 9.25, y: y + 0.3, w: 0.8, h: 0.8, fill: { color: k.barva }, line: { type: "none" }, objectName: `Kruh ikony ${i + 1}` });
      s.addImage({ data: k.ikona, x: 9.45, y: y + 0.5, w: 0.4, h: 0.4, altText: "" });
      s.addText(k.cislo, {
        x: 10.25, y: y + 0.25, w: 2.3, h: 0.9, fontFace: THEME.headFontFace, fontSize: 40, bold: true, color: C.text1,
        valign: "middle", margin: 0, isTextBox: true, objectName: `Číslo ${i + 1}`,
      });
      s.addText(k.text, {
        x: 9.25, y: y + 1.2, w: 3.25, h: 0.95, fontSize: 15, color: C.text1, valign: "top", margin: 0,
        isTextBox: true, objectName: `Text karty ${i + 1}`,
      });
    });

    s.addText("S&P 500 s reinvestovanými dividendami, všechna klouzavá období 1871–2026 (data R. Shillera). 1 den: denní data 1928–2026.", {
      x: 0.6, y: 6.62, w: 12.1, h: 0.3, fontSize: 11, color: C.text2, margin: 0, isTextBox: true, objectName: "Zdroj",
    });
    s.addNotes(
      "Tohle je odpověď na „je to hazard“. Kdybyste koupili index S&P 500 v kterémkoli měsíci od roku 1871 " +
      "a drželi ho jeden den, byli byste ve ztrátě ve 46 % případů. To je skoro hod mincí, a proto denní obchodování opravdu hazard je. " +
      "Po roce je to 27 %, po pěti letech 10 %, po deseti letech 3 % a po dvaceti letech ani jednou za 155 let. " +
      "Rozdíl proti kasinu: v kasinu má výhodu dům, tady se podílíte na skutečných ziscích firem. " +
      "Živě: kalkulačka „Je to hazard?“ na tomasmichal.github.io/kalkulacky. " +
      "Zdroj: Shillerova data, výpočet scripts/statistiky.py, viz research/trh.md.",
    );
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

    const maxHodnota = akcie;
    const karty = [
      {
        ikona: await ikona(fa.FaPiggyBank, HEX.lt1), barva: C.accent3, nazev: "Spořicí účet velké banky",
        hodnota: sporak, popis: "2 % úrok, po 15% dani 1,7 % ročně",
      },
      {
        ikona: await ikona(fa.FaArrowTrendUp, HEX.lt1), barva: C.accent1, nazev: "Akcie (index S&P 500)",
        hodnota: akcie, popis: "9,5 % ročně, jako za posledních 30 let v korunách",
      },
    ];
    const sirkaKarty = 5.6, yKarty = 2.05, vyskaKarty = 3.3;
    karty.forEach((k, i) => {
      const x = 0.6 + i * (sirkaKarty + 0.9);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x, y: yKarty, w: sirkaKarty, h: vyskaKarty, rectRadius: 0.22, fill: { color: C.background1 },
        line: { type: "none" }, shadow: stin(), objectName: `Karta ${k.nazev}`,
      });
      s.addShape(pres.shapes.OVAL, { x: x + 0.35, y: yKarty + 0.35, w: 0.8, h: 0.8, fill: { color: k.barva }, line: { type: "none" }, objectName: `Kruh ikony ${i + 1}` });
      s.addImage({ data: k.ikona, x: x + 0.55, y: yKarty + 0.55, w: 0.4, h: 0.4, altText: "" });
      s.addText(k.nazev, {
        x: x + 1.35, y: yKarty + 0.35, w: sirkaKarty - 1.6, h: 0.8, fontSize: 20, bold: true, color: C.text1,
        valign: "middle", margin: 0, isTextBox: true,
      });
      s.addText(milKc(k.hodnota), {
        x: x + 0.35, y: yKarty + 1.25, w: sirkaKarty - 0.7, h: 1.0, fontFace: THEME.headFontFace, fontSize: 54, bold: true,
        color: C.text1, valign: "middle", margin: 0, isTextBox: true, objectName: `Hodnota ${i + 1}`,
      });
      // Pruh: šedá = vloženo, barva = co přidaly samotné peníze
      const plnaSirka = sirkaKarty - 0.7;
      const wVlozeno = (vlozeno / maxHodnota) * plnaSirka;
      const wVynos = ((k.hodnota - vlozeno) / maxHodnota) * plnaSirka;
      const yPruh = yKarty + 2.4;
      s.addShape(pres.shapes.RECTANGLE, { x: x + 0.35, y: yPruh, w: wVlozeno, h: 0.3, fill: { color: C.text2, transparency: 70 }, line: { type: "none" }, objectName: `Pruh vloženo ${i + 1}` });
      s.addShape(pres.shapes.RECTANGLE, { x: x + 0.35 + wVlozeno + 0.03, y: yPruh, w: Math.max(0.05, wVynos - 0.03), h: 0.3, fill: { color: k.barva }, line: { type: "none" }, objectName: `Pruh výnos ${i + 1}` });
      s.addText(k.popis, {
        x: x + 0.35, y: yKarty + 2.8, w: plnaSirka, h: 0.35, fontSize: 14, color: C.text2, margin: 0, isTextBox: true,
      });
    });

    // Bublina s násobkem mezi kartami
    s.addShape(pres.shapes.OVAL, { x: 6.2, y: yKarty + 1.15, w: 0.95, h: 0.95, fill: { color: C.accent4 }, line: { color: C.background2, width: 3 }, objectName: "Násobek" });
    s.addText(`${cele.format(Math.round(nasobek))}×`, {
      x: 6.2, y: yKarty + 1.15, w: 0.95, h: 0.95, fontFace: THEME.headFontFace, fontSize: 24, bold: true, color: C.text1,
      align: "center", valign: "middle", margin: 0, isTextBox: true,
    });

    // Legenda pruhu + QR kód na kalkulačku
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 5.72, w: 0.3, h: 0.2, fill: { color: C.text2, transparency: 70 }, line: { type: "none" }, objectName: "Legenda vloženo" });
    s.addText("vložili jste vy", { x: 1.0, y: 5.62, w: 1.8, h: 0.4, fontSize: 14, color: C.text1, margin: 0, isTextBox: true, valign: "middle" });
    s.addShape(pres.shapes.RECTANGLE, { x: 2.75, y: 5.72, w: 0.15, h: 0.2, fill: { color: C.accent3 }, line: { type: "none" }, objectName: "Legenda výnos spořák" });
    s.addShape(pres.shapes.RECTANGLE, { x: 2.93, y: 5.72, w: 0.15, h: 0.2, fill: { color: C.accent1 }, line: { type: "none" }, objectName: "Legenda výnos akcie" });
    s.addText("přidaly samotné peníze", { x: 3.2, y: 5.62, w: 3.5, h: 0.4, fontSize: 14, color: C.text1, margin: 0, isTextBox: true, valign: "middle" });

    s.addImage({ data: await qr(`${WEB}slozene-uroceni.html`), x: 11.45, y: 5.5, w: 1.25, h: 1.25, altText: "QR kód na kalkulačku složeného úročení" });
    s.addText([
      { text: "Spočítejte si to sami", options: { bold: true, breakLine: true } },
      { text: "tomasmichal.github.io/kalkulacky" },
    ], { x: 7.6, y: 5.6, w: 3.7, h: 0.9, fontSize: 14, color: C.text1, align: "right", valign: "middle", margin: 0, isTextBox: true, objectName: "Odkaz na kalkulačku" });

    s.addText("Bez poplatků a inflace. Minulé výnosy nezaručují budoucí.", {
      x: 0.6, y: 6.62, w: 7, h: 0.3, fontSize: 11, color: C.text2, margin: 0, isTextBox: true, objectName: "Poznámka",
    });
    s.addNotes(
      `Příklad s 15 000 Kč měsíčně na 30 let. Vložíte ${milKc(vlozeno)}. ` +
      `Na spořáku velké banky (2 %, po dani 1,7 %) z toho bude ${milKc(sporak)}. ` +
      `V akciích při 9,5 % ročně, což je skutečný výnos S&P 500 v korunách za posledních 30 let, ${milKc(akcie)}. ` +
      `To je ${jednoDes.format(nasobek)}× víc. Šedá část pruhu je to, co jste vložili. Barevnou část přidaly samotné peníze. ` +
      "U akcií je barevná část čtyřikrát větší než vaše vlastní vklady. To je složené úročení. " +
      "Upozornit: 9,5 % je minulost, budoucnost může být horší. Výhledy institucí jsou nižší (J.P. Morgan asi 7,5 %). " +
      "Živě: kalkulačka složeného úročení, QR kód vpravo dole.",
    );
  }

  await pres.writeFile({ fileName: VYSTUP });
  await applyTheme(VYSTUP, THEME);
  console.log(`Hotovo: ${VYSTUP}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
