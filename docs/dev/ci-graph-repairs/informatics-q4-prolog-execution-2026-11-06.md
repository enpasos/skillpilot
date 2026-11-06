# Informatik-Q4: tatsächliche Ausführung der Referenzprogramme

Beide eingefrorenen Referenzprogramme wurden mit einem tatsächlichen
SWI-Prolog-Interpreter geprüft: **40 Abfragen bestanden**, einschließlich
Antwortreihenfolge, Backtracking, Negativfällen, Listen, einfachen Pfaden,
Cut und der Instantiierungsgrenze der Arithmetik. Getrennte private Kopien
prüfen den ausdrücklich verlangten Austausch des Clara-Ausweisfakts und
ein zusätzlich geöffnetes Tor. Die ursprünglichen Programme bleiben bytegleich.

Der [vollständige Ausführungsbeleg](informatics-q4-actual-prolog-execution-2026-11-06.json)
enthält jede tatsächlich gelesene Antwort, die Programm- und Verifierhashes
sowie den geprüften Paketbezug. Ubuntu `swi-prolog-core` Version
`8.4.2+dfsg-2ubuntu1` wurde gegen den konfigurierten Paket-SHA geprüft und nur
privat extrahiert; es erfolgte keine Systeminstallation.

Der [lesende Verifier](verify_informatics_q4_prolog.py) verlangt einen echten
Interpreter. Er besitzt keinen Ersatzmodus, der ein Python-Faktenmodell als
Prologausführung ausgibt. Mit installiertem `swipl` genügt
`python3 -B docs/dev/ci-graph-repairs/verify_informatics_q4_prolog.py`.
Eine privat extrahierte Installation kann über `--swipl`, `--home` und
`--library-path` gewählt werden.

Die früheren Inhaltsreviews bleiben unverändert: Deren damalige Aussage,
noch keine Interpreterausführung vorgenommen zu haben, war richtig. Dieser
spätere Beleg ergänzt sie. Er ist keine menschliche Erprobung, Prüfungsfreigabe,
Lernerleistung oder Runtime-Abnahme. Beide Taskkandidaten bleiben getrennte,
noch nicht angewandte Entwürfe; ihre Voraussetzungspfade benötigen nach den
inzwischen tatsächlich angewandten Grundlagenkorrekturen einen neuen Abgleich.
