# SPDX-License-Identifier: Apache-2.0
import json,hashlib,shutil,os
from pathlib import Path
root=Path('/home/enpasos/projects/skillpilot');base=root/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-neuro-two-BY-APV203-source-independent-b-candidate-20261007-v1';out=base/'technical-follow-up';out.mkdir(exist_ok=False)
bio='08a43a1b-d97e-522c-9dfa-c950a493364e'; canon=Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json');snap=out/'native-input-snapshot';snap.mkdir()
def dump(p,x):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
inputs=[];maps=[]
for d,dirs,files in os.walk(root/'curricula'):
 dirs[:]=[n for n in dirs if n!='quality']
 for n in files:
  if not n.endswith('.json'):continue
  p=Path(d)/n;rel=p.relative_to(root)
  if 'canonical' in rel.parts and n not in [canon.name,'DE_DEU_S_GYM_CANONICAL_OVERVIEW.de.json']:continue
  if 'mapping' in rel.parts:
   v=json.loads(p.read_text())
   if v.get('targetLandscapeId')!=bio:continue
   maps.append(str(rel))
  dest=snap/rel;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,dest)
  inputs.append({'sourcePath':str(rel),'sha256':sha(p),'snapshotPath':str(dest.relative_to(out))})
for rel in ['app/scripts/applicabilityCompiler.ts']:
 p=root/rel;dest=snap/rel;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,dest);inputs.append({'sourcePath':rel,'sha256':sha(p),'snapshotPath':str(dest.relative_to(out))})
# Native memory-origin reader is read-only input. Preserve configs and referenced bodies.
mdir=root/'curricula/DE/Gymnasium/quality/memory-card-review'
for p in mdir.glob('*.config.json'):
 v=json.loads(p.read_text())
 if v.get('landscapeId')!=bio:continue
 for q in [p,root/v['reviewPath']]:
  rel=q.relative_to(root);dest=snap/rel;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(q,dest);inputs.append({'sourcePath':str(rel),'sha256':sha(q),'snapshotPath':str(dest.relative_to(out))})
(snap/'curricula/DE/Gymnasium/quality/memory-card-review').mkdir(parents=True,exist_ok=True)
# Original code utilities are shared read-only, with all actual imported TS/TSX bytes hashed below.
(snap/'app/src').symlink_to(root/'app/src',target_is_directory=True);(snap/'app/node_modules').symlink_to(root/'app/node_modules',target_is_directory=True)
for p in (root/'app/src').rglob('*'):
 if p.is_file() and p.suffix in ['.ts','.tsx']:inputs.append({'sourcePath':str(p.relative_to(root)),'sha256':sha(p),'sharedReadOnlyNativeDependency':True})
# Copy variants so every compiler is unchanged and module-relative input is isolated.
variants=['baseline','source-only','source-capstone-derived','source-four-consumers-derived','source-four-consumers-fields-aligned']
oldsrc={'8832a55d-988a-5848-81d4-1dc529f7b6e9','9112f03c-86f5-5f64-b8d6-4ec1d687d7ed','e026e617-09d5-53d1-aa11-9cdb8f3d6b00'};s8='8c6774a3-2a98-5b76-9ecd-8ad97f97440c';g485='485ef1c3-8997-52b7-91f5-b1ddf179013d';gaf='afde0001-d7d7-5ed3-8a60-383e8da5620e';cap='1cfb2f8b-d44b-57f4-aae0-c5d9f55a1c6a';consumers={cap,'7c7f147c-2b64-5b0c-90c1-ea9a9bf4b03a','487c79f5-7e4d-5da8-ad8f-f0f96c23a974','5e8d3316-c22a-55bc-acca-9e1d15a4152c'}
deltas={}
for name in variants:
 vroot=out/'variants'/name;shutil.copytree(snap,vroot,symlinks=True)
 vd=[]
 if name!='baseline':
  for rel in maps:
   p=vroot/rel;v=json.loads(p.read_text());before=json.loads(p.read_text());hit=False
   new=[]
   for m in v.get('mappings',[]):
    if m.get('canonicalGoalId') in {g485,gaf} and m.get('legacyGoalId') in oldsrc:hit=True;continue
    if m.get('canonicalGoalId')==g485 and m.get('legacyGoalId')==s8:m['matchType']='partial';hit=True
    new.append(m)
   v['mappings']=new
   for decision in v.get('decisions',[]):
    sid=decision.get('sourceGoalId')
    if sid in oldsrc and set(decision.get('canonicalGoalIds',[])).issubset({g485,gaf}):
     decision['decision']='needsCanonicalGoal';decision['canonicalGoalIds']=[];decision['rationale']='Independent bounded primary-source review: named Depression clinical/therapy duty or ENG/EKG electrical-activity diagnosis is not exactly represented by this current goal. Preserve unresolved complete source duty; separate existing bounded source components stay unchanged.';decision.pop('matchType',None);hit=True
    elif sid==s8 and decision.get('canonicalGoalIds')==[g485]:
     decision['matchType']='partial';decision['rationale']='EA-LK only: bounded support for explaining function change with a supplied neuronal-disorder model. Complete named MS/Parkinson symptom duty remains HOLD; no BY Alzheimer requirement is inferred.';hit=True
   if hit:dump(p,v);vd.append({'file':rel,'beforeSha256':sha(snap/rel),'afterSha256':sha(p),'wholeOriginalArchived':True})
 if 'derived' in name:
  p=vroot/canon;v=json.loads(p.read_text());changed=[]
  for g in v['goals']:
   if g['id'] in ({cap} if 'capstone' in name else consumers):g.setdefault('extendedData',{})['applicabilityFromRequires']=True;changed.append(g['id'])
   if 'fields-aligned' in name and g['id']==g485:g['applicability']={'jurisdiction':['DE-BY','DE-HE']};changed.append(g['id'])
   if 'fields-aligned' in name and g['id']==cap:g['applicability']={'jurisdiction':['DE-HE']}
  dump(p,v);vd.append({'file':str(canon),'changedGoalIds':sorted(set(changed)),'onlyApplicabilityMetadataChanged':True,'requiresEdgesUnchanged':True})
 deltas[name]=vd
 # Runner hashes primary source evidence and uses the unchanged native compiler.
 (vroot/'app/scripts/probe.ts').write_text("import { writeFileSync, readFileSync } from 'node:fs'\nimport { buildApplicabilityCompilation } from './applicabilityCompiler'\nimport { hasDirectSourceCoverageEvidence } from '"+str(root/'app/scripts/sourceCoverageEvidence.ts')+"'\nconst report=buildApplicabilityCompilation().reports.find(r=>r.landscapeId==='"+bio+"')!\nconst selected=report.goals.filter(g=>['"+g485+"','"+gaf+"','"+cap+"','7c7f147c-2b64-5b0c-90c1-ea9a9bf4b03a','487c79f5-7e4d-5da8-ad8f-f0f96c23a974','5e8d3316-c22a-55bc-acca-9e1d15a4152c'].includes(g.goalId)).map(g=>({...g,directBYSourceCoverage:hasDirectSourceCoverageEvidence(g,'DE-BY')}))\nwriteFileSync(process.argv[2],JSON.stringify({variant:'"+name+"',summary:report.summary,findings:report.findings,selected,wholeReport:report},null,2)+'\\n')\nconsole.log(JSON.stringify({variant:'"+name+"',summary:report.summary,APV203:report.findings.filter(f=>f.code==='APV-203').map(f=>f.goalId)}))\n")
dump(out/'native-input-bindings.actual.json',inputs);dump(out/'proposed-variant-deltas.actual.json',deltas);dump(out/'all-current-Bio-mapping-file-paths.actual.json',maps)
shutil.copyfile('/tmp/bio-two-native-technical-independent-b.py',out/'prepare-technical-variants.actual.py')
print(json.dumps({'technicalFolder':str(out),'variants':variants,'mappingFiles':len(maps),'inputsHashed':len(inputs)}))
