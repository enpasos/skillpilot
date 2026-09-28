# Zwei Funktionsziele: aktuelle D-Seitenbindung

Dieses Paket isoliert die zwei in der alten Neunerrunde inhaltlich
übereinstimmenden `keep`/`keep`-Fälle:

- `7feaaebd-cc8d-522b-8b3a-ea22675c65dd` — Extremstellen parameterabhängig untersuchen;
- `e33e75e3-eae5-5a09-862f-d1a11176373f` — Transformationsscharen bekannter Funktionsklassen untersuchen.

Die alte Neunerrunde unter `2026-09-24/m7-vready-geometry-functions-open-nine-current-20260924-v2/`
erwartet exakt `bundle/book.pdf` mit `sha256:839e6e93aa174dd0f6ae6155a56cc5d176dae8e50c7ba7c2efb116b3a328e565`.
Die lokal verbliebene, ignorierte PDF-Datei hat dagegen
`sha256:773c5034b08f73b8bff6ff663abf56d476c190226328dc9d8e2b864f27bbb065`.
Die ursprünglichen Review-Records und Receipts bleiben unverändert; ein
Hash-Austausch würde keine gültige Seitenprüfung herstellen.

Das neue Bundle und die unabhängig angelegten Runden A/B sind mit der
aktuellen kanonischen Landschaft erzeugt. Beide Ziel-Fingerprints sind zum
alten Bundle unverändert, die Seiten-Fingerprints durch die neue
Zweierauswahl hingegen neu. `quality:goal-description-rollout-batch check`
besteht für das vorbereitete Paket. Es liegen noch **keine** frischen
Review-Records für diese Seiten vor. Die früheren inhaltlichen KEEP-Befunde
sind Kontext, aber keine formal gültigen Stimmen in diesem Bundle.

Nächster Schritt: Die beiden neuen Seiten von zwei unabhängigen Runden
prüfen lassen, Ergebnisse gegen die Kampagnen validieren, Dissens gezielt
synthetisieren und erst dann Resolutionen materialisieren. Die ignorierte
`bundle/book.pdf` muss bei einer Übernahme explizit in Git aufgenommen
werden; ohne diese exakten Bytes ist das Paket nicht CI-reproduzierbar.
Bis dahin beträgt der strenge Nettozuwachs **0**.
