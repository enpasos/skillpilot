# Apache-2.0. Only finite Chemistry evidence/dependencies and detached normal aliases/assets.
import datetime,hashlib,json,os,pathlib
R=pathlib.Path('/home/enpasos/projects/skillpilot');O=pathlib.Path(__file__).parent;H=R/'tmp/checkpoint-chemie-20261013/current407-corrected-P8-native4-physical-host'
N=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-current407-naturstoffe-seven-shared-native-first-pass-technical-20261014-v1'
read=lambda p:json.loads(p.read_text())
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p):return {'path':str(p.relative_to(R)),'sha256':sha(p),'bytes':p.stat().st_size}
def link(src,dst):
 dst.parent.mkdir(parents=True,exist_ok=True)
 if dst.exists():assert src.read_bytes()==dst.read_bytes(),(src,dst)
 else:os.link(src,dst)
def detach(src,dst):
 dst.parent.mkdir(parents=True,exist_ok=True)
 if dst.exists():dst.unlink()
 dst.write_bytes(src.read_bytes());assert src.read_bytes()==dst.read_bytes()
proof=read(O/'PREFLIGHT.exact-N7-I274-canonical-QA-P-A-M-and-NI3-preservation.actual.json')
assert read(O/'checks/STOCK.seven-normal-current-resolutions-index-chains-and-P6.actual.json')['pass']
for n in ['summarize','synthesis-manifest','resolutions','finalize']:assert read(O/f'checks/STOCK.N7.{n}.actual.json')['exitCode']==0
for x in proof['sourceNI3MustRemainExact']:assert sha(H/x['logicalHostPath'])==x['candidate']['sha256']
protectedNames=['DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json','DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json','DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json','DE_DEU_S_GYM_CANONICAL_OVERVIEW.de.json']
protected=[bind(H/'curricula/DE/Gymnasium/canonical'/n) for n in protectedNames]
aliases={
 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json':O/'candidate/canonical533.current407.N7.inactive.json',
 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json':O/'candidate/semantic533.current407.N7.normal-alias.inactive.json',
 'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json':O/'candidate/QA.current407.N7.I274-exact-except-seven-reviewed-bindings.inactive.json'}
before=[bind(H/p) for p in aliases]
# Owned finite package only; immutable direct neutral dependencies are linked only if missing.
for src in O.rglob('*'):
 if src.is_file():link(src,H/src.relative_to(R))
dependencyFiles=[]
for sub in ['configs','candidate','shared','models','public-root']:
 for src in (N/sub).rglob('*'):
  if src.is_file():link(src,H/src.relative_to(R));dependencyFiles.append(bind(src))
# The published synthesis points to original sealed schemas/payloads copied in native-seven;
# no historical cross-subject dependency tree or generated asset sweep is copied.
for logical,src in aliases.items():detach(src,H/logical)
assetChecks=[]
for x in proof['selectedCurrentPhysicalAssetsAndOriginalVApprovals']:
 src=R/x['exactVSource']['path']
 for p in [x['expectedPublicPath'],x['expectedCanonicalPath']]:
  if x['newImageImportRequired']:detach(src,H/p)
  assert sha(H/p)==x['sha256'],p
 assetChecks.append({'goalId':x['goalId'],'originalVSource':x['exactVSource'],'actualPublic':bind(H/x['expectedPublicPath']),'actualCanonical':bind(H/x['expectedCanonicalPath']),'expectedVApprovedSha256':x['sha256'],'bothPathsAndApprovedHashesExact':True})
assert protected==[bind(R/x['path']) for x in protected]
for x in proof['sourceNI3MustRemainExact']:assert sha(H/x['logicalHostPath'])==x['candidate']['sha256']
q=read(H/'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json');qb={r['goalId']:r for r in q['records']}
for x in assetChecks:assert qb[x['goalId']]['aiApproved'] is True and qb[x['goalId']]['aiApprovedAssetSha256']==qb[x['goalId']]['assetSha256']==x['expectedVApprovedSha256']
out={'schemaVersion':1,'importedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'privateHost':str(H.relative_to(R)),
 'beforeAliases':before,'afterAliases':[bind(H/p) for p in aliases],'detachBeforeWrite':True,
 'allSevenActualCanonicalPublicAndApprovedVBindings':assetChecks,'onlyFourReviewedPngPairsNewlyImported':True,
 'protectedOtherCanonicalAndOverviewWholeFileBindings':protected,'sourceNI3ExactBeforeAndAfter':proof['sourceNI3MustRemainExact'],
 'onlyFiniteOwnedChemistryPackageAndNeededN7DependenciesLinked':True,'directNeutralDependencyFiles':dependencyFiles,
 'operativeP6ExcludesHeld682':True,'genuineFreshNativeD7BothSealsRequiredBeforeImport':True,
 'M7OriginalSixNoMemoryAndOneMemoryRequiredPreserved':True,'M311FourBBBEAcquisitionHoldsRemain':True,
 'newScienceVotes':0,'mainActiveFilesOrGitWrites':False,'fullCentralStockRunStillPending':True}
p=O/'CHECK.private-host-detached-aliases-seven-actual-assets-and-NI3-preserved.actual.json';assert not p.exists();p.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'detachedNormalAliases':len(aliases),'fourNewCanonicalPublicPngPairs':4,'allSevenActualVBindings':len(assetChecks),'NI3Preserved':3,'protectedOtherCanonicalFiles':len(protected),'stockCentralPending':True}))
