#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Bounded inactive author continuation. Original inputs and independent seals stay untouched."""
import copy, hashlib, json, shutil
from datetime import datetime, timezone
from pathlib import Path

R = Path.cwd()
P = Path(__file__).resolve().parent
E = R / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11'
OLD = E / 'biologie-medical-ethics-ten-current369-author-candidate-20261011-v1'
BASE = E / 'biologie-bio8-current369-combined-Bio3-targeted-author-successor-20261011-v6'

def load(p): return json.loads(p.read_text())
def digest(p): return 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()
def ref(p): return {'path': str(p.relative_to(R)), 'sha256': digest(p), 'bytes': p.stat().st_size}
def put(name, value):
    p = P / name
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
def cp(src, name):
    dst = P / name
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)
    assert digest(src) == digest(dst)
    return ref(dst)

assert digest(BASE / 'FINAL.neutral-whole397-current369-Bio3-combined-Bio8-author.join.json') == 'sha256:2e26b74b7c2c7c8d34858d5ea2a4c02316ec73623467c1e2de922f5c2c962b9f'
assert digest(BASE / 'FINAL.author-package.freeze.json') == 'sha256:e6664e02a07f85e8908eb393e34d1110b15f7bd31cb581af84f9f43e46615740'
ids = load(OLD / 'FIRST.actual-neutral-current-medical-ethics-ten-author-inputs.json')['goalIds']
assert len(ids) == len(set(ids)) == 10
base_path = BASE / 'candidate/whole484-current369-Bio3-combined.author.inactive.json'
old_path = OLD / 'candidate/whole480-current395.medical-ten.inactive.json'
original = load(base_path)
land = copy.deepcopy(original)
older = {g['id']: g for g in load(old_path)['goals']}
changes = []
for g in land['goals']:
    if g['id'] not in ids: continue
    before = copy.deepcopy(g)
    for field in ['title', 'titleEn', 'description', 'descriptionEn', 'resourceLinks']:
        g[field] = copy.deepcopy(older[g['id']][field])
    changes.append({'goalId': g['id'], 'changedFields': [k for k in g if g[k] != before.get(k)], 'before': before, 'after': g})
assert len(land['goals']) == 484
assert all(a == b for a,b in zip(original['goals'], land['goals']) if a['id'] not in ids)
put('candidate/whole484-current397-medical10.author.inactive.json', land)
cp(BASE / 'candidate/kinds484-current397.author-classification-only.json', 'candidate/kinds484-current397.exact.json')

inventory = load(OLD / 'images/actual-generated-ten-inventory.json')
assert [x['goalId'] for x in inventory] == ids
portable = []
for x in inventory:
    gid = x['goalId']
    for folder in ['curricula/DE/Gymnasium/visualizations/biologie','app/public/assets/goal-visualizations/biologie','backend/src/main/resources/static/assets/goal-visualizations/biologie']:
        for f in (OLD / 'portable' / folder / gid).iterdir():
            portable.append({'normalTargetPath': str(f.relative_to(OLD / 'portable')), 'exactCandidateCopy': cp(f, 'portable/' + str(f.relative_to(OLD / 'portable')))})
    for f in (OLD / 'images' / gid).iterdir():
        if f.is_file(): cp(f, 'images/' + gid + '/' + f.name)
    image = P / 'images' / gid / (gid + '.png')
    assert digest(image) == 'sha256:' + x['sha256'].removeprefix('sha256:')
    x['previousAuthorImageBinding'] = ref(OLD / 'images' / gid / (gid + '.png'))
    x['packagePath'] = str(image.relative_to(R))
    x['authorVisualStatus'] = 'previous author raster retained; this continuation author inspection pending; independent approval pending'
put('images/ten-original-images.exact-author-input-inventory.json', inventory)
put('portable/normal-assets.exact-author-adoption-files.json', portable)
cp(OLD / 'profiles/ten-positive-profile-content.author.json', 'profiles/ten-positive-content.raw-author-input.exact.json')

qa = load(BASE / 'candidate/QA397-currentRoot-Bio3-plus-Bio8.author-namespace-only.json')
by = {g['id']: g for g in land['goals']}
for q in qa['records']:
    if q['goalId'] not in ids: continue
    g = by[q['goalId']]
    link = next(l for l in g['resourceLinks'] if l['type'] == 'goal-visualization')
    im = next(x for x in inventory if x['goalId'] == g['id'])
    q.update({'title':g['title'], 'description':g['description'], 'visualizationState':'available', 'missingReason':'',
              'imageUrl':link['url'], 'publicAssetPath':'app/public'+link['url'],
              'canonicalAssetPath':'curricula/DE/Gymnasium/visualizations/biologie/'+g['id']+'/'+g['id']+'.png',
              'assetSha256':'sha256:'+im['sha256'].removeprefix('sha256:'),
              'aiApproved':'no', 'aiApprovedAssetSha256':'', 'aiReviewedAt':None, 'aiReviewer':'',
              'aiNotes':'Inactive author candidate only; actual image inspection and independent V approval pending.',
              'humanApproved':'no','humanReviewedAt':None,'humanReviewer':''})
    q['landscapePath'] = str((P / 'candidate/whole484-current397-medical10.author.inactive.json').relative_to(R))
put('candidate/QA397-medical10.author-image-bindings-no-approval.json',qa)

atlas = load(BASE / 'sources/normal397-currentRoot-Bio3-plus-Bio8.author.inputs.json')
atlas['landscapePath'] = str((P / 'candidate/whole484-current397-medical10.author.inactive.json').relative_to(R))
atlas['semanticKindLedgerPath'] = str((P / 'candidate/kinds484-current397.exact.json').relative_to(R))
atlas['outputDirectory'] = str((P / 'sources/normal-output/source-views').relative_to(R))
atlas['manifestPath'] = str((P / 'sources/normal-output/atlas.sources.json').relative_to(R))
atlas['navigationViewPath'] = str((P / 'sources/normal-output/navigation.view.json').relative_to(R))
put('sources/normal397-medical10.author.inputs.json',atlas)
cfg = load(BASE / 'native/whole397.currentRoot-Bio3-plus-Bio8.normal.config.json')
cfg.update({'title':'Biologie – aktueller397-Kandidat mit zehn medizinisch-ethischen Autorenprodukten',
            'landscapePath':atlas['landscapePath'],'semanticKindLedgerPath':atlas['semanticKindLedgerPath'],
            'goalVisualizationQaPath':str((P/'candidate/QA397-medical10.author-image-bindings-no-approval.json').relative_to(R)),
            'compositionViewManifestPath':atlas['manifestPath'],
            'outputPath':str((P/'native/whole397-medical10.normal-model.actual.json').relative_to(R))})
cfg['evidenceReviewPaths'].append(str((P/'positive/P10-medical.author-pending.review.jsonl').relative_to(R)))
put('native/whole397-medical10.normal.config.json',cfg)
put('checks/bounded-ten-goal-author-changes.actual.json',{'basis':ref(base_path),'earlierMedicalAuthor':ref(old_path),
    'wholeGoals':484,'curricularAtomic':397,'changedGoalIds':ids,'changes':changes,'other474GoalsExact':True,
    'protected369ScienceRetained':True,'newScientificClosures':0,'activeWrites':False})
put('FIRST.actual-neutral-medical10-continuation-author-inputs.json',{'role':'AUTHOR raw continuation; no independent reviewer',
    'createdAtUTC':datetime.now(timezone.utc).isoformat(),'goalIds':ids,'baseNeutralJoin':ref(BASE/'FINAL.neutral-whole397-current369-Bio3-combined-Bio8-author.join.json'),
    'baseAuthorFreeze':ref(BASE/'FINAL.author-package.freeze.json'),'whole397Baseline':ref(base_path),
    'earlierMedicalAuthor':ref(old_path),'earlierNeutralFirst':ref(OLD/'FIRST.actual-neutral-current-medical-ethics-ten-author-inputs.json'),
    'earlierNormalSourceContext':ref(OLD/'inputs/ten-normal-source-page-and-whole-direct-mapping-context.neutral.json'),
    'earlierProfileContent':ref(OLD/'profiles/ten-positive-profile-content.author.json'),
    '10ImageInputs':inventory,'sourcePairs':31,'nativePagesExpected':'actual affected union; at least ten',
    'independentPeerVerdictsRead':False,'authorRoleMeansNotIndependentMedicalReviewer':True,
    'activeWrites':False,'humanApproval':False,'humanTrial':False,'strictGainClaimed':0})
print(json.dumps({'goals':484,'atomic':397,'medical':10,'allOther474Exact':True,'imageCopies':len(portable),'activeWrites':False}))
