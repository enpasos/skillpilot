# SPDX-License-Identifier: Apache-2.0
"""Bind sealed V4 honestly: two accepted, two rejected; no source image copies."""
from pathlib import Path
import datetime,hashlib,json,os,shutil,subprocess
REPO=next(p for p in Path(__file__).resolve().parents if (p/'AGENTS.md').is_file())
OWN=Path(__file__).resolve().parents[1];E15=OWN.parent
HOST=REPO/'tmp/chemie-m7-resumed-20261015/equilibrium-four-final-V4-minimal-host-v1'
def now():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def read(p):return json.loads(p.read_text())
def ref(p):
 b=p.read_bytes();return {'path':p.relative_to(REPO).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def dump(p,d):
 t=p.with_name(p.name+'.partial');t.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');os.replace(t,p)
assert not HOST.exists() and not (OWN/'checks/V4.stock-targeted-helper.command.actual.json').exists()
(OWN/'qa').mkdir()
seal=read(OWN/'FIRST.actual-four-context-V-decisions.seal.json');assert seal['normalVBindingsAtSeal']==0
for r in seal['files']:assert ref(REPO/r['path'])==r
science=read(REPO/seal['files'][0]['path']);assert len(science['decisions'])==4
cas=read(OWN/'checks/CAS.final-combined-six-to-own-actual-four-contexts.json');assert cas['changedOwnWholeContexts']==0
canonical=read(REPO/cas['finalCanonical']['path']);goals={g['id']:g for g in canonical['goals']}
aliases=[{'normalAlias':'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json','physical':cas['finalCanonical']},
 {'normalAlias':'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json','physical':cas['finalSemanticSourceOnly']}]
rows=[]
for first in science['decisions']:
 gid=first['goalId'];goal=goals[gid];assert goal==first['wholeFinalGoal'];image=first['actualNativeImage'];assert ref(REPO/image['path'])==image
 link=next(r for r in goal['resourceLinks'] if r['type']=='goal-visualization');public='app/public'+link['url']
 aliases.extend([{'normalAlias':public,'physical':image},{'normalAlias':image['path'],'physical':image}])
 notes=('Own informed independent actual native4/responsive16 final-context review; decision '+first['decision']+'. '+first['nativeFindingsDe']+' '+first['responsiveFindingsDe']+' '+first['boundedActionOrAcceptanceDe']+' Original FIRST '+seal['files'][0]['sha256']+'. No D/P/A/M/source-course/Human/M7 grant.')
 rows.append({'goalId':gid,'title':goal['title'],'description':goal['description'],'subject':'chemie','landscapeId':canonical['landscapeId'],
 'landscapePath':aliases[0]['normalAlias'],'visualizationState':'available','missingReason':'','imageUrl':link['url'],
 'publicAssetPath':public,'canonicalAssetPath':image['path'],'assetSha256':image['sha256'],
 'umlautsCorrectChatGpt':'no','contentApprovedChatGpt':'no','humanApproved':'no','humanIssueIdentified':'no','humanIssueDescription':'',
 'chatGptReviewedAt':None,'chatGptReviewer':'','chatGptNotes':'','humanReviewedAt':None,'humanReviewer':'',
 'aiApproved':'yes' if first['decision']=='accepted' else 'no','aiApprovedAssetSha256':image['sha256'],'aiReviewedAt':first['completedAtUTC'],
 'aiReviewer':'Codex independent C / actual four-final-context informed V science / 2026-10-15','aiNotes':notes})
normal={'schemaVersion':1,'subject':'chemie','source':{'canonicalRoot':'curricula/DE/Gymnasium/canonical','publicAssetRoot':'app/public/assets/goal-visualizations'},'records':rows}
dump(OWN/'qa/V4.final-context.normal-alias.qa.json',normal)
lookup={r['normalAlias']:r['physical'] for r in aliases};physical=json.loads(json.dumps(normal))
physical['source']={'canonicalRoot':str((REPO/cas['finalCanonical']['path']).parent.relative_to(REPO)),'publicAssetRoot':'curricula/DE/Gymnasium/visualizations'}
for r in physical['records']:
 for key in ['landscapePath','canonicalAssetPath','publicAssetPath']:r[key]=lookup[r[key]]['path']
dump(OWN/'qa/V4.final-context.physical-transport.qa.json',physical)
old_path=E15/'chemie-carbonyl15-equilibrium16-current422-bounded-inactive-integration-technical-20261015-v1/candidate/QA438.stock-normalized.actual.json'
old=read(old_path);whole=json.loads(json.dumps(old));newbyid={r['goalId']:r for r in rows};assert len(old['records'])==438
whole['records']=[newbyid.get(r['goalId'],r) for r in old['records']]
assert sum(a==b for a,b in zip(old['records'],whole['records']))==434
dump(OWN/'qa/QA438.original434-plus-four-genuine-current-context-reviews.candidate.json',whole)
dump(OWN/'TRANSPORT.normal-aliases-to-exact-physical-files.json',{'role':'Four genuine votes; exact path-only physical transport adds no votes','normalAliases':aliases,'scientificBodiesUnchanged':True})
dump(OWN/'BINDING.exact-four-final-DEEN-ALT-JPG.normal-V.actual.json',{'boundAtUTC':now(),'FIRSTSeal':ref(OWN/'FIRST.actual-four-context-V-decisions.seal.json'),
 'finalCanonical':cas['finalCanonical'],'finalSemanticSourceOnly':cas['finalSemanticSourceOnly'],'finalContextCAS':ref(OWN/'checks/CAS.final-combined-six-to-own-actual-four-contexts.json'),
 'normalQA':ref(OWN/'qa/V4.final-context.normal-alias.qa.json'),'physicalQA':ref(OWN/'qa/V4.final-context.physical-transport.qa.json'),
 'oldQA438':ref(old_path),'whole438Candidate':ref(OWN/'qa/QA438.original434-plus-four-genuine-current-context-reviews.candidate.json'),
 'uniqueScientificVotes':4,'accepted':2,'rejectedNeedsRevision':2,'other434WholeRowsExact':True,'sourceCourseOrHumanGrant':False})
modules=read(E15/'chemie-equilibrium16-final-native-original-pair-technical-20261015-v1/checks/REBUILD.portable-check-only.physical-source-alias-map.json')['stockPhysicalModules']
HOST.mkdir(parents=True)
physical_map=[]
for r in modules:
 source=REPO/r['path'];assert ref(source)==r
 target=HOST/r['path'];target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(source,target)
 physical_map.append({'normalHostAlias':r['path'],'physicalRepositorySource':r})
profile=REPO/'contracts/curriculum-package/v1/profiles/semantic-normal-form-v1.profile.json'
target=HOST/profile.relative_to(REPO);target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(profile,target)
physical_map.append({'normalHostAlias':profile.relative_to(REPO).as_posix(),'physicalRepositorySource':ref(profile)})
(HOST/'app/node_modules').symlink_to(REPO/'app/node_modules',target_is_directory=True)
image_aliases=[]
for r in aliases:
 source=REPO/r['physical']['path'];assert ref(source)==r['physical']
 target=HOST/r['normalAlias'];target.parent.mkdir(parents=True,exist_ok=True)
 if source.suffix.lower() in ['.jpg','.png']:
  target.symlink_to(source);image_aliases.append({'normalHostAlias':r['normalAlias'],'physicalRepositorySource':r['physical'],'readOnlyExactImageSymlink':True})
 else:shutil.copyfile(source,target);physical_map.append({'normalHostAlias':r['normalAlias'],'physicalRepositorySource':r['physical']})
qa_alias='curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json';target=HOST/qa_alias;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(OWN/'qa/V4.final-context.normal-alias.qa.json',target)
physical_map.append({'normalHostAlias':qa_alias,'physicalRepositorySource':ref(OWN/'qa/V4.final-context.normal-alias.qa.json')})
size=sum(p.stat().st_size for p in HOST.rglob('*') if p.is_file() and not p.is_symlink());assert size<6*1024*1024
dump(OWN/'checks/REBUILD.four-V-final.minimal-host.json',{'role':'Minimal exact V helper capsule; no image duplication','executionHost':HOST.relative_to(REPO).as_posix(),
 'sourceMap':physical_map,'imageAliases':image_aliases,'dependencySymlink':'app/node_modules','physicalRegularBytes':size,'physicalImagesCopied':0,'normalWholeQAOrCentralRuns':0})
argv=[str(REPO/'app/node_modules/.bin/tsx'),str(OWN/'scripts/check_exact_normal_V4.mts'),str(REPO),str(HOST),str(OWN)]
start=now();r=subprocess.run(argv,cwd=HOST,capture_output=True)
(OWN/'checks/V4.stock-targeted-helper.stdout.actual.txt').write_bytes(r.stdout);(OWN/'checks/V4.stock-targeted-helper.stderr.actual.txt').write_bytes(r.stderr)
dump(OWN/'checks/V4.stock-targeted-helper.command.actual.json',{'argv':argv,'cwd':HOST.relative_to(REPO).as_posix(),'startedAtUTC':start,'completedAtUTC':now(),'exitCode':r.returncode,'fullCentralExecuted':False,'wholeQAGeneratorExecuted':False})
assert r.returncode==0,r.stderr.decode()+r.stdout.decode()
print(json.dumps({'targetedStockExitCode':0,'uniqueVotes':4,'accepted':2,'rejectedNeedsRevision':2,'other434RowsExact':True,'physicalImagesCopied':0,'regularHostBytes':size}))
