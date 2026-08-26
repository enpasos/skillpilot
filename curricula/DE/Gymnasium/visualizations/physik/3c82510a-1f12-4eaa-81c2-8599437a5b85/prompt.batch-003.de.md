# Imagegen-Audit – Schallausbreitung, Modellgrenze batch-003

- Modus: eingebauter OpenAI-Imagegen-Skill, Textkorrektur der fachlich überarbeiteten `batch-002`-Fassung
- Erzeugt am: 2026-08-26
- Kandidaten-SHA-256: `ac34cf582658e157a4c3f178db49f9f9541345aff88bccaa57265495410272cd`
- Freigabestatus: zusätzliche KI-Sichtprüfung, keine Human-Attestation

## Prompt

Use case: text-localization

Asset type: SkillPilot German physics learning-goal visualization

Input image: edit target; preserve every diagram element, position, color, particle/medium-element pattern, arrow, title, t1/t2/t3 row, green tracked element, compression/rarefaction labels, left bottom box, and legend exactly.

Primary request: Change only the wording inside the middle-bottom green box so the idealized-model qualification is scientifically explicit.

Replacement text (verbatim, two lines):

"im idealisierten Wellenmodell:
kein dauerhafter Nettostofftransport"

Constraints: retain the prohibition icon; use legible dark-green German text; fit cleanly in the existing box; preserve the wide landscape layout; no other changes; no logos; no watermark.

Avoid: the absolute phrase "kein Stofftransport", changing any physics diagram, moving the tracked green medium element, spelling errors, extra text.

## KI-Sichtprüfung

Die endgültige Fassung erhält alle fachlich geprüften Diagrammelemente der `batch-002`-Version und bindet die Stofftransport-Aussage ausdrücklich an das betrachtete idealisierte Wellenmodell. Damit leugnet sie weder akustische Strömung noch andere reale dissipative Effekte. Störung und Energie wandern nach rechts; das markierte Medienelement bleibt lokal in derselben Gleichgewichtsregion.
