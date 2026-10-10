import copy, difflib, hashlib, json, os, shutil, tempfile
from pathlib import Path

ROOT=Path('/home/enpasos/projects/skillpilot')
BASE=Path(__file__).resolve().parent
read=lambda p:json.loads(Path(p).read_text())
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
def write(name,data):
 (BASE/name).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
oldBase=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-six-terminal-route-bounded-author-20261009-v1/current300-rebase-successor-v2'
oldOverlay=read(oldBase/'route-only-selective-overlay.for-Generic10-combination.author.candidate.json')
releasedPath=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-four-terminal-materials-independent-root-20261009-v1/whole-four-material-reviewed-machine-released.inert.candidate.json'
released=read(releasedPath)
oldDrafts=read(oldBase/'whole-four-new-terminal-DRAFT-assessments.author.candidate.json')
for before,after in zip(oldDrafts,released):
 check=copy.deepcopy(after);check['examData']['reviewStatus']='draft';assert check==before
assert sha(releasedPath)=='3791796f7663b8fbced20e559d601c443650ce83950da4481527afee3add3a9f'
before=read(BASE/'inputs/root300.CAN389.before.json')
generic=read(BASE/'inputs/prepared-Generic11.whole389.CAN.before.json')
assert sha(BASE/'inputs/prepared-Generic11.whole389.CAN.before.json')=='4c1a942a99e5035621bfb11274d3803d362d8dc8f6ef9fbe61881bd1ecebe48f'
oldById={g['id']:g for g in before['goals']}
byId={g['id']:g for g in generic['goals']}
genericChanged=[i for i in oldById if oldById[i]!=byId[i]]
assert len(genericChanged)==11
for row in oldOverlay['expectedPrerequisiteSemanticBodies']:
 for key,value in row['fields'].items():assert byId[row['goalId']][key]==value,(row['goalId'],key)
after=copy.deepcopy(generic)
navOld=next(g for g in after['goals'] if g['id']==oldOverlay['existingNavigationUpdate']['goalId'])
assert navOld['contains']==oldOverlay['existingNavigationUpdate']['expectedOriginalContains']
navOld.update(copy.deepcopy(oldOverlay['existingNavigationUpdate']['setFields']))
navOld['contains']+=oldOverlay['existingNavigationUpdate']['appendContains']
new5=read(BASE/'whole-five-new-terminal-DRAFT-assessments.author.candidate.json')
newNav=read(BASE/'whole-one-additive-prerequisite-free-practice-navigation.author.candidate.json')
after['goals']+=copy.deepcopy(released+new5+[newNav])
rootGoal=next(g for g in after['goals'] if g['id']=='96183c48-b499-54d7-8530-578f6ff40207')
rootGoal['contains'].append(newNav['id'])
assert len(after['goals'])==399
views={}
viewRows=[]
for course in ['GK','LK']:
 view=read(BASE/('inputs/national-'+course+'.before.json'))
 def visit(nodes):
  for node in nodes:
   if node.get('goalId')=='f8922e23-f00e-53f7-be2f-1016e2b0ddf2':node['displayLabel']='BY: abgegrenzte Wirtschafts- und Rechtsübungen'
   visit(node.get('children',[]))
 visit(view['rootNodes'])
 nodes=view['rootNodes'][0]['children']
 nodes.append({'kind':'canonicalSubtree','goalId':newNav['id'],'displayLabel':newNav['title']})
 # Explicit authored role: the current national target excludes 8a and its
 # prerequisite chain. A global terminal addition must not silently widen it.
 nodes.append({'kind':'goalEntry','goalId':new5[3]['id'],'projectionRole':'prerequisiteOnly'})
 views[course]=view
 write('national-'+course+'.bounded-route-author.candidate.view.json',view)
 viewRows.append({'courseProfile':course,'navReferenceGoalId':newNav['id'],'new8aTerminalGoalId':new5[3]['id'],'new8aTerminalProjectionRole':'prerequisiteOnly','reason':'8a and its prerequisite chain are not current national target goals; global terminal addition does not author a new curricular target scope.'})
write('whole-current300-plus-Generic11-and-nine-bounded-terminals.inert.candidate.json',after)
write('actual-minimal-route-field-overlay-and-scope.proposal.json',{
 'schemaVersion':1,'kind':'inert-author-overlay-not-approval',
 'expectedCurrentRootWholeSHA256':sha(BASE/'inputs/root300.CAN389.before.json'),
 'expectedPreparedGeneric11WholeSHA256':sha(BASE/'inputs/prepared-Generic11.whole389.CAN.before.json'),
 'oldFourExactMachineReleasedSource':{'path':str(releasedPath.relative_to(ROOT)),'sha256':sha(releasedPath),'statusOnlyDeltaAgainstPriorAuthor':True},
 'existingGoalFields':[{'goalId':navOld['id'],'setFields':oldOverlay['existingNavigationUpdate']['setFields'],'expectedContains':oldOverlay['existingNavigationUpdate']['expectedOriginalContains'],'appendContains':oldOverlay['existingNavigationUpdate']['appendContains']},{'goalId':rootGoal['id'],'expectedContains':oldById[rootGoal['id']]['contains'],'appendContains':[newNav['id']]}],
 'newWholeGoals':released+new5+[newNav],
 'views':viewRows,'semanticKindProposals':[{'goalId':g['id'],'semanticKind':'practiceAssessment','reviewStatus':'author-proposal-independent-review-pending'} for g in released+new5+[newNav]],
 'ownMachineReleaseClaims':False,'newStrictClosures':0,'liveWrites':[]})

iso=Path(tempfile.mkdtemp(prefix='skillpilot-wirtschaft-all-open-routes-author-'))
(iso/'app').mkdir();shutil.copytree(ROOT/'app/scripts',iso/'app/scripts',symlinks=True)
shutil.copy2(ROOT/'app/package.json',iso/'app/package.json')
for name in ['node_modules','src']:(iso/'app'/name).symlink_to(ROOT/'app'/name,target_is_directory=True)
# The prepared Generic10 public assets are read-only inputs, including its three
# corrected PNGs; no link is written through and no source frame is modified.
(iso/'app/public').symlink_to('/tmp/skillpilot-wirtschaft-generic10-current311-476152vl/app/public',target_is_directory=True)
for name in ['contracts','docs','scripts']:(iso/name).symlink_to(ROOT/name,target_is_directory=True)
(iso/'curricula/DE/Gymnasium').mkdir(parents=True)
for p in (ROOT/'curricula').iterdir():
 if p.name!='DE':(iso/'curricula'/p.name).symlink_to(p,target_is_directory=p.is_dir())
for p in (ROOT/'curricula/DE').iterdir():
 if p.name!='Gymnasium':(iso/'curricula/DE'/p.name).symlink_to(p,target_is_directory=p.is_dir())
gym=iso/'curricula/DE/Gymnasium'
for p in (ROOT/'curricula/DE/Gymnasium').iterdir():
 if p.name=='canonical':shutil.copytree(p,gym/p.name)
 elif p.name=='composition-views':
  (gym/p.name).mkdir()
  for s in p.iterdir():
   if s.name=='wirtschaft':shutil.copytree(s,gym/p.name/s.name)
   else:(gym/p.name/s.name).symlink_to(s,target_is_directory=s.is_dir())
 else:(gym/p.name).symlink_to(p,target_is_directory=p.is_dir())
canFile=gym/'canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
canFile.write_text(json.dumps(after,ensure_ascii=False,indent=2)+'\n')
for course,view in views.items():
 (gym/('composition-views/wirtschaft/de-de-gym-economics-'+course.lower()+'.view.json')).write_text(json.dumps(view,ensure_ascii=False,indent=2)+'\n')
checker=ROOT/'app/scripts/generateCurriculumQualityStatus.ts'
text=checker.read_text()
needle="const CANONICAL_GYM_ECONOMICS_PRACTICE_CLUSTER_IDS = [\n"
assert text.count(needle)==1
newText=text.replace(needle,needle+"  '"+newNav['id']+"',\n")
patch=''.join(difflib.unified_diff(text.splitlines(keepends=True),newText.splitlines(keepends=True),fromfile='a/app/scripts/generateCurriculumQualityStatus.ts',tofile='b/app/scripts/generateCurriculumQualityStatus.ts'))
(BASE/'one-additive-Economics-practice-cluster-QS-registration.inert.patch').write_text(patch)
out=iso/'app/scripts/actual-all-route-quality-original-body-export-probe.ts'
out.write_text(newText+"\nexport { evaluateRouteProfile, evaluateGraphIntegrity, evaluateTypeConsistency, routeProfiles, buildEffectiveRequiresEdges, buildAtomicDirectRequiresEdges, collectRenderedAtomicGoalIdsFromCompositionView };\n")
(BASE/'native-tools').mkdir(exist_ok=True)
shutil.copy2(out,BASE/'native-tools'/out.name)
write('actual-own-combined-route-isolate.prepare.receipt.json',{
 'schemaVersion':1,'physicalIsolate':str(iso),'liveWrites':[],
 'canonicalCandidateSHA256':sha(canFile),'goalCount':399,'curricularAtomicCountUnchanged':311,
 'preparedGeneric11ChangedWholeGoalIds':genericChanged,'inheritedRootReviewedFourTerminalsSHA256':sha(releasedPath),
 'fiveDraftAssessmentsSHA256':sha(BASE/'whole-five-new-terminal-DRAFT-assessments.author.candidate.json'),
 'originalCheckerSHA256':sha(checker),'originalCheckerWholePrefixPreservedExceptSingleAdditiveEconomicsClusterID':True,
 'inertCheckerRegistrationPatchSHA256':sha(BASE/'one-additive-Economics-practice-cluster-QS-registration.inert.patch'),
 'nationalExplicitScope':viewRows,'independentApproval':False})
print(iso)
