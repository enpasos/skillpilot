import copy, hashlib, json, shutil, tempfile
from pathlib import Path

ROOT=Path.cwd();OUT=Path(__file__).resolve().parent
AUTHOR=OUT.parent/'wirtschaft-M4-twelve-macro-contracts-coherent-local-material-author-v1/three-real-core-bypasses-separated-scoring-and-truthful-primary-bindings-author-successor-v4'
BODY=AUTHOR/'whole-nine-current-macro-materials.only-three-core-scoring-successors.DRAFT-author-v4.json'
SCI=OUT.parent/'wirtschaft-M4-nine-macro-twelve-whole-science-independent-b-v1/three-core-scoring-only-independent-followup-v2/actual-final-three-scoring-KEEP-nine-qualified-whole-materials.execution-sealed.handoff.receipt.json'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p):return {'path':str(p.relative_to(ROOT)) if p.is_relative_to(ROOT) else str(p),'sha256':sha(p),'bytes':p.stat().st_size}
def dump(name,x):
 p=OUT/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return bind(p)
assert sha(BODY)=='42ce85e08416e3a3225937045ea23144ff9a12306559a2d203111e1e179fd266'
assert sha(SCI)=='2e09cca488c1e1602b28525a1acdd10b8f4402cef54700a121e8ed831b368d16'
cp='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
assert sha(ROOT/cp)=='c44b6476a3dcdb66d7d2e81a28757da61ffcfc48a15d3f675320c6f20a97f70f'
before=json.loads((ROOT/cp).read_text());assert len(before['goals'])==532
shutil.copy2(ROOT/cp,OUT/'whole-current532.exact-before.json')
bodies=json.loads(BODY.read_text());released=copy.deepcopy(bodies)
for b in released:
 b['examData']['reviewStatus']='released'
 b['examData']['reviewNote']='Machine curriculum QS: complete bilingual two-case material independently qualified, six exact historical KEEP plus three real scoring successors, receipt2e09cca4. Human review, release and classroom trials remain separate and pending.'
status=dump('whole-nine-qualified-macro.only-machine-status-note.inert.json',released)
candidate=copy.deepcopy(before)
q1=next(g for g in candidate['goals'] if g['id'].startswith('1f0ed7e7'))
q2=next(g for g in candidate['goals'] if g['id'].startswith('a1c0e891'))
q1['contains'].append(released[6]['id'])
q2['contains'].extend(b['id'] for i,b in enumerate(released) if i!=6)
candidate['goals'].extend(released)
initial=dump('whole-current532-plus-nine-status-and-two-Nav-contains541.pre-derived.inert.json',candidate)
views=ROOT/'curricula/DE/Gymnasium/composition-views/wirtschaft'
(OUT/'before-views').mkdir(exist_ok=True)
for p in views.glob('*.json'):shutil.copy2(p,OUT/'before-views'/p.name)
assert len(list((OUT/'before-views').glob('*.json')))==35
cap=Path(tempfile.mkdtemp(prefix='skillpilot-econ-nine-macro532-author-B-'))/'capsule'
shutil.copytree('/tmp/skillpilot-econ-pure-Gini524-author-B-4f9khbd1/capsule',cap,symlinks=True)
def physicalcopy(src,relative):
 dst=cap/relative
 for parent in list(dst.parents)[::-1]:
  if parent==cap or cap not in parent.parents:continue
  if parent.is_symlink():parent.unlink();parent.mkdir()
 if dst.is_symlink():dst.unlink()
 dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,dst)
 assert dst.resolve()!=src.resolve() and not dst.is_symlink()
 assert dst.read_bytes()==src.read_bytes()
physical=[]
def frozen(src,relative):
 physicalcopy(src,relative);physical.append({'activeOrFrozenSource':bind(src),'privatePath':str(cap/relative),'physicallySeparate':True})
frozen(OUT/'whole-current532.exact-before.json',cp)
for p in views.glob('*.json'):frozen(p,str(p.relative_to(ROOT)))
config='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
frozen(ROOT/config,config);cfg=json.loads((ROOT/config).read_text());econ=next(s for s in cfg['subjects'] if s.get('subject')=='wirtschaftswissenschaften')
for path in [econ['semanticKindLedgerPath'],*econ['positiveEvidenceConfigPaths']]:
 frozen(ROOT/path,path)
 if path in econ['positiveEvidenceConfigPaths']:
  pc=json.loads((ROOT/path).read_text());frozen(ROOT/pc['reviewPath'],pc['reviewPath'])
assert sha(ROOT/econ['semanticKindLedgerPath'])=='0a7a216f914738d6e1c3db3b7907d111af08d67bff4dfd40b79f4cf42536347e'
# Freeze every economics-named source/mapping/registry input actually present,
# including current conditional Source125. This copies input bytes only; no
# target/source assignment or active source-review mutation is performed.
for folder in ['curricula/DE/Gymnasium/source','curricula/DE/Gymnasium/mapping','curricula/DE/Gymnasium/registry']:
 base=ROOT/folder
 if base.exists():
  for p in base.rglob('*.json'):
   if 'wirtschaft' in str(p).lower():frozen(p,str(p.relative_to(ROOT)))
mapping='curricula/DE/Gymnasium/mapping/DE-BE/upper-secondary/be_wirtschaft_current125_source_extraction_to_canonical_wirtschaft.review.json'
frozen(ROOT/mapping,mapping)
# Native collectors also inspect original landscape provenance. Ensure the
# actual current economics landscapes are physical immutable capsule inputs.
for p in (ROOT/'curricula/DE/Gymnasium').rglob('*.json'):
 rel=str(p.relative_to(ROOT));s=rel.lower()
 if any('/'+part+'/' in '/'+s for part in ['quality','mapping','composition-views','assets']):continue
 if 'wirtschaft' in p.name.lower():frozen(p,rel)
checker=ROOT/'app/scripts/generateCurriculumQualityStatus.ts';compiler=ROOT/'app/scripts/applicabilityCompiler.ts'
assert sha(checker)=='656084b7cd9d6cb5324361b927b9f761596c572d7e4f616c7b13da061f4b1336'
assert sha(compiler)=='50f4a09007cece8119c53f665b6442e028e4ffb3910fda7b377e60f8cb6c81dd'
frozen(checker,'app/scripts/generateCurriculumQualityStatus.ts');frozen(compiler,'app/scripts/applicabilityCompiler.ts')
(cap/'app/scripts/generateCurriculumQualityStatus.ts').write_bytes(checker.read_bytes()+b'\nexport {routeProfiles,evaluateRouteProfile,readJurisdictionCoverageByLandscapeId,collectRenderedAtomicGoalIdsFromCompositionView,collectWholeMaterialPrerequisiteClosure};\n')
assert (cap/cp).resolve()!= (ROOT/cp).resolve()
assert (cap/cp).read_bytes()==(OUT/'whole-current532.exact-before.json').read_bytes()
meta=dump('actual-current532-nine-status-two-Nav-private-physical-inputs.preparation-author.json',{'role':'AUTHOR_ONLY_FOREIGN_SCOPE_PENDING','capsule':str(cap),'beforeCAN':bind(OUT/'whole-current532.exact-before.json'),'preDerivedCAN':initial,'releasedNine':status,'foreignWholeScience':bind(SCI),'actualWhole35BeforeViews':[bind(p) for p in sorted((OUT/'before-views').glob('*.json'))],'nativeCheckerProduction':bind(checker),'nativeCompilerProduction':bind(compiler),'readonlyNamedExportsOnly':True,'actualPhysicalInputs':physical,'positiveConfigCount':len(econ['positiveEvidenceConfigPaths']),'new9Kinds':'Only diagnostic collector adds these exact9 IDs as practiceAssessment; final native SEM/current fingerprints remain Root-owned','resolvesSameActiveOrEvidenceFile':False,'activeWrites':0,'next':'Actual native compiled prerequisites/material-course/country/role intake; childunion and eligible append refs derived from whole current scopes, not old105count.'})
print(json.dumps(meta))
