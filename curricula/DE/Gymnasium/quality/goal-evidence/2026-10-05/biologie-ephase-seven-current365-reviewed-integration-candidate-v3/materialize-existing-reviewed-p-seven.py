#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Bind actual Root independently reviewed P7, preserving A/M/V and human fields."""
from pathlib import Path
from datetime import datetime,timezone
import hashlib,json,shutil,subprocess
ROOT=Path.cwd().resolve();OWN=Path(__file__).resolve().parent;REL=OWN.relative_to(ROOT);ISO=ROOT/'tmp/biologie-q1-bacterial-structure-fission-native-isolated-20261005-v1'
TECH=OWN.parent/'biologie-ephase-seven-current365-native-candidate-v2';AUTHOR=OWN.parent/'biologie-ephase-seven-current-native-candidate-v1';REG='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';CAN='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json';QA='curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json'
read=lambda p:json.loads(p.read_text());sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,v):p.parent.mkdir(parents=True,exist_ok=True);assert not p.is_symlink();p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
inputs=read(OWN/'reviewed-inputs.json');assert inputs['authority']=='existing_actual_final_independent_current_reviews_only' and inputs['rootIndependentPositiveScienceReviewFinal'] is True
frozenPaths=set()
for row in inputs['reviewFreezeGuards']:
 freeze=ROOT/row['path'];assert sha(freeze)==row['sha256'].removeprefix('sha256:')
 for f in read(freeze)['files']:assert sha(ROOT/f['path'])==f['sha256'].removeprefix('sha256:');frozenPaths.add(f['path'])
source=inputs['reviewedPositiveCandidatePath'];assert source in frozenPaths
reviewed=read(ROOT/source);ids=read(TECH/'batch.config.json')['goalIds'];assert len(reviewed['goals'])==7 and {g['goalId']for g in reviewed['goals']}==set(ids)
lock=read(OWN/'technical-sequence-and-current42-lock.json');assert sha(ROOT/CAN)==sha(ISO/CAN)==lock['canonicalSHA256']
assert not (OWN/'positive-evidence.candidates.json').exists();shutil.copy2(ROOT/source,OWN/'positive-evidence.candidates.json')
author=read(AUTHOR/'positive-evidence.candidates.json');innerChanges=[g['goalId']for g in reviewed['goals']if g['profile']!=next(x['profile']for x in author['goals']if x['goalId']==g['goalId'])]
cfg=read(AUTHOR/'positive.validation-only.config.json');cfg.update(reviewId=reviewed['reviewId'],reviewPath=str(REL/'positive-evidence.review.jsonl'));cfg['scope']['label']='Seven actually independently reviewed current machine profiles; E1/G1 needs human review; no observed learner trial';write(OWN/'positive-evidence.config.json',cfg)
bio=next(s for s in read(ROOT/REG)['subjects']if s['subject']=='biologie');guards={CAN:sha(ROOT/CAN),QA:sha(ROOT/QA)}
for cp in [bio['semanticAtomicityConfigPath'],bio['memoryReviewConfigPath']]+bio['positiveEvidenceConfigPaths']:
 guards[cp]=sha(ROOT/cp);c=read(ROOT/cp)
 for key in ['reviewPath','cardReviewPath','reviewCriteriaPath']:
  if c.get(key):guards[c[key]]=sha(ROOT/c[key])
for path,h in guards.items():assert sha(ISO/path)==h,'Unexpected current scratch input drift '+path
for g in read(ROOT/CAN)['goals']:
 if g['id'] not in ids:continue
 link=next(l for l in g['resourceLinks']if l['type']=='goal-visualization' and l.get('role')=='primary');p=ROOT/('app/public'+link['url']);assert sha(p)==sha(ISO/('app/public'+link['url']))
shutil.copytree(OWN,ISO/REL,dirs_exist_ok=True);terminal=[]
def run(name,cmd):
 start=datetime.now(timezone.utc).isoformat();p=subprocess.run(cmd,cwd=ISO,capture_output=True);o=OWN/(name+'.stdout.txt');e=OWN/(name+'.stderr.txt');o.write_bytes(p.stdout);e.write_bytes(p.stderr)
 terminal.append({'command':cmd,'cwd':str(ISO),'startedAtUTC':start,'completedAtUTC':datetime.now(timezone.utc).isoformat(),'actualExitCode':p.returncode,'stdoutPath':str(o.relative_to(ROOT)),'stdoutSHA256':sha(o),'stderrPath':str(e.relative_to(ROOT)),'stderrSHA256':sha(e)});write(OWN/'native-current-reviewed-P7-and-existing-A-M-V.actual.json',{'commands':terminal,'newScienceReviewClaimed':False,'humanApproval':False,'activeWrites':0});print(name,p.returncode,p.stdout.decode()[:450],p.stderr.decode()[:1400],flush=True);assert p.returncode==0
tsx=['app/node_modules/.bin/tsx'];run('p7-native-materialize',tsx+['app/scripts/materializePositiveGoalEvidenceCandidates.ts','--config',str(REL/'positive-evidence.config.json'),'--candidates',str(REL/'positive-evidence.candidates.json'),'--write'])
run('p7-native-current-check',tsx+['app/scripts/positiveGoalEvidenceReview.ts','--config='+str(REL/'positive-evidence.config.json'),'--mode=check'])
run('a365-current-preservation-check',tsx+['app/scripts/semanticAtomicityReview.ts','--config='+bio['semanticAtomicityConfigPath'],'--mode=check'])
run('m365-current-preservation-check',tsx+['app/scripts/memoryCardReview.ts','--config='+bio['memoryReviewConfigPath'],'--mode=check'])
run('v49-existing-current-preservation-check',tsx+['app/scripts/generateGoalVisualizationQaLedgers.ts','--subject=biologie','--check'])
run('source-atlas-current365-check',tsx+['app/scripts/buildGoalBookSourceAtlasInputs.ts','--config','app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json','--check'])
shutil.copy2(ISO/REL/'positive-evidence.review.jsonl',OWN/'positive-evidence.review.jsonl');rows=[json.loads(x)for x in (OWN/'positive-evidence.review.jsonl').read_text().splitlines()];assert len(rows)==7 and all(r['status']=='needs_human_review'for r in rows)
assert {r['goalId']:r['profile']for r in rows}=={g['goalId']:g['profile']for g in reviewed['goals']}
for path,h in guards.items():assert sha(ROOT/path)==sha(ISO/path)==h
write(OWN/'existing-reviewed-p-seven-native-binding-and-preservation.actual.json',{'actualRootReviewedSourcePath':source,'actualRootReviewedSourceSHA256':sha(ROOT/source),'allSevenInnerProfilesExactlyRootReviewed':True,'authorInnerProfileDifferencesAlreadyRootReviewed':innerChanges,'allSevenMaterializedStatuses':'needs_human_review','wholeA365_M365_P42_QA49ExistingInputsSHAExact':[{'path':p,'sha256':h}for p,h in guards.items()],'newIndependentScienceReviews':0,'humanApproval':False,'humanTrial':False,'activeWrites':0})
print(json.dumps({'actualRootReviewedP7Materialized':True,'existingA365M365V49Preserved':True,'activeWrites':0}))
