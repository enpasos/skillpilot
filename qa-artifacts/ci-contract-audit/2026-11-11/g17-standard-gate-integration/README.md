# Standard-G17-Gate mit allen reparierten Fachdaten: integrierter Lauf

Stand: 11. November 2026, [Daten-PR #121](https://github.com/enpasos/skillpilot/pull/121),
Branch `fix/g17-remaining-protected-prerequisites-v8-data`, integrierter Head
`d5fd1dc848` (Merge aus Datenstand `672a79fea2` und Wirtschaftshead
`40be10d3ce`, der das Gate aus PR #119 enthält).
**Das Gate und sämtliche reparierten Daten bestehen gemeinsam den normalen
21er-Producer und alle zehn unveränderten Floors. Frische vollständige
Remote-CI an diesem Head und die Main-Lieferung bleiben offen.**

## Was ausgeführt wurde

Der [Receipt](receipt.json) enthält die echten Exitcodes eines einzigen
zusammenhängenden Laufs im sichtbaren Checkout:

| Schritt | Kommando | Exit | Dauer |
| --- | --- | ---: | ---: |
| Core-Regression | `tsx scripts/testTransitiveMinimality.ts` | 0 | 2,102 s |
| CLI-Regression (13 Tests) | `tsx --test scripts/testTransitiveMinimalityCli.ts` | 0 | 12,838 s |
| Integritätsregression (14 Tests) | `tsx --test scripts/testCurriculumGraphIntegrity.ts` | 0 | 8,777 s |
| Normaler Producer samt Vorlauf und öffentlichem V8-Proof | `npm run quality:curriculum-status` | 0 | 1.478,919 s |
| Unveränderte Untergrenzen | `npm run check:curriculum-maturity-floors` | 0 | 0,713 s |

Die Floorprüfung lief unmittelbar nach dem Producer auf dessen frisch
geschriebenem Bericht. Für sich allein ist sie kein Nachweis, weil sie den
eingecheckten Bericht nicht gegen die Daten prüft.

Der Lauf startete auf dem noch nicht committeten Mergestand (`headAtStart`
`672a79fea2`, `mergeHeadAtStart` `40be10d3ce`). Die 39 benannten Eingaben
blieben während des Laufs unverändert und stimmen bytegenau mit den Blobs des
Mergecommits `d5fd1dc848` überein; die beiden eingecheckten Statusberichte sind
die unveränderte Producerausgabe. Ein geschlossener Dateizugriffsraum wird
nicht behauptet.

Der Merge hatte genau zwei Konflikte, beide in den generierten Statusberichten.
Sie wurden nicht von Hand zusammengeführt, sondern durch diesen Producerlauf
neu erzeugt. Gegenüber dem Datenstand ändert der Merge sieben Dateien unter
`app/`, die zwei Statusberichte und fünf Belegdateien des Gates; keine Datei
unter `curricula/` oder `backend/`. Die native Abnahme des Datenstands wurde
deshalb nicht wiederholt.

## Ergebnis unter dem Gate

Alle 21 Kataloge wurden ausgewertet. Die zehn geschützten Fächer bestehen
CQR-001 mit null Minimalitäts-, Normalform- und Typbefunden:

| Fach | Ergebnis mit G17 | Geschützte Untergrenze | Authored `requires` der geprüften Hülle |
| --- | --- | --- | ---: |
| Mathematik | M7 | M7 | 1.562 |
| Physik | M7 | M7 | 1.722 |
| Chemie | M7 | M7 | 1.283 |
| Biologie | M7 | M7 | 884 |
| Wirtschaftswissenschaften | M7 | M7 | 852 |
| Deutsch | M6 | M6 | 522 |
| Latein | M6 | M6 | 765 |
| Geschichte | M6 | M6 | 577 |
| Informatik | M6 | M6 | 654 |
| Politik und Wirtschaft | M6 | M6 | 1.142 |

Geschichte, Informatik, Latein sowie Politik und Wirtschaft standen im
[Zwischenlauf des Gates](../g17-standard-milestone-gate/README.md) ohne ihre
Reparaturen noch auf M0 und erreichen jetzt wieder M6.

Die elf übrigen Kataloge bleiben M0 und erhalten kein Aufstiegsziel. Ihre
offenen Graphfehler erscheinen als `fail`, nicht als bestanden:

| Katalog | CQR-001 | Befund |
| --- | --- | --- |
| Chinesisch | fail | ungültiger Graph: effektiver `requires`-Zyklus |
| Französisch | fail | ungültiger Graph: effektiver `requires`-Zyklus |
| Griechisch | fail | ungültiger Graph: effektiver `requires`-Zyklus |
| Gymnasium (Deutschland) | fail | ungültiger Graph: übernimmt den Zyklus aus Griechisch |
| Englisch | fail | 111 Befunde (66 Minimalität, 45 Normalform) |
| Musik | fail | 53 Befunde (10 Minimalität, 43 Normalform) |
| Spanisch | fail | 93 Befunde (32 Minimalität, 61 Normalform) |
| Italienisch, Polnisch, Russisch, Tschechisch | pass | je null Befunde bei drei bis sechs Kanten; weiterhin M0 |

Die vollständigen Zeilen je Katalog stehen in
[graph-integrity-by-catalog.json](graph-integrity-by-catalog.json).

## Vergleich mit dem Bericht ohne Gate

Der [Berichtsvergleich](comparison.json) gegen den Statusbericht des
Datenstands `672a79fea2` zeigt dieselben 21 Fachstände: fünf M7, fünf M6 und
elf M0. Die Regelsummen ändern sich von 235 pass, 18 warn, 4 fail,
65 not_configured auf 228 pass, 18 warn, 11 fail, 65 not_configured; die
sieben zusätzlichen Fehler sind genau die CQR-001-Zeilen der sieben oben
genannten Kataloge. Außerhalb der CQR-001-Zeile je Katalog, des
CQR-001-Eintrags im Regelkatalog, der Regelsummen und des Erzeugungszeitpunkts
sind beide Berichte strukturell identisch. Der gebundene Registerstand
`sha256:430d0f97…8ba518` mit 1.465 betroffenen Zielen bleibt gleich.

Keine Untergrenze, Ausnahme, Ignorierliste oder Warnungsbaseline wurde
geändert oder eingeführt; `curriculum-maturity-floor-policy.json` gehört zu
den unverändert gebundenen Eingaben.
