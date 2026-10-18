#!/usr/bin/env python3
"""Finite read-only provenance assembly. This script grants no science verdict."""
from pathlib import Path
import hashlib
import json
import datetime
from collections import Counter

ROOT = Path('/home/enpasos/projects/skillpilot')
N = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17'
O = N / 'chemie-current442-normal-integration-20261017-v1'
E = N / 'chemie-current439-source-requires-working-checkpoint-20261017-v1/evidence'
CACHE = {}
FILES = {}

def objsha(obj):
    return hashlib.sha256(json.dumps(obj, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

def pin(path):
    path = Path(path)
    if path not in FILES:
        data = path.read_bytes()
        FILES[path] = {'path': str(path.relative_to(ROOT)), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}
    return FILES[path]

def read(path):
    path = Path(path)
    if path not in CACHE:
        CACHE[path] = json.loads(path.read_text())
        pin(path)
    return CACHE[path]

def ref(path, pointer='', obj=None):
    if obj is None:
        obj = read(path)
        for key in pointer.strip('/').split('/') if pointer else []:
            obj = obj[int(key)] if isinstance(obj, list) else obj[key]
    return {**pin(path), 'jsonPointer': pointer, 'objectSHA256': objsha(obj)}

def goalmap(path):
    return {g['id']: (i, g) for i, g in enumerate(read(path)['goals'])}

def selected(path, key, goalid, idkey='goalId'):
    for i, row in enumerate(read(path)[key]):
        if row.get(idkey) == goalid:
            return row, ref(path, f'/{key}/{i}', row)
    raise AssertionError((path, key, goalid))

diagpath = O / 'DIAGNOSIS.D115-current442-after-regular-files-and-normal-SEM.actual.json'
diag = read(diagpath)
assert pin(diagpath)['sha256'] == 'f4458c2e6205b97f1a7c300177a3e62e34a42bee11c16eff7af7a364a621f63f'
currentpath = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
current = goalmap(currentpath)
assert pin(currentpath)['sha256'] == '04f20db82543e81c8a5ef5e4e0cc3856f3004ceef6697a1c2078bf72aa5bb15a'
measuredpath = N / 'chemie-current442-C653-SEM653-paired-ten-requires-integration-20261017-v1/C653.Lower14-ten-paired-requires.PENDING-final-scope-context.json.snapshot'
measured = goalmap(measuredpath)
assert all(current[r['goalId']][1] == measured[r['goalId']][1] for r in diag['currentDeltas'])

physicalauthorpath = E / 'current439-paired51-overbroad-requires-remediation-author-root-v1/AUTHOR.51-exact-negative-edge-findings-and-whole-competence-inputs.json.snapshot'
physicalauthor = read(physicalauthorpath)
physicalapath = E / 'current439-source-surrogate-necessity-independent-a-v1/FIRST.edge-conclusions.tsv'
alines = physicalapath.read_text().splitlines()
pin(physicalapath)
physicalbpath = E / 'current439-source-surrogate-necessity-independent-b-v1/FIRST-PHYSICAL-EDGE-DECISIONS.frozen.json.snapshot'
physicalb = read(physicalbpath)['groups']
physicalproofs = {}
for i, row in enumerate(physicalauthor['removedPairs']):
    bi = next(i for i, b in enumerate(physicalb) if b['directDependentGoalId'] == row['directDependentGoalId'] and b['prerequisiteGoalId'] == row['prerequisiteGoalId'])
    b = physicalb[bi]
    ai = b['groupIndex']
    a = alines[ai].split('\t', 3)
    assert int(a[0]) == ai + 1 and a[1] == b['physicalNecessityDecision'] == row['A']['physicalDecision'] == row['B']['physicalDecision'] == 'reject'
    physicalproofs[(row['directDependentGoalId'], row['prerequisiteGoalId'])] = {
        'kind': 'existing paired rejection of this whole prerequisite as necessary',
        'A': {**pin(physicalapath), 'tsvLineOneBased': ai + 1, 'decision': a[1], 'classification': a[2], 'reason': a[3]},
        'B': ref(physicalbpath, f'/groups/{bi}', b),
        'authorOperationAndWholeCompetenceBodies': ref(physicalauthorpath, f'/removedPairs/{i}', row),
    }

c54path = N / 'chemie-current439-requires54-six-narrow-foundations-paired-successor-20261017-v1/C650.requires54-six-narrow-foundations.science-paired.PENDING-final-context.json.snapshot'
c54 = goalmap(c54path)
exactapath = N / 'chemie-current439-five-narrow-requires-independent-a-20261017-v1/EXACT-SUCCESSOR.bounded-context-confirmation.frozen.json'
exactbpath = N / 'chemie-current439-five-narrow-requires-independent-b-20261017-v1/SUCCESSOR.exact-three-remediation.independent-b.receipt.json'
exacta, exactb = read(exactapath), read(exactbpath)
assert exacta['decision'] == 'CONFIRM_BOUNDED_SUCCESSOR' and exactb['verdict'] == 'ACCEPT_TARGETED_SUCCESSOR_RELATIONS'
assert exacta['exactSuccessor']['sha256'] == exactb['candidate']['sha256'] == pin(c54path)['sha256']
followapath = N / 'chemie-current439-five-narrow-requires-independent-a-20261017-v1/FOLLOWUP.three-targeted-requires-decisions.frozen.json'
followbpath = N / 'chemie-current439-five-narrow-requires-independent-b-20261017-v1/FOLLOWUP.three-relations.independent-b.json'
fa, fb = read(followapath)['judgments'], read(followbpath)['relations']
followproofs = {}
for i, a in enumerate(fa):
    bi = next(i for i, b in enumerate(fb) if b['dependentGoalId'] == a['dependentGoalId'] and b['prerequisiteGoalId'] == a['prerequisiteGoalId'])
    b = fb[bi]
    assert a['decision'] == b['verdict']
    followproofs[(a['dependentGoalId'], a['prerequisiteGoalId'])] = {'kind': 'existing exact three-relation followup and actual successor confirmation', 'decision': a['decision'], 'A': ref(followapath, f'/judgments/{i}', a), 'B': ref(followbpath, f'/relations/{bi}', b), 'AActualSuccessor': ref(exactapath), 'BActualSuccessor': ref(exactbpath)}

corrosionpaths = [E / 'current439-three-requires-pairs-fresh-independent-c-v1/FIRST.independent-scientific-review.json.snapshot', E / 'current439-three-requires-pairs-informed-A-after-fresh-C-v1/INFORMED.A.three-physical-pairs.after-C.frozen.json.snapshot', E / 'current439-three-requires-pairs-informed-B-after-fresh-C-v1/FIRST.additive-informed-B-after-C.scientific-judgments.json.snapshot']
corrosion = [read(p)['decisions'][0] for p in corrosionpaths]
assert corrosion[0]['verdict'] == corrosion[1]['informedVerdict'] == corrosion[2]['verdict'] == 'reject'
corrosionproof = {'kind': 'original B approve was substantively reconsidered after actual C review; current A and B both reject whole oxidation-number-method prerequisite', 'C': ref(corrosionpaths[0], '/decisions/0'), 'AInformed': ref(corrosionpaths[1], '/decisions/0'), 'BInformed': ref(corrosionpaths[2], '/decisions/0'), 'doNotReuseSupersededOriginalBApprove': True}

narrowproofs = {}
for i, a in enumerate(exacta['acceptedNarrowPairsInActualSuccessor']):
    bi = next(i for i, b in enumerate(exactb['sixNarrowPairsInSuccessor']) if a['dependentGoalId'] == b['dependentGoalId'] and a['prerequisiteGoalId'] == b['prerequisiteGoalId'])
    b = exactb['sixNarrowPairsInSuccessor'][bi]
    assert a['directPairDecision'] == b['verdict'] == 'ACCEPT'
    narrowproofs[(a['dependentGoalId'], a['prerequisiteGoalId'])] = {'kind': 'existing exact successor pair confirmation after the original two inherited-path HOLDs were resolved', 'A': ref(exactapath, f'/acceptedNarrowPairsInActualSuccessor/{i}', a), 'B': ref(exactbpath, f'/sixNarrowPairsInSuccessor/{bi}', b)}

edgeauthorpath = N / 'chemie-current441-HB-eight-direct-priors-science-author-20261017-v1/AUTHOR.eight-prior-ten-edge-and-two-LK-role-successors.pending.json'
edgeapath = N / 'chemie-current441-HB-eight-direct-priors-independent-a-20261017-v1/FIRST.json'
edgebpath = N / 'chemie-current441-HB-eight-direct-priors-whole-edge-scope-independent-b-20261017-v1/FIRST.independent-eight-prior-ten-edge-two-LK-role.json'
edgeauthor, edgea, edgeb = read(edgeauthorpath), read(edgeapath), read(edgebpath)
edgeproofs = {}
for i, prop in enumerate(edgeauthor['tenExactRequiresSuccessors']):
    ai = next(i for i, a in enumerate(edgea['edgeDecisions']) if a['proposalId'] == prop['proposalId'])
    bi = next(i for i, b in enumerate(edgeb['edgeDecisions']) if b['proposalId'] == prop['proposalId'])
    a, b = edgea['edgeDecisions'][ai], edgeb['edgeDecisions'][bi]
    assert a['decision'] == b['verdict'] == 'ACCEPT'
    assert a['beforeRequiresExact'] == b['beforeRequiresExact'] == prop['beforeRequiresExact']
    assert a['afterRequiresExact'] == b['afterRequiresExact'] == prop['afterRequiresExact'] == current[prop['consumerGoalId']][1]['requires']
    assert b['wholeAfterGoalObjectSHA256'] == objsha(current[prop['consumerGoalId']][1])
    before_ref = a['wholeConsumerGoal']
    before_doc = read(ROOT / before_ref['path'])
    before_goal = before_doc
    for key in before_ref['jsonPointer'].strip('/').split('/'):
        before_goal = before_goal[int(key)] if isinstance(before_goal, list) else before_goal[key]
    assert objsha(before_goal) == before_ref['objectSHA256']
    assert {k:v for k,v in before_goal.items() if k != 'requires'} == {k:v for k,v in current[prop['consumerGoalId']][1].items() if k != 'requires'}
    edgeproofs[prop['consumerGoalId']] = {'kind': 'existing paired exact ten-edge whole-prior successor', 'proposalId': prop['proposalId'], 'author': ref(edgeauthorpath, f'/tenExactRequiresSuccessors/{i}', prop), 'A': ref(edgeapath, f'/edgeDecisions/{ai}', a), 'B': ref(edgebpath, f'/edgeDecisions/{bi}', b), 'beforeRequiresExact': prop['beforeRequiresExact'], 'afterRequiresExact': prop['afterRequiresExact'], 'wholeCurrentAfterGoalExactToIndependentBWholeAfterGoal': True, 'allCurrentNonRequiresFieldsExactToIndependentAWholeConsumerGoal': True}

materialauthor = N / 'chemie-current439-HB-materials-resources-material-author-20261017-v1'
mapath = N / 'chemie-current439-HB-materials-resources-independent-a-20261017-v1/FIRST.json'
mbpath = N / 'chemie-current439-HB-materials-resources-independent-b-20261017-v1/FIRST.json'
descriptionproofs = {}
for authorfile, akey, bkey, new in [('AUTHOR.three-existing-goal-scope-successors.pending.json', 'threeExistingGoalScopeSuccessorDecisions', 'threeExistingTextScopeChanges', False), ('AUTHOR.two-new-whole-atoms.pending.json', 'newWholeAtomDecisions', 'newWholeAtoms', True)]:
    p = materialauthor / authorfile
    for i, row in enumerate(read(p)['records']):
        goalid = row['goalId']; goal = row['goalExact']; now = current[goalid][1]
        a, ar = selected(mapath, akey, goalid); b, br = selected(mbpath, bkey, goalid)
        assert a['decision'] == b['verdict'] == 'ACCEPT'
        assert a.get('D', a.get('D_scope')) == b.get('D', b.get('descriptionDE_EN')) == 'ACCEPT'
        assert a['goalSha256'] == b['goalExactObjectSHA256'] == objsha(goal)
        assert all(now.get(k) == goal.get(k) for k in ['title', 'titleEn', 'description', 'descriptionEn'])
        descriptionproofs[goalid] = {'kind': 'existing paired explicit whole D/text-scope science; not merely source coverage', 'authorWholeGoal': ref(p, f'/records/{i}/goalExact', goal), 'A': ar, 'B': br, 'currentFourTextFieldsExact': True, 'wholeCurrentGoalEqualsReviewedAuthorGoal': now == goal, 'wholeCurrentVsReviewedGoalDifferentTopFields': sorted(k for k in now.keys() | goal.keys() if now.get(k) != goal.get(k)), 'newWholeAtom': new}

g2652 = '2652caef-b557-58b9-9b28-70db62625ce5'
p2652 = N / 'chemie-current439-HB-materials-resources-goal-specific-successor-author-20261017-v2/AUTHOR.2652-whole-goal-successor.pending.json'
a2652 = N / 'chemie-current439-HB-materials-resources-independent-a-20261017-v1/FOLLOWUP.goal-specific-v2.json'
b2652 = N / 'chemie-current439-HB-materials-resources-independent-b-20261017-v1/FOLLOWUP.goal-specific-v2.json'
goal2652 = read(p2652)['records'][0]['goalExact']
assert current[g2652][1] == goal2652
assert read(a2652)['2652D']['decision'] == read(b2652)['2652NewDescriptionReview']['D'] == 'ACCEPT'
assert read(a2652)['2652D']['goalSha256'] == objsha(goal2652)
descriptionproofs[g2652] = {'kind': 'existing paired substantive 2652 scope expansion, five additive functions explicitly examined', 'authorWholeGoal': ref(p2652, '/records/0/goalExact', goal2652), 'A': ref(a2652, '/2652D'), 'B': ref(b2652, '/2652NewDescriptionReview'), 'currentFourTextFieldsExact': True, 'wholeCurrentGoalEqualsReviewedAuthorGoal': True, 'wholeCurrentVsReviewedGoalDifferentTopFields': [], 'newWholeAtom': False}

lowerauthorpath = N / 'chemie-current441-HB-lower14-current-whole-union-author-20261017-v3/EVIDENCE.deduplicated-whole-goals-profile-successors.pending.json'
lowerapath = N / 'chemie-current441-HB-lower14-whole-union-independent-a-20261017-v1/FIRST.independent-whole-lower14.json'
lowerbpath = N / 'chemie-current442-HB-lower14-whole-source-independent-b-20261017-v1/FIRST.independent-lower14-whole-source-review.json'
for goalid, index in [('5338b54c-68bc-5892-907c-e025351ffde6', 9), ('04ebfc99-dbac-539e-95db-642addcaca8c', 12)]:
    goal = read(lowerauthorpath)['records'][index]['wholeProposedGoal']; now = current[goalid][1]
    a, ar = selected(lowerapath, 'wholeGoalProfileDecisions', goalid); b, br = selected(lowerbpath, 'wholeGoalDescriptionAndAtomicityRecords', goalid)
    assert a['scientificWholeDDecision'] == b['scientificDescriptionDecision'] == 'ACCEPT'
    assert a['wholeProposedGoal']['objectSHA256'] == b['wholeGoal']['objectSHA256'] == objsha(goal)
    assert all(now.get(k) == goal.get(k) for k in ['title', 'titleEn', 'description', 'descriptionEn'])
    proof = {'kind': 'existing explicit paired whole D judgment; Lower14 source acceptance alone was not used', 'authorWholeGoal': ref(lowerauthorpath, f'/records/{index}/wholeProposedGoal', goal), 'A': ar, 'B': br, 'currentFourTextFieldsExact': True, 'wholeCurrentGoalEqualsReviewedAuthorGoal': now == goal, 'wholeCurrentVsReviewedGoalDifferentTopFields': sorted(k for k in now.keys() | goal.keys() if now.get(k) != goal.get(k)), 'newWholeAtom': index == 12}
    if index == 9:
        av3path = N / 'chemie-current441-HB-lower14-whole-union-independent-a-20261017-v1/FOLLOWUP.informed-v3-5338-and-E2.json'
        bv3path = N / 'chemie-current442-HB-lower14-E2-5338-informed-followup-independent-b-20261017-v1/FOLLOWUP.informed-E2-5338-v3.science.json'
        av3, av3r = selected(av3path, 'targetedWholeScientificDecisions', goalid)
        bv3, bv3r = selected(bv3path, 'targetRecords', goalid)
        assert av3['priorWholeDAcceptRetained'] and av3['currentWholePDecision'] == bv3['wholeProfileScientificDecision'] == 'ACCEPT'
        proof['actualV3GlobalD_PScopeCorrection'] = {'A': av3r, 'B': bv3r, 'priorWholePHoldResolvedByActualV3NotHashRefresh': True}
    descriptionproofs[goalid] = proof

rows = []
for di, delta in enumerate(diag['currentDeltas']):
    goalid = delta['goalId']; ci, goal = current[goalid]
    row = {'diagnosisPointer': f'/currentDeltas/{di}', 'goalId': goalid, 'title': goal['title'], 'currentWholeGoal': ref(currentpath, f'/goals/{ci}', goal), 'measuredC653WholeGoal': ref(measuredpath, f'/goals/{measured[goalid][0]}', measured[goalid][1]), 'currentOrdinaryWholeBodyStillExactToMeasuredC653': True, 'fieldProvenance': [], 'currentNativePageAndContextApproval': 'PENDING final applicability selection, actual pages/context and truthful stock native materialization; this matrix creates none'}
    if delta['missingCurrentIndex']:
        assert not delta['owners']
        row['oldNativeOwner'] = None
        row['fieldProvenance'].append({'field': 'NEW_WHOLE_NATIVE_D_GOAL', 'status': 'EXISTING_PAIRED_SCIENTIFIC_D_BODY_ESTABLISHED_NATIVE_CONTEXT_PENDING', 'proof': descriptionproofs[goalid]})
    else:
        assert len(delta['owners']) == 1
        owner = delta['owners'][0]; oldpath = ROOT / owner['inputPath']; olddoc = read(oldpath)
        oi = next(i for i, g in enumerate(olddoc['goals']) if g['goalId'] == goalid); old = olddoc['goals'][oi]
        resolutionpath = ROOT / owner['resolutionPath']; resolution = read(resolutionpath)
        assert resolution['goal']['finalText'] == {k: old[v] for k, v in [('titleDe', 'currentTitleDe'), ('titleEn', 'currentTitleEn'), ('descriptionDe', 'currentDescriptionDe'), ('descriptionEn', 'currentDescriptionEn')]}
        row['oldNativeOwner'] = {'index': pin(ROOT / owner['indexPath']), 'resolution': pin(resolutionpath), 'wholeOldNativeInputGoal': ref(oldpath, f'/goals/{oi}', old), 'wholeOldCanonicalContext': ref(oldpath, f'/goals/{oi}/canonicalContext', old['canonicalContext']), 'oldFinalText': ref(resolutionpath, '/goal/finalText'), 'oldPageFingerprint': old['pageFingerprint'], 'oldGoalFingerprint': old['goalFingerprint'], 'stockFingerprintEqualityIsNotScienceApproval': True}
        fields = owner['canonicalContextChangedFields']
        if '/requires' in fields:
            before, after = old['canonicalContext']['requires'], goal['requires']; assert before != after
            removed = [id for id in before if id not in after]; added = [id for id in after if id not in before]
            if goalid in edgeproofs:
                proof = edgeproofs[goalid]
                perops = {'wholeExactLatestArray': proof, 'oldNativeArrayEqualsLatestAuthorBefore': before == proof['beforeRequiresExact']}
                intermediate = proof['beforeRequiresExact']
                prior_steps = []
                for priorid in before:
                    if priorid not in intermediate:
                        assert (goalid, priorid) in physicalproofs
                        prior_steps.append({'operation': 'earlier removal before A8 author input', 'prerequisiteGoalId': priorid, 'existingScientificProof': physicalproofs[(goalid, priorid)]})
                for priorid in intermediate:
                    if priorid not in before:
                        assert (goalid, priorid) in narrowproofs
                        prior_steps.append({'operation': 'earlier narrow addition before A8 author input', 'prerequisiteGoalId': priorid, 'existingScientificProof': narrowproofs[(goalid, priorid)]})
                perops['oldNativeToLatestAuthorBeforeChangedEdgeProofs'] = prior_steps
            else:
                assert c54[goalid][1]['requires'] == after
                ops = []
                for priorid in removed:
                    pair = (goalid, priorid)
                    if pair in physicalproofs: proof = physicalproofs[pair]
                    elif pair in followproofs: proof = followproofs[pair]; assert proof['decision'] == 'REJECT'
                    elif pair == ('642d5ea5-b62f-50c8-b0bd-cf132619725f', '22133f29-ef02-4408-8f8d-2bbea3275d91'): proof = corrosionproof
                    else: raise AssertionError(('unestablished removal', pair))
                    ops.append({'operation': 'remove whole prior', 'prerequisiteGoalId': priorid, 'existingScientificProof': proof})
                for priorid in added:
                    pair = (goalid, priorid); assert pair in narrowproofs
                    ops.append({'operation': 'add narrow existing prior', 'prerequisiteGoalId': priorid, 'existingScientificProof': narrowproofs[pair]})
                idx54, goal54 = c54[goalid]
                perops = {'individualChangedEdgeProofs': ops, 'exactFieldInExistingSuccessor': ref(c54path, f'/goals/{idx54}/requires', after), 'currentWholeGoalEqualsC54Goal': goal == goal54, 'wholeCurrentVsC54DifferentTopFields': sorted(k for k in goal.keys() | goal54.keys() if goal.get(k) != goal54.get(k)), 'noBlanketApprovalFrom54_6_49Counts': True}
            row['fieldProvenance'].append({'field': '/requires', 'oldValue': before, 'currentValue': after, 'removedPriorIds': removed, 'addedPriorIds': added, 'retainedPriorIdsInCurrentOrder': [id for id in after if id in before], 'status': 'EXISTING_PAIRED_EXPLICIT_EDGE_SCIENCE_AND_EXACT_CURRENT_FIELD', 'proof': perops})
        for field in owner['bilingualTextChangedFields']:
            key = {'/descriptionDe': 'description', '/descriptionEn': 'descriptionEn'}[field]
            oldkey = 'currentDescriptionDe' if key == 'description' else 'currentDescriptionEn'
            assert old[oldkey] != goal[key]
            row['fieldProvenance'].append({'field': field, 'oldValue': old[oldkey], 'currentValue': goal[key], 'status': 'EXISTING_PAIRED_EXPLICIT_D_TEXT_SCIENCE_CURRENT_FIELD_EXACT', 'proof': descriptionproofs[goalid]})
        if '/applicability/jurisdiction' in fields:
            assert goalid == '3eb2a06c-d283-57aa-9eb4-088940c4801a'
            row['fieldProvenance'].append({'field': '/applicability/jurisdiction', 'oldValue': old['canonicalContext']['applicability']['jurisdiction'], 'currentValue': goal['applicability']['jurisdiction'], 'status': 'EXISTING_PAIRED_EXPLICIT_TEXT_AND_HB_SCOPE_DECISION_CURRENT_WHOLE_GOAL_EXACT', 'proof': descriptionproofs[goalid], 'boundary': 'HB LK own scope/source duty preserved; no GK or phase-role inference. Final applicability compilation remains pending.'})
        vb = owner['visualizationBinding']
        if any(vb.get(k) for k in ['assetDigestMismatch', 'urlMismatch', 'altTextMismatch']):
            assert goalid == '8721d943-8368-5304-bd3c-7d7944099662'
            vpath = N / 'chemie-current441-8721-readable-recycling-image-independent-v-b-20261017-v1/FIRST.independent-actual-v-8721.json'
            v = read(vpath); assert v['decision'] == 'KEEP'
            row['fieldProvenance'].append({'field': '/reviewContext/page/visualization', 'oldCurrentBindingComparison': vb, 'currentResource': next(x for x in goal['resourceLinks'] if x.get('type') == 'goal-visualization'), 'status': 'EXISTING_GENUINE_ACTUAL_V_KEEP_SEPARATE_FROM_PAIRED_CURRENT_NATIVE_D_CONTEXT', 'existingVFirst': ref(vpath), 'notAPairedCurrentNativeDPageReview': True})
        row['oldAndCurrentTitlesExact'] = old['currentTitleDe'] == goal['title'] and old['currentTitleEn'] == goal['titleEn']
        assert row['oldAndCurrentTitlesExact']
    rows.append(row)

counts = Counter(p['field'] for r in rows for p in r['fieldProvenance'])
assert len(rows) == 65 and counts['/requires'] == 58 and counts['/descriptionDe'] == counts['/descriptionEn'] == 5 and counts['NEW_WHOLE_NATIVE_D_GOAL'] == 3
assert hashlib.sha256(currentpath.read_bytes()).hexdigest() == pin(currentpath)['sha256']
result = {'artifactType': 'Finite read-only technical matrix of existing paired scientific provenance for the measured65 actual native-D deltas', 'createdAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'assemblerRole': 'Codex B; informed prior HB source/Lower14/A8 reviewer, earlier HB-view/P442 writer/provenance assembler and normal V integrator. No new scientific judgment or authoring in this matrix.', 'independentSubreviewersUsedForThisMatrix': False, 'neutralLocatorAssistance': 'Existing route agent supplied original finite source-surrogate/top-eight locators; no new scientific verdict delegated or coordinated.', 'diagnosis': pin(diagpath), 'currentCanonicalAtRead': pin(currentpath), 'measuredCanonical': pin(measuredpath), 'measurementBoundary': 'The exact C653-measured65 roster is retained; all65 ordinary whole bodies are still exact in installedC654. The extra memory unit and unrelated metadata do not create new ordinary deltas here. This precedes final applicability compilation and actual final pages/context rendering.', 'hashConvention': 'wholeObjectSHA256 = UTF-8 canonical JSON, ensure_ascii=False, sorted keys, compact separators. Hashes establish identity, never scientific correctness.', 'summary': {'measuredGoals': 65, 'changedOwnedGoals': 62, 'missingNativeOwners': 3, 'requiresFieldsWithConcretePairedEdgeProof': 58, 'currentRequiresExactToRequires54Snapshot': 48, 'currentRequiresExactToA8B8Successor': 10, 'descriptionSuccessorsWithPairedExplicitDScience': 5, 'bilingualDescriptionFields': 10, 'jurisdictionSuccessorWithExplicitPairedScopeScience': 1, 'newWholeDGoalsWithPairedDScience': 3, 'changedImageBindingWithExistingGenuineActualVKeep': 1, 'unestablishedScientificFieldDeltasInThisFiniteRoster': [], 'unchanged377Rereviewed': 0, 'freshScientificVerdictsCreated': 0, 'nativeDMaterializationsCreated': 0}, 'fieldCounts': dict(counts), 'records': rows, 'claimsNotMade': ['Existing whole-source union ACCEPT is not substituted for wholeD/P or prerequisite-edge approval.', 'Original physical B approve for oxidation-number-method→corrosion is not reused after its explicit informed reconsideration.', 'Old native resolutions/pages/input fingerprints remain historical; none is silently rebound or promoted by this matrix.', 'A matching field/body/hash and an old acceptance filename do not create a new scientific verdict.', 'WholeP/electrophoresis and other unchanged377 bodies outside this measured65 are not reopened.', 'No final applicability/page/render or nativeD ready claim; final stock native inputs must carry these exact accepted field decisions with actual current page/context bindings.', 'No D contract/gate/runtime/code/ordinary content mutation; only this additive matrix and its replay script are written.', 'No Human Approval, Human Trial, learner performance or M7 completion.'], 'supportingSourceReviewBoundary': 'Existing HB232, Lower14 and other source decisions retain their original scientific roles. The matrix deliberately selects explicit D/edge verdicts for the changed field rather than treating mere source credit or profile-read metadata as D approval.', 'filesActuallyReadOrPinned': sorted(FILES.values(), key=lambda p: p['path']), 'normalFilesChanged': False, 'newScienceApproval': False, 'HumanApproval': False, 'HumanTrial': False, 'M7Claim': False}
out = O / 'PROVENANCE.D65-current-field-existing-paired-science.json'
out.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'output': str(out.relative_to(ROOT)), 'sha256': hashlib.sha256(out.read_bytes()).hexdigest(), 'bytes': out.stat().st_size, 'summary': result['summary']}, ensure_ascii=False))
