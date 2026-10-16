import hashlib,json,shutil,subprocess,time
from pathlib import Path
R=Path.cwd(); E=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16')
L=R/'tmp/chemie-m7-resumed-20261016/chemie-combined639-two-GK-priors-final-review-capsule-v1'
N=E/'chemie-combined639-two-gk-priors-native-two-private-l4-technical-20261016-v1/native-two'
O=E/'chemie-current437-two-current-GK-contexts-root-native-resolution-synthesis-technical-20261016-v1'
O.mkdir(parents=True,exist_ok=True)
A=E/'chemie-two-generic-GK-priors-and-recall-fresh-independent-a-20261016-v1'
B=E/'chemie-two-generic-GK-priors-and-recall-independent-b-20261016-v1'
cfg=N.parent/'native-two.current-l4.stock.config.json'
def read(p):return json.loads(p.read_text())
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def fresh(p,data):
 p.parent.mkdir(parents=True,exist_ok=True)
 if p.exists():assert p.read_bytes()==data,(str(p),'existing bytes differ')
 else:p.write_bytes(data)
def js(d):return (json.dumps(d,ensure_ascii=False,indent=2)+'\n').encode()
assert sha(L/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')=='sha256:36975262a3d66998c75cca5c9bbe899d57f98b2614edcbded2baec4833e77903'
sel=read(A/'HANDOFF.actual-native2-current-l4-independent-a.selector.sealed.json')
assert sha(A/'HANDOFF.actual-native2-current-l4-independent-a.selector.sealed.json')=='sha256:3d0d986005ff10ca61ac7de293d1a486280f5b109f3929ba4fcf2ae886c8d3af'
for v in sel['selectedOutputFiles']:assert sha(Path(v['path']))==v['sha256']
bm=read(B/'MANIFEST.final-current-native-two-independent-b.sealed.json')
assert sha(B/'MANIFEST.final-current-native-two-independent-b.sealed.json')=='sha256:65c13368d02822915537b89ef2b22264b265efc86a01bbd92fa0eeceaf346c8c'
goals=read(cfg)['goalIds']; retained=[]
for letter,folder in [('a',A/'native-two-description-results'),('b',B/'native-d-results')]:
 for ext in ['records.jsonl','run.json']:
  files=list(folder.glob('*.'+ext));assert len(files)==1;src=files[0]
  if ext=='records.jsonl':
   rows=[json.loads(x)for x in src.read_text().splitlines()];assert [x['goalId']for x in rows]==goals
   assert all(x['decision']=='keep'for x in rows)
  else:assert read(src)['status']=='completed'
  rel=N/('round-'+letter)/'results'/src.name
  for root in [R,L]:fresh(root/rel,src.read_bytes())
  retained.append({'sourcePath':str(src),'sha256':sha(src),'selectedRound':letter,'target':str(rel),'wholeSourceBytesExact':True})
spec={'schemaVersion':1,'manifestId':'chemie-current437-native-two-real-paired-keep-root-technical-20261016-v1','synthesizedBy':'Root technical synthesis of actual independently frozen current Native2 A and B; no third scientific vote','decisions':[{'goalId':g,'resolutionDecision':'keep_current','evidenceRound':'first','rationaleDe':'Beide tatsächlichen unabhängigen Runden behalten nach Sichtung der zwei aktuellen PDF-Seiten, vollständigen DE/EN-Kontexte, tatsächlichen Bilder und ganzen P-Fälle den aktuellen Zieltext bei. Die aktuelle Typ- beziehungsweise Requires-Korrektur ist ausdrücklich geprüft. Die Zusammenführung wählt A und erhält B bytegenau; sie erzeugt keine neue Fachprüfung oder menschliche Freigabe.','rationaleEn':'Both actual independent rounds KEEP the current wording after viewing the two real current PDF pages, complete bilingual contexts, actual images and whole P cases. The current node-kind or prerequisite correction is explicitly reviewed. This synthesis selects A and retains B byte exactly; it creates no third scientific review or human approval.'}for g in goals]}
author=N/'synthesis-authoring.actual-root.two-paired-keep.json'
for root in [R,L]:fresh(root/author,js(spec))
commands=[['scripts/materializeGoalDescriptionRolloutBatch.ts','summarize','--config',str(cfg),'--write'],['scripts/materializeGoalDescriptionRolloutSynthesisManifest.ts','--config',str(cfg),'--authoring',str(author),'--write'],['scripts/materializeGoalDescriptionRolloutResolutions.ts','--config',str(cfg),'--synthesis-manifest',str(N/'synthesis-decisions.json'),'--write'],['scripts/materializeGoalDescriptionRolloutBatch.ts','finalize','--config',str(cfg),'--write']]
runs=[]
for i,tail in enumerate(commands,1):
 cmd=['node','--preserve-symlinks','--preserve-symlinks-main','node_modules/tsx/dist/cli.mjs',*tail];start=time.monotonic()
 p=subprocess.run(cmd,cwd=L/'app',capture_output=True,text=True)
 fresh(O/f'{i}.stdout.actual.txt',p.stdout.encode());fresh(O/f'{i}.stderr.actual.txt',p.stderr.encode())
 runs.append({'command':cmd,'cwd':str(L/'app'),'exitCode':p.returncode,'elapsedSeconds':time.monotonic()-start})
 fresh(O/f'RUN.{i}.actual.json',js(runs[-1]))
 if p.returncode:raise RuntimeError(p.stderr or p.stdout)
for f in [*(L/N).glob('*.json'),*(L/N/'resolutions').glob('*.json')]:
 rel=f.relative_to(L);fresh(R/rel,f.read_bytes())
idx=read(R/N/'resolution-index.json');assert len(idx['resolutions'])==2
result={'role':'Actual stock Native2 dual-round synthesis and strict current resolution finalization; machine QA only','inputCanonicalSHA256':'sha256:36975262a3d66998c75cca5c9bbe899d57f98b2614edcbded2baec4833e77903','independentRoundSources':retained,'actualRuns':runs,'resolutionIndex':{'path':str(N/'resolution-index.json'),'sha256':sha(R/N/'resolution-index.json')},'strictCurrentResolutions':2,'denominatorOwnedByCentralReport':True,'central437NotRerunHere':True,'normalWrites':0,'HumanApproval':False,'HumanTrial':False,'M7Claim':False}
fresh(O/'RESULT.actual-stock-two-paired-current-resolutions.json',js(result))
print(json.dumps({'strict':2,'stockRuns':len(runs),'index':str(N/'resolution-index.json'),'sha256':sha(R/N/'resolution-index.json')}))
