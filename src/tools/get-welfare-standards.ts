import { buildMeta } from '../metadata.js';
import { validateJurisdiction } from '../jurisdiction.js';
import { speciesWhereClause } from '../species-aliases.js';
import type { Database } from '../db.js';

interface WelfareArgs {
  species: string;
  production_system?: string;
  jurisdiction?: string;
}

export function handleGetWelfareStandards(db: Database, args: WelfareArgs) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  const sw = speciesWhereClause(db, args.species, 'ws');

  let sql = `SELECT ws.*, s.name as species_name FROM welfare_standards ws
    JOIN species s ON ws.species_id = s.id
    WHERE ${sw.clause} AND ws.jurisdiction = ?`;
  const params: unknown[] = [...sw.params, jv.jurisdiction];

  if (args.production_system) {
    sql += ' AND LOWER(ws.production_system) = LOWER(?)';
    params.push(args.production_system);
  }

  sql += ' ORDER BY ws.category, ws.id';

  const standards = db.all<{
    id: number; species_id: string; species_name: string;
    production_system: string; category: string; standard: string;
    legal_minimum: string; best_practice: string;
    regulation_ref: string; source: string; jurisdiction: string;
  }>(sql, params);

  if (standards.length === 0) {
    return {
      error: 'not_found',
      message: `No welfare standards found for '${args.species}'` +
        (args.production_system ? ` in ${args.production_system} system` : '') + '.',
    };
  }

  return {
    species: standards[0].species_name,
    species_id: standards[0].species_id,
    jurisdiction: jv.jurisdiction,
    results_count: standards.length,
    standards: standards.map(s => ({
      category: s.category,
      production_system: s.production_system,
      standard: s.standard,
      legal_minimum: s.legal_minimum,
      best_practice: s.best_practice,
      regulation_ref: s.regulation_ref,
      source: s.source,
    })),
    _meta: buildMeta({ source_url: 'https://wetten.overheid.nl/BWBR0035217' }),
  };
}
