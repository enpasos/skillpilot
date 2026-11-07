from pathlib import Path
import copy, gzip, hashlib, json, os, shutil, subprocess, tempfile, time

R=Path('/home/enpasos/projects/skillpilot'); O=Path(__file__).resolve().parent
ID='b819973b-4cad-48a4-9f7e-f74b5e75ea6c'; OLD='173f6e3e885ee50892849d69689585d3a5e785bbfe44b764419b2f6b6a515330'; NEW='e1bda233419154cd20aa46feae46d1fa2f480881a25bccc4c4d227623233ec07'
S='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
Q='curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json'
REG='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
GEN='qa-artifacts/ci-contract-audit/2026-11-07/boxplot-label-image-correction-candidate'
VR='qa-artifacts/ci-contract-audit/2026-11-07/boxplot-label-image-correction-independent-review/review.json'
def digest(b):return hashlib.sha256(b).hexdigest()
def read(p):return json.loads((R/p).read_bytes())
def dump(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def info(p):
 p=Path(p);return {'path':str(p.relative_to(R)) if p.is_relative_to(R) else str(p),'sha256':digest(p.read_bytes()),'bytes':p.stat().st_size}
W=Path(tempfile.mkdtemp(prefix='boxplot-private-activation-',dir='/dev/shm'));(W/'tmp').mkdir()
source=read(S); goal=next(g for g in source['goals'] if g['id']==ID); link=next(l for l in goal['resourceLinks'] if l['type']=='goal-visualization'); review=read(VR)
assert review['decision']=='PASS' and review['candidate']['sha256']==NEW
assert digest((R/GEN/f'{ID}-candidate-v2.png').read_bytes())==NEW
cfg=read(REG); subject=next(x for x in cfg['subjects'] if x['subject']=='mathematik')
pcfgs=[p for p in subject['positiveEvidenceConfigPaths'] if ID in read(p)['scope']['goalIds']];assert len(pcfgs)==1
PC=pcfgs[0];pcfg=read(PC);PR=pcfg['reviewPath'];prows=[json.loads(x) for x in (R/PR).read_text().splitlines() if x];prow=next(x for x in prows if x['goalId']==ID)
DI=[p for p in subject['resolutionIndexPaths'] if any(x['goalId']==ID for x in read(p)['resolutions'])];assert len(DI)==1;DI=DI[0]
assets=[f'curricula/DE/Gymnasium/visualizations/mathematik/{ID}/{ID}.png',f'app/public/assets/goal-visualizations/mathematik/{ID}/{ID}.png',f'backend/src/main/resources/static/assets/goal-visualizations/mathematik/{ID}/{ID}.png']
prompt=f'curricula/DE/Gymnasium/visualizations/mathematik/{ID}/prompt.de.md'
reconstruction=f'curricula/DE/Gymnasium/visualizations/mathematik/{ID}/image-reconstruction-prompt.de.md'
protected=[S,Q,REG,PC,PR,DI,subject['semanticAtomicityConfigPath'],subject['memoryReviewConfigPath'],prompt,*assets]
for c in [subject['semanticAtomicityConfigPath'],subject['memoryReviewConfigPath']]:protected.append(read(c)['reviewPath'])
guards={p:info(R/p) for p in protected};assert all(guards[p]['sha256']==OLD for p in assets)
dump(O/'before-input-guards.json',guards);dump(O/'whole-current-goal.json',goal);dump(O/'old-positive-profile.json',prow)
dump(O/'old-V-ledger-row.json',next(x for x in read(Q)['records'] if x['goalId']==ID))
shutil.copy2(R/prompt,O/'before-prompt.de.md')

# Native import, with only private writable files/directories mounted at their production paths.
shutil.copy2(R/S,W/'source.json')
for n,p in enumerate(assets):
 d=W/f'asset-dir-{n}';shutil.copytree((R/p).parent,d);assert digest((d/Path(p).name).read_bytes())==OLD
def prefix(extra=(),importing=False):
 a=['bwrap','--ro-bind','/','/','--dev-bind','/dev','/dev','--proc','/proc','--bind',str(W),str(W),'--setenv','TMPDIR',str(W/'tmp'),'--chdir',str(R)]
 if importing:
  a+=['--bind',str(W/'source.json'),str(R/S)]
  for n,p in enumerate(assets):a+=['--bind',str(W/f'asset-dir-{n}'),str((R/p).parent)]
 for src,dst in extra:a+=['--ro-bind',str(src),str(dst)]
 return a
def run(name,argv,extra=(),importing=False):
 a=prefix(extra,importing)+['--',*map(str,argv)];t=time.time();p=subprocess.run(a,capture_output=True)
 (O/f'{name}.stdout.txt').write_bytes(p.stdout);(O/f'{name}.stderr.txt').write_bytes(p.stderr)
 rec={'case':name,'argv':a,'exitCode':p.returncode,'elapsedSeconds':time.time()-t,'stdout':info(O/f'{name}.stdout.txt'),'stderr':info(O/f'{name}.stderr.txt')};dump(O/f'{name}.execution.json',rec);return p
args=['node',R/'scripts/import_goal_visualization.mjs',ID,R/GEN/f'{ID}-candidate-v2.png','--provider',link['provider'],'--review-status',link['reviewStatus'],'--license',link['license'],'--description',link['description'],'--alt-text',link['altText'],'--prompt',R/GEN/'prompt-v2.txt']
p=run('native-private-import',args,importing=True);assert p.returncode==0,p.stderr
assert (W/'source.json').read_bytes()==(R/S).read_bytes(),'Native import unexpectedly changed source JSON'
assert all(digest((W/f'asset-dir-{n}'/Path(p).name).read_bytes())==NEW for n,p in enumerate(assets))
shutil.copy2(W/'asset-dir-0'/'prompt.de.md',O/'after-native-import-prompt.de.md')

# A row-level candidate copies the actual independent V decision, never an author self-approval.
qa=read(Q);oldrow=copy.deepcopy(next(x for x in qa['records'] if x['goalId']==ID));newrow=next(x for x in qa['records'] if x['goalId']==ID)
newrow.update(assetSha256='sha256:'+NEW,aiApproved='yes',aiApprovedAssetSha256='sha256:'+NEW,aiReviewedAt=review['reviewedAtActualUTC'],aiReviewer=review['reviewer'],aiNotes='Independent native and isolated GoalCard 360/680 CSS-pixel review PASS for this exact candidate. All five-number summaries, shared scale, IQR/range and median comparison checked. Median (11) and Q3 (17) fully visible; lower callout small at 360, pointer adjacent to the closing parenthesis without obscuring digits. Evidence: '+VR+'. No new human approval; historical human fields are preserved, not renewed.')
for k in ['humanApproved','humanIssueIdentified','humanIssueDescription','humanReviewedAt','humanReviewer']:assert newrow[k]==oldrow[k]
dump(W/'qa-candidate.json',qa);dump(O/'candidate-V-ledger-row.json',newrow)
with gzip.open(O/'candidate-V-ledger.json.gz','wb') as f:f.write((W/'qa-candidate.json').read_bytes())
dump(O/'V-row-application-diff.json',{k:{'before':oldrow[k],'after':newrow[k]} for k in oldrow if oldrow[k]!=newrow[k]})
overlays=[(W/f'asset-dir-{n}'/Path(p).name,R/p) for n,p in enumerate(assets)]

state={'workspace':str(W),'subject':subject,'Pconfig':PC,'PconfigObject':pcfg,'Prow':prow,'Dindex':DI,'source':S,'qa':Q,'assets':assets,'candidateQa':str(W/'qa-candidate.json'),'protected':guards,'newHash':NEW,'oldHash':OLD,'goalId':ID}
dump(O/'private-workspace.json',state)
dump(O/'file-map.json',{'sourceJsonWillRemainByteIdentical':info(R/S),'assetCopies':[{'target':p,'before':guards[p],'candidate':info(W/f'asset-dir-{n}'/Path(p).name)} for n,p in enumerate(assets)],'prompt':{'target':prompt,'before':guards[prompt],'candidate':info(O/'after-native-import-prompt.de.md')},'reconstructionPromptExists':(R/reconstruction).exists(),'Vledger':{'target':Q,'before':guards[Q],'candidateCompressed':info(O/'candidate-V-ledger.json.gz'),'rowDiff':'V-row-application-diff.json'},'Pconfig':PC,'Preview':PR,'Dindex':DI,'atomicityConfig':subject['semanticAtomicityConfigPath'],'memoryConfig':subject['memoryReviewConfigPath'],'registry':REG,'activeWrites':False})
print(json.dumps({'workspace':str(W),'sourceByteIdenticalAfterNativeImport':True,'Pconfig':PC,'Dindex':DI,'all3Assets':NEW},indent=2))
