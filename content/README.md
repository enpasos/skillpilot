# Optional content packages — provisional PoC format

Content packages reference stable curriculum goal IDs; goals never select packages.
The binding [architecture](../docs/concept/skill-graph/content-integration.md) and
[pilot report](../docs/dev/content-integration-physik-libre-pilot.md) distinguish the
long-term boundary from these deliberately small implementation choices.

## Authoring

`catalog.json` lists one active catalog version per package ID, relative to this
directory. Each versioned `package.json` contains:

- `schemaVersion`, stable `packageId`, package `version`, DE/EN catalog title and
  description, provider attribution and independently created mapping status;
- explicit package `status` (`active` or `inactive`), `access: public-link` and
  `aiUsage: link-only`;
- materials with stable local `id`, original-language title, HTTPS `url`, type,
  actual material `language`, independent `status`, precise `goalIds`, section
  references and a dated AI/human mapping-review rationale.

The PoC supports `article` and `simulation` materials. Catalog entries use
`provider/1.0.0/package.json`-shaped paths; at most 20 packages, 1,000 materials per
package and 64 goal references per material are accepted. Each material URL must
use the declared provider's hostname. Authoring validation and the runtime apply
the same bounds; this is a deliberately limited pilot contract, not a final standard.

The catalog title may be translated; that does not translate the linked material.
Mapping-review metadata is authoring evidence, not an instruction to the coach,
proof of learner progress, source evidence for the curriculum or provider approval.
The current Physik Libre package is an independent SkillPilot mapping, not an
announced partnership. A live URL check proves neither future availability nor
whole-site correctness.

Only short metadata and references live here. Do not copy provider HTML, images,
whole chapters, personal information, learner identifiers or chat text. URL query
parameters and credentials are not allowed. No learner-specific data is appended
to a provider URL. The runtime does not scrape or proxy these pages.

Changes to a published package require a new version. The initial PoC version is
local/unpublished until the normal deployment and acceptance workflow completes.
Changing or disabling a package/material never changes curriculum prerequisites
or mastery. A withdrawn package can remain in a learner's stored selection but
must not produce recommendations.

## Validation

From the repository root:

```bash
node scripts/validate_content_packages.mjs
node --test scripts/validate_content_packages.test.mjs
node scripts/validate_content_packages.mjs --inventory
```

The inventory classifies current canonical DE/Gymnasium links by their declared
purpose. It is a migration aid, not automatic permission to remove sources.
The schema check is offline. A separate optional authoring-time check fetches
public pages and verifies exact HTML anchors, without personal data:

```bash
node scripts/validate_content_packages.mjs --check-links
```

Review the actual sections against each current goal before activating a mapping.
An available page with a matching title is not enough. State limited coverage in
the review rationale. A second provider or subject uses the same package format;
there is no provider-specific rule in the curriculum.
