from pathlib import Path
import hashlib
import importlib.util
import json
import subprocess
import sys
from PIL import Image

OWN=Path(__file__).resolve().parent.parent
REPO=Path(__file__).resolve().parents[8]
E12=REPO/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12'
CAP=REPO/'tmp/chemie-q3-thirteen-author-v3-execution-capsule'
def digest(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def save(p,data):p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
seals=[('chemie-q3-thirteen-current402-live-context-author-20261012-v2','author-package.freeze.json',183),
       ('chemie-q3-thirteen-current402-independent-a-20261012-v2','independent-a.original.freeze.json',64),
       ('chemie-q3-thirteen-current402-independent-b-20261012-v2','ORIGINAL.judgment-seal.json',60)]
seal_receipts=[]
for folder,name,count in seals:
    path=E12/folder/name; seal=json.loads(path.read_text()); mismatches=[]
    for row in seal['rows']:
        p=REPO/row['path']
        if not p.is_file() or p.is_symlink() or p.stat().st_size!=row['bytes'] or digest(p)!=row['sha256']:mismatches.append(row['path'])
    assert len(seal['rows'])==count and not mismatches,(folder,mismatches)
    receipt={'originalSealPath':str(path.relative_to(REPO)),'sealSha256':digest(path),'sealedOriginalRows':count,'verifiedExactRows':count,'mismatches':mismatches,'changedOriginalFiles':0}
    save(OWN/f'checks/{folder}.original-seal.actual.json',receipt);seal_receipts.append(receipt)
parse_count=0
for p in sorted(OWN.rglob('*')):
    assert not p.is_symlink(),str(p)
    if p.suffix=='.json':json.loads(p.read_text());parse_count+=1
    if p.suffix=='.jsonl':
        for line in p.read_text().splitlines():
            if line.strip():json.loads(line)
        parse_count+=1
goals={g['id']:g for g in json.loads((OWN/'inputs/current523.author-successor.de.json').read_text())['goals']}
source_bounds=json.loads((OWN/'inputs/source-components-and-explicit-sibling-ownership.author.json').read_text())
assert all(row['wholeCurrentGoal']==goals[row['goalId']] for row in source_bounds['rows'])
images=json.loads((OWN/'visualization/five.generated-image-provenance.author.json').read_text())['rows'];image_receipts=[]
for row in images:
    gid=row['goalId'];paths=[OWN/f'visualization/staged/{root}/{gid}/{gid}.png' for root in ['curricula/DE/Gymnasium/visualizations/chemie','app/public/assets/goal-visualizations/chemie','backend/src/main/resources/static/assets/goal-visualizations/chemie']]
    hashes=[digest(p) for p in paths];assert hashes==[row['sha256']]*3
    with Image.open(paths[0]) as im:assert im.format=='PNG' and list(im.size)==row['nativeDimensions']
    link=next(l for l in goals[gid]['resourceLinks'] if l['type']=='goal-visualization')
    assert link['provider']=='OpenAI built-in image_gen' and link['license']=='CC-BY-4.0' and link['url'].endswith('.png')
    image_receipts.append({'goalId':gid,'canonicalFrontendBackendSha256':row['sha256'],'copies':3,'dimensions':row['nativeDimensions'],'normalImportedLink':True})
parent=json.loads((E12/seals[0][0]/'inputs/current523.author-successor.de.json').read_text());old_goals={g['id']:g for g in parent['goals']}
changed={r['goalId'] for r in images}
assert all(g==old_goals[gid] for gid,g in goals.items() if gid not in changed)
live=json.loads((E12/seals[0][0]/'inputs/current523.live-base.exact.de.json').read_text());live_goals={g['id']:g for g in live['goals']}
assert all(g.get('requires',[])==live_goals[gid].get('requires',[]) and g.get('contains',[])==live_goals[gid].get('contains',[]) for gid,g in goals.items())
fixes=['a44af1fa','4b6d1824','805a2f58','1351706f','413040cd']
fixed=[]
for prefix in fixes:
    gid=next(gid for gid in goals if gid.startswith(prefix));assert goals[gid]['applicability']==live_goals[gid]['applicability'];fixed.append(gid)
normal_args=[str(CAP/'app/node_modules/.bin/tsx'),'scripts/materializePositiveGoalEvidenceCandidates.ts','--config',str(CAP/OWN.relative_to(REPO)/'positive/P13.author.inactive.config.json'),'--candidates',str(CAP/OWN.relative_to(REPO)/'positive/P13.author.candidates.json')]
r=subprocess.run(normal_args,cwd=CAP/'app',text=True,capture_output=True)
(OWN/'checks/P-final-read-only-normal.stdout.actual.txt').write_text(r.stdout)
(OWN/'checks/P-final-read-only-normal.stderr.actual.txt').write_text(r.stderr)
assert r.returncode==0,r.stderr
sys.dont_write_bytecode=True
spec=importlib.util.spec_from_file_location('normal_schema_guard',REPO/'scripts/validate_schemas.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
link_errors=module.curriculum_symlink_errors(REPO);assert not link_errors,link_errors
record={'role':'targeted_author_checks_not_independent_review','jsonAndJsonlParsedFiles':parse_count,'wholeCanonicalGoals':len(goals),'currentDenominator':402,
 'exactOriginalSeals':seal_receipts,'fiveImageBindings':image_receipts,'unchangedOtherGoalCount':len(goals)-5,'allRequiresAndContainsPreserved':True,
 'fiveLiveB007ApplicabilityCorrectionsRetained':fixed,'sourceLedgerWholeGoalsMatchCurrent':True,'normalPReadOnlyCommand':normal_args,'normalPReadOnlyExitCode':r.returncode,
 'normalCurriculumSymlinkErrors':link_errors,'wholeSourceUnionApproval':False,'humanApproval':False,'humanTrial':False,'strictGain':0,'activeWrites':False}
save(OWN/'checks/targeted-author-final.actual.json',record)
print('Targeted normal P byte verification, original183/A64/B60 seals, five PNG triple copies, unchanged518 goals and five live applicability fixes: PASS.')
