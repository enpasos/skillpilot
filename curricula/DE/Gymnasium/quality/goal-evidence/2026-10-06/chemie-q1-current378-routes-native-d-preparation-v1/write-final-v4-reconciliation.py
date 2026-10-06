from pathlib import Path
import json,csv,hashlib,datetime,shutil,subprocess
ROOT=Path('/home/enpasos/projects/skillpilot');REL=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-current378-routes-native-d-preparation-v1');OWN=ROOT/REL
ISO=ROOT/'tmp/chemie-q1-current378-routes-native-d-preparation-20261006-v1'
OLD=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-quantitative-reviewed-integration-candidate-v1'
def read(p):return json.loads(p.read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def wr(p,obj):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
oldModel=read(OLD/'actual-current-full378.after-metadata.book-model.json');newModel=read(OWN/'native-models/full-current378-final-v4.book-model.json')
oldPages={p['goalId']:p for p in oldModel['pages']};newPages={p['goalId']:p for p in newModel['pages']}
oldSubset=read(OLD/'native-finalbook/bundle/book-model.json');oldD={p['goalId']:p for p in oldSubset['pages']}
scope=read(OWN/'final-v4.native-d-union.actual.json');changedStrict={x['goalId'] for x in scope['rows'] if 'changed-current-strict-page' in x['category']}
prepared={};batches=[]
for index in range(1,4):
    folder=OWN/'native-current-d-batches'/f'batch-{index:03d}'
    manifest=read(folder/'batch-manifest.json');model=read(folder/'bundle/book-model.json')
    pdfinfo=subprocess.run(['pdfinfo',str(folder/'bundle/book.pdf')],capture_output=True,text=True,check=True)
    assert manifest['goalIds']==[p['goalId'] for p in model['pages']]
    assert manifest['curriculumAtomicDenominatorAtPreparation']==378
    for page in model['pages']:prepared[page['goalId']]={'batchNumber':index,'page':page,'batchId':manifest['batchId'],'bundleFingerprint':manifest['artifacts']['bundleFingerprint']}
    batches.append({'batchNumber':index,'batchId':manifest['batchId'],'goalIds':manifest['goalIds'],'goalCount':len(manifest['goalIds']),'preparedNativeModelDigest':model['digest'],'bundleFingerprint':manifest['artifacts']['bundleFingerprint'],'roundBindings':manifest['artifacts']['rounds'],'pdfSHA256':sha(folder/'bundle/book.pdf'),'htmlSHA256':sha(folder/'bundle/book.html'),'pdfinfoActual':pdfinfo.stdout,'nativePrepareExitCode':read(OWN/'terminal'/f'native-d-batch{index:03d}-prepare.actual.receipt.json')['exitCode'],'nativeCheckExitCode':read(OWN/'terminal'/f'native-d-batch{index:03d}-check.actual.receipt.json')['exitCode']})
assert set(prepared)==set(scope['orderedGoalIds']) and len(prepared)==53
rows=[]
for id in scope['orderedGoalIds']:
    before=oldPages[id];after=newPages[id];p=prepared[id]
    rows.append({'goalId':id,'titleDe':after['title'],'scopeClassification':'changed-current-strict-page' if id in changedStrict else 'old-ten-anchor-outside-changed45','alsoOldTenAnchor':id in oldD,'batchNumber':p['batchNumber'],'currentBatchId':p['batchId'],'old407FullPageFingerprint':before['pageFingerprint'],'currentV4FullPageFingerprint':after['pageFingerprint'],'old407ToCurrentV4FullPageChangedFields':sorted(k for k in set(before)|set(after) if before.get(k)!=after.get(k)),'old407GoalFingerprint':before['goalFingerprint'],'currentV4GoalFingerprint':after['goalFingerprint'],'old407NativeFinalbookSubsetPageFingerprint':oldD.get(id,{}).get('pageFingerprint'),'currentV4PreparedSubsetPageFingerprint':p['page']['pageFingerprint'],'currentV4PreparedSubsetGoalFingerprint':p['page']['goalFingerprint'],'currentV4PreparedSubsetPageNumber':p['page']['pageNumber'],'currentBundleFingerprint':p['bundleFingerprint'],'pageNumberAndReferenceExternalizationAreBindingFields':True,'old407FullNativePage':before,'currentV4FullNativePage':after,'currentV4PreparedSubsetNativePage':p['page'],'scienceReviewDecision':None,'supersessionRegistryWritten':False})
doc={'schemaVersion':1,'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'true53GoalIds':scope['orderedGoalIds'],'scopeCounts':{'changedCurrentStrict':45,'oldTenAnchorsOutsideChangedStrict':8,'oldTenAnchorsAlsoInChangedStrict':2,'union':53},'old407FullModelPath':str((OLD/'actual-current-full378.after-metadata.book-model.json').relative_to(ROOT)),'old407FullModelDigest':oldModel['digest'],'currentV4FullModelDigest':newModel['digest'],'batches':batches,'rows':rows,'sourceScienceApprovalNotInferredFromHashes':True,'supersessionRegistryWritten':False,'activeWrites':False,'humanApproval':False}
wr(OWN/'old407-to-current-v4.actual-wholepage-binding-delta-and-53-reconciliation.json',doc)
cols=['goalId','titleDe','scopeClassification','alsoOldTenAnchor','batchNumber','currentBatchId','old407FullPageFingerprint','currentV4FullPageFingerprint','old407ToCurrentV4FullPageChangedFields','old407NativeFinalbookSubsetPageFingerprint','currentV4PreparedSubsetPageFingerprint','currentV4PreparedSubsetPageNumber']
with (OWN/'old407-to-current-v4.actual-wholepage-binding-delta-and-53-reconciliation.csv').open('w',newline='') as f:
    out=csv.DictWriter(f,fieldnames=cols);out.writeheader()
    for row in rows:out.writerow({k:json.dumps(row[k],ensure_ascii=False) if isinstance(row[k],list) else row[k] for k in cols})

original=read(OWN/'actual-current376-inputs/canonical.chemie.json');future=read(ISO/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json');oldIds={g['id'] for g in original['goals']};newIds={g['id'] for g in future['goals']}
oldLedger=read(OWN/'actual-current376-inputs/semantic-kinds.json');futureLedger=read(OWN/'semantic-kinds.final-v4.inactive.json');oldAtomic={d['goalId'] for d in oldLedger['decisions'] if d['semanticKind']=='curricularAtomic'};newAtomic={d['goalId'] for d in futureLedger['decisions'] if d['semanticKind']=='curricularAtomic'}
assert not oldIds-newIds
assert oldAtomic-newAtomic=={'d3cd250f-5221-589d-aa1c-44a4692d1acb'}
origAtlas=read(OWN/'original376-source-atlas.native-checked.receipt.json');currentAtlas=read(ISO/'app/scripts/config/goal-books/source-views/de-gym-chemistry-national-atlas/source-projection.receipt.json')
beforeAtlas=read(OWN/'source-atlas-before-additive/app/scripts/config/goal-books/source-views/de-gym-chemistry-national-atlas/source-projection.receipt.json')
bindings=lambda d:{r['path']:r['sha256'] for r in d['inputBindings']}
bb=bindings(beforeAtlas);cb=bindings(currentAtlas)
sourceChanges=[{'path':p,'beforeSHA256':bb.get(p),'afterSHA256':cb.get(p)} for p in sorted(set(bb)|set(cb)) if bb.get(p)!=cb.get(p)]
assert {r['path'] for r in sourceChanges}=={'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json','curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'}
proof={'schemaVersion':1,'allOriginal474CanonicalGoalIdsRetained':True,'current376AtomicGoalIds':sorted(oldAtomic),'final378AtomicGoalIds':sorted(newAtomic),'originalAtomicIdsReclassified':sorted(oldAtomic-newAtomic),'addedAtomicIds':sorted(newAtomic-oldAtomic),'reclassificationNote':'Existing quantitative compound d3cd remains the author-reviewed curricularArea grouping of two separate HE quantitative atoms; no old goal ID deleted. SourceAtlas original three BY views never targeted d3cd and remain byte exact. This does not claim that all original376 atomic IDs are still atomic.','originalBYSourceViewsProofPath':str(REL/'original376-by-source-view-targets-preservation.actual.json'),'original376NativeSourceAtlasCounts':origAtlas['counts'],'finalV4NativeSourceAtlasCounts':currentAtlas['counts'],'sourceInputsChangedSinceV2':sourceChanges,'allMappingExtractionOfficialDocumentAndPolicyInputsExactSinceV2':True,'assessmentRequiresIsApplicabilityOnlyNotSourceCoverage':True,'legacyLiveCompilerDiagnosticContainsQualityMappingCopies':True,'legacyLiveCompilerDiagnosticNotUsedAsSourceCoverageApproval':True,'historicalDirectSourceEvidenceFieldMeansKindMappingOrProvenanceNotGuaranteedDirectCoverage':True,'scienceReviewDecision':None,'activeWrites':False,'humanApproval':False}
wr(OWN/'final-v4-original376-and-source-input-preservation.actual.json',proof)
snapshot=OWN/'final-v4-input-snapshot'
for path in ['curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json','curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json','curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json']:
    dst=snapshot/path;dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(ISO/path,dst)
cfg=read(ISO/'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json')
paths=[Path(cfg['manifestPath']),Path(cfg['navigationViewPath']),Path('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json')]+[p.relative_to(ISO) for p in (ISO/cfg['outputDirectory']).rglob('*') if p.is_file()]
for path in paths:
    dst=OWN/'source-atlas-final-v4'/path;dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(ISO/path,dst)
print(json.dumps({'true53':len(rows),'scopeClassification45plus8':[sum(r['scopeClassification']==v for r in rows) for v in ['changed-current-strict-page','old-ten-anchor-outside-changed45']],'batchSizes':[b['goalCount'] for b in batches],'changedOld407FullPagesIn53':sum(bool(r['old407ToCurrentV4FullPageChangedFields']) for r in rows),'nativeOriginal376SourceCheck':'PASS','sourceBindingsChangedSinceV2':len(sourceChanges)}))
