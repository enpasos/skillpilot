#!/usr/bin/env python3
"""Replay the actual national learner-map pipeline with content-pinned inputs.

Catalogs stay in Git/the worktree; only compact merge data and the small native
code dependency closure are copied into the requested temporary output folder.
"""
from pathlib import Path
import argparse, datetime, hashlib, json, os, subprocess

HERE = Path(__file__).resolve().parent
ROOT = next(p for p in HERE.parents if (p / 'curricula/curriculum_manifest.json').exists())
SHA = lambda b: hashlib.sha256(b).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--after-ref', help='Git implementation revision containing the pinned After bytes; default: current worktree')
    parser.add_argument('--classpath-file', type=Path, help='Existing Java runtime classpath, newline or colon separated; otherwise resolve Gradle runtime dependencies without compiling the backend')
    args = parser.parse_args()
    output = args.output.resolve()
    output.mkdir(parents=True, exist_ok=False)
    manifest = json.loads((HERE / 'input-pins.json').read_text())
    expected = json.loads((HERE / 'comparison.actual.json').read_text())['rows']
    dependency_pins = manifest['dependencyManifestPins']

    def guard_dependencies():
        for path, digest in dependency_pins.items():
            if SHA((ROOT / path).read_bytes()) != digest:
                raise RuntimeError('Dependency manifest differs: ' + path)

    guard_dependencies()
    if args.classpath_file:
        cp_text = args.classpath_file.resolve().read_text().strip()
    else:
        init = output / 'runtime-classpath.init.gradle'
        init.write_text('''allprojects { afterEvaluate { p -> if (p == rootProject) {
 tasks.register("writeStageViewRuntimeClasspath") { doLast {
  def out = file(project.findProperty("stageViewClasspathOutput")); out.parentFile.mkdirs()
  out.setText(configurations.runtimeClasspath.files.collect { it.absolutePath }.sort().join("\\n") + "\\n", "UTF-8")
 } }
} } }
''')
        cp_path = output / 'runtime-classpath.txt'
        subprocess.run(['./gradlew', '--no-daemon', '-q', '-I', str(init), 'writeStageViewRuntimeClasspath', '-PstageViewClasspathOutput=' + str(cp_path)], cwd=ROOT / 'backend', check=True)
        cp_text = cp_path.read_text().strip()
    classpath = os.pathsep.join(cp_text.splitlines())
    receipts = []
    for label in manifest['defaultReproduction']:
        epoch = next(e for e in manifest['epochs'] if e['label'] == label)
        revision = epoch['revision'] if label == 'main64793' else args.after_ref

        def read_source(path):
            return subprocess.check_output(['git', 'show', revision + ':' + path], cwd=ROOT) if revision else (ROOT / path).read_bytes()

        pins = {p['path']: p['sha256'] for p in epoch['pins']}
        pins.update(epoch['frontendCodePins'])
        merger = epoch['mergerSourcePin']
        pins[merger['path']] = merger['sha256']

        def guard():
            guard_dependencies()
            for path, digest in pins.items():
                if SHA(read_source(path)) != digest:
                    raise RuntimeError(label + ' pinned input/code drift: ' + path)

        guard()
        documents = {p: json.loads(read_source(p)) for p in epoch['canonicalPaths'] + epoch['viewPaths']}
        children = {g['id']: [x.rsplit(':', 1)[-1] for x in g.get('contains', [])] for p in epoch['canonicalPaths'] for g in documents[p]['goals']}
        views = [documents[p] for p in epoch['viewPaths']]
        (output / (label + '.merge-input.json')).write_text(json.dumps({'children': children, 'views': views}, ensure_ascii=False))
        descriptor = {**epoch, 'revision': revision}
        (output / (label + '.descriptor.json')).write_text(json.dumps(descriptor, ensure_ascii=False))
        code_root = output / (label + '-code')
        for path in epoch['frontendCodePins']:
            target = code_root / path
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(read_source(path))
        (code_root / 'app/node_modules').symlink_to(ROOT / 'app/node_modules', target_is_directory=True)
        java_source = code_root / 'CourseProfileCompositionViewMerger.java'
        java_source.write_bytes(read_source(merger['path']))
        classes = code_root / 'classes'
        classes.mkdir()
        subprocess.run(['javac', '-J-Xmx512m', '-cp', classpath, '-d', str(classes), str(java_source), str(HERE / 'CompactMergeViewsProbe.java')], cwd=ROOT, check=True)
        subprocess.run(['java', '-Xmx512m', '-cp', str(classes) + os.pathsep + classpath, 'CompactMergeViewsProbe', str(output), label], cwd=ROOT, check=True)
        runner = output / (label + '.runner.mts')
        runner.write_text((HERE / 'native-probe.mts.template').read_text().replace('__CODE_ROOT__', str(code_root)))
        env = dict(os.environ, HE_PREPARATION_ROOT=str(output), HE_EPOCH_LABEL=label)
        with (output / (label + '.actual.log')).open('w') as log:
            subprocess.run([str(ROOT / 'app/node_modules/.bin/tsx'), str(runner)], cwd=ROOT, env=env, stdout=log, stderr=subprocess.STDOUT, check=True)
        guard()
        report = json.loads((output / (label + '.causal-native-report.json')).read_text())
        for row in report['rows']:
            reference = next(r for r in expected if r['epoch'] == label and r['profile'] == row['scope']['courseProfile'])
            actual = (len(row['topBoardDirectBackflows']), len(row['transitiveBackflows']), row['outsideStage'], row['findings'])
            wanted = (reference['directBackflowPairs'], reference['transitiveBackflowPairs'], reference['outsideStage'], reference['findings'])
            if actual != wanted:
                raise RuntimeError(label + ': atomic backflow/outside evidence differs')
            causes = {(r['dependentGoalId'], r['requiredGoalId']) for r in row['topBoardDirectBackflows']}
            if causes != {(r['dependentGoalId'], r['requiredGoalId']) for r in reference['causes']}:
                raise RuntimeError(label + ': direct atomic causes differ')
            vector_ids = {'2ac2e902-a6ad-53c9-b139-d1c63d823023', '54541d08-61cc-5a6d-b6d9-d0270a7d1949'}
            if [r for r in row['learningPlacements'] if r['goalId'] in vector_ids] != reference['vectorPlacements']:
                raise RuntimeError(label + ': actual vector placements differ')
            for subject, key in [('Physics', 'physicsOnly'), ('Mathematics', 'mathOnly')]:
                denominator = {k: v for k, v in row['progressDenominators'][key].items() if k != 'actualUnits'}
                filtered = row['filteredEvidence'][key]
                ref = reference['subjects'][subject]
                if denominator != ref['stageDenominators'] or filtered['rootChildren'] != ref['rootChildren'] or sum(bool(x.get('backward')) for x in filtered['rootRelations']) != ref['backwardSummaryArrows']:
                    raise RuntimeError(label + ': visible subject map differs')
        receipts.append({'epoch': label, 'revision': revision, 'exitCode': 0, 'profilesChecked': len(report['rows']), 'allPinnedInputsAndCodeUnchanged': True, 'reportSha256': SHA((output / (label + '.causal-native-report.json')).read_bytes())})
        print(label + ': PASS native pipeline, all three profiles match pinned findings and visible maps')
    receipt = {'finishedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'executions': receipts}
    (output / 'reproduction-receipt.json').write_text(json.dumps(receipt, indent=2) + '\n')


if __name__ == '__main__':
    main()
