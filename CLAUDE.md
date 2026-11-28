# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**`AGENTS.md` is the authoritative long-term memory** (concepts, policies, dated
Product Owner decisions); this file only adds the practical cornerstones needed
to work in the repo. If the two ever disagree, `AGENTS.md` wins — and update
both.

`AGENTS.md` is ~2,000 lines, so read the section you need instead of the whole
file: §0 provider/release decisions (dated log), §2 graph model and Personal
Curriculum, §3 `Goal` fields, §4 mastery, §5 frontier, §7 conventions for new
goals, §10 layers A/B/C, §11 ID and privacy, §12 AI adapters.

**Binding learning rule (23 November 2026).** After Personal Curriculum setup,
every learning step must be possible in coach chat with zero required Cockpit
visits. Autopilot determines only who chooses the next frontier goal. With it
off the learner chooses in chat. With it on the backend chooses and the coach
continues in chat. See the opening product decision in `AGENTS.md`.

**Card memorization (23 November 2026, issue #85).** Cards are not graph
goals. A card enters the learner's box only when its understanding goals
(card field `originGoalIds`) in the Personal Curriculum are passed or credited,
and it leaves the box for good once it is passed in Verified Recall. The cards
of a unit are the cards of its atomic goals; the deck goal stays derived from
its cards. The backend sets the card step in coach chat and decides release;
neither the coach nor the Cockpit does. Card state is one row per learner,
deck goal and card (`learner_card_state`). See the product decision on card
memorization at the top of `AGENTS.md`, §7.2 and §13.

**Current execution mandate (15 November 2026):** agents own the resolution
and implementation of the model, stage-plan and pedagogical findings in
`docs/dev/stage-plan-units-handover-2026-11-15.md`; the Product Owner reviews
concrete results. Its earlier owner-approval reservations do not block the
delegated work. Use primary-source and didactic research, appropriate atomic
goals and real assessment coverage; preserve all quality floors, immutable
evidence and learner-result contracts. Deliver to `main` with fresh successful
CI, including #153 and #156 after their checks pass. Keep PRs few and
intermediate; delegate suitable work to GPT 6.1 Sol Ultra. See the opening
mandate in `AGENTS.md` for the exact scope.

Maintain `docs/dev/stage-plan-management-summary.md` after each implementation
package, with date, local time and timezone, K1–K13/F1–F7 progress, decisions,
inspection links and actual evidence. An open entry links its PR; completion
requires the integrated implementation commit and fresh successful main CI.
A small documentation-only completion commit or short PR is allowed afterwards.

The confirmed November contracts in the bilingual Graph Definition are the
binding target norm for shared Land/duration plans and E1–E4. The separately
marked unit-assessment proposal of 19 November is pending adoption; it does not
replace the applicable recognition formulas or R1–R5 in §13. Distinguish source assignment from learning placement: `after`
orders units but adds no prerequisite, mastery or atomic-frontier lock. Keep
the existing compatibility runtime explicit; the later unit migration and
runtime work F8–F13 are separate from the current K1–K13/F1–F7 delivery.

For the Hessian E.1 pilot the Product Owner decided on **20 November 2026**
that four matching A–D passes complete the explicitly chosen unit assignment.
Follow the backend's next step for each other explicit assignment. Individually
open goals remain available for voluntary study. A historical part pass lacking the review binding still
counts for that part. Explain its missing planning credit when the backend
reports it. After A–D, give precedence to a separate due assignment. Otherwise
offer voluntary individual study within E.1 when the learner asks to continue.
The additional horizontal-throw exam remains voluntary. The pilot defaults to off.
E.1 awaits pedagogical acceptance.

**21 November 2026.** With the pilot enabled, new and existing atomic plans
apply the section's assessment policy to goals included by a section selection.
Since the E.1 cut the older GK example contributes 20 E.1 positions in the
Sek II view (19 in the cross-stage view), or one more when the voluntary
horizontal-throw exam was also selected explicitly. This holds even if older
overlapping blocks stored the exam only once. Use the backend's effective
plan. Stored selections, receipts and individual mastery are preserved. With
the pilot disabled the stored lists apply.

**E.1 cut (23 and 24 November 2026).** E.1 has four child structures in
learning order; only "Freier Fall schwerer Kugeln" is a declared unit with its
own opening. Reference frames and the velocity vector of the throw belong to
E.3, road traffic follows friction in E.2. Voluntary E.1 exams are the
horizontal-throw exam and the own task with two free-fall series; the
multiphase exam is retired until an edition passes independent review. The
horizontal-throw exam has a revised edition with its own id since 24 November;
passes of the earlier edition never count for it. The mixed exam
"Bewegungsanalyse und freier Fall" is retired for all Länder since
25 November; the E.1 parent names no closing exam. Parts A–D remain, as the
unit assignment with the pilot on and as ordinary exams otherwise. The
planning release credits only the accelerated-motion goal from part D. See
the E.1 cut in [AGENTS.md §2.4](AGENTS.md#24-recursive-learning-units).

**E.2 cut (24 and 25 November 2026).** E.2 has six child structures in
learning order in the eight Hessian views: inertia; force, mass and
acceleration; force and counterforce; several forces at once; energy;
momentum and collisions. They are view structures, not declared units. The
gravitation goals lie in E.5. The move of the two Leistungskurs deepenings to
the Qualifikationsphase waits for the E.5 review. In Hesse the incline with
trigonometry and the friction coefficient with its sticking limit are a
deepening outside the mandatory scope of the fourth child with their own
check (to be offered as an elective extension, decision of 27 November
2026); its mandatory
closing check uses the balance of forces on a line (decision of 25 November
2026 for the second step). Part 1 of that step added three momentum goals
(individual and total momentum, mean resultant force, and for the
Leistungskurs the instantaneous force from a momentum-time diagram), narrowed
Newton's second axiom to F = m·a for constant mass and stated the conditions
of conservation of momentum exactly. A goal is a target only where the Land's
official text carries it. Two short tasks of SkillPilot's own close the
lower-stage routes in Hamburg, Thuringia and Baden-Württemberg; a new
lower-stage target always needs its closing route planned with it. Part 2
(26 November) added the derivation of the kinetic-energy formula from the work
of a constant resultant force, a target with its own task in the eight
Hessian, four Saarland and two Saxon Leistungskurs views and absent elsewhere.
It corrected three prerequisites: potential energy no longer requires kinetic
energy, three goals that use kinetic energy require it directly, and
conservation of momentum no longer requires the application of Newton's second
axiom. Part 3 (26 November) added two goals with a task each: the balance of
forces on a line (`6ba20688`, a target with its task in 61 views of 13 Länder,
a preparation in 20, and in Hesse the mandatory closing check of the fourth
child) and the graphical resolution of the weight on an incline (`77b44d13`,
a target with its task in 18 views of five Länder, absent in Hesse). The
incline with sine and cosine and sticking and sliding with the normal force
wait as reviewed candidates outside the catalog for the elective extensions
of the personalization (decision of 27 November 2026). A new
task, its solution and the cards of its goal are read against
`knowledge-context --full` before they are sealed. See the
E.2 cut in [AGENTS.md §2.4](AGENTS.md#24-recursive-learning-units).

**Product Owner decisions of 26 November 2026.** A plan that cannot be
evaluated defines no exam scope: ordinary learning stays open and the plan
remains visible as outdated (issue #205; the frontier and the plan service
apply one test, see `AGENTS.md` §10.2). A goal without an official witness of a Land is no regular target
there; it is a preparation where an official target needs it, and otherwise
belongs to an elective extension (decision of 27 November 2026 below); until
that exists it stays where it is. Correct tracing to the official
sources is mandatory for all subjects in the long run, with a sense of
proportion: granularity is free, a single requirement may be declined with a
recorded and visible reason, and other work continues meanwhile; until a rule
with its gate exists, `CQR-003` is unchanged and no pin is lowered. The
Mathematics vector ladder with a stage for the calculation rules gets an
independent node review before any catalog change. The third role "voluntary
offer" decided that day was withdrawn on 27 November 2026. Also decided and not
built yet: the source-tracing rule (one recorded decision per official
requirement: carried, carried by a cross-cutting goal, or declined with a
reviewed and visible reason; extractions marked literal or reworded; start
with Physics Lower Saxony); the rules stage 2b of the Mathematics vector
ladder (all eight rules of a vector space on displacements in the plane).
Built since: an explicitly named subject can be chosen in chat also with
AutoPilot during an exam (pull request #215); the other four stages of the
vector ladder with their tasks, cards and figures (V1, pull request #246),
each a regular target only in the Länder of its official witness, magnitude
and angle preparations only. Plan blocks with
several sections keep the outer opening first. See the product decisions of
26 November at the top of `AGENTS.md`.

**Strategy (Product Owner, 27 November 2026).** Providers: Claude now,
Claude and ChatGPT mid term, local AI on the learner's own machine long term;
no work on Gemini; the coach's logic belongs in the server, not in a plugin.
Complexity must go down. Content: Physics and Mathematics first, Hesse first
and there the upper stage first; then one further Land as a cost probe, then
all Länder, Chemistry, Biology. The work on Hesse is never paused. Early and
done properly: MIT 18.06 Linear Algebra, set up anew with units, in English,
its first complete unit being the first piece for the trial with learners
(MIT OpenCourseWare is CC BY-NC-SA 4.0: link, never copy; own wording;
"aligned with"). Automated scenario tests of plugin and backend with cheap
models, nightly and at low cost, are decided and not built. See the strategy
at the top of `AGENTS.md`.

**Focus and less complexity (Product Owner, 27 November 2026).** The focus
is Mathematics and Physics for Hesse, lower and upper stage; Chemistry and
Biology follow quickly to the same level, so every method must be repeatable
for them at low cost; the other subjects and Länder are kept without new
work. Decided and not built yet: only the checks of the focus block a pull
request (target under 15 minutes), the rest runs nightly as a report and may
lag behind; a quality card per unit with seven questions (source, scope,
graph, unit, human acceptance, trial with learners, path in chat) replaces
the maturity ladder in the focus. Until that exists the present gates and
floors apply unchanged. Prefer the smaller solution: each package says what
it removes, a new concept is tried on a small example with numbers first, at
most one independent review round. Nothing is deleted and no gate stops
blocking before the Product Owner has seen the concrete list. The trial with
learners runs with Claude and adults first; SkillPilot operates no chat of
its own and calls no paid model API (funding and frontends; the Claude app
on the phone works well), so the lane for learners under 18 is ChatGPT later
and the gap below its age limit is open; the first conversion of the source
tracing is Hesse. See the decisions at the top of `AGENTS.md`.

**No voluntary role; personalization with a base and extensions (Product
Owner, 27 November 2026).** A learner sets a goal and then does everything
necessary for it, so after personalization nothing is voluntary. A goal or
task in a view is a regular target or a preparation, nothing else; never
place, build or mark anything as "voluntary" in a view, a plan or the coach.
Choices belong into the Personal Curriculum: a base that every learner of the
scope gets, and elective extensions on top (his model: Bavaria). A selected
extension is regular in every respect, with its prerequisites; an extension
that is not selected is not part of the curriculum. This is meant for the
elective parts of the official curricula, which the views treat as mandatory
targets today (41 blocks in 46 views), and for SkillPilot's own deepenings.
The learner states what the course covers and may select more than the
official minimum; a new learner adds extensions, nothing is preselected
beyond a required minimum, and the personalization always offers "minimum"
and "maximum" beside the individual selection; a learner who exists keeps the
present scope. Model: a section of a view is declared an extension with its
origin, extensions form election groups with the official rule, the selection
is a step of the guided personalization stored per subject in the Personal
Curriculum, and goals of an unselected extension come in as preparations
where the scope requires them. Extensions are marked in the tree and progress
has one number. Quality gates read the whole authored view. Hesse Physics is
first. Stage 1 is built (pull request #242): view format 1.3 declares
extensions and election groups, the subject entry carries
`extensionSelection` (absent keeps the old scope, `[]` "Basis" leaves every
extension out, `"maximum"` "Alles"), a group with a positive minimum is
refused until the choice within a group exists, and a catalog check refuses
every real view with extensions until the Cockpit tree and map read
learner-filtered views; every scope is unchanged. The Hessian declarations
and the package transport (E1b) wait for the Product Owner. The earlier
format 1.3 with `voluntary` (pull request #221, package format 1.4) was
reverted unused. Decided for Hessian E.1, to be migrated only with
the new personalization: the two measurement tasks `f41e4e30` and `c6e2942d`
become an extension, the second exam on the horizontal throw `bcc56921`
leaves the learning path; until then the section assessment policy applies.
"Voluntary study" of credited regular goals after a completed unit assignment
is a different thing and stays. A probe on the real projection showed that
the graph decides the base (goals of removed blocks stay necessary where
later goals require them) and that tasks of the base requiring extension
content, the card release for an empty counted set and the champion totals
need rules of their own. Note for later, no work order: besides the
curricula, the Abitur exams actually held are a second norm for scope and
level. See the decision at the top of `AGENTS.md`.

**Section selection of a plan (26 November 2026, issue #216).** A learning
plan belongs to one subject. The complete selection of a section is the
subject's own goals under it; a goal of another subject that has its learning
place there (a Mathematics preparation in a Physics section) belongs to the
plan of its own subject and is left out, instead of refusing the section. A
focus that is no section of the plan's subject is still refused when it holds
a goal of another subject. Such a section asks for the subject of its view:
the exam of another subject's plan does not bind it, and the other subject's
goal under it stays bound by its own subject's plans, for the offer and the
write. See `AGENTS.md` §2.4.

**Arrows of directed quantities (25 November 2026).** An arrow for force,
velocity, momentum or field strength in a sketch of position space is a
property of the point it sits at, in a space of its own. Every Physics goal
text, image, card and task that draws or reads such an arrow follows the
criterion: the arrow starts at its body or point, its length has its own scale
in the unit of the quantity (named in a legend), its tip marks no place, and
only arrows of the same quantity with the same reference (the same body, the
same point of a field or the same named system) are added. The explicit early
Physics goal "Pfeile für gerichtete Größen lesen und zeichnen" (`b77a7e93`)
with its closing task is in the catalog since 26 November 2026: a regular
target in 45 views (14 Länder and three national views), SkillPilot's own
preparation in the other 45 (Hesse, Baden-Württemberg and every view that
holds only the upper stage), required directly by four goals and fourteen
tasks. The texts of the other goals that introduce a new kind of arrow and 88
open images follow in package A3 of
`docs/dev/directed-quantity-arrows-plan-2026-11-25.md`. See the product
decision at the top of `AGENTS.md`.

**Product Owner decisions of 24 November 2026.** A stored plan that still
names a retired goal (an atomic goal marked
`extendedData.applicabilityProjection = "excluded"`) stays valid as long as
the rest of it works: the backend reads it without that entry and keeps the
stored blocks, receipts and mastery unchanged. New plans cannot select a
retired goal. Since 25 November the same holds after a regrouping: an existing
plan keeps the goals it captured when a cut moved them to another section
(read, backup restore, edit), and a backup whose plan names a retired goal
restores without that entry. A backup also restores the learning results when
a plan it holds cannot be read today; that plan is kept as the backup held it
and stored as outdated (`LearnerLearningPlan.RESTORED_OUTDATED_CURRICULUM_ID`)
until the learner saves it anew. Readers of stored plans handle the client
error of a goal resolution that no longer works; a transactional read method
whose client error a caller handles must not mark that caller's transaction
for rollback (`noRollbackFor`, or return the outcome). A kept goal stays only in a block that names the
same sections as the block it was captured in, and the backend still offers it
as planned work under the goal's own focus (plan view, continuation, handoff);
a newly selected goal, and a block with other sections, must satisfy the
ordinary rule that the goal lies under its section. An ordinary goal in progress
that a regrouping moves out of the focused section stays in progress for
teaching and completion; the chosen focus (Cockpit, storage, backup) is
unchanged. Pass marks must be achievable for a learner who has understood
everything and makes occasional small formal errors: a new or revised graded
assessment has a pass mark of at most 85 percent of its points
(`scripts/check_exam_pass_marks.py`), and indispensable performances are
protected by their weight, never by a mark near the maximum. The 85 percent
is derived from the accepted Hessian parts A to D; he confirmed the bound on
25 November 2026.

The learner-facing Cockpit tree and graphical map should share one unit and
atomic-goal hierarchy in the same scope. Present an atomic goal directly
when a presentation group would merely wrap it. Keep its assessed identity,
actions and prerequisite context. The hierarchy is distinct from requirement
arrows and links to materials. The map covers Mathematics and Physics of the
Gymnasium and, since 27 November 2026, every course that states complete unit
coverage (`learningUnitCoverage: "complete"`) and whose delivered atomic goals
each have exactly one owning learning unit, first Linear Algebra; no list of
subjects is extended for a new course. A course under a composition view does
not qualify yet. Nested declared units and card practice for a course deck in
the Cockpit are open (issue #234). The learner tree places visible prerequisites and authored unit steps before their successors, including within nested units. Independent siblings retain a stable order.

Across subjects and pilot settings, green checks identify the learner's own
successful goal evidence. The same checks in gray identify evidence-backed
indirect credit. A goal without evidence keeps the open or active mark,
including when the current assignment can finish without it. Show section
certification separately from individual goal progress. Experimental content
is regular learning. Offer a feasible investigation at home or suitable data
the learner can investigate in chat, and attribute only their own performance.

Composition source format `1.2` supports explicit partial sibling order through
`structure.childOrder.after` (`{unit, after}` pairs of direct structure children).
An empty list declares no additional child order; actual atomic demand still
applies. Absence retains legacy sibling order.
Checked stage-plan bindings take priority. Preserve reachability through filtered
children and reject invalid or redundant order edges. This does not change
prerequisites, learner scope, frontier, mastery or task access; an older package
format must not silently discard it. See AGENTS.md §2.4 and
`contracts/composition-view/v1.2/composition-view.schema.json`.
Authored order must satisfy E3 for the actual cross-unit demand. Neither a
display-order chain nor a blanket empty declaration replaces this check;
incoherent groupings require repair before whole-unit sequencing is declared.

An explicit nested atomic `goalEntry` with `projectionRole: prerequisiteOnly`
and `acquisitionPlacement: true` retains a learning-place template. Materialize
it only for an otherwise unplaced atom already in the backend's closed learning
basis. Prefer an explicit own-subject place over a foreign-subject fallback,
and validate timing against actual combined-map demand. Unmarked support
references do not imply acquisition placement; this
flag never changes seeds, prerequisites, mastery or public-view visibility.

## What SkillPilot is

Open-source learning platform that models curricula as **skill graphs** (DAG of
learning goals) and drives AI learning coaches through MCP. The ordinary
learning start ("Lernen starten") offers Claude, ChatGPT Desktop (Beta) and
Gemini (Beta) as isolated provider lanes over the same saved learning record.
Three layers, kept strictly separate:

- **A – Landscape** (public, static JSON under `curricula/`): goals with
  `contains` (hierarchy) and `requires` (prerequisites). Must stay acyclic.
- **B – Learner state** (backend/PostgreSQL, per pseudonymous `skillpilotId`):
  mastery, focus, active goal, learning plans. Persisted goal results are the
  only source of progress.
- **C – AI adapters** (MCP/OAuth): the LLM never owns ground truth; backend
  decides, validates, persists and returns the next action.

## Repository map

| Path | Content |
|---|---|
| `app/` | React + TypeScript + Vite frontend (Cockpit, Workbench, trainer views) plus ~all curriculum/QA/docs tooling as `tsx` scripts in `app/scripts/` (500+ files, wired up as ~270 npm scripts in `app/package.json`) |
| `backend/` | Spring Boot 4.1 / Java 25 (Corretto, pinned via `.java-version`/`.corretto-version`), Gradle. Package `com.skillpilot.backend` (`openai/`, `claude/`, `connectors/{claude,gemini}/`, `oauth/`, `mcp/`, `service/`, `landscape/`, `composition/`, `completion/`, …). Serves the built frontend from `src/main/resources/static` |
| `curricula/` | Layer-A data. `curriculum_manifest.json` lists roots. Canonical German Gymnasium subjects: `curricula/DE/Gymnasium/canonical/`; retained state sources: `curricula/DE/Gymnasium/input/<STATE>/`; QA ledgers: `curricula/DE/Gymnasium/quality/`; memory decks: `curricula/DE/Gymnasium/memory-decks/`; images: `curricula/DE/Gymnasium/visualizations/` |
| `ai/claude/` | Claude connector v1 (`mcp-claude-v1.skillpilot.com`), MCP Apps resources, plugin, marketplace, MCP regression |
| `ai/openai plugin/`, `ai/openai candidates/`, `ai/openai-marketplace/`, `ai/openai app/` | OpenAI lane: plugin sources (`skillpilot-coach-v1` and its permanent successor identity `skillpilot-coach`), local release candidates, Git-marketplace beta mirror, MCP Apps prototype |
| `ai/gemini/` | Gemini lane: coach Skill, operator gateway, PoC (backend adapter `gemini-v1`) |
| `ai/openai custom gpt/` | Isolated legacy Custom GPT channel (frozen historical baseline) |
| `contracts/` | Versioned/published contracts and release evidence — published snapshots are immutable |
| `content/` | Optional external learning-material packages (link-only, never a dependency of canonical goals) |
| `scripts/` | Python/Node release checks, exam-bank builders, asset deployment |
| `docs/` | MkDocs site (`mkdocs.yml`, published to `enpasos.github.io/skillpilot`): `concept/`, `dev/`, `deploy/`, `qa-ci/` |
| `tmp/` | Scratch space for temporary files, logs, one-off scripts — **never write transient files to the repo root** |

**Search hygiene:** `tmp/` holds hundreds of GB, including nested repository
checkouts with their own `CLAUDE.md`/`AGENTS.md` copies; `site/` is the built
docs site. Scope every search to a concrete directory (`app/`, `backend/src`,
`curricula/…`, `docs/…`) — never grep or `find` from the repo root.

## Toolchain & commands

Node from `.nvmrc` (20.x), Java 25.0.2 Corretto, Python 3.11.

```bash
# Full required CI (application + curriculum) — run before committing cross-cutting changes
./run_ci.sh              # suites: all | application | curriculum | package | owl | full
                         # package: package/provisioning/consumer changes; owl: FWU-OWL/roundtrip changes

# Frontend
npm --prefix app run dev
npm --prefix app run build            # prepares runtime assets, goal books, tsc, vite
npm --prefix app run lint
npm --prefix app run test:<name>      # many focused suites, no aggregate `test` script;
                                      # each is a plain `tsx` file: (cd app && npx tsx scripts/<file>.ts)

# Curriculum validation / QA
npm --prefix app run validate:graph
npm --prefix app run validate:composition-views
npm --prefix app run check:transitive-minimality
npm --prefix app run validate:learning-units            # learning units in the canonical landscapes (R1, R3, R4)
npm --prefix app run check:learning-unit-assessments    # unit assessments in the catalog equal their source files
npm --prefix app run check:memory-deck-origins          # card `originGoalIds` equal the kept card-review records
npm --prefix app run quality:memory-card-review:check:all   # card reviews, incl. the deck field against the ledgers
npm --prefix app run knowledge-context -- <goalId> [--full]   # what a learner can be assumed to know at a goal (AGENTS.md §2.5)
npm --prefix app run quality:curriculum-status          # regenerate status
npm --prefix app run quality:curriculum-status:check    # + maturity-floor gate
python3 scripts/validate_schemas.py

# Backend (bootRun needs PostgreSQL; Liquibase migrates on startup — see backend/README.md)
cd backend && ./gradlew bootRun
cd backend && ./gradlew test --tests '<ClassName>'
cd backend && ./gradlew clean check

# Documentation-only changes: the five docs checks are much faster than run_ci.sh
npm --prefix app run check:docs-links
npm --prefix app run check:docs-indexes
npm --prefix app run check:terminology
npm --prefix app run check:generated-doc-notices
npm --prefix app run check:generated-status-registry
npm --prefix app run docs:skill-graph:web     # regenerate Graph Definition web pages + .tex (stdlib only, fast)
npm --prefix app run docs:skill-graph:full    # + diagrams and DE/EN PDFs (LuaLaTeX, Matplotlib)
pip install -r requirements-docs.txt && mkdocs build

# Release/review checks
node scripts/check_openai_plugin_review_freeze.mjs
node scripts/check_claude_plugin_v1_release.mjs

# Preliminary check: Claude plugin in headless Claude Code against a local backend (Opus 5.5).
# Not the required test through Claude's web interface; see docs/qa-ci/claude-plugin-e2e.md
node --test scripts/claude_plugin_e2e.test.mjs && node scripts/claude_plugin_e2e.mjs check   # free
node scripts/claude_plugin_e2e.mjs backend start    # own schema and port 18080
node scripts/claude_plugin_e2e.mjs run              # model calls; report under tmp/claude-plugin-e2e/runs/
node scripts/claude_plugin_e2e.mjs backend stop

# Required test (gate automated-coach-web-ui-e2e): the coach through Claude's web interface.
# A browser agent on Windows (Claude in Chrome) operates claude.ai; synthetic learners on
# production, deleted again. See docs/qa-ci/claude-coach-web-e2e.md
node --test scripts/claude_coach_web_e2e.test.mjs && node scripts/claude_coach_web_e2e.mjs check   # free
node scripts/claude_coach_web_e2e.mjs run          # needs the one-time setup on Windows and a person at the computer
# While a run is in progress nobody deploys, switches the checkout's branch or changes
# the files the run binds; its agent says "deploy ok" at the end (AGENTS.md §9).
```

Commits follow Conventional Commits where a scope is meaningful
(`fix(openai): …`); branch off `main` and open pull requests against `main`.

Remote CI (`.github/workflows/ci.yml`) has two tiers: a draft PR gets only the
quick tier; marking it ready for review, or pushing to `main`, runs the
complete check as parallel jobs. Details: `docs/qa-ci/ci.md`. "Optional
Package CI" (`.github/workflows/owl-ci.yml`) belongs to no pull request: it
runs weekly and by hand. Before work on the view, package or export contract
read its last runs and run `./run_ci.sh owl` and `./run_ci.sh package`
(issue #219).

## Non-negotiable invariants (details in AGENTS.md)

- **Graph**: no cycles in `requires`/`contains`; stable goal IDs; atomic goals
  are one assessable competence; descriptions "Die lernende Person kann …";
  no "Formelsammlung" wording; never blanket-convert `ae/oe/ue` to umlauts.
  Every mathematical expression in a learner-facing text is written in TeX
  between `$…$`, a displayed formula alone between two lines `$$` (Product
  Owner, 27 November 2026); no superscript or subscript characters, minus
  signs or bracket pieces that imitate typesetting. For courses built with
  units `scripts/check_course_formulas.py` and
  `npm --prefix app run test:course-formula-rendering` enforce it; for the
  Mathematics and Physics catalogs the check holds an upper bound that may
  only fall (`scripts/config/formula-typesetting-bounds.json`), and their
  conversion runs in batches (`AGENTS.md` §7).
  Target state: every authored `requires` connects two atomic goals, and the
  relation is transitively minimal. The 12 November 2026 decision requires a
  complete deterministic current-state check within milestone validation,
  including necessary foreign prerequisites; failed or incomplete checks cap
  the subject and all its scopes at M0. No historical migration-preservation
  proof is required for this target gate. Current CQR coverage is the canonical
  Gymnasium catalog; inherited QA review bindings remain separately checked.
  The 13 November 2026 decision grades `GD-*` rules against all 21 canonical
  Gymnasium roots, with higher obligations applying at their stated milestone.
  A bounded catalog is not itself a partial gate; every upgrade needs gate,
  count, and negative-test evidence. Runtime gaps remain explicit. Other
  landscapes and promotion of the eleven M0 curricula are outside this work;
  retained source bytes stay intact and live consumers need explicit validation.
  Frozen V9 review reuse is goal-scoped: unchanged goals keep their bound
  reviewed values, changed goals face strict current-input reviews. The proof
  history is not replayed after the freeze; see the immutable-evidence rule below.
- **Mastery**: one binary result (`0`/`1`) per atomic goal. Cluster and
  learning-unit progress is derived from atomic descendants; no completion
  ever writes mastery to children. Exams and memory goals always need their
  own explicit results.
  Guided entry starts at the chosen unit's own atomic orientation goal.
  Browsing is free. Guided content, exercise and card work follow confirmed
  orientation or valid planning credit. Direct assessment remains available.
  Direct entry into a child opens its own orientation (22 November decision).
  The unit-assessment design of 19 November is pending expert review and
  product adoption; confirmed recognition rules remain applicable. See
  [AGENTS.md §2.4](AGENTS.md#24-recursive-learning-units) for its status and
  the contracts applicable to implementation and QA.
- **Curriculum data is evidence-bound**: changes under `curricula/` stay
  traceable to the official source; never invent goals, edges or source claims.
- **Maturity floors**: after curriculum/description/route/view changes,
  regenerate curriculum-quality status and ensure no protected maturity (e.g.
  M6/M7) drops. The complete catalog and QA scope pins directly require each
  applicable rule to pass; base-policy comparison forbids lowering pins or
  existing visibility coverage. Raise pins with any maturity gain. G17 also
  runs directly in curriculum CI, including M0 entries. `CQR-104` remains
  explicitly limited to eight scopes; the four unconfigured Sek II scopes
  have unresolved evidence gaps. `CQR-102` covers all twelve scopes, but the
  stronger semantic `GVR-012` is required for Mathematics Sek I/Sek II,
  Biology Sek II and Physics Sek II (4/12). Five Physics Sek I and three
  Chemistry findings, plus six scopes without current ledgers, remain explicit.
  The shared factory adds only reviewed explicit Physics stage targets to
  the existing lanes; 43 additional inherited Sek II targets, 42 without
  terminal routes, remain separate alignment debt. This is not complete
  stage-target coverage. The Product
  Owner decided on **13 November 2026** that `GVR-012` shall become mandatory
  from subject maturity M7. Activation across that domain waits for the
  remaining evidence gaps: today four of seven M7 scopes are required and
  pass. The five M6 scopes stay in the twelve-scope inventory and join the
  mandatory domain on later promotion to M7. `HARD` requires complete M7
  enforcement, including future promotions; until then keep `PARTIAL`, all
  four required scopes and all pins. No immediate activation, floor reduction
  or inferred pass evidence. The twelve-scope audit remains diagnostic, not
  an M7 promotion check. Never turn a review
  queue green by bulk decisions. The frozen
  prerequisite-reduction registry (contract V9, `AGENTS.md` §2.2) keeps the
  reviews of 1,361 goals valid while each goal is unchanged; changing one of
  them needs a new review of that goal, other changes do not touch it. The
  registry and its parent are immutable evidence.
- **Privacy**: the permanent `skillpilotId` never reaches an AI provider. In
  every provider lane OAuth only authorizes the connection; the learner is
  resolved through that lane's own `learningSessionId` (created by "Lernen
  starten", absolute lifetime ≤ 24 h, never extended by OAuth refresh, never
  shared across providers). **No chat prose/feedback text flows into the
  backend** (no `workFeedback`-style fields in coach mutation inputs).
- **Backend authority**: frontier, active goal, mastery, Verified Recall,
  exam evaluation and plan status are backend-owned; deterministic workflow
  steps belong in the server, not in prompts.
- **Immutability**: never overwrite published releases, rejected 1.0.0
  history, content-addressed UI resources, or hash-bound evidence. Drafts live
  under `contracts/drafts/`. New review evidence stays small: no evidence file
  above 5 MiB and no evidence folder above 30 MiB without the approval of the
  agent who takes the package over; full inventory tables and logs stay
  outside the repository with their SHA-256 named (`AGENTS.md` §9).
- **Scope of authorization**: no publishing, deployment, portal writes,
  credential changes or `record-published` without explicit user instruction.
  Local tests are not real-host acceptance; owner-reported observations are
  not traces.
- **Provider work order**: Claude beta → stable candidate → focused ChatGPT
  host-integration acceptance → submission. The ChatGPT Desktop Git-marketplace
  beta and the permanent OpenAI plugin identity `skillpilot-coach` at
  `https://mcp-openai.skillpilot.com/mcp` are the explicitly authorized
  exceptions; no speculative ChatGPT-specific extensions. Read `AGENTS.md` §0
  before any provider or release work — it changes often.
- **Licensing**: Apache-2.0 for software, CC-BY-4.0 for own curriculum content
  (see `LICENSING.md`); never relicense third-party material.

## Documentation rules

Full rules: `docs/dev/documentation-guidelines.md`.

- English by default; German only for German-specific audiences (curriculum
  law, Bundesland rollout, learner-facing German text). Never mix languages
  in one document; bilingual pairs use `.de.md` / `.en.md` and stay aligned.
- **Generated files are never edited by hand.** They start with a "Generated
  artifact" notice naming the script; change the source and regenerate. New
  generated reports are registered in
  `app/scripts/generatedMarkdownNoticeRegistry.ts`.
- The bilingual **Graph Definition compendium** is single-sourced in
  `docs/concept/skill-graph/source/` and compiled by
  `docs/concept/skill-graph/build_spec.py`. The pages it emits
  (`graph-definition*.md`, `learning-units*.md`,
  `learning-unit-progression*.md`, `assessment-gated-completion*.md`,
  `context-and-views.*.md`, `planning-and-budget.*.md`,
  `compendium-appendix.*.md`, `docs/qa-ci/graph-definition-rule-milestone-matrix*.md`,
  the PDFs and diagrams `00`, `08`–`16`) are build outputs — edit the source
  chapters/JSON instead.
- A new durable document goes into its section `index.md` **and** `mkdocs.yml`;
  dated dossiers and generated reports go into the section index only.
- Terminology is enforced: one concept, one name (`check:terminology` names
  the replacement for retired wording).

## Key docs

- `docs/concept/runtime-workflows/provider-neutral-coach-boundary.md` — canonical ChatClient/backend contract
- `docs/concept/runtime-workflows/learning-workflow.md` — goal-type workflows
- `docs/concept/curriculum-quality-and-human-trial.md` — maturity levels M0–M7, human trial
- `docs/concept/skill-graph/` — goal system, composition views, learning units, assessment-gated completion, visualizations, goal books, packages; `knowledge-context.md` — what a learner can be assumed to know at a goal (concept, AGENTS.md §2.5)
- `docs/concept/didactic/unified-learning-plan-status.md` — learning-plan contract
- `docs/dev/mathematics-physics-learning-units-plan.md` — working plan for learning units (Mathematics, then Physics); units live in `programUnits`/`goalPlacements`, package contract `contracts/curriculum-package/v1.2/`
- `docs/dev/landscape-json-field-reference.md` — landscape JSON fields
- `docs/qa-ci/index.md` — QA lanes and CI rules for curriculum changes
- `docs/deploy/` — release runbooks (Claude connector, OpenAI plugin and Git beta, Gemini, OAuth); `claude-beta-chatgpt-release-strategy.md` for the work order
