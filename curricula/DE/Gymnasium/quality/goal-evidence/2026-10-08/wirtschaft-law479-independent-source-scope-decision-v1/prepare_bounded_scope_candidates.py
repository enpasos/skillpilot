# Apache-2.0. Inert source/projection candidates and actual input guards only.
import json,pathlib,hashlib,datetime
directory=pathlib.Path(__file__).resolve().parent;root=directory.parents[6]
read=lambda p:json.loads(p.read_text())
sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
write=lambda p,j:p.write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n') if not p.exists() else (_ for _ in ()).throw(RuntimeError('No overwrite: '+str(p)))
gid='479fb87a-3a5a-5892-8b3e-dfb1d07e9612';sid='2d2c784c-3a1e-5b32-a72f-ef2c22169b85'
canpath=root/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
canonical=read(canpath);bygoal={g['id']:g for g in canonical['goals']}
author=directory.parent/'wirtschaft-law479-bounded-BY-course-source-author-v1'
ar=read(author/'actual-bounded-source-course-author.receipt.json')
basepath=root/ar['originalSourcePath'];candidatepath=root/ar['candidateSourcePath']
base=read(basepath);candidate=read(candidatepath)
assert sha(basepath)==ar['originalSourceSha256'] and sha(candidatepath)==ar['candidateSourceSha256']
br={x['id']:x for x in base['sourceGoals']};cr={x['id']:x for x in candidate['sourceGoals']}
assert len(br)==len(cr)==184 and set(br)==set(cr)
assert br[sid]==read(author/'whole-source-row.original.json')
assert cr[sid]==read(author/'whole-source-row.course-successor.candidate.json')
fields=sorted(k for k in set(br[sid])|set(cr[sid]) if br[sid].get(k)!=cr[sid].get(k))
assert fields==['courseLevel','tags'] and cr[sid]['courseLevel']=='LK'
assert all(br[k]==cr[k] for k in br if k!=sid)
assert {k:v for k,v in base.items() if k!='sourceGoals'}=={k:v for k,v in candidate.items() if k!='sourceGoals'}
assert bygoal[gid]==read(author/'whole-canonical-goal.original.unchanged.json')
oldmap=root/ar['originalMappingPath'];newmap=root/ar['candidateMappingPath']
bm=read(oldmap);cm=read(newmap)
assert sha(oldmap)==ar['originalMappingSha256'] and sha(newmap)==ar['candidateMappingSha256']
assert sorted(k for k in set(bm)|set(cm) if bm.get(k)!=cm.get(k))==['sourceExtractionPath']

ancestors=set();frontier=[gid]
while frontier:
 child=frontier.pop()
 for goal in canonical['goals']:
  if child in goal.get('contains',[]) and goal['id'] not in ancestors:
   ancestors.add(goal['id']);frontier.append(goal['id'])
all_direct=[];he_ancestor=[];legacy_he_ancestor=[];guarded=[canpath,basepath,candidatepath,oldmap,newmap]
for path in (root/'curricula/DE/Gymnasium/mapping').rglob('*.json'):
 try:m=read(path)
 except ValueError:continue
 if m.get('targetLandscapeId')!=canonical['landscapeId'] or not isinstance(m.get('mappings'),list):continue
 matches=[e for e in m['mappings'] if e.get('canonicalGoalId')==gid]
 he=[e for e in m['mappings'] if e.get('canonicalGoalId') in ancestors] if '/DE-HE/' in str(path) else []
 if not matches and not he:continue
 if not m.get('sourceExtractionPath'):
  assert not matches, 'Unexpected direct edge without extraction input'
  legacy_he_ancestor.append({'mappingPath':str(path.relative_to(root)),
   'wholeMetadata':{k:v for k,v in m.items() if k not in ['mappings','decisions']},
   'wholeAncestorEdges':he,'sourceExtractionCoverageClaim':False})
  guarded.append(path)
  continue
 srcpath=root/m['sourceExtractionPath'];src=read(srcpath);rows={x['id']:x for x in src['sourceGoals']};passages={x['id']:x for x in src.get('passages',[])}
 guarded.extend([path,srcpath])
 for e in matches+he:
  row=rows[e['legacyGoalId']]
  item={'mappingPath':str(path.relative_to(root)),'sourceExtractionPath':str(srcpath.relative_to(root)),
   'sourceDocument':src.get('sourceDocument'),'wholeMappingEdge':e,'wholeSourceRow':row,
   'wholeSourcePassage':passages.get(row.get('passageId')),
   'wholeHistoricalDecisions':[d for d in m.get('decisions',[]) if d.get('sourceGoalId')==row['id']]}
  (all_direct if e.get('canonicalGoalId')==gid else he_ancestor).append(item)
assert len(all_direct)==20
source_input={'role':'actual_current_whole_direct_source_and_HE_ancestor_binding_input',
 'goalId':gid,'wholeCurrentGoal':bygoal[gid],'directWholeBindings':all_direct,
 'HEWholeAncestorBindings':he_ancestor,'HELegacyAncestorMappingsWithoutExtraction':legacy_he_ancestor,
 'containsAncestorIds':sorted(ancestors),
 'wholeDirectRequires':bygoal[gid]['requires'],
 'wholeReverseRequires':[g for g in canonical['goals'] if gid in g.get('requires',[])],
 'wholeDirectContainsParents':[g for g in canonical['goals'] if gid in g.get('contains',[])]}
write(directory/'actual-twenty-direct-and-HE-ancestor-whole-source-context.input.json',source_input)

views=[]
for profile in ['GK','LK']:
 active=root/f'curricula/DE/Gymnasium/composition-views/wirtschaft/de-de-gym-economics-{profile.lower()}.view.json'
 old=read(active);views.append(active);new=json.loads(json.dumps(old))
 new.update({'$schema':'https://skillpilot.com/schemas/curriculum-package/v1/composition-view.schema.json',
  'viewFormatVersion':'1.0','language':'de','viewId':f'de-by-gym-economics-{profile.lower()}-479-bounded-candidate'})
 new['scope']['jurisdiction']='DE-BY'
 if profile=='GK':
  new['rootNodes'][0]['children'].append({'kind':'goalEntry','goalId':gid,'projectionRole':'prerequisiteOnly'})
 name=f'de-by-gym-economics-{profile.lower()}-479-bounded.inert.view.json'
 write(directory/name,new)
guarded.extend(views)
receipt={'role':'actual_independent_inert_candidate_materialization_and_exact_guards',
 'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'sourceDecisionCandidate':'ACCEPT_LK_metadata_only_against_explicit_elevated_primary_section',
 'sourceFieldsChanged':fields,'wholeOtherSourceRowsUnchanged':183,
 'all35PassagesAndOtherExtractionFieldsEqual':True,'wholeMappingEdgesAndDecisionsEqual':True,
 'onlyMappingPathChanged':True,'whole479GoalUnchanged':True,
 'projectionCandidates':['de-by-gym-economics-gk-479-bounded.inert.view.json','de-by-gym-economics-lk-479-bounded.inert.view.json'],
 'scopeStageKept':'CrossStage','sourceSnapshotSpanIsOrdinalNotCurrentOfficialSection':True,
 'guardedFiles':[{'path':str(p.relative_to(root)),'sha256':sha(p)} for p in dict.fromkeys(guarded)],
 'liveWrites':0,'nativeTargetProofPending':True,'humanApprovalClaim':False,'newStrictClosures':0}
write(directory/'actual-independent-source-and-view-preparation.guards.json',receipt)
print(f'Actual source-only1/183/35/mapping guards passed. Inert BY GK/LK CrossStage views created; directSourceBindings20, HEAncestorBindings{len(he_ancestor)}. No active writes.')
