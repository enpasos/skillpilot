# Apache-2.0. Append real D7 index, terminal owners only; no invented branch or vote.
import copy,datetime,hashlib,json,pathlib
R=pathlib.Path('/home/enpasos/projects/skillpilot');O=pathlib.Path(__file__).parent;H=R/'tmp/checkpoint-chemie-20261013/current407-corrected-P8-native4-physical-host'
read=lambda p:json.loads(p.read_text())
def bind(p):return {'path':str(p.relative_to(R)),'sha256':'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def local(s):return H/s if (H/s).exists() else R/s
cfg=read(O/'config/chemie-current407-N7-existing274.before-D7-index.inactive.config.json');s=cfg['subjects'][0]
ids=read(O/'native-seven/resolution-index.json')['batchGoalIds'];idset=set(ids);index=str((O/'native-seven/resolution-index.json').relative_to(R));oldIndexes=copy.deepcopy(s['resolutionIndexPaths']);oldEdges=copy.deepcopy(s['resolutionSupersessions'])
owners={g:[] for g in ids}
for path in oldIndexes:
 for row in read(local(path))['resolutions']:
  if row['goalId'] in idset:owners[row['goalId']].append(path)
edges=[];terminal=[]
for gid,paths in owners.items():
 superseded={r['supersededIndexPath'] for r in oldEdges if r['goalId']==gid};tips=[p for p in paths if p not in superseded]
 assert len(tips)<=1,(gid,tips)
 terminal.append({'goalId':gid,'allPreviouslyOperativeOwners':paths,'terminalOwner':tips[0] if tips else None})
 if tips:edges.append({'goalId':gid,'supersededIndexPath':tips[0],'replacementIndexPath':index})
s['resolutionIndexPaths'].append(index);s['resolutionSupersessions'].extend(edges)
oldP7=str((O/'config/P7.a.preserved-original-stock-check.config.json').relative_to(R));p6=str((O/'config/P6.a.original-science-except-held682.normal-alias.config.json').relative_to(R))
assert s['positiveEvidenceConfigPaths'].count(oldP7)==1;s['positiveEvidenceConfigPaths']=[p6 if p==oldP7 else p for p in s['positiveEvidenceConfigPaths']]
assert s['resolutionIndexPaths'][:-1]==oldIndexes and s['resolutionSupersessions'][:len(oldEdges)]==oldEdges
out=O/'config/chemie-current407-N7-existing274.inactive.config.json';assert not out.exists();out.write_text(json.dumps(cfg,ensure_ascii=False,indent=2)+'\n')
cas={'schemaVersion':1,'preparedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'baseBeforeD7Config':bind(O/'config/chemie-current407-N7-existing274.before-D7-index.inactive.config.json'),'finalConfig':bind(out),
 'newD7Index':bind(O/'native-seven/resolution-index.json'),'exactPreviousTerminalOwnerDiscovery':terminal,'newTerminalOnlySupersessionEdges':edges,
 'allOld65IndexSelectionsAnd131SupersessionEdgesExact':len(oldIndexes)==65 and len(oldEdges)==131,'noPreviousOwnerForTheseSevenThereforeNoFakeSupersession':not any(owners.values()),
 'operativeD7ActualResolutionCount':len(read(O/'native-seven/resolution-index.json')['resolutions']),
 'operativeA7AndP6ActualOriginalScienceOnly':True,'held682PositiveProfileNotOperative':True,'actualStockStrictGainAwaitedNotPredicted':True,'newScienceVotes':0,'activeWrites':False}
(O/'CAS.final-D7-index-terminal-owner-and-P6-selection.actual.json').write_text(json.dumps(cas,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'previousDIndexes':len(oldIndexes),'currentDIndexes':len(s['resolutionIndexPaths']),'newTerminalEdges':len(edges),'previousEdgesPreserved':len(oldEdges),'P6':True,'config':str(out.relative_to(R))}))
