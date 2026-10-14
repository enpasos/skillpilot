#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Individual inert requires recipes; capability names are not runtime goal IDs."""
import collections
import hashlib
import json
from pathlib import Path

OUT = Path(__file__).parent
ROOT = Path('/home/enpasos/projects/skillpilot')
AUDIT_PATH = OUT / 'role-ownership.author.json'
audit = json.loads(AUDIT_PATH.read_text())
byid = {g['goalId']: g for g in audit['goals']}
def sha(p):
    return 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()
def dump(name, obj):
    (OUT / name).write_text(json.dumps(obj, ensure_ascii=False, indent=2)+'\n')

OUTCOME_IDS = {}
for g in audit['goals']:
    ed = g['roleAndOwnershipAuthorProposal']
    if ed['semanticRole'] in ('assessableOutcomeCandidate','truncatedOutcomePreamble'):
        OUTCOME_IDS[ed['moduleCode']] = g['goalId']

# These capabilities are author vocabulary for necessary skills. No invented
# UUID is presented as a live atom and no complete module is selected as the
# prerequisite merely because the corresponding subskill is in its syllabus.
CAPABILITIES = {}
def cap(cid, label, domain, providers, note=None):
    records=[]
    for provider in providers:
        code, section, basis = provider
        records.append({'moduleCode': code, 'sourceSection': section, 'evidenceKind': basis,
            'existingOutcomeGoalId': OUTCOME_IDS.get(code),
            'sourceBinding': audit['sourceEvidence'].get(code),
            'atomicMappingStatus':'missing-reviewed-atomic-goal',
            'notEquivalentToCompleteModuleMastery': True})
    CAPABILITIES[cid]={'capabilityId':cid,'description':label,'subject':domain,'providerCandidates':records,
        'existingReviewedAtomicGoalIds': [], 'authoringStatus':'inert-concept-needs-atomic-goal-and-independent-review',
        'note':note}

SCHOOL=[('CIT513016','preconditions','broad-school-math-precondition-not-individual-skill-source'),
        ('CIT513017','preconditions','broad-school-math-precondition-not-individual-skill-source')]
cap('m.algebra','Mit Größen, Einheiten, Brüchen und Gleichungen rechnen und eine Formel nach der gesuchten Größe umstellen.','mathematics',SCHOOL,
    'No reviewed school-to-university scope bridge is supplied; do not silently select unrelated BSc Mathematics or all school math.')
cap('m.functions','Elementare Funktionen, Graphen, Exponential- und Logarithmusfunktionen sowie ihre inversen Beziehungen nutzen.','mathematics',SCHOOL)
cap('m.geometry','Winkel, Strahlensätze, einfache Trigonometrie und ähnliche Dreiecke zur Berechnung von Strecken verwenden.','mathematics',SCHOOL)
cap('m.vectors','Vektoren, Skalarprodukt und Komponenten zur geometrischen Beschreibung und Berechnung verwenden.','mathematics',
    [('CIT513016','content','explicit-topic-in-local-extract')])
cap('m.linear','Lineare Gleichungssysteme und lineare Abbildungen mittels Matrizen darstellen und lösen.','mathematics',
    [('CIT513016','content','explicit-topic-in-local-extract')])
cap('m.eigen','Eigenwerte/Eigenvektoren bestimmen und geeignete Matrizen/Endomorphismen diagonalisieren.','mathematics',
    [('CIT513016','content','explicit-topic-in-local-extract')])
cap('m.innerproduct','In einem Skalarproduktraum Orthogonalität, Norm, Projektion und Orthonormalbasen berechnen.','mathematics',
    [('CIT513016','content','explicit-topic-in-local-extract')])
cap('m.complex','Mit komplexen Zahlen und komplexen Exponentialfunktionen rechnen.','mathematics',
    [('CIT513017','content','explicit-topic-in-local-extract'),('PH0001','content','explicit-integrated-math-supplement')])
cap('m.derivative','Funktionen einer Veränderlichen ableiten und die Ableitung als lokale Änderung auswerten.','mathematics',
    [('CIT513017','content','explicit-topic-in-local-extract'),('PH0001','content','explicit-integrated-math-supplement')])
cap('m.integral','Bestimmte Integrale einer Veränderlichen berechnen und als kontinuierliche Summe anwenden.','mathematics',
    [('CIT513017','content','explicit-topic-in-local-extract'),('PH0001','outcomes','explicit-integrated-math-outcome')])
cap('m.ode','Einfache gewöhnliche Differentialgleichungen mit Anfangsbedingungen lösen.','mathematics',
    [('CIT513017','content','explicit-topic-in-local-extract'),('PH0001','outcomes','explicit-integrated-math-outcome')])
cap('m.series','Folgen- und Reihen-Konvergenz prüfen und die relevanten Grenzwertregeln verwenden.','mathematics',
    [('CIT513017','content','explicit-topic-in-local-extract')])
cap('m.taylor','Eine Funktion lokal durch Taylorentwicklung approximieren und die Gültigkeit der Näherung beurteilen.','mathematics',
    [('CIT513017','content','explicit-topic-in-local-extract'),('CIT513018','content','explicit-multivariable-topic')])
cap('m.fourierseries','Periodische Funktionen als Fourierreihe darstellen und deren Beiträge auswerten.','mathematics',
    [('CIT513017','content','explicit-topic-in-local-extract')])
cap('m.partial','Partielle Ableitungen und die mehrdimensionale Kettenregel berechnen.','mathematics',
    [('CIT513018','content','explicit-topic-in-local-extract'),('PH0001','outcomes','explicit-integrated-math-outcome')])
cap('m.extrema','Mehrdimensionale Extremwerte und notwendige Bedingungen mit gegebenen Nebenbedingungen bestimmen.','mathematics',
    [('CIT513018','content','explicit-topic-in-local-extract')])
cap('m.lineintegral','Kurvenintegrale skalarer Funktionen und Vektorfelder berechnen.','mathematics',
    [('CIT513018','content','explicit-topic-in-local-extract')])
cap('m.vectorcalculus','Gradient, Divergenz und Rotation im geeigneten Koordinatensystem berechnen und einsetzen.','mathematics',
    [('CIT513018','content','broad-vector-analysis-content-needs-individual-source-mapping')])
cap('m.odesystems','Systeme gewöhnlicher Differentialgleichungen formulieren und geeignete Lösungsverfahren mit Anfangsbedingungen anwenden.','mathematics',
    [('CIT513018','content','broad-ode-theory-content-needs-individual-source-mapping')])
cap('m.multipleintegral','Mehrdimensionale Integrale mit dem geeigneten Volumen-/Flächenelement und Koordinatenwechsel berechnen.','mathematics',
    [('CIT513019','content','explicit-topic-in-local-extract'),('PH0001','outcomes','explicit-applied-integral-outcome-but-limited-depth')])
cap('m.integraltheorems','Gauß-/Stokes-artige Integralsätze unter ihren Voraussetzungen zwischen lokalen und integralen Beschreibungen verwenden.','mathematics',
    [('CIT513019','content','broad-integral-theorems-content-needs-individual-source-mapping')])
cap('m.fourier','Fouriertransformationen mit der angegebenen Normierung berechnen und Umkehrung/Interpretation anwenden.','mathematics',
    [('CIT513019','content','explicit-topic-in-local-extract'),('PH0003','content','physics-module-explicit-fourier-topic-not-current-goal')])
cap('m.hilbert','Skalarprodukte, Normierung und lineare Operatoren in den jeweils benötigten Hilbertraumbeispielen verwenden.','mathematics',
    [('CIT513019','content','explicit-elements-of-hilbert-space-theory')])
cap('m.pde','Einfache partielle Differentialgleichungen mit festgelegten Anfangs-/Randbedingungen mittels passendem Verfahren lösen.','mathematics',
    [('CIT513019','content','explicit-simple-pde-topic')])
cap('m.separation','Eine geeignete lineare Randwert-PDE durch Variablentrennung auflösen und die Randbedingungen erfüllen.','mathematics',
    [('CIT513019','content','didactic-decomposition-of-simple-pde-not-verbatim-source')])
cap('m.probability','Wahrscheinlichkeitsgewichte normalisieren und diskrete/kontinuierliche Erwartungswerte berechnen.','mathematics',
    [('PH0008','content','statistical-ensembles-use-this-method-but-no-separate-math-outcome')],
    'A mathematics-owned atom/provider for this prerequisite is missing in CIT513016–19; ensembles teach a physics application and must not be self-required.')
cap('m.tensor','Tensor-Komponenten unter einem spezifizierten linearen Basis-/Koordinatenwechsel transformieren.','mathematics',
    [('CIT513016','content','linear-algebra-is-foundation-tensor-outcome-not-explicit'),('PH0006','outcomes','explicit-tensor-target')],
    'Tensor competence is a PH0006 target, so only underlying matrix/basis skills may be prior gates unless a distinct earlier tensor atom is actually authored.')
cap('m.spherical','Für ein spezifiziertes Zentral-/Randwertproblem Kugelflächenfunktionen und ihre Orthogonalität benutzen.','mathematics',
    [('PH0006','outcomes','explicit-method-target')],
    'No independent earlier mathematics provider found; teach this method inside PH0006 rather than inventing a prior module completion requirement.')
cap('m.uncertainty','Messunsicherheiten mit einer angegebenen Fehlerfortpflanzungsregel und geeigneten statistischen Kennwerten berechnen.','mathematics',
    [('PH0009','outcomes','explicit-laboratory-target'),('PH0010','outcomes','explicit-laboratory-target'),('PH0011','outcomes','explicit-laboratory-target')],
    'Lab curriculum teaches the skill. An earlier foundation can be useful for a subsequent data-analysis atom, but is not an automatic prior gate of the introductory lab.')

PHYS = [
 ('p.measurement','Messgröße, Einheit, Messprozess und Unsicherheit im konkreten Experiment unterscheiden.','PH0001'),
 ('p.kinematics','Orts-, Geschwindigkeits- und Beschleunigungsgrößen eines Bewegungsmodells deuten.','PH0001'),
 ('p.newton','Kräfte und Newtonsche Bewegungsgesetze für einfache Massepunktprobleme anwenden.','PH0001'),
 ('p.oscillation','Harmonische Schwingungen und die Bedeutung von Amplitude, Phase und Frequenz beschreiben.','PH0001'),
 ('p.workenergy','Arbeit, kinetische/potentielle Energie und Erhaltungsbeziehungen in einem Mechanikproblem deuten.','PH0001'),
 ('p.em','Ladung, Strom, elektrische/magnetische Felder und die elementaren Kraft-/Feldbeziehungen verstehen.','PH0002'),
 ('p.optics','Interferenz, Beugung und die optischen Messprinzipien im gewählten Verfahren beschreiben.','PH0003'),
 ('p.atomic','Atomzustände und Übergänge im für das Experiment erforderlichen Modell verstehen.','PH0004'),
 ('p.thermo','Temperatur, Wärme, Arbeit, Entropie und thermodynamische Zustandsgrößen unterscheiden.','PH0004'),
 ('p.mechanicsmodel','Lagrange-/Hamilton-Mechanik und geeignete physikalische Anfangs-/Randbedingungen im gegebenen Modell formulieren.','PH0005'),
 ('p.maxwell','Maxwell-Gleichungen und elektromagnetische Energie-/Feldmodelle im benötigten Kontext formulieren.','PH0006'),
 ('p.quantumstates','Zustände, Eigenenergien, Messoperatoren und Zeitentwicklung einfacher quantenmechanischer Systeme beschreiben.','PH0007'),
 ('p.ensembles','Physikalische Zustandssummen und Besetzungsmodelle für das gegebene Gleichgewichtsproblem formulieren.','PH0008'),
 ('p.labbasics','Für einen ausgewählten Versuch Aufbau, sicheres Messen und Messprotokollieren durchführen.','PH0009'),
 ('p.particles','Die grundlegenden Standardmodell-Wechselwirkungen für ein einfaches Teilchenphysikproblem einordnen.','PH0014'),
 ('p.solid','Kristallstruktur, Bindung und elektronische Zustände im relevanten Festkörpermodell unterscheiden.','PH0017'),
 ('p.exergy','Energie- und Exergieströme relativ zur angegebenen Umgebung korrekt bilanzieren.','PH0021'),
]
for cid,label,code in PHYS:
    cap(cid,label,'physics',[(code,'outcomes-and-content','didactic-decomposition-of-local-module-extract')])

RECORDS=[]
def decision(code, current, parts, rejected, physics_direction=None, gap=None, method_alternatives=None):
    gid=OUTCOME_IDS[code]
    g=byid[gid]
    contexts=[]
    for o in g['occurrences']:
        contexts.append({'occurrenceKey':o['key'],'path':o['path'], 'definitionSha256':o['definitionSha256'],
            'directRequires':o['directRequires'], 'effectiveRequires':o['resolvedEffectiveRequires'],
            'prerequisiteOrigins':o['resolvedPrerequisiteOrigins'],
            'finding':'Only motivation/entry completion, no fachliche Math↔Phys prerequisite is encoded in this occurrence.'})
    RECORDS.append({'goalId':gid,'moduleCode':code,'title':g['title'],
        'originalGoalDescription':next(o['originalDefinition']['description'] for o in g['occurrences'] if o['path']==g['roleAndOwnershipAuthorProposal']['ownerPath']),
        'selectedOwnerProposal':g['roleAndOwnershipAuthorProposal']['ownerPath'],
        'classification':g['roleAndOwnershipAuthorProposal']['subjectRole'],
        'assessmentAndScope':current,'currentPrerequisiteContexts':contexts,
        'individualAtomicAuthoringRecipes':parts,
        'methodAlternatives':method_alternatives or [],
        'rejectedHardRequires':rejected,
        'physicsPrerequisiteForMathematicsDirection':physics_direction,
        'blockingGaps':gap or [], 'reviewStatus':'author-proposal-independent-review-pending',
        'activeEdgesAdded':[], 'approval':False})

def part(pid, statement, req=(), reason='', mode='necessary-for-this-exact-subgoal', taught=(), relevance='math-to-physics', guard=None):
    return {'proposedDependentCapabilityId':'d.'+pid,'proposedDependentDescription':statement,
        'hardPrerequisiteCapabilityIds':list(req), 'necessityRationale':reason,
        'edgeDirection':relevance, 'gateDisposition':mode,
        'newTargetMethodsTaughtHereNotPriorGates':list(taught),
        'scopeGuard':guard, 'runtimeGoalId':None, 'existingAtomicPrerequisiteIdMapping':[],
        'activation':'blocked-until-reviewed-atoms-source-scope-and-DAG-validation'}

ALL_MATH_MODULE_REJECT={'candidate':'all-CIT513016–19-module-completion',
    'reason':'The original outcome does not require every skill in every mathematics module. Select only the indispensable atom after a split; module containers and raw lists are not atomic mastery evidence.'}

# Mathematics roles receive individual reverse-direction decisions. Physical
# applications can need a model, while an abstract operator does not need an
# entire physics course. No reversed edge is invented from the module title.
decision('CIT513016',
    'Mathematics bundle: abstract language, argumentation, isomorphisms, matrix representation. No physical model is present in this current assessable statement.',
    [part('la.linear','Lineare Strukturen als Matrizen darstellen und ein lineares System lösen.',['m.algebra'],
          'Gleichungsumformungen sind der mathematische Unterbau; Physikkenntnisse liefern weder Definition noch erforderlichen Beweis.',relevance='mathematics-internal'),
     part('la.orthogonal','Skalarprodukt, Orthogonalprojektion und geeignete Basiswechsel im gegebenen Vektorraum verwenden.',['m.vectors','m.linear'],
          'Die Raum-/Abbildungsbegriffe sind vorausgehend; eine Trägheitstensor-Anwendung ist hier nicht als Prüfungsanforderung genannt.',relevance='mathematics-internal')],
    [{'candidate':'PH0001/PH0005 mechanics mastery','reason':'Vectors, bases and matrix methods are definable and assessable on mathematical examples; inertia tensors are optional applications, not necessary for this outcome.'}],
    physics_direction={'verdict':'no-necessary-physics-prerequisite-for-current-abstract-outcome',
       'individualReason':'Neither the outcome nor its local content requires a previously understood physical quantity or law; linear structures and matrices can be assessed without a physical model.',
       'conditionalFutureApplication':'Only a separately authored inertia-tensor application would need mechanics and its specific model; do not attach that gate to all linear algebra.'},
    gap=['TUM-PH-MATH-ATOMS','TUM-PH-SOURCE-BINDINGS'])

decision('CIT513017',
    'Mathematics bundle in one variable and approximation; current topic fragment is only real/complex numbers.',
    [part('a1.derivative','Funktionen einer Veränderlichen differenzieren und eine mathematische Approximation beurteilen.',['m.functions'],
          'Funktionsverständnis ist notwendig; Geschwindigkeits-/Kraftdeutung ist keine Pflicht des abstrakten Outcomes.',relevance='mathematics-internal'),
     part('a1.taylor','Taylorentwicklung einer gegebenen Funktion bilden und die Approximation benutzen.',['m.derivative'],
          'Ableitungen liefern die Koeffizienten; ein physikalisches Problem ist eine optionale Auswahl unter einfachen Aufgaben.',relevance='mathematics-internal')],
    [{'candidate':'PH0001 before Analysis 1','reason':'The degree takes PH0001 and Analysis 1 in parallel. Physics examples illustrate approximation, but no physics law is logically necessary for the current mathematical competence.'}],
    physics_direction={'verdict':'no-necessary-physics-prerequisite-for-current-math-outcome',
       'individualReason':'Functions and approximation can be studied on abstract examples. Parallel PH0001 study does not imply a universal prerequisite or automatic mastery.',
       'conditionalFutureApplication':'Velocity/acceleration interpretation is a different authored application; it would require the definitions of those quantities, not complete mechanics.'},
    gap=['TUM-PH-MATH-ATOMS','TUM-PH-EXP1-SUPPLEMENT'])

decision('CIT513018',
    'Mathematics bundle explicitly admits concrete and abstract situations. Source preconditions name CIT513016 and CIT513017, not a physics module.',
    [part('a2.partial','Mehrdimensionale Funktionen differenzieren und mit der Kettenregel arbeiten.',['m.derivative','m.linear'],
          'Eindimensionale Differentiation und lineare Approximation tragen die Methode; die Eingangsprüfung soll diese Atome erfassen.',relevance='mathematics-internal'),
     part('a2.ode','Ein geeignetes gewöhnliches Differentialgleichungssystem mit Anfangsdaten lösen.',['m.ode','m.linear'],
          'ODE-Grundmethoden und lineare Systemdarstellung sind erforderlich, die Physik liefert lediglich einen auswählbaren Modellkontext.',relevance='mathematics-internal'),
     part('a2.kinematic-interpretation','Partielle Ableitungen eines bereits eingeführten Orts-/Geschwindigkeitsfeldes physikalisch interpretieren.',['p.kinematics'],
          'Wenn die Kompetenz ausdrücklich physikalische Interpretation verlangt, müssen Bedeutung der Feldgrößen und Zeit/Ort-Variablen bekannt sein. Das ist eine mögliche Teilkompetenz, keine universelle Pflicht der ursprünglichen Analysisbeschreibung.',
          mode='conditional-future-application-only',relevance='physics-to-mathematics',guard='Only if a reviewed separate mathematical application atom explicitly assesses kinematic interpretation. No such atom currently exists.')],
    [{'candidate':'complete PH0001/PH0005','reason':'Abstract cases satisfy this math outcome; a chosen kinematics application needs only the interpreted physical quantities and may introduce them within the task.'}],
    physics_direction={'verdict':'no-unconditional-physics-edge; conditional-application-recipe-authored',
       'individualReason':'Concrete physical applications are part of possible uses, but abstract cases are also expressly authorized. A separately assessed interpretation atom could use p.kinematics when that model is assumed.'},
    gap=['TUM-PH-MATH-ATOMS','TUM-PH-SOURCE-BINDINGS'])

decision('CIT513019',
    'Mathematics bundle produces tools useful for theory courses; usefulness is an outgoing application relation and is not evidence that theory courses are prior gates.',
    [part('a3.multipleintegral','Mehrdimensionale Integrale unter Koordinatenwechsel berechnen.',['m.integral','m.partial','m.linear'],
          'Integral-, Ableitungs- und Koordinatenmethoden sind der mathematische Unterbau; Ladung/Masse ist ein optionaler Integranden-Kontext.',relevance='mathematics-internal'),
     part('a3.hilbert','Normierung und Skalarprodukte in einfachen Hilbertraumbeispielen berechnen.',['m.innerproduct','m.integral','m.complex'],
          'Endlichdimensionale Skalarprodukte, Integral und gegebenenfalls komplexe Koeffizienten bereiten die Operationen vor; Bra-Ket Physik wird erst darauf aufgebaut.',relevance='mathematics-internal'),
     part('a3.flux-interpretation','Die Integralsätze auf ein zuvor formuliertes elektromagnetisches Flussproblem beziehen.',['p.em'],
          'Eine ausdrücklich physikalische Interpretation des Flusses benötigt Feldgröße, Fläche und gewähltes Modell; der mathematische Satz und seine Beweise benötigen keine Elektrostatik.',
          mode='conditional-future-application-only',relevance='physics-to-mathematics',guard='Only a separately reviewed field/flux application atom; the original abstract Analysis 3 outcome stays physics-independent.')],
    [{'candidate':'PH0006/PH0007 as prior math gates','reason':'That would reverse the intended preparation route and can produce cycles. Electrodynamics/QM use Fourier/Hilbert/PDE methods; their content mastery is unnecessary for the abstract method.'}],
    physics_direction={'verdict':'no-unconditional-physics-edge; conditional-application-recipe-authored',
       'individualReason':'The source purpose prepares mathematics for theory. Optional interpretation of physical flux needs the particular field concept only if it is assumed by a new application atom.'},
    gap=['TUM-PH-MATH-ATOMS','TUM-PH-SOURCE-BINDINGS'])

decision('CH1104',
    'Chemistry competence outside the Math↔Phys assessable pair; overlap in energetic language does not reclassify this entire outcome as physics.',
    [part('chem.equilibrium','Ein einfaches chemisches Gleichgewicht quantitativ behandeln.',['m.algebra','m.functions'],
          'Reaktionsgleichung, Quotienten und gegebenenfalls logarithmische pH-Größen benötigen Algebra/Funktionen, keine vollständige Physikprüfung.',relevance='math-to-chemistry',guard='Only quantitative equilibrium/pH children, not all element-knowledge or binding-description children.'),
     part('chem.kinetics','Eine angegebene einfache Reaktionskinetik berechnen.',['m.functions'],
          'Das vorhandene breite Outcome nennt grundlegende kinetische Berechnungen; eine ausdrücklich differentialgleichungsbasierte Teilkompetenz benötigt zusätzlich m.ode, aber nicht jede Rechnungsaufgabe.',relevance='math-to-chemistry')],
    [{'candidate':'PH0008 statistical physics','reason':'Chemical energetics can introduce required thermodynamic concepts within chemistry; a full statistical-physics gate is not supported by this statement.'}],
    gap=['TUM-PH-SOURCE-BINDINGS','chemistry-outcome-needs-separate-authoring-not-counted-as-physics-completion'])

decision('PH0001',
    'Current statement only asks knowledge of measurement/methodology. Numerical laws and calculus are lost source outcomes, not silently current prerequisites.',
    [part('exp1.measurement','Messmethodik und den Aufbau eines Messvorgangs erklären.',[],
          'Die vorhandene Kompetenz ist ein methodischer Einstieg; keine konkret verlangte mathematische Rechnung lässt sich aus dem abgebrochenen Erst-Outcome ableiten.',mode='granularity-needed-before-hard-math-gate'),
     part('exp1.motion','Die Bewegung eines Massepunkts aus einem eingeführten Modell berechnen.',['m.algebra','m.derivative'],
          'Nur der wiederhergestellte quantitative Mechanik-Outcome benötigt Formel-/Ableitungsoperationen. Die integrierten Mathematischen Ergänzungen ermöglichen diese route ohne komplette Analysis-1-Freigabe.',guard='Restore missing source outcome and author quantitative subgoal before using this edge.'),
     part('exp1.ode','Eine einfache Bewegungs-Differentialgleichung mit vorgegebenem Modell lösen.',['m.algebra','p.kinematics'],
          'Algebra und Bedeutung der Bewegungsgröße sind ein Anfang; einfache ODE sind hier ausdrücklich ein neu zu lernender mathematischer Outcome und dürfen nicht als identisches Vorziel von sich selbst verlangt werden.',
          mode='conditional-future-application-only',taught=['m.ode'],relevance='physics-to-mathematics',guard='Restore integrated mathematics outcome as a distinct assessable math/application atom; p.kinematics only if interpretation is assessed and not introduced in task. Purely abstract ODE solving needs no kinematics gate.')],
    [ALL_MATH_MODULE_REJECT, {'candidate':'full CIT513018/19 before experimental mechanics','reason':'Official degree explicitly integrates anticipatory mathematical supplements. Making later mathematics modules prior gates blocks the authentic first-year route.'}],
    gap=['TUM-PH-EXP1-SUPPLEMENT','TUM-PH-EXTRACTION-LOSS','TUM-PH-MATH-ATOMS'])

decision('PH0002',
    'Current first outcome is electro/magnetostatic knowledge. Separate descriptive principles from quantitative continuous field calculations.',
    [part('exp2.static-quantities','Ladung, Spannung, Strom und elementare statische Feldbeziehungen an einem einfachen Beispiel anwenden.',['m.algebra'],
          'Quantitativ gefasste einfache Gesetze verlangen Größen-/Formelrechnung, aber noch keinen Fourier-, Hilbert- oder PDE-Nachweis.',guard='Only the quantitative form of this child; descriptive concept child may introduce units in teaching.'),
     part('exp2.distributed-field','Das elektrische Feld einer einfachen kontinuierlichen Ladungsverteilung berechnen.',['m.vectors','m.integral'],
          'Vektorsumme und kontinuierliche Summierung sind unvermeidlich für diesen gewählten Rechnungstyp, nicht für jedes Strom-/Magnetostatikwissensziel.',guard='Requires a new explicitly quantitative subgoal in the broad first outcome.'),
     part('exp2.oscillation','Ein einfaches elektromagnetisches Schwingungsmodell quantitativ auswerten.',['m.ode','p.oscillation'],
          'Dies gehört zu einem verlorenen Quelle-Outcome; mechanische Schwingungsbegriffe erleichtern Modellinterpretation, und ODE sind nur bei der expliziten Differentialgleichungsfassung prior.',guard='Restore missing EM-wave/oscillation outcome; an algebraic sinus evaluation needs only functions/trigonometry.')],
    [ALL_MATH_MODULE_REJECT, {'candidate':'MA9935 plus all CIT or MA920 codes','reason':'The teacher-training source route is a separate degree profile. Code lists from different profiles must not be AND-combined.'}],
    gap=['TUM-PH-MA920-CIT-CROSSWALK','TUM-PH-MATH-ATOMS','TUM-PH-EXTRACTION-LOSS'])

decision('PH0003',
    'Broad optics/quantum outcome. The necessary math differs sharply between rays, coherent waves and Fourier optics.',
    [part('exp3.rays','Einfache Abbildungen mit Linsen/Spiegeln geometrisch und quantitativ bestimmen.',['m.algebra','m.geometry'],
          'Formelumstellung und Strahlgeometrie sind notwendig für Lage/Größe des Bildes; komplexe Fourieranalysis ist dafür unnötig.'),
     part('exp3.interference','Phasenlage und Intensitätsverteilung einer einfachen kohärenten Überlagerung berechnen.',['m.functions','m.complex'],
          'Die komplexe Darstellung liefert relative Phase und Betragsquadrat; diese ist eine gewählte Rechenroute und keine Pflicht für rein trigonometrische Zweistrahl-Rechnung.',mode='method-dependent-not-unconditional-AND'),
     part('exp3.fourier-optics','Eine einfache Beugungs-/Bildentstehungsaufgabe im ausdrücklich gewählten Fourieroptik-Modell rechnen.',['m.fourier','m.integral'],
          'Die Transformation und Integrale sind zentral für diesen Modellweg; Module mastery und andere Hilbert/PDE-Themen sind nicht erforderlich.',guard='Only separately authored Fourier-optics child; source explicitly contains Fourier topic but graph lacks atom.')],
    [ALL_MATH_MODULE_REJECT,{'candidate':'QM theory prior to first quantum phenomena','reason':'This module introduces the classical-to-quantum transition; basic concept explanation does not require the later full Schrödinger course.'}],
    gap=['TUM-PH-MA920-CIT-CROSSWALK','TUM-PH-MATH-ATOMS'],
    method_alternatives=[{'dependent':'d.exp3.interference','choices':[['m.functions','m.geometry'],['m.complex']],
        'meaning':'Trigonometric/superposition calculation versus complex-amplitude calculation. Choose exact assessed method or teach the representation; do not encode the union as AND.'}])

decision('PH0004',
    'Current broad atom/molecule competence, missing thermo outcome. Operator use and mere recognition of a transition must not share one gate.',
    [part('exp4.states','Die vorgegebene Schrödingergleichung für ein einfaches Atom-/Molekülmodell lösen und deuten.',['m.complex','m.ode','m.integral','p.atomic'],
          'Complex wave functions, solving and normalization are necessary for a genuine solution task. The physical meaning of atom states must be introduced earlier within the split, not self-required as whole module.',guard='Only solution child; p.atomic means an earlier introductory state/concept atom, never the same dependent atom.'),
     part('exp4.selection','Eine angegebene optische Auswahlregel anhand vorgegebener Symmetrie-/Paritätsinformation anwenden.',['m.algebra'],
          'A prescribed rule can be applied without the entire higher analysis syllabus. A derivation from eigenfunctions needs additional methods and must be its own atom.',guard='Operationalize symmetry/selection rule child; do not imply all matrix/PDE methods mandatory for description.'),
     part('exp4.thermo','Einfache thermodynamische Prozesse und Hauptsatz-Anwendungen beschreiben.',['m.algebra'],
          'Elementary balances require quantity arithmetic; statistical partition-function calculation is a later separate route.',guard='Missing thermodynamics outcome must be restored before this is in scope.')],
    [ALL_MATH_MODULE_REJECT, {'candidate':'PH0007 complete mastery','reason':'Atom physics and QM theory occur together in the fourth semester. A full QM-prior gate would delay or create cycles; separate needed concepts/methods or teach them.'}],
    gap=['TUM-PH-MA920-CIT-CROSSWALK','TUM-PH-MATH-ATOMS','TUM-PH-EXTRACTION-LOSS'])

decision('PH0005',
    'As-written outcome is an empty preamble; recipes refer to source-restored children, not an existing assessable leaf.',
    [part('theory1.newton','Ein Newtonsches Bewegungsproblem mit Anfangsdaten formulieren und lösen.',['m.vectors','m.derivative','m.ode','p.newton'],
          'Vector force/acceleration and an ODE solution are necessary for this quantitative model. Do not require later Fourier/Hilbert/PDE competence.'),
     part('theory1.lagrange','Für ein bestimmtes mechanisches System die geeigneten Lagrange-Gleichungen aufstellen.',['m.partial','m.derivative','p.workenergy'],
          'Generalized coordinate derivatives and kinetic/potential energy are the local necessities; no whole Analysis-2 module completion is justified.'),
     part('theory1.normalmodes','Normalkoordinaten eines gegebenen linearisierten mechanischen Systems bestimmen.',['m.linear','m.eigen','m.odesystems','p.oscillation'],
          'Diagonalization and linear ODE modes are necessary for this explicit method; it is only one child in a large mechanics course.')],
    [ALL_MATH_MODULE_REJECT,{'candidate':'approve requires for existing 62dc798d… preamble','reason':'A source-restored competence is required before an edge can target this empty leaf meaningfully.'}],
    gap=['TUM-PH-EXTRACTION-LOSS','TUM-PH-MA920-CIT-CROSSWALK','TUM-PH-MATH-ATOMS'])

decision('PH0006',
    'Six outcome parts: PDE boundary solving, Maxwell fields, waves, Green-function moving-charge fields, frame transforms, and mathematical tensor/spherical methods.',
    [part('theory2.maxwell','Aus vorgegebenen Ladungs-/Stromverteilungen eine Feldverteilung mit Maxwell-Gleichungen berechnen.',['m.vectorcalculus','m.multipleintegral','m.integraltheorems','p.em'],
          'Differential and integral field operations are necessary for this quantitative child, not every conceptual introduction.'),
     part('theory2.boundary','Ein einfaches elektrodynamisches Randwertproblem im festgelegten Verfahren lösen.',['m.pde','p.em'],
          'The specified PDE method and physical boundary meaning are required; multiple methods are alternatives, not cumulative prerequisites.'),
     part('theory2.waves','Eine einfache Wellengleichung mit den vorgegebenen Anfangs-/Randdaten lösen.',['m.derivative','m.partial','m.pde'],
          'Differential operations and chosen wave-equation method are indispensable for a real solution; full complex analysis and all mathematics modules are not.'),
     part('theory2.green','Das Feld einer bewegten Verteilung mit der ausdrücklich vorgegebenen Greenschen Methode berechnen.',['m.integral','m.multipleintegral','m.pde','p.maxwell'],
          'Green kernels are new content; integration and basic PDE representation precede their physical application.',taught=['Green-function-method']),
     part('theory2.frame','Feldkomponenten zwischen spezifizierten gleichförmig bewegten Bezugssystemen transformieren.',['m.linear','p.em'],
          'Matrix transformation is the prior math skill. Tensor formalism is itself listed as target, so cannot be required as whole mastered PH0006 beforehand.',taught=['m.tensor']),
     part('theory2.spherical','Die für ein gegebenes Feldproblem erforderlichen Kugelflächenmethoden erlernen und anwenden.',['m.innerproduct','m.ode'],
          'Orthogonality and differential-equation basics can precede the method; spherical functions are an explicit method target and are not an invented earlier math atom.',taught=['m.spherical'])],
    [ALL_MATH_MODULE_REJECT,{'candidate':'m.tensor/m.spherical as unconditional existing prior atoms','reason':'These are explicit targets of PH0006 and no separate earlier provider was found. Self-prerequisites or inventing mastery would be invalid.'}],
    gap=['TUM-PH-MA920-CIT-CROSSWALK','TUM-PH-MATH-ATOMS','tensor-spherical-ownership-split'],
    method_alternatives=[{'dependent':'d.theory2.boundary','choices':[['m.separation'],['m.fourier'],['Green-function-method']],
        'meaning':'Boundary-value solution methods need a method-specific authored route. Current requires cannot express OR; choose an exact target or separate method atoms instead of requiring all methods.'}])

decision('PH0007',
    'Current first five quantum outcomes need wave-function, differential and finite-dimensional operator routes; later lost two-state/approximation/density outcomes remain visibly missing.',
    [part('qm1.bra-ket','Mit normierten Zuständen, Skalarprodukten und einem gegebenen Messoperator im Bra-Ket-Formalismus rechnen.',['m.complex','m.innerproduct'],
          'Complex coefficients and inner products are necessary. Full field electrodynamics and every PDE method are unnecessary for finite-dimensional examples.'),
     part('qm1.1d','Ein einfaches eindimensionales Potentialproblem lösen und Wellenfunktion/Ergebnis interpretieren.',['m.complex','m.ode','m.integral','p.quantumstates'],
          'ODE solution, matching and normalization are required; state interpretation must be taught in an earlier introduction within the split.'),
     part('qm1.hydrogen','Ein einfaches Zentralpotential-/Wasserstoffproblem im separierten Ansatz behandeln.',['m.pde','m.innerproduct','m.integral','p.quantumstates'],
          'The chosen separation/eigenfunction method and normalization support this 3D child; an analytical solution cannot be replaced by a broad math-course token.'),
     part('qm1.two-level','Ein spezifiziertes Zwei-Niveau-System mit Matrixmethoden lösen.',['m.linear','m.eigen','m.complex'],
          'Finite-dimensional eigenproblem is the exact method. This source outcome is lost in the current goal and must be restored.',guard='Missing source outcome 6; no completion claim for the original five-part leaf.')],
    [ALL_MATH_MODULE_REJECT,{'candidate':'full PH0006 before finite-dimensional spin/Bra-Ket','reason':'The source broad module precondition is curriculum context; a conceptual or finite-dimensional quantum child does not logically require solving every electrodynamic field problem.'}],
    gap=['TUM-PH-MA920-CIT-CROSSWALK','TUM-PH-MATH-ATOMS','TUM-PH-EXTRACTION-LOSS'],
    method_alternatives=[{'dependent':'d.qm1.bra-ket','choices':[['m.innerproduct','m.linear'],['m.hilbert','m.integral']],
        'meaning':'Finite-dimensional vectors versus continuous wave-function representation. The selected state space determines required methods; do not gate every spin problem on advanced continuous Hilbert theory.'}])

decision('PH0008',
    'Current physics bundle includes phenomenological thermodynamics, statistical mechanics, quantum gases, interacting systems and a qualitative non-equilibrium overview.',
    [part('stat.thermopotential','Mit thermodynamischen Potentialen und ihren Ableitungen im vorgegebenen Prozess rechnen.',['m.partial','m.functions','p.thermo'],
          'State-variable differentiation and thermodynamic meanings are necessary for this quantitative atom, not every descriptive temperature/heat child.'),
     part('stat.partition','Eine einfache Zustandssumme und daraus thermodynamische Größen berechnen.',['m.probability','m.functions','m.derivative','p.thermo'],
          'Normalization, weighted sums and derivatives are the necessary local operations. Probability has no identified independent reviewed math atom in CIT513016–19.'),
     part('stat.quantumgas','Ein vorgegebenes ideales Quantengas mittels Besetzungszahlen und Zustandsdichte berechnen.',['m.integral','m.functions','p.quantumstates','p.ensembles'],
          'Density-of-states integrals and quantum occupancy meaning are necessary; ensemble introduction must precede this child, not be inferred from dependent mastery.'),
     part('stat.nonequilibrium-overview','Die ausdrücklich geforderten Grundideen des Nichtgleichgewichts an einem erklärten Beispiel wiedergeben.',[],
          'A qualitative insight outcome does not require solving the full Boltzmann/PDE system. If quantitative diffusion is authored, use m.pde on that separate child.',mode='no-hard-math-gate-for-this-qualitative-child')],
    [ALL_MATH_MODULE_REJECT,{'candidate':'complete QM/electrodynamics for every thermodynamic concept','reason':'Source curriculum preconditions are broad; basic phenomenological concepts can be introduced before all quantum/field methods and do not need a universal AND.'}],
    gap=['TUM-PH-MA920-CIT-CROSSWALK','TUM-PH-MATH-ATOMS','probability-provider-gap'])

LABS={
 'PH0009':('lab1','Mechanik und Thermodynamik',['p.kinematics','p.workenergy'],'PH0001 (empfohlen)',
           'Mechanische Modelle und einfache Messvorgänge passen zu den ersten Versuchen; Thermodynamik kann im Versuch eingeführt werden.'),
 'PH0010':('lab2','Thermodynamik, Elektrodynamik und Magnetismus',['p.em','p.thermo'],'PH0001, PH0002, PH0009 (empfohlen)',
           'Vorbereitung hängt vom ausgewählten Strom-/Magnetfeld-/Thermikversuch ab; ein vollendeter früherer Laborkatalog ist nicht für jeden Aufbau logisch notwendig.'),
 'PH0011':('lab3','Optik, Atom- und Kernphysik',['p.optics','p.atomic'],'PH0001, PH0002, PH0003, PH0009, PH0010 (empfohlen)',
           'Optische Geometrie/Interferenz oder Kernzählraten erfordern unterschiedliche Rechenvorbereitung; der Versuchskatalog bestimmt die Teilkompetenz.'),
}
for code,(pid,topic,pr,localrec,why) in LABS.items():
    decision(code,
      'Current first outcome is carrying out experiments in '+topic+'. Local prior modules are explicitly recommended, not universal hard requirements.',
      [part(pid+'.prepare','Einen ausgewählten Versuch in '+topic+' anhand seines eingeführten Modells vorbereiten.',['m.algebra'],
            'Reading units and manipulating the exact supplied model are necessary for a quantitative preparation child. '+why,
            guard='Selected experiment and model must be authored; purely guided apparatus operation does not imply all these math requirements.'),
       part(pid+'.evaluate','Aus Messwerten eine im konkreten Versuch vorgegebene Größe berechnen und die Unsicherheit behandeln.',['m.algebra','m.functions'],
            'Elementary formula/function handling is prerequisite; uncertainty propagation and analysis are explicit newly taught source targets, not automatic entry gates.',
            taught=['m.uncertainty'],guard='Restore missing data-analysis/uncertainty source outcome; exact experiment may need trigonometry, derivative or regression, never all alternatives.'),
       part(pid+'.apparatus','Den ausgewählten physikalischen Versuchsaufbau sachgerecht durchführen.',[],
            'No numeric operation is specified in this current general process statement. Gate only a later explicitly mathematical evaluation child, after identifying the chosen experiment.',mode='experiment-specific-prerequisite-decision-needed')],
      [ALL_MATH_MODULE_REJECT,{'candidate':localrec+' as AND mastery gates',
       'reason':'Recommended background is evidence for preparation and selection; it is not a universal proof that each complete module is necessary for every introductory lab goal.'}],
      gap=['TUM-PH-EXTRACTION-LOSS','experiment-scope-needed','TUM-PH-MATH-ATOMS'])

decision('PH0014',
    'Broad structured-knowledge/standard-model outcome. Separate numerical scattering, symmetry methods and explaining detector principles.',
    [part('kta1.detectors','Die Arbeitsweise eines Beschleunigers/Detektors an einem einfachen gegebenen Beispiel erklären.',['p.em'],
          'Electric/magnetic forces and signal interaction are the physical basis; numerical orbit/energy calculation is optional and needs algebra only when separately requested.',mode='physics-prior-concept-not-universal-math-gate'),
     part('kta1.scattering','Eine vorgegebene einfache Streu-/Wirkungsquerschnittsaufgabe quantitativ auswerten.',['m.integral','m.geometry','p.quantumstates'],
          'Angular/surface integration and the stated quantum model are necessary for this numeric child; qualitative apparatus descriptions need none of this.'),
     part('kta1.symmetry','Eine im Kurs eingeführte einfache Symmetriedarstellung zur Einordnung eines Teilchenmodells benutzen.',['m.linear','m.complex'],
          'Linear representations and complex amplitudes precede this exact method. Group theory itself is introduced in the source and must not become an invented prior module gate.',taught=['group-theory-basics'])],
    [ALL_MATH_MODULE_REJECT,{'candidate':'complete advanced group/QFT course','reason':'The source introduces group-theory and effective-field basics; no existing matching prerequisite atom is proven, so do not require an unrelated graduate mathematics landscape.'}],
    gap=['TUM-PH-MATH-ATOMS','TUM-PH-SOURCE-BINDINGS','physics-outcome-atomic-split'])

decision('PH0015',
    'Broad continuation covering flavours, nuclear models/decays and cosmology; source names PH0014, which supplies physical foundation but is not automatic transitive mastery.',
    [part('kta2.mixing','Ein gegebenes einfaches Flavour-/Neutrino-Mixing mit einer vorgegebenen Matrix auswerten.',['m.linear','m.complex','p.quantumstates','p.particles'],
          'Complex amplitudes and matrix transformations are unavoidable for the stated quantitative mixing model; whole analysis completion is not.'),
     part('kta2.decay','Ein einfaches Kernzerfallsmodell mit gegebenen Parametern berechnen.',['m.functions','m.algebra'],
          'Exponential/log relations suffice for a supplied decay law; derivation from the rate equation additionally needs m.ode on that separate target.'),
     part('kta2.cosmology','Grundprinzipien der Sternentwicklung und Kosmologie im eingeführten Modell erklären.',[],
          'A conceptual outcome needs model meanings and source foundations; it does not state the requirement to solve relativistic PDE or Friedmann systems.',mode='no-hard-math-gate-for-this-conceptual-child')],
    [ALL_MATH_MODULE_REJECT,{'candidate':'all PH0014 prerequisites inferred mastered from PH0014','reason':'Dependent mastery never generates prerequisite mastery. Each newly selected unmastered necessary atom must remain checked directly.'}],
    gap=['TUM-PH-MATH-ATOMS','physics-outcome-atomic-split'])

def conceptual_intro(code,pid):
    decision(code,
      'Current outcome describes operation of accelerators/detectors in a conceptual intro course; numeric calculation is not specified as an assessment obligation.',
      [part(pid+'.operation','Die Grundprinzipien eines gegebenen Beschleunigers/Detektors erklären.',['p.em'],
            'Force/field and interaction principles carry the explanation. The current statement does not imply a required numerical differential-equation or Fourier solution.',mode='conceptual-physics-prior-needs-atom'),
       part(pid+'.numeric-optional','Eine ausdrücklich quantitativ gefasste Beschleunigerbahn mit gegebenem Modell berechnen.',['m.algebra','m.vectors'],
            'Such a future problem needs vectors and rearranging the relevant force/momentum equations; it is not required by the retained first conceptual outcome.',mode='conditional-future-application-only',guard='Only if a new reviewed numeric atom is added; not hidden in current descriptive goal.')],
      [ALL_MATH_MODULE_REJECT,{'candidate':'all experimental/theory modules hard gates for this single explanation',
       'reason':'The local source lists broad degree foundations; the exact conceptual outcome needs only the particular principles used by the described equipment, not full expert-course solution methods.'}],
      gap=['TUM-PH-EXTRACTION-LOSS','intro-expert-choice-scope','language-equivalence-no-automatic-mastery'])
conceptual_intro('PH0016','ktaintro')
conceptual_intro('PH8016','ktaintroen')

decision('PH0017',
    'Current outcome is an empty preamble. New recipes refer to restored source subgoals only.',
    [part('km1.reciprocal','Für ein gegebenes Kristallgitter das reziproke Gitter und eine einfache Beugungsbedingung bestimmen.',['m.vectors','m.linear','m.geometry','p.optics'],
          'Vector bases and angle/reciprocal relations are necessary; the quantitative diffraction problem has specific math needs rather than all advanced analysis.'),
     part('km1.lattice','Normale Gitterschwingungen im gegebenen linearen Modell berechnen.',['m.eigen','m.odesystems','p.oscillation'],
          'Eigenmodes and ODE dynamics are the exact methods; bonding recognition needs none of these heavy gates.'),
     part('km1.thermal','Die spezifische Wärme im angegebenen Phononenmodell bestimmen.',['m.integral','m.functions','p.ensembles'],
          'State-density integration and thermal occupation model are necessary for this explicit calculation; source quantitative model outcome must first be recovered.')],
    [ALL_MATH_MODULE_REJECT,{'candidate':'accept current e9b7d660… as assessable atom','reason':'It has no learner action/object after the preamble. A full source-restored split is required before edge review.'}],
    gap=['TUM-PH-EXTRACTION-LOSS','TUM-PH-MATH-ATOMS','physics-outcome-atomic-split'])

decision('PH0018',
    'Current first outcome explains structure/band-property relations; quantitative dielectric/magnetic/optical/device tasks are lost distinct outcomes.',
    [part('km2.structure','Eine beobachtete qualitative Festkörpereigenschaft einem eingeführten Kristall-/Bandmodell zuordnen.',['p.solid'],
          'Solid-state concepts from the earlier branch are necessary for the explanation; a complete PDE solution is not.',mode='physics-prior-concept-not-universal-math-gate'),
     part('km2.response','Eine einfache vorgegebene elektrische/optische Antwortfunktion eines Festkörpers quantitativ auswerten.',['m.complex','m.functions','p.em','p.solid'],
          'Complex response and stated field/band model are needed for this numerical child. Fourier derivation is method-specific, not always required.',guard='Restore/author numeric response child rather than silently add it to broad qualitative outcome.'),
     part('km2.spinwaves','Eine vorgegebene linearisierte Spinwellen-Dynamik mittels Moden berechnen.',['m.eigen','m.odesystems','p.quantumstates'],
          'Normal-mode methods and spin interpretation are required for this exact quantitative model, absent from current first-leaf formulation.',guard='New source-grounded child needed; not mandatory for every structure-property explanation.')],
    [ALL_MATH_MODULE_REJECT,{'candidate':'all PH0017 prerequisites as implicit mastery','reason':'Earlier condensed-matter completion does not create mastery of missing required math; check each method atom in its own frontier test.'}],
    gap=['TUM-PH-EXTRACTION-LOSS','TUM-PH-MATH-ATOMS','physics-outcome-atomic-split'])

for code,pid in [('PH0019','kmintro'),('PH8019','kmintroen')]:
    decision(code,
      'The only current assessable outcome assigns bonding types to materials; no calculation method is demanded. Physics/chemistry concepts overlap, but math need is not inferred from the surrounding full course.',
      [part(pid+'.bonding','Gegebene Stoffe ihren charakteristischen Bindungsarten zuordnen.',[],
            'This is conceptual classification. Arithmetic, eigenproblems, Fourier/PDE and differential methods are not necessary to perform that particular assignment.',mode='no-necessary-math-prerequisite-for-this-exact-current-competence'),
       part(pid+'.phonon-numeric','Ein gegebenes einfaches Gitterdynamik-Modell quantitativ behandeln.',['m.eigen','m.odesystems'],
            'Such mathematics belongs only to a restored numeric lattice-dynamics child; the intro source asks understanding, which may remain conceptual.',mode='conditional-future-application-only',guard='Do not enlarge the current bonding-assignment goal or turn all intro goals into expert math gates.')],
      [ALL_MATH_MODULE_REJECT,{'candidate':'CIT Analysis 3 solely because the module contains later lattice/transport topics',
       'reason':'The retained bonding outcome can be assessed without advanced analysis. Source topics later in the module cannot be imposed on this one child.'}],
      gap=['TUM-PH-EXTRACTION-LOSS','intro-expert-choice-scope','language-equivalence-no-automatic-mastery'])

decision('PH0020',
    'Current leaf describes building blocks and their relationships; local source separately demands quantitative enzyme, pattern, membrane, interaction and simulation competence.',
    [part('bio.parts','Grundbausteine lebender Systeme und ihre Beziehungen beschreiben.',[],
          'Description of sugar/DNA/protein relations does not entail PDE, statistics or matrix calculation.',mode='no-necessary-math-prerequisite-for-this-exact-current-competence'),
     part('bio.enzymes','Eine vorgegebene einfache Enzymkinetik quantitativ analysieren.',['m.functions','m.algebra'],
          'Rational functions and rearranging concentrations/rates are necessary; time-dependent kinetic derivation requires m.ode only if explicitly assessed.',guard='Restore missing quantitative source outcome.'),
     part('bio.patterns','Ein angegebenes Reaktions-Diffusions-Modell für Musterbildung quantitativ behandeln.',['m.pde','m.partial','m.odesystems'],
          'Coupled time/space evolution demands these specific operations; qualitative detection of a pattern does not.',guard='Restore and split the source model derivation/quantitative outcome.'),
     part('bio.simulation','Möglichkeiten und Grenzen eines erläuterten Simulationsverfahrens beschreiben.',[],
          'The source asks description of simulation methods; implementing Monte Carlo with distribution sampling is a separate quantitative task and must not be an assumed general gate.',mode='method-specific-only-if-new-quantitative-atom')],
    [ALL_MATH_MODULE_REJECT,{'candidate':'all Monte-Carlo/PDE prerequisites for building-block description','reason':'Mathematical modeling is a lost separate outcome, not necessary for identifying biochemical objects.'}],
    gap=['TUM-PH-EXTRACTION-LOSS','biophysics-source-german-english-outcome-drift','TUM-PH-MATH-ATOMS'])

decision('PH0021',
    'Current energy/exergy efficiency calculation is specific enough to need elementary algebra and correct physical balances; complete thermodynamic/calculus modules are not automatically necessary.',
    [part('energy.efficiency','Aus gegebenen Energie-/Exergieströmen einen Wirkungsgrad bestimmen.',['m.algebra','p.exergy'],
          'Ratio and units plus the physical identification of useful/input flows are indispensable. Basic source thermodynamics precedes an introduced exergy definition; p.exergy must not be the same target atom.'),
     part('energy.cycle','Einen explizit gegebenen Kreisprozess mit kontinuierlicher Arbeit/Wärme integrieren.',['m.integral','p.thermo'],
          'Calculus is necessary only where the task derives flows by integration, not for an efficiency ratio on supplied numeric flows.',guard='Exact cycle/integral method child must be authored separately from numeric-flow efficiency.'),
     part('energy.steady','Eine vorgegebene stationäre Fließgleichgewichts-Bilanz auswerten.',['m.algebra','p.thermo'],
          'Algebra and physical terms of the energy balance suffice for the specified steady-flow calculation; it is a missing distinct source outcome.',guard='Restore missing steady-flow analysis outcome.')],
    [ALL_MATH_MODULE_REJECT,{'candidate':'full condensed matter before every exergy ratio','reason':'Condensed matter is a source-level background for solar cells and materials; it is not necessary for the specific supplied-stream exergy efficiency calculation.'}],
    gap=['TUM-PH-MATH-ATOMS','TUM-PH-EXTRACTION-LOSS'],
    method_alternatives=[{'dependent':'d.energy.efficiency','choices':[['m.algebra'],['m.integral','m.algebra']],
        'meaning':'Given discrete/numeric energy streams versus deriving continuous work/heat first. The richer route is a different task demand; do not gate both on an entire analysis course.'}])

decision('PH0022',
    'Broad material structure/property/phase-diagram/selection outcome. Source prerequisite itself uses an alternative introductory-or-expert condensed-matter route.',
    [part('materials.diagram','Ein vorgegebenes Phasendiagramm lesen und Materialzustände/Umwandlungen daraus bestimmen.',['m.functions'],
          'Reading coordinates and graph regions is necessary; solving all thermodynamic partial derivatives is not.'),
     part('materials.selection','Materialien anhand vorgegebener Eigenschaften und Belastungsgrenzen für eine Anforderung beurteilen.',['m.algebra','p.solid'],
          'Comparing supplied quantities/units and understanding property mechanisms are the local basis; advanced PDE is unnecessary for selection from provided tables.'),
     part('materials.micro','Den qualitativen Zusammenhang zwischen einer Mikrostruktur und einer gegebenen Materialeigenschaft erklären.',['p.solid'],
          'The physical material model carries this explanation; an independent quantitative tensor/elastic-wave model needs a separate atom.',mode='physics-prior-concept-not-universal-math-gate')],
    [ALL_MATH_MODULE_REJECT,{'candidate':'PH0019 AND PH0017 complete mastery','reason':'The retained source says introduction to solid-state physics respectively condensed matter I. These are alternative background routes; AND would remove the offered route.'}],
    gap=['intro-expert-choice-scope','physics-outcome-atomic-split','TUM-PH-MATH-ATOMS'],
    method_alternatives=[{'dependent':'materials prerequisite scope','choices':[['PH0019-intro-concepts'],['PH0017-expert-concepts']],
        'meaning':'Common reviewed material concept atoms or distinct authored route. Do not require both full courses or infer equivalence/mastery from their different IDs.'}])

decision('PH0023',
    'Current only objective is describing biomolecular structure-determination methods; the nine source outcomes include much later quantitative transport/electrolyte/membrane/PDE targets.',
    [part('biointro.structure','Ein angegebenes physikalisches Verfahren zur Strukturbestimmung eines Biomoleküls beschreiben.',['p.optics'],
          'Optics/scattering principles are needed only for a selected optical/diffraction method; other offered structure methods need their own prior principles. Mathematical inversion is not necessary for describing the apparatus.',
          mode='selected-method-physical-prior-not-universal-math-gate',guard='Select and name the exact method; do not attach optics as universal requirement to every structure method.'),
     part('biointro.diffusion','Den Transport durch eine gegebene einfache Diffusionsgleichung quantitativ berechnen.',['m.pde','m.functions'],
          'Space/time evolution is required for this restored numeric transport child; molecular motor models may instead use discrete/ODE descriptions.',guard='Restore missing quantitative diffusion source outcome.'),
     part('biointro.membrane','Ein vorgegebenes einfaches Membranpotential beziehungsweise dessen Zeitverlauf berechnen.',['m.functions','m.ode','p.em'],
          'Logarithmic concentration-voltage relations or dynamic ODE are alternatives determined by Nernst versus pulse model; do not require both for every task.',mode='method-dependent-not-unconditional-AND',guard='Restore missing quantitative membrane/pulse outcome and choose exact static/dynamic method.')],
    [ALL_MATH_MODULE_REJECT,{'candidate':'all Navier-Stokes/reaction-diffusion methods before describing structure imaging','reason':'Those are separate lost quantitative outcomes. The retained description competence does not require all numerical methods taught later.'}],
    gap=['TUM-PH-EXTRACTION-LOSS','method-scope-for-imaging','TUM-PH-MATH-ATOMS'],
    method_alternatives=[{'dependent':'d.biointro.membrane','choices':[['m.functions'],['m.ode']],
        'meaning':'Static Nernst relation needs logarithms; dynamic pulse model needs ODE. Author two target children or explicitly chosen methods, not an OR disguised as AND.'}])

decision('PH0024',
    'The current first outcome derives Fermi golden rule and uses transition probabilities; unlike a conceptual intro it genuinely needs operator/amplitude/time-integration methods.',
    [part('qmadv.golden','Fermis goldene Regel im gegebenen quantenmechanischen Ansatz herleiten.',['m.complex','m.integral','m.innerproduct','p.quantumstates'],
          'Time-dependent amplitudes, matrix elements and norm/probability operations are necessary. The physical perturbation approach is taught here, not a duplicate prior mastered target.'),
     part('qmadv.transition','Mit vorgegebenen Matrixelementen und Zustandsdichte eine Übergangsrate/-wahrscheinlichkeit berechnen.',['m.algebra','m.innerproduct','p.quantumstates'],
          'Once rule/data are supplied, algebra and interpretation suffice; rederiving it by Fourier/time integrals is a different demand.',guard='Separate application from derivation; amplitude integral may be necessary only if not given.'),
     part('qmadv.scattering','Eine Streuamplitude im ausdrücklich gewählten Partialwellen-/Born-Verfahren berechnen.',['m.integral','m.innerproduct','p.quantumstates'],
          'This is a later lost source outcome, not a current new obligation. Chosen method determines Fourier/spherical requirements.',guard='Restore missing source outcomes and select method atom before any activation.')],
    [ALL_MATH_MODULE_REJECT,{'candidate':'every full QM1/math topic before numeric rate formula','reason':'The source says QM1 as course-level background. Each derivation/application child needs exact state/matrix/probability atoms; course-level mastery is not equivalent to every mathematical prerequisite.'}],
    gap=['TUM-PH-EXTRACTION-LOSS','TUM-PH-MATH-ATOMS'],
    method_alternatives=[{'dependent':'d.qmadv.scattering','choices':[['m.fourier'],['m.spherical','m.innerproduct']],
        'meaning':'Born/Fourier versus partial-wave method. Restore/author distinct outcomes; existing requires has no OR operator and must not require the union for all scattering problems.'}])

decision('PH0031',
    'Current first outcome only prepares a physical experiment independently; data analysis/report/research/presentation are five lost distinct source targets. Full first-four experimental/lab modules are source-level background, not an automatic single universal math gate.',
    [part('fsq.preparation','Sich fachlich auf einen ausgewählten fortgeschrittenen Physikversuch vorbereiten.',[],
          'Necessary mathematics depends on experiment selection. Preparation for qualitative apparatus discussion is different from deriving a fit/model. No common Fourier/PDE/eigen requirement follows from this general process statement.',mode='experiment-specific-prerequisite-decision-needed'),
     part('fsq.analysis','Die gewonnenen Daten eines bestimmten Versuchs mit dem geeigneten Modell auswerten.',['m.algebra','m.functions','m.uncertainty','p.labbasics'],
          'Basic quantitative data handling and uncertainty principles can be earlier lab atoms; advanced regression/Fourier/differential methods must be selected from actual experiment requirements.',guard='Restore missing analysis outcome; m.uncertainty must map to a reviewed earlier lab/math atom, not whole lab mastery.'),
     part('fsq.presentation','Ein physikalisches Forschungsergebnis in einem wissenschaftlichen Vortrag darstellen.',[],
          'Source asks scientific contextualization and presentation; presentation itself has no universal higher-mathematics prerequisite. Subject model knowledge is selected with the topic.',mode='topic-specific-physical-preparation-only')],
    [ALL_MATH_MODULE_REJECT,{'candidate':'all mathematical methods of every possible FOPRA experiment','reason':'Students select six experiments from a decentralized catalog; requiring the union would be unnecessary and inconsistent with individualized scope.'}],
    gap=['TUM-PH-EXTRACTION-LOSS','experiment-scope-needed','TUM-PH-CATALOG-SCOPE'])

# IDs outside the 30 outcome candidates are fully dispositioned by role, not
# mislabeled as individually approved no-required content goals.
nonoutcomes=[]
for g in audit['goals']:
    ed=g['roleAndOwnershipAuthorProposal']
    if g['goalId'] in OUTCOME_IDS.values():
        continue
    nonoutcomes.append({'goalId':g['goalId'],'semanticRole':ed['semanticRole'], 'subjectRole':ed['subjectRole'],
        'roleReason':ed['roleRationale'], 'requiresDisposition':
          'Motivational completion is a separate entry workflow, not a Math↔Phys content-requires target.' if ed['semanticRole']=='orientation' else
          ('A program unit/reference needs scope rules, not universal atom prerequisites on all descendants.' if ed['semanticRole'] in ('programStructure','programDegreeContainer','programModuleContainer','programMetadata') else
           'As written this is a source heading/list/teaching/activity fragment, not an individual competency. Restore/author proper atoms before content requires review.'),
        'reviewStatus':'not-assessable-content-review-completed; role-proposal-independent-review-pending',
        'approval':False,'activeEdgesAdded':[]})

assert len(RECORDS)==30
assert len({r['goalId'] for r in RECORDS})==30
assert len(nonoutcomes)==112
assert set(OUTCOME_IDS.values())=={r['goalId'] for r in RECORDS}
all_parts=[p for r in RECORDS for p in r['individualAtomicAuthoringRecipes']]
assert len({p['proposedDependentCapabilityId'] for p in all_parts})==len(all_parts)
for p in all_parts:
    assert all(cid in CAPABILITIES for cid in p['hardPrerequisiteCapabilityIds']),p
assert all(r['activeEdgesAdded']==[] and r['approval'] is False for r in RECORDS)

obj={'schemaVersion':1,'authorBatchId':'tum-bsc-physics-requires-recipes-author-20261013-v1',
    'createdAt':'2026-10-13','inert':True,'familyId':'tum-bsc-physics',
    'author':'Codex /root/noncanonical_subject_scope','reviewStatus':'author-proposal-independent-review-pending',
    'approval':False,'roleAuditBinding':{'path':str(AUDIT_PATH.relative_to(ROOT)),'sha256':sha(AUDIT_PATH)},
    'licensing':{'technicalMetadataAndTooling':'Apache-2.0','ownCurricularRecommendations':'CC-BY-4.0',
       'originalSourcesAndGoalDefinitions':'Existing provenance and rights unchanged; not re-licensed.'},
    'scope':{'allInventoryIdsRoleDispositioned':142,'allOutcomeCandidateIdsIndividuallyPrepared':30,
       'assessableOutcomeCandidates':28,'truncatedOutcomePreamblesRequiringRestoration':2,
       'recipeCoverage':'Individual current-Goal context decisions plus explicit method/subgoal authoring proposals. This is not a complete restoration or independent acceptance of all source outcome aspects.',
       'operationalRequiresRowsApproved':0,'activatedEdges':0,'fullImplementationComplete':False,
       'reasonIncomplete':'Capabilities and individual dependencies are authored, but there are no reviewed atomic ID mappings, source approvals or independent review. These recipes cannot be applied as live requires.'},
    'counts':{'capabilities':len(CAPABILITIES),'individualOutcomeRecords':len(RECORDS),
       'individualDependentRecipes':len(all_parts),'nonOutcomeRoleDispositions':len(nonoutcomes),
       'recipeDirections':dict(collections.Counter(p['edgeDirection'] for p in all_parts))},
    'edgeSemantics':{'requiresArrow':'prerequisite -> dependent (dependent.requires contains prerequisite)',
       'necessity':'Hard gates are necessary for the specifically authored child, not every skill listed in a related source module.',
       'alternatives':'Current requires is AND. Alternatives cannot be stored by requiring their union. Resolve method/assessment route by separate children or common necessary atoms first.',
       'directAndInherited':'Existing direct plus contains-ancestor prerequisites are recorded per occurrence. No transitive requires mastery or mastery inferred from a dependent is allowed.',
       'masteryIsIndependent':True,'transitiveMastery':False,
       'sourceOrigin':'Retained source fields prove topic/outcome presence only at their stated scope. Recipe splitting and necessary-skill decisions are explicitly author didactic judgments, not direct official quotations.',
       'ownMathematicsFirst':'CIT513016–19 and PH0001/PH0003 integrated methods inspected; unrelated BSc Mathematics IDs are not substitutes.',
       'capabilityIdsAreNotRuntimeGoals':True},
    'capabilityCatalog':list(CAPABILITIES.values()),
    'individualRequiresDecisions':sorted(RECORDS,key=lambda x:x['moduleCode']),
    'nonOutcomeDispositions':nonoutcomes,
    'activationChecklistActuallyOpen':[
       'Independent review of all role/owner/source/necessary-method decisions.',
       'Recover missing source outcomes; keep old ID and mastery decisions explicit in any split.',
       'Author reviewed atomic mathematics prerequisites in actual own modules, including integrated supplementation routes.',
       'Bind every required capability to actual reviewed stable IDs; no placeholder conversion by title similarity.',
       'Resolve historical MA920/CIT profile mapping and elective/experiment/language scope.',
       'Reconcile duplicate definitions by owner/reference; preserve original snapshots and hash history.',
       'Recompute direct plus contains-inherited effective sets for each exact scope; check target exclusion/prerequisite-only and both DAGs.',
       'Test that newly included unmastered prerequisites remain independent frontier candidates, never inferred mastered from dependents.',
       'Run current cross-subject author/reviewer workflow after integration; this inert file sets no active review/Goal status.'
    ]}
dump('requires-recipes.author.json',obj)
print(json.dumps(obj['counts'],ensure_ascii=False,indent=2))
