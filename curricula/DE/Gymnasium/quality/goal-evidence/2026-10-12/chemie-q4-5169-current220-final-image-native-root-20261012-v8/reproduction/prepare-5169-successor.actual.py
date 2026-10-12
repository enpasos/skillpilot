from pathlib import Path
import json, shutil, subprocess, hashlib

R=Path('/home/enpasos/projects/skillpilot')
E=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12'
B=E/'chemie-q4-eleven-current220-preserving-root-preparation-20261012-v5'
N=E/'chemie-q4-5169-current220-final-image-native-root-20261012-v8'
IMG=E/'chemie-q4-5169-gibbs-image-author-root-20261012-v7'
I=R/'tmp/chemie-q4-current220-prep/image-import-capsule'
X=R/'tmp/chemie-q4-current220-prep/execution'
G='5169bb6b-f065-5798-8164-9b4521e44ae8'
rp=lambda p:str(p.relative_to(R))
rd=lambda p:json.loads(p.read_text())
sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def wr(p,d):
 p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists(),p;p.write_text(json.dumps(d,indent=2,ensure_ascii=False)+'\n')
def cp(s,d):
 d.parent.mkdir(parents=True,exist_ok=True);assert not d.exists(),d;shutil.copyfile(s,d)
assert not N.exists()
target=I/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
shutil.copyfile(B/'candidate/canonical523.current220-plus-Q4.inactive.json',target)
logs=[]
for cmd in [
 ['node',str(I/'scripts/prepare_goal_visualization.mjs'),G,'--landscape='+str(target),'--subject=chemie','--provider=OpenAI / ChatGPT-Codex image generation'],
 ['node',str(I/'scripts/import_goal_visualization.mjs'),G,str(IMG/f'{G}.png'),'--landscape='+str(target),'--subject=chemie','--provider=OpenAI / ChatGPT-Codex image generation','--prompt='+str(IMG/'actual-imagegen-tool-prompt.txt'),'--alt-text=Sechs gleiche blaue Gasteilchen verteilen sich auf ein größeres Volumen. Daneben zeigt die Gibbs-Gleichung bei konstantem T und p die Spontanitätsbedingungen. Spontanität ist keine Aussage über Geschwindigkeit und ist auch bei endothermen Vorgängen möglich.']
]:
 p=subprocess.run(cmd,cwd=I,text=True,capture_output=True);logs.append(p.stdout+p.stderr)
 if p.returncode:raise RuntimeError(p.stdout+p.stderr)
cp(target,N/'candidate/canonical523.current-plus-Q4-and-corrected5169.inactive.json')
old={g['id']:g for g in rd(B/'candidate/canonical523.current220-plus-Q4.inactive.json')['goals']}
now=rd(target);changed=[g['id'] for g in now['goals'] if old[g['id']]!=g];assert changed==[G],changed
cp(IMG/f'{G}.png',N/'assets'/f'{G}.png')
for p in (I/'curricula/DE/Gymnasium/visualizations/chemie'/G).iterdir():
 if p.name in [f'{G}.png','prompt.de.md']:cp(p,N/'assets/imported-source'/G/p.name)
pub=X/'app/public/assets/goal-visualizations/chemie'/G/f'{G}.png';pub.parent.mkdir(parents=True,exist_ok=True);assert not pub.exists();shutil.copyfile(IMG/f'{G}.png',pub)
q=rd(B/'candidate/QA.current-plus-four-actual-B-asset-reviews.inactive.json')
row=next(x for x in q['records'] if x['goalId']==G)
row.update(imageUrl=f'/assets/goal-visualizations/chemie/{G}/{G}.png',publicAssetPath=f'app/public/assets/goal-visualizations/chemie/{G}/{G}.png',canonicalAssetPath=rp(N/'assets'/f'{G}.png'),assetSha256=sha(IMG/f'{G}.png'),aiApproved='no',aiApprovedAssetSha256='',aiNotes='Corrected author candidate, fresh independent V/native review pending. Historical human and legacy fields retained; not transferred to the new PNG.')
wr(N/'candidate/QA.new5169.pending-independent.inactive.json',q)
pc=rd(B/'configs/P11.inactive.config.json');pc.update(landscapePath=rp(N/'candidate/canonical523.current-plus-Q4-and-corrected5169.inactive.json'),reviewPath=rp(N/'positive/P11.same-author-profiles-one-new-image.normal.jsonl'))
wr(N/'configs/P11.inactive.config.json',pc)
fc=rd(B/'configs/whole402.inactive.config.json');fc.update(bookId='chemie-q4-current220-corrected5169-v8',landscapePath=pc['landscapePath'],goalVisualizationQaPath=rp(N/'candidate/QA.new5169.pending-independent.inactive.json'),evidenceReviewPaths=[rp(B/'positive/current220.records.raw-lines-exact.jsonl'),pc['reviewPath']],outputPath=rp(N/'native/whole402.one-image-successor.normal-model.json'))
wr(N/'configs/whole402.inactive.config.json',fc)
bc=rd(B/'configs/native-D11.batch.config.json');bc.update(batchId='chemie-q4-5169-current220-final-image-native-20261012-v8',bookId='chemie-q4-5169-current220-final-native-v8',title='Chemie – Entropie und freie Enthalpie: gezielte Bildkorrektur',baseGoalBookConfigPath=rp(N/'configs/whole402.inactive.config.json'),goalIds=[G],outputDirectory=rp(N/'native-D1'))
wr(N/'configs/native-D1.batch.config.json',bc)
(N/'checks').mkdir(parents=True,exist_ok=True);(N/'checks/normal-prepare-import.actual.txt').write_text('\n'.join(logs))
wr(N/'checks/exact-one-image-canonical-transfer.actual.json',{'role':'Inactive normal import, no scientific approval','changedSinceQ4v5':[G],'other522WholeBodiesExact':True,'oldCandidate':rp(B/'candidate/canonical523.current220-plus-Q4.inactive.json'),'oldCandidateSHA':sha(B/'candidate/canonical523.current220-plus-Q4.inactive.json'),'newCandidateSHA':sha(target),'newAssetSHA':sha(IMG/f'{G}.png'),'activeWrites':False,'humanApproval':False,'strictGain':0})
print(json.dumps({'prepared':rp(N),'onlyChangedGoal':G,'activeWrites':False}))
