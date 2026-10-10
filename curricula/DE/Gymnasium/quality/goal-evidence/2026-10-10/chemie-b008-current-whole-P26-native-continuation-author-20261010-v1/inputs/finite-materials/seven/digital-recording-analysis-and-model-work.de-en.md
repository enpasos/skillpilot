# Daten und Modelle: verfügbare Arbeitsmaterialien / Data and models: available worksheets

**Alle Zahlen sind bereitgestellte synthetische Lehrdaten. / All numbers are supplied synthetic teaching data.**
Die Dateien sind Materialien für spätere eigene Lernendenprodukte. Es wurde kein Lernender geprüft und kein Experiment durchgeführt. / These files are materials for future own learner products. No learner was assessed and no experiment was carried out.

## Dokumentation / Documentation

DE: Importiere die R1-Rohdaten in eine tatsächlich verwendete Tabellenkalkulation. Erstelle in `documentation.blank.csv` deine eigene strukturierte Dokumentation; füge Einheiten, Herkunft, Bedingungen und fehlende Angaben ausdrücklich ein. Rohwerte und Interpretationen müssen getrennt bleiben. Die bloße Anzeige der bereits ausgefüllten Rohdaten ist noch kein eigenes Dokumentationsprodukt. Für R2 wird W3 als separates Ereignis aus der ganzen Transfernotiz erfasst. Alte R1-Daten bleiben unverändert. Kein R2-Zeit-/Massen-/Volumenwert wird aus R1 übertragen.

EN: Import R1 raw data into an actually used spreadsheet. Make your own structured record in `documentation.blank.csv`, explicitly recording units, provenance, conditions and missing entries. Keep raw values and interpretations separate. Merely displaying the supplied populated raw file is not an own documentation product. Record R2 batch W3 as a separate event from the full transfer note. Leave R1 unchanged. Do not transfer R1 time, mass or volume values to R2.

DE: Kalibration: Erstelle eigene Rechenspalten für den Mittelwert von U7, Steigung `(0.170-0.010)/2`, verdünnte Konzentration `(A_mean-0.010)/slope` und ursprüngliche Konzentration `c_diluted*dilution_factor`. Gib Größen/Einheiten an. Nutze zunächst Faktor 2; protokolliere die Transferkorrektur Faktor 4 in `audit-log.blank.csv`. Bewahre beide Berechnungsstände und die unveränderten Rohwerte. Nicht gelieferte Korrekturzeit/-autoren bleiben fehlend.

EN: Calibration: create your own calculation columns for U7 mean, slope `(0.170-0.010)/2`, diluted concentration `(A_mean-0.010)/slope` and original concentration `c_diluted*dilution_factor`. Label quantities/units. Initially use factor 2; log the transfer correction to factor 4 in `audit-log.blank.csv`. Preserve both calculation versions and unchanged raw data. Missing correction time/author remain missing.

## Datenauswertung / Data analysis

DE: Erstelle selbst Mittelwertspalten der T1-Zeilen und ein x-y-Diagramm (x Temperatur/°C, y Auflösezeit/s) mit beiden Einzelreihen sowie dem Mittelwert. Markiere T1-fresh als neue Bedingung und zeige die Streuung. Die 50-°C-Zeile erhält keine erfundene Gleichheitsbestätigung für Rühren. Für K1: x NaCl-Konzentration/g L⁻¹, y Leitfähigkeit/µS cm⁻¹. Sucrose und Blindwert sind Vergleichsproben, keine Punkte derselben NaCl-Konzentrationsreihe. Einheiten/Temperatur und Hypothesenurteil müssen im eigenen Ergebnis stehen. Speichere tatsächliches Tabellen-/Diagrammprodukt, verwendete Formeln und Begründung. Ein Bild allein belegt keine digitale Datenerfassung oder tatsächliche Softwarebedienung.

EN: Create mean columns for T1 rows and an x-y graph (x temperature/°C, y dissolution time/s), showing individual series and means. Mark T1-fresh as a new condition and show the spread. Do not invent confirmation of identical stirring in the 50 °C row. For K1, use x NaCl concentration/g L⁻¹, y conductivity/µS cm⁻¹. Sucrose and blank are comparison samples, not points of the same NaCl concentration series. Your own output must include units, temperature and a hypothesis judgment. Save the actual spreadsheet/graph, formulas and reasoning. A picture alone establishes neither digital recording nor actual software use.

## Analoge Nutzung / Analogue use

DE: Fertige aus der TSV-Inventarliste eigene Karten/Skizzen an. Ordne vier H- und zwei O-Karten zuerst zu 2 H₂ + O₂ und dann zu 2 H₂O. Halte eigene Anordnung/Skizze mit Atomzählung fest. Ordne Na⁺/Cl⁻ im festen Modell abwechselnd, im Wasser beweglich an. Vergleiche dieses Ladungs-/Beweglichkeitsmodell mit ungeladenen Kugeln anhand der vorgegebenen Leitfähigkeitsbeobachtung. Für Wasser orientiere die O-Seite zu Na⁺ und die H-Seiten zu Cl⁻. Die Partialladungen sind keine ganzen Ionenladungen.

EN: Make your own cards/sketches from the TSV inventory. Arrange four H and two O cards first as 2 H₂ + O₂ and then as 2 H₂O. Record your own arrangement/sketch and atom count. Arrange Na⁺/Cl⁻ alternately in the solid model and mobile in water. Compare this charge/mobility model with uncharged balls using the supplied conductivity observation. Orient water's O end toward Na⁺ and H ends toward Cl⁻. Partial charges are not whole ionic charges.

## Eigene digitale Implementierung / Own digital implementation

DE: Öffne `digital-model-rule.blank.csv` in einer Tabellenkalkulation. Implementiere selbst eine bedingte Regel: Wenn Ionenladung null ist, Ergebnis **unbestimmt**; sonst Produkt von Ionenladung und Vorzeichen der zugewandten Partialladung kleiner null → **anziehend**, größer null → **abstoßend**. Beispiel für Zeile 2 in englischer Formel-Syntax: `IF(C2=0,"undetermined",IF(C2*E2<0,"attracting",IF(C2*E2>0,"repelling","undetermined")))`. Passe lokale Funktionsnamen/Trennzeichen an das verwendete Programm an. Prüfe alle sechs Eingaben einschließlich U; dokumentiere eigene Formel, Ergebnisse, Vergleich mit Wasser-Ionen-Orientierung und Grenzen. Ein vorgegebenes Regelblatt oder das Nachsprechen des Ergebnisses ersetzt das eigene implementierte und geprüfte Tabellenprodukt nicht.

EN: Open `digital-model-rule.blank.csv` in a spreadsheet. Implement your own conditional rule: if the ionic charge is zero, output **undetermined**; otherwise an ionic-charge/facing-partial-charge-sign product below zero means **attracting**, above zero means **repelling**. Example for row 2 using English formula syntax: `IF(C2=0,"undetermined",IF(C2*E2<0,"attracting",IF(C2*E2>0,"repelling","undetermined")))`. Adapt local function names/separators to the software. Test all six inputs, including U; document your own formula, outputs, comparison with ion–water orientation and limits. A supplied rule sheet or reciting its answer does not replace your own implemented and checked spreadsheet.

DE/EN: Diese rein qualitative Ladungsregel ist keine Simulation von Löslichkeit, Energie, vollständiger Hydratation oder exakter Geometrie. / This qualitative charge rule is not a simulation of solubility, energy, complete hydration or exact geometry.

## Praktische Pflichten / Practical duties

DE: Quellenpflichten, die tatsächliche Planung, Durchführung oder digitale Messwerterfassung verlangen, bleiben offen. Bereitgestellte Daten, das Importieren einer CSV und eine eigene Auswertung sind dafür kein Messnachweis. Ein späterer praktischer Nachweis braucht die tatsächlich geforderte Stufe der Selbstständigkeit, beobachtetes Vorgehen, Geräte-/Proben-/Zeitbezug und Protokoll. Dieses Paket behauptet keinen solchen Nachweis.

EN: Source duties requiring actual planning, experimental conduct or digital acquisition of measurements remain open. Supplied data, CSV import and own analysis do not evidence measurement. A later practical demonstration needs the actually required independence, observed procedure, instrument/sample/time references and protocol. This packet claims no such demonstration.
