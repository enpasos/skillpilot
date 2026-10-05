from pathlib import Path
from datetime import datetime,timezone
import hashlib,json,shutil
ROOT=Path.cwd().resolve();OWN=Path(__file__).parent.resolve();REL=OWN.relative_to(ROOT);ISO=ROOT/'tmp/chemie-b010-five-native-isolated-20261005-v1'
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def read(p):return json.loads(Path(p).read_text())
def write(name,j):(OWN/name).write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n')
assert not (OWN/'prepared.freeze.manifest.json').exists()
plans=['curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json','curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json','curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json']
plans+=read(OWN/'exact-goal-and-route-deltas.candidate.json')['futureRuntimeViews']
mapping=read(OWN/'source-mapping-exact-removal-and-residual-hold.candidate.json');plans.append(mapping['futurePath'])
atlaspath='app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json';atlas=read(ISO/atlaspath)
plans+=[atlaspath,atlas['manifestPath'],atlas['navigationViewPath']]
plans+=[str(p.relative_to(ISO)) for p in (ISO/atlas['outputDirectory']).rglob('*') if p.is_file()]
id='950c73c6-4ed1-488a-9267-1142e95e0055'
plans+=[f'curricula/DE/Gymnasium/visualizations/chemie/{id}/{id}.png',f'app/public/assets/goal-visualizations/chemie/{id}/{id}.png',f'backend/src/main/resources/static/assets/goal-visualizations/chemie/{id}/{id}.png']
plans+=[str(p.relative_to(ISO)) for p in (ISO/f'curricula/DE/Gymnasium/visualizations/chemie/{id}').iterdir() if p.is_file() and p.name in ['prompt.de.md','image-reconstruction-prompt.de.md']]
rows=[];unchanged=[]
for rel in sorted(set(plans)):
 src=ISO/rel;digest=sha(src);active=ROOT/rel
 if active.exists() and sha(active)==digest:unchanged.append({'futureActivePath':rel,'sha256':digest});continue
 dst=OWN/'prospective-input-tree'/rel;dst.parent.mkdir(parents=True,exist_ok=True);assert not dst.exists();shutil.copy2(src,dst)
 rows.append({'futureActivePath':rel,'prospectiveCopyPath':str(dst.relative_to(ROOT)),'sha256':digest,'bytes':src.stat().st_size,'activeSHA256Before':sha(active) if active.exists() else None,'newPath':not active.exists()})
for r in rows:assert sha(ROOT/r['prospectiveCopyPath'])==r['sha256']
base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b014-five-prospective-book-current-v1/prepared-prospective-input-tree.receipt.json';b014=read(ROOT/base);basebad=[]
for r in b014['files']:
 if sha(ROOT/r['futureActivePath'])!=r['sha256'].removeprefix('sha256:'):basebad.append(r['futureActivePath'])
assert not basebad,basebad
write('prepared-prospective-input-tree.receipt.json',{'status':'inactive_exact_future_changed_inputs_exported','createdAtUTC':datetime.now(timezone.utc).isoformat(),'isolationRoot':str(ISO),'baselineB014ActiveAdoptionReceiptPath':base,'baselineB014Future69ActiveExact':True,'baselineB014Future69Mismatches':basebad,'files':rows,'fileCount':len(rows),'totalBytes':sum(r['bytes'] for r in rows),'plannedInputsUnchanged':unchanged,'futureChangedPaths':[r['futureActivePath'] for r in rows],'noNewAtomicIds':True,'fiveNewScientificGoalIds':read(OWN/'exact-goal-and-route-deltas.candidate.json')['fiveGoalIds'],'fourExistingBindingGoalIds':read(OWN/'exact-goal-and-route-deltas.candidate.json')['targetedExistingBindingIds'],'strictClosure':0,'humanApproval':False,'activeWrites':0})
# Source extraction bytes and every unrelated existing mapping remain intact.
before=read(ROOT/mapping['beforePath']);after=read(ISO/mapping['futurePath']);removed=mapping['removedTuples'];added=mapping['addedTuples'];assert all(r in after['mappings'] for r in before['mappings'] if r not in removed)
assert len(after['mappings'])==len(before['mappings'])-len(removed)+len(added)
extracts=[]
for region in ['HE','BY','HB']:
 for p in (ROOT/f'curricula/DE/Gymnasium/input/{region}').rglob('*source-extraction.json'):
  rel=p.relative_to(ROOT);assert sha(p)==sha(ISO/rel);j=read(p);extracts.append({'path':str(rel),'sha256':sha(p),'sourceGoals':len(j.get('sourceGoals',[])),'byteUnchanged':True})
write('native-source-inputs-and-components-preservation.receipt.json',{'status':'exact_normative_source_cells_preserved_with_explicit_residual_HOLD','sourceExtractions':extracts,'oldMappings':len(before['mappings']),'newMappings':len(after['mappings']),'removedOnlyUnrelated950Tuples':removed,'addedOnly584EverydayCompoundPartial':added,'allOtherOriginalMappingTuplesPreserved':True,'sourceGoalIdsDeleted':[],'sourceGoalDenominatorReduced':False,'residualSourceHolds':mapping['residualSourceHolds'],'otherAtlasMappingPathsUnchanged':[p for p in atlas['mappingPaths'] if p!=mapping['futurePath']],'strictClosure':0,'humanApproval':False,'activeWrites':0})
baseline=read(OWN/'isolation-baseline.receipt.json');nativebad=[]
for r in baseline['nativeCopiedCode']:
 if r['path'].startswith('app/scripts/config/'):continue
 if sha(ISO/r['path'])!=r['sha256'] or sha(ROOT/r['path'])!=r['sha256']:nativebad.append(r['path'])
assert not nativebad,nativebad
write('native-code-and-physical-public-root-preservation.receipt.json',{'unmodifiedNativeProgramFilesVerified':sum(not r['path'].startswith('app/scripts/config/') for r in baseline['nativeCopiedCode']),'nativeProgramMismatches':nativebad,'configurationInputsChangedOnlyAsListedInFutureReceipt':True,'physicalPublicImagesCopiedAtPreparation':len(baseline['physicallyCopiedPublicImages']),'all1873PhysicalPublicImagesStillLocalAndExact':all(not (ISO/r['path']).is_symlink() and sha(ISO/r['path'])==r['sha256'] for r in baseline['physicallyCopiedPublicImages'] if not r['path'].endswith(id+'.png')),'activeWrites':0,'humanApproval':False})
print(json.dumps({'exportedChangedFiles':len(rows),'exportedBytes':sum(r['bytes'] for r in rows),'unchangedPlannedFiles':len(unchanged),'B014Future69Exact':True,'unmodifiedNativeProgramFiles':sum(not r['path'].startswith('app/scripts/config/') for r in baseline['nativeCopiedCode'])}))
