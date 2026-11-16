from pathlib import Path
import json,hashlib,datetime,collections,importlib.metadata
from jsonschema import Draft202012Validator
root=Path('tmp/physics-release840-20261115/final18')
out=Path('tmp/physics-current18-fresh-a-20261115')
r=root/'eighteen-native-d/round-a'
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
now=lambda:datetime.datetime.now(datetime.timezone.utc).isoformat()
before=json.loads((out/'input-pins.before.json').read_text())
a=[json.loads(s) for s in (r/'batches/independent-a.batch-001.input.jsonl').read_text().splitlines()]
c=json.loads((r/'description-review-campaign.json').read_text())
bm=json.loads((root/'eighteen-review-bundle/book-model.json').read_text())
rec=[json.loads(s) for s in (out/'records.jsonl').read_text().splitlines()]
schema=json.loads((r/'contracts/goal-description-review-record.schema.json').read_text())
Draft202012Validator.check_schema(schema)
v=Draft202012Validator(schema)
errors=[]
for i,q in enumerate(rec,1):
 errors.extend({'position':i,'path':list(e.path),'message':e.message} for e in v.iter_errors(q))
check={}
check['recordCount']=len(rec)==len(a)==c['goalCount']==18
check['schemaValid']=not errors
check['assignedOrder']=[q['goalId'] for q in rec]==c['batches'][0]['goalIds']==a[0]['batchGoalIds']
check['uniqueGoalIds']=len({q['goalId'] for q in rec})==18
check['uniqueRecordIds']=len({q['recordId'] for q in rec})==18
check['schemaVersionAndCandidateAuthority']=all(q['schemaVersion']==1 and q['recordStatus']=='candidate' and q['reviewAuthority']=='ai_candidate' for q in rec)
keys=['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']
check['exactGoalAndTextBindings']=all(all(q[k]==x['goal'][k] for k in keys) for q,x in zip(rec,a))
check['exactCampaignRoundBindings']=all(q['campaignId']==c['campaignId'] and q['roundId']==c['roundId'] for q in rec)
check['exactBundleAndBookBindings']=all(q['bundleFingerprint']==x['bundleFingerprint']==c['bundleFingerprint'] and q['bookDigest']==x['bookDigest']==c['bookDigest']==bm['digest'] for q,x in zip(rec,a))
check['locallyAssignedRunIdConsistent']=all(q['runId']=='physics-current18-fresh-a-20261115' for q in rec)
check['noRunIdSuppliedInBatchOrCampaign']=('runId' not in c and all('runId' not in x for x in a))
check['recordSchemaRawDigestMatches']='sha256:'+sha(r/'contracts/goal-description-review-record.schema.json')==c['recordSchemaDigest']
check['promptRawDigestMatches']='sha256:'+sha(r/'prompt.md')==c['promptFingerprint']
check['criteriaRawDigestMatches']='sha256:'+sha(r/'criteria.md')==c['criteriaFingerprint']
check['expectedSealDigest']=sha(root/'eighteen-D-input-seal.actual.json')=='1f9423954abc22c1524aabf89f28983a9290232b4f3563f0535d2046c351c757'
check['proposalOnlyForRevise']=all((('proposedDescriptionDe' in q and 'proposedDescriptionEn' in q) if q['decision']=='revise' else ('proposedDescriptionDe' not in q and 'proposedDescriptionEn' not in q)) for q in rec)
check['sixGoalSpecificEvidenceFieldsPresent']=all(len(q['understandingEvidence'])==6 and all(isinstance(t,str) and t.strip() for t in q['understandingEvidence'].values()) for q in rec)
check['profileContract']=all(q['evidenceProfileContract']=='positive-understanding-evidence-v2' for q in rec)
check['evidenceChainsNotExactDuplicates']=len({json.dumps(q['understandingEvidence'],sort_keys=True) for q in rec})==18
check['jsonlOnlyAndTerminalNewline']=(out/'records.jsonl').read_bytes().endswith(b'\n') and len((out/'records.jsonl').read_text().splitlines())==18
illustrations=[]
for x in a:
 g=x['goal'];i=g['goalId'];ps=[p for p in (root/'supplied-illustrations').glob(i+'.*') if p.suffix.lower() in ['.jpg','.png']]
 illustrations.append({'goalId':i,'path':str(ps[0]),'sha256':sha(ps[0]),'matchesBoundOriginalDigest':'sha256:'+sha(ps[0])==g['reviewContext']['page']['visualization']['originalDigest']})
check['all18OriginalIllustrationsBound']=len(illustrations)==18 and all(x['matchesBoundOriginalDigest'] for x in illustrations)
materials=json.loads((root/'supplied-materials/material-sources.json').read_text())
check['all6ScientificMaterialBytesMatchSuppliedContext']=len(materials['files'])==6 and all(sha(root/'supplied-materials'/f['suppliedFile'])==f['sha256'] for f in materials['files'])
rendered=sorted(out.glob('physical-page-*.jpg'))
check['twentyPhysicalPagesRendered']=len(rendered)==20
# Pin only permitted inputs already observed at the beginning; never traverse other review roots.
after={p:sha(p) for p in before['files']}
drift=[p for p,h in before['files'].items() if after[p]!=h]
check['inputsUnchanged']=not drift
with (out/'input-pins.after.json').open('x') as f:f.write(json.dumps({'utc':now(),'files':after,'changedFiles':drift},indent=2)+'\n')
validation={'runId':'physics-current18-fresh-a-20261115','validatedAt':now(),'validator':{'library':'python-jsonschema','version':importlib.metadata.version('jsonschema'),'dialect':'2020-12','schemaPath':str(r/'contracts/goal-description-review-record.schema.json')},'checks':check,'allChecksPassed':all(check.values()),'schemaErrors':errors,'checkedRecordCount':len(rec),'decisionCounts':dict(collections.Counter(q['decision'] for q in rec)),'profileRecommendationCounts':dict(collections.Counter(q['evidenceProfileRecommendation'] for q in rec)),'manualReviewBoundary':'The validator establishes JSON/schema/order/copy bindings/byte integrity, not scientific merit, actual view_image use, learner performance, official sources, effective projections or release authority. Actual viewing is separately attested in receipt and explanation.'}
with (out/'validation.json').open('x') as f:f.write(json.dumps(validation,ensure_ascii=False,indent=2)+'\n')
if not validation['allChecksPassed']:
 print(json.dumps(validation,ensure_ascii=False,indent=2));raise SystemExit(1)
receipt={'agentTask':'/root/physics_release_finish/physics_eighteen_fresh_a','runId':'physics-current18-fresh-a-20261115','runIdOrigin':'locally assigned execution ID; no runId occurs in supplied batch/campaign; task owner confirmed no separate intended runId','campaignId':c['campaignId'],'roundId':c['roundId'],'independenceGroupId':c['independenceGroupId'],'startedAtUtc':'2026-11-15T19:34:21Z','startSemantics':'first own UTC clock observation after task acceptance and initial policy/input listing; input-byte pinning followed before substantive goal review','completedAtUtc':now(),'completionSemantics':'review writing and successful validation complete; final input rehash unchanged; receipt and output seal emitted afterward in this sealing step','blindEligibility':{'eligible':True,'kind':'blind first-pass description review informed by expressly supplied current P candidate context','priorDescriptionReviewVotesOrAdjudicationsSeen':False,'otherRoundsOpened':False,'canonicalSnapshotsOrDiffsOpened':False,'outsideQAOrReviewArtifactsOpened':False,'sanctionedCurrentProfileTextSeen':True,'currentProfileMetadataCaveat':'Supplied current P candidate wrappers and some independent-review-a/b expectation IDs were read as explicitly authorized current context; they are not claimed to be unseen. No prior description decision or other reviewer record was opened or inferred. AGENTS policy includes historical general project statuses, not used as goal verdicts.','noTargetDecisionProvided':True},'inputSealPath':str(root/'eighteen-D-input-seal.actual.json'),'inputSealSha256':sha(root/'eighteen-D-input-seal.actual.json'),'bundleFingerprint':c['bundleFingerprint'],'bookDigest':c['bookDigest'],'inputPinsBefore':{'path':str(out/'input-pins.before.json'),'sha256':sha(out/'input-pins.before.json'),'inputFileCount':len(before['files'])},'inputPinsAfter':{'path':str(out/'input-pins.after.json'),'sha256':sha(out/'input-pins.after.json'),'inputFileCount':len(after),'unchanged':not drift},'actuallyViewed':{'viewingTool':'view_image','manualAttestation':True,'pdf':{'source':str(root/'eighteen-review-bundle/book.pdf'),'physicalPages':list(range(1,21)),'frontMatterPages':[1,2],'goalPhysicalPages':list(range(3,21)),'renderCommand':'pdftoppm -jpeg -r 90 [allowed book.pdf] [own output]/physical-page','renderedFiles':[str(p) for p in rendered]},'originalIllustrations':illustrations,'scientificPNGs':[{'path':str(root/'supplied-materials'/f),'sha256':sha(root/'supplied-materials'/f)} for f in ['cie1931-color-matching.png','spectrum-components.png','spectrum-filter-input.png']],'outputLimitCorrection':'The original pinhole image was initially omitted from a combined tool output by an image-output limit and was then explicitly displayed in a dedicated subsequent view_image call.'},'wholeBilingualDescriptionsRead':18,'wholeCurrentBilingualProfileBodiesRead':18,'wholeSuppliedCanonicalContextsRead':18,'wholeSuppliedDirectPrerequisiteAndSuccessorContextsRead':18,'externalPrerequisiteFullTextsFetched':False,'criteriaConsideredPerGoal':21,'machineValidation':{'path':str(out/'validation.json'),'sha256':sha(out/'validation.json'),'allChecksPassed':True},'outputs':{f:{'path':str(out/f),'sha256':sha(out/f)} for f in ['records.jsonl','review-explanation.md']},'authority':{'recordStatus':'candidate','reviewAuthority':'ai_candidate','humanApprovalClaimed':False,'learnerMasteryClaimed':False,'sourceOrEffectiveProjectionApprovalClaimed':False,'activeCurriculumModified':False,'gitModifiedByThisTask':False,'publicationOrDeploymentPerformed':False}}
with (out/'receipt.json').open('x') as f:f.write(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
# Parse every promised JSON/JSONL file from disk after serialization.
for p in out.glob('*.json'):json.loads(p.read_text())
for line in (out/'records.jsonl').read_text().splitlines():json.loads(line)
outputs={str(p):sha(p) for p in sorted(out.rglob('*')) if p.is_file() and p.name!='input-output-seal.json'}
seal={'sealedAtUtc':now(),'agentTask':receipt['agentTask'],'runId':receipt['runId'],'inputFileCount':len(after),'inputFiles':after,'inputBeforeAfterEqual':not drift,'outputFiles':outputs,'selfHashExcluded':True,'limitations':'SHA256 binds bytes and does not grant review, learner, source, projection or publication authority.'}
with (out/'input-output-seal.json').open('x') as f:f.write(json.dumps(seal,ensure_ascii=False,indent=2)+'\n')
json.loads((out/'input-output-seal.json').read_text())
print('All',len(check),'checks passed; 18 schema-valid records; 48 input files unchanged.')
print('records.jsonl SHA256',sha(out/'records.jsonl'))
print('receipt.json SHA256',sha(out/'receipt.json'))
print('input-output-seal.json SHA256',sha(out/'input-output-seal.json'))
