import { buildMeta } from '../metadata.js';
import { validateJurisdiction } from '../jurisdiction.js';
import { speciesWhereClause } from '../species-aliases.js';
import type { Database } from '../db.js';

interface BreedingArgs {
  species: string;
  topic?: string;
  jurisdiction?: string;
}

export function handleGetBreedingGuidance(db: Database, args: BreedingArgs) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  const sw = speciesWhereClause(db, args.species, 'bg');

  let sql = `SELECT bg.*, s.name as species_name FROM breeding_guidance bg
    JOIN species s ON bg.species_id = s.id
    WHERE ${sw.clause} AND bg.jurisdiction = ?`;
  const params: unknown[] = [...sw.params, jv.jurisdiction];

  if (args.topic) {
    sql += ' AND LOWER(bg.topic) LIKE LOWER(?)';
    params.push(`%${args.topic}%`);
  }

  sql += ' ORDER BY bg.topic, bg.id';

  const guidance = db.all<{
    id: number; species_id: string; species_name: string;
    topic: string; guidance: string; calendar: string;
    gestation_days: number; source: string; jurisdiction: string;
  }>(sql, params);

  if (guidance.length === 0) {
    return {
      error: 'not_found',
      message: `No breeding guidance found for '${args.species}'` +
        (args.topic ? ` on topic '${args.topic}'` : '') + '.',
    };
  }

  return {
    species: guidance[0].species_name,
    species_id: guidance[0].species_id,
    jurisdiction: jv.jurisdiction,
    results_count: guidance.length,
    guidance: guidance.map(g => ({
      topic: g.topic,
      guidance: g.guidance,
      calendar: g.calendar ? JSON.parse(g.calendar) : null,
      gestation_days: g.gestation_days,
      source: g.source,
    })),
    _meta: buildMeta(),
  };
}
