from pathlib import Path
import copy, datetime, hashlib, json, os, subprocess

E=Path('/mnt/e/skillpilot-chemie-L7-20261017')
R=Path('/home/enpasos/projects/skillpilot')
K=E/'current439-remediation14-guarded-root-integration-technical-v1/capsule'
O=E/'current439-f79-explicit-concentration-ratio-author-root-v1'
CAP=O/'capsule'
Q=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-f79-explicit-concentration-ratio-author-root-v1')
GID='f79f15c0-e848-5e17-9eb5-26753d35c93b'
NOW=datetime.datetime.now(datetime.timezone.utc).isoformat()
assert not O.exists()
CAP.mkdir(parents=True)
for p in K.iterdir(): (CAP/p.name).symlink_to(p,target_is_directory=p.is_dir())
def own_parent(relative):
    cursor=CAP
    for part in relative.parts:
        cursor=cursor/part
        if cursor.is_symlink():
            target=cursor.resolve();cursor.unlink();cursor.mkdir()
            for child in target.iterdir():
                (cursor/child.name).symlink_to(child,target_is_directory=child.is_dir())
        elif not cursor.exists(): cursor.mkdir()
    return cursor
OUT=own_parent(Q)
def write_json(p,d):
    with p.open('x') as f: json.dump(d,f,ensure_ascii=False,indent=2);f.write('\n')
def pin(p):
    b=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def changed(a,b,path=''):
    if isinstance(a,dict) and isinstance(b,dict):
        assert a.keys()==b.keys(),path
        return sum((changed(a[k],b[k],path+'/'+k) for k in a),[])
    if isinstance(a,list) and isinstance(b,list):
        assert len(a)==len(b),path
        return sum((changed(x,y,path+'/'+str(i)) for i,(x,y) in enumerate(zip(a,b))),[])
    return [] if a==b else [{'pointer':path,'before':a,'after':b}]
POLD=K/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-material4-v3-targeted-preparation-technical-v1/P439.material4-v3-only28c-author-profile-current.aggregate.jsonl'
lines=POLD.read_bytes().splitlines(keepends=True)
original=next(json.loads(l) for l in lines if json.loads(l)['goalId']==GID)
material=E/'current439-twelve-whole-case-materials-clean-root-v1/REVIEW.current12-whole-operative-case-materials.science-only.json'
g0=next(g for g in json.loads(material.read_text())['goals'] if g['goalId']==GID)
assert g0['currentWholeProfileBody']==original['profile']
g=copy.deepcopy(g0)
case=g['wholeCurrentOperativeCasesAndAuthoredReferenceResponses'][0]['wholeOperativeCase']
assert case['caseKey']=='upper-hypothesis-investigation-acid-analysis'
for group in [case['learnerTask'],case['transfer'],g['wholeCurrentOperativeCasesAndAuthoredReferenceResponses'][0]['wholeOriginalFreshTransferDemand']]:
    assert 'A/B' in group['de'] and 'A/B' in group['en']
    group['de']=group['de'].replace('A/B-Verhältnis','Konzentrationsverhältnis cB/cA (B zu A)')
    group['en']=group['en'].replace('A/B ratio','concentration ratio cB/cA (B to A)')
assert 'und Verhältnis 2,00.' in case['expectedAnswer']['de']
assert 'and ratio 2.00.' in case['expectedAnswer']['en']
case['expectedAnswer']['de']=case['expectedAnswer']['de'].replace('und Verhältnis 2,00.','und das Konzentrationsverhältnis cB/cA = 2,00.')
case['expectedAnswer']['en']=case['expectedAnswer']['en'].replace('and ratio 2.00.','and concentration ratio cB/cA = 2.00.')
profile=g['currentWholeProfileBody'];brief=profile['applicationCaseBriefs'][0]
assert brief['id']==case['caseKey']
for lang,suffix in [('de','De'),('en','En')]:
    brief['taskDemand'+suffix]=case['learnerTask'][lang]+ ('\nFrische Variation: ' if lang=='de' else '\nFresh variation: ')+case['transfer'][lang]
    assert ('und Verhältnis 2,00.' if lang=='de' else 'and ratio 2.00.') in brief['expectedPerformance'+suffix]
    brief['expectedPerformance'+suffix]=brief['expectedPerformance'+suffix].replace('und Verhältnis 2,00.','und das Konzentrationsverhältnis cB/cA = 2,00.').replace('and ratio 2.00.','and concentration ratio cB/cA = 2.00.')
delta=changed(g0,g)
assert len(delta)==12, [x['pointer'] for x in delta]
assert len(changed(original['profile'],profile))==4
write_json(OUT/'INPUT.original-current-f79-whole-profile-and-two-cases.exact.json',g0)
write_json(OUT/'AUTHOR.current-f79-whole-profile-and-two-cases.explicit-B-over-A.json',g)
write_json(OUT/'AUTHOR.exact-scientific-delta.twelve-fields.json',{'role':'Authored substantive correction, not technical hash refresh or approval','goalId':GID,'atUTC':NOW,'changes':delta,'reason':'The stated hypothesis and original reference results use B/A=2. Earlier learner demands incorrectly asked A/B. The successor explicitly asks concentration cB/cA and labels the matching reference ratio in DE/EN; all numerical data, practical own-performance requirements, limitations, transfer answers and the entire colour-analysis case remain unchanged.','actualLearnerPerformance':False,'humanApproval':False,'independentAcceptancePending':True})
base=K/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-remediation14-guarded-root-integration-technical-v1/current4-v3-root-successor/central.current439.D113-P439V3.PROSPECTIVE.config.json'
central=json.loads(base.read_text());matches=[]
for rel in central['subjects'][0]['positiveEvidenceConfigPaths']:
    cfg=json.loads((K/rel).read_text())
    if GID in cfg.get('scope',{}).get('goalIds',[]): matches.append((rel,cfg))
assert len(matches)==1,len(matches)
cfg=copy.deepcopy(matches[0][1]);rid='chemie-current439-f79-explicit-concentration-ratio-author-root-20261017-v1'
cfg['reviewId']=rid;cfg['scope']={'label':'One substantive acid-case concentration-ratio correction; independent acceptance pending','goalIds':[GID]};cfg['reviewPath']=str(Q/'P1.current-f79.author-candidate.jsonl')
write_json(OUT/'P1.author.config.json',cfg)
candidate={'schemaVersion':1,'authoringContract':'positive-understanding-evidence-candidates-v1','reviewId':rid,'reviewedAt':NOW,'reviewer':'Codex author root; substantive ratio-demand correction, independent targeted acceptance pending','goals':[{'goalId':GID,'reason':'Explicitly corrects acid-case learner and transfer demands from A/B to concentration cB/cA (B to A), consistent with unchanged cA=0.00800 and cB=0.0160 mol/L and the original B/A=2 reference. Whole current profile and original execution requirements retained; this is an author candidate, no independent or human approval.','evidenceLevel':'E1','maximumClaimScope':'G1','dissent':['Independent acceptance of this ratio correction pending; no actual experiment, learner performance, safety release, whole-source clearance or human approval.'],'profile':profile}]}
write_json(OUT/'P1.author.candidates.json',candidate)
write_json(O/'PREPARATION.author-f79-correction.json',{'capsule':str(CAP),'output':str(OUT),'relative':str(Q),'beforeP439':pin(POLD),'beforeScientificMaterial':pin(material),'canonical':pin(K/cfg['landscapePath']),'semanticKinds':pin(K/cfg['semanticKindLedgerPath']),'authorPConfig':str(Q/'P1.author.config.json'),'candidates':str(Q/'P1.author.candidates.json'),'previousOwnerConfig':pin(K/matches[0][0]),'MainUnchanged':True,'KUnchanged':True,'profileFieldChanges':4,'totalMaterialAndProfileFieldChanges':12,'humanApproval':False})
print(json.dumps({'prepared':str(O),'changes':len(delta),'Pconfig':cfg,'candidateProfileChanges':4},ensure_ascii=False))
