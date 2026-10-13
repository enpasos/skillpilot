#!/usr/bin/env python3
"""Apache-2.0. Validate this one owned blind review without live mutations."""
import datetime
import json
import pathlib
import subprocess
import sys

sys.dont_write_bytecode = True
# Locate the real repository by its normal source validator.
repo = next(p for p in pathlib.Path(__file__).resolve().parents
            if (p / 'app/scripts/validateGoalDescriptionReviewCampaignResults.ts').is_file())
owned = pathlib.Path(__file__).resolve().parents[1]
author = owned.parent / 'chemie-f947-final-source-PNG-explicit-tasks-neutral-native-author-root-20261013-v11'
private = pathlib.Path('/tmp/chemie-f947-final-a-20261013-v12/normal-validation-repository')
tsx = repo / 'app/node_modules/.bin/tsx'

def relative(path):
    return str(path.relative_to(repo))

jobs = [
    ('D1-stock-campaign-results', [str(tsx), 'app/scripts/validateGoalDescriptionReviewCampaignResults.ts',
     '--bundle', relative(author / 'native-D1/round-a/review-bundle-manifest.json'),
     '--input', relative(author / 'native-D1/round-a/description-review-input.json'),
     '--campaign', relative(author / 'native-D1/round-a/description-review-campaign.json'),
     '--batches-dir', relative(author / 'native-D1/round-a/batches'),
     '--results-dir', relative(author / 'native-D1/round-a/results')]),
    ('P1-normal-private-exact-resource', [str(tsx), str(private / 'app/scripts/positiveGoalEvidenceReview.ts'),
     '--config=' + relative(owned / 'configs/P1.independent.inactive.config.json'), '--mode=check']),
    ('A1-normal-one-goal', [str(tsx), 'app/scripts/semanticAtomicityReview.ts',
     '--config=' + relative(owned / 'configs/A1.independent.inactive.config.json'), '--mode=check']),
]
checks = []
for name, command in jobs:
    result = subprocess.run(command, cwd=repo, capture_output=True, text=True)
    raw = owned / 'checks' / (name + '.actual.txt')
    raw.write_text(result.stdout + result.stderr)
    checks.append({'name': name, 'command': command, 'returnCode': result.returncode,
                   'rawOutputPath': relative(raw), 'passed': result.returncode == 0})
    print(name, result.returncode, result.stdout.strip(), result.stderr.strip())

parsed = []
for path in sorted(owned.rglob('*')):
    if not path.is_file():
        continue
    assert not path.is_symlink(), path
    if path.suffix == '.json':
        json.loads(path.read_text())
        parsed.append(relative(path))
    elif path.suffix == '.jsonl':
        for line in path.read_bytes().splitlines():
            json.loads(line)
        parsed.append(relative(path))

sys.path.insert(0, str(repo))
from scripts.validate_schemas import curriculum_symlink_errors
links = curriculum_symlink_errors(repo)
link_output = owned / 'checks/global-committable-curriculum-links.actual.txt'
link_output.write_text('global committable curriculum symlink errors ' + str(len(links)) + '\n'
                       + '\n'.join(links))
checks.append({'name': 'global-committable-curriculum-links', 'passed': not links,
               'errors': links, 'rawOutputPath': relative(link_output)})
checks.append({'name': 'complete-owned-json-and-jsonl-parse', 'passed': True,
               'files': parsed})
receipt = {'schemaVersion': 1, 'checkedAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
           'checks': checks, 'passed': all(c['passed'] for c in checks),
           'scope': 'One exact final F947 native tuple, source HOLD, no full build',
           'activeCurriculumWrites': False}
(owned / 'checks/OWN.scoped-normal-checks.actual.json').write_text(json.dumps(receipt, indent=2) + '\n')
assert receipt['passed'], receipt
print('Owned normal contracts, full JSON parsing and global committable links passed.')
