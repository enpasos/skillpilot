from pathlib import Path
import json,hashlib,datetime,collections
out=Path('/mnt/e/skillpilot-chemie-L7-20261017/chemie-current439-twelve-fresh-independent-b-v1')
base=Path('/mnt/e/skillpilot-chemie-L7-20261017/current439-b008-terminal12-native-preparation-technical-c-v1/capsule/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-b008-terminal12-native-preparation-technical-c-v1')
material=Path('/mnt/e/skillpilot-chemie-L7-20261017/current439-twelve-whole-case-materials-clean-root-v1')
def pin(p):
 p=Path(p);b=p.read_bytes();return{'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verify(p):
 a=pin(p['path']);assert a['sha256']==p['sha256'],p['path'];assert a['bytes']==p['bytes'],p['path'];return a
s=json.loads((base/'SELECTOR.clean-current12-with-context39-reviewer-inputs.sealed.json').read_text())
w=json.loads(Path(s['view']['path']).read_text())
ms=json.loads((material/'SELECTOR.current12-full-case-materials.clean.sealed.json').read_text())
ads=json.loads((material/'SELECTOR.current12-existing-six-research-source-files.additive.sealed.json').read_text())
campaign=json.loads((base/'native12/round-b/description-review-campaign.json').read_text());batch=campaign['batches'][0]
records=out/'results'/(batch['batchId']+'.records.jsonl');run=out/'results'/(batch['batchId']+'.run.json');rs=[json.loads(x)for x in records.read_text().splitlines()];rm=json.loads(run.read_text());
assert len(rs)==12 and [r['goalId']for r in rs]==s['goalIds']
assert rm['outputDigest']=='sha256:'+pin(records)['sha256']
first=out/'FIRST.independent-scientific-findings.frozen.md';assert pin(first)['sha256']=='4ff0f27b957cbe341965344f7c6a531a0444e997e3ab7c093430d4303ea25323'
checked={}
for q in [s['view'],s['wholeCurrentScientificContextPin'],s['current12AuthoredContextAndCanonicalPartnersPin'],s['currentCanonicalPin'],s['configPin'],s['batchManifestPin']]+s['bundleArtifactPins']+w['assetPins']+s['sourceGuards']+s['parentSupportSourceGuards']+ms['finiteMaterialFiles']+[ms['view']]+[x['exactCleanCopy']for x in ads['files']]:
 if q['path']not in checked:checked[q['path']]=verify(q)
for q in next(x for x in s['rounds']if x['round']=='round-b')['inputPins']:
 checked[q['path']]=verify(q)
checks=[]
for name in ['stock-batch','stock-campaign']:
 c=json.loads((out/(name+'-command.json')).read_text());assert c['exitCode']==0
 checks.append({'command':pin(out/(name+'-command.json')),'rawOutput':pin(out/(name+'-validation.txt')),'exitCode':0})
assets={}
for g in w['goals']:
 d=g['reviewContext']['page']['visualization']['originalDigest'].removeprefix('sha256:')
 a=next(x for x in w['assetPins']if x['sha256']==d and'/app/public/'in x['path'])
 assets.setdefault(d,{'originalAsset':pin(a['path']),'goalIds':[],'inspection':'Actual image viewed through tools.view_image; original detail requested, tool resized two2752px files to2048px for display.'})['goalIds'].append(g['goalId'])
viewed=[]
for g in w['goals']:
 pnum=g['reviewContext']['page']['pageNumber'];p=out/'viewed-pdf-pages'/f'current12-page-{pnum+2:02}.png';viewed.append({'goalId':g['goalId'],'bookGoalPageNumber':pnum,'physicalPdfPageOneBased':pnum+2,'derivedRaster':pin(p),'inspection':'Actually displayed with tools.view_image.'})
# Retain only inspected page rasters in the sealed viewer list; frontmatter1/2 was rendered, not visually inspected.
for p in [out/'viewed-pdf-pages/current12-page-01.png',out/'viewed-pdf-pages/current12-page-02.png']:p.unlink()
verification={'schemaVersion':1,'role':'Exact frozen source pin verification after independent B output creation; no scientific approval','verifiedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'verifiedUniqueInputFileCount':len(checked),'allVerifiedByteExact':True,'inputs':[checked[k]for k in sorted(checked)]}
vp=out/'frozen-source-pin-verification.json';vp.write_text(json.dumps(verification,ensure_ascii=False,indent=2)+'\n')
entry=[]
for raw,r in zip(records.read_bytes().splitlines(keepends=True),rs):entry.append({'recordId':r['recordId'],'runId':r['runId'],'goalId':r['goalId'],'goalFingerprint':r['goalFingerprint'],'pageFingerprint':r['pageFingerprint'],'decision':r['decision'],'evidenceProfileRecommendation':r['evidenceProfileRecommendation'],'exactJsonlLineDigest':'sha256:'+hashlib.sha256(raw).hexdigest()})
selector={
 'schemaVersion':1,'role':'Finite sealed fresh independent native B description review of CURRENT12 Chemistry goals; no paired synthesis or other-lane approvals','sealedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'status':'independent-D12-candidate-review-complete-one-P-recommendation-open',
 'baseCleanSelector':pin(base/'SELECTOR.clean-current12-with-context39-reviewer-inputs.sealed.json'),
 'wholeCaseMaterialSelector':pin(material/'SELECTOR.current12-full-case-materials.clean.sealed.json'),
 'sixResearchSourceAddendumSelector':pin(material/'SELECTOR.current12-existing-six-research-source-files.additive.sealed.json'),
 'rawFIRST':pin(first),'FIRSTFrozenBeforeRecordsAndRun':True,
 'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint'],'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],'reviewInputFingerprint':campaign['reviewInputFingerprint'],
 'preparedBInputPins':next(x for x in s['rounds']if x['round']=='round-b')['inputPins'],
 'recordCount':12,'goalIds':s['goalIds'],'runId':rm['runId'],'records':pin(records),'runManifest':pin(run),'recordEntries':entry,
 'descriptionDecisions':dict(collections.Counter(r['decision']for r in rs)),'evidenceProfileRecommendations':dict(collections.Counter(r['evidenceProfileRecommendation']for r in rs)),
 'unresolvedPRecommendation':pin(out/'P-recommendation-B-P-01.unresolved.json'),
 'actualViewedArtifacts':{'pdf':pin(base/'native12/bundle/book.pdf'),'pdfGoalPageCount':12,'pdfPhysicalPageCount':14,'frontmatterVisuallyInspected':False,'pages':viewed,'distinctOriginalImages':list(assets.values()),'html':pin(base/'native12/bundle/book.html'),'htmlInspection':'Actual source parsed/read; no browser-rendered HTML acceptance claimed.','bookModel':pin(base/'native12/bundle/book-model.json'),'bookModelInspection':'All12 actual current page goals/descriptions and source context read.'},
 'nativeAvailabilityAndParameters':pin(out/'native-execution-availability-and-parameters.json'),
 'scientificInspectionAvailability':{'fullCurrentGoalDescriptionsDeEn':12,'currentWholeProfileBodies':12,'wholeOperativeCases':24,'authoredContextViews':39,'finiteMaterialFilesActuallyInspected':22,'researchDossierFilesActuallyRead':6,'noLearnerPerformance':True,'providerOrModelFamilyDiversityClaimed':False},
 'boundedStockValidation':checks,'frozenInputPinVerification':pin(vp),
 'stockValidatorSourcePins':[pin(Path('/home/enpasos/projects/skillpilot')/p)for p in ['app/scripts/validateGoalDescriptionReviewCampaign.ts','app/scripts/validateGoalDescriptionReviewCampaignResults.ts','app/scripts/validateGoalEvidenceFindings.ts','contracts/goal-description-review/v1/goal-description-review-record.schema.json','contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json']],
 'authority':'ai_candidate','humanApproval':False,'newPApprovals':0,'newAApprovals':0,'newMApprovals':0,'newVApprovals':0,'M7GainClaimed':0,'pairedSynthesisPerformed':False,'oldReviewerScientificJudgmentsRead':False,'historicMissingPdfReconstructed':False,'imageGenerationOrMutation':False,'canonicalOrMainOrSourceMutationByReviewer':False,'fullCentralCheckOrFullBuildRun':False,
 'materialLimit':'D12 keep does not resolve B-P-01, establish whole official source clearance, approve a profile or certify any actual learner performance.'
}
sp=out/'SELECTOR.current12-independent-native-b.sealed.json';assert not sp.exists();sp.write_text(json.dumps(selector,ensure_ascii=False,indent=2)+'\n');json.loads(sp.read_text());sp.chmod(0o444)
for p in [first,records,run,out/'native-execution-availability-and-parameters.json',out/'P-recommendation-B-P-01.unresolved.json',vp]:p.chmod(0o444)
pin_=pin(sp);(out/'SELECTOR.current12-independent-native-b.sha256.txt').write_text(pin_['sha256']+'  '+sp.name+'\n');print(json.dumps({'selector':pin_,'records':pin(records),'run':pin(run),'FIRST':pin(first),'decisions':selector['descriptionDecisions'],'profileRecommendations':selector['evidenceProfileRecommendations'],'verifiedInputs':len(checked),'viewedPdfGoalPages':len(viewed),'viewedUniqueImages':len(assets),'stockChecks':[x['exitCode']for x in checks]},indent=2))
