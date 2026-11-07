# Aktive Informatik-Terminals: Material-, Bewertungs- und Scopeverträge

Der [vollständige Einzelbeleg](informatics-route-terminal-contract-inventory-2026-11-06.json) inventarisiert genau die sechs aktiven atomaren Route-Terminals der Quelle `93a653b110949ff410a73bd750b2a605a9ab0329fe1cd157f016869d848e1f7e`. Alle Aufgaben-, Lösungs-, Rubrik- und Coveragefelder wurden tatsächlich gelesen; die 207 verschiedenen Coverage-IDs sind disjunkt, existieren als gewöhnliche Atome und entsprechen exakt dem 207er-Atomicity-Scope. Dies ist keine erneute vollständige Fachprüfung aller 207 Zielbedeutungen und keine Freigabe.

| Bestehendes Terminal | Feste Coverage | Im angebotenen GK-Target | Im angebotenen LK-Target |
| --- | ---: | ---: | ---: |
| Grundlagen/Querschnitt `342511c3…` | 29 | 29 | 29 |
| E `49ba66cf…` | 25 | 24 | 25 |
| Q1 `65aa807f…` | 58 | 23 | 58 |
| Q2 `0df1bedd…` | 41 | 22 | 41 |
| Q3 `1ce620dc…` | 35 | 20 | 35 |
| Q4 `a5e33d4d…` | 19 | 6 | 19 |

Die Kurszahlen gelten jeweils für die tatsächlich angebotenen kanonischen sowie HE-/BY-Scopes. Zusätzlich bietet die kanonische SekI-View das 29er-Querschnittsterminal mit nur 28 dieser Ziele im Target an: `de388e30…` „Brute-Force und Heuristiken vergleichen“ fehlt dort. E fehlt in GK das explizite LK-Ziel `e3e5c851…` „Paketorientierte Übertragung erläutern“. Die 19 Viewhashes und alle 35 aktuellen Scopekontexte wurden gegen den tatsächlichen nativen Projektionsbeleg geprüft; 37 Terminal-/Scopeangebote enthalten 16 feste Coverage-/Targetdifferenzen. Das ist ein maschinell bestimmbarer Befund, kein neu erfundenes allgemeines Verbot von Coverage außerhalb des Targets. Die jeweilige verpflichtende Route oder optionale Supplementprüfung braucht eine ausdrückliche Autorenentscheidung.

## Tatsächlich fehlender Inhalt

Jedes Terminal enthält nur die vollständig gebundenen Varianten von „Bearbeiten Sie eine materialgestützte Informatik-Aufgabe zu …“ mit demselben allgemeinen Arbeitsauftrag. Kein Datensatz, Code, Schaltbild, Quellentext oder sonstiges konkretes Arbeitsmaterial wird geliefert oder verlinkt. Jede Musterlösung ist derselbe 133-Zeichen-Satz: Sie kündigt eine fachlich korrekte und begründete Lösung an, führt aber keine vor. Fehlende separate englische Aufgaben-/Lösungsfelder sind hingegen zulässiger Fallback und für sich kein Fehler.

Alle sechs Rubriken bestehen aus denselben vier allgemeinen Dimensionen mit 5/6/5/4 Punkten, Maximum 20 und Bestehensgrenze 12. Keine Zeile bindet die beobachtbare Leistung einer konkreten Covered-Goal-ID. Für jede Dimension existiert eine zulässige Punktvergabe, die diese Dimension vollständig auslässt und trotzdem besteht; die vier exakten Gegenvektoren je Terminal stehen im JSON. Das beweist die arithmetische Kompensierbarkeit ganzer Rubrikdimensionen. Es erfindet weder eine echte Lernendenantwort noch eine Bewertung für das Auslassen jedes einzelnen der 207 Ziele.

## Bestehende Norm und tatsächliche Maschinenprüfung

N19 verlangt Task, Lösung und identifizierte Bewertungsstruktur; N20 den passenden Sprachfallback. N22a/b legen genau einen gekappten Gesamtwert und dessen Bestehensgrenze fest. N23/24 erhalten die binäre Ergebnissemantik. Die aktive Hauptnorm U37 und `node-types.md` verlangen unabhängige Aufgaben-/Rubrikprüfung für behauptete Anerkennung; PR83-U12/U42 werden hier nicht stillschweigend zu implementierten Hauptregeln erklärt. Die Reifegrad-Dokumentation warnt ausdrücklich, dass bisherige Routen- oder M7-Labels keine solche Inhaltsprüfung ersetzen.

Der native CQR-Helper liefert auf allen sechs tatsächlichen Eingaben `concreteExamReadinessIssues=[]`, `examReleaseCoverageIssues=[]` und `isPlaceholderExamData=false`. CQR-202 prüft einige bekannte Textschablonen; diese sechs werden verfehlt. CQR-203 prüft das Released-Label und nichtleere Metadaten. Die Markdownprüfung kontrolliert Tabellenformat. Grüne gewöhnliche A/M-Records schließen Prüfungsziele ausdrücklich aus; die zentrale D/P-Registry hat kein Informatik-Subjekt. Keiner dieser Befunde beweist konkrete Materialien, richtige Lösungen oder semantisch vollständige Coverage.

Der zusätzliche [native Census über alle 21 Quellen](canonical-exam-readiness-census-2026-11-06.json) prüft alle 925 aktuellen `examData` mit denselben unveränderten Readiness-, Placeholder- und Releasefunktionen. Exakte sechs Textsignaturen und ihre vollständig feste Aufgaben-/Lösungsfamilie treffen ausschließlich die sechs Informatik-Terminals; kein anderes Fach matcht. Andere beobachtete Presence-/Statusbefunde werden nicht pauschal zu neuen Pflichten aller Prüfungen erklärt. Dies ist kein fachlicher Qualitätsnachweis der übrigen 919 Aufgaben.

Die tatsächliche Maturity-Verbindung ist gelesen und ausgeführt: Alle 21 gespeicherten Ergebnisse werden durch die unveränderte native Ableitung reproduziert. `deriveScopeMaturity` prüft CQR-202 vor M4; eine dortige Warnung ergibt nach erfüllten früheren Gates M2. `deriveCurriculumMaturity` verwendet diesen Scopewert. Informatik steht aktuell bereits wegen früherer Route-/Graphfehler auf M0; die zusätzliche CQR-202-Warnung wird dort derzeit maskiert. Der gespeicherte Scope meldet trotzdem 14 konkrete Terminalaufgaben und null schwache Aufgaben, obwohl sechs davon die nachgewiesenen generischen Texte sind. Kein neuer vollständiger CQR-Produzentenlauf wird hier behauptet.

## Kleiner nächster Reparaturblock

Zuerst den existierenden CQR-202-Prüfer mit diesen sechs vollständig gepinnten realen Negativfällen verbinden: die konkrete bekannte generische Textfamilie tatsächlich zurückweisen, vorhandene Placeholder-/Statuskontrollen bewahren und über die bestehende Maturity-Ableitung testen. Keine willkürliche Mindestlänge und keine Behauptung, dass ein nicht erkannter Text richtig sei. Die vorhandene CI-Kette ist `graph-validation` → `test:deep-understanding-rollout` und `quality:curriculum-status` samt Floorcheck. Noch wurde kein Validator oder Test verändert.

Als kleinster weiterer Inhaltsblock außerhalb der bereits getrennten Q4-Entwürfe und Astras Q2/Q3-Arbeit eignet sich E mit 25 exakten Zielen. Vor der Autorenschaft den einzelnen GK-/LK-Konflikt entscheiden; keine stille 24er-Prüfung unter der bestehenden 25er-ID. Ein konkretes Schulveranstaltungs-Webprojekt benötigt tatsächliche Netzwerk-/HTTP-/Paketspuren, vollständigen HTML/CSS/DOM/JavaScript-Code samt Ein-/Ausgaben, Variablen-/Kontrollfluss-/Funktionsbeispiele, Projektauftrag und Versions-/Test-/Präsentationsartefakte sowie konkrete Chiffrate und Schlüssel-/Angriffsdaten. Der vorhandene Kontext `bb651ed7…` kündigt seine drei Materialien ebenfalls nur an und liefert daher keine fertige Wiederverwendungsgrundlage.

Für jedes der 25 unveränderten Ziele muss der Kandidat Materialstelle → Teilaufgabe → erwartete unabhängige Leistung → normales Rubrikkriterium binden. Punkteschwelle und Auslassungsgegenantworten sind fachlich mitzuprüfen; eine Datenoption wären 25 vollständig notwendige binäre Kriterien mit 25/25. Das ist keine allgemeine neue Bewertungsregel und kein zusätzlicher per-Goal-Pass.

Alte explizite Abschlüsse werden weder entzogen noch rückwirkend als Nachweis neuer Materialien umgedeutet. Unterschiedliche feste Prüfungsbedeutungen benötigen getrennte explizite Identitätsentscheidungen; keine automatische Übernahme in neue GK-IDs. Eine Änderung von `examData` verändert den vorhandenen Practice-Inhaltsfingerprint, ohne alte Praxisquittungen umzuschreiben oder Mastery zu widerrufen. Q4, die 875-/41er-Hypothese und die 27 gewöhnlichen Holds bleiben gesondert. Keine Source-, Deck-, View-, QA-, Runtime- oder Freigabestatusänderung wurde vorgenommen.
