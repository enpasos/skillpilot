# Source And Resource Links

This document distinguishes curriculum provenance, SkillPilot-owned visualization
assets, and optional external learning materials. The binding target is the
[Content Integration Architecture](content-integration.md), version 1.1:
**content references the curriculum; the curriculum does not select providers.**

Graph semantics, placements and views are specified separately in
[Graph Definition](graph-definition.md) and
[View Projection and Goal Placement](view-projection-and-goal-placement.md).

## 1. Classify by purpose

| Purpose | Authoritative location | Rule |
| --- | --- | --- |
| Evidence for a curricular statement | Curriculum source references, mappings, provenance and existing official `curriculum` links | Preserve traceability; this is not an optional material choice. |
| SkillPilot-owned goal visualization | Existing canonical `goal-visualization` link and its asset/QA records | Preserve the separate [visualization contract](atomic-goal-visualizations.md). |
| Optional explanation, textbook, video, simulation or tool | Separate content package referencing goal IDs | Resolve only through the learner's authorized material selection. |

An official domain does not automatically make a link provenance, and a textbook
can be source evidence only when it actually justifies a curricular statement.
Do not disguise optional material as `sourceRef` to avoid the content boundary.

## 2. Canonical fields and transition

`sourceRef`, source registries, mappings and structured provenance answer:
“Why does this learning goal exist?” Existing official `curriculum` resource
links continue to carry source references.

`resourceLinks` remains the current compatibility field for owned visualization
references and existing resources. **Do not add new optional external material
links to canonical goals.** Existing didactic links are inventoried and migrated
in reviewed increments; an unmigrated entry is transition debt, not a second
permanent authoring model. The old recommendation to place Physik-Libre, GeoGebra
or generic OER links directly on goals is superseded.

Frozen source snapshots, historical published packages and review receipts stay
unchanged. Live generated artifacts must be rebuilt from their authoring inputs,
not patched independently. The [pilot and inventory](../../dev/content-integration-physik-libre-pilot.md)
record the concrete migration boundary.

## 3. Separate content references

A content package names an independently maintained collection and maps material
URLs to existing stable goal IDs. It may include a book overview at package level,
precise sections at material level, mapping provenance and review limitations.
Neither the package nor its activation changes goal semantics, dependencies,
personal curriculum, frontier, mastery or completion criteria.

The PoC uses a deliberately provisional JSON format under `content/`; see
[Content package authoring](https://github.com/enpasos/skillpilot/blob/main/content/README.md). This is not a new
permanent interchange standard or a commitment to a payment or license platform.

Coverage is allowed to be incomplete. A reviewed mapping means the material
supports the named goal, not that the material fully covers it, is error-free,
is provider-endorsed or proves that the learner has mastered it.

## 4. Runtime consumers

The backend resolves selected packages against the current goal and returns
bounded material references separately from canonical curriculum data.

- Cockpit and the active coach receive the applicable selected references.
- No selection, no mapping, a withdrawn material or a failed external page leaves
  ordinary learning available.
- Keep URLs as ordinary external links. Do not transmit learner IDs, sessions,
  progress or chat text to a provider, and do not append tracking parameters.
- A link-only result is not a content fetch. The coach must not claim to have
  read a page solely because the backend supplied its URL.
- Activation is separate from access entitlement and permitted AI use.
- Current exam/solution-release and privacy boundaries remain authoritative.

## 5. Migration evidence

Review each proposed move by function; preserve useful mapping work and official
evidence. Verify unchanged goal IDs, titles, descriptions, prerequisites,
containment, source evidence and visualization assets.

A pure relocation must not silently invalidate historical human-practice evidence.
The existing practice fingerprint includes non-curriculum resources, so any such
compatibility change needs explicit, narrowly bound migration evidence.
Do not refresh arbitrary hashes or fabricate prior practice.

Regenerate affected publications and quality reports at the agreed migration
checkpoint. Preserve protected maturity floors and distinguish a technical
rebinding from a new substantive QA approval. The external-content PoC does not
change M7 or provide human release approval.
