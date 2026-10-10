from pathlib import Path
from collections import defaultdict, Counter
import copy, hashlib, json, shutil, tempfile

ROOT = Path('/home/enpasos/projects/skillpilot')
OUT = Path(__file__).resolve().parent
CAN = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
REG = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
LOG = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-current678-M6-stable-layerA-book-build-root-v1/after-qualified-fifteen-graph-deltas-and-local-font-repair-run-v3'
def bind(p):
    p=Path(p).resolve(); b=p.read_bytes()
    try: name=str(p.relative_to(ROOT))
    except ValueError: name=str(p)
    return {'path':name,'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def load(p): return json.loads(Path(p).read_text())
def write(name,obj):
    p=OUT/name;p.parent.mkdir(parents=True,exist_ok=True)
    with p.open('x') as f: json.dump(obj,f,ensure_ascii=False,indent=2);f.write('\n')
    return bind(p)
can=load(ROOT/CAN); byid={g['id']:g for g in can['goals']}
assert bind(ROOT/CAN)['sha256']=='sha256:6bfa382a2b174a1645d883f746ef42c0693813ec2d447561fca3290ca98a0b09'
subject=next(s for s in load(ROOT/REG)['subjects'] if s['subject']=='wirtschaftswissenschaften')
kinds={x['goalId']:x['semanticKind'] for x in load(ROOT/subject['semanticKindLedgerPath'])['decisions']}
paths=[ROOT/CAN,ROOT/REG,ROOT/subject['semanticKindLedgerPath'],ROOT/'app/scripts/config/goal-books/de-gym-economics-current-canonical.json',ROOT/'app/scripts/validateCompositionViews.ts',ROOT/'app/src/utils/authoring/compositionViewAuthoring.ts',ROOT/'app/src/utils/compositionViewRuntime.ts',ROOT/'app/src/utils/goalFilters.ts',ROOT/'app/src/goalTypes.ts',ROOT/LOG/'composition-views.stdout.txt',ROOT/LOG/'composition-views.stderr.txt',ROOT/LOG/'composition-views.actual-command-exit.json']
paths+=sorted((ROOT/'curricula/DE/Gymnasium/composition-views/wirtschaft').glob('*.view.json'))
# Original source and mapping bytes remain endguarded, without new source judgments.
paths+=sorted((ROOT/'curricula/DE/Gymnasium/provenance').glob('*registry.json'))
paths+=sorted((ROOT/'curricula/DE/Gymnasium/input/BE/upper-secondary/source-extraction').glob('*CURRENT*.json'))
paths+=sorted((ROOT/'curricula/DE/Gymnasium/mapping/DE-BE/upper-secondary').glob('*current125*.json'))
guard={str(p):bind(p) for p in paths}
rows=[]; views=[]; empty=[]
for course, expected in [('gk',78),('lk',117)]:
    active=ROOT/f'curricula/DE/Gymnasium/composition-views/wirtschaft/de-de-gym-economics-{course}.view.json'
    before=load(active); after=copy.deepcopy(before)
    before_path=OUT/f'whole-active-national-{course}.BEFORE-byte-exact.view.json'
    with before_path.open('xb') as f: f.write(active.read_bytes())
    subtree_paths=defaultdict(list)
    def expand(gid,parts,root_path):
        subtree_paths[gid].append({'rootNodePath':root_path,'wholeCanonicalGoalPath':parts+[gid]})
        for child in byid[gid].get('contains',[]): expand(child,parts+[gid],root_path)
    def scan(n,p):
        if n['kind']=='structure':
            for i,ch in enumerate(n['children']):scan(ch,p+'.'+str(i))
        elif n['kind']=='canonicalSubtree' and n.get('projectionRole')!='prerequisiteOnly': expand(n['goalId'],[],p)
    for i,n in enumerate(before['rootNodes']):scan(n,str(i))
    local=[]
    def prune(n,p,parents):
        if n['kind']=='goalEntry' and n.get('projectionRole')!='prerequisiteOnly' and n['goalId'] in subtree_paths:
            gid=n['goalId'];matches=subtree_paths[gid]
            assert len(matches)==1 and kinds[gid]=='practiceAssessment' and not byid[gid].get('contains')
            chain=matches[0]['wholeCanonicalGoalPath']; parent=byid[chain[-2]]
            row={'courseProfile':course.upper(),'goalId':gid,'wholeCurrentGoal':byid[gid],
                 'oldDirectNodePath':p,'wholeRemovedDirectPlacement':copy.deepcopy(n),'oldStructureParentLabels':parents,
                 'wholeRetainedCanonicalPlacement':matches[0],
                 'retainedCanonicalParent':parent,
                 'retainedCanonicalParentTitles':{'de':parent['title'],'en':parent.get('titleEn')},
                 'reason':'Use the existing reviewed canonical practice grouping as the single visible parent. The direct target reference duplicates the same unchanged whole practice task; removal does not remove its inherited target role, goal, prerequisite, or source claim.'}
            rows.append(row);local.append(row);return None
        if n['kind']=='structure':
            children=[prune(ch,p+'.'+str(i),parents+[n['label']]) for i,ch in enumerate(n['children'])]
            n['children']=[c for c in children if c is not None]
            if not n['children']:
                original=before
                for part in p.split('.'):
                    original=original['rootNodes'][int(part)] if 'rootNodes' in original else original['children'][int(part)]
                empty.append({'courseProfile':course.upper(),'oldNodePath':p,'wholeRemovedEmptyStructure':original,
                              'reason':'All children were duplicate direct practice placements; an empty learner-facing folder has no target and would violate CPV-007.'})
                return None
        return n
    after['rootNodes']=[x for i,n in enumerate(after['rootNodes']) if (x:=prune(n,str(i),[])) is not None]
    assert len(local)==expected
    assert {k:v for k,v in before.items() if k!='rootNodes'}=={k:v for k,v in after.items() if k!='rootNodes'}
    views.append({'courseProfile':course.upper(),'activePath':str(active.relative_to(ROOT)),
                  'wholeBefore':bind(before_path),'wholeAfter':write(f'whole-national-{course}.single-existing-practice-parent.INERT-AUTHOR.view.json',after),
                  'removedDuplicateDirectReferences':len(local),'viewScopeAndMetadataExact':True})
assert len(rows)==195
assert all(bind(Path(p))==b for p,b in guard.items())
capsule=Path(tempfile.mkdtemp(prefix='economics-two-national-views-only-native-'))/'capsule'
capsule.mkdir()
shutil.copytree(ROOT/'app/src',capsule/'app/src')
shutil.copytree(ROOT/'app/scripts',capsule/'app/scripts')
shutil.copyfile(ROOT/'app/package.json',capsule/'app/package.json')
(capsule/'app/node_modules').symlink_to(ROOT/'app/node_modules',target_is_directory=True)
source=(ROOT/'app/scripts/validateCompositionViews.ts').read_bytes()
marker=b'const scriptDir = dirname(fileURLToPath(import.meta.url))'
assert source.count(marker)==1
prefix=source.split(marker)[0]
helper=capsule/'app/scripts/validateCompositionViews.readonly-scoped-native-exports.ts'
assert not helper.exists() and capsule.resolve() not in (ROOT.resolve(),(ROOT/'app').resolve())
helper.write_bytes(prefix+b'\nexport { collectGenericTreeFindings, collectDuplicateDirectPhaseStructureFindings, collectLearnerFacingCompositionLabelFindings, collectCanonicalMathTreeFindings, collectCanonicalMathSek1ExamVisibilityFindings, collectCanonicalMathSek2RouteEndpointVisibilityFindings };\n')
for item in views:
    for tag in ['wholeBefore','wholeAfter']:
        src=ROOT/item[tag]['path'];dest=capsule/'inputs'/src.name;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,dest)
for p in [ROOT/CAN,ROOT/subject['semanticKindLedgerPath']]:
    dest=capsule/'inputs'/p.name;shutil.copyfile(p,dest)
definition=write('actual195-duplicate-practice-placements-empty-folders-and-unique-parent-choice.AUTHOR.json',{'actualCurrentCAN':bind(ROOT/CAN),'whole2Views':views,'whole195RemovalReasons':rows,'wholeRemovedEmptyStructures':empty,'scopeMetadataChanged':False,'removedCurricularTargets':0,'removedPrerequisiteOnlyPlacements':0,'scienceBodiesChanged':0,'activeWrites':0})
config=write('private-two-view-native-capsule-and-whole-input-frame.AUTHOR.json',{
    'capsule':str(capsule),'nativeValidatorSource':bind(ROOT/'app/scripts/validateCompositionViews.ts'),
    'nativePrefixBytesExact':len(prefix),'nativePrefixSHA256':'sha256:'+hashlib.sha256(prefix).hexdigest(),
    'helper':bind(helper),'helperAuthority':'The exact unmodified validator function prefix, plus instrumental exports only. No CLI --view exists; the scoped harness applies the same Economics applicable functions to exactly2 views. It does not run or suppress any scoped check.',
    'wholeCandidateDefinitions':definition,'wholeInputEndguards':list(guard.values()),
    'views':views,'canonicalInput':str(capsule/'inputs'/Path(CAN).name),
    'semanticKindsInput':str(capsule/'inputs'/Path(subject['semanticKindLedgerPath']).name),
    'activeWrites':0,'reviewRecords':0,'pendingIndependentRootQualification':True})
print(json.dumps({'config':config,'definition':definition,'capsule':str(capsule),'rows':len(rows),'removedEmptyStructures':len(empty)}))
