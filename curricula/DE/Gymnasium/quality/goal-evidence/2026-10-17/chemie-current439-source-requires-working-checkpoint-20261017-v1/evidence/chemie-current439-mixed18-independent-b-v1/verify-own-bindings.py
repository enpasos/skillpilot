import pathlib,json,hashlib,datetime
O=pathlib.Path('/mnt/e/skillpilot-chemie-L7-20261017/chemie-current439-mixed18-independent-b-v1')
I=pathlib.Path('/mnt/e/skillpilot-chemie-L7-20261017/current439-remaining-mixed18-preparation-technical-c-v1')
W=json.loads((I/'CLEAN.current18-whole-C-whole-P-and-teacher-source-context.json').read_text())
def sha(p):return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def subset(a,b):
 if isinstance(b,dict):return isinstance(a,dict) and all(k in a and subset(a[k],v) for k,v in b.items())
 if isinstance(b,list):return isinstance(a,list) and len(a)==len(b) and all(subset(x,y) for x,y in zip(a,b))
 return a==b
pins=[W['sourceCanonicalPin'],W['sourceP439Pin'],W['sourceRegistryPin'],*W['currentMappingFilePins'],*W['originalSourceReadOnlyPins']]
for p in pins:assert sha(p['path'])==p['sha256'].removeprefix('sha256:')
C={g['id']:g for g in json.loads(pathlib.Path(W['sourceCanonicalPin']['path']).read_text())['goals']}
P={g['goalId']:g for g in map(json.loads,pathlib.Path(W['sourceP439Pin']['path']).read_text().splitlines())}
own={g['goalId']:g for g in (json.loads(p.read_text()) for p in O.glob('read-goal-*.safe-science.json'))}
raw={g['goalId']:g for g in W['rows']};pr=[];pa=[];checks=[]
for gid,g in own.items():
 r=raw[gid];assert r['currentWholeCanonicalGoal']==C[gid];assert subset(C[gid],g['currentCanonicalScientificFields'])
 assert r['currentWholePositiveEvidenceRecord']==P[gid]
 assert g['reviewContext']['evidenceProfile']['profile']==P[gid]['profile']
 assert subset(r['teacherContext'],g['teacherContext'])
 for z in r['teacherContext']['currentDirectPrerequisiteWholeGoals']:assert z==C[z['id']];pr.append(z['id'])
 for z in r['teacherContext']['currentDirectParentWholeClusters']:assert z==C[z['id']];pa.append(z['id'])
 checks.append({'goalId':gid,'wholeCAndPExactTechnicalOnly':True,'safeScientificFieldsAndProfileExact':True,'wholeTeacherContextsExact':True})

material=[]
for name in ['MATERIAL.4a08-three-complete-calorimetry-materials-and-synthetic-logs.json','MATERIAL.a76-two-current-qualitative-whole-cases-and-cards.json']:
 x=json.loads((O/name).read_text())
 for z in x['materials']:
  source=z['sourceFile'];assert sha(source['path'])==source['sha256'];node=json.loads(pathlib.Path(source['path']).read_text())
  for bit in z['sourceJsonPointer'].strip('/').split('/'):node=node[int(bit)] if isinstance(node,list) else node[bit]
  assert subset(node,z['scientificMaterial'])
  material.append({'caseId':z['caseId'],'sourceFile':source,'sourceJsonPointer':z['sourceJsonPointer'],'scientificSubsetExact':True})

records=[json.loads(x) for x in (O/'description-records.jsonl').read_text().splitlines()]
first=json.loads((O/'FIRST.independent18.actual-decisions.sealed.json').read_text())
for r,f in zip(records,first['decisions']):
 for k in ['goalId','decision','rationale','evidenceProfileRecommendation','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']:assert r[k]==f[k]
 for k,v in r['understandingEvidence'].items():assert f[k]==v
 assert r['recordStatus']=='candidate' and r['reviewAuthority']=='ai_candidate'
assert len(records)==18
result={'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sourceCanonicalCount':len(C),'sourcePositiveEvidenceCount':len(P),'verifiedSourcePins':pins,'exactWholeScientificBindings':checks,'prerequisiteOccurrences':len(pr),'uniquePrerequisites':len(set(pr)),'parentOccurrences':len(pa),'uniqueParents':len(set(pa)),'wholeSupplementaryMaterialBindings':material,'firstSha256':sha(O/'FIRST.independent18.actual-decisions.sealed.json'),'recordsSha256':sha(O/'description-records.jsonl'),'ownFirstToStockSixEvidenceFieldsDecisionRationaleAndTextExact':True,'rawWrapperJudgmentsPrintedOrInterpreted':False,'scienceInferredFromHashIdentity':False,'humanApproval':False}
(O/'verification.actual-whole-inputs-materials-and-own-stock.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:result[k] for k in ['sourceCanonicalCount','sourcePositiveEvidenceCount','prerequisiteOccurrences','uniquePrerequisites','parentOccurrences','uniqueParents','ownFirstToStockSixEvidenceFieldsDecisionRationaleAndTextExact']}))
