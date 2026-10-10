# SPDX-License-Identifier: Apache-2.0
import pathlib,json,shutil,hashlib
R=pathlib.Path.cwd();O=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current517-dual38-P38-reviewed-inactive-integration-technical-20261010-v1');C=(R/'tmp/m7-resumption-20261010/chemistry-b008-P26-native-author/isolated-normal-capsule').resolve();rows=[]
for p in (R/'curricula/DE/Gymnasium/canonical').glob('*.json'):
 j=json.loads(p.read_text())
 for g in j.get('goals',[]):
  ext=g.get('extendedData',{})
  for k in ['vocabularySource','vocabularySourceEn']:
   src=ext.get(k)
   if not isinstance(src,str)or not src.startswith('/data/'):continue
   rel='app/public'+src;s=R/rel;assert s.is_file();d=C/rel;d.parent.mkdir(parents=True,exist_ok=True);assert d.parent.resolve().is_relative_to(C)
   if d.exists()or d.is_symlink():d.unlink()
   shutil.copyfile(s,d);rows.append({'path':rel,'sha256':'sha256:'+hashlib.sha256(s.read_bytes()).hexdigest(),'exactUnchangedDependency':True})
(O/'checks/unaffected-subject-runtime-memory-decks.exact.json').write_text(json.dumps({'rows':rows,'activeWrites':[]},indent=2)+'\n');print('Runtime decks exact',len(rows))
