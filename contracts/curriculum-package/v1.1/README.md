# Assessment completion package extension

This directory defines the optional `assessmentCompletionV1` capability. A
completion package uses runtime contract `1.1` and release profile
`full-standalone-completion-v1`. Packages without this capability retain the
existing runtime `1.0` / `full-standalone-v1` contract. The published V1 schema,
profile, registry and ontology files remain unchanged.

The manifest and 22 existing normative schemas are reused. Four additional
schemas define the new runtime catalog, completion artifact wrapper, static
completion profile and authoritative scope. The new registry extends the 456
existing entries to 473; semantic normalization, definition digests, curriculum
ontology mappings and publication evidence retain their existing contracts.
The FWU carrier has its own versioned profile and application vocabulary.

The runtime catalog's `completionArtifacts` list must exactly match the
manifest's `completion-profile`, `completion-scope` and `completion-rule-review`
roles. Every artifact has the closed shape:

```json
{
  "artifactFormatVersion": 1,
  "artifactKind": "profile",
  "id": "profile-id",
  "definition": {}
}
```

The manifest's `validationSchemaId` binds the wrapper schema; the wrapper does
not add a `$schema` property. Profile and scope IDs remain semantic identities.
A review ID is its complete package-local artifact path, and both
`review.reference` and `rules[].reviewRef` resolve to review artifacts in the
same package. Reviews bind their exact UTF-8 content with SHA-256. No wrapper
contains learner mastery, assessment results, waiver results or another
persisted learner outcome.

The registry preserves each complete definition as one canonical JSON literal.
FWU also asserts the scope roots, profile/scope relation, assessment groups,
waivable/protected goals and review revisions as actual RDF relationships and
literals. Reconstruction verifies those assertions against the retained
canonical definition; the literal alone cannot satisfy the relationship checks.

Source compilation verifies the existing source review's scope, target, task
and rubric hashes before exporting. Repository locator rewriting and compatible
explicit node types change the exported goal representation. Target-goal set
arrays use the same registry-defined canonical order as semantic reconstruction,
while ordered arrays and original authoring objects remain unchanged. The portable
profile is bound to that exported representation. Its review retains the source
review text and records both binding sets. This mechanical export step creates
no new learner qualification or assessment acceptance decision. The independent
validators check package-local references, task/rubric bindings, protected goals,
inherited prerequisites and strictly directional waiver references.

The Java loader retains only the small verified completion documents. The
completion catalog reads those immutable bytes and the existing landscape JSON
from the active package snapshot. It does not read repository completion files
or retain image payloads. Profile selection still requires the explicit runtime
feature switch and profile allowlist.

Configured static bases and profiles are compiled before application readiness.
The repository pilot prepares the broad root
`a0e13c56-c25f-4742-9272-3a1a603ee52e` and canonical Mathematics base
`68a8ac50-f5f5-4e24-8aa9-5e408ca01ced`.
A consumer of this standalone Mathematics package sets
`SKILLPILOT_COMPLETION_WARMUP_CURRICULUM_IDS=68a8ac50-f5f5-4e24-8aa9-5e408ca01ced`.
A missing scope, invalid configured rule or insufficient cache budget fails
startup with a diagnostic. This precompilation uses no learner state; actual
Personal Curriculum applicability is checked again when the cached profile is
used. The verified base/profile pairs are sealed before readiness. Later requests
with another static base, an unprepared pair or a missing prepared cache entry
fail closed before loading or compiling; they cannot trigger cold work under a
learner transaction. Personal target sets remain variable and are revalidated.
The current runtime pilot accepts at most one enabled profile and one required
assessment per compiled profile, checked before readiness without truncation.
This operational projection budget does not restrict the portable contract or
pure compiler. A broader activation requires bounded loading and a new budget
review.

Operational Micrometer metrics use the `skillpilot.completion` prefix. Timers
measure only pure compilation/evaluation; counters distinguish cache hits,
misses and evictions, and gauges report compiled contexts/nodes/edges. Scope
status labels are a fixed set. Learner, profile, goal and curriculum IDs are
never metric labels. Gauges read a static snapshot without acquiring a learner
or completion-service lock.

Validate the contracts and focused extension behavior with:

```bash
python3 scripts/validate_curriculum_package_contracts.py --contracts-dir contracts/curriculum-package/v1.1
python3 scripts/test_assessment_completion_package.py
```

Install a validated completion ZIP into a private local test store by selecting
this software-pinned contract version explicitly:

```bash
python3 scripts/provision_curriculum_package.py install --store tmp/completion-package-store --zip path/to/completion.json.zip --contracts-dir contracts/curriculum-package/v1.1
```

Installation does not activate a package set. The existing explicit activation
and compare-and-swap rules still apply. Runtime activation and the completion
feature/profile allowlist are separate decisions.

The real Mathematics source build is declared by
`profiles/de-gymnasium-mathematik-completion-release-model-v1.profile.json`.
It includes the bounded `math-dot-product-projection` pilot. A successful build
or round trip proves technical package consistency; it does not publish the
package, activate the feature, approve unresolved redistribution reviews or
establish human/host acceptance.
