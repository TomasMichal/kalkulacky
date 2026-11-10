# Zadání: „Jak nechat peníze pracovat“

Prezentace pro rodinu o investování do amerických akcií. **Termín: 26. 11. 2026.**

## Cíl

Vysvětlit rodině, že dlouhodobé a pravidelné investování do amerických akcií (index + největší firmy)
není hazard, ale jedna z nejspolehlivějších cest k majetku. Nikdo z publika zatím neinvestoval
a akcie bere jako hazard.

## Klíčová sdělení

1. Co akcie jsou a jak fungují (podíl na firmě, zisk, dividendy, růst hodnoty).
2. Správná cesta je dlouhodobé a konzistentní investování, ne denní trading ani spekulace.
3. Neplatit poplatky z objemu ani za aktivní správu, spravovat si portfolio sám. **Poplatek z objemu je špatný:
   tohle zdůrazňovat.**
4. Jak funguje složené úročení.
5. Spořicí účet není investování: nízký úrok, limit pro úročení, podmínky, 15% daň, inflace.
6. Časový test: po 3 letech držení se z prodeje neplatí daň.

## Publikum a jejich námitky

- Rodiče / prarodiče (55+), sourozenci a vrstevníci (25–50). Nikdo neinvestoval.
- Peníze mají teď na **spořicích účtech a termínovaných vkladech** a ve fondu **MONETA 2 konzervativní**
  (viz `research/produkty.md`).
- Námitky, na které musí prezentace odpovědět:
  1. „Je to hazard, kasino.“
  2. „Při krachu přijdu o všechno.“
  3. „Nemáme na to / jsme na to staří.“
  4. „Nerozumím tomu, je to příliš složité.“ → ukázat, že správná cesta je ve skutečnosti ta nejjednodušší.

## Rozhodnutí (2026-11-09)

| Oblast | Rozhodnutí |
|---|---|
| Název | **Jak nechat peníze pracovat** |
| Formát | PowerPoint (.pptx) |
| Předání | Osobně na TV/projektoru: málo textu, velké vizuály, poznámky pro řečníka v každém slajdu |
| Délka | **~31 slajdů, ~40 minut** včetně živé ukázky (zkráceno z 55 slajdů 2026-11-10) |
| Vizuální styl | Ilustrativní a hravý: ikony v kruzích, zaoblené karty, mince. Tmavě modrý titul, teplé světlé pozadí jako web |
| Písmo | **Avenir Next** (nadpisy i text). Je na každém Macu a má češtinu. Arial Rounded MT Bold česká písmena nemá |
| Generátor | `prezentace/vytvor.js` (pptxgenjs), `cd prezentace && npm run build` |
| Nástroj | Index (ETF na S&P 500) jako základ + jednotlivé velké firmy |
| Doporučený poměr | **50 % ETF / 50 % akcie velkých firem** |
| ETF | **SPYL** (SPDR S&P 500 UCITS ETF Acc, IE000XZSV718, TER 0,03 %, akumulační) |
| Nákup | XTB Investiční plán s automatickým měsíčním vkladem, akcie ve zlomcích |
| Předpoklad výnosu | 9,5 % ročně v Kč (historie 30 let) vs. spořák 2 % (1,7 % po dani) |
| Příklady firem | Firmy, které rodina sama používá (Apple, Google, Microsoft, Coca-Cola, McDonald's, Visa…) |
| Broker | Kritéria výběru + srovnání 3–4 brokerů neutrálně, **živá ukázka na XTB** |
| Rizika | Samostatná poctivá kapitola (propady, ztracená dekáda, kurzové riziko, psychologie) |
| Srovnání | Spořicí účet (typický úrok velkých bank: ČS, KB, ČSOB) + MONETA 2 konzervativní |
| Srovnání s fondem | Dvakrát odděleně: (1) stejný výnos trhu, rozdíl jen v poplatcích; (2) skutečný fond vs. S&P 500 |
| Modelové částky | 10 000, 15 000 a 20 000 Kč měsíčně + jednorázově 500 000 Kč |
| DIP | Úplně vynechat |
| Osobní zkušenost | **Ne na slajdech** (rozhodnuto 2026-11-10): prezentace nemá být zaměřená na mě, řeknu to v diskuzi |
| Filmové příklady | Ano: Forrest Gump (Apple), Dožeň, co se dá! (IBM, AT&T, Polaroid) + další, viz `research/filmy.md` |
| Interaktivní nástroje | Vlastní webové nástroje na **GitHub Pages** (viz níže) |

## Osobní příběh (jen do diskuze, ne na slajdy)

- Investuji od roku 2019.
- Motivace: zajištění na důchod, finanční nezávislost a filmy. Forrest Gump „investoval do nějaké ovocnářské
  firmy“ (Apple), v Dožeň, co se dá! otec investoval do IBM a AT&T, zavřel se na roky do krytu a syn
  pak byl bohatý. Akcie zmíněné ve filmech od té doby dál rostou.
- Styl: ETF + jednotlivé akcie.
- Prošel jsem propady (2020, 2022, jaro 2025): držel jsem a přikupoval.

## Interaktivní nástroje (web, GitHub Pages)

**Hotovo a zveřejněno 2026-11-10:** https://tomasmichal.github.io/kalkulacky/ (zdroj v `docs/`,
data z `scripts/export_web.py`). Přepínač světlého/tmavého režimu vpravo nahoře, na TV raději světlý.

1. **Kalkulačka složeného úročení**: předvyplněné 10/15/20 tis. Kč měsíčně a 500 tis. Kč jednorázově.
   (Alternativa: existující https://elementer.cz/nastroje/kalkulacka-slozeneho-uroceni/)
2. **Spořák vs. MONETA 2 konzervativní vs. ETF**: stejná částka třemi cestami, včetně daní, poplatků a inflace.
3. **„Co kdybych investoval v roce X“**: skutečná historická data S&P 500, výsledek i propady po cestě.
4. **Pravděpodobnost ztráty v čase**: posuvník délky držení (1 den až 20 let) → šance na ztrátu.

## Výchozí předpoklady (lze změnit)

- Jazyk prezentace: čeština.
- Historická data indexu v USD (standardní zdroje), modelové příklady v Kč, s poznámkou o kurzovém riziku.
- Konkrétní ETF: irské (UCITS) akumulační ETF na S&P 500. Americká ETF (VOO, SPY) nejsou
  pro retailové investory v EU dostupná (chybí KID dle PRIIPs).
- U spořicího účtu poctivě zmínit, že má své místo jako finanční rezerva. Akcie jsou na dlouhodobý majetek.

## Faktické nuance, které musí prezentace podchytit

Ověřeno 2026-11-10, podrobnosti a zdroje v `research/cr-banky-dane.md`, `research/brokeri-etf.md`
a `research/trh.md`.

- **Časový test** osvobozuje zisk z prodeje po 3 letech držení. Limit 40 mil. Kč byl **od 1. 1. 2026
  pro cenné papíry zrušen** (zůstal jen u kryptoměn). Hodnotový test: příjmy z prodeje (ne zisk) do 100 000 Kč
  ročně. Osvobozené příjmy nad 5 mil. Kč je nutné oznámit finančnímu úřadu.
- **Frakce (zlomky) akcií a ETF:** podle názoru GFŘ (mluvčí v médiích, žádný oficiální pokyn) se na
  frakci, kterou vlastní broker, časový test ani hodnotový test nevztahují. Lhůta běží až od vzniku celého
  kusu. U XTB je vlastníkem frakce XTB a kompenzační systém ji nekryje. **Rozhodnutí (2026-11-10):**
  ETF = **SPYL** (jednotka ~400 Kč, takže se kupují hlavně celé kusy), akcie přes **Investiční plán se zlomky**.
  V prezentaci poctivě říct, že u zlomků se časový test počítá až od složení celého kusu.
- **Dividendy časový test nepokrývá.** U US akcií se sráží 15 % (s W-8BEN, jinak 30 %). V ČR se zdaní
  15 % v samostatném základu (§ 16a) se zápočtem americké daně, takže v ČR se doplácí 0 Kč, ale
  přiznání podat nutné je (od roku 2027 hranice 40 tis. Kč pro zaměstnance). Akumulační ETF tohle řešení
  odstraňuje. U poloviny portfolia v jednotlivých akciích to zmínit u daní.
- **ETF má také poplatek z objemu (TER)**, jen zhruba 20× menší (0,03–0,07 % vs. 1,33 % + vstupní 1,5 %).
  Říct to otevřeně, jinak to někdo z rodiny později objeví a podkopá to důvěru.
- **XTB**: nákup bez provize do 100 000 EUR měsíčně, **konverze měny 0,5 % při nákupu i prodeji**.
  Bez poplatku z objemu do 250 000 EUR (nad to 0,02 % ročně). **W-8BEN se nevyplňuje automaticky**,
  v ukázce ho vyplnit ručně. **Varovat před CFD:** 79 % retailových CFD účtů u XTB je ve ztrátě a položka
  „S&P500“ v menu indexů je CFD, ne ETF.
- **Spořák velkých bank:** typicky 2 % před daní (1,7 % po dani). Bonusové sazby jsou jen s dalšími
  produkty banky. Úroky domácností z vkladů 2006–2025 byly v průměru ~1 %, reálně po dani a inflaci
  ~−2,4 % ročně. 100 000 Kč z roku 2000 má dnes kupní sílu ~45 500 Kč.
- **Předpoklad výnosu akcií v Kč pro modelové příklady: 9,5 % ročně** (rozhodnuto 2026-11-10). Je to
  skutečný výnos S&P 500 s dividendami v Kč za posledních 30 let. Na slajdech vždy uvádět jako „kdyby se
  opakovalo posledních 30 let“, ne jako slib. Do poznámek řečníka dát, že výhledy institucí jsou nižší
  (J.P. Morgan ~7,5 %, Vanguard 4–5 %) a trh je dnes draze oceněný (CAPE ~41).
- **Spořák pro modelové příklady: 2 % před daní, 1,7 % po dani.**

### Modelové příklady (nominálně, 9,5 % vs. spořák 1,7 % po dani, v mil. Kč)

| Částka | Roky | Vloženo | Akcie 9,5 % | Spořák 1,7 % |
|---|---|---|---|---|
| 10 000 Kč/měs | 10 / 20 / 30 | 1,20 / 2,40 / 3,60 | 1,95 / 6,77 / 18,73 | 1,31 / 2,85 / 4,68 |
| 15 000 Kč/měs | 10 / 20 / 30 | 1,80 / 3,60 / 5,40 | 2,92 / 10,16 / 28,10 | 1,96 / 4,28 / 7,02 |
| 20 000 Kč/měs | 10 / 20 / 30 | 2,40 / 4,80 / 7,20 | 3,89 / 13,55 / 37,46 | 2,61 / 5,70 / 9,36 |
| 500 000 Kč jednorázově | 10 / 20 / 30 | 0,50 | 1,24 / 3,07 / 7,61 | 0,59 / 0,70 / 0,83 |

Měsíční vklady na konci měsíce, měsíční úročení odvozené z ročního výnosu. Bez inflace (průměr ČR
2001–2025 ~3,1 % ročně), bez poplatků a konverze měny. Vypočítají to i webové nástroje.
- **Pro publikum 55+** je „desítky let“ stále reálný horizont (střední délka života, peníze pro
  vnoučata), ale peníze potřebné do ~5 let do akcií nepatří.
- Všechna čísla (úroky spořáků, poplatky fondů, historické výnosy, statistiky SPIVA) dohledat
  z aktuálních zdrojů a uvést zdroj v poznámkách řečníka.

## Repozitář

Celý projekt je veřejně na GitHubu: `TomasMichal/kalkulacky`, nástroje na
https://tomasmichal.github.io/kalkulacky/
