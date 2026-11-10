"""Výpočet statistik pro prezentaci a webové nástroje.

Spuštění (z kořene projektu, po stahni_data.py a priprav_data.py):
    .venv/bin/python -I scripts/statistiky.py            # zapíše data/statistiky.json
    .venv/bin/python -I scripts/statistiky.py --md       # navíc vypíše tabulky v Markdownu

Vstupy:
  data/sp500_mesicne.csv (Shiller), data/sp500_rocne.csv (Damodaran), data/usdczk.csv (ČNB),
  data/raw/yahoo/gspc_denne.csv a sp500tr_denne.csv (Yahoo Finance, nepublikují se).
Výstup:
  data/statistiky.json  jediný zdroj čísel pro research/trh.md, slajdy a webové nástroje.

Konvence:
  - "výnos" = celkový výnos s reinvestovanými dividendami (total return), pokud není řečeno jinak,
  - "reálně" = očištěno o americkou inflaci CPI-U (Shiller), tj. kupní síla v USD,
  - klouzavá okna se překrývají (každý měsíc / každý obchodní den je jeden začátek),
  - roční průměr = geometrický (CAGR).
"""
import datetime as dt
import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
RAW = DATA / "raw"

HORIZONTY_TABULKA = [("1 měsíc", 1), ("1 rok", 12), ("3 roky", 36), ("5 let", 60), ("10 let", 120),
                     ("15 let", 180), ("20 let", 240)]
HORIZONTY_NASTROJ = [1, 3, 6] + [12 * y for y in range(1, 31)]

PROPADY = [  # (název, okno pro hledání dna)
    ("1929 (Velká hospodářská krize)", "1929-09-01", "1932-12-31"),
    ("1973–74 (ropná krize, inflace)", "1973-01-01", "1974-12-31"),
    ("2000–02 (dot-com bublina)", "2000-01-01", "2002-12-31"),
    ("2007–09 (finanční krize)", "2007-07-01", "2009-06-30"),
    ("2020 (covid)", "2020-02-01", "2020-04-30"),
    ("2022 (inflace, růst sazeb)", "2022-01-01", "2022-12-31"),
    ("jaro 2025 (cla)", "2025-02-01", "2025-05-31"),
]

ZMESKANE_OKNA = [  # (popis, začátek, konec) – investice na close prvního dne, ocenění na close posledního
    ("posledních 20 let", "2006-11-09", "2026-11-09"),
    # J.P. Morgan Guide to Retirement 2026: 2. 1. 2006 – 31. 12. 2025 (2. 1. 2006 se neobchodovalo,
    # první výnos je 3. 1. 2006, tj. základem je close 30. 12. 2005)
    ("kalendářních 20 let 2006–2025 (stejné období jako J.P. Morgan Guide to Retirement 2026)",
     "2005-12-30", "2025-12-31"),
]

PREDPOKLAD_AKCIE = 0.07       # navržený roční výnos pro modelové příklady v Kč (zdůvodnění v research/trh.md)
PREDPOKLAD_SPORAK = 0.03      # hrubý úrok spořicího účtu
DAN_UROKY = 0.15              # srážková daň z úroků v ČR
INFLACE_CR = 0.02             # inflační cíl ČNB, pro přepočet na dnešní peníze
MESICNI_CASTKY = [10_000, 15_000, 20_000]
JEDNORAZOVE = 500_000
ROKY = [10, 20, 30]


# =========================================================================== načtení dat
def load_shiller() -> pd.DataFrame:
    df = pd.read_csv(DATA / "sp500_mesicne.csv")
    df["mesic"] = pd.PeriodIndex(df["datum"], freq="M")
    return df.set_index("mesic")


def load_yahoo(name: str) -> pd.Series:
    df = pd.read_csv(RAW / "yahoo" / f"{name}_denne.csv", parse_dates=["Date"], index_col="Date")
    return df["Close"].astype(float).sort_index()


def load_fx() -> pd.Series:
    df = pd.read_csv(DATA / "usdczk.csv", parse_dates=["datum"], index_col="datum")
    return df["usdczk"].sort_index()


def load_damodaran() -> pd.DataFrame:
    return pd.read_csv(DATA / "sp500_rocne.csv").set_index("rok")


# =========================================================================== pomocné funkce
def cagr(start_val: float, end_val: float, years: float) -> float:
    return (end_val / start_val) ** (1.0 / years) - 1.0


def years_between(a: pd.Timestamp, b: pd.Timestamp) -> float:
    return (b - a).days / 365.25


def r(x, nd=4):
    """Zaokrouhlení pro JSON (None zůstává None)."""
    if x is None or (isinstance(x, float) and np.isnan(x)):
        return None
    return round(float(x), nd)


def d(x) -> str:
    return pd.Timestamp(x).strftime("%Y-%m-%d")


def synthetic_daily_tr(price: pd.Series, sh: pd.DataFrame) -> tuple[pd.Series, pd.Series]:
    """Denní total return index z ^GSPC (cena) + Shillerových měsíčních dividend.

    Denní dividendový výnos = (D_m / 12) / P_m / počet obchodních dní v měsíci m,
    kde D_m je Shillerova roční dividenda a P_m měsíční průměr ceny. Pro měsíce za koncem
    Shillerovy řady se použije poslední známý výnos.
    Vrací (TR index nominální, deflátor CPI na denní bázi = CPI interpolovaný geometricky).
    """
    months = price.index.to_period("M")
    dy_m = (sh["dividenda"] / 12.0) / sh["cena"]
    infl_m = sh["cpi"] / sh["cpi"].shift(1)
    n_days = pd.Series(1, index=price.index).groupby(months).transform("count").to_numpy()
    dy = dy_m.reindex(months).ffill().to_numpy()
    dy = np.where(np.isnan(dy), dy_m.dropna().iloc[-1], dy)
    pi = infl_m.reindex(months).to_numpy()
    pi = np.where(np.isnan(pi), infl_m.dropna().iloc[-1], pi)
    pr = price.pct_change().fillna(0.0).to_numpy()
    tr_ret = pr + dy / n_days
    tr_ret[0] = 0.0
    tr = pd.Series(np.cumprod(1.0 + tr_ret), index=price.index)
    defl_ret = pi ** (1.0 / n_days)
    defl_ret[0] = 1.0
    deflator = pd.Series(np.cumprod(defl_ret), index=price.index)
    return tr, deflator


def daily_deflator(index: pd.DatetimeIndex, sh: pd.DataFrame) -> pd.Series:
    """CPI deflátor pro libovolnou denní řadu (geometrická interpolace měsíční inflace)."""
    months = index.to_period("M")
    infl_m = sh["cpi"] / sh["cpi"].shift(1)
    n_days = pd.Series(1, index=index).groupby(months).transform("count").to_numpy()
    pi = infl_m.reindex(months).to_numpy()
    pi = np.where(np.isnan(pi), infl_m.dropna().iloc[-1], pi)
    f = pi ** (1.0 / n_days)
    f[0] = 1.0
    return pd.Series(np.cumprod(f), index=index)


def month_end(s: pd.Series) -> pd.Series:
    """Hodnota k poslednímu obchodnímu dni každého měsíce (index = Period M)."""
    me = s.groupby(s.index.to_period("M")).last()
    return me


def last_complete_month_end(s: pd.Series) -> pd.Timestamp:
    last = s.index[-1]
    if last + pd.offsets.MonthEnd(0) - last > pd.Timedelta(days=3):
        prev = s.loc[: (last - pd.offsets.MonthBegin(1)) - pd.Timedelta(days=1)]
        return prev.index[-1]
    return last


def asof(s: pd.Series, date) -> tuple[pd.Timestamp, float]:
    """Poslední hodnota k datu (včetně)."""
    sub = s.loc[:pd.Timestamp(date)]
    return sub.index[-1], float(sub.iloc[-1])


# =========================================================================== 1. pravděpodobnost ztráty
def rolling_returns(values: np.ndarray, h: int) -> np.ndarray:
    return values[h:] / values[:-h] - 1.0


def horizon_stats(values: np.ndarray, labels, h: int, periods_per_year: float) -> dict:
    rets = rolling_returns(values, h)
    years = h / periods_per_year
    ann = (1.0 + rets) ** (1.0 / years) - 1.0 if years >= 1 else None
    i_min, i_max = int(np.argmin(rets)), int(np.argmax(rets))
    med = float(np.median(rets))
    out = {
        "pocet_oken": int(len(rets)),
        "pravdepodobnost_ztraty": r(np.mean(rets < 0)),
        "nejhorsi_celkem": r(rets[i_min]),
        "nejhorsi_start": str(labels[i_min]),
        "median_celkem": r(med),
        "nejlepsi_celkem": r(rets[i_max]),
        "nejlepsi_start": str(labels[i_max]),
        "percentily_celkem": {str(p): r(np.percentile(rets, p)) for p in (5, 25, 75, 95)},
    }
    if ann is not None:
        out.update({"nejhorsi_rocne": r(ann[i_min]), "median_rocne": r((1 + med) ** (1 / years) - 1),
                    "nejlepsi_rocne": r(ann[i_max])})
    if years >= 5:
        # souvislé úseky začátků oken, které skončily ve ztrátě (např. "1929-01 až 1929-11")
        loss = rets < 0
        ranges, start = [], None
        for k, flag in enumerate(loss):
            if flag and start is None:
                start = k
            if (not flag or k == len(loss) - 1) and start is not None:
                end = k if flag else k - 1
                ranges.append(f"{labels[start]} až {labels[end]}" if end > start else str(labels[start]))
                start = None
        out["ztratove_starty"] = ranges
    return out


def loss_probability(sh: pd.DataFrame, tr_d: pd.Series, defl_d: pd.Series, sp_tr: pd.Series,
                     gspc: pd.Series, dam: pd.DataFrame) -> dict:
    res = {}
    labels = [str(p) for p in sh.index]

    # A) Shiller měsíčně 1871– (hlavní)
    main = {}
    for real, col in (("nominalne", "tr_nominalni"), ("realne", "tr_realny")):
        vals = sh[col].to_numpy()
        main[real] = {name: horizon_stats(vals, labels, h, 12) for name, h in HORIZONTY_TABULKA}
    res["shiller_1871"] = {
        "popis": "Shiller, měsíční průměry cen + dividendy, klouzavá okna po měsících",
        "obdobi": f"{sh.index[0]} až {sh.index[-1]}", **main}

    # B) 1 den
    def one_day(series: pd.Series, deflator: pd.Series | None) -> dict:
        ret = series.pct_change().dropna()
        out = {"obdobi": f"{d(series.index[0])} až {d(series.index[-1])}", "pocet_dni": int(len(ret)),
               "pravdepodobnost_ztraty": r(np.mean(ret < 0)), "nejhorsi": r(ret.min()),
               "nejhorsi_den": d(ret.idxmin()), "median": r(ret.median(), 5), "nejlepsi": r(ret.max()),
               "nejlepsi_den": d(ret.idxmax()),
               "percentily": {str(p): r(np.percentile(ret, p), 5) for p in (5, 25, 75, 95)}}
        if deflator is not None:
            real = (series / deflator.reindex(series.index)).pct_change().dropna()
            out["pravdepodobnost_ztraty_realne"] = r(np.mean(real < 0))
        return out
    res["1_den"] = {
        "sp500tr_1988": one_day(sp_tr, daily_deflator(sp_tr.index, sh)),
        "synteticky_tr_1928": one_day(tr_d, defl_d),
        "cenovy_gspc_1928": one_day(gspc, None),
    }

    # C) kontrola: konec měsíce z denních dat 1928– (bez zkreslení měsíčními průměry)
    end_full = last_complete_month_end(tr_d)
    me_tr = month_end(tr_d.loc[:end_full])
    me_def = month_end(defl_d.loc[:end_full])
    me_labels = [str(p) for p in me_tr.index]
    chk = {}
    for real, vals in (("nominalne", me_tr.to_numpy()), ("realne", (me_tr / me_def).to_numpy())):
        chk[real] = {name: horizon_stats(vals, me_labels, h, 12) for name, h in HORIZONTY_TABULKA}
    res["denni_konec_mesice_1928"] = {
        "popis": "^GSPC denně + Shillerovy dividendy (syntetický TR), hodnoty ke konci měsíce",
        "obdobi": f"{me_tr.index[0]} až {me_tr.index[-1]}", **chk}

    # D) kontrola: Damodaran kalendářní roky 1928–
    dam_res = {}
    for real, col in (("nominalne", "vynos_s_dividendami"), ("realne", "realny_vynos")):
        idx = np.concatenate([[1.0], np.cumprod(1.0 + dam[col].to_numpy())])
        lab = [str(y) for y in dam.index]
        dam_res[real] = {f"{y} " + ("rok" if y == 1 else ("roky" if y < 5 else "let")):
                         horizon_stats(idx, lab, y, 1) for y in (1, 3, 5, 10, 15, 20)}
    res["damodaran_kalendarni_roky"] = {
        "popis": "Damodaran, kalendářní roky (okno začíná 1. ledna)",
        "obdobi": f"{dam.index[0]} až {dam.index[-1]}", **dam_res}

    # E) pro nástroj: jemnější horizonty z obou měsíčních řad
    def tool_series(vals_nom, vals_real, lab):
        rows = []
        for h in HORIZONTY_NASTROJ:
            if h >= len(vals_nom):
                continue
            n = horizon_stats(vals_nom, lab, h, 12)
            rr = horizon_stats(vals_real, lab, h, 12)
            rows.append({"mesicu": h, "nominalne": n, "realne": rr})
        return rows
    res["nastroj"] = {
        "popis": "Řada pro posuvník v nástroji 'Pravděpodobnost ztráty'. Celkem = celkový výnos za okno, "
                 "rocne = průměrný roční (CAGR). Hlavní: shiller_1871; kontrolní: denni_1928.",
        "shiller_1871": tool_series(sh["tr_nominalni"].to_numpy(), sh["tr_realny"].to_numpy(), labels),
        "denni_1928": tool_series(me_tr.to_numpy(), (me_tr / me_def).to_numpy(), me_labels),
        "1_den": res["1_den"]["synteticky_tr_1928"],
    }
    return res


# =========================================================================== 2. propady
def episode(s: pd.Series, w0: str, w1: str) -> dict:
    runmax = s.cummax()
    dd = s / runmax - 1.0
    w = dd.loc[w0:w1]
    trough = w.idxmin()
    peak_val = runmax.loc[trough]
    before = s.loc[:trough]
    peak = before[before >= peak_val * (1 - 1e-12)].index[-1]
    after = s.loc[trough:]
    rec = after[after >= peak_val]
    rec_date = rec.index[0] if len(rec) else None
    return {
        "vrchol": d(peak), "dno": d(trough), "propad": r(w.min()),
        "vrchol_dno_mesicu": r((trough - peak).days / 30.44, 1),
        "navrat": d(rec_date) if rec_date is not None else None,
        "dno_navrat_let": r(years_between(trough, rec_date), 1) if rec_date is not None else None,
        "vrchol_navrat_let": r(years_between(peak, rec_date), 1) if rec_date is not None else None,
    }


def episode_from_peak(s: pd.Series, peak: str, w1: str) -> dict:
    """Propad od zadaného vrcholu (např. vrcholu nominálního TR) ke dnu a návrat na jeho hodnotu."""
    peak = pd.Timestamp(peak)
    peak_val = float(s.loc[peak])
    w = s.loc[peak:w1]
    trough = w.idxmin()
    after = s.loc[trough:]
    rec = after[after >= peak_val]
    rec_date = rec.index[0] if len(rec) else None
    return {
        "vrchol": d(peak), "dno": d(trough), "propad": r(float(s.loc[trough]) / peak_val - 1),
        "vrchol_dno_mesicu": r((trough - peak).days / 30.44, 1),
        "navrat": d(rec_date) if rec_date is not None else None,
        "dno_navrat_let": r(years_between(trough, rec_date), 1) if rec_date is not None else None,
        "vrchol_navrat_let": r(years_between(peak, rec_date), 1) if rec_date is not None else None,
    }


def drawdowns(gspc: pd.Series, sp_tr: pd.Series, tr_syn: pd.Series, defl_syn: pd.Series,
              sh: pd.DataFrame) -> dict:
    tr_sp_defl = daily_deflator(sp_tr.index, sh)
    out = []
    for name, w0, w1 in PROPADY:
        use_official = pd.Timestamp(w0) > sp_tr.index[0] + pd.Timedelta(days=400)
        tr = sp_tr if use_official else tr_syn
        defl = tr_sp_defl if use_official else defl_syn
        # monthly real (Shiller) pro kontext
        shm = sh["tr_realny"].copy()
        shm.index = shm.index.to_timestamp(how="end").normalize()
        tr_ep = episode(tr, w0, w1)
        out.append({
            "nazev": name,
            "cena_bez_dividend": episode(gspc, w0, w1),
            "s_dividendami": tr_ep,
            "s_dividendami_realne": episode_from_peak(tr / defl, tr_ep["vrchol"], w1),
            "zdroj_s_dividendami": "^SP500TR (Yahoo)" if use_official else "syntetický TR (^GSPC + Shillerovy dividendy)",
            "shiller_mesicne_realne": episode(shm, w0, w1),
        })
    return {"popis": "Denní uzavírací ceny. Propad = od posledního historického maxima ke dnu. "
                     "Návrat = první den, kdy index znovu dosáhl hodnoty předchozího vrcholu. "
                     "Reálně = s dividendami očištěno o CPI, měřeno od vrcholu nominálního TR téže epizody. "
                     "shiller_mesicne_realne = jen pro ilustraci, měsíční průměry propady výrazně podhodnocují.",
            "epizody": out}


# =========================================================================== 3. ztracená dekáda
def irr_monthly(cashflows: np.ndarray) -> float:
    """IRR pro měsíční toky (záporné = vklad, kladné = výsledná hodnota), přepočteno na roční."""
    lo, hi = -0.5, 0.5
    def npv(rate):
        t = np.arange(len(cashflows))
        return np.sum(cashflows / (1 + rate) ** t)
    for _ in range(200):
        mid = (lo + hi) / 2
        if npv(lo) * npv(mid) <= 0:
            hi = mid
        else:
            lo = mid
    return (1 + (lo + hi) / 2) ** 12 - 1


def lost_decade(sp_tr: pd.Series, gspc: pd.Series, sh: pd.DataFrame, fx: pd.Series) -> dict:
    res = {"popis": "Jednorázově: celá částka na close 31. 12. 1999. Pravidelně (DCA): stejná částka na "
                    "konci každého měsíce od 12/1999 (= začátek 1/2000), poslední vklad na začátku "
                    "posledního měsíce. Ocenění na close posledního obchodního dne období. "
                    "Měsíční vklad 1 000 (USD nebo Kč), jednorázově stejný celkový objem.",
           "obdobi": []}
    cpi = sh["cpi"]
    fx_me = month_end(fx)
    for end in ("2009-12", "2013-12"):
        row = {"do": end}
        for label, s, cur in (("s_dividendami_usd", sp_tr, "USD"), ("bez_dividend_usd", gspc, "USD"),
                              ("s_dividendami_czk", sp_tr, "CZK")):
            me = month_end(s)
            if cur == "CZK":
                me = me * fx_me.reindex(me.index)
            seg = me.loc[pd.Period("1999-12"):pd.Period(end)]
            n = len(seg) - 1  # počet vkladů
            vals = seg.to_numpy()
            units = (1000.0 / vals[:-1]).sum()
            dca_end = units * vals[-1]
            invested = 1000.0 * n
            lump_end = invested * vals[-1] / vals[0]
            # toky: n vkladů na začátku měsíců 0..n-1, hodnota na konci měsíce n
            cf2 = np.concatenate([np.full(n, -1000.0), [dca_end]])
            years = n / 12
            cpi_ratio = cpi.loc[pd.Period(end)] / cpi.loc[pd.Period("1999-12")]
            row[label] = {
                "vlozeno": r(invested, 0), "pocet_vkladu": n,
                "jednorazove_hodnota": r(lump_end, 0), "jednorazove_zisk": r(lump_end / invested - 1),
                "jednorazove_rocne": r(cagr(1, vals[-1] / vals[0], years)),
                "pravidelne_hodnota": r(dca_end, 0), "pravidelne_zisk": r(dca_end / invested - 1),
                "pravidelne_rocne_irr": r(irr_monthly(cf2)),
            }
            if cur == "USD":
                row[label]["jednorazove_realne_zisk"] = r(lump_end / invested / cpi_ratio - 1)
        res["obdobi"].append(row)
    return res


# =========================================================================== 4. zmeškané nejlepší dny
def missed_days(sp_tr: pd.Series, gspc: pd.Series) -> dict:
    out = []
    for popis, a, b in ZMESKANE_OKNA:
        row = {"okno": popis}
        for label, s in (("s_dividendami", sp_tr), ("bez_dividend", gspc)):
            seg = s.loc[a:b]
            start, end = seg.index[0], seg.index[-1]
            ret = seg.pct_change().dropna()
            years = years_between(start, end)
            order = ret.sort_values(ascending=False)
            res = {"zacatek": d(start), "konec": d(end), "obchodnich_dni": int(len(ret)),
                   "pocatecni_castka": 10_000}
            fully = 10_000 * float(np.prod(1 + ret))
            res["plne_investovan"] = {"hodnota": r(fully, 0), "rocne": r(cagr(10_000, fully, years))}
            for n in (10, 20, 30, 40, 50, 60):
                kept = ret.drop(order.index[:n])
                v = 10_000 * float(np.prod(1 + kept))
                res[f"bez_{n}_nejlepsich"] = {"hodnota": r(v, 0), "rocne": r(cagr(10_000, v, years))}
                both = ret.drop(order.index[:n]).drop(order.index[-n:])
                vb = 10_000 * float(np.prod(1 + both))
                res[f"bez_{n}_nejlepsich_i_nejhorsich"] = {"hodnota": r(vb, 0), "rocne": r(cagr(10_000, vb, years))}
            # blízkost nejlepších a nejhorších dní
            prox = {}
            for n in (10, 20, 30):
                best = order.index[:n]
                worst = order.index[-n:]
                close = [bd for bd in best if np.min(np.abs((worst - bd).days)) <= 14]
                prox[str(n)] = {"nejlepsich_do_2_tydnu_od_nejhorsich": len(close), "z": n}
            res["blizkost"] = prox
            res["10_nejlepsich_dni"] = [{"den": d(k), "vynos": r(v)} for k, v in order.iloc[:10].items()]
            res["10_nejhorsich_dni"] = [{"den": d(k), "vynos": r(v)} for k, v in order.iloc[-10:][::-1].items()]
            row[label] = res
        out.append(row)
    return {"popis": "Výchozí 10 000 USD. Zmeškaný den = ten den nulový výnos (peníze mimo trh), jinak "
                     "investováno. 'Do 2 týdnů' = nejlepší den leží nejvýše 14 kalendářních dní před "
                     "nebo po některém z N nejhorších dní téhož období.",
            "okna": out}


# =========================================================================== 5. CAGR
def cagr_section(dam: pd.DataFrame, sp_tr: pd.Series, tr_syn: pd.Series, sh: pd.DataFrame) -> dict:
    res = {}
    last_year = int(dam.index.max())
    cal = []
    for label, first in (("od 1928", 1928), ("50 let", last_year - 49), ("30 let", last_year - 29),
                         ("20 let", last_year - 19), ("10 let", last_year - 9)):
        seg = dam.loc[first:last_year]
        n = len(seg)
        cal.append({"obdobi": f"{first}–{last_year}", "popis": label, "let": n,
                    "nominalne": r(np.prod(1 + seg["vynos_s_dividendami"]) ** (1 / n) - 1),
                    "realne": r(np.prod(1 + seg["realny_vynos"]) ** (1 / n) - 1),
                    "inflace_usa": r(np.prod(1 + seg["inflace_usa"]) ** (1 / n) - 1)})
    res["damodaran_kalendarni"] = cal

    end = last_complete_month_end(sp_tr)
    end_m = end.to_period("M")
    cpi = sh["cpi"]
    trailing = []
    for label, yrs in (("od 1928", None), ("50 let", 50), ("30 let", 30), ("20 let", 20), ("10 let", 10)):
        if yrs is None:
            start = tr_syn.index[0]
        else:
            start, _ = asof(tr_syn, end - pd.DateOffset(years=yrs))
        src = sp_tr if start >= sp_tr.index[0] else tr_syn
        v0, v1 = float(src.loc[start]), float(src.loc[end])
        y = years_between(start, end)
        m0 = start.to_period("M")
        # pro start 30. 12. 1927 použij CPI 12/1927
        cpi_ratio = cpi.loc[end_m] / cpi.loc[m0]
        trailing.append({"popis": label, "od": d(start), "do": d(end), "let": r(y, 2),
                         "zdroj": "^SP500TR" if src is sp_tr else "syntetický TR",
                         "nominalne": r(cagr(v0, v1, y)), "realne": r(cagr(v0, v1 / cpi_ratio, y)),
                         "inflace_usa": r(cagr(1, cpi_ratio, y))})
    res["k_poslednimu_konci_mesice"] = trailing
    shc = sh["tr_nominalni"]
    yrs = (len(sh) - 1) / 12
    res["shiller_od_1871"] = {"obdobi": f"{sh.index[0]} až {sh.index[-1]}",
                              "nominalne": r(cagr(shc.iloc[0], shc.iloc[-1], yrs)),
                              "realne": r(cagr(sh["tr_realny"].iloc[0], sh["tr_realny"].iloc[-1], yrs))}
    return res


# =========================================================================== 6. pohled v Kč
def czk_section(sp_tr: pd.Series, fx: pd.Series) -> dict:
    fx_d = fx.reindex(sp_tr.index.union(fx.index)).ffill().reindex(sp_tr.index)
    tr_czk = (sp_tr * fx_d).dropna()
    end = last_complete_month_end(sp_tr)
    rows = []
    for yrs in (10, 20, 30):
        start, _ = asof(tr_czk, end - pd.DateOffset(years=yrs))
        y = years_between(start, end)
        usd = cagr(sp_tr.loc[start], sp_tr.loc[end], y)
        czk = cagr(tr_czk.loc[start], tr_czk.loc[end], y)
        fx0, fx1 = float(fx_d.loc[start]), float(fx_d.loc[end])
        rows.append({"let": yrs, "od": d(start), "do": d(end), "cagr_usd": r(usd), "cagr_czk": r(czk),
                     "rozdil_pb": r((czk - usd) * 100, 2), "kurz_od": r(fx0, 3), "kurz_do": r(fx1, 3),
                     "kurz_zmena_rocne": r(cagr(fx0, fx1, y)),
                     "nasobek_usd": r(sp_tr.loc[end] / sp_tr.loc[start], 2),
                     "nasobek_czk": r(tr_czk.loc[end] / tr_czk.loc[start], 2)})
    start = tr_czk.index[0]
    y = years_between(start, end)
    od93 = {"od": d(start), "do": d(end), "cagr_usd": r(cagr(sp_tr.loc[start], sp_tr.loc[end], y)),
            "cagr_czk": r(cagr(tr_czk.loc[start], tr_czk.loc[end], y)),
            "kurz_od": r(float(fx_d.loc[start]), 3), "kurz_do": r(float(fx_d.loc[end]), 3)}

    # klouzavá okna v Kč vs. USD (konec měsíce, od 1993)
    me_usd = month_end(sp_tr).loc[pd.Period("1993-01"):]
    me_czk = month_end(tr_czk)
    lab = [str(p) for p in me_czk.index]
    me_usd = me_usd.reindex(me_czk.index)
    roll = {}
    for name, h in HORIZONTY_TABULKA:
        if h >= len(me_czk):
            continue
        roll[name] = {"czk": horizon_stats(me_czk.to_numpy(), lab, h, 12),
                      "usd": horizon_stats(me_usd.to_numpy(), lab, h, 12)}
    # kolísavost
    mu = me_usd.pct_change().dropna()
    mc = me_czk.pct_change().dropna()
    vol = {"usd": r(mu.std() * np.sqrt(12)), "czk": r(mc.std() * np.sqrt(12)),
           "korelace_akcie_kurz": r(np.corrcoef(mu, month_end(fx_d.dropna()).reindex(me_czk.index)
                                               .pct_change().dropna().reindex(mu.index))[0, 1], 2)}
    # nejhorší propad v Kč
    dd_czk = tr_czk / tr_czk.cummax() - 1
    dd_usd = sp_tr.loc[tr_czk.index[0]:] / sp_tr.loc[tr_czk.index[0]:].cummax() - 1
    worst = {"czk": {"propad": r(dd_czk.min()), "dno": d(dd_czk.idxmin()),
                     "vrchol": d(tr_czk.loc[:dd_czk.idxmin()].idxmax())},
             "usd": {"propad": r(dd_usd.min()), "dno": d(dd_usd.idxmin())}}
    # návrat v Kč po vrcholu 2000
    peak_czk = tr_czk.loc["1999-01-01":"2001-12-31"].idxmax()
    after = tr_czk.loc[peak_czk:]
    trough_czk = after.loc[:"2010-12-31"].idxmin()
    rec = after.loc[trough_czk:]
    rec = rec[rec >= tr_czk.loc[peak_czk]]
    worst["czk_2000"] = {"vrchol": d(peak_czk), "dno": d(trough_czk),
                         "propad": r(tr_czk.loc[trough_czk] / tr_czk.loc[peak_czk] - 1),
                         "navrat": d(rec.index[0]) if len(rec) else None,
                         "vrchol_navrat_let": r(years_between(peak_czk, rec.index[0]), 1) if len(rec) else None}
    return {"popis": "^SP500TR × kurz ČNB (fixing téhož dne; pokud ČNB kurz nevyhlásila, poslední předchozí). "
                     "Bez poplatků, bez daní, bez nákladů na konverzi.",
            "obdobi": rows, "od_1993": od93, "klouzava_okna_od_1993": roll, "kolisavost_rocne": vol,
            "propady": worst}


# =========================================================================== 6b. ocenění trhu (CAPE)
def load_cape() -> pd.Series:
    """Shillerův CAPE (P/E10) ze surového ie_data.xls (sloupec 'CAPE')."""
    import xlrd
    sh = xlrd.open_workbook(RAW / "shiller" / "ie_data.xls").sheet_by_name("Data")
    hdr = next(r for r in range(sh.nrows) if sh.cell_value(r, 0) == "Date")
    col = [c for c in range(sh.ncols) if str(sh.cell_value(hdr, c)).strip() == "CAPE"][0]
    vals = {}
    for rr in range(hdr + 1, sh.nrows):
        dt_ = sh.cell_value(rr, 0)
        v = sh.cell_value(rr, col)
        if isinstance(dt_, float) and isinstance(v, float):
            y = int(dt_)
            vals[pd.Period(f"{y}-{int(round((dt_ - y) * 100)):02d}", "M")] = v
    return pd.Series(vals).sort_index()


def valuation(sh: pd.DataFrame) -> dict:
    cape = load_cape()
    fwd = (sh["tr_realny"].shift(-120) / sh["tr_realny"]) ** (1 / 10) - 1  # následných 10 let reálně
    df = pd.DataFrame({"cape": cape, "fwd10": fwd}).dropna()
    buckets = [(0, 15), (15, 20), (20, 25), (25, 30), (30, 100)]
    rows = []
    for lo, hi in buckets:
        x = df[(df.cape >= lo) & (df.cape < hi)]["fwd10"]
        rows.append({"cape_od": lo, "cape_do": hi if hi < 100 else None, "pocet_mesicu": int(len(x)),
                     "nasledne_10_let_realne_median": r(x.median()) if len(x) else None,
                     "min": r(x.min()) if len(x) else None, "max": r(x.max()) if len(x) else None})
    return {"cape_posledni": r(cape.iloc[-1], 1), "cape_mesic": str(cape.index[-1]),
            "cape_median_od_1881": r(cape.median(), 1), "cape_prumer_od_1881": r(cape.mean(), 1),
            "podil_mesicu_s_vyssim_cape": r(np.mean(cape >= cape.iloc[-1])),
            "nasledne_10_let_podle_cape": rows,
            "popis": "CAPE = cena / průměr reálných zisků za 10 let (Shiller). Následný reálný roční výnos "
                     "s dividendami za 10 let od daného měsíce (Shillerova měsíční data)."}


# =========================================================================== 7. modelové příklady
def fv_monthly(pmt: float, annual: float, years: int) -> float:
    """Vklad na začátku každého měsíce, měsíční úročení odpovídající ročnímu efektivnímu výnosu."""
    i = (1 + annual) ** (1 / 12) - 1
    n = 12 * years
    if i == 0:
        return pmt * n
    return pmt * ((1 + i) ** n - 1) / i * (1 + i)


def model_examples() -> dict:
    net = PREDPOKLAD_SPORAK * (1 - DAN_UROKY)
    variants = [("akcie_7", PREDPOKLAD_AKCIE), ("sporak_3_hrube", PREDPOKLAD_SPORAK), ("sporak_3_po_dani", net)]
    monthly = []
    for pmt in MESICNI_CASTKY:
        for y in ROKY:
            row = {"mesicne": pmt, "let": y, "vlozeno": pmt * 12 * y}
            for key, rate in variants:
                v = fv_monthly(pmt, rate, y)
                row[key] = round(v)
                row[key + "_dnesni_kc"] = round(v / (1 + INFLACE_CR) ** y)
            monthly.append(row)
    lump = []
    for y in ROKY:
        row = {"jednorazove": JEDNORAZOVE, "let": y, "vlozeno": JEDNORAZOVE}
        for key, rate in variants:
            v = JEDNORAZOVE * (1 + rate) ** y
            row[key] = round(v)
            row[key + "_dnesni_kc"] = round(v / (1 + INFLACE_CR) ** y)
        lump.append(row)
    return {"predpoklady": {"akcie_rocne": PREDPOKLAD_AKCIE, "sporak_rocne_hrube": PREDPOKLAD_SPORAK,
                            "sporak_rocne_po_dani": round(net, 4), "dan_z_uroku": DAN_UROKY,
                            "inflace_pro_dnesni_kc": INFLACE_CR},
            "metoda": "Vklad na začátku každého měsíce; měsíční sazba i = (1 + r)^(1/12) − 1, tj. r je roční "
                      "efektivní výnos. FV = PMT · ((1+i)^n − 1) / i · (1+i). Jednorázově FV = 500 000 · (1+r)^roky. "
                      "'_dnesni_kc' = výsledek vydělený (1,02)^roky. Bez poplatků, konverze měny a daní "
                      "(u akcií po 3 letech časový test, u spořáku 15 % z úroků je ve variantě po_dani).",
            "mesicne": monthly, "jednorazove": lump,
            "citlivost": [{"rocne": rr_, "15000_mesicne_30_let": round(fv_monthly(15_000, rr_, 30)),
                           "500000_jednorazove_30_let": round(JEDNORAZOVE * (1 + rr_) ** 30)}
                          for rr_ in (0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.10)]}


# =========================================================================== výstup
def validate_synthetic(tr_syn: pd.Series, sp_tr: pd.Series) -> dict:
    a, b = sp_tr.index[0], sp_tr.index[-1]
    y = years_between(a, b)
    off = cagr(sp_tr.iloc[0], sp_tr.iloc[-1], y)
    syn = cagr(tr_syn.loc[a], tr_syn.loc[b], y)
    corr = np.corrcoef(sp_tr.pct_change().dropna(), tr_syn.loc[a:b].pct_change().dropna())[0, 1]
    return {"obdobi": f"{d(a)} až {d(b)}", "cagr_sp500tr": r(off, 5), "cagr_synteticky": r(syn, 5),
            "rozdil_pb": r((syn - off) * 100, 3), "korelace_dennich_vynosu": r(corr, 5)}


def main() -> None:
    sh = load_shiller()
    gspc = load_yahoo("gspc")
    sp_tr = load_yahoo("sp500tr")
    fx = load_fx()
    dam = load_damodaran()
    tr_syn, defl_syn = synthetic_daily_tr(gspc, sh)

    meta_raw = json.loads((RAW / "stazeno.json").read_text(encoding="utf-8"))
    out = {
        "vygenerovano": dt.datetime.now().isoformat(timespec="seconds"),
        "skript": "scripts/statistiky.py",
        "data": {
            "shiller": {"soubor": "data/sp500_mesicne.csv", "obdobi": f"{sh.index[0]} až {sh.index[-1]}",
                        "zdroj": "https://shillerdata.com/ (ie_data.xls)"},
            "damodaran": {"soubor": "data/sp500_rocne.csv", "obdobi": f"{dam.index.min()} až {dam.index.max()}",
                          "zdroj": "https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/histret.html"},
            "yahoo_gspc": {"obdobi": f"{d(gspc.index[0])} až {d(gspc.index[-1])}", "zdroj": "Yahoo Finance ^GSPC"},
            "yahoo_sp500tr": {"obdobi": f"{d(sp_tr.index[0])} až {d(sp_tr.index[-1])}",
                              "zdroj": "Yahoo Finance ^SP500TR"},
            "cnb": {"soubor": "data/usdczk.csv", "obdobi": f"{d(fx.index[0])} až {d(fx.index[-1])}",
                    "zdroj": "https://www.cnb.cz/ (kurzy devizového trhu, USD)"},
            "stazeno": meta_raw.get("stazeno"),
        },
        "kontrola_syntetickeho_tr": validate_synthetic(tr_syn, sp_tr),
        "ztrata_podle_delky_drzeni": loss_probability(sh, tr_syn, defl_syn, sp_tr, gspc, dam),
        "propady": drawdowns(gspc, sp_tr, tr_syn, defl_syn, sh),
        "ztracena_dekada": lost_decade(sp_tr, gspc, sh, fx),
        "zmeskane_nejlepsi_dny": missed_days(sp_tr, gspc),
        "cagr": cagr_section(dam, sp_tr, tr_syn, sh),
        "czk": czk_section(sp_tr, fx),
        "oceneni_cape": valuation(sh),
        "modelove_priklady": model_examples(),
    }
    (DATA / "statistiky.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    print("Zapsáno data/statistiky.json")
    if "--md" in sys.argv:
        render_md(out)


# =========================================================================== tabulky v Markdownu
def pct(x, nd=1, sign=False) -> str:
    if x is None:
        return "–"
    v = 100 * x
    s = f"{v:+.{nd}f}" if sign else f"{v:.{nd}f}"
    return s.replace("-", "−").replace(".", ",") + " %"


def num(x) -> str:
    return f"{x:,.0f}".replace(",", "\u00a0")


def ym(s: str) -> str:
    """'2007-10-09' -> '9. 10. 2007'"""
    t = pd.Timestamp(s)
    return f"{t.day}. {t.month}. {t.year}"


def render_md(o: dict) -> None:
    P = print
    L = o["ztrata_podle_delky_drzeni"]
    P("### Pravděpodobnost ztráty (Shiller 1871–, měsíční okna)\n")
    P("| Délka držení | Počet oken | Ztráta nominálně | Ztráta reálně | Nejhorší (celkem / ročně) | Medián (celkem / ročně) | Nejlepší (celkem / ročně) |")
    P("|---|---:|---:|---:|---|---|---|")
    d1 = L["1_den"]
    for key, lab in (("sp500tr_1988", "1 den (^SP500TR 1988–)"), ("synteticky_tr_1928", "1 den (1928–)")):
        x = d1[key]
        P(f"| {lab} | {num(x['pocet_dni'])} | {pct(x['pravdepodobnost_ztraty'])} | {pct(x['pravdepodobnost_ztraty_realne'])} "
          f"| {pct(x['nejhorsi'], 1, True)} ({ym(x['nejhorsi_den'])}) | {pct(x['median'], 2, True)} | {pct(x['nejlepsi'], 1, True)} ({ym(x['nejlepsi_den'])}) |")
    for name, _ in HORIZONTY_TABULKA:
        n = L["shiller_1871"]["nominalne"][name]
        rr = L["shiller_1871"]["realne"][name]
        def cell(k):
            tot = pct(n[f"{k}_celkem"], 0, True)
            ann = n.get(f"{k}_rocne")
            return tot + (f" / {pct(ann, 1, True)}" if ann is not None else "")
        P(f"| {name} | {num(n['pocet_oken'])} | {pct(n['pravdepodobnost_ztraty'])} | {pct(rr['pravdepodobnost_ztraty'])} "
          f"| {cell('nejhorsi')} (od {n['nejhorsi_start']}) | {cell('median')} | {cell('nejlepsi')} (od {n['nejlepsi_start']}) |")
    P("\n### Kontrola: jiné zdroje a metody (pravděpodobnost ztráty nominálně / reálně)\n")
    P("| Délka držení | Shiller 1871– (měs. průměry) | Denní data 1928– (konec měsíce) | Damodaran 1928– (kalendářní roky) |")
    P("|---|---|---|---|")
    dam_keys = {"1 rok": "1 rok", "3 roky": "3 roky", "5 let": "5 let", "10 let": "10 let", "15 let": "15 let", "20 let": "20 let"}
    for name, _ in HORIZONTY_TABULKA:
        a = L["shiller_1871"]; b = L["denni_konec_mesice_1928"]; c = L["damodaran_kalendarni_roky"]
        cc = (f"{pct(c['nominalne'][dam_keys[name]]['pravdepodobnost_ztraty'])} / {pct(c['realne'][dam_keys[name]]['pravdepodobnost_ztraty'])}"
              f" (n = {c['nominalne'][dam_keys[name]]['pocet_oken']})") if name in dam_keys else "–"
        P(f"| {name} | {pct(a['nominalne'][name]['pravdepodobnost_ztraty'])} / {pct(a['realne'][name]['pravdepodobnost_ztraty'])} "
          f"| {pct(b['nominalne'][name]['pravdepodobnost_ztraty'])} / {pct(b['realne'][name]['pravdepodobnost_ztraty'])} | {cc} |")

    P("\n### Velké propady\n")
    P("| Propad | Cena: vrchol → dno | Cena: propad | Cena: návrat na vrchol | S dividendami: propad | S dividendami: návrat | S dividendami reálně: propad / návrat |")
    P("|---|---|---:|---|---:|---|---|")
    for e in o["propady"]["epizody"]:
        c, t, rl = e["cena_bez_dividend"], e["s_dividendami"], e["s_dividendami_realne"]
        def back(x):
            return f"{ym(x['navrat'])} ({str(x['vrchol_navrat_let']).replace('.', ',')} roku od vrcholu)" if x["navrat"] else "dosud ne"
        P(f"| {e['nazev']} | {ym(c['vrchol'])} → {ym(c['dno'])} | {pct(c['propad'])} | {back(c)} | {pct(t['propad'])} | {back(t)} "
          f"| {pct(rl['propad'])} / {back(rl)} |")

    P("\n### Ztracená dekáda (vklad 1 000 měsíčně vs. stejná částka jednorázově na začátku)\n")
    P("| Období | Měna, varianta | Vloženo | Jednorázově: hodnota (zisk, ročně) | Pravidelně: hodnota (zisk, IRR ročně) |")
    P("|---|---|---:|---|---|")
    labels = {"s_dividendami_usd": "USD, s dividendami", "bez_dividend_usd": "USD, bez dividend", "s_dividendami_czk": "Kč, s dividendami"}
    for row in o["ztracena_dekada"]["obdobi"]:
        for k, lab in labels.items():
            x = row[k]
            P(f"| 1/2000–{row['do'][5:]}/{row['do'][:4]} | {lab} | {num(x['vlozeno'])} | {num(x['jednorazove_hodnota'])} ({pct(x['jednorazove_zisk'], 1, True)}, {pct(x['jednorazove_rocne'], 1, True)}) "
              f"| {num(x['pravidelne_hodnota'])} ({pct(x['pravidelne_zisk'], 1, True)}, {pct(x['pravidelne_rocne_irr'], 1, True)}) |")

    P("\n### Zmeškané nejlepší dny (10 000 USD)\n")
    for w in o["zmeskane_nejlepsi_dny"]["okna"]:
        a, b = w["s_dividendami"], w["bez_dividend"]
        P(f"**{w['okno']}** ({ym(a['zacatek'])} – {ym(a['konec'])}, {num(a['obchodnich_dni'])} obchodních dní)\n")
        P("| Varianta | S dividendami (^SP500TR): hodnota | ročně | Bez dividend (^GSPC): hodnota | ročně |")
        P("|---|---:|---:|---:|---:|")
        keys = [("plne_investovan", "Celou dobu investován")] + [(f"bez_{n}_nejlepsich", f"Bez {n} nejlepších dní") for n in (10, 20, 30, 40, 50, 60)] \
            + [(f"bez_{n}_nejlepsich_i_nejhorsich", f"Bez {n} nejlepších i {n} nejhorších") for n in (10, 20, 30)]
        for k, lab in keys:
            P(f"| {lab} | {num(a[k]['hodnota'])} USD | {pct(a[k]['rocne'], 1, True)} | {num(b[k]['hodnota'])} USD | {pct(b[k]['rocne'], 1, True)} |")
        bl = a["blizkost"]
        P(f"\nNejlepší dny do 2 týdnů od nejhorších (s dividendami): {bl['10']['nejlepsich_do_2_tydnu_od_nejhorsich']} z 10, "
          f"{bl['20']['nejlepsich_do_2_tydnu_od_nejhorsich']} z 20, {bl['30']['nejlepsich_do_2_tydnu_od_nejhorsich']} z 30.\n")

    P("### CAGR s dividendami\n")
    P("| Období | Nominálně | Reálně | Inflace USA | Zdroj |")
    P("|---|---:|---:|---:|---|")
    for x in o["cagr"]["damodaran_kalendarni"]:
        P(f"| {x['popis']} ({x['obdobi']}) | {pct(x['nominalne'], 2)} | {pct(x['realne'], 2)} | {pct(x['inflace_usa'], 2)} | Damodaran, kalendářní roky |")
    for x in o["cagr"]["k_poslednimu_konci_mesice"]:
        P(f"| {x['popis']} ({ym(x['od'])} – {ym(x['do'])}) | {pct(x['nominalne'], 2)} | {pct(x['realne'], 2)} | {pct(x['inflace_usa'], 2)} | {x['zdroj']} + CPI Shiller |")
    x = o["cagr"]["shiller_od_1871"]
    P(f"| od 1871 ({x['obdobi']}) | {pct(x['nominalne'], 2)} | {pct(x['realne'], 2)} | – | Shiller, měsíční průměry |")

    P("\n### Pohled českého investora (^SP500TR × kurz ČNB)\n")
    P("| Období | CAGR v USD | CAGR v Kč | Rozdíl | Kurz USD/CZK na začátku → na konci | Kurz ročně | 1 Kč → (v Kč) |")
    P("|---|---:|---:|---:|---|---:|---:|")
    for x in o["czk"]["obdobi"]:
        P(f"| {x['let']} let ({ym(x['od'])} – {ym(x['do'])}) | {pct(x['cagr_usd'], 2)} | {pct(x['cagr_czk'], 2)} | {str(x['rozdil_pb']).replace('.', ',').replace('-', '−')} p. b. "
          f"| {str(x['kurz_od']).replace('.', ',')} → {str(x['kurz_do']).replace('.', ',')} | {pct(x['kurz_zmena_rocne'], 2, True)} | {str(x['nasobek_czk']).replace('.', ',')}× |")
    x = o["czk"]["od_1993"]
    P(f"| od {ym(x['od'])} | {pct(x['cagr_usd'], 2)} | {pct(x['cagr_czk'], 2)} | | {str(x['kurz_od']).replace('.', ',')} → {str(x['kurz_do']).replace('.', ',')} | | |")
    P("\n| Délka držení (od 1993, konec měsíce) | Ztráta v USD | Ztráta v Kč | Nejhorší v Kč (celkem, start) |")
    P("|---|---:|---:|---|")
    for name, v in o["czk"]["klouzava_okna_od_1993"].items():
        P(f"| {name} (n = {v['czk']['pocet_oken']}) | {pct(v['usd']['pravdepodobnost_ztraty'])} | {pct(v['czk']['pravdepodobnost_ztraty'])} | {pct(v['czk']['nejhorsi_celkem'], 0, True)} (od {v['czk']['nejhorsi_start']}) |")

    m = o["modelove_priklady"]
    P("\n### Modelové příklady (nominálně, Kč)\n")
    P("| Vklad | Let | Vloženo | Spořák 3 % hrubě | Spořák 3 % po dani (2,55 %) | Akcie 7 % | Akcie 7 % v dnešních Kč (inflace 2 %) |")
    P("|---|---:|---:|---:|---:|---:|---:|")
    for x in m["mesicne"]:
        P(f"| {num(x['mesicne'])} Kč měsíčně | {x['let']} | {num(x['vlozeno'])} | {num(x['sporak_3_hrube'])} | {num(x['sporak_3_po_dani'])} | **{num(x['akcie_7'])}** | {num(x['akcie_7_dnesni_kc'])} |")
    for x in m["jednorazove"]:
        P(f"| {num(x['jednorazove'])} Kč jednorázově | {x['let']} | {num(x['vlozeno'])} | {num(x['sporak_3_hrube'])} | {num(x['sporak_3_po_dani'])} | **{num(x['akcie_7'])}** | {num(x['akcie_7_dnesni_kc'])} |")

    v = o["oceneni_cape"]
    P(f"\n### CAPE\n\nCAPE {v['cape_mesic']}: {v['cape_posledni']}, medián od 1881: {v['cape_median_od_1881']}, "
      f"podíl měsíců s CAPE aspoň takto vysokým: {pct(v['podil_mesicu_s_vyssim_cape'])}\n")
    P("| CAPE | Měsíců | Následných 10 let reálně ročně: medián (min – max) |")
    P("|---|---:|---|")
    for x in v["nasledne_10_let_podle_cape"]:
        rng = f"{x['cape_od']}–{x['cape_do']}" if x["cape_do"] else f"{x['cape_od']} a víc"
        P(f"| {rng} | {x['pocet_mesicu']} | {pct(x['nasledne_10_let_realne_median'], 1, True)} ({pct(x['min'], 1, True)} až {pct(x['max'], 1, True)}) |")
    P("\n| Roční výnos | 15 000 Kč měsíčně, 30 let | 500 000 Kč jednorázově, 30 let |")
    P("|---:|---:|---:|")
    for x in m["citlivost"]:
        P(f"| {pct(x['rocne'], 0)} | {num(x['15000_mesicne_30_let'])} | {num(x['500000_jednorazove_30_let'])} |")
    k = o["kontrola_syntetickeho_tr"]
    P(f"\nKontrola syntetického TR proti ^SP500TR ({k['obdobi']}): CAGR {pct(k['cagr_sp500tr'], 2)} vs. {pct(k['cagr_synteticky'], 2)}, "
      f"rozdíl {str(k['rozdil_pb']).replace('.', ',').replace('-', '−')} p. b. ročně, korelace denních výnosů {str(k['korelace_dennich_vynosu']).replace('.', ',')}.")


if __name__ == "__main__":
    main()
