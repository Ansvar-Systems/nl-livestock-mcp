import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { handleGetMovementRules } from '../../src/tools/get-movement-rules.js';
import { createSeededDatabase } from '../helpers/seed-db.js';
import type { Database } from '../../src/db.js';
import { existsSync, unlinkSync } from 'fs';

const TEST_DB = 'tests/test-movement-rules.db';

describe('get_movement_rules tool', () => {
  let db: Database;

  beforeAll(() => {
    db = createSeededDatabase(TEST_DB);
  });

  afterAll(() => {
    db.close();
    if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
  });

  test('sheep has I&R identification rules', () => {
    const result = handleGetMovementRules(db, { species: 'sheep' });
    expect(result).toHaveProperty('rules');
    const rules = (result as { rules: { rule_type: string; rule: string }[] }).rules;
    const idRule = rules.find(r => r.rule_type === 'identificatie');
    expect(idRule).toBeDefined();
    expect(idRule!.rule).toContain('oormerken');
  });

  test('cattle has identification and movement rules', () => {
    const result = handleGetMovementRules(db, { species: 'cattle' });
    expect(result).toHaveProperty('rules');
    const rules = (result as { rules: { rule_type: string }[] }).rules;
    expect(rules.length).toBeGreaterThanOrEqual(2);
    const types = rules.map(r => r.rule_type);
    expect(types).toContain('identificatie');
    expect(types).toContain('verplaatsing');
  });

  test('pig movement requires 24-hour reporting', () => {
    const result = handleGetMovementRules(db, { species: 'pigs' });
    expect(result).toHaveProperty('rules');
    const rules = (result as { rules: { rule_type: string; rule: string }[] }).rules;
    const verplaatsing = rules.find(r => r.rule_type === 'verplaatsing');
    expect(verplaatsing).toBeDefined();
    expect(verplaatsing!.rule).toContain('24 uur');
  });

  test('filters by species', () => {
    const result = handleGetMovementRules(db, { species: 'sheep' });
    expect(result).toHaveProperty('species', 'Schapen');
  });

  test('includes authority and regulation_ref', () => {
    const result = handleGetMovementRules(db, { species: 'sheep' });
    const rules = (result as { rules: { authority: string; regulation_ref: string }[] }).rules;
    expect(rules[0].authority).toBe('RVO');
    expect(rules[0].regulation_ref).toContain('Regeling');
  });

  test('includes exceptions', () => {
    const result = handleGetMovementRules(db, { species: 'sheep' });
    const rules = (result as { rules: { exceptions: string }[] }).rules;
    expect(rules[0].exceptions).toContain('lammeren');
  });

  test('rejects unsupported jurisdiction', () => {
    const result = handleGetMovementRules(db, { species: 'sheep', jurisdiction: 'FR' });
    expect(result).toHaveProperty('error', 'jurisdiction_not_supported');
  });

  test('returns not_found for unknown species', () => {
    const result = handleGetMovementRules(db, { species: 'alpaca' });
    expect(result).toHaveProperty('error', 'not_found');
  });

  test('looks up by species name case-insensitively', () => {
    const result = handleGetMovementRules(db, { species: 'Schapen' });
    expect(result).toHaveProperty('rules');
  });
});
