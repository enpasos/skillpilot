# Independent thermal/fluids mapping audit — 2026-09-21

Second AI reviewer: mechanics/methods lane agent, independently examining the root-authored thermal lane. Reviewed all 25 material records, every linked current canonical goal description, and the complete target subsection text from the 2026-09-21 provider snapshot. This is not human approval or an assessment of the whole provider.

## Outcome

The optional, deliberately partial mappings are substantively useful. Kept 24 entries and replaced one entry's target with a safer, genuinely relevant subsection; total remains **25 materials / 33 distinct goals**. No canonical curriculum, state, or M7 artifact changed.

## Required correction made

Replaced `thermal-latent-heat` with `thermal-phase-change-particle-model`, targeting `states-of-matter-and-phase-transitions.html#states-of-matter`, sections 14.4.1–2, for goal `873c6371-4ffb-582b-8d8d-3f45f968ba08`.

Reason: the previous target, `effects-of-heat.html#latent-heat`, describes phase-transition energy as changing the **molecular structure**. That wording is centrally misleading for this exact particle-model goal: ordinary melting/condensation changes arrangement/interactions/mobility, not the identity or internal chemical structure of the water molecules. The replacement distinguishes particle arrangements and names the transitions. Its rationale explicitly leaves energy uptake/release and model limitations as further teaching work. This is bounded useful support, not full coverage of the goal.

## Requested focus checks

- **Adiabatic process:** keep. Q=0, mechanical compression/expansion, the particle/energy argument and comparison with isotherms are directly useful. The final claim of being the universally most efficient conversion is unsupported and the source gives only qualitative approximations. Existing rationale correctly restricts use to the piston-work model and rejects a general efficiency claim or universal expansion-cooling rule. No requirement to pretend this resource covers arbitrary irreversible adiabatic processes.
- **First law:** keep. The target section itself gives ΔU=W+Q with work/heat supplied, matching the canonical work-on-system convention. Neighboring formulas switch to work-by-system convention; the rationale explicitly fences them off. Quantitative practice and a selected closed-system boundary remain legitimate additional teaching.
- **Isobaric p-V work:** keep. pΔV with expansion-positive work-by-system is internally consistent in this specific subsection and the goal permits an explicitly stated convention. Do not combine its W sign silently with the first-law W sign.
- **Heat capacities:** keep as partial conceptual support. The source's mass-specific cp/cv comparison explains why isobaric heating requires additional work. It does not claim to teach the complete molar nCΔT calculation; this limit is already explicit.
- **Entropy example:** keep. For ideal large constant-temperature reservoirs, ΔS_h=−Q/T_h, ΔS_c=Q/T_c and their positive sum are correct. These expressions are legitimate reservoir state changes even though the exchange between reservoirs is irreversible. In general the total, not the hot subsystem separately, increases. The attached goals are supported by this concrete case; phase transitions and general variable-temperature paths are not claimed.
- **Second law:** keep. The subsection explicitly limits ΔS≥0 to an isolated system and presents spontaneous heat flow, friction, mixing and irreversibility. Free expansion, microscopic explanation and formal entropy-production balances remain additional work; partial support is appropriate.
- **Carnot bound:** keep. The explicit formula 1−T_K/T_H matches the goal and the reversible-cycle restriction. The earlier erroneous Stirling discussion is not thereby approved. Measured real-machine efficiency and loss attribution remain further work.
- **Angle of attack:** keep. The short passage directly identifies wing orientation relative to the flow and its influence on both lift and drag, matching a qualitative classification goal. A complete lift derivation is neither supplied nor required of this optional link.

## Remaining sample checks

Archimedes, density/displacement, liquid-thermometer mechanism, temperature and particle movement, linear thermal expansion, conduction/convection, isobaric/isochoric gas laws, pV=nRT, translational kinetic energy versus temperature, quadratic drag, incompressible-flow continuity and Stefan–Boltzmann were checked against the selected source subsections. The package rationales correctly limit scope where a practical measurement, additional model assumptions or other mechanisms are still required.

Known defects excluded in `thermal-review.md` remain excluded; a neighboring section's availability does not confer provider-wide quality approval. Authoring hashes, source section markers and the live-link check are separate technical checks and do not replace this content review.
