# Composition view 1.3

A view assigns a role to a canonical atomic goal. The default is `target`. Preparations and voluntary offers use the same `projectionRole` field.

| Role | Meaning | Learning place |
|---|---|---|
| `target` | Regular target in this view | The normal projected place |
| `prerequisiteOnly` | Required preparation | An explicit `acquisitionPlacement: true` may locate a preparation at its place of acquisition |
| `voluntary` | Voluntary offer that the learner can select | One explicit `goalEntry` for the atom in the view |

A voluntary entry may represent a curricular goal or an assessment. It has one visible place. A section can consist entirely of voluntary offers. A voluntary offer can also appear alongside regular targets and preparations in the same section. The `acquisitionPlacement` field belongs exclusively to preparations. A canonical subtree can declare either of the first two roles. A voluntary entry that conflicts with another effective role or occupies more than one place is invalid.

Every prerequisite on a regular target’s mandatory path belongs to the regular targets or their preparations. A voluntary goal may depend on any of the three roles. An assessment that assesses a voluntary performance is itself voluntary. Selection and assessment credit follow their own rules. Merging views preserves the role from each source view. Regular targets and required preparations take precedence in the merged view.

The source schema and `viewFormatVersion` both identify format 1.3. The package successor transports it as version 1.3 in its runtime view. Earlier view versions retain their closed role vocabulary. Display order, explicit partial sibling order and preparation-place semantics follow the existing 1.2 contract.
