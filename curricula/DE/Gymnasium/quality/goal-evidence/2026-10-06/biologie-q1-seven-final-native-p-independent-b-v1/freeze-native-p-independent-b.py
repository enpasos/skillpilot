#!/usr/bin/env python3
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
OWN = Path(__file__).resolve().parent
name = 'native-p-independent-b.final.freeze.json'
assert not (OWN / name).exists(), 'Immutable final freeze'
sha = lambda data: hashlib.sha256(data).hexdigest()
review = json.loads((OWN / 'seven-native-positive-profiles.independent-b.review.json').read_text())
inputs = review['allActualInputs']
extras = ['AGENTS.md', 'app/scripts/positiveGoalEvidenceProfileModel.ts', 'app/scripts/goalEvidenceProfileModel.ts', 'app/scripts/positiveGoalEvidenceReview.ts', 'app/scripts/materializePositiveGoalEvidenceCandidates.ts', 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-seven-final-native-d-independent-b-v1/native-d-independent-b.final.freeze.json', 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-seven-reviewed-integration-independent-b-v1/targeted-integration-independent-b.final.freeze.json']
for path in extras:
    data = (ROOT / path).read_bytes()
    inputs.append({'path': path, 'sha256': 'sha256:' + sha(data), 'bytes': len(data)})
for binding in inputs:
    data = (ROOT / binding['path']).read_bytes()
    assert 'sha256:' + sha(data) == binding['sha256'] and len(data) == binding['bytes'], binding['path']
full = json.loads((OWN / 'unchanged-native-positive-full-check.actual.json').read_text())
assert full['actualExitCode'] == 1 and review['unchangedNativeFullChecker']['expectedMissingActiveImageConsequencesOnly']
assert len(review['unchangedNativeFullChecker']['errors']) == 14
outputs = []
for path in sorted(OWN.rglob('*')):
    if path.is_file():
        data = path.read_bytes()
        outputs.append({'path': str(path.relative_to(OWN)), 'sha256': sha(data), 'bytes': len(data)})
out = {'schemaVersion': 1, 'createdAtUTC': datetime.now(timezone.utc).isoformat(), 'role': 'actual independent B native P scientific review, all seven full profiles and all sixteen complete bilingual case payloads personally read', 'actualInputs': sorted({r['path']: r for r in inputs}.values(), key=lambda r: r['path']), 'ownOutputs': outputs, 'decisions': {'keep': 7, 'revise': 0, 'block': 0}, 'nativeClosedSchemaAndActualPNGGoalProfileInputSemantics': 'PASS7', 'nativeFullCheckerActualExitCode': 1, 'nativeFullCheckerTechnicalHolds': {'missingActivePublicImage': 7, 'consequentMissingResourceReviewInputBinding': 7}, 'fullActiveBindingGateApproved': False, 'scientificPBReviewComplete': True, 'otherPReviewRead': False, 'nativeRecordStatus': 'needs_human_review', 'nativeAuthority': 'ai_candidate', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1', 'wholeSourceClearance': False, 'activeWrites': False, 'strictNetGain': 0, 'humanApproval': False, 'humanTrial': False, 'learnerEvidence': False, 'publicationOrDeployment': False}
(OWN / name).write_text(json.dumps(out, ensure_ascii=False, indent=2) + '\n')
print(str((OWN / name).relative_to(ROOT)))
print(sha((OWN / name).read_bytes()))
print('inputs', len(out['actualInputs']), 'outputs', len(outputs))
