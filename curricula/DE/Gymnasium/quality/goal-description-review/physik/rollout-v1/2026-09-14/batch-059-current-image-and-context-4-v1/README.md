# Physik B059: zwei Abschlüsse, zwei offene Bildfälle

Pausierter Teilabschluss nach ausdrücklichem Nutzerauftrag vom 14. September
2026. Zwei voneinander getrennte Blindrunden prüften die vier aktuellen
Beschreibung-/Seiten-/Kontext-/Bildbindungen. Ihre acht vollständigen
Originalrecords und die [vollständige Dual-Summary](dual-summary.json) bleiben
erhalten. Kein zusätzlicher Review wird aus dieser Dokumentation gestartet.

| Ziel | Ergebnis im Teilabschluss |
| --- | --- |
| `7d78da7f-6af5-440a-9d6b-6cab4bee8dd2` Kernreaktionsenergie | KEEP/KEEP; D-Bindung an das bereits korrigierte Alpha-Bild wiederhergestellt. Evidenz A macht die vollständigen Ruhemassensummen ausdrücklich. Vorhandenes P-Profil unverändert. |
| `7d4d6a39-0c78-5fb0-b7bf-182ed00972f7` Transistor | KEEP/KEEP; D-Bindung an die aktuelle Voraussetzung wiederhergestellt. Evidenz B bleibt beim gewählten npn- oder pnp-Typ; As verpflichtender komplementärer Typwechsel bleibt als abgelehnter Umfangsdissens dokumentiert. Der P-Kontext wurde separat informiert geprüft. |
| `206fe51d-cc78-5422-b139-32cc97eb1c37` HRD | Offen: A BLOCK, B KEEP mit Bildwarnung. Numerische Achsenfehler bleiben ungelöst; zwei neue Bildkandidaten wurden verworfen. Keine Resolution. |
| `e2014db8-c97f-5ce1-82c5-2a42741f4a61` Habitabilität | Offen trotz KEEP/KEEP: missverständlicher Maskenzeiger im aktiven Bild. Ein Korrekturkandidat liegt vor; unabhängige Integrationsprüfung, Import und neue Bildbindung fehlen. Keine Resolution. |

Der [Teilindex](accepted-two/resolution-index.json) enthält exakt Alpha und
Transistor. Er verwendet den vorhandenen nativen Aggregate-Index für einen
Teilbestand; das vollständige Viererpaket wird nicht künstlich als abgeschlossen
finalisiert. Jeder einzelne Abschluss besteht die unveränderte native
Dual-KEEP-Validierung. Der Vorbereitungsnenner wird aus aktuellen autoritativen
`curricularAtomic`-Entscheidungen abgeleitet; der zentrale Fünf-Gate-Bericht
berechnet den aktuellen Gesamtfortschritt unabhängig davon neu.

[Synthesevorlage](accepted-two/synthesis-authoring.json) und
[Prüf-/Ausschlussbeleg](accepted-two/synthesis-and-exclusion-receipt.json)
halten Quellen, Laufzeiten, Prompt-/Parameterdigests, die aktuelle Bildprüfung
und den informierten Auswahlentscheid fest. Es wird keine Provider-/Modelldiversität
behauptet. Die Synthese ist `ai_synthesis`, `humanAttestation: null`, keine
menschliche Freigabe oder beobachtete Lernendenleistung. Zwei laufzeitlich
getrennte Erstprüfungen sind kein Nachweis unabhängiger Modellfamilien.

Prüfen ab Repository-Root:

```bash
npm --prefix app run quality:goal-description-rollout-batch -- check --config curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-14/batch-059-current-image-and-context-4-v1.config.json
app/node_modules/.bin/tsx curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-14/batch-059-current-image-and-context-4-v1/accepted-two/materialize.mts
npm --prefix app run quality:deep-understanding-rollout:check
```

Der Materializer prüft vorhandene Dateien und schreibt ohne `--write` nichts.
Auch mit `--write` darf er nur fehlende eigene Ergebnisdateien anlegen; vorhandene
Artefakte müssen bytegleich bleiben. Kanonische Ziele, Graphkanten, aktive Bilder,
Prüfgrenzen und historische Reviews wurden in diesem Paket nicht geändert.

Das In-flight-Ledger konserviert die sechs offenen Physikziele in zwei
Zuständigkeitsdateien (diese zwei Bildfälle sowie Strömung, Transit,
Radialgeschwindigkeit und Milchstraße). Das Ledger bedeutet keine laufende
Bearbeitung. Weitere QS erst nach ausdrücklicher Wiederaufnahme.
