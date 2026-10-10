# SPDX-License-Identifier: Apache-2.0
import pathlib,json,copy as dc,hashlib,shutil,datetime
R=pathlib.Path('/home/enpasos/projects/skillpilot'); BASE=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10')
P=BASE/'biologie-neuro-ten-current343-dual-D-P-V-inactive-integration-technical-root-20261010-v1'
V=BASE/'biologie-neuro-verhalten-hormone-ten-sehbahn-v3-current343-native-technical-successor-20261010-v2'
T=BASE/'biologie-neuro-verhalten-hormone-ten-whole-material-and-raster-author-candidate-v1'
A=BASE/'biologie-neuro-verhalten-hormone-ten-current-v3-independent-a-20261010-v2'
B=BASE/'biologie-neuro-verhalten-hormone-ten-current-v3-independent-b-20261010-v1'
SA=BASE/'biologie-neuro-ten-BY-eight-primary-targeted-source-independent-a-20261010-v3'
SB=B/'source-current-binding-v3-independent-b'
S=BASE/'biologie-neuro-ten-BY-eight-primary-current343-source-native-technical-successor-root-20261010-v3'
CAN=pathlib.Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'); QA=pathlib.Path('curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json'); KIN=pathlib.Path('curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'); REG=pathlib.Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'); SRC=pathlib.Path('app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json')
def read(p):return json.loads((R/p).read_text())
def ref(p):
 p=pathlib.Path(p);b=(R/p).read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verify(x):assert ref(x['path'])=={k:x[k] for k in ['path','sha256','bytes']},x['path']
def put(p,x):
 f=R/P/p;f.parent.mkdir(parents=True,exist_ok=True);assert not f.exists(),f;f.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return ref(P/p)
def copy(src,dst):
 f=R/P/dst;f.parent.mkdir(parents=True,exist_ok=True)
 if f.exists():assert f.read_bytes()==(R/src).read_bytes(),f
 else:shutil.copyfile(R/src,f)
 return ref(P/dst)
for x in read(P/'inputs/current343-write-guards.exact.json')['files']:verify(x)
sources=[SA/'independent-A-current343-source-eight-followup.entry.json',SA/'FINAL.independent-A-current343-source-eight-followup.freeze.json',SB/'FINAL-current-V3-source-bound-independent-B.portable.entry.json',SB/'FINAL-current-V3-source-bound-independent-B.freeze.json']
assert ref(sources[0])['sha256']=='sha256:beed7d8f1e2820d729f08fda266483b1eeadde4a051496306b2b17ebeea452e9'
assert ref(sources[1])['sha256']=='sha256:702defe5ab64b2388c18857df459ab0f6b19cc08b2af37e224506a5de9c6ef74'
assert ref(sources[2])['sha256']=='sha256:a60bab1393b74c2668b9adb6e45db937a9cfb126ef20e8bedb5f7b96f8901f11'
assert ref(sources[3])['sha256']=='sha256:4351c675bfc6b3d36853e85804f9daa670764f1dbd4e46af94b4b46f22d1e28c'
rows=read(V/'inputs/ten-current-raster-bindings.neutral.json')['records'];ids=[x['goalId'] for x in rows];assert len(set(ids))==10
ae=read(A/'current-native-ten-independent.A.json');be=read(B/'whole-ten-independent-DPAMV-review.json');ad={x['goalId']:x for x in ae['goalRows']};bd={x['goalId']:x for x in be['rows']}
q=read(QA);qold=dc.deepcopy(q);pending={x['goalId']:x for x in read(V/'candidate/current394-QA-plus-ten-pending.inactive.json')['records']};byq={x['goalId']:x for x in q['records']};pair=[];ops=[]
pp=copy(V/'positive/ten-current-raster.P.pending.review.jsonl','positive/ten-current-raster.P.exact.jsonl');pby={x['goalId']:x for x in [json.loads(l) for l in (R/pp['path']).read_text().splitlines() if l.strip()]}
assert len(pby)==10
initial={x['goalId']:x for x in read(T/'prompts/ten.actual-imagegen-prompts-and-output-provenance.json')['records']};edits={x['goalId']:x for x in read(T/'prompts/six.v2.actual-imagegen-edit-provenance.json')['records']}
for row in rows:
 gid=row['goalId'];a=ad[gid];b=bd[gid];pr=pby[gid]
 assert a['descriptionContentDecision']=='keep_current_native_independent_A' and a['positiveWholeScienceDecision']=='ready_current_independent_A_E1_G1_candidate' and a['rawVisualDecision']=='ready_current_independent_A_candidate'
 assert b['D']['decision']=='keep' and b['P']['decision']=='KEEP_science_profile' and b['V']['decision']=='KEEP' and b['A']['status']=='atomic' and b['M']['status']=='no_memory_needed'
 assert a['semanticAtomicityDecision']=='atomic' and a['memoryDecision']=='no_memory_needed'
 assert (pr['status'],pr['reviewAuthority'],pr['evidenceLevel'],pr['maximumClaimScope'])==('needs_human_review','ai_candidate','E1','G1')
 assert a['currentProfileFingerprint']==b['P']['currentProfileFingerprint']==pr['profileFingerprint']
 views=a['actualCurrentRasterViews'];bviews=b['V']['boundActualImages']
 for k in ['originalPNG','proportional360','proportional680','nativeHTMLPage','nativePDFPage','PNGProvenance']:
  verify(views[k]);verify(bviews[k]);assert {z:views[k][z] for z in ['path','sha256','bytes']}=={z:bviews[k][z] for z in ['path','sha256','bytes']}
 assert bviews['originalPNG']==row['actualCurrentPNG']
 canpath=f'curricula/DE/Gymnasium/visualizations/biologie/{gid}/{gid}.png';pubpath='app/public'+row['futurePublicURL'];backpath='backend/src/main/resources/static'+row['futurePublicURL']
 x=dc.deepcopy(pending[gid]);x.update(landscapePath=str(CAN),canonicalAssetPath=canpath,publicAssetPath=pubpath,aiApproved='yes',aiApprovedAssetSha256=row['actualCurrentPNG']['sha256'],aiReviewedAt=max(ae['createdAt'],be['createdAt']),aiReviewer='Completed genuine independent A and current B; technical transfer by correction author',aiNotes='Actual original/360/680 and whole native HTML/PDF reviewed by A '+str(A/'current-native-ten-independent.A.json')+' and B '+str(B/'whole-ten-independent-DPAMV-review.json')+'. Two source findings resolved by their targeted current source addenda '+str(sources[0])+' and '+str(sources[2])+'. P remains needs_human_review/ai_candidate E1/G1, approved0. No human approval or trial.',chatGptNotes='Historical technical preparation was pending; current genuine independent A and B are now completed and bound in aiNotes. These are machine image decisions only.')
 byq[gid].clear();byq[gid].update(x)
 pair.append({'goalId':gid,'genuineA':ref(A/'current-native-ten-independent.A.json'),'genuineB':ref(B/'whole-ten-independent-DPAMV-review.json'),'original':row['actualCurrentPNG'],'actualOriginal360680AndNativeBindings':bviews,'genuineAReasonUnchanged':a['independentReason'],'genuineBVisualReasonUnchanged':b['V']['reason'],'genuineBPositiveReasonUnchanged':b['P'].get('reason',b['P'].get('individualCaseJudgments')),'currentSourceAddenda':[ref(z) for z in sources],'pairedDecision':'KEEP','newReviewByIntegrator':False,'humanApproval':False})
 for target in [canpath,pubpath,backpath]:ops.append({'source':row['actualCurrentPNG'],'target':target,'operation':'Exact byte copy of actually reviewed current PNG; no edit','goalId':gid})
 prompt='# Tatsächliche Bildgenerierung und aktuelle maschinelle Sichtprüfung\n\nEigenes didaktisches Material: CC-BY-4.0. Technische Dokumentation: Apache-2.0.\n\nLernziel: '+gid+'\n\n## Ursprünglicher tatsächlich verwendeter Prompt\n\n'+initial[gid]['prompt']+'\n\n'
 if gid in edits:prompt+='## Tatsächlicher Korrekturprompt v2\n\n'+edits[gid]['prompt']+'\n\n'
 if row.get('actualPrompt'):prompt+='## Tatsächlicher Korrekturprompt v3\n\n'+(R/row['actualPrompt']['path']).read_text()+'\n\n'
 prompt+='## Herkunft und Entscheidung\n\nGenerator: '+row['provider']+'. Original-PNG: '+row['actualCurrentPNG']['sha256']+'. Maße: '+str(row['nativeDimensions'][0])+' × '+str(row['nativeDimensions'][1])+'; nahe natives 16:9. Tatsächlicher Herkunftsnachweis: '+row['provenance']['path']+'.\n\nAktuelle Entscheidung: KEEP nach zwei tatsächlichen unabhängigen maschinellen Prüfungen von Original, proportionalen 360-/680-Pixel-Sichten und vollständiger nativer HTML-/PDF-Lernzielseite. A: '+str(A/'current-native-ten-independent.A.json')+'; B: '+str(B/'whole-ten-independent-DPAMV-review.json')+'.\n\n'+b['V']['reason']+'\n\nDie proportionalen Sichten dienen der lokalen Lesbarkeitsprüfung; sie sind keine ausgelieferten Ersatzbilder und keine Erprobung auf einem echten Handy. Erzeugung allein war keine Freigabe. Keine menschliche Freigabe oder Erprobung behauptet.\n'
 dest=P/'prompts'/gid/'prompt.de.md';f=R/dest;f.parent.mkdir(parents=True,exist_ok=True);assert not f.exists() or f.read_text()==prompt;f.write_text(prompt)
 ops.append({'source':ref(dest),'target':str(pathlib.Path(canpath).parent/'prompt.de.md'),'operation':'Exact technical documentation of actual prompts and completed real machine KEEP','goalId':gid})
assert [x for x in q['records'] if x['goalId'] not in ids]==[x for x in qold['records'] if x['goalId'] not in ids]
put('candidate/current394-QA-ten-genuine-current-paired.inactive.json',q)
copy(V/'candidate/current479-only-ten-resourceLinks.inactive.json','candidate/current479-only-ten-resourceLinks.exact.json');copy(KIN,'candidate/current394-kinds.active-exact.json')
cfg=read(V/'positive/ten-current-raster.P.pending.config.json');cfg['reviewPath']=str(P/'positive/ten-current-raster.P.exact.jsonl');cfg['landscapePath']=str(CAN);cfg['semanticKindLedgerPath']=str(KIN);cfg['scope']['label']='Current ten whole profiles actually independently reviewed A and B; source findings bounded/resolved; machine E1/G1; human review pending';put('positive/P10.future-active.config.json',cfg)
inactive=dc.deepcopy(cfg);inactive['landscapePath']=str(P/'candidate/current479-only-ten-resourceLinks.exact.json');put('positive/P10.inactive-check.config.json',inactive)
reg=read(REG);old=next(s for s in reg['subjects'] if s['subject']=='biologie');bio=dc.deepcopy(old);bio['positiveEvidenceConfigPaths'].append(str(P/'positive/P10.future-active.config.json'));bio['resolutionIndexPaths'].append(str(P/'native-ten-final-precise-selection/resolution-index.json'));assert len(bio['positiveEvidenceConfigPaths'])==53 and len(bio['resolutionIndexPaths'])==62
put('registry/biologie-subject.P10-D10.future-active.inactive.json',bio);reg['subjects']=[bio if s['subject']=='biologie' else s for s in reg['subjects']];put('registry/five-subject.Bio10-only-review-snapshot.inactive.config.json',reg)
oldsrc=read(SRC);newsrc=dc.deepcopy(oldsrc);sourcecfg=read(S/'sources/current-eight-BY-primary.normal-atlas.config.json');oldby=next(p for p in oldsrc['mappingPaths'] if '04-bavaria_biology' in p);oldhe=next(p for p in oldsrc['mappingPaths'] if 'whole144-only8229-partial-edge' in p);newby=next(p for p in sourcecfg['mappingPaths'] if 'BY-whole228-Sehbahn' in p);newhe=next(p for p in sourcecfg['mappingPaths'] if 'HE-whole157-144-six-partial' in p)
newsrc['mappingPaths']=[newby if p==oldby else newhe if p==oldhe else p for p in oldsrc['mappingPaths']]
pins=[p for p in sourcecfg['sourceDocumentSnapshots'] if p not in oldsrc['sourceDocumentSnapshots']];assert len(pins)==2
newsrc['sourceDocumentSnapshots']+=pins;assert [p for p in newsrc['mappingPaths'] if p not in [newby,newhe]]==[p for p in oldsrc['mappingPaths'] if p not in [oldby,oldhe]]
put('sources/future-active-two-pair-two-primary-only.inputs.json',newsrc);put('inputs/source-config.before.exact.json',oldsrc)
put('checks/genuine-current-V10-pair-technical-transfer.json',{'schemaVersion':1,'records':pair,'pairedActualCurrentKEEP':10,'unchangedP10RawRecords':True,'humanApproval':False,'integratorScientificReviewClaimed':False,'activeGain':0})
copy(CAN,'inputs/whole479.before.exact.json');copy(QA,'inputs/whole394-QA.before.exact.json');copy(REG,'inputs/five-subject-registry.before.exact.json')
ops=[{'source':ref(P/'candidate/current479-only-ten-resourceLinks.exact.json'),'target':str(CAN),'expectedCurrentTarget':ref(CAN),'operation':'Only10 resourceLinks; all469 other full goals exact'},{'source':ref(P/'candidate/current394-QA-ten-genuine-current-paired.inactive.json'),'target':str(QA),'expectedCurrentTarget':ref(QA),'operation':'Only10 real current V approvals and exact asset bindings; other384 rows exact'},*ops,{'source':ref(P/'registry/biologie-subject.P10-D10.future-active.inactive.json'),'target':str(REG),'expectedCurrentTarget':ref(REG),'operation':'Merge Bio subject only into current registry; append P10/D10; other subjects exact'},{'source':ref(P/'sources/future-active-two-pair-two-primary-only.inputs.json'),'target':str(SRC),'expectedCurrentTarget':ref(SRC),'operation':'Only two genuinely reviewed HE/BY mapping successors and two exact actual BY primary pins; derive normal Atlas outputs'}]
put('ROOT.current343-ten-reviewed-copy-plan.inactive.json',{'schemaVersion':1,'operations':ops,'operativeWrites':[],'strictGainBeforeAdoption':0,'currentProtected343MustBeRetained':True,'A394M394Kinds394Retained':True,'wholeHumanCourseApprovalClaimed':False,'completedSourceReviewInputs':[ref(z) for z in sources]})
copy(pathlib.Path(__file__).relative_to(R),'technical-complete-candidates.actual.py')
print(json.dumps({'genuineCurrentVPair':10,'PExact':10,'BioPconfigs':53,'BioDindices':62,'copyOperations':len(ops),'sourcePairChanges':2,'actualPrimaryPins':2,'activeWrites':0,'strictGain':0}))
