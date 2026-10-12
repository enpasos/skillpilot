# Chemie Q3: gezielte Autorenkorrekturen v3

Dieses additive, inaktive Paket folgt dem versiegelten v2-Paket. Der übernommene Dateiname enthält noch „four-images“; der tatsächliche Korrekturumfang beträgt **fünf Bilder, zwei Diagrammfälle und eine englische Präzisierung**. Es ersetzt keine aktiven Curriculumsdateien und erteilt keine unabhängige oder menschliche Freigabe.

## Konkrete Änderungen

| Ziel/Fall | Befund aus versiegeltem Originalreview | Neuer Kandidat |
| --- | --- | --- |
| 5a24 Le Chatelier | Hauptbedeutung der Textkarten bei 360 px nicht lesbar | Vier große Comicmotive mit situationsgebundenen Reaktionsgleichungen; Druckbeispiel 2 A(g) ⇌ B(g), endothermes Temperaturbeispiel und unveränderte Gleichgewichtslage durch Katalysator. |
| 545a quantitative Prozessoptimierung | Kleine Pflichttexte und fehlendes quantitatives Hauptmotiv | Isotherme Halbierung des Volumens bei zunächst unveränderter Zusammensetzung: p → 2p, Qp,neu = Qp,alt/4 für N₂ + 3 H₂ ⇌ 2 NH₃; anschließende Verschiebung. Identische neun abstrakte Molekülmarker vor und direkt nach Kompression. |
| c046 Haber Bosch | Zwei N₂-Paare unter 1× und drei NH₃-Symbole unter 2× | Ein N₂-Paar, drei H₂-Symbole und zwei NH₃-Symbole. MWG und Konzentrationsrechnung bleiben fachlich erhalten. |
| b8 Faraday | Parallel angeschlossenes Voltmeter als 2-A-Strommesser; Elektronenstrom durch den Messzweig | Amperemeter in Reihe, eindeutige Gleichstrompolung und Kathodenabscheidung. Q = 7200 C, n(Ag) ≈ 0,0746 mol, m(Ag) ≈ 8,05 g. |
| e62 Arrhenius | „Geschwindigkeit (k)“ | „Geschwindigkeitskonstante (k)“; ln(k) gegen 1/T und Ea = −mR erhalten. |
| q3-18-a/b | Numerisch vorgegebene Tangentensteigungen ohne skaliertes Diagramm prüften keine grafische Bestimmung | Vier echte, mit Matplotlib erzeugte PNG-Diagramme: zwei Hauptfälle und zwei frische Variationen. Lernendenmaterial enthält keine Zahlenwerte der Steigungen. Aufgaben verlangen getrennte Kurven-/Tangentenpunkte und ein Steigungsdreieck; Lösungen und Rubriken nennen Ablesetoleranzen und Unsicherheitsfortpflanzung. |
| q3-09-c | Englisch „half the Cu amount“ mehrdeutig | Expliziter Vergleich: Bei gleicher durchgeleiteter Ladung ist die abgeschiedene Cu-Stoffmenge halb so groß wie die Ag-Stoffmenge; keine entsprechende Halbierung der Massen behauptet. |

Die fünf Bildkorrekturen wurden mit dem eingebauten OpenAI-`image_gen` als PNG erstellt, anhand der tatsächlichen Ausgangsbilder bearbeitet und mit den unveränderten normalen Prepare-/Import-Skripten in eine temporäre Kandidatenumgebung importiert. Provider, volle Prompts, Korrekturprompts, native Maße und SHA-256 stehen in `visualization/five.generated-image-provenance.author.json`. Alle drei Bildkopien sind exakt gebunden. Zwei verworfene Erstvorschläge und ihre konkreten Autorenbefunde bleiben erhalten. Neue eigene didaktische Medien sind CC-BY-4.0; die Provenienz ist keine Freigabe.

## Vollständiger aktueller Kontext

- 523 kanonische Knoten, 402 curriculare atomare Ziele, alle 13 eigenen Ziele und alle 28 bilingualen Fälle bleiben vorhanden.
- Gegen v2 ändern sich ausschließlich die fünf `resourceLinks`. Sämtliche Texte, Dimensionen, `requires`, `contains`, Applicability-Felder und Geschwistersemantiken bleiben gleich.
- Die fünf aktuellen B007-Applicability-Korrekturen für a44af1fa, 4b6d1824, 805a2f58, 1351706f und 413040cd bleiben unverändert erhalten.
- 25 wissenschaftliche Fallkörper bleiben exakt gleich. Die einzigen drei Änderungen sind q3-18-a, q3-18-b und der englische Lösungssatz in q3-09-c.
- Die gute v2-Korrektur 96fd und die sieben weiteren guten Bilder bleiben exakt erhalten. Keine genehmigte Bildquelle wird ersetzt.
- Der normale ganze 402-Seiten-Modellkontext und ein aktueller 13-Ziele-Auszug wurden erzeugt. Der Quellenatlas bleibt **381**, kein neuer Nenner. Die wörtlichen 656 Quellenkontexte, neun Mappingentscheidungen, fünf Quellenzeilen, drei Quellen-View-Mitgliedschaftsänderungen und 20 Kontextpayload-Änderungen aus v2 bleiben durch ihre versiegelten Originalbindungen erhalten. Diese Änderungen gehören zur bisherigen Quellenvorlage; v3 fügt keine hinzu.

Einstieg: `FINAL.neutral-input-manifest.json`. Vollständige Tupel: `inputs/FINAL.neutral-whole402-P13-whole28-source-bounded.join.json`. Präzises Delta: `inputs/targeted-v3-delta.neutral.json`.

`native/whole13.html` und `native/whole13.pdf` sind die normalen vollständigen aktuellen 13-Ziele-Seiten. `native/six.html` und `native/six.pdf` sind der gezielte sechsseitige Auszug der fünf Bildziele und des Diagrammziels. Die sechs HTML- und PDF-Lernzielseiten und die tatsächlichen 360-/680-px-Ansichten wurden als Autor an den Pixeln geprüft. Die vier skalierten Originaldiagramme sowie alle vier bilingualen Aufgabenblätter in HTML und PDF wurden ebenfalls tatsächlich angesehen. Das Aufgaben-PDF hat vier Seiten. Die gespeicherten Aufnahmen liegen unter `native/actual-views/`. Diese Prüfung ist eine Autorenprüfung; neue unabhängige Bild-/Aufgabenurteile fehlen.

## Quellenpflichten bleiben konkret offen

`inputs/source-components-and-explicit-sibling-ownership.author.json` nennt für jedes der 13 Ziele den vollen aktuellen Körper, die konkreten Quellenkomponenten und die real vorhandenen Geschwisterziele. Eine vorgeschlagene oder teilweise Verantwortung wird nicht als vollständige Abdeckung behandelt.

- **Zwei Scope-Holds:** b8 (HE verlangt qualitative Faraday-Deutung ohne Rechnungen; der quantitative Körper ersetzt diese Pflicht nicht), e62 (RP-Arrhenius als optionaler/ausgewählter Umfang noch nicht geklärt; entfernte HB-Zuordnung begründet keine neue Deckung).
- **Sieben gekoppelte Komponenten-Holds:** 20f (MV-kinetische Herleitung des MWG), 5a (BW-experimentelle Temperatur-/Druckuntersuchung und MV-Herleitung), 545a und 882 (BW-Haber-/Bosch-Leistungen; entfernte Chromatographie muss beim echten Chromatographiegeschwister bleiben), 93 (breitere H₂-/Photochemiepflichten und TH-Versuchsoperatoren), 56 (TH-Experiment, Datenaufnahme und Auswertung; neue Diagramme belegen nur den Auswertungsteil), 3ce (HB-quantitative Faktoren; BY-Planung und Durchführung bleiben verschieden).
- Für c046, 96fd, 0908 und 94a wurde kein zusätzlicher konkreter Quellenkomponenten-Hold identifiziert. Das ist keine neue Quellenunion-Freigabe.

Genuine Geschwisterverantwortungen werden erhalten, darunter chromatographische Analyse, historische chemische Entwicklungen, Hypothesen-/Versuchsplanung und Durchführung, Datendokumentation, H₂-Nachweis/Präparation und breitere Photo-/Elektrochemie. Ihr voller Operatornachweis bleibt dort offen, soweit er nicht belegt wurde. Synthetische Materialien sind keine ausgeführte Laborleistung. Eine reale menschliche Laborprüfung oder Human Trial ist keine neu erfundene Voraussetzung für Maschinen-QS. Ein Quellenoperator wird dadurch nicht abgeschwächt.

## Ausgeführte gezielte Prüfungen

- Normaler P13-Materialisierer: Erzeugung und abschließender schreibfreier Bytevergleich bestanden; `needs_human_review`/`ai_candidate`, E1/G1 bleiben wahrheitsgemäß erhalten.
- Normaler 402-Modellbau, gezielter Sechs-Ziele-Modellbau/-Renderer und vollständiger 13-Ziele-Modellbau/-Renderer bestanden.
- Exakte Originalseals: v2 183 Dateien, unabhängiges Original A 64 Dateien, unabhängiges Original B 60 Dateien unverändert.
- Fünf PNGs mit je identischer kanonischer, Frontend- und Backend-Kopie; alle 518 weiteren Zielkörper unverändert gegen v2; alle Voraussetzungskanten und fünf Live-Geltungsbereichskorrekturen erhalten.
- JSON/JSONL parsebar; normaler committable-Curricula-Symlink-Guard bestanden. Kein vollständiger Build und keine Tests anderer Fächer.

Die normal verwendeten Skriptquellen und benötigten Referenzdateien liegen in der temporären Kapsel `tmp/chemie-q3-thirteen-author-v3-execution-capsule`. Nur bestehende `app/node_modules` werden verlinkt; ursprüngliche Bilder werden für schreibfreie Modell-/Renderaufrufe als exakte Hardlinks bereitgestellt. Neue Kandidatenbilder werden kopiert. Kein Dependency- oder Curricula-Korpus-Klon.

Für eine Wiederholung in einer separaten Arbeitskopie: `python .../reproduction/prepare-capsule.author.py`, anschließend der normale `materializePositiveGoalEvidenceCandidates.ts` mit den eigenen P13-Config/Candidates (ohne `--write` für die Byteprüfung), `buildGoalBookModel.ts` mit der jeweiligen eigenen Config und `renderGoalBook.ts` mit `--public-root <Kapsel>/app/public`. Die genauen ausgeführten vollständigen Renderer-Befehle stehen in `checks/whole13-native-normal.terminal.actual.json`; der abschließende Materialisierer-Befehl in `checks/targeted-author-final.actual.json`. Diagramme: `reproduction/repair-cases-and-assessment-plots.author.py`; Pixelaufnahmen: `reproduction/capture.actual.mjs` und `capture-assessments.actual.mjs`. Keine Wiederholung darf versiegelte Originaldateien verändern.

Neue unabhängige A/B-Urteile zu den geänderten Bindungen stehen aus. Vorhandene unveränderte D-/A-/M-/Fallurteile werden nicht als neue Prüfung ausgegeben. Das Paket hat **0 Strict-Gain**, keine aktive Integration und keine neue Human Approval/Human Trial. Der referenzierte zentrale Bericht belegt den erhaltenen Baselinezustand 212/402; alte Biologie-/Zentralbindungen bleiben historische Belege.
