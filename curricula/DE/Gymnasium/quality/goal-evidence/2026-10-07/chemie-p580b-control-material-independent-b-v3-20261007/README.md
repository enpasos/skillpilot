# P580b v3: unabhängige gezielte B-Fortsetzung

**KEEP für das exakt korrigierte P-Profil; ai_candidate;
needs_human_review; E1/G1; strenger Nettozuwachs 0.**

Reviewer: `Codex /root/chem17_targeted_independent_b`. Das ganze unveränderte
bilinguale Ziel, das vollständige korrigierte Profil und beide vollständigen
DE/EN-Material-, Aufgaben-, Referenzantwort- und Negativfälle wurden gelesen.
Aktuelle andere unabhängige Urteile wurden nicht gelesen.

## Fachlicher Befund

Der korrigierte Kontrollsatz erklärt genau die im Material vorgegebenen
Beobachtungen: kein Wiederaufflammen in der Luftkontrolle und klares Kalkwasser
in der CO2-freien Kontrolle. Die gemeinsame Vergleichsfunktion gilt für A und
B; es wird keine zusätzliche H2-Kontrolle behauptet. Die zuvor unbelegte
Aussage über einen feuchten Span ist entfernt. Die DE/EN-Sätze sind
gleichbedeutend und führen keine neuen Beobachtungen ein.

Der eigene frühere Befund
`chem17-targeted-b-gas-air-control-reference-unsupported-damp-splint`
ist daher **für das exakt korrigierte v3-Profil aufgelöst**. Das alte v2 bleibt
unverändert mit seinem ursprünglichen REVISE/Dissens erhalten. Diese gezielte
Auflösung bedeutet keine rückwirkende Anerkennung der alten Antwort.

Die drei Nachweise und ihre Reaktionsbilanzen bleiben passend. Der unveränderte
zweite Gemischfall verlangt einen eigenständigen Transfer und begrenzt negative
Glimmspanbefunde ohne bekannte Nachweisgrenze. Er behauptet weder vollständige
O2-Abwesenheit noch quantitative Gemischanteile oder beobachtete
Lernendenleistung. Mindestens ein Fall ist unabhängig vom Lernzielbild.

## Tatsächlich verifizierte Änderungsgrenze

- Autor-v3-Freeze
  `4ac4dca7a8b2bb26290982bc7fa406944d81f91c1e4007fbd12dfa086cb62bcb`:
  alle 17 eigenen Dateien exakt.
- Wiederverwendete Autor-v2-Freeze
  `3f458ad7fac9b63e29c11e41cd117b474e37542039d5b88dc6cf8c747723838a`:
  alle 117 eigenen Dateien exakt; keine neue D-Prüfung und kein neuer Buchbau.
- Genau vier Antwortfelder im Profil und zwei Antwortfelder im vollständigen
  Fall 1 ändern sich. Material, Aufgaben, Negativgrenzen und der ganze Fall 2
  bleiben gleich. Die beiden Fälle sind in beiden Sprachen wörtlich an die
  Aufgaben-/Antwort-/Grenzfelder des Profils gebunden.
- Die ganzen übrigen 16 Kandidaten-Specs und 32 Materialfälle sind exakt
  unverändert. Das eigene frühere P16-KEEP und D17-KEEP werden auf ihren
  unveränderten Eingaben erhalten, ohne historische Reviews zu wiederholen.
- Goal- und Review-Input-Fingerprint bleiben gleich; nur der Profile-Fingerprint
  ändert sich fachlich begründet mit den tatsächlich geprüften Antwortfeldern.
- Quellenrouten, Kontext, Bilder sowie A/M werden nicht geändert; alle bisherigen
  Bild- und ausgeschlossenen Quellen-Holds bleiben offen.

## Nativer Prüfstatus

Der eigene native P1-Checker ist tatsächlich abgeschlossen:
**Exit 0, 0 Blocker, 0 approved, 1 needs_human_review**. Das fachliche KEEP
stammt aus der konkreten unabhängigen Prüfung; der formale Checker-PASS ersetzt
sie nicht. Keine aktive Integration, menschliche Freigabe oder Erprobung wird
behauptet.

## Artefakte

- [Eigenes unabhängiges Urteil](independent-b.first-pass.actual.json) und
  [erste Entscheidung vor Peerzugriff](independent-b.first-pass.actual-seal.json).
- [Freeze und unveränderte Nachweise](checks/input-freeze-and-targeted-reuse.actual-verification.json).
- [Exakte fachlich geprüfte Feld- und Materialbindungen](checks/exact-single-fault-profile-and-case-binding.actual-receipt.json).
- [Eigener nativer Record](native-p/positive1.current-independent-b.review.jsonl),
  [Run](native-p/current-independent-b.run.json) und
  [Konfiguration](native-p/positive1.current-independent-b.config.json).
- [Tatsächlicher Check-Exit](checks/native-p1.current-independent-b.actual.exit.json).
- [Unveränderliche eigene Freeze](final-own-files-and-reviewed-inputs.freeze.json).

Nächster Schritt: das unabhängig passende A-Urteil für genau dieses v3-Profil
zusammenführen, anschließend die operativen aktuellen Bindungen und die
weiterhin offenen Gates getrennt behandeln. Kein strenger Abschluss wird hier
gezählt. Eigene didaktische Inhalte: CC-BY-4.0; technische Verfahrensdateien:
Apache-2.0 gemäß `LICENSING.md`.
