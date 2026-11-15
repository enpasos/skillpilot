# Unabhängige Beschreibungsprüfung A – drei aktuelle Physikziele

Prüfidentität: Codex-Unteragent `/root/physics_three_d_blind_a`, eigener Erstpass vom 15. November 2026. Laufkennung: `physics-current3-blind-a-20261115`. Die Autorenschaft der drei bestehenden Beschreibungen oder V2-Profile liegt nicht bei diesem Prüflauf. Die Ergebnisse sind ausschließlich `candidate` / `ai_candidate`.

Geprüft wurden die vollständigen gebundenen Anweisungen, Physikkriterien, das Datensatzschema, die Kampagne und die drei Datensätze aus `three-native-d/round-a/batches/independent-a.batch-001.input.jsonl`. Das native `three-review-bundle/book.pdf` wurde mit PyMuPDF in fünf PNG-Seiten gerendert. **Alle fünf Bilder wurden tatsächlich betrachtet**: Deckblatt, Gliederung sowie die drei Lernzielseiten auf PDF-Seiten 3–5. Die Darstellungen für Rundung, Querschnitt/Ladungstransport und Dotierung waren lesbar. Die eigene Sichtung beruht nicht nur auf Textextraktion. Aus dem gebundenen Buchmodell wurden zusätzlich Buch-/Quellbindungen und nur die ausgewählten Ziele mit ihren direkt genannten Nachbarn gelesen.

Es wurden keine anderen Reviewdateien, frühere Durchgänge, Adjudikationen, QA-Diagnosen, kanonischen Diffs oder Dateien von Runde B geöffnet. Die mitgelieferten aktuellen V2-Profilobjekte enthalten auch rückblickende Metadaten und Begründungen früherer Bearbeiter. Diese waren Bestandteil des verpflichtenden Inputs; sie wurden nicht als Autorität, Zustimmung oder zusätzliche fachliche Evidenz verwendet. Entscheidend waren die Beschreibungen, die tatsächlich formulierten Profilerwartungen und die sichtbaren Buchseiten.

## Ergebnis und fachliche Begründung

| Ziel | Entscheidung | Eigenständige Begründung |
| --- | --- | --- |
| Signifikante Stellen korrekt verwenden (`b615830a…`) | `keep`, Profil `none` | Der Text verbindet datenabhängige Ergebnisgenauigkeit, Schutzstellen und Vermeidung von Scheingenauigkeit. Das ist eine kohärente Kompetenz. Sichtbare Bildbeispiele trennen signifikante Ziffern von Dezimalstellen bei einer Addition. Das gelesene Profil deckt die Bedeutung der Datenqualität, begründete Endrundung und mehrstufiges Rechnen ab und ordnet explizite Unsicherheiten über eine mechanische Ziffernregel ein. |
| Elektrische Stromstärke als Ladungsrate deuten (`bbee4c52…`) | `keep`, Profil `none` | Der Text spezifiziert bereits den Mittelwert von Nettoladung pro Intervall und Querschnitt. Gleichung und Einheit sind Teile derselben Größenbedeutung. Das Profil fordert eigene Deutung von Daten und Vorzeichen sowie Transfer zu Pulsen mit Pausen. Die neue Evidenzkette hält mittlere Rate, gespeicherte Ladung und Momentanwert auseinander. |
| Dotierung mit einem einfachen Ladungsträgermodell erklären (`9f265f49…`) | `keep`, Profil `none` | Der Text nennt das vorgegebene einfache Modell, beide Dotierungen, bewegliche Träger, feste Ionen und Gesamtneutralität. Das sichtbare Symbolbild bezeichnet seinen Zustand nach Ionisation und beschränkt die Zeichnung ausdrücklich auf Dotierbeiträge. Das Profil verlangt eigene Trägerableitung, Ladungsbilanz und Verfolgung einer verlagerten Fehlstelle; dafür braucht die Beschreibung keine zusätzliche Bandtheorie. |

`none` empfiehlt keine Profiländerung, weil der gelesene Profilinhalt den jeweiligen Kompetenzkern samt eigenständiger Leistung und sachlich verändertem Fall bereits abdeckt. Das bedeutet weder menschliche Freigabe noch Nachweis eines tatsächlichen Lernergebnisses.

## Anwendung der einzelnen Physikkriterien

| Gebundenes Kriterium | Signifikante Stellen | Stromstärke | Dotierung |
| --- | --- | --- | --- |
| Exact curricular and projection scope | Lokaler Rechen-/Darstellungskern gewahrt; nationale Projektion nicht verifiziert. | Lokale Rate pro Querschnitt gewahrt; keine weitergehende Elektrodynamik. | Einfaches geliefertes Modell gewahrt; keine Bandtheorie oder p-n-Kompetenz eingeführt. |
| Scientific correctness and essential relation | Ziffern müssen Datenqualität entsprechen; Schutzstellen erhöhen keine Messgenauigkeit. | Nettoladung durch Querschnitt geteilt durch Dauer. | Mobile Elektronen/Fehlstellen gegenüber festen Dotierionen; Gesamtneutralität. |
| Epistemic distinction | Messinformation gegenüber Rechenziffern unterschieden. | Transportgröße gegenüber gespeicherter Ladung und Momentanwert unterschieden. | Vorgegebenes Symbol-/Bindungsmodell gegenüber realem Material unterschieden. |
| Model discipline | Stellenregeln nur entsprechend Daten-/Unsicherheitsangaben. | Mittelwert immer mit Intervall; keine unbedingte Gleichsetzung mit Momentanstrom. | Einfaches Modell nach Ionisation; Loch ist fehlendes Bindungselektron. |
| Independently observable performance | Selbst rechnen, Endstelle begründen und frühe Rundung vergleichen. | Daten selbst auswerten, Bezug festlegen und Ergebnis deuten. | Träger selbst ableiten, Beiträge kennzeichnen und Neutralität begründen. |
| Physics-aware mathematics | Einheit, letzte sinnvolle Stelle und mehrstufige Rundung. | ΔQ/Δt, A=C/s, Intervall und Vorzeichen. | Ladungsvorzeichen und Bilanz; keine höhere Mathematik erforderlich. |
| Experiments and measurements | Gegebene Genauigkeit/Unsicherheit, kein zusätzlicher Messversuch verlangt. | Gelieferte Ladungs-Zeit-Daten, kein Strommessversuch verlangt. | Modellkompetenz, kein Materialversuch verlangt. |
| Representation coordination | Messwertschreibweise und gerundetes Rechenergebnis deuten. | Querschnitt, Daten, Gleichung und verbale Rate verbinden. | Modellbild, Ladungszeichen und Bewegungsbeschreibung verbinden. |
| Conservation and system boundaries | Keine Erhaltungsaussage im Kompetenzkern. | Passage durch festgelegten Querschnitt; kein Ladungsverbrauch behauptet. | Gesamtmaterial neutral; Träger und Ionen gemeinsam bilanzieren. |
| Fresh changed-case transfer | Explizite Unsicherheit ersetzt bloße Stelleninformation. | Puls-/Pausenstruktur und umgekehrte Bezugsrichtung. | Andere Fehlstellenlage und andere Richtung des nachrückenden Elektrons. |
| Prediction and reconciliation | Begründete Endrundung und Erklärung des Früh-Rundungsfehlers. | Mittelwerte vorhersagen und mit berücksichtigter Dauer erklären. | Neue Lochposition vorhersagen und über Elektronennachrücken erklären. |
| Evidence-based evaluation | Kein PK5-Urteilsziel; Bewertung von Scheingenauigkeit sachlich begründet. | Kein Werturteil eingeführt. | Kein Werturteil eingeführt. |
| Quantum and relativity discipline | Nicht einschlägig. | Keine zusätzliche mikroskopische Ontologie eingeführt. | Kein Loch als Proton oder Hohlraum; kein Bandmodell verlangt. |
| Safety | Berechnung mit gegebenen Daten. | Gegebene Daten; keine gefährliche Schaltung. | Papier-/Symbolmodell; keine Materialbearbeitung. |
| Semantic atomicity | Enddarstellung und Schutzstellen sind derselbe Rechenkompetenzkern. | Deutung, Rechnung und Einheit sind dieselbe Größenbeziehung. | Trägerentstehung und Ladungsbilanz sind derselbe begrenzte Modellkern. |
| Age and effective-stage fit | Allgemeine Zahlen-/Rundungssprache; keine neue Fehlerfortpflanzung gefordert. | Differenzenquotient bei vorgegebenen Intervallen; keine Differentialrechnung. | Geliefertes Bindungsmodell; keine zusätzlichen chemischen oder quantenphysikalischen Voraussetzungen. |
| DE/EN parity | Inhaltlich gleichwertig. | Inhaltlich gleichwertig. | Inhaltlich gleichwertig. |
| Description/profile boundary | Konkreter Leistungs- und Transferfall nur in Evidenzfeldern. | Dasselbe. | Dasselbe. |
| Profile contract and recommendation | V2 vollständig gelesen; `none`. | V2 vollständig gelesen; `none`. | V2 vollständig gelesen; `none`. |
| Conservative decision | Kein präziser Beschreibungsmangel identifiziert: `keep`. | Kein präziser Beschreibungsmangel identifiziert: `keep`. | Kein präziser Beschreibungsmangel identifiziert: `keep`. |
| No automatic authority | Nur KI-Kandidat. | Nur KI-Kandidat. | Nur KI-Kandidat. |

## Methoden, Grenzen und Reproduzierbarkeit

Die JSONL-Datei enthält genau drei Datensätze in der gebundenen Reihenfolge. Titel, Beschreibung und alle Buch-/Ziel-/Seiten-Fingerprints wurden aus dem Input kopiert. Die eigene Lauf- und Datensatzkennung identifiziert ausschließlich diesen neuen Prüflauf. Das gesonderte Python-Skript validiert die Ausgaben direkt gegen das gebundene JSON-Schema und prüft Reihenfolge, Identität, exakte Textbindungen sowie Eingabedateien gegen die gelieferte Hashversiegelung. Es ruft keine Reviewpipeline auf und liest keine fremden Prüfergebnisse.

Keine vollständigen offiziellen Lehrplantexte oder kompilierte Länder-/Dauer-/Kursprojektionsmatrix wurden als fachliche Prüfnachweise bereitgestellt. Rohe Anwendbarkeit und `sourceRef` genügen dafür nicht; hierzu wird keine Freigabe oder vollständige Quellenvalidierung behauptet. Die aktuellen Titel der unmittelbaren Voraussetzungen und Nachfolger reichen zur lokalen Abgrenzung, nicht zur vollständigen fachlichen Überprüfung dieser Nachbarn. Die mitgelieferte Quellenpfadangabe auf ein früheres P-Artefakt wurde nicht verfolgt. Es gab keine Lernendenprüfung, keinen unabhängigen experimentellen Lauf und keine menschliche Genehmigung.

Artefakte:

- `review.jsonl`: maschinenlesbare Kandidaten, ohne Zusatzschlüssel oder Ersatzbeschreibung bei `keep`.
- `validation.json`: Ergebnis der direkten Schema- und Bindungsvalidierung.
- `input-output-seal.json`: eigene Identität, Methoden-/Grenzenangaben und SHA-256-Hashes der tatsächlich benutzten Eingaben und Ausgaben.
- `book-page-01.png` bis `book-page-05.png`: eigene, tatsächlich betrachtete PDF-Rasterungen.
- `author_review.py` und `validate_review.py`: reproduzierbare Ausgabeerstellung und isolierte Vertragsprüfung.
