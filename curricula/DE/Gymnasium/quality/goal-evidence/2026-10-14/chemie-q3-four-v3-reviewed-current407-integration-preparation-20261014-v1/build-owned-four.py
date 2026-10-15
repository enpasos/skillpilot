from pathlib import Path
import json, hashlib, copy, shutil
ROOT=Path('/home/enpasos/projects/skillpilot')
OWN=Path(__file__).resolve().parent
REL=OWN.relative_to(ROOT).as_posix()
E12=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12'
AR=E12/'chemie-q3-thirteen-current402-four-images-author-20261012-v3'
AA=E12/'chemie-q3-thirteen-current402-targeted-independent-a-20261012-v3'
BB=E12/'chemie-q3-thirteen-current402-targeted-independent-b-20261012-v3'
T=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-current407-corrected-P8-targeted-native4-technical-20261014-v1'
IDS=['c0463225-cba1-5e62-a1fb-e9046d7034b5','96fd8608-8d98-53f0-9b86-1311c3220fd3','0908b3a2-9937-57de-8bfb-35a6de54aa1f','94a62b39-d4a2-5882-99d1-6886ead07726']
LID='c436b994-8f44-5134-b9f8-0c9f5d6a5ba0'
def read(p):return json.loads(p.read_text())
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def payloadsha(d):return 'sha256:'+hashlib.sha256(json.dumps(d,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def write(name,d):
 p=OWN/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def copyfile(p,name):
 q=OWN/name;q.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,q);assert sha(p)==sha(q);return q
inputs=[]
def bind(p):
 d={'path':p.relative_to(ROOT).as_posix(),'bytes':p.stat().st_size,'sha256':sha(p)}
 if d not in inputs:inputs.append(d)
 return d
basep=T/'candidate/canonical533.current407.corrected-P8-resources.inactive.json'
semp=T/'candidate/semantic533.current407.corrected-P8.inactive.json'
qap=T/'candidate/QA.current407.exact-reviewed-child-images.inactive.json'
assert sha(basep)=='sha256:9889c5a7a24eea3663f02666c1863b50c80424260be6eb69c959bf882c80826b'
assert sha(semp)=='sha256:a75b1f31adbd738d794d87565ec8f2b69d559620ce4d4b66c6306943dce888a2'
assert sha(qap)=='sha256:e1318a7ca99cfb2aaf5de7baec8607b9a4b23062266f0693d69e27039e9d83ae'
for p in [basep,semp,qap,AR/'FINAL.neutral-input-manifest.json',AR/'author-package.freeze.json',AR/'committable-package.freeze.json',AA/'FINAL.targeted-independent-a.manifest.json',AA/'independent-a.successor-original.freeze.json',BB/'FINAL.targeted-independent-b.manifest.json',BB/'ORIGINAL.successor-judgment-seal.json']:bind(p)
base=read(basep);future=copy.deepcopy(base);reviewed=read(AR/'inputs/current523.author-successor.de.json');bind(AR/'inputs/current523.author-successor.de.json')
by={g['id']:g for g in base['goals']};rv={g['id']:g for g in reviewed['goals']};fu={g['id']:g for g in future['goals']}
cas=[]
for i in IDS:
 changed=[k for k in set(by[i])|set(rv[i]) if by[i].get(k)!=rv[i].get(k)]
 assert set(changed)<= {'description','descriptionEn','resourceLinks'}
 if i in IDS[:2]:assert set(changed)=={'description','descriptionEn','resourceLinks'};fu[i].update(copy.deepcopy(rv[i]))
 else:assert not changed
 assert fu[i]==rv[i]
 cas.append({'goalId':i,'operation':'exact_reviewed_whole_goal_successor' if changed else 'exact_noop_retention','changedFields':sorted(changed),'before':by[i],'after':fu[i],'beforePayloadSha256':payloadsha(by[i]),'afterPayloadSha256':payloadsha(fu[i]),'reviewedV3WholeObjectExact':True})
assert len(base['goals'])==len(future['goals'])==533
assert [g['id'] for g in base['goals']]==[g['id'] for g in future['goals']]
assert [g['id'] for g in base['goals'] if g!=fu[g['id']]]==[g['id'] for g in base['goals'] if g['id'] in IDS[:2]]
assert {k:v for k,v in base.items() if k!='goals'}=={k:v for k,v in future.items() if k!='goals'}
write('candidate/canonical533.current407.q3-four-reviewed-v3.inactive.json',future)
copyfile(semp,'candidate/semantic533.current407.q3-four-reviewed-v3.inactive.json')
write('CAS.exact-four-whole-goals.before-after.actual.json',{'schemaVersion':1,'role':'technical_projection_of_existing_independently_reviewed_v3_successors','base':bind(basep),'reviewedV3':bind(AR/'inputs/current523.author-successor.de.json'),'rows':cas,'other531WholeGoalsExact':True,'allGlobalRequiresContainsApplicabilityExamplesExact':True,'otherLandscapeFieldsExact':True,'newScientificDecisions':0,'activeWrites':False})
vpaths=[AA/'visualization/thirteen.independent-a.current.pixel-review.json',BB/'visualization/V13.targeted-actual-pixels.original-b.json']
vrows=[]
for p in vpaths:
 bind(p);rows=[x for x in read(p)['rows'] if x['goalId'] in IDS];assert len(rows)==4;vrows.append(rows)
qa=read(qap); assets=[]
for i in IDS:
 a=next(x for x in vrows[0] if x['goalId']==i);b=next(x for x in vrows[1] if x['goalId']==i)
 assert a['assetSha256']==b['assetSha256']
 p=ROOT/a['actualAssetPath'];assert sha(p)==a['assetSha256'];bind(p)
 url=fu[i]['resourceLinks'][0]['url'];dest='resources/public-root'+url;copyfile(p,dest)
 assets.append({'goalId':i,'url':url,'sha256':sha(p),'source':bind(p),'ownedPublicAssetPath':REL+'/'+dest,'canonicalInstallationPath':'curricula/DE/Gymnasium/visualizations/chemie/'+i+'/'+p.name,'frontendInstallationPath':'app/public'+url,'backendInstallationPath':'backend/src/main/resources/static'+url,'operation':'replace_old_jpeg_with_exact_reviewed_png' if i in IDS[:2] else 'retain_exact_good_jpeg','independentA':a,'independentB':b})
 if i in IDS[:2]:
  q=next(x for x in qa['records'] if x['goalId']==i);q.update({'description':fu[i]['description'],'imageUrl':url,'publicAssetPath':'app/public'+url,'canonicalAssetPath':assets[-1]['canonicalInstallationPath'],'assetSha256':sha(p),'aiApproved':'yes','aiApprovedAssetSha256':sha(p),'aiReviewedAt':read(AA/'independent-a.successor-original.freeze.json')['sealedAtUTC'],'aiReviewer':'Codex independent A and B; existing sealed v3 pixel decisions, technically materialized 2026-10-14','aiNotes':'Exact existing independent v3 V decisions materialized; no new pixel review. '+a['rationale']+' B: '+b['finding'],'contentApprovedChatGpt':'yes','umlautsCorrectChatGpt':'yes','chatGptReviewedAt':read(AA/'independent-a.successor-original.freeze.json')['sealedAtUTC'],'chatGptReviewer':'Existing sealed independent v3 A/B pixel decisions','chatGptNotes':'Technical projection of existing v3 approvals; prior JPEG approval not transferred. '+a['rationale']})
  assert q['humanApproved']=='no'
oldqa=read(qap);assert len(qa['records'])==len(oldqa['records']);assert all(x==y for x,y in zip(qa['records'],oldqa['records']) if x['goalId'] not in IDS[:2])
write('candidate/QA.current407.q3-four-reviewed-v3.inactive.json',qa)
write('V4.exact-existing-independent-pixel-decisions-and-installation-bindings.actual.json',{'schemaVersion':1,'role':'technical_materialization_of_existing_sealed_A_B_V_not_new_pixel_review','rows':assets,'goodCorrosionJpegsRetainedExact':True,'otherQARecordsExact':True,'humanApproval':False})
joinp=AR/'inputs/FINAL.neutral-whole402-P13-whole28-source-bounded.join.json';bind(joinp);join=read(joinp)
rows=[x for x in join['selected13WholeTuples'] if x['goalId'] in IDS];assert len(rows)==4
for x in rows:assert x['wholeGoal']==fu[x['goalId']]
write('inputs/exact-four-original-whole-v3-goal-page-source-profile-case-context-tuples.json',{'schemaVersion':1,'originalFullJoin':bind(joinp),'rows':rows,'historicalCurrentDenominator':402,'futureCandidateDenominator':407,'notNewScience':True})
sources=read(AA/'sources/thirteen.component-ownership.independent-a.original.json');bind(AA/'sources/thirteen.component-ownership.independent-a.original.json')
write('sources/exact-four-existing-A-source-component-decisions.actual.json',{'schemaVersion':1,'rows':[x for x in sources['rows'] if x['goalId'] in IDS],'noNewSourceDecision':True,'fullSourceUnionApproved':False})
ppaths=[AA/'positive/P13.independent-a.current.review.jsonl',BB/'positive/P13.independent-b.review.jsonl'];pr=[]
for s,p in zip('ab',ppaths):
 bind(p); lines=[l for l in p.read_text().splitlines() if json.loads(l)['goalId'] in IDS]; assert len(lines)==4
 out=OWN/f'positive/P4.original-independent-{s}.review.jsonl';out.parent.mkdir(parents=True,exist_ok=True);out.write_text('\n'.join(lines)+'\n');pr.append({json.loads(l)['goalId']:json.loads(l) for l in lines})
 oldc=read(p.parent/('P13.independent-a.current.config.json' if s=='a' else 'P13.independent-b.inactive.config.json'))
 oldc.update({'landscapePath':REL+'/candidate/canonical533.current407.q3-four-reviewed-v3.inactive.json','semanticKindLedgerPath':REL+'/candidate/semantic533.current407.q3-four-reviewed-v3.inactive.json','reviewPath':REL+f'/positive/P4.original-independent-{s}.review.jsonl','scope':{'label':'Only four existing independently reviewed Q3 goals; exact v3 P scientific records retained','goalIds':IDS}})
 write(f'positive/P4.original-independent-{s}.config.json',oldc)
for i in IDS:
 assert pr[0][i]['profile']==pr[1][i]['profile']
 for k in ['goalFingerprint','reviewInputFingerprint','profileFingerprint']:assert pr[0][i][k]==pr[1][i][k]
for s,p,sub in [('a',AA,'round-a'),('b',BB,'description')]:
 dp=p/sub
 for fn in ['review-bundle-manifest.json','description-review-input.json','description-review-campaign.json']:
  bind(dp/fn);copyfile(dp/fn,f'description/original-{s}/{fn}')
 for folder in ['batches','results']:
  for fn in (dp/folder).iterdir():
   if fn.is_file() and fn.suffix in ['.json','.jsonl']:bind(fn);copyfile(fn,f'description/original-{s}/{folder}/{fn.name}')
 rf=next(x for x in (dp/'results').iterdir() if x.name.endswith('.records.jsonl'))
 lines=[l for l in rf.read_text().splitlines() if json.loads(l)['goalId'] in IDS]
 (OWN/f'description/D4.original-independent-{s}.records.jsonl').write_text('\n'.join(lines)+'\n')
 for l in lines:
  x=json.loads(l);assert x['decision']=='keep';assert x['currentDescriptionDe']==fu[x['goalId']]['description'];assert x['currentDescriptionEn']==fu[x['goalId']]['descriptionEn']
 for kind,src in [('atomicity','three.independent-a.retained.review.jsonl' if s=='a' else 'three.independent-b.review.jsonl'),('memory','three.independent-a.retained.review.jsonl' if s=='a' else 'three.independent-b.review.jsonl')]:
  pth=p/kind/src;bind(pth);lines=[l for l in pth.read_text().splitlines() if json.loads(l)['goalId'] in IDS[:2]];assert len(lines)==2
  out=OWN/kind/f'two-v3.original-independent-{s}.review.jsonl';out.parent.mkdir(parents=True,exist_ok=True);out.write_text('\n'.join(lines)+'\n')
  x=json.loads(lines[0]);cfg={'schemaVersion':1,'reviewId':x['reviewId'],'ruleVersion':x['ruleVersion'],'landscapeId':LID,'landscapePath':REL+'/candidate/canonical533.current407.q3-four-reviewed-v3.inactive.json','reviewPath':out.relative_to(ROOT).as_posix(),'scope':{'label':'Two exact existing independent v3 scientific judgments','leafGoalIds':IDS[:2]}}
  if kind=='memory':cfg['cardReviewPath']=REL+'/memory/empty.cards.review.jsonl'
  write(f'{kind}/two-v3.original-independent-{s}.config.json',cfg)
pair=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/chemie-q3-four-bounded-source-current-author-20261008-v1/genuine-original-pair'
for s,fn,key,whole,rationale in [('a','a.whole20-science-source-A-P.independent-a.first.verdicts.json','rows','wholeGoal','ownScientificReasonDe'),('b','b.whole20-whole40-science-source-atomicity.independent-b.first.verdict.json','verdicts','wholeGoalSnapshot','reasonDe')]:
 d=read(pair/fn);bind(pair/fn);rs=[x for x in d[key] if x['goalId'] in IDS[2:]];assert len(rs)==2
 for x in rs:assert x[whole]==fu[x['goalId']];assert x['semanticAtomicity'] in ['atomic','PASS']
 write(f'atomicity/two-corrosion.original-whole-science-independent-{s}.json',{'originalScientificInput':bind(pair/fn),'reviewer':d['reviewer'],'reviewedAt':d['reviewedAt'],'rows':rs,'noNewScientificDecision':True})
 # The stock CLI will derive fingerprints only after exact whole-body and existing whole atomicity proof above.
 rev='existing-corrosion-original-whole-'+s+'-technical-record-materialization'
 lines=[{'schemaVersion':1,'reviewId':rev,'ruleVersion':'semantic-atomicity-v1','landscapeId':LID,'goalId':x['goalId'],'fingerprint':'sha256:'+'0'*64,'status':'atomic','semanticAtomic':True,'reviewer':d['reviewer'],'reviewedAt':d['reviewedAt'],'reason':x[rationale]} for x in rs]
 out=OWN/f'atomicity/two-corrosion.original-independent-{s}.review.jsonl';out.write_text(''.join(json.dumps(x,ensure_ascii=False)+'\n' for x in lines))
 write(f'atomicity/two-corrosion.original-independent-{s}.config.json',{'schemaVersion':1,'reviewId':rev,'ruleVersion':'semantic-atomicity-v1','landscapeId':LID,'landscapePath':REL+'/candidate/canonical533.current407.q3-four-reviewed-v3.inactive.json','reviewPath':out.relative_to(ROOT).as_posix(),'scope':{'label':'Technical stock-format materialization of exact existing two whole corrosion atomicity judgments; no new science','leafGoalIds':IDS[2:]}})
mp=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-fifteen-reviewed-integration-candidate-v5/m-current-full.review.jsonl';bind(mp)
ml=[l for l in mp.read_text().splitlines() if json.loads(l)['goalId'] in IDS[2:]];assert len(ml)==2
out=OWN/'memory/two-corrosion.existing-unchanged.review.jsonl';out.write_text('\n'.join(ml)+'\n');(OWN/'memory/empty.cards.review.jsonl').write_text('')
x=json.loads(ml[0]);write('memory/two-corrosion.existing-unchanged.config.json',{'schemaVersion':1,'reviewId':x['reviewId'],'ruleVersion':x['ruleVersion'],'landscapeId':LID,'landscapePath':REL+'/candidate/canonical533.current407.q3-four-reviewed-v3.inactive.json','reviewPath':out.relative_to(ROOT).as_posix(),'cardReviewPath':REL+'/memory/empty.cards.review.jsonl','scope':{'label':'Exact existing conservative no-memory records for unchanged two corrosion bodies','leafGoalIds':IDS[2:]}})
holds=read(BB/'FINAL.targeted-independent-b.manifest.json')['remainingGoalBoundSourceOrSelectionHolds'];assert len(holds)==9 and not(set(holds)&set(IDS))
write('HOLDS.excluded-nine-and-broader-experiment-source-unions.actual.json',{'schemaVersion':1,'excludedGoalIds':holds,'excludedCount':9,'excludedCanonicalBodiesUnchanged':all(by[i]==fu[i] for i in holds),'broaderSourceOperatorHolds':read(BB/'FINAL.targeted-independent-b.manifest.json')['broaderSourceOperatorHolds'],'fullSourceUnionApproved':False,'actualExperimentPerformance':False,'newScientificVotes':False,'strictGainClaim':0,'humanApproval':False,'humanTrial':False})
write('INPUTS.exact-original-and-current407-bindings.actual.json',{'schemaVersion':1,'startedAtUTC':'2026-10-13T23:52:36Z','role':'authorized_technical_existing_review_integration_preparation','provider':'OpenAI Codex','model':'GPT-6 session identity; exact serving revision and sampling unknown','blindRun':False,'existingPeerVotesReadForTechnicalIntegration':True,'newScientificVoteCount':0,'bindings':inputs})
print(json.dumps({'ownRoot':REL,'goalCount':len(future['goals']),'wholeChangedGoals':IDS[:2],'retainedGoodGoals':IDS[2:],'boundInputs':len(inputs),'noActiveWrites':True}))
