# Mathematik M7 – J10 Funktionen und Gleichungen: P-v2-Kandidaten

Dieses Paket enthält **18 aktuelle KI-Kandidaten** für positive-understanding-evidence-v2. Es ist noch **nicht** in der zentralen Fünf-Gate-Registry registriert. `needs_human_review` / `ai_candidate` ist der wahrheitsgemäße Evidenzstatus, keine menschliche Freigabe und keine Aussage über die Leistung eines Lernenden. M7 kann nach der geltenden maschinellen Regel unabhängig von einer späteren menschlichen Freigabe geprüft werden.

Die Auswahl ist das zusammenhängende J10-Paket zu Exponential- und Polynomfunktionen, Ableitungsanwendungen und Gleichungen. Sie verwendet die aktuellen `curricularAtomic`-Ziele, ihre DE-/EN-Beschreibungen und direkten Voraussetzungen, die bestehenden Quellen-/Geltungsbindungen und die aktuell hashgebundenen Primärbilder. Gute Bilder bleiben unverändert. Die P-Profile fordern je Ziel zwei eigenständige Fälle mit fachlich relevanter Variation; sie fügen keine kanonischen Kompetenzen hinzu.

## Für P-v2 als KI-Kandidaten angenommen

| Bereich | Exakte Ziel-IDs |
| --- | --- |
| Exponentialfunktionen | `31207307-0cf9-4a56-bf14-90196dc2b3d4`, `c74d0c7e-44e2-46ab-8f95-b8dc45fcfae7`, `42e19186-6769-41ac-a7bf-ab39bdb50661`, `3c1d6ce7-099e-4267-9ff2-3d1526209a89`, `3010d965-b9b9-4dc5-9d04-d706725e9a30` |
| Polynome | `15ce2a7e-a5dc-44f7-8a5e-6d04dd81db12`, `283ec44e-747c-55e3-9a61-4a4cc70ebfab`, `0190e463-51a7-4860-9b35-d875530a85ba`, `1ce8af38-082a-477b-af48-b924c92761bf` |
| Ableitungen | `9f2fc0d1-e1e7-4051-ba70-87ba1dd8dd1c`, `1a18dbb3-f350-4766-9c8b-20ca018ccef1`, `b43a1e45-f05c-4d78-8453-f6fa677dc24c`, `06bdbecb-53e0-5ac3-992f-d6fd20555b59`, `ad66009f-55fb-563f-ace0-dbfeae7c76c3`, `f76d00dc-6b31-59cd-b01a-3610eadc9908` |
| Gleichungen | `14d0e697-3fb0-5074-a08c-7e01ca9bbda8`, `d0db87c4-36f5-5ac6-8428-da96d31b253a`, `2bd88d66-5daf-53bb-aa02-4c010963679d` |

## Grenzfälle und Prüfschranken

- **Keine P-Holds innerhalb dieser 18.** Die zwei weit formulierten Ziele `1ce8af38-082a-477b-af48-b924c92761bf` und `1a18dbb3-f350-4766-9c8b-20ca018ccef1` bleiben ausdrücklich auf die im kanonischen Text genannten *einfachen Fälle* begrenzt. Ihre Profile dokumentieren die Grenze in `dissent`; insbesondere wird keine vollständige Kurvendiskussion behauptet. Die unabhängige Integrationsprüfung kann diese Entscheidung zurückstellen.
- Die ältere, am 21.09. erzeugte Quellenrationalen-Ausgabe kennzeichnet `31207307-0cf9-4a56-bf14-90196dc2b3d4`, `c74d0c7e-44e2-46ab-8f95-b8dc45fcfae7`, `42e19186-6769-41ac-a7bf-ab39bdb50661`, `15ce2a7e-a5dc-44f7-8a5e-6d04dd81db12` und `1ce8af38-082a-477b-af48-b924c92761bf` als `classic_source_partial`. Diese P-Profile behaupten deshalb keine zusätzliche Bundesland- oder Quellenabdeckung; der aktuelle A-Gate und seine Quellbindungen bleiben getrennt maßgeblich.
- Für alle 18 ist das aktuelle öffentliche Bild bytegleich zum `assetSha256` und `aiApprovedAssetSha256` der Mathe-Bild-QA, jeweils `aiApproved: yes`. Alte Felder wie `contentApprovedChatGpt` sind bei einzelnen Datensätzen nicht das neue M7-Freigabesiegel. Eine spätere Bild- oder Beschreibungsänderung erfordert gezielte erneute Bindungsprüfung.
- Eine zentrale Registrierung, ein D-Abschluss und eine streng abgeschlossene Fünf-Gate-Zählung folgen aus diesem Paket allein **nicht**.

## Reproduktion

```bash
node curricula/DE/Gymnasium/quality/goal-evidence/m7-j10-functions-equations-20260923-v1/author-candidates.mjs
npm --prefix app run quality:positive-goal-evidence-candidates -- --config curricula/DE/Gymnasium/quality/goal-evidence/m7-j10-functions-equations-20260923-v1/positive-evidence.config.json --candidates curricula/DE/Gymnasium/quality/goal-evidence/m7-j10-functions-equations-20260923-v1/positive-evidence.candidates.json --write
npm --prefix app run quality:positive-goal-evidence:check -- --config=curricula/DE/Gymnasium/quality/goal-evidence/m7-j10-functions-equations-20260923-v1/positive-evidence.config.json
```

Lokales Ergebnis am 23.09.2026: 18 konfiguriert, 18 aktuelle `ai_candidate`-Profile, 0 menschlich genehmigt, 0 formal blockierende Probleme. Die fachliche Selbstprüfung der zwei Transferfälle pro Ziel und der Grenzfälle ersetzt keine unabhängige Gesamtprüfung vor der Registry-Aufnahme.
