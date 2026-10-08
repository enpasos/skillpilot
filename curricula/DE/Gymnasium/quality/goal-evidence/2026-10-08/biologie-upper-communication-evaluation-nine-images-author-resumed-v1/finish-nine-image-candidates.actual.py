# SPDX-License-Identifier: Apache-2.0
"""Prepare inactive image candidates and portable evidence; never import assets."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import subprocess
from PIL import Image

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
CANONICAL = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
assert not (OWN / 'author.final.freeze.json').exists()


def bind(path):
    data = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def write(path, value):
    assert path.is_relative_to(OWN)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


SCENES = {
    '12511dc3-b214-5f55-8d05-70cd2db784b9': {
        'description': 'Ein erfundenes Keimungsschema wird von einer Tabelle in eine passende Kurve überführt.',
        'altText': 'Comicgrafik mit der Überschrift Schema: Links enthält eine Tabelle die Tage 1, 2 und 3 mit 2, 4 und 6 Keimlingen. Ein Pfeil führt rechts zu einer Kurve mit denselben drei Punkten und den Achsen Tag und Keimlinge.',
        'reconstruction': 'Two large panels on a pale warm background. At upper left a small seedling motif, and a large label Schema. Left a cream table with headers Tag and Keimlinge and rows 1|2, 2|4, 3|6. A thick orange arrow points to the right line plot. Plot x-axis Tag ticks 1,2,3; y-axis Keimlinge ticks 0,2,4,6; three orange points at (1,2),(2,4),(3,6), joined in order. Keep the table values and plot coordinates consistent. These are fictional cumulative germinated-seed counts, never growth heights or real data. Use simple green/blue accents, dark bold lines, very large headers and numerals. No causal conclusion.',
        'inspection': 'Table and curve agree at all three values. Axis labels, numbers and transformation arrow remain recognizable at 360 pixels. The explicit Schema label prevents the small invented dataset from being presented as measured research. The image illustrates one representation change, not the entire interpreting/concluding competence.',
        'question': 'Do all table values, axes and plotted coordinates agree, and does the image keep a representation change distinct from a causal conclusion?',
    },
    '1407c8fe-c13c-5847-aeb3-1fe0885926eb': {
        'description': 'Eine Lichtkrümmung wird als Mechanismus betrachtet und einer offenen evolutionären Erklärung gegenübergestellt.',
        'altText': 'Ein grüner Spross krümmt sich zum Licht rechts. Links zeigt eine Linse mit Mechanismus längere Zellen auf der schattigen und kürzere auf der beleuchteten Seite. Rechts stehen unter Evolution unterschiedlich geformte Pflanzen bei Variation und eine kleinere Pflanzengruppe bei Selektion mit Fragezeichen.',
        'reconstruction': 'Centered green young shoot emerging from brown soil and curving toward a sun high on its right. Yellow light arrows travel from the right toward the plant. Large blue circular close-up on the left, labelled Mechanismus, depicts longer cells along the shaded left side and shorter cells on the lit right side. Large orange circular panel on the right, labelled Evolution: upper row shows several differently shaped seedlings labelled Variation; a downward arrow points to a smaller row labelled Selektion, beside a large open question mark. The separate lenses distinguish an individual physiological mechanism from a population/evolutionary explanation to investigate; the right panel is schematic, not proof of a historical scenario. Only words Mechanismus, Evolution, Variation, Selektion. No long cell captions, no purposeful face or plant desire, no inheritance of acquired individual elongation.',
        'inspection': 'The four main labels and the open question remain clear at 360 and 680 pixels. Long shaded-side cells and short lit-side cells correspond to curvature toward right-hand light. The evolutionary scene is a schematic inquiry, with no claim of proven population history or intentional evolution. It does not supply all everyday/technical or functional/causal language distinctions.',
        'question': 'Are cell elongation and light direction biologically consistent, and can a learner distinguish individual mechanism from the open population-level evolutionary explanation without teleology?',
    },
    '13874fa5-1370-5c51-990a-7dfb5f583c70': {
        'description': 'Dasselbe Teichthema wird für Besucher und eine Fachgruppe unterschiedlich aufbereitet.',
        'altText': 'Ein Jugendlicher präsentiert ein Teichbild. Links betrachten Besucher eine große Übersicht von Teich, Wasserpflanzen und Fisch. Rechts betrachtet eine Fachgruppe denselben Teich und getrennte Detailbilder von Wasserpflanze, Schnecke und Fisch. Die Tafeln tragen die Wörter Besucher und Fachgruppe.',
        'reconstruction': 'Friendly teenager in a green hoodie stands centrally in a pond-side learning setting and holds a source picture facing outward. Left large upright visitor poster labelled Besucher shows pond, water plants and a fish, with a simple speech icon and two visitors facing it. Right large upright poster labelled Fachgruppe shows the same pond overview and separate lower detail cards for a branched water plant, spiral-shelled snail and perch-like fish. Three students face this board and discuss it. Use no feeding arrows, predator-prey claims, measurements or reliability stamps. Both outputs preserve the same topic while adapting detail and format to context. Only large words Besucher and Fachgruppe. The central person gestures to the accessible poster, and the audiences face the printed board fronts.',
        'inspection': 'Both audiences face their boards. The same pond topic is retained with more distinct specimen details for the Fachgruppe; no feeding arrow asserts an unsupported biological relation. The two large audience words and contrasting output formats remain clear at 360 pixels. No species identification or factual population result is claimed.',
        'question': 'Does the illustration preserve the biological topic while changing detail for audience/context, and are its organism images and actor/display orientations credible?',
    },
    '6d931dd9-11cf-5275-8d91-1c844e7960dc': {
        'description': 'Ein biologisches Beobachtungsthema wird mit einem analogen Plakat und einer digitalen Folie präsentiert.',
        'altText': 'Ein Jugendlicher präsentiert vor zwei Zuhörenden ein Plakat mit Analog und einen Bildschirm mit Digital. Beide zeigen eine Biene an einer violetten Blüte, eine vergrößerte Blütendarstellung und ein Symbol für Beobachtungsnotizen.',
        'reconstruction': 'Friendly teenage presenter in three-quarter view between two big upright displays, with two peers attending. Left physical cream poster labelled Analog; right digital projected slide labelled Digital. Both show the same simple bee visiting a purple flower, one enlarged flower detail and a large observation-list icon. The speaker indicates a core motif. The printed and digital display fronts face their audience and the viewer. Warm classroom/park comic palette, clear dark outlines, large uncluttered biological motifs. No tiny numerical results, fabricated real experiment, honey claim or claim that presentation automatically creates understanding. Only labels Analog and Digital.',
        'inspection': 'Large biological motifs match across the analog and digital media, and the audience attends to the display fronts. The two medium labels and main subject remain recognizable at 360 pixels. Decorative detail is not measurement evidence; the image demonstrates presenting observations rather than a completed assessment.',
        'question': 'Do both media communicate the same credible biological core, with readable display content and coherent presenter/audience orientation?',
    },
    'cb218858-a468-5d3f-83e0-b60f83368af7': {
        'description': 'Urheber, Quelle und gekennzeichnetes Zitat werden an einem fiktiven Keimungsbeispiel verbunden.',
        'altText': 'Drei Bereiche heißen Urheber, Quelle und Zitat. Eine Lupe hebt M. Beispiel auf einem Buch über Keimung hervor. Ein Pfeil führt zum Buch und ein weiterer zu einer Karte mit dem Zitat „Keimung erforschen.“ und derselben Urheberangabe.',
        'reconstruction': 'Three big equal vertical cards on a pale cream/mint background: blue Urheber, green Quelle, yellow-orange Zitat. Left a large magnifying glass enlarges the fictional name M. Beispiel on a booklet whose cover also says Keimung and shows a germinating seed. Middle an upright large book with the same fictional author and title and a seedling illustration. Thick orange arrows connect the panels. Right upright report card displays the literal text „Keimung erforschen.“ in very large type, with M. Beispiel below, plus a small icon of the same source book and decorative lines. No people or writing actor. The example author, book and quotation are fictional teaching objects, not real source claims. Do not stamp them trustworthy. Quote marks enclose exactly the quoted sentence. Only large words Urheber, Quelle, Zitat; supporting book text M. Beispiel and Keimung; quoted sentence „Keimung erforschen.“. No actual journal, DOI, URL or complete-bibliography claim.',
        'inspection': 'German quotation marks and identical fictional author labels are consistent. All three main actions and the quotation are legible at 360 pixels; author details remain supporting rather than the sole cue. No person reads or writes an outward-facing document. The schematic book icon does not constitute a complete scholarly citation or source reliability judgement.',
        'question': 'Are the quotation marks, repeated author identity and source relation correct and readable, without implying that this fictional short example is a verified source or full citation?',
    },
    '0a9ee5c0-6196-5d16-ac65-dc516a3e0d0f': {
        'description': 'Zwei Lernende besprechen einen schematischen Moosvergleich und prüfen die Verbindung von Beleg und Begründung.',
        'altText': 'Zwei Jugendliche diskutieren vor einer Tafel mit Schema und zwei unterschiedlich stark vermoosten Steinen. Ihre Sprechblasen heißen Beleg und Begründung. Darunter verbinden Pfeile ein Fragezeichen in einer Lupe mit dem Wort Prüfen.',
        'reconstruction': 'Two thoughtful friendly teenagers sit on stones, one left in a green hoodie, one right in orange. They gesture toward one upright central evidence board whose printed front faces both their positions and the viewer. Board heading Schema; underneath two conceptual rocks, the left much more moss-covered than the right. Speech bubbles Beleg and Begründung above the two students. A large circular green return-arrow motif surrounds a magnifying glass with a question mark below the board, with the large label Prüfen. No notebook, paper report, pencil or writing gesture. The moss difference is an invented comparison and does not establish moisture, pollution or any other cause. Neither person wins, receives an approval tick or confirms a hypothesis. Only labels Beleg, Begründung, Prüfen, Schema.',
        'inspection': 'The learners attend to the same upright evidence board and gesture rather than writing on a reversed page. Beleg, Begründung, Schema and Prüfen remain readable at 360 pixels. The question and return loop leave the cause of the moss difference open and visibly allow further scrutiny/revision.',
        'question': 'Does the scene support respectful evidence-based argument and possible revision while leaving the cause of the moss difference genuinely open?',
    },
    '49ed2589-de3d-550e-8091-b8616c5536bc': {
        'description': 'Ein Teichbefund und eine Forderung zum Tierwohl verdeutlichen beschreibende und normative Aussagen.',
        'altText': 'Links steht unter Ist die Aussage Der Teich ist trüb. zu einer trüben Wasserprobe. Rechts steht unter Soll Tiere sollen geschützt werden. neben Teichtieren und einer Herzkarte mit Tierwohl. Die beiden Bereiche sind gleichwertig dargestellt.',
        'reconstruction': 'Two equally treated spacious panels in warm comic style. Blue left Ist with a neutral observer examining a visibly cloudy pond-water jar and the large sentence Der Teich ist trüb. Orange right Soll with a thoughtful person and pond animals, heart/value card Tierwohl, and the large sentence Tiere sollen geschützt werden. All German umlauts correct and short statement lines very large. Do not draw a logical inference arrow from cloudiness to duty, dissolved oxygen, pollution or its cause. The value statement is an example, never an official ethical outcome. No success ticks or right/wrong ranking.',
        'inspection': 'Both statement types and Tierwohl are readable at 360 pixels. The cloudy sample supports only the descriptive cloudiness statement. The right-hand protection statement has an explicit value cue; no arrow or approval badge converts the descriptive example into a scientific obligation.',
        'question': 'Are fact and value statement clearly distinguished, with an identifiable value and no unsupported oxygen/cause claim or fact-to-duty inference?',
    },
    '241825f3-c26c-5ddd-9c3b-1f0460384390': {
        'description': 'Eine Parkbeleuchtungsentscheidung wird lokal und global sowie für jetzt und später betrachtet.',
        'altText': 'Vier Felder kombinieren Lokal und Global mit Jetzt und Später. Eine Parklampe verbindet örtliche Szenen mit Menschen, Nachtfalter und Blumen sowie globale Szenen mit Erde und Energieversorgung. Fragezeichen lassen spätere Folgen offen.',
        'reconstruction': 'A spacious four-cell comic with large column headings Lokal and Global and large row headings Jetzt and Später. Center small park lamp decision icon, connected to the four perspectives. Local-now: lit park path, people and a moth close to the light. Local-later: same park context with flowers, insects and people and a large open question. Global-now: globe and connected energy-grid icon, without assuming a particular current electricity source. Global-later: globe, energy-resource icons and repeated lamps suggesting cumulative effects to examine, plus a large question. No emission amounts, doomed planet, mandatory policy, claim that one lamp causes global biodiversity collapse or prediction that an energy transition must occur. Biological local light effects and indirect energy consequences remain distinct. Only words Lokal, Global, Jetzt, Später.',
        'inspection': 'All four scope/time labels and core motifs are recognizable at 360 pixels. The lamp, moth and local park are distinguished from globe/energy icons. Question marks retain future uncertainty; depicted future resource icons are options for examination rather than predictions or numerical climate evidence.',
        'question': 'Are local direct light effects and indirect global energy consequences kept distinct, with readable time/scope dimensions and no asserted ecological or ethical outcome?',
    },
    '9a0b6a24-2946-50ca-8a2a-703735650e5a': {
        'description': 'Ein Bewertungsprozess zu einer Feuchtwiese wird aus persönlichen, gesellschaftlichen und ethischen Blickwinkeln überprüft.',
        'altText': 'Eine nachdenkliche Jugendliche betrachtet eine Feuchtwiesenkarte. Drei Bereiche heißen Ich, Wir und Werte und zeigen eigene Interessen, mehrere Beteiligte sowie eine offene Waage mit Natur- und Fairnesssymbolen. Ein Pfeilkreis mit Prüfen führt zu den Perspektiven zurück.',
        'reconstruction': 'Thoughtful teenage learner reviewing a large open wet-meadow map with water, grasses, frog and bird in a friendly abstract comic. Three equally prominent surrounding bubbles: Ich depicts personal preference/reflection; Wir shows different community members including farmer and resident; Werte shows a balanced open weighing motif with ecosystem/heart and person/fairness symbols, no winning side. Large circular return arrows labelled Prüfen connect the perspectives and map. Planning sheet/map contains no tiny text, verified vote or concluded policy. It is reflection on criteria, participation and judgement, not merely viewing an ecosystem or announcing ethical consensus. Only large words Ich, Wir, Werte, Prüfen. Keep any document orientation coherent for the nearby learner.',
        'inspection': 'The four core words remain readable at 360 pixels. Personal, community and value perspectives are distinct and return to the open decision process. The map has no pseudo-measurement or tiny decisive text, and the balance does not select a policy or claim official consensus.',
        'question': 'Does the picture show reflection on the evaluation process across personal, societal and ethical perspectives without declaring a correct ethical policy?',
    },
}

COMMON = ('Create one new finished raster PNG, landscape near 16:9 and 1672 by 941 pixels. '
          'Friendly hand-drawn botanical/classroom comic style with strong dark outlines, rounded forms, '
          'warm pale cream/mint backgrounds, soft greens, blues and orange accents. '
          'Core motifs and words must be readable at 360 and 680 pixels. Correct German letters and umlauts. '
          'No logo, watermark, technical identifiers or success badges. Conceptual illustration, '
          'not a real experiment, research result or complete assessment solution.\n\n')
initial = json.loads((OWN / 'nine-current-goals-and-original-prompts.readonly.author-entry.json').read_text())
current = {g['id']: g for g in json.loads(CANONICAL.read_text())['goals']}
assert set(SCENES) == {g['goalId'] for g in initial['nineGoals']}
canonical_before = bind(CANONICAL)
entries, author_reviews, dry_runs = [], [], []
for item in initial['nineGoals']:
    gid = item['goalId']
    directory = OWN / 'images' / gid
    assert current[gid] == item['wholeGoal'], f'Whole current goal changed: {gid}'
    goal = current[gid]
    scene = SCENES[gid]
    png = directory / f'{gid}.png'
    provenance = json.loads((directory / 'generation.actual-provenance.json').read_text())
    assert provenance['assetSha256'] == bind(png)['sha256']
    with Image.open(png) as image:
        image.verify()
    with Image.open(png) as image:
        assert image.size == (1672, 941) and image.format == 'PNG'
    for width in (360, 680):
        with Image.open(directory / f'actual-{width}.png') as view:
            assert view.width == width
    reconstruction = directory / 'image-reconstruction-prompt.de.md'
    reconstruction.write_text(COMMON + scene['reconstruction'] + '\n')
    link = {
        'type': 'goal-visualization', 'resourceType': 'image', 'role': 'primary',
        'skillpilotId': gid, 'title': f"Visualisierung: {goal['title']}",
        'url': f'/assets/goal-visualizations/biologie/{gid}/{gid}.png',
        'provider': 'OpenAI image_gen (Codex built-in)',
        'description': scene['description'], 'altText': scene['altText'],
        'lang': 'de', 'license': 'CC-BY-4.0', 'reviewStatus': 'pilot',
    }
    write(directory / 'resource-link.inactive-candidate.json', link)
    prepared = ROOT / f'tmp/goal-visualizations/{gid}/metadata.json'
    (directory / 'prepare-helper.actual-metadata.json').write_bytes(prepared.read_bytes())
    actual_prompt = directory / 'prompt.de.md'
    selected_attempt = provenance.get('selectedAttempt', 'v1')
    selected_generation = {
        'schemaVersion': 1, 'goalId': gid, 'selectedAttempt': selected_attempt,
        'actualTool': 'image_gen.imagegen', 'actualProvider': link['provider'],
        'modelVersion': None, 'modelVersionReason': 'Built-in tool did not expose a model version.',
        'actualSubmittedPrompt': bind(actual_prompt),
        'newImageNotEdit': True, 'referencedImages': [],
        'originalProviderOutput': provenance['source'],
        'actualOutputHint': provenance['toolOutputHint'],
        'boundPortablePng': bind(png), 'nativeSize': {'width': 1672, 'height': 941},
        'imageModification': 'Byte-exact copy of the generated PNG. Pillow used only for review resizing.',
        'generationIsQualityApproval': False,
    }
    write(directory / 'selected-generation.actual-tool-record.json', selected_generation)
    review = {
        'schemaVersion': 1, 'goalId': gid, 'role': 'Author inspection only',
        'recordedAtUtc': datetime.now(timezone.utc).isoformat(),
        'selectedAttempt': selected_attempt, 'wholeCurrentGoal': bind(directory / 'whole-current-goal.readonly.json'),
        'actuallyInspected': [bind(png), bind(directory / 'actual-360.png'), bind(directory / 'actual-680.png')],
        'method': 'Actual original-size and 360/680-pixel image views inspected by the author agent; no hash-only visual approval.',
        'authorDisposition': 'author_keep_candidate_pending_independent_V',
        'firsthandFindings': scene['inspection'],
        'independentVApproval': False, 'humanApproval': False,
        'priorAttempt': bind(directory / 'attempt-v1.author-rejection.json') if selected_attempt == 'v2' else None,
    }
    write(directory / 'author.actual-inspection.json', review)
    author_reviews.append(review)
    cmd = ['node', str(ROOT / 'scripts/import_goal_visualization.mjs'), gid, str(png),
           '--landscape=' + str(CANONICAL.relative_to(ROOT)), '--subject=biologie',
           '--provider=' + link['provider'], '--license=CC-BY-4.0', '--review-status=pilot',
           '--description=' + scene['description'], '--alt-text=' + scene['altText'],
           '--prompt=' + str(actual_prompt), '--reconstruction-prompt=' + str(reconstruction), '--dry-run']
    result = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True)
    assert result.returncode == 0, result.stderr
    assert 'Dry run only. No files were written.' in result.stdout
    (directory / 'import-helper.actual-dry-run.stdout.txt').write_text(result.stdout)
    dry_record = {'goalId': gid, 'argv': cmd, 'exitCode': result.returncode, 'stdout': bind(directory / 'import-helper.actual-dry-run.stdout.txt'), 'activeWrites': 0}
    write(directory / 'import-helper.actual-dry-run.json', dry_record)
    dry_runs.append(dry_record)
    entries.append({
        'goalId': gid, 'wholeCurrentGoal': goal,
        'wholeCurrentGoalSnapshot': bind(directory / 'whole-current-goal.readonly.json'),
        'imageCandidate': bind(png), 'nativeSize': {'width': 1672, 'height': 941},
        'viewsToInspect': {'full': bind(png), 'width360': bind(directory / 'actual-360.png'), 'width680': bind(directory / 'actual-680.png')},
        'selectedAttempt': selected_attempt,
        'actualGenerationPrompt': bind(actual_prompt),
        'standaloneReconstructionPrompt': bind(reconstruction),
        'actualProviderAndToolRecord': bind(directory / 'selected-generation.actual-tool-record.json'),
        'resourceLinkCandidate': link, 'resourceLinkFile': bind(directory / 'resource-link.inactive-candidate.json'),
        'ordinaryImporterDryRun': bind(directory / 'import-helper.actual-dry-run.json'),
        'firsthandReviewQuestion': scene['question'],
        'independentVApproval': False, 'humanApproval': False,
    })

assert bind(CANONICAL) == canonical_before, 'Dry run unexpectedly changed active canonical.'
case_source = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-upper-communication-evaluation-whole-author-resumed-v1/sixteen-whole-thirty-two-bilingual-cases.author-candidate.json'
case_input = json.loads(case_source.read_text())
case_context = {
    'schemaVersion': 1, 'role': 'Unreviewed peer-authored optional case context, no P approval',
    'sourceAtSnapshot': bind(case_source),
    'entries': [entry for entry in case_input['entries'] if entry['goalId'] in SCENES],
    'modelLimit': 'Own fictional teaching models; no actual learner results or real measured data.',
    'independentApproval': False, 'humanApproval': False,
}
assert len(case_context['entries']) == 9
write(OWN / 'nine-whole-current-goals-peer-case-context.readonly.json', case_context)
write(OWN / 'author-nine.actual-inspections.json', {'schemaVersion': 1, 'entries': author_reviews, 'independentVApproval': False, 'humanApproval': False})
write(OWN / 'nine-import-helper.actual-dry-runs.json', {'schemaVersion': 1, 'entries': dry_runs, 'canonicalBefore': canonical_before, 'canonicalAfter': bind(CANONICAL), 'activeWrites': 0})

entry = {
    'schemaVersion': 1, 'reviewId': 'biologie-upper-communication-evaluation-nine-images-author-resumed-v1',
    'role': 'Neutral inactive nine-image independent-review entry',
    'createdAtUtc': datetime.now(timezone.utc).isoformat(),
    'scope': 'Exactly the nine current communication/evaluation goals listed in entries. Root owns the other seven KEEP images.',
    'entries': entries,
    'actuallyInspectedStyleReferences': initial['actuallyInspectedStyleReferences'],
    'optionalUnreviewedCaseContext': bind(OWN / 'nine-whole-current-goals-peer-case-context.readonly.json'),
    'independentReviewInstructions': [
        'Read each whole current DE/EN goal and personally inspect the selected full, 360 and 680 views before reading author findings or prior attempts.',
        'Make a firsthand accept/reject decision for every selected PNG: biological/scientific fidelity, core didactic usefulness, readability, actor/display orientation and honest model limits.',
        'An image illustrates the core; it must not provide the complete assessment answer, fabricate measurements, automatically prove a hypothesis or impose an ethical outcome.',
        'Check the accurate scene description/alt text and reconstruction prompt, including German words and umlauts.',
        'Bind decisions to the exact selected PNG and whole current goal; do not infer visual approval from a hash or provider.',
    ],
    'reviewStatus': 'pending_independent_V_review',
    'openObligations': ['Independent machine image reviewer A', 'Separate independent machine image reviewer B', 'Root integration/D and P rebinding only after actual reviews and ordinary affected checks'],
    'authorFindingsIncludedAsVerdict': False, 'independentVApproval': False,
    'humanApproval': False, 'actualLearnerResults': False, 'activeWrites': 0, 'strictGain': 0,
}
write(OWN / 'neutral-nine-images.independent-review.entry.json', entry)
(OWN / 'README.md').write_text('''# Nine Biology image candidates

License: CC-BY-4.0 for the own didactic media and prompts; Apache-2.0 for helper code.

The neutral independent-review entry binds all nine selected PNGs to the complete unchanged current goals, the actual generation tool/provider records, original selected prompts, standalone reconstruction prompts, descriptions/alt text and full/360/680 views. All selected images are native 1672 × 941 PNGs. Four rejected first attempts remain as author history; their findings are excluded from the neutral entry so independent reviewers can judge the selected images firsthand.

The nine importer invocations were actual dry runs and wrote no active files. The peer case-context snapshot is optional, unreviewed author material and contains fictional teaching models. Neither image generation nor author inspection supplies independent V, D/P acceptance, human approval or strict closure. The remaining seven KEEP bindings belong to the root's separate packet.

Required next work: independent A and B image reviews on the exact selected assets; only then root-owned integration and affected D/P/ordinary checks. Do not alter this first-frozen author packet while those reviews are running.
''')

payloads = []
for path in sorted(OWN.rglob('*')):
    assert not path.is_symlink(), path
    assert path.name != '.git', path
    if path.is_file() and path.name != 'author.final.freeze.json':
        payloads.append(bind(path))
write(OWN / 'author.final.freeze.json', {
    'schemaVersion': 1, 'role': 'First immutable author payload freeze, not quality approval',
    'sealedAtUtc': datetime.now(timezone.utc).isoformat(), 'payloads': payloads,
    'neutralEntry': bind(OWN / 'neutral-nine-images.independent-review.entry.json'),
    'wholeNineCurrentGoalsUnchanged': True, 'activeWrites': 0, 'strictGain': 0,
    'independentVApproval': False, 'humanApproval': False,
})
print(json.dumps({'neutralEntry': bind(OWN / 'neutral-nine-images.independent-review.entry.json'), 'firstFreeze': bind(OWN / 'author.final.freeze.json'), 'images': 9, 'payloads': len(payloads), 'activeWrites': 0, 'strictGain': 0}))
