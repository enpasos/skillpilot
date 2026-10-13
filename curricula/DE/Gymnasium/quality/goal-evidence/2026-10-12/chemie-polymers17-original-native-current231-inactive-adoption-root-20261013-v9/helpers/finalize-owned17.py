# Apache-2.0. Verify immutable source inputs and seal only owned new artifacts.
from pathlib import Path
import datetime, hashlib, importlib.util, json, shutil

R = Path('/home/enpasos/projects/skillpilot')
E = R / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12'
O = E / 'chemie-polymers18-current231-inactive-normal-preparation-technical-20261013-v1'
F = E / 'chemie-polymers17-original-native-current231-inactive-adoption-root-20261013-v9'
X = R / 'tmp/chemie-q4-current220-prep/execution'
rd = lambda p: json.loads(p.read_text())
h = lambda p: 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()
rp = lambda p: str(p.relative_to(R))
bind = lambda p: {'path': rp(p), 'sha256': h(p), 'bytes': p.stat().st_size}
now = lambda: datetime.datetime.now(datetime.timezone.utc).isoformat()

def wr(p, value):
    p.parent.mkdir(parents=True, exist_ok=True)
    if p.exists():
        old = rd(p)
        assert {k: v for k, v in old.items() if k not in ['checkedAtUTC', 'recordedAtUTC']} == {k: v for k, v in value.items() if k not in ['checkedAtUTC', 'recordedAtUTC']}, p
    else:
        p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

seal_names = [
    'chemie-polymers18-current231-inactive-normal-preparation-technical-20261013-v1/FINAL.inactive18-author-neutral-native.freeze.json',
    'chemie-polymers18-clean-independent-a-20261013-v5/FINAL.independentA.seal.json',
    'chemie-polymers18-final-native-fresh-independent-b-20261013-v6/FINAL.original18-independent-b.freeze.json',
    'chemie-polymers-six-corrected-assets-V-independent-b-20261013-v4/FINAL.V6.independent-b.freeze.json',
    'chemie-polymers-3aef-no-melt-flow-actual-V-independent-b-20261013-v5/FINAL.thermal-V1.independent-b.freeze.json',
    'chemie-f947-one-explicit-task-fresh-independent-a-20261013-v8/FINAL.scientific-a.seal.json',
    'chemie-f947-one-explicit-task-targeted-independent-b-20261013-v8/FINAL.f947-one-target-independent-b.freeze.json',
]
checked = []
for name in seal_names:
    path = E / name
    seal = rd(path)
    entries = seal.get('files', [])
    assert entries, path
    for item in entries:
        target = R / item['path']
        assert h(target) == item['sha256'], target
    checked.append({**bind(path), 'verifiedOriginalOwnedFileCount': len(entries)})

references = rd(F / 'INPUTS.original17-current231.referenced-immutable-bindings.json')
for item in references['referencedOriginalFiles']:
    assert h(R / item['path']) == item['sha256'], item['path']
current = R / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
assert h(current) == references['currentCanonicalSha256']
bindings = rd(E / 'chemie-polymers-3aef-no-melt-flow-author-successor-20261013-v4/six.resource-bindings.one-thermal-successor.json')['bindings']
profile_source = E / 'chemie-polymers-three-visual-Pscope-atomicity-author-successor-20261013-v3/whole40.expanded-cases.author-successor.json'
wr(F / 'checks/immutable-original-seals-and-source-inputs.actual.json', {
    'schemaVersion': 1, 'checkedAtUTC': now(), 'originalSeals': checked,
    'originalReferencedInputsVerified': len(references['referencedOriginalFiles']),
    'sourceWholeBilingualCasePool': bind(profile_source), 'currentCanonicalBinding': bind(current),
    'originalIndependentVotesChanged': False, 'oldF947AndThermalHoldsChanged': False,
    'noCurrent18Or20FullClosureClaim': True, 'activeWrites': False, 'newScientificVotes': 0,
})

checks = [
    ('A17', 'semanticAtomicityReview.ts', R / 'app', 'A17.normal.actual', 'configs/A17.original-independentA.inactive.config.json'),
    ('M402', 'memoryCardReview.ts', R / 'app', 'M402.normal.actual', 'configs/M402.original-retained.inactive.config.json'),
    ('P17', 'positiveGoalEvidenceReview.ts', X / 'app', 'P17.normal.private-exact-assets.actual', 'configs/P17.original-author.inactive.config.json'),
]
for name, module, cwd, stem, config in checks:
    executed = cwd / 'scripts' / module
    production = R / 'app/scripts' / module
    assert h(executed) == h(production), executed
    stdout = F / 'checks' / f'{stem}.stdout.txt'
    stderr = F / 'checks' / f'{stem}.stderr.txt'
    assert stderr.read_text() == '', stderr
    if name == 'A17':
        assert 'Current reviewed atomic: 17' in stdout.read_text()
        assert 'Missing review records: 0' in stdout.read_text()
    if name == 'P17':
        assert 'Configured goals: 17' in stdout.read_text() and 'Blocking issues: 0' in stdout.read_text()
    if name == 'M402':
        assert 'Missing review records: 0' in stdout.read_text()
        assert 'Stale review records: 0' in stdout.read_text()
        assert 'Current needs developer review: 0' in stdout.read_text()
    wr(F / 'checks' / f'{stem}.receipt.json', {
        'schemaVersion': 1, 'recordedAtUTC': now(), 'recordKind': 'Receipt of already completed exec_command invocation; exit code was returned by the tool',
        'argv': ['node', '--import', 'tsx', f'scripts/{module}', '--mode=check', '--config=' + rp(F / config)],
        'cwd': rp(cwd), 'exitCode': 0, 'productionModule': bind(production), 'executedModule': bind(executed),
        'stdout': bind(stdout), 'stderr': bind(stderr), 'newScientificVotes': 0, 'humanApproval': False,
    })
for source, dest in [
    ('poly17-inactive-materialize.actual.log', 'original17-materialization.actual.stdout.txt'),
    ('poly17-whole402-impact.actual.log', 'whole402-impact.actual.stdout.txt'),
    ('poly17-original-V-retention.actual.log', 'six-original-V-retention.actual.stdout.txt'),
]:
    shutil.copyfile(R / 'tmp/chemie-q4-current220-prep' / source, F / 'checks' / dest)

api = rd(F / 'checks/original17-production-resolution-and-index-API.actual.json')
pages = rd(F / 'checks/whole402-original17-profile-fallback-and-actual-V-retention.actual.json')
index = rd(F / 'resolution-index.original17.aggregate-v1.json')
assert api['strictDescriptionValid'] == 17 and api['indexSnapshotErrors'] == []
assert len(index['resolutions']) == 17 and index['groups'][0]['campaignGoalCount'] == 18
assert all(item['strictDescriptionComplete'] and item['errors'] == [] for item in api['perGoalResolutionValidation'])
assert len(pages['changedWholePagesComparedToCurrent231']) == 17
assert pages['protected231WholePagesExact'] and pages['original17Whole402PagesExact'] and pages['held3PagesEqualCurrentUnacceptedBaseline']
wr(F / 'INTEGRATION_PLAN.current231-original17-selected.pending-root.json', {
    'schemaVersion': 1, 'state': 'INACTIVE; root integration pending',
    'expectedActiveStartCanonical': bind(current), 'currentCurricularAtomicDenominator': 402,
    'eligibleOriginalGoalIds': [item['goalId'] for item in index['resolutions']],
    'heldGoalIds': rd(F / 'HOLD.three-current-goals.not-adopted.json')['goalIds'],
    'descriptionIndex': bind(F / 'resolution-index.original17.aggregate-v1.json'),
    'positiveConfig': bind(F / 'configs/P17.original-author.inactive.config.json'),
    'atomicityConfig': bind(F / 'configs/A17.original-independentA.inactive.config.json'),
    'existingMemoryConfig': bind(O / 'configs/M402.inactive.config.json'),
    'futureCanonical': bind(O / 'candidate/canonical523.current402.six-resource-only.inactive.json'),
    'futureQa': bind(O / 'candidate/QA.current-plus-six-actualV.inactive.json'),
    'sixPreviouslyApprovedActualAssetBindings': bindings,
    'integrationOrder': [
        'After newest-head CI success, recheck current canonical CAS and all referenced immutable inputs.',
        'Import only six actual approved PNGs and their six existing reviewed resource/QA changes; preserve all other goal bodies and historical assets.',
        'Keep every original reviewed author P17 line and all genuine A17 record metadata exact; point supported integration configs to byte-equivalent current canonical/semantic inputs.',
        'Append the v1 aggregate description index with its original18 campaigns and actual runs; do not create a new native17 campaign or fresh A/B identity.',
        'Retain unchanged valid M402 and75-card decisions; replace the original20 in-flight claim by the explicit3 held IDs.',
        'Run affected P/A/V/central gates, protected M7 floors, required Layer A checks and downstream source/publication checks once at the stable integrated state.',
        'Report actual central strict net gain only after successful checks. No human approval or full18/20/source-clause approval is asserted.',
    ],
    'activeWritesAlreadyPerformed': False, 'newScientificReviewVotes': 0, 'actualCentralStrictGainSoFar': 0,
    'rereviewOrRerenderOfUnchanged17Required': False, 'humanApproval': False, 'humanTrial': False,
})
readme = F / 'README.inactive-original17.md'
assert not readme.exists()
readme.write_text('''# Chemie: inaktiver geprüfter Original17-Zwischenstand

Die ursprüngliche, unveränderte native Kampagne enthält18 Ziele. Dieser technische v1-Aggregate-Index übernimmt ausschließlich17 tatsächlich unabhängig positiv geprüfte Ziele. Originale Campaign-, Run-, Record-, Goal-, Page-, Profile- und Kontextbindungen bleiben erhalten. Es gibt keine neue wissenschaftliche Reviewrunde und keine neue native Kampagnenidentität.

Die Rohzeilen der gedruckten Autorenprofile und der unabhängigen A-Atomaritätsprüfung sind exakt übernommen. Die separaten positiven A/B-Profilurteile werden als Herkunftsnachweise bewahrt; ihre abweichenden Reviewer-Metadaten ersetzen die native Druckbindung nicht. M402 und75 Karten bleiben unverändert; sechs konkrete maschinelle Bildfreigaben werden aus ihren vorhandenen unabhängigen Prüfungen übernommen.

F947 bleibt einschließlich der neuen Quellen- und Task/Rubrik-Befunde offen. Ebenso bleiben413c5ee5 und9d942907 offen. Keine18/20-Gesamtfreigabe, kein menschlicher Prüf- oder Erprobungsnachweis und keine neue strenge Abschlusszählung wird behauptet.

Normaler Gesamtmodellvergleich:402 Ziele, ausschließlich17 aktuelle Seiten geändert, sämtliche231 geschützten Seiten exakt; die17 Seiten im ursprünglichen18er-Native-Kontext lassen sich unverändert reproduzieren. Die drei gehaltenen Ziele haben wieder den unveränderten aktuellen, nicht abgeschlossenen Seitenstand. Das historische18er-Bundle bleibt erhalten.

Normale P17-, A17- und M402-Checks sind bestanden. Die17 Resolutionen sind mit den unveränderten Produktions-APIs streng validiert. Der Index nennt wahrheitsgemäß18 Kampagnenziele und17 übernommene Resolutionen. Dieser Stand ist noch nicht in die aktive Registry oder Veröffentlichung integriert.

Nächster Schritt:INTEGRATION_PLAN.current231-original17-selected.pending-root.json durch die Root-Integration nach grünem aktuellem GitHub-CI anwenden und den tatsächlichen zentralen Nettozuwachs prüfen.
''')

spec = importlib.util.spec_from_file_location('normal_schema', R / 'scripts/validate_schemas.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
errors = module.curriculum_symlink_errors(R)
assert errors == [], errors
structured = []
for path in sorted(F.rglob('*')):
    assert not path.is_symlink(), path
    if path.is_file() and path.suffix == '.json':
        rd(path)
        structured.append(bind(path))
    if path.is_file() and path.suffix == '.jsonl':
        for line in path.read_text().splitlines():
            if line.strip(): json.loads(line)
        structured.append(bind(path))
wr(F / 'checks/owned-structured-parse-source-CAS-and-curriculum-symlinks.actual.json', {
    'schemaVersion': 1, 'checkedAtUTC': now(), 'structuredFileCount': len(structured), 'structuredBindings': structured,
    'allOwnedArtifactsRegularFiles': True, 'curriculumSymlinkErrors': errors, 'currentCanonical': bind(current),
    'normalIndexSnapshotAndPerGoalResolutionExportsPass': True, 'noGlobalLongBuildRerun': True,
    'activeWrites': False, 'newScientificVotes': 0, 'humanApproval': False,
})
assert h(current) == references['currentCanonicalSha256']
for item in references['referencedOriginalFiles']: assert h(R / item['path']) == item['sha256']
owned = [bind(path) for path in sorted(F.rglob('*')) if path.is_file()]
seal_path = F / 'FINAL.inactive-original17-adoption.freeze.json'
wr(seal_path, {
    'schemaVersion': 1, 'kind': 'Inactive17 exact-original-campaign technical adoption; no new scientific votes or active integration',
    'sealedAtUTC': now(), 'license': 'Apache-2.0 technical helpers/manifests; own didactic review content CC-BY-4.0; referenced third-party rights unchanged',
    'fileCount': len(owned), 'files': owned, 'originalCampaignGoalCount': 18, 'strictSelectedResolutionCount': 17,
    'currentAtomicDenominator': 402, 'currentCanonicalSha256': references['currentCanonicalSha256'],
    'heldGoalIds': rd(F / 'HOLD.three-current-goals.not-adopted.json')['goalIds'],
    'bothOriginalIndependentP17OpinionsPositiveAndExact': True, 'originalPrintedP17RawExact': True,
    'originalGenuineA17RawExact': True, 'currentM402RawAnd75CardsRetained': True,
    'sixActualIndependentMachineVApprovalsRetained': True, 'protectedCurrent231FullTuplesExact': True,
    'normalP17A17M402AndResolutionIndexChecksPassed': True, 'structuredInputsParsed': True, 'committableSymlinksPassed': True,
    'freshScientificReviewVotes': 0, 'actualCentralStrictGain': 0, 'activeOrGitWrites': False,
    'rootIntegrationPending': True, 'humanApproval': False, 'humanTrial': False,
})
print(json.dumps({'seal': bind(seal_path), 'ownedFileCount': len(owned), 'originalCampaignGoals': 18, 'selected17': 17, 'held3': True, 'protected231Exact': True, 'activeWrites': False}))
