from pathlib import Path
import collections,datetime,hashlib,json
K=Path('/mnt/e/skillpilot-chemie-L7-20261017/current439-remediation14-guarded-root-integration-technical-v1/capsule');M=Path('/home/enpasos/projects/skillpilot');O=Path(__file__).resolve().parent
CID='c436b994-8f44-5134-b9f8-0c9f5d6a5ba0'
def load(p):return json.loads(Path(p).read_text())
def pin(p):return {'path':str(p),'sha256':hashlib.sha256(Path(p).read_bytes()).hexdigest(),'bytes':Path(p).stat().st_size}
def eligible(g):
 t=g.get('tags',[])
 return g.get('nodeKind')!='memory' and 'memorization'not in t and not any(x.startswith('srs-deck:') for x in t) and not any(x in t for x in ['Practice','Assessment','Motivation','Orientation']) and not g.get('examData')
status=load(K/'docs/qa-ci/status/curriculum-quality-status.json');c=next(x for x in status['curricula'] if x['landscapeId']==CID)
raw=load(O/'RAW.actual-current-Chemistry-applicability-and-39-rendered-views.json');report=raw['report'];C=load(K/c['path']);Cby={g['id']:g for g in C['goals']}
mainC=load(M/c['path']);mainby={g['id']:g for g in mainC['goals']}
views=raw['perView'];national=set().union(*[set(v['goalIds'])for v in views if Path(v['path']).name.startswith('de-de')]);scope={gid for gid in national if eligible(Cby[gid])}
assert len(scope)==c['jurisdictionCoverage']['totalAtomicGoals']
viewby={j['jurisdiction']:set().union(*[set(v['goalIds'])for v in views if Path(v['path']).name.startswith(j['jurisdiction'].lower())])for j in c['jurisdictionCoverage']['jurisdictions']}
sur=load(K/'curricula/DE/Gymnasium/provenance/canonical-goal-surrogate-evidence-registry.json');surchem=[e for e in sur.get('entries',[])if e.get('landscapeId')==CID and e.get('status')=='accepted' and e.get('evidenceType')=='requires-closure'];assert not surchem,'Use exact stock recursive surrogate checker if any exist'
rby={g['goalId']:g for g in report['goals']};unsupported=[];totals={}
for j,ids in viewby.items():
 selected={gid for gid in ids&scope if rby[gid]['goalType']=='atomic'};bad=[]
 for gid in sorted(selected):
  g=rby[gid]
  if any(e.get('dimension')=='jurisdiction' and e.get('value')==j and e.get('kind')in['provenance','mapping']for e in g['evidence']):continue
  row={'jurisdiction':j,'goalId':gid,'title':Cby[gid]['title'],'wholeCurrentGoal':Cby[gid],'compiledEvidenceForJurisdiction':[e for e in g['evidence']if e.get('dimension')=='jurisdiction' and e.get('value')==j],'allCurrentCompiledEvidence':g['evidence'],'presentInMainCanonical':gid in mainby,'oldMainGoalWhole':mainby.get(gid),'currentVsMainFieldsChanged':[k for k in set(Cby[gid])|set(mainby.get(gid,{}))if Cby[gid].get(k)!=mainby.get(gid,{}).get(k)]}
  unsupported.append(row);bad.append(gid)
 totals[j]={'visible':len(selected),'unsupported':len(bad),'goalIds':bad}
 expected=next(e for e in c['jurisdictionCoverage']['jurisdictions']if e['jurisdiction']==j);assert len(bad)==expected['unsupportedAssignedAtomicGoals'],(j,len(bad),expected)
assert len(unsupported)==427
# Reverse source routing uses actual active mapping trees, excluding historical quality copies.
mappingfiles=[]
for p in (K/'curricula/DE/Gymnasium/mapping').rglob('*.json'):
 x=load(p)
 if x.get('targetLandscapeId')==CID:mappingfiles.append((str(p.relative_to(K)),x))
registry=load(K/'curricula/DE/Gymnasium/provenance/source-landscape-registry.json');jby={e['landscapeId']:e.get('jurisdiction')for e in registry.get('entries',[])}
source_by={}
for source in c['mappingPipeline']['sources']:
 if source.get('sourceKind')!='source-extraction':continue
 x=load(K/source['path']);source_by[x['sourceLandscapeId']]={'extraction':x,'path':source['path'],'status':source}
children={g['id']:g.get('contains',[])for g in C['goals']};memo={}
def descendants(gid,seen=None):
 if gid in memo:return memo[gid]
 seen=set()if seen is None else seen
 if gid in seen:return set()
 g=Cby.get(gid)
 if not g:return set()
 if not children[gid]:return {gid}
 result=set().union(*(descendants(x.split(':')[-1],seen|{gid})for x in children[gid]));memo[gid]=result;return result
missing=[];reverse_totals={};not_handled=[]
for sid,source in source_by.items():
 j=jby.get(sid)
 if not j:continue
 j=j if j.startswith('DE-')else'DE-'+j
 these=[(p,x)for p,x in mappingfiles if x.get('sourceLandscapeId')==sid and x.get('sourceExtractionPath')]
 records=[(p,x,m)for p,x in these for m in x.get('mappings',[])if any(d.get('sourceGoalId')==m.get('legacyGoalId')and d.get('decision')=='mapped'for d in x.get('decisions',[]))]
 goals=source['extraction'].get('sourceGoals',[])
 mapped={m['legacyGoalId']for _,_,m in records if descendants(m.get('canonicalGoalId',''))&viewby[j]}
 bad=[]
 for sg in goals:
  if sg['id']in mapped:continue
  allrows=[{'mappingPath':p,'mapping':m,'targetExists':m.get('canonicalGoalId')in Cby,'targetAtomicDescendants':sorted(descendants(m.get('canonicalGoalId',''))),'targetIntersectsCurrentView':bool(descendants(m.get('canonicalGoalId',''))&viewby[j])}for p,x in these for m in x.get('mappings',[])if m.get('legacyGoalId')==sg['id']]
  decisions=[{'mappingPath':p,'decision':d}for p,x in these for d in x.get('decisions',[])if d.get('sourceGoalId')==sg['id']]
  row={'jurisdiction':j,'sourceLandscapeId':sid,'sourceExtractionPath':source['path'],'sourceGoalId':sg['id'],'wholeSourceGoal':sg,'currentMappings':allrows,'currentDecisions':decisions,'mappingSourceExtractionPaths':sorted({x.get('sourceExtractionPath')for _,x in these})};missing.append(row);bad.append(sg['id'])
 reverse_totals.setdefault(j,{'sourceGoals':0,'unmapped':0});reverse_totals[j]['sourceGoals']+=len(goals);reverse_totals[j]['unmapped']+=len(bad)
expected={x['jurisdiction']:x['unmappedSourceAtomicGoals']for x in c['jurisdictionCoverage']['jurisdictions']};assert all(reverse_totals.get(j,{}).get('unmapped',0)==n for j,n in expected.items()),(reverse_totals,expected)
assert len(missing)==82
warnings=[f for f in report['findings']if f.get('severity')=='warning'];warning_rows=[]
for f in warnings:
 gid=f.get('goalId');goal=Cby.get(gid,{});old=mainby.get(gid,{})
 warning_rows.append({'finding':f,'currentRawApplicability':goal.get('applicability'),'currentCompiledApplicability':rby.get(gid,{}).get('compiledApplicability'),'currentGoalType':rby.get(gid,{}).get('goalType'),'presentInMainCanonical':gid in mainby,'wholeCurrentGoal':goal,'oldMainGoalWhole':old,'currentVsMainFieldsChanged':[k for k in set(goal)|set(old)if goal.get(k)!=old.get(k)]})
assert len(warning_rows)==148
out={'role':'Finite read-only diagnosis of actual current Chemistry lower-layer coverage/count/applicability; no approvals','atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'actualNormalStatusPin':pin(K/'docs/qa-ci/status/curriculum-quality-status.json'),'actualChemistryCompilerExtractionPin':pin(O/'RAW.actual-current-Chemistry-applicability-and-39-rendered-views.json'),'sourceCoverageScopeCount':len(scope),'unsupportedOccurrences':unsupported,'unsupportedUniqueGoalCount':len({r['goalId']for r in unsupported}),'unsupportedPerJurisdiction':totals,'reverseUnmappedSourceGoals':missing,'reverseCounts':reverse_totals,'warnings':warning_rows,'MainMutated':False,'KMutated':False,'normalGeneratorOrFullGatesRun':False,'newScienceOrApproval':False}
p=O/'DIAGNOSIS.actual-427-unsupported-82-source-gaps-148-warnings.exact-IDs.json';p.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'pin':pin(p),'unsupported':len(unsupported),'unique':out['unsupportedUniqueGoalCount'],'reverse':len(missing),'warnings':len(warnings)}))
