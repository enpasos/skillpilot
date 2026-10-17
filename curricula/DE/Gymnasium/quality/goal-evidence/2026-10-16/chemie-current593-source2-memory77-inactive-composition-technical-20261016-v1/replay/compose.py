import pathlib,json,copy,hashlib,collections
from jsonschema import Draft202012Validator
R=pathlib.Path('/home/enpasos/projects/skillpilot');E=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16');P=E/'chemie-methods4-v2-split3-source2-v2-current587-inactive-composition-technical-20261016-v1';M=E/'chemie-split3-six-child-memory-concrete-selections-cards-and-origins-author-20261016-v1';D=E/'chemie-split3-primary-degradation-definition-targeted-card-author-successor-20261016-v2';O=E/'chemie-current593-source2-memory77-inactive-composition-technical-20261016-v1';(R/O).mkdir(exist_ok=True)
def rd(p):return json.loads((R/p).read_text())
def pin(p):
 p=pathlib.Path(p);b=(R/p).read_bytes();return{'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def exact(p):assert pin(p['path'])==p,p['path']
def save(n,o):
 p=O/n;(R/p).parent.mkdir(parents=True,exist_ok=True);(R/p).write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n');return pin(p)
def shao(o):return'sha256:'+hashlib.sha256(json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
inputs=[]
for n,h in[(P/'OUTPUTS.finite-methods-split-source2-current587-technical-selector.json','274eb3c9a7157991cdfa674f818478b93f1b228476ad4b6c66cf4bc83ab583bd'),(M/'OUTPUTS.finite-memory6-concrete-author-candidates.selector.json','652fff756559b8e258b7cc84be23c3145dd49612d59a4cafd9645b3b8ba3ca4b'),(D/'OUTPUTS.finite-primary-definition-targeted-author-successor.selector.json','60ca2eb8aa946f7a2915f65ef931b750028b8da67bc72fc9a2a3a569daa0e0b4')]:
 p=pin(n);assert p['sha256']=='sha256:'+h;inputs.append(p)
for n in[P/'SEAL.finite-inactive-current587-technical-composition.json',M/'OUTPUTS.finite-memory6-concrete-author-candidates.selector.json']:
 for p in rd(n)['files']:exact(p)
basep=P/'candidate/CANONICAL.current587.methods-split-source2.inactive.json';before=rd(basep);after=copy.deepcopy(before);mem=rd(M/'MEMORY6.six-whole-new-subset-node-candidates.author.json');nodes=mem['wholeNewMemoryNodes'];g={x['id']:x for x in after['goals']};newids=[]
for row in mem['wholeObjectCAS']:
 i=row['memoryGoalId'];assert i not in g and row['beforeWholeObject']is None;assert next(x for x in nodes if x['id']==i)==row['afterWholeObject'];newids.append(i);after['goals'].append(copy.deepcopy(row['afterWholeObject']));g[i]=after['goals'][-1]
assert after['goals'][:len(before['goals'])]==before['goals'];assert len(after['goals'])==len(before['goals'])+len(nodes);assert len(g)==len(after['goals'])
cp=save(pathlib.Path('candidate/CANONICAL.current593.source2-memory-whole-inactive.json'),after)
save(pathlib.Path('CANONICAL.whole-before-after-and-six-exact-new-memory-node-CAS.neutral.json'),{'wholeBefore':pin(basep),'wholeAfter':cp,'wholeBeforeNodes':len(before['goals']),'wholeAfterNodes':len(after['goals']),'wholeExistingBodiesAndOrderExactlyPreserved':True,'wholeNewMemoryCAS':mem['wholeObjectCAS'],'noAncestorChangeRequestedByAuthor':True,'all587EarlierBodiesExact':True,'allEarlierSource2MethodsSplitTextAndImageBodiesExact':True,'newIndependentMemoryApproval':False})
# Merge only the exact whole disjoint appended root entries. Never replace current587 views by older586 Memory after snapshots.
p47=rd(P/'VIEWS47.latest-whole-composed-purposes.with-two-explicit-BY-LK-plan-references.neutral.json');purposes=copy.deepcopy(p47['purposes']);m47=rd(M/'VIEWS47.actual-composed-before-and-narrow-memory-after-CAS.author.json');mi={x['purposeIndex']:x for x in m47['purposes']};plan='37374918-78c9-577f-9827-695d111ab22d';viewcas=[]
def strip_plan(o):
 if isinstance(o,list):return[strip_plan(x)for x in o if not(isinstance(x,dict)and x.get('goalId')==plan)]
 if isinstance(o,dict):return{k:strip_plan(v)for k,v in o.items()}
 return o
for p in purposes:
 m=mi[p['purposeIndex']];exact(p['wholeCurrentCandidate']);exact(m['beforeWholeCandidate']);exact(m['afterWholeCandidate']);current=rd(p['wholeCurrentCandidate']['path']);mb=rd(m['beforeWholeCandidate']['path']);ma=rd(m['afterWholeCandidate']['path']);assert p['viewId']==m['viewId']and p['scope']==m['scope'];oldpin=p['wholeCurrentCandidate'];current_matches_original=current==mb;allowedSource2Overlap=p['purposeIndex']in[40,44]
 if not current_matches_original:assert allowedSource2Overlap and strip_plan(current)==mb,('non-disjoint view overlap',p['purposeIndex'])
 composed=copy.deepcopy(current);added=[]
 if m['changed']:
  assert ma['rootNodes'][:len(mb['rootNodes'])]==mb['rootNodes'];assert{k:v for k,v in ma.items()if k!='rootNodes'}=={k:v for k,v in mb.items()if k!='rootNodes'};added=ma['rootNodes'][len(mb['rootNodes']):];assert len(added)==1
  existingRootIDs={x.get('id')for x in current['rootNodes']};assert all(x.get('id')not in existingRootIDs for x in added);composed['rootNodes'].extend(copy.deepcopy(added));assert composed['rootNodes'][:-len(added)]==current['rootNodes'];assert strip_plan(composed)==ma if allowedSource2Overlap else composed==ma
  p['wholeCurrentCandidate']=save(pathlib.Path('candidate/views')/(str(p['purposeIndex']).zfill(2)+'-'+p['viewId']+'.source2-plus-narrow-memory.neutral.json'),composed)
 p['beforeMemoryWholeCurrent587View']=oldpin;p['memorySixExplicitEntriesAdded']=bool(added)
 viewcas.append({'purposeIndex':p['purposeIndex'],'viewId':p['viewId'],'scope':p['scope'],'wholeCurrent587Before':oldpin,'originalMemoryAuthorWholeBefore586':m['beforeWholeCandidate'],'originalMemoryAuthorWholeAfter586':m['afterWholeCandidate'],'wholeComposedAfter':p['wholeCurrentCandidate'],'originalWholeBeforeGuardMatches':current_matches_original,'guardedSource2OnlyPlanOverlap':allowedSource2Overlap and not current_matches_original,'onlyDisjointNewWholeRootEntriesAppended':True,'wholeAddedRootNodes':added,'wholeAddedNewMemoryGoalIds':m['addedNewMemoryGoalIds'],'allOldWholeEntriesAndOrderExactlyPreserved':True,'wholeSource2PlanningReferencesAndOrderRetained':True,'newMemoryOrCourseScienceApproval':False})
assert sum(x['memorySixExplicitEntriesAdded']for x in purposes)==25
vp=save(pathlib.Path('VIEWS47.whole-current593-selection.587-source2-preserved-plus25-memory-additions.neutral.json'),{'role':'Whole current587 purposes with only exact25 disjoint Memory entry append operations; original old586 Memory after files never copied over Source2 after views','purposes':purposes,'unchangedPurposes':22,'changedPurposes':25,'priorSource2ViewSelection':pin(P/'VIEWS47.latest-whole-composed-purposes.with-two-explicit-BY-LK-plan-references.neutral.json'),'newMemoryOrCourseApprovals':0,'QSOrSourcebooksNotAcquisitionEvidence':True})
save(pathlib.Path('CAS.views25.exact-before-guards-disjoint-entry-additions-and-whole-after-pins.neutral.json'),{'records':viewcas,'source2WholeCurrentViewBodiesRetained':True,'onlyCurrent587vsOriginal586WholeBeforeDifferencesWereTwoKnownBYLKPlanReferences':True,'noOldWholeMemoryAfterSnapshotOverwrittenOntoCurrentView':True})
# Select14 full portable copies:12 unchanged author files and2 corrected organic files from root v2.
pairs=copy.deepcopy(rd(M/'DECKS7.identical-source-public-whole-after-pairs.author.json')['pairs']);d2=rd(D/'OUTPUTS.finite-primary-definition-targeted-author-successor.selector.json');organic='de_gymnasium_chemistry_organic_q1'
for p in pairs:
 exact(p['sourceAfter']);exact(p['publicAfter']);oldSource=copy.deepcopy(p['sourceAfter']);oldPublic=copy.deepcopy(p['publicAfter'])
 if p['deckId']==organic:
  bykind={('source'if'/source/'in x['afterWholeDeck']['path']else'public'):x for x in d2['twoWholeReplacementDecks']};assert bykind['source']['beforeWholeDeck']==p['sourceAfter']and bykind['public']['beforeWholeDeck']==p['publicAfter'];p['sourceAfter']=bykind['source']['afterWholeDeck'];p['publicAfter']=bykind['public']['afterWholeDeck'];p['definitionV2AuthorSuccessor']=pin(D/'OUTPUTS.finite-primary-definition-targeted-author-successor.selector.json')
 exact(p['sourceAfter']);exact(p['publicAfter']);assert(R/p['sourceAfter']['path']).read_bytes()==(R/p['publicAfter']['path']).read_bytes();p['previousMemoryAuthorSourceAfter']=oldSource;p['previousMemoryAuthorPublicAfter']=oldPublic;p['byteIdentical']=True;p['independentApprovalGrantedHere']=False
sel=save(pathlib.Path('DECKS7.whole77-source-public-selection.root-card-v2-plus-other12-exact.neutral.json'),{'role':'Finite14 whole portable file selection only. All77cards are candidates pending independent current approvals; no self-approval by original Memory author.','pairs':pairs,'totalWholeFiles':len(pairs)*2,'sourcePublicPairsByteIdentical':True,'rootOrganicWholeDeckCopies':2,'otherTwelveWholeFilesExactlyFromSealedAuthor':True,'oldActualPrimaryCards':75,'prospectivePrimaryCards':sum(len(rd(p['sourceAfter']['path'])['cards'])for p in pairs),'newDefinitionCards':2,'old15MemorySelectionsMustRemainExact':True,'newMemoryOrCardApprovals':0})
# Keep drafts explicitly open. The one changed definition's old open fingerprint is history, not current binding.
ms=rd(M/'M6.whole-goal-and-open-normal-record-candidates.author.json');cs=rd(M/'CARDS7.whole-prior-records-and-open-origin-successors.author.json');cards={(p['deckId'],c['id']):c for p in pairs for c in rd(p['sourceAfter']['path'])['cards']}
for row in cs['rows']:
 c=cards[(row['afterAuthorCandidate']['deckId'],row['afterAuthorCandidate']['cardId'])]
 if c!=row['wholeCardAfter']:row['originalOpenCardBeforeRootV2']=row['wholeCardAfter'];row['originalOpenFingerprintBeforeRootV2']=row['afterAuthorCandidate']['fingerprint'];row['wholeCardAfter']=c;row['openFingerprintSupersededRequiresMechanicalRebinding']=True
 assert row['afterAuthorCandidate']['status']=='needs_developer_review'
for row in ms['rows']:assert row['normalRecordCandidate']['status']=='needs_developer_review';assert next(x for x in after['goals']if x['id']==row['goalId']if'goalId'in row)==row['wholeGoal']if'goalId'in row else True
save(pathlib.Path('M6.exact-whole-open-author-designs.no-self-approval.neutral.json'),ms);save(pathlib.Path('CARDS7.whole-open-author-designs.root-definition-v2-no-self-approval.neutral.json'),cs)
# Existing whole latest Source12 is retained only by reference, no source/body/status/header changes.
sourcepin=pin(P/'SOURCE12.latest-whole-file-selection.with-Source2-object-merge.neutral.json');sources=rd(sourcepin['path'])
for f in sources['files']:exact(f['wholeAfterCandidate'])
save(pathlib.Path('SOURCE12.exact-unchanged-whole-selection.pointer.json'),{'wholeLatestSource12':sourcepin,'all12WholeAfterPinsExact':True,'newSourceOrMappingChanges':0,'allSource2HoldsUnchanged':True})
# Bounded actual schema, DAG, ID and count checks.
Draft202012Validator(rd('docs/landscape-runtime.schema.json')).validate(after);vval=Draft202012Validator(rd('contracts/curriculum-package/v1/composition-view.schema.json'))
for p in purposes:vval.validate(rd(p['wholeCurrentCandidate']['path']))
for edge in['requires','contains']:
 seen=set();visiting=set()
 def visit(i):
  assert i in g,('dangling',edge,i)
  if i in seen:return
  assert i not in visiting,('cycle',edge,i);visiting.add(i)
  for q in g[i].get(edge,[]):visit(q)
  visiting.remove(i);seen.add(i)
 for i in g:visit(i)
actualMem=[x for x in g.values()if x.get('nodeKind')=='memory'];assert len(actualMem)==21;count=rd(P/'COUNTS.actual-node-and-prospective-kind-counts.no-semantic-writes.json');k=copy.deepcopy(count['prospectiveKindsIfExistingSupportedProposalsAreActuallyIntegrated']);k['memory']+=len(nodes);assert sum(k.values())==len(after['goals']);assert k['curricularAtomic']==435
save(pathlib.Path('COUNTS.actual593-whole-and-prospective435ordinary21memory.no-normal-votes.json'),{'actualWholeBefore':len(before['goals']),'actualWholeAfter':len(after['goals']),'actualWholeAddedMemoryNodes':len(nodes),'all587ExistingWholeBodiesAndOrderExact':True,'actualMemoryNodes':len(actualMem),'prospectiveCurrentKindCountsIfSupportedProposalsIntegrated':k,'currentActiveNormalCurricularAtomic':429,'prospectiveCurricularAtomicUnchanged':435,'normalKindOrMemoryOrCardVotesWritten':0,'strictCompletionGain':0})
save(pathlib.Path('CHECK.bounded-whole593-schema-DAG-view-schema-and-retention.json'),{'status':'PASS bounded technical only; original Memory author issues no science approval','wholeNodesActuallyCounted':len(after['goals']),'wholeMemoryNodesActuallyCounted':len(actualMem),'wholeRuntimeLandscapeSchema':pin(pathlib.Path('docs/landscape-runtime.schema.json')),'wholeViewSchema':pin(pathlib.Path('contracts/curriculum-package/v1/composition-view.schema.json')),'wholeViewPurposesSchemaValidated':len(purposes),'requiresAndContainsDAGPass':True,'allExisting587WholeBodiesAndOrderExact':True,'whole25ViewAdditionsExactAndDisjoint':True,'wholeSource2PlanAndEveryPriorSourceCorrectionExact':True,'wholeSource12SelectedPinsUnchanged':True,'noOlderWholeViewSnapshotCopiedOverCurrentSource2':True,'newSelfApprovalVotes':0,'HNormalAliasWrites':0,'fullBuildOrCentralCheckExecuted':False,'HumanApproval':False,'HumanTrial':False})
save(pathlib.Path('INPUTS.upstream-whole-selectors-and-portable-rebuild-pointers.json'),{'selectors':inputs,'whole587Base':pin(basep),'whole593Candidate':cp,'wholeSixAuthorMemoryNodes':pin(M/'MEMORY6.six-whole-new-subset-node-candidates.author.json'),'whole47MemoryAuthorViews':pin(M/'VIEWS47.actual-composed-before-and-narrow-memory-after-CAS.author.json'),'wholeLatestSource12Unchanged':sourcepin,'wholeMemory77SourcePublicFileSelection':sel,'wholeCurrent47Views':vp,'independentBFirstReferenceOnlyNotSelfInterpreted':d2['originalIndependentFIRST'],'independentCardInformedFollowup':'separately supplied by another reviewer; not self-approved here','allFinalWholeRebuildInputsArePortableRepositoryRelativeFiles':True,'source2And593ScientificStatusesRemainInheritedOrOpen':True,'mobileImageSixFutureWholeAfterGoalResourceLinksMergeRequired':'separate owner; no current asset import or resource conflict resolved here'})
print(json.dumps({'nodes':len(after['goals']),'memoryNodes':len(actualMem),'ordinaryProspective':k['curricularAtomic'],'wholeMemoryEntriesChangedViews':25,'wholePurposes':len(purposes),'wholeDeckFiles':14,'primaryCards':len(cards),'canonical':cp,'noSelfApproval':True}))
