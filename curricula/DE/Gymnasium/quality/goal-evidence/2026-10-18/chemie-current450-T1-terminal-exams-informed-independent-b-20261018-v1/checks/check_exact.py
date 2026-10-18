# SPDX-License-Identifier: Apache-2.0
"""Finite input/diff/arithmetic facts; no automated scientific decisions."""
from pathlib import Path
import json,hashlib

ROOT=Path(__file__).resolve().parents[8]
HERE=Path(__file__).resolve().parent
BASE=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18')
AUTHOR=BASE/'chemie-current450-T1-terminal-exams-author-20261018-v6'
def read(p):return json.loads((ROOT/p).read_text())
def pin(p):
    raw=(ROOT/p).read_bytes();return {'path':str(p),'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw)}
def diffs(a,b):return sorted(k for k in a.keys()|b.keys() if a.get(k)!=b.get(k))
graph_path=Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
graph=read(graph_path);by_id={x['id']:x for x in graph['goals']}
ordinary=read(AUTHOR/'INPUT.ordinary-goals.selected-only.json')
if isinstance(ordinary,dict):ordinary=ordinary['goals']
registry_path=Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
subject=next(x for x in read(registry_path)['subjects'] if x['subject']=='chemie')
owners={}
for cpath in subject['positiveEvidenceConfigPaths']:
    cfg=read(cpath);wanted=set(cfg['scope']['goalIds'])
    for line in (ROOT/cfg['reviewPath']).read_text().splitlines():
        if not line.strip():continue
        record=json.loads(line)
        if record['goalId'] in wanted:owners.setdefault(record['goalId'],[]).append((cpath,cfg['reviewPath'],record))
inputs=[]
for g in ordinary:
    gid=g['id'];frozen=read(AUTHOR/'inputs'/f'whole-P.{gid}.json');current=by_id[gid];active=owners.get(gid,[])
    inputs.append({'goalId':gid,'wholeGoalEqualsCurrent':g==current,'currentChangedFields':diffs(g,current),
        'frozenRequires':g.get('requires',[]),'currentRequires':current.get('requires',[]),
        'soleOwner':len(active)==1,'wholePEqualsCurrent':len(active)==1 and active[0][2]==frozen,
        'activePins':[{'config':pin(c),'records':pin(r)} for c,r,_ in active]})
goals=read(AUTHOR/'AUTHOR.new-goals.full.draft.json')['newGoals']
old4={x['id']:x for x in read(BASE/'chemie-current450-T1-terminal-exams-author-20261018-v4/AUTHOR.new-goals.full.draft.json')['newGoals']}
old5={x['id']:x for x in read(BASE/'chemie-current450-T1-terminal-exams-author-20261018-v5/AUTHOR.new-goals.full.draft.json')['newGoals']}
interfaces=read(AUTHOR/'AUTHOR.exam-interfaces-and-scope.json')['interfaces']
rows=[]
for g in goals:
    gid=g['id'];e=g['examData'];i=next(x for x in interfaces if x['endpointId']==gid)
    mirrors={}
    for field,suffix in [('taskContent','task.de'),('taskContentEn','task.en'),('solutionContent','solution.de'),('solutionContentEn','solution.en')]:
        mirrors[field]=(ROOT/AUTHOR/'tasks'/f'{gid}.{suffix}.md').read_text().rstrip('\n')==e[field].rstrip('\n')
    rows.append({'endpointId':gid,'newIdAbsentFromCurrent':gid not in by_id,'requires':g['requires'],
        'requiresEqualsCoveredAndInterface':g['requires']==e['coveredGoalIds']==i['requiresExactly']==i['coveredGoalIdsExactly'],
        'pointsSum':sum(x['points'] for x in e['scoring']['steps']),'maxPoints':e['scoring']['maxPoints'],'passingPoints':e['scoring']['passingPoints'],
        'taskSolutionFileMirrors':mirrors,'v5WholeExact':g==old5[gid],
        'v4ChangedTopFields':diffs(old4[gid],g),'v5ChangedTopFields':diffs(old5[gid],g),
        'v4ChangedExamFields':diffs(old4[gid]['examData'],e),'v5ChangedExamFields':diffs(old5[gid]['examData'],e)})
seal=read(AUTHOR/'FREEZE.author.sha256.json')
source=Path('tmp/chemie-independent-b-primary-read/Grignard-Juniorlabor.pdf')
prior=BASE/'chemie-current450-T1-terminal-exams-informed-independent-a-20261018-v1/FIRST.independent-a.T1-v4-content-interface-and-scope.json'
facts={'role':'FINITE_EXACT_INPUTS_NO_SCIENTIFIC_VERDICT','canonical':pin(graph_path),'registry':pin(registry_path),
    'authorSeal':pin(AUTHOR/'FREEZE.author.sha256.json'),'authorSealMembers':[dict(pin(Path(x['path'])),matchesSeal=pin(Path(x['path']))==x) for x in seal['files']],
    'wholeNewGoals':pin(AUTHOR/'AUTHOR.new-goals.full.draft.json'),'ordinaryAndP':inputs,'exams':rows,
    'priorInformedReviewDeclaredInput':pin(prior),'actuallyDownloadedPrimaryScript':pin(source),
    'actualSOPMaterialIncludedExactly':{lang:(ROOT/AUTHOR/'materials'/f'Grignard-M3-operation-and-blank-log.{lang}.md').read_text().strip() in next(x for x in goals if x['id']=='d7abdeb3-5b69-5744-b7fd-8149fd92b0d5')['examData'][field]
        for lang,field in [('de','taskContent'),('en','taskContentEn')]},
    'rawPDFMatchesAuthorPrimaryPin':pin(source)['sha256']==read(AUTHOR/'SOURCE.practical-method-current-read-bindings.json')['sources'][0]['sha256'],
    'independentArithmetic':{'N2BondOrder':(8-2)/2,'N2Plus':(7-2)/2,'O2':(8-4)/2,'O2Plus':(8-3)/2,
        'GrignardPaper1AvailableMMol':35-1,'GrignardPaper1UpperMMol':min(30,35-1),'GrignardPaper2UpperMMol':min(20,25-6),'GrignardPaper2ConversionPercent':min(20,25-6)/20*100,
        'dialogueEquilibriumCOverA':.60/.40,'dialogueSameTempConductivityDifference':2100-1800,'dialogueControlDifference':2100-2098,
        'exothermicForwardBarriers':[70,35],'endothermicForwardBarriers':[80,50]},'normalWrites':0}
(HERE/'CHECK.exact-current-bindings-delta-arithmetic.json').write_text(json.dumps(facts,indent=2,ensure_ascii=False)+'\n')
print(json.dumps({'ordinary':len(inputs),'allWholeGoalsCurrent':all(x['wholeGoalEqualsCurrent'] for x in inputs),
    'allWholePCurrent':all(x['wholePEqualsCurrent'] for x in inputs),'authorMembers':len(seal['files']),'sealExact':all(x['matchesSeal'] for x in facts['authorSealMembers']),
    'allMirrorsExact':all(all(x['taskSolutionFileMirrors'].values()) for x in rows),'allInterfacesExact':all(x['requiresEqualsCoveredAndInterface'] for x in rows),
    'allPointsSum':all(x['pointsSum']==x['maxPoints']==x['passingPoints'] for x in rows),'v5WholeUnchangedCount':sum(x['v5WholeExact'] for x in rows),'primaryRawExact':facts['rawPDFMatchesAuthorPrimaryPin']},indent=2))
