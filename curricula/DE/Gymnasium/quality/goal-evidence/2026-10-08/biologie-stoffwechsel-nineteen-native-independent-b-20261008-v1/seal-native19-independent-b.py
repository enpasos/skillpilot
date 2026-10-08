import pathlib,json,hashlib,datetime
q=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08');o=q/'biologie-stoffwechsel-nineteen-native-independent-b-20261008-v1';b=q/'biologie-stoffwechsel-nineteen-native-technical-20261008-v1'
seal=o/'native19-b.first-verdict.seal.json'
assert not seal.exists(),'Immutable first verdict already exists'
load=lambda p:json.loads(pathlib.Path(p).read_text())
rec=lambda p:{'path':str(p),'sha256':'sha256:'+hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest(),'bytes':pathlib.Path(p).stat().st_size}
api=load(o/'native19-b.actual-API-and-campaign-validation.json');ret=load(o/'native19-b.scoped-retention-and-final-input-check.json');port=load(o/'native19-b.original-input-and-output-portability.audit.json');pdf=load(o/'actual-native-PDF19-and-embedded-raster-checks.json');verdict=load(o/'D19-P19-actual-native.independent-b.first-verdict.json')
assert api['allPassed'] and ret['allPassed'] and pdf['allPassed']
assert port['allPortableBoundPathsHaveRepositoryFileOrExactBundleAlias'] and port['allHistoricalBSealedOutputsRemainExact']
assert verdict['descriptionKEEP']==19 and verdict['positiveNativePASS']==19 and not verdict['newAResultsReadBeforeFirstVerdict']
results=b/'native-nineteen/round-b/results';positive=o/'P19-current-raster.actual-independent-b.records.jsonl'
assert len(list(results.glob('*.records.jsonl')))==1 and len(list(results.glob('*.run.json')))==1
priorseal=[q/'biologie-stoffwechsel-source-roles-independent-b-resume-20261008-v1/independent-b.first-verdict.seal.json',q/'biologie-stoffwechsel-visualization-independent-b-first3-20261008-v1/visualization-b.first-verdict.seal.json',q/'biologie-stoffwechsel-visualization-independent-b-final17-20261008-v1/visualization-b.final17.first-verdict.seal.json']
current=datetime.datetime.now(datetime.timezone.utc).isoformat()
holds=['HE bounded partial authored source role is not whole HE/BY/NI coverage or approval','All original regional whole duties and source-role exclusions remain; 45 duties and293 partner rows are retained through sealed SOURCE B','Excluded ordinals1/2/3/8/16 remain outside this19-goal native review','Legacy Neuro GK2 remains excluded','Planning/evaluation didactic evidence does not establish actual practical execution','E1/G1 authored understanding witnesses are not real learner evidence, human approval or human trial','No runtime extra-task quota follows from the two authored DE/EN coverage witnesses','No new active integration, strict closure or scientific/A/M re-review claimed']
handoff={'schemaVersion':1,'createdAtUtc':current,'role':'Neutral actual native19 independent B handoff after own first verdict; retained SOURCE/Science/A/M decisions are not new reviews','firstSealPath':str(seal),'resultsDirectory':str(results),'positiveReviewPath':str(positive),'peerNativeDPReadBeforeFirstSeal':False,'Dkeep':19,'nativeBlockingFindings':[],'nativeSummary':{'DKEEP':19,'PCurrentNativePASS':19,'VCurrent19KEEPFromOwnSealedActualImageReviews':19,'actualPhysicalPDFPages':21,'actualGoalPDFPages':19,'fullCurrentContextBase':392,'wholeCanonicalGoals':476,'descriptionCampaignErrors':0,'positiveAPIErrors':0,'profileBodiesChanged':0,'wholeV4CasesChanged':0,'other457WholeGoalsExact':True,'other373WholePagesExact':True,'all392HumanFieldsExact':True,'native439FrozenInputHashFailures':0},'wholeGoalIds':load(b/'neutral-current-nineteen-native.technical.entry.json')['selectedGoalIds'],'reviewRunIds':[],'PReviewRunIds':[],'ordinaryDRunId':'biologie-native19-independent-b-first-pass-20261008-v1','DRunIsNotPReviewRunManifest':True,'reviewAuthority':'ai_candidate','status':'needs_human_review','evidenceLevel':'E1','maximumClaimScope':'G1','priorOwnSealedEvidence':[rec(p)for p in priorseal],'firstInputSeals':[rec(o/'native19-entry.first-input.freeze.json'),rec(o/'native19-all-materialized-inputs.first.freeze.json')],'actualNativeDecisionPath':str(o/'D19-P19-actual-native.independent-b.first-verdict.json'),'actualValidationPath':str(o/'native19-b.actual-API-and-campaign-validation.json'),'scopedRetentionPath':str(o/'native19-b.scoped-retention-and-final-input-check.json'),'portabilityAuditPath':str(o/'native19-b.original-input-and-output-portability.audit.json'),'actualPdfInspectionPath':str(o/'actual-native-PDF19-and-embedded-raster-checks.json'),'holds':holds,'newScienceReviews':0,'newAtomicityReviews':0,'newMemoryReviews':0,'activeWrites':0,'newStrictClosures':0,'humanApproval':False,'humanTrial':False}
(o/'neutral-current-nineteen-native.independent-b.handoff.entry.json').write_text(json.dumps(handoff,ensure_ascii=False,indent=2)+'\n')
(o/'README.md').write_text('''# Independent native Biologie B19 first verdict

The independently inspected current 19 goal pages pass the bounded native description and positive evidence review. Ordinary campaign B contains 19 genuine KEEP description records and a matching genuine D run. The separate P19 records bind the exact current whole goals, unchanged valid v5 profile bodies, unchanged v4 DE/EN cases, full392 context and final real PNG resources. P reviewRunIds remain empty: the description run is not a P run manifest.

All21 real PDF pages (two frontmatter plus19 goal pages) were rendered and inspected. Each embedded raster matches its actual render-manifest derivative and the accepted current image. Source/Science/A/M judgments and previous own actual V findings are retained as sealed existing decisions; they are not re-labelled as new scientific reviews. New native A judgments remained unread before this B first seal.

The scoped comparison preserves all457 other whole canonical goals, all373 other whole pages, all373 other whole QA records and all392 Human fields. Selected19 canonical changes are resourceLinks only; selected19 native page changes are visualization and derived pageFingerprint only. All439 materialization/external receipts were checked again without hash drift.

The portability audit uses normal Git ignore semantics, respecting index membership. The ignored render-root PDF/HTML have byte-exact eligible bundle copies. Nine ignored raw original PDF caches may stay local: their reviewed complete original pages, durable official URLs and source document records are portable and bound. Historic own SOURCE/V/Chem2 seals were verified and remain unchanged.

ResultsDirectory: '''+str(results)+'''

positiveReviewPath: '''+str(positive)+'''

firstSealPath: '''+str(seal)+'''

Holds remain: bounded partial HE roles are not BY/NI or whole-source approval; all original regional duties and exclusions remain; ordinals1/2/3/8/16 and legacy Neuro GK2 remain excluded; authored plan/evaluation does not certify actual practical execution. Candidate status remains needs_human_review, ai_candidate, E1/G1. No learner evidence, human approval/trial, new strict closure or active integration is claimed. Authored paired witnesses do not impose an extra-task quota on runtime coaching.
''')
# Final same-input check is executed before the one immutable seal is created.
f=load(b/'native-nineteen.first-materialization.freeze.json');fails=[]
for r in f['files']+f['externalInputBindings']:
 p=pathlib.Path(r['path'])
 if not p.is_file() or rec(p)['sha256'].removeprefix('sha256:')!=r['sha256'].removeprefix('sha256:')or p.stat().st_size!=r['bytes']:fails.append(r['path'])
assert not fails,fails
outputs=[rec(p)for p in sorted(o.rglob('*'))if p.is_file()and p!=seal]+[rec(p)for p in sorted(results.glob('*'))if p.is_file()]
d={'schemaVersion':1,'sealedAtUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'Immutable independently authored B19 first native D/P verdict and actual bindings','reviewer':'OpenAI Codex independent B; exact integrated model identity not exposed','peerNativeDPReadBeforeFirstSeal':False,'ownFirstVerdictBeforePeerNativeComparison':True,'Dkeep':19,'PnativePASS':19,'nativeBlockingFindings':[],'retainedCurrentOwnV19KEEP':19,'PReviewRunIds':[],'outputCount':len(outputs),'outputs':outputs,'finalAuthorMaterializationInputReceipts':439,'finalAuthorMaterializationInputHashFailures':fails,'firstInputSeals':[rec(o/'native19-entry.first-input.freeze.json'),rec(o/'native19-all-materialized-inputs.first.freeze.json')],'preservedOwnPriorSeals':[rec(p)for p in priorseal],'scopeHoldsRetained':holds,'newScientificReviews':0,'newAtomicityReviews':0,'newMemoryReviews':0,'activeWrites':0,'newStrictClosures':0,'humanApproval':False,'humanTrial':False}
with seal.open('x')as h:h.write(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
# Read-only verification after creation.
v=load(seal);fail=[r['path']for r in v['outputs']if not pathlib.Path(r['path']).is_file()or rec(r['path'])['sha256']!=r['sha256']or pathlib.Path(r['path']).stat().st_size!=r['bytes']]
assert not fail
print(json.dumps({'firstSealPath':str(seal),'sha256':rec(seal)['sha256'],'outputs':len(outputs),'outputHashFailures':fail,'neutralEntry':str(o/'neutral-current-nineteen-native.independent-b.handoff.entry.json'),'resultsDirectory':str(results),'positiveReviewPath':str(positive),'Dkeep':19,'nativeBlockingFindings':[]},ensure_ascii=False))
