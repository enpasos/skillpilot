#!/usr/bin/env python3
"""Bind this review's separately sealed scientific FIRST using unchanged stock tools."""
import datetime
import hashlib
import json
from pathlib import Path
import subprocess

REPO = Path(__file__).resolve().parents[7]
OWN = Path(__file__).resolve().parent
BASE = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15')
SOURCE = BASE / 'chemie-carbonyl15-current422-native-preparation-technical-20261015-v1'
HOST_REL = Path('tmp/chemie-m7-resumed-20261015/carbonyl15-informed-pa-b-host-v1')
HOST = REPO / HOST_REL
LANDSCAPE = BASE / 'chemie-energy-three-wording-four-alt-bounded-author-root-20261015-v1/candidate/canonical560.current422.three-wording-four-alt.author.json'
SEMANTIC = BASE / 'chemie-energy-four-final-contexts-native-preparation-technical-20261015-v1/candidate/semantic560.three-description-source-bindings.json'
CRITERIA = Path('curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md')

def digest(data):
    return 'sha256:' + hashlib.sha256(data).hexdigest()

def dump(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def load(path):
    return json.loads(path.read_text())

def main():
    own_rel = OWN.relative_to(REPO)
    first_path = OWN / 'PA.FIRST.independent-informed-science.json'
    first_seal = load(OWN / 'PA.FIRST.seal.json')
    first = load(first_path)
    # A prior separate scientific seal must exist before serialization or fingerprinting.
    assert digest(first_path.read_bytes()).removeprefix('sha256:') in json.dumps(first_seal)
    judgments = first['judgments']
    ids = [j['goalId'] for j in judgments]
    assert len(ids) == len(set(ids)) == 15
    assert sum(len(j['caseReviews']) for j in judgments) == 30
    assert all(j['profileDecision'] == 'KEEP' and j['atomicityDecision'] == 'atomic' for j in judgments)
    profiles = load(REPO / SOURCE / 'blind-scientific-inputs/fifteen-current-E0G0-scientific-profiles.json')
    profile_map = {p['goalId']: p['profile'] for p in profiles['profiles']}
    assets = load(REPO / SOURCE / 'blind-scientific-inputs/fifteen-current-unchanged-image-bodies.json')['assets']
    assert len(assets) == 15

    # Narrow physical execution capsule, no active-public or previous-host writes.
    physical_paths = [
        'app/package.json', 'app/src/landscapeTypes.ts',
        'app/scripts/materializePositiveGoalEvidenceCandidates.ts',
        'app/scripts/positiveGoalEvidenceReview.ts',
        'app/scripts/positiveGoalEvidenceProfileModel.ts',
        'app/scripts/goalEvidenceProfileModel.ts',
        'app/scripts/semanticAtomicityReview.ts',
        'contracts/goal-evidence/v2/goal-evidence-profile.schema.json',
        'contracts/goal-evidence/v2/goal-evidence-review-config.schema.json',
        'contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
        str(LANDSCAPE), str(SEMANTIC), str(CRITERIA),
    ]
    physical = []
    for rel in physical_paths:
        src = REPO / rel
        dst = HOST / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        data = src.read_bytes()
        if dst.exists():
            assert dst.read_bytes() == data, rel
        else:
            dst.write_bytes(data)
        physical.append({'path': rel, 'sha256': digest(data), 'bytes': len(data)})
    assert next(p['sha256'] for p in physical if p['path'] == str(LANDSCAPE)) == 'sha256:e36d631c46c019466478d2f4a900ae0b5161d52b52e85bb6e701aadf7ee90545'
    assert next(p['sha256'] for p in physical if p['path'] == str(SEMANTIC)) == 'sha256:3fd88d8d1e7414fe655972247451fe03cc81bc207f5e391e6e17f74c407fab8c'
    image_copies = []
    for asset in assets:
        src = REPO / asset['physicalRepositorySource']['path']
        data = src.read_bytes()
        assert digest(data) == asset['physicalRepositorySource']['sha256']
        assert len(data) == asset['physicalRepositorySource']['bytes']
        dst = HOST / asset['normalPublicDestination']
        dst.parent.mkdir(parents=True, exist_ok=True)
        if dst.exists():
            assert dst.read_bytes() == data
        else:
            dst.write_bytes(data)
        image_copies.append({'goalId': asset['goalId'], 'source': asset['physicalRepositorySource'], 'physicalHostDestination': asset['normalPublicDestination']})
    modules = HOST / 'app/node_modules'
    if not modules.exists():
        modules.symlink_to(REPO / 'app/node_modules', target_is_directory=True)
    own_alias = HOST / own_rel
    own_alias.parent.mkdir(parents=True, exist_ok=True)
    if not own_alias.exists():
        own_alias.symlink_to(OWN, target_is_directory=True)
    assert own_alias.resolve() == OWN
    dump(OWN / 'REBUILD.PA.sparse-stock-host.json', {
        'schemaVersion': 1, 'role': 'Stock P/A binding capsule for own separately sealed scientific FIRST only',
        'executionHost': str(HOST_REL), 'physicalInputs': physical, 'physicalSelectedImages': image_copies,
        'stockModuleChanges': 0, 'fullTreeCopies': 0, 'hardlinks': 0, 'activePublicWrites': 0,
        'symlinks': [{'path': 'app/node_modules', 'role': 'unchanged dependency runtime', 'target': 'app/node_modules'}, {'path': str(own_rel), 'role': 'own authorized output root', 'target': str(own_rel)}],
        'unselectedPublicImageCopies': 0,
    })

    reviewed_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
    review_id = 'chemie-carbonyl15-current422-informed-positive-profile-b-20261015-v1'
    reviewer = 'Independent informed targeted P/A reviewer B; AI candidate after separately sealed own D review'
    config = {
        '$schema': 'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',
        'schemaVersion': 2, 'reviewId': review_id,
        'goalFingerprintRuleVersion': 'goal-evidence-v1', 'profileRuleVersion': 'positive-understanding-evidence-v2',
        'landscapeId': 'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0', 'landscapePath': str(LANDSCAPE),
        'semanticKindLedgerPath': str(SEMANTIC), 'reviewCriteriaPath': str(CRITERIA),
        'reviewPath': str(own_rel / 'P15.current-E1G1.ai-candidate.jsonl'),
        'reviewedResourceTypes': ['goal-visualization'], 'requireApproved': False,
        'scope': {'label': 'Exactly15 current unchanged carbonyl/pharmacy profiles, informed independent B', 'goalIds': ids},
    }
    candidate = {
        'schemaVersion': 1, 'authoringContract': 'positive-understanding-evidence-candidates-v1',
        'reviewId': review_id, 'reviewedAt': reviewed_at, 'reviewer': reviewer,
        'goals': [{
            'goalId': j['goalId'],
            'reason': j['profileReasonDe'] + ' Transfer: ' + j['meaningfulTransferDe'] + ' Operatoren: ' + j['operatorCoverageDe'] + ' Vollständige Prüfung beider DE/EN-Fälle und Rubriken: PA.FIRST.independent-informed-science.json, Ziel ' + str(j['ordinal']) + '.',
            'evidenceLevel': 'E1', 'maximumClaimScope': 'G1', 'dissent': j['dissent'],
            'profile': profile_map[j['goalId']],
        } for j in judgments],
    }
    assert all(len(g['reason']) <= 2000 for g in candidate['goals'])
    dump(OWN / 'P15.config.json', config)
    dump(OWN / 'P15.candidates.json', candidate)
    a_config = {
        'schemaVersion': 1, 'reviewId': 'chemie-carbonyl15-current422-informed-semantic-atomicity-b-20261015-v1',
        'ruleVersion': 'semantic-atomicity-v1', 'landscapeId': config['landscapeId'],
        'landscapePath': str(LANDSCAPE), 'reviewPath': str(own_rel / 'A15.current-semantic-atomicity.ai-candidate.jsonl'),
        'scope': {'label': 'Exactly15 current carbonyl/pharmacy competencies, informed independent semantic atomicity review B', 'leafGoalIds': ids},
    }
    dump(OWN / 'A15.config.json', a_config)
    a_records = [{
        'schemaVersion': 1, 'reviewId': a_config['reviewId'], 'ruleVersion': a_config['ruleVersion'],
        'landscapeId': a_config['landscapeId'], 'goalId': j['goalId'],
        'fingerprint': 'pending-stock-first-initial-binding', 'status': j['atomicityDecision'],
        'semanticAtomic': j['semanticAtomic'], 'reviewedAt': reviewed_at, 'reviewer': reviewer,
        'reason': j['atomicityReasonDe'] + ' Begründung und30 gezielt zugeordnete Fallprüfungen im getrennt vor Bindung versiegelten PA.FIRST; keine Quellenmapping-Vollabdeckung oder beobachtete Lernwirkung behauptet.',
    } for j in judgments]
    (OWN / 'A15.current-semantic-atomicity.ai-candidate.jsonl').write_text(''.join(json.dumps(row, ensure_ascii=False) + '\n' for row in a_records))
    commands = [
        ('P15.materialize', ['app/scripts/materializePositiveGoalEvidenceCandidates.ts', '--config', str(own_rel / 'P15.config.json'), '--candidates', str(own_rel / 'P15.candidates.json'), '--write']),
        ('P15.verify', ['app/scripts/materializePositiveGoalEvidenceCandidates.ts', '--config', str(own_rel / 'P15.config.json'), '--candidates', str(own_rel / 'P15.candidates.json')]),
        ('P15.check', ['app/scripts/positiveGoalEvidenceReview.ts', '--config=' + str(own_rel / 'P15.config.json'), '--mode=check']),
        ('A15.initial-stock-fingerprints', ['app/scripts/semanticAtomicityReview.ts', '--config=' + str(own_rel / 'A15.config.json'), '--write-fingerprints']),
        ('A15.check', ['app/scripts/semanticAtomicityReview.ts', '--config=' + str(own_rel / 'A15.config.json'), '--mode=check']),
    ]
    receipts = []
    for name, args in commands:
        command = [str(HOST / 'app/node_modules/.bin/tsx'), str(HOST / args[0]), *args[1:]]
        started = datetime.datetime.now(datetime.timezone.utc).isoformat()
        result = subprocess.run(command, cwd=HOST, capture_output=True, text=True)
        log = 'CHECK.stock-' + name + '.actual.txt'
        (OWN / log).write_text(result.stdout + result.stderr)
        receipts.append({'name': name, 'argv': command, 'cwd': str(HOST_REL), 'startedAt': started, 'completedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'exitCode': result.returncode, 'actualOutputPath': str(own_rel / log), 'actualOutputSha256': digest((OWN / log).read_bytes())})
        dump(OWN / 'CHECK.stock-PA.actual.receipts.json', {'schemaVersion': 1, 'separateFirstSha256': digest(first_path.read_bytes()), 'unchangedStockModules': physical, 'commands': receipts})
        print(name, 'exit', result.returncode, result.stdout.strip(), result.stderr.strip())
        if result.returncode:
            raise SystemExit(result.returncode)

if __name__ == '__main__':
    main()
