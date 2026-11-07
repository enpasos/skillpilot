# Unabhängiger Inhaltsreview des Q4-Kandidaten

Stand: 6. November 2026. Der vollständige Kandidat ist **inhaltlich für den
Vertrag mit allen 19 Kompetenzen positiv geprüft**. Die Anwendung bleibt wegen
der bestehenden Kurszuordnung vorerst gesperrt: Das Terminal wird auch im GK
angeboten, dort gehören aber nur sechs seiner 19 Kompetenzen zum Target.
Dies ist eine unabhängige Agentenprüfung, keine menschliche Erprobung oder
Freigabe produktiver Daten. Der [Einzelbeleg](informatics-q4-terminal-independent-content-review-2026-11-06.json)
enthält alle 19 fallbezogenen Urteile, vollständige Artefakthashes und den
konkreten Scopebefund `INFO-Q4-SCOPE-001`.

Gelesen wurden die vollständige Aufgabe, Musterlösung, beide Referenzprogramme,
der Verifier, examData und alle 19 vollständigen Originalziele einschließlich
der tatsächlichen Elternkontexte. Der aktuelle Sourceguard ist
`5a1487a47e61f59fbc9dfcd71e350443ce3357da171f6507cd85cd6c3a785e7e`.
Terminal und alle 19 Zielpayloads sind unabhängig gegen Commit
`a0e3c164426ee9d4513e9678daf0a47371cc8bbd` unverändert bestätigt; auch alle
gebundenen Elternkontexte stimmen mit der aktuellen Quelle überein.

Die Materialien enthalten tatsächlich die benötigten Zahlen, vollständigen
Fakten, Graphkanten, Schaltungs- und Ablaufmodelle sowie Betriebsannahmen.
Keine Aufgabe verlangt ein nicht geliefertes Dossier, Cloudkonto oder fremdes
Material. Die Zahlen-/Schaltungsrechnungen, Prologspuren, Sicherheitsgrenzen,
Threadabläufe und funktionalen Reduktionen sind im gesetzten Modell richtig
und lösbar. Das Niveau reicht von Begriffen und Anwendung bis zu eigenem
Entwurf, Fehleranalyse und begründeter Begrenzung; es passt zum vollständigen
Oberstufenpaket einschließlich seiner LK-Ziele. Zeitbedarf oder tatsächliche
Lernwirksamkeit wurden nicht gemessen.

Die 19 Kriterien sind je binär und gemeinsam verpflichtend. Von allen 524288
binären Bewertungsvektoren besteht genau der mit 19 Einsen. Kein Kriterium kann
durch Zusatzpunkte, eine optionale Aufgabenwahl oder einen anderen Bereich
ersetzt werden. Gleichwertige Programme und Begründungen bleiben zulässig,
müssen aber dieselben geforderten Leistungen zeigen. Diese Rechnung prüft den
Bewertungsvertrag; sie beweist nicht automatisch die Qualität einer späteren
konkreten Bewertung.

Der vorhandene Verifier wurde unabhängig erfolgreich ausgeführt. Tatsächlich
liefen die exakten Pythonlösungen mit acht Volladdierer- und 16 Zweibitfällen
sowie die vier Node-Fälle. Zusätzlich wurden alle 20 modellierten Threadfolgen
und die Fakten-/Graphmodelle geprüft. **Prolog wurde nicht mit SWI oder einem
anderen Prologsystem ausgeführt.** Der gesamte Prologquelltext wurde unter den
angegebenen Klausel-, Bindungs- und Suchregeln unabhängig nachvollzogen.
Cut verwirft die beschriebenen Alternativen; `is` wertet den rechten Ausdruck
aus. Diese verwendeten Sprachregeln entsprechen der offiziellen Dokumentation
zu [Cut](https://www.swi-prolog.org/pldoc/man?predicate=%21%2F0) und
[is/2](https://www.swi-prolog.org/pldoc/man?predicate=is%2F2).
Die Python-Faktenprüfung ersetzt keinen Prologlauf. Ebenso beweisen vier
Node-Fälle weder unbegrenzte JavaScript-Zahlengenauigkeit noch beliebige
Rekursionstiefe; die mathematischen Termgleichungen wurden davon getrennt
strukturell geprüft.

Es wurden keine englischen Originaltexte für die drei bislang nur deutschen
funktionalen Ziele erfunden. Der Review bestätigt die vorhandenen kanonischen
Zielbedeutungen, keine neue amtliche Zuordnung aller Bundesländer. Historische
Source-/QA-/Praxisbelege werden nicht umetikettiert.

Für die tatsächlichen HE- und BY-Views ergeben die Produktionsfunktionen
`collectCompositionProjectionRoleGoalIds` und `goalMatchesFilters`:

| Kurs | Terminal als Target | Seine Kompetenzen im Target |
| --- | --- | --- |
| HE-GK / BY-GK | ja | 6 von 19 |
| HE-LK / BY-LK | ja | 19 von 19 |

Root hat die Reparaturrichtung bestätigt: Die ursprüngliche Identität behält
ihre 19 Kompetenzen und den vollständigen neuen Inhalt als LK-Assessment.
Ein eigenes GK-Assessment braucht eine andere stabile ID und ein eigenes
explizites Ergebnis für seine tatsächlich geltenden Kompetenzen. Derselbe
globale Pass darf keine wechselnde kursabhängige Bedeutung bekommen. Ein
niedrigerer Schwellenwert oder eine stille Kürzung der 19er-Abdeckung würde
den Befund nicht lösen. Vor Anwendung folgen deshalb der vollständige
Viewcensus, genaue Daten-/Viewoperationen, Roots Zweitblick und echte
Schema-/QA-Prüfungen. Kein Curriculum-, Mastery- oder SRS-Datensatz wurde
durch diesen Review geändert; C(q) und Einheitenruntime sind nicht betroffen.
