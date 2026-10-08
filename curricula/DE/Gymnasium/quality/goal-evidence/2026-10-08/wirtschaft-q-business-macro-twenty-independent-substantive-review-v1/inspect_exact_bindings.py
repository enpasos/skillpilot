# Apache-2.0. Actual bounded independent input inspection; no active writes.
import json, hashlib, pathlib, datetime, math

directory = pathlib.Path(__file__).resolve().parent
root = directory.parents[6]
author = directory.parent / 'wirtschaft-q-business-macro-twenty-bilingual-author-v1'
read = lambda p: json.loads(p.read_text())
sha = lambda p: 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()
original = read(author / 'whole-goals.original.json')
translated = read(author / 'whole-goals.candidate.json')
tax_goals = read(author / 'whole-goals.with-individual-taxonomy.candidate.json')
tax = read(author / 'bounded-twenty-whole-goal-demand-level.proposals.author.json')['wholeGoalProposals']
am = read(author / 'semantic-atomicity-memory.proposals.author.actual.json')['goals']
positive = read(author / 'positive.slug-corrected.candidates.v2.json')['goals']
assert len(original) == len(translated) == len(tax_goals) == len(tax) == len(am) == len(positive) == 20
goal_guards = []
for old, en, goal, prop, memory, p in zip(original, translated, tax_goals, tax, am, positive):
    assert len({old['id'], en['id'], goal['id'], prop['goalId'], memory['goalId'], p['goalId']}) == 1
    changed = sorted(k for k in set(old) | set(en) if old.get(k) != en.get(k))
    assert changed == ['descriptionEn', 'titleEn']
    assert prop['wholeUnmodifiedDeEnCandidate'] == en
    assert memory['wholeCurrentCandidate'] == goal
    expected = json.loads(json.dumps(en))
    expected['dimensionTags']['demandLevel'] = prop['candidateDemandLevel']
    assert expected == goal
    assert goal['requires'] == old['requires'] == memory['requiresRetained']
    assert memory['newCardsProposed'] == 0
    assert p['evidenceLevel'] == 'E1' and p['maximumClaimScope'] == 'G1'
    goal_guards.append({'goalId': goal['id'], 'englishOnlyTranslationDelta': changed,
        'onlyTaxonomyDemandLevelAdded': True, 'priorRequiresWholeEqual': True,
        'wholeAuthorAMInputEqual': True, 'authorDemandLevel': prop['candidateDemandLevel'],
        'positiveProfileE1G1': True})

source_proposals = read(author / 'source-course-author-v1/actual-twenty-whole-source-course-proposals.author.json')
source_base = root / source_proposals['sourceBasePath']
source_candidate = author / 'source-course-author-v1/gymnasium/DE_BY_WIRTSCHAFT_UND_RECHT_GYMNASIUM_LEHRPLANPLUS.source-extraction.json'
assert sha(source_base) == source_proposals['sourceBaseSha256']
base = read(source_base); candidate = read(source_candidate)
base_rows = {row['id']: row for row in base['sourceGoals']}
candidate_rows = {row['id']: row for row in candidate['sourceGoals']}
assert len(base_rows) == len(candidate_rows) == 184 and base_rows.keys() == candidate_rows.keys()
changed_ids = {p['sourceGoalId'] for p in source_proposals['wholeProposals']}
assert len(changed_ids) == 20
source_guards = []
for p in source_proposals['wholeProposals']:
    old, new = base_rows[p['sourceGoalId']], candidate_rows[p['sourceGoalId']]
    assert old == p['wholeOriginalSourceRow'] and new == p['wholeCandidateSourceRow']
    fields = sorted(k for k in set(old) | set(new) if old.get(k) != new.get(k))
    assert fields == ['courseLevel', 'tags']
    source_guards.append({'goalId': p['goalId'], 'sourceGoalId': p['sourceGoalId'],
        'onlyCourseMetadataFieldsChanged': fields, 'wholeHistoricalWordsSpansAndParentPreserved': True,
        'proposedCourseLevel': p['proposedCourseLevel']})
assert all(base_rows[k] == candidate_rows[k] for k in base_rows.keys() - changed_ids)
assert {k:v for k,v in base.items() if k != 'sourceGoals'} == {k:v for k,v in candidate.items() if k != 'sourceGoals'}
bindings = read(author / 'actual-twenty-whole-current-BY-source-bindings.input.json')
mapping_path = root / bindings['mappingPath']
assert sha(mapping_path) == bindings['mappingSha256']
assert len(bindings['wholePerGoalSourceInputs']) == 20
for src, goal in zip(bindings['wholePerGoalSourceInputs'], translated):
    assert src['wholeCurrentCanonical'] == goal
    assert src['wholeOriginalSourceRow'] == base_rows[src['wholeOriginalSourceRow']['id']]

cards = read(author / 'actual-three-whole-existing-cards.author-input-and-KEEP-proposals.json')['cards']
public_deck = root / 'app/public/data/de_gymnasium_economics_flashcards_accounting_business_finance.de.json'
curricular_deck = root / 'curricula/DE/Gymnasium/memory-decks/de_gymnasium_economics_flashcards_accounting_business_finance.de.json'
assert public_deck.read_bytes() == curricular_deck.read_bytes()
deck = read(public_deck); by_card = {c['id']: c for c in deck['cards']}
card_guards = []
for p in cards:
    card = p['wholeActualCard']
    assert sha(public_deck) == p['actualDeckSha256']
    assert by_card[card['id']] == card
    assert card['originGoalIds'] == [next(g['goalId'] for g in am if card['id'] in g['existingCardIds'])]
    card_guards.append({'cardId':card['id'], 'wholePhysicalCardEqualToActuallyReadAuthorInput':True,
        'originGoalIds': card['originGoalIds'], 'publicAndCurricularDeckBytesEqual': True})
assert sum(p['authorMemoryDecision'] == 'memory_required' for p in am) == 3
assert sum(p['authorMemoryDecision'] == 'no_memory_needed' for p in am) == 17

numbers = {
    'printingOriginalBreakEven': 8000/(20-12), 'printingOriginalProfitAt1200': (20-12)*1200-8000,
    'printingChangedBreakEven': 12000/(20-10), 'printingChangedProfitAt1200': (20-10)*1200-12000,
    'secondBreakEven': 6000/(16-6), 'secondProfitAt700': (16-6)*700-6000,
    'secondChangedBreakEven': 6000/(18-6), 'secondChangedProfitAt450': (18-6)*450-6000,
    'investmentAStaticMeanSurplus': (80+20-100)/2, 'investmentBStaticMeanSurplus': (20+80-100)/2,
    'investmentANPV': -100+80/1.1+20/(1.1**2), 'investmentBNPV': -100+20/1.1+80/(1.1**2),
    'investmentCStaticMeanSurplus': (60+60-100)/2, 'investmentDStaticMeanSurplusWithResidual': (55+55+20-100)/2,
    'investmentCNPV': -100+60/1.1+60/(1.1**2), 'investmentDNPVWithResidual': -100+55/1.1+(55+20)/(1.1**2),
    'investmentDStaticMeanSurplusWithoutResidual': (55+55-100)/2,
    'investmentDNPVWithoutResidual': -100+55/1.1+55/(1.1**2),
    'firmMarginPct': 20000/200000*100, 'firmLiquidFundsRatioPct':12000/30000*100,
    'sixMonthFirmMarginPct':6000/60000*100, 'twelveMonthFirmMarginPct':12000/240000*100,
    'zeroRevenueMarginDefined':False, 'cafeBreakEven':3000/(8-5), 'cafeProfit':800*(8-5)-3000,
    'repairProfitMarginPct':8000/100000*100, 'repairLiquidFundsRatioPct':5000/20000*100,
    'wageBillAfter5Pct':60*1.05, 'profitResidualAtFixedIncome':100-60*1.05,
    'oneOffBonusWageBill':50+4, 'oneOffBonusProfitResidual':100-50-4,
    'universalGrossBill':100*1000, 'selectiveGrossBill':200*500,
    'oldProcessTime':20+40+10, 'newProcessTime':10+40+10,
    'oldTotalTimeWithUnchangedWait':120+20+40+10, 'newTotalTimeWithUnchangedWait':120+10+40+10,
    'eligibleConsumerPotential':1200*2, 'potentialLessActualVolume':1200*2-1600,
    'totalB2BPotential':50*3*500, 'reachableB2BPotential':30*3*500,
    'closedModelMultiplier':1/(1-.75), 'closedModelNominalDemandChange':10/(1-.75),
    'realIncomeChangePct':(105/110-1)*100,
}
receipt = {'role':'actual_independent_bounded_exact_input_and_calculation_inspection',
    'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'goalGuards':goal_guards, 'sourceGuards':source_guards,
    'otherWholeSourceRowsUnchanged':164, 'all35PassagesAndOtherExtractionFieldsUnchanged':True,
    'wholeMappingInputHashPreserved':True, 'cardGuards':card_guards,
    'actualPublicAndCurricularDeckSha256':sha(public_deck),
    'separateIndependentCalculatorResults':{k:round(v,10) if isinstance(v,float) else v for k,v in numbers.items()},
    'inputFiles':[{'path':str(p.relative_to(root)), 'sha256':sha(p)} for p in [
        author/'whole-goals.original.json', author/'whole-goals.candidate.json',
        author/'whole-goals.with-individual-taxonomy.candidate.json',
        author/'positive.slug-corrected.candidates.v2.json',
        author/'actual-positive-primary-exact-URL-successor-v2.receipt.json',
        author/'bounded-twenty-whole-goal-demand-level.proposals.author.json',
        author/'semantic-atomicity-memory.proposals.author.actual.json',
        author/'actual-twenty-current-original-AM.input.json',
        author/'actual-three-whole-existing-cards.author-input-and-KEEP-proposals.json',
        author/'actual-twenty-whole-current-BY-source-bindings.input.json',
        author/'source-course-author-v1/actual-twenty-whole-source-course-proposals.author.json',
        source_base,source_candidate,mapping_path,public_deck,curricular_deck]],
    'activeWrites':0,'newStrictClosures':0,'nativeRegionalVisibilityApprovalClaimed':False,
    'finalImageBindingClaimed':False,'humanApprovalClaimed':False}
output = directory/'actual-exact-whole-bindings-and-independent-calculations.receipt.json'
with output.open('x') as f:json.dump(receipt,f,ensure_ascii=False,indent=2);f.write('\n')
print(f'PASS20 whole-goal guards, 20 source rows/164 preserved rows/35 passages, 3 physical cards and independent calculations. {sha(output)}')
