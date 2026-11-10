"""Převod surových dat z data/raw/ na publikovatelné CSV v data/.

Spuštění (z kořene projektu, po scripts/stahni_data.py):
    .venv/bin/python -I scripts/priprav_data.py

Výstupy:
- data/sp500_mesicne.csv   Shiller, měsíčně od 1871 (cena, dividenda, CPI, total return index nominální a reálný)
- data/sp500_rocne.csv     Damodaran, roční výnos S&P 500 s dividendami od 1928, inflace, reálný výnos
- data/usdczk.csv          ČNB, denní kurz USD/CZK od 1993
- data/usdczk_mesicne.csv  ČNB, měsíční průměr a kurz ke konci měsíce (odvozeno z denních)

Data z Yahoo Finance se zde nepublikují (zpracovává je až scripts/statistiky.py).
"""
from pathlib import Path

import numpy as np
import pandas as pd
import xlrd

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw"
OUT = ROOT / "data"


# --------------------------------------------------------------------------- Shiller
def shiller_monthly() -> pd.DataFrame:
    """Načte list 'Data' z ie_data.xls a spočítá total return index.

    Metodika (stejná jako Shillerův sloupec 'Real Total Return Price'):
      TR_t = TR_{t-1} * (P_t + D_t / 12) / P_{t-1}
    kde P je měsíční průměr denních uzavíracích cen a D je roční dividenda (součet 4 čtvrtletí,
    lineárně interpolovaná na měsíce). Reálný index navíc dělí CPI.
    Chybějící poslední dividendy (Shiller je doplňuje se zpožděním) se doplní poslední známou hodnotou.
    """
    book = xlrd.open_workbook(RAW / "shiller" / "ie_data.xls")
    sh = book.sheet_by_name("Data")
    header_row = next(r for r in range(sh.nrows) if sh.cell_value(r, 0) == "Date")
    rows = []
    shiller_real_tr = []
    for r in range(header_row + 1, sh.nrows):
        date = sh.cell_value(r, 0)
        if not isinstance(date, float):
            continue
        year = int(date)
        month = int(round((date - year) * 100))
        def num(c):
            v = sh.cell_value(r, c)
            return float(v) if isinstance(v, float) else np.nan
        rows.append({"datum": f"{year:04d}-{month:02d}", "cena": num(1), "dividenda": num(2), "cpi": num(4)})
        shiller_real_tr.append(num(9))
    df = pd.DataFrame(rows)
    df = df.dropna(subset=["cena", "cpi"]).reset_index(drop=True)

    # Poznámky k posledním řádkům (předběžné hodnoty přímo ze Shillerova listu)
    notes = [str(sh.cell_value(r, c)).strip() for r in range(sh.nrows) for c in range(sh.ncols)
             if isinstance(sh.cell_value(r, c), str) and ("estimated" in sh.cell_value(r, c)
                                                          or "close" in sh.cell_value(r, c))]
    df["poznamka"] = ""
    missing_div = df["dividenda"].isna()
    df["dividenda"] = df["dividenda"].ffill()
    df.loc[missing_div, "poznamka"] = "dividenda doplněna poslední známou hodnotou"

    # Shillerovy poznámky pod tabulkou (např. "Oct price is Oct 2nd close", "Sept/Oct CPI estimated")
    # se vztahují k posledním měsícům řady; přenes je do sloupce poznamka.
    months = {"jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6, "jul": 7, "aug": 8,
              "sep": 9, "oct": 10, "nov": 11, "dec": 12}
    last_year = int(df.datum.iloc[-1][:4])
    def mark(month: int, text: str) -> None:
        for y in (last_year, last_year - 1):
            key = f"{y:04d}-{month:02d}"
            hit = df.index[df.datum == key]
            if len(hit) and hit[0] >= len(df) - 12:
                i = hit[0]
                df.loc[i, "poznamka"] = "; ".join(x for x in (df.loc[i, "poznamka"], text) if x)
                return
    for n in notes:
        low = n.lower()
        if "cpi estimated" in low:
            for tok in low.split()[0].split("/"):
                if tok[:3] in months:
                    mark(months[tok[:3]], "CPI odhad (Shiller)")
        elif "price is" in low and "close" in low and low[:3] in months:
            mark(months[low[:3]], "cena není měsíční průměr, ale jedna denní uzavírací cena (Shiller: " + n + ")")

    p = df["cena"].to_numpy()
    d = df["dividenda"].to_numpy()
    cpi = df["cpi"].to_numpy()
    growth = np.ones(len(df))
    growth[1:] = (p[1:] + d[1:] / 12.0) / p[:-1]
    tr_nom = np.cumprod(growth)
    infl = np.ones(len(df))
    infl[1:] = cpi[1:] / cpi[:-1]
    tr_real = np.cumprod(growth / infl)
    df["tr_nominalni"] = tr_nom
    df["tr_realny"] = tr_real

    # Kontrola proti Shillerovu vlastnímu reálnému TR (musí sedět na zaokrouhlení)
    # (jen měsíce se Shillerovou dividendou; kde dividenda chybí, Shiller počítá bez ní, my ji doplňujeme)
    s_tr = np.array(shiller_real_tr[: len(df)])
    ok = ~np.isnan(s_tr) & ~missing_div.to_numpy()
    ratio = (s_tr[ok] / s_tr[ok][0]) / tr_real[ok]
    dev = float(np.nanmax(np.abs(ratio - 1)))
    print(f"Shiller: {len(df)} měsíců {df.datum.iloc[0]} až {df.datum.iloc[-1]}; "
          f"max. odchylka od Shillerova Real TR: {dev:.2e}")
    if dev > 1e-3:
        print("  POZOR: odchylka od Shillerova Real TR je větší než 0,1 %")
    for n in notes:
        print("  poznámka v souboru:", n)
    return df, notes


# --------------------------------------------------------------------------- Damodaran
def damodaran_annual() -> pd.DataFrame:
    book = xlrd.open_workbook(RAW / "damodaran" / "histretSP.xls")
    sh = book.sheet_by_name("Returns by year")
    hdr = next(r for r in range(sh.nrows) if sh.cell_value(r, 0) == "Year")
    names = [str(sh.cell_value(hdr, c)).strip() for c in range(sh.ncols)]
    c_sp = names.index("S&P 500 (includes dividends)")
    c_inf = names.index("Inflation Rate")
    c_real = c_inf + 1  # první sloupec za inflací = reálný výnos S&P 500
    assert names[c_real].startswith("S&P 500"), names[c_real]
    raw = book.sheet_by_name("S&P 500 & Raw Data")
    level = {}
    for r in range(raw.nrows):
        y = raw.cell_value(r, 0)
        if isinstance(y, float):
            level[int(y)] = (raw.cell_value(r, 1), raw.cell_value(r, 2))
    rows = []
    for r in range(hdr + 1, sh.nrows):
        y = sh.cell_value(r, 0)
        if not isinstance(y, float):
            break
        y = int(y)
        rows.append({
            "rok": y,
            "vynos_s_dividendami": sh.cell_value(r, c_sp),
            "inflace_usa": sh.cell_value(r, c_inf),
            "realny_vynos": sh.cell_value(r, c_real),
            "index_konec_roku": level.get(y, (np.nan, np.nan))[0],
            "dividendy_za_rok": level.get(y, (np.nan, np.nan))[1],
        })
    df = pd.DataFrame(rows)
    updated = xlrd.xldate_as_datetime(sh.cell_value(0, 1), book.datemode).date() \
        if isinstance(sh.cell_value(0, 1), float) else None
    print(f"Damodaran: {len(df)} let {df.rok.min()} až {df.rok.max()} (pole 'Date updated' v souboru: {updated})")
    return df


# --------------------------------------------------------------------------- ČNB
def cnb_daily() -> pd.DataFrame:
    lines = (RAW / "cnb" / "usdczk_vybrane.txt").read_text(encoding="utf-8").splitlines()
    assert lines[0].startswith("Měna: USD|Množství: 1"), lines[0]
    rows = []
    for ln in lines[2:]:
        if "|" not in ln:
            continue
        d, k = ln.split("|")
        rows.append({"datum": pd.to_datetime(d, format="%d.%m.%Y"), "usdczk": float(k.replace(",", "."))})
    df = pd.DataFrame(rows).sort_values("datum").reset_index(drop=True)
    print(f"ČNB: {len(df)} dní {df.datum.min().date()} až {df.datum.max().date()}")
    return df


def main() -> None:
    sp_m, _ = shiller_monthly()
    sp_m.to_csv(OUT / "sp500_mesicne.csv", index=False, float_format="%.8g",
                columns=["datum", "cena", "dividenda", "cpi", "tr_nominalni", "tr_realny", "poznamka"])

    sp_y = damodaran_annual()
    sp_y.to_csv(OUT / "sp500_rocne.csv", index=False, float_format="%.6g")

    fx = cnb_daily()
    fx.to_csv(OUT / "usdczk.csv", index=False, date_format="%Y-%m-%d", float_format="%.3f")
    m = fx.set_index("datum")["usdczk"].resample("ME")
    fx_m = pd.DataFrame({"prumer": m.mean(), "konec_mesice": m.last()}).dropna()
    # neúplný poslední měsíc vynech (kurz ke konci měsíce by nebyl skutečný konec měsíce)
    last_day = fx["datum"].max()
    if last_day < last_day + pd.offsets.MonthEnd(0) - pd.Timedelta(days=3):
        fx_m = fx_m.iloc[:-1]
    fx_m.index = fx_m.index.strftime("%Y-%m")
    fx_m.index.name = "datum"
    fx_m.to_csv(OUT / "usdczk_mesicne.csv", float_format="%.4f")
    print("Hotovo: data/sp500_mesicne.csv, data/sp500_rocne.csv, data/usdczk.csv, data/usdczk_mesicne.csv")


if __name__ == "__main__":
    main()
