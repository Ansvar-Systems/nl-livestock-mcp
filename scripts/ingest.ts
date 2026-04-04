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
    standard: 'Weidegang voor melkvee — zuivelcoöperaties stellen weidegang als voorwaarde',
    legal_minimum: 'Geen wettelijke verplichting weidegang, maar zuivelcoöperaties vereisen het (FrieslandCampina: minimaal 120 dagen per jaar, 6 uur per dag)',
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
  // --- Leghennen (laying hens) ---
  {
    species_id: 'laying_hens', production_system: 'verrijkte_kooi', category: 'huisvesting',
    standard: 'Minimum leefruimte per leghen — verrijkte kooi',
    legal_minimum: 'Minimaal 750 cm2 per hen in verrijkte kooien, waarvan 600 cm2 bruikbaar oppervlak; zitstok 15 cm per hen',
    best_practice: 'Overschakelen naar scharrel- of volièresysteem; kooihuisvesting wordt steeds minder geaccepteerd',
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
    best_practice: 'Weidegang in voorjaar en zomer; browsen op struikgewas en onkruid; rotatiebegraasd',
    regulation_ref: 'Besluit houders van dieren; GD Gezondheidsdienst voor Dieren',
    source: 'GD / NVWA',
  },
  // --- Schapen (sheep) ---
  {
    species_id: 'sheep', production_system: 'all', category: 'staartcouperen',
    standard: 'Staart couperen beperkt toegestaan',
    legal_minimum: 'Staart couperen alleen met rubber ring; geen korter dan derde staartwervels; alleen bij schapen jonger dan 7 dagen',
    best_practice: 'Niet couperen tenzij medisch noodzakelijk; alternatief fokken op kortere staarten',
    regulation_ref: 'Besluit houders van dieren art. 2.7',
    source: 'NVWA / Besluit houders van dieren',
  },
  {
    species_id: 'sheep', production_system: 'outdoor', category: 'weidebeheer',
    standard: 'Weide- en stalhuisvestingsnormen voor schapen',
    legal_minimum: 'Beschutting tegen extreme weersomstandigheden; voldoende voer en water beschikbaar',
    best_practice: 'Schuilmogelijkheid permanent beschikbaar; rotatiebegraasd; stalruimte 1.5 m2 per ooi',
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
  { species_id: 'beef_cattle', age_class: '200-350 kg', housing_type: 'groepshuisvesting', density_value: 3.5, density_unit: 'm2_per_head', legal_minimum: 3.0, recommended: 3.5, source: 'Besluit houders van dieren / NVWA' },
  { species_id: 'beef_cattle', age_class: '>350 kg', housing_type: 'groepshuisvesting', density_value: 5.0, density_unit: 'm2_per_head', legal_minimum: 4.5, recommended: 5.0, source: 'Besluit houders van dieren / NVWA' },
  { species_id: 'pigs', age_class: 'gespeende biggen', housing_type: 'indoor', density_value: 0.30, density_unit: 'm2_per_head', legal_minimum: 0.30, recommended: 0.40, source: 'Varkensbesluit / Besluit houders van dieren' },
  { species_id: 'pigs', age_class: 'vleesvarkens 65-110 kg', housing_type: 'indoor', density_value: 0.65, density_unit: 'm2_per_head', legal_minimum: 0.65, recommended: 0.80, source: 'Varkensbesluit / Besluit houders van dieren' },
  { species_id: 'pigs', age_class: 'vleesvarkens >110 kg', housing_type: 'indoor', density_value: 1.0, density_unit: 'm2_per_head', legal_minimum: 1.0, recommended: 1.2, source: 'Varkensbesluit / Besluit houders van dieren' },
  { species_id: 'pigs', age_class: 'zeugen', housing_type: 'groepshuisvesting', density_value: 2.25, density_unit: 'm2_per_head', legal_minimum: 2.25, recommended: 2.50, source: 'Varkensbesluit / Besluit houders van dieren' },
  { species_id: 'laying_hens', age_class: 'adult', housing_type: 'scharrelsysteem', density_value: 1111, density_unit: 'cm2_per_head', legal_minimum: 1111, recommended: 1429, source: 'Besluit houders van dieren / EU-richtlijn 1999/74/EG' },
  { species_id: 'laying_hens', age_class: 'adult', housing_type: 'verrijkte_kooi', density_value: 750, density_unit: 'cm2_per_head', legal_minimum: 750, recommended: 0, source: 'Besluit houders van dieren / EU-richtlijn 1999/74/EG' },
  { species_id: 'laying_hens', age_class: 'adult', housing_type: 'vrije_uitloop', density_value: 4.0, density_unit: 'm2_outdoor_per_head', legal_minimum: 4.0, recommended: 8.0, source: 'Besluit houders van dieren / EU-verordening 589/2008' },
  { species_id: 'broilers', age_class: 'regulier', housing_type: 'indoor', density_value: 42, density_unit: 'kg_per_m2', legal_minimum: 42, recommended: 33, source: 'Besluit houders van dieren / EU-richtlijn 2007/43/EG' },
  { species_id: 'broilers', age_class: 'trager groeiend', housing_type: 'indoor', density_value: 39, density_unit: 'kg_per_m2', legal_minimum: 39, recommended: 30, source: 'Besluit houders van dieren / Kip van Morgen' },
  { species_id: 'goats', age_class: 'adult', housing_type: 'indoor', density_value: 1.5, density_unit: 'm2_per_head', legal_minimum: 1.0, recommended: 1.5, source: 'Besluit houders van dieren / GD' },
  { species_id: 'sheep', age_class: 'adult', housing_type: 'indoor', density_value: 1.5, density_unit: 'm2_per_head', legal_minimum: 1.0, recommended: 1.5, source: 'Besluit houders van dieren / NVWA' },
  { species_id: 'sheep', age_class: 'lammeren', housing_type: 'indoor', density_value: 0.5, density_unit: 'm2_per_head', legal_minimum: 0.5, recommended: 0.7, source: 'Besluit houders van dieren / NVWA' },
  { species_id: 'rabbits', age_class: 'adult', housing_type: 'parkhuisvesting', density_value: 800, density_unit: 'cm2_per_head', legal_minimum: 800, recommended: 1500, source: 'Besluit houders van dieren' },
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
    causes: 'Bacteriele infectie (S. aureus, E. coli, Strep. uberis); slechte hygiëne, beschadigd speenweefsel',
    treatment: 'Intramammaire antibiotica na bacteriologisch onderzoek; droogzettherapie; ernstige gevallen systemische antibiotica',
    prevention: 'Goede melkhygiëne, speendipping, droogzettherapie, cellgetal monitoring (SDa-benchmarks)',
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
    prevention: 'Salmonellamonitoring verplicht (via bloedmonsters); hygiëneprotocol; all-in/all-out huisvesting; voerveiligheid',
    notifiable: 0, source: 'GD / NVWA / SDa',
  },
  {
    id: 'avp-varkens', species_id: 'pigs', condition: 'Afrikaanse varkenspest (AVP)',
    symptoms: 'Hoge koorts, bloedingen huid/organen, plotselinge sterfte, blauwverkleuring oren',
    causes: 'AVP-virus (Asfarvirus); besmetting via direct contact, besmet vlees, teken, fomites',
    treatment: 'Geen behandeling — meldingsplicht NVWA. Ruiming en vervoersverbod.',
    prevention: 'Geen vaccin beschikbaar; strenge biosecurity, geen voedselresten voeren, wildbarrières tegen wilde zwijnen',
    notifiable: 1, source: 'NVWA / EU',
  },
  {
    id: 'salmonella-pluimvee', species_id: 'laying_hens', condition: 'Salmonellose (pluimvee)',
    symptoms: 'Diarree, verminderde eiproductie, verhoogde uitval bij jonge kuikens; bij mensen gastro-enteritis',
    causes: 'Salmonella enteritidis, S. typhimurium; feco-orale besmetting, knaagdieren, voer',
    treatment: 'Antibiotica op basis van gevoeligheidstest; verbeterde hygiëne; besmette koppels vaak geruimd',
    prevention: 'Salmonellamonitoring verplicht (NCP Salmonella); vaccinatie leghennen; all-in/all-out; ongediertebestrijding',
    notifiable: 0, source: 'NVWA / GD',
  },
  {
    id: 'vogelgriep-pluimvee', species_id: 'laying_hens', condition: 'Hoogpathogene aviaire influenza (vogelgriep, HPAI)',
    symptoms: 'Plotselinge hoge sterfte, sterk verminderde eiproductie, opgezette kop, blauwverkleuring kam/lellen, neurologische verschijnselen',
    causes: 'Aviaire influenza virus (H5N1, H5N8 etc.); besmetting via wilde vogels, direct contact, fomites',
    treatment: 'Geen behandeling — meldingsplicht NVWA. Ruiming besmette en contactbedrijven. Ophokplicht.',
    prevention: 'Ophokplicht bij hoog risico, biosecurity, beperkt contact met wilde vogels, hygiëneprotocol',
    notifiable: 1, source: 'NVWA / Wet dieren',
  },
  {
    id: 'vogelgriep-vleeskuikens', species_id: 'broilers', condition: 'Hoogpathogene aviaire influenza (vogelgriep, HPAI)',
    symptoms: 'Plotselinge hoge sterfte, ademhalingsproblemen, gezwollen kop, verminderde wateropname',
    causes: 'Aviaire influenza virus; besmetting via wilde vogels, contact, fomites',
    treatment: 'Geen behandeling — meldingsplicht NVWA. Ruiming.',
    prevention: 'Ophokplicht, biosecurity, hygiëneprotocol, beperking bezoek',
    notifiable: 1, source: 'NVWA / Wet dieren',
  },
  {
    id: 'q-koorts-geiten', species_id: 'goats', condition: 'Q-koorts (Coxiella burnetii)',
    symptoms: 'Verwerpen in het laatste drachttrimester (stormachtig verwerpen), doodgeboren lammeren, verminderde melkproductie',
    causes: 'Coxiella burnetii bacterie; besmetting via inademing van besmet stof, placenta, vruchtwater',
    treatment: 'Antibiotica (tetracycline); bij mensen: doxycycline',
    prevention: 'Vaccinatie verplicht voor melkgeiten/-schapen (>50 dieren); hygiëne rond aflammeren; melding verwerpingen bij GD',
    notifiable: 1, source: 'GD / NVWA / RIVM',
  },
  {
    id: 'rotkreupel-schapen', species_id: 'sheep', condition: 'Rotkreupel (voetrot)',
    symptoms: 'Kreupelheid, stinkende poot, loslating hoornschoen, gezwollen klauwen, op de knieën lopen',
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
    causes: 'Antimicrobiële resistentie door overmatig gebruik',
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
    flooring: 'Kunststof roostervloer met platform/verhoging; geen draadgazem bodem',
    temperature_range: '15-25 C', lighting: 'Minimaal 20 lux; 8-16 uur lichtperiode',
    source: 'Besluit houders van dieren',
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
    guidance: 'Draagtijd konijn gemiddeld 31 dagen. 4-8 worpen per jaar bij commerciële houderij. Gemiddeld 8-10 jongen per worp. Spenen op 4-5 weken.',
    calendar: JSON.stringify({ dekken: 'Continue productie', drachtcontrole: '12-14 dagen na dekken', werpen: '31 dagen na dekken', spenen: '28-35 dagen na werpen' }),
    gestation_days: 31,
    source: 'WUR / Kleindiervee',
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

// Welfare standards → FTS
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

// Movement rules → FTS
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

// Animal health → FTS
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

// Housing → FTS
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

// Feed → FTS
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

// Breeding → FTS
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

// Stocking density → FTS
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
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('last_ingest', ?)", [now]);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('build_date', ?)", [now]);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('jurisdiction', 'NL')", []);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('mcp_name', 'Netherlands Livestock MCP')", []);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('species_count', ?)", [String(species.length)]);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('welfare_count', ?)", [String(welfareStandards.length)]);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('movement_count', ?)", [String(movementRules.length)]);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('health_count', ?)", [String(animalHealth.length)]);

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
  fts_entries: ftsCount?.count ?? 0,
  sources: [
    'NVWA (Nederlandse Voedsel- en Warenautoriteit)',
    'Besluit houders van dieren (Bhvd)',
    'RVO (Rijksdienst voor Ondernemend Nederland)',
    'GD (Gezondheidsdienst voor Dieren)',
    'SDa (Autoriteit Diergeneesmiddelen)',
    'Dierenbescherming / Beter Leven keurmerk',
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
console.log(`  FTS entries:       ${ftsCount?.count ?? 0}`);
