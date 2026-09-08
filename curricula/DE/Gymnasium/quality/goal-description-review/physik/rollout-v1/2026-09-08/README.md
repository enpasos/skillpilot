# Physik: vorbereitete Pakete und CI-Zwischenmeilenstein

Der Nutzer hat die Arbeit an Physik 100 % am 8. September 2026 zugunsten des
Zwischenmeilensteins **CI bestanden / Rollout bestanden** unterbrochen.
Dateien in diesem Ordner sind kein impliziter Beleg für diesen Meilenstein.

- **B035 Potenzialtopf:** Die zwei bereits ausgearbeiteten Einzelziele wurden
  einschließlich Quellen, Projektionen, Memory-Bindungen und exakt erhaltenen
  Bildern integriert. Die neue Intervall-Abschlussaufgabe wurde unabhängig
  inhaltlich geprüft. Native Graph-, Atomicity-, Memory-, Projektions- und
  Maturity-Floor-Prüfungen bestehen. D/P-Abschlüsse wurden nicht registriert.
  Eine redundante Modell-Lernkarte (`c03`) wurde aus dem aktiven Deck entfernt;
  die Entfernung bleibt im Karten-Auditledger und in Git nachvollziehbar.
  Der alte B035h-In-flight-Claim wurde entfernt, weil `ad021f2e-6b94-5e6e-a264-3d1110094b87`
  jetzt ein Cluster ist. Das historische Zweierpaket bleibt unverändert erhalten;
  seine offenen Einzelziele und die beiden neuen Kinder gelten dadurch nicht als
  abgeschlossen. Bei Wiederaufnahme sind aktuelle, atomare Claims anzulegen.
- **B034:** Fünf zusätzliche Abschlussaufgaben sind nur Entwürfe; keine
  Anwendung oder unabhängige Freigabe. Siehe den zugehörigen Draft-Hinweis.
- **B040:** Die Astro-Aufteilung bleibt unangewendet. Die neuen Quellen- und
  Aufgabenentwürfe sowie Shadow-Prüfwerkzeuge sind Vorbereitungen, keine
  freigegebenen Lernwege.
- **Thermodynamik:** Zwei vorgeschlagene bilinguale Beschreibungskorrekturen
  sind ausdrücklich **nicht angewendet**. Die zweite unabhängige D043r-Runde
  ist erhalten; noch kein neuer strikter Beschreibungsabschluss.
- **D036r:** Die separat geprüfte Drei-Ziel-Teilansicht liegt im ursprünglichen
  Batchordner. Sie ist nicht in der zentralen Registry registriert.

Alte Skripte und Feld-Leases nicht blind erneut anwenden. Die aktive Datenbasis
hat sich geändert; erneute Anwendung braucht den Vergleich jedes betroffenen
Feldes mit dem damaligen und dem aktuellen Stand. Keine Testgrenze, Qualitäts-
untergrenze, menschliche Freigabe oder eingefrorene Plugin-Semantik wurde
zugunsten eines Prozentsatzes geändert.

## Ursache und Abschlussgrenze des CI-/Rollout-Meilensteins

Ausgangspunkt ist Commit `f5f5a8b3bbb8e3fa2d4f68077a19812135cd6c9c`.
Der fehlgeschlagene GitHub-CI-Lauf `34177734328` und das vom Nutzer eingereichte
Produktionslog zeigen zwei veraltete abgeleitete Nachweise:

1. `goal-source-rationale-mapping-batch-01` referenzierte noch die frühere
   Generation seines Quellenberichts. Die reguläre Erzeugung aktualisiert ihn.
2. Das KI-Transparenzinventar entsprach nicht mehr den tatsächlich verlinkten
   Bildformaten, Providern und C2PA-Containermarkern. Der Produktionsbuild selbst
   war erfolgreich, die nachgelagerte Inventarprüfung stoppte korrekt.

Die zusätzliche lokale Ausführung der späteren Curriculum-CI-Schritte fand
außerdem eine veraltete Mathematik-Conformance-Erwartung. Nach sechs bereits in
`74adc6a74` ersetzten Bildern gibt es korrekt 137 statt 143 aktuelle menschliche
Bildfreigaben und 587 statt 581 offene Entscheidungen. Ausschließlich diese zwei
Erwartungswerte und die zugehörige Profil-Prüfsummenbindung wurden korrigiert.
Zusätzlich wurde die alte erwartete Gesamtgröße der weiterhin 742 Mathematik-
Bilder abgeglichen: 12 frühere Bildänderungen erklären die Differenz von
−10.499.326 Byte vollständig. Mathematik-Bilder, fachliche Inhalte und
QA-Freigaben bleiben unverändert. Der
[Einzelfallbeleg](ci-publication-evidence-count-refresh.receipt.json) dokumentiert
die sechs Freigabe- und zwölf Größenänderungen getrennt.

Der Exportnachweis kann nun auch die vier bereits vorhandenen KI-unterstützten
SVG/Playwright-Bilder ehrlich erfassen. Die neue, eng begrenzte Herkunftsklasse
behauptet weder nachgewiesenen Determinismus noch geklärte Nutzungsrechte:
`pending-human-review`, `review-required` und `licenseExpression: null` bleiben
erhalten. Falsche Provider-/Hinweispaarungen, automatische Bildfreigaben und die
Verwendung dieser Herkunftshinweise als vermeintliche Lizenz werden abgewiesen.
Das vorhandene Legacy-Label beim vierten Bild (`d6b74b15…`) wird ausschließlich
zusammen mit dem exakten nativen Provider als solcher Herkunftsclaim erfasst;
die bisherigen Gemini-/User-Provider-Zweige bleiben unverändert. Zwölf veraltete
Bildbindungen wurden abgeglichen, ohne eine einzige Rechteentscheidung zu ändern.
Das getrennte Quellenprüfungs-Ledger und sein Bericht erhalten ausschließlich
die aktuelle Profil-Prüfsumme; PDF-Bindungen, Treffer und Entscheidungen bleiben
unverändert.

Das Inventar ist explizit abgeglichen. Eine neue isolierte Regression prüft den
JPG/PNG-Wechsel, Provider- und Markerabweichungen, bytegleiche Laufzeitkopien,
unveränderte feste Medien und den bewusst nur ausgebenden Layer-A-Patchmodus.
Normale Builds, CI und Deployment aktualisieren keine Freigaben oder das
Inventar automatisch. Vorgehen: `docs/deploy/deployment.md`.

Strikter Physik-QS-Stand dieses Pakets: **410/466 (88,0 %)**;
D410 / P413 / A466 / M466 / V466, keine blockierenden Rolloutbefunde.
Das ist weder Physik 100 % noch eine neue menschliche Qualitätsfreigabe.

Der Zwischenmeilenstein ist erst vollständig erreicht, wenn **derselbe neue
Commit** auf GitHub grüne CI hat und auf Produktion mit `./deploy_skillpilot.sh`
einschließlich öffentlicher Nachprüfungen erfolgreich ausgerollt wurde.
Lokale grüne Tests oder ein lokal gebautes Artefakt ersetzen diese beiden
Nachweise nicht. Commit, Push und Produktionsneustart sind in diesem Paket
nicht implizit erfolgt; bis zu diesen Nachweisen bleibt die weitere QS pausiert.

## Lokale Verifikation des konsolidierten Arbeitsstands

- PASS: 41 übernommene npm-Curriculum-CI-Gates; Quellen-, Memory- und
  Visualisierungsberichte regulär regeneriert und auf Aktualität geprüft.
- PASS: 41 übernommene Frontend-CI-Kommandos, einschließlich isolierter
  Browsertests und der vier Post-Build-Prüfungen für Service Worker, Inventar,
  Frontend-Shell und KI-Transparenz.
- PASS: `test:goal-book-pipeline` vollständig; alle vier Bücher gebaut und
  verifiziert, Physik mit 466 Lernzielseiten. Keine generierten PDFs eingecheckt.
- PASS: `build:application` mit `VITE_SKILLPILOT_COACH_VARIANT=openai-mcp`,
  `build:package-consumer`, Lint, TypeScript, Reviewvideo, Coach-Variante und
  Quellenindex-Artefaktprüfung.
- PASS: M6-/Maturity-Floors, strikter Deep-Understanding-Check, alle 64
  Physik-Scope-Views sowie unabhängige inhaltliche Gegenprüfung des B035-Diffs.
- PASS: Review-Freeze, Dokumentationslinks/-index, `git diff --check` und
  read-only In-flight-Selector mit 12 gültigen aktiven Paketen.
- PASS: Backend `./gradlew check` unter Corretto 25.0.2.10.1 und Node 20.20.2;
  1.566 Tests, 0 Fehler, 1 Skip ohne externen Package-Store. Beide unverändernden
  OpenAI-/Claude-Release-Verifier bestehen.
- PASS: Quellenverifikation einschließlich ihrer Negativtests im expliziten
  CI-Modus `--allow-missing-source-pdfs`; 9.977 Ziele, 9.493 Carrier-Treffer,
  5 gebundene PDF-Treffer und unverändert 479 offene Reviews.
- PASS: Zwei unabhängig erzeugte JSON-Release-Modelle sind bytegleich;
  unabhängiger Modellvalidator mit 49 Negativfällen. Der vollständige
  Paketbuilder-Selbsttest und die Vertragsprüfung bestehen auch mit der
  abschließend erweiterten Herkunftsklasse.
- PASS: Redistribution-Check und -Selftest mit 29 Negativmutationen und sechs
  falschen Metadatenpaarungen. Damit sind sämtliche Einzelschritte des
  Push-CI-Conformance-Zweigs bestanden. Nach dem dokumentierten Fehler wurden
  die betroffenen Schritte fortgesetzt; ein komplett erneut gestarteter
  monolithischer Lauf wird ausdrücklich nicht behauptet.

Die exakten lokalen npm-Befehlslisten mit Ausgaben liegen als temporäre
Prüfbelege in `tmp/physics-ci-stabilization-20260908-v1.json` und
`tmp/frontend-ci-20260908-final-results.json`. Sie sind keine GitHub-Check-Runs.

## Abgrenzung zum optionalen Paketexport

Die Push-CI prüft den JSON-Release-Modellpfad mit
`SKILLPILOT_FULL_PACKAGE_CONFORMANCE=false`; daraus folgt keine Freigabe eines
vollständig weiterverteilbaren Pakets. Offene Quellen- und Rechteprüfungen
bleiben offen. Die vollständige Export-/OWL-Pipeline wurde nicht gestartet.

Eine zusätzliche lesende Prüfung der optionalen Vertrags-Fixtures ergab:
FWU-OWL-Verträge bestehen; die Dual-Release-Fixture bindet bereits im
Ausgangscommit ein veraltetes Publication-Evidence-Profil (`948b5e…` statt
damals `19190f…`). Die Fixture wurde nicht auf einen ungeprüften aktuellen
Paketstand umgebunden. Dieser bekannte Altbefund gehört zum nur manuell oder
zeitgesteuert laufenden Workflow `Optional Package CI`, nicht zur Push-CI.
Vor einem späteren Dual-Release ist die Fixture samt Gleichwertigkeitsnachweis
gezielt zu erneuern; dieses Paket behauptet keine bestandene optionale Suite.
