# Mathematik M7: Triage der 56 aktuell D-offenen Ziele

Stand: 27. September 2026. Read-only-Abgleich der 797 autoritativ als
`curricularAtomic` klassifizierten Ziele mit den `strictDescriptionComplete`
Einträgen der [zentral registrierten D-Indizes](../../../../deep-understanding-rollout/de-gymnasium-math-physics.config.json)
und dem [aktuellen Bild-QA-Ledger](../../../../goal-visualization-qa/mathematik.qa.json).
Ergebnis: **741/797 D-bereit, 56 D-offen**. Dies ist eine Priorisierung, keine
neue Freigabe und kein vollständiger CI-Lauf.

| Gruppe | Zahl | IDs (jeweils Präfix) | Nächster sicherer Schritt |
| --- | ---: | --- | --- |
| D **und** V offen | 29 | `7156558c`, `9023226b`, `2041f4ec`, `bd637a72`, `e02b994f`, `909d8b16`, `93fc4fbb`, `c97a33d9`, `70efdec0`, `1b67aeb4`, `0408ac7f`, `9de07e13`, `c406d5a0`, `4aa70ad4`, `87372f49`, `27bdc580`, `21fa0c22`, `ae3483e3`, `4f64f771`, `a7fb1a7a`, `a594dec0`, `18be713b`, `74d29d0c`, `3d8f5e4c`, `7bb3c312`, `9b339361`, `dc12f281`, `b4fd63de`, `f2a12269` | Alle 29 sind in der lokalen 37-Bilder-Übergabe unter `tmp/math-m7-image-prompts-2026-09-27/` enthalten. Nach nutzerseitiger Bilderstellung erst Bild fachlich prüfen und binden; die D-Prüfung auf den **dann aktuellen** Seiten-/Bild-Fingerprints durchführen. Keine alten D-Entscheide auf neue Bildbytes umetikettieren. |
| D offen, V bereit: Struktur/Atomarität | 12 | `1bc118c3`, `80956a2c`, `972cc7e8`, `f37b0a72`, `1a18dbb3`, `1ea06c0c`, `31be24f0`, `59d5a330`, `8064088b`, `809ef78a`, `a8ff2666`, `c2c49659` | Erst je Ziel entscheiden, ob eine eigenständige gemeinsame Leistung trägt oder ein Split nötig ist. Die [19er-Synthese](m7-vready-remainder19-recheck-20260927-v1/synthesis-assessment.md), [6er-Synthese](m7-six-text-dissent-current-20260927-v1/synthesis-assessment.md) und [neue Zweier-Synthese](m7-notation-derivative-two-current-20260927-v1/synthesis-assessment.md) begründen die Holds. Kein Textglätten als Ersatz für Zieltrennung. |
| D offen, V bereit: Quelle, Geltung, Niveau oder Prüfung | 14 | `0a846521`, `0f4f9957`, `6b2a1c04`, `803d910d`, `d3c42193`, `fcd1d180`, `a97c7cce`, `985d5529`, `fde351a8`, `aeae526e`, `288633c1`, `e8237315`, `0b162cb0`, `71fe4a39` | Jeweils die konkrete [19er-](m7-vready-remainder19-recheck-20260927-v1/synthesis-assessment.md), [6er-](m7-six-text-dissent-current-20260927-v1/synthesis-assessment.md), [Zweier-](m7-notation-derivative-two-current-20260927-v1/synthesis-assessment.md), [Q2-Quellen-/Prüfungs-](../2026-09-24/m7-q2-volume-two-source-route-current-20260924-v2/audit-20260927.md) oder [GK/LK-Projektionsfrage](m7-q4-lk-gk-projection-audit-20260927.md) auflösen. Eine korrigierte `partial`-Quellenkante ist noch kein voller D-Beleg. |
| Scheinbar kleines Text-Delta, aber Struktur-HOLD | 1 | `baf7276f` | **Nicht** isoliert in D schließen: Das Ziel „Schnittpunkte von Geraden mit Ebenen“ (GK/LK) ist nahezu deckungsgleich mit `3def350a…` und verlangt direkt das nur für LK markierte `36e0de23…`. Die [Machbarkeitsprüfung](m7-three-small-d-text-revision-feasibility-20260927.md) hält es deshalb getrennt. HE Q2.3 ist `exact` dem Nachbarziel zugeordnet, nicht `baf…`; BB bildet beide nur partiell auf denselben Quellaspekt ab. Zuerst Identität, Geltung und Lernweg prüfen; nur bei eigenständigem Ziel die eindeutige Schnittlage eng zweisprachig präzisieren und aktuelle D/P/A/M/V-Bindungen prüfen. |

Die Gruppen sind disjunkt und summieren sich auf **29 + 12 + 14 + 1 = 56**.
Unter den 27 bereits bildbereiten D-Holds liegt damit **kein** bedenkenloser
Ein-Zeilen-KEEP. Besonders `baf7276f…` wäre als bloße sprachliche Korrektur
ein Scheinerfolg: Sein Duplikat- und LK-Vorbedingungsproblem bliebe bestehen.

## Zusätzliche Bilder nur nach Strukturentscheid

Für sechs fachlich vorgeschlagene, **noch nicht kanonisch beschlossene**
Splits liegen inzwischen zwölf bedingte Kindbild-Prompts unter
`tmp/math-m7-image-prompts-2026-09-27/PLANNED_SPLIT_PROMPTS.md`:
Prisma, Kugel, J9-Vektoroperationen, J7-Kreisrand/-fläche,
J9-Raumabstand/Mittelpunkt und J10-Funktion/Ableitung. Die
[Prisma-/Kugel-Wirkungsanalyse](m7-vready-remainder19-recheck-20260927-v1/geometry-split-impact-and-image-candidates.md)
ist gesondert dokumentiert. Für vier mögliche enge Reword-Fälle liegen
weitere bedingte Prompts vor. Die zwei übrigen Struktur-/Identitätsfälle
`972cc7e8…` und `f37b0a72…` haben noch keine fachlich belastbare
Kindgrenze, daher wäre ein konkretes Bildmotiv eine Vorfestlegung.

Keines dieser bedingten PNGs gehört zu den 37 **aktuell** V-offenen
Zielen. Neue Kinder brauchen eigene Quellenscopes, D/P/A/M/V-Nachweise
und eine Regel für vorhandene Lernerfolge; bestehende Altbild-Freigaben
wandern nicht automatisch.
