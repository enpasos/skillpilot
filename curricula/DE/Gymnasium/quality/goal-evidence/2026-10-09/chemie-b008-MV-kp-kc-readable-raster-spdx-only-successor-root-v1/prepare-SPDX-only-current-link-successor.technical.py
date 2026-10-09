#!/usr/bin/env python3
"""Correct a new own-image license field; retain pixel and scientific FIRSTs."""
# SPDX-License-Identifier: Apache-2.0
from copy import deepcopy
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
BASE = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09')
OLD = BASE / 'chemie-b008-MV-kp-kc-readable-raster-author-v1/neutral-one-KpKc-readable-actual-PNG.independent-visual-review.entry.json'


def bind(path):
    path = Path(path); data = (ROOT / path).read_bytes()
    return {'path': str(path), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def write(name, data):
    path = OUT / name
    assert not path.exists(), path
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    assert json.loads(path.read_text()) == data
    return bind(path.relative_to(ROOT))


def main():
    original = json.loads((ROOT / OLD).read_text())
    first = write('one-SPDX-only-successor.technical-input.first.freeze.json', {
        'schemaVersion': 1, 'inputs': [bind(OLD), bind('LICENSING.md')],
        'selectedPNG': original['images'][0]['asset'],
        'pixelReviewRepeated': False, 'newScienceClaimed': False,
    })
    successor = deepcopy(original)
    for key in ['images', 'entries']:
        assert len(successor[key]) == 1
        link = successor[key][0]['resourceLinkCandidate']
        assert link['license'] == 'AI-generated, SkillPilot-curated'
        link['license'] = 'CC-BY-4.0'
        masked = deepcopy(successor[key][0])
        masked['resourceLinkCandidate']['license'] = 'AI-generated, SkillPilot-curated'
        assert masked == original[key][0]
    successor['role'] = 'inactive actual Kp PNG candidate with own-content SPDX-only metadata correction'
    successor['createdAt'] = datetime.now(timezone.utc).isoformat()
    successor['technicalSPDXOnlySuccessor'] = {
        'originalEntry': bind(OLD), 'technicalInputFirst': first,
        'bindingDifferences': ['/images/0/resourceLinkCandidate/license', '/entries/0/resourceLinkCandidate/license'],
        'newLicense': 'CC-BY-4.0', 'ownContentPolicy': bind('LICENSING.md'),
        'providerAndProvenanceUnchanged': True, 'allPixelBytesUnchanged': True,
        'allCaptionAltPromptReconWholeGoalProfileFieldsUnchanged': True,
        'historicalLicenseFieldsUnchanged': True,
        'independentTargetedMetadataFollowupPending': True,
        'pixelReviewRepeated': False, 'newScientificReviewClaimed': False,
        'currentNativeAndRasterPApproved': False, 'wholeSourceApproved': False,
        'humanApproval': False, 'humanTrial': False, 'activeWrites': False,
    }
    entry = write('neutral-one-current-Kp-PNG-SPDX-only-successor.targeted-metadata-followup.entry.json', successor)
    final = write('one-SPDX-only-successor.technical.final.freeze.json', {
        'schemaVersion': 1, 'inputs': [bind(OLD), bind('LICENSING.md')],
        'outputs': [first, entry, bind(Path(__file__).relative_to(ROOT))],
        'rasterGenerationOrPixelEditing': False, 'historicalArtifactsRewritten': False,
    })
    print(json.dumps({'entry': entry, 'seal': final, 'pixelChange': 0,
                      'targetedMetadataFollowupPending': True, 'strictGain': 0}))


if __name__ == '__main__':
    main()
