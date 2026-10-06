#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Materialize exact foreign-author content and fresh scoped author checks."""
from pathlib import Path
from datetime import datetime, timezone
import copy, hashlib, json, shutil
ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
REL = OWN.relative_to(ROOT).as_posix()
META = json.loads((OWN / 'prospective-paths.json').read_text())
ISO = Path(META['isolationRoot'])
BAU, FISSION = META['goalIds']
PRIOR = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-six-current-source-hold-remediation-candidate-v1'
NOW = datetime.now(timezone.utc).isoformat()
def read(p): return json.loads(Path(p).read_text())
def write(p, x):
    p = Path(p); p.parent.mkdir(parents=True, exist_ok=True)
    assert not p.is_symlink(), p
    p.write_text(json.dumps(x, ensure_ascii=False, indent=2) + '\n')
def both(name, x): write(OWN / name, x); write(ISO / REL / name, x)
def detach(p):
    p = Path(p)
    assert p.parent.resolve().is_relative_to(ISO), p
    if p.is_symlink():
        q = p.resolve(); p.unlink(); shutil.copy2(q, p)
def sha(p): return 'sha256:' + hashlib.sha256(Path(p).read_bytes()).hexdigest()
assert read(OWN / 'baseline-full-model.actual.receipt.json')['exitCode'] == 0
shutil.copy2(ISO / REL / 'baseline-full.book-model.json', OWN / 'baseline-full.book-model.json')
assert len(read(OWN / 'baseline-full.book-model.json')['pages']) == 364
write(ISO / META['canonicalPath'], read(OWN / 'prospective-canonical.snapshot.json'))
write(ISO / META['atlasPath'], read(OWN / 'prospective-source-atlas.inputs.json'))
for p in (ISO / 'app/scripts/config/goal-books/source-views/de-gym-biology-national-atlas').rglob('*'):
    if p.is_file(): detach(p)
for p in ['app/scripts/config/goal-books/de-gym-biology-national-atlas.sources.json',
          'app/scripts/config/goal-books/navigation/de-gym-biology-national-atlas.view.json']:
    detach(ISO / p)
book = read(ROOT / 'app/scripts/config/goal-books/de-gym-biology-national-atlas.json')
book['outputPath'] = REL + '/prospective-full.book-model.json'
both('book.config.json', book)
batch = read(ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-tf-methylation-current-source-consumer-candidate-v3/batch.config.json')
batch.update(batchId='biologie-q1-bacterial-structure-fission-native-20261005-v1',
             bookId='de-gym-biologie-q1-bacterial-structure-fission-native-20261005-v1',
             title='Biologie Q1 – Bakterienbau und Zweiteilung als getrennte erhaltene Komponenten',
             baseGoalBookConfigPath=REL + '/book.config.json', goalIds=[BAU, FISSION],
             outputDirectory=REL + '/native-finalbook')
both('batch.config.json', batch)
for lane, field in [('atomicity', 'semanticAtomicityConfigPath'), ('memory', 'memoryReviewConfigPath')]:
    config = read(ROOT / META['bioConfig'][field])
    config['scope'] = {'label': 'Two inactive exact author candidates; independent current review remains pending', 'leafGoalIds': [BAU, FISSION]}
    config['reviewPath'] = REL + '/' + lane + '.two-author.review.jsonl'
    rows = []
    for gid in [BAU, FISSION]:
        row = {'schemaVersion': 1, 'reviewId': config['reviewId'], 'ruleVersion': config['ruleVersion'],
               'landscapeId': config['landscapeId'], 'goalId': gid, 'fingerprint': 'sha256:' + '0' * 64,
               'reviewedAt': NOW, 'reviewer': 'Codex inactive materialization author; not independent current reviewer'}
        if lane == 'atomicity':
            reason = ('One supplied structural model: prokaryotic cell plan and location of chromosome/optional plasmids. Reproduction is explicitly preserved in another atom.' if gid == BAU else
                      'One supplied division process: copying, partitioning and separation form the same explanatory chain. Optional 1-2-4 illustration is not a separately required population performance; neither exponential growth nor culture curves is claimed.')
            row.update(status='atomic', semanticAtomic=True, reason=reason)
        else:
            reason = ('Fresh given models and labelled material support structural comparison, chromosome/optional-plasmid distinction and explaining the bounded evidence. No independent uncued anatomy catalogue is required.' if gid == BAU else
                      'Given division stages and controlled copying interruption support ordering and causal process transfer. No uncued molecular-replication mechanism or compulsory quantitative population recall is required.')
            row.update(status='no_memory_needed', memoryUseful=False, reason=reason + ' No new required cards, decks or memory nodes are authored. Independent current review is pending.')
        rows.append(row)
    both(lane + '.two-author.config.json', config)
    for dest in [OWN / (lane + '.two-author.review.jsonl'), ISO / config['reviewPath']]:
        dest.write_text(''.join(json.dumps(row, ensure_ascii=False, separators=(',', ':')) + '\n' for row in rows))
structure_profile = copy.deepcopy(next(g for g in read(PRIOR / 'positive-evidence.candidates.json')['goals'] if g['goalId'] == BAU))
companion = read(OWN / 'two-goal-exact-content-and-prerequisite-candidates.json')['companion']
structure_profile.update(reason='Exact frozen foreign-author INNER profile retained. This native author materialization grants no independent current source/prerequisite/D/P/V approval.',
                         dissent=['Current source-component, prerequisite and ordinary source-view review is pending.', 'Two current native D rounds and current P/V bindings remain pending.'])
fission_profile = {'goalId': FISSION, 'reason': 'Exact frozen foreign-author INNER profile and DE/EN scope retained; only already explicit prerequisite correction and stable-ID binding are materialized. No independent current approval.',
                  'evidenceLevel': 'E1', 'maximumClaimScope': 'G1',
                  'dissent': ['Independent current source/prerequisite/D/P/V acceptance is pending; optional numerical illustration does not close BY exponential growth or ST culture curves.'],
                  'profile': copy.deepcopy(companion['profile'])}
positive = {'schemaVersion': 1, 'authoringContract': 'positive-understanding-evidence-candidates-v1',
            'reviewId': 'biologie-q1-bacterial-structure-fission-native-author-20261005-v1',
            'reviewedAt': NOW, 'reviewer': 'Codex inactive native materialization author',
            'goals': [structure_profile, fission_profile]}
both('positive-evidence.candidates.json', positive)
pc = read(PRIOR / 'positive.validation-only.config.json')
pc.update(reviewId=positive['reviewId'], landscapePath=META['canonicalPath'], semanticKindLedgerPath=META['semanticPath'],
          reviewPath=REL + '/positive.validation-only.review.jsonl', reviewedResourceTypes=['goal-visualization'],
          scope={'label': 'Two inactive exact author profiles with prospective PNG binding; no independent or human approval', 'goalIds': [BAU, FISSION]})
both('positive.validation-only.config.json', pc)
visuals = [
    {'id': BAU, 'dir': 'biologie-q1-bacterial-structure-candidate-20261005-v1',
     'sha256': 'sha256:21c583889d8d09355a28065956302e3d23434d6ef35c80dff576fc86fff5b165',
     'description': 'Comicartiges Bakterienmodell mit Zellwand, Zellmembran, Zellplasma, Ribosomen und DNA im Zellraum; Plasmide werden als mögliche zusätzliche DNA gezeigt.',
     'alt': 'Ein vereinfachtes Bakterienmodell zeigt Zellwand, Zellmembran, Zellplasma und Ribosomen. Das Bakterienchromosom liegt im Zellraum ohne membranumhüllten Zellkern; zwei kleine DNA-Ringe veranschaulichen mögliche Plasmide. Der Hinweis „Plasmide können vorkommen“ und „Modell mit Zellwand und Plasmiden – kein Zellkern“ begrenzt diese Eigenschaften auf das gezeigte Modell.'},
    {'id': FISSION, 'dir': 'biologie-q1-bacterial-binary-fission-candidate-20261005-v1',
     'sha256': 'sha256:5bdc4b985ce226c995dad02998ba8a2fc47babf6769a618d9d5a31560ea9d3e9',
     'description': 'Comicartige vereinfachte Folge einer bakteriellen Zweiteilung: Ausgangszelle, kopierte und verteilte chromosomale DNA, zwei getrennte Zellen.',
     'alt': 'Drei große Felder zeigen ein vereinfachtes Modell bakterieller Zweiteilung: eine Ausgangszelle mit einer ringförmigen chromosomalen DNA, eine eingeschnürte Zelle mit zwei kopierten und verteilten DNA-Ringen und zwei getrennte Zellen mit je einem Chromosom. Pfeile ordnen die Prozessfolge; ein Zellkern und eine Mitose werden nicht dargestellt. Die Abbildung ist ausdrücklich ein vereinfachtes Modell.'},
]
vbase = ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-review'
for v in visuals:
    vdir = vbase / v['dir']
    image = vdir / 'candidate-v1.png'
    assert sha(image) == v['sha256']
    request = read(vdir / 'generation-request-v1.json')
    prompt = OWN / (v['id'] + '.original-imagegen.prompt.txt')
    prompt.write_text(request['prompt'])
    for rel in [f'curricula/DE/Gymnasium/visualizations/biologie/{v["id"]}/{v["id"]}.png',
                f'curricula/DE/Gymnasium/visualizations/biologie/{v["id"]}/prompt.de.md',
                f'curricula/DE/Gymnasium/visualizations/biologie/{v["id"]}/image-reconstruction-prompt.de.md',
                f'app/public/assets/goal-visualizations/biologie/{v["id"]}/{v["id"]}.png',
                f'backend/src/main/resources/static/assets/goal-visualizations/biologie/{v["id"]}/{v["id"]}.png']:
        dst = ISO / rel; dst.parent.mkdir(parents=True, exist_ok=True); detach(dst)
    v['prepareArgs'] = ['node', 'scripts/prepare_goal_visualization.mjs', '--goal', v['id'], '--landscape', META['canonicalPath'], '--subject', 'biologie', '--provider', 'OpenAI / ChatGPT-Codex built-in image_gen', '--review-status', 'pilot']
    v['importArgs'] = ['node', 'scripts/import_goal_visualization.mjs', '--goal', v['id'], '--image', str(image), '--landscape', META['canonicalPath'], '--subject', 'biologie', '--lang', 'de', '--provider', 'OpenAI / ChatGPT-Codex built-in image_gen', '--review-status', 'pilot', '--license', 'CC-BY-4.0', '--description', v['description'], '--alt-text', v['alt'], '--prompt', str(prompt)]
both('native-image-import-plan.json', {'cwd': str(ISO), 'visuals': visuals, 'pixelsChanged': False, 'newImageGenerated': False,
                                     'currentGoalTitleAltSourceBindingApproval': 'pending independent current check', 'activeWrites': 0, 'humanApproval': False})
print(json.dumps({'status': 'native_prospective_author_inputs_materialized', 'goalIds': META['goalIds'], 'twoScopeFingerprintsNeedNativeDerivation': True,
                  'innerProfilesAndDEENExact': True, 'activeWrites': 0, 'humanApproval': False}))
