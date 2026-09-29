# SL-only Cavalieri target in shared sphere trees

The new `baea3966-5d10-53bf-8193-3fcda7b1e73f` derives the sphere-volume
formula with Cavalieri. Its direct source is the Saarland Sek-I curriculum;
the goal's `applicability.jurisdiction` is therefore `DE-SL`, and the source
mapping inheritance boundary prevents shared sphere-cluster mappings from
serving as evidence for it elsewhere.

The shared J10 sphere cluster still contains this atom. A `canonicalSubtree`
reference to that cluster expands it into 32 authored non-SL Mathematics
views even though the source boundary is correct. Each such view now has a
direct `prerequisiteOnly` goal entry for this atom, which takes precedence
over the broader subtree's inherited target role. The six generated HE/RP/SH
Sek-I templates exclude it before their duration views are built. The SL
views retain it as a target. This is a targeted projection decision, not a
claim of source evidence in the other jurisdictions or human approval.

The curriculum source-coverage audit must report zero unsupported visible
atomic goals after this change. A later composition-model migration can
replace these explicit overrides with a reviewed applicability-aware
projection rule; this checkpoint does not alter general projection semantics.
