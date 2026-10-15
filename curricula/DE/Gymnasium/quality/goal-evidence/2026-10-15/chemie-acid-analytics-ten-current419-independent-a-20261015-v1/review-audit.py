#!/usr/bin/env python3
"""Apache-2.0. Bounded review integrity/arithmetic, never scientific approval."""
import hashlib
import json
import math
from datetime import datetime, timezone
from pathlib import Path

REPO = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
AUTHOR = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-acid-analytics-remaining-ten-whole-material-and-profile-author-20261014-v1'
CURRENT = AUTHOR.parent / 'chemie-acid7-two-description-one-image-current419-native-successor-technical-20261014-v3/candidate/canonical551.current419.three-author-deltas.exact.json'

def digest_bytes(data):
    return 'sha256:' + hashlib.sha256(data).hexdigest()

def object_hash(data):
    return digest_bytes(json.dumps(data, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode())

def binding(path):
    path = Path(path)
    return {'path': str(path.relative_to(REPO)), 'sha256': digest_bytes(path.read_bytes()), 'bytes': path.stat().st_size}

def read(name):
    return json.loads((AUTHOR / name).read_text())

def save(name, data):
    path = OUT / name
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    json.loads(path.read_text())

def main():
    errors = []
    seal = read('FILES.finite-author-ten.seal.json')
    sealed = []
    for expected in seal['files']:
        path = AUTHOR / expected['path']
        actual = binding(path)
        ok = actual['sha256'] == expected['sha256'] and actual['bytes'] == expected['bytes']
        sealed.append({**actual, 'matchesAuthorFiniteSeal': ok})
        if not ok:
            errors.append('author-seal:' + expected['path'])
    external = []
    for expected in read('BINDINGS.external-unchanged-inputs.actual.json')['externalBindings']:
        path = REPO / expected['path']
        actual = binding(path)
        ok = actual['sha256'] == expected['sha256']
        external.append({**actual, 'matchesHistoricalAuthorBinding': ok, 'authorSha256': expected['sha256']})
        if not ok:
            errors.append('external-drift:' + expected['path'])
    old = {g['id']: g for g in read('inputs/canonical551.current419.exact.json')['goals']}
    new = {g['id']: g for g in json.loads(CURRENT.read_text())['goals']}
    goals = read('inputs/whole-ten-current-goals.exact.json')['goals']
    cases = read('materials/twenty-complete-DEEN-cases.author.json')['cases']
    profiles = read('author-profiles.ten.raw.json')['profiles']
    mv = read('inputs/existing-ten-current-M-V-and-open-D-P-A.exact-joins.json')
    source = read('inputs/existing-ten-source-scope-witnesses.history-and-current-identity.json')
    bycase = {c['id'].lower(): c for c in cases}
    own = {g['id'] for g in goals}
    context = {i for g in goals for i in g['requires']}
    context |= {g['id'] for g in new.values() if set(g.get('contains', [])) & own}
    context |= {g['id'] for g in new.values() if any(k in g.get('title', '').lower() for k in ['puffer', 'titration', 'photometr', 'fotometr', 'polyprot', 'protolys', 'säure-base', 'säuren und basen'])}
    context |= {'2a8a13b8-f96a-5ff1-92fa-fe6c19973a0e', '49b13b33-34b7-5e4e-861c-b21082cb9922', '91238ba1-5c63-50c7-a4fd-9bbe492c6b61', 'cf2631d9-da24-50e8-9e50-db625e6efaad', '7d9fcc7f-1c20-5d5b-9cf6-05f6b624dab6', '9e3fae29-84d5-5600-bfb3-82d49ea3f1b5', '9fc800d1-92d1-5ef6-81c1-33960ae034dd'}
    whole_goals = [{'goalId': g['id'], 'authorWholeHash': object_hash(g), 'currentWholeHash': object_hash(new[g['id']]), 'unchanged': g == new[g['id']]} for g in goals]
    assert all(g['unchanged'] for g in whole_goals)
    assert binding(CURRENT)['sha256'] == 'sha256:b07e023f03a7c573e2b823c491e030c0ca1b5d530b17116de2b4a3d8010d0339'
    parity = []
    for p in profiles:
        for b in p['profile']['applicationCaseBriefs']:
            c = bycase[b['id']]
            parity.append({'caseId': c['id'], 'wholeCaseHash': object_hash(c), 'profileExpectedPerformanceEqualsFullModelDe': b['expectedPerformanceDe'] == c['modelAnswerDe'], 'profileExpectedPerformanceEqualsFullModelEn': b['expectedPerformanceEn'] == c['modelAnswerEn']})
    assert all(x['profileExpectedPerformanceEqualsFullModelDe'] and x['profileExpectedPerformanceEqualsFullModelEn'] for x in parity)
    mvreuse = []
    actual_m_rows = [json.loads(line) for line in (REPO / mv['wholeMemoryContainerBinding']['path']).read_text().splitlines() if line.strip()]
    for row in mv['rows']:
        checks = []
        for asset in row['actualUnchangedAssets']:
            actual = binding(REPO / asset['path'])
            checks.append({**actual, 'matchesExistingAIApprovedAsset': actual['sha256'] == row['existingVisualizationRecord']['aiApprovedAssetSha256']})
        mem = row['existingMemoryRecord']
        mvreuse.append({'goalId': row['goalId'], 'memoryStatus': mem['status'], 'sameExactMemoryRecordPresentInExistingPhysicalLedger': mem in actual_m_rows, 'memoryFingerprintMatches': mem['fingerprint'] == row['expectedCurrentMemoryFingerprint'], 'assets': checks, 'newMVVote': False})
    changed = [{'goalId': i, 'oldWholeHash': object_hash(old[i]), 'currentWholeHash': object_hash(new[i]), 'changedFields': [k for k in new[i] if old[i].get(k) != new[i].get(k)]} for i in new if old.get(i) != new[i]]
    source_bindings = []
    for row in source['sourceAndMappingByteIdentity']:
        actual = binding(REPO / row['path'])
        source_bindings.append({**actual, 'matchesHistoricalSourceBytes': actual['sha256'] == row['historicalSha256']})
    partial_credit = sorted({(x['partialCreditDe'], x['partialCreditEn']) for c in cases for x in c['rubric']})
    save('CHECK.independent-input-integrity.actual.json', {
        'schemaVersion': 1, 'atUTC': datetime.now(timezone.utc).isoformat(),
        'role': 'Independent reviewer A integrity only; decisions are recorded separately',
        'finiteAuthorFiles': sealed, 'externalPhysicalSources': external,
        'currentCanonical': binding(CURRENT), 'tenWholeGoalComparisons': whole_goals,
        'oldToCurrentContextChanges': changed,
        'wholeContextObjects': [{'goalId': i, 'wholeObjectSha256': object_hash(new[i]), 'assessmentExcludedFromContentAtomicity': 'examData' in new[i]} for i in sorted(context - own)],
        'caseBriefModelParity': parity, 'sharedPartialCreditTexts': partial_credit,
        'existingMVReuse': mvreuse, 'sourcePhysicalIdentities': source_bindings,
        'sourceRows': len(source['selectedWholeSourceGoalRows']), 'mappingRows': len(source['selectedWholeMappingRows']),
        'errors': errors, 'freshVisualReviewClaimed': False,
        'learnerExecutions': 0, 'humanApproval': False, 'humanTrial': False,
        'formalDRecords': 0, 'strictGain': 0})

    calculations = []
    def check(case, name, actual, expected, tolerance=0.0006):
        ok = abs(actual - expected) <= tolerance
        calculations.append({'caseId': case, 'quantity': name, 'independentValue': actual, 'authorDisplayedValue': expected, 'absoluteToleranceForDisplay': tolerance, 'pass': ok})
        assert ok, (case, name, actual, expected)
    log = math.log10
    check('T01-C1', 'total-mmol-L', (19.8+19.9+19.85)/3*.01/.05 - .1*.01/.05, 3.95)
    check('T01-C1', 'reference-recovery-percent', ((15.12-.10)*.01/.05)/3*100, 100.13, .006)
    check('T01-C2', 'original-mmol-L', (4.8-.1)*.01/.025*4, 7.52)
    check('T01-C2', 'spike-recovery-percent', (9.82-4.8)*.01/.05*100, 100.4)
    check('T02-C1', 'slope-L-mg', (.420-.020)/8, .05)
    check('T02-C1', 'original-mg-L', ((.273+.275+.277)/3-.020)/.05*5, 25.5)
    check('T02-C1', 'control-relative-error-percent', (((.322-.020)/.05)/6-1)*100, .67, .006)
    check('T02-C2', 'slope-L-mg', (.610-.010)/1.5, .4)
    check('T02-C2', 'upper-standard-linear-prediction', .4*2+.01, .81)
    check('T02-C2', 'original-mg-L', (.510-.010)/.4*4, 5)
    check('T02-C2', 'control-relative-error-percent', (((.450-.010)/.4)-1)*100, 10)
    check('T03-C1', 'initial-pH', 7.2+log(20/10), 7.501)
    check('T03-C1', 'post-acid-pH', 7.2+log((20-5)/(10+5)), 7.2)
    ka = 10**-2.35
    cstar = .0025/.075
    h = (-(ka+cstar)+math.sqrt((ka+cstar)**2+4*ka*cstar))/2
    check('T03-C2', 'first-half-h-mol-L', h, .00359675, .00000001)
    check('T03-C2', 'first-half-pH', -log(h), 2.444)
    check('T03-C2', 'h-over-cstar', h/cstar, .108)
    check('T03-C2', 'first-equivalence-ampholyte-pH', (2.35+9.6)/2, 5.975)
    check('T04-C1', 'inline-50mM-phosphate-after-1mM-acid-pH', 7.2+log((50*10**-.2/(1+10**-.2)-1)/(50/(1+10**-.2)+1)), 6.96, .006)
    check('T05-C1', 'half-pH', -log((.0025-.00125)/.0375), 1.477)
    check('T05-C1', 'excess-pH', 14+log((.003-.0025)/.055), 11.959)
    check('T05-C1', 'neutral-new-pKw', 13.20/2, 6.6)
    ka2=10**-4.76
    check('T05-C2', 'initial-pH-sqrt-approx', -log(math.sqrt(ka2*.1)), 2.880)
    check('T05-C2', 'equivalence-pH-sqrt-approx', 14+log(math.sqrt(1e-14/ka2*.05)), 8.729)
    check('T06-C1', 'initial-pH', 4.76+log(40/10), 5.362)
    check('T06-C1', 'post-acid-pH', 4.76+log(35/15), 5.128)
    check('T06-C2', 'initial-pH', 9.25+log(25/50), 8.949)
    check('T06-C2', 'post-base-pH', 9.25+log(35/40), 9.192)
    check('T08-C2', 'weak-base-initial-pH', 14+log(math.sqrt(10**-4.75*.1)), 11.13, .006)
    check('T08-C2', 'weak-base-equivalence-pH', -log(math.sqrt(10**-9.25*.05)), 5.28, .006)
    for case,pka,pH,vol,totalc,load,limit,base in [('T10-C1',7.20,7.40,.5,.1,.005,7.30,False),('T10-C2',4.76,5.00,.25,.2,.004,5.20,True)]:
        ratio=10**(pH-pka); total=vol*totalc; acid=total/(1+ratio); bas=total-acid
        beta=math.log(10)*totalc*ratio/(1+ratio)**2
        phafter=pka+log((bas+load if base else bas-load)/(acid-load if base else acid+load))
        rlimit=10**(limit-pka)
        limitload=acid-total/(1+rlimit) if base else bas-total*rlimit/(1+rlimit)
        if not base:
            check(case,'acid-mmol',acid*1000,19.343,.002)
            check(case,'base-mmol',bas*1000,30.657,.002)
            check(case,'beta-mol-L-pH',beta,.05462,.000006)
            check(case,'post-load-pH',phafter,7.223)
            check(case,'finite-limit-mmol',limitload*1000,2.791,.002)
            check(case,'minimum-concentration-mol-L',totalc*load/limitload,.1791,.00006)
        else:
            check(case,'acid-mmol',acid*1000,18.263,.002)
            check(case,'base-mmol',bas*1000,31.737,.002)
            check(case,'beta-mol-L-pH',beta,.1068,.00006)
            check(case,'betaV-mol-pH',beta*vol,.02669,.000006)
            check(case,'post-load-pH',phafter,5.159)
            check(case,'finite-limit-mmol',limitload*1000,4.945,.002)
            check(case,'double-volume-finite-limit-mmol',limitload*2000,9.89,.004)
    save('CHECK.independent-calculations.actual.json', {'schemaVersion':1,'atUTC':datetime.now(timezone.utc).isoformat(),'role':'Reviewer A calculations derived separately from problem data, not author numeric PASS','modelBoundary':'Ideal teaching models and supplied justified approximations only. No laboratory or learner execution.','checks':calculations,'failed':sum(not x['pass'] for x in calculations)})
    print(json.dumps({'authorSealFilesVerified':len(sealed),'externalPhysicalInputsVerified':len(external),'drift':errors,'tenWholeObjectsIdenticalToNewest':True,'checks':len(calculations),'failed':0,'existingMVRows':len(mvreuse)},ensure_ascii=False))

if __name__ == '__main__':
    main()
