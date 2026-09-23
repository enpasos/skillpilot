# Independent visual review — taxi model forms, candidate v1

- Date: 2026-09-23
- Goal: `07196e72-ba47-54bf-a096-3a79bbb67e23`
- Decision for `candidate-v1.png`: **HOLD / `rejected_regenerate`**. Do not import or bind it as approved V evidence yet.
- Candidate SHA-256: `234b2a43b6cbfe7cac257f5d1f574c04a123f2ca49591f2cc53da26d46f0c095` (1679 × 937 PNG).
- Active source JPG SHA-256: `ee466836b3cc63ac91d50cfa85d479bf0dc2c4b84451916a787ddd47868cc825` (2752 × 1536 JPEG).
- Review basis: both actual images viewed at original resolution; current canonical DE/EN title and description; documented generation prompt; `AGENTS.md` §7.3 and `docs/concept/skill-graph/atomic-goal-visualizations.md` quality gate.

## Fachliche finding

The candidate correctly shows a whole fare `K(x)=4+2x` for `x` km, with `4 € Grundpreis` and `2 €/km Streckenpreis`. `K(x)=20` is paired with `genau 20 €`; `K(x)≤20` with `höchstens 20 €`. Symbols, values, units and inequality direction are correct. The friendly comic style is appropriate. The original JPG instead points from `p·x` to the label `Fahrtkosten`, although `K(x)=G+p·x` includes a separate base charge. That old label is misleading; the current QA record still lists `humanApproved: yes` for this exact JPG hash and needs separate adjudication in the integration workflow.

The candidate's orange arrow from card 2 (`Gleichung: K(x)=20`) to card 3 (`Ungleichung: K(x)≤20`), reinforced by `1 → 2 → 3`, portrays a sequence or transformation. For this example, “exactly 20 €” and “at most 20 €” are **alternative questions** about the same fare function, not successive steps or equivalent statements. The wording below the cards reduces but does not eliminate the misleading visual implication. The hard image gate rejects misleading mathematical representations even when individual formulas are correct. Minimal image correction: keep the taxi, numbers, cards, colors and function, but make the `Gleichung` and `Ungleichung` cards separate branches from the fare function or remove the 2→3 arrow and step numbering. Retain `genau`/`höchstens` as their distinct contextual reasons. Reinspect the actual corrected pixels, including cockpit card-width readability, before any import.

## Goal and source alignment

The canonical description says, in German and English, that the learner formulates relationships as equations, functions **or inequalities** and justifies the modelling choice. The current titles `Beziehungen als Modellgleichungen aufstellen` / `Set up model equations` name only equations, so the title mismatch is independent of this image. The candidate heading `Beziehungen mathematisch modellieren` is broader and does not add content beyond the descriptions. A minimal title pair that states the existing scope is `Beziehungen als Funktion, Gleichung oder Ungleichung modellieren` / `Model relationships as a function, equation or inequality`; the owner can choose comparably precise wording. Do not narrow the descriptions merely to match the old titles. The function/“exactly”/“at most” contrast is a suitable orientation example for model choice; the image need not teach a full justification or serve as assessment evidence.

The HE upper-secondary source snapshot for predecessor `bd75c529-ac82-4d95-bcf6-7a6c072d1f0b` carries the same DE/EN title-description mismatch, and the canonical goal is mapped exactly from it. The HE Sek-I source mappings also connect this goal to broad real-world problem contexts; they do not prescribe taxi values or a particular image. Thus the proposed branch correction and title alignment preserve the currently claimed modelling scope. This review does not certify external normative-source coverage or D/P/A/M gates.

No canonical goal, asset, QA ledger, public copy, mapping, provenance, or import was changed by this review. A corrected candidate needs its own hash-bound image decision; any substantive title/image change also needs the usual targeted D/P/A/M/V and release-evidence checks.
