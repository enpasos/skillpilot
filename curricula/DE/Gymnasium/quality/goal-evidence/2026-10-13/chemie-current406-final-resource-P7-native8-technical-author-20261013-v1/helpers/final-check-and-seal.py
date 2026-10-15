import hashlib, json, pathlib
from datetime import datetime,timezone
T=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-current406-final-resource-P7-native8-technical-author-20261013-v1')
B=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-three-recycling-current403-graph-source-integration-author-20261013-v4')
def read(p):return json.loads(pathlib.Path(p).read_text())
def sha(p):return 'sha256:'+hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def bind(p):p=pathlib.Path(p);return {'path':str(p),'bytes':p.stat().st_size,'sha256':sha(p)}
def write(p,x):pathlib.Path(p).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
inputrefs=read(T/'INPUTS.exact-existing-author-and-independent-provenance.bindings.json')['bindings']
for b in inputrefs:assert sha(b['path'])==b['sha256'],b['path']
jsonfiles=list(T.rglob('*.json'));jsonlfiles=list(T.rglob('*.jsonl'))
for p in jsonfiles:read(p)
jsonlrows=0
for p in jsonlfiles:
    for line in p.read_text().splitlines():
        if line.strip():json.loads(line);jsonlrows+=1
full=read(T/'models/whole406.final-resource-P7.stock-book-model.inactive.json')
subset=read(T/'native-eight/bundle/book-model.json')
manifest=read(T/'native-eight/batch-manifest.json')
assert len(full['pages'])==406 and len(subset['pages'])==8
assert [p['goalId'] for p in subset['pages']]==manifest['goalIds']
P=[]
for p in ['positive/four-current406.exact-retained.ai-candidate.needs-human-review.jsonl','positive/three-current406.ai-candidate.needs-human-review.jsonl']:
    P += [json.loads(l) for l in (T/p).read_text().splitlines() if l.strip()]
assert len(P)==7 and len({p['goalId'] for p in P})==7
assert all(p['status']=='needs_human_review' and p['reviewAuthority']=='ai_candidate' and p['evidenceLevel']=='E1' and p['maximumClaimScope']=='G1' and p['reviewRunIds']==[] for p in P)
for record in P:
    page=next(p for p in full['pages'] if p['goalId']==record['goalId'])
    assert page['goalFingerprint']==record['goalFingerprint']
    assert page['evidenceReview']['profileFingerprint']==record['profileFingerprint']
    assert page['evidenceReview']['reviewInputFingerprint']==record['reviewInputFingerprint']
candidate=read(T/'positive/three-current406.exact-CAS-candidate-set.author.json')
for spec in candidate['goals']:assert spec['profile']==next(p for p in P if p['goalId']==spec['goalId'])['profile']
assert read(T/'positive/six-current406.exact-CAS-cases.DEEN.author.json')['cases']==read(B/'inputs/six-accepted-whole-cases.current-v2.DEEN.json')['cases']
land=read(T/'candidate/canonical531.current406.final-resources.inactive.json')
base=read(B/'candidate/canonical531.current406.final-compiled.inactive.json')
diff=[g['id'] for g,b in zip(land['goals'],base['goals']) if g!=b]
assert set(diff)==set(candidate['goals'][i]['goalId'] for i in range(3))
assets=read(T/'checks/eight-exact-publicRoot-source-assets.actual.json')['assets']
for asset in assets:
    assert sha(asset['source']['path'])==asset['source']['sha256']==sha(asset['copy']['path'])
    page=next(p for p in subset['pages'] if p.get('visualization',{}).get('url')==asset['url'])
    assert page['visualization']['originalDigest']==asset['source']['sha256']
parent='17ab1148-7383-5cab-8b91-73aff795f1e4'
children=['981242bb-a729-5701-b02d-c2f7f489e5af','53db04a0-ea76-5810-9526-c8639100e497']
page=next(p for p in subset['pages'] if p['goalId']==parent)
reverse={x['goalId'] for x in page['reverseRequires']+page['externalReverseRequires']}
assert set(children)<=reverse
rounds={}
for name in ['a','b']:
    c=read(T/('native-eight/round-'+name+'/description-review-campaign.json'))
    i=read(T/('native-eight/round-'+name+'/description-review-input.json'))
    assert c['goalCount']==8 and i['goalCount']==8
    assert c['bookDigest']==subset['digest'] and c['bundleFingerprint']==manifest['artifacts']['bundleFingerprint']
    assert i['goals'][0]['currentDescriptionDe']==land['goals'][next(ix for ix,g in enumerate(land['goals']) if g['id']==i['goals'][0]['goalId'])]['description']
    rounds[name]={'campaign':bind(T/('native-eight/round-'+name+'/description-review-campaign.json')),'input':bind(T/('native-eight/round-'+name+'/description-review-input.json')),'batchInput':bind(next((T/('native-eight/round-'+name+'/batches')).glob('*.input.jsonl'))),'independenceGroupId':c['independenceGroupId']}
assert rounds['a']['independenceGroupId']!=rounds['b']['independenceGroupId']
render=read(T/'native-eight/bundle/book.pdf.render-manifest.json')
assert render['goalPageCount']==8 and render['frontMatterPageCount']==2 and render['physicalPageCount']==10
write(T/'CHECKS.final-stock-preparation-and-portable-inputs.actual.json',{
    'status':'Finite current406 P7/native8 technical preparation complete',
    'parsedJsonFiles':len(jsonfiles),'parsedJsonlFiles':len(jsonlfiles),'parsedJsonlRows':jsonlrows,
    'externalFrozenInputsAllUnchanged':True,'allOther528GoalBodiesExactlyPreserved':True,
    'changed531GoalIdsOnlyResourceLinks':diff,'fullBookPages':406,'targetNativeGoalPages':8,'physicalPdfPages':10,
    'actualPublicRootAssets':8,'allBoundSourceCopiesAndNativeImageDigestsExact':True,
    'currentP7Statuses':'needs_human_review / ai_candidate / E1 / G1 / no reviewRunIds',
    'threeStockRecordsProfilesExactlyAcceptedTaskCASContent':True,'sixFullCaseBodiesExactlyAcceptedSourceGraphV4Input':True,
    'fourRetainedStockRecordsHaveExactCurrentGoalProfileResourceFingerprints':True,
    'nativeParentReverseRequiresChildren':children,'nativeStockPrepareExitCode':0,'nativeStockCheckExitCode':0,
    'noDirectorySymlinkDiscoveryFixture':True,'freshNativeDReviewPending':True,
    'newScientificApproval':False,'newDApproval':False,'newAApproval':False,'newMApproval':False,'newPApproval':False,
    'humanApproval':False,'humanTrial':False,'newStrictCompletions':0,'activeWrites':False,'githubWrites':False
})
selector={
    'schemaVersion':1,'status':'Ready for two fresh blind independent native D reviewers; technical composition only',
    'candidateLandscape':bind(T/'candidate/canonical531.current406.final-resources.inactive.json'),
    'candidateSemanticLedger':bind(T/'candidate/semantic531.current406.final-resources.inactive.json'),
    'candidateQA':bind(T/'candidate/QA.current403-plus-three-exact-reviewed-images.inactive.json'),
    'fullCurrent406Model':bind(T/'models/whole406.final-resource-P7.stock-book-model.inactive.json'),
    'nativeEightModel':bind(T/'native-eight/bundle/book-model.json'),'nativePdf':bind(T/'native-eight/bundle/book.pdf'),
    'nativeHtml':bind(T/'native-eight/bundle/book.html'),'nativeBatchManifest':bind(T/'native-eight/batch-manifest.json'),
    'nativeSubsetDigest':subset['digest'],'nativeBundleFingerprint':manifest['artifacts']['bundleFingerprint'],
    'native8Ids':manifest['goalIds'],'rounds':rounds,
    'P3':bind(T/'positive/three-current406.ai-candidate.needs-human-review.jsonl'),
    'P4ExactRetained':bind(T/'positive/four-current406.exact-retained.ai-candidate.needs-human-review.jsonl'),
    'P3FullSixCases':bind(T/'positive/six-current406.exact-CAS-cases.DEEN.author.json'),
    'P4FullEightCases':bind('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-current403-four-profile-current-input-author-successor-20261013-v1/positive/eight-whole-cases.exact-unchanged.json'),
    'unchangedSourceCompilerInputsReference':bind(B/'NEUTRAL.three-recycling-graph-source.exact-input-selector.json'),
    'unchangedPortableSourceAPIReference':bind(B/'configs/source-atlas.portable-pure-api.config.json'),
    'AMExactResourceOnlyRetentionReference':bind(T/'checks/A3-M3-stock-resource-only-retention.actual.json'),
    'assetSourceBindings':bind(T/'checks/eight-exact-publicRoot-source-assets.actual.json'),
    'technicalChecks':bind(T/'CHECKS.final-stock-preparation-and-portable-inputs.actual.json'),
    'newScientificApproval':False,'newDApproval':False,'newStrictCompletions':0,'humanApproval':False,'activeWrites':False
}
write(T/'NEUTRAL.current406-P7-native8.exact-input-selector.json',selector)
files=[bind(p) for p in sorted(T.rglob('*')) if p.is_file() and p.name!='SEAL.finite-current406-P7-native8-technical-author.actual.json']
seal={'schemaVersion':1,'sealedAtUTC':datetime.now(timezone.utc).isoformat(),'status':'Finite integrable inactive current406 follow-up inputs; awaiting two independent native D reviews','files':files,'fileCount':len(files),'totalBytes':sum(f['bytes'] for f in files),'newScientificApproval':False,'newDApproval':False,'newStrictCompletions':0,'humanApproval':False,'humanTrial':False,'activeWrites':False,'gitWrites':False,'githubWrites':False}
write(T/'SEAL.finite-current406-P7-native8-technical-author.actual.json',seal)
print(json.dumps({'seal':bind(T/'SEAL.finite-current406-P7-native8-technical-author.actual.json'),'neutralSelector':bind(T/'NEUTRAL.current406-P7-native8.exact-input-selector.json'),'full406Digest':full['digest'],'native8Digest':subset['digest'],'nativeBundleFingerprint':manifest['artifacts']['bundleFingerprint'],'fileCount':len(files),'totalBytes':seal['totalBytes']},ensure_ascii=False,indent=2))
