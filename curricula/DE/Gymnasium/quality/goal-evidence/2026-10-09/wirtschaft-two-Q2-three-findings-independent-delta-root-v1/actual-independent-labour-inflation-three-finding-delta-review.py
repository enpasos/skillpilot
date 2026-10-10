from copy import deepcopy
from datetime import datetime, timezone
from hashlib import sha256
import json
from pathlib import Path
import subprocess
import sys

ROOT = next(p for p in Path(__file__).resolve().parents if (p/'AGENTS.md').is_file() and (p/'curricula').is_dir())
OUT = Path(__file__).resolve().parent
BASE = ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09'
AUTHOR = BASE/'wirtschaft-Q2-forty-native-terminal-gaps-nine-whole-materials-author-v1'
OLD = AUTHOR/'nine-whole-Q2-portable-official-reference-and-own-aid-successor-v6'
NEW = AUTHOR/'two-whole-Q2-labour-inflation-bounded-root-findings-author-successor-v7'
PRIOR = BASE/'wirtschaft-four-Q2-materials-independent-root-v1'
sys.path.insert(0, str(ROOT/'scripts'))
from validate_schemas import curriculum_symlink_errors
from jsonschema import Draft202012Validator


def bind(p):
    raw = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': sha256(raw).hexdigest(), 'bytes': len(raw)}


def write(name, data):
    p = OUT/name
    assert not p.exists(), 'Do not replace historical review evidence.'
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2)+'\n')
    json.loads(p.read_text())
    return bind(p)


inputs = [NEW/'whole-two-Q2-DRAFT-assessment-goals.bounded-author-successor-v7.json',
          NEW/'actual-final-two-whole-Q2-materials-three-root-findings-author-successor-v7.handoff.json',
          OLD/'whole-nine-Q2-DRAFT-assessment-goals.source-portable-successor-v6.json',
          OLD/'whole-CAN416-nine-source-portable-Q2-DRAFT-materials.inert-successor-v6.json',
          NEW/'whole-CAN416-nine-Q2-DRAFT-materials.only-two-bounded-successors-v7.json',
          PRIOR/'actual-final-independent-four-Q2-whole-materials-two-KEEP-two-REVISE-and-three-real-findings.receipt.json',
          PRIOR/'actual-eight-independent-whole-synthetic-counteranswers-and-individual-manual-rubric-assessment.json',
          PRIOR/'actual-independent-Decimal-and-rubric-sums.json',
          ROOT/'docs/landscape-runtime.schema.json',
          ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json']
for slug in ['q2-shared-labour-transition', 'q2-LK-inflation-and-cycle']:
    inputs.extend([OLD/(slug+'.whole-material-and-performance-map.portable-final-v6.json'),
                   NEW/(slug+'.whole-material-and-performance-map.bounded-author-successor-v7.json')])
guards = [bind(p) for p in inputs]
assert guards[0]['sha256'] == 'f7468243a828fd2fc0cdeb81036a02cd8433558ad5926fbaecbe3ddab71aad6d'
assert guards[1]['sha256'] == 'bf64b4459f27780c9af6426a34306d973f89d01da49b077d098b745edf82363e'
assert guards[5]['sha256'] == '663f9902030c54cde583462e99a250919a7c2e8f4712b398ead531b12519c2d8'
old_goals = {g['id']:g for g in json.loads(inputs[2].read_text())}
new_goals = json.loads(inputs[0].read_text())
labour, inflation = new_goals
assert labour['id'] == 'da1d52f1-4e45-5fd5-bad2-85172d9ea7ef'
assert inflation['id'] == '34518145-b7a5-56dc-84fc-8e8b063b2456'


def changes(a,b,path=''):
    assert type(a) == type(b)
    if isinstance(a,dict):
        assert set(a) == set(b)
        return [x for k in a for x in changes(a[k],b[k],path+'/'+k)]
    if isinstance(a,list):
        assert len(a) == len(b)
        return [x for i,(aa,bb) in enumerate(zip(a,b)) for x in changes(aa,bb,path+'/'+str(i))]
    return [{'path':path,'before':a,'after':b}] if a != b else []


actual_changes = {g['id']:changes(old_goals[g['id']],g) for g in new_goals}
assert {c['path'] for c in actual_changes[labour['id']]} == {
    '/examData/sourceArtifactPath','/examData/taskContent','/examData/taskContentEn',
    '/examData/solutionContent','/examData/solutionContentEn','/examData/scoring/steps/2/description'}
assert {c['path'] for c in actual_changes[inflation['id']]} == {
    '/examData/sourceArtifactPath','/examData/taskContent','/examData/taskContentEn'}
for g in new_goals:
    previous = old_goals[g['id']]
    assert {k:v for k,v in previous.items() if k != 'examData'} == {k:v for k,v in g.items() if k != 'examData'}
    assert (previous['examData']['scoring']['maxPoints'],previous['examData']['scoring']['passingPoints']) == (g['examData']['scoring']['maxPoints'],g['examData']['scoring']['passingPoints'])
    assert [s['points'] for s in previous['examData']['scoring']['steps']] == [s['points'] for s in g['examData']['scoring']['steps']]
    assert g['examData']['reviewStatus'] == 'draft'
    assert Path(ROOT/g['examData']['sourceArtifactPath']).is_file()
assert inflation['examData']['solutionContent'] == old_goals[inflation['id']]['examData']['solutionContent']
assert inflation['examData']['solutionContentEn'] == old_goals[inflation['id']]['examData']['solutionContentEn']
assert inflation['examData']['scoring'] == old_goals[inflation['id']]['examData']['scoring']
for suffix in ['Content','ContentEn']:
    a = old_goals[inflation['id']]['examData']['task'+suffix].splitlines()
    b = inflation['examData']['task'+suffix].splitlines()
    assert len(a) == len(b)
    assert [i for i,(x,y) in enumerate(zip(a,b)) if x!=y] == [2]
for old_map, new_map in [(inputs[10],inputs[11]),(inputs[12],inputs[13])]:
    aa=json.loads(old_map.read_text());bb=json.loads(new_map.read_text())
    for x,y in zip(aa['actualIntendedPerformanceMap'],bb['actualIntendedPerformanceMap']):
        assert x['goalId'] == y['goalId'] and x['wholeCurrentGoal'] == y['wholeCurrentGoal']
        assert x['wholeCurrentPositiveRecord'] == y['wholeCurrentPositiveRecord']
old_frame=json.loads(inputs[3].read_text());new_frame=json.loads(inputs[4].read_text())
assert {k:v for k,v in old_frame.items() if k!='goals'} == {k:v for k,v in new_frame.items() if k!='goals'}
new_index={g['id']:g for g in new_frame['goals']}
assert len(old_frame['goals']) == len(new_frame['goals']) == 416
unaffected=[g for g in old_frame['goals'] if g['id'] not in actual_changes]
assert len(unaffected)==414 and all(new_index[g['id']]==g for g in unaffected)

old_cases=json.loads(inputs[6].read_text())
rechecks=[]
for case in old_cases:
    if case['material'] not in ['q2-shared-labour-transition','q2-LK-inflation-and-cycle']:
        continue
    # Actual whole original answers retained; changed step3 now still awards only
    # its two correct figures, not invented bargaining evidence.
    rechecks.append({'originalWholeCounteranswer':case,'currentManualScores':[s['awarded'] for s in case['manualStepScores']],
                     'currentTotal':case['total'],'sameBelowThreshold':True,
                     'actualDeltaReasonDe':'Beide ursprünglichen Arbeitsmarktantworten liefern weiterhin keinen bedingten Demografie-/Tarifmechanismus; die alte2P-Zahlenwertung bleibt. Die Inflationsrubric und alle fachlichen Antworten sind exakt unverändert.'})
assert len(rechecks)==4
assert [r['currentTotal'] for r in rechecks]==[2,14,1,14]
task3_boundaries=[
    {'syntheticTask3AnswerDe':'2000 mal0,65=1300;1800 mal0,75=1350. Mehr Köpfe bedeuten nicht automatisch gleiche qualifizierte Stunden. Da die Bevölkerung schrumpft, steigen alle Löhne unabhängig von Nachfrage und Qualifikation sicher.',
     'manualRubric2plus2plus2':[2,2,0],'total':4,'reasonDe':'Rechnungen und Unterscheidung richtig; der universelle Lohnschluss widerspricht der bedingten Tarifwirkung.'},
    {'syntheticTask3AnswerDe':'Es ergeben sich1300 und1350 Erwerbspersonen. Die höhere Beteiligung gleicht den kleineren Altersbereich hier mehr als aus; die Zahl enthält keine qualifizierten verfügbaren Schichtstunden. Falls berufsspezifische altersbedingte Abgänge passende Stunden bei stabiler Nachfrage verknappen, kann Bindungsentgelt oder tarifliche Weiterbildung wichtiger werden. Die Abgänge und qualifizierten Stunden sind nicht angegeben; Absatzrisiken können die Wirkung verändern, eine allgemeine Lohnerhöhung folgt nicht.',
     'manualRubric2plus2plus2':[2,2,2],'total':6,'reasonDe':'Beide Zahlen, separate Stunden/Qualifikation und begrenzte demografische Tarifwirkung samt fehlender Evidenz tatsächlich gezeigt.'}
]
schema=json.loads(inputs[8].read_text());validator=Draft202012Validator({'$ref':'#/$defs/goal','$defs':schema['$defs']})
assert all(not list(validator.iter_errors(g)) for g in new_goals)
symlinks=curriculum_symlink_errors(ROOT);assert not symlinks
assert guards==[bind(p) for p in inputs]
ignored=subprocess.run(['git','check-ignore','--no-index','--']+[str(p.relative_to(ROOT)) for p in inputs],cwd=ROOT,capture_output=True,text=True)
assert ignored.returncode in [0,1] and not ignored.stdout.strip()
released=deepcopy(new_goals)
for g in released:
    g['examData']['reviewStatus']='released'
    original=deepcopy(g);original['examData']['reviewStatus']='draft'
    assert original==next(a for a in new_goals if a['id']==g['id'])
links={
    'exactWholeDelta':write('actual-nine-changed-fields-two-whole-Q2-successors-and-individual-finding-closure.json',actual_changes),
    'fourWholeOriginalCounteranswersReused':write('actual-four-original-whole-counteranswers-and-two-new-demography-bargaining-boundaries.json',{'wholeRechecks':rechecks,'newTask3Boundaries':task3_boundaries}),
    'onlyTwoWholeReleased':write('whole-two-Q2-labour-inflation-successors.only-reviewed-machine-material-status-released.inert.json',released),
    'actualInputs':write('actual-original-and-bounded-successor-whole-input-guards.json',guards)
}
receipt={'schemaVersion':1,'createdAt':datetime.now(timezone.utc).isoformat(),'reviewer':'/root','author':'/root/economics_merge_audit',
         'scope':'Independent bounded review of exactly three findings on two previously whole-read Q2 materials. Reuse unchanged valid bodies and21-contract original review, no historical restart.',
         'originalWholeFindingReceipt':bind(inputs[5]),'actualAuthorHandoff':bind(inputs[1]),'bindings':links,
         'KEEP':[g['id'] for g in released],'REVISE':[],'BLOCK':[],
         'closedFindingIds':['Q2-LABOUR-INITIAL-POPULATION','Q2-LABOUR-DEMOGRAPHY-BARGAINING','Q2-INFLATION-SUPPLIED-ORIGINAL-PROMISE'],
         'actualSubstantiveDeltaRead':'Whole changed DE/EN task and solution lines plus revised whole6P rubric actually read without truncation after an initial overlong diff tool result. Ten whole current goal/P contracts and414 other whole frame goals confirmed exact.',
         'demographyAssessmentDe':'Die bedingte berufsspezifische Stundenknappheit wird aus demografischen Veränderungen und Beteiligung getrennt erklärt. Fehlende berufsspezifische Altersabgänge werden ausdrücklich als unbekannt behandelt; höhere1300→1350 Beteiligung wird nicht als allgemeiner Lohngarant verwendet.',
         'sourceAttachmentAssessmentDe':'Beide M2-Phrasen benennen die tatsächlich beigegebene eigene Lesehilfe und amtlicheURL/Hash, mit historischem2023Bezug. Kein vollständiger Originaltext wird als beigefügter Pflichtinput behauptet.',
         'allOriginalNumbersAndThresholdsExact':True,'labourPoints':[44,27],'inflationPoints':[46,28],
         'actualFourWholeCounteranswersRemainBelowThreshold':True,'twoNewPartialTask3Boundaries':[4,6],
         'newOrdinaryGoalOrCourseRoleDecision':False,'originalGoalSchemaErrors':0,'symlinkErrors':symlinks,'ignoredMandatoryInputs':[],
         'wholeInputGuardCount':len(guards),'allInputBytesExact':True,'originalsRemainDraft':True,'releaseDeltaOnlyMachineMaterialStatus':True,
         'descriptionSource125MemoryVisualizationOrHumanApproval':False,'humanReview':'pending','learnerTrial':'not performed',
         'liveWrites':False,'strictBefore':{'closed':300,'total':311},'strictAfter':{'closed':300,'total':311},
         'newStrictAcademicClosures':0,'restoredStrictBindings':0,'strictNetGain':0,
         'nextStep':'Assemble the four Root-reviewed Q2 materials only; remainingfive review and their specific successors stay independently pending.'}
print(json.dumps(write('actual-final-independent-two-Q2-three-real-findings-resolved-KEEP.receipt.json',receipt),ensure_ascii=False))
