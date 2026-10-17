from pathlib import Path
from hashlib import sha256
import json,os
O=Path(__file__).resolve().parent;G=Path('/mnt/e/skillpilot-chemie-L7-20261017/current439-AV-and-native-registry-integration-root-v1/capsule')
s=json.loads((O/'SELECTION.remaining14-actual-current-root17-185-and-owner-plan.json').read_text());ids=s['selectedGoalIds'];selected=set(ids)
def read(p):return json.loads(p.read_text())
def pin(p):
 b=p.read_bytes();return {'path':str(p),'sha256':sha256(b).hexdigest(),'bytes':len(b)}
land=read(Path(s['canonicalPin']['path']));goals={g['id']:g for g in land['goals']};model=read(Path(s['currentModel']['path']));pages={p['goalId']:p for p in model['pages']}
lines=Path(s['P439Pin']['path']).read_bytes().splitlines(keepends=True);rawP={json.loads(line)['goalId']:line for line in lines if line.strip()};records={gid:json.loads(rawP[gid]) for gid in ids}
registryPath=G/'curricula/DE/Gymnasium/provenance/source-landscape-registry.json';registry={r['landscapeId']:r for r in read(registryPath)['entries']}
maproot=G/'curricula/DE/Gymnasium/mapping';partnerByGoal={gid:[] for gid in ids};partnerPins={};pdfPins={}
# Read only current plain mapping data. Review ledgers, peer findings and verdicts are excluded.
for root,dirs,names in os.walk(maproot,followlinks=True):
 for name in names:
  if not name.endswith('.json') or 'chemistry' not in name.lower() or '.review' in name.lower():continue
  p=Path(root)/name;relative=p.relative_to(maproot);jur=relative.parts[0]
  data=read(p);rows=[r for r in data.get('mappings',[]) if r.get('canonicalGoalId') in selected and jur in goals[r['canonicalGoalId']].get('applicability',{}).get('jurisdiction',[])]
  if not rows:continue
  partnerPins[str(p)]=pin(p);reg=registry.get(data.get('sourceLandscapeId'))
  sourceFiles=[]
  if reg:
   for key in ['archiveSourcePath','sourcePath']:
    rel=reg.get(key)
    if not rel:continue
    q=G/rel
    if q.is_file() and str(q) not in {x['path'] for x in sourceFiles}:
     if str(q) not in pdfPins:pdfPins[str(q)]=pin(q)
     sourceFiles.append(pdfPins[str(q)])
  for row in rows:
   partnerByGoal[row['canonicalGoalId']].append({'currentJurisdiction':jur,'mappingPath':str(p),'mappingPin':partnerPins[str(p)],'mappingEntry':row,'sourceLandscapeId':data.get('sourceLandscapeId'),'sourceLandscapeRegistryEntry':reg,'originalSourceReadOnlyFilePins':sourceFiles,'sourceGoalLocator':row.get('legacyGoalId')})
rows=[]
for gid in ids:
 goal=goals[gid];page=pages[gid]
 parents=[g for g in land['goals'] if gid in g.get('contains',[])]
 rows.append({'goalId':gid,'currentWholeCanonicalGoal':goal,'currentWholePositiveEvidenceRecord':records[gid],
  'teacherContext':{'currentDirectPrerequisiteWholeGoals':[goals[r] for r in goal.get('requires',[]) if r in goals],'currentDirectParentWholeClusters':parents,'currentFull439PageContext':{k:page.get(k) for k in ['pageNumber','navigationOrder','treeOrder','breadcrumbs','chapterIds','requires','reverseRequires','externalPrerequisites','externalReverseRequires']},'authoredCurrentApplicability':goal.get('applicability')},
  'currentDirectSourcePartnersForAuthoredJurisdictions':partnerByGoal[gid]})
obj={'schemaVersion':1,'role':'Clean current14 whole canonical/P and teacher context; existing raw source partner references only','sourceRoot':str(G),'goalIds':ids,'scope':14,'sourceCanonicalPin':s['canonicalPin'],'sourceP439Pin':s['P439Pin'],'sourceRegistryPin':pin(registryPath),'rows':rows,'currentMappingFilePins':list(partnerPins.values()),'originalSourceReadOnlyPins':list(pdfPins.values()),
 'sourceBoundary':'These are existing raw current mapping/source references for the authored jurisdiction scope. Direct references do not claim exhaustive inherited applicability, official universal coverage, a new source review or a scientific verdict. No peer findings or suggested review outcome is included.',
 'newScienceVotes':0,'humanApprovalClaim':False,'reviewOutcomesPredetermined':False}
p=O/'CLEAN.current14-whole-C-whole-P-and-teacher-source-context.json';assert not p.exists();p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n');json.loads(p.read_text())
p=O/'CLEAN.current14-whole-P-exact-existing-lines.jsonl';assert not p.exists();p.write_bytes(b''.join(rawP[gid] for gid in ids))
for line in p.read_text().splitlines():json.loads(line)
print(json.dumps({'scope':14,'directCurrentSourcePartners':sum(len(x) for x in partnerByGoal.values()),'mappingFiles':len(partnerPins),'originalSourceReferences':len(pdfPins),'cleanSupplement':pin(O/'CLEAN.current14-whole-C-whole-P-and-teacher-source-context.json'),'scienceVotes':0},indent=2))
