from importlib.machinery import SourceFileLoader
from pathlib import Path
import json

common = SourceFileLoader('independent_review_common', str(Path(__file__).with_name('review-common.py'))).load_module()
rules = {'alpha':(-4,-2), 'beta_minus':(0,1), 'gamma':(0,0)}
cases = [
    ('A', [(220,90),(216,88),(216,87),(212,85)], ['alpha','beta_minus','alpha']),
    ('B', [(180,72),(180,73),(176,72),(176,73),(176,73)], ['beta_minus','alpha','beta_minus','gamma']),
]
results=[]
for name, printed, types in cases:
    local = [tuple(b-a for a,b in zip(start,end)) for start,end in zip(printed,printed[1:])]
    correct = [printed[0]]
    balances=[]
    for kind in types:
        start=correct[-1]
        end=tuple(a+d for a,d in zip(start,rules[kind]))
        emitted=(4,2) if kind=='alpha' else (0,-1) if kind=='beta_minus' else (0,0)
        assert all(a==b+c for a,b,c in zip(start,end,emitted))
        balances.append({'kind':kind,'parent':start,'daughter':end,'emittedNucleonAndChargeNumbers':emitted})
        correct.append(end)
    validity=[change==rules[kind] for change,kind in zip(local,types)]
    assert [i+1 for i,valid in enumerate(validity) if not valid] == [2]
    results.append({'case':name,'printedLocalDeltas':local,'locallyValid':validity,'correctedChain':correct,'conservationBalances':balances})
assert results[0]['correctedChain']==[(220,90),(216,88),(216,89),(212,87)]
assert results[1]['correctedChain']==[(180,72),(180,73),(176,71),(176,72),(176,72)]
candidate=json.loads((common.AUTHOR/'decay-chains-two-consistency-audits.goal.json').read_bytes())
assert 'γ' not in next(s for s in candidate['examData']['scoring']['steps'] if s['id']=='A-balance')['description']
common.emit_review('decay-chains-two-consistency-audits',
    '123e08d157d17b0950b168cc5f784be6f80bc46d5cd076a3d5918fc2da9f886e',
    '3b50255a-6b01-578b-8f5c-4383536a3221', results, {
        'completeIndependentPerformances':'A and B each require every local arrow, a full globally corrected chain, and all emission balances; either independently covers the target.',
        'DE_EN':'All given chains, changes, correction requirements, seven balances, gamma reasoning and marking rules agree.',
        'physicalValidity':'Examples explicitly formal, not claims of real nuclide existence or decay energetics. Beta charge includes electron and antineutrino; gamma assumes prior excitation. Nucleon count is distinguished from physical mass/rest energy.',
        'rubric':'A-balance correction inspected: it assesses A only; B-balance separately includes gamma. No absent core or absent whole case can pass.',
        'genuineCoverage':'The supplied chains and rules assess checking mass/proton-number changes and consistency, exactly matching the canonical goal. No half-life, nuclide lookup, energy or additional science prerequisite is demanded.',
        'releaseScope':'Approve reviewed content and exact LK course binding; actual source-stage references and route eligibility require separate integration evidence.'}, suffix='-v2')
