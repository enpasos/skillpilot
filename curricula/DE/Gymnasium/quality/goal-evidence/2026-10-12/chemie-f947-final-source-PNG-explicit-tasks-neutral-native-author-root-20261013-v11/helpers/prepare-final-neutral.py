# Apache-2.0. Private technical author preparation; no independent vote.
from pathlib import Path
import copy, datetime, hashlib, json, os, re, shutil, subprocess
R=Path('/home/enpasos/projects/skillpilot');E=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12'
N=E/'chemie-f947-final-source-PNG-explicit-tasks-neutral-native-author-root-20261013-v11'
F=E/'chemie-f947-bounded-source-route-remediation-author-20261013-v9'
O=E/'chemie-polymers18-current231-inactive-normal-preparation-technical-20261013-v1'
P=E/'chemie-polymers17-original-native-current231-inactive-adoption-root-20261013-v9'
T=E/'chemie-f947-task-demand-complete-final-content-author-20261013-v10'
I=E/'chemie-f947-mobile-clear-PU-raster-author-20261013-v9'
V=E/'chemie-f947-mobile-clear-actual-V-independent-20261013-v10'
C=R/'tmp/chemie-q4-current220-prep/execution'
S=R/'tmp/chemie-f947-source-author-overlay-20261013-v9'
X=R/'tmp/chemie-f947-final-neutral-native-execution-20261013-v11'
G='f947cd04-952a-5a9d-9445-3ffc70e02c3c'
rp=lambda p:str(p.relative_to(R));rd=lambda p:json.loads(p.read_text())
h=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
bind=lambda p:{'path':rp(p),'sha256':h(p),'bytes':p.stat().st_size}
def wr(p,d):
 assert p.is_relative_to(N);p.parent.mkdir(parents=True,exist_ok=True)
 assert not p.exists();p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def copyown(src,dst):
 assert dst.is_relative_to(N);dst.parent.mkdir(parents=True,exist_ok=True);assert not dst.exists();shutil.copyfile(src,dst)
def private_parent(path):
 assert path.is_relative_to(X);cur=X
 for part in path.relative_to(X).parts:
  cur=cur/part
  if cur.is_symlink():
   old=cur.resolve(strict=True);assert old.is_dir();cur.unlink();cur.mkdir()
   for child in old.iterdir(): (cur/child.name).symlink_to(child,target_is_directory=child.is_dir())
  elif not cur.exists():cur.mkdir()
  assert cur.is_dir() and not cur.is_symlink(),cur
def private_copy(src,dst):
 private_parent(dst.parent)
 if dst.exists() or dst.is_symlink():dst.unlink()
 shutil.copyfile(src,dst);assert not dst.is_symlink() and dst.resolve().is_relative_to(X)
def verify_seal(path,expected=None):
 if expected:assert h(path)==expected
 d=rd(path);bindings=d.get('ownedFileBindings',d.get('ownedFiles',d.get('fileBindings',d.get('files',[]))))
 for b in bindings:
  if isinstance(b,dict) and b.get('path') and b.get('sha256'):
   p=R/b['path'] if b['path'].startswith('curricula/') else path.parent/b['path']
   assert h(p)==('sha256:'+b['sha256'].removeprefix('sha256:')),(path,p)
 return bind(path)
assert h(R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')=='sha256:9a68501347031f266572dea551e71c3507b66fb5ed94142a1a99f6a282708960'
seals=[verify_seal(F/'FINAL.bounded-source-author-proposal.freeze.json','sha256:941991d2d7ffa8a56084ffd2b28c1243ee8532b2d5f39e2301f9c06176e1cd5b'),verify_seal(P/'FINAL.inactive-original17-adoption.freeze.json'),verify_seal(I/'FINAL.mobile-clear-author.seal.json'),verify_seal(V/'FINAL.independent-actual-V.seal.json','sha256:d4146df1384509877f507b350ffcaf470192e85348e637b1592dd8748f964686')]
assert not X.exists();X.mkdir()
# Reuse the isolated source routes and historical transport simulation with fresh private parents.
for directory,dirs,files in os.walk(S,followlinks=False):
 rel=Path(directory).relative_to(S);dest=X/rel;dest.mkdir(parents=True,exist_ok=True)
 for name in list(dirs):
  src=Path(directory)/name
  if src.is_symlink():
   (dest/name).symlink_to(src.resolve(strict=True),target_is_directory=True);dirs.remove(name)
 for name in files:
  src=Path(directory)/name;dst=dest/name
  if src.is_symlink():dst.symlink_to(src.resolve(strict=True))
  else:shutil.copyfile(src,dst)
private_parent(X/rp(N))
assert not (X/'curricula/DE/Gymnasium/quality').is_symlink()
assert not (X/'curricula/DE/Gymnasium/quality/goal-book-publication').is_symlink()
(X/'contracts').symlink_to(R/'contracts',target_is_directory=True)
# Copy only the unchanged local script import closure needed by normal preparation.
entries=['materializeGoalDescriptionRolloutBatch.ts','materializePositiveGoalEvidenceCandidates.ts','positiveGoalEvidenceReview.ts','memoryCardReview.ts','goalBookSourceAtlasInputs.ts']
seen=set();stack=[R/'app/scripts'/name for name in entries];modules=[]
while stack:
 src=stack.pop().resolve()
 if src in seen:continue
 seen.add(src);rel=src.relative_to(R)
 if not rel.is_relative_to(Path('app/scripts')):continue
 private_copy(src,X/rel);modules.append(bind(src))
 for name in re.findall(r"(?:from\s*|import\s*\()['\"](\.[^'\"]+)['\"]",src.read_text()):
  base=src.parent/name
  target=next((p for p in [base,Path(str(base)+'.ts'),Path(str(base)+'.tsx'),base/'index.ts'] if p.is_file()),None)
  if target is not None and target.suffix in ['.ts','.tsx']:stack.append(target)
candidate=rd(O/'candidate/canonical523.current402.six-resource-only.inactive.json')
source_goal=next(g for g in rd(F/'candidate/canonical523-current402.boundary-and-derived-eight-scopes.author.json')['goals'] if g['id']==G)
goal=next(g for g in candidate['goals'] if g['id']==G)
for key in ['applicability','extendedData']:goal[key]=copy.deepcopy(source_goal[key])
image_goal=next(g for g in rd(I/'visual-candidate/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')['goals'] if g['id']==G)
goal['resourceLinks']=copy.deepcopy(image_goal['resourceLinks'])
assert goal['resourceLinks'][0]['url'].endswith('.png')
wr(N/'candidate/canonical523.current402.seven-images-source-boundary.author.json',candidate)
qa=rd(O/'candidate/QA.current-plus-six-actualV.inactive.json');vrow=rd(V/'review/V.root-integration.future-live-row.json')
qa['records']=[vrow if q['goalId']==G else q for q in qa['records']]
wr(N/'candidate/QA.current-plus-seven-genuine-V.author-inactive.json',qa)
for src,name in [(T/'positive/whole-two-cases.complete-explicit-demands.author.json','positive/whole-two-cases.complete-explicit-demands.author.json'),(T/'positive/P1.complete-demands.author-candidate-set.unbound.json','positive/P1.complete-demands.author-candidate-set.unbound.json'),(P/'positive/P17.original-author-native-bound.raw-exact.jsonl','positive/P17.original-author-native-bound.raw-exact.jsonl'),(O/'positive/current231.actual-active.raw-exact.jsonl','positive/current231.actual-active.raw-exact.jsonl'),(P/'memory/M402.original-valid.raw-exact.jsonl','memory/M402.original-valid.raw-exact.jsonl')]:copyown(src,N/name)
pc=rd(O/'configs/P18.author.inactive.config.json');pc.update(reviewId=rd(T/'positive/P1.complete-demands.author-candidate-set.unbound.json')['reviewId'],landscapePath=rp(N/'candidate/canonical523.current402.seven-images-source-boundary.author.json'),semanticKindLedgerPath=rp(N/'candidate/semantic523.normalized-book-and-P.same-classifications.json'),reviewPath=rp(N/'positive/P1.final-complete-demands.author.normal.jsonl'),requireApproved=False,scope={'label':'One neutral final author candidate; both fresh independent judgments pending','goalIds':[G]})
wr(N/'configs/P1.author.inactive.config.json',pc)
bc=rd(P/'configs/whole402.current231-plus-original17.inactive.config.json');bc.update(bookId='chemie-f947-final-source-image-demand-neutral-full402-v11',title='Chemie – aktueller Umfang mit finalem Polyurethan-Prüfkandidaten',landscapePath=pc['landscapePath'],semanticKindLedgerPath=pc['semanticKindLedgerPath'],goalVisualizationQaPath=rp(N/'candidate/QA.current-plus-seven-genuine-V.author-inactive.json'),evidenceReviewPaths=[rp(N/'positive/current231.actual-active.raw-exact.jsonl'),rp(N/'positive/P17.original-author-native-bound.raw-exact.jsonl'),pc['reviewPath']],outputPath=rp(N/'models/whole402.current231-original17-and-final-f947.author.json'))
wr(N/'configs/whole402.final-neutral.inactive.config.json',bc)
nc=rd(O/'configs/native-D18.final-current231.batch.config.json');nc.update(batchId='chemie-f947-final-source-PNG-explicit-tasks-neutral-native-20261013-v11',bookId='chemie-f947-final-neutral-native-v11',title='Chemie – Polyurethan: Reaktion und Reaktionsführung',baseGoalBookConfigPath=rp(N/'configs/whole402.final-neutral.inactive.config.json'),goalIds=[G],outputDirectory=rp(N/'native-D1'))
wr(N/'configs/native-D1.final-neutral.batch.config.json',nc)
mc=rd(O/'configs/M402.inactive.config.json');mc.update(landscapePath=pc['landscapePath'],reviewPath=rp(N/'memory/M402.original-valid.raw-exact.jsonl'),reportPath=rp(N/'checks/M402.normal.report.md'))
wr(N/'configs/M402.original-retained.inactive.config.json',mc)
private_parent(X/'app/public');assets=[]
baseqa=rd(O/'candidate/QA.current-plus-six-actualV.inactive.json')
liveqa=rd(R/'curricula/DE/Gymnasium/quality/goal-visualization/chemie.json') if (R/'curricula/DE/Gymnasium/quality/goal-visualization/chemie.json').exists() else None
changed6=set(json.loads((P/'checks/six-actual-original-V-machine-gates-retained.actual.json').read_text()).get('goalIds',[]))
# Approved future six assets are already byte-exact in the previous private capsule.
future6=[]
raw_live=rd(R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
oldmap={g['id']:g for g in raw_live['goals']}
for g in rd(O/'candidate/canonical523.current402.six-resource-only.inactive.json')['goals']:
 if g!=oldmap[g['id']]:future6.append(g['id'])
assert len(future6)==6 and G not in future6
for q in qa['records']:
 if q['visualizationState']!='available':continue
 src=I/'candidate'/f'{G}.png' if q['goalId']==G else C/q['publicAssetPath']
 if not src.exists():src=R/q['publicAssetPath']
 assert h(src)==q['assetSha256'],(q['goalId'],src)
 dst=X/q['publicAssetPath'];private_parent(dst.parent)
 if q['goalId'] in future6+[G]:
  own=N/'assets'/q['goalId']/Path(q['publicAssetPath']).name;copyown(src,own);private_copy(own,dst)
 else:
  if dst.exists() or dst.is_symlink():dst.unlink()
  dst.symlink_to(src.resolve(strict=True))
 assets.append({'goalId':q['goalId'],'publicAssetPath':q['publicAssetPath'],'sourcePath':rp(src),'sha256':h(src),'newSevenPrivateRegular':q['goalId'] in future6+[G]})
assert sum(a['newSevenPrivateRegular'] for a in assets)==7
neutral=[]
audit=rd(F/'inputs/original-independentA-34-row-source-finding.exact.json')
plan=rd(F/'SOURCE_ROUTE_PLAN.only-f947-components-author-pending.json')
translate={a['originalLiveBinding']['path']:a['proposedFutureLivePath'] for a in plan['authorProposedSourceChanges']}
for row in audit['rows']:
 routes=[]
 for route in row['currentMappingRoutes']:
  path=translate.get(route['currentMappingPath'],route['currentMappingPath']);data=rd(X/path)
  direct=[r for r in data.get('mappings',[]) if r.get('legacyGoalId')==row['sourceGoalId']]
  decision=[r for r in data.get('decisions',[]) if r.get('sourceGoalId')==row['sourceGoalId']]
  routes.append({'currentCandidateMappingPath':path,'currentCandidateWholeFileSha256':h(X/path),'wholeCurrentComponentMappings':direct,'wholeCurrentDecisions':decision})
 neutral.append({k:copy.deepcopy(row[k]) for k in ['sourceGoalId','literalSourceText','sourceRef','literalSourceSpan','courseLevel','sourceTags','extractionBinding']}|{'currentCandidateRoutes':routes})
wr(N/'source/selected34-literals-and-current-candidate-whole-components.neutral.json',{'schemaVersion':1,'goalId':G,'authorCandidateOnly':True,'priorPeerVerdictFieldsExcluded':True,'genericHBAndSHRemainHeldForFreshSourceJudgment':True,'rows':neutral})
wr(N/'inputs/referenced-seals-and-current-private-transport.actual.json',{'schemaVersion':1,'sealsVerifiedBeforePreparation':seals,'sourcePlan':bind(F/'SOURCE_ROUTE_PLAN.only-f947-components-author-pending.json'),'sourceTransport40Receipt':bind(F/'checks/historical-transport40-private-regular-byte-exact-prospective.actual.json'),'productionExecutedModuleBindings':modules,'actualPublicAssetBindings':assets,'copiedFutureSevenGoalIds':future6+[G],'privateExecutionRoot':rp(X),'allMutableParentsPrivate':True,'noPriorIndependentDOrPVerdictProseCopied':True,'activeOrGitWrites':False,'newScientificVotes':0})
# Mirror own technical inputs only through real private parent chains.
for src in N.rglob('*'):
 if src.is_file():private_copy(src,X/rp(src))
private_copy(N/'candidate/canonical523.current402.seven-images-source-boundary.author.json',X/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
print(json.dumps({'newPrivateExecution':rp(X),'sevenImagesPrivateExact':True,'otherSixImageUpdatesPreserved':True,'neutralSourceRows':34,'bothIndependentJudgmentsPending':True,'activeWrites':False}))
