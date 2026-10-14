# Apache-2.0. Seal once, without editing active inputs or historical packages.
from pathlib import Path
import hashlib, json
from datetime import datetime, timezone
BASE=Path('tmp/cross-subject-requires/decimal-rounding-v4-20261013')
def read(p): return json.loads(Path(p).read_text())
def binding(p):
    data=Path(p).read_bytes()
    return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(data).hexdigest(),'byteLength':len(data)}
def check(row): assert binding(row['path'])==row,row['path']
def write(name,obj):
    with (BASE/name).open('x') as f:f.write(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
baseline=read(BASE/'active-input-baseline.sha256.json')
for row in baseline['files']:check(row)
history=read(BASE/'retained-originals.sha256.json')
for row in history['files']:check(row)
assert read(BASE/'stem-separation.author-validation.json')['actualNativeTaskDemandsEqualAllowlistedRenderer']
assert all(read(BASE/'case-arithmetic.author-validation.json')['rejectedStrategiesByCase'].values())
assert all(c['schemaValid'] and not c['nativeSemanticErrors'] for c in read(BASE/'native-candidate-validation.json')['checks'])
write('active-input-unchanged.check.json', {'schemaVersion':4,'status':'PASS fresh current inputs and immutable history unchanged after inert author construction',
    'currentInputsChecked':len(baseline['files']),'retainedV2V3FilesChecked':len(history['files']),
    'checkedAt':datetime.now(timezone.utc).isoformat(),'activeSourceQaRuntimeOrLearnerStateChanged':False})
ep={
 'goalAuthorCandidate':'goal.author-candidate.json',
 'fullPositiveBody':'positive-profile.body.author-candidate.json',
 'nativePositiveAuthorInput':'positive-evidence.author-candidate.jsonl',
 'fullDescriptionBody':'description-profile.body.author-candidate.json',
 'nativeDescriptionAuthorInput':'description-evidence.author-candidate.jsonl',
 'learnerFacts':'learner-facts.author-candidate.json',
 'learnerOnlyPrompts':'learner-prompts.author-candidate.json',
 'teacherOnlyGrading':'teacher-grading.author-candidate.json',
 'audienceBoundaryContract':'presentation-audience.contract.json',
 'assessmentProbeDesigns':'assessment-probes.author-candidate.json',
 'exactArithmeticValidation':'case-arithmetic.author-validation.json',
 'fieldSeparationValidation':'stem-separation.author-validation.json',
 'nativeCandidateShapeValidation':'native-candidate-validation.json',
 'unchangedSourcesFoundationsAndContext':'context-retention-and-semantic-invariants.json',
 'responseToV3PeerDissent':'peer-findings-and-amendment.author-response.json',
 'freshCurrentInputBaseline':'active-input-baseline.sha256.json',
 'freshProjectionSimulation':'routes-and-projections.author-candidate.json',
 'allIndependentGatesPending':'independent-gates.pending.json',
 'repeatableReadOnlyVerifier':'validate-sealed-v4.ts',
}
files=[binding(p) for p in sorted(BASE.rglob('*')) if p.is_file()]
write('sealed-author-package.index.json', {
 'schemaVersion':4,'status':'sealed_inert_author_v4_pending_distinct_independent_review_and_all_native_adoption_gates',
 'author':'Codex GPT-6.1 Sol Ultra / requires_runtime_path / v4 author','sealedAt':datetime.now(timezone.utc).isoformat(),
 'goalId':'077d5e2f-27f2-5215-9d48-fe002cf1c663',
 'entryPoints':{key:binding(BASE/name) for key,name in ep.items()},'files':files,
 'retainedOriginalInputs':history['files'],
 'priorPeerManifest':binding(Path('tmp/cross-subject-requires/decimal-rounding-v3-20261013/index.independent-review-v1.json')),
 'amendment':'Replace cued v3 task stems and all examples with six fresh opaque-numbered cases. Fixed bilingual learner template admits only original number, requested place and general positive nearest/ties-up rule with a neutral explanation request. The same optional neutral truncation comparison follows after the initial answer; all answers, diagnostic classes, neighbor/deciding-digit/tie/zero/carry details remain teacher-only.',
 'semanticBoundary':'Proposed goal body, intrinsic decimal-place meaning, orientation653-only direct requires, positive terminating scope and partial16-source body/roles/corrected locators unchanged. No mastery of broader2f/natural-rounding/other-numeral-system/rational-arithmetic is assumed or created.',
 'evidenceBoundary':'Fresh examples and exact arithmetic/counterstrategy/field-separation author checks are candidate design evidence. Actual learner exposure, substantive explanations and real-host withholding of teacher fields are unproven. Six examples are not a task quota; sufficient integrated multi-step transfer in fewer tasks may establish all aspects.',
 'currentInputs':{'freshBoundInputCount':len(baseline['files']),'retainedHistoryFileCount':len(history['files']),
    'mathematicsViews':88,'physicsViews':69,'currentDriftSinceV3':read(BASE/'current-baseline-comparison.json')['changedSinceV3'],
    'allPhysicsTargetsAndVisibleTreesUnchangedInConditionalSimulation':True},
 'gateState':read(BASE/'independent-gates.pending.json')['gates'],
 'openLimits':['Distinct actual v4 semantic/P prompt/teacher-boundary review pending; prior v3 PASS is not rebound.',
   'Exact source mapping/year/stage/course target placement and reachable intrinsic preparation routes pending, especially BW.',
   'All final-context native dualD+synthesis/P/A/M/kind/actualV and strict futureMath808 gates pending; current807 unchanged.',
   'No futurePhysics f6/b615 edge is accepted by this candidate or its conditional projection simulation.'],
 'activeCanonicalOrLearnerStateChanged':False,'sourceQaViewsChanged':False,'activationApproved':False,
 'nativeIndependentApprovalClaimed':False,'nativeM7ApprovalClaimed':False,'humanApprovalClaimed':False,
 'imageGenerated':False,'publishedOrDeployed':False,
 'reproducibility':'All newly authored inputs are generated by author-v4.py, then assemble-candidates.ts, bind-native-candidates.ts and route-impact.ts. Arithmetic and field separation have repeatable read-only checks. Timestamps and current input reads are fresh capture, not a byte-identical rerun promise. Retained-context files remain byte-identical v3 historical inputs.',
 'verificationCommand':'PATH=/home/enpasos/projects/skillpilot/tmp/ci-tools/node-v20.20.2-linux-x64/bin:$PATH app/node_modules/.bin/tsx tmp/cross-subject-requires/decimal-rounding-v4-20261013/validate-sealed-v4.ts',
 'licensing':{'softwareAndTechnicalWorkflow':'Apache-2.0','ownGoalAndDidacticEvidence':'CC-BY-4.0','attribution':'SkillPilot contributors','thirdPartySources':'retain original rights; no source relicensing'},
})
print(json.dumps({'status':'v4 sealed author candidate only','manifest':binding(BASE/'sealed-author-package.index.json'),'ownFiles':len(files),'retainedV2V3Files':len(history['files']),'activeInputs':len(baseline['files'])}))
