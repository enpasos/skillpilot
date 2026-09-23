# Mathematik M7 D16 – informierte D-Synthese und V-Triage

Version: 1, 2026-09-23. Status: fachliche Triage, **keine** kanonische Änderung, QA-Entscheidung, Humanfreigabe oder M7-Vollfinalisierung. Gebundenes Bundle: `sha256:e1235268a323e8dbc3b8d559d9be7257d301a18bd57baa7026ae0b8780d790fe`; BookDigest: `sha256:d4da587887af181a9db83681491907e536f974b63e0b60daaddd64dc153bbc9a`.

## Provenienz und Grenze

Ich habe die unabhängige [Runde B](round-b/results/mathematik-m7-modeling-process-sixteen-current-20260923-v2-first-pass-b.batch-001.records.jsonl) selbst verfasst und erst danach [Runde A](round-a/results/mathematik-m7-modeling-process-sixteen-current-20260923-v2-first-pass-a.batch-001.records.jsonl) gelesen. Dies ist deshalb **keine dritte blinde Stimme**; B erhält hier keinen Autoritätsvorrang. Beide 16er-Batches wurden mit dem nativen `validate:goal-description-review` gegen ihre jeweiligen Runs und das aktuelle Bundle validiert. Die 16 gebundenen Originalbilder wurden tatsächlich angesehen und ihre SHA-256-Digests mit dem Input abgeglichen. P-Kandidaten waren nicht Teil dieser Synthese. Die AI-Records bleiben `candidate`/`ai_candidate`.

Für alle 16 Ziele ist `canonicalContext.sourceRef` null; gebundene Quellenauszüge, effektive Composition-Views und Mappingbelege fehlen. Die Seitenkontexte zeigen auch bei den drei LK-Titeln GK/LK-Raw-Scopes, während die kanonischen Tags `LK` lauten. Diese Triage bestätigt deshalb weder KC-Deckung noch effektive GK-/LK-Sichtbarkeit; das ist ein eigener, vor Freigabe zu prüfender Scope-/Quellengate, kein Beweis eines GK-Leaks.

## Einzeltriage

`K` = keep, `R` = revise, `B` = block. Die Spalte „Synthese“ ist eine Empfehlung für die nächste fachliche Adjudikation, keine Änderung am Graphen.

| Nr. / ID-Anfang | Ziel | A | B | Synthese | Grund |
| --- | --- | :---: | :---: | :---: | --- |
| 1 / `07196e72` | Beziehungen als Modellgleichungen aufstellen | K | B | **B** | Titel nennt Gleichungen, beide Beschreibungen auch Ungleichungen; der Zielumfang ist nicht durch eine Beschreibungskürzung zu klären. |
| 2 / `27542d59` | Mathematisches Verfahren auswählen | K | K | K | Verfahrenswahl und Begründung bilden eine Kompetenz; Rechnung folgt separat. |
| 3 / `bb4569bc` | Größen und Einheiten identifizieren | K | K | K | Relevanz, Einheiten und bekannt/gesucht sind eine kohärente Bestandsaufnahme. |
| 4 / `8d2021d0` | Modell rechnerisch lösen | R | K | K | As Bedingungspräzisierung ist fachlich plausibel, aber bereits durch „korrekt“ und den Modellbezug gedeckt; Bedingungstests gehören konkret ins V2-Evidenzprofil. |
| 5 / `bfbaedb9` | Annahmen und Idealisationen formulieren | K | K | K | D-Text ausreichend; **separater V-HOLD** für die Grafik. |
| 6 / `035b7fc6` | Sachverhalt vereinfachen und strukturieren | K | K | K | Relevante Beziehungen vor der formalen Modellgleichung ordnen. |
| 7 / `ae2ca565` | Zwischenschritte dokumentieren | K | R | K | Ich verwerfe meine B-Revision als kanonisch nicht nötig: „nachvollziehbar“ schließt Regelanwendung bereits ein; deren Nachweis ist Profildetail. |
| 8 / `dd582580` | Ergebnisse zurückübersetzen | K | K | K | Sachdeutung bleibt von Rechnung und Realisierbarkeitsprüfung getrennt. |
| 9 / `4a630596` | Ergebnisse sichern und prüfen | K | K | K | Innermathematische Probe und Korrektur sind kohärent, anders als spätere Sachprüfung. |
| 10 / `8d126397` | Sachskizze mit Variablen erstellen | K | K | K | Skizze und konsistente Variablenzuordnung sind eine Repräsentationsleistung. |
| 11 / `e03eca28` | Plausibilität und Realisierbarkeit prüfen | R | K | **R** | A trifft die Unschärfe von „Abweichungen“; As Wortlaut „vom Sachkontext“ wird unten präzisiert. |
| 12 / `5836c821` | Modellgrenzen benennen | K | K | K | Annahmebedingte Aussagegrenze und ihre Tragweite gehören zusammen. |
| 13 / `fb4dcd2a` | Modellverbesserungen vorschlagen | K | K | K | Anpassung und qualitative Wirkungsdeutung sind kohärent; **separater V-HOLD** für Einheit/Realitätsbehauptung der Grafik. |
| 14 / `74f28ce7` | Alternative Modelle entwickeln (LK) | K | K | K | Zwei Modelle samt verschiedener Annahmen, noch ohne Gütevergleich oder Auswahl. |
| 15 / `163dd583` | Modelle nach Kriterien vergleichen (LK) | K | R | **R** | A liest eine „vorläufige“ Auswahl hinein, die der aktuelle Text nicht kennzeichnet; „Auswahl begründen“ dupliziert die nachfolgende Modellentscheidung. **Separater V-HOLD**. |
| 16 / `519660d0` | Modellentscheidung begründen (LK) | R | R | **R** | Beide Runden verlangen, Unsicherheit/Sensitivität in die Begründung der Wahl einzubinden statt lose anzuhängen. |

Es ergibt sich **kein eigenständiger `split_review`-Fall**: Die übrigen Mehrfachverben bilden jeweils einen zusammenhängenden Modellierungsschritt. Ziel 1 ist ein Titel-/Scopekonflikt, nicht durch einen künstlichen Split der drei Darstellungsformen zu lösen.

## Minimale D-Klärungen für Adjudikation

1. **`07196e72-ba47-54bf-a096-3a79bbb67e23` – BLOCK bis zur Identitätsentscheidung.** Den behaupteten Umfang nicht still auf Gleichungen verengen. Falls Gleichungen, Funktionen und Ungleichungen beabsichtigt sind, wäre ein präziser Titel DE „Beziehungen als Gleichungen, Funktionen oder Ungleichungen formulieren“, EN „Express relations as equations, functions or inequalities“; die bestehenden Beschreibungen könnten dann bleiben. Eine Titelfassung ist jedoch keine reine Description-Revision und benötigt eigene kanonische Adjudikation samt neuen Bindungen.
2. **`e03eca28-9a57-5b24-877c-2e63fecee986` – lokale Revision.** DE: „Die lernende Person kann ein Modellergebnis anhand von Einheiten, Größenordnungen und Randwerten auf Plausibilität und Realisierbarkeit prüfen und Auffälligkeiten im Sachkontext erklären.“ EN: „The learner can check a model result for plausibility and feasibility using units, orders of magnitude and boundary values, and explain any anomalies in the original context.“ Dies klärt den Bezug von „Abweichungen“, ohne die vorgelagerte mathematische Probe zu übernehmen.
3. **`163dd583-8308-53f0-b60d-34588787988d` – lokale Revision.** DE: „Die lernende Person kann Modelle anhand von Einfachheit, Güte und Interpretierbarkeit vergleichen und ihre jeweiligen Vor- und Nachteile für die Fragestellung begründen.“ EN: „The learner can compare models in terms of simplicity, quality and interpretability and explain their respective advantages and disadvantages for the question at hand.“ Die endgültige Wahl bleibt Ziel 16.
4. **`519660d0-85e5-57a6-a219-d0a253336649` – lokale Revision.** DE: „Die lernende Person kann eine Modellentscheidung anhand von Vergleichskriterien begründen und qualitativ erläutern, wie empfindlich diese Entscheidung gegenüber Datenunsicherheit oder veränderten Annahmen ist.“ EN: „The learner can justify a model choice using comparison criteria and explain qualitatively how sensitive that choice is to data uncertainty or changed assumptions.“

Bei Ziel 4 bleibt As Hinweis auf mathematische Bedingungen wertvoll für ein künftiges positives Evidenzprofil, aber kein zwingender Kanontext-Edit. Entsprechend gehört bei Ziel 7 die konkrete Zuordnung jeder Regel zu einem zulässigen Schritt ins Profil, nicht als redundante Verlängerung in die Beschreibung. Ein solches `positive-understanding-evidence-v2`-Profil ist für keines der 16 Ziele im Bundle vorhanden; beide Runden empfehlen `create`, erzeugen es aber nicht.

As Verständnis-Evidenz ist nicht unverändert als Profiltext zu übernehmen: Bei Ziel 8 bezeichnet der Transfer einen *negativen* Saldo zugleich als „Verlust beziehungsweise Überschuss“; für ein fest negatives Vorzeichen ist „Überschuss“ falsch. Bei Ziel 11 wird die Zahl 1200 Tickets für zwölf Lernende „nicht realisierbar“ genannt; der Bildbefund trägt „unplausibel“, nicht logisch oder praktisch unmöglich. Auch Bs sechs Evidenzfelder pro Ziel sind Review-Kandidaten, kein autoritatives Profil.

## V-Befunde getrennt von D

Die folgenden drei **V-HOLD-Empfehlungen** sind keine Änderung der V-QA-Ledger und kein D-Block. Vor Wiederverwendung der jeweiligen Bildbindung braucht es eine gezielte Bildkorrektur mit fachlicher Prüfung, neuem Asset-/Seiten-Fingerprint und frischer betroffener Evidenzbindung; ein bloßer Hash-Refresh genügt nicht.

| Ziel-ID | Sichtbarer Befund | Minimaler Bild-Fix |
| --- | --- | --- |
| `bfbaedb9-b138-590a-87e8-4d87784dda0e` | „gerade Bahn“ steht neben einer gekrümmten Linienzeichnung. | Gerade Linie zeichnen oder die Beschriftung passend ändern; Bewegungssituation und Annahme erneut prüfen. |
| `fb4dcd2a-a6a9-5371-a2fc-95348ee130e0` | „Preis = 2·km“ und „Grundpreis + 2·km“ kennzeichnen die 2 nicht als Preis pro Kilometer; „bessere Nähe zur Realität“ wird ohne Tarifdaten als Tatsache gezeigt. | Rate mit `€/km` und Preisachse in `€` ausweisen; Realitätsaussage als bedingte, datenabhängige Modellverbesserung formulieren. |
| `163dd583-8308-53f0-b60d-34588787988d` | Die Tabelle bewertet exponentielle „Güte“ pauschal als „hoch (bei Wachstum)“, ohne beobachtete Daten oder Gültigkeitsbereich. | Güte nur für explizite Daten/Fragestellung bewerten oder als offen markieren; kein genereller Bonus für „exponentiell“. |

Die Bilder der übrigen Ziele sind durch diese D-Triage **nicht** formal V-genehmigt. Insbesondere illustriert Ziel 7 Rechenschritte mit „minus 12“ und „durch 4“, ohne die beidseitige Äquivalenz auszuschreiben; das ist eine didaktische Profil-/Bildprüfnotiz, hier kein zusätzlicher V-HOLD.

## Exakte ID-Listen für unveränderte Wiederverwendung

**Kanonische D-Texte fachlich unverändert weiterverwenden (12 IDs; keine Wiederverwendung alter Run-Bindungen):**

```text
27542d59-aa1b-569d-8d77-41129bae26e2
bb4569bc-01ac-5bf9-8c85-05df42d70698
8d2021d0-aa14-5023-998b-187356de7986
bfbaedb9-b138-590a-87e8-4d87784dda0e
035b7fc6-830d-5f41-9c5d-2495808c09d4
ae2ca565-928d-55f4-b804-7155cf210120
dd582580-5cd3-55b3-b05e-e1c102533737
4a630596-6e2f-593e-bac6-2a6d8fa58e2f
8d126397-a8b0-528c-8986-614d56fa0749
5836c821-d43b-5c02-9ee5-e86bb87bb054
fb4dcd2a-a6a9-5371-a2fc-95348ee130e0
74f28ce7-e568-5d6e-b946-17445b344fcc
```

**Davon ohne neu identifizierten V-HOLD auch im bisherigen Bild-/Seitenstand als unveränderte Kandidaten weiterführen (10 IDs; keine V- oder Quellenfreigabe):**

```text
27542d59-aa1b-569d-8d77-41129bae26e2
bb4569bc-01ac-5bf9-8c85-05df42d70698
8d2021d0-aa14-5023-998b-187356de7986
035b7fc6-830d-5f41-9c5d-2495808c09d4
ae2ca565-928d-55f4-b804-7155cf210120
dd582580-5cd3-55b3-b05e-e1c102533737
4a630596-6e2f-593e-bac6-2a6d8fa58e2f
8d126397-a8b0-528c-8986-614d56fa0749
5836c821-d43b-5c02-9ee5-e86bb87bb054
74f28ce7-e568-5d6e-b946-17445b344fcc
```

**Nicht unverändert übernehmen:** D-Block `07196e72-ba47-54bf-a096-3a79bbb67e23`; D-Revisionskandidaten `e03eca28-9a57-5b24-877c-2e63fecee986`, `163dd583-8308-53f0-b60d-34588787988d`, `519660d0-85e5-57a6-a219-d0a253336649`; Bildbindungen der drei V-HOLD-IDs aus obiger Tabelle. Jede angenommene Text-, Titel- oder Bildänderung macht ihre betroffenen Goal-/Page-Evidenz neu prüfpflichtig. Auch wenn die übrigen Seiten-Fingerprints identisch bleiben, muss ein wegen geändertem BookModel-Digest neu vorbereitetes Bundle als Ganzes neu gebunden und nativ validiert werden; die ID-Listen erlauben nur gezielte **fachliche** Wiederverwendung unveränderter Befunde, keine mechanische Übernahme alter Run-Hashes.
