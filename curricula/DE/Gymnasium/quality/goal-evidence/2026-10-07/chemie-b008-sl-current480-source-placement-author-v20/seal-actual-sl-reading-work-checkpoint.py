# SPDX-License-Identifier: Apache-2.0
"""Seal actual inactive SL author reading only; no unperformed candidate checks."""
from pathlib import Path
from datetime import datetime, timezone
from collections import Counter
import hashlib
import json
import re

root = Path.cwd()
own = Path(__file__).resolve().parent
prior = own.parent / 'chemie-b008-sh-current480-source-placement-author-v19'
v12 = own.parent / 'chemie-b008-current169-routing-placement-author-v12'
read = lambda p: json.loads(p.read_text())
def bind(p):
    b = p.read_bytes()
    return {'path': str(p.relative_to(root)), 'sha256': hashlib.sha256(b).hexdigest(), 'bytes': len(b)}
def write(p, value):
    with p.open('x') as handle:
        handle.write(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
assert not (own / 'inactive-actual-reading-work-checkpoint.freeze.json').exists()
prior_seal = prior / 'author.final.freeze.json'
assert bind(prior_seal)['sha256'] == 'bd918948f822fd3df46aa2e25d98363895c1f6e95fadf5c854ac635e633990a2'
for row in read(prior_seal)['payloads']:
    assert bind(root / row['path']) == row
prior_candidate = prior / 'candidate/canonical.current504-sh-source-metadata.author-candidate.json'
guard = read(prior / 'current480-three-way-bounded-field-rebase.actual.json')
assert bind(root / guard['current480']['path']) == guard['current480']
assert len(read(root / guard['current480']['path'])['goals']) == 480
assert len(read(prior_candidate)['goals']) == 504
national = v12 / 'exact-original1646-current-source-witness-and-primary-review-routes.author-input.json'
all_duties = read(national)['originalWholeDuties']
duties = [d for d in all_duties if '/SL/' in d['sourceExtractionPath']]
assert len(all_duties) == 1646 and len(duties) == 65
sources = {}
doc_by_key = {}
source_bindings = []
for stage, directory in [('SekI', 'lower-secondary'), ('SekII', 'upper-secondary')]:
    source_path = next((root / f'curricula/DE/Gymnasium/input/SL/{directory}/source-extraction').glob('*CHEMIE*.source-extraction.json'))
    mapping_path = next((root / f'curricula/DE/Gymnasium/mapping/DE-SL/{directory}').glob('*chemistry*source_extraction*review.json'))
    source = read(source_path)
    sources[stage] = source
    source_bindings.append({'stage': stage, 'wholeCurrentSourceExtraction': bind(source_path), 'wholeCurrentHistoricalMapping': bind(mapping_path), 'sourceBodiesMutated': 0, 'originalMappingRowsDeletedOrInvented': 0})
    for doc in source['sourceDocuments']:
        doc_by_key[doc['key']] = {**doc, 'actualPrimaryPdf': bind(root / doc['path'])}
cache = Path('/tmp/skillpilot-chemie-b008-sl-v20-primary')
texts = {key: (cache / (key + '.layout.txt')).read_text().split('\f') for key in doc_by_key}
assert texts['SL-CH-SEKI-8-2024'][3] == texts['SL-CH-SEKI-9-2025'][3]
lower_notes = {
    4: 'Theory/hypothesis-led natural science, chemical applications and occupational contexts; chemical knowledge supports societal reasoning. No complete personal career choice or whole generic goal closure.',
    5: 'Safe actual investigations connect experimental findings with models. Career orientation compares interests and real occupational requirements across the school programme; chemistry contributes relevant contexts, not automatically an entire personal decision. BNE and media competences remain content-linked.',
    6: 'Fachlanguage, source reception/production and audience communication are required; listed language scaffolds are explicitly examples without obligatory status. Data and facts are distinguished from simulations and opinions.',
    7: 'The four cumulative MSA competence areas require content-linked experimentation/models/limits, source communication and criteria-based judgment/reflection. These endpoint standards are not every-detail mandatory competence for all grade8 learners.',
    8: 'The actual competence diagram and assessment require experiments, methods, source exchange and contextual judgments as well as content knowledge; synthetic written cases do not establish performed practical work.',
}
upper_notes = {
    3: 'Content, inquiry, communication and evaluation are all binding but develop in chemical contexts; model and method use are actual process operators, not independent proof of every upper chemical domain.',
    4: 'Actual process/content linkage and real student experiments, safety and broad assessment. Left-column competence expectations are compulsory; right-column remarks, possible experiments and definitions are guidance. Flexible module combination does not make optional examples compulsory.',
    5: 'Actual experimental abilities and scientific methods enter assessment. Everyday claims are checked against chemical explanations/models. Career orientation links personal interests with occupations and future pathways across school; chemistry alone is a contribution.',
    6: 'Chemical occupations, sustainable production and relevant economic/ecological/social contexts plus digital source/presentation/model skills contribute to the programme. Full personal career-choice performance and every sustainability decision remain unproved.',
}
page_receipts = []
for key, document in doc_by_key.items():
    page_numbers = range(4, 9) if document['stageLabel'] in ['Klasse 8', 'Klasse 9'] else range(3, 7)
    notes = lower_notes if document['stageLabel'] in ['Klasse 8', 'Klasse 9'] else upper_notes
    for page in page_numbers:
        text = texts[key][page - 1]
        raw = text.encode()
        identical_reuse = key == 'SL-CH-SEKI-9-2025' and page == 4
        page_receipts.append({'officialSourceDocument': document, 'physicalPage1Based': page, 'printedPage': page, 'actualWholePageTextExtractionSha256': hashlib.sha256(raw).hexdigest(), 'actualWholePageTextExtractionBytes': len(raw), 'reproductionMethod': ['pdftotext', '-layout', document['path'], '<local-tmp-output>'], 'pageSelection': 'Split actual extracted layout text on form-feed, physical index minus1', 'actualWholePageRead': True, 'readingMethod': 'Exact byte-identical whole page reuse after actual SL8 physical4 reading' if identical_reuse else 'Actual whole page independently read by the author in this work tranche', 'byteIdenticalPriorReadingDocument': 'SL-CH-SEKI-8-2024' if identical_reuse else None, 'ownBoundedReadingResult': notes[page], 'rawOfficialTextIncluded': False, 'sourceOrIndependentApproval': False})
assert len(page_receipts) == 26
generic_ids = {stage: [g['id'] for g in source['sourceGoals'] if re.search(r'S\. [4-8](?:\D|$)' if stage == 'SekI' else r'S\. [3-6](?:\D|$)', g['sourceSpan'])] for stage, source in sources.items()}
assert not any(generic_ids.values())
reading_path = own / 'actual-six-primary-twenty-six-whole-page-reading.portable-receipts.json'
write(reading_path, {'schemaVersion': 1, 'artifactKind': 'chemie-b008-sl-actual-author-reading-only-checkpoint', 'actualAgent': '/root/b008_placements_author_resume', 'actualPrimaryDocuments': 6, 'actualWholePageReceipts': page_receipts, 'wholePageCount': 26, 'actualCurrentSourceInputs': source_bindings, 'actualGeneralOperatorSourceGoalIdsInActuallyReadLower4To8AndUpper3To6': generic_ids, 'noOperatorSourceGoalIdsInvented': True, 'rawOfficialTextExports': 0, 'wholeSpecificContentTableReadNotClaimed': True, 'wholeSourceClosure': False, 'sourceIndependentApproval': False, 'activeWrites': 0, 'strictGain': 0, 'humanApproval': False})
native = read(prior / 'actual-native43-source-view-findings-three-SH-models-and-current173-contexts.json')
sl_views = [r for r in native['actual43SourceViews'] if r['scope']['jurisdiction'] == 'DE-SL']
assert len(sl_views) == 3 and sum(r['actualAfterCPV009'] for r in sl_views) == 8
inventory = {'artifactKind': 'chemie-b008-sl-original-duties-and-view-work-boundary', 'exactAll1646ImmutableOriginalDuties': bind(national), 'wholeOriginalSLDutiesActuallyReadAndPreserved': 65, 'originalDutyBindings': [{k: d[k] for k in ['originArrayIndex', 'sourceGoalId', 'familyGoalId', 'originalMatchType', 'mappingPath', 'sourceExtractionPath', 'wholeOriginalMappingValueSha256', 'wholeOriginalSourceGoalValueSha256', 'wholeOriginalPassageValueSha256']} for d in duties], 'rawOfficialSourceBodiesNotReexported': True, 'previousActual43SourceViewCompilation': bind(prior / 'actual-native43-source-view-findings-three-SH-models-and-current173-contexts.json'), 'actualPrior43CPV009Remain': 43, 'actualPriorSLEightCPV009Remain': 8, 'priorActualSLViewInputs': [{'viewId': r['viewId'], 'scope': r['scope'], 'exactView': r['afterViewBinding'], 'actualStillOpenCPV009': r['actualAfterCPV009'], 'actualFindings': r['actualAfterFindings']} for r in sl_views], 'actualExistingCandidateBase504': bind(prior_candidate), 'freshActive480Unchanged': guard['current480'], 'activeStrict173ProtectedBaselineNotRecountedHere': True, 'existingEightProtectedRoutingContextsRemainHOLD': True, 'priorWhole26DEENAnd52ModelCaseBodiesUnchanged': True, 'sourcePlacementComponentCandidatesCreated': 0, 'targetCourseCorrectionsCreated': 0, 'sourceViewCandidatesCreated': 0, 'newNativeCompilerRuns': 0, 'strictGain': 0, 'activeWrites': 0, 'humanApproval': False}
inventory_path = own / 'retained-original-sixty-five-duty-and-eight-open-source-view-bindings.json'
write(inventory_path, inventory)
pending = {
    'artifactKind': 'chemie-b008-sl-actual-reading-checkpoint-open-work',
    'checkpointStatus': 'INACTIVE_WORK_CHECKPOINT_NOT_A_FINISHED_CANDIDATE_PACKAGE',
    'actualGeneralPrimaryReadingCompleted': 26,
    'actualOriginalWholeSLDutyTextsRead': 65,
    'notYetPerformed': [
        'Whole actual relevant lower content tables on physical13–15/21–22 in grade8 and12/16 in grade9; discovered source locators are not a completed source review.',
        'Whole actual selected EP content tables on9/18/25 in both distinct branches and32 in NW only. Do not impose NW-only nitrogen/environment content as a shared sprachlicher-Zweig obligation.',
        'Whole actual GK content tables28/45/57 and LK30/42/49/65/77; actual operator appendices and expected self-directed performance must guide source-specific children.',
        'Genuine specific source-to-routine partial component proposal and grade/stage/course admissibility; no blanket parent-to-all-child copying.',
        'Explicit minimal source-view target and prerequisiteOnly proposals, no target invented merely to remove CPV-009.',
        'Current480-preserving bounded field merge of previous504 candidate, then actual native43views and three source models; no previous503/504 whole overwrite of active480.',
        'Independent scientific source/course/component/placement A and B reviews; whole source facets, original duties and full personal career-choice performance remain separate HOLD.',
        'The existing eight affected protected routing/page contexts still require actual independent revalidation before any eventual active integration.',
    ],
    'wholeSpecificSourcePageScientificApproval': False,
    'noRawOfficialTextPortableRequirementBypassed': True,
    'newScientificDPOrVApproval': 0,
    'sourceCoverageOrGatePromotions': 0,
    'currentSLCPV009TechnicalReduction': 0,
    'activeWrites': 0,
    'strictGain': 0,
    'humanApproval': False,
}
pending_path = own / 'explicit-unperformed-source-component-candidate-checks.HOLD.json'
write(pending_path, pending)
(own / 'README.md').write_text('''# B008 SL v20: inactive reading checkpoint

This is a commit-safe reading checkpoint, not a finished candidate source-placement package. No active writes, no source or M7 closure, strict gain0. The previous SHv19 candidate remains untouched:504 whole goals/395 curricular atoms,43 technical CPV-009 including8 SL findings. Active Chemistry480/378 and173 strict protections are unchanged; the previous8 routing-context holds stay open.

Six actual official primary PDFs were available locally.26 whole general pages were read, with grade9 page4 retained by actual byte-identical comparison against already read grade8 page4. Own portable receipts bind each source PDF, physical/printed page, complete text digest, reproduction method and bounded interpretation. No full official source text is exported or added to the repository. All65 original SL obligations and1646 national obligations are retained through immutable input bindings; whole obligation text was read without duplicating it here.

The actual sources distinguish cumulative lower MSA requirements, content-linked process competence, compulsory left-column expectations and illustrative right-column guidance. Career and media/BNE contexts contribute to curricular performance; these general paragraphs do not establish all personal career-choice facets or every upper chemical domain. The actually read general pages4–8 lower and3–6 upper have no extracted source-goal IDs, and none were invented. Upper page8 has separate quantitative content IDs and is not part of this general-page claim. Different EP branches and actual GK/LK tables must still be checked in full before authoring specific children.

No specific SL component, source correction, applicability metadata patch or view was authored; no new compiler run was performed. Exact outstanding scientific/candidate/native/independent steps are listed in explicit-unperformed-source-component-candidate-checks.HOLD.json. Human and publication gates remain separate. The user requested a commit-ready intermediate state, so no new jurisdiction package is started.
''')
entry_path = own / 'neutral-inactive-actual-reading-checkpoint.entry.json'
write(entry_path, {'role': 'Neutral incomplete SL author work checkpoint with exact actual readings and explicit unperformed candidate checks', 'previousSealedSHv19': bind(prior_seal), 'actualOwnWholePrimaryReadingOnly': bind(reading_path), 'retainedOriginalDutiesAndOpenNativeViews': bind(inventory_path), 'explicitOpenChecks': bind(pending_path), 'status': 'HOLD_NOT_READY_FOR_SOURCE_COMPONENT_INDEPENDENT_REVIEW', 'sourceCandidatesAndSourceViewCompilerRuns': 0, 'wholeSourceClosure': False, 'activeWrites': 0, 'strictGain': 0, 'humanApproval': False})
nested = []
def verify(value, pointer):
    if isinstance(value, dict):
        if set(value) == {'path', 'sha256', 'bytes'}:
            assert bind(root / value['path']) == value, pointer
            nested.append(pointer)
        else:
            for key, item in value.items():
                verify(item, pointer + '/' + key)
    elif isinstance(value, list):
        for number, item in enumerate(value):
            verify(item, pointer + '/' + str(number))
for path in [reading_path, inventory_path, pending_path, entry_path]:
    assert not path.is_symlink()
    verify(read(path), str(path.relative_to(own)))
technical_path = own / 'actual-local-syntax-bindings-and-unchanged-active-inputs.check.json'
write(technical_path, {'role': 'Actual local checkpoint syntax/reference/unchanged-input checks, not unperformed scientific approval', 'exactNestedReferencesChecked': len(nested), 'actualVerifiedPreviousSealedSHv19Payloads': len(read(prior_seal)['payloads']), 'current480ExactInputUnchanged': bind(root / guard['current480']['path']) == guard['current480'], 'localJSONFilesParsed': 4, 'firstLocalGuardFailurePreserved': {'actualError': 'AssertionError on generic-source-goal-ID absence', 'cause': 'Initial helper wrongly scanned upper pages3–8; actual upper general pages are3–6 and page8 already contains two specific GK/LK quantitative source IDs', 'actualExistingSpecificQuantitativeIDs': ['sl-chem-sekii-sl-ch-sekii-gk-2023-2025-p008-001-430af7b4', 'sl-chem-sekii-sl-ch-sekii-lk-2023-2025-p008-001-23a538e4'], 'resolution': 'Bound absence check to actually read lower4–8 and upper3–6 pages; retain quantitative IDs unchanged; no source content or quality gate change'}, 'newRawOfficialTextExports': 0, 'newSymlinks': 0, 'newEmptyJSONFiles': 0, 'newAbsoluteFilesystemInputAliases': 0, 'specificSLSourceScientificReviewNotPerformed': True, 'compilerNotRun': True, 'schemaAndBuildDeferredToStableRootIntegration': True, 'activeWrites': 0, 'strictGain': 0, 'humanApproval': False})
seal = own / 'inactive-actual-reading-work-checkpoint.freeze.json'
write(seal, {'schemaVersion': 1, 'artifactKind': 'inactive-incomplete-SL-v20-author-reading-work-checkpoint', 'recordedAt': datetime.now(timezone.utc).isoformat(), 'actualPrimaryDocuments': 6, 'actualGeneralWholePagesRead': 26, 'wholeOriginalSLDutiesRetained': 65, 'specificSLComponentsCreated': 0, 'newNativeRuns': 0, 'remainingCandidateCPV009': 43, 'SLStillOpenCPV009': 8, 'sourceAndScientificWholeClosure': False, 'activeWrites': 0, 'strictGain': 0, 'humanApproval': False, 'payloads': [bind(p) for p in sorted(own.iterdir()) if p.is_file()]})
for row in read(seal)['payloads']:
    assert bind(root / row['path']) == row
print(json.dumps({'actualIncompleteSLCheckpointSeal': bind(seal), 'payloads': len(read(seal)['payloads']), 'actualWholeGeneralPages': 26, 'actualOriginalSLDutiesReadAndPreserved': 65, 'sourceAndM7Closure': False, 'strictGain': 0, 'activeWrites': 0}))
