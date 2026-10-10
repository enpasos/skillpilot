# SPDX-License-Identifier: Apache-2.0
"""Whole old A/M records retained; exact targeted records use normal leaf scopes."""
from pathlib import Path
import hashlib,json,shutil
R=Path('/home/enpasos/projects/skillpilot');P=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-protected-twelve-current-native-technical-author-20261010-v1');D=R/P
C=R/'tmp/m7-resumption-20261010/chemistry-b008-protected-twelve-native-author/isolated-normal-capsule'
ids=set(json.loads((D/'checks/actual-full381-to398-protected180-context-deltas.json').read_text())['actualDeltaGoalIds'])
registry=json.loads((R/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json').read_text());s=next(x for x in registry['subjects']if x['subject']=='chemie')
def ref(p):
 b=(R/p).read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(f,x):
 a=D/f;a.parent.mkdir(parents=True,exist_ok=True);a.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def copy(f,dest):
 a=D/dest;a.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(R/f,a);return {'wholeOriginal':ref(Path(f)),'wholeExactCopy':ref(P/dest)}
rows=[];configs=[]
for i,path in enumerate(s['semanticAtomicityConfigPaths'],1):
 cfg=json.loads((R/path).read_text());lines=(R/cfg['reviewPath']).read_text().splitlines(keepends=True);selected=[l for l in lines if l.strip()and json.loads(l)['goalId']in ids]
 if not selected:continue
 bodydir=Path(f'inputs/atomicity/{i:02d}');inputs=[copy(path,bodydir/'whole-original-config.exact.json'),copy(cfg['reviewPath'],bodydir/'whole-original-records.exact.jsonl')]
 (D/bodydir/'targeted-records.exact-lines.jsonl').write_text(''.join(selected))
 cfg['landscapePath']=str(P/'inputs/candidate/current-whole511-398-B008.inactive.json');cfg['reviewPath']=str(P/bodydir/'targeted-records.exact-lines.jsonl');cfg['scope']={'label':'Exact targeted protected native context bindings; retained A decisions, no new scientific approval','leafGoalIds':[json.loads(l)['goalId']for l in selected]}
 config=bodydir/'current-targeted-normal.config.json';put(config,cfg);configs.append(str(P/config))
 rows.append({'wholeInputs':inputs,'normalCurrentTargetedConfig':ref(P/config),'wholeSelectedRecords':[json.loads(l)for l in selected],'wholeOriginalFingerprintBodiesUnmodified':True})
memory=json.loads((R/s['memoryReviewConfigPath']).read_text());lines=(R/memory['reviewPath']).read_text().splitlines(keepends=True);selected=[l for l in lines if l.strip()and json.loads(l)['goalId']in ids];assert len(selected)==12 and all(json.loads(l)['status']=='no_memory_needed'for l in selected)
mf=Path('inputs/memory');inputs=[copy(s['memoryReviewConfigPath'],mf/'whole-original-config.exact.json'),copy(memory['reviewPath'],mf/'whole-original-records.exact.jsonl'),copy(memory['cardReviewPath'],mf/'whole-original-cards.exact.jsonl')]
(D/mf/'targeted12-records.exact-lines.jsonl').write_text(''.join(selected));(D/mf/'targeted-no-memory-empty-cards.jsonl').write_text('')
memory['landscapePath']=str(P/'inputs/candidate/current-whole511-398-B008.inactive.json');memory['reviewPath']=str(P/mf/'targeted12-records.exact-lines.jsonl');memory['cardReviewPath']=str(P/mf/'targeted-no-memory-empty-cards.jsonl');memory['reportPath']=str(P/'checks/normal-targeted12-memory.actual.md');memory['scope']={'label':'Exactly twelve existing no_memory_needed goal decisions; no memory goal or card in this targeted scope','leafGoalIds':sorted(ids)}
mc=mf/'current-targeted12-normal.config.json';put(mc,memory)
put(Path('inputs/whole-existing-A-M-and-normal-target-bindings.actual.json'),{'schemaVersion':1,'atomicity':rows,'memory':{'wholeInputs':inputs,'wholeSelectedRecords':[json.loads(l)for l in selected],'normalCurrentTargetedConfig':ref(P/mc),'noMemoryRequiredTargets':12,'oldWholeCardsRetainedOutsideTargetedScope':True},'normalAtomicityConfigPaths':configs,'normalMemoryConfigPath':str(P/mc),'scientificReviewClaims':0,'strictGain':0,'activeWrites':[]})
shutil.copytree(D/'inputs',C/P/'inputs',dirs_exist_ok=True)
for directory in ['curricula/DE/Gymnasium/composition-views/chemie','curricula/DE/Gymnasium/memory-decks']:
 shutil.copytree(R/directory,C/directory,dirs_exist_ok=True)
for f in (R/'app/public/data').glob('*chem*'):
 if f.is_file():a=C/f.relative_to(R);a.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(f,a)
for row in json.loads((D/'assets/protected12-exact-current-raster-bindings.actual.json').read_text())['rows']:
 a=C/row['canonicalOriginal']['path'];a.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(R/row['canonicalOriginal']['path'],a)
print(json.dumps({'normalTargetedAtomicityConfigs':len(configs),'wholeTargetedAtomicityRecords':sum(len(r['wholeSelectedRecords'])for r in rows),'normalTargetedMemoryRecords':len(selected),'activeWrites':0}))
