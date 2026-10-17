from pathlib import Path
import json,hashlib,datetime,collections
out=Path(__file__).parent
base=Path('/mnt/e/skillpilot-chemie-L7-20261017/current439-source9-HB97-whole-union-neutral-review-preparation-technical-v1')
sp=base/'SELECTOR.clean-current-Source9-HB97-with-whole-target-subtrees-real-assets-materials.sealed.json';s=json.loads(sp.read_text())
f=out/'FIRST.source9-HB97.scientific-findings.sealed.json';assert hashlib.sha256(f.read_bytes()).hexdigest()=='e9a377a1ca7de9b1055328278698ff44c89e4ada71c6e53ea72fdd200d4f7624';raw=json.loads(f.read_text())
pin=lambda p:{'path':str(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
records=[]
for n,x in enumerate(raw['source9Findings']):
 records.append({'recordId':'chemie-current439-source9-HB97-independent-a-20261017-v1.source.'+x['sourceKey'],'recordStatus':'candidate','reviewAuthority':'ai_candidate','evidenceLevel':'E1','maximumClaimScope':'G1','reviewMode':'fresh-independent-source-A','scientificFIRST':pin(f),'scientificFIRSTPointer':'/source9Findings/'+str(n),**x})
rp=out/'SOURCE9.independent-A.candidate-records.jsonl';rp.write_text(''.join(json.dumps(x,ensure_ascii=False,separators=(',',':'))+'\n' for x in records))
hp=out/'HB97.independent-A.count-and-granularity.candidate.json';hp.write_text(json.dumps({'recordId':'chemie-current439-source9-HB97-independent-a-20261017-v1.HB97','recordStatus':'candidate','reviewAuthority':'ai_candidate','evidenceLevel':'E1','maximumClaimScope':'G1','scientificFIRST':pin(f),'scientificFIRSTPointer':'/HB97CountAndGranularity',**raw['HB97CountAndGranularity']},ensure_ascii=False,indent=2)+'\n')
guards=[]
for p in [sp]+[Path(x['path']) for x in s['sourceGuards']]+[Path(s[k]['path']) for k in ['view','actualBoundTargetAssets','completeMappedTargetSubtreeContextsAndAssets','relevantWholeCurrentOperativeMaterials']]:
 actual=pin(p);expected=next((x for x in s['sourceGuards'] if x['path']==str(p)),None)
 if expected is None:
  expected=next((s[k] for k in ['view','actualBoundTargetAssets','completeMappedTargetSubtreeContextsAndAssets','relevantWholeCurrentOperativeMaterials'] if s[k]['path']==str(p)),None)
 if p==sp:expected={'sha256':'3e459d001f5f7b067b46f8c61908a798f33a5927b24243c994bc7a6a9270cd33','bytes':63121}
 guards.append({**actual,'unchanged':expected is not None and actual['sha256']==expected['sha256'] and actual['bytes']==expected['bytes']})
assert all(x['unchanged'] for x in guards)
assert [r['sourceKey'] for r in records]==s['sourceGoalIds']
assert len(set(r['sourceKey'] for r in records))==9
assert all(r['decision'] in ['accepted','revise','HOLD'] for r in records)
assert set().union(*(set(x['currentDirectTargetIds']) for x in records))==set(s['mappedTargetGoalIds'])
assert set().union(*(set(x['currentWholeUnionGoalIds']) for x in records))==set(s['completeMappedTargetClosureIds'])
assert raw['HB97CountAndGranularity']['decision']=='HOLD'
checks={'role':'Bounded output integrity and unchanged-input checks only; not scientific approval','atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'FIRSTDigestUnchanged':pin(f),'exactSourceKeySetAndOrder':True,'sourceRecords':9,'uniqueDirectTargets':24,'wholeMappedTargetClosure':41,'nativeDRecordsClaimedHere':False,'stockSourceSchemaInspection':{'path':'/home/enpasos/projects/skillpilot/contracts/curriculum-package/v1/source-verification-review.schema.json','use':'Inspected after FIRST. It is closed and hard-pinned to Mathematics plus human review ledger; therefore not misused to fabricate native Chemistry source approvals. Source9/HB97 output is a clearly labelled independent machine scientific candidate dossier.'},'wholeSourceApproval':False,'sourceInputGuards':guards,'allGuardsUnchanged':True,'MainKSourceOrGateWrites':False,'fullCentralBuildOrCheck':False,'scienceBeforeFormatting':True}
ch=out/'CHECK.bounded-output-and-unchanged-inputs.receipt.json';ch.write_text(json.dumps(checks,ensure_ascii=False,indent=2)+'\n')
counts=dict(collections.Counter(x['decision'] for x in records))
selector={'role':'Sealed finite independent SOURCE A scientific dossier, exact9 current source rows plus HB97 inventory; no gate integration','atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'inputSelector':pin(sp),'scientificFIRST':pin(f),'source9Records':pin(rp),'HB97CountAndGranularityRecord':pin(hp),'boundedIntegrityReceipt':pin(ch),'sourceDecisionCounts':counts,'sourceKeyDecisions':[{k:r[k] for k in ['caseId','sourceKey','recordId','decision','carrierDecision']} for r in records],'HB97Decision':'HOLD','blockingScientificDuties':['SN source09 mandatory experimental indicator investigation has no current mapped P route requiring actual learner investigation; teacher-provided data/image is insufficient.','HB97 inventory is not presently a faithful complete official-bullet matrix: original LK/optional/grouping/operator scope requires correction.'],'importantInterpretation':'Whole-union revise does not condemn a partial edge or demand deletion of useful broader SkillPilot targets. Precise faithful source-duty carriers are explicitly accepted separately. It prevents claiming all mapped whole-target content as an official obligation of a narrower row. Broad authored targets can remain under separate authority.','providerAndExposure':raw['reviewer'],'materialActuallyInspected':raw['inspectionReceipt'],'claims':raw['claimBoundary'],'otherSourceReviewerOrResolutionRead':False,'noPairedSynthesis':True,'noNewHumanOrPracticalAcceptance':True,'noSourceMutation':True}
sel=out/'SELECTOR.source9-HB97-independent-A.sealed.json';sel.write_text(json.dumps(selector,ensure_ascii=False,indent=2)+'\n')
for p in [rp,hp,ch,sel]:p.chmod(0o444)
(out/'SELECTOR.source9-HB97-independent-A.sealed.sha256').write_text(pin(sel)['sha256']+'  '+sel.name+'\n')
print(json.dumps({'selector':pin(sel),'FIRST':pin(f),'source9':pin(rp),'HB97':pin(hp),'checks':pin(ch),'counts':counts},ensure_ascii=False,indent=2))
