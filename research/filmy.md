# Filmy, seriály a skutečné příběhy o investování (ověřeno 2026-11-09)

Podklad pro oživení prezentace. Scény jsou popsané vlastními slovy (žádné doslovné citace z filmů).
Stav: **hotovo** (2026-11-09). Doporučení pro slajdy viz sekce E, neověřené body na konci souboru.

## Metodika výpočtů

- **Ceny akcií:** Yahoo Finance, denní uzavírací ceny (API `query1.finance.yahoo.com/v8/finance/chart/<TICKER>`),
  stažené 2026-11-09. Poslední použitá cena je **závěr 6. 11. 2026** (pátek).
  - „Jen cena“ = cena upravená o splity (rozdělení akcií), bez dividend.
  - „S dividendami“ = Yahoo „adjusted close“: dividendy reinvestované zpět do akcie, bez daní a poplatků.
    Yahoo do této řady započítává i spin-offy (IBM → Kyndryl 2021, AT&T → Warner Bros. Discovery 2022).
- **Index S&P 500 s dividendami:** Yahoo `^SP500TR` (data od 1988). Pro starší roky
  officialdata.org (data Roberta Shillera, měsíční průměry, poslední údaj září 2026).
- Vše v **USD, nominálně** (bez inflace), bez daní, poplatků a kurzu koruny. Pro rodinu stačí zaokrouhlit.
- Pro prezentaci platí: **minulé výnosy nejsou zárukou budoucích**. U jednotlivých akcií jde o výběr
  „s vědomím dneška“ (víme, že Apple uspěl). Proto vždy srovnání s indexem.

---

## A. Filmy a seriály, kde se dlouhodobé držení vyplatilo

### 1. Forrest Gump (1994), česky „Forrest Gump“ ★★★ nejsilnější

- **Rok uvedení:** 1994 (premiéra v USA 6. 7. 1994).
- **Scéna (vlastními slovy):** Forrest vypráví, že poručík Dan za něj vložil peníze do jakési „ovocné“
  firmy. Na obrazovce otevírá dopis s duhovým logem jablka (Apple Computer) a Dan mu pak volá, že
  o peníze už nikdy nebude mít starost.
- **Akcie:** Apple (AAPL).
- **Pozor na časovou osu:** dopis ve filmu je podle Snopes datovaný 23. 9. 1975, Apple ale vznikl až
  1. 4. 1976 a na burzu šel **12. 12. 1980** za 22 USD za akcii. Před rokem 1980 se tedy akcie Apple
  na burze koupit nedala. Ve filmu je to drobná chyba, pro prezentaci počítáme od IPO nebo od premiéry.
- **Splity Apple:** 2:1 (1987), 2:1 (2000), 2:1 (2005), 7:1 (2014), 4:1 (2020) = celkem 224×.
  Upisovací cena 22 USD odpovídá dnešním **0,10 USD** za akcii (Apple uvádí $.10).
- **Ověřený výsledek (cena 342,37 USD k 6. 11. 2026):**

  | Start | 1 000 USD dnes, jen cena | 1 000 USD dnes, s dividendami | Pro srovnání S&P 500 s dividendami |
  |---|---|---|---|
  | IPO za upisovací cenu 22 USD (12. 12. 1980) | ≈ **3,49 mil. USD** | (≈ 4,6 mil. USD, dopočet) | ≈ 171 tis. USD (start 1/1981, officialdata, k 9/2026) |
  | Závěr 1. dne obchodování 28,75 USD (12. 12. 1980) | ≈ 2,67 mil. USD | ≈ **3,49 mil. USD** | dtto |
  | Premiéra filmu (6. 7. 1994) | ≈ **1,47 mil. USD** | ≈ **1,78 mil. USD** | ≈ **30 tis. USD** (^SP500TR) |

  Průměrný roční výnos Apple od premiéry filmu ≈ 25–26 % ročně, S&P 500 s dividendami ≈ 11 % ročně.
- **Poctivá poznámka pro prezentaci (důležité):** Kdo koupil Apple v den premiéry filmu, měl
  v prosinci 1997 **o 50 % méně** (Apple byl tehdy blízko krachu). Od vrcholu v roce 1991 do konce
  1997 akcie spadla o **82 %** a znovu o **82 %** mezi březnem 2000 a dubnem 2003. Vydržet to s jednou
  akcií je psychicky velmi těžké. Index S&P 500 přitom z 1 000 USD udělal „jen“ 30 tisíc, ale s mnohem
  klidnější cestou. Apple je navíc vybraný zpětně: v roce 1994 nikdo nevěděl, že uspěje.
- **Míra jistoty:** scéna i firma **ověřeno** (Snopes, IMDb goofs); ceny **ověřeno** z dat Yahoo Finance
  a z Apple Investor Relations (IPO 22 USD, splity). Hodnota „od IPO s dividendami“ je dopočet.
- **Zdroje:**
  - https://www.snopes.com/fact-check/forrest-gump-plot/ (datum dopisu 23. 9. 1975, Apple založen 1976;
    stránka blokuje přímé čtení, údaje převzaty z výsledků vyhledávání, které ji citují)
  - https://en.wikipedia.org/wiki/Forrest_Gump (premiéra 6. 7. 1994)
  - https://m.imdb.com/title/tt0109830/goofs/?tab=gf
  - https://investor.apple.com/faq/default.aspx (IPO 12. 12. 1980 za 22 USD, splity, upravená cena $.10)
  - https://finance.yahoo.com/quote/AAPL/history/ (ceny, data přes API ke 6. 11. 2026)
  - https://www.officialdata.org/us/stocks/s-p-500/1981 (S&P 500 s dividendami od 1981)

### 2. Blast from the Past (1999), česky „Dožeň, co se dá!“ ★★★ silný (a skvělý protipříklad)

- **Český název:** TMDb uvádí „Dožeň, co se dá!“, katalog Národního filmového archivu „Dožeň co se dá!“
  (bez čárky). Obojí s vykřičníkem. ČSFD (ID 16539) se nepodařilo načíst (blokuje roboty).
- **Rok:** premiéra v USA 12. 2. 1999. Režie Hugh Wilson, hrají Brendan Fraser, Alicia Silverstone,
  Christopher Walken, Sissy Spacek.
- **Děj a scéna (vlastními slovy):** Vědec Calvin Webber se v roce 1962 během Karibské krize zavře
  s těhotnou ženou do protiatomového krytu a časový zámek je pustí ven až po 35 letech (1997). Syn Adam
  vyrazí nahoru s otcovými akciemi, které otec považuje za bezcenné. Adamův kamarád Troy pak
  v kufru najde certifikáty **IBM, AT&T a Polaroid** a makléř po telefonu zjistí, že akcie koupené
  v letech 1958–59, deset tisíc kusů od každé firmy, mají dnes hodnotu milionů. Adam s Evou akcie
  prodají a postaví rodičům nový dům.
  (Čtvrtá věc, kterou Troy zmíní, „Ipana“, je značka zubní pasty, ne akcie.)
- **Co se s firmami reálně stalo:**
  - **IBM:** existuje dodnes. Od 2. 1. 1962 do 6. 11. 2026: 1 000 USD → ≈ **33,6 tis. USD** jen cena,
    ≈ **171 tis. USD** s dividendami. Ve filmovém období 1962 → 1997 (1. 7. 1997): ≈ 6× cena,
    ≈ 15× s dividendami.
  - **AT&T:** v roce 1962 monopol „Ma Bell“. V roce 1984 ho soud rozdělil na AT&T + 7 regionálních
    „Baby Bells“. Dnešní AT&T Inc. (ticker T) je ve skutečnosti bývalá SBC (jedna z Baby Bells), která
    starou AT&T koupila v roce 2005 a převzala její jméno. Přesný výpočet pro držitele z roku 1962 je
    proto velmi složitý (desítky spin-offů a fúzí) a **neuvádím ho**. Od premiéry filmu (12. 2. 1999,
    řada dnešního T podle Yahoo): 1 000 USD → ≈ 564 USD jen cena, ≈ 3,4 tis. USD s dividendami.
  - **Polaroid:** v roce 1972 hvězda burzy (jedna z „Nifty Fifty“), v roce 1997 ještě kolem 60 USD
    za akcii. **11. 10. 2001 bankrot** (Chapter 11), obchodování zastaveno při 0,28 USD, firma prodána
    a stará společnost přejmenována na Primary PDC. Akcionáři a zaměstnanci podle Wikipedie
    „nedostali nic“. 1 000 USD v akciích Polaroidu → **0 USD**. (Dnešní značka Polaroid patří jiné firmě.)
    Ve filmu Adam akcie prodal v roce 1997, tedy **4 roky před krachem Polaroidu**. Měl štěstí.
- **Srovnání s indexem (klíčová pointa):**

  | Start | IBM s dividendami | AT&T (T) s dividendami | Polaroid | S&P 500 s dividendami |
  |---|---|---|---|---|
  | 1962 (začátek roku) | ≈ 171 tis. USD | složité, neuvedeno | 0 USD | ≈ **661 tis. USD** (officialdata, k 9/2026) |
  | Premiéra 12. 2. 1999 | ≈ 5,9 tis. USD | ≈ 3,4 tis. USD | 0 USD | ≈ **9,9 tis. USD** (^SP500TR) |

  Index S&P 500 porazil všechny tři otcovy firmy, a to od začátku děje i od premiéry filmu.
  Polaroid ukazuje, že i slavná firma může zmizet. Index takovou firmu prostě vyřadí a nahradí jinou.
  **Ideální příběh pro slajd „Proč index a ne jedna firma“ (OSNOVA č. 37).**
- **Upozornění:** Filmové „10 000 akcií koupených 1958–59“ nelze přesně přepočítat, Yahoo má data IBM
  až od 2. 1. 1962. Výpočet je proto od roku 1962. Polaroid 1958 → 1997 nepočítám (chybí data).
- **Míra jistoty:** názvy firem **ověřeno** (Wikiquote cituje Troyovu repliku a makléřův hovor);
  IBM a S&P 500 **ověřeno** z dat Yahoo/officialdata; Polaroid bankrot **ověřeno** (Wikipedia, soudní
  dokumenty); AT&T 1962 → dnes **neověřitelné jednoduše**, záměrně neuvedeno.
- **Zdroje:**
  - https://en.wikiquote.org/wiki/Blast_from_the_Past (zmíněné firmy IBM, AT&T, Polaroid; nákup 1958–59)
  - https://en.wikipedia.org/wiki/Blast_from_the_Past_(film) (děj, 1962 → 1997, premiéra 12. 2. 1999)
  - https://www.themoviedb.org/movie/11622/translations (český název „Dožeň, co se dá!“)
  - https://arl.nfa.cz/arl-nfa/en/detail-nfa_un_auth-0044088-Dozen-co-se-da/?disprec=1 (NFA: „Dožeň co se dá!“)
  - https://en.wikipedia.org/wiki/Polaroid_Corporation (bankrot 11. 10. 2001, akcionáři bez ničeho)
  - https://www.lopucki.law.ufl.edu/Professional_Fees/Fee%20applications%20and%20orders/Polaroid%20Corp/Salomon%20and%20Corbally/503b%20Fee%20App.pdf (soudní dokument, Primary PDC)
  - https://money.cnn.com/2001/10/12/companies/polaroid/ (zpráva o bankrotu, poslední cena 0,28 USD; stránka při ověřování nedostupná, údaj z výsledků vyhledávání)
  - https://finance.yahoo.com/quote/IBM/history/ , https://finance.yahoo.com/quote/T/history/
  - https://www.officialdata.org/us/stocks/s-p-500/1962

### 3. Futurama, díl „A Fishful of Dollars“ (1999), česky „Konzerva za všechny prachy“ ★★★ nejlepší na složené úročení

- **Rok:** 1. řada, 6. díl, první vysílání 27. 4. 1999 (Fox).
- **Scéna (vlastními slovy):** Fry se po tisíci letech v mrazáku probudí v roce 3000 a vzpomene si na
  starý bankovní účet. Měl na něm v roce 1999 jen 93 centů, ale díky úrokům z úroků za 1 000 let
  je z nich 4,3 miliardy dolarů. Většinu pak utratí za poslední plechovku ančoviček na světě.
- **Nejde o akcii,** ale o čisté složené úročení na bankovním účtu (2,25 % ročně podle Wikipedie).
- **Ověření matematiky:** 0,93 × 1,0225^1000 ≈ **4,28 mld. USD**. Sedí.
- **Pointa pro prezentaci:** I mizerný úrok 2,25 % udělá zázraky, když je čas dost dlouhý. Rodina ale
  1 000 let nemá. Proto potřebuje vyšší výnos (akcie ≈ 10 % ročně historicky) a začít co nejdřív.
  Pro srovnání: 2,25 % ročně zdvojnásobí peníze za 31 let, 10 % ročně za 7 let.
  Bonus: Fry peníze rozfofruje na jedno zbytečné přání, což je hezký vtip o chování s penězi.
- **Míra jistoty:** **ověřeno** (Wikipedia, The Infosphere; výpočet přepočítán).
- **Zdroje:**
  - https://en.wikipedia.org/wiki/A_Fishful_of_Dollars
  - https://theinfosphere.org/A_Fishful_of_Dollars
  - https://cs.wikipedia.org/wiki/Seznam_dílů_seriálu_Futurama (český název dílu)

### 4. Better Call Saul, finále „Saul Gone“ (2022), česky seriál „Volejte Saulovi“ ★★☆ Berkshire Hathaway

- **Rok:** 6. řada, 13. díl, vysíláno 15. 8. 2022 (AMC). Český název dílu se nepodařilo ověřit.
- **Scéna (vlastními slovy):** V jedné z retrospektiv se Jimmy (Saul) ptá ostatních, co by udělali se
  strojem času. Mike a Walter mluví o chybách, které by napravili. Jimmy odpoví, že by se vrátil do
  května 1965, kdy Warren Buffett převzal Berkshire Hathaway, koupil by akcie a vrátil se jako miliardář.
  Ostatní mu vyčítají, že myslí jen na peníze.
- **Akcie:** Berkshire Hathaway (BRK-A).
- **Ověřený výsledek (Berkshire, dopis akcionářům za rok 2025, tržní cena akcie):**
  - Konec 1964 → konec 2025: Berkshire **+6 099 294 %** (19,7 % ročně), S&P 500 s dividendami
    **+46 061 %** (10,5 % ročně).
  - 1 000 USD → ≈ **61 mil. USD** v Berkshire, ≈ **462 tis. USD** v S&P 500 (konec 2025).
    Od konce 2025 do 6. 11. 2026 přidala BRK-A dalších ≈ 13,5 % a S&P 500 s dividendami ≈ 8,8 % (Yahoo).
  - Od premiéry finále (15. 8. 2022) do 6. 11. 2026: BRK-A ≈ 1 882 USD z 1 000 USD, S&P 500 s dividendami
    ≈ 1 821 USD. Za poslední roky už Berkshire index poráží jen těsně.
- **Pointa:** i nejlepší investor historie měl nejlepší roky v minulosti. Buffett sám pro svou ženu
  doporučuje index (viz č. 6). Index dal „jen“ 10,5 % ročně, ale to z 1 000 USD udělalo téměř půl
  milionu, bez nutnosti trefit Buffetta.
- **Míra jistoty:** scéna **ověřena** (Wikipedia, Fox Business); čísla **ověřena z primárního zdroje**
  (Berkshire 2025 letter, s. „Berkshire's Performance vs. the S&P 500“) a z dat Yahoo.
- **Zdroje:**
  - https://en.wikipedia.org/wiki/Saul_Gone
  - https://www.foxbusiness.com/entertainment/better-call-saul-series-finale-billionaire-warren-buffett
  - https://cs.wikipedia.org/wiki/Volejte_Saulovi
  - https://www.berkshirehathaway.com/letters/2025ltr.pdf (výkonnost 1965–2025)
  - https://www.berkshirehathaway.com/letters/2024ltr.pdf (pro kontrolu: 1965–2024 19,9 % vs. 10,4 %)
  - https://finance.yahoo.com/quote/BRK-A/history/

### 5. Frequency (2000), česky „Frekvence“ ★★☆ protipříklad: Yahoo a bublina

- **Rok:** premiéra v USA 28. 4. 2000. Hrají Dennis Quaid, Jim Caviezel.
- **Scéna (vlastními slovy):** Syn v roce 1999 mluví přes starou vysílačku s otcem v roce 1969. Mimochodem
  poradí malému kamarádovi Gordovi, ať si zapamatuje „Yahoo“. Na konci filmu je Gordo boháč
  s mercedesem a SPZ „1 YAHOO“.
- **Realita:** Yahoo šlo na burzu 12. 4. 1996. Akcie uzavřela na historickém maximu **118,75 USD
  3. 1. 2000**, tedy necelé 4 měsíce před premiérou filmu. Pak praskla internetová bublina a 26. 9. 2001
  byla na **8,11 USD (−93 %)**. Firma kdysi oceněná na přes 100 mld. USD prodala v roce 2017 svůj hlavní
  byznys Verizonu za 4,48 mld. USD. Zbytek (hlavně podíl v Alibabě) pokračoval jako Altaba a v roce 2019
  zanikl.
- **Pointa:** film zachytil Yahoo na vrcholu. Kdo by po filmu koupil „tu jistou firmu“, přišel by
  o většinu peněz. Krásný kontrast k Forrestu Gumpovi: **dopředu nevíte, jestli máte Apple, nebo Yahoo.**
  Index obsahuje obě a vítězové v něm automaticky rostou.
- **Míra jistoty:** zápletka s Yahoo **ověřena** ze dvou recenzí/popisů děje (Wikipedia ji neuvádí);
  ceny Yahoo **ověřeno** (Wikipedia, Yahoo! Inc. 1995–2017). Hodnotu investice od premiéry do dneška
  nepočítám (Altaba se likvidovala postupně, složitý výpočet).
- **Zdroje:**
  - https://en.wikipedia.org/wiki/Frequency_(2000_film)
  - https://dennisschwartzreviews.com/frequency/ (recenze zmiňuje tip na Yahoo)
  - https://encyclosearch.org/encyclosphere/database/cache/a032aa5b87601abb9b2c3d59ff9baaa20b77ac664583821eac94cc01f112ac50/article.txt (popis děje: Gordo zbohatne na Yahoo)
  - https://www.imdb.com/title/tt0186151/goofs/ (SPZ „1 YAHOO“, údaj z výsledků vyhledávání)
  - https://www.themoviedb.org/movie/10559 (český název „Frekvence“)
  - https://en.wikipedia.org/wiki/Yahoo!_Inc._(1995–2017)

---

## B. Skutečné příběhy, které se dobře vyprávějí

### 6. Sázka Warrena Buffetta: index proti hedgeovým fondům (2008–2017) ★★★ nejsilnější „ze života“

- **Příběh:** Nejslavnější investor světa se v prosinci 2007 vsadil s firmou Protégé Partners o 1 milion
  dolarů pro charitu: obyčejný levný indexový fond na S&P 500 (Vanguard) porazí za 10 let pět
  profesionálně vybraných „fondů fondů“, které dohromady investovaly do více než 200 hedgeových fondů.
- **Ověřený výsledek (Buffettův dopis akcionářům za rok 2017):**

  | 2008–2017 | Celkem za 10 let | Ročně | 1 000 USD → |
  |---|---|---|---|
  | Indexový fond S&P 500 | **+125,8 %** | 8,5 % | **≈ 2 258 USD** |
  | Nejlepší z pěti fondů (C) | +87,7 % | 6,5 % | ≈ 1 877 USD |
  | Průměr pěti fondů (prostý průměr) | +36,3 % | | ≈ 1 363 USD |
  | Nejhorší fond (D, zrušen 2017) | +2,8 % | 0,3 % | ≈ 1 028 USD |

- **Proč profíci prohráli:** platili ročně průměrně kolem **2,5 % z majetku** na poplatcích (plus podíly
  na zisku). Buffett to shrnul větou „Performance comes, performance goes. Fees never falter.“
  (Výkonnost přichází a odchází, poplatky zůstávají.) **Perfektní most ke kapitole o poplatcích.**
- **Bonus pro kapitolu o krachu:** sázka začala těsně před krizí. Index v roce 2008 ztratil **37 %**, fondy
  „jen“ 16–30 %. Přesto index za 10 let jasně vyhrál, protože se z propadu vzpamatoval.
- **Bonus 2:** Buffett ve svém dopise za rok 2013 napsal, že pro svou ženu nařídil v závěti dát
  **90 % do velmi levného indexového fondu na S&P 500 a 10 % do krátkodobých státních dluhopisů**.
  Nejbohatší investor tedy pro vlastní rodinu volí index.
- **Výhra:** charita Girls Inc. of Omaha dostala 2 222 279 USD (sázka byla původně kryta dluhopisy,
  v roce 2012 je obě strany vyměnily za akcie Berkshire).
- **Míra jistoty:** **ověřeno z primárního zdroje** (Buffettovy dopisy akcionářům).
- **Zdroje:**
  - https://www.berkshirehathaway.com/letters/2017ltr.pdf (s. 11–12, tabulka výsledků sázky)
  - https://www.berkshirehathaway.com/letters/2013ltr.pdf (pokyny pro správce dědictví manželky, 90/10)

### 7. Grace Groner: sekretářka, 3 akcie a 7 milionů dolarů ★★★ skvělé pro publikum 55+

- **Příběh:** Sekretářka ve farmaceutické firmě Abbott Laboratories (Illinois) koupila v roce 1935
  **tři akcie** svého zaměstnavatele za celkem 180 USD (60 USD za kus). Nikdy je neprodala, akcie se
  mnohokrát rozdělily (splity) a dividendy reinvestovala. Žila skromně v malém domku a šaty kupovala
  v bazarech. Zemřela v lednu 2010 ve věku 100 let a její majetek přes **7 milionů USD** odkázala
  nadaci pro studenty Lake Forest College, kde sama studovala.
- **Výpočet (orientační):** 180 USD → ≈ 7 mil. USD za 75 let = zhruba 39 000× = ≈ 15 % ročně.
  Pozor, jde o jednu výjimečně úspěšnou firmu (a zřejmě i další úspory), nikoli typický výsledek.
- **Míra jistoty:** příběh **ověřen** (Lake Forest College potvrzuje 3 akcie Abbott a dar přes 7 mil. USD;
  Wikipedia s odkazem na Chicago Tribune a LA Times uvádí rok 1935 a 60 USD). Některé weby mylně
  zaměňují 180 USD za její jiný dar 180 000 USD na stipendia. Výpočet ročního výnosu je **odhad**.
- **Zdroje:**
  - https://www.lakeforest.edu/offices/groner
  - https://en.wikipedia.org/wiki/Grace_Groner
  - https://m.csmonitor.com/Business/new-economy/2010/0305/Secret-millionaire-donates-her-fortune-to-Lake-Forest-College.-Here-s-how-she-did-it

### 8. Ronald Read: pumpař a školník s 8 miliony ★★☆

- **Příběh:** Ronald Read z Brattleboro (Vermont) pracoval asi 25 let na benzince a pak jako uklízeč
  v obchodním domě JCPenney. Zemřel v červnu 2014 ve věku 92 let. Nikdo netušil, že má majetek kolem
  **8 milionů USD**, hlavně v akciích velkých známých firem vyplácejících dividendy (Procter & Gamble,
  J.P. Morgan, Johnson & Johnson, CVS, General Electric…). Měl jich nejméně **95**, mnohé držel
  desítky let a certifikáty měl v bankovní schránce. Odkázal 4,8 mil. USD místní nemocnici a 1,2 mil. USD
  knihovně.
- **Pointa:** nepotřeboval vysoký plat ani finanční vzdělání. Investoval pravidelně, do firem, kterým
  rozuměl, rozložil to do mnoha firem (takový „domácí index“) a nechal čas pracovat.
- **Míra jistoty:** **ověřeno** (CNBC, Motley Fool, NBC). Přesný počáteční vklad a roční výnos nejsou
  známé, proto bez výpočtu.
- **Zdroje:**
  - https://www.cnbc.com/2016/08/29/janitor-secretly-amassed-an-8-million-fortune.html
  - https://www.fool.com/investing/general/2015/02/15/how-did-a-janitor-amass-8-million-the-same-way-you.aspx
  - https://www.nbcnews.com/news/us-news/vermont-ex-janitor-bequeaths-secret-millions-library-hospital-n301396

### 9. Odkaz Benjamina Franklina: 200 let složeného úročení ★★☆ hezká historka, výsledek je ale „uhlazený“

- **Příběh:** Benjamin Franklin (zemřel 17. 4. 1790) odkázal Bostonu a Filadelfii po **1 000 librách**
  (asi 4 000 tehdejších dolarů každému městu). Peníze se měly půjčovat mladým řemeslníkům na úrok
  (Franklin počítal s 5 %). Po 100 letech šly 3/4 na veřejné stavby, zbytek se úročil dalších 100 let.
- **Franklinův plán:** po 100 letech 131 000 liber, po 200 letech **4 061 000 liber** (na město).
- **Skutečnost:** po 100 letech měl Boston ≈ 327 800 USD, Filadelfie jen ≈ 70 800 USD. V roce 1990
  (po 200 letech) měl bostonský fond ≈ **4,5–5 mil. USD**, filadelfský ≈ **2 mil. USD**.
  Z peněz vznikl mj. Franklin Institute v Bostonu (dnes Benjamin Franklin Cummings Institute of
  Technology) a stipendia pro studenty řemesel ve Filadelfii.
- **Pointa:** složené úročení opravdu funguje (z 4 000 USD miliony), ale realita zaostala za plánem:
  půjčky se nesplácely, zájem o ně upadal, fondy se soudily. Dobrá ilustrace, že „čas + úrok“ je silný,
  i když výnos není ideální.
- **Míra jistoty:** podmínky odkazu a Franklinův výpočet **ověřeno** z primárního zdroje (archiv města
  Boston). Hodnoty v roce 1990 se mezi zdroji liší (Boston 4,5 vs. 5 mil. USD), proto rozmezí.
- **Zdroje:**
  - https://www.cityofboston.gov/images_documents/Guide%20to%20the%20Franklin%20Fund%20records_tcm3-20691.pdf
  - https://www.mentalfloss.com/article/627475/200-year-old-gift-from-benjamin-franklin-to-boston-and-philadelphia
  - https://www.edweek.org/education/benjamin-franklins-penny-saved-means-training-dollars-for-2-cities/1990/04

### 10. Anne Scheiberová: daňová úřednice a 22 milionů ★☆☆ (záložní, slabší ověření)

- **Příběh:** Úřednice americké daňové správy (IRS), nikdy nevydělávala víc než ~4 000 USD ročně,
  v roce 1944 odešla do penze. Dlouhodobě držela akcie kvalitních firem a při úmrtí v lednu 1995
  (ve 101 letech) odkázala **22 mil. USD** Yeshiva University na stipendia pro ženy.
- **Pozor:** často citovaný „start s 5 000 USD“ **nelze spolehlivě ověřit** (Wikipedia odhaduje podle
  jejích dividend z roku 1936 portfolio ≈ 21 000 USD) a vykonavatel závěti uvedl, že její investiční
  um je v médiích přehnaný. Pro prezentaci raději použít Grace Groner nebo Ronalda Reada.
- **Zdroje:**
  - https://en.wikipedia.org/wiki/Anne_Scheiber
  - https://jweekly.com/1995/12/08/22-million-gift-to-yeshiva-u-sparks-big-fund-raising-effort/

---

## C. Protipříklady: spekulace ≠ investování

Krátký přehled pro slajd „Spekulace ≠ investování“ (OSNOVA č. 14). Ve všech případech jde o krátkodobé
sázky, podvody nebo vnitřní informace, ne o dlouhodobé vlastnictví firem.

| Film / seriál (rok) | Český název | O čem to je (vlastními slovy) | Ponaučení |
|---|---|---|---|
| The Wolf of Wall Street (2013) | **Vlk z Wall Street** | Skutečný příběh Jordana Belforta a firmy Stratton Oakmont: makléři po telefonu tlačili lidem bezcenné akcie malých firem, uměle hnali cenu nahoru a pak své podíly prodali („pump and dump“). Investoři přišli zhruba o 200 mil. USD, Belfort dostal 4 roky (odseděl 22 měsíců) a soud mu uložil vrátit 110,4 mil. USD. Na začátku filmu mu jeho první šéf Mark Hanna (McConaughey) u oběda vysvětluje, že cílem makléře je dostat peníze z kapsy klienta do své vlastní (scéna ověřena přes ACMI a Slashfilm). | Kdo vám volá s „tipem“, vydělává na vás. Časté obchodování živí makléře, ne vás. |
| Trading Places (1983) | **Záměna** | Bratři Dukeové spekulují na termínových kontraktech na mražený pomerančový džus podle ukradené zprávy o úrodě. Hrdinové je přechytračí, cena se zhroutí a Dukeové přijdou o všechno (ztráta 394 mil. USD z „margin callu“). V roce 2010 film citoval šéf americké komoditní komise a pravidlo zakazující obchodovat s ukradenými vládními informacemi se dodnes přezdívá „Eddie Murphy rule“ (zákon Dodd-Frank, § 746). | Sázky s pákou (na dluh) vás můžou zničit za jediný den. Akcie bez páky vás nikdy nedostanou „do mínusu“. |
| Wall Street (1987) | **Wall Street** | Mladý makléř Bud Fox chce rychle zbohatnout po boku dravce Gordona Gekka a obchoduje podle vnitřních (insider) informací. Skončí zatčený komisí SEC. Gekko pronese slavný projev, že chamtivost je prospěšná. | Rychlé zbohatnutí na burze často stojí na podvodu. |
| Boiler Room (2000) | **Riziko** | Vysokoškolák nastoupí do makléřské firmy J.T. Marlin, kde se po telefonu prodávají akcie téměř bezcenných firem. Jeden klient do nich vloží i úspory na dům a přijde o ně. Firmu nakonec rozbije FBI. | Nikdy nekupovat nic, co vám nabízí neznámý člověk po telefonu. |
| The Big Short (2015) | **Sázka na nejistotu** | Pár podivínů vsadí proti americkým hypotékám a v krizi 2008 vydělá miliardy. Michael Burry ale léta snášel posměch, investoři ho žalovali a chtěli peníze zpět. Film je spíš o tom, jak nikdo neumí trefit správný okamžik a jak banky hazardovaly. | Ani ti, kdo měli pravdu, to neměli snadné. **Navazující fakt:** S&P 500 s dividendami spadl od 9. 10. 2007 do 9. 3. 2009 o 55 %, ale už 2. 4. 2012 byl zpět na maximu a dnes je **6,8× výš** než na vrcholu 2007 (Yahoo ^SP500TR). |
| Dumb Money (2023) | **Peníze těch tupců** | Skutečný příběh GameStopu z ledna 2021: drobní investoři z Redditu vyhnali cenu akcie do nebes a hedgeové fondy, které sázely na pokles, prodělaly. Kdo ale koupil na vrcholu, dodnes tratí: závěr 27. 1. 2021 byl 86,88 USD (po splitu 4:1), 6. 11. 2026 je to **25,12 USD, tj. −71 %** (Yahoo, GME). | Honit „raketu“, o které všichni mluví, je sázka, ne investice. |
| Simpsonovi: „HOMR“ (2001) | **Simpsonovi: „Homr“** | Homer na festivalu uvidí novou technologii a vrazí všechny životní úspory do akcií jediné firmy (Animotion). Za dva dny firma zkrachuje. (Vymyšlená firma, ale vysíláno v lednu 2001, uprostřed splasknutí dot-com bubliny.) | Všechno do jedné „žhavé“ firmy = hazard. Proto index. |
| Přátelé: „The One with the Bullies“ (1996) | **Přátelé: „Frajeři“** | Monika místo nepříjemné práce zkusí vydělat obchodováním na burze se svými posledními 127 dolary, přijde o ně a nakonec musí do té práce nastoupit. | Day-trading jako „rychlý přivýdělek“ obvykle končí ztrátou. |

**Zdroje k tabulce:**
- https://www.themoviedb.org/movie/106646/translations (Vlk z Wall Street), https://en.wikipedia.org/wiki/The_Wolf_of_Wall_Street_(2013_film), https://en.wikipedia.org/wiki/Jordan_Belfort, https://www.acmi.net.au/stories-and-ideas/the-wolf-of-wall-street-fairy-dust/ , https://www.slashfilm.com/1166637/one-early-scene-made-the-wolf-of-wall-street-click-for-martin-scorsese (scéna s Hannou)
- https://www.themoviedb.org/movie/1621/translations (Záměna), https://en.wikipedia.org/wiki/Trading_Places
- https://www.themoviedb.org/movie/10673/translations (Wall Street, český název shodný), https://en.wikipedia.org/wiki/Wall_Street_(1987_film)
- https://www.themoviedb.org/movie/14181-boiler-room (Riziko), https://en.wikipedia.org/wiki/Boiler_Room_(film)
- https://www.themoviedb.org/movie/318846/translations (Sázka na nejistotu), https://en.wikipedia.org/wiki/The_Big_Short_(film)
- https://www.themoviedb.org/movie/792293 (Peníze těch tupců), https://en.wikipedia.org/wiki/Dumb_Money
- https://en.wikipedia.org/wiki/HOMR, https://cs.wikipedia.org/wiki/Simpsonovi_(12._řada)
- https://en.wikipedia.org/wiki/The_One_with_the_Bullies, https://cs.wikipedia.org/wiki/Seznam_dílů_seriálu_Přátelé
- Ceny: https://finance.yahoo.com/quote/%5ESP500TR/history/ , https://finance.yahoo.com/quote/GME/history/

### Dva vtipné doplňky na téma „panika a prodej“ (vymyšlené firmy)

- **Simpsonovi: „Burns Verkaufen der Kraftwerk“ (1991), česky „Jak Burns prodával elektrárnu“
  (3. řada, 11. díl):** Homer prodá svých 100 akcií elektrárny pochybnému makléři po 25 centech, tedy za
  25 USD, a utratí je za pivo. Téhož dne cena vyletí na 52 USD za akcii, takže by měl 5 200 USD.
  Ponaučení: kdo prodá ze strachu nebo pro rychlou radost, přijde o růst.
  Zdroje: https://en.wikipedia.org/wiki/Burns_Verkaufen_der_Kraftwerk ,
  https://simpsonswiki.com/wiki/Burns_Verkaufen_der_Kraftwerk , https://cs.wikipedia.org/wiki/Simpsonovi_(3._řada)
- **Show Jerryho Seinfelda: „The Stock Tip“ (1990), česky „Burzovní tip“ (1. řada, 5. díl):** George
  dostane tip na akcii a přemluví Jerryho, ať vloží 2 500 USD. Když akcie klesá, Jerry v panice prodá
  se ztrátou 1 500 USD, George vydrží a vydělá 8 000 USD. Ponaučení: panický prodej v poklesu zamkne
  ztrátu. (Pozor: je to zároveň příběh o „tipu“, tedy spekulaci, a firma je vymyšlená.)
  Zdroje: https://en.wikipedia.org/wiki/The_Stock_Tip , https://cs.wikipedia.org/wiki/Seznam_dílů_seriálu_Show_Jerryho_Seinfelda

---

## D. Prověřeno, ale do prezentace se nehodí

| Film / seriál | Český název | Proč ne |
|---|---|---|
| Hot Tub Time Machine (2010) | **To byl zítra flám** | Lou zůstane v roce 1986, využije znalost budoucnosti a založí firmu „Lougle“ (parodie na Google). Žádná skutečná akcie, jen vtip o cestování časem. Zdroj: https://en.wikipedia.org/wiki/Hot_Tub_Time_Machine , https://moviemistakes.com/film8357/ending , https://www.themoviedb.org/movie/23048/translations |
| Back to the Future Part II (1989) | **Návrat do budoucnosti II** | Biff zbohatne díky sportovnímu almanachu s výsledky zápasů 1950–2000, tedy sázkami se znalostí budoucnosti. To je hazard/podvod, ne investování. Šlo by použít jen jako vtip „kdo zná budoucnost, nepotřebuje index“. Zdroj: https://en.wikipedia.org/wiki/Back_to_the_Future_Part_II |
| Apple / Microsoft / Google / Amazon ve filmech | – | Kromě Forresta Gumpa (Apple) a parodie „Lougle“ jsem **nenašel ověřitelnou filmovou scénu**, kde by postava koupila akcie Microsoftu, Googlu nebo Amazonu. Nic nevymýšlím. Reálná čísla pro tyto firmy jsou níže v příloze. |

---

## E. Doporučení pro slajdy (3–4 nejlepší)

1. **Forrest Gump + Apple (úvodní háček, OSNOVA č. 2).** Film zná každý od 25 do 70 let, scéna je krátká
   a výsledek je ohromující: 1 000 USD v den premiéry ≈ 1,5 mil. USD (≈ 1,8 mil. s dividendami).
   Hned ale poctivě dodat: v roce 1997 byl Apple téměř na dně (−50 % od premiéry) a dopředu nikdo nevěděl,
   že uspěje. To připraví půdu pro index.
2. **Dožeň, co se dá! (IBM, AT&T, Polaroid) jako důkaz pro index (OSNOVA č. 37 a 45).** Nejlepší
   příběh celé sady: otec vybral tři „jisté“ firmy, jedna zkrachovala (Polaroid 2001), dvě rostly pomaleji
   než trh. Od roku 1962 udělal S&P 500 s dividendami z 1 000 USD ≈ 661 tis. USD, IBM ≈ 171 tis. USD,
   Polaroid 0. A „nedělat nic 35 let“ je přesně ta strategie, kterou doporučujeme, jen s indexem.
3. **Buffettova sázka (OSNOVA č. 15 a 24–29).** Skutečný příběh, ověřený z Buffettova dopisu:
   levný index porazil 200 hedgeových fondů o desítky procentních bodů, hlavně kvůli poplatkům ~2,5 % ročně.
   Perfektní most k tématu „poplatek z objemu je nepřítel“. Bonus: Buffett pro svou ženu volí 90 % index.
4. **Futurama, 93 centů → 4,3 miliardy (OSNOVA č. 17, sněhová koule).** Vtipné, rychlé, matematika sedí.
   Pointa: čas je nejsilnější přísada, a protože nemáme 1 000 let, potřebujeme vyšší výnos a začít hned.

**Náhradníci:** Grace Groner (3 akcie → 7 mil. USD, ideální pro generaci 55+), Frekvence/Yahoo jako
dvojice k Forrestu Gumpovi („Apple, nebo Yahoo? Dopředu to nevíte“), Simpsonovi „Homr“ na slajd
„Spekulace ≠ investování“, Sázka na nejistotu + data o krachu 2008 pro kapitolu o krachu.

---

## Příloha: reálné výsledky známých firem (Yahoo Finance, závěr 6. 11. 2026, 1 000 USD)

Jen jako podklad pro slajd „Firmy, které používáte každý den“. Pozor na zpětný výběr vítězů.

| Firma | Start | Jen cena | S dividendami |
|---|---|---|---|
| Microsoft (MSFT) | 1. den obchodování 13. 3. 1986 | ≈ 5,5 mil. USD | ≈ 9,0 mil. USD |
| Amazon (AMZN) | 1. den obchodování 15. 5. 1997 | ≈ 2,6 mil. USD | (nevyplácí dividendy) |
| Alphabet/Google (GOOGL) | 1. den obchodování 19. 8. 2004 | ≈ 113 tis. USD | ≈ 114 tis. USD |
| Coca-Cola (KO) | 4. 1. 1988 (rok, kdy začal nakupovat Buffett) | ≈ 38 tis. USD | ≈ 98 tis. USD |
| Berkshire Hathaway (BRK-A) | 17. 3. 1980 | ≈ 2,95 mil. USD | (nevyplácí dividendy) |
| S&P 500 s dividendami (^SP500TR) | 4. 1. 1988 | | ≈ 65 tis. USD |

Zdroj: https://finance.yahoo.com/ (historie cen, API chart, staženo 2026-11-09).

---

## Co se nepodařilo ověřit / na co si dát pozor

- **ČSFD** (Dožeň, co se dá!, ID 16539) blokuje automatické čtení. Český název ověřen přes TMDb a katalog NFA
  („Dožeň, co se dá!“ vs. NFA „Dožeň co se dá!“). Na slajd doporučuji **„Dožeň, co se dá!“**.
- **Dožeň, co se dá!:** přesný filmový výpočet (10 000 akcií od každé firmy koupených 1958–59) nelze udělat,
  data IBM jsou až od 1962 a Polaroid 1958–1997 chybí. **AT&T 1962 → dnes** záměrně nepočítám (rozdělení
  1984 na 8 firem a desítky dalších fúzí a spin-offů).
- **Forrest Gump:** film neříká, kolik peněz Dan investoval ani kdy. Čísla jsou „na 1 000 USD“.
  Internetové odhady „Forrest by měl miliardy“ vycházejí z vymyšlených předpokladů, nepoužívat.
- **Polaroid:** poslední cena 0,28 USD a „60 USD v roce 1997“ jsou z výsledků vyhledávání (CNN Money
  2001 se nepodařilo načíst). Že akcionáři nedostali nic, uvádí Wikipedia.
- **Better Call Saul:** český název dílu „Saul Gone“ neověřen.
- **Frekvence:** zápletka s Yahoo není v anglické Wikipedii, ověřeno jen přes recenze/popisy děje a IMDb
  goofs (IMDb přímo blokuje čtení).
- **Anne Scheiberová:** startovní částka 5 000 USD neověřitelná, proto jen jako záloha.
- **Franklin:** hodnoty v roce 1990 se mezi zdroji liší (Boston 4,5 vs. ~5 mil. USD).
- **Jordan Belfort:** Wikipedia nově uvádí, že v roce 2026 splnil povinnost náhrady škody, ale data
  ve zdroji si odporují. V prezentaci stačí „soud mu uložil vrátit 110 mil. USD“.
- Všechny výnosy jsou v **USD a nominálně** (bez inflace, daní, poplatků a kurzu koruny).
