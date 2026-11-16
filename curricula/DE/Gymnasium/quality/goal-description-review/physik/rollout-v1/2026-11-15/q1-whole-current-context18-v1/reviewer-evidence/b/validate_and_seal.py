from pathlib import Path
import json,hashlib,datetime
from collections import Counter
import jsonschema
out=Path('tmp/physics-current18-fresh-b-20261115')
base=Path('tmp/physics-release840-20261115/final18')
rounddir=base/'eighteen-native-d/round-b'
now=lambda:datetime.datetime.now(datetime.timezone.utc).isoformat()
digest=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
read=lambda p:json.loads(p.read_text())
rows=[json.loads(x) for x in (out/'records.jsonl').read_text().splitlines()]
batch=[json.loads(x) for x in (rounddir/'batches/independent-b.batch-001.input.jsonl').read_text().splitlines()]
schema=read(rounddir/'contracts/goal-description-review-record.schema.json')
campaign=read(rounddir/'description-review-campaign.json')
input_document=read(rounddir/'description-review-input.json')
manifest=read(base/'eighteen-review-bundle/manifest.json')
model=read(base/'eighteen-review-bundle/book-model.json')
native=read(base/'eighteen-review-bundle/review-input.json')
before=read(out/'input-pins.before.json')
errors=[]
checks={}
def check(name,value):
 checks[name]=bool(value)
 if not value:errors.append(name)
jsonschema.Draft202012Validator.check_schema(schema)
validator=jsonschema.Draft202012Validator(schema)
schema_errors=[]
for n,row in enumerate(rows,1):
 for error in validator.iter_errors(row):schema_errors.append({'line':n,'path':list(error.path),'message':error.message})
check('schema_valid_18_records',len(rows)==18 and not schema_errors)
check('assigned_order',len(batch)==18 and [r['goalId'] for r in rows]==campaign['batches'][0]['goalIds']==[b['goal']['goalId'] for b in batch])
check('one_per_goal',len(set(r['goalId'] for r in rows))==18)
check('candidate_authority_only',all(r['recordStatus']=='candidate' and r['reviewAuthority']=='ai_candidate' for r in rows))
check('run_id_is_locally_assigned',all(r['runId']=='physics-current18-fresh-b-20261115' for r in rows) and 'runId' not in campaign and all('runId' not in b for b in batch))
check('unique_record_ids',len(set(r['recordId'] for r in rows))==18)
check('exact_current_bilingual_titles_and_descriptions',all(all(r[k]==b['goal'][k] for k in ['currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']) for r,b in zip(rows,batch)))
check('exact_goal_and_page_fingerprints',all(all(r[k]==b['goal'][k] for k in ['goalId','goalFingerprint','pageFingerprint']) for r,b in zip(rows,batch)))
check('exact_campaign_and_round',all(r['campaignId']==campaign['campaignId'] and r['roundId']==campaign['roundId'] for r in rows))
check('exact_bundle_binding',all(r['bundleFingerprint']==b['bundleFingerprint']==campaign['bundleFingerprint']==manifest['bundleFingerprint']==input_document['bundleFingerprint']=='sha256:498a44c36c5cf5c61510c3035431bda2d00b782e52d2418a8bedbd3b89d8b0d1' for r,b in zip(rows,batch)))
check('exact_book_binding',all(r['bookDigest']==b['bookDigest']==campaign['bookDigest']==manifest['bookModelDigest']==model['digest']==native['modelDigest']==input_document['bookDigest']=='sha256:4f3574884388f69f068d4f516bbfc32a5c2fd19f4d244def23b0f81822209e5e' for r,b in zip(rows,batch)))
check('review_input_binding',all(b['reviewInputFingerprint']==campaign['reviewInputFingerprint']==input_document['reviewInputFingerprint'] for b in batch))
check('supplied_batch_raw_digest',digest(rounddir/'batches/independent-b.batch-001.input.jsonl')==campaign['batches'][0]['batchInputFingerprint'])
check('bound_schema_raw_digest',digest(rounddir/'contracts/goal-description-review-record.schema.json')==campaign['recordSchemaDigest']==campaign['batches'][0]['recordSchemaDigest'] and all(b['recordSchemaDigest']==campaign['recordSchemaDigest'] for b in batch))
check('bound_prompt_raw_digest',digest(rounddir/'prompt.md')==campaign['promptFingerprint']==manifest['promptFingerprint'])
check('bound_criteria_raw_digest',digest(rounddir/'criteria.md')==campaign['criteriaFingerprint']==manifest['criteriaFingerprint'])
check('batch_equals_supplied_description_input_goals',all(b['goal']==g for b,g in zip(batch,input_document['goals'])))
check('native_page_and_profile_context_exact',all(b['goal']['reviewContext']==p for b,p in zip(batch,native['pages'])))
check('book_model_page_context_exact',all(b['goal']['reviewContext']['page']==p for b,p in zip(batch,model['pages'])))
check('manifest_goal_bindings',all(all(b['goal'][k]==m[k] for k in ['goalId','goalFingerprint','pageFingerprint']) for b,m in zip(batch,manifest['goals'])))
check('replacements_only_for_revise',all(('proposedDescriptionDe' in r)==('proposedDescriptionEn' in r)==(r['decision']=='revise') for r in rows))
check('v2_profile_contract',all(r['evidenceProfileContract']=='positive-understanding-evidence-v2' for r in rows))
check('all_six_evidence_fields_present',all(len(r['understandingEvidence'])==6 and all(isinstance(v,str) and v.strip() for v in r['understandingEvidence'].values()) for r in rows))
check('rendered_20_physical_pages',len(list(out.glob('pdf-page-*.png')))==20)
after_pins=[]
for p in before['pins']:
 f=Path(p['path']);actual={'path':p['path'],'sha256':digest(f),'bytes':f.stat().st_size};after_pins.append(actual)
check('all_48_allowed_inputs_unchanged',len(after_pins)==48 and after_pins==before['pins'])
check('input_seal_raw_sha256',digest(base/'eighteen-D-input-seal.actual.json')=='sha256:1f9423954abc22c1524aabf89f28983a9290232b4f3563f0535d2046c351c757')
check('no_prohibited_round_a_pin',all('/round-a/' not in p['path'] for p in before['pins']))
(out/'input-pins.after.json').write_text(json.dumps({'pinnedAt':now(),'meaning':'After independently authored content review and native binding validation; all allowed input bytes unchanged.','pins':after_pins},ensure_ascii=False,indent=2)+'\n')
validation={'validatedAt':now(),'validator':'Python jsonschema Draft202012Validator against exact supplied bound record schema','schemaPackageVersion':__import__('importlib.metadata',fromlist=['version']).version('jsonschema'),'passed':not errors,'recordCount':len(rows),'checks':checks,'schemaErrors':schema_errors,'bindingErrors':errors,'decisions':dict(Counter(r['decision'] for r in rows)),'profileRecommendations':dict(Counter(r['evidenceProfileRecommendation'] for r in rows)),'fingerprintPolicy':'Existing supplied fingerprint strings copied exactly; no fingerprint write or content rebind. Raw hashes independently verified only where the campaign explicitly supplies raw digest bindings.','visualInspection':'Actual view_image observations are recorded in review-explanation.md and receipt.json; file existence is not a visibility test.'}
(out/'validation.json').write_text(json.dumps(validation,ensure_ascii=False,indent=2)+'\n')
if errors:print(json.dumps(validation,ensure_ascii=False,indent=2));raise SystemExit(1)
receipt={'agentTask':'/root/physics_eighteen_fresh_b','reviewer':'Fresh independent Physics goal-description reviewer B','runId':'physics-current18-fresh-b-20261115','runIdAssignment':'Locally assigned explicitly for this execution; not preassigned by the supplied campaign.','campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'independenceGroupId':campaign['independenceGroupId'],'reviewPass':'first_pass','eligibility':{'eligible':True,'blindToOtherDescriptionReviews':True,'priorDescriptionVotesOrAdjudicationsDiscovered':False,'priorRoundOrCanonicalDiffRead':False,'otherRoundInputsOpenedOrHashed':False,'currentPProfilesReadAsCandidatesOnly':True,'explanation':'Only assigned round-b and allowed native/material/illustration roots were used for review, together with the explicitly requested root AGENTS.md. An initial filename-only AGENTS search listed unrelated QA paths but opened no file there and exposed no votes. Root AGENTS has general historical policy. Supplied current P candidate metadata and expectation IDs are not treated as a target description decision. No previous description output, adjudication or target decision was seen.'},'utcStart':before['pinnedAt'],'utcStartMeaning':'Recorded local before-pin completion and beginning of the substantive independent content/visual review; prompt/schema orientation and one-record structural inspection preceded this timestamp and were not separately time-stamped. No scientific decisions had been recorded before it. The supplied immutable seal pre-existed the run.','utcEnd':now(),'utcEndMeaning':'End of content review and successful local schema/binding/input-immutability validation; immediately before writing this execution receipt and output seal.','inputSeal':{'path':str(base/'eighteen-D-input-seal.actual.json'),'rawSha256':'1f9423954abc22c1524aabf89f28983a9290232b4f3563f0535d2046c351c757'},'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],'inputPinCount':48,'beforePinManifest':str(out/'input-pins.before.json'),'afterPinManifest':str(out/'input-pins.after.json'),'inputsUnchanged':True,'readEvidence':{'wholeBilingualGoals':18,'fullCurrentProfileBodies':18,'nativePrerequisiteSuccessorPageAndCanonicalContexts':18,'contextDepth':'Only actually supplied IDs, labels, page relations and canonical fields; no external target texts fetched.','physicalPdfPagesViewed':list(range(1,21)),'pdfPageMethod':'pdftoppm -scale-to 1600 -png; actual view_image calls on all twenty newly rendered page PNGs.','originalIllustrationsViewed':[next(str(p) for p in (base/'supplied-illustrations').glob(b['goal']['goalId']+'.*')) for b in batch],'scientificPNGsViewed':[str(base/'supplied-materials'/n) for n in ['cie1931-color-matching.png','spectrum-components.png','spectrum-filter-input.png']],'visibilityCaveat':'One illustration omitted by the output size limit in the first large image batch was reopened in a smaller batch and actually displayed before judgement. No visibility claim is inferred solely from file metadata.'},'outputs':{'records':str(out/'records.jsonl'),'explanation':str(out/'review-explanation.md'),'validation':str(out/'validation.json'),'receipt':str(out/'receipt.json'),'seal':str(out/'input-output-sha256-seal.json')},'result':{'descriptionDecisions':validation['decisions'],'profileRecommendations':validation['profileRecommendations'],'recordStatus':'candidate','reviewAuthority':'ai_candidate'},'limits':['No human review or learner performance is asserted.','No effective jurisdiction/course/duration projection or full official-source mapping was supplied or approved.','Illustrations were inspected as teaching support; this description review is not blanket visualization acceptance.','No active curriculum, QA, registry, source asset or Git operation was performed.','No release, integration, main CI or production claim is made.']}
(out/'receipt.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
files=sorted(p for p in out.iterdir() if p.is_file() and p.name not in ['input-output-sha256-seal.json','input-output-sha256-seal.sha256'])
seal={'sealedAt':now(),'algorithm':'SHA256','meaning':'Exact bytes of all allowed source inputs plus all locally produced output files. This seal excludes itself; its raw digest is in input-output-sha256-seal.sha256.','inputPins':after_pins,'outputPins':[{'path':str(p),'sha256':digest(p),'bytes':p.stat().st_size} for p in files]}
(out/'input-output-sha256-seal.json').write_text(json.dumps(seal,ensure_ascii=False,indent=2)+'\n')
(out/'input-output-sha256-seal.sha256').write_text(digest(out/'input-output-sha256-seal.json').removeprefix('sha256:')+'  input-output-sha256-seal.json\n')
print(json.dumps({'passed':True,'schemaValidRecords':len(rows),'checks':len(checks),'inputFilesUnchanged':len(after_pins),'outputFilesSealed':len(files),'decisions':validation['decisions'],'profileRecommendations':validation['profileRecommendations'],'receiptUtcEnd':receipt['utcEnd'],'sealRawSHA256':digest(out/'input-output-sha256-seal.json')},ensure_ascii=False))
