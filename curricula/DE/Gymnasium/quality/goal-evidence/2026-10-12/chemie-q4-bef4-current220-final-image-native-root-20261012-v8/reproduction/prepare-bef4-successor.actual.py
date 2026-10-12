from pathlib import Path
import json,shutil,subprocess,hashlib
R=Path('/home/enpasos/projects/skillpilot');E=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12'
B=E/'chemie-q4-5169-current220-final-image-native-root-20261012-v8'
Q=E/'chemie-q4-eleven-current220-preserving-root-preparation-20261012-v5'
N=E/'chemie-q4-bef4-current220-final-image-native-root-20261012-v8'
IMG=E/'chemie-q4-bef4-coupling-image-author-root-20261012-v7'
G='bef4c8eb-1d80-50fb-88cd-3a9904e38b4e';I=R/'tmp/chemie-q4-current220-prep/image-import-capsule';X=R/'tmp/chemie-q4-current220-prep/execution'
rd=lambda p:json.loads(p.read_text());rp=lambda p:str(p.relative_to(R));sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def wr(p,d):
 p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists();p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def cp(s,d):
 d.parent.mkdir(parents=True,exist_ok=True);assert not d.exists();shutil.copyfile(s,d)
assert not N.exists();pc=rd(B/'configs/P11.inactive.config.json');fc=rd(B/'configs/whole402.inactive.config.json');prior=R/pc['landscapePath'];target=I/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';shutil.copyfile(prior,target)
commands=[['node',str(I/'scripts/prepare_goal_visualization.mjs'),G,'--landscape='+str(target),'--subject=chemie','--provider=OpenAI / ChatGPT-Codex image generation'],['node',str(I/'scripts/import_goal_visualization.mjs'),G,str(IMG/f'{G}.png'),'--landscape='+str(target),'--subject=chemie','--provider=OpenAI / ChatGPT-Codex image generation','--prompt='+str(IMG/'actual-imagegen-tool-prompt.txt'),'--alt-text=Ein exergoner und ein endergoner Reaktionsanteil greifen als Puzzleteile ineinander: Ein gemeinsamer Reaktionsweg hat eine negative gesamte Gibbs-Energieänderung. Bei konstantem T und p ohne weitere Nutzarbeit entspricht die Abnahme der gesamten Gibbs-Energie der Temperatur mal erzeugter Entropie.']]
logs=[]
for cmd in commands:
 z=subprocess.run(cmd,cwd=I,text=True,capture_output=True);logs.append(z.stdout+z.stderr);assert z.returncode==0,z.stdout+z.stderr
can=N/'candidate/canonical523.current-Q4-with-two-final-images.inactive.json';cp(target,can)
old={g['id']:g for g in rd(prior)['goals']};changed=[g['id'] for g in rd(target)['goals'] if old[g['id']]!=g];assert changed==[G]
cp(IMG/f'{G}.png',N/'assets'/f'{G}.png')
for p in (I/'curricula/DE/Gymnasium/visualizations/chemie'/G).iterdir():
 if p.name in [f'{G}.png','prompt.de.md']:cp(p,N/'assets/imported-source'/G/p.name)
pub=X/'app/public/assets/goal-visualizations/chemie'/G/f'{G}.png';pub.parent.mkdir(parents=True,exist_ok=True);assert not pub.exists();shutil.copyfile(IMG/f'{G}.png',pub)
sem=rd(R/pc['semanticKindLedgerPath']);sem['sourceLandscapePath']=rp(can);sp=N/'candidate/semantic523.same-decisions-new-path.inactive.json';wr(sp,sem)
qa=rd(R/fc['goalVisualizationQaPath']);row=next(q for q in qa['records'] if q['goalId']==G);row.update(imageUrl=f'/assets/goal-visualizations/chemie/{G}/{G}.png',publicAssetPath=f'app/public/assets/goal-visualizations/chemie/{G}/{G}.png',canonicalAssetPath=rp(N/'assets'/f'{G}.png'),assetSha256=sha(IMG/f'{G}.png'),aiApproved='no',aiApprovedAssetSha256='',aiNotes='Actual author correction of dimensional energy/entropy conflict; fresh independent image/native reading pending. No human or legacy approval transferred.')
qp=N/'candidate/QA.two-new-images.pending-independent.inactive.json';wr(qp,qa)
pc.update(landscapePath=rp(can),semanticKindLedgerPath=rp(sp),reviewPath=rp(N/'positive/P11.current-two-images.normal.review.jsonl'));wr(N/'configs/P11.inactive.config.json',pc)
fc.update(bookId='chemie-q4-current220-two-image-successors-v8',landscapePath=rp(can),semanticKindLedgerPath=rp(sp),goalVisualizationQaPath=rp(qp),evidenceReviewPaths=[rp(Q/'positive/current220.records.raw-lines-exact.jsonl'),pc['reviewPath']],outputPath=rp(N/'native/whole402.two-image-successor.normal-model.json'));wr(N/'configs/whole402.inactive.config.json',fc)
bc=rd(Q/'configs/native-D11.batch.config.json');bc.update(batchId='chemie-q4-bef4-current220-final-image-native-20261012-v8',bookId='chemie-q4-bef4-final-native-v8',title='Chemie – energetische Kopplung: gezielte Bildkorrektur',baseGoalBookConfigPath=rp(N/'configs/whole402.inactive.config.json'),goalIds=[G],outputDirectory=rp(N/'native-D1'));wr(N/'configs/native-D1.batch.config.json',bc)
(N/'checks').mkdir(parents=True,exist_ok=True);(N/'checks/normal-prepare-import.actual.txt').write_text('\n'.join(logs))
wr(N/'checks/exact-one-image-transfer.actual.json',{'role':'Actual inactive normal image import; no scientific approval','priorCandidate':rp(prior),'priorSHA':sha(prior),'changedGoalIds':changed,'other522WholeBodiesExact':True,'previousCorrected5169BodyExact':True,'humanApproval':False,'activeWrites':False,'strictGain':0})
print(json.dumps({'prepared':rp(N),'newImage':G,'previousGibbsCorrectionPreserved':True,'activeWrites':False}))
