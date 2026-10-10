import hashlib,json,pathlib
OUT=pathlib.Path(__file__).resolve().parent
ROOT=OUT.parents[6]
Q=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,obj):
 assert p.is_relative_to(OUT)
 p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
before=json.loads((OUT/'actual-bound-inputs.before.READONLY.json').read_text())
after={p:{'sha256':sha(ROOT/p),'bytes':(ROOT/p).stat().st_size} for p in before}
changed=[p for p in before if before[p]!=after[p]]
write(OUT/'actual-bound-inputs.after.READONLY.json',after)
assert not changed, changed
core_paths=[
 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json',
 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json',
 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json']
core=[{'path':p,'before':before[p],'after':after[p],'exact':before[p]==after[p]} for p in core_paths]
write(OUT/'actual-four-core-endguards-and-all-native-inputs-exact.READONLY.json',{
 'fourCoreEndguards':core,'all8197NativeBoundInputsExact':len(before)==8197 and not changed,
 'allBoundInputCount':len(before),'activeWritesByThisAuthor':0,
 'protectedMathPhysicsSciencePackagesReevaluated':False,
 'floorPolicyExact':before['app/scripts/config/curriculum-maturity-floor-policy.json']==after['app/scripts/config/curriculum-maturity-floor-policy.json'],
 'newGoalbookOrM6GateClaim':False})

prior_seals=[
 ('wirtschaft-1826-three-atomic-competences-six-real-P-cases-AUTHOR-INERT-root-v1','actual-SEALED-unreviewed-INERT-three-atom-six-real-case-handoff.receipt.json'),
 ('wirtschaft-1826-four-observable-strings-no-example-quota-AUTHOR-INERT-v2','actual-four-string-INERT-author-successor-exact-boundaries.receipt.json'),
 ('wirtschaft-1826-classical-seven-state-source-facets-and-bounded-rerouting-AUTHOR-INERT-v1','actual-SEALED-unreviewed-source-facet-author-handoff.receipt.json'),
 ('wirtschaft-1826-classical-source-operator-fidelity-and-BB-claim-retirement-AUTHOR-INERT-v2','actual-SEALED-unreviewed-v2-operator-fidelity-and-retirement.receipt.json')]
preserved=[]
for folder,name in prior_seals:
 d=Q/folder;p=d/name
 if not p.exists():
  candidates=list(d.glob('*SEALED*.receipt.json')); assert len(candidates)==1,(folder,candidates);p=candidates[0]
 seal=json.loads(p.read_text());records=seal.get('artifacts',seal.get('files',[]))
 checked=[]
 for row in records:
  if not isinstance(row,dict) or 'path' not in row or 'sha256' not in row:continue
  artifact=ROOT/row['path'];expected=row['sha256'].removeprefix('sha256:')
  assert sha(artifact)==expected,artifact
  checked.append({'path':row['path'],'sha256':sha(artifact),'exactHistoricalSeal':True})
 preserved.append({'receiptPath':str(p.relative_to(ROOT)),'receiptSha256':sha(p),'checkedArtifactCount':len(checked),'checkedArtifacts':checked})
write(OUT/'actual-own-prior-goals-six-cases-four-strings-sourcev1v2-historical-seals-exact.READONLY.json',preserved)

report=json.loads((OUT/'actual-native-final34GK-LK-plus-one-SekI-views.READONLY.json').read_text())
native=json.loads((OUT/'actual-native-economics-applicability-INERT-candidate.READONLY.json').read_text())
assert len(report)==35 and all(not x['duplicateVisibleIds'] for x in report)
assert all(not any(f['severity']=='error' for f in x['findings']) for x in report)
assert native['summary']['errors']==0
links=[];artifacts=[]
for p in sorted(OUT.rglob('*')):
 if p.is_symlink():
  links.append({'path':str(p.relative_to(ROOT)),'target':str(p.readlink()),'targetSha256':sha(p) if p.is_file() else None})
 elif p.is_file() and not p.name.startswith('actual-SEALED-'):
  artifacts.append({'path':str(p.relative_to(ROOT)),'sha256':'sha256:'+sha(p),'bytes':p.stat().st_size})
write(OUT/'actual-native-capsule-input-symlinks.READONLY.json',links)
artifacts.append({'path':str((OUT/'actual-native-capsule-input-symlinks.READONLY.json').relative_to(ROOT)),'sha256':'sha256:'+sha(OUT/'actual-native-capsule-input-symlinks.READONLY.json'),'bytes':(OUT/'actual-native-capsule-input-symlinks.READONLY.json').stat().st_size})
receipt={
 'kind':'SEALED_AUTHOR_INERT_SOURCE_SCOPE_V3','date':'2026-10-10',
 'status':'unreviewed_author_candidate_with_explicit_open_blockers',
 'fourCoreEndguardsExact':all(x['exact'] for x in core),
 'allBoundInputsExactBeforeAfter':not changed,'boundInputCount':len(before),
 'activeWrites':0,'nativeCheckerRuntimeChanges':0,'newImages':0,
 'wholeCandidateGoals':681,'newOrdinaryGoalIds':['a2fa1186-df35-5954-a9a9-e311a55e218f','df17fd21-e9b7-598f-970e-8f541d059694'],
 'actualNativeViews':{'GK_LK':34,'separateSekI':1,'compileErrors':0,'duplicateVisibleIDs':0,'missingFacetExplicitPrerequisiteRoles':0},
 'nativeApplicability':{'economicsErrors':0,'warnings':4,'warningMeaning':'2 honest didactic override notices,2 existing assessment NI-app consequences intentionally open'},
 'bbSourceIds':99,'bbRoutingIds':99,'bbRouting99IsNormativeCoverageApproval':False,
 'bbPipelineM1M2M3':'INCOMPLETE','realMandatoryBB23M2M7Blockers':['market-form/provider-behaviour breadth','imperfect-polypol diagram performance','price-differentiation profit gains'],
 'optionalBBInterventionAnalysisDiagramOpen':True,
 'independentScientificOrRoleApproval':False,'sourceFingerprintOrWholeSourceGatesRun':False,
 'M6M7OrHumanReleaseCompletion':False,'protectedFloorsScientificallyRereviewed':False,
 'rootMemoryWorkPresumed':False,'separatePracticeAndCurrentMemoryBlockersRemainOpen':True,
 'historicalAuthorSealsChecked':preserved,
 'symlinkCount':len(links),'artifacts':artifacts}
p=OUT/'actual-SEALED-unreviewed-bounded-source-scope-native35views-v3.receipt.json';write(p,receipt)
print(json.dumps({'receipt':str(p.relative_to(ROOT)),'sha256':sha(p),'artifacts':len(artifacts),'inputGuards':len(before),'symlinks':len(links),'status':receipt['status']}))
