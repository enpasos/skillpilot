"""Seal only this finished V/P candidate review; native final D remains pending."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json

root = Path(__file__).resolve().parents[7]
own = Path(__file__).resolve().parent
freeze = own / 'independent-carrier-image-a.v-p-stage-1.freeze.json'
assert not freeze.exists(), 'Historical review freeze must remain immutable'

def binding(path):
    data = path.read_bytes()
    return {'path': str(path.relative_to(root)), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

inputs = json.loads((own / 'actual-bound-inputs.for-final-freeze.json').read_text())['inputs']
checks = []
for old in inputs:
    current = binding(root / old['path'])
    checks.append({'reviewedInput': old, 'atSeal': current, 'exactAtSeal': old == current})
required = ('carrier-corrected.candidate.png', 'carrier-corrected.actual-360.png', 'carrier-corrected.actual-680.png', 'before-ac9e824f-003c-50ac-8751-2b8456004c63.png')
assert all(row['exactAtSeal'] for row in checks if any(row['reviewedInput']['path'].endswith(x) for x in required)), 'Actually inspected raster changed'
report = {
    'schemaVersion': 1,
    'createdAtUTC': datetime.now(timezone.utc).isoformat(),
    'artifactSetId': own.name,
    'role': 'Independent A finished V/P candidate stage; final native D/context and active integration separate',
    'goalIds': ['ac9e824f-003c-50ac-8751-2b8456004c63'],
    'ownFiles': [binding(p) for p in sorted(own.iterdir()) if p.is_file() and p != freeze],
    'reviewedInputsAndActualSealState': checks,
    'decisions': {'actualCandidateV': 'KEEP', 'unchangedProfileAndTwoCompleteMaterialsP': 'KEEP', 'nativeFinalD': 'HOLD_FINAL_ACTUAL_ONE_PAGE_SOURCE_CONTEXT_INPUT'},
    'nativePClosedSchemaAndCandidateImageSemantics': 'PASS',
    'fullNativeP': 'HOLD_ACTIVE_PUBLIC_PNG_STILL_OLD',
    'unrelatedSixGoalsReviewedAgain': False,
    'activeWrites': False, 'globalHistoricalInputEqualityClaimed': False,
    'strictNetGain': 0, 'newScientificCompletions': 0, 'restoredActiveBindings': 0,
    'humanApproval': False, 'humanTrial': False, 'learnerEvidence': False,
}
freeze.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(binding(freeze)))
