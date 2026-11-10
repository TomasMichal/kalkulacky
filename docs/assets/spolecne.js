// Jak nechat peníze pracovat – společné funkce kalkulaček (formátování, ovládací prvky, grafy)

export const INFLACE_CR = 0.031; // průměrná roční inflace ČR 2001–2025 (ČSÚ), viz research/cr-banky-dane.md

/* ---------- Formátování ---------- */

const cele = new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 0 });
const jednoDesetinne = new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 1 });
const NB = " ";

export function castka(x, mena = "Kč") {
  return cele.format(Math.round(x)) + NB + mena;
}

/** Krátký zápis velkých částek: 28,1 mil. Kč / 500 tis. Kč */
export function kratce(x, mena = "Kč") {
  const a = Math.abs(x);
  if (a >= 1e9) return jednoDesetinne.format(x / 1e9) + NB + "mld." + NB + mena;
  if (a >= 1e6) return jednoDesetinne.format(x / 1e6) + NB + "mil." + NB + mena;
  if (a >= 1e4) return cele.format(Math.round(x / 1e3)) + NB + "tis." + NB + mena;
  return castka(x, mena);
}

/** Popisky osy: 0 / 500 tis. / 10 mil. */
export function osa(x) {
  const a = Math.abs(x);
  if (a === 0) return "0";
  if (a >= 1e9) return jednoDesetinne.format(x / 1e9) + NB + "mld.";
  if (a >= 1e6) return jednoDesetinne.format(x / 1e6) + NB + "mil.";
  if (a >= 1e3) return cele.format(x / 1e3) + NB + "tis.";
  return cele.format(x);
}

export function procenta(x, desetinna = 0, znamenko = false) {
  const f = new Intl.NumberFormat("cs-CZ", {
    style: "percent",
    maximumFractionDigits: desetinna,
    minimumFractionDigits: 0,
    signDisplay: znamenko ? "exceptZero" : "auto",
  });
  return f.format(x).replace("-", "−");
}

export function cislo(x, desetinna = 1) {
  return new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: desetinna }).format(x);
}

export function sklonuj(n, tvary) {
  const a = Math.abs(n);
  if (a === 1) return tvary[0];
  if (a >= 2 && a <= 4 && Number.isInteger(a)) return tvary[1];
  return tvary[2];
}

export function roky(n) {
  return `${n}${NB}${sklonuj(n, ["rok", "roky", "let"])}`;
}

/** "po 1 roce" / "po 20 letech" */
export function poLetech(n) {
  return n === 1 ? `po 1${NB}roce` : `po ${n}${NB}letech`;
}

export function mesice(n) {
  return `${n}${NB}${sklonuj(n, ["měsíc", "měsíce", "měsíců"])}`;
}

/** Délka v měsících jako text: 7 měsíců / 2 roky / 5 let a 3 měsíce */
export function delka(mes) {
  if (mes < 12) return mesice(mes);
  const r = Math.floor(mes / 12);
  const m = mes % 12;
  return m ? `${roky(r)} a ${mesice(m)}` : roky(r);
}

export const MESICE = ["leden", "únor", "březen", "duben", "květen", "červen",
  "červenec", "srpen", "září", "říjen", "listopad", "prosinec"];

/** "1929-10" → "říjen 1929" */
export function mesicRok(ym) {
  if (!ym) return "";
  const [r, m] = ym.split("-").map(Number);
  if (!m) return String(r);
  return `${MESICE[m - 1]} ${r}`;
}

/** "2020-03-16" → "16. 3. 2020" */
export function datum(d) {
  if (!d) return "";
  const [r, m, den] = d.split("-").map(Number);
  return den ? `${den}. ${m}. ${r}` : mesicRok(d);
}

/* ---------- Ovládací prvky ---------- */

export function prectiCislo(text) {
  const t = String(text).replace(/\s| /g, "").replace(",", ".").replace(/[^\d.-]/g, "");
  const n = Number(t);
  return Number.isFinite(n) ? n : 0;
}

/** Textové pole s formátováním tisíců. Vrací { hodnota(), nastav(n) }. */
export function ciselnePole(input, { priZmene, min = 0, max = 1e12 } = {}) {
  const omez = (n) => Math.min(max, Math.max(min, n));
  input.setAttribute("inputmode", "numeric");
  input.setAttribute("autocomplete", "off");
  const api = {
    hodnota: () => omez(prectiCislo(input.value)),
    nastav(n) {
      input.value = cele.format(omez(n));
    },
  };
  input.addEventListener("input", () => priZmene && priZmene(api.hodnota()));
  input.addEventListener("blur", () => api.nastav(api.hodnota()));
  api.nastav(api.hodnota());
  return api;
}

/** Skupina tlačítek s data-hodnota. Vrací { nastav(h), hodnota() }. */
export function volby(skupina, priVyberu) {
  const tlacitka = [...skupina.querySelectorAll("button")];
  let aktualni = null;
  const api = {
    hodnota: () => aktualni,
    nastav(h, zavolat = false) {
      aktualni = h;
      for (const t of tlacitka) t.setAttribute("aria-pressed", String(t.dataset.hodnota === String(h)));
      if (zavolat && priVyberu) priVyberu(h);
    },
  };
  for (const t of tlacitka) {
    t.type = "button";
    t.addEventListener("click", () => api.nastav(t.dataset.hodnota, true));
  }
  const vychozi = tlacitka.find((t) => t.getAttribute("aria-pressed") === "true");
  if (vychozi) aktualni = vychozi.dataset.hodnota;
  return api;
}

export async function nactiJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Nepodařilo se načíst ${url}`);
  return r.json();
}

/** Vyplní <table> hlavičkou a řádky (vše přes textContent). */
export function vyplnTabulku(tabulka, hlavicky, radky) {
  tabulka.replaceChildren();
  const thead = tabulka.createTHead();
  const tr = thead.insertRow();
  for (const h of hlavicky) {
    const th = document.createElement("th");
    th.scope = "col";
    th.textContent = h;
    tr.appendChild(th);
  }
  const tbody = tabulka.createTBody();
  for (const r of radky) {
    const radek = tbody.insertRow();
    for (const bunka of r) radek.insertCell().textContent = bunka;
  }
}

/* ---------- Grafy (SVG bez knihoven) ---------- */

const SVGNS = "http://www.w3.org/2000/svg";

function svgEl(tag, atributy = {}, rodic) {
  const e = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(atributy)) e.setAttribute(k, v);
  if (rodic) rodic.appendChild(e);
  return e;
}

function hezkyKrok(max, pocet) {
  if (max <= 0) return 1;
  const surovy = max / pocet;
  const rad = 10 ** Math.floor(Math.log10(surovy));
  const n = surovy / rad;
  const k = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return k * rad;
}

function vytvorLegendu(serie, tvar = "car") {
  const ul = document.createElement("ul");
  ul.className = "legenda";
  for (const s of serie) {
    if (s.vLegende === false) continue;
    const li = document.createElement("li");
    const klic = document.createElement("span");
    klic.className = tvar;
    klic.style.background = s.barva;
    const text = document.createElement("span");
    text.textContent = s.nazev;
    li.append(klic, text);
    ul.appendChild(li);
  }
  return ul;
}

function naplnBublinu(bublina, titulek, radky) {
  bublina.replaceChildren();
  const t = document.createElement("div");
  t.className = "titulek";
  t.textContent = titulek;
  bublina.appendChild(t);
  for (const r of radky) {
    const radek = document.createElement("div");
    radek.className = "radek";
    if (r.barva) {
      const car = document.createElement("span");
      car.className = "car";
      car.style.background = r.barva;
      radek.appendChild(car);
    }
    const hodnota = document.createElement("strong");
    hodnota.textContent = r.hodnota;
    const jmeno = document.createElement("span");
    jmeno.className = "jmeno";
    jmeno.textContent = r.nazev || "";
    radek.append(hodnota, jmeno);
    bublina.appendChild(radek);
  }
}

function umistiBublinu(bublina, x, sirka, horni = 8) {
  bublina.style.display = "block";
  const w = bublina.offsetWidth;
  let left = x + 14;
  if (left + w > sirka) left = Math.max(0, x - w - 14);
  bublina.style.left = `${left}px`;
  bublina.style.top = `${horni}px`;
}

/**
 * Čárový graf s kurzorem.
 * nastaveni = {
 *   delka: počet bodů,
 *   serie: [{ nazev, barva, hodnoty: [], plocha: bool, vLegende: bool }],
 *   skladany: bool (plochy na sobě),
 *   titulek(i): text bubliny, formatHodnoty(v), formatOsy(v),
 *   tickyX(sirka) → [{ i, text }], znacky: [{ serie, i, text }],
 *   popis: text pro čtečky obrazovky
 * }
 */
export function carovyGraf(kontejner, nastaveni) {
  let stav = { ...nastaveni };
  const obal = document.createElement("div");
  obal.className = "graf";
  let legenda = vytvorLegendu(stav.serie);
  const svg = svgEl("svg", { role: "img", tabindex: "0" });
  const bublina = document.createElement("div");
  bublina.className = "bublina";
  bublina.setAttribute("aria-hidden", "true");
  obal.append(legenda, svg, bublina);
  kontejner.appendChild(obal);

  let aktivni = null;
  let geometrie = null;

  function vrcholy() {
    // Při skládání se hodnoty sčítají v pořadí sérií.
    const n = stav.delka;
    const horni = [];
    const dolni = [];
    let predchozi = new Array(n).fill(0);
    for (const s of stav.serie) {
      if (stav.skladany) {
        const h = s.hodnoty.map((v, i) => predchozi[i] + v);
        horni.push(h);
        dolni.push(predchozi);
        predchozi = h;
      } else {
        horni.push(s.hodnoty);
        dolni.push(null);
      }
    }
    return { horni, dolni };
  }

  function vykresli() {
    const W = obal.clientWidth;
    if (!W) return;
    const H = stav.vyska || (W < 520 ? 260 : 320);
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("height", H);
    svg.setAttribute("aria-label", stav.popis || "");
    svg.replaceChildren();

    const n = stav.delka;
    const { horni, dolni } = vrcholy();
    let maxY = 0;
    for (const h of horni) for (const v of h) if (v > maxY) maxY = v;
    const krok = hezkyKrok(maxY || 1, W < 520 ? 4 : 5);
    const vrchY = Math.max(krok, Math.ceil((maxY || 1) / krok) * krok);
    const ticky = [];
    for (let v = 0; v <= vrchY + krok / 2; v += krok) ticky.push(v);
    const formatOsy = stav.formatOsy || osa;
    const nejdelsi = Math.max(...ticky.map((t) => formatOsy(t).length));
    const ML = Math.max(34, nejdelsi * 7 + 12);
    const MR = 14, MT = 12, MB = 28;
    const sirka = W - ML - MR;
    const vyska = H - MT - MB;
    const sx = (i) => ML + (n <= 1 ? sirka / 2 : (i / (n - 1)) * sirka);
    const sy = (v) => MT + vyska - (v / vrchY) * vyska;
    geometrie = { sx, sy, ML, MR, MT, W, H, n, horni };

    const mrizka = svgEl("g", { class: "mrizka" }, svg);
    const osaG = svgEl("g", { class: "osa" }, svg);
    for (const t of ticky) {
      const y = Math.round(sy(t)) + 0.5;
      if (t > 0) svgEl("line", { x1: ML, x2: W - MR, y1: y, y2: y }, mrizka);
      const txt = svgEl("text", { x: ML - 8, y: y + 4, "text-anchor": "end" }, osaG);
      txt.textContent = formatOsy(t);
    }
    svgEl("line", { class: "zakladna", x1: ML, x2: W - MR, y1: Math.round(sy(0)) + 0.5, y2: Math.round(sy(0)) + 0.5 }, svg);

    const tickyX = stav.tickyX ? stav.tickyX(sirka) : [];
    for (const t of tickyX) {
      const x = sx(t.i);
      const anchor = t.i === 0 ? "start" : t.i === n - 1 ? "end" : "middle";
      const txt = svgEl("text", { x, y: H - 8, "text-anchor": anchor }, osaG);
      txt.textContent = t.text;
    }

    // Plochy
    stav.serie.forEach((s, k) => {
      if (!s.plocha) return;
      const h = horni[k];
      const d = dolni[k];
      let cesta = `M${sx(0)},${sy(h[0])}`;
      for (let i = 1; i < n; i++) cesta += `L${sx(i)},${sy(h[i])}`;
      for (let i = n - 1; i >= 0; i--) cesta += `L${sx(i)},${sy(d ? d[i] : 0)}`;
      svgEl("path", { d: cesta + "Z", fill: s.barva, "fill-opacity": s.pruhlednost ?? 0.14, stroke: "none" }, svg);
    });
    // Čáry
    stav.serie.forEach((s, k) => {
      const h = horni[k];
      let cesta = `M${sx(0)},${sy(h[0])}`;
      for (let i = 1; i < n; i++) cesta += `L${sx(i)},${sy(h[i])}`;
      svgEl("path", {
        d: cesta, fill: "none", stroke: s.barva, "stroke-width": s.sila || 2,
        "stroke-linejoin": "round", "stroke-linecap": "round",
      }, svg);
    });
    // Koncové body
    stav.serie.forEach((s, k) => {
      if (s.koncovyBod === false) return;
      svgEl("circle", { cx: sx(n - 1), cy: sy(horni[k][n - 1]), r: 4, fill: s.barva, stroke: "var(--card)", "stroke-width": 2 }, svg);
    });
    // Značky (např. nejhorší chvíle)
    for (const z of stav.znacky || []) {
      const x = sx(z.i);
      const y = sy(horni[z.serie][z.i]);
      svgEl("circle", { cx: x, cy: y, r: 5, fill: stav.serie[z.serie].barva, stroke: "var(--card)", "stroke-width": 2 }, svg);
      if (z.text) {
        const vpravo = x < ML + sirka * 0.7;
        // Popisek pod bodem, u spodního okraje grafu nad bodem
        const pod = y + 18 <= MT + vyska - 6;
        const txt = svgEl("text", {
          x: x + (vpravo ? 10 : -10), y: pod ? y + 18 : y - 10,
          "text-anchor": vpravo ? "start" : "end",
          fill: "var(--ink-2)", "font-size": 13, "font-weight": 700,
        }, svg);
        txt.textContent = z.text;
      }
    }

    // Vrstva kurzoru
    const kurzorG = svgEl("g", { "pointer-events": "none" }, svg);
    geometrie.kurzorG = kurzorG;
    const plocha = svgEl("rect", { x: ML, y: MT, width: sirka, height: vyska, fill: "transparent" }, svg);
    plocha.addEventListener("pointermove", (e) => {
      const r = svg.getBoundingClientRect();
      const px = ((e.clientX - r.left) / r.width) * W;
      const i = Math.round(((px - ML) / sirka) * (n - 1));
      ukazKurzor(Math.max(0, Math.min(n - 1, i)));
    });
    plocha.addEventListener("pointerleave", skryjKurzor);
    if (aktivni !== null && aktivni < n) ukazKurzor(aktivni);
  }

  function ukazKurzor(i) {
    if (!geometrie) return;
    aktivni = i;
    const { sx, sy, MT, H, horni, kurzorG, W } = geometrie;
    kurzorG.replaceChildren();
    const x = sx(i);
    svgEl("line", { class: "kurzor", x1: x, x2: x, y1: MT, y2: H - 28 }, kurzorG);
    stav.serie.forEach((s, k) => {
      svgEl("circle", { cx: x, cy: sy(horni[k][i]), r: 4.5, fill: s.barva, stroke: "var(--card)", "stroke-width": 2 }, kurzorG);
    });
    const fmt = stav.formatHodnoty || ((v) => kratce(v));
    const radky = stav.serie.map((s) => ({ barva: s.barva, nazev: s.nazev, hodnota: fmt(s.hodnoty[i], s) }));
    if (stav.extraRadky) radky.push(...stav.extraRadky(i));
    naplnBublinu(bublina, stav.titulek ? stav.titulek(i) : String(i), stav.skladany ? radky.reverse() : radky);
    const pomer = obal.clientWidth / W;
    umistiBublinu(bublina, x * pomer, obal.clientWidth, (legenda.offsetHeight || 0) + 8);
  }

  function skryjKurzor() {
    aktivni = null;
    bublina.style.display = "none";
    if (geometrie && geometrie.kurzorG) geometrie.kurzorG.replaceChildren();
  }

  svg.addEventListener("keydown", (e) => {
    if (!geometrie) return;
    const n = geometrie.n;
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const i = aktivni === null ? n - 1 : aktivni + (e.key === "ArrowRight" ? 1 : -1);
      ukazKurzor(Math.max(0, Math.min(n - 1, i)));
    } else if (e.key === "Escape") skryjKurzor();
  });
  svg.addEventListener("focus", () => { if (geometrie) ukazKurzor(aktivni ?? geometrie.n - 1); });
  svg.addEventListener("blur", skryjKurzor);

  new ResizeObserver(() => vykresli()).observe(obal);

  return {
    aktualizuj(zmeny) {
      const jineSerie = zmeny.serie && zmeny.serie.map((s) => s.nazev + s.barva).join() !== stav.serie.map((s) => s.nazev + s.barva).join();
      stav = { ...stav, ...zmeny };
      if (jineSerie) {
        const nova = vytvorLegendu(stav.serie);
        legenda.replaceWith(nova);
        legenda = nova;
      }
      if (aktivni !== null && aktivni >= stav.delka) aktivni = null;
      vykresli();
    },
  };
}

/**
 * Sloupcový graf s jedním zvýrazněným sloupcem.
 * nastaveni = { popisky: [], hodnoty: [], vybrany, maxY, formatOsy, popisOsyX(i) → text|null,
 *               bublina(i) → { titulek, radky }, priVyberu(i), popis, stitekVybraneho(i) }
 */
export function sloupcovyGraf(kontejner, nastaveni) {
  let stav = { ...nastaveni };
  const obal = document.createElement("div");
  obal.className = "graf";
  const svg = svgEl("svg", { role: "img", tabindex: "0" });
  const bublina = document.createElement("div");
  bublina.className = "bublina";
  bublina.setAttribute("aria-hidden", "true");
  obal.append(svg, bublina);
  kontejner.appendChild(obal);

  function vykresli() {
    const W = obal.clientWidth;
    if (!W) return;
    const H = stav.vyska || (W < 520 ? 230 : 270);
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("height", H);
    svg.setAttribute("aria-label", stav.popis || "");
    svg.replaceChildren();
    const n = stav.hodnoty.length;
    const formatOsy = stav.formatOsy || ((v) => procenta(v));
    const krok = hezkyKrok(stav.maxY, 5);
    const ticky = [];
    for (let v = 0; v <= stav.maxY + krok / 2; v += krok) ticky.push(v);
    const ML = 44, MR = 8, MT = 26, MB = 30;
    const sirka = W - ML - MR;
    const vyska = H - MT - MB;
    const pas = sirka / n;
    const sloupec = Math.min(24, Math.max(3, pas - 2));
    const sy = (v) => MT + vyska - (v / stav.maxY) * vyska;
    const zaklad = sy(0);

    const mrizka = svgEl("g", { class: "mrizka" }, svg);
    const osaG = svgEl("g", { class: "osa" }, svg);
    for (const t of ticky) {
      const y = Math.round(sy(t)) + 0.5;
      if (t > 0) svgEl("line", { x1: ML, x2: W - MR, y1: y, y2: y }, mrizka);
      const txt = svgEl("text", { x: ML - 8, y: y + 4, "text-anchor": "end" }, osaG);
      txt.textContent = formatOsy(t);
    }

    for (let i = 0; i < n; i++) {
      const v = stav.hodnoty[i];
      const x = ML + pas * i + (pas - sloupec) / 2;
      const y = sy(v);
      const vybrany = i === stav.vybrany;
      if (v > 0) {
        const r = Math.min(sloupec >= 8 ? 4 : 2, zaklad - y);
        const d = `M${x},${zaklad}V${y + r}Q${x},${y} ${x + r},${y}H${x + sloupec - r}Q${x + sloupec},${y} ${x + sloupec},${y + r}V${zaklad}Z`;
        svgEl("path", { d, fill: vybrany ? "var(--s1)" : "var(--bar-off)" }, svg);
      }
      if (vybrany) {
        const t = svgEl("text", {
          x: Math.min(W - MR - 4, Math.max(ML + 4, x + sloupec / 2)), y: Math.max(14, y - 8),
          "text-anchor": "middle", fill: "var(--ink)", "font-size": 14, "font-weight": 800,
        }, svg);
        t.textContent = stav.stitekVybraneho ? stav.stitekVybraneho(i) : formatOsy(v);
      }
      const popis = stav.popisOsyX ? stav.popisOsyX(i, pas) : null;
      if (popis) {
        const t = svgEl("text", { x: x + sloupec / 2, y: H - 8, "text-anchor": "middle" }, osaG);
        t.textContent = popis;
      }
      const zasah = svgEl("rect", { x: ML + pas * i, y: MT - 20, width: pas, height: vyska + 20, fill: "transparent", style: "cursor:pointer" }, svg);
      zasah.addEventListener("pointerenter", () => {
        const b = stav.bublina(i);
        naplnBublinu(bublina, b.titulek, b.radky);
        const pomer = obal.clientWidth / W;
        umistiBublinu(bublina, (x + sloupec / 2) * pomer, obal.clientWidth, 0);
      });
      zasah.addEventListener("pointerleave", () => { bublina.style.display = "none"; });
      zasah.addEventListener("click", () => stav.priVyberu && stav.priVyberu(i));
    }
    svgEl("line", { class: "zakladna", x1: ML, x2: W - MR, y1: Math.round(zaklad) + 0.5, y2: Math.round(zaklad) + 0.5 }, svg);
  }

  svg.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const n = stav.hodnoty.length;
    const i = Math.max(0, Math.min(n - 1, stav.vybrany + (e.key === "ArrowRight" ? 1 : -1)));
    if (stav.priVyberu) stav.priVyberu(i);
  });

  new ResizeObserver(() => vykresli()).observe(obal);

  return {
    aktualizuj(zmeny) {
      stav = { ...stav, ...zmeny };
      vykresli();
    },
  };
}
