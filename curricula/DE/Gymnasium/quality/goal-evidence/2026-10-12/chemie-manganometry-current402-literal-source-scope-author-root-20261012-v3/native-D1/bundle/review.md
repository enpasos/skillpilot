# AI review input: Chemie – Redoxtitration mit korrigiertem aktuellem Quellenumfang

- Book ID: `chemie-manganometry-source-literal-current402-20261012-v3`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:67ad6e1e6433e05a2f946f3b7499a9d35c833bff5633423dc80b35cdcf4d6eda`
- Selected goals: 1

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Redoxtitrationen am Beispiel Manganometrie deuten

- Full learning-goal ID: `2fdd759f-8349-5f7e-b29a-6ac7fb0299f9`
- Goal fingerprint: `sha256:1b9ac3e998395cb81637d5509ce5fe21340abc87bcc51f8543fd3f6b5eba7fe9`
- Page fingerprint: `sha256:d336a9b9417eb0dcb9af544397b150721c6366bb723f4d3c36dfc08bf9cf65a6`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Chemisches Gleichgewicht > Q3.3 Redoxgleichgewichte

### Canonical description

Die lernende Person kann Redoxtitrationen fachgerecht durchführen und auswerten, Konzentrationen von Elektronenakzeptoren oder Elektronendonatoren in wässrigen Lösungen bestimmen und das Vorgehen mit Redoxgleichungen begründen, etwa am Beispiel der Manganometrie.

### Visualization

/assets/goal-visualizations/chemie/2fdd759f-8349-5f7e-b29a-6ac7fb0299f9/2fdd759f-8349-5f7e-b29a-6ac7fb0299f9.png

- original digest: `sha256:8a8d13e39b74c010cab2827ecbe073fcc36d5efadf607e18882232e7976c618b`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)
- Redoxbegriffe sicher anwenden — `04fa0ba1-eb6e-53c8-93d4-dfa28bb4b162` (outside this book)
- Oxidationszahlen bestimmen und bilanzieren — `4961130b-1ee8-58f2-a319-dff0a864db6a` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:96c806e71bec44fbb812f0defa82c95d467419bcc4ab75424f26322ed88607c6`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `experiment`

**Positive understanding expectations**

- `operation`
  - Essential understanding (DE): Eine Titration benötigt eine bekannte Bezugsstoffmenge, reproduzierbare Probenbehandlung und einen passend begründeten Endpunkt; eine Rechnung allein belegt keine Durchführung.
  - Essential understanding (EN): Titration requires a known reference amount, reproducible sample handling and a justified endpoint; calculation alone does not establish execution.
  - Observable performance (DE): Führt das freigegebene beaufsichtigte Verfahren sicher mit korrekter Pipettierung, Bürettenablesung, Endpunktannäherung und vollständigem Rohprotokoll aus; praktische Leistung muss tatsächlich beobachtet werden.
  - Observable performance (EN): Safely executes the approved supervised procedure with correct pipetting, burette reading, endpoint approach and complete raw records; practical performance must actually be observed.
- `redox`
  - Essential understanding (DE): Die Säurebedingungen und die Elektronenbilanz bestimmen das stöchiometrische Verhältnis; Elektronendonator und Akzeptor sind chemische Rollen.
  - Essential understanding (EN): Acid conditions and electron balance determine the stoichiometric ratio; donor and acceptor are chemical roles.
  - Observable performance (DE): Leitet die Halb-/Gesamtgleichungen der Manganometrie oder die beiden Stufen der Iodometrie ladungs-/atomerhaltend ab, begründet das verfahrensspezifische Stoffmengenverhältnis und trennt Endpunkt von Äquivalenz.
  - Observable performance (EN): Derives charge/atom-conserving half/overall permanganometry equations or the two iodometry stages, justifies method-specific stoichiometry and distinguishes endpoint from equivalence.
- `quantification`
  - Essential understanding (DE): Aus gültiger Referenzmenge und korrigiertem Titrantenverbrauch folgt der gesuchte Donator- oder Akzeptorgehalt; Präzision schließt systematische Fehler nicht aus.
  - Essential understanding (EN): A valid reference amount and corrected titrant consumption determine unknown donor or acceptor content; precision does not exclude systematic error.
  - Observable performance (DE): Wertet Rohstände, Blindwert und Wiederholungen begründet aus, berechnet Gehalte mit Einheiten, überträgt auf die inverse unbekannte Größe und beurteilt Verdünnung, falsche Spezies oder ungeeignete Bedingungen.
  - Observable performance (EN): Interprets raw readings, blank and repeats, calculates concentrations with units, transfers to the inverse unknown quantity and judges dilution, wrong species or unsuitable conditions.

**Coverage expectations**

- required expectations: `operation`, `redox`, `quantification`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `unknown-role`: Unbekannter Fe(II)-Donator versus Permanganat-Akzeptor; stöchiometrische Rechnung selbst umstellen. / Unknown Fe(II) donor versus permanganate acceptor; independently rearrange stoichiometric analysis.
- `validity`: Geänderte Verdünnung, praktische Endpunktbedingung oder fehlerhaft oxidierter Standard; Konsequenzen begründen statt Zahlen austauschen. / Changed dilution, practical endpoint condition or oxidized standard; justify consequences rather than substitute numbers.
- `method-transfer`: Manganometrie versus Iodometrie: unterschiedliche Reaktionsbilanz und Farbumschlag, gleiche referenzgestützte Gehaltsbestimmung. / Permanganometry versus iodometry: different reaction balances and colour changes, same reference-based concentration analysis.

**Application cases**

- `manganometry-01-fe-donor`
  - Task demand (DE): Bestimme den Fe(II)-Gehalt einer chloridfreien, sonst nicht reduzierenden Probe mit frisch standardisiertem KMnO4 (0,02000 mol/L). Führe das angegebene beaufsichtigte Verfahren mit drei frischen 20,00-mL-Aliquoten aus, begründe Stoffmengenverhältnis und Endpunkt und werte die separaten synthetischen Protokolle aus. Die Gehaltsangabe gilt für Fe(II), nicht automatisch für Gesamteisen. Diskutiere anschließend eine zuvor verdünnte Probe und eine braune statt rosa Endpunktbeobachtung.
  - Task demand (EN): Determine Fe(II) in a chloride-free sample containing no other reductant, using freshly standardized KMnO4 (0.02000 mol/L). Carry out the stated supervised method with three fresh 20.00-mL aliquots, justify stoichiometry and endpoint, and analyse the separate synthetic records. The reported concentration concerns Fe(II), not automatically total iron. Then consider a previously diluted sample and a brown rather than pink endpoint observation.
  - Expected performance (DE): Fe2+ -> Fe3+ + e−; MnO4− + 8H+ + 5e− -> Mn2+ + 4H2O. Nach Multiplikation der Eisen-Halbreaktion: MnO4− + 5Fe2+ + 8H+ -> Mn2+ + 5Fe3+ + 4H2O. Ladung links und rechts +17, alle Atome erhalten. Fe(II) ist Elektronendonator, Permanganat Akzeptor. Verbräuche 18,58/18,62/18,60 mL, Mittel 18,60 mL; nach Blindwert 18,56 mL. n(MnO4−)=0,02000*0,01856=0,0003712 mol; n(Fe2+)=5*n=0,001856 mol; c(Fe2+)=0,001856/0,02000=0,09280 mol/L. Das zugesetzte Säurevolumen verdünnt den Kolben, ändert aber die Stoffmenge des ursprünglichen Probenaliquots nicht. Der grobe Orientierungslauf wird nicht gemittelt. Der Rosaton stammt von einem kleinen Permanganatüberschuss, nicht von der Äquivalenz selbst oder einem zusätzlichen pH-Indikator. In der unabhängigen Verdünnungsvariation ist c(verdünnt)=0,01856 mol/L und c(Stock)=5*c=0,09280 mol/L. Braune Trübung ist mit MnO2-Bildung bei ungeeigneten Bedingungen vereinbar, beweist deren alleinige Ursache aber nicht. Die Mn(II)-Bilanz mit fünf Elektronen ist dann nicht ungeprüft anwendbar: Kontrolle von Ansäuerung, Material und Endpunkt, neuer gültiger Lauf statt blinder Korrekturrechnung. Die praktische Teilbewertung ist nur aus einer tatsächlich beobachteten Durchführung oder einer ausreichend vollständigen, authentisch zuordenbaren Aufzeichnung möglich. Beobachtet werden sichere Vorbereitung, korrektes Konditionieren/Pipettieren/Ablesen, kontrollierte Endpunktannäherung, vollständiges Rohprotokoll und begründeter Umgang mit Blindwert und fehlerhaften Läufen. Ein schöner Plan oder eine korrekte Rechnung erfüllt den Durchführungsoperator nicht. In diesem Autorenpaket ist kein solcher Leistungsnachweis enthalten: Daten und Lösungen sind ausdrücklich synthetische Aufgabenfixtures. Das P-Profil beschreibt ein geeignetes künftiges Assessment; M7 beansprucht weder eine bereits erbrachte Laborleistung noch menschliche Erprobung.
  - Expected performance (EN): Fe2+ -> Fe3+ + e−; MnO4− + 8H+ + 5e− -> Mn2+ + 4H2O. Multiplying the iron half-reaction gives MnO4− + 5Fe2+ + 8H+ -> Mn2+ + 5Fe3+ + 4H2O. Both sides carry charge +17 and conserve all atoms. Fe(II) donates electrons and permanganate accepts them. Consumptions are 18.58/18.62/18.60 mL, mean 18.60 mL; blank-corrected 18.56 mL. n(MnO4−)=0.02000*0.01856=0.0003712 mol; n(Fe2+)=5*n=0.001856 mol; c(Fe2+)=0.001856/0.02000=0.09280 mol/L. Added acid changes flask concentration but not the amount in the original sample aliquot. Do not average the rough overshoot trial. A faint pink colour signals a small permanganate excess, not equivalence itself or an additional pH indicator. The independent dilution variation gives c(diluted)=0.01856 mol/L and c(stock)=5*c=0.09280 mol/L. Brown turbidity is consistent with MnO2 under unsuitable conditions but does not prove its sole cause. Do not apply the five-electron Mn(II) balance unchecked: verify acidification, materials and endpoint and repeat a valid run rather than apply an unsupported numerical correction. Assess practical execution only from actually observed performance or a sufficiently complete, authentically attributable recording. Observe safe setup, correct conditioning/pipetting/reading, controlled approach to the endpoint, complete raw records and justified treatment of the blank and faulty trials. A good plan or correct calculation does not establish execution. This author packet contains no such performance evidence: data and worked solutions are explicitly synthetic assessment fixtures. The P profile designs an appropriate future assessment; M7 claims neither completed laboratory performance nor a human trial.
  - Understanding focus (DE): Beobachtbare Ausführung und stöchiometrisch begründete Gehaltsbestimmung samt unabhängigem Gültigkeits-/Transferurteil.
  - Understanding focus (EN): Observable execution and stoichiometrically justified concentration determination with independent validity/transfer reasoning.
- `manganometry-02-acceptor-standardization`
  - Task demand (DE): Du sollst die unbekannte Konzentration einer frischen Permanganatlösung bestimmen. Als zertifizierter, frisch bereitgestellter Standard steht ausschließlich Fe(II) mit 0,05000 mol/L zur Verfügung. Verwende drei 20,00-mL-Aliquote des Standards und dasselbe beaufsichtigte Verfahren. Leite die Berechnung für den diesmal unbekannten Elektronenakzeptor selbst ab. Danach verwechselt eine Person den Standard mit einer teilweise oxidierten Eisenlösung: Entscheide ohne bloßes Zahleneinsetzen, ob noch eine valide Standardisierung vorliegt und in welche Richtung der scheinbare Permanganatgehalt abweicht.
  - Task demand (EN): Determine the unknown concentration of a fresh permanganate solution using only a certified, freshly supplied 0.05000 mol/L Fe(II) standard. Use three 20.00-mL standard aliquots and the same supervised method. Derive the calculation for the electron acceptor, which is now unknown. Then someone substitutes a partially oxidized iron solution for the standard: decide conceptually whether the standardization remains valid and predict the direction of the apparent permanganate concentration.
  - Expected performance (DE): Die gleichen Halb- und Gesamtgleichungen gelten, doch diesmal ist n(Fe2+) bekannt. Verbräuche 10,02/10,00/9,98 mL, Mittel 10,00 mL. n(Fe2+)=0,05000*0,02000=0,001000 mol; n(MnO4−)=n(Fe2+)/5=0,0002000 mol; c(MnO4−)=0,0002000/0,01000=0,02000 mol/L. Der Akzeptor ist weder wegen seines unbekannten Gehalts ein Donator noch aufgrund seiner Position in der Bürette definiert. Ein ungeprüfter Blindwert aus dem anderen Fall wäre ein Fehler. Im frischen Gegenbeispiel enthält das Aliquot nur 0,0008000 mol Fe(II): wahrer Verbrauch 8,00 mL. Mit dem falschen Etikett würde 0,0002000/0,00800=0,02500 mol/L, also ein zu hoher scheinbarer Permanganatgehalt errechnet. Das vorhandene Fe(III) liefert keine zusätzliche Fe(II)-Elektronenmenge. Eine valide Standardisierung erfordert einen verlässlich bekannten Fe(II)-Gehalt; Gesamteisen oder ein Etikett genügt nicht. Der Standard muss ersetzt/verifiziert werden; keine willkürliche Korrektur ohne unabhängige Information. Sichere praktische Durchführung und die begründete Auswertung werden getrennt beobachtet, bilden aber gemeinsam diese Titrationskompetenz. Die praktische Teilbewertung ist nur aus einer tatsächlich beobachteten Durchführung oder einer ausreichend vollständigen, authentisch zuordenbaren Aufzeichnung möglich. Beobachtet werden sichere Vorbereitung, korrektes Konditionieren/Pipettieren/Ablesen, kontrollierte Endpunktannäherung, vollständiges Rohprotokoll und begründeter Umgang mit Blindwert und fehlerhaften Läufen. Ein schöner Plan oder eine korrekte Rechnung erfüllt den Durchführungsoperator nicht. In diesem Autorenpaket ist kein solcher Leistungsnachweis enthalten: Daten und Lösungen sind ausdrücklich synthetische Aufgabenfixtures. Das P-Profil beschreibt ein geeignetes künftiges Assessment; M7 beansprucht weder eine bereits erbrachte Laborleistung noch menschliche Erprobung.
  - Expected performance (EN): The same half-reactions and overall reaction apply, but the Fe(II) amount is now known. Consumptions are 10.02/10.00/9.98 mL, mean 10.00 mL. n(Fe2+)=0.05000*0.02000=0.001000 mol; n(MnO4−)=n(Fe2+)/5=0.0002000 mol; c(MnO4−)=0.0002000/0.01000=0.02000 mol/L. An acceptor does not become a donor because its concentration is unknown, and burette position does not define either role. Importing the other case's blank without checking is wrong. The fresh counterexample aliquot contains only 0.0008000 mol Fe(II), giving a true 8.00-mL consumption. The wrong label would imply 0.0002000/0.00800=0.02500 mol/L, an overestimate of permanganate concentration. Fe(III) supplies no additional Fe(II) electron amount. Valid standardization needs independently known Fe(II) content; total iron or a label alone is insufficient. Replace/verify the standard rather than apply an arbitrary correction without independent information. Observe safe execution and reasoned analysis separately, while assessing their coordinated titration competence. Assess practical execution only from actually observed performance or a sufficiently complete, authentically attributable recording. Observe safe setup, correct conditioning/pipetting/reading, controlled approach to the endpoint, complete raw records and justified treatment of the blank and faulty trials. A good plan or correct calculation does not establish execution. This author packet contains no such performance evidence: data and worked solutions are explicitly synthetic assessment fixtures. The P profile designs an appropriate future assessment; M7 claims neither completed laboratory performance nor a human trial.
  - Understanding focus (DE): Beobachtbare Ausführung und stöchiometrisch begründete Gehaltsbestimmung samt unabhängigem Gültigkeits-/Transferurteil.
  - Understanding focus (EN): Observable execution and stoichiometrically justified concentration determination with independent validity/transfer reasoning.
- `iodometry-03-iodate-acceptor`
  - Task demand (DE): Übertrage das Redoxtitrationsprinzip auf eine Iodometrie: Bestimme die Iodatkonzentration in einer wässrigen, sonst nicht oxidierenden/reduzierenden Probe. Führe das konkret benannte beaufsichtigte Verfahren aus, erläutere den Unterschied zum Permanganat-Endpunkt und begründe beide Reaktionsstufen. Werte die getrennten synthetischen Messstände und den Blindwert aus. Beurteile anschließend einen Ansatz, der nach der Iodfreisetzung längere Zeit offen stehen bleibt: Reichen drei ähnliche Titrationen als Gültigkeitsbeleg?
  - Task demand (EN): Transfer the redox-titration principle to iodometry: determine iodate concentration in an aqueous sample containing no other oxidant/reductant. Execute the named supervised procedure, explain the distinction from the permanganate endpoint and justify both reaction stages. Analyse the separate synthetic readings and blank. Then assess a flask left open for a prolonged period after iodine release: do three similar titrations establish validity?
  - Expected performance (DE): Führt das freigegebene beaufsichtigte Iodometrieverfahren mit korrekt behandeltem Aliquot, KI-/Säureüberschuss, kontrollierter Iodfreisetzung, sofortiger Titration, später Stärkezugabe und vollständigem Rohprotokoll tatsächlich beobachtbar aus; ein Plan oder synthetisches Rechenergebnis belegt keine Ausführung. Begründet IO3−+5I−+6H+→3I2+3H2O und I2+2S2O3(2−)→2I−+S4O6(2−); I2/I3−-Gleichgewicht erhält die Iod-Äquivalentmenge. Leitet 1:6 statt 5:1 ab. Verbräuche 12,10/12,12/12,14 mL; Mittel 12,12 mL minus Blindwert 0,12 mL ergibt 12,00 mL. 0,01000 mol/L*0,01200 L/6/0,01000 L=0,002000 mol/L Iodat. Unterscheidet verschwindende Stärkefarbe von bleibendem Permanganatüberschuss. Iodverlust senkt den scheinbaren Gehalt; ein no-Iodat-Blindwert oder übereinstimmende Wiederholungen korrigieren keine probenspezifischen Verluste. Begründet einen gültigen frischen Lauf und verweigert unbelegte Verlustkorrektur. Die ganzen Verfahren, Lösungen und Rubriken sind im zugehörigen Drei-Fälle-Artefakt enthalten. Keine tatsächliche Lernendenleistung, menschliche Erprobung oder Freigabe wird durch die synthetischen Fixtures behauptet.
  - Expected performance (EN): Actually executes the approved supervised iodometry method with a correct aliquot, excess KI/acid, controlled iodine liberation, immediate titration, late starch addition and complete raw records; planning or synthetic calculation alone does not prove execution. Justifies IO3−+5I−+6H+→3I2+3H2O and I2+2S2O3(2−)→2I−+S4O6(2−); I2/I3− equilibrium preserves iodine-equivalent amount. Derives 1:6 rather than 5:1. Consumptions 12.10/12.12/12.14 mL average 12.12 mL; subtracting the 0.12-mL blank gives 12.00 mL. 0.01000 mol/L*0.01200 L/6/0.01000 L=0.002000 mol/L iodate. Distinguishes disappearing starch colour from persistent excess permanganate. Iodine loss lowers apparent content; a no-iodate blank or concordant repetitions cannot correct sample-specific losses. Justifies valid fresh trials and rejects an unsupported numerical loss correction. Complete methods, solutions and rubrics are provided in the associated three-case artifact. Synthetic fixtures establish no actual learner performance, human trial or approval.
  - Understanding focus (DE): Dasselbe quantitative Redoxtitrationsprinzip mit anderer Reaktionskette und anderem Endpunkt; beobachtbare sichere Iodometrie sowie unabhängiges Gültigkeitsurteil.
  - Understanding focus (EN): The same quantitative redox-titration principle with a different reaction chain and endpoint; observable safe iodometry and independent validity judgment.
