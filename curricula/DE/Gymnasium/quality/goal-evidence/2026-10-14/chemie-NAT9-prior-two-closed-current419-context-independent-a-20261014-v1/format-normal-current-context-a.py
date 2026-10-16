#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Format already sealed scientific decisions without changing their content."""
from pathlib import Path
from datetime import datetime,timezone
import json,hashlib
O=Path(__file__).resolve().parent;R=O.parent/'chemie-NAT9-prior-two-closed-current419-context-impact-preparation-technical-20261014-v1';A=R/'native-two-current/round-a'
def load(p):return json.loads(p.read_text())
def sha(b):return 'sha256:'+hashlib.sha256(b).hexdigest()
F=load(O/'FIRST.two-current-context-independent-a.science.json');S=load(O/'FIRST.two-current-context-independent-a.science.seal.json')
assert sha((O/S['firstOutcomeFile']).read_bytes())==S['sha256']
C=load(A/'description-review-campaign.json');M=load(A/'review-bundle-manifest.json');I=load(O/'INPUTS.actual-read-inventory.independent-a.json')
batch=C['batches'][0]
B=[json.loads(l) for l in (A/'batches'/f"{batch['batchId']}.input.jsonl").read_text().splitlines()]
runid='chemie-NAT9-prior-two-closed-current419-current-context-independent-a-20261014-v1'
rows=[]
for b,f in zip(B,F['decisions']):
 g=b['goal'];assert g['goalId']==f['goalId']
 row={'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json','schemaVersion':1,'recordId':runid+'.'+g['goalId'],'runId':runid,'campaignId':C['campaignId'],'roundId':C['roundId'],'bundleFingerprint':b['bundleFingerprint'],'bookDigest':b['bookDigest'],'goalId':g['goalId'],'goalFingerprint':g['goalFingerprint'],'pageFingerprint':g['pageFingerprint'],**{k:g[k] for k in ['currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']},'decision':f['decision'],'understandingEvidence':f['understandingEvidence'],'rationale':'Unabhängige gezielte Bestätigung des aktuellen D-Seiten-/Kontexts, nicht erneutes Gesamturteil über unveränderte P/A/M/V- oder Source-/Kursnachweise. '+f['currentContextReason']+' Keine neue P-Änderung durch den Kontextwechsel erforderlich; vorhandene V2-Materialien bleiben separat gebunden. Keine Lernendenausführung oder menschliche Freigabe behauptet.','evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':f['evidenceProfileRecommendation'],'recordStatus':'candidate','reviewAuthority':'ai_candidate'}
 rows.append(row)
out=A/'results';out.mkdir(exist_ok=True)
base=batch['batchId'];rec=out/f'{base}.records.jsonl';rec.write_text(''.join(json.dumps(x,ensure_ascii=False,separators=(',',':'))+'\n' for x in rows))
parameters={'source':'inherited active model/session','modelIdentityReported':'GPT-6 (Codex); exact hosted model revision not exposed','samplingParameters':'not exposed; no temperature/top_p/reasoning override was set by this reviewer','independence':'one actual independent current D2 A only; no current D2 B outcome read; historical D4 selected resolution outcomes embedded in supplied delta matrix were exposed and are disclosed; no historical blindness claim','scope':'current native D page/context only; preserve separately integrated unchanged science/P/A/M/V'}
(O/'generation-parameters.actual-disclosure.json').write_text(json.dumps(parameters,ensure_ascii=False,indent=2)+'\n')
roles=['book_model','book_pdf','book_html','review_prompt','review_criteria']
arts=[{'role':a['role'],'digest':a['digest']} for a in M['artifacts'] if a['role'] in roles]
arts.append({'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']})
run={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':runid,'campaignId':C['campaignId'],'roundId':C['roundId'],'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint'],'bundleFingerprint':C['bundleFingerprint'],'bookDigest':C['bookDigest'],'provider':'OpenAI','model':'GPT-6 (Codex; exact hosted revision not exposed)','role':'sequencing_representation_reviewer','promptFamilyId':'goal-description-understanding-evidence-review-v2','promptFingerprint':C['promptFingerprint'],'criteriaFingerprint':C['criteriaFingerprint'],'generationParametersFingerprint':sha((O/'generation-parameters.actual-disclosure.json').read_bytes()),'independenceGroupId':C['independenceGroupId'],'blindToOtherRuns':True,'goalIds':batch['goalIds'],'inputArtifacts':arts,'startedAt':I['runPreparationCheckpointUTC'],'completedAt':datetime.now(timezone.utc).isoformat(),'status':'completed','outputDigest':sha(rec.read_bytes()),'toolchainVersion':'skillpilot-native-goal-description-v2-current-context-review-20261014'}
(out/f'{base}.run.json').write_text(json.dumps(run,ensure_ascii=False,indent=2)+'\n')
(O/'normal-output-files.actual.json').write_text(json.dumps({'scope':'current D context only','firstScienceSeal':S,'normalRecords':{'path':str(rec),'sha256':sha(rec.read_bytes()),'bytes':rec.stat().st_size},'normalRun':{'path':str(out/f'{base}.run.json'),'sha256':sha((out/f'{base}.run.json').read_bytes())},'formattingOnly':True,'newScienceChangesAfterFirstSeal':False},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'records':len(rows),'decisions':[x['decision'] for x in rows],'recordOutputDigest':run['outputDigest'],'resultsDirectoryFiles':[p.name for p in out.iterdir()]}))
