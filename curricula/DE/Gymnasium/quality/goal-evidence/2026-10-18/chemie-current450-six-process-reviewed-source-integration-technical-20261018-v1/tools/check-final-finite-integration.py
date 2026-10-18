# SPDX-License-Identifier: Apache-2.0
"""Verify the exact written finite technical integration, without a compiler/build."""
import hashlib, importlib.util, json, subprocess
from pathlib import Path

R=Path.cwd();O=Path(__file__).resolve().parent.parent
read=lambda p:json.loads(Path(p).read_text())
def sha(b):return hashlib.sha256(b).hexdigest()
def dig(x):return sha(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode())
def pin(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'sha256':sha(b),'bytes':len(b)}
def verify(p):assert pin(p['path'])==p,p

plan=read(O/'PLAN.finite-before-inputs-and-selected-transports.json')
actual=read(O/'CHECK.actual-finite-source-epoch-mapping-CAS-and-preservation.json')
view=read(O/'CHECK.actual-sixty-pair-twenty-six-view-roles.json')
assert view['status']=='PASS' and view['counts']['pairs']==60 and view['counts']['views']==26
assert view['counts']['targetAppearances']==117 and view['counts']['nonTargetAppearances']==3
verify(plan['independentAcceptedRef']);verify(plan['scientificSeal']);verify(plan['portableAddressSuccessorSeal'])
accepted=read(plan['independentAcceptedRef']['path'])['mappings'];assert len(accepted)==78
baselines={}
for p in plan['allTouchedBeforePins']:
 b=subprocess.check_output(['git','show',':'+p['path']]);assert sha(b)==p['sha256'] and len(b)==p['bytes'],p
 baselines[p['path']]=json.loads(b)
for p in plan['protectedBeforePins']:verify(p)
sourcechecks=[];newids=[]
for x in actual['sourceChecks']:
 verify(x['after']);n=read(x['path']);old=baselines[x['before']['path']]
 assert n['sourceGoals'][:len(old['sourceGoals'])]==old['sourceGoals']
 assert n['passages'][:len(old['passages'])]==old['passages']
 candidate=next(t for t in plan['sourceTransports'] if t['afterPath']==x['path'])['candidate'];verify(candidate);add=read(candidate['path'])
 assert n['sourceGoals'][len(old['sourceGoals']):]==add['sourceGoalsToAppend']
 assert n['passages'][len(old['passages']):]==add['passagesToAppend']
 ids=[g['id'] for g in n['sourceGoals']];assert len(ids)==len(set(ids))
 pids=[p['id'] for p in n['passages']];assert len(pids)==len(set(pids)) and all(g['passageId'] in pids for g in n['sourceGoals'])
 assert n['pipelineStatus']['selectedProcessIntegration']['totalSourceGoalsActual']==len(ids)
 assert not n['pipelineStatus']['selectedProcessIntegration']['wholeSourceCoverageComplete']
 assert next(s for s in n['pipelineStatus']['steps'] if s['id']=='MAPPING-3')['status']=='incomplete'
 sourcechecks.append({'path':x['path'],'beforeIndexBytesMatchRecordedCAS':True,'after':pin(x['path']),'retainedWholeSourceArraySHA256':dig(old['sourceGoals']),'retainedWholePassageArraySHA256':dig(old['passages']),'retainedSourceCount':len(old['sourceGoals']),'addedExactWholeSources':len(add['sourceGoalsToAppend'])})
 newids.extend(g['id'] for g in add['sourceGoalsToAppend'])
assert len(newids)==70 and len(set(newids))==70
mappingchecks=[]
for x in actual['mappingChecks']:
 verify(x['after']);n=read(x['path']);old=baselines[x['path']]
 assert n['mappings'][:len(old['mappings'])]==old['mappings']
 assert n['mappings'][len(old['mappings']):]==x['newPartialRows']
 assert len({(m['legacyGoalId'],m['canonicalGoalId']) for m in n['mappings']})==len(n['mappings'])
 if 'decisions' in old:
  for prev,now in zip(old['decisions'],n['decisions']):
   assert prev['sourceGoalId']==now['sourceGoalId']
   for k,v in prev.items():
    if k in ['canonicalGoalIds','additionalAcceptedPartialContributions']:assert now[k][:len(v)]==v
    else:assert now[k]==v
  sources={g['id'] for g in read(n['sourceExtractionPath'])['sourceGoals']}
  assert all(e['legacyGoalId'] in sources for e in x['newPartialRows'])
 mappingchecks.append({'path':x['path'],'after':pin(x['path']),'beforeIndexBytesMatchRecordedCAS':True,'retainedWholeMappingArraySHA256':dig(old['mappings']),'retainedDecisionArraySHA256':dig(old.get('decisions',[])),'allOldDecisionFieldsPreserved':True,'addedPartialRows':len(x['newPartialRows'])})
assert len(mappingchecks)==31 and sum(x['addedPartialRows'] for x in mappingchecks)==178
for x in actual['concreteRelationAliasBindings']:
 m=accepted[x['acceptedIndex']];assert m['legacyGoalId']==x['sourceGoalId'] and m['canonicalGoalId']==x['canonicalGoalId']
 assert next(g for g in read(x['sourceExtractionPath'])['sourceGoals'] if g['id']==x['sourceGoalId'])
assert set(x['acceptedIndex'] for x in actual['concreteRelationAliasBindings'])==set(range(78))
shared={s for t in plan['sourceTransports'] for s in t['sharedExtractionOnlyIds']};assert len(shared)==12
assert not shared.intersection(x['sourceGoalId'] for x in actual['concreteRelationAliasBindings'])
# New current2026 cells exist in exactly their current2026 contract, never in old2024.
he=next(x['path'] for x in sourcechecks if '/HE/' in x['path']);oldhe=he.replace('_CURRENT2026','')
assert not any('current2026-standard-' in g['id'] for g in read(oldhe)['sourceGoals'])
for p in plan['excludedAliases']:assert not any(m['legacyGoalId'] in set(newids) for m in read(p['path'])['mappings'])
# Preserve the separately staged ST015 repair, which was outside the write allowlist.
st=[]
for p in ['curricula/DE/Gymnasium/mapping/DE-ST/lower-secondary/st_chemistry_lower_secondary_source_extraction_to_canonical_chemistry.review.json','curricula/DE/Gymnasium/mapping/DE-ST/lower-secondary/st_chemistry_lower_secondary_to_canonical_chemistry.json']:
 assert subprocess.run(['git','diff','--quiet','--',p]).returncode==0;st.append(pin(p))
spec=importlib.util.spec_from_file_location('validate_schemas',R/'scripts/validate_schemas.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
errors=mod.curriculum_symlink_errors(R);own=[e for e in errors if str(O.relative_to(R)) in e];assert not own
parsed=[]
for p in sorted(O.rglob('*.json')):
 if p.name=='CHECK.final-exact-index-CAS-retention-and-finite-results.json':continue
 read(p);parsed.append(pin(str(p.relative_to(R))))
print(json.dumps({'status':'PASS','scope':'Exact 11 extraction transports /70 new cells /78 accepted partial relations /31 aliases /178 rows; no new scientific first decision','counts':plan['counts'],'originalIndexBaselinesVerified':len(baselines),'sourceChecks':sourcechecks,'mappingChecks':mappingchecks,'protectedBeforePinsUnchanged':len(plan['protectedBeforePins']),'st015PriorStagedRepairPreserved':st,'current2026NotWrittenIntoOld2024':True,'sharedTwelveRemainWithoutNewBindingVote':True,'viewRoleResult':{'status':view['status'],'counts':view['counts'],'bwThreeOnlyLkTargets':view['bwThreeOnlyLkTargets']},'stockSymlinkFunction':{'executed':True,'ownScopeErrors':own,'outsideScopeErrors':len(errors)-len(own)},'wholePackageJSONActuallyParsed':parsed,'APCompilerGlobalSchemaBuildRuns':0,'newScientificFirstDecisions':0,'newNativeDPAMVDecisions':0,'wholeSourceOrHumanOrActualLearnerExecutionClaims':0},ensure_ascii=False,indent=2))
