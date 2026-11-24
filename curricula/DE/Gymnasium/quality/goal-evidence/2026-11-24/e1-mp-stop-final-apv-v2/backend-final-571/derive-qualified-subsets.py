# SPDX-License-Identifier: Apache-2.0
"""Bind native JUnit case ordinals to their matching native Gradle test method log events."""
from pathlib import Path
import re,sys,json,hashlib,xml.etree.ElementTree as E
from collections import defaultdict
rawdir=Path(sys.argv[1]);log=Path(sys.argv[2]);inventory=json.loads(Path(sys.argv[3]).read_text());sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest();events=defaultdict(list)
for line_number,line in enumerate(log.read_text().splitlines(),1):
 m=re.match(r'^(\w+) > (.+) (PASSED|FAILED|SKIPPED)$',line)
 if not m:continue
 simple,body,status=m.groups();parts=body.split(' > ');method=parts[0].split('(')[0];display=parts[-1];events[simple].append({'methodName':method,'displayName':display,'status':{'PASSED':'passed','FAILED':'failed','SKIPPED':'skipped'}[status],'nativeLogLine':line_number})
rows=[]
for xml in sorted(rawdir.glob('TEST-*.xml')):
 cases=[];suite=None
 for event,e in E.iterparse(xml,events=('start','end')):
  if event=='start' and suite is None and e.tag=='testsuite':suite=dict(e.attrib)
  if event=='end' and e.tag=='testcase':cases.append({'name':e.get('name'),'status':'failed' if e.find('failure') is not None else 'error' if e.find('error') is not None else 'skipped' if e.find('skipped') is not None else 'passed'});e.clear()
  elif event=='end' and e.tag in ['system-out','system-err','properties']:e.clear()
 assert suite is not None
 xmlsha=sha(xml);matched=events[suite['name'].split('.')[-1]];assert len(cases)==len(matched),(suite['name'],len(cases),len(matched))
 for n,(case,actual) in enumerate(zip(cases,matched)):
  assert case['name']==actual['displayName'] and case['status']==actual['status'],(suite['name'],n,case,actual)
  rows.append({'className':suite['name'],'nativeXmlCaseOrdinal':n,'nativeCaseName':case['name'],'methodName':actual['methodName'],'methodSelector':suite['name']+'.'+actual['methodName'],'status':case['status'],'nativeRawXmlPath':str(xml),'nativeRawXmlSha256':xmlsha,'nativeLogLine':actual['nativeLogLine']})
def matches(row,selector):return row['className']==selector or row['methodSelector']==selector
def group(selectors):
 result=[r for r in rows if any(matches(r,s) for s in selectors)];return {'selectors':selectors,'actualCases':len(result),'passed':sum(r['status']=='passed' for r in result),'failed':sum(r['status']=='failed' for r in result),'errors':sum(r['status']=='error' for r in result),'skipped':sum(r['status']=='skipped' for r in result),'cases':result}
mandatory=group([r['selector'] for r in inventory['mandatory24']]);assert mandatory['actualCases']==24
seed=group([inventory['additionalSeedSelector']]);assert seed['actualCases']==1
identity=group([inventory['additionalSuccessorIdentitySelector']]);assert identity['actualCases']==2
voluntary=group(inventory['additionalVoluntarySelectors'])
directClass='com.skillpilot.backend.service.UnitIntroductionForeignFocusReviewTest';direct=group([directClass+'.deliberatePhysicsStartAndConfirmedOpeningResumeTheSelectedGoalFromAnUnrelatedFocus',directClass+'.directNestedChildConfirmationResumesItsSelectedGoalWithoutReceivingTheParent']);assert direct['actualCases']==3
parent=group([directClass+'.guidedParentDescentStillConfirmsParentThenChildBeforeResumingTheSelectedGoal']);assert parent['actualCases']==1
memoryClass='com.skillpilot.backend.service.LearnerServiceTest';memory=group([memoryClass+'.'+m for m in ['unitPracticeUsesOnlyTheSevenMotionCardsAndKeepsTheActiveGoalAndMastery','unitCardsComeFromTheHierarchyWithoutFlashcardGoalAndWithAMasteredActiveGoal','theCardStepIsAnchoredAtTheJustCompletedGoalAndPracticeAcceptsExactlyThatContext','theCockpitReceivesLockedCardsAndItsSyncCannotCreateStateForThem']]);assert memory['actualCases']==4
print(json.dumps({'schemaVersion':1,'contract':'native-qualified-JUnit-method-log-bound-final-subsets-v1','nativeRawLogPath':str(log),'nativeRawLogSha256':sha(log),'methodMatching':'Per-class XML case order, exact displayed native case name and status all matched the real Gradle execution events; each subset case binds XML ordinal/rawSHA and native log line. No inferred passing status.','completeActualCaseCount':len(rows),'mandatory24':mandatory,'seed':seed,'historicalCanonicalAndLegacyMPIdentity':identity,'otherVoluntaryAssessmentGuards':voluntary,'threeDirectEntryCases':direct,'guidedParentDescentNeighbor':parent,'fourCurrentCardOriginFixtureGuards':memory,'allFailedCases':[r for r in rows if r['status'] in ['failed','error']]},ensure_ascii=False,indent=2))
