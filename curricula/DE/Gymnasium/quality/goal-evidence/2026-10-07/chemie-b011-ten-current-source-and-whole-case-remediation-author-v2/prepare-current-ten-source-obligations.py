#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Bounded original-source continuation; every proposed change is inactive."""
from pathlib import Path
from datetime import datetime, timezone
import copy, hashlib, json, subprocess, uuid

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[6]
PRIOR = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-8ceb-split-scope-preservation-candidate-v1'
PARENT = '8ceb1749-fce0-584f-a2b8-0a309282329a'
DIST = '5db9ba57-6a80-56db-8b9d-e8ca4ac41855'
CRACK = '7c22f436-e550-5b0b-85ae-a073b0c50418'
INPUTS = {}
def stable(x): return json.dumps(x, ensure_ascii=False, sort_keys=True, separators=(',', ':'))
def sha(x): return hashlib.sha256(x).hexdigest()
def bind(p):
    b = (ROOT / p).read_bytes(); INPUTS[p] = dict(path=p, sha256=sha(b), bytes=len(b)); return INPUTS[p]
def load(p): bind(p); return json.loads((ROOT / p).read_text())
def write(p,x): (HERE / p).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')

registry_path = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
registry = load(registry_path); chem = next(x for x in registry['subjects'] if x['subject']=='chemie')
canon = load(chem['landscapePath']); by = {g['id']:g for g in canon['goals']}
central_path = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-ecology20b-twelve-reviewed-active-integration-root-v1/active-after-twelve-central.actual.json'
central = next(x for x in load(central_path)['subjects'] if x['subject']=='chemie')
strict = set(central['strictCompleteGoalIds'])
old = load(PRIOR+'/canonical-and-dependencies.delta.candidate.json')
for n in ['README.md','remaining-source-scope-preservation.md','positive-evidence.full.candidates.json',
          'remaining-source-scope-preservation.plan.json','source-mappings-and-restrictions.delta.candidate.json',
          'semantic-memory-and-review-impact.candidates.json','image-and-evaluation-preservation.receipt.json']:
    bind(PRIOR+'/'+n)
for r in old['uuidReceipts']:
    assert str(uuid.uuid5(uuid.UUID(r['namespace']),r['seed']))==r['goalId']
assert by[PARENT] == old['parentBefore'], 'The held parent changed substantively; do not blind rebind'
assert DIST not in by and CRACK not in by
bind('curricula/DE/Gymnasium/visualizations/chemie/'+PARENT+'/'+PARENT+'.jpg')
bind('app/public/assets/goal-visualizations/chemie/'+PARENT+'/'+PARENT+'.jpg')
existing_findings=[]
old_review='curricula/DE/Gymnasium/quality/goal-description-review/chemie/rollout-v1/2026-10-04/batch-011-ephase-fuels-energy-current-13-v1'
for round_name in ['round-a','round-b']:
    for path in sorted((ROOT/old_review/round_name/'results').glob('*.records.jsonl')):
        rp=str(path.relative_to(ROOT))
        for line_n,line in enumerate(path.read_text().splitlines(),1):
            r=json.loads(line)
            if r.get('goalId')!=PARENT:continue
            bind(rp)
            assert r['decision']=='split_review'
            for current_key,record_key in [('title','currentTitleDe'),('titleEn','currentTitleEn'),('description','currentDescriptionDe'),('descriptionEn','currentDescriptionEn')]:
                assert by[PARENT][current_key]==r[record_key]
            existing_findings.append(dict(recordPath=rp,recordLine=line_n,wholeRecord=r,
                wholeRecordSha256=sha(stable(r).encode()),sameCurrentWholeDescription=True,
                status='retained genuine prior split finding; historical page/input hashes not promoted to current child approval'))
assert len(existing_findings)==2
write('two-existing-independent-parent-split-findings.unchanged-lineage.json',dict(schemaVersion=1,
    role='preserve actual A/B split findings on unchanged whole parent descriptions; no historical review restart',
    entries=existing_findings,newChildDescriptionApprovals=0,currentPageBindingClaimed=False))

# Continue the actual prior stable semantic proposal. Current whole inputs are new;
# new input bindings are technical routing, not a new scientific decision.
parent_after = copy.deepcopy(by[PARENT]); parent_after['contains']=[DIST,CRACK]
parent_after['requires']=[]; parent_after['type']='cluster'
incoming=[]
for i,g in enumerate(canon['goals']):
    if PARENT not in g.get('requires',[]): continue
    after=copy.deepcopy(g); after['requires']=[j for v in g['requires'] for j in ([DIST,CRACK] if v==PARENT else [v])]
    incoming.append(dict(goalId=g['id'],goalPointer='/goals/'+str(i),wholeGoalBefore=g,wholeGoalAfterCandidate=after,
                         substantiveGoalTextChange=False,dependencyContextChange=True,
                         mandatoryScope='Preserve both prior procedure demands; no narrower prerequisite approval claimed.'))
write('current-whole-split-and-prerequisite-deltas.inactive.json',dict(
    schemaVersion=1,status='inactive_author_continuation_not_independent_approval',
    landscapeBinding=INPUTS[chem['landscapePath']],wholeCurrentParent=by[PARENT],
    parentAfterCandidate=parent_after,childCandidates=old['childCandidates'],uuidReceipts=old['uuidReceipts'],
    incomingRequiresDeltas=incoming,childScienceChange=False,
    sourceBoundary='Old generic source ancestors are not new direct procedure evidence.',
    currentDenominator=central['denominator'],candidateDenominator=central['denominator']+1,
    candidateWholeCanonicalCount=len(canon['goals'])+2,
    independentDPAMVPending=True,activeWrites=False,strictNetIncrease=0))

atlas_path='app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json'
atlas=load(atlas_path); duties=[]
for mp in atlas['mappingPaths']:
    m=json.loads((ROOT/mp).read_text()); selected=[(i,d) for i,d in enumerate(m['decisions']) if PARENT in d.get('canonicalGoalIds',[])]
    if not selected: continue
    bind(mp); ex=load(m['sourceExtractionPath']); source_by={g['id']:g for g in ex['sourceGoals']}
    for i,d in selected:
        g=source_by[d['sourceGoalId']]
        duties.append(dict(jurisdiction=ex.get('jurisdiction'),sourceGoalId=g['id'],mappingPath=mp,
            mappingBinding=INPUTS[mp],decisionIndex=i,wholeOriginalDecision=d,wholeOriginalDecisionSha256=sha(stable(d).encode()),
            sourceExtractionPath=m['sourceExtractionPath'],sourceExtractionBinding=INPUTS[m['sourceExtractionPath']],
            wholeOriginalSourceGoal=g,wholeOriginalSourceGoalSha256=sha(stable(g).encode()),
            wholeOriginalPartnerGoalIds=d['canonicalGoalIds'],
            wholeCurrentPartnerGoals=[by[p] for p in d['canonicalGoalIds']],
            currentStrictPartnerGoalIds=[p for p in d['canonicalGoalIds'] if p in strict],
            wholeCurrentMappingEdges=[e for e in m['mappings'] if e['legacyGoalId']==g['id']]))
assert len(duties)==10
write('ten-current-whole-original-source-duties-and-partners.json',dict(schemaVersion=1,
    role='whole current original duties and partner roles, no approval inferred from old mapping labels',
    currentCentralBinding=INPUTS[central_path],currentChemistryStrict=central['strictComplete'],currentDenominator=central['denominator'],
    currentDirectDuties=10,entries=duties,ancestorScope='No broad-ancestor global review repeated; source boundaries remain held.'))

pages={
    'BB-restriction':('curricula/DE/Gymnasium/input/BB/upper-secondary/Teil_C_RLP_GOST_2022_Chemie.pdf',17,17),
    'BB-procedure':('curricula/DE/Gymnasium/input/BB/upper-secondary/Teil_C_RLP_GOST_2022_Chemie.pdf',23,23),
    'BE-restriction':('curricula/DE/Gymnasium/input/BE/upper-secondary/Teil_C_RLP_GOST_2022_Chemie.pdf',17,17),
    'BE-procedure':('curricula/DE/Gymnasium/input/BE/upper-secondary/Teil_C_RLP_GOST_2022_Chemie.pdf',23,23),
    'HE-lower':('curricula/DE/Gymnasium/input/HE/lower-secondary/g9-chemie.pdf',27,26),
    'HE-upper':('curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-chemie.pdf',36,36),
    'NI':('curricula/DE/Gymnasium/input/NI/upper-secondary/KC-CH_SII_Druck.pdf',16,16)}
readings={}; text_by={}
for key,(p,physical,printed) in pages.items():
    text=subprocess.check_output(['pdftotext','-layout','-f',str(physical),'-l',str(physical),str(ROOT/p),'-'],text=True)
    text_by[key]=text
    readings[key]=dict(primaryBinding=bind(p),physicalPage=physical,printedPage=printed,
        wholePageAuthorRead=True,actualWholePageTextSha256=sha(text.encode()),newThirdPartyFullPageCopy=False)
    if key.endswith('restriction'):
        assert 'Beruflichen Gymnasien' in text and 'kursiv gedruckten' in text and 'Vertiefung' in text
    if key.endswith('procedure'): assert 'Gewinnung von Diesel aus Erdöl; Cracken' in text
    if key=='HE-lower': assert all(s in text for s in ['Siedeanalyse von Benzin','wirtschaftliche Aspekte','Umweltschutz'])
    if key=='HE-upper': assert 'Gewinnung von Kohlenwasserstoffen aus Erdöl: Cracken, fraktionierte Destillation' in text
    if key=='NI': assert 'aus ökonomischer' in text and 'Teilchenebene' in text and 'Veranschau' in text
write('actual-primary-whole-pages-and-new-extraction-residual.json',dict(
    schemaVersion=1,role='actual author source reading, not independent source approval',readings=readings,
    retainedSourceLocatorCorrections={'NI':'Actual filename KC-CH_SII_Druck.pdf; old receipt suffix KC-CH_SII_Druck.pdf is not an extra file obligation.'},
    newlyDetectedHESekIResidual={
        'sourceGoalId':'he-chem-seki-10-4-b01-a01-70b351e5',
        'fact':'The current extracted sourceText/decision ends at the energy comparison. The actual complete row additionally names economic aspects and environmental protection.',
        'wholeOriginalRowPreserved':True,'actualOriginalFullPageRead':True,
        'missingOriginalFacets':['wirtschaftliche Aspekte','Umweltschutz'],
        'oldExtractionOverwritten':False,
        'smallestProposal':'Preserve stable original source ID and prior bytes. A versioned extraction successor must retain these original facets; assign only proved material-use/environment/economic roles and keep the boiling-analysis requirement. Mechanism children alone do not cover this row.'},
    thirdPartyRights='Retained primary PDFs stay in place with their own rights; no new whole third-party page committed.',
    humanApproval=False,humanTrial=False))

assessments=[]
for d in duties:
    sid=d['sourceGoalId']; partners=d['wholeOriginalPartnerGoalIds']
    r=dict(sourceGoalId=sid,jurisdiction=d['jurisdiction'],wholeOriginalPartnerGoalIds=partners,
        everyOriginalPartnerRoleInspected=True,wholeOriginalTextPreserved=True,
        wholeSourceScientificApproval=False,independentRecheckRequired=True)
    if sid.startswith(('bb-','be-')):
        r.update(authorStatus='HOLD_optional_and_school_form_scope',
            originalWholeOperator='Diesel extraction and cracking within an italic possible EP deepening item.',
            actualReadingLocator='Original whole pages17 and23; italic classification reused from the prior actual page inspection.',
            substantiveUnclosedFacet='The selected EP school forms are not a mandatory all-Gymnasium GK/LK scope. Optional metadata alone does not change unconditional target placement.',
            smallestProposal='Retain the full whole source row; propose both mechanism children only as partial optional application witnesses in the evidenced school form. Preserve the real compulsory HC/polymer goals. Independently review operational view semantics before any active replacement.')
    elif sid.startswith('he-chem-seki-'):
        r.update(authorStatus='HOLD_whole_row_boiling_analysis_and_economic_environment_residual',
            originalWholeOperator='Formation, processing/use, both procedures, commercial-gasoline boiling analysis, fuel comparison; actual complete row also economic/environment facets.',
            procedureComponentCandidateGoalIds=[DIST,CRACK],
            existingPartnerRoles={partners[0]:'Current strict resource/extraction/risk goal; it does not explicitly assess geological formation or a gasoline boiling analysis.',
                PARENT:'Two mechanism components only; future children retain that actual scope.',
                '8ece9beb-9458-5ea1-8e45-9be04670f464':'Current strict energetic common-basis comparison; not experimental boiling analysis, whole economic judgment or all use/environment facets.'},
            smallestProposal='Keep the true two-procedure partial union. Restore the missing original economic/environment tail in an inactive versioned extraction proposal. Independently find or author a genuinely bounded boiling-analysis witness and preserve all remaining source components; do not replace the whole row by an exact mechanism mapping.')
    elif sid.startswith('he-chem-sekii-'):
        r.update(authorStatus='bounded_whole_operator_author_candidate',
            originalWholeOperator='Obtain hydrocarbons from petroleum through cracking and fractional distillation.',
            procedureComponentCandidateGoalIds=[DIST,CRACK],wholeOperatorMaterialCaseIds=['distillation-whole-column-supplied-ranges-v2','thermal-cracking-whole-condensed-structures-v2'],
            smallestProposal='Reuse the existing two partial children as the whole-procedure union; source wording Cracken is general, so this is a bounded thermal witness, not a claim that catalytic cracking is the only curriculum meaning.')
    elif '-014-' in sid:
        r.update(authorStatus='HOLD_economic_judgment_partner_unresolved',
            originalWholeOperator='Judge the significance of cracking from an economic perspective.',
            mechanismGoalAloneSufficient=False,
            existingPartnerRoles={
                '1df17884-96ae-57d7-9da9-dbebd082596f':'Current started B008 broad judgment goal, independently held; criteria/alternatives and evidence are not supplied by the two mechanism cases.',
                PARENT:'Mechanism content is contextual knowledge, not the original economic judgment performance.',
                'b95cdf98-fc97-5a94-b133-878922d28156':'Current strict product-use/benefit/ecological assessment; economic reasoning is not automatically proved by its ecological profile.'},
            smallestProposal='Reuse the prior explicit operative removal proposal for the mechanism-only evidence edge and preserve the full economic row on genuine assessment witnesses. The B008 source lane needs a bounded economic whole case with declared quantities/costs, criteria and a justified changed-data decision; do not relabel the mechanism model as economic assessment.')
    else:
        dist_cell='-002-' in sid or '-003-' in sid
        child=DIST if dist_cell else CRACK
        r.update(authorStatus='bounded_whole_operator_author_candidate',
            originalWholeOperator=d['wholeOriginalSourceGoal']['sourceText'],
            procedureComponentCandidateGoalIds=[child],
            wholeOperatorMaterialCaseIds=(['distillation-whole-column-supplied-ranges-v2','distillation-whole-isomer-feed-transfer-v2'] if dist_cell else ['thermal-cracking-whole-condensed-structures-v2','thermal-cracking-whole-fresh-structure-conservation-v2']),
            retainedPartnerRoles={p:(
                'Current held general model-comparison goal. The narrow procedure cases supply/use an actual declared model; they do not close the broader model goal.' if p.startswith('277a') else
                'Current nomenclature/homologous/structure goal retained on its genuine broader duties; naming alone is not the cracking mechanism.' if p.startswith('dd58') else
                'Current strict product-use/ecological goal retained; product use is a context and does not itself explain this procedure.') for p in partners if p!=PARENT},
            smallestProposal='Retain the original whole source text and complete partner tuple as lineage. Independently judge this exact source operator against the concrete whole child cases; if an operative redundant partner is removed, state the exact scientifically narrower reason and preserve all its other genuine obligations. No companion goal approval is inferred.')
    assessments.append(r)
assert sum(x['authorStatus']=='bounded_whole_operator_author_candidate' for x in assessments)==6
write('ten-whole-operator-author-assessments-and-smallest-proposals.json',dict(
    schemaVersion=1,role='science author decisions, not an independent source review',entries=assessments,
    boundedWholeOperatorCandidates=6,genuineHeldSourceRows=4,independentApprovedSourceRows=0,
    countryScope='Other state ancestor/view scope holds from the existing v1 plan remain open. No unproven state operator is manufactured.',
    strictNetIncrease=0,activeBindingRestorations=0))

partner_ids=sorted({p for d in duties for p in d['wholeOriginalPartnerGoalIds'] if p!=PARENT})
retained=[]
for cp in chem['positiveEvidenceConfigPaths']:
    cfg=json.loads((ROOT/cp).read_text()); rp=cfg['reviewPath']
    for n,line in enumerate((ROOT/rp).read_text().splitlines(),1):
        record=json.loads(line)
        if record.get('goalId') in partner_ids and record['goalId'] in strict:
            bind(cp);bind(rp);retained.append(dict(goalId=record['goalId'],configPath=cp,reviewPath=rp,line=n,
                wholeRetainedRecordSha256=sha(stable(record).encode()),wholeRetainedRecord=record,repeatedScientificReview=False))
write('retained-current-strict-partner-whole-goals-and-positive-records.json',dict(schemaVersion=1,
    role='valid untouched current strict evidence reuse; source assignment still inspected independently',
    partnerWholeGoals=[dict(goal=by[p],currentStrict=p in strict) for p in partner_ids],
    retainedPositiveRecords=retained,
    broadHeldPartnerGoalIds=[p for p in partner_ids if p not in strict],
    newPartnerScientificApprovals=0,sourceRoleApprovalInferredFromCount=False))

# Only the old owner's actual whole-reachability/view receipts are reused. The
# future compiled exact effect is checked on current inputs by the native tool.
ledger_path='curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json'
ledger=load(ledger_path); selected_configs=[]
for cp in ledger['activeBatchConfigPaths']:
    cfg=json.loads((ROOT/cp).read_text())
    if PARENT in cfg.get('goalIds',cfg.get('scope',{}).get('goalIds',[])):
        bind(cp);selected_configs.append(cp)
write('current-own-lineage-and-neutral-review-entry.json',dict(schemaVersion=1,
    role='author continuation inputs; independently evaluate findings without inheriting author approval',
    currentReservedGoalId=PARENT,stableChildIds=[DIST,CRACK],currentRelevantLedgerConfigPaths=selected_configs,
    priorPreparedPacket=PRIOR,priorAuthorFilesUnchanged=True,
    substantiveScientificWork=['Four actual whole model materials/task/solution/transfer bodies replace unsupplied diagrams/ranges in prior brief-only cases.',
        'Original full HE10.4 row includes omitted economic/environment tail; boiling-analysis and formation residual remains explicit.',
        'Whole10 source duties and all original partner role boundaries read; six bounded operator candidates and four real holds retained.'],
    bindingOnlyWork=['New current whole canonical/prerequisite/context input routing','Existing valid strict partner P records reused without science review'],
    independentRecheck=['Two whole child DE/EN descriptions with source limits','Four concrete whole cases and profile edges','Six bounded source operators with all original partner roles','Four held rows and remaining state scope; do not infer national source closure','Atomicity and no-memory proposals, plus new-child images/V not supplied here'],
    wholeChildWithAllCountrySourceBindingsReady=False,activeWrites=False,strictNetIncrease=0,
    humanApproval=False,humanTrial=False))
write('declared-current-input-bindings.actual.json',dict(schemaVersion=1,createdAtUTC=datetime.now(timezone.utc).isoformat(),
    role='actual bytes read; bindings are not scientific review',inputBindings=list(INPUTS.values()),selectedGoalIds=[PARENT,DIST,CRACK],activeWrites=False))
print(json.dumps(dict(currentDirectSourceDuties=10,boundedWholeOperatorCandidates=6,realSourceHolds=4,newScientificApprovals=0,
    currentCanonWhole=len(canon['goals']),currentAtomic=central['denominator'],candidateAtomic=central['denominator']+1,
    currentDeclaredInputs=len(INPUTS),activeWrites=False)))
