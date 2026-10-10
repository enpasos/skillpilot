# SPDX-License-Identifier: Apache-2.0
import pathlib,json,hashlib,shutil,collections,datetime
R=pathlib.Path('/home/enpasos/projects/skillpilot');B=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10');P=B/'biologie-bio8-atomicity-source-visual-findings-targeted-author-successor-v3';N=B/'biologie-biotechnologie-evolution-eight-current353-source-raster-native-technical-preparation-20261010-v1';A=B/'biologie-biotechnologie-evolution-eight-whole-material-and-raster-author-candidate-v1';V2=B/'biologie-biotechnologie-evolution-eight-medicine-transfer-targeted-author-successor-v2';C=R/'tmp/m7-bio8-findings-v3-author-isolated-capsule'
def read(p):return json.loads((R/p).read_text())
def ref(p):
 b=(R/p).read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(p,o):
 f=R/P/p;assert not f.exists();f.parent.mkdir(parents=True,exist_ok=True);f.write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n');return ref(f.relative_to(R))
old=read(N/'candidate/whole479-only-eight-author-deltas.inactive.json');land=read(P/'candidate/whole483-final-fossil-image-substantive-successor.inactive.json');om={g['id']:g for g in old['goals']};gm={g['id']:g for g in land['goals']};changed=[i for i in om if om[i]!=gm[i]];new=[i for i in gm if i not in om];assert len(gm)==483 and len(new)==4 and len(changed)==13
lid=land['landscapeId'];norm=lambda i:i.replace(lid+':','');dfsnotes={};selfreq=[]
for kind in ['requires','contains']:
 visited=set();stack=[]
 def dfs(i):
  assert i not in stack,(kind,stack+[i]);
  if i in visited:return
  stack.append(i)
  for j in gm[i].get(kind,[]):
   j=norm(j)
   if j in gm:dfs(j)
  stack.pop();visited.add(i)
 for i in gm:dfs(i)
 dfsnotes[kind]={'acyclic':True,'visited':len(visited)}
def descendants(i):
 out=set()
 for j in gm[i].get('contains',[]):
  j=norm(j)
  if j not in out:out.add(j);out.update(descendants(j))
 return out
for i in gm:
 if gm[i].get('contains'):
  overlap=set(map(norm,gm[i].get('requires',[])))&descendants(i)
  if overlap:selfreq.append({'clusterId':i,'requiresOwnDescendants':sorted(overlap)})
assert not selfreq,selfreq
qo=read(N/'inputs/current353-QA394.exact.json');qn=read(P/'candidate/QA396.final-fossil-image-pending.json');oldQA={r['goalId']:r for r in qo['records']};newQA={r['goalId']:r for r in qn['records']};protected=[i for i,r in oldQA.items()if r.get('aiApproved')=='yes'];assert len(protected)==353;assert all(oldQA[i]==newQA[i]for i in protected)
np=read(B/'biologie-neuro-ten-current343-dual-D-P-V-inactive-integration-technical-root-20261010-v1/native-ten-dual-resolution/resolution-index.json');neuro=np['batchGoalIds'];assert len(neuro)==10;assert all(gm[i]==om[i]for i in neuro)
med='27b22c33-908c-5fa8-9d9f-a08aff8da143';assert (R/P/'materials'/f'{med}.whole-two-cases.json').read_bytes()==(R/V2/'materials'/f'{med}.whole-two-cases.json').read_bytes();assert (R/P/'profiles'/f'{med}.whole-profile.json').read_bytes()==(R/V2/'profiles'/f'{med}.whole-profile.json').read_bytes();assert gm[med]==om[med]
psc=read(P/'positive/ten-whole-author-candidates.normal-minimum-successor.json');prs=[json.loads(l)for l in(R/P/'positive/ten-final-fossil-image-author.pending.review.jsonl').read_text().splitlines()];assert len(prs)==10;assert all(r['status']=='needs_human_review'and r['reviewAuthority']=='ai_candidate'and r['evidenceLevel']=='E1'and r['maximumClaimScope']=='G1'and not r['reviewRunIds']for r in prs);assert all(next(c for c in psc['goals']if c['goalId']==r['goalId'])['profile']==r['profile']for r in prs)
profiles=[]
for r in prs:
 i=r['goalId'];pf=put('final/profiles/'+i+'.whole-current-profile.json',r['profile']);profiles.append({'goalId':i,'wholeProfile':pf,'wholeTwoCases':ref(P/'materials'/f'{i}.whole-two-cases.json'),'profileFingerprint':r['profileFingerprint'],'reviewInputFingerprint':r['reviewInputFingerprint'],'independentP':'PENDING_or_retained_medicine_V2_pair_not_reapproved'})
assert sum(len(read(pathlib.Path(p['wholeTwoCases']['path'])))for p in profiles)==20
put('checks/final-whole-goal-DAG-protected353-and-P10-preservation.author.json',{'wholeGoals':483,'curricularAtoms':396,'priorWholeGoals':479,'priorAtoms':394,'changedOldWholeGoalIds':changed,'wholeOldGoalObjectsExact':479-len(changed),'newWholeGoalIds':new,'oldDescriptionsOnlyH430ChangedOutsideNeutral8':True,'rawDAG':dfsnotes,'clusterRequiresOwnDescendants':selfreq,'protected353QAWholeRowsExact':True,'protected353VRetained':True,'protected353SourceScopeRemoved':[],'neuro10WholeGoalObjectsExact':True,'neuro10GoalIds':neuro,'medicineV2WholeCasesProfileAndGoalExact':True,'wholeP10Cases':20,'P10Approved':0,'nativeTargetedDIndependentPending':True,'A_M_approvalsFromKindLedger':False,'activeWrites':[]})
# Final current whole page closure, retaining every actual page-body delta.
before=read(N/'native/whole394-after.normal-model.actual.json');after=read(P/'native/whole396-final-fossil-image.normal-model.actual.json');bm={p['goalId']:p for p in before['pages']};meta={'pageNumber','navigationOrder','treeOrder','pageFingerprint'}
def omit(x):
 if isinstance(x,dict):return{k:omit(v)for k,v in x.items()if k not in meta}
 if isinstance(x,list):return[omit(v)for v in x]
 return x
changes=[];content=[]
for p in after['pages']:
 i=p['goalId']
 if i in bm and bm[i]!=p:
  real=omit(bm[i])!=omit(p)
  if real:content.append(i)
  changes.append({'goalId':i,'positionOrPageReferenceOnly':not real,'before':bm[i],'after':p})
assert len(changes)==299 and len(content)==15
put('checks/final-whole396-all299-current-page-and-context-deltas.author.json',{'beforeDigest':before['digest'],'currentDigest':after['digest'],'wholeOldChangedPages':299,'substantiveOldPageIds':content,'positionOrPageReferenceOnlyOldPages':284,'newPages':new,'allActualWholeChangedPageBodies':changes,'substantiveD19':'nineteen-final-current-native','genuineIndependentCurrentDStillRequired':True,'protected353NoRetrospectiveApproval':True})
# Standalone portable HTML copy: only public image locators are redirected to
# exact regular byte copies. Normal renderer HTML stays untouched.
bundle=P/'native/nineteen-final-current-native/bundle';model=read(bundle/'book-model.json');html=(R/bundle/'book.html').read_text();assetrows=[]
for p in model['pages']:
 v=p['visualization']
 if v:
  url=v['imageUrl'];src=C/('app/public'+url);dst=bundle/'asset-copies'/f'{p["goalId"]}.png';(R/dst).parent.mkdir(exist_ok=True);assert not(R/dst).exists();shutil.copyfile(src,R/dst);html=html.replace(url,'asset-copies/'+dst.name);assetrows.append({'goalId':p['goalId'],'originalPublicURL':url,'actualPortableExactPNG':ref(dst)})
assert len(assetrows)==18
(R/bundle/'book.portable.actual.html').write_text(html)
put('native/final19-portable-HTML-and-regular-exact-assets.author.json',{'normalHTMLRetainedExact':ref(bundle/'book.html'),'portableHTML':ref(bundle/'book.portable.actual.html'),'exactImageCopies':assetrows,'onlyPublicImageLocatorsReplaced':True,'standalonePDF':ref(bundle/'book.pdf'),'humanOrIndependentApproval':False})
# Make final-source output alias requirements explicit, without requiring caches.
at=read(P/'sources/final-fossil-image-book-local-atlas.normal.config.json');files=[]
for f in sorted((R/P/'sources/final-normal-output').iterdir()):files.append(ref(f.relative_to(R)))
put('sources/final24-normal-output-portable-bindings.author.json',{'normalGeneratedFilesExact':files,'normalBookLocalOutputDirectoryDiagnosticOnly':at['outputDirectory'],'actualNormalSourceBuildCheckPassed':True,'allActualPrimaryCopies':ref(P/'sources/all-actual-portable-primary-bindings.json'),'cachedSnapshotAliasesAreMetadataOnly':True,'sourceCourseApproval':False})
put('images/actual-final-original-360-680-author-view-observations.json',{'actuallyViewedFinalOriginalPNGs':6,'actuallyViewedNew360BrowserCaptures':6,'actuallyViewedNew680BrowserCaptures':6,'actuallyViewedRetainedOriginal360':6,'actuallyViewedRetainedOriginal680':6,'retainedOriginalCount':6,'targetedExistingReplacements':['4a8a6cec-a2cc-56fe-b3ab-7ca017f640cf','430b2b73-641a-5122-bb6d-162b0d1eaf2d'],'observationsDe':{'4a':'Außen gelb/navy getrennte Wand und innen separate navy Membran; tatsächliche Pfeilspitzen unterscheidbar. Die übrigen Vermehrungs-/Stoffwechselpanels bleiben erhalten.','430':'Kulturblock entfernt; datierbare Fossilmerkmale, begrenzte verzweigte Rekonstruktion und revidierbare Hypothesen zeigen dieselbe Fossilinferenzkompetenz.','restriction':'Sequenzspezifische Stelle gegenüber unpassender Stelle; Fragmententstehung als einzelnes kausales Produkt.','expression':'Vorhandene DNA kann ohne passenden Promotor nicht exprimiert werden; ein Kompatibilitätsprodukt mit mRNA/Protein-Weg.','culture':'Gelerntes weitergegebenes Wissen, Landwirtschaft und aktuelle Nahrung-/Habitatfolgen; kein biologisches Vererbungsbild.','behavior':'Auslöser, konkrete Reaktion und mögliche Schutzfunktion mit gemeinsamer Abstammung und deutlicher Hypothesengrenze.'},'actualWholeNativePDFPagesViewed':['8eb86a82-122d-5cae-8f80-bb2850b29c2f','430b2b73-641a-5122-bb6d-162b0d1eaf2d','7d2da9ab-aed0-562b-a99a-840825fca009'],'authorVisualApproval':False,'independentV':'PENDING'})
put('final/ten-whole-current-P-profile-material-bindings.json',{'records':profiles,'wholeProfileCount':10,'wholeMaterialCases':20,'PApproved':0,'authoringRoleOnly':True})
print(json.dumps({'whole483':483,'atomic396':396,'oldWholeObjectsExact':466,'protected353WholeQARowsExact':True,'fullD299With19SubstantiveInputs':True,'P10cases20':True,'portableNativeImages18':True,'independentApproval':False}))
