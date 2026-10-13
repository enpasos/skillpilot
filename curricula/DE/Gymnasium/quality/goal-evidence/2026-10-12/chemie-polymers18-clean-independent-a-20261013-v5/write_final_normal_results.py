import json,pathlib,hashlib,sys,datetime
out=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-polymers18-clean-independent-a-20261013-v5')
# This formatter fails until the reviewer supplies the final manual vote file after native sight.
manual=json.loads((out/'FINAL.manual18.after-native-sight.json').read_text())
assert manual['rootFinalNativeFreezeConfirmed'] is True
assert manual['all18FinalNativePagesPersonallySeen'] is True
assert manual['all54ActualImageCssInstancesPersonallySeen'] is True
assert manual['blindToOtherRuns'] is True
bundlepath,inputpath,campaignpath,batchespath=map(pathlib.Path,sys.argv[1:5])
bundle=json.loads(bundlepath.read_text());inp=json.loads(inputpath.read_text());camp=json.loads(campaignpath.read_text()); notes={r['goalId']:r for r in json.loads((out/'own-scientific-preliminary18.json').read_text())['records']};votes={r['goalId']:r for r in manual['records']}; goals={r['goalId']:r for r in inp['goals']}
assert set(notes)==set(votes)==set(goals)
assert len(goals)==18 and manual['nativeBundleFingerprint']==bundle['bundleFingerprint']
assert all(v['D']=='keep' and v['P']=='retain_ai_candidate' and v['A']=='atomic' and v['M']=='no_memory_needed' and v['V']=='approve_ai' for v in votes.values())
results=out/'results';results.mkdir(exist_ok=True)
def sha(x):return 'sha256:'+hashlib.sha256(x).hexdigest()
completed=datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00','Z')
for bi,b in enumerate(camp['batches']):
 runid='chemie-polymers18-clean-independent-a-v5-'+str(bi+1)
 records=[]
 for gid in b['goalIds']:
  g=goals[gid];n=notes[gid]
  r={'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json','schemaVersion':1,'recordId':runid+':'+gid,'runId':runid,'campaignId':camp['campaignId'],'roundId':camp['roundId'],'bundleFingerprint':bundle['bundleFingerprint'],'bookDigest':bundle['bookModelDigest'],'goalId':gid,'goalFingerprint':g['goalFingerprint'],'pageFingerprint':g['pageFingerprint'],'currentTitleDe':g['currentTitleDe'],'currentTitleEn':g['currentTitleEn'],'currentDescriptionDe':g['currentDescriptionDe'],'currentDescriptionEn':g['currentDescriptionEn'],'decision':'keep','understandingEvidence':n['ownUnderstandingEvidence'],'rationale':n['ownAtomicityReasonDe']+' '+n['ownScientificObservationDe']+' Vollständiger zweisprachiger Ziel-/P-/Aufgaben-/Rubrikvergleich und eigene Sicht der finalen nativen Seite sowie des tatsächlichen Bilds bei 360, 316 und 680 px. Die Stimme bezieht sich auf das aktuelle kanonische Ziel; breitere Quellen-, Partner- und Experimentpflichten werden durch Papierfälle nicht als vollständig erfüllt behauptet.','evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':'none','recordStatus':'candidate','reviewAuthority':'ai_candidate'}
  records.append(r)
 data=('\n'.join(json.dumps(r,ensure_ascii=False,separators=(',',':')) for r in records)+'\n').encode();rp=results/(b['batchId']+'.records.jsonl');rp.write_bytes(data)
 artifacts=[{'role':a['role'],'digest':a['digest']} for a in bundle['artifacts'] if a['role'] in {'review_prompt','review_criteria','book_pdf','book_pdf_render_manifest','book_html','book_html_render_manifest','book_model','review_input_json','review_input_jsonl','review_markdown','finding_schema','run_manifest_schema'}]
 assert len({a['role'] for a in artifacts})==len(artifacts)
 artifacts.append({'role':'description_review_batch_input_jsonl','digest':b['batchInputFingerprint']})
 batchfile=batchespath/(b['batchId']+'.input.jsonl');assert sha(batchfile.read_bytes())==b['batchInputFingerprint']
 run={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':runid,'campaignId':camp['campaignId'],'roundId':camp['roundId'],'batchId':b['batchId'],'batchInputFingerprint':b['batchInputFingerprint'],'bundleFingerprint':bundle['bundleFingerprint'],'bookDigest':bundle['bookModelDigest'],'provider':'OpenAI','model':'GPT-6 / Codex; exact runtime model identifier not exposed','role':'subject_reviewer','promptFamilyId':'positive-understanding-evidence-v2','promptFingerprint':bundle['promptFingerprint'],'criteriaFingerprint':bundle['criteriaFingerprint'],'generationParametersFingerprint':sha(json.dumps({'agentRole':'genuinely independent A','candidateAuthor':False,'generationParameters':'inherited runtime parameters not exposed','manualFinalVoteBinding':sha((out/'FINAL.manual18.after-native-sight.json').read_bytes())},sort_keys=True,separators=(',',':')).encode()),'independenceGroupId':camp['independenceGroupId'],'blindToOtherRuns':True,'goalIds':b['goalIds'],'inputArtifacts':artifacts,'startedAt':manual['finalNativePassStartedAtUTC'],'completedAt':completed,'status':'completed','outputDigest':sha(data),'toolchainVersion':'skillpilot-goal-description-review-v2'}
 (results/(b['batchId']+'.run.json')).write_text(json.dumps(run,ensure_ascii=False,indent=2)+'\n')
print('Normal candidate results formatted:',len(goals),'batches:',len(camp['batches']))
