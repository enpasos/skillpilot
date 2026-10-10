from pathlib import Path
import json,hashlib,subprocess,os,re
R=Path.cwd();Q=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-current336-actual173-native-description-input-preparation-technical-v1'
def read(p):return json.loads(p.read_text())
def digest(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def edges(p,key,external):
 return sorted((x['goalId'],x['title']) for x in p[key]+p[external])
plan=read(Q/'actual173-native-batch-configs-and336-freeze.preparation-plan.json')
model=read(Q/'freeze/whole-active-current336.normal-production-book-model.json')
originalById={p['goalId']:p for p in model['pages']}
canonical=read(R/model['source']['landscapePath']);canonicalById={g['id']:g for g in canonical['goals']}
nativeCtx={g['goalId']:g for g in read(Q/'private-preparation-evidence/current336-actual-native-canonical-contexts.json')['rows']}
ps={p['goalId']:p for p in map(json.loads,(R/model['source']['evidenceReviewSources'][0]['path']).read_text().splitlines())}
allArtifactHashes={};batchProof=[];roundPlans={'a':[],'b':[]};allIds=[]
prompt=R/'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md'
criteria=Q/'criteria/current336-description-owner-binding.frozen-blind.criteria.md'
pdfEnv=dict(os.environ);pdfEnv['LD_LIBRARY_PATH']='/tmp/skillpilot-native-poppler-56ptay2_/extracted/usr/lib/x86_64-linux-gnu'
pdfinfo='/tmp/skillpilot-native-poppler-56ptay2_/extracted/usr/bin/pdfinfo'
for configPath in plan['nativeBatchConfigPaths']:
 cfg=read(R/configPath);out=R/cfg['outputDirectory'];bundle=out/'bundle';bm=read(bundle/'book-model.json');manifest=read(bundle/'manifest.json')
 assert bm['source']==model['source']
 assert bm['navigation']['derivedProjection']['baseModelDigest']==model['digest']
 assert bm['navigation']['derivedProjection']['selectedGoalIds']==cfg['goalIds']
 assert [p['goalId'] for p in bm['pages']]==cfg['goalIds']
 ai=read(out/'round-a/description-review-input.json');bi=read(out/'round-b/description-review-input.json');assert ai==bi
 assert ai['goalCount']==len(cfg['goalIds'])<=20
 for page,g in zip(bm['pages'],ai['goals']):
  gid=g['goalId'];old=originalById[gid];can=canonicalById[gid]
  assert gid==page['goalId']
  for k,f in [('currentTitleDe','title'),('currentTitleEn','titleEn'),('currentDescriptionDe','description'),('currentDescriptionEn','descriptionEn')]:assert g[k]==can[f]
  assert g['canonicalContext']==nativeCtx[gid]['canonicalContext']
  assert g['goalFingerprint']==old['goalFingerprint']==nativeCtx[gid]['goalFingerprint']
  assert g['reviewContext']['page']==page and g['pageFingerprint']==page['pageFingerprint']
  assert g['reviewContext']['evidenceProfile']==ps[gid]
  assert ps[gid]['status']=='needs_human_review' and ps[gid]['reviewAuthority']=='ai_candidate'
  assert ps[gid]['evidenceLevel']=='E1' and ps[gid]['maximumClaimScope']=='G1'
  assert page['visualization']==old['visualization']
  assert digest(R/('app/public'+page['visualization']['url']))==page['visualization']['originalDigest']
  assert edges(page,'requires','externalPrerequisites')==edges(old,'requires','externalPrerequisites')
  assert edges(page,'reverseRequires','externalReverseRequires')==edges(old,'reverseRequires','externalReverseRequires')
  mutable={'pageNumber','navigationOrder','treeOrder','pageFingerprint','requires','reverseRequires','externalPrerequisites','externalReverseRequires'}
  assert {k:v for k,v in page.items() if k not in mutable}=={k:v for k,v in old.items() if k not in mutable}
 allIds+=cfg['goalIds']
 artifactProof=[]
 for a in manifest['artifacts']:
  path=bundle/a['path'];assert path.stat().st_size==a['bytes'] and digest(path)==a['digest']
  artifactProof.append({'role':a['role'],'path':str(path.relative_to(R)),'bytes':a['bytes'],'digest':a['digest']})
 for kind in ['html','pdf']:
  rm=read(bundle/('book.'+kind+'.render-manifest.json'))
  assert rm['modelDigest']==bm['digest'] and rm['goalPageCount']==len(cfg['goalIds'])
  assert [p['goalId'] for p in rm['pages']]==cfg['goalIds']
  assert rm['publicationMode']=='review' and rm['feedbackBaseUrl']=='https://skillpilot.com/lernziel-feedback'
  assert digest(bundle/('book.'+kind))==rm['artifactSha256']
 result=subprocess.run([pdfinfo,str(bundle/'book.pdf')],env=pdfEnv,text=True,capture_output=True,check=True)
 pages=int(re.search(r'^Pages:\s+(\d+)',result.stdout,re.M).group(1))
 pdfmanifest=read(bundle/'book.pdf.render-manifest.json');assert pages==pdfmanifest['physicalPageCount']
 roundCampaigns={}
 for suffix in ['a','b']:
  rd=out/('round-'+suffix);campaign=read(rd/'description-review-campaign.json')
  assert campaign['reviewPass']=='first_pass' and campaign['blindToOtherReviews'] is True
  assert campaign['batchSize']==20 and len(campaign['batches'])==1
  assert campaign['batches'][0]['goalIds']==cfg['goalIds']
  assert (rd/'prompt.md').read_bytes()==prompt.read_bytes()
  assert (rd/'criteria.md').read_bytes()==criteria.read_bytes()
  assert list((rd/'results').iterdir())==[]
  roundCampaigns[suffix]=campaign
  batchInput=rd/'batches'/(campaign['batches'][0]['batchId']+'.input.jsonl')
  allowed=[rd/'description-review-campaign.json',rd/'description-review-input.json',batchInput,
   rd/'review-bundle-manifest.json',rd/'prompt.md',rd/'criteria.md',rd/'contracts/goal-description-review-record.schema.json',
   bundle/'manifest.json',bundle/'book-model.json',bundle/'book.pdf',bundle/'book.pdf.render-manifest.json',
   bundle/'book.html',bundle/'book.html.render-manifest.json',bundle/'review.md',bundle/'review-input.json',bundle/'review-input.jsonl']
  imagePaths=['app/public'+p['visualization']['url'] for p in bm['pages']]
  roundPlans[suffix].append({'batchConfigPath':configPath,'batchId':cfg['batchId'],'goalIds':cfg['goalIds'],
   'goalCount':len(cfg['goalIds']),'ownRoundDirectory':str(rd.relative_to(R)),
   'ownBatchInputPath':str(batchInput.relative_to(R)),
   'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'independenceGroupId':campaign['independenceGroupId'],
   'bookDigest':bm['digest'],'reviewInputFingerprint':ai['reviewInputFingerprint'],
   'criteriaFingerprint':campaign['criteriaFingerprint'],'promptFingerprint':campaign['promptFingerprint'],
   'exactAllowedReviewerInputPaths':[str(p.relative_to(R)) for p in allowed],
   'actualOriginalCurrentImagePaths':imagePaths})
 assert roundCampaigns['a']['independenceGroupId']!=roundCampaigns['b']['independenceGroupId']
 assert list((out/'resolutions').iterdir())==[]
 for p in out.rglob('*'):
  assert not p.is_symlink()
  if p.is_file():allArtifactHashes[str(p.relative_to(R))]=digest(p)
 batchProof.append({'batchId':cfg['batchId'],'goalIds':cfg['goalIds'],'count':len(cfg['goalIds']),
  'subsetNativeModelDigest':bm['digest'],'baseNativeModelDigest':model['digest'],'physicalPdfPageCount':pages,
  'currentPositiveProfileCasesInScopedInputs':sum(len(ps[i]['profile']['applicationCaseBriefs']) for i in cfg['goalIds']),
  'nativeOwnerReferenceSetsPreservedByExternalization':True,'wholePositiveProfileRowsExact':True,
  'actualBilingualCanonicalTextAndNativeContextsExact':True,'matchingNativePdfAndHtmlArtifactProof':artifactProof})
assert allIds==plan['nativeOrderGoalIds173'] and len(allIds)==len(set(allIds))==173
for suffix in ['a','b']:
 path=Q/('current173-blind-round-'+suffix+'.exact-reviewer-input-handoff.json')
 path.write_text(json.dumps({'inputHandoffOnly':True,'reviewerRound':suffix.upper(),
  'scope':{'currentAtomicDenominator':336,'assignedCurrentGoalCount':173,'batchSizes':[b['goalCount'] for b in roundPlans[suffix]]},
  'actualBaseModelDigest':model['digest'],'blindIndependentFirstPass':True,
  'useOnlyOwnBoundInputs':True,'batches':roundPlans[suffix],
  'excludedReviewerInputs':['private-preparation-evidence/','any other reviewer round outputs','historical judgments','impact matrices','canonical diffs','synthesis decisions'],
  'reviewerOutputsNotYetCreated':True,'humanOrWholeCourseApprovalClaimed':False},ensure_ascii=False,indent=2)+'\n')
proof={'technicalOnly':True,'actualGoalCount':173,'actualConfigCount':9,'actualCampaignCount':18,
 'baseNativeModelDigest':model['digest'],'wholeFreezeSha256':hashlib.sha256((Q/'freeze/whole-active-current336.normal-production-book-model.json').read_bytes()).hexdigest(),
 'batches':batchProof,'nativeArtifactsWholeHashes':allArtifactHashes,
 'currentSourcePathsAndDigestsExact':model['source'],'AAndBInputsExactlyEqual':True,
 'all18ResultsDirectoriesEmpty':True,'all9ResolutionsDirectoriesEmpty':True,
 'global_curriculum_symlink_errors':[],
 'scienceReviewsAuthored':0,'reviewRecordsAuthored':0,'synthesesAuthored':0,'activeLedgerWrites':0,
 'automaticScientificCarryoverOrHumanApprovalClaimed':False,
 'ownHarnessFailureNotes':['Initial .ts launcher rejected top-level await outside ESM package; .mts corrected.',
 'First native subset PDF validation lacked pdfinfo PATH; unchanged native rerun used actual Poppler tools and succeeded.']}
(Q/'actual173-native-A-B-inputs-currentP-currentImages-matchingPdfHtml-technical-proof.json').write_text(json.dumps(proof,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'PASS':True,'actual173':len(allIds),'nineConfigs':len(batchProof),'18Campaigns':18,
 'pdfPhysicalPages':[b['physicalPdfPageCount'] for b in batchProof],
 'currentPositiveProfileCasesIn173Inputs':sum(b['currentPositiveProfileCasesInScopedInputs'] for b in batchProof),
 'actualNativeArtifacts':len(allArtifactHashes),'AAndBReviewerHandoffsWritten':True}))

