# Landscape JSON Field Reference

This document describes the landscape JSON schema used by the app. It uses the
Hessian math landscape as a concrete reference.

The runtime schema in `docs/landscape-runtime.schema.json` validates the required
runtime contract but intentionally allows additional metadata fields at the
top level and per goal for future layers and exports.

## Scope
- Reference file: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/DE_HES_S_GYM_2_MATHEMATIK.de.json`
- Goal count: file-specific; check the JSON for the current number.
- Types: `app/src/landscapeTypes.ts`
- Loader: `app/src/hooks/useLandscapes.ts`

## Top-level fields (LearningLandscape)

### landscapeId
- Type: string (UUID)
- Example: `2796fc7b-ba9d-446f-8f26-711dd6d8a9a3`
- Used by: `app/src/hooks/useLandscapes.ts` (API path and selection)
- Status: used

### locale
- Type: string (BCP-47 locale tag)
- Example: `de-DE`
- Used by: not referenced in app code; locale is selected by loading a locale-specific JSON file
- Status: currently unused in UI logic

### subject
- Type: string
- Example: `Mathematik`
- Used by: `app/src/components/ContextSelector.tsx`, `app/src/components/CurriculumDropdown.tsx`, `app/src/components/PersonalCurriculumSetup.tsx`
- Status: used (UI lists and selection)

### frameworkId
- Type: string
- Example: `hessen-kc-2024-math`
- Used by: not referenced in app code
- Status: currently unused

### title
- Type: string
- Example: `Mathematik Oberstufe (Hessen, KC 2024)`
- Used by: UI labels and document title via `app/src/App.tsx`
- Status: used

### titleEn
- Type: string
- Example: `Mathematics Upper Secondary (Hesse, KC 2024)`
- Used by: not defined in `app/src/landscapeTypes.ts`, so ignored by the typed loader
- Status: currently unused

### description
- Type: string
- Example: `Lernlandschaft fuer das hessische Kerncurriculum Mathematik (Gymnasiale Oberstufe, Ausgabe 2024).`
- Used by: UI fallback descriptions via `app/src/App.tsx`
- Status: used

### descriptionEn
- Type: string
- Example: `Learning landscape for the Hessian upper secondary mathematics curriculum (Kerncurriculum 2024).`
- Used by: not defined in `app/src/landscapeTypes.ts`, so ignored by the typed loader
- Status: currently unused

### filters
- Type: array of objects `{ id: string, label: string }`
- Example:
```json
[
  { "id": "GK", "label": "Grundkurs" },
  { "id": "LK", "label": "Leistungskurs" }
]
```
- Used by: UI filter selection in `app/src/hooks/useAppCore.ts` and filtering in `app/src/components/CompetenceTree.tsx`
- Status: used
- Notes: filter `id` values should match goal `tags` (e.g., `GK`, `LK`)

### goals
- Type: array of goal objects (LearningGoal)
- Used by: core data for all views and graph operations
- Status: used

## Goal fields (LearningGoal)

### id
- Type: string (UUID)
- Example: `32268086-4a03-4af8-9c4d-ab5fa8337e3d`
- Used by: graph edges (contains/requires), mastery map keys, routing
- Status: used

### shortKey
- Type: string (ASCII identifier)
- Example: `q3_5_gk_02_datenanalyse_modellvergleich`
- Used by: accepted by schema and intended for stable cross-layer/export references; the current UI still derives fallback short keys from UUIDs in `app/src/hooks/useAppCore.ts`
- Status: not yet consumed directly by the current UI runtime

### title
- Type: string
- Example: `Q3.5 Statistik und weitere Wahrscheinlichkeitsverteilungen`
- Used by: all UI labels
- Status: used

### titleEn
- Type: string
- Example: `Q3.5 Statistics and Further Probability Distributions`
- Used by: not used in UI; the typed loader ignores it
- Status: currently unused

### description
- Type: string
- Example: `Statistischer Wahrscheinlichkeitsbegriff und Datenauswertung ...`
- Used by: UI detail panels and page metadata
- Status: used

### descriptionEn
- Type: string
- Example: `Statistical probability concept and data analysis ...`
- Used by: not used in UI; the typed loader ignores it
- Status: currently unused

### core
- Type: boolean
- Example: `true`
- Used by: loaded into `UiGoal` via `app/src/goalTypes.ts`; current UI does not yet expose dedicated core-vs-extension reporting
- Status: available, lightly used, not yet surfaced prominently

### weight
- Type: number
- Example: `1.5`
- Used by: `app/src/hooks/useMasteryCalculation.ts` (weighted aggregation)
- Status: used
- Notes:
  - **Hessen Math (Gymnasiale Oberstufe, KC 2024):** atomic goals use `weight = 1`.  
    Cluster goals use `weight = (# of unique atomic descendants)` so progress is proportional to actual goal count.  
    If a goal appears under multiple parents, clusters count that atomic goal only once (set‑union) to avoid double counting.

### tags
- Type: string[]
- Example: `["GK", "LK"]`
- Used by: filter logic in `app/src/components/CompetenceTree.tsx` and `app/src/views/LearnerView.tsx`
- Status: used
- Notes: tags are generic; other landscapes use tags like `srs-deck:*` or `select:*`

### contains
- Type: string[] (goal IDs)
- Example: `["22586099-f0ff-4a58-84cd-07867cb3ae51", "..."]`
- Used by: tree navigation and root detection in `app/src/hooks/useGoalIndex.ts`
- Status: used

### requires
- Type: string[] (goal IDs)
- Example: `["8123874e-19be-453a-a93c-3aa91ec4e79d"]`
- Used by: topological sorting in `app/src/utils/goalSorter.ts` and prerequisite views in `app/src/hooks/useCompetenceGraph.ts`
- Status: used
- Notes: cross-landscape references of the form `<landscapeId>:<goalId>` are normalized in `app/src/hooks/useLandscapes.ts`
- Related design note: sibling ordering in "Meine Lernziele" is specified in `docs/dev/my-goals-node-ordering.md`

### examples
- Type: string[] (task or exercise IDs)
- Example: `["Q3_5_A07", "Q3_5_A08"]`
- Used by: not referenced in UI or backend code yet
- Status: currently unused

## Link model

The project distinguishes two different metadata concerns at goal level:

- `sourceRef` = the canonical provenance/source-of-truth reference for why the goal exists
- `resourceLinks` = ordered helpful learning resources for Cockpit and AI tutors

Concept note:

- `docs/concept/curriculum-graph/source-and-resource-links.md`

Design intent:

- Keep provenance and helpful learning material separate.
- Prefer a single canonical link list (`resourceLinks`) over ad-hoc per-project link fields.
- Use cluster-level links for broad course pages, books, or module overviews.
- Use atomic-goal links only for specific deep links that genuinely help with that exact goal.

### dimensionTags
- Type: object
- Example:
```json
{
  "framework": "hessen-kc-2024",
  "demandLevel": "AB2",
  "processCompetencies": ["K2.2", "K3.3"],
  "guidingIdeas": ["L4", "L5"],
  "phase": "Q3",
  "area": "Stochastik",
  "topicCode": "Q3.5"
}
```
- Used by: `app/src/goalTypes.ts` to derive UI fields
- Status: partially used (derived fields exist, but not displayed in UI)

### sourceRef
- Type: string (optional)
- Example: `https://ocw.mit.edu/courses/18-06-introduction-to-algorithms-spring-2020/` or `KC2024, S.58, Q3.5`
- Used by:
  - provenance display and API export in the backend learner state
  - fallback canonical source reference for AI tutors
- Status: used in backend/API; still only lightly surfaced in the current Cockpit UI
- Notes:
  - `sourceRef` should point to the primary provenance anchor when possible.
  - Prefer a stable URL if one exists; otherwise use a concise citation string.
  - `sourceRef` is not the place for a long list of helper resources.

### resourceLinks
- Type: array of resource-link objects (optional)
- Example:
```json
[
  {
    "type": "concept",
    "title": "Physik Libre: Ladung und Reibungselektrizitaet",
    "url": "https://physikbuch.schule/electricity.html#ladung-und-reibungselektrizitaet",
    "resourceType": "article",
    "provider": "physikbuch.schule",
    "sections": ["12.1 Ladung und Reibungselektrizitaet"]
  },
  {
    "type": "practice",
    "title": "MIT OCW Problem Set 3",
    "url": "https://ocw.mit.edu/...",
    "resourceType": "problem-set",
    "provider": "MIT OCW"
  }
]
```
- Used by:
  - backend AI/OpenAPI response field `resourceLinks`
  - Cockpit goal detail cards
  - CI source-link coverage checks for MIT OCW landscapes
- Status: canonical goal-level link field
- Notes:
  - Array order is meaningful and should express pedagogical priority.
  - Keep the required shape minimal: `type`, `title`, `url`.
  - Recommended `type` values: `overview`, `concept`, `practice`, `assessment`, `solution`, `reference`.
  - Recommended `resourceType` values: `course-page`, `video`, `notes`, `article`, `simulation`, `problem-set`, `exam`, `solution-set`, `book`, `tool`.
  - Optional descriptive fields: `provider`, `sections`, `description`, `lang`, `license`.
  - Do not duplicate dozens of broad course links onto every atomic node; link deeply only where it actually helps.

### extendedData.sourceLinks
- Type: legacy array inside `extendedData`
- Used by:
  - legacy data only
- Status: transitional only
- Notes:
  - Runtime link rendering no longer reads this field.
  - New and existing landscapes should use top-level `resourceLinks`.
  - Committed landscape JSON in this repository should not contain this field anymore; CI enforces this via `GVR-008`.

### oerContent
- Type: legacy object (`source`, `link`, optional `sections`, `description`)
- Used by:
  - older OER annotations in some landscapes
- Status: transitional only
- Notes:
  - Runtime link rendering no longer reads this field.
  - Migrate OER hints into `resourceLinks` instead.
  - Committed landscape JSON in this repository should not contain this field anymore; CI enforces this via `GVR-008`.

## dimensionTags fields

### framework
- Type: string
- Example: `hessen-kc-2024`
- Used by: not referenced in UI
- Status: unused

### demandLevel
- Type: string (`AB1` | `AB2` | `AB3`)
- Example: `AB2`
- Used by: `app/src/goalTypes.ts` to map to numeric level (1-3)
- Status: derived but currently not displayed

### processCompetencies
- Type: string[]
- Example: `["K1", "K2.2"]`
- Used by: stored as `kompetenzen` in UiGoal
- Status: derived but currently not displayed

### guidingIdeas
- Type: string[]
- Example: `["L1", "L5"]`
- Used by: stored as `leitideen` in UiGoal
- Status: derived but currently not displayed

### phase
- Type: string
- Example: `Q3`, `E`, `J11`
- Used by: parent sorting in `app/src/hooks/useGoalIndex.ts`
- Status: used for ordering only

### area
- Type: string
- Example: `Stochastik`
- Used by: stored as `area` in UiGoal
- Status: derived but currently not displayed

### topicCode
- Type: string
- Example: `Q3.5`
- Used by: stored as `themenfeld` in UiGoal
- Status: derived but currently not displayed

## Derived fields in UiGoal (not in JSON)

phase, themenfeld, area, level, leitideen, kompetenzen
- Source: mapped from `dimensionTags` in `app/src/goalTypes.ts`
- Status: available for filtering and reporting, not yet displayed in UI

## Data quality notes (current file)
- Some goals have missing `sourceRef`.
- Some goals have empty `processCompetencies` and `guidingIdeas`.
