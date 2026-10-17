from pathlib import Path
import datetime
import hashlib
import json
import jsonschema

O = Path(__file__).parent
B = O.parent
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()

def read(p):
    return json.loads(Path(p).read_text())

def pin(p):
    p = Path(p)
    return {"path": str(p), "sha256": hashlib.sha256(p.read_bytes()).hexdigest(), "bytes": p.stat().st_size}

def write(rel, data):
    p = O / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    return pin(p)

requires = B / 'chemie-current439-requires20-fresh-independent-b2-v1'
mixed = B / 'chemie-current439-mixed18-independent-a-v1'
immutable = {
    requires / 'SELECTOR.current439-requires20-fresh-independent-b2.sealed.json': 'faf54795d8a9b98e2bea9b9c6a11d982bc820d37192cec54125f10c6d03e1988',
    requires / 'FIRST.science.free-independent-round-b.json': '675629f51243d0d66f635cfdd857ebd051e68b0a29d6f8bb60de1412e00e4d69',
    requires / 'FIRST.own-geometric-precision-erratum.sealed.json': '50c3bd96e980fabc601f50530b6e4484571e645da25ad37e02d1a844d1d27f35',
    requires / 'native/description-records.jsonl': '4a8f988a50ff0ebf35b09fef3a2b16bcb9c907bd4ed97604ee4cd8e7dab86523',
    requires / 'native/run-manifest.json': '054c11bc2ddc2a2aa28b190dbcd861048a0215bb90accab421eb582f4b4c1a1c',
    requires / 'CHECK.actual-imported-unmodified-stock-round-b.json': 'a897bbae30e2add64949041e32cf220853f571372c35dfbd46c1627c6c9bb8c5',
    mixed / 'SELECTOR.current439-mixed18-independent-a.sealed.json': '5971aed881d7ff0e9a4ffeffe922a36093b770d7627f2c236d274d26cc60fe9a',
    mixed / 'FIRST.science.free-independent-round-a.sealed.json': '7cf873ab7b79a6e3ce9c7a938e3bbface9ac15b556f300e5600f677b3aeec876',
    mixed / 'native/description-records.jsonl': '1bff99bf66346faf588e651442f51edcefb9ac4c335e86dce32277f4c07cd7a2',
    mixed / 'native/run-manifest.json': 'b0cdf4e3f265dba050d9a568e4440d537fa265cc5c31e26c47f3280fe305b019',
    mixed / 'CHECK.actual-imported-unmodified-stock-round-a.json': 'cda6f7d2141fd5d9d0b35a9331acc691bcb17e4704c93a88801d3880765e6bd0',
}
immutable_rows = []
for p, expected in immutable.items():
    actual = pin(p)
    assert actual['sha256'] == expected, str(p)
    immutable_rows.append({**actual, 'expectedSha256': expected, 'unchanged': True})
immutable_check = write('checks/CHECK.original-review-seals-unchanged.after-author-work.json', {
    'atUTC': NOW, 'role': 'Hash-only comparison of own immutable review artifacts; no original artifact rewritten',
    'rows': immutable_rows, 'errors': [],
})

timing_rows = []
for label, folder, first_name, script_name in [
    ('Requires20 Round B2', requires, 'FIRST.science.free-independent-round-b.json', 'materialize_native_round_b.py'),
    ('Mixed18 Round A', mixed, 'FIRST.science.free-independent-round-a.sealed.json', 'materialize_native_round_a.py'),
]:
    first = read(folder / first_name)
    run = read(folder / 'native/run-manifest.json')
    t0 = datetime.datetime.fromisoformat(run['startedAt'])
    t1 = datetime.datetime.fromisoformat(run['completedAt'])
    row = {
        'scope': label, 'first': pin(folder / first_name),
        'firstRecordedAtUTC': first.get('sealedAtUTC', first.get('atUTC')),
        'nativeRun': pin(folder / 'native/run-manifest.json'),
        'nativeRunStartedAt': run['startedAt'], 'nativeRunCompletedAt': run['completedAt'],
        'nativeSerializationElapsedSeconds': (t1-t0).total_seconds(),
        'meaning': 'The local materialization script records now() at script entry and while constructing its run manifest. These are the final native serialization interval, not the scientific reading/review interval and not the whole later validator interval.',
        'timingImplementation': {**pin(folder / script_name), 'entryLine': 3},
        'existingTimingDisclosure': pin(folder / 'generation-parameters.truthful.json'),
        'actualScientificReviewStartUTC': None, 'actualScientificReviewDurationSeconds': None,
        'unknownBoundary': 'No complete per-read timestamp trace or independent scientific start/end clock was recorded in these sealed artifacts. Exact scientific start and elapsed duration are unknown; file mtimes and later ledger-write times are not substituted for reading times.',
        'scientificReadingBeforeFIRST': 'Own process attestation: the bounded original material/image/PDF/source inspection and free findings preceded FIRST; FIRST is the pre-serialization result. This statement does not claim an independently timed read trace.',
        'independenceAsOriginallyDisclosed': first['independence'],
    }
    if folder == requires:
        row['separateFirstSeal'] = pin(folder / 'FIRST.seal.json')
        row['separateFirstSealRecordedAtUTC'] = read(folder / 'FIRST.seal.json')['atUTC']
        row['ownErratum'] = pin(folder / 'FIRST.own-geometric-precision-erratum.sealed.json')
        row['ownErratumRecordedAtUTC'] = read(folder / 'FIRST.own-geometric-precision-erratum.sealed.json')['atUTC']
        row['orderBoundary'] = 'FIRST seal precedes the final run. Own geometric erratum also precedes the final run. The immutable erratum mentions an earlier technical serialization; this clarification makes no unsupported claim that there was no earlier intermediate materialization.'
        row['technicalCheckpoint'] = {
            **pin(folder / 'INPUTS.exact-current-round-b.sha256-verified.json'),
            'recordedAtUTC': read(folder / 'INPUTS.exact-current-round-b.sha256-verified.json')['atUTC'],
            'meaning': 'Exact-input/image/PDF pin-check report timestamp; not scientific review start.',
        }
        row['laterSourceLedger'] = {
            **pin(folder / 'SOURCE-MATERIALS.actual-read-pins.json'),
            'recordedAtUTC': read(folder / 'SOURCE-MATERIALS.actual-read-pins.json')['atUTC'],
            'meaning': 'Retrospective ledger write; not a timestamp for each source read.',
        }
    else:
        row['orderBoundary'] = 'Sealed FIRST records nativeSerializationStarted=false and precedes the final native run. The materializer asserts the pinned FIRST digest before projecting its decisions.'
        row['technicalCheckpoint'] = {
            **pin(folder / 'CHECK.original-material-file-and-field-pins.json'),
            'recordedAtUTC': read(folder / 'CHECK.original-material-file-and-field-pins.json')['checkedAtUTC'],
            'meaning': 'Original-file/field hash verification timestamp; not scientific review start.',
        }
    timing_rows.append(row)

clarification = write('provenance/PROVENANCE.own-review-timing-clarification.append-only.sealed.json', {
    'schemaVersion': 1, 'atUTC': NOW,
    'role': 'Own append-only provenance clarification, not a new scientific review or replacement of prior records',
    'actualModel': 'Codex based on GPT-6; exact deployment identifier not exposed in this session',
    'originalArtifactsModified': False,
    'rows': timing_rows,
    'blindStatusScope': 'Other independent scientific review results were not read for either original review. This preserves the qualified recorded blind status and explicitly includes the original metadata exposures. This later author work uses this agent own prior findings and is not an independent review.',
    'noMillisecondScientificReviewClaim': True,
})

view_path = mixed / 'scientific-view.exact.json'
view = read(view_path)
assert pin(view_path)['sha256'] == '5a0790b37353856fb83cc9e8ccaaa5eaa7865970a03bbef8dd5f85e0ad977275'
before = read(O / 'before/P4.current-full-profile-bodies.exact.json')
candidates = read(O / 'candidate/P4.complete-author-profile-successors.pending.json')
cases = read(O / 'materials/FIVE.whole-bilingual-targeted-cases.author.json')
sources_path = O / 'materials/SOURCE.primary-original-pins-and-attribution.author.json'
sources = read(sources_path)
schema_path = Path('/home/enpasos/projects/skillpilot/contracts/goal-evidence/v2/goal-evidence-profile.schema.json')
contract = read(schema_path)
validator = jsonschema.Draft202012Validator({'$schema': contract['$schema'], '$defs': contract['$defs'], '$ref': '#/$defs/profile'})

source_by_case = {
    'nitrogen-mo-count': [], 'fresh-oxygen-cation': [],
    'aromatic-nitronium-new-path': [],
    'basf-indigo-1897-actual-sources': ['H1-DE', 'H1-EN', 'H2', 'H3'],
    'proline-reference-transfer': ['A1'],
}
bindings = []
technical_rows = []
for i, row in enumerate(candidates['profiles']):
    gid = row['goalId']
    vi = next(j for j, v in enumerate(view['goals']) if v['goalId'] == gid)
    original = view['goals'][vi]['reviewContext']['evidenceProfile']
    old = before['profiles'][i]['profile']
    new = row['profile']
    assert old == original['profile']
    assert row['inputCurrentStatus'] == {k: original[k] for k in ['status', 'evidenceLevel', 'maximumClaimScope']}
    assert old['expectations'] == new['expectations']
    assert old['coverageExpectations'] == new['coverageExpectations']
    assert new['coverageExpectations']['minimumIndependentDemonstrations'] == 2
    errors = [e.message for e in validator.iter_errors(new)]
    assert not errors, errors
    if i == 0:
        assert [c['id'] for c in old['applicationCaseBriefs']] == [c['id'] for c in new['applicationCaseBriefs']]
        assert old['variationAxes'] == new['variationAxes']
    else:
        assert new['applicationCaseBriefs'][:len(old['applicationCaseBriefs'])] == old['applicationCaseBriefs']
        assert new['variationAxes'][:len(old['variationAxes'])] == old['variationAxes']
    allowed = {'applicationCaseBriefs'} if i == 0 else {'applicationCaseBriefs', 'variationAxes'}
    assert all(old[k] == new[k] for k in old if k not in allowed)
    technical_rows.append({'goalId': gid, 'exactBeforeSourcePointer': f'/goals/{vi}/reviewContext/evidenceProfile/profile',
        'exactBeforeEqualsFrozenView': True, 'profileSchemaErrors': errors,
        'existingExpectationsAndCoverageUnchanged': True, 'minimumIndependentDemonstrations': 2,
        'inputCurrentStatusUnchanged': row['inputCurrentStatus'], 'unchangedOtherProfileFields': True,
        'existingPracticalExecutionUnchanged': True if i == 3 else 'not the practical target'})
    for j, brief in enumerate(new['applicationCaseBriefs']):
        matches = [(k, c) for k, c in enumerate(cases['cases']) if c['goalId'] == gid and c['id'] == brief['id']]
        if not matches:
            continue
        k, c = matches[0]
        individual_path = O / f"materials/{c['id']}.whole-DE-EN.author.json"
        assert read(individual_path) == c
        assert sum(r['points'] for r in c['rubric']) == c['maximumPoints']
        for field in ['materialsDe', 'materialsEn', 'taskDe', 'taskEn', 'expectedPerformanceDe', 'expectedPerformanceEn', 'freshTransfer']:
            assert c[field]
        bindings.append({'goalId': gid, 'caseId': c['id'],
            'completeAuthorProfile': {**pin(O / 'candidate/P4.complete-author-profile-successors.pending.json'), 'jsonPointer': f'/profiles/{i}/profile'},
            'profileCasePointer': f'/profiles/{i}/profile/applicationCaseBriefs/{j}',
            'wholeMaterial': {**pin(individual_path), 'jsonPointer': ''},
            'collectionPointer': f'/cases/{k}',
            'sourceCards': [{'sourceId': sid, 'jsonPointer': f"/sources/{next(x for x,s in enumerate(sources['sources']) if s['sourceId'] == sid)}"} for sid in source_by_case[c['id']]],
            'sourceLedger': pin(sources_path),
            'materialType': 'Own explicit occupied MO text ladder' if i == 0 else 'Own bilingual prospective whole teaching case with separately attributed reference facts',
        })
assert len(bindings) == 5
source_checks = []
for source in sources['sources']:
    pp = source.get('originalBytePin', source.get('representationPin'))
    assert pp and pin(pp['path']) == pp
    source_checks.append({'sourceId': source['sourceId'], 'pinVerified': True,
                          'representationType': 'raw original bytes' if 'originalBytePin' in source else 'web-provider original-page representation, not raw HTTP bytes'})
binding_pin = write('materials/CASE-MATERIAL-BINDINGS.author.json', {
    'schemaVersion': 1, 'role': 'Exact operational mapping from each bounded new/updated profile case to its supplied whole bilingual materials',
    'bindings': bindings, 'noNewCaseQuota': True, 'independentReview': 'pending',
})
technical_pin = write('checks/CHECK.final-technical-retention-and-material-bindings.json', {
    'atUTC': NOW, 'role': 'Technical schema, exact retention, byte-pin and case-material presence checks only; not scientific self-review or approval',
    'frozenView': pin(view_path), 'schema': pin(schema_path),
    'profileCount': 4, 'wholeCaseCount': 5, 'rows': technical_rows,
    'sourceBytePins': source_checks, 'allIndividualWholeCaseFilesEqualCollectionCases': True,
    'allBilingualCoreFieldsPresent': True, 'allRubricPointSumsMatch': True,
    'errors': [], 'humanApproval': False, 'independentReview': 'pending',
})

README = '''# Four targeted Chemistry P author successors

Author candidates only; independent scientific review is pending. These files do not integrate or approve a goal, record learner performance, or raise E1/G1/current status.

`candidate/P4.complete-author-profile-successors.pending.json` contains the four complete profile bodies, in order f85b4651, b8d3b453, 188bd684 and 5c8f0bbb. Exact `/profiles/N/profile` pointers and five whole material bindings are in `materials/CASE-MATERIAL-BINDINGS.author.json`. The exact frozen before bodies and bounded deltas are supplied separately.

- f85b: two existing task briefs now supply actual occupied N2/O2 text MO ladders with the appropriate order; electrons and bond order must be counted by the learner. Core 1s omission is explicit.
- b8d: one new supplied nitronium/sigma-complex comparison and fresh hydrogenation boundary transfer; original cases remain verbatim.
- 188bd684: one actual BASF 1897 indigo case with primary company/museum references, actual investment magnitude and source criticism. Investment, revenue and profit remain distinct; no absent revenue/profit data are invented. The two explicitly fictional original models remain verbatim.
- 5c8f: one supplied proline/glycine reference comparison plus ethanolamine transfer, with full connectivity and the reported reference conditions. Unreported reagent concentration is declared, so this is a written reference case, not an invented executable SOP. Current actual practical performance and controls remain verbatim.

The existing `minimumIndependentDemonstrations: 2`, expectations and coverage fields are unchanged. Added material supplies a missing performance opportunity; it does not prescribe a new fixed case or execution quota. No C/D/configuration or goal image changes were made. No native P review record or fabricated reviewer identity is supplied.

Own teaching material is CC-BY-4.0; technical scripts are Apache-2.0. Original third-party HTML/PDF files remain private and are not licensed anew or committed. The source ledger distinguishes original byte hashes from the web provider representation of the original museum page.

`provenance/PROVENANCE.own-review-timing-clarification.append-only.sealed.json` clarifies the earlier immutable review run times: these describe final native serialization. Exact scientific reading start/duration is unknown. Original FIRST/erratum/records/runs/selectors remain byte-identical, verified by hash.
'''
(O / 'README.md').write_text(README)

paths = [
    'before/P4.current-full-profile-bodies.exact.json',
    'candidate/P4.complete-author-profile-successors.pending.json',
    'candidate/BEFORE-AFTER.exact-profile-deltas.author.json',
    'materials/FIVE.whole-bilingual-targeted-cases.author.json',
    'materials/CASE-MATERIAL-BINDINGS.author.json',
    'materials/SOURCE.primary-original-pins-and-attribution.author.json',
    'checks/CHECK.technical-profile-body-schema-and-exact-retention.json',
    'checks/CHECK.final-technical-retention-and-material-bindings.json',
    'checks/CHECK.original-review-seals-unchanged.after-author-work.json',
    'provenance/PROVENANCE.own-review-timing-clarification.append-only.sealed.json',
    'build_targeted_author_candidates.py', 'finalize_author_package.py', 'README.md',
]
selector = write('SELECTOR.four-targeted-P-author-successors.pending-independent-review.sealed.json', {
    'schemaVersion': 1, 'sealedAtUTC': NOW, 'role': 'AUTHOR successor package, independent scientific review pending',
    'actualModel': 'Codex based on GPT-6; exact deployment identifier not exposed in this session',
    'frozenScientificView': pin(view_path),
    'originalIndependentReviewSelector': pin(mixed / 'SELECTOR.current439-mixed18-independent-a.sealed.json'),
    'profileCount': 4, 'wholeBilingualTargetedCaseCount': 5,
    'profileBodies': [{ 'goalId': r['goalId'], 'jsonPointer': f'/profiles/{i}/profile', 'inputCurrentStatus': r['inputCurrentStatus'] } for i,r in enumerate(candidates['profiles'])],
    'artifacts': [pin(O / p) for p in paths],
    'independentReview': 'pending', 'selfReviewOrApproval': False, 'humanApproval': False,
    'minimumIndependentDemonstrationsUnchanged': 2,
    'nativeReviewRecordsCreated': False,
    'C_D_configurationOrMainIntegration': False,
    'thirdPartyOriginals': 'Private original source files are pinned by source ledger; do not commit or relicense them.',
})
print(json.dumps({'selector': selector, 'candidateProfiles': pin(O / paths[1]), 'wholeCases': pin(O / paths[3]),
                  'materialBindings': binding_pin, 'technicalCheck': technical_pin, 'timingClarification': clarification,
                  'unchangedReviewSeals': immutable_check}, ensure_ascii=False, indent=2))
