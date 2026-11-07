# Source-A: vollständiger Quellenbeweis auf feca

Der unveränderte v1-Generator und der unabhängige vollständige Verifier bestehen gegen Git `feca58176fc2c1d86360c7d00d4bb0506c497335`: 593 Quellen, 8.601 gebundene Dokumente und dieselben 164 Identitätsregeln. Der [JSON-Beleg](source-identity-feca-source-rebase-2026-11-07.json) enthält beide tatsächlich terminalen Aufrufe, Logs, sechs unveränderte Vertragsbindungen und die vollständige Dokumentdelta-Liste.

Gegenüber dem verifizierten db9c-Stand sind der gesamte Katalog, alle Regeln und sämtliche 8.591 bisherigen Dokumentbindungen exakt gleich. Zehn neue historische Belege fallen unter die bestehende unveränderte Archivregel und bleiben bytegleich erhalten. Kein Dokument entfällt; es gibt keine neue Ausnahme oder Warnungsbaseline.

Der vorherige [cb128-Lauf](source-identity-cb128-source-rebase-failure-2026-11-07.md) bleibt ausdrücklich rot. Die [nachfolgende Zwei-Log-Archivierung](source-identity-cqr104-two-log-archive-application-2026-11-07.md) erhält die Rohlogs und ihre alten Dateilocators einschließlich aller Fehler und sieben Floorverletzungen. Auf dem danach festgelegten neuen Commit wurde der Gesamtbeweis tatsächlich neu erzeugt und unabhängig geprüft.

Der [verlustfrei komprimierte Originalbeweis](https://github.com/enpasos/skillpilot/blob/feat/skill-graph-ci-contracts/qa-artifacts/ci-contract-audit/2026-11-07/source-bijection-feca58176f-2026-11-07.proposal.json.gz) hat Roh-SHA `21cb578e9bb8b2f320c8748b9c7de0acc3f56f4d0d389036995d155bb43c733c`; die Quellenprojektion ist `06cb7c9757a98b2ffb5efa83ab942fb970946b41cc09f79326efd0564b31ece2`. Für den unveränderten CLI ist die Gzipdatei in eine eigene temporäre JSON-Datei zu dekomprimieren. Der Roundtrip wurde vollständig geprüft.

Das ist ein vollständiger Quellenpass dieses festen Checkpoints. Die physische Original-/Kandidaten-QA, vollständige Leseauthentisierung, Producer-/Subprozessintegration und alle geschützten Fachfloors sind damit nicht abgeschlossen. Es wurde keine Quelle, aktive QA, Lernzustand oder A/B-Laufzeit aktiviert.
