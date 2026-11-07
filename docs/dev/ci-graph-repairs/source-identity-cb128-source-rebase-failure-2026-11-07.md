# Source-A auf cb128: zwei echte unklassifizierte Eingaben

7. November 2026. **Der vollständige unveränderte v1-Generator endet mit Exit 1.**
Der feste Commit ist `cb1289bf067fb9831ef855685daa8b0ab4e6aa96`; der später von
Root gesicherte V-Codecheckpoint gehört nicht zu diesem Lauf.
Der [Einzelbeleg](source-identity-cb128-source-rebase-failure-2026-11-07.json)
bindet den wirklichen Aufruf, den terminalen Fehler und die exakten Gitbytes.

Vor und nach dem Lauf stimmen alle sechs v1-Vertrags-/Implementierungsdateien
mit ihren bisherigen db9c-Pins und den Dateien im festen cb128-Commit überein.
Der geschlossene Prüfer weist genau zwei Eingaben zurück:

| Pfad unter `docs/dev/ci-graph-repairs/` | Tatsächlicher SHA-256 | Bytes |
| --- | --- | ---: |
| `cqr104-current-cqr-2026-11-06/floors.txt` | `742c0ce22cedb101a40b34f63f51db42c1c2f40726e141522c85f501921c4099` | 73.230 |
| `cqr104-current-cqr-2026-11-06/producer.txt` | `6cfa6a6670faef00b668fd3e0f9d7459af320db915d4239173439b5d2674101c` | 262.861 |

Beide Fehler lauten `Unclassified document containing a migration identity`.
Ihre tatsächlichen Gitbytes und einzelnen Treffer sind im
[getrennten Fehlerpaket](https://github.com/enpasos/skillpilot/tree/feat/skill-graph-ci-contracts/qa-artifacts/ci-contract-audit/2026-11-07/source-identity-cb128-source-rebase-failure)
gesichert. Die ursprünglichen Dateien blieben an ihrem Ort und bytegleich;
dieser Nachweis verschiebt oder klassifiziert sie nicht.

Es entstand kein Manifest. Deshalb gibt es keinen neuen Roh-/Projektionshash
und keine daraus ausgegebenen neuen Quellen-/Dokumentzahlen. Der vollständige
Verifier wurde nicht mit einem fehlenden oder umbenannten Vorgängerartefakt
aufgerufen. Der [erfolgreiche db9c-Beweis](source-identity-db9c-source-rebase-2026-11-06.md)
und der [A/M-Mechanikstand](source-identity-am-review-slice-mechanics-2026-11-07.md)
bleiben getrennte historische Eingaben.

Eine Entscheidung über die beiden exakten historischen Logdateien ist der
nächste gesonderte Schritt. Hier wurden weder Schema, Registry, Baseline noch
Archivlocators geändert. Es gab keinen physischen Kandidatenpaarlauf, keine
Kandidaten-QA und keine A/B-, LearnerState-, Mastery- oder Laufzeitaktivierung.
