# Apache-2.0. Author-only exact successors; no live or historic writes.
import copy, hashlib, json, os, re
from pathlib import Path
R=Path('/home/enpasos/projects/skillpilot')
E='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/'
N='chemie-aromatics20-bounded-partner-source-field-and-Ar-remediation-author-20261013-v9'
O=E+N; C='tmp/'+N+'/private-parent'
V7=E+'chemie-aromatics20-all-source-alias-case-and-atomicity-remediation-author-20261013-v7'
V8=E+'chemie-aromatics20-targeted-source-and-case-fix-independent-a-20261013-v8'
def read(p): return json.loads((R/p).read_text())
def sha(p): return 'sha256:'+hashlib.sha256((R/p).read_bytes()).hexdigest()
def obj(x): return 'sha256:'+hashlib.sha256(json.dumps(x,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
def write(p,x):
    target=R/p; target.parent.mkdir(parents=True,exist_ok=True)
    for parent in [target.parent,*target.parents]:
        if parent==R.parent: break
        assert not parent.is_symlink(), str(parent)
    assert not target.exists(), 'Never replace existing candidate: '+p
    target.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
    assert target.stat().st_nlink==1
    return {'path':p,'sha256':sha(p)}
def ref(p): return {'path':p,'sha256':sha(p)}
partner=read(V8+'/SOURCE_PARTNER_COMPONENT_FINDINGS.actual.json')
field=read(V8+'/SOURCE_FIELD_FINDINGS.actual.json')
old=read(V7+'/NEUTRAL.targeted-fix-verification.input-selector.json')
matrix=read(V7+'/author/FINAL.actual-source-scope-and-input-matrix.json')
sourcepatch=read(V7+'/author/exact-consumed-sourceText-course-locator-components.author.json')
removals={(c['sourceGoalId'],c['targetGoalId']):c for c in partner['components'] if c['finding'].startswith('HOLD_REMOVE_')}
assert len(removals)==128
# Every audited row/decision is checked against the frozen exact object CAS.
for c in partner['components']:
    for route in c['routes']:
        mp=partner['mappingPaths'][route['mappingPathRef']]; d=read(mp['readPath'])
        assert sha(mp['readPath'])==mp['fileSha256']
        assert obj(d['mappings'][route['index']])==route['rowSha256']
        for dr in route['decisions']: assert obj(d['decisions'][dr['index']])==dr['sha256']
source_deltas=[]; source_selectors={x['logicalPath']: {'logicalPath':x['logicalPath'],'readPath':x['privateInputPath'],'sha256':x['sha256']} for x in matrix['changedExtractionInputSelector']}
source_docs={}; corrected_by_id={}
for finding in field['cells']:
    if finding['status']!='OPEN_BOUNDED_FIX': continue
    pi=int(finding['patchPointer'].split('/')[-1]); p=sourcepatch['patches'][pi]
    assert obj(p['after'])==finding['candidateObjectSha256']
    parent=source_selectors[p['parentPath']]; d=source_docs.setdefault(p['parentPath'],read(parent['readPath']))
    idx=next(i for i,g in enumerate(d['sourceGoals']) if g['id']==p['sourceGoalId']); before=copy.deepcopy(d['sourceGoals'][idx]); after=copy.deepcopy(before)
    fixes=finding['fixes']; f=fixes[0]
    if 'proposedNormalizedPrimaryClause' in f:
        after['sourceText']=f['proposedNormalizedPrimaryClause']; after['rawSourceText']=after['sourceText']
        if p['sourceGoalId'].startswith('he-'):
            after['rawSourceText']=before['parentBulletText']
        elif p['sourceGoalId'].startswith('mv-'):
            after['parentBulletText']=after['sourceText'];after['rawParentBulletText']=after['sourceText']
        after.setdefault('metadata',{})['aromaticsV9LiteralDerivation']={'sourceTextRole':'Normalized primary clause; coordinated phrase completed or authentic content list, not invented assessed operator','rawSourceTextRole':'Primary clause collection, with punctuation/line wrapping normalized','titleDescriptionRole':'Retained derived descriptor, not literal quotation','reason':f['reason'],'wholeSourceUnionApproved':False}
    if 'primaryOperator' in f:
        after['sourceText']=f['primaryOperator']+': '+f['subclause'];after['rawSourceText']=after['sourceText'];after['parentBulletText']=f['primaryOperator'];after['rawParentBulletText']=f['primaryOperator']
        after['sourcePage']=60;after['sourceRef']='Lehrplan Gymnasium Chemie Sachsen2025, Jahrgangsstufe12 LK Wahlbereich1 Farbstoffe, physical PDF60/printed48'
        after['sourceSpan']='physical PDF60/printed48; optional LK Wahlbereich1; left-column operator: '+f['primaryOperator']+'; right-column component: '+f['subclause']
        after['rawSourceSpan']='physical PDF60/printed48; primary left/right column separation'
        after.setdefault('metadata',{})['aromaticsV9LiteralDerivation']={'sourceTextRole':'Normalized primary left-column operator plus explicitly separated right-column content','rightColumnBasiskonzept':'Konzept der chemischen Reaktion','titleDescriptionRole':'Retained derived descriptor, not literal quotation','wholeSourceUnionApproved':False}
    if f['kind']=='course-and-scope':
        after['courseLevel']='LK';after['tags']=[re.sub(r'^(courseLevel|course):GK_LK$',r'\1:LK',t) for t in after.get('tags',[])];after['sourceScopeCondition']=f['sourceScopeCondition']
        after['sourceSpan']='physical PDF%d/printed%d; additional right-column eA; '%(f['physicalPage'],f['printedPage'])+f['sourceScopeCondition']
        after['sourcePage']=f['physicalPage'];after.setdefault('metadata',{})['aromaticsV9CourseScope']={'reason':f['reason'],'compulsoryCourse':'eA aromatic content' if f['physicalPage']==70 else None,'optionalTheme':'Chemie und Medikamente' if f['physicalPage']==71 else None,'wholeSourceUnionApproved':False}
    if f['kind']=='locator':
        after['sourcePage']=39;after['sourceRef']='BW BP2016 Chemie,3.4.5,physical PDF39/printed37'
        after['sourceSpan']='aromatic LF content; physical PDF39/printed37';after['rawSourceSpan']='3.4.5 (%s); physical PDF39/printed37'%after['bulletIndex']
        after.setdefault('metadata',{})['aromaticsV9LocatorCorrection']={'physicalPage':39,'printedPage':37,'reason':f['reason']}
    d['sourceGoals'][idx]=after; corrected_by_id[p['sourceGoalId']]=after
    source_deltas.append({'logicalPath':p['parentPath'],'parent':parent,'sourceGoalId':p['sourceGoalId'],'pointer':'/sourceGoals/'+str(idx),'beforeSha256':obj(before),'afterSha256':obj(after),'before':before,'after':after,'independentFinding':finding['patchPointer'],'changedFields':[k for k in sorted(set(before)|set(after)) if before.get(k)!=after.get(k)]})
# The current regular BW alias must bind the same physically correct two cells.
bw=field['currentRegularBWAliasReadLimit']; bp=bw['path']; bdoc=read(bp); assert sha(bp)==bw['sha256']
source_docs[bp]=bdoc; source_selectors[bp]={'logicalPath':bp,'readPath':bp,'sha256':sha(bp)}
for pointer in bw['sourceGoalPointers']:
    idx=int(pointer.split('/')[-1]); before=copy.deepcopy(bdoc['sourceGoals'][idx]); sid=before['id']; assert sid in corrected_by_id
    after=copy.deepcopy(before); fix=corrected_by_id[sid]
    for k in ['sourcePage','sourceRef','sourceSpan','rawSourceSpan']: after[k]=fix[k]
    after.setdefault('metadata',{})['aromaticsV9LocatorCorrection']=fix['metadata']['aromaticsV9LocatorCorrection']
    bdoc['sourceGoals'][idx]=after
    source_deltas.append({'logicalPath':bp,'parent':source_selectors[bp],'sourceGoalId':sid,'pointer':pointer,'beforeSha256':obj(before),'afterSha256':obj(after),'before':before,'after':after,'independentFinding':'currentRegularBWAliasReadLimit','changedFields':[k for k in sorted(set(before)|set(after)) if before.get(k)!=after.get(k)]})
for logical,d in source_docs.items():
    r=write(C+'/'+logical,d);source_selectors[logical]={'logicalPath':logical,'readPath':r['path'],'sha256':r['sha256'],'changedInV9':True}
mapping_deltas=[];mapping_selector=[];actual_removed=[];retained=[]
for parent in matrix['mappingInputSelector']:
    logical=parent['logicalPath']; before=read(parent['readPath']); assert sha(parent['readPath'])==parent['sha256'];d=copy.deepcopy(before); removed=[]; decisions=[]
    for idx,row in enumerate(before.get('mappings',[])):
        tid=row.get('canonicalGoalId','').split(':')[-1]; pair=(row.get('legacyGoalId'),tid)
        if pair in removals:
            removed.append({'pointer':'/mappings/'+str(idx),'beforeSha256':obj(row),'before':row,'reason':partner['reasons'][removals[pair]['scientificReasonRef']],'finding':removals[pair]['finding']}); actual_removed.append({'logicalPath':logical,'sourceGoalId':pair[0],'targetGoalId':tid})
    d['mappings']=[r for r in d.get('mappings',[]) if (r.get('legacyGoalId'),r.get('canonicalGoalId','').split(':')[-1]) not in removals]
    for idx,dec in enumerate(before.get('decisions',[])):
        after=copy.deepcopy(dec);sid=dec.get('sourceGoalId');targets=dec.get('canonicalGoalIds',[])
        after['canonicalGoalIds']=[t for t in targets if (sid,t.split(':')[-1]) not in removals]
        if after['canonicalGoalIds']!=targets:
            after['decision']='mapped' if after['canonicalGoalIds'] else 'unmapped'
            after['rationale']='Bounded v9 author removal of independently identified unsupported source/target components. Remaining components retain their exact bounded scientific interpretation; no whole-source union approval.'
        if sid in corrected_by_id:
            cell=corrected_by_id[sid]
            after['sourceSpan']=cell['sourceSpan']
            if sid.startswith('he-') or sid.startswith('mv-') or sid.startswith('sn-'): after['sourceSpan']+='; consumed normalized primary clause: '+cell['sourceText']
        if after!=dec:
            decisions.append({'pointer':'/decisions/'+str(idx),'beforeSha256':obj(dec),'afterSha256':obj(after),'before':dec,'after':after});d['decisions'][idx]=after
    bindings=[]
    extraction=d.get('sourceExtractionPath')
    # Reference an isolated successor only where exact consumed extraction changed.
    if extraction in source_docs:
        replacement=source_selectors[extraction]['readPath']; bindings.append({'pointer':'/sourceExtractionPath','before':extraction,'after':replacement});d['sourceExtractionPath']=replacement
    if d!=before:
        successor=write(C+'/'+logical,d);mapping_deltas.append({'logicalPath':logical,'parent':{'path':parent['readPath'],'sha256':parent['sha256']},'removedRows':removed,'decisionReplacements':decisions,'bindingReplacements':bindings,'privateSuccessor':successor})
        mapping_selector.append({'logicalPath':logical,'readPath':successor['path'],'sha256':successor['sha256'],'changedInV9':True})
    else: mapping_selector.append({**parent,'changedInV9':False})
assert set((x['sourceGoalId'],x['targetGoalId']) for x in actual_removed)==set(removals)
# Two whole bilingual cases only; preserve Ar in all coupling/triarylmethane sections.
whole=read(old['wholeCases']['path']);case_deltas=[]
for idx in [12,13]:
    before=whole['cases'][idx];after=copy.deepcopy(before)
    for lang,prefix in [('De','Vorgeschaltete Diazotierung'),('En','Preceding diazotization')]:
        first,second=after['data'+lang].split(prefix,1);after['data'+lang]=first+prefix+re.sub(r'\bAr\b','Ar_D',second)
        for key in ['task','modelAnswer']:
            first,second=after[key+lang].split('\n2.',1);after[key+lang]=re.sub(r'\bAr\b','Ar_D',first)+'\n2.'+second
        for rub in after['rubric']:
            if rub['criterionId'].endswith('-r3'):
                for key in ['taskClause','criterion']: rub[key+lang]=re.sub(r'\bAr\b','Ar_D',rub[key+lang])
            clause=rub['taskClause'+lang];start=after['task'+lang].index(clause);rub['taskSpan'+lang]={'start':start,'end':start+len(clause)}
    # ArNH2 and ArN2 are compact equations; replace only in first diazotization model/rubric.
    for lang in ['De','En']:
        first,second=after['modelAnswer'+lang].split('\n2.',1);first=first.replace('ArNH₂','Ar_DNH₂').replace('ArN₂','Ar_DN₂');after['modelAnswer'+lang]=first+'\n2.'+second
        for rub in after['rubric']:
            if rub['criterionId'].endswith('-r3'):rub['criterion'+lang]=rub['criterion'+lang].replace('ArNH₂','Ar_DNH₂').replace('ArN₂','Ar_DN₂')
    case_deltas.append({'caseId':before['caseId'],'parent':old['wholeCases'],'pointer':'/cases/'+str(idx),'beforeSha256':obj(before),'afterSha256':obj(after),'before':before,'after':after,'reason':'Separate diazotization aryl namespace Ar_D from unchanged dimethylaminophenyl Ar in coupling/triarylmethane content.'})
profiles=read(old['wholeProfiles']['path']);profile_deltas=[]
for i,entry in enumerate(profiles['profiles']):
    if not entry['goalId'].startswith('e594'): continue
    before=copy.deepcopy(entry);after=copy.deepcopy(before)
    for brief in after['profile']['applicationCaseBriefs']:
        case=next(x['after'] for x in case_deltas if x['caseId']==brief['id'])
        for lang in ['De','En']:brief['taskDemand'+lang]=case['data'+lang]+'\n'+case['task'+lang];brief['expectedPerformance'+lang]=case['modelAnswer'+lang]
    profile_deltas.append({'goalId':entry['goalId'],'parent':old['wholeProfiles'],'pointer':'/profiles/'+str(i),'beforeSha256':obj(before),'afterSha256':obj(after),'before':before,'after':after})
files={
'mappingComponentPatches':write(O+'/author/exact-all-alias-partner-and-decision-components.author.json',{'schemaVersion':1,'parentSelector':ref(V7+'/NEUTRAL.targeted-fix-verification.input-selector.json'),'frozenFindings':ref(V8+'/SOURCE_PARTNER_COMPONENT_FINDINGS.actual.json'),'strategy':'Remove all128 unsupported pairs across all60 aliases; retain179 bounded components. No invented narrower replacement needed for current20 direct retained rows.','counts':{'removedUniquePairs':128,'removedAliasRows':len(actual_removed),'changedMappingFiles':len(mapping_deltas)},'patches':mapping_deltas,'retainedBoundedFindings':[c for c in partner['components'] if not c['finding'].startswith('HOLD_REMOVE_')]}),
'sourceFieldPatches':write(O+'/author/exact-consumed-source-fields-and-BW-alias-components.author.json',{'schemaVersion':1,'frozenFindings':ref(V8+'/SOURCE_FIELD_FINDINGS.actual.json'),'counts':{'auditedCellsCorrected':10,'regularBWAliasCellsCorrected':2},'patches':source_deltas,'successorSelector':list(source_selectors.values()),'rawLiteralVersusDerived':'sourceText is actual consumed normalized primary content; retained title/description are derived descriptors. rawSourceText is not a compiler substitution.'}),
'caseCorrections':write(O+'/author/two-complete-bilingual-Ar-namespace-case-corrections.author.json',{'schemaVersion':1,'cases':case_deltas,'retained38Cases':{'parent':old['wholeCases'],'exceptCaseIds':[x['caseId'] for x in case_deltas],'exactWholeObjectsRetained':True}}),
'profileCorrection':write(O+'/author/one-complete-Ar-profile-correction.author.json',{'schemaVersion':1,'profiles':profile_deltas,'retained19Profiles':{'parent':old['wholeProfiles'],'exactWholeObjectsRetained':True}}),
}
selector={**old,'authorPackage':N,'kind':'neutral exact v7 plus v9 component overlay; candidate only','parentSelector':ref(V7+'/NEUTRAL.targeted-fix-verification.input-selector.json'),'frozenIndependentFixMatrix':ref(V8+'/SEAL.actual.json'),**files,'mappingInputSelector':mapping_selector,'sourceInputSelector':list(source_selectors.values()),'wholeCases':{'base':old['wholeCases'],'overlay':files['caseCorrections'],'replacementPointers':['/cases/12','/cases/13']},'wholeProfiles':{'base':old['wholeProfiles'],'overlay':files['profileCorrection'],'replacementGoalIds':[profile_deltas[0]['goalId']]},'P20AuthorCandidates':{'base':old['P20AuthorCandidates'],'exactOneProfileDelta':files['profileCorrection'],'affectedInputGoalIds':[profile_deltas[0]['goalId']]},'normalMaterializerInput':{'base':old['normalMaterializerInput'],'exactOneProfileDelta':files['profileCorrection']},'actualSourceScopeInputMatrix':{'base':old['actualSourceScopeInputMatrix'],'mappingInputSelector':'/mappingInputSelector','sourceInputSelector':'/sourceInputSelector'},'rootMergeInstruction':'Apply original v7 then exact v9 row/decision/source cell CAS deltas; compose disjoint Polymer components. Never overwrite shared carriers or historical hardlinks. Physical BW39/printed37 applies to both operative and regular aliases. countrymetadata deltas require later merged D context.','sourceUnionApproval':False,'newIndependentVotes':0,'strictGain':0}
write(O+'/NEUTRAL.targeted-v9-fix-verification.input-selector.json',selector)
print(json.dumps({'writtenRoot':O,'removedUniquePairs':128,'removedAliasRows':len(actual_removed),'mappingFiles':len(mapping_deltas),'sourceCells':len(source_deltas),'completeCases':2,'completeProfiles':1,'b7':'HOLD','strictGain':0}))
