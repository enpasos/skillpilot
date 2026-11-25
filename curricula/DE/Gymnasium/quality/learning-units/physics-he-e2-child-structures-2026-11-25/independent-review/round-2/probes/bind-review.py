"""Bind the original reports, full evidence, exact Git objects and scope of this confirmation."""
import hashlib
import json
import re
import subprocess
from datetime import datetime
from pathlib import Path
from xml.etree.ElementTree import parse

p=Path(__file__).resolve().parents[1]
manifest=p/'independent-review.actual.json'
def read(f):return json.loads(f.read_bytes())
def sha(d):return hashlib.sha256(d).hexdigest()
def artifact(f):return {'path':str(f.relative_to(p)),'bytes':f.stat().st_size,'sha256':sha(f.read_bytes())}
def git(*args):return subprocess.check_output(['git',*args])
v=read(p/'placements.actual.json')
native=read(p/'probes/native/actual.json')
coach=read(p/'plan-and-coach.actual.json')
ui=read(p/'learner-rows.actual.json')['results']
assert [(r['course'],len(r['mapIds']),len(r['cockpitIds'])) for r in ui]==[('GK',10,10),('LK',8,8)]
for row in ui:
    assert set(row['mapIds'])==set(row['cockpitIds'])
    assert row['closureSha256']==sha((p/('raw/native/ui-closure-'+row['course']+'.json')).read_bytes())
for row in coach['plans']:
    assert all(x['target']==x['offered']==x['storedActive'] and x['canContinue'] and x['targetStillUnmastered'] for x in row['offeredAndStarted'])
starts={s:sum(len(r['offeredAndStarted']) for r in coach['plans'] if r['variant']==s) for s in ('predecessor','candidate')}
assert starts=={'predecessor':18,'candidate':18}
assert {(r['course'],r['pilot']) for r in coach['active']}=={(c,b) for c in ['GK','LK'] for b in [False,True]}
assert all(r['exactMasteryDelta']=={'eb0ffdea-c12d-56df-b7e8-c0297d2f8aff':1.0} and r['afterGoal'] is None for r in coach['active'])
suites=[]
for f in sorted((p/'raw').rglob('*.xml')):
    s=parse(f).getroot()
    counts={k:int(s.get(k)) for k in ('tests','errors','failures','skipped')}
    assert not any(counts[k] for k in ('failures','errors','skipped'))
    suites.append({'suite':s.get('name'),'xml':str(f.relative_to(p)),**counts})
assert sum(s['tests'] for s in suites)==23 and native['caseCount']==20
assert git('rev-parse',v['head']+'~2').decode().strip()==v['stackBase']
assert v['exactTupleMatches']==30 and v['distinctGoals']==9 and v['allRound1ToRound2ViewBlobsEqual']
assert len({r['resolvedRole'] for r in read(p/'energy-role.actual.json')})==1
reviewers=[('A','/root/d2_record','gpt-6.1-sol ultra','confirms corrections with qualifications'),('B','/root/d2_plans','inherited session model','confirms implementation; two README corrections')]
result={
    'schemaVersion':1,'reviewedAt':datetime.now().astimezone().isoformat(timespec='seconds'),
    'branch':'feat/e2-zuschnitt','reviewedCommit':v['head'],'reviewedTree':v['tree'],'firstRoundCommit':v['round1'],'firstRoundParent':v['round1Parent'],'stackBase':v['stackBase'],'intermediate':v['intermediate'],
    'patchSha256':sha(git('diff',v['stackBase'],v['head'])),'priorEvidence':v['priorManifest'],
    'disposition':'confirm-curriculum-and-runtime-request-two-readme-corrections',
    'questions':{
      'a':{'verdict':'confirm','exactMoves':30,'distinctGoals':9,'mathMoves':24,'physicsMoves':6,'allNinetyViewsEqualToFirstRound':True,'viewsChangedFromStackBase':8},
      'b':{'verdict':'confirm','goal':'eb0ffdea-c12d-56df-b7e8-c0297d2f8aff','courses':['GK','LK'],'unitPilot':[False,True],'autopilot':False,'nativeCoachPasses':4,'chosenFocus':'E.2'},
      'c':{'verdict':'confirm','datedPlanBlock':'2026-11-23','oldGoals':{'GK':32,'LK':32},'newSelection':{'GK':28,'LK':27},'includes':'9c328f68-41ed-55dd-9e02-34414a6246f2','oldBlockAndFingerprintReplayed':True,'restoredCurrent':True,'individualStarts':starts},
      'd':{'verdict':'correct-readme','items':[{'readmeLine':71,'finding':'Personal GK shows 10 entries, personal LK 8, in both board and cockpit.'},{'readmeLine':59,'finding':'E.5 alone in the E phase is correct. The second and third Kepler laws also require five of the six Mathematics preparations.'}]}},
    'pr199Comment':{'originalFixture':'FRONTIER with ordinary cursor','amendedFixture':'TEACHING with same ordinary cursor','observed':'Both return TEACHING and retain the cursor and chosen focus; stored state label is preserved. Original test exercised cleanup on a read.','evidence':'projection.actual.json'},
    'reviewers':[{'id':i,'driver':'collaboration.spawn_agent','agent':n,'modelSelection':m,'context':'fresh independent review, fork_turns=none','assessment':a,'answer':artifact(p/('reviewer-'+i.lower()+'.md'))} for i,n,m,a in reviewers],
    'validation':{'tests':23,'errors':0,'failures':0,'skips':0,'junit':suites,'uiReplay':'learner-rows.actual.json',
     'fullFrontendOnThisHead':False,'priorFrontendSteps':54,'oldFrontendRunCommit':v['round1'],'changedAppPathsFromFirstRound':len(v['changedAppFilesRound1ToRound2']),
     'firstAttempt':'Independent AssertJ probe failed to compile before test execution; first-attempt logs retained. Corrected probe passed.'},
    'writeScope':'local review evidence and handover status; original answers preserved, existing checkout restored; no commits, pushes or product edits',
    'reviewReport':'review.md','artifacts':[artifact(f) for f in sorted(p.rglob('*')) if f.is_file() and f!=manifest]}
manifest.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
assert all(artifact(p/a['path'])==a for a in read(manifest)['artifacts'])
for link in re.findall(r'\]\(([^)]+)\)',(p/'review.md').read_text()):
    assert link.startswith('http') or (p/link).exists(),link
print(len(result['artifacts']),'bound artifacts, SHA256',sha(manifest.read_bytes()))
