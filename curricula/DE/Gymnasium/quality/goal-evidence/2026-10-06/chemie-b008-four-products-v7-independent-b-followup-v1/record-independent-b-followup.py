#!/usr/bin/env python3
"""Bind independent B's v7 targeted resolutions to exact current inputs."""
import datetime
import hashlib
import json
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
BASE = ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06'
OUT = Path(__file__).resolve().parent
V7 = BASE/'chemie-b008-twenty-six-literal-operator-prerequisite-author-v7'
V6 = BASE/'chemie-b008-nine-twenty-six-operator-and-prerequisite-author-v6'
OLD_B = BASE/'chemie-b008-twenty-six-operator-v6-independent-b-v1'
PRIMARY = ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b008-nine-source-operator-structural-current-author-candidate-v3/primary-inputs'
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def read(p):
    return json.loads(p.read_text())

def bind(p):
    return {'path':str(p.relative_to(ROOT)),'sha256':sha(p),'bytes':p.stat().st_size}

def save(name, value):
    p = OUT/name
    assert not p.exists(), p
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2)+'\n')

def verify_freeze(p, expected):
    assert sha(p) == expected
    checks=[]
    for f in read(p)['files']:
        actual=bind(ROOT/f['path'])
        assert actual == f
        checks.append({**actual,'actualBytesExact':True})
    return {'freeze':bind(p),'fileCount':len(checks),'allFilesExact':True,'files':checks}

v7freeze=verify_freeze(V7/'four-targeted-prototypes.author-v7.final.freeze.json','fba66db68a64a993512575fe00caf97bd56daa414a5b25be8b699a343b350667')
v6freeze=verify_freeze(V6/'author-v6.with-exact-K11-reference.final.freeze.json','a8adb6cc44d4fc908820dc79cf0036fef6ab0897c648c2cfd55d667035e057ef')
old_b_freeze=verify_freeze(OLD_B/'independent-b.final.freeze.json','5cbc5c8b6403f221c8b469dfd8533f64f4979168c9dd765e6a8d7a72d95563b5')
old_findings=read(OLD_B/'literal-scientific-findings-and-unadopted-corrections.actual.json')['findings']
assert [f['id'] for f in old_findings]==['B-v6-01','B-v6-02','B-v6-03','B-v6-04','B-v6-05']
before=read(V6/'twenty-six-atomic-boundaries.de-en.author-proposal.json')
after=read(V7/'twenty-six-atomic-boundaries.de-en.author-proposal.json')
old={a['candidateKey']:a for a in before['atoms']}
new={a['candidateKey']:a for a in after['atoms']}
assert set(old)==set(new) and len(new)==26
changed=[k for k in new if new[k]!=old[k]]
unchanged=[k for k in new if new[k]==old[k]]
assert set(changed)=={'lower-independently-planned-hypothesis-investigation','upper-hypothesis-investigation','own-inquiry-process-reflection','sek1-model-use-criticism'}
assert len(unchanged)==22 and all(a['candidateId'] is None for a in new.values())
actual_deltas=[]
for k in changed:
    fields=[{'field':f,'before':old[k].get(f),'after':new[k].get(f)} for f in new[k] if old[k].get(f)!=new[k].get(f)]
    actual_deltas.append({'candidateKey':k,'fields':fields})
assert actual_deltas==read(V7/'actual-four-prototype-literal-deltas.json')['deltas']
formulation=['lower-chemical-question-hypothesis','upper-theory-based-question-hypothesis']
assert all(new[k]==old[k] for k in formulation)

controls=read(V7/'effective-source-input-controls.json')
for name in ['frozenV6Controls','effectiveK11Override','actualCurrentWholeChemistryBinding']:
    assert bind(ROOT/controls[name]['path'])==controls[name]
assert controls['K11ActualLineRange']==[138,140]
override=read(ROOT/controls['effectiveK11Override']['path'])
assert [override['actualCorrectLineStart'],override['actualCorrectLineEnd']]==[138,140]
canonical_path=ROOT/controls['actualCurrentWholeChemistryBinding']['path']
current=read(canonical_path)
native={g['id']:g for g in current['goals']}
assert len(native)==479 and not (set(native)&set(new))
nodes={**{g['id']:g.get('requires',[]) for g in current['goals']},**{k:a['prerequisiteProposalKeysOrExistingIds'] for k,a in new.items()}}
contains={g['id']:g.get('contains',[]) for g in current['goals']}
contains.update({k:[] for k in new})

def dag_proof(edges):
    seen,active,order=set(),set(),[]
    def walk(k):
        assert k in edges,k
        if k in seen:
            return
        assert k not in active,('cycle',k)
        active.add(k)
        for r in edges[k]:
            walk(r)
        active.remove(k)
        seen.add(k)
        order.append(k)
    for k in edges:
        walk(k)
    rank={k:i for i,k in enumerate(order)}
    pairs=sorted((k,r) for k,rs in edges.items() for r in rs)
    assert all(rank[r]<rank[k] for k,r in pairs)
    digest=hashlib.sha256(json.dumps(pairs,separators=(',',':')).encode()).hexdigest()
    return {'nodeCount':len(edges),'edgeCount':len(pairs),'unresolvedReferenceCount':0,'acyclic':True,'orderedEdgesSha256':digest,'prerequisiteOrChildFirstTopologicalOrder':order}

requires_proof=dag_proof(nodes)
contains_proof=dag_proof(contains)
assert len(nodes)==505
save('actual-current-479-plus26-prerequisites-and-contains.dag-proof.json',{
 'schemaVersion':1,'createdAtUTC':NOW,'independentReviewer':'B',
 'inputBindings':[bind(canonical_path),bind(V7/'twenty-six-atomic-boundaries.de-en.author-proposal.json')],
 'nativeGoalCount':479,'proposedUnassignedPrototypeCount':26,
 'combinedProvisionalNodeCount':505,'requiresGraph':requires_proof,'containsGraph':contains_proof,
 'removedUniversalEdges':[{'from':'lower-independently-planned-hypothesis-investigation','to':'lower-chemical-question-hypothesis'},{'from':'upper-hypothesis-investigation','to':'upper-theory-based-question-hypothesis'}],
 'retainedSafetyAndMethodsChain':{'guidedCandidatePrerequisites':new['lower-guided-hypothesis-investigation']['prerequisiteProposalKeysOrExistingIds'],'safetyAtomId':'13d4f336-ab16-54a7-9479-c920b458f385','actualSafetyRequires':native['13d4f336-ab16-54a7-9479-c920b458f385']['requires']},
 'provisionalCandidateKeyNodesAreNotAssignedGoalIds':True,'operativeGraphWritten':False})

source_bindings=[]
def excerpt(name,start,end,label):
    p=PRIMARY/name
    lines=p.read_text().splitlines()
    source_bindings.append(p)
    return {**bind(p),'lineStart':start,'lineEnd':end,'clause':label,'actualText':'\n'.join(lines[start-1:end])}

resolutions=[]
mapping={
 'B-v6-01':('sek1-model-use-criticism',['titleDe','titleEn'],[('by8.actual-main.txt',48,53,'C8 model use and need for development')], 'resolved','Titel und Beschreibung verlangen jetzt Modellnutzung und begründete Kritik. Das tatsächliche Weiterentwickeln eines Modells wird nicht mehr als bereits erbrachte Handlung behauptet.'),
 'B-v6-02':('sek1-model-use-criticism',['descriptionDe','descriptionEn','sourceOperatorScopeContractDe'],[('by10-ch.actual-main.txt',48,53,'C10-CH hypothesis-directed model use'),('by10-ntg.actual-main.txt',50,55,'C10-NTG hypothesis-directed model use')], 'resolved','Beide Sprachfassungen verlangen ausdrücklich hypothesengeleitete Nutzung; der vorherige Oder-Ausweg ist entfernt. Einfachere C8/C9-Modellbeiträge bleiben Teilbeiträge mit offener geprüfter Stufen-/target-Route und werden nicht unbemerkt auf den C10-Abschluss hochgestuft.'),
 'B-v6-03':('lower-independently-planned-hypothesis-investigation',['prerequisiteProposalKeysOrExistingIds','sourceOperatorScopeContractDe'],[('actual-primary-pdf-pages/ni-i-physical-page-052.txt',19,22,'NI supplied-hypothesis-compatible planning'),('actual-primary-pdf-pages/ni-i-physical-page-054.txt',23,29,'NI simple quantitative planning/performance'),('actual-primary-pdf-pages/ni-i-physical-page-060.txt',21,31,'NI qualitative AND quantitative performance')], 'resolved','Die universelle Kante zur eigenen Frage-/Hypothesenformulierung ist entfernt; die sichere angeleitete Methodenbasis bleibt. Eine bereitgestellte Hypothese erlaubt eigenständige Planung. Qualitative UND quantitative Ausführung, tatsächlicher Versuch und Protokoll sind unverändert verpflichtend. Die eigene Formulierungsleistung bleibt an ihrem exakten Produkt und an tatsächlich verlangenden integrierten Quellenwegen erhalten.'),
 'B-v6-04':('upper-hypothesis-investigation',['prerequisiteProposalKeysOrExistingIds','sourceOperatorScopeContractDe'],[('by11.actual-main.txt',32,39,'C11 practical performance and integrated own theory-based hypothesis'),('by12-ga.actual-main.txt',73,78,'E1/E2/E3 own hypotheses distinct from E4/E5 investigation or model alternative')], 'resolved','Die universelle Kante zur eigenen theoriegestützten Hypothesengenerierung ist entfernt, die untere selbst geplante praktische Methodenbasis bleibt. Eine bereitgestellte theoriegestützte Hypothese ist zulässig. C11.1.3 behält eigene Hypothesengenerierung und Planung gemeinsam auf der echten Quellenroute. Tatsächliche praktische Ausführung wird weiterhin nicht mit dem getrennten Modelltest gleichgesetzt.'),
 'B-v6-05':('own-inquiry-process-reflection',['descriptionDe','descriptionEn','sourceOperatorScopeContractDe'],[('by12-ga.actual-main.txt',93,98,'E10 own process distinct from E12 validity criteria'),('actual-primary-pdf-pages/ni-ii-physical-page-017.txt',33,36,'NI reflect results of actual own performance')], 'bounded_clarification_resolved','Angewandte Methoden und Vorgehensweisen / methods and procedures used erlaubt die begründete Reflexion einer selbst ausgeführten angeleiteten Untersuchung. Nicht selbst getroffene Planungsentscheidungen werden nicht mehr als eigene behauptet. Eigene reale Durchführung und Reflexion sowie Verbesserungsableitung bleiben erhalten; ein fertiger Fremdfall genügt nicht.'),
}
for f in old_findings:
    key,fields,spans,status,reason=mapping[f['id']]
    refs=[excerpt(*s) for s in spans]
    resolutions.append({'priorOwnFindingId':f['id'],'priorOwnFindingSeverity':f['severity'],
      'candidateKey':key,'candidateId':None,'currentAffectedFields':{p:new[key][p] for p in fields},
      'actualPriorToCurrentFieldChanges':[d for d in actual_deltas if d['candidateKey']==key],
      'independentCurrentDecision':status,'scientificReasonDe':reason,'primarySourcesActuallyRechecked':refs,
      'deEnRequiredPerformanceAligned':True,'priorHistoryOverwritten':False,'nativeDOrPApproval':False})
assert new['sek1-model-use-criticism']['titleDe']=='Chemische Modelle nutzen und kritisch vergleichen'
assert 'hypothesengeleitet' in new['sek1-model-use-criticism']['descriptionDe']
assert 'hypothesis-guided' in new['sek1-model-use-criticism']['descriptionEn']
assert new['lower-independently-planned-hypothesis-investigation']['prerequisiteProposalKeysOrExistingIds']==['lower-guided-hypothesis-investigation']
assert new['upper-hypothesis-investigation']['prerequisiteProposalKeysOrExistingIds']==['lower-independently-planned-hypothesis-investigation']
assert 'angewandten Methoden und Vorgehensweisen' in new['own-inquiry-process-reflection']['descriptionDe']
assert 'methods and procedures used' in new['own-inquiry-process-reflection']['descriptionEn']
assert 'qualitative und quantitative' in new['lower-independently-planned-hypothesis-investigation']['descriptionDe']
assert 'qualitative and quantitative' in new['lower-independently-planned-hypothesis-investigation']['descriptionEn']
assert 'qualitative und quantitative' in new['upper-hypothesis-investigation']['descriptionDe']
assert 'tatsächlich durchführen' in new['upper-hypothesis-investigation']['descriptionDe']
k11=excerpt('by12-ga.actual-main.txt',138,140,'effective K11 primary reference')
assert 'Lern- und Arbeitsergebnisse' in k11['actualText'] and 'analoge und digitale' in k11['actualText']
save('five-own-v6-findings.actual-independent-v7-resolutions.json',{
 'schemaVersion':1,'createdAtUTC':NOW,'independentReviewer':'B','scope':'four changed whole prototypes; B-v6-01 through B-v6-04 and bounded B-v6-05 only',
 'priorOwnFindingsInput':bind(OLD_B/'literal-scientific-findings-and-unadopted-corrections.actual.json'),
 'authorV7FinalFreeze':bind(V7/'four-targeted-prototypes.author-v7.final.freeze.json'),
 'resolutions':resolutions,'allFourBlockingOwnFindingsResolved':True,'boundedOwnClarificationResolved':True,
 'remainingScientificBlockingOwnFindingsInThisTargetedScope':0,
 'wholeNationalOrAll26HistoricalRestart':False,'sourceRouteAdoptionApproved':False,
 'ownHypothesisFormulationBodiesExact':formulation,
 'retainedEffectiveK11':k11,'strictCompletionsAdded':0,'humanApproval':False,'humanTrial':False,
 'pendingDownstreamDistinctFromScientificDefect':['real P tasks/materials/profiles','actual IDs and source/stage/course/target/exact-partial route decisions','original integrated source paths retaining own formulation','practical versus model alternative route bindings','Memory decisions and required cards/visibility','actual V/image review','native current D/A/M/V and guarded integration']})

for f in read(V7/'actual-four-prototype-literal-deltas.json')['primaryBindingsPersonallyReadAndChecked']:
    assert bind(ROOT/f['path'])==f
for old_source in read(OLD_B/'scope-read-inputs-and-exact-delta.actual.json')['actualReadInputHashes']:
    if '/primary-inputs/' in old_source['path']:
        assert bind(ROOT/old_source['path'])==old_source
national_path=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b008-nine-source-operator-structural-current-author-candidate-v3/all-national-original-nine-source-obligations.actual.json'
assert sha(national_path)=='a51f97421266fbf2355b386c0e24e65d84b94da9aa51fa1b3429da78d89c4951'
assert len(read(national_path)['directBindings'])==1646
save('actual-current-input-bindings-and-22-prototype-continuity.json',{
 'schemaVersion':1,'createdAtUTC':NOW,'independentReviewer':'B',
 'authorV7FiveFileFreeze':v7freeze,'authorV6RetainedFreeze':v6freeze,'ownV6HistoryRetainedFreeze':old_b_freeze,
 'actualWholePrototypeChangedKeys':changed,'actualWholePrototypeUnchangedKeys':unchanged,
 'changedCount':4,'wholeUnchangedCount':22,'allRecordedDeltaFieldsAndBeforeAfterValuesExact':True,
 'ownFormulationProductBodiesRemainExact':formulation,
 'actualReadInputs':[bind(p) for p in list(dict.fromkeys(source_bindings))+[canonical_path,V7/'twenty-six-atomic-boundaries.de-en.author-proposal.json',V7/'effective-source-input-controls.json',V7/'actual-four-prototype-literal-deltas.json',OLD_B/'literal-scientific-findings-and-unadopted-corrections.actual.json',ROOT/controls['effectiveK11Override']['path']]],
 'allEarlierActuallyReadPrimaryInputsRetainedExact':True,
 'retainedOriginalNationalSourceObligationInput':{**bind(national_path),'directBindingCount':1646,'wholeNationalScientificClearance':False},
 'effectiveK11Override':{**bind(ROOT/controls['effectiveK11Override']['path']),'actualLineRange':[138,140],'historicalWrongBaseRangeRetainedWithoutUse':True},
 'independence':{'ownV6FindingsRead':True,'peerVerdictBodiesRead':False,'newPeerOutputsRead':False,'authorREADMEContainsHistoricalPeerSummary':True,'authorMetadataContainsPeerFreezeNamesAndHashes':True,'scientificDecisionBasis':'own exact frozen findings and newly reread BY/NI primary passages; author peer summary is not evidence for these resolutions'},
 'unchangedContinuityIsNotNewNativeApproval':True,'candidateIdsAllNull':True,
 'currentRecordedStrictBaseline':{'chemie':'112/378','biologie':'67/383','mathematik':'807/807','physik':'478/478'},
 'mutations':{'onlyThisNewReviewDirectoryWritten':True,'historicalOwnV6Writes':False,'authorInputWrites':False,'activeGraphRegistryRuntimePluginImageWrites':False,'nativeInputTreeCopies':False,'buildOrCentralReportRerun':False},
 'nativeDOrPApproval':False,'strictCompletionsAdded':0,'humanApproval':False,'humanTrial':False})

(OUT/'README.md').write_text('''# Chemistry B008: independent B targeted author-v7 follow-up

All four own blocking v6 findings **B-v6-01–04 are independently resolved** on the exact current author-v7 input. The bounded reflection clarification **B-v6-05 is resolved** as well. This resolves the three previously affected prototypes and the fourth clarification prototype within the targeted scope. It does not rewrite the historical v6 review.

The lower model title now matches model use and justified criticism; both DE/EN descriptions require hypothesis-guided use. The lower and upper practical planning products remove universal prerequisites for own hypothesis generation while preserving actual qualitative AND quantitative execution and safety/methods. Their unchanged own-formulation products remain required on original integrated source routes that genuinely demand them. Own reflection now justifies methods actually used and permits real guided performance without inventing independent planning.

[Exact resolutions and primary passages](five-own-v6-findings.actual-independent-v7-resolutions.json) distinguish these scientific findings from open downstream work. [Current input and continuity proof](actual-current-input-bindings-and-22-prototype-continuity.json) confirms four actual whole-prototype changes, 22 exact unchanged prototypes, the retained K11 override at 138–140 and unchanged 1646 source-binding obligations as input without whole-national clearance. No peer verdict body or new peer output was read; author metadata contains historical peer summaries/names/hashes, which are not scientific evidence for these resolutions.

The actual current 479 goals plus 26 provisional candidate-key nodes have independently checked, resolved, acyclic `requires` and `contains` graphs. [DAG proof](actual-current-479-plus26-prerequisites-and-contains.dag-proof.json) binds both input hashes and gives each graph's edge digest and prerequisite/child-first topological order. Candidate IDs remain null; this is no operative landscape or native approval.

Real P material/profiles, source/stage/course/target/route adoption, Memory/cards/visibility, actual V/image review, IDs and native D/A/M/V remain pending downstream. Those missing bindings are not scientific defects in the corrected text. The recorded strict baseline remains Chemistry 112/378 and Biology 67/383; no strict completion or restored active binding is added. Historical reviews, author inputs and active files were preserved. No human approval/trial is claimed.
''')
files=[bind(p) for p in sorted(OUT.iterdir()) if p.is_file() and p.name!='independent-b-v7-followup.final.freeze.json']
save('independent-b-v7-followup.final.freeze.json',{
 'schemaVersion':1,'createdAtUTC':NOW,'independentReviewer':'B','authorV7FreezeSha256':'fba66db68a64a993512575fe00caf97bd56daa414a5b25be8b699a343b350667','files':files,
 'fourOwnBlockingV6FindingsResolved':True,'boundedOwnV6ClarificationResolved':True,
 'remainingScientificBlockersInTargetedFollowup':0,'actual479Plus26DAGChecked':True,
 'changedPrototypes':4,'wholeUnchangedPrototypes':22,'historicalV6PreservedExact':True,
 'allCurrentCandidateNativeAndMaterialGatesStillPending':True,'wholeNationalClearance':False,
 'activeWrites':False,'strictCompletionsAdded':0,'nativeDOrPApproval':False,'humanApproval':False,'humanTrial':False})
print(json.dumps({'outputDirectory':str(OUT.relative_to(ROOT)),'finalFreezeSha256':sha(OUT/'independent-b-v7-followup.final.freeze.json'),'filesFrozen':len(files),'blockingFindingsResolved':4,'boundedClarificationResolved':1,'changed':4,'wholeUnchanged':22,'combinedDAGNodes':505,'requiresEdges':requires_proof['edgeCount'],'containsEdges':contains_proof['edgeCount'],'strictCompletionsAdded':0}))
