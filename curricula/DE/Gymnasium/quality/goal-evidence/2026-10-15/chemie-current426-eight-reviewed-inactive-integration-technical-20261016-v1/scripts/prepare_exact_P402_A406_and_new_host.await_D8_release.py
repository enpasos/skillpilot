# SPDX-License-Identifier: Apache-2.0
"""Nur endliche Integrationsvorbereitung; keine D-/Central-/Science-Operation."""
from pathlib import Path
import copy,datetime,hashlib,json,jsonschema,shutil
R=Path.cwd();O=Path(__file__).resolve().parents[1];E=O.parent;H=R/'tmp/chemie-m7-resumed-20261016/current426-eight-reviewed-inactive-integration-own-host-v1'
def load(p):return json.loads(p.read_text())
def ref(p):
 b=p.read_bytes();return {'path':p.relative_to(R).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verify(a):
 p=R/a['path'];assert ref(p)==a,p;return p
def put(p,d):
 if p.exists():
  assert load(p)==d,p;return
 p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
ps=E/'chemie-current426-b47-framework-P1-native8-successor-technical-20261015-v1/OUTPUTS.finite-current426-b47-framework-P1-Native8-successor.technical-selector.json';assert ref(ps)['sha256']=='sha256:939aa7c8f68ecaae2c39fb4ea1038aa67662a5884408a70836f3bf28a26b62fc';current=load(ps)
for a in load(R/current['finalSealPath'])['files']:verify(a)
planp=R/'tmp/chemie-m7-resumed-20261015/current426-next8-central-owner-preflight/PLAN.current426-next8-central-owner-preflight.readonly.json';assert ref(planp)['sha256']=='sha256:76557df8ca996530bee28d294d87d7f7aa4ecacb38c480433538de39ad571eee';plan=load(planp);deps={Path(a['path']).name:load(verify(a)) for a in plan['outputs'][:3]};ap=deps['A5.exact-old-owners-and-smallest-retention-plan.readonly.json'];dp=deps['D8.exact-effective-owners-index-pairs-and-conditional-supersessions.readonly.json'];pp=deps['P.reuse-existing-three-config-retention-plan.readonly.json']
rootScience=E/'chemie-current426-eight-root-scientific-resolution-inactive-20261016-v1/ROOT.eight-scientific-resolutions.before-final-current-stock-bindings.json';assert ref(rootScience)['sha256']=='sha256:2485dafbcec09283271d2bd483f20527cfeda33eedf2440fcc49313f2cfdd28e'
basep=R/plan['baseline']['logicalPath'];assert ref(basep)['sha256']==plan['baseline']['actualRead']['sha256'];base=load(basep);assert len(base['subjects'])==1;subject=copy.deepcopy(base['subjects'][0]);assert len(subject['positiveEvidenceConfigPaths'])==87 and len(subject['semanticAtomicityConfigPaths'])==60 and len(subject['resolutionIndexPaths'])==90 and len(subject['resolutionSupersessions'])==184 and len(subject['resolutionWithdrawals'])==5
# Drei neue bytegleiche Restdateien; Originalconfigs und Runmanifeste bleiben erhalten.
retentions=[];replacements={};pcschema=load(R/'contracts/goal-evidence/v2/goal-evidence-review-config.schema.json');pcv=jsonschema.Draft202012Validator(pcschema,format_checker=jsonschema.FormatChecker())
for i,g in enumerate(pp['existingThreeBaselineConfigRetentions'],1):
 cfg=load(verify(g['originalConfig']));original=verify(g['originalRecords']);keep=set(g['retainedGoalIds']);lines=[l for l in original.read_bytes().splitlines(keepends=True) if json.loads(l)['goalId'] in keep];rows=[json.loads(l) for l in lines];assert {r['goalId'] for r in rows}==keep and len(rows)==len(keep);rp=O/f'preparation/positive-retentions/baseline-{i:02d}.exact-original-rest-lines.jsonl';rp.parent.mkdir(parents=True,exist_ok=True);assert not rp.exists() or rp.read_bytes()==b''.join(lines)
 if not rp.exists():rp.write_bytes(b''.join(lines))
 c=copy.deepcopy(cfg);c['reviewPath']=rp.relative_to(R).as_posix();c['scope']={'label':f'Bytegleiche Baseline-Retention {i}: aktuelle acht P-Owner getrennt ausgewählt','goalIds':[gid for gid in cfg['scope']['goalIds'] if gid in keep]};runids={rid for r in rows for rid in r['reviewRunIds']};kept=[];omitted=[]
 for path in cfg.get('reviewRunManifestPaths',[]):
  m=load(R/path);(kept if m['runId'] in runids else omitted).append(path)
 assert {load(R/p)['runId'] for p in kept}==runids
 if 'reviewRunManifestPaths' in c:c['reviewRunManifestPaths']=kept
 assert c['reviewId']==g['originalReviewIdMustRemain'] and all(r['reviewId']==c['reviewId'] for r in rows);cp=O/f'preparation/config/P-retained-baseline-{i:02d}.original-review-id.config.json';put(cp,c);pcv.validate(c);replacements[g['originalConfig']['path']]=cp.relative_to(R).as_posix();retentions.append({'sourceConfig':g['originalConfig'],'sourceWholeRecords':g['originalRecords'],'newConfig':ref(cp),'byteExactRestRecords':ref(rp),'removedGoalIds':g['removedForCurrentEightOwnerSelection'],'retainedGoalIds':c['scope']['goalIds'],'retainedOriginalRunManifests':[ref(R/p) for p in kept],'omittedUnreferencedManifests':omitted,'originalReviewIdPreserved':True,'wholeManifestBytesAndGoalIdsUnchanged':True})
assert len(retentions)==3 and [len(x['retainedGoalIds']) for x in retentions]==[1,2,10]
subject['positiveEvidenceConfigPaths']=[replacements.get(p,p) for p in subject['positiveEvidenceConfigPaths']]+current['currentEightPositiveEvidenceConfigPaths'];assert len(subject['positiveEvidenceConfigPaths'])==92 and len(set(subject['positiveEvidenceConfigPaths']))==92
A5=current['semanticAtomicityConfigUnchanged'];assert A5['sha256']==ap['newA5ConfigRef']['actualRead']['sha256'];subject['semanticAtomicityConfigPaths']+=[A5['path']];assert len(subject['semanticAtomicityConfigPaths'])==61;subject['memoryReviewConfigPath']=current['memoryFullIntegrationConfigUnchanged']['path']
# Vollständig neuer eigener privater Host; keine Rasterdaten kopieren, kein Renderer.
m=load(verify(current['exactRebuildRecipe']))
if not H.exists():
 H.mkdir(parents=True)
 for q in R.iterdir():
  if q.name not in ['app','tmp','.git']:(H/q.name).symlink_to(q,target_is_directory=q.is_dir())
 (H/'app').mkdir();(H/'app/scripts').mkdir();(H/'app/public').mkdir()
 for q in (R/'app').iterdir():
  if q.name not in ['scripts','public']:(H/'app'/q.name).symlink_to(q,target_is_directory=q.is_dir())
 def branch(q):
  if q.is_symlink():
   children=list(q.resolve().iterdir());q.unlink();q.mkdir()
   for c in children:(q/c.name).symlink_to(c,target_is_directory=c.is_dir())
  elif not q.exists():q.mkdir()
 def install(src,rel,physical=False):
  q=H/rel;par=H
  for part in q.relative_to(H).parts[:-1]:par/=part;branch(par)
  if q.is_symlink() or q.is_file():q.unlink()
  if physical:shutil.copyfile(src,q)
  else:q.symlink_to(src)
 for rel in ['curricula/DE/Gymnasium/canonical','curricula/DE/Gymnasium/quality/goal-visualization-qa','curricula/DE/Gymnasium/quality/goal-visualization-review']:
  q=H/rel;par=H
  for part in q.relative_to(H).parts[:-1]:par/=part;branch(par)
  if q.is_symlink():q.unlink()
  assert not q.exists();q.mkdir()
 for a in m['stockPhysicalModules']:install(verify(a),a['path'],True)
 for a in m['aliases']:install(verify(a['physicalRepositorySource']),a['normalHostAlias'],a.get('physicalWithinHost',False))
 for a in m['selectedCurrentAssetRows']:
  src=verify(a['physicalRepositorySource']);install(src,a['normalCanonicalDestination']);install(src,a['normalPublicDestination'])
else:
 assert H.is_dir() and not H.is_symlink()
 for a in m['stockPhysicalModules']:assert ref(H/a['path'])['sha256']==a['sha256']
normal_c='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';normal_s='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json';normal_q='curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'
for rel,a in [(normal_c,current['canonical']),(normal_s,current['semantic']),(normal_q,current['visualizationQA'])]:assert ref(H/rel)['sha256']==a['sha256']
def at(path):return H/path
def pin(path):
 q=at(path);resolved=q.resolve();return {'logicalPath':path,'physicalRepositorySource':ref(resolved),'actualBytesSha256':ref(q)['sha256']}
atoms={d['goalId'] for d in load(verify(current['semantic']))['decisions'] if d['semanticKind']=='curricularAtomic'};assert len(atoms)==426
# Mechanischer vollständiger P402-Owner/Scope/Record/Runmanifest-Vertrag; keine P-Wissenschaft/FPs neu prüfen.
owners={};pInputs=[];record_count=0;manifests_by_ref=[];record_schema=jsonschema.Draft202012Validator(load(R/'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'),format_checker=jsonschema.FormatChecker());run_schema=jsonschema.Draft202012Validator(load(R/'contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json'),format_checker=jsonschema.FormatChecker())
for path in subject['positiveEvidenceConfigPaths']:
 c=load(at(path));pcv.validate(c);assert c['landscapePath']==subject['landscapePath'] and c['semanticKindLedgerPath']==subject['semanticKindLedgerPath'];rows=[json.loads(l) for l in at(c['reviewPath']).read_text().splitlines() if l.strip()];scope=c['scope']['goalIds'];assert len(scope)==len(set(scope)) and set(scope)<=atoms;assert len(rows)==len(scope) and {r['goalId'] for r in rows}==set(scope)
 mids={};used=set();criteria=ref(at(c['reviewCriteriaPath']))['sha256']
 for mp in c.get('reviewRunManifestPaths',[]):
  rm=load(at(mp));run_schema.validate(rm);assert rm['runId'] not in mids and rm['status']=='completed' and rm['criteriaFingerprint']==criteria;mids[rm['runId']]=rm;manifests_by_ref.append(pin(mp))
 for r in rows:
  record_schema.validate(r);gid=r['goalId'];assert gid not in owners,(gid,owners.get(gid),path);owners[gid]=path;assert r['reviewId']==c['reviewId'] and r['reviewCriteriaFingerprint']==criteria and r['landscapeId']==c['landscapeId'];assert r['goalFingerprintRuleVersion']==c['goalFingerprintRuleVersion'] and r['profileRuleVersion']==c['profileRuleVersion']
  for rid in r['reviewRunIds']:assert rid in mids and gid in mids[rid]['goalIds'];used.add(rid)
 assert used==set(mids);record_count+=len(rows);pInputs.append({'config':pin(path),'records':pin(c['reviewPath']),'goalIds':scope,'originalReferencedManifests':[pin(mp) for mp in c.get('reviewRunManifestPaths',[])]})
assert len(owners)==record_count==402
# A-Überlappung betrifft alle JSONL-Zeilen, nicht nur explizite Scope-IDs.
aowners={};aInputs=[];aAtomicCandidates=0;aOpenOriginal=[]
for path in subject['semanticAtomicityConfigPaths']:
 c=load(at(path));assert c['landscapePath']==subject['landscapePath'];rows=[json.loads(l) for l in at(c['reviewPath']).read_text().splitlines() if l.strip()]
 for r in rows:
  gid=r['goalId'];assert gid in atoms and gid not in aowners,(gid,path);aowners[gid]=path
  if r['status']=='atomic' and r['semanticAtomic'] is True:aAtomicCandidates+=1
  else:aOpenOriginal.append({'goalId':gid,'status':r['status'],'semanticAtomic':r.get('semanticAtomic'),'configPath':path})
 aInputs.append({'config':pin(path),'records':pin(c['reviewPath']),'recordCount':len(rows)})
assert len(aowners)==409 and aAtomicCandidates==406 and len(aOpenOriginal)==3
put(O/'checks/PREFLIGHT.P402-A406.actual-owner-scope-record-runmanifest.PASS.json',{'schemaVersion':1,'role':'Mechanische tatsächliche Auswahlprüfung, keine erneute wissenschaftliche oder Stock-Gatebewertung','PConfigCount':92,'PUniqueOwners':402,'PRecordCount':402,'PScopedOwnersNoCollision':True,'PClosedSchemasAndRecordScopes':'PASS','POriginalReferencedRunManifests':'PASS','PSourceFPsNotRecomputed':True,'AConfigCount':61,'AUniqueWholeRecordOwners':409,'AAtomicCandidateRecords':406,'AUnchangedOpenOriginalRecords':aOpenOriginal,'allOld60AConfigsPreserved':True,'onlyGenuineA5Added':True,'allCurrentOwnersCurricularAtomic':True,'PInputs':pInputs,'AInputs':aInputs,'runManifestInputRefs':manifests_by_ref,'actualStockChecks':0,'newScienceVotes':0,'centralRuns':0})
# D: alter Stand exakt; neue vier Kanten ausschließlich als nicht ausführbares Rezept.
assert subject['resolutionIndexPaths']==base['subjects'][0]['resolutionIndexPaths'] and subject['resolutionSupersessions']==base['subjects'][0]['resolutionSupersessions'] and subject['resolutionWithdrawals']==base['subjects'][0]['resolutionWithdrawals'];edges=[e for row in dp['goalRows'] for e in row['potentialSupersessionEdgesOnlyAfterRootAuthorizedFinalD8']];assert {e['goalId'] for e in edges}=={'1d2e7b80-653d-57b8-a284-8ede5a353b73','e9d34f34-2a43-5cc7-bcca-1d08e057531d','f4d5a02d-711b-5a6b-a41d-971359c1f64d','0773a104-aaeb-5e96-a615-2a2bec3eb096'};assert len(edges)==4
recipep=O/'preparation/PREPARED.D8-index-and-four-supersessions.await-two-checks-and-root-release.json';put(recipep,{'schemaVersion':1,'role':'Nicht ausführbares D8-Auswahlrezept; keine D-Urteile oder Paarung','old90IndexPaths':subject['resolutionIndexPaths'],'old184Supersessions':subject['resolutionSupersessions'],'old5Withdrawals':subject['resolutionWithdrawals'],'conditionalNewD8ResolutionIndex':'${ROOT_FINALIZED_NEW_D8_RESOLUTION_INDEX}','conditionalFourNewEdges':edges,'existingWithdrawalsFor0bAnd96RemainExact':True,'noSupersessionOfThoseWithdrawnOldPairs':True,'b47AndFFecHadNoOldRegisteredClaim':True,'requiresBothActualCurrentD8StockChecks':True,'requiresExplicitFinalRootRelease':True,'RootScienceReferenceOnly':ref(rootScience),'RootScienceBodyNotRead':True,'newDRecords':0,'DPairSteps':0,'centralRuns':0})
prepared=copy.deepcopy(base);prepared['reportId']='chemie-current426-eight-reviewed-inactive-PREPARED-await-D8-20261016-v1';prepared['subjects']=[subject];jsonschema.Draft202012Validator(load(R/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/deep-understanding-rollout.schema.json')).validate(prepared);cfgp=O/'preparation/config/central.current426.P402-A406.baseline-D90.PREPARED-not-for-run.config.json';put(cfgp,prepared)
# Aktuelle geschützte697-Bytes einfrieren, keine historischen aktiven Hashes voraussetzen.
protectedSource=E/'chemie-source4-current422-bounded-inactive-integration-technical-20261015-v1/checks/PROTECTED697.actual-before-phase1.json';prot=load(protectedSource);assert len(prot['files'])==697;protectedp=O/'checks/PROTECTED697.current-before-new-inactive-integration.snapshot.json';put(protectedp,{'schemaVersion':1,'role':'Aktueller Schutzsnapshot vor neuer inaktiver Integration; keine erneute QS anderer Fächer','createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'selectionSource':ref(protectedSource),'files':[ref(R/a['path']) for a in prot['files']],'protectedSubjectBaselinesDeclared':prot['baselineOtherSubjects'],'actualFilesHashed':697,'activeWrites':0})
m.update(role='Neuer eigener privater Host für genau eine spätere freigegebene inaktive D8-/Centralintegration, keine Rasterkopien oder Renderer',executionHost=H.relative_to(R).as_posix(),sourceBaselineMap=current['exactRebuildRecipe'],preparedCentralConfig=ref(cfgp),futureD8Recipe=ref(recipep),P402ConfigPaths=subject['positiveEvidenceConfigPaths'],A406ConfigPaths=subject['semanticAtomicityConfigPaths'],M426Config=current['memoryFullIntegrationConfigUnchanged'],currentEightPConfigReferences=current['currentEightPositiveEvidenceConfigReferences'],allImageAliasesReadOnlySymlinks=True,selectedReadOnlyPublicImageHardlinks=[],sourceRasterByteCopies=0,selectedHardlinks=0,ROOTREADY=False,centralAllowed=False,actualCentralRuns=0)
mapfile=O/'preparation/REBUILD.new-own-host.P402-A406-await-current-D8.physical-map.json';put(mapfile,m)
prepfile=O/'preparation/PREPARED.current426-P402-A406-five-P-owners.await-two-D8-checks-and-final-root-release.json';put(prepfile,{'schemaVersion':1,'role':'Endliche technische Vorbereitung, noch kein ausführbarer D8-/Centralabschluss','currentTechnicalSelector':ref(ps),'currentTechnicalSeal':ref(R/current['finalSealPath']),'exactReadonlyOwnerPlan':ref(planp),'exactReadonlyOwnerPlanOutputs':plan['outputs'],'rootScienceReferenceOnly':ref(rootScience),'rootScienceBodyNotRead':True,'baselineCentralConfig':ref(basep),'canonical':current['canonical'],'semantic':current['semantic'],'visualizationQA':current['visualizationQA'],'memoryFullConfig':current['memoryFullIntegrationConfigUnchanged'],'memoryFullRecords':current['memoryFullIntegrationRecordsUnchanged'],'A5SourceConfig':A5,'PThreeByteExactBaselineRetentions':retentions,'fiveExactFinalEightPOwnerConfigs':current['currentEightPositiveEvidenceConfigReferences'],'actualP402A406Preflight':ref(O/'checks/PREFLIGHT.P402-A406.actual-owner-scope-record-runmanifest.PASS.json'),'preparedNotForRunConfig':ref(cfgp),'D8IndexAndFourSupersessionsPendingRecipe':ref(recipep),'protectedCurrent697Snapshot':ref(protectedp),'newPrivateHostMap':ref(mapfile),'newPrivateHost':H.relative_to(R).as_posix(),'expectedFutureDIndexCount':91,'expectedFutureSupersessionCount':188,'withdrawalCountMustRemain':5,'PCurrentUniqueOwners':402,'ACurrentUniqueWholeRecordOwners':409,'AAtomicCandidateRecords':406,'AUnchangedOpenOriginalRecords':aOpenOriginal,'ROOTREADY':False,'requiresBothActualCurrentD8StockChecks':True,'requiresExplicitFinalRootRelease':True,'newNormalDRecords':0,'DPairRuns':0,'actualCentralRuns':0,'newNativeOrModelRuns':0,'newScienceVotes':0,'sourceRasterByteCopies':0,'activeRegistryRuntimeGitWrites':0,'oldRootsAndHostsWrites':0})
print(json.dumps({'prepared':ref(prepfile),'P402OwnerScopeRecordRunManifest':'PASS','A409WholeRecordOwnersAnd406AtomicCandidates':'PASS','oldAConfigs':60,'newAConfigs':1,'PBaselineRetentions':[1,2,10],'currentEightPConfigs':5,'preparedPConfigs':92,'D90Unchanged':True,'supersessions184Unchanged':True,'withdrawals5Unchanged':True,'fourFutureDEdgesRecipeOnly':True,'privateHostsCreated':1,'stockPairAndCentralRuns':0,'ROOTREADY':False},ensure_ascii=False))
