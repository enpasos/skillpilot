# Vollständiger Q4-Anwendungskandidat für Informatik

Stand: 6. November 2026. Der [gebundene Kandidat](informatics-q4-complete-application-candidate-2026-11-06.json)
enthält jetzt alle sieben vorgeschlagenen Operationen mit vollständigen Werten:
die ursprüngliche 19-Kompetenzen-Prüfung unter ihrer bisherigen ID als LK-Ziel,
das neue eigenständige GK-Ziel einschließlich seiner sechs verpflichtenden
Prüfungsleistungen, die direkte kanonische Rootplatzierung und die drei expliziten
Vieweinträge. **Keine Operation wurde angewendet; beide Prüfungspayloads bleiben
`draft`.**

Die Zusammensetzung prüft die unveränderten Bytes beider Inhaltskandidaten,
beider unabhängiger Inhaltsreviews und des eingefrorenen Metadatenartefakts.
Alle Datei-, Goal-, Array- und Feldguards bestehen. Im hypothetischen Ergebnis
ändern sich genau zwei bestehende Goalpayloads: Root-`contains` sowie Tags und
`examData` des bisherigen Q4-Terminals. Die übrigen 280 vorhandenen Goals und
sämtliche vorhandenen `requires` bleiben unverändert. Ein neues Goal kommt hinzu;
die bisherigen 19 Coverage-IDs bleiben erhalten. Die drei Viewpayloads stimmen
exakt mit der bereits geprüften Scopehypothese überein.

Die vollständige neue Quelldatei unterscheidet sich von der
[geprüften Scopehypothese](informatics-q4-course-scope-repair-review-2026-11-06.md)
nur durch das hinzugefügte GK-`examData`. Das ist ein überprüfter Feldvergleich,
kein behaupteter neuer vollständiger Compiler- oder QA-Lauf. Die vorherigen
Produktionsfunktionen belegten genau drei GK-Targetaustausche, unveränderte
32 andere Kontexte sowie null Composition-Findings und null
Applicability-Fehler, Warnungen oder Drifts. Der zusätzliche BY-Hinweis auf die
teilweise Mappingbasis bleibt dokumentiert.

Der [19er-Inhaltsreview](informatics-q4-terminal-independent-content-review-2026-11-06.md)
und der [gesonderte GK6-Inhaltsreview](informatics-q4-gk-terminal-independent-content-review-2026-11-06.md)
sind positiv. Es gibt keine automatische Ergebnisübertragung zwischen den
beiden IDs. Vor tatsächlicher Anwendung bleiben Roots zweiter Integrationsblick,
die realen Schema-, globalen Graph-, Composition-, Applicability- und relevanten
QA-Prüfungen sowie die ausdrückliche Freigabe der beiden geprüften Inhalte
erforderlich. Bestehende historische Prüfungs-, Praxis- und Quellenbelege werden
nicht umgeschrieben. Die überlieferten Q3-Vorbereitungspfade sind durch diese
Reparatur weder verändert noch zusätzlich fachlich freigegeben.

Die JSON-Datei enthält alle sieben Werte selbständig, bindet die eingefrorenen
Belege nur vorwärts und nennt die erwarteten kanonischen Ergebnishashes. Die
unter `tmp/informatics-q4-complete-candidate/` erzeugten vier Dateien sind
lesbare Hypothesen, keine aktiven Curriculumdateien. Das Hashprofil ist
`skillpilot-canonical-json-decimal-v1`.
