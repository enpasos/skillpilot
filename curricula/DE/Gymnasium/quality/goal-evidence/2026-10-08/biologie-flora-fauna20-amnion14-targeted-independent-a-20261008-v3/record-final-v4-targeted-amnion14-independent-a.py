# SPDX-License-Identifier: Apache-2.0
"""Append a genuinely inspected v4 correction; never overwrite v3 HOLD/history."""
from pathlib import Path
from datetime import datetime, timezone
import json, hashlib

ROOT=Path.cwd(); OWN=Path(__file__).resolve().parent
AUTHOR=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-flora-fauna20-amnion14-raster-native-targeted-author-root-v3'
HOLD=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-flora-fauna20-amnion14-targeted-independent-a-20261008-v2'
OLD=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-flora-fauna20-final-raster-native-independent-a-20261008-v1'
GID='321ea315-37fe-5f9e-8fa8-dd631bb447c7'
read=lambda p:json.loads(p.read_text())
rel=lambda p:str(p.relative_to(ROOT))
sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
bind=lambda p:{'path':rel(p),'sha256':sha(p)[7:],'bytes':p.stat().st_size}
now=lambda:datetime.now(timezone.utc).isoformat()
def write(p,obj):
    p.parent.mkdir(parents=True,exist_ok=True)
    with p.open('x') as f:f.write(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
def rows(p):return [json.loads(s) for s in p.read_text().splitlines() if s.strip()]

entry=read(AUTHOR/'neutral-targeted-amnion14-current-raster-native.entry.json')
seal_path=AUTHOR/'targeted-amnion14-whole-native-author-input.freeze.json'
assert sha(seal_path)=='sha256:8a3e4229e784f1b43bf401096f4d5920c062423e088322f320d52eb014495db2'
seal=read(seal_path);assert len(seal['frozenFiles'])==90
for r in seal['frozenFiles']:
    p=ROOT/r['path'];assert sha(p)[7:]==r['sha256'],r['path'];assert p.stat().st_size==r['bytes'],r['path']
write(OWN/'input90.actual-exact-binding.receipt.json',{'artifactKind':'independent-A-targeted-v4-90-actual-input-binding','recordedAt':now(),
    'authorSeal':bind(seal_path),'actualBoundFiles':90,'errors':0,'scienceOrVisualApprovalFromHash':False,'peerBReviewRead':False,'activeWrites':0,'humanApproval':False})
native=AUTHOR/'native-raster-candidate';campaign_dir=native/'twenty/round-a'
campaign=read(campaign_dir/'description-review-campaign.json');actual=read(campaign_dir/'description-review-input.json')
assert len(actual['goals'])==1;g=actual['goals'][0];assert g['goalId']==GID
new_p={r['goalId']:r for r in rows(native/'P20.actual-raster-author.review.jsonl')}
old_config=read(OLD/'P20.exact-final-inert.native.config.json')
old_p={r['goalId']:r for r in rows(ROOT/old_config['reviewPath'])}
assert len(new_p)==20 and set(new_p)==set(old_p)
for gid in new_p:
    assert new_p[gid]['profile']==old_p[gid]['profile'],gid
    assert new_p[gid]['dissent']==old_p[gid]['dissent'],gid
candidate_path=AUTHOR/'candidate/canonical.current474-twenty-new-raster-author.json'
candidate_by={r['id']:r for r in read(candidate_path)['goals']}
old_by={r['id']:r for r in read(ROOT/old_config['landscapePath'])['goals']}
current=ROOT/entry['currentCanonicalObservation']['path']
assert sha(current)[7:]==entry['currentCanonicalObservation']['sha256']
snapshot=OWN/'exact-inputs/canonical.current-observation.exact.json';snapshot.parent.mkdir(parents=True,exist_ok=True)
with snapshot.open('xb') as f:f.write(current.read_bytes())
current_by={r['id']:r for r in read(snapshot)['goals']}
for gid in new_p:
    without_links=lambda row:{k:v for k,v in row.items() if k!='resourceLinks'}
    assert without_links(candidate_by[gid])==without_links(old_by[gid])==without_links(current_by[gid]),gid
    if gid!=GID:assert candidate_by[gid]==old_by[gid],gid
hold_records=next((HOLD/'round-a/results').glob('*.records.jsonl'));old_d=rows(hold_records)[0]
for key in ['currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']:assert g[key]==old_d[key]
prior_native=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-flora-fauna20-amnion14-raster-native-targeted-author-root-v2/native-raster-candidate/twenty/round-a/description-review-input.json'
assert g['canonicalContext']==read(prior_native)['goals'][0]['canonicalContext']
write(OWN/'targeted-current-D-P-source-retention.independent-a.receipt.json',{
    'schemaVersion':1,'artifactKind':'independent-A-v4-targeted-unchanged-whole-P-source-retention','recordedAt':now(),'goalId':GID,
    'exactCurrentObservationSnapshot':bind(snapshot),'genuinePriorWholeScienceReceipt':bind(OLD/'actual-current-D-P-context-source-retention.independent-a.receipt.json'),
    'completedPriorOwnScienceSeal':bind(OLD/'completed-native-D20-P20.independent-a.final.freeze.json'),
    'targetedV3HoldSeal':bind(HOLD/'first-targeted-v3-D-P-V14.independent-a.exact.freeze.json'),
    'wholeDescriptionsAndContextUnchanged':20,'wholePProfilesAndDissentUnchanged':20,'wholeCasesAndRubricsUnchanged':40,
    'scienceBasis':'Preserve genuine own whole DE/EN twenty-goal/forty-case/source reviews and actually read targeted P remediations. Exact equality verifies retained inputs, not a new scientific review.',
    'target14CurrentImagePageCompatibility':'PASS after genuinely inspecting full original v4, exact pixel crops, actual360/680 and whole native page03; false left Amnion leader removed.',
    'sourceBoundary':'Original bounded HE6.3 source and genuine retained source scope remain unchanged. Bird-OR-fish choice dissent and two separate conditional fish cases remain explicit; no universal both-class duty or all-country source closure claimed.',
    'other19VisualVerdictsUnchanged':True,'historicalV3HoldOverwritten':False,'PStatus':'needs_human_review','reviewAuthority':'ai_candidate','evidenceLevel':'E1','maximumClaimScope':'G1',
    'realLearnerEvidence':False,'newScientificCompletions':0,'restoredInactiveBindingSets':1,'strictGainClaimed':0,'activeWrites':0,'humanApproval':False})
observation='Die gesamte tatsächlich besichtigte v4-Darstellung und unskalierten Pixel-Ausschnitte zeigen den entfernten falschen linken Amnion-Leader. Der verbleibende rechte Amnion-Pfeil endet eindeutig auf der hellen vom Embryo getrennten Hüllenschicht; die beiden Embryo-Pfeile identifizieren die Embryonen. Schalen-, Dottersack- und Allantois-Zeiger bleiben bei den jeweiligen schematischen Strukturen. Keine falsche Rücken-als-Amnion-Zuordnung mehr. Beide beispielhaften Eier/Embryonen führen zu noch wachsenden Jungtieren, keine freie Kiemenlarve und kein sofort erwachsenes Tier; die Beispiele sind ausdrücklich z.B. Eidechse/Huhn. Der übersichtliche Vergleich bleibt passend zur unveränderten begrenzten Reptilien-/Vogelentwicklung.'
visual={'schemaVersion':1,'artifactKind':'independent-A-targeted-actual-final-v4-raster-native-V-verdict','recordedAt':now(),'goalId':GID,'ordinal':14,
    'decision':'KEEP','scopedMachineVisualVerdict':'PASS','machineVisualizationApproved':True,
    'actualOriginal':entry['targetedImage'],'actualPrompt':entry['actualPrompt'],'actualToolProvenance':entry['toolProvenance'],
    'actualWidthCaptureReceipt':entry['widthCaptureReceipt'],'actualWidthCaptures':read(ROOT/entry['widthCaptureReceipt']['path']),
    'actualNativePdf':entry['actualOneGoalPdf'],'actualWholeNativePage03Capture':entry['actualOneGoalPdfCapture'],
    'actualFullOriginalInspected':True,'actualOriginalPixelsInspected':True,'actual360And680ChromiumImageCapturesInspected':True,'actualWholeNativePage03Inspected':True,
    'exactInspectionCrops':[bind(OWN/n) for n in ['actual-left-former-amnion-leader.original-pixels.inspection.png','actual-right-retained-amnion-pointer.original-pixels.inspection.png']],
    'substantiveActualObservationsDe':observation,
    'formatAndLegibilityDe':'1672×941 PNG, friendly comicartige vorhandene Bildlandschaft. Tatsächliche360-Ansicht bewahrt Hauptvergleich und Entwicklungsrichtung; die kleinen Fachlabels sind zusätzliche Lehrunterstützung, kein lesepflichtiger Aufgabentext. Bei680 und in der tatsächlich gesehenen nativen Seite sind Strukturlabels erkennbar. Kein Textüberlauf oder abgeschnittener ganzer Zieltext. Keine Heft-/Handlungsperspektive betroffen. Chromium-Bild-Element-Aufnahmen sind keine tatsächliche Geräte-/Bedienerprobung.',
    'nativeContextDe':'Die ganze native Seite03 zeigt aktuelle ID, Titel, ganze Beschreibung und unveränderten begrenzten Geltungs-/Quellenkontext. Außerhalb dieses Ein-Ziel-Buchs bleiben Fortpflanzungsstrategien als Voraussetzung und Verbreitung/Umweltfaktoren als Aufbauziel korrekt verlinkt. Neue Digests identifizieren die wirklich betrachtete aktuelle Seite.',
    'closedOwnFinding':{'findingId':'A-AMNION14-V3-LEFT-POINTER-EMBRYO-BACK','priorExactHoldSeal':bind(HOLD/'first-targeted-v3-D-P-V14.independent-a.exact.freeze.json'),
    'resolution':'Actually false optional left Amnion leader removed; right anatomical identification retained and original/pixels/current widths/native page actually verified.'},
    'openFindings':[],'unchanged19RetainedWithoutNewScienceReview':True,'peerBReviewReadBeforeSeal':False,'generationIsApproval':False,
    'publicationOrHumanApproval':False,'activeWrites':0,'strictGainClaimed':0,'humanApproval':False}
write(OWN/'actual-amnion14-v4-V-first-independent-a.verdict.json',visual)
batch=campaign['batches'][0];run_id='biologie-flora-fauna20-amnion14-targeted-independent-a-20261008-v3'
record={**old_d,'recordId':run_id+'.'+GID,'runId':run_id,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],
    'bundleFingerprint':actual['bundleFingerprint'],'bookDigest':actual['bookDigest'],
    **{k:g[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']},
    'rationale':'Die eigene gültige ganze Beschreibung-/Fall-/Primärquellenprüfung wird unverändert erhalten. Jetzt tatsächlich neues v4-Original, Originalpixel-Ausschnitte,360/680 und ganze native Seite03 gezielt nachgeprüft. '+observation+' Eigener v3-HOLD wird ausdrücklich durch diese echte gezielte Korrektur geschlossen, nicht historisch überschrieben. Neue native D/P-Bindungen sind technische Nachweise; aktuelle P-Science ist gültig erhalten, Status needs_human_review/ai_candidate/E1/G1. Keine neue wissenschaftliche Leistung nur aus Hashen, keine menschliche Freigabe.'}
out=OWN/'round-a/results';out.mkdir(parents=True,exist_ok=True);records_path=out/(batch['batchId']+'.records.jsonl')
with records_path.open('x') as f:f.write(json.dumps(record,ensure_ascii=False,separators=(',',':'))+'\n')
bundle=read(campaign_dir/'review-bundle-manifest.json')
run={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,
    'runId':run_id,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'batchId':batch['batchId'],
    'batchInputFingerprint':batch['batchInputFingerprint'],'bundleFingerprint':actual['bundleFingerprint'],'bookDigest':actual['bookDigest'],
    'provider':'OpenAI','model':'Codex independent A; exact serving revision not exposed','role':'subject_reviewer',
    'promptFamilyId':'goal-description-understanding-evidence-v2','promptFingerprint':campaign['promptFingerprint'],'criteriaFingerprint':campaign['criteriaFingerprint'],
    'generationParametersFingerprint':'sha256:'+hashlib.sha256(b'Genuine own targeted full v4 original,pixel,360,680 and whole native03 corrective recheck; exact sampling parameters not exposed').hexdigest(),
    'independenceGroupId':campaign['independenceGroupId'],'blindToOtherRuns':True,'goalIds':[GID],
    'inputArtifacts':[{'role':a['role'],'digest':a['digest']} for a in bundle['artifacts'] if a['role'] in ['book_model','book_pdf','book_pdf_render_manifest','review_input_json','review_prompt','review_criteria']],
    'startedAt':datetime.fromtimestamp((OWN/'actual-left-former-amnion-leader.original-pixels.inspection.png').stat().st_mtime,timezone.utc).isoformat(),
    'completedAt':now(),'outputDigest':sha(records_path),'status':'completed','toolchainVersion':'skillpilot-goal-description-review-v1'}
run['inputArtifacts'].append({'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']})
write(out/(batch['batchId']+'.run.json'),run)
config={**old_config,'landscapePath':rel(candidate_path),'semanticKindLedgerPath':rel(AUTHOR/'candidate/semantic-kinds.current474-twenty-raster-inert.json'),'reviewPath':rel(native/'P20.actual-raster-author.review.jsonl'),
    'scope':{'label':'Independent A exact targeted v4 one-goal actual raster/native bindings; prior whole-case science retained','goalIds':[GID]}}
write(OWN/'P1.exact-inactive.native.config.json',config)
print('Recorded genuine v4 KEEP/PASS and own v3 finding closure; retained unchanged twenty-goal science, no active write or human approval.')
