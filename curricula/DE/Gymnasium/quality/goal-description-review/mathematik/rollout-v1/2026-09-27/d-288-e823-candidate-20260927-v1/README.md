# Q2 Pyramide und Kegel: aktueller D-/Scope-Audit (nichtkanonisch)

Stand 27.09.2026. Nur Diagnose und engster Reparaturpfad für
`288633c1-f61c-5b48-af7e-a80357f96cad` und
`e8237315-654e-5150-97de-49c4cb49b3d1`. Keine kanonische Änderung,
keine neue D-/V-Freigabe und keine menschliche QS. Die zwei früheren
`revise`/`revise`-Runden und die neueren exakt seitengebundenen
`keep`/`revise`-Runden bleiben Befunde, nicht synthetisierte KEEP-Stimmen.

## Ist-Ziele und tatsächlich veröffentlichte Sichten

Beide IDs sind aktuelle `atomic`-Ziele unter „Körper und Figuren im Raum
charakterisieren“, `dimensionTags.phase: Q2`, `demandLevel: AB2`,
`tags: [GK, LK]` und kanonisch für alle 16 Bundesländer markiert. Die
Beschreibung verbindet die Bestimmung des Körpervolumens mit der Deutung des
Faktors `1/3` gegenüber einem „entsprechenden“ Prisma bzw. Zylinder. Was
*entsprechend* heißt, bleibt für eine prüfbare Aussage zu implizit.

Die aktuelle nationale Lernzielbuchprojektion (`loadGoalBookBuildInputs` mit
`app/scripts/config/goal-books/de-gym-math-national-atlas.json`, am
27.09.2026 aus dem Worktree neu geladen) zeigt für **beide** IDs dieselben
31 der 32 Sek-II-Kurssichten: GK und LK in 15 Ländern, in Hessen **nur GK**.
Dies bestätigt den 31/32-Befund des
[Q2-Aufgaben-Projektionsaudits](../../../../../assessment-review/mathematik/q2-geometry-terminal-repair-candidate-20260927-v1/PROJECTION-AUDIT.md).
Hessens LK-View enthält für beide IDs direkte `goalEntry`-Overrides mit
`projectionRole: prerequisiteOnly`; diese schlagen die breitere Q2-Subtree-
`target`-Rolle. Hessens GK-View referenziert dagegen den Q2-Subtree ohne
solchen Override. Die bloßen `GK`-/`LK`-Tags des kanonischen Knotens beweisen
also **nicht** dessen tatsächliche Lernzielbuch-Geltung.

Der offizielle hessische Lehrplan (lokales PDF
`input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf`,
S. 41, Q2.2) bezeichnet die dortigen Körperinhalte als grundlegendes Niveau
für **Grund- und Leistungskurs**. Das macht den LK-Ausschluss fachlich
prüfpflichtig; daraus folgt aber **nicht automatisch**, dass beide exakten
Formel-/Vergleichsziele LK-Targets sein müssen: Q2.2 nennt Pyramiden und
Körpervolumen, aber weder den Kegel noch die `1/3`-Formel explizit. Den
LK-Override weder zur Quotenerhöhung entfernen noch die GK-Sicht ohne
einen gesonderten landesspezifischen Ziel-/Voraussetzungsentscheid kürzen.

## Tragweite der amtlichen Quellen

| Lokal geprüfte Stelle | Tatsächliche Anforderung | Grenze für diese beiden Q2-Ziele |
| --- | --- | --- |
| Hessen KC 2024, PDF-S. 41, Q2.2 | Einfache Körper einschließlich gerader/schiefer Pyramiden, Eigenschaften für Volumina und Flächen nutzen; GK und LK. | Allgemeiner Pyramidenkontext; kein ausdrücklicher Kegel und keine Drittelformel. |
| Thüringen Gymnasium 2018/2019, PDF-S. 36 | Formel für Volumina gerader Pyramiden und Kegel **ohne Hilfsmittel angeben**. | Formelinhalte passend, aber das eigenständige Angeben ohne Hilfsmittel wird vom kanonischen Anwenden/Deuten nicht vollständig geprüft; außerdem ist die Stelle 11S, nicht Q2. |
| Saarland Einführungsphase 2014, PDF-S. 16 | Drei volumengleiche Pyramiden in einer bestimmten Prismenzerlegung begründen und Pyramidenvolumen berechnen. | Stützt das `1/3`-Prinzip und die Rechnung, aber nicht die spezifische Zerlegungsbegründung im aktuellen Ziel; E-Phase, nicht Q2. |
| Saarland Einführungsphase 2014, PDF-S. 17 | Kegel, Halbkugel und Zylinder bei gleichem Radius und gleicher Höhe im Verhältnis `1:2:3` erklären. | Stützt den Kegel-Zylinder-Ausschnitt, nicht die Halbkugel; E-Phase, nicht Q2. |

Die drei eng korrigierten TH-/SL-Mappings sind heute `mapped/partial` und
benennen die Restlücken bereits korrekt. Sie dürfen **nicht** als vollständige
Quellen- oder Phasenabdeckung ausgegeben werden. Die bestehende
[Quellenrouten-Kandidatur](../../2026-09-24/m7-q2-volume-two-source-route-current-20260924-v2/source-route-and-wording-candidate.json)
enthält passende zweisprachige Textentwürfe und spezifische Source-IDs;
ihre Q2-/E-Phasen-Zuordnung und der Scope für alle 31 Kurssichten sind damit
noch nicht geprüft. Eine nur auf HE Q2.2 gestützte Kegel-`sourceRef` wäre
unwahr.

## Prüfung und kleinstmöglicher fachlicher Schnitt

Die unveränderte lokale Q2-Prüfung `1878f680-095c-511d-aaed-e98393f7fde9`
hat 43 `requires` und 43 `examData.coveredGoalIds`. Ihre vier Teile
berechnen an einer Koordinaten-Pyramide Grundfläche, Höhe, Volumen und
Skalierungswirkung. Der geforderte **Vergleich mit einem Prisma** fehlt,
sodass `2886…` nur teilweise beurteilt wird; **kein Kegel** kommt vor,
sodass `e823…` in beiden Listen sachlich unberechtigt ist. Das bestehende
[Aufgabenpaket](../../../../../assessment-review/mathematik/q2-geometry-terminal-repair-candidate-20260927-v1/README.md)
bereitet die Ergänzung des Prismenvergleichs und die Rücknahme von 39
überbehaupteten Direktlinks vor. Es ist noch nicht integriert und seine
neue Fünf-Körper-Aufgabe ist aktuell in HE-LK wegen der fehlenden Zielgeltung
nicht ohne Scope-Korrektur verwendbar.

1. Den bisherigen, erfolgreichen **Bild-KEEP** bewahren: Für beide Ziele
   sind die aktuellen PNGs maschinell hashgebunden freigegeben
   (`2886…`: `sha256:10fc4e45…`, `e823…`: `sha256:cc856d36…`). Die Bilder
   zeigen schon passende gleiche Grundmaße und senkrechte Höhe. Für die
   bloße textliche Explizierung dieses Vergleichs ist **kein neues Bild**
   belegt nötig. Nach Textänderung nur den betroffenen Bild-/Seitenkontext
   prüfen, nicht neue Pixel ohne Befund bestellen.
2. Den zweisprachigen Text auf den **einen** prüfbaren Volumen-/Vergleichs-
   Zusammenhang präzisieren: Bei der Pyramide muss das Prisma dieselbe
   Grundfläche und senkrechte Höhe haben; beim Kegel muss der Zylinder
   denselben Grundkreisradius und dieselbe senkrechte Höhe haben. Der
   bestehende 24.09.-Kandidat erfüllt diese geometrische Bedingung.
3. Source-Binding mit exakten HE-/TH-/SL-Abschnitten und den dort nur
   `partial` unterstützten Teilaspekten dokumentieren. Den expliziten
   Q2-vs-E-Phasen- und HE-GK/LK-Projektionskonflikt separat entscheiden,
   nicht durch ein landesweites `sourceRef` oder bloße Tags verdecken.
4. Die bestehende Q2-Prüfung fachlich enger machen: Teil 3 um den
   Prismenvergleich samt Lösung/Bewertung ergänzen; `e823…` aus ihrer
   behaupteten Abdeckung und ihren direkten Voraussetzungen nehmen.
   Ein wirklich benoteter Kegelteil gehört in eine passende eigene lokale
   Aufgabe, deren GK/LK- und Länder-Scope vorher mit den Zielprojektionen
   übereinstimmt. `requires`-Fairness unabhängig von `coveredGoalIds` prüfen.
5. Erst auf dem **neuen** kanonischen Ziel-, Quellen-, Aufgaben- und
   GoalBook-Zustand zwei voneinander unabhängige D-Reviews mit aufgelöster
   Synthese ausführen. Geänderte P-v2-, Atomaritäts-/Memory- und
   Seiten-/V-Bindungen gezielt neu prüfen. CQR-303 und zentralen Fünf-Gate-
   Bericht erst nach stabiler Integration laufen lassen.

Die bisherige `atomic`-/`no_memory_needed`-Entscheidung und P-v2-Bindung
sind auf dem **jetzigen** Text aktuell; sie sind keine automatische Freigabe
für eine revidierte Formulierung. Maschinelle M7-Qualität und menschliche
QS/Freigabe bleiben strikt getrennt.
