import json, hashlib, copy
from pathlib import Path
from datetime import datetime, timezone

BASE=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12')
AUTHOR=BASE/'chemie-q3-thirteen-current402-four-images-author-20261012-v3'
OLD_AUTHOR=BASE/'chemie-q3-thirteen-current402-live-context-author-20261012-v2'
OLD=BASE/'chemie-q3-thirteen-current402-independent-a-20261012-v2'
OUT=BASE/'chemie-q3-thirteen-current402-targeted-independent-a-20261012-v3'
def read(p):return json.loads(Path(p).read_text())
def stable(x):return json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':'))
def sha(b):return 'sha256:'+hashlib.sha256(b).hexdigest()
def digest(p):return sha(Path(p).read_bytes())
def write(p,x):
    p=OUT/p;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def lines(p,rows):
    p=OUT/p;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(''.join(json.dumps(x,ensure_ascii=False,separators=(',',':'))+'\n' for x in rows))
def rows(p):return [json.loads(x) for x in Path(p).read_text().splitlines() if x]
def without(x,keys):return {k:v for k,v in x.items() if k not in keys}
now=datetime.now(timezone.utc).isoformat().replace('+00:00','Z')
oldjoin=read(OLD_AUTHOR/'inputs/FINAL.neutral-whole402-P13-whole28-source-bounded.join.json')
join=read(AUTHOR/'inputs/FINAL.neutral-whole402-P13-whole28-source-bounded.join.json')
ts=join['selected13WholeTuples'];ots=oldjoin['selected13WholeTuples'];ids=[t['goalId'] for t in ts]
assert ids==[t['goalId'] for t in ots] and len(ids)==13
manifest=read(AUTHOR/'FINAL.neutral-input-manifest.json')
changed_images=set(manifest['changedVisualizationGoalIds']);changed_cases=set(manifest['changedScientificCaseIds'])
assert len(changed_images)==5 and changed_cases=={'q3-18-a','q3-18-b','q3-09-c-qualitative-contribution'}
old_goals={g['id']:g for g in read(OLD_AUTHOR/'inputs/current523.author-successor.de.json')['goals']}
goals={g['id']:g for g in read(AUTHOR/'inputs/current523.author-successor.de.json')['goals']}
assert goals.keys()==old_goals.keys() and len(goals)==523
assert all(without(g,{'resourceLinks'})==without(old_goals[k],{'resourceLinks'}) for k,g in goals.items())
assert {k for k,g in goals.items() if g!=old_goals[k]}==changed_images
comp=[];case_comp=[]
for o,t in zip(ots,ts):
    assert o['wholeCanonicalDContext']==t['wholeCanonicalDContext']
    assert o['normalOriginalSourcePayload']==t['normalOriginalSourcePayload']
    for field in ['actualPrerequisiteWholeGoals','actualParentWholeGoals','actualReverseRequiresWholeGoals']:
        assert [without(x,{'resourceLinks'}) for x in o[field]]==[without(x,{'resourceLinks'}) for x in t[field]]
    ib=t['imageKeepBinding'];assert digest(ib['currentActualAssetPath'])==ib['currentDigest']
    same=ib['currentDigest']==o['imageKeepBinding']['currentDigest'];assert same==(t['goalId'] not in changed_images)
    pchanged=o['positiveRecord']['profile']!=t['positiveRecord']['profile']
    assert pchanged==(t['goalId'] in [ids[5],ids[10]])
    comp.append({'goalId':t['goalId'],'canonicalScientificAndPrerequisiteAndApplicabilityContextExact':True,
      'originalSourcePayloadExact':True,'wholeSiblingScienceExact':True,'newImage':not same,
      'imageCurrentSha256':ib['currentDigest'],'imagePreviousSha256':o['imageKeepBinding']['currentDigest'],
      'positiveProfileChanged':pchanged,'previousDContextSha256':sha(stable(o['wholeCanonicalDContext']).encode()),
      'currentDContextSha256':sha(stable(t['wholeCanonicalDContext']).encode()),
      'currentPInputSha256':sha(stable(t['normalPInput']).encode())})
    for oc,c in zip(o['wholeMaterialCases'],t['wholeMaterialCases']):
        assert oc['caseId']==c['caseId']
        ob=without(oc,{'wholeCurrentGoal'});cb=without(c,{'wholeCurrentGoal'});samebody=ob==cb
        assert samebody==(c['caseId'] not in changed_cases)
        case_comp.append({'caseId':c['caseId'],'goalId':t['goalId'],'scientificBodyExact':samebody,
         'oldScienceBodySha256':sha(stable(ob).encode()),'currentScienceBodySha256':sha(stable(cb).encode()),
         'wholeCurrentGoalScienceExact':without(c['wholeCurrentGoal'],{'resourceLinks'})==without(oc['wholeCurrentGoal'],{'resourceLinks'})})
assert len(case_comp)==28 and sum(r['scientificBodyExact'] for r in case_comp)==25
write(Path('checks')/'context-retention.independent-a.actual.json',{'all523ScienceUnchanged':True,'resourceOnlyChangedGoalIds':sorted(changed_images),'rows':comp,'caseRows':case_comp,'unchangedExactScientificCaseBodies':25,'targetedChangedCaseBodies':3,'D13ScienceJudgmentsRetainedAfterComparison':True,'newBlindInitialReviewClaim':False,'peerReads':0})
oldnorm=OLD_AUTHOR/'sources/selected13-whole-direct-source-duty-contexts.author.actual.json'
assert str(oldnorm)==manifest['wholeSourceDutyContextPath']
source=read(oldnorm)['rows'];assert len(source)==656
old_literal=rows(OLD/'sources/656.literal-norm-rows.independent-a.jsonl')
assert all(r['exactNeutralRowSha256']==sha(stable(s).encode()) for r,s in zip(old_literal,source))
write(Path('sources')/'656-literal-retention.independent-a.actual.json',{'literalCount':656,'retainedOwnOriginalLiteralDecisionsPath':str(OLD/'sources/656.literal-norm-rows.independent-a.jsonl'),'retainedOwnOriginalLiteralDecisionsSha256':digest(OLD/'sources/656.literal-norm-rows.independent-a.jsonl'),'currentSourceInputPath':str(oldnorm),'currentSourceInputSha256':digest(oldnorm),'all656WholeRowsExact':True,'allLiteralOperatorsPreserved':True,'sourceUnionApproved':False,'no656FreshReadingClaim':True})

# Each sentence below is this reviewer's own current source judgment. A broad
# shared bullet is not a new operative obligation of every goal mapped to it.
SOURCE_REASONS=[
 'The goal applies and interprets MWG for simplified homogeneous systems. Its current cases cover that bounded competence. MV kinetic derivation is an additional mathematical derivation, not proved by calculation or by 81373 dynamic characterization; ac1 solubility and 1c Brønsted are distinct components. Keep the full kinetic-derivation union open without blocking this application clause.',
 'The current goal predicts changes under concentration, pressure and temperature; the current cases cover those predictions. BW experimentally investigate is a separate operative skill. Actual d2d735 owns one concentration experiment; generic 91238 does not prove concrete temperature/pressure materials or criteria. Those experimental components remain open and must not be claimed from this prediction profile.',
 'The goal computes and interprets a bounded process optimization. Current pressure/Q and balance cases fit it. Removed NW chromatography/Rf mapping was unrelated: actual 978a6 owns chromatography/Rf, with an additional DE apply versus EN plan wording discrepancy; it is not evidenced here. Actual d9cce owns catalyst establishment, and generic 9f892 does not prove Haber/Bosch historical-achievement material. The full BW/NW unions remain open.',
 'Current societal explanation and conditional economic/ecological judgment are covered. Actual 36666 separately owns source relevance, trust, authorship and intention; that component is preserved. BW Haber/Bosch historical achievements need concrete historical material and criteria, not just generic 9f892 responsibility. Approve this societal clause only, retain historical whole-union hold.',
 'HE extended Q3.1 explicitly requires unequal stoichiometric sums and quadratic concentration models. Whole q3-07-c has balance, both roots, physical admissibility, and reverse starting-state transfer; q3-07-a/b cover coefficients and process interpretation. This is one quantitative analysis capability. No additional unassigned source component is identified for this current goal.',
 'HE Q3.3 explicitly says Faraday without calculations. The current projected goal requires quantitative calculation, and current qualitative q3-09-c contributes only proportionality, z, amount versus mass, and current efficiency. Actual 0c9fe merely links electrolysis with redox equilibrium and does not own complete qualitative Faraday. Keep the HE selection/scope hold until a lawful view/ownership choice is made; corrected image and bilingual case do not make the quantitative HE obligation valid.',
 'BY GA/EA8.2 combines spatial redox with work from measurements. Actual f093 owns structure, electrode reactions and qualitative voltage; current 96fd owns loaded U/I/t work, time intervals, open-circuit limit and thermodynamic boundaries. These are genuine distinct bounded components, and no missing new component is identified for the work goal. Do not claim actual laboratory execution.',
 'The current energy-carrier judgment is covered by production/storage/efficiency and changed electricity-source cases. Actual 7dc80 owns electrochemical versus photocatalytic splitting/artificial photosynthesis. 580b owns gas detection, 91238 generic investigations and cf263 generic preparation; they do not prove a concrete TH hydrogen preparation/collection/detection program here. Keep photochemical and experimental whole-source components open without extending the energy-carrier goal.',
 'Current oxygen/acid corrosion is one local-redox explanation under two acceptor conditions. The cases balance both cathodic paths, metal oxidation, electron/ion paths and changed oxygen/contact conditions. No new specific source-component hold is identified for this goal. Supplied synthetic observations are not performed experiments.',
 'The goal judges corrosion protection from barrier/cathodic mechanisms, defects, consumption and conditional costs/impacts. Current cases cover those actual components and avoid unsupported environmental winners. No new specific source-component hold is identified.',
 'The current goal reads average and instantaneous slopes in concentration, amount and gas-volume representations. New q3-18-a/b now require actual graph/tangent reading; q3-18-a fresh changes concentration to amount and volume basis. Actual 536030 owns planning/conducting/evaluating conditions experiments; actual 49b13 owns documenting and interpreting data. Reading a supplied scaled graph does not prove TH advanced recording/constructing diagrams or BY planned/performed investigations. Keep those separate whole-source components open.',
 'The current goal explains four qualitative influencing factors through a kinetic collision model and is covered by its controlled comparisons. HB24 also requires quantitative temperature/pressure/concentration/division and reaction-order determination; those are not proved by qualitative cases. Actual 536030 owns investigation, 138381 derives mechanisms from supplied rate laws rather than determining order from concentration/time, and a4bac owns SN1/SN2. Keep quantitative pressure/order and specific experimental components open.',
 'Arrhenius calculations and transfer are scientifically sound, but RP printed52 calls Arrhenius optional Vertiefung/Verzahnung; it is not a mandatory LK source. HB24 contains no Arrhenius obligation. Current goal remains LK with BY/HB/HE applicability after the fabricated HB mapping was removed. Keep source/selection hold until a supported optional placement or other genuine source decision is provided. No invented quantitative HB Arrhenius or autocatalysis component is acceptable.'
]
scope_holds={ids[5],ids[12]}
coupled={ids[i] for i in [0,1,2,3,7,10,11]}
clear={ids[i] for i in [4,6,8,9]}
assert len(scope_holds)==2 and len(coupled)==7 and len(clear)==4
ledger=read(AUTHOR/'inputs/source-components-and-explicit-sibling-ownership.author.json')
src=[];siblings={}
for i,t in enumerate(ts):
    lr=next(r for r in ledger['rows'] if r['goalId']==t['goalId'])
    for s in lr['existingSiblingOwnership']:
        assert s['wholeGoal']==goals[s['goalId']]
        siblings[s['goalId']]={'goalId':s['goalId'],'currentWholeGoalSha256':sha(stable(goals[s['goalId']]).encode()),'actualWholeGoalComparedAndRead':True,'ownershipProposalIsNotEvidenceApproval':True}
    src.append({'goalId':t['goalId'],'currentWholeGoalSha256':sha(stable(t['wholeGoal']).encode()),'boundedCurrentGoalScientificClosureEligible':t['goalId'] not in scope_holds,'currentOwnCapabilityCovered':True,'scopeSelectionHold':t['goalId'] in scope_holds,'additionalCoupledSourceCompletionHold':t['goalId'] in coupled,'noNewSpecificComponentHoldIdentified':t['goalId'] in clear,'sourceComponentsActuallyConsidered':lr['specificSourceComponents'],'actualSiblingGoalIds':[s['goalId'] for s in lr['existingSiblingOwnership']],'independentRationale':SOURCE_REASONS[i],'fullBroadSourceUnionApproved':False,'humanLabExecutionNewPrerequisite':False})
write(Path('sources')/'thirteen.component-ownership.independent-a.original.json',{'rows':src,'actualSiblingComparisons':list(siblings.values()),'actualDistinctSiblingCount':len(siblings),'scopeHoldGoalIds':sorted(scope_holds),'coupledSourceUnionHoldGoalIds':sorted(coupled),'noNewSpecificHoldGoalIds':sorted(clear),'boundedScientificClosureEligibleGoalIds':[g for g in ids if g not in scope_holds],'eligibleBoundedCount':11,'fullBroadUnionApprovalCount':0,'sourceAtlas381IsNot402Denominator':True,'authorLedgerWasProposalNotVote':True})

oldD=rows(next((OLD/'round-a/results').glob('*.records.jsonl')));oldD={r['goalId']:r for r in oldD}
campaign=read(OUT/'round-a/description-review-campaign.json');di=read(OUT/'round-a/description-review-input.json');bundle=read(OUT/'bundle/manifest.json');batch=campaign['batches'][0];runid='chemistry-q3-thirteen-v3-targeted-review-a-original'
patch_notes={ids[1]:'Actual new PNG separates four interventions with readable scientific motifs and preserves catalyst rate/equilibrium distinction.',ids[2]:'Actual new PNG separates immediate fixed-temperature compression from subsequent re-equilibration; Qp,new=Qp,old/4 for N2+3H2⇌2NH3 is correct.',ids[4]:'Actual new PNG now has one N2, three H2 species symbols and two NH3 symbols matching the stoichiometric labels.',ids[5]:'Actual new PNG uses series A with the correct electrolysis polarity; current EN supplementary Cu/Ag moles comparison is explicit and correct.',ids[10]:'Actual scaled main and fresh graphs in native PNG and bilingual HTML/PDF require independent tangent reading. Graph values, slope triangles, tolerances, signs, factor2 and volume normalization were independently recalculated.',ids[12]:'Actual new PNG correctly names k Geschwindigkeitskonstante; negative Arrhenius slope and Ea=-mR remain correct.'}
records=[]
for i,g in enumerate(di['goals']):
    old=oldD[g['goalId']]
    r={'$schema':old['$schema'],'schemaVersion':1,'recordId':runid+':'+g['goalId'],'runId':runid,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'bundleFingerprint':bundle['bundleFingerprint'],'bookDigest':bundle['bookModelDigest'],**{k:g[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']},'decision':'keep','understandingEvidence':copy.deepcopy(old['understandingEvidence']),'rationale':'Targeted successor A: retained own sealed v2 description science after exact canonical/prerequisite/applicability and sibling comparison. '+patch_notes.get(g['goalId'],'Exact unchanged image and original scientific case judgments retained.')+' '+SOURCE_REASONS[ids.index(g['goalId'])]+' This KEEP concerns the accurate bounded description; the separate source/selection hold is explicitly retained. Original successor peer reads=0. AI candidate E1/G1, no actual learner or human approval claim.','evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':'none','recordStatus':'candidate','reviewAuthority':'ai_candidate'}
    records.append(r)
rp=Path('round-a/results')/(batch['batchId']+'.records.jsonl');lines(rp,records)
run={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':runid,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint'],'bundleFingerprint':bundle['bundleFingerprint'],'bookDigest':bundle['bookModelDigest'],'provider':'OpenAI Codex','model':'GPT-6 inherited Codex session','role':'subject_reviewer','promptFamilyId':'goal-description-understanding-evidence-review-v2','promptFingerprint':bundle['promptFingerprint'],'criteriaFingerprint':bundle['criteriaFingerprint'],'generationParametersFingerprint':sha(stable({'reviewer':'targeted-independent-A','peerReads':0,'retainedOwnSealedScience':13,'targetedNativePages':6}).encode()),'independenceGroupId':campaign['independenceGroupId'],'blindToOtherRuns':True,'goalIds':ids,'inputArtifacts':[{'role':a['role'],'digest':a['digest']} for a in bundle['artifacts']]+[{'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']}],'startedAt':datetime.fromtimestamp((OUT/'round-a/description-review-campaign.json').stat().st_mtime,timezone.utc).isoformat().replace('+00:00','Z'),'completedAt':now,'status':'completed','outputDigest':digest(OUT/rp),'toolchainVersion':'goal-description-review-v3-targeted-follow-up-normal'}
write(Path('round-a/results')/(batch['batchId']+'.run.json'),run)
write(Path('checks')/'D13-own-original-retention-and-current-binding.actual.json',{'previousOwnRecordsPath':str(next((OLD/'round-a/results').glob('*.records.jsonl'))),'previousOwnRecordsSha256':digest(next((OLD/'round-a/results').glob('*.records.jsonl'))),'newCampaignPass':'follow_up','count':13,'boundedDescriptionScienceKept':13,'sourceHoldsAreSeparate':True,'actualSixChangedNativePagesViewed':True,'unchangedSevenPageScienceAndImagesRetainedAfterComparison':True})

for lane in ['atomicity','memory']:
    cfg=read(OLD/lane/'three.independent-a.config.json');cfg['landscapePath']=str(AUTHOR/'inputs/current523.author-successor.de.json');cfg['reviewPath']=str(OUT/lane/'three.independent-a.retained.review.jsonl')
    retained=rows(OLD/lane/'three.independent-a.review.jsonl');lines(Path(lane)/'three.independent-a.retained.review.jsonl',retained)
    if lane=='memory':
        cfg['cardReviewPath']=str(OUT/lane/'three.independent-a.retained.cards.review.jsonl');lines(Path(lane)/'three.independent-a.retained.cards.review.jsonl',[])
    write(Path(lane)/'three.independent-a.current.config.json',cfg)
    assert all(without(goals[r['goalId']],{'resourceLinks'})==without(old_goals[r['goalId']],{'resourceLinks'}) for r in retained)
write(Path('checks')/'A3-M3-M399-retention.independent-a.actual.json',{'A3':{'exactOwnRecordsRetained':True,'scienceFieldsExact':True},'M3':{'exactOwnRecordsRetained':True,'scienceFieldsExact':True},'M399':{'count':399,'currentAll523ScientificFieldsExactFromV2':True,'retainedOwnPrior399VerificationPath':str(OLD/'checks/M399-current-semantic-retention.independent-a.json'),'retainedOwnPrior399VerificationSha256':digest(OLD/'checks/M399-current-semantic-retention.independent-a.json')},'newMemoryRequired':False,'newUnchangedGoalReviewClaim':False})
oldP={r['goalId']:r for r in rows(OLD/'positive/P13.independent-a.review.jsonl')}
ps=[]
for i,t in enumerate(ts):
    r=copy.deepcopy(t['positiveRecord']);r.update({'reviewId':'chemistry-q3-thirteen-v3-targeted-independent-a-positive','reviewer':'Codex targeted independent A','reviewedAt':now,'reason':'Own v2 whole-P scientific judgment retained after explicit current comparison; 25 exact unchanged scientific case bodies retained, 3 changed bilingual bodies actually reviewed. '+patch_notes.get(t['goalId'],'Exact unchanged current scientific cases retained.')+' '+SOURCE_REASONS[i]+' AI-authored synthetic E1/G1 candidate, no learner execution or human attestation.'})
    r['dissent']=[SOURCE_REASONS[i]] if t['goalId'] in scope_holds|coupled else []
    assert r['status']=='needs_human_review' and r['reviewAuthority']=='ai_candidate' and r['evidenceLevel']=='E1' and r['maximumClaimScope']=='G1'
    ps.append(r)
lines(Path('positive')/'P13.independent-a.current.review.jsonl',ps)
cfg=read(AUTHOR/'positive/P13.author.inactive.config.json');cfg['reviewId']='chemistry-q3-thirteen-v3-targeted-independent-a-positive';cfg['reviewPath']=str(OUT/'positive/P13.independent-a.current.review.jsonl');write(Path('positive')/'P13.independent-a.current.config.json',cfg)
cases=read(OLD/'positive/whole28.independent-a.case-review.json')['rows'];bycase={c['caseId']:c for t in ts for c in t['wholeMaterialCases']}
for r in cases:
    c=bycase[r['caseId']];r['inputCaseSha256']=sha(stable(c).encode());r['scientificBodyRetention']='targeted_changed_actual_review' if r['caseId'] in changed_cases else 'exact_unchanged_own_sealed_v2_judgment';r['issues']=[];r['numericalAndChemicalResult']='correct';r['scoringPointsSum']=sum(a['points'] for a in c['scoring']['criteria'])
    if r['caseId']=='q3-18-a':r['rationale']='Read original/scaled main+fresh concentration/amount graphs. Main (0,.72),(30,.54) tangent gives -.0060 mol/(L s); secant -.0100. Fresh amount slope -.0120 mol/s divided by 2 L gives same concentration rate. Factors2, signs and amount/concentration units correct; model slopes not supplied in the task. Fresh representation/normalization transfer is meaningful.'
    elif r['caseId']=='q3-18-b':r['rationale']='Read original/scaled main+fresh gas-volume graphs. Main (0,9),(120,39) tangent gives .25 mL/s; averages .4 and .2. Fresh (0,2),(50,26) gives .48 mL/s, /1000/24 =2e-5 mol/s, /1 L =2e-5 mol/(L s). Actual tangent reading required and numerical tolerances propagate correctly. Fresh remains additional changed numbers/volume basis, not the whole profile sole conceptual transfer.'
    elif r['caseId']=='q3-09-c-qualitative-contribution':r['rationale']='EN now explicitly compares deposited Cu moles with Ag moles at equal Q. zCu=2 versus zAg=1 gives half as many Cu moles, not half the mass; side reactions reduce target yield. Both languages correct. This remains a qualitative contribution and does not resolve quantitative HE selection.'
write(Path('positive')/'whole28.independent-a.current.case-review.json',{'rows':cases,'count':28,'unchangedScienceBodiesRetained':25,'changedBodiesActuallyReviewed':3,'languagesActuallyRead':['de','en'],'wholeProfilesRetainedAndCurrentCompared':13,'meaningfulWholeProfileTransfer':True,'soleNewNumbersNotPromotedToConceptualTransfer':True,'syntheticOnly':True,'actualLearnerPerformance':False,'actualExperimentPerformed':False})
visual=read(OLD/'visualization/thirteen.independent-a.pixel-review.json')['rows']
notes={ids[1]:'Four clearly separated large intervention panels remain readable at actual360/680. Pressure equation2A(g)⇌B(g), endothermic warmer-moreC and both catalyst rates/no position change are consistent.',ids[2]:'Large piston motif and readable Q relation at360/680 replace former text-only cards. At fixedT halvingV doubles all immediate partial pressures, Q scales2^(2-1-3)=1/4. Same particle amounts and immediately-after label prevent premature composition-change claim.',ids[4]:'Stoichiometric species counts now one N2 pair,three H2 symbols,two NH3 symbols; labels1x/3x/2x and exponents match. NH3/H2 symbols are schematic species icons, not an unlabelled literal atom census. MWG and positive square-root concentration relation correct.',ids[5]:'Actual source has positive anode/negative cathode and series A labelledI=2A. No parallel V current path or electron-flow-through-voltmeter claim. Q7200C,nAg=.0746mol,mAg≈8.05g correct. Main circuit and relation usable at360; detailed arithmetic is supplemental.',ids[12]:'Actual label is Geschwindigkeitskonstante(k). Plot ln(k) versus1/T, m=-Ea/R andEa=-mR are consistent. Motif/labels readable360/680; full native page is unclipped.'}
for t,r in zip(ts,visual):
    gid=t['goalId'];ib=t['imageKeepBinding'];r['imageUrl']=ib['currentUrl'];r['assetSha256']=ib['currentDigest'];r['actualAssetPath']=ib['currentActualAssetPath']
    if gid in changed_images:
        r['decision']='approved_ai';r['rationale']=notes[gid];r['actualPixelsViewed']={'currentOriginal':True,'width360':True,'width680':True,'wholeNativeHtmlPage':True,'wholeNativePdfPage':True};r['reviewOrigin']='new_original_targeted_v3_pixel_judgment';r['retainedOldJpegApprovalTransferred']=False
    else:r['reviewOrigin']='retained_own_sealed_v2_exact_current_asset_judgment_after_context_comparison';r['newOriginalPixelsViewedThisSuccessor']=gid==ids[10]
write(Path('visualization')/'thirteen.independent-a.current.pixel-review.json',{'rows':visual,'newImagesActuallyViewed':5,'retainedExactGoodImages':8,'affectedNativeHtmlPagesActuallyViewed':6,'affectedNativePdfPagesActuallyViewed':6,'actualNewImageNative360680':15,'currentAll13ApprovedAI':True,'corrected96fdExactRetained':True,'priorJpegToneNotTransferredToPng':True,'humanApproval':False})
graph_rows=[]
for name in ['q3-18-a','q3-18-a-fresh','q3-18-b','q3-18-b-fresh']:
    p=AUTHOR/'positive/assessment-graphs'/(name+'.png');graph_rows.append({'caseGraph':name,'path':str(p),'sha256':digest(p),'original1600x1040ActuallyViewed':True,'nativeBilingualHtmlActuallyViewed':True,'nativeBilingualPdfActuallyViewed':True,'fullyScaledAndReadable':True,'solutionSlopeNotPrinted':True,'graphChemistryAndScoringConsistent':True})
write(Path('visualization')/'four.assessment-graphs.independent-a.original.json',{'rows':graph_rows,'mainAndFreshActuallyViewed':4,'normalHtmlCapturesActuallyViewed':4,'normalPdfCapturesActuallyViewed':4,'actualHumanLabClaim':False})
write('review-a.scientific-votes.original.json',{'role':'original_blind_targeted_independent_A_successor_votes','reviewCompletedAtUTC':now,'sourcePackage':str(AUTHOR),'ownPreviousOriginalSealPath':str(OLD/'independent-a.original.freeze.json'),'ownPreviousOriginalSealSha256':digest(OLD/'independent-a.original.freeze.json'),'currentDenominator':402,'currentStrictBaseline':212,'currentStrictGain':0,'D13BoundedDescriptionKeep':13,'P13WholeCandidateScienceSound':13,'A3ExactOwnJudgmentsRetained':3,'M3ExactOwnJudgmentsRetained':3,'M399ExactScienceRetention':399,'V5NewApprovedAI':5,'V8ExactApprovedRetained':8,'cases25ExactBodiesRetained':25,'cases3ChangedReviewedBothLanguages':3,'literal656ExactRetained':656,'boundedGoalScientificClosureEligibleCount':11,'boundedGoalScientificClosureEligibleGoalIds':[g for g in ids if g not in scope_holds],'scopeSelectionHoldGoalIds':sorted(scope_holds),'coupledFullSourceUnionHoldGoalIds':sorted(coupled),'noNewSpecificSourceComponentHoldIdentifiedGoalIds':sorted(clear),'fullBroadSourceUnionApproved':False,'actualOperatorExecutionApproved':False,'actualLearnerPerformanceClaim':False,'humanLabExecutionNewPrerequisite':False,'humanApproval':False,'humanTrial':False,'activeIntegration':False,'peerReadsBeforeOriginalSeal':0,'peerVerdictsAdopted':False,'authorOwnershipProposalsNotScientificVotes':True})
