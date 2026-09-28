# HE Q4.2 source-mapping audit — `fde351a8…`

Scope: fachliche Prüfung on 2026-09-27. This audit made no mapping, canonical-goal, registry, image or D-status change.

## Finding

The current HE Sek-II source-extraction mapping links `he-math-sekii-q4-2-b08-a02-a1b42ed0` to canonical `fde351a8-98b1-5d75-b4df-813beb2bbe3c` with `matchType: "exact"` (`curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_math_upper_secondary_source_extraction_to_canonical_math.review.json`, mapping near line 2363). This is **not fachlich defensible as exact**. The official KC Q4.2 example says “Begründen und interpretieren gegebener Terme”: it starts with *given* terms and asks for justification/interpretation. The canonical goal says “Beziehungen zwischen Größen als Gleichungen, Ungleichungen oder Funktionen formulieren und die Bedeutung der Terme im Kontext deuten”: it additionally requires constructing symbolic relationships from quantities, across three expression types and a context. The shared verb “deuten/interpretieren” does not establish equivalence for the formulation step. The existing mapping rationale infers “Modellbeziehungen” and “strukturiertes Formulieren” from that Q4.2 source span; neither appears in this particular official aspect. The same aspect is mapped `exact` to two further, different canonical goals, which also warrants separate review, not an automatic inference of three equivalent competencies.

Evidence: the current canonical description is in `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json`; the literal aspect and sourceRef are in `curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_MATHEMATIK_SEKII_KC2024.source-extraction.json` near line 7935. In the local official HMKB PDF `curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf`, Q4.2 begins on printed p. 51, but this particular “gegebener Terme” bullet is on **printed p. 52**. Thus the extraction's `S. 51` reference for this aspect is also imprecise. The older HE source-JSON snapshot has an identically worded authored goal `c181f8cb-1d7c-4b38-9de7-618221daf98d`; that repetition is not independent official-source corroboration.

## Better HE primary-source candidates and limits

- HMKB KC, competency **K3 Mathematisch modellieren**, printed pp. 14 and 22: the general description explicitly includes constructing suitable mathematical models, translating real situations into them, and interpreting results; K3.2 concerns direct translation, K3.4 multistep modelling and K3.7 complex situations with variables/conditions. These are closer evidence for the *model-construction* action than Q4.2's given-term example. They are not currently atomic source goals in this HE topic-field source extraction and do not, alone, explicitly name equations, inequalities *and* functions.
- HMKB KC **E.1**, printed p. 31, source goal `he-math-sekii-e-1-b03-a01-e27a668f`: “Modellieren von Realsituationen durch geeignete Funktionsklassen, insbesondere mithilfe von linearen und quadratischen Funktionen.” This directly supports constructing function models, but only a narrower function-class instance, not the full canonical scope.
- HMKB KC **E.3**, printed p. 32, source goals `he-math-sekii-e-3-b02-a01-810951cd` (modelling Sachzusammenhänge) and `he-math-sekii-e-3-b02-a02-0969f29b` (“Bestimmen geeigneter Funktionsgleichungen”). Together they are closer to formulating a function equation from a context, but are again a topic-specific subset. The existing reviewed mappings of these E.1/E.3 source goals already point to their own canonical content goals; do not silently repurpose or remove those links.
- Q4.2's first bullet, `he-math-sekii-q4-2-b01-a01-05af313f`, says “Erkennen und Formulieren mathematischer Probleme” (printed p. 51), not formulating relationships as equations/inequalities/functions. It is no exact replacement.

## Conservative correction recommendation and consequences

In a separate, source-review-authorized change, **remove the `exact` Q4.2-b08-a02 → `fde351a8…` edge**, reconcile that source goal's `canonicalGoalIds` and rationale, and correct the page reference to p. 52 (or a precise p. 51–52 passage reference). Do **not** merely relabel the edge `partial` and count it as full evidence: a limited `partial` link could be retained only after the reviewer explicitly documents that it covers *interpretation of given terms only* and verifies that the pipeline treats it as limited coverage. For positive HE Sek-II evidence of the current formulation goal, review a dedicated K3 process-competency extraction and/or narrowly scoped E.1/E.3 `partial` links, with their limits stated; no inspected official span alone proves the complete equation/inequality/function wording as an `exact` match. Reconsider the goal's `K2.3` process tag versus the KC's K3 modelling competencies separately, without assuming K2.3 must be deleted.

Removing this edge would remove the **only current HE upper-secondary source-extraction mapping to `fde351a8…`**. The older snapshot mapping/provenance repeats the authored goal, and HE Sek-I mappings have a different stage and cannot automatically close this HE Sek-II source question. Re-run mapping/source-coverage, applicability, provenance/fingerprint and dependent QA checks after any later authorized change; the visible HE coverage and any D evidence may change, but this note makes **no** closure or central-D claim.

## Umsetzung am 27.09.2026

Die oben beanstandete `exact`-Kante wurde aus `mappings[]` und den
`canonicalGoalIds` der Q4.2-b08-a02-Entscheidung entfernt. Deren Begründung
nennt die Grenze des Quellenausschnitts ausdrücklich; die zwei übrigen
Kanten wurden nicht automatisch freigegeben oder umetikettiert. Kanonischer
Zieltext, Bild und D-/P-Entscheidungen sind unverändert. Mapping-Parität,
Source-Coverage-Audit und Scope-Check bestehen. Der aktuelle
HE-Oberstufen-Source-Extraction-Nachweis für `fde351a8…` ist damit offen,
auch wenn ältere HE-Provenienz das Ziel weiter sichtbar hält.

Die Druckseiten wurden anschließend getrennt korrigiert: Q4.2-Bullets 8–13
verweisen nun in Extraktion und abgeleiteten Nachweisen auf Druckseite 52;
die früheren Bullets bleiben auf Seite 51. Das ist eine Quellenreferenz-,
keine D-Freigabe.

## Ergänzender BW- und Kompetenz-Audit

Die amtliche BW-Prozesskompetenz 2.3(5) nennt das Beschreiben von
Größenbeziehungen mit Variablen, Termen, Gleichungen und Funktionen (neben
weiteren Darstellungen), jedoch weder **Ungleichungen** noch das
**Deuten der Terme im Kontext**. Die bisherige BW-`exact`-Kante von
`bw-math-sekii-bp2016-2-3-05-c7218c3a` auf `fde351a8…` ist deshalb
zu `partial` korrigiert und die Mapping-Begründung begrenzt. Die beiden
anderen Zuordnungen dieses BW-Quellziels wurden nicht geändert. Der
BW-Befund schließt das kanonische Ziel nicht vollständig.

Außerdem trägt `fde351a8…` wie sein Elterncluster „Mathematische Modelle
aufbauen“ derzeit `processCompetencies: ["K2.3"]`. Das amtliche HMKB-KC
beschreibt K2.3 auf Druckseite 21 als Problemlösen durch mehrere
Heurismen/Beurteilung von Lösungswegen, während Modellkonstruktion und
-interpretation unter **K3** auf Druckseiten 14 und 22 stehen. Eine
pauschale K2.3→K3-Umetikettierung des ganzen Zweigs wäre ohne Prüfung
seiner vier Kinder und der abhängigen QA-Nachweise voreilig. Dies ist ein
getrennter Metadaten- und Quellenidentitäts-HOLD, nicht bloß ein
Textformulierungsproblem. Der D-Status bleibt offen.
