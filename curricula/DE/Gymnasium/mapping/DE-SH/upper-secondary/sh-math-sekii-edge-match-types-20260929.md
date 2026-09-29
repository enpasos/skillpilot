# SH Sek II: kantenbezogene Zuordnungsart für K017 und T064

Die Quellen-/Stufenprüfung vom 29.09.2026 ergänzt für die Quellenziele
`SH-SEKII-L4-FUNKTIONALER-ZUSAMMENHANG-K017` und
`SH-SEKII-L4-FUNKTIONALER-ZUSAMMENHANG-T064` jeweils eine partielle Kante zu
`ad66009f-55fb-563f-ace0-dbfeae7c76c3`. Die Originalbindung und der fachliche
Umfang sind in der [Quellen-/Stufenentscheidung](../../mathematik-j10-analysis-source-stage-decisions-20260929.md)
beschrieben. Die vorhandenen Kanten zu `b3604df4-15a8-41c8-a8b0-50dadd698bd3`
bleiben mit ihrer bisherigen Zuordnungsart `exact` erhalten.

Beide Entscheidungen enthielten zusätzlich ein gemeinsames `matchType: exact`.
Der Release-Compiler gibt diesem Entscheidungsfeld Vorrang vor den einzelnen
Mappingzeilen und veröffentlichte dadurch auch die beiden neuen partiellen
Kanten als exakt. Die Korrektur entfernt ausschließlich das gemeinsame Feld
dieser zwei Entscheidungen. Die vier bestehenden Mappingzeilen liefern damit
ihre bereits verfassten kantenbezogenen Werte über den vorhandenen, bei
fehlenden Angaben abbrechenden Fallback. Quellen, Ziel-IDs, Kantenmenge,
Rationales und sämtliche anderen Entscheidungen bleiben unverändert.

## Gezielte Prüfung

- Der produktive `compile_mapping_source_lane` wurde auf die reale SH-Sek-II-
  Collection angewendet: Die beiden alten Kanten bleiben `exact`, die beiden
  neuen Kanten werden `partial`.
- Eine ausschließlich im Speicher rekonstruierte Vorher-Variante mit den zwei
  gemeinsamen `exact`-Feldern verletzt genau die beiden neuen erwarteten
  `partial`-Werte. Alle anderen SH-Kanten und alle ausgegebenen SH-Quelldokumente
  und Source-Ziele sind zwischen beiden Varianten identisch.
- Alle 31 realen Mapping-/Quellen-Collections bestehen die Compilerprüfung
  ihrer Identitäten, amtlichen Quellenangaben, vollständigen Source-Zieldeckung,
  kanonischen Zielreferenzen und auflösbaren Zuordnungsarten.
- `npm --prefix app run quality:source-coverage-evidence:test`: 6/6 bestanden.

Die Gesamtdiagnose nach dieser Korrektur lautet: 10.022 Input-Entscheidungen,
32.948 Entscheidungskanten, 32.900 redundante Mappingkanten, 9.978 Source-Ziele,
177 explizite Entscheidungs-/Zeilenkonflikte und 2.251 kantenbezogen abgeleitete
Zuordnungsarten. Es bleiben 48 Entscheidungskanten ohne redundante Mappingzeile
und 0 unaufgelöste Zuordnungsarten. Gegenüber dem unmittelbar vorherigen Stand
sinken die Konflikte um zwei und steigen die abgeleiteten Zuordnungsarten um
vier; alle übrigen Zähler bleiben gleich.

Dies ist eine maschinelle Konsistenzkorrektur vorhandener Quellenentscheidungen,
keine neue fachliche oder menschliche Freigabe, kein M7-Abschluss und keine
Veröffentlichung. Release-Profil und abgeleitete Quellen-/Statusbindungen müssen
anschließend separat gegen die korrigierten Bytes erneuert und geprüft werden.
