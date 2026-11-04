# Assessment-Gated Completion and Global Mastery

**Binding product decision, 4 November 2026; concept, not deployed behaviour.**
An ordinary goal can be completed by demonstrating understanding directly,
or by demonstrating independent application of that competence in the relevant
passed assessments of an authoritative curriculum level. Both forms establish
mastery for future prerequisites, total progress and plan IST. A passed
assessment establishes application competence, rather than merely waiving work.

This replaces the 31 October interpretation that mastery of an intermediate
goal ends transitive prerequisite demand. For $Q\to B\to A$, ordinary mastery
of B alone does **not** release A while the local assessment Q remains open.
Passing the relevant local assessment can establish mastery by application for
A and B. Transitive minimality remains required for authored `requires`.

The current `main` implementation still follows the earlier semantics. This
page defines the revised concept; it does not announce implementation, data
migration, deployment or a verified assessment inventory. The new implementation
plan and review of reusable earlier PR work follow concept/reference review.

## 1. One stored result, equivalent global credit

The only persisted result per atomic goal remains binary:

$$
m(a)\in\{0,1\},\qquad M=\{a\mid m(a)=1\}.
$$

For an ordinary subject goal, a direct positive result means understanding
under its normal completion contract. **Implicit mastery** means independent
application of the same competence demonstrated through relevant passed local
assessments. The effective mastered set $M_{\mathrm{eff}}$ combines these sources
without another stored goal state, partial mastery tier, manual waiver grant,
per-part result registry or second examination pass.

The distinction records explanatory provenance, not different future credit.
A goal in $M_{\mathrm{eff}}$ satisfies applicable prerequisites and counts as
achieved wherever its canonical identity is a target. A later open assessment,
wider focus or changed Personal Curriculum cannot undo this valid achievement.
Those changes can introduce further work, without reopening the same competence.

Assessment goals and memorization goals are **never implicitly mastered**.
Exams need their normal positive examination outcome; memory goals need the
existing verified-recall result under M1. A due SRS card is not a failed
recall, and self-rated practice is not verified recall. Orientation retains
its own motivational-completion meaning: neither a direct nor a derived
completion description certifies subject-matter competence or fabricates a
motivational interaction.

## 2. Authoritative local levels over stable identities

Resolve a finite, versioned curriculum level L from existing program units,
placements or reviewed composition views. Let $T_L$ be its unique applicable
atomic targets. Resolve authored choices, direct entries and projection roles.
Hidden `prerequisiteOnly` support remains part of prerequisite validation
without becoming a target or increasing the progress denominator.

A level is an authoritative educational unit, not an arbitrary display filter,
tree expansion, dated plan or Level-3 focus. The graph alone does not uniquely
determine its partition. No manually maintained list of waivable goals or
learner-specific waiver profile substitutes for the curriculum structure.

Let Q denote assessment atoms and K memorization atoms; K here denotes card
goals, not the cluster set in the [graph specification](graph-definition.md).
The protected local targets are

$$
P_L=T_L\cap(Q\cup K).
$$

Every ordinary local target needs a local assessment consumer in the full
normalized relation:

$$
\forall a\in T_L\setminus P_L:\quad
\exists q\in T_L\cap Q:\ (q,a)\in R^+.
$$

This structural condition is necessary. For recognized subject competencies,
the actual tasks/rubric must also cover their claimed independent application. A memory endpoint alone cannot
provide the assessment proof. A level without that coverage cannot grant
implicit mastery. An ordinary terminal without such coverage is a missing
assessment contract, not competence awarded automatically at zero progress.
A level containing only protected targets can require explicit outcomes but
does not thereby establish an ordinary learning unit.

## 3. Full transitive requirements independent of mastery

Resolve direct and inherited requirements and expand required clusters into
atomic obligations under the authoritative graph/composition contract. Let R
on this page denote the normalized atomic relation, directed from consumer to
prerequisite. Keep authored edges unchanged. Missing references, identity
conflicts and containment, requirement or expanded atomic cycles make the
calculation unavailable; they do not mean an empty completed level.

$R^+$ is the full transitive closure, computed independently of M:
**never stop traversal at a mastered intermediate goal**. Define

$$
Reach_R^*(S)=S\cup\{v\mid\exists u\in S:(u,v)\in R^+\}.
$$

Unresolved protected local targets retain all transitive preparation demand.
All transitive consumers inside the authoritative level count. A future exam
outside it does not retroactively prevent local recognition. Outside support
remains visible to structural checks and normal/strict prerequisite policy;
the local contract grants no mastery to goals outside $T_L$.

Transitive minimality prohibits an authored requirement that remains reachable
after removing its edge and recomputing the effective relation, including
alternative paths contributed by inheritance. For purely atomic authoring
without inheritance, this is the familiar prohibition on redundant shortcuts
along a longer authored path. A chain and a chain with a redundant shortcut
have the same transitive demand; redundant edges do not retain a separate
preparation obligation. Contains inheritance remains a distinct operation;
[Graph Definition §7.3](graph-definition.md#73-transitive-minimality) states the
general condition.

## 4. Local recognition and durable global mastery

Using the existing explicit results M, define

$$
\begin{aligned}
N_L&=Reach_R^*(P_L\setminus M),\\
I_L&=T_L\setminus(M\cup P_L\cup N_L).
\end{aligned}
$$

$N_L$ contains unresolved protected roots and their full transitive prerequisites,
even through mastered intermediates. Only its intersection with $T_L$ matters
for $I_L$. No protected target enters $I_L$. An unrelated open card goal keeps
the level incomplete, but retains ordinary preparation only when it actually
transitively requires that preparation. The coverage condition in §5 is essential:
for subject competencies the set difference expresses demonstrated application
only under a valid authored recognition contract. If an orientation marker
belongs to $I_L$, it is derivatively completed as a didactic entry marker;
this claims neither subject-matter competence nor that its motivational
interaction actually occurred. Orientation is not a third protected class.

The global effective mastered set is

$$
M_{\mathrm{eff}}=M\cup\bigcup_{L\in\mathcal D}I_L,
$$

where $\mathcal D$ contains the learner's **durably applicable authoritative
recognition contracts**, including valid earlier contracts after a curriculum
or Personal-Curriculum change. It is not merely the current Level-2 selection
or focus. Recognition remains reconstructible from immutable, versioned
contracts, stable identities and valid existing outcomes. Arbitrary scope
visits cannot create a contract or grant.

Implicit results are never fed back into $I_L$. Every Q/K outcome is explicit;
ordinary implicit mastery cannot pass an exam or verify a card. No recursive
waiver fixed point is needed. Traversal may avoid materializing all transitive
pairs, provided it continues through mastered nodes.

A stable assessment goal ID binds a stable recognition meaning. Task variants
may change while preserving that meaning. Expanded competency claims need a
new assessment identity or an explicitly reviewed migration that preserves
the old achievement's meaning. A later graph or contract revision must never
reinterpret an old positive exam result as proof of newly added competencies.
If historical meaning is ambiguous, preserve the explicit positive result
without claiming the expanded recognition. This requires no new learner pass
state or per-learner version-eligibility result.

Changed subjects, a later open exam, removal from the current tree or wider
focus do not erase valid recognition. Correction of an invalid source result
or contract is a separate explicit integrity process. Version retention and
migration details belong to the later implementation plan; no additional
per-goal outcome is implied.

## 5. What the assessments must establish

A `requires` path proves dependency reachability, **not task-content coverage**.
Independent review must inspect the actual tasks and normal rubric. Collectively,
the relevant assessments require genuine independent application of every
subject competence they recognize. Guided recall or merely mentioning a
competence is insufficient.

A normal pass must not allow a fully missing essential claimed competence to
be compensated by points earned elsewhere while still granting it. Review
each passing assessment combination that can release a subject target under §4,
not merely the combined content of every exam in the unit. Every such
combination must substantiate that target's claimed application. This is
static task/rubric quality assurance, not additional runtime evidence,
per-part stored passes or another qualification after the normal result.

The independent counterexample test is concrete: **Can a learner pass the
relevant assessment combination without a competence that it would recognize?**
If yes, the recognition contract fails. Revise its tasks, normal rubric, claim
or level boundary. Required cards retain their existing recall contract.

Existing valid positive `examMastery` can be reused without another pass when
the applicable legacy contract supports this meaning. Preserve its original
attribution and contract meaning. This concept does not claim that today's
legacy examinations have already been verified for the stronger recognition
claim. Inventory review and any necessary migration remain separate work.

## 6. Worked cases and completion

| Local graph and explicit M | Result under a valid recognition contract |
| --- | --- |
| $Q\to B\to A$; M empty | Q, B and A remain open. |
| Same graph; $M=\{B\}$ | Q stays open and its transitive demand keeps A open. |
| Same graph; $M=\{Q\}$ | A and B are globally mastered by demonstrated application. |
| Local exams Q and S both transitively require A; only Q passed | S retains A unless A already has valid direct or earlier implicit mastery. |
| Exams passed; unrelated required card goal K unresolved | K remains open; ordinary recognition does not fabricate recall. |
| Local level complete; a later external exam needs A | A's valid recognition satisfies that future prerequisite. |
| Ordinary terminal lacks local assessment coverage | Invalid recognition contract; no implicit mastery is granted. |

$$
Complete(L)\iff T_L\subseteq M_{\mathrm{eff}}.
$$

Every protected local target still needs its own explicit positive outcome.
Under a valid covering contract, passing those obligations is sufficient for
the ordinary local targets. Optional whole-level entry gates remain a separate
explicit course policy in [Curriculum Level Gates](curriculum-level-gates.md),
not a universal prerequisite or a consequence of grouping goals.

## 7. Assessment access and ordinary continuation

Every applicable assessment remains deliberately directly addressable without
first mastering preparation. Direct access retains authentication, learner
revision, session ownership, task availability and normal grading checks.
An attempt is not a pass. Discovery is read-only; paging and recommendations
must not permanently remove assessments from the accessible set.

Normal prerequisites use $M_{\mathrm{eff}}$ and the full transitive relation,
restricted by the existing focus policy. Strict mode checks globally. Compute
reachability before focus restriction: a mastered or outside-focus intermediate
cannot conceal an in-focus requirement. A valid prerequisite wholly outside
focus remains ignored in normal mode; invalid authored Level-2 references
remain configuration errors. This is the revised conceptual contract, not a
claim of current backend enforcement or a new hard level gate.

Already mastered goals remain available for voluntary practice without
revoking credit, rewriting source IDs or mutating authored requirements.

## 8. Progress, plans and evidence boundary

For any fixed deduplicated target set G, total achievement and plan IST use

$$
IST(G)=|G\cap M_{\mathrm{eff}}|.
$$

Where weights apply, aggregate the same effective mastery indicators. Current
target scope controls the denominator, not the existence of valid global
achievement. Support outside G does not increase IST. Multiple placements
count each canonical atom once. A dated plan is not another recognition level.

Daily and weekly histories use reliably dated **explicit outcome events only**.
Do not manufacture a date for implicit recognition, infer dates from imports
or snapshots, or present a recognition batch as that day's performed work.
Total effective achievement and period events serve different purposes.

A future implementation must verify mastered-intermediate traversal, all local
protected obligations, shared transitive demand, invalid coverage, bounded local
recognition, durable global credit after scope changes, normal/strict boundaries,
explicit-only exams/recall, legacy attribution, direct exam access, target
deduplication and explicit-event histories. Independent task/rubric review
supplies content evidence; machine tests alone establish neither that evidence
nor host acceptance, usability or learning effectiveness.
