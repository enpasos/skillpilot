# SPDX-License-Identifier: Apache-2.0
import datetime,pathlib,json,hashlib,shutil
R=pathlib.Path('/home/enpasos/projects/skillpilot');B=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q4-thermodynamics-eleven-current402-P-A-source-author-20261012-v2'
def rd(p):return json.loads(p.read_text())
def wr(p,v):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def ref(p):return dict(path=str(p.relative_to(R)),bytes=p.stat().st_size,sha256=sha(p))
ids=rd(B/'inputs/scope11.exact.claim.config.json')['goalIds'];P=[json.loads(l)for l in (B/'positive/P11.normal-materialized.pending.review.jsonl').read_text().splitlines()];C=rd(B/'cases/whole11.DEEN.cases-material-data-modelanswers-rubrics.json');assert len(P)==11 and set(r['goalId']for r in P)==set(ids);assert all((r['status'],r['reviewAuthority'],r['evidenceLevel'],r['maximumClaimScope'])==('needs_human_review','ai_candidate','E1','G1')for r in P);V=rd(B/'images/author-actual-goal-image-judgments11.json');deltas=rd(B/'sources/five-bounded-mapping-deltas.author-proposal.json')['deltas'];sourceChecks=[];oldpaths=list(dict.fromkeys(d['mappingPath']for d in deltas))
for n,path in enumerate(oldpaths):
 old=rd(R/path);new=rd(B/f'sources/mapping-candidates/mapping-{n+1}.inactive.json');changed=[dict(index=k,sourceGoalId=a['sourceGoalId'])for k,(a,c)in enumerate(zip(old['decisions'],new['decisions']))if a!=c];expected={d['sourceGoalId']for d in deltas if d['mappingPath']==path};assert{r['sourceGoalId']for r in changed}==expected
 unchanged=[k for k,(a,c)in enumerate(zip(old['decisions'],new['decisions']))if a==c];derivedChanged=[k for k,(a,c)in enumerate(zip(old['mappings'],new['mappings']))if a!=c];assert len(old['decisions'])==len(new['decisions']) and len(old['mappings'])==len(new['mappings']);sourceChecks.append(dict(original=ref(R/path),candidate=ref(B/f'sources/mapping-candidates/mapping-{n+1}.inactive.json'),changedDecisionRows=changed,untouchedDecisionRows=len(unchanged),changedDerivedMappings=derivedChanged,allSourceGoalIdsExact=True,wholeClausesDeleted=False,wholeClauseClearanceGranted=False))
wr(B/'checks/source-five-row-only-preservation.actual.json',dict(schemaVersion=1,mappingFiles=3,changedDecisionRows=5,records=sourceChecks,wholeSourceExtractionInputsUntouched=True))
# Bind all currently consumed memory decks and visibility inputs without modifying them.
mc=rd(B/'memory/M402.merged.inactive.config.json');land=rd(B/'candidate/canonical523.current402-Q4-two-text-proposals.inactive.json');consumed={x['viewPath']for x in mc['visibilityScopes']}
for g in land['goals']:
 if 'memorization'in g.get('tags',[])or any(t.startswith('srs-deck:')for t in g.get('tags',[])):
  def walk(v):
   if isinstance(v,str)and v.startswith('curricula/')and(R/v).is_file():consumed.add(v)
   elif isinstance(v,dict):
    for z in v.values():walk(z)
   elif isinstance(v,list):
    for z in v:walk(z)
  walk(g)
wr(B/'inputs/retained-memory-decks-and-visibility-CAS.json',dict(schemaVersion=1,fileInputs=[ref(R/p)for p in sorted(consumed)],primaryCards75Unchanged=True,nineVisibilityScopesUnchanged=True))
# Corrected normal-scope details are explicit: two existing card-origin partners keep original judgments.
wr(B/'checks/normal-scoped-author-results.actual.json',dict(schemaVersion=1,normalCodeChanged=False,P=dict(materializeExit=0,verifyExit=0,checkExit=0,currentCandidates=11,approved=0,status='needs_human_review',authority='ai_candidate',evidenceLevel='E1',maximumClaimScope='G1',reviewRunIds=[]),A=dict(checkExit=0,scope=11,currentAtomic=11,missing=0,stale=0,role='own author judgments'),M11=dict(checkExit=0,ownAuthorNecessity=11,required=5,noMemory=6,exactOriginalEnergyCardOriginPartners=['3ec31fe1-e01b-5edd-bd9a-936191d67639','ebfa2c18-0599-5282-bf7a-80c14d86331e'],retainedEnergyCards=7,visibilityScopes=9,noMissingVisibleMemory=0),M402=dict(checkExit=0,necessity=402,retainedNecessityRawLines=391,retainedCards=75,keptCards=75,visibilityScopes=9,missingVisibleMemory=0,staleOrObsoleteRecords=0,newCardVotes=0),source32=dict(currentReadOnlyCheckExit=0,inactiveCandidatePureBuildCheckExit=0,counts=rd(B/'checks/source32.candidate.normal-pure-build-and-check.receipt.json')['counts'],freshIndependentSourceApproval=False),runtimeSchema=dict(checkExit=0,errors=0,compiledSchemaNotApplicableToUncompiledSource=True),canonicalDAG=dict(checkExit=0,findings=[]),symlinks=dict(errors=0,committableOwnSymlinks=0),scientificArithmetic=dict(expressions=58,threeFuelRows=True,actualBoltzmannCsvRows=16001,actualBilingualPlots=4),authorImageInspection=dict(keep=8,hold=3,generated=0,newApproval=0),technicalLimits=['The first scoped M attempt supplied all75card records without their memory nodes/origin decisions; its failed report remains in checks/attempts. The final scope uses all7energy cards, the correct energy memory node and two exact retained origin partners. Full M402 preserves and checks all75cards.','An initial generic schema attempt applied the compiled-landscape schema to uncompiled authored source. That category mismatch report remains in checks/attempts; the applicable normal runtime schema and canonical authoring DAG/reference validator both pass.','No successor native book_model/HTML/PDF was built. No independent normal AI-run manifest/book digest was fabricated. Actual author process and exact input/output transparency are recorded separately.'],independentAcceptance=False,strictGain=0,humanApproval=False,humanTrial=False,activeWrites=False))
# Parse every own machine artifact, including preserved failed-attempt evidence.
parsed=[]
for p in sorted(B.rglob('*')):
 if p.suffix=='.json':rd(p);parsed.append(ref(p))
 elif p.suffix=='.jsonl':
  for l in p.read_text().splitlines():
   if l.strip():json.loads(l)
  parsed.append(ref(p))
wr(B/'checks/all-owned-json-jsonl-parse.actual.json',dict(schemaVersion=1,parsedFiles=parsed,errors=[]))
# Record the final actual normal P output beside the explicit author log.
p=B/'author/actual-author-run.transparency.json';run=rd(p);run['outputs'].append(ref(B/'positive/P11.normal-materialized.pending.review.jsonl'));run['completedAt']=datetime.datetime.now(datetime.timezone.utc).isoformat();wr(p,run)
(B/'README.author.md').write_text('''# Q4 thermodynamics eleven: inactive author successor v2

All material is an author candidate. No independent acceptance, strict M7 gain, actual laboratory/learner execution, Human Approval or Human Trial is claimed. Own didactic material is CC-BY-4.0; technical author/check scripts are Apache-2.0; third-party sources retain their rights.

## Exact contents

- Eleven complete bilingual P-v2 profiles, bound to 32 whole bilingual cases with actual materials/data, model answers and chemical rubrics. Synthetic fixtures are explicitly labelled. Teacher-authorised calorimetry, the specifically named ST Mg and NH4HCO3 reactions, neutralisation, entropy-driving-force and temperature-rate experiments require the learner's actual execution and original controlled records. Model data cannot satisfy those operators.
- A fresh own A11 judgment and M11 necessity judgment for each goal. Five existing memory requirements remain; six goals need no additional card. All75cards and391other necessity lines remain exact. The scoped M check retains two original energy-card origin partners and seven exact energy cards; the merged M402 normal check checks all75cards/ninevisibility scopes.
- Current32 raw source inputs,316mapping decision rows, whole sourceGoals, all sourceOccurrences and125full unique passage contexts. Direct and inherited coverage stay distinct. Every whole source clause and out-of-scope partner obligation stays retained; no whole-clause source clearance is granted by this author package.
- Five narrowly justified mapping proposals in three inactive full copies: HE LK free-G calculation goes to dcbad instead of pure enthalpy4a; HH Hess gets4a; HH free-G calculation and two NW LK free-G/redox components get dcbad. All unrelated decision rows/partner targets remain exact. Independent source acceptance remains pending.
- Only the two root partial text proposals were adopted after scientific consideration: the4a English Hess typo; dc DE/EN cyclic heat-engine restriction. Three changed text fields across two goals, with521raw whole goal objects unchanged, all requires/resourceLinks unchanged. The root's five active closures/M1 binding in the input snapshot are preserved. Extract those exact deltas during later integration; never overwrite later root changes with the full snapshot.
- All11actual current goal images were inspected in browser captures at360/680. Current assets are widescreen; no4:3 effective597×448case exists in this scope. Eight author KEEP proposals and three concrete author HOLD proposals are recorded. Provider and file ratio are never replacement reasons. No images were generated or changed.

## Remaining image holds

-0a5: the image calls H2O(l)→H2O(g) a chemical reaction; this is physical vaporisation.
-561: the image gives unqualified doubled/tripled RGT behaviour rather than a bounded empirical rule.
-dc: the image forbids100%heat→work without the cyclic/single-reservoir/no-other-change condition; finite isothermal expansion is the explicit countercase.

Existing801QA lacks current aiApproved; scientific author KEEP does not grant that approval. All new independent D/P/A/M/source/V acceptance and current combined native binding remain root-owned and pending.

## Actual checks

Unchanged normal P-v2 materialise/verify/check, A11check, M11plus retained partners and M402check, current32source check, inactive32source pure build/check, applicable runtime schema, canonical DAG/reference validator and committable curriculum symlink check all pass.58numeric expressions, three fuel dossier rows and16,001Boltzmann CSV rows/four plotted task figures were computed. These are author verification, not independent science approval.

No native publishing build or all402native generation was performed. Actual author transparency is recorded without inventing a book_model or independent run tuple. Normal P records retain empty reviewRunIds and truthful E1/G1 ai_candidate/needs_human_review.

The source32 input config is an execution-root-only recipe. Its normal book-local output paths are exercised only in the ignored exact-copy capsule by the unchanged pure build/check API. Do not invoke the default writer on this config against the live repository. Source/canonical full copies are review inputs; later integration applies reviewed exact rows/fields to the then-current root candidate.
''')
shutil.copyfile(pathlib.Path(__file__),B/'author/seal-author.py')
# Neutral source-exact input: bind all actually necessary artifacts, preserve original inputs.
files=[p for p in sorted(B.rglob('*'))if p.is_file()and p.name not in ['FINAL.Q4-eleven.neutral-review-input.json','FINAL.author-package.freeze.json']]
entry=dict(schemaVersion=1,inputId='chemie-q4-thermodynamics-eleven-current402-source-exact-neutral-author-v2',role='author_candidate_input_for_future_independent_review',goalIds=ids,candidateCurricularAtomicCount=402,currentSnapshotGoals=523,canonicalCandidate=ref(B/'candidate/canonical523.current402-Q4-two-text-proposals.inactive.json'),semanticInput=ref(B/'candidate/semantic402.two-text-rebound.inactive-model-input.json'),positiveConfig=ref(B/'positive/P11.normal-materializer.inactive.config.json'),positiveReview=ref(B/'positive/P11.normal-materialized.pending.review.jsonl'),wholeCases=ref(B/'cases/whole11.DEEN.cases-material-data-modelanswers-rubrics.json'),atomicConfig=ref(B/'atomic/A11.inactive.config.json'),memoryConfig=ref(B/'memory/M11.inactive.config.json'),mergedMemoryConfig=ref(B/'memory/M402.merged.inactive.config.json'),source32RawInventory=ref(B/'sources/ALL32.raw-mapping-decisions-sourceGoals-occurrences-passages.selected11.json'),sourceProposals=ref(B/'sources/five-bounded-mapping-deltas.author-proposal.json'),wholeImageInputs=ref(B/'inputs/selected11.whole-goals-current-QA-images.json'),authorImageJudgments=ref(B/'images/author-actual-goal-image-judgments11.json'),normalResults=ref(B/'checks/normal-scoped-author-results.actual.json'),originalInputCAS=ref(B/'FIRST.current402-and-source32.actual-input-CAS.json'),authorRunTransparency=ref(B/'author/actual-author-run.transparency.json'),fileInputs=[ref(p)for p in files],remainingHolds=dict(independentAcceptancePending=True,currentCombinedNativeBindingPending=True,threeConcreteImageHolds=[r['goalId']for r in V['records']if r['authorDisposition']=='HOLD'],existing801QaNotPromoted=True),status='needs_human_review',reviewAuthority='ai_candidate',evidenceLevel='E1',maximumClaimScope='G1',strictGain=0,humanApproval=False,humanTrial=False,activeWrites=False)
wr(B/'FINAL.Q4-eleven.neutral-review-input.json',entry)
files=[p for p in sorted(B.rglob('*'))if p.is_file()and p.name!='FINAL.author-package.freeze.json'];freeze=dict(schemaVersion=1,packageId='chemie-q4-thermodynamics-eleven-current402-P-A-source-author-20261012-v2',sealedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),role='inactive author successor, not independent acceptance',entry=ref(B/'FINAL.Q4-eleven.neutral-review-input.json'),ownedFiles=[ref(p)for p in files],candidateCurricularAtomicCount=402,goalIds=ids,wholeCaseCount=32,independentAcceptances=0,strictGain=0,humanApproval=False,humanTrial=False,activeWrites=False);wr(B/'FINAL.author-package.freeze.json',freeze)
for f in freeze['ownedFiles']:assert sha(R/f['path'])==f['sha256']
print(json.dumps(dict(entry=ref(B/'FINAL.Q4-eleven.neutral-review-input.json'),seal=ref(B/'FINAL.author-package.freeze.json'),ownedFiles=len(files),sourceDeltas=5,goals=11,cases=32,imageHolds=3,allOwnedSealedFilesVerified=True),ensure_ascii=False,indent=2))
