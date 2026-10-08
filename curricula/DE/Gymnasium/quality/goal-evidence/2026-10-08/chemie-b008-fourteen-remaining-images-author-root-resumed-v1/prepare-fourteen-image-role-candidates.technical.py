# SPDX-License-Identifier: Apache-2.0
"""Inactive image-role candidates; no independent review or active adoption."""
import copy
import hashlib
import json
import shutil
from pathlib import Path
from PIL import Image

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
OLD = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/chemie-b008-twenty-six-images-author-20261008-v1'
SCIENCE = OLD / 'all26-whole-goals-and-unchanged26P52cases.readonly-inputs.snapshot.json'
DATA = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/chemie-b008-data-documentation-responsive-targeted-correction-author-root-v3'


def bind(p):
    p = Path(p)
    return dict(path=str(p.relative_to(ROOT)), sha256=hashlib.sha256(p.read_bytes()).hexdigest(), bytes=p.stat().st_size)


def put(p, v):
    p.parent.mkdir(parents=True, exist_ok=True)
    assert not p.exists(), p
    p.write_text(json.dumps(v, ensure_ascii=False, indent=2) + '\n')


source_paths = {
    'investigation': ROOT / 'curricula/DE/Gymnasium/visualizations/chemie/91238ba1-5c63-50c7-a4fd-9bbe492c6b61/91238ba1-5c63-50c7-a4fd-9bbe492c6b61.jpg',
    'data': DATA / 'images/9fc800d1-92d1-5ef6-81c1-33960ae034dd/9fc800d1-92d1-5ef6-81c1-33960ae034dd.png',
    'validity': OLD / 'images/a0080b5f-13ff-56bc-b8ff-2ff6273e2ec1/a0080b5f-13ff-56bc-b8ff-2ff6273e2ec1.png',
    'criteria': OLD / 'images/1df17884-96ae-57d7-9da9-dbebd082596f/1df17884-96ae-57d7-9da9-dbebd082596f.jpg',
    'sources': OWN / 'generated/sources-v2.actual.png',
    'knowledge': OWN / 'generated/knowledge-influences.actual.png',
    'effects': OWN / 'generated/sustainability-effects.actual.png',
}
role_groups = {
    'investigation': ['lower-chemical-question-hypothesis', 'lower-guided-hypothesis-investigation', 'lower-independently-planned-hypothesis-investigation', 'lower-chemical-data-interpretation', 'foreign-inquiry-process-and-reach'],
    'data': ['upper-quantitative-hypothesis-data-evaluation', 'data-validity'],
    'validity': ['own-inquiry-process-reflection'],
    'criteria': ['criteria-arguments'],
    'sources': ['sek1-source-information', 'upper-source-information', 'upper-source-criticism'],
    'knowledge': ['upper-knowledge-influences'],
    'effects': ['upper-chemical-effects-sustainability'],
}
role_by_key = {key: role for role, keys in role_groups.items() for key in keys}
assert len(role_by_key) == 14
descriptions = {
    'investigation': 'Beispiel einer chemischen Untersuchung: Eine Frage zum Einfluss der Wassertemperatur auf eine Brausetablette führt zur Hypothese, einem Vergleichsversuch und dessen Auswertung. Die beiden gezeichneten Zeiten sind illustrative Einzelbefunde; sie sind keine allgemeingültige Reaktionszeit oder vollständige Untersuchungsvorschrift.',
    'data': 'Illustrative Temperatur-Zeit-Daten werden in einer Tabelle und einem dazu passenden Diagramm dargestellt. Die kürzere Zeit bei höherer Temperatur beschreibt dieses Beispiel; weitergehende Erklärungen, Hypothesenurteile und Reichweitenaussagen benötigen passende Untersuchungsbedingungen und Belege.',
    'validity': 'Ein dargestellter chemischer Befund wird auf Wiederholbarkeit, nachvollziehbare Methode, Prüfbarkeit und widerspruchsfreie Einordnung betrachtet. Neue Daten können eine weitere Untersuchung und eine begründete Verbesserung des Vorgehens anregen.',
    'criteria': 'Materialoptionen für Getränkeflaschen werden über Datenfragen, unterschiedlich gewichtete Kriterien und das Abwägen von Chancen und Risiken betrachtet. Das Bild legt keine allgemein beste Materialwahl fest.',
    'sources': 'Messbericht, Fachtext und Werbung werden als verschiedene Quellenangebote zu einer chemischen Wasserfilterfrage betrachtet. Urheberschaft, Daten und Absicht bleiben offene Prüffragen; die Quellengattung allein entscheidet nicht über Gültigkeit oder Eignung.',
    'knowledge': 'Technik, Gesellschaft, Umwelt und Wirtschaft können chemische Forschungsfragen, verfügbare Mittel und Forschungswege beeinflussen. Die fachliche Gültigkeit der dabei gewonnenen Aussagen muss weiterhin an Befunden geprüft werden.',
    'effects': 'Materialherstellung, Nutzung und erneute Verwendung werden mit Folgen für Umwelt, Wirtschaft und Menschen verbunden. Glas- und Kunststoffgefäße sind Beispiele ohne vorgegebene Rangfolge; ihre Folgen hängen vom konkreten historischen und heutigen Nutzungskontext ab.',
}
alts = {
    'investigation': 'Vier Comicfelder zeigen Frage, Hypothese, Vergleichsversuch mit Schutzbrille und eine Tabelle mit Temperatur und Zeit.',
    'data': 'Große Tabelle mit drei Temperaturen und je zwei Messzeiten sowie ein passendes Temperatur-Zeit-Diagramm.',
    'validity': 'Ein offener Befund wird von Comicfiguren auf Wiederholbarkeit, Methode, Prüfbarkeit, Widerspruchsfreiheit und neue Daten betrachtet.',
    'criteria': 'Drei Flaschenoptionen, offene Datenfragen, Kriterienregler und eine Abwägungswaage ohne vorgegebene Entscheidung.',
    'sources': 'Drei gleichberechtigte Quellkarten Messbericht, Fachtext und Werbung, eine Lupe und die Fragen Wer, welche Daten und welche Absicht.',
    'knowledge': 'Vier Bereiche Technik, Gesellschaft, Umwelt und Wirtschaft führen mit Pfeilen zu einer Forscherin; darunter steht Befunde prüfen.',
    'effects': 'Glas- und Kunststoffgefäße, Herstellung und Nutzung, erneute Verwendung sowie Umwelt, Wirtschaft und Menschen neben einer leeren Waage.',
}
source_records = []
for role, src in source_paths.items():
    with Image.open(src) as im:
        size, fmt = im.size, im.format
        for width in [360, 680]:
            out = OWN / 'qa' / f'{role}.{width}px.png'
            out.parent.mkdir(exist_ok=True)
            assert not out.exists()
            im.resize((width, round(im.height * width / im.width)), Image.Resampling.LANCZOS).save(out)
    source_records.append(dict(role=role, actualAsset=bind(src), actualDimensions=size, actualFormat=fmt))

scientific_inputs = json.loads(SCIENCE.read_text())
all_first_entries = [json.loads((OLD / name).read_text()) for name in ['neutral-first-nine.actual-images.author.entry.json', 'neutral-three-corrected.actual-images.author.entry.json']]
previous_ids = {r['goalId'] for entry in all_first_entries for r in entry['images']}
selected = [r for r in scientific_inputs['routineBodies'] if r['candidateKey'] in role_by_key]
assert len(selected) == 14 and not previous_ids.intersection(r['wholeGoal']['id'] for r in selected)
records = []
goals = []
for routine in selected:
    goal = copy.deepcopy(routine['wholeGoal'])
    gid = goal['id']
    role = role_by_key[routine['candidateKey']]
    src = source_paths[role]
    directory = OWN / 'images' / gid
    directory.mkdir(parents=True)
    dst = directory / (gid + src.suffix)
    shutil.copyfile(src, dst)
    assert src.read_bytes() == dst.read_bytes()
    original_prompts = []
    for prompt in src.parent.glob('*prompt*.md'):
        dest = directory / ('retained-source-' + prompt.name)
        shutil.copyfile(prompt, dest)
        original_prompts.append(bind(dest))
    if role in ['sources', 'knowledge', 'effects']:
        actual_prompt = OWN / {'sources': 'sources-perspective-correction-v2.prompt.de.md', 'knowledge': 'knowledge-influences.prompt.de.md', 'effects': 'sustainability-effects.prompt.de.md'}[role]
        shutil.copyfile(actual_prompt, directory / 'prompt.de.md')
        reconstruction = directory / 'image-reconstruction-prompt.de.md'
        reconstruction.write_text('Aktueller Rekonstruktionsprompt, aus dem tatsächlich gesichteten PNG abgeleitet; keine Behauptung historischer Generatorparameter.\n\n' + descriptions[role] + '\n\n' + alts[role] + '\n\nFreundliche klare Comicillustration mit kräftigen dunkelblauen Konturen, hellem Creme/Blau-Grund und Grün/Orange-Akzenten. PNG quer etwa1672×941; große wenige deutsche Labels, keine zusätzliche Kleinschrift und keine vorgegebene Wahrheitsfreigabe. Hauptmotiv und Labels bei360px erhalten.\n')
        original_prompts.extend([bind(directory / 'prompt.de.md'), bind(reconstruction)])
    provider = 'Google Gemini / Nano Banana Pro' if role in ['investigation', 'criteria'] else 'OpenAI / ChatGPT-Codex integrated image_gen tool'
    resource = dict(type='goal-visualization', resourceType='image', role='primary', skillpilotId=gid,
        title='Visualisierung: ' + goal['title'], url=f'/assets/goal-visualizations/chemie/{gid}/{gid}{src.suffix}',
        provider=provider, description=descriptions[role], altText=alts[role], lang='de', license='CC-BY-4.0', reviewStatus='pilot')
    goal['resourceLinks'] = [link for link in goal.get('resourceLinks', []) if link.get('type') != 'goal-visualization'] + [resource]
    assert {k: v for k, v in goal.items() if k != 'resourceLinks'} == {k: v for k, v in routine['wholeGoal'].items() if k != 'resourceLinks'}
    with Image.open(dst) as im:
        dims, fmt = im.size, im.format
    records.append(dict(goalId=gid, candidateKey=routine['candidateKey'], imageRole=role,
        originalAsset=bind(src), candidateAsset=bind(dst), actualDimensions=dims, actualFormat=fmt,
        provider=provider, resourceLink=resource, availableActualPrompts=original_prompts,
        actual360=bind(OWN / 'qa' / f'{role}.360px.png'), actual680=bind(OWN / 'qa' / f'{role}.680px.png'),
        roleSpecificIndependentApprovalPending=True, historicalMachineOrHumanApprovalInherited=False))
    goals.append(goal)

put(OWN / 'fourteen-whole-goals-and-image-links.author.candidate.json', dict(schemaVersion=1, goals=goals, activeWrites=0))
put(OWN / 'neutral-fourteen-remaining-image-role-candidates.author.entry.json', dict(
    schemaVersion=1, role='Neutral inactive actual fourteen image-role candidates; inputs only, no verdict',
    all26WholeGoalsProfiles52Cases=bind(SCIENCE), sourceImages=source_records, candidates=records,
    selectedGoalIds=[g['id'] for g in goals],
    exactWholeFourteenGoalsWithCandidateResourceLinks=bind(OWN / 'fourteen-whole-goals-and-image-links.author.candidate.json'),
    actualGenerationProvenance=bind(OWN / 'actual-four-generation-attempts.provenance.json'),
    otherTwelveImagesNotChanged=True, all26WholeGoalScienceAndProfiles52CasesUnchanged=True,
    newStandaloneMotifs=3, targetRolesUsingNewPngMotifs=5, unchangedExistingGoodImageRoleCandidates=9,
    authorResponsiveInspectionStillToFreeze=True, roleSpecificIndependentReviewPending=True,
    actualCurrentActiveChemistryStrictComplete=177, actualCurrentActiveChemistryDenominator=378,
    activeWrites=0, strictGainClaimed=0, humanApproval=False, humanTrial=False,
))
print('Prepared14 inactive actual image-role candidates:9 unchanged image roles,5 roles from3 new PNG motifs; no approvals.')
