import datetime
import hashlib
import json
from pathlib import Path

ROOT=Path('/home/enpasos/projects/skillpilot')
N=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17'
OUT=Path(__file__).parent
AUTHOR=N/'chemie-current447-two-explicit-existing-transfer-briefs-author-20261018-v1'
INPUT=AUTHOR/'AUTHOR.two-disjoint-baseline-fresh-briefs.successor-v2.pending.json'
def pin(p):
    p=Path(p)
    if not p.is_absolute():p=ROOT/p
    b=p.read_bytes();return dict(path=str(p),sha256=hashlib.sha256(b).hexdigest(),bytes=len(b))
def oh(v):return hashlib.sha256(json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def write(name,v):
    p=OUT/name;p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n');return pin(p)
def exact(ref):
    p=pin(ref['path']);assert p['sha256']==ref['sha256'] and p['bytes']==ref['bytes'];return p
a=json.loads(INPUT.read_text());assert pin(INPUT)['sha256']=='b24445ab0072a8ac1a2e4aa1eb663fe1fe49ae2ea7e7a092adfd42371859b713'
author_seal=pin(AUTHOR/'SEAL.author-two-disjoint-baseline-fresh-briefs-v2.json')
assert author_seal['sha256']=='779c5ba58c19d08dd8159d35318557b37426c3cbaec23b4e5ae860e418169944'
previous=exact(a['previousAuthorTransport']);old=json.loads(Path(previous['path']).read_text())
old_review=pin(OUT/'P2.REVIEW.explicit-existing-transfer-bindings.independent-b.json')
old_seal=pin(OUT/'P2.SEAL.explicit-existing-transfer-bindings.independent-b.json')
assert old_review['sha256']=='f02c746efcc30961e446b8eafb637006a5fea56d7e4368a47b1a0ed624b501af'
assert old_seal['sha256']=='aea7ff14a25e804455a8b4e6bde1fa21bd2a5b0c83036b002e28d84694e68ef2'
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
findings=[]
for i,(r,v1) in enumerate(zip(a['records'],old['records'])):
    assert r['goalId']==v1['goalId'] and r['wholeGoalContext']==v1['wholeGoalContext']
    p=r['wholeProposedProfile'];before=v1['wholeProposedProfile'];material_pin=exact(r['operativeMaterialSource'])
    m=json.loads(Path(material_pin['path']).read_text());assert m==r['completeUnchangedOperativeMaterial']
    assert p['applicationCaseBriefs'][1]==before['applicationCaseBriefs'][1]
    assert {k:v for k,v in p.items() if k!='applicationCaseBriefs'}=={k:v for k,v in before.items() if k!='applicationCaseBriefs'}
    changed=[k for k in p['applicationCaseBriefs'][0] if p['applicationCaseBriefs'][0][k]!=before['applicationCaseBriefs'][0][k]]
    assert set(changed)=={'taskDemandDe','taskDemandEn','expectedPerformanceDe','expectedPerformanceEn'}
    literal={}
    for index,task,expected in [(0,m['learnerTask'],m['modelSolution']),(1,m['freshTransfer']['task'],m['freshTransfer']['expected'])]:
        for f,value,lang in [('taskDemandDe',task,'de'),('taskDemandEn',task,'en'),('expectedPerformanceDe',expected,'de'),('expectedPerformanceEn',expected,'en')]:
            literal[f'/applicationCaseBriefs/{index}/{f}']=p['applicationCaseBriefs'][index][f]==value[lang]
    assert all(literal.values())
    assert r['historicalWholeMaterialNavigationBriefExact']==before['applicationCaseBriefs'][0]
    if i==0:
        rationale='Die Ausgangsfall-Bindung benennt jetzt wörtlich die vollständigen bereits vorhandenen Gewinnungs-/Herstellungsaufträge: Pflanzenöl/FAME/Ethanol nach Rohstoff, Stoffklasse und Prozess unterscheiden, Saatbilanz und angegebene Generationenkonvention prüfen und Klimagrenzen begründen. Der zweite Brief erhält davon getrennt die neu gegebenen Restholz-/Synthesegas- und nur gefilterten Rapsölwege mit irreführender Werbung. Die Stoff-/Prozesszuordnung muss auf die neuen Wege übertragen werden; bloßes Wiederholen fehlender Klimaneutralität genügt nicht.30+70=100kg ist weiterhin eine ideale Saatbilanz, keine ohne Ölanteil bestimmte Extraktionsausbeute. Keine Herstellung oder vollständige Fischer-Tropsch-Erklärung wird zur GK-Pflicht.'
        distinction='Brief0 binds the original three fuel routes and seed/material/generation reasoning. Brief1 binds changed feedstock/process evidence and false Biodiesel/neutral labels. A learner can solve0 yet falsely classify filtered oil or wood/syngas as FAME in1; the contexts require distinct justified applications.'
        preserved='All former production-route, substance-class, separation/conversion, seed-balance, supplied-generation and conditional climate duties remain across the two briefs and unchanged full material. The detailed existing biodiesel/bioethanol and LK BTL carriers are not replaced or expanded.'
    else:
        rationale='Die Ausgangsfall-Bindung benennt jetzt wörtlich den historischen UND aktuellen Gesellschaftsvergleich nach Nutzen, Zugang, Kosten, Sicherheit, Resistenz und Evidenzgrenzen. Unter den angegebenen gleichen Wirksamkeitsannahmen sprechen80/100 statt50/100, Kostenindex3 statt5 und Überwachung bedingt fürA. Der zweite Brief erhält davon getrennt neue Resistenzdaten, die den alten Wirkstoff teilweise unwirksam machen, während belastbareB-Vergleichsdaten fehlen. Damit entfällt gerade die alte Gleichwirkungsannahme. Die erneute ungeänderte Zahlenrangfolge wäre falsch; eine begründete Revision und neue Evidenzgrenzen sind nötig. Resistenz ist im Ausgangsfall bereits ein Bewertungskriterium, im Transfer aber ein neu geänderter Befund – keine doppelte identische Aufgabe.'
        distinction='Brief0 binds the historical context and present conditional funding judgment under stated equal efficacy. Brief1 changes that premise through new resistance evidence. Correct baseline preference forA does not demonstrate the necessary withdrawal/revision of that preference after its premise fails.'
        preserved='Historical development/production/access and current benefit/cost/safety/resistance/evidence judgment remain. No efficacy ofB is invented, no treatment or clinical result claimed, and no HB GK medication obligation or new SH official universal duty arises.'
    findings.append(dict(
      goalId=r['goalId'],recommendation='accept_v2_disjoint_baseline_and_fresh_whole_P_successor',
      rationaleDe=rationale,distinctContextAssessment=distinction,noLostRequirementAssessment=preserved,
      wholeGoalContext=r['wholeGoalContext'],wholeGoalContextObjectSHA256=oh(r['wholeGoalContext']),
      wholeProposedProfile=p,wholeProposedProfileObjectSHA256=oh(p),actualMaterial=material_pin,wholeMaterialObjectSHA256=oh(m),
      changedFromV1Pointers=[f'/applicationCaseBriefs/0/{k}' for k in changed],allLiteralTaskExpectedCopies=literal,
      secondBriefExactFromV1=True,firstBriefIdAndUnderstandingFocusExact=True,allOtherProfileFieldsAndThresholdsExact=True,
      wholeGoalContextExactFromV1=True,materialBytesUnchanged=True,historicalBroadBriefPreservedExactly=True,
      adequateNonDuplicatingScope=True,noLostDuty=True,newTaskQuota=False,sameActualResponseMayCountTwice=False,
      evidenceCountingBoundary='Two disjoint indexed contexts are two opportunities for distinct reasoning, not proof of two learner demonstrations. One rich submission may show both. One actual response is credited once; sufficient already-shown baseline/transfer work is not repeated just because two briefs exist.',
      newTaskOrDataInvented=False,newSourceOrTargetClaim=False,remainingCorrections=0))
review=dict(
 artifactType='independent-informed-P2-v2-addendum-disjoint-baseline-fresh-binding',createdAtUTC=now,
 reviewerId='independent-b-p2-v2-disjoint-bindings',reviewMode='informed_targeted_v2_addendum_after_own_sealed_P2',
 reviewer=dict(provider='OpenAI',model='GPT-6 (Codex)',modelVersion='runtime identifier not exposed'),
 reviewAuthority='ai_candidate',recordStatus='candidate',
 priorRoleDisclosure='Same independent reviewer B as the completed blind final163 D first pass, subsequent informed author correction reviews, V10 and the V1/P2 follow-up. This is a narrow informed v2 content addendum, not a new blind round, another independent reviewer vote, or a rewrite of the prior judgment. No current peer P2/v2 judgment was read.',
 peerCurrentJudgmentsRead=False,authorInput=pin(INPUT),authorSeal=author_seal,previousAuthorTransport=previous,
 originalOwnP2Review=old_review,originalOwnP2Seal=old_seal,
 actualReadScope='Both whole v2 proposed profiles and whole bilingual goal contexts; both unchanged complete operative material objects with original givens, baseline task/model solution, rubric and changed-condition transfer task/expected; exact comparison with author v1. No historical package reapproval.',
 records=findings,
 conclusion='Accept both v2 whole P successors. First task/expected now bind only unchanged baseline learnerTask/modelSolution verbatim, while the unchanged second brief binds the changed-condition fresh task/expected. The prior broad navigation overlap is removed without deleting a criterion, material requirement or transfer. All other fields and thresholds remain exact.',
 counts=dict(wholeProfilesReviewed=2,wholeMaterialsReviewed=2,accepted=2,changedBaselineFields=8,literalTaskExpectedFieldsVerified=16,
             disjointBaselineFreshPairs=2,requirementsLost=0,newTasksInvented=0,newTaskQuotas=0,remainingCorrections=0,normalWrites=0),
 boundaries=dict(originalReviewOrSealRewritten=False,normalWrites=False,nativePWriterExecuted=False,DCompletion=False,ACompletion=False,MCompletion=False,
                 newVReview=False,humanApproval=False,humanTrial=False,M7Closure=False,actualLearnerPerformance=False,newSourceOrTargetApproval=False),
 objectHashRule='SHA256 of UTF-8 JSON with ensure_ascii=False, sorted object keys and comma/colon separators; file pins hash actual bytes')
rp=write('P2.V2.ADDENDUM.disjoint-baseline-fresh.independent-b.json',review)
seal=write('P2.V2.SEAL.disjoint-baseline-fresh.independent-b.json',dict(
 artifactType='independent-informed-P2-v2-addendum-seal',sealedAtUTC=now,reviewerId=review['reviewerId'],reviewMode=review['reviewMode'],
 priorRoleDisclosure=review['priorRoleDisclosure'],peerCurrentJudgmentsRead=False,review=rp,authorInput=review['authorInput'],
 originalOwnP2Review=old_review,originalOwnP2Seal=old_seal,counts=review['counts'],
 decisions=[dict(goalId=r['goalId'],wholeGoalContextObjectSHA256=r['wholeGoalContextObjectSHA256'],wholeProposedProfileObjectSHA256=r['wholeProposedProfileObjectSHA256'],
                 actualMaterial=r['actualMaterial'],recommendation=r['recommendation']) for r in findings],
 reviewAuthority='ai_candidate',normalRegistration=False,humanApproval=False,M7Claim=False))
print(json.dumps(dict(addendum=rp,seal=seal,counts=review['counts']),ensure_ascii=False,indent=2))
