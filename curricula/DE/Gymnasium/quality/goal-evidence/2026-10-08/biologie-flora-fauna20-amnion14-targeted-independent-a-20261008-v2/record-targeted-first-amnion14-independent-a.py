# SPDX-License-Identifier: Apache-2.0
"""Record a genuine targeted visual HOLD; preserve valid prior whole-case science."""
import hashlib
import json
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
REL = lambda p: str(p.relative_to(ROOT))
AUTHOR = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-flora-fauna20-amnion14-raster-native-targeted-author-root-v2'
OLD = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-flora-fauna20-final-raster-native-independent-a-20261008-v1'
SOURCE = ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-flora-fauna20-image-author-root-20261007-v1'
GID = '321ea315-37fe-5f9e-8fa8-dd631bb447c7'
now = lambda: datetime.now(timezone.utc).isoformat()
read = lambda p: json.loads(p.read_text())
sha = lambda p: 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()
bind = lambda p: {'path': REL(p), 'sha256': sha(p)[7:], 'bytes': p.stat().st_size}
def write(p, obj):
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open('x') as f:
        f.write(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')
def rows(p):
    return [json.loads(s) for s in p.read_text().splitlines() if s.strip()]

entry_path = AUTHOR / 'neutral-targeted-amnion14-current-raster-native.entry.json'
entry = read(entry_path)
seal_path = AUTHOR / 'targeted-amnion14-whole-native-author-input.freeze.json'
assert sha(seal_path) == 'sha256:ffd1a0e4a2dd37bd60978bffd3e7fe2c334fc1a8538839b648c134362a3984c6'
seal = read(seal_path)
assert len(seal['frozenFiles']) == 90
for row in seal['frozenFiles']:
    p = ROOT / row['path']
    assert sha(p)[7:] == row['sha256'], row['path']
    assert p.stat().st_size == row['bytes'], row['path']
write(OWN / 'input90.actual-exact-binding.receipt.json', {
    'artifactKind': 'independent-A-actual-90-file-targeted-input-binding', 'recordedAt': now(),
    'authorSeal': bind(seal_path), 'verifiedActualFiles': 90, 'bindingErrors': 0,
    'scienceInferredFromHash': False, 'visualApprovalInferredFromHash': False,
    'peerBReviewRead': False, 'activeWrites': 0, 'humanApproval': False})

native = AUTHOR / 'native-raster-candidate'
campaign_dir = native / 'twenty/round-a'
campaign = read(campaign_dir / 'description-review-campaign.json')
actual = read(campaign_dir / 'description-review-input.json')
assert len(actual['goals']) == 1
g = actual['goals'][0]
assert g['goalId'] == GID
old_entry = read(SOURCE / 'neutral-final-flora-fauna20-raster-native-review.entry.json')
old_p = {r['goalId']: r for r in rows(ROOT / old_entry['wholeCurrentP20']['path'])}
new_p = {r['goalId']: r for r in rows(native / 'P20.actual-raster-author.review.jsonl')}
assert set(old_p) == set(new_p) and len(new_p) == 20
for gid in new_p:
    assert new_p[gid]['profile'] == old_p[gid]['profile'], gid
    assert new_p[gid]['dissent'] == old_p[gid]['dissent'], gid
current = ROOT / entry['currentCanonicalObservation']['path']
assert sha(current)[7:] == entry['currentCanonicalObservation']['sha256']
snapshot = OWN / 'exact-inputs/canonical.current-observation.exact.json'
snapshot.parent.mkdir(parents=True, exist_ok=True)
with snapshot.open('xb') as f:
    f.write(current.read_bytes())
before_by = {r['id']: r for r in read(ROOT / old_entry['futureInertCanonical']['path'])['goals']}
after_path = AUTHOR / 'candidate/canonical.current474-twenty-new-raster-author.json'
after_by = {r['id']: r for r in read(after_path)['goals']}
current_by = {r['id']: r for r in read(snapshot)['goals']}
for gid in new_p:
    assert {k:v for k,v in before_by[gid].items() if k != 'resourceLinks'} == {k:v for k,v in after_by[gid].items() if k != 'resourceLinks'}, gid
    assert {k:v for k,v in current_by[gid].items() if k != 'resourceLinks'} == {k:v for k,v in after_by[gid].items() if k != 'resourceLinks'}, gid
    if gid != GID:
        assert before_by[gid] == after_by[gid], gid
old_input_path = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-flora-fauna20-final-raster-native-author-root-20261007-v1/native-raster-candidate/twenty/round-a/description-review-input.json'
old_g = next(r for r in read(old_input_path)['goals'] if r['goalId'] == GID)
for key in ['currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn','canonicalContext']:
    assert g[key] == old_g[key], key
science = {
    'artifactKind': 'independent-A-targeted14-unchanged-whole-description-P-source-retention', 'recordedAt': now(),
    'goalId': GID, 'currentObservationExactSnapshot': bind(snapshot),
    'priorGenuineScienceReceipt': bind(OLD / 'actual-current-D-P-context-source-retention.independent-a.receipt.json'),
    'priorCompletedScienceAndNativeSeal': bind(OLD / 'completed-native-D20-P20.independent-a.final.freeze.json'),
    'newTargetedAuthorP20': bind(native / 'P20.actual-raster-author.review.jsonl'),
    'wholeBilingualGoalAndContextUnchanged': True, 'wholeProfilesUnchanged': 20,
    'wholeCasesAndRubricsUnchanged': 40, 'wholeSourceBoundariesAndDissentRetained': True,
    'scientificBasis': 'The prior genuinely read twenty whole DE/EN goals, forty cases, bounded whole primary sources and targeted v3/v4 P remediations remain valid. This task checks the exact changed image/page bindings, not science merely from matching hashes.',
    'target14RetainedScience': 'Scoped E1/G1 whole-case PASS retained, not a new review or observed learner mastery.',
    'target14NewImagePageCompatibility': 'HOLD: left Amnion pointer identifies the embryo dorsal contour instead of a separate amniotic membrane.',
    'other19RetainedVisualDecisions': True, 'newScientificCompletions': 0, 'restoredFinalBindings': 0,
    'PStatus': 'needs_human_review', 'reviewAuthority': 'ai_candidate', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1',
    'realLearnerEvidence': False, 'activeWrites': 0, 'strictGainClaimed': 0, 'humanApproval': False}
write(OWN / 'targeted-current-D-P-source-retention.independent-a.receipt.json', science)

caps = read(ROOT / entry['widthCaptureReceipt']['path'])
finding = {
    'findingId': 'A-AMNION14-V3-LEFT-POINTER-EMBRYO-BACK', 'severity': 'blocking',
    'actualObservationDe': 'Im tatsächlich angesehenen Original und im unskalierten Pixel-Ausschnitt endet die linke Pfeilspitze von Amnion (Fruchtblase) etwa bei Originalpixel x441/y177 auf beziehungsweise unmittelbar über der dunklen stacheligen Rückenlinie des Eidechsenembryos. Eine davon klar getrennte, den Embryo umschließende amniotische Membran ist dort nicht als Ziel des Pfeils erkennbar. Der rechte Amnion-Pfeil zeigt hingegen auf eine helle Hüllenschicht. Der linke falsche Zeiger ist auch in den tatsächlich gesehenen 360-/680-Ansichten und auf der ganzen nativen Seite03 vorhanden.',
    'whyBlocking': 'Anatomical label/structure binding is incorrect: the embryo dorsal surface is not the amniotic membrane. Readability and generated provenance cannot establish correctness.',
    'minimumCorrectionDe': 'Eine geschlossene, klar vom Embryorücken getrennte helle Amnionmembran um den Embryo zeigen und die linke Amnion-Pfeilspitze eindeutig auf diese Membran außerhalb des Rückens setzen. Alle danach tatsächlich geänderten Pixel sowie neue 360/680 und native Seitenbindungen gezielt prüfen.',
    'exactInspectionCrops': [bind(OWN / n) for n in ['actual-left-amnion-pointer.original-pixels.inspection.png','actual-right-amnion-pointer.original-pixels.inspection.png']]}
visual = {
    'schemaVersion': 1, 'artifactKind': 'independent-A-targeted-actual-raster-native-V-verdict', 'recordedAt': now(),
    'goalId': GID, 'ordinal': 14, 'decision': 'HOLD', 'machineVisualizationApproved': False,
    'actualOriginal': entry['targetedImage'], 'actualPrompt': entry['actualPrompt'], 'actualToolProvenance': entry['toolProvenance'],
    'actualWidthCaptureReceipt': entry['widthCaptureReceipt'], 'actualWidthCaptures': caps,
    'actualNativePdf': entry['actualOneGoalPdf'], 'actualWholeNativePageCapture': entry['actualOneGoalPdfCapture'],
    'actualFullOriginalInspected': True, 'actualOriginalPixelsInspected': True,
    'actual360And680ChromiumImageCapturesInspected': True, 'actualWholeNativePhysicalPage03Inspected': True,
    'nativePageObservationsDe': 'Die vollständige native Seite03 zeigt den aktuellen ganzen Zieltext, ID, korrekte externe Voraussetzungen/Nachfolger und den begrenzten aktuellen Geltungs-/Quellenkontext ohne sichtbare Textabschneidung. Der aktuelle Zieltext bleibt sachlich gültig. Das neue Bild trägt aber den anatomisch falsch gebundenen linken Amnion-Zeiger; deshalb keine neue ganze Seiten-/V-Freigabe.',
    'formatObservationsDe': '1672×941 PNG, freundlich comicartig, Querformat. Bei tatsächlicher 360-Pixel-Darstellung bleiben Reptil-/Vogelei und Jungtiere erkennbar; mittige Fachlabels sind klein und dienen Lehrunterstützung. Bei680 sind die Labels sichtbar. Es werden Bild-Element-Aufnahmen, keine physische Handy-/PC-Bedienerprobung behauptet. Keine Handelnden-/Heftperspektive betroffen.',
    'openFindings': [finding],
    'historicalOwnV2Decision': 'The sealed previous twenty-image A record accepted v2. It remains immutable history. The targeted present original-pixel inspection identifies a concrete pointer/anatomy defect; the earlier acceptance is not used to override this evidence.',
    'historicalOwnV2Record': bind(OLD / 'actual-twenty-V-first-independent-a.verdicts.json'),
    'unchanged19RetainedWithoutNewReview': True, 'peerBReviewReadBeforeSeal': False,
    'generationIsApproval': False, 'activeWrites': 0, 'strictGainClaimed': 0, 'humanApproval': False}
write(OWN / 'actual-amnion14-v3-V-first-independent-a.verdict.json', visual)

run_id = 'biologie-flora-fauna20-amnion14-targeted-independent-a-20261008-v2'
batch = campaign['batches'][0]
expectations = new_p[GID]['profile']['expectations']
evidence = {}
for suffix in ['De','En']:
    evidence['essentialUnderstanding'+suffix] = ' '.join(x['essentialUnderstanding'+suffix] for x in expectations)
    evidence['observablePerformance'+suffix] = expectations[0]['observablePerformance'+suffix]
    evidence['transferExpectation'+suffix] = expectations[-1]['observablePerformance'+suffix]
record = {'$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json', 'schemaVersion': 1,
    'recordId': run_id+'.'+GID, 'runId': run_id, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'],
    'bundleFingerprint': actual['bundleFingerprint'], 'bookDigest': actual['bookDigest'],
    **{k:g[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']},
    'decision': 'keep', 'understandingEvidence': evidence,
    'rationale': 'Die unveränderte ganze deutsche/englische Beschreibung und ihr begrenzter primärer HE6.3-Quellenkontext bleiben aufgrund der eigenen bereits echten ganzen A-Prüfung gültig. Beide vorgegebenen eierlegenden Beispiele verbinden geschützte dotterversorgte Embryonalentwicklung; Vergleich und Entwicklung bleiben ein begrenzter Zusammenhang, keine universelle Eierregel. Aktuelle vollständige native Seite03 und neue Original-/360-/680-Bildbindung tatsächlich gesehen. Konkreter neuer V-HOLD: linke Amnion-Pfeilspitze zeigt auf den dunklen stacheligen Embryorücken statt klar getrennte umschließende Membran (A-AMNION14-V3-LEFT-POINTER-EMBRYO-BACK). KEEP betrifft ausschließlich die klare gleichwertige Beschreibung; es ist keine Bild-/Seitenfreigabe. Operative P-Fälle wissenschaftlich unverändert gültig erhalten; neue anatomische Bildkompatibilität bleibt offen. Keine neue wissenschaftliche Prüfung bloß aus Hashen, keine menschliche Freigabe.',
    'evidenceProfileContract': 'positive-understanding-evidence-v2', 'evidenceProfileRecommendation': 'none', 'recordStatus': 'candidate', 'reviewAuthority': 'ai_candidate'}
result_dir = OWN / 'round-a/results'
result_dir.mkdir(parents=True, exist_ok=True)
records_path = result_dir / (batch['batchId']+'.records.jsonl')
with records_path.open('x') as f: f.write(json.dumps(record,ensure_ascii=False,separators=(',',':'))+'\n')
bundle = read(campaign_dir / 'review-bundle-manifest.json')
run = {'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,
    'runId':run_id,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'batchId':batch['batchId'],
    'batchInputFingerprint':batch['batchInputFingerprint'],'bundleFingerprint':actual['bundleFingerprint'],'bookDigest':actual['bookDigest'],
    'provider':'OpenAI','model':'Codex independent A; exact serving revision not exposed','role':'subject_reviewer',
    'promptFamilyId':'goal-description-understanding-evidence-v2','promptFingerprint':campaign['promptFingerprint'],'criteriaFingerprint':campaign['criteriaFingerprint'],
    'generationParametersFingerprint':'sha256:'+hashlib.sha256(b'Genuine targeted original pixel,360,680 and whole native page03 review; retained own valid science; exact serving parameters not exposed').hexdigest(),
    'independenceGroupId':campaign['independenceGroupId'],'blindToOtherRuns':True,'goalIds':[GID],
    'inputArtifacts':[{'role':a['role'],'digest':a['digest']} for a in bundle['artifacts'] if a['role'] in ['book_model','book_pdf','book_pdf_render_manifest','review_input_json','review_prompt','review_criteria']],
    'startedAt':datetime.fromtimestamp((OWN / 'actual-left-amnion-pointer.original-pixels.inspection.png').stat().st_mtime,timezone.utc).isoformat(),
    'completedAt':now(),'outputDigest':sha(records_path),'status':'completed','toolchainVersion':'skillpilot-goal-description-review-v1'}
run['inputArtifacts'].append({'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']})
write(result_dir / (batch['batchId']+'.run.json'), run)
config = read(OLD / 'P20.exact-final-inert.native.config.json')
config.update(landscapePath=REL(after_path), semanticKindLedgerPath=REL(AUTHOR/'candidate/semantic-kinds.current474-twenty-raster-inert.json'), reviewPath=REL(native/'P20.actual-raster-author.review.jsonl'))
config['scope'] = {'label':'Independent A targeted one changed Amnion PNG, native technical P binding only; visual HOLD retained','goalIds':[GID]}
write(OWN / 'P1.exact-inactive.native.config.json', config)
print('Recorded targeted V-HOLD, unchanged description KEEP, retained whole P science; no active writes, no final approval.')
