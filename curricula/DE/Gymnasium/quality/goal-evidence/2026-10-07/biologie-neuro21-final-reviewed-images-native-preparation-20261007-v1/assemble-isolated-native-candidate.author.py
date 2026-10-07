# SPDX-License-Identifier: Apache-2.0
import hashlib
import json
import shutil
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
OUT = Path(__file__).resolve().parent
NATIVE = OUT / 'isolated-repository'
STAGE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-neuro-twenty-one-current-continuation-author-v3/stage-02-current-twenty-one-native'
VROOT = ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-review'
LANDSCAPE = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
tracked = {}

def bind(p):
    p = p.resolve()
    data = p.read_bytes()
    return {'path': p.relative_to(ROOT).as_posix(), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

def read(p):
    tracked[str(p)] = bind(p)
    return json.loads(p.read_text())

def copy(p, q):
    tracked[str(p)] = bind(p)
    q.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(p, q)
    assert hashlib.sha256(q.read_bytes()).hexdigest() == tracked[str(p)]['sha256']

def write(p, obj):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')

def verify_binding(b):
    actual = bind(ROOT / b['path'])
    assert actual['sha256'] == b['sha256'].removeprefix('sha256:'), b['path']
    assert actual['bytes'] == b['bytes'], b['path']

neutral = read(STAGE / 'final-current21-whole-native-source-context-material-review-inputs.author.raw.json')
ids = neutral['exactSelected21GoalIds']
assert len(ids) == len(set(ids)) == 21
baseline = read(STAGE / 'current472.actual-baseline.snapshot.json')
assert baseline == read(ROOT / LANDSCAPE)
prior = read(STAGE / 'current472-neuro21.complete-author-candidate.json')
assert len(prior['goals']) == len(baseline['goals']) == 472
copy(STAGE / 'current472.actual-baseline.snapshot.json', OUT / 'inputs/current472.active-baseline.exact.json')
copy(STAGE / 'current472-neuro21.complete-author-candidate.json', OUT / 'inputs/prior-stage02.current472.imageless-candidate.exact.json')
copy(STAGE / 'qa-artifacts/full-current390.book-model.json', OUT / 'inputs/current390.book-model.exact.json')
copy(STAGE / 'qa-artifacts/full-candidate390.book-model.json', OUT / 'inputs/prior-stage02.candidate390.book-model.exact.json')
copy(STAGE / 'final-current21-whole-native-source-context-material-review-inputs.author.raw.json', OUT / 'inputs/prior-stage02.whole-neutral-input.exact.json')
copy(STAGE / 'all390-current-candidate-pages-contexts-source-visual-deltas.author.json', OUT / 'inputs/prior-stage02.all390-deltas.exact.json')
protected = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-neuro-eight-missing-primary-scope-remediation-author-v2/protected-current74.actual-full-page-and-source-context-checks.json'
copy(protected, OUT / 'inputs/protected74.exact.json')
for key, name in [('allRetainedWholeHOLDs', 'source-HOLDs.exact.json'), ('exactActualSourceWitnessEffectiveFileBindings', 'selected21-source-witness-effective-bindings.exact.json')]:
    verify_binding(neutral[key])
    copy(ROOT / neutral[key]['path'], OUT / 'inputs' / name)

seven_path = VROOT / 'biologie-neuro21-friendly-comic-primary-raster-author-20261007-v1/first-seven/first-seven-whole-goal-material-source-original-raster-native-routing.author.raw.json'
ce_path = VROOT / 'biologie-neuro-ce19-axon-leader-targeted-correction-author-20261007-v2/one-whole-goal-source-material-current-raster-native-routing.author.raw.json'
eleven_path = VROOT / 'biologie-neuro21-next-eleven-friendly-comic-primary-raster-author-20261007-v1/eleven-whole-goal-current-material-source-original-raster-native-routing.author.raw.json'
three_path = VROOT / 'biologie-neuro-three-supplied-models-author-root-20261007-v1/three-final-originals-and-native-import-plan.author.raw.json'
three_full_path = VROOT / 'biologie-neuro-three-supplied-models-author-root-20261007-v1/three-final-whole-goal-case-source-raster-independent-review-input.author.raw.json'
seven, ce, eleven, three, three_full = [read(p) for p in [seven_path, ce_path, eleven_path, three_path, three_full_path]]
for p in [seven_path, ce_path, eleven_path, three_path, three_full_path]:
    copy(p, OUT / 'inputs' / p.name)
records = {r['goalId']: r for r in seven['records']}
records.update({r['goalId']: r for r in ce['records']})
records.update({r['goalId']: r for r in eleven['records']})
for row in three['rows']:
    records[row['goalId']] = {
        'goalId': row['goalId'],
        'selectedUnchangedOriginalAsset': bind(ROOT / row['actualFinalOriginal']),
        'actualFinalGenerationPrompt': bind(ROOT / row['actualLastGenerationPrompt']),
        'actualProvider': 'OpenAI / ChatGPT-Codex image generation',
        'actualTool': 'ChatGPT/Codex builtin image generation',
        'actualModelVersion': None,
        'license': 'CC-BY-4.0',
        'boundedImageAltTextDe': row['boundedAltTextDe'],
    }
assert set(records) == set(ids)
stage_goal = {g['id']:g for g in prior['goals']}
for r in records.values():
    verify_binding(r['selectedUnchangedOriginalAsset'])
    verify_binding(r['actualFinalGenerationPrompt'])
    whole = r.get('wholeStage02CandidateGoal', r.get('wholeUnchangedStage02Goal'))
    if whole:
        assert whole == stage_goal[r['goalId']]
assert records['ce19b80f-d392-5851-ac92-750c85adfb3e']['selectedUnchangedOriginalAsset']['sha256'] == '38b16a4f07ab5490e42700fe31ee33f67a8d63aae09187965e27617c3f15c89c'

copy(STAGE / 'current472-neuro21.complete-author-candidate.json', NATIVE / LANDSCAPE)
for helper in ['prepare_goal_visualization.mjs', 'import_goal_visualization.mjs', 'goal_visualization_common.mjs']:
    copy(ROOT / 'scripts' / helper, NATIVE / 'scripts' / helper)
copy(STAGE / 'current390-canonical-technical-review.view.json', NATIVE / 'inputs/current390.composition-view.exact.json')
copy(STAGE / 'semantic-kinds.current472.neuro21.source-binding.author-candidate.json', OUT / 'inputs/prior-stage02.semantic-kinds.exact.json')
kinds = read(STAGE / 'semantic-kinds.current472.neuro21.source-binding.author-candidate.json')
kinds['sourceLandscapePath'] = LANDSCAPE
write(NATIVE / 'inputs/semantic-kinds.final-image-candidate.json', kinds)
copy(STAGE / 'current-biology-visualization-qa.exact-snapshot.json', OUT / 'inputs/prior-stage02.visualization-qa.exact.json')
qa = read(STAGE / 'current-biology-visualization-qa.exact-snapshot.json')
old_qa = json.loads(json.dumps(qa))
available = [r for r in qa['records'] if r['visualizationState'] == 'available']
assert len(available) == 74
for r in available:
    p = ROOT / r['publicAssetPath']
    assert bind(p)['sha256'] == r['assetSha256'].removeprefix('sha256:')
    copy(p, NATIVE / r['publicAssetPath'])

operations = []
for goal_id in ids:
    r = records[goal_id]
    prepare = ['node', str(NATIVE / 'scripts/prepare_goal_visualization.mjs'), goal_id,
               '--landscape=' + str(NATIVE / LANDSCAPE), '--subject=biologie', '--lang=de',
               '--provider=' + r['actualProvider'], '--review-status=pilot']
    importer = ['node', str(NATIVE / 'scripts/import_goal_visualization.mjs'), goal_id,
                str(ROOT / r['selectedUnchangedOriginalAsset']['path']),
                '--landscape=' + str(NATIVE / LANDSCAPE), '--subject=biologie', '--lang=de',
                '--provider=' + r['actualProvider'], '--review-status=pilot', '--license=' + r['license'],
                '--prompt=' + str(ROOT / r['actualFinalGenerationPrompt']['path']),
                '--alt-text=' + r['boundedImageAltTextDe'],
                '--description=Modellhafte Illustration: ' + stage_goal[goal_id]['title'] + '.']
    for role, argv in [('native-prepare',prepare),('native-isolated-import',importer)]:
        started = datetime.now(timezone.utc).isoformat()
        result = subprocess.run(argv, cwd=NATIVE, capture_output=True, text=True)
        terminal = OUT / 'terminal' / goal_id
        terminal.mkdir(parents=True, exist_ok=True)
        stdout, stderr = terminal / (role + '.stdout.txt'), terminal / (role + '.stderr.txt')
        stdout.write_text(result.stdout); stderr.write_text(result.stderr)
        operations.append({'role':role,'goalId':goal_id,'argv':argv,'cwd':str(NATIVE),'startedAt':started,'finishedAt':datetime.now(timezone.utc).isoformat(),'exitCode':result.returncode,'stdout':bind(stdout),'stderr':bind(stderr)})
        assert result.returncode == 0, (goal_id,role,result.stderr)
    source_rel = 'curricula/DE/Gymnasium/visualizations/biologie/' + goal_id + '/' + goal_id + '.png'
    public_rel = 'app/public/assets/goal-visualizations/biologie/' + goal_id + '/' + goal_id + '.png'
    backend_rel = 'backend/src/main/resources/static/assets/goal-visualizations/biologie/' + goal_id + '/' + goal_id + '.png'
    for rel in [source_rel, public_rel, backend_rel]:
        assert bind(NATIVE / rel)['sha256'] == r['selectedUnchangedOriginalAsset']['sha256']
    q = next(q for q in qa['records'] if q['goalId'] == goal_id)
    assert q['visualizationState'] == 'missing'
    q.update({'title':stage_goal[goal_id]['title'],'description':stage_goal[goal_id]['description'],
              'landscapePath':LANDSCAPE,'visualizationState':'available','missingReason':'',
              'imageUrl':'/assets/goal-visualizations/biologie/' + goal_id + '/' + goal_id + '.png',
              'publicAssetPath':public_rel,'canonicalAssetPath':source_rel,
              'assetSha256':'sha256:' + r['selectedUnchangedOriginalAsset']['sha256'],
              'umlautsCorrectChatGpt':'no','contentApprovedChatGpt':'no',
              'humanApproved':'no','humanIssueIdentified':'no',
              'chatGptReviewedAt':None,'chatGptReviewer':'',
              'chatGptNotes':'Technical isolated image-binding scaffold only. Paired independent raster KEEP evidence exists separately; this row does not create approval or strict completion.'})
for old,new in zip(old_qa['records'],qa['records']):
    if old['goalId'] not in ids:
        assert old == new
write(NATIVE / 'inputs/visualization-qa.final-image-candidate.json', qa)
config = read(STAGE / 'full-candidate390.book.config.json')
config.update({'landscapePath':LANDSCAPE,'compositionViewPath':'inputs/current390.composition-view.exact.json',
               'semanticKindLedgerPath':'inputs/semantic-kinds.final-image-candidate.json',
               'goalVisualizationQaPath':'inputs/visualization-qa.final-image-candidate.json',
               'outputPath':'outputs/full-final390.book-model.json'})
write(NATIVE / 'config/full-final390.book.config.json', config)

final = json.loads((NATIVE / LANDSCAPE).read_text())
fg = {g['id']:g for g in final['goals']}
assert len(fg) == 472
for old in prior['goals']:
    new = fg[old['id']]
    if old['id'] in ids:
        assert {k:v for k,v in new.items() if k != 'resourceLinks'} == old
        link = new['resourceLinks'][0]
        assert link['url'] == '/assets/goal-visualizations/biologie/' + old['id'] + '/' + old['id'] + '.png'
        assert link['skillpilotId'] == old['id'] and link['type'] == 'goal-visualization' and link['role'] == 'primary'
    else:
        assert new == old

for n in ['positive-evidence.current21.actual.author-candidate.jsonl','positive-evidence.current21.complete.author-candidates.json',
          'semantic-atomicity.current21.actual.author-candidate.jsonl','memory.current21.actual.author-candidate.jsonl',
          'whole-prior21-A-M-records-history.readonly-copy.json','forty-two-complete-DEEN-reference-materials.current21.author-candidates.json']:
    copy(STAGE / n, OUT / 'inputs' / ('prior-stage02.' + n))
v4 = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-neuro-080b-exact-tiergroup-performance-positive-material-author-root-v4'
copy(v4 / 'targeted-whole-two-cases.raw-author-review-input.json', OUT / 'inputs/current080b.v4-whole-materials.exact.json')
copy(v4 / 'positive1.actual-author-candidate.jsonl', OUT / 'inputs/current080b.v4-positive-record.exact.jsonl')
current080b = read(v4 / 'targeted-whole-two-cases.raw-author-review-input.json')
spec = read(STAGE / 'positive-evidence.current21.complete.author-candidates.json')
for item in spec['goals']:
    if item['goalId'] == current080b['goalId']:
        item['profile'] = current080b['completeProfile']
spec['reviewId'] = 'biologie-neuro21-final-images-technical-author-scaffold-20261007-v1'
spec['reviewedAt'] = datetime.now(timezone.utc).isoformat()
spec['reviewer'] = 'Codex technical preparation author; no independent D/P/A/M approval'
for item in spec['goals']:
    item['reason'] = 'Technical native candidate materialization for image-bound final candidate. Original scientific profile reused exactly; current080b v4 is the only profile-body replacement. No new scientific acceptance. Prior author reason: ' + item['reason']
    item['dissent'] = ['Whole-source and national-scope HOLDs remain unchanged. Final image/page/context binding review pending. No new D/P/A/M judgment, no human approval/trial or strict M7 gain.']
write(OUT / 'candidate-scaffolds/positive21.final-image-candidate.spec.json', spec)
pconfig = read(STAGE / 'positive-evidence.current21.native.config.json')
pconfig.update({'reviewId':spec['reviewId'],'landscapePath':(NATIVE / LANDSCAPE).relative_to(ROOT).as_posix(),
                'semanticKindLedgerPath':(NATIVE / 'inputs/semantic-kinds.final-image-candidate.json').relative_to(ROOT).as_posix(),
                'reviewPath':(OUT / 'candidate-scaffolds/positive21.final-image-candidate.records.jsonl').relative_to(ROOT).as_posix()})
write(OUT / 'candidate-scaffolds/positive21.final-image-candidate.config.json', pconfig)
for kind, cfg_name, rec_name in [
    ('semantic-atomicity','semantic-atomicity.current21.native.config.json','semantic-atomicity.current21.actual.author-candidate.jsonl'),
    ('memory','memory.current21.native.config.json','memory.current21.actual.author-candidate.jsonl')]:
    cfg = read(STAGE / cfg_name)
    cfg.update({'landscapePath':(NATIVE / LANDSCAPE).relative_to(ROOT).as_posix(),
                'reviewPath':(OUT / 'candidate-scaffolds' / (kind + '.final-image-candidate.records.jsonl')).relative_to(ROOT).as_posix()})
    copy(STAGE / rec_name, ROOT / cfg['reviewPath'])
    if kind == 'memory':
        cfg['visibilityScopes'] = [{'label':'Technical canonical final390 review view; no country source-view acceptance',
                                    'viewPath':(NATIVE / 'inputs/current390.composition-view.exact.json').relative_to(ROOT).as_posix()}]
        cfg['cardReviewPath'] = (OUT / 'candidate-scaffolds/memory.cards.final-image-candidate.jsonl').relative_to(ROOT).as_posix()
        copy(STAGE / 'memory.current21.cards.author-candidate.jsonl', ROOT / cfg['cardReviewPath'])
    write(OUT / 'candidate-scaffolds' / (kind + '.final-image-candidate.config.json'), cfg)

write(OUT / 'native-isolation-and-imports.actual.author.receipt.json',{
    'role':'technical author preparation only','nativeRoot':str(NATIVE),
    'byteIdenticalNativeHelpers':[{'original':bind(ROOT/'scripts'/n),'copy':bind(NATIVE/'scripts'/n)} for n in ['prepare_goal_visualization.mjs','import_goal_visualization.mjs','goal_visualization_common.mjs']],
    'noNativeImportAssetRootOption':True,'nativePhysicalRootIsolationSupported':True,
    'nativeRendererPublicRootOption':'--public-root','nativeBuildApiRepositoryRootOverride':True,
    'importsExecuted':21,'preparesExecuted':21,'existing74PublicCopiesByteExact':True,
    'selected21SourceFrontendBackendCopiesByteExact':True,'productionImageUrlsPreserved':True,
    'prior451WholeGoalsExact':True,'all472EdgesAndIdsExact':True,
    'onlySelected21ResourceLinksAddedToPriorCandidate':True,
    'operations':operations,'selectedImages':[records[i] for i in ids],
    'humanApproval':False,'humanTrial':False,'strictGain':0,'activeWrites':False,
    'fullBuilds':False,'generatorInvoked':False})
for p,b in tracked.items():
    assert bind(Path(p)) == b
write(OUT / 'external-declared-inputs.before-native-model.author.json',{'role':'declared input guard; source decisions not reapproved','inputBindings':list(tracked.values()),'selected21Ids':ids,'activeBaselineExact':True,'activeWrites':False})
print(json.dumps({'nativePrepare':21,'nativeIsolatedImport':21,'existing74PrivateCopies':'byte-exact','selected21Triplicate':'byte-exact','wholeUnrelated451':'exact','activeWrites':False,'strictGain':0}))
