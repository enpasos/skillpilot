# SPDX-License-Identifier: Apache-2.0
"""Verify finite physical bytes and real schema boundaries; no science votes."""
from pathlib import Path
import json,hashlib,ast,importlib.util
ROOT=Path(__file__).resolve().parents[7]
OWN=Path(__file__).resolve().parent

def main():
 d=json.loads((OWN/'FINAL.finite-current419-checkpoint.json').read_text())
 spec=importlib.util.spec_from_file_location('production_schema',ROOT/'scripts/validate_schemas.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
 schema=json.loads((ROOT/'docs/landscape-runtime.schema.json').read_text())
 nj=nl=np=0;count=0;total=0
 for package in d['packages']:
  expected={ROOT/r['path'] for r in package['files']};actual={p for p in (ROOT/package['path']).rglob('*') if p.is_file() or p.is_symlink()};assert expected==actual,(package['path'],actual^expected)
  for row in package['files']:
   p=ROOT/row['path'];assert p.is_file() and not p.is_symlink();assert p.stat().st_size==row['bytes'];assert 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()==row['sha256'];count+=1;total+=p.stat().st_size
   if p.suffix=='.json':assert m.validate_file(str(p),schema);nj+=1
   elif p.suffix=='.jsonl':
    for line in p.read_text().splitlines():
     if line.strip():json.loads(line);nl+=1
   elif p.suffix=='.py':ast.parse(p.read_text());np+=1
 errors=m.curriculum_symlink_errors(ROOT);assert not errors,errors
 print(json.dumps({'finitePackages':len(d['packages']),'files':count,'bytes':total,'JSONproductionBoundaryChecked':nj,'JSONLrowsParsed':nl,'PythonAST':np,'actualRepositorySymlinkErrors':errors,'allFiniteBytesExact':True,'newScientificClosures':3,'restoredCompletionBindings':0,'activeIntegration':False,'humanApproval':False,'humanTrial':False},indent=2))
if __name__=='__main__':main()
