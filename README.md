# Netherlands Livestock MCP

[![CI](https://github.com/ansvar-systems/nl-livestock-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/ansvar-systems/nl-livestock-mcp/actions/workflows/ci.yml)
[![GHCR](https://github.com/ansvar-systems/nl-livestock-mcp/actions/workflows/ghcr-build.yml/badge.svg)](https://github.com/ansvar-systems/nl-livestock-mcp/actions/workflows/ghcr-build.yml)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Dutch livestock welfare standards, feed requirements, animal health, housing, movement rules (I&R), and breeding guidance via the [Model Context Protocol](https://modelcontextprotocol.io). Query NVWA welfare codes, Besluit houders van dieren requirements, RVO identification rules, stocking densities, and breeding calendars -- all from your AI assistant.

Part of [Ansvar Open Agriculture](https://ansvar.eu/open-agriculture).

## Why This Exists

Dutch farmers, livestock advisors, and compliance officers need quick access to welfare standards (Besluit houders van dieren), I&R movement and identification rules (RVO), disease monitoring programmes (GD), and antibiotic benchmark values (SDa). This information is spread across Dutch legislation, NVWA guidance, and sector organizations. This MCP server makes it all searchable.

## Quick Start

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "nl-livestock": {
      "command": "npx",
      "args": ["-y", "@ansvar/nl-livestock-mcp"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add nl-livestock npx @ansvar/nl-livestock-mcp
```

### Streamable HTTP (remote)

```
https://mcp.ansvar.eu/nl-livestock/mcp
```

### Docker (self-hosted)

```bash
docker run -p 3000:3000 ghcr.io/ansvar-systems/nl-livestock-mcp:latest
```

### npm (stdio)

```bash
npx @ansvar/nl-livestock-mcp
```

## Example Queries

Ask your AI assistant:

- "Wat zijn de welzijnsnormen voor varkens in Nederland?"
- "Wat is de minimale stalruimte voor leghennen?"
- "Hoe werkt de I&R-registratie voor runderen?"
- "Wat zijn de bezettingsnormen voor vleeskuikens?"
- "Is mond- en klauwzeer meldingsplichtig?"
- "Wat is de draagtijd van schapen?"
- "Hoe werkt het fosfaatrechtenstelsel?"
- "What are the Dutch welfare standards for dairy cattle?"

## Stats

| Metric | Value |
|--------|-------|
| Tools | 11 (3 meta + 8 domain) |
| Species | 8 (melkvee, vleesvee, varkens, leghennen, vleeskuikens, geiten, schapen, konijnen) |
| Jurisdiction | NL |
| Data sources | NVWA, Besluit houders van dieren, RVO, GD, SDa, Beter Leven keurmerk |
| License (data) | Dutch government public domain |
| License (code) | Apache-2.0 |
| Transport | stdio + Streamable HTTP |

## Tools

| Tool | Description |
|------|-------------|
| `about` | Server metadata and links |
| `list_sources` | Data sources with freshness info |
| `check_data_freshness` | Staleness status and refresh command |
| `search_livestock_guidance` | FTS5 search across all livestock guidance |
| `get_welfare_standards` | Welfare standards with legal minimum and best practice |
| `get_stocking_density` | Space requirements by species and housing |
| `get_feed_requirements` | Nutrition requirements by species and stage |
| `search_animal_health` | Disease and condition search with notifiable flagging |
| `get_housing_requirements` | Space, ventilation, flooring, temperature, lighting |
| `get_movement_rules` | I&R identification and movement reporting rules |
| `get_breeding_guidance` | Gestation periods, breeding calendars |

See [TOOLS.md](TOOLS.md) for full parameter documentation.

## Security Scanning

This repository runs 6 security checks on every push:

- **CodeQL** -- static analysis for JavaScript/TypeScript
- **Gitleaks** -- secret detection across full history
- **Dependency review** -- via Dependabot
- **Container scanning** -- via GHCR build pipeline

See [SECURITY.md](SECURITY.md) for reporting policy.

## Disclaimer

This tool provides reference data for informational purposes only. Welfare codes and movement rules are summaries -- always check NVWA guidance, Besluit houders van dieren, and RVO for the full requirements. See [DISCLAIMER.md](DISCLAIMER.md).

## Contributing

Issues and pull requests welcome. For security vulnerabilities, email security@ansvar.eu (do not open a public issue).

## License

Apache-2.0. Data sourced from Dutch government public domain publications.
