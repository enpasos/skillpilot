#!/usr/bin/env python3
from pathlib import Path
import ast,datetime,difflib,gzip,hashlib,json,os
OUT=Path(__file__).resolve().parent;ROOT=OUT.parents[3]
OLD=ROOT/'qa-artifacts/ci-contract-audit/2026-11-07/economics-fixed74-authority-integration-candidate'
W=Path(json.loads((OUT/'ram-location.json').read_bytes())['path']);sha=lambda raw:hashlib.sha256(raw).hexdigest()
baseline=json.loads((OLD/'static-integrity.json').read_bytes())
override=OUT/'private-code/scripts/visualization_qualified_context_capsule.py'
rows=[];patch=[]
for row in baseline['privateCodeCandidates']:
 source=override if row['proposedPath']=='scripts/visualization_qualified_context_capsule.py'else ROOT/row['candidatePath']
 raw=source.read_bytes();changed=source==override
 if not changed:assert sha(raw)==row['sha256']
 rows.append({'proposedPath':row['proposedPath'],'sourcePath':str(source.relative_to(ROOT)),'sha256':sha(raw),'bytes':len(raw),'onlyArgumentGuardOverride':changed})
 target=ROOT/row['proposedPath'];before=target.read_text()if target.exists()else''
 patch.extend(difflib.unified_diff(before.splitlines(True),raw.decode().splitlines(True),fromfile='a/'+row['proposedPath'],tofile='b/'+row['proposedPath']))
assert len(rows)==10 and sum(row['onlyArgumentGuardOverride']for row in rows)==1
raw_patch=''.join(patch).encode();(OUT/'combined-application.patch.gz').write_bytes(gzip.compress(raw_patch,mtime=0));(W/'combined-application.patch').write_bytes(raw_patch)
old_code=(OLD/'private-code/scripts/visualization_qualified_context_capsule.py').read_text();new_code=override.read_text()
(OUT/'selector-only.patch.gz').write_bytes(gzip.compress(''.join(difflib.unified_diff(old_code.splitlines(True),new_code.splitlines(True),fromfile='old-sealed74/selector.py',tofile='new-argument-successor/selector.py')).encode(),mtime=0))
old_tree=ast.parse(old_code);new_tree=ast.parse(new_code)
def selected(tree,name):return next(node for node in tree.body if (isinstance(node,ast.FunctionDef)and node.name==name)or(isinstance(node,ast.Assign)and any(isinstance(target,ast.Name)and target.id==name for target in node.targets)))
for name in ['_ACCEPTED_INDEXES','index_originals']:assert ast.dump(selected(old_tree,name),include_attributes=False)==ast.dump(selected(new_tree,name),include_attributes=False)
snapshot=(W/'politikwirtschaft49.readonly.json').read_bytes();assert sha(snapshot)=='49e68eedeac6a891a0327551bfbe7c9d31a44573d97b464b69b49d5023511c94'
(OUT/'politikwirtschaft49.snapshot.json.gz').write_bytes(gzip.compress(snapshot,mtime=0))
result={'schemaVersion':1,'kind':'exact-sealed74-application-with-effective-namespace-resource-override',
 'basePacket':{'path':str(OLD.relative_to(ROOT)),'manifestSha256':'d2d550a83825310c97a0424abac69c120eb2e92d508725cdbfacc147cd90c29e'},
 'codeFiles':rows,'nineOtherCandidateCodePinsUnchanged':True,'indexAndCapsulePins':json.loads((OLD/'fixed74-pins.json').read_bytes()),
 'rawKernelSha256':'307bb0b0ca99c680261afa176eed7ab05e88b108d79261cafb28903ddf231f34',
 'acceptedIndexTableAndOriginalInputSelectorAstUnchanged':True,'combinedApplicationPatchRawSha256':sha(raw_patch),
 'old74PacketWritten':False,'activeHostWritten':False,'sourceFrame':{'poWiSnapshotSha256':sha(snapshot),'carrier':'politikwirtschaft49.snapshot.json.gz'},
 'fullDeepInheritance':{'repeated':False,'originalCompletedReportRawSha256':'7307192d64af5b5e7fb17dcf5bbd551ceebf7cfb63c26444652ccf9d05adefb7',
  'originalResult':'74/2483 with2409openV','conditions':['Only the post-parse resource guard changed; nine remaining candidate code files, index74, capsule74, original17 reader pins, schemas and raw kernel unchanged.',
   'Actual unchanged kernel parser executes exactly once; valid calls forward the identical Namespace object and all fields without rewriting.',
   'A real valid build recreates the exact original capsule manifest; real independent-depth1 materialization reproduces the same measured set.',
   'Normal74 and legacy57 maturity regressions are rerun with the corrected guard.',
   'This inherited5-subject report stays bound to its original source frame, withPoWi49 explicitly frozen for argument-fix replays. Root combined normalCQR after its separatePoWi4 application remains separate.']}}
(OUT/'application-map.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({'codeFiles':10,'overrides':1,'nineUnchanged':True,'combinedPatchRawSha256':sha(raw_patch)}))
