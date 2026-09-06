# Mathematik/Physik: Wiederaufnahme- und Effizienzreview vom 5. September 2026

Der aktuelle Umsetzungsstand und der verbindliche Wiedereinstieg stehen im
[Commit-Zwischenstand vom 6. September](#commit-zwischenstand-vom-6-september-2026).
Die vorangehenden Abschnitte halten die jeweiligen früheren Entscheidungsstände
fest; insbesondere sind die ursprüngliche Pause und Freigabeanfrage historisch.

## Ergebnis und Grenze

Der im [Checkpoint vom 5. September](math-physics-deep-understanding-procedure-review-2026-09-02.md)
geforderte Verfahrensreview wurde am Repository-Stand
`91175ca666b754741402b42e135901ed57f2fb39` durchgeführt. Zwei unabhängig
beauftragte Read-only-Audits ergänzten die Prüfung durch den Integrator.
Es wurden keine Fachreviews gestartet, Ziele ausgewählt, Texte oder Bilder
geändert und keine Reviewresultate oder Profile neu gebunden.

Der Review klärt den technischen Wiedereinstieg; er ist weder eine fachliche
Abnahme offener Ziele noch eine Aufhebung der vom Product Owner gesetzten
Bearbeitungspause. Die zweite Ausbaustufe der Unterrichtsplanung bleibt ein
[getrenntes, zurückgestelltes Vorhaben](../dev/teacher-goal-book-phase-two.md).

## Aktuell geprüfte Ausgangslage

| Fach | Streng vollständig | Fortschritt | Offen | Reifegrad |
| --- | ---: | ---: | ---: | --- |
| Mathematik | 235 / 795 | 29,6 % | 560 | M6 |
| Physik | 272 / 464 | 58,6 % | 192 | M6 |

Der zentrale Check meldet null blockierende Probleme. Die Neuberechnung des
Curriculum-Status stimmt mit den gespeicherten Artefakten überein; alle neun
geschützten Reifegraduntergrenzen bestehen. Historische Nenner 780/426 werden
nicht fortgeschrieben. Diese Verfahrensprüfung erhöht keinen Fortschrittszähler.

Der In-flight-Loader bestätigt drei disjunkte aktive Batch-Zuständigkeiten.
Alle drei vorbereiteten Pakete und beide vorhandenen Mathematik-Dual-Summaries
bestehen ihre internen Integritätsprüfungen ohne Schreiben. **Diese Prüfungen
beweisen nicht die Aktualität gegenüber dem heutigen Curriculum.** Der
zusätzliche Live-Kontext- und Seitenvergleich findet die unten genannten
Abweichungen. Eine pauschale Wiederverwendung aller 48 Records ist nicht zulässig.

| Reihenfolge | Vorhandene Arbeit | Nächster fachlicher Schritt nach Wiederaufnahme |
| --- | --- | --- |
| 1. Mathematik B032s, 4 Ziele | 8 historische Reviewrecords; 2 × `keep/keep`, 2 × `split_review/keep`; zwei kanonische Kontexte verändert | Zuerst aktuelle Kontext-/Reihenfolgeabgrenzung, dann gezielte neue Doppelprüfung und Synthese; Atomizitätsdissens gesondert klären |
| 2. Mathematik B033, 20 Ziele | 40 Reviewrecords; 11 Zielseiten unverändert, 9 Geltungsmatrizen verändert | Aktuelle Nachweise erhalten, neun veränderte Seiten neu doppelt prüfen; zielweise Synthese |
| 3. Physik B033z, 9 Ziele | Vorbereitetes Paket; ein Voraussetzungskontext und zwei Bildbezüge verändert; noch keine Reviewresultate | Eingangspaket aktualisieren und prüfen, dann zwei isolierte Blindrunden |

### Zielgenaue Abgrenzung statt pauschalem Neustart

Alle 33 bilingualen Texte und Goal-Fingerprints stimmen noch überein.
`buildGoalDescriptionCanonicalContext` zeigt aber drei Abweichungen:

- B032s `f7dcf8c8-06c1-5972-b02a-9d35e5ab7600`: Geltung von Bayern auf alle
  16 Bundesländer erweitert und Voraussetzung `e0c3359d…` ergänzt.
- B032s `e0c3359d-7d8a-4d01-a25e-a8cd5ebce90e`: Voraussetzung
  `f7dcf8c8…` durch `5bced7dc…` ersetzt.
- B033z `a684bec1-ba59-59d0-98d2-4ca37236f64c`: Orientierungsanker als
  Voraussetzung ergänzt.

Die aktuellen Basis-BookModels wurden zusätzlich einmal je Fach **nur im
Speicher** geladen und mit `buildGoalDescriptionRolloutSubsetModel` gegen die
vorhandenen Seiten verglichen; es wurden keine PDFs oder Pakete erzeugt:

- B032s lässt sich in seiner alten Zielreihenfolge nicht mehr aufbauen:
  `f7dcf8c8…` steht vor seiner neuen Voraussetzung `e0c3359d…`. Vor einer
  Wiederverwendung auch die Rückwärtsverweise der zwei übrigen Seiten prüfen.
  Hier wird keine der vier alten Seiten pauschal für aktuell erklärt.
- B033: Alle kanonischen Kontexte sind gleich, aber bei neun Seiten ist
  ausschließlich `applicability` verändert. Betroffen sind `19f170e4…`,
  `1bc118c3…`, `57f6d5e4…`, `a8ff2666…`, `53b47494…`, `235ae698…`,
  `b025df0c…`, `ba343971…` und `30c013ac…`. Der Vergleich aller Seitenfelder
  samt Fingerprint bestätigt die übrigen elf Seiten unverändert. Deren 22
  Reviewrecords können bei weiterhin gleichen Bindungen erhalten bleiben;
  Synthese und Evidence-v2 fehlen weiterhin. Die ursprünglichen Entscheidungen
  aller 20 Ziele waren 8 × `keep/keep`, 6 gemischte `keep/revise`,
  2 × `revise/revise` und 4 Fälle mit `split_review`.
- B033z: Neben der oben genannten Voraussetzung sind die Bildbezüge von
  `0c305cf9-3923-51cf-a9ae-5849edc99c9f` und
  `2239cb67-82cb-585f-ab82-e1f2510eb4f7` verändert. Sechs Seiten stimmen
  vollständig überein. Da noch keine Reviews vorliegen, erst das aktuelle
  Eingangspaket erstellen; es geht keine geleistete Doppelprüfung verloren.

Die neun B033-Geltungsänderungen sind nicht durch unveränderte Titel oder
kanonische `applicability`-Felder erledigt: Die Buchprojektion enthält weitere
abgeleitete Geltungsnachweise. Genau deshalb gehört der vollständige
Seitenkontext in die frühe Prüfung.

## Entscheidungen für einen effizienten Weiterlauf

1. **Nur nachweislich aktuelle Mathematik-Reviewrecords wiederverwenden**,
   insbesondere die 22 Records der elf unveränderten B033-Seiten, solange
   ihre vollständigen Ziel-, Seiten- und Kontextbindungen aktuell bleiben.
   Ein Neustart oder Curriculum-Änderungen außerhalb dieser Bindungen sind
   allein kein Anlass für Wiederholungsreviews. Nach einer relevanten Text-,
   Graph-, Kontext- oder Bildänderung betroffene Nachweise erneut prüfen;
   veraltete Records nicht mechanisch zu aktuellen Bewertungen umdeklarieren.
2. **Zuerst die drei begonnenen Arbeiten in obiger Reihenfolge abschließen.**
   Keine Auswahl weiterer Ziele davor; nötige Recheck-Pakete bleiben auf die
   bestehenden Zuständigkeiten begrenzt. Der Integrator allein registriert Resolutionen und
   Evidence-Profile; aktive Zuständigkeiten bleiben bis zum strengen Abschluss
   bestehen. Splits und ihre Auswirkungen auf andere Batch-Kontexte werden
   vor der Evidence-Materialisierung geklärt.
3. **KEEP bleibt der Standard.** Abweichende Begründungen oder Evidence-Texte
   erklären `requiresSynthesis`, rechtfertigen aber keine Textänderung. Ein
   `keep/revise`-Fall kann nur nach begründeter, exakt gebundener Ablehnung des
   Ersatztexts unverändert schließen. `revise/revise` und `split_review`
   schließen nicht durch eine solche Abkürzung. Nach übernommener Textänderung
   sind zwei neue unabhängige Reviews des endgültigen Kontexts erforderlich.
4. **Kosten durch vermiedene Nacharbeit senken.** Evidence-v2 erst nach stabiler
   Beschreibung und geklärtem Kontext erstellen. Bei neuen schwierigen oder
   heterogenen Themen kleinere Gruppen verwenden; die elf unveränderten
   B033-Ziele deshalb aber nicht neu prüfen. Zwei Blindrunden parallel mit
   getrennten Eingaben und ohne fremde Ergebnisse; ein dritter Fachreview nur
   für verbleibenden Dissens. Kein mehrfacher Vollkontext pro Reviewer.
5. **Günstige Prüfungen bündeln, teure Artefakte einmal bauen.** Vor PDF- und
   Frontend-Builds gemeinsam Graph, Kompositionssichten, Assessment-Routen,
   semantische Nachweise, Evidence, Memory, Bildabdeckung, Transparenzinventar
   und Paket-Provenienz/Zähler prüfen. Abhängige Gate-Fehler zuerst beheben.
   Nach kanonischen Änderungen alle betroffenen Layer-A-Lanes aktualisieren;
   vollständige Abschlussprüfungen am stabilen Checkpoint bleiben Pflicht.

## Grenzen der Kosten- und Diversitätsnachweise

Die gespeicherten Run-Manifeste enthalten keine Token- oder Kostenabrechnung.
Bei B033 Runde B sind Start und Ende identisch; daraus lässt sich keine reale
Reviewdauer ableiten. Belastbare historische Kostenvergleiche oder Einsparungs-
prozentsätze sind daher nicht möglich. Künftige Laufzeit-/Verbrauchsmessungen
müssen beobachtete Werte getrennt von unveränderlichen Reviewartefakten festhalten;
Modellvarianten werden an gleicher Prüfqualität und tatsächlicher Nacharbeit
verglichen, nicht allein an Laufzeit oder Modellbezeichnung.

Konkreter Metadatenbefund: B032s meldet bei `report_only` scheinbare
Modell-/Providerdiversität, weil `openai`/`gpt-5` und `OpenAI`/`GPT-5` derzeit
als verschiedene Zeichenketten verglichen werden. Das ist **kein Nachweis
verschiedener Modelle**. Die getrennten Runden sind davon zu unterscheiden.
Historische Manifeste bleiben unverändert; neue Manifeste verwenden die exakt
beobachtete, konsistente Provider-/Modellkennung. Vor einer streng erzwungenen
Diversitätspolitik muss der Vergleich samt Regressionstest gegen diesen
Schreibweisenfall gehärtet werden. Hier wurde weder die Politik umgestellt
noch aufgrund der scheinbaren Diversität ein Ziel anerkannt.

## Ausgeführte Nachweise und nächste Arbeitsgrenze

- `npm --prefix app run quality:deep-understanding-rollout:check`: bestanden.
- `npm --prefix app run quality:curriculum-status:check`: bestanden,
  einschließlich aller neun geschützten Floors.
- `loadGoalDescriptionRolloutInFlightLedger`: drei gültige, disjunkte Batches.
- `validatePreparedGoalDescriptionRolloutBatch`: B032s, B033 und B033z bestanden.
- `materializeGoalDescriptionRolloutBatchDualSummary(configPath, false)`:
  B032s und B033 bestanden; keine Ergebnisse neu geschrieben.
- Zusätzlicher Live-Abgleich mit `buildGoalDescriptionCanonicalContext`,
  `fingerprintGoalForEvidence`, `loadGoalBookBuildInputs` und
  `buildGoalDescriptionRolloutSubsetModel`: die oben dokumentierten Kontext-,
  Reihenfolge- und Seitenabweichungen nachgewiesen.

Die Prüfungen verwenden exportierte Produktionsfunktionen aus
`app/scripts/materializeGoalDescriptionRolloutBatch.ts`, `goalBookModel.ts` und
den Review-/Evidence-Validatoren, nicht nachgebildete Hashregeln.
Vor Prüfungsbeginn war kein fachlicher Reviewprozess aktiv; alle
hier gestarteten Prüfungen sind beendet. Bei ausdrücklicher Wiederaufnahme
beginnt die Arbeit mit der aktuellen Kontextabgrenzung von B032s und der daraus
folgenden gezielten Doppelprüfung/Synthese, nicht mit einer neuen Zielauswahl
oder Doppelprüfung unveränderter Ziele. Alle fünf strengen Abschlussgates, die
M6-Untergrenzen und Nano-Banana-Pro-first bleiben unverändert.

## Ausdrückliche Wiederaufnahme am 5. September 2026

Der Product Owner hat nach dem Verfahrensreview ausdrücklich beauftragt:
„Bitte die Curriculum-QS wieder aufnehmen.“ Die zuvor dokumentierte
Bearbeitungspause ist damit für diesen fachlichen Rollout aufgehoben, nicht
für die zweite Unterrichtsplanungs-Ausbaustufe oder eingefrorene Plugin-Verträge.

Der Wiedereinstieg beginnt innerhalb der bestehenden B032s-Zuständigkeit mit
`batch-032u-resumed-current-context-recheck-4-v1.config.json`. Das frische Paket
verwendet die aktuellen Texte unverändert und ordnet die Grapheneigenschaften
vor dem davon abhängigen Nullstellenziel ein. Die Originalartefakte bleiben
erhalten. B032s bleibt bis zum vollständigen Abschluss Eigentümer der vier IDs
im In-flight-Ledger; das überlappende Recheck-Paket erhält keinen zweiten Claim.
Vorbereitung und neue Reviewkandidaten erhöhen keinen Fortschrittszähler.

## Erstes aktuelles Prüfergebnis: B032u

Die vier Ziele wurden in zwei getrennten, abgeschlossenen Blindrunden geprüft:
`math-b032u-a-gpt56sol-20260905` mit `gpt-5.6-sol` und
`math-b032u-b-gpt6astra-20260905` mit `gpt-6-astra`, jeweils mit Reasoning-Effort
`high` und ohne übernommene Gesprächshistorie. Beide Ausgaben wurden erst nach
Abschluss beider Runden in den disjunkten Ergebnispfaden materialisiert. Die
Run-Manifeste binden die tatsächlich verwendeten Eingaben und unveränderten
Reviewrecords. Die jeweiligen `run-provenance.json` dokumentieren ausdrücklich
beobachtete Dispatch-/Abschlussgrenzen, keine exakte Inferenzdauer; Tokenverbrauch
und Kosten sind unbekannt, nicht null Euro.

| Ziel | Runde A / B | Folgerung |
| --- | --- | --- |
| Parameter in Scheitelpunktform, `5bced7dc…` | `keep` / `keep` | Beschreibung unverändert beibehalten |
| Quadratwurzeln definieren und schätzen, `f8704a7b…` | `keep` / `keep` | Definition, exakte Werte und Schätzung als zusammenhängende Umkehrbeziehung beibehalten |
| Grapheneigenschaften, `e0c3359d…` | `split_review` / `split_review` | Strukturentscheid erforderlich; nicht als abgeschlossen zählen |
| Nullstellen in Scheitelpunktform, `f7dcf8c8…` | `keep` / `revise` | Begriffspräzisierung empfohlen; ursprünglichen Dissens unverändert erhalten |

Die Befunde sind in der [gebundenen Dual-Summary](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-05/batch-032u-resumed-current-context-recheck-4-v1/dual-summary.json)
nachvollziehbar. Sie sind AI-Reviewkandidaten, keine menschliche Abnahme,
keine aktuellen strengen Resolutionen und keine Evidence-v2-Freigabe.

### Begrenzte Entscheidungsvorlage nach gezielter Drittbeurteilung

Ein zusätzlicher, lesender Fachreview durch `rollout_process_efficiency`
beurteilt ausschließlich die beiden offenen Befunde. Diese gezielte
Adjudikation kennt die Befunde der ersten Runden und ist ausdrücklich **keine
weitere Blindrunde**. Der Integrator hat die Empfehlung und die direkten
kanonischen Beziehungen ebenfalls geprüft.

Für `e0c3359d-7d8a-4d01-a25e-a8cd5ebce90e` wird die kleinste fachlich begründete
Aufteilung in zwei Teilkompetenzen empfohlen, nicht in sechs Einzelroutinen:

1. **Achsenschnittpunkte und Vorzeichen quadratischer Funktionen aus Graphen
   deuten.** Die lernende Person kann aus dem Graphen die Schnittpunkte mit den
   Koordinatenachsen ablesen, daraus Nullstellen und y-Achsenabschnitt angeben
   und die Vorzeichenbereiche anhand der Lage zur x-Achse bestimmen.
   Englisch: The learner can read the intersections of a quadratic function's
   graph with the coordinate axes, identify its zeros and y-intercept from
   them, and determine its sign intervals from the graph's position relative
   to the x-axis.
2. **Extremwert, Wertemenge und Monotonie quadratischer Funktionen aus dem
   Graphen bestimmen.** Die lernende Person kann aus Scheitelpunkt und
   Öffnungsrichtung des Graphen den Extremwert, die Wertemenge und die
   Intervalle des Steigens und Fallens bestimmen.
   Englisch: The learner can use the vertex and opening direction of a
   quadratic function's graph to determine its extremum value, range, and
   intervals of increase and decrease.

Begründung: Die beiden Teilkompetenzen verwenden unterschiedliche Begriffsnetze
(Achsenlage/Funktionswerte gegenüber Scheitel/Öffnung/globalem Verlauf), können
aber jeweils über einen zusammenhängenden Deutungsweg überprüft werden. Die
bestehende Einstufung `semanticAtomic: true` wird durch diesen Gegenbefund nicht
stillschweigend umgeschrieben. Die bisherige e0-ID könnte als zusammenfassender
Cluster mit zwei neuen atomaren Kindern erhalten bleiben. **Dafür wird gemäß
Abschnitt 7 des Verfahrens eine Product-Owner-Entscheidung eingeholt.** Noch
wurden keine Kinder-IDs vergeben, Kanten verändert oder Geltungen übertragen.

Bei `f7dcf8c8-06c1-5972-b02a-9d35e5ab7600` reicht dagegen eine lokale
Präzisierung: Nullstellen sind Zahlen, nicht Punkte. Empfohlener Ersatz des
betroffenen Satzteils ist DE „Nullstellen als x-Koordinaten der Schnittpunkte
des Graphen mit der x-Achse und als Lösungen von f(x) = 0 aufeinander beziehen“
und EN „relate the zeros ... to the x-coordinates of the graph's intersections
with the x-axis and to the solutions of f(x) = 0“. Der übrige Anspruch bleibt
unverändert; weder ein weiteres Ziel noch ein bestimmtes Lösungsverfahren ist
nötig. Der Berührfall zählt ebenfalls als gemeinsamer Punkt. Die Präzisierung
wird noch nicht isoliert eingespielt, damit die anstehende Strukturentscheidung
nicht unmittelbar dieselben Kontextnachweise erneut veralten lässt.

### Fortsetzungsgrenze und Auswirkungen

Nach Freigabe zuerst den zusammenhängenden Änderungsumfang festlegen und erst
dann neue finale Eingaben erstellen. Direkte Eltern sind `18eb8537…` (e0) und
`d4a9fc20…` (f7); unmittelbare e0-Nachfolger sind f7 sowie `15ce2a7e…`,
`1ce8af38…`, `7156558c…`, `a7ccb7a9…`, `3f3557a8…` und `29ce4053…`.
Voraussetzungen müssen nach tatsächlich benötigter Teilkompetenz zugeordnet
werden, nicht pauschal dem neuen Gesamtcluster. Voraussetzungskontexte von
`5bced7dc…`, `f8704a7b…`, `65365dce…` und `af3d6bff…` sind mit zu prüfen.
Diese Liste ist die direkte Nachbarschaft, keine vollständige Abhängigkeitsanalyse.

Vor Umsetzung sind Quellen-/Mapping-, Projektions-, Assessment-, Semantic-Kind-,
Atomicity-, Memory-, Evidence- und Bildbindungen sowie Vorfahrengewichte gezielt
abzugleichen. Es werden keine alten Mastery-Werte automatisch zu Nachweisen für
neue Kinder erklärt und keine Laufzeit- oder Plugin-Verträge verändert. Die
bestehenden Bilder bleiben erhalten, soweit sie die jeweilige Kompetenz korrekt
stützen; eine Aufteilung allein ist kein Anlass für einen Bildersatz.

Bis zur Entscheidung bleiben der kanonische Datenstand, alle Bilder und das
In-flight-Ledger unverändert. B032s behält seine Zuständigkeit, B033 und B033z
werden nicht vorgezogen. Die acht neuen Reviewrecords sind dauerhaft gesichert;
für einen endgültig geänderten Ziel-/Seitenkontext sind zwei neue Blindrunden
erforderlich. Evidence-v2 wird erst danach erstellt.

Der erneut ausgeführte zentrale Check besteht mit **Mathematik 235/795
(29,6 %), Physik 272/464 (58,6 %), null technischen Blocking Issues**.
Die neuen offenen fachlichen Kandidatenbefunde sind damit nicht als erledigt
deklariert. Es gab keine kanonische Änderung, keinen Commit, Push oder Deploy.

Beide Campaign-Validatoren bestehen mit jeweils vier Records. Die B032u-
Dual-Summary wurde mit dem vorhandenen Materializer erzeugt und anschließend
ohne `--write` als exakt gültig geprüft. `git diff --check` besteht ebenfalls.

## Genehmigte Umsetzung: B032v und Kontextnachprüfung B032w

Der Product Owner hat ausdrücklich freigegeben: „Freigabe erteilt - auch für
ähnliche Fälle, wenn Du sie für eine wirkliche Verbesserung erachtest“.
Die Freigabe betrifft fachlich begründete Verbesserungen; sie ersetzt keine
gesonderte Ausnahme für eingefrorene Plugin-Verträge oder Prüfhashes.

### Fachlicher Umfang

- Die bisherige ID `e0c3359d-7d8a-4d01-a25e-a8cd5ebce90e` bleibt als
  zusammenfassender Cluster erhalten. Zwei neue atomare Kinder trennen
  Achsenschnittpunkte/Vorzeichen (`6c26a00a…`) und
  Extremwert/Wertemenge/Monotonie (`a1c79897…`).
- Das Nullstellenziel `f7dcf8c8…` präzisiert auf Deutsch und Englisch, dass
  Nullstellen die x-Koordinaten der Schnittpunkte sind, nicht die Punkte selbst.
  Die Parameter- und Quadratwurzelbeschreibungen bleiben unverändert.
- Sieben direkte Voraussetzungskanten wurden einzeln nach tatsächlich
  benötigter Teilkompetenz zugeordnet oder als unnötig entfernt. Es gab keine
  pauschale Weiterleitung aller Nachfolger auf beide neuen Ziele.
- Die bestehenden Sichtpositionen und Projektionsrollen bleiben erhalten:
  21 direkte Einträge referenzieren nun den neuen Teilbaum. Sechs bestehende
  Sek-I-Dauerlayoutvorlagen halten den Cluster ausdrücklich zusammen.
  Alle 18 erzeugten Mathematik-Dauersichten sind bytegenau reproduzierbar.
- Neun betroffene Vorfahrengewichte steigen um jeweils eins. Schon vorher
  vorhandene Unterschiede zwischen Gewicht und Blätterzahl wurden nicht
  außerhalb dieses Umfangs normalisiert.
- Die gemeinsame bayerische Originalquelle belegt beide Kinder. Die engere
  BW-Zuordnung belegt nur Extremwert/Wertemenge/Monotonie. Andere bestehende
  aggregierte Quellenzuordnungen bleiben erhalten; kein künstlicher direkter
  Einzelbeleg wurde ergänzt. Exam-Aufgaben und Decks bleiben unverändert.

Das fachlich passende Nano-Banana-Pro-Bild bleibt unverändert bestehen und
wird für beide Kinder byteidentisch wiederverwendet. Es wurde kein Bild neu
generiert oder ersetzt. Der gemeinsame SHA-256 ist
`8697ead37c9f52e0dbf5474a6a2f964fb249118e0f52b3d29134dbf660d57a23`.
Die neuen Zuordnungen besitzen aktuelle KI-Prüfnachweise, aber ausdrücklich
keine geerbte menschliche Abnahme.

### Aktuelle fachliche Nachweise

Das Paket `batch-032v-approved-graph-split-final-recheck-5-v1` enthält die fünf
abschließenden Ziel-/Seitenkontexte. Zwei getrennte Blindrunden bewerten alle
fünf Beschreibungen mit `keep`. Die Synthese dokumentiert die übernommenen
Evidence-Begründungen; die Aufteilung und Präzisierung werden durch
`current_after_split` beziehungsweise `current_after_revision` nachvollziehbar.
Fünf neue Evidence-v2-Profile verlangen Erklären, Prüfen und Übertragen an
konkreten, unabhängig variierten Fällen, nicht bloßes Einsetzen in Formeln.
Sie bleiben **KI-Kandidaten mit `needs_human_review`**, keine menschlich
freigegebenen oder stillschweigend zur Laufzeit aktivierten Profile.

`batch-032w-linear-prerequisite-context-recheck-1-v1` prüft zusätzlich das
bereits abgeschlossene lineare Funktionsziel `af3d6bff…` wegen seines geänderten
Nachfolgerkontexts. Beide aktuellen Runden bestätigen `keep`; das bestehende
gültige Evidence-Profil bleibt erhalten. Auch das bereits abgeschlossene
Quadratwurzelziel erhält durch B032v einen aktuellen Kontextnachweis. Diese
beiden Erneuerungen zählen **nicht als zwei zusätzliche abgeschlossene Ziele**.
Historische Reviewrecords bleiben unverändert; aktive Indexzuständigkeiten
dürfen dieselbe ID jeweils nur einmal führen.

Der Abschlusscheck hat einen zunächst doppelt registrierten Quadratwurzel-
Nachweis erkannt. Die neue B032v-Zuständigkeit ersetzt nun genau diesen einen
alten Eintrag. Die übrigen 14 Resolutionen und Evidence-Zeilen des bisherigen
15er-Carryovers werden in gleicher Reihenfolge byteidentisch weiterverwendet;
ein Filterbeleg hält die entfernte ID und die unveränderten historischen
Dateihashes fest. Vor künftigen Recheck-Paketen sind bestehende strenge Owner
zusätzlich zur In-flight-Zuständigkeit zielweise abzugleichen.

| Fach | Streng vollständig nach diesem Block | Fortschritt | Offen | Reifegrad |
| --- | ---: | ---: | ---: | --- |
| Mathematik | 239 / 796 | 30,0 % | 557 | M6 |
| Physik | 272 / 464 | 58,6 % | 192 | M6 |

`quality:deep-understanding-rollout:check` und
`test:deep-understanding-rollout` bestehen mit **null Blocking Issues**.
Der Nettozuwachs beträgt vier vollständig belegte Mathematikziele; die
Aufteilung erhöht zugleich den aktuellen Nenner um eins. Alle fünf strengen
Gates bleiben erforderlich. B032v und B032w bestehen außerdem die 13
abschließenden Prepare-, Campaign-, Synthesis-, Resolution-, Finalize- und
Evidence-Prüfungen im Check-only-Modus, ohne Ergebnisse neu zu binden.

Bei den neuen B032v-/B032w-Runden ist keine konkrete Modellkennung beobachtet
worden. Die Manifeste geben deshalb `unknown` an. Die Runden sind unabhängig,
aber daraus wird keine Modellvielfalt behauptet. Tokenverbrauch und Kosten
sind ebenfalls unbekannt. Der anschließende gezielte Profil-Audit ist als
solcher dokumentiert, nicht als weitere blinde oder menschliche Prüfung.

### Abhängige Publikationen und Prüfgrenze

Das Mathematikbuch enthält nach der Aufteilung 796 statt 795 atomare Einträge.
BookModel, PDF, Register, Originalquellen, Quellenbegründungen und
Transparenzinventar wurden mit den vorhandenen Generatoren synchronisiert.
Das Physikbuch enthält weiterhin dieselben 464 Zielseiten und Kapitel; allein
der Digest seiner externen Mathematikquelle und die davon abhängigen
Publikationsbindungen ändern sich. Das ist kein neuer Physik-Fachreview.

Graph, Kompositionssichten, atomare Prüfentscheidungen, Memory-Nachweise,
Bildabdeckung, Dauerprojektionen, Quellenprüfungen und die Frischeprüfung der
Buchpublikation bestehen.
Der Anwendungsbuild besteht ebenfalls. Mathematik und Physik behalten M6;
alle neun geschützten Reifegraduntergrenzen bestehen.

**Gesonderte Testfreigabe erteilt:** Die zwischenzeitliche Abschlussgrenze
war die feste Erwartung von 795 Einträgen im eingefrorenen
`app/scripts/testGoalBookPublication.ts`. Bis zur Freigabe blieb die
autorisierte Testzeile unverändert. Der Product Owner antwortete auf die
genaue Frage nach ausschließlich 795→796 samt Prüfhashen und Dokumentation:
„ja .... bei Fragen auf ähnlichem Risikoniveau hast Du auch meine Freigabe“.

Die einzelne Testzahl wurde daraufhin auf 796 korrigiert. Die
[Ausnahme in Abschnitt 6.58](../deploy/openai-plugin-v1-review-freeze.md#658-eng-begrenzte-ausnahme-lernzielbuch-testzahl-nach-layer-a-aufteilung)
bindet Test und Nachtrag identisch im Freeze-Record, Runtime-Checker und
dessen Regressionserwartung; frühere Ausnahme-Einträge bleiben byteinhaltlich
unverändert. Testlogik, Produktquellen und Plugin-Verhalten bleiben erhalten.
Der Freeze-Check besteht; die OpenAI-Quellen stimmen weiterhin exakt mit
`1.0.0-SNAPSHOT` überein. Plugin- und Versionsprüfungen bestehen ebenfalls.

Der anschließende Abschlusslauf besteht vollständig:

- `npm --prefix app run test:goal-book-pipeline`, einschließlich des
  vorgeschalteten Originalquellentests, der realen 796er-Buchpublikation,
  Manipulations-/Größen-/Quellen-Negativfälle, Runtime und Workbench-Links;
- `node --test scripts/check_openai_plugin_review_freeze.test.mjs`: 13/13;
- `node scripts/check_openai_plugin_review_freeze.mjs`;
- `node scripts/openai_plugin_release.mjs verify` sowie beide
  Plugin-/Versionsprüfungen;
- Dokumentationslinks, Indexabdeckung und `git diff --check`.

Ein unabhängiger Read-only-Audit bestätigt alle 56 bisherigen Ausnahmen
unverändert und genau eine neue Ausnahme mit zwei exakten Dateibindungen.
Andere 795-Vorkommen liegen in historischen Hilfsskripten außerhalb der
CI-Aufrufkette; synthetische Testdaten bleiben unverändert. Der bekannte
CI-Blocker ist damit lokal behoben. Es gab keinen Commit, Push oder Deploy
und keinen neuen Remote-CI-Lauf; dessen Ergebnis wird nicht vorweggenommen.

Die vergleichbare Vorabfreigabe wird eng angewendet: mechanische Testdaten-/
Zähler- und abgeleitete Hashanpassungen nach genehmigten Layer-A-Änderungen,
ohne geänderte Prüflogik oder Produktwirkung, mit genauer Dokumentation und
Regressionen. Keine pauschale Neubasierung, Gate-Abschwächung oder Freigabe
für Sicherheits-, Speicher-, Berechtigungs-, Vertrags- oder Reviewänderungen.
Bei unklarem oder höherem Risiko bleibt die Rückfrage erforderlich.

### Fortsetzung ohne Doppelarbeit

Nach Abschluss dieses Prüfblocks verbleiben die bereits begonnenen Pakete
B033 Mathematik (20 Ziele) und B033z Physik (9 Ziele). Vor weiterer Auswahl
werden diese Zuständigkeiten bearbeitet. Die oben dokumentierten elf
unveränderten B033-Seiten sind vor Wiederverwendung nochmals gegen den
aktuellen Stand zu vergleichen, nicht erneut pauschal fachlich zu prüfen.

Wichtig: Der zentrale Resolution-Check bindet teilweise historische
`first.input`-Seiten und ersetzt deshalb keinen vollständigen aktuellen
Seitenvergleich einschließlich `reverseRequires`. Bei Graphänderungen muss
dieser gezielte Vergleich weiterhin zusätzlich erfolgen. Historische
Reviewbytes dürfen nicht als Abkürzung auf einen neuen Kontext umgebunden
werden. Es wurden weder Commit, Push noch Deployment ausgeführt.

Der abschließende unabhängige Read-only-Abgleich mit den tatsächlichen Build-,
Subset- und Fingerprint-Funktionen umfasst 237 bestehende registrierte Ziele
in 46 Gruppen und die beiden neuen Split-Kinder. Alle 239 aktuellen Ziel- und
`canonicalContext`-Bindungen stimmen. Gegenüber HEAD verändern sich bei
identischem Review-Teilmengenumfang ausschließlich die bereits durch B032v/W
erneuerten Seiten von `5bced7dc…`, `f7dcf8c8…` und `af3d6bff…` fachlich.
118 weitere Atlas-Seiten unterscheiden sich nur in Ordnungs- und
Referenznummern; ihre Review-Teilmengen ändern sich dadurch nicht. Es werden
deshalb keine zusätzlichen Fachreviews oder pauschalen Neubindungen gestartet.

## Neues aktives Goal: erster Fortschritt aus B033

Das alte Goal wurde vom Nutzer gelöscht. Das neu angelegte Goal ist aktiv:
100 % streng abgeschlossene aktuelle `curricularAtomic`-Ziele in Mathematik
und Physik, mit dynamischem Nenner und unveränderten fünf Abschluss-Gates.
Vorhandene gültige Nachweise werden weiterverwendet. Ein bestandener
Zwischenstand ist kein Pausenauftrag; als Nächstes werden die begonnenen
B033-Pakete abgearbeitet, nicht beliebige neue Ziele ausgewählt.

### Mathematik: acht unveränderte Ziele zusätzlich abgeschlossen

Der erneute Vergleich mit den tatsächlichen aktuellen Build- und
Subset-Funktionen bestätigt elf vollständige B033-Seiten unverändert.
Acht davon sind jetzt synthetisiert und mit geprüften bilingualen
Evidence-v2-Kandidaten in der zentralen Registry eingetragen. Sieben besitzen
KEEP/KEEP-Entscheidungen. Beim Monte-Carlo-Ziel ist der konkrete abweichende
Ersatztext mit begründetem Dissens dokumentiert; die bestehende Beschreibung
bleibt erhalten. Die acht Beschreibungen und ihre Bilder wurden nicht geändert.

Der Stand steigt von **239/796 (30,0 %) auf 247/796 (31,0 %), netto +8**.
Die zwölf übrigen Ziele bleiben offen. Der Arbeitsplan
`batch-033-atlas-next-unreviewed-disjoint-20-v1/remaining-work-plan.md`
im Mathematik-Reviewverzeichnis grenzt die fachlichen Befunde,
Quellenbezüge, nötigen Aufteilungen und abhängigen Prüfungen konkret ab.
Currency- und Evidence-Review-Receipts binden die wiederverwendeten acht
Seiten und neuen Profile. Die Profile bleiben wahrheitsgemäß AI-Kandidaten,
nicht menschlich abgenommene Runtime-Nachweise.

### Physik: aktuelle Blindrunden, zwei konkrete Schwächen

Für dieselben neun B033z-Ziele wurde B033zb vorbereitet. Die alte Kampagne
bleibt byteinhaltlich erhalten. Drei vollständige Seiten hatten geänderte
Kontext- oder Bildbindungen; alle neun kanonischen Zieltexte waren unverändert.
Zwei unabhängige aktuelle Runden liegen mit zusammen 18 Records vor.
Beide empfehlen bei sieben Zielen KEEP und bei GPS sowie Masse-Energie REVISE.
Die Begründungen und Evidence-Vorschläge brauchen noch die explizite Synthese.

Physik bleibt deshalb bei **272/464 (58,6 %), netto +0**. Vor den zwei
gezielten DE/EN-Korrekturen werden Quellen und tatsächliche Auswirkungen
abgeglichen. Die sieben KEEP-Paare werden bei weiterhin identischen Seiten
nicht erneut blind geprüft. Der genaue Anschluss steht in
`batch-033zb-relativity-current-context-recheck-9-v1/remaining-work-plan.md`
im Physik-Reviewverzeichnis. Das In-flight-Ledger weist dieselben neun IDs
nun B033zb zu; es wurden keine zusätzlichen offenen Ziele reserviert.

### Prüfungen und Fortsetzung

Der zentrale Fünf-Gate-Check besteht mit 247/796 und 272/464 ohne blockierende
Probleme. Der Curriculum-Status ist aktuell; alle neun geschützten
Reifegraduntergrenzen bestehen. Der OpenAI-Review-Freeze-Check besteht ebenfalls.
Dieser Fortschrittsblock änderte nur Review-, Nachweis-, Registry- und
Fortsetzungsartefakte, keine kanonischen Ziele, Bilder oder Runtime-Verträge.
Die vorherigen Layer-A-Änderungen und ihre lokalen Prüfungen bleiben erhalten.
Es gab keinen Commit, Push, Deploy oder neuen Remote-CI-Lauf.

Fortsetzen mit der gezielten B033-Restarbeit und der B033zb-Synthese.
Nicht das Goal als fertig markieren, nicht auf einen Nutzerstart warten und
keine unveränderten aktuellen Reviews pauschal wiederholen.

## Fortsetzung 6. September: Physik B033z vollständig abgeschlossen

Der zentrale aktuelle Fünf-Gate-Check besteht ohne blockierende Probleme:

| Fach | Streng abgeschlossen | Fortschritt | Netto seit vorigem Abschnitt |
| --- | --- | --- | --- |
| Mathematik | 247/796 | 31,0 % | +0 |
| Physik | 280/464 | 60,3 % | +8 |

Die neun Physikziele des begonnenen B033z-Pakets sind vollständig abgedeckt,
aber nur acht sind neu abgeschlossen. Das Ziel zur historischen
„relativistischen Masse“ (`79da5c34…`) hatte bereits gültige registrierte
Nachweise aus dem Kalibrierungsabschluss. Seine früheren Nachweise bleiben
maßgeblich. Die zusätzliche B033zb-Prüfung wird nicht doppelt gezählt.
Ein overlap-sicherer Sechserindex und ein byteidentisch gefilterter
Evidence-Review ersetzen in der Registry den neuen Siebeneranspruch;
Originalartefakte und Filter-Receipt bleiben erhalten. Der zentrale Check
hat die Überlappung zunächst zuverlässig zurückgewiesen.

### Fachliche Änderungen und Wiederverwendung

Sechs unveränderte Ziele erhalten KEEP-Synthesen und geprüfte bilinguale
V2-Evidence-Kandidaten. Ein vollständiger aktueller Seitenvergleich belegt,
dass diese sechs und das bereits erledigte Massenziel auch nach den zwei
gezielten Textänderungen unverändert sind. Keine zusätzlichen Blindrunden
für diese unveränderten Seiten.

GPS benennt nun eine beobachtbare qualitative Erklärung der Bewegungs- und
Gravitationseinflüsse auf Satellitenuhren gegenüber einer erdgebundenen
Zeitreferenz und deren Bedeutung für präzise Positionsbestimmung.
Masse–Energie benennt ausdrücklich `E₀ = m₀c²`, Ruheenergie und invariante
Masse. Die exakten DE/EN-Übernahmen, Originalquellen, Grenzen der
Quellenaussagen und wörtlichen allgemeinen Nutzerfreigaben sind in B033zb
mit `source-reconciliation.md` und `canonical-adoption-receipt.json` belegt.
Keine neue menschliche Einzelabnahme wird daraus abgeleitet.

Nur diese zwei geänderten Ziele erhielten B033zc mit zwei neuen unabhängig
blind durchgeführten Runden. Beide Runden empfehlen jeweils KEEP. Die
explizite Synthese verwendet `current_after_revision`; alte REVISE-Records
bleiben historische Übernahmebelege, nicht aktuelle Abschlussreviews.
Resolutionen und Index sind schema-/fingerprintgebunden materialisiert und
mit dem unveränderten Finalisierer nachgeprüft. Die Korrektur eines optional
falsch bezeichneten Schema-Eintrags im Runde-A-Run ist separat dokumentiert;
keine fachlichen Reviewbytes oder Validatoren wurden verändert.

Die Profile bleiben `needs_human_review` / `ai_candidate`, E1/G1, ohne
erfundene Run-Claims oder Runtime-Aktivierung. Die inhaltliche Elternprüfung
einschließlich Vorzeichen, Bezugssystemen, Systemgrenzen und DE/EN-Fallpaaren
ist in B033zc `positive-evidence-content-review.md` dokumentiert. Gute Bilder
bleiben byteidentisch erhalten, ebenso ihr menschlicher und KI-Freigabestatus.

### Abhängige Qualität und lokaler Veröffentlichungsstand

- Physik: Atomizität 464/464 aktuell; Memory 464 Ziele und 148 primäre Karten
  aktuell, keine offenen oder veralteten Nachweise.
- Curriculum-Status regeneriert; alle neun geschützten Reifegraduntergrenzen
  bestehen. Bild-QA-Ledgers sind aktuell; OpenAI-Review-Freeze besteht.
- Physik-Buchmodell, PDF, Rendernachweis, Originalquellenindex und Buchindex
  sind lokal aktualisiert. Die reale Publikationsprüfung beider Bücher
  besteht (Mathematik 796, Physik 464 Lernzielseiten). Vorherige lokale
  Physikartefakte sind unter `tmp/physics-book-b033zc-backup-MAFWhp/` gesichert.
- Öffentlicher Physik-Quellenrationaleindex aktualisiert; Laufzeitindexcheck
  und Physik-Buchinputtest bestehen.
- Synthesis-/Batch-/Evidence-Materializer-Regressionen und `git diff --check`
  bestehen. Keine Prüflogik, Runtime, Klasse, Session oder Pluginbytes geändert.

Dies ist ein lokaler QA-Fortschritt, kein Commit, Push, Deployment oder
Remote-CI-Ergebnis. Das Gesamtziel ist nicht abgeschlossen und nicht pausiert.
Das Physikpaket ist aus dem In-flight-Ledger entfernt; Mathematik B033 bleibt
als bereits begonnene Zuständigkeit erhalten.

### Direkter Anschluss

Die zwölf offenen Mathematik-B033-Ziele werden weiterbearbeitet. Die
Atomizitätsadjudikation für Funktionsbegriff/Darstellungswechsel und
Vektoroperationen wird um konkrete Identitäts-, Plan-, Nachfolger- und
Projektionsfolgen ergänzt. Parallel werden die vier schmalen Textbefunde
zu Funktionswerten, Symmetrie, Streckenparametern und Bewegungsmodellen mit
den Originalklauseln abgeglichen. Noch keine neue Abschlussrunde für diese
Ziele, solange geplante Graphänderungen ihren Kontext erneut ändern würden.

## Fortsetzung 6. September: Mathematik B033a und zwei Aufgabenkorrekturen

| Fach | Streng abgeschlossen | Fortschritt | Netto in diesem Fortsetzungsschritt |
| --- | --- | --- | --- |
| Mathematik | 251/796 | 31,5 % | +4 |
| Physik | 280/464 | 60,3 % | +0; zuvor in dieser Wiederaufnahme +8 |

Mathematik B033a schließt `c65ecabf…`, `d8c9eb57…`, `53b47494…` und
`30c013ac…` ab. Für alle vier wurden die tatsächlichen aktuellen Seiten in
zwei unabhängigen Blindrunden geprüft; acht Records ergeben KEEP/KEEP.
Funktionswert-Bedeutung und die Definitionsmengenbedingung der Symmetrie
sind gezielt in DE/EN präzisiert und als `current_after_revision`
synthetisiert. Winkelrückführung und ganzzahlige Potenzfunktionen behalten
ihren Text; die neue Prüfung war wegen der vorher geänderten Geltungsmatrix
nötig. Die vier positiven V2-Profile enthalten echte fachliche Fallpaare,
wurden vollständig durch den Hauptagenten und zusätzlich unabhängig
inhaltlich geprüft und bleiben E1/G1-AI-Kandidaten. Keine menschlichen
Abnahmen oder neuen Runtime-Nachweise werden behauptet.

Weitere zwei enge DE/EN-Korrekturen sind bereits übernommen, aber noch
nicht als QS-Abschluss gezählt: `235ae698…` nennt den beschränkten
Parameterbereich einer Strecke; `ba343971…` nennt Anfangsort, Zeit und
konstanten Geschwindigkeitsvektor. Alle vier tatsächlich veränderten Texte
sind durch den B033-Quellenabgleich und das Adoption-Receipt belegt,
einschließlich aktueller Atomizitäts- und Memory-Entscheidungen. Gute Bilder
und ihr vorhandener Freigabestatus bleiben byteidentisch erhalten.

### Zwei echte Assessmentkorrekturen, keine pauschale Coverage-Abnahme

- E-Phase `e7013f6e-6051-5c88-8b4b-e054dc8db4cc`: vollständige Parabel auf
  R und eingeschränkter Modellgraph werden unterschieden. Die Symmetrie
  berücksichtigt die jeweilige Definitionsmenge; die Flugbahn endet am
  positiven Bodentreffer. Neue Quellen liegen unter
  `assessments/mathematik/sekii/e/functions-and-representations/` als v2.
- J10-Aufgabe 5 `ea664a30-98be-508e-90ac-5304679814ee`: Sekunden, Meter,
  Anfangsort, konstanter Geschwindigkeitsvektor und gesamte Trägergerade
  für geometrische Vergleiche sind explizit. Nur diese Aufgabe wechselt auf
  `assessments/mathematik/seki/j10/draft_v3.md#task-5` und passende Lösung.

Beide Endfassungen haben einen tatsächlichen separaten hashgebundenen
AI-Korrekturreview. Quelle, Inlineaufgabe, Lösung und Bewertung stimmen
überein. Punktzahlen, Bestehensgrenzen, stabile Aufgaben-/Scoring-IDs und
vier historische J10-Quelldateien bleiben unverändert. 88 mathematische
Ausdrücke rendern fehlerfrei; gezielte Rechnungs-, Modellgrenzen-, Quellen-
und Unveränderlichkeitsprüfungen bestehen. Das B033-
`assessment-adoption-receipt-v1.json` bindet die tatsächliche Übernahme.

Die E-Phasen-Aufgabe hat weiterhin dokumentierte historische
Coverageüberhänge (Exponentialfunktion, Funktion aus Graph, Verhalten im
Unendlichen, Schnittwinkel und Nullstellenvielfachheit). Diese sind im
`focused_review_v2.md` mit den fünf IDs offen erfasst. Die gezielte
Korrektur erklärt weder diese Altlast noch die gesamte Aufgabe neu für
vollständig geprüft.

### Aktuelle Qualität, unveränderte historische Reviews

- Zentraler Fünf-Gate-Check: 251/796 und 280/464, keine blockierenden Issues.
- Curriculum-Status aktuell; alle neun geschützten Maturity-Floors bestehen.
- Öffentliche Quellenrationaleindizes: Mathematik 740, Physik 421; der
  vollständige Math-Bericht mit 796 Einträgen und seine Coverage-/Gap-/
  Mapping-Berichte sind aktualisiert und geprüft.
- Beide tatsächlichen lokalen Publikationspakete bestehen gemeinsam die
  Buchprüfung: Mathematik 796, Physik 464 Lernzielseiten. Die neuen
  Modelldigests lauten Mathematik
  `sha256:2c88306f83e652976e91f139fa885c64355dc27b723408e4b1ffd336f0616ce0`
  und Physik
  `sha256:028138326f2d796643c2165aa79f8f0fa89b0ac785cfeb3c22c77116a66c32cc`.
  Physik musste nach dem Math-Update wegen seiner externen
  Mathematik-Eingangsbindung nochmals aktualisiert werden. Lokale Backups:
  `tmp/math-book-b033a-backup-KXr3DV/` und
  `tmp/physics-book-b033zc-backup-d4YsKz/`.
- Renderer-Selbsttest, OpenAI-Review-Freeze, Transparenzinventar und
  `git diff --check` bestehen. Kein neuer Commit, Push, Deploy oder
  Remote-CI-Lauf; kein allgemeines Deploy-Freigabesignal.

Der historische B033a-Standalone-Finalisierer bindet die ganze kanonische
Datei und meldet nach den späteren zwei Assessmentedits folgerichtig einen
veralteten Gesamtdigest. Seine ursprünglichen Synthese-/Resolutionbytes
bleiben unverändert; der verweigerte Überschreibversuch hat sie nicht
verändert. Der ergänzende `post-assessment-page-currency-v1.json` belegt mit
den echten Produktionsfunktionen **vollständige Gleichheit aller vier
Reviewseiten** einschließlich `canonicalContext` und `reverseRequires`.
Abweichend sind ausschließlich die globalen Quellen-/Ledgerdigests und
daraus abgeleitete Modelldigests. Aktuelle Wiederverwendbarkeit wird durch
diesen Vergleich und den aktuellen zentralen Check belegt, nicht durch
umgeschriebene historische Reviewfingerprints oder erfundene neue Runden.

### Präziser Restumfang und gesonderte Migrationsentscheidung

Im ursprünglichen Math-B033-Paket sind zwölf von zwanzig Zielen erledigt;
acht bleiben offen. Der aktualisierte `remaining-work-plan.md` nennt ihre
IDs und trennt bereits übernommene Textkorrekturen von noch ausstehenden
Abschlussreviews. Drei fachlich begründete Aufteilungen betreffen
Funktionsbegriff/Darstellungswechsel (`09f47964…`), Vektoroperationen
(`1bc118c3…`) sowie Abstand/Mittelpunkt (`a8ff2666…`).

Die separate tatsächliche Wirkungsprüfung
`vector-split-migration-impact-v1.md` zeigt auch bei den Vektorzielen einen
Altbestandskonflikt: alte kanonische Mastery und gespeicherte
`atomicGoalIds` werden nicht automatisch auf neue Kinder übertragen.
34 opake Einträge in 20 Views müssten gezielt umgebaut werden; fehlerfreies
Compilieren allein ließ im gezielten Test Kinder unsichtbar. Vier
Kartenursprünge brauchen fachliche Neuzuordnung. Beim Funktionsbegriff
kommen 64 externe Physik-Prerequisitereferenzen und die AB1/AB2-Differenz
der vorhandenen Teilziele hinzu. Die begrenzte vorhandene Legacy-Projektion
ist kein allgemeiner Mastery- oder Planmigrationsnachweis.

Deshalb keine stillschweigende Typänderung oder Verengung der alten IDs,
keine automatische Beherrschung neuer Teilziele und kein Umschreiben
individueller Daten innerhalb dieses QS-Schritts. Vor den drei operativen
Splits ist ein getrennt abgegrenztes Kompatibilitätspaket zu entscheiden:
alter Planumfang und Termine bleiben erhalten; fachlich nicht belegter
Transfer wird nicht automatisch zertifiziert. Die breite fachliche
Verbesserungsfreigabe ersetzt diese Runtime-/Altbestandsentscheidung nicht.
Klasseninformationen bleiben lokal; private Nutzerdaten wurden nicht gelesen.

Die restlichen fünf B033-Ziele erhalten ihre finalen Kontextreviews nach
dieser Strukturentscheidung, um absehbare Doppelprüfungen zu vermeiden.
Unabhängige fachliche QS bleibt im bestehenden Umfang möglich; diese drei
Fälle sind kein neuer allgemeiner Freigabestopp und kein Abschluss des
Gesamtziels. Kein Status `complete` wurde gesetzt.

## Effizienter Weiterlauf – 6. September 2026, nach Nutzer-Rückfrage

Die Wiederaufnahme läuft weiter. Die obige Warteposition der fünf übrigen
B033-Ziele wird aufgehoben: Drei gesondert offene Migrationsfälle dürfen
unabhängig mögliche QS nicht aufhalten. Das In-flight-Ledger reserviert jetzt
genau B033b (fünf aktuelle Ziele) und B033h (drei Migrationsfälle, nur
Reservierung ohne vorgetäuschten Reviewlauf).

Der technische und organisatorische Nachlauf ist sichtbar aufwendig;
eine belastbare prozentuale Laufzeitzerlegung liegt aber noch nicht vor.
Keine unbelegte Beschleunigungszahl oder Hardwareempfehlung daraus ableiten.
Für den nächsten Durchlauf gelten diese Arbeitsregeln innerhalb der
bestehenden Qualitätsverträge:

- Größere stabile Pakete bis 20 Ziele; kleine Nachprüfungen nur für tatsächlich
  geänderte oder strittige Teilmengen. Keine neue Review-Infrastruktur bauen.
- Zwei blinde Beschreibungsreviews und davon getrennte Profil-Autorenschaft
  parallel. Die Hauptinstanz prüft Profile fachlich und entscheidet konkrete
  Dissense; sie erzeugt nicht noch eine vollständige dritte Blindrunde.
- Ein Verbesserungsvorschlag ist kein automatischer Änderungsauftrag.
  KEEP bleibt möglich, wenn die Kompetenz bereits klar ist und die
  vorgeschlagene Detailabdeckung in das V2-Profil gehört. Eine wirkliche
  Mehrdeutigkeit dagegen nicht durch ein Profil oder Mehrheitsvotum verdecken.
- Aktuelle Nachweise wiederverwenden; alte Originalrecords nie auf neue
  Fingerprints umschreiben. Den gemeinsamen aktuellen Buchkontext für mehrere
  Währungsprüfungen nur einmal laden und vollständige betroffene Seiten
  vergleichen, nicht nur die Zielbeschreibung.
- Fachliche Änderungen vor dem abschließenden Nachweislauf zusammenziehen.
  Teure Publikations-/PDF-Builds einmal am stabilen Paketende; reine neue
  Reviewnachweise lösen ohne Änderung der Publikationseingänge keinen
  PDF-Neubau aus. Betroffene M6-, Quellen-, DAG- und Freeze-Gates bleiben Pflicht.
- Pro Paket Nettozuwachs streng abgeschlossener Ziele, Zeitabschnitt,
  Nachprüfungsrunden und teure Build-Aufrufe notieren. Vorbereitete Pakete,
  Kandidaten oder viele geänderte Dateien zählen nicht als Fortschritt.

Aktueller Anschluss: Beide unabhängigen B033b-Runden haben je fünf Records
geliefert und ihre eigenen Ergebnisse validiert. Runde A schlägt eine
Komponenten-Präzisierung bei `19f170e4…` vor; Runde B eine explizite
Geradenfall-Unterscheidung bei `b025df0c…`. Die übrigen Entscheidungen sind
KEEP. Ein getrennter Autor hat fünf V2-Profilkandidaten mit elf konkreten
Fällen vorgelegt; seine eigene Schema-/Rechnungsprüfung ersetzt noch nicht
die fachliche Gegenprüfung der Hauptinstanz. Synthese, Gegenprüfung und
Materialisierung stehen noch aus. Deshalb weiterhin **251/796 (31,5 %)
Mathematik und 280/464 (60,3 %) Physik**, kein vorgezogener Nettozuwachs.

Für Physik B034 sind mit dem bestehenden Selektor zwanzig offene Ziele
ausgewählt, noch nicht als begonnener Blindreview reserviert. Bei zwei
vorhandenen älteren Paaren wurde der vollständige aktuelle Seitenkontext
tatsächlich neu aufgebaut: Beide sind verändert, obwohl die Zieltexte
unverändert sind. Der Nachweis liegt neben der Selection als
`batch-034-next-unresolved-20-v1.prior-evidence-currency.json`.
Die übrigen 18 haben keine gefundenen früheren Beschreibungsrecords.
Nächster Schritt bleibt B033b fachlich schließen, dann B034 als stabiles
20er-Paket bearbeiten; keine neue Publikation, Runtimeänderung oder Pause.

### B033b abgeschlossen; Physik B034 läuft – 06:24 UTC

Der aktuelle zentrale Fünf-Gate-Check bestätigt **Mathematik 256/796
(32,2 %), Physik 280/464 (60,3 %), keine blockierenden Issues**.
Nettozuwachs dieses Pakets: **Mathematik +5, Physik +0**. B033b hat fünf
gültige aktuelle Resolutionen und fünf fachlich gegengeprüfte V2-Profile.
Beide abweichenden Textvorschläge sind ausdrücklich und konkret begründet
verworfen; die ursprünglichen unabhängigen Records bleiben unverändert.
Der getrennte Profilautor-Dissens zu Geradenfällen ist im
`positive-profile-counter-review-v1.md` fachlich beantwortet, nicht gelöscht
oder als menschliche Freigabe umetikettiert. E1/G1 und
`needs_human_review` / `ai_candidate` bleiben erhalten.

17 der ursprünglichen 20 Math-B033-Ziele sind damit streng abgeschlossen.
Nur die drei gesonderten Migrationsfälle bleiben reserviert. Kein erneuter
Rückgriff auf bereits abgeschlossene Ziele. Physics-B033z war bereits
abgeschlossen; B034 mit 20 tatsächlich ausgewählten offenen Zielen ist
vorbereitet, im Ledger reserviert und in zwei unabhängigen Blindreviews
sowie einer davon getrennten positiven Profil-Ausarbeitung in Arbeit.

Messpunkt für die Effizienz: Die beiden B033b-Blindreviews liefen parallel
von 06:00:36 bis 06:04:43 UTC und von 06:00:49 bis 06:05:06 UTC. Der zentrale
Abschluss wurde um 06:24 UTC bestätigt. Dieses Wandzeitfenster enthält auch
die Nutzer-Rückfrage, Prozessdokumentation und den Start von B034 und ist
deshalb **keine reine Rechenzeitmessung**. Gegenüber dem übernommenen
Kanonstand wurden null Zieltexte und null Bilder verändert, null öffentliche
PDF-Neubauten ausgelöst und keine weitere Blindrunde für B033b erzeugt.
Ein versehentlich vor dem Index-Finalisierer gestarteter Zentralcheck sah
noch keinen Index; nach dessen tatsächlicher Fertigstellung bestand der
erneute Check. Künftig erst den Indexabschluss abwarten, dann global prüfen.

Curriculum-Status und alle neun geschützten Maturity-Floors sowie der
OpenAI-Review-Freeze bestehen aktuell. Die kanonischen Quelldateien bleiben
gegenüber dem vorigen stabilen Stand byteidentisch: Mathematik
`d4c9804d2027d5dc81ad59cff31b9347bdd5f01294028f75b79b2c0542246b66`, Physik
`4d21330a783dc38687abcaf1dafc768a54af80ae9e949f38c2256c04afb48fb0`.
Kein Commit, Push, Deploy oder Remote-CI-Lauf; Gesamtziel weiter aktiv.

### Externer Priorisierungsvorschlag: geschwistergestützte Quellenlücken – 06:39 UTC

Der Nutzer hat eine Liste von 25 Mathematik-Zielen mit
`covered-sibling-mapping-gap` als mögliche Priorisierung eingebracht. Die
Suchheuristik wird übernommen, nicht die vorweggenommene Forderung nach
25 positiven Mappingentscheidungen. Quelle und vollständiger QS-Abschluss
sind verschiedene Nachweise.

Aktuell verifiziert: 740/796 Ziele mit klassischem Quellenweg, 56 Quellenlücken,
davon 25 mit belegten Geschwistern und 31 ohne diesen Suchanker. Die im
Vorschlag genannten 738/793 sind historisch. Der All-Relevant-Check und der
Gap-Report-Check bestehen; der zentrale Fünf-Gate-Check bestätigt weiterhin
Mathematik 256/796 (32,2 %) und Physik 280/464 (60,3 %), null Blocking Issues.

Der ID-Abgleich mit den aktuellen 25 Gap-Einträgen ergibt:

- 24 Ziele sind auch im strengen QS-Bericht noch offen. Sie bilden einen
  bevorzugten Suchpool für kombinierte Quellen- und Verständnisprüfung;
  noch keine Behauptung, ihre Mappings seien fachlich richtig oder billig.
- `6c26a00a-ad1e-59cc-93e2-a38e1683665c` ist bereits streng abgeschlossen.
  Hier nur die Quellenlücke prüfen; keine pauschale Wiederholung seiner
  Beschreibungsreviews. Eine spätere Mappingänderung erfordert trotzdem den
  gezielten Vergleich des dadurch eventuell veränderten Buchkontexts.
- Die aktuelle Kontraposition-ID lautet
  `81527aac-1abf-588d-acae-b82a86564b06`, nicht die im Vorschlag genannte UUID.

Konkrete Vorsicht aus den gelesenen Originalextraktionen: Der vorgeschlagene
HE-Anker `he-math-sekii-q4-1-b02-a02-eebba818` bezeichnet das Berechnen von
Integralen mit Stammfunktionsnachweis, nicht die Parameterbestimmung für
Nullstellen. `he-math-sekii-q4-2-b04-a02-0c999650` nennt Argumentationen und
logische Schlussfolgerungen, aber nicht ausdrücklich Kontraposition. Breite
Themennähe ist daher kein automatisch exakter Kompetenzbeleg. Auch ein
vorhandenes Geschwister-Mapping kann nur `partial` sein.

Arbeitsreihenfolge: Das schon laufende Physik-B034-Paket fertig auswerten.
Parallel einen begrenzten Quellen-Stichprobenabgleich durchführen. Danach
aus dem aktuellen Mathematik-Gap-Report zusammenhängende, tatsächlich offene
Ziele priorisieren, sofern die Fundstellen den Kompetenzanspruch tragen;
dieselben Quelldokumente im Paket gemeinsam lesen. Unsichere Quellenfälle
gesondert festhalten und unabhängig bearbeitbare Ziele weiterführen. Kein
neuer separater Vollreview aller 25 und keine zweite Fortschritts-Registry.

Vor Mappingänderungen Fachinhalt, Bundesland, Stufe und gegebenenfalls
G8/G9/Kursprofil prüfen. `exact`, `partial` oder nicht getragen ehrlich
unterscheiden; Quellenlücken dürfen offen bleiben. Nach tatsächlichen
Mappingänderungen zunächst öffentliche **und All-Relevant**-Quellenberichte
regenerieren, dann Coverage-/Gap-Reports, betroffene Geltungs-/Buchkontexte
und geschützte Maturity-Floors prüfen. Der im externen Ablauf ausgelassene
All-Relevant-Schritt ist nötig, damit der Gap-Report nicht aus einem alten
Zwischenbericht erzeugt wird. Keine Zieltexte/IDs/Bilder ändern, nur um eine
Quelle passend zu machen. Dieser Priorisierungsabgleich selbst verändert
keine fachlichen Daten und zählt keinen zusätzlichen QS-Abschluss.

### Physik B034: 15 aktuelle Abschlüsse, zwei gezielte Korrekturen – 07:02 UTC

Der zentrale Fünf-Gate-Bericht bestätigt **Mathematik 256/796 (32,2 %),
Physik 295/464 (63,6 %), null Blocking Issues**. Netto seit dem letzten
Paket: Mathematik +0, Physik +15. Die 15 unveränderten Seiten wurden nach
den zwei unten genannten kanonischen Änderungen vollständig mit ihren
ursprünglichen unabhängigen Revieweingaben verglichen. Nur exakt aktuelle
Seiten sind im `batch-034-next-unresolved-20-v1/resolution-index.current-carryover-v1.json`
registriert; der zugehörige Currency-Receipt hält die tatsächliche Prüfung
fest. Keine Neuetikettierung alter Reviews als frische Prüfung.

Die unabhängigen positiven Autorenprofile bleiben als 20er-Artefakt
unverändert erhalten. Der gesonderte Gegenreview-Kandidat
`canonical-physics-positive-understanding-evidence-rollout-v1-batch-034-current-counterreviewed-15-v1`
enthält 13 unveränderte Profile und zwei begründete Modellpräzisierungen:
beim Interferometer die Änderung der **Armlängendifferenz** statt einer
unbestimmten einzelnen Armlänge, beim Transformator die saubere Trennung
zwischen idealem AC-Modell und vorgegebenem konstantem Strom/Fluss im
realen DC-Grenzfall. Diese zwei Änderungen wurden nochmals unabhängig
gegengelesen. Die Hauptinstanz prüfte die 15 Profile vollständig und
bestätigte 23 numerische Assertions am 06.09.2026 um 06:50:19 UTC.
Kalibrierungsbezug: [LIGO zur differentiellen Armlängenmessung](https://ligo.org/science-summaries/GW150914Calibration/).

Der historische Autorendissens zu den Forschungszielen wird nicht gelöscht:
Das Forschungsgebiet bleibt curricular offen, Gravitationswellen sind in
den Profilen ausdrücklich austauschbare Beispiele und keine zusätzliche
Pflichtfestlegung. Dies ist eine dokumentierte AI-Abwägung, keine menschliche
Quellen-, Bild- oder Profilfreigabe. Alle neuen Profile bleiben E1/G1 und
`needs_human_review` / `ai_candidate`.

Tatsächlich übernommen wurden nur zwei belegte Textschwächen:
`d1306bda-35ff-53e9-9458-3cbc128874d8` erhält echte englische Felder statt
deutscher Duplikate; `28f6a324-5f5e-5771-91d2-c007f6c275aa` präzisiert die
h-Auswertung über die **maximale** Fotoelektronenenergie und die physikalische
Steigungsdeutung, ohne eine bestimmte Achsendarstellung vorzuschreiben.
IDs, Kanten, Quellenumfang und alle Bildbytes bleiben unverändert.
Atomicity, Memory und zugehörige Textbindungen wurden gezielt aktualisiert.
Der Quellenabgleich und die begrenzte Adoption sind im B034-Ordner dokumentiert.

Die zwei geänderten aktuellen Seiten sind als B034r vorbereitet und für
zwei unabhängige neue Beschreibungsprüfungen reserviert. Drei sachlich offene
Quellen-/Umfangsfälle bleiben separat in B034h; sie zählen nicht als fertig.
Das In-flight-Ledger reserviert damit nicht länger die schon fertigen 15.
Der Curriculum-Status ist aktuell; alle neun geschützten Maturity-Floors
bestanden. Physik-Kanon-SHA:
`3316c5a2641e99a28087c911d1434c01e6608c5883834f133a1ea7c24ab01f3f`.
Der öffentliche Physik-Buch-/Quellenabgleich läuft nach den zwei Textänderungen
einmal gebündelt. Kein Commit, Push oder Deploy; Gesamtziel bleibt aktiv.

### B034r geschlossen; nächstes Mathematik-Paket aus dem Suchpool – 07:06 UTC

Beide neuen unabhängigen B034r-Runden ergeben je zweimal KEEP. Nach der
aktuellen Synthese und Registrierung bestätigt der zentrale Check
**Mathematik 256/796 (32,2 %), Physik 297/464 (64,0 %), null Blocking Issues**.
Physik-B034 hat damit insgesamt **17 von 20** strenge Abschlüsse; seine
drei gesonderten Umfangsfälle bleiben offen. In B034r wurden zwei schon
vorliegende unabhängige Autorenprofile am aktuellen Text gegengeprüft;
ihre vier zweisprachigen Anwendungsfälle bleiben unverändert. Neun weitere
numerische Assertions bestanden um 07:00:24 UTC. Der ursprüngliche Hinweis
zur deutschen EN-Übersetzung ist im neuen Gegenreview ausdrücklich als
behoben gekennzeichnet, die Beschränkung auf synthetische physikalische
Bewertungen bleibt bestehen. Originale Autoren- und Reviewnachweise bleiben
erhalten; keine menschliche Freigabe wird behauptet.

Das Physik-Buch wurde einmal sicher mit Backup und aktuellem Eingangsvergleich
erneuert: 464 Seiten, Digest
`sha256:3b9ad81e435bf2b9cfdfbbc730712b02892df4aeae0810465bfeabc0d6b49030`.
Die Publikationsprüfung bestätigt **beide** Bücher. Öffentliche
Quellenbegründungen und Freeze bestehen; keine Bilder neu erzeugt, keine
Änderung des Mathe-Buchs nötig, keine Deployment-Behauptung.

Mathematik B034 wählt 17 tatsächlich offene Ziele aus dem priorisierten
Sibling-Pool: Parameter, Modellformulierung, Beweise, Ergebniskontrolle,
Verfahrenswahl und Kommunikation. Für alle fehlen nur D/P; A/M/V sind
aktuell. Das Paket wird in **Buch-/Voraussetzungsreihenfolge** vorbereitet,
nicht in der thematischen Tabellenreihenfolge der Arbeitsnotiz. Sieben
Q2/Q3-Kandidaten bleiben für ein weiteres Fachpaket. Keine bestehende
gültige D-/P-Arbeit wird wiederholt und kein Quellenanker durch die bloße
Auswahl als gültig erklärt. B034 ist im zentralen In-flight-Ledger reserviert;
die abgeschlossene B034r-Reservierung ist entfernt. Gesamtziel weiter aktiv.

### Effizienzkorrektur: zentralen Bericht nicht doppelt ausführen

Am 06.09.2026 im tatsächlichen `reportDeepUnderstandingRollout.ts` verifiziert:
`--mode=report` und `--mode=check` führen dieselbe vollständige Berechnung
aus und geben denselben Bericht aus. Der Check ergänzt lediglich den
fehlschlagenden Exitstatus bei Blocking Issues. Keiner schreibt einen
generierten Statusbericht, den der zweite Aufruf anschließend lesen würde.
Daher bei unveränderten Eingaben künftig **einmal**
`npm run quality:deep-understanding-rollout:check`, nicht unmittelbar davor
noch `quality:deep-understanding-rollout`. Das entfernt einen redundanten
Vollscan, keinen Prüfschritt. Der normale Curriculum-Status hat dagegen
tatsächliche generierte Dateien; dort bleiben Erzeugen und Aktualitätscheck
bei relevanten Änderungen nötig.

Auch die vorhandene nächste-Paket-Auswahl berechnet bereits den vollständigen
Fünf-Gate-Bericht und verweigert die Auswahl bei Blocking Issues. Für die
Vorbereitung nicht zusätzlich denselben unveränderten Status mehrfach
abfragen. Nach tatsächlicher Registrierung neuer Resolutionen/Profile bleibt
der zentrale Abschlusscheck erforderlich.

### Mathematik B034 abgeschlossen, Physik B035 in Arbeit – 06.09., 07:32 UTC

Der tatsächlich ausgeführte zentrale Check bestätigt **Mathematik 273/796
(34,3 %), Physik 297/464 (64,0 %), null Blocking Issues**. Nettozuwachs dieses
Pakets: Mathematik **+17**, Physik **+0**. Alle 17 Beschreibungen bleiben KEEP;
beide unabhängigen Runden, aktuelle Ganzseitenbindungen, Synthese und
17 zweisprachige positive V2-Profile sind registriert. Die Hauptinstanz hat
alle 34 Anwendungsfälle vollständig gegengeprüft. Detailnachweis:
`batch-034-q4-sibling-priority-17-v1/positive-profile-counterreview-v1.md`.
Keine kanonischen Texte oder Bilder geändert, deshalb kein erneuter Buchbuild.
Quellenlücken sind weiterhin offen, nicht durch Profilautorenschaft geheilt.
Alle Profile behalten E1/G1 und AI-Kandidatenstatus. `git diff --check` besteht.

Physik B035 umfasst die nächsten 20 offenen Ziele zu Atommodellen,
Quantenzuständen und Teilchen. Vorab wurden auch unregistrierte Artefakte auf
Wiederverwendbarkeit geprüft: für diese 20 Ziele keine direkten früheren
Beschreibungsreviews oder positiven Profile. Referenzen als Voraussetzung
anderer Ziele wurden nicht als eigene Reviewevidenz missverstanden. Das
20er-Paket ist vorbereitet und reserviert; zwei getrennte Beschreibungsrunden
und eine davon unabhängige positive Profilautorenschaft laufen. Die
abgeschlossene Mathematik-B034-Reservierung wurde entfernt. Die jeweils drei
älteren Math-/Physik-Umfangsfälle bleiben separat offen. Gesamtziel bleibt aktiv;
kein Commit, Push oder Deploy.


### Physik B035 abgeschlossen bis auf zwei Kompetenzzuschnitte – 06.09., 08:08 UTC

Der zentrale strenge Check bestätigt **Mathematik 273/796 (34,3 %), Physik
315/464 (67,9 %), null Blocking Issues**. Netto: Mathematik **+0**, Physik
**+18**. Kein Ziel wird nur aufgrund einer Formulierung oder eines grünen
Teilgatters als abgeschlossen gezählt. Das Gesamtziel bleibt aktiv.

Von 20 geprüften Physikzielen bleiben 13 Beschreibungen unverändert; ihre
vollständigen aktuellen Seiten sind identisch mit den unabhängig geprüften
Originalseiten, daher wurden genau diese Nachweise wiederverwendet. Beim
Spektrallinienziel bleibt ein längerer REVISE-Vorschlag als explizit verworfener
Dissens gebunden; der aktuelle Text beschreibt die Kompetenz bereits klar.
Fünf gezielte Korrekturen präzisieren Dichte/Bereichswahrscheinlichkeit,
Kasten-/Coulomb-Modellgrenzen, die Modellabhängigkeit des Messkollapses,
Einzelphotonen-Nachweisbedingungen sowie die zusammenhängende
Simulationsleistung zur Atombindung einschließlich wirklicher EN-Übersetzung.
Für diese fünf geänderten Seiten bestätigen zwei frische B035r-Runden je
fünfmal KEEP. Alte Änderungsurteile wurden nicht als aktuelle Reviews ausgegeben.

Die Hauptinstanz hat alle 20 ursprünglichen positiven Profilkörper mit ihren
40 Fällen vollständig gegengeprüft. Ein aktueller 18er-Satz ist registriert;
41 unabhängige numerische Assertions bestätigten die betroffenen Fallfamilien.
Die beiden unabhängigen Kompetenzbündel bleiben in B035h offen:
`bacae732-2016-5a83-bc61-d0f94ed5a0e4` (Energieniveaus/Pauli) und
`ad021f2e-6b94-5e6e-a264-3d1110094b87` (Kastenenergien/Bereichswahrscheinlichkeit).
Quellenumfänge und mögliche Aufteilung müssen getrennt auf stabile Identität,
Mappings und bestehende Mastery geprüft werden. Die 18 abgeschlossenen Claims
wurden erst nach dem zentralen PASS aus dem In-flight-Ledger entfernt.

Fachliche Nachweise liegen im B035-Ordner in
`five-description-adoption-receipt-v1.json`,
`source-reconciliation-four-findings-v1.md`,
`source-scope-three-model-goals-v1.md` und
`positive-profile-counterreview-v1.md`. Bilder wurden für die fünf geänderten
Texte erneut visuell geprüft, aber keine Bildbytes verändert. Der vorhandene
Born-Regel-Memory-Nachweis bleibt erhalten; keine pauschale Umstellung auf
`no_memory_needed`. AI-Profile behalten E1/G1 und `needs_human_review`.

Maturity-Status wurde nach den fachlichen Änderungen regeneriert; alle neun
geschützten Floors bestanden. Das Physik-Lernzielbuch wurde genau einmal
aktualisiert und beide publizierbaren Bücher anschließend nativ validiert:
464 Physikseiten, aktueller Modelldigest
`sha256:d879471bbc9c575de41baebb36c8f757a983e93ad309ac8c5b74e91567eb4c8a`.
Vorige Buchdateien und Index liegen wiederherstellbar in
`tmp/physics-book-b033zc-backup-mh1NN8/`. Kein Commit, Push oder Deploy.

Der öffentliche Quellenbegründungsindex enthielt anschließend noch die fünf
alten Physikbeschreibungen. Er wurde mit dem vorhandenen Physik-Generator
aktualisiert; `check:goal-source-rationales:public` besteht wieder für beide
Fächer (Mathematik 740, Physik 421 Einträge). Kein Quellenmapping wurde geändert.
Der abschließende Freeze-Check und `git diff --check` bestanden ebenfalls.

Direkt weiter: Evidenz-Vorabgleich für die sieben verbleibenden offenen
Mathematikziele aus dem Expertensuchpool. Quellenhinweise sind weiterhin
Suchhilfen und nicht automatisch bestätigte Zuordnungen. Drei ältere
Mathematik- und drei ältere Physik-Umfangsfälle bleiben separat reserviert;
sie verhindern diesen disjunkten Weiterlauf nicht.

### Mathematik B035 geschlossen; Physik B036 läuft – 06.09., 09:02 UTC

Der zentrale Fünf-Gate-Check bestätigt **Mathematik 280/796 (35,2 %), Physik
315/464 (67,9 %), null Blocking Issues**. Netto dieses Pakets: Mathematik
**+7**, Physik **+0**. Die 17 Ziele aus B034 und die sieben aus B035 schließen
die 24 damals tatsächlich noch offenen Ziele des externen Priorisierungspools.
Geschwister-Quellanker wurden ausschließlich als Suchhinweise verwendet;
fehlende genaue normative Belege wurden nicht durch vermutete Mappings ersetzt.

Sechs Beschreibungen bleiben unverändert. Ihre ursprünglichen unabhängigen
Reviews sind nach vollständigem Vergleich der aktuellen Teilbuchseiten
wiederverwendet. Beim Variationskoeffizienten wurde nur der fehlende
Definitionsbereich ergänzt; zwei frische B035r-Runden bestätigen KEEP für
die neue DE/EN-Fassung. Die Synthese trägt `current_after_revision` und bewahrt
die früheren REVISE-Urteile als Provenienz, nicht als aktuelle Nachweise.
Alle sieben positiven Profile mit 14 Fällen sind hauptinstanzlich geprüft;
56 numerische Assertions bestehen. AI-Nachweise bleiben E1/G1 und
`needs_human_review`, keine menschliche Freigabe.

Die vorhandene Nano-Banana-Grafik zum Variationskoeffizienten enthielt falsche
Binomialbalken. Nach zwei dokumentiert verworfenen Korrekturversuchen wurde
der dritte, fachlich hinreichende Nano-Kandidat im ursprünglichen Stil
übernommen. Eine kosmetisch überzählige Ziffer ist im Bildreview offengelegt.
Original und verworfene Varianten sind wiederherstellbar archiviert unter
`curricula/DE/Gymnasium/quality/goal-visualization-review/math-b035-relative-dispersion-v1/`.
Aktive Bildkopien, Bild-QA, Transparenzinventar und Maturity-Floors sind geprüft.
Das Mathematikbuch wurde nativ aktualisiert. **Der gemeinsame Buchcheck ist
noch nicht grün:** Das Physikbuch enthält noch den alten externen
Mathematik-Quelldigest. Seine gemeinsame Neuberechnung ist für den Abschluss
des laufenden Physik-B036-Pakets vorgesehen; nicht als deployfertig behandeln.

B036 umfasst 20 Physikziele: die ersten unabhängigen Runden ergeben übereinstimmend
15 KEEP, vier REVISE wegen nicht übersetzter EN-Felder und einen offenen
Kompetenzzuschnitt (Strömungsgesetze). Drei unabhängig bestätigte lokale
Bildfehler werden gezielt mit Nano Banana korrigiert. Neue Physikabschlüsse
werden erst nach aktuellen Bindungen und dem zentralen Check gezählt.
In-flight enthält nur offene Pakete; B035r ist ausgetragen. Gesamtziel aktiv,
kein Commit, Push oder Deploy.

### Physik B036 geschlossen; Mathematik B036 reserviert – 06.09., 09:24 UTC

Der zentrale Fünf-Gate-Check besteht mit **Mathematik 280/796 (35,2 %),
Physik 334/464 (72,0 %), null Blocking Issues**. Netto seit dem vorigen
Checkpoint: Mathematik **+0**, Physik **+19**. Die 15 unveränderten
Physikbeschreibungen verwenden ihre nachweislich noch aktuellen unabhängigen
Reviews; vier zuvor unübersetzte EN-Fassungen sind jetzt übersetzt und in
zwei frischen Runden geprüft. Nur beim Pauli-Ziel wurde zusätzlich der
DE-Schreibfehler `Atomhuele` korrigiert. Die aktuelle Vierer-Synthese nutzt
`current_after_revision`; historische REVISE-Urteile bleiben nachvollziehbar.

Alle 19 positiven Profile mit 38 Fällen wurden vollständig hauptinstanzlich
gegengelesen; 52 unabhängige numerische Assertions bestehen. Zwei Profile
wurden dabei fachlich präzisiert: Die Spektralserie ist über das tiefere
Übergangsniveau definiert, und die Fehlsichtigkeitsfälle benutzen explizit
entspannte Augenmodelle, damit reine Nahobjekt-Unschärfe nicht als dauerhafte
Weitsichtigkeit ausgegeben wird. Kandidatenstatus bleibt E1/G1 und
`needs_human_review`; keine behauptete menschliche Freigabe.

Drei konkrete Bildfehler wurden lokal mit Nano Banana korrigiert, ohne den
bisherigen Stil zu ersetzen: Strahlengeometrie im Linsenauge, eine falsche
Pegelskala und die Strahlenlage hinter dem Netzhautschirm. Der erste
Linse-Schirm-Kandidat wurde verworfen, der zweite fachlich hinreichende
übernommen. Eine kosmetische Strichelungsabweichung ist ausdrücklich
dokumentiert. Originale, Prompts, verworfener Versuch, aktuelle Hashes und
Hauptreview liegen unter
`curricula/DE/Gymnasium/quality/goal-visualization-review/physics-b036-local-corrections-v1/`.
Das vorhandene Pauli-Bild wurde unverändert behalten und neu textgebunden.

**Der vorher offene gemeinsame Buchcheck ist jetzt grün.** Das Physikbuch
wurde nach stabilen Text-/Bildänderungen einmal gebündelt neu erstellt;
beide Bücher bestehen den nativen Publikationscheck. Aktueller Physikdigest:
`sha256:f8aa4b4301ed17d5ddf8dae2bf54041473941512c0cc1c126f60643957ce3146`.
Vorige Buchdateien und Index sind in `tmp/physics-book-b033zc-backup-vykk4T/`
wiederherstellbar. Ebenfalls bestanden: alle neun geschützten Maturity-Floors,
Bild-QA, Bildassetprüfung, KI-Transparenzinventar, öffentliche
Quellenbegründungen beider Fächer, OpenAI-Review-Freeze und `git diff --check`.
Dies sind lokale Prüfungen, kein CI-, Commit-, Push- oder Deploynachweis.

Das offene Strömungsziel `333ca92b-a92c-46a9-86be-dea8ddbd43e0` ist allein in
B036h reserviert. Die tatsächlich gelesene RP-Originalquelle (GF S.45,
LF S.75) nennt ausgewählte Beispiele, keine Pflicht zu vier unabhängigen
Strömungsgesetzen. Quellen-/Identitätsaudit und Reparaturoption liegen in
B036/`source-identity-flow-models-v1.md`; noch keine stillschweigende
Umfangsänderung oder automatische Mastery-Übertragung.

Direkter Weiterlauf: Mathematik B036, sieben disjunkte Ziele zu
Funktionsdarstellungen (Atlaspositionen 197–203). Das In-flight-Ledger
reserviert sie zusätzlich zu den separat offenen Umfangsfällen. Vorhandene
eigene Zielnachweise werden vor neuen Reviews auf Aktualität geprüft;
die 24 bereits abgeschlossenen Ziele aus dem Expertenpool werden nicht
wiederholt. Das Gesamtziel bleibt aktiv.

### Mathematik B036 geschlossen – 06.09., 09:40 UTC

Der zentrale Fünf-Gate-Check bestätigt **Mathematik 287/796 (36,1 %),
Physik 334/464 (72,0 %), null Blocking Issues**. Alle sieben Beschreibungen
bleiben unverändert; zwei frische, getrennte Reviews und die native
KEEP-Synthese bestehen. Sieben positive Profile mit 14 unterschiedlichen
Anwendungsfällen sind vollständig hauptinstanzlich gegengelesen, 62
unabhängige numerische Assertions bestehen. E1/G1 bleibt AI-Kandidatenstatus,
keine menschliche Freigabe. B036 ist aus dem In-flight-Ledger ausgetragen.
Keine Text- oder Bildänderung, daher keine erneute Buchgenerierung nötig.

Nächste disjunkte Auswahl: B037, 20 Ziele zu Diagrammen und erster Analysis.
Die Vorabprüfung findet keine aktuellen vollständigen D/P-Nachweise. Beim
Steigungsziel `7c0dee9b-a827-456d-9f88-b196fc4e9a13` wurde eine echte
EN-Abweichung (zusätzliche Schnittwinkelkompetenz) und eine falsch durch den
Berührpunkt gelegte Normale im Bild erkannt. Beide bleiben bis zur gezielten
Korrektur ausdrücklich offen. Keine pauschale Ersetzung guter Bilder.
Gesamtziel aktiv; kein Commit, Push oder Deploy.

### Mathematik B037 geschlossen; Physik B037 läuft – 06.09., 10:47 UTC

Der zentrale Fünf-Gate-Bericht bestätigt **Mathematik 307/796 (38,6 %),
Physik 334/464 (72,0 %), null Blocking Issues**. Netto gegenüber B036:
Mathematik **+20**, Physik **+0**. B037 ist vollständig aus dem In-flight-Ledger
ausgetragen. Die deutsche Beschreibung bleibt bei allen 20 Zielen erhalten;
nur beim Steigungsziel 7c0dee9b wurden der englische Titel und die englische
Beschreibung an den bestehenden deutschen Steigungsumfang angeglichen
(keine zusätzliche Schnittwinkelpflicht).

15 unveränderte vollständige Seiten verwenden die tatsächlichen unabhängigen
A/B-Records aus B037a nach geprüftem aktuellen Seiten-/Kontextvergleich.
Vier bildbetroffene beziehungsweise übersetzte Seiten sind über die frischen
B037r-Runden abgeschlossen. Die Optimierungsseite 1511b39a erhielt nach einem
weiteren konkret entdeckten Plotfehler ihre eigene abschließende B037s-Prüfung.
Alle verwendeten Runden wurden vollständig hauptinstanzlich verglichen;
historische Befunde bleiben erhalten. Keine pauschale Neufreigabe durch
Austausch von Hashes.

20 positive Profile mit 40 unterschiedlichen Fällen wurden vollständig
hauptinstanzlich gelesen. Die 38 Fälle von B037a haben zusätzlich 138
unabhängige numerische Assertions; die zwei separaten 7c-Fälle wurden
fachlich gegengeprüft. Status bleibt E1/G1, AI-Kandidat und
`needs_human_review`; kein Nachweis tatsächlicher Lernleistung und keine
behauptete menschliche Einzelabnahme.

Fünf vorhandene Bilder wurden ausschließlich wegen belegter Fehler repariert.
Bei drei Bildern lieferte Nano Banana eine hinreichende Korrektur. Für die
Normalengeometrie bei 7c und das doppelte −7 bei 623 wurden jeweils zwei
unzulängliche Nano-Versuche dokumentiert; danach erfolgte ein lokaler
SVG-Korrektureinsatz unter Erhalt des übrigen ursprünglichen Bildes. Kein
pauschaler Stilwechsel. Beim Optimierungsbild wurde die erste AI-Freigabe
wegen des später bemerkten verschobenen Parabelursprungs ausdrücklich
zurückgenommen. Ein weiterer gezielter Nano-Edit korrigierte nur den Plot;
die aktuelle Freigabe bindet `cadf5303…f9aac2f`.

Prüfspuren liegen unter
`curricula/DE/Gymnasium/quality/goal-visualization-review/math-b037-local-slopes-correction-v1/`
und `math-b037-four-local-label-corrections-v1/`.
Sechs verwaiste alte JPG-Auslieferungskopien der zwei nun verlinkten PNGs
wurden nach Hashvergleich in `retired-runtime-jpg-copies/` verschoben.
Sie sind wiederherstellbar; nichts wurde dauerhaft gelöscht.

Beide Bücher wurden nach stabilen Änderungen aktualisiert. Nach dem letzten
isolierten Plotedit wurde nur Mathematik nochmals gerendert; Physik blieb
unverändert. Der gemeinsame native Publikationscheck besteht. Aktuelle Digests:
Mathematik `sha256:9eadb77913e372e4ab3f0797b329928b921da7b1212d06876368f6f3811ce430`,
Physik `sha256:ea24ed76499bea241e2e3ee4f5b27277a35a85f42fb5d952873b2ecceef66a2c`.
Vorige Bücher/Index bleiben in den dokumentierten `tmp/math-physics-book-b037-backup-*`
Sicherungen erhalten. Bestanden sind ferner die neun geschützten
Maturity-Floors, aktuelle Bild-QA, Bildassetprüfung, QA-/Abdeckungsparität,
KI-Transparenzinventar, sämtliche Memory-Reviewkonfigurationen und Review-Freeze.
Dies sind lokale Prüfungen, kein CI-, Commit-, Push- oder Deploynachweis.

Direkter Weiterlauf: Physik B037 umfasst 20 disjunkte, noch nicht D/P-geprüfte
Ziele in nativer Reihenfolge zu Biophysik, Methoden, Photovoltaik und Mechanik.
Aktuelle Auswahlbindungen stehen in
`physik/rollout-v1/2026-09-06/batch-037-biophysics-methods-pv-mechanics-20-v1.selection-audit.json`;
das native Paket ist vorbereitet und exklusiv reserviert. Zwei unabhängige
D-Runden und getrennte P-Autorenschaft laufen. Die sechs älteren Physik-Holds
und drei Mathematik-Holds bleiben getrennt reserviert. Erste noch nicht
abgeschlossene Befunde betreffen den breiten Zuschnitt von 2825b528, echte
EN-Kopien und einen Strahlengang beim Augenvergleich. Bis zur vollständigen
Adjudikation sind daraus weder neue Abschlüsse noch kanonische Änderungen
abgeleitet. Das Gesamtziel bleibt aktiv; kein Neustart bereits erledigter
Expertenpool-Ziele und kein Commit, Push oder Deploy.

### Physik B037 geschlossen; Mathematik B038 läuft – 06.09., 11:30 UTC

Der zentrale Fünf-Gate-Bericht und sein Check bestätigen **Mathematik
307/796 (38,6 %), Physik 353/464 (76,1 %), null Blocking Issues**.
Netto dieses Pakets: Mathematik **+0**, Physik **+19**. Der Nenner bleibt
dynamisch; Quellenabdeckung, Profilautorität und tatsächliche Lernleistung
werden nicht mit dieser QS-Abschlussquote gleichgesetzt.

Zwölf unveränderte vollständige Physik-Seiten verwenden die vollständig
hauptinstanzlich verglichenen unabhängigen Original-A/B-Records nach nativer
Seiten-/Kontextgleichheitsprüfung. Sieben ergänzte englische Fassungen wurden
anschließend in B037r erneut unabhängig geprüft; beide aktuellen Runden
bestätigen KEEP. Sämtliche deutschen Texte und IDs bleiben unverändert.
Die sieben betroffenen Atomicity-, Memory- und Semantic-Kind-Bindungen wurden
einzeln inhaltlich bestätigt; die Klassifikationen bleiben erhalten.
Der Übernahmebeleg liegt im ursprünglichen B037-Ordner als
`seven-translation-adoption-receipt-v1.json`.

Zwei belegte Bildfehler sind mit jeweils einem gezielten Nano-Banana-Edit
behoben: 8fe0ebf1 fokussiert die Menschenstrahlen auf der Netzhaut, af1c3116
platziert den Strahlfänger im ausgehenden Laserstrahl innerhalb der Einhausung.
Der ursprüngliche Stil bleibt erhalten. Originale, Provider-Anfragen und
Kandidaten sind unter
`curricula/DE/Gymnasium/quality/goal-visualization-review/physics-b037-local-optical-corrections-v1/`
archiviert. Veraltete AI-Bildfreigaben wurden zurückgenommen, die neuen Bytes
frisch geprüft; kanonische, öffentliche und Backend-Kopien stimmen überein.
Keine menschliche Bildfreigabe wurde hinzugefügt.

Die 19 positiven Profile mit 38 Fällen sind vollständig hauptinstanzlich
gelesen, an aktuelle Eingaben gebunden und nativ validiert; die separate
Autorprüfung enthält 147 numerische/fachliche Assertions. Die übernommenen
Profilinhalte stimmen exakt mit den gegengelesenen Kandidaten überein.
Status bleibt **E1/G1, `ai_candidate`, `needs_human_review`**, ohne tatsächliche
Lernenden-Runs. Bei 39ef1e8a bleibt die vor Durchführung zu liefernde echte
empirische Grafik mit Quelle und Messbedingungen eine ausdrückliche offene
Materialanforderung; konstruierte Tripel ersetzen diesen Pflichtteil nicht.

2825b528 bleibt im separaten B037h-Hold und zählt nicht als abgeschlossen.
Die primäre LehrplanPLUS-Stelle und lokale Identitäts-/Mapping-Verknüpfungen
sind in `batch-037-biophysics-methods-pv-mechanics-20-v1/source-identity-nerve-conduction-v1.md`
geprüft. Messverfahren, Feldabschätzung und Induktion dürfen weder durch bloße
Textverknüpfung als atomar erklärt noch still auf Laufzeitrechnung verengt
werden. Der positive Entwurf bleibt ungebunden. Die nun sieben Physik-
Holds einschließlich dieses neuen Falls und drei Mathematik-Holds bleiben
explizit reserviert.

Eine konkret aufgetretene Prozessbremse ist lokal behoben:
`validateGoalDescriptionReviewCampaign.ts` verlangte selbst bei einer echten
EN-only-Reparatur eine Änderung der korrekten deutschen Beschreibung. Jetzt
darf eine Sprache unverändert bleiben, beide vollständigen Vorschläge sind
weiter erforderlich und ein beidsprachiger No-op wird weiterhin abgelehnt.
Regressionen für beide einsprachigen Fälle und den vollständigen No-op sowie
Review-, Dual-Resolution-, Synthesis- und Batchtests bestehen. Die ursprünglichen
A20-Records bleiben unverändert; keine kosmetische DE-Revision zur Umgehung
des Prüfers. Die Änderung betrifft nur lokale Curriculum-QS, nicht Runtime,
Plugin, Lernzustand oder Datenschutz. Der Review-Freeze besteht unverändert.

Das Physikbuch wurde nach stabilen Änderungen genau einmal neu gerendert:
`sha256:73845433296905230b39c21cab61070c441d2da3b1cd4e1c355fcf13303c774f`.
Mathematik bleibt bei `sha256:9eadb77913e372e4ab3f0797b329928b921da7b1212d06876368f6f3811ce430`;
der gemeinsame native Publikationscheck besteht. Bestanden sind auch die neun
geschützten Maturity-Floors, aktuelle Bild-QA, Assetprüfung, QA-/Rolloutparität,
KI-Transparenzinventar und alle Memory-Konfigurationen. Memory-Berichte sind
regeneriert. Dies sind lokale Prüfungen, kein CI-, Commit-, Push- oder Deploynachweis.

Direkter Weiterlauf: Mathematik B038 reserviert die nächsten 20 disjunkten
Ziele zu Ableitungsanwendungen, Newton und Exponentialfunktionen (aktuelle
Buchseiten 226–245). Die Auswahl schließt 307 D/P-Abschlüsse und drei Holds
aus. Alle ausgewählten A/M/V-Bindungen sind aktuell; 19 Bilder sind vorhanden,
Newton hat die bestehende dokumentierte Provider-Zurückstellung. Die je Ziel
gefundenen historischen einzelnen D-Records haben veraltete Seitenbindungen
und zählen nicht als aktuelles unabhängiges Doppelreview. Auswahlbindungen:
`mathematik/rollout-v1/2026-09-06/batch-038-derivative-applications-and-exponentials-20-v1.selection-audit.json`.
Das native Paket ist vorbereitet; unabhängige A/B-Runden und getrennte
positive Profilautorenschaft sind beauftragt. Kein Neustart der bereits
abgeschlossenen Expertenpool-Ziele; das Gesamtziel bleibt aktiv.

### Mathematik B038: 13 abgeschlossen, Quellenfall getrennt – 06.09., 12:21 UTC

Der zentrale Fünf-Gate-Check bestätigt **Mathematik 320/796 (40,2 %),
Physik 353/464 (76,1 %), null Blocking Issues**. Nettozuwachs: Mathematik
**+13**, Physik **+0**. Zehn vollständig unveränderte aktuelle Seiten verwenden
die tatsächlich vorhandenen unabhängigen A/B-Reviews über den nativen
Ganzseitenvergleich (`resolution-index.current-carryover-v1.json`). Die drei
betroffenen Abschlussseiten 350fc8b1, d5feba00 und 3a5bf7e5 sind in B038r
frisch unabhängig doppelt geprüft und hauptinstanzlich verglichen. Die
Original-A20/B20-Records bleiben unverändert. d5 und 3a5 sind ausdrücklich
`current_after_revision`, 350 behält seinen Text.

Es wurden nur drei belegte Textschwächen korrigiert: die falsche Richtung
„Fehlschlüsse begründen“ bei d5, der zusätzliche englische Modellierungsauftrag
bei 628 und die unbestimmte „Besonderheit“ bei 3a5. Individuelle A/M-Entscheidungen
und Semantic-Kind-Bindungen sind aktualisiert, der d5-Memorytrace bleibt erhalten.
628 zählt wegen des getrennten Quellenfalls trotzdem noch nicht als abgeschlossen.

Vier vorhandene Diagramme wurden mit insgesamt acht gezielten Nano-Banana-
Referenzbildaufrufen korrigiert: 350 Tangenten/Achse, d5 falsche Formel,
49 asymptotischer Vergleich, ab Zeit-/Werteskala und eindeutige Modellkurve.
Originale und alle Kandidaten samt Provideraufträgen sind unter
`quality/goal-visualization-review/math-b038-four-local-diagram-corrections-v1/`
archiviert. Hauptinstanz und B haben die vier angenommenen Endbilder tatsächlich
gesehen; alte AI-Bildbindungen wurden nicht übernommen. Die menschlich
freigegebenen Bilder von 628 und 3a5 bleiben unverändert. Keine SVG-Ersetzung
und keine neue menschliche Freigabe.

13 positive V2-Profile mit 26 Fällen sind nativ an den stabilen Stand gebunden,
inhaltsidentisch mit den gegengelesenen Kandidaten und validiert. Der vollständige
20er-Entwurf bleibt für die Folgearbeit erhalten. Die Hauptinstanz hat alle
40 Fälle gelesen; zwei konkrete Profilkorrekturen wurden verlangt und geprüft
(250: nicht alle Nullstellen bleiben erhalten; 3a5: keine zusätzliche allgemeine
Ableitungs-/Normierungspflicht). Die 152 ausgeführten Autor-Assertions ergänzen
die fachliche Gegenprüfung. E1/G1, `ai_candidate`, `needs_human_review`, keine
erfundenen Lernenden-Runs. Registerpfad: `batch-038a-derivative-applications-and-exponentials-13-v1.config.json`.

Die **sieben** Kinder von 48e7615d sind als B038h separat reserviert. Die konkrete
HE-G9-Clusterkante ist zu breit: 628/e-Ableitung, f05/kontinuierliches e-Modell und
49/asymptotischer Vergleich sind nicht durch den logarithmischen Sek-I-Quellpunkt
getragen. Für vier verbleibende Kinder liegen engere Quellen vor. Zusätzlich
sind unpassende Ableitungs-/Hauptsatzvoraussetzungen und eine nicht sichtbare
E-Orientierungsvoraussetzung gefunden. Der read-only Vorschlag unter
`batch-038-derivative-applications-and-exponentials-20-v1/source-scope-49f9059a-seven-child-proposal-v1.md`
bleibt **nicht übernommen / ROUTE_OPEN**; insbesondere keine Handkorrektur
generierter Ansichten oder pauschale Rückzuordnung. Dieses begrenzte Quellen-/
Voraussetzungspaket hat Vorrang vor einer neuen allgemeinen Quellenrecherche.
Nun sind zehn Mathematik- und sieben Physikziele als fachliche Holds reserviert.

Alle neun geschützten Maturity-Floors, aktuelle Bild-QA, 1533 Assetlinks,
QA-/Rolloutparität, KI-Transparenzinventar und Freeze bestehen. Memory-Berichte
und öffentliche Mathematik-Quellenbegründungen sind aktualisiert. Beide Bücher
sind einmal mit Backup erneuert und nativ gemeinsam geprüft: Mathematik
`sha256:0e1d00c72a48043be11cae57d27ff41f01b84869bd70ab0566d3c0289d38b34d`,
Physik `sha256:23a002b357e6e171f637be9dbef79f76e3da19b90f368bdb93338e89c8df429d`.
Bei Physik änderte sich keine einzige Seite: nur der `externalLandscapes`-
Digest des referenzierten Mathekanons. Daraus folgt kein erneuter Physikreview.
Ein bloßer Math-only-Build genügt bei einer solchen externen Bindung nicht.
Dies sind lokale Nachweise, kein Commit-, CI-, Push- oder Deploynachweis.

Direkter Weiterlauf: Physik B038 ist mit 20 wirklich offenen Zielen zu
Schwingungen, Wechselstrom und Lichtmodellen nativ vorbereitet und reserviert;
die Auswahl schließt 353 D/P-Abschlüsse und sieben Holds aus. A/M/V sind aktuell;
die gezielte Historienprüfung fand keine wiederverwendbaren direkten D/P-Belege.
Der Auswahlbeleg liegt neben der neuen Config als `.selection-audit.json`.
Die beiden unabhängigen Beschreibungsrunden und die getrennte positive
Profilautorenschaft sind gestartet. Das Gesamtziel bleibt aktiv; keine Pause
und kein erneuter Review der bereits abgearbeiteten Expertenpool-Liste.

## Commit-Zwischenstand vom 6. September 2026

**Aktuelle Arbeitsgrenze:** Der Product Owner hat einen commitfähigen
Zwischenstand beauftragt und übernimmt Commit sowie anschließende Aktivierung
des bestehenden Goals selbst. Bis dahin keine neuen Reviewpakete, keine
weiteren fachlichen Änderungen und keine Übernahme offener Entwürfe. Frühere
„Direkter Weiterlauf“-Anweisungen oben sind für diese Pause ausgesetzt.

Der automatische Hauptlauf endete am 6. September um 12:03:32 UTC mit
`server_overloaded` („Selected model is at capacity“); der Goal-Status blieb
danach `blocked`. Das ist kein fachlicher Gesamtblocker. Der spätere
Zwischenabschluss und die Ergebnisse der bereits beauftragten Teilaufgaben
sind erhalten. Kein neues Goal und kein Neustart abgeschlossener Reviews nötig.

### Gesicherter fachlicher Stand

| Fach | Streng abgeschlossen | Fortschritt | Offen |
| --- | ---: | ---: | ---: |
| Mathematik | 320 / 796 | 40,2 % | 476 |
| Physik | 353 / 464 | 76,1 % | 111 |

Diese Zahlen sind ein Checkpoint des zentralen Fünf-Gate-Berichts, keine
zusätzliche Quelle für den Zähler. Bei Wiederaufnahme die aktuelle zentrale
Konfiguration prüfen; vorhandene gültige Nachweise weiterverwenden. Die
Fortsetzung erhöht weder Freigabestatus noch Evidenzniveau automatisch.

### Bereits vorhandene nächste Arbeit — nicht erneut beauftragen

Physik B038 (`batch-038-oscillations-ac-and-light-models-20-v1`) bleibt im
In-flight-Ledger reserviert. Beide unabhängigen Beschreibungsrunden sind
beendet und nativ valide: jeweils **15 KEEP, 5 EN-only REVISE**. Die getrennte
positive Profilautorenschaft hat **20 bilinguale Entwürfe mit 40 Fällen**
geliefert; sie sind noch ungebunden und nicht zentral registriert. Die Dateien
liegen im Batch-Verzeichnis unter `round-a/results`, `round-b/results` und
im zugehörigen `goal-evidence`-Kandidaten. Kein Teil dieses Pakets wird allein
wegen fertiger Autorenchecks als streng abgeschlossen gezählt.

Beim Weiterlauf zuerst diese vorhandenen Ergebnisse gegenlesen und
zielweise zusammenführen. Die fünf noch deutschen EN-Fassungen betreffen
`5f97952e`, `ef0f2391`, `e413a352`, `91f1838c` und `122e83ac` (vollständige
IDs stehen in den nativen Records). Gemeldete Bildfehler insbesondere bei
`c0205f47`, `a844895e`, `a7255b83`, `5da7d4d0` und `5c57dbc7` sind separate
offene Befunde, keine bereits ausgeführten Korrekturen. Änderungen erst
fachlich beurteilen; gute Gegenstücke und bestehende Bilder erhalten.

Die zehn Mathematik- und sieben Physik-Hold-Ziele bleiben ebenfalls
reserviert und ungezählt. Für Mathematik B038h liegt der begrenzte
HE-G9-Quellen-/Voraussetzungsvorschlag neben dem ursprünglichen B038-Paket;
er ist weiterhin **nicht übernommen / ROUTE_OPEN**. Die sieben vorhandenen
In-flight-Konfigurationen bleiben erhalten: Reservierung bedeutet hier
gesicherte Zuständigkeit, nicht einen im Hintergrund weiterlaufenden Writer.

### Commit-Prüfung

Die Abschlussprüfung aktualisiert einen veralteten festen Erwartungsdigest
in `app/scripts/testGoalBookModel.ts`: Das aus aktuellen
Quellen deterministisch berechnete und das veröffentlichte Mathematikmodell
stimmen auf `sha256:0e1d00c72a48043be11cae57d27ff41f01b84869bd70ab0566d3c0289d38b34d`
überein. Exakter Digestvergleich, 796-Seiten-Prüfung, Bytevergleich und
Negativtests bleiben erhalten. Keine neue fachliche Änderung, keine
Neugenerierung der Bücher und keine neue Freeze-Ausnahme.

Weitere rein technische Abschlusskorrekturen:

- Die Mathematik-Duration-Policy erhält den aktuellen kanonischen Eingabehash.
  Alle 18 daraus erzeugten Ansichten sind unverändert und bestehen den nativen
  Bytevergleich; Policy, Templates und Platzierungsentscheidungen bleiben gleich.
- Abgeleitete Quellenbegründungs-, Lücken- und Bild-Rollout-Berichte sind auf den
  vorhandenen fachlichen Stand aktualisiert. Die Lückenberichte wurden nach dem
  Coverage-Bericht neu erzeugt und anschließend erfolgreich geprüft.
- Drei vorhandene positive Autorencheck-Skripte (Mathematik B038, Physik B037
  und B038) verwenden repository-relative Pfade statt eines persönlichen
  Checkout-Pfads. Ihre Assertions und fachlichen Profile bleiben unverändert;
  die Checks bestehen weiterhin.
- Das nicht referenzierte historische Physik-Auswahlprotokoll
  `batch-034-next-unresolved-20-v1.selection.json` ist inhaltsidentisch als
  `.selection.json.txt` archiviert. Es ist kein Curriculum und wurde wegen
  seiner generischen Felder zuvor irrtümlich vom globalen Schema-Scanner als
  solches gelesen. Der Validator bleibt unverändert streng.

Die früher dokumentierte, explizit freigegebene Testzahl-Anpassung 795 → 796
bleibt zusammen mit ihrer append-only Freeze-Dokumentation, Bindung und
Regression Bestandteil dieses Zwischenstands. Die eingereichten Plugin-
und Runtime-Verträge bleiben unverändert. Bei den bereits erfolgten
JPG→PNG-Umstellungen gehören Quellbild, öffentliches Bild und zugehörige
Verweise gemeinsam zum Commit; ungetrackte Nachfolger nicht auslassen.

Die lokalen Abschlusschecks vom 6. September 2026 sind erfolgreich:

- Zentraler Fünf-Gate-Check: Mathematik 320/796, Physik 353/464, **0 blockierende
  Befunde**. Curriculum-Status aktuell; alle neun geschützten Maturity-Floors
  einschließlich der bestehenden M6-Niveaus bestanden.
- Review-Contracts, Dual-Round-Auflösung, Rollout-Synthese und Batch-Tests;
  Memory-Checks aller zehn konfigurierten Bereiche; Quellen-Coverage-Audit
  und dessen sechs Regressionstests bestanden.
- Schema-Prüfung aller 13.739 JSON-Dateien und UUID-Prüfung; Graph-, Exam-,
  Lernrouten-, Kompositions-, Sichtbarkeits-, Kompetenzformulierungs-, Quellen-
  und Duration-Prüfungen bestanden. 297 Kompositionsansichten validiert,
  alle 18 abgeleiteten Mathematik-Duration-Ansichten bytegleich.
- Lernzielbuch-Modell-, Veröffentlichungs- und Originalquellen-Prüfungen
  bestanden (Mathematik 796, Physik 464). Beide veröffentlichten Bücher und
  Quellenindizes stimmen mit dem aktuellen Datenstand überein.
- 1.533 Bildlinks, aktuelle Bild-QA, Freigabeabdeckung, QA-/Rollout-Parität,
  Rollout-Berichte und KI-Transparenzinventar bestanden. Alle 17 betroffenen
  Quell-/Public-Bildpaare sind bytegleich.
- OpenAI-Review-Freeze, Release-Verifikation, Versionierung und Paketprüfung
  bestanden; die Freeze-/Release-Regressionstests sind **58/58 grün**.
- TypeScript, Lint und vollständiger lokaler Anwendungsbuild bestanden.
  Anschließend Quellenbegründungs- und KI-Transparenznachweis im Backend-
  Build sowie Frontend-Shell-Assets erfolgreich geprüft. Keine Änderungen
  an Runtime-Quellcode, Backend-Verträgen oder ausgelieferten Plugin-Paketen.
- Dokumentationslinks, Indizes, generierte Hinweise, Statusregister,
  Terminologie und MkDocs-Build bestanden. Bestehende nicht blockierende
  Dokumentations-/Build-Warnungen sind keine neue Freigabe oder Änderung
  der Abhängigkeiten.

Diese lokalen Prüfungen sind kein Nachweis eines GitHub-CI-Laufs oder
Deployments. Der vollständige geprüfte Zwischenstand wird für den Commit
bereitgestellt; es wird hier weder committet noch gepusht oder deployed.

Die abschließende Prüfung des vollständigen Git-Index findet keine fehlenden
neuen Dateien oder ungestagten Reständerungen. `git diff --cached --check`
meldet ausschließlich je eine zusätzliche EOF-Leerzeile in der historischen
B032w-Review-Config und der positiven B032v-Graph-Split-Config. Beide sind
rohbyte-hashgebunden; sie bleiben absichtlich unverändert, statt historische
Manifeste, Auswahlbelege und Receipts nachträglich umzuschreiben. Dies sind
keine JSON-, Build- oder Qualitätsfehler. Fünf ungebundene Markdown-Notizen
wurden ausschließlich um ihre überzählige EOF-Leerzeile bereinigt.
