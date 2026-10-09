# SPDX-License-Identifier: Apache-2.0
"""Record independent B's real two-goal judgment after its immutable science-FIRST."""
from pathlib import Path
import datetime, hashlib, json, shutil, subprocess, tempfile, time
R = Path.cwd()
B = Path(__file__).resolve().parent
BP = B.relative_to(R).as_posix()
A = B.parent / 'biologie-82ac-nine-lower-jurisdictions-and-SN-ST-digital-prerequisite-source-author-v1'
AP = A.relative_to(R).as_posix()
def read(p): return json.loads(p.read_text())
def sha(p): return 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()
def put(name, value):
    p = B / name; p.parent.mkdir(parents=True, exist_ok=True); assert not p.exists(), p
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n'); return p
def terminal(label, args, cwd=R):
    start = time.monotonic(); at = datetime.datetime.now(datetime.timezone.utc).isoformat()
    result = subprocess.run(args, cwd=cwd, capture_output=True, text=True)
    obj = {'schemaVersion': 1, 'license': 'CC-BY-4.0', 'actualArgv': args,
           'actualCwdDiagnosticOnly': str(cwd), 'startedAt': at, 'elapsedSeconds': time.monotonic()-start,
           'exitCode': result.returncode, 'stdout': result.stdout, 'stderr': result.stderr,
           'scientificFIRSTAlreadyFrozen': True, 'humanApproval': False, 'strictGain': 0, 'activeWrites': 0}
    put('terminal/' + label + '.actual.json', obj)
    print(json.dumps({'label': label, 'exitCode': result.returncode, 'elapsedSeconds': obj['elapsedSeconds']}), flush=True)
    assert result.returncode == 0, obj
    return obj
first = read(B/'two-goal-source-prerequisite-native.independent-b.science-FIRST.freeze.json')
for row in first['bindings']:
    p = R / row['path']; assert p.is_file() and sha(p) == row['sha256'], p
campaign = read(A/'native/actual-two/round-b/description-review-campaign.json')
put('ordinary-D2/campaign.unchanged-neutral-template.json', campaign)
input_obj = read(A/'native/actual-two/round-b/description-review-input.json')
run_id = 'bio82ac328fd-source-prerequisite-native-independent-b-20261009-v1'
evidence = [
 {'essentialUnderstandingDe':'Eine prüfbare Hypothese wird in einer geplanten, durchgeführten und protokollierten Untersuchung mit begründeten Vergleichsbedingungen und Variablenkontrolle geprüft; Beobachtung, Modell und kausale Schlussfolgerung bleiben getrennt.',
  'essentialUnderstandingEn':'A testable hypothesis is examined through a planned, conducted and recorded investigation with justified comparisons and variable controls; observation, model and causal inference remain distinct.',
  'observablePerformanceDe':'Die lernende Person bestimmt Hypothese, abhängige und unabhängige Größen sowie Kontrollen, führt die sichere Untersuchung oder die vorgegebene Modellierung aus, protokolliert Bedingungen und Rohdaten und begründet die begrenzte Auswertung.',
  'observablePerformanceEn':'The learner specifies a hypothesis, dependent and independent variables and controls, performs the safe investigation or provided modelling, records conditions and raw data and justifies a bounded evaluation.',
  'transferExpectationDe':'Bei einer veränderten Temperatur oder einem veränderten Lichtangebot erkennt die lernende Person die zusätzliche Variable, passt Untersuchung und Kontrolle begründet an und behauptet keine isolierte Ursache aus einem unkontrollierten Vergleich.',
  'transferExpectationEn':'With changed temperature or light the learner identifies the additional variable, justifiably adjusts investigation and control and does not infer an isolated cause from an uncontrolled comparison.'},
 {'essentialUnderstandingDe':'Qualitative Kategorien und quantitative Messwerte brauchen nachvollziehbare Rohdaten, Einheiten, Zeitangaben und Untersuchungseinheiten; digitale Darstellung ersetzt weder Datenqualität noch biologische Interpretation.',
  'essentialUnderstandingEn':'Qualitative categories and quantitative measurements need traceable raw data, units, times and observational units; digital presentation replaces neither data quality nor biological interpretation.',
  'observablePerformanceDe':'Die lernende Person erfasst die vorgegebenen Beobachtungskarten selbst in einer strukturierten digitalen Tabelle, prüft fehlende und doppelte Werte, berechnet passende Kennwerte, wählt eine geeignete Darstellung und begründet eine begrenzte biologische Deutung.',
  'observablePerformanceEn':'The learner records the provided observation cards in a structured digital table, checks missing and duplicate values, calculates appropriate summaries, selects a suitable representation and justifies a bounded biological interpretation.',
  'transferExpectationDe':'Bei einem als Text fehlinterpretierten Temperaturwert oder einem doppelten Samen-Datensatz findet und dokumentiert die lernende Person den Fehler, korrigiert den nachvollziehbaren Datenweg und erklärt die veränderte Auswertung ohne erfundene Messung oder Kausalität.',
  'transferExpectationEn':'For a temperature value misread as text or a duplicate seed record the learner identifies and records the error, corrects the traceable data path and explains the changed evaluation without inventing a measurement or causality.'}
]
rationales = [
 'Own genuine immutable science-FIRST reads whole nine regional operator/primary frames, actual BB/BE18-21 and NI76 locator successors, preserved whole P2 materials and both actual new HTML/PDF pages before author checks or peer judgments. Actual nine lower cumulative controlled-investigation operators support the scoped competency despite canonical SekII compatibility tags. The exact SN/ST direct target exclusion remains supported; only the reverse digital-data prerequisite changed on this native page. Entire current DE/EN description is clear and equivalent; image and protocol perspective fit; no new atomicity or memory decision is invented. Whole35/30 evolutionary-course closure, Hox/parent/RP and unrelated full partner reviews remain open. P2 E1/G1 remains needs_human_review/ai_candidate.',
 'Own genuine immutable science-FIRST reads whole digital-data description, four preserved bilingual practical cases, actual SN digital measurements and ST digital recording/evaluation/graphs and the actual new whole HTML/PDF page. Safe prescribed observation or raw-card collection and digital evaluation do not universally require independent planning of the whole82ac controlled inquiry/model cycle. Removing only that requires edge preserves orientation and data-quality duties. Complete current DE/EN text and qualitative/quantitative image are clear and equivalent. This targeted source/prerequisite/page assurance preserves unchanged historical evidence and does not fabricate human work, a wet experiment, full course coverage or a new subject completion.'
]
records=[]
for g, ev, why in zip(input_obj['goals'], evidence, rationales):
    record={'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json','schemaVersion':1,'recordId':run_id+'.'+g['goalId'],'runId':run_id,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],'goalId':g['goalId'],'goalFingerprint':g['goalFingerprint'],'pageFingerprint':g['pageFingerprint']}
    for key in ['currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']: record[key]=g[key]
    record.update({'decision':'keep','understandingEvidence':ev,'rationale':why,'evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':'none','recordStatus':'candidate','reviewAuthority':'ai_candidate'})
    records.append(record)
out=B/'ordinary-D2/description-records.independent-b.jsonl';assert not out.exists();out.write_text(''.join(json.dumps(x,ensure_ascii=False)+'\n' for x in records))
batch=campaign['batches'][0]
run={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':run_id,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint'],'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],'provider':'OpenAI','model':'GPT-6 Codex; runtime sampling parameters not exposed','role':'subject_reviewer','promptFamilyId':'goal-description-review-v1','promptFingerprint':campaign['promptFingerprint'],'criteriaFingerprint':campaign['criteriaFingerprint'],'generationParametersFingerprint':'sha256:'+hashlib.sha256(b'Independent B; targeted successor with prior own findings disclosed; runtime sampling parameters unavailable').hexdigest(),'independenceGroupId':campaign['independenceGroupId'],'blindToOtherRuns':True,'goalIds':batch['goalIds'],'inputArtifacts':[{'role':role,'digest':sha(A/path)} for role,path in [('book_model','native/actual-two/book-model.json'),('book_pdf','native/actual-two/book.pdf'),('book_html','native/actual-two/book.html'),('review_prompt','native/actual-two/round-b/prompt.md'),('review_criteria','native/actual-two/round-b/criteria.md'),('description_review_batch_input_jsonl','native/actual-two/round-b/batches/'+batch['batchId']+'.input.jsonl')]],'startedAt':first['recordedAt'],'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'completed','outputDigest':sha(out),'toolchainVersion':'genuine-independent-b-whole-two-source-prerequisite-native-science-FIRST-20261009'}
put('ordinary-D2/run.independent-b.json',run)
tsx=str(R/'app/node_modules/.bin/tsx')
terminal('ordinary-D2',[tsx,'app/scripts/validateGoalDescriptionReviewCampaign.ts','--bundle',AP+'/native/actual-two/bundle/review-bundle-manifest.json','--input',AP+'/native/actual-two/round-b/description-review-input.json','--campaign',BP+'/ordinary-D2/campaign.unchanged-neutral-template.json','--run',BP+'/ordinary-D2/run.independent-b.json','--batch-input',AP+'/native/actual-two/round-b/batches/'+batch['batchId']+'.input.jsonl','--records',BP+'/ordinary-D2/description-records.independent-b.jsonl'])
# Own judgments and exact preserved profiles, materialized with the unmodified normal P2 CLI.
candidate=read(A/'positive/P2-whole-original-material.candidate.json')
candidate['reviewId']='biologie-two-source-prerequisite-native-independent-b-v1'
candidate['reviewedAt']=datetime.datetime.now(datetime.timezone.utc).isoformat()
candidate['reviewer']='OpenAI GPT-6 Codex independent B; genuine whole source/material/native FIRST sealed'
for row in candidate['goals']:
    row['reason']='Genuine independent B read the whole unchanged bilingual profile and both finite operational cases, independently calculated the data and assessed their altered prerequisite/source/native context. Current exact profile retained, E1/G1 ai_candidate/needs_human_review; no actual learner, wet experiment or human approval. Own scientific FIRST is bound in the final entry.'
put('ordinary-P2/whole-preserved-material.independent-b.candidates.json',candidate)
cfg=read(A/'positive/P2-final-normal-current-author.config.json')
cfg['reviewId']=candidate['reviewId'];cfg['reviewPath']=BP+'/ordinary-P2/whole-current.independent-b.review.jsonl'
cfg['scope']['label']='Own genuine two-goal source/prerequisite/native follow-up; whole old materials preserved with truthful E1/G1 status.'
put('ordinary-P2/whole-current.independent-b.config.json',cfg)
cap=Path(tempfile.mkdtemp(prefix='skillpilot-bio82ac328fd-P2-independent-b-'))
def copy(p):
    dst=cap/p;dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(R/p,dst)
for p in [BP+'/ordinary-P2/whole-current.independent-b.config.json',BP+'/ordinary-P2/whole-preserved-material.independent-b.candidates.json',cfg['landscapePath'],cfg['semanticKindLedgerPath'],cfg['reviewCriteriaPath']]:copy(p)
for name in ['materializePositiveGoalEvidenceCandidates.ts','positiveGoalEvidenceReview.ts','positiveGoalEvidenceProfileModel.ts','goalEvidenceProfileModel.ts']:copy('app/scripts/'+name)
for name in ['goal-evidence-profile.schema.json','goal-evidence-review-config.schema.json']:copy('contracts/goal-evidence/v2/'+name)
copy('contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json')
for gid in cfg['scope']['goalIds']:copy(f'app/public/assets/goal-visualizations/biologie/{gid}/{gid}.png')
(cap/'app/node_modules').symlink_to(R/'app/node_modules',target_is_directory=True)
terminal('ordinary-P2-materializer',[tsx,'app/scripts/materializePositiveGoalEvidenceCandidates.ts','--config',BP+'/ordinary-P2/whole-current.independent-b.config.json','--candidates',BP+'/ordinary-P2/whole-preserved-material.independent-b.candidates.json','--write'],cap)
terminal('ordinary-P2-review',[tsx,'app/scripts/positiveGoalEvidenceReview.ts','--config='+BP+'/ordinary-P2/whole-current.independent-b.config.json','--mode=check'],cap)
shutil.copy2(cap/cfg['reviewPath'],B/'ordinary-P2/whole-current.independent-b.review.jsonl')
old=read(A/'inputs/whole-two-current-valid-P-profiles.exact.json')
now=[json.loads(x) for x in (B/'ordinary-P2/whole-current.independent-b.review.jsonl').read_text().splitlines() if x.strip()]
for before,after in zip(old,now):
    assert before['goalId']==after['goalId'] and before['profile']==after['profile']
    assert after['status']=='needs_human_review' and after['reviewAuthority']=='ai_candidate' and after['evidenceLevel']=='E1' and after['maximumClaimScope']=='G1'
put('ordinary-P2/exact-whole-profile-preservation-and-current-bindings.actual.json',{'schemaVersion':1,'license':'CC-BY-4.0','wholeOriginalProfilesExact':True,'currentRecords':now,'oldRecords':old,'newMaterialBodies':0,'strictGain':0,'humanApproval':False,'capsuleDiagnosticOnly':str(cap),'allOperativeReviewOutputsCopiedIntoPortableOwnFolder':True})
