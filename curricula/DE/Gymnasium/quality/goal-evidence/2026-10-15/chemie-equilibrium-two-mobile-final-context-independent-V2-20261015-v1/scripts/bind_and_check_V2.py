# SPDX-License-Identifier: Apache-2.0
"""Bind only two sealed actual-PNG decisions, preserve436 whole QA rows."""
from pathlib import Path
import datetime,hashlib,json,os,shutil,subprocess
REPO=next(p for p in Path(__file__).resolve().parents if (p/'AGENTS.md').is_file())
OWN=Path(__file__).resolve().parents[1];E15=OWN.parent
HOST=REPO/'tmp/chemie-m7-resumed-20261015/equilibrium-two-mobile-final-V2-minimal-host-v1'
def now():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def read(p):return json.loads(p.read_text())
def ref(p):
 b=p.read_bytes();return {'path':p.relative_to(REPO).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def dump(p,d):
 t=p.with_name(p.name+'.partial');t.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');os.replace(t,p)
assert not HOST.exists() and not (OWN/'checks/V2.stock-targeted-helper.command.actual.json').exists()
(OWN/'qa').mkdir()
first_seal_path=OWN/'FIRST.actual-two-mobile-PNG-V-decisions.seal.json';first_seal=read(first_seal_path)
assert first_seal['normalVBindingsAtSeal']==0
for r in first_seal['files']:assert ref(REPO/r['path'])==r
science=read(REPO/first_seal['files'][0]['path']);assert len(science['decisions'])==2 and all(r['decision']=='accepted' for r in science['decisions'])
ctx=read(OWN/'inputs/two-whole-final-competencies-prereqs-four-cases-and-PNGs.exact.json')
neutral=read(REPO/ctx['neutralScientificSelector']['path'])
canonical=read(REPO/neutral['currentCanonical']['path']);goals={g['id']:g for g in canonical['goals']}
assert ref(REPO/neutral['currentCanonical']['path'])==neutral['currentCanonical']
assert ref(REPO/neutral['unchangedSemanticSourceIdentities']['path'])==neutral['unchangedSemanticSourceIdentities']
author_root=Path(ctx['neutralScientificSelector']['path']).parent
author_seals=[p for p in (REPO/author_root).glob('*.json') if 'seal' in p.name.lower()]
author_seal=next(p for p in author_seals if ref(p)['sha256']=='sha256:52e74ca137e6251b27eaec7dc88f3f737d33458b8b19ed7e17f242ae415a113d')
base_path=E15/'chemie-carbonyl15-equilibrium16-current422-bounded-inactive-integration-technical-20261015-v1/candidate/QA438.stock-normalized.actual.json'
carbonyl_path=E15/'chemie-carbonyl-two-final-context-independent-V-20261015-v1/qa/V2.final-context.normal-alias.qa.json'
v4_path=E15/'chemie-equilibrium-four-final-context-independent-V-20261015-v1/qa/V4.final-context.normal-alias.qa.json'
base=read(base_path);carbonyl=read(carbonyl_path);v4=read(v4_path)
assert len(base['records'])==438 and len(carbonyl['records'])==2 and len(v4['records'])==4
prior_rows={r['goalId']:r for r in carbonyl['records']+v4['records']};assert len(prior_rows)==6
baseline=json.loads(json.dumps(base));baseline['records']=[prior_rows.get(r['goalId'],r) for r in base['records']]
assert sum(a==b for a,b in zip(base['records'],baseline['records']))==432
baseline_path=OWN/'inputs/BASELINE.QA438.exact-358-plus-carbonylV2-plus-equilibriumV4.json';dump(baseline_path,baseline)
preserved=[]
for name,filename,expected in [
 ('chemie-equilibrium-four-final-wording-memory-informed-20261015-v1','FILES.finite-four-final-wording-M4.seal.json','4e4599a4894c2da253d66d01a2d8ac73b4b5929fb884f965c155cf7ba5adcfb8'),
 ('chemie-equilibrium-four-final-context-independent-V-20261015-v1','FILES.finite-four-context-independent-V4.seal.json','db91385b1d669e3523a3253478f501bfb1b132550695168a7ff372a3b75da8ad')]:
 p=E15/name/filename;assert ref(p)['sha256']=='sha256:'+expected
 data=read(p)
 for row in data['files']:assert ref(REPO/row['path'])==row
 preserved.append({'seal':ref(p),'allSealedOriginalFilesExact':True,'sealedFileCount':len(data['files'])})
keep_carbonyl=[r['goalId'] for r in carbonyl['records']]
keep_v4=[r['goalId'] for r in v4['records'] if r['aiApproved']=='yes'];assert len(keep_v4)==2
dump(OWN/'inputs/BASELINE.exact-source-composition-and-preserved-originals.json',{'createdAtUTC':now(),
 'role':'Explicit named current438 prior-vote baseline; no new or rebound prior scientific vote',
 'original358QA438':ref(base_path),'exactCarbonylV2':ref(carbonyl_path),'exactEquilibriumV4':ref(v4_path),
 'named438Baseline':ref(baseline_path),'priorScientificRowsSelectedExact':6,'other432Original358RowsExact':True,
 'preservedWholeVoteSources':[{'source':ref(carbonyl_path),'preservedGoalIds':keep_carbonyl},{'source':ref(v4_path),'preservedGoalIds':keep_v4}],
 'originalM4V4Preservation':preserved,'oldNegativeV4VotesRemainExactInOriginalAndNamedBaseline':True,
 'newVotesInBaselineComposition':0,'activeWrites':0})
aliases=[{'normalAlias':'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json','physical':neutral['currentCanonical']},
 {'normalAlias':'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json','physical':neutral['unchangedSemanticSourceIdentities']}]
rows=[]
for first in science['decisions']:
 gid=first['goalId'];goal=goals[gid];assert goal==first['wholeFinalGoal'];image=first['exactNativePNG'];assert ref(REPO/image['path'])==image
 whole=next(r for r in ctx['wholeContexts'] if r['goal']['id']==gid)
 assert [goals[x] for x in goal['requires']]==whole['wholeDirectPrerequisites']
 assert [p for p in canonical['goals'] if gid in p.get('contains',[])]==whole['wholeDirectParents']
 link=next(r for r in goal['resourceLinks'] if r['type']=='goal-visualization');public='app/public'+link['url'];canon='curricula/DE/Gymnasium/visualizations/chemie/'+gid+'/'+gid+'.png'
 aliases.extend([{'normalAlias':public,'physical':image},{'normalAlias':canon,'physical':image}])
 notes='Own independent informed acceptance after actual native2 and responsive8 final-PNG inspection. '+first['nativeFindingsDe']+' '+first['responsiveFindingsDe']+' '+first['wholeContextCompatibilityDe']+' FIRST '+first_seal['files'][0]['sha256']+'. No D/P/A/M/source-course/Human/M7 grant.'
 rows.append({'goalId':gid,'title':goal['title'],'description':goal['description'],'subject':'chemie','landscapeId':canonical['landscapeId'],
 'landscapePath':aliases[0]['normalAlias'],'visualizationState':'available','missingReason':'','imageUrl':link['url'],
 'publicAssetPath':public,'canonicalAssetPath':canon,'assetSha256':image['sha256'],'umlautsCorrectChatGpt':'no','contentApprovedChatGpt':'no',
 'humanApproved':'no','humanIssueIdentified':'no','humanIssueDescription':'','chatGptReviewedAt':None,'chatGptReviewer':'','chatGptNotes':'',
 'humanReviewedAt':None,'humanReviewer':'','aiApproved':'yes','aiApprovedAssetSha256':image['sha256'],'aiReviewedAt':first['completedAtUTC'],
 'aiReviewer':'Codex independent C / informed actual two-mobile-PNG successor V2 / 2026-10-15','aiNotes':notes})
normal={'schemaVersion':1,'subject':'chemie','source':{'canonicalRoot':'curricula/DE/Gymnasium/canonical','publicAssetRoot':'app/public/assets/goal-visualizations'},'records':rows}
dump(OWN/'qa/V2.two-final-PNGs.normal-alias.qa.json',normal)
lookup={r['normalAlias']:r['physical'] for r in aliases};physical=json.loads(json.dumps(normal))
physical['source']={'canonicalRoot':str((REPO/neutral['currentCanonical']['path']).parent.relative_to(REPO)),
 'publicAssetRoot':str((REPO/author_root/'candidate/visualizations').relative_to(REPO))}
for r in physical['records']:
 for key in ['landscapePath','canonicalAssetPath','publicAssetPath']:r[key]=lookup[r[key]]['path']
dump(OWN/'qa/V2.two-final-PNGs.physical-transport.qa.json',physical)
newrows={r['goalId']:r for r in rows};current=json.loads(json.dumps(baseline));current['records']=[newrows.get(r['goalId'],r) for r in baseline['records']]
assert sum(a==b for a,b in zip(baseline['records'],current['records']))==436
dump(OWN/'qa/QA438.original436-plus-two-independent-new-PNG-reviews.candidate.json',current)
dump(OWN/'TRANSPORT.normal-aliases-to-exact-physical-PNGs.json',{'role':'Two scientific votes, physical path transport adds no votes','normalAliases':aliases,'scientificBodiesUnchanged':True})
dump(OWN/'BINDING.exact-two-final-DEEN-ALT-PNG.normal-V2.actual.json',{'boundAtUTC':now(),'FIRSTSeal':ref(first_seal_path),
 'neutralScientificInput':ctx['neutralScientificSelector'],'authorSeal':ref(author_seal),'finalCanonical':neutral['currentCanonical'],
 'finalSemanticSourceOnly':neutral['unchangedSemanticSourceIdentities'],'namedPrior438Baseline':ref(baseline_path),
 'normalQA2':ref(OWN/'qa/V2.two-final-PNGs.normal-alias.qa.json'),'physicalTransportQA2':ref(OWN/'qa/V2.two-final-PNGs.physical-transport.qa.json'),
 'whole438Candidate':ref(OWN/'qa/QA438.original436-plus-two-independent-new-PNG-reviews.candidate.json'),
 'uniqueScientificVotes':2,'other436WholeRowsExact':True,'oldM4V4AndNegativeVotesExact':True,'sourceCourseOrHumanGrant':False})
modules=read(E15/'chemie-equilibrium16-final-native-original-pair-technical-20261015-v1/checks/REBUILD.portable-check-only.physical-source-alias-map.json')['stockPhysicalModules']
HOST.mkdir(parents=True);source_map=[];image_aliases=[]
for r in modules:
 source=REPO/r['path'];assert ref(source)==r
 target=HOST/r['path'];target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(source,target)
 source_map.append({'normalHostAlias':r['path'],'physicalRepositorySource':r})
profile=REPO/'contracts/curriculum-package/v1/profiles/semantic-normal-form-v1.profile.json';target=HOST/profile.relative_to(REPO);target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(profile,target)
source_map.append({'normalHostAlias':profile.relative_to(REPO).as_posix(),'physicalRepositorySource':ref(profile)})
(HOST/'app/node_modules').symlink_to(REPO/'app/node_modules',target_is_directory=True)
for r in aliases:
 source=REPO/r['physical']['path'];assert ref(source)==r['physical'];target=HOST/r['normalAlias'];target.parent.mkdir(parents=True,exist_ok=True)
 if source.suffix=='.png':target.symlink_to(source);image_aliases.append({'normalHostAlias':r['normalAlias'],'physicalRepositorySource':r['physical'],'readOnlyExactImageSymlink':True})
 else:shutil.copyfile(source,target);source_map.append({'normalHostAlias':r['normalAlias'],'physicalRepositorySource':r['physical']})
qa_alias='curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json';target=HOST/qa_alias;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(OWN/'qa/V2.two-final-PNGs.normal-alias.qa.json',target)
source_map.append({'normalHostAlias':qa_alias,'physicalRepositorySource':ref(OWN/'qa/V2.two-final-PNGs.normal-alias.qa.json')})
size=sum(p.stat().st_size for p in HOST.rglob('*') if p.is_file() and not p.is_symlink());assert size<6*1024*1024
dump(OWN/'checks/REBUILD.two-PNG-V2.final-minimal-host.json',{'role':'Minimal exact two-PNG V2 helper capsule; no source PNG duplication',
 'executionHost':HOST.relative_to(REPO).as_posix(),'sourceMap':source_map,'imageAliases':image_aliases,'dependencySymlink':'app/node_modules',
 'physicalRegularBytes':size,'sourcePNGPhysicalCopies':0,'normalWholeQAOrCentralRuns':0})
argv=[str(REPO/'app/node_modules/.bin/tsx'),str(OWN/'scripts/check_exact_normal_V2.mts'),str(REPO),str(HOST),str(OWN)]
start=now();result=subprocess.run(argv,cwd=HOST,capture_output=True)
(OWN/'checks/V2.stock-targeted-helper.stdout.actual.txt').write_bytes(result.stdout);(OWN/'checks/V2.stock-targeted-helper.stderr.actual.txt').write_bytes(result.stderr)
dump(OWN/'checks/V2.stock-targeted-helper.command.actual.json',{'argv':argv,'cwd':HOST.relative_to(REPO).as_posix(),'startedAtUTC':start,'completedAtUTC':now(),
 'exitCode':result.returncode,'fullCentralExecuted':False,'wholeQAGeneratorExecuted':False,'targetedHelperSuccessfulRuns':int(result.returncode==0)})
assert result.returncode==0,result.stderr.decode()+result.stdout.decode()
print(json.dumps({'stockTargetedHelper':0,'uniqueVotes':2,'accepted':2,'other436WholeObjectsExact':True,'Carbonyl2And1a0cExact':True,
 'oldM4V4AndNegativesPreserved':True,'sourceImageCopies':0,'regularHostBytes':size}))
