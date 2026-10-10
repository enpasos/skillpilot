"""Write inert, individually authored candidates; never modify live curriculum data."""
from pathlib import Path
import copy
import hashlib
import json
import shutil
from datetime import datetime, timezone

ROOT = Path('/home/enpasos/projects/skillpilot')
BASE = Path(__file__).resolve().parent
GOAL_ID = '479fb87a-3a5a-5892-8b3e-dfb1d07e9612'
CAN_PATH = Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json')
IMAGE_BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-review/wirtschaft-contract-types-one-author-20261009-v1'

def digest(data):
    return hashlib.sha256(data).hexdigest()

def save(name, value):
    target = BASE / name
    data = (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode()
    if target.exists():
        assert target.read_bytes() == data, f'Refusing to overwrite historical author artifact: {target}'
    else:
        target.write_bytes(data)
    return digest(data)

current_bytes = (ROOT / CAN_PATH).read_bytes()
landscape = json.loads(current_bytes)
original = next(g for g in landscape['goals'] if g['id'] == GOAL_ID)
candidate = copy.deepcopy(original)
candidate['titleEn'] = "Distinguish contract types and the parties' obligations"
candidate['descriptionEn'] = "The learner can identify contract types in case examples, explain the obligations of the contracting parties and thereby distinguish them from contracts of sale."
candidate['dimensionTags']['demandLevel'] = 'AB2'
save('original-whole-goal.current300.json', original)
save('candidate-whole-goal.before-image.inert.json', candidate)

norms_de = "Gegeben sind didaktische Normparaphrasen: § 433 BGB verpflichtet beim Kauf zur Übergabe und Eigentumsverschaffung einer mangelfreien Sache gegen Kaufpreis und Abnahme. § 631 BGB betrifft das vereinbarte Werk bzw. einen zugesagten Erfolg gegen Vergütung. § 611 BGB betrifft zugesagte Dienste gegen Vergütung. § 650 Abs. 1 BGB verweist bei Herstellung und Lieferung neuer beweglicher Sachen grundsätzlich auf Kaufrecht; bei nicht vertretbaren Sachen bleiben die dort ausdrücklich genannten ergänzenden Werkregeln zu beachten. Die folgenden Fälle enthalten keine digitalen Produkte."
norms_en = "Use these teaching paraphrases: section 433 BGB requires delivery and transfer of ownership of goods free from defects in exchange for the price and acceptance. Section 631 concerns an agreed work or promised result in exchange for payment. Section 611 concerns agreed services in exchange for payment. Section 650(1) generally applies sales law to manufacture and delivery of new movable goods; the supplementary work-contract rules expressly listed there remain relevant for non-fungible goods. None of the cases involves digital products."

profile = {
    'archetype': 'concept',
    'expectations': [{
        'id': 'promised-performance-and-mutual-obligations',
        'essentialUnderstandingDe': 'Entscheidend ist die konkret versprochene Hauptleistung: vereinbarter Erfolg beim Werkvertrag, vereinbarte Tätigkeit beim Dienstvertrag und Lieferung/Eigentumsverschaffung einer Sache beim Kauf. Herstellung und Lieferung einer neuen beweglichen Sache ist als Werklieferung grundsätzlich kaufrechtlich zu behandeln. Die Zuordnung erklärt die Hauptpflichten beider Parteien; Branchenbezeichnungen oder das bloße Vorliegen einer Zahlung entscheiden nicht.',
        'essentialUnderstandingEn': 'The agreed main performance determines the type: a promised result for a contract for work, agreed services for a service contract, and delivery/transfer of ownership for a sale. Manufacture and delivery of new movable goods is generally governed by sales law. The classification explains both parties’ main obligations; an industry label or the mere presence of payment does not determine the type.',
        'observablePerformanceDe': 'Die Person ordnet konkrete Vertragszusagen anhand der bereitgestellten Normen begründet zu, benennt die jeweiligen Hauptpflichten beider Parteien und erklärt damit den Unterschied zum Kauf einschließlich der kaufrechtlichen Grundregel für Werklieferung.',
        'observablePerformanceEn': 'The learner uses the supplied rules to justify the classification of concrete contractual promises, states both parties’ main obligations, and explains the distinction from a sale including the basic sales-law rule for manufacture and delivery.'
    }],
    'coverageExpectations': {
        'requiredExpectationIds': ['promised-performance-and-mutual-obligations'],
        'alternativeExpectationGroups': [],
        'minimumIndependentDemonstrations': 2,
        'freshVariationRequired': True,
        'independentTransferRequired': True
    },
    'variationAxes': [
        {'id': 'result-service-and-new-goods', 'textDe': 'Reparaturerfolg, sorgfältige Unterrichtszeit, fertiger Warenkauf und Herstellung/Lieferung einer neuen beweglichen Sache.', 'textEn': 'A successful repair, careful lesson time, a sale of ready goods, and manufacture/delivery of new movable goods.'},
        {'id': 'fresh-everyday-setting', 'textDe': 'Fahrradwerkstatt und Musikunterricht gegenüber Klavierwerkstatt und Lernbegleitung; gleiche Berufe können verschiedene Leistungen versprechen.', 'textEn': 'A bicycle workshop and music lesson versus a piano workshop and tutoring; the same occupation can promise different performances.'}
    ],
    'applicationCaseBriefs': [
        {
            'id': 'bicycle-repair-lesson-and-new-stool',
            'taskDemandDe': norms_de + ' Vier fiktive Zusagen: Eine Werkstatt repariert die defekte Bremse des bereits der Kundin gehörenden Fahrrads für 45 € und schuldet eine funktionsfähige Bremse. Eine Lehrkraft bietet 60 Minuten sorgfältigen Gitarrenunterricht für 30 € ohne Garantie eines Lernerfolgs. Ein Geschäft verkauft und übergibt einen bereits fertigen Helm für 25 €. Eine Schreinerei stellt aus eigenem Holz einen neuen beweglichen Hocker nach vereinbarten Maßen her und liefert ihn für 80 €. Ordne die Zusagen zu, begründe am Leistungsversprechen und nenne die Hauptpflichten beider Parteien. Erkläre besonders, weshalb die Werklieferung nicht einfach mit der Reparatur gleichgesetzt wird.',
            'taskDemandEn': norms_en + ' Four fictional promises: a workshop repairs the defective brake of the customer’s existing bicycle for €45 and promises a working brake. A teacher offers 60 minutes of careful guitar instruction for €30 without guaranteeing learning success. A shop sells and hands over a ready-made helmet for €25. A carpenter manufactures a new movable stool from their own timber to agreed dimensions and delivers it for €80. Classify the promises, justify each from the agreed performance and state both parties’ main obligations. Explain especially why manufacture and delivery is not simply the same as repair.',
            'expectedPerformanceDe': 'Reparatur: Werkvertrag, geschuldeter Reparaturerfolg gegen Vergütung. Unterricht: Dienstvertrag, vereinbarter Unterricht gegen Vergütung, kein garantierter Fortschritt. Helm: Kaufvertrag, vertragsgemäße Übergabe/Eigentumsverschaffung gegen Preis und Abnahme. Neuer Hocker: Werklieferungsvertrag nach § 650 Abs. 1, Herstellung und Lieferung mit grundsätzlich kaufrechtlicher Leistungspflicht; Preis/Abnahme auf Kundenseite. Die Person begründet mit dem neuen beweglichen Liefergegenstand und beachtet, dass die ausdrücklich ergänzend geltenden Werkregeln nicht pauschal entfallen. Zahlung oder Handwerksbetrieb allein begründen keine Zuordnung.',
            'expectedPerformanceEn': 'Repair: contract for work, a promised repair result in exchange for payment. Lesson: service contract, agreed instruction in exchange for payment without guaranteed progress. Helmet: sale, conforming delivery/transfer of ownership against price and acceptance. New stool: manufacture-and-delivery contract under section 650(1), with manufacture and delivery generally governed by sales law and price/acceptance owed by the customer. The learner reasons from the new movable item and does not claim that expressly supplementary work-contract rules disappear. Payment or a craft business alone does not determine classification.',
            'understandingFocusDe': 'Vertragsart und beiderseitige Hauptpflichten aus dem konkreten Leistungsversprechen ableiten.',
            'understandingFocusEn': 'Derive the contract type and both parties’ main obligations from the agreed performance.'
        },
        {
            'id': 'piano-restoration-tutoring-and-made-bags',
            'taskDemandDe': norms_de + ' Frischer fiktiver Fall: Eine Klavierwerkstatt übernimmt für 200 € die Reparatur eines vorhandenen Instruments und verspricht, dass eine bisher defekte Taste wieder zuverlässig funktioniert. Dieselbe Fachperson bietet 90 Minuten sorgfältige Übungsbegleitung für 50 € an, ohne einen Prüfungserfolg zu versprechen. Ein Laden verkauft einen fertigen mechanischen Taktgeber für 20 €. Eine Textilwerkstatt näht aus eigenem Material zehn neue Stofftaschen mit vereinbarten Maßen und liefert sie für 100 €. Vergleiche die Hauptpflichten der Parteien, ordne anhand der Normen zu und erkläre, warum weder derselbe Beruf noch der Unterrichtszweck alle Verträge zu derselben Vertragsart macht.',
            'taskDemandEn': norms_en + ' A fresh fictional case: a piano workshop repairs an existing instrument for €200 and promises that a defective key will function reliably again. The same specialist offers 90 minutes of careful guided practice for €50 without promising exam success. A shop sells a ready mechanical metronome for €20. A textile workshop makes ten new fabric bags from its own material to agreed dimensions and delivers them for €100. Compare both parties’ main obligations, classify using the rules, and explain why neither the same occupation nor an educational purpose makes all agreements the same contract type.',
            'expectedPerformanceDe': 'Instrumentreparatur bleibt Werkvertrag wegen des zugesagten Erfolgs; Übungsbegleitung ist Dienstvertrag wegen der zugesagten Tätigkeit. Taktgeber ist Kauf, neue herzustellende und zu liefernde Taschen sind Werklieferung mit der kaufrechtlichen Grundregel des § 650 Abs. 1. Die Person stellt Erfolg/Tätigkeit/Lieferung jeweils der vereinbarten Gegenleistung gegenüber, erläutert bei Waren die Übergabe/Eigentumsverschaffung und trennt die Art der Leistung von Berufs- und Zwecketiketten. Sie übernimmt keine Garantie für den Unterricht und erfindet keine Leistungsstörung oder Strafbarkeit.',
            'expectedPerformanceEn': 'Instrument repair remains a contract for work because a result is promised; guided practice is a service contract because the agreed activity is promised. The metronome is a sale; newly manufactured and delivered bags fall under manufacture and delivery with section 650(1)’s basic sales-law rule. The learner pairs result/services/delivery with the agreed counter-performance, explains delivery/transfer of ownership for goods, and separates promised performance from occupation and purpose. They invent neither a learning guarantee nor a breach or criminal offence.',
            'understandingFocusDe': 'Die Zuordnungsregel in einen frischen Kontext übertragen, ohne Berufs- oder Zweckschablone.',
            'understandingFocusEn': 'Transfer the classification rule to a fresh setting without relying on occupation or purpose labels.'
        }
    ]
}

stamp = datetime.now(timezone.utc).isoformat()
save('positive-one-whole-profile-two-bilingual-cases.author.candidate.json', {
    'schemaVersion': 1,
    'authoringContract': 'positive-understanding-evidence-candidates-v1',
    'reviewId': 'wirtschaft-contract-types-one-bounded-author-20261009-v1',
    'reviewedAt': stamp,
    'reviewer': '/root (original author only; independent review and human approval pending)',
    'goals': [{
        'goalId': GOAL_ID,
        'reason': 'Own inert author candidate after actual full current goal/prerequisite, actual BY WR13.1.1 competence/content and current official BGB 433/611/631/650 reading. Two fictional fresh cases include all three expressly required contract types and a sale comparison. E1/G1 only; no learner observation, no human approval and no independent self-approval. Retains existing memory card economics-law-contract-types and its trace.',
        'evidenceLevel': 'E1',
        'maximumClaimScope': 'G1',
        'dissent': [],
        'profile': profile
    }]
})
save('individual-author-decisions-and-actual-primary-read.receipt.json', {
    'schemaVersion': 1,
    'status': 'inert_author_candidate_unreviewed',
    'author': '/root',
    'goalId': GOAL_ID,
    'currentCanonical': {'path': str(CAN_PATH), 'sha256': digest(current_bytes)},
    'currentWholeGoalSha256': digest((json.dumps(original,ensure_ascii=False,sort_keys=True,separators=(',',':'))).encode()),
    'decisions': {
        'descriptionDe': 'KEEP exact normative competency, one case-based classification explained by obligations.',
        'english': 'REVISE genuine translation of current German title and description, no scope expansion.',
        'demandLevel': 'Propose AB1 to AB2: applied classification and explanation using supplied rules, independent review required.',
        'phase': 'KEEP Q3.',
        'prerequisite': 'KEEP bd413 legal methods: current description is general legal methods with special attention to purchases; no wholesale graph cleanup.',
        'semanticAtomicity': 'Propose atomic: identify contract type from promised main performance and explain mutual duties as the reason for distinction; not a bundle of breach remedies or criminal law.',
        'memory': {'proposedDecision': 'memory_required', 'deckIds': ['de_gymnasium_economics_business_law'], 'memoryGoalIds': ['mem_de_gym_economics_business_law'], 'cardId': 'economics-law-contract-types', 'decision': 'KEEP compact existing principle: contract type determines main obligations, rights and potential claims; no automatic no_memory_needed and no card edit.', 'visibility': 'Existing visibility must be revalidated against the actual combined frame.'},
        'visualization': 'Missing image: one new PNG candidate, native tool generation; actual independent native/360/680/perspective review still required.',
        'sourceAndCourse': 'Actual BY WR13.1.1 raised-level passage expressly requires Werkvertrag, Werklieferungsvertrag and Dienstvertrag. This author candidate does not assert approval of all foreign source edges or a regional GK/LK equivalence.'
    },
    'actuallyReadPrimarySources': [
        {'url': 'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/13/wirtschaft-und-recht/erhoeht', 'section': 'WR13.1.1, competence and expressly listed contract types', 'actualSuccessfulAccess': 'web open 2026-10-09; current heading and paragraphs actually read'},
        {'url': 'https://www.gesetze-im-internet.de/bgb/__433.html', 'section': '433(1)-(2)', 'actualSuccessfulAccess': 'urllib readonly HTTP200, 2026-10-09, after repeated actual web timeout failures', 'rawCacheSha256': 'd1a35bd9254737d255614eb23a4e39330f257c3976224a12b42b8f6e5e900004', 'historicalWebFailures': 'Repeated web timeouts retained in tool outputs; not represented as successful source reads.'},
        {'url': 'https://www.gesetze-im-internet.de/bgb/__611.html', 'section': '611(1)-(2)', 'actualSuccessfulAccess': 'web open 2026-10-09'},
        {'url': 'https://www.gesetze-im-internet.de/bgb/__631.html', 'section': '631(1)-(2)', 'actualSuccessfulAccess': 'web open 2026-10-09'},
        {'url': 'https://www.gesetze-im-internet.de/bgb/__650.html', 'section': '650(1) and checked digital exceptions in (2)-(4)', 'actualSuccessfulAccess': 'web open 2026-10-09; author cases intentionally use only physical non-digital goods'}
    ],
    'actualPreparationCommand': {'command': ['node','scripts/prepare_goal_visualization.mjs',GOAL_ID,'--landscape='+str(CAN_PATH),'--subject=wirtschaftswissenschaften','--provider=OpenAI Codex image_gen','--review-status=draft'], 'actualExitCode': 0},
    'independentApproval': False,
    'humanApproval': False,
    'strictCompletionDelta': 0
})

generated = Path('/home/enpasos/.codex/generated_images/01a11a0e-ea0e-7923-907d-c5403b2f7a25/exec-fb4048df-6bb6-4f0f-96bb-1ddd0f510ded.png')
target = IMAGE_BASE / 'candidate.png'
if target.exists():
    assert target.read_bytes() == generated.read_bytes()
else:
    shutil.copyfile(generated, target)
prompt = IMAGE_BASE / 'actual-generation-prompt.txt'
receipt = {
    'schemaVersion': 1,
    'goalId': GOAL_ID,
    'author': '/root',
    'actualTool': 'OpenAI Codex image_gen (built-in)',
    'actualGeneratedSourcePath': str(generated),
    'candidatePath': str(target.relative_to(ROOT)),
    'candidateSha256': digest(target.read_bytes()),
    'promptPath': str(prompt.relative_to(ROOT)),
    'promptSha256': digest(prompt.read_bytes()),
    'formatDecision': 'Missing image; PNG, close native16:9 output. No old image is replaced.',
    'actualInspectedStyleReference': 'curricula/DE/Gymnasium/visualizations/wirtschaftswissenschaften/bd413a7c-775a-5318-813c-0b75578f9a11/bd413a7c-775a-5318-813c-0b75578f9a11.png',
    'referenceStrategy': 'Root actually viewed existing whole legal-method image for warm comic continuity; brand-new scene, no image supplied as an edit target.',
    'generationIsApproval': False,
    'independentNative360680Review': 'pending',
    'humanApproval': False,
    'license': 'CC-BY-4.0'
}
save('actual-generated-one-tool-provenance-and-unapproved-workspace-save.receipt.json', receipt)
print(json.dumps({'wholeGoal': 'candidate-whole-goal.before-image.inert.json', 'P': 'positive-one-whole-profile-two-bilingual-cases.author.candidate.json', 'candidatePng': str(target.relative_to(ROOT)), 'sha256': receipt['candidateSha256'], 'strictDelta':0},ensure_ascii=False))
