# Apache-2.0. Materializes this reviewer's actual independent substantive findings.
import json, hashlib, pathlib, datetime

directory=pathlib.Path(__file__).resolve().parent
root=directory.parents[6]
author=directory.parent/'wirtschaft-q-business-macro-twenty-bilingual-author-v1'
read=lambda p:json.loads(p.read_text())
sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
goals=read(author/'whole-goals.with-individual-taxonomy.candidate.json')
profiles=read(author/'positive.slug-corrected.candidates.v2.json')['goals']
am=read(author/'semantic-atomicity-memory.proposals.author.actual.json')['goals']
native=[json.loads(line) for line in (directory/'native-current-taxonomy-positive-twenty.records.inert.jsonl').read_text().splitlines()]

# Each rationale below is this independent reviewer's decision after reading both
# whole cases, all expectations, both languages and the whole current goal.
items=[
('b215bd82','AB2',
 'Training expenditure can reduce current profit; a dividend distribution is a different cash/equity use and is not itself an expense. The cases keep short and long horizons and conflicting stakeholder objectives explicit, without asserting that expenditure guarantees later success.',
 'Training/cash distribution is transferred to software feature speed versus quality, work pressure and customer trust; changed constraints require new stakeholder reasoning.',
 'One bounded explanation of interacting business objectives. Long horizons qualify the same decision rather than create an independent management skill. Analysis and causal justification fit AB2; a memorized stakeholder list would not show it.'),
('4d64efdb','AB3',
 'The bags case requires weighing procurement/sales choices against environmental, labor and ethical evidence, including unknown lifetime and transport. The refill case conditions environmental benefit on return cycles and cleaning; neither a label nor reuse automatically wins.',
 'The second case changes disposable/durable product evidence into a return-system implementation with cleaning, access and labor criteria.',
 'A single evidenced purchasing/sales judgment integrates the criteria. The learner must justify tradeoffs with incomplete evidence, so AB3 is warranted; a separate recall deck is not needed.'),
('053f1522','AB2',
 'The linear model is explicit and contribution margins are positive. Actual recalculation gives 1000 units/1600 profit, then 1200/0; the other model gives 600/1000 and changed-price 500/-600. Break-even shifts and realistic limits are interpreted rather than just plugged into a formula.',
 'The second case changes price and attainable quantity, rather than repeating only the first fixed/variable-cost change.',
 'Calculating and interpreting one linear break-even model is atomic AB2. Keep the existing narrow formula card; the denominator and positive-contribution applicability are checked in the P performance, without claiming the card alone states every condition.'),
('8e8a672e','AB3',
 'The explicitly defined static average cash surplus is not confused with a complete accounting-profit method. A/B static averages are both 0; discounted results are -10.74/-15.70. C/D are 10/15 and 4.13/11.98 with residual, while D without residual is 5/-4.55. Comparisons acknowledge the no-investment alternative, timing, discount rate, risk and qualitative feasibility.',
 'Cash-flow timing versus residual-value dependency reverses the decision structure; static ranking and dynamic viability cannot be copied mechanically.',
 'A reasoned investment-method comparison at the same decision boundary is AB3, with risk and qualitative factors integral to suitability. Keep the narrow static/dynamic distinction card; it does not substitute for the cash-flow comparison.'),
('15d18bd1','AB2',
 'The financing cases connect payment maturity, expected receipts, liquidity, cost and decision rights. Six-month repayment before eighteen-month receipts is a timing risk; equity participation carries rights/profit costs and a small cash reserve cannot be declared sufficient for large bills.',
 'Loan maturity versus interest is transferred to equity/control versus immediate funding needs, changing the binding financial objective.',
 'A bounded financing-objective analysis fits AB2 because given conditions drive the conclusion. No unconditional financing recommendation or independent recall need is introduced.'),
('9219c58c','AB2',
 'Actual margins/ratios are 10%/40%, then 10% and 5% for different periods. Zero revenue makes the margin undefined, which the spreadsheet guard preserves. Liquid funds/current liabilities alone cannot establish insolvency, and six-/twelve-month amounts cannot be naively compared as equal-length performance.',
 'The transfer changes same-firm financial/earnings ratios into firms with unequal periods and a zero denominator requiring a new spreadsheet judgment.',
 'Computing and interpreting selected financial/earnings indicators is one bounded AB2 analytical task. Keep the existing card as an introductory ratio vocabulary anchor, with its first-hints wording preserved.'),
('da43dd2a','AB2',
 'SWOT and break-even answer different questions; cafe contribution 3 and fixed costs 3000 give 1000 break-even and loss 600 at 800. The repair comparison correctly uses margin 8% and funds ratio 25%, without treating either as a definitive insolvency/success verdict.',
 'Qualitative strategic context plus a cost-volume threshold is transferred to qualitative context plus financial/earnings indicators.',
 'Comparing the informational reach and limits of instruments for a single business case is atomic AB2. It is not a demand to perform every management instrument, and no new deck is necessary.'),
('335dd31a','AB2',
 'The bakery case distinguishes expansion within a market from product development under capacity and evidence limits. The repair case changes geography and differentiation/qualification constraints; strategic labels are not treated as proof of success.',
 'Product/market expansion is transferred to a different service, new regional market and focused differentiation.',
 'Identifying and explaining concrete strategy/management choices is bounded AB2. Managerial responsibility belongs to implementation of that strategy rather than a separate general leadership course; no isolated recall requirement is demonstrated.'),
('764e9eca','AB2',
 'Renovation expenditure can raise demand under spare labor/capacity, with savings/import leakages and feedbacks kept conditional. Training raises potential only after skill formation and complementary conditions; higher productivity does not mechanically imply more jobs.',
 'An immediate demand channel is transferred to a delayed supply/skills channel; an invented universal multiplier or immediate employment guarantee would fail.',
 'Model-based explanation of intended growth/employment policy effects is one AB2 analysis. No new memory anchor is necessary because the causal channels must be applied to supplied constraints.'),
('950caf4f','AB3',
 'Rail investment distinguishes short construction demand from uncertain later productivity and modal-shift effects, with budget and environmental consequences. A subsidy financed by cuts elsewhere requires offsets, windfall and access/lifecycle reasoning rather than counting gross beneficiary spending as net output.',
 'Debt-financed infrastructure is transferred to a budget-neutral technology subsidy, so the financing, additionality and environmental counterfactual all change.',
 'Weighing demand/supply, horizons, public budget and environment around one measure is an integrated AB3 judgment. It is not two unrelated policy goals; memorizing schools would not supply the decision.'),
('94264f00','AB3',
 'The two dated opposing 2026 tariff materials are authentic party positions, not settled outcomes or verified statements about every firm. In the fictional fixed-income model, a 5% rise changes 60/40 to 63/37; a one-off 4-unit bonus changes 50/50 to 54/46. Productivity, prices, investment, demand and employment remain conditional, and a one-year bonus is distinguished from a lasting rise.',
 'A regular pay rise under cost/job-security conflict is transferred to boom profits, heterogeneous firms and one-off participation; the economic mechanism and distribution timing change.',
 'An evidenced judgment comparing current tariff positions through growth, employment and wage/profit shares is AB3. No party argument is silently converted into a factual macro guarantee, and a fixed recall deck would date rapidly.'),
('e20f9304','AB3',
 'The March 2026 health-finance projections of about 15bn in 2027/40bn in 2030 are conditional gaps and commission proposals, not enacted measures. Revenue and avoidable spending options are weighed against access/fairness. The 2025 pension model retains 18.6% through 2027/21.2% by 2039 and expressly remains a model under assumptions rather than a forecast or a newly applicable rate.',
 'Health-system expenditure/revenue pressures are transferred to retirement-system employment/longevity and intergenerational finance, requiring different mechanisms and fairness dimensions.',
 'The selected-insurance future financing/fairness comparison is one AB3 policy judgment; it does not claim every insurance branch or individual entitlement. No dated statutory-rate recall deck is needed.'),
('73ffee8c','AB3',
 'Universal 100x1000 and selective 200x500 both gross 100000, but equal gross expenditure does not establish equal net cost or fairness when taxes/admin/take-up differ. The second declining top-up case varies marginal incentives, non-take-up, risk and progressive-tax interaction without inventing observed behavior.',
 'A gross-budget comparison is transferred to income-contingent phase-out and administrative/behavioral tradeoffs.',
 'Assessing alternative protection models through financing and fairness is integrated AB3, with the declared model boundaries. No model is prescribed as universally preferable and no recall card substitutes for judgment.'),
('489b6d7b','AB2',
 'Order volume, timing, capital tied up and supply risk are analyzed alongside actual traceability/labor evidence. A timber label cannot prove every labor standard; timed bicycle-part procurement requires buffers, disruption and subcontractor evidence.',
 'Bulk furniture procurement is transferred to timing-sensitive components, changing capital/resilience tradeoffs and evidence needs.',
 'A given procurement-system analysis including evidenced standards is AB2; standards are criteria for the same procurement case, not a demand for unrestricted moral judgment. No narrow additional memory prerequisite is identified.'),
('8d44b7e8','AB2',
 'Process time falls 70 to 60; adding an unchanged 120-minute wait yields 190 to 180. The unchanged 40-minute assembly remains a bottleneck, so neither waiting-time elimination nor total lead-time guarantees are inferred. Custom small runs and digital checks trade inventory/setups/flexibility against unproven error reductions.',
 'Removing a local operation-time burden is transferred to customized small-run organization with inventory and setup constraints.',
 'Cost, quality, flexibility, lead time and customer orientation qualify one production-process analysis, which fits AB2. They do not justify splitting into unrelated goals or adding a list-recall card.'),
('59c95c87','AB2',
 'Consumer potential 2400 minus actual total 1600 leaves 800 market units, not guaranteed firm sales. B2B total 75000 and reachable 45000 are distinct populations; observed total volume 30000 and firm sales 5000 cannot be interchanged with potential or guaranteed accessible demand.',
 'Consumer unit potential is transferred to firm-count, purchase-frequency and value-based B2B potential with a narrower reachable population.',
 'Modelled market situation and sales potential are one bounded AB2 analysis. Affordability, reach and competition are explicit assumptions; no live-data completeness or forecast is asserted and no new recall card is needed.'),
('b2419b68','AB2',
 'With the explicitly closed, tax-free, fixed-price, spare-capacity model, c=.75 gives multiplier4 and nominal change40 from spending10. Imports/full construction capacity invalidate an automatic transfer to reality. Skill training20/potential200 after12 months depends on equipment and training and cannot guarantee next-month sales.',
 'A numerical demand model is transferred to a delayed supply/skills model whose usefulness and limits have a different structure.',
 'Explaining a model’s analytical reach and assumptions is atomic AB2; checking the assumptions is part of model use rather than a separate modeling project. No unsupported general multiplier memory goal is created.'),
('f5d76508','AB2',
 'Carbon-price cost and recycling of revenue have different household burdens and uncertain innovation/import-leakage effects; growth is not guaranteed. Restoring nature with a fixed public budget must account for displaced spending, and welfare/nature benefits can fall outside GDP.',
 'A price/incentive instrument is transferred to direct expenditure under a budget constraint, changing distribution, additionality and welfare measurement.',
 'Given-policy growth/environment interactions are analyzed conditionally, rather than demanding an unrestricted normative optimum. This bounded explanatory comparison fits AB2 and needs no detached recall deck.'),
('f70be9a9','AB2',
 'Nominal income105 divided by price index110 gives real income change -4.545%, not merely -5% by subtraction. Firm pass-through and government nominal/indexed commitments differ. Rate changes hit variable/new financing and refinancing at different times; existing fixed loans do not change automatically.',
 'A purchasing-power/price shock is transferred to interest-rate changes with contract and refinancing lags across all three actor groups.',
 'Model-based interpretation of price/interest effects across households, firms and state is integrated AB2; the groups are views on the same shock. No fixed-rate or inflation mnemonic is required.'),
('0242e34e','AB2',
 'The actual 5 June 2025 decision cuts25bp, deposit2% from11 June, with inflation projections2/1.6/2 and growth.9/1.1/1.3. The 6 June 2024 cut reaches3.75% from12 June despite inflation projections2.5/2.2/1.9 and wage pressure. Medium-term2% mandate, uncertainty and separate monetary/real transmission are preserved; an observed projection is not a promised inflation path.',
 'The two historical contemporaneous data situations change the inflation/wage/real-economy constraints around easing, rather than just reskinning a rate number.',
 'Reconstructing a stated policy decision from contemporary data and mandate is bounded AB2. It does not require unrestricted competing-policy design or complete elevated-course monetary evaluation. No current-rate recall card is appropriate.'),
]
assert len(items)==20
decisions=[]
for goal,p,m,n,item in zip(goals,profiles,am,native,items):
    prefix,level,p_reason,transfer,atomic_tax=item
    assert goal['id'].startswith(prefix) and goal['id']==p['goalId']==m['goalId']==n['goalId']
    assert goal['dimensionTags']['demandLevel']==level
    assert len(p['profile']['applicationCaseBriefs'])==2
    decisions.append({'goalId':goal['id'],'wholeGoalDeEnActuallyRead':True,
        'entirePositiveProfileActuallyRead':True,'wholeCasesActuallyRead':2,
        'positiveDecision':'ACCEPT_machine_substantive_candidate_content',
        'positiveReasonEn':p_reason,'genuineChangedTransferReasonEn':transfer,
        'atomicityDecision':'atomic','individualDemandLevelDecision':level,
        'atomicityAndTaxonomyReasonEn':atomic_tax,'memoryDecision':m['authorMemoryDecision'],
        'existingCardIds':m['existingCardIds'],'requiresPreserved':True,
        'nativeGoalFingerprint':n['goalFingerprint'],'nativeProfileFingerprint':n['profileFingerprint'],
        'freshHumanObservationOrHumanApprovalClaim':False,'dissent':[]})

readings=[
('https://www.igmetall.de/tarif/tarifrunden/metall-und-elektro/tarifrunde-metall-und-elektro-2026','23 September 2026; updated 1 October 2026','Actual main article, extracted lines241–293','Demand5%, emphasis on lower pay, employment security and booming-firm profit participation; stakeholder claims, not settlement.'),
('https://www.gesamtmetall.de/wir-haben-nicht-den-luxus-ueber-die-verteilung-von-zuwaechsen-verhandeln-zu-koennen/','23 September 2026','Actual short article extracted lines2–13','Employer cost/site/investment concerns as a stated position, not universal firm facts.'),
('https://www.bundesgesundheitsministerium.de/fileadmin/Dateien/3_Downloads/F/FinanzKommission_Gesundheit/FKG-PM_Bericht_I_30-03-26.pdf','30 March 2026','Actual PDF text extracted lines1–48 across both pages; no physical PDF screenshot inspection claim','Conditional projected15bn/40bn gaps, revenue/spending recommendations and care/fairness implications. Neither the full underlying report nor enacted law claimed.'),
('https://www.bundesgesundheitsministerium.de/finanzierung-gkv','Page dated26 May 2026','Actual complete main explanatory text extracted lines122–172','Contributions, federal tax funding and risk adjustment; no individual2026 rate/entitlement determination.'),
('https://www.bundesregierung.de/breg-de/aktuelles/rentenbericht-2025-2394260','19 November 2025','Actual complete main article extracted lines104–135','18.6% through2027 and21.2% by2039 as a model under assumptions; explicitly no forecast.'),
('https://www.ecb.europa.eu/press/pr/date/2025/html/ecb.mp250605~3b5f67d007.en.html','5 June 2025','Actual relevant decision body extracted lines38–58','Rates/effective date, inflation/growth projections, medium-term2% mandate and data dependence; no fixed future path.'),
('https://www.ecb.europa.eu/press/pr/date/2024/html/ecb.mp240606~2148ecdb3c.en.html','6 June 2024','Actual whole main decision body extracted lines38–61','Rates/effective date, wage/inflation/growth conditions and medium-term mandate; easing does not assert current target attainment.'),
('https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/wirtschaft-und-recht/grundlegend','Current official page retrieved8 October 2026','Actual entire relevant BWL46–111 and VWL116–245 sections','Basic enterprise objectives/procurement/linearBE and intended growth/employment. Basic tariff text omits explicit wage/profit shares; basic social text omits explicit fairness and basic investment is static. These narrower outputs are not full elevated/canonical coverage.'),
('https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/wirtschaft-und-recht/erhoeht','Current official page retrieved8 October 2026','Actual entire relevant BWL51–270, growth272–348 and social379–429 sections; intervening/international content not fully claimed','Fourteen selected elevated raw parents match the full relevant higher-demand features, including dynamic investment, strategy, model limits, short/long perspectives, distribution shares and fairness. Snapshot J12 ordinal labels are not asserted to be current programme section numbers.'),
('https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/13/wirtschaft-und-recht/grundlegend','Current official page retrieved8 October 2026','Actual entire relevant money section160–213','Three actor groups, price/interest effects and reconstructing ECB decisions from contemporary data and mandate.'),
('https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/13/wirtschaft-und-recht/erhoeht','Current official page retrieved8 October 2026','Actual entire relevant money section214–269','Common foundation exists, but higher course asks additional evaluative perspectives; acceptance of the basic goal does not certify full elevated money section.'),
]
cards=[
 {'cardId':'economics-accounting-break-even','decision':'KEEP','reasonEn':'Narrow correct linear-model formula retrieval. The independently inspected P cases explicitly require positive contribution and interpret application limits; the card alone is not full break-even mastery.'},
 {'cardId':'economics-accounting-key-ratios','decision':'KEEP','reasonEn':'Names typical introductory indicators and correctly limits them to first hints. The P cases separately check denominators, periods, ratios and limits of financial diagnoses.'},
 {'cardId':'economics-accounting-investment-methods','decision':'KEEP','reasonEn':'Correct narrow distinction between typical static average values and dynamic timing/discounting. Full independent P comparisons retain method/risk/qualitative limits.'},
]
native_receipt=directory/'native-current-taxonomy-positive-twenty.actual.receipt.json'
guards=directory/'actual-exact-whole-bindings-and-independent-calculations.receipt.json'
assert read(native_receipt)['passed'] and read(native_receipt)['candidateCount']==20
receipt={'schemaVersion':1,'reviewId':'wirtschaft-business-macro-twenty-independent-whole-substantive-20261008-v1',
 'role':'independent_machine_subject_review_of_original_author_candidates_not_description_round_or_human_release',
 'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'reviewer':'/root/economics_visual_memory_audit','provider':'OpenAI','model':'Codex session; exact serving model identifier not exposed',
 'independence':{'positiveAuthor':'/root','thisReviewerAuthoredTheseProfiles':False,
   'thisReviewerAuthoredTheseEnglishTranslations':False,'thisReviewerAuthoredTheseTaxAMSourceProposals':False,
   'otherIndependentPOrDescriptionVerdictsRead':False,'separateVisualizationReviewByOtherAgentNotUsedAsPApproval':True,
   'priorRolesDisclosed':['Independent Economics source/atomicity/memory and earlier package P and D-A reviews; no authorship of this Macro20 content.']},
 'scope':{'wholeBilingualGoals':20,'completePositiveProfiles':20,'completeApplicationCases':40,
   'allPriorAtomicityRecordsRead':20,'allPriorMemoryRecordsRead':20,'individualTaxonomyProposalsRead':20,
   'newAtomicityMemoryProposalsRead':20,'wholePhysicalCardsRead':3,
   'wholeSourceBindingRowsMappingEdgesAndHistoricalDecisionsRead':20,
   'actualCurrentPrimaryTextsIndependentlyRead':7,'actualOfficialCurricularRelevantSectionsIndependentlyRead':4},
 'overallDecision':'ACCEPT20_subject_content_candidates_and_KEEP3_existing_cards_with_separate_current_binding_and_scope_checks_pending',
 'goalDecisions':decisions,'cardDecisions':cards,'actualIndependentPrimaryReadings':[
   {'url':u,'materialDate':d,'actualReadBound':b,'supportedInterpretationAndLimits':s} for u,d,b,s in readings],
 'sourceCourseMetadataDisposition':{'decision':'ACCEPT20_bounded_original_parent_metadata_corrections',
   'counts':{'higherParentToTechnicalLK':14,'basicParentToTechnicalGK_LK':6},
   'basis':'Independent actual relevant official BY12/13 programme reading plus the twenty whole unchanged raw parent/competency texts; no verb-only taxonomy mapping.',
   'sourceWordsAndPassagesChanged':False,'wholeOtherJurisdictionCoverageClaim':False,
   'regionalGKOrLKProjectionApprovalClaim':False,'historicalExactEdgesFreshlyApprovedAsWholeCoverage':False,
   'scopeLimits':['Source-course metadata must be checked by the existing native applicability/compiler integration.',
     'Broad raw canonical GK/LK and all-country tags cannot prove each regional course target is warranted.',
     'Selected basic source texts do not certify the additional higher-demand features of other basic/elevated units.',
     'Snapshot J12/J13 ordinal sourceSpan is preserved as historical extraction identity, not treated as a precise current printed programme unit number.',
     'This review does not ratify complete coverage of all four programmes or unchanged historical mappings outside these twenty rows.']},
 'actualNativeTechnicalReceipts':[{'path':str(p.relative_to(root)),'sha256':sha(p)} for p in [guards,native_receipt,directory/'native-current-taxonomy-positive-twenty.records.inert.jsonl']],
 'findingsRequiringContentChange':[],'inputHashes':read(guards)['inputFiles'],
 'truthfulEvidence':{'profileEvidenceLevel':'E1','maximumClaimScope':'G1',
   'genuineLearnerDemonstrationsObserved':False,'humanTestingOrApprovalObserved':False,
   'closedSchemaNativeTechnicalPass':True,'technicalStatusRemainsInertCandidate':True,
   'needs_human_reviewEnumIsNotClaimedAsAnM7HumanPrerequisite':True,
   'finalImageResourceDigestsInspectedOrBound':False,'currentPositiveGateApprovedRecordWritten':False,
   'independentDescriptionReviewRoundsPerformedForThisPackage':0},
 'pendingIntegration':['Bind positive records against the actual final whole goals, corrected taxonomy, source/course context and independently accepted final images.',
   'Run required native deck-origin/visibility and current applicability/source projection checks; the physical card KEEP decisions are substantive content decisions.',
   'Perform two independent native description rounds on the final rendered current pages; this receipt supplies no D-round approval.',
   'Preserve source/human release gates and previous artifacts without interpreting E1/G1 design profiles as actual learner or human observations.'],
 'activeCanonicalRegistryOrQAChanges':0,'strictProgressAddedByThisReceipt':0,
 'humanReleaseOrFieldTrialClaimed':False}
output=directory/'independent-whole-twenty-positive-atomicity-memory-taxonomy-source-disposition.actual.receipt.json'
with output.open('x') as f:json.dump(receipt,f,ensure_ascii=False,indent=2);f.write('\n')
print(f'Independent whole substantive ACCEPT20/40, KEEP3, no content findings; separate bindings/visibility/D pending. {sha(output)}')
