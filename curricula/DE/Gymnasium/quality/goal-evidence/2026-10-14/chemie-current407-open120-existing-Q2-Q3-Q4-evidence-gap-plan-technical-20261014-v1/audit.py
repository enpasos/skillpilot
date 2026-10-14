import json, pathlib, hashlib, datetime, collections
R=pathlib.Path('/home/enpasos/projects/skillpilot'); O=pathlib.Path(__file__).parent
E=R/'curricula/DE/Gymnasium/quality/goal-evidence'; E12=E/'2026-10-12'; E14=E/'2026-10-14'
inputs={}
def read(p):
 p=pathlib.Path(p); p=p if p.is_absolute() else R/p
 data=p.read_bytes(); inputs[str(p.relative_to(R))]={'sha256':'sha256:'+hashlib.sha256(data).hexdigest(),'bytes':len(data)}
 return json.loads(data)
def rows(p):
 p=pathlib.Path(p);p=p if p.is_absolute() else R/p;data=p.read_bytes();inputs[str(p.relative_to(R))]={'sha256':'sha256:'+hashlib.sha256(data).hexdigest(),'bytes':len(data)}
 return [json.loads(x) for x in data.splitlines() if x.strip()]
def write(n,d): (O/n).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
I=E14/'chemie-current407-reviewed-P2-existing286-technical-integration-20261014-v1'
report=read(I/'receipts/ACTUAL.current407-reviewed-P2-existing286.central.stock-report.json')['subjects'][0]
config=read(I/'config/chemie-current407-reviewed-P2-existing286.inactive.config.json')['subjects'][0]
canonical=read(E14/'chemie-current407-naturstoffe-P9-remediation-current-seven-shared-technical-20261014-v2/candidate/canonical533.current407.P7-three-paired-V-PNG.inactive.json')
goals={g['id']:g for g in canonical['goals']};current=set(report['currentGoalIds']);closed=set(report['strictCompleteGoalIds']);openids=current-closed
A={};P={};D={}
for cp in config['semanticAtomicityConfigPaths']:
 c=read(cp)
 for x in rows(c['reviewPath']):
  if x['goalId'] in current:A[x['goalId']]={'config':cp,'record':x}
for cp in config['positiveEvidenceConfigPaths']:
 c=read(cp)
 for x in rows(c['reviewPath']):
  if x['goalId'] in c['scope']['goalIds'] and x['status'] in ['needs_human_review','approved']:P[x['goalId']]={'config':cp,'record':x}
terminal={x['goalId']:x.get('replacementIndexPath',x.get('toIndexPath')) for x in config.get('resolutionSupersessions',[])}
for cp in config['resolutionIndexPaths']:
 d=read(cp)
 for x in d['resolutions']:
  if x.get('strictDescriptionComplete') and x['goalId'] in current:D.setdefault(x['goalId'],[]).append({'index':cp,'entry':x})
qa=read(E14/'chemie-current407-joint-P5-native-D6-existing281-integration-technical-20261014-v1/candidate/QA.current407-three-genuine-PNG.normal-stock-419.inactive.json');V={}
for w in config.get('resolutionWithdrawals',[]):
 if w['goalId'] in D:D[w['goalId']]=[x for x in D[w['goalId']] if x['index']!=w['indexPath']]
 if not D.get(w['goalId']):D.pop(w['goalId'],None)
for x in qa['records']:
 if x['goalId'] in current and x['visualizationState']=='available' and x.get('aiApproved')=='yes' and x.get('aiApprovedAssetSha256')==x.get('assetSha256'):V[x['goalId']]=x
Mconfig=read(config['memoryReviewConfigPath']);M={x['goalId']:x for x in rows(Mconfig['reviewPath'])}
assert len(openids)==120 and len(current)==407 and len(closed)==287
counts={'A':len(A),'P':len(P),'D':len(D),'M':len(set(M)&current),'V':len(V)}
assert counts=={'A':306,'P':291,'D':288,'M':407,'V':396}
print('derived-selection-counts',counts,'measured',report['gates'])
write('BASELINE.exact-open120-and-selected-gate-records.actual.json',{'schemaVersion':1,'role':'read-only technical extraction from successful measured I287, not a rerun','denominator':407,'strictComplete':287,'remaining':120,'measuredGates':report['gates'],'derivedSelectedRecordCounts':counts,'openGoalIds':sorted(openids),'closedIdsPreservedAsPlanBaseline':sorted(closed),'rows':[{'goalId':gid,'title':goals[gid]['title'],'phase':goals[gid].get('dimensionTags',{}).get('phase'),'missingSelectedGates':[k for k,s in [('D',D),('P',P),('A',A),('M',M),('V',V)] if gid not in s],'selectedP':P.get(gid),'selectedA':A.get(gid),'selectedD':D.get(gid),'selectedV':V.get(gid)} for gid in sorted(openids)]})
q2v2=read(E12/'chemie-q2-naturstoffe-current402-author-20261012-v2/candidate/canonical532.complete-inactive.json');oldq2={g['id']:g for g in q2v2['goals']}
q2v3=read(E12/'chemie-q2-naturstoffe-current407-targeted-remediation-root-preparation-20261012-v3/later-stage-source6/neutral/targeted24.whole-canonical-P-and-current-context.extract.json');oldq2v3={x['goalId']:x for x in q2v3['goals']}
q3=read(E12/'chemie-q3-thirteen-current402-four-images-author-20261012-v3/inputs/FINAL.neutral-whole402-P13-whole28-source-bounded.join.json');oldq3={x['goalId']:x for x in q3['selected13WholeTuples']}
q4=read(E12/'chemie-q4-eleven-final-frozen-V-source-native-root-20261012-v10/candidate/canonical523.exact-final.inactive.json');oldq4={g['id']:g for g in q4['goals']}
q2a=read(E12/'chemie-q2-naturstoffe-current407-fresh-independent-a-20261012-v2/FINAL.targeted29.genuine-scientific-judgments.json');q2b=read(E12/'chemie-q2-naturstoffe-current407-independent-b-20261012-v2/ORIGINAL.per-goal-strict-ready-and-exact-holds.json')
q2v3a=read(E12/'chemie-q2-current407-remediation24-fresh-independent-a-20261012-v3/D23-P23-A23-M23-V23-source.per-goal-scientific-verdicts.json');q2v3b=read(E12/'chemie-q2-current407-remediation24-fresh-independent-b-20261012-v3/scientific-D-P-A-M-V.per-goal.json')
q3a=read(E12/'chemie-q3-thirteen-current402-targeted-independent-a-20261012-v3/review-a.scientific-votes.original.json');q3b=read(E12/'chemie-q3-thirteen-current402-targeted-independent-b-20261012-v3/FINAL.targeted-independent-b.manifest.json')
evidence=[]
for name,source,ar,br in [('Q2-v2',oldq2,q2a['judgments'],q2b['goals']),('Q2-v3',oldq2v3,q2v3a,q2v3b['records']),('Q3-v3',oldq3,[],[])]:
 aa={x['goalId']:x for x in ar};bb={x['goalId']:x for x in br}
 ids=(set(aa)|set(bb)) if name!='Q3-v3' else set(source)
 for gid in sorted(ids&openids):
  old=source.get(gid);old=old.get('wholeCanonicalGoal',old.get('wholeGoal',old)) if old else None
  changed=[k for k in set(old or {})|set(goals[gid]) if (old or {}).get(k)!=goals[gid].get(k)]
  evidence.append({'package':name,'goalId':gid,'title':goals[gid]['title'],'missingSelectedGates':[k for k,s in [('D',D),('P',P),('A',A),('M',M),('V',V)] if gid not in s],'wholeRawGoalEqual':old==goals[gid],'wholeGoalChangedKeys':changed,'wholeDescriptionsDEENExact':all((old or {}).get(k)==goals[gid].get(k) for k in ['title','titleEn','description','descriptionEn']),'requiresExact':(old or {}).get('requires')==goals[gid].get('requires'),'resourceLinksExact':(old or {}).get('resourceLinks')==goals[gid].get('resourceLinks'),'originalA':aa.get(gid),'originalB':bb.get(gid),'oldWholeGoal':old,'currentWholeGoal':goals[gid]})
write('COMPARE.existing-Q2-Q3-genuine-science-versus-current-open-whole-goals.actual.json',{'role':'technical comparison of existing independent science, no new verdict','rows':evidence,'Q3originalABScopeHolds':{'A':{k:q3a[k] for k in ['scopeSelectionHoldGoalIds','coupledFullSourceUnionHoldGoalIds']},'B':q3b['remainingGoalBoundSourceOrSelectionHolds']}})
write('REQUEST.selected-current-goals-for-stock-fingerprint-API.json',[goals[x] for x in sorted(openids) if goals[x].get('dimensionTags',{}).get('phase') in ['Q2','Q3','Q4']])
write('INPUTS.exact-bounded-read-bindings.actual.json',inputs)
for row in evidence:print(row['package'],row['goalId'][:8],row['title'],'missing',row['missingSelectedGates'],'whole',row['wholeRawGoalEqual'],'changed',row['wholeGoalChangedKeys'])
