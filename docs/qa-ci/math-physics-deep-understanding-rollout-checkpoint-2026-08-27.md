# Mathematik/Physik Deep-Understanding-Rollout – Checkpoint 2026-08-27

## Zweck und Stop-Grenze

Dieser Stand beendet die aktuelle Arbeitsphase als lokal reproduzierbaren,
commit- und deployfähigen Zwischenstand. Der fachliche Rollout ist bewusst
nicht vollständig. Ab hier werden keine weiteren Lernziele, Graphkanten oder
Visualisierungen in diesen Checkpoint aufgenommen; die Arbeit kann später an
der unten dokumentierten Fortsetzungsgrenze wieder beginnen.

Es gilt weiterhin **KEEP by default**: Eine tragfähige Beschreibung bleibt
unverändert. Nur eine konkret belegte Schwäche rechtfertigt eine minimale
Revision oder fachlich adjudizierte Aufteilung.

Codex hat weder gestagt noch committed, gepusht, getaggt oder deployt. Die
Hashes in diesem Dokument beschreiben ausschließlich den lokalen Arbeitsstand.

## Strenger Fortschritt

| Fach | Vollständig durch alle Rollout-Gates | Fortschritt | Beschreibungen | Understanding-Evidence | Atomicity | Memory | Visualisierung |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Mathematik | 97 / 791 | 12,3 % | 97 | 105 | 791 | 791 | 791 |
| Physik | 82 / 444 | 18,5 % | 82 | 83 | 444 | 444 | 444 |

Der zentrale Deep-Understanding-Bericht meldet **0 Blocking Issues**. Beide
Curricula halten die geschützte Reifegraduntergrenze **M6**. Der Nenner ist
der aktuelle Bestand gewöhnlicher atomarer Ziele; neue Splits erhöhen ihn nur,
wenn sie tatsächlich kanonisch übernommen wurden.

Für historisch überholte Reviewfassungen bleibt die Evidenz als Auditspur im
Repository erhalten. Die zentrale Konfiguration bindet dagegen die aktuellen,
teilweise checkpoint-gefilterten Resolution-Indizes. Insbesondere werden die
gefilterten Mathematik- und Physik-Indizes mit dem Suffix
`resolution-index.current-checkpoint.json` verwendet, damit veraltete
Resolutionen nicht erneut als gegenwärtige Freigabe zählen.

## Integrierte Struktur- und Quellenqualität

- 593/593 Curriculum-Landschaften und 297/297 Composition Views sind gültig.
- Alle 9 geschützten Reifegraduntergrenzen bestehen.
- Die hessische Mathematik-Dauermodellprojektion ist mit 609/609 erwarteten
  Evidenzlinks vollständig. Die beiden fehlenden J5-Platzierungen für
  `ad26e4d9-b025-57ec-8f25-df4a2415cc62` sind durationsspezifisch ergänzt;
  alle 18 generierten Dauermodellansichten sind aktuell.
- Der zentrale Quellenabdeckungsaudit sowie die öffentlichen
  Quellenrationale-Indizes sind aktuell. Mathematik veröffentlicht 736/736
  aufgelöste klassische Quellenrouten; der vollständige 791-Ziele-Bericht
  weist zusätzlich 55 transparent dokumentierte Classic-Source-Gaps aus.
  Physik veröffentlicht 406/406 aufgelöste klassische Quellenrouten.

## Bildregel und rückwirkender Audit

Für alle in diesem Arbeitsblock neuen oder bytegeänderten Mathematik- und
Physikbilder gilt rückwirkend: **Nano Banana Pro ist der Standardprovider**.
Eine repo-native Fassung ist nur nach dokumentierten, gezielten und fachlich
ungeeigneten Nano-Banana-Pro-Versuchen zulässig. Gute vorhandene
Nano-Banana-Pro-Bilder werden nicht allein wegen einer späteren Zielaufteilung
ersetzt.

Der [rückwirkende Nano-Banana-Pro-Audit](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-visualization-review/nano-banana-retroactive-rollout-audit-2026-08-27.md)
vergleicht gegen Baseline-Commit
`7f8266a0842b0136fba37e31d56837421012a16b`:

| Fach | Neue oder bytegeänderte aktive Bilder | Nano Banana Pro | Dokumentierter Fallback | Canonical/Public/Backend-Parität |
| --- | ---: | ---: | ---: | --- |
| Mathematik | 25 | 25 | 0 | 25/25 SHA-256-identisch |
| Physik | 38 | 37 | 1 | 38/38 SHA-256-identisch |

Der einzige Fallback ist `41d35667-0296-5f84-bc12-202ffc440be0` zur exakten
3×4-Geometrie der Kräfteaddition. Vier gezielte Nano-Banana-Pro-Versuche waren
fachlich ungeeignet; die repo-native Fassung ist deshalb ausdrücklich
dokumentiert. Zehn ältere, gute Nano-Banana-Pro-Clusterbilder sowie das Bild
`3e33813d-db75-4571-8345-3845b02b956d` zu Hören, Ohr und Lärmbelastung blieben
bewusst erhalten.

## Lernzielbücher

Die Bücher sind aus den aktuellen lokalen Curriculum-, View-, Quellen- und
Visualisierungsbytes gebaut und gegen den Publikationsindex gebunden:

| Fach | Seiten | Modelldigest | Modell-SHA256 | PDF-SHA256 | Manifest-SHA256 |
| --- | ---: | --- | --- | --- | --- |
| Mathematik | 791 | `sha256:954cfcec4a5168bc769a4c6b4846ba1cdf4cb5f5f3e37a83b02b8e219bcf0fd5` | `256c5c7bc3b5275156b9a6233a8726dc4cc20a39eac7101230ddaddc5aed7315` | `9cf7bbd00c7941ed977e525b6f044d1eb41bb5b377e72afcdf94cbb937e53a0e` | `8f1bef754ea220780602535eddffe36959836c1cc019bff6d345de7d846a8113` |
| Physik | 444 | `sha256:c6afe91f5f7dc2c9e63eb58a69984ebbecfcf6be4b00ecd35b255d36eb81bc5e` | `bb359d4b97228c8521900f6dd8866b606a537c4b2ba04072a3ab140bebab7ff0` | `6ea1c20bd8072d00aad653fcbfda2b08f5af7b35e5eee141090f90b27f1f5d1f` | `fe1e1cbec15d5e06df24fe3876e0cf4ac9d2d58c4295847a0ca5724ab282e31a` |

Nach dem Deployment sind die vorgesehenen URLs:

- `https://skillpilot.com/lernzielbuch`
- `https://skillpilot.com/lernzielbuch/de-gym-mathematik-bundesweit.pdf`
- `https://skillpilot.com/lernzielbuch/de-gym-physik-bundesweit.pdf`

## Bewusst nicht umgesetzter nächster Mathematik-Schritt

Die diskutierte Volumen-Aufteilung ist **nicht** Teil dieses Checkpoints:

- `99ef0fc2-150a-51e8-bac8-7e40e46917b` bleibt ein atomares Ziel;
- `2f3d24e7-2450-55d8-97c2-3e106d2854c6` bleibt ohne zusätzlich
  formulierte Fixpunktklausel;
- mögliche neue Kinder für elementare Quader-/Würfelvolumina und für
  zusammengesetzte Quaderkörper wurden weder materialisiert noch in Views,
  Mappings oder Assessments gebunden und besitzen keine neuen Bilder.

Eine spätere Umsetzung muss Quellenmappings, Assessments, Views,
Voraussetzungskanten und positive Understanding-Evidence gemeinsam neu
binden. Sie darf nicht durch bloßes Einfügen der beiden Kandidaten erfolgen.

## Finale Prüfsequenz dieses Checkpoints

Der vollständige Arbeitsbaum wird in einem separaten temporären Git-Index
geprüft. So sieht `run_ci.sh all` genau den vorgesehenen Commit-Inhalt, ohne den
echten, teilweise vorbereiteten Index des Product Owners zu verändern.

Die Freigabe dieses Checkpoints setzt mindestens voraus:

```text
./run_ci.sh all
npm --prefix app run build
./backend/gradlew -p backend test --tests com.skillpilot.backend.service.LearnerServiceCrossSubjectPilotTest
./backend/gradlew -p backend clean build -x test
node scripts/check_openai_plugin_versioning.mjs
node scripts/check_openai_plugin_review_freeze.mjs
node scripts/openai_plugin_release.mjs verify
node scripts/check_skillpilot_coach_plugin.mjs
node scripts/claude_direct_install_beta_release.mjs verify
git diff --check
git diff --cached --check
```

Layer-A-Curriculumdaten, Lernziele, Assessments, Quellenrationalen,
Lernzielbücher und Curriculum-Visualisierungen liegen außerhalb des
eingefrorenen Coach-V1-Bytevertrags. Der unveränderte Plugin-/MCP-/OAuth-/Tool-/
Schema-/UI-/Session-/State-Vertrag muss dennoch durch die Freeze-Prüfungen
fail-closed bestätigt bleiben.

## Übergabe an Commit und Deployment

Der echte Git-Index ist absichtlich nicht von Codex verändert worden. Er
enthält derzeit nur 28 bereits früher gestagte PNG-Löschungen; ein sofortiger
Commit wäre daher unvollständig und darf nicht erfolgen. Vor dem Commit muss
der Product Owner nach Sichtprüfung den gesamten beabsichtigten Zwischenstand
neu erfassen:

```text
git add -A
git status --short
git diff --cached --check
```

Danach muss geprüft werden, dass keine beabsichtigten Ersatz-JPGs,
Curriculumdaten, QA-Ledger, Bücher oder generierten Laufzeitkopien mehr
unstaged oder untracked sind. Erst der daraus erzeugte Commit darf deployt
werden.

Commit-Message-Vorschlag:

```text
feat(curriculum): checkpoint deep-understanding rollout for math and physics
```

## Fortsetzung zu einem späteren Zeitpunkt

1. Den zentralen Rollout-Check ausführen und 97/791 Mathematik sowie 82/444
   Physik bei 0 Blockern als Ausgangspunkt bestätigen.
2. Genau einen fachlich zusammenhängenden nächsten Teil wählen.
3. KEEP als Standard verwenden und nur konkret belegte Schwächen ändern.
4. Änderungen wieder in zwei unabhängigen aktuellen Runden, Synthese,
   Resolution und positiver Understanding-Evidence prüfen.
5. Bei Strukturänderungen alle abhängigen Kanten, Mappings, Views,
   Assessments und Bildzuordnungen gemeinsam adjudizieren.
6. Danach Applicability, Quellenrationalen, Bücher, Statusartefakte,
   Visualisierungsparität und M6-Untergrenzen neu materialisieren und die
   vollständige Prüfsequenz wiederholen.

Dieser Checkpoint beendet die aktuelle Arbeitsphase, nicht den später
fortsetzbaren Gesamtauftrag mit dem langfristigen Ziel 100 %.
