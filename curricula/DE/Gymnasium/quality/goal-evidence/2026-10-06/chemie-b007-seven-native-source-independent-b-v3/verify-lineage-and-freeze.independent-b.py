# SPDX-License-Identifier: Apache-2.0
# Exact lineage/UUID/source checks and bounded independent verdict. No active writes.
import json,hashlib,uuid
from pathlib import Path
from datetime import datetime,timezone
ROOT=Path(__file__).resolve().parents[7]; OUT=Path(__file__).resolve().parent
DATE=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06'
AUTHOR=DATE/'chemie-b007-seven-native-source-preparation-author-v3'
OLD=DATE/'chemie-b007-seven-routines-fourteen-cases-v2-independent-b-v1'
MAT=DATE/'chemie-b007-seven-routines-four-material-corrections-author-v2'
readbindings={}
def bind(p):
 p=Path(p); data=p.read_bytes();return {'path':str(p.relative_to(ROOT)) if p.is_relative_to(ROOT) else str(p),'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data)}
def read(p):
 p=Path(p);readbindings[str(p)]=bind(p);return json.loads(p.read_text())
def verify(b):
 p=ROOT/b['path'] if not b['path'].startswith('/') else Path(b['path']);a=bind(p);assert a['sha256']==b['sha256'] and a['bytes']==b['bytes'],b['path'];readbindings[str(p)]=a;return a

def write(name,v):
 p=OUT/name;assert not p.exists();p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def valhash(v):return hashlib.sha256(json.dumps(v,ensure_ascii=False,sort_keys=True).encode()).hexdigest()
now=datetime.now(timezone.utc).isoformat()
afreeze=AUTHOR/'native-source-preparation-author-v3.final.freeze.json'
assert bind(afreeze)['sha256']=='eacf8f185662b53414e77e3e7fa23aab9091e21b24fd335d026768ad6ed84f3a'
af=read(afreeze);authorfiles=[verify(b) for b in af['files']]
excluded=[b['path'] for b in af['inputBindings'] if 'independent-a' in b['path']]
authorinputs=[];authorInputDrifts=[]
for b in af['inputBindings']:
 if b['path'] in excluded:continue
 actual=bind(ROOT/b['path'])
 if actual!=b:
  assert b['path']=='AGENTS.md',b['path']
  authorInputDrifts.append({'path':b['path'],'historicalFrozenBinding':b,'actualCurrentBinding':actual,'meaning':'External instructions-file drift; historical freeze preserved; not a material/source/goal edit or a science verdict.'})
  readbindings[str(ROOT/b['path'])]=actual;authorinputs.append(actual)
 else:authorinputs.append(verify(b))
assert bind(OLD/'independent-b.final.freeze.json')['sha256']=='de8db8253bdc94fda2691ede33c739e63de9a135bb945ef65c2e790037af4ee9'
of=read(OLD/'independent-b.final.freeze.json');oldfiles=[verify(b) for b in of['files']]
oldreview=read(OLD/'independent-b.review.json')
oldbindings={b['path']:b for b in of['substantiveInputBindings']}
materialfiles=[]
for filename in ['seven-routines.de-en.author-candidate.json','cases.de-en.author-candidate.json','primary-cards.de-en.author-candidate.json']:
 p=MAT/filename;materialfiles.append(verify(oldbindings[str(p.relative_to(ROOT))]))
prototypes=read(MAT/'seven-routines.de-en.author-candidate.json')['prototypes']
cases=read(MAT/'cases.de-en.author-candidate.json')['cases'];cards=read(MAT/'primary-cards.de-en.author-candidate.json')['cards']
canon=read(AUTHOR/'qa-artifacts/DE_DEU_S_GYM_CANONICAL_CHEMIE.native-author-candidate.json');byid={g['id']:g for g in canon['goals']}
binder=read(AUTHOR/'seven-routine-uuid-and-fourteen-case-two-card-binders.author-candidate.json');ids=binder['routineGoalIds']
assert len(byid)==485 and len(cases)==14 and len(cards)==2 and len(prototypes)==7
memory=read(AUTHOR/'seven-memory-decisions-and-two-narrow-card-intents.author-candidate.json')
placements=read(AUTHOR/'seven-source-placement-intents-and-national-holds.author-candidate.json')
snapshot=read(DATE/'chemie-b007-three-safety-solutions-source-boundary-author-v1/three-current-goals-and-source-inputs.actual.json')
assert placements['allOriginalSourceInputFileBindings']==snapshot['allConfiguredMappingInputBindings']
source62=[verify(b) for b in placements['allOriginalSourceInputFileBindings']]
assert len(source62)==62 and placements['originalNationalSourceObligationCount']==403 and placements['originalMatchedMappingRowCount']==413
assert len({r['sourceGoalId'] for r in snapshot['currentSourceBindingRows']})==403 and len(snapshot['currentSourceBindingRows'])==413
uuidchecks=[];goalchecks=[]
for p in prototypes:
 key=p['localKey'];id=ids[key];g=byid[id]
 expected=str(uuid.uuid5(uuid.UUID(p['splitFromCurrentGoalId']),'skillpilot:de-gymnasium:chemie:b007:routine:'+key)) if key!='label' else p['id']
 assert id==expected and all(g[f]==p[f] for f in ['title','titleEn','description','descriptionEn'])
 uuidchecks.append({'routineLocalKey':key,'actualUUID':id,'expectedUUID':expected,'exact':True})
 goalchecks.append({'routineLocalKey':key,'actualUUID':id,'fourFullTextFieldsExactToPreviouslyReviewedV2':True,'currentWholeGoal':g})
casechecks=[]
for b in binder['caseBinders']:
 c=next(c for c in cases if c['caseLocalKey']==b['caseLocalKey']);assert b['nativeCandidateGoalId']==ids[c['routineLocalKey']]
 assert b['wholeCaseValueSha256']==valhash(c) and b['bodyCandidateGoalIdNotRewritten']==c['candidateGoalId']
 assert c['recordStatus']=='ai_candidate' and c['validationStatus']=='needs_human_review' and c['evidenceLevel']=='E1' and c['generalizationLevel']=='G1' and c['humanApproval']==False and c['humanTrial']==False
 casechecks.append({'caseLocalKey':c['caseLocalKey'],'routineLocalKey':c['routineLocalKey'],'actualNativeUUID':b['nativeCandidateGoalId'],'wholeCaseValueSha256':valhash(c),'previousFullScientificKEEPReused':True,'bodyGoalIdUnchanged':c['candidateGoalId'],'newNativePApproval':False})
cardchecks=[]
for b in binder['primaryCardBinders']:
 c=next(c for c in cards if c['cardLocalKey']==b['cardLocalKey']);assert valhash(c)==b['wholeCardValueSha256'] and b['nativeCandidateOriginGoalId']==ids[c['originRoutineLocalKey']]
 cardchecks.append({'cardLocalKey':c['cardLocalKey'],'actualOriginUUID':b['nativeCandidateOriginGoalId'],'candidateCardUUID':b['candidateCardId'],'wholeCardValueSha256':valhash(c),'previousFullScientificKEEPReused':True,'active':False,'newNativeMApproval':False})
sourcechecks=[]
for pl in placements['placements']:
 g=byid[pl['nativeCandidateGoalId']];assert pl['goalTextBindingSha256']==valhash({f:g[f] for f in ['title','titleEn','description','descriptionEn']})
 for witness in pl['sourceWitnesses']:
  if 'sourceExtractionPath' in witness:
   extraction=read(ROOT/witness['sourceExtractionPath']);records=extraction['sourceGoals'];record=next(r for r in records if r['id']==witness['sourceGoalId']);assert valhash(record)==witness['sourceRecordValueSha256']
   sourcechecks.append({'routineLocalKey':pl['routineLocalKey'],'actualUUID':g['id'],'sourceGoalId':record['id'],'wholeSourceRecordSha256':valhash(record),'page':12,'printedPage':11,'aspectOnly':True})
  else:
   assert pl['routineLocalKey']=='solubility' and witness['curricularRequirement']=='facultative' and witness['physicalPage']==13 and witness['printedPage']==12
   sourcechecks.append({'routineLocalKey':pl['routineLocalKey'],'actualUUID':g['id'],'sourceComponent':witness,'currentOfficialExtractionRecord':False,'aspectOnly':True})
# Independent native probe evidence: actual helpers already ran, no author-side execution.
native=read(OUT/'all112-native-effective-requires-and-exact-contexts.independent-b.actual.json')
sourceviews=read(OUT/'source40-native-compile-and-prospective-he8.independent-b.actual.json')
assert native['protected112Count']==112 and native['actualPages']==[378,382,382]
assert sum(r['baseWholeGoalExact'] and r['baseGoalFingerprintExact'] for r in native['all112'])==112
assert sum(r['variantWholeGoalExact'] for r in native['all112'])==108
assert sourceviews['affectedSourceViews']==40 and sourceviews['convertedBroadClusterGoalEntryErrors']==72 and sourceviews['prospectiveHE8CompilerFindings']==[]
modelcomparison=[]
for key in ['baseline','candidate','four-route-proposals']:
 a=read(AUTHOR/f'qa-artifacts/{key}-native-pure-book-model.json');b=read(OUT/f'{key}-native-pure-book-model.independent-b.actual.json')
 modelcomparison.append({'model':key,'wholeNativeModelParsedValuesExactToAuthor':a==b,'actualPageCount':len(b['pages'])})
# Page reads were performed earlier in this same review, from original local PDFs.
primarypages=[{'originalPDF': 'curricula/DE/Gymnasium/input/HE/lower-secondary/g9-chemie.pdf','physicalPage':n,'printedPage':n-1,'actualLocalOriginalPDFPageReadAsTextAndImage':True,'ownRender':f'sources/HE.physical-{n:03d}.independent-b-original-pdf.jpg'} for n in [8,12,13]]+[{'originalPDF':'curricula/DE/Gymnasium/input/NI/lower-secondary/kc_naturwissenschaften_gymnasium_sek_i_2015.pdf','physicalPage':51,'printedPage':51,'actualLocalOriginalPDFPageReadAsTextAndImage':True,'ownRender':'sources/NI.physical-051.independent-b-original-pdf.jpg'}]
write('exact-material-uuid-source-and-historical-reuse.independent-b.actual.json',{'schemaVersion':1,'createdAtUTC':now,'authorFreeze':bind(afreeze),'all31AuthorOutputBindingsVerified':authorfiles,'peerArtifactPathsExcludedWithoutReading':excluded,'historicalOwnBFreeze':bind(OLD/'independent-b.final.freeze.json'),'historicalOwnBOutputBindingsExact':oldfiles,'exactThreePreviouslyReviewedMaterialFiles':materialfiles,'freshWholeGoalTextAndUUIDChecks':goalchecks,'uuidAlgorithmChecks':uuidchecks,'fourteenWholeCaseAndActualUUIDBindings':casechecks,'twoWholeCardAndActualOriginBindings':cardchecks,'sevenExactSourceBinders':sourcechecks,'all62OriginalSourceAndMappingFilesByteExact':source62,'all403OriginalSourceObligationsAnd413MatchedRowsUnchanged':True,'actualPrimaryPageReads':primarypages,'actualNativePureModelsCompared':modelcomparison,'scientificMaterialFirstPassRestarted':False,'oldNativeGateApprovalsAssumed':False,'newNativeDPAOrMApprovals':0,'activeWrites':0})
reasons={
 'label':'HE8.1 mandatory Kennzeichnung von Stoffen supports interpreting the label as a single product. Supplied warnings and bounded lookup complete that interpretation; source lists/examples do not imply an exhaustive unprovided chemical-safety database.',
 'handling':'HE8.1 mandatory Schutzmaßnahmen supports a justified activity-specific precaution. The provided hazard and task conditions bound the choice; disposal and universal safety-table recall remain separate.',
 'disposal':'HE8.1 mandatory Entsorgung supports choosing a locally instructed residue route. Supplied identity/properties and local guidance preserve the stop-and-ask response for missing identity; no universal disposal table is required.',
 'preparation':'HE8.1 mandatory Lösen von festen, flüssigen und gasförmigen Stoffen in verschiedenen Lösungsmitteln supports one performed approved preparation with supplied instructions and documented result. Water/alcohol/petrol are examples, not a dangerous mandatory learner exposure.',
 'solubility':'HE physical13 printed12 is the facultative continuation of HE8.1, under Temperaturabhängigkeit der Löslichkeit. Saturated/unsaturated solutions and solubility graphs support bounded data-based saturation/capacity reasoning. The exact numerical remaining-capacity operation is our didactic operationalization, not a verbatim mandatory command. It must remain HE8 facultative; NI5/6 only witnesses qualitative property/experiments and is not this quantitative routine.',
 'mass_fraction':'HE8.1 explicitly names Massenanteil. Constituent mass divided by total mixture mass and interpretation is a single narrow routine. Solution preparation and numerical saturation remain separate; the source row is only partially served.',
 'volume_fraction':'HE8.1 explicitly names Volumenanteil. Pre-mixing component volumes and the stated reference preserve the correct definition when final volume is non-additive. This is one fraction routine, not a combined preparation/saturation skill.'}
oldbykey={r['localKey']:r for r in oldreview['routineReviews']}
reviews=[]
for pl in placements['placements']:
 key=pl['routineLocalKey'];m=next(r for r in memory['routineDecisions'] if r['routineLocalKey']==key)
 reviews.append({'routineLocalKey':key,'actualUUID':ids[key],'sourceAndScientificTextVerdict':'KEEP','sourceReason':reasons[key],'sourceScope':{'jurisdiction':'DE-HE','schoolForm':'Gymnasium','stage':'SekI','grades':['8'],'durationModel':'G9','courseLevel':'unspecified','topicCode':'8.1','physicalPage':13 if key=='solubility' else 12,'printedPage':12 if key=='solubility' else 11,'requirement':'facultative' if key=='solubility' else 'mandatory','scopeWholeRowOrWholeOriginalSourceApproved':False},'freshFullDEENCanonicalTextPersonallyRead':True,'atomicityVerdict':'KEEP','atomicityReason':oldbykey[key]['singlePerformanceProductRationale'],'directAtomicRequiresCandidateVerdict':'KEEP bounded routine only','memoryChoiceCandidateVerdict':'KEEP','memoryDecision':m['decisionIntent']['decision'],'memoryScopeLimit':'One prospective HE8 source view was natively compiled; no native M card/origin/visibility approval or national visibility is granted. Existing and two narrow cards remain separate candidate bindings.','fourteenCaseMaterialVerdictReused':'KEEP only exact unchanged reviewed bodies/UUID binders','integrationRouteVerdict':'REVISE at package level; a bounded source KEEP grants no national view/cluster-frontier/native D/P/A/M/V approval','nativeGateApproval':False,'humanApproval':False,'humanTrial':False})
routeIds=['d2ccd1d5-56f7-583f-9724-e97441367f91','018bec90-445f-4a88-b8bc-228f8335dee6','5338b54c-68bc-5892-907c-e025351ffde6','ebaae4f5-cc13-5493-98b1-10e1abeb638f']
rows={r['goalId']:r for r in native['all112']}
routes=[{'goalId':id,'title':rows[id]['title'],'directRequiresCandidateVerdict':'REVISE' if id.startswith('5338') else 'KEEP as narrow direct author proposal only','wholeNativeRouteVerdict':'REVISE','beforeEffective':rows[id]['effectiveRequires']['baseline'],'variantEffective':rows[id]['effectiveRequires']['fourRouteVariant'],'nativeEffectiveSetChanged':rows[id]['effectiveRequiresSetChangedInFourRouteVariant'],'reason':'Replacing the direct broad prerequisite does not remove inherited 53fd; ancestor10ce still supplies it.' if id.startswith('5338') else 'The narrower direct prerequisite is defensible for this operation; comprehensive cluster inheritance, source views and affected page bindings remain unresolved. No integrated route approval.'} for id in routeIds]
write('independent-b.source-science-and-native-route.review.json',{'schemaVersion':1,'createdAtUTC':now,'reviewer':'codex-chem-b007-native-source-independent-b-v3','independence':'Fresh B reviewer; no author mutations; no peer A review/approval artifacts read. Exact old own B materials reused, no restarted science review.','authorFreeze':bind(afreeze),'sevenReviews':reviews,'sevenSourceVerdicts':{'KEEP':7,'REVISE':0,'BLOCK':0},'wholeNativeRouteVerdict':'REVISE','activeIntegrationVerdict':'BLOCK pending targeted author followup','fourDirectProposals':routes,'all112NativeEffectiveRequiresReceipt':'all112-native-effective-requires-and-exact-contexts.independent-b.actual.json','actualPureNativeCounts':{'nodes':485,'atomicPages':382,'baselineAtomicPages':378,'changedBroadAtomsToAreas':2,'newAtoms':6},'baseProtected112WholeGoalsAndGoalFingerprintsExact':True,'variantProtectedWholeGoalsExact':108,'variantProtectedGoalFingerprintsExact':112,'goalFingerprintEqualityDoesNotProtectRequiresOrClusterChildMeaning':True,'baseAndVariantRealRenderedContextDeltaGoalIds':native['baseRealPageContextChangedGoalIds'],'remainingInheritedProtectedGoalIds':['988888bb-1f88-55f9-9a44-f3f60469a297','5338b54c-68bc-5892-907c-e025351ffde6','5dd180f1-f1c8-5f76-9c9a-ea3fc3d921bf','78109f6d-c415-52c4-8314-07c0dd888a80'],'inheritedSourceClusterId':'10ce2814-8796-5633-9bed-f6990d039b91','inheritedSourceClusterChain':['10ce2814-8796-5633-9bed-f6990d039b91','3588c15e-adbe-5b81-b3a7-10da20574e3d','442c31c5-c561-5c7a-90bb-2335d779175c'],'remainingUnprotectedDirectConsumers':['5abc5961-6368-52bb-88b9-6a846c3c37a8','f1ed86f0-534d-57d7-8952-a004a331cc54','10ce2814-8796-5633-9bed-f6990d039b91'],'backendSourceInference':'Actual computeEffectivePrereqMastery uses minimum GK-tagged child mastery for clusters, including optional core=false saturation. getRichFrontier composition logic may skip inherited goals explicitly absent from target and prerequisiteOnly. Native structural and pure-page obligations are proven; no executed runtime frontier test or blanket all-scope blockage is claimed.','fortySourceViewVerdict':'REVISE: actual unchanged compiler found72 CPV-009 cluster-as-goalEntry errors in40 affected views. Do not expand their broad historical refs into all seven operations automatically.','403WholeOriginalSourceHoldsRemainOpen':True,'NI5And6QuantitativeExpansionApproved':False,'pendingNativeGates':['actual source-view placement/faculty separation','minimal inherited/direct prerequisite routes and protected page-context decisions','native D rendered pages and current campaign','native P actual goal/profile/case/image bindings','native A kinds/atomicity ledger','native M actual cards/origins/all affected composition scopes','native V actual asset bindings if applicable','central M7 intersection owned by root'], 'currentActiveChemistryPreservation':'Active Chemistry112/378 remains unchanged in our measurements; no candidate integrated by this reviewer. Current floor is not rerun or lowered.','strictCompletionsAdded':0,'newNativeGateRecords':0,'activeWrites':0,'codeOrTestChanges':0,'fullBuildOrPDFPerformed':False,'newLearningImages':0,'humanApproval':False,'humanTrial':False})
# Capture only actual read bindings and exact historical inputs verified above.
for b in read(OUT/'native-probe.actual-read-input-bindings.json'):verify(b)
for p in [ROOT/'AGENTS.md',ROOT/'LICENSING.md',Path('/home/enpasos/.codex/attachments/b77af694-ca1d-42ad-a722-1a0b77a18fe8/goal-objective.md')]:readbindings[str(p)]=bind(p)
write('author-input-drift-and-current-read-bindings.independent-b.actual.json',{'authorPackage31FilesExact':True,'authorInputDrifts':authorInputDrifts,'peerArtifactsExcluded':excluded,'historicalFreezeModified':False,'noAllHistoricalInputsEqualClaim':True})
write('actual-read-inputs.final-bindings.json',list(readbindings.values()))
print(json.dumps({'sourceKEEP':7,'nativeRoutes':'REVISE','activeIntegration':'BLOCK','casesExactReused':14,'cardsExactReused':2,'sourceBindingsExact':62,'protected112EffectiveRecorded':112,'actual31AuthorFreezeExact':len(authorfiles),'nativeModels':modelcomparison,'peerFilesRead':0}))
