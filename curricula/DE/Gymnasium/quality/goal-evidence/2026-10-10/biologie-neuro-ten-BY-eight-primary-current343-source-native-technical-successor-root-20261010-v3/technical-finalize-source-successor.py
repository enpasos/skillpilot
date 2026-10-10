# SPDX-License-Identifier: Apache-2.0
import copy,datetime,hashlib,importlib.util,json,pathlib,shutil,subprocess
R=pathlib.Path('/home/enpasos/projects/skillpilot');B=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10')
V=B/'biologie-neuro-verhalten-hormone-ten-sehbahn-v3-current343-native-technical-successor-20261010-v2'
V1=B/'biologie-neuro-verhalten-hormone-ten-current343-source-raster-native-technical-preparation-20261010-v1'
A=B/'biologie-neuro-ten-BY-eight-primary-legacy-reference-clarification-author-root-20261010-v5'
P=B/'biologie-neuro-ten-BY-eight-primary-current343-source-native-technical-successor-root-20261010-v3'
def read(p):return json.loads((R/p).read_text())
def ref(p):
 b=(R/p).read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(p,x):
 f=R/P/p;f.parent.mkdir(parents=True,exist_ok=True);body=json.dumps(x,ensure_ascii=False,indent=2)+'\n'
 if f.exists():assert f.read_text()==body,f
 else:f.write_text(body)
 return ref(P/p)
a=read(A/'source-author-primary-and-historical-reference.entry.json')
e=read(pathlib.Path(a['wholeCurrentExtractionCandidate']['path']));m=read(pathlib.Path(a['wholeCurrentMappingCandidate']['path']))
eg={g['id']:g for g in e['sourceGoals']};docs={d['key']:d for d in e['sourceDocuments']};current=read(V1/'sources/ten-current41-whole-direct-source-witnesses.neutral.json');history=copy.deepcopy(current)
primary={z['actualRawPrimary']['path']:z['actualRawPrimary'] for z in a['actualPrimaryFetches']};changed=[]
for row in current['rows']:
 for w in row['wholeDirectSourceWitnesses']:
  sid=w['wholeCurrentSourceGoal']['id']
  if sid not in a['selectedEightNewPrimarySourceIds']:continue
  old=copy.deepcopy(w);g=eg[sid];doc=docs[g['sourceDocumentKey']]
  w['wholeCurrentSourceGoal']=g;w['mapping']=a['wholeCurrentMappingCandidate'];w['extraction']=a['wholeCurrentExtractionCandidate']
  maps=[z for z in m['mappings'] if z['legacyGoalId']==sid and z['canonicalGoalId']==row['goalId']];assert len(maps)==1
  w['wholeCurrentMappingRecord']=maps[0];w['wholeCurrentSourceDecisions']=[z for z in m['decisions'] if z['sourceGoalId']==sid]
  w['sourceDocument']=doc;w['currentActualPrimaryBytes']=primary[doc['path']]
  w['historicalDerivedArtifactNotOfficialPrimaryBytes']=old['currentActualPrimaryBytes']
  w['actualPrimaryClassification']='Byte-exact fetched official year8/9 HTML; historical JSON alias remains derived extraction only.'
  w['independentCurrentSourceApproval']=False;changed.append({'goalId':row['goalId'],'sourceGoalId':sid,'actualPrimaryBytes':w['currentActualPrimaryBytes'],'beforeMatchType':old['wholeCurrentMappingRecord']['matchType'],'currentMatchType':w['wholeCurrentMappingRecord']['matchType']})
assert len(changed)==8
for pair in current['whole31PairBindings']:
 if pair['extraction']['path']==a['originalExtraction']['path']:
  pair['mapping']=a['wholeCurrentMappingCandidate'];pair['extraction']=a['wholeCurrentExtractionCandidate']
  pair['sourceDocument']=e['sourceDocument'];pair['sourceDocuments']=e['sourceDocuments']
  pair['legacyReferenceIsNotActualPrimaryBytes']=True
source=put('sources/current41-whole-direct-witnesses-eight-real-BY-primary.neutral.json',current)
delta=read(P/'checks/actual-normal-source-atlas-before-after-structure.json')
oldMap=a['priorAuthorV4'];v4=read(pathlib.Path(oldMap['path']));oldMapping=v4['originalMapping']['path'];oldExtraction=a['originalExtraction']['path']
semanticChanged=[];scopeMembership=[];metadataProtected=[];protected=read(V1/'inputs/current343-exact-protected-IDs.json')['current343']
assert len(delta['beforeScopes'])==len(delta['currentScopes'])==24
for old,now in zip(delta['beforeScopes'],delta['currentScopes']):
 assert old['key']==now['key'];assert old['goalIds']==now['goalIds'],old['key'];scopeMembership.append({'key':old['key'],'goalIdsExact':True})
 assert len(old['witnesses'])==len(now['witnesses'])
 for o,n in zip(old['witnesses'],now['witnesses']):
  normal=copy.deepcopy(n)
  if normal['mappingPath']==a['wholeCurrentMappingCandidate']['path']:normal['mappingPath']=oldMapping
  if normal['sourceExtractionPath']==a['wholeCurrentExtractionCandidate']['path']:normal['sourceExtractionPath']=oldExtraction
  if normal!=o:semanticChanged.append({'scopeKey':old['key'],'before':o,'current':n})
  if n['goalId'] in protected:
   assert normal==o,(old['key'],n['goalId'])
   if n!=o:metadataProtected.append(n['goalId'])
assert not semanticChanged
mappingDeltas=[z for z in changed if z['beforeMatchType']!=z['currentMatchType']]
assert len(mappingDeltas)==1 and mappingDeltas[0]['sourceGoalId']=='ad855269-70c3-526c-951b-cc2d54106f36'
assert mappingDeltas[0]['beforeMatchType']=='exact' and mappingDeltas[0]['currentMatchType']=='partial'
put('checks/actual24-source-scope-membership-one-partial-and343-preservation.normal.json',{'schemaVersion':1,'actualNormalCompilerPassed':True,'scopeMembership':scopeMembership,'all24FullScopeGoalSetsExact':True,'allSourceWitnessSemanticsExactAfterDeclaredBYPairPathSubstitution':True,'sourceAtlasDirectInheritedCoverageIsNotMappingExactPartialMatchType':True,'actualSourceAtlasSemanticWitnessDeltas':semanticChanged,'actualMappingMatchTypeDeltas':mappingDeltas,'changedProtected343MetadataGoalIds':sorted(set(metadataProtected)),'current8ActualPrimaryWitnesses':changed,'all33OtherWholeCurrentDirectWitnessesExact':True,'noSourceOrScienceApprovalByTechnicalOwner':True,'activeStrictGain':0})
for row,orig in zip(current['rows'],history['rows']):
 for w,o in zip(row['wholeDirectSourceWitnesses'],orig['wholeDirectSourceWitnesses']):
  if w['wholeCurrentSourceGoal']['id'] not in a['selectedEightNewPrimarySourceIds']:assert w==o
shutil.copyfile(R/'tmp/m7-bio10-source-v5-root/check-source.mts',R/P/'technical-check-current-source-and-native.mts')
shutil.copyfile(pathlib.Path(__file__),R/P/'technical-finalize-source-successor.py')
oldEntry=read(V/'neutral-current343-native-ten-Sehbahn-v3.entry.json');core=copy.deepcopy(oldEntry['coreInputs']);core.update({'source41CurrentWholeObjects':source,'currentBYSourceExtraction':a['wholeCurrentExtractionCandidate'],'currentBYMapping':a['wholeCurrentMappingCandidate'],'currentAtlasConfig':ref(P/'sources/current-eight-BY-primary.normal-atlas.config.json'),'currentAtlasReceipt':ref(P/'sources/current-eight-BY-primary.actual-normal-source-atlas.receipt.compact.json'),'currentBYSourceScopeAnd343Impact':ref(P/'checks/actual24-source-scope-membership-one-partial-and343-preservation.normal.json'),'normalCurrent394AndPExact':ref(P/'checks/actual-current394-native-and-P-remain-exact.normal.json')})
entry={'schemaVersion':1,'entryKind':'source_only_current343_eight_BY_primary_one_partial_normal_native_unchanged_technical_successor','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'technicalOwner':'Root SOURCE author and technical binder; no independent approval','goalIds':oldEntry['goalIds'],'priorNativeV3Entry':ref(V/'neutral-current343-native-ten-Sehbahn-v3.entry.json'),'priorNativeV3Freeze':ref(V/'FINAL.current343-normal-P10-native10-Sehbahn-v3.technical.freeze.json'),'sourceAuthorV5Entry':ref(A/'source-author-primary-and-historical-reference.entry.json'),'sourceAuthorV5Freeze':ref(A/'FINAL.BY-eight-primary-legacy-reference-author.freeze.json'),'coreInputs':core,'currentRastersAndNativeCaptures':oldEntry['actualCurrentRastersAndNativeCaptures'],'ordinaryIndependentCampaigns':oldEntry['ordinaryIndependentCampaigns'],'actualPrimaryFetches':a['actualPrimaryFetches'],'actualNormalTerminals':[ref(p.relative_to(R)) for p in sorted((R/P/'terminal').glob('*.terminal.actual.json'))],'preservation':{'canonical479Exact':True,'tenProfiles20CasesExact':True,'P10RawRecordsExact':True,'normalWhole394ModelIncludingDigestExact':True,'native10HTMLPDFCapturesAndCampaignContextsExact':True,'all343ProtectedDPAAndMemoryVisualBindingsExact':True,'all24SourceScopeGoalSetsExact':True,'all343SourceWitnessSemanticsExactAfterDeclaredWholeBYPathOnlySubstitution':True,'onlySourceWitnessCoverageChange':semanticChanged,'other214HistoricalSourceReviewRestarted':False,'whole222SourceContentsAndOccurrencesExact':True},'sourceInventoryClarification':'The previous ten-current41 inventory named an unchanged derived SkillLandscape JSON alias as actualPrimaryBytes for eight BY witnesses. Historical inventory is preserved; this current inventory binds genuine fetched year8/9 HTML. Original normative-reference descriptor and214 historical structured routes remain unchanged, with explicit derived-artifact provenance and no new whole-source clearance.','currentSourceApproval':'PENDING independent A and B targeted eight primary/partial/source-only-normal followup','independentCurrentDAndPAndV':'Use already sealed genuine V3 reviews only after targeted source findings are resolved against these exact current inputs; no approvals inferred from technical checks.','humanApproval':False,'humanTrial':False,'activeStrictGain':0,'activeWrites':[],'historicalWrites':[]}
put('neutral-current343-source-only-eight-BY-primary.entry.json',entry)
vf=read(V/'FINAL.current343-normal-P10-native10-Sehbahn-v3.technical.freeze.json');af=read(A/'FINAL.BY-eight-primary-legacy-reference-author.freeze.json');external={z['path']:z for z in vf['ownFiles']+vf['requiredCurrentPortableExternalFiles']+af['files']+af['requiredExternalFiles']+[ref(V/'FINAL.current343-normal-P10-native10-Sehbahn-v3.technical.freeze.json'),ref(A/'FINAL.BY-eight-primary-legacy-reference-author.freeze.json')]}
for z in external.values():assert ref(pathlib.Path(z['path']))==z,z['path']
spec=importlib.util.spec_from_file_location('normal_schema',R/'scripts/validate_schemas.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module);runtime=read(pathlib.Path('docs/landscape-runtime.schema.json'));count=0
for f in (R/P).rglob('*.json'):assert module.validate_file(str(f),runtime),f;count+=1
own=[ref(f.relative_to(R)) for f in sorted((R/P).rglob('*')) if f.is_file()]
paths=[z['path'] for z in own]+list(external);r=subprocess.run(['git','check-ignore','--stdin'],cwd=R,input='\n'.join(paths)+'\n',capture_output=True,text=True);assert r.returncode==1,r.stdout
for p in paths:assert (R/p).is_file() and not (R/p).is_symlink(),p
put('checks/actual-targeted-normal-schema-portability.json',{'schemaVersion':1,'normalSchemaJSONCount':count,'allRequiredFilesRegular':True,'actualGitCheckIgnoreNoVerboseExit':r.returncode,'actualIgnoredPaths':r.stdout.splitlines(),'requiredExternalFiles':len(external),'independentApprovalFromTechnicalChecks':False})
own=[ref(f.relative_to(R)) for f in sorted((R/P).rglob('*')) if f.is_file()]
put('FINAL.current343-eight-BY-primary-source-only-normal.technical.freeze.json',{'schemaVersion':1,'role':'technical_source_binding_only_not_independent_gate','ownFiles':own,'requiredCurrentPortableExternalFiles':list(external.values()),'strictGain':0,'independentApproval':False,'historicalWrites':[],'activeWrites':[]})
print(json.dumps({'entry':ref(P/'neutral-current343-source-only-eight-BY-primary.entry.json'),'freeze':ref(P/'FINAL.current343-eight-BY-primary-source-only-normal.technical.freeze.json'),'all394NativePAndAll343Exact':True,'sourceScopeSets':24,'mappingMatchTypeDeltas':1,'sourceAtlasSemanticWitnessDeltas':0,'realCurrentPrimaryWitnesses':8,'strictGain':0}))
