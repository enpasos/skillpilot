#!/usr/bin/env python3
"""Prepare inert text/locator/source routing candidates from sealed inputs."""
from pathlib import Path
from datetime import datetime, timezone
import json, hashlib, copy, uuid, re
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[7]
OWN = Path(__file__).resolve().parent
BASE = OWN.parent
V1 = BASE/'biologie-neuro-eight-missing-primary-scope-remediation-author-v1'
A = BASE/'biologie-neuro-eight-primary-scope-independent-a-v1'
B = BASE/'biologie-neuro-eight-primary-scope-independent-b-v1'
OLD = BASE/'biologie-neuro-th-hh-forty-reviewed-components-native-overlay-preparation-v1'
NOW = datetime.now(timezone.utc).isoformat()
tracked = {}
def bind(p):
    p=Path(p); d=p.read_bytes(); r={'path':str(p.relative_to(ROOT)), 'sha256':'sha256:'+hashlib.sha256(d).hexdigest(),'bytes':len(d)};tracked[r['path']]=r;return r
def read(p):
    bind(p);return json.loads(Path(p).read_text())
def write(name,d):
    p=OWN/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');return str(p.relative_to(ROOT))
seals=[]
for folder,fn,sha in [(V1,'eight-missing-primary-scope-remediation-author-v1.final.freeze.json','cf1dfb10cb94e25620c501713f0de6b285e4c80a390bc8c3a94685a1262938e2'),(A,'eight-primary-scope-independent-a-v1.final.freeze.json','8ede70411f88dbd1a47f8c5963d7ff22b20839b960bcbbd2a6060accaf7fd313'),(B,'independent-b-neuro-eight-primary-scope.final.freeze.json','24eca976049e2a3d449b86090e2961552aa43cd2c62b38f7abf5b712f44e781f'),(OLD,'native-overlay-preparation-v1.final.freeze.json','0a24a5163730045de1669e101e58976d674210b7cd05c801cf8e9393584a03e7')]:
    p=folder/fn;d=read(p);assert bind(p)['sha256'].removeprefix('sha256:')==sha
    for r in d['files']:
        q=ROOT/r['path'] if r['path'].startswith('curricula/') else folder/r['path'];actual=bind(q)
        assert actual['sha256'].removeprefix('sha256:')==r['sha256'].removeprefix('sha256:'),q
        assert actual['bytes']==r['bytes'],q
    seals.append({'freeze':bind(p),'payloadCount':len(d['files']),'payloadExact':True,'historicalExternalBindingsNotRelabeledAsCurrent':True})
ar=read(A/'eight-primary-scope-and-two-NW-partial-decisions.independent-a.json')
br=read(B/'eight-primary-components-and-minimal-proposals.independent-b.verdict.json')
config=read(ROOT/'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json')
current=read(ROOT/config['landscapePath']);assert len(current['goals'])==472
kinds=read(ROOT/config['semanticKindLedgerPath']);assert sum(r['semanticKind']=='curricularAtomic' for r in kinds['decisions'])==390
write('current472-whole-canonical.actual.snapshot.json',current)
records=read(V1/'eight-current-goals.actual-primary-scope-and-DEEN-candidates.author-v1.json')
byid={g['id']:g for g in current['goals']};ids={r['goalId'] for r in records['records']};assert len(ids)==8
assert all(byid[r['goalId']]==r['wholeCurrentGoalDEEN'] for r in records['records'])
new_de='Die lernende Person kann an einem gegebenen Sinneszellmodell die Reizantwort von den Vorgängen auf Teilchenebene über das Rezeptorpotenzial zum nachgeschalteten Aktionspotenzialmuster erklären und diesen Zusammenhang auf einen gegebenen sinnesphysiologischen Fall zur Deutung von Reizstärke und Reizdauer anwenden.'
new_en='The learner can use a supplied sensory-cell model to explain the stimulus response from particle-level processes through the receptor potential to the downstream action-potential pattern and apply this relationship to a supplied sensory-physiology case to interpret stimulus intensity and duration.'
ph_de='Die lernende Person kann aus den Vorgängen an einer erregenden Acetylcholin-führenden chemischen Synapse am Beispiel eines gegebenen Stoffes ableiten, wie die Informationsübertragung beeinflusst wird, und das Prinzip an einer neuromuskulären Synapse erläutern.'
ph_en='The learner can use a supplied substance example to infer how information transfer at an excitatory acetylcholine-carrying chemical synapse is affected and explain the principle at a neuromuscular synapse.'
corrections={'8b23f8fb-555d-5720-b5f2-dd6f28a0e786':(new_de,new_en),'f6280154-d57c-599c-94bf-73313005a6df':(ph_de,ph_en)}
selector_changes=[]
def fix(obj,path=''):
    if isinstance(obj,list):return [fix(x,f'{path}[{i}]') for i,x in enumerate(obj)]
    if isinstance(obj,dict):return {k:fix(v,f'{path}.{k}') for k,v in obj.items()}
    if isinstance(obj,str) and re.match(r'^#(313324|314384)\s',obj):
        new=re.sub(r'^#(313324|314384)',lambda m:'[id="'+m[1]+'"]',obj)
        selector_changes.append({'objectPath':path,'before':obj,'after':new});return new
    return obj
records=fix(records,'records')
for r in records['records']:
    g=r['wholeCanonicalCandidateDEEN'];gid=r['goalId']
    if gid in corrections:g['description'],g['descriptionEn']=corrections[gid];r['boundedComponentDE'],r['boundedComponentEN']=corrections[gid]
    g['extendedData']['authorPrimaryScopeRemediation'].update({'package':OWN.name,'status':'new_author_v2_candidate_pending_targeted_independent_text_and_native_DP_review','active':False})
    r['independentReviewStatus']='bounded_primary_components_previously_A_B_KEEP; corrected_whole_candidate_pending_D_P_and_semantic_review'
    r['priorIndependentDecisions']={'A':next(x for x in ar['records'] if x['goalId']==gid),'B':next(x for x in br['records'] if x['goalId']==gid)}
    r['wholeCurrentGoalSourceSupported']=False;r['wholeOriginalSourceSupported']=False;r['wholeCandidateGoalApproved']=False;r['nativeVisibilityRestored']=False
    if gid.startswith('8b23'):
        r['explicitCoupledRoutineBoundary']={'routine':'supplied sensory input/output model, particle-level receptor generation and resulting action-potential pattern, applied to one sensory case','current78748ef2':'describes receptor potentials and primary/secondary sensory cells; preserved whole goal and prerequisite','current04d770b3':'explains particle-level axonal action potentials and general coding; preserved whole goal, declared input model, no covert re-assessment or added edge','givenModelSupplies':'particle process and downstream spike-pattern information needed for the one interpretation case','notClaimed':'complete eye/rhodopsin/retinal/optical-phenomena coverage or universal population/location coding','semanticAtomicityAndDidacticDependencyDecision':'pending; no hidden approval','unchangedCurrentRequires':byid[gid]['requires']}
    if r['wholeCanonicalCandidateDEEN']['extendedData']['authorPrimaryScopeRemediation']['authoredSpecialisation']:
        r['officialIndividualDuty']=False;r['semanticAtomicityApproval']=False;r['curricularRoleDecision']='declared authored model specialisation; conditional native reachability only; roles and distinct performance versus 347110a1 remain pending'
records['role']='new inert author-v2 text/locator correction and technical-routing proposal'
records['createdAtUTC']=NOW;records['activeWrites']=False
write('eight-current-goals.actual-primary-scope-and-DEEN-candidates.author-v2.json',records)
candidate=copy.deepcopy(current)
proposed={r['goalId']:r['wholeCanonicalCandidateDEEN'] for r in records['records']}
candidate['goals']=[proposed.get(g['id'],g) for g in candidate['goals']]
assert all(g==byid[g['id']] for g in candidate['goals'] if g['id'] not in ids)
assert all(g['requires']==byid[g['id']]['requires'] and g['contains']==byid[g['id']]['contains'] for g in candidate['goals'])
write('current472-eight-only.author-v2.canonical.candidate.json',candidate)
delta=[]
for r in records['records']:
    before=byid[r['goalId']];after=r['wholeCanonicalCandidateDEEN'];delta.append({'goalId':r['goalId'],'changedFields':[k for k in sorted(set(before)|set(after)) if before.get(k)!=after.get(k)],'wholeBefore':before,'wholeAfter':after,'wholeCurrentAndOriginalHOLD':True,'nativeD_PReview':'candidate pending'})
write('eight-only.current472-whole-goal-deltas.author-v2.json',{'records':delta,'all464OutsideEightExact':True,'all472IdsAndEdgesExact':True,'newStrictClosures':0})

selector_sets=[]
for filename,newname in [('BY13-EA-GA.actual-original-neural-section.records.json','BY13-EA-GA.all45.valid-selector.records.author-v2.json'),('BY13-EA-GA.exact-current-merged-source-IDs-and-original-occurrences.addendum.json','BY13-EA-GA.all21.valid-selector-identity-addendum.author-v2.json')]:
    d=fix(read(V1/filename),filename);checks=[]
    for r in d['records']:
        html=ROOT/r['sourceHtmlPath'];bind(html);soup=BeautifulSoup(html.read_text(),'html.parser');found=soup.select(r['selector']);assert len(found)==1,r['recordId']
        elt=copy.copy(found[0]);[x.decompose() for x in elt.select('dialog')];actual=' '.join(elt.get_text(' ',strip=True).split());assert actual==' '.join(r['originalText'].split()),(r['recordId'],actual)
        assert r['primaryUrl'].endswith('#'+r['originalHtmlAnchor'])
        r['independentReviewStatus']='prior bounded original content A_B_KEEP; corrected selector actually re-resolved'
        checks.append({'recordId':r['recordId'],'selector':r['selector'],'matchCount':len(found),'originalTextExactlyResolved':True,'originalUrlFragmentUnchanged':True})
    d['newWholeSourceApproval']=False;write(newname,d);selector_sets.append({'file':newname,'count':len(checks),'actualChecks':checks})
assert [x['count'] for x in selector_sets]==[45,21]
write('numeric-CSS-selector-correction.actual-resolution.receipt.json',{'createdAtUTC':NOW,'sets':selector_sets,'embeddedSelectorChanges':selector_changes,'urlFragmentsModified':False,'noNewSourceApproval':True})

# Five original competency components and three declared model specialisations
# are kept distinct even though the production routing compiler does not inspect sourceKind.
oldsource=fix(read(V1/'eight-bounded-components-and-declared-specialisations.source-candidates.author-v1.json'))
source_by={s['canonicalGoalId']:s for s in oldsource['sourceGoals']}
routes=[]
for r in records['records']:
    for scope in r['candidateSourceStageCourseScopes']:
        jur,stage,profile=scope.split('/');native='GK_LK' if profile=='GA' else 'LK' if profile=='EA' else profile
        # HE GK and LK belong to the same actual common-level source component.
        he_common='DE-HE/SekII/GK' in r['candidateSourceStageCourseScopes']
        label='HE-GK-LK' if jur=='DE-HE' and he_common else 'HE-LK' if jur=='DE-HE' else 'BY-'+profile
        if any(x['goalId']==r['goalId'] and x['routeLabel']==label for x in routes):continue
        routes.append({'goalId':r['goalId'],'routeLabel':label,'jurisdiction':jur,'stage':stage,'courseLevel':'GK_LK' if label=='HE-GK-LK' else native,'declaredOriginalProfile':profile,'sourceKind':'authoredModelSpecialisation' if source_by[r['goalId']]['authorSpecialisation'] else 'boundedPrimaryCompetencyComponent','actualOriginalRecordIds':[x['recordId'] for x in r['actualPrimaryComponents'] if x['jurisdiction']==jur and (jur=='DE-HE' or ('BY13-'+profile) in x['recordId'])]})
sourcefiles=[];mappingfiles=[];manifest=[]
for label in sorted({r['routeLabel'] for r in routes}):
    selected=[r for r in routes if r['routeLabel']==label];jur=selected[0]['jurisdiction'];j=jur[-2:]
    source_landscape=str(uuid.uuid5(uuid.NAMESPACE_URL,'skillpilot:neuro8-author-v2:'+label))
    extraction_path=f'curricula/DE/Gymnasium/input/{j}/source-components/DE_{j}_BIOLOGIE_NEURO8_{label}.author-v2.source-extraction.json'
    htmlsuffix='EA' if label=='BY-EA' else 'GA'
    if jur=='DE-HE':docpath='curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-biologie.pdf';url=oldsource['sourceDocuments'][0]['url'];docsha=oldsource['sourceDocuments'][0]['sha256']
    else:docpath=str((V1/f'primary/BY13-{htmlsuffix}.current-official.html').relative_to(ROOT));url=next(x['url'] for x in oldsource['sourceDocuments'] if f'BY13-{htmlsuffix}.' in x['savedPath']);docsha=bind(ROOT/docpath)['sha256']
    key='NEURO8-AUTHOR-V2-'+label;doc={'key':key,'title':'Actual official HE43' if jur=='DE-HE' else 'LehrplanPLUS Bayern B13 '+htmlsuffix+' LB2 original HTML','path':docpath,'localPath':docpath,'url':url,'official':True}
    sources=[];decisions=[];mappings=[]
    for route in selected:
        r=next(x for x in records['records'] if x['goalId']==route['goalId']);g=r['wholeCanonicalCandidateDEEN'];sid=str(uuid.uuid5(uuid.NAMESPACE_URL,source_by[g['id']]['id']+':'+label));route['sourceGoalId']=sid;route['sourceExtractionPath']=extraction_path
        sources.append({'id':sid,'title':g['title'],'description':g['description'],'descriptionEn':g['descriptionEn'],'stage':'SekII','courseLevel':route['courseLevel'],'sourceDocumentKey':key,'sourceKind':route['sourceKind'],'authoredComponent':True,'isOfficialBullet':False,'officialNumberingClaim':False,'granularity':'declaredAuthoredModelSpecialisation' if route['sourceKind']=='authoredModelSpecialisation' else 'boundedOriginalCompetencyAspect','sourceSpan':'Actual HE p43' if jur=='DE-HE' else 'Actual BY13 LB2 #' + ('313324' if htmlsuffix=='EA' else '314384'),'sourceRef':'Author-v2 bounded/specialisation route to actual original; not whole original approval','actualOriginalRecordIds':route['actualOriginalRecordIds'],'actualPrimaryComponents':[x for x in r['actualPrimaryComponents'] if x['recordId'] in route['actualOriginalRecordIds']],'wholeOriginalBulletCoverage':False,'wholeCurrentCanonicalCoverage':False,'wholeCandidateApproval':False,'sourceContentA_BKEEPBoundedOnly':True,'textAndD_PStatus':'candidate pending','tags':['jurisdiction:'+jur,'stage:SekII','courseLevel:'+route['courseLevel']]})
        decisions.append({'sourceGoalId':sid,'decision':'mapped','canonicalGoalIds':[g['id']],'matchType':'partial','reviewer':'author-v2 inert native-routing preparation; not independent D/P reviewer','reviewedAt':NOW,'rationale':'Conditional technical direct-component routing only. Original whole HOLD, model-specialisation roles and candidate D/P/semantic decisions remain open. The compiler accepts official document provenance but does not validate sourceKind.','sourceKind':route['sourceKind'],'wholeOriginalSourceCoverage':False,'wholeCanonicalGoalApproval':False,'active':False,'independentSourceAReceipt':bind(A/'eight-primary-scope-and-two-NW-partial-decisions.independent-a.json'),'independentSourceBReceipt':bind(B/'eight-primary-components-and-minimal-proposals.independent-b.verdict.json')})
        mappings.append({'legacyGoalId':sid,'canonicalGoalId':g['id'],'matchType':'partial'})
    source={'schemaVersion':1,'sourceLandscapeId':source_landscape,'jurisdiction':jur,'subject':'Biologie','stage':'SekII','sourceDocuments':[doc],'sourceGoals':sources,'passages':[],'qualityReview':{'status':'inert conditional source-kind-aware routing candidate; no whole approval','active':False}}
    mapping={'schemaVersion':1,'sourceLandscapeId':source_landscape,'targetLandscapeId':current['landscapeId'],'sourceExtractionPath':extraction_path,'reviewStatus':'inert conditional author v2 native probe only','decisions':decisions,'mappings':mappings,'wholeOriginalSourceCoverage':False,'activeWrites':False}
    sp=write('native-input-candidates/'+label+'.source-extraction.candidate.json',source);mp=write('native-input-candidates/'+label+'.mapping.candidate.json',mapping)
    manifest.append({'plannedExtractionPath':extraction_path,'candidateExtractionPath':sp,'candidateMappingPath':mp,'documentPath':docpath,'documentURL':url,'documentSha256':docsha,'jurisdiction':jur,'stage':'SekII'})

NWBASE=BASE/'biologie-neuro-he-original-spelling-nw-two-source-components-author-v3'
nws=read(NWBASE/'NW.two-bacterial-source-components.author-v3.candidate.json')
nwm=read(NWBASE/'NW.two-bacterial-component-mappings.author-v3.candidate.json')
nws['qualityReview']={'status':'prior independent A_B KEEP for two bacterial components, actual inert adoption proposal','wholeNationalClearance':False,'humanApproval':False,'humanTrial':False}
for s in nws['sourceGoals']:s['sourceKind']='boundedPrimaryCompetencyComponent';s['wholeCurrentCanonicalApproval']=False
for d in nwm['decisions']:d['independentReviewStatus']='prior independent A_B bounded component KEEP; technical adoption only';d['sourceAReceipt']=bind(A/'eight-primary-scope-and-two-NW-partial-decisions.independent-a.json');d['sourceBReceipt']=bind(B/'eight-primary-components-and-minimal-proposals.independent-b.verdict.json')
nwm['reviewStatus']='two independently reviewed bounded bacterial components; inert native candidate only';nwm['activeWrites']=False
sp=write('native-input-candidates/NW.two-bacterial-components.source-extraction.candidate.json',nws);mp=write('native-input-candidates/NW.two-bacterial-components.mapping.candidate.json',nwm)
manifest.append({'plannedExtractionPath':nwm['sourceExtractionPath'],'candidateExtractionPath':sp,'candidateMappingPath':mp,'documentPath':nws['sourceDocument']['path'],'documentURL':nws['sourceDocument']['url'],'documentSha256':bind(V1/'primary/NW.current-official.pdf')['sha256'],'jurisdiction':'DE-NW','stage':'SekI'})
policy=read(ROOT/config['durationModelPolicyPath']);nwrow=next(r for r in policy['decisions'] if r.get('subject')=='Biologie' and r.get('jurisdiction')=='DE-NW')
newrow=copy.deepcopy(nwrow);newrow['sourceExtractionPath']=nwm['sourceExtractionPath'];newrow['rationale']='Inert path-specific extension of the identical existing reviewed NW Biology G9 policy for two separately A/B-reviewed bacterial UF1 components of the same KLP2019. No G8 or SekI course profile is inferred.';newrow['authorCandidateOnly']=True
assert not any(r.get('sourceExtractionPath')==newrow['sourceExtractionPath'] for r in policy['decisions']);policy['decisions'].append(newrow)
policy_path=write('native-input-candidates/duration-model-policy.with-explicit-NW-bacterial-path.candidate.json',policy)
write('native-input-candidate-routing.author-v2.json',{'createdAtUTC':NOW,'entries':manifest,'neuroRoutes':routes,'NWDurationPolicyCandidatePath':policy_path,'NWPolicyEffectiveDecisionExactlyInherited':{k:nwrow[k] for k in ['jurisdiction','stage','durationModels','decision','learnerFacingProjection']},'allWholeHOLDsRetained':True,'compilerDoesNotValidateSourceKind':True,'technical390NotWholeSourceApproval':True,'D_PReview':'candidate pending','activeWrites':False})
write('entry.actual-inputs-and-prior-freezes.receipt.json',{'createdAtUTC':NOW,'seals':seals,'inputBindings':list(tracked.values()),'currentWholeCanonical':bind(ROOT/config['landscapePath']),'currentCanonicalNodes':472,'currentCurricularAtomicCount':390,'newTextCorrections':2,'validOriginalLocatorMainCount':45,'validOriginalLocatorAddendumCount':21,'eightWholeHOLDsRetained':True,'threeModelSpecialisationsUnapprovedAsLiteralDuties':True,'nativeDPReview':'candidate pending','activeWrites':False})
print(json.dumps({'status':'AUTHOR_V2_RAW_TEXT_LOCATOR_AND_NATIVE_ROUTING_PREPARED','correctedTextGoals':2,'selectors':66,'routeComponents':len(routes),'routeFiles':len(manifest),'historicalOwnSealsVerified':len(seals),'current472':True,'activeWrites':False}))
