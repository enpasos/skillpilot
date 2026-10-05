# SPDX-License-Identifier: Apache-2.0
"""Author prospective TF/methylation inputs; native consumers run in isolation."""
from pathlib import Path
from datetime import datetime, timezone
import copy, hashlib, json, os, shutil, uuid

ROOT = Path(__file__).resolve().parents[7]
OWN = Path(__file__).resolve().parent
REL = OWN.relative_to(ROOT).as_posix()
ISO = ROOT / 'tmp/biologie-q1-tf-methylation-native-isolated-20261005-v1'
PRIOR = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-six-current-source-hold-remediation-candidate-v1'
NOW = datetime.now(timezone.utc).isoformat()
TF = '946ce2e7-c30d-5670-839d-003b0619c284'
NS = uuid.UUID('fd8eb76f-7f91-4e69-8fb9-7a1647d4b0bb')
SEED = 'biology:08a43a1b-d97e-522c-9dfa-c950a493364e:eukaryotic-dna-methylation-transcription-context'
METH = str(uuid.uuid5(NS, SEED))
PARENT = '96bdf495-2801-57e4-a0da-ce3bf91e402c'
EXAM = '3ac1cbb1-a366-5ae5-85c0-76b08270869d'
HE_SOURCE = 'b8aa6b7a-8598-4498-83f5-5162bc3cb419'
BY_SOURCE = '925fc9a9-6e86-54ff-a294-de755d5ba47a'
CANON = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
SEMANTIC = 'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'
QA = 'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json'
ATLAS = 'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'
REGISTRY = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'

def read(p): return json.loads(Path(p).read_text())
def sha(p): return 'sha256:' + hashlib.sha256(Path(p).read_bytes()).hexdigest()
def write(p, value):
    p = Path(p); p.parent.mkdir(parents=True, exist_ok=True)
    assert not p.is_symlink(), p
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
def detach(rel):
    p = ISO / rel
    if p.is_symlink():
        target = p.resolve(); p.unlink(); shutil.copy2(target, p)
    return p
def own(name, value): write(OWN / name, value)

assert not ISO.exists(), 'Never reset a previously prepared isolation implicitly'
canon = read(ROOT / CANON); by = {g['id']: g for g in canon['goals']}
assert len(canon['goals']) == 441 and METH not in by
assert read(ROOT / SEMANTIC)['counts']['curricularAtomic'] == 363
comp = copy.deepcopy(read(PRIOR / 'two-preservation-companions.candidates.json')['goals'][0])
assert comp['candidateKey'] == 'dna-methylation-eukaryotes'
tf_candidate = copy.deepcopy(next(g for g in read(PRIOR / 'six-finalized-description.candidates.json')['goals'] if g['goalId'] == TF)['finalizedCandidateGoal'])
new = copy.deepcopy(by[TF])
new.update(id=METH, shortKey='canonical_biology_eukaryotic_dna_methylation_transcription',
    title=comp['proposedTitleDe'], titleEn=comp['proposedTitleEn'],
    description=comp['proposedDescriptionDe'], descriptionEn=comp['proposedDescriptionEn'],
    requires=comp['requiresCandidate'], tags=['GK', 'LK', 'canonical', 'SekII'])
new['extendedData']['applicabilityMappingInheritance'] = 'boundary'
new['extendedData']['provenance'].update(sourceGoalId=HE_SOURCE)
new['sourceRef'] = 'Hessen KC Biologie Oberstufe 2024, Q1.2, gedruckte S.39; partielle DNA-Methylierungs-Komponente'
duplicates = [g for g in canon['goals'] if any(w in (g.get('title', '')+' '+g.get('description', '')).lower() for w in ['methyl', 'epigen'])]
own('equivalence-and-stable-id.receipt.json', {
    'status':'inactive_author_candidate', 'namespace':str(NS), 'seed':SEED, 'newGoalId':METH,
    'nativeConventionPath':'scripts/adopt_hessen_upper_secondary_into_canonical.py',
    'existingGoalsInspected':duplicates,
    'equivalentReviewedGoalFound':False,
    'reason':'No standalone reviewed GK/LK DNA-methylation goal with this supplied-model/data scope exists. 99544494 combines methylation/acetylation and remains broad LK; 8f6933b1 is histone modification; 6f313681 is environmental epigenetic inheritance. All remain unchanged.',
    'currentCanonicalCount':441, 'prospectiveCanonicalCount':442,
    'currentCurricularAtomicCount':363, 'prospectiveCurricularAtomicCount':364,
    'strictGainClaim':0, 'humanApproval':False})
candidate = copy.deepcopy(canon); cby = {g['id']:g for g in candidate['goals']}
cby[TF].update(tf_candidate)
index = cby[PARENT]['contains'].index(TF) + 1
cby[PARENT]['contains'].insert(index, METH)
candidate['goals'].insert(next(i for i,g in enumerate(candidate['goals']) if g['id']==TF)+1, new)
exam_before = copy.deepcopy(cby[EXAM]); exam = cby[EXAM]
for field in ['requires']:
    exam[field].insert(exam[field].index(TF)+1, METH)
exam['examData']['coveredGoalIds'].insert(exam['examData']['coveredGoalIds'].index(TF)+1, METH)
rubric = exam['examData']['scoring']
assert rubric['maxPoints']==30 and [s['points'] for s in rubric['steps']]==[7,7,8,7]
rubric['steps'][0]['points']=8
own('assessment-targeted-rubric-correction.candidate.json', {
    'status':'inactive_author_candidate', 'goalId':EXAM,
    'observedTaskBE':[8,7,8,7], 'observedSolutionBE':[8,7,8,7], 'observedStepBE':[7,7,8,7],
    'observedStepSum':29, 'declaredMaxPoints':30, 'proposedStepBE':[8,7,8,7], 'proposedStepSum':30,
    'correction':{'path':'examData.scoring.steps[0].points','before':7,'after':8},
    'rationale':'Task 1 and its published solution already assign 8 BE to the same existing criterion linking promoter methylation, mRNA and protein. Aligning s1 to those declared 8 BE corrects the arithmetic mismatch without inventing credit, expanding the criterion or changing maxPoints/passingPoints.',
    'sourceScope':'The exam already examines both transcription-factor binding and promoter methylation. Keep 946 TF and add the methylation companion to requires and coveredGoalIds.',
    'beforeGoal':exam_before,'afterGoal':exam,'maxPointsChanged':False,'scientificExamAcceptance':'pending independent assessment/content check', 'humanApproval':False})
own('canonical.delta.candidates.json', {
    'schemaVersion':1,'status':'inactive_author_candidate','createdAtUTC':NOW,
    'newGoal':new,'retainedGoalBefore':by[TF],'retainedGoalAfter':cby[TF],
    'parentBefore':by[PARENT],'parentAfter':cby[PARENT],
    'assessmentDeltaPath':REL+'/assessment-targeted-rubric-correction.candidate.json',
    'exactCompanionDEENAndProfilePreserved':True,'applicabilityBoundary':'Only independently source-supported HE/BY component views; no automatic inheritance from broad ancestor mappings.',
    'preservedGoalIds':['99544494-1825-5fc1-8e23-56f0df808e56','8f6933b1-6e02-5512-acf2-a90a7fb9cb75','6f313681-5e31-5c82-b388-336d85ab1663'],
    'currentStrictClosuresClaimed':0,'humanApproval':False})
own('methylation-v3-inner-preservation.candidate.json',comp)

# Capture current operative paths and prior frozen author package before any isolation.
atlas = read(ROOT / ATLAS); registry=read(ROOT / REGISTRY)
bio = next(s for s in registry['subjects'] if s['subject']=='biologie')
he_old = next(p for p in atlas['mappingPaths'] if '/DE-HE/upper-secondary/' in p)
by_old = next(p for p in atlas['mappingPaths'] if '/DE-BY/' in p)
assert 'm7-q1-gel-current-20261005-v1' in he_old and 'm7-q1-gel-current-20261005-v1' in by_old
he_extraction_old=read(ROOT/he_old)['sourceExtractionPath']
paths=[CANON,SEMANTIC,QA,ATLAS,REGISTRY,he_old,by_old,he_extraction_old,
    bio['semanticAtomicityConfigPath'],bio['memoryReviewConfigPath'],
    read(ROOT/bio['semanticAtomicityConfigPath'])['reviewPath'],read(ROOT/bio['memoryReviewConfigPath'])['reviewPath'],
    'curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json']
for p in sorted((ROOT/'app/scripts/config/goal-books/source-views/de-gym-biology-national-atlas').rglob('*')):
    if p.is_file(): paths.append(p.relative_to(ROOT).as_posix())
own('active-input-boundary.before.json', {'paths':[{'path':p,'sha256':sha(ROOT/p)} for p in paths], 'priorFreeze':{'path':str((PRIOR/'author-candidate.freeze.json').relative_to(ROOT)),'sha256':sha(PRIOR/'author-candidate.freeze.json')},'noActiveMutationAuthorized':True})

ISO.mkdir(parents=True)
codes=[]
for rel in ['app/scripts','scripts']:
    shutil.copytree(ROOT/rel,ISO/rel,symlinks=False)
    for p in sorted((ROOT/rel).rglob('*')):
        if p.is_file():
            q=ISO/p.relative_to(ROOT); assert sha(p)==sha(q)
            codes.append({'path':p.relative_to(ROOT).as_posix(),'sha256':sha(p)})
for rel in ['app/src','app/node_modules','docs','contracts']:
    q=ISO/rel; q.parent.mkdir(parents=True,exist_ok=True);q.symlink_to(ROOT/rel,target_is_directory=True)
leaf_count=0; safety_detaches=[]
for rel in ['curricula','app/public','backend/src/main/resources/static']:
    for base,children,files in os.walk(ROOT/rel,followlinks=False):
        base=Path(base);target=ISO/base.relative_to(ROOT);target.mkdir(parents=True,exist_ok=True)
        for name in files:
            src=base/name;dst=target/name
            if dst.exists() or dst.is_symlink():continue
            dst.symlink_to(src);leaf_count+=1
            # Native import writes the actual prompt.de.md path. Native PDF rendering
            # can refresh existing public JPG derivatives. Both must be detached.
            if name=='prompt.de.md' or (rel=='app/public' and src.suffix.lower() in ['.jpg','.jpeg']):
                dst.unlink();shutil.copy2(src,dst);safety_detaches.append(src.relative_to(ROOT).as_posix())
for rel in ['app/package.json','app/tsconfig.json','app/tsconfig.node.json','package.json','AGENTS.md','LICENSING.md','LICENSE']:
    if (ROOT/rel).exists():
        q=ISO/rel;q.parent.mkdir(parents=True,exist_ok=True);q.symlink_to(ROOT/rel)
for rel in [CANON,SEMANTIC,QA,ATLAS]:detach(rel)
own('native-code-and-write-isolation.receipt.json',{'isolationRoot':str(ISO),'nativeCodeByteIdentical':codes,'readOnlyDirectorySymlinks':['app/src','app/node_modules','docs','contracts'],'leafFileSymlinkCount':leaf_count,'actualPromptAndPublicJPGPathsDetached':safety_detaches,'activeWrites':0})

# Current baseline is native-renderable before prospective changes.
base_book=read(ROOT/'app/scripts/config/goal-books/de-gym-biology-national-atlas.json')
base_book['outputPath']=REL+'/baseline-full.book-model.json'
own('baseline-book.config.json',base_book);detach(REL+'/baseline-book.config.json') if (ISO/REL/'baseline-book.config.json').exists() else None
write(ISO/REL/'baseline-book.config.json',base_book)
own('current-central.registry.snapshot.json',registry)
write(ISO/REL/'current-central.registry.snapshot.json',registry)

# Candidate source copies are authored from CURRENT Gel inputs, never old baseline.
he_extraction_new='curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_BIOLOGIE_SEKII_KC2024.m7-q1-tf-methylation-candidate-20261005-v1.source-extraction.json'
he_new='curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_biology_upper_secondary_source_extraction_to_canonical_biology.m7-q1-tf-methylation-candidate-20261005-v1.review.json'
by_new='curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_biology_source_extraction_to_canonical_biology.m7-q1-tf-methylation-candidate-20261005-v1.review.json'
he_ext=read(ROOT/he_extraction_old)
delta=next(d for d in read(PRIOR/'he-six-source-extraction-deltas.candidates.json')['deltas'] if d['sourceGoalId']==HE_SOURCE)
idx=next(i for i,g in enumerate(he_ext['sourceGoals']) if g['id']==HE_SOURCE)
assert he_ext['sourceGoals'][idx]==delta['before']
he_ext['sourceGoals'][idx]=copy.deepcopy(delta['after'])
# The source row retains its full authored combined description; raw official clause
# carries both mechanisms. The two partial targets never replace the whole source.
he_ext['sourceGoals'][idx]['description']=delta['before']['description']
he=read(ROOT/he_old);he['reviewId']=Path(he_new).stem;he['sourceExtractionPath']=he_extraction_new
row=next(r for r in he['mappings'] if r['legacyGoalId']==HE_SOURCE and r['canonicalGoalId']==TF)
assert row['matchType']=='exact';row['matchType']='partial'
he['mappings'].append({'legacyGoalId':HE_SOURCE,'canonicalGoalId':METH,'matchType':'partial','reviewDecisionId':HE_SOURCE})
d=next(d for d in he['decisions'] if d['sourceGoalId']==HE_SOURCE)
d.update(canonicalGoalIds=[TF,METH],matchType='partial',reviewer='Codex prospective source candidate author',reviewedAt=NOW,
    rationale='Inaktiver Quellenkandidat: Amtliches HE Q1.2, gedruckte S.39, GK/LK nennt Transkriptionsfaktoren und DNA-Methylierung gemeinsam. Zwei getrennte partielle Ziele erhalten beide Komponenten vollständig; keines beansprucht allein Vollabdeckung. Histonmodifikation8f bleibt ein separates unverändertes LK-Ziel. Alle anderen Quellentscheidungen werden unverändert übernommen. Unabhängige Prüfung und operative Integration sind offen.')
he['summary']['exactMappings']-=1;he['summary']['partialMappings']+=2
by_map=read(ROOT/by_old);by_map['reviewId']=Path(by_new).stem
by_add=next(d for d in read(PRIOR/'by-three-new-partial-source-bindings.candidates.json')['deltas'] if d['sourceGoalId']==BY_SOURCE)
by_map['mappings'].extend([copy.deepcopy(by_add['candidateMapping']),{'legacyGoalId':BY_SOURCE,'canonicalGoalId':METH,'matchType':'partial','reviewDecisionId':BY_SOURCE}])
bd=next(d for d in by_map['decisions'] if d['sourceGoalId']==BY_SOURCE)
prior_targets=copy.deepcopy(bd['canonicalGoalIds']);bd['canonicalGoalIds'].extend([TF,METH])
bd.update(reviewer='Codex prospective source candidate author',reviewedAt=NOW,
    rationale=bd['rationale']+' Inaktive ergänzende partielle TF-/DNA-Methylierungs-Bindungen: B12 2.2 GA/EA nennt Transkriptionsfaktoren und DNA-Methylierung in zugehörigen Inhalten. Der breite amtliche Kompetenzsatz bleibt vollständig erhalten; diese beiden Mechanismen schließen weder X-Inaktivierung, Entwicklungs-/Umweltanpassung, RNA-Interferenz, Histonmodifikation noch bestehende ganze Zielzuordnungen ab. Bestandsentscheid ist übernommen, keine neue Vollfreigabe. Unabhängige Quellenprüfung bleibt erforderlich.')
by_map['summary']['partialMappings']+=2
for p,value in [(he_extraction_new,he_ext),(he_new,he),(by_new,by_map)]:write(ISO/p,value)
atlas['mappingPaths']=[he_new if p==he_old else by_new if p==by_old else p for p in atlas['mappingPaths']]
atlas['expectedCurricularAtomicGoalCount']=364
own('source-component-candidates.json',{'status':'inactive_author_candidate','createdAtUTC':NOW,
    'oldHEMappingPath':he_old,'oldBYMappingPath':by_old,'newHEMappingPath':he_new,'newBYMappingPath':by_new,'newHEExtractionPath':he_extraction_new,
    'HEFullOfficialClause':delta['after']['sourceText'],'HEPrintedPage':39,'HECourseScope':['GK','LK'],
    'HESourceRow':he_ext['sourceGoals'][idx],'HEComponentMappings':[r for r in he['mappings'] if r['legacyGoalId']==HE_SOURCE],
    'BYBroadSourceGoal':by_add['sourceGoal'],'BYPartialMappings':[r for r in by_map['mappings'] if r['legacyGoalId']==BY_SOURCE],
    'BYExistingWholeTargetsPreserved':prior_targets,'BYWholeClauseNewApproval':False,
    'officialURLs':[delta['officialUrl'],by_add['sourceUrl'],by_add['additionalEnhancedUrl']],
    'currentGelSourceRowAndAllUnrelatedMappingsPreserved':True,'independentSourceReview':'pending','humanApproval':False})
own('prospective-source-atlas.inputs.json',atlas)
own('prospective-canonical.snapshot.json',candidate)
own('prospective-paths.json',{'isolationRoot':str(ISO),'ownPath':REL,'goalIds':[TF,METH],'canonicalPath':CANON,'semanticPath':SEMANTIC,'qaPath':QA,'atlasPath':ATLAS,'heExtractionPath':he_extraction_new,'heMappingPath':he_new,'byMappingPath':by_new,'bioConfig':bio,'createdAtUTC':NOW})
print(json.dumps({'status':'isolation_ready_current_baseline_not_yet_mutated','isolationRoot':str(ISO),'nativeCodeFiles':len(codes),'goalIds':[TF,METH],'futureCount':442,'futureDenominator':364,'activeWrites':0}))
