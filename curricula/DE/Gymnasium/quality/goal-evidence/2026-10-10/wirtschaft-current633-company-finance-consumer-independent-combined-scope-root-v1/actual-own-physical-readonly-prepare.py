from pathlib import Path
import json,hashlib,shutil,tempfile,os
R=Path('/home/enpasos/projects/skillpilot')
Q=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10'
O=Q/'wirtschaft-current633-company-finance-consumer-independent-combined-scope-root-v1'
AC=Path('/tmp/economics-combined621-current597-author-a-1x_myxfp/capsule')
CAN='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
REG='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
BOOK='app/scripts/config/goal-books/de-gym-economics-current-canonical.json'
assert hashlib.sha256((R/CAN).read_bytes()).hexdigest()=='6118557f37604ddd3fa5c5b8a418ee9d0061c570dfeea14a12d29ee7cb4addf3'
O.mkdir(exist_ok=False)
C=Path(tempfile.mkdtemp(prefix='economics-independent633-root-'))/'capsule'
shutil.copytree(AC,C,symlinks=True)
def bind(p):return {'path':str(p.relative_to(R)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def cp(rel):
 p=C/rel;s=R/rel;assert p.resolve().is_relative_to(C) and not p.is_symlink();assert not p.exists() or not p.samefile(s)
 p.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(s,p);assert s.read_bytes()==p.read_bytes()
def save(name,x):
 p=O/name;assert not p.exists();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return bind(p)
active=json.loads((R/REG).read_text());subject=next(s for s in active['subjects'] if s['subject']=='wirtschaftswissenschaften')
mirrors=[CAN,REG,BOOK,subject['semanticKindLedgerPath']]
for cfg in subject['positiveEvidenceConfigPaths']:
 mirrors += [cfg,json.loads((R/cfg).read_text())['reviewPath']]
mirrors += [str(p.relative_to(R)) for p in sorted((R/'curricula/DE/Gymnasium/composition-views/wirtschaft').glob('*.json'))]
for rel in dict.fromkeys(mirrors):cp(rel)
prod=(R/'app/scripts/generateCurriculumQualityStatus.ts').read_bytes()
tail=b'\nexport { routeProfiles,evaluateRouteProfile,readJurisdictionCoverageByLandscapeId,collectRenderedAtomicGoalIdsFromCompositionView,collectWholeMaterialPrerequisiteClosure };\n'
assert (C/'app/scripts/generateCurriculumQualityStatus.ts').read_bytes()==prod+tail
assert (C/'app/scripts/applicabilityCompiler.ts').read_bytes()==(R/'app/scripts/applicabilityCompiler.ts').read_bytes()
guards=[];nonmatching=[]
for p in sorted(C.rglob('*')):
 if not p.is_file() or p.is_symlink():continue
 rel=str(p.relative_to(C));s=R/rel
 if not s.is_file():continue
 if rel=='app/scripts/generateCurriculumQualityStatus.ts':continue
 if s.read_bytes()!=p.read_bytes():nonmatching.append(rel);continue
 guards.append(bind(s))
assert not nonmatching,nonmatching
names=['wirtschaft-M4-twelve-company-whole-science-independent-merge-audit-v1/actual-final-twelve-company-whole-DEEN-science-three-real-remedies-independent-KEEP.handoff.receipt.json','wirtschaft-M4-twelve-finance-whole-science-independent-root-v1/actual-final-twelve-finance-whole-DEEN-science-two-real-remedies-independent-KEEP.handoff.receipt.json','wirtschaft-M4-twelve-consumer-whole-science-independent-merge-audit-v1/actual-final-twelve-consumer-whole-DEEN-science-three-real-remedies-independent-KEEP.handoff.receipt.json']
qualified=[];new=[]
for n in names:
 p=Q/n;j=json.loads(p.read_text());qualified.append(bind(p))
 # The status-only candidate union is checked against the science-bound bodies
 # separately after the combined author's immutable final handoff arrives.
company=Q/'wirtschaft-current621-company-finance24-current597-fieldwise-status-nav-scope-author-a-v1/whole-twentyfour-company-finance-foreign-KEEP-status-only-released.author-candidate.json'
new.extend(g['id'] for g in json.loads(company.read_text()))
con=Q/'wirtschaft-M4-twelve-foreign-consumer-current597-status-nav-scope-author-a-v1/actual-final-consumer12-155-accesses-threeNav-current597-foreign-science-reuse.author-handoff.json'
j=json.loads(con.read_text())
def find(v):
 if isinstance(v,dict):
  for k,x in v.items():
   if k=='newMaterialIds' and isinstance(x,list):new.extend(x)
   else:find(x)
 elif isinstance(v,list):
  for x in v:find(x)
find(j)
# Consumer handoff uses whole CAN; the exact new 12 set is stable from609−597.
paths=[]
def canpaths(v):
 if isinstance(v,dict):
  if isinstance(v.get('path'),str) and 'sha256' in v and v['path'].endswith('.json'):
   p=R/v['path']
   if p.exists():
    z=json.loads(p.read_text())
    if isinstance(z,dict) and len(z.get('goals',[]))==609:paths.append(z)
  for x in v.values():canpaths(x)
 elif isinstance(v,list):
  for x in v:canpaths(x)
canpaths(j);assert paths
old={g['id'] for g in json.loads((R/CAN).read_text())['goals']}
new.extend(g['id'] for g in paths[0]['goals'] if g['id'] not in old);new=sorted(set(new));assert len(new)==36
save('whole-new36-material-ids.for-independent-native.json',new)
helper=Path('/tmp/economics-independent633-native-root.mts');shutil.copyfile(helper,C/'native-root633.mts');shutil.copyfile(helper,O/'actual-own-native-observer-helper.mts');shutil.copyfile(__file__,O/'actual-own-physical-readonly-prepare.py')
save('actual-physical-private597-baseline-current-whole-input-endguards.root.json',{
 'role':'ROOT fresh physical597 native baseline, foreign scope review pending','wholeActive597':bind(R/CAN),'activeGuards':guards,
 'actualGuardCount':len(guards),'privateCAP':str(C),'productionChecker':bind(R/'app/scripts/generateCurriculumQualityStatus.ts'),
 'solePrivateCheckerChangeExactExportTail':tail.decode(),'compilerExactProduction':bind(R/'app/scripts/applicabilityCompiler.ts'),
 'threeExistingBoundedWholeScienceSeals':qualified,'noWholeBodyScientificRestart':True,'all597CurrentOriginalGoalBodiesP336685MemoryPreserved':True,
 'activeWrites':0,'symlinksOnlyNodeModulesDependency':[(str(p.relative_to(C)),str(p.readlink())) for p in C.rglob('*') if p.is_symlink()]})
Path('/tmp/economics-independent633-root-cap-path.txt').write_text(str(C)+'\n')
Path('/tmp/economics-independent633-root-out-path.txt').write_text(str(O)+'\n')
print(json.dumps({'privateCAP':str(C),'output':str(O),'guardedOriginalInputs':len(guards),'newMaterialIds':len(new),'activeWrites':0}))
