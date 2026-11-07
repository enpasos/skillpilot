from pathlib import Path
import json,hashlib,sys,shutil
R=Path('/home/enpasos/projects/skillpilot');W=Path(__file__).parent;C=W/'candidate';B='qa-artifacts/ci-contract-audit/2026-11-07/math58-reader-capsule-proof-inputs-v1';D=W/'working'/B;D.mkdir(parents=True,exist_ok=True);H=lambda b:hashlib.sha256(b).hexdigest();J=lambda x:(json.dumps(x,ensure_ascii=False,indent=2)+'\n').encode();refs={}
def add(path,source=None,raw=None):
 if raw is None:raw=Path(source).read_bytes()
 dest=W/'working'/path;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(raw);ref={'path':path,'sha256':H(raw),'bytes':len(raw)}
 assert path not in refs or refs[path]==ref;refs[path]=ref;return ref
sources={
 'first':Path('/dev/shm/math58-first20-viewport-eqje6qeo/review-packet'),
 'second':R/'qa-artifacts/ci-contract-audit/2026-11-07/math58-second20-current-viewport-review',
 'last':Path('/mnt/e/skillpilot-qa-artifacts/2026-11-07/math58-last18-current-viewport-_f32tbra/objects')}
groups={}
for key,p in sources.items():
 files={}
 for name in ['current-review.json','current-input.json','browser-receipt.json']:
  files[name]=add(B+'/'+key+'/'+name,source=p/name)
 groups[key]={'review':files['current-review.json'],'input':files['current-input.json'],'browser':files['browser-receipt.json'],'reviewObject':json.loads((p/'current-review.json').read_text()),'inputObject':json.loads((p/'current-input.json').read_text()),'browserObject':json.loads((p/'browser-receipt.json').read_text())}
q=R/'qa-artifacts/ci-contract-audit/2026-11-07/boxplot-label-image-correction-independent-review';corr=json.loads((q/'review.json').read_text());assert corr['candidate']['sha256']=='e1bda233419154cd20aa46feae46d1fa2f480881a25bccc4c4d227623233ec07';corrRef=add(B+'/boxplot/current-review.json',source=q/'review.json');corrBrowserPath=Path(corr['browserReceipt']['path']);corrBrowserRef=add(B+'/boxplot/browser-receipt.json',source=corrBrowserPath);corrBrowser=json.loads(corrBrowserPath.read_text());corrInputRef=add(B+'/boxplot/current-input.json',source=q/'current-input.json');corrGeneration=add(corr['generationReceipt']['path'],source=R/corr['generationReceipt']['path']);corrGenerationObject=json.loads((R/corr['generationReceipt']['path']).read_text());assert corrGeneration['sha256']==corr['generationReceipt']['sha256'];add(corr['candidate']['path'],source=R/corr['candidate']['path']);clarify=add(B+'/first-time-label-clarification.json',source=q/'prior-first20-time-label-clarification.json')
sourcePath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json';currentRaw=(R/sourcePath).read_bytes();source=json.loads(currentRaw);assert H(currentRaw)=='e4de3c3e3a294a1751d7ebcd70fa4e63a457a63e51016996055c0e78f4510a06';by={g['id']:g for g in source['goals']};add(sourcePath,raw=currentRaw)
# The existing raw Git kernel performs source history access; no repository writes.
sys.path.insert(0,str(W/'frozen/scripts'));import visualization_review_git_capsule as kernel
commit='6fe35a6b0fa807e5a97475b34f3715dc16a89c00';ownerRaw=kernel.git(R,'show',commit+':'+sourcePath);ownerRef={'path':sourcePath,'gitCommit':commit,'sha256':H(ownerRaw)}
selectionPath=R/'qa-artifacts/ci-contract-audit/2026-11-07/visualization-next-batch-analysis/first-batch-math58.json';selection=json.loads(selectionPath.read_text());add(str(selectionPath.relative_to(R)),source=selectionPath);assert len(selection['goals'])==58;bindings=[]
def from_any(ref):
 p=Path(ref.get('durablePath',ref['path']))
 if not p.is_file():p=Path(ref['path'])
 assert p.is_file(),str(p);raw=p.read_bytes();assert H(raw)==ref['sha256'];return raw
for selected in selection['goals']:
 gid=selected['goalId'];g=by[gid];groupKey=next(key for key,group in groups.items()if any(row['goalId']==gid for row in group['reviewObject']['rows']));group=groups[groupKey];normal=next(row for row in group['reviewObject']['rows']if row['goalId']==gid);inputRow=next(row for row in group['inputObject']['rows']if row['goalId']==gid);replacement=gid==corr['goalId'];reviewRow=corr if replacement else normal;reviewRef=corrRef if replacement else group['review'];browser=corrBrowser if replacement else group['browserObject'];browserRef=corrBrowserRef if replacement else group['browser'];inputRef=corrInputRef if replacement else group['input'];assert (reviewRow['decision']=='PASS'if replacement else reviewRow['decision']in('KEEP','accept_current_asset_current_display'));assetSha=corr['candidate']['sha256']if replacement else selected['reviewedAsset']['sha256'];currentAssetPaths=[a['path']for a in inputRow['currentAssets']]
 for path in currentAssetPaths:
  if replacement:add(path,source=R/corr['candidate']['path'])
  else:assert H((R/path).read_bytes())==assetSha;refs[path]={'path':path,'sha256':assetSha,'bytes':(R/path).stat().st_size}
 views=[]
 for v in reviewRow['currentViewportEvidence']:
  width=v['widthCSS'];raw=from_any(v['screenshot']);ref=add(B+'/views/'+gid+'.'+str(width)+'.png',raw=raw);bv=next(row for row in browser['views']if row['goalId']==gid and row['requestedImageWidthCSS']==width)
  html=Path(bv['html']['path']);assert H(html.read_bytes())==bv['html']['sha256'];htmlRef=add(B+'/html/'+gid+'.'+str(width)+'.html',source=html)
  views.append({'widthCSS':width,'screenshot':ref,'reportedScreenshotPath':v['screenshot']['path'],'html':htmlRef,'reportedHtmlPath':str(html)})
 pair=None
 if not replacement and normal.get('contactSheet'):
  pair=add(B+'/pairs/'+gid+'.png',raw=from_any(normal['contactSheet']))
 expectedReviewer=reviewRow['reviewer'];expectedTime=reviewRow['reviewedAtActualUTC'];oldReview=json.loads((R/selected['originalReview']['path']).read_text());oldRow=next(r for r in oldReview['records']if r['goalId']==gid)
 if selected['family'].startswith('math-current62'):
  inputOriginal=next(r for r in selected['originalContextChain']if r['path'].endswith('.input.json'));oldDecision=oldRow['decision'];oldReason=oldRow['rationale']
 else:inputOriginal=selected['originalReview'];oldDecision=oldRow['decision'];oldReason=oldRow['independentChecks']
 bindings.append({'goalId':gid,'family':selected['family'],'profile':'math-current62-with-current-viewports-v1'if selected['family'].startswith('math-current62')else'math-independent-ten-with-current-viewports-v1','originalReview':selected['originalReview'],'originalInput':inputOriginal,'ownerSource':ownerRef,'reviewedAsset':selected['reviewedAsset'],'originalReviewer':selected['originalReviewer'],'originalReviewedAt':selected['originalReviewedAt'],'originalDecision':oldDecision,'originalReason':oldReason,'currentReview':reviewRef,'currentInput':inputRef,'browser':browserRef,'currentDecision':reviewRow['decision'],'currentReviewer':expectedReviewer,'currentReviewedAt':expectedTime,'wholeCurrentGoalCanonicalSha256':H(json.dumps(g,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()),'assetSha256':assetSha,'publicAssetPath':currentAssetPaths[0],'canonicalAssetPath':currentAssetPaths[1],'views':views,'contactSheet':pair,'boxplotV2':replacement,'normalReviewForAudit':group['review']if replacement else None,'firstTimeClarification':clarify if groupKey=='first'else None,'generationReceipt':corrGeneration if replacement else None})
# Relative generation/preparation records are actual consumed correction dependencies.
for key in ['metadata','preparedPrompt']:
 row=corrGenerationObject['preparation'][key];assert H((R/row['path']).read_bytes())==row['sha256'];add(row['path'],source=R/row['path'])
selectedAttempt=next(a for a in corrGenerationObject['attempts']if a['savedCandidate']['sha256']==corr['candidate']['sha256']);add(selectedAttempt['prompt']['path'],source=R/selectedAttempt['prompt']['path'])
activePath='contracts/goal-visualization-context/v1/qualified-context-index-economics17-2026-11-07.json';activeRaw=(R/activePath).read_bytes();assert H(activeRaw)=='234b9cee0f87d937edfa8410c36483ebdc55b5032d84947c5188c3f3b74f8785';active=json.loads(activeRaw);assert not({b['goalId']for b in bindings}&{r['goalId']for r in active['rows']})
rendererRefs=[add('app/src/components/GoalCard.tsx',source=C/'app/src/components/GoalCard.tsx'),add('curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-neuro-three-supplied-models-independent-v-b-20261007-v1/browser/render-independent-image-widths.actual.mjs',source=R/'curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-neuro-three-supplied-models-independent-v-b-20261007-v1/browser/render-independent-image-widths.actual.mjs')]
pins={'rendererReferences':rendererRefs,'kind':'private-math58-closed-original-and-current-evidence-bindings-v1','active74Index':{'path':activePath,'sha256':H(activeRaw)},'source':{'path':sourcePath,'sha256':H(currentRaw),'landscapeId':source['landscapeId'],'subject':'mathematik'},'selection':{'path':str(selectionPath.relative_to(R)),'sha256':H(selectionPath.read_bytes()),'goalIds':[r['goalId']for r in selection['goals']]},'goalBindings':bindings,'scope':'Actual isolated public GoalCard image CSS360/680 in Chromium; no phone host/full app/DPA/M7 release','concreteCurrentAssetImportStillRequiredForBoxplot':True,'newReviewClaimedByTransport':False}
pinPath='contracts/goal-visualization-context/v1/math58-current-supplement-pins-2026-11-07.candidate.json';pinRaw=J(pins);out=C/pinPath;out.parent.mkdir(parents=True,exist_ok=True);out.write_bytes(pinRaw);add(pinPath,raw=pinRaw)
(W/'dataset-working-references.json').write_bytes(J({'proofsRepositoryPath':B,'pinPath':pinPath,'pinSha256':H(pinRaw),'files':list(refs.values()),'current132GoalIds':sorted([r['goalId']for r in active['rows']]+[b['goalId']for b in bindings])}));(W/'prepared-dataset-summary.json').write_bytes(J({'goals':len(bindings),'evidenceWorkingPaths':len(refs),'evidenceUniqueBytes':sum({r['sha256']:r['bytes']for r in refs.values()}.values()),'pinSha256':H(pinRaw),'old74RowsUnchanged':True,'last18NowBoundToActualFinalReview':True}));print((W/'prepared-dataset-summary.json').read_text())
