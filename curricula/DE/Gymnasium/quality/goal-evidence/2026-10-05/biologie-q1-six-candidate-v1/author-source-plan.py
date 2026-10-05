#!/usr/bin/env python3
"""Exact open NI remediation plan and fresh inspection receipt; candidate only."""
import hashlib
import json
import pathlib
from datetime import datetime, timezone
from PIL import Image

OUT = pathlib.Path(__file__).resolve().parent
ROOT = pathlib.Path(__file__).resolve().parents[7]
NOW = datetime.now(timezone.utc).isoformat()
FFEF = 'ffef97e3-12d6-5090-9816-46ab9e57fae2'
VARIATION = '9f73b963-5fac-5a90-a993-d7b7c0cc8526'
MEIOSIS = '1d2b1038-dcd5-529a-b085-9e14f1d58c76'
ORIENTATION = '2d451684-6e53-565e-a987-f362da919d2c'

def read(p): return json.loads(p.read_text())
def save(name, v): (OUT / name).write_text(json.dumps(v, ensure_ascii=False, indent=2) + '\n')
def digest(p): return 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()
def expectation(id, de, en, obs_de, obs_en):
    return dict(id=id, essentialUnderstandingDe=de, essentialUnderstandingEn=en, observablePerformanceDe=obs_de, observablePerformanceEn=obs_en)
def case(id, task_de, task_en, expected_de, expected_en, focus_de, focus_en):
    return dict(id=id, taskDemandDe=task_de, taskDemandEn=task_en, expectedPerformanceDe=expected_de, expectedPerformanceEn=expected_en, understandingFocusDe=focus_de, understandingFocusEn=focus_en)

active_path = ROOT / 'curricula/DE/Gymnasium/mapping/DE-NI/lower-secondary/ni_biology_lower_secondary_source_extraction_to_canonical_biology.m7-e3-recombination-20261001-v2.review.json'
mapping = read(active_path)
extraction_path = ROOT / mapping['sourceExtractionPath']
extraction = read(extraction_path)
source_ids = ['ni-biology-seki-kc2015-fw7-002-48e75da8', 'ni-biology-seki-kc2015-fw7-003-b3921cb7', 'ni-biology-seki-kc2015-fw7-012-8ed51e46']
source = next(s for s in extraction['sourceGoals'] if s['id'] == source_ids[1])
canonical_path = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
goals = {g['id']: g for g in read(canonical_path)['goals']}
var_goal = goals[VARIATION]
revised_de = 'Die lernende Person kann erklären, wie Mutation und Rekombination genetische Variation hervorbringen und wie Selektion auf diese Variation wirkt.'
revised_en = 'The learner can explain how mutation and recombination generate genetic variation and how selection acts on that variation.'
expectations = [
    expectation('new-variants-versus-new-combinations',
        'Mutation kann neue erbliche Varianten hervorbringen; Rekombination kombiniert vorhandene erbliche Varianten neu. Diese Erklärung bleibt auf phänomenologisch-beschreibender Ebene und benötigt keine DNA-Sequenz oder Proteinbiosynthese.',
        'Mutation can produce new heritable variants; recombination produces new combinations of existing heritable variants. This explanation stays at a descriptive, observable level without DNA sequences or protein biosynthesis.',
        'Die lernende Person ordnet neue gegebene Vererbungsbefunde begründet einem neuen Variantenereignis oder einer Neukombination vorhandener Varianten zu und erzeugt eine eigene Erklärung.',
        'The learner uses reasons to identify a fresh supplied inheritance result as a new-variant event or a new combination of existing variants and produces an independent explanation.'),
    expectation('undirected-variation',
        'Genetische Variabilität wird nicht zielgerichtet erzeugt, damit ein Individuum einen Bedarf erfüllt. Ein gegebener neuer Variantenbefund oder ein Kombinationsmodell ist von einer umweltbedingten individuellen Veränderung zu unterscheiden.',
        'Genetic variability is not purposefully produced to meet an individual’s needs. A supplied new-variant result or combination model must be distinguished from an environmentally caused individual change.',
        'Die lernende Person begründet eine frische Variationsmöglichkeit ohne Anpassungsabsicht, trennt gegebenen erblichen Befund von bloßer Umweltreaktion und nennt bei unzureichenden Daten die verbleibende Grenze.',
        'The learner justifies a fresh possibility of variation without a purpose-driven adaptation claim, distinguishes supplied heritable evidence from an environmental response and states limits when data are insufficient.'),
]
variation_profile = {
    'archetype': 'concept', 'expectations': expectations,
    'coverageExpectations': {'requiredExpectationIds': [e['id'] for e in expectations], 'alternativeExpectationGroups': [], 'minimumIndependentDemonstrations': 2, 'freshVariationRequired': True, 'independentTransferRequired': True},
    'variationAxes': [
        {'id': 'origin-of-variation', 'textDe': 'Neues erbliches Variantenereignis und neue Kombination vorhandener Erbanlagen in verschiedenen Befunden vergleichen.', 'textEn': 'Compare a new heritable-variant event with a new combination of existing inherited factors in different results.'},
        {'id': 'representation-and-environment', 'textDe': 'Gegebenen Vererbungsbefund und symbolisches Kombinationsmodell verwenden; einen explizit nicht erblichen Umweltbefund getrennt einordnen.', 'textEn': 'Use a supplied inheritance result and a symbolic combination model; separately classify an explicitly nonheritable environmental response.'},
    ],
    'applicationCaseBriefs': [
        case('heritable-new-variant-and-environment',
            'Ein neuer anonymer Pflanzenfall liefert den Befund: In einer Keimzelle ist eine zuvor in der Modellpopulation nicht vorkommende erbliche Variante entstanden; nachfolgende Vererbungsbeobachtungen bestätigen sie. Es gibt keine DNA-Sequenzdaten. Eine zweite Pflanze bildet im Schatten vorübergehend größere Blätter; das Material weist diese Änderung ausdrücklich als nicht erblich aus. Erkläre, welcher Fall die genetische Variabilität erweitert und warum keine bedarfsgerichtete Entstehung behauptet werden kann.',
            'A fresh anonymous plant case supplies this result: a new heritable variant not previously present in the model population arose in a gamete and was confirmed by subsequent inheritance observations. No DNA-sequence data are provided. A second plant temporarily develops larger leaves in shade; the material explicitly identifies this change as nonheritable. Explain which case expands genetic variability and why purpose-driven production cannot be inferred.',
            'Die lernende Person erklärt das gegebene neue erbliche Variantenereignis als Mutation auf phänomenologischer Ebene und grenzt es von der ausdrücklich nicht erblichen Umweltreaktion ab. Sie behauptet keine bestimmte molekulare Mutation, Proteinwirkung oder zielgerichtete Bedarfsdeckung.',
            'The learner explains the supplied new heritable-variant event as mutation at a descriptive level and distinguishes it from the explicitly nonheritable environmental response, without inventing a molecular mutation type, protein effect or purposeful fulfilment of a need.',
            'Positive Erklärung der Variantenquelle mit begrenztem Befund.', 'Positive explanation of a source of variation with bounded evidence.'),
        case('fresh-inherited-factor-combination',
            'Ein neues einfaches, ausdrücklich phänomenologisches Vererbungsmodell zeigt zwei unabhängig kombinierte Erbanlagen A/a und B/b. Die mögliche Weitergabe AB, Ab, aB und ab ist im Material angegeben; keine neuen Erbanlagen entstehen im Modell. Erzeuge zwei unterschiedliche, im Modell mögliche Nachkommenkombinationen aus gegebenen elterlichen Beiträgen und erkläre ihre Variabilität. Begründe den Unterschied zum neu entstandenen erblichen Variantenereignis im ersten Fall.',
            'A fresh simple explicitly descriptive inheritance model shows two independently combined inherited factors A/a and B/b. Possible contributions AB, Ab, aB and ab are supplied; no new inherited factors arise in the model. Construct two different possible offspring combinations from supplied parental contributions and explain their variability. Justify the difference from the new heritable-variant event in the first case.',
            'Die lernende Person erzeugt unterschiedliche zulässige Kombinationen, beispielsweise AaBb aus AB/ab und AABb aus AB/Ab, und erklärt Variation durch Neukombination schon vorhandener Erbanlagen. Sie ordnet dies als Rekombination ein und unterstellt kein neues Mutationsereignis, keine DNA-Folge und kein vorgegebenes Ziel der Veränderung.',
            'The learner constructs different allowed combinations, such as AaBb from AB/ab and AABb from AB/Ab, and explains variation by recombining existing inherited factors. This is identified as recombination without assuming a new mutation event, DNA sequence or predetermined purpose.',
            'Frischer positiver Transfer von neu entstandener Variante zu Kombination bestehender Varianten.', 'Fresh positive transfer from a new variant to combinations of existing variants.'),
    ],
}
plan = {
    'schemaVersion': 1, 'candidateStatus': 'independent_review_required', 'createdAt': NOW,
    'modelFamily': 'GPT-6', 'exactModelIdentifier': None,
    'activeNiMappingInput': {'path': str(active_path.relative_to(ROOT)), 'sha256': digest(active_path)},
    'proof': {'retainedPdfPages': [87, 89, 90], 'sourceExcerptPath': str((OUT / 'sources/ni-mutation-stage-context-retained.txt').relative_to(ROOT)), 'finding': 'Official p.89 excludes molecular-genetic mutation treatment in Sek I; extraction drops that qualifier. The shared grades tag also loses distinct table-column grade scopes.'},
    'extractionCorrection': {
        'path': str(extraction_path.relative_to(ROOT)), 'sourceGoalId': source['id'],
        'before': {'sourceText': source['sourceText'], 'description': source['description']},
        'after': {'sourceText': 'erklären Variabilität durch Mutation – ohne molekulargenetische Betrachtung – und durch Rekombination.', 'description': 'Die lernende Person kann Variabilität durch Mutation und Rekombination auf phänomenologisch-beschreibender Ebene erklären.'},
        'gradeScopeToReview': 'By end of class 10 for FW7-003; FW7-002 is the earlier table column. Review grade metadata and tags individually, not all as 5/6–9/10.',
    },
    'removeUnsupportedMappingRowsCandidate': [m for m in mapping['mappings'] if m['legacyGoalId'] in source_ids and m['canonicalGoalId'] == FFEF],
    'mappingDecisionListDeltasCandidate': [
        {'sourceGoalId': d['sourceGoalId'], 'beforeCanonicalGoalIds': d['canonicalGoalIds'], 'afterRemovalCanonicalGoalIds': [i for i in d['canonicalGoalIds'] if i != FFEF], 'condition': 'Add/retain genuinely reviewed age-fit variation coverage before adoption; remaining labels are not automatically reviewed here.'}
        for d in mapping['decisions'] if d.get('sourceGoalId') in source_ids
    ],
    'viewChangeCandidate': {
        'path': 'app/scripts/config/goal-books/source-views/de-gym-biology-national-atlas/de-gym-biologie-bundesweit-source-de-ni-seki.view.json',
        'removeGoalEntryId': FFEF,
        'condition': 'Regenerate from the reviewed repaired mapping only after age-fit coverage and effective prerequisite frontier are proved. Do not simply hide the source debt.',
        'retainExistingRecombinationComponentId': MEIOSIS,
        'retainExistingVariationContextIdSubjectToCorrection': VARIATION,
    },
    'additionalOpenCanonicalFinding': {
        'goalId': VARIATION, 'title': var_goal['title'],
        'finding': 'The current wording assigns selection the causal role of generating genetic variation, conflating the origin of variants/combinations with selection on that variation. It also blocks the NI nonmolecular route behind ffef.',
        'currentDescriptionDe': var_goal['description'], 'currentDescriptionEn': var_goal['descriptionEn'],
        'proposedDescriptionDe': revised_de, 'proposedDescriptionEn': revised_en,
        'currentRequires': var_goal['requires'],
        'proposedRequiresForIndependentlyReviewedNonmolecularScope': [MEIOSIS, ORIENTATION],
        'prerequisiteDecision': 'Simple meiotic recombination/gamete knowledge is a defensible age-fit route; exact molecular mutation classification is not universally needed. An independent review must confirm this after checking source scopes, atomicity and frontier.',
        'noClosureClaim': True,
    },
    'componentSourceRouting': [
        {'sourceGoalId': source_ids[0], 'scope': 'Earlier-grade undirected variation', 'decision': 'A dedicated age-fit phenomenological variation description may be needed; do not make molecular ffef or class10 evolutionary selection compulsory for this earlier clause.', 'matchClaim': 'open'},
        {'sourceGoalId': source_ids[1], 'scope': 'Class10 nonmolecular mutation/recombination', 'mutationComponent': 'proposed nonmolecular variation candidate or independently corrected/re-scoped 9f', 'recombinationComponent': MEIOSIS, 'matchClaim': 'partial components pending independent review; full 1d mitosis scope is not asserted by FW7 alone'},
        {'sourceGoalId': source_ids[2], 'scope': 'Class10 mutation/recombination/selection evolutionary interplay', 'candidateTarget': VARIATION, 'matchClaim': 'pending corrected-text/source review; do not certify extra allopatric/sympatric speciation, theory comparison or three selection modes from this clause'},
        {'sourceGoalId': 'ni-biology-seki-kc2015-fw6-008-d14910ea', 'scope': 'Actual p.87 genetic recombination on the basis of meiosis', 'candidateTarget': MEIOSIS, 'matchClaim': 'existing partial component supported; not a new complete A/D/P review'},
    ],
    'lowerStageVariationCandidate': {
        'candidateKey': 'phenomenological-genetic-variation',
        'proposedTitleDe': 'Genetische Variabilität phänomenologisch erklären',
        'proposedTitleEn': 'Explain genetic variability at a descriptive level',
        'proposedDescriptionDe': 'Die lernende Person kann an gegebenen Vererbungsbefunden und einfachen Modellen erklären, wie Mutationen neue erbliche Varianten und Rekombination neue Kombinationen vorhandener Erbanlagen hervorbringen.',
        'proposedDescriptionEn': 'The learner can use supplied inheritance results and simple models to explain how mutations produce new heritable variants and recombination produces new combinations of existing inherited factors.',
        'sourceScope': 'NI FW7.1 by end of class10, explicitly nonmolecular; not blanket earlier-grade or all-state approval.',
        'requiresCandidate': [MEIOSIS, ORIENTATION], 'profile': variation_profile,
        'reviewRequired': 'Independent semantic atomicity, source binding, task content, grade fit and frontier review. No stable goal ID minted and no extra goal closed.',
    },
    'adoptionGate': 'Keep the true required NI curriculum intent. Unsupported molecular ffef rows cannot be retained as source proof, but removal alone cannot be called complete until required age-fit coverage and usable frontier are proved. Preserve historical review files and protect current maturity floors.',
}
save('source-remediation.plan.json', plan)

v2 = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-01/biologie-q1-ffef-candidate-v2/visualization'
images = []
for name in ['genmutationen-candidate.png', 'preview-360.png', 'preview-680.png']:
    p = v2 / name
    with Image.open(p) as im: size = list(im.size)
    images.append({'path': str(p.relative_to(ROOT)), 'sha256': digest(p), 'dimensions': size, 'actuallyViewed': True})
save('image-findings.json', {
    'schemaVersion': 1, 'reviewedAt': NOW, 'reviewer': 'codex-biology-six-author',
    'modelFamily': 'GPT-6', 'exactModelIdentifier': None,
    'status': 'author_candidate_inspection_only',
    'activeState': {'allSixHaveNoPrimaryLink': True, 'existingValidActiveVs': 0, 'existingCandidateKept': 1, 'genuinelyAbsentOtherFiveAssets': True},
    'ffefCandidate': {
        'action': 'KEEP_INACTIVE_V2_CANDIDATE', 'images': images,
        'nativeFindings': 'Substitution 5→5 has one changed block; deletion 5→4 removes the crossed-out source block; insertion 5→6 adds a distinct pink block; duplication 5→7 copies the yellow–teal pair. The purple source-to-copy arrow begins on the left source and reaches the added pair on the right.',
        'mobile360Findings': 'All four headings remain legible; before/after arrows and block-count differences remain followable. No tiny explanatory text. Colour-dependent block coding benefits from explicit alt text.',
        'desktop680Findings': 'Copy arrow and all sequences are clear. 680×383 fits below the inspected 28rem image-height cap at a 16px root font.',
        'blockingFaultsFound': [],
        'altTextCandidateDe': 'Vier vereinfachte Sequenzänderungen als Vorher-nachher-Modelle: Substitution ersetzt einen Baustein, Deletion entfernt den markierten Baustein, Insertion fügt einen neuen hinzu, und Duplikation kopiert ein vorhandenes Paar; ein Pfeil verbindet das Ursprungspaar links mit seiner zusätzlichen Kopie rechts.',
        'altTextCandidateEn': 'Four simplified before-and-after sequence models: substitution replaces one unit, deletion removes the marked unit, insertion adds a new unit, and duplication copies an existing pair; an arrow connects the source pair on the left with its additional copy on the right.',
        'provenance': 'Existing local 2026-10-01 v2 package records a built-in image_gen edit of its v1 candidate. Its prompt and prior independent candidate review were read; no new image was produced.',
        'claimLimit': 'The coloured-block image is an orientation model, not DNA sequence/translation evidence. No active asset, source coverage, current-text D/P, V approval, human approval or mastery is claimed.',
    },
    'otherFive': [{'goalId': i, 'finding': 'No canonical primary link or existing matching native asset found across curricula, app/public and tmp including ignored files.', 'action': 'prompt_only_pending_scope_stabilisation'} for i in read(OUT / 'current-six.snapshot.json')['goalIds'] if i != FFEF],
})
print(json.dumps({'niUnsupportedRowsCaptured': len(plan['removeUnsupportedMappingRowsCandidate']), 'additional9fFindingOpen': True, 'lowerStageProfileFreshCases': 2, 'actualImagesViewed': 3, 'newImagesGenerated': 0}))
