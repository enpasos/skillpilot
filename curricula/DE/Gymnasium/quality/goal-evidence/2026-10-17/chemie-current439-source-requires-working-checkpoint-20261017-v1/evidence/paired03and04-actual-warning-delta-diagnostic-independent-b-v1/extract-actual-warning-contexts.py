import json,hashlib,collections
from pathlib import Path
O=Path(__file__).parent
D=Path('/mnt/e/skillpilot-chemie-L7-20261017/paired-package03-and04-actual-current650-technical-v1')
receipt_path=D/'RECEIPT.partial73-net-restoration.HOLD-two-new-HB-exclusions.json'
receipt=json.load(open(receipt_path));check_path=D/'CHECK.actual75-restored-and-current149-warning-delta.json';check=json.load(open(check_path))
def pin(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def read(p):return json.load(open(p))
def load_report(p):
 j=read(p);return next(r for r in j['reports'] if r['landscapeId']=='c436b994-8f44-5134-b9f8-0c9f5d6a5ba0')
beforepin=next(p for p in check['inputs'] if '/actual650-paired-' in p['path'] and '/STOCK.' in p['path'])
afterpin=receipt['outputs']['stockApplicability']
b=load_report(beforepin['path']);a=load_report(afterpin['path'])
key=lambda f:json.dumps(f,ensure_ascii=False,sort_keys=True)
bw={key(f):f for f in b['findings'] if f['severity']=='warning'};aw={key(f):f for f in a['findings'] if f['severity']=='warning'}
introduced=[aw[k] for k in sorted(aw.keys()-bw.keys())];removed=[bw[k] for k in sorted(bw.keys()-aw.keys())]
ids={f['goalId'] for f in introduced+removed};bg={g['goalId']:g for g in b['goals']};ag={g['goalId']:g for g in a['goals']}
basepath=Path('/mnt/e/skillpilot-chemie-L7-20261017/paired-twenty-foundations-and-coordinate-priors-actual-whole650-assembly-root-v1/candidate.canonical650.paired-c95-twenty-foundations-and-coordinate-priors.private.json')
base=read(basepath);cur=read(receipt['outputs']['canonical']['path']);bm={g['id']:g for g in base['goals']};cm={g['id']:g for g in cur['goals']}
root=D/'capsule';mappingfiles={}
for gid in ids:
 for e in bg[gid]['evidence']+ag[gid]['evidence']:
  if e['kind']=='mapping':mappingfiles[e['source']]=read(root/e['source'])
mapping_contexts=[]
for source,m in sorted(mappingfiles.items()):
 entries=[x for x in m.get('mappings',[]) if x.get('canonicalGoalId') in ids]
 mapping_contexts.append({'file':pin(root/source),'rootMetadata':{k:v for k,v in m.items() if k!='mappings'},'wholeRelevantMappingEntries':entries})
rows=[]
for gid in sorted(ids):
 g=cm[gid];be=set(bg[gid]['compiledApplicability'].get('jurisdiction',[]));ae=set(ag[gid]['compiledApplicability'].get('jurisdiction',[]));raw=set(g.get('applicability',{}).get('jurisdiction',[]))
 rows.append({'goalId':gid,'title':g['title'],'wholeBeforeGoal':bm[gid],'wholeAfterGoal':g,'beforeReport':bg[gid],'afterReport':ag[gid],'actualAddedCompiledJurisdictions':sorted(ae-be),'actualRemovedCompiledJurisdictions':sorted(be-ae),'actualRawOnlyJurisdictions':sorted(raw-ae),'actualCompiledOnlyJurisdictions':sorted(ae-raw),'rawDiffOnlyOrder':raw==ae and g.get('applicability')!=ag[gid]['compiledApplicability'],'newWarningCodes':[f['code'] for f in introduced if f['goalId']==gid],'removedWarningCodes':[f['code'] for f in removed if f['goalId']==gid]})
pins=[pin(receipt_path),pin(check_path),pin(basepath),pin(receipt['outputs']['canonical']['path']),pin(beforepin['path']),pin(afterpin['path']),pin(receipt['outputs']['whole39Views']['path']),pin(receipt['outputs']['actualFrontend']['path']),pin(root/'AGENTS.md'),pin('/home/enpasos/projects/skillpilot/app/scripts/applicabilityCompiler.ts')]
for expected in [beforepin,afterpin,*receipt['outputs'].values()]:
 if isinstance(expected,dict) and 'path' in expected:
  actual=pin(expected['path']);assert actual['sha256']==expected['sha256'],expected['path'];assert actual['bytes']==expected['bytes'],expected['path']
result={'role':'Independent technical extraction from actual stock reports and physical canonical/mapping bytes; no compiler invocation or science vote','inputPins':pins,'actualSummaryBefore':b['summary'],'actualSummaryAfter':a['summary'],'rawIntroducedWarnings':introduced,'rawRemovedWarnings':removed,'retainedWarnings':len(bw.keys()&aw.keys()),'introducedCodes':dict(collections.Counter(f['code'] for f in introduced)),'actualAffectedWholeContexts':rows,'wholeRelevantMappingContexts':mapping_contexts,'newlyExcludedTargetPairsFromMeasuredFrontend':check['newlyExcludedTargetPairs'],'allReceiptOutputPinsVerified':True,'sourceCoverageOrScientificVoteMade':False}
(O/'EXTRACT.actual-stock-warning-delta-and-whole-mapping-contexts.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
summary=[{'goal':x['goalId'][:8],'title':x['title'],'newCodes':x['newWarningCodes'],'removedCodes':x['removedWarningCodes'],'raw':x['wholeAfterGoal'].get('applicability'),'compiledBefore':x['beforeReport']['compiledApplicability'],'compiledAfter':x['afterReport']['compiledApplicability'],'compiledAdded':x['actualAddedCompiledJurisdictions'],'compiledRemoved':x['actualRemovedCompiledJurisdictions'],'rawOnly':x['actualRawOnlyJurisdictions'],'compiledOnly':x['actualCompiledOnlyJurisdictions'],'evidenceKinds':sorted(set(e['kind'] for e in x['afterReport']['evidence'])),'directOverride':x['wholeAfterGoal'].get('extendedData',{}).get('applicabilityOverrides'),'annotations':[{'jurisdiction':e.get('jurisdiction'),'courseProfiles':e.get('courseProfiles'),'officialWholeSourceCredit':e.get('officialWholeSourceCredit')} for e in x['wholeAfterGoal'].get('extendedData',{}).get('skillPilotAcquisitionExtensions',[])]} for x in rows]
print(json.dumps({'beforeWarnings':len(bw),'afterWarnings':len(aw),'introduced':len(introduced),'removed':len(removed),'retained':len(bw.keys()&aw.keys()),'codes':result['introducedCodes'],'affectedGoals':len(rows),'mappingFiles':len(mapping_contexts),'rows':summary},ensure_ascii=False,indent=1))
