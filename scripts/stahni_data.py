"""Stažení surových dat do data/raw/ (není v gitu).

Spuštění (z kořene projektu):
    .venv/bin/python -I scripts/stahni_data.py

Zdroje:
- Shiller: https://shillerdata.com/ (ie_data.xls, měsíční S&P 500 od 1871)
- Damodaran: https://pages.stern.nyu.edu/~adamodar/pc/datasets/histretSP.xls (roční výnosy od 1928)
- Yahoo Finance: ^GSPC (denně od 1927) a ^SP500TR (denně od 1988), přes knihovnu yfinance
- ČNB: kurz USD/CZK denně od 1993 (vybrane.txt)

Stažené soubory se nikdy nespouštějí, jen čtou jako data.
"""
import datetime as dt
import json
import re
import ssl
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw"
UA = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) investment-presentation research script"}


def _ssl_context() -> ssl.SSLContext:
    # Python z python.org na macOS nemá systémové certifikáty; použij certifi, pokud je k dispozici.
    try:
        import certifi
        return ssl.create_default_context(cafile=certifi.where())
    except ImportError:
        return ssl.create_default_context()


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=120, context=_ssl_context()) as r:
        return r.read()


def save(path: Path, content: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(content)
    print(f"  uloženo {path.relative_to(ROOT)} ({len(content):,} B)")


def shiller(meta: dict) -> None:
    print("Shiller ...")
    page = fetch("https://shillerdata.com/").decode("utf-8", "replace")
    m = re.search(r'href="([^"]*ie_data\.xls[^"]*)"', page)
    if not m:
        sys.exit("Na shillerdata.com nebyl nalezen odkaz na ie_data.xls")
    url = m.group(1)
    if url.startswith("//"):
        url = "https:" + url
    save(RAW / "shiller" / "ie_data.xls", fetch(url))
    meta["shiller"] = {"page": "https://shillerdata.com/", "file_url": url}


def damodaran(meta: dict) -> None:
    print("Damodaran ...")
    url = "https://pages.stern.nyu.edu/~adamodar/pc/datasets/histretSP.xls"
    save(RAW / "damodaran" / "histretSP.xls", fetch(url))
    meta["damodaran"] = {"file_url": url,
                         "page": "https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/histret.html"}


def yahoo(meta: dict) -> None:
    print("Yahoo Finance ...")
    import yfinance as yf  # noqa: import zde, aby zbytek šel spustit i bez yfinance

    for ticker, name in [("^GSPC", "gspc"), ("^SP500TR", "sp500tr")]:
        d = yf.Ticker(ticker).history(period="max", interval="1d", auto_adjust=False)
        if d.empty:
            sys.exit(f"Yahoo nevrátilo data pro {ticker}")
        d.index = d.index.tz_localize(None).date
        d.index.name = "Date"
        out = RAW / "yahoo" / f"{name}_denne.csv"
        out.parent.mkdir(parents=True, exist_ok=True)
        d[["Open", "High", "Low", "Close", "Adj Close", "Volume"]].to_csv(out)
        print(f"  uloženo {out.relative_to(ROOT)} ({len(d)} řádků, {d.index[0]} až {d.index[-1]})")
        meta[f"yahoo_{name}"] = {"ticker": ticker, "first": str(d.index[0]), "last": str(d.index[-1]),
                                 "rows": len(d), "via": f"yfinance {yf.__version__}"}


def cnb(meta: dict) -> None:
    print("ČNB ...")
    today = dt.date.today().strftime("%d.%m.%Y")
    url = ("https://www.cnb.cz/cs/financni-trhy/devizovy-trh/kurzy-devizoveho-trhu/"
           f"kurzy-devizoveho-trhu/vybrane.txt?mena=USD&od=01.01.1993&do={today}")
    save(RAW / "cnb" / "usdczk_vybrane.txt", fetch(url))
    meta["cnb"] = {"file_url": url}


def main() -> None:
    meta = {"stazeno": dt.datetime.now().isoformat(timespec="seconds")}
    for step in (shiller, damodaran, yahoo, cnb):
        step(meta)
    (RAW / "stazeno.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
    print("Hotovo.")


if __name__ == "__main__":
    main()
