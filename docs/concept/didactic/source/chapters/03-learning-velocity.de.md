## Lerngeschwindigkeit (Learning Velocity) {#sec:learning-velocity}

:::note{title="Abgrenzung zu Cockpit-Historie und Lernplanstatus"}
Das aktuelle Cockpit-Diagramm zählt **aufgezeichnete Abschlussereignisse** (*recorded completions*), keine veränderlichen Mastery-Zeitstempel. Ein Ereignis kann auch ein erneuter Abschluss an einem späteren Kalendertag sein und umfasst neben Fachzielen auch Abschlussmarkierungen wie Orientierungsziele, ohne diese als fachlichen Beherrschungsnachweis auszugeben. Die bloße wöchentliche Abschlusszahl darf **nicht** als Termintreue ausgegeben werden; verbindlich für Planstand und Tages-/Wochenpensum ist @ref{sec:unified-plan-status} (ergänzende Entwurfsüberlegungen zur Kalender- und Pufferplanung stehen im [Zeitachsenkonzept](repo:docs/concept/didactic/curriculum-time-axis-and-pacing.md)).
:::

### Zweck und konzeptuelle Definition {#sec:velocity-definition}

Die Lerngeschwindigkeit (*Learning Velocity*) ist eine didaktische Kontinuitätsmetrik: Sie macht **Beständigkeit und Lernrhythmus** über die Zeit sichtbar und unterstützt regelmäßiges Dranbleiben statt kurzfristiger Spitzen.

Konzeptuell zählt die Lerngeschwindigkeit die neu gemeisterten **atomaren** Lernziele je Kalenderwoche $w$:

$$
\mathrm{velocity}(w) = \bigl|\{\, g \in A \mid \mathrm{mastered}(g) \land \mathrm{achieved\_at}(g) \in w \,\}\bigr|.
$$

- **Ausschließlich atomare Ziele:** Nur Blattknoten zählen (keine Cluster), um strukturelle Mehrfachzählung auszuschließen.
- **Binäres Zielergebnis:** Ein Lernziel ist entweder gemeistert oder nicht gemeistert; Teilpunkte auf Zielebene gibt es nicht. Die aktuelle Speicherschwelle `mastery >= 0.9` dient der technischen Kompatibilität und ist weder Notenskala noch Teilbeherrschung.
- **Kalenderbasis:** Die heutige Cockpit-Auswertung („aufgezeichnete Abschlüsse“, siehe [Daily Learning Progress](repo:docs/concept/runtime-workflows/daily-learning-progress.md)) gruppiert Ereignisse nach `Europe/Berlin`-Kalenderwochen, zählt dasselbe Ziel höchstens einmal pro Tag und lässt ältere undatierte Bestandsdaten sichtbar, ohne sie künstlich in das Diagramm nachzutragen.

### Interpretation, Entwurfsprinzipien und Grenzen {#sec:velocity-caveats}

- **Verhaltensindikator statt Benotung:** Eine stabile Folge nicht-leerer Wochen spricht für verlässliche Lerngewohnheiten; Spitzen deuten auf Sprintphasen, Lücken auf Unterbrechungen oder Überlastung hin.
- **Fairness, Stabilität, Motivation:** Die Beschränkung auf atomare Ziele in festen Wochenintervallen (etwa als 8–12-Wochen-Balkendiagramm neben letzten Erfolgen) hält die Anzeige unmittelbar verständlich.
- **Keine Import-Spitzen:** Importe und allgemeine Änderungszeitstempel dürfen keine künstlichen Ausschläge erzeugen; das transaktionale Abschluss-Ledger schließt sie bewusst aus.
- **Keine direkte Vergleichbarkeit über Personen und Ferien hinweg:** Zeitbudgets und Zielaufwände unterscheiden sich, Fach- oder Phasenwechsel können die Wochenzahl vorübergehend senken, und reine Kalenderwochen bilden weder Ferien noch Unterrichtsausfall oder Puffer ab.
- **Optionale Erweiterungen:** Gleitender Durchschnitt, getrennte Auswertung nach Fach oder Phase sowie rein freiwillige (Opt-in) Hinweise nach längeren Pausen.
