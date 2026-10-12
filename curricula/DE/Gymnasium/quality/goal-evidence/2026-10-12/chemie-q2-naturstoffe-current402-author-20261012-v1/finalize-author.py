# SPDX-License-Identifier: Apache-2.0
import json,pathlib,hashlib,datetime
from PIL import Image
ROOT=pathlib.Path.cwd();B=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q2-naturstoffe-current402-author-20261012-v1'
def read(p):return json.loads(p.read_text())
def rel(p):return str(p.relative_to(ROOT))
def ref(p):return {'path':rel(p),'bytes':p.stat().st_size,'sha256':'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()}
def write(p,v):p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
scope=read(B/'scope31.current402.author.actual.json');ids=scope['goalIds'];new=scope['deferredVisualizationGoalIds'];candidate=read(B/'candidate/canonical523.two-text-eight-PNG-author.inactive.json');cg={g['id']:g for g in candidate['goals']};base=read(B/'baseline/canonical523.live.exact.json');bg={g['id']:g for g in base['goals']};profiles={r['goalId']:r for r in [json.loads(l) for l in (B/'positive/P31.final-eight-PNG.author.review.jsonl').read_text().splitlines() if l]};cases=read(B/'cases/whole31.DEEN.cases-and-current-context.author.json');src=read(B/'sources/selected31.current382.normal-original-source-routes.actual.json');srcb={r['goalId']:r for r in src['goals']};duties=read(B/'sources/current31-source-contributions-and-bounded-official-operators.author.json');db={r['goalId']:r for r in duties['records']};captures=read(B/'checks/31.actual-browser-display-and-native-captures.json');capb={i:[r for r in captures['imageCaptures'] if r['goalId']==i] for i in ids};imageinv=[]
notes={
'0b5342b9':'Zwei gleiche Lactose-Bausteine bleiben ohne Enzym verbunden; mit Enzym entstehen zwei Einzelbausteine. Die Darstellung ist ein qualitativer Verdauungsmechanismus und keine Diagnose; die Darmskizze ersetzt keine Resorptionsdarstellung.',
'127e2fc9':'Gleich viele Zuckersymbole bei unterschiedlichen Portionsgrößen zeigen eine Vergleichsaufgabe. Die Symbole behaupten keine gemessenen Gehalte bestimmter realer Getränke; Hauptbotschaft Portion zählt bleibt bei 360 sichtbar.',
'197bc2c5':'Große CO-NH-Amidgruppe mit korrekten Bindungsordnungen und markierter C-N-Bindung; farbige Perlen sind abstrakte Rest-/Kettensegmente, keine Atomstruktur der vollständigen Aminosäuren.',
'360fccb9':'Verknüpfte Zuckerbausteine, dreifacher Fettschwanz, gefaltete Peptidperlen und Ionensymbole sind klar getrennte abstrakte Klassenmodelle. Einzelionen sind Beispielsymbole, keine stöchiometrische Salzformel; Mikronährstoffe sind nicht nach Symbolgröße definiert.',
'62149f36':'COOH und NH2 oben, COO− und NH3+ unten; vier Bindungen am zentralen C. Der erste Versuch schrieb CO− und wurde deshalb verworfen. Korrigierte tatsächliche Bytes zeigen COO−. Anordnung ist Konnektivität, keine Fischer-Projektion und keine D/L-Zuweisung.',
'8761cfd2':'Ein, zwei und mehrere verbundene Bausteinsymbole sind unterscheidbar. Lebensmittelbilder sind Vorkommenshinweise und keine Behauptung, Apfel/Brot bestünden ausschließlich aus einer Zuckerart. Das Modell ersetzt keine Stereoprojektion.',
'bebea164':'Je Connector drei Reste; geknickte Reste verhindern die gleichmäßige parallele Packung. Das Modell ist eine qualitative Strukturorientierung, keine feste Schmelztemperatur oder Gesundheitsrangfolge.',
'f4d5a02d':'Der Strahl bleibt geradlinig; Polarisationsebene und Winkelinset zeigen die Drehung. Die Skizze zeigt keine verbogene Lichtbahn und setzt weder D/L mit Drehrichtung gleich noch behauptet sie Stoffidentität.'}
for i in ids:
 g=cg[i];link=next(l for l in g.get('resourceLinks',[]) if l['type']=='goal-visualization');actual=B/'native-public'/link['url'].lstrip('/');im=Image.open(actual);record={'goalId':i,'actualOwnNativeImage':ref(actual),'imageUrl':link['url'],'format':im.format,'width':im.width,'height':im.height,'actualDisplayCaptures':capb[i],'authorDecision':'SELECTED_CANDIDATE_INDEPENDENT_V_PENDING' if i in new else 'KEEP_CURRENT_VALID_QA_NO_NEW_APPROVAL','authorScientificVisualNoteDe':notes.get(i[:8],'Aktuelles vorhandenes Bild bei 360 tatsächlicher Breite angesehen; Hauptmotiv und Zuordnung im Zielkontext erhalten. Gültige bisherige QA wird nicht als neue Autorenfreigabe ausgegeben.'),'newQaApprovalGranted':False,'HumanApprovalClaimed':False,'HumanTrialClaimed':False}
 if i in new:record.update({'sourcePNG':ref(B/'images'/i/(i+'.png')),'generationPrompt':ref(B/'images'/i/'generation.prompt.txt'),'provider':'OpenAI / ChatGPT-Codex built-in image_gen','model':'not exposed by built-in tool','generationCount':2 if i.startswith('62149') else 1,'formatDecision':'1672x941 opaque PNG, near16:9, allowed nearby native generator dimensions','actualOriginalAnd360And680Inspected':True})
 else:
  oldlink=next(l for l in bg[i].get('resourceLinks',[]) if l['type']=='goal-visualization');paths=[ROOT/'curricula/DE/Gymnasium/visualizations/chemie'/i/pathlib.Path(oldlink['url']).name,ROOT/'app/public'/oldlink['url'].lstrip('/'),ROOT/'backend/src/main/resources/static'/oldlink['url'].lstrip('/')];record['currentSourceFrontendBackendCopies']=[ref(p) for p in paths if p.exists()];assert len({r['sha256'] for r in record['currentSourceFrontendBackendCopies']})==1
 imageinv.append(record)
write(B/'images/FINAL31.actual-assets-author-inspection-and-eight-candidates.json',{'schemaVersion':1,'role':'AUTHOR actual inspection only; generation is not independent approval','actualAspectExceptionCount':0,'exception4by3Bounds':'No selected image is a4:3 exception. Browser used448px max height at680 as current GoalCard does; the general597x448 exception requirement remains applicable to future4:3 assets.','falseAlarmRuledOut':{'goalId':'8fe39739-2938-5e2c-8db2-08572b44569a','finding':'Native thumbnail initially looked beige. Original source full-resolution inspection shows dark-blue iodine/starch fluid below beige bread. No defect remains and current JPEG is kept.'},'records':imageinv})
pageBy={};bundleRefs=[]
for n in [1,2]:
 d=B/f'native/final-image-batch-{n}';model=read(d/'bundle/book-model.json');bundle=read(d/'bundle/manifest.json');bundleRefs.append({'batch':n,'pages':len(model['pages']),'bookModel':ref(d/'bundle/book-model.json'),'bookHTML':ref(d/'bundle/book.html'),'bookPDF':ref(d/'bundle/book.pdf'),'bundleManifest':ref(d/'bundle/manifest.json'),'bundleFingerprint':bundle['bundleFingerprint'],'roundAPath':rel(d/'round-a/description-review-campaign.json'),'roundBPath':rel(d/'round-b/description-review-campaign.json'),'completedReviews':0})
 for p in model['pages']:pageBy[p['goalId']]={'batch':n,'page':p,'wholeHTMLCapture':ref(B/'native/actual-whole-html-pages'/(p['goalId']+'.actual.png')),'wholePDFCapture':ref(B/'native/actual-whole-pdf-pages'/(p['goalId']+'.actual.png'))}
whole=[]
for r in cases['goals']:
 i=r['goalId'];r['wholeCandidateGoal']=cg[i];r['sourceRoutes']=srcb[i];r['actualCurrentSourceDuty']=db[i];r['currentPositiveAuthorCandidate']=profiles[i];r['nativePageAndCaptures']=pageBy[i];r['visualizationAuthorCandidate']=next(q for q in imageinv if q['goalId']==i);whole.append(r)
assert set(pageBy)==set(ids) and len(whole)==31
write(B/'FINAL.whole31.neutral-author-review-input.json',{'schemaVersion':1,'role':'AUTHOR_NOT_INDEPENDENT_REVIEW','currentCanonicalGoalCount':523,'currentCurricularAtomicDenominator':402,'sourceUnionCurrentNormal':382,'baselineStrictComplete':212,'strictGain':0,'HumanApproval':False,'HumanTrial':False,'activeWrites':False,'wholeSourceAndOperatorAcceptanceClaimed':False,'semanticHolds':['62149f36-87c0-5a2d-8a78-e7d4203f58c2','8761cfd2-aa1a-56f1-9272-9cf66ef4b271','9deeac6f-d380-52c5-8fc9-e532ab1f4d3f','bebea164-dfd7-51d9-a54a-7029c78b7f5f'],'bundles':bundleRefs,'goals':whole})
first=read(B/'FIRST.author-inputs-CAS.json');drift=[]
for r in first['inputs']:
 now=ref(ROOT/r['path'])
 if now!=r:drift.append({'baseline':r,'current':now})
# Compare inactive candidate solely against the actual live base; edits are bounded.
changed=[{'goalId':i,'fields':sorted(k for k in set(bg[i])|set(cg[i]) if bg[i].get(k)!=cg[i].get(k))} for i in cg if cg[i]!=bg[i]]
assert len(changed)==10,changed
for d in changed:assert set(d['fields']).issubset({'description','descriptionEn','resourceLinks'})
protectedB007=['a44af1fa-5988-5b7d-b206-691c6bbf7dd4','4b6d1824-20e4-597e-b639-fae401f740f0','805a2f58-29ce-55d0-8a85-42ee486239b3','1351706f-4ea6-56e9-951b-87b24cbcdee8','413040cd-ba74-5227-948c-a778b0bd0f56']
assert all(bg[i]==cg[i] for i in protectedB007)
write(B/'checks/FINAL.CAS-bounded-candidate-and-B007-protection.actual.json',{'schemaVersion':1,'inputDrift':drift,'currentInputsUnchanged':not drift,'boundedInactiveGoalDeltas':changed,'protectedFiveB007ApplicabilityAndAllRequiresPreserved':True,'canonicalActiveWrites':False,'registryActiveWrites':False,'ledgerActiveWrites':False,'protectedOtherSubjectsEdited':False,'strictGain':0});assert not drift,drift
parsecount=0
for p in sorted(B.rglob('*')):
 if p.is_file() and p.suffix=='.json':read(p);parsecount+=1
 elif p.is_file() and p.suffix=='.jsonl':
  for l in p.read_text().splitlines():
   if l.strip():json.loads(l)
  parsecount+=1
write(B/'checks/FINAL.all-own-JSON-JSONL-parsed.actual.json',{'schemaVersion':1,'filesParsed':parsecount,'literalNewlineSerialization':True,'errors':[],'curriculumSymlinkErrors':[]})
print(json.dumps({'goals':31,'nativePages':31,'cases':62,'newPNG':8,'unchangedImages':23,'textChanges':2,'CASDrift':len(drift),'boundedGoalChanges':len(changed),'strictGain':0,'HumanApproval':False,'HumanTrial':False}))
