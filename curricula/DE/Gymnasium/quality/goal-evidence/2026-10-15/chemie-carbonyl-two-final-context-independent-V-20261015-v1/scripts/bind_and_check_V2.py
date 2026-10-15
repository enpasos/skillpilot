# SPDX-License-Identifier: Apache-2.0
"""Bind exactly two previously sealed independent V judgments and check stock helpers."""
import hashlib, json, shutil, subprocess
from datetime import datetime, timezone
from pathlib import Path
REPO=Path.cwd(); OWN=Path(__file__).resolve().parents[1]
AUTHOR=REPO/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-carbonyl-two-final-wording-and-visual-remediation-author-root-20261015-v1'
HOST=REPO/'tmp/chemie-m7-resumed-20261015/carbonyl-two-independent-V2-minimal-host-v1'
def read(p): return json.loads(Path(p).read_text())
def bind(p):
 p=Path(p); b=p.read_bytes(); return {'path':str(p.relative_to(REPO)),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(p,o): (OWN/p).write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n')
assert not HOST.exists()
seal=read(OWN/'FIRST.actual-two-final-V-decisions.seal.json')
for r in seal['files']: assert bind(REPO/r['path'])==r
sel=read(AUTHOR/'SELECTION.two-bounded-wording-and-PNG-author-candidate.json')
canonical=read(REPO/sel['canonical']['path']); goals={g['id']:g for g in canonical['goals']}
aliases=[]; rows=[]; firsts=[]; now=datetime.now(timezone.utc).isoformat()
can_alias='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
sem_alias='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
aliases.append({'normalAlias':can_alias,'physical':sel['canonical']})
aliases.append({'normalAlias':sem_alias,'physical':sel['semanticSourceIdentityOnly']})
for f in seal['files']:
 first=read(REPO/f['path']); assert first['decision']=='accepted'; firsts.append(first)
 gid=first['goalId']; goal=goals[gid]
 image=AUTHOR/f'candidate/visualizations/chemie/{gid}/{gid}.png'; image_binding=bind(image)
 public='app/public'+goal['resourceLinks'][0]['url']; canon=f'curricula/DE/Gymnasium/visualizations/chemie/{gid}/{gid}.png'
 aliases.extend([{'normalAlias':public,'physical':image_binding},{'normalAlias':canon,'physical':image_binding}])
 notes='Independent informed final-context acceptance after actual native original JPG/new PNG and Chromium360/680 plus GoalCard316/636 inspection. '+first['nativeFindingsDe']+' '+first['responsiveFindingsDe']+' FIRST '+f['sha256']+'. Canonical '+sel['canonical']['sha256']+'. No D/P/A/M/source-course/Human/M7 grant.'
 rows.append({'goalId':gid,'title':goal['title'],'description':goal['description'],'subject':'chemie','landscapeId':canonical['landscapeId'],'landscapePath':can_alias,'visualizationState':'available','missingReason':'','imageUrl':goal['resourceLinks'][0]['url'],'publicAssetPath':public,'canonicalAssetPath':canon,'assetSha256':image_binding['sha256'],'umlautsCorrectChatGpt':'no','contentApprovedChatGpt':'no','humanApproved':'no','humanIssueIdentified':'no','humanIssueDescription':'','chatGptReviewedAt':None,'chatGptReviewer':'','chatGptNotes':'','humanReviewedAt':None,'humanReviewer':'','aiApproved':'yes','aiApprovedAssetSha256':image_binding['sha256'],'aiReviewedAt':first['completedAtUTC'],'aiReviewer':'Codex independent C / informed actual two-final-context V review / 2026-10-15','aiNotes':notes})
normal={'schemaVersion':1,'subject':'chemie','source':{'canonicalRoot':'curricula/DE/Gymnasium/canonical','publicAssetRoot':'app/public/assets/goal-visualizations'},'records':rows}
write('qa/V2.final-context.normal-alias.qa.json',normal)
lookup={r['normalAlias']:r['physical'] for r in aliases}; physical=json.loads(json.dumps(normal))
physical['source']={'canonicalRoot':str((REPO/sel['canonical']['path']).parent.relative_to(REPO)),'publicAssetRoot':str((AUTHOR/'candidate/visualizations').relative_to(REPO))}
for row in physical['records']:
 for key in ['landscapePath','canonicalAssetPath','publicAssetPath']: row[key]=lookup[row[key]]['path']
write('qa/V2.final-context.physical-transport.qa.json',physical)
write('TRANSPORT.normal-aliases-to-exact-physical-files.json',{'role':'Exact path-only transport; two scientific votes, not four','normalAliases':aliases,'scientificBodiesUnchanged':True})
write('BINDING.exact-final-two-DEEN-ALT-PNG.normal-V.actual.json',{'boundAtUTC':now,'FIRSTSeal':bind(OWN/'FIRST.actual-two-final-V-decisions.seal.json'),'finalCanonical':sel['canonical'],'finalSemanticSourceOnly':sel['semanticSourceIdentityOnly'],'normalQA':bind(OWN/'qa/V2.final-context.normal-alias.qa.json'),'physicalQA':bind(OWN/'qa/V2.final-context.physical-transport.qa.json'),'wholeFinalGoals':[f['wholeFinalGoal'] for f in firsts],'uniqueScientificVotes':2})
mapping=read(REPO/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-equilibrium16-current422-native-preparation-technical-20261015-v1/checks/REBUILD.native16.current338-exact-physical-map.json')
HOST.mkdir(parents=True)
for r in mapping['stockPhysicalModules']:
 source=REPO/r['path']; assert bind(source)==r
 dest=HOST/r['path']; dest.parent.mkdir(parents=True,exist_ok=True); shutil.copy2(source,dest)
(HOST/'app/node_modules').symlink_to(REPO/'app/node_modules',target_is_directory=True)
for r in aliases:
 source=REPO/r['physical']['path']; assert bind(source)==r['physical']
 dest=HOST/r['normalAlias']; dest.parent.mkdir(parents=True,exist_ok=True); shutil.copy2(source,dest)
qa_alias='curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'; dest=HOST/qa_alias;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(OWN/'qa/V2.final-context.normal-alias.qa.json',dest)
write('checks/REBUILD.two-V2.minimal-physical-host.json',{'executionHost':str(HOST.relative_to(REPO)),'stockPhysicalModules':mapping['stockPhysicalModules'],'dataAndAssetAliases':aliases+[{'normalAlias':qa_alias,'physical':bind(OWN/'qa/V2.final-context.normal-alias.qa.json')}],'physicalRegularBytes':sum(p.stat().st_size for p in HOST.rglob('*') if p.is_file() and not p.is_symlink()),'onlyDependencySymlink':'app/node_modules','fullTreeCopies':0,'activeWrites':0})
cmd=[str(REPO/'app/node_modules/.bin/tsx'),str(OWN/'scripts/check_exact_normal_V2.mts'),str(REPO),str(HOST),str(OWN)]
started=datetime.now(timezone.utc).isoformat();result=subprocess.run(cmd,cwd=HOST,capture_output=True,text=True)
(OWN/'checks/V2.stock.actual.stdout.json').write_text(result.stdout);(OWN/'checks/V2.stock.actual.stderr.txt').write_text(result.stderr)
write('checks/V2.stock.actual.command.json',{'startedAtUTC':started,'command':cmd,'cwd':str(HOST.relative_to(REPO)),'returncode':result.returncode})
assert result.returncode==0,result.stderr+result.stdout
print(json.dumps({'exitCode':0,'uniqueVVotes':2,'hostPhysicalBytes':read(OWN/'checks/REBUILD.two-V2.minimal-physical-host.json')['physicalRegularBytes']}))
