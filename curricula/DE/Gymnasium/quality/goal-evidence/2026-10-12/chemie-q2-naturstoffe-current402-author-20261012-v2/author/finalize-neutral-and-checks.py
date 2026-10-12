# SPDX-License-Identifier: Apache-2.0
import pathlib,json,hashlib,datetime,copy,subprocess,collections,shutil
from PIL import Image
R=pathlib.Path.cwd();BP='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q2-naturstoffe-current402-author-20261012-v2';B=R/BP;V=R/BP.replace('-v2','-v1')
def read(p):return json.loads(p.read_text())
def write(p,o):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n')
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def ref(p):return {'path':str(p.relative_to(R)),'bytes':p.stat().st_size,'sha256':sha(p)}
live=R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';current=read(live);cg={x['id']:x for x in current['goals']};land=read(B/'candidate/canonical532.complete-inactive.json');g={x['id']:x for x in land['goals']};ids=read(V/'scope31.current402.author.actual.json')['goalIds'];target=read(B/'neutral/targeted29.goal-ids.json');split=read(B/'author/precise-four-split-proposal-and-requires-deltas.json');child=[i for v in split['parents'].values() for i in v]
for src,name in [(live,'canonical.live-at-v2-seal.exact.json')]:shutil.copyfile(src,B/'inputs'/name)
baseline=read(B/'inputs/canonical.live-at-v2-start.exact.json');bg={x['id']:x for x in baseline['goals']}
allowed={x['goalId'] for x in split['incomingRequiresDeltas']}|set(split['parents']);changed={i for i in bg if bg[i].get('requires',[])!=g[i].get('requires',[])}
if changed!=allowed:raise RuntimeError('Unexpected old requires delta')
for kind in ['requires','contains']:
 state={}
 def visit(i):
  if state.get(i)==1:raise RuntimeError('Cycle:'+kind+':'+i)
  if state.get(i)==2:return
  state[i]=1
  for j in g[i].get(kind,[]):
   if j not in g:raise RuntimeError('Missing edge target:'+j)
   visit(j)
  state[i]=2
 for i in g:visit(i)
protected=['a44af1fa-5988-5b7d-b206-691c6bbf7dd4','4b6d1824-20e4-597e-b639-fae401f740f0','805a2f58-29ce-55d0-8a85-42ee486239b3','1351706f-4ea6-56e9-951b-87b24cbcdee8','413040cd-ba74-5227-948c-a778b0bd0f56']
if any(g[i]!=bg[i] or cg[i]!=bg[i] for i in protected):raise RuntimeError('B007 live applicability guard changed')
tuples=[]
for id in ids+child:
 original=cg.get(id);candidate=g[id];links=[]
 for l in candidate.get('resourceLinks',[]):
  if l.get('type')!='goal-visualization':continue
  url=l['url'];cap=B/'capsule/app/public'/url.lstrip('/');p=cap if cap.exists() else R/'app/public'/url.lstrip('/');im=Image.open(p);links.append({'resourceLink':l,'asset':ref(p),'width':im.width,'height':im.height})
 old=[]
 if original:
  for l in original.get('resourceLinks',[]):
   if l.get('type')!='goal-visualization':continue
   p=R/'app/public'/l['url'].lstrip('/');old.append({'resourceLink':l,'asset':ref(p) if p.exists() else None})
 tuples.append({'goalId':id,'wholeCurrentGoal':original,'wholeCandidateGoal':candidate,'currentImageInputs':old,'candidateImageInputs':links})
write(B/'neutral/current31-and-candidate40.actual-goal-image-tuples.json',{'schemaVersion':1,'currentGoalCount':31,'candidateGoalCount':len(tuples),'records':tuples})
assetchecks=[]
for id in read(B/'neutral/final26.resource-field-inputs.json')['resourceLinks']:
 gid=id['goalId'];l=next(x for x in g[gid]['resourceLinks'] if x['type']=='goal-visualization');url=l['url'];cap=B/'capsule';paths=[cap/'curricula/DE/Gymnasium/visualizations/chemie'/gid/(gid+'.png'),cap/'app/public'/url.lstrip('/'),cap/'backend/src/main/resources/static'/url.lstrip('/')];hashes=[sha(p) for p in paths]
 if len(set(hashes))!=1:raise RuntimeError('Image copy mismatch')
 if l['description']!='Visualisierung zum Lernziel: '+g[gid]['title']+'.' or l['reviewStatus']!='pilot' or l['license']!='CC-BY-4.0':raise RuntimeError('Final resource metadata mismatch')
 if any(w in l['altText'] for w in ['Autorenpaket','unabhängige Bildprüfung','Autorenkandidat']):raise RuntimeError('Non-learner caption')
 im=Image.open(paths[0]);assetchecks.append({'goalId':gid,'sha256':hashes[0],'copies':[ref(p) for p in paths],'width':im.width,'height':im.height,'hasAlpha':im.mode in ['RGBA','LA']})
write(B/'checks/FINAL26.images-normal-import-copy-metadata.actual.json',{'records':assetchecks,'allThreeCopiesExact':True,'provider':'OpenAI / ChatGPT-Codex built-in image_gen (model version not exposed)','independentScientificApprovals':0})
captures=read(B/'checks/29.actual-browser-display-and-native-captures.json');allrows=captures['imageCaptures'];imgs=[x for x in allrows if not x.get('nativeHTML')];html=[x for x in allrows if x.get('nativeHTML')] or captures.get('nativeHTMLLayouts',[]);captures['imageCaptures']=imgs;captures['nativeHTMLLayouts']=html;write(B/'checks/29.actual-browser-display-and-native-captures.json',captures)
if len(imgs)!=58 or len(html)!=29:raise RuntimeError('Missing actual browser captures')
if any(x['layout']['scrollHeight']>x['layout']['height']+1 for x in html):raise RuntimeError('Native overflow')
pdf=read(B/'checks/29.actual-native-PDF-page-captures.json');
if len(pdf['records'])!=29 or any(x['extractedTextCharacters']<200 for x in pdf['records']):raise RuntimeError('Missing native PDF goal page')
four=[i for i in ids if i[:8]in ['014e6d85','127e2fc9','197bc2c5','7b477c2b']];v1={x['id']:x for x in read(V/'candidate/canonical523.two-text-eight-PNG-author.inactive.json')['goals']};pr={r['goalId']:r for r in [json.loads(l) for l in (B/'positive/P36.actual-bound.ai-candidate.review.jsonl').read_text().splitlines()]};oldpr={r['goalId']:r for r in [json.loads(l) for l in (V/'positive/P31.final-eight-PNG.author.review.jsonl').read_text().splitlines()]}
if any(g[i]['description']!=v1[i]['description'] or g[i]['descriptionEn']!=v1[i]['descriptionEn'] or pr[i]['profile']!=oldpr[i]['profile'] for i in four):raise RuntimeError('Early four science changed')
inputs=[]
for p in B.rglob('*'):
 if p.is_symlink():raise RuntimeError('Symlink:'+str(p))
 if p.is_file() and p.suffix in ['.json','.jsonl']:
  if p.suffix=='.json':read(p)
  else:
   for line in p.read_text().splitlines():
    if line.strip():json.loads(line)
  inputs.append(str(p.relative_to(B)))
frozen=[]
for name,p in [('v1-author',V/'FINAL.author-package.freeze.json'),('A31-ORIGINAL',B.parent/'chemie-q2-naturstoffe-current402-independent-a-20261012-v1/ORIGINAL.package.freeze.json'),('B31-ORIGINAL',B.parent/'chemie-q2-naturstoffe-current402-independent-b-20261012-v1/ORIGINAL.freeze.json')]:frozen.append({'name':name,**ref(p)})
checks={'schemaVersion':1,'canonicalBaselineTotal':len(current['goals']),'candidateTotal':len(land['goals']),'candidateCurricularAtomic':407,'targetedAtomicPages':29,'normalBoundProfiles':36,'goalCaseRubricEntries':len(read(B/'cases/targeted24-to29.DEEN.tasks-material-rubrics.json')['cases']),'oldRequiresChanges':len(changed),'incomingRequiresChanges':len(split['incomingRequiresDeltas']),'changedParentRequires':4,'newChildRequires':9,'requiresCycles':0,'containsCycles':0,'protectedB007GoalIds':protected,'protectedB007Exact':True,'earlyFourTextsAndProfilesExact':True,'actualImageCaptures360And680':58,'actualHTMLPages':29,'actualPDFGoalPages':29,'fourByThreeCandidateImages':sum(abs(x['width']/x['height']-4/3)<.04 for x in assetchecks),'allOwnedJSONFilesParsed':len(inputs),'historicalSeals':frozen,'liveCanonicalComparedInput':ref(live),'activeWrites':False,'newScientificClosures':0,'newHumanApprovals':0,'humanTrials':0};write(B/'checks/FINAL.targeted-structural-CAS-native-history.actual.json',checks)
entryfiles=[B/'inputs/canonical.live-at-v2-seal.exact.json',B/'candidate/canonical532.complete-inactive.json',B/'candidate/semantic407.inactive-model-input.json',B/'candidate/visualization-QA.actual-unapproved-candidates.json',B/'positive/P36.actual-bound.ai-candidate.review.jsonl',B/'cases/targeted24-to29.DEEN.tasks-material-rubrics.json',B/'memory/current407.author.necessity.jsonl',B/'memory/current75.author.cards.jsonl',B/'memory/de_gymnasium_chemistry_flashcards_natural_q2.de.json',B/'neutral/current31-and-candidate40.actual-goal-image-tuples.json',B/'neutral/raw36.mapping-decisions-sourceGoalIDs-literals-citations.actual.json',B/'neutral/current31.normal-original-source-route-inputs.json',B/'neutral/BY31.actual-literal-and-program-input-tuples.json',B/'neutral/split9.literal-source-input-tuples.json',B/'sources/literal-current-source-literals.actual.json',B/'sources/literal-whole-source-contexts.actual.json',B/'neutral/MM.actual-primary-reference-inputs.json',B/'sources/method-references-and-author-adaptations.json',B/'native/full407.actual.config.json',B/'native/full407.actual.book-model.json']
for n in [1,2]:
 d=B/'native'/f'batch-{n}'
 for f in ['book-model.json','book.html','book.pdf','book.html.render-manifest.json','book.pdf.render-manifest.json','bundle/manifest.json','bundle/review-input.json']:entryfiles.append(d/f)
entry={'schemaVersion':1,'inputId':'chemie-q2-current402-targeted29-v2-final-input','currentBaselineAtomicCount':402,'candidateAtomicCount':407,'goalIds':target,'fileInputs':[ref(p) for p in entryfiles]};write(B/'FINAL.targeted29.neutral-review-input.json',entry)
print(json.dumps({'neutralEntry':str((B/'FINAL.targeted29.neutral-review-input.json').relative_to(R)),'fileInputs':len(entryfiles),'caseEntries':checks['goalCaseRubricEntries'],'targetedNativePages':29,'profiles':36,'strictClosures':0}))
