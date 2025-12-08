# AGENTS.md – Competence Graph Memory & Design Guide

This document is the **long-term memory** for SkillPilot, including the competence-graph explorer.  
It captures the *concepts and design decisions* that are **not obvious from the code alone**, so humans and LLMs can extend the project consistently across different learning domains.

---

## 1. Purpose of this project

SkillPilot is a **general open-source learning platform** that models domains as competence graphs.
Every landscape should:

1. Represent learning goals as a **DAG of competencies** (cluster + atomic goals).
2. Enable **smooth learning paths** via the `requires` frontier: no goal is suggested unless prerequisites are mastered.
3. Provide a **transparent mastery/progress view** that can later drive grading or certification models.
4. Be usable both by **human teachers/learners** and **LLM-based agents** (task generation, coaching, analytics).

This repository ships multiple Hessian KC 2024 landscapes (Mathematik, Physik, Chemie, Biologie, Informatik, Wirtschaftswissenschaften, Politik und Wirtschaft, Deutsch, Englisch, Französisch, Latein, Geschichte). In addition, we now have:

- **Hessen Sek I (G9)**: Mathe, Physik, Chemie, Biologie as competence DAGs per Jahrgang 5–10 plus Mittelstufe-Overview.
- **Sprachen CEFR (für Deutschsprachige)**: Englisch und Französisch als A1–C2 CEFR-Landschaften (IDs `GER_ENGLISH_FROM_GERMAN`, `GER_FRENCH_FROM_GERMAN`).

All conventions described below are general enough to support other curricula, subjects, or languages; the mathematics graph remains the reference implementation.

> Foreign languages (Englisch/Französisch) follow a TF × Skill × GER schema: Themenfelder aus dem KC + sprachliche Skills (reading, listening, speaking, writing, mediation, intercultural) mit `tags` wie `skill:*` und `cefr:B1/B2/C1` (E ~ B1, Q GK ~ B2, LK ~ C1).  
> German Ziele wurden KC-konform operationalisiert (prüfbare Beschreibungen, z. B. Analyse, Vergleich, Deutung, Urteilsbildung) und mit einfachen `skill:*`-Tags (lesen, schreiben, sprechen, medien, sprachreflexion) versehen.  
> Geschichte ist komplett angelegt (E + Q1–Q4), je Themenfeld GK-/LK-Ziele: Überblick, Quellenanalyse, Strukturen/Ursachen, Vergleich, historisches Urteil, Erinnerung/Deutung.

---

## 2. Mental model of the competence graph

### 2.1 Nodes = learning goals

Each node is a **learning goal** (“Lernziel”). There are two “flavours”:

- **Atomic goals**  
  Small, assessable skills (e.g. _“mittlere Änderungsrate berechnen und deuten”_).
- **Cluster goals**  
  Aggregations that group atomic goals (e.g. all goals in one Themenfeld, or all E1-Analysis basics).

Atomic goals are what the student actually “masters”.  
Cluster goals are for navigation, progress summaries, and as intermediate “levels” in the graph.

### 2.2 Edges = relationships between goals

We use exactly **two connection types**:

1. `requires` – **prerequisite**  
   - `A.requires = [B, C]` means: A should only be approached if B und C sitzen.  
   - Prereqs können auf Clustern stehen und vererben sich entlang `contains` auf alle Unterziele; Frontiers sollten mit der effektiven Menge (direkt + vererbt) rechnen.
   - Intention: modelling **didactic dependencies** (prevents jumping into topics without foundation).

2. `contains` – **is composed of / includes**  
   - `A.contains = [B, C]` means: A is a **higher-level bundle** of B and C.  
   - If a learner truly masters A, we *usually* assume mastery of B and C.

The overall structure is a **DAG (Directed Acyclic Graph)**:
- `requires` should never form cycles.
- `contains` also should not create cycles (think of it as a hierarchy of clusters).

---

## 3. Semantics of the `Goal` fields

The `Goal` type in code currently uses a minimal set of fields.  
Semantics (the “meaning”) of those fields is:

- `id`  
  Short, stable identifier, used everywhere in the app.  
  Conventions (examples):
  - E-phase: `L_A1`, `L_AG4`, `TF_E2`, …
  - Q3 Stochastik: `TF_Q3_2_WAHRSCH_VERTEILUNGEN`, `Q3_2_03_BERNOULLI_KETTEN`, …

- `title`  
  Short phrase naming the competence. Shown prominently in the UI.

- `description`  
  Full-sentence learning goal, typically of the form:  
  _“Die lernende Person kann …”_  
  This should be understandable for teachers and learners, not only for machines.

- `phase`  
  Curriculum-specific grouping (semester, module, year).  
  *Example (Hessen math):* `E`, `Q1`, `Q2`, `Q3`, `Q4`.

- `area`  
  Domain area or strand (e.g. `Analysis`, `Geometry`, `Process Skills`). Adjust freely per landscape.

- `level`  
  Difficulty tier for the native curriculum.  
  *Example (Hessen math):* `1/2/3` map to Anforderungsbereiche I–III. In other landscapes, map to whatever taxonomy you need.

- `core`  
  - `true` = Kernziel (Pflichtstoff für alle Schüler:innen).
  - `false` = Erweiterung (typisch: LK-Inhalte oder Vertiefungen).

- `weight`  
  Relative importance of this goal for **progress and later grading**.  
  Used to compute weighted averages over sets of goals (e.g. all E1 core goals).

- `requires`  
  List of IDs that are **didactic prerequisites** for this goal.  
  LLMs and UIs should:
  - use these to avoid suggesting goals whose prerequisites are clearly nicht gemeistert,
  - use them to compute “Frontiers” (see below).

- `contains`  
  List of IDs that are **subgoals** of this goal (cluster relationship).  
  Mainly used for navigation (“drill down”) and summaries.

- `examples`  
  List of **example task IDs** or labels that exercise this goal.  
  Actual tasks/exercises can be kept elsewhere; this field is just a cross-reference.

> **Important invariant for agents:**  
> When adding or modifying goals, keep the DAG property: do not introduce `requires` or `contains` cycles.

---

## 4. Mastery model

The UI maintains a **mastery value per goal**:

- `mastery[goalId] ∈ [0, 1]`
  - `0`   = no mastery (or not yet assessed),
  - `0.5` = partly mastered / unsicher,
  - `1`   = sicher beherrscht.

This is currently:

- set **manually via UI controls** (slider + quick buttons),
- aggregated per **filtered goal set** into:
  - average mastery over core goals (weighted by `weight`),
  - average mastery over extension goals.

The intended use is:

1. **Learner or teacher** set/adjust mastery for atomic goals.
2. The app (or an agent) computes aggregated metrics.
3. A grading rule (not yet implemented) maps these to familiar school grades (1–6).

When agents generate feedback or suggestions, they should:

- Treat mastery values as **soft estimates**, not hard truth.
- Prefer suggesting goals
  - whose prerequisites are mastered,
  - whose own mastery is clearly < 1.

---

## 5. Frontier: “next sensible steps”

The **frontier** of a learner is the set of goals that are **good next candidates**:

- All `requires` are mastered (or above a threshold).
- The goal itself is not yet fully mastered.

Formally, for mastery map `M` and threshold `τ` (e.g. `0.8` for “mastered”):

```text
Frontier F = {
  g ∈ Goals |
    M[g] < 1  AND
    ∀ r ∈ g.requires: M[r] ≥ τ
}
````

Agents that recommend tasks should:

* Use the **frontier** as the primary pool for “what next?”.
* Possibly sort frontier goals by:

  * phase,
  * area,
  * level,
  * or teacher preference.

A future UI component can show this explicitly as a list or map.

---

## 6. Mapping curricula into the graph (example: Hessian KC)

Any curriculum or skill framework can be mapped by following the same blueprint.  
For the Hessian *Kerncurriculum Mathematik gymnasiale Oberstufe* this means:

1. **Process competencies (K1–K6)** – argumentieren, modellieren, Darstellungen verwenden, …
2. **Content competencies per topic field** – e.g. E.1–E.7, Q1.1–Q4.3.
3. **Cross-cutting dimensions** – Leitideen (L1–L5), digitale Werkzeuge, etc.

Whatever the framework, interpret it as a **universe of required goals** and encode it as a competence graph using the following strategy.

### 6.1 Structural layers

To stay organized, we think in **layers**:

* **Layer 0: Root (optional)** – one node that contains everything.
* **Layer 1: High-level clusters** – e.g. Kurshalbjahre, grade levels, or modules (`E_Analysis`, `Q1_Analysis`, … in the Hessian case).
* **Layer 2: Topic clusters** – one per table row / topic grouping (e.g. `TF_E2`, `TF_Q3_2_WAHRSCH_VERTEILUNGEN`). These `contains` the atomic goals derived from that unit.
* **Layer 3: Atomic goals** – each bullet (or small cluster of bullets) becomes 1–3 measurable goals.

Agents adding new content from the curriculum should:

* Prefer to add **atomic goals on Layer 3**.
* Link them to an appropriate **Themenfeld-cluster (Layer 2)** via `contains`.
* Optionally adjust the relevant **Kurshalbjahr-cluster (Layer 1)**.

### 6.2 Dependencies (`requires`) between Themenfeldern

Dependencies between Themenfeldern should be **simple and regular**, not over-engineered:

* Within a Themenfeld:

  * Order atomic goals in a reasonable sequence.
  * Let each goal require the 1–2 key predecessors.

* Between Themenfeldern (or modules):

  * Use the logical structure of the curriculum:
    * Example: `Q1` Analysis requires the E-phase basics; `TF_Q3_2` (binomial distributions) requires `TF_Q3_1` (foundations).
  * Implement dependencies primarily at cluster level (Layer 1 or 2). Atomic goals can add finer prerequisites if necessary.

Agents should **avoid creating very long or tangled `requires` chains**
if they can be expressed via a small number of well-chosen prerequisites.

---

## 7. Conventions for new learning goals

When adding new goals (especially atomic ones), follow these conventions:

1. **Descriptions are student-facing**

   * Use *“Die lernende Person kann …”* style wording.
   * Make them specific enough to be tested in 1–3 tasks.

2. **IDs reflect structure**

   * Pick a convention that mirrors the native curriculum (semester, module, etc.).
   * Example (Hessen math): `E2_01_...`, `Q3_2_03_BERNOULLI_KETTEN`, cluster IDs starting with `TF_`.

3. **Keep goals atomic**

   * Avoid “kann Analysis in der Oberstufe”.
   * Aim for granularity where one exam task can reasonably assess 1–3 goals.

4. **DAG sanity**

   * Check that `requires` and `contains` don’t produce cycles.
   * `requires` should generally **point “backwards” in time** (to earlier phases or earlier goals in the same Themenfeld).

5. **Core vs Extension**

   * Use `core: true` for what every student (GK) must be able to do.
   * Use `core: false` for:

     * LK-only extensions,
     * enrichment topics,
     * deeper applications.

---

## 8. Ideas for future work (for agents and humans)

These are directions that are **intended**, even if not implemented yet:

1. **Frontier view**

   * Visualize all frontier goals for the current learner.
   * Let agents propose exercises or explanations for them.

2. **Grade mapping**

   * Turn aggregated `mastery` over core/extension + weights into familiar grades (1–6).
   * Keep the mapping **simple & explainable**.

3. **Curriculum metadata**

   * Extend `Goal` with:

     * `themenfeld` (e.g. `"E.2"`),
     * `courseLevel` (`"GK" | "LK" | "both"`),
     * `leitideen` (subset of L1–L5),
     * `kompetenzen` (references like `"K1.2"`, `"K3.4"`),
     * `sourceRef` (text reference into the Kerncurriculum PDF).
   * Use these tags for filtering, reporting and to help agents align goals with the official text.

4. **Persistence**

   * Store mastery information per student (e.g. in backend or local storage).
   * Potentially support multiple learner profiles.

5. **Task / example integration**

   * Link `examples` to real tasks (in a separate database or file).
   * Let agents generate new example tasks for given goals and attach them.

---

## 9. How agents should behave

When an LLM/agent works on this repo, it should:

* **Respect the existing structure**:

  * keep the DAG invariant,
  * follow the conventions above.
* **Be explicit about curriculum intent**:

  * when adding goals, think “what bullet in the Kerncurriculum is this covering?”.
* **Avoid restating what code already says**:

  * AGENTS.md is for *concepts & policies*,
  * code files are for implementation details.

* **Keep the project root clean**:
  * Write temporary files, verification scripts, logs, or one-off migration scripts to the `tmp/` directory (or `docs/` if permanent).
  * Never write transient files directly to the project root.

If you extend the project in a conceptually new way (new types of nodes, new semantics),
update this document so future agents don’t have to reverse-engineer intentions from code.

---

## 10. Layered architecture: A (Lernziellandschaft), B (Lernverläufe), C (LLM/MCP)

This project is intended as the *lower layer* of a larger architecture.  
We distinguish three levels that should stay conceptually separated:

- **Layer A – Lernziellandschaft (competence landscape)**  
- **Layer B – Individuelle Lernpfade & Mastery**  
- **Layer C – LLM-gestützte Navigation via MCP**

### 10.1 Layer A – Lernziellandschaft

Layer A contains the **static, curriculum-level description** of a domain:

- A directed acyclic competence graph with:
  - nodes = learning goals (atomic + cluster),
  - edges:
    - `contains` for structural hierarchy (Themenfelder, Halbjahres-Cluster, etc.),
    - `requires` for didactic prerequisites.
- All domain metadata lives here:
  - `phase`, `area`, `themenfeld`,
  - `level` (Anforderungsbereich I–III),
  - `leitideen` (L1–L5),
  - `kompetenzen` (K1–K6, ggf. mit Subcodes),
  - `courseLevel`, `sourceRef`, `examples`, …

**Representation strategy:**

- Conceptually, Layer A is **pure data**, ideally representable as JSON (or a similarly simple format) so that:
  - it can be reused by different frontends and tools,
  - other curricula or Themenwelten (z. B. Physik, Informatik, Brückenkurse) can be added as additional landscapes.
- In this repo, the JSON files in `landscapes/` are the **concrete encodings** of each landscape:
  - e.g. das hessische *Kerncurriculum Mathematik gymnasiale Oberstufe* (KC 2024) sowie Physik (KC 2024) als DAG-Dateien.

Agents working on Layer A should think in terms of:

- “Which bullet / table row in the curriculum does this goal correspond to?”
- “How does this new goal fit into `contains` and `requires` without breaking the DAG?”

Layer A is **shared across all learners**; it does not contain any individual performance data.

### 10.2 Layer B – Individuelle Lernpfade & Mastery

Layer B describes, for a fixed Layer‑A graph, the **state of a concrete learner** (or group):

- For each learner ℓ and goal g:
  - `mastery_ℓ[g] ∈ [0,1]` as in Section 4 (0, 0.5, 1 currently in the UI).
- Optional:
  - history of visited goals, tasks, timestamps,
  - teacher comments / annotations,
  - learner preferences (z. B. „mehr Stochastik“, „erst Analysis abschließen“).

Navigation support on Layer B should:

- Use the **Frontier** definition (Section 5) to propose “nächste sinnvolle Lernziele”:
  - only suggest g if all `requires` are sufficiently mastered,
  - prefer goals with low mastery and high weight.
- Allow both:
  - *guided* navigation (Lehrer:in wählt Ziele aus, Frontier dient als Check),
  - *self-directed* navigation (Lernende sehen Frontier + Kontext, wählen selbst).

Implementation-wise:

- Layer B is **per-learner data** and should be persisted separately (database, files, …).
- The current React app keeps a single in-memory `mastery` map as a prototype of this layer.

### 10.3 Layer C – LLM-/MCP-Integration

Layer C connects the competence graph and learner states to **LLM-based agents**.
The intended architecture:

- An MCP server (or a set of servers) exposes:
  - **read access** to Layer A:
    - list of goals, neighborhood of a goal, themenfeld/phase filters, frontier computation primitives,
  - **read/write access** to Layer B:
    - get/set mastery for learner ℓ and goal g,
    - log that a task was attempted / solved,
    - derive learner-specific frontiers or summaries.
- MCP clients (e.g. ChatGPT with MCP support) connect to this server.  
  The LLM (e.g. GPT‑5.1) acts as:
  - navigator on the competence graph (“Welche Ziele passen als nächstes?”),
  - didactic assistant (Erklärungen, Aufgaben, Reflexionsfragen),
  - broker between learners/teachers and the underlying data.

Key principles for Layer C:

- The LLM **does not own the ground truth** about goals or mastery:
  - it always reads/writes via MCP tools/resources,
  - it respects `requires`/`contains` constraints coming from Layer A.
- The same MCP interface should be usable by:
  - conversational UIs (ChatGPT, Voice, …),
  - other services (z. B. automatische Übungsgeneratoren).

In the long run, multiple landscapes (different Fächer, Curricula, Sprachräume) can live in Layer A,  
while Layer B maintains separate mastery maps per learner and landscape,  
and Layer C provides a **unified, sprachbasiertes Interface** auf diese Strukturen.

### 10.4 File formats & persistence (PoC conventions)

To keep the architecture transparent and repo-friendly, we use simple JSON files during the PoC:

- **Layer A (landscapes)**
  - Stored under `landscapes/<landscapeId>.<locale>.json`.
  - Generated from the TypeScript source via `npm run export:landscape` (see `scripts/exportLandscape.ts`).
  - Fields follow `LearningLandscape` / `LearningGoal` in `src/landscapeTypes.ts`.
  - `shortKey` is an ASCII identifier derived from `id` and should be used for cross-layer references (Layer B/C).

- **Layer B (learner state)**
  - Stored under `learners/<learnerId>.json`.
  - Schema draft:
    ```json
    {
      "learnerId": "alice",
      "landscapeId": "hessen-math-upper-secondary",
      "mastery": {
        "math_go": 0.0,
        "e_rate_avg": 0.8
      },
      "meta": {
        "lastUpdated": "2025-03-01T12:00:00Z"
      }
    }
    ```
  - Mastery map keys in the **Runtime/API** use **UUIDs** (`goalId`).
  - In the **JSON persistence** (Layer A), we use `shortKey` for readability and stability across versions. The backend maps these to UUIDs at runtime.
  - During the PoC we can load/save these JSON files directly. Later they can move into a database or service, but the schema should remain stable so MCP tools/users can rely on it.

- **Layer C (MCP resources/tools)**
  - MCP resources should point to specific landscape or learner files (e.g. `resource:skillpilot/landscape?hessen-math-upper-secondary`).
  - MCP tools (`get_frontier`, `set_mastery`, etc.) should internally operate on the JSON schemas above. They should never assume a particular curriculum language; all metadata fields use US-English so other landscapes can be added with different locales (German, English, …).

These JSON conventions let us run the full SkillPilot proof-of-concept without additional infrastructure, and they keep the project open to future landscapes, languages and persistence layers.

---

## 11. SkillPilot ID and privacy model

SkillPilot is designed to work in school contexts but should also scale to **any subject, level and region**.  
To keep the architecture simple and privacy-friendly, we separate:

- **Curriculum data (Layer A)** – public, static landscapes,
- **Learner state (Layer B)** – per‑learner mastery and history,
- **Language models / tools (Layer C)** – stateless compute that only see what they need.

### 11.1 SkillPilot ID – pseudonymous learner key

The SkillPilot server should treat every learner as a **pseudonymous profile** identified only by a server-generated key:

- `skillpilotId` – random, opaque token (e.g. 128‑bit, URL‑safe string).
- The server stores for each `skillpilotId`:
  - the learner’s mastery map per landscape,
  - optional history and technical metadata (`createdAt`, `lastUpdated`),
  - but **no personally identifying information** (no real name, no e‑mail, no school IDs).

Guiding principle:

- The competence graph knows only **“learner X with skillpilotId …”**, not who that person is in the real world.

### 11.2 What lives where?

**Server-side (SkillPilot backend)**

- Stores:
  - landscapes (`landscapes/*.json`) – public curriculum-level descriptions,
  - learner state per `skillpilotId` – pseudonymous mastery and history.
- Does **not** store:
  - names, nicknames, e‑mails, or other PII.

**Language model / Trainer GPT**

- May ask for:
  - a *nickname* to address the learner in the conversation,
  - the `skillpilotId` to access their state via tools.
- For all tool/API calls, the GPT must use **only the `skillpilotId`** (or a parameter clearly documented as such), never the nickname or other PII.

**User-local (browser / ChatGPT UI)**

- The learner is responsible for:
  - keeping their `skillpilotId` somewhere safe (e.g. in the browser, a notes file),
  - deciding which nickname they share with the GPT or teacher.
- Local frontends (web GUI, notebooks, etc.) may:
  - store the `skillpilotId` in local storage or cookies,
  - remember additional preferences or display names **locally only**.

### 11.3 API / Tools conventions

When designing tools (MCP or OpenAPI) on top of this model:

- Use parameters like `skillpilotId` (or clearly document that `learnerId` is a pseudonymous SkillPilot ID).
- Document explicitly:
  - “This parameter must be an opaque SkillPilot ID, never a name or e‑mail.”
- Typical endpoints:
  - `POST /learners` → returns a new `skillpilotId` (optional `topic` for smart init),
  - `GET /learners/{skillpilotId}/state` → returns unified state (Curriculum + Frontier + Goals),
  - `PUT /learners/{skillpilotId}/mastery` → updates mastery and returns **new frontier** immediately,
  - `POST /learners/{skillpilotId}/scope` → sets focus (e.g. "Stochastik") and updates planned goals.

LLM/trainer prompts should reinforce that:

- Nicknames are for **conversation only**.
- All persistence and tools operate exclusively on the `skillpilotId`.

---

## 12. AI Agent Integration (Gemini & ChatGPT)

SkillPilot provides an **Optimized OpenAPI Specification** designed specifically for LLM Agents.

### 12.1 Key Features for AI
- **Smart Initialization:** Agents can call `createLearner(topic="Math")` to auto-select the right curriculum.
- **Unified State:** `getLearnerState` returns everything the agent needs (Curriculum info, Rich Frontier, Planned Goals) in one call, reducing token usage and latency.
- **Rich Frontier:** The frontier response includes goal titles, descriptions, and types, so the agent doesn't need to look them up separately.
- **Immediate Feedback:** `upsertMastery` returns the *new* frontier immediately, allowing for a tight "Teach -> Assess -> Next Step" loop.

### 12.2 Setup Guides
- **Google Gemini:** See `ai/gem/gemini.md` for system instructions and setup steps.
- **ChatGPT:** See `ai/gpt/gpt.md` for GPT configuration.
- **OpenAPI Spec:** Use `ai/skillpilot-api-4ai.json` for the tool definition.
