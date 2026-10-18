# SPDX-License-Identifier: Apache-2.0
"""Exactly the three authorized stock npm scripts; separate byte-exact raw logs."""
import concurrent.futures
import datetime
import hashlib
import json
import os
from pathlib import Path
import subprocess
import time

T=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-final-three-view-course-stock-checks-technical-20261018-v1')
SCRIPTS=[('validate:view-filters','validate-view-filters'),('validate:composition-views','validate-composition-views'),('test:course-level-mapping-consistency','test-course-level-mapping-consistency')]
def pin(p):
    b=Path(p).read_bytes();return dict(path=str(p),sha256=hashlib.sha256(b).hexdigest(),bytes=len(b))
def now():return datetime.datetime.now(datetime.timezone.utc).isoformat()
package=json.loads(Path('app/package.json').read_text())
expected={'validate:view-filters':'tsx scripts/validateViewFilters.ts','validate:composition-views':'tsx scripts/validateCompositionViews.ts','test:course-level-mapping-consistency':'tsx scripts/testCourseLevelMappingConsistency.ts'}
assert {k:package['scripts'][k] for k in expected}==expected
guards=['app/package.json','app/scripts/validateViewFilters.ts','app/scripts/validateCompositionViews.ts','app/scripts/testCourseLevelMappingConsistency.ts','app/scripts/applicabilityCompiler.ts','app/scripts/treeProjectionValidator.ts','app/scripts/generateCurriculumQualityStatus.ts']
before=[pin(p) for p in guards]
assert not (T/'RECEIPT.actual-three-stock-npm-checks.json').exists(), 'One actual execution only; preserve history.'
def run(entry):
    script,label=entry
    out=T/'raw'/(label+'.stdout.txt');err=T/'raw'/(label+'.stderr.txt')
    assert not out.exists() and not err.exists()
    argv=['npm','--prefix','app','run',script]
    start=now();mono_start=time.monotonic_ns()
    with out.open('wb') as stdout,err.open('wb') as stderr:
        result=subprocess.run(argv,stdout=stdout,stderr=stderr,check=False)
    mono_end=time.monotonic_ns();end=now()
    record=dict(commandArgv=argv,command=' '.join(argv),packageScript=expected[script],cwd='repository root',startUTC=start,endUTC=end,exitCode=result.returncode,monotonicDurationNanoseconds=mono_end-mono_start,actualWallDurationSeconds=(mono_end-mono_start)/1_000_000_000,stdout=pin(out),stderr=pin(err),environmentChanged=False,guardChanged=False)
    print(json.dumps(dict(script=script,exitCode=result.returncode,seconds=record['actualWallDurationSeconds']),ensure_ascii=False),flush=True)
    return record
start=now();mono_start=time.monotonic_ns()
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
    records=list(executor.map(run,SCRIPTS))
end=now();mono_end=time.monotonic_ns()
after=[pin(p) for p in guards]
assert after==before,'Original script/package/compiler guard changed during run'
receipt=dict(artifactRole='ACTUAL_EXACT_THREE_AUTHORIZED_STOCK_NPM_CHECKS_NO_NEW_SCIENCE',startUTC=start,endUTC=end,allThreeActualWallDurationSeconds=(mono_end-mono_start)/1_000_000_000,parallelExecution=True,records=records,allExitCodesZero=all(r['exitCode']==0 for r in records),originalGuardBeforePins=before,originalGuardAfterPins=after,allOriginalGuardsByteUnchanged=True,actualRelevantInheritedEnvironment={k:os.environ.get(k) for k in ('APPLICABILITY_VALIDATION_SCOPE','APPLICABILITY_VERBOSE_WARNINGS')},environmentOverrides={},declaredStockScratchEffects=[dict(command='validate:view-filters',path='tmp/applicability',effect='Unmodified stock validator builds applicability in memory and writes its ordinary scratch JSON reports; these are diagnostics, not normal source/C/P/View data or an extra command.'),dict(command='test:course-level-mapping-consistency',path='os.tmpdir()/course-level-active-discovery-*',effect='Unmodified fixture creates isolated temporary mapping fixtures and removes them in finally.')],sourceAtlasGeneratedInputsRead=False,excludedUnreadDirectory='app/scripts/config/goal-books/source-views',normalDataMutationByRunner=0,newReviewVotes=0,buildCommitStageRuns=0)
(T/'RECEIPT.actual-three-stock-npm-checks.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(dict(allExitCodesZero=receipt['allExitCodesZero'],totalActualWallSeconds=receipt['allThreeActualWallDurationSeconds'],receipt=str(T/'RECEIPT.actual-three-stock-npm-checks.json')),ensure_ascii=False),flush=True)
