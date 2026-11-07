# S0: Transitive Minimalität im tatsächlichen Mathematik-/Physikbestand

Der [reproduzierbare Istbericht](transitive-minimality.json) enthält **1.319
unerfüllte Minimalitätsbedingungen** nach Graph Definition §7.3: **923 in
Mathematik und 396 in Physik**. Dies ist kein akzeptierter Altbestand und keine
bestandene Validierung. Es wurden keine Curriculumkanten geändert.

Geprüft sind die vollständigen kanonischen Mathematik- und Physikbestände
mit 2.018 Zielen und ihre Referenz- und Vererbungshülle. Der kanonische
Overview-Wurzelknoten kommt als zusätzlicher Contains-Vorfahr hinzu:
insgesamt **2.019 Knoten, 4.146 verfasste Requires-Kanten, 2.174 Contains-Kanten
und 4.301 effektive Requires-Kanten**. 164 Referenzen überschreiten eine
Landscapegrenze; davon stammen zwei von der Overview-Wurzel. Die Hülle hat
keine unbekannten Referenzen und keinen Contains-/effektiven Requires-Zyklus.

## Genau geprüfte Regel

Für jede verfasste Kante `(g,p)` wird das Paar entfernt. Danach wird die
effektive Requires-Relation unter unverändertem Contains neu bestimmt.
Bleibt `p` von `g` aus erreichbar, ist die verfasste Kante redundant. Der
Zeugenpfad im Bericht gilt **nach** dieser Entfernung.

Der Auditkern sammelt zuerst alle direkten und transitiven Contains-Vorfahren.
Die effektiven Anforderungen eines Knotens sind die Vereinigung der eigenen
Requires und der Requires dieser Vorfahren. Für einen Entfernungsversuch wird
der entfernte Autorenursprung aus **allen** Beiträgen ausgeschlossen, auch aus
seinen geerbten Kopien. Andere Autorenursprünge derselben Anforderung bleiben
erhalten. Das entspricht der vollständigen Neuberechnung unter festem Contains;
die Tests vergleichen es mit einer unabhängigen wörtlichen Neuberechnung.

Auch ein benötigtes fremdes Ziel bringt seine Contains-Vorfahren und deren
Anforderungen mit. Ein allein für Vererbung ergänzter Vorfahr zieht seine
unbeteiligten Geschwisterzweige nicht in das Fachinventar. Wird dieser Vorfahr
selbst als Voraussetzung oder reguläres Contains-Ziel benötigt, werden auch
seine Nachfahren aufgelöst. Der Bericht nennt nur für Vererbung ergänzte
Vorfahren ausdrücklich unter `inheritanceOnlyAncestors`.

Maßgeblich ist die Erreichbarkeit auf den Zielknoten nach §7.3. Eine Anforderung
an einen Cluster erzeugt hier keine zusätzliche Kante zu dessen Kindern.
Die vollständige atomare Normalisierung für andere Gültigkeits- und
Laufzeitfragen ist eine getrennte Prüfung. Mastery, Fokus und Lernendenprofile
sind keine Eingaben. Der Auditor nimmt weder eine fachliche Quellenkorrektur
noch eine automatische transitive Reduktion vor.

14 Befunde sind direkte Duplikate durch Vererbung und betreffen damit auch
§7.2. In 21 Zeugenpfaden stammt mindestens ein Schritt aus einer geerbten
Anforderung. Die übrigen Befunde umfassen gewöhnliche transitive Alternativen.
Diese Kategorien dürfen sich überschneiden. Kein gegenwärtiger Zeugenpfad
benötigt eine fremdfachliche Kante; die 164 solchen Referenzen bleiben dennoch
vollständig im geprüften Graphen.

## Wiederholen und validieren

Vom Repositorywurzelverzeichnis, nach Installation der vorhandenen App-Abhängigkeiten:

```bash
app/node_modules/.bin/tsx app/scripts/testTransitiveMinimality.ts
app/node_modules/.bin/tsx app/scripts/auditTransitiveMinimality.ts --report-only --output docs/dev/learning-units-inventory/2026-11-06/transitive-minimality.json
app/node_modules/.bin/tsx app/scripts/auditTransitiveMinimality.ts --check
```

`--check` und der Aufruf ohne Modus sind echte Validierung: Befunde oder ungültige
Eingaben liefern Exitcode 1. Der aktuelle Bestand liefert daher **Exitcode 1**.
`--report-only` liefert einen ausdrücklich so bezeichneten Istbericht und
keine Freigabe; dessen erfolgreicher Prozessabschluss bedeutet allein, dass
der Bericht geschrieben wurde. Bei ungültigen Eingaben steht `invalid-input`
im Bericht. Es gibt keine Warnungsabstufung oder akzeptierte Befundliste.

Der CLI lädt die deutschen kanonischen Dateien als Referenzkatalog; ein nicht
auflösbarer Fremdverweis bricht die Validierung ab. `sources` pinnt die Dateien
der tatsächlich benutzten Hülle, `referenceCatalogSources` den kompletten
Auflösungskatalog. `auditorSha256` bindet den Algorithmus. Es gibt keinen
wechselnden Zeitstempel; derselbe Quellenstand erzeugt dieselben JSON-Bytes.

Damit UUIDs nicht in jedem Pfad mehrfach ausgeschrieben werden, verwendet das
JSON ein `goalKeys`-Wörterbuch. Jeder Befund hat gemäß `findingEncoding` die Form
`[Quelle, Voraussetzung, Zeugenpfad, Autorenquellen]`, jeweils als Wörterbuchindex.
Die Voraussetzung des i-ten Autorenursprungs ist der nächste Knoten im
Zeugenpfad. Die vollständigen kanonischen Kennungen und alle verbleibenden
Autorenursprünge bleiben damit rekonstruierbar.

Die Algorithmustests umfassen 572 gültige endliche Graphfälle gegen eine
unabhängige Kantenentfernung mit neu aufgebauter Vererbung sowie 3.593
zurückgewiesene effektive zyklische Graphfälle. Zusätzliche Gegenbeispiele
prüfen rohe Minimalität bei geerbter Redundanz, transitive Ketten, fremde
Vorfahren, mehrere Autorenursprünge, qualifizierte und einfache Referenzen,
Clustergrenzen, doppelte/mehrdeutige IDs und unbekannte Verweise. Diese Tests
qualifizieren keine reale Aufgabenabdeckung und beweisen keine fachliche
Angemessenheit der vorhandenen Kanten.

## Verbindlicher Integrationspunkt für S1

Der bestehende Job `graph-validation` in `.github/workflows/ci.yml` ruft
`npm run validate:graph` auf. Dieser S0-Audit wurde dort noch nicht integriert;
Package-Skripte und Workflows sind unverändert. Ein grüner bestehender
Graphjob belegt daher keine transitive Minimalität nach §7.3.

S1 muss den Auditor als hartes Gate für den ausdrücklich freizugebenden
Einheitsvertragsumfang samt vollständiger Referenz- und Vererbungshülle
integrieren. Offene Befunde sind dort Fehler; das bestehende Ergebnis wird
nicht als akzeptierte Baseline ausgeblendet. Ein pauschaler sofortiger
CI-Abbruch für sämtliche ungeprüften Legacyfächer gehört nicht zu S0.
Fachlich begründete Korrekturen und ihre Abnahme folgen in den jeweiligen
Arbeitspaketen.
