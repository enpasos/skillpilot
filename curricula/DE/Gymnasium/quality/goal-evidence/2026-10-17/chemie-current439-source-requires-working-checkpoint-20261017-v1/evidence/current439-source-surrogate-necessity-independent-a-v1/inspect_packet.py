import json,pathlib,sys
B=pathlib.Path('/mnt/e/skillpilot-chemie-L7-20261017/current439-requires-closure-source-surrogate-neutral-preparation-technical-v1/science')
groups=json.load(open(B/'REVIEW-GROUPS.common-prerequisite-dependent-scientific-necessity.pending.json'))['groups']
contexts={x['goalId']:x for x in json.load(open(B/'CONTEXT.whole-all-involved-prerequisites-direct-dependents-P-and-source-evidence.json'))['goals']}
anchors={x['anchorId']:x for x in json.load(open(B/'SOURCE-ANCHORS.current-active-mapping-partners.no-review-decisions.json'))['anchors']}
cells={x['cellId']:x for x in json.load(open(B/'SOURCE-CELLS.whole-current-source-goals-passages-original-locators.no-verdicts.json'))['sourceCells']}
seen=set()
for g0 in groups[:int(sys.argv[1])-1]:
 seen.update([g0['prerequisiteGoalId'],g0['directDependentGoalId']])
for ix in range(int(sys.argv[1])-1,int(sys.argv[2])):
 g=groups[ix]; print('\nGROUP',ix+1,g['reviewGroupId'])
 for label,key in [('PRE','prerequisiteGoalId'),('DEP','directDependentGoalId')]:
  c=contexts[g[key]]; goal=c['wholeCurrentGoal']; p=c['wholeCurrentProfile']; print(label,goal['id'],goal['title'],'DESCRIPTION',goal['description'])
  if goal['id'] in seen: print('PROFILE ABOVE'); continue
  seen.add(goal['id']); print('COVERAGE',p.get('coverageExpectations'))
  for e in p.get('expectations',[]):print('E',e.get('id'),e.get('essentialUnderstandingDe'),e.get('observablePerformanceDe'))
  for t in p.get('applicationCaseBriefs',[]):print('CASE',t['id'],t.get('taskDemandDe'))
  # variation demand is bound in original profile
 for d in g['jurisdictionDockets']:
  a=anchors[d['endpointAnchorId']]; c=cells[a['sourceCellId']]; s=c['wholeCurrentSourceGoal']; print('SOURCE',d['jurisdiction'],d['endpointAnchorId'],s.get('sourceText') or s.get('rawSourceText') or s.get('description'),'REF',s.get('sourceRef'),'LEVEL',s.get('courseLevel'),'FLAGS',d['knownOpenSourceFlags'],'COURSES',[(x['scope'].get('courseProfile'),x['allPathGoalsPassActualStockCourseFilter']) for x in d['actualCurrentTargetCourseScopeContexts']],'MISMATCH',d['prerequisiteTargetCoursesWithoutSameCourseWholePath'],'BCP',d['chainIncludesSeparateBcPProgram'],'NOTTARGET',d['endpointNotATargetInAnyCurrentStateScope'])
