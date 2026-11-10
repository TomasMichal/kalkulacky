// Generátor prezentace „Jak nechat peníze pracovat“ (pptxgenjs).
// Spuštění:  cd prezentace && npm run build   (NODE_PATH kvůli apply_theme.js ze skillu pptx)
// Čísla se počítají z ../docs/data (stejný zdroj jako webové kalkulačky) nebo jsou převzatá
// z ověřených rešerší v ../research (u každé konstanty je uveden soubor).
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
const WEB_KRATCE = "tomasmichal.github.io/kalkulacky";

/* ---------- Ověřená čísla z rešerší ---------- */

const FAKTA = {
  // research/filmy.md (ceny k 6. 11. 2026, Yahoo Finance)
  forrestAppleSDiv: 1.78e6, forrestIndexSDiv: 30000,
  futuramaCenty: 0.93, futuramaUrok: 0.0225, futuramaVysledek: 4.28e9,
  buffett: [["Index S&P 500", 125.8], ["Fond A", 21.7], ["Fond B", 42.3], ["Fond C", 87.7], ["Fond D", 2.8], ["Fond E", 27.0]],
  dozen1962: [["Index S&P 500", 661], ["IBM", 171], ["Polaroid", 0]], // tis. USD z 1 000 USD, s dividendami
  yahooPropad: 93,
  graceAkcie: 3, graceUSD: 180, graceRok: 1935, graceMajetek: 7e6,
  // research/trh.md
  spiva: [["5 let", 89.3], ["10 let", 83.3], ["15 let", 90.5], ["20 let", 92.6]], // Mid-Year 2026
  zmeskaneDny: [["Celou dobu investovaní", 80], ["Bez 10 nejlepších dnů", 36], ["Bez 20 nejlepších dnů", 21], ["Bez 30 nejlepších dnů", 14]], // tis. USD
  propady: [ // [období, propad %, návrat]
    ["1929–32", 84, "15 let"], ["2000–02", 47, "6 let"], ["2007–09", 55, "4,5 roku"],
    ["2020 (covid)", 34, "6 měsíců"], ["2022", 25, "2 roky"], ["Jaro 2025", 19, "4 měsíce"],
  ],
  dekadaJednorazove: -9, dekadaPravidelne: 7,
  vynosOd1928: 10.0, vynosOd1928Realne: 6.8,
  vynosKc30: 9.5, vynosUsd30: 10.2, kcPropad2000: 72,
  dayTradeBrazilie: 97, cfdXtb: 79,
  // research/cr-banky-dane.md
  inflaceKupniSila2000: 45500, inflaceCeny2000: 220000, inflacePrumer: 3.1,
  vkladyRealne: -2.4, vklady2006KupniSila: 62000,
  sporakCS: "0,20–0,75 %", sporakKB: "1,00–2,50 %", sporakCSOB: "2,75 %",
  monetaVstup: 0.015, monetaTer: 0.0133, monetaAkcie: 23, monetaCil: 0.04,
  // research/brokeri-etf.md
  spylIsin: "IE000XZSV718", spylTer: 0.0003, konverzeXtb: 0.005,
};

const SPORAK = 0.02;          // typický úrok velké banky před daní
const DAN_UROKY = 0.15;
const AKCIE = 0.095;          // S&P 500 v Kč za posledních 30 let

/* ---------- Téma ---------- */

const THEME = {
  name: "Jak nechat peníze pracovat",
  // Avenir Next je na každém Macu a má česká písmena (Arial Rounded MT Bold je nemá)
  headFontFace: "Avenir Next",
  bodyFontFace: "Avenir Next",
  colors: {
    dk1: "1D1B18",     // text
    lt1: "FFFFFF",     // karty
    dk2: "16325C",     // tmavě modrá (titulní, přechodové a živé slajdy)
    lt2: "F7F2EA",     // teplé pozadí obsahových slajdů (stejné jako web)
    accent1: "2A78D6", // akcie / ETF
    accent2: "EB6834", // fond / poplatky / krátkodobá spekulace
    accent3: "1BAF7A", // spořák
    accent4: "F5B83D", // mince / zlato
    accent5: "6250D6", // měna
    accent6: "D64545", // ztráta
    hlink: "1C5CAB",
    folHlink: "6250D6",
  },
};
const HEX = THEME.colors;

/* ---------- Výpočty a formátování ---------- */

const cele = new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 0 });
const des1 = new Intl.NumberFormat("cs-CZ", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const NB = " ";
const kc = (x) => `${cele.format(Math.round(x))}${NB}Kč`;
const milKc = (x) => `${des1.format(x / 1e6)}${NB}mil.${NB}Kč`;
const pct = (x, d = 0) => `${new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: d, minimumFractionDigits: d }).format(x * 100)}${NB}%`;

/** Budoucí hodnota pravidelných měsíčních vkladů (vklad na konci měsíce), stejně jako web. */
function budouciHodnota(mesicne, roky, rocniVynos, jednorazove = 0) {
  const m = Math.pow(1 + rocniVynos, 1 / 12) - 1;
  let h = jednorazove;
  for (let i = 0; i < roky * 12; i++) h = h * (1 + m) + mesicne;
  return h;
}

/** Stejná simulace jako kalkulačka „Spořák vs. fond vs. ETF“ (poplatky, převod měny, časový test). */
function produkt({ vklad = 0, mesicni = 0, pocetLet, rust, naklady = 0, vstupni = 0, konverze = 0, danZisku = 0.15 }) {
  const g = Math.pow(1 + rust, 1 / 12) * Math.pow(1 - naklady, 1 / 12) - 1;
  const nakupy = [];
  if (vklad > 0) nakupy.push({ m: 0, vlozeno: vklad, cisty: vklad * (1 - vstupni) * (1 - konverze) });
  for (let m = 1; m <= pocetLet * 12; m++) if (mesicni > 0) nakupy.push({ m, vlozeno: mesicni, cisty: mesicni * (1 - vstupni) * (1 - konverze) });
  const t = pocetLet * 12;
  let hruba = 0, vlozeno = 0, dan = 0;
  for (const n of nakupy) {
    const v = n.cisty * Math.pow(1 + g, t - n.m) * (1 - konverze);
    hruba += v;
    vlozeno += n.vlozeno;
    if (danZisku > 0 && t - n.m < 36) dan += danZisku * Math.max(0, v - n.vlozeno);
  }
  return { hodnota: hruba - dan, vlozeno, hruba, dan };
}

const cacheIlustraci = new Map();
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
  const dataUrl = await QRCode.toDataURL(url, { margin: 1, width: 700, errorCorrectionLevel: "M", color: { dark: `#${HEX.dk1}`, light: "#FFFFFF" } });
  return dataUrl.replace(/^data:/, "");
}

const stin = () => ({ type: "outer", color: "000000", opacity: 0.1, blur: 10, offset: 2, angle: 90 });
const body = (...radky) => radky.map((r) => `• ${r}`).join("\n");

/* ---------- Stavba prezentace ---------- */

async function main() {
  const ztrata = JSON.parse(fs.readFileSync(path.join(DATA, "ztrata.json"), "utf8"));
  const usdczk = JSON.parse(fs.readFileSync(path.join(DATA, "usdczk.json"), "utf8"));

  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE"; // 13,333 × 7,5 in
  pres.title = "Jak nechat peníze pracovat";
  pres.subject = "Dlouhodobé investování do akcií pro rodinu";
  pres.author = "Tomas Michal";
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  const C = pres.SchemeColor;

  /* ----- Layouty ----- */
  pres.defineSlideMaster({
    title: "TITUL",
    background: { color: C.text2 },
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: 0.8, y: 1.75, w: 7.2, h: 2.3, fontFace: THEME.headFontFace, fontSize: 54, bold: true, color: C.background1, align: "left", valign: "bottom", margin: 0 }, text: "" } },
      { placeholder: { options: { name: "body", type: "body", x: 0.8, y: 4.25, w: 7.4, h: 1.1, fontSize: 22, color: C.background2, valign: "top", margin: 0 }, text: "" } },
    ],
  });
  pres.defineSlideMaster({
    title: "SEKCE",
    background: { color: C.text2 },
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: 0.8, y: 2.3, w: 8.0, h: 1.6, fontFace: THEME.headFontFace, fontSize: 48, bold: true, color: C.background1, align: "left", valign: "bottom", margin: 0 }, text: "" } },
      { placeholder: { options: { name: "body", type: "body", x: 0.8, y: 4.1, w: 8.0, h: 1.0, fontSize: 24, color: C.accent4, valign: "top", margin: 0 }, text: "" } },
    ],
    slideNumber: { x: 12.2, y: 6.98, w: 0.5, h: 0.3, fontSize: 10, color: C.background2, align: "right" },
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

  /* ----- Pomocníci ----- */
  // Nezlomitelné mezery: číslo se nesmí oddělit od jednotky ani od dalších tisíců
  const nbsp = (t) => t
    .replace(/(\d) (?=\d{3}(?!\d))/g, `$1${NB}`)
    .replace(/(\d) (%|Kč|USD|EUR|mil\.|tis\.|mld\.|let|roky|roku|měsíc)/g, `$1${NB}$2`);
  const upravText = (text) => (typeof text === "string" ? nbsp(text) : text.map((r) => ({ ...r, text: nbsp(r.text) })));
  const T = (s, text, o) => s.addText(upravText(text), { margin: 0, isTextBox: true, color: C.text1, fontSize: 16, valign: "top", ...o });
  const obrazek = async (s, nazev, x, y, vel, extra = {}) => s.addImage({ data: await ilustrace(nazev), x, y, w: vel, h: vel, altText: "", ...extra });
  const zdroj = (s, text) => T(s, text, { x: 0.6, y: 6.62, w: 12.1, h: 0.3, fontSize: 11, color: C.text2, objectName: "Zdroj" });

  function karta(s, { x, y, w, h, barva = null, nazev = "Karta" }) {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.22, fill: { color: C.background1 }, line: { type: "none" }, shadow: stin(), objectName: `${nazev} podklad` });
    if (barva) s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.22, fill: { color: barva, transparency: 86 }, line: { type: "none" }, objectName: nazev });
  }

  /** Karta s ilustrací, nadpisem a textem (případně velkým číslem). */
  async function kartaSObrazkem(s, { x, y, w, h, barva, obr, nadpis, text, cislo, velikostCisla = 36, velikostTextu = 15 }) {
    karta(s, { x, y, w, h, barva, nazev: nadpis || cislo || "Karta" });
    const vel = 0.85;
    await obrazek(s, obr, x + 0.25, y + 0.22, vel);
    if (cislo) {
      T(s, cislo, { x: x + 1.25, y: y + 0.2, w: w - 1.45, h: 0.9, fontSize: velikostCisla, bold: true, valign: "middle", fontFace: THEME.headFontFace });
      if (nadpis) T(s, nadpis, { x: x + 0.3, y: y + 1.2, w: w - 0.6, h: 0.4, fontSize: 17, bold: true });
      T(s, text, { x: x + 0.3, y: y + (nadpis ? 1.6 : 1.2), w: w - 0.6, h: h - (nadpis ? 1.75 : 1.35), fontSize: velikostTextu });
    } else {
      T(s, nadpis, { x: x + 1.25, y: y + 0.22, w: w - 1.45, h: vel, fontSize: 19, bold: true, valign: "middle" });
      T(s, text, { x: x + 0.3, y: y + 1.2, w: w - 0.6, h: h - 1.35, fontSize: velikostTextu });
    }
  }

  function obsah(sekce, nadpis) {
    const s = pres.addSlide({ masterName: "OBSAH", sectionTitle: sekce });
    s.addText(nadpis, { placeholder: "title" });
    return s;
  }

  // Přechodové slajdy byly odstraněny (zkrácení), sekce jen zakládá oddíl v PowerPointu
  async function sekce(nazevSekce) {
    pres.addSection({ title: nazevSekce });
    return null;
  }
  async function sekceSeSlajdem(nazevSekce, { nadpis, podnadpis, obr, poznamky }) {
    pres.addSection({ title: nazevSekce });
    const s = pres.addSlide({ masterName: "SEKCE", sectionTitle: nazevSekce });
    s.addText(nadpis, { placeholder: "title" });
    s.addText(podnadpis, { placeholder: "body" });
    s.addShape(pres.shapes.OVAL, { x: 9.15, y: 1.55, w: 3.4, h: 3.4, fill: { color: C.background1, transparency: 90 }, line: { type: "none" }, objectName: "Kruh za ilustrací" });
    await obrazek(s, obr, 9.6, 2.0, 2.5);
    s.addNotes(body(...poznamky));
    return s;
  }

  async function zive(nazevSekce, { nadpis, popis, stranka, obr, poznamky }) {
    const s = pres.addSlide({ masterName: "SEKCE", sectionTitle: nazevSekce });
    s.addText(nadpis, { placeholder: "title" });
    s.addText(popis, { placeholder: "body" });
    T(s, "Živě v prohlížeči", { x: 0.8, y: 1.5, w: 4, h: 0.5, fontSize: 18, bold: true, color: C.accent4 });
    await obrazek(s, obr, 0.8, 5.25, 0.9);
    T(s, WEB_KRATCE, { x: 1.85, y: 5.45, w: 7, h: 0.5, fontSize: 20, bold: true, color: C.background2, hyperlink: { url: `${WEB}${stranka}` } });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 9.0, y: 1.35, w: 3.7, h: 3.7, rectRadius: 0.25, fill: { color: C.background1 }, line: { type: "none" }, objectName: "Podklad QR" });
    s.addImage({ data: await qr(`${WEB}${stranka}`), x: 9.25, y: 1.6, w: 3.2, h: 3.2, altText: `QR kód na ${WEB}${stranka}` });
    T(s, "Namiřte mobil a zkuste si to sami", { x: 9.0, y: 5.2, w: 3.7, h: 0.4, fontSize: 14, color: C.background2, align: "center" });
    s.addNotes(body(...poznamky));
    return s;
  }

  const graf = (o) => ({
    showValue: true, dataLabelPosition: "outEnd", dataLabelFontFace: "+mn-lt", dataLabelFontSize: 16, dataLabelFontBold: true, dataLabelColor: HEX.dk1,
    catAxisLabelFontFace: "+mn-lt", catAxisLabelFontSize: 15, catAxisLabelColor: HEX.dk1, catAxisLineShow: true, catAxisLineColor: "C3C2B7",
    valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" }, showLegend: false, barGapWidthPct: 55,
    ...o,
  });

  const radekZtraty = (mes) => ztrata.radky.find((r) => r.mesicu === mes).nominalne;

  /* ======================= ÚVOD ======================= */
  pres.addSection({ title: "Úvod" });
  {
    const s = pres.addSlide({ masterName: "TITUL", sectionTitle: "Úvod" });
    s.addText("Jak nechat peníze pracovat", { placeholder: "title" });
    s.addText("Proč dlouhodobé investování do akcií není hazard", { placeholder: "body" });
    T(s, "Rodinné povídání · 26. listopadu 2026", { x: 0.8, y: 5.65, w: 7, h: 0.4, color: C.background2 });
    const sloupky = [1, 2, 3, 5, 8, 13];
    const sirkaMince = 0.62, vyskaMince = 0.17, mezera = 0.2, zaklad = 6.15, x0 = 8.35;
    sloupky.forEach((pocet, i) => {
      const x = x0 + i * (sirkaMince + mezera);
      for (let k = 0; k < pocet; k++) {
        s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: zaklad - (k + 1) * vyskaMince, w: sirkaMince, h: vyskaMince, rectRadius: 0.08, fill: { color: C.accent4 }, line: { color: C.text2, width: 1.5 }, objectName: `Mince ${i + 1}-${k + 1}` });
      }
    });
    s.addShape(pres.shapes.LINE, { x: x0 - 0.15, y: zaklad, w: sloupky.length * (sirkaMince + mezera) + 0.1, h: 0, line: { color: C.background2, width: 1.5 }, objectName: "Podložka mincí" });
    const xNejvyssi = x0 + 5 * (sirkaMince + mezera) + sirkaMince / 2;
    await obrazek(s, "seedling", xNejvyssi - 0.55, zaklad - 13 * vyskaMince - 1.02, 1.1);
    await obrazek(s, "coin", 9.35, 3.35, 0.5, { rotate: -15 });
    await obrazek(s, "coin", 10.35, 2.55, 0.42, { rotate: 12 });
    s.addNotes(body(
      "Přivítání, díky, že jste přišli.",
      "Cíl: ukázat, jak akcie fungují a proč dlouhodobé investování není hazard.",
      "Mince rostou čím dál rychleji = složené úročení. Dostaneme se k němu.",
    ));
  }
  {
    const s = obsah("Úvod", "Forrest Gump investoval do „ovocnářské firmy“");
    await obrazek(s, "clapper_board", 0.8, 1.75, 2.2);
    await obrazek(s, "popcorn", 2.45, 3.25, 1.35, { rotate: 8 });
    T(s, "Poručík Dan vložil Forrestovy peníze do firmy s jablkem v logu. Forrest pak řekl, že se o peníze už nemusí starat.", { x: 0.8, y: 4.85, w: 4.3, h: 1.4, fontSize: 17 });
    karta(s, { x: 5.6, y: 1.65, w: 7.1, h: 2.45, barva: C.accent1, nazev: "Apple" });
    T(s, "1 000 USD do Apple v den premiéry (1994)", { x: 5.95, y: 1.9, w: 6.4, h: 0.45, fontSize: 18, bold: true });
    T(s, `${des1.format(FAKTA.forrestAppleSDiv / 1e6)}${NB}mil.${NB}USD`, { x: 5.95, y: 2.4, w: 6.4, h: 1.1, fontSize: 60, bold: true, fontFace: THEME.headFontFace, valign: "middle" });
    T(s, "tolik by měly hodnotu dnes", { x: 5.95, y: 3.5, w: 6.4, h: 0.4, fontSize: 16, color: C.text2 });
    karta(s, { x: 5.6, y: 4.35, w: 7.1, h: 1.6, barva: C.accent4, nazev: "Index" });
    T(s, "Stejných 1 000 USD v celém indexu S&P 500:", { x: 5.95, y: 4.55, w: 6.4, h: 0.4, fontSize: 17 });
    T(s, `${cele.format(FAKTA.forrestIndexSDiv)}${NB}USD`, { x: 5.95, y: 4.95, w: 6.4, h: 0.8, fontSize: 36, bold: true, fontFace: THEME.headFontFace, valign: "middle" });
    zdroj(s, "S reinvestovanými dividendami, ceny k 6. 11. 2026 (Yahoo Finance). Na jeden háček se podíváme později.");
    s.addNotes(body(
      "Háček na začátek: Forrest Gump (1994), firma s jablkem = Apple.",
      "1 000 USD v den premiéry je dnes asi 1,8 mil. USD. Index jen 30 000 USD.",
      "Takže stačí koupit tu správnou firmu? Pointa přijde v kapitole o krachu (Apple dvakrát spadl o 80 %).",
    ));
  }
  {
    const s = obsah("Úvod", "Co se vám vybaví, když se řekne akcie?");
    const karty = [
      { obr: "slot_machine", barva: C.accent2, nadpis: "„Je to hazard, kasino.“", text: "Podíváme se na data za 155 let." },
      { obr: "roller_coaster", barva: C.accent6, nadpis: "„Při krachu přijdu o všechno.“", text: "Krach přijde. Ukážeme, co bylo potom." },
      { obr: "thinking_face", barva: C.accent5, nadpis: "„Nerozumím tomu, je to složité.“", text: "Ve skutečnosti jsou to 3 kroky." },
      { obr: "old_woman", barva: C.accent3, nadpis: "„Nemáme na to, jsme na to staří.“", text: "Stačí málo peněz a trocha času." },
    ];
    for (const [i, k] of karty.entries()) {
      await kartaSObrazkem(s, { x: 0.6 + (i % 2) * 6.15, y: 1.6 + Math.floor(i / 2) * 2.55, w: 5.95, h: 2.3, ...k });
    }
    s.addNotes(body(
      "Zeptat se rodiny, co je napadne. Nechat je mluvit.",
      "Tohle jsou čtyři obavy, které jsem od vás slyšel. Na každou dnes odpovím.",
    ));
  }
  {
    const s = obsah("Úvod", "Inflace: tichý zloděj v šuplíku");
    await obrazek(s, "money_with_wings", 0.9, 1.9, 3.3);
    karta(s, { x: 5.0, y: 1.65, w: 7.7, h: 2.6, barva: C.accent6, nazev: "Kupní síla" });
    T(s, kc(FAKTA.inflaceKupniSila2000), { x: 5.4, y: 1.85, w: 7.0, h: 1.2, fontSize: 66, bold: true, fontFace: THEME.headFontFace, valign: "middle" });
    T(s, "Tolik dnes reálně koupíte za 100 000 Kč, které jste v roce 2000 schovali doma.", { x: 5.4, y: 3.1, w: 7.0, h: 0.9, fontSize: 19 });
    karta(s, { x: 5.0, y: 4.5, w: 7.7, h: 1.75, nazev: "Ceny" });
    T(s, [
      { text: "Ceny se od roku 2000 víc než zdvojnásobily. ", options: { bold: true } },
      { text: `Co tehdy stálo 100 000 Kč, stojí dnes asi ${kc(FAKTA.inflaceCeny2000)}. Peníze, které nepracují, se pomalu rozpouštějí.` },
    ], { x: 5.4, y: 4.7, w: 7.0, h: 1.4, fontSize: 17 });
    zdroj(s, `Index spotřebitelských cen ČSÚ. Průměrná inflace v letech 2001–2025: ${des1.format(FAKTA.inflacePrumer)} % ročně.`);
    s.addNotes(body(
      "Peníze v šuplíku každý rok ztrácí hodnotu. Od roku 2000 přišly o víc než polovinu.",
      "Proto otázka není, jestli peníze někam dát, ale kam.",
      "Zdroj: ČSÚ, research/cr-banky-dane.md.",
    ));
  }

  /* ======================= CO JSOU AKCIE ======================= */
  await sekce("Co jsou akcie", { nadpis: "Co vlastně jsou akcie?", podnadpis: "„Nerozumím tomu.“ Je to jednodušší, než to vypadá.", obr: "bread", poznamky: ["Začneme úplně od základu."] });
  {
    const s = obsah("Co jsou akcie", "Akcie = kousek firmy");
    karta(s, { x: 0.6, y: 1.6, w: 5.95, h: 4.75, barva: C.accent4, nazev: "Pekárna" });
    await obrazek(s, "bread", 0.85, 1.8, 1.3);
    for (let i = 0; i < 20; i++) {
      const x = 2.55 + (i % 5) * 0.5, y = 1.85 + Math.floor(i / 5) * 0.5;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 0.42, h: 0.42, rectRadius: 0.07, fill: { color: i === 7 ? C.accent4 : C.text2 }, line: { type: "none" }, objectName: `Díl ${i + 1}` });
    }
    T(s, [
      { text: "Pekárna rozdělená na 20 dílů.", options: { bold: true, breakLine: true } },
      { text: " ", options: { breakLine: true, fontSize: 8 } },
      { text: "Koupíte jeden díl (zlatý) a vlastníte 1/20 pekárny i 1/20 jejího zisku.", options: { breakLine: true } },
      { text: " ", options: { breakLine: true, fontSize: 8 } },
      { text: "Velké firmy mají dílů miliardy, princip je stejný." },
    ], { x: 0.95, y: 4.0, w: 5.3, h: 2.2, fontSize: 18 });
    T(s, "Jak na tom vyděláte", { x: 6.85, y: 1.6, w: 5.8, h: 0.45, fontSize: 18, bold: true });
    await kartaSObrazkem(s, { x: 6.75, y: 2.15, w: 5.95, h: 2.0, barva: C.accent3, obr: "money_bag", nadpis: "Dividenda", text: "Část zisku vám firma pošle. Akumulační ETF ji samo investuje znovu." });
    await kartaSObrazkem(s, { x: 6.75, y: 4.35, w: 5.95, h: 2.0, barva: C.accent1, obr: "chart_increasing", nadpis: "Růst hodnoty", text: "Zbytek zisku firma investuje do růstu. Firma má větší cenu, a tak i váš díl." });
    zdroj(s, `S&P 500 s dividendami vynášel od roku 1928 v průměru ${des1.format(FAKTA.vynosOd1928)} % ročně, po odečtení inflace ${des1.format(FAKTA.vynosOd1928Realne)} % (A. Damodaran, NYU).`);
    s.addNotes(body(
      "Akcie není los ani sázka. Je to vlastnický podíl ve skutečné firmě.",
      "Vyděláváte dvakrát: dividendy a růst hodnoty firmy.",
      "Dlouhodobě S&P 500 asi 10 % ročně (od 1928), po inflaci 6,8 %.",
    ));
  }
  {
    const s = obsah("Co jsou akcie", "Firmy, které používáte každý den");
    const firmy = [
      ["mobile_phone", "Apple", "iPhone, iPad"], ["magnifying_glass_tilted_left", "Alphabet", "Google, YouTube"],
      ["laptop", "Microsoft", "Windows, Office"], ["package", "Amazon", "e-shop, cloud"],
      ["cup_with_straw", "Coca-Cola", "nápoje"], ["hamburger", "McDonald's", "restaurace"],
      ["credit_card", "Visa", "platební karty"], ["video_game", "Nvidia", "čipy pro hry a AI"],
    ];
    for (const [i, [obr, nazev, popis]] of firmy.entries()) {
      const x = 0.6 + (i % 4) * 3.1, y = 1.6 + Math.floor(i / 4) * 2.35;
      karta(s, { x, y, w: 2.9, h: 2.1, nazev });
      await obrazek(s, obr, x + 0.25, y + 0.25, 0.9);
      T(s, nazev, { x: x + 0.25, y: y + 1.2, w: 2.5, h: 0.45, fontSize: 20, bold: true });
      T(s, popis, { x: x + 0.25, y: y + 1.6, w: 2.5, h: 0.35, fontSize: 14, color: C.text2 });
    }
    zdroj(s, "Všechny tyto firmy jsou v americkém indexu S&P 500. Když kupujete index, vlastníte kousek každé z nich.");
    s.addNotes(body(
      "Tyhle firmy znáte a platíte jim každý den. Proč nebýt i jejich spolumajitelem?",
      "Všechny jsou v S&P 500.",
    ));
  }
  {
    const s = obsah("Co jsou akcie", "Index a ETF: celý koš firem jedním nákupem");
    await obrazek(s, "basket", 0.8, 1.8, 2.8);
    const radky = [
      ["S&P 500", "Koš 500 největších amerických firem. Apple, Microsoft, Coca-Cola… všechny v jednom."],
      ["ETF", "Fond, který kopíruje index. Jedním nákupem koupíte kousek všech 500 firem najednou."],
      ["Bezpečnost", "Když jedna firma zkrachuje, je to jen malý kousek koše. Index ji vyřadí a nahradí jinou."],
    ];
    for (const [i, [nadpis, text]] of radky.entries()) {
      const y = 1.6 + i * 1.6;
      karta(s, { x: 4.3, y, w: 8.4, h: 1.4, barva: [C.accent1, C.accent4, C.accent3][i], nazev: nadpis });
      T(s, nadpis, { x: 4.6, y: y + 0.2, w: 2.2, h: 1.0, fontSize: 22, bold: true, valign: "middle" });
      T(s, text, { x: 6.8, y: y + 0.2, w: 5.6, h: 1.0, fontSize: 17, valign: "middle" });
    }
    s.addNotes(body(
      "Nemusíte vybírat jednotlivé firmy. ETF na S&P 500 = celý koš najednou.",
      "Index se sám obměňuje: slabé firmy vypadnou, nové silné přibudou.",
      "Proč USA: největší trh, firmy prodávají po celém světě, data od 1871. Za 30 let 9,5 % ročně v Kč.",
    ));
  }

  /* ======================= JE TO HAZARD? ======================= */
  await sekce("Je to hazard?", { nadpis: "Je to hazard?", podnadpis: "„Je to kasino.“ Podívejme se na data.", obr: "slot_machine", poznamky: ["První a nejčastější námitka."] });
  {
    const s = obsah("Je to hazard?", "Kasino vs. burza");
    await kartaSObrazkem(s, { x: 0.6, y: 1.6, w: 5.95, h: 3.4, barva: C.accent2, obr: "slot_machine", nadpis: "Kasino",
      text: [
        { text: "Pravidla jsou nastavená tak, aby vyhrával dům.", options: { breakLine: true } },
        { text: " ", options: { breakLine: true, fontSize: 8 } },
        { text: "U rulety má kasino výhodu 2,7 % z každé sázky.", options: { breakLine: true } },
        { text: " ", options: { breakLine: true, fontSize: 8 } },
        { text: "Čím déle hrajete, tím jistěji prohrajete.", options: { bold: true } },
      ], velikostTextu: 19 });
    await kartaSObrazkem(s, { x: 6.75, y: 1.6, w: 5.95, h: 3.4, barva: C.accent1, obr: "factory", nadpis: "Burza",
      text: [
        { text: "Vlastníte kousky firem, které vydělávají skutečné peníze.", options: { breakLine: true } },
        { text: " ", options: { breakLine: true, fontSize: 8 } },
        { text: `S&P 500: v průměru +${cele.format(FAKTA.vynosOd1928)} % ročně od roku 1928.`, options: { breakLine: true } },
        { text: " ", options: { breakLine: true, fontSize: 8 } },
        { text: "Čím déle držíte, tím jistěji vyděláte.", options: { bold: true } },
      ], velikostTextu: 19 });
    karta(s, { x: 0.6, y: 5.25, w: 12.1, h: 1.1, barva: C.accent4, nazev: "Pointa" });
    T(s, "Hazard z burzy dělá jen krátkodobé spekulování. O tom za chvíli.", { x: 0.95, y: 5.25, w: 11.4, h: 1.1, fontSize: 21, bold: true, valign: "middle" });
    s.addNotes(body(
      "Kasino: očekávaný výsledek je záporný (ruleta 1/37 = 2,7 % pro dům).",
      "Burza: podíl na ziscích firem, očekávaný výsledek kladný.",
      "Hazard z burzy dělá jen krátkodobé spekulování.",
    ));
  }
  {
    const s = obsah("Je to hazard?", "Čím déle držíte, tím menší šance na ztrátu");
    const vyber = [[0, "1 den"], [1, "1 měsíc"], [12, "1 rok"], [60, "5 let"], [120, "10 let"], [180, "15 let"], [240, "20 let"]];
    const hodnoty = vyber.map(([mes]) => Math.round(radekZtraty(mes).p * 1000) / 10);
    T(s, "Jak často byla investice do S&P 500 ve ztrátě", { x: 0.6, y: 1.4, w: 8.0, h: 0.4, bold: true });
    s.addShape(pres.shapes.OVAL, { x: 0.6, y: 1.94, w: 0.16, h: 0.16, fill: { color: C.accent2 }, line: { type: "none" }, objectName: "Legenda krátkodobě" });
    T(s, "krátkodobě: skoro loterie", { x: 0.85, y: 1.82, w: 2.6, h: 0.4, fontSize: 14, valign: "middle" });
    s.addShape(pres.shapes.OVAL, { x: 3.4, y: 1.94, w: 0.16, h: 0.16, fill: { color: C.accent1 }, line: { type: "none" }, objectName: "Legenda dlouhodobě" });
    T(s, "dlouhodobě: investice", { x: 3.65, y: 1.82, w: 2.6, h: 0.4, fontSize: 14, valign: "middle" });
    s.addChart(pres.charts.BAR, [{ name: "Ve ztrátě", labels: vyber.map(([, t]) => t), values: hodnoty }], graf({
      x: 0.5, y: 2.3, w: 8.1, h: 4.3, barDir: "col",
      chartColors: [HEX.accent2, HEX.accent2, HEX.accent2, HEX.accent1, HEX.accent1, HEX.accent1, HEX.accent1],
      dataLabelFontSize: 18, catAxisLabelFontSize: 16, valAxisMinVal: 0, valAxisMaxVal: 52,
      // Bez desetinných míst: oddělovač by se lišil podle nastavení systému
      dataLabelFormatCode: '[=0]"0 %";[<1]"pod 1 %";0" %"',
      objectName: "Graf pravděpodobnosti ztráty",
    }));
    await kartaSObrazkem(s, { x: 8.95, y: 1.5, w: 3.8, h: 2.35, barva: C.accent1, obr: "turtle", cislo: "0 %", velikostCisla: 40, text: "Kdo držel 20 let a déle, za 155 let ani jednou neprodělal." });
    await kartaSObrazkem(s, { x: 8.95, y: 4.1, w: 3.8, h: 2.35, barva: C.accent2, obr: "coin", cislo: `${cele.format(Math.round(radekZtraty(0).p * 100))} %`, velikostCisla: 40, text: "Den po dni je to skoro hod mincí. Proto akcie nesledujte každý den." });
    zdroj(s, "S&P 500 s reinvestovanými dividendami, všechna klouzavá období 1871–2026 (data R. Shillera). 1 den: denní data 1928–2026.");
    s.addNotes(body(
      "Koupě v kterémkoli měsíci od 1871. 1 den: ztráta ve 46 % = hod mincí.",
      "1 rok 27 %, 5 let 10 %, 10 let 3 %, 20 let ani jednou.",
      "Hazard je krátkodobé spekulování, ne dlouhodobé držení.",
      "Zdroj: Shiller, scripts/statistiky.py, research/trh.md.",
    ));
  }
  await zive("Je to hazard?", { nadpis: "Vyzkoušejte si: je to hazard?", popis: "Posuňte jezdcem délku držení a sledujte, jak šance na ztrátu klesá.", stranka: "pravdepodobnost-ztraty.html", obr: "game_die", poznamky: ["Otevřít kalkulačku, posunout z 1 dne na 20 let.", "Přepnout „Po odečtení inflace“."] });

  /* ======================= SNĚHOVÁ KOULE ======================= */
  await sekce("Sněhová koule", { nadpis: "Sněhová koule", podnadpis: "„Nemáme na to.“ Malé částky a hodně času udělají divy.", obr: "snowman", poznamky: ["Složené úročení: nejdůležitější myšlenka dnešního večera."] });
  {
    const s = obsah("Sněhová koule", "Složené úročení: úroky z úroků");
    const kroky = [0, 1, 10, 20, 30].map((r) => [r, 100000 * Math.pow(1 + AKCIE, r)]);
    karta(s, { x: 0.6, y: 1.6, w: 6.6, h: 4.75, barva: C.accent1, nazev: "Příklad" });
    T(s, "100 000 Kč a 9,5 % ročně", { x: 0.95, y: 1.85, w: 6.0, h: 0.5, fontSize: 20, bold: true });
    for (const [i, [r, h]] of kroky.entries()) {
      const y = 2.5 + i * 0.72;
      T(s, r === 0 ? "Dnes" : `Po ${r === 1 ? "1 roce" : `${r} letech`}`, { x: 0.95, y, w: 2.6, h: 0.6, fontSize: 19, valign: "middle" });
      T(s, kc(h), { x: 3.5, y, w: 3.4, h: 0.6, fontSize: 24, bold: true, align: "right", valign: "middle", fontFace: THEME.headFontFace });
    }
    karta(s, { x: 7.45, y: 1.6, w: 5.25, h: 4.75, barva: C.accent4, nazev: "Futurama" });
    await obrazek(s, "television", 7.75, 1.85, 1.1);
    T(s, "Futurama", { x: 9.0, y: 2.05, w: 3.4, h: 0.6, fontSize: 22, bold: true, valign: "middle" });
    T(s, [
      { text: "Fry měl na účtu 93 centů a zmrazili ho na 1 000 let.", options: { breakLine: true } },
      { text: " ", options: { breakLine: true, fontSize: 8 } },
      { text: "Při úroku 2,25 % z nich mezitím bylo ", options: {} },
      { text: `${des1.format(FAKTA.futuramaVysledek / 1e9)} mld. USD.`, options: { bold: true, breakLine: true } },
      { text: " ", options: { breakLine: true, fontSize: 8 } },
      { text: "My 1 000 let nemáme. Proto potřebujeme vyšší výnos a začít co nejdřív." },
    ], { x: 7.8, y: 3.15, w: 4.6, h: 3.0, fontSize: 18 });
    s.addNotes(body(
      "Výnos se přičte a další rok vydělává i on. Proto koule roste čím dál rychleji.",
      `Za 30 let z 100 000 Kč asi ${kc(kroky[4][1])} (9,5 %).`,
      "Futurama: 0,93 × 1,0225^1000 = 4,3 mld. USD (ověřeno).",
    ));
  }
  {
    const s = obsah("Sněhová koule", "Stejné peníze, čtyřikrát víc");
    const mesicne = 15000, roky = 30;
    const vlozeno = mesicne * 12 * roky;
    const sporak = budouciHodnota(mesicne, roky, SPORAK * (1 - DAN_UROKY));
    const akcie = budouciHodnota(mesicne, roky, AKCIE);
    T(s, [
      { text: `${cele.format(mesicne)} Kč měsíčně po dobu ${roky} let`, options: { bold: true } },
      { text: `   ·   vložíte ${milKc(vlozeno)}` },
    ], { x: 0.6, y: 1.35, w: 12.1, h: 0.45, fontSize: 20, objectName: "Zadání příkladu" });
    const karty = [
      { obr: "bank", barva: C.accent3, nazev: "Spořicí účet velké banky", hodnota: sporak, popis: "2 % úrok, po 15% dani 1,7 % ročně" },
      { obr: "rocket", barva: C.accent1, nazev: "Akcie (index S&P 500)", hodnota: akcie, popis: "9,5 % ročně, jako za posledních 30 let v korunách" },
    ];
    for (const [i, k] of karty.entries()) {
      const x = 0.6 + i * 6.25, w = 5.85, yK = 2.05;
      karta(s, { x, y: yK, w, h: 3.3, barva: k.barva, nazev: k.nazev });
      await obrazek(s, k.obr, x + 0.3, yK + 0.2, 1.0);
      T(s, k.nazev, { x: x + 1.45, y: yK + 0.3, w: w - 1.7, h: 0.8, fontSize: 20, bold: true, valign: "middle" });
      T(s, milKc(k.hodnota), { x: x + 0.35, y: yK + 1.25, w: w - 0.7, h: 1.0, fontSize: 54, bold: true, fontFace: THEME.headFontFace, valign: "middle" });
      const plna = w - 0.7, wV = (vlozeno / akcie) * plna, wZ = ((k.hodnota - vlozeno) / akcie) * plna;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 0.35, y: yK + 2.4, w: wV, h: 0.3, rectRadius: 0.06, fill: { color: C.text2, transparency: 70 }, line: { type: "none" }, objectName: `Pruh vloženo ${i + 1}` });
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 0.35 + wV + 0.04, y: yK + 2.4, w: Math.max(0.12, wZ - 0.04), h: 0.3, rectRadius: 0.06, fill: { color: k.barva }, line: { type: "none" }, objectName: `Pruh výnos ${i + 1}` });
      T(s, k.popis, { x: x + 0.35, y: yK + 2.8, w: plna, h: 0.35, fontSize: 14, color: C.text2 });
    }
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 5.72, w: 0.3, h: 0.2, rectRadius: 0.04, fill: { color: C.text2, transparency: 70 }, line: { type: "none" }, objectName: "Legenda vloženo" });
    T(s, "vložili jste vy", { x: 1.0, y: 5.62, w: 1.8, h: 0.4, fontSize: 14, valign: "middle" });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 2.75, y: 5.72, w: 0.15, h: 0.2, rectRadius: 0.03, fill: { color: C.accent3 }, line: { type: "none" }, objectName: "Legenda výnos spořák" });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 2.93, y: 5.72, w: 0.15, h: 0.2, rectRadius: 0.03, fill: { color: C.accent1 }, line: { type: "none" }, objectName: "Legenda výnos akcie" });
    T(s, "přidaly samotné peníze", { x: 3.2, y: 5.62, w: 3.5, h: 0.4, fontSize: 14, valign: "middle" });
    zdroj(s, "Bez poplatků a inflace. Minulé výnosy nezaručují budoucí.");
    s.addNotes(body(
      `15 000 Kč měsíčně, 30 let, vloženo ${milKc(vlozeno)}.`,
      `Spořák: ${milKc(sporak)}. Akcie: ${milKc(akcie)}, tedy ${des1.format(akcie / sporak)}× víc.`,
      "Šedá = vložili jste vy, barevná = přidaly samotné peníze.",
      "Pozor: 9,5 % je minulost. Výhledy institucí jsou nižší (J.P. Morgan ~7,5 %).",
    ));
  }
  {
    const s = obsah("Sněhová koule", "Kdo začne dřív, vyhraje: Anna a Petr");
    const mesicne = 10000;
    const anna = budouciHodnota(mesicne, 10, AKCIE) * Math.pow(1 + AKCIE, 30);
    const petr = budouciHodnota(mesicne, 30, AKCIE);
    const osaX = 3.0, osaW = 4.6, vek = (v) => osaX + ((v - 25) / 40) * osaW;
    const lide = [
      { jmeno: "Anna", obr: "rocket", barva: C.accent1, od: 25, do: 35, vklad: mesicne * 12 * 10, vysledek: anna, popis: "vkládá 10 let (25–35), pak přestane", vlozil: "vložila" },
      { jmeno: "Petr", obr: "turtle", barva: C.accent2, od: 35, do: 65, vklad: mesicne * 12 * 30, vysledek: petr, popis: "začne v 35 a vkládá 30 let", vlozil: "vložil" },
    ];
    for (const [i, l] of lide.entries()) {
      const y = 1.75 + i * 2.2;
      karta(s, { x: 0.6, y, w: 12.1, h: 1.95, barva: l.barva, nazev: l.jmeno });
      await obrazek(s, l.obr, 0.85, y + 0.25, 0.8);
      T(s, l.jmeno, { x: 1.75, y: y + 0.3, w: 1.2, h: 0.7, fontSize: 24, bold: true, valign: "middle" });
      T(s, `${kc(mesicne)} měsíčně, ${l.popis}`, { x: 0.85, y: y + 1.15, w: 6.8, h: 0.4, fontSize: 15, color: C.text2 });
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: osaX, y: y + 0.5, w: osaW, h: 0.32, rectRadius: 0.08, fill: { color: C.background1 }, line: { type: "none" }, objectName: `Osa ${l.jmeno}` });
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: vek(l.od), y: y + 0.5, w: vek(l.do) - vek(l.od), h: 0.32, rectRadius: 0.08, fill: { color: l.barva }, line: { type: "none" }, objectName: `Vklady ${l.jmeno}` });
      T(s, "v 65 letech má", { x: 8.0, y: y + 0.2, w: 4.4, h: 0.4, fontSize: 16, color: C.text2, align: "right" });
      T(s, milKc(l.vysledek), { x: 8.0, y: y + 0.55, w: 4.4, h: 0.75, fontSize: 36, bold: true, fontFace: THEME.headFontFace, align: "right", valign: "middle" });
      T(s, `${l.vlozil} ${milKc(l.vklad)}`, { x: 8.0, y: y + 1.3, w: 4.4, h: 0.4, fontSize: 15, color: C.text2, align: "right" });
    }
    for (const v of [25, 35, 45, 55, 65]) {
      T(s, `${v} let`, { x: vek(v) - 0.4, y: 6.05, w: 0.8, h: 0.3, fontSize: 12, color: C.text2, align: "center" });
    }
    zdroj(s, "9,5 % ročně, vklad na konci měsíce, bez poplatků a inflace. Anna od 35 let nic nevkládá, peníze jen nechá růst.");
    s.addNotes(body(
      `Anna vloží 1,2 mil., Petr 3,6 mil. Kč. Anna má v 65 letech ${milKc(anna)}, Petr ${milKc(petr)}.`,
      "Anna vložila třetinu, a přesto má víc. Rozhoduje čas, ne velikost vkladů.",
      "Pro mladší v rodině: začněte hned, i s malou částkou.",
    ));
  }
  await zive("Sněhová koule", { nadpis: "Spočítejte si vlastní sněhovou kouli", popis: "Zadejte svou měsíční částku a počet let.", stranka: "slozene-uroceni.html", obr: "snowman", poznamky: ["Otevřít kalkulačku složeného úročení.", "Zeptat se někoho z rodiny na jeho částku a spočítat ji živě."] });

  /* ======================= SPOŘÁK, POPLATKY, DANĚ ======================= */
  await sekce("Spořák, poplatky a daně", { nadpis: "Spořák, poplatky a daně", podnadpis: "Kde jsou naše peníze teď a kolik nás to stojí.", obr: "bank", poznamky: ["Teď konkrétně: spořák a fond MONETA, kde máte peníze."] });
  {
    const s = obsah("Spořák, poplatky a daně", "Spořicí účet není investice");
    const banky = [["Česká spořitelna", FAKTA.sporakCS], ["Komerční banka", FAKTA.sporakKB], ["ČSOB", `${FAKTA.sporakCSOB} do 250 tis.`]];
    T(s, "Úrok bez dalších produktů banky (listopad 2026)", { x: 0.6, y: 1.45, w: 6.5, h: 0.4, bold: true });
    for (const [i, [banka, urok]] of banky.entries()) {
      const y = 1.95 + i * 1.15;
      karta(s, { x: 0.6, y, w: 6.5, h: 0.95, barva: C.accent3, nazev: banka });
      await obrazek(s, "bank", 0.8, y + 0.15, 0.65);
      T(s, banka, { x: 1.6, y: y + 0.15, w: 2.8, h: 0.65, fontSize: 18, bold: true, valign: "middle" });
      T(s, urok, { x: 4.2, y: y + 0.15, w: 2.7, h: 0.65, fontSize: 22, bold: true, align: "right", valign: "middle", fontFace: THEME.headFontFace });
    }
    T(s, [{ text: "Bonus jen s dalšími produkty banky, z úroku 15 % daň. " }, { text: "Spořák je dobrý na rezervu (3–6 měsíců výdajů), ne na majetek.", options: { bold: true } }], { x: 0.6, y: 5.4, w: 6.5, h: 0.95, fontSize: 15, color: C.text2 });
    karta(s, { x: 7.4, y: 1.6, w: 5.3, h: 4.75, barva: C.accent6, nazev: "Reálný výnos" });
    await obrazek(s, "chart_decreasing", 7.7, 1.85, 1.0);
    T(s, `${des1.format(FAKTA.vkladyRealne).replace("-", "−")}${NB}% ročně`, { x: 7.7, y: 3.0, w: 4.8, h: 1.0, fontSize: 48, bold: true, fontFace: THEME.headFontFace, valign: "middle" });
    T(s, `Tolik reálně vydělávaly vklady domácností v letech 2006–2025 po dani a inflaci. Ze 100 000 Kč je dnes kupní síla ${kc(FAKTA.vklady2006KupniSila)}.`, { x: 7.7, y: 4.05, w: 4.8, h: 2.1, fontSize: 17 });
    zdroj(s, "Ceníky ČS, KB a ČSOB k 10. 11. 2026; průměrné sazby vkladů domácností ČNB (ARAD); inflace ČSÚ.");
    s.addNotes(body(
      "Velké banky: ČS 0,2–0,75 %, KB 1–2,5 %, ČSOB 2,75 % do 250 tis.",
      "Bonusy (až 5,2 %) jen s investicemi, pojištěním nebo úvěrem u banky.",
      "Za 20 let vklady reálně ztrácely 2,4 % ročně.",
    ));
  }
  {
    const s = obsah("Spořák, poplatky a daně", "Co platíte ve fondu MONETA 2 konzervativní");
    await obrazek(s, "mouse_face", 0.9, 1.8, 2.6);
    T(s, "Poplatky z objemu ukusují každý rok kousek celého majetku.", { x: 0.6, y: 4.6, w: 3.6, h: 1.4, fontSize: 17, bold: true });
    await kartaSObrazkem(s, { x: 4.4, y: 1.6, w: 4.05, h: 2.3, barva: C.accent2, obr: "coin", cislo: pct(FAKTA.monetaVstup, 1), text: "z každého vkladu hned na začátku (vstupní poplatek)" });
    await kartaSObrazkem(s, { x: 8.65, y: 1.6, w: 4.05, h: 2.3, barva: C.accent2, obr: "spiral_calendar", cislo: pct(FAKTA.monetaTer, 2), text: "z celého majetku každý rok znovu (průběžné náklady)" });
    karta(s, { x: 4.4, y: 4.15, w: 8.3, h: 2.2, barva: C.accent6, nazev: "Příklad" });
    T(s, [
      { text: "Při majetku 5 mil. Kč je to ", options: {} },
      { text: `${kc(5e6 * FAKTA.monetaTer)} ročně`, options: { bold: true } },
      { text: ", ať se fondu daří, nebo ne.", options: { breakLine: true } },
      { text: " ", options: { breakLine: true, fontSize: 8 } },
      { text: `I ETF má poplatek, ale 0,03 %: z 5 mil. Kč jen ${kc(5e6 * FAKTA.spylTer)} ročně.` },
    ], { x: 4.75, y: 4.35, w: 7.7, h: 1.85, fontSize: 18 });
    zdroj(s, "Dokument s klíčovými informacemi (KID) fondu MONETA 2 konzervativní z 1. 4. 2026, ISIN IE000VHJLW78.");
    s.addNotes(body(
      "Vstupní poplatek 1,5 % + 1,33 % ročně z celého majetku.",
      "To je poplatek z objemu: platíte z celé částky, každý rok.",
      "Fond má ~23 % akcií, proto je i jeho výnos nižší.",
      "Poctivě: i ETF bere poplatek z objemu (TER), ale 44× menší. XTB navíc 0,5 % za převod měny.",
    ));
  }
  {
    const s = obsah("Spořák, poplatky a daně", "Stejný trh, jiné poplatky: rozdíl v milionech");
    const zadani = { mesicni: 15000, pocetLet: 30 };
    const trh = 0.06;
    const bez = produkt({ ...zadani, rust: trh, danZisku: 0 });
    const etf = produkt({ ...zadani, rust: trh, naklady: FAKTA.spylTer, konverze: FAKTA.konverzeXtb });
    const fond = produkt({ ...zadani, rust: trh, naklady: FAKTA.monetaTer, vstupni: FAKTA.monetaVstup });
    T(s, `${kc(zadani.mesicni)} měsíčně, 30 let, trh vydělává 6 % ročně pro oba stejně`, { x: 0.6, y: 1.4, w: 12.1, h: 0.45, fontSize: 20, bold: true });
    const radky = [
      { nazev: "ETF přes XTB", popis: "0,03 % ročně + 0,5 % převod měny", obr: "rocket", barva: C.accent1, h: etf },
      { nazev: "Fond MONETA 2 konzervativní", popis: "vstupní 1,5 % + 1,33 % ročně", obr: "mouse_face", barva: C.accent2, h: fond },
    ];
    for (const [i, r] of radky.entries()) {
      const y = 2.05 + i * 1.95;
      karta(s, { x: 0.6, y, w: 12.1, h: 1.75, barva: r.barva, nazev: r.nazev });
      await obrazek(s, r.obr, 0.85, y + 0.3, 0.9);
      T(s, r.nazev, { x: 1.95, y: y + 0.25, w: 5.5, h: 0.5, fontSize: 20, bold: true });
      T(s, r.popis, { x: 1.95, y: y + 0.75, w: 5.5, h: 0.4, fontSize: 15, color: C.text2 });
      T(s, milKc(r.h.hodnota), { x: 7.6, y: y + 0.2, w: 4.8, h: 0.9, fontSize: 40, bold: true, fontFace: THEME.headFontFace, align: "right", valign: "middle" });
      T(s, `na poplatcích ${milKc(bez.hruba - r.h.hruba)}`, { x: 7.6, y: y + 1.1, w: 4.8, h: 0.4, fontSize: 15, color: C.text2, align: "right" });
    }
    karta(s, { x: 0.6, y: 5.95, w: 12.1, h: 0.6, nazev: "Rozdíl" });
    T(s, [{ text: "Rozdíl jen kvůli poplatkům: ", options: {} }, { text: milKc(etf.hodnota - fond.hodnota), options: { bold: true } }], { x: 0.9, y: 5.95, w: 11.5, h: 0.6, fontSize: 20, valign: "middle" });
    s.addNotes(body(
      "Férové srovnání: oba vydělávají stejných 6 % ročně, liší se jen poplatky.",
      `ETF ${milKc(etf.hodnota)}, fond ${milKc(fond.hodnota)}. Rozdíl ${milKc(etf.hodnota - fond.hodnota)}.`,
      "Stejná simulace jako v kalkulačce Spořák vs. fond vs. ETF (včetně časového testu).",
    ));
  }
  await zive("Spořák, poplatky a daně", { nadpis: "Spořák vs. fond vs. ETF", popis: "Zadejte své úspory a uvidíte, kolik spolknou poplatky a daně.", stranka: "sporak-fond-etf.html", obr: "money_with_wings", poznamky: ["Zkusit 500 000 Kč jednorázově a 20 let.", "Přepnout „Stejný trh“ a „Skutečné produkty“."] });
  {
    const s = obsah("Spořák, poplatky a daně", "Buffettova sázka: levný index proti profesionálům");
    T(s, "Zhodnocení za 10 let (2008–2017)", { x: 0.6, y: 1.45, w: 8.0, h: 0.4, bold: true });
    s.addChart(pres.charts.BAR, [{ name: "Zhodnocení", labels: FAKTA.buffett.map(([t]) => t), values: FAKTA.buffett.map(([, v]) => v) }], graf({
      x: 0.5, y: 1.95, w: 8.1, h: 4.6, barDir: "col", chartColors: [HEX.accent1, HEX.accent2, HEX.accent2, HEX.accent2, HEX.accent2, HEX.accent2],
      dataLabelFontSize: 18, catAxisLabelFontSize: 15, valAxisMinVal: 0, valAxisMaxVal: 140, dataLabelFormatCode: '"+"0" %"', objectName: "Graf Buffettovy sázky",
    }));
    await kartaSObrazkem(s, { x: 8.95, y: 1.6, w: 3.8, h: 2.4, barva: C.accent4, obr: "money_bag", nadpis: "Sázka o 1 mil. USD", text: "Buffett vsadil, že levný index porazí pět fondů hedgeových fondů." });
    await kartaSObrazkem(s, { x: 8.95, y: 4.2, w: 3.8, h: 2.25, barva: C.accent1, obr: "party_popper", nadpis: "Index vyhrál", text: "Profesionálové platili kolem 2,5 % ročně na poplatcích." });
    zdroj(s, "Dopis akcionářům Berkshire Hathaway za rok 2017. Fondy A–E = pět fondů fondů vybraných protistranou.");
    s.addNotes(body(
      "Warren Buffett vsadil 1 mil. USD, že index porazí profesionály. Index +126 %, nejlepší fond +88 %.",
      "Buffett pro svou rodinu doporučil 90 % do levného indexu S&P 500.",
    ));
  }
  {
    const s = obsah("Spořák, poplatky a daně", "Daně: po 3 letech z akcií nic");
    await kartaSObrazkem(s, { x: 0.6, y: 1.6, w: 5.95, h: 2.25, barva: C.accent3, obr: "hourglass_done", cislo: "3 roky", text: "Držíte déle než 3 roky? Zisk z prodeje je bez daně. Spořák platí 15 % z každého úroku." });
    await kartaSObrazkem(s, { x: 6.75, y: 1.6, w: 5.95, h: 2.25, barva: C.accent1, obr: "money_bag", cislo: "100 000 Kč", text: "Prodeje do 100 000 Kč za rok jsou bez daně vždy, i před 3 lety." });
    await kartaSObrazkem(s, { x: 0.6, y: 4.1, w: 5.95, h: 2.25, barva: C.accent3, obr: "check_mark_button", nadpis: "Akumulační ETF", text: "Dividendy fond sám investuje znovu. Dokud neprodáte, nic nepřiznáváte." });
    await kartaSObrazkem(s, { x: 6.75, y: 4.1, w: 5.95, h: 2.25, barva: C.accent4, obr: "memo", nadpis: "Jednotlivé akcie", text: "Formulář W-8BEN (15 % místo 30 % z dividend), dividendy do přiznání. U zlomků akcií běží 3 roky až od celého kusu." });
    zdroj(s, "§ 4 zákona o daních z příjmů (stav 2026), smlouva o zamezení dvojího zdanění s USA. Zlomky: názor GFŘ, oficiální pokyn není.");
    s.addNotes(body(
      "Časový test 3 roky: zisk z prodeje osvobozen, od 2026 bez limitu 40 mil. Kč.",
      "Hodnotový test: tržby z prodeje do 100 000 Kč ročně osvobozeny.",
      "Akumulační ETF SPYL: žádné papírování. Jednotlivé akcie: W-8BEN (u XTB vyplnit ručně), dividendy do přiznání, doplatek 0 Kč.",
      "Přiznání za 2026 nutné nad 20 000 Kč ostatních příjmů (zaměstnanci), od 2027 nad 40 000 Kč.",
    ));
  }

  /* ======================= KRACH ======================= */
  await sekce("Co když přijde krach?", { nadpis: "Co když přijde krach?", podnadpis: "„Při krachu přijdu o všechno.“ Přijde. A pak zase odejde.", obr: "roller_coaster", poznamky: ["Poctivě o rizicích: propady přijdou, otázka je, co uděláte vy."] });
  {
    const s = obsah("Co když přijde krach?", "Velké propady přišly. A trh se vždycky vrátil");
    T(s, "Propad S&P 500 od vrcholu a doba návratu na předchozí vrchol", { x: 0.6, y: 1.45, w: 8.6, h: 0.4, bold: true });
    s.addChart(pres.charts.BAR, [{ name: "Propad", labels: FAKTA.propady.map(([o, , n]) => `${o}  ·  návrat ${n}`), values: FAKTA.propady.map(([, p]) => p) }], graf({
      x: 0.5, y: 1.95, w: 8.6, h: 4.6, barDir: "bar", chartColors: [HEX.accent6], catAxisOrientation: "maxMin",
      dataLabelFontSize: 18, catAxisLabelFontSize: 15, valAxisMinVal: 0, valAxisMaxVal: 100, dataLabelFormatCode: '"−"0" %"', objectName: "Graf propadů",
    }));
    await kartaSObrazkem(s, { x: 9.35, y: 1.6, w: 3.4, h: 2.35, barva: C.accent3, obr: "seedling", nadpis: "Pravidelně", text: `2000–2009 jednorázově −${Math.abs(FAKTA.dekadaJednorazove)} %, každý měsíc +${FAKTA.dekadaPravidelne} %.`, velikostTextu: 14 });
    await kartaSObrazkem(s, { x: 9.35, y: 4.1, w: 3.4, h: 2.35, barva: C.accent5, obr: "globe_with_meridians", nadpis: "Pozor na kurz", text: `V korunách 2000–2009 až −${FAKTA.kcPropad2000} %. Za 30 let jen ${des1.format(FAKTA.vynosKc30)} % v Kč vs. ${des1.format(FAKTA.vynosUsd30)} % v USD.`, velikostTextu: 14 });
    zdroj(s, "1929–2009 s dividendami (Shiller), 2020–2025 cenový index (Yahoo Finance). Výpočet scripts/statistiky.py.");
    s.addNotes(body(
      "Krachy přijdou, to je jisté. 1929 −84 %, 2008 −55 %, covid −34 %.",
      "Po každém se trh vrátil. Kdo vydržel, neprodělal.",
      "Pravidelné investování nakupuje v krizi levně (ztracená dekáda: −9 % vs. +7 %).",
      "Kurzové riziko: kupujeme dolarová aktiva. Krátkodobě může bolet (2000–2009 v Kč −72 %, návrat 12/2014), dlouhodobě malý vliv.",
    ));
  }
  await zive("Co když přijde krach?", { nadpis: "Co kdybych investoval těsně před krachem?", popis: "Zkusíme rok 2000 nebo 2007 a uvidíme nejhorší chvíli i výsledek dnes.", stranka: "co-kdyby.html", obr: "crystal_ball", poznamky: ["Scénář „Vrchol internetové bubliny (2000)“ → Každý měsíc.", "Pak „Těsně před krachem (1929)“."] });
  {
    const s = obsah("Je to hazard?", "Kdo vyskočí z vlaku, zmešká nejlepší dny");
    T(s, "10 000 USD v S&P 500 za posledních 20 let (tis. USD)", { x: 0.6, y: 1.45, w: 8.0, h: 0.4, bold: true });
    s.addChart(pres.charts.BAR, [{ name: "Hodnota", labels: FAKTA.zmeskaneDny.map(([t]) => t), values: FAKTA.zmeskaneDny.map(([, v]) => v) }], graf({
      x: 0.5, y: 1.95, w: 8.1, h: 4.6, barDir: "col", chartColors: [HEX.accent1, HEX.accent2, HEX.accent2, HEX.accent2],
      dataLabelFontSize: 20, catAxisLabelFontSize: 14, valAxisMinVal: 0, valAxisMaxVal: 90, dataLabelFormatCode: '0" tis."', objectName: "Graf zmeškaných dnů",
    }));
    await kartaSObrazkem(s, { x: 8.95, y: 1.6, w: 3.8, h: 2.75, barva: C.accent2, obr: "face_screaming_in_fear", cislo: "6 z 10", velikostCisla: 36, text: "nejlepších dnů přišlo do 2 týdnů od těch nejhorších." });
    await kartaSObrazkem(s, { x: 8.95, y: 4.6, w: 3.8, h: 1.85, barva: C.accent1, obr: "stopwatch", nadpis: "Riziko jste vy", text: "Kdo v panice prodá, zmešká nejlepší dny." });
    zdroj(s, "S dividendami, 9. 11. 2006 – 9. 11. 2026, výpočet z dat Yahoo Finance. Shoduje se s J.P. Morgan Guide to Retirement 2026.");
    s.addNotes(body(
      "Celou dobu investovaný: 80 tis. USD. Bez 10 nejlepších dnů 36 tis., bez 30 jen 14 tis.",
      "Nejlepší dny přicházejí hned po nejhorších. Kdo prodá ze strachu, zmešká je.",
      "Největší riziko je panika. Proto rezerva na spořáku a peníze na 5 let mimo akcie.",
    ));
  }
  {
    const s = obsah("Co když přijde krach?", "Proč index, a ne jedna „jistá“ firma");
    T(s, "1 000 USD v roce 1962, hodnota dnes s dividendami (tis. USD)", { x: 0.6, y: 1.45, w: 7.4, h: 0.4, bold: true });
    s.addChart(pres.charts.BAR, [{ name: "Hodnota", labels: FAKTA.dozen1962.map(([t]) => t), values: FAKTA.dozen1962.map(([, v]) => v) }], graf({
      x: 0.5, y: 1.95, w: 7.4, h: 4.6, barDir: "col", chartColors: [HEX.accent1, HEX.accent2, HEX.accent6], dataLabelFontSize: 20, catAxisLabelFontSize: 17,
      valAxisMinVal: 0, valAxisMaxVal: 760, dataLabelFormatCode: '[=0]"0 (krach)";0" tis."', objectName: "Graf index vs. firmy",
    }));
    await kartaSObrazkem(s, { x: 8.2, y: 1.6, w: 4.5, h: 2.35, barva: C.accent4, obr: "clapper_board", nadpis: "Dožeň, co se dá!", text: "Otec měl IBM, AT&T a Polaroid. Polaroid v roce 2001 zkrachoval. Index porazil všechny tři." });
    await kartaSObrazkem(s, { x: 8.2, y: 4.15, w: 4.5, h: 2.3, barva: C.accent6, obr: "popcorn", nadpis: "Frekvence (2000)", text: `Ve filmu zbohatnou na Yahoo. Ve skutečnosti pak spadlo o ${FAKTA.yahooPropad} %. I Apple z Forresta dvakrát ztratil přes 80 %.` });
    zdroj(s, "Yahoo Finance (IBM), Shiller (S&P 500), Polaroid: bankrot 11. 10. 2001. Viz research/filmy.md.");
    s.addNotes(body(
      "Pointa k Forrestovi: dopředu nevíte, jestli máte Apple, nebo Yahoo.",
      "Index vyhraje nad většinou jednotlivých firem a nikdy nezkrachuje celý.",
      "Proto je ETF základ, jednotlivé firmy jen doplněk.",
    ));
  }
  {
    const s = obsah("Co když přijde krach?", "Nejsme na to staří?");
    await kartaSObrazkem(s, { x: 0.6, y: 1.6, w: 5.95, h: 4.75, barva: C.accent3, obr: "hourglass_done", nadpis: "Čas ještě je",
      text: [
        { text: "V 60 letech máte před sebou často 20 a více let.", options: { breakLine: true } },
        { text: " ", options: { breakLine: true, fontSize: 8 } },
        { text: "Peníze mohou jednou dostat vnoučata. Pak je horizont ještě delší.", options: { breakLine: true } },
        { text: " ", options: { breakLine: true, fontSize: 8 } },
        { text: "Investovat postupně a nechat si rezervu, kterou budete potřebovat." },
      ], velikostTextu: 18 });
    await kartaSObrazkem(s, { x: 6.75, y: 1.6, w: 5.95, h: 4.75, barva: C.accent4, obr: "old_woman", nadpis: "Grace Groner",
      text: [
        { text: `V roce ${FAKTA.graceRok} koupila sekretářka ${FAKTA.graceAkcie} akcie své firmy za ${FAKTA.graceUSD} USD.`, options: { breakLine: true } },
        { text: " ", options: { breakLine: true, fontSize: 8 } },
        { text: "Nikdy je neprodala a žila skromně.", options: { breakLine: true } },
        { text: " ", options: { breakLine: true, fontSize: 8 } },
        { text: `Ve 100 letech odkázala škole přes ${cele.format(FAKTA.graceMajetek / 1e6)} mil. USD.`, options: { bold: true } },
      ], velikostTextu: 18 });
    zdroj(s, "Grace Groner (1909–2010), Lake Forest College. Jde o výjimečný příběh jedné firmy, ne typický výsledek.");
    s.addNotes(body(
      "Pro rodiče: horizont 20+ let je reálný, a peníze pro vnoučata ještě delší.",
      "Grace Groner: 3 akcie Abbott za 180 USD (1935) → přes 7 mil. USD.",
      "Poctivě: výjimečný příběh, ne typický výsledek.",
    ));
  }

  /* ======================= JAK ZAČÍT ======================= */
  await sekce("Jak začít", { nadpis: "Jak začít", podnadpis: "„Je to příliš složité.“ Ve skutečnosti jsou to 3 kroky.", obr: "mobile_phone", poznamky: ["Praktická část a živá ukázka."] });
  {
    const s = obsah("Jak začít", "Celé investování ve 3 krocích");
    const kroky = [
      { obr: "mobile_phone", barva: C.accent1, nadpis: "1. Účet u brokera", text: "Online za hodinu: občanka a krátký videohovor." },
      { obr: "spiral_calendar", barva: C.accent4, nadpis: "2. Automatický nákup", text: "Každý měsíc stejná částka, sama se nakoupí." },
      { obr: "sleeping_face", barva: C.accent3, nadpis: "3. Nedělat nic", text: "Nesledovat, neprodávat, nechat růst desítky let." },
    ];
    for (const [i, k] of kroky.entries()) await kartaSObrazkem(s, { x: 0.6 + i * 4.1, y: 1.6, w: 3.9, h: 2.9, velikostTextu: 18, ...k });
    karta(s, { x: 0.6, y: 4.75, w: 12.1, h: 1.1, barva: C.accent3, nazev: "Pointa" });
    T(s, "Nejtěžší je krok 3. Opravdu.", { x: 0.95, y: 4.75, w: 11.4, h: 1.1, fontSize: 21, bold: true, valign: "middle" });
    s.addNotes(body(
      "Investování nemusí být složité. Složité je vydržet nic nedělat.",
    ));
  }
  {
    const s = obsah("Jak začít", "Srovnání brokerů");
    const H = (t) => ({ text: t, options: { bold: true, color: C.background1, fill: { color: HEX.dk2 }, align: "center" } });
    const X = (t) => ({ text: t, options: { fill: { color: "E3EEFC" }, align: "center", bold: true } });
    const B = (t) => ({ text: t, options: { align: "center" } });
    const L = (t) => ({ text: t, options: { bold: true } });
    const radky = [
      [H(""), H("XTB"), H("Trading 212"), H("Interactive Brokers"), H("Fio e-Broker")],
      [L("Poplatek z objemu majetku"), X("0 Kč*"), B("0 Kč"), B("0 Kč"), B("0 Kč")],
      [L("Nákup US akcií a ETF"), X("0 %**"), B("0 %"), B("od 1 USD"), B("7,95 USD")],
      [L("Převod korun na dolary"), X("0,5 %"), B("0,15 %"), B("cca 0,03 %"), B("kurz banky")],
      [L("Čeština"), X("aplikace i podpora"), B("aplikace"), B("ne"), B("ano")],
      [L("Automatické investování"), X("Investiční plány"), B("Pies"), B("ano"), B("jen fondy")],
      [L("Zlomky akcií"), X("ano"), B("ano"), B("ano"), B("ne")],
      [L("Ochrana při krachu brokera"), X("do 20 100 EUR"), B("do 20 000 EUR"), B("do 20 000 EUR"), B("do 20 000 EUR")],
    ];
    s.addTable(radky, {
      x: 0.6, y: 1.55, w: 12.1, colW: [3.5, 2.15, 2.15, 2.15, 2.15], rowH: 0.58,
      fontSize: 15, color: C.text1, valign: "middle", fill: { color: HEX.lt1 }, border: { type: "solid", pt: 1, color: "E1E0D9" }, margin: 0.08, objectName: "Tabulka brokerů",
    });
    zdroj(s, "* do 250 000 EUR, pak 0,02 % ročně. ** do 100 000 EUR měsíčně. Ceníky brokerů ověřené 10. 11. 2026, research/brokeri-etf.md.");
    s.addNotes(body(
      "Všichni čtyři nemají poplatek z objemu.",
      "XTB: čeština, investiční plány, ale 0,5 % za převod měny. Trading 212 levnější převod, podpora anglicky.",
      "Živou ukázku dělám na XTB.",
    ));
  }
  {
    const s = obsah("Jak začít", "Co koupit: polovina index, polovina známé firmy");
    s.addChart(pres.charts.DOUGHNUT, [{ name: "Portfolio", labels: ["ETF SPYL (500 firem)", "Velké firmy, které znáte"], values: [50, 50] }], {
      x: 0.5, y: 1.55, w: 5.0, h: 4.9, holeSize: 55, chartColors: [HEX.accent1, HEX.accent4],
      showPercent: true, showValue: false, showLabel: false, dataLabelColor: HEX.dk1, dataLabelFontFace: "+mn-lt", dataLabelFontSize: 20, dataLabelFontBold: true,
      showLegend: true, legendPos: "b", legendFontFace: "+mn-lt", legendFontSize: 15, legendColor: HEX.dk1, objectName: "Graf portfolia",
    });
    karta(s, { x: 5.9, y: 1.6, w: 6.8, h: 2.55, barva: C.accent1, nazev: "SPYL" });
    await obrazek(s, "basket", 6.15, 1.85, 0.9);
    T(s, "ETF SPYL: celý S&P 500", { x: 7.25, y: 1.85, w: 5.2, h: 0.9, fontSize: 20, bold: true, valign: "middle" });
    T(s, [
      { text: `ISIN ${FAKTA.spylIsin} · ${pct(FAKTA.spylTer, 2)} ročně · akumulační`, options: { breakLine: true } },
      { text: "Jednotka stojí jen pár stovek korun, kupují se tedy celé kusy." },
    ], { x: 6.2, y: 2.85, w: 6.3, h: 1.2, fontSize: 15 });
    karta(s, { x: 5.9, y: 4.35, w: 6.8, h: 2.0, barva: C.accent4, nazev: "Firmy" });
    await obrazek(s, "mobile_phone", 6.15, 4.6, 0.9);
    T(s, "Velké firmy, které znáte", { x: 7.25, y: 4.6, w: 5.2, h: 0.9, fontSize: 20, bold: true, valign: "middle" });
    T(s, "Apple, Microsoft, Alphabet, Coca-Cola, McDonald's, Visa…", { x: 6.2, y: 5.55, w: 6.3, h: 0.6, fontSize: 15 });
    zdroj(s, "Obojí v jednom Investičním plánu XTB s automatickým měsíčním vkladem. Nejde o investiční doporučení.");
    s.addNotes(body(
      "Návrh: 50 % ETF SPYL, 50 % velké firmy, které znáte.",
      "Kdo chce úplně jednoduše a bezpečněji, může dát 100 % do ETF.",
      "Zlomky akcií: časový test až od celého kusu (viz Dividendy).",
    ));
  }
  {
    const s = obsah("Jak začít", "Živá ukázka: XTB krok za krokem");
    const kroky = [
      "Otevřít účet: občanka a videohovor",
      "Vyplnit W-8BEN v profilu investora",
      "Poslat peníze z banky (zdarma)",
      `Najít ETF podle ISIN ${FAKTA.spylIsin}`,
      "Založit Investiční plán: 50 % SPYL, 50 % firmy",
      "Nastavit automatický měsíční vklad",
    ];
    for (const [i, k] of kroky.entries()) {
      const y = 1.55 + i * 0.82;
      s.addShape(pres.shapes.OVAL, { x: 0.6, y, w: 0.62, h: 0.62, fill: { color: C.accent1 }, line: { type: "none" }, objectName: `Krok ${i + 1}` });
      T(s, String(i + 1), { x: 0.6, y, w: 0.62, h: 0.62, fontSize: 20, bold: true, color: C.background1, align: "center", valign: "middle" });
      T(s, k, { x: 1.45, y, w: 6.2, h: 0.62, fontSize: 19, valign: "middle" });
    }
    await kartaSObrazkem(s, { x: 8.0, y: 1.6, w: 4.7, h: 2.6, barva: C.accent6, obr: "warning", nadpis: "Pozor na CFD", text: `V aplikaci jsou i CFD, tedy sázky na cenu. Prodělává na nich ${FAKTA.cfdXtb} % účtů. Kupujeme jen skutečné akcie a ETF.` });
    await kartaSObrazkem(s, { x: 8.0, y: 4.45, w: 4.7, h: 1.95, barva: C.accent4, obr: "memo", nadpis: "Nezapomenout W-8BEN", text: "Jinak USA strhne z dividend 30 % místo 15 %." });
    s.addNotes(body(
      "Ukázat v aplikaci XTB (předem vyzkoušet, jestli jde SPYL do Investičního plánu).",
      "Ukázat rozdíl akcie vs. CFD (štítek CFD v aplikaci).",
      "W-8BEN: v profilu investora, platí 3 roky.",
    ));
  }

  /* ======================= ZÁVĚR ======================= */
  pres.addSection({ title: "Závěr" });
  {
    const s = obsah("Závěr", "5 pravidel na ledničku");
    const pravidla = [
      ["Investujte každý měsíc", "Stejnou částku, automaticky, i v krizi."],
      ["Myslete na desítky let", "Peníze potřebné do 5 let do akcií nepatří."],
      ["Neplaťte poplatek z objemu", "Levné ETF a broker bez poplatků."],
      ["Rezerva na spořáku", "3–6 měsíců výdajů, zbytek ať pracuje."],
      ["Při propadu neprodávejte", "Nejlepší dny přicházejí hned po nejhorších."],
    ];
    await obrazek(s, "memo", 10.6, 4.3, 2.0);
    for (const [i, [nadpis, text]] of pravidla.entries()) {
      const y = 1.55 + i * 1.0;
      s.addShape(pres.shapes.OVAL, { x: 0.6, y: y + 0.1, w: 0.7, h: 0.7, fill: { color: C.accent4 }, line: { type: "none" }, objectName: `Pravidlo ${i + 1}` });
      T(s, String(i + 1), { x: 0.6, y: y + 0.1, w: 0.7, h: 0.7, fontSize: 24, bold: true, align: "center", valign: "middle" });
      T(s, [{ text: `${nadpis}  `, options: { bold: true } }, { text: text, options: { color: C.text2 } }], { x: 1.55, y, w: 9.0, h: 0.9, fontSize: 21, valign: "middle" });
    }
    s.addNotes(body("Shrnutí na jeden slajd. Tohle si zapamatujte, i kdybyste zapomněli všechno ostatní."));
  }
  {
    const s = pres.addSlide({ masterName: "SEKCE", sectionTitle: "Závěr" });
    s.addText("Díky! Máte otázky?", { placeholder: "title" });
    s.addText("Všechny kalkulačky si můžete projít doma.", { placeholder: "body" });
    await obrazek(s, "person_raising_hand", 0.8, 0.9, 1.3);
    T(s, WEB_KRATCE, { x: 0.8, y: 5.25, w: 7.5, h: 0.5, fontSize: 22, bold: true, color: C.background2, hyperlink: { url: WEB } });
    T(s, "Nejde o investiční doporučení. Minulé výnosy nezaručují budoucí.", { x: 0.8, y: 5.85, w: 7.5, h: 0.4, fontSize: 13, color: C.background2 });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 9.0, y: 1.35, w: 3.7, h: 3.7, rectRadius: 0.25, fill: { color: C.background1 }, line: { type: "none" }, objectName: "Podklad QR" });
    s.addImage({ data: await qr(WEB), x: 9.25, y: 1.6, w: 3.2, h: 3.2, altText: `QR kód na ${WEB}` });
    s.addNotes(body("Otázky. Nabídnout pomoc s otevřením účtu jednotlivě."));
  }

  await pres.writeFile({ fileName: VYSTUP });
  await applyTheme(VYSTUP, THEME);
  console.log(`Hotovo: ${VYSTUP}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
