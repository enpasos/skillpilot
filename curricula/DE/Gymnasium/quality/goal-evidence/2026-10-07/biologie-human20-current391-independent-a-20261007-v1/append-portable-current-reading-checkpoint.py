# SPDX-License-Identifier: Apache-2.0
"""Append a portable source/read checkpoint without changing historical seals."""
from pathlib import Path
from datetime import datetime, timezone
from copy import deepcopy
import hashlib
import json
import ast

root = Path.cwd()
own = Path(__file__).resolve().parent
read = lambda p: json.loads(p.read_text())
def bind(p):
    data = p.read_bytes()
    return {'path': str(p.relative_to(root)), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}
def write(p, value):
    with p.open('x') as handle:
        handle.write(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
first = own / 'first-twenty-whole-science.freeze.json'
resolution = own / 'targeted-v2-science-resolution.independent-a.freeze.json'
assert bind(first)['sha256'] == '960d3501b304a4482a0012fe195bc5d592a3cc3ea881e979719cb742ef986b9a'
assert bind(resolution)['sha256'] == '55ed993a85f89110a8cfdcf3c33a5a6ddc87d85847c1514202c9d4133edf274b'
for seal in [first, resolution]:
    for row in read(seal)['frozenFiles']:
        assert bind(root / row['path']) == row
historical = own / 'actual-two-primary-whole-scoped-readings.independent-a.json'
portable = deepcopy(read(historical))
portable['artifactKind'] = 'independent-a-portable-current-original-primary-scoped-reading-receipt'
portable['historicalExactScientificReceipt'] = bind(historical)
portable['historicalLocalWitnessLabelsAreContextOnlyNotRequiredFileInputs'] = True
portable['scientificReadingNotRepeatedOrReplacedByHashes'] = True
portable['rawOfficialTextExported'] = False
for row in portable['sourceEntries']:
    raw = Path(row.pop('actualDocument'))
    text = Path(row.pop('actualText'))
    assert hashlib.sha256(raw.read_bytes()).hexdigest() == row['sha256']
    assert hashlib.sha256(text.read_bytes()).hexdigest() == row['textSHA']
    row['actualRawDocumentAndExtractedTextDigestsReverifiedLocally'] = True
    row['portableReproductionSteps'] = (
        ['Fetch the official URL into a local cache without committing its full text', 'Parse HTML with BeautifulSoup html.parser', "Select main and get_text(separator='\\n', strip=True)", 'Select the whole scoped LB2 through3.4 section and compare the stored whole source/scoped text digests']
        if row['sourceKey'] == 'BY10' else
        ['Fetch the official PDF URL into a local cache without committing its full text', 'Run pdftotext -layout <local-pdf> <local-text>', 'Split layout text on form-feed and select physical10–12, printed9–11; compare the stored PDF, full extraction and whole-page text digests']
    )
portable_path = own / 'portable-current-original-primary-scoped-reading.independent-a.json'
write(portable_path, portable)
check = own / 'commit-checkpoint-local-json-and-reference-checks.actual.json'
parsed = []
exact = []
def verify(value, pointer):
    if isinstance(value, dict):
        if set(value) == {'path', 'sha256', 'bytes'}:
            assert not Path(value['path']).is_absolute()
            assert bind(root / value['path']) == value, pointer
            exact.append(pointer)
        else:
            for key, item in value.items():
                verify(item, pointer + '/' + key)
    elif isinstance(value, list):
        for number, item in enumerate(value):
            verify(item, pointer + '/' + str(number))
for path in own.rglob('*'):
    assert not path.is_symlink()
    if path.is_file() and path.suffix == '.json':
        assert path.stat().st_size
        verify(read(path), path.name)
        parsed.append(path.name)
    elif path.is_file() and path.suffix == '.py':
        ast.parse(path.read_text())
assert not any(prefix in portable_path.read_text() for prefix in ['/tmp/', '/home/'])
write(check, {'role': 'Actual own local commit checkpoint check; stable-root full schema/build remains separate', 'allOwnJSONParsedAtCheckpoint': parsed, 'actualExactReferencesVerified': len(exact), 'symlinks': 0, 'emptyJSON': 0, 'currentPortableReadingReceiptAbsoluteLocalAliases': 0, 'historicalFirstReceiptFourLocalContextLabelsRetainedImmutable': True, 'historicalLocalContextLabelsNotUsedByValidatorsOrBuilds': True, 'nativeP20CurrentPreimageExitCode': 0, 'nativeP20BlockingIssues': 0, 'scienceResolvedButFinalVAndNativeDPending': True, 'activeWrites': 0, 'strictGainClaimed': 0, 'humanApproval': False})
entry = own / 'neutral-human20-independent-a-science-commit-checkpoint.entry.json'
write(entry, {'role': 'Portable current independent A science checkpoint; final raster and native D still HOLD', 'immutableOwnFirstScience': bind(first), 'actualOwnTargetedV2ScienceResolution': bind(resolution), 'portableActualOriginalPrimaryScopedReading': bind(portable_path), 'actualLocalSyntaxAndExactReferenceChecks': bind(check), 'currentWholeGoalTextScientificKeep': 20, 'currentWholeCaseAndPSciencePASS': 20, 'resolvedOwnFindings': 3, 'peerReportedAfterOwnSealNegationActuallyResolved': 1, 'wholeCaseScienceStatus': 'PASS_E1_G1', 'finalV20Status': 'HOLD_actual_selected20_full_360_680_images_not_reviewed', 'finalD20Status': 'HOLD_actual_native20_current_pages_not_reviewed', 'noActiveIntegrationRequestedOrPerformed': True, 'sourceCountryWideClosureClaim': False, 'reviewAuthority': 'ai_candidate', 'status': 'needs_human_review', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1', 'activeWrites': 0, 'strictGainClaimed': 0, 'humanApproval': False})
(own / 'README.md').write_text('''# Human20 independent A: science checkpoint

Independent A actually read20 whole bilingual goals,40 complete DEEN material/task/model-answer cases,20 operative P profiles and the scoped whole BY10/HE-G9 original sources. The first immutable science seal records17 case/profile passes and three actual holds; goal texts remain KEEP20. A did not author texts, cases or images and did not read peer findings before that first seal.

Five whole cases on ordinals5/7/16/19 were subsequently corrected by the author. Independent A reread the eight whole cases/four operative profiles, retained35 unchanged cases/16 profiles/all20 goal texts exactly and resolved its three actual findings. The additional English resistance-negation issue was peer-reported after A's first seal, then independently confirmed/resolved; it is not falsely attributed to A's original blind review. Actual official NIH function/food sections were checked for the new vitamin-C/collagen and calcium/bone/tooth examples. The native preimage P20 check passed with0 blockers; E1/G1/ai_candidate/needs_human_review remains truthful.

This checkpoint does not claim final V20 or D20: actual selected20 full/360/680 raster images and actual final native20 pages remain pending. No active writes, strict gain0, no human approval or trial.

Current entry: neutral-human20-independent-a-science-commit-checkpoint.entry.json. The portable current source receipt preserves official URLs, PDF/HTML and whole scoped-read digests plus verified reproduction methods. Four local cache witness labels in the original immutable first receipt are historical context only, not required file inputs; that sealed history remains untouched. No full official text is committed. Failed local reader/CLI attempts are documented truthfully; only corrected actual successful native output is counted.
''')
seal = own / 'portable-science-commit-checkpoint.freeze.json'
write(seal, {'schemaVersion': 1, 'artifactKind': 'independent-a-human20-portable-science-commit-checkpoint', 'recordedAt': datetime.now(timezone.utc).isoformat(), 'frozenFiles': [bind(p) for p in [portable_path, check, entry, own / 'README.md', Path(__file__)]], 'historicalFirstAndResolutionSealsUnchanged': True, 'currentP20SciencePASS': 20, 'finalV20AndNativeD20StillPending': True, 'activeWrites': 0, 'strictGainClaimed': 0, 'humanApproval': False})
for row in read(seal)['frozenFiles']:
    assert bind(root / row['path']) == row
print(json.dumps({'portableOwnScienceCommitCheckpoint': bind(seal), 'neutralEntry': bind(entry), 'historicalSealsPreserved': True, 'activeWrites': 0, 'strictGainClaimed': 0, 'finalVAndDPending': True}))
