# Graph Production Pipeline (QST Module -> SkillGraph)

This document describes the end-to-end production pipeline that turns a module source into a clean SkillGraph JSON.
It is written to be repeatable and auditable.

---

## Scope
- Target domain: TUM M.Sc. Quantum Science and Technology (QST) modules.
- Example module: `NAT7001` (Quantum Optics).
- Output format: `curricula/DE/BY/TUM/Quantum_Science_and_Technology/MSc_QST/json/DE_BAY_U_TUM_<CODE>.de.json`

---

## Inputs (Source of Truth)
1) **Raw module text** (phase 1 output)
   - Path: `curricula/DE/BY/TUM/Quantum_Science_and_Technology/MSc_QST/input/raw/DE_BAY_U_TUM_<CODE>.txt`
   - Format (plain text, no HTML):
     - `code`, `title`, `title_en`, `ects`, optional `ects_plan`, optional `semester_plan`
     - `content:` section (plain text)
     - `outcomes:` section (bulleted list)
     - `preconditions:` section (plain text)
2) **Manual skill breakdown** (phase 2 output)
   - Path: `curricula/DE/BY/TUM/Quantum_Science_and_Technology/MSc_QST/input/rawgraph/DE_BAY_U_TUM_<CODE>.txt`
   - Contains a hierarchy of nodes with simple titles and measurable descriptions.
3) **Module source API** (phase 0 input)
   - `https://academics.nat.tum.de/api/v1/mhb/<CODE>`

---

## Step 0: Scrape the source data (Phase 0)

Goal: fetch authoritative module data from the TUM module handbook API and normalize it for phase 1.

Source:
- TUM module handbook API: `https://academics.nat.tum.de/api/v1/mhb/<CODE>`
- Module detail page (for reference): `https://academics.nat.tum.de/org/mh/details/mod/<CODE>`

Required input:
- A module list (`xyz.txt`) that includes a URL template with `$m` and the module codes.
  Example header lines:
  - `https://academics.nat.tum.de/org/mh/details/mod/$m`
  - `... $m ...` (table header)
  - `NAT7001 Quantenoptik 9` (code + title + optional credits/semester)

Execution:
1) Run the scraper against the module list:
   - `python scripts/scrape_tum_curriculum.py <path-to-xyz.txt> --raw-output`
2) The scraper requests the API endpoint per code and normalizes:
   - titles (DE/EN), ECTS, content, outcomes, prerequisites
3) Output raw files land in:
   - `curricula/DE/BY/TUM/Quantum_Science_and_Technology/MSc_QST/input/raw/DE_BAY_U_TUM_<CODE>.txt`

Notes:
- If API fields are missing, the scraper falls back to input credits or leaves them empty.
- Do not store HTML; keep only clean text lines.

---

## Step 1: Create raw module text (Phase 1)

Goal: capture essential module content as plain text for later modeling.

This step is fulfilled by Step 0 output. If you already have a raw file, you can skip this step.

Notes:
- The raw text must be **plain text** (no HTML).
- Keep only relevant content: code, titles (DE/EN), ECTS, content, outcomes, prerequisites.

---

## Step 2: Create skill breakdown (Phase 2)

Goal: convert the raw content and outcomes into a measurable skill hierarchy.

Manual task (human-in-the-loop):
1) Read `input/raw/DE_BAY_U_TUM_<CODE>.txt`.
2) Create `input/rawgraph/DE_BAY_U_TUM_<CODE>.txt` with:
   - A root node (module-level competence).
   - Category nodes (major themes).
   - Leaf nodes (measurable skills).
3) Each node must have:
   - A short title.
   - A measurable description ("can explain/apply/derive/compute ...").

Example node format (plain text):
```
Node: Quantized electromagnetic field
Description: The learner can model light as quantized field modes and compute basic state properties.
```

---

## Step 3: Generate JSON from rawgraph

Goal: build the actual SkillGraph JSON for the module.

### 3.1 Deterministic IDs
Use UUID v5 with namespace:
- Namespace: `uuid.uuid5(uuid.NAMESPACE_DNS, "skillpilot.io")`

Required deterministic IDs:
1) **Module root goal ID** (must be stable across regenerations)
   - `uuid5(skillpilot.io, "tum-module/<CODE>")`
   - Example for NAT7001: `e221ae35-db80-575f-8581-cbee1c909164`
2) **Category and leaf goals**
   - Use a stable mapping tied to the module and shortKey:
   - Recommended pattern: `uuid5(skillpilot.io, "tum-<code.lower()>/<shortKey>")`

### 3.2 Required JSON fields
Top-level JSON:
- `title`, `titleEn`, `description`, `descriptionEn`
- `locale`: `"de-DE"`
- `subject`: `"TUM-Module"`
- `frameworkId`: `tum-<code.lower()>`
- `goals`: array (root + categories + leaves)

Each goal:
- `id`, `shortKey`, `title`, `titleEn`, `description`, `descriptionEn`
- `core`: `true`
- `weight`:
  - root: ECTS (e.g. 9.0)
  - category nodes: 2.0
  - leaf nodes: 1.0
- `phase`: `"Modul"`
- `area`: `"Gesamtkompetenz"` for root, `"Kompetenz"` for others
- `tags`: `["module:<CODE>"]` and for root also `["ects:<ECTS>"]`
- `contains`: child goal IDs (for root and categories)
- `requires`: empty at this stage (added in Step 4)
- `sourceRef`: module URL (root only)

### 3.3 Language alignment
Ensure DE/EN fields match in meaning:
- `title` <-> `titleEn`
- `description` <-> `descriptionEn`

### 3.4 Umlaut normalization (German fields)
Ensure German fields use proper umlauts instead of ASCII transliteration.
- Replace `ae/oe/ue/ss` with `ä/ö/ü/ß` where appropriate.
- Focus on German `title` and `description` fields.

---

## Step 4: Add `requires` relations

Goal: model prerequisites within the module while keeping the graph minimal.

Rules: see `docs/requires_relation_checks.md`

Process:
1) Use the rawgraph hierarchy to infer dependencies.
2) Prefer **inherited** requires (parent -> child) over direct requires.
3) Avoid transitive and redundant requires.
4) Keep acyclic prerequisites.

Output:
- Update `requires` arrays on the relevant nodes in the JSON.

---

## Step 5: Validation

Run the graph validator:
- `npm run validate:graph` (from `app/`)

Fix any errors (missing IDs, invalid phases, cycles, etc.).

---

## Step 6: Update curriculum aggregations (if needed)

If the module root goal ID changed (it should not if deterministic), update the QST program file:
- `curricula/DE/BY/TUM/Quantum_Science_and_Technology/MSc_QST/json/DE_BAY_U_TUM_MSC_QST.de.json`

Goal:
- Ensure the program-level `contains` includes the module root goal ID.

---

## Step 7: QA checklist
- Titles and descriptions are coherent and bilingual.
- Each node has a measurable description.
- `requires` relations follow minimality rules.
- Deterministic IDs match the chosen scheme.
- No HTML or non-relevant text in raw/graph inputs.

---

## Example (NAT7001)
0) Source: `https://academics.nat.tum.de/api/v1/mhb/NAT7001`
1) Raw: `input/raw/DE_BAY_U_TUM_NAT7001.txt`
2) Rawgraph: `input/rawgraph/DE_BAY_U_TUM_NAT7001.txt`
3) JSON output: `json/DE_BAY_U_TUM_NAT7001.de.json`
4) Requires updated per `docs/requires_relation_checks.md`
5) Validate: `npm run validate:graph`
