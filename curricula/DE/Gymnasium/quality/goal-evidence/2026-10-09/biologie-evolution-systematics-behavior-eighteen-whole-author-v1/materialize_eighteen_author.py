"""Materialise own inactivated whole candidates; no active QA/approval writes."""
import copy
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
import jsonschema
from authored_cases_systematics_evolution import CASES
import authored_cases_behavior_history
from authored_goal_facets import FACETS, ATOMIC_REASONS_DE, MEMORY_REASONS_DE

R = Path.cwd()
O = Path(__file__).resolve().parent
REL = str(O.relative_to(R))
STAMP = datetime.now(timezone.utc).isoformat()

def bind(p):
    p = Path(p); b = p.read_bytes()
    return {'path':str(p.relative_to(R)), 'sha256':'sha256:'+hashlib.sha256(b).hexdigest(), 'bytes':len(b)}

def write(n, d):
    p = O/n; p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n'); return p

def prose(s):
    # Only unsealed own authored prose; never mutate the bound original goals/cases.
    import re
    s = re.sub(r'(?<=[,;:])(?=[A-Za-zÄÖÜäöüß])', ' ', s)
    s = re.sub(r'(?<=[A-Za-zÄÖÜäöüß])(?=\d)', ' ', s)
    s = re.sub(r'(?<=\d)(?=[A-Za-zÄÖÜäöüß])', ' ', s)
    return s

assert not (O/'eighteen-whole-science-material-author.first.freeze.json').exists(), 'Author FIRST immutable'
intake=json.loads((O/'input/whole-current18-source35-and-whole-partners30.exact-neutral-input.json').read_text())
ids=intake['selectedGoalIds']; goals=[r['wholeActiveGoal'] for r in intake['wholeCurrentGoalRows']]
assert len(goals)==len(FACETS)==len(ATOMIC_REASONS_DE)==len(MEMORY_REASONS_DE)==len(CASES)==18
assert sum(len(cs) for cs in CASES.values())==36
canon=R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
kinds=R/'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'
current=json.loads(canon.read_text()); by={g['id']:g for g in current['goals']}
assert all(by[g['id']]==g for g in goals)
assert all(by[p['goalId']]==p['wholeCurrentGoal'] for p in intake['wholeOriginalAndCurrentPartnerGoals'])
# Root's completed23 adoption is a real additive base successor. Old input FIRST stays immutable.
snap=O/'input/current-canonical479-root23-successor.snapshot.json';snap.write_bytes(canon.read_bytes())
ks=O/'input/current-kinds394-root23-successor.snapshot.json';ks.write_bytes(kinds.read_bytes())
kd=json.loads(kinds.read_text());kdc=copy.deepcopy(kd);kdc['sourceLandscapePath']=str(snap.relative_to(R))
kc=write('input/current-kinds394-root23-landscape-path-only.candidate.json',kdc)
assert kd['decisions']==kdc['decisions'];assert len(current['goals'])==479
assert sum(d['semanticKind']=='curricularAtomic' for d in kd['decisions'])==394
report=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-molecular-genetics-reviewed-integration-root-v1/checks/current-central-all-four-stable.stdout.actual.txt'
rp=json.loads(report.read_text());bio=next(s for s in rp['subjects'] if s['subject']=='biologie')
assert bio['denominator']==394 and bio['strictComplete']==299 and not set(ids)&set(bio['strictCompleteGoalIds'])
before=json.loads((O/'input/current-canonical-biology.original.snapshot.json').read_text());beforeby={g['id']:g for g in before['goals']}
changes=[g['id'] for g in current['goals'] if g!=beforeby[g['id']]]
assert not set(changes)&set(ids)
write('root23-active-baseline-successor.exact-additive-rebase.receipt.json',{
 'schemaVersion':1,'role':'actual technical base transition, no new fachliche review', 'createdAt':STAMP,
 'originalInputFirst':bind(O/'eighteen-whole-author.input.first.freeze.json'),
 'originalCanonicalSnapshot':bind(O/'input/current-canonical-biology.original.snapshot.json'),
 'currentActiveCanonical':bind(canon),'newInactiveCanonicalSnapshot':bind(snap),
 'currentKinds':bind(kinds),'inactiveKindsSnapshot':bind(ks),'kindsPathOnlyCandidate':bind(kc),
 'currentStable299Report':bind(report),'whole18Exact':True,'whole30PartnersExact':True,
 'all479CurrentGoalObjectsExactInInactiveSnapshot':True,'changedOutside18GoalIds':changes,
 'protectedStrict299Disjoint':True,'allOtherGoalsPreserved':True,
 'newScientificApproval':False,'activeWrites':[],'strictGain':0})

schema=json.loads((R/'contracts/goal-evidence/v2/goal-evidence-profile.schema.json').read_text())
validator=jsonschema.Draft202012Validator({'$ref':'#/$defs/profile','$defs':schema['$defs']})
entries=[];specs=[];am=[];matrix=[]
for i,g in enumerate(goals):
    cs=copy.deepcopy(CASES[i])
    for c in cs:
        for k,v in c.items():
            if isinstance(v,str): c[k]=prose(v)
        # Pair criteria are references, not a demand that every case individually covers the entire goal.
    es=[dict(id=f'essential-{j+1}',essentialUnderstandingDe=prose(f[0]),essentialUnderstandingEn=prose(f[1]),
             observablePerformanceDe=prose(f[2]),observablePerformanceEn=prose(f[3])) for j,f in enumerate(FACETS[i])]
    for c in cs:
        c['rubric']=[{'expectationId':e['id'],'rubricScope':'pair_reference_not_single_case_quota',
                     'criterionDe':e['observablePerformanceDe'],'criterionEn':e['observablePerformanceEn'],
                     'actualEvidenceLocations':['workedResponseDe','workedResponseEn','workedFreshTransferDe','workedFreshTransferEn'],
                     'rubricNoteDe':'Die Kriterien beschreiben zusammen die gesamte Kompetenz. Nur tatsächlich im eigenen Fall bearbeitete Aspekte zählen;zusätzliche Fälle sind keine feste Quote, wenn ausreichende eigenständige Evidenz bereits vorliegt.',
                     'rubricNoteEn':'Together these criteria describe the whole competence. Count only aspects actually demonstrated in this case;additional cases are no fixed quota once sufficient independent evidence exists.'} for e in es]
    profile={'archetype':'procedure' if i==0 else 'data' if i in (8,9,14,15) else 'representation' if i in (11,12,13) else 'modeling' if i in (3,4,7,16) else 'concept',
             'expectations':es,
             'coverageExpectations':{'requiredExpectationIds':[e['id'] for e in es], 'alternativeExpectationGroups':[],
                                     'minimumIndependentDemonstrations':2,'freshVariationRequired':True,'independentTransferRequired':True},
             'variationAxes':[{'id':'two-distinct-material-contexts','textDe':'Unterschiedliche Sach-/Belegkontexte mit eigener Begründung: '+cs[0]['caseId']+' und '+cs[1]['caseId']+'.',
                               'textEn':'Distinct subject/evidence contexts with independent reasoning: '+cs[0]['caseId']+' and '+cs[1]['caseId']+'.'},
                              {'id':'changed-premise-or-counterevidence','textDe':'Neue Merkmalslücke,Kontextänderung oder Gegenevidenz verändert die zulässige Folgerung;es genügt keine Wiederholung einer Musterantwort.',
                               'textEn':'A missing trait,context change or counterevidence changes the justified inference;repeating a worked answer is insufficient.'}],
             'applicationCaseBriefs':[{'id':c['caseId'],'taskDemandDe':c['materialDe']+'\n\nAuftrag: '+c['taskDe']+'\n\nFrische Variation: '+c['freshTransferTaskDe'],
                                      'taskDemandEn':c['materialEn']+'\n\nTask: '+c['taskEn']+'\n\nFresh variation: '+c['freshTransferTaskEn'],
                                      'expectedPerformanceDe':c['workedResponseDe']+'\n\nTransfer: '+c['workedFreshTransferDe'],
                                      'expectedPerformanceEn':c['workedResponseEn']+'\n\nTransfer: '+c['workedFreshTransferEn'],
                                      'understandingFocusDe':' '.join(e['essentialUnderstandingDe'] for e in es),
                                      'understandingFocusEn':' '.join(e['essentialUnderstandingEn'] for e in es)} for c in cs]}
    errors=list(validator.iter_errors(profile));assert not errors,[(i,list(e.path),e.message) for e in errors]
    specs.append({'goalId':g['id'],'profile':profile,'reason':'Author candidate for the whole unchanged current DE/EN competence, two heterogeneous synthetic material cases with worked explanation and fresh transfer. Two independent substantive demonstrations may occur within one task; no extra task-label quota. No real investigation,learner achievement,human or independent approval. Current source/course boundaries,actual images and native D/P/V pending.',
                  'evidenceLevel':'E1','maximumClaimScope':'G1','dissent':[]})
    entries.append({'ordinal':i+1,'goalId':g['id'],'wholeCurrentGoal':g,'wholeProfile':profile,'newAuthoredWholeCases':cs,
                    'sourceDutyRowIds':intake['wholeCurrentGoalRows'][i]['currentSourceDutyFrameRows'],
                    'sourceAndPartnerFrame':REL+'/input/whole-current18-source35-and-whole-partners30.exact-neutral-input.json',
                    'status':'needs_human_review','reviewAuthority':'ai_candidate','evidenceLevel':'E1','maximumClaimScope':'G1',
                    'humanApproval':False,'humanTrial':False,'actualExperimentPerformed':False,'actualLearnerPerformance':False,
                    'independentScientificApproval':False,'currentNativeApproval':False})
    am.append({'goalId':g['id'],'wholeCurrentGoal':g,'proposedSemanticKind':'curricularAtomic','proposedAtomicity':'atomic',
               'atomicityReasonDe':ATOMIC_REASONS_DE[i],'proposedMemory':'no_memory_needed','memoryReasonDe':MEMORY_REASONS_DE[i],
               'role':'author_semantic_candidate_not_independent_review','humanApproval':False,
               'wholeCurrentExistingKindDecision':intake['wholeCurrentGoalRows'][i]['currentSemanticKindDecision'],
               'wholeExistingARecordRetained':intake['wholeCurrentGoalRows'][i]['currentAOriginalBinding'],
               'wholeExistingMRecordRetained':intake['wholeCurrentGoalRows'][i]['currentMOriginalBinding'],
               'newAApproval':False,'newMApproval':False})
    matrix.append({'goalId':g['id'],'caseIds':[c['caseId'] for c in cs], 'requiredExpectationIds':[e['id'] for e in es],
                   'coverageScope':'whole_pair_and_fresh_transfer_author_proposal','independentCoverageReviewPending':True})
write('eighteen-whole36-bilingual-cases-and-P.author-candidate.json',{'schemaVersion':1,'role':'Own whole18/36 material author candidate, no independent approval',
 'license':'CC-BY-4.0','createdAt':STAMP,'entries':entries,'newWholeBilingualCases':36,'exactHistoricalCasesRewritten':0,
 'activeWrites':[],'strictGain':0,'humanApproval':False,'humanTrial':False})
write('eighteen-whole-positive-profile-candidate-set.author.json',{'schemaVersion':1,'authoringContract':'positive-understanding-evidence-candidates-v1',
 'reviewId':'biologie-evolution-systematics-behavior-eighteen-whole-author-v1','reviewedAt':STAMP,
 'reviewer':'Codex bio_science14_independent_a actual author; scientific/native independent reviews pending; model variant unexposed', 'goals':specs})
write('eighteen-whole-positive.author-candidate.config.json',{'$schema':'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',
 'schemaVersion':2,'reviewId':'biologie-evolution-systematics-behavior-eighteen-whole-author-v1',
 'goalFingerprintRuleVersion':'goal-evidence-v1','profileRuleVersion':'positive-understanding-evidence-v2',
 'landscapeId':current['landscapeId'],'landscapePath':str(snap.relative_to(R)), 'semanticKindLedgerPath':str(kc.relative_to(R)),
 'reviewCriteriaPath':REL+'/input/profile-criteria.original.md','reviewPath':REL+'/eighteen-whole-positive.author-candidate.review.jsonl',
 'reviewRunManifestPaths':[],'reviewedResourceTypes':[],'requireApproved':False,
 'scope':{'label':'18 current open Evolution/Systematics/Behavior whole goals; text/material author candidates, no native/images yet','goalIds':ids}})
write('eighteen-semantic-kind-atomicity-memory.author-candidates.json',{'schemaVersion':1,'role':'Author reasoning; existing current18 A/M/kind decisions retained, no independent AM verdict',
 'entries':am,'activeWrites':[],'newAMApproval':False,'strictGain':0})
write('eighteen-whole-expectation-coverage.author-matrix.json',{'schemaVersion':1,'role':'Author whole-pair evidence proposal, not learner evidence','entries':matrix})
print(json.dumps({'wholeGoals':18,'wholeProfiles':18,'wholeBilingualCases':36,'profileSchemaErrors':0,'strictGain':0,'activeWrites':[],'authorRole':True}))
