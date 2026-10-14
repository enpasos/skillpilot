# SPDX-License-Identifier: Apache-2.0
"""Always start from the official generic prompt, never a prior package prompt."""
import hashlib
import json
import os
from datetime import datetime, timezone
from pathlib import Path

B = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14')
OLD = B / 'chemie-rest6-current414-final-resources-P2-shared-native2-technical-20261014-v1'
OUT = B / 'chemie-rest6-current414-final-resources-P2-shared-native2-technical-20261014-v2'
H = Path('tmp/checkpoint-chemie-20261013/current407-corrected-P8-native4-physical-host')
STANDARD = Path('curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md')

def binding(path):
    path = Path(path)
    return {'path': str(path), 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'bytes': path.stat().st_size}

def main():
    old_seal = OLD / 'SEAL.finite-current414-two-final-resource-P2-native-common-FIRST_PASS.stock-PASS.actual.json'
    assert binding(old_seal)['sha256'] == 'c087d297b1740a3bc0f9d8329d332c3907be79badee5556476677d82c823450b'
    # Exact scientific bodies and actual rendering remain the immutable v1 data.
    old_prompt = (OLD / 'shared/native-prompt.md').read_text()
    standard = STANDARD.read_text()
    assert old_prompt.startswith(standard)
    assert old_prompt.count('# Bound Source6 common input') == 1
    addendum = old_prompt[old_prompt.index('## Exact shared two-goal companion inputs'):]
    corrected = standard.rstrip() + '\n\n' + addendum
    forbidden = ['Bound Source6', 'all ten complete bilingual cases', 'seven carrier unions', 'No D records exist yet.']
    assert all(value.lower() not in corrected.lower() for value in forbidden)
    assert 'all four full bilingual cases' in corrected and 'actual two complete native PDF goal pages' in corrected
    prompt_path = OUT / 'shared/native-prompt.md'
    prompt_path.parent.mkdir(parents=True, exist_ok=True)
    prompt_path.write_text(corrected)
    config = json.loads((OLD / 'configs/native-two.shared-first-pass.batch.config.json').read_text())
    config['batchId'] = 'chemie-rest6-current414-two-shared-first-pass-20261014-v2'
    config['outputDirectory'] = str(OUT / 'native-two')
    config['promptPath'] = str(prompt_path)
    # Keep exact old base-config, book-id/title, criteria, goals and render inputs.
    config_path = OUT / 'configs/native-two.shared-first-pass.batch.config.json'
    config_path.parent.mkdir(parents=True, exist_ok=True)
    config_path.write_text(json.dumps(config, ensure_ascii=False, indent=2) + '\n')
    preflight = {
        'schemaVersion': 1, 'checkedAtUTC': datetime.now(timezone.utc).isoformat(),
        'officialUnmodifiedStandardPrompt': binding(STANDARD),
        'historicalV1FinalSealUnchanged': binding(old_seal),
        'historicalV1PromptWithStaleForeignPackageParagraph': binding(OLD / 'shared/native-prompt.md'),
        'currentCorrectedPrompt': binding(prompt_path),
        'ownFuturePreparationRule': 'Read the official generic template then add only the exact current package companion block; never reuse an already augmented package prompt.',
        'forbiddenForeignPackageStringsAbsent': forbidden,
        'exactCurrentScope': {'goals': 2, 'wholeCases': 4, 'rubricRows': 16, 'sourceWindows': 10},
        'properRest2AddendumVerbatimUnchanged': True,
        'criteriaAndWholeGoalPCaseAssetBodiesUnchanged': True,
        'noD2FirstScienceOrRecordsHadBeenIssued': True,
        'centralTemplateEngineOrActiveWrites': 0,
    }
    check = OUT / 'PREFLIGHT.official-standard-plus-only-Rest2-four-cases.no-foreign-Source6-instructions.json'
    check.write_text(json.dumps(preflight, ensure_ascii=False, indent=2) + '\n')
    for source in OUT.rglob('*'):
        if source.is_file():
            target = H / source
            target.parent.mkdir(parents=True, exist_ok=True)
            assert not target.exists()
            os.link(source, target)
    print(json.dumps({'status': 'PASS', 'officialStandard': binding(STANDARD), 'newPrompt': binding(prompt_path), 'oldV1Preserved': True}))

if __name__ == '__main__':
    main()
