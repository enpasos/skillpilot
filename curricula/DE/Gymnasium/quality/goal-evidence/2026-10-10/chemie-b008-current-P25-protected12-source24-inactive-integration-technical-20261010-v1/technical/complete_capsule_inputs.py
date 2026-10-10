# SPDX-License-Identifier: Apache-2.0
import json,pathlib,shutil,hashlib
R=pathlib.Path('/home/enpasos/projects/skillpilot');P=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current-P25-protected12-source24-inactive-integration-technical-20261010-v1');C=R/'tmp/m7-resumption-20261010/chemistry-b008-P26-native-author/isolated-normal-capsule';config=json.loads((R/P/'registry/chemie-only-normal-check.config.json').read_text())['subjects'][0];copied=[]
def cp(f):
 assert f.is_file() and not f.is_symlink();r=f.relative_to(R);dest=C/r;dest.parent.mkdir(parents=True,exist_ok=True)
 if not dest.exists() or dest.read_bytes()!=f.read_bytes():shutil.copyfile(f,dest);copied.append({'path':r.as_posix(),'sha256':'sha256:'+hashlib.sha256(f.read_bytes()).hexdigest(),'bytes':f.stat().st_size})
for p in config['resolutionIndexPaths']:
 root=(R/p).parent
 for f in root.rglob('*'):
  if f.is_file() and f.suffix in ['.json','.jsonl','.txt','.md']:cp(f)
canon=json.loads((C/config['landscapePath']).read_text());cards=[]
for g in canon['goals']:
 for key in ['vocabularySource','vocabularySourceEn']:
  s=g.get('extendedData',{}).get(key)
  if not s:continue
  p='app/public'+s if s.startswith('/data/') else s;cp(R/p);cards.append(p)
f=R/P/'checks/actual-isolated-normal-required-history-and-decks-restored.json';f.write_text(json.dumps({'schemaVersion':1,'role':'Selective exact normal D-contract JSON/JSONL/attestations and existing whole Memory deck inputs copied into ignored execution capsule. Actual first missing-file run preserved. No historical reviews repeated or rewritten.','copiedRegularFiles':copied,'existingWholeDeckInputs':cards,'normalCheckerRulesChanged':False,'activeWrites':[],'strictProgressClaim':False},ensure_ascii=False,indent=2)+'\n');print(json.dumps({'copiedContractFiles':len(copied),'wholeExistingDeckInputs':len(cards),'activeWrites':0}))
