# B046h: informierte Bestandsaufnahme der zehn verbliebenen Holds

Stand: 21.09.2026, 21:26 UTC. Arbeitsnotiz, keine neue D-/P-/V-Freigabe und keine menschliche Freigabe. Keine Änderung an Canonical, Registry, Ledgers oder QA-Aggregaten.

## Umfang und bereits vorhandene Arbeit

Maßgeblich ist die explizite Zehnerliste in [der aktiven Carryover-Konfiguration](../2026-09-20/batch-046h-current-source-image-and-wording-holds-13-v1-carryover-after-held7-20260920-v1.config.json). Die historische `13` im Dateinamen ist **nicht** die aktuelle Anzahl. Die früher geschlossenen sieben B046-Ziele und anderweitig bereits bearbeiteten Carryovers werden nicht neu begonnen.

Wiederverwendete konkrete Grundlagen:

- [Aktuelle Triage vom 20.09.](../2026-09-20/held-current-triage-v1.json), einschließlich der dort referenzierten beiden unabhängigen D-Runden vom 07.09. und zielindividuellen Understanding-Evidence-Entwürfe.
- [Bildaudit vom 20.09.](../../../../goal-visualization-review/math-m7-open-spatial-probability-20260920-v1/audit.json) mit acht schon ausgearbeiteten Korrekturprompts. Die Prompts wurden für diese Bestandsaufnahme vollständig gelesen; sie sind **keine** fertigen Bilder oder Freigaben.
- Aktuelle Canonical-Ziele, zentrale D-/P-Registry, A-/M-Ledgers und Visualisierungs-QA sowie die vier HE-GK-Composition-Views.
- Original-KC Mathematik Hessen: lokal vorhandenes PDF, S. 43–44, gezielt erneut gelesen; passende Extraktionsstellen Q2.4 b05 a01/a02 und Q2.5 b04 a01.

## Aktuell überprüft – ohne Vollbuild

- Alle zehn DE-/EN-Beschreibungen und direkten `requires` sind gegenüber der Triage vom 20.09. exakt unverändert.
- Alle neun vorhandenen öffentlichen Bilddateien haben exakt dieselben SHA-256-Werte wie in der Triage; das zehnte Ziel hat weiterhin kein aktives Bild.
- Die aktuell 85 registrierten D-Indizes und 75 P-Konfigurationen enthalten für diese zehn IDs weiterhin keinen registrierten Eigentümer. D und P bleiben daher bei allen zehn offen; Entwürfe sind nicht mit abgeschlossenem Nachweis gleichzusetzen.
- Die individuellen A- und M-Fingerprints wurden nach der aktuellen Funktion `goalReviewFingerprint` in `reportDeepUnderstandingRollout.ts` neu berechnet und stimmen bei **10/10 A und 10/10 M** mit den bestehenden Records überein. A bleibt `atomic`; neun M-Records bleiben `no_memory_needed`, ein M-Record bleibt `memory_required`. Dies ist eine Bindungsprüfung, kein erneuter fachlicher Review und kein vollständiger Memory-/Sichtbarkeitslauf.
- Der native Composition-Compiler und die native Rollensammlung zeigen `0de1…`, `922d…` und `7bd8…` in **allen vier** HE-GK-Views weiterhin als `target`, nicht als `prerequisiteOnly`. Die Views sind strukturell fehlerfrei; das widerlegt den fachlichen GK-/LK-Befund nicht.
- Sechs der neun vorhandenen Bilder tragen noch eine hashpassende `aiApproved: yes`-Angabe. Die konkreten offenen fachlichen Bildbefunde werden dadurch nicht erledigt. Bei `4d331…`, `7bd8…` und `c3b9…` fehlt diese positive KI-Angabe; bei `0de1…` steht `deferred_provider_limitation` statt eines Bildes.

**Bildprüfgrenze:** In dieser Bestandsaufnahme wurde nur das aktuelle Bild `c3b9…` tatsächlich angesehen. Die acht Korrekturbefunde der übrigen vorhandenen Bilder werden ausdrücklich als **Altbefund vom 20.09. zu nachweislich identischen Bytes** wiedergegeben, nicht als heute neu durchgeführte visuelle QA. Vor Bearbeitung bzw. Freigabe ist das jeweilige tatsächliche Bild anzusehen.

## Zielgenauer Abschlussweg

Für alle zehn gilt: unveränderte substanzielle Aussagen und Evidence-Entwürfe weiterverwenden. Nach der konkreten Reparatur gezielt die finalen Ziel-/Seiten-/Bild-/Kontextbindungen fachlich überprüfen und die noch fehlende D-Auflösung mit zwei unabhängigen Beschreibungsreviews sowie ein aktuelles positives `positive-understanding-evidence-v2`-Profil abschließen. Keine bloße Hash-Umschreibung und keine künstlich als blind bezeichnete informierte Fortsetzung. A/M nicht erneut fachlich prüfen, solange ihre Fingerprint-Eingaben und ihre sachliche Grundlage unverändert bleiben.

### 1. `0de1e45c-aea9-5e53-932a-027dcf509efa` – Matrixpotenzen für langfristige Übergangsprozesse nutzen (LK)

- **Offen:** D/P; tatsächlicher aktueller HE-GK-Scope-Fehler; V ohne Bild. Das Original-KC S. 43 weist die langfristige Entwicklung ausdrücklich dem LK zu. Die Beschreibung selbst trennt langfristige Matrixpotenzen bereits sinnvoll von der nachfolgenden Grenzmatrixinterpretation.
- **Vorhanden:** Unveränderte zweisprachige Beschreibung, konkrete beiden D-Stellungnahmen, exakte LK-Quellenstelle und aktuelle A/M-Records. Kein ausgearbeiteter Bildprompt in der genannten Acht-Prompt-Sammlung und kein dort freigegebener Ersatz.
- **Minimal:** HE-Q2.4-Auswahl einschließlich direkt betroffener Endpunkte korrigieren; LK-Kompetenz und andere Bundesländer erhalten. Ein passendes, fachlich geprüftes PNG zur Entwicklung durch wiederholte Matrixanwendung erstellen, ohne die Grenzmatrix-Kompetenz des Folge-Ziels vorwegzunehmen. Keine rein kosmetische Textrevision.
- **Gezielt neu binden:** V einschließlich neuem Asset und tatsächlicher Bildprüfung; D/P-Zielseite, HE-Kontext und Bildbezug. Betroffene Composition-/Routen-/Assessment-Prüfungen; A/M bei unveränderten Texten behalten.

### 2. `922d89fc-1cbd-56e9-ac5d-5cb59085de6c` – Grenzprozesse und Grenzmatrizen interpretieren (LK)

- **Offen:** D/P und derselbe aktuelle HE-Q2.4-GK-Scope-Fehler. **Bild-Altbefund:** Der bereits senkrechte stationäre Vektor `g=(0,6; 0,4)` trägt zusätzlich ein Transpositionszeichen; dadurch ist das notierte `M·g` nicht dimensionsgerecht. Die Matrix- und Grenzwerte sind im alten Befund korrekt.
- **Vorhanden:** [Minimaler Edit-Prompt](../../../../goal-visualization-review/math-m7-open-spatial-probability-20260920-v1/prompts/922d89fc-1cbd-56e9-ac5d-5cb59085de6c.de.md), beide D-Befunde, LK-Quellenbeleg, aktuelle A/M.
- **Minimal:** Nur das falsche `T` am schon vertikalen `g` entfernen; gültige Transpositionszeichen an waagerechten Vektoren erhalten. HE-Scope gemeinsam mit Ziel 1 korrigieren. Beschreibung und korrektes übriges Bild bewahren.
- **Gezielt neu binden:** Korrigiertes PNG/V; D/P-Bild- und HE-Kontextbindung, Zielseite und unmittelbar betroffene Route. A/M bleiben bei unverändertem Text erhalten.

### 3. `4c494716-567b-59c2-855c-6ea45635c666` – Geometrische Abbildungen mit Matrizen beschreiben

- **Offen:** D/P. **Bild-Altbefund:** Bei `S(x,y)=(x+y,0)` liegt `Q(−1|2)` fälschlich auf der y-Achse; ein zusätzlicher `P′(5|0)`-Punkt ist oberhalb der x-Achse eingezeichnet. Die richtige Rechnung ersetzt keine richtige Punktdarstellung.
- **Vorhanden:** [Konkreter PNG-Prompt](../../../../goal-visualization-review/math-m7-open-spatial-probability-20260920-v1/prompts/4c494716-567b-59c2-855c-6ea45635c666.de.md) mit einem eindeutigen Koordinatenbild, `P(2|3)→(5|0)` und `Q(−1|2)→(1|0)`; beide alten D-Block-Befunde, aktuelle A/M.
- **Minimal:** Punktpositionen und Duplikat korrigieren, parallele Projektionsrichtungen konsistent halten. Gute Formeln, Erläuterung und Bildcharakter beibehalten; keine Beschreibungsausweitung.
- **Gezielt neu binden:** V und D/P-Bild-/Seitenbindung; übrigen fachlich unveränderten Kontext und A/M erhalten.

### 4. `4d331ba0-56d6-5730-a51b-e3d1126b31ba` – Bildpunkte mit Matrizen berechnen

- **Offen:** D/P und positive aktuelle V-Prüfung. **Bild-Altbefund:** Der orange Zuordnungspfeil startet bei `P` statt bei `R`; die Zuordnung des grünen Pfeils ist uneindeutig. Matrix, Punktwerte und Gitter waren korrekt.
- **Vorhanden:** [Gezielter Pfeil-Edit-Prompt](../../../../goal-visualization-review/math-m7-open-spatial-probability-20260920-v1/prompts/4d331ba0-56d6-5730-a51b-e3d1126b31ba.de.md), zwei konkrete D-Block-Befunde, aktuelle A/M.
- **Minimal:** Genau `P(2|1)→P′(3|1)`, `Q(0|2)→Q′(2|2)` und `R(−1|1)→R′(0|1)` mit richtigen Start-/Endpunkten verbinden. Korrekte Mathematik und Gestaltung bewahren.
- **Gezielt neu binden:** Tatsächlich geprüftes korrigiertes PNG/V; D/P-Bild-/Seitenbindung. Keine neue A/M-Sachprüfung nötig.

### 5. `b72d87d4-763e-54aa-940d-31f195b51700` – Orthogonale Spiegelungen an Koordinatenebenen mit Matrizen darstellen

- **Offen:** D/P. **Bild-Altbefund:** Der Mittelpunkt der Spiegelstrecke liegt auf der y-Achse, obwohl für `P(2|1|3)` und `P′(2|1|−3)` der Lotfuß `F(2|1|0)` nicht dort liegen kann.
- **Vorhanden:** [Konstruktiv konkreter Prompt](../../../../goal-visualization-review/math-m7-open-spatial-probability-20260920-v1/prompts/b72d87d4-763e-54aa-940d-31f195b51700.de.md) mit einheitlicher Schrägbildprojektion; richtige Matrix `diag(1,1,−1)`, unveränderte Beschreibungsbefunde und aktuelle A/M.
- **Minimal:** Punkte und gemeinsame Senkrechte konsistent in derselben Projektion platzieren. Vorzeichenwechsel von z und erhaltene x-/y-Werte sichtbar machen; richtige Formeln erhalten.
- **Gezielt neu binden:** V und D/P-Bild-/Seitenbindung; keine pauschale Kontext-/A-/M-Wiederholung.

### 6. `55039f9c-4ebc-5115-add5-fae95b915e46` – Parallelprojektionen auf Koordinatenebenen mit Matrizen darstellen

- **Offen:** D/P. **Bild-Altbefund:** `P(2|−1|3)` ist mit falscher y-Lage gezeichnet; der Pfeil zur yz-Ebene läuft entlang der falschen Achsenrichtung.
- **Vorhanden:** [Drei-Panel-Prompt](../../../../goal-visualization-review/math-m7-open-spatial-probability-20260920-v1/prompts/55039f9c-4ebc-5115-add5-fae95b915e46.de.md) mit konsistenten Projektionsschritten; korrekte Diagonalmatrizen, konkrete Altbefunde und aktuelle A/M.
- **Minimal:** Vorzeichenlage und Projektionspfeile korrigieren: nach xy parallel z, nach xz parallel y, nach yz parallel x. Die gezeigten achsenparallelen Spezialfälle als Beispiele kenntlich machen; das gesamte Lernziel nicht auf orthogonale Projektionen verengen.
- **Gezielt neu binden:** V und D/P-Bild-/Seitenbindung; unveränderte Text-, A- und M-Nachweise behalten.

### 7. `35558905-753d-5fcb-b25e-7f85ffdbff56` – Zentrische Streckungen am Koordinatenursprung mit Matrizen darstellen

- **Offen:** D/P. **Bild-Altbefund:** Vier bereits vertikale Vektoren im Rechnungskasten tragen unpassende Transpositionszeichen. Punkte, Strahlen und `Z=2I` waren korrekt.
- **Vorhanden:** [Vier-Zeichen-Edit-Prompt](../../../../goal-visualization-review/math-m7-open-spatial-probability-20260920-v1/prompts/35558905-753d-5fcb-b25e-7f85ffdbff56.de.md), konkrete Altbefunde, aktuelle A/M.
- **Minimal:** Nur diese vier `T` entfernen. Korrektes Koordinatenbild und die Zuordnungen `(1;2)→(2;4)` sowie `(−2;1)→(−4;2)` erhalten.
- **Gezielt neu binden:** Korrigiertes PNG/V und D/P-Bild-/Seitenbindung; keine neue Kompetenzformulierung, keine neue A/M-Sachentscheidung.

### 8. `7bd8f022-5002-5610-994c-a9cec1890558` – Drehungen um Koordinatenachsen mit Matrizen darstellen (LK)

- **Offen:** D/P, positive V-Prüfung und **aktuell bestätigter** HE-Q2.5-GK-Scope-Fehler (Original-KC S. 44: LK). **Bild-Altbefund:** Doppelte y-Achse, falsche negative Basisrichtung/-beschriftung sowie widersprüchliches `e_z`. Die richtige Drehmatrix kompensiert diese Zeichnungsfehler nicht.
- **Vorhanden:** [Gezielter Ersatz für den fehlerhaften Raumplot](../../../../goal-visualization-review/math-m7-open-spatial-probability-20260920-v1/prompts/7bd8f022-5002-5610-994c-a9cec1890558.de.md): xy-Draufsicht von +z, positive 90°-Drehung, unverändertes z und korrekte Basisbilder; alte unabhängige Befunde, LK-Quelle, aktuelle A/M.
- **Minimal:** Die fehlerhaften Plotanteile durch diese eindeutige Ansicht korrigieren, die korrekten Formeln erhalten. HE-GK-Auswahl und die direkt betroffene Assessment-Bindung fachlich reparieren; andere Länder/LK nicht entfernen.
- **Gezielt neu binden:** V, D/P-Bild-/Seiten-/HE-Kontextbindung sowie betroffene Scope-/Routen-/Assessment-Nachweise. Unveränderte A/M-Bindungen erhalten.

### 9. `52e57eb5-7cd1-5df0-a8c6-7b090f097d9f` – Vierfeldertafeln interpretieren

- **Offen:** D/P. **Expliziter Alt-Dissent:** Runde A hielt die Formeln für hinreichend klärend; Runde B und der Bildaudit vom 20.09. beanstandeten Pfeile, die eine bedingte Wahrscheinlichkeit nur einer gemeinsamen bzw. einer Randzelle zuordnen. Tabellen und Rechnungen sind korrekt.
- **Vorhanden:** [Minimaler Zuordnungs-Prompt](../../../../goal-visualization-review/math-m7-open-spatial-probability-20260920-v1/prompts/52e57eb5-7cd1-5df0-a8c6-7b090f097d9f.de.md), beide abweichenden Stellungnahmen, aktuelle A/M.
- **Minimal:** Irreführende Einzelzell-Pfeile entfernen oder jeweils Zähler **und Bezugsgruppe** zusammengehörig markieren. Die richtigen Werte `30/100=0,30`, `30/50=0,60` und `30/40=0,75` samt Tafeln erhalten. Keine neue Aufgabe oder Textaufblähung nötig.
- **Gezielt neu binden:** V und D/P-Bild-/Seitenbindung; Dissent ausdrücklich mit der tatsächlichen Korrektur auflösen, nicht aus der Historie streichen. A/M behalten.

### 10. `c3b9c561-dd83-5903-9ec6-49c7f51bafd5` – Bedingte Wahrscheinlichkeiten berechnen

- **Offen:** D/P und positive V-Prüfung. **Alt-Dissent:** Runde A beanstandet `=0.33`/`=0.67` für `1/3`/`2/3`, Runde B akzeptiert die erkennbare Rundung; der tatsächliche Bildaudit vom 20.09. lautet `KEEP`.
- **Heute tatsächlich angesehen:** Aktuelles JPG. Tafel, Bezugsgruppe A, die zentralen Quotienten `0.30/0.40=0.75`, die komplementäre Wahrscheinlichkeit `0.25` sowie der Zusammenhang zum Baum sind korrekt und gut erkennbar. Im unteren Baumteil stehen tatsächlich die gerundeten Werte `0.33` und `0.67` nach Gleichheitszeichen; die zugehörigen gemeinsamen Wahrscheinlichkeiten sind `0.20` und `0.40`. Es liegt kein Nachweis eines falschen Bayes-/Bezugsgruppenprinzips vor.
- **Vorhanden/minimal:** Gutes Bestandsbild und bereits vorhandenes positives KEEP-Votum weiterverwenden; den eng begrenzten Rundungs-Dissent abschließend beurteilen. Falls eine Notationskorrektur nötig ist, nur diese beiden Gleichheitszeichen durch `≈` ersetzen (oder exakt `1/3`, `2/3` schreiben), keine komplette Neugestaltung. Diese Notiz entscheidet den Dissent nicht automatisch und vergibt keine V-Freigabe.
- **Gezielt neu binden:** Bei KEEP aktuelle KI-Bildentscheidung zu identischen Bytes, finalen D-Dissent und P-Profil abschließen; bei Zwei-Zeichen-Edit nur zusätzlich V-/Bild-/Seitenbindung neu prüfen. M ist `memory_required` mit Ziel `ffbdd7a9-45c6-54f1-988c-58256ca05eeb` und Deck `de_gymnasium_math_stochastics_core`; diese gültige Zuordnung nicht neu erfinden oder wegen einer Bildänderung verwerfen.

## Scope-Reparatur: notwendige unmittelbare Randbedingungen

Die vier betroffenen Views heißen `de-he-gk-g8`, `de-he-gk-g9`, `de-he-gk` und `de-he-sekii-gk`. Keine automatische Ableitung aus dem `LK`-Tag; die geprüfte Quellenstelle begründet die ausdrückliche Auswahlkorrektur.

- `e4656e83-3f33-5bda-b0bc-d4b63ec4653e` ist als LK-Klausur ebenfalls HE-GK-Target und verlangt `0de1…` und `922d…`. Seine aktuelle Aufgabe enthält ausdrücklich einen LK-Langzeitteil. Diesen Endpunkt bei der GK-Auswahl mitberücksichtigen; keine korrekten LK-Inhalte aus der kanonischen Aufgabe löschen. Die fachlich passende GK-Endpunktabdeckung muss erhalten bleiben.
- `81823f27-0c92-5444-ac4e-32b83169f318` ist HE-GK-Target und verlangt `7bd8…`; `coveredGoalIds` behauptet ebenfalls Achsendrehung. Die aktuell gelesene Aufgabe enthält aber nur eine 2D-Abbildung, ein Dreieck, Eigenvektorprüfung und Projektion, keine Drehung um eine Koordinatenachse im R³. Diese konkrete überbehauptete Bindung fachlich korrigieren und die echte LK-Routenabdeckung prüfen; nicht durch `prerequisiteOnly` bloß verstecken.

Das sind direkte Abhängigkeiten der drei bereits offenen Scope-Holds, kein Auftrag zur Neubearbeitung aller Q2-Themen. Eine reine Text-/Bildreparatur würde die drei Scope-Holds nicht abschließen. Die vorhandene HE-Q2.1-Reparatur aus einem anderen Paket löst diese Q2.4-/Q2.5-Befunde nicht.

## Unveränderte Assetbindungen (SHA-256)

Die öffentlichen Dateien liegen jeweils unter `app/public/assets/goal-visualizations/mathematik/<ID>/<ID>.jpg`. Werte wurden am 21.09. aus den Bytes berechnet und stimmen mit der Triage vom 20.09. überein.

| ID-Kurzform | SHA-256 |
| --- | --- |
| `0de1…` | kein aktives Bild |
| `922d…` | `f140304ce51ca9c6968218de142bde5821abfd57faa46c2f0b5dc7a5c593e1ef` |
| `4c494…` | `c8168a2d4ab659b4a34cbc24deb4981aa0bac5fb3d77f030827e8415bdc4d920` |
| `4d331…` | `0e4190c6989ae09e7aa930b4f442c3dddc3f571cce4a4339956aed6faca287df` |
| `b72d…` | `077129cf10f37fc8a5b6b9f74cd600c87d9239eacbc6f962f893c7a3f0008bb1` |
| `55039…` | `74c3a174c9e844ba19c3e4d78c8d9063ad34a39a80bcba8db06d61b468b6945c` |
| `355589…` | `095f5aed4cee2ffa62e3ae3064051647a9f5d7ec6f9175092b8bb55657f3bf1b` |
| `7bd8…` | `006b882b5c083e3452e7a7667d96e79696326116bbcee0272defa9cc1dec7d4d` |
| `52e57…` | `e52e39a3e77b0855ad766559fe179a15c6599b6f549c4468386efd051ac77c84` |
| `c3b9…` | `5d78516976cd24e1c9a78e1558a4798109b1c2c160115a98d85826ba65e0ee10` |

## Effiziente Fortsetzung

1. Vorhandene acht Prompts nach Sichtprüfung für die belegten Korrekturen verwenden; nur das fehlende Bild neu konzipieren und den Rundungs-Dissent klein halten. PNG, freundlich-abstrakter Comicstil, keine stilistische Generalüberholung.
2. Parallel die drei zusammenhängenden HE-Scope-Holds samt unmittelbar betroffenen Endpunkten lösen. Gute Texte, andere Jurisdiktionen und aktuelle A/M-Entscheidungen erhalten.
3. An einem stabilen Zwischenstand die betroffenen Buchseiten/Reviewbundles aktualisieren; vorhandene zielindividuelle Arbeit gezielt finalisieren und D/P/V wahrheitsgemäß registrieren. Keine Wiederholung historisch geschlossener Pakete.
4. Teure gemeinsame Abschlussprüfungen bündeln. Erst der aktuelle zentrale D/P/A/M/V-Schnitt und die geschützten Layer-A-/M6-/Physik-M7-Grenzen belegen einen echten Nettoabschluss; diese Arbeitsnotiz erhöht keine Abschlusszahl.
