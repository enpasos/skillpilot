"""Apache-2.0. Rebase only owned unsealed inactive preparation; no active/Git writes."""
from pathlib import Path
import json,copy,hashlib,datetime
R=Path.cwd();E=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12');O=E/'chemie-polymers18-current231-inactive-normal-preparation-technical-20261013-v1';V4=E/'chemie-polymers-3aef-no-melt-flow-author-successor-20261013-v4';VB=E/'chemie-polymers-six-corrected-assets-V-independent-b-20261013-v4';LIVE=Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json');SEM=Path('curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json');QA=Path('curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json');REG=Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json');h=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest();rd=lambda p:json.loads(p.read_text());wr=lambda p,x:p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
assert h(LIVE)=='sha256:9a68501347031f266572dea551e71c3507b66fb5ed94142a1a99f6a282708960'
assert h(VB/'FINAL.V6.independent-b.freeze.json')=='sha256:434cebeeb798ec0477bfc63dbbd8ddeec4f80bf99398016a988ac9d0177524bf'
assert h(V4/'FINAL.one-thermal-author-successor.freeze.json')=='sha256:0cbb9641eafa8da6765a2c0d31ec7c0be38f033bf4a09164d2f40e9e17f82a5f'
before={str(p):h(p)for p in [LIVE,SEM,QA,REG]};iso=rd(V4/'REVIEW_INPUTS.isolated18.one-thermal-successor.json');ids=iso['futureNativeReviewGoalIds'];held=iso['heldGoalIds'];bind=rd(V4/'six.resource-bindings.one-thermal-successor.json')['bindings'];bybind={b['goalId']:b for b in bind};live=rd(LIVE);byid={g['id']:g for g in live['goals']};assert len(live['goals'])==523;assert len(byid['dcbad4e4-e954-51d7-97ca-3bacb6f0d8d5']['applicability']['jurisdiction'])==16
selected={g['id']:g for g in rd(V4/'selected20.one-thermal-resource-successor.inactive.json')['goals']}
for id in ids:
 a=copy.deepcopy(byid[id]);b=copy.deepcopy(selected[id]);a.pop('resourceLinks',None);b.pop('resourceLinks',None);assert a==b,('scientific18 body drift',id)
candidate=copy.deepcopy(live)
for g in candidate['goals']:
 if g['id']in bybind:g['resourceLinks']=bybind[g['id']]['candidateResourceLinks']
assert all(g==byid[g['id']]for g in candidate['goals']if g['id']not in ids)
assert all(next(g for g in candidate['goals']if g['id']==id)==byid[id]for id in held)
wr(O/'baseline/canonical523.current402.actual-base.exact.json',live);wr(O/'candidate/canonical523.current402.six-resource-only.inactive.json',candidate)
for folder,path in [('baseline',O/'baseline/canonical523.current402.actual-base.exact.json'),('candidate',O/'candidate/canonical523.current402.six-resource-only.inactive.json')]:
 s=rd(SEM);s['sourceLandscapePath']=str(path);target=O/(folder+'/semantic523.current-decisions.'+('base-path.json'if folder=='baseline'else'inactive.json'));wr(target,s)
qa=rd(QA);old={q['goalId']:q for q in qa['records']};v6=rd(VB/'V6.six-assets.independent-b.json');votes={q['goalId']:q for q in v6['records']};voteBindings=[]
for q in qa['records']:
 if q['goalId']not in bybind:continue
 b=bybind[q['goalId']];l=b['candidateResourceLinks'][0];q.update(visualizationState='available',missingReason='',imageUrl=l['url'],publicAssetPath='app/public'+l['url'],canonicalAssetPath=b['generatorOriginalPath'],assetSha256=b['generatorOriginalSha256'])
 if q['goalId'].startswith('3aef'):
  q.update(aiApproved='no',aiApprovedAssetSha256='',aiReviewedAt=None,aiReviewer='',aiNotes='Minimal author no-melt-flow successor; actual independent V1 pending. Historical human/legacy fields retained without transferring approval.')
 else:
  v=votes[q['goalId']];assert v['aiApproved']=='yes';approved='sha256:'+v['assetSha256'].removeprefix('sha256:');assert approved==b['generatorOriginalSha256'];q.update(aiApproved='yes',aiApprovedAssetSha256=approved,aiReviewedAt=v['aiReviewedAt'],aiReviewer=v['aiReviewer'],aiNotes='Exact sealed independent asset-only decision retained technically. No native/P/human approval implied.');voteBindings.append(dict(goalId=q['goalId'],assetSha256=approved,aiReviewedAt=v['aiReviewedAt'],aiReviewer=v['aiReviewer']))
 for f in ['humanApproved','humanIssueIdentified','humanIssueDescription','humanReviewedAt','humanReviewer','umlautsCorrectChatGpt','contentApprovedChatGpt','chatGptReviewedAt','chatGptReviewer','chatGptNotes']:assert q.get(f)==old[q['goalId']].get(f)
assert len(voteBindings)==5;wr(O/'candidate/QA.current-plus-six-pending-actualV.inactive.json',qa)
newP=O/'positive/P18.author.one-thermal-v4.raw17-exact.jsonl';newP.write_bytes((V4/'P18.author.one-image-input-successor.raw17-exact.jsonl').read_bytes())
for cfgname in ['configs/P18.author.inactive.config.json','configs/whole402.inactive.config.json']:
 cfgpath=O/cfgname;c=rd(cfgpath)
 if 'reviewPath' in c:c['reviewPath']=str(newP);c['$schema']='https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json'
 if 'evidenceReviewPaths' in c:c['evidenceReviewPaths']=[str(O/'positive/current231.actual-active.raw-exact.jsonl'),str(newP)]
 wr(cfgpath,c)
first=rd(O/'checks/FIRST.current523-rowwise-six-merge-and-raw-retention.actual.json');first.update(currentCanonicalBefore=h(LIVE),currentCanonicalAfter=h(LIVE),sourceSemanticBinding=dict(path=str(SEM),sha256=h(SEM)),activeRegistryBinding=dict(path=str(REG),sha256=h(REG)),currentQaBinding=dict(path=str(QA),sha256=h(QA)),isolatedInputBinding=dict(path=str(V4/'REVIEW_INPUTS.isolated18.one-thermal-successor.json'),sha256=h(V4/'REVIEW_INPUTS.isolated18.one-thermal-successor.json')),candidateCanonicalBinding=dict(path=str(O/'candidate/canonical523.current402.six-resource-only.inactive.json'),sha256=h(O/'candidate/canonical523.current402.six-resource-only.inactive.json')),dcbad16MetadataAdoptionPendingCAS=False,currentBaseRebasedAtUTC=datetime.datetime.now(datetime.timezone.utc).isoformat(),QAChanges='Five exact sealed positive asset decisions retained, one new thermal replacement pendingV1; human/legacy fields unchanged; no votes invented',thermalAuthorSuccessorBinding=dict(path=str(V4/'FINAL.one-thermal-author-successor.freeze.json'),sha256=h(V4/'FINAL.one-thermal-author-successor.freeze.json')));wr(O/'checks/FIRST.current523-rowwise-six-merge-and-raw-retention.actual.json',first)
rootonly=O/'root-only';rootonly.mkdir(exist_ok=True);wr(rootonly/'five-existing-V-decisions.technical-retention.json',dict(schemaVersion=1,rootOnlyNotFreshPeerOpinionInput=True,sourceSeal=dict(path=str(VB/'FINAL.V6.independent-b.freeze.json'),sha256=h(VB/'FINAL.V6.independent-b.freeze.json')),positiveExactAssetBindings=voteBindings,thermalSuccessorPending=True,newScientificOrVVotes=0))
mc=rd(Path(next(s for s in rd(REG)['subjects']if s['subject']=='chemie')['memoryReviewConfigPath']));assert (O/'memory/M402.current-raw-exact.jsonl').read_bytes()==Path(mc['reviewPath']).read_bytes()
assert before=={str(p):h(p)for p in [LIVE,SEM,QA,REG]}
wr(O/'checks/SECOND.dcbad16-CAS-and-one-thermal-five-V-retention.actual.json',dict(schemaVersion=1,checkedAtUTC=datetime.datetime.now(datetime.timezone.utc).isoformat(),currentInputBindings=[dict(path=k,sha256=v)for k,v in before.items()],currentInputsUnchangedBeforeAfter=True,current16DeclaredStates=True,allOther505GoalsExact=True,held9d413WholeCurrentExact=True,sourceSemanticDecisionsExact=True,actualExistingAssetVotesRetained=5,newThermalPending=1,all40CasesAndProfilesUnchanged=True,other17RawPExact=True,M402CurrentRawExact=True,finalFreezeAllowed=False,remainingGate='Root genuine thermalV1 and final native/PDF/campaign authorization'))
print(json.dumps(dict(rebasedCurrentSHA=h(LIVE),fiveActualExistingVRetained=5,newThermalPending=1,allOther505Exact=True,held2Exact=True,activeWrites=False,finalFreeze=False)))
