import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
PACKAGE = ROOT / 'curricula/DE/Gymnasium/quality/goal-description-review/chemie/rollout-v1/2026-10-05/batch-012-stoffmenge-current-10-v1'
ROUND = PACKAGE / 'round-b'
RECEIPTS = Path(__file__).parent
campaign = json.loads((ROUND / 'description-review-campaign.json').read_text())
batch_path = next((ROUND / 'batches').glob('*.input.jsonl'))
batch_rows = [json.loads(line) for line in batch_path.read_text().splitlines()]
manifest = json.loads((ROUND / 'review-bundle-manifest.json').read_text())

def sha(data):
    return 'sha256:' + hashlib.sha256(data).hexdigest()

def evidence(*texts):
    keys = ['essentialUnderstandingDe', 'essentialUnderstandingEn', 'observablePerformanceDe', 'observablePerformanceEn', 'transferExpectationDe', 'transferExpectationEn']
    assert len(texts) == 6
    return dict(zip(keys, texts))

reviews = [
    {
        'decision': 'revise',
        'proposedDescriptionDe': 'Die lernende Person kann die Stoffmenge als Maß für die Anzahl festgelegter Teilchen deuten und Stoffmengen eindeutig mit der Einheit Mol angeben.',
        'proposedDescriptionEn': 'The learner can interpret amount of substance as a measure of the number of specified particles and state amounts of substance unambiguously using the unit mole.',
        'understandingEvidence': evidence(
            'Eine Stoffmengenangabe bezieht sich auf eine ausdrücklich benannte Teilchenart. Ein Mol bezeichnet dieselbe festgelegte Anzahl solcher Teilchen, unabhängig von deren Masse; Mol ist eine Einheit der Stoffmenge und keine Stoffart oder Masseneinheit.',
            'An amount-of-substance statement refers to an explicitly identified type of entity. One mole denotes the same fixed number of those entities regardless of their mass; mole is a unit of amount of substance rather than a substance or a mass unit.',
            'Die lernende Person erklärt an Sauerstoff, warum 1 mol O2-Moleküle und 1 mol O-Atome unterschiedliche Bezugsangaben sind, und erläutert, warum gleiche Stoffmengen Wasser- und Kohlenstoffdioxidmoleküle gleiche Molekülzahlen, aber nicht notwendig gleiche Massen haben.',
            'Using oxygen, the learner explains why 1 mol of O2 molecules and 1 mol of O atoms specify different entities, and explains why equal amounts of water and carbon dioxide molecules contain equal numbers of molecules but need not have equal masses.',
            'In einer neuen Aufgabe zu Wasser beschreibt die lernende Person dieselbe Portion einmal mit Wassermolekülen und einmal mit den enthaltenen Wasserstoffatomen als Bezugsart und begründet, warum sich die Stoffmengenangabe beim Wechsel der Bezugsart ändert.',
            'In a fresh task about water, the learner describes the same sample first in terms of water molecules and then in terms of its constituent hydrogen atoms, justifying why the amount-of-substance statement changes when the specified entity changes.'
        ),
        'rationale': 'Buch-Lernzielseite 1 (PDF-Seite 3) nennt nur einen Teilchenanzahl-Bezug. Die entscheidende Festlegung der gezählten Teilchen bleibt offen. Die begrenzte Präzisierung macht diese bereits beanspruchte Deutung eindeutig, ohne die Berechnung mit der Avogadro-Konstante aus dem Nachfolgeziel vorwegzunehmen. HE-G9 Chemie, gedruckt S. 16, nennt Stoffmenge und Einheit; die aktuell geprüfte BIPM-Moldefinition fordert spezifizierte Einheiten. Die Roh-applicability bestätigt keine vollständige Landesprojektion.'
    },
    {
        'decision': 'revise',
        'proposedDescriptionDe': 'Die lernende Person kann die molare Masse als Masse pro Stoffmenge deuten, aus chemischen Formeln und Atommassen bestimmen und Masse und Stoffmenge damit verknüpfen.',
        'proposedDescriptionEn': 'The learner can interpret molar mass as mass per amount of substance, determine it from chemical formulas and atomic masses, and use it to relate mass and amount of substance.',
        'understandingEvidence': evidence(
            'Die molare Masse M beschreibt das Verhältnis m/n mit der Einheit g/mol. Die Indizes einer chemischen Formel bestimmen die Beiträge der Atomarten; die Masse einer Portion hängt zusätzlich von ihrer Stoffmenge ab. Teilchenmasse und molare Masse sind verschiedene Größen.',
            'Molar mass M is the ratio m/n, expressed in g/mol. The subscripts in a chemical formula determine the contributions of each type of atom; the mass of a sample also depends on its amount of substance. Particle mass and molar mass are different quantities.',
            'Die lernende Person ermittelt die molare Masse von CO2 aus einer vorgegebenen Atommassentabelle, begründet den doppelten Sauerstoffbeitrag und erklärt mit m = nM, warum zwei Portionen desselben Stoffs unterschiedliche Massen bei gleicher molarer Masse haben können.',
            'The learner determines the molar mass of CO2 using a supplied atomic-mass table, justifies the doubled oxygen contribution, and uses m = nM to explain why two samples of the same substance may have different masses while sharing the same molar mass.',
            'Eine neue Aufgabe vergleicht gleiche Massen von CO und CO2. Die lernende Person erschließt aus der veränderten chemischen Zusammensetzung, welche Portion die größere Stoffmenge enthält, und begründet die Rangfolge über die molaren Massen statt über die Anzahl sichtbarer Formelzeichen.',
            'A fresh task compares equal masses of CO and CO2. From the changed chemical composition, the learner determines which sample has the larger amount of substance and justifies the ordering through molar masses rather than the number of visible formula symbols.'
        ),
        'rationale': 'Auf Buch-Lernzielseite 2 (PDF-Seite 4) ist das Bestimmen bereits fachlich passend; der Ausdruck einfache Stoffmengen- und Massenbezüge lässt die Bedeutung von M selbst ungesagt. Masse pro Stoffmenge präzisiert genau dieselbe Kompetenz. Bestimmen und begründet verwenden bilden hier einen zusammenhängenden Umrechnungszusammenhang und erfordern keine Aufspaltung. HE-G9, gedruckt S. 16, stützt die molare Masse; zusätzliche Reaktionsumsätze bleiben dem ausgewiesenen Nachfolgeziel vorbehalten.'
    },
    {
        'decision': 'revise',
        'proposedDescriptionDe': 'Die lernende Person kann u und g als unterschiedlich große Einheiten derselben Masse einordnen und die Masse eines Teilchens mit der Masse einer Stoffportion verknüpfen.',
        'proposedDescriptionEn': 'The learner can identify u and g as differently sized units of the same mass quantity and relate the mass of a particle to the mass of a sample.',
        'understandingEvidence': evidence(
            'u und g sind Einheiten derselben physikalischen Größe. u ist über ein Zwölftel der Masse eines Kohlenstoff-12-Atoms definiert und eignet sich für Teilchenmassen; g eignet sich für makroskopische Portionen. Die Gesamtmasse ergibt sich aus Anzahl und Masse der gleichartigen Teilchen, nicht durch bloßes Austauschen des Einheitenzeichens.',
            'u and g are units of the same physical quantity. u is defined as one twelfth of the mass of a carbon-12 atom and is convenient for particle masses; g is convenient for macroscopic samples. Total mass depends on both the number and mass of identical particles, rather than merely replacing the unit symbol.',
            'Mit vorgegebenen gerundeten Umrechnungs- und Teilchenzahldaten erklärt die lernende Person den Übergang von 12 u für ein Kohlenstoff-12-Atom zu ungefähr 12 g für eine Molportion solcher Atome. Sie unterscheidet die Masse eines einzelnen Atoms von der Masse der gesamten Portion und kennzeichnet die makroskopische Zahlenentsprechung als schulische Näherung.',
            'Using supplied rounded conversion and entity-count data, the learner explains the transition from 12 u for one carbon-12 atom to approximately 12 g for a mole-sized sample of such atoms. The learner distinguishes the mass of one atom from the mass of the entire sample and identifies the macroscopic numerical correspondence as a school-level approximation.',
            'Die neue Aufgabe ersetzt einzelne Sauerstoffatome durch O2-Moleküle und gibt dieselbe Anzahl von Teilchen vor. Die lernende Person begründet die doppelte Teilchen- und Portionsmasse und zeigt, dass auch eine Teilchenmasse in Gramm ausdrückbar ist, obwohl u dafür handlicher ist.',
            'The fresh task replaces individual oxygen atoms with O2 molecules while specifying the same number of entities. The learner justifies the doubled particle and sample masses and shows that a particle mass can also be expressed in grams, although u is more convenient.'
        ),
        'rationale': 'Die Buch-Lernzielseite 3 (PDF-Seite 5) stellt Teilchen- und Portionsebene gegenüber. Die bisherige Beschreibung verlangt Unterscheiden, sagt jedoch nicht, dass u und g dieselbe Größe messen und lediglich unterschiedliche Skalen haben. Die Änderung klärt den beanspruchten Grammbezug ohne eine neue Rechenroutine. HE-G9, gedruckt S. 16, nennt beide Einheiten. BIPM Mise en pratique, Version 2 vom Mai 2025, S. 6, bestätigt die u-Definition und die nach 2019 nur näherungsweise Zahlenentsprechung zwischen u und g/mol; daraus wird kein neuer metrologischer Lernzielumfang gemacht.'
    },
    {
        'decision': 'keep',
        'understandingEvidence': evidence(
            'Die Avogadro-Konstante NA verknüpft die Stoffmenge n mit der Anzahl N der festgelegten Teilchen: N = nNA. Ihre Einheit mol^-1 und ihr exakt festgelegter Wert 6,02214076 × 10^23 mol^-1 unterscheiden sie von einer einheitenlosen Teilchenzahl. Derselbe Faktor gilt für jede ausdrücklich gewählte Teilchenart.',
            'The Avogadro constant NA relates amount of substance n to the number N of specified entities through N = nNA. Its unit mol^-1 and exactly fixed value 6.02214076 × 10^23 mol^-1 distinguish it from a dimensionless entity count. The same factor applies to any explicitly specified type of entity.',
            'Die lernende Person leitet die Rechenrichtung für eine gegebene Teilchenzahl und für eine gegebene Stoffmenge selbst her, prüft die Einheiten und erklärt an einer CO2-Portion, ob N Moleküle oder enthaltene Atome zählt. Eine verdoppelte Stoffmenge wird mit der proportional verdoppelten Zahl derselben Teilchenart begründet.',
            'The learner independently determines which way to calculate from a given entity count or a given amount of substance, checks units, and explains for a CO2 sample whether N counts molecules or constituent atoms. The learner justifies that doubling the amount doubles the number of the same specified entity.',
            'In einer frischen Aufgabe wird statt der Molekülzahl die Gesamtzahl der Atome in einer CO2-Portion gegeben. Die lernende Person erschließt zuerst die Molekülzahl aus dem Verhältnis drei Atome je Molekül und bestimmt dann n(CO2), wobei sie den Wechsel der Bezugsart ausdrücklich erklärt.',
            'In a fresh task, the total number of atoms in a CO2 sample is supplied instead of its molecule count. The learner first obtains the molecule count from three atoms per molecule and then determines n(CO2), explicitly explaining the change of specified entity.'
        ),
        'rationale': 'Buch-Lernzielseite 4 (PDF-Seite 6) bezeichnet bereits die zentrale Beziehung, den Proportionalitätsfaktor und seine Anwendung. Das ist korrekt, bilingual gleichwertig und gegenüber dem reinen Molbegriff hinreichend abgegrenzt. Konkrete Zählbezugsarten, Einheitenprüfung und Strukturtransfer gehören in die zusätzlichen Evidenzfelder, nicht zwingend in eine längere Beschreibung. Der ältere gerundete Faktor in HE-G9, gedruckt S. 16, wird nicht als heutige Definition übernommen; die aktuell geprüfte BIPM-Definition legt NA exakt fest.'
    },
    {
        'decision': 'revise',
        'proposedDescriptionDe': 'Die lernende Person kann mit der Avogadro-These erklären, warum gleiche Volumina verschiedener Gase bei gleicher Temperatur und gleichem Druck im idealen Gasmodell gleich viele Teilchen enthalten.',
        'proposedDescriptionEn': 'The learner can use Avogadro’s law to explain why equal volumes of different gases at the same temperature and pressure contain equal numbers of particles in the ideal-gas model.',
        'understandingEvidence': evidence(
            'Im idealen Gasmodell hängt die Teilchenzahl eines Gasvolumens bei festgehaltener Temperatur und festgehaltenem Druck vom Volumen ab, nicht von der Teilchenmasse oder Atomanzahl je Molekül. Gleiche Volumina verschiedener Gase bedeuten unter diesen Voraussetzungen gleiche Zahlen von Gasteilchen, nicht gleiche Massen.',
            'In the ideal-gas model, at fixed temperature and pressure the number of entities in a gas sample depends on its volume rather than particle mass or the number of atoms per molecule. Under these conditions, equal volumes of different gases imply equal numbers of gas entities, rather than equal masses.',
            'Die lernende Person vergleicht gleiche Volumina O2 und CO2 bei identischer Temperatur und identischem Druck, begründet die gleiche Molekülzahl und unterscheidet sie von der unterschiedlichen Zahl enthaltener Atome. Sie benennt Temperatur und Druck als notwendige Vergleichsbedingungen.',
            'The learner compares equal volumes of O2 and CO2 at identical temperature and pressure, justifies equal molecule counts, and distinguishes these from the different numbers of constituent atoms. The learner identifies temperature and pressure as necessary comparison conditions.',
            'Eine neue Aufgabe gibt gleich große Gasportionen bei unterschiedlichen Drücken oder Temperaturen an. Die lernende Person erklärt, warum aus dem gleichen Volumen allein keine gleiche Teilchenzahl folgt, und nennt die Bedingung, die für einen unmittelbaren Avogadro-Vergleich vereinheitlicht werden müsste.',
            'A fresh task specifies equally sized gas samples at different pressures or temperatures. The learner explains why equal volume alone does not imply equal entity count and identifies which condition must be equalized for a direct Avogadro comparison.'
        ),
        'rationale': 'Auf Buch-Lernzielseite 5 (PDF-Seite 7) bleibt gleiche Bedingungen unbestimmt und die eigentliche Aussage der These ungenannt. Die Änderung benennt Temperatur, Druck und Teilchenzahl sowie den Modellrahmen innerhalb der bereits beanspruchten Erklärung. Sie verlangt keine ideale Gasgleichung, keine Herleitung aus R und keine Realgasrechnung. HE-G9, gedruckt S. 16, führt die These im Gasmodellkontext; das vorgelagerte kinetische Gasmodell passt zu dieser begrenzten Präzisierung.'
    },
    {
        'decision': 'keep',
        'understandingEvidence': evidence(
            'Das molare Volumen Vm = V/n ist das Gasvolumen pro Stoffmenge bei benannter Temperatur und benanntem Druck. Unter diesen festgelegten Bedingungen verknüpft V = nVm die Portionengröße mit dem Volumen. Ein Zahlenwert wie ungefähr 24 L/mol gilt nur für die zugehörigen Bedingungen und ist keine allgemeine Eigenschaft jedes beliebigen Gaszustands.',
            'Molar volume Vm = V/n is gas volume per amount of substance at a stated temperature and pressure. Under those specified conditions, V = nVm relates sample size to volume. A value such as approximately 24 L/mol applies only to its associated conditions and is not a universal property of every gas state.',
            'Mit einem vorgegebenen Vm samt Temperatur und Druck begründet die lernende Person, wie aus einem gemessenen Gasvolumen die Stoffmenge folgt und umgekehrt. Sie erklärt anhand der Einheit L/mol, warum das Verhältnis von Volumen und Stoffmenge bei diesen Bedingungen gleich bleibt.',
            'Given Vm together with temperature and pressure, the learner justifies how to obtain amount of substance from a measured gas volume and vice versa. Using the unit L/mol, the learner explains why the ratio of volume to amount remains constant under those conditions.',
            'In einer neuen Aufgabe bleibt die Gasportion beim Erwärmen oder Komprimieren erhalten; eine Tabelle liefert Vm für Anfangs- und Endbedingungen. Die lernende Person wählt für jeden Zustand den passenden Wert, erschließt die Volumenänderung und erklärt, warum sich die Stoffmenge dabei nicht ändert.',
            'In a fresh task, the gas sample is retained while being heated or compressed, and a table supplies Vm for the initial and final conditions. The learner selects the appropriate value for each state, determines the volume change, and explains why the amount of substance remains unchanged.'
        ),
        'rationale': 'Buch-Lernzielseite 6 (PDF-Seite 8) schränkt das molare Volumen schon auf festgelegte Bedingungen ein und benennt seinen einfachen Stoffmengen-Volumen-Zusammenhang. Die englische Fassung entspricht dem Inhalt. Die konkrete Bedeutung des Quotienten und der Transfer zwischen Zuständen können zielgenau im separaten Evidenzprofil beschrieben werden. HE-G9, gedruckt S. 16, nennt molares Volumen; eine neue universelle Normbedingung oder eine Berechnung von Vm aus der Gasgleichung wird daraus nicht abgeleitet.'
    },
    {
        'decision': 'revise',
        'proposedDescriptionDe': 'Die lernende Person kann molare Massen gasförmiger Stoffe aus ihrer Formel oder aus Masse und Gasvolumen bei bekannten Bedingungen bestimmen und als Masse pro Stoffmenge deuten.',
        'proposedDescriptionEn': 'The learner can determine molar masses of gaseous substances from their formulas or from mass and gas volume under known conditions, and interpret them as mass per amount of substance.',
        'understandingEvidence': evidence(
            'Die molare Masse ist auch für einen gasförmigen Reinstoff m/n. Seine Formel liefert die Zusammensetzung; aus m und V kann bei passendem, bedingungsgebundenem Vm zunächst n = V/Vm und dann M = m/n bestimmt werden. Eine Volumenänderung durch Druck oder Temperatur ändert die molare Masse desselben Stoffs nicht.',
            'For a pure gaseous substance, molar mass is likewise m/n. Its formula provides the composition; given m and V with the appropriate condition-specific Vm, first n = V/Vm and then M = m/n can be obtained. A volume change caused by pressure or temperature does not change the molar mass of the same substance.',
            'Die lernende Person bestimmt für eine bereitgestellte reine Gasprobe M aus Masse und Volumen mit dem passend angegebenen Vm, erläutert beide Schritte und vergleicht das Ergebnis begründet mit den molaren Massen vorgegebener Kandidatenformeln. Sie unterscheidet die Masse der Portion vom Wert in g/mol.',
            'For a supplied pure gas sample, the learner determines M from mass and volume using the appropriate stated Vm, explains both steps, and justifiably compares the result with molar masses of supplied candidate formulas. The learner distinguishes sample mass from the value expressed in g/mol.',
            'Eine neue Aufgabe zeigt dieselbe reine Gasprobe bei verändertem Druck mit entsprechend verändertem Volumen und einem neuen Vm. Die lernende Person zeigt, dass die beiden Datensätze denselben M-Wert ergeben, und erklärt, warum das unkritische Wiederverwenden des ersten Vm eine falsche Stoffzuordnung erzeugen könnte.',
            'A fresh task shows the same pure gas sample at a changed pressure, with its changed volume and a new Vm. The learner demonstrates that both data sets yield the same M and explains why uncritically reusing the first Vm could lead to incorrect identification of the substance.'
        ),
        'rationale': 'Auf Buch-Lernzielseite 7 (PDF-Seite 9) ist einfache Gasbezüge fachlich unbestimmt. Die beiden ausgewiesenen Voraussetzungen molare Masse und molares Volumen machen den Zusammenhang aus Masse und Gasvolumen bereits möglich; die Präzisierung benennt ihn samt Bedingungen und Bedeutung. Formelweg und Datenweg erschließen dieselbe molare Masse und sind keine unabhängigen neuen Kompetenzen. HE-G9, gedruckt S. 16, nennt molare Masse von Gasen. Experimentplanung, Realgasgleichungen und vollständige Landesprojektionen sind damit nicht geprüft.'
    },
    {
        'decision': 'revise',
        'proposedDescriptionDe': 'Die lernende Person kann die Zweiatomigkeit wichtiger gasförmiger Elemente im Teilchenmodell erläutern und daraus ihre Molekülformeln für einfache Reaktionsgleichungen begründen.',
        'proposedDescriptionEn': 'The learner can explain the diatomic nature of important gaseous elements using a particle model and justify their molecular formulas for simple reaction equations on that basis.',
        'understandingEvidence': evidence(
            'Ein zweiatomiges Elementmolekül besteht aus zwei Atomen derselben Atomart; Atomart und Molekül sind unterschiedliche Zähl- und Darstellungsebenen. H2 und O2 beschreiben jeweils ein solches Molekül, während ein vorangestellter Koeffizient die Anzahl dieser Einheiten ändert. Nicht jedes gasförmige Element besteht aus zweiatomigen Molekülen.',
            'A diatomic elemental molecule consists of two atoms of the same type; the type of atom and the molecule belong to different counting and representation levels. H2 and O2 each describe one such molecule, whereas a preceding coefficient changes the number of these entities. Not every gaseous element consists of diatomic molecules.',
            'Die lernende Person deutet eine neu vorgelegte Teilchendarstellung mit H2- und O2-Molekülen, begründet die Indizes aus dem Aufbau und unterscheidet 2 H von H2 sowie 2 H2. Beim symbolischen Beschreiben der Wasserbildung erklärt sie, warum die Molekülformeln als Stoffangaben feststehen und Mengen über Koeffizienten angepasst werden.',
            'The learner interprets a newly supplied particle representation containing H2 and O2 molecules, justifies the subscripts from their composition, and distinguishes 2 H from H2 and 2 H2. When symbolically describing water formation, the learner explains why molecular formulas specify the substances while quantities are adjusted through coefficients.',
            'Eine frische Aufgabe stellt Chlor als Cl2 und Helium als einzelne Atome in vorgegebenen Teilchenmodellen gegenüber. Die lernende Person begründet daraus die verschiedenen Formelschreibweisen und erkennt, warum die Regel zwei Atome auf das Heliumbeispiel nicht übertragen werden darf.',
            'A fresh task contrasts chlorine as Cl2 with helium as individual atoms in supplied particle models. The learner justifies their different formula notation from those representations and recognizes why the two-atoms rule must not be extended to the helium example.'
        ),
        'rationale': 'Buch-Lernzielseite 8 (PDF-Seite 10) verbindet die Tatsache der Zweiatomigkeit mit der Schreibweise, während der Titel eine Begründung verlangt. Die begrenzte Änderung macht den Zusammenhang vom Teilchenmodell zur Molekülformel sichtbar. Sie verlangt keine energetische Bindungserklärung oder eine neue Ableitung aus Volumengesetzen, für die hier keine Voraussetzungen gebunden sind. HE-G9, gedruckt S. 16, nennt Zweiatomigkeit, und S. 17 nennt die Teilchendarstellungen; diese fachliche Stütze ersetzt keinen Nachweis sämtlicher Landeszuordnungen.'
    },
    {
        'decision': 'split_review',
        'understandingEvidence': evidence(
            'Einfache Gesamtgleichungen verknüpfen Edukt- und Produktformeln mit Teilchenverhältnissen; passende Koeffizienten erhalten die Anzahl jeder Atomart, ohne die Stoffformeln zu verändern. Elektronenbilanzierte Teilgleichungen beschreiben zusätzlich getrennte Abgabe- und Aufnahmevorgänge und verlangen die Erhaltung der Ladung. Die zusätzliche Zerlegung ist eine gesondert prüfbare Kompetenz.',
            'Simple overall equations relate reactant and product formulas through entity ratios; appropriate coefficients preserve the count of each atom type without changing the substance formulas. Electron-balanced half-equations additionally describe separate loss and gain processes and require conservation of charge. This additional decomposition is a separately assessable competence.',
            'Für den Grundanteil leitet die lernende Person aus einem neuen Reaktionsschema eine passende Gesamtgleichung ab und erklärt Koeffizienten sowie Atomzahlerhaltung. Für den zusätzlich beanspruchten Teilgleichungsanteil müsste sie an einer ausdrücklich beschriebenen Elektronenübertragung die getrennten Vorgänge, Ladungsbilanz und ihre Zusammenführung selbst darstellen; das darf nicht aus erfolgreichem Ausgleichen der Grundgleichung geschlossen werden.',
            'For the basic component, the learner derives an appropriate overall equation from a fresh reaction scheme and explains coefficients and conservation of atom counts. For the additionally claimed half-equation component, the learner would need to independently represent the separate processes, charge balance and their combination for an explicitly described electron transfer; this cannot be inferred from successful balancing of the basic equation.',
            'Ein frischer Grundfall wechselt von einer Oxidbildung zu einer einfachen Molekülreaktion und fordert die begründete Formel- und Koeffizientenwahl. Für die gesonderte Teilgleichungskompetenz verändert ein weiterer Fall die übertragene Elektronenzahl, sodass die lernende Person die Skalierung der Teilgleichungen vor dem Zusammenführen erklären muss. Beide Transferleistungen müssen nach der Umfangsentscheidung getrennt zugeordnet werden.',
            'A fresh basic case switches from oxide formation to a simple molecular reaction and requires justified choices of formulas and coefficients. For the separate half-equation competence, another case changes the number of transferred electrons so that the learner must explain how the half-equations are scaled before being combined. Both transfer performances must be assigned separately after the scope decision.'
        ),
        'rationale': 'Buch-Lernzielseite 9 (PDF-Seite 11) kombiniert einfache Gleichungen aus Reaktionsschemata mit Teil- und Gesamtgleichungen; die englische Fassung macht Teilgleichungen ausdrücklich zu half-equations. HE-G9, gedruckt S. 17, nennt Grundgleichungen aus bisherigen Schemata. Die aktuell geprüfte LehrplanPLUS-BY10-Quelle nennt Teil-/Gesamtgleichungen im Lernbereich Wie Chemiker denken und arbeiten und enthält Donator-Akzeptor-Kontexte. Elektronen- und Ladungsbilanz sind durch die hier gebundenen Voraussetzungen Reaktionserkennung und Symbolsprache nicht abgesichert; außerdem ist ein Redoxgleichungsziel als Nachfolger ausgewiesen. Ein rein sprachliches Zusammenziehen oder Entfernen würde die eigenständig prüfbare zweite Kompetenz verschleiern. Deshalb Umfang und mögliche Aufteilung fachlich entscheiden, ohne jetzt einen Ersatztext zu behaupten. Die BY10-Quellklausel beweist keine Zuordnung des Zusatzanteils in allen 16 Roh-jurisdictions.'
    },
    {
        'decision': 'revise',
        'proposedDescriptionDe': 'Die lernende Person kann qualitative Elementaranalysen von Kohlenwasserstoffen auswerten und aus den Nachweisen der Verbrennungsprodukte Kohlenstoffdioxid und Wasser auf Kohlenstoff und Wasserstoff in der Probe schließen.',
        'proposedDescriptionEn': 'The learner can evaluate qualitative elemental analyses of hydrocarbons and infer carbon and hydrogen in the sample from tests for the combustion products carbon dioxide and water.',
        'understandingEvidence': evidence(
            'Die qualitative Elementaranalyse erschließt Kohlenstoff und Wasserstoff der Probe indirekt über nachgewiesenes CO2 und H2O nach ihrer Verbrennung. Beobachtung am Nachweisreagenz, identifiziertes Produkt und Schluss auf ein Probenelement sind verschiedene Schritte. Die Nachweise bestimmen weder ein C:H-Verhältnis noch allein eine eindeutige Molekülformel.',
            'Qualitative elemental analysis infers carbon and hydrogen in the sample indirectly through detected CO2 and H2O after combustion. The observation at a test reagent, the identified product and the inference about an element in the sample are distinct steps. The tests establish neither a C:H ratio nor a unique molecular formula on their own.',
            'Die lernende Person wertet bereitgestellte Beobachtungen eines beaufsichtigten Verbrennungsversuchs und einer Blindprobe aus: Trübung von Kalkwasser wird CO2 zugeordnet, Blaufärbung von wasserfreiem Kupfersulfat H2O. Sie begründet den Rückschluss auf Kohlenstoff und Wasserstoff der Probe über die Produktzusammensetzung und benennt, wie Feuchtigkeit oder CO2 im Ausgangsgas den Schluss stören können.',
            'The learner evaluates supplied observations from a supervised combustion experiment and a blank: clouding of limewater is assigned to CO2 and anhydrous copper sulfate turning blue to H2O. The learner justifies the inference of carbon and hydrogen in the sample through product composition and identifies how moisture or CO2 in the incoming gas can interfere with that inference.',
            'Eine neue Aufgabe enthält einen positiven Wassernachweis bereits in der Blindprobe, aber erst nach Verbrennung einen CO2-Nachweis. Die lernende Person trennt den gesicherten Kohlenstoffschluss vom durch Hintergrundwasser unsicheren Wasserstoffschluss und begründet, welche kontrollierte Vergleichsbeobachtung zur Klärung benötigt wird.',
            'A fresh task contains a positive water test already in the blank, but a CO2 test that becomes positive only after combustion. The learner distinguishes the supported inference of carbon from the hydrogen inference obscured by background water and justifies which controlled comparison observation is needed to resolve it.'
        ),
        'rationale': 'Auf Buch-Lernzielseite 10 (PDF-Seite 12) kann Nachweise für Kohlenstoff und Wasserstoff als unmittelbarer Elementtest gelesen werden. Die präzise Verbindung über CO2 und H2O erklärt den bereits beanspruchten Auswertungsschluss, ohne quantitative Elementaranalyse, Strukturaufklärung oder neue eigene Durchführung zu ergänzen. HE-G9, gedruckt S. 26, nennt qualitative Elementaranalyse für Kohlenwasserstoffe. Verbrennungsdaten werden für unabhängige Aufgaben bereitgestellt oder beaufsichtigt erhoben; die Beschreibung fordert kein unbeaufsichtigtes gefährliches Experiment.'
    }
]

assert len(reviews) == len(batch_rows) == 10
run_id = campaign['roundId'] + '.batch-001.codex-local-b-v1'
records = []
for row, review in zip(batch_rows, reviews):
    goal = row['goal']
    record = {
        '$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
        'schemaVersion': 1,
        'recordId': run_id + '.' + goal['goalId'],
        'runId': run_id,
        'campaignId': campaign['campaignId'],
        'roundId': campaign['roundId'],
        'bundleFingerprint': row['bundleFingerprint'],
        'bookDigest': row['bookDigest'],
        **{key: goal[key] for key in ['goalId', 'goalFingerprint', 'pageFingerprint', 'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn']},
        **review,
        'evidenceProfileContract': 'positive-understanding-evidence-v2',
        'evidenceProfileRecommendation': 'create',
        'recordStatus': 'candidate',
        'reviewAuthority': 'ai_candidate'
    }
    records.append(record)

results = ROUND / 'results'
results.mkdir(exist_ok=True)
records_path = results / (run_id + '.records.jsonl')
assert not records_path.exists(), 'An existing frozen result must not be overwritten.'
record_bytes = ''.join(json.dumps(x, ensure_ascii=False, separators=(',', ':')) + '\n' for x in records).encode()
records_path.write_bytes(record_bytes)

parameters = {
    'executionMode': 'local interactive Codex independent subject review',
    'modelDisclosure': 'GPT-6 family announced by runtime; exact served model identifier and model revision are not exposed',
    'samplingDisclosure': 'No provider API was invoked. Temperature, seed, top_p, token budgets and hidden sampling settings were not exposed and are not asserted.',
    'independence': 'Only round-b input/campaign/batch/schema, AGENTS sections 7.1-7.4, bound book model and PDF, permitted current primary sources and technical validation code were read. No other D run, historical review, candidate/adjudication judgment or positive-evidence.candidates.json was read.',
    'rendering': {'tool': 'pdftoppm', 'format': 'png', 'bookDpi': 110, 'primarySourceDpi': 100},
    'reviewMethod': 'Personal inspection of every complete current PDF goal page, own subject-specific bilingual authoring, source-clause checks, exact input bindings and local schema/campaign validation.',
    'clockWindow': {'firstRecordedReviewClockUtc': '2026-10-05T01:34:12Z', 'recordedAuthoringClockUtc': '2026-10-05T01:38:08Z', 'note': 'Preliminary instructions/input reading preceded the first recorded clock. The timed window contains actual PDF/source inspection and local review/authoring; it is not provider API sampling time.'}
}
params_bytes = (json.dumps(parameters, ensure_ascii=False, indent=2) + '\n').encode()
(RECEIPTS / 'local-review-parameters.json').write_bytes(params_bytes)
completed = datetime.now(timezone.utc).isoformat(timespec='seconds').replace('+00:00', 'Z')
roles = ['book_pdf', 'book_pdf_render_manifest', 'book_model', 'review_prompt', 'review_criteria']
artifacts = [dict(role=x['role'], digest=x['digest']) for x in manifest['artifacts'] if x['role'] in roles]
artifacts.append({'role': 'description_review_batch_input_jsonl', 'digest': campaign['batches'][0]['batchInputFingerprint']})
run = {
    '$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
    'schemaVersion': 1,
    'runId': run_id,
    'campaignId': campaign['campaignId'],
    'roundId': campaign['roundId'],
    'batchId': batch_rows[0]['batchId'],
    'batchInputFingerprint': campaign['batches'][0]['batchInputFingerprint'],
    'bundleFingerprint': campaign['bundleFingerprint'],
    'bookDigest': campaign['bookDigest'],
    'provider': 'OpenAI Codex interactive runtime; local review without a separate provider API call',
    'model': 'GPT-6 family as disclosed by Codex runtime; exact served model ID not exposed',
    'modelVersion': 'Exact model revision not exposed by this runtime',
    'role': 'subject_reviewer',
    'promptFamilyId': 'skillpilot-goal-description-understanding-evidence-v2',
    'promptFingerprint': campaign['promptFingerprint'],
    'criteriaFingerprint': campaign['criteriaFingerprint'],
    'generationParametersFingerprint': sha(params_bytes),
    'independenceGroupId': campaign['independenceGroupId'],
    'blindToOtherRuns': True,
    'goalIds': batch_rows[0]['batchGoalIds'],
    'inputArtifacts': artifacts,
    'startedAt': '2026-10-05T01:34:12Z',
    'completedAt': completed,
    'status': 'completed',
    'outputDigest': sha(record_bytes),
    'toolchainVersion': 'codex-local-description-review-pdftoppm-v1'
}
run_path = results / (run_id + '.run.json')
assert not run_path.exists(), 'An existing frozen result must not be overwritten.'
run_path.write_text(json.dumps(run, ensure_ascii=False, indent=2) + '\n')
receipt = {
    'receiptKind': 'independent-current-description-review-b-freeze',
    'candidateOnly': True,
    'humanApprovalClaimed': False,
    'reviewStartedAtUtc': run['startedAt'],
    'reviewCompletedAtUtc': completed,
    'preliminaryReadTiming': parameters['clockWindow']['note'],
    'round': 'B',
    'runId': run_id,
    'bundleFingerprint': campaign['bundleFingerprint'],
    'bookDigest': campaign['bookDigest'],
    'bookPdfBytesDigest': sha((PACKAGE / 'bundle/book.pdf').read_bytes()),
    'bookModelBytesDigest': sha((PACKAGE / 'bundle/book-model.json').read_bytes()),
    'descriptionRecordsPath': str(records_path.relative_to(ROOT)),
    'descriptionRecordsDigest': sha(record_bytes),
    'runManifestPath': str(run_path.relative_to(ROOT)),
    'runManifestDigest': sha(run_path.read_bytes()),
    'blindUntilFrozen': parameters['independence'],
    'pStageNotReadOrAuthored': True,
    'pageInspection': [
        {'goalId': row['goal']['goalId'], 'bookPageNumber': row['goal']['reviewContext']['page']['pageNumber'], 'physicalPdfPageNumber': i + 3,
         'renderedPng': 'rendered-pages/page-' + str(i + 3).zfill(2) + '.png',
         'renderedPngDigest': sha((RECEIPTS / ('rendered-pages/page-' + str(i + 3).zfill(2) + '.png')).read_bytes()),
         'personallyInspected': True, 'completeDescriptionAndRelationsVisible': True,
         'visualizationUse': 'orientation/context only; no new V review or learner-understanding evidence inferred'}
        for i, row in enumerate(batch_rows)
    ],
    'sourceChecks': [
        {'sourceUrl': 'https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-06/g9-chemie.pdf', 'localFile': 'sources/he-g9-chemie.pdf', 'digest': sha((RECEIPTS / 'sources/he-g9-chemie.pdf').read_bytes()), 'printedPagesPersonallyInspected': [16, 17, 26], 'physicalPdfPages': [17, 18, 27], 'finding': 'Printed page 16 supplies the distinct amount/unit, mass-unit, conversion, Avogadro, molar-volume, gas-molar-mass and diatomic clauses. Printed page 17 supports basic reaction equations and particle representations. Printed page 26 lists qualitative elemental analysis. Source clauses support bounded subject reasoning; full mappings and state projections were not verified.'},
        {'sourceUrl': 'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/10/chemie/ch', 'localFile': 'sources/by10-chemie-ch.html', 'digest': sha((RECEIPTS / 'sources/by10-chemie-ch.html').read_bytes()), 'checkedLocation': 'Chemie 10 (HG, SG, MuG, WWG, SWG), Lernbereich 1 communication clause and reaction-equation content; Donator-Akzeptor learning-area context', 'finding': 'The current page includes half/overall equation construction and decomposition. This does not prove that electron-transfer half-equations belong to every jurisdiction of the broad canonical basic-equation goal.'},
        {'sourceUrl': 'https://www.bipm.org/en/si-base-units/mole', 'localFile': 'sources/bipm-mole.html', 'digest': sha((RECEIPTS / 'sources/bipm-mole.html').read_bytes()), 'finding': 'The current mole definition specifies the entities and fixes NA exactly. This was checked directly against the current BIPM page.'},
        {'sourceUrl': 'https://www.bipm.org/documents/20126/41489679/SI-App2-mole.pdf', 'localFile': 'sources/bipm-mole-mise-en-pratique.pdf', 'digest': sha((RECEIPTS / 'sources/bipm-mole-mise-en-pratique.pdf').read_bytes()), 'version': 'Version 2, May 2025', 'pagesPersonallyInspected': [1, 6], 'finding': 'The mol definition uses specified entities and exact NA; u is defined through carbon-12 and its link to a molar mass in g/mol is approximate after the 2019 revision. No advanced metrology requirement is imposed on the learner.'}
    ],
    'decisionCounts': {k: sum(x['decision'] == k for x in records) for k in ['keep', 'revise', 'split_review', 'block']},
    'mutationBoundary': 'Only round-b/results and this own receipt directory were authored. No canonical, registry, QA ledger, previous V, release or human approval was mutated.'
}
(RECEIPTS / 'description-freeze-receipt.json').write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'records': str(records_path.relative_to(ROOT)), 'run': str(run_path.relative_to(ROOT)), 'recordCount': len(records), 'outputDigest': run['outputDigest'], 'completedAt': completed, 'decisions': receipt['decisionCounts']}, ensure_ascii=False))
