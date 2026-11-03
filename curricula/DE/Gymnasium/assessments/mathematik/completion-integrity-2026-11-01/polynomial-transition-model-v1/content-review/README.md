# Batch 2: eine eigene Modellprüfung für drei echte Aufgabenlücken

**Entwurf, nicht integriert.** Grundlage ist der aktuelle Mathematikkanon `3a3792d14057854c79a3d8c4d38cd98dd6e28e936865ebd3447107404b58474c`. Kein bestehendes Goal, keine Source-Ansicht und kein Produktcode werden geändert. Die vollständige Aufgabenfassung, Lösung und Rubrik stehen in [candidate.de.md](candidate.de.md) und [candidate.en.md](candidate.en.md). Der Kandidat ist absichtlich `draft`, somit noch nicht zur Laufzeit freigegeben.

## Warum die drei zunächst vorgeschlagenen Zuordnungen bleiben

| Fehlende Kompetenz | Geprüfte bestehende Aufgabe | Entscheidung |
| --- | --- | --- |
| `8e1b0d9c…` Polynomrekonstruktion | `ec707244…`, J9-Ballparabel | Unverändert. Kohorte30 untersagt ausdrücklich, den gerade entfernten Koeffizienten-LGS-Zwang durch eine neue Requires-Kante zurückzuholen. Der vorgegebene Scheitel ist keine selbstständige Rekonstruktion. |
| `4b16fce6…` sprung-/knickfreie Anschlüsse | `68a262fc…`, historische Hängebrücke | Unverändert. Der ausdrücklich historische 30-BE-Abiturvertrag wird weder um Teile ergänzt noch unter derselben ID umbenannt. |
| `b88cbf71…` Modell aus Wendebedingung | `2f626446…`, J10-Führungsschiene | Unverändert. Dessen Goalvertrag untersucht einen vorgegebenen Term; die neue Modellaufstellung wäre eine zusätzliche Kompetenz. |

Die unveränderten Ausgangsverträge samt vollständigem ExamData stehen in `before.contracts.json`. Die drei Kohorte30-Befunde werden in `candidate.delta.json` erneut ausdrücklich gebunden. Alle 27 historischen Abitur-Goalobjekte sind mit ihren vollständigen normalisierten Hashes in `historical-27-preservation.json` festgehalten.

Für die Hängebrücke ist die Herkunft lokal belegbar: kanonische Provenienz verweist auf Quelllandschaft `2796fc7b…`, Quellziel `bc60e300…`; dessen 30-BE-Vertrag liegt im archivierten hessischen Oberstufen-JSON. Das ursprüngliche Bild ist `/assets/abi/2026_1/image4.png`. `historical-origin.json` bindet Archiv und Goal. Diese Archivbindung belegt allein keine amtliche Herausgeberschaft. Die neue Aufgabe übernimmt weder Bild noch historische Aufgabenformulierungen.

## Prüfung vorhandener eigener Autonomieaufgaben

Drei nahe eigene Verträge wurden vollständig gelesen:

- `450a77d6…` prüft einfache Extremwertmodellierung; sein geprüfter Korrekturvermerk schließt Rekonstruktion, Wendestellen und Anschlüsse ausdrücklich aus.
- `e7013f6e…` prüft lineare, quadratische und symmetrische Darstellungen, keine neue Anschluss-/Wendemodellierung.
- `3095e125…` ist allgemein als selbstständige Modellierung beschrieben, sein konkreter bestehender 20-BE-Vertrag prüft aber lineare Cateringkosten und Modellgrenzen. Ein Austausch gegen eine Quartik wäre eine neue fachliche Vorbereitung und ein anderer Arbeitsumfang. Ein ausdrücklich gewählter äquivalenter Slot wäre gesondert zu entscheiden; hier wird keine stille Ersetzung vorgenommen.

Das ist eine begrenzte Suche nach passenden vorhandenen Verträgen, kein erneutes Review aller 165 Aufgaben.

## Der zusammenhängende neue Auftrag

Vorgeschlagen wird **eine** eigene Assessment-ID `4293cf40-06fb-51e3-9799-6fde0bf2771b`: ein Übergangsweg zwischen einem fallenden geraden Abschnitt und einem waagerechten Abschnitt. Beide Nähte sollen sprung- und knickfrei sein; zusätzlich ist bei (t=10) eine Wendestelle vorgegeben. Aus diesen fünf Anforderungen wird ein Polynom bis Grad vier selbst aufgestellt, gelöst und geprüft. Die Wendebedingung ist somit tatsächlich Bestandteil der Modellbildung, keine nachträglich angehängte Untersuchung eines fertigen Terms.

Die eindeutige Lösung lautet

\[
q(t)=\frac{t^4}{80000}-\frac{3t^3}{8000}+\frac{3t^2}{800}-\frac t{10}+5.
\]

Die explizit bepunkteten Handlungen sind:

- **Rekonstruktion:** vollständiger Koeffizientenansatz, LGS, nachvollziehbare Lösung und Kontrolle aller Bedingungen — 4 BE.
- **Anschlussmodellierung:** vier Werte-/Steigungsbedingungen mit Kontextdeutung und Kontrolle beider Nähte — zusammen 4 BE.
- **Wendemodellierung:** notwendige Modellbedingung, Unterscheidung von notwendiger/hinreichender Bedingung, tatsächlicher Wechsel und Kontextdeutung — zusammen 4 BE.
- **Modellprüfung:** Höhenbereich und eine Modellgrenze — 1 BE.

13 BE insgesamt; reguläre Bestehensgrenze **11 BE**. Das unabhängige Inhaltsreview hat den früheren 13/13-Vorschlag als unnötig streng bewertet. Die gewöhnliche Rubrik begrenzt die Gesamtpunktzahl auf **höchstens 10 BE**, wenn eine der drei wesentlichen Handlungen fehlt oder fachlich falsch ist:

1. Das vollständige Koeffizienten-LGS aus allen fünf Vorgaben aufstellen, nachvollziehbar lösen und den erhaltenen Term tatsächlich an den Vorgaben kontrollieren.
2. Werte- und Steigungsübereinstimmung an beiden Nähten formulieren, im Kontext deuten und beide Anschlüsse richtig prüfen.
3. Die Wendebedingung formulieren, notwendig und hinreichend unterscheiden, einen gültigen tatsächlichen Wendetest anwenden und den Wechsel im Höhenverlauf deuten.

Die Kappung gehört zur transparenten Bewertung der einen Gesamtpunktzahl. Danach gilt allein die Grenze 11 BE; es gibt keine Teilqualifikationen, gespeicherten Kernhandlungsresultate oder zweite Bestehensentscheidung. Alle Nachweise zählen aus der gesamten Lösung. Insbesondere dürfen Kontrollen aus 3/4/5 einander belegen, ohne dieselbe Rechnung erneut aufzuschreiben. Gleichwertige systematische Lösungswege werden in jeder der vier Rekonstruktions-Punktezeilen ausdrücklich akzeptiert. In Teil 2 genügt eine fachlich ausreichende Erklärung; ein Gegenbeispiel ist optional.

**Faire Rechen- und Folgefehlerbehandlung:** Ein isolierter nachvollziehbarer Rechenfehler bedeutet nicht schon, dass eine Kernhandlung fehlt. Richtige Folgearbeit am eigenen Term wird gewertet, derselbe Ursprungsfehler nicht mehrfach abgezogen. Eine fachlich richtige Kontrolle kann ausdrücklich feststellen, dass der eigene Term eine Vorgabe nicht erfüllt. Eine ungeprüfte oder fachlich falsche Erfüllungsbehauptung ist dagegen kein Nachweis. Selbst korrigierte Fehler kosten keinen Punkt; mehrere unabhängige Fehler begründen keinen pauschalen Bestehensanspruch. Die zusätzliche Wendestelle und die Höhen-/Modellgrenzenprüfung bleiben normale Einzelpunkte, keine weiteren Kappungskerne. Damit sind begrenzte Rechenfehler oder das Fehlen beider Zusatzpunkte mit 11 BE vereinbar, während eine fehlende der drei wesentlichen Modellierungshandlungen nicht kompensiert werden kann. Diese Korrektur setzt die unabhängige Reviewentscheidung um; menschliche Fairness oder Wirksamkeit wurde damit nicht empirisch belegt.

Direkte Vorbereitung sind die drei tatsächlich geprüften Kompetenzziele sowie `546bf0b3…` für das rechnerische Lösen des LGS. Das LGS-Ziel wird nicht als voll abgedeckt ausgewiesen: graphisches Lösen und umfassende Lösungsvielfalt werden hier nicht geprüft. Die drei `coveredGoalIds` sind durch eine explizite Rubrikzuordnung in `candidate.delta.json` begründet. Ihre eigenen kanonischen Voraussetzungen bleiben vollständig bestehen. Das analytisch-geometrische Q2-LGS-Ziel wird dem fachfremden Kontext nicht angehängt.

## Mathematische und technische Prüfung

`verify_math.py` und `symbolic-proof.json` belegen mit exakten rationalen Zahlen: Rang fünf des Koeffizientensystems, sämtliche fünf Bedingungen, beide C1-Nähte, tatsächliche Wendestellen bei (5) und (10), sowie Monotonie und Höhenbereich (7/2\le q\le5). Die zusätzliche Wendestelle wird in Aufgabe und Lösung ehrlich behandelt; Einzigkeit wurde nicht verlangt. Gleiche zweite Ableitungen an den Nähten oder bautechnische Eignung werden nicht behauptet.

`native-candidate-structure.json` prüft den Kandidaten isoliert mit dem vorhandenen Java-Compiler: DAG und echte Voraussetzungskanten, Erreichbarkeit aller drei geprüften Fähigkeiten von genau einem neuen geschützten Prüfungsziel sowie 13 BE und Bestehensgrenze 11 BE. Der ausdrückliche Draftstatus bleibt runtime-unverfügbar. Die Rubrikkappung ist eine normale Bewertungsanweisung in den vorhandenen Textfeldern, kein neues Graph- oder Resultatfeld. Diese isolierte Auswahl ist keine Änderung irgendeines realen Angebots.

## Zusätzliche Pflicht und spätere Auswahl

Der Vorschlag bedeutet nach fachlicher Freigabe höchstens **eine zusätzliche zusammenhängende Prüfung für drei nachgewiesen fehlende Handlungen**, nicht drei zusätzliche Prüfungsziele. Er ersetzt oder entfernt keine historische Aufgabe und entwertet keine bestehende Mastery. Die zusätzlichen 13 BE müssen vom Inhalts-/Scopeverantwortlichen ausdrücklich akzeptiert werden; eine automatische Einordnung nur anhand von Phase, Bundesland oder Kurslabel wird nicht vorgenommen.

Inhaltlicher Kontext ist die Polynomrekonstruktion mit erster und zweiter Ableitung in der Oberstufe. Die Phase E bleibt vorerst ein Kandidatenmetadatum, das mit den derzeitigen kanonischen Vorbereitungszielen vereinbar ist; sie ist keine amtliche Stufenzuordnung. Die autoritative Platzierung wird gesondert anhand der Quellen und realen Zielprojektionen geprüft. Es wird keine zusätzliche Schemaeigenschaft für ein Inhaltsniveau eingeführt. Die Aufgabe ist kein amtlicher Abiturvorschlag. Sie darf erst für konkret geprüfte Zielprojektionen ausgewählt werden, die diese drei Kompetenzen bereits beabsichtigen. `applicabilityFromRequires` ist lediglich eine ableitbare Geltungshilfe, kein Beleg offizieller Quellenabdeckung oder tatsächlicher Targetauswahl. Ein bloßer `prerequisiteOnly`-Eintrag genügt nicht. Die J9/J10- und historischen Prüfungsziele bleiben unverändert.

Das unabhängige Review bestätigt Mathematik, vollständige Kompetenzabdeckung und echte Vorbereitung; seine begrenzten Bewertungskorrekturen R1–R3 sind umgesetzt und zum Nachreview vorgelegt. Faire Platzierung, aktuelle tatsächliche Scopewirkung und einschlägige M7-Prüfungen stehen aus. Es wird keine menschliche Freigabe, Erprobung, Wirksamkeit oder vollständige Mathematikabnahme behauptet. Neu verfasster Aufgabeninhalt: CC-BY-4.0.

## Reviewgeschichte

Die erste gebundene Entscheidung steht in [independent-model-content-review.md](independent-model-content-review.md) und der zugehörigen JSON-Datei. Alle damals geprüften Ausgangsbytes einschließlich des 13/13-Vorschlags liegen unverändert unter [prior-review-inputs/review-1/](prior-review-inputs/review-1/); dessen `archive-index.json` bindet sie. Diese Fassung ändert ausschließlich die empfohlenen Bewertungs-/Textdetails und aktualisiert die zugehörigen Autorennachweise. Die mathematische Aufgabe und ihre Lösung bleiben fachlich gleich.

## Konkreter Auftrag an das unabhängige Inhaltsreview

1. Werden Polynomrekonstruktion, Modellierung beider C1-Nähte und Modellierung aus einer Wendebedingung jeweils durch eine verlangte, gelöste und bepunktete Handlung vollständig geprüft?
2. Setzen 11/13, die normale Gesamtkappung auf 10 BE, wechselseitige Nachweise und die faire Rechen-/Folgefehlerregel die gebundene Reviewentscheidung vollständig um, ohne fehlende Kernhandlungen kompensierbar zu machen?
3. Passen die vier echten Vorbereitungsziele zum Inhalt, insbesondere das einfache Koeffizienten-LGS, ohne eine fachfremde geometrische LGS-Kompetenz zu verlangen?
4. Ist eine zusätzliche zusammenhängende 13-BE-Prüfung für diese drei Lücken vertretbar? Die konkrete Source-/Stufen-/Kursauswahl und Enrollment bleiben ausdrücklich ungeprüft und werden durch ein Inhalts-PASS nicht ersetzt.
