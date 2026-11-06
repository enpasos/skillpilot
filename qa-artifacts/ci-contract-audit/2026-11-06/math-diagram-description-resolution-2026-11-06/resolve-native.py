#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Resolve the two completed one-goal reviews using existing native tools.

Only this archived packet's synthesis outputs are writable inside bubblewrap.
Original reviews and all active source/QA files are read-only. This script has
no live-application mode and deliberately refuses to overwrite a prior result.
"""
import datetime
import hashlib
import json
import subprocess
import sys
import time
from pathlib import Path

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[4]
HERE = Path(__file__).resolve().parent
AUDIT = ROOT / 'qa-artifacts/ci-contract-audit/2026-11-06'
PACKET = AUDIT / 'math-single-description-input-2026-11-06/packet'
OLD = AUDIT / 'math-three-description-input-2026-11-06/packet'
CONFIG = 'docs/dev/ci-graph-repairs/math-single-description-input-batch-2026-11-06.config.json'
CONTROL = ROOT / 'tmp/math-diagram-recheck-preparer-20261106'
RAM = Path('/dev/shm/skillpilot-math-diagram-revision-20261106')
SOURCE = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
KINDS = ROOT / 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


def inventory(paths):
    return {str(p.relative_to(ROOT)): sha(p) for path in paths
            for p in ([path] if path.is_file() else sorted(path.rglob('*'))) if p.is_file()}


def finish(before):
    if inventory([OLD, PACKET / 'bundle', PACKET / 'round-a', PACKET / 'round-b',
                  PACKET / 'batch-manifest.json', SOURCE, KINDS]) != before:
        raise ValueError('Frozen original input changed')
    executions = json.loads((HERE / 'execution.json').read_bytes())
    if len(executions) != 4 or any(row['exitCode'] != 0 for row in executions):
        raise ValueError('Native execution did not complete all four steps')
    index = json.loads((PACKET / 'resolution-index.json').read_bytes())
    if index.get('deferredGoalIds', []) or len(index['resolutions']) != 1 or not index['resolutions'][0]['strictDescriptionComplete']:
        raise ValueError('Native single-goal resolution is incomplete')
    write(HERE / 'completion.json', {
        'completedAtActualCoordinator': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'allFourNativeStepsExit0': True,
        'frozenOriginalAndNewInputFilesUnchanged': len(before),
        'canonicalSourceSha256': sha(CONTROL / 'candidate.json'),
        'nativeIndexPath': str((PACKET / 'resolution-index.json').relative_to(ROOT)),
        'nativeIndexSha256': sha(PACKET / 'resolution-index.json'),
        'historicalPartialIndexSha256': sha(OLD / 'resolution-index.json'),
        'allWritesRestrictedToThisPacketAndItsOwnExecutionEvidence': True,
        'liveSourceOrQaWrites': False,
        'nativeCompletionIsNotAWholeSubjectDeepOrMaturityPass': True,
    })


def main():
    if sys.argv[1:] == ['--complete-existing-native-execution']:
        if (HERE / 'completion.json').exists():
            raise ValueError('Completed evidence must not be overwritten')
        finish(json.loads((HERE / 'frozen-inputs.json').read_bytes()))
        return
    if sys.argv[1:]:
        raise ValueError('Unsupported argument')
    if (HERE / 'execution.json').exists() or (PACKET / 'synthesis-authoring.json').exists():
        raise ValueError('Completed synthesis must not be overwritten')
    if sha(CONTROL / 'candidate.json') != '967a9cf8f27c5ee678777401697ba8b69874dbc889f7cfe753267f7c5a05c318':
        raise ValueError('Current fixed B source differs')
    if sha(AUDIT / 'math-single-description-input-2026-11-06/input-inventory.json') != 'afa02aaf218a193ddf557332f9b5407fc385288f28a2c490398be3c818e64491':
        raise ValueError('Neutral input inventory differs')
    for path, expected in [
        (OLD / 'resolution-index.json', '3d04b4d38e5ab33d653a921caedb930136d0d28e9c1f5ba565c5888d28f64611'),
        (OLD / 'synthesis-decisions.json', 'f2d384867ea3c5f8690d49eff443a146ad705065070a9ceb7513b6a6f1555ab1'),
    ]:
        if sha(path) != expected:
            raise ValueError(f'Historical partial resolution differs: {path}')
    frozen = [OLD, PACKET / 'bundle', PACKET / 'round-a', PACKET / 'round-b',
              PACKET / 'batch-manifest.json', SOURCE, KINDS]
    before = inventory(frozen)
    write(HERE / 'frozen-inputs.json', before)
    authoring = {
        'schemaVersion': 1,
        'manifestId': 'math-diagram-fixed-b-two-new-keeps-20261106-v1',
        'synthesizedBy': 'Codex post-review synthesis after reading both sealed new independent rounds; not a blind first pass',
        'decisions': [{
            'goalId': '0c2ddfcd-1399-41ad-aaed-4f061812602a',
            'resolutionDecision': 'keep_current',
            'evidenceRound': 'first',
            'rationaleDe': 'Beide tatsächlich neu und unabhängig abgeschlossenen kalten Prüfungen behalten exakt den festen bilingualen B-Text. Ich wähle die erste Evidenzfassung, weil sie sinnvoll geordnete Reihen allgemein behandelt und ausdrücklich auch das Fehlen einer eindeutigen Gesamtrichtung zulässt. Datenbezogene Auffälligkeiten und Wertevergleiche bleiben für ungeordnete Kategorien möglich; ein zeitlicher Trend wird dort nicht erfunden. Die zweite passende Evidenzfassung mit anderer Diagrammform und Anstieg-Plateau-Transfer bleibt vollständig gebunden. Es kommen weder Diagrammkonstruktion noch Kennwert-, Regressions-, Kausal- oder Prognoseleistungen hinzu. Die ursprünglichen zwei revise-Records werden weder überschrieben noch rückwirkend zu keep erklärt.',
            'rationaleEn': 'Both genuinely new, independently completed cold checks retain the exact fixed bilingual B text. I select the first evidence formulation because it covers meaningfully ordered series generally and explicitly allows the absence of a clear overall direction. Data-grounded features and value comparisons remain possible for unordered categories, without inventing a temporal trend. The second suitable formulation, with a different chart type and rise-plateau transfer, remains fully bound. No diagram construction, summary-statistic, regression, causal, or forecasting performance is added. The original two revise records are neither overwritten nor retrospectively labelled keep.',
        }],
    }
    write(PACKET / 'synthesis-authoring.json', authoring)
    prefix = ['bwrap', '--die-with-parent', '--unshare-net', '--ro-bind', '/', '/',
              '--proc', '/proc', '--dev', '/dev', '--tmpfs', '/tmp',
              '--ro-bind', str(RAM), str(RAM), '--bind', str(PACKET), str(PACKET)]
    for path in [PACKET / 'bundle', PACKET / 'round-a', PACKET / 'round-b', PACKET / 'batch-manifest.json']:
        prefix += ['--ro-bind', str(path), str(path)]
    prefix += ['--ro-bind', str(CONTROL / 'candidate.json'), str(SOURCE),
               '--ro-bind', str(CONTROL / 'kind-ledger.json'), str(KINDS),
               '--chdir', str(ROOT), '--', str(ROOT / 'app/node_modules/.bin/tsx')]
    native = [
        ['app/scripts/materializeGoalDescriptionRolloutBatch.ts', 'summarize', '--config', CONFIG, '--write'],
        ['app/scripts/materializeGoalDescriptionRolloutSynthesisManifest.ts', '--config', CONFIG,
         '--authoring', str((PACKET / 'synthesis-authoring.json').relative_to(ROOT)), '--write'],
        ['app/scripts/materializeGoalDescriptionRolloutResolutions.ts', '--config', CONFIG,
         '--synthesis-manifest', str((PACKET / 'synthesis-decisions.json').relative_to(ROOT)), '--write'],
        ['app/scripts/materializeGoalDescriptionRolloutBatch.ts', 'finalize', '--config', CONFIG, '--write'],
    ]
    executions = []
    for i, args in enumerate(native):
        command = prefix + args
        start = time.monotonic()
        with (HERE / f'{i}.stdout.txt').open('wb') as out, (HERE / f'{i}.stderr.txt').open('wb') as err:
            code = subprocess.run(command, stdout=out, stderr=err).returncode
        executions.append({'step': i, 'exitCode': code, 'seconds': time.monotonic() - start, 'command': command})
        write(HERE / 'execution.json', executions)
        print(json.dumps({k: v for k, v in executions[-1].items() if k != 'command'}), flush=True)
        if inventory(frozen) != before:
            raise ValueError('Frozen original input changed')
        if code:
            raise SystemExit(code)
    finish(before)


if __name__ == '__main__':
    main()
