from pathlib import Path
import json,gzip,hashlib,copy,jsonschema,shutil,os
ROOT=Path('/home/enpasos/projects/skillpilot');Q=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10';O=Q/'wirtschaft-M4-twelve-foreign-consumer-current597-status-nav-scope-author-a-v1';CAP=Path('/tmp/economics-consumer12-current597-scope-author-a-m0dy_i2u/capsule');R='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
def load(p):return json.loads(p.read_text())
def bind(p):return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def save(n,x):p=O/n;assert not p.exists(),p;p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return bind(p)
def native(n):return json.loads(gzip.decompress((O/(n+'.actual-native.json.gz')).read_bytes()))
def metrics(x):return next(r for r in x['route']['rules'] if r['id']=='CQR-104')['metrics']
bp=Q/'wirtschaft-M4-twelve-local-consumption-communication-media-one-contract-author-a-v1/own-before-current597-consumer12-author-A.actual-native.json.gz';b=json.loads(gzip.decompress(bp.read_bytes()));a=native('own-after609-consumer12-155-current597-whole-scope-author-A');n=native('own-negative-BB-GK-consumption-options-material-one-refdrop-author-A');s=native('own-negative-HE-GK-journalism-hidden-whole-closure-access-injection-author-A');ix=load(O/'actual-consumer12-155-material-references-and262-whole-context-bindings.author-index.json');ids=set(ix['newMaterialIds']);sem=load(O/'whole-current597-semantic-kinds.readonly.json');kind={r['goalId']:r['semanticKind'] for r in sem['decisions']}
strip=lambda rows:[{k:[i for i in v if i not in ids] if isinstance(v,list) else v for k,v in r.items()} for r in rows];assert strip(b['all64NativeScopeSets'])==strip(a['all64NativeScopeSets'])==strip(n['all64NativeScopeSets'])==strip(s['all64NativeScopeSets'])
def atomicSource(x):
 y=copy.deepcopy(x);y.pop('rawAtomicGoals')
 for r in y['jurisdictions']:
  for k in ['visibleGoals','visibleClusterGoals','diagnosticPartialOnlyWarnings']:r.pop(k,None)
 return y
assert atomicSource(b['source'])==atomicSource(a['source']);assert a['source']['rawAtomicGoals']-b['source']['rawAtomicGoals']==12;assert a['source']==n['source']==s['source'];assert a['compiler']['summary']['errors']==a['compiler']['summary']['warnings']==0
assert (metrics(a)['visibleSelectedGoalOccurrencesMissingDirectTerminalRoute'],metrics(a)['uniqueVisibleSelectedGoalsMissingDirectTerminalRoute'])==(428,69);assert metrics(a)['projectionScopesMissingTerminalAutonomyGoals']==metrics(a)['wholeMaterialPrerequisiteOccurrencesMissingFromProjection']==metrics(a)['wholeMaterialCoveredGoalOccurrencesWithoutVisiblePrerequisitePath']==0;assert metrics(a)['visibleProjectedRouteTargetGoalOccurrences']==6974
assert (metrics(n)['visibleSelectedGoalOccurrencesMissingDirectTerminalRoute'],metrics(n)['uniqueVisibleSelectedGoalsMissingDirectTerminalRoute'],metrics(n)['projectionScopesMissingTerminalAutonomyGoals'])==(430,70,1)
assert metrics(s)['wholeMaterialPrerequisiteOccurrencesMissingFromProjection']==4 and metrics(s)['wholeMaterialCoveredGoalOccurrencesWithoutVisiblePrerequisitePath']==2
old={g['goalId']:g for g in b['compiler']['goals']};new={g['goalId']:g for g in a['compiler']['goals']}
for gid,k in kind.items():
 if k in ['curricularAtomic','memory','orientation']:assert old[gid]==new[gid]
can=load(O/'whole-current609-consumer12-threeNav-actual-child-union.INERT-author-candidate.json');base=load(O/'whole-current597-before-consumer-scope.active-exact.json');cm={g['id']:g for g in can['goals']};nav=load(O/'actual-three-purposeful-Nav-and-qualified-derived-jurisdiction-field-deltas.author.json');nids={r['goalId'] for r in nav}
for g in base['goals']:
 if g['id'] not in nids:assert cm[g['id']]==g
for r in nav:
 union=sorted(set(j for ch in cm[r['goalId']]['contains'] for j in new[ch]['compiledApplicability'].get('jurisdiction',[])));assert union==r['actualChildJurisdictionUnion']==sorted(new[r['goalId']]['compiledApplicability']['jurisdiction']);assert not r['jurisdictionMetadataChanged']
mat=a['whole768ConsumerMaterialContextBindings'];assert len(mat)==768 and sum(r['actuallyVisible'] for r in mat)==262 and all(r['actuallyVisible']==r['actualWholeClosureEligible'] for r in mat);assert all(r['allCoveredOrdinaryTargets'] for r in mat if r['actuallyVisible']);held=[r for r in mat if r['actualCountryEligible'] and r['actualCourseEligible'] and r['actualMissingPrerequisiteIds']];assert len(held)==14
schema=load(ROOT/'docs/landscape-runtime.schema.json');errs=[{'path':list(e.path),'message':e.message} for e in jsonschema.Draft202012Validator(schema).iter_errors(can)];assert not errs
vs=load(ROOT/'contracts/curriculum-package/v1/composition-view.schema.json');ve=[];vbe=[]
for r in ix['viewRows']:
 p=ROOT/r['candidate']['path'];cp=CAP/r['activePath'];assert cp.read_bytes()==p.read_bytes() and not cp.is_symlink() and not os.path.samefile(cp,ROOT/r['activePath'])
 before=load(ROOT/r['before']['path']);after=load(p)
 if r['newReferenceCount']:
  restored=copy.deepcopy(after);restored['viewId']=before['viewId'];added=restored['rootNodes'][0]['children'].pop();assert restored==before
  def refs(q):return [q['goalId']] if q.get('kind')=='goalEntry' else [i for z in q.get('children',[]) for i in refs(z)]
  assert refs(added)==r['newMaterialIds']
 else:assert after==before
 for dest,row in [(ve,after),(vbe,before)]:dest.extend({'view':r['activePath'],'path':list(e.path),'message':e.message} for e in jsonschema.Draft202012Validator(vs).iter_errors(row))
assert ve==vbe and len(ve)==3 and all(e['view'].endswith('de-de-gym-seki-economics.view.json') for e in ve)
start=load(O/'actual-current597-consumer-private-physical-start-after-foreign-science.freeze.json');guards=[];changedCurrent=[]
for r in start['actualWholeBeforeInputs']:
 current=bind(ROOT/r['path']);private=CAP/r['path'];assert private.resolve().is_relative_to(CAP.resolve()) and not private.is_symlink() and not os.path.samefile(private,ROOT/r['path'])
 if current['sha256']!=r['sha256']:changedCurrent.append({'frozenBefore':r,'current':current})
 guards.append({'frozenBefore':r,'actualCurrent':current,'currentExactToFrozen':current['sha256']==r['sha256']})
reg=load(O/'whole-current597-central-registry.readonly.json');econ=next(s for s in reg['subjects'] if s['subject']=='wirtschaftswissenschaften');profiles={};pbound=[]
for rel in econ['positiveEvidenceConfigPaths']:
 cfg=load(ROOT/rel);pbound += [bind(ROOT/rel),bind(ROOT/cfg['reviewPath'])]
 for line in (ROOT/cfg['reviewPath']).read_text().splitlines():
  if line.strip():
   r=json.loads(line);assert r['goalId'] not in profiles;profiles[r['goalId']]=r
assert len(profiles)==336 and sum(len(r['profile']['applicationCaseBriefs']) for r in profiles.values())==685
pintake=Q/'wirtschaft-M4-twelve-local-consumption-communication-media-one-contract-author-a-v1/whole-twelve-current597-DEEN-contracts24-original-P-cases-and-current43-bindings.exact-author-intake.json';rows=load(pintake)['actual12Rows'];currentCan=load(ROOT/R);activegm={g['id']:g for g in currentCan['goals']}
for r in rows:assert cm[r['goalId']]==activegm[r['goalId']]==r['wholeCurrentDEENGoal'] and profiles[r['goalId']]==r['wholeOriginalPositiveV2Record']
assert sum(len(r['wholeOriginalPositiveV2Record']['profile']['applicationCaseBriefs']) for r in rows)==24
# Reuse the previously valid immutable source and card science bindings; independently compare current whole bytes again.
prev=Q/'wirtschaft-current621-company-finance24-current597-fieldwise-status-nav-scope-author-a-v1/actual-three-combined621-owned-native-frames-and-current597-whole-source-memory-P-schema-endguards.author.json';pb=load(prev);sourceGuards=[];memoryGuards=[]
for r in pb['actual34NativeReferencedSourceFileByteGuards']:
 src=ROOT/r['path'];assert bind(src)==r;assert (CAP/r['path']).read_bytes()==src.read_bytes();sourceGuards.append(bind(src))
for r in pb['actualMemoryConfigDecisionsCardsAnd10PublicDeck66CardByteGuards']:
 src=ROOT/r['path'];actual=bind(src);assert all(actual[k]==r[k] for k in ['path','sha256','bytes']);memoryGuards.append({**actual,'exactReuseMethod':r['exactReuseMethod']})
deckpaths=[ROOT/r['path'] for r in memoryGuards if '/memory-decks/' in r['path']];assert len(deckpaths)==10 and sum(len(load(p)['cards']) for p in deckpaths)==66
for g in base['goals']:
 if kind.get(g['id'])=='curricularAtomic':assert activegm[g['id']]==g
frozenP=load(pintake)['actualWhole86CurrentConfigAndReviewFiles']
for r in frozenP:assert bind(ROOT/r['path'])['sha256']==r['sha256']
assert len(changedCurrent)==0,changedCurrent
heldBinding=save('actual-fourteen-held-whole-country-course-closure-contexts-no-ordinary-role-widening.author.json',{'role':'AUTHOR_HELD_CONTEXTS_NOT_EMPTY_RELEASE_OR_SOURCE_RELAXATION','wholeHeldContexts':held,'actualCount14':14,'allSourceAndOrdinaryRolesRemainExact':True,'noExistingPOnlyPracticeException':True,'activeWrites':0})
science=load(O/'actual-final-consumer12-foreign-whole-science-byte-reuse-and-current597-start.author-intake.json')
check=save('actual-consumer12-four-owned-native-frames-baseline-reuse155-refs768-whole-closure-and-source-memory-schema.author-endguard.json',{'role':'AUTHOR_ONLY_PENDING_FOREIGN_SCOPE_QS','ownBeforeCurrent597NativeReuse':bind(bp),'actualNewNativeRuns':4,'afterCompiler':a['compiler']['summary'],'actualBeforeRouteMissing512Open81':True,'actualAfterRouteMissing428Open69':True,'actualNetRestoredLocalRouteOccurrences84':84,'actualWholeContractRouteGain12':12,'negativeBBConsumerRefdrop430Open70Expected1':True,'negativeHEJournalismForbiddenAccessClosure4Coverage2':True,'negativeSourceWholeExact':True,'allSourceOriginalAtomic16_2134ExactAndPositiveRawPlus12PracticeOnly':True,'all64OldTargetsSupportPOnlyMemoryOrientationPracticeSetsExact':True,'positiveOrdinaryTargetOccurrences6974':True,'all336OrdinaryAndMemoryOCompiledWholeRowsExact':True,'all768WholeContextBindings':mat,'whole262Bindings155References131Country24National':True,'actualHeld14WholeContextBindings':heldBinding,'newPOnlyScopeOrFoundationReferences':0,'allActive81InputEndguards':guards,'actual34NativeReferencedSourceFileByteGuards':sourceGuards,'actualMemoryConfigDecisionsCardsAnd10PublicDeck66CardByteGuards':memoryGuards,'retainedWholeMemoryCardScienceReceipt':pb['retainedWholeCardDeckScienceReceipt'],'noNativePrivateDeckCopyOrFreshCardScienceClaim':True,'all43PositiveConfigAndReviewBindings':pbound,'wholeOriginalTwelveGoalP24Rows':rows,'wholeOriginal336Profiles685CasesUnchanged':True,'threeActualCompiledNavChildCountryUnionsMatch':True,'noNavJurisdictionFieldFollowerNeeded':True,'runtimeCAN609SchemaErrors':errs,'closedViewContractErrorsBefore':vbe,'closedViewContractErrorsAfter':ve,'all34CrossStageAnd34ChangedViewsClosedSchemaErrors':0,'unchangedLegacySEKIHeaderDebtThreeExact':True,'wholePositivePrivate609CANAnd35ViewsRestoredAfterRealNegatives':True,'privateCANActualExact':(CAP/R).read_bytes()==(O/'whole-current609-consumer12-threeNav-actual-child-union.INERT-author-candidate.json').read_bytes(),'newStrictClosures':0,'restoredHistoricalEvidenceBindings':0,'ownScientificOrScopeKEEP':False,'activeWrites':0,'humanApproval':False,'M4OrM6Reached':False})
for src,name in [(Path('/tmp/economics-consumer12-current597-status-nav-scope-author-a.py'),'actual-executed-consumer-status-nav-author.py'),(Path('/tmp/economics-consumer12-current597-views-author-a.py'),'actual-executed-consumer155-view-author.py'),(Path('/tmp/economics-consumer12-two-native-negatives-author-a.py'),'actual-executed-consumer-two-native-negatives-author.py'),(Path('/tmp/economics-consumer12-final-current597-scope-author-a.py'),'actual-executed-consumer-final-author-endguards.py'),(CAP/'app/scripts/consumer12Current597WholeStatusNavScopeAuthorA.mts','actual-executed-own-consumer-native-runner.mts')]:assert not (O/name).exists();shutil.copyfile(src,O/name)
manifest=save('actual-final-consumer12-current597-portable-whole-author-manifest.json',{'role':'AUTHOR_IMMUTABLE_MANIFEST','wholeFiles':[bind(p) for p in sorted(O.rglob('*')) if p.is_file()]})
handoff=save('actual-final-consumer12-155-accesses-threeNav-current597-foreign-science-reuse.author-handoff.json',{'role':'AUTHOR_ONLY_PENDING_FOREIGN_SCOPE_NAV_QS','subject':'wirtschaftswissenschaften','wholeBeforeCAN':ix['canonicalBefore'],'wholeAfterCAN':ix['canonicalCandidate'],'wholeQualifiedScienceReceipt':science['foreignScienceReceipt'],'wholeQualifiedBodyV5':science['qualifiedWhole12'],'wholeForeignBodyTwelveStatusOnlyReleased':True,'threePurposefulPrefixNavs':bind(O/'actual-three-purposeful-Nav-and-qualified-derived-jurisdiction-field-deltas.author.json'),'whole35BeforeAfterViewRows':ix['viewRows'],'fullReferenceIndex':bind(O/'actual-consumer12-155-material-references-and262-whole-context-bindings.author-index.json'),'actual262WholeBindings155Refs131Country24National':True,'actual14TrueWholeClosureContextsHeld':heldBinding,'sourceAnd336P685MemoryAndPhysicalEndguards':check,'actualRoute512_81To428_69':True,'actualNetRestoredLocalRouteOccurrences84':84,'actualUniqueLocalContractsCompleted12':12,'actualNewStrictClosures':0,'newIndependentBodyScienceClosures':0,'restoredHistoricalEvidenceBindings':0,'privateFrozenCapsule':str(CAP),'helperPath':'app/scripts/consumer12Current597WholeStatusNavScopeAuthorA.mts','helperArgs':'CAP OUT ROOT LABEL','portableManifest':manifest,'ownScopeKEEP':False,'activeWrites':0,'humanApproval':False,'M4OrM6Achieved':False,'actualObservedOralPassCountInForeignScience':0});print(json.dumps(handoff))
