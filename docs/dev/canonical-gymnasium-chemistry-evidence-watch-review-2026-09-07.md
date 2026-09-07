# Chemistry evidence-watch baseline review — 7 September 2026

## Decision and scope

The product owner explicitly approved fixing the failing Chemistry evidence
watch. This maintenance change acknowledges an exact, previously committed
orientation change from **2 August 2026**. It does not author or approve new
Chemistry content and does not resume general curriculum QA.

The failing run was `34097561285`, job `101664490888`, on commit
`0a293a3363703e5dcda1ac9793ea87f674c67e7f`. It reported one changed file:
`curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json`.
The publication/history cleanup did not change this Chemistry source.

## Exact reviewed delta

The native `canonical-evidence-json-v1` hash of the source at
`3a34756b964819da16e8f218317c320990d143d7` exactly matches the former baseline:

```text
707a9cc2726c61c6d06101d04cd19a62c04cccde0fa4cf3fd3710f72599dfadd
```

Against that baseline, the current normalized source differs in exactly two
fields of goal `a9c22adc-b543-5b0c-a2d8-3189facdff08`:

1. `description`, previously:

   > Der Big-Picture-Einstieg: Die lernende Person kann erläutern, warum das Fach Chemie für den eigenen Alltag, gesellschaftliche Teilhabe sowie Studium und Beruf relevant ist und wie das systematische Erarbeiten dieses Curriculums zu nachhaltigem Kompetenzaufbau führt.

   Currently:

   > Der Big-Picture-Einstieg zeigt, welche Möglichkeiten Chemie im Alltag, bei gesellschaftlicher Teilhabe sowie in Studium und Beruf eröffnet und welche positiven Perspektiven der folgende Stoff bietet. Die lernende Person wählt nur, was sie neugierig macht oder ob sie weiterlernen möchte; fachliches Detailwissen wird hier weder vorausgesetzt noch geprüft.

2. `semanticKind`, previously absent, now `"orientation"`.

These changes originated in the already committed orientation work:
`da2a81d0c2ff7c552621d0c980280bd17dfef7bd` and
`9147976478530cf48eea9f39e6e6c3e22d338a22`.
Replacing exactly those two fields in the normalized baseline reconstructs
the complete current normalized source, with no remaining differences.

## Why the maintenance baseline may advance

The manifest watches the **active canonical graph**, not only original source
documents. The existing hash removes only `goal-visualization` resource links
and JSON formatting; those presentation-only changes retain their separate
visualization QA. This normalization is unchanged.

The historical patch makes the introductory goal explicitly non-assessing.
Both versions contain the same 473 goal IDs. No edges, curriculum scope,
source mappings, applicability, composition-view eligibility or source-backed
projection coverage change in this acknowledgement. All other **136 watched
files**, including original-source evidence, mappings, views and the rollout
tracker, retain their exact baseline records and hashes.

Only the canonical Chemistry record's hash and observed modification timestamp,
plus the baseline review timestamp, advance. The new native evidence hash is:

```text
cc1d63eed31a93420a2dd34890aed18bd62119fc42d50420e55ba9ee6e5a4ba3
```

This does not weaken the watch, ignore orientation fields, recapture unrelated
files, or assert a fresh substantive Chemistry review. The canonical source,
watch manifest, hash algorithm and CI workflow remain unchanged.

## Verification

- Native hash of the historical source equals the former baseline hash.
- Exact two-field reconstruction equals the complete current native payload.
- The other 136 baseline records remain byte-for-byte equivalent.
- `python3 -B scripts/canonical_chemistry_evidence_watch.py self-test` passes.
- `./scripts/run_canonical_chemistry_evidence_watch.sh` passes with
  `changed=0 added=0 removed=0`; the CI job still renders fresh status/delta
  artifacts on every run.
- The OpenAI review-freeze checker remains unchanged and passes.
