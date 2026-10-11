#!/usr/bin/env python3
"""Native predecessor comparison using exactly the already-bound candidate inputs."""
import datetime
import hashlib
import json
import pathlib
import subprocess

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[7]
PACKAGE = HERE.parent
def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()
candidate_report_path = HERE / 'whole-actual-seven-material-CAN494.native-applicability-report.json'
candidate_report = json.loads(candidate_report_path.read_text())
command = json.loads((HERE/'actual-seven-material-native-applicability.command-exit.json').read_text())
capsule = pathlib.Path(command['argv'][-3])
native_can = capsule/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
candidate_bytes = native_can.read_bytes()
assert sha(native_can) == command['candidateSha256']
before = PACKAGE/'inputs/whole-CAN494.current-reviewed-material-predecessor.json'
native_can.write_bytes(before.read_bytes())
output = HERE/'whole-actual-same-input-Core494.native-applicability-predecessor-report.json'
argv = command['argv'][:-1] + [str(output)]
started = datetime.datetime.now(datetime.timezone.utc).isoformat()
try:
    result = subprocess.run(argv, cwd=ROOT, capture_output=True, text=True)
finally:
    native_can.write_bytes(candidate_bytes)
finished = datetime.datetime.now(datetime.timezone.utc).isoformat()
raw = HERE/'actual-same-input-Core494-native-applicability-predecessor.raw.txt'
raw.write_text(result.stdout + result.stderr)
receipt = {'argv':argv,'startedAt':started,'finishedAt':finished,'exitCode':result.returncode,'wholePredecessorSha256':sha(before),'candidateNativeBytesRestoredExact':sha(native_can)==command['candidateSha256'],'rawSha256':sha(raw),'resultSha256':sha(output) if output.exists() else None,'nativeCompilerCodeOrThresholdChanges':0,'activeEdits':0}
(HERE/'actual-same-input-Core494-native-predecessor.command-exit.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
assert result.returncode == 0, result.stderr
baseline = json.loads(output.read_text())
can_rel = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
def noncanonical_inputs(report):
    return {(x['path'],x['origin']):x['sha256'] for x in report['actualPublicCurriculumReadBindings'] if x['path'] != can_rel}
assert noncanonical_inputs(baseline) == noncanonical_inputs(candidate_report), 'Input drift invalidates native causal comparison'
bg = {g['goalId']:g for g in baseline['report']['goals']}
cg = {g['goalId']:g for g in candidate_report['report']['goals']}
compiled_differences = [{'goalId':gid,'before':g['compiledApplicability'],'after':cg[gid]['compiledApplicability']}for gid,g in bg.items()if g['compiledApplicability']!=cg[gid]['compiledApplicability']]
def warnings(report):return {(f['code'],f.get('goalId'),f['message'])for f in report['report']['findings'] if f['severity']=='warning'}
new_warnings = sorted(warnings(candidate_report)-warnings(baseline))
lost_warnings = sorted(warnings(baseline)-warnings(candidate_report))
delta={'scope':'Actual whole current494 predecessor/candidate native applicability over exactly the same unchanged public input bindings. Other subjects are read-only native memory dependencies, no protected M7 approval claim.','predecessorSummary':baseline['report']['summary'],'candidateSummary':candidate_report['report']['summary'],'allOtherActualNativeInputReadsExact':True,'nativeCompilerWholeBytesExact':baseline['candidateCompilerSha256']==candidate_report['candidateCompilerSha256'],'wholeGoalUniverse493Or494Difference':set(bg)!=set(cg),'compiledApplicabilityFieldDifferences':compiled_differences,'newAPVWarnings':new_warnings,'lostAPVWarnings':lost_warnings,'remainingAPVWarningsAreOpenM5Debt':True,'sourceOrRouteOrScientificApprovalClaim':False,'foreignMaturityApprovalClaim':False}
dp=HERE/'actual-same-input-current494-compiler-causal-delta-and-open-APV-boundaries.json'
dp.write_text(json.dumps(delta,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'predecessorSummary':delta['predecessorSummary'],'candidateSummary':delta['candidateSummary'],'newWarnings':new_warnings,'compiledFieldDifferences':compiled_differences,'receiptSha256':sha(HERE/'actual-same-input-Core494-native-predecessor.command-exit.json'),'deltaSha256':sha(dp)},ensure_ascii=False))
