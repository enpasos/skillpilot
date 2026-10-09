import json,hashlib
from pathlib import Path
R=Path('/home/enpasos/projects/skillpilot')
B=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09'
A=B/'biologie-molecular-genetics-twenty-three-whole-author-v1'
V=A/'remediation-v2'
O=B/'biologie-molecular-genetics-twenty-three-whole-independent-a-v1/targeted-two-fidelity-remediation-v2'
def read(p):return json.loads(p.read_text())
def bind(p):
 b=p.read_bytes();return {'path':str(p.relative_to(R)),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
old=read(A/'twenty-three-whole46-bilingual-cases-and-P.author-candidate.json')
new=read(V/'twenty-three-whole46-bilingual-cases-and-P.v2.author-candidate.json')
oldcanon=read(A/'input/current-canonical479.original.snapshot.json')
newcanon=read(V/'candidate/current-canonical479-one-DEEN-splicing-fidelity.candidate.json')
oldkinds=read(A/'input/current-kinds394-landscape-path-only.candidate.json')
newkinds=read(V/'candidate/kinds394-source-path-only.candidate.json')
specs={g['goalId']:g['profile'] for g in read(V/'twenty-three-whole-positive-profile-candidate-set.v2.author.json')['goals']}
pairs=read(V/'whole21-pair-level-rubric-references.author-candidate.json')
checks=[];errors=[]
def check(name,value,detail=None):
 checks.append({'name':name,'pass':bool(value),'detail':detail})
 if not value:errors.append(name)
def delta(a,b,p=''):
 if a==b:return []
 if isinstance(a,dict) and isinstance(b,dict):
  out=[]
  for k in sorted(set(a)|set(b)):
   if k not in a or k not in b:out.append({'pointer':p+'/'+k,'before':a.get(k),'after':b.get(k)})
   else:out+=delta(a[k],b[k],p+'/'+k)
  return out
 if isinstance(a,list) and isinstance(b,list) and len(a)==len(b):
  return [d for i,(aa,bb) in enumerate(zip(a,b)) for d in delta(aa,bb,p+'/'+str(i))]
 return [{'pointer':p,'before':a,'after':b}]
canonical_deltas=delta(oldcanon,newcanon)
g6=new['entries'][5]['goalId'];g18=new['entries'][17]['goalId']
oldgoals={g['id']:g for g in oldcanon['goals']};newgoals={g['id']:g for g in newcanon['goals']}
check('actual canonical479 exact ID/order',list(oldgoals)==list(newgoals) and len(newgoals)==479)
check('other478 canonical objects actually equal',sum(oldgoals[g]==newgoals[g] for g in oldgoals)==478)
check('only goal6 DE/EN description values changed',len(canonical_deltas)==2 and {d['pointer'].split('/')[-1] for d in canonical_deltas}=={'description','descriptionEn'} and all(oldgoals[g]==newgoals[g] for g in oldgoals if g!=g6))
check('all479 exact semantic kind decisions unchanged, including394 curricularAtomic',oldkinds['decisions']==newkinds['decisions'] and len(newkinds['decisions'])==479 and sum(d['semanticKind']=='curricularAtomic' for d in newkinds['decisions'])==394)
pair_by_id={e['goalId']:e for e in pairs['entries']}
profile_deltas=[];narrative_deltas=[];pair_checks=[];historical=[]
for i,(oe,ne) in enumerate(zip(old['entries'],new['entries'])):
 gid=ne['goalId'];profile_deltas += [{'goalId':gid,**d} for d in delta(oe['wholeProfile'],ne['wholeProfile'])]
 check(f'{gid}: whole current goal equals actual candidate canonical body',ne['wholeCurrentGoal']==newgoals[gid])
 check(f'{gid}: ordinary candidate entire profile equals whole material',specs[gid]==ne['wholeProfile'])
 if 'exactHistoricalWholeCases' in ne:
  check(f'{gid}: whole historical2 cases and material unchanged',oe['exactHistoricalWholeCases']==ne['exactHistoricalWholeCases'] and oe['exactHistoricalWholeMaterial']==ne['exactHistoricalWholeMaterial'])
  historical.append(gid);continue
 pair=pair_by_id[gid];loc=f'/entries/{i}/newAuthoredWholeCases'
 check(f'{gid}: pair scope and actual source pointer',pair['wholePairPointer']==loc and pair['actualLearnerEvidence'] is False and 'not learner evidence' in pair['coverageScope'])
 check(f'{gid}: pair whole case identities',pair['caseIds']==[c['caseId'] for c in ne['newAuthoredWholeCases']])
 expected=[{'expectationId':e['id'],'criterionDe':e['observablePerformanceDe'],'criterionEn':e['observablePerformanceEn'],'evidenceLocations':[loc],'evidenceScope':'whole_evidence_pair_reference'} for e in ne['wholeProfile']['expectations']]
 check(f'{gid}: all actual pair criterion texts and location scopes',pair['criteria']==expected)
 for k,(oc,nc) in enumerate(zip(oe['newAuthoredWholeCases'],ne['newAuthoredWholeCases'])):
  strip=lambda c:{kk:vv for kk,vv in c.items() if kk not in ['rubric','rubricScope','rubricReference']}
  narrative_deltas += [{'goalId':gid,'caseId':nc['caseId'],**d} for d in delta(strip(oc),strip(nc))]
  ref=nc['rubricReference']
  check(f'{gid}/{nc["caseId"]}: actual pair-only reference and no per-case score claim',nc['rubric']==expected and nc['rubricScope']=='whole_evidence_pair_reference_not_individual_case_score' and ref['wholePairPointer']==loc and ref['goalId']==gid and ref['assessmentRuleDe']==pair['assessmentRuleDe'] and ref['assessmentRuleEn']==pair['assessmentRuleEn'])
  brief=ne['wholeProfile']['applicationCaseBriefs'][k]
  for lang,task,fresh in [('De','Auftrag: ','Frische Variation: '),('En','Task: ','Fresh variation: ')]:
   check(f'{gid}/{nc["caseId"]}: actual whole brief task/answer {lang}',brief['taskDemand'+lang]==nc['material'+lang]+'\n\n'+task+nc['task'+lang]+'\n\n'+fresh+nc['freshTransferTask'+lang] and brief['expectedPerformance'+lang]==nc['workedResponse'+lang]+'\n\nTransfer: '+nc['workedFreshTransfer'+lang])
  pair_checks.append({'goalId':gid,'caseId':nc['caseId'],'casePointer':loc+'/'+str(k),'rubricReferencePointer':loc+'/'+str(k)+'/rubricReference','pairPointer':loc,'ruleDe':pair['assessmentRuleDe'],'ruleEn':pair['assessmentRuleEn'],'newLearnerEvidence':False})
check('exactly one profile field changed:18 duplicate materialDe',len(profile_deltas)==1 and profile_deltas[0]['goalId']==g18 and profile_deltas[0]['pointer']=='/applicationCaseBriefs/0/taskDemandDe')
check('exactly one case narrative field changed:18 supplied materialDe',len(narrative_deltas)==1 and narrative_deltas[0]['goalId']==g18 and narrative_deltas[0]['pointer']=='/materialDe')
check('twenty-two complete profile bodies exactly reused',sum(oe['wholeProfile']==ne['wholeProfile'] for oe,ne in zip(old['entries'],new['entries']))==22)
check('forty-two explicit whole-pair rubric references',len(pair_checks)==42 and len(pair_by_id)==21)
check('same DE and EN assessment rule in all42 references',len({x['ruleDe'] for x in pair_checks})==1 and len({x['ruleEn'] for x in pair_checks})==1)
check('no added task quota and no learner-evidence claim',pairs['additionalTaskQuota'] is False and pairs['actualLearnerEvidence'] is False and pairs['humanApproval'] is False)
out={'schemaVersion':1,'role':'Own targeted actual-value and rubric-location verification; not author technical verdict or semantic substitute','checks':checks,'errors':errors,'canonicalDescriptionDeltas':canonical_deltas,'wholeProfileDeltas':profile_deltas,'wholeCaseNarrativeDeltas':narrative_deltas,'actual42PairReferences':pair_checks,'historicalWhole4CasesExactReuse':historical,'allOtherNarrativesWorkTransfersNumericsUnchanged':len(narrative_deltas)==1,'sourceAndPartnerFrameOriginal':bind(A/'input/whole-current23-source38-and-whole-partners44.exact-neutral-input.json'),'sourceDutiesAndPartnersStillOpenAsWholeGates':True,'humanApproval':False,'humanTrial':False,'nativeApproval':False,'strictGain':0}
q=O/'actual-targeted-two-deltas-and42-pair-references-countercheck.independent.json'
with q.open('x') as f:json.dump(out,f,ensure_ascii=False,indent=2);f.write('\n')
print(json.dumps({'checks':len(checks),'errors':errors,'profileDeltas':len(profile_deltas),'narrativeDeltas':len(narrative_deltas),'canonicalDeltas':len(canonical_deltas),'pairReferences':len(pair_checks)}))
