"""Seal the completed bounded scientific reading; no active-source writes."""
import hashlib
import json
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = next(p for p in HERE.parents if (p / 'AGENTS.md').exists())
AUTHOR = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-M3-two-actual-global-gaps-trade-agreements-and-money-creation-author-v1/two-real-essential-performance-scoring-author-successor-v2'
RECEIPT = HERE / 'actual-two-whole-materials-eight-counterworks-59-calculations-bounded-scientific-KEEP.independent-b.json'
MANIFEST = HERE / 'actual-completed-V2-independent-science.whole-file-manifest.json'
HANDOFF = HERE / 'actual-completed-V2-independent-science.handoff.receipt.json'
assert not any(p.exists() for p in [RECEIPT, MANIFEST, HANDOFF]), 'Immutable seal already exists'

def read(path):
    return json.loads(path.read_text())

def bound(path):
    data = path.read_bytes()
    return {'path':str(path.relative_to(ROOT)), 'sha256':hashlib.sha256(data).hexdigest(), 'bytes':len(data)}

def write(path, data):
    assert not path.exists(), 'Immutable independent output exists'
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2)+'\n')

guards = read(HERE/'actual-independent-whole-input-four-field-navigation-material-and-DAG-guards.json')
numeric = read(HERE/'actual-independent-Decimal-model-calculations-and-whole-balance-results.json')
works = read(HERE/'independent-whole-counterworks.json')
replay = read(HERE/'actual-eight-independent-whole-counterwork-score-replays.json')
command = read(HERE/'actual-eight-counterwork-replay.command-exit.json')
assert numeric['allPassed'] and numeric['count'] == len(numeric['checks']) == 59
assert all(x['actual'] == x['expected'] for x in numeric['checks'])
assert replay['allPassed'] and replay['count'] == len(works['counterworks']) == 8
assert command['actualToolResult']['exit_code'] == 0
assert all(x['wholeBytesEqual'] for x in guards['inputCopies'])
for binding in guards['inputCopies']:
    for key in ['original','exactLocalCopy']:
        assert bound(ROOT/binding[key]['path']) == binding[key]
author_manifest = read(AUTHOR/'actual-final-two-real-M3-whole-material-review-input-freeze.manifest.json')
assert len(author_manifest) == 28
for binding in author_manifest:
    assert bound(ROOT/binding['path']) == binding
author_handoff = read(AUTHOR/'actual-final-two-real-global-gaps-whole-bilingual-materials-and-core-scoring-author-handoff.json')
current_material_binding = author_handoff['currentMaterials']
assert current_material_binding['sha256'] == 'ecbcbf80c370367dfa31c62e42c6e3e0c82067c3079da40717ade12dc8f971e9'
assert bound(ROOT/current_material_binding['path']) == current_material_binding
active_path = ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
active = read(active_path)
active_by_id = {g['id']:g for g in active['goals']}
contexts = read(HERE/'inputs/whole-four-current-contracts-and-eight-valid-P-cases.exact-intake.json')
assert all(g == active_by_id[g['id']] for g in contexts['wholeGoals'])
proc = subprocess.run(['ps','-eo','pid,ppid,stat,args'], text=True, capture_output=True)
assert proc.returncode == 0
own_matching_processes = [line for line in proc.stdout.splitlines() if any(s in line for s in ['review_math_and_bounds.py','replay_independent_counterwork_marks.py']) and 'ps -eo' not in line]
assert not own_matching_processes, 'Unexpected unfinished own command'
write(HERE/'actual-V2-resumption-process-input-integrity-and-completed-results.json',{
    'date':'2026-10-10', 'ownRelevantUnfinishedProcesses':[], 'processQueryExit':proc.returncode,
    'wholeAuthorManifestFilesBoundExactly':28,
    'wholeFourScientificContractsStillExactlyCurrent':True,
    'actualActiveCanonicalAtResumption':bound(active_path),
    'completedArithmeticChecksPresentAndValidated':59,
    'completedWholeSyntheticCounterworksAndScoreReplay':8,
    'actualScoreReplayCommandExit':0,
    'historyFilesRewritten':0,
    'comment':'Arithmetic was actually calculated from the stated model inputs by the completed prior command; this focused resumption checks the retained result, exact inputs and completed actual score replay. It does not restart whole scientific review or invent a pending KEEP.'
})

receipt = {
    'schemaVersion':1,
    'reviewId':'wirtschaft-M3-two-global-gap-materials-independent-b-v1',
    'reviewer':'/root/economics_m2_views_independent_b',
    'reviewAuthority':'independent_ai_machine_curriculum_science',
    'reviewCompletedAtDate':'2026-10-10',
    'decision':'KEEP',
    'approvalScope':'Completed independent bounded scientific content of the exact two V2 DRAFT whole materials: actual DE/EN tasks, solutions, rubrics, full target/prerequisite contracts and P8, dated primary aids, model calculations and essential-performance grading. Final learner-facing text readability and country/course access are expressly outside this V2 KEEP.',
    'wholeApprovedMaterials':current_material_binding,
    'wholeScientificContext':bound(HERE/'inputs/whole-four-current-contracts-and-eight-valid-P-cases.exact-intake.json'),
    'wholeV1Predecessor':bound(HERE/'inputs/whole-two-real-global-gap-materials.DRAFT-bilingual-author-candidates.json'),
    'ownWholeScientificCounterworks':bound(HERE/'independent-whole-counterworks.json'),
    'ownActualScoreReplay':bound(HERE/'actual-eight-independent-whole-counterwork-score-replays.json'),
    'ownActualNumericResults':bound(HERE/'actual-independent-Decimal-model-calculations-and-whole-balance-results.json'),
    'ownActualPrimaryReadings':bound(HERE/'actual-independent-seven-official-primary-source-readings-and-model-limits.json'),
    'wholeAuthorInputFreeze':bound(AUTHOR/'actual-final-two-real-M3-whole-material-review-input-freeze.manifest.json'),
    'exactAuthorHandoff':bound(AUTHOR/'actual-final-two-real-global-gaps-whole-bilingual-materials-and-core-scoring-author-handoff.json'),
    'independentDecisions':[
        {
            'materialId':'294f5721-33b8-553d-b62a-32f9a0d28f5c',
            'coveredGoalId':'bc1ebc6a-3c15-547f-92a0-02ddeeafb5e4',
            'decision':'KEEP_SCIENTIFIC_CONTENT',
            'wholeReading':'Complete actual DE and EN task/solution/scoring plus whole bc1/87ee DE/EN contracts and four P cases read. The two official agreements are actually named and dated; their rules are used in independent CETA/EPA dossiers, with fresh eligibility/compliance-cost variations.',
            'sourceJudgement':'Actual CETA provisional status, origin Article 2, retained standards and conditional conformity-testing recognition are supported by official sources; actual EPA register date and Japanese-exporter origin/technical requirements match the Japan-to-EU model direction. Fictional duty amounts, prices, pass-through and quantities are explicitly distinguished from actual tariff lines and empirical treaty effects.',
            'performanceJudgement':'CETA connects origin/protection/access rules to small/large implementation burdens, conditional buyer pass-through and competing producers. EPA separates buyer prices, real production resource costs, customs transfers and outsider orders, then tests changed documentation costs. Required conditional group/criteria judgement goes beyond treaty-name recall and generic free-trade claims. Both independent dossiers supply actual named-agreement performance; neither framework ordinary goal nor P expectations is weakened.',
            'arithmeticJudgement':'Own shipment arithmetic confirms CETA small2200→2040/160 and large22000→20040/1960, half pass-through80/price106; EPA outsider920 versus partner904, production820→900, tariff100→0, B2partner940>920. Resource cost and customs transfer remain distinct; lower buyer prices alone establish no worldwide welfare gain.',
            'V1FindingAndResolution':'Own complete raw15 answer omits every concrete rule judgement yet passed V1; own raw21 answer judges CETA but wholly omits EPA rule judgement. Exact V2 protects separately each wholly absent or consistently wrong named-agreement rule/group performance, limiting those works to14. Own valid incomplete work17 and full work24 pass; full dates, exhaustive rule lists or full section marks are not prerequisites for avoiding the restriction.',
            'translationJudgement':'All factual assumptions, actual rules, dated status, 24/15 rubric and the separate CETA-or-EPA essential-performance condition agree across DE/EN. New material spelling/spacing receives its separate targeted successor check.'
        },
        {
            'materialId':'0d111408-c754-50fa-8cd3-25ec75f6205f',
            'coveredGoalId':'5b5d1d53-71c3-5fbf-b1cf-977c868b60e3',
            'decision':'KEEP_SCIENTIFIC_CONTENT',
            'wholeReading':'Complete actual DE and EN task/solution/scoring plus whole 5b5d/676 DE/EN contracts and four P cases read. New-credit creation followed by cross-bank payment and independent principal-repayment/internal-transfer case have actual independent mechanism variation; B2 changes the recipient bank.',
            'sourceJudgement':'Independently opened current ECB explanation links balance expansion to credit-created deposits and repayment to disappearance of the created money. Independently read Lane payment-system passages support the matched interbank reserve debit/credit and distinction from customer deposits. Model reserve/capital/risk compliance is expressly assumed, not certified real solvency or unrestricted credit creation.',
            'performanceJudgement':'Loan claims, bank deposit liabilities, customer claims/debt, aggregate deposits/loans/reserves and net wealth are kept distinct. Principal repayment contracts the paired loan/deposit while internal or external payment relocates deposits, with reserves only crossing banks when specified. Both fresh cases and the bank-switch variation genuinely assess the whole 5b5d mechanism; the unassessed wider interest/inflation 676 goal is not falsely declared covered.',
            'arithmeticJudgement':'Own fully balanced A/B/C computations confirm creationA520; after paymentA445/B475, systemdeposits690→810/loans370→490/reserves430unchanged, Knetwealth0. RepaymentC270/D50; internal distributionD30/recipient20 keeps deposits210; externalC250/Epaired+20 gives combineddeposits−30 and reserves unchanged.',
            'V1FindingAndResolution':'Own raw16 answer correctly repays and settles payments but consistently treats new credit as existing-deposit redistribution; old both-cases cap fails because the second case has a valid loan/deposit link. Own raw19 work models new lending correctly but always equates principal repayment to transfer. V2 independently protects absent/consistently false creation and absent repayment-versus-payment stock distinction; both works score14. Own incomplete valid work18 and full work24 pass without perfect prose/full repeated bank tables.',
            'translationJudgement':'Loan/payment/repayment mechanisms, numerical assumptions, reserve/deposit distinction, 24/15 rubric and two narrowly defined whole-submission restrictions agree across DE/EN. Learner-facing joined-word problems remain an explicit separate text boundary.',
            'unresolvedCourseBoundary':'5b5d is tagged GK/LK but still requires 676684da-5ba2-5c2a-ba7e-a8413915c29c, which is tagged LK-only. Those exact four current objects remain unchanged. This scientific material KEEP neither validates universal necessity of the whole 676 contract nor proves GK full prerequisite visibility or country access.'
        }
    ],
    'reviewedScopeAndPreservation':{
        'wholeNewMaterials':2, 'currentWholeContracts':4, 'wholePositiveCaseBriefsActuallyRead':8,
        'ownWholeSyntheticCounterworks':8, 'ownDecimalAndWholeBalanceChecks':59,
        'realV1FalsePassesPreserved':[15,21,16,19], 'sameV2RestrictedPoints':[14,14,14,14],
        'validPartialV2Passes':[17,18], 'fullReferenceV2Passes':[24,24],
        'V1AndAllHistoricalWholeInputsPreserved':True,
        'V1ToV2OnlyFourBilingualTaskInstructionFieldsChanged':True,
        'all97WholeOldMaterialsPreserved':True,
        'all493NonNavigationExistingObjectsPreservedOnActualAuthorBase':True,
        'existingNavigationActualDelta':['contains','description','descriptionEn'],
        'navigationInterpretation':'Pure existing5317 navigation lists sixteen rather than fourteen actual material children, adds two topics in DE/EN and no new subject performance. No contains-only claim is made.',
        'ordinaryGoalAndPScientificClaimsNewlyChanged':0,
        'activeCANOrViewOrSourceOrPolicyMutationByReviewer':False,
        'wholeCandidateRequiresAndContainsDagVerified':True
    },
    'remainingBoundaries':[
        'Money DE/EN task/solution has real joined-word readability faults. Parent requested an exact whitespace-only author successor; V2 scientific content stays frozen and qualified without claiming final readable-body release.',
        'Both current material statuses are DRAFT. No examData release mutation is performed or claimed in this scientific V2 receipt.',
        'Country/GK/LK access requires actual compiled applicability, complete inherited prerequisite closure, proper projection roles and unchanged ordinary targets. Money676LK-only remains specifically open.',
        'Author native global route probe is conditional on these inert DRAFT nodes. Its CQR203 remains warn and CQR104 fails; it is not current active full-course M3/M4 evidence.',
        'Current owner-page/dependent D/SEM/input bindings must be measured and selectively restored at qualified integration; retained descriptions and P cases are not blindly re-reviewed or falsely called unchanged contexts.',
        'Human review, release acceptance and practical trials remain separate and unfulfilled by this machine scientific review.',
        'Math/Physics protected M7 integration floors and overall current Economics M6 are parent final-integration checks; no substitute result is claimed here.'
    ],
    'scientificBlockedFindingsWithinExactBoundedV2Scope':0,
    'unresolvedFinalTextReadabilityFindings':1,
    'machineMaterialFinalReleaseReady':False,
    'currentCentralStrictNetGain':0,
    'restoredDescriptionOrPBindings':0,
    'newOrdinaryScientificGoalCompletions':0,
    'humanReviewClaim':False,
    'M3M4M5M6OrM7WholeCourseApproval':False,
    'nextStep':'Minimal meaning-preserving qualification of the frozen whitespace-only new-material successor, then parent fieldwise integration and current native scope/source/owner checks.'
}
write(RECEIPT, receipt)
files = sorted(p for p in HERE.rglob('*') if p.is_file())
ignored = subprocess.run(['git','check-ignore','--no-index','--stdin'],cwd=ROOT,input=''.join(str(p.relative_to(ROOT))+'\n' for p in files),capture_output=True,text=True)
assert ignored.returncode in (0,1)
assert not ignored.stdout.strip(), 'Ignored required evidence'
assert not any(p.is_symlink() for p in HERE.rglob('*'))
write(MANIFEST, {'files':[bound(p) for p in files], 'requiredIgnoredFiles':0, 'symbolicLinks':0, 'scope':'Whole immutable independent scientific input/output evidence. Hash validation does not replace actual scientific reading or counterwork.'})
write(HANDOFF, {'decision':'KEEP_SCIENTIFIC_CONTENT_ONLY', 'exactReceipt':bound(RECEIPT), 'wholeManifest':bound(MANIFEST), 'wholeApprovedV2Materials':current_material_binding, 'independentReviewer':'/root/economics_m2_views_independent_b', 'pendingMeaningPreservingWhitespaceSuccessor':True, 'Money676LKOnlyBoundaryRemainsOpen':True, 'activeMutation':False, 'humanApproval':False, 'strictCentralNetGain':0})
print(json.dumps({'receipt':bound(RECEIPT),'handoff':bound(HANDOFF),'manifest':bound(MANIFEST),'decision':'KEEP_SCIENTIFIC_CONTENT_ONLY','wholeCounterworks':8,'numericChecks':59,'readabilitySuccessorPending':True},ensure_ascii=False))
