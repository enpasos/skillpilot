# Apache-2.0. Seal technical author proposals; does not approve source science.
from pathlib import Path
import datetime, hashlib, importlib.util, json, os, subprocess

R = Path('/home/enpasos/projects/skillpilot')
F = R / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-f947-bounded-source-route-remediation-author-20261013-v9'
X = R / 'tmp/chemie-f947-source-author-overlay-20261013-v9'
G = 'f947cd04-952a-5a9d-9445-3ffc70e02c3c'
rd = lambda p: json.loads(p.read_text())
h = lambda p: 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()
rp = lambda p: str(p.relative_to(R))
bind = lambda p: {'path': rp(p), 'sha256': h(p), 'bytes': p.stat().st_size}

def write(path, value):
    assert path.is_relative_to(F)
    parent = R
    for part in path.relative_to(R).parts[:-1]:
        parent = parent / part
        assert parent.exists() and parent.is_dir() and not parent.is_symlink(), parent
    assert not path.is_symlink(), path
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

plan = rd(F / 'SOURCE_ROUTE_PLAN.only-f947-components-author-pending.json')
assert h(R / plan['currentCanonical']['path']) == plan['currentCanonical']['sha256']
assert plan['newScientificCompletion'] == 0 and not plan['independentSourceApproval']
assert len(plan['authorProposedSourceChanges']) == 23
assert plan['selectedSourceReviewSuccessors'] == 10
for item in plan['authorProposedSourceChanges']:
    original = R / item['originalLiveBinding']['path']
    archive = R / item['originalByteExactOwnedArchive']['path']
    candidate = R / item['authorCandidateBinding']['path']
    assert h(original) == item['originalLiveBinding']['sha256'] == h(archive)
    assert original.read_bytes() == archive.read_bytes()
    assert h(candidate) == item['authorCandidateBinding']['sha256']
    old, new = rd(original), rd(candidate)
    expected = json.loads(json.dumps(old))
    removed = item['removedOnlyFalseF947FlatRows']
    expected['mappings'] = [row for row in expected['mappings'] if row not in removed]
    for row in expected.get('decisions', []):
        if row['sourceGoalId'] in item['changedOnlyF947DecisionComponents']:
            row['canonicalGoalIds'] = [id for id in row['canonicalGoalIds'] if id != G]
    assert new == expected, original
    assert not (R / item['proposedFutureLivePath']).exists()
    assert not (R / item['proposedFutureArchivePath']).exists()

audit = rd(F / 'inputs/original-independentA-34-row-source-finding.exact.json')
assert len(audit['rows']) == 34
source_bindings = {}
for row in audit['rows']:
    sources = [row['extractionBinding'], *row.get('actualCurrentSourceExtractions', [])]
    for b in sources:
        assert h(R / b['path']) == b['sha256'], b['path']
        source_bindings[b['path']] = {'path': b['path'], 'sha256': b['sha256']}
primary_bindings = rd(F / 'inputs/current-source-atlas-config.raw-exact.json')['sourceDocumentSnapshots']
for b in primary_bindings:
    assert h(R / b['path']) == b['sha256'], b['path']
inventory = rd(F / 'source/all-active-flat-aliases39-direct82.author-inventory.json')
for b in [item['mappingBinding'] for item in inventory['records']]:
    assert h(R / b['path']) == b['sha256'], b['path']
assert inventory['affectedFiles'] == 23 and inventory['falseDirectFlatRowsToRemove'] == 51
assert inventory['legacyDifferentHEIdRetained']['wholeSourceGoal']['id'] == 'c6d28506-6412-4ce8-9b4f-f1b451a73a18'
b = inventory['legacyDifferentHEIdRetained']['sourceSnapshot']
assert h(R / b['path']) == b['sha256']
source_bindings[b['path']] = b

ledger_path = R / 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
committed = subprocess.check_output(['git', 'show', 'HEAD:' + rp(ledger_path)], cwd=R)
assert ledger_path.read_bytes() == committed
assert rd(F / 'checks/overlay-ledger-isolation-leak-and-private-parent-repair.actual.json')['noActiveWritesClaimForEarlierRunWithdrawn']
private_parents = []
for path in [X / 'curricula/DE/Gymnasium/quality', X / 'curricula/DE/Gymnasium/quality/goal-book-publication']:
    parent = X
    for part in path.relative_to(X).parts:
        parent = parent / part
        assert parent.exists() and parent.is_dir() and not parent.is_symlink(), parent
    private_parents.append(rp(path))
private_files = list((X / 'curricula/DE/Gymnasium/quality/goal-book-publication').iterdir())
assert private_files and all(p.is_file() and not p.is_symlink() for p in private_files)

transport = rd(F / 'checks/historical-transport40-private-regular-byte-exact-prospective.actual.json')
assert transport['prospectiveRegularInputFileCount'] == 40
for record in transport['records']:
    path = R / record['historicalInputPathUnchanged']
    private = R / record['actualPrivateCopyPath']
    assert path.is_symlink() and os.readlink(path) == record['currentHistoricalLinkTarget']
    assert h(path) == record['expectedHistoricalContentSha256'] == h(private)
    assert private.is_file() and not private.is_symlink()
for key in ['economicsMemoryConfigBinding', 'currentQualityReportBinding']:
    b = transport[key]
    assert h(R / b['path']) == b['sha256']

ap = rd(F / 'checks/unmodified-applicability-compiler-overlay-three-stage.actual.json')
assert ap['changedCompiledGoalIds'] == [G] and ap['allOther522CompiledScopesExact']
assert ap['finalDerivedEightScopeF947']['compiledApplicability']['jurisdiction'] == ['DE-BW', 'DE-BY', 'DE-HB', 'DE-HE', 'DE-HH', 'DE-RP', 'DE-SH', 'DE-TH']
atlas = rd(F / 'checks/source-atlas-bounded-single-goal-and-other401-component-retention.actual.json')
assert atlas['normalBaselineCounts'] == atlas['normalAuthorCandidateCounts']
assert atlas['allNonF947ScopesAndWitnessComponentsExactAfterDeclaredPathTranslation']
contexts = rd(F / 'checks/current401-protected231-and-one-D-context-impact.actual.json')
assert contexts['changedWholeCanonicalGoalIds'] == [G]
assert contexts['changedNormalFull402Pages'] == []
assert contexts['changedCanonicalDContexts'] == [G]
assert contexts['unchangedProtected231WholePages'] and contexts['verifiedProtectedActiveRegistryInputBindings'] == 214
for b in contexts['normalModuleBindings'] + ap['productionAndExecutedModuleBytesExact']:
    expected = b.get('sha256') or b['productionSha256']
    assert h(R / b['path']) == expected
    if 'executedSha256' in b:
        assert h(X / b['path']) == expected == b['executedSha256']

report = rd(R / 'docs/qa-ci/status/curriculum-quality-status.json')
protected_maturity = {s['subject']: s['maturity'] for s in report['curricula'] if s['subject'] in ['Mathematik', 'Physik', 'Biologie', 'Wirtschaftswissenschaften', 'Chemie']}
assert all(protected_maturity[s] == 'M7' for s in ['Mathematik', 'Physik', 'Biologie', 'Wirtschaftswissenschaften'])
assert protected_maturity['Chemie'] == 'M6'
spec = importlib.util.spec_from_file_location('validate_schemas_stock', R / 'scripts/validate_schemas.py')
module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
symlink_errors = module.curriculum_symlink_errors(str(R))
assert symlink_errors == [], symlink_errors
owned_files = [p for p in F.rglob('*') if p.is_file()]
assert not any(p.is_symlink() for p in F.rglob('*'))
parsed = 0
for path in owned_files:
    if path.suffix == '.json': rd(path); parsed += 1
    elif path.suffix == '.jsonl':
        for line in path.read_text().splitlines():
            if line.strip(): json.loads(line)

write(F / 'checks/final-own-input-cas-parse-symlinks-and-restoration.actual.json', {
    'schemaVersion': 1, 'verifiedAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'canonicalBaseline': plan['currentCanonical'], 'currentChemistryCurricularAtomicCount': 402,
    'protectedStrictCompletions': 231, 'allOriginal39ActiveFlatMappingBindingsExact': True,
    'all23OwnedOldAliasArchivesExactOriginalBytes': True, 'all23CurrentSuccessorsChangeOnlyFalseF947Components': True,
    'selectedSourceReviewSuccessors': 10, 'falseDirectFlatComponentsRemovedInCandidateOnly': 51,
    'selectedSourceExtractionAndSnapshotBindingsUnchanged': list(source_bindings.values()),
    'unchangedPrimarySourceDocumentBindings': primary_bindings,
    'prospective40HistoricalRegularFilesSamePathsAndBytes': True,
    'protectedCurrentMaturity': protected_maturity, 'normalCurriculumSymlinkErrors': symlink_errors,
    'ownedJsonFilesParsed': parsed, 'ownedRootContainsNoSymlinks': True,
    'privateMutableParentChainsVerified': private_parents, 'privatePublicationRegularFileCount': len(private_files),
    'activeSemanticLedgerExactHEAD': bind(ledger_path),
    'briefUnintendedActiveSemanticLedgerWriteDisclosedAndRestoredByRoot': True,
    'activeCanonicalSourceMappingRegistryQaGitWritesByThisAgent': False,
    'newStrictCompletions': 0, 'newIndependentScientificVotes': 0, 'humanApproval': False,
})
print(json.dumps({'allOwnedCasAndJsonPass': True, 'normalGlobalCurriculumSymlinksPass': True,
                  'historicalTransport40PreservesExactBytes': True, 'protected231Exact': True,
                  'mutableParentChainsPrivate': True, 'activeSemanticLedgerRestoredExact': True,
                  'strictScientificGain': 0}))
