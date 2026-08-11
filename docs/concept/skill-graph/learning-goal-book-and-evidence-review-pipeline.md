# Learning-Goal Book and Evidence-Review Pipeline

Status: normative target concept  
Initial scope: canonical German Gymnasium mathematics and physics  
Audience: curriculum authors, didactic reviewers, teachers, AI-review operators,
and runtime implementers

Implementation status (2026-08-10): Phase 0 and the nationwide mathematics
review-atlas slice are implemented. Closed contracts exist for evidence
profiles, review configuration, BookModel, render manifests, AI-review bundles,
AI runs, findings, and the public-feedback envelope. The deterministic renderer
has completed a real 754-page review edition covering the deduplicated union of
curricular-atomic Gymnasium mathematics targets from all 16 German states,
Sekundarstufe I and II. Every goal has exactly one physical PDF page. Exact
applicability remains state-first: G8/G9 and GK/LK are displayed only in their
bound jurisdiction, stage, and profile tuples and are never inferred as global
goal properties. The same digest-bound reviewer edition is shipped by the
regular repository build as a coreless, read-only `/lernzielbuch` preview with
chapter navigation, search, stable goal deep links, state-bound scope filters,
and PDF download. The reserved `/lernziel-feedback` target is currently a
clearly labelled, non-writing pilot placeholder. The representation-choice
profile is deliberately still an
`ai_candidate` with `needs_human_review`; no independent multi-provider review
or human approval is claimed. Public feedback links and their version-bound
privacy-minimized envelope are prepared, but the moderated production intake
is a later phase. Coach runtime and Mastery behavior remain unchanged.

## 1. Purpose

SkillPilot needs a review and publication path that makes every learning goal
easy to inspect without overloading its learner-facing wording. The path has two
products built from the same canonical state:

1. a navigable learning-goal book, published as HTML and PDF; and
2. a structured, fingerprint-bound evidence profile for every reviewed atomic
   goal.

The book makes the graph legible to people and review models. The evidence
profile states what must actually be understood, which misconceptions and
representation cues are dangerous, and what would or would not count as
evidence of mastery. Neither product replaces the canonical goal graph.

The first rollout uses a fast, reproducible multi-AI review loop as the primary
development engine. A public feedback channel is installed early but is treated
as a slow signal and challenge channel, not as a release dependency or a source
of automatic curriculum mutations.

## 2. Binding decisions

The following decisions are invariants of this concept:

1. Canonical goal `title` and `description` remain concise and learner-facing.
   Detailed didactic and assessment guidance belongs in a separate evidence
   profile.
2. Every evidence profile is bound to the exact semantic fingerprint of its
   goal and to the review inputs that could bias or invalidate it.
3. HTML and PDF are rendered from one shared, deterministic `BookModel`. They
   must never build their own ordering or relationship projections.
4. In the initial edition, every included ordinary technical atomic target goal
   has exactly one goal page. A goal never shares a page with another goal and
   never continues onto a second page. Cluster, memory, orientation,
   practice/assessment, exam, and runtime-support nodes need separate later
   edition contracts and are not silently mixed into this book.
5. Every goal page shows the full canonical goal identifier under the
   unambiguous label **Lernziel-ID**.
6. `contains` supplies chapter and topic context. `requires` supplies the hard
   ordering constraints.
7. Direct prerequisites and direct reverse prerequisites are clickable. PDF
   navigation uses stable named destinations, not guessed page numbers.
8. A page that does not fit its fixed template makes the build fail. Text may
   not be clipped, silently omitted, continued on another page, or shrunk below
   the approved minimum sizes.
9. Books, review bundles, logs, links, and feedback envelopes contain no learner
   state and no permanent learner or SkillPilot ID. A Lernziel-ID identifies a
   public curriculum goal, never a person.
10. AI findings and public feedback can create review candidates or blockers,
    but cannot modify canonical goals, approved profiles, or runtime behavior
    automatically.
11. A finding may be generalized only through the evidence- and scope gates in
    this document. Repetition of an opinion is not independent evidence.
12. Evidence profiles do not enter the learning-coach runtime or Mastery write
    path during the book and review-pipeline rollout. Runtime enforcement is a
    later, separately gated phase.
13. A nationwide subject atlas is a deduplicated union of explicitly bound,
    reviewed learner-facing projections. A canonical goal receives exactly one
    page regardless of how many jurisdictions, duration models, stages, or
    course profiles include it.
14. Applicability is represented as exact, state-primary tuples. `G8` and `G9`
    never form an independent nationwide label or filter; they are meaningful
    only together with the Bundesland whose reviewed policy supplies that
    duration model. The generator must not create Cartesian combinations from
    independently collected states, stages, duration models, and course
    profiles.

## 3. Source-of-truth boundaries

### 3.1 Canonical graph

The canonical landscape and its separately reviewed semantic-kind ledger remain
authoritative for:

- the stable goal ID;
- title and concise learner-facing description;
- `contains` and `requires`;
- semantic kind and other canonical goal metadata; and
- canonical resource links, including reviewed visualizations.

The book generator must not repair, reinterpret, or enrich missing graph
semantics while rendering. Broken references, cycles, duplicate projected
occurrences, or unresolved identifiers fail before publication.

For a nationwide atlas, learner-facing applicability has a separate source of
truth: membership as `target` in the explicitly enumerated effective
composition views, combined with the reviewed Gymnasium duration-model policy.
The broad canonical `goal.applicability` field is useful provenance and a
conservative outer bound, but it is not precise enough to print or filter the
final Bundesland/G8/G9/GK/LK matrix. Changes to any bound projection or to the
duration policy make the generated atlas stale.

### 3.2 Evidence profiles

Evidence profiles are separate curriculum-quality artifacts. They explain the
competence more precisely without turning the ordinary goal description into a
large prompt. A profile may contain:

- independently checkable facets of understanding;
- required coverage across those facets;
- common misconceptions and plausible shallow answers;
- relevant variation axes and contrasting cases;
- assistance, cues, repetitions, or copied wording that do not count as
  independent evidence;
- teaching-case blueprints;
- mastery-check blueprints; and
- the minimum number and independence requirements of checks.

The canonical description may be improved when a review demonstrates real
ambiguity. It must nevertheless remain short enough to be understandable in the
normal learner UI. Detailed examples, rubrics, failure modes, and review
arguments stay in the evidence profile.

### 3.3 Generated publications

HTML, PDF, manifests, indexes, and AI-review bundles are generated views over a
versioned canonical graph and the current review artifacts. BookModel,
ordering, page ownership, relationships, and semantic manifests are
deterministic. Browser-generated PDF bytes may contain tool metadata such as a
creation timestamp; therefore the exact PDF is hash-bound per review bundle,
while reproducibility is judged from the deterministic model and validated
page/link parity rather than from a frozen PDF hash alone. Generated artifacts
are not edited by hand and are not a second source of truth.

## 4. Evidence-profile contract

### 4.1 Conceptual record

The initial record has the following conceptual shape. The closed implemented
contract is
`contracts/goal-evidence/v1/goal-evidence-profile.schema.json`; bounded
operational fields must preserve these semantics:

```json
{
  "schemaVersion": 1,
  "reviewId": "<review scope ID>",
  "ruleVersion": "goal-evidence-v1",
  "landscapeId": "<canonical landscape ID>",
  "goalId": "<full canonical goal ID>",
  "goalFingerprint": "sha256:<normalized semantic goal fields>",
  "reviewInputFingerprint": "sha256:<goal, relations and reviewed resources>",
  "profileFingerprint": "sha256:<normalized evidence profile>",
  "status": "needs_human_review|approved|rejected",
  "reviewAuthority": "ai_candidate|human",
  "evidenceLevel": "E0|E1|E2|E3|E4|E5",
  "maximumClaimScope": "G0|G1|G2|G3|G4",
  "reviewRunIds": [],
  "dissent": [],
  "profile": {
    "archetype": "concept|procedure|representation|modeling|proof|experiment|data",
    "facets": [
      {
        "id": "<stable profile-local ID>",
        "criterionDe": "<observable aspect of understanding>",
        "criterionEn": "<same criterion in English>"
      }
    ],
    "coverageRequirements": {
      "allOf": ["<facet ID>"],
      "anyOf": [["<facet ID>", "<alternative facet ID>"]],
      "minimumIndependentChecks": 2,
      "requireChangedCase": true,
      "requireCueFreeTransfer": true
    },
    "misconceptions": [],
    "variationAxes": [],
    "nonEvidence": [],
    "outOfScope": [],
    "contrastCaseBriefs": []
  }
}
```

The archetype vocabulary is deliberately small. A goal may declare one primary
archetype and bounded secondary characteristics, but the pipeline must not grow
a subject ontology merely to classify review prompts.

### 4.2 Fingerprint binding

`goalFingerprint` binds at least the normalized semantic fields used by the
existing goal-quality lanes: ID, title, description, semantic kind, and other
declared semantic goal fields. The fingerprint algorithm and normalization
version are explicit in the schema or manifest.

`reviewInputFingerprint` additionally binds all inputs that can invalidate the
didactic judgment:

- the goal fingerprint;
- direct `requires` and `contains` relations relevant to the review;
- active visualization and other reviewed learner-visible resource digests;
- the evidence-profile schema version; and
- the review-criteria version.

Any mismatch makes the prior profile `stale`. A stale profile remains available
as audit history but is neither published as current reviewer guidance nor
eligible for future runtime projection. A title correction, changed image, or
changed prerequisite must never inherit an approval silently.

### 4.3 Status and authority

- `needs_human_review`: generated or authored proposal. `reviewRunIds`,
  `evidenceLevel`, `maximumClaimScope`, and `dissent` distinguish an initial
  candidate from a proposal that has already received independent reviews.
- `approved`: a responsible release decision accepts the current fingerprint.
- `rejected`: the proposal is not suitable for publication or use.
- `stale` is a derived condition: a stored decision whose goal or review-input
  fingerprint no longer matches is ineligible even if its stored status says
  `approved`.

Generation models, reviewer models, and the synthesis step cannot assign
`approved`. The responsible curriculum release process owns that transition.
Disagreement is recorded; synthesis must not erase dissent to produce apparent
consensus.

### 4.4 Proposed authoring location

The implementation should place subject-specific configuration, ledgers, and
review run manifests below a dedicated quality lane, for example:

```text
curricula/DE/Gymnasium/quality/goal-evidence/
  mathematics.config.json
  mathematics.review.jsonl
  physics.config.json
  physics.review.jsonl
  runs/<run-id>/...
```

The closed Phase-0 companion contracts are:

- `contracts/goal-evidence/v1/goal-evidence-review-config.schema.json`;
- `contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json`;
- `contracts/goal-evidence/v1/goal-evidence-finding.schema.json`; and
- `contracts/goal-evidence/v1/goal-public-feedback.schema.json`.

Run payloads may be large. The implementation must deliberately classify which
parts are durable review evidence, which are generated summaries, and which are
temporary provider traces. Secrets, provider credentials, private prompts, and
learner data are never committed.

## 5. Shared BookModel

### 5.1 One projection for HTML and PDF

The generator first creates a locale- and scope-specific `BookModel` validated
against `contracts/goal-book/v1/goal-book-model.schema.json`. The HTML
site and PDF renderer consume that exact serialized model. The model contains:

- book version and build fingerprint;
- canonical landscape and composition-view or source-manifest identifiers;
- ordered chapter records;
- exactly one record for every included goal;
- direct prerequisite and reverse-prerequisite links;
- resolved, approved public resources;
- current evidence-profile status and fingerprints; and
- deterministic destinations and canonical permalinks.

Parity validation compares the goal IDs, order, relationships, versions, and
content fingerprints emitted by both formats. A renderer may change visual
presentation, but never content selection or navigation semantics. The closed
render manifests additionally bind the normalized feedback base URL used by
the HTML/PDF links; HTML and PDF for one publication may not silently point to
different feedback targets.

### 5.2 Scope and inclusion

Books are built for an explicit reviewed composition view or for an explicit,
closed source manifest and locale. The first edition includes only `target`
goals that are ordinary technical atomic competencies. The same projection
roles used by the learner-facing graph remain authoritative:

- eligible `target` goals are normal book goals;
- `prerequisiteOnly` goals may be included in a clearly marked prerequisite
  appendix or linked to their canonical online page, according to the versioned
  book configuration; and
- excluded or out-of-scope goals must not appear merely because a traversal can
  reach them.

Memory, orientation, practice/assessment, exam, and runtime-support nodes are
excluded by semantic kind in the initial edition. Encountering one never causes
the generator to invent a description or reinterpret it as an ordinary
competence. A later edition may include such nodes only through an explicit
versioned page contract suited to their different semantics.

Within a book, each included goal ID occurs exactly once. A goal referenced from
multiple chapters receives one canonical placement chosen by the reviewed
composition view or, for a union edition, by its explicitly versioned neutral
navigation-ownership contract. Other occurrences are links, never duplicate
pages.

The nationwide Gymnasium mathematics atlas is a union edition. Its source
manifest enumerates every admitted Bundesland/stage/course projection and binds
the reviewed G8/G9 policy by path and digest; filesystem discovery or a broad
glob is not a publication contract. Its target set must equal the complete
union of current curricular-atomic targets across the effective projections.
At the current bound revision this means 754 unique goal pages. Missing,
additional, or duplicate IDs fail the build.

Each nationwide page carries groups of the form:

```text
Bundesland -> [{ stage, durationModel, courseProfile }, ...]
```

Only exact authored and policy-validated tuples are legal. A duration-neutral
projection with reviewed applicability to both G8 and G9 produces two exact
tuples with the same goal set; a single-duration source produces only its one
reviewed duration; and a genuinely duration-specific projection may produce
different goal sets. Sekundarstufe-II GK/LK remains coupled to the respective
state and stage. `null` means that the bound policy makes no duration/profile
distinction for that tuple; it is not a wildcard and must not match an explicit
G8, G9, GK, or LK filter.

### 5.3 Chapters from `contains`

`contains` supplies the topic path and chapter nesting. It is not treated as a
prerequisite relation. In the initial atomic-goal edition, cluster and structure
nodes supply chapter labels, breadcrumbs, bookmarks, and ordering preferences;
they do not receive goal pages.

Front matter, contents, indexes, and publication notes may use additional
non-goal pages. The one-page invariant concerns goal pages: every included goal
has one and only one complete page, and every goal page belongs to exactly one
goal.

When a union edition consumes several composition views, view-local runtime IDs
must not create repeated roots such as several indistinguishable
`Mathematik` chapters. The nationwide mathematics atlas binds
`common-topic-suffix-v1`: it compares every admitted placement of a goal,
removes state-, stage-, duration-, and course-specific wrappers that are not
common to all of them, and retains only their exact shared topic suffix below a
single neutral `Mathematik` root. If no shared topic path exists, the goal stays
at that root rather than inheriting a misleading path from whichever source
file happens to sort first. Source-specific supplement chapters remain
distinguishable only when their complete labels are genuinely shared.

### 5.4 Stable topological order from `requires`

The linear reading order is a stable topological sort over the included goals:

1. every included direct prerequisite precedes the goal that requires it;
2. chapter membership derived from `contains` supplies the preferred grouping;
3. reviewed composition order supplies the first tie-breaker;
4. stable canonical goal ID supplies the final tie-breaker.

A stable Kahn-style sort is suitable. Chapter grouping may not violate a
`requires` edge. If keeping a chapter contiguous would do so, the prerequisite
constraint wins and the book records the affected cross-chapter relation.

A `requires` cycle, missing required goal, or nondeterministic tie fails the
build. Re-running the generator over byte-identical inputs must produce an
identical BookModel and semantic manifest.

### 5.5 Goal-page contract

Every goal page presents, in a stable layout:

1. subject, stage, and chapter path;
2. learning-goal title;
3. the full canonical **Lernziel-ID**, without abbreviation;
4. the reviewed visualization when one is available, including its review
   status in a reviewer edition;
5. the concise canonical description;
6. direct prerequisites (`requires`) with title and full Lernziel-ID;
7. direct reverse prerequisites (goals that directly require this goal), with
   title and full Lernziel-ID;
8. book version, goal fingerprint, and page number; and
9. a version-bound feedback permalink and optional QR code.

Nationwide editions additionally show a compact curricular-applicability
summary. The web atlas exposes the complete exact matrix and filters in the
order Bundesland, Stufe, then the still-valid G8/G9 and GK/LK choices. G8/G9
controls remain unavailable until a Bundesland is selected. The PDF may group
states only when their complete ordered scope tuple lists are identical; it
must link to the full online matrix rather than truncate silently.

The public learner/teacher edition does not need to expose the complete evidence
profile. A reviewer edition may add bounded facets, misconceptions, contrasting
cases, and non-evidence notes if they fit the same fixed page contract. Longer
AI findings and adjudication records remain in the structured review bundle.

### 5.6 Named destinations and links

Each included goal receives a deterministic named destination derived from its
full canonical goal ID, for example:

```text
goal-8dd9f210-2683-5902-acab-e3be22725232
```

The generator must escape or encode IDs reversibly if a PDF library restricts
destination names. Link labels continue to display the full unmodified ID.

- An in-book prerequisite links to the goal's named destination.
- An in-book reverse prerequisite uses the same mechanism.
- An out-of-book prerequisite links to the versioned online atlas when a
  canonical public target exists and is marked explicitly as external.
- Missing, ambiguous, or unsafe targets fail the build; they are never rendered
  as apparently valid dead links.

PDF bookmarks include chapter hierarchy and every goal title. A second index
maps full Lernziel-IDs to pages. HTML URLs use stable goal-ID fragments or paths
and preserve the same link graph.

### 5.7 Fail-closed layout

The page template has explicit bounds for title, image, description,
relationships, footer, font sizes, and accessible link targets. The initial
mathematics review profile uses A4 portrait with a fixed,
full-width 16:9 visualization region. Relationship density may compact the
relationship cards and their technical IDs, but it must never shrink the image.
The visualization itself is not placed in a wider tinted container, and the
page title makes a repeated image caption unnecessary.

Before release, the renderer validates at least:

- all required content is visible inside its assigned region;
- no element overlaps, clips, or overflows;
- no automatic font scaling crosses an approved minimum;
- every goal starts and ends on the same physical page;
- no physical page contains content from two goals;
- every named destination resolves to the expected page;
- every internal link resolves;
- full IDs and fingerprints are rendered without truncation; and
- HTML and PDF manifests have identical goal sets and order.

If a goal does not fit, the build reports its ID and the overflowing region.
The remedy is an intentional template, content, edition, or source correction;
it is never silent clipping, ellipsis, microscopic text, or an extra goal page.

The renderer has two explicit resource policies:

- a `review` publication may include a current QA-ledger-bound candidate image;
  its QA status remains machine-readable in BookModel and manifest, while the
  edition as a whole is visibly labelled as a review publication; and
- a `public` publication includes only a current publication-approved image.

The policy is part of the BookModel and manifest. A public renderer must never
silently inherit the more permissive review policy.

An explicitly labelled, read-only reviewer atlas may be reachable on the public
SkillPilot origin before the learner/teacher edition is approved. It must keep
`publicationMode: review`, visibly mark the whole edition, retain each image's
exact QA status in the bound machine contract, expose no write-capable feedback
control, and make no claim of public approval. Repeating an image-level warning
on every page is not required. This preview is a review surface, not the `public` publication. A
later public edition is built separately with `publicationMode: public` and the
stricter resource policy above.

Original visualization assets remain immutable. A PDF renderer may create
deterministic print derivatives with a versioned maximum pixel size, encoding,
and quality profile. The BookModel and release manifest bind both the original
asset digest and the derivative profile/digest. HTML may use the approved public
asset URL; a local PDF build may resolve only allowlisted repository assets and
must make no network request. A renderer must not embed hundreds of unbounded
original images into one monolithic HTML document, because that turns a valid
book into an avoidable memory and file-size failure.

### 5.8 AI-review bundle

The PDF is an important review surface, but it is not the only input supplied to
review models. Every review batch contains the same content in three aligned
forms:

- the exact goal-page PDF or chapter PDF seen by human reviewers;
- normalized JSON from the BookModel and evidence-profile candidate; and
- concise Markdown rendered from that JSON.

This avoids making PDF extraction or OCR an accidental source of curriculum
semantics. Every model finding cites the full goal ID and fingerprint, not only
a page number. The pipeline verifies that the cited goal belongs to the exact
review bundle before accepting the finding.

Goal-local bundles include the goal, its chapter path, direct prerequisites,
direct reverse prerequisites, current resources, and the profile candidate.
Chapter batches expose local consistency. Overlapping batches include boundary
goals from neighboring chapters so reviewers can detect sequencing gaps and
contradictions that a one-page review would miss. A final global manifest pass
checks relationships and vocabulary across the complete subject without asking
one model invocation to rewrite the entire book.

## 6. Fast independent multi-AI loop

### 6.1 Role and cadence

The multi-AI loop runs in hours or days and is the primary early improvement
loop. It is designed for breadth, adversarial testing, reproducibility, and
rapid iteration before public feedback can accumulate.

The loop has distinct roles:

1. candidate author;
2. subject-matter reviewer;
3. didactic reviewer;
4. assessment and adversarial reviewer;
5. cross-goal sequencing and representation-cue reviewer;
6. disconfirming reviewer;
7. deterministic validation and replication runner;
8. synthesizer; and
9. responsible release decision.

The synthesizer groups findings and proposed changes but has no release
authority.

### 6.2 Independence

The first review pass is blind: reviewers do not see other reviewers' answers.
A normal review batch uses at least:

- three distinct review roles;
- two model families or providers where available; and
- two independently authored prompt families.

Five runs of one model with one prompt count as repeated sampling of one source,
not five independent sources. Run manifests bind model and provider, model
version when available, prompt and criteria fingerprints, role, generation
parameters, context bundle fingerprint, time, and toolchain version.

Review order and option order are randomized where position bias is plausible.
Named model identities are hidden during synthesis when that does not impede
auditability. Material model, prompt, criteria, or context changes require a new
calibration run.

### 6.3 Structured findings

Each finding records:

- exact goal ID and fingerprint;
- anchored observation;
- hypothesized mechanism;
- violated criterion;
- smallest reproducible counterexample;
- severity;
- evidence level and maximum claim scope;
- counterarguments or disconfirming evidence;
- proposed local change;
- possible side effects; and
- the evidence needed for broader generalization.

Reviewers must distinguish a defect in the canonical goal, visualization,
evidence profile, book projection, coaching policy, model behavior, or runtime
guard. The pipeline must not turn every observed coaching failure into a goal
wording change.

### 6.4 No majority-vote release

Model votes are not a release criterion. A minority finding with a reproducible
factual error, false-mastery path, privacy issue, or normative conflict can
block the affected item. Conversely, many similar unanchored opinions do not
establish a general rule. Release decisions cite claims, evidence, scope, and
remaining dissent.

## 7. Evidence and generalization gates

### 7.1 Evidence levels

| Level | Meaning |
| --- | --- |
| `E0` | Opinion or hypothesis without an anchored observation. |
| `E1` | Anchored observation in a specific goal, page, artifact, or dialogue. |
| `E2` | Reproducible defect with a minimal counterexample. |
| `E3` | Independently replicated or triangulated defect and mechanism. |
| `E4` | Field evidence from an appropriate controlled learner or teacher setting. |
| `E5` | Replicated field evidence across settings or cohorts. |

Normative requirements such as privacy, source fidelity, accessibility, or
provider policy are tagged `NORMATIVE` in addition to an evidence level. They
may block immediately within their actual scope.

### 7.2 Claim scopes

| Scope | Meaning |
| --- | --- |
| `G0` | One concrete dialogue, rendering, or generated case. |
| `G1` | One identified learning goal and its bound artifacts. |
| `G2` | A defined goal archetype or recurring mechanism. |
| `G3` | A subject, stage, or similarly bounded curriculum scope. |
| `G4` | Global SkillPilot coach, publication, or Mastery rule. |

Every finding declares the maximum scope supported by its evidence. A proposed
change may be narrower, never broader.

### 7.3 Generalization rules

1. One reproducible case may justify a `G0` fix and can block or correct the
   affected `G1` item.
2. A `G2` rule requires at least `E3`: the mechanism must reproduce on multiple
   goals from at least two chapters and survive a disconfirming test.
3. A `G3` rule requires a stratified sample across the relevant stages and goal
   archetypes, plus independent replication.
4. A `G4` coach or Mastery rule requires evidence from both mathematics and
   physics, several goal archetypes, independent offline replication, and a
   controlled field or canary phase before general release.
5. An immediate safety, privacy, factual, or normative blocker stays as narrow
   as the demonstrated scope. Urgency does not make its mechanism universal.

The governing sentence is:

> Ein einzelner Fall kann einen konkreten Defekt beweisen und deshalb einen
> Ablauf stoppen. Für eine allgemeine Regel braucht es zusätzlich einen
> belegten Mechanismus, unabhängige Replikation und einen zum behaupteten
> Geltungsbereich passenden Feldtest.

## 8. Slow public signal and challenge channel

### 8.1 Deliberately different time scale

The public HTML atlas and feedback control are installed early so teachers and
other reviewers can cite exact goals. At the beginning, however, this channel
is expected to produce sparse, delayed, and uneven feedback. The AI loop does
not wait for it, and absence of public comments is not evidence of quality.

Public feedback is valuable as:

- a sentinel for concrete defects missed by systematic review;
- field evidence about actual interpretation and use;
- a source of counterexamples and alternative explanations; and
- a long-term challenge mechanism for approved decisions.

It is not a popularity vote, a rapid release gate, or a substitute for the
structured multi-AI review.

### 8.2 Version-bound feedback envelope

Every feedback action carries immutable context supplied by the publication:

- full `goalId`;
- goal fingerprint;
- book or atlas version;
- locale and scope;
- page or canonical URL; and
- relevant publication manifest fingerprint.

The form asks for structured observations such as:

- What might the learner have understood?
- What observable evidence supports that interpretation?
- What alternative explanation is plausible?
- Could the learner solve or explain it without the visible cue?
- Which information is missing?
- How broad is the claimed problem?

It may request an optional role and contact path, but it must not solicit learner
names, permanent SkillPilot IDs, chat secrets, or unnecessary personal data.
Submissions warn users not to include identifying learner information.

### 8.3 Moderation and authority

Public submissions enter a moderated intake queue. An authorized reviewer may
use them to create a finding, request reproduction, or immediately block a
concrete affected artifact for a credible factual, safety, privacy, or normative
concern. The submission itself cannot edit a goal or profile, resolve its own
review, block a release automatically, or create a global rule.

One teacher's comment may be exactly right about one goal. It is therefore not
dismissed. But role, confidence, public agreement, or forceful language does not
increase the supported generalization scope. Broader rules still pass the
`E0`-`E5` and `G0`-`G4` gates.

Feedback questions should focus on observable learner reasoning rather than ask
teachers to defend or grade “the SkillPilot didactics.” Materials should be
anonymized and, where practical, reviewed blind. This reduces avoidable role
conflict while preserving critical challenge.

Public triage runs on a slower scheduled cadence, with a separate urgent lane
for factual, safety, privacy, accessibility, or normative defects. Public
feedback is retained against the exact historical fingerprint even after the
current goal changes.

## 9. Rollout

### 9.1 Phase 0: contract and deterministic skeleton

Implement and validate:

- the evidence-profile schema and fingerprint algorithms;
- the BookModel schema;
- composition-view projection and stable topological ordering;
- HTML/PDF parity manifests;
- the one-goal-page and link validators;
- AI-run manifests and structured finding schema; and
- the public feedback envelope, without making public response volume a gate.

No runtime or Mastery behavior changes in this phase.

### 9.2 Phase 1: focused mathematics pilot

Start with the concrete representation-choice goal
`8dd9f210-2683-5902-acab-e3be22725232` (“Darstellungsform auswählen und
begründen”). The pilot must test at least:

- whether table, graph, term, and sketch each receive a case in which their
  particular advantage matters;
- whether the learner can compare the chosen representation with the closest
  alternative;
- whether the learner can name a limitation of the chosen representation;
- whether a highlighted visualization or suggestive wording can produce a
  shallow “Graph” answer; and
- whether a new, cue-free transfer case distinguishes understanding from
  repetition.

The output is one approved pilot profile, one chapter-scale HTML/PDF book, a
reproducible adversarial review set, and documented dissent. The pilot is not
evidence for a global Coach rule.

### 9.3 Phase 2: mathematics and physics calibration

Calibrate on a default stratified set of at least 24 ordinary atomic goals:

- at least 12 mathematics and 12 physics goals;
- both Sekundarstufe I and Sekundarstufe II;
- all relevant archetypes present in each subject; and
- cases with and without visualizations, cross-chapter prerequisites, common
  misconceptions, and representation choices.

The sample and replacement rationale are versioned in configuration. Exit
requires stable schemas, acceptable inter-review consistency, successful
disconfirming tests, deterministic books, and no unresolved high-severity
findings. Calibration changes invalidate prior unbound bulk output.

### 9.4 Phase 3: bulk mathematics and physics review

After calibration, generate and review profiles for all in-scope ordinary
atomic goals in canonical Gymnasium mathematics and physics. Work in bounded
chapter batches, then run overlap batches and global passes for:

- duplicate or contradictory facets;
- missing prerequisite coverage;
- inconsistent terminology and difficulty;
- visual cue and answer leakage;
- cross-chapter progression; and
- repeated shallow-mastery paths.

Bulk generation never bulk-approves. Risk, disagreement, novel mechanisms,
schema violations, and proposed canonical text changes stay in explicit review
queues. A green count is not obtained by filling every profile with a generic
template.

### 9.5 Phase 4: public atlas and slow feedback integration

Publish the versioned HTML atlas and corresponding PDFs, with a feedback target
on every goal page. The infrastructure may go live earlier as a preview, but
its sparse early feedback is not an input-volume gate for Phases 1-3.

Public findings are triaged against the exact goal and publication fingerprint.
Validated local corrections re-enter the same review pipeline. Generalization
requires the same evidence as an internally discovered finding.

### 9.6 Phase 5: optional pedagogical text and worksheets

Only after the relevant evidence profiles are approved may topic-level
pedagogical book text or teacher worksheets be generated from them. These are
separate, versioned publication artifacts. They must cite the goal IDs they
cover and must not silently introduce new curricular goals or mastery rules.

## 10. Later runtime and Mastery integration

Evidence profiles can eventually reduce the reasoning burden on a learning
model by projecting only the approved profile for the active goal. This is not
part of the initial publication rollout.

Before runtime projection, a separate implementation concept and acceptance
gate must define:

- the bounded safe projection; only the active approved profile is eligible;
- prompt-size and privacy limits;
- handling of stale or missing profiles;
- provider-neutral behavior and provider-specific adapter contracts;
- adversarial dialogue tests; and
- feature flags, canary rollout, observability, and rollback.

Before a profile can control Mastery, the backend must be able to validate
structured evidence rather than trust an unconstrained model assertion. A later
design may use server-issued challenges or evidence receipts that bind facets,
assistance level, case variation, and state version. It must prove that all
required facets and independent checks were covered.

A learner answer obtained directly from a highlighted image, a suggested option,
the coach's own wording, or a repeated near-identical task does not by itself
prove mastery. A fresh cue-free case is required when cue contamination is
plausible. Until the server can enforce these rules, the profile is guidance and
evaluation material, not a hard Mastery guarantee.

## 11. Publication versions and reproducibility

Every release manifest binds:

- book/atlas version;
- generator and schema versions;
- canonical package or landscape fingerprints;
- composition-view ID and fingerprint;
- for union editions, the closed source-manifest digest, every bound projection
  fingerprint, the navigation-ownership contract, and the reviewed
  duration-policy digest;
- locale and scope;
- ordered goal IDs and goal fingerprints;
- evidence-profile fingerprints and statuses;
- visualization/resource hashes;
- the normalized feedback target used by the rendered links;
- HTML and PDF artifact hashes; and
- AI-review criteria and run-set identifiers used for the release decision.

The public URL and PDF footer expose the book version and goal fingerprint in a
human-copyable form. The full manifest is machine-readable. A historical
feedback link continues to identify the historical page; it never silently
retargets a comment to a newer goal revision.

## 12. Acceptance criteria

The first production-capable implementation is accepted only when:

1. identical inputs produce the same BookModel, goal order, destinations, and
   semantic manifest;
2. HTML and PDF contain the same included goal IDs in the same order;
3. every included ordinary technical atomic target goal has exactly one
   complete goal page and no excluded semantic kind receives one;
4. each page shows the full Lernziel-ID, title, description, version, and
   fingerprint without truncation;
5. all internal `requires` and reverse-`requires` links resolve to the correct
   named destination;
6. every out-of-book relationship is explicitly marked and safely resolved;
7. every page passes the fail-closed overflow and minimum-legibility checks;
8. no learner ID, learner state, permanent SkillPilot ID, credential, or private
   model trace is present in any publication or review bundle;
9. every current approved profile matches its goal and review-input
   fingerprints;
10. AI findings are reproducible, structured, dissent-preserving, and scoped;
11. public feedback is version-bound and cannot mutate canonical state;
12. the mathematics pilot catches the shallow always-`Graph` strategy instead
    of treating it as sufficient understanding;
13. runtime and Mastery remain unchanged until their later explicit gates pass;
14. a nationwide atlas contains the exact union of all bound
    curricular-atomic targets once and only once;
15. every printed and filterable applicability row is an exact
    Bundesland-bound tuple, and no independent G8/G9 or GK/LK cross-product can
    be constructed;
16. changing a bound composition view or the duration-model policy makes the
    publication check fail until BookModel, PDF, and manifests are regenerated;
    and
17. cross-stage or cross-profile goals never inherit a contradictory chapter
    path from the lexicographically first source projection.

## 13. Required validation classes

The implementation should provide focused commands for these classes rather
than one opaque all-purpose check:

- graph projection, cycle, and missing-reference validation;
- deterministic topological order and single-occurrence validation;
- BookModel schema and manifest validation;
- HTML/PDF parity validation;
- PDF page ownership, destination, link, overflow, and legibility validation;
- evidence-profile schema, fingerprint, and stale-decision validation;
- AI-run independence and finding-schema validation;
- public-feedback envelope and privacy validation;
- nationwide source-union completeness, policy binding, exact applicability
  tuple, and non-Cartesian filter validation; and
- pilot adversarial dialogue evaluation.

These checks belong in the normal curriculum/publication CI once their formats
are stable. Updating a fingerprint baseline merely to make a changed artifact
green is forbidden; the corresponding review must be repeated.

## 14. Deliberate non-goals

This concept does not:

- replace official curricula, source rationales, or composition views;
- turn `contains` into a didactic prerequisite relation;
- put long rubrics into learner-facing goal descriptions;
- publish hidden solutions or detailed exam scoring material;
- infer understanding from image recognition or repeated labels;
- let an AI model or a public commenter approve its own change;
- make teacher participation a prerequisite for early iteration;
- treat silence, popularity, or majority votes as evidence;
- expose a learner's SkillPilot ID for book navigation or feedback;
- treat G8/G9 as a state-independent property; or
- claim server-enforced Mastery from prompt guidance alone.

## 15. Implemented local workflow

The current implementation exposes separate, reviewable commands rather than
one opaque bulk mutation:

```bash
npm --prefix app run quality:goal-evidence:check

npm --prefix app run build:goal-book-model -- \
  scripts/config/goal-books/de-de-gym-math-representation-choice-pilot.json

npm --prefix app run build:goal-book-model -- \
  scripts/config/goal-books/de-gym-math-national-atlas.json

npm --prefix app run render:goal-book -- \
  --model ../tmp/goal-books/de-gym-mathematik-bundesweit.book-model.json \
  --feedback-base-url https://skillpilot.com/lernziel-feedback \
  --pdf public/lernzielbuch/de-gym-mathematik-bundesweit.pdf \
  --print-derivative-profile bounded-atlas

npm --prefix app run render:goal-book -- \
  --model ../tmp/goal-books/de-de-gym-math-representation-choice-pilot.book-model.json \
  --feedback-base-url https://skillpilot.com/lernziel-feedback \
  --html ../tmp/goal-books/de-de-gym-math-representation-choice-pilot.html \
  --pdf ../tmp/goal-books/de-de-gym-math-representation-choice-pilot.pdf

npm --prefix app run export:goal-book-review-bundle -- \
  --model ../tmp/goal-books/de-de-gym-math-representation-choice-pilot.book-model.json \
  --html ../tmp/goal-books/de-de-gym-math-representation-choice-pilot.html \
  --pdf ../tmp/goal-books/de-de-gym-math-representation-choice-pilot.pdf \
  --output ../tmp/goal-books/review-bundles/representation-choice-pilot-v1 \
  --goal-id 8dd9f210-2683-5902-acab-e3be22725232
```

The exporter requires a new output directory and writes the exact PDF, HTML,
BookModel, normalized JSON, JSONL, Markdown, prompt, criteria, schemas, and a
digest-bound manifest. Independent AI outputs are accepted only together with
their run manifest and are checked with
`validate:goal-evidence-findings`. Generated books and bundles under `tmp/`
are disposable build artifacts, not source-of-truth files.

The HTTPS feedback base in this command is the reserved version-bound target
for the later moderated intake. Its schema and link context are implemented;
the production form and moderation queue are not claimed as deployed in the
current phase.

## 16. References to adjacent concepts

- [SkillPilot Skill Graph Specification](graph-definition.md)
- [General Goal System and Migration](general-goal-system-and-migration.md)
- [View Projection and Goal Placement](view-projection-and-goal-placement.md)
- [Atomic Goal Visualizations](atomic-goal-visualizations.md)
- [Human-Readable Source Rationales](human-readable-source-rationales.md)
- [Dual Curriculum Package Releases](dual-curriculum-package-releases.md)
