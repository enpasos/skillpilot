# Mathematik: tatsächlicher nativer Graph-Vorher-/Nachher-Nachweis

Der unveränderte `checkSkillGraphIntegrity(catalog, [Math-ID])` wurde wie im regulären `generateCurriculumQualityStatus.ts` aufgerufen. Der Dateisammler wurde exakt mit dem Original verglichen; alle 21 tatsächlichen kanonischen CQR-Eingaben bildeten den Katalog (6.524 Ziele). Nur die Mathematik-Daten wurden im Nachher-Katalog im Speicher durch den geprüften e4de-Kandidaten ersetzt. Aktive Daten wurden nicht geschrieben; Git wurde nicht verwendet.

| Tatsächlicher Befund | Vorher | Nachher |
| --- | ---: | ---: |
| Befunde gesamt | 919 | 916 |
| G17 | 917 | 914 |
| G01a | 2 | 2 |
| authoredRequires | 2.454 | 2.451 |
| effectiveRequires | 2.485 | 2.482 |
| atomicRequires | 2.479 | 2.476 |
| geprüfte Ziele | 1.253 | 1.253 |

Alle 10 Checks wurden ausgeführt: jeweils 8 pass und 2 fail; `ok=false` bleibt bestehen. Der gewählte ganze Mathematikroot enthält 1.252 Mathematikziele und einen importierten Vorfahren aus der Overview-Landschaft. Das ist keine Aussage über einen einzelnen persönlichen Lernfokus.

Genau drei G17-Befunde entfallen, kein Befund kommt hinzu. 915 gemeinsame Befunde sind vollständig identisch; ein weiterer bestehender G17-Befund bei `4b67bed9-06da-40b2-a306-24e9e7dfd390` behält dieselbe Identität und Nachricht, wechselt aber den Witness-Zwischenknoten von `d07ef7b1-8bd2-56e0-9e74-d90c3c3e02fe` zu `d825f7ce-e19b-594a-8181-eff199c21d93`. Das vollständige Delta steht in `findings-delta.json`.

Die drei entfernten Anforderungen sind in `graph-field-delta.json` vollständig aufgeführt: Ganze Zahlen ordnen → Sek-I-Motivation; Diagramme deuten → Sek-I-Motivation; Einfache inverse Matrizen → Sek-II-Motivation. `source-field-delta.json` enthält alle 10 tatsächlichen Feldänderungen einschließlich der zwei Diagrammbeschreibungen und fünf Bildmetadatenkorrekturen; keine generelle Gleichheit anderer Felder wurde vorausgesetzt.

Die verbleibenden G01a-Fehler betreffen dieselbe fehlerhafte UUID `99ef0fc2-150a-51e8-bac8-7e40e46917b`: das Ziel selbst (`INVALID_GOAL_UUID`) und die `contains`-Referenz von `1f89d69e-ead1-424b-8221-fae37fdea2bc` (`INVALID_REFERENCE_UUID`).

`inputs.before.json` und `inputs.after-and-guards.json` belegen abschließend dieselben 21 Dateien und Hashes: aktive Mathematik weiterhin `da4724ae0db70d85cae68eb273df663f59b17b2ca761a86181fa462299a123b6`, Kandidat `e4de3c3e3a294a1751d7ebcd70fa4e63a457a63e51016996055c0e78f4510a06`. Auch Produzent und Graphprüfer blieben unverändert. Der Guard gilt für den dokumentierten Probezeitpunkt; das Versiegeln liest danach nur die aufgenommenen Daten.

Beide vollständigen unveränderten Native-Rawreports und der exakte Kandidat sind verlustfrei gzip-komprimiert. Hashes der dekomprimierten Native-Rawreports und des Kandidaten stehen in `receipt.json`; der Artefaktmanifest bindet alle Paketdateien. `probe.executed.mts`, stdout und stderr dokumentieren den tatsächlichen Lauf. Ein erfolgreicher Probeprozess bedeutet erfolgreiche Ausführung und unveränderte Eingaben; die Graphbefunde bleiben fail.

Dies ist ein globaler Autoren-Graphnachweis. Er ersetzt keine scopeabhängigen Runtime-Nachweise, keinen vollständigen CQR-/Deep-Integrationslauf und keine Gesamt-M7-Abnahme.
