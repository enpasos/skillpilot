# Tatsächliche Paketpipeline 1.3 – 16. November 2026

Der abschließende echte Readiness-/Consumerlauf 49 ist terminal mit Exit 0
bestanden: Consumer insgesamt `passed`, 15/15 Funktionstests, Browser `passed`,
frische selbst ausgeführte Consumer-Evidence von Readiness akzeptiert und
`completeForPolicy=true`. Einziger Blocker bleibt die menschliche
Redistribution-Freigabe; Ergebnis korrekt `not-ready-incomplete`. Integration,
frische PR-/main-CI und Veröffentlichung sind getrennte Nachweise.

Das tatsächlich zweifach reproduzierte ZIP hat SHA-256
`6284da913445717841c861ab0fce5d6c9217f9b277789037db7f7accef1cb9eb`,
1.687.936.166 Bytes und Content-Digest
`sha256:4e371d4e3fa31ccabfc9b32e061ada55d18fc8a8ebf1f087d9a6109469645a04`.
Es enthält 1.107 Dateien: 201 Modelldateien, 864 Binärdateien, 27 Schemas und
15 Paketsteuer-/Lizenz-/Nachweisdateien. 1.105 Dateien stehen im Manifest.
864 = 836 Lernbilder + 28 unveränderte Aufgabenmaterialien (18 SVG, 10 PNG),
mit 31 tatsächlichen Aufgabe–Bild-Zuordnungen. Zwei eindeutige
Learning-Unit-Coverage-Reviews und 84 echte Aufgabenquellen sind enthalten.

## Ausgeführte Abschnitte

Es gab keinen durchgehend unveränderten Gesamtlauf. Die Originalausgaben,
Exitcodes, Quellpins und unterbrochenen bzw. fehlgeschlagenen Abschnitte werden
verlustfrei aufbewahrt; die Nummern beziehen sich auf ihre Originaldateien.

| Beleg | Tatsächliches Ergebnis |
|---|---|
| 23/26 | Vorprüfungen, vollständige unabhängige Modellvalidierung und zwei bytegleiche reale Modelle (201 Dateien); alter Runner nach dem Bytevergleich gezielt mit Exit 143 beendet, um einen redundanten ZIP-Bau zu vermeiden. |
| 25/28 | Erstes reproduziertes ZIP gebaut; unabhängiger ZIP-Validator wies neue Manifest-Provenance sowie zwei unvollständige 1.3-Consumerbindungen zurück. Alle Befunde bleiben im ursprünglichen Failreport 28. |
| 33 | Korrigiertes ZIP mit exakten Zählpins 1107/1105/864 und obigem Digest erfolgreich reproduziert. |
| 34/35/37 | Manifest-/Ledger-Untertypvergleich erforderte eine ebenso enge unabhängige Projektion; acht fokussierte Tests und 43 bestehende Standalone-Garantien bestanden. |
| 36 | Alle sechs echten ZIP-Gates sowie Installieren, Verifizieren, CAS-Aktivieren und Status des privaten Stores bestanden. Consumer-Preflight scheiterte lokal an falscher Java-Auswahl. |
| 38–40 | Direkte Diagnosen belegten Java 25.0.1 statt gepinnter Corretto 25.0.2.10.1 und anschließend einen beschädigten lokalen Gradle-Projektcache. Nur lokale Umgebungsbindungen wurden korrigiert; der vorhandene Cache blieb erhalten. |
| 41 | Frische echte Assembly: 9/15 Checks bestanden, 1 fehlgeschlagen, 5 nicht ausgeführt. Unveränderte Karten-Assertion belegte ein fälschlich implizit erledigtes Memoryziel. Vollständiges fehlgeschlagenes Bundle ist aufbewahrt. |
| 42–44 | Separate Diagnosesandboxes auf derselben Assembly, unveränderte Originalassertion. Nur temporäre Druckinstrumentierung belegte `completedWork=true` bei Memory-Mastery 0; Voraussetzungen und Sichtbarkeit waren korrekt. Diese Diagnosen sind keine Abnahme. |
| 45 | Tatsächlicher Completion-JUnitlauf: 16 Suites, 137 Fälle, 136 ausgeführt bestanden, keine Fehler; eine unveränderte opt-in Performance-Messung war bedingt deaktiviert. |
| 46 | Nach Memoryreparatur 15/15 Funktionstests, insgesamt dennoch fehlgeschlagen: der eingefrorene Browserhelper verlangte einen veralteten unpersonalisierten Closure-Pfad. Aktuelles React nutzte korrekt den learner-spezifischen Pfad. Vollständiges Browser-Failbundle bleibt erhalten. |
| 47/48 | Eigener versionierter 1.3-Runner (Version 1.1.0) mit exaktem GET-/Learner-/Root-/Statusnachweis; Pfad-Selbsttest mit zwei positiven und acht negativen Fällen sowie vollständiger Runner-Selbsttest bestanden. |
| 49 | Terminal Exit 0: Gesamt-Consumer und Browser bestanden, 15/15 Checks; exakt ZIP `6284da…`, Runner `3b3269…` Version 1.1.0; Readiness akzeptiert frische selbst ausgeführte Evidence mit übereinstimmenden Assembly-/Bundlehashes. Nur die menschliche Veröffentlichung bleibt blockiert. |

Ein zunächst versehentlich eingelesener historischer Consumerreport
`167ac363…` gehörte zu `0.1.0-learning-unit-offers.1`. Seine falsche Bindung
wurde erkannt und der dazu gemeldete aktuelle PASS zurückgenommen. Die Dateien
sind ausdrücklich als `rejected-historical-misattributed` markiert und zählen
zu keinem aktuellen PASS; die Korrekturquittung 39 bleibt erhalten.

## Echte Reparaturen und Grenzen

Der gemeinsame unveröffentlichte Vertrag 1.3 ergänzt die vorhandene
Stage-plan foundation um geschlossene, byte- und eigentümergebundene lokale
Aufgabenmaterialien. Gemeinsame Bilder werden einmal mit Original-URL und
Originalbytes transportiert; sämtliche Verwendungen werden unabhängig
rekonstruiert. Paketabhängigkeitsabschluss erzeugt keine pädagogischen
`requires`, Zielclaims oder Lernergebnisse. SVG-Sicherheitsprüfungen und
PNG-/JPEG-Magieprüfungen bleiben hart.

Die zwei exakt benannten JSON-Autorenquellen werden als Provenance transportiert
und behalten die Knowledge-Content-Klassifikation mit offenen Rechteprüfungen.
Die wiederhergestellte V7-Quelle ist bytegleich zur vorhandenen unabhängigen
Reviewquelle; 43 aktuelle Referenzen, 44 historische Entwurfsziele, kein neuer
Zielclaim und keine offizielle Quellenbehauptung.

Die tatsächliche Memory-Fehlfunktion widersprach AGENTS §4: Memoryziele dürfen
keinen impliziten Abschluss erhalten. Die automatische Berechnung trägt daher
Assessment- und Memorypflichten getrennt von der echten Assessmentzählung,
erhält ihre vollständigen transitiven Vorbereitungen und verlangt auch
unterstützende Memoryziele außerhalb eines Teilziels explizit. Die frühere
reviewgebundene Berechnung bleibt unverändert. Regressionen und unabhängige
Gegenproben stehen unter [memory-explicit-completion-v1](../memory-explicit-completion-v1/README.md).

Der neue Browsernachweis verlangt die tatsächliche Anwendungsmeldung
`GET /api/ui/learners/{genau dieser Learner}/landscapes/{genau dieser Root}/closure`
mit Status 200; falscher Learner, Root, Status oder Methode werden abgewiesen.
Katalogfehler dürfen auch diesen Pfad nicht als Fallback auslösen. Die alten
Runner-/Helperbytes, alle veröffentlichten 1.0–1.2-Verträge, retained Inputs und
die aktive V9-Registry bleiben unverändert. Keine zusätzliche Frontendanfrage
wurde eingeführt.

Unabhängige enge Reviews sind unter
[package-assessment-materials-producer-v1](../package-assessment-materials-producer-v1/README.md)
und [package-readiness-v13-v1](../package-readiness-v13-v1/README.md) gebunden.
Das Paket bleibt wegen ausstehender menschlicher Rechte-/Quellenprüfungen
unveröffentlicht. Der Nachweis behauptet weder aktivierte reale Stage-Pläne
noch Completion-1.1-Import oder einen ausgeführten FWU-OWL-1.3-Roundtrip.

## Retention

`retention.actual.json` bindet die nach Abschluss eingefrorenen Originalbytes,
Quellpins, JUnit-XML und vollständigen tatsächlichen Consumer-/Readinessreports.
Die Rohdateien sind verlustfrei komprimiert; Wiederherstellung wird gegen ihre
SHA-256- und Bytewerte geprüft. ZIP, Curriculum-Binärdateien und vollständige
Runtime-Assemblies werden nicht zusätzlich ins Repository kopiert.
