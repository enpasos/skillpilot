# SPDX-License-Identifier: Apache-2.0
import json,shutil,hashlib,os
from pathlib import Path
R=Path('/home/enpasos/projects/skillpilot');V1=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-two-source-485-and-ENG-EKG-aggregate-author-20261007-v1';O=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-three-source-485-ENG-EKG-and-e70-BW-author-20261007-v2';B=O/'native-isolated-repository';E='e70d8a85-2dea-5165-919b-200fee9f4db4';C='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
def rd(p):return json.loads(p.read_text())
def wr(p,d):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
O.mkdir()
for p in V1.iterdir():
 if p.name in ['author.final.freeze.json','native-two','reviewer-entry','author-scripts','README.md','native-applicability.current-author.actual.json','current390-and95-native-preservation.actual.author.json']:continue
 if p.is_dir():shutil.copytree(p,O/p.name,symlinks=True)
 else:shutil.copyfile(p,O/p.name)
canon=rd(B/C);e=next(g for g in canon['goals'] if g['id']==E);before=json.loads(json.dumps(e));e['applicability']['jurisdiction']=sorted(e['applicability']['jurisdiction']+['DE-BW']);wr(B/C,canon)
g=rd(O/'guarded-author-candidate.current-Bio4-base.manifest.json');g['fieldPatches'].append({'goalId':E,'fieldPaths':['applicability'],'beforeWholeGoal':before,'afterWholeGoal':e,'scope':'Add native compiled BW jurisdiction already supported by unchanged current reviewed BW partial DNA Verdopplungsfaehigkeit route; all scientific fields, prerequisites, exam and image bytes exact.'});g['candidateCanonicalPath']=str((B/C).relative_to(R));g['candidateCanonicalSha256']=hashlib.sha256((B/C).read_bytes()).hexdigest()
for row in g['mappingPatches']:row['candidatePath']=row['candidatePath'].replace(V1.name,O.name)
g['candidateSemanticLedgerPath']=g['candidateSemanticLedgerPath'].replace(V1.name,O.name);wr(O/'guarded-author-candidate.current-Bio4-base.manifest.json',g)
bs=json.loads((R/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json').read_text());subj=next(x for x in bs['subjects'] if x['subject']=='biologie');profile=None;route=None
for path in subj['positiveEvidenceConfigPaths']:
 cfg=rd(R/path)
 if E in cfg['scope']['goalIds']:
  records=[json.loads(x) for x in (R/cfg['reviewPath']).read_text().splitlines() if x];profile=next(x['profile'] for x in records if x['goalId']==E);route={'config':path,'records':cfg['reviewPath'],'profileOnlyReuse':True}
assert profile
profiles=rd(O/'candidate/two-complete-P-profiles-four-cases.DE-EN.author.json');profiles['profiles'].append({'goalId':E,'profile':profile});wr(O/'candidate/three-complete-P-profiles-six-cases.DE-EN.author.json',profiles);(O/'candidate/two-complete-P-profiles-four-cases.DE-EN.author.json').unlink();wr(O/'candidate/e70-current-complete-bilingual-profile.author.json',{'goalId':E,'profile':profile,'originalCurrentProfileRoute':route,'scientificBodyUnchanged':True})
sp='curricula/DE/Gymnasium/input/BW/lower-secondary/source-extraction/DE_BW_BIOLOGIE_SEKI_BP2016_V2.source-extraction.json';s=rd(R/sp);sg=next(x for x in s['sourceGoals'] if x['id']=='bw-biology-seki-bp2016-v2-k910-gen-003-5c107b50');orig=rd(O/'primary/exact-original-selected-source-goals.author.json');orig['BWOriginalSource']={'sourceExtractionPath':sp,'sourceLandscapeId':s['sourceLandscapeId'],'sourceDocument':s['sourceDocument'],'sourceGoal':sg,'supportScope':'Unchanged reviewed partial Verdopplungsfaehigkeit component supports current supplied DNA replication model; whole DNA structure/information bullet not solely covered by this goal.'};wr(O/'primary/exact-original-selected-source-goals.author.json',orig)
asset=B/'app/public/assets/goal-visualizations/biologie'/E
if asset.is_symlink():asset.unlink();asset.mkdir()
shutil.copyfile(R/'app/public/assets/goal-visualizations/biologie'/E/(E+'.png'),asset/(E+'.png'));shutil.copyfile(asset/(E+'.png'),O/'selected-existing-images'/(E+'.png'))
wr(O/'v1-preservation-and-v2-exact-delta.author.json',{'v1FreezePath':str((V1/'author.final.freeze.json').relative_to(R)),'v1FreezeSha256':hashlib.sha256((V1/'author.final.freeze.json').read_bytes()).hexdigest(),'v1PreservedImmutable':True,'v2Changes':['distinct campaignIds for each new blind reviewer','third target current e70 with applicability BW appended, all scientific fields/P2/image bytes unchanged','native current three-page bundle and six P cases'],'firstTwoWholeGoalAndProfilesExact':True,'noScienceJudgmentsYet':True,'humanApproval':False,'nativeHelperEdits':False})
print(O)
