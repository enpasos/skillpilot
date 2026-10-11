import hashlib
import json
import pathlib

ROOT=pathlib.Path('/home/enpasos/projects/skillpilot')
OUT=pathlib.Path(__file__).parent
BASE=OUT.parent/'wirtschaft-common343-M6-fieldwise-composition-AUTHOR-INERT-v1'
def read(p):return json.loads(p.read_text())
def rel(p):return str(p.relative_to(ROOT))
def bind(p):
 b=p.read_bytes();return {'path':rel(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
sur=ROOT/'curricula/DE/Gymnasium/provenance/canonical-goal-surrogate-evidence-registry.json'
records=read(sur)['entries']
assert not any(r.get('goalId')=='912ab267-ee00-581b-a31c-dfc0b3587184' for r in records)
write(OUT/'actual912-view-practice-requires-closure-candidate-and-native-source-boundary.INERT.json',{
 'existingWholeSUR':bind(sur),'existing912SURRecords':[],
 'boundedViewPracticeClaimCandidate':{'landscapeId':'605bdaf6-32d5-56fd-8d92-5a80c2fd2901','goalId':'912ab267-ee00-581b-a31c-dfc0b3587184','jurisdiction':'DE-BB','evidenceType':'requires-closure','requiredByGoalId':'81dfe82c-508b-51ba-829e-3f9e4d4a27a1','status':'candidate_pending_independent_review','rationale':'The actually unchanged full81d assessment is an already offered BBLK target and directly requires/assesses the entire supplied-rules912 labour-director performance. Its appointed/revoked protected-group-majority and equal executive role are explicit owned practice scope. This is an authored View/Practice requires-closure, NOT a BB Source21 Montan or labour-director mandate.'},
 'nativeSourceSURAcceptance':False,'actualNativeReason':'sourceCoverageEvidence.ts requires the carrier goal to pass isEligibleCanonicalGoal. generateCurriculumQualityStatus.ts passes isCurriculumSourceCoverageGoal, which excludes Practice/Assessment and examData. The81d carrier is therefore ineligible for native CQR003 SourceCoverage. The ordinaryfab does NOT require912, so no fabricated eligible carrier was substituted.',
 'actualCodeBindings':[bind(ROOT/'app/scripts/sourceCoverageEvidence.ts'),bind(ROOT/'app/scripts/generateCurriculumQualityStatus.ts')],
 'wholeSURRegistryCandidateChanged':False,'automaticRequiresAsSourceClaim':False,'M2M6Claim':False,
 'actionBoundary':'Independent A/C can qualify the honest scope/practice claim. Root final actual native SourceCoverage determines whether an additional honest integration treatment is needed; checker logic and original normative source must not be changed to manufacture a pass.'})
native=read(OUT/'actual-native35-views-and-full-BB-existing-practice-closure.READONLY.json')['summary']
assert native['allExistingLKPracticeCoveredGoalsActualTargets'] and native['allPrerequisitesAvailable'] and native['other34RolesUnchanged'] and native['viewErrors']==0
write(OUT/'actual-final-bounded-input-and-main-P-Book-history-guards.READONLY.json',{
 'commonMainSeal':bind(BASE/'SEALED-common689-343-final72-source-scope-native-A-M-root-handoff.INERT.json'),
 'coreSEMNativeBindingUnchanged':[bind(BASE/'candidate-core/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'),bind(BASE/'semantic689.candidate-bound.INERT.json')],
 'fourExistingWholeGoalsExactInCore':True,'full81dMaterialSolutionRubricAndStatusExact':True,
 'P343AndBookSourceViewIndependence':'AgentA inspected actual native functions: P binds CAN/SEM/criteria/profile/assets, BookModel binds wholeNavigation/CAN/SEM/QA/P/assets; neither loads Source32/Mapping/35Views. Unchanged Core698a/SEMd250 means no new P/Book fingerprints.',
 'activeCoreMathPhysicsRegistryEndguards':[bind(ROOT/p) for p in ['curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json','curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json','curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json','curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json']],
 'newGoalNewPNewImageNewDOrNewOwnApproval':False,'nativeSourceSURQualificationUnresolvedIsExplicit':True})
name='SEALED-one-BB-source-union-two-LK-targets-two-metadata-fixes.AUTHOR-INERT.json'
artifacts=[bind(p) for p in sorted(OUT.rglob('*')) if p.is_file() and p.name!=name]
assert not any(p.is_symlink() for p in OUT.rglob('*'))
write(OUT/name,{'role':'ADDITIVE_BOUND_INERT_AUTHOR_SUCCESSOR_NOT_SELF_REVIEW','artifacts':artifacts,'artifactCount':len(artifacts),'immutablePredecessor':bind(BASE/'SEALED-common689-343-final72-source-scope-native-A-M-root-handoff.INERT.json'),'native35':native,'exactSourceRows':30,'partialSourceRows':71,'currentSourceRows':101,'actualEdges':{'all':179,'exact':30,'partial':149},'actualAuthorActiveWrites':False,'sourceCountryScopeSciencePendingExternalCA':True,'nativeSourceSURClaimNotManufactured':True,'M2M6M7CIClaim':False})
print(json.dumps(bind(OUT/name)))
