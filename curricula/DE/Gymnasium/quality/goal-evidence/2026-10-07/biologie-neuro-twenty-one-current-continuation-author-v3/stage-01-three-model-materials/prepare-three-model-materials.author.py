#!/usr/bin/env python3
"""Bounded inactive author preparation; writes only this new stage directory."""
import copy
import hashlib
import json
import shutil
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
OWN = Path(__file__).resolve().parent
REL = OWN.relative_to(ROOT).as_posix()
OLD = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06'
SRC = OLD / 'biologie-neuro-eight-missing-primary-scope-remediation-author-v2'
PRIOR = OLD / 'biologie-q2-neurobiology-twenty-one-source-p-author-remediation-v2'
SOURCE_B = OLD / 'biologie-neuro-eight-primary-scope-independent-b-v2'
CURRENT = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
KINDS = ROOT / 'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'
HEBB = '4f631f78-e13a-58e5-9092-f4db0b8d377a'
NET = 'a46cafde-7359-5249-8754-19aaa3174ba4'
LTP = 'c9a06264-cce2-54dd-9604-46dd5949f02e'
GENERAL = '347110a1-1d2e-5195-8acc-64e7e3893ce5'
IDS = [HEBB, NET, LTP]
NOW = datetime.now(timezone.utc).isoformat()
REVIEW_ID = 'biologie-neuro-three-distinct-model-materials-author-20261007-v3-stage01'
EXPECTED_CURRENT = '244d2889ddeeb69cbf97d0a320f3e38cf5444674f3bb17f3e46c0112ac6fbff1'

def digest(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def write(name, data):
    (OWN / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

def load(p):
    return json.loads(p.read_text())

def bind(p):
    return {'path': p.relative_to(ROOT).as_posix(), 'sha256': 'sha256:' + digest(p), 'bytes': p.stat().st_size}

def verify_freeze(p, expected):
    assert digest(p) == expected, (p, digest(p))
    manifest = load(p)
    files = manifest.get('files', [])
    verified = []
    for row in files:
        fp = Path(row['path'])
        if not fp.is_absolute():
            fp = ROOT / fp if row['path'].startswith('curricula/') else p.parent / fp
        assert fp.is_file(), fp
        assert digest(fp) == row['sha256'].removeprefix('sha256:'), fp
        if 'bytes' in row: assert fp.stat().st_size == row['bytes'], fp
        verified.append(bind(fp))
    return {'freeze': bind(p), 'verifiedOwnPayloadCount': len(verified), 'allListedOwnPayloadsExact': True, 'verifiedOwnPayloads': verified}

assert digest(CURRENT) == EXPECTED_CURRENT, 'Current baseline drift: stop, do not rebase silently.'
source_manifest = verify_freeze(SRC / 'eight-missing-primary-scope-remediation-author-v2.final.freeze.json', 'f6524feee0001b213f4575ee45d8627f5bac0b7e6b0db10d993f7a885082045a')
b_manifest = verify_freeze(SOURCE_B / 'independent-b-neuro-eight-source-role-followup-v2.final.freeze.json', 'c54eb48acff26a93bb14c56e13f18f5df626b6847bdcf8e42da6b0b2af3382c9')
prior_manifest = verify_freeze(PRIOR / 'author-neurobiology21-source-p-v2.final.freeze.json', '21b10e15fcefa5dff324423b0406e4246a7be9017c9fe9badec532428bfe3573')
wrapped = load(PRIOR / 'author-neurobiology21-source-p-v2.with-exact-rp-raw-source.final.freeze.json')
additive_verified = []
for row in wrapped['additiveFiles']:
    p = ROOT / row['path']
    assert digest(p) == row['sha256'].removeprefix('sha256:'), p
    additive_verified.append(bind(p))
assert digest(PRIOR / 'author-neurobiology21-source-p-v2.with-exact-rp-raw-source.final.freeze.json') == '1bb3bf75afe6682b0388bb0cb200afb0de1d5f52b82e82e66e41922cd419d391'

current = load(CURRENT)
rows = load(SRC / 'eight-current-goals.actual-primary-scope-and-DEEN-candidates.author-v2.json')['records']
source_rows = {row['goalId']: row for row in rows}
current_by = {g['id']: g for g in current['goals']}
prior_profiles = load(PRIOR / 'positive-evidence.author-v2.candidates.json')
prior_by = {g['goalId']: g for g in prior_profiles['goals']}
candidate = copy.deepcopy(current)
future_by = {g['id']: g for g in candidate['goals']}
source_name = ('Hessen: Kerncurriculum gymnasiale Oberstufe Biologie 2024, Q2.3, S. 43, '
               'zelluläre Prozesse des Lernens (Leistungskurs); Bayern: LehrplanPLUS Gymnasium '
               'Biologie 13, erhöhtes Anforderungsniveau, Lernbereich 2, funktionelle und '
               'strukturelle neuronale Plastizität. Didaktische Modellspezialisierung: ')
model_names = {HEBB: 'gegebene Hebb-Regel.', NET: 'plastische Änderungen wirksamer Netzverbindungen.', LTP: 'Langzeitpotenzierung und Langzeitdepression.'}
templates = []
for gid in IDS:
    assert current_by[gid] == source_rows[gid]['wholeCurrentGoalDEEN'], gid
    after = copy.deepcopy(source_rows[gid]['wholeCanonicalCandidateDEEN'])
    after['sourceRef'] = source_name + model_names[gid]
    if gid == NET: after['tags'] = ['LK']
    candidate['goals'][next(i for i, g in enumerate(candidate['goals']) if g['id'] == gid)] = after
    templates.append({'goalId': gid, 'wholeCurrentGoal': current_by[gid], 'wholeSourceV2Candidate': source_rows[gid]['wholeCanonicalCandidateDEEN'], 'wholeNewAuthorCandidate': after,
                      'boundedOfficialPrimaryComponents': source_rows[gid]['actualPrimaryComponents'],
                      'officialIndividualModelDuty': False, 'wholeOriginalSourceClosure': False,
                      'newIndependentD_P_AApproval': False, 'active': False})
future_by = {g['id']: g for g in candidate['goals']}
assert len(current['goals']) == len(candidate['goals']) == 472
assert [g['id'] for g in current['goals']] == [g['id'] for g in candidate['goals']]
changed_ids = [g['id'] for g in current['goals'] if g != future_by[g['id']]]
assert set(changed_ids) == set(IDS)
assert all(g.get('requires', []) == future_by[g['id']].get('requires', []) and g.get('contains', []) == future_by[g['id']].get('contains', []) for g in current['goals'])
assert current_by[GENERAL] == future_by[GENERAL]
write('three-whole-goal-current-source-v2-and-new-candidate.templates.json', templates)
write('current472-three-models-only.canonical.author-candidate.json', candidate)
write('current472.actual-baseline.snapshot.json', current)
write('general-347-whole-goal-and-prior-whole-positive-candidate.exact-comparison.json', {'wholeCurrentGoal': current_by[GENERAL], 'priorWholePositiveCandidate': prior_by[GENERAL], 'unchangedWithinThisStage': True, 'reReviewPerformed': False})

# All six cases are authored reference materials, not observed experiments or learner work.
cases = []
def add_case(gid, cid, title_de, title_en, task_de, task_en, answer_de, answer_en, data, focus_de, focus_en, limits_de, limits_en):
    cases.append({'goalId': gid, 'caseId': cid, 'materialType': 'authored_reference_model_or_dataset', 'titleDe': title_de, 'titleEn': title_en,
                  'taskDe': task_de, 'taskEn': task_en, 'referenceResponseDe': answer_de, 'referenceResponseEn': answer_en,
                  'structuredSuppliedData': data, 'understandingFocusDe': focus_de, 'understandingFocusEn': focus_en,
                  'limitsDe': limits_de, 'limitsEn': limits_en, 'actualExperimentConducted': False, 'copiedResearchMeasurements': False,
                  'actualLearnerEvidence': False, 'taskQuota': False, 'license': 'CC-BY-4.0'})

add_case(HEBB, 'initial-bounded-model', 'Zwei Verbindungen nach einer gegebenen Hebb-Regel', 'Two connections under a supplied Hebbian rule',
 'Ein künstliches Lernmodell besitzt die Eingänge A und B und die Ausgangszelle Y. Die dimensionslosen Anfangsgewichte sind wA=0,3 und wB=0,2. Für jede Runde ist die Lernregel Δwi=0,1·xi·y vorgegeben; das neue Gewicht ist das alte Gewicht plus Δwi. Die binären Aktivitäten sind vollständig gegeben, nicht aus den Gewichten zu berechnen: Runde 1: xA=1, xB=0, y=1; Runde 2: xA=0, xB=1, y=0; Runde 3: xA=1, xB=1, y=1. Bestimme beide Gewichte nach jeder Runde. Erkläre, weshalb die Aktivität von B in Runde 2 dessen Verbindung nicht verstärkt und welche lernähnliche Änderung die Regel modelliert. Benenne eine konkrete Grenze der Aussage.',
 'An artificial learning model has inputs A and B and output cell Y. Initial dimensionless weights are wA=0.3 and wB=0.2. Each round uses the supplied learning rule Δwi=0.1·xi·y; the new weight is the old weight plus Δwi. The binary activities are fully supplied, not to be computed from the weights: round 1: xA=1, xB=0, y=1; round 2: xA=0, xB=1, y=0; round 3: xA=1, xB=1, y=1. Determine both weights after each round. Explain why activity of B in round 2 does not strengthen its connection and which learning-like change the rule models. State a specific inference limit.',
 'Nach den drei Runden ergeben sich (wA,wB)=(0,4;0,2), (0,4;0,2), (0,5;0,3). Bei B ist in Runde 2 y=0, somit ist xB·y=0 trotz aktivem Eingang. Die Regel verstärkt im Modell Verbindungen bei gemeinsam gegebener prä- und postsynaptischer Aktivität. Es gibt hier keine Regel für die Erzeugung der Ausgangsaktivität und keine Gewichtseinheiten einer realen Synapse; die Rechnung belegt weder eine reale Erinnerung noch ein allgemeines biologisches Lerngesetz.',
 'After the three rounds, (wA,wB)=(0.4,0.2), (0.4,0.2), (0.5,0.3). For B in round 2, y=0, so xB·y=0 despite the active input. In this model the rule strengthens connections when supplied pre- and postsynaptic activity co-occurs. No rule for producing output activity or units of a real synaptic weight is supplied; the calculation demonstrates neither a real memory nor a universal biological learning law.',
 {'initialWeights': {'A': 0.3, 'B': 0.2}, 'eta': 0.1, 'rounds': [{'xA': 1, 'xB': 0, 'y': 1}, {'xA': 0, 'xB': 1, 'y': 0}, {'xA': 1, 'xB': 1, 'y': 1}], 'activitiesSuppliedNotPredicted': True, 'weightUnit': 'dimensionless'},
 'Regel an einem gegebenen Netz anwenden und gemeinsame Aktivität von bloßer Eingangsaktivität unterscheiden.',
 'Apply a rule to a supplied network and distinguish co-activity from input activity alone.',
 'Kein freies Erinnern einer universellen Hebb-Regel, keine reale Versuchsdurchführung und keine Ausgangsvorhersage ohne zusätzliche Regel.',
 'No recall of a universal Hebbian rule, no real experiment and no output prediction without an additional rule.')

add_case(HEBB, 'fresh-contextual-transfer', 'Eine zusätzliche Obergrenze verändert das Lernmodell', 'An added upper bound changes the learning model',
 'Ein neues künstliches Netz hat wA=0,8, wB=0,2 und die vorgegebene Regel Δwi=0,2·xi·y. In zwei aufeinanderfolgenden Runden sind xA=1, xB=0 und y=1 gegeben. Variante U addiert den Zuwachs ohne Obergrenze. Variante K benutzt zusätzlich ausdrücklich wi,neu=min(1; wi,alt+Δwi). Bestimme in beiden Varianten die Gewichte nach jeder Runde, vergleiche die Vorhersagen und erkläre, welche Begrenzung K einführt. Würde U bei beliebig vielen gleichartigen Runden eine biologische Begrenzung darstellen? Begründe und trenne die ursprüngliche Regel von der neuen Modellannahme.',
 'A fresh artificial network has wA=0.8, wB=0.2 and the supplied rule Δwi=0.2·xi·y. Two successive rounds have supplied activities xA=1, xB=0 and y=1. Variant U adds the increment without an upper bound. Variant K explicitly adds wi,new=min(1, wi,old+Δwi). Determine both weights after each round in both variants, compare predictions and explain the constraint introduced by K. Would U represent a biological limit over arbitrarily many similar rounds? Justify and distinguish the original rule from the new modelling assumption.',
 'U ergibt (1,0;0,2) und (1,2;0,2), K ergibt zweimal (1,0;0,2). B bleibt unverändert, weil xB=0. Die Obergrenze begrenzt die Verbindungsstärke im ausdrücklich ergänzten Modell K; U wächst bei wiederholter gemeinsamer Aktivität unbegrenzt. Das ist eine konkrete Grenze dieses einfachen Modells, keine Messung biologischer Gewichte. Die K-Grenze 1 ist eine zusätzliche Annahme und folgt nicht aus der Hebb-Regel selbst.',
 'U yields (1.0,0.2) and (1.2,0.2); K yields (1.0,0.2) twice. B is unchanged because xB=0. The bound constrains connection strength in the explicitly extended model K; U grows without bound under repeated co-activity. This is a concrete limitation of the simple model, not a measurement of biological weights. K’s bound of 1 is an added assumption and does not follow from the Hebbian rule itself.',
 {'initialWeights': {'A': 0.8, 'B': 0.2}, 'eta': 0.2, 'rounds': [{'xA': 1, 'xB': 0, 'y': 1}, {'xA': 1, 'xB': 0, 'y': 1}], 'suppliedAlternativeUpperBound': 1, 'weightUnit': 'dimensionless'},
 'Frischer Transfer verändert eine Modellbedingung, nicht nur Zahlen; eine Vorhersage wird mit ihrer zusätzlichen Annahme verknüpft.',
 'Fresh transfer changes a model condition, not just numbers; connect a prediction to its added assumption.',
 'Die Zahl 1 ist kein amtlicher oder allgemeiner biologischer Sättigungswert. Aus dem Gewicht wird kein tatsächlicher Lernerfolg abgeleitet.',
 'The value 1 is neither an official nor a universal biological saturation value. Weight changes do not establish actual learning success.')

add_case(NET, 'initial-bounded-model', 'Gleiche Eingänge bei vorgegebenen plastischen Verbindungsänderungen', 'Identical inputs under supplied plastic connection changes',
 'Ein ausdrücklich vereinfachtes neuronales Plastizitätsmodell beschreibt den Testwert u=−70 mV+wA·xA+wB·xB. Die binären Eingänge xA und xB sind gegeben; die Gewichte geben den wirksamen Beitrag in mV bei aktivem Eingang an. Das Modell erzeugt genau dann ein Ausgangssignal, wenn u≥−55 mV. Es vernachlässigt die zeitliche Dynamik und beschreibt kein vollständiges Aktionspotenzial. Das Material gibt eine nach einer Trainingsphase anhaltende Verbindungsänderung vor: vorher wA=6 mV, wB=10 mV; danach wA=16 mV, wB=10 mV. Teste dieselben drei Eingangsmuster (1,0), (0,1), (1,1) vorher und danach. Erkläre, welches Ausgangsverhalten sich durch die gegebene Änderung verändert und weshalb dieser Vergleich keinen bestimmten molekularen Lernmechanismus beweist.',
 'An explicitly simplified neural plasticity model describes the test value u=−70 mV+wA·xA+wB·xB. Binary inputs xA and xB are supplied; each weight is the effective contribution in mV when its input is active. The model produces an output signal exactly when u≥−55 mV. It omits temporal dynamics and does not describe a complete action potential. The material supplies a persistent connection change after training: before wA=6 mV, wB=10 mV; after wA=16 mV, wB=10 mV. Test the same three input patterns (1,0), (0,1), (1,1) before and after. Explain which output behaviour changes because of the supplied connection change and why the comparison does not establish a particular molecular learning mechanism.',
 'Für (1,0) ist u vorher −64 mV ohne und danach −54 mV mit Ausgangssignal. Für (0,1) bleibt u=−60 mV ohne Ausgang. Für (1,1) ergeben sich −54 und −44 mV, jeweils mit Ausgang. Die anhaltend wirksamere Verbindung A bewirkt somit bei unverändertem A-Eingang das Überschreiten der gegebenen Schwelle; B allein bleibt ohne Ausgang. Gleiche Eingänge, Grundwert und Schwelle erlauben diesen kontrollierten Modellvergleich. Die Verbindung wurde im Material als verändert vorgegeben; weder die Ursache dieser Änderung noch eine reale Erinnerung folgt aus der Rechnung.',
 'For (1,0), u is −64 mV with no output before and −54 mV with output after. For (0,1), u remains −60 mV with no output. For (1,1), values are −54 and −44 mV, both producing output. Thus the persistently more effective connection A crosses the supplied threshold for the unchanged A input; B alone still produces no output. Fixed inputs, baseline and threshold permit this controlled model comparison. The changed connection is supplied in the material; its cause and a real memory do not follow from the calculation.',
 {'baselineMv': -70, 'outputThresholdMv': -55, 'beforeWeightsMv': {'A': 6, 'B': 10}, 'afterWeightsMv': {'A': 16, 'B': 10}, 'identicalInputsBeforeAfter': [[1, 0], [0, 1], [1, 1]], 'persistentChangeSuppliedAfterTraining': True, 'updateRuleRequired': False},
 'Gegebene Verbindungszustände bei identischen Inputs vergleichen und den veränderten Verarbeitungseffekt erklären.',
 'Compare supplied connection states with identical inputs and explain the changed processing effect.',
 'Vereinfachtes Schwellenmodell; weder Hebb-Gewichte erzeugen noch die reale molekulare Ursache oder ein vollständiges AP bestimmen.',
 'Simplified threshold model; do not generate Hebbian weights or determine the real molecular cause or a complete action potential.')

add_case(NET, 'fresh-contextual-transfer', 'Anhaltend stärkere Hemmung im selben Modell', 'Persistently stronger inhibition in the same model',
 'Ein zweites gegebenes Plastizitätsmodell benutzt u=−70 mV+wA·xA+wI·xI und dieselbe Ausgangsschwelle −55 mV. A ist erregend, I hemmend. Der Materialvergleich nach zwei Trainingsbedingungen gibt jeweils anhaltende Verbindungszustände vor; der Testinput bleibt xA=xI=1. Zustand P hat wA=16 mV und wI=−1 mV. Zustand Q hat ebenfalls wA=16 mV, aber wI=−6 mV. Erkläre anhand beider Testwerte, weshalb die starke erregende Verbindung A keinen sicheren Ausgang garantiert. Welche Änderung erklärt hier den Unterschied? Welche zusätzliche Beobachtung wäre nötig, um statt einer wirksamen Verstärkung eine neu gebildete Verbindung zu behaupten?',
 'A second supplied plasticity model uses u=−70 mV+wA·xA+wI·xI and the same output threshold of −55 mV. A is excitatory and I inhibitory. After two training conditions the material supplies persistent connection states; test input stays xA=xI=1. State P has wA=16 mV and wI=−1 mV. State Q also has wA=16 mV but wI=−6 mV. Use both test values to explain why the strong excitatory connection A does not guarantee output. Which change explains the difference here? What additional observation would be needed to claim a newly formed connection rather than a change in effective strength?',
 'P ergibt −55 mV und erreicht genau die gegebene Schwelle; Q ergibt −60 mV und bleibt darunter. Bei gleichem Testinput und unverändertem erregendem Beitrag erklärt die im Material vorgegebene stärkere Hemmung das Ausbleiben des Ausgangs. Die Gesamtverarbeitung hängt von gemeinsam wirksamen Verbindungen ab. Aus einem anderen wirksamen Gewicht folgt keine neue Kontaktstelle; dafür wäre etwa ein gegebener struktureller Vorher-nachher-Befund erforderlich. Das Modell liefert keinen Nachweis einer bestimmten realen Erinnerung.',
 'P yields −55 mV, exactly reaching the supplied threshold; Q yields −60 mV, below it. With unchanged test input and excitatory contribution, the supplied stronger inhibition explains the absence of output. Overall processing depends on jointly effective connections. A different effective weight does not establish a new contact; that would require, for example, supplied structural before-and-after evidence. The model does not demonstrate a particular real memory.',
 {'baselineMv': -70, 'outputThresholdMv': -55, 'sameInput': {'A': 1, 'I': 1}, 'statePWeightsMv': {'A': 16, 'I': -1}, 'stateQWeightsMv': {'A': 16, 'I': -6}, 'persistentTrainingConditionDifferencesSupplied': True, 'structuralDataSupplied': False},
 'Ein qualitativer Kontextwechsel zu Hemmung überprüft denselben kontrollierten Netzwerkvergleich; funktionelle und strukturelle Schlussgrenzen bleiben sichtbar.',
 'Changing context to inhibition tests the same controlled network comparison; functional and structural inference limits remain explicit.',
 'Kein beliebiger Läsionsfall und keine ungemessene Strukturänderung; alle anhaltenden wirksamen Zustände sind vorgegeben.',
 'No arbitrary lesion case or unmeasured structural change; all persistent effective states are supplied.')

add_case(LTP, 'initial-bounded-model', 'Langfristig verstärkte synaptische Antwort mit Kontrollpfad', 'Long-lasting stronger synaptic response with a control pathway',
 'Die folgenden Zahlen sind ein erstellter schulischer Referenzdatensatz, keine durchgeführten Messungen. In einer beschriebenen Präparation wird die synaptische Antwort zweier unabhängiger Eingangswege auf denselben schwachen Testreiz verglichen. Im Weg T findet zwischen Basiswert und Minute 5 eine Trainingsserie statt; Weg C bleibt ohne diese Serie. Alle Testreize eines Wegs haben unveränderte Stärke und Frequenz. Die mitgelieferte Verfahrensbeschreibung nennt unverändertes Ruhepotenzial, unveränderten Zugangswiderstand der Ableitung und unveränderte präsynaptische Testantwort. Antwortamplituden in relativen Einheiten, Zeiten Basis/5/30/60 Minuten: T: 2,0/3,2/3,1/3,2; C: 2,0/2,0/1,98/2,0. Ordne den Verlauf ein, begründe die Rolle des Kontrollwegs und erläutere, weshalb der Befund als Modell eines zellulären Lernprozesses dienen kann. Benenne die Aussagegrenze zur Dauer, Ursache und tatsächlichen Erinnerung.',
 'The following values are an authored school reference dataset, not measurements that were conducted. In a described preparation, the synaptic responses of two independent input pathways to the same weak test stimulus are compared. Path T receives a training series between baseline and minute 5; path C receives no such series. All test stimuli within a pathway have unchanged strength and frequency. The supplied procedure states unchanged resting potential, unchanged recording access resistance and unchanged presynaptic test response. Response amplitudes in relative units, times baseline/5/30/60 minutes: T: 2.0/3.2/3.1/3.2; C: 2.0/2.0/1.98/2.0. Classify the time course, explain the control pathway and explain why the finding can model a cellular learning process. State limits concerning duration, cause and actual memory.',
 'T bleibt über 60 Minuten gegenüber seinem Basiswert verstärkt, C bleibt annähernd konstant. Das passt unter den gegebenen Testbedingungen zu einer langfristigen Potenzierung der untersuchten synaptischen Wirksamkeit (LTP). Optionales Normieren ergibt für T 160/155/160 % des Basiswerts; die Zahlen allein sind kein statistischer Signifikanztest. Der unveränderte Test und Kontrollweg sprechen gegen einen allgemeinen Messdrift oder bloß stärkeren Testreiz. Aktivitätsabhängig anhaltend veränderte Übertragung kann einen Aspekt zellulären Lernens modellieren. Die Daten belegen nur den beobachteten Zeitraum; sie zeigen weder eine bestimmte molekulare Ursache noch eine gespeicherte menschliche Erinnerung oder sämtliche Lernprozesse.',
 'T remains stronger than baseline across 60 minutes while C is approximately constant. Under the supplied test conditions this is consistent with long-term potentiation of the studied synaptic efficacy (LTP). Optional normalization gives T 160/155/160% of baseline; the numbers alone are not a statistical significance test. Unchanged testing and the control path argue against general measurement drift or merely stronger test stimulation. Activity-dependent persistent changes in transmission can model one aspect of cellular learning. The data establish only the observed period, not a particular molecular cause, a stored human memory or all learning processes.',
 {'timeMinutes': [0, 5, 30, 60], 'pathT': [2.0, 3.2, 3.1, 3.2], 'controlC': [2.0, 2.0, 1.98, 2.0], 'unit': 'relative response amplitude', 'sameTestWithinEachPath': True, 'stableRestingAndAccessResistanceAndPresynapticResponseSupplied': True, 'replicateStatisticsSupplied': False},
 'Gegebenen anhaltenden Verstärkungsbefund mit seinem Kontrollvergleich und seiner Schlussgrenze einordnen.',
 'Interpret a supplied persistent-strengthening finding with its control comparison and inference limit.',
 'Keine Versuchsdurchführung, statistische Pflichtrechnung, molekulare Kaskade oder Aussage über unbeobachtete Dauer.',
 'No experiment, required statistical calculation, molecular cascade or claim about an unobserved duration.')

add_case(LTP, 'fresh-contextual-transfer', 'LTD, vorübergehende Abschwächung und stärkerer Testreiz', 'LTD, transient weakening and stronger test stimulation',
 'Ein neuer erstellter Referenzdatensatz vergleicht drei getrennt beschriebene Ansätze mit Amplituden in relativen Einheiten, jeweils Basis/5/30/60 Minuten. Ansatz D erhält eine beschriebene Trainingsserie: D=4,0/2,0/2,1/2,0, passender Kontrollweg CD=4,0/4,0/4,0/4,0. Ansatz R erhält eine andere Trainingsserie: R=4,0/2,0/3,7/4,0, Kontrollweg CR=4,0/4,0/4,0/4,0. Bei D und R bleiben Teststärke, Testfrequenz, Ruhepotenzial, Zugangswiderstand und präsynaptische Testantwort laut Verfahrensbeschreibung unverändert. Im getrennten Ansatz S wird ohne Trainingsserie der Testreiz nach dem Basiswert absichtlich stärker eingestellt; seine Antwort ist S=4,0/6,0/6,0/6,0. Ordne D und R anhand ihrer Dauer ein. Erkläre, weshalb S trotz später höherer Antwort keinen LTP-Befund unter gleichen Testbedingungen liefert. Begründe die Bedeutung und Grenzen langfristiger Abschwächung als zelluläres Lernmodell.',
 'A fresh authored reference dataset compares three separately described conditions, with amplitudes in relative units at baseline/5/30/60 minutes. Condition D receives a described training series: D=4.0/2.0/2.1/2.0, matched control CD=4.0/4.0/4.0/4.0. Condition R receives a different series: R=4.0/2.0/3.7/4.0, control CR=4.0/4.0/4.0/4.0. For D and R the procedure supplies unchanged test strength, test frequency, resting potential, access resistance and presynaptic test response. In separate condition S, test stimulation is deliberately increased after baseline without a training series; S=4.0/6.0/6.0/6.0. Classify D and R by duration. Explain why S, despite its higher later response, does not provide LTP evidence under identical test conditions. Explain the relevance and limits of long-term weakening as a cellular learning model.',
 'D bleibt bei ungefähr der halben Basisamplitude über 60 Minuten abgeschwächt, bei stabilem Kontrollweg und gleichem Test: vereinbar mit LTD. R erholt sich auf den Basiswert; hier ist nur eine vorübergehende Abschwächung belegt, keine anhaltende LTD im beobachteten späteren Zeitraum. Bei S ist die Testbedingung verändert; daraus lässt sich keine stärkere synaptische Wirksamkeit unter gleichem Eingang ableiten. Sowohl Verstärkung als auch Abschwächung können anhaltende aktivitätsabhängige Änderungen und damit Modelle zellulären Lernens sein. Kein Verlauf allein beweist Vergessen, eine bestimmte molekulare Ursache oder eine konkrete menschliche Gedächtnisleistung.',
 'D stays near half its baseline amplitude across 60 minutes, with a stable control and unchanged test: consistent with LTD. R recovers to baseline, establishing transient weakening rather than persistent LTD during the later observed period. S changes the test condition, so it does not establish stronger synaptic efficacy for the same input. Both strengthening and weakening can be persistent activity-dependent changes and therefore cellular learning models. No time course alone establishes forgetting, a particular molecular cause or a specific human memory performance.',
 {'timeMinutes': [0, 5, 30, 60], 'pathD': [4.0, 2.0, 2.1, 2.0], 'controlD': [4.0, 4.0, 4.0, 4.0], 'pathR': [4.0, 2.0, 3.7, 4.0], 'controlR': [4.0, 4.0, 4.0, 4.0], 'pathS': [4.0, 6.0, 6.0, 6.0], 'sameTestWithinD_R': True, 'testChangedForS': True, 'unit': 'relative response amplitude'},
 'Frischer Transfer trennt Abschwächungsdauer und geänderte Testbedingung; ein höherer oder niedrigerer Einzelwert genügt nicht.',
 'Fresh transfer separates weakening duration from a changed test condition; a single higher or lower value is insufficient.',
 'LTD wird nicht mit tatsächlichem Vergessen gleichgesetzt; der Kontrollvergleich liefert keine eigenständige molekulare Erklärung.',
 'LTD is not equated with actual forgetting; the control comparison does not independently explain a molecular mechanism.')

write('six-complete-DEEN-reference-materials.author-candidates.json', {'schemaVersion': 1, 'authoredAtUTC': NOW, 'role': 'author candidate', 'goals': IDS, 'cases': cases, 'license': 'CC-BY-4.0', 'actualLearnerEvidence': False, 'humanApproval': False})

def expectation(eid, ud, ue, pd, pe):
    return {'id': eid, 'essentialUnderstandingDe': ud, 'essentialUnderstandingEn': ue, 'observablePerformanceDe': pd, 'observablePerformanceEn': pe}

expectations = {
 HEBB: [expectation('supplied-rule-network-update', 'Eine vorgegebene Hebb-Regel ordnet gemeinsam gegebener Eingangs- und Ausgangsaktivität eine Änderung der Modellverbindung zu; bloße Eingangsaktivität reicht in dieser Regel nicht aus.', 'A supplied Hebbian rule assigns a model connection change to supplied co-occurring input and output activity; input activity alone does not suffice under this rule.', 'Die lernende Person bestimmt an einem gegebenen einfachen Netz die Verbindungsgewichte nach mehreren Aktivitätsrunden und erklärt die unterschiedlichen Änderungen aus den gegebenen Aktivitäten.', 'The learner determines connection weights in a supplied simple network after several activity rounds and explains the different changes from the supplied activities.'),
        expectation('added-condition-and-model-limit', 'Die einfache Regel ist ein begrenztes Lernmodell. Eine ergänzte Obergrenze verändert ihre Vorhersage, folgt aber nicht aus der ursprünglichen Regel und stellt keinen universellen biologischen Gewichtswert dar.', 'The simple rule is a bounded learning model. An added upper bound changes its prediction but does not follow from the original rule or represent a universal biological weight value.', 'Die lernende Person vergleicht selbstständig die unbeschränkte Regel mit einer ausdrücklich gegebenen beschränkten Variante und erläutert eine konkrete Modellgrenze, ohne reales Lernen aus der Rechnung zu behaupten.', 'The learner independently compares the unbounded rule with an explicitly supplied bounded variant and explains a specific model limit without claiming real learning from the calculation.')],
 NET: [expectation('identical-input-connection-comparison', 'Bei konstantem Input und gegebener Schwelle können anhaltende Änderungen wirksamer Verbindungen die Verarbeitung verändern. Erregende und hemmende Beiträge wirken im gegebenen Modell gemeinsam.', 'With constant input and a supplied threshold, persistent changes in effective connections can change processing. Excitatory and inhibitory contributions act together in the supplied model.', 'Die lernende Person erklärt anhand gegebenen plastischen Vorher-nachher-Verbindungszuständen, wie gleiche neue Eingangsmuster unterschiedliche Ausgänge erhalten, und begründet einen Gegenfall mit stärkerer Hemmung.', 'The learner uses supplied plastic before-and-after connection states to explain how identical fresh input patterns produce different outputs and justifies a counterexample with stronger inhibition.'),
        expectation('effective-versus-structural-boundary', 'Gegebene wirksame Gewichte begründen den Vergleich im Modell; sie allein beweisen weder neue Kontaktstellen, den molekularen Entstehungsmechanismus noch eine tatsächliche Erinnerung.', 'Supplied effective weights justify the model comparison; alone they establish neither new contacts, the molecular mechanism producing the change nor an actual memory.', 'Die lernende Person benennt im konkreten Netzvergleich die kontrollierten Bedingungen und begrenzt den Schluss; eine behauptete neue Verbindung verlangt einen zusätzlichen strukturellen Befund.', 'The learner identifies controlled conditions in the specific network comparison and limits the inference; a claim of a new connection requires additional structural evidence.')],
 LTP: [expectation('persistent-efficacy-finding-with-control', 'Eine anhaltend höhere oder niedrigere synaptische Antwort unter gleichen Testbedingungen und mit geeignetem Kontrollvergleich kann LTP beziehungsweise LTD stützen; kurzfristige Änderung oder ein stärkerer Testreiz reichen nicht.', 'A persistently higher or lower synaptic response under identical test conditions with an appropriate control comparison can support LTP or LTD, respectively; a transient change or stronger test stimulation does not suffice.', 'Die lernende Person ordnet neue gegebene Zeitreihen mit Kontrollpfaden als anhaltende Verstärkung, anhaltende Abschwächung, vorübergehende Änderung oder nicht vergleichbaren Test ein und begründet die Einordnung aus Material und Verfahrensbedingungen.', 'The learner interprets fresh supplied time courses with control pathways as persistent strengthening, persistent weakening, transient change or a non-comparable test and justifies the interpretation from the material and procedure.'),
        expectation('bounded-cellular-learning-model', 'Anhaltende aktivitätsabhängige Änderungen synaptischer Wirksamkeit sind Modelle eines Aspekts zellulären Lernens; ein Befund allein identifiziert weder eine molekulare Ursache noch eine konkrete menschliche Erinnerung oder unbeobachtete Dauer.', 'Persistent activity-dependent changes in synaptic efficacy model an aspect of cellular learning; a finding alone identifies neither a molecular cause, a particular human memory nor an unobserved duration.', 'Die lernende Person erläutert die Bedeutung des konkret gegebenen LTP/LTD-Befunds als zelluläres Lernmodell und nennt materialbezogene Grenzen einschließlich beobachteter Dauer und unveränderter Testbedingungen.', 'The learner explains the supplied LTP/LTD finding’s relevance as a cellular learning model and states material-specific limits including the observed duration and unchanged test conditions.')]
}
axes = {
 HEBB: [('activity-correlation', 'Gemeinsame Aktivität gegenüber aktiven Eingängen ohne aktive Ausgangszelle.', 'Co-activity versus active inputs without an active output cell.'), ('bounded-update-condition', 'Dieselbe Regel mit ausdrücklich ergänzter Sättigungsgrenze; Vorhersage und Annahme trennen.', 'The same rule with an explicitly added saturation bound; separate prediction and assumption.')],
 NET: [('controlled-input-pattern', 'Identische verschiedene Eingangsmuster bei gegebener anhaltender Verbindungsänderung vergleichen.', 'Compare different identical input patterns under a supplied persistent connection change.'), ('inhibitory-counterexample', 'Stärkere Hemmung bei unverändertem erregendem Beitrag und gleichbleibender Schwelle.', 'Stronger inhibition with unchanged excitatory contribution and fixed threshold.')],
 LTP: [('sign-and-duration', 'Verstärkung oder Abschwächung; anhaltender gegenüber erholtem Verlauf bei gleichen Testbedingungen.', 'Strengthening or weakening; persistent versus recovered time course under identical tests.'), ('control-and-test-condition', 'Geeigneter Kontrollweg gegenüber absichtlich stärkerem Testreiz ohne Trainingsserie.', 'Appropriate control pathway versus deliberately stronger testing without a training series.')]
}
new_profiles = []
for gid in IDS:
    own_cases = [c for c in cases if c['goalId'] == gid]
    profile = {'archetype': 'data' if gid == LTP else 'modeling', 'expectations': expectations[gid],
               'coverageExpectations': {'requiredExpectationIds': [e['id'] for e in expectations[gid]], 'alternativeExpectationGroups': [], 'minimumIndependentDemonstrations': 2, 'freshVariationRequired': True, 'independentTransferRequired': True},
               'variationAxes': [{'id': a, 'textDe': d, 'textEn': e} for a, d, e in axes[gid]],
               'applicationCaseBriefs': [{'id': c['caseId'], 'taskDemandDe': c['taskDe'], 'taskDemandEn': c['taskEn'], 'expectedPerformanceDe': c['referenceResponseDe'], 'expectedPerformanceEn': c['referenceResponseEn'], 'understandingFocusDe': c['understandingFocusDe'], 'understandingFocusEn': c['understandingFocusEn']} for c in own_cases]}
    new_profiles.append({'goalId': gid, 'reason': 'New bounded author candidate with complete paired DE/EN supplied reference materials and distinct model operations. Source-role judgments do not approve this native positive profile. No observed learner work or independent D/P/A/V approval.',
                         'evidenceLevel': 'E1', 'maximumClaimScope': 'G1', 'dissent': ['Independent scientific D/P and formal atomicity review remain pending.', 'HE/BY parent plasticity duties do not name these three models as separately compulsory bullets; no GK or additional country source approval.', 'No primary goal visualization exists; no V, strict M7, human approval or human trial claim.'], 'profile': profile})
candidate_set = {'schemaVersion': 1, 'authoringContract': 'positive-understanding-evidence-candidates-v1', 'reviewId': REVIEW_ID, 'reviewedAt': NOW, 'reviewer': 'Codex direct author /root/chemie_current_four_and_coordinate_native_d_independent_a; model identifier not supplied', 'goals': new_profiles}
write('positive-evidence.three-models.author-candidates.json', candidate_set)
config = copy.deepcopy(load(PRIOR / 'positive-evidence.author-v2.config.json'))
config.update({'reviewId': REVIEW_ID, 'landscapePath': REL + '/current472-three-models-only.canonical.author-candidate.json', 'semanticKindLedgerPath': REL + '/semantic-kinds.current472.three-model-binding.author-candidate.json', 'reviewPath': REL + '/positive-evidence.three-models.actual.author-candidate.jsonl', 'reviewRunManifestPaths': [], 'reviewedResourceTypes': [], 'requireApproved': False, 'scope': {'label': 'Three supplied distinct LK cellular learning models; authored reference cases; independent science pending', 'goalIds': IDS}})
write('positive-evidence.three-models.native.config.json', config)

roles = [
 {'goalId': GENERAL, 'operatorDe': 'erläutern', 'materialOperation': 'Explain functional versus structural cellular changes from supplied findings.', 'preservedWholeGoalAndPriorWholeP': True, 'newMaterialWritten': False},
 {'goalId': HEBB, 'operatorDe': 'vorgegebene Regel anwenden und Möglichkeiten/Grenzen erläutern', 'materialOperation': 'Generate connection changes from supplied activity and update rule; compare added saturation condition.', 'modelInput': 'activities plus supplied learning rule', 'learnerOutput': 'successive weights plus bounded explanation', 'differenceFromGeneral': 'An explicit rule is applied, not just a general cellular change explained.', 'doesNotRequire': ['free recall of Hebbian laws', 'predict output activity without a supplied rule', 'identify LTP/LTD from these weights']},
 {'goalId': NET, 'operatorDe': 'an gegebenen Netzmodellen erklären', 'materialOperation': 'Compare given persistent connection states with identical inputs; explain output difference and inhibitory counterexample.', 'modelInput': 'connection states plus identical test patterns and given threshold', 'learnerOutput': 'controlled input/connection/output comparison', 'differenceFromGeneral': 'Effects of given connection changes on network processing are compared; weights are not generated.', 'doesNotRequire': ['Hebbian update rule', 'infer molecular training cause', 'interpret empirical LTP protocol']},
 {'goalId': LTP, 'operatorDe': 'anhand gegebener Beschreibungen/Versuchsbefunde einordnen und erläutern', 'materialOperation': 'Interpret controlled time courses of strengthening, weakening, recovery and changed test conditions.', 'modelInput': 'authored reference data plus explicit test/control conditions', 'learnerOutput': 'bounded LTP/LTD-compatible inference and cellular-learning-model interpretation', 'differenceFromGeneral': 'Temporal empirical-model inference uses controlled same-test conditions and opposing/transient outcomes.', 'doesNotRequire': ['conduct real experiment', 'recall molecular LTP cascade', 'claim learning or forgetting by a real person']}
]
write('three-distinct-model-operations-and-347-preservation.author-rationale.json', {'records': roles, 'partialConceptualOverlapExplicit': True, 'threeNamesAreNotSeparateOfficialDuties': True, 'formalNativeAtomicityApproval': False, 'sourceRoute': ['HE/SekII/LK/Q2.3 physical43 printed43', 'BY/G9/SekII/year13/elevated-level LB2'], 'historicalGKTagDoesNotEstablishGKSource': True, 'a46TagsProposedLKOnly': True})
write('three-models-actual-whole-object-and-edge-deltas.author.json', {'currentCanonical': bind(CURRENT), 'candidateCanonical': bind(OWN / 'current472-three-models-only.canonical.author-candidate.json'), 'currentWholeCount': 472, 'candidateWholeCount': 472, 'sameOrderedIds': True, 'changedWholeGoalIds': changed_ids, 'unchangedWholeGoalCount': 469, 'all472RequiresAndContainsExact': True, 'whole347Exact': True, 'changedFieldPaths': {g: [k for k in sorted(set(current_by[g]) | set(future_by[g])) if current_by[g].get(k) != future_by[g].get(k)] for g in IDS}, 'sourceV2ToOwnAdditionalFields': {HEBB: ['/sourceRef'], NET: ['/sourceRef', '/tags'], LTP: ['/sourceRef']}, 'activeWrites': False, 'scienceReviewFromFingerprints': False})

write('bounded-primary-and-research-reading.author-receipt.json', {
 'role': 'author primary and scientific countercheck; not independent review',
 'actualPrimaryReading': [
  {'source': 'HE KC2024 Biology', 'path': 'primary/HE43.actual-raster.png', 'physicalPage': 43, 'printedPage': 43, 'actualMethod': 'view_image actual retained raster, then actual extracted page text', 'boundedComponent': 'LK cellular learning; HE33 compulsory Q2 topics1 and3', 'separateMandatoryModelNames': False},
  {'source': 'BY LehrplanPLUS Biology13 elevated-level LB2', 'path': 'primary/BY13-EA.neural-section.actual-read.txt', 'actualMethod': 'read retained complete original neural section competency and content lists', 'boundedComponents': ['competency10 need for neural plasticity', 'content11 functional and structural neural plasticity'], 'officialCourseHeading': 'erhöhtes Anforderungsniveau', 'repositoryLKIsProjectionLabel': True}],
 'researchCountercheck': {'citation': 'Bi GQ and Poo MM (1998). Synaptic Modifications in Cultured Hippocampal Neurons: Dependence on Spike Timing, Synaptic Strength, and Postsynaptic Cell Type. Journal of Neuroscience 18(24):10464–10472.', 'url': 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6793365/', 'doi': '10.1523/JNEUROSCI.18-24-10464.1998', 'actualMethod': 'web open primary PMC full paper; abstract, methods, results and timing-condition discussion actually read', 'readSummary': 'The culture findings depend on timing, initial strength and cell type. Stable baseline testing and controlled test conditions matter when interpreting lasting increases or decreases in transmission. The paper therefore supports treating a simple co-activity rule as limited and interpreting efficacy time courses under stated controls. It does not supply the invented numerical datasets in this packet, a universal one-hour definition of long-term plasticity, or an official curriculum duty.', 'ourNumericalDataCopiedFromPaper': False},
 'failedOrPartialRetrievals': [{'url': 'https://pmc.ncbi.nlm.nih.gov/articles/PMC49082/', 'actualResult': 'web open returned reCAPTCHA; full paper not read and not used as full-text evidence'}],
 'noResearchTestQuotaOrMolecularRequirementAdded': True,
 'preparationReadErrorHistory': [{'operation': 'read prior author-profiles.data.json using goalId', 'result': 'KeyError: rows use short, not goalId', 'correction': 'inspect actual keys and address by short; no input changed'}],
 'newIndependentScientificApprovals': 0})

original_primary = OLD / 'biologie-neuro-eight-missing-primary-scope-remediation-author-v1/primary'
(OWN / 'primary').mkdir(exist_ok=True)
for name in ['HE43.actual-raster.png', 'HE43.actual-text.txt', 'BY13-EA.neural-section.actual-read.txt']:
    shutil.copyfile(original_primary / name, OWN / 'primary' / name)
write('source-freezes-and-exact-history.author-verification.json', {'sourceV2': source_manifest, 'sourceBFollowupV2': b_manifest, 'oldSourcePBaseV2': prior_manifest, 'oldSourcePWrapperV2': bind(PRIOR / 'author-neurobiology21-source-p-v2.with-exact-rp-raw-source.final.freeze.json'), 'oldSourcePAdditivePayloadCount': len(additive_verified), 'oldSourcePAdditivePayloadsExact': additive_verified, 'historicalVerdictsNotRewrittenOrRelabeled': True})

external_paths = [CURRENT, KINDS, SRC / 'eight-current-goals.actual-primary-scope-and-DEEN-candidates.author-v2.json', SRC / 'remaining-whole-source-operator-and-model-role-obligations.author-v2.json', SRC / 'eight-current-whole-goals-two-text-corrections-and-NW-G9-native-routing.raw-author-v2-review-input.json', SRC / 'conditional-current390-full-catalogue.actual.book-model.json', SRC / 'conditional-current390-source-atlas.actual.book-model.json', SRC / 'all22-actual-ordered-targets-and-residual-whole-HOLDs.json', SRC / 'all74-protected.actual-whole-page-and-context-preservation.json', PRIOR / 'positive-evidence.author-v2.candidates.json', PRIOR / 'positive-evidence.author-v2.actual.candidate.jsonl', PRIOR / 'positive-evidence.author-v2.config.json', PRIOR / 'author-profiles.data.json', PRIOR / 'independent-review.actual.thirteen-and-eight-scope.json', PRIOR / 'semantic-atomicity.author-v2.actual.review.jsonl', PRIOR / 'memory.author-v2.actual.review.jsonl', SOURCE_B / 'eight-source-and-three-role-followup.independent-b.verdict.json', original_primary / 'HE.current-official.pdf', original_primary / 'BY13-EA.current-official.html', ROOT / 'AGENTS.md', ROOT / 'LICENSING.md', ROOT / 'docs/concept/skill-graph/atomic-goal-visualizations.md', ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-positive-understanding-evidence-profile-criteria-v1.md', ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/positive-understanding-evidence-profile-authoring-v2.md', ROOT / 'app/scripts/materializePositiveGoalEvidenceCandidates.ts', ROOT / 'app/scripts/positiveGoalEvidenceProfileModel.ts', ROOT / 'app/scripts/positiveGoalEvidenceReview.ts', ROOT / 'app/scripts/goalBookModel.ts', ROOT / 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json', ROOT / 'contracts/goal-evidence/v2/goal-evidence-review-config.schema.json']
# Reject missing paths honestly; exact discovery can add the actual filename without changing a source.
missing = [p.relative_to(ROOT).as_posix() for p in external_paths if not p.is_file()]
write('external-path-discovery.author.json', {'missingBeforeFinalRouting': missing, 'allExistingBindings': [bind(p) for p in external_paths if p.is_file()]})
write('external-input-bindings.author.json', [bind(p) for p in external_paths if p.is_file()])

write('first-three-models.raw-author-review-input.json', {
 'schemaVersion': 1, 'authorStage': 'stage-01-three-model-materials', 'role': 'author; no independent scientific verdict',
 'currentCanonicalBaseline': bind(CURRENT), 'exactScopeGoalIds': IDS, 'wholeCurrentAndCandidate': 'three-whole-goal-current-source-v2-and-new-candidate.templates.json',
 'completeMaterials': 'six-complete-DEEN-reference-materials.author-candidates.json', 'positiveCandidates': 'positive-evidence.three-models.author-candidates.json',
 'nativePositiveConfig': 'positive-evidence.three-models.native.config.json', 'nativePositiveRecords': 'positive-evidence.three-models.actual.author-candidate.jsonl',
 'generalComparison': 'general-347-whole-goal-and-prior-whole-positive-candidate.exact-comparison.json',
 'roleAndNeighborBoundaries': 'three-distinct-model-operations-and-347-preservation.author-rationale.json',
 'primaryReading': 'bounded-primary-and-research-reading.author-receipt.json', 'exactDelta': 'three-models-actual-whole-object-and-edge-deltas.author.json',
 'newCurricularIds': 0, 'other469WholeGoalsExact': True, 'all472EdgesExact': True,
 'nativeDescriptionCampaignOrPDFPrepared': False, 'newNativeAtomicityReview': False, 'noPrimaryGoalVisualizations': True,
 'remainingObligations': ['two independent current D/P scientific checks of actual materials and whole descriptions', 'formal current atomicity decision', 'native final21 pages/contexts/source routing', 'memory and visualization gates', 'all eight original whole-source duties and 189 open country-goal pairs remain HOLD'],
 'sourceFullClosure': False, 'activeWrites': False, 'strictNetGain': 0, 'humanApproval': False, 'humanTrial': False, 'actualLearnerEvidence': False,
 'license': 'CC-BY-4.0'})
print(json.dumps({'own': REL, 'threeWholeCandidates': len(templates), 'completeDEENCases': len(cases), 'profileCandidates': len(new_profiles), '469WholeGoalsExact': True, '472EdgesExact': True, 'general347Exact': True, 'missingOptionalDiscoveryPaths': missing}, ensure_ascii=False))
