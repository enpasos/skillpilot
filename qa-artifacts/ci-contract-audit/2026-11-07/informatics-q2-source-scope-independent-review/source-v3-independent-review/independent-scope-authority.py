from pathlib import Path
import json,gzip,hashlib,collections

R=Path('/home/enpasos/projects/skillpilot')
W=Path('/dev/shm/informatics-q2-source-scope-v3-20261107')
P=R/'qa-artifacts/ci-contract-audit/2026-11-07/informatics-q2-source-scope-independent-review'
O=P/'source-v3-independent-review'
C=W/'candidate'; F=W/'frozen'
OWNER='7d51b38c-a149-5407-bddc-d2ce7878b020'
SPECIAL='875cb53c-b48d-5b2b-8cb0-e20f27534f16'
OLD3=['0df1bedd-5fda-5b3b-a959-c9610237bb3e','269a561b-f12e-57b2-9b05-e20f58c9dcf6','ca2ff162-c71f-500f-8ce7-321ab2cf3f1f']
NEW4=['5c6ba0c6-5b7a-512f-8c19-739b20473639','2d1021d7-aa6a-520d-a56e-19a8305db9f3','58180f3b-3cf7-577d-b2ff-d9066ef481f5','b855c123-cd28-5d6c-9485-4852d01bc5eb']
FIRST='6ebc2a67-ea20-5c4e-8a63-635f40438d6a'; HELD='f37f2d37-7686-5ed7-9c20-6f83d4fd2254'
sha=lambda b:hashlib.sha256(b).hexdigest()
def read(p):
 p=Path(p); raw=p.read_bytes(); return json.loads(gzip.decompress(raw) if p.suffix=='.gz' else raw)
def digest(v):return sha(json.dumps(v,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode())
pins=[]
def pin(p):
 p=Path(p);pins.append({'path':str(p),'sha256':sha(p.read_bytes()),'bytes':p.stat().st_size})
source_rel='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json'
assert sha((C/source_rel).read_bytes())=='c824e0b360470ef67ae4deb560146c7e677ad9601446b26cd5a46097c426e53b'
assert sha((R/source_rel).read_bytes())=='85411185514af4b2ecf818807f3bd6fe5df17fb5011c5ebf8c4996de1a47817e'
source=read(C/source_rel); goals={g['id']:g for g in source['goals']}
for p in [C/source_rel,R/source_rel,P/'review-seal.json',P/'coverage-contract-followup/seal.json',P/'coverage-code-independent-review/seal.json',O/'independent-source-probe.mts',O/'independent-source-probe.json']:
 pin(p)
he_rel='curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_INFORMATIK_SEKII_KC2024.source-extraction.json'
he,bhe=read(C/he_rel),read(F/he_rel); old_source_id='a4473795-2ca6-4ca0-8518-e5fd3414f5ae'
old_record=next(g for g in bhe['sourceGoals'] if g['id']==old_source_id)
assert not any(g['id']==old_source_id for g in he['sourceGoals'])
archived=[r['record'] for r in he['historicalAuthoredRecords'] if r['record']['id']==old_source_id]
assert archived==[old_record]
he_mappings=[]
for suffix in ['hessen_informatics_upper_secondary_source_extraction_to_canonical_informatics.review.json','hessen_informatics_upper_secondary_to_canonical_informatics.json']:
 rel='curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/'+suffix
 d=read(C/rel); active=d['mappings']; assert not any(m['canonicalGoalId']==SPECIAL for m in active)
 archived_mapping=[m for m in d['historicalWithdrawnMappings'] if m['canonicalGoalId']==SPECIAL]
 assert len(archived_mapping)==1
 he_mappings.append({'path':rel,'noActive875Mapping':True,'historicalRecordPreserved':archived_mapping})
 pin(C/rel)
he_new=[]
for gid in NEW4:
 g=goals[gid];sgid=g['extendedData']['provenance']['sourceGoalId'];record=next(x for x in he['sourceGoals'] if x['id']==sgid)
 assert g['extendedData']['applicabilityMappingInheritance']=='boundary'
 assert g['applicability']=={'jurisdiction':['DE-HE']}
 he_new.append({'goalId':gid,'goal':g,'sourceFragment':record})
sh_rel='curricula/DE/Gymnasium/input/SH/upper-secondary/source-extraction/DE_SH_INFORMATIK_SEKII_FACHANFORDERUNGEN_2021.source-extraction.json'
sh=read(C/sh_rel);basic_id='de-sh-informatik-sekii-fa2021-db4-basic-application-data-change-20261107'
basic=next(g for g in sh['sourceGoals'] if g['id']==basic_id)
sql=next(g for g in sh['sourceGoals'] if g['id']=='de-sh-informatik-sekii-fa2021-db4-1-sql-insert-delete-und-update-d879df22')
assert basic['courseLevel']=='GK/LK' and basic['canonicalTargetIds']==[] and sql['courseLevel']=='LK'
shmap_rel='curricula/DE/Gymnasium/mapping/DE-SH/upper-secondary/sh_informatics_upper_secondary_source_extraction_to_canonical_informatics.review.json'
shmap=read(C/shmap_rel);gap=next(d for d in shmap['decisions'] if d['sourceGoalId']==basic_id)
assert gap['decision']=='needsCanonicalGoal' and gap['canonicalGoalIds']==[]
assert not any(m.get('legacyGoalId')==basic_id for m in shmap['mappings'])
for rel in [he_rel,sh_rel,shmap_rel,'curricula/DE/Gymnasium/input/SH/Fachanforderungen_Informatik_Sekundarstufe_2021_barrierearm.pdf','curricula/DE/Gymnasium/input/HE/upper-secondary/kernkurriculum_gymnasiale_oberstufe-informatik.pdf']:
 pin(C/rel if (C/rel).is_file() else R/rel)
ap_path=W/'candidate-scope-final.native.json.gz';ap=read(ap_path);assert ap['sourceSha256']==sha((C/source_rel).read_bytes())
ap_goals={r['goalId']:r for r in ap['applicabilityInfo']['goals']}
for gid in [SPECIAL,*OLD3,FIRST]: assert ap_goals[gid]['compiledApplicability']=={} and ap_goals[gid]['evidence']==[]
for gid in NEW4:assert ap_goals[gid]['compiledApplicability']=={'jurisdiction':['DE-HE']}
native=read(O/'independent-source-probe.json'); native_views={v['viewId']:v for v in native['views']}
view_checks=[]
for v in native['views']:
 rel='curricula/DE/Gymnasium/composition-views/informatik/'+v['file'];now,old=read(C/rel),read(F/rel)
 assert now['scope']==old['scope'] and now['viewId']==old['viewId'] and now['landscapeId']==old['landscapeId']
 view_checks.append({'path':rel,'beforeSha256':sha((F/rel).read_bytes()),'candidateSha256':sha((C/rel).read_bytes()),'scopeUnchanged':True,'targetCount':len(v['targetGoalIds']),'newOwn20Target':FIRST in v['targetGoalIds'],'fourNewTargets':[i for i in NEW4 if i in v['targetGoalIds']]})
 pin(C/rel)
runtime_path=W/'candidate-v3-authored-global-wiring-final.runtime.json';runtime=read(runtime_path)
rows=[]
for r in runtime['nativeAuthoredGlobalCases']:
 assert r['actualPackageState'] is None
 assert json.loads(r['actualPcString'])==r['actualPc']
 assert r['learnerFields']['personalCurriculum']==r['actualPcString']
 assert r['selectedCurriculum']==r['learnerFields']['selectedCurriculum']=='a0e13c56-c25f-4742-9272-3a1a603ee52e'
 selected=[]
 for step in r['nativeOfferedSteps']:
  if 'selectedExactOfferedOption' in step:
   option=step['selectedExactOfferedOption'];assert option in step['plan']['options'];selected.append(option['optionId'])
 stage=r['nativeFinalPlan']['stage']; assert stage in ['COMPLETE','SELECTION']
 if stage=='COMPLETE':
  targets=r['targetIds'];assert targets and r['hold'] is None
  assert not set([SPECIAL,*OLD3,HELD])&set(targets)
  viewids=r['viewIds'][0].removeprefix('merged:').split('+'); authored=set().union(*(set(native_views[v]['targetGoalIds']) for v in viewids))
  assert set(targets)<=authored
  assert r['masteryUnchanged'] and r['oldMasteryCount']==25 and r['newOwnExamMasteryUnset']
 else:
  assert r['requestedProfile']=='GK+LK' and r['hold'] and 'targetIds' not in r and 'viewIds' not in r
 rows.append({'requestedJurisdiction':r['requestedJurisdiction'],'requestedProfile':r['requestedProfile'],'nativeStage':stage,'actualPc':r['actualPc'],'selectedOfferedOptionIds':selected,'actualPackageState':None,'viewIds':r.get('viewIds'),'targetCount':len(r.get('targetIds',[])),'targetIdsSha256':digest(r['targetIds']) if 'targetIds'in r else None,'newOwn20Target':FIRST in r.get('targetIds',[]),'new4Targets':[i for i in NEW4 if i in r.get('targetIds',[])],'hold':r['hold']})
counts=collections.Counter(r['nativeStage'] for r in rows); assert counts=={'COMPLETE':39,'SELECTION':12}
fallback=[r for r in rows if r['nativeStage']=='COMPLETE' and r['requestedJurisdiction']!='canonical-own' and any(v.startswith('de-de-') for v in r['viewIds'])]; assert len(fallback)==24
mastery=read(W/'candidate-v3-all25mastery.runtime.json')
assert len(mastery['nativePersonalCurricula'])==51
direct=read(W/'candidate-direct-false.runtime.json')
quality_path=W/'candidate-final-50scopes.native.json.gz';quality=read(quality_path)
assert quality['sourceSha256']==sha((C/source_rel).read_bytes()) and quality['observedScopeCount']==50
q204=next(r for r in quality['assessment'] if r['id']=='CQR-204');assert q204['status']=='fail' and q204['metrics']['weakExamData']==9 and q204['metrics']['discoveryIssues']==0
manifest=quality['discovery']['retainedCoverage']['manifest'];assert manifest['status']=='fail';assert set(manifest['failingGoalIds'])==set([*OLD3,FIRST])
assert len(quality['discovery']['definitionGoalIds'])==25 and quality['globalDiscoveryCounts']=={'definitions':926,'required':873}
for p in [runtime_path,W/'candidate-v3-authored-global-wiring-final.runtime.execution.json',W/'V3AuthoredGlobalScopeProbe.java',W/'candidate-v3-all25mastery.runtime.json',W/'candidate-direct-false.runtime.json',W/'backend-reuse-current-guards.json',W/'native-historical-mastery-preservation.json',ap_path,quality_path,W/'sh-db4-page.png',W/'sh-p48.txt',W/'sh-db4-primary-and-fullmatch-review.json',W/'source-projection-authority-decisions.json',W/'source-v3-pin.current.json']:
 pin(p)
out={'status':'independent source/scope evidence check; no release or approval flags','sourceSha256':sha((C/source_rel).read_bytes()),'he875HistoricalRecordPreserved':True,'heMappings':he_mappings,'heNewFour':he_new,'shBasicFragment':basic,'shSqlFragment':sql,'shBasicGap':gap,'views':view_checks,'nativeApplicabilityEvidenceRead':{g:ap_goals[g] for g in [SPECIAL,*OLD3,FIRST,*NEW4]},'runtimeCounts':dict(counts),'runtimeRows':rows,'stateRequestsUsingCanonicalViews':[{'jurisdiction':r['requestedJurisdiction'],'profile':r['requestedProfile'],'viewIds':r['viewIds']} for r in fallback],'runtimeLimit':'These 24 selected canonical course views do not prove jurisdiction-specific mandatory scope. The 12 SELECTION cases have no manufactured target set. The frozen source frame predates ongoing runtime repairs; no current runtime acceptance.','quality':{'globalDiscoveryCounts':quality['globalDiscoveryCounts'],'retainedFailingGoalIds':manifest['failingGoalIds'],'retainedRows':manifest['rows'],'CQR204Metrics':q204['metrics'],'CQR204Status':q204['status']},'staleAuthorNarrativeDetected':{'sourceProjectionDecisionsSourceSha256':read(W/'source-projection-authority-decisions.json')['sourceSha256'],'authorViewGKChangedFlag':next(v for v in read(W/'source-author-decisions.json')['viewChanges'] if v['viewId']=='de-de-gym-informatics-gk')['changed'],'treatment':'Intermediate author notes are not final pins; this review uses actual c824 source and exact final view bytes.'},'pins':pins}
(O/'independent-scope-authority.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'nativeStageCounts':dict(counts),'canonicalFallbackStateCases':len(fallback),'noActive875SourceMapping':True,'SHBasicGap':gap['decision'],'CQR204':q204['metrics'],'sourceSHA':out['sourceSha256']}))
