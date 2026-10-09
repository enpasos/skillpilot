"""First author seal for actual finite science inputs; images/native remain separate pending."""
import hashlib
import importlib.util
import json
from pathlib import Path
from datetime import datetime, timezone

ROOT=Path.cwd();OWN=Path(__file__).resolve().parent
PREP=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-next-molecular-genetics-twenty-three-preparation-a-v1'
def bind(p):
 b=p.read_bytes();return {'path':str(p.relative_to(ROOT)),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(name,obj):
 p=OWN/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n');return p
assert not (OWN/'whole23-science-author.first.freeze.json').exists(),'Immutable first seal exists'
whole=json.loads((OWN/'twenty-three-whole46-bilingual-cases-and-P.author-candidate.json').read_text())
records=[json.loads(line) for line in (OWN/'twenty-three-whole-positive.author-candidate.review.jsonl').read_text().splitlines()]
assert len(records)==23 and len(whole['entries'])==23
assert all(r['reviewAuthority']=='ai_candidate' and r['status']=='needs_human_review' and r['evidenceLevel']=='E1' and r['maximumClaimScope']=='G1' and r['reviewRunIds']==[] for r in records)
assert sum(len(e.get('newAuthoredWholeCases',[])) for e in whole['entries'])==42
assert sum(len(e.get('exactHistoricalWholeCases',[])) for e in whole['entries'])==4
reuse=json.loads((PREP/'two-existing-genetic-code-and-protein-mechanism-candidates.exact-neutral-reuse.json').read_text())
for old in reuse['rows']:
 e=next(e for e in whole['entries'] if e['goalId']==old['goalId'])
 assert e['exactHistoricalWholeMaterial']==old['wholeHistoricalCandidateMaterial']
 assert e['exactHistoricalWholeCases']==old['wholeHistoricalCandidateMaterial']['tasks']
before=json.loads((OWN/'original-current-goal-kinds-source-and-history-preservation.actual.json').read_text())
for k in ['activeCanonBefore','activeKindsBefore']:
 b=before[k];assert bind(ROOT/b['path'])==b
intake=json.loads((PREP/'next-package.input.json').read_text())
for b in intake['allRelevantActualInputBindings']: assert bind(ROOT/b['path'])==b
spec=importlib.util.spec_from_file_location('existing_schema_validator',ROOT/'scripts/validate_schemas.py')
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
schema=json.loads((ROOT/'docs/landscape-runtime.schema.json').read_text())
checked=[]
for p in sorted(OWN.rglob('*.json')):
 ok=module.validate_file(str(p),schema)
 assert ok,p
 checked.append(bind(p))
check=write('checks/actual-ordinary-schema-portability-and-whole-reuse.json',{
 'schemaVersion':1,'normalValidator':'scripts/validate_schemas.py validate_file, unchanged classifier/schema',
 'validatedFiles':checked,'validationFailures':[], 'normalP23Terminal':bind(OWN/'checks/ordinary-P23.terminal.actual.json'),
 'normalP23Output':bind(OWN/'checks/ordinary-P23.stdout.actual.txt'),
 'P23CurrentAuthorRecords':len(records),'independentReviewRunClaims':0,'newWholeBilingualCases':42,'exactHistoricalWholeCases':4,
 'all180OriginalIntakeBindingsStillExact':True,'activeCanonicalAndKindsStillExact':True,'strictGain':0,'activeWrites':[]})
entry=write('neutral-whole23-source38-partners44-P23-cases46.author-independent-review.entry.json',{
 'schemaVersion':1,'role':'Neutral whole-science author intake for23unchanged current goals; no peer outcomes or approvals',
 'preparedAt':datetime.now(timezone.utc).isoformat(),'currentCanonicalNodes':479,'currentCurricularAtoms':394,
 'currentStrictComplete':276,'selectedGoalIds':[e['goalId'] for e in whole['entries']],
 'wholeInput':bind(OWN/'input/whole-current23-source38-and-whole-partners44.exact-neutral-input.json'),
 'actualWholePrimaryReadingBindings':bind(OWN/'input/actual-primary-whole-context-reading.bindings.json'),
 'wholeMaterialsAndProfileBodies':bind(OWN/'twenty-three-whole46-bilingual-cases-and-P.author-candidate.json'),
 'normalPositiveCandidateSet':bind(OWN/'twenty-three-whole-positive-profile-candidate-set.author.json'),
 'ordinaryPositiveConfig':bind(OWN/'twenty-three-whole-positive.author-candidate.config.json'),
 'ordinaryAuthorPositiveRecords':bind(OWN/'twenty-three-whole-positive.author-candidate.review.jsonl'),
 'originalWholeCodeWheelDependencies':bind(PREP/'exact-historical-code-wheel-material-dependency.bindings.json'),
 'originalHistoricalWholeCases':bind(PREP/'two-existing-genetic-code-and-protein-mechanism-candidates.exact-neutral-reuse.json'),
 'supplementaryMechanismReferencesAndLimits':bind(OWN/'scientific-supplementary-reference-and-model-limits.author.json'),
 'technicalChecks':bind(check),
 'reviewState':{'freshWholeScienceAndSourceReview':'pending_two_independent_actual_reviews','finalActualPNG23':'not_yet_generated',
                'nativeD23AndCurrentRasterP23':'pending_actual_assets_and_frame','visualizationReview':'pending_two_independent_actual_views',
                'existingAM394':'unchanged_valid_reuse_only'},
 'newWholeBilingualCases':42,'exactHistoricalWholeCases':4,'wholeSourceDuties':38,'wholeSourcePartners':44,
 'sourceAndCourseScopeApproval':False,'practicalOperatorsApprovedThroughConstructedCases':False,
 'humanApproval':False,'humanTrial':False,'strictGain':0,'activeWrites':[]})
outputs=[bind(p) for p in sorted(OWN.rglob('*')) if p.is_file() and '__pycache__' not in p.parts]
seal=write('whole23-science-author.first.freeze.json',{
 'schemaVersion':1,'role':'First immutable actual author science packet, not an independent or human review',
 'createdAt':datetime.now(timezone.utc).isoformat(),'entry':bind(entry),'inputs':intake['allRelevantActualInputBindings'],
 'outputs':outputs,'newWholeBilingualCases':42,'exactHistoricalWholeCases':4,'strictGain':0,'activeWrites':[]})
print(json.dumps({'entry':bind(entry),'firstSeal':bind(seal),'outputs':len(outputs),'P23ActualExit':0,'strictGain':0,'activeWrites':[]}))
