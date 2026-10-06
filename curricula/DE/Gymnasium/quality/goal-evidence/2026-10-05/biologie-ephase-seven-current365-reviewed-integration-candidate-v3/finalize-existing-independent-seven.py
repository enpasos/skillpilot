#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Bind only actual frozen current independent D7 decisions; no own science review."""
from pathlib import Path
from datetime import datetime,timezone
import hashlib,json,shutil,subprocess
ROOT=Path.cwd().resolve();OWN=Path(__file__).resolve().parent;REL=OWN.relative_to(ROOT)
TECH=OWN.parent/'biologie-ephase-seven-current365-native-candidate-v2';TREL=TECH.relative_to(ROOT)
ISO=ROOT/'tmp/biologie-q1-bacterial-structure-fission-native-isolated-20261005-v1';OUT=ISO/TREL/'native-finalbook'
read=lambda p:json.loads(p.read_text());sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,v):p.parent.mkdir(parents=True,exist_ok=True);assert not p.is_symlink();p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
inputs=read(OWN/'reviewed-inputs.json');assert inputs['authority']=='existing_actual_final_independent_current_reviews_only'
guards=[{'path':str((TECH/'technical-current365-candidate.final.freeze.json').relative_to(ROOT)),'sha256':'7f92fa4e8f5aa8a83987f95301cb42006d8d0eff9b7ce7a4aacac24dfe874318'}]+inputs['reviewFreezeGuards']
def verify():
 for row in guards:
  path=ROOT/row['path'];assert sha(path)==row['sha256'].removeprefix('sha256:')
  for f in read(path)['files']:assert sha(ROOT/f['path'])==f['sha256'].removeprefix('sha256:')
 for row in inputs['reviewAddendumGuards']:assert sha(ROOT/row['path'])==row['sha256']
verify();lock=read(OWN/'technical-sequence-and-current42-lock.json');assert sha(ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')==lock['canonicalSHA256']
assert sha(OUT/'bundle/book-model.json')==sha(TECH/'native-finalbook/bundle/book-model.json')
ids=read(TECH/'batch.config.json')['goalIds'];current=read(TECH/'native-finalbook/round-a/description-review-input.json');pair=[];copies=[]
for lane,key in [('round-a','reviewAResultsPath'),('round-b','reviewBResultsPath')]:
 source=ROOT/inputs[key];assert source.resolve().is_relative_to(ROOT) and source.is_dir()
 records=[]
 for p in sorted(source.glob('*.records.jsonl')):records.extend(json.loads(line)for line in p.read_text().splitlines()if line.strip())
 assert len(records)==7 and {r['goalId']for r in records}==set(ids)
 rows={r['goalId']:r for r in records}
 for goal in current['goals']:
  r=rows[goal['goalId']];assert r['decision']=='keep',f'Unresolved actual independent D decision {goal["goalId"]}'
  for field in ['goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']:assert r[field]==goal[field]
  assert r['bookDigest']==current['bookDigest'] and r['bundleFingerprint']==current['bundleFingerprint']
 for p in sorted(source.glob('*')):
  assert p.is_file() and not p.is_symlink();dest=OUT/lane/'results'/p.name
  if dest.exists():assert sha(dest)==sha(p)
  else:shutil.copy2(p,dest)
  copies.append({'sourcePath':str(p.relative_to(ROOT)),'sha256':sha(p),'scratchPath':str(dest.relative_to(ISO))})
 pair.append(rows)
decisions=[]
rationales=read(OWN/'synthesis-rationales.json');assert {x['goalId']for x in rationales['decisions']}==set(ids)
assert rationales['actualFourteenIndependentRationalesRead'] and rationales['newIndependentScienceReviewClaimed'] is False
reason={x['goalId']:x for x in rationales['decisions']}
for gid in ids:
 a,b=pair[0][gid],pair[1][gid]
 for field in ['goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn','bookDigest','bundleFingerprint']:assert a[field]==b[field]
 assert a['rationale'].strip() and b['rationale'].strip()
 assert reason[gid]['rationaleDe'].strip() and reason[gid]['rationaleEn'].strip()
 decisions.append({'goalId':gid,'resolutionDecision':'keep_current','evidenceRound':'second','rationaleDe':reason[gid]['rationaleDe'],'rationaleEn':reason[gid]['rationaleEn']})
author={'schemaVersion':1,'manifestId':'biologie-ephase-seven-current365-reviewed-20261005-v3','synthesizedBy':'Codex technical integrator of actual frozen independent current A and Root B evidence; no new scientific review claim','decisions':decisions}
assert not (OWN/'native-current-seven-synthesis.actual.receipt.json').exists();write(OUT/'synthesis-authoring.json',author)
write(OWN/'actual-frozen-independent-seven-pair-synthesis.receipt.json',{'at':datetime.now(timezone.utc).isoformat(),'exactReviewFreezeGuards':guards,'existingCurrentReviewFiles':copies,'actualFourteenExistingRationalesReadForSynthesis':True,'allSevenCompleteDEENAndCurrentBindingsEqual':True,'specificSynthesisAuthoring':author,'newIndependentScienceReviews':0,'humanApproval':False,'activeWrites':0})
write(OWN/'root-independent-b-plant-wording-finding-resolution.actual.json',{'status':'resolved_by_original_reviewer_additive_fact_correction_and_explicit_synthesis','goalId':'9d931642-2287-5277-adb2-082403ad25af','originalFrozenBRecordPreserved':True,'originalB58FreezeSHA256':'59f5ad083e62fa13cb2c9bddea0c4019e921ae2be1c747de2bdc958d435e2bca','finding':'Original rationale incorrectly attributed a new exact-to-partial change to the plant goal.','correctFacts':'Plant HE remains exact-to-exact; existing NI/SL partial connections stay limited. The three actual exact-to-partial changes concern7a79/e566/dd196. Seven HE source-row corrections remain explicit.','reviewerOwnAddendumGuards':inputs['reviewAddendumGuards'],'synthesisCorrectedOwnRationale':reason['9d931642-2287-5277-adb2-082403ad25af'],'scientificKEEPOrInnerPChanged':False,'newClosureByFindingResolution':0,'mechanicalHashReplacement':False,'humanApproval':False,'activeWrites':0})
terminal=[]
def run(name,cmd):
 start=datetime.now(timezone.utc).isoformat();p=subprocess.run(cmd,cwd=ISO,capture_output=True);o=OWN/(name+'.stdout.txt');e=OWN/(name+'.stderr.txt');o.write_bytes(p.stdout);e.write_bytes(p.stderr)
 terminal.append({'command':cmd,'cwd':str(ISO),'startedAtUTC':start,'completedAtUTC':datetime.now(timezone.utc).isoformat(),'actualExitCode':p.returncode,'stdoutPath':str(o.relative_to(ROOT)),'stdoutSHA256':sha(o),'stderrPath':str(e.relative_to(ROOT)),'stderrSHA256':sha(e)})
 write(OWN/'native-current-seven-synthesis.actual.receipt.json',{'commands':terminal,'humanApproval':False,'activeWrites':0});print(name,p.returncode,p.stdout.decode()[:450],p.stderr.decode()[:1400],flush=True);assert p.returncode==0
cfg=str(TREL/'batch.config.json');out=str(TREL/'native-finalbook');tsx=['app/node_modules/.bin/tsx']
run('dual-seven-summarize',tsx+['app/scripts/materializeGoalDescriptionRolloutBatch.ts','summarize','--config',cfg,'--write'])
run('seven-synthesis-manifest',tsx+['app/scripts/materializeGoalDescriptionRolloutSynthesisManifest.ts','--config',cfg,'--authoring',out+'/synthesis-authoring.json','--write'])
run('seven-resolutions-materialize',tsx+['app/scripts/materializeGoalDescriptionRolloutResolutions.ts','--config',cfg,'--synthesis-manifest',out+'/synthesis-decisions.json','--write'])
run('seven-index-materialize',tsx+['app/scripts/materializeGoalDescriptionRolloutBatch.ts','finalize','--config',cfg,'--write'])
run('seven-index-current-check',tsx+['app/scripts/materializeGoalDescriptionRolloutBatch.ts','finalize','--config',cfg])
shutil.copytree(OUT,OWN/'native-finalbook');verify();write(OWN/'all-existing-source-and-independent-freezes-preserved.actual.json',{'guards':guards,'allExact':True,'newFullRepositoryCopy':False,'newScienceReviewClaims':0,'humanApproval':False,'activeWrites':0})
print(json.dumps({'nativeCurrentD7Synthesized':True,'newIndependentScienceReviews':0,'activeWrites':0}))
