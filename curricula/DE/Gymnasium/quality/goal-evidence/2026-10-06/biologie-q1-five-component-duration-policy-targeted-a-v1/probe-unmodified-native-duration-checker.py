# SPDX-License-Identifier: Apache-2.0
"""Run the unchanged native checker against baseline/candidate in a temp mirror."""
import hashlib
import json
import shutil
import subprocess
import tempfile
from datetime import datetime, timezone
from pathlib import Path

OWN = Path(__file__).resolve().parent
ROOT = OWN.parents[6]
QA = OWN / 'qa-artifacts'
QA.mkdir(exist_ok=True)

def bind(path):
    data = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

checker = ROOT/'app/scripts/reportGymnasiumDurationModelReadiness.ts'
policy = ROOT/'curricula/DE/Gymnasium/provenance/gymnasium-duration-model-policy.json'
candidate = OWN/'gymnasium-duration-model-policy.five-components.candidate.json'
status = ROOT/'docs/qa-ci/status/curriculum-quality-status.json'
report = ROOT/'docs/qa-ci/status/gymnasium-duration-model-readiness.md'
active_before = {str(p.relative_to(ROOT)):bind(p) for p in [checker,policy,status,report]}
with tempfile.TemporaryDirectory(prefix='skillpilot-five-bio-duration-a-') as temporary:
    mirror = Path(temporary)
    for rel in ['app/scripts','curricula/DE/Gymnasium/provenance','docs/qa-ci/status']:
        (mirror/rel).mkdir(parents=True)
    for rel in ['curricula/DE/Gymnasium/input','curricula/DE/Gymnasium/composition-views']:
        (mirror/rel).symlink_to(ROOT/rel, target_is_directory=True)
    mirror_checker = mirror/'app/scripts/reportGymnasiumDurationModelReadiness.ts'
    shutil.copyfile(checker,mirror_checker)
    assert hashlib.sha256(mirror_checker.read_bytes()).hexdigest() == bind(checker)['sha256']
    shutil.copyfile(status,mirror/'docs/qa-ci/status/curriculum-quality-status.json')
    shutil.copyfile(report,mirror/'docs/qa-ci/status/gymnasium-duration-model-readiness.md')
    mirror_policy = mirror/'curricula/DE/Gymnasium/provenance/gymnasium-duration-model-policy.json'
    shutil.copyfile(policy,mirror_policy)
    def run(label,args):
        command = [str(ROOT/'app/node_modules/.bin/tsx'),str(mirror_checker),*args]
        result = subprocess.run(command,cwd=mirror,text=True,capture_output=True)
        (QA/f'{label}.stdout.txt').write_text(result.stdout)
        (QA/f'{label}.stderr.txt').write_text(result.stderr)
        return {'label':label,'nativeArguments':args,'exitCode':result.returncode,'stdoutBinding':bind(QA/f'{label}.stdout.txt'),'stderrBinding':bind(QA/f'{label}.stderr.txt')}, result
    baseline, baseline_result = run('baseline',['--check','--require-reviewed-subject=Biologie'])
    assert baseline_result.returncode == 1
    assert baseline_result.stdout.startswith('ok docs/qa-ci/status/gymnasium-duration-model-readiness.md')
    assert baseline_result.stderr.count('open:grade-structured-needs-duration-policy') == 5
    assert 'is not up to date' not in baseline_result.stderr
    for st in ['BB','BE','MV','SN','TH']:
        assert f'DE-{st} SekI:' in baseline_result.stderr
    shutil.copyfile(candidate,mirror_policy)
    generated, generated_result = run('candidate-generate',['--write','--require-reviewed-subject=Biologie'])
    assert generated_result.returncode == 0 and generated_result.stderr == ''
    shutil.copyfile(mirror/'docs/qa-ci/status/gymnasium-duration-model-readiness.md',QA/'candidate-generated-gymnasium-duration-model-readiness.md')
    final, final_result = run('candidate-check',['--check','--require-reviewed-subject=Biologie'])
    assert final_result.returncode == 0 and final_result.stderr == ''
    assert final_result.stdout.startswith('ok docs/qa-ci/status/gymnasium-duration-model-readiness.md')
active_after = {str(p.relative_to(ROOT)):bind(p) for p in [checker,policy,status,report]}
assert active_before == active_after
receipt = {'schemaVersion':1,'createdAtUTC':datetime.now(timezone.utc).isoformat(),'role':'Native bounded duration candidate reproduction, not independent subject/root integration approval','checkerBytesUnchanged':True,'checkerBinding':bind(checker),'temporaryMirrorInputs':'Actual input and composition-view trees through read-only directory symlinks; exact copies of current status/report; baseline policy then five-row candidate policy. Native --write touched only temporary report, subsequently retained as own candidate artifact.','baseline':baseline,'baselineReportCurrentButDurationExit1':True,'candidateGeneration':generated,'candidateFinalCheck':final,'candidateNativeExit0WithReportCurrent':True,'activeInputsBefore':active_before,'activeInputsAfter':active_after,'activeWrites':False,'checkerExceptions':False,'qualityFloorsReduced':False,'globalDPAOrM7Approval':False,'independentIntegrationReviewPending':True,'humanApproval':False,'strictCompletionsAdded':0,'restoredActiveBindings':0}
(OWN/'native-duration-checker-before-and-candidate.actual.receipt.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'baselineReport':'current','baselineDurationExit':1,'candidateReport':'current','candidateDurationExit':0,'checkerBytes':'EXACT_UNCHANGED','activeWrites':False}))
