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
- optional `curator: {name, url}` for the person or organization selecting links.
  A curator is not the provider of the linked material;
- explicit package `status` (`active` or `inactive`), `access: public-link` and
  `aiUsage: link-only`;
- materials with stable local `id`, original-language title, HTTPS `url`, type,
  actual material `language`, independent `status`, precise `goalIds`, section
  references and a dated AI/human mapping-review rationale.

The PoC supports `article` and `simulation` materials. Catalog entries use
`provider/1.0.0/package.json`-shaped paths; at most 20 packages, 1,000 materials per
package and 64 goal references per material are accepted. Package `provider` is
the default content provider. A material may explicitly declare its own
`provider: {name, url, relationship}` when a curated collection mixes providers.
Each material URL must use its effective provider's hostname; curator metadata
never changes that check. Omitted optional fields preserve existing packages.
Authoring validation and the runtime apply
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

Changes to a published package require a new version. The catalog selects
`1.1.0` successors for Physik Libre, mathematics, PhET physics, LabXchange and oPhysics;
their `1.0.0` pilot files remain intact. Stable package IDs keep existing
explicit selections valid after deployment; new profiles still start without a
selection. A local catalog change is not a deployment or live-Claude acceptance
claim.
Changing or disabling a package/material never changes curriculum prerequisites
or mastery. A withdrawn package can remain in a learner's stored selection but
must not produce recommendations.

## Curated enpasos collections

- [Mathematics](enpasos-mathe/1.1.0/README.md): selected GeoGebra activities by
  Andreas Lindner and Nicole Riegler, the Desmos graphing calculator and regular PhET simulations.
- [Physics](enpasos-physik/1.1.0/README.md): regular PhET simulations, selectable
  independently of Physik Libre.
- [Physics with LabXchange](enpasos-labxchange-physik/1.1.0/README.md): five
  English-language OpenStax readings hosted on LabXchange, for learners aged 13+.
- [Physics with oPhysics](enpasos-ophysics/1.1.0/README.md): English-language
  interactive activities authored and hosted by Tom Walsh, using GeoGebra.

`enpasos` selects the links; GeoGebra, Desmos, PhET, LabXchange and oPhysics supply the
linked services. The LabXchange package also attributes OpenStax as text author.
The settings show the curator, while resolved material metadata keeps the actual
provider. Links at learning goals remain compact, with a content-type icon.
Use direct activity/tool URLs, not collection or search pages. The PhET choices
are standard simulations available without payment or login for non-commercial
learning, not paid Studio/iO offerings; their checked scope and terms are recorded
in the package READMEs. This is link-only access, not a redistribution license.

The [LEIFIphysik candidate](enpasos-leifiphysik/1.0.0/README.md) is staged
`inactive` and not cataloged: automated anonymous and mobile checks received a
Cloudflare 403 page. Its required real-browser check remains open and is tracked in
[issue #54](https://github.com/enpasos/skillpilot/issues/54). These local
packages are not a claim of full provider coverage or production availability.

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
