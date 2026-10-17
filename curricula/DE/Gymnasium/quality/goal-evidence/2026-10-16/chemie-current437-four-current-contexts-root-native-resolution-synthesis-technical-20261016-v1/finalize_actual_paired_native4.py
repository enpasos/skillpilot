import hashlib,json,shutil,subprocess,time
from pathlib import Path
R=Path.cwd(); E=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16')
L=R/'tmp/chemie-m7-resumed-20261016/chemie-combined639-shared-and-seven-final-review-capsule-v1'
N=E/'chemie-combined639-shared-six-exam-seven-native-four-private-L3-technical-20261016-v1/native-four'
O=E/'chemie-current437-four-current-contexts-root-native-resolution-synthesis-technical-20261016-v1'
O.mkdir(parents=True,exist_ok=True)
A=E/'chemie-shared-three-and-faraday-kind-current437-independent-a-20261016-v1'
B=E/'chemie-shared-three-and-faraday-kind-current437-independent-b-20261016-v1'
cfg=N.parent/'native-four.current-L3.valid-stock.config.json'
def read(p):return json.loads(p.read_text())
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def fresh(p,data):
 p.parent.mkdir(parents=True,exist_ok=True)
 if p.exists():assert p.read_bytes()==data,(str(p),'existing bytes differ')
 else:p.write_bytes(data)
def js(d):return (json.dumps(d,ensure_ascii=False,indent=2)+'\n').encode()
assert sha(L/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')=='sha256:b3c50a6a0782247375dbad00a76a4ef5d5035030c12cbc2e9b190865e1ed33e1'
sel=read(A/'HANDOFF.actual-native4-current-L3-independent-a.selector.sealed.json')
assert sha(A/'HANDOFF.actual-native4-current-L3-independent-a.selector.sealed.json')=='sha256:d6b9dcc927a28cb26d6cfb6d777fbcaca9e5c83aa1af77c30504ec6929fa9e17'
for v in sel['selectedOutputFiles']:assert sha(Path(v['path']))==v['sha256']
bm=read(B/'MANIFEST.final-current-native-four-independent-b.sealed.json')
assert sha(B/'MANIFEST.final-current-native-four-independent-b.sealed.json')=='sha256:41d8d96e206791aacb4a2731450f1b6970545784b28276905c28dede8168d5a6'
goals=read(cfg)['goalIds']; retained=[]
for letter,folder in [('a',A/'native-four-description-results-stock-contract-v2'),('b',B/'native-d-results')]:
 for ext in ['records.jsonl','run.json']:
  files=list(folder.glob('*.'+ext));assert len(files)==1;src=files[0]
  if ext=='records.jsonl':
   rows=[json.loads(x)for x in src.read_text().splitlines()];assert [x['goalId']for x in rows]==goals
   assert all(x['decision']=='keep'for x in rows)
  else:assert read(src)['status']=='completed'
  rel=N/('round-'+letter)/'results'/src.name
  for root in [R,L]:fresh(root/rel,src.read_bytes())
  retained.append({'sourcePath':str(src),'sha256':sha(src),'selectedRound':letter,'target':str(rel),'wholeSourceBytesExact':True})
spec={'schemaVersion':1,'manifestId':'chemie-current437-native-four-real-paired-keep-root-technical-20261016-v1','synthesizedBy':'Root technical synthesis of actual independently frozen current Native4 A and B; no third scientific vote','decisions':[{'goalId':g,'resolutionDecision':'keep_current','evidenceRound':'first','rationaleDe':'Beide tatsächlichen unabhängigen Runden behalten nach Sichtung der vier aktuellen PDF-Seiten, vollständigen DE/EN-Kontexte, tatsächlichen Bilder und ganzen P-Fälle den aktuellen Zieltext bei. Die aktuelle Typ- beziehungsweise Requires-Korrektur ist ausdrücklich geprüft. Die Zusammenführung wählt A und erhält B bytegenau; sie erzeugt keine neue Fachprüfung oder menschliche Freigabe.','rationaleEn':'Both actual independent rounds KEEP the current wording after viewing the four real current PDF pages, complete bilingual contexts, actual images and whole P cases. The current node-kind or prerequisite correction is explicitly reviewed. This synthesis selects A and retains B byte exactly; it creates no third scientific review or human approval.'}for g in goals]}
author=N/'synthesis-authoring.actual-root.four-paired-keep.json'
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
idx=read(R/N/'resolution-index.json');assert len(idx['resolutions'])==4
result={'role':'Actual stock Native4 dual-round synthesis and strict current resolution finalization; machine QA only','inputCanonicalSHA256':'sha256:b3c50a6a0782247375dbad00a76a4ef5d5035030c12cbc2e9b190865e1ed33e1','independentRoundSources':retained,'actualRuns':runs,'resolutionIndex':{'path':str(N/'resolution-index.json'),'sha256':sha(R/N/'resolution-index.json')},'strictCurrentResolutions':4,'denominatorOwnedByCentralReport':True,'central437NotRerunHere':True,'normalWrites':0,'HumanApproval':False,'HumanTrial':False,'M7Claim':False}
fresh(O/'RESULT.actual-stock-four-paired-current-resolutions.json',js(result))
print(json.dumps({'strict':4,'stockRuns':len(runs),'index':str(N/'resolution-index.json'),'sha256':sha(R/N/'resolution-index.json')}))
