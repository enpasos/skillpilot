# Gezielte A/M- und SemanticKind-Nachprüfung

Prüfung: 2026-09-21, codex-m7-proof-statistics-hold-repairs-20260921; maschinell, keine neue Humanentscheidung.

Ergebnis: Drei einzeln nachgeprüfte Textziele bleiben **atomic / no_memory_needed**. Bei SemanticKind bleiben alle acht Ziele **curricularAtomic**; exakt sieben geänderte Fingerprints werden neu gebunden, beim reinen Bild-Delta bleibt der Record unverändert. Nenner weiterhin 797 curricularAtomic bei 1187 Gesamtzielen.

## Baumdiagramme und Pfadregeln für zusammengesetzte Experimente nutzen

`efc3506a-5f35-4d77-9498-d70a091a470b` — geändert: requires.

Baumdarstellung und Pfadregeln bilden weiterhin eine zusammenhängende Kompetenz zum Strukturieren und Berechnen mehrstufiger Zufallsexperimente. Das Entfernen direkter Voraussetzungen zu Boxplots und Sekundärquellendaten ändert den Inhaltskern nicht; beide sind für eine konkrete Baumrechnung keine notwendigen eigenständigen Voraussetzungen. Der Typ bleibt curricularAtomic.

Nur zwei direkte requires-Kanten entfernt. Die Ziele b819973b und bc1a4cba bleiben transitiv über das unveränderte Laplace-Ziel 5ab17678 erreichbar; diese begrenzte Direktkantenkorrektur ist keine vollständige transitive Routenbereinigung.

A/M: Native Fingerprints unverändert; aktive Records nicht neu geschrieben.

## Widerlegung verständlich formulieren

`f84ea3d8-c255-552a-998a-202e42843f56` — geändert: description, descriptionEn, resourceLinks.

Die neue Fassung beschreibt genau eine prüfbare kommunikative Handlung: eine allgemeine Aussage durch ein gültiges Gegenbeispiel widerlegen. Aussage, erfüllte Voraussetzungen, verletzte Folgerung und Schluss sind Bestandteile derselben Argumentation und keine unabhängigen Routinen. Fachlich korrigiert wird die alte Mehrdeutigkeit von „verletzte Bedingung“: Ein Gegenbeispiel muss die Voraussetzungen erfüllen. CurricularAtomic bleibt richtig.

DE und EN präzisieren die Logik des Gegenbeispiels; neues Visualisierungsresource betrifft die Darstellung, nicht den semantischen Typ.

A: Nachprüfung 2026-09-21: Die Widerlegung einer allgemeinen Aussage durch ein Gegenbeispiel ist eine einzelne prüfbare Argumentationshandlung. Das Nennen der Aussage, Prüfen der erfüllten Voraussetzungen, Zeigen der falschen Folgerung und Erläutern des Schlusses sind logisch abhängige Teile dieses einen Produkts. Die neue Fassung beseitigt die missverständliche „verletzte Bedingung“, ohne eine zweite Kompetenz hinzuzunehmen; atomic bleibt begründet.

M: Nachprüfung 2026-09-21: Entscheidend ist, an einem konkreten Gegenbeispiel die Voraussetzungen zu prüfen und den Widerspruch zur Folgerung nachvollziehbar auszudrücken. Ein auswendig gelernter Vier-Schritte-Satz zeigt diese Leistung nicht. Geeignete und ungeeignete Beispiele sowie eigene Widerlegungen sind die passende Übung; kein eigener kompakter Abrufbestand und daher weiterhin no_memory_needed.


## Beweisstrategien vergleichen und wählen (LK)

`01217f4a-5221-5df9-b379-7b241fccf809` — geändert: requires.

Eine begründete Auswahl geeigneter Beweisstrategien für eine konkrete Behauptung ist eine einzelne vergleichende Prozesskompetenz; die Liste direkt/Kontraposition/Widerspruch/Induktion benennt die Alternativen dieser Auswahl und fordert nicht vier eigenständige Beweise. Bedingte Wahrscheinlichkeiten sind keine universelle Voraussetzung für diese Auswahl. Die entfernte Kante ändert weder Inhaltskern noch curricularAtomic-Typ.

Nur die fachfremde direkte Kante zur Berechnung bedingter Wahrscheinlichkeiten entfernt. Vorhandene beweisbezogene Voraussetzungen und Zieltext bleiben gleich.

A/M: Native Fingerprints unverändert; aktive Records nicht neu geschrieben.

## Gegebenes und Gesuchtes bestimmen

`a288231e-e4bb-5c65-b018-b79a51ca87d8` — geändert: requires.

Gegebenes, Gesuchtes und Nebenbedingungen sind die zusammengehörigen Bestandteile einer strukturierten Problemerfassung. Das Identifizieren und Notieren dieser Bestandteile bleibt ein prüfbares Produkt; es ist weder Motivation noch Assessment-Endpunkt. Die Produktregel der Kombinatorik ist keine allgemeine Voraussetzung für diese Problemerfassung. CurricularAtomic bleibt richtig.

Nur die direkte Kante zu grundlegenden Zählprinzipien entfernt; keine neue Fachkompetenz, kein veränderter Anspruch und kein A/M-Fingerprintwechsel.

A/M: Native Fingerprints unverändert; aktive Records nicht neu geschrieben.

## Null- und Alternativhypothesen formulieren

`f14e1643-ad8d-5235-a832-97987fa18489` — geändert: requires.

Das Formulieren eines zum Anteilsproblem passenden Null-/Alternativhypothesenpaares einschließlich Parameter und Richtung ist eine zusammenhängende binomiale Testmodellierung. Elementare Ableitungen sind dafür nicht nötig; ihre entfernte direkte Kante ändert den curricularAtomic-Inhalt nicht.

Nur die direkte Ableitungs-Voraussetzung entfernt. Das ist keine fachliche Neubewertung sämtlicher unverändert verbleibender Voraussetzungen.

A/M: Native Fingerprints unverändert; aktive Records nicht neu geschrieben.

## Fehlerwahrscheinlichkeiten berechnen

`78bfbde4-8e16-529e-bd53-4e29d960b2b2` — geändert: description, descriptionEn, resourceLinks.

Die neue Fassung macht die zur Fehlerberechnung nötigen Verteilungen explizit: α unter H0, β bei einem angegebenen wahren Alternativparameter. Beide Größen bewerten die Fehlerereignisse derselben vorgegebenen Entscheidungsregel; Berechnung und Nachvollzug bilden eine einzige Testauswertungsroutine. CurricularAtomic bleibt richtig.

DE/EN ergänzen die zuvor fehlende Bestimmungsbedingung für β. Das altText-Delta beschreibt das vorhandene Testbeispiel, führt aber keine neue Kompetenz ein.

A: Nachprüfung 2026-09-21: Die Berechnung von α als Wahrscheinlichkeit des Verwerfungsbereichs unter H0 und von β als Wahrscheinlichkeit des Nichtverwerfungsbereichs bei einem angegebenen Alternativparameter ist eine zusammenhängende Fehleranalyse derselben Entscheidungsregel. Die nun expliziten Verteilungsannahmen machen die Berechnung bestimmt; Werkzeugnutzung und Erläuterung prüfen denselben Rechengang. Keine unabhängige zusätzliche Routine, daher weiterhin atomic.

M: Nachprüfung 2026-09-21: Die Zielhandlung besteht darin, aus Entscheidungsregel und wahrem Parameter das richtige Fehlerereignis und die passende Verteilung zu wählen und die Wahrscheinlichkeit nachvollziehbar zu berechnen. Das benötigt variierte Testfälle statt isolierter Zahlen- oder Formelabfrage. Die Präzisierung von β schafft keinen zusätzlichen notwendigen Abrufbestand; ein neues zielbezogenes Memory-Deck ist nicht gerechtfertigt, daher no_memory_needed.


## Konfidenzdiagramme deuten (LK)

`77d607e0-0244-55ca-ba0f-214baa94b8de` — geändert: descriptionEn.

Konfidenzdiagramme lesen und damit die Aussagekraft von Stichprobenergebnissen beurteilen bleibt eine einheitliche diagrammgestützte Inferenzkompetenz. Stichprobenumfang, Konfidenzniveau und Intervallbreite sind miteinander verknüpfte Interpretationsgrößen. EN „how informative“ entspricht DE „Aussagekraft“ und vermeidet eine ungewollte Signifikanztest-Kompetenz. CurricularAtomic bleibt richtig.

Nur EN: „the significance of sample results“ wird zu „how informative sample results are“. Deutscher Inhalt, Voraussetzungen, Anspruch und Bildressource bleiben gleich.

A: Nachprüfung 2026-09-21: Das Lesen von Konfidenzdiagrammen und die Beurteilung der Aussagekraft einer Stichprobe sind ein zusammenhängender Interpretationsvorgang. Die Beziehungen zwischen Stichprobenumfang, Konfidenzniveau und Intervallbreite werden am selben Diagramm beurteilt. Die englische Präzisierung zu „how informative“ entfernt eine mögliche Verwechslung mit Signifikanztests, ohne neue Teilkompetenz; weiterhin atomic.

M: Nachprüfung 2026-09-21: Lernende müssen aus konkreten Konfidenzdiagrammen Aussagen zu Breite und Informationsgehalt begründet gewinnen. Diese Leistung wird durch Diagrammvergleiche und veränderte Stichprobensituationen geübt, nicht durch das Reproduzieren eines Merksatzes. Die reine EN-Präzisierung bringt keine neuen abrufpflichtigen Fakten oder Formeln; weiterhin no_memory_needed.


## Plausibilität mit Beispielen testen

`1e164a09-0a2b-55ab-b927-08a4a278f72b` — geändert: resourceLinks.

Geeignete Beispiele sowie Rand- und Spezialfälle begründet auswählen, um eine Aussage auf Plausibilität zu prüfen, bleibt eine einzelne assessierbare Prozesskompetenz. Ein hinzugefügtes Bild verwandelt diese Handlung weder in eine Orientation noch in einen Memory- oder Assessment-Knoten. CurricularAtomic bleibt richtig.

Ausschließlich eine primäre Bildressource hinzugefügt. ResourceLinks sind kein Feld der nativen A-/M- oder SemanticKind-Fingerprints; alle drei Bindungen bleiben unverändert aktuell. Keine erneute V-Abnahme in dieser A/M-Nachprüfung.

A/M: Native Fingerprints unverändert; aktive Records nicht neu geschrieben.

## Audit und Grenzen

Die JSON-Datei enthält alle acht vollständigen Vorher-/Nachher-Ziele und fachlichen Gründe; die drei bisherigen A- und M-Records stehen zusätzlich bytegleich als JSONL-Receipts, alle acht bisherigen SemanticKind-Records als JSON-Receipt. Ausschließlich die drei aktiven A-/M-Einzelrecords und die sieben betroffenen SemanticKind-Quellfingerprints werden geändert; keine anderen Kinds, Zählungen, Canonical-, D-/P-Registry- oder QA-Felder.

Reproduzierbare Fingerprintprüfung: `node --import ./app/node_modules/tsx/dist/loader.mjs curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-21/m7-proof-statistics-hold-repairs-v1/verify-native-bindings.mjs --check`.

Die übergreifende Curriculum-Quality-Status-/Maturity-Floor-Regeneration bleibt beim integrierenden Root-Batch. Diese Nachprüfung übernimmt keine neue V-/Bildfreigabe und keine vollständige Routen-Neuautorierung.

## Native Prüfungen nach dem gezielten Patch

- Semantic Atomicity: PASS, 797/797 atomic; 0 missing, stale, non-atomic oder Developer-Review.
- Memory Card Review: PASS, 758 no_memory_needed + 39 memory_required; 64/64 Primärkarten behalten, 6/6 Memoryziele getraced, keine fehlenden/veralteten Records oder Sichtbarkeitsprobleme.
- Eigener nativer Binding-Recheck: PASS für alle acht; unveränderte übrige A/M-Zeilen und unveränderte SemanticKind-Zählungen.
- Original-Receipts und git diff --check: PASS. Exakte Befehle und Ausgaben stehen in validation.json.
