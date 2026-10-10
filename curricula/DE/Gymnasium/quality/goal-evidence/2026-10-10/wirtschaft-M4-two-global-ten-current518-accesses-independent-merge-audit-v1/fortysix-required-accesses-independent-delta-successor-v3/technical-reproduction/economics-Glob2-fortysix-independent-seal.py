from pathlib import Path
import json,hashlib,jsonschema,importlib.util,shutil
R=Path('/home/enpasos/projects/skillpilot');B=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-two-global-ten-current518-accesses-independent-merge-audit-v1/private-config-isolation-and-current520-native-successor-v2';O=B.parent/'fortysix-required-accesses-independent-delta-successor-v3';A=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-thirteen-globalisation-development-whole-material-author-a-v1/same-two-whole-materials-fortysix-remaining-valid-accesses-author-successor-v9';read=lambda p:json.loads(p.read_text())
def fp(p):return {'path':str(p.relative_to(R)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def wr(n,x):p=O/n;assert not p.exists();p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return p
z=read(O/'actual-fortysix-exact-view-field-appends-and-unmodified-current520-inputs.independent.json');ix=read(A/'actual-fortysix-rest-full56-whole-country-course-accesses.AUTHOR-index-v9.json');b=read(O/'independent-before-current520-ten-accesses.reused-exact-native.json');a=read(O/'independent-after-current520-complete56-accesses.actual-native.json');n=read(O/'independent-negative-HBGK-required-endpoint-only-drop.actual-native.json');can=read(O/'whole-exact-current520-unchanged-v8.json');goals={g['id']:g for g in can['goals']};newids={'a9bb3071-ec32-55a5-95ca-3935a2316335','af9a83c4-ff3e-59e2-bafa-5f9f237ec893'};individual=[];additional=[]
assert len(b['allScopeRows'])==len(a['allScopeRows'])==len(n['allScopeRows'])==64
for u,v in zip(b['allScopeRows'],a['allScopeRows']):
 assert all(u[k]==v[k]for k in ['viewPath','jurisdiction','scopeFilters','ordinaryTargetIds'])
 for f in ['visibleAllAtomicIds','visibleTargetAtomicIds']:
  assert set(u[f])-newids==set(v[f])-newids
  assert set(u[f])<=set(v[f])
  assert set(v[f])-set(u[f])<=newids
 assert not v['wholeMaterialCoverageBindingIssues'] and not v['wholeMaterialPrerequisiteClosureIssues']
 assert not ((set(v['expectedTerminalIds'])-set(v['actualTerminalIds']))&newids)
 for k in set(v['actualTerminalIds'])&newids:
  g=goals[k];m=next(r for r in a['materials']if r['id']==k);assert not m['unresolvedReferences'];assert set(m['wholeMaterialPrerequisites'])<=set(v['visibleAllAtomicIds']);assert set(g['examData']['coveredGoalIds'])<=set(v['visibleAllAtomicIds']);assert all(c in g['tags']for c in v['scopeFilters']if c in ['GK','LK']);assert v['jurisdiction']in m['actualCompiled']['compiledApplicability']['jurisdiction']
  item={'viewPath':v['viewPath'],'jurisdiction':v['jurisdiction'],'scopeFilters':v['scopeFilters'],'materialId':k,'wholeAssessedGoals':g['examData']['coveredGoalIds'],'completeMandatoryAtomicClosure':m['wholeMaterialPrerequisites'],'decision':'KEEP_EXISTING_WHOLE_QUALIFIED_MATERIAL_ACCESS_ONLY','actualExpectedTerminalRequiredByUnchangedPolicy':k in v['expectedTerminalIds'],'rationale':'All complete material assumptions, four whole current contracts and their entire actual mandatory closure are available in the existing course/jurisdiction target/support projection. Additional practice access does not expand an ordinary curriculum target or claim source coverage.'}
  individual.append(item)
  if k not in u['actualTerminalIds']:additional.append(item)
assert len(individual)==112 and len(additional)==92
r=lambda d:next(q for q in d['nativeRules']if q['id']=='CQR-104');m=lambda d:r(d)['metrics'];assert b['sourceRule']==a['sourceRule']==n['sourceRule'];assert b['compilerGoals']==a['compilerGoals']==n['compilerGoals'];assert b['compilerSummary']==a['compilerSummary']==n['compilerSummary']
for d in [b,a,n]:assert d['compilerSummary']['errors']==d['compilerSummary']['warnings']==0 and m(d)['visibleSelectedAtomicGoalOccurrences']==6974 and m(d)['visibleSelectedGoalOccurrencesMissingEffectiveTerminalRoute']==1998 and m(d)['uniqueVisibleSelectedGoalsMissingEffectiveTerminalRoute']==171
assert m(b)['projectionScopesMissingTerminalAutonomyGoals']==32 and m(a)['projectionScopesMissingTerminalAutonomyGoals']==16 and m(n)['projectionScopesMissingTerminalAutonomyGoals']==17
for k in ['projectionScopesWithInvalidStageStructure','projectionScopesWithIncompleteWholeMaterialCoverageBindings','projectionScopesWithIncompleteWholeMaterialPrerequisiteClosure']:assert m(a)[k]==0
oldmissing=lambda d:{(v['viewPath'],v['jurisdiction'],tuple(v['scopeFilters']),i)for v in d['allScopeRows']for i in set(v['expectedTerminalIds'])-set(v['actualTerminalIds'])if i not in newids};assert oldmissing(b)==oldmissing(a);assert len(oldmissing(a))==53
checks=[]
for p in [R/r['after56']['path']for r in z['whole35ViewPairs']if r['addedReferences']]:
 s=R/'contracts/curriculum-package/v1/composition-view.schema.json';e=list(jsonschema.Draft202012Validator(read(s)).iter_errors(read(p)));assert not e,[str(v)for v in e];checks.append({'view':fp(p),'closedSchema':fp(s),'closedErrors':0})
assert len(checks)==30
proof=wr('actual-independent112-whole-material-contexts92-additional-bindings-and-preserved53-old-expectation-debts.json',{'all112ActualWholeContextJudgments':individual,'actual92NewNativeScopeContextJudgments':additional,'46AuthoredAdditionalPhysicalReferencesThirtyViews':True,'closedThirtyViews':checks,'all64Ordinary6974SupportPOnlyMemorySetsExact':True,'wholeCompiler520RowsSource16Atoms2134Exact':True,'expectedScopesBefore32After16Negative17':True,'genuineOwnHBGKExpectedEndpointDropOnly':r(n),'ordinaryLocalRoutes1998Unique171UnchangedAcrossThisDelta':True,'old53MaterialScopeExpectationPairsExact':sorted([list(v[:2])+[list(v[2]),v[3]]for v in oldmissing(a)]),'wholeM4OverallStillFail':r(a)['status']=='fail','bodyScienceNoRestart':True,'noNewSourceOrOrdinaryClaims':True})
for p in [Path('/tmp/economics-Glob2-fortysix-independent-delta-review.py'),Path('/tmp/economics-Glob2-fortysix-independent-seal.py')]:shutil.copyfile(p,O/'technical-reproduction'/p.name)
# End guards protect all committable original V8/V9 inputs and unchanged live basis.
guards=[]
for row in ix['whole35RemainingAccessCandidates']:
 for key in ['wholeBeforeV8Candidate','wholeAfter56Candidate']:
  p=R/row[key]['path'];assert fp(p)['sha256']==row[key]['sha256'];guards.append(fp(p))
for ref in [ix['wholeCAN520Unmodified'],ix['wholeTwoForeignQualifiedBodies'],ix['wholeBasisV8Index']]:p=R/ref['path'];assert fp(p)['sha256']==ref['sha256'];guards.append(fp(p))
assert fp(R/'app/scripts/config/goal-books/de-gym-economics-current-canonical.json')['sha256']=='a48a7a9998902e988ff7c420bd305a2bc89860d9244bea4181da0cbb92c4be27'
assert fp(R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json')['sha256']=='aea52b23ce1bd5d510fa0d6c256fc7fa4c5e3bddca5736bb54c5c505a6a7e309'
wr('actual-original-V8-V9-seventy-three-input-endguards.exact.json',{'all73WholeFileInputsExact':guards,'preservedScienceSourcePAndActive518CANBook':True,'activeWritesInThisDelta':0})
s=importlib.util.spec_from_file_location('validator',R/'scripts/validate_schemas.py');v=importlib.util.module_from_spec(s);s.loader.exec_module(v);assert not v.curriculum_symlink_errors(str(R));files=[]
for p in sorted(O.rglob('*')):
 if p.is_file():
  assert not p.is_symlink()
  if p.suffix=='.json':assert p.read_bytes().endswith(b'\n');json.loads(p.read_text())
  files.append(fp(p))
manifest=wr('actual-independent-Glob2-fortysix-required-accesses-native64-closed30-whole-input.manifest.json',{'files':files,'curriculumSymlinkErrors':0,'JSONWholeParseLF':True,'activeWrites':0,'historicalV8ReviewUnchanged':fp(B/'actual-final-independent-two-global-status-nav-ten-accesses-KEEP-and46-real-expected-access-debts.handoff.receipt.json')})
receipt=wr('actual-final-independent-two-global-complete56-accesses-fortysix-required-view-delta-KEEP.handoff.receipt.json',{'reviewer':'/root/economics_merge_audit independent of /root/economics_m2_source_independent_a author','decision':'BOUNDED_FORTYSIX_ADDITIONAL_EXPECTED_MATERIAL_REFERENCES_THIRTY_VIEWS_KEEP','authorV9':fp(A/'actual-final-fortysix-remaining-two-material-accesses-complete56-current520.author-handoff-v9.json'),'manifest':fp(manifest),'wholeIndividualScopeProof':fp(proof),'beforeOwnNativeReusedByteExact':fp(O/'independent-before-current520-ten-accesses.reused-exact-native.json'),'actualNativeSummary':'Same520 CAN/two qualified bodies/Nav/Source/P exact; 46 additional references in30 views (56 total), 92 additional compiled scope contexts (112 total) all full current course and whole mandatory closure. All64 ordinary6974/support/POnly/Memory sets exact. Compiler5200/0/1457 and Source16/2134 unsupported0/reverse0 exact. Closed30 schemas0. Expected endpoint missing scopes32->16; genuine own HB-GK drop->17. Ordinary route gaps1998/171 unchanged, because valid larger endpoint already present.','originalV8BodyStatusNavTenRefsReviewReused':fp(B/'actual-final-independent-two-global-status-nav-ten-accesses-KEEP-and46-real-expected-access-debts.handoff.receipt.json'),'wholeScience5affOnlyReused':ix['basisV8']['basis518']['wholeForeignScience'],'noCheckerPolicyOrOrdinarySourceChanges':True,'remainingOtherExpectedScopeDebts16And171UniqueGoalsOpen':True,'wholeM4M6Approval':False,'humanApproval':False,'strictNetGain':0,'activeWrites':0})
print(json.dumps({'receipt':fp(receipt),'manifest':fp(manifest),'proof':fp(proof)},ensure_ascii=False))
