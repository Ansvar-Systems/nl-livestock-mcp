import { buildMeta } from '../metadata.js';
import { SUPPORTED_JURISDICTIONS } from '../jurisdiction.js';

export function handleAbout() {
  return {
    name: 'Netherlands Livestock MCP',
    description:
      'Dutch livestock welfare standards, feed requirements, animal health, housing, stocking densities, ' +
      'movement rules (I&R), and breeding guidance. Covers 8 species (melkvee, vleesvee, varkens, leghennen, ' +
      'vleeskuikens, geiten, schapen, konijnen) with data from NVWA, Besluit houders van dieren, and RVO.',
    version: '0.1.0',
    jurisdiction: [...SUPPORTED_JURISDICTIONS],
    data_sources: [
      'NVWA (Nederlandse Voedsel- en Warenautoriteit)',
      'Besluit houders van dieren (Bhvd)',
      'RVO (Rijksdienst voor Ondernemend Nederland)',
      'GD (Gezondheidsdienst voor Dieren)',
    ],
    tools_count: 11,
    links: {
      homepage: 'https://ansvar.eu/open-agriculture',
      repository: 'https://github.com/ansvar-systems/nl-livestock-mcp',
      mcp_network: 'https://ansvar.ai/mcp',
    },
    _meta: buildMeta(),
  };
}
