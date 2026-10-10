from pathlib import Path
import os,json,hashlib
ROOT=Path('/home/enpasos/projects/skillpilot')
S=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current517-source7-normal37-reviewed-inactive-j-private-completion-technical-successor-20261010-v2')
CAP=ROOT/'tmp/m7-resumption-20261010/chemistry-source7-normal37-j-integration-isolated-v3'
config=json.loads((ROOT/S/'registry/all-subjects-latestBio353-chem-only-reviewed.inactive.config.json').read_text())
added=[];aliases=[];missing=[]
def put(rel):
 rel=Path(os.path.normpath(str(rel)));assert not rel.is_absolute() and '..' not in rel.parts
 src=ROOT/rel;dst=CAP/rel
 if not src.is_file():missing.append(str(rel));return
 resolved=src.resolve(strict=True);r=str(resolved.relative_to(ROOT));assert not r.startswith(('tmp/','app/node_modules/'))
 if src!=resolved:aliases.append({'logicalFile':str(rel),'resolvedRegularFile':r})
 if dst.exists():return
 dst.parent.mkdir(parents=True,exist_ok=True);os.link(resolved,dst)
 added.append({'path':str(rel),'sourceResolved':r,'sha256':'sha256:'+hashlib.sha256(src.read_bytes()).hexdigest(),'bytes':src.stat().st_size})
def selectedTree(rel):
 base=ROOT/rel
 if not base.is_dir():missing.append(str(rel));return
 for d,dirs,files in os.walk(base,followlinks=False):
  dirs[:]=[name for name in dirs if not (Path(d)/name).is_symlink()]
  for name in files:
   p=Path(d)/name
   if p.suffix in {'.json','.jsonl','.md','.txt'}:put(p.relative_to(ROOT))
for subject in config['subjects']:
 for idx in subject['resolutionIndexPaths']:
  q=json.loads((ROOT/idx).read_text());parent=Path(idx).parent
  for group in q.get('groups',[]):
   directory=Path(os.path.normpath(str(parent/group.get('artifactDirectory',group['groupId']))));selectedTree(directory)
   put(parent/group['dualSummaryPath'])
   for label in ['round-a','round-b']:
    for filename in ['review-bundle-manifest.json','description-review-input.json','description-review-campaign.json']:put(directory/label/filename)
    for dirname in ['batches','results']:selectedTree(directory/label/dirname)
  for record in q.get('resolutions',[]):
   if 'resolutionPath' in record:put(parent/record['resolutionPath'])
 land=json.loads((ROOT/subject['landscapePath']).read_text())
 for goal in land.get('goals',[]):
  ext=goal.get('extendedData',{})
  for key in ['vocabularySource','vocabularySourceEn']:
   source=ext.get(key,'')
   if source:
    rel='app/public'+source if source.startswith('/data/') else source.lstrip('/')
    put(rel)
receipt={'schemaVersion':1,'exactReferencedAdditionalInputs':added,'exactFileAliases':aliases,'missingRootReferencedInputs':sorted(set(missing)),'relativeHistoricalGroupsRestoredByExactInputCopies':True,'originalScientificReviewsChanged':0,'activeWrites':[],'newScientificReviews':0,'noDirectorySymlinkTreesTraversed':True}
(ROOT/S/'checks/private-missing-relative-groups-and-decks-completion.actual.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps({'addedFiles':len(added),'explicitFileAliases':len(aliases),'rootMissing':receipt['missingRootReferencedInputs']}))
assert not missing
