import copy,hashlib,json,pathlib,shutil
ROOT=pathlib.Path('/home/enpasos/projects/skillpilot');OUT=pathlib.Path(__file__).parent
Q=OUT.parent;MAIN=Q/'wirtschaft-common343-M6-fieldwise-composition-AUTHOR-INERT-v1';V2=Q/'wirtschaft-BB-personal21-two-partial-union-and-full-existing-practice-scope-ADDENDUM-AUTHOR-INERT-v2'
def read(p):return json.loads(p.read_text())
def rel(p):return str(p.relative_to(ROOT))
def bind(p):
 b=p.read_bytes();return {'path':rel(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(p,x):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
paths=['curricula/DE/Gymnasium/input/BB/upper-secondary/source-extraction/DE_BB_WIRTSCHAFT_SEKII_GOST_2022.source-extraction.json','curricula/DE/Gymnasium/mapping/DE-BB/upper-secondary/bb_wirtschaft_upper_secondary_source_extraction_to_canonical_wirtschaft.review.json']
for path in paths:
 p=V2/'candidates'/path;dest=OUT/'candidates'/path;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,dest)
 assert dest.read_bytes()==p.read_bytes()
view_name='de-bb-gym-economics-lk.view.json';view_active='curricula/DE/Gymnasium/composition-views/wirtschaft/'+view_name
original=read(MAIN/'candidate-views'/view_name);view=copy.deepcopy(original)
removed=[]
def clean(nodes):
 ret=[]
 for node in nodes:
  if node.get('goalId')=='81dfe82c-508b-51ba-829e-3f9e4d4a27a1':removed.append(copy.deepcopy(node));continue
  if node.get('kind')=='structure':
   node['children']=clean(node.get('children',[]))
   if not node['children']:continue
  ret.append(node)
 return ret
view['rootNodes']=clean(view['rootNodes'])
assert len(removed)==1
view['rootNodes'].append({'kind':'structure','id':'bb-lk-selected-personal-ordinary-corporate-and-explicit-board-comparison','label':'Gewählter Personalbereich: Unternehmensmitbestimmung und ausdrücklich ergänzter Vergleich','children':[{'kind':'goalEntry','goalId':'fab48742-756b-564d-87ef-cd6f3c75f348','projectionRole':'target','displayLabel':'Unternehmensmitbestimmung: gewöhnliche Regeln und bewusst ergänzter Montanvergleich'}]})
view_out=OUT/'candidates'/view_active;write(view_out,view)
core=read(MAIN/'candidate-core/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json');by={g['id']:g for g in core['goals']}
write(OUT/'four-whole-unchanged-content-contracts.EXACT.json',[by[g] for g in ['776457c2-8bb3-53b9-838b-a028319175fb','fab48742-756b-564d-87ef-cd6f3c75f348','912ab267-ee00-581b-a31c-dfc0b3587184','81dfe82c-508b-51ba-829e-3f9e4d4a27a1']])
manifest=read(V2/'actual-final32-reuse-and35-view-rest-guards.AUTHOR-INERT.json')
for row in manifest['pairs']:
 if row['activePath'] in paths:row['candidatePath']=rel(OUT/'candidates'/row['activePath'])
manifest['boundedOverwritePairs']=[{'activePath':p,'candidatePath':rel(OUT/'candidates'/p),'sameBytesAsV2QualifiedSourceUnionMetadataCandidate':bind(V2/'candidates'/p)} for p in paths]+[{'activePath':view_active,'candidatePath':rel(view_out),'baselineMainView':bind(MAIN/'candidate-views'/view_name),'revisedV2ViewHistoricalOnly':bind(V2/'candidates'/view_active)}]
manifest['sourceUnionAndTwoMetadataFixesBytesExactV2']=True
manifest['BB912RequiresSURAdded']=False
manifest['core689Denominator343Unchanged']=True
manifest['intentionalOnlyLostBBTarget']='81dfe82c-508b-51ba-829e-3f9e4d4a27a1'
manifest['onlyAddedBBLKTarget']='fab48742-756b-564d-87ef-cd6f3c75f348'
write(OUT/'actual-final32-three-overlays-and35-rest-guards.AUTHOR-INERT.json',manifest)
write(OUT/'actual-one-whole-BBLK-view-source-boundary-and-native-route-decision.INERT.json',{
 'removedWholeEntry':removed[0],'beforeWhole':original,'afterWhole':view,
 'sourceRole':'LK Personal is selected wahlobligatorisch20, basic BetrVG/MitbestG democratic workplace participation21. 776+fab two PARTIAL facets. The wholefab ordinary/Montan comparison contains an explicit didactic extra; no original BB Montan or labour-director obligation.',
 'correctedViewRole':'Remove unsupported BB81d target, do not add912. Preserve current genuine whole81d body and all other scopes unchanged. Original wrong BB scope and author-v2 alternative stay historical.',
 'onlyAddedTarget':'fab48742-756b-564d-87ef-cd6f3c75f348','added912':False,'source21To912Edge':False,'912SURAdded':False,
 'orientationClosureAvailable':'fab.requires6bf2;776.requiresdae939; both are existing BB targets.',
 'conditionalNativeRouteNeed':'Actual689 has only81d containing fab in requires/coveredGoalIds. With81d no longer a BB target, a route gap is plausible; Root must run actual native CQR102. No new690 SEM/P/Book integration before demonstrated native need.',
 'existingPracticeSearch':[{'id':g['id'],'title':g['title'],'requires':g.get('requires',[]),'coveredGoalIds':g.get('examData',{}).get('coveredGoalIds',[])} for g in core['goals'] if g.get('examData') and ('fab48742-756b-564d-87ef-cd6f3c75f348' in g.get('requires',[])+g['examData'].get('coveredGoalIds',[]))],
 'noCoreSEMAMOrPBookBodyChanges':True,'SourceScopeSelfApproval':False,'M2M6M7CIClaim':False})
print(json.dumps({'sourceMappingExactV2':True,'BBViewRemove81dOnly':True,'addOnlyFab':True,'new912OrSUR':False}))
