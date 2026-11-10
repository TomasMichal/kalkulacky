# Trh: historická data S&P 500 a ověřené statistiky

Ověřeno a spočítáno 10. 11. 2026. Všechna vlastní čísla pochází z `data/statistiky.json`, který generuje
`scripts/statistiky.py`. Čísla ručně neupravuj: změň skript a spusť ho znovu.

## Jak výpočet zopakovat

```bash
python3 -m venv .venv && .venv/bin/pip install pandas numpy xlrd openpyxl yfinance
.venv/bin/python -I scripts/stahni_data.py     # surová data do data/raw/ (není v gitu)
.venv/bin/python -I scripts/priprav_data.py    # publikovatelná CSV do data/
.venv/bin/python -I scripts/statistiky.py --md # data/statistiky.json + tabulky v Markdownu na výstup
```

Po novém stažení se čísla mírně posunou (Shiller a Damodaran data průběžně aktualizují, Yahoo přidá nové dny).

## Zdroje dat

| Soubor | Obsah | Zdroj | Období | Publikovat? |
|---|---|---|---|---|
| `data/sp500_mesicne.csv` | měsíčně: cena, roční dividenda, CPI, total return index nominální a reálný (1871-01 = 1) | Robert Shiller, [shillerdata.com](https://shillerdata.com/), `ie_data.xls` (soubor uložen 5. 10. 2026) | 1/1871–10/2026 | ano |
| `data/sp500_rocne.csv` | ročně: výnos S&P 500 s dividendami, inflace USA, reálný výnos, index a dividendy na konci roku | Aswath Damodaran, NYU Stern, [histretSP.xls](https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/histret.html) | 1928–2025 | ano |
| `data/usdczk.csv` | denní kurz USD/CZK | [ČNB, kurzy devizového trhu](https://www.cnb.cz/cs/financni-trhy/devizovy-trh/kurzy-devizoveho-trhu/kurzy-devizoveho-trhu/) | 4. 1. 1993 – 9. 11. 2026 | ano |
| `data/usdczk_mesicne.csv` | měsíční průměr a kurz ke konci měsíce (odvozeno z denních) | ČNB | 1/1993–10/2026 | ano |
| `data/raw/yahoo/gspc_denne.csv` | denní uzavírací ceny S&P 500 (^GSPC, bez dividend) | Yahoo Finance přes knihovnu yfinance 1.8.0 | 30. 12. 1927 – 9. 11. 2026 | **ne** (jen odvozené statistiky) |
| `data/raw/yahoo/sp500tr_denne.csv` | denní S&P 500 Total Return (^SP500TR, s reinvestovanými dividendami) | Yahoo Finance | 4. 1. 1988 – 9. 11. 2026 | **ne** |
| `data/statistiky.json` | všechny výsledky níže + řady pro webové nástroje | `scripts/statistiky.py` | | ano |

Staženo 10. 11. 2026 (`data/raw/stazeno.json` obsahuje přesné URL).

## Metodika

- **Total return (s dividendami), Shiller:** `TR_t = TR_{t−1} · (P_t + D_t/12) / P_{t−1}`. P je měsíční **průměr**
  denních uzavíracích cen, D roční dividenda. Je to stejný vzorec, jaký Shiller používá pro svůj sloupec „Real Total
  Return Price“. Moje řada se s ním shoduje na 1e−14. Reálný index navíc dělí CPI-U.
- **Syntetický denní TR od 1928:** denní změna ^GSPC plus Shillerův měsíční dividendový výnos (D/12/P)
  rozložený rovnoměrně do obchodních dní měsíce. Kontrola proti oficiálnímu ^SP500TR (1988–2026): roční průměr
  11,34 % vs. 11,40 %, rozdíl −0,055 p. b. ročně, korelace denních výnosů 0,9996. Řadu používám jen pro období
  před rokem 1988 (propady 1929 a 1973–74, CAGR za 50 let a od 1928, 1 den od 1928).
- **Reálně** = očištěno o americkou inflaci (CPI-U), tj. kupní síla v dolarech. Pro denní řady se měsíční inflace
  rozkládá geometricky do obchodních dní.
- **Klouzavá okna:** každý měsíc (u 1 dne každý obchodní den) je jeden možný začátek. Okna se překrývají, takže
  nejsou nezávislá. Například od roku 1871 je jen asi 7 nepřekrývajících se dvacetiletých období.
- **„Ztráta“** = celkový výnos s dividendami za okno < 0 (bez poplatků a daní).
- **Propad** = pokles od posledního historického maxima ke dnu, z denních uzavíracích cen. **Návrat** = první den,
  kdy index znovu dosáhl hodnoty předchozího vrcholu. Pro 1988+ se použije ^SP500TR, dříve syntetický TR.
- **Roční průměr** = geometrický (CAGR), ne aritmetický.

---

## 1. Pravděpodobnost ztráty podle délky držení

Hlavní tabulka: Shiller, S&P 500 s dividendami, 1/1871–10/2026, klouzavá měsíční okna. Řádky „1 den“ jsou
z denních dat (^SP500TR od 1988, syntetický TR od 1928). „Celkem“ = výnos za celé okno, „ročně“ = CAGR.

| Délka držení | Počet oken | Ztráta nominálně | Ztráta reálně | Nejhorší (celkem / ročně) | Medián (celkem / ročně) | Nejlepší (celkem / ročně) |
|---|---:|---:|---:|---|---|---|
| 1 den (^SP500TR 1988–) | 9 786 | 45,5 % | 46,4 % | −12,0 % (16. 3. 2020) | +0,07 % | +11,6 % (13. 10. 2008) |
| 1 den (1928–) | 24 831 | 46,0 % | 46,9 % | −20,5 % (19. 10. 1987) | +0,06 % | +16,7 % (15. 3. 1933) |
| 1 měsíc | 1 869 | 36,9 % | 39,0 % | −26 % (od 10/1929) | +1,0 % | +51 % (od 7/1932) |
| 1 rok | 1 858 | 27,2 % | 30,4 % | −62 % (od 6/1931) | +11 % / +11,3 % | +140 % (od 7/1932) |
| 3 roky | 1 834 | 15,1 % | 21,2 % | −79 % / −40,2 % (od 7/1929) | +33 % / +10,0 % | +172 % / +39,7 % (od 3/1933) |
| 5 let | 1 810 | 10,2 % | 18,6 % | −61 % / −17,3 % (od 9/1929) | +60 % / +9,8 % | +327 % / +33,7 % (od 9/1924) |
| 10 let | 1 750 | 2,9 % | 11,0 % | −34 % / −4,0 % (od 8/1929) | +132 % / +8,8 % | +582 % / +21,2 % (od 6/1949) |
| 15 let | 1 690 | 0,1 % | 4,4 % | −5 % / −0,4 % (od 9/1929) | +246 % / +8,6 % | +1 305 % / +19,3 % (od 7/1984) |
| 20 let | 1 630 | 0,0 % | 0,1 % | +50 % / +2,1 % (od 9/1929) | +381 % / +8,2 % | +2 615 % / +17,9 % (od 4/1980) |

Poznámky k tabulce:

- 15 let nominálně: ztrátu skončilo jediné okno ze 1 690, start 9/1929 (−5 %).
- 20 let reálně: ztrátové jediné okno, start 6/1901 (−4,3 % za 20 let).
- 10 let nominálně: ztrátová byla jen okna se startem 6/1922, v letech 1928–1931 a od 11/1998 do 9/2000.
- Nejhorší a nejlepší údaje jsou nominální. Reálné hodnoty jsou v `statistiky.json`.

**Kontrola jinými zdroji a metodami** (pravděpodobnost ztráty nominálně / reálně):

| Délka držení | Shiller 1871– (měsíční průměry) | Denní data 1928– (konec měsíce) | Damodaran 1928–2025 (kalendářní roky) |
|---|---|---|---|
| 1 měsíc | 36,9 % / 39,0 % | 37,4 % / 40,1 % | – |
| 1 rok | 27,2 % / 30,4 % | 24,9 % / 29,7 % | 26,5 % / 31,6 % (98 let) |
| 3 roky | 15,1 % / 21,2 % | 15,2 % / 23,1 % | 15,6 % / 20,8 % (96 oken) |
| 5 let | 10,2 % / 18,6 % | 10,2 % / 21,7 % | 11,7 % / 23,4 % (94 oken) |
| 10 let | 2,9 % / 11,0 % | 4,7 % / 12,8 % | 5,6 % / 12,4 % (89 oken) |
| 15 let | 0,1 % / 4,4 % | 0,2 % / 4,9 % | 1,2 % / 5,9 % (84 oken) |
| 20 let | 0,0 % / 0,1 % | 0,0 % / 0,0 % | 0,0 % / 0,0 % (79 oken) |

Závěr je ve všech třech zdrojích stejný. Do 1 roku je ztráta běžná (asi každé 4. okno). Za 10 let se ztráta
objevuje zřídka (3–6 %) a za 20 let s dividendami nenastala ani jednou. Reálně (po inflaci) je riziko vyšší:
za 10 let zhruba 11–13 %, za 20 let prakticky nula.

**Pro nástroj „Pravděpodobnost ztráty“:** v `statistiky.json → ztrata_podle_delky_drzeni.nastroj` jsou horizonty
1, 3, 6 měsíců a 1–30 let. Ke každému je pravděpodobnost ztráty, nejhorší, mediánový a nejlepší výsledek (celkem
i ročně), percentily 5/25/75/95 a začátky ztrátových oken. To vše nominálně i reálně, ve dvou řadách
(`shiller_1871` hlavní, `denni_1928` kontrolní), plus „1 den“.

## 2. Velké propady (denní data)

| Propad | Vrchol → dno (cena) | Bez dividend: propad | Bez dividend: návrat na vrchol | S dividendami: propad | S dividendami: návrat | S dividendami reálně: propad / návrat |
|---|---|---:|---|---:|---|---|
| 1929 (Velká hospodářská krize) | 16. 9. 1929 → 1. 6. 1932 | −86,2 % | 22. 9. 1954 (25,0 roku) | −83,6 % | 2. 1. 1945 (15,3 roku) | −79,3 % / 4. 11. 1936 (7,1 roku) |
| 1973–74 (ropná krize, inflace) | 11. 1. 1973 → 3. 10. 1974 | −48,2 % | 17. 7. 1980 (7,5 roku) | −45,0 % | 12. 7. 1976 (3,5 roku) | −53,8 % / 21. 1. 1985 (12,0 roku) |
| 2000–02 (dot-com) | 24. 3. 2000 → 9. 10. 2002 | −49,1 % | 30. 5. 2007 (7,2 roku) | −47,4 % | 23. 10. 2006 (6,1 roku) | −49,8 % / 3. 5. 2013 (12,7 roku) |
| 2007–09 (finanční krize) | 9. 10. 2007 → 9. 3. 2009 | −56,8 % | 28. 3. 2013 (5,5 roku) | −55,2 % | 2. 4. 2012 (4,5 roku) | −56,0 % / 8. 3. 2013 (5,4 roku) |
| 2020 (covid) | 19. 2. 2020 → 23. 3. 2020 | −33,9 % | 18. 8. 2020 (0,5 roku) | −33,8 % | 10. 8. 2020 (0,5 roku) | −33,8 % / 12. 8. 2020 (0,5 roku) |
| 2022 (inflace, sazby) | 3. 1. 2022 → 12. 10. 2022 | −25,4 % | 19. 1. 2024 (2,0 roku) | −24,5 % | 13. 12. 2023 (1,9 roku) | −29,1 % / 12. 3. 2024 (2,2 roku) |
| jaro 2025 (cla) | 19. 2. 2025 → 8. 4. 2025 | −18,9 % | 27. 6. 2025 (0,4 roku) | −18,8 % | 26. 6. 2025 (0,3 roku) | −19,1 % / 30. 6. 2025 (0,4 roku) |

Doba v závorce se počítá od vrcholu k návratu. Zdroje:

- Bez dividend: ^GSPC (Yahoo).
- S dividendami: ^SP500TR (Yahoo) od 2000, pro 1929 a 1973–74 syntetický TR.
- Reálně: s dividendami a očištěno o CPI, měřeno od vrcholu nominálního TR.

U s dividendami 2000–02 je vrchol TR 1. 9. 2000, ne 24. 3. 2000. Dividendy mezitím vyrovnaly mírně nižší cenu.

Ponaučení pro slajdy:

- S dividendami se trh vrací výrazně rychleji. Po roce 1929 trval návrat 15 let místo 25.
- Po inflaci byla nejhorší 70. léta a dekáda 2000–2013, ne 1929. V roce 1929 ceny klesaly, takže reálně byl
  návrat už za 7 let.

## 3. „Ztracená dekáda“ 2000–2013

Jednorázově: celá částka na close 31. 12. 1999. Pravidelně: 1 000 měsíčně na začátku každého měsíce od 1/2000.
Ocenění k poslednímu obchodnímu dni období. Jednorázová částka je stejná jako součet všech pravidelných vkladů.

Data:

- ^SP500TR a ^GSPC: hodnoty ke konci měsíce.
- Kč: navíc kurz ČNB ke konci měsíce (31. 12. 1999: 35,979; 31. 12. 2009: 18,368; 31. 12. 2013: 19,894 Kč/USD).

| Období | Měna, varianta | Vloženo | Jednorázově: hodnota (zisk, ročně) | Pravidelně: hodnota (zisk, IRR ročně) |
|---|---|---:|---|---|
| 1/2000–12/2009 | USD, s dividendami | 120 000 | 109 083 (−9,1 %, −0,9 %) | 128 382 (+7,0 %, +1,3 %) |
| 1/2000–12/2009 | USD, bez dividend | 120 000 | 91 075 (−24,1 %, −2,7 %) | 115 931 (−3,4 %, −0,7 %) |
| 1/2000–12/2009 | **Kč**, s dividendami | 120 000 | 55 689 (−53,6 %, −7,4 %) | 93 743 (−21,9 %, −5,0 %) |
| 1/2000–12/2013 | USD, s dividendami | 168 000 | 275 561 (+64,0 %, +3,6 %) | 302 134 (+79,8 %, +8,0 %) |
| 1/2000–12/2013 | USD, bez dividend | 168 000 | 211 349 (+25,8 %, +1,7 %) | 259 349 (+54,4 %, +5,9 %) |
| 1/2000–12/2013 | **Kč**, s dividendami | 168 000 | 152 367 (−9,3 %, −0,7 %) | 257 714 (+53,4 %, +5,9 %) |

Jednorázová investice v USD byla reálně (po inflaci USA) ke konci roku 2009 na −29,2 % a ke konci 2013 na +18,5 %.

Pointa: pravidelné investování „ztracenou dekádu“ zachránilo. V USD skončilo v plusu už v roce 2009, a přitom
jednorázová investice byla v minusu. Do konce roku 2013 vydělalo 8 % ročně. Pro korunového investora to bylo mnohem
horší, protože dolar mezi lety 2000 a 2008 oslabil zhruba na polovinu. I tak pravidelné investování skončilo
v roce 2013 na +53 %.

## 4. Zmeškané nejlepší dny

Výchozích 10 000 USD. Zmeškaný den znamená, že peníze jsou ten den mimo trh a mají nulový výnos.

**Posledních 20 let: 9. 11. 2006 – 9. 11. 2026** (5 029 obchodních dní)

| Varianta | S dividendami (^SP500TR) | ročně | Bez dividend (^GSPC) | ročně |
|---|---:|---:|---:|---:|
| Celou dobu investován | 79 998 USD | +11,0 % | 54 776 USD | +8,9 % |
| Bez 10 nejlepších dní | 35 589 USD | +6,6 % | 24 389 USD | +4,6 % |
| Bez 20 nejlepších dní | 21 013 USD | +3,8 % | 14 407 USD | +1,8 % |
| Bez 30 nejlepších dní | 13 720 USD | +1,6 % | 9 417 USD | −0,3 % |
| Bez 40 nejlepších dní | 9 389 USD | −0,3 % | 6 448 USD | −2,2 % |
| Bez 50 nejlepších dní | 6 711 USD | −2,0 % | 4 614 USD | −3,8 % |
| Bez 60 nejlepších dní | 4 927 USD | −3,5 % | 3 393 USD | −5,3 % |
| *Bez 10 nejlepších i 10 nejhorších* | *84 668 USD* | *+11,3 %* | *58 087 USD* | *+9,2 %* |
| *Bez 30 nejlepších i 30 nejhorších* | *91 817 USD* | *+11,7 %* | *63 254 USD* | *+9,7 %* |

**Jak blízko jsou nejlepší dny u nejhorších** (s dividendami, ±14 kalendářních dní):

- 6 z 10 nejlepších dní přišlo do 2 týdnů od některého z 10 nejhorších.
- U 20 nejlepších dní to bylo 14 z 20, u 30 nejlepších 23 z 30.
- Nejlepší dny: 13. 10. 2008 (+11,6 %), 28. 10. 2008 (+10,8 %), 9. 4. 2025 (+9,5 %), 24. 3. 2020 (+9,4 %),
  13. 3. 2020 (+9,3 %).
- Nejhorší dny: 16. 3. 2020 (−12,0 %), 12. 3. 2020 (−9,5 %), 15. 10. 2008 (−9,0 %).

**Srovnání s J.P. Morgan Guide to Retirement 2026** (slajd „Impact of being out of the market“):

- J.P. Morgan počítá období 2. 1. 2006 – 31. 12. 2025, index S&P 500 Total Return, vklad 10 000 USD.
- Uvádí 80 619 / 35 866 / 21 177 / 13 826 / 9 462 / 6 763 / 4 966 USD (plně investováno a bez 10, 20, 30, 40, 50
  a 60 dní), ročně 11,0 / 6,6 / 3,8 / 1,6 / −0,3 / −1,9 / −3,4 %. Dále uvádí, že 6 z 10 nejlepších dní přišlo do
  2 týdnů od 10 nejhorších.
- **Můj výpočet pro stejné období dává přesně stejná čísla** (80 619, 35 866, 21 177, 13 826, 9 462, 6 763,
  4 966 USD; 6 z 10). Metodika a data tedy sedí.
- Zdroj: [JPM Guide to Retirement 2026 (PDF)](https://am.jpmorgan.com/content/dam/jpm-am-aem/global/en/insights/retirement-insights/guide-to-retirement-us.pdf), data k 31. 12. 2025.

Poctivě na slajd: kdo zmešká nejlepší dny, většinou zmešká i ty nejhorší, protože leží těsně vedle sebe. Kdo by
vynechal 10 nejlepších i 10 nejhorších dní, měl by dokonce o něco víc (84,7 tis. USD). Pointa proto není
„nejlepší dny jsou svaté“, ale **„nikdo dopředu neví, kdy přijdou, a přicházejí uprostřed paniky“**. Kdo
v panice prodá, zmešká hlavně ty nejlepší dny.

## 5. Průměrný roční výnos (CAGR) S&P 500 s dividendami

| Období | Nominálně | Reálně | Inflace USA | Zdroj |
|---|---:|---:|---:|---|
| od 1928 (1928–2025) | 10,02 % | 6,78 % | 3,04 % | Damodaran, kalendářní roky |
| 50 let (1976–2025) | 11,92 % | 8,04 % | 3,59 % | Damodaran |
| 30 let (1996–2025) | 10,26 % | 7,54 % | 2,52 % | Damodaran |
| 20 let (2006–2025) | 10,90 % | 8,17 % | 2,53 % | Damodaran |
| 10 let (2016–2025) | 14,68 % | 11,12 % | 3,20 % | Damodaran |
| od 1928 (30. 12. 1927 – 30. 10. 2026) | 10,20 % | 6,95 % | 3,05 % | syntetický TR + CPI (Shiller) |
| 50 let (29. 10. 1976 – 30. 10. 2026) | 11,84 % | 7,98 % | 3,58 % | syntetický TR + CPI |
| 30 let (30. 10. 1996 – 30. 10. 2026) | 10,22 % | 7,49 % | 2,54 % | ^SP500TR + CPI |
| 20 let (30. 10. 2006 – 30. 10. 2026) | 10,99 % | 8,20 % | 2,58 % | ^SP500TR + CPI |
| 10 let (28. 10. 2016 – 30. 10. 2026) | 15,44 % | 11,71 % | 3,34 % | ^SP500TR + CPI |
| od 1871 (1/1871–10/2026) | 9,40 % | 7,11 % | – | Shiller, měsíční průměry |

Ověření: Damodaran sám uvádí geometrický průměr 1928–2025 10,02 % (list „Returns by year“).

Pozor: posledních 10 let (14–15 % ročně) je výrazně nadprůměrných a nelze je čekat dál.

## 6. Pohled českého investora (S&P 500 s dividendami v Kč)

^SP500TR × kurz ČNB téhož dne (pokud ČNB kurz nevyhlásila, platí předchozí). Bez poplatků, daní a nákladů na
konverzi.

| Období | CAGR v USD | CAGR v Kč | Rozdíl | USD/CZK začátek → konec | Kurz ročně | 1 Kč se změnila na |
|---|---:|---:|---:|---|---:|---:|
| 10 let (28. 10. 2016 – 30. 10. 2026) | 15,44 % | 14,00 % | −1,44 p. b. | 24,729 → 21,814 | −1,25 % | 3,71 Kč |
| 20 let (30. 10. 2006 – 30. 10. 2026) | 10,99 % | 10,87 % | −0,12 p. b. | 22,291 → 21,814 | −0,11 % | 7,87 Kč |
| 30 let (30. 10. 1996 – 30. 10. 2026) | 10,22 % | 9,48 % | −0,75 p. b. | 26,741 → 21,814 | −0,68 % | 15,12 Kč |
| od 4. 1. 1993 | 10,89 % | 9,97 % | −0,92 p. b. | 28,911 → 21,814 | | |

**Vliv kurzu na dlouhodobý výnos:** za 20–30 let ubral posilující koruna zhruba 0,1–0,9 procentního bodu ročně.
Akcie v Kč přesto vydělaly kolem 9,5–11 % ročně.

**Vliv kurzu na kolísání po cestě je velký:**

- **Nejhorší propad v Kč:** −71,5 % mezi 13. 9. 2000 a 9. 3. 2009. V USD to bylo −55,2 %.
- **Návrat v Kč:** až 3. 12. 2014, tedy po 14,2 roku od vrcholu.
- **Kolísavost:** roční směrodatná odchylka měsíčních výnosů je 15,9 % v Kč proti 14,7 % v USD. Korelace akcií
  s kurzem USD/CZK je −0,28, takže dolar v krizích často posiluje a část propadu tlumí. V letech 2002–2008 ale
  dolar oslabil i bez krize.

Klouzavá okna od 1993 (konec měsíce), pravděpodobnost ztráty:

| Délka držení | Počet oken | Ztráta v USD | Ztráta v Kč | Nejhorší v Kč (celkem, start) |
|---|---:|---:|---:|---|
| 1 měsíc | 406 | 34,2 % | 37,9 % | −16 % (od 5/2002) |
| 1 rok | 395 | 17,5 % | 24,8 % | −39 % (od 1/2002) |
| 3 roky | 371 | 15,9 % | 20,5 % | −54 % (od 3/2000) |
| 5 let | 347 | 14,1 % | 32,0 % | −48 % (od 4/2000) |
| 10 let | 287 | 8,4 % | 19,2 % | −59 % (od 8/2000) |
| 15 let | 227 | 0,0 % | 0,0 % | +4 % (od 4/1999) |
| 20 let | 167 | 0,0 % | 0,0 % | +71 % (od 3/2000) |

Pozor, vzorek je krátký (33 let) a ovládá ho jediné období. Všechna desetiletá ztrátová okna v Kč začínají
mezi 11/1997 a 5/2002 (silný dolar a bublina, pak propad akcií i dolaru). I tak je poctivé říct, že **v korunách
bylo potřeba až 15 let, ne 10**.

## 7. Navržený předpoklad výnosu pro modelové příklady: **7 % ročně v Kč** (nominálně, po nákladech)

Zdůvodnění:

1. **Historie v USD:**
   - S&P 500 s dividendami vynášel 10,0 % ročně (1928–2025) a 10,2 % za posledních 30 let.
   - Reálně (po inflaci) 6,8 % ročně od 1928.
   - Zdroj: kap. 5.
2. **Historie v Kč:**
   - Za 30 let 9,5 % ročně, od 1993 10,0 % ročně.
   - Koruna vůči dolaru dlouhodobě posiluje, za 30 let o 0,7 % ročně, za 10 let o 1,25 % ročně.
   - Do budoucna je rozumné počítat s pokračováním, zhruba −0,5 až −1 p. b. ročně (kap. 6).
3. **Dnešní ocenění je vysoké:**
   - Shillerovo CAPE je v 10/2026 40,7, medián od 1881 je 16,6.
   - Vyšší CAPE měl trh jen v 1,1 % měsíců, a to v letech 1999–2000.
   - Historicky po CAPE nad 30 následovalo 10 let s mediánem −1,1 % ročně reálně (57 měsíců, rozpětí −5,9 až
     +4,5 %).
   - Tento vzorek je ale téměř celý z let 1929 a 1997–2000, takže je to jen varovný signál, ne předpověď.
4. **Výhledy profesionálů (v USD):**
   - J.P. Morgan LTCMA 2027 (data k 9/2026): akcie velkých US firem 7,5 % ročně. Ve verzi 2026 to bylo 6,7 %.
   - Vanguard (výhled 12/2025): US akcie 4–5 % ročně na 10 let.
   - Výhledy na 10–15 let odrážejí dnešní ocenění, na horizontu 20–30 let se jeho vliv ředí.
5. **Náklady:**
   - TER ETF kolem 0,07 %.
   - Konverze měny 0,5 % při nákupu (XTB, `research/produkty.md`).
   - Irská UCITS ETF platí 15% srážkovou daň z amerických dividend uvnitř fondu, což je odhadem −0,2 p. b. ročně
     proti ^SP500TR. **Odhad, neověřeno.**

Proto 7 %:

- je o 2,5–3 p. b. níž než historie v Kč,
- leží v pásmu profesionálních výhledů,
- při inflaci 2 % (cíl ČNB) odpovídá zhruba 5 % reálně.

Je to střízlivý střední předpoklad, ne slib. V kalkulačce ukázat i pesimistickou variantu 4–5 % a optimistickou
9 % (blízko historie).

## 8. Modelové příklady (nominálně, Kč)

Metoda:

- Vklad na začátku každého měsíce, měsíční sazba `i = (1 + r)^(1/12) − 1` (r = roční efektivní výnos).
- `FV = PMT · ((1+i)^n − 1)/i · (1+i)`, jednorázově `500 000 · (1+r)^roky`.
- Spořák „po dani“ = 3 % × (1 − 15 %) = 2,55 %.
- „V dnešních Kč“ = výsledek vydělený 1,02^roky.
- Bez poplatků a konverze měny. U akcií neplatí daň díky časovému testu (držení přes 3 roky).
- Webová kalkulačka musí používat stejný vzorec, jinak se čísla rozejdou.

| Vklad | Let | Vloženo | Spořák 3 % hrubě | Spořák 3 % po dani (2,55 %) | Akcie 7 % | Akcie 7 % v dnešních Kč (inflace 2 %) |
|---|---:|---:|---:|---:|---:|---:|
| 10 000 Kč měsíčně | 10 | 1 200 000 | 1 397 919 | 1 366 035 | **1 720 189** | 1 411 154 |
| 10 000 Kč měsíčně | 20 | 2 400 000 | 3 276 606 | 3 123 224 | **5 104 061** | 3 434 886 |
| 10 000 Kč měsíčně | 30 | 3 600 000 | 5 801 403 | 5 383 572 | **11 760 649** | 6 492 712 |
| 15 000 Kč měsíčně | 10 | 1 800 000 | 2 096 879 | 2 049 053 | **2 580 283** | 2 116 731 |
| 15 000 Kč měsíčně | 20 | 3 600 000 | 4 914 908 | 4 684 837 | **7 656 091** | 5 152 330 |
| 15 000 Kč měsíčně | 30 | 5 400 000 | 8 702 104 | 8 075 358 | **17 640 973** | 9 739 068 |
| 20 000 Kč měsíčně | 10 | 2 400 000 | 2 795 838 | 2 732 070 | **3 440 378** | 2 822 308 |
| 20 000 Kč měsíčně | 20 | 4 800 000 | 6 553 211 | 6 246 449 | **10 208 121** | 6 869 773 |
| 20 000 Kč měsíčně | 30 | 7 200 000 | 11 602 806 | 10 767 143 | **23 521 297** | 12 985 423 |
| 500 000 Kč jednorázově | 10 | 500 000 | 671 958 | 643 171 | **983 576** | 806 875 |
| 500 000 Kč jednorázově | 20 | 500 000 | 903 056 | 827 339 | **1 934 842** | 1 302 093 |
| 500 000 Kč jednorázově | 30 | 500 000 | 1 213 631 | 1 064 241 | **3 806 128** | 2 101 252 |

Citlivost na předpoklad (30 let):

| Roční výnos | 15 000 Kč měsíčně | 500 000 Kč jednorázově |
|---:|---:|---:|
| 4 % | 10 312 709 | 1 621 699 |
| 5 % | 12 280 468 | 2 160 971 |
| 6 % | 14 688 847 | 2 871 746 |
| **7 %** | **17 640 973** | **3 806 128** |
| 8 % | 21 264 199 | 5 031 328 |
| 9 % | 25 715 710 | 6 633 839 |
| 10 % | 31 189 391 | 8 724 701 |

Pozor na férovost srovnání: spořák 3 % po celých 30 let je optimistický předpoklad, protože sazby kolísají.
Akcie 7 % je průměr, skutečná cesta bude hrbolatá (kap. 1, 2, 6).

---

## 9. Ověřené statistiky z externích zdrojů

### SPIVA U.S. (S&P Dow Jones Indices): aktivní fondy velkých US firem (All Large-Cap) vs. S&P 500

Podíl fondů, které **zaostaly** za S&P 500 (rovné vážení, sloučené a zrušené fondy se počítají jako zaostávající):

| Horizont | Mid-Year 2026 (data k 30. 6. 2026) | Year-End 2025 (data k 31. 12. 2025) |
|---|---:|---:|
| 1 rok | 78,69 % | 78,8 % (S&P zaokrouhluje na 79 %) |
| 3 roky | 76,63 % | 66,8 % |
| 5 let | 89,32 % | 89,0 % |
| 10 let | 83,33 % | 85,6 % |
| 15 let | 90,49 % | 89,9 % |
| 20 let | 92,61 % (jen sekundární zdroje) | 92,9 % |

Zdroje:

- [SPIVA U.S. Mid-Year 2026 (PDF)](https://www.spglobal.com/spdji/en/documents/spiva/spiva-us-mid-year-2026.pdf), vydáno v září 2026.
- [SPIVA U.S. Year-End 2025 (PDF)](https://www.spglobal.com/spdji/en/documents/spiva/spiva-us-year-end-2025.pdf).
- [Přehled SPIVA](https://www.spglobal.com/spdji/en/research-insights/spiva/).
- Za první pololetí 2026 zaostalo 67 % fondů, za celý rok 2025 79 %.

**Stav ověření:** spglobal.com blokuje automatické čtení (HTTP 403). Čísla jsou z výňatků stránek S&P ve
vyhledávači a souhlasí se sekundárními shrnutími. **Před použitím otevřít PDF v prohlížeči a zkontrolovat tabulku
Report 1.**

**SPIVA Europe** (fondy v EUR):

- **Year-End 2025, 1 rok:**
  - Fondy na US akcie: zaostalo 77 %.
  - Fondy na globální akcie (vs. S&P World): zaostalo 71 %.
- **Mid-Year 2025, 10 let:**
  - Fondy na globální akcie: zaostalo 98 %.
  - Fondy na US akcie: zaostalo 97 %.
- Zdroj: [SPIVA Europe Year-End 2025](https://www.spglobal.com/spdji/en/spiva/article/spiva-europe-year-end-2025/).
- Mid-Year 2026 Europe vyšla 13. 10. 2026, ale čísla pro fondy v EUR se mi získat nepodařilo.

### Day-trading

- **Brazílie:** Chague, De-Losso, Giovannetti, „Day Trading for a Living?“
  - Data: všichni, kdo začali day-tradovat futures na brazilský akciový index v letech 2013–2015.
  - Z těch, kdo vydrželi aspoň 300 dní, **97 % prodělalo**.
  - Jen asi 1 % vydělalo víc než minimální mzda.
  - Výkon se s praxí nezlepšuje.
  - Zdroje: [RePEc, pracovní verze 2019](https://ideas.repec.org/p/spa/wpaper/2019wpecon47.html), [SSRN 3423101](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3423101).
  - Starší verze uvádí 0,4 % s výdělkem nad plat bankovní pokladní. Revize z 2020 uvádí 1,1 % nad minimální mzdou
    a 0,5 % nad nástupním platem pokladní.
- **Tchaj-wan:** Barber, Lee, Liu, Odean, „The Cross-Section of Speculator Skill: Evidence from Day Trading“,
  *Journal of Financial Markets* 18 (2014). Data za 1992–2006.
  - Day-tradeři po poplatcích většinou prodělávají. V daném roce je v zisku asi 13 %.
  - Opakovaně a předvídatelně zisková je **méně než 1 %** day-traderů.
  - Zdroj: [pracovní verze, Berkeley](https://faculty.haas.berkeley.edu/odean/papers/day%20traders/Day%20Trading%20Skill%20110523.pdf).
- **ESMA k CFD** (tisková zpráva 27. 3. 2018, ESMA71-98-128):
  - Podle národních regulátorů **ztrácí peníze 74–89 % účtů drobných investorů**.
  - ESMA proto zakázala binární opce a CFD omezila: maximální páka, ochrana před záporným zůstatkem a povinné
    varování s podílem ztrátových účtů.
  - Zdroj: [ESMA](https://www.esma.europa.eu/node/84933).
  - Tato varování (např. „X % účtů ztrácí peníze“) dodnes uvádí každý broker nabízející CFD, včetně XTB. Číslo pro
    XTB lze ukázat živě na jeho webu.

### J.P. Morgan: zmeškané nejlepší dny

Viz kap. 4. Čísla J.P. Morgan (Guide to Retirement 2026, data k 31. 12. 2025, S&P 500 Total Return) se s mým
výpočtem shodují na dolar.

### Výhledy výnosů (pro zdůvodnění 7 %)

- [J.P. Morgan LTCMA 2027](https://am.jpmorgan.com/us/en/asset-management/adv/insights/portfolio-insights/ltcma/)
  (data k 9/2026): US large cap 7,5 % ročně v USD. Zvýšení o 0,8 p. b. zdůvodňují ziskovými maržemi nad 15 %.
- [J.P. Morgan LTCMA 2026 (tisková zpráva)](https://am.jpmorgan.com/us/en/asset-management/adv/about-us/media/press-releases/jp-morgan-releases-2026-long-term-capital-market-assumptions/): 6,7 %.
- [Vanguard 2026 Economic and Market Outlook](https://advisors.vanguard.com/insights/article/2026-economic-and-market-outlook)
  (12/2025): US akcie 4–5 % ročně na 10 let. Převzato z výsledků vyhledávání, stránku jsem neotevřel.

---

## Čísla pro slajdy

Zdroje do poznámek řečníka: Shiller = shillerdata.com, Damodaran = NYU Stern histretSP, ČNB = kurzy devizového
trhu, Yahoo = ^SP500TR/^GSPC. Výpočet ve všech případech `scripts/statistiky.py`, data k 9. 11. 2026, není-li
uvedeno jinak.

- **Slajd 13, čas mění pravděpodobnost** (S&P 500 s dividendami, Shiller 1871–2026, měsíční klouzavá okna):
  - 1 den: ztrátový je **46 %** dní (1928–2026).
  - 1 rok: ztráta v **27 %** případů.
  - 5 let: **10 %**.
  - 10 let: **3 %**.
  - 15 let: **0,1 %** (jediný start, září 1929).
  - 20 let: **0 %**. Nejhorších 20 let (start 9/1929) dalo +50 % celkem, tj. +2,1 % ročně.
  - Po inflaci: 1 rok 30 %, 10 let 11 %, 20 let 0,1 % (jediné okno, start 6/1901).
- **Slajd 14, day-trading:**
  - Brazílie: z vytrvalých day-traderů prodělalo **97 %** (Chague a kol.).
  - Tchaj-wan: předvídatelně zisková je **< 1 %** (Barber a kol.).
  - CFD: prodělává **74–89 %** účtů (ESMA 2018).
- **Slajd 15, SPIVA** (Mid-Year 2026, ověřit v PDF): za S&P 500 zaostalo **89 %** aktivních fondů za 5 let,
  **83 %** za 10 let, **90 %** za 15 let a **~93 %** za 20 let.
- **Slajd 16, zmeškané dny** (10 000 USD, 20 let do 9. 11. 2026, s dividendami):
  - Celou dobu investován: **80 000 USD** (11,0 % ročně).
  - Bez 10 nejlepších dní: **35 600 USD**, bez 20: **21 000 USD**, bez 30: **13 700 USD**.
  - **6 z 10** nejlepších dní přišlo do 2 týdnů od nejhorších.
  - Totéž, na dolar přesně, uvádí J.P. Morgan Guide to Retirement 2026 pro roky 2006–2025.
- **Slajdy 18–19, modelové příklady při 7 %:**
  - 10 000 Kč měsíčně → za 10/20/30 let **1,72 / 5,10 / 11,76 mil. Kč** (vloženo 1,2 / 2,4 / 3,6 mil.).
  - 15 000 Kč měsíčně → **2,58 / 7,66 / 17,64 mil. Kč**.
  - 20 000 Kč měsíčně → **3,44 / 10,21 / 23,52 mil. Kč**.
  - 500 000 Kč jednorázově → **0,98 / 1,93 / 3,81 mil. Kč**.
  - Spořák 3 % po dani: 15 000 Kč měsíčně za 30 let → 8,08 mil. Kč.
- **Slajd 33, propady:**

  | Propad | Bez dividend | S dividendami | Návrat bez dividend | Návrat s dividendami |
  |---|---:|---:|---|---|
  | 1929–32 | −86 % | −84 % | 25 let | 15 let |
  | 2000–02 | −49 % | −47 % | 7,2 roku | 6,1 roku |
  | 2007–09 | **−57 %** | −55 % | 5,5 roku | 4,5 roku |
  | 2020 | −34 % | | 6 měsíců | |
  | 2022 | −25 % | | 2 roky | |
  | jaro 2025 | −19 % | | 4 měsíce | |

  **Oprava osnovy:** v `OSNOVA.md` je u roku 2008 „−50 %“, správně je −57 % (cena) nebo −55 % (s dividendami).
- **Slajd 34, investice v roce 2000:**
  - Jednorázově 120 000 USD na konci roku 1999 → konec 2009 **109 000 USD** (−9 %).
  - Pravidelně 1 000 USD měsíčně → **128 000 USD** (+7 %).
  - Do konce 2013: jednorázově +64 %, pravidelně +80 %.
- **Slajd 36, kurzové riziko:**
  - Za 30 let vydělal S&P 500 v Kč **9,5 % ročně**, v USD 10,2 %.
  - Koruna posílila z 26,7 na 21,8 Kč/USD.
  - Mezi lety 2000 a 2009 ale korunový investor zažil propad **−72 %** a na vrchol z roku 2000 se vrátil až
    v prosinci 2014.
- **Dlouhodobý průměr:** S&P 500 s dividendami vynášel **10 % ročně** od 1928 (Damodaran), po inflaci **6,8 %**.

## Neověřeno / pozor

- **SPIVA:** S&P (spglobal.com) blokuje automatické čtení, čísla jsou z výňatků ve vyhledávači.
  - Hodnota za 20 let v Mid-Year 2026 (92,61 %) je jen ze sekundárních zdrojů.
  - Údaj, že 20 let přežilo jen 37 % fondů, je neověřený.
  - Před použitím otevřít PDF a zkontrolovat.
- **Chague a kol.:** podíly 1,1 % a 0,5 % a velikost vzorku (~19 600 osob) jsou z výňatků a sekundárních zdrojů,
  SSRN nebylo možné otevřít. Spolehlivě ověřené je 97 %.
- **Barber a kol.:** publikovaná verze může uvádět jiné počty obchodníků (výňatek zmiňoval „4 000“ místo
  „1 000 z 360 000“). Závěr „méně než 1 % je předvídatelně ziskových“ je z pracovní verze.
- **ESMA:** datum účinnosti opatření pro CFD jsem neověřoval.
- **Vanguard 4–5 %** je převzato z výsledků vyhledávání, stránku jsem neotevřel.
- **Srážková daň v irských ETF** (~−0,2 p. b. ročně proti ^SP500TR) je můj odhad (dividendový výnos ~1,3 % × 15 %).
- **Shillerova data:**
  - Ceny jsou měsíční průměry. Krátkodobé kolísání a propady podhodnocují (covid 2020: −19 % v měsíčních
    průměrech proti −34 % denně).
  - Proto propady počítám z denních dat. Pro nástroj „Co kdybych investoval v roce X“ (měsíční data) uvést
    poznámku, že skutečná dna byla hlubší.
- **Konec Shillerovy řady:**
  - Dividendy za 7–10/2026 chybí. Doplnil jsem poslední známou hodnotu, Shiller sám s nimi počítá jako s nulou.
  - CPI za 9–10/2026 je Shillerův odhad.
  - Cena za 10/2026 je jen close 2. 10. 2026.
- **Historie S&P 500:** index „S&P 500“ existuje od 1957. Dřívější data jsou předchůdci (S&P 90/Composite, před 1926
  Cowles). Yahoo ^GSPC není oficiální zdroj S&P, ale shoda s J.P. Morgan (data Bloomberg) je přesná.
- **Syntetický TR před 1988** je aproximace (ověřená odchylka −0,055 p. b. ročně v letech 1988–2026).
- **Překrývající se okna:** 20letých nezávislých období je od roku 1871 jen asi 7–8. „0 % ztrát za 20 let“ je
  historie, ne záruka.
- **Přeživší trh:** USA byly nejúspěšnějším trhem 20. století. Jiné trhy (Japonsko po 1989) měly mnohem delší
  ztrátová období.
- **Kč:**
  - Statistiky v Kč jsou jen od 1993 a jsou nominální. Českou inflaci jsem nestahoval, reálné výnosy v Kč tedy nejsou.
  - Kurz ČNB je fixován ve 14:30 SEČ, americká uzavírací cena je pozdější. Na dlouhodobé výsledky to nemá vliv.
- **Bez nákladů:** všechny historické výnosy jsou bez poplatků, daní a konverze měny. Skutečný investor v ETF
  dostane o něco méně (TER, srážková daň uvnitř fondu, 0,5 % konverze u XTB).
- **Posledních 10 let** (14–15 % ročně) je výjimečně dobrých. Na slajdech je nepoužívat jako očekávání.
