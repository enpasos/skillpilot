from pathlib import Path
import json,hashlib,sys
R=Path('/home/enpasos/projects/skillpilot')
O=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-thirteen-targeted-requires-whole-science-independent-a-v1'
O.mkdir(exist_ok=False)
def sha(raw):return 'sha256:'+hashlib.sha256(raw).hexdigest()
def binding(p):return {'path':str(p.relative_to(R)),'sha256':sha(p.read_bytes()),'bytes':p.stat().st_size}
def read(p):return json.loads(p.read_text())
def save(n,j):p=O/n;assert not p.exists();p.write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n');return binding(p)
canon=R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
base=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-regular06-09-thirteen-observed-knowledge-gate-remedies-INERT-root-v21'
specp=base/'actual-thirteen-bounded-requires-remedies.author-spec.INERT.json';canp=base/'whole678-only-thirteen-observed-requires-remedies.INERT-candidate.json';spec=read(specp);current=read(canon);candidate=read(canp);before={g['id']:g for g in current['goals']};after={g['id']:g for g in candidate['goals']}
assert sha(canon.read_bytes())==spec['beforeCAN'];assert len(before)==len(after)==678
changes=[]
for g in spec['remedies']:
 a=before[g['goalId']];b=after[g['goalId']];assert a['requires']==g['beforeRequires'];assert b['requires']==g['candidateRequires'];assert {k:v for k,v in a.items() if k!='requires'}=={k:v for k,v in b.items() if k!='requires'}
 changes.append({'goalId':g['goalId'],'beforeRequires':a['requires'],'afterRequires':b['requires']})
assert set(g['id'] for g in current['goals'] if g!=after[g['id']])==set(spec['goalIds'])
ids=set(spec['goalIds']);ids.update(g['removedKnowledgePrerequisite'] for g in spec['remedies']);ids.update(r for g in spec['remedies'] for r in g['candidateRequires']);assert len(ids)==25
regp=R/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';reg=read(regp);subject=next(s for s in reg['subjects'] if s['subject']=='wirtschaftswissenschaften');profiles={};inputs=[binding(canon),binding(canp),binding(specp),binding(regp)]
for cp in subject['positiveEvidenceConfigPaths']:
 p=R/cp;c=read(p);rp=R/c['reviewPath'];inputs.extend([binding(p),binding(rp)])
 rows=[json.loads(x) for x in rp.read_text().splitlines()]
 for row in rows:
  if row['goalId'] in c['scope']['goalIds']:
   assert row['goalId'] not in profiles;profiles[row['goalId']]={'config':binding(p),'review':binding(rp),'wholeOriginalRecord':row}
assert len(profiles)==336
maps=[];sources=[]
for p in (R/'curricula/DE/Gymnasium/mapping').rglob('*.json'):
 j=read(p)
 if j.get('targetLandscapeId')!=current['landscapeId']:continue
 hits=[m for m in j.get('mappings',[]) if m.get('canonicalGoalId') in ids]
 if not hits:continue
 inputs.append(binding(p));sp=R/j['sourceExtractionPath'];s=read(sp);inputs.append(binding(sp));sg={g['id']:g for g in s['goals']};ds={d.get('sourceGoalId',d.get('legacyGoalId',d.get('id'))):d for d in j.get('decisions',[])}
 maps.append({'mapping':binding(p),'sourceExtraction':binding(sp),'mappingStatus':j.get('status'),'wholeSourceMetadata':{k:v for k,v in s.items() if k!='goals'},'individualCurrentBindings':[{'wholeMapping':m,'wholeSourceGoal':sg.get(m.get('legacyGoalId')),'wholeDecision':ds.get(m.get('reviewDecisionId'))} for m in hits]})
surp=R/'curricula/DE/Gymnasium/provenance/canonical-goal-surrogate-evidence-registry.json';sur=read(surp);inputs.append(binding(surp));entries=[e for e in sur.get('entries',[]) if e.get('landscapeId')==current['landscapeId'] and (e.get('goalId') in ids or e.get('requiredByGoalId') in ids)]
rows=[{'id':i,'wholeCurrentGoal':before[i],'wholeInertCandidateGoal':after[i],'wholeP':profiles.get(i),'mappingBindingCount':sum(sum(b['wholeMapping'].get('canonicalGoalId')==i for b in m['individualCurrentBindings']) for m in maps)} for i in sorted(ids)]
save('actual-whole25-current-goals-and-original-P-with-thirteen-only-requires-deltas.READONLY-intake.json',{'wholeInputBindings':inputs,'currentGoalCount':678,'wholeTargetAndFoundationGoalCount':len(rows),'wholeRows':rows,'actualOnlyThirteenRequiresChanges':changes,'665OtherGoalsWholeExact':True,'currentOriginalPGoalCount':len(profiles),'sourceMappingFiles':maps,'wholeRelevantHistoricalSourceSurrogates':entries,'noPreparedOrHistoricalDResultsUsedAsOwnScience':True,'noActiveWrite':True})
save('actual-before-and-inert-after-whole-CAN-bindings.json',{'before':binding(canon),'candidate':binding(canp),'spec':binding(specp),'currentRegistry':binding(regp),'descriptionPcaseCardsImagesChangedByCandidate':False,'scienceStatus':'pending own independent actual whole reading and individual decisions','nativeTechnicalSourceScopeVerdict':'not yet reviewed or approved'})
Path('/tmp/economics-thirteen-requires-independent-a-output-path.txt').write_text(str(O)+'\n')
print(json.dumps({'O':str(O),'wholeGoals':len(rows),'wholePcases':sum(len(r['wholeP']['wholeOriginalRecord']['profile']['applicationCaseBriefs']) for r in rows if r['wholeP']),'mappingFiles':len(maps),'surrogateEntries':len(entries)}))
