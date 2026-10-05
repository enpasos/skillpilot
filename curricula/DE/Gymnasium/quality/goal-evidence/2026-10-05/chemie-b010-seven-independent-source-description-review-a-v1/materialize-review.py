import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
OWN = Path(__file__).resolve().parent
AUTHOR = OWN.parent / 'chemie-b010-seven-current-source-description-candidate-v1'
NOW = datetime.now(timezone.utc).isoformat()
REL = str(OWN.relative_to(ROOT))
CANON = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
CONFIG = 'curricula/DE/Gymnasium/quality/goal-description-review/chemie/rollout-v1/2026-10-05/batch-010-open-ions-elements-seven-current-v2.config.json'
IDS = json.loads((ROOT / CONFIG).read_text())['goalIds']
INPUT = json.loads((AUTHOR / 'current-description-review-input.json').read_text())
BUNDLE = json.loads((AUTHOR / 'bundle/manifest.json').read_text())
GOALS = {g['id']: g for g in json.loads((ROOT / CANON).read_text())['goals']}
assert IDS == [g['goalId'] for g in INPUT['goals']]
assert 'b5086548-169e-5d63-a14a-dabf631fa013' not in IDS
assert 'd726e00e-1f87-5ba5-8c79-76ad4022365e' not in IDS

def digest(path):
    return 'sha256:' + hashlib.sha256(path.read_bytes()).hexdigest()

def write(name, obj):
    (OWN / name).write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')

# These are this reviewer's own judgments and evidence chains. No author or
# previous reviewer record is read or copied by this materializer.
DATA = [
 {
  'decision': 'split_review', 'atomicity': 'non_atomic',
  'reason': 'Rutherford-Befunde zum räumlichen Kern-Hülle-Aufbau auswerten und bekannte Teilchen nach ihren Eigenschaften zuordnen sind unabhängig prüfbar. Eine richtige Teilchenzuordnung beweist keine Streuinferenz. HE10.1 und BY8.4/BY9-other.4 stützen beide Bestandteile, aber nicht die zusätzlichen als exact gemappten Atommasse-/Isotop-/Element-/Modellgrenzen-/Ionentheorie-Zellen. Der alte Provenienzschlüssel existiert in der aktuellen HE-Extraction nicht. Der Split bleibt eine nicht adoptierte ID-null Option.',
  'essentialDe': 'Die meist geradlinigen und selten stark abgelenkten positiven Alpha-Teilchen stützen im Rutherford-Modell einen kleinen positiven Kern und viel freien Atomraum. Protonen und Neutronen liegen im Kern, Elektronen in der Hülle; die Teilchen haben verschiedene Ladungen und relative Massen. Neutronen werden nicht durch den Streuversuch nachgewiesen.',
  'essentialEn': 'Mostly straight and rarely strongly deflected positive alpha particles support a small positive nucleus and extensive free atomic space in Rutherford’s model. Protons and neutrons are in the nucleus and electrons in the surrounding region; their charges and relative masses differ. Scattering does not establish the existence of neutrons.',
  'observableDe': 'Die lernende Person begründet mit gegebenen Streubefunden die Kern-Hülle-Struktur und kennzeichnet getrennt davon in einer selbst angefertigten Atomskizze die drei Teilchensorten mit Ort und Ladung. Sie unterscheidet Befund, Modellschluss und zusätzlich bekanntes Teilchenwissen.',
  'observableEn': 'The learner uses supplied scattering observations to justify the nuclear structure and separately labels the three particle types by location and charge in a self-made atomic sketch. They distinguish observations, model inferences and additional knowledge about particles.',
  'transferDe': 'An einer neuen Verteilung von Durchgängen und starken Ablenkungen beurteilt die lernende Person, welche Kern-Hülle-Schlüsse noch getragen sind, und prüft unabhängig eine anders beschriftete Atomskizze. Ein bloßer Austausch des Elements ersetzt die neue Streuargumentation nicht.',
  'transferEn': 'With a new distribution of transmitted and strongly deflected particles, the learner judges which nuclear-model conclusions remain supported and independently checks a differently labelled atomic sketch. Merely replacing the element does not replace the new scattering argument.',
  'memory': 'memory_required',
  'memoryReason': 'Ort und Ladung der drei Grundteilchen sind kompakte notwendige Abruffakten. Die vorhandene Karte chem_basics_005 bleibt erforderlich; Rutherford-Schlüsse brauchen Modellverständnis und rechtfertigen keine zusätzliche Karte.',
  'holds': ['Current provenance sourceGoalId fd02c993-0950-41a4-a861-7522d1bd3f8c is absent from the current HE extraction.', 'HE exact mappings for Atommasse, Isotope, Rein-/Mischelemente, Grenzen des Kern-Hülle-Modells and Berücksichtigung der Ionentheorie are not fully demonstrated by this text or the two proposed children.', 'BY9-NTG.2.2 requires using periodic-table data; simple particle assignment is only partial coverage.', 'Stable-ID allocation and changed downstream dependencies remain unadopted.'],
 },
 {
  'decision': 'revise', 'atomicity': 'atomic',
  'reason': 'Anordnung, Koordination und Eigenschaften werden als ein räumlicher Struktur-Eigenschafts-Zusammenhang beurteilt. Der aktuelle Text macht HE-Koordinationszahl und BY-Modellierung nicht ausreichend sichtbar. Im Autorenkandidaten ist Anziehung zu eng: die Erklärung von Sprödigkeit benötigt auch Abstoßung gleich geladener Nachbarn nach einer Verschiebung. Der Ersatz erhält Modellieren, Koordinationszahl und mehrere typische Eigenschaften; er reduziert das Ziel nicht auf das Lesen eines fertigen Modells. Molekül-/Verhältnisformeln, Salzbildung und Hydrogenhalogenidreaktionen bleiben getrennte Quellenklauseln.',
  'de': 'Die lernende Person kann einfache Ionengitter wie Natriumchlorid modellieren, ihre räumliche Anordnung einschließlich der Koordinationszahl beschreiben und typische Stoffeigenschaften durch elektrostatische Kräfte und Ionenbeweglichkeit erklären.',
  'en': 'The learner can model simple ionic lattices such as sodium chloride, describe their spatial arrangement including coordination number, and explain typical material properties through electrostatic forces and ion mobility.',
  'essentialDe': 'Ein Ionengitter ist ein räumliches, elektrisch insgesamt neutrales Netzwerk von Kationen und Anionen und kein Satz einzelner Salzmoleküle. Die Koordinationszahl zählt nächste Nachbarn; Bindung, sprödes Verhalten und Leitfähigkeit in festen bzw. beweglichen Zuständen folgen aus Ladungswechsel, Kräften und Beweglichkeit.',
  'essentialEn': 'An ionic lattice is a spatial network of cations and anions that is electrically neutral overall, rather than a set of individual salt molecules. Coordination number counts nearest neighbours; bonding, brittleness and conductivity in fixed versus mobile states follow from charge arrangement, forces and mobility.',
  'observableDe': 'Die lernende Person erstellt ein geeignetes Gittermodell, bestimmt darin die nächste Nachbarschaft und erklärt mit der Struktur mindestens die stabile Anordnung, sprödes Verhalten sowie den Leitfähigkeitsunterschied zwischen festem Salz und Schmelze oder Lösung. Eine zweidimensionale Ansicht wird nicht ungeprüft als dreidimensionale Koordination gelesen.',
  'observableEn': 'The learner constructs a suitable lattice model, identifies its nearest-neighbour environment, and uses its structure to explain stable arrangement, brittleness and the conductivity difference between a solid salt and its melt or solution. A two-dimensional view is not taken uncritically as three-dimensional coordination.',
  'transferDe': 'Bei einem anders orientierten Modell oder einer gegebenen geänderten Nachbarschaft erklärt die lernende Person Koordination und Kräfte und sagt den Leitfähigkeitsunterschied nach einer Änderung des Aggregat- bzw. Lösungszustands voraus, ohne einen anderen Gittertyp auswendig benennen zu müssen.',
  'transferEn': 'With a differently oriented model or a supplied changed neighbour environment, the learner explains coordination and forces and predicts the conductivity difference after a change of physical or solution state, without having to recall the name of another lattice type.',
  'memory': 'no_memory_needed', 'memoryReason': 'Gittereigenschaften und Koordinationszahl werden aus dem Modell erklärt bzw. bestimmt. Eine zusätzliche Zahlen- oder Eigenschaftenliste wäre kein Ersatz für diese räumliche Beziehung.',
  'holds': ['Current provenance sourceGoalId 41de0477-78e2-48b5-82f7-e5864f2f66cc is absent from the current HE extraction.', 'Current HE9 metal/halogen reactions and hydrogen-halide/HCl partial mapping cells are not fully covered by lattice understanding.', 'BY modeling and property clauses are partial; molecule/ratio formula derivation is allocated to existing canonical siblings.', 'No current visualization exists; V remains HOLD/deferred_provider_limitation.'],
 },
 {
  'decision': 'split_review', 'atomicity': 'non_atomic',
  'reason': 'Der aktuelle Text kombiniert die Charakterisierung elementarer Metalle, ihre Verwendungen und die Kenntnis bzw. Eigenschaften ihrer Verbindungen. Elementares Metall und Verbindungen sind unabhängige Stoffroutinen; Kenntnis von Na-Metall beweist keine Eigenschafts-/Verwendungsbegründung für NaCl oder KCl. HE9.2 verlangt ausdrücklich Eigenschaften und Verwendung beider Stoffgruppen. Die Split-Richtung ist sinnvoll, der Compound-Companion muss aber die Charakterisierung der typischen Verbindungen ausdrücklich erhalten. Es gibt keinen passenden bestehenden vollständigen kanonischen Companion; benachbarte Ionen-/Salz-/Wasserreaktionsziele liefern nur Teilaspekte.',
  'essentialDe': 'Alkalimetalle besitzen gemeinsame elementare Stoffeigenschaften, während ihre Verbindungen eigenständige Stoffe mit anderen Eigenschaften und Verwendungen sind. Ein Verwendungsgrund muss zur tatsächlich eingesetzten Substanz passen; ein Lithium-Ionen-Akku ist kein Beleg für die Verwendung elementaren Lithiums.',
  'essentialEn': 'Alkali metals share characteristic elemental material properties, while their compounds are separate substances with different properties and uses. A reason for a use must apply to the substance actually used; a lithium-ion battery does not establish a use of elemental lithium.',
  'observableDe': 'Die lernende Person charakterisiert ausgewählte elementare Metalle und typische Verbindungen stoffgenau und begründet je eine geeignete Verwendung durch passende Eigenschaften. Sie weist einer Aussage über Kochsalz, Kaliumchlorid oder einen Akku nicht die Reaktivität des elementaren Metalls zu.',
  'observableEn': 'The learner characterizes selected elemental metals and typical compounds as distinct substances and justifies suitable uses through relevant properties. They do not assign the reactivity of the elemental metal to a claim about sodium chloride, potassium chloride or a battery.',
  'transferDe': 'Für eine neue technisch oder alltäglich beschriebene Verwendung entscheidet die lernende Person anhand gegebener Stoffinformationen, ob das Metall oder eine Verbindung gemeint ist, und begründet deren Eignung. Die Elementbezeichnung auf einem Produkt reicht nicht.',
  'transferEn': 'For a new technical or everyday use, the learner uses supplied material information to decide whether the metal or a compound is involved and justifies its suitability. An element name on a product is insufficient.',
  'memory': 'no_memory_needed', 'memoryReason': 'Die geforderte stoffgenaue Charakterisierung und Begründung ist eine Eigenschafts-Verwendungsbeziehung. Ein neues Katalogdeck typischer Anwendungen ist dafür nicht notwendig; vorhandenes Teilchenwissen darf weiter vorausgesetzt werden.',
  'holds': ['HE9 source stage is not reconciled with direct a163 Ionenbildung and inherited complete Atombau-/Bindungscluster in regular HE10; an earlier coordinated introduction is possible but not currently proved.', 'No current specific BY atlas witness covers this goal; canonical DE-BY applicability is insufficient.', 'The ID-null compound candidate must retain characterization/properties of typical compounds, not only one application.', 'No stable IDs or denominator change has been adopted.'],
 },
 {
  'decision': 'revise', 'atomicity': 'atomic',
  'reason': 'Das Gegenüberstellen zweier Reaktionssysteme auf die gemeinsame Bildung alkalischer Lösung hin ist eine zusammengehörige Vergleichskompetenz. Der Autorenkandidat macht Produkte und Erklärung statt bloßer Reaktionswiedergabe sichtbar und erhält beide HE9.2-Systeme. Die Modellgrenze sind geeignete einfache Oxide; bei vorgegebenen anderen Sauerstoffverbindungen darf kein identisches Produktschema pauschal behauptet werden. OH− erklärt Alkalität, nicht H2.',
  'de': 'Die lernende Person kann Reaktionen von Alkalimetallen und ihren Oxiden mit Wasser anhand der Produkte vergleichen und erklären, weshalb alkalische Lösungen entstehen.',
  'en': 'The learner can compare reactions of alkali metals and their oxides with water using the products and explain why alkaline solutions form.',
  'essentialDe': 'Ein elementares Alkalimetall und ein einfaches Alkalimetalloxid sind verschiedene Ausgangsstoffe. Beide können mit Wasser Hydroxide liefern; beim Metall entsteht zusätzlich Wasserstoff. Die OH−-Ionen der Lösung erklären die alkalische Reaktion, während Kationen und Anionen zusammen elektroneutral sind.',
  'essentialEn': 'An elemental alkali metal and a simple alkali-metal oxide are different starting substances. Both can form hydroxides with water; the metal additionally produces hydrogen. OH− ions explain the alkaline reaction while the cations and anions make the solution electrically neutral overall.',
  'observableDe': 'Die lernende Person vergleicht bereitgestellte Beobachtungen und Produkte beider Systeme, unterscheidet Gasbildung von Alkalität und verbindet das gemeinsame Hydroxidprodukt mit OH− in Wasser. Sie interpretiert die Reaktionsdarstellung und nennt Bedingungen, ohne die gefährlichen Reaktionen selbst unbetreut ausführen zu müssen.',
  'observableEn': 'The learner compares supplied observations and products of both systems, distinguishes gas formation from alkalinity and links the common hydroxide product to OH− in water. They interpret the reaction representation and its conditions without having to carry out hazardous reactions unsupervised.',
  'transferDe': 'Für ein anderes geeignetes Alkalimetall und dessen vorgegebenes einfaches Oxid prognostiziert die lernende Person Gemeinsamkeit und Unterschied der Produkte und prüft, ob ein neuer Befund mit der Alkalität zusammenpasst. Ein Schema für Na2O wird nicht auf Peroxide oder Superoxide übertragen.',
  'transferEn': 'For another suitable alkali metal and its supplied simple oxide, the learner predicts similarities and differences in the products and checks whether new observations agree with alkalinity. A Na2O scheme is not generalized to peroxides or superoxides.',
  'memory': 'no_memory_needed', 'memoryReason': 'Die Produkte und Alkalität werden aus Stoffidentität und Hydroxidbildung gedeutet. Das Ziel verlangt keinen neuen Vorrat auswendig gelernter Spezialgleichungen.',
  'holds': ['HE9 route and inherited HE10 Atombau-/Bindungscluster timing need a targeted prerequisite/placement decision.', 'No current specific BY atlas witness covers both water-reaction systems.'],
 },
 {
  'decision': 'revise', 'atomicity': 'atomic',
  'reason': 'Der Kandidat bindet Verwendung an Eigenschaften der tatsächlich eingesetzten Substanz und verhindert die Verwechslung von F2 und Fluorid oder Cl2 und einer desinfizierenden Chlorverbindung. Das ist eine integrierte Eigenschafts-Verwendungsbegründung; die Stoffidentität ist eine Bedingung derselben Begründung. HE9.2 stützt Eigenschaften, Verwendungen und den Alltagsbezug der Halogene und Verbindungen. Die passende Teilklausel des benachbarten aktuellen HE9.2-B02A02 muss für den Compound-Alltagsbezug zusätzlich ausdrücklich gebunden werden; deren Reaktionsklausel gehört nicht automatisch zu diesem Ziel.',
  'de': 'Die lernende Person kann typische Eigenschaften ausgewählter Halogene beschreiben und Verwendungen der elementaren Stoffe sowie ihrer Verbindungen mit den jeweils passenden Stoffeigenschaften begründen.',
  'en': 'The learner can describe typical properties of selected halogens and justify uses of the elemental substances and their compounds using the relevant properties of each substance.',
  'essentialDe': 'Elementare Halogene und Halogenverbindungen sind chemisch verschiedene Stoffe. Molekülform, Reaktivität und andere relevante Eigenschaften müssen der jeweils tatsächlich eingesetzten Substanz zugeordnet werden; die Verwendung einer Verbindung übernimmt nicht pauschal Eigenschaften des elementaren Halogens.',
  'essentialEn': 'Elemental halogens and halogen compounds are chemically different substances. Molecular form, reactivity and other relevant properties must be assigned to the substance actually used; using a compound does not transfer all properties of the elemental halogen to it.',
  'observableDe': 'Die lernende Person charakterisiert ausgewählte elementare Halogene und erklärt einen Einsatz des Elements sowie einen Einsatz einer Verbindung mit der jeweils passenden Eigenschaft. Bei Alltagsangaben unterscheidet sie Fluorid von Fluor und eine Chlorverbindung vom elementaren Chlor.',
  'observableEn': 'The learner characterizes selected elemental halogens and explains a use of an element and a use of a compound through the relevant property of each. In everyday claims they distinguish fluoride from fluorine and a chlorine compound from elemental chlorine.',
  'transferDe': 'An einer neuen Produkt- oder Prozessbeschreibung mit gegebenen Stoffangaben erkennt die lernende Person eine falsche Element-/Verbindungszuordnung und korrigiert die Verwendungsbegründung, statt dieselbe Werbeaussage auf ein anderes Halogen zu übertragen.',
  'transferEn': 'For a new product or process description with supplied material information, the learner identifies an incorrect assignment to an element or compound and corrects the explanation of its use rather than transferring the same advertising claim to another halogen.',
  'memory': 'no_memory_needed', 'memoryReason': 'Die fachliche Beziehung zwischen Stoffidentität, Eigenschaft und Verwendung steht im Vordergrund. Ein zusätzlicher auswendig zu lernender Produkt-/Anwendungskatalog ist nicht erforderlich.',
  'holds': ['HE9 route still inherits the complete regular HE10 atom/bonding cluster and directly requires a163 Ionenbildung; no current earlier coordinated route is proved.', 'Current HE direct mapping for this goal covers B02A01; explicit clause binding of the compound/everyday portion of B02A02 remains to be adopted.', 'No current specific BY atlas witness covers this goal.'],
 },
 {
  'decision': 'revise', 'atomicity': 'atomic',
  'reason': 'Die Bildung eines bestimmten Produkts in einem vereinfachten technischen Reaktionsweg ist eine zusammenhängende Anwendungskompetenz. Der Kandidat ersetzt die unscharfe Nennung von Sulfatbildung durch die Beziehung zwischen SO2-Aufnahme, Oxidation und Gipsbildung. Das Schema darf Kalkhydrat beispielhaft zeigen, aber es behauptet keine Kenntnis aller industriellen Varianten, keine vollständige Anlagenplanung und keine durch Beobachtung direkt sichtbare Sulfatbildung. HE10.3 liefert nur die Gips-Teilklausel; Kalkkreislauf und Dünger gehören anderen Zielen.',
  'de': 'Die lernende Person kann an einem vereinfachten Schema der kalkhaltigen Rauchgaswäsche erklären, wie Schwefeldioxid unter Beteiligung von Oxidation als Sulfat im Gips gebunden wird.',
  'en': 'The learner can use a simplified diagram of lime-based flue-gas scrubbing to explain how sulfur dioxide is captured as sulfate in gypsum through oxidation.',
  'essentialDe': 'Das Schwefelatom aus SO2 bleibt bei der Aufnahme und weiteren Oxidation erhalten und wird im Sulfat des Calciumsulfat-Dihydrats gebunden. Kalkhaltiges Absorptionsmittel, Sauerstoff und Wasser haben unterschiedliche Funktionen; die Entfernung aus dem Rauchgas ist keine Vernichtung des Schwefels.',
  'essentialEn': 'The sulfur atom in SO2 is conserved during absorption and subsequent oxidation and becomes bound in sulfate in calcium sulfate dihydrate. A lime-containing absorbent, oxygen and water have different roles; removing sulfur from flue gas does not destroy it.',
  'observableDe': 'Die lernende Person erläutert am vereinfachten Ablauf den Stoffpfad vom gasförmigen SO2 zum festen Gips und ordnet die Funktion von Absorptionsmittel und Oxidation zu. Sie liest ein gegebenes Reaktionsschema fachlich und unterscheidet Ablaufdarstellung von realen Zwischenstufen.',
  'observableEn': 'The learner explains the material pathway from gaseous SO2 to solid gypsum in a simplified process and identifies the roles of the absorbent and oxidation. They interpret a supplied reaction scheme correctly and distinguish the process representation from actual intermediate steps.',
  'transferDe': 'In einem anders angeordneten Flussschema oder bei fehlender Oxidationszufuhr erkennt die lernende Person, welcher Schritt für den Sulfat-/Gipsweg fehlt. Sie kann den Verbleib des Schwefels begründen, ohne eine komplette industrielle Anlage zu entwerfen.',
  'transferEn': 'In a differently arranged flow diagram or a case without an oxidation supply, the learner identifies the missing step in the sulfate/gypsum pathway. They explain where the sulfur remains without designing a complete industrial plant.',
  'memory': 'no_memory_needed', 'memoryReason': 'Ein bereitgestelltes Schema wird chemisch interpretiert. Das Auswendiglernen einer speziellen industriellen Gesamtgleichung wäre kein zusätzlicher notwendiger Abruffakt für diese Kompetenz.',
  'holds': ['No current specific BY atlas witness covers gypsum from flue-gas scrubbing.', 'The existing 11bea prerequisite structural question is exposed but outside this review; it is not re-adjudicated.'],
 },
 {
  'decision': 'revise', 'atomicity': 'atomic',
  'reason': 'Die Einordnung mineralischer Salze als Nährstoffquellen und die Begründung eines daran gebundenen Nutzen-Risiko-Bezugs sind eine integrierte Anwendung. Der Kandidat grenzt mineralische Dünger von pauschalen Aussagen über alle Dünger ab und nennt Bedingungen, die eine nachvollziehbare einfache Begründung tragen. Stofftransport ist anhand bereitgestellter Angaben zu verstehen; eine vollständige Bodenchemie, Phosphatspeziation oder allgemeine Produkt-/Gesundheitsbewertung wird nicht verlangt. HE10.3 liefert nur die Dünger-Teilklausel, die Umweltperspektive steht auch im Methoden-/Querverweiskontext.',
  'de': 'Die lernende Person kann ausgewählte mineralische Düngemittel als Quellen von Nährstoffionen einordnen und anhand vorgegebener Angaben zu Pflanzenbedarf, Düngermenge und Stofftransport einen einfachen Nutzen-Risiko-Bezug begründen.',
  'en': 'The learner can classify selected mineral fertilizers as sources of nutrient ions and use supplied information on plant demand, fertilizer amount and substance transport to justify a simple benefit-risk relationship.',
  'essentialDe': 'Mineralische Düngesalze können pflanzenverfügbare Nährstoffionen bereitstellen. Nutzen und Risiko hängen von Bedarf, Menge und Transport ab: Aufnahme, Bindung, Umwandlung, Auswaschung und Abschwemmung sind verschiedene Wege und betreffen die dargestellten Ionen unterschiedlich.',
  'essentialEn': 'Mineral fertilizer salts can supply plant-available nutrient ions. Benefits and risks depend on demand, amount and transport: uptake, binding, transformation, leaching and runoff are different pathways and affect the represented ions differently.',
  'observableDe': 'Die lernende Person ordnet eine gegebene mineralische Düngersalzquelle den angegebenen Nährstoffionen zu und begründet aus Bedarf, Menge und gegebenem Transportweg einen konkreten Nutzen und ein mögliches Risiko. Sie unterscheidet beispielsweise Nitrat-Auswaschung von boden-/partikelgebundenem Phosphattransport und wertet das Bild nicht als tatsächliche Messung.',
  'observableEn': 'The learner links a supplied mineral fertilizer salt to the stated nutrient ions and uses demand, amount and a supplied transport pathway to justify a concrete benefit and a possible risk. For example, they distinguish nitrate leaching from soil- or particle-bound phosphate transport and do not treat the image as an actual measurement.',
  'transferDe': 'Bei geänderter Pflanzenaufnahme oder einem neuen gegebenen Wassertransport entscheidet die lernende Person begründet, ob derselbe Düngereintrag mehr verfügbaren Nutzen oder größeren Stoffaustrag erwarten lässt. Eine andere Düngerfarbe oder ein anderes Zahlenetikett allein ist kein Transfer.',
  'transferEn': 'With changed plant uptake or a newly supplied water-transport pathway, the learner explains whether the same fertilizer input is likely to offer more available benefit or cause greater material loss. A different fertilizer colour or number label alone is not transfer.',
  'memory': 'no_memory_needed', 'memoryReason': 'Die Ionen- und Transportangaben sind verfügbar und werden für eine begründete Fallentscheidung genutzt. Eine neue Dünger-/Nährstoffliste ist dafür nicht als notwendiges Auswendigwissen nachgewiesen.',
  'holds': ['No current specific BY atlas witness covers this fertilizer competence.', 'At 360 CSS px central transport labels are small; necessary transport information must be supplied as readable task data rather than inferred from pixels. This does not require replacement of the correct original image.'],
 },
]

records = []
assessments = []
for idx, (g, d) in enumerate(zip(INPUT['goals'], DATA)):
    assert GOALS[g['goalId']]['description'] == g['currentDescriptionDe']
    assert GOALS[g['goalId']]['descriptionEn'] == g['currentDescriptionEn']
    record = {'$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json', 'schemaVersion': 1,
        'recordId': f'chemie-b010-source-review-a-{idx+1}', 'runId': 'chemie-b010-seven-source-review-a-v1',
        'campaignId': 'chemie-b010-seven-source-review-a-native-binding-v1', 'roundId': 'source-description-a',
        'bundleFingerprint': BUNDLE['bundleFingerprint'], 'bookDigest': BUNDLE['bookModelDigest']}
    record.update({k:g[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']})
    record.update({'decision':d['decision'], 'rationale':d['reason'],
        'understandingEvidence': {'essentialUnderstandingDe':d['essentialDe'], 'essentialUnderstandingEn':d['essentialEn'], 'observablePerformanceDe':d['observableDe'], 'observablePerformanceEn':d['observableEn'], 'transferExpectationDe':d['transferDe'], 'transferExpectationEn':d['transferEn']},
        'evidenceProfileContract':'positive-understanding-evidence-v2', 'evidenceProfileRecommendation':'create', 'recordStatus':'candidate','reviewAuthority':'ai_candidate'})
    if d['decision']=='revise': record.update({'proposedDescriptionDe':d['de'], 'proposedDescriptionEn':d['en']})
    records.append(record)
    assessments.append({'goalId':g['goalId'],'goalFingerprint':g['goalFingerprint'],'pageFingerprint':g['pageFingerprint'],
      'currentDescriptionDecision':d['decision'],'semanticAtomicity':d['atomicity'],'memoryDecision':d['memory'],'memoryReason':d['memoryReason'],
      'sourceStatus':'HOLD_targeted_adoption','sourceHolds':d['holds'], 'scientificRationale':d['reason'], 'strictClosureAdded':0})
(OWN/'source-description-a.records.jsonl').write_text(''.join(json.dumps(r,ensure_ascii=False)+'\n' for r in records))
write('source-description-a.assessments.json', {'schemaVersion':1,'recordStatus':'candidate','reviewAuthority':'ai_candidate','goalIds':IDS,'assessments':assessments,'PRead':False,'peerOutputsRead':False,'strictClosureAdded':0})

companion_judgments = [
 {'forGoalId':IDS[0], 'id':None, 'authorNullCompanionDecision':'supported_with_source_mapping_holds',
  'reason':'Eine Streuinferenz ist ein eigener prüfbarer Inhalt. Die Formulierung setzt positive Alpha-Teilchen und geeignete gegebene Streubefunde voraus; sie impliziert keinen experimentellen Neutronennachweis. HE10.1-B01A01 und BY9-other.4.2 sind die passenden begrenzten Klauseln.',
  'retainedParticleOptionDecision':'revise_to_preserve_particle_properties',
  'retainedDescriptionDe':'Die lernende Person kann den Aufbau von Atomen mit dem Kern-Hülle-Modell darstellen und Protonen, Neutronen sowie Elektronen nach Ort, Ladung und relativer Masse fachlich einordnen.',
  'retainedDescriptionEn':'The learner can represent atomic structure using the nuclear model and correctly classify protons, neutrons and electrons by location, charge and relative mass.',
  'retainedReason':'HE nennt Eigenschaften der Atombausteine; Ort und Ladung allein machen ihre unterschiedliche relative Masse unsichtbar. Dies fordert keine Atommasse-/Isotopenroutine und bestätigt deren separaten exact-Mappings nicht.',
  'existingReuse':'Current f5efab9d energy-level/electron distribution and e7c363d4 periodic-table goals are adjacent partial routes; neither is an existing Rutherford inference atom. No new stable ID assigned.',
  'memory':'Existing chem_basics_005 remains attached to the retained particle identity; no new Rutherford card. Exact rebinding after adoption remains open.'},
 {'forGoalId':IDS[2], 'id':None, 'authorNullCompanionDecision':'revise_before_adoption',
  'reason':'Der Quelleninhalt umfasst Eigenschaften und Verwendung der Verbindungen. Ein bloßer Verwendungsnachweis für eine einzelne Verbindung kann andere charakteristische Stoffeigenschaften verdecken. Die neue Fassung verknüpft die Charakterisierung derselben Stoffe mit ihrer Verwendung und hält damit eine Kompetenzbeziehung zusammen.',
  'descriptionDe':'Die lernende Person kann ausgewählte typische Alkalimetallverbindungen anhand ihrer Stoffeigenschaften charakterisieren, ihre Verwendungen damit begründen und sie vom elementaren Alkalimetall unterscheiden.',
  'descriptionEn':'The learner can characterize selected typical alkali-metal compounds by their material properties, justify their uses through those properties, and distinguish them from the elemental alkali metal.',
  'retainedElementOptionDecision':'supported_with_stage_holds',
  'existingReuse':'Current 950 ionic lattices, a163 ion formation and 16a water reactions supply related prerequisites or partial content, not an existing complete properties/uses atom for alkali-metal compounds. No stable ID assigned.',
  'prerequisiteHold':'Do not adopt 950 as a mandatory HE9 dependency until the specific earlier teaching route is proved; current regular HE10 timing would reproduce the hold.'},
]
write('candidate-templates-a.review.json', {'schemaVersion':1,'recordStatus':'candidate','reviewAuthority':'ai_candidate','fiveRevisionVerdicts':[
 {'goalId':IDS[i], 'authorCandidateVerdict':'revise_electrostatic_force_wording_and_explicit_modeling' if i==1 else 'supported_with_targeted_source_holds','proposedDescriptionDe':DATA[i]['de'],'proposedDescriptionEn':DATA[i]['en']} for i in [1,3,4,5,6]],'twoNullCompanionVerdicts':companion_judgments,'idsAdopted':0,'operativeMutations':False})

knowledge = {'observedAt':NOW,'exactRuntimeModel':None,'exactModelVersion':None,'generationParameters':None,'sessionIdentifier':None,
 'declaredAgent':'Codex, GPT-6 family per system; exact API model unobserved',
 'workUnit':'/root/chem_b010_seven_independent_source_review_a',
 'independence':'Own source/scientific/description judgments; no peer reviewer or previous D/P record read. Author README and candidate templates are intentionally reviewed inputs.',
 'exposure':'The permitted author README contains historical QA conclusions and author verdicts. A broad input-receipt print also exposed historical image-QA summary metadata. They are not evidence for this reviewer’s decisions. No historical native A/M review ledgers, prior description records, adjudications or P content were opened.',
 'nativeAdapter':'The native manifest/campaign use synthesizer and blindToOtherRuns=false because historical summaries and author verdicts were visible. This is truthful informed independent source/scientific critique, not a blind final Book-D first pass or D2 acceptance.',
 'timeMeaning':'Native run timestamps bind record materialization/validation; the exact beginning of the earlier reading phase is not claimed.'}
write('generation-and-knowledge-boundary.json',knowledge)

# Capture exact local source/input bytes actually used, including actual source
# maps and source-view witnesses, while excluding historical reviewer outputs.
files=[CONFIG,CANON,'AGENTS.md',
 'curricula/DE/Gymnasium/input/HE/lower-secondary/g9-chemie.pdf',
 'curricula/DE/Gymnasium/input/HE/lower-secondary/source-extraction/DE_HE_CHEMIE_SEKI_G9.source-extraction.json',
 'curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/DE_BY_CHEMIE_GYMNASIUM_LEHRPLANPLUS.source-extraction.json',
 'curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary/hessen_chemistry_lower_secondary_source_extraction_to_canonical_chemistry.review.json',
 'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_chemistry_source_extraction_to_canonical_chemistry.m7-energy-four-current-20261005-v1.review.json',
 'app/scripts/config/goal-books/source-views/de-gym-chemistry-national-atlas/de-gym-chemie-bundesweit-source-de-he-seki.view.json',
 'app/scripts/config/goal-books/source-views/de-gym-chemistry-national-atlas/de-gym-chemie-bundesweit-source-de-by-seki.view.json',
 'curricula/DE/Gymnasium/memory-decks/de_gymnasium_chemistry_flashcards_basics_seki.de.json']
for name in ['README.md','seven-description-deltas-and-split-templates.json','source-clause-bindings-and-adoption-holds.json','current-source-witnesses.json','current-description-review-input.json','current-seven.book-model.json','current-seven.book.html','current-seven.book.pdf','bundle/manifest.json','frozen-source-d.receipt.json']:
 files.append(str((AUTHOR/name).relative_to(ROOT)))
for width in [360,680]:
 for gid in IDS:
  p=AUTHOR/f'native-{gid}-{width}.png'
  if p.exists(): files.append(str(p.relative_to(ROOT)))
for n in [19,22,25,26]: files.append(str((AUTHOR/f'primary-he-pdf-page-{n}.png').relative_to(ROOT)))
for n in range(1,10): files.append(str((AUTHOR/f'pdf-page-{n}.png').relative_to(ROOT)))
for rel in ['curricula/DE/Gymnasium/composition-views/chemie/de-de-gym-chemistry-gk.view.json','curricula/DE/Gymnasium/composition-views/chemie/de-de-gym-chemistry-lk.view.json','curricula/DE/Gymnasium/composition-views/chemie/de-de-gym-seki-chemistry.view.json']:
 files.append(rel)
for gid in IDS:
 g=GOALS[gid]
 for link in g.get('resourceLinks',[]):
  if link.get('type')=='goal-visualization':
   path=link['url'].lstrip('/')
   files += [f'app/public/{path}',f'backend/src/main/resources/static/{path}',f'curricula/DE/Gymnasium/visualizations/chemie/{gid}/{gid}.jpg']
write('input-bindings-a.json',{'observedAt':NOW,'goalIds':IDS,'files':[{'path':f,'sha256':digest(ROOT/f)} for f in sorted(set(files))], 'PRead':False})

write('source-reading-a.receipt.json',{'observedAt':NOW,'authority':'ai_candidate','primarySources':[
 {'url':'https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-06/g9-chemie.pdf','localSha256':digest(ROOT/'curricula/DE/Gymnasium/input/HE/lower-secondary/g9-chemie.pdf'),'physicalPagesActuallyInspected':[19,22,25,26],'printedPages':[18,21,24,25],'method':'Official web PDF text and actual bound local page PNGs viewed separately; source layer is authoritative, goal book is not.'},
 {'url':'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium%20/8/chemie','actuallyReadSections':['C8.4 competence and content clauses'],'status':'official_current_HTML_read'},
 {'url':'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/9/chemie/ch-ntg','actuallyReadSections':['C9-NTG.2 data from periodic table; .3 ion formation; .5 dissolution context'],'status':'official_current_HTML_read'},
 {'url':'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/9/chemie/ch','actuallyReadSections':['C9-other.4 nuclear-model/scattering and ionic-lattice clauses'],'status':'official_current_HTML_read_after_generic_URL_internal_error'}],
 'literalOperatorBoundary':'BY modellieren, erklären, auswerten, zuordnen/skizzieren and data extraction remain distinct activities. HE lists binding content rows with its methodological explanation; do not invent per-row verbatim operators.',
 'stageBoundary':'HE9.2 versus regular HE10.1 is a concrete timing hold; earlier treatment requires source-mentioned coordination with Physics. BY8 NTG and BY9 other tracks are distinct actual source occurrences. All16 canonical applicability is never substituted for a missing land witness.',
 'bookInspection':{'physicalPages':[1,2,3,4,5,6,7,8,9],'goalPages':[3,4,5,6,7,8,9],'scope':'Author current seven-goal excerpt only; not a final native batch publication or two accepted Book-D reviews.'},
 'visualInspection':{'nativeCSSWidths':[360,680],'originalImageIds':[g for g in IDS if g!=IDS[1]],'verdict':'KEEP existing six original images; no demonstrated image defect requiring generation. Native 950 page has no image and V remains HOLD. Small 360 fertilizer transport labels require readable task information. Formal phosphate icons are a qualitative diagram, not soil speciation evidence.'},'strictClosureAdded':0})

# Own current A and M decisions. Native scripts generate the binding hash only;
# they do not supply or alter scientific verdicts.
reviewer='codex-independent-source-description-a-informed-ai-candidate'
base={'schemaVersion':1,'ruleVersion':'v1','landscapeId':'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0','reviewedAt':NOW,'reviewer':reviewer}
areview='chemie-b010-seven-independent-source-a-current-v1'
arows=[{**base,'reviewId':areview,'goalId':gid,'fingerprint':'sha256:'+'0'*64,'status':d['atomicity'],'semanticAtomic':d['atomicity']=='atomic','reason':d['reason']} for gid,d in zip(IDS,DATA)]
(OWN/'a.review.jsonl').write_text(''.join(json.dumps(r,ensure_ascii=False)+'\n' for r in arows))
write('a.config.json',{'schemaVersion':1,'reviewId':areview,'ruleVersion':'v1','landscapeId':base['landscapeId'],'landscapePath':CANON,'reviewPath':f'{REL}/a.review.jsonl','scope':{'label':'Exact seven current open B010 goals; own scientific atomicity candidates','leafGoalIds':IDS}})
mreview='chemie-b010-six-independent-no-new-memory-current-v1'
mrows=[{**base,'reviewId':mreview,'goalId':gid,'fingerprint':'sha256:'+'0'*64,'status':d['memory'],'memoryUseful':False,'memoryGoalIds':[],'deckIds':[],'reason':d['memoryReason']} for gid,d in zip(IDS[1:],DATA[1:])]
(OWN/'m-six.review.jsonl').write_text(''.join(json.dumps(r,ensure_ascii=False)+'\n' for r in mrows))
(OWN/'m-six.cards.review.jsonl').write_text('')
write('m-six.config.json',{'schemaVersion':1,'reviewId':mreview,'ruleVersion':'v1','landscapeId':base['landscapeId'],'landscapePath':CANON,'reviewPath':f'{REL}/m-six.review.jsonl','cardReviewPath':f'{REL}/m-six.cards.review.jsonl','scope':{'label':'Exact six ordinary B010 goals needing no new memorization; particle card separately traced','leafGoalIds':IDS[1:]}})

run={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,
 'runId':'chemie-b010-seven-source-review-a-v1','campaignId':'chemie-b010-seven-source-review-a-native-binding-v1','roundId':'source-description-a',
 'bundleFingerprint':BUNDLE['bundleFingerprint'],'bookDigest':BUNDLE['bookModelDigest'],'provider':'OpenAI via Codex','model':'Codex runtime; exact API model unobserved',
 'role':'synthesizer','promptFamilyId':'source-description-a-informed-independent-critique-v1','promptFingerprint':BUNDLE['promptFingerprint'],'criteriaFingerprint':BUNDLE['criteriaFingerprint'],
 'generationParametersFingerprint':digest(OWN/'generation-and-knowledge-boundary.json'),'independenceGroupId':'chemie-b010-seven-source-a-20261005','blindToOtherRuns':False,
 'goalIds':IDS,'inputArtifacts':[{'role':a['role'],'digest':a['digest']} for a in BUNDLE['artifacts'] if a['role'] in ['book_model','book_pdf','book_html','review_prompt','review_criteria']],
 'startedAt':NOW,'completedAt':NOW,'status':'completed','outputDigest':digest(OWN/'source-description-a.records.jsonl'),'toolchainVersion':'native-source-description-review-a-v1'}
write('source-description-a.run.json',run)
print(json.dumps({'materializedGoals':len(records),'atomic':5,'nonAtomic':2,'sourceHolds':7,'PRead':False,'writes':REL},ensure_ascii=False))
