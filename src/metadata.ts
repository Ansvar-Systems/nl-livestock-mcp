export interface Meta {
  disclaimer: string;
  data_age: string;
  source_url: string;
  copyright: string;
  server: string;
  version: string;
}

const DISCLAIMER =
  'This data is provided for informational purposes only. It does not constitute professional ' +
  'veterinary or livestock management advice. Always consult a qualified veterinarian or livestock ' +
  'advisor before making animal welfare, health, or management decisions. Data sourced from NVWA, ' +
  'Besluit houders van dieren, RVO, and GD Gezondheidsdienst voor Dieren.';

export function buildMeta(overrides?: Partial<Meta>): Meta {
  return {
    disclaimer: DISCLAIMER,
    data_age: overrides?.data_age ?? 'unknown',
    source_url: overrides?.source_url ?? 'https://www.nvwa.nl/onderwerpen/dierenwelzijn',
    copyright: 'Data: Dutch government public domain, GD, SDa. Server: Apache-2.0 Ansvar Systems.',
    server: 'nl-livestock-mcp',
    version: '0.1.0',
    ...overrides,
  };
}
