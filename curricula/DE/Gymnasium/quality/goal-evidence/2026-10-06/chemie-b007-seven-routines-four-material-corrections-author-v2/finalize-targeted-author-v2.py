import copy
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

root = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06')
base = root / 'chemie-b007-three-safety-solutions-source-boundary-author-v1'
out = root / 'chemie-b007-seven-routines-four-material-corrections-author-v2'
materials = base / 'authored-case-materials-v1'
verification = root / 'chemie-q1-current378-active-integration-verification-v1'
now = datetime.now(timezone.utc).isoformat()


def read(path):
    return json.loads(Path(path).read_text())


def binding(path):
    path = Path(path)
    return {'path': path.as_posix(), 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'bytes': path.stat().st_size}


def write(name, content):
    (out / name).write_text(json.dumps(content, ensure_ascii=False, indent=2) + '\n')


assert not (out / 'targeted-materials.author-v2.final.freeze.json').exists()
old = read(materials / 'cases.de-en.author-candidate.json')
cases = read(out / 'cases.de-en.author-candidate.json')
prototypes = read(out / 'seven-routines.de-en.author-candidate.json')
old_prototypes = read(base / 'seven-routines.de-en.author-candidate.json')
essential = {
    'de': 'Ein Piktogramm weist auf bestimmte Gefahrenarten hin; dasselbe Symbol kann zu verschiedenen Gefahrenklassen und konkreten Warnungen gehören. Die konkrete Aussage ergibt sich zusammen mit dem zugehörigen Warnhinweis; Nachschlagen dient dieser selben Deutung und ist keine eigenständige freie Webrecherche.',
    'en': 'A pictogram indicates particular types of hazard; the same symbol can apply to different hazard classes and specific warnings. Its specific meaning is read together with the associated hazard statement; lookup serves that interpretation rather than becoming a separate free web-research task.',
}
for case in cases['cases']:
    if case['routineLocalKey'] == 'label':
        case['essentialUnderstanding'] = copy.deepcopy(essential)
prep = next(c for c in cases['cases'] if c['caseLocalKey'] == 'preparation-salt-water-performed-log')
prep['material']['de'][0] = prep['material']['de'][0].replace('einen sauberen Rührstab und eine Waage', 'einen sauberen Laborspatel zum Einwiegen und Übertragen des Salzes, einen sauberen Rührstab und eine Waage')
prep['material']['en'][0] = prep['material']['en'][0].replace('a clean stirring rod and balance', 'a clean laboratory spatula for weighing and transferring the salt, a clean stirring rod and balance')
prep['material']['de'][1] = prep['material']['de'][1].replace('darin 2,0 g Salz separat abwiegen und vollständig portionsweise zugeben', 'darin mithilfe des sauberen Spatels 2,0 g Salz separat abwiegen; das Salz aus der Wägeschale mit dem Spatel vollständig portionsweise in das Wasser übertragen')
prep['material']['en'][1] = prep['material']['en'][1].replace('separately weigh 2.0 g salt in that dish and add all of it in portions', 'use the clean spatula to weigh 2.0 g salt separately in that dish; use the spatula to transfer all the salt from the dish to the water in portions')
prep['expectedResponseOrSolution']['de'] = prep['expectedResponseOrSolution']['de'].replace('darin separat 2,0 g Salz abgewogen und vollständig zugegeben', 'darin mit sauberem Spatel separat 2,0 g Salz abgewogen und aus der Wägeschale vollständig ins Wasser übertragen')
prep['expectedResponseOrSolution']['en'] = prep['expectedResponseOrSolution']['en'].replace('2.0 g salt weighed separately in that dish and added completely', '2.0 g salt weighed separately in that dish with the clean spatula and transferred completely from the dish into the water')
prep['assessmentCriteria'][1]['text']['de'] = prep['assessmentCriteria'][1]['text']['de'].replace('vollständige Zugabe', 'vollständige Übertragung mit dem sauberen Spatel')
prep['assessmentCriteria'][1]['text']['en'] = prep['assessmentCriteria'][1]['text']['en'].replace('complete addition', 'complete transfer using the clean spatula')
prep['boundSimulatorSpecification']['stateRules']['de'].append('add_all_salt bedeutet die vollständige portionsweise Übertragung aus der tarierten Wägeschale mithilfe des freigegebenen sauberen Spatels. Zurückgebliebenes oder verschüttetes Salz erzeugt STOP und keinen vollständigen Zugabenachweis.')
prep['boundSimulatorSpecification']['stateRules']['en'].append('add_all_salt means complete transfer in portions from the tared weighing dish using the permitted clean spatula. Salt left behind or spilled produces STOP rather than evidence of complete addition.')
for prototype in prototypes['prototypes']:
    if prototype['localKey'] == 'label':
        p = prototype['positiveUnderstandingAuthorCandidate']
        p['essentialUnderstandingDe'] = essential['de']
        p['essentialUnderstandingEn'] = essential['en']
write('cases.de-en.author-candidate.json', cases)
write('seven-routines.de-en.author-candidate.json', prototypes)
assert (out / 'primary-cards.de-en.author-candidate.json').read_bytes() == (materials / 'primary-cards.de-en.author-candidate.json').read_bytes()
case_deltas = []
for before, after in zip(old['cases'], cases['cases']):
    assert before['caseLocalKey'] == after['caseLocalKey']
    if before != after:
        case_deltas.append({'caseLocalKey': before['caseLocalKey'], 'fields': [{'field': k, 'before': before.get(k), 'after': after.get(k)} for k in after if before.get(k) != after.get(k)]})
assert len(case_deltas) == 5
prototype_deltas = []
for before, after in zip(old_prototypes['prototypes'], prototypes['prototypes']):
    assert before['localKey'] == after['localKey']
    if before != after:
        prototype_deltas.append({'localKey': before['localKey'], 'fields': [{'field': k, 'before': before.get(k), 'after': after.get(k)} for k in after if before.get(k) != after.get(k)]})
assert len(prototype_deltas) == 1
previous = read(out / 'actual-four-case-and-source-page-corrections.json')
new = {k: v for k, v in previous.items() if k not in ['deltas', 'allSevenWholeRoutineProposalsExact']}
new.update({'createdAtUTC': now, 'changedCaseCount': 5, 'unchangedWholeCaseCount': 9,
            'changedRoutinePositiveUnderstandingCount': 1, 'unchangedWholeRoutineCount': 6,
            'allSevenGoalTitlesDescriptionsAndPrerequisitesExact': True,
            'caseDeltas': case_deltas, 'routineDeltas': prototype_deltas,
            'sourceReadRefreshUTC': now,
            'primaryPictogramScopeSource': {'url': 'https://www.baua.de/DE/Themen/Chemikalien-Biostoffe/Gefahrstoffe/Einstufung-und-Kennzeichnung/Kennzeichnungselemente/Gefahrenpiktogramme-und-Signalwoerter', 'access': 'current primary-domain indexed text; no successful direct-fetch claim'},
            'allSixOwnIndependentAFindingsAddressedInAuthorCandidate': True,
            'independentResolutionNotYetClaimed': True})
write('actual-five-case-and-label-essential-corrections.json', new)
(out / 'actual-four-case-and-source-page-corrections.json').unlink()

current_inputs = read(verification / 'final-current-machine-checks-and-inputs.actual.json')['currentInputs']
for item in current_inputs:
    assert binding(item['path']) == item, item['path']
for file in read(base / 'seven-routines-and-fourteen-cases.author.final.freeze.json')['files']:
    assert binding(file['path']) == file, file['path']
for file in read(root / 'chemie-b007-seven-routines-fourteen-cases-independent-a-v1' / 'independent-a.final.freeze.json')['files']:
    assert binding(file['path']) == file, file['path']
write('actual-current-input-preservation-and-turn-revalidation.json', {
    'schemaVersion': 1, 'createdAtUTC': now,
    'previousGoalTurnClassification': 'no_progress: user asked for commit message only; no operational work performed',
    'nextSafeActionTaken': 'finish genuine bounded B007 material defects for new independent review',
    'activeCurrentCheckpointInputsRehashedExactly': current_inputs,
    'unchangedWholeCasesCompared': 9, 'unchangedWholeRoutineCandidatesCompared': 6,
    'primaryCardsWholeBytesExact': 2,
    'chemistryStrict': 112, 'chemistryCurrentAtoms': 378, 'biologyStrict': 67, 'biologyCurrentAtoms': 383,
    'newScientificStrictClosures': 0, 'restoredActiveBindings': 0,
    'activeWrites': False, 'nativeProfileApproved': False, 'humanApproval': False, 'humanTrial': False,
})
readme = '''# B007: targeted material corrections, author v2

This candidate corrects the six actual findings in independent A v1. It does not resolve that review by author assertion: fresh B and targeted A follow-up remain required.

Five of fourteen complete DE/EN case objects change; nine remain exactly unchanged. Label warnings use the verified BAuA wording, and both label cases now avoid a one-symbol/one-hazard-class implication. The salt-water procedure supplies a separate dry weighing dish and clean spatula, tares the empty dish after securing the water beaker, and consistently records transfer and simulator feedback. The local disposal catchall now applies to unknown or unmatched residues, preserving the identified copper/salt example. The contraction task explicitly asks its existing fourth required criterion.

Only the label routine's positive-understanding essential changes; all seven goal titles, descriptions and prerequisites are exact v1, and six whole routine candidates are unchanged. Both narrow primary card files are byte-identical. Quantities, fraction definitions and arithmetic results remain unchanged.

HE parenthesized examples are located on printed page 7 (physical page 8); printed page 11 names solid/liquid/gas dissolving and both fractions. Printed page 12 places explicit temperature/saturation work in the facultative section. These actual pages were read again. [BAuA's primary poster](https://www.baua.de/DE/Angebote/Publikationen/Praxis/Poster/GHS-01.pdf?__blob=publicationFile&v=17) and [pictogram explanation](https://www.baua.de/DE/Themen/Chemikalien-Biostoffe/Gefahrstoffe/Einstufung-und-Kennzeichnung/Kennzeichnungselemente/Gefahrenpiktogramme-und-Signalwoerter) were accessed as current indexed primary text; this is not a direct PDF download or an actual product classification.

All 403 original source records remain obligations, not cleared coverage. New IDs, full source/stage/target bindings, native D/P/A/M/V, actual cards/origin/visibility and integrations remain pending. A moderator-mediated simulator specification is a bounded material protocol, not implemented software or learner evidence. All materials remain `ai_candidate`, `needs_human_review`, E1/G1. No human approval or trial is claimed.

Current active strict coverage: Chemistry 112/378, Biology 67/383. New strict science closures 0; restored active bindings 0. Mathematics and Physics M7 inputs remain exact. Historical author and independent A artifacts remain unchanged.
'''
(out / 'README.md').write_text(readme)
script = out / 'finalize-targeted-author-v2.py'
script.write_bytes(Path(__file__).read_bytes())
inputs = [binding(base / 'seven-routines-and-fourteen-cases.author.final.freeze.json'),
          binding(base / 'seven-routines.de-en.author-candidate.json'),
          binding(materials / 'cases.de-en.author-candidate.json'),
          binding(materials / 'primary-cards.de-en.author-candidate.json'),
          binding(root / 'chemie-b007-seven-routines-fourteen-cases-independent-a-v1' / 'independent-a.final.freeze.json'),
          binding('curricula/DE/Gymnasium/input/HE/lower-secondary/g9-chemie.pdf')]
own_files = [binding(path) for path in sorted(out.iterdir()) if path.is_file()]
write('targeted-materials.author-v2.final.freeze.json', {
    'schemaVersion': 1, 'freezeId': 'chemistry-b007-targeted-materials-author-v2-20261006',
    'createdAtUTC': now, 'files': own_files, 'inputBindings': inputs,
    'changedCompleteCaseObjects': 5, 'wholeCasesUnchanged': 9,
    'changedRoutineEssentialObjects': 1, 'wholeRoutinesUnchanged': 6,
    'wholePrimaryCardsUnchanged': 2, 'newStrictClosures': 0,
    'independentFollowupRequired': True, 'nativeApproval': False,
    'humanApproval': False, 'humanTrial': False,
})
print(json.dumps({'freeze': binding(out / 'targeted-materials.author-v2.final.freeze.json'),
                  'ownFiles': len(own_files), 'inputs': len(inputs), 'changedCases': 5,
                  'exactCases': 9, 'activeInputsExact': len(current_inputs), 'strictGain': 0}))
