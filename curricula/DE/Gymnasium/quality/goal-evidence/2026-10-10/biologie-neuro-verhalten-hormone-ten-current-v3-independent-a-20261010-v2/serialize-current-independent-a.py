"""Serialize this reviewer's literal judgments after actual inspection; no auto approval."""
from pathlib import Path
import copy
import datetime
import hashlib
import json
import subprocess

BASE = Path(__file__).resolve().parent.relative_to(Path.cwd())
TECH = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-neuro-verhalten-hormone-ten-sehbahn-v3-current343-native-technical-successor-20261010-v2')
FIRST = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-neuro-verhalten-hormone-ten-first-independent-a-20261010-v1')
NATIVE = TECH / 'native/ten-current-native'

def read(p): return json.loads(Path(p).read_text())
def digest(p): return 'sha256:' + hashlib.sha256(Path(p).read_bytes()).hexdigest()
def binding(p):
    p = Path(p)
    assert p.is_file() and not p.is_symlink(), p
    assert subprocess.run(['git','check-ignore','-q',str(p)]).returncode == 1, p
    return {'path': str(p), 'sha256': digest(p), 'bytes': p.stat().st_size}
def write(name, x):
    p = BASE/name
    assert not p.exists(), p
    p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
    return p

entry = read(TECH/'neutral-current343-native-ten-Sehbahn-v3.entry.json')
freeze = read(TECH/'FINAL.current343-normal-P10-native10-Sehbahn-v3.technical.freeze.json')
fchecks = []
for key in ['ownFiles','requiredCurrentPortableExternalFiles']:
    for x in freeze[key]:
        actual = binding(x['path'])
        assert actual['sha256'] == x['sha256'] and actual['bytes'] == x['bytes'], x['path']
        fchecks.append(actual)
first = read(FIRST/'FIRST.whole-ten-independent.A.json')
campaign = read(NATIVE/'round-a/description-review-campaign.json')
inp = read(NATIVE/'round-a/description-review-input.json')
batch = campaign['batches'][0]
first_profiles = {x['goalId']:x for x in [json.loads(l) for l in Path(first['goalRows'][0]['positiveProfile']['path']).read_text().splitlines()]}
current_profiles = {x['goalId']:x for x in [json.loads(l) for l in Path(entry['coreInputs']['P10Current']['path']).read_text().splitlines()]}
assert len(first_profiles) == len(current_profiles) == 10

# Six independently written assertions per goal. No authored reasons are copied.
judgments = {
'9499943f-89b7-54e3-9fe2-e90404beaa4a': [
'Auge und Ohr verbinden reizaufnehmende Strukturen mit jeweils unterschiedlichen mechanischen und nervösen Funktionen; Reizleitung und Transduktion sind getrennte Schritte.',
'Eye and ear link stimulus-receiving structures with distinct mechanical and neural functions; transmission and transduction are separate stages.',
'Erklärt Linse, Netzhaut und Sehnerv sowie Trommelfell, Gehörknöchelchen, Haarzellen und afferenten Nerv anhand zweier kontrollierter Organmodelle.',
'Explains lens, retina and optic nerve alongside eardrum, ossicles, hair cells and the afferent nerve using two controlled organ models.',
'Begründet bei veränderter Blendenöffnung oder einer blockierten Übertragung, welche Modellbeobachtung sich ändern kann und welche reale Wahrnehmung damit nicht bewiesen ist.',
'For a changed aperture or blocked transmission, justifies which model observation may change and which real perception the model does not establish.'],
'2706c28e-1c21-50de-8a63-c450f5fe8b07': [
'Verbunden arbeitende Hirnareale ermöglichen Erkennen, Handlungsplanung und Gedächtnis; ein unterbrochener Knoten und eine unterbrochene Verbindung können verschiedene Leistungen beeinträchtigen.',
'Connected brain areas support recognition, action planning and memory; blocking a node and blocking a connection may impair different performances.',
'Deutet die vorgegebenen Netzwerk- und Gedächtnisbefunde mit kausalen Ablaufskizzen und unterscheidet Erkennensausfall von ausbleibender Ausführung.',
'Interprets the supplied network and memory observations with causal flow diagrams and distinguishes recognition failure from missing execution.',
'Vergleicht eine neue Verbindungsunterbrechung oder eine Aufmerksamkeitserklärung, ohne aus Modellbefunden eine individuelle neurologische Diagnose abzuleiten.',
'Compares a new connection interruption or an attention explanation without deriving an individual neurological diagnosis from model findings.'],
'a7eee23c-a5d0-5101-937a-ca441764cabf': [
'Großhirn, Kleinhirn, Hirnstamm und ausgewählte innere Bereiche haben unterschiedliche Beiträge, die bei alltäglichen Leistungen zusammenwirken.',
'Cerebrum, cerebellum, brainstem and selected inner regions contribute differently while cooperating in everyday performance.',
'Ordnet Hauptbereiche räumlich richtig und erklärt Wahrnehmung, Koordination, grundlegende Regulation sowie Thalamus, Hypothalamus und Hippocampus auf Überblicksniveau.',
'Locates the main regions correctly and gives an overview of perception, coordination, basic regulation, thalamus, hypothalamus and hippocampus.',
'Erläutert für eine neue Hunger- oder Navigationssituation passende regionale Beiträge, ohne eine gesamte Leistung ausschließlich einem Zentrum zuzuweisen.',
'Explains relevant regional contributions for a new hunger or navigation situation without assigning the entire performance exclusively to one center.'],
'146d70e0-b494-59fa-b8b6-29da18b36893': [
'Ein Gesichtsfeld wird nach retinaler Transduktion über teilweise kreuzende nasale und ungekreuzte temporale Fasern, thalamisches Relais und Sehstrahlung dem kontralateralen visuellen Cortex zugeleitet.',
'Following retinal transduction, a visual field reaches the contralateral visual cortex through crossing nasal and uncrossed temporal fibers, a thalamic relay and optic radiations.',
'Zeichnet einen begründeten Signalweg und unterscheidet den Ausfall eines Sehnervs, gekreuzter Fasern und eines Tractus opticus im gegebenen Modell.',
'Draws a justified signal route and distinguishes the effects of blocking an optic nerve, crossing fibers and an optic tract in the supplied model.',
'Leitet für die spiegelbildliche Gesichtsfeldseite oder eine neu benannte Leitungsunterbrechung den betroffenen Weg neu her; der Empfangspunkt liegt nicht am blinden Fleck.',
'Derives the route again for the mirrored visual field or a newly specified interruption; the reception point does not lie on the blind spot.'],
'97a15c19-c345-589e-8b3c-9f2b97a60095': [
'Mechanische Schallübertragung und Haarzell-Rezeptorpotentiale gehen über synaptische afferente Aktionspotentiale in eine über Relais beidseitig verarbeitete Hörbahn über.',
'Mechanical sound transmission and hair-cell receptor potentials lead through synaptic afferent action potentials into an auditory pathway processed bilaterally through relays.',
'Erklärt den Weg über Außenohr, Trommelfell, Gehörknöchelchen, Cochlea, Haarzellen und zentrale Relais und ordnet hohe bzw. tiefe Frequenzen begründet zu.',
'Explains the route through outer ear, eardrum, ossicles, cochlea, hair cells and central relays and justifies high and low frequency locations.',
'Vergleicht eine neu blockierte mechanische oder synaptische Stufe und begrenzt Aussagen zu zentralen Ausfällen durch die beidseitige Verschaltung.',
'Compares a newly blocked mechanical or synaptic stage and limits claims about central failure in light of bilateral processing.'],
'5670e999-922c-5862-ba77-2d93667badd4': [
'Nozizeptive Signale, spinale Reflexe und subjektives Schmerzerleben sind unterscheidbar; periphere und zentrale Verarbeitung einschließlich absteigender Modulation beeinflussen den Informationsfluss.',
'Nociceptive signals, spinal reflexes and subjective pain experience are distinct; peripheral and central processing including descending modulation affect information flow.',
'Erklärt einen Reflex-/Berichtsvergleich und deutet unterschiedliche spinale Ausgänge bei gleichem Eingang mit einer begrenzten Modulationsskizze.',
'Explains a reflex/report comparison and interprets different spinal outputs for the same input using a bounded modulation diagram.',
'Prüft eine neue Verstärkung bei unverändertem Eingang als mögliche Sensitivierung, ohne synthetische Signalwerte als Schmerzskala oder Diagnose auszugeben.',
'Examines new amplification with unchanged input as possible sensitization without treating synthetic signal values as a pain scale or diagnosis.'],
'1f3cdf59-05e0-5d45-ae74-3d2d1a2c31a5': [
'Insulin und Glucagon regeln über Zielgewebe den Glukosespiegel mit negativer Rückkopplung; Typ-1-Betazellverlust und Typ-2-Insulinresistenz sind unterschiedliche Mechanismen.',
'Insulin and glucagon regulate glucose through target tissues and negative feedback; type 1 beta-cell loss and type 2 insulin resistance are different mechanisms.',
'Erstellt zwei begründete Regelkreise mit Hormonsignalen, Leberfreisetzung und angemessener Aufnahme und beurteilt die begrenzte Aussagekraft vorgelegter Risikodaten.',
'Constructs two justified feedback loops with hormonal signals, hepatic release and appropriate uptake and evaluates the limited meaning of the supplied risk data.',
'Vergleicht bei geändertem Zielgewebe-Ansprechen den Rückkopplungsverlauf und trennt multifaktorielle Risikoassoziationen von individuellen Ursachen und Schuldzuweisungen.',
'Compares feedback after changed target-tissue response and separates multifactorial risk associations from individual causation and blame.'],
'3d822550-c14a-52ee-9908-6bcb873afdd6': [
'Beobachtetes Verhalten hängt von reaktionsauslösenden Reizen und innerem Zustand ab; kontrollierte Attrappenvergleiche können ihre Beiträge begrenzt untersuchen.',
'Observed behavior depends on triggering stimuli and internal state; controlled dummy comparisons can investigate their contributions within limits.',
'Vergleicht vorgegebene Reaktionsdaten mit definiertem Verhalten, passenden Kontrollen und konstanten Attrappenmerkmalen und stellt einen nachvollziehbaren Versuchsplan auf.',
'Compares supplied response data using defined behavior, suitable controls and constant dummy features and constructs a reproducible experimental plan.',
'Erkennt im neuen Abstand- oder Formvergleich den Störfaktor und plant eine kontrollierte Variation statt allen Tieren dieselbe Absicht zuzuschreiben.',
'Recognizes the confound in a new distance or shape comparison and plans a controlled variation rather than assigning the same intention to every animal.'],
'5dd66bfd-616f-5a2a-be7c-49aaf12581a0': [
'Herkunft, Aufzucht und Training können verschiedene Beiträge zur Verhaltensausprägung stützen; Anlage und Erfahrung wirken zusammen und lassen sich nicht durch einen einzelnen Vergleich vollständig trennen.',
'Origin, rearing and training can support different contributions to behavior; predisposition and experience interact and cannot be fully separated by a single comparison.',
'Beurteilt Aufzucht- und Trainingsdaten mit abgestuften Schlussfolgerungen, konstanten Bedingungen und ausdrücklich benannten alternativen Ursachen.',
'Evaluates rearing and training data using graded conclusions, constant conditions and explicitly named alternative causes.',
'Erklärt bei neuer Alters- oder Aufzuchtvariation die verringerte kausale Aussagekraft und vermeidet absolute genetische oder reine Lerndetermination.',
'Explains reduced causal interpretability after a new age or rearing variation and avoids absolute genetic or exclusively learned determination.'],
'5a5eeff5-ae97-5b5b-bc80-df03eba8e095': [
'Klassische Paarung und operante Kontingenz begründen unterschiedliche Lernpläne; Kontrolle und Ausgangsmessung trennen Lernen von Wiederholung, Gewöhnung oder Positionspräferenz.',
'Classical pairing and operant contingency support different learning designs; controls and baseline measurements distinguish learning from repetition, habituation or position preference.',
'Plant einen gepaarten/unpaarigen Reizvergleich und einen kontingenten/nichtkontingenten Folgenvergleich mit Messkriterium, konstanten Bedingungen, Replikation und begrenztem fairen Artvergleich.',
'Plans a paired/unpaired stimulus comparison and a contingent/noncontingent consequence comparison with a measurement criterion, constant conditions, replication and a bounded fair species comparison.',
'Prüft eine ebenfalls ansteigende Kontrolle oder eine neue Positionspräferenz und passt den Plan so an, dass die Schlussfolgerung über Lernen weiterhin begründet ist.',
'Examines a rising control or a new position preference and adapts the design so that a conclusion about learning remains justified.']}
assert set(judgments) == set(batch['goalIds']) == set(first_profiles)
keys = ['essentialUnderstandingDe','essentialUnderstandingEn','observablePerformanceDe','observablePerformanceEn','transferExpectationDe','transferExpectationEn']
records=[]; rows=[]; independent_first={x['goalId']:x for x in first['goalRows']}
for g in inp['goals']:
    gid=g['goalId'];old=first_profiles[gid];cur=current_profiles[gid]
    assert cur['profile'] == old['profile']
    assert cur['reviewId'] == old['reviewId'] == 'biologie-neuro-verhalten-hormone-ten-whole-material-author-candidate-v1'
    assert g['reviewContext']['evidenceProfile'] == cur
    assert cur['status']=='needs_human_review' and cur['reviewAuthority']=='ai_candidate' and cur['evidenceLevel']=='E1' and cur['maximumClaimScope']=='G1'
    rec={k:g[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']}
    own=independent_first[gid]
    rec.update({'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json','schemaVersion':1,'recordId':'bio10-current-v3-A.'+gid,'runId':batch['batchId'],'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'bundleFingerprint':inp['bundleFingerprint'],'bookDigest':inp['bookDigest'],'decision':'keep','understandingEvidence':dict(zip(keys,judgments[gid])),'rationale':own['independentReason']+' Tatsächliche aktuelle ganze HTML/PDF-Seite und kanonischer DE/EN-/P-Kontext geprüft: präziser Leistungsoperator, eigener Transfer, keine Beschreibungskorrektur erforderlich. Die begrenzte Quellenpräzisierung ist keine neue Kursfreigabe.','evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':'none','recordStatus':'candidate','reviewAuthority':'ai_candidate'})
    records.append(rec)
    row=copy.deepcopy(own)
    row.update({'descriptionContentDecision':'keep_current_native_independent_A','positiveWholeScienceDecision':'ready_current_independent_A_E1_G1_candidate','positiveProfile':binding(entry['coreInputs']['P10Current']['path']),'currentGoalFingerprint':g['goalFingerprint'],'currentPageFingerprint':g['pageFingerprint'],'currentReviewInputFingerprint':cur['reviewInputFingerprint'],'currentProfileFingerprint':cur['profileFingerprint'],'nativeHTMLReviewed':True,'nativePDFReviewed':True,'currentCanonicalAndPageContextReviewed':True,'actualCurrentNativeHTML':binding(entry['actualCurrentRastersAndNativeCaptures'][gid]['nativeHTMLPage']['path']),'actualCurrentNativePDF':binding(entry['actualCurrentRastersAndNativeCaptures'][gid]['nativePDFPage']['path']),'rawVisualDecision':'ready_current_independent_A_candidate','actualCurrentRasterViews':entry['actualCurrentRastersAndNativeCaptures'][gid],'sourceCourseApproval':False,'humanApproval':False,'humanTrial':False})
    if gid=='146d70e0-b494-59fa-b8b6-29da18b36893':
        row['visualFinding']='Historical FIRST v2 HOLD resolved by actual targeted v3 inspection: retinal reception point visibly above and separate from optic nerve/vessel exit in original360680 and whole current HTML/PDF. Partial crossing and thalamic relay remain coherent.'
        row['actualRasterViews']=entry['actualCurrentRastersAndNativeCaptures'][gid]
    rows.append(row)

BASE.mkdir(exist_ok=True)
resultdir=BASE/'current-results';resultdir.mkdir(exist_ok=True)
started=datetime.datetime.now(datetime.timezone.utc).isoformat()
recordpath=resultdir/(batch['batchId']+'.records.jsonl')
assert not recordpath.exists()
recordpath.write_text(''.join(json.dumps(x,ensure_ascii=False)+'\n' for x in records))
parameters={'mode':'independent actual human-visible Codex tool review','preciseRuntimeModelVersionExposed':False,'samplingTemperatureExposed':False,'reviewCompletedBeforeSerialization':True,'manifestTimesDescribeSerializationPhase':True,'blindToPeerB':True,'authorReasonsAdopted':False}
parampath=write('generation-parameters.actual.json',parameters)
run={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':batch['batchId'],'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint'],'bundleFingerprint':inp['bundleFingerprint'],'bookDigest':inp['bookDigest'],'provider':'OpenAI Codex','model':'GPT-6 Codex; precise runtime model version not exposed','role':'subject_reviewer','promptFamilyId':'goal-description-understanding-evidence-v2','promptFingerprint':campaign['promptFingerprint'],'criteriaFingerprint':campaign['criteriaFingerprint'],'generationParametersFingerprint':digest(parampath),'independenceGroupId':campaign['independenceGroupId'],'blindToOtherRuns':True,'goalIds':batch['goalIds'],'inputArtifacts':[{'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']},{'role':'book_model','digest':digest(NATIVE/'bundle/book-model.json')},{'role':'book_html','digest':digest(NATIVE/'bundle/book.html')},{'role':'book_pdf','digest':digest(NATIVE/'bundle/book.pdf')},{'role':'review_prompt','digest':campaign['promptFingerprint']},{'role':'review_criteria','digest':campaign['criteriaFingerprint']}],'startedAt':started,'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'completed','outputDigest':digest(recordpath),'toolchainVersion':'goal-description-understanding-evidence-v2'}
write(Path('current-results')/(batch['batchId']+'.run.json'),run)
paths={x['path'] for x in fchecks}
paths.update(str(FIRST/n) for n in ['FIRST.whole-ten-independent.A.json','FIRST.whole-ten-independent-A.freeze.json','FIRST.actual-input-bindings.A.json','independent-first-review.A.md'])
paths.update([str(TECH/'neutral-current343-native-ten-Sehbahn-v3.entry.json'),str(TECH/'FINAL.current343-normal-P10-native10-Sehbahn-v3.technical.freeze.json')])
bindings=write('current-actual-input-bindings.A.json',{'schemaVersion':1,'actualVerifiedRegularCommittableInputCount':len(paths),'scientificReviewScope':'Own FIRST whole10science20cases41witnesses retained; current canonical/page/P10 read, original360680 Sehbahn-v3 and actual20nativepages viewed; other portable primary checks are technical only.','files':[binding(p) for p in sorted(paths)]})
report={'schemaVersion':1,'reviewId':BASE.name,'reviewerAgent':'/root/chemistry_rollout_report_review','role':'independent subject reviewer A, no author role','reviewAuthority':'ai_candidate','status':'needs_human_review','evidenceLevel':'E1','maximumClaimScope':'G1','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'firstReview':binding(FIRST/'FIRST.whole-ten-independent.A.json'),'firstFreeze':binding(FIRST/'FIRST.whole-ten-independent-A.freeze.json'),'neutralCurrentEntry':binding(TECH/'neutral-current343-native-ten-Sehbahn-v3.entry.json'),'neutralCurrentFreeze':binding(TECH/'FINAL.current343-normal-P10-native10-Sehbahn-v3.technical.freeze.json'),'wholeGoalCount':10,'wholeCaseCount':20,'nativeHTMLWholePagesActuallySeen':10,'nativePDFWholePagesActuallySeen':10,'actualCurrentOriginal360680Views':30,'freshSuccessorOriginal360680Views':3,'nineExactFirstRasterReviewsRetained':True,'allTenWholeProfilesAndTwentyCasesExactOwnFIRST':True,'descriptionRecords':binding(recordpath),'normalDescriptionCampaignAValidation':'PENDING run after serialization','goalRows':rows,'sourcePrecisionCorrectionDecision':first['sourcePrecisionCorrectionDecision'],'sourcePreservation':first['sourcePreservation'],'source41CurrentWholeObjects':entry['coreInputs']['source41CurrentWholeObjects'],'sourceCourseHoldsRetained':True,'sourceAndCourseApproval':False,'sourceCorrectionScope':'six truthful authoredOperationalization/partial precision corrections against actual HE page43; no invented official subclauses, no whole-goal or GK/LK approval','independentPeerVerdictsRead':False,'authorVerdictsAdopted':False,'strictActiveGain':0,'protectedCurrentBiologyStrictCount':343,'operativeWrites':0,'humanApproval':False,'humanTrial':False,'actualExperimentPerformed':False,'openGates':['independent B and ordinary operative integration/central strict gate report','whole-source and course limitations retained','human release/trial gates remain separate'],'methodology':binding(BASE/'current-native-followup.A.md'),'inputBindings':binding(bindings)}
report['sourcePreservation'] = copy.deepcopy(first['sourcePreservation'])
sp = report['sourcePreservation']
sp['historicalFIRST31SourcePairBindingsUnmodified'] = sp.pop('current31SourcePairBindingsUnmodified')
sp['currentSharedHEPairPathsSubstituted'] = True
sp['current129ProtectedMetadataBindingsRequireTargetedRestoration'] = True
sp['sourcePairPathSubstitutionIsNotNewSubjectReview'] = True
write('current-native-ten-independent.A.json',report)
write('current-input-equality.actual-checks.A.json',{'schemaVersion':1,'tenWholeProfilesExactOwnFIRST':True,'twentyWholeCasesExactOwnFIRST':True,'literalReviewIdRetained':True,'PStatus':'needs_human_review','reviewAuthority':'ai_candidate','evidenceLevel':'E1','maximumClaimScope':'G1','approved':0,'actualNeutralOwn113AndExternal407BindingsVerified':len(fchecks),'regularPortableInputBindingsVerified':len(paths),'scienceReviewConferredByHashChecks':False,'humanApproval':False})
print(json.dumps({'records':str(recordpath),'report':str(BASE/'current-native-ten-independent.A.json'),'recordsSHA':digest(recordpath),'inputBindings':len(paths),'technicalFreezeFilesVerified':len(fchecks)}))
