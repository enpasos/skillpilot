from pathlib import Path
import json, hashlib, datetime, importlib.util
import jsonschema

ROOT=Path(__file__).resolve().parents[7]
OUT=Path(__file__).resolve().parent
def digest(b): return 'sha256:'+hashlib.sha256(b).hexdigest()
def save(name,o): (OUT/name).write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n')
original=json.loads((OUT/'history/canonical-landscape.exact.json').read_text())
candidate=json.loads((OUT/'candidates/landscape.INERT.author-only.json').read_text())
old={g['id']:g for g in original['goals']}; new={g['id']:g for g in candidate['goals']}
assert len(old)==len(original['goals']) and len(new)==len(candidate['goals'])
OLD='648224f4-cc8f-5f41-9cae-6d783cd1ae77'; EMU='79d244e0-049e-59e9-a2fb-b8f8670b315a'; LEGAL='5aaf5abf-5e70-57c6-b030-1d08a35d17b8'; PARENT='3e0d8fbc-f383-5505-a30e-7c4f125342bb'
assert set(new)-set(old)=={LEGAL} and set(old)<=set(new)
assert new[EMU]==old[EMU]
assert {gid for gid in old if old[gid]!=new[gid]}=={OLD,PARENT}
assert all(new[gid]['type']=='atomic' and new[gid]['contains']==[] for gid in [OLD,LEGAL,EMU])
schema=json.loads((ROOT/'docs/landscape-runtime.schema.json').read_text())
jsonschema.Draft202012Validator(schema).validate(candidate)
def dag(field):
 colors={}
 def walk(gid):
  assert colors.get(gid)!=1, f'{field} cycle at {gid}'
  if colors.get(gid)==2:return
  colors[gid]=1
  for child in new[gid].get(field,[]):
   assert child in new,f'unknown {field} destination{child}'
   walk(child)
  colors[gid]=2
 for gid in new:walk(gid)
dag('requires');dag('contains')
parsed=0
for p in OUT.rglob('*'):
 if not p.is_file():continue
 if p.suffix=='.json': json.loads(p.read_text());parsed+=1
 elif p.suffix=='.jsonl':
  for line in p.read_text().splitlines():json.loads(line)
  parsed+=1
spec=importlib.util.spec_from_file_location('unchanged_schema_checks',ROOT/'scripts/validate_schemas.py')
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
errors=module.curriculum_symlink_errors(ROOT)
prefix=str(OUT.relative_to(ROOT))+'/'
ownerrors=[e for e in errors if e.startswith(prefix)]
assert not ownerrors,ownerrors
records=json.loads((OUT/'candidates/positive-profiles.native-bound.INERT.json').read_text())
assert len(records)==3 and {r['goalId'] for r in records}=={OLD,LEGAL,EMU}
assert all(r['evidenceLevel']=='E1' and r['maximumClaimScope']=='G1' and r['reviewAuthority']=='ai_candidate' and r['status']=='needs_human_review' for r in records)
assert len((OUT/'candidates/positive-profiles.native-bound.INERT.jsonl').read_text().splitlines())==3
assert (OUT/'generation-metadata.actual.json').is_file()
native=json.loads((OUT/'checks/native-positive-candidates.actual.json').read_text())
assert native['generationParametersFingerprint']==digest((OUT/'generation-metadata.actual.json').read_bytes())
save('checks/whole-own-schema-DAG-preservation.actual.json',{'status':'passed_local_whole_landscape_schema_DAG_and_exact_preservation','checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00','Z'),'originalGoalCount':len(old),'candidateGoalCount':len(new),'retainedOriginalId':OLD,'newGoalIds':[LEGAL],'unchangedReusedGoalId':EMU,'modifiedExistingObjectsOnly':[OLD,PARENT],'allOtherExistingGoalObjectsByteStructureUnchanged':True,'requiresDAG':True,'containsDAG':True,'allGoalTargetsExist':True,'allOwnJsonJsonlParsed':parsed,'ownCurriculumSymlinkErrors':ownerrors,'unrelatedRepositorySymlinkErrorCountNotPartOfOwnApproval':len(errors),'authority':'local_technical_author_check_only','independentContentReviewClaimed':False,'humanApprovalClaimed':False,'learnerTrialClaimed':False,'schemaPath':'docs/landscape-runtime.schema.json','schemaDigest':digest((ROOT/'docs/landscape-runtime.schema.json').read_bytes())})
files=[]
for p in sorted(OUT.rglob('*')):
 if p.is_file() and p.name not in ['SEALED-unreviewed-INERT-handoff.json','SEALED-unreviewed-INERT-handoff.json.sha256']:
  files.append({'path':str(p.relative_to(OUT)),'bytes':p.stat().st_size,'digest':digest(p.read_bytes())})
seal={'status':'sealed_INERT_unreviewed_author_handoff','sealedAt':datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00','Z'),'authority':'ai_candidate','evidenceLevel':'E1','maximumClaimScope':'G1','needsHumanReview':True,'retainedGoalId':OLD,'newGoalIds':[LEGAL],'reusedUnchangedGoalIds':[EMU],'semanticDestinations':3,'generationParametersFingerprint':native['generationParametersFingerprint'],'artifactCount':len(files),'artifacts':files,'independentRootReview':'open','freshNativeBlindDRounds':'not_run_for_these_author_candidates; follow only after complete stable whole state','wholeSourceScopeAMCardsRoutesPracticePDVAndHumanGates':'open','otherDRoundResultsCompared':False,'canonicalOrActiveWrites':False,'newImagesGenerated':False}
save('SEALED-unreviewed-INERT-handoff.json',seal)
s=OUT/'SEALED-unreviewed-INERT-handoff.json';(OUT/'SEALED-unreviewed-INERT-handoff.json.sha256').write_text(hashlib.sha256(s.read_bytes()).hexdigest()+'  '+s.name+'\n')
print(json.dumps({'out':str(OUT.relative_to(ROOT)),'status':seal['status'],'artifactCount':len(files),'sealDigest':digest(s.read_bytes()),'newGoalId':LEGAL,'localNativeCheck':native['status'],'baseGoalCount':len(old),'candidateGoalCount':len(new),'newImagesGenerated':False,'activeWrites':False}))
