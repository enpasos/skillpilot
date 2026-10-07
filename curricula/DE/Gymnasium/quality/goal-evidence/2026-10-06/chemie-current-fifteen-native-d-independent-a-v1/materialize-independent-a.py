import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
OWN = Path(__file__).resolve().parent
AUTHOR = OWN.parent / 'chemie-current-atomic-description-positive-gap-author-v1'
NATIVE = AUTHOR / 'native-d-fifteen'
ROUND = NATIVE / 'round-a'
assert not (OWN / 'native-fifteen-d-independent-a.final.freeze.json').exists()

def read(path):
    return json.loads(path.read_text())

def sha(data):
    return 'sha256:' + hashlib.sha256(data).hexdigest()

def write(path, obj):
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')

# Independently formulated after reading all actual frozen PDF/HTML goal pages
# and official HE physical/printed 36/38/39/42. No P author materials or B results.
# Each tuple: decision, essential DE/EN, performance DE/EN, transfer DE/EN,
# rationale, optional complete replacement DE/EN.
decisions = [
 ('keep',
  'Einfach-, Doppel- und Dreifachbindungen bestimmen die Stoffklasse; homologe Glieder unterscheiden sich um CH2, Konstitutionsisomere in der Verknüpfung. Namen und Struktur- oder Skelettformeln beschreiben dieselbe Konstitution.',
  'Single, double and triple bonds determine the substance class; homologous members differ by CH2, while constitutional isomers differ in connectivity. Names and structural or skeletal formulas describe the same constitution.',
  'Die lernende Person benennt unvertraute kurze Kohlenwasserstoffe, übersetzt Namen in Formeln, ordnet sie einer homologen Reihe zu und begründet anhand der Verknüpfung, ob zwei Darstellungen Isomere oder dasselbe Molekül zeigen.',
  'The learner names unfamiliar short hydrocarbons, translates names into formulas, assigns them to a homologous series and uses connectivity to justify whether two representations show isomers or the same molecule.',
  'Bei verzweigter statt gerader Kette oder einer Mehrfachbindung an anderer Position werden Nummerierung, Klassifikation und Isomerievergleich erneut aus der Struktur hergeleitet.',
  'For a branched rather than straight chain, or a multiple bond in another position, numbering, classification and comparison of isomers are derived again from the structure.',
  'KEEP: HE36 E.3 trägt Alkane/Alkene; HE38 Q1.1 GK/LK trägt ausdrücklich auch Alkine, Skelettformeln und Konstitutionsisomerie. Das E-Kompatibilitätsbreadcrumb allein belegt Alkine nicht. Die Verben operationalisieren eine zusammenhängende Strukturklassifikation und Repräsentation derselben Kohlenwasserstofffamilien; kein Wortzahl-Split. DE/EN äquivalent. Tatsächliche PDF3/HTML1 zeigen korrekte Ethan/Ethen/Ethin-Bindungsverhältnisse; Ethen wird ausdrücklich nicht als cis/trans-Isomer bezeichnet.'),
 ('keep',
  'Dispersionskräfte wirken zwischen allen Molekülen; geeignete O-H-Gruppen ermöglichen zusätzlich Wasserstoffbrücken. Siede-, Schmelz- und Löslichkeitsverhalten entstehen aus zwischenmolekularen Wechselwirkungen, Molekülstruktur und dem betrachteten System.',
  'Dispersion forces act between all molecules; suitable O-H groups additionally enable hydrogen bonding. Boiling, melting and solubility behaviour result from intermolecular interactions, molecular structure and the system considered.',
  'Die lernende Person begründet Eigenschaftsunterschiede ausgewählter Vergleichsstoffe aus wirksamen Wechselwirkungen und unterscheidet dabei die Trennung von Molekülen von einem Bruch kovalenter Bindungen; für Schmelzvergleiche berücksichtigt sie die gegebenen Struktur- und Packungsdaten.',
  'The learner justifies property differences between selected comparison substances from their interactions and distinguishes separation of molecules from breaking covalent bonds; melting comparisons use the supplied structural and packing information.',
  'Bei verändertem Kohlenwasserstoffrest oder geändertem Lösungsmittel werden Konkurrenz und Stärke der relevanten Wechselwirkungen neu verglichen; eine universelle Rangfolge aus einem einzelnen Gruppennamen wird nicht übernommen.',
  'When the hydrocarbon residue or solvent changes, competition and strength of the relevant interactions are compared again; a universal ranking is not copied from a functional-group name.',
  'KEEP: Einfluss und ausgewählte Stoffe behaupten keine universelle Schmelzpunkt-Rangregel. HE36 E.3 sowie HE38/39 Q1.1/Q1.2 tragen den Wechselwirkungsbezug; keine nationale Direktquellenfreigabe. DE/EN äquivalent. PDF4/HTML2 tatsächlich gelesen. Die drei Siedebeispiele sind als ausgewählte Vergleiche plausibel; die PDF-Titelzeile reicht rechts sehr nah an den Rand, HTML passt vollständig. Ein Drucklayout-Hinweis wird separat festgehalten, ohne den zutreffenden Fachtext umzuformulieren.'),
 ('keep',
  'Lichtinduzierte homolytische Spaltung erzeugt Radikale; in der Kettenfortpflanzung entstehen Produkt und ein neues Radikal, während Rekombinationen die Kette abbrechen. Atom- und Radikalbilanzen unterscheiden diese Schritte.',
  'Light-induced homolytic cleavage produces radicals; propagation forms product and a new radical, while recombination terminates the chain. Atom and radical bookkeeping distinguish these steps.',
  'Die lernende Person erläutert Start, beide Fortpflanzungsschritte und einen geeigneten Abbruch der Bromierung eines Alkans, stellt die Zwischenstufen mit Radikalmarkierungen dar und begründet, weshalb die Fortpflanzung wieder ein Radikal bereitstellt.',
  'The learner explains initiation, both propagation steps and a suitable termination step in alkane bromination, represents intermediates with radical notation and explains why propagation provides another radical.',
  'Für ein anderes einfaches Alkan oder eine veränderte Beleuchtung werden mögliche Zwischenstufen und die Funktion der Startreaktion aus demselben Kettenprinzip abgeleitet, ohne eine eindeutige Produktverteilung zu erfinden.',
  'For another simple alkane or changed illumination, possible intermediates and the function of initiation are derived from the same chain principle without inventing a unique product distribution.',
  'KEEP: Mechanismus erläutern und Zwischenstufen darstellen sind derselbe erklärende Kompetenzkern; DE/EN stimmen überein. HE36 E.3 und HE38 Q1.1 tragen die radikalische Bromierung. PDF5/HTML3 zeigen tatsächlich Start, beide Kettenschritte und mehrere plausible Rekombinationen mit erhaltenen Atomen. Kein unsupervisiertes Experiment und kein Selektivitäts-/Ausbeuteanspruch im Text.'),
 ('keep',
  'Die polare Hydroxygruppe von Ethanol ermöglicht Wasserstoffbrücken mit Wasser und anderen Ethanolmolekülen; der unpolare Ethylrest trägt weiterhin zur Gesamtstruktur und zu Dispersionskräften bei.',
  'The polar hydroxyl group of ethanol enables hydrogen bonds with water and other ethanol molecules; the nonpolar ethyl residue still contributes to the overall structure and dispersion forces.',
  'Die lernende Person erklärt die gute Mischbarkeit mit Wasser und den höheren Siedepunkt gegenüber einem geeigneten unpolaren Vergleichsstoff über die Hydroxygruppe, ohne beim Sieden einen Bruch der O-H-Bindung zu behaupten.',
  'The learner explains good miscibility with water and the higher boiling point relative to a suitable nonpolar comparison substance through the hydroxyl group, without claiming that boiling breaks the O-H bond.',
  'Bei geändertem Vergleichsstoff oder einem weniger polaren Lösungsmittel prüft die lernende Person neu, welche Wechselwirkungen zwischen den jeweiligen Molekülen möglich sind.',
  'With a different comparison substance or a less polar solvent, the learner re-examines which interactions are possible between the molecules involved.',
  'KEEP: HE36 E.3 nennt genau den Einfluss der Hydroxygruppe auf Ethanol-Eigenschaften. Ausgewählte Eigenschaften ist eine fachlich sinnvolle Begrenzung; der Text beansprucht keine alleinige Erklärung aller Eigenschaften oder Gesundheitsbewertung. PDF6/HTML4 markieren Hydroxygruppe und Alkylrest getrennt, H-Brücken als zwischenmolekulare Bindungen und den Siedevergleich plausibel. DE/EN äquivalent.'),
 ('keep',
  'Metallbindung beruht auf positiven Atomrümpfen und delokalisierten Elektronen, Ionenbindung auf elektrostatischer Anziehung im Ionengitter und Elektronenpaarbindung auf geteilten bindenden Elektronenpaaren zwischen Atomen.',
  'Metallic bonding involves positive ion cores and delocalised electrons, ionic bonding electrostatic attraction in an ionic lattice, and covalent bonding shared bonding electron pairs between atoms.',
  'Die lernende Person erläutert anhand passender Teilchenmodelle die drei Bindungsarten, benennt jeweils die anziehenden Teilchen beziehungsweise Elektronen und unterscheidet diese Bindungen von Kräften zwischen Molekülen.',
  'Using suitable particle models, the learner explains the three bond types, names the particles or electrons responsible for attraction and distinguishes these bonds from forces between molecules.',
  'Bei einem neuen Metall, Salz oder Molekül wird das passende Modell aus den Bindungspartnern gewählt und dessen Aussagegrenze an einer vorgegebenen Darstellung erläutert.',
  'For a new metal, salt or molecule, the appropriate model is selected from the bonding partners and its limitations are explained using a supplied representation.',
  'KEEP: HE38 Q1.1 GK/LK benennt alle drei Modelle. Das gemeinsame Ziel ist die fachliche Unterscheidung der Bindungstypen, nicht drei voneinander losgelöste Experimente. DE/EN stimmen überein. PDF7/HTML5 zeigen die jeweiligen Teilchenarten und die elektrostatische beziehungsweise Elektronenpaar-Erklärung; geeignete Modellgrenzen bleiben im V2-Nachweis.'),
 ('keep',
  'Struktur, Polarisierbarkeit, Polarität und H-Brückenmöglichkeiten bestimmen die wirksamen Wechselwirkungen molekularer Stoffe. Lösungsvorgänge hängen von konkurrierenden Stoff-Stoff-, Lösungsmittel-Lösungsmittel- und Stoff-Lösungsmittel-Wechselwirkungen ab; Schmelzen zusätzlich von der Festkörperpackung.',
  'Structure, polarisability, polarity and hydrogen-bonding possibilities determine interactions between molecular substances. Dissolution depends on competing solute-solute, solvent-solvent and solute-solvent interactions; melting also depends on solid-state packing.',
  'Die lernende Person begründet oder prognostiziert für begrenzte Stoffvergleiche Eigenschaftstrends und eine geeignete Lösemittelwahl, verknüpft Formeln mit Wechselwirkungen und verwendet für einen belastbaren Schmelzvergleich die notwendigen Packungs- oder Messinformationen.',
  'For bounded substance comparisons, the learner explains or predicts property trends and an appropriate solvent choice, links formulas to interactions and uses the packing or measurement information needed for a defensible melting comparison.',
  'Nach Änderung von Kettenlänge, Verzweigung oder Lösungsmittel wird die Prognose neu begründet; bei fehlenden Packungsdaten wird die Sicherheit einer Schmelzpunktvorhersage angemessen begrenzt.',
  'After a change in chain length, branching or solvent, the prediction is justified anew; missing packing information appropriately limits confidence in a melting-point prediction.',
  'KEEP: Der Text sagt mithilfe der Wechselwirkungen, nicht ausschließlich aus ihnen oder exakt ohne Daten. HE38/39 tragen den gemeinsamen Struktur-Eigenschafts-Kern; keine Erweiterung auf empirisch nicht abgesicherte universelle Rangfolgen. Die tatsächliche PDF8/HTML6 begrenzt ihre Siederegel auf diese Vergleichsstoffe. Auswahl und Eigenschaftsprognose sind Anwendungen derselben Erklärung, kein künstlicher Split. DE/EN äquivalent.'),
 ('keep',
  'Bei Halogenreaktionen werden bestimmte Bindungen gespalten und andere gebildet; Stoffbeobachtung und Bindungsmodell sind verschiedene Ebenen. Ein Nachweis muss zu der jeweils behaupteten funktionellen Gruppe beziehungsweise zu einem tatsächlich vorliegenden Produkt passen.',
  'Halogen reactions break particular bonds and form others; substance observations and bond models are distinct levels. A test must match the functional group being claimed or a product actually present.',
  'Die lernende Person vergleicht an vorgegebenen Halogenreaktionen gebrochene und gebildete Bindungen und wählt passende Nachweise, wobei sie Bromverbrauch als Hinweis auf Reaktion von einem eindeutigen Stoffnachweis unterscheidet.',
  'The learner compares bonds broken and formed in supplied halogen reactions and chooses appropriate tests, distinguishing consumption of bromine as evidence of reaction from unique identification of a substance.',
  'Bei verändertem Substrat oder einem als Störfall vorgegebenen Bromverbrauch wird geprüft, welche Beobachtung die konkrete Bindungsänderung tatsächlich unterstützt und welche zusätzliche Information nötig ist.',
  'With a changed substrate or supplied interfering case of bromine consumption, the learner examines which observation actually supports the bond change and what additional information is needed.',
  'KEEP: Deuten plus geeigneten Nachweis zuordnen bildet einen gemeinsamen Beobachtung-Modell-Zusammenhang; DE/EN äquivalent. HE38 Q1.1 trägt organische Bromreaktionen und Doppelbindungsnachweis; der auf PDF9/HTML7 tatsächlich gezeigte H2/Cl2-Vergleich ist ein chemisch plausibles einfaches Bindungsbeispiel, keine zusätzliche HE-Q1-Pflicht. Silbernitrat/Halogenidnachweis gehört als Quellenklausel zu HE39 Q1.2 und ist durch HE38 allein nicht freigegeben. Säureindikatorfarbe beweist keine Chlorididentität. Diese Quellen-/Nachweisgrenze muss im P-Profil ausdrücklich erhalten bleiben.'),
 ('block',
  'Beim einfachen Benzensystem stabilisiert das delokalisierte pi-System den Ausgangs- und substituierten Endzustand. Eine elektrophile Substitution stellt Aromatizität wieder her; die typische Schulmodell-Zwischenstufe ist ein einfach positiv geladenes, nichtaromatisches Arenium-Ion.',
  'In the simple benzene system, a delocalised pi system stabilises the starting and substituted final states. Electrophilic substitution restores aromaticity; the usual school-model intermediate is a singly positively charged, nonaromatic arenium ion.',
  'Die lernende Person begründet am Benzenvergleich die bevorzugte Substitution gegenüber einer aromatizitätsaufhebenden Addition und erklärt im gegebenen Schulmodell den vorübergehenden Aromatizitätsverlust sowie die Rearomatisierung durch Protonabgabe mit konsistenter Ladungsbilanz.',
  'Using benzene as the comparison, the learner justifies the preference for substitution over addition that removes aromaticity and explains temporary loss and restoration of aromaticity by proton release in the supplied school model with consistent charge bookkeeping.',
  'Bei einem geänderten elektrophilen Reaktionspartner wird am gleichen einfachen Aromaten geprüft, welche Bindungsänderung und Protonabgabe Aromatizität wiederherstellen, ohne eine universelle Geschwindigkeits- oder Regioselektivitätsregel zu erfinden.',
  'With a changed electrophilic reaction partner, bond changes and proton release that restore aromaticity are identified for the same simple arene without inventing a universal rate or regioselectivity rule.',
  'BLOCK der aktuellen bildgebundenen Seite, keine Behauptung eines an sich falschen DE/EN-Fachtextes: HE38 Q1.1 LK trägt Benzen-Reaktivität und elektrophile Erstsubstitution. PDF10/HTML8 zeigen am Arenium-Ion zwei separate Ring-Pluszeichen und ein gebundenes E+ ohne Teil-/Resonanzladungslegende; ein H am angegriffenen C fehlt dort. Der einfache Arenium-Zwischenzustand ist insgesamt +1, nicht die Summe dieser unqualifizierten Zeichen. Der tatsächliche Bildzustand erklärt die zentrale Ladungsbilanz und anschließende H+-Abgabe deshalb nicht zuverlässig. Primärdefinition: IUPAC https://goldbook.iupac.org/terms/view/A00436 ; originale UCLA-Lehrdarstellung https://www.chem.ucla.edu/~harding/IGOC/A/arenium_ion.html . Gezielte Bildklärung und neue betroffene Seitenbindung erforderlich; eine reine Text-/Hashänderung löst dies nicht.'),
 ('keep',
  'Ein tetraedrisches Kohlenstoffatom mit vier verschiedenen Substituenten ist ein asymmetrisches Kohlenstoff-Stereozentrum; die gesamte Verknüpfung der Substituenten entscheidet über deren Verschiedenheit, nicht die Zeichenrichtung auf dem Papier.',
  'A tetrahedral carbon atom with four different substituents is an asymmetric carbon stereocentre; the complete connectivity of the substituents determines their difference, not the direction of lines on paper.',
  'Die lernende Person markiert oder verwirft mögliche C-Stereozentren und begründet ihre Entscheidung durch Vergleich der vier Substituenten, einschließlich eines Gegenbeispiels mit zwei gleichen Gruppen.',
  'The learner marks or rejects candidate carbon stereocentres and justifies the decision by comparing all four substituents, including a counterexample with two identical groups.',
  'Bei einem anders dargestellten Molekül oder einer geänderten Seitenkette werden die Substituenten erneut entlang ihrer Verknüpfung verglichen; eine fehlende beziehungsweise neu entstandene Asymmetrie wird erklärt.',
  'For a differently represented molecule or changed side chain, substituents are compared again along their connectivity and loss or creation of asymmetry is explained.',
  'KEEP: Asymmetrische Kohlenstoffatome ist präziser eingeschränkt als die Behauptung, sämtliche Chiralität brauche ein C-Zentrum. HE42 Q2.1 GK/LK trägt dies an Aminosäuren; Q1-Kompatibilitätsbreadcrumb beweist keine HE-Q1-Zuordnung. PDF11/HTML9 vergleichen tatsächlich vier verschiedene Gruppen mit zweimal H/CH3. DE/EN äquivalent. Kein R/S-, optische Aktivität- oder Mehrzentren-Kontrollanspruch ergänzt.'),
 ('revise',
  'Stereoisomere besitzen dieselbe Konstitution und unterscheiden sich in räumlicher Anordnung. Enantiomerie, Diastereomerie und Konformationsbeziehungen sind Beziehungen zwischen passenden Moleküldarstellungen; E/Z beschreibt geeignet substituierte Doppelbindungen.',
  'Stereoisomers have the same constitution and differ in spatial arrangement. Enantiomerism, diastereomerism and conformational relationships relate suitable molecular representations; E/Z describes appropriately substituted double bonds.',
  'Die lernende Person prüft die gemeinsame Konstitution eines vorgegebenen Molekülpaares und begründet dessen curricular passenden Isomerietyp aus räumlicher Anordnung, Spiegelbildbeziehung beziehungsweise Bindungsrotation.',
  'The learner checks the common constitution of a supplied molecular pair and justifies its curriculum-appropriate isomeric relationship using spatial arrangement, mirror-image relationship or bond rotation.',
  'Bei einer geänderten Projektion oder einem Paar mit veränderter Verknüpfung wird dieselbe Prüfung erneut angewandt; Konstitutionsisomerie wird nicht als Stereoisomerie klassifiziert.',
  'For a changed projection or a pair with different connectivity, the same check is applied again; constitutional isomerism is not classified as stereoisomerism.',
  'REVISE eng: Der aktuelle Satz nennt weder den Vergleich gleicher Konstitution noch das räumliche Zuordnungskriterium. Insbesondere Enantiomerie ist eine Beziehung zwischen Molekülen und keine unabhängig vom Vergleichspartner zugewiesene Eigenschaft eines isolierten Moleküls. Die Ersatzfassung macht genau diesen bereits beanspruchten Zuordnungskern beobachtbar, ohne eine neue Liste verpflichtender Typen einzuführen. HE38 E/Z ist LK, HE42 Enantiomere GK/LK und Diastereomere LK; die gesamte Taxonomie im tatsächlich gelesenen PDF12/HTML10 darf nicht als pauschale GK-Pflicht gelten. IUPAC https://goldbook.iupac.org/terms/view/E02069 und https://old.goldbook.iupac.org/html/S/S05984.html .',
  'Die lernende Person kann an vorgegebenen Molekülpaaren mit gleicher Konstitution den jeweiligen Typ der Stereoisomerie anhand der räumlichen Anordnung begründet zuordnen.',
  'The learner can identify and justify the type of stereoisomerism in given pairs of molecules with the same constitution by comparing their spatial arrangements.'),
 ('keep',
  'Struktur-, Halbstruktur- und Skelettformeln erhalten die Verknüpfung und Valenz der Alkanol-Atome; die Hydroxygruppe bleibt explizit erkennbar, auch wenn C-gebundene H-Atome in einer Skelettformel implizit sind.',
  'Structural, condensed and skeletal formulas preserve connectivity and valence of alkanol atoms; the hydroxyl group remains explicit even when carbon-bound hydrogen atoms are implicit in a skeletal formula.',
  'Die lernende Person konstruiert verschiedene korrekte Darstellungen desselben Alkanols und erläutert, welche Atome implizit sind, wobei Kettenlänge, Bindungszahl und OH-Position erhalten bleiben.',
  'The learner constructs different correct representations of the same alkanol and explains which atoms are implicit, preserving chain length, bond count and OH position.',
  'Für ein verzweigtes oder positionsisomeres Alkanol wird die Darstellung neu konstruiert und anhand der Verknüpfung auf die korrekte Hydroxygruppenposition geprüft.',
  'For a branched or positional-isomeric alkanol, the representation is constructed anew and checked against connectivity for the correct hydroxyl-group position.',
  'KEEP: HE39 Q1.2 GK/LK nennt Struktur- und Skelettformeln der Alkanole. Darstellungsformen sind keine zusätzliche Stoffklasse oder Nomenklaturprüfung. PDF13/HTML11 zeigen tatsächlich dasselbe Ethanol in drei valenz- und verbindungserhaltenden Formen mit explizitem OH. DE/EN äquivalent; kein stilistischer Umschreibbedarf.'),
 ('block',
  'Geeignete Carbonyl-Nachweise beruhen auf unterschiedlichen Reaktivitäten ausgewählter Stoffe; ein positiver Fehling-Befund zeigt reduzierende Wirkung und keine universell exklusive Aldehydidentität. Stoffauswahl, Kontrollproben und Interferenzen begrenzen die Interpretation.',
  'Suitable carbonyl tests use differing reactivities of selected substances; a positive Fehling result demonstrates reducing behaviour rather than universally exclusive aldehyde identity. Substance selection, controls and interfering compounds limit interpretation.',
  'Die lernende Person führt einen geeigneten schulischen Nachweis unter fachlicher Aufsicht und vorgegebenen Schutz-/Entsorgungsregeln aus, dokumentiert eigene Beobachtungen mit Kontrollen und deutet diese für die konkret ausgewählten Aldehyd-/Ketonproben. Die Interpretation bereitgestellter Daten allein belegt keine Durchführung.',
  'The learner performs an appropriate school test under qualified supervision and supplied protection/disposal rules, records observations with controls and interprets them for the specifically selected aldehyde and ketone samples. Interpreting supplied data alone does not demonstrate performance of an experiment.',
  'Bei anderer Probenzusammensetzung, einem reduzierenden Störstoff oder abweichender Kontrollprobe werden Nachweiseignung und Schlussfolgerung neu geprüft; ein negatives Ergebnis wird nicht als universeller Klassennachweis verwendet.',
  'For a changed sample composition, a reducing interferent or an altered control, suitability of the test and the inference are re-examined; a negative result is not treated as a universal class test.',
  'BLOCK der aktuellen bildgebundenen Seite, keine zwingende Textrevision: Geeignete Nachweisreaktionen ist im DE/EN-Satz sinnvoll begrenzt, HE39 Q1.2 trägt Fehling an Alkanalen. Das tatsächlich gelesene PDF14/HTML12 kategorisiert aber unqualifiziert Aldehyd versus Keton und behauptet unter Fehling-Probe für Keton negativ/keine Reaktion. Terminale alpha-Hydroxyketone liefern ebenfalls einen positiven Fehling-Nachweis; die originale UCLA-Lehrquelle belegt dies ausdrücklich: https://www.chem.ucla.edu/~harding/IGOC/F/fehlings_test.html . Dadurch vermittelt das gebundene Bild eine nicht gültige Universalunterscheidung. Stoffbeispiele oder eine fachlich klare Begrenzung der Bildaussage müssen unabhängig geprüft werden. Keine Papier-/KI-Fälle als echte experimentelle Leistung ausgeben.'),
 ('keep',
  'Das Nukleophil stellt ein freies Elektronenpaar zur Bindung an das elektrophile Zentrum bereit; eine Abgangsgruppe wird ersetzt und übernimmt das Elektronenpaar der gelösten Bindung. Donator-Akzeptor-Sicht und Substitution beschreiben denselben Elektronenfluss.',
  'The nucleophile provides a lone pair to bond to an electrophilic centre; a leaving group is replaced and takes the electron pair from the bond that breaks. Donor-acceptor interpretation and substitution describe the same electron flow.',
  'Die lernende Person bezeichnet an einer passenden Substitution Nukleophil, elektrophiles Zentrum und Abgangsgruppe und erklärt mit korrekter Elektronenpaar- und Ladungsbilanz, warum eine neue Bindung entsteht und eine andere gelöst wird.',
  'For a suitable substitution, the learner identifies the nucleophile, electrophilic centre and leaving group and explains with correct electron-pair and charge bookkeeping why one bond forms and another breaks.',
  'Bei verändertem einfachen Halogenalkan oder anderem gegebenen Nukleophil werden Donator, Akzeptorzentrum und Abgangsgruppe erneut aus den Teilchenstrukturen identifiziert, ohne alle Mechanismen als gleichzeitig zu behaupten.',
  'With a changed simple haloalkane or another supplied nucleophile, donor, acceptor centre and leaving group are identified anew from particle structures without asserting that every mechanism is concerted.',
  'KEEP: Die benannte nukleophile Substitution begrenzt die allgemeine Donator-Akzeptor-Sprache; Ersatz der Abgangsgruppe ist Teil dieser Reaktionsart, kein neuer Mechanismenanspruch. HE39 Q1.2 GK/LK nennt den Reaktionstyp, spezielle SN1/SN2-Mechanismen nur LK. PDF15/HTML13 zeigen korrekt die OH-/CH3Br-SN2-Illustration mit Bromid-Abgangsgruppe und balancierter Ladung; die explizite SN2-Zeile gilt für dieses Beispiel. DE/EN äquivalent.'),
 ('keep',
  'Bei einer vorgegebenen nukleophilen Substitution ersetzt Hydroxid eine Halogenid-Abgangsgruppe; Kohlenstoffgerüst, Atome und Gesamtladung bleiben in der Reaktionsgleichung erhalten. Hydroxid kann unter anderen Bedingungen auch als Base reagieren.',
  'In a specified nucleophilic substitution, hydroxide replaces a halide leaving group; the carbon skeleton, atoms and total charge are conserved in the equation. Under other conditions hydroxide can also act as a base.',
  'Die lernende Person formuliert für passende angegebene Substitutionsbedingungen die Gleichung zu Alkanol und Halogenid und überprüft die Erhaltung aller Atome und der Ladung, statt lediglich eine vorgegebene Produktzeile abzuschreiben.',
  'For suitable stated substitution conditions, the learner formulates the equation yielding an alkanol and halide and checks conservation of every atom and total charge rather than copying a supplied product line.',
  'Bei anderem Halogen oder verändertem Kohlenstoffgerüst werden Formel und Ladungsbilanz neu aufgestellt; bei ausdrücklich veränderten Reaktionsbedingungen wird die Gültigkeit des angenommenen Substitutionstyps geprüft.',
  'For another halogen or changed carbon skeleton, formulas and charge balance are constructed anew; explicitly changed conditions prompt examination of whether the assumed substitution type remains valid.',
  'KEEP: HE39 Q1.2 GK/LK fordert genau diese Gleichungen. Der enthaltene Kontext nukleophile Substitution begrenzt die Produktannahme; der Text behauptet nicht jede Halogenalkan/Hydroxid-Kombination reagiere ausschließlich so. PDF16/HTML14 zeigen eine korrekt bilanzierte allgemeine Substitution und Brommethan, bei dem keine beta-Eliminierung möglich ist. Konkrete Reaktionsbedingungen gehören in die P-Fälle. DE/EN äquivalent.'),
 ('revise',
  'Eine koordinative Bindung wird im Donator-Akzeptor-Modell durch ein vom Liganden bereitgestelltes freies Elektronenpaar und ein geeignetes unbesetztes Akzeptororbital des Zentralatoms oder Zentralions beschrieben. Bei Fehling stellen geeignete Tartrat-O-Donorstellen Elektronenpaare für Cu(II) bereit; Donorstellenzahl und Ligandenzahl sind verschieden.',
  'In the donor-acceptor model, a coordinate bond involves a lone pair supplied by a ligand and a suitable vacant acceptor orbital of the central atom or ion. In Fehling solution, suitable tartrate oxygen donor sites provide lone pairs to Cu(II); the number of donor sites differs from the number of ligands.',
  'Die lernende Person erklärt an einer vorgegebenen schematischen Cu(II)-Tartrat-Darstellung Liganden-Donator und Zentralion-Akzeptor, deutet die Bindungsbildung und unterscheidet mehrere Donorstellen eines Liganden von mehreren unabhängigen Liganden, ohne eine nicht belegte Komplexformel zu erfinden.',
  'Using a supplied schematic Cu(II)-tartrate representation, the learner explains ligand donor and central-ion acceptor roles, interprets bond formation and distinguishes multiple donor sites of one ligand from independent ligands without inventing an unsupported complex formula.',
  'Bei einer veränderten gegebenen Liganden-/Donorstellendarstellung wird erneut geprüft, welche freien Elektronenpaare und Akzeptorstellen zur Bindung beitragen und welche Details das Modell offen lässt.',
  'For a changed supplied ligand or donor-site representation, the available lone pairs and acceptor sites contributing to bonding are re-examined, together with the details the model leaves open.',
  'REVISE konkret DE/EN: DE verlangt eine allgemeine Zentralatom-/Zentralion-/Ligandenerklärung einschließlich unbesetzter Akzeptororbitale; EN beansprucht nur das Cu(II)-Beispiel und nennt die Orbitalseite nicht. Die Ersatztexte erhalten den DE-Kompetenzumfang und formulieren ihn zweisprachig äquivalent. HE39 Q1.2 kennzeichnet koordinative Bindung ausdrücklich LK; rohe GK/LK-Tags erlauben keine pauschale HE-GK-Freigabe. PDF17/HTML15 zeigen vier getrennte, als Weinsäure-Ion eingeführte Figuren ohne Schematik-/Donorstellenlegende. Eine genaue vier-Tartrat-Stöchiometrie ist dadurch nicht belegt; dieser Bildbefund bleibt gesondert offen und wird durch Textrevision allein nicht geschlossen. Keine neue native V- oder globale Quellenfreigabe.',
  'Die lernende Person kann die Ausbildung koordinativer Bindungen zwischen Zentralatom oder Zentralion und Liganden durch unbesetzte Akzeptororbitale am Zentralatom oder Zentralion und freie Elektronenpaare der Liganden erläutern und am Beispiel der Fehling-Probe deuten.',
  'The learner can explain the formation of coordinate bonds between a central atom or ion and ligands using vacant acceptor orbitals of the central atom or ion and lone pairs supplied by the ligands, and interpret this bonding using the Fehling test as an example.'),
]

source = read(ROUND / 'description-review-input.json')
campaign = read(ROUND / 'description-review-campaign.json')
bundle = read(ROUND / 'review-bundle-manifest.json')
assert len(source['goals']) == len(decisions) == 15
run_id = 'chemie-current-fifteen-native-d-independent-a-run-001'
batch_id = campaign['batches'][0]['batchId']
batch_path = ROUND / 'batches' / (batch_id + '.input.jsonl')
batch = [json.loads(s) for s in batch_path.read_text().splitlines()]
assert [r['goal']['goalId'] for r in batch] == [g['goalId'] for g in source['goals']]
records = []
for i, (g, d) in enumerate(zip(source['goals'], decisions), 1):
    record = {k:g[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']}
    record.update({'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json','schemaVersion':1,
       'recordId':f'chemie-current-fifteen-native-d-a-{i:03}','runId':run_id,
       **{k:campaign[k] for k in ['campaignId','roundId','bundleFingerprint','bookDigest']},
       'decision':d[0], 'understandingEvidence':dict(zip(['essentialUnderstandingDe','essentialUnderstandingEn','observablePerformanceDe','observablePerformanceEn','transferExpectationDe','transferExpectationEn'],d[1:7])),
       'rationale':d[7], 'evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':'create', 'recordStatus':'candidate','reviewAuthority':'ai_candidate'})
    if d[0]=='revise': record.update({'proposedDescriptionDe':d[8],'proposedDescriptionEn':d[9]})
    records.append(record)
out = OWN / 'results'; out.mkdir(exist_ok=True)
record_bytes = ''.join(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n' for r in records).encode()
(out / (batch_id + '.records.jsonl')).write_bytes(record_bytes)
run = {'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':run_id,
   **{k:campaign[k] for k in ['campaignId','roundId','bundleFingerprint','bookDigest','promptFingerprint','criteriaFingerprint','independenceGroupId']},
   'batchId':batch_id,'batchInputFingerprint':campaign['batches'][0]['batchInputFingerprint'],
   'provider':'OpenAI','model':'Codex GPT-6; exact runtime variant not exposed','role':'subject_reviewer','promptFamilyId':'skillpilot-goal-description-understanding-evidence-v2',
   'generationParametersFingerprint':sha(b'Independent Codex direct reasoning review; sampling parameters not exposed; no script-generated scientific judgments.'),
   'blindToOtherRuns':True,'goalIds':[g['goalId'] for g in source['goals']],
   'inputArtifacts':[{'role':a['role'],'digest':a['digest']} for a in bundle['artifacts']]+[{'role':'description_review_batch_input_jsonl','digest':sha(batch_path.read_bytes())}],
   'startedAt':'2026-10-06T10:09:28Z','completedAt':datetime.now(timezone.utc).isoformat().replace('+00:00','Z'),
   'status':'completed','outputDigest':sha(record_bytes),'toolchainVersion':'skillpilot-goal-description-review-v2'}
write(out / (batch_id + '.run.json'), run)
print(json.dumps({'records':len(records),'decisions':{d:sum(r['decision']==d for r in records) for d in ['keep','revise','block','split_review']},'outputDigest':sha(record_bytes)}))
