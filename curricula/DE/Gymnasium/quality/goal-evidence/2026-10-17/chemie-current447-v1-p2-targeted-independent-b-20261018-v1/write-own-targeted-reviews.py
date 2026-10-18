import datetime
import hashlib
import json
from pathlib import Path
from PIL import Image

ROOT=Path('/home/enpasos/projects/skillpilot')
N=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17'
OUT=Path(__file__).parent
VP=N/'chemie-current447-722-one-label-correction-author-20261018-v1/AUTHOR.one-label-only-actual-image-correction.pending.json'
PP=N/'chemie-current447-two-explicit-existing-transfer-briefs-author-20261018-v1/AUTHOR.two-whole-profiles-explicit-preexisting-fresh-bindings.pending.json'
def pin(p):
    p=Path(p)
    if not p.is_absolute():p=ROOT/p
    b=p.read_bytes();return dict(path=str(p),sha256=hashlib.sha256(b).hexdigest(),bytes=len(b))
def oh(v):return hashlib.sha256(json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def write(name,v):
    p=OUT/name;p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n');return pin(p)
def exact(ref):
    actual=pin(ref['path']);assert actual['sha256']==ref['sha256'] and actual['bytes']==ref['bytes'];return actual
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
reviewer=dict(provider='OpenAI',model='GPT-6 (Codex)',modelVersion='runtime identifier not exposed')
prior='Reviewer B of the separately sealed final163 blind D first pass, two later informed author-correction reviews, and the separately sealed actual-image V10 review. This is the same reviewer performing targeted informed correction checks, not another blind round or a new second reviewer vote. No current peer V1/P2 judgment was read.'
boundaries=dict(normalWrites=False,nativeWritersExecuted=False,newDCompletion=False,newACompletion=False,newMCompletion=False,humanApproval=False,humanTrial=False,M7Closure=False,actualLearnerPerformance=False)

v=json.loads(VP.read_text());assert pin(VP)['sha256']=='6364bf74c51628098fc8bfe10fd7cb5f86905779b761a838053f47b094889eba'
old=exact(v['originalActualImage']);corrected=exact(v['correctedActualImage']);prompt=exact(v['actualPrompt'])
assert corrected['sha256']=='2ffbcc818e716ad67eba62705fd94840dfe931425ceea86ebb969a773b7f6b77'
im=Image.open(corrected['path']);orig=Image.open(old['path'])
der=[]
for w in [360,680]:
    p=OUT/'inspection'/f'722-corrected-{w}.png';d=Image.open(p);assert d.size==(w,round(im.height*w/im.width));der.append(dict(file=pin(p),size=list(d.size),actuallyViewed=True))
v1=dict(
 artifactType='independent-informed-one-image-correction-review',reviewerId='independent-b-v1-722-followup',createdAtUTC=now,
 reviewMode='informed_targeted_correction_check_after_own_sealed_V10',reviewer=reviewer,priorRoleDisclosure=prior,
 reviewAuthority='ai_candidate',peerCurrentReviewRead=False,authorInput=pin(VP),actualPrompt=prompt,
 predecessorOwnSeal=pin(N/'chemie-current442-v10-independent-b-20261018-v1/SEAL.V10-current-goal-exact-image.independent-b.json'),
 goalId=v['goalId'],wholeCandidateGoal=v['wholeCandidateGoal'],candidateWholeGoalObjectSHA256=oh(v['wholeCandidateGoal']),
 originalImage=old,correctedImage=corrected,originalImageSize=list(orig.size),correctedImageSize=list(im.size),
 decision='KEEP_corrected_image',qaDecision='accepted_pilot_after_regeneration',aiApprovedAssetSha256=corrected['sha256'],
 actualInspection=dict(tool='view_image',nativeDetail='original',nativeActuallyViewed=True,derivatives=der,
                       PILUse='Only proportional inspection resizes; no product/source image edits by reviewer.'),
 findingsDe=[
  'Der zuvor belegte untere rechte zusätzliche Elektron-e−-Text samt falsch auf den Außenkreis zeigendem Pfeil ist tatsächlich entfernt. Der obere richtige Elektronenleiter bleibt am gelben Elektronenbeispiel; die gesonderte Hülle-Beschriftung bleibt links unten am Außenkreis.',
  'Goldfolie/α-Strahlungsübersicht, schematische Kern-Hülle-Anordnung und Proton-/Neutron-/Elektronbezeichnungen bleiben als qualitative Orientierung erhalten. Keine neue Teilchenart, Vorzeichenregel, Messzahl oder historische Erfolgsbehauptung wird hinzugefügt.',
  'Nativ wurden die verbliebenen Leiterziele und der entfernte Bereich geprüft. Bei360px bleiben Streuung und Kern/Hülle als Hauptmotiv erkennbar; bei680px sind die erhaltenen Teilchen- und Hülle-Labels lesbar. Ein Ablesen kleinster Details ist keine Lernaufgabe.',
  'Die neue PNG-Fassung hat1679×937 statt2752×1536Pixeln. Die annähernde16:9-Landschaftskomposition und übrige Bildaussage sind visuell erhalten; Pixelidentität außerhalb des Korrekturfelds wird wegen neuem Generatoroutput/Resampling ausdrücklich nicht behauptet.',
  'Der historische JPG-Originalpin stimmt weiterhin exakt mit dem beim V10-Review gelesenen Bild überein. Es gibt keine Anforderung, andere gültige Motive oder das ursprüngliche JPG umzuschreiben.'
 ],
 directionPerspective='Der falsche untere Leiter ist beseitigt; der gültige obere Elektronenleiter und die linke Hülle-Zuordnung bleiben verschieden. Keine dargestellte Person/Skala erfordert eine neue Perspektivkonvention.',
 formatDecision=dict(decision='accept_corrected_PNG_landscape',desktop680Height=round(im.height*680/im.width),heightCapPx=448,
                      formatNormalizationIsNotReasonForReplacement=True),
 historicalJpgActualPinUnchanged=True,historicalPromptFilesUnchanged='author declared; no independent historical prompt comparison claimed',
 normalVRegistrationExecuted=False,orientationOnly=True,boundaries=boundaries,
 counts=dict(imagePairsReviewed=1,nativeViews=1,phone360Views=1,desktop680Views=1,accepted=1,remainingCorrections=0,productEdits=0))
vp=write('V1.REVIEW.722-corrected-image.independent-b.json',v1)
vs=write('V1.SEAL.722-corrected-image.independent-b.json',dict(
 artifactType='independent-informed-visual-correction-seal',sealedAtUTC=now,reviewerId=v1['reviewerId'],reviewMode=v1['reviewMode'],
 priorRoleDisclosure=prior,peerCurrentReviewRead=False,review=vp,authorInput=v1['authorInput'],goalId=v1['goalId'],
 candidateWholeGoalObjectSHA256=v1['candidateWholeGoalObjectSHA256'],image=corrected,decision=v1['decision'],qaDecision=v1['qaDecision'],
 counts=v1['counts'],reviewAuthority='ai_candidate',normalRegistration=False,humanApproval=False,M7Claim=False))

p=json.loads(PP.read_text());assert pin(PP)['sha256']=='4461710537615396d8fe7711f72d0ca265063ccbe725390668bd96b8bf954fab'
source=exact(p['sourceAuthor']);author=json.loads(Path(source['path']).read_text());beforeBy={r['goalId']:r['profile'] for r in author['newCandidateGoals']}
findings=[]
for i,r in enumerate(p['records']):
    before=r['wholeBeforeProfile'];after=r['wholeProposedProfile'];assert before==beforeBy[r['goalId']]
    assert len(before['applicationCaseBriefs'])==1 and len(after['applicationCaseBriefs'])==2
    trimmed=dict(after);trimmed['applicationCaseBriefs']=after['applicationCaseBriefs'][:1];assert trimmed==before
    actual=exact(r['operativeMaterialSource']);material=json.loads(Path(actual['path']).read_text());assert material==r['completeUnchangedOperativeMaterial']
    added=after['applicationCaseBriefs'][1]
    exactCopy={field:added[field]==material['freshTransfer'][part][lang] for field,part,lang in [
      ('taskDemandDe','task','de'),('taskDemandEn','task','en'),('expectedPerformanceDe','expected','de'),('expectedPerformanceEn','expected','en')]}
    assert all(exactCopy.values()) and r['sameResponseMayCountTwice'] is False and r['newTaskQuota'] is False
    if i==0:
        baseline='Whole baseline: explain pressing/filtering versus triglyceride transesterification and sugar fermentation, distinguish vegetable oil/FAME/ethanol and the stated generation convention.30kg oil+70kg press cake closes the ideal100kg seed boundary; extraction recovery needs actual seed oil content. Renewable origin alone cannot prove climate neutrality.'
        changed='Fresh independent condition: waste wood via syngas and merely filtered rapeseed oil are newly supplied routes with misleading shared Biodiesel/neutral advertising. The learner must classify wood/syngas as second-generation/BTL context rather than FAME and filtered oil as still vegetable oil without transesterification, then explain missing climate boundaries.'
        independence='Simply repeating “renewable does not prove neutral” is insufficient for the second condition. A correct original route answer can coexist with the fresh error “both new products are FAME”; the fresh classification therefore checks a genuinely distinct application of the same expectation.'
        limits='No actual synthesis, new mechanism, FAME-production procedure or complete Fischer–Tropsch explanation is added. HB GK remains a route distinction; complete BTL/FT remains the separate existing LK duty.'
    else:
        baseline='Whole baseline: distinguish historical penicillin findings, development, scalable manufacture and access; evaluate the fictional presentA/Bfunding choices with stated equal efficacy/safety assumptions. Greater reach80/100 versus50/100, lower cost index3 versus5 and funded monitoring favourA only under these explicit assumptions, with values and missing data named.'
        changed='Fresh independent condition: new resistance evidence makes the old drug ineffective for some; robust comparison forB is absent. The learner must withdraw the equal-efficacy premise and old numerical ranking, request population/efficacy/safety evidence and reconsider research/monitoring without inventingBsuccess.'
        independence='A repeated unmodified preference forA based only on old cost/access figures fails the fresh condition. Baseline conditional judgment and explicit revision under loss of its premise are different observable reasoning, even though both belong to one expectation.'
        limits='No clinical efficacy, treatment, dosing, learner trial or real funding decision is claimed. HB232 remains LK only and SH remains explicit own retention within the existing target policy; no new scope or official universal medication duty arises from a second case brief.'
    findings.append(dict(
      goalId=r['goalId'],recommendation='accept_whole_P_successor_with_explicit_preexisting_transfer_binding',
      wholeGoalContext=r['wholeGoalContext'],wholeGoalContextObjectSHA256=oh(r['wholeGoalContext']),
      wholeBeforeProfile=before,wholeProposedProfile=after,beforeProfileObjectSHA256=oh(before),afterProfileObjectSHA256=oh(after),
      actualOperativeMaterial=actual,wholeMaterialObjectSHA256=oh(material),baselineAssessment=baseline,changedConditionAssessment=changed,
      independenceAssessment=independence,scopeAndPerformanceBoundary=limits,
      literalBilingualTaskAndExpectedCopy=exactCopy,
      originalBriefExact=True,everyOtherProfileFieldExact=True,coverageThresholdsExact=True,
      addedUnderstandingFocus='Faithful bounded summary of the actually supplied changed condition; no new fact, calculation, material or obligation.',
      antiDoubleCounting='The retained first brief remains whole-material navigation and already includes the fresh context. The appended brief exposes that existing subtask. One actual fresh response counts once even when reached through both brief entries. A rich single task can provide two distinct baseline/changed-condition reasoning pieces; after sufficient evidence no repeated task or second physical trial is required.',
      newTaskQuota=False,sameResponseCountsTwice=False,actualLearnerEvidencePresent=False,
      remainingScientificCorrections=0,nativePWriterExecuted=False))

p2=dict(
 artifactType='independent-informed-two-whole-P-explicit-preexisting-transfer-binding-review',createdAtUTC=now,
 reviewerId='independent-b-p2-transfer-bindings',reviewMode='informed_targeted_whole_profile_and_operative_material_check',
 reviewer=reviewer,priorRoleDisclosure=prior,peerCurrentReviewRead=False,recordStatus='candidate',reviewAuthority='ai_candidate',
 authorInput=pin(PP),originalSourceAuthor=source,
 actualReadScope='Both whole proposed profiles, their exact predecessor profiles, both whole current bilingual goal contexts and both actual complete operative author material files including baseline data/tasks/solutions/rubrics and freshTransfer task/expected. No peer judgment or historical package reapproval.',
 records=findings,
 conclusion='Both whole P successors are scientifically suitable. Only one explicit locator brief per profile is appended from already existing complete changed-condition material; all other fields, thresholds and original briefs stay exact. The material supports distinct baseline and changed-condition reasoning, but two file entries never turn one unchanged answer into two demonstrations.',
 stockBoundary='Author reports the unchanged builder requires2–8briefs; this review verifies two actual briefs each and their full content/material binding, not a stock builder/native writer execution.',
 noNewSourceOrTargetDecision=True,boundaries=boundaries,
 counts=dict(wholeProfilesReviewed=2,wholeMaterialsReviewed=2,accepted=2,remainingScientificCorrections=0,
             profilesWithExactlyTwoBriefs=2,literalCopiedTaskExpectedFields=8,newTasksInvented=0,newTaskQuotas=0,normalWrites=0,nativePWrites=0),
 objectHashRule='SHA256 of UTF-8 JSON with ensure_ascii=False, sorted object keys and comma/colon separators; file pins always hash actual bytes')
pp=write('P2.REVIEW.explicit-existing-transfer-bindings.independent-b.json',p2)
ps=write('P2.SEAL.explicit-existing-transfer-bindings.independent-b.json',dict(
 artifactType='independent-informed-P2-binding-review-seal',sealedAtUTC=now,reviewerId=p2['reviewerId'],reviewMode=p2['reviewMode'],
 priorRoleDisclosure=prior,peerCurrentReviewRead=False,review=pp,authorInput=p2['authorInput'],counts=p2['counts'],
 decisions=[dict(goalId=r['goalId'],wholeGoalContextObjectSHA256=r['wholeGoalContextObjectSHA256'],afterProfileObjectSHA256=r['afterProfileObjectSHA256'],
                 actualOperativeMaterial=r['actualOperativeMaterial'],recommendation=r['recommendation']) for r in findings],
 reviewAuthority='ai_candidate',normalRegistration=False,humanApproval=False,M7Claim=False))
print(json.dumps(dict(V1=dict(review=vp,seal=vs,counts=v1['counts']),P2=dict(review=pp,seal=ps,counts=p2['counts'])),ensure_ascii=False,indent=2))
