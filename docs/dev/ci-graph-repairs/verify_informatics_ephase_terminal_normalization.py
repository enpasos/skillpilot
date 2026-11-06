#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Read-only exact replay of nine reviewed E-phase terminal normalizations.
No apply command; no generic reducer; full re-inheritance and both global
closures are recomputed after EVERY serialized origin removal.
"""
from pathlib import Path
import copy, hashlib, json, subprocess, sys
sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(Path(__file__).resolve().parent))
import verify_german_minimality_review as graph

def sha(raw): return hashlib.sha256(raw).hexdigest()
def stable(value): return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()
def require(value, message):
    if not value: raise ValueError(message)
def inspect(manifest):
    require(len(manifest['operations']) == 9 and len(manifest['cases']) == 10, 'Not the fixed nine plus one hold')
    require(sha(stable(manifest['operations'])) == manifest['operationsCanonicalSha256'], 'Operations changed')
    owner = manifest['source']['landscapeId']; terminal = manifest['terminalBefore']['id']; key = owner + ':' + terminal
    require(terminal == '49ba66cf-accd-5938-a63e-f031bc786767', 'Different terminal')
    actual_paths = sorted(str(p.relative_to(ROOT)) for p in (ROOT/'curricula/DE/Gymnasium/canonical').glob('*.json'))
    require(actual_paths == sorted(p['path'] for p in manifest['catalogSources']), 'Canonical file universe changed')
    docs = []
    for pin in manifest['catalogSources']:
        raw = (ROOT/pin['path']).read_bytes()
        require(sha(raw) == pin['sha256'], 'Current source differs: '+pin['path'])
        historic = subprocess.check_output(['git','-C',str(ROOT),'show',manifest['baseCommit']+':'+pin['path']])
        require(raw == historic, 'Git source differs: '+pin['path'])
        doc=json.loads(raw); require(doc['landscapeId'] == pin['landscapeId'], 'Owner differs'); docs.append(doc)
    for pin in manifest['kernels']+[manifest['contentReview']]:
        require(sha((ROOT/pin['path']).read_bytes()) == pin['sha256'], 'Bound evidence/kernel changed')
    require(len(docs)==21 and len({d['landscapeId'] for d in docs})==21, 'Wrong catalog')
    original = graph.Catalog(copy.deepcopy(docs)); cat = graph.Catalog(copy.deepcopy(docs))
    e,_=cat.effective(); g,gc=graph.closure(cat.keys,e); a,ac=graph.closure(cat.atom_keys,cat.atomic(e))
    require(len(cat.keys)==manifest['proof']['goalNodes'] and len(cat.atom_keys)==manifest['proof']['atomicNodes'], 'Universe count changed')
    require(graph.digest_relation(cat.keys,g,'R_effective+') == manifest['proof']['globalGoalClosureBeforeAfterSha256'], 'Goal closure differs')
    require(graph.digest_relation(cat.atom_keys,a,'R_atomic+') == manifest['proof']['globalAtomicClosureBeforeAfterSha256'], 'Atomic closure differs')
    baseline_g,baseline_a=g,a; rows=[]; cases={c['caseId']:c for c in manifest['cases']}
    require([c['caseId'] for c in manifest['cases'] if c['decision']=='hold']==['INFO-E-NORM-08'], 'Held case changed')
    for op in manifest['operations']:
        require(op['op']=='replace' and op['file']==manifest['source']['path'] and op['guardGoalId']==terminal, 'Unexpected mutation')
        pieces=op['path'].split('/'); source=next(d for d in docs if d['landscapeId']==owner)
        require(pieces[:2]==['','goals'] and pieces[-1]=='requires' and len(pieces)==4 and source['goals'][int(pieces[2])]['id']==terminal, 'Wrong field')
        before=cat.nodes[key][1]
        require(sha(stable(before))==op['guardGoalCanonicalSha256'] and before['requires']==op['guardRequiresBefore'], 'Sequential origin guard differs')
        require(op['value']==[r for r in before['requires'] if r != op['removedGoalId']] and len(before['requires'])==len(op['value'])+1, 'Not exactly one bounded removal')
        case=cases[op['caseId']]; require(case['decision']=='conditionally-approve-normalization' and case['removedPrerequisiteGoalId']==op['removedGoalId'], 'Unreviewed removal')
        cat.remove_origin(key,owner+':'+op['removedGoalId']); new_e,origins=cat.effective()
        new_g,new_gc=graph.closure(cat.keys,new_e);new_a,new_ac=graph.closure(cat.atom_keys,cat.atomic(new_e))
        require(new_g==g==baseline_g and new_a==a==baseline_a, 'Global closure changed after '+op['caseId'])
        require((new_gc,new_ac)==(gc,ac), 'Cycle change')
        cat.validate_path(new_e,case['survivingPath']);cat.validate_origins(case['survivingPath'],case['pathOriginEvidenceAfterSequentialRemoval'])
        rows.append({'caseId':op['caseId'],'globalGoalEqualsPreviousAndOriginal':True,'globalAtomicEqualsPreviousAndOriginal':True,'witnessValid':True})
        e,g,a=new_e,new_g,new_a
    for case in manifest['cases']:
        if case['decision']=='hold': continue
        cat.validate_path(e,case['survivingPath']);cat.validate_origins(case['survivingPath'],case['finalSurvivingOriginEvidence'])
    require(cat.nodes[key][1]['requires']==manifest['expectedAfterRequires'], 'Final array differs')
    require(sha(stable(cat.nodes[key][1]))==manifest['expectedAfterGoalCanonicalSha256'], 'Final goal differs')
    require('ace0c141-9e7c-546e-914f-64c24d42d85d' in cat.nodes[key][1]['requires'], 'Held prerequisite removed')
    for k in cat.keys:
        old=original.nodes[k][1];new=cat.nodes[k][1]
        require(old==new if k!=key else {p:v for p,v in old.items() if p!='requires'}=={p:v for p,v in new.items() if p!='requires'}, 'Unreviewed payload mutation')
    for pin in manifest['catalogSources']:require(sha((ROOT/pin['path']).read_bytes())==pin['sha256'],'Source changed during replay')
    return {'status':'PASS-read-only-nine-sequential-and-joint-normalizations-one-hold','dataApplied':False,'qaOrContentApprovalByScript':False,'goalNodes':len(cat.keys),'atomicNodes':len(cat.atom_keys),'cycleComponents':[gc,ac],'steps':rows,'finalWitnessesAllValid':True,'globalGoalChangedSources':0,'globalAtomicChangedSources':0,'wholeTerminalPayloadChangedOnlyInRequires':True,'taskSolutionCoverageScopeMetadataUnchanged':True}
if __name__=='__main__':
    try:
        p=Path(__file__).with_name('informatics-ephase-terminal-normalization-proposal-2026-11-06.json')
        print(json.dumps(inspect(json.loads(p.read_bytes())),ensure_ascii=False,indent=2))
    except (ValueError,KeyError,IndexError,OSError,subprocess.CalledProcessError) as error:
        print(str(error),file=sys.stderr);raise SystemExit(1)
