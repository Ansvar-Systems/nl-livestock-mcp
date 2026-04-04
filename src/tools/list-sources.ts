import { buildMeta } from '../metadata.js';
import type { Database } from '../db.js';

interface Source {
  name: string;
  authority: string;
  official_url: string;
  retrieval_method: string;
  update_frequency: string;
  license: string;
  coverage: string;
  last_retrieved?: string;
}

export function handleListSources(db: Database): { sources: Source[]; _meta: ReturnType<typeof buildMeta> } {
  const lastIngest = db.get<{ value: string }>('SELECT value FROM db_metadata WHERE key = ?', ['last_ingest']);

  const sources: Source[] = [
    {
      name: 'NVWA (Nederlandse Voedsel- en Warenautoriteit)',
      authority: 'Ministerie van Landbouw, Natuur en Voedselkwaliteit',
      official_url: 'https://www.nvwa.nl/onderwerpen/dierenwelzijn',
      retrieval_method: 'HTML_SCRAPE',
      update_frequency: 'as_amended',
      license: 'Public domain (Dutch government publications)',
      coverage: 'Welfare standards, stocking densities, housing requirements for all livestock species',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'Besluit houders van dieren (Bhvd)',
      authority: 'Rijksoverheid',
      official_url: 'https://wetten.overheid.nl/BWBR0035217',
      retrieval_method: 'LEGISLATION_PARSE',
      update_frequency: 'as_amended',
      license: 'Public domain (Dutch legislation)',
      coverage: 'Legal minimum welfare standards, housing requirements, stocking densities, prohibited practices',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'RVO (Rijksdienst voor Ondernemend Nederland)',
      authority: 'Ministerie van Economische Zaken en Klimaat',
      official_url: 'https://www.rvo.nl/onderwerpen/identificatie-en-registratie-dieren',
      retrieval_method: 'HTML_SCRAPE',
      update_frequency: 'as_amended',
      license: 'Public domain (Dutch government publications)',
      coverage: 'I&R movement rules, identification requirements, fosfaatrechten, UBN registration',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'GD (Gezondheidsdienst voor Dieren)',
      authority: 'Royal GD',
      official_url: 'https://www.gddiergezondheid.nl',
      retrieval_method: 'HTML_SCRAPE',
      update_frequency: 'quarterly',
      license: 'Public reference data',
      coverage: 'Animal health monitoring, disease programmes (BVD, Salmonella), antibiotic benchmarks',
      last_retrieved: lastIngest?.value,
    },
  ];

  return {
    sources,
    _meta: buildMeta({ source_url: 'https://www.nvwa.nl/onderwerpen/dierenwelzijn' }),
  };
}
