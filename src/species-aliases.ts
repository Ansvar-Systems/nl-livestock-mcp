import type { Database } from './db.js';

/**
 * Species alias resolution.
 *
 * LLMs frequently use generic names like "cattle" when the database
 * stores "dairy_cattle" / "beef_cattle".  This module maps common
 * aliases to the actual species_id values so tool calls don't return
 * not_found for valid queries.
 */

const ALIASES: Record<string, string[]> = {
  cattle: ['dairy_cattle', 'beef_cattle', 'veal_calves'],
  cow: ['dairy_cattle'],
  cows: ['dairy_cattle'],
  beef: ['beef_cattle'],
  dairy: ['dairy_cattle'],
  rundvee: ['dairy_cattle', 'beef_cattle'],
  koe: ['dairy_cattle'],
  vee: ['dairy_cattle', 'beef_cattle', 'veal_calves'],
  varken: ['pigs'],
  varkens: ['pigs'],
  pig: ['pigs'],
  hen: ['laying_hens'],
  hens: ['laying_hens'],
  chicken: ['laying_hens', 'broilers'],
  chickens: ['laying_hens', 'broilers'],
  kip: ['laying_hens', 'broilers'],
  kippen: ['laying_hens', 'broilers'],
  poultry: ['laying_hens', 'broilers', 'ducks', 'turkeys'],
  pluimvee: ['laying_hens', 'broilers', 'ducks', 'turkeys'],
  geit: ['goats'],
  geiten: ['goats'],
  goat: ['goats'],
  schaap: ['sheep'],
  schapen: ['sheep'],
  konijn: ['rabbits'],
  konijnen: ['rabbits'],
  rabbit: ['rabbits'],
  kalf: ['veal_calves'],
  kalveren: ['veal_calves'],
  calf: ['veal_calves'],
  calves: ['veal_calves'],
  eend: ['ducks'],
  eenden: ['ducks'],
  duck: ['ducks'],
  kalkoen: ['turkeys'],
  kalkoenen: ['turkeys'],
  turkey: ['turkeys'],
};

/**
 * Resolve a species input to one or more species_id values.
 *
 * Resolution order:
 * 1. Exact match on species.id → return as-is
 * 2. Case-insensitive match on species.name → return the id
 * 3. Alias table → return mapped ids
 * 4. No match → return original value (let SQL handle it)
 */
export function resolveSpecies(db: Database, input: string): string[] {
  const lower = input.toLowerCase();

  // 1. Exact species_id match
  const exact = db.get<{ id: string }>(
    'SELECT id FROM species WHERE id = ?', [input],
  );
  if (exact) return [exact.id];

  // 2. Case-insensitive name match
  const byName = db.get<{ id: string }>(
    'SELECT id FROM species WHERE LOWER(name) = ?', [lower],
  );
  if (byName) return [byName.id];

  // 3. Alias table
  const aliased = ALIASES[lower];
  if (aliased) {
    // Filter to species that actually exist in this DB
    const existing = aliased.filter(id => {
      const row = db.get<{ id: string }>('SELECT id FROM species WHERE id = ?', [id]);
      return !!row;
    });
    if (existing.length > 0) return existing;
  }

  // 4. Fallback — return original, SQL will find nothing and the
  //    handler returns its normal not_found message.
  return [input];
}

/**
 * Build a SQL WHERE clause fragment for species matching.
 * Handles single and multi-species resolution.
 *
 * Returns { clause: string, params: unknown[] } where clause looks like:
 *   "(t.species_id IN (?, ?))"
 */
export function speciesWhereClause(
  db: Database,
  input: string,
  tableAlias: string,
): { clause: string; params: unknown[] } {
  const ids = resolveSpecies(db, input);
  const placeholders = ids.map(() => '?').join(', ');
  return {
    clause: `(${tableAlias}.species_id IN (${placeholders}))`,
    params: ids,
  };
}
