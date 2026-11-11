## Curriculum Mapping Workbench {#sec:qal-mapping-workbench}

Whereas the Quality Dashboard (@ref{sec:qal-quality-dashboard}) reports *whether* generated QA rules are green, yellow, or red, the read-only local **Curriculum Mapping Workbench** lets curriculum owners inspect *why* — tracing every step from an official syllabus PDF into the learner-facing SkillPilot tree.

```text
Route:     /curriculum-mapping-workbench
Endpoints: /__curriculum-mapping-workbench/list
           /__curriculum-mapping-workbench/load?sourceLandscapeId=<id>
```

### Seven-Layer Repository Data Flow {#sec:qal-workbench-dataflow}

The workbench joins seven existing repository artifact layers without mutating registries:

1. **Source landscape registry (`curricula/DE/Gymnasium/provenance/source-landscape-registry.json`):** Identifies retained source snapshots by `landscapeId`, `jurisdiction`, title, and source path.
2. **Official PDF passage extraction (`source-extraction/*.source-extraction.json`):** For reviewed curricula (such as `DE_HE_MATHEMATIK_SEKII_KC2024.source-extraction.json` from `kerncurriculum_gymnasiale_oberstufe-mathematik.pdf`), `pdftotext` segments the PDF by topic fields (`E.1`, `Q1.3`, `Q4.2`), strips running headers/footers, normalizes German text to NFC against mojibake (`ä`, `ö`, `ü`, `ß`), and converts formulas into inline LaTeX for KaTeX rendering.
3. **Source goals:** When a persisted `source-extraction` file exists, source goals derive directly from literal official bullet aspects (retaining parent bullet text, `sourceSpan`, and PDF page); otherwise the view falls back to the retained snapshot (`*.de.json.snapshot`).
4. **Source-goal membership registry (`source-goal-membership-registry.json`):** Marks which source goals count as registered; unregistered source goals highlight visibly red.
5. **Source-goal closure registry (`source-goal-closure-registry.json`):** Decomposes broad original goals into the atomic source goals that close them.
6. **Mapping and review files (`curricula/DE/Gymnasium/mapping/...`):** Link `legacyGoalId` or extracted source goals (`exact`, `partial`, or explicit gap decisions in `*.review.json`) to `canonicalGoalId`.
7. **Canonical skill graph and composition view:** Pairs `curricula/DE/Gymnasium/canonical/*.de.json` with the matching learner-facing view under `curricula/DE/Gymnasium/composition-views/` so the right-hand tree matches what learners see.

### Fail-Closed Pipeline Gates (`MAPPING-1` through `MAPPING-3`) {#sec:qal-workbench-gates}

A downstream mapping stage must never be reported complete while any prerequisite stage remains incomplete or blocked (`pipelineStatus` inside `source-extraction`):

:::table{cols="2.6cm,3.8cm,X"}
| Gate | Meaning | Completion criterion |
| --- | --- | --- |
| `MAPPING-1` | Official passages extracted | Every expected topic field is present exactly once with official bullet text and clean German/LaTeX display text. |
| `MAPPING-2` | Source goals created | `MAPPING-1` complete, every goal-bearing passage has at least one unique source goal with span/parent-bullet/page reference and clean encoding (policy-only Leitfaden passages may stay non-goal-bearing). |
| `MAPPING-3` | Canonical mapping reviewed | `MAPPING-2` complete, every accepted source goal carries a reviewed decision targeting existing canonical goals and is substantively covered (`needs_canonical_goal` or `needs_view_placement_review` show progress without closing `MAPPING-3`). |
:::

### Two-Stage Interaction Model and Audit Interpretation {#sec:qal-workbench-interaction}

The page separates inspection into two dual-pane stages plus a bottom detail pane:

- **Stage 1 (Official PDF passage $\leftrightarrow$ source goals):** Left pane lists topic-field PDF passages; right pane lists assigned source goals with bidirectional highlighting.
- **Stage 2 (Source-goal tree $\leftrightarrow$ SkillPilot tree):** Left pane shows the source-goal tree with registration/mapping badges; right pane renders the learner-facing composition view with direct/descendant support counts and synchronized scroll focus; bottom pane inspects PDF page, source reference, closure atoms, and target nodes.

:::warning{title="Green means registered/mapped — not content-approved"}
A green badge indicates only that a registration or mapping edge exists in current repository data. Reviewers must still verify that every original PDF goal was captured, broad goals have a sound atomic closure, canonical targets are semantically justified, and no Bundesland view exposes goals lacking legitimate syllabus backing.
:::

Currently resolved Hessen audit entrypoints at `http://127.0.0.1:5174/curriculum-mapping-workbench`:

:::table{cols="2.6cm,1.6cm,3.4cm,3.8cm,X"}
| Subject | Stage | Source goals | Mappings | Official PDF in Workbench |
| --- | --- | --- | --- | --- |
| Mathematik | Sek I | 132 | 37 | `g9-mathematik.pdf` |
| Mathematik | Sek II | 316 persisted goals | 316 reviewed / 383 edges | `kerncurriculum_gymnasiale_oberstufe-mathematik.pdf` |
| Physik | Sek I | 60 | 53 | `g9-physik.pdf` |
| Physik | Sek II | 376 | 376 | `kerncurriculum_gymnasiale_oberstufe-physik.pdf` |
:::
