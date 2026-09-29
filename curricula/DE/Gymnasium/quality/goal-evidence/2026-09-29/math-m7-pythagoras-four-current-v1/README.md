# Vier aktuelle Pythagoras-P-Nachweise

Status: vier **KI-Kandidaten** für `positive-understanding-evidence-v2`, nach unabhängiger adversarial Prüfung durch GPT-6 Astra am 29. September 2026. Alle materialisierten Records bleiben `needs_human_review` / `ai_candidate` / `E1` / `G1`. Keine menschliche Freigabe, Lernendenleistung oder D-/M7-Schließung wird behauptet. Die kanonische Phase J9 ist Metadatum; die tatsächliche Platzierung folgt der jeweiligen G8-/G9-Projektion.

## Einzelurteile und behobene Befunde

| Lernziel-ID | Urteil nach Korrektur | Präziser Befund und Korrektur |
| --- | --- | --- |
| `081c9802-6da7-5ae8-b78e-f99c2b2dbb14` | fachlich geeigneter P-Kandidat | Der Negativfall wurde zu pauschal dem Kehrsatz zugerechnet. Nun: Gleichheit → rechter Winkel mit dem Kehrsatz; fehlende Gleichheit → nicht rechtwinklig mittels Kontraposition des ursprünglichen Satzes. Der Begriff Kontraposition muss nicht auswendig benannt werden. Die scheinbar rechte Skizze enthält ausdrücklich keine bestätigte Winkelangabe. |
| `3a69dab2-3fe8-5076-a980-5b7ac1bd1127` | fachlich geeigneter P-Kandidat | Das Profil verengte das kanonische „als Seite“ auf eine Hypotenuse; zwei ähnliche Quadratsummen boten schwachen Transfer. Nun bleiben Hypotenusen- und Kathetenkonstruktionen sowie gleichwertige Werkzeuge zulässig. Fall 1 konstruiert √10 cm, Fall 2 die Kathete √21·u aus Hypotenuse 5u und Kathete 2u. Der zweite Fall verändert die Rolle der Unbekannten und benötigt eine Quadratdifferenz. |
| `487ec508-f421-5a5a-a84c-98f88a8fb3e5` | fachlich geeigneter P-Kandidat | Die vier Dreiecke waren irrtümlich eine profilweite Pflicht. Nun sind die Erwartungen methodenneutral für geeignete Zerlegungs- oder Ergänzungsbeweise. Im ersten Beispielfall wird die Quadrat-Eigenschaft durch 180°−α−β=90° begründet. Der zweite fordert eine selbst konstruierte andere Anordnung mit zwei Quadraten und zwei diagonal zerlegten Rechtecken; ihre Maße und lückenlose Zerlegung sind ausdrücklich nachzuweisen. |
| `6a3502ee-b616-5db7-88fc-8951f33c9f63` | fachlich geeigneter P-Kandidat | Hilfsdreieck, positive dritte Seiten und SSS ergeben bereits eine korrekte allgemeine Kette. Der Reparaturfall stellt nun klar, dass der Kehrsatz erst bewiesen werden soll: Eine gültige Anwendung eines bereits bewiesenen Kehrsatzes darf nicht mit dem fehlerhaften Umkehren des ursprünglichen Satzes verwechselt werden. |

Keine ungelösten fachlichen P-Blocker im geprüften Paket. Das Urteil ist eine KI-Prüfung dieser Kandidaten; es setzt keine anderen Gates oder offenen Reviews auf abgeschlossen.

Die Fälle sind unabhängig vorzulegen, ohne die ausgearbeitete Lehrgrafik oder die jeweilige Erwartungsantwort. Profilweite Erwartungen akzeptieren mathematisch gleichwertige Wege innerhalb des kanonischen Ziels. Die zwei Fälle sind Evidenzbeispiele und kein automatischer Laufzeitbefehl, nach bereits ausreichender Evidenz zusätzliche Aufgaben zu erzwingen.

## Quellen und tatsächliche Projektion

Geprüft wurden die aktuellen kanonischen DE/EN-Ziele, direkte Voraussetzungen und Nachfolger, die direkten Einträge in `curricula/DE/Gymnasium/mapping/DE-*/lower-secondary/*source_extraction_to_canonical_math.review.json`, zugehörige Source-Extraction-Knoten sowie die hinterlegten Original-PDFs:

- SL, `curricula/DE/Gymnasium/input/SL/LP_MA_gym9_9_2025.pdf`, S. 20–21: Satz, Kehrsatz, deren Beweise, Rechtwinkligkeitsprüfung und Wurzelkonstruktion. Die Auswahl des Beweises bleibt der Lehrkraft überlassen. Beim Wurzelziel wird nur die Pythagoras-Alternative operationalisiert; Höhensatz wird nicht vorausgesetzt.
- HE, `curricula/DE/Gymnasium/input/HE/lower-secondary/kerncurriculum_mathematik_gymnasium.pdf`, S. 27: Satz und Umkehrung einschließlich exemplarischer vollständiger Beweise. Die G8-/G9-Mappingeinträge wurden geprüft; die beiden alten Jahrgangs-Lehrpläne wurden nicht erneut im Original verifiziert.
- SH, `curricula/DE/Gymnasium/input/SH/Fachanforderungen_Mathematik_Sekundarstufe_2024_barrierearm.pdf`, S. 41: Gültigkeitsnachweis von Satz und Umkehrung, verschiedene mögliche Nachweisformen.
- RP, `curricula/DE/Gymnasium/input/RP/Mathematik_Sekundarstufe_I.pdf`, PDF-Seite 100 / gedruckte S. 97: Beweis des Satzes in der Erweiterung. Daraus folgt kein zusätzliches kanonisches Ziel für einen allgemeinen Kehrsatzbeweis in RP.
- BW, `curricula/DE/Gymnasium/input/BW/BP2016BW_ALLG_GYM_M.pdf`, 3.3.3(4), S. 33: Nutzung des Kehrsatzes zum Schluss auf Orthogonalität.
- BB/BE, hinterlegte gemeinsame RLP-Fassung unter `curricula/DE/Gymnasium/input/BB/lower-secondary/Teil_C_Mathematik_2015_10_13_Ma_14.08.2023_Berlin_23_11.pdf`, S. 47: Identifikation rechtwinkliger Dreiecke mittels Umkehrung; beide aktuellen Mappingdateien wurden geprüft.

Die wirklichen Rollen wurden mit `collectCompositionProjectionRoleGoalIds` aus allen aktuellen Mathematik-Views berechnet; die Views mit einem dieser Ziele als `target` wurden mit `compileCompositionView` geprüft (0 Fehler). Die Vereinigungen der Ziel-Bundesländer entsprechen den kanonischen Grenzen:

| Lernziel | `target` in Bundesländern |
| --- | --- |
| `081c9802` | BB, BE, BW, HE, SH, SL |
| `3a69dab2` | SL |
| `487ec508` | HE, RP, SH, SL |
| `6a3502ee` | HE, SH, SL |

Explizite `prerequisiteOnly`-Verweise in weiteren Views wurden als solche behandelt und nicht als zusätzliche curriculare Geltung ausgegeben. Die bestehenden kanonischen `applicabilityMappingInheritance: boundary`-Grenzen bleiben unverändert.

## Bilder, Bindungen und Validierung

Alle vier aktuellen kanonischen PNGs wurden tatsächlich mit `view_image` geöffnet. Beschriftungen, rechter Winkel, längste Seite, Quadratfigur und Hilfsdreieck sind fachlich mit dem jeweiligen Ziel vereinbar. Sie sind Orientierung, kein selbstständig erbrachter Nachweis. Beim Wurzelbild ist die Kurzrechnung als Zahlenrechnung in der Einheit cm zu lesen; die Kandidaten schreiben die Einheiten ausdrücklich als cm² beziehungsweise u² aus.

| Lernziel | aktueller PNG-SHA-256 |
| --- | --- |
| `081c9802` | `4d2d8170e20beca927eaa82696250221a1415439e4b3fdaa01b5b80b5d1996d7` |
| `3a69dab2` | `c688cc8418d0481d20fa6684cd0b87dde683e969887617f39992307ac3579720` |
| `487ec508` | `bd98f29244650f931965ec217ab32ec0dae003ecb26c2b7f1a0b83b6495190fa` |
| `6a3502ee` | `dd76447150b51af15d97264ef9eccd3d656ac51d2a380582a80028de145450c6` |

Kanonische und Runtime-Bildbytes stimmen für alle vier Ziele überein. Rechnerische Gegenchecks: 9²+40²=41², 7²+10²=149≠12², 1²+3²=10, 5²−2²=21 und 8²+15²=17². Die beiden Flächenanordnungen wurden für beliebige positive Katheten einschließlich a=b begründet; der Kehrsatzbeweis benutzt den ursprünglichen Satz ausschließlich im rechtwinkligen Hilfsdreieck.

`positive-evidence.candidates.json` ist der Authoring-Eingang. `positive-evidence.review.jsonl` wurde mit dem bestehenden Materialisierer neu erzeugt; dessen Prüfung bindet aktuelle Ziel-, Kriterien-, Profil- und Bildfingerprints. Der anschließende Aufruf ohne `--write` bestätigt alle vier Records. Dieser Struktur- und Bindungscheck ersetzt die hier dokumentierte fachliche Prüfung nicht.

Nur Kandidaten-JSON, generierter Review und diese README wurden geändert. Canon, Bilder, Quellen, Projektionen, Konfiguration und zentrale Registry wurden nicht verändert.
