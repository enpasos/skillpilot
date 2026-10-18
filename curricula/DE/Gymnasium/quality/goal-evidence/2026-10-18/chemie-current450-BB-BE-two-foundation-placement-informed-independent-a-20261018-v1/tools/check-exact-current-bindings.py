# SPDX-License-Identifier: Apache-2.0
"""Bounded independent snapshot/CAS checks, no new scientific gate."""
import copy,hashlib,importlib.util,json
from pathlib import Path
R=Path.cwd();O=Path(__file__).resolve().parent.parent;A=O.parent/'chemie-current450-BB-BE-two-foundation-placement-author-successor-20261018-v1'
def read(p):return json.loads(Path(p).read_text())
def pin(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verify(p):assert pin(p['path'])==p,p
seal=A/'SEAL.author-two-foundation-placement.json';assert pin(seal)['sha256']=='062071c2387ac547240b23b6e4f207235f7256067740610d9e991854301672b6'
for p in read(seal)['files']:verify(p)
I=read(A/'INPUT.whole-current-two-foundations-P-M-and-existing-memory-goals.json');D=read(A/'AUTHOR.two-explicit-foundation-target-placements.pending.json')
verify(I['canonical']);verify(I['memoryDecisionFile']);C=read(I['canonical']['path']);goals={g['id']:g for g in C['goals']}
registryPath=Path(I['centralOwnerRegistry']['path']);registry=read(registryPath);s=next(x for x in registry['subjects'] if x['subject']=='chemie')
activeP=[]
for x in I['wholeCurrentGoalProfiles']:
 assert goals[x['goalId']]==x['wholeCurrentGoal'];verify(x['nativeProfile']);verify(x['activeOwnerConfig']);cfg=read(x['activeOwnerConfig']['path']);assert x['activeOwnerConfig']['path'] in s['positiveEvidenceConfigPaths'];assert x['goalId'] in cfg['scope']['goalIds'];assert cfg['reviewPath']==x['nativeProfile']['path']; row=json.loads(Path(cfg['reviewPath']).read_text().splitlines()[x['nativeLine']-1]);assert row['goalId']==x['goalId'] and row['profile']==x['wholeCurrentProfile'];activeP.append({'goalId':x['goalId'],'activeConfig':x['activeOwnerConfig'],'nativeRow':x['nativeProfile'],'line':x['nativeLine'],'wholeGoalAndProfileExact':True})
mcfg=read(s['memoryReviewConfigPath']);assert mcfg['reviewPath']==I['memoryDecisionFile']['path'];mrows=[json.loads(t) for t in Path(mcfg['reviewPath']).read_text().splitlines() if t.strip()];m=next(x for x in mrows if x['goalId']=='edcfc5f0-900d-5819-830f-3b14af2bc369');assert m==I['wholeCurrentMemoryDecision']
for g in I['wholeReferencedMemoryGoals']:assert g==goals[g['id']]
cardpath=Path('curricula/DE/Gymnasium/memory-decks/de_gymnasium_chemistry_flashcards_equilibria_q3.de.json');runtime=Path('app/public/data/de_gymnasium_chemistry_flashcards_equilibria_q3.de.json');assert cardpath.read_bytes()==runtime.read_bytes();deck=read(cardpath);card=next(x for x in deck['cards'] if x['id']=='chem_eq_q3_004');assert 'goal:'+m['goalId'] in card['tags']
exactChanges=[]
for pair in D['candidateViews']:
 for k in ['normalBefore','originalCandidate','candidateAfter']:verify(pair[k])
 old=read(pair['originalCandidate']['path']);new=read(pair['candidateAfter']['path'])
 for e in [x for x in D['newExplicitPlacements'] if x['viewId']==new['viewId']]:
  parent=old
  for part in e['parentPointer'].strip('/').split('/'):parent=parent[int(part)] if isinstance(parent,list) else parent[part]
  assert parent['id']==e['parentId'];assert e['addedValue']['projectionRole']=='target';assert not any(n.get('goalId')==e['addedValue']['goalId'] for n in parent['children']);parent['children'].append(e['addedValue'])
 assert old==new,'Changes exceed exact two explicit appends: '+new['viewId'];exactChanges.append({'viewId':new['viewId'],'normalBeforeExact':True,'onlySuccessorChange':'append edcfc target' if new['scope']['jurisdiction']!='DE-BW' else 'byte-identical old candidate','allOldFiveOriginalPlacementsPreserved':True})
oldFirst=O.parent/'chemie-current450-nonBY-eleven-source-binding-independent-a-20261018-v1/FIRST.independent-a.seven-partial-bindings-four-holds-and-two-placement-holds.json';assert pin(oldFirst)['sha256']=='e5b6f09c5d81fe6e4c07821aff012a513a54135f7330d9a98133d11376674f92';oldSeal=oldFirst.parent/'SEAL.independent-a.source-placement.json';assert pin(oldSeal)['sha256']=='baf3dea3a318e2e266146661ca2c57a8191ce311ef4ed84c1c4005f1f7ef244b'
result={'status':'PASS','authorSeal':pin(seal),'authorPinnedFilesVerified':len(read(seal)['files']),'canonical':pin(I['canonical']['path']),'actualCurrentCentralRegistry':pin(registryPath),'currentPBindings':activeP,'activeMemoryConfig':pin(s['memoryReviewConfigPath']),'wholeMemoryDecisionAndThreeMemoryGoalsExact':True,'memoryDeckSourceAndRuntimeByteEqual':True,'wholeSupportingCard004':card,'deckSource':pin(cardpath),'runtimeDeck':pin(runtime),'exactViewChanges':exactChanges,'oldFirstAndHoldUnchanged':pin(oldFirst),'oldSealUnchanged':pin(oldSeal),'normalWrites':0,'newDPAMVVotes':0,'compilerAPOrBuildRuns':0}
spec=importlib.util.spec_from_file_location('validate_schemas',R/'scripts/validate_schemas.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod);e=[x for x in mod.curriculum_symlink_errors(R) if str(O.relative_to(R)) in x];assert not e;result['scopedStockSymlinkErrors']=e
for p in O.rglob('*.json'):read(p)
print(json.dumps(result,ensure_ascii=False,indent=2))
