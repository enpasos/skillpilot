# Apache-2.0. Technical dependency only; historical bytes and reviews unchanged.
from pathlib import Path
import hashlib, json, os, shutil, subprocess
R = Path('/home/enpasos/projects/skillpilot')
F = R / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-f947-bounded-source-route-remediation-author-20261013-v9'
X = R / 'tmp/chemie-f947-source-author-overlay-20261013-v9'
rd = lambda p: json.loads(p.read_text())
h = lambda p: 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()
rp = lambda p: str(p.relative_to(R))
impact = rd(F / 'checks/tracked-symlink-history-reference-impact.actual.json')
plan = rd(F / 'SOURCE_ROUTE_PLAN.only-f947-components-author-pending.json')
source_by_original = {item['originalLiveBinding']['path']: item for item in plan['authorProposedSourceChanges']}
registry_path = R / 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
econ = next(s for s in rd(registry_path)['subjects'] if s['subject'] == 'wirtschaftswissenschaften')
econ_config_before = json.dumps(econ, ensure_ascii=False, sort_keys=True)
report_path = R / 'docs/qa-ci/status/curriculum-quality-status.json'
econ_reports_before = report_path.read_bytes()
econ_memory_before = (R / econ['memoryReviewConfigPath']).read_bytes()

def private_parent(path):
    current = X
    for part in path.relative_to(X).parts:
        current = current / part
        if current.is_symlink():
            original = current.resolve(strict=True)
            assert original.is_dir(), current
            current.unlink()
            current.mkdir()
            for child in original.iterdir():
                (current / child.name).symlink_to(child, target_is_directory=child.is_dir())
        elif not current.exists(): current.mkdir()
        assert current.is_dir() and not current.is_symlink(), current

records = []
assert impact['count'] == 40
for entry in impact['committedSymlinksToProposedRetiredAliasFiles']:
    original_link = R / entry['link']
    assert original_link.is_symlink()
    original_bytes = original_link.read_bytes()
    source = source_by_original[entry['originalMappingTarget']]
    candidate_source = R / source['originalByteExactOwnedArchive']['path']
    assert candidate_source.read_bytes() == original_bytes
    target = X / entry['link']
    private_parent(target.parent)
    if target.is_symlink() or target.exists(): target.unlink()
    target.write_bytes(original_bytes)
    assert not target.is_symlink() and target.resolve().is_relative_to(X)
    assert target.read_bytes() == original_bytes
    records.append({'historicalInputPathUnchanged': entry['link'], 'currentHistoricalLinkTarget': os.readlink(original_link),
                    'proposedRegularFileSource': source['originalByteExactOwnedArchive'],
                    'expectedHistoricalContentSha256': h(original_link), 'privateFutureRegularFileSha256': h(target),
                    'actualPrivateCopyPath': rp(target), 'sameOriginalBytesAndReadableJson': rd(target) == rd(original_link),
                    'oldSourceAliasToRetire': entry['originalMappingTarget'],
                    'originalHistoryPathAndScientificRecordsUnmodified': True})
assert econ_config_before == json.dumps(next(s for s in rd(registry_path)['subjects'] if s['subject'] == 'wirtschaftswissenschaften'), ensure_ascii=False, sort_keys=True)
assert report_path.read_bytes() == econ_reports_before
assert (R / econ['memoryReviewConfigPath']).read_bytes() == econ_memory_before
live = R / 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
committed = subprocess.check_output(['git', 'show', 'HEAD:curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'], cwd=R)
assert live.read_bytes() == committed
output = {'schemaVersion': 1, 'role': 'Necessary technical archival transport prerequisite for Chemistry source cleanup; no Economic curriculum review',
          'prospectiveRegularInputFileCount': 40, 'unchangedHistoricalInputPathsAndContentDigests': True,
          'allPrivateProspectiveRegularJsonCopiesVerified': True, 'originalReviewAndPerGoalContextBytesNotChanged': True,
          'currentEconomicsRegistryConfigUnchanged': True, 'economicsMemoryConfigBinding': {'path': econ['memoryReviewConfigPath'], 'sha256': h(R / econ['memoryReviewConfigPath'])},
          'currentEconomicsQualityReportUnchanged': True, 'currentQualityReportBinding': {'path': rp(report_path), 'sha256': h(report_path)},
          'activeSemanticLedgerRootRestorationExactHEADVerified': True,
          'safeFutureApplicationOrder': ['Recheck all40 historical input content hashes and all23 original active alias hashes.',
                                         'Before retiring aliases, materialize the40 historical inputs at their unchanged paths as regular exact-original files using the owned archival bytes.',
                                         'Verify unchanged original source/goal/record digests and committable links; document transport repair separately from scientific closures.',
                                         'Only after independent final F947 source acceptance, archive23 old active alias versions byte-exact and install the proposed current successors.',
                                         'Apply only reviewed F947 boundary/scope metadata, rebuild affected normal source/Layer A checks and preserve protected M7 floors.'],
          'historicalOrActiveRepositoryWritesByTransportCheck': False, 'newScientificOrEconomicVotes': 0,
          'genericHBAndSHIndependentJudgmentStillPending': True, 'records': records}
(F / 'checks/historical-transport40-private-regular-byte-exact-prospective.actual.json').write_text(json.dumps(output, ensure_ascii=False, indent=2)+'\n')
print(json.dumps({'futureRegularFiles40': True, 'allHistoricalBytesAndPathsPreserved': True, 'economicsConfigAndReportUnchanged': True, 'sourceCleanupPrerequisiteOnly': True, 'repositoryHistoryOrActiveWrites': False}))
