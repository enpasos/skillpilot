#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Read-only whole-guard verification; simulate this AUTHOR CAS in memory only.
No --apply mode: actual adoption remains the parent-owned step after foreign reviews.
"""
import argparse,pathlib,json,hashlib,copy
R=pathlib.Path('/home/enpasos/projects/skillpilot');O=R/'tmp/chemie-m7-resumed-20261016/generic-SekI-fourteen-interface-author-candidate-v1'
a=argparse.ArgumentParser();a.add_argument('--capsule-root',default=str(R/'tmp/chemie-m7-resumed-20261016/chemie-shared640-recycling-native-author-capsule-L6-v1'));args=a.parse_args();L=pathlib.Path(args.capsule_root).resolve()
def load(p):return json.loads(p.read_text())
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def fp(x):return 'sha256:'+hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
p=O/'CAS.FINAL.two-whole-goals-three-whole-views-two-SEM-bindings.AUTHOR.inactive.json';assert sha(p)=='sha256:14327a3ad640f5acaab16626aa645b8393c56978640be74dd10ffafc806396ca';c=load(p)
for key in ['scienceFIRST','additiveNIScienceFIRST']:assert sha(R/c[key]['path'])==c[key]['sha256']
for g in load(O/'INPUTPINS.source-current-P-M-and-stock-contracts.unchanged.json')['files']:
 assert sha(R/g['path'])==g['sha256']

cr='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';sr='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json';assert sha(L/cr)==c['baselineCanonical']['sha256'];assert sha(L/sr)==c['baselineSEM']['sha256'];can=load(L/cr);sem=load(L/sr);afterCan=copy.deepcopy(can);afterSEM=copy.deepcopy(sem)
for op in c['goalOperations']:
 assert op['targetPath']==cr
 hits=[i for i,g in enumerate(can['goals']) if g['id']==op['goalId']];assert len(hits)==1;j=hits[0];assert can['goals'][j]==op['before'];assert fp(op['before'])==op['beforeWholeFingerprint'];assert fp(op['after'])==op['afterWholeFingerprint'];rest=copy.deepcopy(op['after']);rest['requires']=op['before']['requires'];assert rest==op['before'];afterCan['goals'][j]=op['after']
for op in c['semanticBindingOperations']:
 assert op['targetPath']==sr
 hits=[i for i,d in enumerate(sem['decisions']) if d['goalId']==op['goalId']];assert len(hits)==1;j=hits[0];assert sem['decisions'][j]==op['before'];assert fp(op['before'])==op['beforeWholeFingerprint'];assert fp(op['after'])==op['afterWholeFingerprint'];rest=copy.deepcopy(op['after']);rest['sourceFingerprint']=op['before']['sourceFingerprint'];assert rest==op['before'];afterSEM['decisions'][j]=op['after']
views=[]
for op in c['viewOperations']:
 path=L/op['targetPath'];assert sha(path)==op['expectedCurrentFileSha256'];assert load(path)==op['before'];assert fp(op['before'])==op['beforeWholeFingerprint'];assert fp(op['after'])==op['afterWholeFingerprint'];assert load(R/op['afterFile']['path'])==op['after'];assert sha(R/op['afterFile']['path'])==op['afterFile']['sha256'];views.append({'path':op['targetPath'],'targetAdditions':len(op['addedTargetIds'])})
changed=[b['id'] for b,a in zip(can['goals'],afterCan['goals']) if a!=b];assert len(changed)==2;assert len(can['goals'])==len(afterCan['goals'])==641;assert sem['counts']==afterSEM['counts'];assert len(sem['decisions'])==641;assert c['sourceOperations']==[]
print(json.dumps({'role':'Read-only guarded CAS simulation, no approval/application','capsule':str(L),'canonicalBefore':sha(L/cr),'SEMBefore':sha(L/sr),'wholeGoalBeforeGuards':2,'wholeSEMBeforeGuards':2,'wholeViewBeforeGuards':3,'other639GoalsAndDecisionsExact':True,'preserveSEMCounts':True,'sourceOperations':0,'newAtoms':0,'viewChanges':views,'changedGoalIds':changed,'APVDependencies':'requires changes affect real compiler dependency; a later actual source-state compilation is required before source synchronization. View-only role additions alone are ignored by that compiler. No APV performed here.','filesWritten':0,'applied':False,'independentVotes':0,'HumanApproval':False,'HumanTrial':False,'M7Claim':False},ensure_ascii=False,indent=2))
