import datetime
import hashlib
import json
import pathlib
import shutil

REPO = pathlib.Path('/home/enpasos/projects/skillpilot')
AUTHOR = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-two-corrected-raster-current-native-author-20261007-v1'
OWN = pathlib.Path(__file__).resolve().parent
ROUND = AUTHOR / 'native/two/round-a'
if (OWN / 'first-scientific-pass.seal.json').exists():
    raise SystemExit('First pass is already sealed; do not overwrite it.')

def digest(data):
    return 'sha256:' + hashlib.sha256(data).hexdigest()

def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def write_jsonl(path, rows):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(''.join(json.dumps(row, ensure_ascii=False, separators=(',', ':')) + '\n' for row in rows))

campaign = json.loads((ROUND / 'description-review-campaign.json').read_text())
inputs = json.loads((ROUND / 'description-review-input.json').read_text())
bundle = json.loads((ROUND / 'review-bundle-manifest.json').read_text())
batch = campaign['batches'][0]
run_id = 'chemie-two-corrected-current-independent-a-20261007-v1.run-001'
keys = ['essentialUnderstandingDe', 'essentialUnderstandingEn', 'observablePerformanceDe', 'observablePerformanceEn', 'transferExpectationDe', 'transferExpectationEn']
chains = [
    [
        'Getrennte Oxidation und Reduktion erzeugen einen äußeren Elektronenweg. Der innere Ionenweg gleicht Ladungsänderungen aus und ermöglicht dauerhaften Strom. Zellspannung ist die Differenz der Elektrodenpotenziale unter den gegebenen Bedingungen.',
        'Separated oxidation and reduction create an external electron path. Internal ion movement balances charge changes and enables sustained current. Cell voltage is the difference between electrode potentials under the given conditions.',
        'Die lernende Person formuliert und bilanziert Elektrodenreaktionen, begründet Pole sowie Elektronen- und Brückenionenrichtung und erklärt aus den Bedingungen die Potenzialdifferenz sowie die Wirkung einer unterbrochenen Ionenverbindung.',
        'The learner writes and balances electrode reactions, justifies polarity and electron and bridge-ion directions, and uses the conditions to explain the potential difference and the effect of an interrupted ionic connection.',
        'Mit anderen Redoxpartnern, räumlich vertauschten Halbzellen oder identischen Halbzellen unter gleichen Bedingungen leitet die lernende Person die Rollen und Spannung qualitativ neu ab, statt Zn links und Cu rechts als feste Regel zu kopieren.',
        'With different redox partners, spatially exchanged half-cells, or identical half-cells under identical conditions, the learner derives the roles and qualitative voltage afresh instead of copying zinc-left and copper-right as a fixed rule.',
    ],
    [
        'Säure und Base sind Teilchenrollen als Protonendonator und Protonenakzeptor. Korrespondierende Paare unterscheiden sich um ein Proton. Wasser kann je nach Partner beide Rollen annehmen; eine saure oder basische Lösung ist ein Gemisch mehrerer Teilchenarten.',
        'Acid and base are species roles as proton donor and proton acceptor. Conjugate pairs differ by one proton. Water can take either role depending on its partner; an acidic or basic solution is a mixture of multiple species.',
        'Die lernende Person formuliert atom- und ladungserhaltende Protolysegleichungen, verfolgt den Protonenweg, ordnet beide Paare und die jeweilige Wasserrolle zu und unterscheidet einzelne Oxonium- oder Hydroxidteilchen vom gesamten Lösungsgemisch.',
        'The learner writes atom- and charge-conserving protolysis equations, traces proton transfer, assigns both pairs and the relevant role of water, and distinguishes individual hydronium or hydroxide species from the entire solution mixture.',
        'In neuen HF-/NH₃-Fällen und einem geladenen Phosphat-Ampholyten wechselt die lernende Person Donator-/Akzeptorzuordnungen und prüft Ladungen, ohne Wasser auf eine Rolle festzulegen oder aus formalen Reaktionsmöglichkeiten Gleichgewichtsmengen beziehungsweise Neutralität abzuleiten.',
        'In fresh HF/ammonia cases and a charged phosphate-ampholyte case, the learner changes donor/acceptor assignments and checks charges without fixing water to one role or inferring equilibrium amounts or neutrality from formal reaction possibilities.',
    ],
]
rationales = [
    'Keep: current DE/EN preserve one connected explanation of galvanic-cell structure, electrode reactions and qualitative voltage. HE physical35 supports basic structure and operation; numerical voltage/reference-electrode duties remain separate. The exact corrected page/image has Zn oxidation, Cu reduction, two external Zn-to-Cu electron arrows and correctly directed NO3-/K+ bridge movement. The retained Zn/Cu and changed Cu/Ag/identical-halves cases remain compatible with the new image, while independent performance must go beyond copying it. This is E1/G1 image/context follow-up only.',
    'Keep: current DE/EN preserve the proton-transfer species model, corresponding pairs, water ampholysis and mixture distinction. HE physical35 supplies donor/acceptor and ionic-protolysis requirements; pH/titration/compound recall remain separate. The exact corrected PNG has two hydrogens on water, three on hydronium, correctly paired HCl/Cl- and H3O+/H2O, and explicitly labeled solution species. The retained HF/NH3 and phosphate cases supply water-donor and charged-ampholyte transfer beyond the single illustrated HCl example. This is E1/G1 image/context follow-up only.',
]
records = []
v_records = []
p_records = []
case_ids = [['zinc-copper-charge-path', 'copper-silver-and-identical-halves'], ['water-donor-and-acceptor', 'phosphate-ionic-ampholyte-transfer']]
for i, goal in enumerate(inputs['goals']):
    record = {
        '$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
        'schemaVersion': 1, 'recordId': f'chemie-two-corrected-current-independent-a-20261007-v1.d-{i+1:03d}',
        'runId': run_id, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'], 'bundleFingerprint': campaign['bundleFingerprint'], 'bookDigest': campaign['bookDigest'],
        **{k: goal[k] for k in ['goalId', 'goalFingerprint', 'pageFingerprint', 'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn']},
        'decision': 'keep', 'understandingEvidence': dict(zip(keys, chains[i])), 'rationale': rationales[i],
        'evidenceProfileContract': 'positive-understanding-evidence-v2', 'evidenceProfileRecommendation': 'none', 'recordStatus': 'candidate', 'reviewAuthority': 'ai_candidate',
    }
    records.append(record)
    page = goal['reviewContext']['page']; vis = page['visualization']; goal_id = goal['goalId']
    v_records.append({
        'schemaVersion': 1, 'recordId': f'chemie-two-corrected-current-independent-a-20261007-v1.v-{i+1:03d}',
        'goalId': goal_id, 'goalFingerprint': goal['goalFingerprint'], 'pageFingerprint': goal['pageFingerprint'],
        'bundleFingerprint': campaign['bundleFingerprint'], 'bookDigest': campaign['bookDigest'], 'physicalPdfPage': i+3,
        'assetPath': str((AUTHOR / 'selected-images' / (goal_id + '.png')).relative_to(REPO)), 'assetDigest': vis['originalDigest'], 'altText': vis['altText'],
        'decision': 'keep', 'recordStatus': 'candidate', 'reviewAuthority': 'ai_candidate', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1',
        'humanApproval': False, 'humanTrial': False, 'activeApplied': False, 'strictGain': 0,
        'inspected': ['original PNG', 'actual 360-pixel width PNG', 'actual 680-pixel width PNG', f'fresh render of actual PDF physical page {i+3}', 'current whole DE/EN goal and prerequisites/successors', 'four full selected-goal DE/EN case bodies'],
        'science': 'first-scientific-pass.md',
        'representationJudgment': 'Correct reacting-ion/electron pathways, signs and balanced half-reactions; sulfate half-cells with nitrate/potassium bridge; selected-ion model rather than complete inventory.' if i == 0 else 'Correct proton transfer and corresponding pairs, two hydrogen beads on water and three on hydronium; labeled whole-species circles and charge-balanced solution examples.',
        'readability': {'originalAnd680AndPdf': 'clear', '360': 'Main roles/arrows/equations recognizable; small in-beaker superscripts less comfortable.' if i == 0 else 'Overview and main equation recognizable; small corresponding-pair captions and some particle charge glyphs need enlargement for comfortable detail reading.', 'perfectMobileDetailAcceptanceClaimed': False},
        'style': 'Friendly simplified cartoon with thick outlines, contrasting colors and chemical labels; no realism claim.',
        'newApprovalOrLearnerPerformanceClaimed': False,
    })
    p_records.append({
        'schemaVersion': 1, 'goalId': goal_id, 'goalFingerprint': goal['goalFingerprint'], 'pageFingerprint': goal['pageFingerprint'], 'assetDigest': vis['originalDigest'],
        'decision': 'keep_existing_cases_for_exact_new_image_context', 'caseIds': case_ids[i], 'wholeDEENBodiesRead': True,
        'scope': 'Targeted new image/context compatibility, not a repeated historical study verdict.',
        'rationale': 'The new Zn/Cu picture exactly matches sulfate half-cells and KNO3 bridge in the first case. The Cu/Ag, beaker-location swap and identical-halves case still requires reaction-dependent transfer and cannot use the picture as a fixed polarity template.' if i == 0 else 'The single HCl/water illustration now has correct hydrogen counts and solution species. HF/NH3 and phosphate cases still independently require both water roles, new conjugate pairs, charge balance and species/mixture distinction; the illustration does not pre-answer them.',
        'scienceDetails': 'first-scientific-pass.md', 'reviewAuthority': 'ai_candidate', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1', 'humanApproval': False, 'humanTrial': False, 'newProfileCreated': False, 'strictGain': 0,
    })

native = OWN / 'native-d-two'
for name in ['description-review-campaign.json', 'description-review-input.json', 'review-bundle-manifest.json', 'criteria.md', 'prompt.md']:
    native.mkdir(exist_ok=True)
    shutil.copyfile(ROUND / name, native / name)
shutil.copytree(ROUND / 'contracts', native / 'contracts', dirs_exist_ok=True)
(native / 'batches').mkdir(exist_ok=True)
shutil.copyfile(ROUND / 'batches' / (batch['batchId'] + '.input.jsonl'), native / 'batches' / (batch['batchId'] + '.input.jsonl'))
record_path = native / 'results' / (batch['batchId'] + '.records.jsonl')
write_jsonl(record_path, records)
generation = {'reviewer': '/root/bio_cqr003_independent_a', 'execution': 'independent Codex subagent; new chemistry assignment', 'samplingParameters': 'not exposed by session', 'blindFirstPass': True}
write_json(OWN / 'generation-parameters.declared.json', generation)
artifacts = [{k: a[k] for k in ['role', 'digest']} for a in bundle['artifacts'] if a['role'] in {'book_pdf', 'book_model', 'review_prompt', 'review_criteria'}]
artifacts.append({'role': 'description_review_batch_input_jsonl', 'digest': batch['batchInputFingerprint']})
run = {
    '$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json', 'schemaVersion': 1,
    'runId': run_id, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'], 'batchId': batch['batchId'], 'batchInputFingerprint': batch['batchInputFingerprint'],
    'bundleFingerprint': campaign['bundleFingerprint'], 'bookDigest': campaign['bookDigest'], 'provider': 'OpenAI', 'model': 'GPT-6 Codex; session-exposed agent identity',
    'role': 'subject_reviewer', 'promptFamilyId': 'goal-description-understanding-evidence-v2', 'promptFingerprint': campaign['promptFingerprint'], 'criteriaFingerprint': campaign['criteriaFingerprint'],
    'generationParametersFingerprint': digest((OWN / 'generation-parameters.declared.json').read_bytes()), 'independenceGroupId': campaign['independenceGroupId'], 'blindToOtherRuns': True,
    'goalIds': batch['goalIds'], 'inputArtifacts': artifacts, 'startedAt': '2026-10-07T11:14:44Z', 'completedAt': datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00', 'Z'),
    'status': 'completed', 'outputDigest': digest(record_path.read_bytes()), 'toolchainVersion': 'independent-codex-current-native-review-v1',
}
run_path = native / 'results' / (batch['batchId'] + '.run.json')
write_json(run_path, run)
write_jsonl(OWN / 'visualization-current-two.ai-candidate.jsonl', v_records)
write_jsonl(OWN / 'retained-positive-cases.current-image-compatibility.ai-candidate.jsonl', p_records)

payloads = [OWN / 'first-scientific-pass.md', record_path, run_path, OWN / 'visualization-current-two.ai-candidate.jsonl', OWN / 'retained-positive-cases.current-image-compatibility.ai-candidate.jsonl']
write_json(OWN / 'first-scientific-pass.seal.json', {
    'schemaVersion': 1, 'reviewer': '/root/bio_cqr003_independent_a', 'role': 'independent Chemie A, not the author or root synthesizer',
    'blindToOtherChemieABRootVerdicts': True, 'sealedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'authorFreezeSha256': hashlib.sha256((AUTHOR / 'author.final.freeze.json').read_bytes()).hexdigest(),
    'payloads': [{'path': str(p.relative_to(OWN)), 'digest': digest(p.read_bytes()), 'bytes': p.stat().st_size} for p in payloads],
    'reviewAuthority': 'ai_candidate', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1', 'humanApproval': False, 'humanTrial': False, 'activeApplied': False, 'strictGain': 0,
    'note': 'First science sealed before any peer verdict or correction-history comparison. Native startedAt is the recorded output-materialization start after independent input reading.'
})
print('Sealed independent first scientific pass: two D keep, two V keep and two targeted retained P-image compatibility decisions.')
