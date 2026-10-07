#!/usr/bin/env python3
"""Bind author-selected originals and execute native import dry-runs, never install."""
from pathlib import Path
from PIL import Image
import datetime, hashlib, json, subprocess
OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[5]
plan_path = OUT / 'current21-whole-goals-materials-source-bound-image-plans.author.raw.json'
plan = json.loads(plan_path.read_text())
raw = json.loads((ROOT / plan['inputs'][0]['path']).read_text())
canonical = raw['candidateCanonical']['path']
def bind(path):
    data = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}
def write(name, obj):
    path = OUT / name
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')

NOTES = {
    'ce19': ('Modell einer Nervenzelle: Dendriten führen zum Zellkörper, ein Axon verbindet ihn mit Endknöpfchen. Orange Pfeile zeigen eine mögliche Signalroute; die nächste Zelle liegt getrennt hinter dem synaptischen Spalt.', 'Vier große Bezeichnungen und durchgehende Zellfortsätze; myelinisierter Modellaxon als Beispiel, kein Universalbauplan aller Neurone. Zellkern ist sichtbar; Bild erklärt nicht die Entstehung des Aktionspotenzials.'),
    '1b38': ('Modell einer Lipiddoppelschicht mit Kanal und ATP-abhängiger Pumpe. Blaue Teilchen passieren den Kanal von hoher zu niedriger Konzentration; orange Teilchen werden von niedriger zu hoher Konzentration gepumpt.', 'Hydrophile Köpfe zu den wässrigen Räumen, Schwänze nach innen, getrennte richtungsrichtige Kanal-/Pumpenwege. Zwei Transportmodelle ersetzen keine vollständige Kompartimentanalyse.'),
    'e3fb': ('Ruhepotenzial-Modell: Blau kennzeichnet Na⁺, Violett K⁺. Ein K⁺-Leckkanal führt nach außen. Die ATP-abhängige Pumpe transportiert drei Na⁺ nach außen und zwei K⁺ nach innen. Ladungszeichen liegen unmittelbar an den Membranflächen.', 'Große Farblegende mit beiden lesbaren Plusladungen; relative Ionenverteilungen und 3:2-Pfeile sichtbar. Membrannahe Ladungstrennung, keine ganze negativ geladene Zellfüllung; keine Messwerte oder vollständige Ruhemessdatenableitung.'),
    '04d7': ('Qualitatives Axonmodell: Na⁺ strömt zuerst hinein, K⁺ später hinaus. Gleich skalierte Modellkurven zeigen bei stärkerem Reiz mehr gleich hohe Aktionspotenziale in derselben Zeitspanne.', 'Na-in/K-out korrekt und keine Pumpe als schneller Reset. Drei gegenüber sechs Pulse bei gleicher Höhe und dargestellter Zeitspanne; qualitative Achsen ohne erfundene Messwerte. Schwelle/Refraktärzeit bleiben Teil des ganzen Ziels und der Materialien.'),
    'ff1': ('Modell einer erregenden ACh-Synapse: Spannung öffnet einen Ca²⁺-Kanal im Endknöpfchen. Ein Vesikel setzt ACh frei. ACh bindet außen am postsynaptischen Kanal; der gezeichnete Na⁺-Einstrom depolarisiert die Folgezelle.', 'Ca außen→präsynaptisch, Vesikelfusion/Spalt/ACh-Bindung außerhalb des Porenraums; grüne Na-Ionen auch außerhalb vor dem geöffneten Kanal. Spannung und ACh bindet sind große Mechanismushinweise; keine automatische Aktionspotenzialgarantie oder intakte ACh-Wiederaufnahme.'),
    'e111': ('Modell räumlicher und zeitlicher Summation: Zwei erregende und eine hemmende Synapse wirken auf dieselbe Nervenzelle. Nahe aufeinanderfolgende Potenzialantworten überlappen und überschreiten im gegebenen Modell die Schwelle; getrennte Antworten bleiben darunter.', 'Erregend/hemmend und Plus/Minus unterscheiden Wirkungen auf das Potenzial. Zwei schematische zeitliche Verläufe mit gleicher Modellskala und Schwelle; roter Punkt markiert das Überschreiten, keinen Messwert oder vollständigen Aktionspotenzialverlauf.'),
    'f628': ('Gegebenes Muskelendplattenmodell ohne und mit Blocker X: ACh wird in beiden Fällen freigesetzt. Ohne X öffnet der Kanal und Na⁺ strömt in die Muskelzelle; mit X bleibt der Kanal geschlossen.', 'Intakte Freisetzung auf beiden Seiten, blockierter postsynaptischer Schritt ohne Ionenstrom rechts. Fiktiver gegebener Blocker X; keine Stoffmarke/Dosierung oder pauschale Muskelkraft-/Therapieaussage. Andere Stoffmechanismen im ganzen Ziel bleiben erforderlich.'),
}
before = hashlib.sha256((ROOT / canonical).read_bytes()).hexdigest()
records = []
for gid in plan['firstSevenOrder']:
    item = next(p for p in plan['plans'] if p['goalId'] == gid)
    prefix = next(k for k in NOTES if gid.startswith(k))
    rev = 'revision-03' if prefix == 'e3fb' else 'revision-02' if prefix in ['04d7', 'ff1', 'e111'] else None
    suffix = '-' + rev + '.actual' if rev else '.actual'
    asset = OUT / 'first-seven/generated-originals' / gid / ('original-generated' + suffix + '.png')
    metadata = asset.parent / ('builtin-generator-' + rev + '.actual.metadata.json' if rev else 'builtin-generator.actual.metadata.json')
    prompt = OUT / 'prompts' / (gid + '.' + rev + '.prompt.txt' if rev else gid + '.prompt.txt')
    assert asset.exists() and metadata.exists() and prompt.exists()
    alt, note = NOTES[prefix]
    folder = OUT / 'first-seven/native-import-dry-run' / gid
    folder.mkdir(parents=True, exist_ok=True)
    args = ['npm', '--prefix', 'app', 'run', 'visualization:import', '--', gid, str(asset),
        '--landscape=' + canonical, '--subject=biologie', '--lang=de',
        '--provider=OpenAI / ChatGPT-Codex image generation', '--review-status=pilot',
        '--license=CC-BY-4.0', '--prompt=' + str(prompt), '--alt-text=' + alt,
        '--description=Modellhafte Illustration: ' + item['wholeStage02CandidateGoal']['title'] + '.', '--dry-run']
    start = datetime.datetime.now(datetime.timezone.utc).isoformat()
    result = subprocess.run(args, cwd=ROOT, capture_output=True, text=True)
    finish = datetime.datetime.now(datetime.timezone.utc).isoformat()
    (folder / 'native-import-dry-run.actual.stdout.txt').write_text(result.stdout)
    (folder / 'native-import-dry-run.actual.stderr.txt').write_text(result.stderr)
    assert result.returncode == 0 and 'No files were written.' in result.stdout
    routing = {}
    for line in result.stdout.splitlines():
        if ': ' in line and line.split(': ', 1)[0] in ['Canonical image', 'Public image', 'Backend image', 'Canonical prompt', 'Canonical reconstruction prompt', 'JSON link URL']:
            key, value = line.split(': ', 1)
            routing[key] = value
    assert len(routing) == 6
    width, height = Image.open(asset).size
    displays = []
    for display_width in [360, 680]:
        displays.append(bind(OUT / 'first-seven/author-displays/final-current-seven' / (gid + '.' + str(display_width) + '.png')))
    records.append({'goalId': gid, 'role': 'image author candidate, not independent V',
        'wholeStage02CandidateGoal': item['wholeStage02CandidateGoal'],
        'completeDEENReferenceCases': item['completeReferenceCases'],
        'actualFrozenSourceWitnessEffectiveBindings': item['actualFrozenSourceWitnessEffectiveBindings'],
        'selectedUnchangedOriginalAsset': bind(asset), 'actualPixelDimensions': [width, height],
        'actualFinalGeneratorMetadata': bind(metadata), 'actualFinalGenerationPrompt': bind(prompt),
        'actualAllPriorGenerationHistory': [bind(p) for p in sorted(asset.parent.glob('builtin-generator*.metadata.json'))],
        'actualProvider': 'OpenAI / ChatGPT-Codex image generation', 'actualTool': 'ChatGPT/Codex builtin image generation',
        'actualModelVersion': None, 'modelVersionDisclosure': 'not exposed; unknown', 'license': 'CC-BY-4.0',
        'boundedImageAltTextDe': alt, 'ownAuthorSightNoteDe': note,
        'ownAuthorSightFullSizeAndBothActualWidths': True, 'actualDisplayWidths': [360, 680],
        'actualDisplays': displays, 'boundedModelNotWholeGoalPerformance': True,
        'nativePrepareMetadata': bind(OUT / 'first-seven/native-prepare-after-actual-initial-generation' / gid / 'metadata.json'),
        'nativeImportDryRun': {'argv': args, 'cwd': str(ROOT), 'startedAt': start, 'finishedAt': finish,
            'exitCode': result.returncode, 'stdout': bind(folder / 'native-import-dry-run.actual.stdout.txt'),
            'stderr': bind(folder / 'native-import-dry-run.actual.stderr.txt'), 'routingProducedByUnmodifiedNativeImport': routing},
        'authorDisposition': 'candidate_ready_for_two_independent_visual_reviews',
        'independentVisualApproval': False, 'humanApproval': False, 'newStrictCompletion': 0})
after = hashlib.sha256((ROOT / canonical).read_bytes()).hexdigest()
assert before == after
put = {'role': 'seven image author candidates with native preparation and native dry-run routing; not a new science review or operative installation',
    'whole21ImagePlanInput': bind(plan_path), 'whole21Stage02Raw': bind(ROOT / plan['inputs'][0]['path']),
    'frozenStage02Canonical': bind(ROOT / canonical), 'nativePrepareReceipt': bind(OUT / 'first-seven/native-prepare-after-actual-initial-generation/seven-native-preparations.actual.receipt.json'),
    'nativeDisplayReceipt': bind(OUT / 'first-seven/author-displays/final-current-seven/actual-360-680-display.receipt.json'),
    'productionImportHelper': bind(ROOT / 'scripts/import_goal_visualization.mjs'),
    'productionCommonHelper': bind(ROOT / 'scripts/goal_visualization_common.mjs'),
    'allFirstAttemptsPreserved': True, 'actualBuiltinCallsForSeven': 12,
    'workflowDeviationExplicitNotBackdated': True,
    'nativeImportDryRunCount': 7, 'candidateCanonicalBeforeSha256': before, 'candidateCanonicalAfterSha256': after,
    'wholeGoalTextAndMaterialsUnmodified': True, 'threeModelImagesDelegatedToRoot': ['4f631f78-e13a-58e5-9092-f4db0b8d377a', 'a46cafde-7359-5249-8754-19aaa3174ba4', 'c9a06264-cce2-54dd-9604-46dd5949f02e'],
    'no080bGenerated': True, 'records': records, 'activeWrites': False, 'runtimeWrites': False,
    'operativeInstallCopiesWritten': 0, 'nativeResourceLinksWereNotHandBuilt': True,
    'independentVisualApproval': False, 'humanApproval': False, 'newStrictCompletion': 0,
    'allOriginalSourceAndNationalScopeHoldsPreserved': True}
write('first-seven/first-seven-whole-goal-material-source-original-raster-native-routing.author.raw.json', put)
print(json.dumps({'selectedAuthorCandidates': len(records), 'nativeImportDryRunExit0': 7, 'canonicalUnchanged': before == after, 'independentVisualApproval': False, 'strictCompletion': 0}))
