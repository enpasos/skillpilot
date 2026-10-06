#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Targeted title resolution and exact reuse of this agent's fourteen earlier judgments."""
from pathlib import Path
import json,hashlib,datetime
OWN=Path(__file__).resolve().parent
OLD=OWN.parent/'chemie-q1-fifteen-current-independent-d-a-v1'
PREP=OWN.parent/'chemie-q1-fourteen-current-native-candidate-v4'
ROUND=PREP/'native-finalbook/round-a'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def dump(p,v):p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
c=json.loads((ROUND/'description-review-campaign.json').read_text());b=c['batches'][0]
goals=[json.loads(v)['goal'] for v in (ROUND/'batches'/(b['batchId']+'.input.jsonl')).read_text().splitlines()]
oldrecordsfile=next((OLD/'results').glob('*.records.jsonl'))
oldrecords={v['goalId']:v for v in [json.loads(x) for x in oldrecordsfile.read_text().splitlines()]}
proof=json.loads((OWN/'actual-own-full-input-delta-and-preparation.receipt.json').read_text())
unchanged={v['goalId'] for v in proof['ownWholeGoalInputComparison'] if v['wholeNativeGoalObjectExact']}
assert len(unchanged)==14
target='70b34ae7-4481-590c-9a02-516464750832'
runid='chemie-q1-fifteen-current-independent-d-a-20261005-v2'
assert not (OWN/'results').exists()
records=[]; reuse=[]
for i,g in enumerate(goals,1):
 old=oldrecords[g['goalId']]
 if g['goalId'] in unchanged:
  assert old['decision']=='keep'
  rationale='Gezielte v4-Fortsetzung: Der gesamte aktuelle native Zieleingang einschließlich DE/EN, Ziel-/Seitenfingerprints, Voraussetzungen/Folgezielen, Seitenkontext und Bild ist nach eigenem vollständigem Vergleich exakt v3-gleich. Das nachfolgende eigene, tatsächlich am v3-PDF/HTML/Originalquellen vorgenommene fachliche Urteil bleibt erhalten; es wird keine neue Fachprüfung aus einem globalen Hashwechsel behauptet. '+old['rationale']
  reuse.append({'goalId':g['goalId'],'oldRecordId':old['recordId'],'newRecordId':f'{runid}.record-{i:03}','fullNativeGoalInputExactlyEqual':True,'ownScientificSixFieldsExactlyEqual':True,'ownPriorDecision':'keep','currentDecision':'keep'})
 else:
  assert g['goalId']==target and old['decision']=='block'
  assert g['currentTitleEn']=='Explain ester formation and ester properties'
  rationale='KEEP nach tatsächlicher gezielter Auflösung des eigenen EN-Titelbefunds q1-d-a-en-ester-title-001. Der aktuelle englische Titel Explain ester formation and ester properties entspricht nun dem deutschen Operator und der Eigenschaftsreichweite. Die vollständigen DE/EN-Beschreibungen, Quellenkomponenten, GK/LK-Anspruch, Vor-/Folgezielkontexte und exact JPG/Alt sind unverändert. Aktuelle vollständige native PDF-physische S.5 und frisch geladenes HTML mit physischem v4-Bild wurden tatsächlich gelesen. Das aktuell materialisierte positive Profil wurde vollständig fachlich gelesen: Beobachtungsdaten → Kondensation → Wechselwirkungen/Eigenschaft/Nutzung und frischer Esterfall passen, Geruch ist kein alleiniger Identitätsnachweis. Profilpayload ist exakt v3-gleich, Status ehrlich ai_candidate/needs_human_review E1/G1; im eigentlichen D-Batch ist weiterhin kein Profil eingebunden. BY trägt den tatsächlichen vollständigen Beobachtungs-/Eigenschaftsoperator, HE nur den eigenen Anteil der umfassenderen Esterzeile; diese ganze Quellenzeile wird hier nicht geschlossen. Atomarität ist die kohärente Esterbildung-/Struktur-Eigenschaft-Kompetenz, keine neu eingeführte Planungsroutine. Historischer BLOCK bleibt unverändert erhalten, diese neue aktuelle Prüfung löst ausschließlich seinen konkreten Titelfehler auf.'
 rec={'$schema':old['$schema'],'schemaVersion':1,'recordId':f'{runid}.record-{i:03}','runId':runid,'campaignId':c['campaignId'],'roundId':c['roundId'],'bundleFingerprint':c['bundleFingerprint'],'bookDigest':c['bookDigest']}
 for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']:rec[k]=g[k]
 rec.update(decision='keep',understandingEvidence=old['understandingEvidence'],rationale=rationale,evidenceProfileContract='positive-understanding-evidence-v2',evidenceProfileRecommendation='create',recordStatus='candidate',reviewAuthority='ai_candidate');records.append(rec)
out=OWN/'results';out.mkdir();rp=out/(b['batchId']+'.records.jsonl');rp.write_text(''.join(json.dumps(v,ensure_ascii=False,separators=(',',':'))+'\n' for v in records))
dump(OWN/'own-unchanged-fourteen-science-reuse.receipt.json',{'priorOwnRecordsPath':str(oldrecordsfile),'priorOwnRecordsSHA256':sha(oldrecordsfile),'proofPath':str(OWN/'actual-own-full-input-delta-and-preparation.receipt.json'),'proofSHA256':sha(OWN/'actual-own-full-input-delta-and-preparation.receipt.json'),'rows':reuse,'noNewScientificReviewClaimForThese14':True,'otherDReviewsRead':False})
params={'reviewer':'independent OpenAI Codex subagent D-A','samplingParameters':'Not separately exposed by this orchestration','targetedActuallyRevisitedGoalId':target,'unchanged14OwnScientificJudgmentsReusedAfterFullInputEqualityProof':True,'ownFirstPassHistoricalBlockPreserved':True,'actualCurrentTargetPDFAndHTMLRead':True,'actualCurrentTargetNativePRead':True,'otherCurrentOrHistoricalExternalDVerdictsRead':False,'humanApproval':False,'humanTrial':False,'activeWrites':0};dump(OWN/'generation-parameters.json',params)
bundle=json.loads((ROUND/'review-bundle-manifest.json').read_text());run={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':runid,'campaignId':c['campaignId'],'roundId':c['roundId'],'batchId':b['batchId'],'batchInputFingerprint':b['batchInputFingerprint'],'bundleFingerprint':c['bundleFingerprint'],'bookDigest':c['bookDigest'],'provider':'OpenAI Codex','model':'Codex reviewer; exact model identifier not exposed','role':'subject_reviewer','promptFamilyId':'goal-description-understanding-evidence-v2','promptFingerprint':c['promptFingerprint'],'criteriaFingerprint':c['criteriaFingerprint'],'generationParametersFingerprint':'sha256:'+sha(OWN/'generation-parameters.json'),'independenceGroupId':c['independenceGroupId'],'blindToOtherRuns':True,'goalIds':b['goalIds'],'inputArtifacts':[{'role':v['role'],'digest':v['digest']} for v in bundle['artifacts']]+[{'role':'description_review_batch_input_jsonl','digest':b['batchInputFingerprint']}],'startedAt':proof['startedAt'],'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'completed','outputDigest':'sha256:'+sha(rp),'toolchainVersion':'goal-description-review-v1'};dump(out/(b['batchId']+'.run.json'),run)
dump(OWN/'independent-current-finding-resolution.json',{'findingId':'q1-d-a-en-ester-title-001','goalId':target,'historicalFindingPath':str(OLD/'independent-current-findings.json'),'historicalFindingUnchanged':True,'status':'resolved_for_exact_current_v4_input_after_actual_review','currentTitleEn':'Explain ester formation and ester properties','currentGoalFingerprint':next(v for v in goals if v['goalId']==target)['goalFingerprint'],'currentPageFingerprint':next(v for v in goals if v['goalId']==target)['pageFingerprint'],'currentBookDigest':c['bookDigest'],'currentBundleFingerprint':c['bundleFingerprint'],'actualCurrentPDFPhysicalPageViewed':5,'actualCurrentLoadedHTMLViewed':True,'fullCurrentDEENAndScopeRead':True,'currentSourceAndImageBindingPreservedAndActuallyChecked':True,'actualNativePositiveProfileRead':True,'nativeDInputEvidenceProfileStillNull':True,'all15NativeDecisionsKeep':True,'newIndependentScientificClosuresActive':0,'humanApproval':False,'humanTrial':False,'otherDReviewsRead':False,'activeWrites':0});print('15 current KEEP; own 14 science reused with exact complete-input proof; own target BLOCK resolved by actual targeted review')
