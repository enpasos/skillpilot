import json,pathlib,hashlib,datetime,os
R=pathlib.Path.cwd();Q=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06';A=Q/'chemie-next-coherent-current-gap-native-author-v2';D=Q/'chemie-next25-current-native-description-independent-b-v2';P=Q/'chemie-next25-current-positive-profile-independent-b-v2'
def sha(b):return 'sha256:'+hashlib.sha256(b).hexdigest()
def read(p):return json.loads(p.read_text())
def bind(p): b=p.read_bytes();return {'path':str(p.relative_to(R)) if p.is_relative_to(R) else str(p),'sha256':sha(b),'bytes':len(b)}
def write(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
af=A/'current-twenty-five-final-native-author-v2.final.freeze.json';assert sha(af.read_bytes())=='sha256:bd77128c7bbb71eb96f90ae9ab32feca8c26d46bd520c87adaf8cfd361f917dc';a=read(af);common={b['path']:b for b in a['files']+a['inputs']};common[str(af.relative_to(R))]=bind(af)
for f in ['app/scripts/goalBookModel.ts','app/scripts/materializeGoalDescriptionRolloutBatch.ts','app/scripts/validateGoalDescriptionReviewCampaign.ts','app/scripts/validateGoalEvidenceFindings.ts','app/scripts/positiveGoalEvidenceReview.ts','app/scripts/positiveGoalEvidenceProfileModel.ts','app/scripts/goalEvidenceProfileModel.ts','contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','contracts/goal-description-review/v1/goal-description-review-record.schema.json','contracts/goal-evidence/v2/goal-evidence-profile.schema.json','contracts/goal-evidence/v2/goal-evidence-review-config.schema.json','app/package-lock.json','app/scripts/config/goal-books/source-views/de-gym-chemistry-national-atlas/source-projection.receipt.json']:
 common[f]=bind(R/f)
for s in read(D/'independent-b.current-entry.protected-whole-goal-hashes.actual.json')['subjects']:common[s['landscapePath']]=bind(R/s['landscapePath'])
# independently verify every bound outside file again at final sealing
for b in common.values():actual=bind(R/b['path']);assert actual==b,b['path']
assert read(D/'independent-b.native-D20-D5-validation.actual.json')['allPass'];assert read(P/'independent-b.native-P25-validation.actual.json')['status']=='PASS25';assert all(r['actualPDFAndBrowserViewed'] for r in read(D/'independent-b.actual25-native-HTML-PDF-sight-and-context.receipt.json')['rows'])
results=[]
for own,label in [(D,'D'),(P,'P')]:
 f=own/('independent-b.current-native-description-v2.final.freeze.json' if label=='D' else 'independent-b.current-positive-profile-v2.final.freeze.json');assert not f.exists(),f
 payloads=[bind(p) for p in sorted(own.rglob('*')) if p.is_file() and not p.is_symlink() and p!=f]
 symlinks=[{'path':str(p.relative_to(R)),'linkText':os.readlink(p),'purpose':'Read-only native npm dependency resolution; no dependency tree copy or active mutation'} for p in sorted(own.rglob('*')) if p.is_symlink()]
 inputs=dict(common)
 if label=='P':
  # own completed D evidence is allowed; it is this same independent reviewer, no peer run.
  for p in D.rglob('*'):
   if p.is_file() and not p.is_symlink():inputs[str(p.relative_to(R))]=bind(p)
 verdict=read(own/('independent-b.final25-description.verdict.json' if label=='D' else 'independent-b.final25-profile-and50-materials.verdict.json'))
 out={'schemaVersion':1,'documentType':'Independent chemistry '+label+'-B final current-v2 immutable reviewer freeze','createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'Independent machine candidate review, not AUTHOR/root peer/human/source-whole approval','authorFreeze':bind(af),'activeCanonicalChemistryBasis':bind(R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'),'files':payloads,'inputs':[inputs[k] for k in sorted(inputs)],'symlinks':symlinks,'counts':verdict['counts'],'actualNativeValidation':'PASS20+PASS5' if label=='D' else 'PASS25; 0approved/25needs_human_review/0rejected, errors[]','actualNativePageSight':{'PDFGoalPages':25,'HTMLBrowserGoalPages':25,'noWholeAppOrFullAtlasSightClaim':True},'independentCurrent378AndCandidate378WholeModelsExact':True,'independentNative20And5WholeModelsExact':True,'strictProtectedWholeChem127AndPagesExact':True,'activeWholeChemMathPhysBioCanonBytesExact':True,'sourceHOLD':{'unresolvedSourceScopeDecisions':496,'omittedWholeGoals':19,'nanoB07Stored13ActualPrinted14':'REVISE_METADATA_PENDING','secondB04CurrentPrinted16AlreadyCorrect':True},'concreteDescriptionRevisionPendingGoalIds':['0acc8cd2-be6d-567e-a023-1d9e90475510'],'postCorrectionOperativeRebindingAndContinuityPending':True,'strictNetGain':0,'activeWrites':False,'historyModified':False,'gitWrites':False,'globalCentralBuilds':False,'subagentsUsed':False,'rootPeerDAorPARead':False,'modelVotesGrantReleaseAuthority':False,'humanApproval':False,'humanTrial':False}
 write(f,out)
 # byte-exact final verification; freeze itself intentionally excluded from its payload closure
 for b in out['files']+out['inputs']:assert bind(R/b['path'])==b,b['path']
 results.append({'label':label,'freeze':bind(f),'payloadFiles':len(payloads),'filesIncludingFreeze':len(payloads)+1,'externalInputs':len(inputs),'symlinkCount':len(symlinks),'allPayloadAndInputBytesVerified':True})
print(json.dumps(results,ensure_ascii=False,indent=2))
