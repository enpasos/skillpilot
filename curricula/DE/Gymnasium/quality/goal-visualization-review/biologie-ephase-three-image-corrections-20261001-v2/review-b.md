# Unabhängige Bild-QA B: drei korrigierte E-Phasen-Kandidaten

**Stand:** 2026-10-01. **Status:** nur Bildkandidaten, keine aktive Bindung und keine V- oder menschliche Freigabe. Ich habe alle drei tatsächlichen Original-PNGs (1672 × 941 Pixel) sowie die mitgelieferten Ansichten bei **360 × 203** und **680 × 383** Pixeln angesehen. Die Original-SHA-256-Werte stimmen mit `candidate-manifest.json` überein. Das Manifest nennt ChatGPT/Codex `image_gen` als Herkunft der korrigierten PNGs; die Urteile stützen sich auf die sichtbaren Inhalte. Die v1-HOLD-Befunde wurden gezielt gegen die Korrekturen geprüft.

**Ziel- und Quellenbindung:** Die aktuellen Ziele stehen in `canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json`; keines der drei hat derzeit einen aktiven `resourceLinks`-Bildeintrag. Die HE-Zuordnungen stehen in `mapping/DE-HE/upper-secondary/hessen_biology_upper_secondary_source_extraction_to_canonical_biology.m7-e3-trisomy-current-20261001-v3.review.json`. Der amtliche lokale HE-KC-PDF nennt RGT/Enzymaktivität in E.2 auf gedruckter S. 36 und das Zusammenspiel von Zellteilung, Zelldifferenzierung und Morphogenese sowie Meristeme/Signalaustausch in E.5 auf gedruckter S. 37. Die ältere Source-Extraction paraphrasiert diese Punkte als Ziele E.2.5, E.5.1 und E.5.2; sie ist kein Ersatz für den amtlichen Wortlaut.

| Ziel / Source-Extraction-ID | v1-Befund → v2-Urteil |
| --- | --- |
| `9d931642-2287-5277-adb2-082403ad25af` / `152da0af-ce6c-4bd1-b681-e988751acfc3` | fehlende Entwicklungsfolge → **HOLD**, Folge weiterhin fachlich unklar |
| `a545b28f-81de-5495-a537-c81cb66daaba` / `12877f68-0d5e-4c7c-805e-a3b497daaa0f` | unlesbare Signalrichtung → **KEEP als Kandidat** |
| `e566ae2f-1294-55c0-ba4c-6aeb4954118c` / `1e24db22-0da7-4ecf-bfde-d35ae9257b39` | nur qualitatives „wärmer = mehr“ → **KEEP als Kandidat** |

## `9d931642` — Pflanzliche Entwicklung: HOLD

Original-SHA-256: `3a5f3982f60fda1be5585eaa87cdbf4ad5b2c595bae3fe27cb86922f46faec14`. Die neue Fassung zeigt jetzt eine links-rechts gerichtete Folge, und der Zellhügel der Sprossspitze wächst im mittleren Bild. Das behebt den früheren Mangel einer sichtbaren zeitlichen Richtung. Die entscheidende **Zelldifferenzierung** bleibt aber auch bei 680 Pixeln nicht sicher vom bloßen Größerwerden des nahezu gleich gefärbten Zellhügels zu unterscheiden; bei 360 Pixeln ist der Unterschied noch schwächer. Es entsteht kein eindeutig erkennbarer Blatt- oder Gewebeansatz als lokale Morphogenese. Der letzte Pfeil führt von einer vergrößerten **Sprossspitze** direkt zu einer **ganzen bewurzelten Pflanze**. Das kann die fachlich falsche Ableitung nahelegen, auch die Wurzel gehe aus diesem Sprossmeristem hervor. Der amtliche HE-E.5-Punkt fordert das Zusammenspiel der drei Prozesse, nicht diese Organherkunft.

Gezielte Korrektur: dieselbe **Sprossknospe** in drei klaren Stadien; zuerst wenige sichtbar geteilte Zellen, dann im selben Ausschnitt deutlich unterschiedliche Zell-/Gewebebereiche und ein Blattprimordium, zuletzt ein erkennbar entwickelter Blatt-/Sprossabschnitt. Die Wurzel aus der Pfeilfolge entfernen oder eine Gesamtpflanze nur als getrennte Ortsangabe ohne Entwicklungsableitung zeigen. Formen und Pfeile bei 360 Pixeln groß halten. Ein Alttext kann den jetzigen Herkunftseindruck nicht reparieren. **Alttextvorschlag erst für eine solche korrigierte Fassung:** „Drei Stadien derselben Sprossknospe: Im Meristem vermehren sich Zellen, unterschiedliche Zellbereiche und ein Blattansatz werden erkennbar, daraus entwickelt sich ein Blatt am Spross.“ Danach Original und beide Ansichten erneut prüfen.

## `a545b28f` — Meristemfunktionen und Zellsignale: KEEP

Original-SHA-256: `320472343df409f1a510a845bc78020c3d99aa83f5a457f50d74b19a17a6642c`. Die kleine Pflanze verortet den vergrößerten Bereich an der Sprossspitze. Im Zoom sind wenige große Nachbarzellen zu sehen. Orange Signalpunkte und ein großer Pfeil verlaufen deutlich von links zur mittleren Zelle; ein zweiter Pfeil führt zur rechten Gruppe aus zwei Zellen mit sichtbarer Reaktionsmarkierung. Sender-Empfänger-Richtung und anschließende Zellreaktion sind auf 360 und 680 Pixeln erkennbar. Damit ist der v1-HOLD wegen verstreuter Punkte und kaum sichtbarer Pfeile behoben. Die Farben und Pfeile sind ein abstraktes Signalmodell; sie identifizieren weder ein bestimmtes Hormon noch einen belegten molekularen Signalweg.

**Alttextvorschlag:** „Eine Pflanze zeigt ihre Sprossspitze; ein vergrößerter Ausschnitt stellt benachbarte Meristemzellen dar. Orange Punkte und Pfeile zeigen ein Signal von einer linken zu einer mittleren Zelle; ein weiterer Pfeil führt zu einer markierten Zellreaktion rechts. Die Punkte stehen schematisch für Signale, nicht für ein bestimmtes Molekül.“

## `e566ae2f` — RGT-Regel: KEEP

Original-SHA-256: `9417811facdb2b072175f64ee01e6b8ab8219894efc4c836df85182ec98e00af`. Die neue Fassung nennt **10 °C** und **20 °C** samt **+10 °C**, zeigt gleiche Uhrstellungen als gleiche Beobachtungszeit und darunter **zwei gegenüber vier** zählbare Produktzeichen. Ein abgetrennter sehr heißer Fall mit durchkreuzter, verformter Enzymfigur begrenzt die Aussage: weitere Erwärmung erhöht Enzymaktivität nicht unbegrenzt. Damit sind alle vier konkreten v1-HOLD-Punkte adressiert. Zahlen, Uhren, Produkte und Grenzfall bleiben selbst bei 360 Pixeln erkennbar; bei 680 Pixeln klar. Die Verdopplung ist ein Beispiel der RGT-Regel in einem geeigneten Bereich, kein universeller Faktor für jedes Enzym und jede Temperatur.

**Alttextvorschlag:** „Zwei Enzymversuche mit gleicher Beobachtungszeit: bei 10 °C entstehen schematisch zwei Produkte, bei 20 °C vier; ein Pfeil markiert plus 10 °C. Ein gesonderter sehr heißer Fall zeigt ein verformtes, durchkreuztes Enzym als Grenze dieser Zunahme.“

**Folge:** Die beiden KEEP-Urteile bescheinigen ausschließlich fachlich und visuell brauchbare Bildkandidaten. Vor einer maschinellen V-Freigabe sind aktuelle kanonische Bildlinks und Alttexte, bytegleiche Assets in den erforderlichen Pfaden und die betroffenen Checker zu prüfen. `9d931642` bleibt für eine gezielte Korrektur offen. Menschliche Prüfung, Freigabe und Erprobung bleiben separate Gates.
