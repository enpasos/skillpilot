# Bayern: Vertiefungskurs ist kein reguläres LK-Profil

Stand: 2026-09-27. **Nichtkanonischer Scope-Audit; keine Atlas-Aktivierung oder D-Freigabe.**

## Verbindliche Zwischenregel für die weitere M7-Arbeit

Die Produktentscheidung nach diesem Audit verwendet `GK` und `LK` in Bayern **nur als technische SkillPilot-Profile**, nicht als amtliche Kursbezeichnungen:

| Technisches BY-Profil | Beabsichtigter Lernzielumfang |
| --- | --- |
| `GK` | Das verpflichtende vierstündige Mathematikfach. |
| `LK` | Der gesamte `GK`-Umfang **plus alle fünf Module** des Vertiefungskurses (`M12-V.1` bis `M12-V.5`). |

Eine vorübergehende Fokussierung auf die drei tatsächlich gewählten Module ist möglich, verkleinert aber nur den aktuellen Fokus. Die übrigen zwei Module bleiben im persönlichen `target`-Umfang und zählen weiterhin für Fortschritt und Abschluss. Ein BY-`LK`-Profil behauptet weder ein amtliches Leistungsfach noch eine nachgewiesene Belegung des Vertiefungskurses.

Diese Zwischenregel ist **beschlossen, aber in Atlas/Cockpit noch nicht
durchgängig abgenommen**. Die ursprünglich elf BY-GK-Fehlgeltungen der
reinen Vertiefungskursziele sind inzwischen in den beiden BY-GK-Views
quellengebunden entfernt; der globale Cockpit-Kursfilter blockiert dagegen
noch zwei exakt belegte bayerische Pflichtziele mit globalem LK-Tag. Die
echte optionale Kurs- und Dreier-Modulauswahl ist der nachgelagerte
Produktumbau in [Issue #59](https://github.com/enpasos/skillpilot/issues/59).
Weder die Zwischenentscheidung noch dieser Audit schließen Gate D oder
Mathematik M7 ab.

## Fachlicher Befund

In Bayern besuchen alle Schülerinnen und Schüler in Q12/Q13 Mathematik verpflichtend vierstündig auf erhöhtem Anforderungsniveau. Mathematik ist dort **kein wählbares Leistungsfach**. Daneben gibt es in Jahrgangsstufe 12 einen **eigenständigen, zweistündigen Vertiefungskurs**; aus dessen fünf Modulen wählt die Lehrkraft drei aus. Seine Inhalte sind nicht abiturrelevant. Das beschreibt das [ISB im Kontaktbrief Mathematik 2023](https://www.isb.bayern.de/fileadmin/user_upload/Gymnasium/Kontaktbriefe/Mathematik/kontaktbrief_mathematik_2023.pdf) (S. 5); die getrennten amtlichen Fachlehrpläne heißen [Mathematik 12 (erhöhtes Anforderungsniveau)](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/mathematik/regulaer) und [Mathematik 12 (Vertiefungskurs)](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/mathematik/vertieft).

Die lokale Source-Extraction unterscheidet die Dokumente bereits: `JGST12_EA` ist `binding-core`, `JGST12_VERTIEFUNG` ist `optional-extension`. Sie gibt den Vertiefungskurs-Source-Zielen trotzdem `courseLevel: "LK"`; dieser technische Marker ist **keine** amtliche Gleichsetzung des Wahlkurses mit dem Pflichtfach oder einem Leistungsfach.

## Nachzählung am vorbereiteten Stand

Inputs: `curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/DE_BY_MATHEMATIK_GYMNASIUM_LEHRPLANPLUS.source-extraction.json`, `curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_math_source_extraction_to_canonical_math.review.json`, der unveränderte und der vorgeschlagene Atlas-Buchmodell-Snapshot unter `tmp/goal-books/`. Gezählt werden eindeutige IDs, nicht Source-Mapping-Zeilen als Lernziele.

| Menge | Anzahl |
| --- | ---: |
| `JGST12_VERTIEFUNG`-Source-Ziele | 41 |
| Mapping-Zeilen von diesen Source-Zielen | 66 |
| Eindeutige zugeordnete kanonische IDs | 48 |
| Diese 48 IDs mit zusätzlicher Zuordnung aus einem anderen BY-Source-Dokument **in derselben Mappingdatei** | 0 |
| Davon Seiten im aktuellen 797-seitigen Atlas | 35 |
| Diese 35 Seiten mit BY-Sek-II-GK-Geltung: vor lokalem Fix → aktuell → global vorgeschlagen | 11 → 0 → 0 |
| Diese 35 Seiten mit BY-Sek-II-LK-Geltung: aktuell → vorgeschlagen | 35 → 35 |

Die anderen 13 zugeordneten kanonischen IDs sind im betrachteten Atlas
keine eigenen Seiten; darunter sind Cluster. Beispiel:
`6a66b4f5-d36e-5b53-91ad-cf25a849d66b` („Explizit definierte Folgen
darstellen und berechnen (LK)“) ist nur auf den BY-Vertiefungskurs
zurückgeführt. Der lokale BY-View-Schnitt entfernt die elf nach der
Zwischenregel falschen BY-GK-Geltungen und **belässt alle 35
Wahlkurs-Seiten im technischen BY-LK-Zielumfang**. Diese LK-Retention
ist beabsichtigt, nicht eine Aussage über amtlichen Pflichtstoff.
Die **82/98** validierten D-Scope-Narrowing-Kompatibilitäten aus der
[Vorbereitung](README.md) betreffen den zusätzlichen globalen
Policy-Kandidaten; sie sind weder eine aktivierte Projektion noch eine
neue D-Freigabe.

Reproduktion von der Repository-Wurzel (die ersten zwei Befehle schreiben nur die ignorierten `tmp`-Buchmodelle):

```bash
app/node_modules/.bin/tsx app/scripts/buildGoalBookModel.ts app/scripts/config/goal-books/de-gym-math-national-atlas.json
app/node_modules/.bin/tsx app/scripts/buildGoalBookModel.ts curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-27/m7-gklk-projection-preparation-20260927-v1/proposed-atlas.config.json
```

Danach die `sourceGoals` mit `sourceDocumentKey === "JGST12_VERTIEFUNG"` auswählen; ihre `id` mit `mappings[].legacyGoalId` verbinden und `canonicalGoalId` deduplizieren. Die 35 Seiten sind der Schnitt dieser IDs mit `pages[].goalId`. Eine BY-Geltung liegt vor, wenn `pages[].applicability[]` `jurisdiction === "DE-BY"` und einen Scope mit `stage === "SekII"` sowie dem jeweiligen `courseProfile` `GK` bzw. `LK` enthält. Der Gegencheck auf eine zweite BY-Quellzuordnung verbindet dieselben kanonischen IDs mit allen Mapping-Zeilen, deren `legacyGoalId` **nicht** aus den 41 Vertiefungskurs-Source-Zielen stammt.

## Konsequenz und sicherer nächster Schnitt

Den vorgeschlagenen Schalter `atlasCourseProfilePolicy: "canonical-course-markers-v1"` **nicht** allein wegen grüner Feld-/Fingerprint-Checks produktiv aktivieren. Für die beschlossene Zwischenregel muss die tatsächliche Projektion nachweislich `BY GK = Pflichtfach` und `BY LK = GK + alle fünf Vertiefungsmodule` ergeben; die 35 Wahlkurs-Seiten aus BY-LK zu entfernen ist **nicht mehr der geplante M7-Schnitt**. Auch die Cockpit-Auswahl, Backend-Zielprojektion, der Atlas und das Lernzielbuch müssen dieselben Zielmengen anzeigen. Ein Fokus auf drei Module darf die zwei übrigen nicht aus `target`, Fortschritt oder Abschluss herausrechnen. Vor einer Aktivierung sind die betroffenen Source-Mappings, Views und Scope-Diffs gezielt zu prüfen und die gebundenen D-Reviews sowie die fünf Gate-Berichte konsistent nachzuführen; bloßes Umetikettieren genügt nicht.

Die spätere wirklich optionale Auswahl aus [Issue #59](https://github.com/enpasos/skillpilot/issues/59) ist davon getrennt: Erst sie kann Vertiefungskurs-Teilnahme und die drei tatsächlich belegten Module als dauerhafte Zielgeltung ausdrücken. Bis zu dieser Umsetzung darf die technische Zwischenregel nicht als amtliche bayerische Kursstruktur oder als abgeschlossene D-Qualitätssicherung dargestellt werden.
