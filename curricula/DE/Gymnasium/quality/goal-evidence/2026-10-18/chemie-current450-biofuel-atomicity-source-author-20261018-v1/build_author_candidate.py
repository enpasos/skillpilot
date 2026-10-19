#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Reproduce this inactive author candidate from exact current inputs only."""
import copy
import datetime
import hashlib
import json
import pathlib
import subprocess
import uuid

ROOT = pathlib.Path(__file__).resolve().parents[7]
BASE = pathlib.Path(__file__).resolve().parent
REL = BASE.relative_to(ROOT).as_posix()
OLD = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-native-nine-material-and-description-author-20261018-v1'
ROUTE = '223e33a4-5545-5332-ac4e-7d7a6cbc587c'
REACTION = '1bdaf7f2-ff3b-455a-a7fb-95a44642762a'
EXAM = '2339b9b1-39c8-59f1-9108-c46966ecf1fd'
MASS = str(uuid.uuid5(uuid.NAMESPACE_URL, 'https://skillpilot.com/canonical/chemistry/physical-separation-mass-accounting'))
ORIENTATION = 'a9c22adc-b543-5b0c-a2d8-3189facdff08'
LS = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
NOW = '2026-10-18T17:48:46.626661+00:00'  # Actual original authoring timestamp, fixed for reproduction.
PINS = {}

def sha(b):
    return hashlib.sha256(b).hexdigest()

def objsha(o):
    return sha(json.dumps(o, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode())

def read(path):
    path = pathlib.Path(path)
    if not path.is_absolute():
        path = ROOT / path
    b = path.read_bytes()
    PINS[path.relative_to(ROOT).as_posix()] = {'path': path.relative_to(ROOT).as_posix(), 'sha256': sha(b), 'bytes': len(b)}
    return json.loads(b)

def pin(path, pointer=None):
    path = pathlib.Path(path)
    if not path.is_absolute():
        path = ROOT / path
    b = path.read_bytes()
    result = {'path': path.relative_to(ROOT).as_posix(), 'sha256': sha(b), 'bytes': len(b)}
    PINS[result['path']] = copy.deepcopy(result)
    if pointer is not None:
        result['jsonPointer'] = pointer
    return result

def write(name, value):
    p = BASE / name
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def jsonl(path):
    pin(path)
    return [json.loads(l) for l in pathlib.Path(path).read_text().splitlines() if l.strip()]

landscape = read(LS)
goals = {g['id']: g for g in landscape['goals']}
route_before = copy.deepcopy(goals[ROUTE])
route_after = copy.deepcopy(route_before)
route_after['description'] = route_before['description'].replace('eine vorgegebene Stoffbilanz prüfen und ', '')
route_after['descriptionEn'] = route_before['descriptionEn'].replace('check a supplied material balance, and ', '')
# Own retention declarations must describe the new whole route duty truthfully.
# Their original profile pins stay as historical predecessor evidence and are not
# silently repointed to an unreviewed successor.
for ext in route_after.get('extendedData', {}).get('skillPilotAcquisitionExtensions', []):
    for key in ['wholeUnchangedAcquisitionScopeDe', 'wholeUnchangedAcquisitionScopeEn']:
        if key in ext:
            ext[key] = route_after['description' if key.endswith('De') else 'descriptionEn']
    ext['authorSuccessorPending'] = {
        'packagePath': REL,
        'predecessorProfileIsHistoricalOnly': True,
        'proposedWholeProfilePath': REL + '/candidate/P.two-whole-profiles.pending.jsonl',
        'newIndependentApproval': False,
    }

new_mass = {
    'id': MASS,
    'shortKey': 'canonical_chemistry_physical_separation_mass_accounting',
    'title': 'Massenbilanzen physikalischer Trennungen prüfen',
    'titleEn': 'Check mass accounting for physical separations',
    'description': 'Die lernende Person kann bei einer physikalischen Stofftrennung aus vollständig bereitgestellten Massenangaben die Gesamtmassenbilanz für eine ausdrücklich benannte Erfassungsgrenze prüfen, scheinbare Fehlmassen bei nachgewiesenen Stoffabgängen erklären und die gewonnene Stoffmasse von einem ohne Anfangsgehalt nicht bestimmbaren Rückgewinnungsgrad unterscheiden.',
    'descriptionEn': 'For a physical separation, the learner can check total-mass accounting from fully supplied masses for an explicitly stated accounting boundary, explain apparent missing mass through identified material outputs, and distinguish recovered substance mass from a recovery fraction that cannot be determined without its initial content.',
    'type': 'atomic', 'weight': 1, 'contains': [], 'requires': [ORIENTATION],
    'tags': ['GK', 'LK', 'canonical', 'SekII'],
    'applicability': copy.deepcopy(route_before['applicability']),
    'dimensionTags': {
        'framework': 'canonical-gymnasium-chemistry', 'demandLevel': 'AB2',
        'processCompetencies': ['PK2_MODELLIEREN', 'PK3_MATHEMATISIEREN'],
        'guidingIdeas': [], 'phase': 'GLOBAL', 'area': 'Energie und Nachhaltigkeit',
        'topicCode': 'CANONICAL.CHEMISTRY.PHYSICAL_SEPARATION.MASS_ACCOUNTING',
    },
    'examples': [], 'resourceLinks': [],
    'extendedData': {
        'applicabilityMappingInheritance': 'boundary',
        'provenance': {'splitFromGoalId': ROUTE, 'authorPackagePath': REL, 'ownMaterialLicense': 'CC-BY-4.0'},
        'officialSourceBoundary': 'Own retained authored mass-accounting duty. No official HB source199/source200 mass requirement and no new official source mapping are claimed.',
        'assessmentBoundary': 'Supplied paper data only; no real experiment, personal measurement, reaction-competence credit, molar stoichiometry or unknown oil-recovery calculation.',
        'skillPilotAcquisitionExtensions': [],
    },
}

baseline = {
    'id': 'physical-seed-complete-accounting',
    'taskDemandDe': 'Eigenes ideales Papiermodell, kein Versuch: Ein vollständig erfasstes Trennsystem nimmt 100 kg trockene Saat auf und liefert 30 kg Öl und 70 kg Presskuchen. Es gibt keine weiteren Zu- oder Abgänge; Stoffe werden getrennt, keine neuen gebildet. Der ursprüngliche Saatölgehalt ist unbekannt. Benenne die Erfassungsgrenze und prüfe die Gesamtmassenbilanz. Welche Ölmasse wurde gewonnen? Kannst du bestimmen, welcher Anteil des ursprünglich enthaltenen Öls zurückgewonnen wurde? Begründe die Grenze deiner Aussage.',
    'taskDemandEn': 'Own ideal paper model, not an experiment: a completely accounted separation system takes in 100 kg dry seed and produces 30 kg oil and 70 kg press cake. There are no other inputs or outputs; existing substances are separated without new ones forming. The original seed oil content is unknown. State the accounting boundary and check total-mass accounting. What oil mass was obtained? Can you determine what fraction of the original oil was recovered? Explain the limit of your conclusion.',
    'expectedPerformanceDe': 'Für das ganze angegebene System gilt 30 + 70 = 100 kg. Die gewonnene Ölmasse beträgt 30 kg. Der ursprüngliche Ölvorrat in der Saat fehlt; daher ist der Rückgewinnungsgrad des Öls unbestimmt. 30 % bezogen auf die Saatmasse ist nicht der Rückgewinnungsgrad des anfangs vorhandenen Öls. Keine chemische Umwandlung und keinen ausgeführten Versuch behaupten.',
    'expectedPerformanceEn': 'For the whole specified system, 30 + 70 = 100 kg. The recovered oil mass is 30 kg. The original oil inventory is missing, so its recovery fraction is undetermined. 30% of seed mass is not the fraction recovered from the initial oil inventory. Claim neither chemical conversion nor a performed experiment.',
    'understandingFocusDe': 'Eine Gesamtmassenbilanz zählt alle angegebenen Stoffströme innerhalb derselben Grenze; sie bestimmt keinen fehlenden Anfangsgehalt.',
    'understandingFocusEn': 'Total-mass accounting counts all supplied material flows across the same boundary; it cannot determine a missing initial content.',
}
fresh = {
    'id': 'physical-separation-open-accounting-transfer',
    'taskDemandDe': 'Frisches eigenes Papiermodell einer rein physikalischen Trennung: 100 kg Saat gehen ein. Das enge Wiegeprotokoll erfasst 30 kg Öl und 68 kg Presskuchen. Weitere 2 kg verschütteter Presskuchen liegen ausdrücklich nachgewiesen außerhalb dieser Waagengrenze; weitere Stoffströme gibt es nicht. Eine Anbieterin behauptet: Die fehlenden 2 kg wurden chemisch vernichtet, und die 30 kg Öl beweisen vollständige Ölrückgewinnung. Prüfe beide Behauptungen, indem du enge und vollständige Erfassungsgrenze vergleichst. Der ursprüngliche Saatölgehalt bleibt unbekannt.',
    'taskDemandEn': 'Fresh own paper model of a purely physical separation: 100 kg seed enters. The narrow weighing record includes 30 kg oil and 68 kg press cake. An additional 2 kg spilled press cake is explicitly identified outside that weighing boundary; there are no other material flows. A supplier claims that the missing 2 kg were chemically destroyed and that 30 kg oil proves complete oil recovery. Assess both claims by comparing narrow and complete accounting boundaries. The original seed oil content remains unknown.',
    'expectedPerformanceDe': 'Das enge Protokoll zählt 98 kg; einschließlich der nachgewiesenen 2 kg außerhalb seiner Grenze sind 100 kg erfasst. Die Daten zeigen einen ausgelassenen Stoffstrom, keine Vernichtung und keine chemische Reaktion. 30 kg Öl ist eine gewonnene Masse; vollständige Ölrückgewinnung ist ohne ursprünglichen Ölbestand nicht belegbar. Der Bedingungswechsel ist die unvollständige Erfassung mit ausdrücklich lokalisiertem Abgang, nicht nur ein neuer Zahlenwert.',
    'expectedPerformanceEn': 'The narrow record counts 98 kg; including the identified 2 kg outside its boundary accounts for 100 kg. The data show an omitted material flow, not destruction or chemical reaction. 30 kg oil is a recovered mass; complete recovery cannot be established without the original oil inventory. The changed condition is incomplete accounting with an explicitly located output, not merely new numbers.',
    'understandingFocusDe': 'Eine Fehlmasse im offenen Protokoll ist von Stoffvernichtung zu unterscheiden. Ein Gesamtmassenabschluss beweist keine vollständige Komponentenrückgewinnung.',
    'understandingFocusEn': 'Missing mass in an open record differs from destruction. Closing total-mass accounting does not prove full component recovery.',
}
mass_profile = {
    'archetype': 'data',
    'expectations': [{
        'id': 'physical-separation-accounting-boundary',
        'essentialUnderstandingDe': 'Bei einer physikalischen Trennung werden vorhandene Stoffe verteilt. Vollständige Gesamtmassenbilanz und Komponentenrückgewinnung sind verschiedene Aussagen: Die erste braucht alle Stoffströme derselben Grenze, die zweite zusätzlich den ursprünglichen Komponentenbestand.',
        'essentialUnderstandingEn': 'Physical separation redistributes existing substances. Complete total-mass accounting and component recovery are different claims: the former needs all material flows across one boundary; the latter also needs the original component inventory.',
        'observablePerformanceDe': 'Die lernende Person schließt die bereitgestellte 100/30/70-Bilanz, begründet eine offen erfasste Fehlmasse aus einem nachgewiesenen Abgang und lehnt eine aus dem unbekannten Anfangsölgehalt nicht ableitbare Rückgewinnungsquote ab.',
        'observablePerformanceEn': 'The learner closes the supplied 100/30/70 accounting, explains a missing mass in an open record through an identified output, and rejects a recovery fraction unsupported by the unknown initial oil inventory.',
    }],
    'coverageExpectations': {'requiredExpectationIds': ['physical-separation-accounting-boundary'], 'alternativeExpectationGroups': [], 'minimumIndependentDemonstrations': 2, 'freshVariationRequired': True, 'independentTransferRequired': True},
    'variationAxes': [{'id': 'complete-versus-open-accounting', 'textDe': 'Vollständig erfasste Ströme versus enges Protokoll mit nachgewiesenem, nicht mitgewogenem Abgang; gleiche Trennung ohne neue Stoffe.', 'textEn': 'Complete material flows versus a narrow record with an identified unweighed output; the same physical separation without new substances.'}],
    'applicationCaseBriefs': [baseline, fresh],
}

prior_records = jsonl(OLD / 'inputs/nine-selected-P.original-lines.jsonl')
route_record_before = next(r for r in prior_records if r['goalId'] == ROUTE)
reaction_record = next(r for r in prior_records if r['goalId'] == REACTION)
repaired_record = next(r for r in jsonl(OLD / 'candidate/P.six-whole-replacements.pending.jsonl') if r['goalId'] == ROUTE)
route_profile = copy.deepcopy(repaired_record['profile'])
route_profile['expectations'][0]['observablePerformanceDe'] = 'Die lernende Person erklärt Gewinnungsschritte und unterscheidet Treibstoffwege und Generationen nach Stoffklasse und Kernprozess; sie begrenzt Schlussfolgerungen zur Klimaneutralität anhand der fehlenden Lebenszyklusdaten.'
route_profile['expectations'][0]['observablePerformanceEn'] = 'The learner explains isolation steps and distinguishes fuel routes and generations by substance class and core process; they bound climate-neutrality conclusions using the missing life-cycle data.'
for case in route_profile['applicationCaseBriefs']:
    case['taskDemandDe'] = case['taskDemandDe'].replace('Prüfe Saatbilanz. ', '')
    case['taskDemandEn'] = case['taskDemandEn'].replace('Check seed balance. ', '')
    case['expectedPerformanceDe'] = case['expectedPerformanceDe'].replace('30+70=100 kg im idealen Saat-System;Gesamtöl-Ausbeute ohne Ölanteil nicht berechenbar. ', '')
    case['expectedPerformanceEn'] = case['expectedPerformanceEn'].replace('30+70=100 kg within ideal seed boundary;total oil recovery needs oil content. ', '')

exam_before = copy.deepcopy(goals[EXAM])
exam_after = copy.deepcopy(exam_before)
exam_after['title'] = 'Übung: Biotreibstoffwege und getrennte Trennmassenbilanz'
exam_after['titleEn'] = 'Practice: Biofuel routes and separate separation mass accounting'
exam_after['description'] = 'Die lernende Person kann die vollständig bereitgestellten Routenfälle und davon getrennt die Saatmassenbilanz selbstständig bearbeiten, die erforderlichen Begründungen und Bedingungswechsel darstellen und die Aussagegrenzen des Materials beachten.'
exam_after['descriptionEn'] = 'The learner can independently solve the complete supplied route cases and, separately, seed mass accounting, explain the required reasoning and changed conditions, and respect the inference limits of the material.'
exam_after['requires'] = [ROUTE, MASS]
exam_after['examData']['coveredGoalIds'] = [ROUTE, MASS]
exam_after['examData']['reviewStatus'] = 'draft'
exam_after['examData']['reviewNote'] = 'Inactive author successor after separating two ordinary goals; no inherited release. Independent content/interface/design review required.'
exam_after['examData']['sourceArtifactPath'] = REL + '/materials/separated-assessment.learner.DE-EN.json'
# Preserve both existing route cases, their givens, and their solution text.
# Move only independent accounting demand/credit into a separately graded part.
exam_after['examData']['taskContent'] = exam_before['examData']['taskContent'].replace('Prüfe Saatbilanz. ', '') + '\n\nGetrennter Bilanzteil\n' + baseline['taskDemandDe'] + '\n\nFrischer Bilanztransfer\n' + fresh['taskDemandDe']
exam_after['examData']['taskContentEn'] = exam_before['examData']['taskContentEn'].replace('Check seed balance. ', '') + '\n\nSeparate accounting part\n' + baseline['taskDemandEn'] + '\n\nFresh accounting transfer\n' + fresh['taskDemandEn']
exam_after['examData']['solutionContent'] = exam_before['examData']['solutionContent'] + '\n\nGetrennter Bilanzteil\n' + baseline['expectedPerformanceDe'] + '\n\nFrischer Bilanztransfer\n' + fresh['expectedPerformanceDe']
exam_after['examData']['solutionContentEn'] = exam_before['examData']['solutionContentEn'] + '\n\nSeparate accounting part\n' + baseline['expectedPerformanceEn'] + '\n\nFresh accounting transfer\n' + fresh['expectedPerformanceEn']
old_steps = exam_before['examData']['scoring']['steps']
exam_after['examData']['scoring'] = {
    'maxPoints': 8, 'passingPoints': 8,
    'steps': [copy.deepcopy(old_steps[0]), {
        'id': '223e33a4-generation-boundary', 'points': 2,
        'description': 'DE: Die ausdrücklich gegebene Generationenkonvention auf die Routen anwenden; daraus keine Nachhaltigkeitsrangfolge ableiten. EN: Apply the expressly supplied generation convention to the routes without inferring a sustainability ranking. 2: vollständig begründet / fully justified; 1: richtige Teilleistung mit Lücke / correct substantial part with a gap; 0: fehlt oder widerspricht den Daten / missing or contradicts the data.',
    }, copy.deepcopy(old_steps[2]), {
        'id': MASS + '-accounting', 'points': 2,
        'description': 'DE: 30+70=100 kg für vollständige Grenze; offene 98 kg mit ausdrücklich gegebenen 2 kg ergänzen; keine Stoffvernichtung, kein chemischer Vorgang und keine vollständige Ölrückgewinnung ohne Anfangsbestand. EN: 30+70=100 kg for the complete boundary; add the identified 2 kg to the narrow 98 kg record; no destruction, chemical reaction or complete oil recovery without initial inventory. 2: alle Kernaussagen begründet / all core claims justified; 1: richtiger Teil mit Lücke / correct part with a gap; 0: fehlt oder widerspricht / missing or contradicted.',
    }],
}
historical_release = {
    key: exam_after['extendedData'].pop(key)
    for key in ['assessmentDesignReview', 'machineAssessmentRelease']
}
exam_after['extendedData']['historicalPredecessorReleaseOnly'] = historical_release
exam_after['extendedData']['assessmentGate'] = 'Inactive author successor only; new design release pending.'
exam_after['extendedData']['authorAssessmentGate'] = 'Separate route and mass carriers retained; independent review and release pending.'
exam_after['extendedData']['authorSuccessorPackagePath'] = REL

candidate = copy.deepcopy(landscape)
for i, g in enumerate(candidate['goals']):
    if g['id'] == ROUTE:
        candidate['goals'][i] = route_after
    elif g['id'] == EXAM:
        candidate['goals'][i] = exam_after
parents = []
for i, g in enumerate(candidate['goals']):
    if ROUTE in g.get('contains', []):
        before = copy.deepcopy(landscape['goals'][i])
        g['contains'].insert(g['contains'].index(ROUTE) + 1, MASS)
        parents.append({'index': i, 'before': before, 'after': copy.deepcopy(g)})
candidate['goals'].append(new_mass)

view_changes = []
for path in sorted((ROOT / 'curricula/DE/Gymnasium/composition-views/chemie').glob('*.json')):
    d = read(path)
    after = copy.deepcopy(d)
    edits = []
    def visit(obj, pointer=''):
        if isinstance(obj, list):
            for ix in reversed(range(len(obj))):
                value = obj[ix]
                if isinstance(value, dict) and value.get('goalId') == ROUTE:
                    assert value.get('projectionRole', 'target') == 'target'
                    new = {'kind': 'goalEntry', 'goalId': MASS, 'projectionRole': 'target'}
                    edits.extend([{'op': 'test', 'path': pointer + '/' + str(ix), 'value': copy.deepcopy(value)}, {'op': 'add', 'path': pointer + '/' + str(ix + 1), 'value': new}])
                    obj.insert(ix + 1, new)
                visit(value, pointer + '/' + str(ix))
        elif isinstance(obj, dict):
            for key, value in obj.items():
                visit(value, pointer + '/' + key)
    visit(after)
    if edits:
        assert len(edits) == 2
        file_name = path.name
        write('candidate/views/' + file_name, after)
        view_changes.append({'input': pin(path), 'viewId': d['viewId'], 'scope': d['scope'], 'patch': edits, 'afterPath': REL + '/candidate/views/' + file_name, 'oldTargetsRolesAndParentsPreserved': True, 'newGoalRole': 'target'})
        if d['scope'].get('jurisdiction'):
            new_mass['extendedData']['skillPilotAcquisitionExtensions'].append({
                'extensionId': 'physical-mass-split-' + d['viewId'],
                'jurisdiction': d['scope']['jurisdiction'], 'viewIds': [d['viewId']],
                'courseProfiles': [d['scope'].get('courseProfile', '')],
                'stageIntents': [d['scope'].get('stage', '')],
                'role': 'own-authored-acquisition-extension-for-retained-duty',
                'officialWholeSourceCredit': False, 'officialRequirementClaim': False,
                'actualLearnerTopicSelectionClaim': False, 'authorPackagePath': REL,
            })

write('candidate/landscape.after.INACTIVE.json', candidate)
write('inputs/whole-goals-and-selected-profiles.before.json', {
    'landscapePin': pin(LS),
    'goals': [route_before, goals[REACTION], goals['4aeced1e-15cd-58df-83f7-68e2531c2d32'], goals['e7c3d20e-4b13-560b-b8ee-c5abca8cc624'], exam_before],
    'originalRouteRecord': route_record_before,
    'materialRepairedRouteRecord': repaired_record,
    'wholeReactionMassRecord': reaction_record,
})
write('candidate/goals.whole-before-after.CAS.pending.json', {
    'role': 'AUTHOR_ONLY_INACTIVE_NO_NEW_REVIEW', 'normalApplyAuthorized': False,
    'canonicalInput': pin(LS), 'newGoalId': MASS,
    'goalReplacements': [{'goalId': ROUTE, 'before': route_before, 'after': route_after}, {'goalId': EXAM, 'before': exam_before, 'after': exam_after}],
    'goalAdditions': [{'before': None, 'after': new_mass, 'absenceTest': {'goalIdNotPresent': MASS}}],
    'parentReplacements': parents,
    'jsonPatch': [
        *[op for row in [{'index': next(i for i,g in enumerate(landscape['goals']) if g['id']==ROUTE), 'before': route_before, 'after': route_after}, {'index': next(i for i,g in enumerate(landscape['goals']) if g['id']==EXAM), 'before': exam_before, 'after': exam_after}] + parents for op in [{'op': 'test', 'path': '/goals/' + str(row['index']), 'value': row['before']}, {'op': 'replace', 'path': '/goals/' + str(row['index']), 'value': row['after']}]],
        {'op': 'add', 'path': '/goals/-', 'value': new_mass},
    ],
})
write('candidate/views.exact32-CAS.pending.json', {'viewChanges': view_changes, 'newGoalRequires': new_mass['requires'], 'routeRequiresUnchanged': route_after['requires'], 'scopeRule': 'Add target only beside an existing explicit route target; no role inferred from source, stage, phase or requires.', 'sourceCoverageCredit': False})

ledger_path = 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
ledger = read(ledger_path)
prototype = copy.deepcopy(next(d for d in ledger['decisions'] if d['goalId'] == ROUTE))
prototype['goalId'] = MASS
prototype['reason'] = 'AUTHOR-ONLY PROPOSED classification: ordinary assessable mass-accounting competence; not orientation, memory or exam. Requires independent acceptance before normal semantic ledger integration.'
ledger['decisions'].append(prototype)
write('candidate/semantic-kinds.after.INACTIVE.json', ledger)

write('materials/mass-accounting.learner.DE-EN.json', {'license': 'CC-BY-4.0', 'goalId': MASS, 'materialRole': 'own-paper-givens-and-tasks', 'cases': [{k:v for k,v in case.items() if not k.startswith(('expectedPerformance', 'understandingFocus'))} for case in [baseline, fresh]]})
write('materials/mass-accounting.teacher.DE-EN.json', {'license': 'CC-BY-4.0', 'goalId': MASS, 'materialRole': 'withhold-until-independent-complete-submission', 'cases': [{k:v for k,v in case.items() if not k.startswith('taskDemand')} for case in [baseline, fresh]]})
write('materials/route.learner.DE-EN.json', {'license': 'CC-BY-4.0', 'goalId': ROUTE, 'materialRole': 'route-tasks-only-masses-remain-context', 'cases': [{k:v for k,v in case.items() if k in ['id','taskDemandDe','taskDemandEn']} for case in route_profile['applicationCaseBriefs']]})
write('materials/route.teacher.DE-EN.json', {'license': 'CC-BY-4.0', 'goalId': ROUTE, 'materialRole': 'withhold-until-independent-complete-submission', 'cases': [{k:v for k,v in case.items() if not k.startswith('taskDemand')} for case in route_profile['applicationCaseBriefs']]})
write('materials/separated-assessment.learner.DE-EN.json', {'license': 'CC-BY-4.0', 'goalId': EXAM, 'taskContent': exam_after['examData']['taskContent'], 'taskContentEn': exam_after['examData']['taskContentEn']})
write('materials/separated-assessment.teacher.DE-EN.json', {'license': 'CC-BY-4.0', 'goalId': EXAM, 'solutionContent': exam_after['examData']['solutionContent'], 'solutionContentEn': exam_after['examData']['solutionContentEn'], 'scoring': exam_after['examData']['scoring'], 'criterionCarrierPartition': {old_steps[0]['id']: ROUTE, '223e33a4-generation-boundary': ROUTE, old_steps[2]['id']: ROUTE, MASS + '-accounting': MASS}})

candidates = {'schemaVersion': 1, 'authoringContract': 'positive-understanding-evidence-candidates-v1', 'reviewId': 'chemie-biofuel-duty-separation-author-20261018-v1', 'reviewedAt': NOW, 'reviewer': 'Codex informed author; no independent vote', 'goals': []}
for gid, profile in [(ROUTE, route_profile), (MASS, mass_profile)]:
    candidates['goals'].append({'goalId': gid, 'reason': 'Inactive informed author successor separating route classification and independently assessable physical-separation accounting. Duty conservation and exact target scopes are proposed, not approved.', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1', 'dissent': ['Independent source/duty, D/P/A/M/V, assessment-interface/design and normal integration review remain required. Historical reviewers did not approve this successor.'], 'profile': profile})
write('candidate/P.two-candidate-set.pending.json', candidates)
write('candidate/P.two-author.config.json', {
    '$schema': 'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',
    'schemaVersion': 2, 'reviewId': candidates['reviewId'], 'goalFingerprintRuleVersion': 'goal-evidence-v1', 'profileRuleVersion': 'positive-understanding-evidence-v2', 'landscapeId': landscape['landscapeId'],
    'landscapePath': REL + '/candidate/landscape.after.INACTIVE.json',
    'semanticKindLedgerPath': REL + '/candidate/semantic-kinds.after.INACTIVE.json',
    'reviewCriteriaPath': 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md',
    'reviewPath': REL + '/candidate/P.two-whole-profiles.pending.jsonl', 'reviewRunManifestPaths': [], 'reviewedResourceTypes': ['goal-visualization'], 'requireApproved': False,
    'scope': {'label': 'Inactive two-goal authored separation; no activation or review', 'goalIds': [ROUTE, MASS]},
})

cfg_path = 'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json'
cfg = read(cfg_path)
active_edges = []
ids = set()
for mp in cfg['mappingPaths']:
    data = read(mp)
    for ix, edge in enumerate(data.get('mappings', [])):
        if edge.get('canonicalGoalId') == ROUTE:
            sid = edge['legacyGoalId']
            ids.add(sid)
            decisions = [{'pointer': '/decisions/' + str(j), 'wholeBeforeAndAfterUnchanged': dec} for j,dec in enumerate(data.get('decisions', [])) if dec.get('sourceGoalId') == sid]
            active_edges.append({'pin': pin(mp, '/mappings/' + str(ix)), 'wholeBeforeMapping': edge, 'wholeAfterMapping': copy.deepcopy(edge), 'decisions': decisions, 'noMassMappingAdded': True})

source_lookup = {}
for path in (ROOT / 'curricula/DE/Gymnasium/input').rglob('*.source-extraction.json'):
    if 'CHEM' not in path.name.upper():
        continue
    data = json.loads(path.read_text())
    for ix, g in enumerate(data.get('sourceGoals', [])):
        if g['id'] in ids:
            priority = 2 if 'CURRENT2026' in path.name else 0
            if g['id'] not in source_lookup or priority > source_lookup[g['id']][-1]:
                source_lookup[g['id']] = (path, ix, g, data, priority)

source_rows = []
for sid in sorted(ids):
    path, ix, sg, data, _ = source_lookup[sid]
    doc = data.get('sourceDocument', {})
    if sid.startswith(('bb-', 'be-')):
        duty = 'Bioethanol production by fermentation and fuel-additive use. Route contribution retained; adjacent fats/biodiesel rows do not enlarge this specific edge.'
        pages = [23]
    elif sid.startswith('hb-'):
        duty = 'Distinguish biofuels and explain their production routes in the common GK/LK block. Preserve the current partial union with the detailed biodiesel and bioethanol carriers. First/second-generation and substance terms remain context; full BTL/FT explanation is separately LK. No source duty to calculate 100/30/70.'
        pages = [32]
    elif sid.startswith('he-'):
        duty = ('Plant oils as triglyceride mixtures, their fuel use and ecological advantages/limits.' if '-b02-' in sid else 'Ethanol production from glucose by fermentation.' if '-a03-' in sid else 'Advantages and disadvantages of bioethanol as an alternative to fossil fuel.') + ' Only this existing partial contribution is retained; no full source completion or official seed balance.'
        pages = [50]
    elif sid.startswith('de-hh'):
        duty = 'Examples of fuels from renewable feedstocks in the common requirements. Detailed generation taxonomy and complete life-cycle calculation are not imported as universal official duties.'
        pages = [33]
    elif sid.startswith('de-sh'):
        duty = 'Renewable feedstock energy and bounded sustainability judgment. The broader source includes energy stores; this edge retains its biofuel contribution only. Preserve official options elsewhere as optional.'
        pages = [68]
    elif sid.startswith('mv-'):
        duty = 'Ethanol structure/fermentation/technical manufacture/use/significance. Route profile contributes fermentation and fuel use only; broader technical manufacture, health and structure obligations stay with the complete existing union.'
        pages = [35]
    elif sid.startswith('rp-'):
        duty = 'LK lipid context: renewable raw materials, biodiesel transesterification and palm-oil issues. Keep the LK source boundary; broader own GK target does not become an official GK claim.'
        pages = [59]
    elif sid.startswith('sl-'):
        duty = 'EP natural-science-branch production routes for bioethanol, biogas and biodiesel. Current route carrier remains partial and does not cover missing biogas or the whole branch alone.'
        pages = [31]
    elif sid.startswith('sn-'):
        duty = 'Economic/ecological judgment of alternative energy sources' + (' and energy storage in LK.' if 'leistungskurs' in sid else ' in GK.') + ' This bounded biofuel contribution does not substitute the full energy/store unit or a full economic comparison.'
        pages = [57 if 'leistungskurs' in sid else 44]
    elif sid.startswith('st-'):
        duty = 'Characterise/evaluate ethanol as alternative fuel. Drug and synthesis-building-block aspects remain outside this partial route contribution.'
        pages = [32]
    elif sid.startswith('th-'):
        duty = 'Describe ethanol production by fermentation and formulate its reaction equation. Keep the explicit balanced glucose-to-ethanol/CO2 relation in route givens; detailed ethanol carrier and other preparation aspects remain.'
        pages = [27]
    else:
        raise AssertionError(sid)
    pdf_path = ROOT / doc['path']
    pdf_pin = pin(pdf_path)
    # Primary pages were actually read with pdftotext; HB p32 was also raster-read.
    pages_text = subprocess.run(['pdftotext', '-layout', str(pdf_path), '-'], capture_output=True, text=True, check=True).stdout.split('\f')
    page_hashes = [{'physicalPDFPageOneBased': page, 'extractedPageTextSHA256': sha(pages_text[page-1].encode()), 'rawPrimaryTextNotCommitted': True} for page in pages]
    source_rows.append({'sourcePin': pin(path, '/sourceGoals/' + str(ix)), 'wholeSourceGoalBeforeAndAfterUnchanged': sg, 'sourceDocument': doc, 'primaryDocumentPin': pdf_pin, 'actualPrimaryPageRead': page_hashes, 'authorDutyPartitionEn': duty, 'routeCarrier': ROUTE, 'massCarrierOfficialSourceCredit': False, 'matchTypePreserved': 'partial', 'sourceGoalCourseLevelUnchanged': sg.get('courseLevel'), 'newSourceApproval': False})

write('source/fifteen-current-direct-source-duties.whole-and-pinned.json', {'role': 'Informed AUTHOR source-fit analysis; not independent approval', 'activeMappingConfig': pin(cfg_path), 'count': len(active_edges), 'activeEdges': active_edges, 'sourceRows': source_rows, 'noSourceOrMappingMutation': True, 'newMassOfficialEdges': [], 'locatorCaveats': ['HB uses current sourceGoals/199 at physical/printed32, not historical37.', 'SN extraction labels PDF43/56; the supplied pinned PDF shows these rows on physical44/57. Retain source rows unchanged; page read pins make this author read reproducible.', 'RP sourceRef26 does not locate the lipid row in the supplied PDF; actual physical59 was read. No locator remediation is integrated here.', 'MV source printed31 appears on physical35 in the supplied PDF.']})

write('candidate/duty-conservation-and-reuse-decision.pending.json', {
    'role': 'AUTHOR_PROPOSAL_NOT_REVIEW', 'resolution': 'Narrow route goal plus new independently assessable physical-separation accounting carrier',
    'selectedExistingReuse': False,
    'reuseAnalysis': [
        {'goalId': REACTION, 'decision': 'do_not_rebind_the_whole_moved_duty', 'reasonDe': 'Das ganze Ziel und P prüfen Massenerhaltung bei Reaktionen einschließlich Atomneuanordnung und experimentellen Reaktionsdaten. Eine physikalische Saattrennung kann ergänzender Transfer sein, belegt diese ganze Kompetenz aber nicht. Ein neuer bindender Saatteil in allen 1bda-Scopes würde fremde Pflichten erweitern; ein nur bedingter Saatteil erzeugte denselben ungelösten Scope-Vertrag wie der separate HB-HOLD. Der Vorgängerentwurf ist als physikalischer Transfer plausibel, aber kein semantikgleicher Ersatzträger für diese unabhängig erhaltene ganze Pflicht.'},
        {'goalId': '4aeced1e-15cd-58df-83f7-68e2531c2d32', 'decision': 'not_equivalent', 'reasonDe': 'Massenanteil aus bekannten Bestandteilen ist keine Gesamtstrombilanz mit offener Erfassungsgrenze; ein unbekannter Anfangsölbestand wird dadurch nicht bestimmbar. Zudem derzeit nur HE-Applicability.'},
        {'goalId': 'e7c3d20e-4b13-560b-b8ee-c5abca8cc624', 'decision': 'not_equivalent', 'reasonDe': 'Verlangt tatsächliche sichere Isolierung/Reinigung und Dokumentation; ein bereitgestelltes Papiermodell darf diese Handlungspflicht weder erben noch erfüllen.'},
    ],
    'dutyPartition': [
        {'duty': 'Feedstock, substance class, physical extraction versus chemical formation, supplied generation convention and climate-label limit', 'carrier': ROUTE, 'before': 'Present in whole route goal/P', 'after': 'Retained whole in route goal/P; unchanged detailed biodiesel/bioethanol/BTL carriers remain independent'},
        {'duty': 'Independent 100 kg seed to 30 kg oil plus70 kg cake accounting, same boundary, no unjustified recovery fraction', 'carrier': MASS, 'before': 'Explicit route description, profile and local assessment duty', 'after': 'Explicit new ordinary goal, independent baseline/fresh P, exact same32 target views, separately graded mass part in existing local assessment'},
    ],
    'independenceWitnesses': [
        'A learner may correctly classify pressing/transesterification/fermentation and generations but claim that 30 kg oil proves complete recovery. Route competence can succeed while mass/recovery competence fails.',
        'A learner may close100=30+70 and account for the explicitly spilled2 kg but mislabel filtered rapeseed oil as FAME. Mass competence can succeed while route competence fails.',
    ],
    'requiresDecision': 'Do not add mass as a prerequisite to route: the two independent outcomes do not logically require each other. New mass goal retains the existing common orientation prerequisite, and the combined local assessment requires both.',
    'dutyAndScopePreservation': 'All currently authored topics stay in the applicable broad target. New mass carrier mirrors exact route target views as own acquisition retention, with no official new source duty or actual theme-selection claim.',
    'existingHB1bdaHoldUnchanged': True,
    'oldA11AndTwoSplitWitnessesPreserved': True,
    'normalApplyAuthorized': False,
    'newIndependentVote': False,
})

for path in [
    OLD / 'adjudication/223e.current-source-duty-A11-and-two-split-witnesses.json',
    OLD / 'adjudication/223e.existing-mass-goal-reuse-alternative.pending.json',
    OLD / 'materials/223-biofuel-complete-givens-convention.learner.DE-EN.json',
    OLD / 'materials/223-biofuel-complete-givens-convention.teacher.DE-EN.json',
    ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-native-nine-material-independent-a-20261018-v1/HOLD.three-existing-questions-and-unselected-reuse-alternative.independent-a.json',
    ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-native-nine-material-independent-b-20261018-v1/review.per-goal.jsonl',
]:
    pin(path)
write('inputs/exact-input-pins.json', {'head': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip(), 'pins': list(PINS.values())})
print(json.dumps({'package': REL, 'newGoalId': MASS, 'wholeGoals': len(candidate['goals']), 'currentDirectMappings': len(active_edges), 'views': len(view_changes), 'inputPins': len(PINS), 'normalMutation': False}, ensure_ascii=False))
