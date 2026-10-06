#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
import datetime, hashlib, json
from pathlib import Path
ROOT=Path('/home/enpasos/projects/skillpilot')
BASE=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06'
OWN=BASE/'chemie-q1-final378-independent-a-native-d-v1'
PREP=BASE/'chemie-q1-current378-routes-native-d-preparation-v1'
def load(p):return json.loads(p.read_text())
def sha(b):return 'sha256:'+hashlib.sha256(b).hexdigest()
prior={m['goalId']:m for m in load(OWN/'prior-a-only-record-selection.candidate.json')['matches']}
actual={m['goalId']:m for m in load(OWN/'independent-current53-native-bindings.actual.json')['currentPages']}
rationales=load(OWN/'current53-individual-a-rationales.json')
assert len(prior)==len(actual)==len(rationales)==53
assert not load(OWN/'independent-current53-native-bindings.actual.json')['errors']
started=datetime.datetime.fromtimestamp((OWN/'prior-a-only-record-selection.candidate.json').stat().st_mtime,datetime.timezone.utc).isoformat()
params={'execution':'interactive independent current page/context/source/binding review','samplingParameters':'not exposed to reviewer','scientificReuse':'explicitly authorized prior A only; identical goal/text/P/image science preserved','otherReviewerResultsRead':False,'generationProvider':'OpenAI','modelFamily':'Codex GPT-6 family'}
(OWN/'actual-review-method.json').write_text(json.dumps(params,ensure_ascii=False,indent=2)+'\n')
parameter_digest=sha(json.dumps(params,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode())
outputs=[]
for n in ['001','002','003']:
    round_dir=PREP/'native-current-d-batches'/('batch-'+n)/'round-a'
    campaign=load(round_dir/'description-review-campaign.json')
    bundle=load(round_dir/'review-bundle-manifest.json')
    inp=load(round_dir/'description-review-input.json')
    batch=campaign['batches'][0]
    run_id='codex-chemie-final378-current-d-independent-a-20261006-'+n
    records=[]
    for current in inp['goals']:
        i=current['goalId'];old=prior[i]['priorRecord'];binding=actual[i]
        assert old['decision']=='keep' and old['goalFingerprint']==current['goalFingerprint']
        assert binding['canonicalContextExact'] and binding['nativeFreshPageExact'] and binding['pComplete']
        assert not binding['pNativeErrors']
        rationale=('Gezielte aktuelle D-Seiten-/Kontext-/Quellen-/Bildbindungsprüfung mit tatsächlicher nativer PDF-Seitenansicht. '+rationales[i[:8]]+
          ' Wissenschaftlicher Kern: ausdrücklich gültige Wiederverwendung des früheren unabhängigen A-KEEP '+old['recordId']+
          '; DE/EN-Titel, DE/EN-Beschreibungen, wissenschaftlicher Goal-Fingerprint und vorhandene P-/Bild-Payloads unverändert. Die sechs positiven Verständnisangaben dieses Records sind aus diesem unveränderten A-Befund erhalten; dies ist keine neue vollständige wissenschaftliche Prüfung.'+
          ' Die aktuelle Seite und der kanonische Kontext wurden zusätzlich unabhängig mit unverändertem nativem Code neu erzeugt und exakt gebunden. Das tatsächlich bereitgestellte vollständige aktuelle P-Profil '+binding['pProfileFingerprint']+
          ' ist über Supplement sha256:cdd1510aba71032417448135a2159a95da9ecf822fda86253e1ec166de136356 gebunden; deshalb P-Empfehlung none trotz null im D-Bundle. Aktuelle B-Urteile nicht gelesen; KI-Kandidat, keine Human-Freigabe.')
        record={'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json','schemaVersion':1,'recordId':'chemie-final378-current-d-a-'+i[:8]+'-20261006','runId':run_id,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],'goalId':i,'goalFingerprint':current['goalFingerprint'],'pageFingerprint':current['pageFingerprint'],'currentTitleDe':current['currentTitleDe'],'currentTitleEn':current['currentTitleEn'],'currentDescriptionDe':current['currentDescriptionDe'],'currentDescriptionEn':current['currentDescriptionEn'],'decision':'keep','understandingEvidence':old['understandingEvidence'],'rationale':rationale,'evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':'none','recordStatus':'candidate','reviewAuthority':'ai_candidate'}
        for k in ['currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']:assert old[k]==record[k]
        records.append(record)
    result_dir=OWN/'native-current-d-results'/('batch-'+n)/'results';result_dir.mkdir(parents=True,exist_ok=True)
    record_path=result_dir/(batch['batchId']+'.records.jsonl')
    record_bytes=('\n'.join(json.dumps(r,ensure_ascii=False,separators=(',',':')) for r in records)+'\n').encode()
    record_path.write_bytes(record_bytes)
    artifact_roles=['book_pdf','book_pdf_render_manifest','book_html','book_model','review_input_json','review_prompt','review_criteria','run_manifest_schema']
    artifacts=[{'role':a['role'],'digest':a['digest']} for a in bundle['artifacts'] if a['role'] in artifact_roles]
    artifacts.append({'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']})
    run={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':run_id,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint'],'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],'provider':'OpenAI','model':'Codex GPT-6 family','role':'sequencing_representation_reviewer','promptFamilyId':'goal-description-understanding-evidence-review-v2','promptFingerprint':campaign['promptFingerprint'],'criteriaFingerprint':campaign['criteriaFingerprint'],'generationParametersFingerprint':parameter_digest,'independenceGroupId':campaign['independenceGroupId'],'blindToOtherRuns':True,'goalIds':batch['goalIds'],'inputArtifacts':artifacts,'startedAt':started,'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'completed','outputDigest':sha(record_bytes),'toolchainVersion':'native-goal-description-review-v2-current-context'}
    run_path=result_dir/(batch['batchId']+'.run.json');run_path.write_text(json.dumps(run,ensure_ascii=False,indent=2)+'\n')
    outputs.append({'batch':n,'campaignPath':str((round_dir/'description-review-campaign.json').relative_to(ROOT)),'resultsDirectory':str(result_dir.relative_to(ROOT)),'recordsPath':str(record_path.relative_to(ROOT)),'runPath':str(run_path.relative_to(ROOT)),'recordCount':len(records),'recordsDigest':sha(record_bytes),'runDigest':sha(run_path.read_bytes()),'decisions':{'keep':len(records)},'pRecommendations':{'none':len(records)}})
(OWN/'native-a-output-paths.json').write_text(json.dumps({'schemaVersion':1,'nativeRecordCount':sum(x['recordCount'] for x in outputs),'outputs':outputs,'scienceReuseExplicit':True,'currentBResultsRead':False,'activeWrites':False,'humanApproval':False},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'nativeRecords':sum(x['recordCount'] for x in outputs),'batchSizes':[x['recordCount'] for x in outputs]}))
