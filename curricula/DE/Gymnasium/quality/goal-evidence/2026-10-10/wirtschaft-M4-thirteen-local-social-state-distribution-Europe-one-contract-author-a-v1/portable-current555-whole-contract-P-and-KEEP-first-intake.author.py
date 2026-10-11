from pathlib import Path
import json,hashlib,collections
R=Path('/home/enpasos/projects/skillpilot');O=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-thirteen-local-social-state-distribution-Europe-one-contract-author-a-v1';O.mkdir(exist_ok=True)
def bind(p):return {'path':str(p.relative_to(R)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def write(n,a):
 p=O/n;assert not p.exists();p.write_text(json.dumps(a,ensure_ascii=False,indent=2)+'\n');return bind(p)
CAN=R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json';C=json.loads(CAN.read_text());G={g['id']:g for g in C['goals']};assert len(G)==555
REG=R/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';subject=next(s for s in json.loads(REG.read_text())['subjects'] if s['subject']=='wirtschaftswissenschaften')
N=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-current555-macro-market-legacy-work-combined-scope-independent-merge-audit-v1/five-existing9f-only-access-independent-followup-v2/after-five-refs-current555-482-independent.actual-native.json';A=json.loads(N.read_text());assert hashlib.sha256(N.read_bytes()).hexdigest()=='ee6ec3bec024d8504cc18a942f58794b1ae3f5adf0a4202977a0cf02a2ad9f45'
PREFIX=['577f0e2d','d17ff931','1da809f7','c7b03538','9832485e','c7341b02','da73483a','7c9efc27','9ea7d847','79edbe3a','8c4d53d1','ab556d14','96c2c114'];ids=[next(gid for gid in G if gid.startswith(p)) for p in PREFIX];profiles={};configbind=[];cache={}
for p in subject['positiveEvidenceConfigPaths']:
 cp=R/p;c=json.loads(cp.read_text()); relevant=set(c.get('scope',{}).get('goalIds',[]))&set(ids)
 if not relevant:continue
 rp=R/c['reviewPath']; records=cache.setdefault(rp,[json.loads(l) for l in rp.read_text().splitlines() if l.strip()]); configbind.append({'config':bind(cp),'wholeReviewFile':bind(rp),'goals':sorted(relevant)})
 for gid in relevant:
  assert gid not in profiles
  profiles[gid]={'record':next(x for x in records if x['goalId']==gid),'originalReviewBinding':bind(rp)}
assert set(profiles)==set(ids)
compiled={g['goalId']:g for g in A['compilerGoals']};materialnative={m['id']:m for m in A['materials']};rows=[]
for gid in ids:
 g=G[gid];rec=profiles[gid]['record'];assert rec['status']=='needs_human_review' and rec['reviewAuthority']=='ai_candidate';existing=[m for m in G.values() if 'examData'in m and gid in m['examData'].get('coveredGoalIds',[])]
 gap=[s for s in A['allScopeRows'] if gid in s['missingEffectiveTerminalTargetIds']];assert gap
 matrix=[]
 for s in gap:
  vis=set(s['visibleAllAtomicIds']);key=s['viewPath']+'|'+s['jurisdiction']+'|'+json.dumps(s['scopeFilters'],separators=(',',':'))
  mr=[]
  for m in existing:
   nm=materialnative.get(m['id']);assert nm
   closure=nm['wholeMaterialPrerequisites'];missing=sorted(set(closure)-vis);eligible=s['jurisdiction'] in nm['actualCompiled'].get('compiledApplicability',{}).get('jurisdiction',[])
   course=not(s['scopeFilters']==['GK'] and 'GK'not in m.get('tags',[]) and 'LK'in m.get('tags',[]))
   mr.append({'materialId':m['id'],'releasedStatusIsNotFreshWholeScienceApproval':m['examData'].get('reviewStatus'),'actualWholeNativePrerequisiteClosure':closure,'missingWholePrerequisiteIdsInActualProjection':missing,'actualCompiledCountryEligible':eligible,'actualCourseTags':m.get('tags',[]),'actualCourseEligible':course,'actuallyInTerminalTargetProjection':m['id'] in s['actualTerminalIds'],'actuallyInVisibleAllAtomicProjection':m['id'] in vis,'nativeWholeMaterialBindingIssues':[x for x in s['wholeMaterialCoverageBindingIssues'] if m['id'] in json.dumps(x)],'nativeWholeMaterialClosureIssues':[x for x in s['wholeMaterialPrerequisiteClosureIssues'] if m['id'] in json.dumps(x)],'candidateAction':'Existing exact qualified body KEEP; consider access-only only if full closure/country/course actually eligible. Otherwise a distinct smaller complete-contract material is justified; no support/source widening assumed.'})
  matrix.append({'actualViewPath':s['viewPath'],'actualJurisdiction':s['jurisdiction'],'actualCourseFilters':s['scopeFilters'],'actualScopeKey':key,'currentOrdinaryGoalIsTarget':gid in s['ordinaryTargetIds'],'nativeCurrentLocalTerminalRouteMissing':True,'existingWholeMaterialCandidates':mr})
 rows.append({'goalId':gid,'wholeCurrentGoal':g,'wholeOriginalPositiveProfileRecord':rec,'originalReviewBinding':profiles[gid]['originalReviewBinding'],'wholeCompiledSourceApplicabilityContext':compiled[gid],'actualMissingLocalScopeCount':len(gap),'currentExistingWholeMaterialsUnchanged':[{'wholeMaterial':m,'wholeNativeMaterialBindings':materialnative[m['id']],'notReReviewedScientificKEEP':True} for m in existing],'actualProjectionGapAndOriginalWholeClosureMatrix':matrix,'newMaterialOnlyPendingWholeCaseReading':True})
for k,row in enumerate(rows):
 p=Path(f'/tmp/economics-social-Europe-independent-author-a-whole-{k+1}.txt');p.write_text(json.dumps({'wholeCurrentGoal':row['wholeCurrentGoal'],'wholeOriginalPositiveProfileRecord':row['wholeOriginalPositiveProfileRecord'],'wholeCompiledSourceApplicabilityContext':row['wholeCompiledSourceApplicabilityContext'],'existingMaterialSummary':[{'id':x['wholeMaterial']['id'],'title':x['wholeMaterial']['title'],'tags':x['wholeMaterial']['tags'],'covered':x['wholeMaterial']['examData']['coveredGoalIds'],'wholeNativePrerequisiteClosure':x['wholeNativeMaterialBindings']['wholeMaterialPrerequisites']} for x in row['currentExistingWholeMaterialsUnchanged']]},ensure_ascii=False,indent=2)+'\n')
intake=write('whole-current555-thirteen-DEEN-social-Europe-contracts-original-P26-and-existing-KEEP-closure-gap-matrix.author-intake.json',{'role':'AUTHOR exact current555 thirteen selected ordinary contracts; original actual native missing-route and whole existing material context','wholeCurrentCanonicalInput':bind(CAN),'wholeCurrentRegistryInput':bind(REG),'wholeCurrentSemanticLedger':bind(R/subject['semanticKindLedgerPath']),'wholeNativeBeforeSourceAnd64ScopeInput':bind(N),'relevantOriginalPositiveConfigurationsAndWholeReviewFiles':configbind,'actualCurrentCanonicalGoals':555,'actualCurrentNativeBaselineMissingRouteOccurrences':sum(len(s['missingEffectiveTerminalTargetIds']) for s in A['allScopeRows']),'actualCurrentNativeBaselineMissingDistinctIds':len(set(t for s in A['allScopeRows'] for t in s['missingEffectiveTerminalTargetIds'])),'actualSelectedGoals':13,'actualSelectedRouteGapOccurrences':sum(r['actualMissingLocalScopeCount'] for r in rows),'rows':rows,'notHistoricalScientificReviewRestart':True,'notWholeSourceOrGKCourseApproval':True,'notAuthorScientificSelfApproval':True,'activeWrites':0,'reviewedCompletePCasesClaimPendingActualReading':True})
print(json.dumps({'intake':intake,'selection':[{'goalId':r['goalId'],'title':r['wholeCurrentGoal']['title'],'actualGapScopeCount':r['actualMissingLocalScopeCount'],'existingMaterialCount':len(r['currentExistingWholeMaterialsUnchanged'])} for r in rows]},ensure_ascii=False,indent=2))
