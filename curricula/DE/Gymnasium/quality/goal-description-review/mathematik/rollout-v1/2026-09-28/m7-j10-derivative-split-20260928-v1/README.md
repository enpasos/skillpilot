# Ableitungsbeziehungen und Funktionsuntersuchung: umgesetzter Split

Stand: 28. September 2026. KI-Strukturarbeit; keine menschliche Freigabe oder Host-Erprobung. Dieses Paket bindet keine zentralen D/P- oder V-Nachweise.

Der frühere Mischknoten `1a18dbb3-f350-4766-9c8b-20ca018ccef1` bleibt als curricularArea mit zwei getrennten curricularAtomic-Kindern erhalten. Die verbindlichen bilingualen Texte stehen in `final-child-definitions.json`:

- `5518ceb3-f668-5b52-a9b1-57653b16ca98`: Funktions- und Ableitungsgraphen in Beziehung setzen. Die Rückrichtung ergibt einen möglichen Funktionsgraphen; die additive Konstante bleibt offen.
- `2850e8f6-2330-50d3-a577-d519540d9924`: Monotonie und Extrema mit der ersten Ableitung untersuchen. Das Vorzeichen begründet lokale Aussagen; relevante Funktionswerte einschließlich Randwerten entscheiden globale Extrema auf einem angegebenen Bereich.

Alte Mastery-Werte oder A/M/D/P-Nachweise werden nicht als neue Kindnachweise übernommen. Beide Kinder wurden einzeln hinsichtlich Atomicity und Memory beurteilt; die historischen Mischentscheidungen bleiben hier erhalten. Semantic-kind-Fingerprints, Atlasplatzierung und betroffene Vorfahrgewichte sind aktualisiert.

## Quellen und Voraussetzungen

`direct-source-routing.json` dokumentiert fünf tatsächlich gelesene direkte BW-Quellrouten. Monotoniedefinition, lokale/globale Extrema und die Ableitungsuntersuchung stützen das zweite Kind partiell; der wechselseitige graphische Schluss stützt das erste Kind partiell. Der alte BW-Laufzeit-Exact-Match wurde in zwei partielle Kindkanten umgewandelt. Andere bereits passende Ziele derselben Quellzeile bleiben erhalten.

`additional-graph-source-routing.json` ergänzt vier einzeln gelesene Graphzeilen aus BB, BE, HB und HH. Keine breite Vorfahrenkante wurde auf die Kinder kopiert; Cluster und Kinder besitzen eine Vererbungsgrenze für Mappingevidenz. Der genaue Compilerbericht steht in `current-source-scope-report.json`: Graphbeziehungen haben direkte partielle Mappings in BB/BE/BW/HB/HH; die Extremwertuntersuchung hat solche Mappings in BW. Die weitere vorhandene Verfügbarkeit entsteht über `requires-closure`, insbesondere über bestehende Prüfungs- und Krümmungsziele. Dies ist Voraussetzungserreichbarkeit und kein normativer Quellenbeleg. Der breite bisherige Landesumfang wurde nicht verkleinert oder als neu geprüft ausgegeben. Eine landesspezifische J10-Platzierungsprüfung bleibt vom eigentlichen Split unterscheidbar.

Das Graphkind benötigt Ableitungsbegriff und bestehende Orientierung. Das Untersuchungskind benötigt zusätzlich die Ableitungsregeln. Die drei direkten Verbraucher wurden fachlich getrennt umgestellt: Tangenten/Normalen benötigen Ableitungsregeln; Approximation behält den Tangentenweg und verliert die unnötige Sammelvoraussetzung; Krümmung behält zusätzlich die qualitative Graphbeziehung. `prerequisite-routing.json` enthält die einzelnen Entscheidungen. Diese Verbraucher benötigen neue D/P-Kontextbindungen: `b43a1e45`, `06bdbecb`, `ad66009f`.

## Aufgaben und Ansichten

Das neue Graph-Assessment `632a3837-7381-5701-9cfa-4ae15ccae8ba` liegt im bestehenden J10-Prüfungsordner. Zwei tatsächlich gegebene Graphen verlangen eigenständige Skizzen in beiden Richtungen, Steigungs-/Vorzeichenbegründung und die Erklärung der vertikalen Unbestimmtheit. Eigene mathematisch erzeugte SVG-Aufgabengrafiken liegen im Assessmentordner und identisch im öffentlichen Assetpfad. Sie sind Aufgabenmaterial und keine M7-Zielvisualisierung.

Die bestehende J10-Aufgabe 3 `2f626446-4b32-5674-a687-9cd754bdfede` wurde auf 18 BE erweitert. Der Verlauf von f'(x)=0,3(x−1)(x−3) auf [0,5] verlangt vollständige Monotonie, lokale Vorzeichenwechsel, globale Randwertvergleiche und das Gegenbeispiel einer stationären Nicht-Extremstelle. Die ursprüngliche Aufgabe bleibt historisch erhalten. 17 BE und ausdrücklich erklärte Teilpunktgrenzen verhindern Bestehen ohne den neuen Kern; der Server erzwingt die Gesamtpunktgrenze, die fachliche Einzelbewertung bleibt Aufgabe der bewertenden Instanz.

Assessmenttexte, Lösungen und KI-Prüfung liegen unter `curricula/DE/Gymnasium/assessments/mathematik/derivative-split-2026-09-28/`. Kindabdeckung und prerequisites sind aus den tatsächlich gestellten Aufgaben abgeleitet. `view-routing.json` dokumentiert die 18 erweiterten direkten Referenzen einschließlich Atlas. Vier betroffene Dauerlayouts haben eine gehashte Adjudikation; der globale Generator muss nach Abschluss aller parallelen Änderungen erneut laufen.

## Bild- und Integrationsbedarf

Die ursprüngliche 1a18-Grafik stellt eine geeignete gemeinsame Funktions-/Ableitungsbeziehung dar. Ihre graue Tabellenführung bei x=0 war jedoch ungenau; dieser konkrete Bildbefund wurde an die Bildintegration übergeben. Beide Kinder benötigen aktuelle eigene Bildbindungen und unabhängige D/P-Prüfungen am finalen Bild. Eine eventuelle Wiederverwendung muss den Originalprovider und Prompt sowie die Adaptation bewahren. Alte Sammel-ID aus aktiven atomaren Reviewpaketen entfernen, ohne historische Reviews umzudeuten.

Lokal bestanden: alle 297 Composition Views (nach zusätzlichem Vektorsplit), Exam-Markdown, Mathematics checkpoint contracts und die vollständige Sek-I-Examroute-Regression. Alle vier Kinder dieses Ableitungs-/Vektorpakets haben aktuelle A/M-Nachweise. Der globale Graphcheck enthält nach der Vektor-Motivationskorrektur nur parallel bearbeitete fremde Altclusterverweise. Der globale A/M-Check und Duration-Hash müssen nach den parallelen Paketen frisch geprüft werden. `git diff --check` war grün. Keine Aussage über abschließende CI oder strikten M7-Abschluss.
