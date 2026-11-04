#!/usr/bin/env python3
"""One conservative input inventory for the completion corpus and its report gate.

The exact quality root is offline evidence, except for registry-addressed source
files, extraction fallbacks and declared buildtime view-check dependencies.
Other curriculum JSON is cheap to over-bind and
may be read by a different runtime loader, including mappings in metadata roots.
The Git index supplements the filesystem so sparse checkout cannot silently make
functional inputs disappear. No source files or evidence copies are generated.
"""
import argparse
from bisect import bisect_left
import json
import os
from pathlib import Path
import subprocess

SCOPE_INPUTS = {
    'app/src/generated/gymnasiumDurationOfferings.ts',
    'app/scripts/config/curriculum-maturity-floor-policy.json',
    'docs/qa-ci/status/curriculum-quality-status.json',
}
CODE_INPUTS = {
    '.java-version', '.corretto-version',
    'backend/build.gradle.kts', 'backend/settings.gradle.kts', 'backend/gradle.properties',
    'backend/gradlew', 'backend/gradle/wrapper/gradle-wrapper.jar',
    'backend/gradle/wrapper/gradle-wrapper.properties',
    'scripts/curriculum_completion_inputs.py',
    'scripts/check_curriculum_completion_integrity_report.py',
    'scripts/test_curriculum_completion_integrity_report.py',
    '.github/workflows/assessment-completion.yml',
}
OFFLINE_ROOT = 'curricula/DE/Gymnasium/quality/'
REGISTRY = 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json'
MATH_VIEW_PLAN = ('curricula/DE/Gymnasium/assessments/mathematik/'
                  'contextual-terminal-assessments-2026-11-04-v1/finite-scope-operations.json')
MATH_VIEW_POLICY = 'app/scripts/config/math-country-seki-stage-policy.json'


def tracked_files(root):
    """Only use the index belonging to this root, never an enclosing repository."""
    if not (root / '.git').exists():
        return set()
    result = subprocess.run(['git', '-C', str(root), 'ls-files', '-z'],
                            capture_output=True, check=True)
    return set(result.stdout.decode().rstrip('\0').split('\0')) - {''}


def walked_files(directory, excluded=None):
    for current, children, names in os.walk(directory):
        children[:] = [name for name in children if Path(current) / name != excluded]
        for name in names:
            path = Path(current) / name
            if path.is_file():
                yield path


def registered_path(root, relative, known, ordered):
    """Mirror LandscapeService.resolveRegistryRepoPath, including missing paths."""
    if not relative or relative.startswith(('http://', 'https://')):
        return root / 'curricula/_unresolved_remote_path_'
    normalized = relative
    for state in ['HE', 'BY']:
        prefix = f'curricula/DE/Gymnasium/input/DE-{state}/'
        if relative.startswith(prefix):
            normalized = f'curricula/DE/Gymnasium/input/{state}/' + relative[len(prefix):]
    for value in dict.fromkeys([relative, normalized]):
        candidates = [root / 'curricula' / value, root / value]
        if value.startswith('curricula/'):
            candidates.append(root / 'curricula' / value.removeprefix('curricula/'))
        for candidate in candidates:
            resolved = candidate.resolve()
            if not resolved.is_relative_to(root):
                raise ValueError(f'External registered curriculum input: {relative}')
            path = resolved.relative_to(root).as_posix()
            position = bisect_left(ordered, path + '/')
            has_children = position < len(ordered) and ordered[position].startswith(path + '/')
            if candidate.exists() or path in known or has_children:
                return resolved
    fallback = (root / 'curricula' / normalized.removeprefix('curricula/')).resolve()
    if not fallback.is_relative_to(root):
        raise ValueError(f'External registered curriculum input: {relative}')
    return fallback


def math_view_check_inputs(root, known):
    """Mirror the explicit file bindings read by the production-merger check.

    Read a sparse plan from this repository's index before hydration. Review
    contents are not traversed: their historical paths are not build inputs.
    The allowance's review must already occur in independentDecisionBindings,
    as enforced by MaterializeMathContextualCombinedViews.
    """
    plan_path = root / MATH_VIEW_PLAN
    if plan_path.is_file():
        plan = json.loads(plan_path.read_text())
    elif MATH_VIEW_PLAN in known:
        result = subprocess.run(['git', '-C', str(root), 'show', ':' + MATH_VIEW_PLAN],
                                capture_output=True, check=True)
        plan = json.loads(result.stdout)
    else:
        return set()
    result = {MATH_VIEW_PLAN, MATH_VIEW_POLICY}
    bindings = [*plan.get('independentDecisionBindings', []),
                *plan.get('producerSourceSnapshots', {}).values()]
    if 'reviewedExistingAssessmentChanges' in plan:
        bindings.append(plan['reviewedExistingAssessmentChanges'])
    for binding in bindings:
        relative = binding.get('path') if isinstance(binding, dict) else None
        if (not isinstance(relative, str) or not relative
                or Path(relative).is_absolute() or '..' in Path(relative).parts
                or '\\' in relative or relative != Path(relative).as_posix()):
            raise ValueError(f'Invalid declared view-check input: {relative!r}')
        result.add(relative)
    return result


def current_input_paths(root):
    root = root.resolve()
    known = tracked_files(root)
    known.update(path.relative_to(root).as_posix() for path in walked_files(
        root / 'curricula', root / OFFLINE_ROOT.rstrip('/')))
    for directory in ['backend/src/main/java', 'backend/src/test/java']:
        known.update(path.relative_to(root).as_posix() for path in walked_files(root / directory))
    ordered = sorted(known)
    result = set(SCOPE_INPUTS)
    result.update(path for path in CODE_INPUTS if path in known or (root / path).is_file())
    result.update(path for path in known if (
        path.startswith('curricula/') and not path.startswith(OFFLINE_ROOT)
        and path.endswith(('.json', '.json.snapshot'))
    ) or (path.startswith(('backend/src/main/java/', 'backend/src/test/java/')) and path.endswith('.java')))
    result.update(math_view_check_inputs(root, known))
    registry = root / REGISTRY
    if REGISTRY in known and not registry.is_file():
        raise ValueError(f'Missing input inventory registry: {REGISTRY}')
    if registry.is_file():
        for entry in json.loads(registry.read_text())['entries']:
            if not entry.get('archiveSourcePath'):
                continue
            source = registered_path(root, entry['archiveSourcePath'], known, ordered)
            source_relative = source.relative_to(root).as_posix()
            if source.is_file() or source_relative in known:
                result.add(source_relative)
            elif source.exists():
                raise ValueError(f'Invalid registered curriculum source: {source_relative}')
            # The loader tries these even when the archive source is absent.
            roots = [source.parent / 'source-extraction']
            if entry.get('archivePath'):
                roots.append(registered_path(root, entry['archivePath'], known, ordered) / 'source-extraction')
            for extraction_root in roots:
                prefix = extraction_root.relative_to(root).as_posix() + '/'
                descendants = ordered[bisect_left(ordered, prefix):bisect_left(ordered, prefix + '\uffff')]
                result.update(path for path in descendants if path.endswith('.source-extraction.json'))
                result.update(path.resolve().relative_to(root).as_posix()
                              for path in walked_files(extraction_root)
                              if path.name.endswith('.source-extraction.json'))
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--sparse-patterns', action='store_true',
                        help='Print exact input paths to git sparse-checkout add --stdin before the audit')
    args = parser.parse_args()
    paths = sorted(current_input_paths(args.root))
    if args.sparse_patterns:
        print('\n'.join('/' + path for path in paths))
    else:
        print(json.dumps(paths))


if __name__ == '__main__':
    main()
