#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Default read-only preflight; Root may apply this exact reviewed source-only plan."""
from pathlib import Path
import argparse,hashlib,json
OWN=Path(__file__).resolve().parent;SOURCE_ROOT=OWN.parents[6];assert (SOURCE_ROOT/'app/scripts/reportDeepUnderstandingRollout.ts').is_file()
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();read=lambda p:json.loads(p.read_text())
def spans(t):
 p=t.index('[',t.index('"subjects"'))+1;d=json.JSONDecoder();out={}
 while True:
  while t[p].isspace()or t[p]==',':p+=1
  if t[p]==']':return out
  v,n=d.raw_decode(t[p:]);out[v['subject']]=(p,p+n,v,t[p:p+n]);p+=n
def path(root,rel):
 p=root/rel;assert p.is_relative_to(root) and not any(q.is_symlink()for q in [p,*list(p.parents)[:len(Path(rel).parts)]]),'Symlink write forbidden '+rel;return p
parser=argparse.ArgumentParser();parser.add_argument('--target-root',type=Path,default=SOURCE_ROOT);g=parser.add_mutually_exclusive_group();g.add_argument('--apply',action='store_true');g.add_argument('--simulate',action='store_true');args=parser.parse_args();target=args.target_root.resolve();assert target.is_dir()and(not args.simulate or target!=SOURCE_ROOT)
plan=read(OWN/'integration-plan.json');assert not plan['explicitCanonicalFieldDeltas']and not plan['newCanonicalGoals']and len(plan['expectedOnlySevenNewScientificGoalIds'])==7
assert sha(target/plan['canonicalPath'])==plan['canonicalSHA256MustRemain'];assert sha(SOURCE_ROOT/plan['currentDescriptionIndexPath'])==plan['currentDescriptionIndexSHA256']
guards=[{'path':plan['technicalCurrent365FreezePath'],'sha256':plan['technicalCurrent365FreezeSHA256']}]+plan['exactReviewFreezeGuards']
for row in guards:
 f=SOURCE_ROOT/row['path'];assert sha(f)==row['sha256'].removeprefix('sha256:')
 for r in read(f)['files']:assert sha(SOURCE_ROOT/r['path'])==r['sha256'].removeprefix('sha256:')
for row in plan['reviewAddendumGuards']:assert sha(SOURCE_ROOT/row['path'])==row['sha256']
for r in plan['unchangedCurrentEvidenceGuards']:assert sha(target/r['path'])==r['sha256'],'Current unchanged evidence drift '+r['path']
for r in plan['explicitFutureDeltaFiles']:
 assert sha(SOURCE_ROOT/r['prospectiveCopyPath'])==r['sha256'];d=path(target,r['futureActivePath']);h=sha(d)if d.exists()else None;assert h in {r['activeSHA256Before'],r['sha256']},'Current source drift '+r['futureActivePath']
if args.apply:
 receipt=read(SOURCE_ROOT/plan['futureCentralReceiptPath']);assert sha(SOURCE_ROOT/plan['futureCentralReceiptPath'])==plan['futureCentralReceiptSHA256']and receipt['actualExitCode']==0
 report=SOURCE_ROOT/plan['futureCentralReportPath'];assert sha(report)==receipt['reportSHA256']==plan['futureCentralReportSHA256'];s=read(report)['subjects'][0];assert s['strictComplete']==49 and s['denominator']==365 and s['issues']==[]and all(c['status']=='pass'for c in s['requiredChecks']);assert set(plan['protectedCurrentStrict42GoalIds']).issubset(s['strictCompleteGoalIds'])and set(s['strictCompleteGoalIds'])-set(plan['protectedCurrentStrict42GoalIds'])==set(plan['expectedOnlySevenNewScientificGoalIds'])
reg=path(target,plan['centralRegistryPath']);text=reg.read_text();before=spans(text);replacement=json.dumps(plan['proposedBiologie'],ensure_ascii=False,indent=2).replace('\n','\n    ');assert hashlib.sha256(before['biologie'][3].encode()).hexdigest()==plan['currentBiologieRawEntrySHA256']or before['biologie'][3]==replacement
for subject,h in plan['protectedMathPhysRawEntries'].items():assert hashlib.sha256(before[subject][3].encode()).hexdigest()==h
a,b=before['biologie'][:2];after=text[:a]+replacement+text[b:];assert all(before[s][3]==spans(after)[s][3]for s in before if s!='biologie');writes=0
if args.apply or args.simulate:
 for r in plan['explicitFutureDeltaFiles']:
  d=path(target,r['futureActivePath'])
  if d.exists()and sha(d)==r['sha256']:continue
  d.parent.mkdir(parents=True,exist_ok=True);d.write_bytes((SOURCE_ROOT/r['prospectiveCopyPath']).read_bytes());writes+=1
 reg.write_text(after);assert sha(target/plan['canonicalPath'])==plan['canonicalSHA256MustRemain']and all(before[s][3]==spans(reg.read_text())[s][3]for s in before if s!='biologie')
print(json.dumps({'status':'applied_exact_reviewed_plan'if args.apply else'simulated_exact_plan'if args.simulate else'read_only_exact_preflight_passed','targetRoot':str(target),'plannedDeltaFiles':len(plan['explicitFutureDeltaFiles']),'changedFilesWritten':writes,'canonicalChanges':0,'unrelatedChemieAndProtectedMathPhysRawEntriesExact':True,'wholeSnapshotReset':False,'humanApproval':False,'humanTrial':False,'activeWrites':writes+1 if args.apply and target==SOURCE_ROOT else 0}))
