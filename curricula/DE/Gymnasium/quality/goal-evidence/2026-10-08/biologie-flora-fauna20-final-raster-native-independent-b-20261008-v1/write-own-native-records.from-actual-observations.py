#!/usr/bin/env python3
"""Write only B's records from B's substantive actual observations; no active edits."""
import copy, hashlib, json, pathlib, datetime
ROOT = pathlib.Path('/home/enpasos/projects/skillpilot')
Q = ROOT/'curricula/DE/Gymnasium/quality'
OWN = Q/'goal-evidence/2026-10-08/biologie-flora-fauna20-final-raster-native-independent-b-20261008-v1'
AUTHOR = Q/'goal-evidence/2026-10-07/biologie-flora-fauna20-final-raster-native-author-root-20261007-v1'
ORIGINAL = Q/'goal-evidence/2026-10-07/biologie-flora-fauna20-current391-author-v1'
IMAGE = Q/'goal-visualization-review/biologie-flora-fauna20-image-author-root-20261007-v1'
ROUND = AUTHOR/'native-raster-candidate/twenty/round-b'
def read(p): return json.loads(p.read_text())
def rows(p): return [json.loads(x) for x in p.read_text().splitlines()]
def digest(p): return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p): return {'path':str(p.relative_to(ROOT)), 'sha256':digest(p)[7:], 'bytes':p.stat().st_size}
def write(p,v): p.parent.mkdir(parents=True,exist_ok=True); p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def write_rows(p,v): p.parent.mkdir(parents=True,exist_ok=True); p.write_text(''.join(json.dumps(x,ensure_ascii=False,separators=(',',':'))+'\n'for x in v))
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
start=read(OWN/'review-start.actual.json')
notes=read(OWN/'twenty-goal-scientific-actual-observations.independent-b.json')['notes']
manifest=read(IMAGE/'selected-twenty-author-images.exact.json')
images=manifest['images']
entry=read(IMAGE/'neutral-final-flora-fauna20-raster-native-review.entry.json')
seal=read(IMAGE/'final-flora-fauna20-raster-native-author-input.freeze.json')
assert digest(IMAGE/'final-flora-fauna20-raster-native-author-input.freeze.json')=='sha256:a0e466c3ecb503ee73188c39a1545fd4a91e3adc7a321081f040b7a233b1f180'
assert digest(IMAGE/'selected-twenty-author-images.exact.json')=='sha256:784abe5a4ef423c77ec6a5b6301c6dc1fe107ca367e8a6110c57b535d2453eac'
errors=[]
for f in seal['files']:
 p=ROOT/f['path']
 if bind(p)!=f: errors.append(f['path'])
assert not errors, errors
write(OWN/'exact-194-author-input-files.independent-b.actual.json',{'recordedAt':now,'verifiedDeclaredFileCount':len(seal['files']),'errors':errors,'seal':bind(IMAGE/'final-flora-fauna20-raster-native-author-input.freeze.json'),'files':seal['files'],'mechanicalIntegrityOnly':True,'peerReviewsRead':False})
campaign=read(ROUND/'description-review-campaign.json')
bundle=read(ROUND/'review-bundle-manifest.json')
batch=campaign['batches'][0]
input_goals=read(ROUND/'description-review-input.json')['goals']
assert [n['goalId'] for n in notes]==batch['goalIds']
assert [x['goalId'] for x in images]==batch['goalIds']
run_id='biologie-flora-fauna20-final-native-independent-b-20261008-v1'
run_dir=OWN/'round-b/results'
drecords=[]
for n,g in zip(notes,input_goals):
 evidence={k:n[k] for k in ['essentialUnderstandingDe','essentialUnderstandingEn','observablePerformanceDe','observablePerformanceEn','transferExpectationDe','transferExpectationEn']}
 rationale=n['pScientificRationale']+' Zieltext DE/EN, ganze ausgewählte HE-Primärquelle '+n['sourceSection']+', native Seite samt Voraussetzungen/Nachfolgern und konkretes Bild wurden unabhängig geprüft. Die Kompetenz bleibt begrenzt; rohe Länderlisten beweisen keine vollständige Quellenprüfung aller Länder.'
 if n['visualizationDecision']=='HOLD':rationale+=' Beschreibung fachlich KEEP; V14 hat einen getrennten HOLD zur Bildbeschriftung und verhindert Paketfreigabe bis zur Auflösung. Eine Beschreibungskorrektur löst diese Pixelzuordnung nicht.'
 r={'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json','schemaVersion':1,'recordId':run_id+'.'+str(n['ordinal']).zfill(2),'runId':run_id,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest']}
 for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']:r[k]=g[k]
 r.update(decision=n['descriptionDecision'],understandingEvidence=evidence,rationale=rationale,evidenceProfileContract='positive-understanding-evidence-v2',evidenceProfileRecommendation='none',recordStatus='candidate',reviewAuthority='ai_candidate')
 drecords.append(r)
record_file=run_dir/(batch['batchId']+'.records.jsonl')
write_rows(record_file,drecords)
input_artifacts=[{'role':a['role'],'digest':a['digest']} for a in bundle['artifacts'] if a['role'] in ['book_model','book_pdf','book_pdf_render_manifest','book_html_render_manifest','review_input_json','review_prompt','review_criteria','run_manifest_schema']]
input_artifacts.append({'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']})
run={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':run_id,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint'],'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],'provider':'OpenAI Codex conversation','model':'GPT-6 Codex (runtime version not exposed)','role':'subject_reviewer','promptFamilyId':'goal-description-understanding-evidence-v2','promptFingerprint':campaign['promptFingerprint'],'criteriaFingerprint':campaign['criteriaFingerprint'],'generationParametersFingerprint':'sha256:'+hashlib.sha256(b'Existing independent Codex conversation. Exact sampling parameters not exposed. No manufactured API invocation.').hexdigest(),'independenceGroupId':campaign['independenceGroupId'],'blindToOtherRuns':True,'goalIds':batch['goalIds'],'inputArtifacts':input_artifacts,'startedAt':start['startedAt'],'completedAt':now,'status':'completed','outputDigest':digest(record_file),'toolchainVersion':'independent-codex-conversation-native-v1'}
run_file=run_dir/(batch['batchId']+'.run.json')
write(run_file,run)
write(OWN/'native-D20.review-bindings.independent-b.actual.json',{'records':bind(record_file),'run':bind(run_file),'campaign':bind(ROUND/'description-review-campaign.json'),'blindBatchInput':bind(ROUND/'batches'/(batch['batchId']+'.input.jsonl')),'actualDDecisions':{'keep':20},'sourceRecommendations':'The separately declared operative whole V4 P20 is complete for these selected goal competencies, although the native D page itself contains no authoritative evidence profile.','machineCandidateOnly':True,'reviewIdSameAsActualOriginalCampaign':True,'samplingParameters':'not exposed; no claim of an independent API call','peerReviewsRead':False})
p_source=rows(AUTHOR/'native-raster-candidate/P20.actual-raster-author.review.jsonl')
p_records=[]
for n,r0 in zip(notes,p_source):
 assert n['goalId']==r0['goalId']
 r=copy.deepcopy(r0)
 r['reviewId']='biologie-flora-fauna20-final-native-positive-independent-b-20261008-v1'
 r['reviewedAt']=now
 r['reviewer']='Codex independent B, actual whole-source and forty bilingual material/task/model-answer review plus eighty actual raster/native-page views'
 r['reviewRunIds']=[run_id]
 r['reason']=n['pScientificRationale']+' Eigener unabhängiger fachlicher Review am exakten endgültigen Raster-/Zielinput; Profilkörper unverändert beibehalten, weiterhin E1/G1 und needs_human_review/ai_candidate.'
 r['dissent'].append('Historische Autorvermerke bleiben vollständig erhalten. Dieser unabhängige B-Review wurde vor Peer-/Root-Fachbesprechung abgeschlossen; er liefert keine Human Approval, Human Trial, reale Durchführung oder Learner-Evidenz.')
 if n['visualizationDecision']=='HOLD':r['dissent'].append('V14 HOLD: '+n['vActualObservation']+' P20-Schema/Semantik und die fachlich richtigen Profilkörper sind keine Bildfreigabe.')
 p_records.append(r)
p_file=OWN/'P20.current-raster-independent-b.review.jsonl'
write_rows(p_file,p_records)
page_by_id={p['goalId']:p for p in entry['physicalGoalPages']}
native_book=read(AUTHOR/'native-raster-candidate/twenty/book-model.json')
native_pages={p['goalId']:p for p in native_book['pages']}
viewed=set(read(OWN/'eighty-actual-image-views.independent-b.json')['viewedPaths'])
v=[]
for n,img,p,dr in zip(notes,images,p_records,drecords):
 gid=n['goalId']
 captures=read(IMAGE/'inspection-captures'/gid/'chromium-captures.actual.json')
 page=page_by_id[gid]
 required=[img['path'],page['capture']['path']]+[x['path'] for x in captures['captures']]
 assert set(required)<=viewed
 assert captures['sourceSha256']==img['sha256']
 assert native_pages[gid]['visualization']['originalDigest']=='sha256:'+img['sha256']
 assert dr['pageFingerprint']==native_pages[gid]['pageFingerprint']
 v.append({'ordinal':n['ordinal'],'goalId':gid,'decision':n['visualizationDecision'],'status':n['visualizationStatus'],'actualFullImage':img,'actualWidthCaptures':captures['captures'],'actualNativePdfPage':page,'pageFingerprint':native_pages[gid]['pageFingerprint'],'goalFingerprint':dr['goalFingerprint'],'nativeDescriptionRecordId':dr['recordId'],'positiveProfileBinding':{'goalFingerprint':p['goalFingerprint'],'reviewInputFingerprint':p['reviewInputFingerprint'],'profileFingerprint':p['profileFingerprint']},'actualImageViewed':True,'actualBothWidthsViewed':True,'actualCompleteNativePageViewed':True,'scientificLabelArrowPerspectiveObservation':n['vActualObservation'],'widthReadabilityObservation':n['widthActualObservation'],'nativePageObservation':'Full public goal ID, complete description, chapter context, applicability matrix and direct/internal/external relation links fit on one actual complete native PDF page without clipping or collision. Review-only page, no production publication or host/device acceptance.','sourceSectionActuallyRead':n['sourceSection'],'independenceGroupId':campaign['independenceGroupId'],'peerAOutputsReadBeforeFirstSeal':False,'machineOnly':True,'humanApproval':False,'humanTrial':False})
write(OWN/'V20.actual-image-width-native-page.independent-b.json',{'schemaVersion':1,'role':'Genuine independent first image/native-page review B','authorInputSeal':bind(IMAGE/'final-flora-fauna20-raster-native-author-input.freeze.json'),'reviewedAt':now,'actualViews':80,'verdicts':v,'summary':{'KEEP_PASS':19,'HOLD':1,'openGoalIds':['321ea315-37fe-5f9e-8fa8-dd631bb447c7']},'activeWrites':0,'humanApproval':False})
write(OWN/'whole-primary-source-reading.independent-b.actual.json',{'recordedAt':now,'primarySource':{'url':'https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-06/g9-biologie.pdf','localIndependentDownloadSha256':'93257f9be96e9bd288d187eb63e3e33ca28debdb2511dcd068e9abf82bc5b5f1','localWorkingPath':'tmp/biologie-flora-final-b-20261008-source/g9-biologie.pdf','fullSelectedPhysicalPagesRead':[8,9,10,11,13,15,16,17,18]},'scope':'Whole original selected sections, not all German curricula, surrounding sibling goals or optional methods. Primary PDF is working cache, not copied full source text into review dossier.','sourceChoice':'6.2 expressly birds OR fish as the selected deeper class; both conditional fish alternatives separately fully read; no extra required common cases.','scientificBoundary':'Historical polar-bear-hair light-conductor example is not propagated. Real observation, seed/growth documentation and human performance remain distinct from synthetic models.','extraembryonicMembraneReference':{'url':'https://www.csun.edu/~vcbio001/chick.pdf','readPhysicalPage':10,'scope':'University original laboratory manual used only to confirm that the amnion encloses the embryo and must be distinguished from an outer membrane. No use of student tasks or proposed live-animal experiments.'},'secondaryFetchDiagnostics':['UNSW historical chick chapter fetch 403; NCBI Bookshelf direct open reCAPTCHA. Neither inaccessible full page claimed as read.'],'peerReviewsRead':False,'humanApproval':False})
for name in ['A20.current.native.config.json','M20.current-flower-deck-closure.native.config.json']:
 c=read(ORIGINAL/name);c['landscapePath']=str((AUTHOR/'candidate/canonical.current474-twenty-new-raster-author.json').relative_to(ROOT))
 write(OWN/name.replace('.current','.inactive-independent-b'),c)
print(json.dumps({'DRecords':20,'PProfiles':20,'VRecords':20,'actualViews':80,'keepPass':19,'VHold':1,'ownOutputDirectory':str(OWN.relative_to(ROOT))}))

