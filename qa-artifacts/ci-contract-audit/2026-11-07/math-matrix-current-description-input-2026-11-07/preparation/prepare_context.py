import json,pathlib,hashlib,copy
R=pathlib.Path('/home/enpasos/projects/skillpilot'); W=pathlib.Path('/dev/shm/math-matrix-d-input-20261107'); O=W/'output/math-matrix-current-description-input-2026-11-07'; G='ce198bc9-b014-52ba-814f-25cc3e020668'; S='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'; sha=lambda p:hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
s=json.loads((W/'candidate.json').read_bytes()); goals={x['id']:x for x in s['goals']}; owner=s['landscapeId']; assert len(goals)==1252
parents={g:[] for g in goals}
for g in goals.values():
 for ref in g.get('contains',[]):
  target=ref.rsplit(':',1)[-1]
  if target in parents: parents[target].append(g['id'])
anc=set(); pending=[G]
while pending:
 for p in parents[pending.pop()]:
  if p not in anc:anc.add(p);pending.append(p)
# Full endpoint texts for direct prerequisite and reverse-prerequisite links; all contains ancestors supply authored topic/scope context.
prereqs=set(goals[G].get('requires',[])); successor={g['id'] for g in goals.values() if G in g.get('requires',[])}
# For each actual prerequisite, include its own recursively required endpoints and any cluster children needed to understand that prerequisite.
prep=set(); pending=list(prereqs)
while pending:
 g=pending.pop().rsplit(':',1)[-1]
 if g in prep:continue
 if g not in goals:raise ValueError('Unresolved foreign context '+g)
 prep.add(g);pending.extend(goals[g].get('requires',[]));pending.extend(goals[g].get('contains',[]))
ids={G}|anc|prep|successor
context={'schemaVersion':1,'candidateSourceSha256':sha(W/'candidate.json'),'landscapeId':owner,'sourcePath':S,'assignedGoalIds':[G],'selection':{'containsAncestors':sorted(anc),'directPrerequisites':sorted(prereqs),'prerequisiteContextClosure':sorted(prep),'directSuccessors':sorted(successor)},'goalContexts':[{'qualifiedKey':owner+':'+id,'landscapeId':owner,'sourcePath':S,'goal':goals[id],'directContainsParents':sorted(parents[id])} for id in sorted(ids)],'reviewResultsIncluded':False}
(O/'material-context').mkdir(exist_ok=True);(O/'material-context/current-goal-and-parent-context.json').write_text(json.dumps(context,ensure_ascii=False,indent=2)+'\n');(O/'material-context/whole-goal.json').write_text(json.dumps(goals[G],ensure_ascii=False,indent=2)+'\n')
previous=R/'qa-artifacts/ci-contract-audit/2026-11-06/math-three-description-input-2026-11-06/material-context/current-source-context.json';old=json.loads(previous.read_bytes());maps=[]; sourceids=set()
for m in old['directMappingBindings']:
 b=[x for x in m['bindings'] if x.get('canonicalGoalId')==G]
 if b:
  assert sha(R/m['path'])==m['sha256']; maps.append({**m,'bindings':b});sourceids.update(x['legacyGoalId'] for x in b)
extract=[]
for x in old['boundExtractedSourceContexts']:
 selected=[g for g in x['sourceGoals'] if g['id'] in sourceids]
 if selected:
  assert sha(R/x['path'])==x['sha256']; actual=json.loads((R/x['path']).read_bytes()); actualgoals=actual.get('goals',actual.get('sourceGoals',[])); by={g['id']:g for g in actualgoals};assert all(g==by[g['id']] for g in selected);extract.append({**x,'sourceGoals':selected})
retained=[]
for x in old['boundRetainedLandscapeContexts']:
 selected=[g for g in x['goals'] if g['id'] in sourceids]
 if selected:
  assert sha(R/x['path'])==x['sha256']; actual=json.loads((R/x['path']).read_bytes());by={g['id']:g for g in actual['goals']}; assert all(g==by[g['id']] for g in selected);retained.append({**x,'goals':selected})
originaldocs=[d for d in old['officialDocumentInputs'] if d['declaredDocument']['key']=='KC_GOS_2024'];assert len(originaldocs)==1
for d in originaldocs:assert sha(R/d['declaredDocument']['path'])==d['sha256']
sourcecontext={'schemaVersion':1,'candidateSourceSha256':sha(W/'candidate.json'),'assignedGoalIds':[G],'canonicalSourceRefs':[x for x in old['canonicalSourceRefs'] if x['goalId']==G],'directMappingBindings':maps,'boundExtractedSourceContexts':extract,'boundRetainedLandscapeContexts':retained,'officialDocumentInputs':originaldocs,'officialPassageLocator':'Kerncurriculum Mathematik gymnasiale Oberstufe 2024, printed pages 43–44, Q2.4 and Q2.5; inspect complete surrounding course conditions, not only extracted aspects.','scopeLimit':'The literal official extraction, reviewed mappings and retained authored predecessor are different input classes. No mapping matchType or retained goal is itself an independent description or image verdict. This packet supplies existing source evidence without a new source-coverage judgment.','descriptionOrPositiveReviewResultsIncluded':False}
(O/'material-context/current-source-context.json').write_text(json.dumps(sourcecontext,ensure_ascii=False,indent=2)+'\n'); print(json.dumps({'goalContexts':len(ids),'mappingFiles':len(maps),'mappingEdges':sum(len(x['bindings']) for x in maps),'officialDocuments':len(originaldocs)}))
