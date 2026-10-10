# SPDX-License-Identifier: Apache-2.0
import hashlib
import json
import re
import unicodedata
from datetime import datetime, timezone
from pathlib import Path

OWN = Path(__file__).resolve().parent
ROOT = OWN.parents[6]
AUTHOR = OWN.parent / 'biologie-q1-eight-title-methyl-current-native-technical-author-successor-v2'
E = json.loads((AUTHOR / 'neutral-eight-title-methyl-current-native.independent-review.entry.json').read_text())
C = (ROOT / E['normalIndependentCampaignB']['path']).parent
campaign = json.loads((C / 'description-review-campaign.json').read_text())
inputs = json.loads((C / 'description-review-input.json').read_text())
bundle = json.loads((C / 'review-bundle-manifest.json').read_text())
old_records = next((OWN.parent / 'biologie-q1-eight-current-native-independent-b-20261010-v1/results').glob('*.records.jsonl'))
old = {q['goalId']: q for q in map(json.loads, old_records.read_text().splitlines())}
run_id = 'biologie-eight-title-methyl-current-native-independent-b-20261010-v1'
gid = '3312b2bb-bc90-5c0f-a859-4b4f9b8ff117'
def sha(q): return 'sha256:' + hashlib.sha256(q.read_bytes()).hexdigest()
def dump(q, v): q.parent.mkdir(exist_ok=True); q.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')

records=[]
for g in inputs['goals']:
    evidence = old[g['goalId']]['understandingEvidence']
    if g['goalId'] == gid:
        decision='block'
        rationale=('Die zwei aktuellen Titel sind jetzt mit der unveränderten beschreibenden DE/EN-Kompetenz und den ganzen gültigen synthetischen P-Fällen vereinbar; eine allgemeine Simulation ist nicht gefordert. Der titelbezogene Teil meiner ursprünglichen Finding BIO8-D-B-001 ist damit behoben. Der aktuelle genaue Quellenbezug bleibt aber ungeklärt: die gebundene HE-Zeile8229f9d4/Q1.5.2 wird als officialCompetency mit exact-Kante geführt, während ihr beschreibender Wortlaut aus der früheren Source-JSON-Autoroperationalisierung stammt. Ich habe die amtlichen ganzen HE-Primärseiten38/40 erneut tatsächlich gelesen: Q1.5 nennt als LK-Prinzip Steuerung der Genaktivität in verschiedenen Entwicklungsphasen und Lebewesen, Telomere/Zellalterung und Homöobox-Gene; die verbindlichen Themenfelder sind1–3. Diese Primärseite enthält die behauptete genaue Beschreibungszeile nicht. Auch die ganzen BY-EA-/GA-Originalkontexte legen keinen solchen exakten Rückkopplungs-/Signalwegoperator fest. Eine gezielt geprüfte begrenzte Prinzip-/Teilbeitragszuordnung mit wahrer authored-operationalization-Provenienz ist möglich, ist in dieser unveränderten exact-/officialCompetency-Bindung aber nicht belegt. Source-Identity/Operator-Hold BIO8-D-SOURCE-B-003 bleibt offen. Tatsächliche aktuelle HTML-/PDF-Seite und ihre Querverweise sind geprüft; keine ganze HE/BY-Kursfreigabe.')
    else:
        decision='keep'
        rationale=old[g['goalId']]['rationale'] + (' Die vollständige aktuelle Nachfolgerseite wurde jetzt erneut als unverändertes originales HTML und PDF tatsächlich angesehen. Die sieben Semantikkörper und die ganzen12 wissenschaftlichen Materialien/Profile sind exakt erhalten; gültige eigene frühere fachliche Fallurteile werden wiederverwendet und nicht als neue Fallprüfung ausgegeben. Ganze amtliche Quellen-/Kurs-/Hox-Pflichten bleiben getrennt offen.')
        if g['goalId'].startswith('52ecc'):
            rationale += ' Die tatsächliche aktuelle Rückverweiszeile benennt3312 jetzt richtig als Beschreibung komplexer Rückkopplungen oder Signalwege und führt keinen neuen Simulation-Auftrag ein.'
        if g['goalId'].startswith('995444'):
            rationale += ' Das korrigierte tatsächliche PNG und seine360/680-Ansichten zeigen den CH3-Stiel an einer ausdrücklich mitC bezeichneten Base einesC–G-Paares, nicht am äußeren DNA-Rückgrat; auch der Locator verweist auf dieselbe markierteBase. Rechts bleibt Ac am Histonschwanz. Die frühere ortsbezogene V-Finding ist dadurch eng aufgelöst; bekannte fremde V-Reparaturergebnisse sind offengelegt, keine neue blinde V-Paarrunde behauptet.'
    records.append({'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
      'schemaVersion':1,'recordId':run_id+'.'+g['goalId'],'runId':run_id,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],
      'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],
      **{k:g[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']},
      'decision':decision,'understandingEvidence':evidence,'rationale':rationale,
      'evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':'none',
      'recordStatus':'candidate','reviewAuthority':'ai_candidate'})
batch=campaign['batches'][0];assert [q['goalId'] for q in records]==batch['goalIds']
results=OWN/'results';results.mkdir();rp=results/(batch['batchId']+'.records.jsonl')
rp.write_text(''.join(json.dumps(q,ensure_ascii=False,separators=(',',':'))+'\n' for q in records))
parameters={'scope':'actual current native8 and targeted3312 title/source/A/M review','currentDPeerJudgmentsRead':False,
 'previousOwnD7AndWholeP8JudgmentsReusedTransparently':True,'knownPeer995RepairOutcome':True,'noSamplingParametersInvented':True}
dump(OWN/'generation-parameters.actual.json',parameters)
dump(results/(batch['batchId']+'.run.json'),{'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
 'schemaVersion':1,'runId':run_id,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'batchId':batch['batchId'],
 'batchInputFingerprint':batch['batchInputFingerprint'],'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],
 'provider':'OpenAI','model':'Codex active model; exact version not exposed','role':'subject_reviewer',
 'promptFamilyId':'goal-description-understanding-evidence-review-v2','promptFingerprint':campaign['promptFingerprint'],
 'criteriaFingerprint':campaign['criteriaFingerprint'],'generationParametersFingerprint':sha(OWN/'generation-parameters.actual.json'),
 'independenceGroupId':campaign['independenceGroupId'],'blindToOtherRuns':True,'goalIds':batch['goalIds'],
 'inputArtifacts':[{'role':a['role'],'digest':a['digest']} for a in bundle['artifacts']]+[
  {'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']}],
 'startedAt':datetime.fromtimestamp((OWN/'author-final-neutral-freeze.independent-actual-verification.json').stat().st_mtime,timezone.utc).isoformat(),
 'completedAt':datetime.now(timezone.utc).isoformat(),'status':'completed','outputDigest':sha(rp),'toolchainVersion':'skillpilot-normal-native-review-v1'})

whole=json.loads((ROOT/E['neutralWholeFirstInputs']['whole479CurrentGoalBodiesWithTwoTitleFieldsAndEightRasterLinks']['path']).read_text())
goal=next(g for g in whole['goals'] if g['id']==gid)
norm=lambda v: re.sub(r'\s+',' ',unicodedata.normalize('NFKC',str(v if v is not None else ''))).strip()
def fp(g,rule):
    dims=g.get('dimensionTags',{})
    value={'ruleVersion':rule,'goalId':g['id'],'shortKey':g.get('shortKey',''),
      'title':norm(g.get('title')),'titleEn':norm(g.get('titleEn')),
      'description':norm(g.get('description')),'descriptionEn':norm(g.get('descriptionEn')),
      'phase':norm(dims.get('phase')),'area':norm(dims.get('area')),'topicCode':norm(dims.get('topicCode')),'nodeKind':norm(g.get('nodeKind'))}
    return 'sha256:'+hashlib.sha256(json.dumps(value,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
historical=json.loads((ROOT/E['neutralWholeFirstInputs']['wholePriorA12M12RetainedNotCurrent3312Approval']['path']).read_text())
all_goals={g['id']:g for g in whole['goals']}; retained=[]
for kind in ['semanticAtomicityConfigPath','memoryReviewConfigPath']:
 for row in historical[kind]['rows']:
  if row['goalId'] in E['priorityGoalIds'] and row['goalId']!=gid:
   assert row['fingerprint']==fp(all_goals[row['goalId']],row['ruleVersion'])
   retained.append({'lane':kind,'goalId':row['goalId'],'wholeHistoricalRecord':row,'currentFingerprintExact':True})
assert len(retained)==14
dump(OWN/'unchanged-seven-AM-records-and-current-fingerprints.actual.json',{'schemaVersion':1,'records':retained,
 'old3312FingerprintNotReboundWithoutNewSemanticJudgment':True,'historicalWrites':0,'activeWrites':0})
review='biologie-3312-descriptive-current-independent-b-20261010-v1'
now=datetime.now(timezone.utc).isoformat()
atomic={'schemaVersion':1,'reviewId':review,'ruleVersion':'semantic-atomicity-v1','landscapeId':whole['landscapeId'],
 'goalId':gid,'fingerprint':fp(goal,'semantic-atomicity-v1'),'status':'atomic','semanticAtomic':True,'reviewedAt':now,
 'reviewer':'Codex independent current native reviewer B /root/ci_current_run',
 'reason':'Genuine targeted semantic assessment after the two-title correction: one assessable descriptive competence follows how a biological input, regulators and a gene product interact through a pathway that may include feedback. Feedback and pathways are alternative forms of this one regulatory relationship, not independent unrelated routines. The unchanged full supplied discrete/Boolean cases make causal direction, time delay and model limits observable; arithmetic is an explicitly supplied aid and not a new general simulation/programming competence. This semantic atomicity decision does not release the retained primary-source identity/operator hold or whole HE/BY scope.'}
memory={'schemaVersion':1,'reviewId':review,'ruleVersion':'memory-card-review-v1','landscapeId':whole['landscapeId'],
 'goalId':gid,'fingerprint':fp(goal,'memory-card-review-v1'),'status':'no_memory_needed','memoryUseful':False,
 'memoryGoalIds':[],'deckIds':[],'reviewedAt':now,'reviewer':atomic['reviewer'],
 'reason':'Genuine current3312 memory decision: competence is describing/interpreting an explicitly supplied regulatory structure, causal direction, delay and a changed intervention. Rules, variables and initial conditions are furnished in the full cases; no compact isolated fact, formula or term requires a new mandatory recall deck. Existing prerequisites support terminology. An extra SRS deck would not demonstrate this relational understanding. No cards/decks/visibility changes are justified; full existing card/visibility gates remain separate. Primary-source identity/operator and whole-course holds remain open.'}
for lane,row in [('atomicity',atomic),('memory',memory)]:
 d=OWN/lane;d.mkdir();path=d/'current3312.review.jsonl';path.write_text(json.dumps(row,ensure_ascii=False,separators=(',',':'))+'\n')
 config={'schemaVersion':1,'reviewId':review,'ruleVersion':row['ruleVersion'],'landscapeId':whole['landscapeId'],
   'landscapePath':E['neutralWholeFirstInputs']['whole479CurrentGoalBodiesWithTwoTitleFieldsAndEightRasterLinks']['path'],
   'reviewPath':str(path.relative_to(ROOT)),'scope':{'label':'Only the genuinely re-reviewed current descriptive3312; whole source/course held','leafGoalIds':[gid]}}
 dump(d/'current3312.config.json',config)

dump(OWN/'FIRST.independent.assessments.json',{'schemaVersion':1,'reviewedAt':now,'role':'Own actual targeted current eight-native FIRST-B',
 'currentPeerDJudgmentsRead':False,'known995PeerRepairOutcomeDisclosed':True,'currentWholeDescriptionDecisions':[
 {'goalId':q['goalId'],'decision':q['decision'],'rationale':q['rationale']} for q in records],
 'scientificCaseMaterialAndProfilesExactUnchangedHistoricalReviewsReused':True,
 '3312TitleBodyConflict':'resolved by exact descriptive two-title successor',
 '3312SourceIdentityOperatorHold':'open','3312Atomicity':atomic,'3312Memory':memory,
 '995ActualVisualDecision':'KEEP corrected base-locus raster, supplementary targeted repair followup with known peer outcome',
 '995LocationEvidence':'Original raster: CH3 stalk ends on blue C base in C-G inset; lower locator selects the same marked C base. Broad turquoise outer backbone remains visibly separate. At360 and680 widths both category headings and CH3/C/G/Ac cues are legible. Ac stays on orange histon tail; no universal causal ON/OFF rule is asserted by image.',
 'priorBIO8VB002VisibleLocationFinding':'resolved in this exact corrected raster only; original FIRST/addendum immutable',
 'findings':[{'findingId':'BIO8-D-SOURCE-B-003','goalId':gid,'severity':'block','status':'open',
 'scope':'Current exact HE8229f9d4/Q1.5.2 derived source identity/operator binding, not the scientifically valid whole P cases or corrected title.',
 'actualPrimaryEvidence':'HE physical38: Q1 required fields1-3. Physical40/Q1.5 LK: telomeres/cell ageing, principle of controlling gene activity in different developmental stages and organisms, homeobox genes. Bound extraction instead gives authored complex-feedback/pathway description and marks it officialCompetency; mapping8229→3312 remains exact. Whole BY EA/GA generegulation original bodies provide neither this exact sentence nor a simulation operator.',
 'requiredRemediation':'Preserve original derived source history and whole16/113/41 obligations. Supply a separately actually source-reviewed limited didactic/partial contribution to the exact official HE principle clause (and any justified BY clause), truthful authored-operationalization provenance and current primary locator, or provide another genuine current primary source for the precise scope. Do not invent an official simulation verb, delete Hox/development/telomere duties or lift whole-course holds. Regenerate affected normal source/current page contexts before targeted D-source remediation.'}],
 'wholeSourceCourseApproval':False,'fourDeferredImagesApproved':False,'whole315Protected':True,
 'newScientificCompletionCount':0,'restoredActiveBindings':0,'strictGain':0,'activeWrites':0,'humanApproval':False,'actualLearnerEvidence':False})
print(json.dumps({'writtenDRecords':8,'keep':7,'block':1,'3312Atomicity':'atomic genuine current decision','3312Memory':'no_memory_needed genuine current decision','currentPeerDResultsRead':False}))
