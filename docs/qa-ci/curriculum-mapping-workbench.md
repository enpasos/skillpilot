# Curriculum Mapping Workbench

The Curriculum Mapping Workbench is the local audit view for curriculum owners.
It makes the route from an official curriculum source snapshot into the learner-facing SkillPilot tree inspectable instead of only reporting aggregate percentages.

Local route:

```text
/curriculum-mapping-workbench
```

Local data endpoint:

```text
/__curriculum-mapping-workbench/list
/__curriculum-mapping-workbench/load?sourceLandscapeId=<id>
```

## Purpose

The quality dashboard answers whether generated QA rules are green, yellow, or red.
The mapping workbench answers why.

A curriculum owner must be able to inspect:

- which official PDF passage is the upstream source for a topic field
- which official source snapshot is being used
- which original/source goals were extracted from it
- whether those source goals are registered in the source-goal membership registry
- which source-goal closure is used for broad original goals
- which canonical SkillPilot goal each source goal maps to
- how a clicked source goal appears in the learner-facing tree
- which source goals support a clicked tree node

The workbench is deliberately read-only in the first prototype.
It is an audit surface, not an authoring shortcut.

## Data Flow

The prototype uses the existing repository artifacts.

1. Source landscape registry

   File:

   ```text
   curricula/DE/Gymnasium/provenance/source-landscape-registry.json
   ```

   This registry identifies retained source snapshots by `landscapeId`, `jurisdiction`, title, and source path.

2. Official PDF passage extraction

   Example:

   ```text
   curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf
   ```

   For reviewed curricula, the extracted passage layer is persisted under a `source-extraction/` directory.
   Example:

   ```text
   curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_MATHEMATIK_SEKII_KC2024.source-extraction.json
   ```

   The Hessen Sek II mathematics extractor converts the official PDF with `pdftotext`, segments it by topic-field headings such as `E.1`, `Q1.3`, or `Q4.2`, removes PDF running headers/footers and phase introduction bleed, and keeps the relevant official bullet passages.
   German text is normalized to NFC and guarded against typical mojibake artifacts, so umlauts such as `ä`, `ö`, `ü`, `Ä`, `Ö`, `Ü` and `ß` remain stable in passages, source goals, and Workbench display.
   Mathematical expressions and symbols in the displayed passage text are normalized into inline LaTeX so KaTeX can render them in the Workbench.
   This layer is intentionally separate from the source snapshot: it is the curriculum-owner check surface for whether the extraction captured the full official text.

3. Source goals

   Example:

   ```text
   curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_MATHEMATIK_SEKII_KC2024.source-extraction.json
   ```

   When a persisted `source-extraction` file exists, it is the authoritative artifact for mapping stages 1 and 2.
   Source goals are derived from literal official curriculum aspects inside the official bullet passages and retain the parent bullet text, the exact source span, and a PDF page reference.
   This prevents SkillPilot tree goals from being mistaken for original source goals.

   If no persisted extraction exists yet, the Workbench falls back to the retained source snapshot, for example:

   ```text
   curricula/DE/Gymnasium/input/BW/upper-secondary/source-json/DE_BAW_S_GYM_2_MATHEMATIK.de.json.snapshot
   ```

   The snapshot is then rendered below the official PDF passages as the extracted source-goal tree.
   Every source goal gets a stable DOM anchor, so links can target it directly.

4. Source-goal membership registry

   File:

   ```text
   curricula/DE/Gymnasium/provenance/source-goal-membership-registry.json
   ```

   This says which source goals count as captured/registered for the source snapshot.
   The workbench marks unregistered source goals visibly red.

5. Source-goal closure registry

   File:

   ```text
   curricula/DE/Gymnasium/provenance/source-goal-closure-registry.json
   ```

   This maps broad original/source goals to the atomic source goals that close them.
   A broad source goal is only fully useful if its closure can be followed to canonical SkillPilot goals.

6. Mapping files

   Example:

   ```text
   curricula/DE/Gymnasium/mapping/DE-BW/upper-secondary/bw_math_upper_secondary_to_canonical_math.json
   ```

   These map `legacyGoalId` from a source snapshot to `canonicalGoalId` in the canonical SkillPilot graph.
   The mapping type is surfaced as `exact`, `partial`, or another configured value.

7. Canonical SkillPilot graph and composition view

   Example canonical graph:

   ```text
   curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json
   ```

   Example learner-facing composition view:

   ```text
   curricula/DE/Gymnasium/composition-views/mathematik/de-bw-sekii-gk.view.json
   ```

   The right-side tree uses the matching composition view when available, so the audit view resembles the tree shown to learners.

## Pipeline Completion Gates

Curriculum mapping is treated as a processing pipeline.
A later step can only be meaningfully completed when all prerequisite steps are complete.
For persisted `source-extraction` artifacts this decision is stored in `pipelineStatus`.

Current step model:

| Step | Meaning | Completion decision |
| --- | --- | --- |
| `MAPPING-1` | Official original curriculum passages extracted | Complete only when every expected topic-field passage is present exactly once, contains official bullet text, and has clean German/LaTeX display text. |
| `MAPPING-2` | Source goals created from the extracted passages | Complete only when `MAPPING-1` is complete, every goal-bearing passage has at least one source goal, every source goal references an existing passage, IDs are unique, source span / parent bullet / source reference are present, and text is encoding-clean. Supporting Leitfaden passages may be non-goal-bearing when they document processing policy rather than curriculum-owned learning goals. |
| `MAPPING-3` | Source goals mapped to canonical SkillPilot goals | Complete only when `MAPPING-2` is complete, every accepted source goal has a reviewed decision, all referenced canonical targets exist, and every accepted source goal is actually covered by canonical SkillPilot goals. A `needs_canonical_goal` or `needs_view_placement_review` decision is visible progress, but it does not close M3. |

The Workbench surfaces this pipeline status directly.
This is the intended agent decision rule: do not advance or claim success for a step when a prerequisite pipeline step is incomplete or blocked.

For Hessen Mathematik Sek II, M3 decisions are persisted separately from the old legacy-snapshot mapping:

```text
curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_math_upper_secondary_source_extraction_to_canonical_math.review.json
```

The review file contains ordinary `mappings` entries for source goals that are truly covered, plus explicit `decisions` for open target gaps.
The complete E-phase slices, all Q1 slices, all Q2 slices, `Q3.1` to `Q3.5`, and `Q4.1` to `Q4.3` are reviewed: `E.1 Funktionen und ihre Darstellung`, `E.2 Einführung des Ableitungsbegriffs`, `E.3 Anwendungen des Ableitungsbegriffs`, `E.4 Exponentialfunktionen`, `E.5 Trigonometrische Funktionen`, `E.6 Weitere Verfahren zum Lösen von Gleichungen`, `E.7 Folgen und Reihen`, `Q1.1 Einführung in die Integralrechnung`, `Q1.2 Anwendungen der Integralrechnung`, `Q1.3 Vertiefung der Differenzial- und Integralrechnung`, `Q1.4 Integrationsmethoden`, `Q1.5 Gewöhnliche Differenzialgleichungen`, `Q2.1 Vertiefung der Analysis`, `Q2.2 Orientieren und Bewegen im Raum`, `Q2.3 Geraden und Ebenen im Raum`, `Q2.4 Matrizen zur Beschreibung von Übergangsprozessen`, `Q2.5 Matrizen zur Darstellung linearer geometrischer Abbildungen`, `Q3.1 Grundlegende Begriffe und Methoden der Stochastik`, `Q3.2 Wahrscheinlichkeitsverteilungen`, `Q3.3 Hypothesentests`, `Q3.4 Prognoseintervalle und Konfidenzintervalle`, `Q3.5 Statistik und weitere Wahrscheinlichkeitsverteilungen`, `Q4.1 Funktionenscharen`, `Q4.2 Problemlösen und Argumentieren`, and `Q4.3 Komplexe Zahlen`: 316/316 source goals reviewed, 316 mapped, 0 canonical-goal gaps, and 0 placement/view questions. The source-goal denominator is 316 after excluding Q3.2 formula artifacts and the Q4.2 domain-heading artifact `Analytische Geometrie:`.
The persisted source-goal denominator changed from 319 to 317 because two previous Q3.2 entries were formula extraction artifacts inside the Normalverteilung formulas, not official learning goals.

## Interaction Model

The page deliberately separates the audit into two mapping stages.
Each stage has exactly two panes.

### Stage 1: Official PDF passage -> source goals

Use this stage to answer whether the official curriculum text was extracted completely and defensibly.

Left pane:

- official PDF passages segmented by topic field, for example `E.1 Funktionen und ihre Darstellung`
- clicking a passage highlights the source goals currently derived from that passage

Right pane:

- flat list of source goals currently assigned to the selected official passage
- clicking a source goal highlights the official passage it currently belongs to

### Stage 2: Source goals -> SkillPilot tree

Use this stage to answer whether the extracted source goals map to the correct learner-facing SkillPilot goals.

Left pane:

- extracted source-goal tree
- each source goal shows registration and mapping status
- clicking a source goal highlights and scrolls to mapped SkillPilot tree nodes

Right pane:

- learner-facing SkillPilot tree from the matching composition view
- mapped nodes show direct or descendant source support counts
- clicking a tree node highlights and scrolls to supporting source goals

Bottom detail pane:

- selected official passage: PDF page, source path, and currently derived source goals
- selected source goal: description, source reference, closure atom count, direct mappings, canonical targets
- selected tree node: description and supporting source goals

## Interpretation

Green in this workbench does not mean "curriculum complete".
It only means the clicked artifact has a registered or mapped relationship in the current repository data.
For a persisted source-extraction artifact, "registered" means "present in the reviewed extraction file"; it does not mean that the later mapping to the canonical SkillPilot graph has already been accepted.

The intended review questions are:

- Are all official original goals present in the source snapshot?
- Are all source snapshot goals registered?
- Are broad source goals decomposed into a defensible atomic closure?
- Does every source atomic goal map to the correct canonical SkillPilot goal?
- Does every learner-facing SkillPilot goal have a legitimate source-backed mapping or reviewed surrogate evidence?
- Are there SkillPilot goals in a Bundesland view that are not derivable from that state's curriculum?

This makes fake coverage visible: if a registry claims coverage without a believable source path and mapping trail, the curriculum owner can click through and see the gap.

## Current Prototype Scope

The first implementation is intentionally narrow and practical:

- local Workbench route only
- read-only
- works from existing JSON snapshots, persisted source-extraction files, and registries
- defaults to the Hessen mathematics upper-secondary source-extraction artifact when available
- supports composition-view selection when matching views exist
- shows official PDF links from the retained `references.md` files when available
- shows persisted or locally extracted official PDF topic-field passages when `pdftotext` is available
- renders normalized inline LaTeX in official mathematics passages and source goals
- shows persisted pipeline completion gates for source-extraction artifacts
- does not yet write review decisions back to registries

The next durable step is to add explicit review states per mapping edge, for example `accepted`, `rejected`, `needs_split`, and `needs_source_correction`.

## Hessen Check Entrypoints

For a Hessen curriculum-owner review, open the local route and select one of the Hessen source documents:

```text
http://127.0.0.1:5174/curriculum-mapping-workbench
```

Currently resolved Hessen examples:

| Subject | Stage | Source goals | Mappings | Official PDF shown in Workbench |
| --- | --- | ---: | ---: | --- |
| Mathematik | Sek I | 132 | 37 | `g9-mathematik.pdf` |
| Mathematik | Sek II | 316 persisted source goals | 316 reviewed source goals / 383 mapping edges | `kerncurriculum_gymnasiale_oberstufe-mathematik.pdf` |
| Physik | Sek I | 60 | 53 | `g9-physik.pdf` |
| Physik | Sek II | 376 | 376 | `kerncurriculum_gymnasiale_oberstufe-physik.pdf` |

These numbers are audit counters, not a content approval.
The review question remains whether every original PDF goal is present in the source-goal layer and whether every mapped SkillPilot target is semantically justified.
