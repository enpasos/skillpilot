import json, pathlib, sys
BASE = pathlib.Path('/mnt/e/skillpilot-chemie-L7-20261017/current439-requires-closure-source-surrogate-neutral-preparation-technical-v1')
SCI = BASE / 'science'
def read(name): return json.loads((SCI / name).read_text())
GROUPS = read('REVIEW-GROUPS.common-prerequisite-dependent-scientific-necessity.pending.json')['groups']
GOALS = {g['id']:g for g in read('C650.whole-current-authored-goal-content.json')['goals']}
PROFILES = {p['goalId']:p['profile'] for p in read('P439.whole-current-operative-profile-bodies.no-review-wrappers.json')['profiles']}
ANCHORS = {a['anchorId']:a for a in read('SOURCE-ANCHORS.current-active-mapping-partners.no-review-decisions.json')['anchors']}
CELLS = {c['cellId']:c for c in read('SOURCE-CELLS.whole-current-source-goals-passages-original-locators.no-verdicts.json')['sourceCells']}
def german(x):
    if isinstance(x, dict): return {k:german(v) for k,v in x.items() if not k.endswith('En')}
    if isinstance(x, list): return [german(v) for v in x]
    return x
SEEN=set(json.loads((pathlib.Path(__file__).parent/'READ-GOAL-IDS.json').read_text())) if (pathlib.Path(__file__).parent/'READ-GOAL-IDS.json').exists() else set()
TEXTS=set()
def texts(x, path=''):
    if isinstance(x,dict):
        for k,v in x.items():texts(v,path+'/'+k)
    elif isinstance(x,list):
        for i,v in enumerate(x):texts(v,path+'/'+str(i))
    elif isinstance(x,str) and (path.endswith('De') or path.endswith('/archetype')) and x not in TEXTS:
        print(path,x);TEXTS.add(x)
def show(i):
    g=GROUPS[i]; print('\nGROUP', i, g['reviewGroupId'])
    for label,gid in [('PRE',g['prerequisiteGoalId']),('DEP',g['directDependentGoalId'])]:
        x=GOALS[gid];print(label,gid,x['title'],x['description'],'tags',x.get('tags'), 'requires',x.get('requires'))
        if gid not in SEEN:
            texts(PROFILES.get(gid));SEEN.add(gid)
    for d in g['jurisdictionDockets']:
        a=ANCHORS[d['endpointAnchorId']];c=CELLS[a['sourceCellId']];s=c['wholeCurrentSourceGoal']
        print('DOCKET',d['jurisdiction'],'anchor',a['anchorId'],'endpoint',a['endpointGoalId'],'map',a['mappingProvenance']['wholeMappingEdge']['matchType'],'contains',a['mappingProvenance']['mappedCanonicalTargetToEndpointContainsPath'])
        print('PATH',d['technicalSelectedPathPrerequisiteToDependent'],'FLAGS',d['knownOpenSourceFlags'],'courseMissing',d['prerequisiteTargetCoursesWithoutSameCourseWholePath'],'notTarget',d['endpointNotATargetInAnyCurrentStateScope'],'BcP',d['chainIncludesSeparateBcPProgram'])
        print('SOURCE',s.get('sourceText'),s.get('sourceRef'),s.get('courseLevel'),s.get('sourceSpan'),'cell',a['sourceCellId'])
        m=c['sourceDocumentMetadata'];print('PRIMARY',m.get('sourceDocument',{}).get('key'), 'stage', m.get('stage'))
if __name__=='__main__':
    for i in range(int(sys.argv[1]),int(sys.argv[2]) if len(sys.argv)>2 else int(sys.argv[1])+1):show(i)
    (pathlib.Path(__file__).parent/'READ-GOAL-IDS.json').write_text(json.dumps(sorted(SEEN),indent=2)+'\n')
