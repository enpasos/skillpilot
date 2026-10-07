#!/usr/bin/env python3
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
OWN = Path(__file__).resolve().parent
AUTHOR = OWN.parent / 'biologie-q1-seven-final-native-review-inputs-author-v1'
name = 'native-d-independent-b.final.freeze.json'
assert not (OWN / name).exists(), 'Final freeze is immutable'
sha = lambda data: hashlib.sha256(data).hexdigest()
bindings = json.loads((OWN / 'actual-input-bindings.independent-b.json').read_text())['inputs']
extra = [ROOT / 'AGENTS.md', ROOT / 'app/scripts/validateGoalDescriptionReviewCampaignResults.ts', ROOT / 'app/scripts/validateGoalDescriptionReviewCampaign.ts', ROOT / 'app/scripts/validateGoalEvidenceFindings.ts', ROOT / 'contracts/goal-description-review/v1/goal-description-review-record.schema.json', ROOT / 'contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json']
for path in extra:
    data = path.read_bytes()
    bindings.append({'path': str(path.relative_to(ROOT)), 'sha256': sha(data), 'bytes': len(data)})
for binding in bindings:
    data = (ROOT / binding['path']).read_bytes()
    assert sha(data) == binding['sha256'] and len(data) == binding['bytes'], binding['path']
author_freeze = json.loads((AUTHOR / 'final-native-review-inputs.author-v1.freeze.json').read_text())
agents_expected = next(r for r in author_freeze['inputBindings'] if r['path'] == 'AGENTS.md')
assert sha((ROOT / 'AGENTS.md').read_bytes()) == agents_expected['sha256']
validation = json.loads((OWN / 'native-campaign-validator.actual.json').read_text())
assert validation['exitCode'] == 0 and validation['stdout'] == 'Goal-description review campaign results valid: 7\n'
own_outputs = []
for path in sorted(OWN.rglob('*')):
    if not path.is_file() or path.name == name:
        continue
    data = path.read_bytes()
    own_outputs.append({'path': str(path.relative_to(OWN)), 'sha256': sha(data), 'bytes': len(data)})
out = {'schemaVersion': 1, 'createdAtUTC': datetime.now(timezone.utc).isoformat(), 'role': 'actual independent native D first-pass B, seven personally read final PDF pages and bilingual contexts', 'authorFreeze': {'path': str((AUTHOR / 'final-native-review-inputs.author-v1.freeze.json').relative_to(ROOT)), 'sha256': sha((AUTHOR / 'final-native-review-inputs.author-v1.freeze.json').read_bytes())}, 'actualInputs': sorted({r['path']: r for r in bindings}.values(), key=lambda r: r['path']), 'ownOutputs': own_outputs, 'nativeCampaignValidatorExit': 0, 'nativeDRecords': 7, 'decisions': {'keep': 7, 'revise': 0, 'split_review': 0, 'block': 0}, 'evidenceProfileRecommendations': {'create': 7}, 'peerAInputsRead': False, 'nativeDBComplete': True, 'otherDRoundsAssessed': False, 'independentPComplete': False, 'newNativeA_MLedgerApprovalClaimed': False, 'separateIndependentVRetained': True, 'wholeSourceClearance': False, 'newGUIIntegration': False, 'activeWrites': 0, 'strictNetGain': 0, 'humanApproval': False, 'humanTrial': False, 'publicationOrDeployment': False, 'actualAGENTSPolicyMatchesAuthorCurrentPolicyHash': True, 'externalGeminiAGENTSChange': 'Unrelated external fbc4e2bc5 Gemini guidance addition was separately documented in the retained source-review v8 follow-up and common author policy artifact; historical freezes untouched.'}
(OWN / name).write_text(json.dumps(out, ensure_ascii=False, indent=2) + '\n')
print(str((OWN / name).relative_to(ROOT)))
print(sha((OWN / name).read_bytes()))
print('actual input count', len(out['actualInputs']), 'own output count', len(own_outputs))
