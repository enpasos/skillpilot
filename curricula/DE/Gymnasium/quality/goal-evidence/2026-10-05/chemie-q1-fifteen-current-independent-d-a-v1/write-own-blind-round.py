#!/usr/bin/env python3
"""Materialize this agent's actual independent observations; never author active curriculum."""
from pathlib import Path
import json, hashlib, datetime

OWN = Path(__file__).resolve().parent
PREP = OWN.parent / 'chemie-q1-fourteen-current-native-candidate-v3'
ROUND = PREP / 'native-finalbook/round-a'
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def dump(p, o): p.write_text(json.dumps(o, ensure_ascii=False, indent=2) + '\n')
campaign = json.loads((ROUND/'description-review-campaign.json').read_text())
bundle = json.loads((ROUND/'review-bundle-manifest.json').read_text())
batch = campaign['batches'][0]
assert not (OWN/'results'/(batch['batchId']+'.records.jsonl')).exists(), 'Existing historical round must not be overwritten'
inputs = [json.loads(v) for v in (ROUND/'batches'/(batch['batchId']+'.input.jsonl')).read_text().splitlines()]
runid = 'chemie-q1-fifteen-current-independent-d-a-20261005-v1'

# Each row is independently written for the exact observed competence, not an answer key or release claim.
E = [
[
'Die Carboxygruppe verbindet einen Carbonylkohlenstoff mit einer Hydroxygruppe; sie kennzeichnet die betrachtete homologe Reihe. Säurebeobachtungen und verschiedene Formelarten beschreiben denselben Stoff und ersetzen einander nicht.',
'A carboxyl group joins a carbonyl carbon to a hydroxyl group and identifies the homologous series considered. Observations of acidity and different formula representations describe the same substance without replacing one another.',
'Die lernende Person markiert Carboxygruppen in mehreren Struktur- und Skelettformeln, ordnet eine geeignete Säurebeobachtung zu und konstruiert die nächsten Glieder einer homologen Reihe mit korrekten Bindungen.',
'The learner identifies carboxyl groups in several structural and skeletal formulas, connects them to an appropriate observation of acidity, and constructs further members of a homologous series with correct bonding.',
'An einem unbekannten, anders dargestellten Vertreter erkennt die lernende Person die Carboxygruppe, begründet die Einordnung und übersetzt zwischen Skelett- und Strukturformel, ohne jedes sauer reagierende Molekül als Carbonsäure einzuordnen.',
'For an unfamiliar representative in a different representation, the learner identifies the carboxyl group, justifies its classification, and translates between skeletal and structural formulas without treating every acidic molecule as a carboxylic acid.'
],
[
'Die relative Säurestärke hängt von der Stabilität der konjugierten Base ab. Die Ladungsverteilung im Carboxylat und induktive Einflüsse unterscheiden Carbonsäuren von Alkoholen und verändern die Acidität innerhalb einer Stoffklasse.',
'Relative acid strength depends on the stability of the conjugate base. Charge distribution in carboxylate and inductive effects distinguish carboxylic acids from alcohols and modify acidity within a compound class.',
'Die lernende Person begründet einen Alkohol-Carbonsäure-Vergleich mit den entstehenden Anionen, erläutert Mesomerie als eine gemeinsame delokalisierte Struktur und erklärt den Einfluss eines elektronenziehenden Substituenten.',
'The learner justifies an alcohol–carboxylic acid comparison using the resulting anions, explains resonance as one delocalized structure, and accounts for the effect of an electron-withdrawing substituent.',
'Bei einer veränderten Carbonsäure mit anderer Substitution überträgt die lernende Person die Argumentation auf die konjugierte Base und begründet eine qualitative Säurestärkereihenfolge statt aus dem Namen zu raten.',
'For a carboxylic acid with changed substitution, the learner applies the reasoning to its conjugate base and justifies a qualitative acidity order rather than guessing from the compound name.'
],
[
'Ester entstehen aus einer Carbonsäure und einem Alkohol durch Kondensation. Die Estergruppe und die übrige Molekülstruktur bestimmen zwischenmolekulare Wechselwirkungen und damit Eigenschaften, auf denen typische Anwendungen beruhen.',
'Esters form by condensation of a carboxylic acid and an alcohol. The ester group and the remainder of the molecular structure determine intermolecular interactions and thus properties relevant to typical uses.',
'Die lernende Person verknüpft experimentelle Beobachtungen mit einer ausgeglichenen Kondensationsgleichung, identifiziert die Estergruppe und begründet eine Eigenschaft sowie einen dazu passenden Einsatzbereich.',
'The learner connects experimental observations to a balanced condensation equation, identifies the ester group, and explains a property together with a suitable application.',
'Für einen Ester aus anderen Ausgangsstoffen leitet die lernende Person das Produkt ab und vergleicht eine Eigenschaft anhand der veränderten Molekülstruktur, statt Fruchtester-Eigenschaften auf jeden Ester zu übertragen.',
'For an ester formed from different starting compounds, the learner derives the product and compares a property using the changed molecular structure instead of extending fruit-ester properties to every ester.'
],
[
'Esterbildung und saure Hydrolyse bilden ein reversibles Reaktionssystem. Bei alkalischer Hydrolyse führt die Bildung von Carboxylationen zur praktisch einseitigen Umsetzung; Reaktionsbedingungen bestimmen die erwarteten Produkte.',
'Ester formation and acidic hydrolysis constitute a reversible reaction system. In alkaline hydrolysis, carboxylate formation drives a practically one-way conversion; reaction conditions determine the expected products.',
'Die lernende Person formuliert zusammengehörige Esterbildungs- und Hydrolysegleichungen und erklärt mit den Produkten, warum saure und alkalische Bedingungen nicht dieselbe Gleichgewichtsbetrachtung erlauben.',
'The learner writes related esterification and hydrolysis equations and uses their products to explain why acidic and alkaline conditions do not permit the same equilibrium treatment.',
'Bei einem anderen Ester und einer geänderten Reaktionsbedingung sagt die lernende Person die Produkte voraus und deutet eine zugehörige Beobachtung mit dem Unterschied zwischen Carbonsäure und Carboxylat.',
'For another ester and changed reaction conditions, the learner predicts the products and explains a related observation using the distinction between carboxylic acid and carboxylate.'
],
[
'Alkalische Esterhydrolyse umfasst den nukleophilen Angriff, ein tetraedrisches Zwischenprodukt, die Abspaltung einer Abgangsgruppe und eine abschließende Säure-Base-Reaktion. Ladungen und Bindungsänderungen begründen die Produktbildung.',
'Alkaline ester hydrolysis involves nucleophilic attack, a tetrahedral intermediate, departure of a leaving group, and a final acid–base step. Charges and bond changes explain product formation.',
'Die lernende Person erläutert einen Mechanismus mit korrekt geladenem Zwischenprodukt und verfolgt Bindungsbildung, Bindungsspaltung und Protonenübertragung bis zu Carboxylat und Alkohol.',
'The learner explains a mechanism with a correctly charged intermediate and follows bond formation, bond cleavage, and proton transfer through to carboxylate and alcohol.',
'An einem Ester mit veränderten Resten ergänzt oder beurteilt die lernende Person eine Mechanismusdarstellung und begründet, welche Schritte unverändert gelten und an welcher Stelle eine gezeigte Ladung oder Abgangsgruppe korrigiert werden muss.',
'For an ester with different substituents, the learner completes or evaluates a mechanism and explains which steps still apply and where a displayed charge or leaving group must be corrected.'
],
[
'Bei Transesterifizierung wird die Alkoholkomponente eines Esters ausgetauscht. Die Reaktion ist ein Gleichgewicht; Überschuss eines Reaktanden oder Entfernung eines Produkts kann die gewünschte Umsetzung begünstigen.',
'Transesterification exchanges the alcohol component of an ester. The reaction is an equilibrium, and excess reactant or product removal can favour the desired conversion.',
'Die lernende Person entwirft für vorgegebene Stoffe eine passende Reaktionsgleichung und begründet die Wahl einer Gleichgewichtsverschiebung sowie geeigneter katalytischer Bedingungen.',
'The learner designs a suitable equation for specified compounds and justifies an equilibrium-shifting strategy and appropriate catalytic conditions.',
'Bei einer geänderten Ausgangsester-Alkohol-Kombination oder eingeschränkter Produktabtrennung passt die lernende Person die Planung begründet an und unterscheidet Transesterifizierung von Hydrolyse.',
'For a changed ester–alcohol combination or restricted product separation, the learner adapts the plan with reasons and distinguishes transesterification from hydrolysis.'
],
[
'Fette sind Triester des Glycerins. Ihre alkalische Hydrolyse liefert Glycerin und Fettsäuresalze; Aussalzen trennt die Seifenphase von Bestandteilen der wässrigen Reaktionsmischung.',
'Fats are glycerol triesters. Their alkaline hydrolysis yields glycerol and fatty acid salts; salting out separates the soap phase from constituents of the aqueous reaction mixture.',
'Die lernende Person führt ein beaufsichtigtes geeignetes Schulverfahren aus, ordnet die Produkte den drei Esterbindungen des Fetts zu und erklärt die Phasentrennung bei der Seifengewinnung.',
'The learner carries out an appropriate supervised school procedure, relates its products to the three ester bonds of the fat, and explains phase separation during soap isolation.',
'Bei einer anderen Fettstruktur oder geänderten Beobachtung der Trennung begründet die lernende Person die erwarteten Fettsäuresalze und erklärt, warum Aussalzen eine Trennung und keine zusätzliche Esterhydrolyse ist.',
'For another fat structure or a changed separation observation, the learner derives the expected fatty acid salts and explains why salting out is separation rather than further ester hydrolysis.'
],
[
'Amphiphile Seifenanionen besitzen einen wasserzugewandten Kopf und einen hydrophoben Rest. Diese Struktur erklärt die Anordnung an Grenzflächen, Micellenbildung und die Verteilung hydrophober Stoffe in Wasser.',
'Amphiphilic soap anions possess a water-facing head group and a hydrophobic chain. This structure explains interfacial arrangement, micelle formation, and dispersion of hydrophobic substances in water.',
'Die lernende Person zeichnet die Orientierung von Seifenanionen an einer Wasser-Öl-Grenzfläche und in einer Micelle und erklärt damit eine beobachtete Emulgierwirkung sowie die verringerte Oberflächenspannung.',
'The learner draws soap-anion orientations at a water–oil interface and in a micelle and uses them to explain observed emulsification and reduced surface tension.',
'In einer veränderten Teilchenskizze oder einem anderen Öl-Wasser-Beispiel begründet die lernende Person die Kopf- und Restorientierung und korrigiert eine Anordnung, die hydrophobe Reste dem Wasser zuwendet.',
'In a changed particle diagram or another oil–water example, the learner justifies head-group and chain orientation and corrects an arrangement that exposes hydrophobic chains to water.'
],
[
'Seifen und synthetische Tenside teilen den amphiphilen Aufbau, unterscheiden sich aber in ihren Kopfgruppen und deren Reaktionen unter Waschbedingungen. Vorteile und Nachteile hängen vom konkreten Tensid und seinem Einsatz ab.',
'Soaps and synthetic surfactants share an amphiphilic structure but differ in head groups and their reactions under washing conditions. Advantages and disadvantages depend on the particular surfactant and its use.',
'Die lernende Person vergleicht ein Fettsäuresalz mit einem modernen Tensid anhand der Struktur, erklärt Unterschiede bei saurem oder hartem Wasser und wägt einen Nutzen und eine begrenzte Umweltaussage fachlich ab.',
'The learner compares a fatty acid salt with a modern surfactant by structure, explains differences in acidic or hard water, and weighs a benefit against a appropriately qualified environmental statement.',
'Für einen veränderten Waschkontext begründet die lernende Person eine Auswahl anhand nachgewiesener Eigenschaften, ohne allen synthetischen Tensiden dieselbe biologische Abbaubarkeit zuzuschreiben.',
'For a changed washing context, the learner justifies a choice using established properties without assigning the same biodegradability to every synthetic surfactant.'
],
[
'Waschleistung entsteht aus Teilchenwechselwirkungen und hängt von Temperatur, verfügbarer Tensidmenge und Wasserhärte ab. Dispergieren und Micellenbildung unterstützen die Entfernung hydrophober Verschmutzung, während Kalkseifen Tensid binden.',
'Washing performance arises from particle interactions and depends on temperature, available surfactant, and water hardness. Dispersion and micelle formation support removal of hydrophobic dirt, while insoluble calcium or magnesium soaps remove active surfactant.',
'Die lernende Person erklärt einen kontrollierten Vergleich von Waschbedingungen mit Micellenbildung, Dispergieren und Kalkseifenbildung und unterscheidet Beobachtung, Einflussgröße und begründete Ursache.',
'The learner explains a controlled comparison of washing conditions through micelle formation, dispersion, and insoluble-soap formation, distinguishing observation, changed variable, and justified cause.',
'Bei einem anderen Waschmittel oder einer geänderten Wasserhärte entwickelt die lernende Person eine begründete qualitative Prognose und erkennt, dass mehr Tensid oder höhere Temperatur nicht unter allen Bedingungen beliebig mehr Waschwirkung bedeuten.',
'For another detergent or changed water hardness, the learner develops a reasoned qualitative prediction and recognizes that more surfactant or higher temperature does not improve washing without limit under every condition.'
],
[
'Calcium- und Magnesiumionen verursachen Wasserhärte. Der beim Erhitzen abtrennbare Anteil unterscheidet sich vom verbleibenden Anteil; die Gesamthärte fasst diese Beiträge zusammen, und Enthärtung entfernt oder bindet die Härtebildner.',
'Calcium and magnesium ions cause water hardness. The fraction removable on heating differs from the persistent fraction; total hardness combines these contributions, and softening removes or binds the hardness-producing ions.',
'Die lernende Person ordnet geeignete Ionen- und Salzbeispiele temporärer oder permanenter Härte zu, deutet eine Erhitzungsbeobachtung und erklärt ein Enthärtungsverfahren auf Teilchenebene mit korrektem Ladungsausgleich.',
'The learner classifies suitable ion and salt examples as temporary or permanent hardness, interprets a heating observation, and explains a softening method at particle level with correct charge accounting.',
'Bei einer unbekannten Wassermischung oder geänderter Behandlung begründet die lernende Person, welcher Härteanteil verbleibt, und unterscheidet die Ionenaustauschwirkung vom bloßen Entfernen sichtbarer Trübung.',
'For an unfamiliar water mixture or changed treatment, the learner explains which hardness fraction remains and distinguishes ion exchange from merely removing visible turbidity.'
],
[
'Biologische Abbaubarkeit eines Tensids wird anhand seiner durch Mikroorganismen bewirkten Umwandlung beurteilt. Der Verlust der Tensidwirkung allein belegt keinen vollständigen Abbau; Testbedingungen und beobachtete Endpunkte gehören zur Aussage.',
'Surfactant biodegradability is assessed through transformation caused by microorganisms. Loss of surfactant activity alone does not establish complete degradation; test conditions and observed endpoints are part of the claim.',
'Die lernende Person erläutert anhand geeigneter Beobachtungen den Unterschied zwischen primärem Funktionsverlust und weitergehendem Abbau und begründet, welche Kriterien eine Abbaubarkeitsaussage tragen und welche Daten fehlen.',
'The learner explains the difference between primary loss of function and more extensive degradation using suitable observations and justifies which criteria support a biodegradability claim and which data are missing.',
'Bei einem geänderten Tensid oder Versuch mit anderer Beobachtungsdauer beziehungsweise Sauerstoffversorgung erläutert die lernende Person die Grenzen der Vergleichbarkeit, statt fehlende Schaumbildung als alleinigen Vollabbau-Nachweis zu verwenden.',
'For another surfactant or a test with a changed duration or oxygen supply, the learner explains comparability limits instead of treating absent foam as sufficient evidence of complete degradation.'
],
[
'Konservierungsverfahren hemmen Lebensmittelverderb auf unterschiedliche Weise. Historische und moderne Beispiele können nach ihrem Wirkprinzip verglichen werden; ein Risiko ergibt sich aus den jeweiligen Bedingungen und einer möglichen Fehlanwendung.',
'Preservation methods inhibit food spoilage in different ways. Historical and modern examples can be compared by their operating principles; risks depend on the particular conditions and possible misuse.',
'Die lernende Person stellt je ein historisches und modernes Verfahren anhand eines nachvollziehbaren Wirkprinzips gegenüber und benennt einen konkreten, zum Verfahren passenden Risikozusammenhang.',
'The learner compares a historical and a modern method using a comprehensible operating principle and identifies a specific risk associated with the method.',
'Für ein anderes Lebensmittel oder eine geänderte Lagerbedingung überträgt die lernende Person den Vergleich und erläutert, warum die Eignung eines Verfahrens vom Kontext abhängt und die Bezeichnung modern allein keine Sicherheit belegt.',
'For another food or changed storage condition, the learner transfers the comparison and explains why suitability depends on context and why the label modern alone does not establish safety.'
],
[
'Ascorbinsäure kann Elektronen abgeben und ein geeignetes Nachweisreagenz reduzieren. Die dabei beobachtete Veränderung und die antioxidative Wirkung beruhen auf derselben Redoxbeziehung; ein qualitativer Test bestimmt keine Konzentration.',
'Ascorbic acid can donate electrons and reduce a suitable test reagent. The observed change and antioxidant action reflect the same redox relationship; a qualitative test does not determine concentration.',
'Die lernende Person führt einen geeigneten beaufsichtigten qualitativen Nachweis mit Vergleich durch und verknüpft die beobachtete Reagenzreduktion mit der Elektronenabgabe der Ascorbinsäure.',
'The learner carries out a suitable supervised qualitative test with a comparison and connects the observed reagent reduction to electron donation by ascorbic acid.',
'Bei einer anders zusammengesetzten Probe oder einem geeigneten anderen Redoxreagenz erläutert die lernende Person die erwartete Beobachtung und nennt eine begründete Aussagegrenze bei weiteren reduzierenden Stoffen.',
'For a differently composed sample or another suitable redox reagent, the learner explains the expected observation and states a justified limitation when other reducing substances are present.'
],
[
'Di- und Tricarbonsäuren enthalten zwei beziehungsweise drei Carboxygruppen im selben Molekül. Die funktionelle Gruppenzahl lässt sich unabhängig von der räumlichen Zeichnungsform an einer korrekten Strukturformel bestimmen.',
'Dicarboxylic and tricarboxylic acids contain two or three carboxyl groups in the same molecule. Their functional-group count can be determined from a correct structural formula regardless of drawing orientation.',
'Die lernende Person markiert die Carboxygruppen geeigneter Di- und Tricarbonsäuren, begründet ihre Einordnung und verwendet eine korrekt gebundene Struktur- oder Skelettformel.',
'The learner identifies carboxyl groups in suitable dicarboxylic and tricarboxylic acids, justifies their classification, and uses a correctly bonded structural or skeletal formula.',
'An einer anders dargestellten mehrfunktionellen Säure unterscheidet die lernende Person Carboxygruppen von zusätzlichen Hydroxygruppen und übersetzt die Darstellung ohne eine Gruppe doppelt zu zählen.',
'For a differently represented multifunctional acid, the learner distinguishes carboxyl groups from additional hydroxyl groups and translates the representation without counting a group twice.'
]
]

R = [
'KEEP: Ein enges Stoffklassen-Erkennungsziel verknüpft Carboxygruppe, Säurebeobachtung, homologe Reihe und Darstellungswechsel. Aktuelle DE/EN sind äquivalent. HE Q1.3 B01A02–04 deckt diese Teilkompetenz; Nomenklatur und die volle Struktur-Eigenschafts-Zeile werden damit nicht als erledigt behauptet. Native PDF S.3 und HTML zeigen die passenden Formeln und Beobachtungen vollständig; externe Alkanol-Voraussetzung und interne Folgerouten sind korrekt getrennt. GK/LK ist angemessen.',
'KEEP: Ein begründeter Säurestärkevergleich, kein bloßes Säureetikett. HE Q1.3 B02A01 und beide tatsächlichen BY-10-Originale tragen Vergleich und Begründung. Aktuelle DE/EN stimmen überein; die tatsächliche neue PNG zeigt ein einzelnes delokalisiertes Acetat mit gemeinsamer Gesamtladung, nicht zwei getrennte Anionen. PDF S.4/HTML, Vorziel und Folgerouten passen zur GK/LK-Reichweite.',
'BLOCK für den aktuellen bilingualen Titel: DE heißt Esterbildung und Estereigenschaften erklären, EN heißt Plan ester formation. Der EN-Titel ersetzt den ableitenden/erklärenden Operator durch Planung und lässt die Eigenschaftsreichweite aus. Beide vollständigen Beschreibungen sind fachlich äquivalent und durch den tatsächlichen BY-Originaloperator Beobachtung → Esterbildung → Eigenschaften gedeckt; Nutzung ist eine zugehörige Anwendung. Das ist eine kohärente Esterkompetenz, keine pauschale Verbenzählung. PDF S.5/HTML und Bild passen zum DE-Text. Zur Auflösung muss der Titel gezielt geändert und der tatsächlich neu gebundene Ziel-/Kontext-/Seiteninput geprüft werden; bis dahin keine strenge Freigabe dieses aktuellen Inputs.',
'KEEP: Die Kernleistung ist Reaktionsbedingungen über Esterbildung/-spaltung zu deuten. DE/EN unterscheiden reversible saure Hydrolyse von praktisch einseitiger alkalischer Carboxylatbildung; HE Q1.3 B05A01 und BY-Reversibilitätsoperator passen. Das spätere LK-Mechanismusziel bleibt getrennt. PDF S.6/HTML und actual JPG zeigen passende Produkte und Pfeile; GK/LK-Breite ist belegt.',
'KEEP: Ein abgegrenztes LK-Mechanismusziel mit vorausgesetzter Produkt-/Reversibilitätskompetenz. HE Q1.3 B06A01 nennt ausdrücklich die mechanistische Vertiefung. DE/EN, PDF S.7 und HTML stimmen überein; im tatsächlichen JPG ist der tetraedrische Sauerstoff negativ geladen und die abschließende Säure-Base-Stufe richtig. Atomarität ergibt sich aus einer erklärbaren Mechanismuskette, nicht aus bloßem Benennen vieler Zwischenprodukte.',
'KEEP: Planung und Gleichgewichtsbeurteilung beziehen sich auf denselben Alkoholkomponenten-Austausch. DE/EN sind gleichwertig; HE Q2.1 B15A01 belegt Umesterung als LK-Inhalt, zusätzlich ist Q4.2 als späterer Biodieselkontext vorhanden. Die didaktische Q1-Platzierung wird nicht als HE-Q1-Quellenzeile ausgegeben. PDF S.8/HTML, Reaktionspfeile, Alkoholprodukte und der vorherige Esterbildungsbezug sind passend.',
'KEEP: Herstellungsprozess und stoffliche Erklärung sind eine experimentell prüfbare Verseifungskompetenz. HE Q1.4 B01A01 trägt alkalische Fettspaltung; DE/EN schließen Glycerin und Fettsäuresalze ein. Die aktuelle PNG zeigt drei Fett-Esterbindungen, Glycerin mit drei OH-Gruppen und drei Fettsäuresalze korrekt; Aussalzen ist als Trennung dargestellt. Native PDF S.9/HTML sind vollständig, Vorziel Hydrolyse ist passend. Beaufsichtigte Schulausführung, keine unabhängige Sicherheitsfreigabe.',
'KEEP: Teilchenorientierung erklärt Micellen, Grenzflächenwirkung und Emulgieren als zusammenhängende Struktur-Eigenschafts-Kompetenz. HE Q1.4 B02A01/B03A01 sind die zugeordneten Teilaspekte; pH, alle Waschfaktoren und die gesamte Quellenzeile werden nicht automatisch abgeschlossen. DE/EN, actual JPG, PDF S.10 und HTML passen; schematische Öl-Verteilung behauptet keine maßstäbliche Micellengröße.',
'KEEP: Die Struktur-/Eigenschaftsunterschiede tragen die fachliche Abwägung desselben Tensidvergleichs. Der tatsächliche BY-NTG-Operator verlangt unterscheiden und bewerten; BB S.24 trägt die Säure-/Härteempfindlichkeit und Struktur-Eigenschafts-Deutung. DE/EN, Canonical-Sek-I-Kontext, PDF S.11 und HTML passen. Das JPG qualifiziert die Bioabbaubarkeit je nach Typ; eine pauschale Eigenschaft aller modernen Tenside wird nicht als Lernleistung festgeschrieben.',
'KEEP: Eine begründete Einflussfaktoren-Deutung des Waschvorgangs, kein Bündel selbstständiger Herstellungs-/Analyseverfahren. HE Q1.4 B03A01 nennt Temperatur, Härte, Tensidkonzentration, Dispergieren, Micellen und Kalkseifen. DE/EN sind gleichwertig, einschließlich Calcium-/Magnesiumseifen. PDF S.12/HTML und actual JPG unterstützen die Faktorenbeziehung; LK-Wasserhärtebegriffe und Abbaubarkeitskriterien bleiben in eigenen Zielen.',
'KEEP: Eine LK-Kompetenz zur Härteklassifikation und ihrer durch Enthärtung veränderten Ionenlage. HE Q1.4 B04A01 trägt temporäre, permanente und Gesamthärte; HE Q4.3 LK nennt Ionenaustausch. Actual PNG zeigt Hydrogencarbonat-Erhitzung, persistenten Chloridfall und ladungsrichtigen Natriumionenaustausch. PDF S.13 und HTML wurden tatsächlich gesehen: Der Titel beginnt vollständig mit Wasserhärte und ist normal auf zwei Zeilen umgebrochen, kein nachgewiesenes Clipping. DE/EN und Vorziel stimmen.',
'KEEP für die tatsächlich benannte Kriterienkompetenz: primärer Funktionsverlust und weitergehender biologischer Abbau sind zu unterscheiden und anhand beobachteter Endpunkte/Bedingungen zu begründen. Der tatsächliche HE Q4.3-Kontext enthält Abbaubarkeit und LK-Abbaupfade; dieses Teilziel behauptet weder alle Nachhaltigkeitsdimensionen noch die vollständige spezielle Hydrolyse-/Oxidations-/β-Oxidationsroute zu decken. DE/EN, native PDF S.14/HTML und die Übersicht passen als Einstieg in Kriterien. Die positive Evidenz fordert eine fachliche Erläuterung mit Aussagegrenzen, kein Auswendigwort.',
'KEEP: Historisch/modern ist ein Vergleichsrahmen für Wirkprinzip und konkretes Risiko, keine pauschale Sicherheitsbewertung einer gesamten Methode. HE Q1.5 B01A01 trägt diesen GK/LK-Operator. DE/EN, actual JPG, PDF S.15 und HTML passen; besondere Sorbinsäure-/Redoxnachweise und moderne quantitative Verfahren werden nicht mit diesem allgemeinen Vergleich abgeschlossen.',
'KEEP: Durchführung und Redoxdeutung bilden einen einzigen qualitativen Nachweiszusammenhang. HE Q1.5 B02A01 nennt qualitative Ascorbinsäure und antioxidative Wirkung; die LK-Quantitation bleibt außerhalb. DE/EN, actual PNG mit brauner Vergleichsprobe, Elektronenabgabe und Iodidprodukt sowie PDF S.16/HTML passen. Ein reagentspezifischer Nachweis ist ein zulässiges Beispiel; weitere Reduktionsmittel begrenzen Spezifität, keine Konzentrationsaussage.',
'KEEP für die aktuelle bestehende Seitenbindung: HE Q1.3 LK nennt strukturelle Betrachtungen der Di-/Tricarbonsäuren. DE/EN und der abgegrenzte Mehrfach-Carboxylgruppenoperator passen. Actual JPG zeigt korrekt Oxalsäure mit zwei und Citronensäure mit drei Carboxygruppen plus zusätzlicher OH-Gruppe; native PDF S.17/HTML und der LK-Untercluster sind aktuell vollständig. Das Urteil repariert eine bestehende Bindung und ist kein behaupteter neuer fachlicher Abschluss.'
]
keys = ['essentialUnderstandingDe','essentialUnderstandingEn','observablePerformanceDe','observablePerformanceEn','transferExpectationDe','transferExpectationEn']
assert len(inputs)==len(E)==len(R)==15
outdir=OWN/'results'; outdir.mkdir(exist_ok=True)
records=[]
for i,(inp,e,rat) in enumerate(zip(inputs,E,R),1):
 g=inp['goal']; assert g['reviewContext']['evidenceProfile'] is None
 rec={'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json','schemaVersion':1,'recordId':f'{runid}.record-{i:03d}','runId':runid,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest']}
 for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']:rec[k]=g[k]
 rec.update(decision='block' if i==3 else 'keep',understandingEvidence=dict(zip(keys,e)),rationale=rat,evidenceProfileContract='positive-understanding-evidence-v2',evidenceProfileRecommendation='create',recordStatus='candidate',reviewAuthority='ai_candidate')
 records.append(rec)
recordspath=outdir/(batch['batchId']+'.records.jsonl')
recordspath.write_text(''.join(json.dumps(o,ensure_ascii=False,separators=(',',':'))+'\n' for o in records))
params={'reviewer':'independent OpenAI Codex subagent D-A','samplingParameters':'Not separately exposed by this orchestration','Q1DescriptionOrProfileAuthorship':False,'otherQ1DescriptionVerdictsRead':False,'actualPagesRead':{'pdfPhysicalPages':list(range(1,18)),'htmlGoalSections':15},'humanApproval':False,'humanTrial':False,'noActiveWrites':True}
dump(OWN/'generation-parameters.json',params)
run={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':runid,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint'],'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],'provider':'OpenAI Codex','model':'Codex reviewer; exact model identifier not exposed','role':'subject_reviewer','promptFamilyId':'goal-description-understanding-evidence-v2','promptFingerprint':campaign['promptFingerprint'],'criteriaFingerprint':campaign['criteriaFingerprint'],'generationParametersFingerprint':'sha256:'+sha(OWN/'generation-parameters.json'),'independenceGroupId':campaign['independenceGroupId'],'blindToOtherRuns':True,'goalIds':batch['goalIds'],'inputArtifacts':[{'role':v['role'],'digest':v['digest']} for v in bundle['artifacts']]+[{'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']}],'startedAt':json.loads((OWN/'blind-current-review.preparation.receipt.json').read_text())['preparedAtUTC'],'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'completed','outputDigest':'sha256:'+sha(recordspath),'toolchainVersion':'goal-description-review-v1'}
dump(outdir/(batch['batchId']+'.run.json'),run)
dump(OWN/'independent-current-findings.json',{'inputBookDigest':campaign['bookDigest'],'inputBundleFingerprint':campaign['bundleFingerprint'],'actualNativeDecisions':{'keep':14,'block':1},'findings':[{'id':'q1-d-a-en-ester-title-001','goalId':inputs[2]['goal']['goalId'],'status':'open','severity':'current_bilingual_scope_operator_mismatch','actualEnglishTitle':inputs[2]['goal']['currentTitleEn'],'actualGermanTitle':inputs[2]['goal']['currentTitleDe'],'proposedEnglishTitle':'Explain ester formation and ester properties','proposedDescriptionChange':None,'findingResolved':False,'requiredFollowup':'Change only title in a new isolated candidate, produce current native bindings; review actual changed goal/page and title appearances in other affected contexts. Preserve this blocked original review unchanged.'}],'actualChecks':{'all17PDFPagesViewed':True,'all15HTMLSectionsViewed':True,'waterHardnessTitleClippingReproduced':False,'sourceOperatorBreadthRead':True,'all16JurisdictionsIndependentlySourceApproved':False,'standaloneNewVisualizationApprovalsIssued':False,'boundProfilesActuallyRead':0,'profileRecommendationCreate':15},'humanApproval':False,'humanTrial':False,'activeWrites':0})
print(recordspath)
print('14 keep, 1 block; no active writes')
