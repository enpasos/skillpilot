# SPDX-License-Identifier: Apache-2.0
"""Replace only the just-appended erroneous config pointer after its actual check."""
from pathlib import Path
import copy
import hashlib
import json
import shutil

D = Path(__file__).resolve().parent
R = D.parents[6]
T = D.parent / 'biologie-he7-ten-reviewed-integration-preparation-technical-20261008-v1'
read = lambda p: json.loads(p.read_text())
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
assert read(D / 'active-P10-correct-operational-config-v2.exit.actual.json')['exitCode'] == 0
receipt = read(D / 'operational-P10-config-routing-only-correction-v2.actual.json')
for key in ['originalConfig', 'correctOperationalConfig', 'genuineReviewedP10Records']:
    assert sha(R / receipt[key]['path']) == receipt[key]['sha256']
plan = read(T / 'ready-root-reviewed-guarded-integration-plan.technical.json')
assert sha(R / plan['beforeBindings']['canonical']['path']) == plan['futureCanonicalSha256'].removeprefix('sha256:')
for row in plan['protectedOtherFiles']:
    assert sha(R / row['path']) == row['sha256'].removeprefix('sha256:')
registry_path = R / plan['beforeBindings']['registry']['path']
registry = read(registry_path)
before = copy.deepcopy(registry)
bio = next(s for s in registry['subjects'] if s['subject'] == 'biologie')
assert bio == read(R / plan['mergeOnlyBiologyRegistryEntryFrom'])
assert bio['positiveEvidenceConfigPaths'][-1] == receipt['originalConfig']['path']
bio['positiveEvidenceConfigPaths'][-1] = receipt['correctOperationalConfig']['path']
expected = copy.deepcopy(before)
next(s for s in expected['subjects'] if s['subject'] == 'biologie')['positiveEvidenceConfigPaths'][-1] = receipt['correctOperationalConfig']['path']
assert registry == expected
shutil.copyfile(registry_path, D / 'registry-before-operational-P10-config-v2.exact.json')
registry_path.write_text(json.dumps(registry, ensure_ascii=False, indent=2) + '\n')
with (D / 'registry-operational-P10-pointer-only-correction-v2.actual.json').open('x') as f:
    json.dump({'changedPointer': 'subjects.biologie.positiveEvidenceConfigPaths[-1]',
               'oldConfigPath': receipt['originalConfig']['path'],
               'newConfigPath': receipt['correctOperationalConfig']['path'],
               'unchangedReviewedP10RecordsSha256': receipt['genuineReviewedP10Records']['sha256'],
               'standardP10CLIExitCode': 0, 'otherRegistryFieldsExact': True,
               'historicalSealedV1AndActualFailureRetained': True,
               'humanApproval': False, 'newScienceReviewsClaimed': 0}, f, indent=2)
    f.write('\n')
print('Actual successful P10 config routed to current inputs; exact reviewed records retained.')
