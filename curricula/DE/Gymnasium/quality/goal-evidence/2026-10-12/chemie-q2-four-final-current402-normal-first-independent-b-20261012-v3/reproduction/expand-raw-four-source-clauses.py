"""Read every selected normal map; expand targeted raw rows without display dedup."""
from pathlib import Path
import json,hashlib
ROOT=Path(__file__).resolve().parents[8];OWN=Path(__file__).resolve().parent.parent
def read(p):return json.loads(Path(p).read_text())
def sha(p):return 'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest()
manifest=ROOT/'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json';config=read(manifest)
neutral=read(ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q2-four-joint-current402-root-integration-preparation-20261012-v1/FINAL.neutral-current402-selected-four-review-input.json')
ids=set(neutral['goalIds']);inherited={e['sourceGoalId'] for g in neutral['goals'] for e in g['wholeCurrentSourceRoutes']['evidence'] if e['kind']=='inherited'}
rows=[];maps=[]
assert len(config['mappingPaths'])==32
for mp in config['mappingPaths']:
 m=read(ROOT/mp);ex=read(ROOT/m['sourceExtractionPath']);sources={g['id']:g for g in ex['sourceGoals']};passages={p['id']:p for p in ex['passages']}
 maps.append({'path':mp,'sha256':sha(ROOT/mp),'sourceExtractionPath':m['sourceExtractionPath'],'sourceExtractionSha256':sha(ROOT/m['sourceExtractionPath'])})
 for d in m['decisions']:
  targets=ids.intersection(d.get('canonicalGoalIds',[]));isd=d['sourceGoalId'] in inherited
  if not targets and not isd:continue
  g=sources[d['sourceGoalId']];rows.append({'mappingPath':mp,'sourceExtractionPath':m['sourceExtractionPath'],'sourceDocument':ex['sourceDocument'],'targetedCurrentGoalIds':sorted(targets),'inheritedBroadContextOnly':isd and not targets,'wholeSourceGoal':g,'wholeSourcePassage':passages.get(g.get('passageId')),'currentMappedPartnerGoalIds':d.get('canonicalGoalIds',[]),'decision':d['decision'],'matchType':d.get('matchType'),'rawRowKeptDespiteDisplayedSourceRefDeduplication':True})
out={'mappingSelectionPath':manifest.relative_to(ROOT).as_posix(),'mappingSelectionSha256':sha(manifest),'normalCurrentMappingCount':32,'all32MapsScanned':True,'directTargetedRawRows':[r for r in rows if r['targetedCurrentGoalIds']],'inheritedBroadRawRows':[r for r in rows if r['inheritedBroadContextOnly']],'mappingAndExtractionBindings':maps,'sourceUnionApproved':False,'humanApproval':False}
(OWN/'sources/current-four-raw32-mapped-clauses.actual.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print('Direct targeted rows',len(out['directTargetedRawRows']),'inherited broad rows',len(out['inheritedBroadRawRows']))
for r in rows:
 g=r['wholeSourceGoal'];print('\nTARGET',','.join(x[:8] for x in r['targetedCurrentGoalIds']) or 'inherited','SOURCE',g['id'],'LEVEL',g.get('courseLevel'))
 print('literal:',g.get('rawSourceText',g.get('sourceText',g.get('description'))));print('parent:',g.get('rawParentBulletText',g.get('parentBulletText')))
 print('partners:',r['currentMappedPartnerGoalIds'])
