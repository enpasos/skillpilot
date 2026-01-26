# Landscape JSON Field Reference

This document describes the landscape JSON schema used by the app. It uses the
Hessian math landscape as a concrete reference.

## Scope
- Reference file: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/DE_HES_S_GYM_2_MATHEMATIK.de.json`
- Goal count: file-specific; check the JSON for the current number.
- Types: `src/landscapeTypes.ts`
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
- Used by: not defined in `src/landscapeTypes.ts`, so ignored by the typed loader
- Status: currently unused

### description
- Type: string
- Example: `Lernlandschaft fuer das hessische Kerncurriculum Mathematik (Gymnasiale Oberstufe, Ausgabe 2024).`
- Used by: UI fallback descriptions via `app/src/App.tsx`
- Status: used

### descriptionEn
- Type: string
- Example: `Learning landscape for the Hessian upper secondary mathematics curriculum (Kerncurriculum 2024).`
- Used by: not defined in `src/landscapeTypes.ts`, so ignored by the typed loader
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
- Used by: not used in UI; `app/src/hooks/useAppCore.ts` builds short keys from UUIDs instead
- Status: currently unused in UI, planned for stable persistence in Layer B/C

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
- Used by: not referenced in UI code yet
- Status: currently unused (intended for core vs extension metrics)

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

### examples
- Type: string[] (task or exercise IDs)
- Example: `["Q3_5_A07", "Q3_5_A08"]`
- Used by: not referenced in UI or backend code yet
- Status: currently unused

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
- Example: `KC2024, S.58, Q3.5`
- Used by: not referenced in UI or backend code
- Status: currently unused

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
