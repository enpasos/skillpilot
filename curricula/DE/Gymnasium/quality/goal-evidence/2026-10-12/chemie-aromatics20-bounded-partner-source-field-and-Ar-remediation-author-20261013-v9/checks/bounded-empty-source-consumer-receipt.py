# Apache-2.0. Targeted in-memory input overlay; actual compiler function, no native build.
import json,hashlib,importlib.util,sys,traceback,copy
from pathlib import Path
R=Path('/home/enpasos/projects/skillpilot');E='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/';O=E+'chemie-aromatics20-bounded-partner-source-field-and-Ar-remediation-author-20261013-v9'
def read(p):return json.loads((R/p).read_text())
def sha(p):return 'sha256:'+hashlib.sha256((R/p).read_bytes()).hexdigest()
s=read(O+'/NEUTRAL.targeted-v9-fix-verification.input-selector.json');can=read(s['landscape']['path']);sources={x['logicalPath']:x['readPath'] for x in s['sourceInputSelector']}
spec=importlib.util.spec_from_file_location('author_actual_source_compiler',R/'scripts/compile_curriculum_release_model.py');m=importlib.util.module_from_spec(spec);sys.modules[spec.name]=m;spec.loader.exec_module(m)
actual_load=m.load_json
def overlay_load(path):
    logical=str(path.relative_to(R));return actual_load(R/sources.get(logical,logical))
m.load_json=overlay_load
profile=read('contracts/curriculum-package/v1/profiles/de-gymnasium-mathematik-publication-evidence-v1.profile.json');calls=[];gaps=[]
for ref in s['mappingInputSelector']:
    review=read(ref['readPath']);empty=[(i,x) for i,x in enumerate(review.get('decisions',[])) if not x.get('canonicalGoalIds')]
    if not empty:continue
    extraction=m.load_json(R/review['sourceExtractionPath']);byid={x['id']:x for x in extraction['sourceGoals']}
    plain=next(x for x in s['mappingInputSelector'] if str(Path(x['logicalPath']).parent)==str(Path(ref['logicalPath']).parent) and not x['logicalPath'].endswith('.review.json'))
    binding={'reviewPath':ref['readPath'],'sourceExtractionPath':review['sourceExtractionPath'],'legacyMappingPath':plain['readPath'],'mappingCollectionId':review['reviewId']}
    try:
        classifier=m.PublicationInputClassifier(profile)
        m.compile_mapping_source_lane(binding,can['landscapeId'],{x['id'] for x in can['goals']},{extraction['sourceLandscapeId']:set(byid)},classifier,profile['sourceDocumentSemantics']['roles'])
        outcome={'status':'unexpectedPASS'}
    except Exception as error:
        frames=traceback.extract_tb(error.__traceback__);outcome={'status':'HOLD','errorType':type(error).__name__,'errorOutput':str(error),'frames':[{'path':f.filename,'line':f.lineno,'function':f.name,'code':f.line} for f in frames]}
    calls.append({'logicalMappingPath':ref['logicalPath'],'binding':binding,'exactFunction':'scripts/compile_curriculum_release_model.py::compile_mapping_source_lane','outcome':outcome})
    for idx,dec in empty:
        g=byid[dec['sourceGoalId']];sid=g['id'];candidates=[]
        if sid.startswith(('mv-chem-seki','sn-chem-seki')):
            candidates=[{'goalId':'416dfd33-8b43-5c49-903c-9847b95e4208','status':'possible bounded practical-operation replacement only; needs independent source check','supportedComponent':'actual qualitative pupil indicator testing, as one basic laboratory operation','missingWholeBodyDemand':'General ordered documentation is not explicitly demanded in this source clause; no actual class execution is provided.'}]
        elif 'loslichkeitsgleichgewichte-067' in sid:
            candidates=[{'goalId':'ac1bcf34-169c-5339-92ba-efe8c3022560','status':'possible bounded solubility/fractional-precipitation component only; no full source union','supportedComponent':'Explain sequential silver-halide precipitation by differing solubilities','missingWholeBodyDemand':'This clause alone does not establish all dynamic-equilibrium and general KL computation/interpretation requirements.'}]
        elif 'loslichkeitsgleichgewichte-069' in sid:
            candidates=[{'goalId':'416dfd33-8b43-5c49-903c-9847b95e4208','status':'possible bounded actual laboratory-operation component only; independent fitness pending','supportedComponent':'Actually perform a specified fractional-precipitation pupil experiment','missingWholeBodyDemand':'The source does not explicitly demand ordered documentation or the whole generalized lab body.'}]
        gaps.append({'logicalMappingPath':ref['logicalPath'],'mappingReadRef':ref,'decisionPointer':'/decisions/'+str(idx),'sourceGoalId':sid,'sourceTextLiteral':g['sourceText'],'sourceRef':g['sourceRef'],'sourceSpan':g['sourceSpan'],'stage':'SekI' if '/lower-secondary/' in ref['logicalPath'] else 'SekII','courseLevel':g.get('courseLevel'),'scopeLimit':g.get('sourceScopeCondition'),'newInV9':dec['decision']=='unmapped','QAStatus':dec['decision'],'existingCandidateComponents':[{**c,'currentWholeGoal':next(x for x in can['goals'] if x['id']==c['goalId'])} for c in candidates],'noCandidateReason':None if candidates else ('TH characteristic indicator colour/pH>7 has no exact empirical-colour atom; current particle/pH-calculation/indicator-electron bodies require extra operators.' if sid.startswith('th-chem-seki') else 'RP dye-family classification without required mechanism has no exact current dye-classification atom; synthesis/optical/electron bodies demand other operators.'),'candidateApplied':False,'wholePartnerUnionApproved':False})
out={'schemaVersion':1,'compiler':{'path':'scripts/compile_curriculum_release_model.py','sha256':sha('scripts/compile_curriculum_release_model.py'),'function':'compile_mapping_source_lane'},'publicationProfile':{'path':'contracts/curriculum-package/v1/profiles/de-gymnasium-mathematik-publication-evidence-v1.profile.json','sha256':sha('contracts/curriculum-package/v1/profiles/de-gymnasium-mathematik-publication-evidence-v1.profile.json')},'method':'Actual bounded source-lane function calls on v9 mapping inputs and read-only frozen extraction overlay; no native publication run and no consumer logic change','actualCalls':calls,'sevenWholeLiteralGapsAndBoundedExistingCandidates':gaps,'fullSourceUnionApproved':False,'newIndependentVotes':0}
(R/O/'checks/publication-lane-empty-source-call.actual.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'actualCalls':len(calls),'gaps':len(gaps),'errors':[(x['logicalMappingPath'],x['outcome'].get('errorOutput'),x['outcome'].get('frames',[])[-1:] ) for x in calls]},ensure_ascii=False))
