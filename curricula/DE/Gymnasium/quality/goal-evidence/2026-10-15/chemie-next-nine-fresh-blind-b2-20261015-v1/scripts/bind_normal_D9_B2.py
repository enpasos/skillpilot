"""Only bind sealed B2 judgments to unchanged original round-B input fields."""
import datetime
import hashlib
import json
import pathlib
import re
import shutil

ROOT = pathlib.Path(__file__).resolve().parents[8]
OWN = pathlib.Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-six-inputs-three-scope-native9-final-rezeptfrei-preparation-technical-20261015-v2'
HOST = ROOT / 'tmp/chemie-m7-resumed-20261015/chemie-next-nine-fresh-blind-b2-stockhost-v1'

def read(p):
    return json.loads(p.read_text())

def digest(data):
    return 'sha256:' + hashlib.sha256(data).hexdigest()

def ref(p):
    return {'path': str(p.relative_to(ROOT)), 'sha256': digest(p.read_bytes()), 'bytes': p.stat().st_size}

seal = read(OWN / 'SEAL.FIRST.B2.json')
for f in seal['files']:
    assert digest((ROOT / f['path']).read_bytes()) == f['sha256']
assert not HOST.exists()
HOST.mkdir(parents=True)
(HOST / 'package.json').write_text('{"type":"module"}\n')
(HOST / 'app').mkdir()
(HOST / 'app/node_modules').symlink_to(ROOT / 'app/node_modules', target_is_directory=True)

# Copy only repository stock modules, never another role's host or reviews.
todo = [ROOT / 'app/scripts/validateGoalDescriptionReviewCampaignResults.ts', ROOT / 'app/scripts/createGoalDescriptionReviewCampaign.ts']
seen = set()
module_refs = []
while todo:
    p = todo.pop()
    if p in seen:
        continue
    seen.add(p)
    rel = p.relative_to(ROOT)
    target = HOST / rel
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(p, target)
    assert p.read_bytes() == target.read_bytes()
    module_refs.append(ref(p))
    for name in re.findall(r'(?:from\s*|import\s*)[\'\"](\.[^\'\"]+)[\'\"]', p.read_text()):
        base = p.parent / name
        candidates = [base] if base.suffix else [pathlib.Path(str(base) + '.ts'), pathlib.Path(str(base) + '.mjs'), base / 'index.ts']
        for candidate in candidates:
            if candidate.is_file():
                todo.append(candidate.resolve())
                break

schema_dirs = ['goal-book/v1', 'goal-evidence/v1', 'goal-evidence/v2', 'goal-description-review/v1', 'goal-description-review/v2', 'goal-description-review/v3']
schema_paths = {p for d in schema_dirs for p in (ROOT / 'contracts' / d).glob('*.json')}
schema_paths.update([ROOT / 'contracts/curriculum-package/v1/curriculum-ontology-profile.schema.json', ROOT / 'contracts/curriculum-package/v1/profiles/semantic-normal-form-v1.profile.json'])
for p in schema_paths:
    target = HOST / p.relative_to(ROOT)
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(p, target)
    assert p.read_bytes() == target.read_bytes()

campaign = read(SOURCE / 'native-nine/round-b/description-review-campaign.json')
inp = read(SOURCE / 'native-nine/round-b/description-review-input.json')
bundle = read(SOURCE / 'native-nine/bundle/manifest.json')
d6 = read(OWN / 'FIRST.D6.independent-scientific.json')
s3 = read(OWN / 'FIRST.SCOPE3.independent-limited-binding.json')
first_by_id = {d['goalId']: d for d in d6['decisions'] + s3['decisions']}
profiles = {d['goalId']: d['wholeOriginalPProfileBody'] for d in read(SOURCE / 'blind-inputs/scope-three-original-scientific-bodies-and-native-page-sources.only.json')['goals']}
metadata = read(OWN / 'MODEL.actual-turn-context.B2.json')
run_id = 'chemie-next-nine-fresh-blind-b2-20261015-v1'
records = []
for g in inp['goals']:
    d = first_by_id[g['goalId']]
    evidence = d.get('understandingEvidence')
    if evidence is None:
        # Exact unchanged authorised P wording supplies the old Science chain.
        # No new Science or P judgment is authored for these three scope rows.
        p = profiles[g['goalId']]
        evidence = {}
        for lang in ['De', 'En']:
            for field in ['essentialUnderstanding', 'observablePerformance']:
                evidence[field + lang] = ' '.join(e[field + lang] for e in p['expectations'])
            evidence['transferExpectation' + lang] = p['applicationCaseBriefs'][-1]['expectedPerformance' + lang]
    rationale = d['rationaleDe'] + ' ' + d['rationaleEn']
    if d.get('scientificReuseOnly'):
        rationale += ' Reine aktuelle Scope-/Seitenbindung; die sechs Verständnisangaben sind unveränderte Sätze des ausdrücklich wiederverwendeten alten ganzen P-Körpers (Transfer: erwartete Leistung des frischen letzten Falls), keine neue Vollscience-/P-Prüfung.'
    else:
        rationale += ' ' + d['sourceBoundary'] + ' ' + d['evidenceProfileRecommendationBoundary']
    assert len(rationale) <= 4000
    record = {'$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json', 'schemaVersion': 1, 'recordId': 'chemie-fresh-b2-' + g['goalId'] + '-20261015', 'runId': run_id, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'], 'bundleFingerprint': campaign['bundleFingerprint'], 'bookDigest': campaign['bookDigest']}
    record.update({k: g[k] for k in ['goalId', 'goalFingerprint', 'pageFingerprint', 'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn']})
    record.update({'decision': d['decision'], 'understandingEvidence': evidence, 'rationale': rationale, 'evidenceProfileContract': 'positive-understanding-evidence-v2', 'evidenceProfileRecommendation': d['evidenceProfileRecommendation'], 'recordStatus': 'candidate', 'reviewAuthority': 'ai_candidate'})
    records.append(record)

out = OWN / 'round-b/results'
out.mkdir(parents=True)
batch_id = campaign['batches'][0]['batchId']
records_path = out / (batch_id + '.records.jsonl')
records_path.write_text(''.join(json.dumps(r, ensure_ascii=False, separators=(',', ':')) + '\n' for r in records))
for line in records_path.read_text().splitlines():
    json.loads(line)
generation = {'provider': metadata['sessionMetaProvider'], 'model': metadata['model'], 'effort': metadata['effort'], 'turnId': metadata['turnId'], 'temperature': 'not disclosed', 'modelSnapshot': 'not disclosed', 'metadataSource': 'own actual turn_context', 'firstSeal': ref(OWN / 'SEAL.FIRST.B2.json')}
(OWN / 'GENERATION.actual-turn-context.B2.json').write_text(json.dumps(generation, ensure_ascii=False, indent=2) + '\n')
run = {'$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json', 'schemaVersion': 1, 'runId': run_id, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'], 'batchId': batch_id, 'batchInputFingerprint': campaign['batches'][0]['batchInputFingerprint'], 'bundleFingerprint': campaign['bundleFingerprint'], 'bookDigest': campaign['bookDigest'], 'provider': metadata['sessionMetaProvider'], 'model': metadata['model'], 'role': 'subject_reviewer', 'promptFamilyId': 'goal-description-understanding-evidence-review-v2', 'promptFingerprint': campaign['promptFingerprint'], 'criteriaFingerprint': campaign['criteriaFingerprint'], 'generationParametersFingerprint': digest((OWN / 'GENERATION.actual-turn-context.B2.json').read_bytes()), 'independenceGroupId': campaign['independenceGroupId'], 'blindToOtherRuns': True, 'goalIds': [g['goalId'] for g in inp['goals']], 'inputArtifacts': [{'role': a['role'], 'digest': a['digest']} for a in bundle['artifacts']] + [{'role': 'description_review_batch_input_jsonl', 'digest': campaign['batches'][0]['batchInputFingerprint']}], 'startedAt': metadata['turnContextTimestamp'], 'completedAt': datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00', 'Z'), 'status': 'completed', 'outputDigest': digest(records_path.read_bytes()), 'toolchainVersion': 'codex-stock-goal-description-review-v1'}
(out / (batch_id + '.run.json')).write_text(json.dumps(run, ensure_ascii=False, indent=2) + '\n')
host_receipt = {'schemaVersion': 1, 'host': str(HOST.relative_to(ROOT)), 'stockModulesCopiedByteExact': sorted(module_refs, key=lambda a: a['path']), 'schemaFilesCopied': [ref(p) for p in sorted(schema_paths)], 'nodeModules': 'local app/node_modules symlink', 'dataPolicy': 'Final data read only by exact original references; no image, PDF, native bundle, candidate data or peer review copied.', 'regularFileBytes': sum(p.stat().st_size for p in HOST.rglob('*') if p.is_file() and not p.is_symlink()), 'scope': 'Validator and stock fingerprint functions only; no native or central build'}
(OWN / 'HOST.byte-exact-stock-modules.B2.json').write_text(json.dumps(host_receipt, ensure_ascii=False, indent=2) + '\n')
for f in seal['files']:
    assert digest((ROOT / f['path']).read_bytes()) == f['sha256']
print(json.dumps({'records': len(records), 'scopeOnlyReuse': 3, 'hostRegularBytes': host_receipt['regularFileBytes'], 'hostStockModuleCount': len(module_refs), 'model': metadata['model'], 'effort': metadata['effort']}))
