import datetime
import hashlib
import json
import pathlib
import shutil
import subprocess

REPO = pathlib.Path('/home/enpasos/projects/skillpilot')
AUTHOR = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-cqr003-five-bounded-prerequisite-source-candidate-author-20261007-v1'
OWN = pathlib.Path(__file__).resolve().parent
ROUND = AUTHOR / 'native-four/fresh-blind-round-a'

def digest(data):
    return 'sha256:' + hashlib.sha256(data).hexdigest()

def write_json(path, obj):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')

campaign = json.loads((ROUND / 'description-review-campaign.json').read_text())
review_input = json.loads((ROUND / 'description-review-input.json').read_text())
bundle = json.loads((ROUND / 'review-bundle-manifest.json').read_text())
batch = campaign['batches'][0]
run_id = 'biology-cqr003-four-prerequisite-source-independent-a-20261007-v1.run-001'
chains = [
    [
        'Der Zellzyklus verbindet Wachstum und Verdopplung der Erbinformation mit geordneter Zellteilung; so können zusätzliche gleich ausgestattete Zellen für Wachstum, Gewebereparatur und passende Formen ungeschlechtlicher Fortpflanzung entstehen.',
        'The cell cycle links growth and copying genetic information with ordered cell division, providing additional similarly equipped cells for growth, tissue repair and appropriate forms of asexual reproduction.',
        'Die lernende Person ordnet die wesentlichen Phasen in einem eigenen Ablaufmodell und erklärt anhand der Weitergabe der Erbinformation, wie zusätzliche Zellen Wachstum, Reparatur oder ungeschlechtliche Fortpflanzung ermöglichen.',
        'The learner orders the main phases in a model they construct and uses transmission of genetic information to explain how additional cells enable growth, repair or asexual reproduction.',
        'In einem neuen Fall mit Gewebereparatur statt Wachstum oder vegetativer Vermehrung statt Gewebereparatur erklärt die lernende Person denselben Zellzykluszusammenhang und verwechselt ihn nicht mit Keimzellenbildung.',
        'In a fresh case involving tissue repair instead of growth, or vegetative propagation instead of tissue repair, the learner explains the same cell-cycle relationship without confusing it with gamete formation.',
    ],
    [
        'Mutation verändert Erbinformation; Rekombination kombiniert vorhandene erbliche Varianten. Selektion wirkt über unterschiedliche Überlebens- und Fortpflanzungschancen auf deren Häufigkeiten in einer Population, ohne bedarfsgerichtet neue Varianten zu erzeugen.',
        'Mutation changes genetic information, while recombination combines existing heritable variants. Selection acts through different survival and reproductive chances on variant frequencies in a population without creating new variants in response to need.',
        'Die lernende Person erklärt einen neuen Fall von Populationsveränderung als Kette aus vorhandener oder neu entstandener erblicher Variabilität, unterschiedlichem Fortpflanzungserfolg und veränderter Variantenhäufigkeit und unterscheidet dabei Individuum und Population.',
        'The learner explains a fresh population-change case as a chain of existing or newly arisen heritable variation, differential reproductive success and changed variant frequencies, distinguishing individuals from populations.',
        'Bei geänderter Umwelt oder sexueller Neukombination begründet die lernende Person, warum andere Varianten häufiger werden können, und trennt Erzeugung beziehungsweise Neukombination von Varianten von deren Selektion.',
        'Under a changed environment or sexual recombination, the learner explains why different variants can become more frequent and separates the generation or recombination of variants from their selection.',
    ],
    [
        'Jeder vorhandene DNA-Einzelstrang dient bei semikonservativer Replikation als Vorlage für einen komplementären neuen Strang. In einer Kopierrunde enthält jede Tochter-DNA einen vorher vorhandenen und einen neuen Strang; Informationsbewahrung ist vom Erhalt ursprünglicher Molekülmarkierungen zu unterscheiden.',
        'In semiconservative replication, each existing single DNA strand templates a new complementary strand. In one copying round, each daughter DNA contains one previously existing and one new strand; preserving information differs from retaining original molecular labels.',
        'Mit gegebener Paarungsregel und Richtungslegende erstellt die lernende Person zwei passende Tochtermodelle, verfolgt beide Ausgangsstränge und erklärt, wie die Vorlage die genetische Information bewahren kann.',
        'Given a pairing rule and direction legend, the learner constructs two matching daughter models, traces both starting strands and explains how templating can preserve genetic information.',
        'In einer neuen Darstellung mit anderer Basenfolge oder einer zweiten Kopierrunde verfolgt die lernende Person die ursprünglichen Markierungen korrekt und begründet, weshalb fehlende ursprüngliche Markierung nicht automatisch Informationsverlust bedeutet.',
        'In a fresh representation with a different base sequence or a second copying round, the learner correctly traces the original labels and explains why absence of an original label does not automatically mean loss of information.',
    ],
    [
        'Substitution ersetzt, Deletion entfernt und Insertion ergänzt Basen; Duplikation kopiert vorhandenes Material und benötigt einen Herkunftshinweis. Proteinfolgen hängen von codierendem Bereich, Leserahmen, Code und Änderungslänge ab; aus der Folge allein ergibt sich keine sichere Funktions- oder Merkmalsänderung.',
        'Substitution replaces, deletion removes and insertion adds bases; duplication copies existing material and requires origin evidence. Protein consequences depend on coding region, reading frame, code and change length; sequence alone does not establish a definite function or trait change.',
        'Mit Ausgangs- und Variantenfolgen, gegebenem Leserahmen, Code-Tabelle und Kopierhinweisen benennt die lernende Person die vier Änderungen und begründet mögliche Aminosäure- oder Leserahmenfolgen sowie Grenzen von Funktionsaussagen.',
        'Given reference and variant sequences, reading frame, codon table and copying evidence, the learner identifies the four changes and justifies possible amino-acid or frame consequences and limits on claims about function.',
        'In frischen DNA-Fällen mit synonymem statt nicht synonymem Austausch, ganzen Codons statt Ein-Basen-Änderungen oder zusätzlichen kontrollierten Funktionsdaten passt die lernende Person die Folgerung an die jeweilige Evidenz an.',
        'In fresh DNA cases involving synonymous instead of nonsynonymous substitution, whole-codon instead of single-base changes, or additional controlled function data, the learner adjusts the conclusion to the evidence provided.',
    ],
]
rationales = [
    'Keep: the current bilingual statement preserves the explicitly bound Bayern B9.3.6 cell-cycle phases and growth/repair/asexual-reproduction significance. These applications depend on the same ordered cellular cycle. Actual physical page 3 is complete; no visualization or retained P profile is supplied. A goal-specific profile is still needed, and DNA structure is an appropriate foundational relation.',
    'Keep: the current German and English correctly distinguish mutation/recombination as sources of heritable variation from selection as differential survival/reproduction changing population frequencies. RP physical 28/printed26 and TH physical30/printed24 support the bounded qualitative mechanism; drift/isolation/speciation remain separate duties. DNA structure supports this without requiring protein-synthesis or detailed mutation-analysis mastery. Actual page4 is complete. An evolution profile still needs creation.',
    'Keep: significance and a simple semiconservative model are one copying/information-preservation competence. Bayern B9.3.5 and TH physical28/printed22 support it; RP physical44/printed42 supplies the narrower complementary-copying function as partial support rather than an invented semiconservative quotation. Actual page5, image and alt text agree. Both full retained P cases independently construct/trace complementary daughters and distinguish original labels from information after a second round; no content revision is needed.',
    'Keep: the four changes and possible contextual protein consequences form one causal sequence-analysis competence. TH physical29/printed23 justifies a direct partial gene-mutation route without claiming that TH enumerates these four labels or that this covers chromosome/genome mutations. The protein-synthesis prerequisite remains. Actual page6 and copying-arrow image agree. Both complete retained P cases correctly vary synonyms/missense, frame effects and limited function evidence; no content revision is needed.',
]
evidence_keys = ['essentialUnderstandingDe', 'essentialUnderstandingEn', 'observablePerformanceDe', 'observablePerformanceEn', 'transferExpectationDe', 'transferExpectationEn']
records = []
for i, (goal, chain, rationale) in enumerate(zip(review_input['goals'], chains, rationales), 1):
    record = {
        '$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
        'schemaVersion': 1,
        'recordId': f'biology-cqr003-four-independent-a-20261007-v1.d-{i:03d}',
        'runId': run_id,
        'campaignId': campaign['campaignId'],
        'roundId': campaign['roundId'],
        'bundleFingerprint': campaign['bundleFingerprint'],
        'bookDigest': campaign['bookDigest'],
        **{k: goal[k] for k in ['goalId', 'goalFingerprint', 'pageFingerprint', 'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn']},
        'decision': 'keep',
        'understandingEvidence': dict(zip(evidence_keys, chain)),
        'rationale': rationale,
        'evidenceProfileContract': 'positive-understanding-evidence-v2',
        'evidenceProfileRecommendation': 'create' if i <= 2 else 'none',
        'recordStatus': 'candidate',
        'reviewAuthority': 'ai_candidate',
    }
    records.append(record)

native = OWN / 'native-d-four'
(native / 'batches').mkdir(parents=True, exist_ok=True)
(native / 'results').mkdir(parents=True, exist_ok=True)
for name in ['description-review-campaign.json', 'description-review-input.json', 'review-bundle-manifest.json', 'criteria.md', 'prompt.md']:
    shutil.copyfile(ROUND / name, native / name)
shutil.copytree(ROUND / 'contracts', native / 'contracts', dirs_exist_ok=True)
shutil.copyfile(ROUND / 'batches' / (batch['batchId'] + '.input.jsonl'), native / 'batches' / (batch['batchId'] + '.input.jsonl'))
records_path = native / 'results' / (batch['batchId'] + '.records.jsonl')
records_path.write_text(''.join(json.dumps(r, ensure_ascii=False, separators=(',', ':')) + '\n' for r in records))
generation = {'reviewer': '/root/bio_cqr003_independent_a', 'execution': 'independent Codex subagent', 'samplingParameters': 'not exposed by session', 'blindFirstPass': True}
write_json(OWN / 'generation-parameters.declared.json', generation)
artifacts = [{k: a[k] for k in ['role', 'digest']} for a in bundle['artifacts'] if a['role'] in {'book_pdf', 'book_model', 'review_prompt', 'review_criteria'}]
artifacts.append({'role': 'description_review_batch_input_jsonl', 'digest': batch['batchInputFingerprint']})
run = {
    '$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
    'schemaVersion': 1, 'runId': run_id, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'], 'batchId': batch['batchId'],
    'batchInputFingerprint': batch['batchInputFingerprint'], 'bundleFingerprint': campaign['bundleFingerprint'], 'bookDigest': campaign['bookDigest'],
    'provider': 'OpenAI', 'model': 'GPT-6 Codex; session-exposed agent identity', 'role': 'subject_reviewer',
    'promptFamilyId': 'goal-description-understanding-evidence-v2', 'promptFingerprint': campaign['promptFingerprint'], 'criteriaFingerprint': campaign['criteriaFingerprint'],
    'generationParametersFingerprint': digest((OWN / 'generation-parameters.declared.json').read_bytes()), 'independenceGroupId': campaign['independenceGroupId'], 'blindToOtherRuns': True,
    'goalIds': batch['goalIds'], 'inputArtifacts': artifacts, 'startedAt': '2026-10-07T10:57:23Z',
    'completedAt': datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00', 'Z'), 'status': 'completed',
    'outputDigest': digest(records_path.read_bytes()), 'toolchainVersion': 'independent-codex-current-native-review-v1',
}
write_json(native / 'results' / (batch['batchId'] + '.run.json'), run)

# Obtain fingerprints by executing the actual native fingerprint functions.
candidate = json.loads((AUTHOR / 'candidate/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json').read_text())
evolution = next(g for g in candidate['goals'] if g['id'] == '9f73b963-5fac-5a90-a993-d7b7c0cc8526')
write_json(OWN / 'current-evolution-goal.snapshot.json', evolution)
review_decisions = {
    'semantic-atomicity': ('semanticAtomicityReview.ts', 'semantic-atomicity-v1', {
        'status': 'atomic', 'semanticAtomic': True,
        'reason': 'One integrated explanation links the origin/recombination of heritable variants with differential survival and reproduction changing their frequencies in a population. Detailed mutation classification, protein synthesis, drift and speciation are different sibling or successor competencies, not bundled independent duties in this current description.',
    }),
    'memory-card-review': ('memoryCardReview.ts', 'memory-card-review-v1', {
        'status': 'no_memory_needed', 'memoryUseful': False, 'memoryGoalIds': [], 'deckIds': [],
        'reason': 'The current goal is a causal explanation or prediction of population-frequency change from heritable variation and differential reproductive success. A separate fact-recall deck cannot establish that explanation; needed terminology may be supplied during instruction. No irreplaceable compact recall obligation or origin card is introduced by this specific current description.',
    }),
}
for lane, (script_name, rule_version, decision) in review_decisions.items():
    source = (REPO / 'app/scripts' / script_name).read_text()
    source = source.rsplit('\nmain()', 1)[0]
    own_goal_path = str(OWN / 'current-evolution-goal.snapshot.json')
    source += '\nconsole.log(fingerprintGoal(JSON.parse(readFileSync(' + json.dumps(own_goal_path) + ", 'utf8')), " + json.dumps(rule_version) + '))\n'
    instrumented = pathlib.Path('/tmp') / ('skillpilot-cqr003-independent-a-' + script_name)
    instrumented.write_text(source)
    result = subprocess.run([str(REPO / 'app/node_modules/.bin/tsx'), str(instrumented)], text=True, capture_output=True, check=True)
    fingerprint = result.stdout.strip()
    assert fingerprint.startswith('sha256:') and len(fingerprint) == 71, result.stdout
    record = {'schemaVersion': 1, 'reviewId': 'canonical-biology-full', 'ruleVersion': rule_version, 'landscapeId': candidate['landscapeId'], 'goalId': evolution['id'], 'fingerprint': fingerprint, **decision,
              'reviewedAt': run['completedAt'], 'reviewer': 'codex-biology-cqr003-independent-a-20261007'}
    path = OWN / 'native-A-M' / (lane + '.review.jsonl')
    path.parent.mkdir(exist_ok=True)
    path.write_text(json.dumps(record, ensure_ascii=False) + '\n')
    config = {'schemaVersion': 1, 'reviewId': 'canonical-biology-full', 'ruleVersion': rule_version, 'landscapeId': candidate['landscapeId'],
              'landscapePath': str(AUTHOR / 'candidate/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'), 'reviewPath': str(path),
              'scope': {'label': 'Independent A current evolution only, not full-curriculum acceptance', 'leafGoalIds': [evolution['id']]}}
    write_json(OWN / 'native-A-M' / (lane + '.config.json'), config)

sealed_paths = [OWN / 'first-scientific-pass.md', records_path, native / 'results' / (batch['batchId'] + '.run.json')] + list((OWN / 'native-A-M').glob('*.review.jsonl'))
seal = {'schemaVersion': 1, 'reviewAuthority': 'ai_candidate', 'humanApproval': False, 'humanTrial': False, 'activeApplied': False,
        'newScientificClosureCount': 0, 'reviewer': '/root/bio_cqr003_independent_a', 'blindToBAndRootScientificVerdicts': True,
        'sealedAt': datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00', 'Z'),
        'authorFreezeSha256': hashlib.sha256((AUTHOR / 'author.final.freeze.json').read_bytes()).hexdigest(),
        'payloads': [{'path': str(p.relative_to(OWN)), 'digest': digest(p.read_bytes()), 'bytes': p.stat().st_size} for p in sealed_paths],
        'note': 'This seal precedes author-delta or current-peer verdict comparison. Native run startedAt is the recorded output-materialization start, after independent source/page reading.'}
write_json(OWN / 'first-scientific-pass.seal.json', seal)
print('Sealed own independent A first pass with four native D records and current evolution A/M decisions.')
