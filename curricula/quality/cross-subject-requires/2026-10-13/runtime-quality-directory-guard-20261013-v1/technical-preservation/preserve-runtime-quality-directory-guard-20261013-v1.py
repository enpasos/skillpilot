# Apache-2.0: additive exact preservation before authorized integration.
from pathlib import Path
from datetime import datetime, timezone
import collections
import hashlib
import json
import shutil

REPO = Path('/home/enpasos/projects/skillpilot')
BASE = REPO / 'tmp/cross-subject-requires/runtime-quality-directory-guard-20261013'
REPLAY = REPO / 'tmp/cross-subject-requires/runtime-quality-guard-independent-evidence-20261013-ewb9jbjo'
DEST = REPO / 'curricula/quality/cross-subject-requires/2026-10-13/runtime-quality-directory-guard-20261013-v1'
MAIN = REPO / 'tmp/cross-subject-requires/runtime-quality-directory-guard.independent-code-review-20261013-v1.json'

def rel(p):
    return str(p.relative_to(REPO))

def sha(p):
    return 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()

def binding(p):
    return {'path': rel(p), 'sha256': sha(p), 'byteLength': p.stat().st_size}

def check(row):
    p = REPO / row['path']
    assert sha(p) == row['sha256'] and p.stat().st_size == row['byteLength'], p

index_path = BASE / 'author-candidate.index.json'
assert sha(index_path) == 'sha256:c33c348ef55a98e989b5ab245f197114c776489096151ab6f7993be4b62367f6'
assert sha(MAIN) == 'sha256:59bb1b732f86c668e77e5e1aef1b272f79e92e0c063ca34b000e70677183bf45'
evidence_path = REPLAY / 'test-compile-execution.independent-review-v1.json'
assert sha(evidence_path) == 'sha256:62c089449edef30530947396d0f5838eba67f5849fab2dd4b21a7466990bb3cd'
author = json.loads(index_path.read_bytes())
evidence = json.loads(evidence_path.read_bytes())
main = json.loads(MAIN.read_bytes())
original_inputs = json.loads((BASE / 'original-inputs.sha256.json').read_bytes())['files']
production = json.loads((BASE / 'isolated-source-baseline.sha256.json').read_bytes())['files']
for row in original_inputs + production:
    check(row)
assert len(original_inputs) == 14 and len(production) == 444

author_files = {index_path}
for row in list(author['entryPoints'].values()) + author['candidateBindings'] + author['actualTestResultBindings'] + author['actualCompiledClassBindings']:
    check(row)
    author_files.add(REPO / row['path'])
for row in original_inputs:
    p = BASE / 'original' / row['path']
    assert sha(p) == row['sha256'] and p.stat().st_size == row['byteLength']
    author_files.add(p)
for variant in ['candidate', 'original-control']:
    for name in ['CurriculumDirectoryScanTest', 'PrunedFileTreeTest']:
        author_files.add(BASE / f'build-{variant}/classes/java/test/com/skillpilot/backend/landscape/{name}.class')

review_files = {MAIN, REPO / 'tmp/cross-subject-requires/seal-runtime-quality-directory-guard-independent-review-20261013-v1.py', evidence_path}
for row in [evidence['preReplayBindingReceipt'], evidence['auditSealHelper'], evidence['freshReplay']['runner'], evidence['freshReplay']['initScript'], evidence['freshReplay']['executionRecord'], *evidence['freshReplay']['logs']]:
    check(row)
    review_files.add(REPO / row['path'])
for suites in evidence['freshReplay']['suites'].values():
    for suite in suites:
        check(suite['xml'])
        review_files.add(REPO / suite['xml']['path'])
for pair in evidence['freshReplay']['classReproductionFromFreshCompilation']:
    check(pair['first'])
    check(pair['second'])
    assert (REPO / pair['first']['path']).read_bytes() == (REPO / pair['second']['path']).read_bytes()
    review_files.add(REPO / pair['second']['path'])
assert len(author_files) == 38, len(author_files)
assert len(review_files) == 19, len(review_files)

rows = []
def copy(p, dest, group):
    data = p.read_bytes()
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists():
        assert dest.read_bytes() == data, dest
    else:
        shutil.copy2(p, dest)
    assert dest.read_bytes() == data
    rows.append({'originalPath': rel(p), 'storedPath': rel(dest), 'sha256': sha(p),
                 'bytes': len(data), 'provenanceGroup': group,
                 'licenseBoundary': 'Apache-2.0 for own technical code/test/review/verification; existing supplied dependency or source notices retain their original rights.'})
for p in sorted(author_files):
    copy(p, DEST / 'author-originals' / p.relative_to(BASE), 'author-original')
for p in sorted(review_files):
    tail = p.relative_to(REPLAY) if p.is_relative_to(REPLAY) else p.name
    copy(p, DEST / 'independent-review-originals' / tail, 'independent-review-original')
for name in ['LICENSE', 'LICENSING.md', 'LICENSES/CC-BY-4.0.txt']:
    copy(REPO / name, DEST / 'licensing-boundaries' / name, 'existing-license-scope-original')
helper = Path(__file__)
copy(helper, DEST / 'technical-preservation' / helper.name, 'new-technical-preservation-helper')
for row in original_inputs + production:
    check(row)
for row in rows:
    p = REPO / row['storedPath']
    assert sha(p) == row['sha256'] and p.stat().st_size == row['bytes']
counts = collections.Counter(row['provenanceGroup'] for row in rows)
out = DEST / 'artifact-index.preservation-v1.json'
receipt = {
    'schemaVersion': 1, 'artifactId': 'runtime-quality-directory-guard-exact-preservation-20261013-v1',
    'recordedAt': datetime.now(timezone.utc).isoformat(),
    'preserverAgent': '/root/requires_parallel_review',
    'statusAtSeal': 'approved_exact_code_candidate_preserved_before_authorized_application',
    'artifacts': rows,
    'originalFileCount': sum(v for k, v in counts.items() if k != 'new-technical-preservation-helper'),
    'originalFilesByGroup': dict(counts),
    'originalBytes': sum(row['bytes'] for row in rows if row['provenanceGroup'] != 'new-technical-preservation-helper'),
    'totalIndexedFilesIncludingNewHelper': len(rows),
    'originalAuthorManifest': binding(index_path), 'exactApprovedPatch': binding(BASE / 'quality-directory-guard.patch'),
    'independentCodeReview': binding(MAIN), 'separateActualFreshExecutionEvidence': binding(evidence_path),
    'authorIdentity': '/root/requires_runtime_path',
    'codeReviewerIdentity': '/root/requires_parallel_review',
    'executionReviewerIdentity': '/root/requires_parallel_review/quality_guard_evidence_audit',
    'authorDoesNotClaimIndependentApproval': True,
    'codeApprovalScope': main['approvalScope'],
    'freshnessBeforeAndAfterPreservation': {'originalActiveInputs': 14, 'allActiveProductionJavaSources': 444, 'drift': 0},
    'historicBindingsArePointInTime': 'Author/source paths are original provenance. Their preserved snapshot bytes stay fixed; later explicitly authorized integration changes the active targets and requires a separate receipt, not rewrites to these originals or this index.',
    'actualIsolatedTests': {'authorAndIndependentCandidate': {'tests': 8, 'failures': 0, 'errors': 0, 'skipped': 0},
                          'authorAndIndependentOriginalControl': {'tests': 4, 'failures': 3, 'errors': 0, 'skipped': 0},
                          'freshMainAndTestClassesByteExactToAuthor': True},
    'preservationBoundary': {'all444JavaSourceCopiesArchived': False, 'fixtureCopiesArchived': False,
                            'wholeGradleCacheOrReportDirectoriesArchived': False,
                            'activePatchAppliedAtThisSeal': False, 'activeSourceViewGateProviderOrCIIndexEdited': False,
                            'packageHostNativeOrFullSuiteAcceptanceInferred': False},
    'remainingGatesAtSeal': ['fresh baseline before authorized apply', 'actual active application',
                            'integrated Corretto25 focused checks including current embedded build stamp',
                            'required broader checks are not proved by earlier original-code CI'],
    'licensing': {'ownCodeTestsTechnicalCodeReviewMetadataAndArchiveIndex': 'Apache-2.0',
                  'ownEducationalKnowledgeAndSubstantiveDidacticReviewIfPresent': 'CC-BY-4.0; this technical code-review package creates no blanket CC grant',
                  'thirdPartyDependenciesExistingSourcesAndNotices': 'Original rights/status retained; no relicensing or source/redistribution acceptance inferred',
                  'allocation': 'Material function, per LICENSING.md; copied license texts preserve the project boundaries.'},
}
with out.open('x') as f:
    f.write(json.dumps(receipt, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'archiveIndex': binding(out), 'counts': dict(counts),
                  'originalCount': receipt['originalFileCount'], 'originalBytes': receipt['originalBytes'],
                  'allIndexedFiles': len(rows)}, indent=2))
