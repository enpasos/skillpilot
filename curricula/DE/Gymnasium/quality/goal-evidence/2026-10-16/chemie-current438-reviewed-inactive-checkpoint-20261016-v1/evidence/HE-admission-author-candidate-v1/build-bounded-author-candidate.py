# SPDX-License-Identifier: Apache-2.0
"""Construct only inactive selected-whole CAS; never writes a normal input."""
import copy, hashlib, json, pathlib

R=pathlib.Path('/home/enpasos/projects/skillpilot')
O=R/'tmp/chemie-m7-resumed-20261016/HE-admission-author-candidate-v1'
P=R/'tmp/chemie-m7-resumed-20261016/HE-admission-next-author-preparation-v1'
L=R/'tmp/chemie-m7-resumed-20261016/chemie-combined639-two-GK-priors-final-review-capsule-v1'
E=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16'
CP='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
def read(p): return json.loads(p.read_text())
def digest(b): return 'sha256:'+hashlib.sha256(b).hexdigest()
def fp(d): return digest(json.dumps(d,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode())
def pin(p): return dict(path=str(p.relative_to(R)),sha256=digest(p.read_bytes()),bytes=p.stat().st_size)
def put(n,d):
 p=O/n; assert not (O/'OUTPUTS.finite-HE-admission-author-candidate.selector.json').exists(), 'sealed selector exists'
 p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
assert digest((L/CP).read_bytes())=='sha256:62f13c6ae943186ddcb60ae4af1b075c6bd6ad3c48ac766d21cc583cac6c1746'
can=read(L/CP); by={g['id']:g for g in can['goals']}; ID=lambda pre:next(id for id in by if id.startswith(pre))
plan=read(P/'PREDICTED.two-primary-requires-and-three-existing-ordinary-contexts.v2.NOT-A-CAS.json')
viewplan=read(P/'PREDICTED.four-HE-whole-view-CAS.scopes.NOT-A-CAS.json')
additional_lk_remove=[ID('057a6826'),ID('d742ecb0'),ID('ebfa2c18')]
lkplan=plan['interfaces'][1]
lkplan['predictedRemoveDirectIds']=sorted(set(lkplan['predictedRemoveDirectIds'])|set(additional_lk_remove))
lkplan['predictedRequires']=[id for id in lkplan['predictedRequires']if id not in additional_lk_remove]
lkplan['predictedDirectCount']=len(lkplan['predictedRequires'])
after=copy.deepcopy(by); ops=[]
def goalop(id,reason):
 ops.append(dict(operation='replace-whole-goal-if-before-exact',goalId=id,before=by[id],beforeWholeObjectFingerprint=fp(by[id]),after=after[id],afterWholeObjectFingerprint=fp(after[id]),authorReason=reason,status='inactive-author-draft-no-independent-vote'))

for ip in plan['interfaces']:
 id=ip['goalId'];g=after[id]; assert g['requires']==ip['beforeRequires']; g['requires']=ip['predictedRequires']
 course='GK' if id==ID('14577339') else 'LK';priors=[ID('805a2f58')]+([ID('413040cd')] if course=='LK'else[])
 ext=g['extendedData'];rc=ext['routeCoverage']
 old_assertions={k:copy.deepcopy(rc[k])for k in ['coverageCorrectionReason','admissionMeaning','remainingLegacyTerminalDuties','currentCourseTargetAdmissionCount']}
 old_successor=copy.deepcopy(ext['targetedAdmissionAuthorSuccessor'])
 rc['currentDirectRequiresObjectCount']=len(g['requires']);rc['currentDirectRequiresAtomicObjectCount']=len(g['requires'])
 rc['currentCourseTargetAdmissionCount']=len(g['requires'])-len(priors)
 rc['coverageCorrectionReason']='Historical blanket assessed-coverage correction retained in history. This successor changes only the explicitly listed admission/interface metadata; the whole44BE/27pass paper and seven directly assessed IDs are exact.'
 rc['admissionMeaning']='Proposed bounded HE '+course+' admission universe plus explicitly retained lower-stage priors. Owner interim all-authored-topic inclusion respects official course columns. Seven paper-assessed IDs remain distinct from prerequisites. Whole-source/admission approval is pending; GK recycling8721 remains an explicit unresolved mixed-operator HOLD.'
 rc['remainingLegacyTerminalDuties']='HOLD: no whole-route validation. GK recycling8721 and historical local endpoints are documented separately; light requires/contains checks are not full stock or source approval.'
 rc['retainedExplicitLowerStagePriorGoalIds']=priors
 ext['targetedAdmissionAuthorSuccessor']={
  'status':'inactive-author-draft-pending-two-independent-informed-reviews',
  'role':'AUTHOR, no self review', 'baseCanonicalSha256':digest((L/CP).read_bytes()),
  'scope':'HE SekII '+course,'proposedCourseTargetAdmissionCount':len(g['requires'])-len(priors),
  'proposedDirectAdmissionCount':len(g['requires']),'positiveWholeSourceQualification':False,
  'explicitLowerStagePriorGoalIds':priors,'officialOptionalThemesRemainOptional':True,
  'ownerTargetPolicy':'All authored applicable themes in interim SkillPilot scope; no persisted selection or official universal requirement claimed.',
  'knownOpenWholeOperatorHoldGoalIds':[ID('8721d943')] if course=='GK'else[],
  'directlyAssessedGoalIdsUnchanged':True,'complete44BEMaterialAndSolutionsUnchanged':True,
  'wholeRouteRelease':False,'HumanApproval':False,'HumanTrial':False,
  'historicalPreviousSuccessorWhole':old_successor,'historicalPreviousRouteAssertionsWhole':old_assertions,
 }
 goalop(id,'Finite HE admission/course repair; complete paper, seven assessed IDs, images, historical lists and prior REVISEs retained. Recycling HOLD prevents whole approval.')
for op in plan['existingOrdinaryContextProposals']:
 g=after[op['goalId']];assert g['requires']==op['beforeRequires'];g['requires']=op['proposedAfterRequires']
 if 'proposedAfterTags'in op:assert g['tags']==op['beforeTags'];g['tags']=op['proposedAfterTags']
 goalop(g['id'],op['reason'])

names=['de-he-gk.view.json','de-he-lk.view.json','de-he-sekii-gk.view.json','de-he-sekii-lk.view.json']
views=[read(L/'curricula/DE/Gymnasium/composition-views/chemie'/n)for n in names]
for pre in ['d92b3a20','428b4d9c']:
 g=after[ID(pre)];app=g['applicability'];
 if 'DE-HE'not in app['jurisdiction']:app['jurisdiction'].append('DE-HE')
 if pre=='428b4d9c':app['courseProfile']=['GK','LK']
 scopes=g['extendedData']['authoredMemoryAcquisitionScopes']
 for i,v in enumerate(views):scopes.append(dict(purposeIndex=13+i,viewId=v['viewId'],scope=copy.deepcopy(v['scope'])))
 goalop(g['id'],'Existing narrow unchanged cards/origins for the shared HE amino-acid/peptide/Biuret acquisition. Explicit HE four-view scopes only; preserve all historical acquisition scopes and foreign course occurrences.')
assert len(ops)==7
put('CAS.seven-selected-WHOLE-goals.AUTHOR.inactive.json',dict(recordKind='bounded-selected-whole-goal-CAS',baseCanonical=pin(L/CP),wholeObjectFingerprintContract='sha256 of UTF8 JSON sort_keys=true compact ensure_ascii=false; structural whole equality mandatory',operations=ops,allOther632WholeGoalsExact=True,ordinaryTextImagesPProfilesCardsExamDataExact=True,newGoals=0,newIndependentVotes=0,HumanApproval=False,HumanTrial=False,M7Claim=False))

vops=[];scope_rows=[]
def descendants(id):
 out={id}
 for c in after[id].get('contains',[]):out |= descendants(c)
 return out
for name,before,vp in zip(names,views,viewplan['views']):
 gk=before['scope']['courseProfile']=='GK';sekii=before['scope']['stage']=='SekII'
 ip=plan['interfaces'][0 if gk else 1]
 remove=set(vp['removeUnsupportedHEAcquisitionTargets'])|set(ip['predictedRemoveDirectIds'])|{ID('96d33fb6'),ID('31148286')}
 remove.add(ID('be848fa1')if gk else ID('50ea4d12'))
 if gk:remove|={ID('bef4c8eb'),ID('413040cd')}
 def expand(id,role,seed):
  if id in remove:return None
  goal=after[id];kids=goal.get('contains',[])
  if not (descendants(id)&remove):
   # Preserve subtree-reference specificity even for leaves. Promoting leaves to
   # direct entries would override existing explicit prerequisiteOnly entries.
   z=dict(kind='canonicalSubtree',goalId=id)
   if role:z['projectionRole']=role
   return z
  children=[x for c in kids if(x:=expand(c,role,seed))is not None]
  return dict(kind='structure',id=before['viewId']+'-bounded-he-'+id,label=goal['title'],children=children)if children else None
 def visit(node):
  if node['kind']=='structure':
   z=copy.deepcopy(node);z['children']=[x for c in node.get('children',[])if(x:=visit(c))is not None]
   return z if z['children']else None
  if node['goalId']in remove:return None
  if node['kind']=='canonicalSubtree'and descendants(node['goalId'])&remove:return expand(node['goalId'],node.get('projectionRole'),node['goalId'])
  z=copy.deepcopy(node)
  if z.get('goalId')==ID('413040cd')and not gk and sekii:z['projectionRole']='prerequisiteOnly'
  return z
 av=copy.deepcopy(before);av['rootNodes']=[x for n in before['rootNodes']if(x:=visit(n))is not None]
 root=av['rootNodes'][0];root['children'].append(dict(kind='structure',id=before['viewId']+'-amino-peptide-compact-recall',label='Aminosäuren und Peptide: kompakter Abruf',children=[dict(kind='goalEntry',goalId=ID('d92b3a20'),projectionRole='target'),dict(kind='goalEntry',goalId=ID('428b4d9c'),projectionRole='target')]))
 if not gk and sekii:
  # A direct support reference wins over any inherited target on the same prior.
  root['children'].append(dict(kind='goalEntry',goalId=ID('413040cd'),projectionRole='prerequisiteOnly',displayLabel='Sek-I-Grundlage: Löslichkeit und Sättigung'))
 path='curricula/DE/Gymnasium/composition-views/chemie/'+name
 op=dict(operation='replace-whole-view-if-before-exact',path=path,input=pin(L/path),before=before,beforeWholeObjectFingerprint=fp(before),after=av,afterWholeObjectFingerprint=fp(av),removedClaimGoalIds=sorted(remove),status='inactive-author-draft')
 vops.append(op);put('AFTER.'+name,av);scope_rows.append(dict(view=name,scope=before['scope'],removedClaimGoalIds=sorted(remove),retainedGKRecyclingHoldGoalId=ID('8721d943')if gk else None))
put('CAS.four-WHOLE-HE-views.AUTHOR.inactive.json',dict(recordKind='four-whole-HE-view-CAS',operations=vops,allOther35ViewsExact=True,sourceAndOwnerOptionalScopeDistinguished=True,newIndependentVotes=0,normalWrites=False))

# One actual shared-aromatic source cell across its seven extant aliases.
# Keep the legitimate detailed sigma-complex partner as partial contribution;
# replace only the mixed halogenation+nitration whole with the narrow shared model.
sid='he-chem-sekii-q2-3-b02-a01-f8de3123';cells=[]
for mp in sorted((L/'curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary').glob('*chemistry*.review.json')):
 d=read(mp);mi=[i for i,r in enumerate(d.get('mappings',[]))if r.get('legacyGoalId')==sid];di=[i for i,r in enumerate(d.get('decisions',[]))if r.get('sourceGoalId')==sid]
 if not mi:continue
 assert len(mi)==2 and len(di)==1
 rows=[d['mappings'][i]for i in mi];decision=d['decisions'][di[0]];nr=copy.deepcopy(rows)
 assert nr[0]['canonicalGoalId']==ID('b98f89e2')and nr[1]['canonicalGoalId']==ID('3dbd84de')
 nr[0]['canonicalGoalId']=ID('17ab1148')
 nd=copy.deepcopy(decision);nd['canonicalGoalIds']=[ID('17ab1148'),ID('3dbd84de')]
 nd['rationale']='AUTHOR proposal: current official Q2.3 commonGK/LK operator is halogenation reaction type and mechanism. Existing17ab with mesomeric-benzene prior carries the generic EAS model and supplied-Br+ case; supplied-NO2+ error transfer does not require nitrating-reagent/condition knowledge. The existing3dbd partial sigma-complex contribution is retained without making its whole LK-tagged unit a GK admission. Mixedb98 whole nitration competence remains valid under its actual LK occurrence; it is not the common whole carrier.'
 # Do not reuse codex/2026-05-11 as approval of a new author decision.
 nd.pop('reviewer',None);nd.pop('reviewedAt',None)
 nd['authorProposal']={'status':'inactive-draft-pending-two-independent-informed-reviews','role':'AUTHOR only; no new source-science vote','historicalWholeDecision':decision,'historicalWholeMappingRows':rows,'officialCourseLevel':'GK_LK','officialTopicOptional':True,'interimOwnerTargetPolicy':'All authored applicable topics first; no official universal duty or stored theme selection inferred.'}
 xp=L/d['sourceExtractionPath'];xd=read(xp);sg=next(g for g in xd['sourceGoals']if(g.get('id')or g.get('sourceGoalId'))==sid)
 cells.append(dict(mapping=pin(mp),sourceExtraction=pin(xp),sourceGoal=sg,mappingRowIndices=mi,decisionIndex=di[0],before=dict(mappings=rows,decision=decision),beforeWholeCellFingerprint=fp(dict(mappings=rows,decision=decision)),after=dict(mappings=nr,decision=nd),afterWholeCellFingerprint=fp(dict(mappings=nr,decision=nd)),preservedPartialPartnerWholeExact=nr[1]==rows[1],allOtherMappingsDecisionsExact=True))
assert len(cells)==7
put('CAS.seven-aliases-ONE-common-aromatic-WHOLE-source-cell.AUTHOR.inactive.json',dict(role='AUTHOR draft cell proposal; source science pending independent review',officialPDF=pin(L/'curricula/DE/Gymnasium/input/HE/upper-secondary/kcgo_chemie_21.04.2026.pdf'),printedPage=43,sourceGoalId=sid,operations=cells,otherSourceCellsIncludingSixBufferAliasesExact=True,noNewReviewerIdentityOrReviewDate=True))

# Bound actual polymer materials and the separate unclosed source finding.
pp=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-final-fiftythree-current402-source-native-independent-a-20261013-v1/inputs/whole74BilingualCases.json'
pc=[x for x in read(pp)['cases']if x.get('goalId')==ID('8721d943')];assert len(pc)==2
put('INPUT.two-FULL-8721-material-cases-solutions-rubrics.readonly.json',dict(source=pin(pp),wholeCases=pc,wholeGoal=by[ID('8721d943')]))

# Full per-ID admission evidence selection: source families are evidence, not an
# automatic claim that a partial source map validates every clause of a whole goal.
sources=[];mapfiles=[];source_by_goal={}
for mp in sorted((L/'curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary').glob('*chemistry*.review.json')):
 md=read(mp);xp=L/md['sourceExtractionPath'];xd=read(xp);sgs={(g.get('id')or g.get('sourceGoalId')):g for g in xd['sourceGoals']};mapfiles.append(pin(mp))
 for row in md['mappings']:
  if row.get('canonicalGoalId')not in by:continue
  s=sgs.get(row.get('legacyGoalId')); 
  if not s:continue
  key=(s.get('id')or s.get('sourceGoalId'),s.get('title'),s.get('courseLevel'),row.get('matchType'))
  target=source_by_goal.setdefault(row['canonicalGoalId'],{})
  target[key]=dict(sourceGoalId=key[0],topicCode=s.get('topicCode'),sourceSpan=s.get('sourceSpan'),operator=s.get('title')or s.get('sourceText'),officialCourse=s.get('courseLevel'),existingMatchType=row.get('matchType'))
families={
 'E':dict(pages=[34,35,36],operator='E.1 redox/electrochemistry; E.2 common strong acid/base,pH,titration; E.3 organics,ethanol and resources'),
 'Q1':dict(pages=[38,39,40],operator='Q1 binding/structure and organic reaction operators; shared versus explicitly increased mechanistic/analytical extensions; optional soap/conservation preserved'),
 'Q2':dict(pages=[42,43,44],operator='Q2 shared biomolecules,polymerisation/polycondensation,plastic properties,mechanical/feedstock recycling; increased hydrolysis/polyaddition/optical and aromatic operators kept separate; optional topics included by owner'),
 'Q3':dict(pages=[46,47,48],operator='Q3 equilibrium,strong acid/base and standard redox common; weak acid/base,curves,KL,Nernst within limits,qualitativeFaraday increased; optional phosphate/rates course columns distinguished'),
 'Q4':dict(pages=[49,50,51],operator='Q4 energy/Hess/calorimetry/collision/RGT common; entropy/Gibbs increased; optional fuels and detergents with course-specific additions'),
 'GLOBAL':dict(pages=[14,15,16,17,18,19,20,21,22,23,24,25,26,34,35,36,38,39,40,42,43,44,46,47,48,49,50,51],operator='Concrete process operator or thematically placed content; exact per-ID direct source cells below take precedence over generic family. A partial source row never automatically validates the full whole-goal operator.'),
}
matrix=[]
for ip in plan['interfaces']:
 course='GK'if ip['goalId']==ID('14577339')else'LK';rows=[]
 for id in after[ip['goalId']]['requires']:
  g=after[id];phase=g.get('dimensionTags',{}).get('phase','GLOBAL');ev=list(source_by_goal.get(id,{}).values())
  reason='Existing curricular operationalisation in the named official source family; retained pending two independent informed reviews. Supplied-material operationalisation and whole-source scope must remain distinguished.'
  status='AUTHOR-retained-source-family-evidence-not-new-vote'
  if id==ID('8721d943')and course=='GK':status='HOLD-whole-operator-broader-than-common';reason='Actual whole/P requires PET ester hydrolysis and PE hydrolysis limit, not supplied in material. HE p43 reserves hydrolysis/value-cycle extension to increased level. Common mechanical/feedstock-to-monomer explanation plus ecology/economy remains a real unclosed duty; no existing narrow whole carrier has been established.'
  if id==ID('17ab1148'):reason=plan['existingOrdinaryContextProposals'][0]['reason']
  if id==ID('9fef5c29'):reason=plan['existingOrdinaryContextProposals'][1]['reason']
  if id==ID('b8d3b453'):reason=plan['existingOrdinaryContextProposals'][2]['reason']
  if id==ID('805a2f58'):status='explicit-prior-not-course-source';reason='Retained actual lower-stage disposal/safety prerequisite; not claimed as a new HE SekII source competency or paper-assessed act.'
  if id==ID('413040cd'):status='explicit-SekI-prior-LK-only';reason='Retained for actual LK solubility-equilibrium foundation, explicitly prior in SekII; no universal GK course assertion.'
  rows.append(dict(goalId=id,title=g['title'],wholeGoalFingerprint=fp(g),directRequires=g.get('requires',[]),tags=g.get('tags',[]),sourceFamily=families.get(phase,families['GLOBAL']),actualExistingDirectSourceCells=ev,authorReason=reason,status=status))
 matrix.append(dict(assessmentGoalId=ip['goalId'],course=course,directCount=len(rows),rows=rows))
put('AUTHOR.two-admission-final-requires-source-family-and-operator-matrix.json',dict(role='AUTHOR evidence matrix, no independent positive source qualification',canonical=pin(L/CP),officialPDF=pin(L/'curricula/DE/Gymnasium/input/HE/upper-secondary/kcgo_chemie_21.04.2026.pdf'),primaryText=pin(P/'PRIMARY.HE-KC-current2026.printed33-52.actual-layout.txt'),existingMappingFiles=mapfiles,interfaces=matrix,sourceRowLimit='Existing aliases/partial rows are evidence to inspect, not an automatic whole-goal/course approval. This package corrects only the finite known boundaries.',wholeRouteRelease=False,HumanApproval=False,HumanTrial=False))

put('INPUT.small-source-and-history-pin-manifest.readonly.json',dict(baseCanonical=pin(L/CP),sealedPreparationSelector=pin(P/'OUTPUTS.finite-readonly-HE-next-author-preparation.selector.json'),sealedPreparation=pin(P/'SEAL.finite-readonly-HE-next-author-preparation.json'),wholePInputs=[pin(P/n)for n in ['INPUT.three-existing-carriers-actual-current-whole-P-profiles.readonly.json','INPUT.two-existing-buffer-whole-P-profiles.readonly.json','INPUT.four-FULL-buffer-cases-materials-solutions-rubrics.readonly.json','INPUT.additional-two-carriers-P-and-four-current-M-records.readonly.json','INPUT.additional-nine-WHOLE-goals-and-seven-current-M-records.readonly.json']],independentOriginalREVISEFirsts=[pin(E/'chemie-HE145-327-current-admission-informed-independent-a-20261016-v1/FIRST.two-current-whole-HE-admissions.independent-a.science.frozen.json'),pin(E/'chemie-HE145-327-current-admission-informed-independent-b-20261016-v1/science.FIRST.two-current-primary-admissions.independent-b.json')],prior17ab39Visibility=pin(P/'READONLY.one-existing-aromatic-17ab-current-and-hypothetical-tag-visibility.json'),prior42839Visibility=pin(P/'READONLY.one-existing-memory428-current-and-hypothetical-course-union-visibility.json'),onlyOutputDirectory=str(O.relative_to(R)),normalWrites=False,newIndependentVotes=0))
print(json.dumps(dict(goalCAS=7,viewCAS=4,aromaticSourceCells=len(cells),admissions=[len(after[x['goalId']]['requires'])for x in plan['interfaces']],recyclingGKHold=True,output=str(O.relative_to(R))),indent=2))
