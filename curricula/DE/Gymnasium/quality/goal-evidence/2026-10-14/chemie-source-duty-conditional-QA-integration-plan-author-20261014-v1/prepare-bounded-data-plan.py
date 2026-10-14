"""Apache-2.0 helper; generated own curriculum content is CC-BY-4.0.
Inactive author data only. Original peer decisions are preserved, not re-voted.
"""
import copy
import hashlib
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path

R = Path('/home/enpasos/projects/skillpilot')
O = Path(__file__).resolve().parent
E = R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14'
S34 = E/'chemie-current402-no-jurisdiction34-whole-goal-source-and-target-scope-author-20261014-v1'
D34 = E/'chemie-current402-source34-independent-b-postseal-CAS-comparison-20261014-v1'
A34 = E/'chemie-current402-no-jurisdiction34-source-target-scope-independent-a-20261014-v1'
S6 = E/'chemie-six-current-full-source-duty-remediation-author-20261014-v1'
A6 = E/'chemie-six-current-full-source-duty-remediation-independent-a-20261014-v1'
B6 = E/'chemie-six-current-full-source-duty-remediation-independent-b-20261014-v1'
T = E/'chemie-current407-corrected-P8-targeted-native4-technical-20261014-v1'
C = E/'chemie-current407-central-existing262-plus-reviewed-eight-inactive-root-20261014-v1'
ORIG = E/'chemie-six-additional-original-source-obligations-and-BB-BE-target-view-author-20261014-v1'
NI = E/'chemie-NI-corrosion413-existing-whole94-target-preservation-counterreview-followup-root-20261014-v1'
STAMP = datetime.now(timezone.utc).isoformat(timespec='seconds').replace('+00:00','Z')

def load(p): return json.loads(p.read_text())
def rel(p): return str(p.relative_to(R))
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def binding(p): return {'path':rel(p),'sha256':sha(p),'bytes':p.stat().st_size}
def write(n,v):
    p=O/n;p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
    return p

dis = load(D34/'COMPARISON.author-CAS-versus-first-sealed-independent-b.actual.json')
conflicts = [t for t in dis['tuples'] if t['comparisonDecision']=='NOT_APPROVED_REMOVAL_CONFLICTS_WITH_FIRST_B']
assert len(conflicts)==6
author_cas = load(S34/'CAS.18-current-whole-composition-views.author-proposals.actual.json')
a34 = [json.loads(l) for l in (A34/'RECORDS.exact34-whole-goal-source-target-scope.independent-a.actual.jsonl').read_text().splitlines()]
view_rows=[]; restored=[]
for row in author_cas['rows']:
    old=load(R/row['beforeFrozenWholeFile']['path'])
    authored=load(R/row['afterInactiveWholeFile']['path'])
    # A preservation correction to the unactivated author payload, not a KEEP vote.
    keep={t['tuple']['goalId'] for t in conflicts if t['tuple']['jurisdiction']==old['scope']['jurisdiction'] and old['scope']['courseProfile']=='LK'}
    removed={n['goalId'] for n in row['removedExplicitTargetEntries']}
    restore=keep & removed
    acquisition_defer=set()
    if old['scope']['jurisdiction']=='DE-NI' and old['scope']['courseProfile']=='LK' and '413c5ee5-7826-549f-ad76-63743c59b188' in restore:
        # The actual stock check finds this existing global dependency. Retain
        # the existing entry while 413/94 and the unrelated global PLA edge are
        # reconciled; this is not a scientific NI-PLA entitlement.
        acquisition_defer={'0278a515-8990-5a1c-8a1b-a03382a144a3'} & removed
    permitted=removed-restore-acquisition_defer
    candidate=copy.deepcopy(old)
    def prune(nodes):
        output=[]
        for n in nodes:
            if n['kind']=='goalEntry' and n['goalId'] in permitted:continue
            if n['kind']=='structure':n['children']=prune(n['children'])
            output.append(n)
        return output
    candidate['rootNodes']=prune(candidate['rootNodes'])
    if restore:
        out=write('candidate/source34-views/'+Path(row['sourceFile']['path']).name,candidate)
        restored.extend({'jurisdiction':old['scope']['jurisdiction'],'courseProfile':'LK','goalId':i,'viewId':old['viewId']} for i in sorted(restore))
    else:
        assert candidate==authored
        out=R/row['afterInactiveWholeFile']['path']
    view_rows.append({
        'sourceFile':row['sourceFile'],'beforeFrozenWholeFile':row['beforeFrozenWholeFile'],
        'originalAuthorAfterWholeFile':row['afterInactiveWholeFile'],'afterInactiveWholeFile':binding(out),
        'removedExplicitTargetEntries':[n for n in row['removedExplicitTargetEntries'] if n['goalId'] in permitted],
        'disputedLKEntriesPreserved':[n for n in row['removedExplicitTargetEntries'] if n['goalId'] in restore],
        'additionalExistingEntryDeletionDeferredForAcquisition':[n for n in row['removedExplicitTargetEntries'] if n['goalId'] in acquisition_defer],
        'nativeWholeBodiesOrRequiresChanged':False,'prerequisiteOnlyConversions':0,
        'applyState':'unactivated author payload successor; exact A/B scope reconciliation required, no scientific KEEP or default-source grant'
    })
assert len(restored)==6
write('CAS.source34-full18-view-successor-retaining-exact-six-disputed-LK-entries.author-only.json',{
    'schemaVersion':1,'authorOnly':True,'createdAt':STAMP,'rows':view_rows,
    'mechanicalAction':'Exclude the six disputed LK deletions from the old unactivated deletion payload; preserve their exact original entries and order.',
    'restoredEntries':restored,'originalRemovalCount':sum(len(c['removedExplicitTargetEntries']) for c in author_cas['rows']),
    'successorRemovalCount':sum(len(c['removedExplicitTargetEntries']) for c in view_rows),
    'newScientificVotes':0,'originalPeerDecisionsUnchanged':True,'otherRemovalProposalsNotAutomaticallyApproved':True
})
dispute_rows=[]
for b in conflicts:
    a=next(x for x in a34 if (x['goalId'],x['jurisdiction'])==(b['tuple']['goalId'],b['tuple']['jurisdiction']))
    dispute_rows.append({'tuple':b['tuple'],'affectedCourse':'LK','wholeCurrentGoal':a['wholeCurrentGoal'],
        'sealedA':{'sourceContentVerdict':a['sourceContentVerdict'],'scopeProposalVerdict':a['scopeProposalVerdict'],'scientificRationaleDe':a['scientificRationaleDe']},
        'sealedBComparison':b,'newAuthorDisposition':'retain existing LK entry in this inactive candidate while both scientific accounts are reconciled',
        'exactReviewQuestion':'Does the complete goal faithfully operationalize an existing mandatory competence as an author-curated example, or is it an additional universal state obligation? Preserve the whole original source and all other duty partners under either outcome.',
        'newIndependentVote':False})
write('REVIEW-PREPARATION.source34-six-exact-whole-goal-disagreements-and-preservation.json',{
    'schemaVersion':1,'authorOnly':True,'rows':dispute_rows,
    'NI413AdditionalEvidence':binding(NI/'SCIENCE.one-NI-default-scope-HOLD-resolved-by-existing-whole-judgement-partner.actual.json'),
    'NI413Boundary':'Whole94 comparison and actual target retention can support duplicate-target retirement; they do not automatically approve all historical source partners or fix the unrelated global PLA prerequisite.',
    'mustNotDo':['select B by technical majority','require actual human classroom choice for a legitimate curated example inside a compulsory competence','infer a whole optional-block choice from GK/LK','hide duties in prerequisiteOnly','rewrite any sealed peer vote']
})

base_path=T/'candidate/canonical533.current407.corrected-P8-resources.inactive.json'
base=load(base_path);cand=copy.deepcopy(base);by={g['id']:g for g in cand['goals']}
goalcas=load(S6/'candidate/four-new-whole-goals-one-exact-reused-RP-goal-and-three-parent-CAS.author.json')
new_goals=goalcas['newWholeGoals']+goalcas['reusedExactPendingWholeGoals']
assert len(new_goals)==5
for g in new_goals:
    assert g['id'] not in by
    cand['goals'].append(copy.deepcopy(g));by[g['id']]=cand['goals'][-1]
root_id='442c31c5-c561-5c7a-90bb-2335d779175c'
supplement_id=str(uuid.uuid5(uuid.UUID(root_id),'six-original-source-duty-programme-offerings-boundary-20261014-v1'))
root_before=copy.deepcopy(by[root_id]);root_after=copy.deepcopy(root_before)
root_after['contains'].append(supplement_id);root_after['weight']+=5
by[root_id].update(root_after)
supplement={'id':supplement_id,'title':'Quellengebundene Chemie-Ergänzungen','titleEn':'Source-bound chemistry supplements',
 'description':'Vollständige Ergänzungskompetenzen für ausdrücklich benannte Quellen- und Programmkontexte.',
 'descriptionEn':'Complete supplementary competencies for explicitly named source and programme contexts.',
 'weight':5,'tags':['canonical','supplement'],'contains':[g['id'] for g in new_goals],'requires':[],
 'dimensionTags':{'framework':'canonical-gymnasium-chemistry','demandLevel':'AB1','processCompetencies':[],'guidingIdeas':[],'phase':'GLOBAL'},
 'type':'cluster','extendedData':{'applicabilityMappingInheritance':'boundary'}}
cand['goals'].append(supplement);by[supplement_id]=supplement
parent_cas=[{'expectedBeforeWholeGoal':root_before,'proposedAfterWholeGoal':root_after,'allowedChangedFields':['contains','weight'],
 'addedChildren':[supplement_id],'reason':'Keep source6 additions outside existing broadly required content clusters; named static programme views reference complete target leaves directly.'}]
canonical_path=write('candidate/canonical539.current407-plus-five-source-duty-atoms-and-offering-boundary.author-only.json',cand)
write('CAS.current407-plus-exact-five-source6-goals-and-offering-boundary.author-only.json',{
    'schemaVersion':1,'authorOnly':True,'base':binding(base_path),'after':binding(canonical_path),
    'exactOriginalSource6AuthorGoalCAS':binding(S6/'candidate/four-new-whole-goals-one-exact-reused-RP-goal-and-three-parent-CAS.author.json'),
    'fourOriginalNewWholeGoals':goalcas['newWholeGoals'],'oneExactReusedPendingWholeGoal':goalcas['reusedExactPendingWholeGoals'],
    'existingWholeGoalCAS':parent_cas,'allOtherWhole533NodesUnchanged':True,
    'originalThreeSource6ParentCASRetainedForComparisonButNotApplied':goalcas['existingWholeGoalCAS'],
    'newWholeSupplementCluster':supplement,'newClusterSemanticKind':'curricularArea proposal only; no authority row',
    'offeringBoundaryFreshA_BScopeComparisonRequired':True,
    'existingAtomicBodyResourceRequiresAndCurrentE560ChildrenUnchanged':True,
    'oldSource6AtomProposalCount':5,'current407ProspectiveAtomProposalCount':412,
    'currentOperativeDenominatorDelta':0,'newSemanticKindAuthorityRows':0,
    'noCentralConfigNativeD_P_A_M_VOrRegistryReplacement':True
})

sourcecas=load(S6/'candidate/six-full-source-cell-and-seven-carrier-CAS.author.json')
a6=load(A6/'SCIENTIFIC.six-whole-source-duty-content-and-scope.independent-a.actual.json')['individualRecords']
b6=load(B6/'SCIENCE.six-whole-source-duties.independent-b.actual.json')['results']
settings={
 'hb-chemistry-sekii-gyo2022-3-2-e-kunststoffe-020-2d42e381':('compulsory-formation-component',['GK','LK'],'E; source component only, no whole2652 E-phase placement',['formation/linking']),
 'hb-chemistry-sekii-gyo2022-3-3-4-1-kunststoffe-079-7418c562':('optional-whole-deepening',['GK','LK'],'Q; selected silicone deepening',['manufacture','constitution','properties','applications','oils','resins','rubbers']),
 'rp-chem-sekii-rp-ch-sekii-2022-baustein-6-2-003-34dc2823':('optional-WP-LK-additum',['LK'],'selected6.2 Additum',['at least two further dye classes','no required mechanism for those other classes']),
 'rp-chem-sekii-rp-ch-sekii-2022-baustein-13-4-007-4a8501d0':('optional-whole-deepening',['GK','LK'],'selected polyaddition deepening',['mechanism','electron-pair movement','proton transfer','repeated bifunctional linking']),
 'sn-chem-sekii-sn-ch-jahrgangsstufe-11-grundkurs-wb1-011-01-81755658':('optional-whole-Wahlbereich',['GK'],'11; selected photography Wahlbereich1',['AgBr dissolution through complex formation','remaining Ag0 image','separate experiment duty retained']),
 'th-chem-sekii-th-ch-sekii-4-1-8-synthesen-171-03-99c1b0d0':('compulsory-LK-comparison',['LK'],'Q; all three routes required',['radical chain polymerization','polycondensation','polyaddition','compare reaction conditions'])
}
inventory=[];programme_rows=[];unit_rows=[];placement_rows=[];mapping_files={}
for row in sourcecas['wholeCells']:
    sid=row['sourceGoalId'];kind,courses,stage,operators=settings[sid]
    a=next(q for q in a6 if q['sourceGoalId']==sid);b=next(q for q in b6 if q['sourceGoalId']==sid)
    target=row['wholeCarrierCAS'][0]['NONOPERATIVEConditionalAfterWholeDecision']['canonicalGoalIds'][0]
    raw=row['exactWholeInstalledSourceCells'][0]['wholeSourceCell']
    inventory.append({'sourceGoalId':sid,'wholeOriginalSourceCell':raw,
        'wholeOriginalContexts':row['exactWholeInstalledSourceCells'],
        'wholeOriginalAndConditionalCarrierCAS':row['wholeCarrierCAS'],
        'wholeCurrentOrProposedTarget':by[target],
        'boundOriginalAContentDecision':a['sourceContentDecision'],'boundOriginalAChoiceBoundary':a['courseAndChoiceDecision'],
        'boundOriginalBResult':b,'operatorAccounting':operators,'sourceScopeKind':kind,
        'courseEligibility':courses,'exactStageAndSourceCondition':stage,
        'wholeSourceDutyContentFitUsesOriginalSealedA_B':True,
        'wholeTargetEntailedByThisCellAloneAsExplicitlyRecordedByB':b.get('wholeCurrentTargetEntailedByThisCellAlone'),
        'mappingStrengthKeptPartial':True,'operativeSourceClosureClaim':False,
        'programSelectionMeaning':'author-curated static programme proposal; no actual school or class selection asserted',
        'sourceInventoryIncludesOptionalUnselectedDuty':True,
        'reviewNeeded':'Exact data-scope/placement/curation binding A/B comparison, not a new full-content vote or human M7 approval'})
    for c in row['wholeCarrierCAS']:
        p=c['mappingCarrierFrozenBinding']['path'];m=mapping_files.setdefault(p,copy.deepcopy(load(R/p)))
        before=next(d for d in m['decisions'] if d['sourceGoalId']==sid)
        assert before==c['expectedBeforeWholeDecision']
        m['decisions']=[copy.deepcopy(c['NONOPERATIVEConditionalAfterWholeDecision']) if d['sourceGoalId']==sid else d for d in m['decisions']]
        kept=[d for d in m['mappings'] if d.get('legacyGoalId')!=sid]
        kept.extend(copy.deepcopy(c['NONOPERATIVEConditionalAfterAllMappingsForSourceCell']))
        m['mappings']=kept
    if kind=='compulsory-formation-component':continue
    jurisdiction=raw.get('tags',[None])[0]
    jurisdiction={'hb':'DE-HB','rp':'DE-RP','sn':'DE-SN','th':'DE-TH'}[sid.split('-')[0]]
    for course in courses:
        token=target[:8]+'-'+jurisdiction[3:].lower()+'-'+course.lower()
        baseline=R/f'curricula/DE/Gymnasium/composition-views/chemie/de-{jurisdiction[3:].lower()}-{course.lower()}.view.json'
        v=copy.deepcopy(load(baseline))
        v['viewId']='chemistry-source6-static-author-program-'+token
        v['rootNodes'].append({'kind':'structure','id':'source6-module-'+token,
            'label':by[target]['title'],'children':[{'kind':'goalEntry','goalId':target}]})
        out=write('candidate/static-programme-views/'+token+'.view.json',v)
        program='source6-author-program-'+token;module='source6-module-'+token
        unit_rows += [{'id':program,'kind':'program','label':'Chemie – authoriertes Quellenprogramm '+token},
                      {'id':module,'kind':'module','label':by[target]['title'],'parentUnitId':program}]
        placement_rows.append({'goalId':target,'unitId':module,'relation':'primary','context':{'schoolForm':'Gymnasium','jurisdiction':jurisdiction,'stage':'SekII','courseProfile':course}})
        programme_rows.append({'sourceGoalId':sid,'goalId':target,'course':course,'jurisdiction':jurisdiction,
            'sourceScopeKind':kind,'baseWholeView':binding(baseline),'afterInactiveWholeView':binding(out),
            'programmeSelectionIsExplicitAuthorCuration':True,'realClassSelectionClaim':False,
            'availableOnlyInThisUnregisteredStaticReviewDocument':True,
            'viewScopeUsesExistingSupportedKeysOnly':True,'currentOrdinaryDefaultViewUnchanged':True,
            'wholeSourceAndOtherPartnerDutyClosureNotImplied':True,'freshA_BDataScopeComparisonRequired':True})
map_rows=[]
for path,value in mapping_files.items():
    before=R/path;out=write('candidate/source6-mappings/'+before.name,value)
    map_rows.append({'beforeWholeCarrier':binding(before),'afterUnactivatedWholeCarrier':binding(out),
        'applicationScope':'static source6 programme review proposal only; NOT an operative discovery input',
        'partialEdgesUnchangedInStrength':True,'otherWholeSourceDecisionsAndPartnersMustRemainExact':True})
write('SOURCE6.full-original-duty-conditions-partner-unions-and-bound-sealed-decisions.json',{
    'schemaVersion':1,'authorOnly':True,'newScienceVotes':0,'rows':inventory,
    'AWholeScientificRecord':binding(A6/'SCIENTIFIC.six-whole-source-duty-content-and-scope.independent-a.actual.json'),
    'BWholeScientificRecord':binding(B6/'SCIENCE.six-whole-source-duties.independent-b.actual.json'),
    'wholeSourceInventoryNeverFilteredToDefaultTargets':True,'optionalBlanketSkip':False,
    'unconditionalCourseGrant':False,'allSixOriginalWholeCellsAndSevenCarrierUnionsPreserved':True
})
write('CAS.source6-five-full-mapping-carrier-conditional-alternatives.author-only.json',{
    'schemaVersion':1,'authorOnly':True,'rows':map_rows,'distinctWholeCarrierCount':len(map_rows),
    'sourceGoalCount':6,'sourceCarrierCASEntries':7,'operativeActivation':False,
    'purpose':'Concrete exact-data alternatives for scope review. Stock may validate joins; it cannot turn these optional conditions into unconditional source authority.',
    'originalNoOperativeGrantA_BBoundaryPreserved':True
})
write('PROGRAM.source6-seven-static-review-programmes-and-existing-LayerA-fields.author-only.json',{
    'schemaVersion':1,'authorOnly':True,'rows':programme_rows,
    'proposedProgramUnits':unit_rows,'proposedGoalPlacements':placement_rows,
    'programFieldsNotInstalledInCanonical':True,'registeredRuntimeViews':0,
    'sourceChoiceVersusCuration':'Specific examples within a mandatory competence can be curated without a classroom-selection claim. A whole optional module remains conditional on the named programme; GK/LK eligibility alone does not select it.',
    'actualClassroomSelectionEvidence':None,'humanM7ApprovalGateAdded':False,
    'runtimeModuleChoiceFunctionAdded':False,'universalDefaultMandateAdded':False,
    'wholeBaselineViewsRetainedForAcquisitionCheckNotWholeCourseApproval':True
})

orig=load(ORIG/'SCIENTIFIC.six-full-source-duty-fit-and-one-real-missing-operator.author-proposal.json')
write('ORIGINAL-DUTIES.remaining-six-whole-additional-source-cells-and-operators.review-selection.json',{
    'schemaVersion':1,'authorOnly':True,'wholeOriginalAuthorCases':orig['cases'],
    'exactExistingSelector':binding(ORIG/'FINAL.first-author-candidate-selector-and-HOLDs.actual.json'),
    'newSourceContentVotes':0,'wholeOriginalSourceCellsOrParentOperatorsDropped':False,
    'order':['BB/BE LK whole SN-alcohol-monomer mechanism and real prerequisites: exact c307 reuse, obtain the pending source reviews, then graph/native gates','MV/SN/TH real pupil-experiment operators: retain genuine practical duties and scoped acquisition paths','SN8 full parent: preserve needs_review while separately accounting indicator component; no d2-only whole closure'],
    'separateSource34DisputeOrSource6ContentVotesNotReusedAsApprovals':True,
    'PEAuthorCaseNotIndependentlyApprovedHere':True
})
input_paths=[S34/'CAS.18-current-whole-composition-views.author-proposals.actual.json',D34/'COMPARISON.author-CAS-versus-first-sealed-independent-b.actual.json',D34/'SEAL.manifest.json',
 A34/'RECORDS.exact34-whole-goal-source-target-scope.independent-a.actual.jsonl',A34/'SEAL.finite-current402-no-jurisdiction34-independent-a.actual.json',
 S6/'candidate/four-new-whole-goals-one-exact-reused-RP-goal-and-three-parent-CAS.author.json',S6/'candidate/six-full-source-cell-and-seven-carrier-CAS.author.json',S6/'SEAL.finite-six-duty-author.actual.json',
 A6/'SCIENTIFIC.six-whole-source-duty-content-and-scope.independent-a.actual.json',A6/'SEAL.finite-six-whole-source-duty-independent-a.actual.json',
 B6/'SCIENCE.six-whole-source-duties.independent-b.actual.json',B6/'SEAL.finite-six-duty-source-science-independent-b.actual.json',
 base_path,C/'config/chemie-current407-central.inactive.config.json',
 ORIG/'SCIENTIFIC.six-full-source-duty-fit-and-one-real-missing-operator.author-proposal.json',ORIG/'SEAL.finite-six-additional-original-source-duties-first-author.actual.json',
 NI/'SCIENCE.one-NI-default-scope-HOLD-resolved-by-existing-whole-judgement-partner.actual.json',NI/'SEAL.finite-one-NI-corrosion-scope-followup.actual.json',
 R/'app/scripts/config/curriculum-maturity-floor-policy.json',R/'docs/landscape-runtime.schema.json',
 R/'app/scripts/generateCurriculumQualityStatus.ts',R/'app/scripts/applicabilityCompiler.ts',
 R/'app/scripts/compositionViewSourceCoverage.ts',R/'app/src/utils/authoring/compositionViewAuthoring.ts',R/'app/src/hooks/useLandscapes.ts']
for row in view_rows:
    input_paths += [R/row['beforeFrozenWholeFile']['path'],R/row['originalAuthorAfterWholeFile']['path']]
for row in sourcecas['wholeCells']:
    for c in row['exactWholeInstalledSourceCells']:input_paths.append(R/c['sourceExtraction']['path'])
    for c in row['wholeCarrierCAS']:input_paths.append(R/c['mappingCarrierFrozenBinding']['path'])
for subject in ['MATHEMATIK','PHYSIK','BIOLOGIE']:
    input_paths.append(R/f'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_{subject}.de.json')
input_paths=list(dict.fromkeys(input_paths))
write('INPUTS.exact-science-data-stock-code-and-protected-floor-bindings.json',{
    'schemaVersion':1,'selectedAt':STAMP,'bindings':[binding(p) for p in input_paths],
    'currentN5NewPeerScienceRead':False,'newIndependentScienceVoice':False,
    'ownEarlierPECaseAuthorNotReviewedOrApprovedByThisPlan':True
})
print(json.dumps({'source34Views':len(view_rows),'ownNewWholeViews':sum(bool(r['disputedLKEntriesPreserved']) for r in view_rows),'disputedLKRetained':len(restored),'successorTargetDeletionEntries':sum(len(r['removedExplicitTargetEntries']) for r in view_rows),'source6NewAndExactReusedAtoms':len(new_goals),'prospectiveWholeCanonicalNodes':len(cand['goals']),'staticProgrammeViews':len(programme_rows),'source6MappingCarriers':len(map_rows),'inputBindings':len(input_paths)}))
