"""Připraví malé JSON soubory pro webové nástroje v docs/data/.

Vstupy (vyrábí je priprav_data.py a statistiky.py):
  data/sp500_mesicne.csv, data/usdczk_mesicne.csv, data/statistiky.json

Spuštění z kořene projektu:  python3 -I scripts/export_web.py
"""
import csv
import json
from pathlib import Path

KOREN = Path(__file__).resolve().parent.parent
DATA = KOREN / "data"
VYSTUP = KOREN / "docs" / "data"


def zaokrouhli(x, cifer=6):
    return float(f"{x:.{cifer}g}")


def sp500():
    radky = list(csv.DictReader(open(DATA / "sp500_mesicne.csv", encoding="utf-8")))
    return {
        "popis": "S&P 500 s reinvestovanými dividendami (total return index), měsíčně, USD. "
                 "Ceny jsou měsíční průměry (Shiller), poslední měsíc je jedna denní cena.",
        "zdroj": "Robert Shiller, https://shillerdata.com/ (ie_data.xls)",
        "od": radky[0]["datum"],
        "do": radky[-1]["datum"],
        "tr": [zaokrouhli(float(r["tr_nominalni"])) for r in radky],
        "trRealne": [zaokrouhli(float(r["tr_realny"])) for r in radky],
    }


def usdczk():
    radky = list(csv.DictReader(open(DATA / "usdczk_mesicne.csv", encoding="utf-8")))
    return {
        "popis": "Kurz CZK za 1 USD ke konci měsíce (ČNB).",
        "zdroj": "Česká národní banka, kurzy devizového trhu",
        "od": radky[0]["datum"],
        "do": radky[-1]["datum"],
        "kurz": [zaokrouhli(float(r["konec_mesice"]), 5) for r in radky],
    }


def ztrata():
    stat = json.load(open(DATA / "statistiky.json", encoding="utf-8"))
    z = stat["ztrata_podle_delky_drzeni"]
    den = z["1_den"]["synteticky_tr_1928"]

    def okno(o):
        vysledek = {
            "p": o["pravdepodobnost_ztraty"],
            "nejhorsi": o["nejhorsi_celkem"],
            "nejhorsiStart": o.get("nejhorsi_start"),
            "median": o["median_celkem"],
            "nejlepsi": o["nejlepsi_celkem"],
            "nejlepsiStart": o.get("nejlepsi_start"),
            "pocet": o["pocet_oken"],
        }
        # Průměrné roční výnosy (CAGR) jsou ve statistikách jen pro okna od 1 roku
        for klic, novy in (("nejhorsi_rocne", "nejhorsiRocne"), ("median_rocne", "medianRocne"),
                           ("nejlepsi_rocne", "nejlepsiRocne")):
            if klic in o:
                vysledek[novy] = o[klic]
        return vysledek

    radky = [{
        "mesicu": 0,
        "nominalne": {
            "p": den["pravdepodobnost_ztraty"], "nejhorsi": den["nejhorsi"],
            "nejhorsiStart": den["nejhorsi_den"], "median": den["median"],
            "nejlepsi": den["nejlepsi"], "nejlepsiStart": den["nejlepsi_den"],
            "pocet": den["pocet_dni"],
        },
        "realne": {"p": den["pravdepodobnost_ztraty_realne"]},
    }]
    for r in z["nastroj"]["shiller_1871"]:
        radky.append({"mesicu": r["mesicu"], "nominalne": okno(r["nominalne"]), "realne": okno(r["realne"])})
    return {
        "popis": "Pravděpodobnost, že investice do S&P 500 (s dividendami) byla po dané době ve ztrátě. "
                 "Klouzavá okna po měsících z dat 1871–2026 (Shiller). 1 den = denní data 1928–2026.",
        "zdroj": "Shiller (měsíčně od 1871), Yahoo Finance ^GSPC + Shillerovy dividendy (denně od 1928); "
                 "výpočet scripts/statistiky.py",
        "obdobiMesicne": z["shiller_1871"]["obdobi"],
        "obdobiDenne": den["obdobi"],
        "radky": radky,
    }


def main():
    VYSTUP.mkdir(parents=True, exist_ok=True)
    for nazev, data in (("sp500.json", sp500()), ("usdczk.json", usdczk()), ("ztrata.json", ztrata())):
        cesta = VYSTUP / nazev
        cesta.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
        print(f"{cesta.relative_to(KOREN)}: {cesta.stat().st_size / 1024:.1f} kB")


if __name__ == "__main__":
    main()
