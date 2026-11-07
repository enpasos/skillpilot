# Belege zu den CI-Vertragsreparaturen

Aktueller regulärer Nachlauf: `2026-11-07T05:46:48.445Z`. Der
[normale Gesamt-CQR mit vier PoWi-Korrekturen und 74 Bildkontexten](powi-four-fixed74-normal-cqr-producer-2026-11-07.json)
bindet alle 21 Quellen und die zehn unveränderten Fachfloors. Deutsch, Geschichte
und Latein bleiben M6; der tatsächliche harte Floorcheck scheitert an sieben
übrigen Fachständen. Mathematik hat 916 Strukturbefunde, davon 914 G17; PoWi
hat 599, davon 122 G17 und 477 G01a. Informatik bleibt bei 37 G17 und sechs
unzureichenden Prüfungen. Alle Zielmengen und Meilensteine bleiben unverändert.
CQR-303 bestätigt 74 qualifizierte und 2.409 offene V-Kontexte bei unverändertem
Gesamtumfang von 2.483. Die
[Anwendungsnotiz](powi-four-fixed74-repairs-application-2026-11-07.md) trennt
fachliche Kantenkorrekturen, historische Bildbelege und die Transportkorrektur.
Die früheren Nachläufe bleiben mit ihren damaligen Eingaben erhalten.

- [Terminaler Remote-Lauf auf 9b798](remote9b-terminal-2026-11-07.json):
  sieben von acht Hauptjobs einschließlich Frontend/Lint, Backend, Apps und
  Buchbau sowie Docs, Assessment, OAuth und Gemini bestehen. Curriculum
  scheitert am tatsächlichen Floorcheck derselben sieben Fächer; seine
  abschließende Report-Diffprüfung wird nicht erreicht. Die spätere
  V-Verbraucherverschärfung ist durch diesen älteren Lauf nicht geprüft.
- [Frischer Docs-Befund auf 25a6](remote25a-docs-link-failure-2026-11-07.json):
  Das unveränderte statische Namespace-Folgedokument fehlte im Gitstand,
  obwohl es lokal vorhanden war. Commit `46d69682eb` ergänzt genau diese
  Datei. Der native Linkchecker besteht gegen 519 exakte Markdown-Dateien
  und die Pfad-/Symlinkmenge des Gitindex. Der Nachweis ist lokal; der
  neue Remote-Lauf steht aus. MkDocs und PostgreSQL bestehen bereits auf 25a6.
- [Tatsächlicher e4de-Duration-Nachlauf](math-e4de-duration-binding-technical-review-2026-11-07.json):
  vier native Generate-/Check-Läufe bestehen, fünf echte unveränderte
  Gegenfälle werden abgewiesen. Alle 18 erzeugten Dateien und ihre nativen
  Baum-/Rollen-/Filtermengen bleiben gleich; alle 13 ursprünglichen Reviews
  sind bytegleich. Nur die geprüfte private Policybindung folgt der real
  importierten Matrixabbildung; Quelle und Policy sind noch nicht angewandt.
- [Terminaler Remote-Lauf auf cb128](remote-cb128-workflows-terminal-2026-11-07.json):
  Docs, Assessment, OAuth und Gemini sowie sechs Hauptjobs einschließlich
  Backend, Apps und Buchbau bestehen. Die Docs-/Apps-Reparaturen sind damit
  remote bestätigt. Curriculum scheitert an denselben sieben tatsächlichen
  Fachfloors; Frontend zusätzlich an 17 Typ-Lintfehlern in drei neuen
  V-Prüfer-/Testdateien. Spätere lokale Korrekturen brauchen ihren eigenen Lauf.
- [Vollständiger Originalkontext-Census](https://github.com/enpasos/skillpilot/blob/feat/skill-graph-ci-contracts/qa-artifacts/ci-contract-audit/2026-11-06/visualization-five-ledger-original-context-census-2026-11-06/README.md):
  alle 2.562 Ziele disjunkt erfasst, 16 aktuelle Eingabepins geprüft;
  Einzelbelege und endliche Reader-/Review-Worklists dauerhaft gesichert.
  Die 963 passenden Kontexte sind keine nativen Freigaben. Fehlende
  Attribution und ursprüngliche Zeitgranularität bleiben ausdrücklich offen.
- [Zwei konkrete Wirtschafts-Reader](visualization-economics-q3-two-family-reader-2026-11-07.md):
  36 echte Originalketten, 35 Kontrollen und unveränderte frühere Gegenfälle
  bestehen, ebenso fokussiertes ESLint und TypeScript. Der
  [Root-Nachlauf](visualization-economics-q3-root-followup-2026-11-07.json)
  wiederholt die nativen Kontrollen. Die nachfolgende
  [V-/Deep-/direkteFloor-Integration](visualization-fixed54-consumer-integration-2026-11-07.md)
  besteht den vollständigen Deep-Test und den unabhängigen Consumerpeer.
  Der normale Producer endet mit Exit 0, der anschließende echte Floorcheck
  mit Exit 1 an sieben Fächern. Die offene Bestandsqualität bleibt sichtbar.
- [Source-A-Lesegrenze](source-identity-node-vm-lifecycle-boundary-2026-11-07.md):
  35 Tests und 58 native Regressionsläufe bestehen. Die beiden kleinen
  TypeScriptprogramme enden erfolgreich; ihre vollständige Leseauthentisierung
  bleibt an einer äußeren Modulsuche gesperrt. Fünf erhaltene Belegfamilien
  und ihre Originalstände sind gesichert. Der
  [Root-Abgleich](source-identity-read-component-root-checkpoint-2026-11-07.json)
  prüft die Inventare und aktuellen Pins; die tatsächliche Preparerintegration
  und große Kandidaten-QA bleiben offen.
- [Tatsächlicher gebundener Rollen-Elternscope](source-identity-prepared-namespace-parent-boundary-2026-11-07.md):
  49 Tests mit 67 kurzen nativen Aufrufen bestehen. Die neue Fähigkeit bindet
  vollständige Mitglieder des tatsächlichen schreibgeschützten Rollenordners;
  fehlende Quellenbindungen und nicht vollständig beschriebene binäre
  Preparer-Overlays werden abgewiesen. Beide echten TS-Läufe enden mit Exit 0,
  ihre vollständige Leseauthentisierung bleibt am höheren Paarordner gesperrt.
  Der [Root-Abgleich](source-identity-namespace-parent-root-checkpoint-2026-11-07.json)
  bestätigt 374 erhaltene logische Belege und die aktuellen Codepins.
- [Aktuelle Informatik-875-Reparaturrichtung](https://github.com/enpasos/skillpilot/blob/feat/skill-graph-ci-contracts/qa-artifacts/ci-contract-audit/2026-11-06/informatics-875-required-scope-repair-followup-2026-11-07.md):
  gleiche Bedeutung und alte Ergebnisse erhalten, unbelegte Pflichtrolle
  korrigieren, eigenständige vollständige Prüfungsnachfolger und erhaltene
  alte Inhalte wirklich prüfen. Keine Datenanwendung oder Retained-Ausnahme.
- [Zwei tatsächliche aktuelle Math-Bildreviews](https://github.com/enpasos/skillpilot/blob/feat/skill-graph-ci-contracts/qa-artifacts/ci-contract-audit/2026-11-06/math-two-current-visualization-content-review-2026-11-07/README.md):
  Zahlengerade KEEP, altes Matrixbild REVISE wegen notwendiger Kleinschrift.
  Eine vereinfachte Matrixfassung hat nach tatsächlichem Prepare-vor-Generation-
  und privatem Importlauf einen eigenen
  [aktuellen Gegenreview](https://github.com/enpasos/skillpilot/blob/feat/skill-graph-ci-contracts/qa-artifacts/ci-contract-audit/2026-11-07/math-inverse-image-native-prepared-v2-independent-review/README.md)
  mit KEEP nach tatsächlicher Original-/360-/680-Ansicht. Der erste visuell
  akzeptierte Kandidat ohne vorherigen Helperlauf bleibt samt diesem Ablauf
  erhalten. Alte Entscheidung und Bilder bleiben erhalten; neue Pixel, QA
  und Quellen sind nicht angewandt.
- [Korrigierter Informatik-Routenscope](cqr104-informatics-route-scope-repair-2026-11-06.md):
  CQR-104 prüft alle 48 tatsächlichen Länder-/Kurs-/Dauerprojektionen und
  beanstandet 42 leere Abschlussmengen. Alle elf übrigen Routenprofile bleiben
  exakt gleich. Echte Gegenfälle, der vollständige lokale Deep-Lauf und der
  unabhängige Codegegenreview bestehen; die fehlenden Prüfungen bleiben offen.
- [Math-D3/P31-Auditcheckpoint](math-three-current-evidence-completion-2026-11-06.md):
  drei aktuelle native D-Auflösungen, drei echte neue P-Kandidaten und 28
  unveränderte Bestandsrecords; keine Anwendung oder neue menschliche Freigabe.
- [Aktuelle Matrix-D-Bindung nach Bildimport](math-matrix-current-description-root-binding-check-2026-11-07.json):
  zwei neue unabhängige kalte Erstpässe urteilen KEEP. Die native Synthese
  bindet die echte neue Buchseite; der aktuelle Consumer bestätigt genau die
  drei vorgesehenen Math-D-Claims. Die 53 kalten Eingaben und 265 erfassten
  Dateien bleiben bytegleich. Der einzelne neue Matrixclaim wird getrennt
  von den erhaltenen Integer-/Diagrammauflösungen gesichert und ist unangewandt.
- [Aktueller Matrix-P-Kontext](math-matrix-e4de-positive-root-binding-check-2026-11-07.json):
  der vollständige Fallkörper wurde am tatsächlich importierten Bild neu
  geprüft und bleibt inhaltlich gleich. Der alte Bildkontext ist nativ rot,
  der neue 31er-Satz grün; acht echte Gegenfälle bleiben rot. Die 30 übrigen
  P-Records und der Zielsatz bleiben exakt gleich. Der Root-Abgleich prüft
  99 Eingabe-/Code-/Artefaktbindungen; keine aktive QA wurde geändert.
- [Drei aktuelle Math-V-Qualifikationen](math3-e4de-visualization-root-binding-check-2026-11-07.json):
  die vorhandenen geschlossenen Reader bestätigen im echten privaten
  e4de-/PNG-Kontext drei Originale. 18 Metadaten-/Fremdbeleg- und vier
  physische Bildgegenfälle werden abgewiesen. Die tatsächliche Git-Lesekette
  bindet zehn eindeutige historische Originalreferenzen. Die aktive
  54er-Autorität, Quelle und QA bleiben unverändert; der 3er-Kandidat ist
  kein verkleinerter M7-Scope und keine zusätzliche Bildentscheidung.
- [Konkrete Remote-Integrationsreparaturen auf 6fe](remote-6fe-ci-integration-repairs-2026-11-06.json):
  der Workflowtest schützt jetzt alle 19 Capture-/Vorbereitungskontrollen;
  alle 94 Tests des tatsächlichen Apps-CI-Befehls bestehen lokal. Der Docs-Build
  braucht die erhaltenen Audit-Originale zusätzlich im schlanken Checkout;
  der konkrete MkDocs-Fehler ist damit lokal reproduziert und geschlossen.
  Die spätere Remote-Abnahme auf cb128 besteht für diese beiden Reparaturen.
- [Terminale Workflows auf 6fe](remote-6fe-workflows-terminal-2026-11-06.json):
  sechs Hauptjobs einschließlich Backend, Frontend und Buchbau sowie Assessment,
  OAuth und Gemini bestehen. Der [Curriculumjob](remote-6fe-curriculum-terminal-2026-11-06.json)
  besteht den echten 19er-Isolationstest und den vollständigen Deep-Test,
  scheitert danach an den sieben echten Fachfloors. Apps und Docs scheitern
  an den oben getrennt lokal reparierten Einbindungen.
- [Begrenzter V-Kontextbaustein](visualization-context-root-component-check-2026-11-06.json)
  und [tatsächlicher Shallow-Transport](visualization-git-capsule-root-replay-2026-11-06.json):
  historische Originalketten werden an den echten Goaltext und die Bildbytes
  gebunden. Der gesicherte Transport prüft 18 Ketten und neun Gegenfälle;
  die spätere Readerkorrektur und weitere Formate sind getrennte Stände.
  Dieser frühe Baustein war noch nicht an V-/Deep-/M7 angeschlossen. Die
  oben belegte spätere Fixed54-Integration stellt diese Verdrahtung her;
  die vollständige Bestandsqualifikation bleibt offen.
- [Aktuelle Source-A-Neuverifikation](source-identity-feca-source-rebase-2026-11-07.md):
  593 Quellen, 8.601 exakt gebundene Dokumente und 164 unveränderte Regeln;
  die bisherigen 8.591 Bindungen bleiben exakt gleich, zehn historische Belege
  kommen ohne neue Ausnahme hinzu. Der rote cb128-Lauf bleibt erhalten.
  Das ist weiterhin keine tatsächliche vollständige Kandidaten-QA oder Aktivierung.
- [Privates Capture nach unabhängigem Gegenreview](source-identity-private-capture-peer-repair-2026-11-06.md):
  vier echte Grenzfehler geschlossen, Originalstände erhalten; der
  [CI-Caller](source-identity-private-capture-ci-wiring-2026-11-06.json) verlangt
  alle 19 Methoden ohne Skips. Der Komponentenpass ist kein M7-Nachweis.
- [Terminaler Hauptlauf auf 8a56](remote-main-8a56-terminal-2026-11-06.json):
  sieben Jobs einschließlich Backend, Frontend und Buchbau bestehen.
  Die Math-Duration-Prüfung besteht remote. Curriculum scheitert danach am
  [inzwischen lokal erneuerten Coveragebericht](goal-source-rationale-coverage-current-repair-2026-11-06.json);
  die späteren Deep-/Floor-Schritte wurden remote noch nicht ausgeführt.
  [Assessment](remote-assessment-8a56-terminal-2026-11-06.json), Docs, OAuth und Gemini bestehen.

- [Vollständiger technischer Assessmentumfang](cqr202-complete-assessment-scope-repair-2026-11-06.md):
  native Sollmengen, gemeinsamer Validator für Ableitung und direkten
  Floorverbrauch, echte Gegenfälle und vollständiger lokaler Deep-Pass.
- [Angewandte E9-Normalisierung](informatics-ephase-terminal-normalization-application-2026-11-06.md)
  und [einzelne Authentisierungs-/Logkorrektur](informatics-auth-logs-prerequisite-application-2026-11-06.md):
  erste Operation mit gleicher globaler Nachfrage, zweite fachlich begründet
  mit expliziten Deltas; SMTP bleibt eigene Prüfungsleistung.
- [Technische Math-Duration-Reparatur](math-duration-input-binding-application-2026-11-06.md):
  18 alt/neu/live bytegleiche Ausgaben, unveränderte Gegenwächter und tatsächlicher
  grüner Nachlauf des zuvor remote roten Originalchecks.
- [Terminale Remote-Evidenz auf 5c9](remote-5c9-terminal-2026-11-06.json):
  sieben Hauptjobs einschließlich Backend und Frontend bestehen; Curriculum
  scheitert vor der lokalen Math-Reparatur. Assessment-Core besteht, UI wird
  beim Checkout abgebrochen. Die [lokal geprüfte Checkoutreparatur](assessment-authoring-checkout-repair-2026-11-06.md)
  benötigt einen frischen Remote-Lauf.
- [Vollständiger unabhängiger GK24-Review](informatics-gk24-terminal-independent-review-2026-11-06.md):
  24 konkrete Leistungen samt eigenen Referenzläufen positiv; Angebots- und
  Vorbereitungseinbindung bleiben ebenso wie beim E25-Draft gesondert offen.

- [Angewandte fünf Sprachkorrekturen](global-orientation-cycles-application-2026-11-06.md):
  drei reale Sprachdateien, exakte Feldrekonstruktion, aktueller direkter
  G15-/G42-Nachweis für alle 21 Landschaften und
  [maschinenlesbare Anwendungsquittung](global-orientation-cycles-application-2026-11-06.json).
- [Enger Informatik-Kandidat](informatics-bounded26-overview-2026-11-06.md):
  inzwischen [angewandte](informatics-bounded26-prerequisites-application-2026-11-06.md)
  24 Fachkorrekturen plus getrennte Turing-/Dokumentationsschritte;
  Cache, ISA, drei Abiturverträge und Assessment-Inhalte bleiben offen;
  der dortige historische Nachlauf hatte 47 G17.
- [Historischer Remote-Lauf auf 5cb](remote-main-5cb-terminal-2026-11-06.json):
  fünf Jobs bestehen; Backend, Frontend und Curriculum scheitern. Die beiden
  Testfehler und die sieben echten Fachfloor-Verletzungen sind getrennte
  Aufgaben; der aktuelle lokale Stand ist dadurch nicht remote abgenommen.
- [Mannheimer Topologie- und Identitätskonflikte](mannheim-topology-authority-review-2026-11-06.md):
  19 unabhängig wiederholte Konflikte in zwei parallelen Modellierungen;
  Quellenanalyse und Reparaturgrenzen, keine automatische Zusammenführung.
- [Pflichtumfang nach aktueller PO-Klarstellung](curriculum-required-goal-scope-decision-2026-11-06.md):
  amtlich belegte Ziele sowie fachlich begründete Lückenschlüsse. Der
  [konkrete Zustandsautomatenreview](informatics-875-official-or-gap-followup-2026-11-06.md)
  findet keinen belegten Pflichtbedarf; die vollständige Scope-/Prüfungskorrektur
  unter Erhalt alter Ergebnisbedeutungen ist noch nicht angewandt.
  Der [geprüfte Bestandsvertrag](informatics-875-retained-definition-contract-review-2026-11-06.md)
  zeigt anhand echter Negativvarianten, warum das bloße Verbergen der alten
  Prüfung keine Lösung ist; die vorgeschlagene geschlossene QA-Grenze ist neu
  und noch nicht implementiert.
- [Vollständiger E25-Prüfungsentwurf](informatics-e25-terminal-candidate-2026-11-06.md):
  25 fest gebundene Ziele, konkrete Materialien, ganze Musterlösung und tatsächlich
  ausgeführte Referenzprogramme. Der
  [unabhängige 25-Fall-Inhaltsreview](informatics-e25-terminal-independent-review-2026-11-06.md)
  bestätigt die Leistungen und eigene isolierte Referenzläufe. Der Entwurf bleibt
  Draft ohne Anwendung; die GK-Angebotsgrenze und die tatsächliche Integration
  bleiben ausdrücklich offen.
- [Reparatur der Trainer-Angebotsfixture](trainer-gymnasium-offering-fixture-repair-2026-11-06.json):
  echter roter Ausgangsfall, vollständiger grüner Browserlauf und gezielter
  Script-Typvergleich ohne neue Diagnosen; Produktfilter und Reifegrade unverändert.
- [Reparatur der Backend-Dauerprojektionsfixture](backend-m6-duration-scope-fixture-repair-2026-11-06.md):
  fünf belegte Zählerkorrekturen, 336 native Vergleichsergebnisse und ein grüner
  echter HTTP-/JUnit-Methodenlauf mit sämtlichen 112 G8/G9-Anfragen.
- [Redaktioneller Terminologiefolgeschritt](cqr202-terminology-editorial-successors-2026-11-06.md):
  zwei alte Begriffe korrigiert, drei JSON-Blätter einschließlich eines
  eingehenden Hashverweises geändert; Messungen und Urteile bleiben gleich.

- [Angewandte drei Mathematikreparaturen](math-three-reviewed-repairs-application-2026-11-07.md):
  tatsächlicher nativer Graphvergleich 919 → 916 ohne neue Befunde, gemeinsam
  eingebundene aktuelle D-/P-/A-/M-/V-Belege und regulärer neuer Qualitätsbericht.
  Die unveränderten geschützten Untergrenzen scheitern weiterhin in sieben Fächern.
- [Abgeschlossener Remote-Lauf auf 0b0f4637](remote0b-terminal-2026-11-07.json):
  sieben Hauptjobs und alle vier Nebenworkflows bestehen; Curriculum scheitert
  am direkten Floorcheck. Der abgebrochene Diagnosetext belegt nicht jede
  einzelne Fachfehlermeldung; der vollständige lokale Sieben-Fächer-Nachweis
  bleibt ein getrennter Beleg.
- [Kalter Quellen- und Materialreview für Informatik Q2](informatics-q2-independent-scope-material-review-2026-11-07.md):
  66 Scopeurteile und 22 Materialurteile, ohne vorgegebenen GK-Sollumfang.
  Unbelegte Pflichtzuordnungen, konkrete Aufgabenfehler und fehlende amtlich
  verlangte Leistungen verhindern die Anwendung des bisherigen Entwurfs.

- [Vier angewandte PoWi-Korrekturen und 74 aktuelle Bildkontexte](powi-four-fixed74-repairs-application-2026-11-07.md):
  unabhängiger fachlicher Review, unveränderte effektive Voraussetzungen,
  tatsächlicher normaler Gesamtbericht und weiterhin sieben echte Floorfehler.
  Die Argumentgrenzen der Bildtransport-CLI sind zusätzlich durch echte
  Negativaufrufe in der wiederkehrenden CI geschützt.

Die [zentrale Übergabe](../ci-contract-audit-handoff-2026-11-06.md) führt
Auftrag und nächste Schritte. Der feste 518-Regelkorpus und seine Matrizen
bleiben unverändert; Main-Verträge und der eingefrorene PR-83-Einheitenstand
sind getrennt. Datierten Review-, Kandidaten- und Anwendungsbelegen liegen
jeweils eigene Quellpins zugrunde. Frühere Berichte werden nicht durch neue
Hashes umgedeutet; lokale Prüfung, tatsächliche Anwendung, QA-Freigabe und
Remote-CI bleiben getrennte Aussagen.
