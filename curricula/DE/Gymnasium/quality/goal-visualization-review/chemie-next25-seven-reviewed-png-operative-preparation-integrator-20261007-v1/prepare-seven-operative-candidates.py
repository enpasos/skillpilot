#!/usr/bin/env python3
import copy, datetime, hashlib, json, pathlib, shutil
ROOT=pathlib.Path('/home/enpasos/projects/skillpilot'); OUT=pathlib.Path(__file__).resolve().parent
REV=ROOT/'curricula/DE/Gymnasium/quality/goal-visualization-review'
AUTHOR=REV/'chemie-next25-four-targeted-raster-corrections-author-20261006-v2'
AF=REV/'chemie-next25-four-corrections-independent-v-a-20261006-v2'
BF=REV/'chemie-next25-four-corrections-independent-v-b-20261006-v2'
OLD_A=REV/'chemie-next25-seven-corrections-independent-v-a-20261006-v1'
OLD_B=REV/'chemie-next25-seven-corrections-independent-v-b-20261006-v1'
CANON=ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
QA=ROOT/'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'
SCOPE=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-next-coherent-current-gap-native-author-v1/current25-provisional-scope-and-valid-existing-bindings.author.json'
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def objhash(x):return 'sha256:'+hashlib.sha256(json.dumps(x,ensure_ascii=False,separators=(',',':'),sort_keys=True).encode()).hexdigest()
def bind(p):p=p.resolve();return dict(path=str(p.relative_to(ROOT)),sha256=sha(p),bytes=p.stat().st_size)
def write(name,x):p=OUT/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return bind(p)
def copybound(p,target):target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,target);assert sha(p)==sha(target);return bind(target)
freezes=[]; external={}
def retain(p):b=bind(p);external[b['path']]=b;return b
def verifyfreeze(folder,filename,expected):
 p=folder/filename;assert sha(p).removeprefix('sha256:')==expected
 data=json.loads(p.read_text())
 for r in data['files']:
  child=(ROOT/r['path']) if r['path'].startswith('curricula/') else (folder/r['path']);assert sha(child).removeprefix('sha256:')==r['sha256'].removeprefix('sha256:') and child.stat().st_size==r['bytes'],str(child)
  retain(child)
 freezes.append({'freeze':retain(p),'actualOwnPayloadFilesChecked':len(data['files'])});return data
verifyfreeze(AUTHOR,'four-targeted-raster-corrections.author-v2.final.freeze.json','d98626c72ae462ba680483e5e3a1431353e950ddb8eb28a2ebf99df1b027c709')
verifyfreeze(AF,'targeted-v-a-v2.final.freeze.json','a5e9b267e901c0a08f0ed1d993421b7d2d2aca3a22bd90031ea709e10ab27db7')
verifyfreeze(BF,'independent-four-targeted-raster-corrections-v-b-v2.final.freeze.json','d484fc1b7b534d6b3d7a6c2cb86557047e64f5385d310d876928e1bbeabf911c')
rawpath=AUTHOR/'seven-exact-assets-four-targeted-current-corrections.raw-v2-review-input.json';raw=json.loads(rawpath.read_text());retain(rawpath)
a=json.loads((AF/'targeted-v-a-v2.decisions.actual.json').read_text());b=json.loads((BF/'independent-v-b-four-current-raster-verdicts.actual.json').read_text())
old_a_path=OLD_A/'independent-v-a.decisions.actual.json';old_b_path=OLD_B/'independent-v-b-seven-asset-verdicts.json'
old_a=json.loads(old_a_path.read_text());old_b=json.loads(old_b_path.read_text());retain(old_a_path);retain(old_b_path)
for folder,fname in [(OLD_A,'independent-v-a.final.freeze.json'),(OLD_B,'independent-v-b-seven-corrections.final.freeze.json')]:
 p=folder/fname;d=json.loads(p.read_text());verifyfreeze(folder,fname,sha(p).removeprefix('sha256:'))
canon=json.loads(CANON.read_text());goals={g['id']:g for g in canon['goals']};qa=json.loads(QA.read_text());qa_by={r['goalId']:r for r in qa['records']}
assert len(goals)==479;retain(CANON);retain(QA);retain(SCOPE)
basebinding=bind(CANON)
scope=json.loads(SCOPE.read_text()); ids=[r['goalId'] for r in raw['rows']];selected25=scope['selected25GoalIds'];good18=[x for x in selected25 if x not in ids];assert len(ids)==7 and len(good18)==18
# Old active-canonical bytes in immutable reviews are preserved, not silently rebound after the independent BW metadata delta.
oldcanon=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-current-coordinate-provider-license-targeted-author-v7/prospective-current378.canonical.metadata-only.author-candidate.json'
assert sha(oldcanon)==raw['currentCanonical']['sha256'];retain(oldcanon)
oldgoals={g['id']:g for g in json.loads(oldcanon.read_text())['goals']}
reviewbindings=[];goodbindings=[];install=[];retire=[];prompt_jobs=[];templates=[];archived=[]
for ident in good18:
 g=goals[ident];links=[x for x in g.get('resourceLinks',[]) if x['type']=='goal-visualization' and x['role']=='primary'];assert len(links)==1
 url=links[0]['url'];assert url.endswith('.jpg');filename=url.split('/')[-1]
 paths=[ROOT/f'curricula/DE/Gymnasium/visualizations/chemie/{ident}/{filename}',ROOT/f'app/public{url}',ROOT/f'backend/src/main/resources/static{url}']
 copies=[retain(p) for p in paths];assert len({x['sha256'] for x in copies})==1
 assert qa_by[ident]['assetSha256']==copies[0]['sha256']
 goodbindings.append({'goalId':ident,'unchangedWholeCurrentGoal':g,'wholeGoalObjectSha256':objhash(g),'unchangedQARecord':qa_by[ident],'copies':copies,'operation':'KEEP_BYTES_EXACT_NO_CONTENT_REREVIEW'})
for r in raw['rows']:
 ident=r['goalId'];g=goals[ident];assert g==r['wholeCurrentGoal']==oldgoals[ident]
 assert bind(ROOT/r['selectedPNG']['path'])==r['selectedPNG'];assert bind(ROOT/r['actualPrompt']['path'])==r['actualPrompt'];retain(ROOT/r['selectedPNG']['path']);retain(ROOT/r['actualPrompt']['path'])
 fresh=ident.startswith(('965','747','492','5e2'))
 ar=next(x for x in (a['rows'] if fresh else old_a['rows']) if x['goalId']==ident)
 br=next(x for x in (b['records'] if fresh else old_b['records']) if x['goalId']==ident)
 assert ar['decision']=='KEEP' and br['independentV_BDecision']=='KEEP'
 assert ar['assetHash']==r['selectedPNG']['sha256']
 bsha=br['selectedPNG']['sha256'] if fresh else 'sha256:'+br['assetSha256'].removeprefix('sha256:')
 assert bsha==r['selectedPNG']['sha256']
 if fresh:assert ar['wholeCurrentGoal']==br['wholeCurrentGoal']==g
 else:
  assert ar['wholeCurrentGoalReadAndExact'] is True
  assert ar['wholeGoalDE']==g['description'] and ar['wholeGoalEN']==g['descriptionEn']
  assert br['description']==g['description'] and br['descriptionEn']==g['descriptionEn']
  for key in ['firstIndependentReviewA','firstIndependentReviewB']:assert bind(ROOT/r[key]['path'])==r[key]
 alt=br['proposedBoundedAltTextDE']
 reviews={'A':bind((AF/'targeted-v-a-v2.decisions.actual.json') if fresh else old_a_path),'B':bind((BF/'independent-v-b-four-current-raster-verdicts.actual.json') if fresh else old_b_path),'lane':'four actual current independent v2 KEEP' if fresh else 'unchanged exact prior independent A/B KEEP carry','A_record':ar,'B_record':br}
 btime=b['createdAtUTC'] if fresh else old_b['reviewedAtUTC']
 note=f"Exact selected PNG independently KEEP by V-A and V-B, bound to {r['selectedPNG']['sha256']}. A: {reviews['A']['path']}; B: {reviews['B']['path']}. {'Actual image widths360/680; additional316 typography limits retained in both dossiers.' if fresh else 'Exact prior selected PNG and prior native/360/680 KEEP reused, without a new content review.'} The bounded alt describes only this illustration; whole-goal DE/EN performance and P/source gates remain separate. Technical integrator prepares fields without a new scientific verdict; image model not separately exposed. Human fields are reset for the new PNG, old asset-bound fields preserved in this package archive."
 reviewer='Codex independent V-A and V-B machine review; technical integrator only prepares approved-field candidate'
 qr=copy.deepcopy(qa_by[ident]);oldrecord=copy.deepcopy(qr)
 url=f'/assets/goal-visualizations/chemie/{ident}/{ident}.png';source=f'curricula/DE/Gymnasium/visualizations/chemie/{ident}/{ident}.png';pub=f'app/public{url}';back=f'backend/src/main/resources/static{url}'
 qr.update(imageUrl=url,publicAssetPath=pub,canonicalAssetPath=source,assetSha256=r['selectedPNG']['sha256'],visualizationState='available',missingReason='',umlautsCorrectChatGpt='yes',contentApprovedChatGpt='yes',chatGptReviewedAt=btime,chatGptReviewer=reviewer,chatGptNotes=note,aiApproved='yes',aiApprovedAssetSha256=r['selectedPNG']['sha256'],aiReviewedAt=btime,aiReviewer=reviewer,aiNotes=note,humanApproved='no',humanIssueIdentified='no',humanIssueDescription='',humanReviewedAt=None,humanReviewer='')
 assert set(qr)==set(oldrecord)
 qrfile=write(f'qa-replacement-records/{ident}.json',qr)
 archivefile=write(f'historical-originals/old-qa-records/{ident}.asset-bound.json',{'goalId':ident,'oldAssetSha256':oldrecord['assetSha256'],'currentOldQARecordExact':oldrecord,'humanFlagsMustNeverTransferToNewPNG':True})
 legacy=[]
 for old in r['originalSourceFrontendBackendExactBefore']:
  assert bind(ROOT/old['path'])==old;retain(ROOT/old['path'])
  saved=copybound(ROOT/old['path'],OUT/'historical-originals'/old['path']);legacy.append(saved);retire.append({'goalId':ident,'oldActivePath':old['path'],'oldBinding':old,'requiredHistoryCopyAlreadyPrepared':saved,'operation':'ROOT_ONLY_RETIRE_FROM_ACTIVE_LAYOUT_AFTER_ARCHIVE_VERIFICATION_AND_SUCCESSFUL_IMPORT'})
 assert oldrecord['assetSha256']==r['originalSourceFrontendBackendExactBefore'][0]['sha256']
 archived.append({'goalId':ident,'originalSHA256':oldrecord['assetSha256'],'oldQAArchive':archivefile,'oldHumanFields':{k:oldrecord[k] for k in ['humanApproved','humanIssueIdentified','humanIssueDescription','humanReviewedAt','humanReviewer']},'oldAssetCopies':legacy})
 promptpath=f'curricula/DE/Gymnasium/visualizations/chemie/{ident}/prompt.de.md'
 for name in ['prompt.de.md','image-reconstruction-prompt.de.md']:
  oldp=ROOT/f'curricula/DE/Gymnasium/visualizations/chemie/{ident}/{name}'
  if oldp.exists():retain(oldp);copybound(oldp,OUT/'historical-originals'/str(oldp.relative_to(ROOT)))
 for target in [source,pub,back]:
  prepared=copybound(ROOT/r['selectedPNG']['path'],OUT/'prospective-install-tree'/target)
  install.append({'goalId':ident,'sourceReviewedSelectedPNG':r['selectedPNG'],'preparedExactCopy':prepared,'finalActiveDestination':target,'expectedNewAssetSha256':r['selectedPNG']['sha256'],'rootMustInstallAfterFinalSignal':True})
 prompt_jobs.append({'goalId':ident,'wholeCurrentGoal':g,'selectedPNG':r['selectedPNG'],'actualPrompt':r['actualPrompt'],'rawPrompt':(ROOT/r['actualPrompt']['path']).read_text(),'altText':alt,'publicUrl':url,'promptTarget':promptpath,'provider':'OpenAI / ChatGPT-Codex image generation','actualTool':r['actualTool'],'imageModel':'not separately exposed; unknown; do not invent an id','license':'CC-BY-4.0','reviewStatus':'pilot'})
 templates.append({'goalId':ident,'wholeCurrentGoalBefore':g,'beforeWholeGoalObjectSha256':objhash(g),'allowedWholeGoalTopLevelChangeOnly':['resourceLinks'],'requiredNewQARecord':qrfile,'reviewBindings':reviews,'chosenBoundedAltDE':alt})
 reviewbindings.append({'goalId':ident,'actualSelectedPNG':r['selectedPNG'],'reviews':reviews,'qaReplacementRecord':qrfile,'actualImageNativeDimensions':r['nativeSize'],'actualGeneratorPrompt':r['actualPrompt'],'freshIndependentVReviews':fresh,'noNewScienceInThisPackage':True})
write('seven-whole-current-goal-resource-only.authoring-inputs.json',{'canonicalAtPreparation':basebinding,'wholeCurrentGoalCount':479,'oldCanonicalActuallyRetained':bind(oldcanon),'wholeSevenExactAcrossBWMetadataDelta':True,'rows':templates})
write('seven-native-helper-prompt-and-resource-jobs.json',{'jobs':prompt_jobs,'provider':'OpenAI / ChatGPT-Codex image generation','license':'CC-BY-4.0','modelKnown':False})
write('seven-png-21-copy-and-seven-prompt-operative-routing.raw.json',{'schemaVersion':1,'status':'inert technical operational candidates only','role':'technical integrator; no additional independent science review','canonicalAtPreparation':basebinding,'imageInstallCount':21,'imageInstallRouting':install,'promptJobsPath':bind(OUT/'seven-native-helper-prompt-and-resource-jobs.json'),'oldJPGsToArchiveThenRetire':retire,'oldHumanFieldArchives':archived,'unchanged18OriginalJPGs':goodbindings,'current7QAReplacementRecords':[t['requiredNewQARecord'] for t in templates],'rebasePolicy':'Never replace a full canonical or QA ledger from this dossier. Require actual whole-goal equality and exact old seven QA records; then apply only seven primary resourceLinks and seven QA replacements to the latest current files. Preserve all other goals and all other QA records.','activeWrites':False,'newScience':False,'newStrictClosures':0,'strictNetGain':0,'humanApproval':False,'humanTrial':False})
write('verified-seven-independent-reviewed-payload-and-asset-bindings.actual.json',{'role':'technical integration verification only','freezes':freezes,'rows':reviewbindings,'freshVScienceReReview':False})
write('preparation-current-inputs.actual.json',{'preparedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'canonical':basebinding,'qa':bind(QA),'sevenOldWholeGoalObjectHashes':{x:objhash(goals[x]) for x in ids},'sevenOldQARecords':{x:qa_by[x] for x in ids},'externalInputs':list(external.values()),'rootBWMetadataApplyAlreadyObserved':True,'activeWrites':False})
print(json.dumps({'wholeGoals':479,'postBWCanonical':basebinding,'sevenWholeGoalsExact':True,'freshIndependentPairs':4,'exactHistoricalPairs':3,'imageCopies':21,'unchangedOriginalJPGs':18,'oldAssetBoundHumanArchives':7,'newHumanClaims':0,'activeWrites':False}))
