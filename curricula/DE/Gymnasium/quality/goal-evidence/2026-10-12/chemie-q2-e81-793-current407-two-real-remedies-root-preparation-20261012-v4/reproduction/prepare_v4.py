# SPDX-License-Identifier: Apache-2.0
"""Additive current-input preparation. No scientific votes or active writes."""
import datetime
import hashlib
import json
import re
import shutil
from pathlib import Path

R = Path('/home/enpasos/projects/skillpilot')
E = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12')
B = E / 'chemie-q2-naturstoffe-current407-targeted-remediation-root-preparation-20261012-v3/later-stage-source6'
O = E / 'chemie-q2-e81-793-current407-two-real-remedies-root-preparation-20261012-v4'
EA = E / 'chemie-q2-e81-and-978-current407-operative-material-scope-author-successor-20261012-v4'
HE = E / 'chemie-q2-MM-HE-context-normative-edge-removal-author-20261012-v4'
IM = E / 'chemie-q2-793-gc-three-bonds-sugar-attachment-author-root-20261012-v4'
CAP = R / 'tmp/chemie-n2-current-D2-normal-capsule'
OLD_CAP = R / 'tmp/chemie-current407-root-v3-normal-capsule'
DNA = '793189f8-78bd-5204-848b-fd2bbc12e458'
LAB = 'e81a4aed-9695-533e-8eb7-7a0c714346ea'
IDS = [LAB, DNA]

def read(p):
    return json.loads((R / p).read_text())

def put(p, value):
    path = R / p
    assert not path.exists(), path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def sha(p):
    return 'sha256:' + hashlib.sha256((R / p).read_bytes()).hexdigest()

def ref(p):
    return {'path': str(p), 'sha256': sha(p), 'bytes': (R / p).stat().st_size}

def lines(p):
    return [s for s in (R / p).read_text().splitlines() if s.strip()]

def put_lines(p, rows):
    path = R / p
    assert not path.exists(), path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(''.join(s + '\n' for s in rows))

assert not (R / O).exists()
assert not CAP.exists()
verified = []
for p in [B/'FINAL.technical-preparation.freeze.json', EA/'FINAL.author-successor.freeze.json', HE/'FINAL.author-provenance-successor.freeze.json']:
    d = read(p)
    records = d.get('ownFiles', d.get('ownedFiles'))
    assert isinstance(records, list)
    for row in records:
        q = Path(row['path'])
        assert sha(q) == row['sha256'] and (R / q).stat().st_size == row['bytes'], q
    verified.append({**ref(p), 'ownedFilesVerified': len(records)})

# The actual image was inspected full size and in both browser display sizes.
obs = IM / 'ROOT.actual-full-360-680-author-observations.json'
put(obs, {
    'artifactRole': 'Informed author actual visual observation; not independent approval',
    'createdAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'asset': ref(IM / f'{DNA}.png'),
    'actualFullImageViewed': True, 'actual360pxViewed': True, 'actual680pxViewed': True,
    'observations': [
        'AT and TA each have two separate dashed hydrogen-bond lines; GC and CG each have three.',
        'Bases visibly connect to green pentose sugar nodes, not yellow phosphate nodes.',
        'Phosphates alternate with sugars along unbranched backbones; the DNA ladder is explicitly schematic.',
        'At both actual display sizes the base letters, two-versus-three bond lines and nucleotide building block remain distinguishable.',
    ],
    'format': 'Opaque PNG, 1672 by 941, near 16:9; friendly existing visual language retained.',
    'oldImageAndOriginalIndependentDissentPreserved': True,
    'newIndependentVotes': 0, 'strictGain': 0,
    'humanApproval': False, 'humanTrial': False, 'activeOrGitWrites': False,
})
im_files = sorted(p for p in (R / IM).rglob('*') if p.is_file())
im_seal = IM / 'FINAL.author-image-successor.freeze.json'
put(im_seal, {'artifactRole': 'Additive informed-author image successor seal',
    'ownFiles': [ref(p.relative_to(R)) for p in im_files],
    'newIndependentAcceptancePending': True, 'newIndependentVotes': 0,
    'strictGain': 0, 'activeOrGitWrites': False})
verified.append({**ref(im_seal), 'ownedFilesVerified': len(im_files)})

# All whole canonical goals and requirements stay byte-semantically exact.
original = B/'candidate/canonical532.current-active-plus-N2-P9-source6-ee4.inactive.json'
canonical = O/'candidate/canonical532.whole-goals-exact.current407.inactive.json'
put(canonical, read(original))
qa_path = O/'candidate/visualization-QA.actual-793-successor.pending.json'
qa = read(B/'candidate/visualization-QA.current-exact-assets.pending.json')
q = next(x for x in qa['records'] if x['goalId'] == DNA)
old_sha = q['assetSha256']
q['assetSha256'] = sha(IM/f'{DNA}.png')
q['chatGptNotes'] = 'Actual corrected GC three-bond and base-sugar attachment PNG candidate; independent current review pending.'
q['aiNotes'] = 'Informed author correction only; no machine independent or human approval claimed.'
assert q['humanApproved'] == 'no' and q['aiApproved'] == 'no'
put(qa_path, qa)
sem = B/'candidate/semantic407.current-normal-input.json'

old_rows = lines(B/'positive/P37.current-whole-retained-and-targeted.pending.review.jsonl')
by_id = {json.loads(s)['goalId']: s for s in old_rows}
assert len(by_id) == 37
retained = O/'positive/P35.other-whole-record-lines.exact.jsonl'
put_lines(retained, [s for s in old_rows if json.loads(s)['goalId'] not in IDS])
e81_lines = lines(EA/'positive/P1.e81-only.actual-bound.informed-author.review.jsonl')
assert len(e81_lines) == 1 and json.loads(e81_lines[0])['goalId'] == LAB
e81_p = O/'positive/P1.e81-operative-author.exact.jsonl'
put_lines(e81_p, e81_lines)
cfg = read(EA/'positive/P1.e81-only.normal-inactive.config.json')
cfg.update(landscapePath=str(canonical), semanticKindLedgerPath=str(sem), reviewPath=str(e81_p))
put(O/'configs/P1.e81-operative.inactive.config.json', cfg)
cfg = read(E/'chemie-q2-naturstoffe-current407-targeted-remediation-root-preparation-20261012-v3/configs/P3.current-tuple.inactive.config.json')
review_id = 'chemie-q2-793-real-dna-image-current407-root-preparation-20261012-v4'
new_p = O/'positive/P1.793-current-image.normal-materialized.pending.jsonl'
cfg.update(reviewId=review_id, landscapePath=str(canonical), semanticKindLedgerPath=str(sem), reviewPath=str(new_p), scope={'label':'Exactly unchanged whole scientific profile; actual new DNA image tuple; independent acceptance pending', 'goalIds':[DNA]})
put(O/'configs/P1.793-current-image.inactive.config.json', cfg)
put(O/'positive/P1.793-unchanged-whole-profile.candidate-set.json', {
    'schemaVersion':1, 'authoringContract':'positive-understanding-evidence-candidates-v1',
    'reviewId':review_id, 'reviewedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'reviewer':'Codex root informed technical preparer; zero independent acceptance votes',
    'goals':[{'goalId':DNA, 'reason':'Whole scientific profile and cases retained exactly; actual GC three-bond and sugar-attachment PNG corrected. Normal API binds this new image for genuine current independent review. No learner execution or human approval claimed.',
        'evidenceLevel':'E1','maximumClaimScope':'G1','dissent':[], 'profile':json.loads(by_id[DNA])['profile']}],
})

# Whole case bodies are explicit, without contradictory original operative wrappers.
cases = [x for x in read(B/'cases/P37.unique-whole-case-and-current-brief-bindings.json')['cases'] if x['goalId'] == DNA]
e81_cases = read(EA/'cases/whole4.e81-only.current-operative.DEEN.material-protocol-solutions-rubrics.json')['cases']
put(O/'cases/two-goals-six-whole-operative-cases.DEEN.json', {
    'role':'Full operative scientific material, exact new e81 successor plus unchanged DNA whole cases',
    'DNAWholeCasesExact':cases, 'e81WholeOperativeCasesExact':e81_cases,
    'historicalContradictoryMaterialIsOperative':False,
    'historicalMaterialReferences':read(EA/'historical/original-material-links.non-operative.json'),
    'newIndependentVotes':0, 'actualLearnerExecutionClaimed':False,
})

full = read(B/'native/full407.current.actual.config.json')
full.update(bookId='chemie-current407-e81-793-real-remedies-v4', landscapePath=str(canonical), semanticKindLedgerPath=str(sem), goalVisualizationQaPath=str(qa_path), outputPath=str(O/'native/full407.two-remedies.normal-model.json'))
full['evidenceReviewPaths'] = [str(retained), str(e81_p), str(new_p), *full['evidenceReviewPaths'][1:]]
put(O/'configs/full407.two-remedies.inactive.config.json', full)

source_cfg = read(B/'atlas/normal-source-inputs.capsule.config.json')
old_he = str(B/'sources/HE.whole-clauses-AA-TLC-owner-and-MM-context.inactive.review.json')
new_he = str(HE/'sources/HE.whole-clauses-retained-partners-MM-context-excluded.inactive.review.json')
assert source_cfg['mappingPaths'].count(old_he) == 1
source_cfg['mappingPaths'] = [new_he if p == old_he else p for p in source_cfg['mappingPaths']]
source_cfg.update(landscapePath=str(canonical), semanticKindLedgerPath=str(sem))
source_cfg.pop('expectedCurricularAtomicGoalCount', None)  # Measure actual union after normative correction.
source_cfg.update(outputDirectory=str(O/'atlas/compiled-source-views'), manifestPath=str(O/'atlas/atlas.sources.normal.json'), navigationViewPath=str(O/'atlas/navigation.normal.view.json'))
put(O/'configs/source32-one-HE-context-removal.actual.inputs.json', source_cfg)

batch = {
    '$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-config.schema.json',
    'schemaVersion':1, 'batchId':'chemie-q2-e81-793-current407-two-real-remedies-root-20261012-v4',
    'subject':'chemie','subjectLabel':'Chemie','bookId':'chemie-q2-e81-793-current407-native-v4',
    'title':'Chemie – angeleitete Untersuchung und Nukleinsäuren',
    'baseGoalBookConfigPath':str(O/'configs/full407.two-remedies.inactive.config.json'),
    'goalIds':IDS,'outputDirectory':str(O/'native-D2'),
    'feedbackBaseUrl':'https://skillpilot.com/lernziel-feedback',
    'promptPath':'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md',
    'criteriaPath':'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-goal-description-understanding-evidence-review-criteria-v1.md',
    'publicRoot':'app/public','printDerivativeProfile':'standard',
}
put(O/'configs/native-D2.two-real-remedies.batch.config.json', batch)

# Small ignored capsule: exact production code, exact current images, no repository asset mutation.
CAP.mkdir(parents=True)
seen = set()
stack = [Path('app/scripts/materializePositiveGoalEvidenceCandidates.ts'),Path('app/scripts/materializeGoalDescriptionRolloutBatch.ts')]
while stack:
    p = stack.pop()
    if p in seen: continue
    seen.add(p)
    dst = CAP/p; dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(R/p,dst)
    if p.suffix not in {'.ts','.tsx','.js','.mjs'}:continue
    for spec in re.findall(r'(?:from\s*|import\s*)[\'\"]([^\'\"]+)[\'\"]',(R/p).read_text()):
        if not spec.startswith('.'):continue
        base=p.parent/spec
        opts=[base,Path(str(base)+'.ts'),Path(str(base)+'.tsx'),Path(str(base)+'.js'),Path(str(base)+'.json'),base/'index.ts']
        hit=next((x for x in opts if (R/x).is_file()),None)
        assert hit,(p,spec)
        stack.append(hit)
shutil.copytree(R/'contracts',CAP/'contracts')
(CAP/'curricula').symlink_to(R/'curricula',target_is_directory=True)
(CAP/'app/node_modules').symlink_to(R/'app/node_modules',target_is_directory=True)
shutil.copyfile(R/'app/package.json',CAP/'app/package.json')
assets=[]
for row in qa['records']:
    if row['visualizationState']!='available':continue
    src = R/IM/f'{DNA}.png' if row['goalId']==DNA else (OLD_CAP/row['publicAssetPath']).resolve()
    expected='sha256:'+hashlib.sha256(src.read_bytes()).hexdigest()
    assert expected==row['assetSha256'],row['goalId']
    dst=CAP/row['publicAssetPath'];dst.parent.mkdir(parents=True,exist_ok=True)
    if row['goalId'] in IDS:shutil.copyfile(src,dst)
    else:dst.symlink_to(src)
    assets.append({'goalId':row['goalId'],'path':str(src.relative_to(R)),'sha256':expected})
put(O/'assets/all412-actual-image-source-bindings.json',{'assets':assets,'actualChangedImageGoalIds':[DNA],'newIndependentVotes':0})
put(O/'checks/INITIAL.exact-bounded-inputs-and-historical-CAS.json', {
    'role':'Informed technical preparation, zero new independent votes',
    'originalSealsVerified':verified,'wholeCanonicalGoalCount':len(read(canonical)['goals']),
    'allWholeCanonicalGoalsExactTo266FileStage':read(canonical)==read(original),
    'changedNativeTupleScopeExpected':IDS,'unchangedOther35PLines':35,
    'actual412AvailableAssetsVerified':len(assets),'previousDNAImageSHA':old_sha,'currentDNAImageSHA':sha(IM/f'{DNA}.png'),
    'oneHEContextualNormativeTargetRemovalPrepared':True,
    'sourceSpecificReadinessAndBroadUnionAcceptanceRemainUnclaimed':True,
    'exactProductionCodeFiles':len(seen),'capsulePath':str(CAP),
    'newIndependentVotes':0,'strictGain':0,'activeOrGitWrites':False,
})
print(json.dumps({'out':str(O),'capsule':str(CAP),'availableAssets':len(assets),'canonicalWholeGoalsExact':True,'strictGain':0}))
