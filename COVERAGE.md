# Coverage

## What Is Included

- **Welfare standards** from Besluit houders van dieren and NVWA: legal minimums and best practice recommendations for 8 species
- **Stocking densities**: Space requirements by species, age class, and housing type (bezettingsnormen)
- **Feed requirements**: Energy (VEM/EW), protein, dry matter, minerals by species and production stage
- **Animal health**: Common conditions, notifiable diseases (MKZ, vogelgriep, AVP, Q-koorts), BVD programme, Salmonella monitoring, antibiotic benchmarks (SDa)
- **Movement rules**: I&R identification and registration (RVO), oormerken, UBN-registratie, vervoersdocumenten
- **Housing requirements**: Space, ventilation, flooring, temperature, lighting by species
- **Breeding guidance**: Gestation periods, breeding calendars, management advice
- **Fosfaatrechten**: Phosphate quota system for dairy farms

## Species

| Species | Dutch Name | Welfare | Stocking | Feed | Health | Movement (I&R) | Housing | Breeding |
|---------|-----------|---------|----------|------|--------|-----------------|---------|----------|
| Dairy cattle | Melkvee | Yes | Yes | Yes | Yes (BVD, mastitis, MKZ, fosfaatrechten) | Yes (oormerken 3 dagen, runderpaspoort) | Yes | Yes (280d) |
| Beef cattle | Vleesvee | Yes | Yes | Yes | Yes | Yes (oormerken, I&R) | Yes | Yes (283d) |
| Pigs | Varkens | Yes | Yes | Yes | Yes (Salmonella, AVP, Beter Leven) | Yes (oormerk/tatoeage, 24u meldplicht) | Yes | Yes (114d) |
| Laying hens | Leghennen | Yes | Yes | Yes | Yes (Salmonella, vogelgriep) | Yes (koppelregistratie, UBN) | Yes | Yes (legperiode) |
| Broilers | Vleeskuikens | Yes | Yes | Yes | Yes (vogelgriep) | Yes (koppelregistratie) | Yes | Yes (groeiperiode) |
| Goats | Geiten | Yes | Yes | Yes | Yes (Q-koorts) | Yes (oormerken, geitenstop) | Yes | Yes (150d) |
| Sheep | Schapen | Yes | Yes | Yes | Yes (rotkreupel) | Yes (oormerken, vervoersdocument) | Yes | Yes (147d) |
| Rabbits | Konijnen | Yes | Yes | Yes | Yes (myxomatose) | Yes (UBN) | Yes | Yes (31d) |

## Key Dutch Regulations

| Regulation | Scope |
|-----------|-------|
| Besluit houders van dieren (Bhvd) | Welfare standards, housing, stocking densities, prohibited practices |
| Regeling identificatie en registratie van dieren 2014 | I&R rules, oormerken, UBN, movement reporting |
| Wet dieren | Overarching animal law, disease control powers |
| Varkensbesluit | Pig-specific housing and welfare (incorporated into Bhvd) |
| EU-richtlijn 1999/74/EG | Laying hen housing (minimum cage standards) |
| EU-richtlijn 2007/43/EG | Broiler stocking density limits |
| EU-richtlijn 2008/120/EG | Pig welfare (enrichment, group housing) |
| Meststoffenwet | Fosfaatrechten, mestbeleid |

## Jurisdictions

| Code | Country | Status |
|------|---------|--------|
| NL | Netherlands | Supported |

## What Is NOT Included

- **Paarden (horses)** -- separate welfare code, not yet ingested
- **Pelsdieren (fur animals)** -- banned in NL per 2024, not relevant
- **Biologische houderij (organic)** -- SKAL organic standards are not included
- **Real-time disease alerts** -- This is reference data, not a live alert system
- **Individual farm fosfaatrechten** -- Only the general system is described, not per-farm allocations
- **Provinciale verordeningen** -- Provincial rules (e.g. geitenstop) are mentioned but not exhaustively listed
- **Caribisch Nederland** -- Bonaire, Sint Eustatius, Saba have separate regulations

## Known Gaps

1. Movement rules in NL differ from UK -- the Netherlands does not have fixed standstill periods; instead, I&R reporting and disease-outbreak-based transport bans apply
2. Stocking densities for specialist or rare breeds may differ from standard guidance
3. Feed requirements are reference values -- actual needs vary by breed, condition, and climate
4. Antibiotic SDa benchmark values are updated annually -- check SDa website for current thresholds
5. Beter Leven criteria are summarized -- full criteria documents per species are maintained by Dierenbescherming

## Data Freshness

Run `check_data_freshness` to see when data was last updated. The ingestion pipeline runs on a schedule; manual triggers available via `gh workflow run ingest.yml`.
