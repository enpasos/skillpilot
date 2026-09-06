# B035 — begrenzter Quellen-/Umfangsabgleich: relative Streuung

Stand: 2026-09-06, aktuelle lokale Dateien ab 08:20:51 UTC gelesen. Ziel ausschließlich `5b54f272-f588-5009-8b42-eb15f846d3e2`. Read-only-Prüfung; kein neues Description-Review und keine Einsicht in Runde A oder positive Gegenprofile.

## Ergebnis

Die Ergänzung **n≥1 und 0<p<1** präzisiert den Gültigkeitsbereich der bereits vorhandenen Variationskoeffizienten-Abnahmeaussage. Sie führt weder eine neue Methode noch eine andere Kompetenz ein. Für ganzzahliges n≥1 und festes 0<p<1 ist

`σ/μ = √(np(1−p))/(np) = √((1−p)/p) · 1/√n`.

Der Vorfaktor ist positiv, daher nimmt der Quotient streng ab. Bei p=0 (ebenso n=0) ist μ=0 und der Quotient undefiniert. Bei p=1 und n≥1 ist er dagegen **definiert, aber konstant null**. Die Ergänzung darf nicht als Behauptung verstanden werden, der Quotient sei auch bei p=1 undefiniert. Die bereits beanspruchte Berechnungs-/Begründungskette und stabile Zielidentität bleiben erhalten.

Die bestehende normative Quellenlücke bleibt davon unabhängig offen.

## Tatsächliche Quellenbindung

- Die direkte UUID-Suche unter `curricula/DE/Gymnasium/mapping` liefert nur die [HE-Legacy-Zuordnung](/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_math_upper_secondary_to_canonical_math.json:1106): Legacyziel `46eadb86-072f-4939-8f32-6467aa2b7272` → dieses Ziel, `matchType: exact`. Kein direkter normativer Source-Extraction-Mappingeintrag für die Ziel-UUID wurde gefunden.
- Die [Provenienz](/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/provenance/canonical-goal-provenance-registry.json:1304) nennt denselben HE-Legacy-Ursprung, Landscape `2796fc7b-ba9d-446f-8f26-711dd6d8a9a3`. Das [Legacyziel](/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/input/HE/upper-secondary/source-json/DE_HES_S_GYM_2_MATHEMATIK.de.json.snapshot:6499) enthält bereits die gleiche Quotienten-/Abnahmebehauptung, aber keine konkrete normative Einzelklausel. Migration/Provenienz ist deshalb kein neuer Normdeckungsnachweis.
- Die aktuelle [Kanonik](/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json:49400) hat für das Ziel keinen `sourceRef`. Die geprüfte Surrogate-Evidence-Registry enthält keinen direkten UUID-Eintrag.
- Lokal unmittelbar gelesen: [HE-Kerncurriculum, Q3.2, gedruckte S. 47](/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf), mit [Extraktion Q3.2](/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_MATHEMATIK_SEKII_KC2024.source-extraction.json:614). Die Klausel zu binomialverteilten Zufallsgrößen nennt Erwartungswert, Varianz, Standardabweichung, Histogramme und kumulierte Verteilung; sie nennt nicht ausdrücklich Variationskoeffizient oder dessen n-Abnahme.
- Ebenfalls unmittelbar gelesen: [SH-Fachanforderungen 2024, gedruckte und PDF-S. 71](/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/input/SH/Fachanforderungen_Mathematik_Sekundarstufe_2024_barrierearm.pdf). Die dortigen Kenngrößen- und Binomialklauseln tragen Erwartungswert/Standardabweichung und deren Interpretation, nicht ausdrücklich den Quotienten oder dessen Abnahme. [Extraktionszeile zum Binomialinhalt](/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/input/SH/upper-secondary/source-extraction/DE_SH_MATHEMATIK_SEKII_FACHANFORDERUNGEN_2024.source-extraction.json:6847). Keine Übertragung einer Geschwisterdeckung auf dieses Ziel.

Das ist ein begrenzter Befund zu den vorhandenen direkten Bindungen und zwei einschlägigen lokalen Stellen, keine bundesweite Negativbehauptung. Es wird keine neue Source-Abdeckung, Quellenfreigabe oder Humanfreigabe erteilt.

## Tatsächliche Abhängigkeiten

- Ein direkter Vorgänger: [`7d41b805…`, Kenngrößen binomialverteilter Zufallsgrößen](/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json:49332). Erwartungswert und Standardabweichung liefern genau die Größen des Quotienten. Die Gültigkeitspräzisierung verlangt keinen neuen Vorgänger; weder Vorgänger noch dessen Beschreibung werden hier neu bewertet.
- Ein direkter Nachfolger: [`9cf020ee…`, Assessment „Verteilungen in Kontexten nutzen“](/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json:72188). Ziel-UUID steht in `requires` und `examData.coveredGoalIds`. Der konkrete Fall verwendet n=250, p=0,06 und liegt damit im präzisierten Bereich. Die Aufgabe berechnet μ und σ, fordert aber weder σ/μ noch dessen n-Abnahme ausdrücklich; die Metadatenreferenz ist kein eigener Leistungsnachweis für diese Kompetenz. Kein Nachfolger-Edit wird aus der lokalen Präzisierung abgeleitet.
- [Memoryentscheidung, Zeile 560](/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/quality/memory-card-review/canonical-math-full.review.jsonl:560): `no_memory_needed`, `memoryUseful:false`, keine eigenen Memoryziel-/Deck-IDs. Nach dem tatsächlich gelesenen [Fingerprintalgorithmus](/home/enpasos/projects/skillpilot/app/scripts/memoryCardReview.ts:177) passt der aktuelle Fingerprint `sha256:d0739484acf78f238d0fd5b8d490fd201175984a240b3c40a2f3d784b1961555`. Übernahme exakt der beiden vorgeschlagenen B-Texte würde ihn auf `sha256:6b64f05ae4fcac636311c9e442a8e1b056ae6a8d949dd12312d9ebedb7729684` ändern: bestehende Bindung wäre dann technisch stale, obwohl diese reine Bedingungspräzisierung keinen fachlichen Anlass für ein neues Deck liefert. Hier wurde nichts neu gebunden.

## Bildbindung

Das [aktuelle Bild](/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/visualizations/mathematik/5b54f272-f588-5009-8b42-eb15f846d3e2/5b54f272-f588-5009-8b42-eb15f846d3e2.jpg) wurde visuell betrachtet, sein [Prompt](/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/visualizations/mathematik/5b54f272-f588-5009-8b42-eb15f846d3e2/prompt.de.md:1) und der genaue [QA-Eintrag](/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json:16297) gelesen.

Kanonisches Bild und Public Asset haben beide den gebundenen Digest `sha256:6f94379b2ef4f34e8509d861fad291fbe811fb596f63111d2e273fbd6b65d174`. Alle drei Bildfälle verwenden p=0,25 sowie n=4,16,64; μ=1,4,16, σ≈0,87;1,73;3,46 und σ/μ≈0,87;0,43;0,22 wurden rechnerisch geprüft. Diese Fälle bleiben unter der Ergänzung gültig.

Die allgemein formulierte Abnahme-Sprechblase nennt die Randbedingungen nicht eigens, steht aber über den drei festgelegten p=0,25-Beispielen. Die Beschreibung ist außerdem wörtlich in Alttext, Prompt und QA-Metadaten kopiert: Diese Text-/Seitenbindungen sind bei einer Übernahme gezielt auf Aktualität zu prüfen. Daraus folgt keine automatische Notwendigkeit einer Bildneugenerierung und keine neue Bildfreigabe. Bestehendes `aiApproved:yes` ist ein früherer bytegebundener QA-Status; `humanApproved:no` bleibt unverändert.

Schreibumfang dieses Auftrags: ausschließlich diese Notiz per apply_patch. Keine Kanonik-, Mapping-, Registry-, Review-, Memory- oder Bildänderung.
