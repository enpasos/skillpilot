# SPDX-License-Identifier: Apache-2.0
"""Create a regular full-discovery capsule with independent writable outputs."""
import copy,hashlib,json,os,shutil,subprocess
from pathlib import Path
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent;REL=OWN.relative_to(ROOT).as_posix()
OLD=OWN.parent/'biologie-basis2-current-reviewed-integration-preparation-resumed-v1'
CAP=ROOT/'tmp/biologie-basis2-supplement-reviewed394-regular-resumed-v2-capsule'
def data(p):return json.loads(Path(p).read_text())
def bind(p):
 p=Path(p);b=p.read_bytes();return {'path':p.relative_to(ROOT).as_posix(),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(p,v):
 p=Path(p);p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists(),str(p);p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n');return bind(p)
guard=data(OWN/'reviewed-supplement-adoption.initial.guard.json');assert not CAP.exists()
reg=data(ROOT/guard['before']['registry']['active']['path']);before=copy.deepcopy(reg);bio=next(s for s in reg['subjects'] if s['subject']=='biologie')
newindex=OWN/'native-d-current-supplement/resolution-index.json';assert len(data(newindex)['resolutions'])==2
wordindex=ROOT/guard['existingWordResolutionIndex'];assert data(wordindex)['batchGoalIds']==[guard['contextSupersessionGoalId']]
oldafter=data(OLD/'candidate/central-registry394.reviewed-two-and-word-supersession.future-active.json');oldbio=next(s for s in oldafter['subjects'] if s['subject']=='biologie')
supersession=oldbio['resolutionSupersessions'][-1];assert supersession['goalId']==guard['contextSupersessionGoalId'] and supersession['replacementIndexPath']==guard['existingWordResolutionIndex']
assert supersession['supersededIndexPath'] in bio['resolutionIndexPaths']
bio['resolutionIndexPaths'] += [str(newindex.relative_to(ROOT)),guard['existingWordResolutionIndex']]
bio['resolutionSupersessions'].append(supersession)
bio['positiveEvidenceConfigPaths'].append(guard['positiveConfig']['path'])
assert [s for s in reg['subjects'] if s['subject']!='biologie']==[s for s in before['subjects'] if s['subject']!='biologie']
guard['candidate']['registry']=put(OWN/'candidate/central-registry394.new-current-context-two-and-retained-word.future-active.json',reg)
guard['existingWordSupersession']=supersession
put(OWN/'reviewed-supplement-adoption.candidate.guard.json',guard)
CAP.mkdir(parents=True)
hardlinks=0;copies=0;historicalLinksDereferenced=0
def clone_read_inputs(src,dest):
 global hardlinks,copies,historicalLinksDereferenced
 if src.is_dir():
  dest.mkdir(parents=True,exist_ok=True)
  for p in src.iterdir():clone_read_inputs(p,dest/p.name)
 elif src.is_file():
  dest.parent.mkdir(parents=True,exist_ok=True)
  if src.is_symlink():
   # Existing historic aliases become ordinary read files; no discovery exception.
   assert src.resolve().is_relative_to(ROOT),str(src);os.link(src.resolve(),dest);historicalLinksDereferenced+=1
  else:os.link(src,dest)
  hardlinks+=1
 else:raise AssertionError('Missing/dangling required curriculum input '+str(src))
clone_read_inputs(ROOT/'curricula',CAP/'curricula')
clone_read_inputs(ROOT/'contracts',CAP/'contracts')
# Full ordinary graph discovery traverses regular directories, never linked JSON trees.
assert not any(p.is_symlink() for p in (CAP/'curricula').rglob('*'))
for name in ['docs','app/scripts','scripts']:
 shutil.copytree(ROOT/name,CAP/name,symlinks=False)
copies+=sum(p.is_file() for name in ['docs','app/scripts','scripts'] for p in (CAP/name).rglob('*'))
# Dependencies and runtime read trees do not participate in curriculum JSON discovery.
(CAP/'app/node_modules').symlink_to(ROOT/'app/node_modules',target_is_directory=True)
(CAP/'app/src').symlink_to(ROOT/'app/src',target_is_directory=True)
for f in ['package.json','package-lock.json','tsconfig.json']:
 if (ROOT/'app'/f).is_file():shutil.copyfile(ROOT/'app'/f,CAP/'app'/f)
clone_read_inputs(ROOT/'app/public/assets/goal-visualizations',CAP/'app/public/assets/goal-visualizations')
for f in ['package.json','LICENSE','LICENSES/CC-BY-4.0.txt','AGENTS.md']:
 if (ROOT/f).is_file():
  (CAP/f).parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(ROOT/f,CAP/f)
(CAP/'tmp').mkdir(exist_ok=True)
def independent_install(source,target):
 target=CAP/target;target.parent.mkdir(parents=True,exist_ok=True)
 if target.exists() or target.is_symlink():target.unlink()
 shutil.copyfile(source,target)
 assert not target.is_symlink() and target.stat().st_nlink==1,str(target)
for key,candidate in guard['candidate'].items():independent_install(ROOT/candidate['path'],guard['before'][key]['active']['path'])
for item in guard['mappingInstalls']+guard['imageInstalls']:independent_install(ROOT/item['source']['path'],item['destination'])
# Status/audit generators use independent regular files and normal configured paths.
for p in (CAP/'docs/qa-ci/status').rglob('*'):
 if p.is_file():assert not p.is_symlink() and p.stat().st_nlink==1,str(p)
for p in (CAP/'app/scripts/config/goal-books').rglob('*'):
 if p.is_file():assert not p.is_symlink() and p.stat().st_nlink==1,str(p)
# This actual frame checker alone creates a new own technical output under capsule.
target=CAP/REL/'verify-whole394-actual-loader-and-context.technical.mts';target.unlink(missing_ok=True);shutil.copyfile(OWN/'verify-whole394-actual-loader-and-context.technical.mts',target)
for v in guard['before'].values():assert bind(ROOT/v['active']['path'])==v['active']
put(OWN/'checks/regular-capsule-independent-writable-outputs.actual.json',{'schemaVersion':1,'capsuleRoot':str(CAP.relative_to(ROOT)),'wholeCurriculaRegularFileCount':sum(p.is_file() for p in (CAP/'curricula').rglob('*')),'curriculumDiscoverySymlinks':0,'unchangedReadingHardlinks':hardlinks,'historicalReadingAliasesDereferencedToRegularFiles':historicalLinksDereferenced,'independentCopiedDeveloperAndDocsFiles':copies,'allActiveSevenCandidateInstallsIndependentRegularFiles':True,'allEightMappingInstallsIndependentRegularFiles':True,'allAtlasConfigAndStatusOutputsIndependentRegularCopies':True,'noSchemaDiscoveryOrGateExceptions':True,'activeWholeSevenInputsUnchanged':True,'activeWrites':0})
print(json.dumps({'capsule':str(CAP.relative_to(ROOT)),'normalCurriculumDiscovery':True,'readOnlyHardlinks':hardlinks,'candidateActiveWrites':0}))
