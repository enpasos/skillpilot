# Apache-2.0 builder; authored curriculum content CC-BY-4.0. No active/host writes.
import copy,datetime,hashlib,json,os,pathlib,uuid
R=pathlib.Path('/home/enpasos/projects/skillpilot');O=pathlib.Path(__file__).parent;E=O.parent
B=E/'chemie-current407-naturstoffe-seven-paired-resolution-existing274-integration-technical-20261014-v1'
F=E/'chemie-six-additional-original-source-obligations-and-BB-BE-target-view-author-20261014-v1'
L=E/'chemie-BB-BE-LK-full-source-target-and-acquirable-prerequisite-scope-author-20261014-v1'
S6=E/'chemie-source6-five-actual-current412-full-gate-author-20261014-v1'
read=lambda p:json.loads(p.read_text())
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p):return {'path':str(p.relative_to(R)),'sha256':sha(p),'bytes':p.stat().st_size}
def write(n,x):
 p=O/n;p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists(),p;p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return p
def stable_id(s):return str(uuid.uuid5(uuid.NAMESPACE_URL,'https://skillpilot.com/curriculum/canonical/chemistry/'+s))
def hardlink(p,n):q=O/n;assert not q.exists();os.link(p,q);return q
baseline=read(B/'FINAL.native7-existing274-to-actual280-technical-integration.manifest.json');basepath=R/baseline['canonicalCandidate']['path'];base=read(basepath);bi={g['id']:g for g in base['goals']}
hardlink(basepath,'inputs/canonical533.actual280-reference.immutable-hardlink.json');hardlink(R/baseline['semanticCandidate']['path'],'inputs/semantic533.current407.immutable-hardlink.json')
science=read(F/'SCIENTIFIC.six-full-source-duty-fit-and-one-real-missing-operator.author-proposal.json');original=read(F/'inputs/exact-six-whole-source-duty-baseline.json')
assert len(original)==6
sn=copy.deepcopy(science['newGoal']);assert sn['id']=='c3077d95-f3fe-5579-8493-cb92992809c4'and sn['id']not in bi
intro_id=stable_id('sn/seki/acid-everyday-uses-handling-introduction')
intro={'id':intro_id,'shortKey':'canonical_chemistry_sn_seki_acid_everyday_uses_handling_introduction',
 'title':'Saure Alltagslösungen nach Bedeutung, Verwendung und Umgang einordnen',
 'titleEn':'Relate acidic everyday solutions to significance, uses and handling',
 'description':'Die lernende Person kann anhand vorgegebener Beispiele die Bedeutung und Verwendung von Säuren und sauren Lösungen im Alltag beschreiben und passende Umgangsregeln zu bereitgestellten Stoff- und Gefahrenangaben zuordnen.',
 'descriptionEn':'The learner can describe the significance and uses of acids and acidic solutions in everyday life using supplied examples and match appropriate handling rules to supplied substance and hazard information.',
 'weight':1,'type':'atomic','tags':['GK','LK','canonical','SekI'],'contains':[],'requires':[],'examples':[],'resourceLinks':[],
 'dimensionTags':{'framework':'canonical-gymnasium-chemistry','demandLevel':'AB1','processCompetencies':['PK4_KOMMUNIZIEREN'],'guidingIdeas':['BC_AUFBAU'],'phase':'GLOBAL','area':'Säuren und Alltag','topicCode':'CANONICAL.CHEMISTRY.SN.SEKI.ACID.EVERYDAY.USE.HANDLING'},
 'applicability':{'jurisdiction':['DE-SN']},'extendedData':{'applicabilityMappingInheritance':'boundary','authorProposal':{
 'status':'unreviewed_author_candidate','sourceGoalId':'sn-chem-seki-sn-ch-klassenstufe-8-lb5-035-01-d0f98a3c','primaryPhysicalPage':24,'primaryPrintedPage':12,
 'primaryOperator':'Einblick in die Bedeutung und Verwendung sowie den Umgang mit Säuren und deren sauren Lösungen im Alltag gewinnen',
 'sourceOperatorNotRelabelledOptional':True,'rightColumnRemarksRemainRecommendedContextNotDeleted':True,
 'noGlobalPrerequisiteRemoved':True,'whyNoRequires':'Introductory material-based describing and matching; no laboratory execution or unprovided chemical mechanism is assumed. Future independent review may require additional preparation.'}}}
cluster_id=stable_id('source-residual-six-boundary-offering-20261014-v1')
cluster={'id':cluster_id,'title':'Ergänzungen zu ursprünglichen Chemiepflichten','titleEn':'Supplements for original chemistry duties',
 'description':'Quellengebundene Ergänzungen für ausdrücklich benannte Sek-I- und LK-Pflichten.','descriptionEn':'Source-bound supplements for explicitly named lower-secondary and advanced-course duties.',
 'weight':2,'type':'cluster','tags':['canonical','supplement'],'requires':[],'contains':[sn['id'],intro_id],
 'dimensionTags':{'framework':'canonical-gymnasium-chemistry','demandLevel':'AB1','processCompetencies':[],'guidingIdeas':[],'phase':'GLOBAL'},
 'extendedData':{'applicabilityMappingInheritance':'boundary'}}
candidate=copy.deepcopy(base);root=next(g for g in candidate['goals']if g['id']=='442c31c5-c561-5c7a-90bb-2335d779175c');before_root=copy.deepcopy(root)
root['contains'].append(cluster_id);root['weight']+=2;candidate['goals']+=[sn,intro,cluster];ci={g['id']:g for g in candidate['goals']}
assert len(ci)==536
for i,g in bi.items():
 if i!=root['id']:assert g==ci[i]
 assert g.get('requires',[])==ci[i].get('requires',[]) and g.get('resourceLinks',[])==ci[i].get('resourceLinks',[])
cp=write('candidate/canonical536.prospective409-six-residual-duties.author-only.json',candidate)
write('candidate/two-whole-unapproved-atoms-and-source-boundary-cluster.json',{'schemaVersion':1,'authorOnly':True,'reusedExistingPendingWholeAtom':sn,'oneNewNarrowSN8WholeAtom':intro,'boundaryCluster':cluster})
write('inputs/whole-six-original-source-baseline.exact.json',original)
source_cas=[];mapping_cases=[];extraction_change=None
for oldrow in original:
 sid=oldrow['sourceGoalId'];srcPath=R/oldrow['actualSourceCells'][0]['carrier']['path'];src=read(srcPath);sg=next(g for g in src['sourceGoals']if g['id']==sid)
 assert sg==oldrow['actualSourceCells'][0]['wholeSourceCell']
 before=oldrow['actualDecisions'][0];mpath=R/before['carrier']['path'];mapping_cases.append((mpath,sid))
 if sid.startswith(('bb-','be-')):partners=['3899edf4-a809-54b1-8ee7-4e67aa82dc7c','d4928773-3be8-5cf1-907c-ef07c96751e8',sn['id']]
 elif 'klassenstufe-8-lb5-035' in sid:partners=['d2ccd1d5-56f7-583f-9724-e97441367f91',intro_id]
 else:partners=['d2ccd1d5-56f7-583f-9724-e97441367f91']
 actual=[x for x in read(mpath)['mappings']if x['legacyGoalId']==sid]
 oldids={x['canonicalGoalId']for x in actual};assert oldids<=set(partners)
 after_dec=copy.deepcopy(before['wholeDecision']);after_dec.update({'decision':'mapped','canonicalGoalIds':partners,'matchType':'partial',
 'reviewer':'Codex residual-duty AUTHOR; no independent scientific vote','reviewedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'rationale':'INACTIVE AUTHOR CANDIDATE ONLY. Preserve complete original source/course/operator and every old partner; proposed PARTIAL edges teach the bounded whole operator through the explicitly bound whole-goal union. No single source cell grants every target aspect; no new science/gate approval, learner execution or whole-course clearance. SN8 includes its original mandatory meaning/use/handling parent and the pupil indicator investigation; recommended right-column contexts are retained separately.'})
 aftermaps=copy.deepcopy(actual)
 for i in partners:
  if i not in oldids:aftermaps.append({'legacyGoalId':sid,'canonicalGoalId':i,'matchType':'partial','reviewDecisionId':sid})
 source_cas.append({'sourceGoalId':sid,'jurisdiction':oldrow['jurisdiction'],'wholeOriginalSourceCell':sg,'wholeOriginalPrimaryDocuments':oldrow['actualSourceCells'][0]['sourceDocuments'],
  'wholeOriginalDecision':before['wholeDecision'],'wholeProposedDecisionNotApproved':after_dec,'wholeOldMappings':actual,'wholeProposedPARTIALUnion':aftermaps,
  'wholeOldMappedPartnerGoals':[ci[i]for i in sorted(oldids)],'wholeProposedPartnerGoals':[ci[i]for i in partners],
  'wholePartnerUnionTaughtByThisAuthorDesign':True,'wholeSingleCellAuthorizesEveryTargetAspect':False,'independentSourceApproval':False})
 if 'klassenstufe-8-lb5-035'in sid:
  ss=copy.deepcopy(src);aftercell=next(g for g in ss['sourceGoals']if g['id']==sid);oldcell=copy.deepcopy(aftercell)
  leftparent='Einblick in die Bedeutung und Verwendung sowie den Umgang mit Säuren und deren sauren Lösungen im Alltag gewinnen'
  aftercell['sourceText']=leftparent+'; experimentelles Untersuchen von sauren Lösungen mit Indikatoren'
  aftercell.setdefault('metadata',{})['residualDutyWholeOriginalParentAuthorCorrection']={
   'status':'author_proposal_pending_independent_pair','leftColumnFullMandatoryParent':leftparent,'leftColumnMandatorySubordinateOperator':'experimentelles Untersuchen von sauren Lösungen mit Indikatoren',
   'rightColumnRecommendedRemarks':['Einteilung in anorganische und organische Säuren','sauerstoffhaltige anorganische Säuren','Verhaltensregeln','saurer Regen und dessen Wirkungen'],
   'authorityForColumnDistinction':'SN primary physical4: learning goals/contents mandatory; remarks recommended. Parent is retained as mandatory and not reclassified as an optional choice.',
   'legacyOriginalCellAndRawFieldsRetainedExactlyInBeforeCAS':True}
  sx=write('candidate/source-extractions/'+srcPath.name,ss)
  extraction_change={'destination':str(srcPath.relative_to(R)),'before':bind(srcPath),'after':bind(sx),'wholeBeforeCell':oldcell,'wholeAfterCell':aftercell,
   'allowedChangedFields':['sourceText','metadata.residualDutyWholeOriginalParentAuthorCorrection'],'allOtherSourceCellsAndAllOriginalRawFieldsExact':True,
   'noOriginalMandatoryCellRemovedOrRelabelledOptional':True,'why':'The currently consumed literal contains only the nested experiment. The exact original mandatory left-column parent is restored alongside it; legacy broad title/description/raw history are kept.'}
maps=[]
for mpath in sorted({p for p,s in mapping_cases}):
 bm=read(mpath);am=copy.deepcopy(bm);selected=[c for c in source_cas if (mpath,c['sourceGoalId'])in mapping_cases]
 for c in selected:
  sid=c['sourceGoalId'];d=next(d for d in am['decisions']if d['sourceGoalId']==sid);d.clear();d.update(c['wholeProposedDecisionNotApproved'])
  added=[x for x in c['wholeProposedPARTIALUnion']if x not in c['wholeOldMappings']];am['mappings'].extend(added)
 if '/DE-SN/'in str(mpath):am['sourceExtractionPath']=extraction_change['after']['path']
 am['status']='author_candidate_pending_independent_review'
 am['authorCandidateProvenance']={'role':'author_only','independentVotes':0,'sourceDecisionObjectsAreUnactivatedProposals':True,'legacyBeforeStatusPreservedInExactBeforeCarrier':True,'wholeSourceOrTargetApproval':False}
 out=write('candidate/mappings/'+mpath.name,am)
 maps.append({'destination':str(mpath.relative_to(R)),'before':bind(mpath),'afterUnactivatedCandidate':bind(out),'ownedSourceIds':[c['sourceGoalId']for c in selected],
  'allOldMappingRowsPreservedInExactOrder':am['mappings'][:len(bm['mappings'])]==bm['mappings'],'allOtherDecisionsExact':all(d==next(x for x in am['decisions']if x['sourceGoalId']==d['sourceGoalId'])for d in bm['decisions']if d['sourceGoalId']not in{c['sourceGoalId']for c in selected})})
write('CAS.six-whole-source-cells-five-carriers-and-one-parent-literal-restoration.author-only.json',{'schemaVersion':1,'authorOnly':True,'sourceCells':source_cas,'wholeMappingCarriers':maps,'oneSourceExtractionCorrection':extraction_change,'originalIDsAndAllOldPartnersPreserved':True,'independentVotes':0,'sourceM6OrWholeCourseGrant':False})
oldviews=read(F/'CANDIDATE.ten-whole-views-and-real-acquisition-paths.author-only.json')['views'];views=[]
def walk(nodes):
 for n in nodes:
  yield n
  yield from walk(n.get('children',[]))
for v in oldviews:
 path=R/v['destination']
 if not path.exists():continue # R1's two extra stage documents are unregistered proposals, not existing views.
 actual=read(path);assert actual==v['wholeBefore']
 after=copy.deepcopy(v['wholeAfterAuthorCandidate']);added=list(v['addedTargetGoalIds'])
 if 'de-sn-'in path.name:
  target=next(n for n in walk(after['rootNodes'])if n.get('id','').endswith('six-duty-author-acquirable-path'))
  target['children'].append({'kind':'goalEntry','goalId':intro_id,'projectionRole':'target'});added.append(intro_id)
 out=write('candidate/views/'+path.name,after)
 views.append({'destination':str(path.relative_to(R)),'before':bind(path),'afterUnactivatedCandidate':bind(out),'addedTargetIds':added,'removedTargets':[],
  'baseWholeNodesAndRolesRetained':True,'newPrerequisiteOnlyNodes':0,'wholeCourseSourceApproval':False,
  'threePreparationScopeAuthorityHoldsUnchanged':path.name.startswith(('de-mv-','de-sn-','de-th-')),
  'doesNotAlterM311CardsOrAgentAScopeWork':True,'integrationMustAppendTheseEntriesToAnyLaterReviewedViewRatherThanOverwriteItsOtherChanges':True})
write('CAS.eight-existing-whole-view-successors-no-target-removals.author-only.json',{'schemaVersion':1,'authorOnly':True,'views':views,'noOldTargetOrGoalRemoved':True,
 'ordinaryPrerequisitesRemainAcquirableTargetsNotOnlyPrerequisiteOnly':True,'BBBEExistingBroadScopeDebtNotCleared':True,'threePreparationSourceAuthorityHoldsRemain':True,'M311ScopeOwnershipSeparate':True})
write('CAS.small-canonical-delta-and-later-Source6-union-preservation.author-only.json',{'schemaVersion':1,'authorOnly':True,'base':bind(basepath),'after':bind(cp),
 'wholeRootBefore':before_root,'wholeRootAfter':root,'addedWholeGoals':[sn,intro,cluster],'currentAtomicCount':407,'prospectiveAtomicCount':409,'newMeasuredStrictGain':0,
 'allOther532WholeNodesRequiresAndResourcesExact':True,'originalC307StableWholeBodyReused':True,
 'separateSource6FivePacket':bind(S6/'SEAL.finite-source6-five-whole-gate-author-current280-prospective412.actual.json'),
 'laterExactUnionPreparation':'Append only these two atoms and separate two-child boundary cluster to the unmodified539/412 Source6 candidate; this yields542/414. Keep its five whole goals, six added nodes and all source/mapping/view proposals unchanged. No current412/414 authority or central report claimed.'})
prim=read(F/'INPUT.full-primary-originals-and-reading-scope.actual.json')
inputs=[bind(R/'docs/qa-ci/chemie262-five-gate-integration-source-holds-2026-10-14.md'),bind(F/'SCIENTIFIC.six-full-source-duty-fit-and-one-real-missing-operator.author-proposal.json'),bind(F/'FINAL.first-author-candidate-selector-and-HOLDs.actual.json'),bind(L/'SCIENTIFIC.primary-scope-constraints-and-real-unmodeled-duty-HOLD.actual.json'),bind(B/'SEAL.finite-native7-existing274-to-actual280-technical-integration.actual.json'),bind(S6/'SEAL.finite-source6-five-whole-gate-author-current280-prospective412.actual.json'),bind(R/'app/scripts/config/curriculum-maturity-floor-policy.json')]
write('INPUTS.whole-original-six-and-primary-course-contexts.actual.json',{'schemaVersion':1,'selectedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'exactInputs':inputs,'exactOldUncoveredTwelveSelection':bind(R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-current402-source-discovery-and-original-obligations-technical-20261013-v1/NEUTRAL.all12-uncovered-original-full-source-cells-and-current-state-view-bindings.actual.json'),
 'actualBroadArchivedCQRInventory':bind(R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-current402-source-discovery-and-original-obligations-technical-20261013-v1/checks/baseline.stock-source-course-and-visible-coverage.actual.json'),
 'firstAuthorPrimaryBindings':prim,'fullPrimaryContextTextBindings':[bind(p)for p in sorted((F/'primary').glob('*.txt'))]+[bind(L/'primary/BB-BE.complete-original-curricular-authority-and-Q1-Q4.full-layout.txt')],
 'selectedOriginalSourceIds':[c['sourceGoalId']for c in source_cas],'twoUnapprovedCandidateAtomIds':[sn['id'],intro_id],
 'fourIndicatorRowsReuseWholeCurrentGoal':bi['d2ccd1d5-56f7-583f-9724-e97441367f91'],
 'wholeExistingBroaderUseAndSafetyAlternatives':[bi[i]for i in ['0bf26276-2780-506c-ac34-35dd44a29409','4b6d1824-20e4-597e-b639-fae401f740f0','1351706f-4ea6-56e9-951b-87b24cbcdee8']],
 'historicalActual280ReferenceOnlyNotClaimOfCurrent281PMetadata':'All old533 canonical bodies/resources/requires except root are exact; no operative P configuration or record is changed. Main-root current280/281 Pmetadata may advance independently.',
 'source6FiveUnchanged':True,'M311SeparateAgentA':True,'hostWrites':False,'activeWrites':False})
print(json.dumps({'newPendingAtoms':2,'oneReusesStablePendingC307':True,'newSN8IntroId':intro_id,'rawCandidateNodes':536,'prospectiveAtoms':409,'sourceCells':6,'mappingCarriers':5,'views':len(views),'activeWrites':False}))
