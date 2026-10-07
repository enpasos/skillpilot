# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import json,copy,hashlib
R=Path('/home/enpasos/projects/skillpilot');O=Path(__file__).resolve().parent;REG='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';T={'485ef1c3-8997-52b7-91f5-b1ddf179013d','e70d8a85-2dea-5165-919b-200fee9f4db4'}
def rd(p):return json.loads(p.read_text())
def rel(p):return str(p.relative_to(R))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,x):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
r=rd(R/REG);before=copy.deepcopy(r);b=next(x for x in r['subjects'] if x['subject']=='biologie');newindex=rel(O/'native-isolated-repository/outputs/prepared-three/resolution-index.json');lineage=[]
for old in b['resolutionIndexPaths']:
 oldidx=rd(R/old)
 for row in oldidx['resolutions']:
  if row['goalId'] in T:b.setdefault('resolutionSupersessions',[]).append({'goalId':row['goalId'],'supersededIndexPath':old,'replacementIndexPath':newindex})
b['resolutionIndexPaths'].append(newindex)
newpaths=[]
for old in b['positiveEvidenceConfigPaths']:
 cfg=rd(R/old);removed=T&set(cfg['scope']['goalIds'])
 if not removed:newpaths.append(old);continue
 stem='neuro20' if '485ef1c3-8997-52b7-91f5-b1ddf179013d' in removed else 'q1-three';newcfg=copy.deepcopy(cfg);newcfg['scope']['goalIds']=[id for id in cfg['scope']['goalIds'] if id not in removed];newcfg['scope']['label']=cfg['scope']['label']+'; exact retained subset after current-three independent source/context repair';source=R/cfg['reviewPath'];lines=source.read_bytes().splitlines(keepends=True);retained=[x for x in lines if json.loads(x)['goalId'] not in removed];assert len(retained)==len(newcfg['scope']['goalIds']);review=O/'retained-positive'/f'{stem}.records.exact.jsonl';review.parent.mkdir(parents=True,exist_ok=True);review.write_bytes(b''.join(retained));newcfg['reviewPath']=rel(review);target=O/'retained-positive'/f'{stem}.future-active.config.json';write(target,newcfg);newpaths.append(rel(target));lineage.append({'oldConfigPath':old,'oldConfigSha256':sha(R/old),'replacementConfigPath':rel(target),'replacementConfigSha256':sha(target),'removedGoalIds':sorted(removed),'retainedGoalIds':newcfg['scope']['goalIds'],'oldReviewPath':cfg['reviewPath'],'oldReviewSha256':sha(source),'retainedReviewPath':rel(review),'retainedReviewSha256':sha(review),'retainedOriginalRecordsByteExact':True,'criteriaPathExact':cfg['reviewCriteriaPath'],'newScienceJudgments':False})
b['positiveEvidenceConfigPaths']=newpaths+[rel(O/'positive-three.future-active.config.json')]
assert all(x==next(y for y in r['subjects'] if y['subject']==x['subject']) for x in before['subjects'] if x['subject']!='biologie')
write(O/'central-registry.future-active.json',r);write(O/'bounded-current-P-config-replacements.technical.json',{'documentType':'Exact bounded P route replacement required by native unique scope and current context checks','boundedPConfigReplacements':lineage,'historicalConfigsAndRecordsUntouched':True,'Bio4CorrectBiologyCriteriaRouteRetainedInNewSubset':True,'humanApproval':False,'activeWrites':False})
# Inert per-config native validation routes change only landscape+kind input paths.
for i,p in enumerate(b['positiveEvidenceConfigPaths']):
 if p==rel(O/'positive-three.future-active.config.json'):continue
 c=rd(R/p);c.update(landscapePath=rel(O/'native-isolated-repository/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'),semanticKindLedgerPath=rel(O/'native-isolated-repository/curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'));write(O/'retained-positive/inert-all-configs'/f'config-{i:02d}.json',c)
print(json.dumps({'newIndex':newindex,'retainedP97':sum(len(rd(R/p)['scope']['goalIds']) for p in newpaths),'targetedReplacementConfigs':len(lineage),'nonBiologyRegistrySubjectsExact':True}))
