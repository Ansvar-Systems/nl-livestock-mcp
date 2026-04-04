/**
 * Netherlands Livestock MCP — Data Ingestion Script
 *
 * Sources:
 * - NVWA (Nederlandse Voedsel- en Warenautoriteit)
 * - Besluit houders van dieren (Bhvd)
 * - RVO (Rijksdienst voor Ondernemend Nederland)
 * - Wet dieren / Besluit diergeneeskundigen
 * - SDa (Autoriteit Diergeneesmiddelen) — antibiotic benchmarks
 * - Beter Leven keurmerk — Dierenbescherming
 * - FrieslandCampina weidegang requirements
 * - GD (Gezondheidsdienst voor Dieren) — disease programmes
 * - EU-Verordening 1/2005 (transport)
 * - EU-Verordening 1099/2009 (slacht)
 * - TRACES (Trade Control and Expert System)
 *
 * Usage: npm run ingest
 */

import { createDatabase } from '../src/db.js';
import { mkdirSync, writeFileSync } from 'fs';

mkdirSync('data', { recursive: true });
const db = createDatabase('data/database.db');

const now = new Date().toISOString().split('T')[0];

// ────────────────────────────────────────
// 1. Species
// ────────────────────────────────────────
const species = [
  { id: 'dairy_cattle', name: 'Melkvee', breeds: ['Holstein-Friesian', 'MRIJ', 'Jersey', 'Blaarkop', 'Groninger Blaarkop'] },
  { id: 'beef_cattle', name: 'Vleesvee', breeds: ['Limousin', 'Charolais', 'Belgische Blauwe', 'Blonde d\'Aquitaine', 'Hereford'] },
  { id: 'pigs', name: 'Varkens', breeds: ['Topigs Norsvin TN70', 'Duroc', 'Piétrain', 'Landras', 'Groot Yorkshire'] },
  { id: 'laying_hens', name: 'Leghennen', breeds: ['Lohmann Brown', 'Isa Brown', 'Dekalb White', 'Bovans Brown'] },
  { id: 'broilers', name: 'Vleeskuikens', breeds: ['Ross 308', 'Cobb 500', 'Hubbard JA757 (trager groeiend)', 'Ranger Classic'] },
  { id: 'goats', name: 'Geiten', breeds: ['Saanen', 'Toggenburger', 'Nubische geit', 'Boergeit'] },
  { id: 'sheep', name: 'Schapen', breeds: ['Texelaar', 'Swifter', 'Suffolk', 'Zwartbles', 'Blauwe Texelaar'] },
  { id: 'rabbits', name: 'Konijnen', breeds: ['Vlaamse Reus', 'Nieuw-Zeelander', 'Californian', 'Rex'] },
  { id: 'veal_calves', name: 'Vleeskalveren', breeds: ['Holstein-Friesian (stier)', 'Kruisling vleesvee'] },
  { id: 'ducks', name: 'Eenden', breeds: ['Pekin', 'Barbarie', 'Mulard'] },
  { id: 'turkeys', name: 'Kalkoenen', breeds: ['BUT Big 6', 'Hybrid Converter', 'Kelly Bronze'] },
];

for (const s of species) {
  db.run(
    `INSERT OR REPLACE INTO species (id, name, common_breeds) VALUES (?, ?, ?)`,
    [s.id, s.name, JSON.stringify(s.breeds)]
  );
}

console.log(`Inserted ${species.length} species.`);

// ────────────────────────────────────────
// 2. Welfare Standards
// ────────────────────────────────────────
const welfareStandards = [
  // --- Melkvee (dairy cattle) ---
  {
    species_id: 'dairy_cattle', production_system: 'ligboxenstal', category: 'weidegang',
    standard: 'Weidegang voor melkvee — zuivelcooperaties stellen weidegang als voorwaarde',
    legal_minimum: 'Geen wettelijke verplichting weidegang, maar zuivelcooperaties vereisen het (FrieslandCampina: minimaal 120 dagen per jaar, 6 uur per dag)',
    best_practice: 'Weidegang minimaal 180 dagen per jaar, 8+ uur per dag; kruidenrijk grasland',
    regulation_ref: 'Besluit houders van dieren art. 2.5; FrieslandCampina Foqus-weidegang',
    source: 'RVO / FrieslandCampina',
  },
  {
    species_id: 'dairy_cattle', production_system: 'all', category: 'huisvesting',
    standard: 'Minimale stalruimte per koe in ligboxenstal',
    legal_minimum: 'Voldoende ruimte om te liggen, staan en zich te bewegen; ligboxen per koe beschikbaar',
    best_practice: 'Minimaal 6.0 m2 per koe (ligboxenstal), 8.0 m2 (potstal); diep ingestrooide ligboxen',
    regulation_ref: 'Besluit houders van dieren art. 2.4',
    source: 'NVWA / Besluit houders van dieren',
  },
  {
    species_id: 'dairy_cattle', production_system: 'all', category: 'drinkwater',
    standard: 'Permanent toegang tot vers drinkwater',
    legal_minimum: 'Permanent beschikking over voldoende vers drinkwater',
    best_practice: 'Minimaal 2 drinkplaatsen per 20 koeien; drinkbakken regelmatig reinigen',
    regulation_ref: 'Besluit houders van dieren art. 2.3',
    source: 'NVWA / Besluit houders van dieren',
  },
  {
    species_id: 'dairy_cattle', production_system: 'all', category: 'lichtregime',
    standard: 'Voldoende licht in de stal',
    legal_minimum: 'Dieren mogen niet permanent in het donker worden gehouden; geschikte lichtperiode',
    best_practice: 'Minimaal 150-200 lux gedurende 16 uur per dag voor optimale melkproductie',
    regulation_ref: 'Besluit houders van dieren art. 2.6',
    source: 'NVWA / WUR',
  },
  {
    species_id: 'dairy_cattle', production_system: 'all', category: 'onthoornen',
    standard: 'Onthoornen kalveren — leeftijds- en verdovingseis',
    legal_minimum: 'Onthoornen alleen toegestaan bij kalveren jonger dan 2 maanden, onder lokale verdoving en pijnbestrijding (NSAID); door of onder toezicht van dierenarts',
    best_practice: 'Onthoornen voor 2 weken leeftijd met sedatie + lokale verdoving + langdurige NSAID; fokkerij op hoornloosheid (Pp-gen)',
    regulation_ref: 'Besluit houders van dieren art. 2.7; Besluit diergeneeskundigen',
    source: 'NVWA / KNMvD / WUR',
  },

  // --- Vleesvee (beef cattle) ---
  {
    species_id: 'beef_cattle', production_system: 'all', category: 'buitenuitloop',
    standard: 'Buitenuitloop aanbevolen voor vleesvee',
    legal_minimum: 'Geen wettelijke verplichting buitenuitloop; adequate stalruimte vereist naar gewicht dier',
    best_practice: 'Buitenuitloop bieden; minimaal 3.0 m2 per dier tot 300 kg, 4.5 m2 boven 300 kg',
    regulation_ref: 'Besluit houders van dieren art. 2.4-2.5',
    source: 'NVWA / Besluit houders van dieren',
  },
  {
    species_id: 'beef_cattle', production_system: 'all', category: 'huisvesting',
    standard: 'Minimum staloppervlakte per dier naar gewicht',
    legal_minimum: 'Voldoende ruimte om normaal gedrag te vertonen; oppervlakte afgestemd op lichaamsgewicht',
    best_practice: 'Ruim ingestrooide groepshuisvesting; 3.5 m2 per dier (200-350 kg), 5.0 m2 (>350 kg)',
    regulation_ref: 'Besluit houders van dieren art. 2.4',
    source: 'NVWA / Besluit houders van dieren',
  },

  // --- Varkens (pigs) ---
  {
    species_id: 'pigs', production_system: 'indoor', category: 'vloeroppervlakte',
    standard: 'Minimum vloeroppervlakte per varken — wettelijk vastgelegd',
    legal_minimum: 'Gespeende biggen: 0.30 m2; vleesvarkens (65-110 kg): 0.65 m2; vleesvarkens (>110 kg): 1.0 m2; zeugen (groepshuisvesting): 2.25 m2',
    best_practice: 'Vleesvarkens 0.8-1.0 m2; zeugen 2.5+ m2; biggen 0.40 m2 met strohoudend substraat',
    regulation_ref: 'Besluit houders van dieren art. 2.17-2.22; Varkensbesluit',
    source: 'NVWA / Besluit houders van dieren',
  },
  {
    species_id: 'pigs', production_system: 'all', category: 'castratie',
    standard: 'Verbod op castratie zonder verdoving',
    legal_minimum: 'Chirurgische castratie alleen toegestaan onder verdoving en pijnbestrijding (per 2009)',
    best_practice: 'Geen castratie; gebruik van immunocastratie (Improvac) of fokkerij op beren',
    regulation_ref: 'Besluit houders van dieren art. 2.21; Verklaring van Noordwijk 2007',
    source: 'NVWA / SBV / Dierenbescherming',
  },
  {
    species_id: 'pigs', production_system: 'all', category: 'afleidingsmateriaal',
    standard: 'Afleidingsmateriaal verplicht voor alle varkens',
    legal_minimum: 'Permanent beschikking over afleidingsmateriaal dat manipuleerbaar, kauwbaar, eetbaar en onderzoekbaar is',
    best_practice: 'Combinatie van stro, hooi, jute zakken en hout; dagelijks verse aanvulling',
    regulation_ref: 'Besluit houders van dieren art. 2.22; EU-richtlijn 2008/120/EG',
    source: 'NVWA / EU Commissie',
  },
  {
    species_id: 'pigs', production_system: 'all', category: 'staartcouperen',
    standard: 'Staarten couperen bij varkens — beperkt toegestaan',
    legal_minimum: 'Routinematig couperen verboden. Alleen toegestaan als aantoonbaar andere maatregelen tegen staartbijten onvoldoende zijn; maximaal de helft van de staart; door dierenarts of onder toezicht',
    best_practice: 'Krulstaart houden; risicofactoren voor staartbijten wegnemen (ventilatie, afleidingsmateriaal, bezettingsdichtheid, voercompetitie)',
    regulation_ref: 'Besluit houders van dieren art. 2.21; EU-richtlijn 2008/120/EG bijlage I hfd. I',
    source: 'NVWA / Dierenbescherming',
  },

  // --- Leghennen (laying hens) ---
  {
    species_id: 'laying_hens', production_system: 'verrijkte_kooi', category: 'huisvesting',
    standard: 'Minimum leefruimte per leghen — verrijkte kooi',
    legal_minimum: 'Minimaal 750 cm2 per hen in verrijkte kooien, waarvan 600 cm2 bruikbaar oppervlak; zitstok 15 cm per hen',
    best_practice: 'Overschakelen naar scharrel- of volieresysteem; kooihuisvesting wordt steeds minder geaccepteerd',
    regulation_ref: 'Besluit houders van dieren art. 2.45-2.48; EU-richtlijn 1999/74/EG',
    source: 'NVWA / EU Commissie',
  },
  {
    species_id: 'laying_hens', production_system: 'scharrel', category: 'huisvesting',
    standard: 'Scharrelsysteem — maximaal 9 hennen per m2',
    legal_minimum: 'Maximaal 9 hennen per m2 bruikbare vloeroppervlakte (1111 cm2/hen); strooiselruimte, zitstokken, legnesten',
    best_practice: 'Maximaal 7 hennen per m2; overdekte uitloop; wintergarten',
    regulation_ref: 'Besluit houders van dieren art. 2.49-2.51',
    source: 'NVWA / Besluit houders van dieren',
  },
  {
    species_id: 'laying_hens', production_system: 'vrije_uitloop', category: 'uitloop',
    standard: 'Vrije uitloop — minimaal 4 m2 per hen buitenruimte',
    legal_minimum: 'Minimaal 4 m2 buitenuitloop per hen; uitloopopeningen voldoende breed',
    best_practice: 'Structuurrijke uitloop met bomen en schuilmogelijkheden; 8+ m2 per hen',
    regulation_ref: 'Besluit houders van dieren art. 2.52; EU-verordening 589/2008',
    source: 'NVWA / EU Commissie',
  },
  {
    species_id: 'laying_hens', production_system: 'all', category: 'snavelbehandeling',
    standard: 'Verbod op snavelkappen per 2018',
    legal_minimum: 'Snavelbehandeling verboden per 1 september 2018 (ook infrarood)',
    best_practice: 'Fokkerij op kalme rassen; omgevingsverrijking; goede ventilatie en lichtregime',
    regulation_ref: 'Besluit houders van dieren art. 2.55; Ingangsdatum 1-9-2018',
    source: 'NVWA / Rijksoverheid',
  },

  // --- Vleeskuikens (broilers) ---
  {
    species_id: 'broilers', production_system: 'regulier', category: 'bezettingsdichtheid',
    standard: 'Maximum bezettingsdichtheid vleeskuikens — regulier',
    legal_minimum: 'Maximaal 42 kg/m2 bij reguliere houderij (mits voldaan aan uitvalcriteria en welzijnsparameters)',
    best_practice: 'Maximaal 33-38 kg/m2; trager groeiende rassen voor betere welzijnsuitkomsten',
    regulation_ref: 'Besluit houders van dieren art. 2.57-2.62; EU-richtlijn 2007/43/EG',
    source: 'NVWA / EU Commissie',
  },
  {
    species_id: 'broilers', production_system: 'trager_groeiend', category: 'bezettingsdichtheid',
    standard: 'Trager groeiende vleeskuikens — lagere bezettingsdichtheid',
    legal_minimum: 'Maximaal 39 kg/m2 voor trager groeiende rassen (daggroei <50 g/dag)',
    best_practice: 'Maximaal 30 kg/m2; buitenuitloop; Beter Leven 1 ster of hoger',
    regulation_ref: 'Besluit houders van dieren art. 2.62; Kip van Morgen criteria',
    source: 'NVWA / Dierenbescherming',
  },
  {
    species_id: 'broilers', production_system: 'all', category: 'daglicht',
    standard: 'Daglicht en strooisel verplicht voor vleeskuikens',
    legal_minimum: 'Toegang tot daglicht; strooisel op de gehele vloer; minimaal 20 lux gedurende lichtperiode',
    best_practice: 'Minimaal 50 lux daglicht; dag-nachtritme 18L:6D; droog strooisel',
    regulation_ref: 'Besluit houders van dieren art. 2.59-2.60',
    source: 'NVWA / Besluit houders van dieren',
  },
  {
    species_id: 'broilers', production_system: 'all', category: 'uitvalmonitoring',
    standard: 'Uitvalpercentage monitoring verplicht',
    legal_minimum: 'Dagelijkse registratie uitval; overschrijding uitvalnormen leidt tot verlaging bezettingsdichtheid',
    best_practice: 'Uitval onder 3.5%; realtime monitoring met automatische alarmsystemen',
    regulation_ref: 'Besluit houders van dieren art. 2.61; NVWA-beleidsregel',
    source: 'NVWA / Besluit houders van dieren',
  },

  // --- Geiten (goats) ---
  {
    species_id: 'goats', production_system: 'all', category: 'huisvesting',
    standard: 'Minimale stalruimte en hoornverzorging voor geiten',
    legal_minimum: 'Voldoende ruimte per geit; hoornverzorging (onthoornen) alleen onder verdoving',
    best_practice: 'Minimaal 1.5 m2 per melkgeit; verhoogde ligplaatsen; weidegang aanbevolen maar niet verplicht',
    regulation_ref: 'Besluit houders van dieren art. 2.4, 2.7',
    source: 'NVWA / Besluit houders van dieren',
  },
  {
    species_id: 'goats', production_system: 'all', category: 'weidegang',
    standard: 'Weidegang aanbevolen maar niet verplicht voor geiten',
    legal_minimum: 'Geen wettelijke verplichting tot weidegang; adequate huisvesting en voeding vereist',
    best_practice: 'Weidegang in voorjaar en zomer; browsen op struikgewas en onkruid; rotatiebegrazing',
    regulation_ref: 'Besluit houders van dieren; GD Gezondheidsdienst voor Dieren',
    source: 'GD / NVWA',
  },

  // --- Schapen (sheep) ---
  {
    species_id: 'sheep', production_system: 'all', category: 'staartcouperen',
    standard: 'Staart couperen beperkt toegestaan',
    legal_minimum: 'Staart couperen alleen met rubber ring; niet korter dan derde staartwervels; alleen bij schapen jonger dan 7 dagen',
    best_practice: 'Niet couperen tenzij medisch noodzakelijk; alternatief fokken op kortere staarten',
    regulation_ref: 'Besluit houders van dieren art. 2.7',
    source: 'NVWA / Besluit houders van dieren',
  },
  {
    species_id: 'sheep', production_system: 'outdoor', category: 'weidebeheer',
    standard: 'Weide- en stalhuisvestingsnormen voor schapen',
    legal_minimum: 'Beschutting tegen extreme weersomstandigheden; voldoende voer en water beschikbaar',
    best_practice: 'Schuilmogelijkheid permanent beschikbaar; rotatiebegrazing; stalruimte 1.5 m2 per ooi',
    regulation_ref: 'Besluit houders van dieren art. 2.4-2.5',
    source: 'NVWA / Besluit houders van dieren',
  },
  {
    species_id: 'sheep', production_system: 'all', category: 'identificatie',
    standard: 'Oormerken verplicht voor alle schapen',
    legal_minimum: 'Twee oormerken (elektronisch + visueel) binnen 6 maanden na geboorte; I&R-registratie',
    best_practice: 'Oormerken aanbrengen zodra praktisch mogelijk; UBN-registratie up-to-date houden',
    regulation_ref: 'Regeling identificatie en registratie van dieren 2014; EU-verordening 21/2004',
    source: 'RVO / EU',
  },

  // --- Konijnen (rabbits) ---
  {
    species_id: 'rabbits', production_system: 'all', category: 'groepshuisvesting',
    standard: 'Groepshuisvesting verplicht per 2016 voor vleeskonijnen',
    legal_minimum: 'Groepshuisvesting verplicht per 2016; parkhuisvesting met verhoging (platform); minimaal 800 cm2 per konijn',
    best_practice: 'Minimaal 1500 cm2 per konijn; knaaghout en hooi als verrijking; groepsgrootte 6-8 dieren',
    regulation_ref: 'Besluit houders van dieren art. 2.25-2.28',
    source: 'NVWA / Besluit houders van dieren',
  },

  // ────────────────────────────────────────
  // Transport rules (EU-Verordening 1/2005)
  // ────────────────────────────────────────
  {
    species_id: 'dairy_cattle', production_system: 'all', category: 'transport_reistijd',
    standard: 'Maximum reistijd runderen — EU-transportverordening',
    legal_minimum: 'Maximaal 8 uur transport zonder rustperiode. Na 8 uur: minimaal 1 uur rust met voer en water. Met goedgekeurd voertuig (type 2): maximaal 29 uur mits na 14 uur 1 uur rust. Kalveren <14 dagen: niet vervoeren tenzij <100 km',
    best_practice: 'Transport zo kort mogelijk houden; maximaal 4 uur voor slachtdieren; dieren voor vertrek voldoende laten drinken',
    regulation_ref: 'EU-Verordening 1/2005 art. 3 en bijlage I hfd. V; Wet dieren art. 4.1',
    source: 'NVWA / EU',
  },
  {
    species_id: 'pigs', production_system: 'all', category: 'transport_reistijd',
    standard: 'Maximum reistijd varkens — EU-transportverordening',
    legal_minimum: 'Maximaal 8 uur transport zonder rustperiode. Na 8 uur: 24 uur rust op verzamelcentrum of 24 uur doortransport met type 2-voertuig (voer, water, ventilatie). Biggen <10 kg: maximaal 4 uur. Niet-gespeende biggen: niet vervoeren',
    best_practice: 'Transport maximaal 4 uur; antimortaliteitsprotocol bij warm weer (>27 C); sproeiinstallatie op voertuig',
    regulation_ref: 'EU-Verordening 1/2005 bijlage I hfd. V; Besluit houders van dieren',
    source: 'NVWA / EU',
  },
  {
    species_id: 'sheep', production_system: 'all', category: 'transport_reistijd',
    standard: 'Maximum reistijd schapen en geiten — EU-transportverordening',
    legal_minimum: 'Maximaal 8 uur zonder rust. Na 8 uur: minimaal 1 uur rust met water. Lammeren <1 week: niet vervoeren tenzij <100 km',
    best_practice: 'Transport maximaal 4 uur; geschoren dieren extra bescherming tegen kou; pas geschoren dieren niet vervoeren bij temperatuur <0 C',
    regulation_ref: 'EU-Verordening 1/2005 bijlage I hfd. V; Wet dieren art. 4.1',
    source: 'NVWA / EU',
  },
  {
    species_id: 'laying_hens', production_system: 'all', category: 'transport_reistijd',
    standard: 'Maximum reistijd pluimvee — EU-transportverordening',
    legal_minimum: 'Maximaal 12 uur transport (exclusief laden/lossen). Voldoende ventilatie en ruimte in transportcontainers. Minimaal 160 cm2 per kg levend gewicht',
    best_practice: 'Transport bij voorkeur in de nacht of vroege ochtend (minder stress); ventilatie continu controleren; bij >30 C extra koeling',
    regulation_ref: 'EU-Verordening 1/2005 bijlage I hfd. VII; Besluit houders van dieren',
    source: 'NVWA / EU',
  },
  {
    species_id: 'dairy_cattle', production_system: 'all', category: 'transport_voertuig',
    standard: 'Voertuigeisen diertransport — goedkeuring en inrichting',
    legal_minimum: 'Vervoerder moet beschikken over vergunning type 1 (<8 uur) of type 2 (>8 uur). Voertuig moet zijn goedgekeurd door NVWA. Vereist: antislipvloer, voldoende ventilatie, scheidingswanden, watervoorziening (type 2), GPS-tracking (type 2)',
    best_practice: 'Mechanische ventilatie met temperatuurbewaking; watervoorziening ook bij korte ritten; beschikbare laadklep met antislip',
    regulation_ref: 'EU-Verordening 1/2005 art. 6, 18 en bijlage I hfd. II; NVWA-certificering',
    source: 'NVWA / EU',
  },
  {
    species_id: 'dairy_cattle', production_system: 'all', category: 'transport_temperatuur',
    standard: 'Temperatuurgrenzen bij diertransport',
    legal_minimum: 'Transport verboden bij buitentemperatuur >35 C (tenzij voertuig gekoeld). Bij temperatuur <-10 C: extra beschermende maatregelen. Temperatuurbewaking verplicht bij ritten >8 uur (type 2-voertuig)',
    best_practice: 'Transporteren vermijden bij temperaturen >30 C; bij warmte: lagere bezettingsdichtheid (10-20% minder), extra ventilatie, sproeiinstallatie',
    regulation_ref: 'EU-Verordening 1/2005 bijlage I hfd. III en VI; NVWA-richtlijn hitte',
    source: 'NVWA / EU',
  },

  // ────────────────────────────────────────
  // Ingrepen per diersoort
  // ────────────────────────────────────────
  {
    species_id: 'pigs', production_system: 'all', category: 'ingreep_tandjes_knippen',
    standard: 'Tandjes vijlen of knippen bij biggen',
    legal_minimum: 'Routinematig knippen of vijlen van hoektanden verboden. Alleen toegestaan als aantoonbaar andere maatregelen tegen speenbeschadiging onvoldoende zijn; alleen vijlen (niet knippen) binnen 7 dagen na geboorte',
    best_practice: 'Niet uitvoeren; speen- en uiergezondheid zeug optimaliseren; toomgrootte beperken',
    regulation_ref: 'Besluit houders van dieren art. 2.21; EU-richtlijn 2008/120/EG bijlage I',
    source: 'NVWA / Dierenbescherming',
  },
  {
    species_id: 'goats', production_system: 'all', category: 'ingreep_onthoornen',
    standard: 'Onthoornen geiten — verdoving verplicht',
    legal_minimum: 'Onthoornen alleen toegestaan onder volledige verdoving (algehele sedatie + lokale anesthesie) en pijnbestrijding (NSAID); door dierenarts. Geen leeftijdsgrens maar zo jong mogelijk aanbevolen',
    best_practice: 'Onthoornen voor 2 weken leeftijd; fokkerij op hoornloosheid; polled-gen selectie',
    regulation_ref: 'Besluit houders van dieren art. 2.7; Besluit diergeneeskundigen',
    source: 'NVWA / KNMvD',
  },

  // ────────────────────────────────────────
  // Beter Leven criteria per ster
  // ────────────────────────────────────────
  {
    species_id: 'pigs', production_system: 'beter_leven_1ster', category: 'beter_leven',
    standard: 'Beter Leven 1 ster — varkens: minimale verbeteringen boven wettelijk minimum',
    legal_minimum: 'Beter Leven 1 ster varkens: minimaal 1.0 m2 per vleesvarken (regulier 0.65 m2); afleidingsmateriaal verplicht (stro/hooi/jute); daglicht via ramen; 40% dichte vloer',
    best_practice: 'Meer ruimte, stro op dichte vloer, groepsgrootte maximaal 80 dieren; geen routinematig staartcouperen',
    regulation_ref: 'Beter Leven criteria varkens 2024; Dierenbescherming',
    source: 'Dierenbescherming / Beter Leven keurmerk',
  },
  {
    species_id: 'pigs', production_system: 'beter_leven_2ster', category: 'beter_leven',
    standard: 'Beter Leven 2 sterren — varkens: scharrelvarken met buitenuitloop',
    legal_minimum: 'Beter Leven 2 sterren varkens: minimaal 1.5 m2 binnen + 1.0 m2 buitenuitloop per vleesvarken; stro in liggebied; intacte staart (couperen verboden); permanente buitenuitloop',
    best_practice: 'Ruime overdekte buitenuitloop; modderplaats in de zomer; groepsgrootte maximaal 50 dieren',
    regulation_ref: 'Beter Leven criteria varkens 2024; Dierenbescherming',
    source: 'Dierenbescherming / Beter Leven keurmerk',
  },
  {
    species_id: 'pigs', production_system: 'beter_leven_3ster', category: 'beter_leven',
    standard: 'Beter Leven 3 sterren — varkens: biologisch niveau',
    legal_minimum: 'Beter Leven 3 sterren varkens: minimaal 2.3 m2 binnen + 1.9 m2 buitenuitloop per vleesvarken; biologisch voer (>95%); intacte staart; weidegang; langere groeiperiode (minimaal 22 weken)',
    best_practice: 'Vergelijkbaar met EU-biologisch (SKAL); weidegang met rotatiebegrazing; fokkerij op robuuste rassen',
    regulation_ref: 'Beter Leven criteria varkens 2024; EU-Verordening 2018/848 (bio)',
    source: 'Dierenbescherming / SKAL',
  },
  {
    species_id: 'broilers', production_system: 'beter_leven_1ster', category: 'beter_leven',
    standard: 'Beter Leven 1 ster — vleeskuikens: trager groeiend ras',
    legal_minimum: 'Beter Leven 1 ster vleeskuikens: trager groeiend ras (daggroei <50 g); maximaal 25 kg/m2; daglicht via ramen (3% vloeroppervlak); 6 uur aaneengesloten donker; strobalen als verrijking',
    best_practice: 'Maximaal 20 kg/m2; overdekte buitenuitloop (wintergarten); minimaal 56 dagen groeiperiode',
    regulation_ref: 'Beter Leven criteria vleeskuikens 2024; Dierenbescherming',
    source: 'Dierenbescherming / Beter Leven keurmerk',
  },
  {
    species_id: 'laying_hens', production_system: 'beter_leven_1ster', category: 'beter_leven',
    standard: 'Beter Leven 1 ster — leghennen: scharrel met daglicht',
    legal_minimum: 'Beter Leven 1 ster leghennen: maximaal 9 hennen per m2; daglicht via ramen; verhoogde zitstokken; legnesten 1 per 7 hennen; geen kooisysteem',
    best_practice: 'Overdekte buitenuitloop (wintergarten); stofbadmogelijkheden; maximaal 6000 dieren per stal',
    regulation_ref: 'Beter Leven criteria leghennen 2024; Dierenbescherming',
    source: 'Dierenbescherming / Beter Leven keurmerk',
  },
  {
    species_id: 'dairy_cattle', production_system: 'beter_leven_1ster', category: 'beter_leven',
    standard: 'Beter Leven 1 ster — melkvee: weidegang verplicht',
    legal_minimum: 'Beter Leven 1 ster melkvee: minimaal 120 dagen weidegang per jaar, 6 uur per dag; ligboxen met minimaal 10 cm matrashoogte of diep strooisel; koe-comfort index monitoren',
    best_practice: 'Minimaal 180 dagen weidegang; potstal of vrijloopstal; kruidenrijk grasland',
    regulation_ref: 'Beter Leven criteria melkvee 2024; Dierenbescherming',
    source: 'Dierenbescherming / Beter Leven keurmerk',
  },
  {
    species_id: 'veal_calves', production_system: 'beter_leven_1ster', category: 'beter_leven',
    standard: 'Beter Leven 1 ster — vleeskalveren: groepshuisvesting en ruwvoer',
    legal_minimum: 'Beter Leven 1 ster vleeskalveren: groepshuisvesting verplicht (geen individuele boxen na 8 weken); minimaal 1.8 m2 per kalf; ruwvoer (hooi/stro) dagelijks beschikbaar; daglicht',
    best_practice: 'Minimaal 2.5 m2 per kalf; stro als ligruimte; langere mestperiode; rose-vleeskalveren met ruwvoerrantsoen',
    regulation_ref: 'Beter Leven criteria vleeskalveren 2024; Dierenbescherming',
    source: 'Dierenbescherming / Beter Leven keurmerk',
  },

  // ────────────────────────────────────────
  // Slachtvoorschriften
  // ────────────────────────────────────────
  {
    species_id: 'dairy_cattle', production_system: 'all', category: 'slacht_verdoving',
    standard: 'Verdoving voor de slacht — runderen',
    legal_minimum: 'Runderen moeten voor de slacht worden verdoofd met penschiettoestel (penetrerend) of elektrische verdoving. Onmiddellijk na verdoving verbloeden. Verdoving controleren: reflexloosheid, afwezigheid corneareflex, geen ritmische ademhaling',
    best_practice: 'Backup-penschiettoestel direct beschikbaar; goed onderhoud apparatuur; training personeel; maximaal 60 seconden tussen verdoving en verbloeding',
    regulation_ref: 'EU-Verordening 1099/2009 art. 4, bijlage I; Wet dieren art. 2.10; Besluit houders van dieren',
    source: 'NVWA / EU',
  },
  {
    species_id: 'pigs', production_system: 'all', category: 'slacht_verdoving',
    standard: 'Verdoving voor de slacht — varkens',
    legal_minimum: 'Varkens verdoven met CO2-gas (minimaal 80% concentratie, minimaal 100 seconden) of elektrische verdoving (kop-hart, minimaal 1.3 A). Controle op bewusteloosheid voor verbloeding. Fixatie zo kort mogelijk',
    best_practice: 'High-concentration CO2 (>90%) of low-atmospheric-pressure stunning (LAPS); group stunning ter vermindering van stress; automatische bewusteloosheidsdetectie',
    regulation_ref: 'EU-Verordening 1099/2009 art. 4, bijlage I; NVWA-beleidsregel slacht',
    source: 'NVWA / EU',
  },
  {
    species_id: 'laying_hens', production_system: 'all', category: 'slacht_verdoving',
    standard: 'Verdoving voor de slacht — pluimvee',
    legal_minimum: 'Pluimvee verdoven met waterbadverdoving (minimaal 100 mA per dier) of CAS (gasverdoving). Controle op verdoving voor halssnede. Individuele dieren die gemist worden: onmiddellijk handmatig verdoven',
    best_practice: 'CAS (controlled atmosphere stunning) met 2-fase systeem; geen levende inversie aan haken; low atmospheric pressure stunning als alternatief',
    regulation_ref: 'EU-Verordening 1099/2009 art. 4, bijlage I; NVWA-beleidsregel',
    source: 'NVWA / EU',
  },
  {
    species_id: 'dairy_cattle', production_system: 'all', category: 'slacht_wachttijd',
    standard: 'Maximale wachttijd op slachthuis — runderen',
    legal_minimum: 'Dieren die langer dan 12 uur op het slachthuis verblijven moeten voer en water krijgen en droog liggen. Maximale wachttijd voor slacht: 24 uur na aankomst. VKI (Voedselketeninformatie) moet minimaal 24 uur voor aankomst zijn ingediend',
    best_practice: 'Slacht binnen 2-4 uur na aankomst; rustige drijfgangen; geen gebruik van prikstokken; sociale groepen intact laten',
    regulation_ref: 'EU-Verordening 1099/2009 art. 9; EU-Verordening 853/2004 bijlage II; NVWA',
    source: 'NVWA / EU',
  },

  // ────────────────────────────────────────
  // Vleeskalveren specifiek
  // ────────────────────────────────────────
  {
    species_id: 'veal_calves', production_system: 'all', category: 'individuele_huisvesting',
    standard: 'Individuele huisvesting vleeskalveren — maximaal 8 weken',
    legal_minimum: 'Individuele huisvesting kalveren alleen toegestaan tot 8 weken leeftijd. Individuele box minimaal 1.5x schouderlengte breed, 1.1x lichaamslengte lang. Kalf moet andere kalveren kunnen zien en aanraken',
    best_practice: 'Groepshuisvesting vanaf geboorte; igloos met buitenuitloop voor jonge kalveren; sociaal contact zo vroeg mogelijk',
    regulation_ref: 'Besluit houders van dieren art. 2.29-2.34; EU-richtlijn 2008/119/EG',
    source: 'NVWA / EU',
  },
  {
    species_id: 'veal_calves', production_system: 'all', category: 'ruwvoer',
    standard: 'Ruwvoer verplicht voor vleeskalveren',
    legal_minimum: 'Kalveren ouder dan 2 weken moeten dagelijks ruwvoer (vezelrijk voeder) krijgen. Minimaal 50 g ruwvoer per dag bij 8 weken, oplopend tot 250 g per dag bij 20 weken. Ijzergehalte hemoglobine minimaal 4.5 mmol/l',
    best_practice: 'Ruwvoer (hooi, stro, snijmais) ad lib aanbieden; hemoglobine >6.0 mmol/l; rose-kalverenhouderij met substantieel ruwvoerrantsoen',
    regulation_ref: 'Besluit houders van dieren art. 2.32; EU-richtlijn 2008/119/EG art. 4',
    source: 'NVWA / EU',
  },

  // ────────────────────────────────────────
  // Eenden en kalkoenen
  // ────────────────────────────────────────
  {
    species_id: 'ducks', production_system: 'all', category: 'watervoorziening',
    standard: 'Watervoorziening eenden — functioneel watercontact',
    legal_minimum: 'Eenden moeten beschikking hebben over drinkwater. Open water (zwemwater) is niet wettelijk verplicht in NL maar dieren moeten kop geheel onder water kunnen steken voor verenonderhoud',
    best_practice: 'Open water (badmogelijkheid) aanbieden; minimaal drinkgoten waarin eend kop volledig kan onderdompelen; liefst zwemwater',
    regulation_ref: 'Besluit houders van dieren art. 2.3; EFSA advies watervogels 2023',
    source: 'NVWA / EFSA',
  },
  {
    species_id: 'ducks', production_system: 'all', category: 'huisvesting',
    standard: 'Minimum oppervlakte eenden — bezettingsnormen',
    legal_minimum: 'Vleeseenden: niet wettelijk gespecificeerd in NL maar EFSA-advies en Beter Leven hanteren 6-8 dieren per m2 (Pekin). Strooisel op gehele vloeroppervlak',
    best_practice: 'Maximaal 5 dieren per m2; buitenuitloop met zwemwater; beschutting tegen roofdieren en zon',
    regulation_ref: 'Besluit houders van dieren art. 2.4; EFSA advies watervogels 2023',
    source: 'NVWA / EFSA / Dierenbescherming',
  },
  {
    species_id: 'turkeys', production_system: 'all', category: 'bezettingsdichtheid',
    standard: 'Bezettingsdichtheid kalkoenen',
    legal_minimum: 'Kalkoenen: geen specifieke NL-regelgeving voor bezettingsdichtheid. EU-code van goede praktijken: maximaal 58 kg/m2 (hanen), 48 kg/m2 (hennen). Strooisel verplicht',
    best_practice: 'Maximaal 40 kg/m2; daglicht via ramen; verhoogde zitstokken; buitenuitloop bij Beter Leven; strobalen als verrijking',
    regulation_ref: 'Besluit houders van dieren art. 2.4; EU-Aanbeveling kalkoenen; Beter Leven criteria',
    source: 'NVWA / EU / Dierenbescherming',
  },
  {
    species_id: 'turkeys', production_system: 'all', category: 'snavelbehandeling',
    standard: 'Snavelbehandeling kalkoenen — nog niet volledig verboden',
    legal_minimum: 'Snavelbehandeling kalkoenen in NL: infraroodbehandeling van de bovensnavel toegestaan bij eendagskuikens in de broederij. Volledig kappen verboden. Monitoring op pikkerij verplicht',
    best_practice: 'Geen snavelbehandeling; omgevingsverrijking (strobalen, pecking blocks); lagere bezettingsdichtheid; lichtmanagement',
    regulation_ref: 'Besluit houders van dieren art. 2.7; NVWA-beleidsregel kalkoenen',
    source: 'NVWA / Dierenbescherming',
  },

  // ────────────────────────────────────────
  // Biologisch (cross-species)
  // ────────────────────────────────────────
  {
    species_id: 'dairy_cattle', production_system: 'biologisch', category: 'biologisch_eisen',
    standard: 'SKAL biologisch — melkvee: dubbele ruimte en weidegang',
    legal_minimum: 'Biologisch melkvee: minimaal 6 m2 binnenruimte per koe + 4.5 m2 buitenuitloop; weidegang verplicht (minimaal 180 dagen); 100% biologisch voer; minimaal 60% ruwvoer in rantsoen; geen preventief antibioticagebruik',
    best_practice: 'Potstal of vrijloopstal met diep strooisel; kruidenrijk grasland; maximaal 2 dieren per hectare',
    regulation_ref: 'EU-Verordening 2018/848 bijlage II deel II; SKAL-normen; Besluit houders van dieren',
    source: 'SKAL / EU / NVWA',
  },
  {
    species_id: 'pigs', production_system: 'biologisch', category: 'biologisch_eisen',
    standard: 'SKAL biologisch — varkens: buitenuitloop en biologisch voer',
    legal_minimum: 'Biologisch varkens: minimaal 2.3 m2 binnenruimte + 1.9 m2 buitenuitloop per vleesvarken; 100% biologisch voer; groepshuisvesting met stro; geen routinematige castratie of staartcouperen; minimaal 5 maanden leeftijd bij slacht',
    best_practice: 'Weidegang met wroetmogelijkheid; langere groeiperiode (>6 maanden); robuuste rassen; maximaal 14 mg/kg fosfaat per ha',
    regulation_ref: 'EU-Verordening 2018/848 bijlage II deel II; SKAL-normen',
    source: 'SKAL / EU',
  },
  {
    species_id: 'laying_hens', production_system: 'biologisch', category: 'biologisch_eisen',
    standard: 'SKAL biologisch — leghennen: vrije uitloop en biologisch voer',
    legal_minimum: 'Biologisch leghennen: maximaal 6 hennen per m2 staloppervlak; minimaal 4 m2 buitenuitloop per hen; 100% biologisch voer; maximaal 3000 hennen per stal; lichtperiode minimaal 8 uur donker',
    best_practice: 'Maximaal 4 hennen per m2; structuurrijke uitloop met bomen; mobiele stallen voor rotatiebegrazing',
    regulation_ref: 'EU-Verordening 2018/848 bijlage II deel II; SKAL-normen',
    source: 'SKAL / EU',
  },

  // ────────────────────────────────────────
  // Fixatie en handling
  // ────────────────────────────────────────
  {
    species_id: 'dairy_cattle', production_system: 'all', category: 'fixatie',
    standard: 'Fixatie runderen — klem, behandelbox',
    legal_minimum: 'Fixatie alleen voor noodzakelijke verzorging of diergeneeskundige behandeling. Duur zo kort mogelijk. Dier moet op natuurlijke wijze kunnen staan. Vastzetten aan hoorns verboden.',
    best_practice: 'Behandelbox met vaste kop- en staartfixatie; low-stress handling (Temple Grandin principes); geleidelijke gewenning; voorkom schreeuwen en slaan',
    regulation_ref: 'Besluit houders van dieren art. 2.4; Wet dieren art. 1.3 (intrinsieke waarde)',
    source: 'NVWA / KNMvD / WUR',
  },
  {
    species_id: 'pigs', production_system: 'all', category: 'fixatie_zeug',
    standard: 'Fixatie zeugen — kraamstal en groepshuisvesting',
    legal_minimum: 'Zeugen mogen alleen gefixeerd worden in kraamstal rondom werpen (max 4-5 dagen voor werpen tot spenen). Groepshuisvesting verplicht vanaf 4 weken na dekken tot 1 week voor werpen. Individueel aangebonden houden verboden.',
    best_practice: 'Vrije kraamstal (free farrowing); zeug kan zich omkeren; biggennest met verwarming; dekstallen met groepshuisvesting',
    regulation_ref: 'Besluit houders van dieren art. 2.17-2.20; EU-richtlijn 2008/120/EG art. 3',
    source: 'NVWA / EU / Dierenbescherming',
  },

  // ────────────────────────────────────────
  // Noodprocedures en euthanasie
  // ────────────────────────────────────────
  {
    species_id: 'dairy_cattle', production_system: 'all', category: 'noodslachting',
    standard: 'Noodslachting op het bedrijf — runderen',
    legal_minimum: 'Noodslachting op bedrijf alleen door of onder toezicht van dierenarts. Verdoving met penschiettoestel verplicht. Verbloeding binnen 60 seconden. Kadaver naar slachthuis voor PM-keuring. NVWA-certificaat vereist.',
    best_practice: 'Gebruik altijd penetrerend penschiettoestel (niet-penetrerend onvoldoende voor runderen). Backup-apparaat beschikbaar. Training personeel jaarlijks.',
    regulation_ref: 'EU-Verordening 1099/2009 art. 7; Wet dieren art. 2.10',
    source: 'NVWA / KNMvD',
  },
  {
    species_id: 'pigs', production_system: 'all', category: 'euthanasie_bedrijf',
    standard: 'Euthanasie op het bedrijf — varkens',
    legal_minimum: 'Euthanasie door dierenarts (pentobarbital IV) of door houder met penschiettoestel (vrije kogel of penetrerend, gevolgd door verbloeding). Biggen <5 kg: mechanische klap op het hoofd of CO2 toegestaan. Elektrische verdoving: minimaal 1.3 A kop-hart.',
    best_practice: 'Dierenarts voor euthanasie; pentobarbital als voorkeursmethode; vangkooi om stress te minimaliseren; vroegtijdig besluit (voorkom onnodig lijden)',
    regulation_ref: 'EU-Verordening 1099/2009 bijlage I; AVMA Guidelines on Euthanasia; KNMvD-richtlijn',
    source: 'NVWA / KNMvD',
  },
  {
    species_id: 'laying_hens', production_system: 'all', category: 'euthanasie_pluimvee',
    standard: 'Euthanasie pluimvee op het bedrijf',
    legal_minimum: 'Individueel: cervicale dislocatie (handmatig) toegestaan bij dieren <3 kg. Mechanische cervicale dislocatie (Semark-plier) bij >3 kg. Gas (CO2 of argon) voor groepen. Dierenarts kan pentobarbital IV toedienen.',
    best_practice: 'Gasverdoving (2-fase CO2 of argon/CO2 mix) voor grotere aantallen; dood bevestigen voor weggooien; training en audit op dodingsmethode',
    regulation_ref: 'EU-Verordening 1099/2009 bijlage I; AVINED protocol euthanasie pluimvee',
    source: 'NVWA / AVINED / KNMvD',
  },

  // ────────────────────────────────────────
  // Ammoniakemissie en milieu
  // ────────────────────────────────────────
  {
    species_id: 'dairy_cattle', production_system: 'all', category: 'ammoniakemissie',
    standard: 'Ammoniakemissie melkveestal — Regeling ammoniak en veehouderij (Rav)',
    legal_minimum: 'Nieuwe melkveestallen: maximale emissie 8.6 kg NH3/dierplaats/jaar (A1.100 ligboxenstal met roostervloer). Emissie-arme vloer verplicht bij nieuwbouw. Bestaande stallen: geen aanpassing verplicht tot renovatie.',
    best_practice: 'Emissie-arme vloer (rubber toplaag, sleufvloer): <6.0 kg NH3. Weidegang verlaagt stalemissie. Kelderbeluchting. Mestscheiding bij de bron.',
    regulation_ref: 'Regeling ammoniak en veehouderij (Rav); Wet milieubeheer; Besluit emissiearme huisvesting',
    source: 'RVO / RIVM / Rav-lijst',
  },
  {
    species_id: 'pigs', production_system: 'all', category: 'ammoniakemissie',
    standard: 'Ammoniakemissie varkensstal — Rav-normen',
    legal_minimum: 'Vleesvarkens: maximaal 1.5 kg NH3/dierplaats/jaar bij nieuwbouw (luchtwasser of emissie-arm systeem). Zeugen: maximaal 2.9 kg NH3/dierplaats/jaar. Luchtwassers: verplicht onderhoud en registratie.',
    best_practice: 'Combiluchtwasser (chemisch+biologisch): >85% reductie. Mestscheiding. Koeling mestoppervlak. Vleesvarkens op stro: geen Rav-norm maar lager door absorptie.',
    regulation_ref: 'Regeling ammoniak en veehouderij (Rav); Besluit emissiearme huisvesting',
    source: 'RVO / RIVM / Rav-lijst',
  },
  {
    species_id: 'broilers', production_system: 'all', category: 'fijnstof',
    standard: 'Fijnstofreductie pluimveestal — verplichte maatregelen',
    legal_minimum: 'Pluimveestallen: fijnstof (PM10) reducerende techniek verplicht bij nieuwbouw en uitbreiding. Technieken: ionisatie, olienevel, warmtewisselaar. Minimaal 30% PM10-reductie.',
    best_practice: 'Combinatie ionisatie + warmtewisselaar: >60% PM10-reductie. Goede strooiselmanagement. Dauwpuntkoeling.',
    regulation_ref: 'Besluit emissiearme huisvesting; Regeling fijnstof veehouderij; Omgevingswet',
    source: 'RVO / RIVM',
  },

  // ────────────────────────────────────────
  // Dierenwelzijnscontrole en handhaving
  // ────────────────────────────────────────
  {
    species_id: 'dairy_cattle', production_system: 'all', category: 'nvwa_inspectie',
    standard: 'NVWA-inspectie en handhaving dierenwelzijn',
    legal_minimum: 'NVWA voert onaangekondigde inspecties uit op naleving Wet dieren en Besluit houders van dieren. Bij overtreding: waarschuwing, last onder dwangsom, bestuurlijke boete (max EUR 83.000 per overtreding). Bij dierenmishandeling: strafrechtelijke vervolging.',
    best_practice: 'Deelname aan privaat kwaliteitssysteem (IKB, KKM, Beter Leven) als aanvulling op wettelijke controle; interne audits; dierenwelzijnsplan met dierenarts',
    regulation_ref: 'Wet dieren art. 8.6-8.12; Besluit handhaving en overige zaken Wet dieren',
    source: 'NVWA / Rijksoverheid',
  },
  {
    species_id: 'pigs', production_system: 'all', category: 'ikb_varken',
    standard: 'IKB Varken — integrale ketenbeheersing varkenshouderij',
    legal_minimum: 'IKB Varken is het sectorale kwaliteitssysteem. Niet wettelijk verplicht maar de facto standaard (>95% van NL-varkens). Eisen: traceerbaarheid, voerveiligheid (GMP+), diergezondheidsbedrijfsplan, SDa-registratie, Salmonella-monitoring, R&O-protocol.',
    best_practice: 'IKB als basis; Beter Leven 1/2/3 ster als aanvulling; varkenswelzijnscheck (WQ protocol); continue verbetering via bedrijfsplan',
    regulation_ref: 'IKB Varken voorwaarden 2024; POV; NVWA-toezicht op IKB-erkenning',
    source: 'POV / IKB / NVWA',
  },
  {
    species_id: 'dairy_cattle', production_system: 'all', category: 'kkm',
    standard: 'KoeKompas / KKM — kwaliteitssysteem melkveehouderij',
    legal_minimum: 'KoeKompas (voorheen KKM): verplicht voor alle melkveebedrijven die aan Nederlandse zuivelverwerkers leveren. Jaarlijkse bedrijfsbeoordeling door dierenarts. Themas: diergezondheid, welzijn, voeding, huisvesting, weidegang, medicijngebruik.',
    best_practice: 'Score 8+ op alle themas; benchmarking met sectorgemiddelde; verbeterpunten uitvoeren voor volgende audit',
    regulation_ref: 'ZuivelNL Kwaliteitssysteem; Zuivelketen verordening',
    source: 'ZuivelNL / KNMvD / NVWA',
  },
];

for (const w of welfareStandards) {
  db.run(
    `INSERT INTO welfare_standards (species_id, production_system, category, standard, legal_minimum, best_practice, regulation_ref, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'NL')`,
    [w.species_id, w.production_system, w.category, w.standard, w.legal_minimum, w.best_practice, w.regulation_ref, w.source]
  );
}

console.log(`Inserted ${welfareStandards.length} welfare standards.`);

// ────────────────────────────────────────
// 3. Stocking Densities (bezettingsnormen)
// ────────────────────────────────────────
const stockingDensities = [
  { species_id: 'dairy_cattle', age_class: 'adult', housing_type: 'ligboxenstal', density_value: 6.0, density_unit: 'm2_per_head', legal_minimum: 6.0, recommended: 8.0, source: 'Besluit houders van dieren / NVWA' },
  { species_id: 'dairy_cattle', age_class: 'adult', housing_type: 'potstal', density_value: 8.0, density_unit: 'm2_per_head', legal_minimum: 8.0, recommended: 10.0, source: 'Besluit houders van dieren / NVWA' },
  { species_id: 'dairy_cattle', age_class: 'jongvee', housing_type: 'groepshuisvesting', density_value: 3.0, density_unit: 'm2_per_head', legal_minimum: 2.5, recommended: 3.0, source: 'Besluit houders van dieren / NVWA' },
  { species_id: 'dairy_cattle', age_class: 'adult', housing_type: 'biologisch', density_value: 6.0, density_unit: 'm2_per_head_indoor', legal_minimum: 6.0, recommended: 10.0, source: 'EU-Verordening 2018/848 / SKAL' },
  { species_id: 'beef_cattle', age_class: '200-350 kg', housing_type: 'groepshuisvesting', density_value: 3.5, density_unit: 'm2_per_head', legal_minimum: 3.0, recommended: 3.5, source: 'Besluit houders van dieren / NVWA' },
  { species_id: 'beef_cattle', age_class: '>350 kg', housing_type: 'groepshuisvesting', density_value: 5.0, density_unit: 'm2_per_head', legal_minimum: 4.5, recommended: 5.0, source: 'Besluit houders van dieren / NVWA' },
  { species_id: 'pigs', age_class: 'gespeende biggen', housing_type: 'indoor', density_value: 0.30, density_unit: 'm2_per_head', legal_minimum: 0.30, recommended: 0.40, source: 'Varkensbesluit / Besluit houders van dieren' },
  { species_id: 'pigs', age_class: 'vleesvarkens 65-110 kg', housing_type: 'indoor', density_value: 0.65, density_unit: 'm2_per_head', legal_minimum: 0.65, recommended: 0.80, source: 'Varkensbesluit / Besluit houders van dieren' },
  { species_id: 'pigs', age_class: 'vleesvarkens >110 kg', housing_type: 'indoor', density_value: 1.0, density_unit: 'm2_per_head', legal_minimum: 1.0, recommended: 1.2, source: 'Varkensbesluit / Besluit houders van dieren' },
  { species_id: 'pigs', age_class: 'zeugen', housing_type: 'groepshuisvesting', density_value: 2.25, density_unit: 'm2_per_head', legal_minimum: 2.25, recommended: 2.50, source: 'Varkensbesluit / Besluit houders van dieren' },
  { species_id: 'pigs', age_class: 'vleesvarkens', housing_type: 'biologisch', density_value: 2.3, density_unit: 'm2_per_head_indoor', legal_minimum: 2.3, recommended: 2.5, source: 'EU-Verordening 2018/848 / SKAL' },
  { species_id: 'pigs', age_class: 'vleesvarkens', housing_type: 'biologisch_buitenuitloop', density_value: 1.9, density_unit: 'm2_outdoor_per_head', legal_minimum: 1.9, recommended: 2.5, source: 'EU-Verordening 2018/848 / SKAL' },
  { species_id: 'laying_hens', age_class: 'adult', housing_type: 'scharrelsysteem', density_value: 1111, density_unit: 'cm2_per_head', legal_minimum: 1111, recommended: 1429, source: 'Besluit houders van dieren / EU-richtlijn 1999/74/EG' },
  { species_id: 'laying_hens', age_class: 'adult', housing_type: 'verrijkte_kooi', density_value: 750, density_unit: 'cm2_per_head', legal_minimum: 750, recommended: 0, source: 'Besluit houders van dieren / EU-richtlijn 1999/74/EG' },
  { species_id: 'laying_hens', age_class: 'adult', housing_type: 'vrije_uitloop', density_value: 4.0, density_unit: 'm2_outdoor_per_head', legal_minimum: 4.0, recommended: 8.0, source: 'Besluit houders van dieren / EU-verordening 589/2008' },
  { species_id: 'laying_hens', age_class: 'adult', housing_type: 'biologisch', density_value: 1667, density_unit: 'cm2_per_head', legal_minimum: 1667, recommended: 2500, source: 'EU-Verordening 2018/848 / SKAL' },
  { species_id: 'broilers', age_class: 'regulier', housing_type: 'indoor', density_value: 42, density_unit: 'kg_per_m2', legal_minimum: 42, recommended: 33, source: 'Besluit houders van dieren / EU-richtlijn 2007/43/EG' },
  { species_id: 'broilers', age_class: 'trager groeiend', housing_type: 'indoor', density_value: 39, density_unit: 'kg_per_m2', legal_minimum: 39, recommended: 30, source: 'Besluit houders van dieren / Kip van Morgen' },
  { species_id: 'broilers', age_class: 'Beter Leven 1 ster', housing_type: 'indoor', density_value: 25, density_unit: 'kg_per_m2', legal_minimum: 25, recommended: 20, source: 'Beter Leven criteria vleeskuikens 2024' },
  { species_id: 'goats', age_class: 'adult', housing_type: 'indoor', density_value: 1.5, density_unit: 'm2_per_head', legal_minimum: 1.0, recommended: 1.5, source: 'Besluit houders van dieren / GD' },
  { species_id: 'sheep', age_class: 'adult', housing_type: 'indoor', density_value: 1.5, density_unit: 'm2_per_head', legal_minimum: 1.0, recommended: 1.5, source: 'Besluit houders van dieren / NVWA' },
  { species_id: 'sheep', age_class: 'lammeren', housing_type: 'indoor', density_value: 0.5, density_unit: 'm2_per_head', legal_minimum: 0.5, recommended: 0.7, source: 'Besluit houders van dieren / NVWA' },
  { species_id: 'rabbits', age_class: 'adult', housing_type: 'parkhuisvesting', density_value: 800, density_unit: 'cm2_per_head', legal_minimum: 800, recommended: 1500, source: 'Besluit houders van dieren' },
  // Vleeskalveren
  { species_id: 'veal_calves', age_class: 'individueel (<8 weken)', housing_type: 'individuele_box', density_value: 1.8, density_unit: 'm2_per_head', legal_minimum: 1.5, recommended: 2.0, source: 'Besluit houders van dieren / EU-richtlijn 2008/119/EG' },
  { species_id: 'veal_calves', age_class: 'groepshuisvesting', housing_type: 'groepshuisvesting', density_value: 1.8, density_unit: 'm2_per_head', legal_minimum: 1.5, recommended: 2.0, source: 'Besluit houders van dieren / EU-richtlijn 2008/119/EG' },
  { species_id: 'veal_calves', age_class: 'witkalfjes (<8 mnd)', housing_type: 'groepshuisvesting', density_value: 1.5, density_unit: 'm2_per_head', legal_minimum: 1.5, recommended: 1.8, source: 'Besluit houders van dieren art. 2.29-2.34' },
  { species_id: 'veal_calves', age_class: 'rose kalveren (>8 mnd)', housing_type: 'groepshuisvesting', density_value: 1.8, density_unit: 'm2_per_head', legal_minimum: 1.8, recommended: 2.5, source: 'Besluit houders van dieren art. 2.29-2.34' },
  // Eenden
  { species_id: 'ducks', age_class: 'vleeseend', housing_type: 'indoor', density_value: 0.14, density_unit: 'm2_per_head', legal_minimum: 0.125, recommended: 0.20, source: 'EFSA advies watervogels 2023 / Beter Leven' },
  // Kalkoenen
  { species_id: 'turkeys', age_class: 'hanen', housing_type: 'indoor', density_value: 58, density_unit: 'kg_per_m2', legal_minimum: 58, recommended: 40, source: 'EU-Aanbeveling kalkoenen / NVWA' },
  { species_id: 'turkeys', age_class: 'hennen', housing_type: 'indoor', density_value: 48, density_unit: 'kg_per_m2', legal_minimum: 48, recommended: 35, source: 'EU-Aanbeveling kalkoenen / NVWA' },
  // Biologisch extra
  { species_id: 'goats', age_class: 'adult', housing_type: 'biologisch', density_value: 1.5, density_unit: 'm2_per_head_indoor', legal_minimum: 1.5, recommended: 2.5, source: 'EU-Verordening 2018/848 / SKAL' },
  { species_id: 'sheep', age_class: 'adult', housing_type: 'biologisch', density_value: 1.5, density_unit: 'm2_per_head_indoor', legal_minimum: 1.5, recommended: 2.5, source: 'EU-Verordening 2018/848 / SKAL' },
  // Transport density
  { species_id: 'pigs', age_class: 'slachtrijp (100 kg)', housing_type: 'transport', density_value: 0.425, density_unit: 'm2_per_head', legal_minimum: 0.425, recommended: 0.50, source: 'EU-Verordening 1/2005 bijlage I hfd. VII' },
  { species_id: 'dairy_cattle', age_class: 'adult (500 kg)', housing_type: 'transport', density_value: 1.3, density_unit: 'm2_per_head', legal_minimum: 1.3, recommended: 1.6, source: 'EU-Verordening 1/2005 bijlage I hfd. VII' },
  { species_id: 'sheep', age_class: 'adult (75 kg)', housing_type: 'transport', density_value: 0.30, density_unit: 'm2_per_head', legal_minimum: 0.20, recommended: 0.30, source: 'EU-Verordening 1/2005 bijlage I hfd. VII' },
  // Extra organic/BL densities
  { species_id: 'broilers', age_class: 'biologisch', housing_type: 'biologisch_indoor', density_value: 21, density_unit: 'kg_per_m2', legal_minimum: 21, recommended: 16, source: 'EU-Verordening 2018/848 / SKAL' },
  { species_id: 'broilers', age_class: 'biologisch', housing_type: 'biologisch_buitenuitloop', density_value: 4.0, density_unit: 'm2_outdoor_per_head', legal_minimum: 4.0, recommended: 8.0, source: 'EU-Verordening 2018/848 / SKAL' },
  { species_id: 'veal_calves', age_class: 'Beter Leven 1 ster', housing_type: 'groepshuisvesting', density_value: 1.8, density_unit: 'm2_per_head', legal_minimum: 1.8, recommended: 2.5, source: 'Beter Leven criteria vleeskalveren 2024' },
  { species_id: 'turkeys', age_class: 'Beter Leven 1 ster hanen', housing_type: 'indoor', density_value: 40, density_unit: 'kg_per_m2', legal_minimum: 40, recommended: 30, source: 'Beter Leven criteria kalkoenen 2024' },
  { species_id: 'pigs', age_class: 'Beter Leven 1 ster vleesvarkens', housing_type: 'indoor', density_value: 1.0, density_unit: 'm2_per_head', legal_minimum: 1.0, recommended: 1.3, source: 'Beter Leven criteria varkens 2024' },
  { species_id: 'pigs', age_class: 'Beter Leven 2 ster vleesvarkens', housing_type: 'indoor+uitloop', density_value: 1.5, density_unit: 'm2_per_head_indoor', legal_minimum: 1.5, recommended: 2.0, source: 'Beter Leven criteria varkens 2024' },
  { species_id: 'laying_hens', age_class: 'Beter Leven 1 ster', housing_type: 'scharrel', density_value: 1111, density_unit: 'cm2_per_head', legal_minimum: 1111, recommended: 1429, source: 'Beter Leven criteria leghennen 2024' },
];

for (const sd of stockingDensities) {
  db.run(
    `INSERT INTO stocking_densities (species_id, age_class, housing_type, density_value, density_unit, legal_minimum, recommended, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'NL')`,
    [sd.species_id, sd.age_class, sd.housing_type, sd.density_value, sd.density_unit, sd.legal_minimum, sd.recommended, sd.source]
  );
}

console.log(`Inserted ${stockingDensities.length} stocking densities.`);

// ────────────────────────────────────────
// 4. Feed Requirements
// ────────────────────────────────────────
const feedRequirements = [
  {
    species_id: 'dairy_cattle', age_class: 'adult', production_stage: 'lactatie (30 kg melk/dag)',
    energy_mj_per_day: 115, protein_g_per_day: 1800, dry_matter_kg: 22.0,
    minerals: JSON.stringify({ calcium_g: 80, phosphorus_g: 45, magnesium_g: 25, natrium_g: 15 }),
    example_ration: 'Grassilage (35 kg) + snijmais (15 kg) + krachtvoer (8 kg) — 1000 VEM per kg ds streefwaarde',
    notes: 'VEM-systeem (Voeder Eenheid Melk): 1 VEM = 6.9 kJ NEL. Ruw eiwit 160-170 g/kg ds.'
  },
  {
    species_id: 'dairy_cattle', age_class: 'adult', production_stage: 'droogstand',
    energy_mj_per_day: 60, protein_g_per_day: 800, dry_matter_kg: 12.0,
    minerals: JSON.stringify({ calcium_g: 30, phosphorus_g: 25, magnesium_g: 20 }),
    example_ration: 'Hooi ad lib + beperkt grassilage — voorkom te hoge DCAD; let op negatieve DCAD-rantsoen',
    notes: 'Droogstandsperiode 6-8 weken; voorkom vervetting (BCS 3.0-3.5)'
  },
  {
    species_id: 'dairy_cattle', age_class: 'adult', production_stage: 'ruwvoer',
    energy_mj_per_day: 0, protein_g_per_day: 0, dry_matter_kg: 0,
    minerals: JSON.stringify({}),
    example_ration: 'Melkvee: minimaal 60% ruwvoer in het rantsoen (ds-basis). Ruwvoer = gras(silage), snijmais, hooi, stro, GPS',
    notes: 'Ruwvoer-eis voor melkveehouderij: minimaal 60% van de drogestofopname uit ruwvoer. Biologisch: minimaal 60% ruwvoer uit eigen bedrijf of regio (<150 km). WUR-advies: hogere ruwvoerverhouding verbetert pensgezondheid en levensduur.'
  },
  {
    species_id: 'beef_cattle', age_class: 'grower', production_stage: 'afmesten',
    energy_mj_per_day: 75, protein_g_per_day: 1100, dry_matter_kg: 10.0,
    minerals: JSON.stringify({ calcium_g: 30, phosphorus_g: 20 }),
    example_ration: 'Snijmais (20 kg) + krachtvoer (4 kg) + stro ad lib',
    notes: 'Streven naar 1200-1400 g daggroei. Ruw eiwit 130-140 g/kg ds.'
  },
  {
    species_id: 'pigs', age_class: 'gespeende biggen', production_stage: 'opfok',
    energy_mj_per_day: 14, protein_g_per_day: 200, dry_matter_kg: 1.0,
    minerals: JSON.stringify({ calcium_g: 8, phosphorus_g: 5, lysine_g: 12 }),
    example_ration: 'Speenvoer (1.0-1.5 kg/dag) — EW 1.12 (Energiewaarde varkens)',
    notes: 'EW-systeem: 1 EW = 8.79 MJ NE. Geleidelijke overgang van speenvoer naar opfokvoer.'
  },
  {
    species_id: 'pigs', age_class: 'vleesvarkens', production_stage: 'afmestfase',
    energy_mj_per_day: 26, protein_g_per_day: 340, dry_matter_kg: 2.5,
    minerals: JSON.stringify({ calcium_g: 12, phosphorus_g: 8, lysine_g: 15 }),
    example_ration: 'Vleesvarkensvoer (2.5 kg/dag) — EW 1.08, ruw eiwit 155 g/kg',
    notes: 'Afleveren op 115-120 kg; voederconversie streefwaarde 2.6-2.8'
  },
  {
    species_id: 'pigs', age_class: 'zeugen', production_stage: 'lactatie',
    energy_mj_per_day: 65, protein_g_per_day: 900, dry_matter_kg: 6.0,
    minerals: JSON.stringify({ calcium_g: 25, phosphorus_g: 15, lysine_g: 45 }),
    example_ration: 'Lactozeugenvoer ad lib (6-7 kg/dag) — EW 1.08, ruw eiwit 160 g/kg',
    notes: 'Minimaal 2.3 worpen per zeug per jaar. Hoog voerniveau tijdens lactatie voorkomt conditieverlies.'
  },
  {
    species_id: 'laying_hens', age_class: 'adult', production_stage: 'legperiode',
    energy_mj_per_day: 1.3, protein_g_per_day: 18, dry_matter_kg: 0.12,
    minerals: JSON.stringify({ calcium_g: 4.2, phosphorus_g: 0.35 }),
    example_ration: 'Legmeel of legkorrel (110-120 g/dag) — ruw eiwit 160-170 g/kg, calcium 38-42 g/kg',
    notes: 'Schelpengrit apart verstrekken; wateropname ca. 250 ml/dag'
  },
  {
    species_id: 'broilers', age_class: 'kuiken', production_stage: 'groei (dag 0-42)',
    energy_mj_per_day: 1.0, protein_g_per_day: 23, dry_matter_kg: 0.10,
    minerals: JSON.stringify({ calcium_g: 1.0, phosphorus_g: 0.45 }),
    example_ration: 'Start (0-10d), groei (10-28d), afmest (28-42d) — ruw eiwit van 230 naar 190 g/kg',
    notes: 'Voederconversie streefwaarde 1.6-1.7 (regulier), 2.0-2.2 (trager groeiend)'
  },
  {
    species_id: 'goats', age_class: 'adult', production_stage: 'lactatie',
    energy_mj_per_day: 18, protein_g_per_day: 250, dry_matter_kg: 3.0,
    minerals: JSON.stringify({ calcium_g: 10, phosphorus_g: 6 }),
    example_ration: 'Grassilage + krachtvoer (1.0-1.5 kg/dag) — ruw eiwit 150-160 g/kg ds',
    notes: 'Geiten zijn selectieve eters; ruwvoer van goede kwaliteit aanbieden'
  },
  {
    species_id: 'sheep', age_class: 'adult', production_stage: 'onderhoud',
    energy_mj_per_day: 8.5, protein_g_per_day: 80, dry_matter_kg: 1.2,
    minerals: JSON.stringify({ calcium_g: 3, phosphorus_g: 2, magnesium_g: 1.5 }),
    example_ration: 'Gras of hooi ad lib + mineraallik',
    notes: 'Ooi van 70 kg; in laatste 6 weken dracht voerniveau verhogen (stoomvoeren)'
  },
  {
    species_id: 'sheep', age_class: 'adult', production_stage: 'lactatie',
    energy_mj_per_day: 18, protein_g_per_day: 200, dry_matter_kg: 2.5,
    minerals: JSON.stringify({ calcium_g: 8, phosphorus_g: 5 }),
    example_ration: 'Gras ad lib + krachtvoer 0.5-1.0 kg/dag (tweelingdracht hoger)',
    notes: 'Piekvoeropname 4-6 weken na lammen'
  },
  {
    species_id: 'rabbits', age_class: 'adult', production_stage: 'groei/afmest',
    energy_mj_per_day: 1.2, protein_g_per_day: 25, dry_matter_kg: 0.15,
    minerals: JSON.stringify({ calcium_g: 1.2, phosphorus_g: 0.6 }),
    example_ration: 'Konijnenpellets (130-150 g/dag) + hooi ad lib — ruw eiwit 160-170 g/kg',
    notes: 'Ruwvoer (hooi) noodzakelijk voor tandslijtage en darmgezondheid'
  },
  // --- New feed entries ---
  {
    species_id: 'veal_calves', age_class: 'witkalfjes', production_stage: 'melkperiode',
    energy_mj_per_day: 30, protein_g_per_day: 450, dry_matter_kg: 2.5,
    minerals: JSON.stringify({ calcium_g: 15, phosphorus_g: 10, iron_mg: 30 }),
    example_ration: 'Kalvermelkpoeder (2.0-2.5 kg/dag opgelost) + ruwvoer (hooi/stro) minimaal 50 g/dag oplopend. Hemoglobine monitoren (minimaal 4.5 mmol/l)',
    notes: 'Witvleeskalveren: ijzerbeperkt rantsoen maar hemoglobine moet boven wettelijk minimum. Ruwvoer verplicht vanaf 2 weken leeftijd.'
  },
  {
    species_id: 'veal_calves', age_class: 'rose kalveren', production_stage: 'afmestfase',
    energy_mj_per_day: 55, protein_g_per_day: 800, dry_matter_kg: 7.0,
    minerals: JSON.stringify({ calcium_g: 35, phosphorus_g: 20 }),
    example_ration: 'Snijmais (10 kg) + krachtvoer (3 kg) + aanvullende melk (1.5 kg poeder/dag). Ruw eiwit 140-150 g/kg ds',
    notes: 'Rose kalveren: meer ruwvoer dan witvleeskalveren. Afleveren op 8-10 maanden, 250-350 kg.'
  },
  {
    species_id: 'dairy_cattle', age_class: 'adult', production_stage: 'GMP+ diervoeder',
    energy_mj_per_day: 0, protein_g_per_day: 0, dry_matter_kg: 0,
    minerals: JSON.stringify({}),
    example_ration: 'GMP+ International: alle mengvoederfabrikanten in NL moeten GMP+ B1 (productie) of B2 (handel) gecertificeerd zijn. Diervoederwetgeving: EU-Verordening 183/2005 (HACCP diervoeder). NVWA controleert naleving.',
    notes: 'GMP+ certificering garandeert voedselveiligheid in de diervoederketen. HACCP-beginselen verplicht voor alle bedrijven die diervoeder produceren, verwerken of verhandelen. Inclusief transport en opslag.'
  },
  {
    species_id: 'dairy_cattle', age_class: 'adult', production_stage: 'soja-vrij/VLOG',
    energy_mj_per_day: 0, protein_g_per_day: 0, dry_matter_kg: 0,
    minerals: JSON.stringify({}),
    example_ration: 'Soja-vrij initiatief: meerdere zuivelcooperaties (A-ware, Bel Leerdammer) vereisen soja-vrij of RTRS-gecertificeerde soja. VLOG (Verband Lebensmittel ohne Gentechnik): GGO-vrij diervoer — geen genetisch gemodificeerde grondstoffen in voer.',
    notes: 'NL is grootste soja-importeur EU. Verduurzaming via RTRS (Round Table on Responsible Soy) of volledig soja-vrij (raapschroot, zonnebloemschroot als alternatief). VLOG-certificering vereist segregatie in hele keten.'
  },
  {
    species_id: 'dairy_cattle', age_class: 'all', production_stage: 'drinkwater_kwaliteit',
    energy_mj_per_day: 0, protein_g_per_day: 0, dry_matter_kg: 0,
    minerals: JSON.stringify({}),
    example_ration: 'Drinkwaterkwaliteit dieren: nitraat <100 mg/l, nitriet <1 mg/l, pH 6.5-8.5, E. coli <100 KVE/ml. Automatische drinkwatersystemen: dagelijkse visuele controle, jaarlijkse analyse. Leidingwater of grondwater (geborgd).',
    notes: 'Waterbehoefte melkkoe: 80-120 liter/dag (lactatie). Drinkwateronderzoek via GD of Eurofins. Biofilm in leidingen regelmatig reinigen. Automatische systemen: 2 drinkplaatsen per 20 koeien, debiet minimaal 20 l/min.'
  },
  {
    species_id: 'pigs', age_class: 'all', production_stage: 'drinkwater_kwaliteit',
    energy_mj_per_day: 0, protein_g_per_day: 0, dry_matter_kg: 0,
    minerals: JSON.stringify({}),
    example_ration: 'Drinkwaterkwaliteit varkens: nitraat <200 mg/l, nitriet <0.5 mg/l, pH 6-8, ijzer <0.5 mg/l. Nippeldrinkers: debiet gespeende biggen 0.5 l/min, vleesvarkens 1.0 l/min, zeugen 2.0 l/min.',
    notes: 'Waterbehoefte vleesvarken: 6-8 liter/dag. Zeug (lactatie): 25-35 liter/dag. Watermedicatie: doseerpomp met regelmatige ijking. Biofilm probleem bij nippelsystemen — regelmatig doorspoelen.'
  },
  {
    species_id: 'laying_hens', age_class: 'adult', production_stage: 'biologisch_voer',
    energy_mj_per_day: 1.3, protein_g_per_day: 18, dry_matter_kg: 0.12,
    minerals: JSON.stringify({ calcium_g: 4.2, phosphorus_g: 0.35 }),
    example_ration: 'Biologisch leghennenvoer: 100% biologische grondstoffen (EU-Verordening 2018/848). Ruw eiwit 160-170 g/kg. Geen synthetische aminozuren. Maximaal 5% omschakelingsvoer.',
    notes: 'Biologisch: maximaal 25% voergrondstoffen uit 2e jaar omschakeling. Geen synthetisch methionine (uitzondering verlengd tot 2027). Alternatief: insectenmeel als eiwitbron (EU-goedgekeurd per 2022).'
  },
  {
    species_id: 'ducks', age_class: 'vleeseend', production_stage: 'groei',
    energy_mj_per_day: 1.6, protein_g_per_day: 25, dry_matter_kg: 0.18,
    minerals: JSON.stringify({ calcium_g: 1.5, phosphorus_g: 0.6, niacin_mg: 55 }),
    example_ration: 'Eendenvoer: start (0-14d) 200 g/kg RE, groei (14-42d) 170 g/kg RE, afmest (42-49d) 150 g/kg RE. Niacine-supplementatie verplicht (eenden hebben hogere behoefte).',
    notes: 'Pekin-eenden: slachtleeftijd 42-49 dagen. Waterbehoefte hoog: minimaal 2x voeropname. Niacine-tekort leidt tot kreupelheid.'
  },
  {
    species_id: 'turkeys', age_class: 'hanen', production_stage: 'groei (0-20 weken)',
    energy_mj_per_day: 3.0, protein_g_per_day: 60, dry_matter_kg: 0.35,
    minerals: JSON.stringify({ calcium_g: 3.0, phosphorus_g: 1.5 }),
    example_ration: 'Kalkoenenvoer: 5-fase voersysteem (starter, grower 1, grower 2, finisher, withdrawal). Ruw eiwit van 280 g/kg (start) naar 160 g/kg (afmest). Hanen: slachtgewicht 18-22 kg.',
    notes: 'Kalkoenen: hoge eiwitbehoefte in eerste levensweken. Voederconversie 2.4-2.8. Hennen: slacht bij 12-14 weken (9-11 kg).'
  },
  {
    species_id: 'goats', age_class: 'lammeren', production_stage: 'opfok',
    energy_mj_per_day: 6, protein_g_per_day: 100, dry_matter_kg: 0.6,
    minerals: JSON.stringify({ calcium_g: 4, phosphorus_g: 2 }),
    example_ration: 'Geitenmelk of kunstmelk (1-2 liter/dag) + opfokkorrel (ad lib) + hooi. Spenen op 8-12 weken bij minimaal 12 kg lichaamsgewicht.',
    notes: 'CAE-vrije biest van eigen moeder of CAE-vrije tank. Lammeren van CAE-positieve geiten: kunstmatige opfok met gepasteuriseerde biest.'
  },
  {
    species_id: 'sheep', age_class: 'lammeren', production_stage: 'opfok',
    energy_mj_per_day: 7, protein_g_per_day: 120, dry_matter_kg: 0.5,
    minerals: JSON.stringify({ calcium_g: 4, phosphorus_g: 2.5 }),
    example_ration: 'Moedermelk (eerste 6-8 weken) + kruipvoer (lammerenkorrel ad lib) + hooi. Spenen op 8-14 weken bij minimaal 15 kg.',
    notes: 'Tweelinglammeren: bijvoeren vanaf 3 weken. Vleeslammeren: afmesten op 40-45 kg (Texelaar). Weidelammeren: lagere groei maar betere smaak.'
  },
];

for (const fr of feedRequirements) {
  db.run(
    `INSERT INTO feed_requirements (species_id, age_class, production_stage, energy_mj_per_day, protein_g_per_day, dry_matter_kg, minerals, example_ration, notes, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'NL')`,
    [fr.species_id, fr.age_class, fr.production_stage, fr.energy_mj_per_day, fr.protein_g_per_day, fr.dry_matter_kg, fr.minerals, fr.example_ration, fr.notes]
  );
}

console.log(`Inserted ${feedRequirements.length} feed requirements.`);

// ────────────────────────────────────────
// 5. Movement Rules (I&R — Identificatie & Registratie)
// ────────────────────────────────────────
const movementRules = [
  // Runderen (cattle — dairy + beef)
  {
    species_id: 'dairy_cattle', rule_type: 'identificatie',
    rule: 'Runderen moeten binnen 3 werkdagen na geboorte worden geoormerkt met twee goedgekeurde oormerken (inclusief elektronisch merk). Runderpaspoort aanvragen bij RVO.',
    standstill_days: 0, exceptions: 'Niet van toepassing',
    authority: 'RVO', regulation_ref: 'Regeling identificatie en registratie van dieren 2014; EU-verordening 1760/2000',
  },
  {
    species_id: 'dairy_cattle', rule_type: 'verplaatsing',
    rule: 'Elke verplaatsing van runderen melden bij RVO binnen 3 werkdagen. Vervoersdocument (VKM) verplicht bij transport. UBN-registratie van af- en aanvoer.',
    standstill_days: 0, exceptions: 'Verplaatsing binnen eigen UBN-locaties',
    authority: 'RVO', regulation_ref: 'Regeling identificatie en registratie van dieren 2014',
  },
  {
    species_id: 'dairy_cattle', rule_type: 'standstill',
    rule: 'Na aanvoer van runderen geldt een meldplicht maar geen vaste standstillperiode in NL (anders dan UK). Wel 30-dagen quarantaine bij IBR/BVD-vrije bedrijven (GD-regeling).',
    standstill_days: 0, exceptions: 'GD-gecertificeerde bedrijven: 30 dagen quarantaine bij aanvoer',
    authority: 'RVO', regulation_ref: 'GD Monitoring/bewaking; Regeling I&R 2014',
  },
  {
    species_id: 'beef_cattle', rule_type: 'identificatie',
    rule: 'Identiek aan melkvee: twee oormerken binnen 3 werkdagen, runderpaspoort, I&R-registratie bij RVO.',
    standstill_days: 0, exceptions: 'Niet van toepassing',
    authority: 'RVO', regulation_ref: 'Regeling identificatie en registratie van dieren 2014; EU-verordening 1760/2000',
  },
  {
    species_id: 'beef_cattle', rule_type: 'verplaatsing',
    rule: 'Verplaatsing melden bij RVO binnen 3 werkdagen. Vervoersdocument verplicht. Bij slachtvervoer: VKI (Voedselketeninformatie) vereist.',
    standstill_days: 0, exceptions: 'Verplaatsing binnen eigen UBN',
    authority: 'RVO', regulation_ref: 'Regeling identificatie en registratie van dieren 2014',
  },
  // Varkens
  {
    species_id: 'pigs', rule_type: 'identificatie',
    rule: 'Varkens moeten worden geidentificeerd met oormerk of tatoeage met UBN-nummer van het bedrijf van herkomst. Slachtvarkens: UBN op slagmerk.',
    standstill_days: 0, exceptions: 'Biggen op bedrijf van geboorte: identificatie bij afvoer',
    authority: 'RVO', regulation_ref: 'Regeling identificatie en registratie van dieren 2014',
  },
  {
    species_id: 'pigs', rule_type: 'verplaatsing',
    rule: 'Verplaatsing melden bij RVO binnen 24 uur (digitaal). VKI (Voedselketeninformatie) verplicht bij aanvoer slachthuis. Vervoersdocument bij elk transport.',
    standstill_days: 0, exceptions: 'Niet van toepassing',
    authority: 'RVO', regulation_ref: 'Regeling identificatie en registratie van dieren 2014; Regeling houders van dieren',
  },
  {
    species_id: 'pigs', rule_type: 'standstill',
    rule: 'Nederland kent geen vaste standstillperiode voor varkens zoals het UK. Wel geldt bij varkenspestuitbraak een vervoersverbod in het beschermingsgebied (10 km) en toezichtsgebied (13 km).',
    standstill_days: 0, exceptions: 'Vervoersverbod bij uitbraak besmettelijke dierziekten (Wet dieren art. 5.2)',
    authority: 'NVWA', regulation_ref: 'Wet dieren art. 5.2; Regeling preventie, bestrijding en monitoring besmettelijke dierziekten',
  },
  // Schapen en geiten
  {
    species_id: 'sheep', rule_type: 'identificatie',
    rule: 'Schapen en geiten: twee oormerken (visueel + elektronisch) binnen 6 maanden na geboorte. I&R-registratie bij RVO. Stallijst bijhouden.',
    standstill_days: 0, exceptions: 'Slachtlammeren jonger dan 12 maanden: een oormerk volstaat bij direct transport naar slachthuis',
    authority: 'RVO', regulation_ref: 'Regeling identificatie en registratie van dieren 2014; EU-verordening 21/2004',
  },
  {
    species_id: 'sheep', rule_type: 'verplaatsing',
    rule: 'Verplaatsing melden bij RVO. Vervoersdocument verplicht met UBN herkomst en bestemming, aantal dieren, oormerknummers.',
    standstill_days: 0, exceptions: 'Verplaatsing eigen percelen binnen 10 km',
    authority: 'RVO', regulation_ref: 'Regeling identificatie en registratie van dieren 2014',
  },
  {
    species_id: 'sheep', rule_type: 'standstill',
    rule: 'Nederland kent geen vaste standstillperiode voor schapen. Wel quarantaineregeling bij bedrijven met Q-koorts-vrije status. Bij uitbraak MKZ/Q-koorts: vervoersverbod in aangewezen gebieden.',
    standstill_days: 0, exceptions: 'Vervoersverbod bij uitbraak besmettelijke dierziekten',
    authority: 'NVWA', regulation_ref: 'Wet dieren; GD Gezondheidsdienst',
  },
  {
    species_id: 'goats', rule_type: 'identificatie',
    rule: 'Geiten: twee oormerken (visueel + elektronisch) binnen 6 maanden na geboorte. I&R-registratie bij RVO. Stallijst bijhouden.',
    standstill_days: 0, exceptions: 'Slachtlammeren: een oormerk bij direct transport naar slachthuis',
    authority: 'RVO', regulation_ref: 'Regeling identificatie en registratie van dieren 2014; EU-verordening 21/2004',
  },
  {
    species_id: 'goats', rule_type: 'verplaatsing',
    rule: 'Verplaatsing melden bij RVO. Vervoersdocument verplicht. Nieuwvestiging geitenhouderij: provinciale stop op uitbreiding (meeste provincies).',
    standstill_days: 0, exceptions: 'Provinciale geitenstop kan verplaatsingen beperken',
    authority: 'RVO', regulation_ref: 'Regeling I&R 2014; Provinciale verordeningen geitenstop',
  },
  // Pluimvee
  {
    species_id: 'laying_hens', rule_type: 'identificatie',
    rule: 'Geen individuele identificatie voor pluimvee. Koppelregistratie via UBN. Registratie van aantallen, ras, leeftijd bij RVO.',
    standstill_days: 0, exceptions: 'Niet van toepassing',
    authority: 'RVO', regulation_ref: 'Regeling identificatie en registratie van dieren 2014',
  },
  {
    species_id: 'laying_hens', rule_type: 'verplaatsing',
    rule: 'Aan- en afvoer van pluimvee melden bij RVO. Bij ophokplicht (vogelgrieprisico): vervoersbeperkingen in aangewezen gebieden.',
    standstill_days: 0, exceptions: 'Ophokplicht bij vogelgrieprisico',
    authority: 'RVO / NVWA', regulation_ref: 'Regeling I&R 2014; Wet dieren; NVWA-beleidsregel ophokplicht',
  },
  {
    species_id: 'broilers', rule_type: 'identificatie',
    rule: 'Koppelregistratie via UBN. Geen individuele identificatie. Registratie aantallen en slachtgegevens (uitval, voetzoolletsels).',
    standstill_days: 0, exceptions: 'Niet van toepassing',
    authority: 'RVO', regulation_ref: 'Regeling identificatie en registratie van dieren 2014',
  },
  {
    species_id: 'broilers', rule_type: 'verplaatsing',
    rule: 'Verplaatsing melden bij RVO. VKI verplicht bij slachtvervoer. Uitvalnormen worden beoordeeld op slachthuis — gevolgen voor bezettingsdichtheid.',
    standstill_days: 0, exceptions: 'Ophokplicht bij vogelgrieprisico',
    authority: 'RVO / NVWA', regulation_ref: 'Regeling I&R 2014; Besluit houders van dieren art. 2.61',
  },
  // Konijnen
  {
    species_id: 'rabbits', rule_type: 'identificatie',
    rule: 'Bedrijfsmatig gehouden konijnen: UBN-registratie verplicht. Geen individuele oormerken wettelijk vereist.',
    standstill_days: 0, exceptions: 'Hobbyhouders met minder dan 5 konijnen: geen UBN-plicht',
    authority: 'RVO', regulation_ref: 'Regeling identificatie en registratie van dieren 2014',
  },
  // --- New movement rules ---
  // Export/import TRACES
  {
    species_id: 'dairy_cattle', rule_type: 'export',
    rule: 'Export van runderen binnen EU: TRACES-certificaat (Trade Control and Expert System) verplicht. Gezondheidscertificaat door officiele dierenarts (NVWA). Dieren klinisch gezond, vrij van besmettelijke ziekten. IBR- en BVD-status vermeld.',
    standstill_days: 0, exceptions: 'Fokvee: aanvullende certificaten voor genetische status. Derde landen: bilaterale veterinaire certificaten.',
    authority: 'NVWA / EU Commissie', regulation_ref: 'EU-Verordening 2016/429 (Animal Health Law); TRACES-NT systeem',
  },
  {
    species_id: 'pigs', rule_type: 'export',
    rule: 'Export varkens: TRACES-certificaat verplicht. Klinische keuring door officiele dierenarts (NVWA) binnen 24 uur voor vertrek. Dieren vrij van AVP, klassieke varkenspest, Aujeszkysziekte. Land-specifieke eisen raadplegen in TRACES.',
    standstill_days: 0, exceptions: 'Slachttransport naar buurlanden: vereenvoudigde procedure via NVWA-erkenning',
    authority: 'NVWA / EU Commissie', regulation_ref: 'EU-Verordening 2016/429; TRACES-NT; Regeling preventie dierziekten',
  },
  // Verzamelcentra
  {
    species_id: 'dairy_cattle', rule_type: 'verzamelcentrum',
    rule: 'Verzamelcentra voor runderen: NVWA-erkenning vereist. Maximale verblijfsduur 6 dagen (EU-regel: 30 dagen bij goedgekeurd centrum). Reiniging en ontsmetting (R&O) na elke lichting. Dierenarts aanwezig. Dieren geregistreerd in I&R bij aankomst.',
    standstill_days: 0, exceptions: 'Markten en keuringen: maximaal 24 uur verblijf',
    authority: 'NVWA', regulation_ref: 'EU-Verordening 2016/429 art. 94; NVWA-erkenning verzamelcentra',
  },
  {
    species_id: 'pigs', rule_type: 'verzamelcentrum',
    rule: 'Verzamelcentra varkens: NVWA-erkenning vereist. Reiniging en ontsmetting na elk gebruik. Registratie van alle aan- en afgevoerde dieren. Dieren van maximaal 3 herkomstbedrijven mengen. Maximale verblijfsduur 24 uur.',
    standstill_days: 0, exceptions: 'Erkende varkenshandelsondernemingen: eigen R&O-protocol',
    authority: 'NVWA', regulation_ref: 'EU-Verordening 2016/429; Regeling I&R 2014',
  },
  // Slachthuisaanvoer
  {
    species_id: 'dairy_cattle', rule_type: 'slachthuisaanvoer',
    rule: 'Slachthuisaanvoer runderen: VKI (Voedselketeninformatie) minimaal 24 uur voor aankomst indienen. AM-keuring (ante mortem) door NVWA-dierenarts op slachthuis. Nuchterperiode: geen voer 12-24 uur voor slacht (wel water). Runderpaspoort inleveren bij slacht.',
    standstill_days: 0, exceptions: 'Noodslachtingen op het bedrijf: dierenarts moet keuren; kadaver naar slachthuis voor PM-keuring',
    authority: 'NVWA', regulation_ref: 'EU-Verordening 853/2004 bijlage II; EU-Verordening 627/2019; Wet dieren',
  },
  {
    species_id: 'pigs', rule_type: 'slachthuisaanvoer',
    rule: 'Slachthuisaanvoer varkens: VKI verplicht. AM-keuring door NVWA op slachthuis. Varkens moeten schoon zijn (categorie 1 of 2 op NVWA-reinheidsschema). Transport: maximaal 8 uur zonder rust (EU-Verordening 1/2005). Salmonella-status van herkomstbedrijf vermeld op VKI.',
    standstill_days: 0, exceptions: 'Noodslachtingen: dierenarts ter plaatse vereist',
    authority: 'NVWA', regulation_ref: 'EU-Verordening 853/2004; NVWA-beleidsregel slachthuisaanvoer',
  },
  // Vleeskalveren specifiek
  {
    species_id: 'veal_calves', rule_type: 'identificatie',
    rule: 'Vleeskalveren: identiek aan runderen — twee oormerken binnen 3 werkdagen, runderpaspoort, I&R-registratie. Bij aanvoer op kalverhouderij: melden binnen 3 werkdagen.',
    standstill_days: 0, exceptions: 'Niet van toepassing',
    authority: 'RVO', regulation_ref: 'Regeling identificatie en registratie van dieren 2014; EU-verordening 1760/2000',
  },
  {
    species_id: 'veal_calves', rule_type: 'verplaatsing',
    rule: 'Kalveren mogen niet worden vervoerd als ze jonger zijn dan 14 dagen (tenzij transport <100 km). Na 14 dagen: verplaatsing melden bij RVO. Navel moet droog en genezen zijn. Kalf moet zelfstandig kunnen staan en lopen.',
    standstill_days: 0, exceptions: 'Verplaatsing <100 km binnen 14 dagen toegestaan; noodtransport naar dierenarts',
    authority: 'RVO / NVWA', regulation_ref: 'EU-Verordening 1/2005 bijlage I hfd. I art. 3; Regeling I&R 2014',
  },
  // Eenden & kalkoenen
  {
    species_id: 'ducks', rule_type: 'identificatie',
    rule: 'Eenden: koppelregistratie via UBN bij RVO. Geen individuele identificatie. Registratie aantallen, ras, leeftijd.',
    standstill_days: 0, exceptions: 'Hobbyhouders met <50 dieren: vereenvoudigde registratie',
    authority: 'RVO', regulation_ref: 'Regeling identificatie en registratie van dieren 2014',
  },
  {
    species_id: 'turkeys', rule_type: 'identificatie',
    rule: 'Kalkoenen: koppelregistratie via UBN bij RVO. Geen individuele identificatie. Registratie aantallen per stal.',
    standstill_days: 0, exceptions: 'Hobbyhouders met <50 dieren: vereenvoudigde registratie',
    authority: 'RVO', regulation_ref: 'Regeling identificatie en registratie van dieren 2014',
  },
  {
    species_id: 'ducks', rule_type: 'verplaatsing',
    rule: 'Eenden: aan- en afvoer melden bij RVO. Bij ophokplicht (vogelgriep): vervoersbeperkingen. Watervogels extra risicofactor voor aviaire influenza — strikte biosecurity bij contact met wilde vogels.',
    standstill_days: 0, exceptions: 'Ophokplicht bij vogelgrieprisico',
    authority: 'RVO / NVWA', regulation_ref: 'Regeling I&R 2014; NVWA-beleidsregel ophokplicht',
  },
  {
    species_id: 'turkeys', rule_type: 'verplaatsing',
    rule: 'Kalkoenen: aan- en afvoer melden bij RVO. Bij ophokplicht (vogelgriep): vervoersbeperkingen. Kalkoenen zeer gevoelig voor HPAI — extra maatregelen in risicogebieden.',
    standstill_days: 0, exceptions: 'Ophokplicht bij vogelgrieprisico',
    authority: 'RVO / NVWA', regulation_ref: 'Regeling I&R 2014; NVWA-beleidsregel ophokplicht',
  },
  // Reiniging en ontsmetting
  {
    species_id: 'pigs', rule_type: 'reiniging_transport',
    rule: 'Transportmiddelen voor varkens: reiniging en ontsmetting (R&O) na elk transport verplicht. R&O op goedgekeurde wasplaats. Registratie van R&O-bewijs. NVWA kan R&O controleren op slachthuis.',
    standstill_days: 0, exceptions: 'Transport binnen eigen bedrijf (zelfde UBN)',
    authority: 'NVWA', regulation_ref: 'Regeling preventie, bestrijding en monitoring besmettelijke dierziekten; EU-Verordening 2016/429',
  },
  {
    species_id: 'dairy_cattle', rule_type: 'reiniging_transport',
    rule: 'Transportmiddelen voor runderen: R&O na elk transport verplicht op goedgekeurde wasplaats. R&O-bewijs meevoeren. Lijst van erkende wasplaatsen beschikbaar via NVWA.',
    standstill_days: 0, exceptions: 'Transport eigen dieren binnen eigen UBN',
    authority: 'NVWA', regulation_ref: 'Regeling preventie, bestrijding en monitoring besmettelijke dierziekten',
  },
  // Vervoersverbod bij dierziekte-uitbraak
  {
    species_id: 'laying_hens', rule_type: 'vervoersverbod_vogelgriep',
    rule: 'Bij HPAI-bevestiging: vervoersverbod in beschermingszone (3 km) en bewakingszone (10 km). Ophokplicht nationaal of regionaal (NVWA-besluit). Broedeieren: apart protocol. Consumptie-eieren: mogelijk met NVWA-ontheffing na testing.',
    standstill_days: 21, exceptions: 'Ontheffing via NVWA voor consumptie-eieren na negatieve test; noodslachting dierenarts',
    authority: 'NVWA', regulation_ref: 'Wet dieren art. 5.2; EU-Verordening 2016/429; Regeling preventie dierziekten',
  },
  {
    species_id: 'sheep', rule_type: 'export',
    rule: 'Export schapen/geiten: TRACES-certificaat verplicht. Klinische keuring door officiele dierenarts binnen 24 uur voor vertrek. Dieren vrij van brucellose, scrapie (genotypering voor TSE). Land-specifieke eisen in TRACES.',
    standstill_days: 0, exceptions: 'Slachttransport naar buurlanden: vereenvoudigde procedure',
    authority: 'NVWA / EU Commissie', regulation_ref: 'EU-Verordening 2016/429; TRACES-NT',
  },
  {
    species_id: 'goats', rule_type: 'geitenstop',
    rule: 'Provinciale geitenstop: de meeste NL-provincies hebben een bouwstop op nieuwvestiging en uitbreiding van geitenhouderijen (sinds 2009, na Q-koorts crisis). Bestaande bedrijven mogen niet uitbreiden in dieraantallen. Verplaatsing van geitenhouderij naar andere locatie vereist provinciale ontheffing.',
    standstill_days: 0, exceptions: 'Provinciale ontheffing mogelijk bij verplaatsing zonder uitbreiding; biologische bedrijven soms uitgezonderd',
    authority: 'Provinciale Staten', regulation_ref: 'Provinciale verordeningen geitenstop; Wet ruimtelijke ordening',
  },
  {
    species_id: 'rabbits', rule_type: 'verplaatsing',
    rule: 'Commercieel gehouden konijnen: aan- en afvoer melden bij RVO via I&R-systeem. Vervoersdocument met aantallen en UBN herkomst/bestemming. Geen individuele identificatie vereist.',
    standstill_days: 0, exceptions: 'Hobbyhouders <5 konijnen: geen meldplicht',
    authority: 'RVO', regulation_ref: 'Regeling identificatie en registratie van dieren 2014',
  },
];

for (const mr of movementRules) {
  db.run(
    `INSERT INTO movement_rules (species_id, rule_type, rule, standstill_days, exceptions, authority, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'NL')`,
    [mr.species_id, mr.rule_type, mr.rule, mr.standstill_days, mr.exceptions, mr.authority, mr.regulation_ref]
  );
}

console.log(`Inserted ${movementRules.length} movement rules.`);

// ────────────────────────────────────────
// 6. Animal Health / Disease
// ────────────────────────────────────────
const animalHealth = [
  {
    id: 'bvd-runderen', species_id: 'dairy_cattle', condition: 'BVD (Bovine Virale Diarree)',
    symptoms: 'Diarree, koorts, verminderde melkproductie, vruchtbaarheidsproblemen, verwerpen, PI-kalveren (persistent geinfecteerd)',
    causes: 'BVD-virus (pestivirus); besmetting via direct contact of PI-dieren',
    treatment: 'Geen behandeling; PI-dieren opsporen en verwijderen. Vaccinatie mogelijk ter preventie.',
    prevention: 'BVD-bestrijdingsprogramma (GD): BVD-vrij certificering, oorbiopten bij geboorte, PI-dieren direct afvoeren',
    notifiable: 0, source: 'GD Gezondheidsdienst voor Dieren / NVWA',
  },
  {
    id: 'mastitis-melkvee', species_id: 'dairy_cattle', condition: 'Mastitis (uierontsteking)',
    symptoms: 'Gezwollen uierkwartier, warmte, pijn, vlokken of klonten in melk, koorts bij klinische mastitis',
    causes: 'Bacteriele infectie (S. aureus, E. coli, Strep. uberis); slechte hygiene, beschadigd speenweefsel',
    treatment: 'Intramammaire antibiotica na bacteriologisch onderzoek; droogzettherapie; ernstige gevallen systemische antibiotica',
    prevention: 'Goede melkhygiene, speendipping, droogzettherapie, cellgetal monitoring (SDa-benchmarks)',
    notifiable: 0, source: 'GD / SDa / KNMvD',
  },
  {
    id: 'mkz-runderen', species_id: 'dairy_cattle', condition: 'Mond- en klauwzeer (MKZ)',
    symptoms: 'Koorts, blaren op tong/bek/klauwen/uier, kwijlen, kreupelheid, weigering te eten',
    causes: 'MKZ-virus (Aphthovirus); zeer besmettelijk via direct contact, lucht, fomites',
    treatment: 'Geen behandeling — meldingsplicht NVWA. Ruiming van besmette en contactbedrijven.',
    prevention: 'Strenge importcontroles, biosecurity, vaccinatie alleen bij overheidsbeleid tijdens uitbraak',
    notifiable: 1, source: 'NVWA / Wet dieren',
  },
  {
    id: 'salmonella-varkens', species_id: 'pigs', condition: 'Salmonellose (varkens)',
    symptoms: 'Diarree (geel-groen), koorts, verminderde groei, uitdroging, sporadisch sterfte bij biggen',
    causes: 'Salmonella typhimurium, S. derby; feco-orale besmetting, voer, knaagdieren',
    treatment: 'Antibiotica op basis van gevoeligheidsbepaling; rehydratatie; stressfactoren verminderen',
    prevention: 'Salmonellamonitoring verplicht (via bloedmonsters); hygieneprotocol; all-in/all-out huisvesting; voerveiligheid',
    notifiable: 0, source: 'GD / NVWA / SDa',
  },
  {
    id: 'avp-varkens', species_id: 'pigs', condition: 'Afrikaanse varkenspest (AVP)',
    symptoms: 'Hoge koorts, bloedingen huid/organen, plotselinge sterfte, blauwverkleuring oren',
    causes: 'AVP-virus (Asfarvirus); besmetting via direct contact, besmet vlees, teken, fomites',
    treatment: 'Geen behandeling — meldingsplicht NVWA. Ruiming en vervoersverbod.',
    prevention: 'Geen vaccin beschikbaar; strenge biosecurity, geen voedselresten voeren, wildbarrieres tegen wilde zwijnen',
    notifiable: 1, source: 'NVWA / EU',
  },
  {
    id: 'salmonella-pluimvee', species_id: 'laying_hens', condition: 'Salmonellose (pluimvee)',
    symptoms: 'Diarree, verminderde eiproductie, verhoogde uitval bij jonge kuikens; bij mensen gastro-enteritis',
    causes: 'Salmonella enteritidis, S. typhimurium; feco-orale besmetting, knaagdieren, voer',
    treatment: 'Antibiotica op basis van gevoeligheidstest; verbeterde hygiene; besmette koppels vaak geruimd',
    prevention: 'Salmonellamonitoring verplicht (NCP Salmonella); vaccinatie leghennen; all-in/all-out; ongediertebestrijding',
    notifiable: 0, source: 'NVWA / GD',
  },
  {
    id: 'vogelgriep-pluimvee', species_id: 'laying_hens', condition: 'Hoogpathogene aviaire influenza (vogelgriep, HPAI)',
    symptoms: 'Plotselinge hoge sterfte, sterk verminderde eiproductie, opgezette kop, blauwverkleuring kam/lellen, neurologische verschijnselen',
    causes: 'Aviaire influenza virus (H5N1, H5N8 etc.); besmetting via wilde vogels, direct contact, fomites',
    treatment: 'Geen behandeling — meldingsplicht NVWA. Ruiming besmette en contactbedrijven. Ophokplicht.',
    prevention: 'Ophokplicht bij hoog risico, biosecurity, beperkt contact met wilde vogels, hygieneprotocol',
    notifiable: 1, source: 'NVWA / Wet dieren',
  },
  {
    id: 'vogelgriep-vleeskuikens', species_id: 'broilers', condition: 'Hoogpathogene aviaire influenza (vogelgriep, HPAI)',
    symptoms: 'Plotselinge hoge sterfte, ademhalingsproblemen, gezwollen kop, verminderde wateropname',
    causes: 'Aviaire influenza virus; besmetting via wilde vogels, contact, fomites',
    treatment: 'Geen behandeling — meldingsplicht NVWA. Ruiming.',
    prevention: 'Ophokplicht, biosecurity, hygieneprotocol, beperking bezoek',
    notifiable: 1, source: 'NVWA / Wet dieren',
  },
  {
    id: 'q-koorts-geiten', species_id: 'goats', condition: 'Q-koorts (Coxiella burnetii)',
    symptoms: 'Verwerpen in het laatste drachttrimester (stormachtig verwerpen), doodgeboren lammeren, verminderde melkproductie',
    causes: 'Coxiella burnetii bacterie; besmetting via inademing van besmet stof, placenta, vruchtwater',
    treatment: 'Antibiotica (tetracycline); bij mensen: doxycycline',
    prevention: 'Vaccinatie verplicht voor melkgeiten/-schapen (>50 dieren); hygiene rond aflammeren; melding verwerpingen bij GD',
    notifiable: 1, source: 'GD / NVWA / RIVM',
  },
  {
    id: 'rotkreupel-schapen', species_id: 'sheep', condition: 'Rotkreupel (voetrot)',
    symptoms: 'Kreupelheid, stinkende poot, loslating hoornschoen, gezwollen klauwen, op de knieen lopen',
    causes: 'Dichelobacter nodosus en Fusobacterium necrophorum; natte omstandigheden, overbegrazing',
    treatment: 'Bekappen, voetbaden (zinksulfaat of formaline), antibiotica bij ernstige gevallen; isoleren',
    prevention: 'Regelmatig bekappen, voetbaden, droge standplaatsen, fokken op resistente dieren',
    notifiable: 0, source: 'GD / KNMvD',
  },
  {
    id: 'myxomatose-konijnen', species_id: 'rabbits', condition: 'Myxomatose',
    symptoms: 'Gezwollen ogen/oren/geslachtsopening, puisten, neusuitvloeiing, lusteloosheid, sterfte binnen 10-14 dagen',
    causes: 'Myxomatosevirus (Leporipoxvirus); overdracht via muggen, vlooien, direct contact',
    treatment: 'Geen effectieve behandeling; ondersteunende zorg; hoge sterfte',
    prevention: 'Vaccinatie (Nobivac Myxo-RHD); insectenbestrijding; quarantaine nieuwe dieren',
    notifiable: 0, source: 'KNMvD / GD',
  },
  // Antibiotic reduction — cross-species
  {
    id: 'antibiotica-sda', species_id: 'dairy_cattle', condition: 'Antibioticareductie — SDa benchmarkwaarden',
    symptoms: 'Niet van toepassing (beleidsmaatregel)',
    causes: 'Antimicrobiele resistentie door overmatig gebruik',
    treatment: 'Dierdagdoseringen (DDD) per diersoort; SDa benchmarkwaarden: streefwaarde, signaleringswaarde, actiewaarde',
    prevention: 'Bedrijfsgezondheidsplan met dierenarts; voorschrijven volgens formularium (KNMvD); DDDA-registratie via MediRund/MediVarken',
    notifiable: 0, source: 'SDa (Autoriteit Diergeneesmiddelen)',
  },
  // Beter Leven keurmerk
  {
    id: 'beter-leven', species_id: 'pigs', condition: 'Beter Leven keurmerk — dierenwelzijnskeurmerk',
    symptoms: 'Niet van toepassing (keurmerk/certificering)',
    causes: 'Dierenwelzijnsverbetering boven wettelijk minimum',
    treatment: 'Drie sterren: 1 ster (iets beter dan wettelijk minimum, meer ruimte, afleidingsmateriaal), 2 sterren (scharrel+, uitloop, meer ruimte), 3 sterren (biologisch niveau, buitenuitloop, veel ruimte)',
    prevention: 'Jaarlijkse audit door certificerende instelling; criteria per diersoort door Dierenbescherming',
    notifiable: 0, source: 'Dierenbescherming / Beter Leven keurmerk',
  },
  // Fosfaatrechten
  {
    id: 'fosfaatrechten', species_id: 'dairy_cattle', condition: 'Fosfaatrechtenstelsel — productiebeperking melkvee',
    symptoms: 'Niet van toepassing (milieumaatregel)',
    causes: 'Fosfaatoverschot Nederland; Nitraatrichtlijn EU; mestbeleid',
    treatment: 'Elk melkveebedrijf beschikt over fosfaatrechten in kg P2O5. Productie boven rechten: boete RVO. Rechten verhandelbaar (afroming 10% bij overdracht).',
    prevention: 'Fosfaatrechten tijdig verwerven; mestverwerking; voermaatregelen om fosfaatexcretie te verlagen',
    notifiable: 0, source: 'RVO / Meststoffenwet',
  },
  // ── New entries: meldingsplichtige dierziekten (Wet dieren) ──
  {
    id: 'varkenspest-klassiek', species_id: 'pigs', condition: 'Klassieke varkenspest (KVP)',
    symptoms: 'Hoge koorts (41-42 C), paarse vlekken op huid (oren, buik, poten), wankele gang, diarree, braken, hoge sterfte. Chronische vorm: groeistagnatie, chronische diarree, vermagering',
    causes: 'Klassiek varkenspest-virus (Pestivirus); besmetting via direct contact, besmet voer, sperma, fomites',
    treatment: 'Geen behandeling — meldingsplicht NVWA. Ruiming van besmet bedrijf + contactbedrijven. Vervoersverbod in beschermings- en toezichtsgebied. NL vrij sinds 1998.',
    prevention: 'Vaccinatie verboden in vrije status (EU). Strenge biosecurity, importcontroles, wildbarriere tegen wilde zwijnen (ASF-draaiboek ook van toepassing)',
    notifiable: 1, source: 'NVWA / Wet dieren / OIE',
  },
  {
    id: 'bse-runderen', species_id: 'dairy_cattle', condition: 'BSE (Boviene Spongiforme Encefalopathie)',
    symptoms: 'Angst, overgevoeligheid voor geluid/aanraking, abnormale gang (achterbenen), vermagering, verminderde melkproductie. Incubatietijd 2-8 jaar. Altijd dodelijk.',
    causes: 'Prion (misgevouwen eiwit); besmetting historisch via diermeel in veevoeder. Atypische BSE: sporadisch, niet voergerelateerd.',
    treatment: 'Geen behandeling — meldingsplicht NVWA. Verplichte BSE-test bij runderen >30 maanden bij slacht (monitoring) en bij alle gevallen noodslachtingen.',
    prevention: 'Verbod op diermeel in herkauwersvoer (EU, sinds 2001). Specified Risk Material (SRM) verwijderen bij slacht. NL verwaarloosbaar risico-status (OIE).',
    notifiable: 1, source: 'NVWA / EU / OIE',
  },
  {
    id: 'brucellose-runderen', species_id: 'dairy_cattle', condition: 'Brucellose (Brucella abortus)',
    symptoms: 'Verwerpen in laatste trimester, nageboorte-retentie, verminderde vruchtbaarheid. Bij stieren: orchitis. Bij mensen (zoonose): golvende koorts, gewrichtspijn.',
    causes: 'Brucella abortus bacterie; besmetting via verworpen materiaal, melk, direct contact',
    treatment: 'Geen behandeling — meldingsplicht NVWA. Ruiming van positieve dieren. NL officieel brucellose-vrij.',
    prevention: 'Serologische surveillance (tank-melk monitoring), importcontroles, quarantaine bij import uit niet-vrije landen',
    notifiable: 1, source: 'NVWA / GD / OIE',
  },
  {
    id: 'tuberculose-runderen', species_id: 'dairy_cattle', condition: 'Tuberculose (Mycobacterium bovis)',
    symptoms: 'Chronisch vermagering, hoesten, vergrote lymfeklieren. Vaak subklinisch (geen zichtbare symptomen). Diagnose via tuberculinatie (huidtest) of gamma-interferon test.',
    causes: 'Mycobacterium bovis; besmetting via ademhaling, besmet melk, direct contact. Reservoir: dassen in bepaalde landen.',
    treatment: 'Geen behandeling — meldingsplicht NVWA. Ruiming. NL officieel tuberculose-vrij (OTF-status).',
    prevention: 'Surveillance bij slacht (PM-keuring), importcontroles, quarantaine+test bij import uit niet-vrije landen. Tuberculinatie bij verdenking.',
    notifiable: 1, source: 'NVWA / GD / OIE',
  },
  {
    id: 'rabies', species_id: 'dairy_cattle', condition: 'Rabies (hondsdolheid)',
    symptoms: 'Gedragsveranderingen (agressie of apathie), speekselen, slik-/ademhalingsproblemen, verlamming, sterfte binnen 10 dagen na symptomen. Alle warmbloedige dieren vatbaar.',
    causes: 'Rabies-virus (Lyssavirus); besmetting via beet van geinfecteerd dier (vos, vleermuis). NL rabies-vrij (terrestrisch) sinds 1988.',
    treatment: 'Geen behandeling — meldingsplicht NVWA. Euthanasie van klinisch verdachte dieren. Post-expositie profylaxe bij mensen.',
    prevention: 'NL vrij; importcontroles huisdieren (vaccinatie + antistoftitratie), vaccinatie vossen (oral baits in buurlanden), vleermuismonitoring',
    notifiable: 1, source: 'NVWA / RIVM / OIE',
  },
  {
    id: 'miltvuur', species_id: 'dairy_cattle', condition: 'Miltvuur (Bacillus anthracis)',
    symptoms: 'Plotselinge sterfte zonder voorafgaande symptomen (peracuut). Subacuut: hoge koorts, bloederige afscheiding uit neus/anus/vulva, opgezwollen kadaver. Niet-stollend bloed.',
    causes: 'Bacillus anthracis (sporenvormende bacterie); sporen overleven decennia in bodem. Besmetting via besmet grasland of dierlijke producten.',
    treatment: 'Meldingsplicht NVWA. Antibiotica (penicilline) bij vroegtijdige diagnose. Kadaver NIET openen (sporenvorming). Kadaver vernietigen.',
    prevention: 'Vaccinatie mogelijk maar niet routinematig in NL. Historische miltvuurlocaties in kaart gebracht. Carcass niet openen. NVWA-meldplicht.',
    notifiable: 1, source: 'NVWA / RIVM / OIE',
  },
  {
    id: 'kwade-droes-paarden', species_id: 'dairy_cattle', condition: 'Kwade droes (Burkholderia mallei) — ook bij runderen meldingsplichtig',
    symptoms: 'Kwade droes is primair een paardenziekte maar meldingsplichtig voor alle diersoorten. Runderen: zelden klinisch. Bij paarden: neusuitvloeiing, huidulcera, lymfeklierabcessen.',
    causes: 'Burkholderia mallei bacterie. NL vrij. Uitbraakrisico minimaal — relevant bij import uit endemische gebieden (Azie, Afrika).',
    treatment: 'Geen behandeling — meldingsplicht NVWA. Euthanasie positieve dieren. NL vrij sinds >100 jaar.',
    prevention: 'Importcontroles, serologische test bij import uit risicogebieden',
    notifiable: 1, source: 'NVWA / OIE',
  },
  // ── GD-programma's ──
  {
    id: 'ibr-runderen', species_id: 'dairy_cattle', condition: 'IBR (Infectieuze Bovine Rhinotracheitis)',
    symptoms: 'Neusuitvloeiing, koorts, verminderde melkproductie, rode neus (rode neusziekte), oogontsteking, verwerpen. Latent dragerschap na infectie.',
    causes: 'Bovine Herpesvirus 1 (BoHV-1); besmetting via direct contact, aerosol. Latent virus reactivatie bij stress.',
    treatment: 'Geen curatieve behandeling. Symptoombestrijding. Vaccinatie (marker-vaccin) ter preventie.',
    prevention: 'GD IBR-bestrijdingsprogramma: IBR-vrij certificering (tankmelk gE-ELISA). NL verplichte bestrijding per 2024 (EU-AHL). Vaccinatie met gE-deletievaccin. Positieve dieren afvoeren of isoleren.',
    notifiable: 0, source: 'GD Gezondheidsdienst / EU-Verordening 2016/429',
  },
  {
    id: 'para-tbc-runderen', species_id: 'dairy_cattle', condition: 'Paratuberculose (Johne\'s disease)',
    symptoms: 'Chronische onbehandelbare diarree, vermagering ondanks goede eetlust, verminderde melkproductie. Symptomen pas op volwassen leeftijd (2-5 jaar). Subklinisch dragerschap jarenlang.',
    causes: 'Mycobacterium avium paratuberculosis (MAP); besmetting in eerste levensmaanden via mest, melk (biest). Langzame ziekte.',
    treatment: 'Geen effectieve behandeling. Positieve dieren afvoeren.',
    prevention: 'GD programma ParaTBC: statusbepaling via tankmelk-ELISA. Managementmaatregelen: biest alleen van para-vrije koeien, hygieneprotocol bij geboorte, jongvee gescheiden houden.',
    notifiable: 0, source: 'GD Gezondheidsdienst / ZuivelNL',
  },
  {
    id: 'lepto-runderen', species_id: 'dairy_cattle', condition: 'Leptospirose (Leptospira hardjo)',
    symptoms: 'Acute melkproductiedaling (melkziekte), slappe melk, soms bloedbijmenging. Verwerpen. Bij mensen (zoonose): koorts, nierfalen (ziekte van Weil).',
    causes: 'Leptospira hardjo bacterie; besmetting via urine van besmette runderen of knaagdieren, besmet water',
    treatment: 'Antibiotica (dihydrostreptomycine); vaccinatie ter preventie.',
    prevention: 'GD Leptospirose-vrij programma: tankmelk-monitoring, vaccinatie. Knaagdierenbestrijding. Weidevee extra risico (natte percelen). Zoononose: handschoenen bij afkalven.',
    notifiable: 0, source: 'GD Gezondheidsdienst / RIVM',
  },
  // ── Vaccinatiebeleid specifiek ──
  {
    id: 'bluetongue-vaccinatie', species_id: 'dairy_cattle', condition: 'Bluetongue (blauwtong) — vaccinatiebeleid',
    symptoms: 'Koorts, zwelling kop/tong (blauwe tong), kreupelheid, erosies mondslijmvlies, vermagering. Schapen ernstigst getroffen. Runderen: mildere symptomen maar virusreservoir.',
    causes: 'Bluetongue-virus (BTV, orbivirus); overdracht via Culicoides-knutten (geen directe dier-dier besmetting). Meerdere serotypen (BTV-3, BTV-8).',
    treatment: 'Symptoombestrijding. Meldingsplicht NVWA.',
    prevention: 'Vaccinatie: BTV-8 vaccin beschikbaar en aanbevolen door GD (niet verplicht). BTV-3 uitbraak 2023-2024: noodvaccinatie met inactivated vaccin. Vaccinatie vereist voor export naar vrije gebieden. Knuttenseizoen mei-november.',
    notifiable: 1, source: 'NVWA / GD / OIE',
  },
  {
    id: 'q-koorts-vaccinatie-geiten', species_id: 'goats', condition: 'Q-koorts vaccinatiebeleid — verplicht voor melkgeiten',
    symptoms: 'Zie q-koorts-geiten entry. Vaccinatie voorkomt stormachtig verwerpen en reduceert bacterie-uitscheiding.',
    causes: 'Coxiella burnetii. NL: grote uitbraak 2007-2010 (>4000 humane gevallen). Sindsdien verplichte vaccinatie.',
    treatment: 'Vaccinatie met Coxevac (inactivated vaccin): jaarlijkse booster, eerste vaccinatie voor eerste dekking. Alle melkgeiten en melkschapen op bedrijven met >50 dieren.',
    prevention: 'Verplichte vaccinatie (Regeling tijdelijke maatregelen dierziekten). Hygiene bij aflammeren: placenta opruimen. Mestverwerkingseisen. Geitenhouderij: bouwstop in meeste provincies.',
    notifiable: 1, source: 'NVWA / GD / RIVM',
  },
  {
    id: 'salmonella-vaccinatie-pluimvee', species_id: 'laying_hens', condition: 'Salmonella vaccinatiebeleid — leghennen',
    symptoms: 'Zie salmonella-pluimvee entry. Vaccinatie reduceert colonisatie en ei-besmetting.',
    causes: 'Salmonella enteritidis, S. typhimurium. NCP Salmonella (Nationaal Controle Programma) vereist monitoring en bestrijding.',
    treatment: 'Vaccinatie leghennen: levend vaccin (Salmonella enteritidis) op jonge leeftijd (opfok), booster met inactivated vaccin voor legstart. Vaccinatie niet wettelijk verplicht maar standaard in sector (IKB-Ei).',
    prevention: 'Combinatie vaccinatie + all-in/all-out + R&O + ongediertebestrijding + voerveiligheid (GMP+). NCP monitoring: mestmonsters per koppel.',
    notifiable: 0, source: 'NVWA / GD / AVINED',
  },
  // ── SDa sectorspecifieke benchmarkwaarden ──
  {
    id: 'sda-melkvee', species_id: 'dairy_cattle', condition: 'SDa benchmark — melkvee dierdagdoseringen',
    symptoms: 'Niet van toepassing (benchmarking antibioticagebruik)',
    causes: 'Antimicrobiele resistentie door onnodig of te hoog antibioticagebruik',
    treatment: 'SDa benchmarkwaarden melkvee (DDDA/jaar): streefwaarde <4, signaleringswaarde 4-6, actiewaarde >6. Registratie via MediRund. Bedrijven boven actiewaarde: verplicht verbeterplan met dierenarts.',
    prevention: 'Bedrijfsgezondheidsplan (BGP) met dierenarts; selectief droogzetten (alleen koeien met hoog celgetal); formularium (KNMvD): 1e keus middelen. NL reductie sinds 2009: -70% in veehouderij.',
    notifiable: 0, source: 'SDa / KNMvD / ZuivelNL',
  },
  {
    id: 'sda-varkens', species_id: 'pigs', condition: 'SDa benchmark — varkens dierdagdoseringen',
    symptoms: 'Niet van toepassing (benchmarking antibioticagebruik)',
    causes: 'Antimicrobiele resistentie',
    treatment: 'SDa benchmarkwaarden varkens (DDDA/jaar): zeugen/biggen streef <10, signalering 10-20, actie >20. Vleesvarkens streef <5, signalering 5-10, actie >10. Registratie via MediVarken/InfoVarken.',
    prevention: 'BGP met dierenarts; all-in/all-out; vaccinatieschema (PRRS, PCV2, lawsonia); waterbehandeling; vermijden 3e/4e keus middelen (fluoroquinolonen, cefalosporinen). Trend 2009-2024: -70% reductie.',
    notifiable: 0, source: 'SDa / KNMvD / POV',
  },
  {
    id: 'sda-vleeskuikens', species_id: 'broilers', condition: 'SDa benchmark — vleeskuikens dierdagdoseringen',
    symptoms: 'Niet van toepassing (benchmarking antibioticagebruik)',
    causes: 'Antimicrobiele resistentie',
    treatment: 'SDa benchmarkwaarden vleeskuikens (DDDA/jaar): streef <15, signalering 15-25, actie >25. Registratie via AVINED antibioticadatabase. Per koppel registreren.',
    prevention: 'IKB Kip vereist BGP; vaccinatie (NCD, IB, IBD); hygieneprotocol; schoon water; strooiselkwaliteit. Trend 2009-2024: vleeskuikens >80% reductie.',
    notifiable: 0, source: 'SDa / AVINED / KNMvD',
  },
  {
    id: 'sda-kalveren', species_id: 'veal_calves', condition: 'SDa benchmark — vleeskalveren dierdagdoseringen',
    symptoms: 'Niet van toepassing (benchmarking antibioticagebruik)',
    causes: 'Antimicrobiele resistentie — kalverhouderij historisch hoog gebruik door jonge dieren van meerdere herkomstbedrijven',
    treatment: 'SDa benchmarkwaarden vleeskalveren (DDDA/jaar): witvlees streef <23, signalering 23-40, actie >40. Rose streef <15, signalering 15-28, actie >28. Registratie via MediKalf.',
    prevention: 'Aankoopbeleid (minder herkomstbedrijven mengen); quarantaine bij opzet; vaccinatie (IBR, BVD, pasteurella); elektrolytbeleid; maternale immuniteit via biest. Trend: kalversector als laatste met significante reductie, -48% sinds 2015.',
    notifiable: 0, source: 'SDa / SBK (Stichting Brancheorganisatie Kalversector)',
  },
  // ── Vogelgriep eenden en kalkoenen ──
  {
    id: 'vogelgriep-eenden', species_id: 'ducks', condition: 'Hoogpathogene aviaire influenza — eenden',
    symptoms: 'Eenden kunnen HPAI-virus dragen met milde of geen symptomen (asymptomatisch reservoir). Soms: verminderde eiproductie, neurologische verschijnselen, sterfte bij virulente stammen.',
    causes: 'Aviaire influenza virus; eenden als natuurlijk reservoir. Contact met wilde watervogels belangrijkste risicofactor.',
    treatment: 'Meldingsplicht NVWA. Ruiming bij HPAI-bevestiging.',
    prevention: 'Ophokplicht bij hoog risico; eendenhouderij extra risicosector door contact met wilde watervogels. Strenge biosecurity: geen open water dat wilde vogels aantrekt.',
    notifiable: 1, source: 'NVWA / Wet dieren',
  },
  {
    id: 'vogelgriep-kalkoenen', species_id: 'turkeys', condition: 'Hoogpathogene aviaire influenza — kalkoenen',
    symptoms: 'Zeer hoge sterfte (tot 100%), gezwollen kop, sinusitis, ademhalingsproblemen, daling wateropname, daling eiproductie. Kalkoenen zijn het meest gevoelig van alle pluimveesoorten.',
    causes: 'Aviaire influenza virus; besmetting via wilde vogels, fomites, aerosol',
    treatment: 'Meldingsplicht NVWA. Ruiming.',
    prevention: 'Ophokplicht, biosecurity, ventilatie-inlaat beschermen tegen wilde vogels. Kalkoenbedrijven: extra monitoring bij risicoperiode (herfst/winter).',
    notifiable: 1, source: 'NVWA / Wet dieren',
  },
  {
    id: 'rhd-konijnen', species_id: 'rabbits', condition: 'RHD (Rabbit Haemorrhagic Disease)',
    symptoms: 'Plotselinge sterfte zonder voorafgaande symptomen, bloederige neusuitvloeiing, neurologische verschijnselen. Sterfte tot 90% in onbeschermde populaties.',
    causes: 'RHD-virus (Lagovirus); besmetting via direct contact, fomites, insecten. Variant RHDV2 sinds 2010.',
    treatment: 'Geen effectieve behandeling. Hoge sterfte.',
    prevention: 'Vaccinatie met Nobivac Myxo-RHD PLUS (beschermt tegen myxomatose + RHDV1 + RHDV2). Biosecurity, insectenbestrijding, quarantaine.',
    notifiable: 0, source: 'KNMvD / GD',
  },
  {
    id: 'prrs-varkens', species_id: 'pigs', condition: 'PRRS (Porcine Reproductive and Respiratory Syndrome)',
    symptoms: 'Zeugen: verwerpen, doodgeboren biggen, mumificatie. Biggen: ademhalingsproblemen, blauwverkleuring oren, hoge sterfte. Vleesvarkens: hoesten, groeivertraging, secundaire infecties.',
    causes: 'PRRS-virus (Arterivirus); besmetting via direct contact, sperma, aerosol (tot 3 km). Twee genotypen: EU (type 1) en NA (type 2).',
    treatment: 'Symptoombestrijding; antibiotica tegen secundaire infecties. Vaccinatie mogelijk (levend verzwakt).',
    prevention: 'GD PRRS-monitoring; vaccinatie zeugenstapel; gesloten bedrijfsvoering; luchtfiltratie; KI-sperma PRRS-vrij. Eradicatieprogramma niet haalbaar door hoge prevalentie.',
    notifiable: 0, source: 'GD / POV / KNMvD',
  },
  {
    id: 'coccidiose-pluimvee', species_id: 'broilers', condition: 'Coccidiose (Eimeria spp.)',
    symptoms: 'Bloederige of waterige diarree, verminderde groei, slechte voederconversie, verhoogde uitval. Subklinische vorm: groeiderving zonder zichtbare symptomen.',
    causes: 'Eimeria spp. (E. tenella, E. acervulina, E. maxima etc.); besmetting via oocysten in strooisel (feco-oraal)',
    treatment: 'Anticoccidiose middelen in voer (ionoforen: salinomycine, narasine; chemisch: diclazuril, toltrazuril). Curatief: toltrazuril in drinkwater.',
    prevention: 'Coccidiose-vaccinatie (levende oocysten) op dag 1 of via sproeien; shuttleprogramma (wisselende anticoccidiose middelen per ronde); goed strooiselmanagement.',
    notifiable: 0, source: 'GD / AVINED / KNMvD',
  },
  {
    id: 'newcastle-pluimvee', species_id: 'broilers', condition: 'Newcastle disease (NCD / pseudovogelpest)',
    symptoms: 'Plotselinge hoge sterfte, ademhalingsproblemen, diarree (groenig), neurologische verschijnselen (koppdraaien, verlamming), daling eiproductie.',
    causes: 'Newcastle disease virus (Avulavirus); besmetting via direct contact, fomites, aerosol. Wilde vogels als reservoir.',
    treatment: 'Geen behandeling — meldingsplicht NVWA. Ruiming besmette koppels.',
    prevention: 'Vaccinatie verplicht voor alle commercieel gehouden pluimvee in NL (spray/drinkwater bij jonge kuikens, inactivated boost voor leghennen). Ophokplicht bij hoog risico.',
    notifiable: 1, source: 'NVWA / AVINED / Wet dieren',
  },
  {
    id: 'zwoegerziekte-schapen', species_id: 'sheep', condition: 'Zwoegerziekte (Maedi-Visna)',
    symptoms: 'Progressieve vermagering, benauwdheid, hoesten, slechte conditie wolkwaliteit, mastitis (harde uier). Langzaam progressief — symptomen na 2-4 jaar.',
    causes: 'Maedi-Visna virus (Lentivirus); besmetting via biest/melk, direct contact, aerosol. Levenslange infectie.',
    treatment: 'Geen behandeling. Positieve dieren afvoeren.',
    prevention: 'GD Maedi-Visna-vrij programma: serologische screening, gesloten bedrijfsvoering, certificering. Biest alleen van MV-vrije ooien.',
    notifiable: 0, source: 'GD / KNMvD',
  },
  {
    id: 'schmallenberg-runderen', species_id: 'dairy_cattle', condition: 'Schmallenberg-virus (SBV)',
    symptoms: 'Lichte symptomen bij volwassen dieren (koorts, daling melkproductie, diarree). Ernstig: misvormde kalveren/lammeren (arthrogrypose, torticollis) als moeder in eerste helft dracht besmet. Uitbraak 2011 in NL.',
    causes: 'Schmallenberg-virus (Orthobunyavirus); overdracht via Culicoides-knutten (net als BTV). Seizoensgebonden (zomer-herfst).',
    treatment: 'Symptoombestrijding. Geen meldingsplicht. Meeste dieren bouwen immuniteit op.',
    prevention: 'Vaccinatie beschikbaar (Bovilis SBV). Natuurlijke immuniteit na doormaking. Drachtige dieren beschermen tegen knutten in eerste helft dracht.',
    notifiable: 0, source: 'GD / NVWA / WUR',
  },
];

for (const ah of animalHealth) {
  db.run(
    `INSERT OR REPLACE INTO animal_health (id, species_id, condition, symptoms, causes, treatment, prevention, notifiable, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'NL')`,
    [ah.id, ah.species_id, ah.condition, ah.symptoms, ah.causes, ah.treatment, ah.prevention, ah.notifiable, ah.source]
  );
}

console.log(`Inserted ${animalHealth.length} animal health entries.`);

// ────────────────────────────────────────
// 7. Housing Requirements
// ────────────────────────────────────────
const housingRequirements = [
  {
    species_id: 'dairy_cattle', age_class: 'adult', system: 'ligboxenstal',
    space_per_head_m2: 6.0, ventilation: 'Natuurlijke ventilatie met nokventilatie; minimaal 500 m3/uur per koe',
    flooring: 'Ligboxen met rubber mat of diep strooisel; roostervloer in loopgang',
    temperature_range: '-10 tot 25 C (koestress boven 25 C)', lighting: 'Daglicht + minimaal 150-200 lux kunstlicht 16 uur',
    source: 'Besluit houders van dieren / WUR',
  },
  {
    species_id: 'dairy_cattle', age_class: 'adult', system: 'potstal',
    space_per_head_m2: 8.0, ventilation: 'Natuurlijke ventilatie; open nok en zijwanden',
    flooring: 'Diep stro; regelmatig instrooien', temperature_range: '-10 tot 25 C',
    lighting: 'Daglicht + kunstlicht 150-200 lux',
    source: 'Besluit houders van dieren / WUR',
  },
  {
    species_id: 'dairy_cattle', age_class: 'jongvee', system: 'iglo/groepshuisvesting',
    space_per_head_m2: 3.0, ventilation: 'Natuurlijke ventilatie; kalveriglos met buitenuitloop',
    flooring: 'Stro op dichte vloer; droge ligplaats',
    temperature_range: '-5 tot 25 C (kalveren: tochtvriij)',
    lighting: 'Daglicht; kunstlicht bij winterstalling',
    source: 'Besluit houders van dieren / WUR',
  },
  {
    species_id: 'pigs', age_class: 'vleesvarkens', system: 'indoor',
    space_per_head_m2: 0.65, ventilation: 'Mechanische ventilatie; max 0.2 m/s luchtsnelheid op dierniveau',
    flooring: 'Deels roostervloer, deels dichte vloer (minimaal 40% dicht); ligruimte droog en comfortabel',
    temperature_range: '18-22 C (vleesvarkens)', lighting: 'Minimaal 40 lux gedurende 8 uur per dag',
    source: 'Besluit houders van dieren / Varkensbesluit',
  },
  {
    species_id: 'pigs', age_class: 'zeugen', system: 'groepshuisvesting',
    space_per_head_m2: 2.25, ventilation: 'Mechanische ventilatie; individueel klimaat bij biggenhoek (30-32 C)',
    flooring: 'Deels roostervloer; dichte vloer met strooisel in liggebied',
    temperature_range: '18-20 C (zeugen), 30-32 C (biggennest)', lighting: 'Minimaal 40 lux gedurende 8 uur',
    source: 'Besluit houders van dieren / Varkensbesluit',
  },
  {
    species_id: 'pigs', age_class: 'gespeende biggen', system: 'indoor',
    space_per_head_m2: 0.30, ventilation: 'Mechanische ventilatie; verwarmingslamp of vloerverwarming',
    flooring: 'Deels roostervloer; dichte vloer met verwarming',
    temperature_range: '25-28 C (gespeende biggen)', lighting: 'Minimaal 40 lux gedurende 8 uur',
    source: 'Besluit houders van dieren / Varkensbesluit',
  },
  {
    species_id: 'pigs', age_class: 'vleesvarkens', system: 'beter_leven_1ster',
    space_per_head_m2: 1.0, ventilation: 'Mechanische ventilatie met natuurlijke aanvulling; daglicht via ramen',
    flooring: 'Minimaal 40% dichte vloer met stro; roostervloer in mestgedeelte',
    temperature_range: '18-22 C', lighting: 'Daglicht via ramen (minimaal 3% vloeroppervlak) + 40 lux kunstlicht',
    source: 'Beter Leven criteria varkens 2024',
  },
  {
    species_id: 'laying_hens', age_class: 'adult', system: 'scharrelsysteem',
    space_per_head_m2: 0.11, ventilation: 'Mechanische of natuurlijke ventilatie; ammoniakbeheersing',
    flooring: 'Strooisel op minimaal 33% van vloeroppervlak; roostervloer met mestband',
    temperature_range: '15-24 C', lighting: 'Minimaal 20 lux; 16L:8D lichtschema; daglicht via ramen',
    source: 'Besluit houders van dieren',
  },
  {
    species_id: 'broilers', age_class: 'kuiken', system: 'indoor',
    space_per_head_m2: 0.04, ventilation: 'Mechanische ventilatie; ammoniakconcentratie max 20 ppm',
    flooring: 'Volledig strooisel (houtkrullen of gehakseld stro)',
    temperature_range: '33 C (dag 1) afbouwend naar 20 C (dag 35)', lighting: 'Minimaal 20 lux; 6 uur aaneengesloten donkerperiode',
    source: 'Besluit houders van dieren / EU-richtlijn 2007/43/EG',
  },
  {
    species_id: 'goats', age_class: 'adult', system: 'indoor',
    space_per_head_m2: 1.5, ventilation: 'Natuurlijke ventilatie; geiten gevoelig voor tocht',
    flooring: 'Diep strooisel of roostervloer met ligvloer; verhoogde ligplaatsen gewenst',
    temperature_range: '5-25 C', lighting: 'Daglicht + kunstlicht; minimaal 16 uur licht voor melkgeiten',
    source: 'Besluit houders van dieren / GD',
  },
  {
    species_id: 'sheep', age_class: 'adult', system: 'indoor',
    space_per_head_m2: 1.5, ventilation: 'Natuurlijke ventilatie; vermijd tocht op dierniveau',
    flooring: 'Stro op dichte vloer; droge ligplaats',
    temperature_range: '5-20 C', lighting: 'Daglicht; kunstlicht bij winterstalling',
    source: 'Besluit houders van dieren / NVWA',
  },
  {
    species_id: 'rabbits', age_class: 'adult', system: 'parkhuisvesting',
    space_per_head_m2: 0.08, ventilation: 'Mechanische ventilatie; ammoniakbeheersing',
    flooring: 'Kunststof roostervloer met platform/verhoging; geen draadgazen bodem',
    temperature_range: '15-25 C', lighting: 'Minimaal 20 lux; 8-16 uur lichtperiode',
    source: 'Besluit houders van dieren',
  },
  // New housing entries
  {
    species_id: 'veal_calves', age_class: 'individueel (<8 weken)', system: 'individuele_box',
    space_per_head_m2: 1.5, ventilation: 'Natuurlijke of mechanische ventilatie; tochtvriij',
    flooring: 'Stro of rubber mat; geen volledig roostervloer. Box 1.5x schouderbreedte breed, 1.1x lichaamslengte lang.',
    temperature_range: '5-25 C', lighting: 'Daglicht; minimaal 80 lux gedurende 8 uur',
    source: 'Besluit houders van dieren art. 2.29-2.34 / EU-richtlijn 2008/119/EG',
  },
  {
    species_id: 'veal_calves', age_class: 'groepshuisvesting', system: 'groepshuisvesting',
    space_per_head_m2: 1.8, ventilation: 'Mechanische ventilatie; ammoniak max 20 ppm',
    flooring: 'Houten of kunststof roostervloer met rubber toplaag; deel dichte vloer met stro (aanbevolen)',
    temperature_range: '5-25 C', lighting: 'Daglicht; minimaal 80 lux gedurende 8 uur. Nachtrust minimaal 8 uur.',
    source: 'Besluit houders van dieren art. 2.29-2.34 / EU-richtlijn 2008/119/EG',
  },
  {
    species_id: 'ducks', age_class: 'vleeseend', system: 'indoor',
    space_per_head_m2: 0.14, ventilation: 'Mechanische ventilatie; hoge vochtproductie door watergebruik',
    flooring: 'Volledig strooisel; regelmatig bijstrooien. Eenden produceren meer vocht dan kippen.',
    temperature_range: '18-22 C (opfok: 32 C dag 1, afbouwend)', lighting: 'Minimaal 20 lux; 6 uur aaneengesloten donker',
    source: 'EFSA advies watervogels 2023 / NVWA',
  },
  {
    species_id: 'turkeys', age_class: 'hanen/hennen', system: 'indoor',
    space_per_head_m2: 0.06, ventilation: 'Mechanische ventilatie; ammoniakbeheersing kritisch (hoge productie)',
    flooring: 'Volledig strooisel (houtkrullen); strooiselkwaliteit monitoren (voetzoollaesies)',
    temperature_range: '33 C (dag 1) afbouwend naar 18 C (volwassen)', lighting: 'Minimaal 20 lux; 8 uur donker; daglicht aanbevolen',
    source: 'EU-Aanbeveling kalkoenen / Beter Leven criteria / NVWA',
  },
  {
    species_id: 'sheep', age_class: 'lammeren', system: 'aflammerruimte',
    space_per_head_m2: 2.0, ventilation: 'Tochtvriij; verwarming beschikbaar voor pasgeboren lammeren',
    flooring: 'Dik stro; droog en schoon; individuele aflammerhokken (1.5x1.5 m) voor ooi + lammeren eerste dagen',
    temperature_range: '10-20 C (pasgeboren lammeren: >15 C)', lighting: 'Voldoende licht voor toezicht; 24-uur verlichting in lammerperiode',
    source: 'WUR / Schapenfokkerij / NVWA',
  },
  {
    species_id: 'goats', age_class: 'adult', system: 'biologisch',
    space_per_head_m2: 2.5, ventilation: 'Natuurlijke ventilatie; tochtvriij',
    flooring: 'Diep strooisel; verhoogde ligplaatsen; voldoende vreetplaatsbreedte (0.40 m per geit)',
    temperature_range: '5-25 C', lighting: 'Daglicht + kunstlicht 16 uur; buitenuitloop overdag',
    source: 'EU-Verordening 2018/848 / SKAL / GD',
  },
  {
    species_id: 'dairy_cattle', age_class: 'adult', system: 'biologisch_vrijloopstal',
    space_per_head_m2: 10.0, ventilation: 'Open stal met natuurlijke ventilatie aan 3 zijden',
    flooring: 'Composiet bodem (houtsnippers + mest) of diep strooisel; geen roostervloer',
    temperature_range: '-10 tot 25 C', lighting: 'Daglicht; open stal-concept',
    source: 'WUR / SKAL / Dierenbescherming',
  },
  {
    species_id: 'pigs', age_class: 'zeugen', system: 'vrije_kraamstal',
    space_per_head_m2: 7.5, ventilation: 'Mechanische ventilatie; biggennest 30-32 C separaat verwarmd',
    flooring: 'Dichte vloer met stro in liggebied; mestgedeelte apart; voldoende ruimte voor zeug om zich om te keren',
    temperature_range: '18-20 C (zeug), 30-32 C (biggennest)', lighting: 'Minimaal 40 lux; 8 uur licht; camera-bewaking aanbevolen',
    source: 'Beter Leven 2/3 ster criteria / WUR / Dierenbescherming',
  },
  {
    species_id: 'rabbits', age_class: 'voedster', system: 'park_met_nestkast',
    space_per_head_m2: 0.12, ventilation: 'Mechanische ventilatie; ammoniakbeheersing',
    flooring: 'Kunststof roostervloer met verhoogd platform; gesloten nestkast beschikbaar 3 dagen voor werpen',
    temperature_range: '15-25 C', lighting: 'Minimaal 20 lux; 16L:8D schema; gevoelig voor plotselinge lichtveranderingen',
    source: 'Besluit houders van dieren / WUR',
  },
];

for (const hr of housingRequirements) {
  db.run(
    `INSERT INTO housing_requirements (species_id, age_class, system, space_per_head_m2, ventilation, flooring, temperature_range, lighting, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'NL')`,
    [hr.species_id, hr.age_class, hr.system, hr.space_per_head_m2, hr.ventilation, hr.flooring, hr.temperature_range, hr.lighting, hr.source]
  );
}

console.log(`Inserted ${housingRequirements.length} housing requirements.`);

// ────────────────────────────────────────
// 8. Breeding Guidance
// ────────────────────────────────────────
const breedingGuidance = [
  {
    species_id: 'dairy_cattle', topic: 'afkalven',
    guidance: 'Dracht duurt gemiddeld 280 dagen. Droogzetten 6-8 weken voor verwachte afkalfdatum. Transitierantsoen 3 weken voor afkalven. BCS streefwaarde bij droogzetten 3.0-3.5. Tussenkalftijd streefwaarde 365-400 dagen.',
    calendar: JSON.stringify({ inseminatie: 'Jaarrond (KI)', drachtcontrole: '30-90 dagen na inseminatie', droogzetten: '6-8 weken voor afkalven', afkalven: 'Jaarrond', opnieuw_insemineren: '60-90 dagen na afkalven' }),
    gestation_days: 280,
    source: 'CRV / GD / WUR',
  },
  {
    species_id: 'beef_cattle', topic: 'afkalven',
    guidance: 'Dracht duurt gemiddeld 283 dagen (rasverschillen: 275-290 dagen). Zoogkoeien seizoensgebonden afkalven in voorjaar (maart-mei). Stieren 1:25-30 koeien in dekseizoen.',
    calendar: JSON.stringify({ dekseizoen: 'Jun-Aug', drachtcontrole: 'Sep-Nov', afkalven: 'Mrt-Mei', spenen: 'Sep-Okt' }),
    gestation_days: 283,
    source: 'WUR / Vleesvee Nederland',
  },
  {
    species_id: 'pigs', topic: 'werpen',
    guidance: 'Draagtijd zeug gemiddeld 114 dagen (3 maanden, 3 weken, 3 dagen). Verplaatsen naar kraamstal 5-7 dagen voor verwachte werpdatum. Streefwaarde 2.3-2.5 worpen per zeug per jaar. Gemiddeld 14-16 levend geboren biggen per worp.',
    calendar: JSON.stringify({ dekken: 'Continue productie', drachtcontrole: '28 dagen na dekken', verplaatsen_kraamstal: '7 dagen voor werpen', werpen: '114 dagen na dekken', spenen: '21-28 dagen na werpen' }),
    gestation_days: 114,
    source: 'Topigs Norsvin / WUR',
  },
  {
    species_id: 'laying_hens', topic: 'legperiode',
    guidance: 'Legrijpheid rond 18-20 weken. Legpiek (95%+) rond 26-30 weken. Legperiode 72-100 weken (steeds langere cycli door genetica). Na rui eventueel tweede legcyclus.',
    calendar: JSON.stringify({ opfok: '0-18 weken', legstart: '18-20 weken', legpiek: '26-30 weken', einde_legperiode: '72-100 weken' }),
    gestation_days: 21,
    source: 'Lohmann / ISA / WUR',
  },
  {
    species_id: 'goats', topic: 'aflammeren',
    guidance: 'Draagtijd geit gemiddeld 150 dagen. Seizoensgebonden: dekseizoen september-november, aflammeren februari-april. Gemiddeld 1.8-2.2 lammeren per worp.',
    calendar: JSON.stringify({ dekseizoen: 'Sep-Nov', drachtcontrole: 'Nov-Dec', aflammeren: 'Feb-Apr', spenen: '8-12 weken' }),
    gestation_days: 150,
    source: 'GD / LTO / WUR',
  },
  {
    species_id: 'sheep', topic: 'lammen',
    guidance: 'Draagtijd ooi gemiddeld 147 dagen. Dekseizoen oktober-november. Scannen op 80-90 dagen dracht. Stoomvoeren laatste 6 weken. Gemiddeld 1.5-2.0 lammeren per worp (rasverschillen).',
    calendar: JSON.stringify({ dekken: 'Okt-Nov', scannen: 'Jan', lammen: 'Mrt-Apr', spenen: 'Jul-Aug' }),
    gestation_days: 147,
    source: 'WUR / Schapenfokkerij',
  },
  {
    species_id: 'rabbits', topic: 'werpen',
    guidance: 'Draagtijd konijn gemiddeld 31 dagen. 4-8 worpen per jaar bij commerciele houderij. Gemiddeld 8-10 jongen per worp. Spenen op 4-5 weken.',
    calendar: JSON.stringify({ dekken: 'Continue productie', drachtcontrole: '12-14 dagen na dekken', werpen: '31 dagen na dekken', spenen: '28-35 dagen na werpen' }),
    gestation_days: 31,
    source: 'WUR / Kleindiervee',
  },
  // New breeding entries
  {
    species_id: 'veal_calves', topic: 'opzet en afleveren',
    guidance: 'Vleeskalveren worden als nuchter kalf (1-2 weken oud) aangevoerd vanuit de melkveehouderij. Witvleeskalveren: afleveren op 6-8 maanden (220-260 kg). Rose kalveren: afleveren op 8-10 maanden (280-350 kg). Opzetgewicht ideaal 45-55 kg.',
    calendar: JSON.stringify({ aanvoer: 'Jaarrond (1-2 weken oud)', opfok: '0-8 weken (melk + ruwvoer)', afmest: '8 weken tot afleveren', afleveren_wit: '6-8 maanden', afleveren_rose: '8-10 maanden' }),
    gestation_days: 280,
    source: 'SBK / Van Drie Group / WUR',
  },
  {
    species_id: 'ducks', topic: 'broeden en groei',
    guidance: 'Broedduur Pekin-eend 28 dagen. Vleeseenden: slachtleeftijd 42-49 dagen (Pekin) of 70-84 dagen (Barbarie). Seksen bij uitkomst. Voerconversie Pekin 1.9-2.2. Eiproductie (fokdieren): 200-280 eieren per jaar.',
    calendar: JSON.stringify({ broeden: '28 dagen', opfok: '0-14 dagen (warmte)', groei: '14-42 dagen', slacht_pekin: '42-49 dagen', slacht_barbarie: '70-84 dagen' }),
    gestation_days: 28,
    source: 'Cherry Valley / Grimaud / WUR',
  },
  {
    species_id: 'turkeys', topic: 'groeiperiode',
    guidance: 'Broedduur kalkoen 28 dagen. Hennen: slachtleeftijd 12-14 weken (9-11 kg). Hanen: slachtleeftijd 18-22 weken (18-22 kg). KI gebruikelijk bij zware rassen (natuurlijke paring fysiek moeilijk). Voerconversie 2.4-2.8.',
    calendar: JSON.stringify({ broeden: '28 dagen', opfok: '0-6 weken (warmte)', groei_hennen: '6-14 weken', groei_hanen: '6-22 weken', slacht_hennen: '12-14 weken', slacht_hanen: '18-22 weken' }),
    gestation_days: 28,
    source: 'Aviagen Turkeys / Hybrid / WUR',
  },
  {
    species_id: 'dairy_cattle', topic: 'genomische selectie',
    guidance: 'CRV genomische fokwaarden beschikbaar voor Nederlandse Holstein. Genomische test op jonge leeftijd (1 maand) geeft betrouwbare fokwaardeschattingen. Fokdoelen: melkproductie, vruchtbaarheid, uiergezondheid, klauwgezondheid, levensduur, efficiëntie. Hoornloosheid (Pp-gen) als fokdoel in opkomst.',
    calendar: JSON.stringify({ genomische_test: '1 maand', eerste_inseminatie: '13-15 maanden', eerste_afkalven: '23-26 maanden' }),
    gestation_days: 280,
    source: 'CRV / WUR / GENO',
  },
  {
    species_id: 'pigs', topic: 'fokkerij en KI',
    guidance: 'Nederlandse varkensfokkerij: KI (kunstmatige inseminatie) bij >95% van de zeugen. Topigs Norsvin TN70 zeugenlijn dominant. Eindbeer: Duroc of Pietrain. Fokdoelen: worpgrootte, bigvitaliteit, voederconversie, vlees%, robuustheid. Gesekst sperma in ontwikkeling.',
    calendar: JSON.stringify({ puberteit_gelt: '6-7 maanden', eerste_inseminatie: '7.5-8 maanden', KI_tijdstip: '24-36 uur na stareflex', herinseminatie: '21 dagen na eerste KI indien niet drachtig' }),
    gestation_days: 114,
    source: 'Topigs Norsvin / WUR / KI-station',
  },
  {
    species_id: 'goats', topic: 'seizoensgebonden voortplanting',
    guidance: 'Geiten zijn seizoensgebonden vruchtbaar (short-day breeders). Natuurlijk dekseizoen: september-februari. Lichtstimulatie en melatonine-implantaten kunnen seizoen verlengen. Gemiddeld 1.8-2.2 lammeren per worp. Bokken 1:25-40 geiten.',
    calendar: JSON.stringify({ lichtprogramma_start: 'Apr-Mei (voor vervroegd dekken)', dekseizoen: 'Sep-Nov (natuurlijk), Jul-Sep (lichtprogramma)', drachtcontrole: '40-60 dagen (echo)', aflammeren: 'Feb-Apr (natuurlijk), Dec-Feb (lichtprogramma)' }),
    gestation_days: 150,
    source: 'GD / WUR / Goat Valley',
  },
  {
    species_id: 'sheep', topic: 'rammen en dekmanagement',
    guidance: 'Rammen: vruchtbaarheidsonderzoek voor dekseizoen (spermacontrole, lichaamsconditie BCS 3.5-4.0). Dekverhouding 1:30-50 ooien. Rameffect: introductie ram bij ooien na 3 weken isolatie synchroniseert bronstigheid. Dekblokken van 5-6 weken.',
    calendar: JSON.stringify({ rammen_keuren: 'Aug-Sep', dekblok_start: 'Okt', dekblok_einde: 'Nov', scannen: 'Jan (80-90 dagen)' }),
    gestation_days: 147,
    source: 'WUR / Schapenfokkerij / GD',
  },
];

for (const bg of breedingGuidance) {
  db.run(
    `INSERT INTO breeding_guidance (species_id, topic, guidance, calendar, gestation_days, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, 'NL')`,
    [bg.species_id, bg.topic, bg.guidance, bg.calendar, bg.gestation_days, bg.source]
  );
}

console.log(`Inserted ${breedingGuidance.length} breeding guidance entries.`);

// ────────────────────────────────────────
// 9. FTS5 Search Index
// ────────────────────────────────────────

// Clear existing FTS data
db.run(`DELETE FROM search_index`);

// Welfare standards -> FTS
for (const w of welfareStandards) {
  const speciesName = species.find(s => s.id === w.species_id)?.name ?? w.species_id;
  db.run(
    `INSERT INTO search_index (title, body, species, category, jurisdiction) VALUES (?, ?, ?, ?, 'NL')`,
    [
      w.standard,
      `${w.legal_minimum} ${w.best_practice} ${w.regulation_ref}`,
      w.species_id,
      `welfare/${w.category}`,
    ]
  );
}

// Movement rules -> FTS
for (const mr of movementRules) {
  const speciesName = species.find(s => s.id === mr.species_id)?.name ?? mr.species_id;
  db.run(
    `INSERT INTO search_index (title, body, species, category, jurisdiction) VALUES (?, ?, ?, ?, 'NL')`,
    [
      `${speciesName} — ${mr.rule_type}`,
      `${mr.rule} ${mr.exceptions ?? ''} ${mr.regulation_ref}`,
      mr.species_id,
      `movement/${mr.rule_type}`,
    ]
  );
}

// Animal health -> FTS
for (const ah of animalHealth) {
  db.run(
    `INSERT INTO search_index (title, body, species, category, jurisdiction) VALUES (?, ?, ?, ?, 'NL')`,
    [
      ah.condition,
      `${ah.symptoms} ${ah.causes} ${ah.treatment} ${ah.prevention}`,
      ah.species_id,
      ah.notifiable ? 'health/notifiable_disease' : 'health',
    ]
  );
}

// Housing -> FTS
for (const hr of housingRequirements) {
  const speciesName = species.find(s => s.id === hr.species_id)?.name ?? hr.species_id;
  db.run(
    `INSERT INTO search_index (title, body, species, category, jurisdiction) VALUES (?, ?, ?, ?, 'NL')`,
    [
      `${speciesName} huisvesting — ${hr.system}`,
      `${hr.ventilation} ${hr.flooring} ${hr.temperature_range} ${hr.lighting}`,
      hr.species_id,
      'housing',
    ]
  );
}

// Feed -> FTS
for (const fr of feedRequirements) {
  const speciesName = species.find(s => s.id === fr.species_id)?.name ?? fr.species_id;
  db.run(
    `INSERT INTO search_index (title, body, species, category, jurisdiction) VALUES (?, ?, ?, ?, 'NL')`,
    [
      `${speciesName} voeding — ${fr.production_stage}`,
      `${fr.example_ration} ${fr.notes}`,
      fr.species_id,
      'feed',
    ]
  );
}

// Breeding -> FTS
for (const bg of breedingGuidance) {
  const speciesName = species.find(s => s.id === bg.species_id)?.name ?? bg.species_id;
  db.run(
    `INSERT INTO search_index (title, body, species, category, jurisdiction) VALUES (?, ?, ?, ?, 'NL')`,
    [
      `${speciesName} fokkerij — ${bg.topic}`,
      bg.guidance,
      bg.species_id,
      'breeding',
    ]
  );
}

// Stocking density -> FTS
for (const sd of stockingDensities) {
  const speciesName = species.find(s => s.id === sd.species_id)?.name ?? sd.species_id;
  db.run(
    `INSERT INTO search_index (title, body, species, category, jurisdiction) VALUES (?, ?, ?, ?, 'NL')`,
    [
      `${speciesName} bezettingsnorm — ${sd.housing_type}`,
      `${sd.age_class}: ${sd.density_value} ${sd.density_unit}, wettelijk minimum ${sd.legal_minimum}, aanbevolen ${sd.recommended}`,
      sd.species_id,
      'stocking_density',
    ]
  );
}

const ftsCount = db.get<{ count: number }>('SELECT COUNT(*) as count FROM search_index');
console.log(`FTS5 search index: ${ftsCount?.count ?? 0} entries.`);

// ────────────────────────────────────────
// 10. Metadata
// ────────────────────────────────────────
const totalRows = species.length + welfareStandards.length + stockingDensities.length +
  feedRequirements.length + movementRules.length + animalHealth.length +
  housingRequirements.length + breedingGuidance.length;

db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('last_ingest', ?)", [now]);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('build_date', ?)", [now]);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('jurisdiction', 'NL')", []);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('mcp_name', 'Netherlands Livestock MCP')", []);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('species_count', ?)", [String(species.length)]);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('welfare_count', ?)", [String(welfareStandards.length)]);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('movement_count', ?)", [String(movementRules.length)]);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('health_count', ?)", [String(animalHealth.length)]);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('total_rows', ?)", [String(totalRows)]);

// ────────────────────────────────────────
// 11. Coverage JSON
// ────────────────────────────────────────
writeFileSync('data/coverage.json', JSON.stringify({
  mcp_name: 'Netherlands Livestock MCP',
  jurisdiction: 'NL',
  build_date: now,
  status: 'populated',
  species_count: species.length,
  species: species.map(s => ({ id: s.id, name: s.name })),
  welfare_standards_count: welfareStandards.length,
  stocking_densities_count: stockingDensities.length,
  feed_requirements_count: feedRequirements.length,
  movement_rules_count: movementRules.length,
  animal_health_count: animalHealth.length,
  housing_requirements_count: housingRequirements.length,
  breeding_guidance_count: breedingGuidance.length,
  total_rows: totalRows,
  fts_entries: ftsCount?.count ?? 0,
  sources: [
    'NVWA (Nederlandse Voedsel- en Warenautoriteit)',
    'Besluit houders van dieren (Bhvd)',
    'RVO (Rijksdienst voor Ondernemend Nederland)',
    'GD (Gezondheidsdienst voor Dieren)',
    'SDa (Autoriteit Diergeneesmiddelen)',
    'Dierenbescherming / Beter Leven keurmerk',
    'EU-Verordening 1/2005 (transport)',
    'EU-Verordening 1099/2009 (slacht)',
    'EU-Verordening 2018/848 (biologisch)',
    'SKAL (biologische certificering)',
    'TRACES (Trade Control and Expert System)',
    'KNMvD (Koninklijke Nederlandse Maatschappij voor Diergeneeskunde)',
    'CRV (fokwaarden)',
    'EFSA (European Food Safety Authority)',
  ],
}, null, 2));

db.close();

console.log('\nIngestion complete.');
console.log(`  Species:           ${species.length}`);
console.log(`  Welfare standards: ${welfareStandards.length}`);
console.log(`  Stocking densities: ${stockingDensities.length}`);
console.log(`  Feed requirements: ${feedRequirements.length}`);
console.log(`  Movement rules:    ${movementRules.length}`);
console.log(`  Animal health:     ${animalHealth.length}`);
console.log(`  Housing:           ${housingRequirements.length}`);
console.log(`  Breeding guidance: ${breedingGuidance.length}`);
console.log(`  Total rows:        ${totalRows}`);
console.log(`  FTS entries:       ${ftsCount?.count ?? 0}`);
