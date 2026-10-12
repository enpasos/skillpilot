# SPDX-License-Identifier: Apache-2.0
import pathlib,json,hashlib,collections
R=pathlib.Path.cwd();B=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q2-naturstoffe-current402-author-20261012-v2'
def read(p):return json.loads(p.read_text())
def rel(p):return str(p.relative_to(R))
def ref(p):return {'path':rel(p),'bytes':p.stat().st_size,'sha256':'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()}
land=read(B/'candidate/canonical532.complete-inactive.json');g={x['id']:x for x in land['goals']};target=read(B/'neutral/targeted29.goal-ids.json');partners=read(B/'author/preserved-seven-science-bindings.json')['goalIds'];ids=target+partners
parents=collections.defaultdict(list)
for x in land['goals']:
 for c in x.get('contains',[]):parents[c].append(x['id'])
ancestors={}
for id in ids:
 d={id:0};queue=[id]
 for a in queue:
  if g[a].get('extendedData',{}).get('applicabilityMappingInheritance')=='boundary':continue
  for p in parents[a]:
   if p not in d:d[p]=d[a]+1;queue.append(p)
 ancestors[id]=d
inputs=read(B/'sources/current.raw-mapping-path-inputs.json')['mappingPaths'];mappingrows=[];literals={};contexts={};files={};bindings=collections.defaultdict(list)
for mp in inputs:
 p=R/mp;mapping=read(p);ep=R/mapping['sourceExtractionPath'];e=read(ep);sg={x['id']:x for x in e['sourceGoals']};passages={x['id']:x for x in e['passages']};files[mp]=ref(p);files[rel(ep)]=ref(ep)
 for ix,d in enumerate(mapping.get('decisions',[])):
  mts=d.get('canonicalGoalIds',[]);match=[(id,a,depth) for id,anc in ancestors.items() for a,depth in anc.items() if a in mts]
  if not match:continue
  source=d['sourceGoalId'];raw=sg.get(source)
  if raw is None:raise RuntimeError('Missing raw sourceGoal '+source)
  key=mp+'#decisions['+str(ix)+']';lk=rel(ep)+'#sourceGoals/'+source;literals[lk]={'key':lk,'sourceExtractionPath':rel(ep),'sourceGoalId':source,'wholeRawSourceGoal':raw,'rawOccurrenceSourceGoalIds':[o.get('sourceGoalId') for o in raw.get('sourceOccurrences',[]) if o.get('sourceGoalId')]}
  pid=raw.get('passageId');ctx=passages.get(pid);ck=rel(ep)+'#passages/'+str(pid)
  if ctx:contexts[ck]={'key':ck,'sourceExtractionPath':rel(ep),'passageId':pid,'wholeRawPassage':ctx}
  mappingrows.append({'key':key,'mappingPath':mp,'decisionIndex':ix,'wholeRawDecision':d,'sourceLiteralKey':lk,'passageContextKey':ck if ctx else None,'citationTuple':{'sourceGoalId':source,'sourceRef':raw.get('sourceRef'),'sourceSpan':raw.get('sourceSpan'),'sourceDocumentKey':raw.get('sourceDocumentKey'),'jurisdiction':e.get('jurisdiction'),'sourceDocuments':e.get('sourceDocuments',[e.get('sourceDocument')]),'courseLevel':raw.get('courseLevel'),'sourceOccurrences':raw.get('sourceOccurrences',[])}})
  for id,a,depth in match:bindings[id].append({'rawMappingRecordKey':key,'mappedCanonicalGoalId':a,'containsAncestorDepth':depth})
out={'schemaVersion':1,'inputGoalIds':ids,'mappingFileInputs':[files[p] for p in inputs],'extractionFileInputs':[v for k,v in files.items() if k not in inputs],'rawMappingDecisionRecords':mappingrows,'rawSourceGoalLiteralRecords':list(literals.values()),'wholePassageContextRecords':list(contexts.values()),'goalBindings':[{'goalId':id,'rawMappingBindings':bindings[id]} for id in ids]}
(B/'neutral/raw36.mapping-decisions-sourceGoalIDs-literals-citations.actual.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');summary={'inputGoals':len(ids),'actualMappingFiles':len(inputs),'matchingRawDecisionRows':len(mappingrows),'uniqueLiteralSourceGoals':len(literals),'wholePassageContexts':len(contexts),'boundGoalRows':len(bindings),'deduplicatedBySourceRefOrPage':False,'productionCodeChanged':False};(B/'checks/raw36-source-expansion.actual.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps(summary))
