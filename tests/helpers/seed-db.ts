import { createDatabase, type Database } from '../../src/db.js';

export function createSeededDatabase(dbPath: string): Database {
  const db = createDatabase(dbPath);

  // Species (NL)
  db.run(
    `INSERT INTO species (id, name, common_breeds) VALUES (?, ?, ?)`,
    ['sheep', 'Schapen', JSON.stringify(['Texelaar', 'Swifter', 'Suffolk', 'Zwartbles'])]
  );
  db.run(
    `INSERT INTO species (id, name, common_breeds) VALUES (?, ?, ?)`,
    ['cattle', 'Melkvee', JSON.stringify(['Holstein-Friesian', 'MRIJ', 'Jersey', 'Blaarkop'])]
  );
  db.run(
    `INSERT INTO species (id, name, common_breeds) VALUES (?, ?, ?)`,
    ['pigs', 'Varkens', JSON.stringify(['Topigs Norsvin TN70', 'Duroc', 'Piétrain', 'Landras'])]
  );
  db.run(
    `INSERT INTO species (id, name, common_breeds) VALUES (?, ?, ?)`,
    ['dairy_cattle', 'Melkvee (dairy)', JSON.stringify(['Holstein-Friesian', 'MRIJ', 'Jersey'])]
  );
  db.run(
    `INSERT INTO species (id, name, common_breeds) VALUES (?, ?, ?)`,
    ['laying_hens', 'Leghennen', JSON.stringify(['Lohmann Brown', 'Isa Brown', 'Dekalb White'])]
  );
  db.run(
    `INSERT INTO species (id, name, common_breeds) VALUES (?, ?, ?)`,
    ['goats', 'Geiten', JSON.stringify(['Saanen', 'Toggenburger', 'Boergeit'])]
  );

  // Welfare standards -- sheep (NL)
  db.run(
    `INSERT INTO welfare_standards (species_id, production_system, category, standard, legal_minimum, best_practice, regulation_ref, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['sheep', 'outdoor', 'weidebeheer', 'Weide- en stalhuisvestingsnormen voor schapen',
     'Beschutting tegen extreme weersomstandigheden', 'Schuilmogelijkheid permanent beschikbaar; rotatiebegraasd; stalruimte 1.5 m2 per ooi',
     'Besluit houders van dieren art. 2.4-2.5', 'NVWA / Besluit houders van dieren', 'NL']
  );
  db.run(
    `INSERT INTO welfare_standards (species_id, production_system, category, standard, legal_minimum, best_practice, regulation_ref, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['sheep', 'all', 'identificatie', 'Oormerken verplicht voor alle schapen',
     'Twee oormerken binnen 6 maanden na geboorte; I&R-registratie', 'Oormerken aanbrengen zodra praktisch mogelijk; UBN-registratie up-to-date houden',
     'Regeling identificatie en registratie van dieren 2014', 'RVO / EU', 'NL']
  );

  // Welfare standards -- cattle (NL)
  db.run(
    `INSERT INTO welfare_standards (species_id, production_system, category, standard, legal_minimum, best_practice, regulation_ref, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['cattle', 'all', 'huisvesting', 'Minimale stalruimte per koe in ligboxenstal',
     'Voldoende ruimte om te liggen, staan en zich te bewegen', 'Minimaal 6.0 m2 per koe (ligboxenstal), 8.0 m2 (potstal)',
     'Besluit houders van dieren art. 2.4', 'NVWA / Besluit houders van dieren', 'NL']
  );
  db.run(
    `INSERT INTO welfare_standards (species_id, production_system, category, standard, legal_minimum, best_practice, regulation_ref, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['cattle', 'all', 'drinkwater', 'Permanent toegang tot vers drinkwater',
     'Permanent beschikking over voldoende vers drinkwater', 'Minimaal 2 drinkplaatsen per 20 koeien',
     'Besluit houders van dieren art. 2.3', 'NVWA / Besluit houders van dieren', 'NL']
  );

  // Welfare standards -- pigs (NL)
  db.run(
    `INSERT INTO welfare_standards (species_id, production_system, category, standard, legal_minimum, best_practice, regulation_ref, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['pigs', 'all', 'afleidingsmateriaal', 'Afleidingsmateriaal verplicht voor alle varkens',
     'Permanent beschikking over afleidingsmateriaal dat manipuleerbaar, kauwbaar, eetbaar en onderzoekbaar is',
     'Combinatie van stro, hooi, jute zakken en hout; dagelijks verse aanvulling',
     'Besluit houders van dieren art. 2.22; EU-richtlijn 2008/120/EG', 'NVWA / EU Commissie', 'NL']
  );
  db.run(
    `INSERT INTO welfare_standards (species_id, production_system, category, standard, legal_minimum, best_practice, regulation_ref, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['pigs', 'all', 'castratie', 'Verbod op castratie zonder verdoving',
     'Chirurgische castratie alleen toegestaan onder verdoving en pijnbestrijding',
     'Geen castratie; gebruik van immunocastratie (Improvac) of fokkerij op beren',
     'Besluit houders van dieren art. 2.21', 'NVWA / Besluit houders van dieren', 'NL']
  );

  // Movement rules (NL — no fixed standstill like UK; I&R rules instead)
  db.run(
    `INSERT INTO movement_rules (species_id, rule_type, rule, standstill_days, exceptions, authority, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ['sheep', 'identificatie', 'Schapen: twee oormerken (visueel + elektronisch) binnen 6 maanden na geboorte. I&R-registratie bij RVO. Stallijst bijhouden.',
     0, 'Slachtlammeren jonger dan 12 maanden: een oormerk bij direct transport naar slachthuis',
     'RVO', 'Regeling identificatie en registratie van dieren 2014; EU-verordening 21/2004', 'NL']
  );
  db.run(
    `INSERT INTO movement_rules (species_id, rule_type, rule, standstill_days, exceptions, authority, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ['sheep', 'verplaatsing', 'Verplaatsing melden bij RVO. Vervoersdocument verplicht met UBN herkomst en bestemming, aantal dieren, oormerknummers.',
     0, 'Verplaatsing eigen percelen binnen 10 km',
     'RVO', 'Regeling identificatie en registratie van dieren 2014', 'NL']
  );
  db.run(
    `INSERT INTO movement_rules (species_id, rule_type, rule, standstill_days, exceptions, authority, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ['cattle', 'identificatie', 'Runderen moeten binnen 3 werkdagen na geboorte worden geoormerkt. Runderpaspoort aanvragen bij RVO.',
     0, 'Niet van toepassing',
     'RVO', 'Regeling identificatie en registratie van dieren 2014; EU-verordening 1760/2000', 'NL']
  );
  db.run(
    `INSERT INTO movement_rules (species_id, rule_type, rule, standstill_days, exceptions, authority, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ['cattle', 'verplaatsing', 'Elke verplaatsing van runderen melden bij RVO binnen 3 werkdagen. Vervoersdocument (VKM) verplicht bij transport.',
     0, 'Verplaatsing binnen eigen UBN-locaties',
     'RVO', 'Regeling identificatie en registratie van dieren 2014', 'NL']
  );
  db.run(
    `INSERT INTO movement_rules (species_id, rule_type, rule, standstill_days, exceptions, authority, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ['pigs', 'identificatie', 'Varkens moeten worden geidentificeerd met oormerk of tatoeage met UBN-nummer.',
     0, 'Biggen op bedrijf van geboorte: identificatie bij afvoer',
     'RVO', 'Regeling identificatie en registratie van dieren 2014', 'NL']
  );
  db.run(
    `INSERT INTO movement_rules (species_id, rule_type, rule, standstill_days, exceptions, authority, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ['pigs', 'verplaatsing', 'Verplaatsing melden bij RVO binnen 24 uur (digitaal). VKI verplicht bij aanvoer slachthuis.',
     0, 'Niet van toepassing',
     'RVO', 'Regeling identificatie en registratie van dieren 2014', 'NL']
  );

  // Stocking densities (NL)
  db.run(
    `INSERT INTO stocking_densities (species_id, age_class, housing_type, density_value, density_unit, legal_minimum, recommended, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['sheep', 'adult', 'indoor', 1.5, 'm2_per_head', 1.0, 1.5, 'Besluit houders van dieren / NVWA', 'NL']
  );
  db.run(
    `INSERT INTO stocking_densities (species_id, age_class, housing_type, density_value, density_unit, legal_minimum, recommended, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['cattle', 'adult', 'ligboxenstal', 6.0, 'm2_per_head', 6.0, 8.0, 'Besluit houders van dieren / NVWA', 'NL']
  );
  db.run(
    `INSERT INTO stocking_densities (species_id, age_class, housing_type, density_value, density_unit, legal_minimum, recommended, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['pigs', 'vleesvarkens', 'indoor', 0.65, 'm2_per_head', 0.65, 0.80, 'Varkensbesluit / Besluit houders van dieren', 'NL']
  );

  // Feed requirements (NL)
  db.run(
    `INSERT INTO feed_requirements (species_id, age_class, production_stage, energy_mj_per_day, protein_g_per_day, dry_matter_kg, minerals, example_ration, notes, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['sheep', 'adult', 'onderhoud', 8.5, 80, 1.2, JSON.stringify({ calcium_g: 3, phosphorus_g: 2 }),
     'Gras of hooi ad lib + mineraallik', 'Ooi van 70 kg; in laatste 6 weken dracht stoomvoeren', 'NL']
  );
  db.run(
    `INSERT INTO feed_requirements (species_id, age_class, production_stage, energy_mj_per_day, protein_g_per_day, dry_matter_kg, minerals, example_ration, notes, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['cattle', 'adult', 'lactatie', 115, 1800, 22.0, JSON.stringify({ calcium_g: 80, phosphorus_g: 45 }),
     'Grassilage + snijmais + krachtvoer — 1000 VEM per kg ds', 'Melkkoe 30 kg melk/dag', 'NL']
  );
  db.run(
    `INSERT INTO feed_requirements (species_id, age_class, production_stage, energy_mj_per_day, protein_g_per_day, dry_matter_kg, minerals, example_ration, notes, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['pigs', 'vleesvarkens', 'afmestfase', 26, 340, 2.5, JSON.stringify({ calcium_g: 12, phosphorus_g: 8, lysine_g: 15 }),
     'Vleesvarkensvoer 2.5 kg/dag — EW 1.08', 'Afleveren op 115-120 kg; voederconversie 2.6-2.8', 'NL']
  );

  // Housing requirements (NL)
  db.run(
    `INSERT INTO housing_requirements (species_id, age_class, system, space_per_head_m2, ventilation, flooring, temperature_range, lighting, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['sheep', 'adult', 'indoor', 1.5, 'Natuurlijke ventilatie; vermijd tocht op dierniveau',
     'Stro op dichte vloer; droge ligplaats', '5-20 C', 'Daglicht; kunstlicht bij winterstalling',
     'Besluit houders van dieren / NVWA', 'NL']
  );
  db.run(
    `INSERT INTO housing_requirements (species_id, age_class, system, space_per_head_m2, ventilation, flooring, temperature_range, lighting, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['cattle', 'adult', 'ligboxenstal', 6.0, 'Natuurlijke ventilatie met nokventilatie; minimaal 500 m3/uur per koe',
     'Ligboxen met rubber mat of diep strooisel; roostervloer in loopgang', '-10 tot 25 C',
     'Daglicht + minimaal 150-200 lux kunstlicht 16 uur',
     'Besluit houders van dieren / WUR', 'NL']
  );
  db.run(
    `INSERT INTO housing_requirements (species_id, age_class, system, space_per_head_m2, ventilation, flooring, temperature_range, lighting, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['pigs', 'vleesvarkens', 'indoor', 0.65, 'Mechanische ventilatie; max 0.2 m/s luchtsnelheid op dierniveau',
     'Deels roostervloer, deels dichte vloer (minimaal 40% dicht)', '18-22 C',
     'Minimaal 40 lux gedurende 8 uur per dag',
     'Besluit houders van dieren / Varkensbesluit', 'NL']
  );

  // Breeding guidance (NL)
  db.run(
    `INSERT INTO breeding_guidance (species_id, topic, guidance, calendar, gestation_days, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['sheep', 'lammen', 'Draagtijd ooi gemiddeld 147 dagen. Dekseizoen oktober-november. Scannen op 80-90 dagen dracht. Stoomvoeren laatste 6 weken.',
     JSON.stringify({ dekken: 'Okt-Nov', scannen: 'Jan', lammen: 'Mrt-Apr', spenen: 'Jul-Aug' }),
     147, 'WUR / Schapenfokkerij', 'NL']
  );
  db.run(
    `INSERT INTO breeding_guidance (species_id, topic, guidance, calendar, gestation_days, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['cattle', 'afkalven', 'Dracht duurt gemiddeld 280 dagen. Droogzetten 6-8 weken voor verwachte afkalfdatum. Transitierantsoen 3 weken voor afkalven.',
     JSON.stringify({ inseminatie: 'Jaarrond (KI)', drachtcontrole: '30-90 dagen', droogzetten: '6-8 weken voor afkalven', afkalven: 'Jaarrond' }),
     280, 'CRV / GD / WUR', 'NL']
  );
  db.run(
    `INSERT INTO breeding_guidance (species_id, topic, guidance, calendar, gestation_days, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['pigs', 'werpen', 'Draagtijd zeug gemiddeld 114 dagen (3 maanden, 3 weken, 3 dagen). Verplaatsen naar kraamstal 5-7 dagen voor verwachte werpdatum.',
     JSON.stringify({ dekken: 'Continue productie', drachtcontrole: '28 dagen na dekken', werpen: '114 dagen na dekken', spenen: '21-28 dagen na werpen' }),
     114, 'Topigs Norsvin / WUR', 'NL']
  );

  // Animal health (NL)
  db.run(
    `INSERT INTO animal_health (id, species_id, condition, symptoms, causes, treatment, prevention, notifiable, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['mkz-runderen', 'cattle', 'Mond- en klauwzeer (MKZ)',
     'Koorts, blaren op tong/bek/klauwen/uier, kwijlen, kreupelheid',
     'MKZ-virus (Aphthovirus); zeer besmettelijk',
     'Geen behandeling — meldingsplicht NVWA. Ruiming besmette bedrijven.',
     'Strenge importcontroles, biosecurity, vaccinatie alleen bij overheidsbeleid',
     1, 'NVWA / Wet dieren', 'NL']
  );
  db.run(
    `INSERT INTO animal_health (id, species_id, condition, symptoms, causes, treatment, prevention, notifiable, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['rotkreupel-schapen', 'sheep', 'Rotkreupel (voetrot)',
     'Kreupelheid, stinkende poot, loslating hoornschoen, gezwollen klauwen',
     'Dichelobacter nodosus en Fusobacterium necrophorum; natte omstandigheden',
     'Bekappen, voetbaden (zinksulfaat of formaline), antibiotica bij ernstige gevallen',
     'Regelmatig bekappen, voetbaden, droge standplaatsen, fokken op resistente dieren',
     0, 'GD / KNMvD', 'NL']
  );
  db.run(
    `INSERT INTO animal_health (id, species_id, condition, symptoms, causes, treatment, prevention, notifiable, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['bvd-runderen', 'cattle', 'BVD (Bovine Virale Diarree)',
     'Diarree, koorts, verminderde melkproductie, vruchtbaarheidsproblemen',
     'BVD-virus (pestivirus); besmetting via PI-dieren',
     'Geen behandeling; PI-dieren opsporen en verwijderen',
     'BVD-bestrijdingsprogramma (GD): BVD-vrij certificering, oorbiopten bij geboorte',
     0, 'GD Gezondheidsdienst voor Dieren', 'NL']
  );

  // FTS5 search index entries (NL)
  db.run(
    `INSERT INTO search_index (title, body, species, category, jurisdiction) VALUES (?, ?, ?, ?, ?)`,
    ['Schapen welzijnsnormen', 'Welzijnsnormen voor schapen: weide- en stalhuisvesting, oormerken verplicht, beschutting tegen extreme weersomstandigheden per Besluit houders van dieren.', 'sheep', 'welfare', 'NL']
  );
  db.run(
    `INSERT INTO search_index (title, body, species, category, jurisdiction) VALUES (?, ?, ?, ?, ?)`,
    ['Runderen I&R verplaatsing', 'Na verplaatsing runderen melden bij RVO binnen 3 werkdagen. Vervoersdocument verplicht. UBN-registratie.', 'cattle', 'movement', 'NL']
  );
  db.run(
    `INSERT INTO search_index (title, body, species, category, jurisdiction) VALUES (?, ?, ?, ?, ?)`,
    ['Varkens huisvesting', 'Varkenshouderij vereist minimale vloeroppervlakte: vleesvarkens 0.65 m2, zeugen 2.25 m2 groepshuisvesting. Afleidingsmateriaal verplicht.', 'pigs', 'housing', 'NL']
  );
  db.run(
    `INSERT INTO search_index (title, body, species, category, jurisdiction) VALUES (?, ?, ?, ?, ?)`,
    ['Schapen fokkerij kalender', 'Dekseizoen schapen oktober tot november met lammen in maart tot april. Draagtijd 147 dagen.', 'sheep', 'breeding', 'NL']
  );
  db.run(
    `INSERT INTO search_index (title, body, species, category, jurisdiction) VALUES (?, ?, ?, ?, ?)`,
    ['Mond- en klauwzeer MKZ', 'Mond- en klauwzeer is een meldingsplichtige dierziekte. Blaren op bek en klauwen. Melden bij NVWA.', 'cattle', 'health', 'NL']
  );
  db.run(
    `INSERT INTO search_index (title, body, species, category, jurisdiction) VALUES (?, ?, ?, ?, ?)`,
    ['BVD bestrijdingsprogramma', 'BVD (Bovine Virale Diarree) bestrijdingsprogramma bij GD. PI-dieren opsporen en verwijderen. Certificering.', 'cattle', 'health', 'NL']
  );

  return db;
}
