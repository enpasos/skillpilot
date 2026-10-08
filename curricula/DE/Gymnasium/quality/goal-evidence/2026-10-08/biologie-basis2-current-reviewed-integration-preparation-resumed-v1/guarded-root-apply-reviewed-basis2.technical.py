# SPDX-License-Identifier: Apache-2.0
"""Reviewable guarded apply for Root; default is a read-only concrete plan."""
import argparse,hashlib,json,shutil,subprocess
from pathlib import Path
from datetime import datetime,timezone
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent
def read(p):return json.loads(Path(p).read_text())
def bind(p):
    p=Path(p);return dict(path=str(p.relative_to(ROOT)),sha256=hashlib.sha256(p.read_bytes()).hexdigest(),bytes=p.stat().st_size)
def verify(v):
    p=ROOT/v['path'];actual=bind(p)
    assert actual['sha256']==v['sha256'].removeprefix('sha256:') and actual['bytes']==v['bytes'],p
    assert not p.is_symlink(),p
    return p
parser=argparse.ArgumentParser();parser.add_argument('--apply',action='store_true');args=parser.parse_args()
guard_path=OWN/'reviewed-basis2-current-final-adoption.guard.json';guard=read(guard_path)
assert subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip()==guard['expectedHead']
for v in guard['before'].values():
    assert verify(v['active']).read_bytes()==verify(v['snapshot']).read_bytes()
for v in guard['candidate'].values():verify(v)
verify(guard['originalReadinessReceipt']);verify(guard['technicalEvidence'])
proof=read(OWN/'checks/strict-affected-capsule-biology246-of394.actual.json')
assert proof['actualCentralExitCode']==0 and proof['actualBlockingIssues']==0 and proof['all244PreviousStrictIdsRetained']
assert (proof['strictComplete'],proof['denominator'])==(246,394)
assert proof['newScientificClosures']==sorted(guard['newGoalIds'])
assert read(OWN/'checks/capsule-actual-whole394-page-frame.json')['wholePageDeltasToActuallyReviewedFinal394']==[]
before_registry=read(ROOT/guard['before']['registry']['active']['path']);after_registry=read(ROOT/guard['candidate']['registry']['path'])
assert [s for s in before_registry['subjects'] if s['subject']!='biologie']==[s for s in after_registry['subjects'] if s['subject']!='biologie']
before_qa=read(ROOT/guard['before']['qa']['active']['path']);after_qa=read(ROOT/guard['candidate']['qa']['path'])
assert [r for r in after_qa['records'] if r['goalId'] not in guard['newGoalIds']]==before_qa['records']
assert len(before_qa['records'])==392 and len(after_qa['records'])==394
for i in guard['imageInstalls']:
    verify(i['source']);assert i['mustNotExist'] and not (ROOT/i['destination']).exists(),i['destination']
file_plan=[dict(destination=guard['before'][key]['active']['path'],exactCandidate=v) for key,v in guard['candidate'].items()]
assert len(file_plan)==7
summary=dict(role='CONCRETE_GUARDED_ROOT_INTEGRATION_PLAN',currentStrict='244/392',candidateActuallyCheckedStrict='246/394',newScientificClosures=guard['newGoalIds'],genuineExistingContextSupersession=guard['contextSupersessionGoalId'],netNewScientificClosures=2,restoredContextBindingNetGain=0,canonicalNodeCount478=True,filePlan=file_plan,imageInstallPlan=guard['imageInstalls'],sourceRefreshCommand=['node','app/node_modules/tsx/dist/cli.mjs','app/scripts/buildGoalBookSourceAtlasInputs.ts','--config',guard['before']['sourceInputs']['active']['path']],requiredRootPostApply=['ordinary current P2/A394/M394 and all8 memory visibility scopes','ordinary current V394 freshness and source atlas freshness','installed original PNG asset copies and AI transparency Layer A inventory','ordinary whole394 public book loader exact page frame','complete current central report with protected Mathematics807/807 Physics478/478 Chemistry177/378 and Biology246/394','dependent curriculum-status and protected maturity floors','batched required schema and application/build gates at the stable integration checkpoint'],fourOperatorAndWholeRegionalSourceHoldsRetained=True,newScientificReviewByIntegrator=False,humanApproval=False,humanTrial=False,applyRequested=args.apply)
print(json.dumps(summary,ensure_ascii=False,indent=2))
if not args.apply:raise SystemExit(0)
receipt=OWN/'root-guarded-basis2-apply.actual.json';assert not receipt.exists()
# All guards and exact source bytes were checked before any authorized mutation.
for i in guard['imageInstalls']:
    dest=ROOT/i['destination'];dest.parent.mkdir(parents=True,exist_ok=True)
    shutil.copyfile(ROOT/i['source']['path'],dest)
for key,v in guard['candidate'].items():
    shutil.copyfile(ROOT/v['path'],ROOT/guard['before'][key]['active']['path'])
for key,v in guard['candidate'].items():
    assert bind(ROOT/guard['before'][key]['active']['path'])['sha256']==v['sha256']
for i in guard['imageInstalls']:
    assert bind(ROOT/i['destination'])['sha256']==i['source']['sha256']
receipt.write_text(json.dumps(dict(appliedAtUtc=datetime.now(timezone.utc).isoformat(),originalGuard=bind(guard_path),exactCandidateFileCount=7,actualImageInstallCount=len(guard['imageInstalls']),activeCurrentCentralAndDependentChecks='PENDING_ROOT_POST_APPLY',activeStrictGainClaimed=0,newScientificReviewByIntegrator=False,humanApproval=False,humanTrial=False),ensure_ascii=False,indent=2)+'\n')
