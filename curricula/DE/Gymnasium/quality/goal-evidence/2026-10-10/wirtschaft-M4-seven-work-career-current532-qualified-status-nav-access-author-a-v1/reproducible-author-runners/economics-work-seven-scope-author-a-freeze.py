from pathlib import Path
import json,copy,hashlib,tempfile,shutil,os
R=Path('/home/enpasos/projects/skillpilot').resolve();D='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-seven-work-career-current532-qualified-status-nav-access-author-a-v1';O=R/D;O.mkdir(exist_ok=True);assert O.resolve()==O
def b(p):q=p.read_bytes();return {'path':str(p.relative_to(R)) if p.is_relative_to(R) else str(p),'sha256':hashlib.sha256(q).hexdigest(),'bytes':len(q)}
def put(n,x):
 p=O/n;assert not p.exists();p.parent.mkdir(parents=True,exist_ok=True);assert p.resolve().is_relative_to(O);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return b(p)
canp=R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json';regp=R/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';codep=R/'app/scripts/generateCurriculumQualityStatus.ts';can=json.loads(canp.read_text());assert len(can['goals'])==532 and b(canp)['sha256']=='c44b6476a3dcdb66d7d2e81a28757da61ffcfc48a15d3f675320c6f20a97f70f';reg=json.loads(regp.read_text());sub=next(s for s in reg['subjects'] if s['subject']=='wirtschaftswissenschaften');semp=R/sub['semanticKindLedgerPath'];sem=json.loads(semp.read_text());assert sem['counts']['total']==532
sciencep=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-seven-work-career-whole-science-independent-root-v1/one-real-four-dimension-boundary-independent-root-followup-v1/actual-final-one-real-four-dimension-remedy-seven-whole-science-KEEP.independent-root-handoff.receipt.json';sc=json.loads(sciencep.read_text());assert sc['decision']=='KEEP_ALL_SEVEN_WHOLE_MATERIALS';bodyp=R/sc['wholeCandidate']['path'];assert b(bodyp)['sha256']=='cb7ef6c338f3ec88cf36d0ea81026775c10ea7a4acee27b3a5fc547ec9f4ccb9';draft=json.loads(bodyp.read_text());assert len(draft)==7
intakep=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-seven-work-career-whole-contracts-KEEP-first-root-author-intake-v1/whole-seven-current524-DEEN-work-career-contracts-all-original-P-existing-material-intake.json';intake=json.loads(intakep.read_text());by={g['id']:g for g in can['goals']}
for r in intake['wholeCurrent7ContractsAndP']:assert by[r['wholeGoal']['id']]==r['wholeGoal']
assert sum(len(r['wholeOriginalP']['profile']['applicationCaseBriefs']) for r in intake['wholeCurrent7ContractsAndP'])==14
oldidx=json.loads((R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-seven-environment-current524-status-nav-whole-closure-access-author-a-v1/physical-data-private-config-successor-v2/actual-final531-seven-environment166-country-access-one-nav-whole-input.AUTHOR-index-v3.json').read_text());vps=[R/r['activePath'] for r in oldidx['whole35FinalViews']];assert len(vps)==35
fcan=put('whole-current532-before-CAN.exact.json',can);freg=put('whole-current532-central-registry.exact.json',reg);fsem=put('whole-current532-SEM-before.exact.json',sem);viewrows=[]
for p in vps:
 v=json.loads(p.read_text());viewrows.append({'activePath':str(p.relative_to(R)),'wholeActiveBinding':b(p),'wholeBefore':put('whole35-active-before/'+p.name,v),'wholeScope':v['scope']})
released=copy.deepcopy(draft)
for g,x in zip(released,draft):
 assert g['id'] not in by
 g['examData']['reviewStatus']='released';g['examData']['reviewNote']='Independent whole AI material science KEEP: '+str(sciencep.relative_to(R))+' SHA256 '+b(sciencep)['sha256']+'. This records machine curriculum QS only; human review, approval and trial remain separate. Whole-country/course access, navigation and final bindings require separate independent qualification.'
 z=copy.deepcopy(g);z['examData']['reviewStatus']=x['examData']['reviewStatus'];z['examData'].pop('reviewNote',None);assert z==x
rel=put('whole-seven-science-qualified-DEEN-only-status-reviewnote.INERT.json',released);candidate=copy.deepcopy(can);candidate['goals'].extend(released);nb={g['id']:g for g in candidate['goals']};navE='14c05eec-87af-5fd6-832a-4f5d9d280e66';navSup='a1c0e891-cb5b-56ef-9aa7-ac782e2099c3';placements=[]
for g in released:
 nav=navSup if g['phase']=='Q2' else navE;assert g['phase'] in ['E','Q2'];nb[nav]['contains'].append(g['id']);placements.append({'materialId':g['id'],'actualPracticePhase':g['phase'],'navId':nav})
assert sum(r['navId']==navE for r in placements)==4
pro=put('whole-current532-plus-seven-qualified-work-career-two-native-nav539.PROVISIONAL-INERT.json',candidate)
seed=Path(oldidx['capsules']['before']);cap=Path(tempfile.mkdtemp(prefix='skillpilot-economics-work-seven-scope-author-a-before-'))/'capsule';shutil.copytree(seed,cap,copy_function=os.link,symlinks=True)
writeguards=[]
def private(p,z,croot):
 assert not p.is_symlink() and p.resolve().is_relative_to(croot.resolve());p.parent.mkdir(parents=True,exist_ok=True)
 if p.exists():p.unlink()
 p.write_bytes(z);active=R/p.relative_to(croot);assert not active.exists() or not os.path.samefile(p,active);writeguards.append({'privatePath':str(p),'resolvedInside':True,'actualNotSameFileAsActive':True})
audit=json.loads((R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-seven-environment-current524-status-nav-whole-closure-access-author-a-v1/physical-data-private-config-successor-v2/actual-final-three-capsules-detached-private-live-config-data-and-current336-P685-endguards.AUTHOR.json').read_text());paths={R/row['path'] for row in audit['actualThreeCapsuleFileGuards'] if row['mode']=='before'}|{canp,regp,semp,*vps,*[R/p for p in sub['positiveEvidenceConfigPaths']]}
# Copy every file in the current new semantic-ledger frame physically, including all336 P685 archive.
paths|={p for p in semp.parent.rglob('*') if p.is_file()}
for p in paths:
 assert p.exists();private(cap/p.relative_to(R),p.read_bytes(),cap)
helper='app/scripts/authorA_WorkCareerCurrent532_Exports.ts';prefix=codep.read_bytes();suffix=b'\nexport { readJurisdictionCoverageByLandscapeId, routeProfiles, evaluateRouteProfile, collectRenderedAtomicGoalIdsFromCompositionView, buildAtomicDirectRequiresEdges, buildEffectiveRequiresEdges, createVisibleAtomicPathChecker, isProjectedRouteTargetGoal, collectWholeMaterialPrerequisiteClosure };\n';private(cap/helper,prefix+suffix,cap)
after=Path(tempfile.mkdtemp(prefix='skillpilot-economics-work-seven-scope-author-a-provisional-'))/'capsule';shutil.copytree(cap,after,copy_function=os.link,symlinks=True);private(after/canp.relative_to(R),(R/pro['path']).read_bytes(),after)
inputs=[b(p) for p in sorted(paths|{codep,sciencep,bodyp,intakep})]
for r in inputs:assert b(R/r['path'])['sha256']==r['sha256']
idx=put('actual-current532-seven-qualified-work-career-private-whole-input.AUTHOR-index-v1.json',{'role':'AUTHOR inert seven qualified status/nav/access candidate; foreign scope review pending','wholeCurrentCAN532':b(canp),'wholeCurrentRegistry':b(regp),'wholeCurrentSEM532':b(semp),'wholeFrozenBeforeCAN':fcan,'wholeFrozenBeforeRegistry':freg,'wholeFrozenBeforeSEM':fsem,'wholeForeignQualifiedDraftBodies':b(bodyp),'wholeSevenOnlyStatusNoteBodies':rel,'wholeForeignScience':b(sciencep),'wholeCurrent539ProvisionalCandidate':pro,'whole35CurrentViews':viewrows,'wholeCurrentSevenContractsOriginalP14':b(intakep),'wholeInputs':inputs,'productionPrefix':b(codep),'productionExactExportHelperPath':helper,'capsules':{'before':str(cap),'provisional':str(after)},'navIds':[navE,navSup],'actualFourEThreeQ2Placement':placements,'privateMutationSafetyGuards':writeguards,'allLiveDataAndConfigFilesPhysicalPrivateAndNotSameFileAsActive':True,'readonlyHistoricalAssetLinksGitNodeModulesRetainedGuardedFromWrites':True,'activeWrites':0,'ownIndependentScopeApproval':False,'wholeContractsPStatusesImagesMemorySourceScienceUnchanged':True})
print(json.dumps({'index':idx,'capsules':{'before':str(cap),'provisional':str(after)},'privateFiles':len(paths),'nav4E3Q2':placements},indent=2))
