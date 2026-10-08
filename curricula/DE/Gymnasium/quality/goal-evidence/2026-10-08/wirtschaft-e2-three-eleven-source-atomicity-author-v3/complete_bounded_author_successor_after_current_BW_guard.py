"""Immutable inert BY source-component successor; no live authority or counting."""
from pathlib import Path
import json,copy,hashlib,datetime
ROOT=Path('/home/enpasos/projects/skillpilot')
BASE=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08'
OLD=BASE/'wirtschaft-e2-three-twelve-source-atomicity-author-v2'
OWN=Path(__file__).resolve().parent
REVIEW=BASE/'wirtschaft-e2-three-eleven-reuse-readiness-root-adjudication-v1/independent-current-c25-reuse-and-exact-readiness-card-adjudication.actual.json'
CAN=ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
read=lambda p:json.loads(p.read_text())
sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def write(name,data):
 p=OWN/name;p.parent.mkdir(parents=True,exist_ok=True)
 expected=(json.dumps(data,ensure_ascii=False,indent=2)+'\n').encode()
 if p.exists():
  assert p.read_bytes()==expected,'Existing partial source/mapping artifact must remain exact: '+str(p)
  return
 with p.open('xb')as stream:stream.write(expected)

assert not(OWN/'whole-goals.candidate.json').exists()
review=read(REVIEW);assert review['reviewer']=='/root'
assert review['reuseDecision']['decision']=='REUSE_EXISTING_D3'
assert sha(OLD/'whole-goals.candidate.json')==review['inputs']['authorWhole15']
reuse=review['reuseDecision']['reusedGoalId'];excluded=review['reuseDecision']['excludedNewCandidateId']
landscape=read(CAN);by={g['id']:g for g in landscape['goals']}
assert by[reuse]==review['reuseDecision']['wholeExistingGoal']
previous=read(OLD/'whole-goals.candidate.json')
whole=[copy.deepcopy(g) for g in previous if g['id']!=excluded]
parents=read(OLD/'stable-parent-goal-ids.json');assert len(whole)==14 and len(parents)==3
unit_rows=read(OLD/'source-unit-boundaries-and-prerequisites.candidate.json')
units={row['canonicalGoalId']:row for row in unit_rows}
taxonomy={
 'time-allocation':('AB3','Develop an own feasible schedule from competing priorities and scarcity, with justified adjustments. This is bounded constructive planning rather than recall of a fixed supplied schedule.'),
 'consumption-graph':('AB2','Transfer supplied consumption data into a scaled representation and derive justified interpretation/limits from the reference quantity.'),
 'money-evolution-properties':('AB2','Explain supplied historical use through four money properties and their enabling or limiting causal roles.'),
 'household-credit-security':('AB2','Compare supplied obligations, security mechanisms and risks for two actor perspectives; apply given criteria without demanding an unrestricted financial judgment.'),
 'price-elasticity':('AB2','Apply a stated model to relative price/quantity changes and explain a conditional response; no independent policy verdict or model invention.'),
 'marginal-reasoning':('AB2','Distinguish marginal, total and average measures and justify the model adjustment using explicitly comparable quantities; reasons remain within the supplied model.'),
 'supplier-structure':('AB2','Classify a new market using independent suppliers and explain the missing conditions of a competition verdict; recall labels alone is insufficient.'),
 'behavioural-experiment':('AB2','Analyse design and observations through comparison conditions and limits of causal interpretation, rather than generate a new experiment.'),
 'utility-prospect-comparison':('AB2','Compare supplied model predictions and assumptions in a new risky-choice case; no free-standing evaluation or new utility model required.'),
 'libertarian-paternalism':('AB2','Apply the distinction between choice architecture, prohibitions and monetary incentives to supplied cases, including practical opting out; no duplicate ethical appraisal.'),
 'mental-accounting':('AB2','Explain a new consumption case through fungibility/purpose accounts and distinguish the mechanism from genuine budget constraints and stated saving goals.')}
tax=[]
for goal in whole:
 if goal['id'] in parents:
  goal['contains']=[i for i in goal['contains'] if i!=excluded]
  goal['weight']=len(goal['contains'])
  if goal['id']==parents[1]:
   goal['description']='Dieser fachliche Cluster bündelt Preiselastizität, zusätzliche Kosten und Nutzen sowie Anbieterstrukturen.'
   goal['descriptionEn']='This subject cluster groups price elasticity, marginal costs and benefits, and supplier structures.'
  continue
 unit=units[goal['id']]['contentUnitKey'];ab,reason=taxonomy[unit]
 goal['dimensionTags']['demandLevel']=ab
 goal.setdefault('extendedData',{})['applicabilityMappingInheritance']='boundary'
 tax.append({'goalId':goal['id'],'contentUnitKey':unit,'proposedDemandLevel':ab,'individualWholeOperatorReason':reason,'officialIndividualABAssignmentClaimed':False})
atoms=[g for g in whole if g['id'] not in parents];ids=[g['id']for g in atoms]
assert len(ids)==11 and excluded not in ids and reuse not in ids

# Two exact readiness operations retain every original concrete foundation instead of requiring optional new profile children.
readiness=[]
for row in review['readinessDecision']['wholeTargetsAndCheckedOps']:
 gid=row['goalId'];assert by[gid]==row['wholeCurrentGoal']
 assert by[gid]['requires']==row['beforeRequires']
 successor=copy.deepcopy(by[gid]);successor['requires']=row['acceptedInertAfterRequires']
 assert not set(ids).intersection(successor['requires'])
 readiness.append({'goalId':gid,'before':by[gid]['requires'],'after':successor['requires'],'wholeOriginal':by[gid],'wholeCandidate':successor,'actualRootAdjudicationPath':str(REVIEW.relative_to(ROOT)),'actualRootAdjudicationSha256':sha(REVIEW),'exactConcreteFoundationsRetained':True,'newOptionalAtomsRequired':False,'thresholdUnchanged':True})
assert len(readiness)==2
changed={g['id']:g for g in whole if g['id'] in parents}
changed.update({r['goalId']:r['wholeCandidate'] for r in readiness})
candidate=copy.deepcopy(landscape);candidate['goals']=[changed.get(g['id'],g)for g in candidate['goals']]+atoms
assert len(candidate['goals'])==381
assert next(g for g in candidate['goals'] if g['id']==reuse)==by[reuse]
assert sum(reuse in g.get('contains',[]) for g in candidate['goals'])==sum(reuse in g.get('contains',[]) for g in landscape['goals'])

# Preserve every original source bullet, source-goal ID and passage, including the reused review unit.
source=copy.deepcopy(read(OLD/'source-components/DE_BY_WR_WWG_TWELVE_CONTENT_COMPONENTS.author-v2.source-extraction.json'))
source['extractionId']='DE_BY_WR_WWG_THREE_PROFILE_AREAS_TWELVE_CURRENT_CONTENT_COMPONENTS_20261008_AUTHOR_V3'
source['title']='Wirtschaft und Recht WWG: twelve exact profile source units bound to eleven new atoms and one existing competency (candidate)'
assert len(source['sourceDocuments'])==2 and len(source['passages'])==3 and len(source['sourceGoals'])==12
for doc,key in zip(source['sourceDocuments'],['BY-WR8-original-profile-page','BY-WR10-WWG-original-profile-page']):doc['key']=key
source['sourceDocument']['key']='BY-WR8-original-profile-page'
for passage in source['passages']:
 passage['sourceDocumentKey']='BY-WR8-original-profile-page' if passage['topicCode']=='J8' else 'BY-WR10-WWG-original-profile-page'
for goal in source['sourceGoals']:
 goal['sourceDocumentKey']='BY-WR8-original-profile-page' if goal['topicCode']=='J8' else 'BY-WR10-WWG-original-profile-page'
source['method']='Bounded candidate successor preserving all12 official content units and all original raw text. Eleven independently assessable new atoms plus direct reuse of current d3 according to actual independent root adjudication; source and graph adoption remain inert pending all affected gates.'
source_path=OWN/'source-components/DE_BY_WR_WWG_TWELVE_UNITS_ELEVEN_NEW_ATOMS.author-v3.source-extraction.json'
write(source_path.relative_to(OWN),source)
mapping=copy.deepcopy(read(OLD/'mapping/twelve-components-to-canonical-economics.review.candidate.json'))
mapping['reviewId']='DE_BY_WR_WWG_TWELVE_UNITS_TO_ELEVEN_NEW_AND_EXISTING_D3_AUTHOR_20261008_V3'
mapping['sourceExtractionPath']=str(source_path.relative_to(ROOT))
for edge in mapping['mappings']:
 if edge['canonicalGoalId']==excluded:edge['canonicalGoalId']=reuse
for decision in mapping['decisions']:
 if excluded in decision['canonicalGoalIds']:
  decision['canonicalGoalIds']=[reuse]
  decision['rationale']='Inert exact source-unit binding proposed after actual independent whole d3/P-cases adjudication: existing d3 explicitly demonstrates informational quality, review distortion and justified checking. Reuse changes no current d3 competence, card, P content or visible contains parent. Source/page/context bindings must still be verified before adoption.'
  decision['independentReuseAdjudicationPath']=str(REVIEW.relative_to(ROOT))
 else:
  decision['rationale']='Inert exact official content-unit mapping to one proposed new atomic competency; whole source, atomicity, memory and all final gates still require actual independent approval.'
write('mapping/twelve-units-to-eleven-new-and-existing-d3.review.candidate.json',mapping)
boundaries=[]
for row in unit_rows:
 out=copy.deepcopy(row)
 if out['canonicalGoalId']==excluded:
  out['canonicalGoalId']=reuse;out['stableParentGoalId']=None
  out['reusesExistingGoal']=True;out['sourceProfileClusterId']=parents[1]
  out['visibleContainsParentAdded']=False
  out['atomicityRationale']='Actual independent whole current d3 and both P cases demonstrate the exact review-information unit; no duplicate c25 competency is created.'
 else:
  out['applicabilityMappingInheritance']='boundary'
  out['proposedDemandLevel']=next(t['proposedDemandLevel']for t in tax if t['goalId']==out['canonicalGoalId'])
 boundaries.append(out)
placement=[]
for row in read(OLD/'placement.source-bound.candidate.json'):
 out=copy.deepcopy(row)
 if out['goalId']==excluded:
  out['goalId']=reuse;out['canonicalParentGoalId']=None;out['sourceProfileClusterId']=parents[1];out['newVisibleContainsParent']=False;out['existingCompetenceAndPlacementUnchanged']=True
 placement.append(out)
foreign=read(OLD/'current-mapping-and-reverse-requires-impact.open.json')['foreignAndOriginalMappingsRetainedByteExact']
for row in foreign:
 current_mapping=read(ROOT/row['mappingPath'])
 current_edges=[edge for edge in current_mapping.get('mappings',[]) if edge.get('canonicalGoalId') in parents]
 assert current_edges==row['edgesToStableParents']
 current_sha=sha(ROOT/row['mappingPath'])
 row['historicalV2SnapshotSha256']=row['originalSha256']
 row['currentMappingSha256']=current_sha
 row['currentMappingUnmodifiedByThisAuthor']=True
 if current_sha!=row['originalSha256']:
  assert '/DE-BW/upper-secondary/' in row['mappingPath']
  row['preexistingRootApprovedSourcePointerSuccessorReceipt']='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-q1-bw-two-current-source-location-successors-author-v1/root-current-consumer-integration-v1/actual-independent-current-source-location-integration.receipt.json'
  assert (ROOT/row['preexistingRootApprovedSourcePointerSuccessorReceipt']).exists()
  row['oldParentMapEdgesStillExact']=True
write('whole-goals.original.json',[by[i]for i in parents])
write('whole-goals.candidate.json',whole)
write('stable-parent-goal-ids.json',parents)
write('atomic-goal-ids.candidate.json',ids)
write('canonical-three-clusters-eleven-atoms.inert.json',candidate)
write('source-unit-boundaries-and-prerequisites.candidate.json',boundaries)
write('atomic-demand-levels.individual-author.candidate.json',tax)
write('placement.source-bound.candidate.json',placement)
write('reverse-requires.exact-foundations.reviewed-inert-ops.json',{'role':'author_materialises_actual_root_readiness_adjudication','ops':readiness,'activeWrites':0,'newStrictClosures':0})
write('existing-d3-direct-source-unit-binding.inert.json',{'reusedGoalId':reuse,'wholeExistingGoal':by[reuse],'wholeExistingGoalUnmodified':True,'directComponentSourceGoalId':next(u['sourceComponentGoalId']for u in boundaries if u['canonicalGoalId']==reuse),'newVisibleContainsParentAdded':False,'independentRootReuseAdjudicationPath':str(REVIEW.relative_to(ROOT)),'sourcePageContextChecksPending':True,'existingStrictClosureRecountedAsNew':False,'newStrictClosures':0})
write('current-foreign-source-coverage.pending.json',{'historicalV2MappingObservationsPreservedAndCurrentMappingUntouched':foreign,'new11AtomicInheritanceBoundaries':ids,'candidateDirectSourceUnits':12,'newBYChildrenNotAutomaticallyOtherStates':True,'nativeAtlasAndApplicabilityStillRequired':True,'activeWrites':0})
write('narrow-market-form-card.content-reviewed-visibility-pending.candidate.json',review['narrowCardDecision'])
write('author-source-atomicity-successor.actual.json',{'schemaVersion':1,'role':'author_inert_source_atomicity_successor','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'previousV2WholeGoalSha256Preserved':sha(OLD/'whole-goals.candidate.json'),'rootAdjudicationPath':str(REVIEW.relative_to(ROOT)),'rootAdjudicationSha256':sha(REVIEW),'currentCanonicalSha256Unmodified':sha(CAN),'stableConvertedClusters':3,'newAtomicCandidates':11,'directExistingGoalReuse':reuse,'completeActualSourceUnitsPreserved':12,'sourceDocumentsExplicitKeys':2,'passagesExplicitDocumentKeys':3,'atomLevelInheritanceBoundaries':11,'exactReadinessOps':2,'currentActualAtomicDenominator':303,'hypotheticalAfterAllReviewedGatesDenominator':311,'originalD3WholeGoalAndVisiblePlacementUnchanged':True,'noActualExistingClosureReclassifiedAsNew':True,'nativeSourceAtlasApprovalClaim':False,'independentFull14GoalApprovalClaim':False,'independentAMApprovalClaim':False,'humanApprovalClaimed':False,'activeWrites':0,'newStrictClosures':0})
print('Inert source-v3: three stable clusters,11 new atoms,12 exact source units with direct existing-d3 reuse, two exact readiness operations; current denominator303 unchanged.')
