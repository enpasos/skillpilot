from pathlib import Path
from datetime import datetime, timezone
from PIL import Image, ImageChops
import hashlib
import json
import subprocess
import sys


ROOT = Path(__file__).resolve().parents[6]
OUT = Path(__file__).resolve().parent
AUTHOR = ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-review/wirtschaft-one-Montan-executive-director-root-image-author-20261009-v1'
PERFORMANCE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-BE-three-source-rests-director-cycle-EU-independent-whole-performance-need-review-v1'
GOAL_AUTHOR = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-BE-three-source-rests-Montan-director-cycle-and-EU-current-2026-bounded-author-v1'
GOAL_ID = '912ab267-ee00-581b-a31c-dfc0b3587184'


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def ref(path):
    return {'path': str(path.relative_to(ROOT)), 'sha256': digest(path), 'wholeBytes': path.stat().st_size}


def write(name, value):
    path = OUT / name
    if path.exists():
        raise RuntimeError('Sealed review files are immutable: ' + str(path))
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    json.loads(path.read_text(encoding='utf-8'))
    return path


handoff = AUTHOR / 'actual-generator-native-candidate-and-three-view-handoff.author-not-V-approval.receipt.json'
prompt = AUTHOR / 'actual-final-generation-prompt.md'
native_path = AUTHOR / 'actual-generated-Montan-executive-director.native.author-candidate.png'
phone_path = AUTHOR / 'actual-generated-Montan-executive-director.width360.review-only.png'
desktop_path = AUTHOR / 'actual-generated-Montan-executive-director.width680.review-only.png'
goal_path = GOAL_AUTHOR / 'whole-new-stable-Montan-executive-contract.author.json'
need_path = PERFORMANCE / 'actual-independent-one-new-director-whole-Need-atomicity-AB2-minimal-requires-and-memory-KEEP.json'
performance_receipt = PERFORMANCE / 'actual-final-independent-four-P12-three-qualified-source-unions-and-one-new-director-Need-AM-M-KEEP.receipt.json'
primary_receipt = PERFORMANCE / 'actual-independent-whole-primary-reading-receipt-and-own-boundaries.json'
fab_path = ROOT / 'curricula/DE/Gymnasium/visualizations/wirtschaftswissenschaften/fab48742-756b-564d-87ef-cd6f3c75f348/fab48742-756b-564d-87ef-cd6f3c75f348.png'
input_paths = [handoff, prompt, native_path, phone_path, desktop_path, goal_path, need_path, performance_receipt, primary_receipt, fab_path, ROOT / 'AGENTS.md', ROOT / 'docs/concept/skill-graph/atomic-goal-visualizations.md']
before = {str(p.relative_to(ROOT)): ref(p) for p in input_paths}
assert digest(handoff) == 'f5c28fbc0c97c8df99eb61dc3fc73db9c2019056d35782ac188ac5faca444af9'
assert digest(native_path) == 'b2bb09765b8134f4dbef11a33ab9725a0d791192fb298498e6db5691b2066359'
assert digest(phone_path) == 'a75ac0def0993d9d28d7915fa3c17bf9a8129009cf67cf15214f02cea288b41a'
assert digest(desktop_path) == '9a7b0b78f57a2b38c032b7cdebbdca3d0508ba0de2909780b7000639c0de6160'
assert digest(prompt) == 'ac917c3b8645d6a0d97af37324f960b5e1486c2648ee5976ee5974bdcbc7c38c'
assert digest(performance_receipt) == '2b760571c675ef4bee6a2edf8ace1e9bdb8a91db9d54850bf488c168c1d11241'
assert digest(need_path) == '63b9ed2786a436896dbbd149bb3bd85a7da6ae95972c587c334f481796ac48af'
assert digest(fab_path) == '0132d7483d8c31dd1a25c37c250e510125c45bf750b88b078eed2dc3214e8335'

goal = json.loads(goal_path.read_text(encoding='utf-8'))
assert goal['id'] == GOAL_ID
author = json.loads(handoff.read_text(encoding='utf-8'))
assert author['imageAuthor'] == '/root' and author['independentVApproval'] is False
assert author['liveImportPerformed'] is False and author['humanApproval'] is False
native = Image.open(native_path)
assert native.format == 'PNG' and native.size == (1672, 941)
inspections = []
for kind, path, size in [('native-original', native_path, (1672, 941)), ('uncropped-inspection-360', phone_path, (360, 203)), ('uncropped-inspection-680', desktop_path, (680, 383))]:
    im = Image.open(path)
    assert im.format == 'PNG' and im.size == size
    entry = {'kind': kind, **ref(path), 'width': im.width, 'height': im.height, 'format': im.format, 'actualViewImage': True, 'inspectionMethod': 'Reviewer actually viewed this complete image with view_image(detail=original); counts and meanings below are independent visual observations, not inferred from the prompt or pixel hashes.'}
    if kind != 'native-original':
        expected = native.resize(size, Image.Resampling.LANCZOS)
        assert ImageChops.difference(expected.convert('RGBA'), im.convert('RGBA')).getbbox() is None
        entry['wholePixelsEqualToOwnNativeUncroppedLanczosResize'] = True
        entry['transformation'] = 'Uncropped proportional native resize for review only; production asset was not edited.'
    else:
        entry['transformation'] = 'Unchanged native generated PNG.'
    inspections.append(entry)

observations = write('actual-independent-native-phone-desktop-whole-visual-and-legal-observations.json', {
    'schemaVersion': 1,
    'reviewer': '/root/economics_source3_independent_final_performance_need',
    'imageAuthor': '/root',
    'independentOfImageAuthor': True,
    'goalId': GOAL_ID,
    'wholeGoalContract': goal,
    'wholeGoalInput': ref(goal_path),
    'alreadySealedIndependentNeedAtomicityMemoryAndWholePerformance': [ref(need_path), ref(performance_receipt), ref(primary_receipt)],
    'actualViews': inspections,
    'actualNativeMotifDe': 'Links sitzen drei gleich große erwachsene Leitungskollegen auf gleicher Höhe an einem leeren Tisch. Die Person in der Mitte trägt ein kleines Arbeitsdirektor-Schild. Rechts stehen fünf getrennte, gleich große Figuren unter §6-Gruppe: genau drei zeigen offene Ablehnungshände und korallenrote Stoppsymbole; zwei bleiben neutral. Bestellung führt zum Leitungsbereich, Widerruf davon weg; beide breiten Pfeile sind jeweils durch ein großes Stoppsymbol unterbrochen. Es gibt keine Krone, keinen erhöhten Direktorsitz, keinen grünen Freigabepfeil und keine Gesamtaufsichtsrats-Abstimmung.',
    'actualPhone360De': 'Die gleichrangige Leitung, die separate Fünfergruppe, die drei Ablehnungsgesten und beide gestoppten Richtungen bleiben bei 360 Pixeln unterscheidbar und abzählbar. Die kurzen Hauptüberschriften und Prozesswörter tragen die Orientierung. Das kleine Arbeitsdirektor-Schild ist auf dem schmalen Bild nicht zuverlässig lesbar; es ist keine lesepflichtige Norminformation. Die hervorgehobene mittlere Leitungsfigur und das ganze Leitungs-/Gruppenmotiv funktionieren auch ohne dieses optionale Namensschild. Keine gedrängte Legende oder Pflicht-Kleinschrift.',
    'actualDesktop680De': 'Bei 680 Pixeln sind alle fünf Figuren getrennt sichtbar, drei Stopphände klar, beide Pfeile mit eigenen Stopps eindeutig und das Direktor-Schild besser lesbar. Die wenigen großen Motive behalten freie Zwischenräume.',
    'actualActorPerspectiveDe': 'Der Tisch ist leer. Keine Person muss ein zum Betrachter ausgerichtetes Heft, Messinstrument oder Arbeitsblatt falsch herum lesen. Die großflächigen Überschriften und Pfeile sind Diagrammbeschriftung für den äußeren Betrachter. Das Direktor-Schild ist ein sichtbares Namensschild, kein von seinem Träger zu lesendes Dokument. Keine belegte Perspektivschwäche.',
    'actualLegalComparisonDe': 'Das Bild zeigt die besondere Grenze des §13 MontanMitbestG anhand der illustrativen fünfköpfigen §6-Gruppe: Drei Gegner bilden deren Mehrheit. Die Bestellung und ebenso der Widerruf dürfen gegen diese Mehrheit nicht erfolgen. Der Arbeitsdirektor erscheint gemäß §13 als gleichberechtigtes Mitglied des gesetzlichen Vertretungsorgans. Die §6-Gruppe steht räumlich getrennt von der Leitung; sie wird weder als Betriebsrat noch als gesamter Aufsichtsrat mit 5+5+1 Sitzen ausgegeben. Die Gruppenstimmen ersetzen keine anderen Bestellungsvoraussetzungen. Die tatsächlichen vollständigen relevanten §§1,6,13 sind im unabhängigen Primary-Reading-Receipt geprüft, nicht nur in diesem Bildprompt.',
    'explicitLegalAndDidacticBoundaries': [
        'Five persons are one illustrated default §6 group, not the universal size of every board or every qualifying company.',
        'Three of five is the majority in this illustrated case; the actual goal applies current supplied rules and fully stated company and voting facts.',
        'Two opponents would only remove this particular statutory majority barrier; neither the picture nor this review grants automatic appointment or removal.',
        'The §6 group has this opposition barrier; it does not appoint alone. Both blocked routes, no green approval and no purported full-board vote keep the depiction bounded to that barrier.',
        'The labour director is an equal executive member, not an extra supervisory-board seat, a works council or a unilateral worker delegate.',
        'The illustration introduces the legal relationship. It is not a complete company-law diagram, legal advice, a complete statute or a learner assessment solution.'
    ],
    'actualStyleAndFormatDe': 'Freundliche klare Comicfiguren, cremefarbener Hintergrund und gedeckte Petrol-/Apricot-/Blautöne passen zur tatsächlich gesehenen vorhandenen Montan-Aufsichtsratsillustration fab. Das breite native PNG 1672×941 ist nahe 16:9 und erhält ausreichenden Platz zwischen den wenigen Motiven. Die tatsächlichen 360/680-Sichtungen zeigen keinen didaktischen Vorteil eines anderen Seitenverhältnisses. Keine photorealistische oder steril-technische Neugestaltung; keine programmatischen SVG-Ersatzbilder.',
    'actualExistingFabComparison': {'asset': ref(fab_path), 'nativeActualViewImage': True, 'observedMotif': 'Friendly comic comparison Allgemein 6:6 versus Montan 5:5+1; supervisory-board composition, distinct from the new director executive role.', 'unchanged': True, 'existingKEEPNotReopened': True, 'repurposedAsExecutivePicture': False},
    'observedMarkOrPrivateDataIssues': [],
    'findings': [],
    'decision': 'KEEP',
    'humanApprovalClaimed': False,
    'learnerPerformanceClaimed': False
})

after = {str(p.relative_to(ROOT)): ref(p) for p in input_paths}
assert before == after
sys.path.insert(0, str(ROOT / 'scripts'))
from validate_schemas import curriculum_symlink_errors
symlink_errors = curriculum_symlink_errors(ROOT)
assert not symlink_errors, symlink_errors
candidate_paths = [str(p.relative_to(ROOT)) for p in [*input_paths, Path(__file__), observations]]
ignored = subprocess.run(['git', 'check-ignore', '--no-index', '--stdin'], cwd=ROOT, input='\n'.join(candidate_paths) + '\n', text=True, capture_output=True)
assert ignored.returncode == 1 and not ignored.stdout.strip(), ignored.stdout + ignored.stderr
guards = write('actual-independent-whole-input-guards-and-review-portability.json', {
    'schemaVersion': 1,
    'wholeExternalInputCount': len(input_paths),
    'wholeExternalInputsBefore': before,
    'wholeExternalInputsAfter': after,
    'allInputsByteExactBeforeAfter': True,
    'wholeNativePixelDerivativesActuallyCompared': 2,
    'regularPortableFilesOnly': all(p.is_file() and not p.is_symlink() for p in input_paths),
    'normalCurriculumSymlinkCheckErrors': symlink_errors,
    'normalCurriculumSymlinkCheckPassed': True,
    'ownAndRequiredInputGitIgnoreCheck': {'exitCode': ignored.returncode, 'ignoredPaths': [], 'passed': True},
    'fullOfficialPdfOrFullExtractNewlyCommitted': False,
    'liveGoalOrAssetImportsPerformed': False,
    'historicArtifactChanges': 0,
    'guardChecksAreNotSubstituteForActualVisualOrScientificReview': True
})

receipt = write('actual-one-new-director-independent-native-360-680-scientific-visual-KEEP.receipt.json', {
    'schemaVersion': 1,
    'reviewId': 'wirtschaft-one-Montan-executive-director-independent-native-phone-desktop-V-review-20261009-v1',
    'reviewedAt': datetime.now(timezone.utc).isoformat(),
    'reviewer': {'provider': 'OpenAI', 'model': 'Codex session; exact model identifier not exposed', 'agentIdentity': '/root/economics_source3_independent_final_performance_need', 'independentOfImageAuthor': True, 'imageAuthor': '/root', 'authority': 'ai_candidate'},
    'goalId': GOAL_ID,
    'wholeGoalContract': goal,
    'sourceGoalSnapshot': ref(goal_path),
    'candidatePath': str(native_path.relative_to(ROOT)),
    'assetSha256': digest(native_path),
    'actualGenerator': 'OpenAI Codex image_gen',
    'generationTool': 'image_gen.imagegen',
    'generatorModelVersion': 'not exposed; not inferred',
    'generationAuthorHandoff': ref(handoff),
    'actualFinalPrompt': ref(prompt),
    'imageGenerationWasNotApproval': True,
    'inspections': inspections,
    'formatDecision': {'format': 'PNG', 'nativeDimensions': [1672, 941], 'ratio': 1672 / 941, 'defaultNear16By9': True, 'ratioExceptionNeeded': False, 'actualDidacticDecision': 'KEEP native landscape; actual 360/680 views retain the equal management, separate subgroup majority and both stopped directions. Optional small name badge does not carry mandatory legal detail.'},
    'wholeActualObservationsAndBoundaries': ref(observations),
    'independentWholeNeedAtomicityMemoryPerformanceReceipt': ref(performance_receipt),
    'wholeInputAndPortabilityGuards': ref(guards),
    'altTextCandidateFromActualMotif': 'Drei gleichrangige Leitungskollegen, darunter der hervorgehobene Arbeitsdirektor, sitzen am Tisch. Eine getrennte Gruppe aus fünf §6-Vertretern zeigt drei Ablehnungshände; Stoppsymbole unterbrechen sowohl den Pfeil Bestellung zum Leitungsbereich als auch den Pfeil Widerruf davon weg.',
    'scientificReview': 'KEEP: equal executive role and special majority opposition barrier for appointment and revocation, without an automatic approval or sole group appointment claim. See whole actual observations and the previously completed full relevant primary-law review.',
    'perspectiveReview': 'KEEP: empty table, viewer-facing diagram labels and outward name badge; no incorrectly oriented actor-readable documents or instruments.',
    'mobileDesktopReview': 'KEEP after actual complete original, 360 and 680 image views. Phone badge is optional; essential subgroup and blocked directions do not depend on small print.',
    'decision': 'KEEP',
    'machineQaStatus': 'accepted_pilot',
    'aiApproved': 'yes',
    'aiApprovedAssetSha256': digest(native_path),
    'openFindings': [],
    'authorizationBoundary': 'This is independent machine visualization acceptance of this exact candidate asset with this exact whole 912 contract. Future integration must bind the real current asset/resource and inspect changed whole-goal page/context/source/native positive-profile dependencies; this receipt does not perform or approve that integration.',
    'humanApprovalClaimed': False,
    'humanReleaseGatesPreserved': True,
    'realLearnerOrClassTrialClaimed': False,
    'wholeSource125CoverageApproved': False,
    'wholeCourseApproved': False,
    'descriptionDualReviewApprovalClaimed': False,
    'nativePositiveProfileRebindingPerformed': False,
    'liveWrites': 0,
    'historicArtifactChanges': 0,
    'goodExistingImagesReplaced': 0,
    'strictBaseline': {'complete': 300, 'curricularAtomic': 311, 'maturity': 'M2', 'measuredByThisReview': False, 'source': 'Parent task baseline; no new central report produced by this isolated review.'},
    'newStrictGoalClosures': 0,
    'restoredStrictBindings': 0,
    'strictNetGain': 0,
    'wholeVisualContentDecisionsAdded': 1
})
final_own_paths = [str(p.relative_to(ROOT)) for p in OUT.iterdir() if p.is_file()]
final_ignore = subprocess.run(['git', 'check-ignore', '--no-index', '--stdin'], cwd=ROOT, input='\n'.join(final_own_paths) + '\n', text=True, capture_output=True)
assert final_ignore.returncode == 1 and not final_ignore.stdout.strip()
assert all(json.loads(p.read_text(encoding='utf-8')) for p in OUT.glob('*.json'))
assert before == {str(p.relative_to(ROOT)): ref(p) for p in input_paths}
print(json.dumps({'receipt': ref(receipt), 'decision': 'KEEP', 'actualCompleteViews': 3, 'wholeInputGuards': len(input_paths), 'symlinkErrors': 0, 'ignoredPaths': 0, 'strictNetGain': 0}, ensure_ascii=False))
