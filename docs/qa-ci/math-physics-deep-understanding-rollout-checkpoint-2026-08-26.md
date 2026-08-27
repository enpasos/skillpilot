# Mathematik/Physik Deep-Understanding-Rollout – Checkpoint 2026-08-26

## Zweck und Stop-Grenze

Dieser Stand ist ein geprüfter, commit-fähiger und später fortsetzbarer
Zwischenstand. Der fachliche Rollout bleibt bewusst unvollständig und ist an
diesem Checkpoint gestoppt. Es wurden nur konkret belegte Schwächen behoben;
tragfähige Lernziele blieben nach dem Prinzip **KEEP by default** unverändert.

Es wurde kein Commit, Staging, Tag, Push, Release oder Deployment erzeugt. Die
Live-Seite zeigt daher weiterhin den zuvor deployten Stand; die in diesem
Dokument genannten Hashes beschreiben den lokalen Checkpoint.

## Gemessener Rollout-Stand

| Fach | Vollständig durch die Rollout-Gates | Fortschritt | Beschreibungen | Understanding-Evidence | Atomicity | Memory | Visualisierung |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Mathematik | 82 / 786 | 10,4 % | 82 | 82 | 786 | 786 | 786 |
| Physik | 61 / 438 | 13,9 % | 61 | 61 | 438 | 438 | 438 |

Der zentrale Bericht meldet **0 Blocking Issues**. Maßgeblich ist
[`de-gymnasium-math-physics.config.json`](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json).
Der Gesamtstatus weist Mathematik und Physik weiterhin als **M6** aus.

Die Spalte „Visualisierung“ bezeichnet hier nur die vollständige, aktuelle
Visualisierungs-Gate-Abdeckung des Rollout-Nenners. Sie bedeutet nicht, dass
für das gesamte Curriculum bereits Human Approval vorliegt. CQR-303 bleibt
bewusst auf WARN: Mathematik hat noch 69 fehlende Links und 2 fehlende Records,
Physik 20 fehlende Links und 1 fehlenden Record; die Human-Approval-Schicht ist
in beiden Fächern unvollständig. Diese transparente Restschuld senkt die
geschützte M6-Untergrenze derzeit nicht ab.

## Integrierter fachlicher Stand

### Mathematik

Die eingebundenen Review-Pakete umfassen die Kalibrierung sowie die
Rollout-Batches 001, 002 und den nicht-strukturellen Teil von Batch 003. Für
alle 82 gezählten Ziele liegen aktuelle, streng gebundene
Beschreibungsentscheidungen und positive Understanding-Evidence vor.

Im Paket `batch-003a-j6-nonstructural-17-current-v2` wurden 17 aktuelle Ziele
in zwei unabhängigen Runden geprüft. Beide Runden entschieden bei allen 17
Zielen auf KEEP. Zuvor waren nur drei konkret benannte Schwächen minimal
korrigiert worden:

- negative Zehnerpotenzen werden eindeutig als Darstellung sehr kleiner Größen
  beschrieben;
- das Erkennen und Beschreiben einer Termstruktur ist ausdrücklich Teil des
  Lernziels;
- eine doppelte Volumeneinheiten-Kompetenz wurde entfernt und die englische
  Fassung präzisiert.

Zwei zuvor offene Quellenbelege wurden minimal geschlossen:

- Hessen belegt nun auch das Entnehmen von Maßangaben aus Tabellen und
  Diagrammen;
- Thüringen belegt nun ausdrücklich die Konstruktion von Seitenhalbierenden.

Der Applicability-Compiler materialisierte daraus exakt vier Änderungen: die
beiden Lernziele und jeweils eine davon über `applicabilityFromRequires`
abhängige Prüfungsaufgabe. Für Baden-Württemberg, Schleswig-Holstein,
Mecklenburg-Vorpommern und Rheinland-Pfalz bleibt die Seitenhalbierende in den
betroffenen Ansichten bewusst `prerequisiteOnly` und wird nicht als
quellenbelegtes Ziel ausgegeben. Das Ergebnis ist **16/16** Bundesländer,
`unsupportedAssignedAtomicGoals = 0` und 0 aktive Applicability-Warnungen.
CQR-104 meldet auch für alle 54 Mathematik-Projektionen keine terminale oder
sonstige geprüfte Routenlücke.

Die vorbereiteten strukturellen Splits aus Batch 003b bleiben absichtlich
unangewandt. Das fail-closed Skript
[`applyMathBatch003StructuralSplits.ts`](https://github.com/enpasos/skillpilot/blob/main/app/scripts/applyMathBatch003StructuralSplits.ts)
kann ohne die noch fehlende fachliche Kanten-Adjudikation keine
Curriculumdaten schreiben. Alle bisherigen IDs bleiben gültig.

### Physik

Die eingebundenen Pakete umfassen Kalibrierung, Kirchhoff und die
Rollout-Batches 001 bis 005. Der aktuelle Checkpoint-Batch bestätigt 28/28
gegenwärtige Fassungen in beiden unabhängigen Runden mit KEEP. Das
Farben-Paket `batch-005-colors-4-current-v4` ist inzwischen vollständig
synthetisiert, aufgelöst und mit positiver Understanding-Evidence eingebunden;
alle vier finalen Resolutionen lauten `keep_current`.

Die Sek-I-Routen sind stabilisiert:

- 51/51 Prüfungsziele bestehen die unabhängige Semantik- und Faktenprüfung;
- 1.082 Assessment-Platzierungen besitzen vollständige
  Voraussetzungsketten;
- CQR-104 meldet in 80 Projektionen keine Motivations-, Sackgassen-,
  Autonomie- oder Terminal-Lücke; alle 5.759 geprüften Target-Vorkommen sind
  in diesen Routenmetriken fehlerfrei.

Die gebundenen Physik-Eingaben umfassen 658 Semantikentscheidungen, 438
curriculare Atome, 64 Bundeslandansichten und 16 geprüfte
Dauermodell-Entscheidungen.

Die Quellenabdeckung beträgt ebenfalls **16/16** Bundesländer bei
`unsupportedAssignedAtomicGoals = 0`.

## Korrigierte Visualisierungen

Die drei vom Product Owner beanstandeten Abbildungen wurden fachlich und
geometrisch korrigiert und in Canonical-, Public- und Backend-Kopie
bytegleich gebunden:

- Finsternisse: gerade Randstrahlen tangential zur Sonne sowie bei der
  Mondfinsternis zur Erde; der Mond liegt im Kernschatten.
- Gerade durch `P(-3|2)`: Punkt, Gerade und unbegrenzte Pfeilrichtung sind
  kollinear.
- Doppelspalt: zwei Spalte; Quelle vertikal zwischen den Spalten; Trefferzahl
  wächst von links nach rechts; Schwärzungsvariation und zentraler Peak liegen
  in vertikaler Detektorrichtung. Finale SVG:
  [`single-photon-double-slit-v1.svg`](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/visualizations/physik/c5413852-abae-566b-b435-f9939209ca63/single-photon-double-slit-v1.svg),
  SVG-SHA256 `e51d39f344993c28efc1858469a92be3c8cefadd7e49b6a97bdfed66af7a334f`,
  PNG-SHA256 `d6842a4afa320607e4aca188956725595f3cb12b4cb62c4b83f5d1c9bac877d9`.

## Lernzielbücher und Startseite

Beide Bücher wurden aus den finalen lokalen Eingaben neu gebaut, mit dem
gebundenen Chromium-Profil gerendert und gegen
[`index.json`](https://github.com/enpasos/skillpilot/blob/main/app/public/lernzielbuch/index.json) geprüft:

| Fach | Seiten | Modelldigest | Modell-SHA256 | PDF-SHA256 | Manifest-SHA256 |
| --- | ---: | --- | --- | --- | --- |
| Mathematik | 786 | `sha256:79fccee18ed4f96812242a203d3ccbddc26a906cc893ea8ca952f9260212d973` | `86ce857020768d7aeea0b398fe22901d369dd9a7892248eef6fa08bb085a6402` | `391ae4335c111a01512e0fe59da8adf683ede89f28fa29c908bd886b174836af` | `5962252fdd88a5602be499d2fbd59cb210756b28d738dcc3b9d9164e9f84aa5f` |
| Physik | 438 | `sha256:76e95dbfe5fc41b67011d88fcf98ad46e6dd757aa37e76cc1a97d482d1968499` | `c2c9c5b6503c098364d0050e647a9ef183b134bef89a8062f84dca2a872f662e` | `8d432804c4cc8973128830e1596c2b53927b01d48c93038a01633b41434088f4` | `87cd3868832c6d670198fb05b15dd7604ce606725cd3c7e9282b74049a4dac1d` |

Direkte lokale Artefakte:

- [`de-gym-mathematik-bundesweit.pdf`](https://github.com/enpasos/skillpilot/blob/main/app/public/lernzielbuch/de-gym-mathematik-bundesweit.pdf)
- [`de-gym-physik-bundesweit.pdf`](https://github.com/enpasos/skillpilot/blob/main/app/public/lernzielbuch/de-gym-physik-bundesweit.pdf)

Die öffentlichen Quellenrationale-Indizes sind aktuell gebunden:
Mathematik 731 Einträge (`9023e95b26ee…`), Physik 400 Einträge
(`d78dffc80ab1…`).

Auf der öffentlichen Startseite ist lokal genau ein sichtbarer Link auf
`/lernzielbuch` ergänzt. Die Sitemap bleibt unverändert. Diese Änderung ist als
eng begrenzte WebGUI-Ausnahme
`2026-08-26-goal-book-public-start-link-on` in der Review-Freeze-Kette
hashgebunden. Coach-Start, Plugin, MCP, OAuth, Tools, Schemas, UI-Ressourcen,
Reviewfälle und Portalwerte bleiben unverändert. Es wurde nicht deployt.

Nach einem späteren Deployment sind die vorgesehenen URLs:

- `https://skillpilot.com/lernzielbuch`
- `https://skillpilot.com/lernzielbuch/de-gym-mathematik-bundesweit.pdf`
- `https://skillpilot.com/lernzielbuch/de-gym-physik-bundesweit.pdf`

## Prüfprotokoll

Am finalen Checkpoint bestanden unter anderem:

```text
npm --prefix app run quality:deep-understanding-rollout:check
npm --prefix app run validate:graph
npm --prefix app run validate:composition-views
npm --prefix app run test:composition-projection-roles
npm --prefix app run validate:view-filters
npm --prefix app run quality:source-coverage-audit:check
npm --prefix app run quality:curriculum-status:check
npm --prefix app run check:goal-source-rationales:public
npm --prefix app run test:goal-book-pipeline
npm --prefix app run build:application
npm --prefix app run check:ai-transparency-inventory
npm --prefix app run check:frontend-shell-assets
npm --prefix app run check:ai-transparency-artifact
node scripts/check_openai_plugin_review_freeze.mjs
node scripts/check_openai_plugin_review_freeze.test.mjs
git diff --check
```

Ergebnis: 0 Rollout-Blocker, 593/593 Landschaften und 297/297
Composition-Views gültig, 0 Applicability-Fehler oder -Warnungen, alle 9
geschützten Reifegraduntergrenzen bestanden, beide Bücher verifiziert und der
OpenAI-Coach-V1-Vertrag weiterhin `IN_REVIEW` und fail-closed. Das absichtlich
aktualisierte KI-Transparenzinventar bindet den lokalen Endstand mit 1.493
Curriculum-Visualisierungen; Frontend-Shell und Transparenzartefakt sind
ebenfalls geprüft.

## Fortsetzung zu einem späteren Zeitpunkt

1. Zuerst den zentralen Rollout-Check ausführen und die Ausgangswerte 82/786
   beziehungsweise 61/438 bestätigen.
2. Genau einen fachlich zusammenhängenden nächsten Teil wählen; die
   Mathematik-Splits erst nach vollständiger Mappingkanten-Adjudikation
   angehen.
3. KEEP als Standard verwenden und nur eine konkret benannte Schwäche ändern.
4. Jede übernommene Fassung wieder mit zwei unabhängigen aktuellen Reviews,
   Synthese/Resolution, positiver Understanding-Evidence und den bestehenden
   Atomicity-, Memory- und Visualisierungs-Gates binden.
5. Danach Applicability, Quellenrationalen, Lernzielbücher und Reifegradstatus
   neu materialisieren und das Prüfprotokoll wiederholen.

Dieser Checkpoint beendet die aktuelle Arbeitsphase, nicht den später
fortsetzbaren Gesamtrollout.
