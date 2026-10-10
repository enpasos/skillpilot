# SPDX-License-Identifier: Apache-2.0
import pathlib
helper=pathlib.Path(__file__).with_name('run_normal_checks.py').read_text();exec(helper.split('\nqa=run(')[0])
r=run('normal-chemie-inactive-central-five-gate-complete-inputs-attempt2','app/scripts/reportDeepUnderstandingRollout.ts',['--config='+str(P/'registry/chemie-only-normal-check.config.json'),'--mode=check','--format=json'])
if r.stdout.strip().startswith('{'):put('checks/normal-chemie-inactive-central-five-gate-complete-inputs-attempt2.actual.report.json',json.loads(r.stdout))
