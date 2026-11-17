# Composition view 1.2: explicit partial child order

This source-view contract extends the closed composition tree with optional
`childOrder: {"after": [{"unit": "later-child-id", "after": "earlier-child-id"}]}`
on a structure. Both endpoints identify direct structure children. The declaration
replaces that parent's implicit sibling planning order in full; an empty `after`
declares no extra planning order. Omission preserves the legacy behavior. Child
array order still determines display order.

Semantic validation rejects unknown or nonsibling endpoints, self edges,
duplicates, cycles and transitively redundant edges. Filtering retains declared
reachability through removed intermediate children, then reduces it again. It
never creates adjacency from the remaining display order. Actual canonical
prerequisites remain intact and visible. Verified stage-plan bindings take
precedence over this compatibility-view order.

The schema ID is
`https://skillpilot.com/schemas/composition-view/v1.2/composition-view.schema.json`
and `viewFormatVersion` is `1.2`. This is a composition-view format version,
independent of curriculum-package runtime versions. Existing package schemas,
historical profiles and v1/v1.3 view contracts remain unchanged. A package
consumer must transport and validate the new declaration losslessly; dropping
it or relabeling it as a v1 view changes the authored meaning.
