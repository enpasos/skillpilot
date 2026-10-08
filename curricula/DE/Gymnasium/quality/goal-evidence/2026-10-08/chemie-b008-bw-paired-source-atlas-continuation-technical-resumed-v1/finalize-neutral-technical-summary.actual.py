# SPDX-License-Identifier: Apache-2.0
import hashlib,json,subprocess
from datetime import datetime,timezone
from pathlib import Path

ROOT=Path(__file__).resolve().parents[7];OWN=Path(__file__).resolve().parent
def read(p):return json.loads(p.read_text())
def bind(p):
    b=p.read_bytes();return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(n,v):
    p=OWN/n;p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n');return bind(p)
integration=read(OWN/'paired-nine-normal-fields.integration.actual.json')
checks=read(OWN/'checks/ordinary-capsule-source-atlas-and-native-materials.actual.json')
focused=read(OWN/'focused38-next-source-placement-review-gaps.neutral.json')
for b in integration['independentEvidence']:assert bind(ROOT/b['path'])==b
names=['candidate-source-mappings/BW-SekI.source-mapping.paired-independent-ab.inactive-candidate.json',
       'paired-nine-normal-fields.integration.actual.json','exact38-missing-whole-goals-and-linked-source-evidence.diagnostic.json',
       'focused38-next-source-placement-review-gaps.neutral.json','checks/ordinary-capsule-source-atlas-and-native-materials.actual.json',
       'checks/focused-material-dag-protected-inputs-and-portable-boundary.actual.json']
summary={'schemaVersion':1,'role':'Neutral technical continuation summary, no new scientific verdict',
 'createdAtUTC':datetime.now(timezone.utc).isoformat(),'ownedFolder':str(OWN.relative_to(ROOT)),
 'pairedInactiveMapping':integration['pairedInactiveMapping'],'genuinePairedReviewAvailable':integration['independentEvidence'],
 'pairedReviewActualBoundary':'nine original BW source IDs; twelve partial contributions; four target and one prerequisiteOnly placement. Whole source duties stay open.',
 'ordinaryAtlasActualHolds':checks['normalAtlasOutcomes'],'actual38Groups':focused['actualGroups'],
 'actual38WholeGoalIDs':[r['goalId'] for r in focused['wholeGoalRoutes']],
 'missingNormalReviewFieldsInSLCandidateCount':len(focused['SLPendingActualOrdinaryMetadataHolds']),
 'firstMissingNormalReviewFieldsInSLCandidate':'sl-chem-seki-sl-ch-seki-8-2024-p013-004-e3b97259',
 'actualNativeMaterialBoundary':{'full395PagesExactRetained':True,'BW97TargetPagesExactRetained':True,'BWOnePrerequisiteOnlyGoalHasNoTargetPage':True,'whole26ScientificFieldsProfiles52CasesExactRetained':True,'DOrPOrImageRoleApprovalAdded':False,'nativePageVisualInspectionPerformedInThisTechnicalContinuation':False},
 'all65OriginalBWSourceIDs124OriginalPartnerMappingsAndOther56DecisionsPreserved':True,
 'all1646OriginalDutyBasisUnmodified':True,'expected395GuardUnchanged':True,'expected496ScopeUncertaintyGuardUnchanged':True,
 'actualMappedAtomicCount':365,'actualSourceScopedAtomicCount':357,'actualMissingAtomicCount':38,
 'noNormalAtlasOutputsReturnedOrWritten':True,'allBindings':[bind(OWN/n)for n in names],
 'reviewBoundary':'A/B exact existing proposals and first seals compared after B first blind seal. This continuation performs technical mapping integration, ordinary compilation and input/material comparisons only. Other scientific review packages are not reapproved or classified as genuinely paired here.',
 'firstBScientificSealUnmodified':integration['independentEvidence'][3],
 'originalWholeSourceApproval':False,'newIndependentScientificDecisions':0,'strictGain':0,'activeWrites':0,'humanApproval':False,'humanTrial':False,'stagingCommitPush':False}
write('neutral-paired-bw-technical-continuation.summary.json',summary)
md=['# B008 BW paired mapping and exact 38-goal atlas diagnosis','',
    'This is a separate inactive technical continuation. The original independent B first/final seal and all A/B scientific files are unchanged. No new scientific verdict or human approval is created.','',
    '## Actual integration','',
    '- Nine normal mapping decisions contain the actual separately frozen A and B reviewer fields and their full original rationales/bindings.',
    '- All 65 BW SourceIDs, all 124 original mapping partner rows, the 12 existing partial candidate rows, the other 56 decisions and the complete 1646-duty witness remain unchanged.',
    '- The agreed scope is twelve partial contributions, four BW target roles and one explicitly authored prerequisiteOnly role. Whole source content/method/context duties stay open.','',
    '## Actual ordinary checks','',
    '- With the reviewed BW candidate and original SL mapping: `Source-supported atlas goal count changed: 357 !== 395`.',
    '- With the reviewed BW candidate and pending SL candidate: `Missing reviewed mapping decision metadata: sl-chem-seki-sl-ch-seki-8-2024-p013-004-e3b97259`.',
    '- Expected 395 and source-scope uncertainty 496 remain unchanged. The real normal helper returned no atlas outputs; no atlas outputs were written.',
    '- Normal native loader: 395 full pages and 97 BW target pages; all page bodies are exactly equal to the prior author pure models. The information prerequisite remains outside BW target pages.',
    '- Exact 26 goal science fields, 26 profile and 52 case input bindings, DAG, runtime schema, protected active landscapes and capsule copy boundaries pass. These checks do not create D/P/image-role approval or a visual-page review.','',
    '## Exact gap groups','',
    '| Group | Count | Actual blocker |','| --- | ---: | --- |',
    '| B008 boundary children | 19 | Historical family evidence stops at the separately sourced child boundary. Direct reviewed child bindings and their exact source/operator/program scope are missing. |',
    '| Historical HE/RP content | 11 | No current direct mapping decision route to the whole goal. Four have explicit existing official extraction candidates; seven retain only historical authored UUID provenance. |',
    '| BY Biologisch-chemisches Praktikum | 8 | Current direct source bindings exist, with reviewer metadata. Official source says SekII/courseLevel unspecified; authorized BB/BE course fallbacks do not apply to BY. A reviewed program/course placement policy is missing. |','',
    'The exact 38 IDs, every current linked original SourceID, full actual source goal/passage/document and decision fields are in `exact38-missing-whole-goals-and-linked-source-evidence.diagnostic.json`. Broad historical family routes are evidence to inspect, not approved child coverage.','',
    '`focused38-next-source-placement-review-gaps.neutral.json` adds 39 actual indexed source evidence records from existing prospective BY and HE/RP packets, the specific pending SL routes, and all 26 SL candidate records with missing normal reviewer/reviewedAt fields. No candidate route is promoted by copying it.','',
    '## Whole missing goal inventory','',
    '| Whole goal ID | Whole goal title | Gap group |','| --- | --- | --- |']
for r in focused['wholeGoalRoutes']:
    group={'nineteen-B008-boundary-child-source-binding-gaps':'B008 direct source','eleven-historical-HE-RP-content-direct-source-binding-gaps':'HE/RP direct source','eight-BY-practical-authored-course-policy-gaps':'BY practical course'}[r['actualGapGroup']]
    md.append('| '+r['goalId']+' | '+r['title']+' | '+group+' |')
md += ['', '## Available independent evidence and next review boundaries','',
    'Verified paired source/placement evidence here is only the exact new BW A/B pair, bounded as above. Other historical source review packages are not audited for their full scientific content or independence in this continuation.', '',
    'The 19 B008 goals can be reviewed in focused packages: question/experiment/data (6), models and inquiry reflection/reach (5), information/presentation/argumentation (5), societal effects/history/career (3). Each review must preserve the whole 26 science/P52 context, all original duty partners and its actual source-specific stage/course selection.', '',
    'The 11 HE/RP goals need whole operator/content/source evidence and reviewed direct mapping routes. Historical UUID provenance is not an official extraction mapping decision. The existing comparative/transfer/paraben annotations remain bounded; do not turn authored transfer into a literal compulsory source claim.', '',
    'The eight BY practical goals need an explicit, reviewed program/course projection model accepted by the ordinary compiler. Do not relabel official unspecified course metadata as GK/LK and do not add free reviewer names to make a scope green.', '',
    'SL has 26 pending metadata records in the current candidate. Review the actual specific source duties/components and current whole roles; a file digest or a generic framework review does not alone supply reviewer/reviewedAt science approval for these records.', '',
    'All writes belong to this folder or the identified TMP capsule. Active Canon, QA, Registry and Ledger files, staging, commits and pushes are untouched. Strict machine gain: 0; human approval/trial: false.', '']
(OWN/'README.technical-continuation.md').write_text('\n'.join(md))
portable_files=[str(p.relative_to(ROOT)) for p in sorted(OWN.rglob('*')) if p.is_file()]
ignore=subprocess.run(['git','check-ignore','--no-index','--stdin'],input='\n'.join(portable_files)+'\n',text=True,cwd=ROOT,capture_output=True)
assert ignore.returncode in [0,1] and not ignore.stdout.strip(),ignore.stdout+ignore.stderr
status=subprocess.run(['git','status','--porcelain=v1','--',str(OWN.relative_to(ROOT))],text=True,cwd=ROOT,capture_output=True,check=True)
write('checks/owned-required-output-portability-and-worktree.actual.json',{'role':'Only owned affected outputs portability check','ownedRequiredFilesChecked':portable_files,'gitCheckIgnoreReturnCode':ignore.returncode,'ignoredOwnedRequiredFiles':[],'actualOwnedGitStatus':status.stdout,'stagingCommitPush':False,'activeWrites':0})
files=[p for p in sorted(OWN.rglob('*')) if p.is_file() and p.name not in ['technical-output-seal.json','neutral-paired-bw-technical-continuation.completed.entry.json']]
seal=write('technical-output-seal.json',{'schemaVersion':1,'role':'Technical artifact byte seal, not a scientific approval','createdAtUTC':datetime.now(timezone.utc).isoformat(),'files':[bind(p)for p in files],'wholeSourceApproval':False,'activeWrites':0,'humanApproval':False})
entry=write('neutral-paired-bw-technical-continuation.completed.entry.json',{'schemaVersion':1,'role':'Neutral completed entry for separate inactive BW paired mapping and exact38 source-atlas diagnostic','createdAtUTC':datetime.now(timezone.utc).isoformat(),
    'summary':bind(OWN/'neutral-paired-bw-technical-continuation.summary.json'),'readme':bind(OWN/'README.technical-continuation.md'),'outputSeal':seal,
    'pairedInactiveMapping':integration['pairedInactiveMapping'],'exact38Diagnosis':bind(OWN/'exact38-missing-whole-goals-and-linked-source-evidence.diagnostic.json'),'focused38NextGapEvidence':bind(OWN/'focused38-next-source-placement-review-gaps.neutral.json'),
    'ordinaryActualChecks':bind(OWN/'checks/ordinary-capsule-source-atlas-and-native-materials.actual.json'),'verifiedGenuinePairedBWReviews':integration['independentEvidence'],
    'gaps':focused['actualGroups'],'sourceCountGuard':{'expected':395,'actual':357,'missing':38,'changed':False},
    'SLFirstActualHold':'sl-chem-seki-sl-ch-seki-8-2024-p013-004-e3b97259','noSourceApprovalCreated':True,'firstBSealUnchanged':True,'strictGain':0,'activeWrites':0,'humanApproval':False,'humanTrial':False})
print(json.dumps({'entry':entry,'seal':seal,'summary':bind(OWN/'neutral-paired-bw-technical-continuation.summary.json'),'mapping':integration['pairedInactiveMapping'],'focused':bind(OWN/'focused38-next-source-placement-review-gaps.neutral.json')}))
