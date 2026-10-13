from pathlib import Path
import copy, datetime, hashlib, json

R = Path('/home/enpasos/projects/skillpilot')
E = R / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12'
O = E / 'chemie-polymers18-current231-inactive-normal-preparation-technical-20261013-v1'
S = E / 'chemie-polymers-three-visual-Pscope-atomicity-author-successor-20261013-v3'
N = E / 'chemie-f947-explicit-repeat-and-complete-water-path-author-root-20261013-v7'
G = 'f947cd04-952a-5a9d-9445-3ffc70e02c3c'
rd = lambda p: json.loads(p.read_text())
rp = lambda p: str(p.relative_to(R))
sha = lambda p: 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()

def wr(p, value):
    p.parent.mkdir(parents=True, exist_ok=True)
    assert not p.exists(), p
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

assert not N.exists()
cases = [copy.deepcopy(c) for c in rd(S / 'whole40.expanded-cases.author-successor.json')['cases'] if c['goalId'] == G]
profile = copy.deepcopy(next(p['profile'] for p in rd(S / 'whole20.profile-payloads.author-successor.json')['profiles'] if p['goalId'] == G))
assert len(cases) == 2
old_cases, old_profile = copy.deepcopy(cases), copy.deepcopy(profile)
tasks = {
    'f947cd04-case-1': (
        'Formuliere die trockene Reaktion R–N=C=O + HO–R′ einschließlich der Produktstruktur. Leite außerdem aus dem angegebenen Diol und Diisocyanat eine valenzrichtige Wiederholungseinheit der linearen Polyurethankette in Charge L ab. Zähle Gruppen und erkläre Ketten- bzw Vernetzungstendenz. Übertrage auf einen formstabilen Klebstoff und nenne eine Grenze des idealen Modells.',
        'Formulate the dry reaction R–N=C=O + HO–R′ including the product structure. Additionally derive a valence-correct repeat unit of the linear polyurethane chain in batch L from the supplied diol and diisocyanate. Count groups and explain chain versus crosslinking tendencies. Apply to a shape-stable adhesive and state one limit of the ideal model.'),
    'f947cd04-case-2': (
        'Erkläre Hauptreaktion und Nebenreaktion. Berechne die theoretische CO₂-Stoffmenge, den NCO-Verbrauch und den dann für OH verbleibenden NCO-Vorrat, wenn die angegebenen 2 mmol Wasser den vollständigen gegebenen Zweischrittpfad durchlaufen. Beurteile Gleichsetzung von Blasen mit erfolgreicher trockener Polyaddition und begründe eine Vergleichskontrolle.',
        'Explain main and side reactions. Calculate the theoretical amount of CO₂, NCO consumption and the NCO inventory then remaining for OH if the supplied 2 mmol water undergo the complete given two-step route. Assess whether bubbles prove successful dry polyaddition and justify a comparison control.')
}
for case in cases:
    case['taskDe'], case['taskEn'] = tasks[case['caseId']]
    brief = next(b for b in profile['applicationCaseBriefs'] if b['id'] == case['caseId'])
    brief['taskDemandDe'], brief['taskDemandEn'] = case['taskDe'], case['taskEn']
    assert brief['expectedPerformanceDe'] == case['modelAnswerDe']
    assert brief['expectedPerformanceEn'] == case['modelAnswerEn']
for before, after in zip(old_cases, cases):
    assert {k: v for k, v in before.items() if k not in ['taskDe', 'taskEn']} == {k: v for k, v in after.items() if k not in ['taskDe', 'taskEn']}
assert {k: v for k, v in old_profile.items() if k != 'applicationCaseBriefs'} == {k: v for k, v in profile.items() if k != 'applicationCaseBriefs'}
wr(N / 'positive/whole-two-cases.explicit-demands.author.json', {'schemaVersion': 1, 'license': 'CC-BY-4.0', 'authorOnly': True, 'goalIds': [G], 'cases': cases})
cfg = rd(O / 'configs/P18.author.inactive.config.json')
cfg.update(reviewId='chemie-f947-explicit-repeat-complete-water-path-author-20261013-v7', reviewPath=rp(N / 'positive/P1.explicit-task.author.normal.jsonl'))
cfg['scope'] = {'label': 'One authored explicit task successor; fresh paired review pending', 'goalIds': [G]}
wr(N / 'configs/P1.author.inactive.config.json', cfg)
wr(N / 'positive/P1.author-candidate-set.json', {'schemaVersion': 1, 'authoringContract': 'positive-understanding-evidence-candidates-v1', 'reviewId': cfg['reviewId'], 'reviewedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'reviewer': 'Codex root scoped chemistry case author; no independent acceptance', 'goals': [{'goalId': G, 'reason': 'Case1 explicitly demands the unchanged valence-correct polyurethane repeat motif; case2 explicitly fixes the complete water/amine two-step condition and remaining NCO inventory. Data, model answers, credit criteria, goal, image, sources and memory are preserved. Fresh independent paired reading pending; no laboratory execution, learner mastery or human acceptance.', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1', 'profile': profile}]})
raw = (O / 'positive/P18.author.one-thermal-v4.raw17-exact.jsonl').read_text().splitlines()
kept = [line for line in raw if json.loads(line)['goalId'] != G]
assert len(kept) == 17
path = N / 'positive/P17.original-frozen-author.raw-exact.jsonl'
path.write_text('\n'.join(kept) + '\n')
p17 = rd(O / 'configs/P18.author.inactive.config.json')
p17['reviewPath'] = rp(path)
p17['scope']['goalIds'] = [gid for gid in p17['scope']['goalIds'] if gid != G]
wr(N / 'configs/P17.retained.inactive.config.json', p17)
book = rd(O / 'configs/whole402.inactive.config.json')
book.update(bookId='chemie-polymers18-one-explicit-f947-task-v7', title='Chemie – aktueller Gesamtumfang mit expliziter Polyurethan-Aufgabe', outputPath=rp(N / 'native/whole402.one-task-successor.normal-model.json'), evidenceReviewPaths=[rp(O / 'positive/current231.actual-active.raw-exact.jsonl'), rp(path), cfg['reviewPath']])
wr(N / 'configs/whole402.inactive.config.json', book)
native = rd(O / 'configs/native-D18.final-current231.batch.config.json')
native.update(batchId='chemie-f947-current231-explicit-repeat-water-path-native-20261013-v7', bookId='chemie-f947-explicit-task-native-v7', title='Chemie – Polyurethan: explizite Wiederholungseinheit und Stoffbilanz', baseGoalBookConfigPath=rp(N / 'configs/whole402.inactive.config.json'), goalIds=[G], outputDirectory=rp(N / 'native-D1'))
wr(N / 'configs/native-D1.batch.config.json', native)
wr(N / 'AUTHOR.one-profile-content-change-and-retention.actual.json', {'schemaVersion': 1, 'role': 'Actual authored clarification, not a hash-only review', 'changedGoalId': G, 'changedFullCaseFields': ['case1.taskDe', 'case1.taskEn', 'case2.taskDe', 'case2.taskEn'], 'matchingProfileBriefsChanged': True, 'case1RepeatUnitDemandNowExplicit': True, 'case2CompleteSidePathAndRemainingInventoryNowExplicit': True, 'allDataModelAnswersAndRubricsExact': True, 'allOther17POriginalRawLinesExact': True, 'allGoalBodiesImagesSemanticAndMemoryInputsUnchanged': True, 'originalWhole40CasesPreservedForOther17': True, 'originalCaseFileBinding': {'path': rp(S / 'whole40.expanded-cases.author-successor.json'), 'sha256': sha(S / 'whole40.expanded-cases.author-successor.json')}, 'currentBaseSHA256': sha(R / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'), 'strictGain': 0, 'activeWrites': False, 'humanApproval': False, 'freshIndependentPairStillRequired': True})
print(rp(N))
