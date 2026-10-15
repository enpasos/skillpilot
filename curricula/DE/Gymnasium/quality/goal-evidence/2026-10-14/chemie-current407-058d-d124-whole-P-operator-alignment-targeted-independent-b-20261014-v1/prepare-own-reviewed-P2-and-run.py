# Apache-2.0 technical serialization. Own didactic review content: CC-BY-4.0.
import copy,datetime,hashlib,json,pathlib
R=pathlib.Path('/home/enpasos/projects/skillpilot');O=pathlib.Path(__file__).parent
A=O.parent/'chemie-current407-058d-d124-whole-P-operator-alignment-targeted-remediation-author-20261014-v1'
rd=lambda p:json.loads(p.read_text())
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p):return {'path':str(p.relative_to(R)),'sha256':sha(p),'bytes':p.stat().st_size}
def wr(n,d):
 p=O/n;p.parent.mkdir(exist_ok=True,parents=True);assert not p.exists(),p;p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');return p
n=rd(A/'NEUTRAL.current058d-d124-six-whole-cases-and-current-source-course-inputs.author-candidates.json')
s=rd(O/'SCIENTIFIC.first-sealed-current058d-d124-whole-P-independent-b.actual.json')
start=rd(O/'STARTED.actual.json')
assert not start['peerCurrentARead'] and not s['peerCurrentARead']
review_id='chemie-current407-058d-d124-targeted-p-independent-b-20261014-v1'
run_id=review_id+'-run-001'
base=rd(A/'config/P2.author-candidates-only.stock-check.config.json')
criteria=R/base['reviewCriteriaPath']
assert sha(criteria)=='sha256:14b9fe5db2b527baad6e5e488b2e2909f2eeaaeb8d9106a7c072ec6c2d4f12be'
prompt=O/'inputs/actual-targeted-independent-B-review-instruction.md'
prompt.write_text('''# Targeted independent P2 review B

Read the exact neutral selection and actual whole current DE/EN goals, prerequisites,
parents/successors and complete bound source/course contexts. Read all six corrected
whole cases with material, model answers and rubrics and both complete profiles.
Compare the original cases and preserved optional protein extension. Judge actual
chemical correctness, whole current competence coverage, required operators,
meaningful changed-condition transfer and the strength and limits of the material.
058d asks explanation/inference; do not impose a universal actual experiment or
count synthetic data as meeting original BW/TH/SN actual-execution duties.
d124 currently asks planning and evaluation of amino carboxylic acid separations;
do not waive planning for a current target or require unrelated protein/SDS mastery.
Keep BY-GA evaluation-only, BY-EA planning and SH chromatography source distinctions
open. Canonical-profile fitness is not source/target authority. Preserve the current
whole goal bodies. Do not read current A outcomes or metadata before both reviewers
are finished. Seal first independent science before technical serialization.
Use the exact stock criteria. Decide conservatively; do not force acceptance.
Output original own reviewer metadata and a complete stock run manifest; preserve
profile bodies when accepted. AI records remain needs_human_review / ai_candidate;
E1/G1 is bounded task-design evidence, not learner execution, Human/D/A/M/V or release.
No host, active, engine, Git or registry mutation. Only bounded normal stock P checks.
''')
parameters=wr('inputs/actual-provider-model-and-unexposed-generation-controls.json',{
 'schemaVersion':1,'provider':'OpenAI','agent':'Codex','underlyingModelIdExposed':False,
 'modelVersionExposed':False,'samplingControlsExposed':False,'requestedSamplingOverrides':None,
 'actualSamplingControls':None,'note':'No model version, temperature, seed or top_p is inferred or invented. The manifest names the known Codex agent and discloses the underlying model-ID limit.'})
author_records=[json.loads(x)for x in (R/n['newAuthorProfiles2']['path']).read_text().splitlines()if x.strip()]
records=[]
for original in author_records:
 x=copy.deepcopy(original);g=x['goalId'];j=next(v for v in s['goalProfileJudgments']if v['goalId']==g)
 assert j['wholeProfileSufficient']
 x.update({'reviewId':review_id,'reviewedAt':s['completedAt'],
   'reviewer':'Codex independent P reviewer B; not author of the corrected058d/d124 cases; current A outcomes and metadata unread',
   'reason':j['reason']+' Targeted current operator mismatch resolved for this whole P design. E1/G1 is reviewed task-design plausibility, not observed learner execution. Original source/course/practical holds remain; no D/A/M/V/Human or activation grant.',
   'evidenceLevel':'E1','maximumClaimScope':'G1','status':'needs_human_review','reviewAuthority':'ai_candidate',
   'reviewRunIds':[run_id],'dissent':[]})
 assert x['profile']==original['profile']
 assert all(x[k]==original[k]for k in ('goalFingerprint','profileFingerprint','reviewInputFingerprint','reviewCriteriaFingerprint'))
 records.append(x)
rp=O/'results/P2.actual-current-independent-b.records.jsonl'
assert not rp.exists();rp.write_text(''.join(json.dumps(x,ensure_ascii=False,separators=(',',':'))+'\n'for x in records))
canonical=R/base['landscapePath']
manifest=wr('results/P2.actual-current-independent-b.run.json',{
 '$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,
 'runId':run_id,'bundleFingerprint':sha(A/'NEUTRAL.current058d-d124-six-whole-cases-and-current-source-course-inputs.author-candidates.json'),
 'bookDigest':sha(canonical),'provider':'OpenAI','model':'Codex agent; underlying model ID not exposed',
 'role':'assessment_adversarial_reviewer','promptFamilyId':'targeted-whole-current-chemistry-P2-independent-science-v1',
 'promptFingerprint':sha(prompt),'criteriaFingerprint':sha(criteria),'generationParametersFingerprint':sha(parameters),
 'independenceGroupId':start['independenceGroup'],'blindToOtherRuns':True,'goalIds':n['goalIds'],
 'inputArtifacts':[{'role':'book_model','digest':sha(canonical)},
   {'role':'review_input_json','digest':sha(A/'NEUTRAL.current058d-d124-six-whole-cases-and-current-source-course-inputs.author-candidates.json')},
   {'role':'review_input_jsonl','digest':sha(R/n['newAuthorProfiles2']['path'])},
   {'role':'review_prompt','digest':sha(prompt)},{'role':'review_criteria','digest':sha(criteria)},
   {'role':'finding_schema','digest':sha(R/'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')},
   {'role':'run_manifest_schema','digest':sha(R/'contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json')}],
 'startedAt':s['startedAt'],'completedAt':s['completedAt'],'status':'completed','outputDigest':sha(rp),
 'toolchainVersion':'stock-positiveGoalEvidenceReview:'+sha(R/'app/scripts/positiveGoalEvidenceReview.ts').split(':')[1]})
config=copy.deepcopy(base);config.update({'reviewId':review_id,'reviewPath':str(rp.relative_to(R)),
 'reviewRunManifestPaths':[str(manifest.relative_to(R))],
 'scope':{'label':'Fresh independent B review of two whole current corrected P profiles; source/course/practical holds remain','goalIds':n['goalIds']}})
cfg=wr('config/P2.actual-current-independent-b.stock-check.config.json',config)
preserved=[]
for original,x in zip(author_records,records):
 preserved.append({'goalId':x['goalId'],'wholeProfileObjectExact':x['profile']==original['profile'],
  'goalProfileInputCriteriaFingerprintsExact':all(x[k]==original[k]for k in ('goalFingerprint','profileFingerprint','reviewInputFingerprint','reviewCriteriaFingerprint')),
  'onlyOwnReviewMetadataRunReferencesChanged':True,'newOriginalOwnReviewerMetadata':{k:x[k]for k in ('reviewId','reviewedAt','reviewer','reason','evidenceLevel','maximumClaimScope','status','reviewAuthority','reviewRunIds','dissent')}})
wr('checks/CHECK.own-record-provenance-full-input-output-bindings-and-profile-preservation.actual.json',{
 'schemaVersion':1,'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'firstScienceSeal':bind(O/'FIRST-SCIENCE-SEAL.current058d-d124-P2-independent-b.actual.json'),
 'science':bind(O/'SCIENTIFIC.first-sealed-current058d-d124-whole-P-independent-b.actual.json'),
 'records':bind(rp),'runManifest':bind(manifest),'config':bind(cfg),'criteria':bind(criteria),
 'canonical':bind(canonical),'semanticLedger':bind(R/config['semanticKindLedgerPath']),
 'prompt':bind(prompt),'generationParameterDisclosure':bind(parameters),'originalAuthorProfiles':n['newAuthorProfiles2'],
 'allWholeInputBindings':rd(O/'inputs/EXACT.neutral-selected-whole-input-bindings.verified.json'),
 'outputDigestExact':sha(rp)==rd(manifest)['outputDigest'],'preservedProfiles':preserved,
 'currentAOutcomesOrMetadataRead':False,'HReadOnly':True,'activeGitEngineRegistryWrites':False})
print(json.dumps({'records':bind(rp),'run':bind(manifest),'config':bind(cfg)},ensure_ascii=False))
