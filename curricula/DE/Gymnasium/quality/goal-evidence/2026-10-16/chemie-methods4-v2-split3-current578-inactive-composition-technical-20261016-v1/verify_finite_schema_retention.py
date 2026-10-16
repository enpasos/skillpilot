"""Bounded technical checks; no scientific approval or normal-host writes."""
import hashlib
import json
from collections import defaultdict, deque
from pathlib import Path

from jsonschema import Draft202012Validator

R=Path(__file__).resolve().parents[7]
O=Path(__file__).resolve().parent
def read(p):return json.loads((R/p).read_text())
def pin(p):
    p=Path(p);b=(R/p).read_bytes()
    return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def save(name,obj):(O/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
def rel(p):return p.relative_to(R)
def require(v,message):
    if not v:raise AssertionError(message)

manifest=read(rel(O/'GOALS.exact-five-before-after-eight-new-CAS.neutral.json'))
before=read(manifest['baseCanonical']['path'])
canonical=read(rel(O/'candidate/CANONICAL.current586.composed-current578-whole-inactive.json'))
old={g['id']:g for g in before['goals']};new={g['id']:g for g in canonical['goals']}
schema=Path('docs/landscape-runtime.schema.json')
Draft202012Validator(read(schema)).validate(canonical)
vschema=Path('contracts/curriculum-package/v1/composition-view.schema.json')
vvalidator=Draft202012Validator(read(vschema))
purposes=read(rel(O/'VIEWS47.actual-H-prioritized-purpose-inventory.neutral.json'))['purposes']
for p in purposes:vvalidator.validate(read(p['wholeCurrentCandidate']['path']))
conditional=read(rel(O/'VIEWS3.conditional-elective-only-composed-proposals.HOLD.json'))['variants']
for p in conditional:vvalidator.validate(read(p['wholeConditionalCandidate']['path']))

file_manifest=read(rel(O/'SOURCE12.whole-current-file-candidates-CAS-and-overlap.neutral.json'))['files']
mapping_partner_changes=[];changed_source_ids=set();source_goal_partner_ids=set()
for f in file_manifest:
    d=read(f['wholeAfterCandidate']['path'])
    if 'mappings' not in d:continue
    for op in f['wholeBeforeAfterOperations']:
        if op['listKey']!='mappings':continue
        gid=op['selector']['legacyGoalId'];changed_source_ids.add(gid)
        edges=op['afterWholeObjects']
        require(all(x['canonicalGoalId'] in new for x in edges),'dangling canonical source edge '+gid)
        decision=[x for x in d['decisions'] if x.get('sourceGoalId')==gid]
        require(len(decision)==1,'nonunique corresponding decision '+gid)
        require(set(decision[0]['canonicalGoalIds'])=={x['canonicalGoalId'] for x in edges},'mapping/decision union differs '+gid)
        before_ids={x['canonicalGoalId'] for x in op['beforeWholeObjects']}
        after_ids={x['canonicalGoalId'] for x in edges}
        source_goal_partner_ids|=before_ids|after_ids
        mapping_partner_changes.append({'normalPath':f['normalPath'],'sourceGoalId':gid,
          'beforePartnerGoalIds':sorted(before_ids),'afterPartnerGoalIds':sorted(after_ids),
          'mappingDecisionUnionExact':True,'newScientificJudgement':False})

changed={x['goalId'] for x in manifest['wholeExistingGoalCAS']}
new_ids={x['id'] for x in manifest['wholeNewGoals']}
direct=changed|new_ids
reverse=defaultdict(set)
for g in canonical['goals']:
    for edge in ['contains','requires']:
        for other in g.get(edge,[]):reverse[other].add(g['id'])
affected=set(direct);todo=deque(sorted(direct))
while todo:
    gid=todo.popleft()
    for x in reverse[gid]:
        if x not in affected:affected.add(x);todo.append(x)
save('AFFECTED.actual-whole-goal-and-source-partner-closure.neutral.json',{
 'role':'Technical reverse contains/requires reachability is review routing only, not an assertion that every reachable unchanged goal requires a fresh science review',
 'directWholeGoalIds':sorted(direct),'reverseContainsOrRequiresAffectedGoalIds':sorted(affected),
 'changedMappingSourceGoalIds':sorted(changed_source_ids),'wholeBeforeAfterSourcePartnerGoalIds':sorted(source_goal_partner_ids),
 'sourcePartnerChanges':mapping_partner_changes,'recheckOnlyActualChangedGoalPageSourceContextBindings':True})

native_root=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-five-native11-supported-texts-current578-informed-bindings-technical-20261016-v1')
op=read(native_root/'OPERATIONS.actual-five-current-text-bindings.no-new-scientific-vote.json')
for gid in op['changedGoalIds']:
    require(new[gid]==old[gid],'latest supported text goal overwritten '+gid)
# The complete709b current landscape provides a portable baseline for every supported text.
native=read(native_root/'CANONICAL.current578.five-scientifically-supported-native11-text-successors.json')
native_goals={g['id']:g for g in native['goals']}
all_native_current_changed=[gid for gid in old if native_goals[gid]!=old[gid]]
require(set(all_native_current_changed)=={'fec1563e-a34a-5fc1-93bb-03981f35ab13','f0ba30a8-84b3-5915-bf85-6c3a176064d2'},'709b/current image delta unexpected')
for gid in all_native_current_changed:require(new[gid]==old[gid],'supported mobile image goal changed')
for gid in old:
    if gid not in changed:require(new[gid]==old[gid],'unrelated goal changed '+gid)

pins=read(rel(O/'INPUTS.current-portable-and-actual-H-read-pins.json'))
for p in pins['immutableInputs']+pins['actualHReadInputs']:
    require(pin(p['path'])==p,'read-only input drift '+p['path'])
save('PURPOSES47.precise-QS-sourcebook-classification.additive-clarification.json',{
 'role':'Precise purpose classification; the coarse sourceBookOrQSNotAcquisitionProof flag in the untouched47 inventory must not be used as a classification rule',
 'inventoryUnchanged':pin(rel(O/'VIEWS47.actual-H-prioritized-purpose-inventory.neutral.json')),
 'acquisitionCandidatePurposeIndices':list(range(37))+[40,46],
 'nonAcquisitionPurposeIndices':[37,38,39,41,42,43,44,45],
 'details':{'37':'inactive source-atlas navigation, not a complete course','38':'sourcebook','39':'full426 QS-purpose, not a learner acquisition view',
            '40':'additional prospective BY CrossStage acquisition view, not a sourcebook or active acceptance',
            '41-45':'sourcebooks; outside prerequisites and shown content do not establish complete acquisition','46':'prospective BY unit acquisition view'},
 'newCourseOrSelectionApproval':False,'normalScopeSemanticsChanged':False})
save('CHECKS.finite-schema-source-union-and-current-preservation.actual.json',{
 'status':'PASS_bounded_technical_only','runtimeLandscapeSchema':pin(schema),'wholeGoalCount':len(new),
 'compositionViewSchema':pin(vschema),'wholeViewPurposesValidated':len(purposes),'conditionalWholeViewVariantsValidated':len(conditional),
 'changedMappingSourceGoalsChecked':len(changed_source_ids),'mappingDecisionWholePartnerUnionsMatch':True,
 'supportedCurrentTwoImageGoalBodiesExact':all_native_current_changed,'other573CurrentWholeGoalBodiesExact':True,
 'supportedLatestFiveWholeTextGoalBodiesExact':op['changedGoalIds'],
 'allReadOnlyInputPinsStillExact':True,'newScientificVotes':0,'normalSemanticWrites':0,
 'sourceAtlasRegenerationAndNormalQAStillRequired':True,'HumanApproval':False,'HumanTrial':False})
print(json.dumps({'status':'PASS bounded technical schema, source-union and retention checks','wholeGoals':len(new),'viewPurposes':47,'conditionalVariants':3,'changedMappingSources':len(changed_source_ids),'routingAffectedGoalIds':len(affected)}))
