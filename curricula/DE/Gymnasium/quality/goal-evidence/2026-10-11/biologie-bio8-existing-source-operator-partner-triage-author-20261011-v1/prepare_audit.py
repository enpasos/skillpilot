import hashlib
import json
import pathlib
import shutil
import subprocess
from datetime import datetime, timezone

ROOT = pathlib.Path('/home/enpasos/projects/skillpilot')
OUT = pathlib.Path(__file__).resolve().parent
V4 = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-bio8-targeted-text-and-source-author-successor-20261010-v4'
REG = ROOT / 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
REPORT = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-current398-reviewed-j-active-root-integration-20261010-v1/checks/active-current398-central.report.json'

def read(path):
    return json.loads(pathlib.Path(path).read_text())

def write(path, obj):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')

def binding(path):
    path = pathlib.Path(path)
    if not path.is_absolute():
        path = ROOT / path
    raw = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': 'sha256:' + hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}

COPIES = []
def copy(path, folder='inputs'):
    path = pathlib.Path(path)
    if not path.is_absolute():
        path = ROOT / path
    ref = binding(path)
    target = OUT / folder / (ref['sha256'][7:19] + '-' + path.name)
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(path, target)
    COPIES.append({'original': ref, 'regularExactCopy': binding(target)})
    return binding(target)

registry = read(REG)
bio = next(s for s in registry['subjects'] if s['subject'] == 'biologie')
report = read(REPORT)
bio_report = next(s for s in report['subjects'] if s['subject'] == 'biologie')
candidate = read(V4 / 'candidate/whole483-final-text-source-image.inactive.json')
goals = {g['id']: g for g in candidate['goals']}
active_goals = {g['id']: g for g in read(ROOT / bio['landscapePath'])['goals']}
source = read(V4 / 'sources/whole31-pairs-and35-direct-operators.current-author.json')
root_paths = [REG]
for sub in registry['subjects']:
    if sub['subject'] in ['mathematik', 'physik', 'chemie', 'biologie']:
        for key in ['landscapePath', 'semanticKindLedgerPath', 'visualizationQaPath', 'semanticAtomicityConfigPath', 'memoryReviewConfigPath']:
            if sub.get(key):
                root_paths.append(ROOT / sub[key])
if not (OUT / 'checks/root-guard.before.json').exists():
    write(OUT / 'checks/root-guard.before.json', {'createdAt': datetime.now(timezone.utc).isoformat(), 'bindings': [binding(p) for p in root_paths]})

for p in [REG, REPORT, V4 / 'neutral-Bio8-targeted-text-source-image-author.portable-final.entry.json', V4 / 'candidate/whole483-final-text-source-image.inactive.json', V4 / 'sources/whole31-pairs-and35-direct-operators.current-author.json', V4 / 'sources/normal-atlas.receipt.compact.json']:
    copy(p)
for folder, name in [('biologie-bio8-v4-targeted-genuine-independent-a-20261010-v1', 'neutral-Bio8-v4-targeted-genuine-independent-a.portable-final.entry.json'), ('biologie-bio8-v4-targeted-genuine-independent-b-20261010-v1', 'neutral-Bio8v4-targeted-independent-B.portable-final.entry.json')]:
    copy(V4.parent / folder / name)

source_rows = []
for idx in [8, 11, 14, 15, 16]:
    pair = source['wholePairs'][idx]
    extraction = read(ROOT / pair['extraction']['path'])
    mapping = read(ROOT / pair['mapping']['path'])
    copy(pair['extraction']['path'], 'sources')
    copy(pair['mapping']['path'], 'sources')
    for row in extraction['sourceGoals']:
        if (idx == 11 and 'tf11-biowissenschaften' in row['id']) or (idx == 8 and any(x in row['id'] for x in ['-pb-', '-mikroorganismen-', '-evolution-'])) or (idx in [14, 15, 16] and any(x in row['id'] for x in ['-pb-', '-zellen-', '-mikroorganismen-', '-evolution-', '-pflanzen-wirbellose-zellen-'])):
            decision = next(d for d in mapping['decisions'] if d['sourceGoalId'] == row['id'])
            source_rows.append({'wholeSourceGoal': row, 'wholeCurrentDecision': decision, 'pairIndex': idx, 'mapping': pair['mapping'], 'extraction': pair['extraction']})
write(OUT / 'sources/targeted-whole-source-rows-and-current-partners.exact.json', {'schemaVersion': 1, 'rows': source_rows})

ids = {'91df35c7-e384-50d6-bb3a-37e74a6086f1', '8e2244e1-8616-5f24-859f-8e10df1c887b', 'd97f6957-fbc9-569c-8648-f7df5eb9dfd8', '26aa47b7-e5cc-5131-8980-0ec3271758b6', '0f1549f6-8341-53b0-8161-5eaeb2b37809', '9540a95d-5ca5-527c-918f-d702e99be07a', '5ee0f660-66f1-5aa6-a01d-e3b010db01ff', '0f9318ec-90eb-5381-b670-8fb2f2789c3d', 'f53d0a0b-d9b8-5012-92b5-3a021ab6c30b', '3718c6fe-0b58-5ff7-996c-25ca45b609d2', '5a068c8d-2876-57bc-a826-c3808b38a63b', '713e062d-2bb9-5fbc-8040-129387c7d3ca', '1c3470ae-83f8-52e9-98ae-b0a712755b66', '328fd9d3-d3c3-5731-a8da-a909143d3962', '82acfbde-9ce8-5658-892e-4dcfb1c3a1f1', 'f0969375-476b-5de3-91c0-3031de7c50d1', '241825f3-c26c-5ddd-9c3b-1f0460384390', 'c1aea082-30c0-558f-8d0a-fb810c1dc51b', '9f73b963-5fac-5a90-a993-d7b7c0cc8526', '80235254-ca58-5ba0-9319-b842350d6eb2', '4a8a6cec-a2cc-56fe-b3ab-7ca017f640cf', '430b2b73-641a-5122-bb6d-162b0d1eaf2d'}
profile_hits = {g: [] for g in ids}
config_scan = []
for path in bio['positiveEvidenceConfigPaths']:
    config = read(ROOT / path)
    hit = ids.intersection(config['scope'].get('goalIds', []))
    config_scan.append({'config': binding(path), 'scopeGoalIds': config['scope'].get('goalIds', []), 'targetedHits': sorted(hit)})
    if hit:
        config_copy = copy(path, 'positive')
        records_copy = copy(config['reviewPath'], 'positive')
        for line in (ROOT / config['reviewPath']).read_text().splitlines():
            if line.strip():
                record = json.loads(line)
                if record['goalId'] in hit:
                    profile_hits[record['goalId']].append({'registryConfig': binding(path), 'wholeConfig': config, 'reviewRecords': binding(config['reviewPath']), 'wholeCurrentRecord': record, 'copiedConfig': config_copy, 'copiedRecords': records_copy})
write(OUT / 'positive/registry-only-scope-scan.actual.json', {'schemaVersion': 1, 'all53RegistryConfigsInspected': len(config_scan), 'noBroadEvidenceTreeScan': True, 'configs': config_scan})

d_hits = {g: [] for g in ids}
for path in bio['resolutionIndexPaths']:
    obj = read(ROOT / path)
    def walk(value):
        if isinstance(value, dict):
            if value.get('goalId') in ids:
                d_hits[value['goalId']].append({'registryIndex': binding(path), 'wholeResolutionRow': value})
            for v in value.values():
                walk(v)
        elif isinstance(value, list):
            for v in value:
                walk(v)
    walk(obj)

joined = []
for goal_id in sorted(ids):
    goal = goals[goal_id]
    mapped_rows = [r for r in source_rows if goal_id in r['wholeCurrentDecision'].get('canonicalGoalIds', [])]
    joined.append({'goalId': goal_id, 'wholeCandidateGoal': goal, 'wholeActiveGoal': active_goals.get(goal_id), 'wholeGoalUnchangedFromActive': active_goals.get(goal_id) == goal, 'activeStrictDPAMV': goal_id in bio_report['strictCompleteGoalIds'], 'currentRegistryP': profile_hits[goal_id], 'currentRegistryD': d_hits[goal_id], 'resolutionSupersessions': [s for s in bio.get('resolutionSupersessions', []) if s['goalId'] == goal_id], 'currentSourceRowIds': [r['wholeSourceGoal']['id'] for r in mapped_rows]})
write(OUT / 'positive/whole-current-goals-profiles-material-briefs-and-D-source-joins.json', {'schemaVersion': 1, 'role': 'targeted source-partner author audit; retained current reviews are not rejudged', 'centralReport': binding(REPORT), 'joins': joined})

primary_pages = []
for jur, pages in [('DE-RP', [46]), ('DE-MV', [17, 32]), ('DE-SN', [30, 43, 44]), ('DE-ST', [28, 29, 30, 31, 44, 45]), ('DE-TH', [21])]:
    r = next(r for r in source['records'] if 'jurisdiction:' + jur in r['wholeLiteralSourceGoal']['tags'])
    primary = ROOT / r['actualPrimaryBytes']['path']
    copy_ref = copy(primary, 'primary')
    for page in pages:
        text = subprocess.check_output(['pdftotext', '-f', str(page), '-l', str(page), '-layout', str(primary), '-']).decode()
        # Full official PDF extraction is not committed. Exact source bytes and page locator suffice.
        primary_pages.append({'jurisdiction': jur, 'physicalPage': page, 'primary': binding(primary), 'regularExactCopy': copy_ref, 'textReadLocally': True})
        if (jur, page) in [('DE-RP',46),('DE-MV',32),('DE-SN',30),('DE-SN',43),('DE-ST',28),('DE-ST',30),('DE-ST',44),('DE-TH',21)]:
            target = OUT / 'primary' / f'{jur}-physical-{page:03d}'
            subprocess.run(['pdftoppm', '-f', str(page), '-l', str(page), '-scale-to', '1500', '-singlefile', '-png', str(primary), str(target)], check=True, capture_output=True)
            primary_pages[-1]['actualRaster'] = binding(target.with_suffix('.png'))
write(OUT / 'primary/actual-whole-primary-page-bindings.json', {'schemaVersion': 1, 'pages': primary_pages, 'fullOfficialExtractedTextNotCommitted': True})

for path in [
    'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-stoffwechsel-eight-two-findings-current-raster-native-technical-successor-20261010-v3/science/eight-whole-profiles-sixteen-cases.current.exact.json',
    'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-upper-science-fourteen-whole-author-v1/remediation-v2/fourteen-whole-twenty-nine-bilingual-cases.author-candidate.json',
    'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-upper-science-fourteen-whole-author-v1/remediation-v3-p11/whole-fourteen-twenty-nine-cases.only-P11-own-results.candidate.json',
]:
    copy(path, 'materials')

write(OUT / 'checks/input-exact-copy-manifest.actual.json', {'schemaVersion': 1, 'copiedInputs': COPIES})
print(json.dumps({'copiedInputs': len(COPIES), 'wholeSourceRows': len(source_rows), 'goalJoins': len(joined), 'registryConfigsScanned': len(config_scan), 'strictPartners': [{'goalId': g['goalId'], 'strict': g['activeStrictDPAMV'], 'P': len(g['currentRegistryP']), 'D': len(g['currentRegistryD'])} for g in joined], 'primaryPageLocators': len(primary_pages)}))
