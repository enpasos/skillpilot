#!/usr/bin/env python3
import datetime, hashlib, json, pathlib, shutil

ROOT = pathlib.Path('/home/enpasos/projects/skillpilot')
DAY = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07'
AUTHOR = DAY / 'chemie-d2cc-memory-reverse-context-current-neutral-author-20261007-v1'
OWN = pathlib.Path(__file__).resolve().parent
ROUND = AUTHOR / 'native/one/round-a'
if (OWN / 'first-scientific-pass.seal.json').exists():
    raise SystemExit('Existing sealed first judgment is immutable.')
def read(p): return json.loads(p.read_text())
def digest(b): return 'sha256:' + hashlib.sha256(b).hexdigest()
def write(p,v):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
campaign=read(ROUND/'description-review-campaign.json')
bundle=read(ROUND/'review-bundle-manifest.json')
batch=campaign['batches'][0]
goal=read(ROUND/'description-review-input.json')['goals'][0]
native=OWN/'native-d-one'
shutil.copytree(ROUND,native)
(native/'results').mkdir()
started=datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00','Z')
run_id='chemie-d2cc-memory-context-independent-a-20261007-v1.run-001'
record={
 '$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json','schemaVersion':1,
 'recordId':run_id+'.d2cc','runId':run_id,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],
 'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],
 **{k:goal[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']},
 'decision':'keep',
 'understandingEvidence':{
  'essentialUnderstandingDe':'Die Einordnung einer Lösung folgt der Farbskala des tatsächlich verwendeten Indikators und bezieht sich auf grobe pH-Bereiche. Das Abrufen von Stoffnamen und Formeln ist eine nachfolgende, eigenständige Gedächtnisleistung.',
  'essentialUnderstandingEn':'Classification follows the colour scale of the indicator actually used and concerns broad pH ranges. Recalling substance names and formulas is a subsequent, separate memory competence.',
  'observablePerformanceDe':'Die lernende Person ordnet passende Beobachtungen anhand der gegebenen Indikatorskala als sauer, neutral oder alkalisch ein und begründet den groben pH-Bereich. Der neue Folgelink ändert diesen bestehenden Leistungsnachweis nicht.',
  'observablePerformanceEn':'The learner classifies suitable observations as acidic, neutral or alkaline using the supplied indicator scale and justifies the broad pH range. The new subsequent link does not alter this existing performance requirement.',
  'transferExpectationDe':'Die lernende Person verwendet auch bei einer anderen geeigneten Indikatorskala deren Zuordnung, statt feste Bildfarben oder Stoffnamen als Ersatz für die Beobachtung zu übernehmen. Dieser bestehende Transfer wird durch den Memory-Verweis nicht ersetzt.',
  'transferExpectationEn':'With another suitable indicator scale the learner uses that scale rather than replacing the observation with fixed picture colours or substance names. The memory link does not replace this existing transfer expectation.'
 },
 'rationale':'Gezielter aktueller Seiten-/Kontextpass: Der einzige semantisch neue Verweis nennt das Memory-Ziel 417e65ec korrekt als direkt aufbauendes Ziel. Dieses Ziel requires d2cc, während d2cc weiterhin allein die Lösungen-Grundlage voraussetzt. Tatsächliche PDF-Seite 3, vollständige DE/EN-Texte und neutraler Memory-Kontext wurden gelesen; die Seite zeigt den neuen Link ohne Überlagerung. Im vollständigen Buch ändern sich ausschließlich externalReverseRequires und pageFingerprint. Im nativen Einzielbuch sind bestehende Links erwartungsgemäß extern. Unveränderte Quellen, P-Körper und Bildsubstanz erhalten hier keinen neuen fachlichen Review; ihre bisherige Bewertung benötigt exakte Integrationsbindungen. Details und Scope-Grenzen: first-scientific-pass.md.',
 'evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':'none','recordStatus':'candidate','reviewAuthority':'ai_candidate'
}
records=native/'results'/ (batch['batchId']+'.records.jsonl')
records.write_text(json.dumps(record,ensure_ascii=False,separators=(',',':'))+'\n')
generation={'reviewer':'/root/bio_cqr003_independent_a','execution':'Independent Codex subagent, targeted context follow-up','samplingParameters':'not exposed by session','blindFirstPass':True,'historicalScienceRestudied':False}
write(OWN/'generation-parameters.declared.json',generation)
artifacts=[{k:a[k] for k in ['role','digest']} for a in bundle['artifacts'] if a['role'] in {'book_pdf','book_model','review_prompt','review_criteria'}]
artifacts.append({'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']})
run={
 '$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,
 'runId':run_id,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint'],
 'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],'provider':'OpenAI','model':'GPT-6 Codex; session-exposed agent identity','role':'subject_reviewer',
 'promptFamilyId':'goal-description-understanding-evidence-v2','promptFingerprint':campaign['promptFingerprint'],'criteriaFingerprint':campaign['criteriaFingerprint'],
 'generationParametersFingerprint':digest((OWN/'generation-parameters.declared.json').read_bytes()),'independenceGroupId':campaign['independenceGroupId'],'blindToOtherRuns':True,
 'goalIds':batch['goalIds'],'inputArtifacts':artifacts,'startedAt':started,'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00','Z'),
 'status':'completed','outputDigest':digest(records.read_bytes()),'toolchainVersion':'independent-codex-current-native-review-v1'
}
runpath=native/'results'/ (batch['batchId']+'.run.json');write(runpath,run)
context={
 'goalId':goal['goalId'],'goalFingerprint':goal['goalFingerprint'],'nativeOneGoalPageFingerprint':goal['pageFingerprint'],
 'fullBookCurrentPageFingerprint':'sha256:86992d152979bc5a932c796bdaee78f6d1b2055a2d8d9b4c0a38c1f9b9cea352',
 'decision':'keep_existing_closure_for_exact_current_reverse_link_context','addedDependentGoalId':'417e65ec-68be-5f2e-9452-c3ba9b1d362f',
 'actualPDFPhysicalPage':3,'actualPDFRasterViewed':True,'scope':'Only the new reverse prerequisite relationship and actual current page/context; no historical science, source, P-body, image or memory-card restudy.',
 'evidenceProfileRecommendation':'none','reviewAuthority':'ai_candidate','evidenceLevel':'E1','maximumClaimScope':'G1','humanApproval':False,'humanTrial':False,'activeWrites':0,'strictGain':0
}
contextpath=OWN/'targeted-current-context.ai-candidate.json';write(contextpath,context)
(OWN/'inspection-captures').mkdir()
shutil.copyfile('/tmp/skillpilot-d2cc-independent-a-actual-pdf-page3.png',OWN/'inspection-captures/actual-pdf-physical3.png')
payloads=[OWN/'first-scientific-pass.md',records,runpath,contextpath,OWN/'inspection-captures/actual-pdf-physical3.png']
write(OWN/'first-scientific-pass.seal.json',{
 'schemaVersion':1,'reviewer':'/root/bio_cqr003_independent_a','blindToOtherChemieABRootVerdicts':True,'sealedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'authorFreezeSha256':hashlib.sha256((AUTHOR/'author.final.freeze.json').read_bytes()).hexdigest(),
 'payloads':[{'path':str(p.relative_to(OWN)),'digest':digest(p.read_bytes()),'bytes':p.stat().st_size} for p in payloads],
 'reviewAuthority':'ai_candidate','evidenceLevel':'E1','maximumClaimScope':'G1','humanApproval':False,'humanTrial':False,'activeWrites':0,'strictGain':0,
 'note':'Independent targeted context judgment sealed before peer verdicts. Native startedAt records output materialization after independent input and page inspection.'
})
print('Sealed independent targeted D1 KEEP with completed raw native run.')
