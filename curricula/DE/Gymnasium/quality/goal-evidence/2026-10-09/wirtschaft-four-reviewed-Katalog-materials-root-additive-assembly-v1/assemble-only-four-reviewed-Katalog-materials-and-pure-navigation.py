from pathlib import Path
from copy import deepcopy
from hashlib import sha256
import json, sys, subprocess
from jsonschema import Draft202012Validator

OUT = Path(__file__).resolve().parent
ROOT = next(p for p in OUT.parents if (p / 'AGENTS.md').is_file())
BASE = OUT.parent
def read(p): return json.loads(p.read_text())
def bind(p): return {'path':str(p.relative_to(ROOT)), 'sha256':sha256(p.read_bytes()).hexdigest()}
def write(name, value):
    p = OUT/name
    with p.open('x') as f: f.write(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
    read(p); return bind(p)

q440 = BASE/'wirtschaft-twelve-reviewed-Q3-Q1-Q4-materials-root-additive-assembly-v1'
career = BASE/'wirtschaft-two-Katalog-career-work-independent-whole-material-review-v1'
market = BASE/'wirtschaft-two-Katalog-market-culture-independent-root-v1'
author = BASE/'wirtschaft-Katalog-seventeen-four-coherent-material-author-v1'
paths = [
    q440/'whole-CAN440-reviewed-E9-Q2-Q3-Q1-Q4-and-three-navigation-KEEP.inert.json',
    q440/'actual-final-twelve-reviewed-Q3-Q1-Q4-materials-additive-CAN440-schema-and-bounded-Q3-navigation.receipt.json',
    career/'actual-final-independent-two-Katalog-KEEP-qualified-author-identity-successor-v2.receipt.json',
    career/'whole-two-Katalog-career-work.independently-reviewed-machine-released.inert.candidate.json',
    career/'two-individual-reviewed-whole-material-semantic-kind-practiceAssessment.native-bindings.json',
    market/'actual-final-independent-two-Katalog-market-culture-eight-performances-P16-whole-materials-KEEP.receipt.json',
    market/'whole-two-Katalog-market-culture.independently-reviewed-machine-released.inert.json',
    market/'three-individual-independent-two-material-one-navigation-practiceAssessment.native-bindings.json',
    author/'whole-four-Katalog-seventeen-materials.DRAFT-terminal-goals.author-candidate.json',
    author/'whole-one-Katalog-prerequisite-free-material-navigation.cluster.author-candidate.json',
    ROOT/'docs/landscape-runtime.schema.json',
]
assert bind(paths[1])['sha256']=='14a18800adb9fc042ad93f0c38612adc8e96c2bdab746ab47a198d83f1bd9d2d'
assert bind(paths[2])['sha256']=='5b8fb839f2f663e5b984ba9b951b9fa109118a9c24fbf7fb26a4b6b40b79e162'
assert bind(paths[5])['sha256']=='b760d3ffc760ff7316e21efba111277296496f7e3aa21d5a246a06986b48765c'
guards=[bind(p) for p in paths]
for p in paths: read(p)
base=read(paths[0]);assert len(base['goals'])==440
old=deepcopy(base); originals={g['id']:g for g in read(paths[8])}
released={g['id']:g for p in [paths[3],paths[6]] for g in read(p)}
nav=read(paths[9]);assert nav['requires']==[] and nav['type']=='cluster'
assert set(nav['contains'])==set(released)==set(originals) and len(released)==4
for gid,g in released.items():
    expected=deepcopy(originals[gid]);expected['examData']['reviewStatus']='released'
    if gid in {i['id'] for i in read(paths[3])}:
        assert 'reviewNote' not in expected['examData']
        note=g['examData']['reviewNote'];assert 'no human' in note.lower()
        expected['examData']['reviewNote']=note
    assert expected==g, gid
    assert g['requires']==g['examData']['coveredGoalIds']
kind=[d for p in [paths[4],paths[7]] for d in read(p)['decisions']]
assert {d['goalId'] for d in kind}==set(released)|{nav['id']} and len(kind)==5
for d in kind:
    assert d['semanticKind']=='practiceAssessment' and d['decisionStatus']=='authoritative'
before={g['id']:g for g in old['goals']}
assert not set(before)&(set(released)|{nav['id']})
root_id='96183c48-b499-54d7-8530-578f6ff40207'
root_goal=next(g for g in base['goals'] if g['id']==root_id)
root_goal['contains'].append(nav['id'])
base['goals'].extend([deepcopy(released[i]) for i in nav['contains']]+[deepcopy(nav)])
after={g['id']:g for g in base['goals']};assert len(after)==445
assert all(after[i]==g for i,g in before.items() if i!=root_id)
expected_root=deepcopy(before[root_id]);expected_root['contains'].append(nav['id']);assert after[root_id]==expected_root
old_exams={g['id']:g['examData'] for g in old['goals'] if g.get('examData')}
assert len(old_exams)==77 and all(after[i]['examData']==e for i,e in old_exams.items())
errors=[{'path':list(e.path),'message':e.message} for e in Draft202012Validator(read(paths[10])).iter_errors(base)]
assert not errors,errors
write('whole-four-Katalog-materials.exact-independent-reviewed-machine-releases.json',[released[i] for i in nav['contains']])
frame=write('whole-CAN445-reviewed-E9-Q2-Q3-Q1-Q4-Katalog-and-pure-navigation.inert.json',base)
write('five-independent-Katalog-practiceAssessment.kind-decisions.exact-inputs.json',kind)
write('actual-before-CAN445-native-graph-and-new20-kind-binding.guards.json',guards)
print(json.dumps({'frame':frame,'wholeGoals':445,'acceptedKatalogMaterials':4,'wholePerformanceContracts':17,'oldWholeExamDataExact':77,'newExamDataTotal':81,'schemaErrors':errors,'strictNetGain':0,'liveWrites':False}))
