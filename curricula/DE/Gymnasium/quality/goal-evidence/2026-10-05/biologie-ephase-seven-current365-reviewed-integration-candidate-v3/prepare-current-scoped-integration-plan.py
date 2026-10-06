#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Prepare only the explicit E7 source/atlas and registry deltas on active42/365."""
from pathlib import Path
from datetime import datetime,timezone
import copy,hashlib,json,shutil
ROOT=Path.cwd().resolve();OWN=Path(__file__).resolve().parent;REL=OWN.relative_to(ROOT);TECH=OWN.parent/'biologie-ephase-seven-current365-native-candidate-v2';ISO=ROOT/'tmp/biologie-q1-bacterial-structure-fission-native-isolated-20261005-v1'
REG='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';CAN='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
read=lambda p:json.loads(p.read_text());sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,v):p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def spans(t):
 p=t.index('[',t.index('"subjects"'))+1;d=json.JSONDecoder();out={}
 while True:
  while t[p].isspace()or t[p]==',':p+=1
  if t[p]==']':return out
  v,n=d.raw_decode(t[p:]);out[v['subject']]=(p,p+n,v,t[p:p+n]);p+=n
assert not (OWN/'integration-plan.json').exists();lock=read(OWN/'technical-sequence-and-current42-lock.json');assert sha(ROOT/CAN)==sha(ISO/CAN)==lock['canonicalSHA256']
text=(ROOT/REG).read_text();parts=spans(text);bio=copy.deepcopy(parts['biologie'][2]);assert bio==lock['currentBiologieConfig']
ids=lock['expectedOnlySevenNewScientificGoalIds'];idx=OWN/'native-finalbook/resolution-index.json';x=read(idx);assert len(x['resolutions'])==7 and {r['goalId']for r in x['resolutions']}==set(ids) and all(r['strictDescriptionComplete']for r in x['resolutions'])
owners={r['goalId']:p for p in bio['resolutionIndexPaths']for r in read(ROOT/p)['resolutions']if r['goalId']in ids};assert not owners,'Review explicit existing owner before any supersession'
newIndex=str(idx.relative_to(ROOT));newP=str(REL/'positive-evidence.config.json');assert newIndex not in bio['resolutionIndexPaths'] and newP not in bio['positiveEvidenceConfigPaths'];bio['resolutionIndexPaths'].append(newIndex);bio['positiveEvidenceConfigPaths'].append(newP)
replacement=json.dumps(bio,ensure_ascii=False,indent=2).replace('\n','\n    ');a,b=parts['biologie'][:2];future=text[:a]+replacement+text[b:];assert all(parts[s][3]==spans(future)[s][3]for s in parts if s!='biologie')
(OWN/'central-registry.before.snapshot.json').write_text(text);(OWN/'central-registry.proposed.json').write_text(future);write(OWN/'central-biologie-future.config.json',{**read(ROOT/REG),'subjects':[bio]})
deltas=[];unchanged=[]
for p in sorted((TECH/'prospective-input-tree').rglob('*')):
 if not p.is_file():continue
 rel=str(p.relative_to(TECH/'prospective-input-tree'));assert not p.is_symlink();assert rel!=CAN and 'goal-visualization'not in rel
 after=sha(p);before=sha(ROOT/rel)if(ROOT/rel).is_file()else None;assert sha(ISO/rel)==after
 if before==after:unchanged.append({'path':rel,'sha256':after});continue
 deltas.append({'futureActivePath':rel,'prospectiveCopyPath':str(p.relative_to(ROOT)),'sha256':after,'activeSHA256Before':before,'bytes':p.stat().st_size})
assert any('/source-extraction/'in r['futureActivePath']for r in deltas) and any('/mapping/DE-HE/'in r['futureActivePath']for r in deltas)
assert all(r['futureActivePath'].startswith(('curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/','curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/','app/scripts/config/goal-books/'))for r in deltas)
guards=read(OWN/'existing-reviewed-p-seven-native-binding-and-preservation.actual.json')['wholeA365_M365_P42_QA49ExistingInputsSHAExact']
for r in guards:assert sha(ROOT/r['path'])==sha(ISO/r['path'])==r['sha256']
manifest=read(ISO/'app/scripts/config/goal-books/source-views/de-gym-biology-national-atlas/source-projection.receipt.json');deltaPaths={r['futureActivePath']for r in deltas};other={r['path']:r['sha256']for r in guards}
for r in manifest['inputBindings']:
 if r['path']not in deltaPaths:assert sha(ROOT/r['path'])==sha(ISO/r['path'])==r['sha256'].removeprefix('sha256:');other[r['path']]=r['sha256'].removeprefix('sha256:')
plan={'schemaVersion':1,'status':'inactive_scoped_candidate_requires_actual_future49_native_report','atUTC':datetime.now(timezone.utc).isoformat(),'centralRegistryPath':REG,'currentBiologieRawEntrySHA256':hashlib.sha256(parts['biologie'][3].encode()).hexdigest(),'proposedBiologie':bio,'protectedMathPhysRawEntries':{s:hashlib.sha256(parts[s][3].encode()).hexdigest()for s in ['mathematik','physik']},'unrelatedChemieRegistryPreservedAtApplication':True,'canonicalPath':CAN,'canonicalSHA256MustRemain':lock['canonicalSHA256'],'explicitCanonicalFieldDeltas':[],'newCanonicalGoals':[],'explicitFutureDeltaFiles':deltas,'unchangedAtlasOutputFiles':unchanged,'unchangedCurrentEvidenceGuards':[{'path':p,'sha256':h}for p,h in sorted(other.items())],'currentDescriptionIndexPath':newIndex,'currentDescriptionIndexSHA256':sha(idx),'currentP7ConfigPath':newP,'noDescriptionSupersessions':True,'fullA365M365AndCardsPreservedExactly':True,'fullCurrentQA49AndHumanFieldsPreservedExactly':True,'protectedCurrentStrict42GoalIds':lock['protectedCurrentStrict42GoalIds'],'expectedOnlySevenNewScientificGoalIds':ids,'expectedFutureStrict':49,'expectedDenominator':365,'technicalCurrent365FreezePath':lock['technicalCurrent365FreezePath'],'technicalCurrent365FreezeSHA256':lock['technicalCurrent365FreezeSHA256'],'exactReviewFreezeGuards':read(OWN/'reviewed-inputs.json')['reviewFreezeGuards'],'onlySevenSourceRowAndThreeExactToPartialDeltas':True,'other358SourceFacetsIncludingBacteriaAndFissionExact':True,'scientificSourceHoldsRemainSeparate':True,'forceCountOrStatus':False,'wholeSnapshotResetPermitted':False,'newIndependentScienceReviews':0,'humanApproval':False,'humanTrial':False,'activeWrites':0}
plan['reviewAddendumGuards']=read(OWN/'reviewed-inputs.json')['reviewAddendumGuards']
write(OWN/'integration-plan.json',plan);shutil.copytree(OWN,ISO/REL,dirs_exist_ok=True)
print(json.dumps({'changedSourceAndAtlasFiles':len(deltas),'unchangedAtlasFiles':len(unchanged),'canonicalChanges':0,'predictedFuture49RequiresActualNativeCheck':True,'activeWrites':0}))
