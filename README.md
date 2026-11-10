# Jak nechat peníze pracovat

Rodinná prezentace o dlouhodobém investování do amerických akcií a čtyři webové kalkulačky k ní.

**Kalkulačky:** https://tomasmichal.github.io/kalkulacky/

- Složené úročení
- Spořák vs. fond vs. ETF (poplatky z objemu a daně)
- Co kdybych investoval v roce… (skutečná data S&P 500 od roku 1871, kurz koruny od roku 1993)
- Pravděpodobnost ztráty podle délky držení

## Struktura

| Složka / soubor | Obsah |
|---|---|
| `ZADANI.md`, `OSNOVA.md` | zadání, rozhodnutí a osnova prezentace |
| `research/` | ověřená fakta se zdroji (banky, daně, brokeři, ETF, trh, filmy) |
| `data/` | data ze Shillera, Damodarana a ČNB + vypočtené statistiky |
| `scripts/` | stažení dat (`stahni_data.py`), příprava (`priprav_data.py`), statistiky (`statistiky.py`), export pro web (`export_web.py`) |
| `docs/` | webové kalkulačky (GitHub Pages), čisté HTML/JS bez knihoven |

Obnovení dat: `python3 -I scripts/stahni_data.py && python3 -I scripts/priprav_data.py && python3 -I scripts/statistiky.py && python3 -I scripts/export_web.py`
(první tři skripty potřebují virtuální prostředí `.venv` s pandas).

Lokální spuštění kalkulaček: `python3 -m http.server --directory docs` a otevřít http://localhost:8000.

*Nejde o investiční doporučení. Minulé výnosy nezaručují budoucí.*
