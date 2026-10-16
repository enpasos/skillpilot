import copy
import hashlib
import json
from collections import Counter, defaultdict
from pathlib import Path

R = Path(__file__).resolve().parents[7]
E = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16')
H = Path('tmp/chemie-m7-resumed-20261016/current578-one-sparse-own-host-v1')
M = E/'chemie-methods4-source-normalized-fields-targeted-author-successor-20261016-v2'
S = E/'chemie-split3-six-children-source-transfer-targeted-author-successor-20261016-v1'
O = E/'chemie-methods4-v2-split3-current578-inactive-composition-technical-20261016-v1'
C = E/'chemie-f0-supported-mobile-PNG-stock-import-and-normal-V-binding-technical-20261016-v1/CANONICAL.current578.same-five-texts-and-two-supported-mobile-images.json'
CP = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
V47 = E/'chemie-four-existing-memory-support-whole-view-placements-author-20261016-v2/VIEWS.current47.four-existing-memory-support-successors.author-selection.json'

def read(p): return json.loads((R/p).read_text())
def pin(p):
    b=(R/p).read_bytes()
    return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def stable(o): return 'sha256:'+hashlib.sha256(json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def write(p,o):
    p=O/p;(R/p).parent.mkdir(parents=True,exist_ok=True)
    (R/p).write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n')
    return pin(p)
def require(condition, message):
    if not condition: raise AssertionError(message)

input_paths=[C,V47,M/'OUTPUTS.targeted-normalized-fields-author-v2.seal.json',
 E/'chemie-methods4-targeted-normalized-fields-v2-original-independent-informed-followup-20261016-v1/OUTPUTS.finite-additive-v2-informed-normalized-source-selector.json',
 S/'OUTPUTS.targeted-split3-source-transfer-author-handoff.seal.json',
 E/'chemie-split3-targeted-author-successor-original-independent-informed-followup-20261016-v1/OUTPUTS.original-independent-informed-followup.selector.seal.json',
 M/'candidate/GOALS.one-whole-planar-CAS-two-source-grounded-new-atoms.author.json',
 M/'source/EXTRACTION.finite-whole-object-CAS.author.json',M/'source/MAPPING.finite-whole-object-CAS.author.json',
 M/'views/FOUR.whole-common-course-CAS-and-THREE.conditional-elective-proposals.author.json',
 S/'GOALS3.parents-CAS-and-SIX.whole-children.current709b.author.json',S/'SOURCE11.whole-mapping-and-decision-CAS.corrected.author.json',
 S/'HB-SOURCE2.goals-and-two-whole-primary-passages-CAS.author.json',S/'VIEWS25.whole-scoped-view-CAS.retained.author.json',
 S/'ASSESSMENT.bus-whole-CAS-and-retained-capstone-HOLD.author.json',
 M/'materials/SEVENTEEN.whole-bilingual-retained-and-targeted-method-cases.author.json',
 M/'profiles/SIX.whole-positive-v2-author-designs-no-independent-votes.json',
 S/'MATERIALS12.complete-whole-DE-EN-cases.corrected.author.json',S/'P6.complete-child-positive-understanding-v2.corrected.author.json',
 M/'consolidation/413.whole-duplicate-to-protected94-science-proposal.author.json',
 Path('contracts/curriculum-package/v1/migration-aliases.schema.json'),Path('docs/concept/skill-graph/dual-curriculum-package-releases.md')]
initial_pins={str(p):pin(p) for p in input_paths}
host_initial={}
def host(normal):
    p=H/normal
    host_initial.setdefault(str(p),pin(p))
    return read(p)

master=read(C)
require(pin(C)['sha256']=='sha256:1e515c907de34430525512da2faa5b7657dd1b12feda338cfb0b8455dc50353f','Wrong current master')
require((R/C).read_bytes()==(R/H/CP).read_bytes(),'H/master mismatch')
host(CP)
candidate=copy.deepcopy(master)
base={g['id']:g for g in master['goals']}
goals={g['id']:g for g in candidate['goals']}
sp=read(S/'GOALS3.parents-CAS-and-SIX.whole-children.current709b.author.json')
mp=read(M/'candidate/GOALS.one-whole-planar-CAS-two-source-grounded-new-atoms.author.json')
ap=read(S/'ASSESSMENT.bus-whole-CAS-and-retained-capstone-HOLD.author.json')
whole_goal_cas=sp['wholeParentCAS']+mp['patches']+ap['wholeCAS']
changed=set()
for p in whole_goal_cas:
    gid=p['goalId']; require(goals[gid]==p['beforeWholeObject'],'goal CAS mismatch '+gid)
    changed.add(gid)
    candidate['goals'][next(i for i,g in enumerate(candidate['goals']) if g['id']==gid)]=copy.deepcopy(p['afterWholeObject'])
    goals[gid]=candidate['goals'][next(i for i,g in enumerate(candidate['goals']) if g['id']==gid)]
new_goals=sp['wholeNewGoals']+mp['newWholeGoals']
new_ids={g['id'] for g in new_goals}
require(len(new_ids)==8 and not new_ids.intersection(base),'new IDs collision')
candidate['goals']+=copy.deepcopy(new_goals)
goals={g['id']:g for g in candidate['goals']}
require(len(goals)==586,'whole graph denominator')
protected=['413c5ee5-7826-549f-ad76-63743c59b188','94a62b39-d4a2-5882-99d1-6886ead07726','14577339-9e0c-5b44-8e47-91e1a4947367','882630ba-815c-5c6b-868c-2e6cd7eef459','b7b5df21-78f3-5408-89f1-36deed450695']
for gid in protected:require(goals[gid]==base[gid],'protected target changed '+gid)
retained=[gid for gid in base if gid not in changed]
require(len(retained)==573 and all(goals[x]==base[x] for x in retained),'unrelated current goals changed')
canonical_pin=write(Path('candidate/CANONICAL.current586.composed-current578-whole-inactive.json'),candidate)
write(Path('GOALS.exact-five-before-after-eight-new-CAS.neutral.json'),{
 'role':'Technical composition of existing exact whole author objects; no new scientific votes or active write',
 'baseCanonical':pin(C),'correctNormalCanonicalPath':CP,
 'oldSplitWrapperMetadataCorrection':{'before':'curricula/DE/Gymnasium/canonical/DE_GYM_CHEMIE_CANONICAL.de.json','after':CP,'onlyNewManifestCorrected':True,'sealedPredecessorUnchanged':True},
 'wholeExistingGoalCAS':whole_goal_cas,'wholeNewGoals':new_goals,'protectedWholeGoals':[base[x] for x in protected]})

# Whole file candidates always begin with actual H, never an older whole R after-file.
files={};ops=defaultdict(list);owners={};occupied=set()
def file_state(normal,owner):
    if normal not in files:
        files[normal]={'before':host(normal),'after':host(normal)}
        files[normal]['after']=copy.deepcopy(files[normal]['before'])
        owners[normal]=[]
    if owner not in owners[normal]: owners[normal].append(owner)
    require((R/owner['path']).read_bytes()==(R/H/normal).read_bytes(),'portable current owner mismatch '+normal)
    return files[normal]['after']
def replace_one(normal,owner,key,before,after,origin):
    d=file_state(normal,owner);gid=before['id'];token=(normal,key,gid)
    require(token not in occupied,'overlapping object CAS '+str(token));occupied.add(token)
    ix=[i for i,v in enumerate(d[key]) if v.get('id')==gid]
    require(len(ix)==1 and d[key][ix[0]]==before,'whole source object mismatch '+str(token))
    d[key][ix[0]]=copy.deepcopy(after)
    ops[normal].append({'origin':origin,'listKey':key,'selector':{'id':gid},'beforeWholeObject':before,'afterWholeObject':after})
def replace_group(normal,owner,key,gid,before,after,origin):
    d=file_state(normal,owner);token=(normal,key,gid)
    require(token not in occupied,'overlapping mapping CAS '+str(token));occupied.add(token)
    field='sourceGoalId' if key=='decisions' else 'legacyGoalId'
    matches=[v for v in d[key] if v.get(field)==gid]
    require(matches==before,'whole mapping group mismatch '+str(token))
    indexes=[i for i,v in enumerate(d[key]) if v.get(field)==gid]
    require(indexes,'empty mapping group '+str(token));first=min(indexes)
    d[key]=[v for v in d[key] if v.get(field)!=gid]
    d[key][first:first]=copy.deepcopy(after)
    ops[normal].append({'origin':origin,'listKey':key,'selector':{field:gid},'beforeWholeObjects':before,'afterWholeObjects':after})
for f in read(M/'source/EXTRACTION.finite-whole-object-CAS.author.json')['files']:
    for p in f['patches']:replace_one(f['normalPath'],f['baseFile'],p['listKey'],p['beforeWholeObject'],p['afterWholeObject'],'Methods4-v2')
hb=read(S/'HB-SOURCE2.goals-and-two-whole-primary-passages-CAS.author.json')
for field,key in [('sourceGoalCAS','sourceGoals'),('passageCAS','sourcePassages')]:
    # Actual operative passage list is detected below, not assumed from a historical index.
    for p in hb[field]:
        normal=hb['normalSourceExtractionPath'];d=host(normal)
        if key not in d:
            keys=[k for k,v in d.items() if isinstance(v,list) and any(isinstance(x,dict) and x.get('id')==p['id'] for x in v)]
            require(len(keys)==1,'cannot locate HB whole passage list');actual_key=keys[0]
        else:actual_key=key
        replace_one(normal,hb['physicalInput'],actual_key,p['beforeWholeObject'],p['afterWholeObject'],'Split3')
for f in read(M/'source/MAPPING.finite-whole-object-CAS.author.json')['files']:
    for p in f['patches']:
        gid=p['selector']['legacyGoalId']
        replace_group(f['normalPath'],f['baseFile'],'mappings',gid,p['beforeWholeObjects'],p['afterWholeObjects'],'Methods4-v2')
        z=p['decisionWholeCAS']
        replace_group(f['normalPath'],f['baseFile'],'decisions',gid,z['beforeWholeObjects'],z['afterWholeObjects'],'Methods4-v2')
for p in read(S/'SOURCE11.whole-mapping-and-decision-CAS.corrected.author.json')['patches']:
    normal=p['normalMappingPath'];owner=p['currentWholeMappingFilePin']['physicalRepositorySource'];gid=p['sourceGoalId']
    replace_group(normal,owner,'mappings',gid,p['beforeWholeSourceMappings'],p['afterWholeSourceMappings'],'Split3')
    replace_group(normal,owner,'decisions',gid,[p['beforeWholeDecision']],[p['afterWholeDecision']],'Split3')
source_manifest=[]
for i,(normal,d) in enumerate(sorted(files.items())):
    after=d['after'];summary_delta=None
    # Summaries are historical source-goal-level counters, not mapping-edge counters.
    # Preserve them instead of inventing review status from a mechanical object replay.
    if 'summary' in after:
        summary_delta={'preservedWholeSummary':after['summary'],'recalculationOrSourceStatusApprovalNotPerformed':True,
                       'reason':'Per-source exact/partial classifications need the independent source selection rules; no whole-source approval inferred.'}
    out=write(Path(f'candidate/source/{i:02d}-{Path(normal).name}'),after)
    # Only specified lists/objects may change; all unrelated list elements and all non-list headers stay exact.
    touched=defaultdict(set)
    for p in ops[normal]:
        selector=p['selector'];field=next(iter(selector));touched[p['listKey']].add((field,selector[field]))
    for key,values in d['before'].items():
        if key not in touched: require(after[key]==values,'unrelated file field changed '+normal+'/'+key)
        else:
            predicates=touched[key]
            unrelated=lambda xs:[x for x in xs if not any(x.get(k)==v for k,v in predicates)]
            require(unrelated(values)==unrelated(after[key]),'unrelated list bodies changed '+normal+'/'+key)
    source_manifest.append({'normalPath':normal,'actualHostWholeBefore':pin(H/normal),'portableExactWholeBeforeOwners':owners[normal],
      'wholeAfterCandidate':out,'wholeBeforeAfterOperations':ops[normal],
      'differentPackageWholeFileOverlap':len({p['origin'] for p in ops[normal]})>1,
      'overlappingTouchedObjectKeys':[],'unrelatedWholeObjectsAndHeadersRetainedExactly':True,
      'historicalSummaryBoundary':summary_delta,'inactive':True})
write(Path('SOURCE12.whole-current-file-candidates-CAS-and-overlap.neutral.json'),{
 'role':'Whole extraction/mapping file candidates composed from actual H using 76 nonoverlapping whole list-object/group CAS operations; no source approval or active adoption',
 'files':source_manifest,'objectOperationCount':sum(map(len,ops.values())),
 'oldWholeAfterSnapshotsNotCopied':True,'sourceAtlasMustBeRegeneratedAndCheckedBeforeAdoption':True})

# Views: replay Split3 exact whole bodies, then Methods4 finite append nodes.
mv=read(M/'views/FOUR.whole-common-course-CAS-and-THREE.conditional-elective-proposals.author.json')
sv=read(S/'VIEWS25.whole-scoped-view-CAS.retained.author.json')
views={};view_before={};view_ops=defaultdict(list);view_owner={}
for p in sv['patches']:
    normal=p['normalViewPath'];b=host(normal)
    require(b==p['beforeWholeView'],'Split view current CAS mismatch '+normal)
    views[normal]=copy.deepcopy(p['afterWholeView']);view_before[normal]=b
    view_owner[normal]=p['currentWholeViewFilePin']['physicalRepositorySource']
    require((R/view_owner[normal]['path']).read_bytes()==(R/H/normal).read_bytes(),'Split portable view pin mismatch')
    view_ops[normal].append({'origin':'Split3','scopedChanges':p.get('scopedChanges'),'beforeWholeViewStable':stable(b),'afterWholeViewStable':stable(views[normal])})
def get_pointer(obj,pointer):
    for a in pointer.strip('/').split('/'):
        obj=obj[int(a)] if isinstance(obj,list) else obj[a.replace('~1','/').replace('~0','~')]
    return obj
for j,p in enumerate(mv['safeSourceGroundedCommonCourseCAS']):
    normal=p['normalViewPath'];b=host(normal)
    require(b==p['beforeWholeView'],'Methods view current CAS mismatch '+normal)
    if normal not in views:
        views[normal]=copy.deepcopy(b);view_before[normal]=b
        view_owner[normal]={'path':str(M/'views/FOUR.whole-common-course-CAS-and-THREE.conditional-elective-proposals.author.json'),
                            'jsonPointer':f'/safeSourceGroundedCommonCourseCAS/{j}/beforeWholeView','stableWholeObjectSha256':stable(b)}
    for op in p['finiteViewOperations']:
        arr=get_pointer(views[normal],op['pointer']);require(len(arr)==op['beforeArrayLength'],'Methods append position overlap')
        arr.append(copy.deepcopy(op['afterWholeNode']))
    view_ops[normal].append({'origin':'Methods4-v2','operations':p['finiteViewOperations'],'rationale':p['rationale']})
require(len(views)==26,'joint view count')
view_manifest=[];view_output={}
for i,(normal,v) in enumerate(sorted(views.items())):
    out=write(Path(f'candidate/views/{Path(normal).name}'),v);view_output[normal]=out
    view_manifest.append({'normalViewPath':normal,'viewId':v['viewId'],'scope':v['scope'],'actualHostWholeBefore':pin(H/normal),
       'portableWholeBeforeOwner':view_owner[normal],'wholeAfterCandidate':out,'wholeBeforeView':view_before[normal],
       'finiteCompositionOperations':view_ops[normal],'wholeCountryCourseApproval':False,'inactive':True})
write(Path('VIEWS26.whole-composed-current-CAS-and-delta.neutral.json'),{'role':'25 exact Split3 whole view successors plus four bounded Methods additions; union26 actual course views, not a course approval',
 'views':view_manifest,'sameBaselineWholeViewOverwriteAvoided':True,'conditionalElectivesNotApplied':True,'413RemovalNotApplied':True})
conditional=[]
for p in mv['conditionalElectiveOnlyProposals']:
    normal=p['normalViewPath'];b=p['beforeWholeView'];a=p['afterWholeView']
    require(b==host(normal),'conditional before mismatch')
    require(a['rootNodes'][0]['children'][:-1]==b['rootNodes'][0]['children'],'nonappend conditional delta')
    v=copy.deepcopy(views[normal]);v['rootNodes'][0]['children'].append(copy.deepcopy(a['rootNodes'][0]['children'][-1]))
    # The author addition is the entire only change, not a reinterpretation of selected-module runtime semantics.
    out=write(Path(f'candidate/conditional-views/{Path(normal).name}'),v)
    conditional.append({'normalViewPath':normal,'jointUnconditionalBefore':view_output[normal],'wholeConditionalCandidate':out,
       'requiredSelectionEvidence':p['requiredSelectionEvidence'],'safeForUnconditionalReplay':False,'inactive':True})
write(Path('VIEWS3.conditional-elective-only-composed-proposals.HOLD.json'),{'role':'Separate complete author variants only; actual authoritative selected electives remain required','variants':conditional})

# Current47 are 47 distinct purposes, including sourcebooks/QS: not 47 independent course approvals.
purposes=[]
for i,p in enumerate(read(V47)['views']):
    present=[a for a in p['normalAliases'] if (R/H/a).is_file()]
    if present:
        normal=present[0];b=host(normal)
        for a in present:
            require(host(a)==b,'current aliases disagree in whole body '+str(present))
        require(b['viewId']==p['viewId'] and b['scope']==p['scope'],'view purpose identity mismatch')
        selected=view_output.get(normal)
        if not selected:selected=write(Path(f'candidate/purpose-retained/{i:02d}-{Path(normal).name}'),b)
        prior=read(p['wholeSelectedAuthorView']['path'])
        source=pin(H/normal)
        status='actual-H-whole-body-prioritized'
        historical_equal=(prior==b)
    else:
        b=read(p['wholeSelectedAuthorView']['path']);source=pin(p['wholeSelectedAuthorView']['path'])
        require(b['viewId']==p['viewId'] and b['scope']==p['scope'],'extra purpose identity mismatch')
        selected=write(Path(f'candidate/purpose-retained/{i:02d}-{Path(source["path"]).name}'),b)
        status='latest-pinned-standalone-whole-purpose-retained-no-current-H-alias';historical_equal=True
    purposes.append({'purposeIndex':i,'viewId':p['viewId'],'scope':p['scope'],'classification':p['classification'],
      'normalAliases':p['normalAliases'],'actualInput':source,'wholeCurrentCandidate':selected,'selectionPolicy':status,
      'sameWholeBodyAsPrior47SelectedAuthor':historical_equal,'newScopeApproval':False,
      'sourceBookOrQSNotAcquisitionProof':p['classification']!='common45-alias-group'})
require(len(purposes)==47,'47 purpose count')
write(Path('VIEWS47.actual-H-prioritized-purpose-inventory.neutral.json'),{
 'role':'47 existing view purposes (course views, sourcebooks and QS), with current H prioritized over historical576 whole bodies; no global review or new scope approval',
 'priorPurposeSelection':pin(V47),'purposes':purposes,'courseViewsActuallyChanged':26,
 'standalonePurposesWithoutHAlias':7,'memory6SuccessorNotComposed':True,
 'sourceBookViewRegenerationAndNewChildPlacementStillRequiredWhereApplicable':True})

cases1=read(M/'materials/SEVENTEEN.whole-bilingual-retained-and-targeted-method-cases.author.json')['cases']
cases2=read(S/'MATERIALS12.complete-whole-DE-EN-cases.corrected.author.json')['cases']
rows1=read(M/'profiles/SIX.whole-positive-v2-author-designs-no-independent-votes.json')['rows']
rows2=read(S/'P6.complete-child-positive-understanding-v2.corrected.author.json')['rows']
require(len(cases1)==17 and len(cases2)==12 and len(rows1)==len(rows2)==6,'case/profile count')
write(Path('MATERIALS29.exact-whole-bilingual-author-cases.neutral.json'),{'role':'Exact concatenation of two immutable author case collections; design only, not observations or science votes','cases':cases1+cases2})
write(Path('PROFILES12.exact-whole-positive-v2-author-designs.neutral.json'),{'role':'Exact author designs; E0/G0, no learner observations, no new P reviews, historical413 design retained pending actual migration','rows':rows1+rows2})

# Current semantic decisions are input only. This projection is conditional arithmetic, not a new ledger.
sem_path=Path('curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json')
sem=host(sem_path)
sem_rows=sem.get('goals',sem.get('decisions',[]))
if isinstance(sem_rows,dict):sem_rows=list(sem_rows.values())
kind_counts=Counter(x.get('semanticKind',x.get('kind')) for x in sem_rows)
write(Path('DENOMINATOR.current-and-prospective-no-normal-semantic-votes.json'),{
 'currentWholeGoalCount':578,'currentCurricularAtomicCount':429,'expectedWholeGoalCount':586,
 'expectedCurricularAtomicCountIfSupportedKindProposalsAreIntegrated':434,
 'arithmetic':{'sixSplitNewAtoms':6,'twoMethodsNewAtoms':2,'threeFormerAtomicParentsBecomeAreas':-3,'netAtomicDelta':5},
 'wholeNewGoalIds':sorted(new_ids),'parentKindAuthorProposalsRetained':sp['authorSemanticKindProposals'],
 'normalSemanticInput':pin(H/sem_path),'currentKindCountsReadOnly':dict(kind_counts),
 'normalSemanticDecisionWrites':0,'technicalCompositionStrictGateGain':0,
 'newChildrenNotCountedAsM7WithoutActualCurrentD_P_A_M_V':True,'413RetirementNotApplied':True})
write(Path('HOLDS.migration-source-course-and-integration.boundaries.json'),{
 '413':{'status':'HOLD_actual_consolidation_not_applied','whole413And94AndGlobal145Retained':True,
   'supportedScientificProposal':pin(M/'consolidation/413.whole-duplicate-to-protected94-science-proposal.author.json'),
   'unmetConcreteMigrationConditions':['actual release-bound migration artifact with valid source/target release IDs and standard manifest digests','replacedBy 413 -> already-existing94 plus reassessment and preserve-with-successor-links history','all source/placement/practice/historicalID retention and actual visibility checks','independent reviewed migration conditions before normal adoption'],
   'noAutomaticMasteryCopy':True,'schema':pin(Path('contracts/curriculum-package/v1/migration-aliases.schema.json'))},
 'otherHolds':['RP2.3 selected elective evidence','SN selected elective GC evidence','b7 actual NI-LK selected enrichment boundary','BY GC/HPLC ggf boundary','274-prerequisite global145 independent whole duties/assessment coverage','bus31a630bc assesses partial duties only, no full precursor mastery inference','new child Memory/card/origin/view bindings pending separate author and independent review','new child images and actual normal V approval','new semantics and normal D/P/A/M/V bindings and source-atlas regeneration','retained standalone sourcebook/QS whole views need changed-child visibility/source-scope checking'],
 'unchangedHistoricalSummariesNotFreshSourceApproval':True,'noM7Claim':True,'HumanApproval':False,'HumanTrial':False})

# Graph integrity and exact untouched-body retention are technical checks only.
def cycle_check(edge):
    states={};stack=[]
    def visit(gid):
        if states.get(gid)==1:raise AssertionError(edge+' cycle '+str(stack+[gid]))
        if states.get(gid)==2:return
        states[gid]=1;stack.append(gid)
        for other in goals[gid].get(edge,[]):
            require(other in goals,'dangling '+edge+' '+other);visit(other)
        stack.pop();states[gid]=2
    for gid in goals:visit(gid)
for edge in ['contains','requires']:cycle_check(edge)
def transitive_requires(gid):
    seen=set();todo=list(goals[gid].get('requires',[]))
    while todo:
        x=todo.pop()
        if x in seen:continue
        seen.add(x);todo+=goals[x].get('requires',[])
    return seen
bus='31a630bc-ee86-5316-8ce5-e522b14fd607'
require(not (new_ids & transitive_requires(bus)),'bus acquired a new child gate')
global_id='14577339-9e0c-5b44-8e47-91e1a4947367'
require(len(goals[global_id]['requires'])==274,'global capstone unexpectedly changed')
for p,v in initial_pins.items():require(pin(Path(p))==v,'immutable input modified '+p)
for p,v in host_initial.items():require(pin(Path(p))==v,'H input modified '+p)
checks={'status':'PASS_technical_only','containsDAG':True,'requiresDAG':True,'allReferencesResolve':True,
 'wholeExistingGoalsRetainedExact':573,'existingWholeGoalsChangedExactly':sorted(changed),
 'newWholeGoalsExact':8,'wholeSourceCandidateFiles':len(source_manifest),'wholeSourceCASOperations':sum(map(len,ops.values())),
 'wholeComposedCourseViews':26,'wholeViewPurposes':47,'conditionalVariants':3,
 'allInputAndHostReadPinsUnchangedAtEnd':True,'sourceObjectOverlapConflicts':0,'busDoesNotRequireAnyNewChild':True,
 'global145WholeExactAndRequires274':True,'wholeProtected413And94Exact':True,
 'caseObjectsExactRetained':29,'profileRowsExactRetained':12,'fullScienceVotes':0,'activeWrites':0}
write(Path('CHECKS.python-current-whole-CAS-retention-and-DAG.actual.json'),checks)
write(Path('INPUTS.current-portable-and-actual-H-read-pins.json'),{'immutableInputs':list(initial_pins.values()),'actualHReadInputs':list(host_initial.values()),'noHostMutation':True})
print(json.dumps({'outputRoot':str(O),'canonical':canonical_pin,'checks':checks},ensure_ascii=False))
