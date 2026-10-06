#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Preflight or apply only explicit independently reviewed current Q1 deltas."""
from pathlib import Path
import argparse, copy, hashlib, json
OWN=Path(__file__).resolve().parent
SOURCE_ROOT=OWN.parents[6]
assert (SOURCE_ROOT/'app/scripts/reportDeepUnderstandingRollout.ts').is_file()
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def read(p):return json.loads(Path(p).read_text())
def spans(t):
    p=t.index('[',t.index('"subjects"'))+1;d=json.JSONDecoder();out={}
    while True:
        while t[p].isspace() or t[p]==',':p+=1
        if t[p]==']':return out
        v,n=d.raw_decode(t[p:]);out[v['subject']]=(p,p+n,v,t[p:p+n]);p+=n
def guarded_path(target,relative):
    path=target/relative
    assert path.is_relative_to(target)
    assert not any(p.is_symlink() for p in [path,*list(path.parents)[:len(Path(relative).parts)] ]),f'Symlink write forbidden: {relative}'
    return path
parser=argparse.ArgumentParser();parser.add_argument('--target-root',type=Path,default=SOURCE_ROOT)
g=parser.add_mutually_exclusive_group();g.add_argument('--apply',action='store_true');g.add_argument('--simulate',action='store_true')
args=parser.parse_args();target=args.target_root.resolve();assert target.is_dir()
assert not args.simulate or target!=SOURCE_ROOT,'Simulation requires a separate explicit physical isolate'
plan=read(OWN/'integration-plan.json')
assert len(plan['explicitFutureDeltaFiles'])==24 and len(plan['expectedFourteenNewScientificGoalIds'])==14
if args.apply:
    receipt=read(SOURCE_ROOT/plan['futureCentralReceiptPath']);assert sha(SOURCE_ROOT/plan['futureCentralReceiptPath'])==plan['futureCentralReceiptSHA256']
    assert receipt['actualExitCode']==0 and receipt['reportSHA256']==plan['futureCentralReportSHA256']
    assert sha(SOURCE_ROOT/plan['futureCentralReportPath'])==receipt['reportSHA256']
    report=read(SOURCE_ROOT/plan['futureCentralReportPath'])['subjects'][0]
    assert report['subject']=='chemie' and report['strictComplete']==104 and report['denominator']==376 and report['issues']==[]
    assert all(r['status']=='pass' for r in report['requiredChecks'])
    assert set(plan['protectedCurrentStrict90GoalIds']).issubset(report['strictCompleteGoalIds'])
    assert set(report['strictCompleteGoalIds'])-set(plan['protectedCurrentStrict90GoalIds'])==set(plan['expectedFourteenNewScientificGoalIds'])
    assert not set(plan['sixSourceHoldGoalIds'])&set(report['strictCompleteGoalIds'])
for row in plan['explicitFutureDeltaFiles']:
    assert sha(SOURCE_ROOT/row['prospectiveCopyPath'])==row['sha256']
    dest=guarded_path(target,row['futureActivePath']); actual=sha(dest) if dest.exists() else None
    assert actual in {row['activeSHA256Before'],row['sha256']},f'Unreviewed active delta drift: {row["futureActivePath"]}'
for row in plan['historicalInputs']:assert sha(SOURCE_ROOT/row['preservedCopyPath'])==row['sha256']
for row in plan.get('unchangedCurrentEvidenceGuards',[]):assert sha(target/row['path'])==row['sha256'],f'Unreviewed unchanged evidence drift: {row["path"]}'
for row in plan['explicitArchivedOldImageRemovalPlan']:
    dest=guarded_path(target,row['originalPath']);assert not dest.exists() or sha(dest)==row['sha256']
for row in plan.get('exactReviewFreezeGuards',[]):
    assert sha(SOURCE_ROOT/row['path'])==row['sha256']
    for f in read(SOURCE_ROOT/row['path'])['files']:assert sha(SOURCE_ROOT/f['path'])==f['sha256'].removeprefix('sha256:')
registry=guarded_path(target,plan['centralRegistryPath']);text=registry.read_text();before=spans(text)
replacement=json.dumps(plan['proposedChemie'],ensure_ascii=False,indent=2).replace('\n','\n    ')
assert hashlib.sha256(before['chemie'][3].encode()).hexdigest()==plan['currentChemieRawEntrySHA256'] or before['chemie'][3]==replacement,'Current Chemie registry drift'
for subject,expected in plan['protectedMathPhysRawEntries'].items():assert hashlib.sha256(before[subject][3].encode()).hexdigest()==expected
a,b=before['chemie'][:2];nexttext=text[:a]+replacement+text[b:]
assert all(before[s][3]==spans(nexttext)[s][3] for s in before if s!='chemie')
canonical=guarded_path(target,plan['canonicalPath']);current=read(canonical);candidate=copy.deepcopy(current);goals={g['id']:g for g in candidate['goals']}; original={g['id']:g for g in current['goals']}
for change in plan['explicitCanonicalFieldDeltas']:
    goal=goals[change['goalId']]
    for f in change['fields']:
        oldmatches=(f['field'] in goal)==f['beforeExists'] and goal.get(f['field'])==f['before']
        newmatches=(f['field'] in goal)==f['afterExists'] and goal.get(f['field'])==f['after']
        assert oldmatches or newmatches,'Current unreviewed canonical field drift'
        if f['afterExists']:goal[f['field']]=f['after']
        else:goal.pop(f['field'],None)
changed={r['goalId'] for r in plan['explicitCanonicalFieldDeltas']}
assert all(goals[g]==original[g] for g in goals if g not in changed)
canonicalbytes=(json.dumps(candidate,ensure_ascii=False,indent=2)+'\n').encode()
canrow=next(r for r in plan['explicitFutureDeltaFiles'] if r['futureActivePath']==plan['canonicalPath'])
assert hashlib.sha256(canonicalbytes).hexdigest()==canrow['sha256'],'Merged future canonical must exactly equal reviewed bytes'
writes=0;removals=0
if args.apply or args.simulate:
    for row in plan['explicitFutureDeltaFiles']:
        dest=guarded_path(target,row['futureActivePath'])
        if dest.exists() and sha(dest)==row['sha256']:continue
        dest.parent.mkdir(parents=True,exist_ok=True)
        dest.write_bytes(canonicalbytes if row is canrow else (SOURCE_ROOT/row['prospectiveCopyPath']).read_bytes());writes+=1
    for row in plan['explicitArchivedOldImageRemovalPlan']:
        dest=guarded_path(target,row['originalPath'])
        if dest.exists():dest.unlink();removals+=1
    registry.write_text(nexttext)
    assert all(before[s][3]==spans(registry.read_text())[s][3] for s in before if s!='chemie')
print(json.dumps({'status':'applied_exact_authorized_plan' if args.apply else 'simulated_exact_plan' if args.simulate else 'read_only_exact_preflight_passed','targetRoot':str(target),'plannedDeltaFiles':24,'changedDeltaFilesWritten':writes,'historicallyArchivedOldJPGCopiesRemoved':removals,'wholeSnapshotReset':False,'unrelatedBiologieAndProtectedMathPhysRawRegistryEntriesExact':True,'humanApproval':False,'humanTrial':False,'activeWrites':writes+removals+1 if args.apply and target==SOURCE_ROOT else 0}))
