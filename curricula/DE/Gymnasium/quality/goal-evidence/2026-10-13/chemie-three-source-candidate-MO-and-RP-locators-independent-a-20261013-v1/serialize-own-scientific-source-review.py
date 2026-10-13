"""Write fixed independent source judgments after actual primary/context inspection."""
import hashlib,json
from pathlib import Path
from datetime import datetime,timezone

# Execute from the repository root so every committable reference is relative.
OWN=Path(__file__).resolve().parent.relative_to(Path.cwd())
AUTHOR=OWN.parent/'chemie-three-current-source-absences-primary-author-20261013-v1'
NOW=datetime.now(timezone.utc).isoformat()
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def objsha(x):return 'sha256:'+hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def write(name,value):
    (OWN/name).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
def diff(a,b,path=''):
    if type(a)!=type(b):return [path]
    if isinstance(a,dict):return sum([diff(a.get(k),b.get(k),(path+'.' if path else '')+k)for k in sorted(set(a)|set(b))],[])
    return [path] if a!=b else []

candidate_path=AUTHOR/'CANDIDATE.whole-cell-CAS-and-scoped-locator-repairs.json'
current_path=AUTHOR/'INPUT.current-three-goals-and-coupled-partners.exact.json'
selected_path=AUTHOR/'INPUT.selected-source-cells.after-final-baseline.exact.json'
candidate=json.loads(candidate_path.read_text())
current=json.loads(current_path.read_text())
selected=json.loads(selected_path.read_text())
by_goal={g['id']:g for g in current['goals']}
canonical_path=OWN.parent/'chemie-poly18-aro19-final-current231-source-native-author-root-20261013-v1/candidate/canonical523.current402.normalized-book.inactive.json'
canonical=json.loads(canonical_path.read_text())
canonical_by={g['id']:g for g in canonical['goals']}
assert all(canonical_by[g['id']]==g for g in current['goals'])
assert sha(canonical_path)==current['canonicalWholeInputSha256']
by_cell={w['cell']['sourceGoal']['id']:w for w in selected['cells']}
pdf=Path('curricula/DE/Gymnasium/input/RP/Chemie_Sekundarstufe_II_MSS_2022.pdf')
base={
    'reviewerAgent':'/root/chemie_final_eighteen_atomicity_independent',
    'reviewerRole':'ai','reviewAuthority':'ai_candidate','recordStatus':'candidate',
    'reviewedAt':NOW,'humanApproval':False,'activeIntegrationPerformed':False,
    'wholeSourceOrCourseUnionGranted':False,'actualLearnerPerformanceClaimed':False,
}
captures=[]
for name,course,url,lines in [
    ('BY-C12-grundlegend.official-response.html','native C12 gA','http://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium%20/12/chemie/grundlegend',[1310,1540]),
    ('BY-C12-erhoeht.official-response.html','native C12 eA','http://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium%20/12/chemie/erhoeht',[1400,1650]),
]:
    p=AUTHOR/'primary-source-captures'/name
    captures.append({'path':str(p),'rawSha256':sha(p),'bytes':p.stat().st_size,'course':course,'canonicalUrlInOriginalHtml':url,'fullLB4CompetenciesAndContentsActuallyRead':True,'readRawHtmlLineBounds':lines,'originalBytesChanged':False,'newHttpFetchByThisReviewer':False})
mo=candidate['positiveWholeCellCandidate']
assert mo['before']==by_cell[mo['sourceGoalId']]['cell']
assert objsha(mo['before'])==mo['beforeCellSha256'] and objsha(mo['after'])==mo['afterCellSha256']
assert mo['before']['sourceGoal']==mo['after']['sourceGoal']
f85='f85b4651-50ea-5b42-b193-3465c05257a7'
c0='c0c0f6e4-56be-5196-9408-20efc4504783'
assert mo['after']['decision']['canonicalGoalIds']==[c0,f85]
assert len(mo['after']['sourceGoal']['sourceOccurrences'])==2
mo_record={
    **base,'sourceGoalId':mo['sourceGoalId'],
    'decision':'supported_bounded_MO_component_and_retained_whole_operator_coverage',
    'decisionScope':'The exact proposed whole-cell CAS addition of f85 as a partial component alongside the retained c0 cluster; BY native gA/eA LB4 only',
    'candidateInputPath':str(candidate_path),'candidateInputRawSha256':sha(candidate_path),
    'wholeReviewFileBeforeRawSha256AsBoundByCAS':mo['wholeReviewFileBeforeSha256'],
    'beforeCellSortedJsonSha256':mo['beforeCellSha256'],'afterCellSortedJsonSha256':mo['afterCellSha256'],
    'actualChangedPaths':diff(mo['before'],mo['after']),
    'wholeSourceGoalObjectUnchanged':True,
    'sourceOccurrencesRetainedExactly':mo['after']['sourceGoal']['sourceOccurrences'],
    'retainedCluster':{'goalId':c0,'wholeCurrentObjectSortedJsonSha256':objsha(by_goal[c0]),'contains':by_goal[c0]['contains']},
    'newGoal':{'wholeCurrentGoal':by_goal[f85],'wholeCurrentObjectSortedJsonSha256':objsha(by_goal[f85]),'unchangedFromFrozenCanonical523':True},
    'literalSourceCompetence':[
        'Relate the two-dimensional wave-function representations of H atoms/H2 to spatial probability densities.',
        'Infer existence of simple diatomic second-period molecules or molecular ions from the corresponding energy-level schemes.',
    ],
    'literalLB4ModelContents':[
        'LCAO, orbital conservation, bonding and antibonding molecular orbitals.',
        'Sigma/pi orbital formation and simple-molecule energy-level diagrams, including HOMO/LUMO.',
        'N2 and O2 occur as explicitly offered examples for diatomic bonding; these examples are selectable, not a requirement to cover every named species.',
    ],
    'wordBondOrderLiteralInReviewedLB4':False,
    'inferredOperationalization': 'For a supplied, appropriately labelled MO energy diagram, count electrons occupying bonding and antibonding orbitals and calculate (N_bonding − N_antibonding)/2. This quantifies the net bonding of the expressly prescribed model and makes the same diagram interpretation/existence inference observable. It adds no molecular family, unrelated model or independent comparative-stability topic. The term/formula is didactic operationalization, not an official-source quotation.',
    'independentChemicalCheck': 'Using valence-only diagrams, O2 has eight bonding and four antibonding electrons, giving bond order 2; N2 has eight bonding and two antibonding electrons, giving 3. Including equally occupied core bonding/antibonding orbitals leaves those values unchanged. Correct diagram-specific sigma/pi ordering and electron occupancy are required; positive formal bond order is a result within this simplified model, not an unconditional general stability theorem.',
    'wholeSourceOperatorAndCoupledContextAssessment': 'The retained c0 cluster states both complete literal operators. Its fbc5a920 child covers wave functions/probability density and its 386e28af child covers molecular existence from energy schemes. Adding f85 does not replace or erase either. The adjacent 70bcb6bd LCAO explanation remains a distinct goal; f85 only interprets supplied schemes and quantitatively expresses net bonding. Both native gA and eA source occurrences remain intact. No prerequisite, broad mapping union or cluster inheritance is used to fill f85 itself.',
    'standaloneF85WholeSourceCoverage':False,
    'retainedClusterLiteralOperatorCoverageSupportedByCurrentWholeTexts':True,
    'currentTechnicalLKTagOrOtherGoalSemanticsChanged':False,
    'automaticGKEntitlementOrOtherJurisdictionGrant':False,
    'primaryEvidence':captures,
    'laterAdoptionLimits': 'Root must adopt exactly against these CAS bytes and separately check current projections, all affected source/context tuples and ordinary gates. This source review does not alter the earlier sealed D source-hold judgment or attest D/P/A/M/V completion.',
}

# Actual independent per-cell comments after viewing the original two PDF pages
# and reading every complete coupled DE/EN goal/operator, rather than names only.
P40=[
('Fundamentum for both Grund- and Leistungsfach, P 4 h.','The row is actually the ester-condensation/synthesis/use/nomenclature component. Its existing extracted LK-only course label is narrower than the physical both-course heading. General equations or broader organic clusters alone do not establish its whole performance; the locator-only repair does not resolve allocation/course metadata.'),
('Leistungsfach Additum, P +4 h.','The literal mechanism is carbonyl addition/elimination in ester chemistry. Existing partners focussed on haloalkane substitution, SN1/SN2 and hydrocarbon-halogen reactions are not interchangeable with this acyl mechanism. Their unchanged mappings receive no content clearance.'),
('Leistungsfach Additum, P +4 h; named applications are examples.','Acidic/alkaline hydrolysis and the supplied biodiesel/soap/polyester examples retain reaction-mechanism demands. Broad plastic, detergent and evaluation partners do not alone demonstrate those mechanisms; changing the page does not discharge the whole coupled source.'),
('Gray optional deepening/interlinking panel.','Aldol addition and imine/oxime/hydrazone formation are the specified reactions. Haloalkane substitution or complete azo/triphenylmethane dye synthesis does not establish all those formation mechanisms. No new full-source mapping approval follows.'),
('Gray optional deepening/interlinking panel; derivatives are further possible examples.','Amides, anhydrides and acid chlorides are named with contextual links. Protein/polymer/pharmacy breadth does not establish every derivative operation. This page correction adds no 057 mapping and grants neither a compulsory whole-derivative comparison nor any other-jurisdiction entitlement.'),
('Gray optional deepening/interlinking panel.','The source is carbonyl-activity effects on rate and equilibrium, not unrestricted rate/equilibrium competence. General kinetics, mass action or Le Chatelier targets need an actual carbonyl-specific relationship before whole coverage can be asserted.'),
('Gray optional deepening/interlinking panel.','The row concerns esters of inorganic acids. The current carboxylic-acid/alcohol ester bodies and general organic class goals do not by themselves cover phosphate, sulfate or nitrate ester distinctions.'),
('Gray optional deepening/interlinking panel.','Carbonyl identification by IR is an instrument/model-specific operation. The spectroscopy target supplies an IR component; wet-chemical functional-group tests and generic data handling do not replace it or prove every coupled target.'),
('Gray optional deepening/interlinking panel.','Paracetamol/Aspirin are suggested interlinking examples. The current pharmacy cluster contains many further substances and operations; this row cannot grant its complete research, synthesis, extraction, formulation or health scope.'),
]
P56=[
('Leistungsfach W 5 h, selected elective module content.','Atom orbitals/quantum numbers are not covered by the current SekI laboratory-methods/safety cluster 266a2b2a and its two descendants. Its unchanged exact mapping is not accepted as whole-source coverage.'),
('Leistungsfach W 5 h, selected elective module content.','Valence-bond theory, box diagrams, sigma/pi bonding, hybridisation and delocalisation exceed the currently mapped dye excitation/absorption bodies. The dye cluster does not replace those complete model contents.'),
('Leistungsfach W 5 h, selected elective module content.','Molecular-orbital theory is not a laboratory-methods or safety competence. The existing 266a2b2a mapping remains unsupported as whole coverage; a page repair does not add f85 or approve a new RP source component.'),
('Leistungsfach W 5 h, selected elective module content.','The energy-band model is not present in the current 266a2b2a laboratory-methods/safety cluster. The unchanged mapping receives no model-content clearance.'),
('Gray optional deepening/interlinking panel within the Leistungsfach elective module.','Cyclic hydrocarbons are the named examples. Alcohol classification, petroleum extraction or fuel evaluation does not establish complete cyclic-structure/nomenclature/model coverage. The source figure also contains Ether, absent from the frozen extraction; its whole passage therefore remains incomplete.'),
('Gray optional deepening/interlinking panel within the Leistungsfach elective module.','Gas chromatography is a separation/analysis method. The mapped 580b3616 simple oxygen/carbon-dioxide/hydrogen detection tests are a different performance and do not cover this source method.'),
('Gray optional deepening/interlinking panel within the Leistungsfach elective module.','The source specifies syntheses of selected medicines. The current pharmacy, extraction, dosage-form and ingredient-research partners do not by their titles or source adjacency establish those syntheses. Broad cluster ancestry remains context only.'),
('Gray optional deepening/interlinking panel within the Leistungsfach elective module.','Quantisation of atomic processes and interlinking with physics are not the SekI laboratory-methods/safety operations of 266a2b2a. The existing mapping receives no scientific coverage approval.'),
]
locator_records=[]
for index,x in enumerate(candidate['locatorOnlySourceCells']):
    section=40 if index<9 else 56
    scope,note=(P40[index] if index<9 else P56[index-9])
    assert objsha(x['before'])==x['beforeCellSha256'] and objsha(x['after'])==x['afterCellSha256']
    assert diff(x['before'],x['after'])==['sourceGoal.sourceRef']
    assert x['before']['decision']==x['after']['decision'] and x['before']['mappings']==x['after']['mappings']
    sg=x['after']['sourceGoal']
    locator_records.append({
        **base,'sourceGoalId':x['sourceGoalId'],'decision':'accept_locator_only',
        'beforeCellSortedJsonSha256':x['beforeCellSha256'],'afterCellSortedJsonSha256':x['afterCellSha256'],
        'actualChangedPaths':['sourceGoal.sourceRef'],
        'oldSourceRef':x['before']['sourceGoal']['sourceRef'],'newSourceRef':sg['sourceRef'],
        'actualOriginalPdfPath':str(pdf),'actualOriginalPdfRawSha256':sha(pdf),
        'physicalPageActuallyViewed':section,'printedPageActuallySeen':section,
        'sourceSpan':sg['sourceSpan'],'existingExtractedCourseLevelUnchanged':sg['courseLevel'],
        'physicalPrimaryCourseAndOptionality':scope,
        'boundedReason':'The exact content is physically on this original page; the old 21/29 locator is incorrect. Only the sourceRef field changes. '+note,
        'coupledCanonicalGoalIdsRetainedExactly':x['after']['decision']['canonicalGoalIds'],
        'originalMappingsRetainedExactlyForLocatorRepair':True,
        'wholeSourceMappingScientificApproval':False,
    })
passage_records=[]
for x in candidate['locatorOnlyPassages']:
    assert objsha(x['before'])==x['beforeSha256'] and objsha(x['after'])==x['afterSha256']
    assert diff(x['before'],x['after'])==['page']
    passage_records.append({
        **base,'passageId':x['passageId'],'decision':'accept_page_locator_only',
        'beforePassageSortedJsonSha256':x['beforeSha256'],'afterPassageSortedJsonSha256':x['afterSha256'],
        'oldPage':x['before']['page'],'newPage':x['after']['page'],'actualChangedPaths':['page'],
        'actualOriginalPdfPath':str(pdf),'actualOriginalPdfRawSha256':sha(pdf),
        'physicalPageActuallyViewed':x['after']['page'],'printedPageActuallySeen':x['after']['page'],
        'sourceTextAndSourceGoalIdsUnchanged':True,
        'wholePassageScientificApproval':False,
        'reason': 'The module title and listed statements are on this physical/printed page. Course columns and optional gray-box boundaries remain semantically significant. Correcting the locator does not repair inherited extraction/mapping omissions.'+(' The original p56 gray panel includes Ether, omitted from the frozen passage/source-goal list.' if x['after']['page']==56 else ''),
    })
holds=[]
for prefix,reason in [
    ('057a6826','The unchanged whole goal requires a comparative ordering of chloride/anhydride/ester acyl substitutions with carbonyl/leaving-group justification. RP p40 supplies relevant mechanism context and optional derivative examples, but the submitted candidate only changes existing locators and adds no actual bounded 057 source mapping. This round does not independently approve the full optional comparative operator or all coupled source/course scopes. No keyword-verbatim requirement is imposed; the current hold remains unresolved by this candidate, without redesigning the goal.'),
    ('39c85aa0','The unchanged whole goal includes intramolecular ester formation and conditional formation tendency/relative lactone stability from ring structure and comparison data. HE hydroxy-acid structure and ester-mechanism components can support formation context; they do not by themselves establish the entire ring/stability comparison. Neither the p40/p56 locator repair nor the BY MO source addition supplies that missing whole performance. The hold remains without narrowing the goal.'),
]:
    g=next(g for g in current['goals']if g['id'].startswith(prefix))
    holds.append({**base,'goalId':g['id'],'decision':'hold_not_resolved_by_this_candidate','wholeCurrentGoal':g,'wholeCurrentObjectSortedJsonSha256':objsha(g),'reason':reason,'goalRedesignedOrNarrowed':False,'newPositiveSourceGrant':False})

write('SCIENTIFIC.source-component-and-locator-decisions.actual.json',{
    'schemaVersion':1,**base,
    'inputSeals':[{'path':str(OWN/n),'rawSha256':sha(OWN/n)}for n in ['FIRST.neutral-input-seal.actual.json','FIRST.additional-primary-and-whole-CAS-reference-seal.actual.json']],
    'method':'Independent full primary LB4 competencies/model contents in both exact BY HTML captures; full whole-cell CAS and current bilingual goals/operators; actual RP original PDF p40/p56 and original P/W/optional-content explanation; all 113 coupled DE/EN goal bodies and direct contains/requires/category context read.',
    'authorFitnessOpinionFileOpened':False,'peerOpinionFilesOpened':False,'newRecyclingOrSplitAuthorInputsOpened':False,
    'counts':{'supportedBoundedMOCellAddition':1,'acceptedLocatorOnlySourceCells':17,'acceptedLocatorOnlyPassagePages':2,'unchangedOtherGoalHolds':2},
    'MO':mo_record,'RP_sourceCells':locator_records,'RP_passages':passage_records,'unchangedHolds':holds,
    'RP_primaryBoundaryRule':'Original section 3.1 distinguishes compulsory P, choice-compulsory WP and elective W. P is fully required; W content need not be exhaustive but must have sufficient breadth/depth within chosen modules. Gray deepening/interlinking suggestions are exemplary. P40 has both-course Fundamentum P4 h and LF Additum P+4 h; p56 is LF W5 h. This review creates no universal compulsory entitlement from optional material.',
    'preExistingExtractionFinding':{'originalPdfPhysicalPage':56,'finding':'Ether is visibly listed in the gray optional panel but absent from the frozen 8.7 passage and its eight source goals.','locatorChangeAccepted':True,'wholePassageCompletenessApproved':False,'newRepairApplied':False},
    'coupledContextReceipt':{'current113GoalsInputPath':str(current_path),'rawSha256':sha(current_path),'count':113,'allWholeObjectsIdenticalToFrozenCanonical523':True,'canonical523Path':str(canonical_path),'canonical523RawSha256':sha(canonical_path),'eachCurrentWholeGoalObjectSortedJsonSha256':{g['id']:objsha(g)for g in current['goals']},'all24SelectedSourceCellsReadAsContext':True,'noFullPartnerOrSourceUnionApproval':True},
    'earlierOwnDAndAOutputsChanged':False,'rootIntegrationAndTechnicalTupleChecksRemainSeparate':True,
})
write('exact-input-and-CAS-preservation.actual.json',{
    'checkedAt':NOW,'candidateInputRawSha256':sha(candidate_path),'sourceCellsInputRawSha256':sha(selected_path),
    'currentGoalsInputRawSha256':sha(current_path),'MOCellBeforeAndAfterHashesVerified':True,
    'all17SourceCellsHaveExactlySourceRefChanged':True,'bothPassagesHaveExactlyPageChanged':True,
    'all113WholeCurrentGoalObjectsAndCanonicalHashVerified':True,
    'sourceVerdictsWereActualScientificJudgmentsNotDerivedFromHashChecks':True,
    'sourceOriginalsRewritten':False,'mappingOrActiveCanonicalWritesPerformed':False,
})
print(json.dumps({'ownScientificVerdictFile':str(OWN/'SCIENTIFIC.source-component-and-locator-decisions.actual.json'),'rawSha256':sha(OWN/'SCIENTIFIC.source-component-and-locator-decisions.actual.json'),'counts':{'MO':1,'RP_locator_cells':17,'RP_locator_passages':2,'unresolved_057_39c8':2}},ensure_ascii=False))
