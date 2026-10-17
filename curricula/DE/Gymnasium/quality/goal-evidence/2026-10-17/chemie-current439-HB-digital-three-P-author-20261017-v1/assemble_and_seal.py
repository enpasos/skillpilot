import json,pathlib,copy,hashlib,datetime
ROOT=pathlib.Path('/home/enpasos/projects/skillpilot');OUT=pathlib.Path(__file__).resolve().parent;Q=OUT.parent
def read(p):return json.loads(p.read_text())
def dump(n,x):(OUT/n).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def pin(p):return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
inp=Q/'chemie-current439-HB-digital-four-clean-input-20261017-v1/INPUT.four-HB-digital-findings.whole-goals-P.json';data=read(inp)
old={r['goal']['id']:r for r in data['wholeSelectedGoalsAndProfiles']}
ids=['e81a4aed-9695-533e-8eb7-7a0c714346ea','31781d00-8f20-5041-bd7f-e261b27af162','38e30bb9-6145-5da0-80b8-36e3c45e15d0']
profilefiles=['AUTHOR.e81a.whole-profile.successor.json','AUTHOR.31781.whole-profile.successor.json','coauthor38.whole-profile.successor.json']
addfiles=['AUTHOR.e81a.complete-case-addition.DE-EN.json','AUTHOR.31781.complete-case-addition.DE-EN.json','coauthor38.complete-case-additions.DE-EN.json']
adds={ids[i]:read(OUT/addfiles[i]) for i in range(3)}
retained=read(OUT/'RETAINED.six-complete-operative-cases-and-worked-transfers.exact.json')
assembled=[]
for entry in retained['entries']:
    for wrapper in entry['wholeOperativeCases']:
        base=wrapper['wholeOperativeCase'];n=copy.deepcopy(base);gid=entry['goalId'];key=base['caseKey'];applies=False
        if gid==ids[2]:
            ch=next(x for x in adds[gid]['cases'] if x['caseKey']==key);n=ch['wholeCaseSuccessor'];applies=True
        elif gid==ids[0] or (gid==ids[1] and key.endswith('reaction-process-map')):
            ad=adds[gid];applies=True
            for lang in ['de','en']:
                n['suppliedMaterial'][lang]+='\n\n'+ad['scope'][lang]+'\n'+ad['material'][lang]
                n['learnerTask'][lang]+='\n\n'+ad['scope'][lang]+'\n'+ad['task'][lang]
                n['expectedAnswer'][lang]+='\n\n'+ad['expected'][lang]
                if 'freshTransfer' in ad:n['transfer'][lang]+='\n'+ad['freshTransfer'][lang]
            for i,criterion in enumerate(ad['rubric'],1):n['requiredAssessmentCriteria'].append({'criterionKey':key+'-HB-digital-'+str(i),'meaning':criterion})
            n['HBdigitalBlankLearnerTemplate']=ad['blankTemplate']
            if gid==ids[0]:
                for lang in ['de','en']:
                    n['moderatorProtocol']['observableLearnerActions'][lang]+='\n'+ad['scope'][lang]+'\n'+ad['task'][lang]
        assembled.append({'goalId':gid,'caseKey':key,'HBadditionApplied':applies,'originalWholeOperativeWrapper':wrapper,'wholeSuccessorCase':n})
assert len(assembled)==6
dump('CURRENT.six-full-case-successors.with-exact-originals.json',{'role':'Complete author case successors; original wrappers retained exactly; no actual learner execution certified','caseCount':6,'cases':assembled})

def diffs(a,b,path=''):
    if type(a)!=type(b):return [{'path':path,'before':a,'after':b}]
    if isinstance(a,dict):
        z=[]
        for k in sorted(set(a)|set(b)):
            if k not in a:z.append({'path':path+'/'+k,'beforeMissing':True,'after':b[k]})
            elif k not in b:z.append({'path':path+'/'+k,'before':a[k],'afterMissing':True})
            else:z+=diffs(a[k],b[k],path+'/'+k)
        return z
    if isinstance(a,list):
        z=[]
        for i in range(max(len(a),len(b))):
            if i>=len(a):z.append({'path':path+'/'+str(i),'beforeMissing':True,'after':b[i]})
            elif i>=len(b):z.append({'path':path+'/'+str(i),'before':a[i],'afterMissing':True})
            else:z+=diffs(a[i],b[i],path+'/'+str(i))
        return z
    return [] if a==b else [{'path':path,'before':a,'after':b}]

rows=[];deltas=[]
for gid,fn,af in zip(ids,profilefiles,addfiles):
    current=old[gid];before=current['wholeP']['profile'];after=read(OUT/fn)
    assert after['archetype']==before['archetype']
    assert after['expectations'][:len(before['expectations'])]==before['expectations']
    assert after['variationAxes'][:len(before['variationAxes'])]==before['variationAxes']
    assert after['coverageExpectations']['requiredExpectationIds'][:len(before['coverageExpectations']['requiredExpectationIds'])]==before['coverageExpectations']['requiredExpectationIds']
    for k,v in before['coverageExpectations'].items():
        if k!='requiredExpectationIds':assert after['coverageExpectations'][k]==v
    assert [x['id'] for x in after['applicationCaseBriefs']]==[x['id'] for x in before['applicationCaseBriefs']]
    for bc,ac in zip(before['applicationCaseBriefs'],after['applicationCaseBriefs']):
        for k,v in bc.items():assert ac[k]==v or (isinstance(v,str) and ac[k].startswith(v))
    delta=diffs(before,after);deltas.append({'goalId':gid,'profileDelta':delta,'oldExpectationValuesPreservedExact':True,'oldCaseFieldsUnchangedOrExactPrefixes':True,'oldCoverageAndTransferRulesPreserved':True})
    rows.append({'goalId':gid,'goalExact':current['goal'],'status':'needs_human_review','reviewAuthority':'ai_candidate','authorDecision':'pending_independent_review','evidenceLevel':'E1','maximumClaimScope':'G1','profile':after,'wholeCaseMaterialPath':str((OUT/'CURRENT.six-full-case-successors.with-exact-originals.json').relative_to(ROOT)),'additionalMaterialPath':str((OUT/af).relative_to(ROOT)),'nativeFingerprintBinding':'NOT_CREATED; old record hashes are historical input identity only','actualLearnerPerformanceCertified':False})
dump('AUTHOR.three-whole-P-successors.pending.json',{'role':'AUTHOR/coauthor science bodies only, pending independent review; not native fingerprint-bound P records','goalCount':3,'records':rows})
dump('DELTA.three-whole-profiles.exact.json',{'role':'Exact additive profile deltas, no goal/C/graph/image change','goalCount':3,'records':deltas})
source=read(ROOT/data['source']['sourcePin']['path']);indices=[23,65,67,70];src=[]
for n in indices:
    g=source['sourceGoals'][n-1];p=next(x for x in source['sourceGoalProvenance'] if x['sourceGoalId']==g['id']);src.append({'ordinal':n,'goal':g,'provenance':p})
passageids={x['goal']['passageId'] for x in src};passages=[x for x in source['passages'] if x.get('passageId',x.get('id')) in passageids]
clean={'role':'Clean finite scientific reviewer input for exactly three complete P successors; no independent acceptance asserted','source':{'officialURL':source['sourceDocument']['url'],'primaryPDF':pin(ROOT/'curricula/DE/Gymnasium/input/HB/GyO_Chemie_2022.pdf'),'physicalPrintedPages':[9,15],'clauses':src,'passages':passages,'scopeRules':source['scopeRules']},'unchangedSevenCurrentScientificInputs':[{'goal':r['goal'],'profile':r['wholeP']['profile']} for r in data['wholeSelectedGoalsAndProfiles']],'threeSuccessors':[{'goal':r['goalExact'],'profile':r['profile']} for r in rows],'completeSixCases':assembled,'additionalMaterials':[adds[i] for i in ids],'reviewQuestions':['Do the additions fit each complete unchanged goal description and the qualified HB source scope?','Does actual electronic recording of own experimental values suffice without an invented automation/time-synchronisation quota?','Are macro, genuinely microscopic and submicroscopic digital representations scientifically distinguished, with all supplied model dimensions honestly labelled?','Are digital documentation and presentation truly jointly developed with real identifiable contributions, without cloud/history/synchrony quotas?','Are all old practical, chemical, control, analogue/digital, audience, fresh-transfer and uncertainty duties preserved?'],'boundary':'No wholeHB232 remapping, canonical edit, source activation, nativeD/fingerprint rebinding, actual learner/human acceptance or M7 claim.'}
dump('INPUT.clean-three-whole-digital-P-successors.science.json',clean)
inputs=[inp,ROOT/data['source']['sourcePin']['path'],ROOT/data['canonicalPin']['path'],ROOT/data['P439Pin']['path'],ROOT/retained['sourcePath'],Q/'chemie-current439-HB-digital-four-findings-independent-a-20261017-v1/FINDINGS.independent-A.four-HB-digital.json',ROOT/'curricula/DE/Gymnasium/input/HB/GyO_Chemie_2022.pdf',Q/'chemie-current439-HB232-canonical-binding-author-20261017-v1/SELECTOR.HB232-canonical-binding-author.complete.pending.sealed.json']
inputpins=[pin(p) for p in inputs]
for expected in [data['source']['sourcePin'],data['canonicalPin'],data['P439Pin']]:
    actual=pin(ROOT/expected['path'])
    assert all(actual[k]==expected[k] for k in ['path','sha256','bytes'])
assert inputpins[-1]['sha256']=='6260d2ed427afaf90522c0fe518a9e7c53fdbee24353bfd798951ee04375cef1','FrozenHB232 changed'
hbseal=read(inputs[-1])
for frozen in hbseal['outputPins']:assert pin(ROOT/frozen['path'])==frozen,('FrozenHB232 output changed',frozen['path'])
assert adds[ids[0]]['blankTemplate']['rows']==[None,None,None]
assert adds[ids[1]]['blankTemplate']['learnerProduct'] is None
def blank(x):
    if isinstance(x,dict):return all(blank(v) for v in x.values())
    if isinstance(x,list):return all(blank(v) for v in x)
    return x=='' or x is None
for case in adds[ids[2]]['cases']:assert blank(case['blankLearnerRecord']) and case['assessmentResult'] is None
for r in data['wholeSelectedGoalsAndProfiles']:
    if r['goal']['id'] in ids:assert next(x['goalExact'] for x in rows if x['goalId']==r['goal']['id'])==r['goal']
sourceassembly=read(ROOT/retained['sourcePath'])
for r in retained['entries']:assert r['wholeOperativeCases']==next(x['wholeOperativeCases'] for x in sourceassembly['entries'] if x['goalId']==r['goalId'])
checks={'result':'PASS bounded author integrity/retention only','exactGoalCount':3,'wholeProfileBodies':3,'completeCaseCount':6,'oldWholeOperativeWrappersExact':True,'allOldProfileExpectationsExact':True,'oldCaseTextPreservedAsExactPrefixes':True,'oldCoverageMinimumFreshAndTransferFlagsUnchanged':True,'oldGoalBodiesExact':True,'frozenHB232SelectorUnchanged':True,'allAddedMeasurementAndCollaborationFieldsBlank':True,'sourceAutomationCloudOrTimeSyncRequirementAdded':False,'independentScienceAcceptance':False,'nativePBindingCreated':False,'activeWrites':False,'gitOperations':False,'humanApproval':False,'actualLearnerExecutionCertified':False}
dump('CHECKS.three-goals.exact-retention-and-inputs.json',{'checks':checks,'inputPins':inputpins})
files=[p for p in sorted(OUT.iterdir()) if p.is_file() and not p.name.startswith('SELECTOR.')]
selector={'role':'Sealed finite AUTHOR candidate for three HB digital P successors; scientific review pending','inputPins':inputpins,'outputPins':[pin(p) for p in files],'checks':checks,'authorExposure':'Informed by independent source-duty qualifications; author/coauthor output is not independently reviewed','noNewGoalDescriptionGraphImageOrRuntimeChange':True,'noNativeFingerprintRebinding':True}
dump('SELECTOR.HB-digital-three-P-author.pending.sealed.json',selector)
print(json.dumps({'goalCount':3,'wholeCaseCount':6,'checks':checks,'selector':pin(OUT/'SELECTOR.HB-digital-three-P-author.pending.sealed.json')}))
