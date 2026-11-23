#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Reproduce the exact HE pilot delta without rewriting historical authority."""
import hashlib
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[4]
sys.path.insert(0, str(ROOT / 'scripts'))
import test_generate_laender_physics_stage_views as checks


def sha(content):
    return hashlib.sha256(content).hexdigest()


def goal_set_sha(goals):
    return sha(('\n'.join(sorted(goals)) + '\n').encode())


def main():
    baseline_path = 'scripts/generate_laender_physics_stage_views.memberships.json'
    baseline_bytes = (ROOT / baseline_path).read_bytes()
    baseline_sha = sha(baseline_bytes)
    if baseline_sha != '8bedc843bf130a9eebb1ef9df941a9ba5fc9731c628ff672624a6c2df3cf7ebd':
        raise ValueError('The historical source authority changed')
    authorities = json.loads(baseline_bytes)['authorities']
    rows, checked_authorities, seen = [], 0, set()
    paths = sorted(checks.authoring.DIRECTORY.glob('*.view.json'))
    for path in paths:
        view = json.loads(path.read_bytes())
        roles = checks.authoring.graph.role_atoms(view)
        delta = checks.measurement_delta(view, roles)
        baseline = authorities.get(view['viewId'])
        if baseline is not None:
            retained = checks.retained_authority_seeds(view, roles, baseline)
            checked_authorities += 1
        if delta:
            if baseline is None:
                raise ValueError('A pilot view lost its historical authority')
            seen.add(view['viewId'])
            rows.append(dict(viewId=view['viewId'], path=str(path.relative_to(ROOT)),
                sourceSha256=sha(path.read_bytes()), scope=view['scope'],
                addedTargetGoalIds=sorted(delta), currentTargetCount=len(roles['target']),
                previouslyReviewedTargetAdditions=len(roles['target']) - len(retained) - len(delta),
                retainedSourceSeedCount=len(retained), retainedSourceSeedSha256=goal_set_sha(retained),
                historicalSourceSeedCount=baseline['selectedAtomicCount'],
                historicalSourceSeedSha256=baseline['selectedAtomicSha256'],
                historicalSupportCount=len(baseline['prerequisiteOnlyAtomicGoalIds']),
                currentSupportCount=len(roles['prerequisiteOnly']),
                allHistoricalSupportRolesPreserved=True))
    if seen != checks.HESSEN_MEASUREMENT_VIEWS or len(paths) != 90 or checked_authorities != 75:
        raise ValueError('The complete view/authority inventory was not checked')
    physics_path = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
    test_path = 'scripts/test_generate_laender_physics_stage_views.py'
    print(json.dumps(dict(status='PASS', evidenceKind='automated-current-seed-and-role-check',
        limits='Technical acceptance of the exact own-authoring delta; this neither rewrites official source authority nor grants learner results.',
        reproduce='python3 -B ' + str(Path(__file__).resolve().relative_to(ROOT)),
        historicalAuthority=dict(path=baseline_path, sha256=baseline_sha, unchanged=True),
        currentPhysics=dict(path=physics_path, sha256=sha((ROOT / physics_path).read_bytes())),
        gate=dict(path=test_path, sha256=sha((ROOT / test_path).read_bytes())),
        exactAddedGoalIds=sorted(checks.HESSEN_MEASUREMENT_GOALS),
        exactAuthorizedViewIds=sorted(checks.HESSEN_MEASUREMENT_VIEWS),
        checkedViews=len(paths), checkedHistoricalAuthorities=checked_authorities,
        viewsWithoutMeasurementDelta=len(paths) - len(rows), targetPairs=sum(len(row['addedTargetGoalIds']) for row in rows),
        supportOccurrencesOfAddedGoals=0, rows=rows), ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
