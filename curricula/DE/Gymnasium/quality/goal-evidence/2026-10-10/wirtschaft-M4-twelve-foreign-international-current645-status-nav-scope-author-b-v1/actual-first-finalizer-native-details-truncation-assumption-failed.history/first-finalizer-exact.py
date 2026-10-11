import pathlib,json,gzip,hashlib,copy,collections,re,tarfile,shutil
import jsonschema
R=pathlib.Path('/home/enpasos/projects/skillpilot');O=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-twelve-foreign-international-current645-status-nav-scope-author-b-v1';CAP=pathlib.Path('/tmp/skillpilot-international12-current645-author-B-2zzno41h/capsule')
def rd(p):return json.loads(p.read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p):return dict(path=str(p.relative_to(R)),sha256=sha(p),bytes=p.stat().st_size)
def save(n,a):
 p=O/n;assert not p.exists();p.write_text(json.dumps(a,ensure_ascii=False,indent=2)+'\n');return bind(p)
def native(n):return json.loads(gzip.decompress((O/(n+'.actual-native.json.gz')).read_bytes()))
before=native('before-current645-intl12');after=native('after-current657-intl12');neg1=native('negative-one-needed-NI-LK-HDI-reference-drop');neg2=native('negative-one-HDI-convenient-nonempty-requiredBy')
old=rd(O/'whole-active645-before-international12.exact.json');new=rd(O/'whole-current657-twelve-foreign-qualified-status-two-nav-and-one-real-Q4-HB-union.INERT.json');reg=rd(O/'whole-active-v16-Registry-before-international12.exact.json');sub=next(s for s in reg['subjects']if s['subject']=='wirtschaftswissenschaften');nid={m['materialId'] for m in after['materials']};assert len(nid)==12
assert len(old['goals'])==645 and len(new['goals'])==657
oldgm={g['id']:g for g in old['goals']};newgm={g['id']:g for g in new['goals']};navids={'0fb8833c-4017-5052-819a-ecb5f6ebb36f','5113c64b-405d-5f4b-bae9-70fe530b5e69'}
assert all(g==newgm[id] for id,g in oldgm.items() if id not in navids)
nav=[]
for id in navids:
 a=oldgm[id];b=newgm[id];diff=[k for k in set(a)|set(b)if a.get(k)!=b.get(k)];assert set(diff)==({'contains','description','descriptionEn','applicability'} if id.startswith('5113') else {'contains','description','descriptionEn'});assert b['contains'][:len(a['contains'])]==a['contains'];nav.append({'goalId':id,'wholeBefore':a,'wholeAfter':b,'fields':diff,'exactOldChildrenPrefix':True,'newChildren':b['contains'][len(a['contains']):]})
navbinding=save('actual-two-whole-final-Q3-Q4-Nav-prefix-fields-and-Q4-HB-childunion.author.json',nav)
compilerold={g['goalId']:g for g in before['compiler']['goals']};compilernew={g['goalId']:g for g in after['compiler']['goals']};semantic=rd(O/'whole-active-v16-SEM-before-international12.exact.json');ordinary={d['goalId']for d in semantic['decisions']if d['semanticKind']=='curricularAtomic'};assert len(ordinary)==336;assert all(compilerold[id]==compilernew[id]for id in ordinary)
roles=[]
fields=['ordinaryTargets','ordinarySupport','memoryTargets','memorySupport','orientationTargets','orientationSupport']
for a,b in zip(before['all64NativeScopeSets'],after['all64NativeScopeSets']):
 assert a['viewPath']==b['viewPath'] and a['jurisdiction']==b['jurisdiction'];assert all(a[k]==b[k]for k in fields)
 for k in ['allTargetAtomicIds','allSupportAtomicIds','prerequisiteOnlyAtomicIds']:
  assert a[k]==[id for id in b[k]if id not in nid]
 roles.append({'viewPath':a['viewPath'],'jurisdiction':a['jurisdiction'],'course':a['courseProfile'],'allExistingTargetSupportPOnlyMemoryOrientationExact':True,'ordinaryTargetOccurrences':len(a['ordinaryTargets']),'newPracticeTargets':[id for id in b['allTargetAtomicIds'] if id in nid]})
assert sum(x['ordinaryTargetOccurrences']for x in roles)==6974
matrix=after['wholeInternational12By64ActualContextBindings'];assert len(matrix)==768 and sum(x['actuallyVisible']for x in matrix)==330;assert all(x['actuallyVisible']==x['actualWholeClosureEligible']for x in matrix)
sourceold=before['source'];sourcenew=after['source'];assert sourceold['sourceAtomicGoals']==sourcenew['sourceAtomicGoals']==2134;assert sourceold['totalJurisdictions']==sourcenew['totalJurisdictions']==16
for k in sourceold:
 if k not in ['rawAtomicGoals','jurisdictions']:assert sourceold[k]==sourcenew[k],k
assert sourcenew['rawAtomicGoals']-sourceold['rawAtomicGoals']==12
derived=[]
for a,b in zip(sourceold['jurisdictions'],sourcenew['jurisdictions']):
 assert a['jurisdiction']==b['jurisdiction'];diff=[k for k in a if a[k]!=b[k]];assert set(diff)<= {'visibleGoals','visibleClusterGoals'}
 derived.append({'jurisdiction':a['jurisdiction'],'actualNonAtomicCountDeltas':{k:{'before':a[k],'after':b[k]}for k in diff},'allAtomicSourceAssignedForwardReversePartialDiagnosticsWholeExact':True})
def metrics(a):return next(r for r in a['route']['rules']if r['id']=='CQR-104')['metrics']
bm,am,n1,n2=map(metrics,[before,after,neg1,neg2]);assert bm['visibleSelectedGoalOccurrencesMissingDirectTerminalRoute']==174 and am['visibleSelectedGoalOccurrencesMissingDirectTerminalRoute']==78
assert n1['visibleSelectedGoalOccurrencesMissingDirectTerminalRoute']==80 and n1['projectionScopesMissingTerminalAutonomyGoals']==1;assert n2['wholeMaterialCoveredGoalOccurrencesWithoutVisiblePrerequisitePath']==6
assert am['wholeMaterialPrerequisiteOccurrencesMissingFromProjection']==am['wholeMaterialCoveredGoalOccurrencesWithoutVisiblePrerequisitePath']==am['projectionScopesMissingTerminalAutonomyGoals']==0
assert after['compiler']['summary']['errors']==after['compiler']['summary']['warnings']==0
def missing(a):
 rows={}
 for d in next(r for r in a['route']['rules']if r['id']=='CQR-104')['details']:
  prefix='No projection-local direct terminal route: '
  if d.startswith(prefix):
   scope,ids=d[len(prefix):].split(': ',1);rows[scope]=set(ids.split(', '))
 return rows
oldmiss,newmiss=missing(before),missing(after);assert oldmiss and newmiss
removed=[]
for scope,ids in oldmiss.items():
 for id in sorted(ids-newmiss.get(scope,set())):
  closurem=[m['materialId']for m in after['materials']if id in m['wholeNativeClosure'] or id in m['wholeGoal']['examData']['coveredGoalIds']]
  assert closurem;removed.append({'scope':scope,'currentOrdinaryGoalId':id,'wholeMaterialPrerequisiteOrCoveredCausality':closurem})
assert len(removed)==96 and len({x['currentOrdinaryGoalId']for x in removed})==12
profiles=[];pids=set();cases=0;fileguards=[]
for rel in sub['positiveEvidenceConfigPaths']:
 cfg=R/rel;cc=rd(cfg);capcfg=CAP/rel;assert capcfg.read_bytes()==cfg.read_bytes() and not capcfg.samefile(cfg)
 rv=R/cc['reviewPath'];cr=CAP/cc['reviewPath'];assert rv.read_bytes()==cr.read_bytes() and not rv.samefile(cr);ps=[json.loads(l)for l in rv.read_text().splitlines()if l.strip()]
 for p in ps:
  assert p['status']=='needs_human_review' and p['reviewAuthority']=='ai_candidate';assert p['goalId']not in pids;pids.add(p['goalId']);cases+=len(p['profile']['applicationCaseBriefs'])
 profiles.append({'config':bind(cfg),'review':bind(rv),'records':len(ps),'cases':sum(len(p['profile']['applicationCaseBriefs'])for p in ps),'wholePrivateInputsByteExactNotSamefile':True,'status':'needs_human_review','authority':'ai_candidate'})
 fileguards += [cfg,rv,R/cc['reviewCriteriaPath']]
assert len(profiles)==43 and pids==ordinary and cases==685
mainend=rd(R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-current645-company-finance-consumer-labour48-current597-fieldwise-status-nav-scope-author-a-v1/actual-four-combined645-owned-native-frames-and-current597-whole-source-memory-P-schema-endguards.author.json');memory=[]
for b in mainend['actualMemoryConfigDecisionsCardsAnd10PublicDeck66CardByteGuards']:
 p=R/b['path'];assert sha(p)==b['sha256'];memory.append(bind(p))
assert len([x for x in memory if '/memory-decks/' in x['path']])==10
deckcards=0
for x in memory:
 if '/memory-decks/' in x['path']:
  d=rd(R/x['path']);cs=d if isinstance(d,list) else d.get('cards',d.get('items',[]));deckcards+=len(cs)
assert deckcards==66
schema=jsonschema.Draft202012Validator(rd(R/'docs/landscape-runtime.schema.json'));schemaerrs=[e.message for e in schema.iter_errors(new)];assert not schemaerrs,schemaerrs[:3]
vindex=rd(O/'actual-one165-country-refs-zero-national-refs-whole35-view-fieldwise.author-index.json');assert len(vindex['whole35ViewChanges'])==35
for x in vindex['whole35ViewChanges']:
 assert (R/x['wholeAfter']['path']).read_bytes()==(CAP/x['activePath']).read_bytes();assert (R/x['wholeBefore']['path']).read_bytes()==(R/x['activePath']).read_bytes()
assert (R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json').read_bytes()==(O/'whole-active645-before-international12.exact.json').read_bytes()
assert (CAP/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json').read_bytes()==(O/'whole-current657-twelve-foreign-qualified-status-two-nav-and-one-real-Q4-HB-union.INERT.json').read_bytes()
code=[]
for rel in ['app/scripts/generateCurriculumQualityStatus.ts','app/scripts/applicabilityCompiler.ts','app/scripts/goalBookModel.ts','app/src/utils/goalFilters.ts']:
 p=R/rel;q=CAP/rel;assert q.read_bytes()[:p.stat().st_size]==p.read_bytes();code.append({'production':bind(p),'privateProductionPrefixExact':True,'onlyKnownReadOnlyDiagnosticExports':q.read_bytes()[p.stat().st_size:].decode(),'physicalNotSamefile':not p.samefile(q)})
proof=save('actual-owned657-native-scope-source-P336685-memory10-66-whole-guards-and-two-real-negatives.AUTHOR.json',{'role':'AUTHOR actual machine probe, no independent ScopeKEEP','whole64ExistingRoleSets':roles,'whole336OrdinaryCompilerRowsExact':True,'all643OldNonNavWholeGoalsExact':True,'whole330VisibleBindingsAndAll768Decisions':bind(O/'after-current657-intl12.actual-native.json.gz'),'source16AtomicWholeExact2134':True,'sourceOnlyRaw12PracticeAndRealDerivedClusterCounts':derived,'ordinaryTargetOccurrences6974Exact':True,'all43ConfigAndReviewBytesStatusAuthorityAnd685Cases':profiles,'actual10Decks66CardsAndExistingReviewInputs':memory,'memory10Decks66ActualCards':deckcards,'validExistingCardScienceReceipt':mainend['retainedWholeCardDeckScienceReceipt'],'noNewCardScience':True,'exactMeasuredMissingRoutes':[174,78,80],'exactMeasuredMissingIDs':[33,21,22],'actualNetRouteGain':96,'actualNetContractRouteGain':12,'actualRemoved12CurrentIDsAnd96ScopedCausality':removed,'negative2ActualWholeCoverage6AndExpected13':True,'candidateRuntimeSchemaErrors':schemaerrs,'codeBindings':code,'restoredPrivatePositiveWholeCANAnd35ViewsExact':True,'activeCurrent645RegistryViewsCANUnchanged':True,'newStrictClosures':0,'humanApproval':False,'ownScopeKEEP':False})
# Portable executable inputs, lossless archive before handoff. Only physical source/config/profile/code inputs, no node_modules or private learner data.
files={p.relative_to(CAP).as_posix():p for p in CAP.glob('curricula/**/*.json')if 'quality'not in p.relative_to(CAP).parts}
for rel in ['curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json',sub['semanticKindLedgerPath']]+sub['positiveEvidenceConfigPaths']:
 files[rel]=CAP/rel
for p in fileguards:
 rel=p.relative_to(R).as_posix();files[rel]=CAP/rel
for rel in ['app/scripts/generateCurriculumQualityStatus.ts','app/scripts/applicabilityCompiler.ts','app/scripts/goalBookModel.ts','app/scripts/curriculumSourceInventory.ts','app/src/utils/goalFilters.ts','app/scripts/nativeInternational12Current645ScopeAuthorB.mts','contracts/curriculum-package/v1/composition-view.schema.json','docs/landscape-runtime.schema.json']:
 p=CAP/rel
 if not p.exists():p=R/rel
 files[rel]=p
inventory=[]
for rel,p in sorted(files.items()):
 assert p.is_file() and not p.is_symlink();inventory.append({'physicalCapsulePath':rel,'sha256':sha(p),'bytes':p.stat().st_size,'samefileWithLiveRepo':(p.samefile(R/rel)if(R/rel).exists()else False),'captureMethod':'actual physical bytes, not hash-only scientific approval'})
archive=O/'whole-restored657-physical-native-inputs.before-handoff.tar.gz';assert not archive.exists()
with tarfile.open(archive,'w:gz',compresslevel=9)as tar:
 for rel,p in sorted(files.items()):tar.add(p,arcname=rel,recursive=False)
archiveindex=save('actual-lossless-restored657-native-input-archive-and-physical-file-hashes.author.json',{'archive':bind(archive),'files':inventory,'entryCount':len(files),'activeOrSharedInputWrites':0,'privateScopeOnlyConditionalSEM':'Existing v16 path in PRIVATE archive carries conditional657 ledger; active v16 remains exact. Counts complete657, twelve foreign science-bound practice kinds and two NavFP followers; Root v17 technical integration later.'})
for lab,sid in [('after-current657-intl12',2347)]:
 save(lab+'.actual-native-tool-observed-command-exit.json',{'exitCode':0,'nativeSummary':bind(O/(lab+'.actual-native-summary.json')),'nativeWholeOutput':bind(O/(lab+'.actual-native.json.gz')),'sessionId':sid,'observedStderr':'','capture':'functions.exec/write_stdin observed completion; native outputs were written by production-prefix helper; no separately captured raw stdout file claimed.'})
shutil.copyfile('/tmp/intl12_run_private_B.py',O/'run_owned_international12_private_native.py')
shutil.copyfile('/tmp/author_intl12_scope_fields_B.py',O/'author_international12_scope_fields.py')
manifestfiles=[p for p in O.rglob('*')if p.is_file() and p.name not in ['actual-final-international12-current645-portable-author-freeze.manifest.json','actual-final-international12-current645-657-status-165refs-whole-scope.AUTHOR-handoff.json']]
manifest=save('actual-final-international12-current645-portable-author-freeze.manifest.json',{'role':'immutable AUTHOR freeze; foreign ScopeKEEP pending','files':[bind(p)for p in sorted(manifestfiles)]})
h=save('actual-final-international12-current645-657-status-165refs-whole-scope.AUTHOR-handoff.json',{'role':'AUTHOR only; standalone qualified machine candidates for combined678, no independent ScopeKEEP','wholeBeforeCAN':bind(O/'whole-active645-before-international12.exact.json'),'wholeAfterCAN':bind(O/'whole-current657-twelve-foreign-qualified-status-two-nav-and-one-real-Q4-HB-union.INERT.json'),'whole12OnlyStatusAndReviewNoteReleasedBodies':bind(O/'whole-twelve-international-foreign-KEEP-only-machine-status-note.released-INERT.json'),'whole12ForeignQualifiedDraft':rd(O/'actual-international12-current645-frozen-foreign-science-physical-before-inputs.AUTHOR.json')['wholeForeignQualifiedDraft'],'foreignWholeScienceReceipt':rd(O/'actual-international12-current645-frozen-foreign-science-physical-before-inputs.AUTHOR.json')['foreignScience'],'oldRegistry':bind(O/'whole-active-v16-Registry-before-international12.exact.json'),'oldKindLedger':bind(O/'whole-active-v16-SEM-before-international12.exact.json'),'whole35BeforeAfterViewIndex':bind(O/'actual-one165-country-refs-zero-national-refs-whole35-view-fieldwise.author-index.json'),'wholeTwoNavDeltas':navbinding,'singleActualQ4ChildUnionHBField':bind(O/'actual-one-Q4-childunion-HB-only-jurisdiction-metadata.author.json'),'all330IndividualEligibilityRoleAndAuthorityDecisions':bind(O/'actual-all330-individual-whole-eligible-country-and-national-author-decisions.json'),'nativeScopeSourcePAndMemoryGuards':proof,'nativePhysicalInputArchive':archiveindex,'nativeBefore645':bind(O/'before-current645-intl12.actual-native.json.gz'),'nativeAfter657':bind(O/'after-current657-intl12.actual-native.json.gz'),'negativeNeededNI_LKHDIReferenceDrop':bind(O/'negative-one-needed-NI-LK-HDI-reference-drop.actual-native.json.gz'),'negativeNonemptyWrongWholePrerequisite':bind(O/'negative-one-HDI-convenient-nonempty-requiredBy.actual-native.json.gz'),'actualNewRefs':165,'actualCountryRefs':165,'actualNationalRefs':0,'actualWholeVisibleBindings':330,'actualExistingPOnlyWholeAssessmentBindings':12,'actualChangedViews':32,'newMaterialIds':sorted(nid),'actualBeforeAfterDirectRouteOccurrences':[174,78],'actualBeforeAfterUniqueLocalMissingIDs':[33,21],'newScientificReviews':0,'wholeMaterialScienceReuse':12,'newStrictCurricularAtomicClosures':0,'restoredHistoricalEvidenceBindings':0,'M4M6M7Reached':False,'wholeCQR104StillFAIL':True,'privateCapsule':str(CAP),'privateOnlySEMTechnicalFollowerNoProductionPointerChanges':True,'activeWrites':0,'humanReviewReleaseTrials':'separate pending','portableManifest':manifest})
print(json.dumps(h))
