"""Compare all recorded acquisition placements with round 1 and the two pinned Git trees."""
import hashlib
import json
from collections import Counter, defaultdict
from pathlib import Path
from subprocess import check_output

out = Path(__file__).resolve().parents[1]
old = out.parent
view_dir = 'curricula/DE/Gymnasium/composition-views/physik'
record_dir = 'curricula/DE/Gymnasium/quality/learning-units/physics-he-e2-child-structures-2026-11-25'
record_name = record_dir + '/regrouping.actual.json'
def git(*args): return check_output(['git', *args])
def rev(ref): return git('rev-parse',ref).decode().strip()
def read_blob(ref, name): return git('show',ref+':'+name)
def sha(data): return hashlib.sha256(data).hexdigest()
original=rev('a88f17523b')
base=rev('19c14af91e')
head=rev('4f963b4b78')
prior_record=old/'independent-review.actual.json'
assert sha(prior_record.read_bytes())=='45d029ae72d1ff880bdcced9b9b7188b4939d1f076e23bdcf3aa7dfae7f833cd'
prior=json.loads(prior_record.read_bytes())
for artifact in prior['artifacts']:
    data=(old/artifact['path']).read_bytes()
    assert len(data)==artifact['bytes'] and sha(data)==artifact['sha256'],artifact['path']
structure=json.loads((old/'structure.actual.json').read_bytes())
record=json.loads(read_blob(head,record_name))
def viewlist(ref):
    return {line.split('\t',1)[1]:line.split()[2] for line in git('ls-tree','-r',ref,view_dir).decode().splitlines()}
oldtree,base_tree,original_tree,confirmed_tree=map(viewlist,[structure['base'],base,original,head])
assert len(base_tree)==90 and oldtree==base_tree and original_tree==confirmed_tree
changed={key for key in base_tree if base_tree[key]!=confirmed_tree[key]}
measured={v['file']:v for v in structure['changed']}
by_name={r['file']:r for r in record['views']['files']}
assert changed==set(measured) and len(changed)==8 and set(by_name)=={Path(k).name for k in changed}
def acq(raw):
    paths=defaultdict(list)
    def visit(nodes, route):
        for node in nodes:
            if node.get('acquisitionPlacement'):
                assert node['projectionRole']=='prerequisiteOnly'
                paths[node['goalId']].append(tuple(route))
            if node.get('children'):
                visit(node['children'],route+[node['id']])
    visit(json.loads(raw)['rootNodes'],[])
    return dict(paths)
def item(goal, name, before, after):
    return goal, name, before, after
fresh,first,reported=[],[],[]
author_goals=record['preparationPlaces']['goals']
assert len({g['goalId'] for g in author_goals})==len(author_goals)
by_goal={g['goalId']:g for g in author_goals}
for g in author_goals:
    for v in g['views']: reported.append(item(g['goalId'],v['file'],v['from'],v['to']))
views=[]
for path in sorted(changed):
    name=Path(path).name
    b,a=read_blob(base,path),read_blob(head,path)
    assert sha(b)==by_name[name]['beforeSha256'] and sha(a)==by_name[name]['afterSha256']
    before,after=acq(b),acq(a)
    assert before.keys()==after.keys()
    for goal in before:
        if before[goal]!=after[goal]:
            assert len(before[goal])==len(after[goal])==1
            fresh.append(item(goal,name,before[goal][0][-1],after[goal][0][-1]))
    for move in measured[path]['acquisitionPlacementMoves']:
        goal=move['id']
        assert [list(p) for p in before[goal]]==move['before'] and [list(p) for p in after[goal]]==move['after']
        assert by_goal[goal]['title']==move['title']
        if by_goal[goal]['subject']=='Mathematik':
            assert move['subject']=='68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
            assert list(move['demandingTopicsInEPhase'])==['he-physics-topic-0ade0d10-8b32-5a95-a1a9-8ac64e2a8089']
        else: assert by_goal[goal]['subject']=='Physik' and move['subject']=='7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
        first.append(item(goal,name,move['before'][0][-1],move['after'][0][-1]))
    views.append({'file':name,'baseBlob':base_tree[path],'round1AndRound2Blob':confirmed_tree[path],
                  'baseSha256':sha(b),'sha256':sha(a),'preparationMoves':len(measured[path]['acquisitionPlacementMoves'])})
assert Counter(first)==Counter(reported)==Counter(fresh)
assert len(set(fresh))==len(fresh)==record['preparationPlaces']['moves']==30
assert len({t[0] for t in fresh})==record['preparationPlaces']['distinctGoals']==9
assert rev(head+'~2')==base
appdiff=git('diff','--name-only',original,head,'--','app').decode().splitlines()
currdiff=git('diff','--name-only',original,head,'--','curricula').decode().splitlines()
assert all(p.startswith(record_dir+'/') for p in currdiff)
for ref in (head,original):
    assert rev(ref+':'+view_dir)==rev(head+':'+view_dir)
output={
  'head':head,'tree':rev(head+'^{tree}'),'stackBase':base,'intermediate':rev(head+'^'),'round1':original,
  'round1Parent':structure['base'],'priorManifest':{'sha256':sha(prior_record.read_bytes()),'verifiedArtifacts':len(prior['artifacts'])},
  'originalStructureSha256':sha((old/'structure.actual.json').read_bytes()),'recordSha256':sha(read_blob(head,record_name)),
  'viewTree':rev(head+':'+view_dir),'allRound1ToRound2ViewBlobsEqual':True,
  'totalViews':90,'changedFromStackBase':8,'unchangedFromStackBase':82,'views':views,
  'placementComparisons':[dict(goalId=g,file=v,before=b,after=a,title=by_goal[g]['title'],subject=by_goal[g]['subject']) for g,v,b,a in sorted(fresh)],
  'distinctGoals':len(by_goal),'exactTupleMatches':len(fresh),'disagreements':[],
  'changedAppFilesRound1ToRound2':appdiff,'changedAppFilesMergedParentSinceRound1':[p for p in appdiff if read_blob(head,p)==read_blob(base,p)],
  'curriculaChangesRound1ToRound2RestrictedTo':record_dir,'changedCurricularRecordFiles':len(currdiff)}
(out/'placements.actual.json').write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n')
