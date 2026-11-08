# Pflege des Math-Standalone-Planchecks — 9. November 2026

Der unveränderte Aufruf `npm run check:full-standalone-mathematik-plan` scheiterte
auf Parent `93678a182e` konkret mit
`Expected entry count 1060, got 1061.`. Der bestehende Builder führt dabei
seine drei realen Modell-, Redistribution- und Source-Prüfer unverändert aus.

Ein anschließender echter `--plan-only`-Aufruf ohne Erwartungswerte, mit demselben
Release-Root und denselben sonstigen Defaultoptionen, misst den aktuellen Plan.
Aus diesen Messwerten werden ausschließlich drei Erwartungsliterale im
genannten Scriptwert in `app/package.json` angeschlossen:

| Erwartung | Vorher | Tatsächlich gemessen |
| --- | --- | --- |
| `--expect-entry-count` | `1060` | `1061` |
| `--expect-manifest-file-count` | `1058` | `1059` |
| `--expect-content-digest` | `sha256:ce49ec9492e14ae133bcda7bd831a9494b1d04c3376437f1863c057dfe5fa1ba` | `sha256:5d3cf9c732f2417fd4fd3df95eef7496a80ab05555bc7f34c6f6481d3540213d` |

Der Binärasset-Pin bleibt bei 836. Der gemeinsame
Modell-Digest wird vom vorhandenen Semantic-Content-Index übernommen; er ist
kein ZIP-Digest. Die alte Digestabweichung ist durch den Messwert und die
unveränderte CLI-Vergleichslogik belegt. Der ursprüngliche Lauf selbst scheiterte
zuerst am Entry-Zähler; ein gesonderter Digest-Negativlauf wird nicht behauptet.

Alle anderen JSON-Werte und das Lockfile bleiben identisch. Math-Raw `664b6d15…`,
Registry `94f65d33…`, Proofcode `cf5f36bc…`, Ledger `da76a787…`, Shell `2e6ca8ae…`,
alle kanonischen Dokumente, Math-Views, Source-Review und Source-Report bleiben
unverändert gebunden. Alle 836 vollständigen Assetrecords und vier Klassenrecords
sowie 839 offene Redistributionsprüfungen, null menschliche Freigaben in diesem
Rechte-Ledger und `publicationReady: false` bleiben erhalten. Es gibt keine
Rechte-, Quellen-, Fingerprint- oder fachliche Neubindung.

Es wird ausschließlich ein Plan geprüft: keine ZIP-Erzeugung und keine
Assetmaterialisierung. `app/package.json` gehört nicht zu den 32 Eingaben des
letzten regulären CQR-Laufs; alle 32 Hashbindungen stimmen weiterhin, daher
wurden CQR-Produktion und die schon gebundenen langen Prüfungen nicht wiederholt.
Der [kompakte Receipt](https://github.com/enpasos/skillpilot/blob/main/qa-artifacts/ci-contract-audit/2026-11-09/g17-math-standalone-plan-pin/receipt.json)
bindet alten Gitblob, Alt-/Neucommand, Messplan, vollständige Eingabehashes,
Logs und tatsächliche Ausführungsstände.

Der korrigierte unveränderte npm-Caller ist mit Exit 0 bestanden. Genau die drei notwendigen Stufen wurden ausgeführt: ursprünglicher Caller mit konkretem Fehler, realer Messplan ohne Erwartungswerte, korrigierter Originalcaller. Es gab keinen zusätzlichen Lauf nur mit dem alten Digest. Die vorigen Parent96-/Math-Daten- und Prüfbelege werden damit weder rückwirkend verändert noch neu ausgeführt. Remote-CI bleibt ein eigener Nachweis.
