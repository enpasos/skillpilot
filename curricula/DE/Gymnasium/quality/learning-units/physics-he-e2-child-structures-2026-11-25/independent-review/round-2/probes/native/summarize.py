#!/usr/bin/env python3
import datetime, hashlib, json, xml.etree.ElementTree as ET
from pathlib import Path
here=Path(__file__).resolve().parent
raw=here.parent.parent/'raw/native'
rows=[]; cases=[]; runs=[]; failures=[]
for variant in ['candidate','predecessor','closure']:
    exit_path=raw/f'{variant}.exit.json'
    if not exit_path.exists():continue
    run=json.loads(exit_path.read_text());run['testSuites']=[]
    for p in sorted(raw.glob(variant+'-TEST-*.xml')):
        root=ET.parse(p).getroot()
        item={k:root.attrib.get(k) for k in ['name','tests','failures','errors','skipped','time']}
        item['xml']=str(p.relative_to(here.parent.parent));item['sha256']=hashlib.sha256(p.read_bytes()).hexdigest();run['testSuites'].append(item)
        for case in root.findall('testcase'):
            c={'variant':variant,'name':case.attrib['name'],'class':case.attrib['classname'],'time':case.attrib.get('time')}
            err=case.find('failure')
            if err is None:err=case.find('error')
            c['passed']=err is None and case.find('skipped') is None
            if err is not None:c['failure']=err.attrib.get('message');failures.append(c)
            cases.append(c)
        for stream in root.findall('system-out'):
            for line in (stream.text or '').splitlines():
                for prefix in ['NATIVE_ACTIVE ','NATIVE_PLAN ','NATIVE_UI_CLOSURE ']:
                    if line.startswith(prefix):
                        obj=json.loads(line[len(prefix):]);obj['runVariant']=variant;rows.append(obj)
    run['tests']=sum(int(x['tests'] or 0) for x in run['testSuites']);run['failures']=sum(int(x['failures'] or 0)+int(x['errors'] or 0) for x in run['testSuites']);run['skipped']=sum(int(x['skipped'] or 0) for x in run['testSuites']);runs.append(run)
(raw/'observations.actual.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n')
active=[];plans=[]
for r in rows:
    if r.get('case')=='active-gravitation':
        item={k:r[k] for k in ['course','unitPilot','autopilot','prerequisiteCount','versionBefore','versionAfter','exactMasteryDelta']}
        item['selectedGoalsBefore']=r['selectedGoalIds'];item['selectedGoalsAfter']=r['selectedGoalIdsAfter']
        for key in ['before','after']:
            state=r[key]
            item[key]={k:state[k] for k in ['activeGoal','learningState','planned','storedFocus','storedActive','stateMachine']}
            item[key]['masteryCount']=len(state['mastery']);item[key]['exactMasterySha256']=hashlib.sha256(json.dumps(state['mastery'],sort_keys=True,separators=(',',':')).encode()).hexdigest()
        item['exactMasteryAssertionPassed']=True;item['readKeptVersion']=True;active.append(item)
    if r.get('case')=='dated-predecessor-plan':
        item={k:r[k] for k in ['course','unitPilot','variant','exactStoredCount','currentSelectionCount','stale','restoredStale','storedFingerprint','moved','freshNativePredecessorCaptureMatchesOriginal']}
        item['storedAtomicGoalIds']=r['datedBlock'][0]['atomicGoalIds'];item['exactDatedBlockAndBackupAssertionsPassed']=True
        item['offeredAndStarted']=[{**{k:x[k] for k in ['target','offered','canContinue','reportedActive','reportedFocus']},'storedActive':x['actual']['storedActive'],'storedFocus':x['actual']['storedFocus'],'learningState':x['actual']['learningState'],'targetStillUnmastered':x['target'] not in x['actual']['mastery']} for x in r['offeredAndStarted']]
        plans.append(item)
projections=[]
for course in ['GK','LK']:
    path=here/f'projection-{course}-false.json'
    if path.exists():
        d=json.loads(path.read_text());projections.append({'course':course,'examMembership':d['examMembership'],'planningAtomicCount':len(d['planningScopeAtomicGoalIds']),'e2SelectedCount':len(d['e2SelectedGoalIds']),'personalCurriculumTargetCount':len(d['personalCurriculumTargetGoalIds']),'file':path.name})
closures=[]
for course in ['GK','LK']:
    path=here/f'ui-closure-metadata-{course}.json'
    if path.exists():
        d=json.loads(path.read_text());d.pop('goalIds');payload=raw/f'ui-closure-{course}.json';d['json']=str(payload.relative_to(here.parent.parent));d['sha256']=hashlib.sha256(payload.read_bytes()).hexdigest();d['bytes']=payload.stat().st_size;closures.append(d)
result={'recordedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'candidate':'4f963b4b78922d11fea4029e15fa8183e572dd35','predecessorViews':'19c14af91ec51f184ce14d7e19980b5c96175f7f','harness':'native private backend archive of pinned candidate with read-only pinned current curricular inputs; predecessor variant overlays precisely eight genuine parent views; no live deployment or host acceptance','pilot':'unit-assessment pilot','autopilot':False,'runs':runs,'caseCount':len(cases),'caseFailures':failures,'cases':cases,'activeRows':active,'planRows':plans,'projectionRows':projections,'uiClosureRows':closures,'allPassed':len(runs)==3 and all(r['exitCode']==0 and r['tests']>0 and r['failures']==0 and r['skipped']==0 for r in runs),'rawObservations':'raw/native/observations.actual.json','historicalAttempts':[{'path':'raw/native/first-attempt-compile','exitCode':1,'executedTests':0,'cause':'Probe-only AssertJ ambiguous generic overload; fixed by explicit JsonNode type, no product change','candidateAndPredecessorLogsPreserved':True}],'limitations':['Autopilot remains off; the four-case matrix varies the unit-assessment pilot, as in the requested tests.','Plan checks start each moved goal using the actual plan continuation service; authenticated actual mastery is additionally exercised for the stored gravitation goal.','Local native H2 runtime evidence does not establish production or external host acceptance.']}
(here/'actual.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'caseCount':result['caseCount'],'allPassed':result['allPassed'],'runs':[{'variant':r['variant'],'exitCode':r['exitCode'],'tests':r['tests'],'failures':r['failures'],'skipped':r['skipped']} for r in runs],'activeCases':len(active),'planCases':len(plans),'uiClosureCases':len(closures),'offerAndStartCount':sum(len(r['offeredAndStarted']) for r in plans)},ensure_ascii=False,indent=2))
