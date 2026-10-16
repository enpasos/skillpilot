# SPDX-License-Identifier: Apache-2.0
"""Finite post-central set comparison, science provenance and preservation."""
from pathlib import Path
import datetime
import hashlib
import json
import os

REPO=Path.cwd();R=Path(__file__).resolve().parents[1].relative_to(REPO);E=R.parent
seal=R/'FILES.finite-current358-integration.seal.json';assert not seal.exists()
def read(p):return json.loads(Path(p).read_text())
def bind(p):
    p=Path(p);b=p.read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(p,x):
    assert not p.exists(),p
    p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
prep=read(R/'INPUTS.affected-preparation.selector.json')
baseline=read(prep['baseline338Report']['path'])['subjects'][0]
report=R/'checks/CENTRAL.current422.carbonyl15-equilibrium16.stock-report.actual.json'
current=read(report)['subjects'][0];receipt=read(R/'checks/CENTRAL.exactly-one.command.actual.json')
assert receipt['exitCode']==0 and receipt['actualFullCentralRunCountThisPacket']==1
assert receipt['stdoutSha256']==bind(report)['sha256'] and Path(receipt['stderrRawPath']).stat().st_size==0
old=set(baseline['strictCompleteGoalIds']);new=set(current['strictCompleteGoalIds']);scope=set(prep['scope31GoalIds'])
added=new-old;lost=old-new
assert len(old)==338 and len(new)==358 and len(added)==20 and not lost and added<=scope
assert current['denominator']==422 and current['remaining']==64
assert len(current['requiredChecks'])==6 and all(x['status']=='pass' for x in current['requiredChecks']) and not current['issues']
mp=read(R/'checks/REBUILD.current422.final.physical-map.json')
canonical=read(next(r['physicalRepositorySource']['path'] for r in mp['aliases'] if r['normalHostAlias'].endswith('canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')))
goals={g['id']:g for g in canonical['goals']}
carb=set(read(E/'chemie-carbonyl15-native-paired12-with-three-open-technical-20261015-v1/SELECTION.finite-original-D15-paired12.json')['resolvedGoalIds'])
eq=set(read(E/'chemie-equilibrium16-final-native-original-pair-technical-20261015-v1/SELECTION.final-original-independent-D16-pair.technical.json')['keepCurrentGoalIds'])
assert len(added&carb)==12 and len(added&eq)==8
preserved=read(R/'checks/PROTECTED697.actual-before.json')['files'];assert len(preserved)==697
for f in preserved:assert bind(f['path'])['sha256']==f['sha256']
put(R/'checks/PROTECTED697.actual-after-and-baselines.json',{
    'role':'Exact post-central active input preservation; no repeat subject review',
    'checkedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'protectedFileCount':697,
    'allExact':True,'changedPaths':[],'activeWrites':0,
    'protectedM7Baselines':{'Mathematik':'807/807','Physik':'478/478','Biologie':'397/397'},
    'chemistryActive':'231/402 M6 unchanged'})
ready=read(R/'checks/READY.actual-final-inputs.one-central.json');science=read(R/'checks/SELECTION.actual-conservative-P-and-A.json')
net={'schemaVersion':1,'recordedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'role':'Actual central strict-ID delta; scientific completion and context maintenance accounted separately',
    'baselineReport':prep['baseline338Report'],'currentReport':bind(report),'baselineStrict':338,'currentStrict':358,
    'denominator':422,'remaining':64,'newScientificStrictGoalIds':sorted(added),'old338RetainedGoalIds':sorted(old),
    'lostGoalIds':sorted(lost),'outsideAssigned31NewGoalIds':sorted(added-scope),
    'newStrictGoals':[{'goalId':i,'title':goals[i]['title'],'package':'carbonyl/pharmacy15' if i in carb else 'equilibrium/redox/kinetics16'} for i in sorted(added)],
    'scienceVersusBindings':{'newScientificStrictCompletions':20,'merelyRestoredBindingsCountedAsAdditionalNewCompletions':0,
        'genuineIndependentDResolved':22,'originalDDeferralsPreserved':9,'genuinePSelected':27,
        'genuinePDesignGapGoalIdsNotSelected':science['PExplicitlyNotSelectedGoalIds'],
        'genuineNewAReviews':31,'olderARowsReplacedAfterGenuineReview':5,'netAGateIncrease':26,
        'genuineM138Judgment':'One final-wording no_memory_needed judgment; original421 raw lines and75 cards exact, not another new M gate',
        'actualVNewAvailability':1,'newAvailableGoal':'f0f2c5f8-06f1-5774-a176-d96505727acf',
        'actualV138':'Genuine corrected-image review replaces old invalid GBS legend; P remains open',
        'QATechnicalNormalization':'All438 whole row objects exact; appended Pourbaix row sorted by unmodified stock generator',
        'integratorNewScientificVotes':0},
    'gatesBefore':baseline['gates'],'gatesAfter':current['gates'],'requiredChecks':current['requiredChecks'],'issues':current['issues'],
    'stillOpenAssigned31GoalIds':sorted(scope-new),'originalScienceSelections':bind(R/'checks/SELECTION.actual-conservative-P-and-A.json'),
    'holds':'All original source/course, practical-scope, split, missing-image and independent dissent holds remain. Unreviewed four material/four wording/two carbonyl author successors are not selected.',
    'activeIntegration':False,'HumanApproval':False,'humanOrLabTrial':False,'M7Grant':False,'strictCompletionReady':False}
netpath=R/'checks/ACTUAL.strict358-vs338.net20-and-science-context.json';put(netpath,net)
helper=(R/'scripts/rebuild_prepared_host.readonly.py').read_text().replace('checks/REBUILD.current422.prepared.physical-map.json','checks/REBUILD.current422.final.physical-map.json')
helperpath=R/'scripts/rebuild_final_host.readonly.py';helperpath.write_text(helper)
host=Path(mp['executionHost']);regular=[]
for base,dirs,files in os.walk(host,followlinks=False):
    dirs[:]=[d for d in dirs if not (Path(base)/d).is_symlink()]
    regular.extend(Path(base)/f for f in files if not (Path(base)/f).is_symlink())
size=sum(p.stat().st_size for p in regular);assert size<mp['maxCacheBytes']
(R/'README.actual-current358-inactive.md').write_text('''# Chemie: actual inactive358/422

Exactly one unchanged stock central run finished with exit0, six required checks PASS and no issues. All338 old strict IDs remain; exactly20 assigned IDs newly close:12 carbonyl/pharmacy and8 equilibrium/redox/kinetics. The denominator remains422;64 remain open. See the exact-ID delta and science-versus-bindings accounting in `checks/ACTUAL.strict358-vs338.net20-and-science-context.json`.

Two genuine independent original description rounds per package produce12+10 normal resolutions and retain all3+6 deferrals. The conservative P selection excludes the union of four real A/B material design gaps even though technical validators accept the E0/G0 records. Genuine A31 replaces five older A claims after actual review. Genuine final-wording M138 and actual corrected/new images are distinct from the20 new full completions. Whole422 memory and10 visibility views pass.

Initial native synthesis length and technical transport failures remain in their original roots. Here the initial QA freshness check exposed only the appended Pourbaix row order: the stock generator sorted it without changing any of438 whole row objects, and the targeted QA check then passed. No P/A/M rerun was needed for that ordering correction.

The physical source map and read-only rebuild script create a fresh ignored check-only host, without rendering or writing to earlier hosts. The execution cache is not an input. All697 protected active input bytes remain exact; Mathematics807/807, Physics478/478 and Biology397/397 stay protected M7. Active Chemistry remains231/402 M6. The unreviewed next author successors, source/course holds and human release/practice/trial gates are separate. No M7 or human approval is granted by this packet.
''')
selector={'schemaVersion':1,'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'role':'Finite actual inactive current358 integration; parent must preserve original science and holds',
    'inputs':ready['inputs'],'actualCentralReport':bind(report),'actualCentralCommand':bind(R/'checks/CENTRAL.exactly-one.command.actual.json'),
    'finalConfig':ready['finalCentralConfig'],'physicalRebuildMap':bind(R/'checks/REBUILD.current422.final.physical-map.json'),
    'readonlyRebuildScript':bind(helperpath),'exactNetAndScienceContext':bind(netpath),
    'protected697After':bind(R/'checks/PROTECTED697.actual-after-and-baselines.json'),
    'sourcePreparation':bind(R/'INPUTS.affected-preparation.selector.json'),'actualStrict':358,'denominator':422,
    'netNewScientificCompletions':20,'old338Retained':True,'lost':0,'fullCentralRuns':1,'requiredChecksPass':6,
    'gates':current['gates'],'issues':[],'hostRegularBytes':size,'newScientificVotes':0,'activeIntegration':False,
    'HumanApproval':False,'M7Grant':False,'strictCompletionReady':False}
sp=R/'INPUTS.final-current358-inactive-integration.selector.json';put(sp,selector)
files=[bind(p) for p in sorted(R.rglob('*')) if p.is_file() and not p.is_symlink() and p!=seal]
put(seal,{'schemaVersion':1,'role':selector['role'],'sealedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'files':files,'fileCount':len(files),'totalBytes':sum(f['bytes'] for f in files),'selector':bind(sp),
    'actualStrict':358,'newStrictScientificCompletions':20,'newScientificVotes':0,'activeIntegration':False,'M7Grant':False})
print(json.dumps({'selector':bind(sp),'seal':bind(seal),'files':len(files),'totalBytes':sum(f['bytes'] for f in files),'hostRegularBytes':size,'actualStrict':358,'newStrictScientificCompletions':20},indent=2))
