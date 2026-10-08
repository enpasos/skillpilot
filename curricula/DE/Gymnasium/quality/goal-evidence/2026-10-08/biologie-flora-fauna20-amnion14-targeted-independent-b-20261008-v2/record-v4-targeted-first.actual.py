import json,hashlib
from pathlib import Path
from datetime import datetime,timezone
root=Path('/home/enpasos/projects/skillpilot')
q=Path('curricula/DE/Gymnasium/quality')
author=q/'goal-evidence/2026-10-08/biologie-flora-fauna20-amnion14-raster-native-targeted-author-root-v3'
own=q/'goal-evidence/2026-10-08/biologie-flora-fauna20-amnion14-targeted-independent-b-20261008-v2'
old=q/'goal-evidence/2026-10-08/biologie-flora-fauna20-final-raster-native-independent-b-20261008-v1'
oldauthor=q/'goal-evidence/2026-10-07/biologie-flora-fauna20-final-raster-native-author-root-20261007-v1'
gid='321ea315-37fe-5f9e-8fa8-dd631bb447c7'
now=datetime.now(timezone.utc).isoformat()
def read(p):return json.loads((root/p).read_text())
def sha(b):return 'sha256:'+hashlib.sha256(b).hexdigest()
def digest(p):
 b=(root/p).read_bytes();return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(name,obj):
 p=root/own/name;assert not p.exists(),str(p);p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
def rows(p):return [json.loads(x) for x in (root/p).read_text().splitlines()]
f=author/'targeted-amnion14-whole-native-author-input.freeze.json';freeze=read(f)
assert digest(f)['sha256']=='8a3e4229e784f1b43bf401096f4d5920c062423e088322f320d52eb014495db2'
for x in freeze['frozenFiles']:assert digest(Path(x['path']))==x,x['path']
entry=read(author/'neutral-targeted-amnion14-current-raster-native.entry.json')
assert entry['targetedImage']['sha256']=='5b213d0416a38e01cf1368b36186f907cf0a77711411e78cea22cca9a29584a5'
oldseal=old/'independent-b.completed-flora-fauna20.exact-input-output.first.freeze.json'
assert digest(oldseal)['sha256']=='793f049c0a0e3539204e4b67c333afb0f658c31f955e61ffceba48865de308b2'
oldgoals=read(oldauthor/'current20-whole-DEEN-goals.actual.json')['goals'];newgoals=read(author/'current20-whole-DEEN-goals.actual.json')['goals']
assert oldgoals==newgoals
canonical=read(author/'candidate/canonical.current474-twenty-new-raster-author.json')
oldcanonical=read(oldauthor/'candidate/canonical.current474-twenty-new-raster-author.json')
assert len(canonical['goals'])==len(oldcanonical['goals'])==474
changed=[]
for a,b in zip(oldcanonical['goals'],canonical['goals']):
 assert a['id']==b['id']
 if a!=b:changed.append(a['id'])
# The URL remains identical; byte/digest changes are native image input only.
assert changed==[],changed
oldp=rows(old/'P20.current-raster-independent-b.review.jsonl')
newauthorp=rows(author/'native-raster-candidate/P20.actual-raster-author.review.jsonl')
assert len(oldp)==len(newauthorp)==20
profile_bindings=[];input_changes=[]
for a,b in zip(oldp,newauthorp):
 assert a['goalId']==b['goalId']
 assert a['profile']==b['profile'] and a['profileFingerprint']==b['profileFingerprint'] and a['goalFingerprint']==b['goalFingerprint']
 if a['reviewInputFingerprint']!=b['reviewInputFingerprint']:input_changes.append(a['goalId'])
 profile_bindings.append({'goalId':a['goalId'],'wholeProfileBodyRetainedExact':True,'profileFingerprint':b['profileFingerprint'],'currentReviewInputFingerprint':b['reviewInputFingerprint'],'priorReviewInputFingerprint':a['reviewInputFingerprint']})
assert input_changes==[gid],input_changes
oldmodel=read(oldauthor/'native-raster-candidate/full391.book-model.json');newmodel=read(author/'native-raster-candidate/full391.book-model.json')
assert len(oldmodel['pages'])==len(newmodel['pages'])==391
pagechanges=[]
for a,b in zip(oldmodel['pages'],newmodel['pages']):
 assert a['goalId']==b['goalId']
 if a!=b:pagechanges.append(a['goalId'])
assert pagechanges==[gid],pagechanges
manifest=read(author/'selected-twenty-one-targeted-image-correction.author.json')
images=manifest.get('images',manifest.get('selectedImages'))
assert images is not None
oldv=read(old/'V20.actual-image-width-native-page.independent-b.json')['verdicts']
ib={x['goalId']:x for x in images};unchanged=[]
for v in oldv:
 if v['goalId']==gid:continue
 assert ib[v['goalId']]['sha256']==v['actualFullImage']['sha256']
 unchanged.append({'goalId':v['goalId'],'sha256':ib[v['goalId']]['sha256'],'priorDecision':v['decision'],'priorStatus':v['status'],'newScientificReview':False})
write('exact-v4-input-and-retained-whole-bindings.actual.json',dict(verifiedAt=now,authorFreeze=digest(f),inputFileCount=90,exactInputs=freeze['frozenFiles'],priorFirstSeal=digest(oldseal),current20WholeGoalBodiesExact=True,canonical474Exact=True,fullNative391PagesOnlyChanged=[gid],unrelatedNative390PagesExact=True,unchanged19ImagesAndFirstVerdicts=unchanged,profileBindings=profile_bindings,onlyCurrentPInputBindingChanged=[gid],profileBodyChanges=0,peerV4OutputsRead=False,newUnchanged19ScienceReviews=0,activeWrites=0))
campaignpath=author/'native-raster-candidate/twenty/round-b';campaign=read(campaignpath/'description-review-campaign.json');inp=read(campaignpath/'description-review-input.json');bundle=read(campaignpath/'review-bundle-manifest.json');g=inp['goals'][0]
assert g['goalId']==gid and g['reviewContext']['page']['visualization']['originalDigest']=='sha256:'+entry['targetedImage']['sha256']
previousD=next(x for x in rows(old/'round-b/results/biologie-flora-fauna20-twenty-current391-independent-b-20261007-v1.batch-001.records.jsonl') if x['goalId']==gid)
rec=dict(previousD);runid='biologie-flora-fauna20-amnion14-v4-targeted-native-independent-b-20261008-v2'
rec.update(recordId=runid+'.14',runId=runid,campaignId=campaign['campaignId'],roundId=campaign['roundId'],bundleFingerprint=campaign['bundleFingerprint'],bookDigest=campaign['bookDigest'],goalFingerprint=g['goalFingerprint'],pageFingerprint=g['pageFingerprint'])
rec['rationale']='Gezielter tatsächlicher v4-Recheck nach eigenem versiegeltem Flora20-Ersturteil: ganze DE/EN-Beschreibung, kanonischer Kontext und unveränderte P14-Fallkörper bleiben fachlich KEEP. Voller PNG, echte360/680 und komplette native Ein-Ziel-PDF-Seite wurden gesehen. Die falsche linke Amnion-Leaderlinie ist entfernt; der verbleibende rechte Leader bezeichnet die graue schützende Embryonalhülle und nicht das Küken oder Dotter. Schale, Embryo, Dotterversorgung, Allantois und nachfolgende Jungtiere bleiben kohärent. Kein neues Urteil über unveränderte19 Ziele/Bilder; keine neue A/M- oder Länderfreigabe. Historische v2/v3-Holds werden nicht überschrieben.'
results=root/own/'round-b/results';results.mkdir(parents=True,exist_ok=True)
recordpath=results/(campaign['batches'][0]['batchId']+'.records.jsonl');assert not recordpath.exists();recordpath.write_text(json.dumps(rec,ensure_ascii=False)+'\n')
params=dict(provider='OpenAI Codex conversation',model='GPT-6 Codex runtime version not exposed',actualSamplingParameters='not exposed',role='targeted independent B v4 actual native/raster recheck',peerV4VerdictsRead=False,historicalV3PeerExposureDisclosed=True)
write('actual-review-generation-parameters.json',params)
batchfile=campaignpath/'batches'/(campaign['batches'][0]['batchId']+'.input.jsonl')
artifacts=[{'role':x['role'],'digest':x['digest']} for x in bundle['artifacts'] if x['role'] in ['book_model','book_pdf','book_pdf_render_manifest','book_html_render_manifest','review_input_json','review_prompt','review_criteria','run_manifest_schema']]
artifacts.append({'role':'description_review_batch_input_jsonl','digest':sha((root/batchfile).read_bytes())})
run={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':runid,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'batchId':campaign['batches'][0]['batchId'],'batchInputFingerprint':campaign['batches'][0]['batchInputFingerprint'],'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],'provider':'OpenAI Codex conversation','model':'GPT-6 Codex (runtime version not exposed)','role':'subject_reviewer','promptFamilyId':'goal-description-understanding-evidence-v2','promptFingerprint':campaign['promptFingerprint'],'criteriaFingerprint':campaign['criteriaFingerprint'],'generationParametersFingerprint':sha((root/own/'actual-review-generation-parameters.json').read_bytes()),'independenceGroupId':campaign['independenceGroupId'],'blindToOtherRuns':True,'goalIds':[gid],'inputArtifacts':artifacts,'startedAt':'2026-10-07T22:56:25Z','completedAt':now,'status':'completed','outputDigest':sha(recordpath.read_bytes()),'toolchainVersion':'independent-codex-conversation-native-v1'}
write('round-b/results/'+campaign['batches'][0]['batchId']+'.run.json',run)
# Keep all19 original independent records byte-equivalent as parsed; replace only
# the changed-image record using actual current raster binding and own rationale.
ownp=[]
for a,b in zip(oldp,newauthorp):
 if a['goalId']!=gid:ownp.append(a);continue
 r=dict(b);r['reviewId']='biologie-flora-fauna20-amnion14-targeted-independent-b-20261008-v2';r['reviewedAt']=now;r['reviewer']='OpenAI Codex independent B actual v4 targeted recheck before peer v4 discussion'
 r['reason']='Gezielter tatsächlicher v4 V-/D-/P-Bindungsrecheck KEEP/PASS; unveränderter ganzer P14-Körper bleibt aus eigenem versiegeltem fachlichem Ersturteil erhalten. Einziger neuer P-Input ist der exakt verifizierte PNG-Digest. Finale v4 native Seite und360/680 tatsächlich gesehen; keine neue Lernendenleistung oder menschliche Freigabe.'
 r['dissent']=a['dissent']+['Historischer V14-HOLD bleibt in Erstseal erhalten. Hier nur neues v4-Gegenurteil nach tatsächlicher Bildsicht und gezielter aktueller Seitenbindung; keine unveränderten19 Fachurteile neu erzeugt.']
 ownp.append(r)
 write('P14.current-v4-independent-b.record.json',r)
p=root/own/'P20.retained19-with-one-v4-binding.independent-b.review.jsonl';assert not p.exists();p.write_text(''.join(json.dumps(x,ensure_ascii=False)+'\n' for x in ownp))
captures=read(Path(entry['widthCaptureReceipt']['path']))
write('V14.actual-v4-image-width-native-page.independent-b.first.json',{'schemaVersion':1,'reviewedAt':now,'goalId':gid,'decision':'KEEP','status':'PASS','actualFullImage':entry['targetedImage'],'actualWidthCaptures':captures['captures'],'actualNativePdf':entry['actualOneGoalPdf'],'actualNativePdfPage':entry['actualOneGoalPdfCapture'],'actualFourViewsRead':True,'goalFingerprint':g['goalFingerprint'],'pageFingerprint':g['pageFingerprint'],'nativeDescriptionRecordId':rec['recordId'],'positiveProfileBinding':next(x for x in profile_bindings if x['goalId']==gid),'concreteObservation':'Die falsche linke Amnion-Pfeillinie fehlt vollständig. Der verbleibende rechte Pfeil verbindet Amnion (Fruchtblase) mit der grauen Hülle beim Vogelembryo; er bezeichnet keinen Dotter, keine Schale und keine Embryogestalt. Die beiden Schalen-, Embryo-, Dottersack- und Allantois-Zuordnungen bleiben kohärent. Eidechse und Küken schlüpfen als Jungtiere; die Zeichnung verallgemeinert mit z.B. keine Eierregel auf alle Reptilien. 360/680 ohne Beschneidung/Verformung, rechte Beschriftung weiter zuzuordnen; kleine360-Schrift bleibt eine Orientierungsdarstellung, keine Feinpräparatprüfung. Ganze native Seite stimmt mit Zielbeschreibung, externe Voraussetzungen/Nachfolger und tatsächlichem v4PNG überein.','scopeLimits':['Schematische Orientierungsabbildung, keine vollständige Embryologie oder eigentliche beobachtete Entwicklung','Bild allein zeigt weder Brutpflegeleistung noch Lernendenleistung','390 unveränderte native Seiten und19 unveränderte V-Urteile technisch retained, nicht neu fachreviewt','360/680 element captures are sizing evidence, not full app/device acceptance','Keine menschliche Freigabe oder aktive Integration'],'historicalV2OriginalHoldRetained':True,'historicalV3PeerExposureDisclosed':True,'peerV4VerdictsRead':False,'v4FirstVerdictDiscussedBeforeSeal':False,'activeWrites':0,'humanApproval':False})
print(json.dumps({'inputFiles90':90,'unchanged19Images':len(unchanged),'native391OnlyOnePageChanged':pagechanges,'wholeP20BodiesExact':True,'V14':'KEEP/PASS','newDRecordCount':1,'activeWrites':0}))
