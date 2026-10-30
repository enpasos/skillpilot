# Assessment completion authoring contract

This contract describes static curriculum policy. It never stores a learner's
mastery, a passed attempt, a waiver, an accepted evidence record or a completion
certificate. An existing assessment mastery result counts immediately.

`scope.schema.json` defines an authoritative curriculum unit with canonical
`targetRootIds`. These references may identify an atomic goal or an existing
subtree; the runtime resolves their atomic targets against the learner's
committed Personal Curriculum. No goal is copied into the scope artifact.

`profile.schema.json` references that unit through `levelScopeRef`. It adds
reviewed waiver rules and optional extra protection. The review identifies the
scope, task and rubric revisions; each rule gives its own rationale and review
reference. This metadata records a static authoring decision, not an additional
acceptance condition on a learner's result.

Production review revisions use `sha256:<lowercase hexadecimal digest>`.
Hash input is UTF-8 JSON with recursively sorted object keys, unchanged array
order, compact separators and no trailing newline. Repository inputs retain
their numeric JSON representations; the shipped pilot uses integer rubric
points. The bindings are:

- `scopeRevision`: `{scope, targetGoals}`. `scope` is the parsed authoritative
  scope artifact; `targetGoals` is the array of complete resolved atomic goal
  objects in ascending canonical-ID order. This binds target semantics as well
  as placement, without introducing another goal definition in the artifact.
- `taskRevision`: for one required assessment, `{taskContent, solutionContent}`
  from its `examData`. For multiple required assessments, an object keyed by
  their canonical IDs whose values are these task-and-solution objects.
- `rubricRevision`: the complete `examData.scoring` object for one required
  assessment, or an object keyed by canonical assessment IDs containing those
  scoring objects for multiple required assessments.

Every required assessment in the resolved scope participates, including an
assessment not mentioned in a waiver rule. Review Markdown must be a real
curriculum artifact; the runtime generation also binds the bytes of the profile,
scope and referenced review documents. A changed input requires a fresh static
review before activating the changed policy. Existing learner mastery is never
individually requalified. Synthetic fixtures deliberately use named test
revisions; they do not satisfy the production catalog's review binding.

The TypeScript authoring check validates both closed schemas and literal
references, including duplicate identities. It does not implement the
completion algorithm. The Java compiler remains authoritative for complete
atomic expansion, prerequisite closure, goal-type protection, scope validity,
cycles and rule reachability.

From the repository root:

```bash
cd app
npm run check:assessment-completion-profiles
npm run test:assessment-completion-profiles
```

The default check reads `curricula/DE/Gymnasium/completion-scopes/` and
`curricula/DE/Gymnasium/completion-profiles/`. Merely installing these schemas
does not approve or activate a profile.

`fixtures/cases.json` is a shared, synthetic compiler/evaluator corpus. Each
case supplies a canonical `graph`, authoritative `targetGoalIds`, the allowed
`level2TargetGoalIds`, a static `profile` and `masteredGoalIds`. A valid case
specifies `expected.waivedGoalIds`, `expected.pendingTargetGoalIds` and
`expected.complete`; an invalid case instead specifies a typed
`expectedError`. Lists represent sets. These fixture rules are explicitly
synthetic and cannot authorize production waivers.
