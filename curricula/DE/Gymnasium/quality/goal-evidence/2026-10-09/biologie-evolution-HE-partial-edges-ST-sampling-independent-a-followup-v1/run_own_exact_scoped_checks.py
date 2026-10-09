# SPDX-License-Identifier: Apache-2.0
import json,pathlib,hashlib,copy
OWN=pathlib.Path(__file__).resolve().parent; ROOT=OWN.parents[6]; B=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09'; A=B/'biologie-evolution-three-HE-partial-edge-scope-remediation-author-v1'; P=B/'biologie-evolution-eighteen-seven-source-course-remediation-author-v1'; N=B/'biologie-evolution-current17-and-protected-contexts-native-preparation-author-v1'
def read(p):return json.loads(p.read_text())
def ref(p):b=p.read_bytes();return {'path':p.relative_to(ROOT).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def delta(a,b,path=''):
 if type(a)!=type(b): return [{'path':path,'before':a,'after':b}]
 if isinstance(a,dict):
  out=[]
  for k in sorted(set(a)|set(b)):
   if k not in a or k not in b:out.append({'path':path+'/'+k,'before':a.get(k),'after':b.get(k)})
   else:out+=delta(a[k],b[k],path+'/'+k)
  return out
 if isinstance(a,list):
  if len(a)!=len(b):return [{'path':path,'before':a,'after':b}]
  return sum((delta(x,y,path+'/'+str(i)) for i,(x,y) in enumerate(zip(a,b))),[])
 return [] if a==b else [{'path':path,'before':a,'after':b}]
e=read(A/'neutral-three-HE-partial-edges-and-one-ST-sampling-unit-author-successor.independent-followup.entry.json'); prev=read(P/'neutral-whole35-partner30-seven-source-author-successor.independent-review.entry.json');nat=read(N/'neutral-current17-and-protected-contexts.native-independent-review.final.entry.json')
a=read(P/'candidate/mappings/HE144-four-source-and-course.whole-successor.review.json');b=read(ROOT/e['wholeCorrectedHEMapping']['path']);ds=delta(a,b);assert len(ds)==3 and all(q['path'].startswith('/mappings/') and q['path'].endswith('/matchType') and q['before']=='exact' and q['after']=='partial' for q in ds)
methodsOld=read(P/'material/five-source-faithful-executable-method-protocols.author-candidate.json');methodsNew=read(ROOT/e['wholeCorrectedFiveMethodProtocols']['path']);md=delta(methodsOld,methodsNew);oldBy={q['methodId']:q for q in methodsOld['methodProtocols']};newBy={q['methodId']:q for q in methodsNew['methodProtocols']};assert set(oldBy)==set(newBy) and sum(oldBy[k]!=newBy[k] for k in oldBy)==1 and oldBy['ST-natural-variation-observe']!=newBy['ST-natural-variation-observe']
maskOld=copy.deepcopy(methodsOld);maskNew=copy.deepcopy(methodsNew);i=next(i for i,q in enumerate(maskOld['methodProtocols']) if q['methodId']=='ST-natural-variation-observe');maskOld['methodProtocols'][i]=maskNew['methodProtocols'][i];assert maskOld==maskNew
frameOld=ROOT/prev['whole35Duty30PartnerOriginalFrame']['path'];frameNew=ROOT/e['whole35Duty30PartnerOriginalFrame']['path'];assert frameOld.read_bytes()==frameNew.read_bytes();frame=read(frameNew);assert frame['sourceDutyCount']==35 and frame['wholePartnerCount']==30
modelOld=ROOT/nat['actualFullCandidateModelPath'];modelNew=ROOT/e['wholeCandidateNormal394ModelExactlyExistingNative']['path'];assert modelOld.read_bytes()==modelNew.read_bytes()
rawpairs=[]
for q in b['mappings']:
 if q['canonicalGoalId'] in e['sourceReviewTargetGoalIds']:
  decs=[v for v in b['decisions'] if v.get('sourceGoalId')==q['legacyGoalId'] and q['canonicalGoalId'] in v.get('canonicalGoalIds',[])];assert len(decs)==1 and q['matchType']==decs[0]['matchType']=='partial';rawpairs.append({'rawMapping':q,'wholeSourceDecision':decs[0],'ordinaryConsumersBothPartial':True})
assert len(rawpairs)==3
blank=newBy['ST-natural-variation-observe']['blankPerformanceRecord'];assert not newBy['ST-natural-variation-observe']['actualLearnerPerformance'] and not newBy['ST-natural-variation-observe']['actualHumanExperimentPerformed'];assert all(v is None or v==[] for v in blank.values())
r={'schemaVersion':1,'role':'actual independent post-science-FIRST scoped full-value and preserved-binding checks','typedMappingDeltas':ds,'wholeMappingMaskedEqual':True,'wholeDecisionsExactlyUnchanged':a['decisions']==b['decisions'],'actualConsumersConsistentPairs':rawpairs,'methodDeltas':md,'methodDeltaCount':len(md),'otherFourWholeMethodsExactlyUnchanged':True,'wholeMethodEnvelopeMaskedEqual':True,'whole35Duty30PartnerFrameByteExact':True,'originalFrameBinding':ref(frameOld),'newFrameBinding':ref(frameNew),'full394NativeModelByteExact':True,'oldModel':ref(modelOld),'newModel':ref(modelNew),'all394PageBodiesAndFingerprintContextsUnchangedFromReviewedNative':True,'P17OwnCompletedScientificAndNormalCapsuleEvidenceRetained':ref(B/'biologie-evolution-current17-and-protected-contexts-native-independent-a-v1/native17-context15.independent-A.final.freeze.json'),'zeroNewHumanLearnerMeasurements':True,'actualBlankPerformanceRecord':blank,'remainingOpen':['EVO7S-A-COURSE-001','EVO17N-A-HOX-001','EVO7S-A-RP-002','430b-semantic-split-integration','method-owner-material-context-independent-approval'],'activeWrites':0,'strictGain':0}
(OWN/'exact-whole-successor-and-preserved-native-P17.actual.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'mappingDeltas':len(ds),'methodDeltas':len(md),'otherMethodsEqual':4,'wholeDuties':35,'wholePartners':30,'full394NativeExact':True,'rawAndDecisionPartialPairs':len(rawpairs),'strictGain':0}))
