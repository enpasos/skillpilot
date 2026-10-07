"""Record the root review after actual original retrieval, reading and raster viewing.

No source model, canonical goal, active ledger, or quality threshold is changed.
The actual documents remain temporary; only reviewed page rasters are retained.
"""
import datetime
import hashlib
import json
import re
import shutil
from pathlib import Path
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[7]
OWN = Path(__file__).resolve().parent
AUTHOR = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-neuro-eight-missing-primary-scope-remediation-author-v1'
SCRATCH = Path('/tmp/skillpilot-bio-eight-source-a-20261006')
CANON = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def write(name, value):
    (OWN / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def normal(text):
    return re.sub(r'\s+', ' ', text).strip()

freeze = json.loads((AUTHOR / 'eight-missing-primary-scope-remediation-author-v1.final.freeze.json').read_text())
bindings = []
for item in freeze['files']:
    path = AUTHOR / item['path']
    actual = digest(path)
    assert actual == item['sha256'].removeprefix('sha256:'), item['path']
    bindings.append({'path': str(path.relative_to(ROOT)), 'sha256': actual, 'bytes': path.stat().st_size})
assert len(bindings) == 47
current = json.loads(CANON.read_text())
snapshot = json.loads((AUTHOR / 'current472-whole-canonical.actual.snapshot.json').read_text())
assert current == snapshot
assert len(current['goals']) == 472

primary = json.loads((SCRATCH / 'fresh-original-source-retrieval-and-page-generation.a.actual.json').read_text())
author_primary = json.loads((AUTHOR / 'fresh-official-primary-retrieval.actual.receipt.json').read_text())['retrievals']
for row, expected in zip(primary['retrievals'], [author_primary[0], author_primary[3], author_primary[1], author_primary[2]]):
    assert row['sha256'] == expected['sha256'].removeprefix('sha256:')
for page in primary['pdfPages']:
    src = SCRATCH / f"{page['key']}{page['physicalPage']}.actual-raster.png"
    name = src.name
    shutil.copy2(src, OWN / name)
    page.update(actualViewingPending=False, actualRasterPersonallyViewedByRoot=True, retainedOwnRaster=name)

by = json.loads((AUTHOR / 'BY13-EA-GA.actual-original-neural-section.records.json').read_text())['records']
by_checked = []
for row in by:
    key = 'BY-EA' if '-EA.' in row['recordId'] else 'BY-GA'
    doc = BeautifulSoup((SCRATCH / f'{key}.actual.html').read_bytes(), 'html.parser')
    # CSS numeric IDs need escaping or an attribute selector. The original
    # author's unescaped #313324 is invalid CSS, even though the DOM ID exists.
    actual_selector = row['selector'].replace('#' + row['originalHtmlAnchor'], '[id="' + row['originalHtmlAnchor'] + '"]', 1)
    node = doc.select_one(actual_selector)
    assert node is not None, actual_selector
    for extra in node.find_all(['dialog', 'button']):
        extra.decompose()
    actual = normal(node.get_text(' ', strip=True))
    assert actual == normal(row['originalText']), row['recordId']
    by_checked.append({'recordId': row['recordId'], 'authorSelector': row['selector'], 'authorSelectorDecision': 'REVISE_INVALID_UNESCAPED_NUMERIC_CSS_ID', 'actualValidSelectorUsed': actual_selector, 'originalTextExact': True, 'originalTextSha256': hashlib.sha256(actual.encode()).hexdigest()})
assert len(by_checked) == 45

raw = json.loads((AUTHOR / 'eight-current-goals.actual-primary-scope-and-DEEN-candidates.author-v1.json').read_text())['records']
notes = {
 '4f631f78-e13a-58e5-9092-f4db0b8d377a': 'Hebb is a declared model specialisation of cellular learning. Neither original names a separate compulsory Hebbian-rule routine. Distinct performance from current cellular-learning goal347110a1 must be justified; source obligation and current ID remain open.',
 '8b23f8fb-555d-5720-b5f2-dd6f28a0e786': 'REVISE: supplied diagrams alone do not preserve BY receptor particle-level explanation and phenomenon application. The receptor-generation plus generic action-potential coding wording also overlaps current78748ef2 and04d770b3. Retain their obligations; define one distinguishable causal interpretation routine and bind its actual curricular component. HE optional Q2.4 does not justify a general compulsory scope.',
 '97b24279-def0-5ce6-8726-a1cac9cd38ad': 'BY circuit comparison and inference are actually present. This candidate preserves that operator chain and can be distinguished from descriptive EPSP/IPSP goal e1117126; native D/P and semantic review still required.',
 '9b966664-906b-5a5d-8008-cae18de043aa': 'BY explicitly provides the SSRI treatment and multifactorial depression context. This bounded mechanistic example must not close the entire symptom, social consequence, handling and therapy-inference obligation or be confused with Alzheimer. Distinguish its causal model from general substance goal f6280154.',
 'a46cafde-7359-5249-8754-19aaa3174ba4': 'A given-network processing model is a declared author specialisation, not a separate compulsory HE GK bullet. Three specialisations and cellular learning347110a1 require differentiated evidence and a truthful curricular-role decision; source HOLD is not resolved.',
 'c9a06264-cce2-54dd-9604-46dd5949f02e': 'LTP/LTD may operationalise cellular plasticity with supplied observations but are not individually named compulsory original routines. Experimental inference is distinguishable from generic description only with substantive material and semantic review. The explicit model-specialisation label is necessary.',
 'f6280154-d57c-599c-94bf-73313005a6df': 'One substance inference at an excitatory/neuromuscular synapse is supported by HE common GK/LK and BY GA/EA. Preserve ACh/channel components in the full source obligation. An unchanged LK tag alone proves neither GK source visibility nor a valid course exclusion; native scope and visibility must be measured.',
 'ff1bf88f-2413-5668-a071-ce9fc499cba3': 'Chemical ACh transmission with voltage/ligand channels is supported by HE common GK/LK; electrical synapses are not supported by these original passages. Removing that unsupported mode does not erase required substance and neuromuscular components; their separate target bindings remain necessary.'
}
rows = []
for row in raw:
    goal = row['goalId']
    rows.append({'goalId': goal, 'wholeCurrentGoalDEENRead': True,
                 'boundedOriginalComponentLocatorDecision': 'KEEP',
                 'candidateDescriptionDecision': 'REVISE' if goal.startswith('8b23') else 'CONDITIONAL_CANDIDATE_NOT_NATIVE_D_APPROVAL',
                 'finding': notes[goal], 'wholeCurrentSourceHoldRetained': True,
                 'wholeCandidateSourceApproval': False, 'nativeDOrPApproval': False,
                 'semanticAtomicityApproval': False, 'nativeVisibilityRestored': False})

nw_raw = json.loads((AUTHOR / 'NW-two-protected-losses.actual-primary-and-direct-mapping-diagnosis.json').read_text())['records']
nw = []
for row in nw_raw:
    full = next(g for g in current['goals'] if g['id'] == row['goalId'])
    assert full == row['fullCurrentGoalDEEN']
    component_file = ROOT / row['existingSeparateSourceDossierPath']
    mapping_file = ROOT / row['existingSeparateMappingDossierPath']
    assert row['existingSeparateSourceComponent']['id'] in component_file.read_text()
    assert row['goalId'] in mapping_file.read_text()
    nw.append({'goalId': row['goalId'], 'sourceComponentId': row['existingSeparateSourceComponent']['id'],
               'scope': 'DE-NW/SekI/G9', 'decision': 'KEEP_BOUNDED_BACTERIAL_COMPONENT',
               'actualPrimaryRasterViewed': 'NW35.actual-raster.png',
               'fullCurrentGoalExact': True, 'bacterialStructureOrReproductionPartialOnly': True,
               'originalWholeIF7AndViralObligationRetained': True,
               'separateComponentFile': {'path': row['existingSeparateSourceDossierPath'], 'sha256': digest(component_file)},
               'separateMappingFile': {'path': row['existingSeparateMappingDossierPath'], 'sha256': digest(mapping_file)},
               'activeNativeRestorationApprovedOrPerformed': False,
               'requiredNextStep': 'Bind both independent decisions and actually adopt separate extraction/mapping into an inert future model; measure both G9 target/witness contexts and all protected74 before any integration.'})

write('fresh-original-retrieval-page-viewing-and-BY45-exact-text.a.actual.json', {'retrieval': primary, 'BY45ActualCurrentOriginalTextChecks': by_checked,
      'actualHEPhysicalPrintedPageAgreement': {'33': 33, '43': 43}, 'actualNWPhysicalPrintedPageAgreement': {'35': 35},
      'HEQ23CompulsoryQ24NotGenerallyCompulsory': True,
      'HELKLearningNotGeneralGKOrSeparateHebbLTPMandate': True,
      'HTMLHasNoInventedPDFPage': True, 'actualWholePDFsOrHTMLCommitted': False,
      'initialOwnProbes': ['Temporary raster filename suffix corrected before any viewing claim.', 'Author unescaped numeric CSS ID rejected by the actual parser; valid attribute selectors used to independently verify the actual source text. Author records remain immutable; selector metadata must be corrected in a later author version.']})
write('eight-primary-scope-and-two-NW-partial-decisions.independent-a.json', {
 'schemaVersion': 1, 'documentType': 'bounded independent original curriculum source review A',
 'reviewer': 'Root; not raw source author', 'reviewedAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'primaryBasis': 'Fresh four official originals, own three viewed rasters, complete actual BY EA/GA neural sections, eight whole current/candidate DEEN goals and current neighbors; no new peer-B verdict read.',
 'authorFreezeSha256': digest(AUTHOR / 'eight-missing-primary-scope-remediation-author-v1.final.freeze.json'),
 'records': rows, 'NWPartialComponentRecords': nw, 'threeModelSpecialisationsRemainUnapprovedAsWholeCompulsoryGoals': True,
 'allSourceHoldsRetained': True, 'currentCanonical472WholeExact': True,
 'activeWrites': False, 'nativeBookOrAtlasModelRun': False, 'centralRun': False,
 'newScientificStrictClosures': 0, 'restoredStrictClosures': 0, 'strictNetGain': 0,
 'humanApproval': False, 'humanTrial': False, 'integrationApproved': False})
write('actual-author47-and-current472-input-bindings.independent-a.json', {'authorPayloadFilesVerified': bindings,
 'currentWholeCanonical': {'path': str(CANON.relative_to(ROOT)), 'sha256': digest(CANON), 'whole472ExactToAuthorSnapshot': True},
 'independence': {'rawAuthorRole': False, 'newPeerBRead': False, 'originalSourceFetchedAndReadByRoot': True}})
print(json.dumps({'actualAuthorFiles': len(bindings), 'actualBYOriginalTextChecks': len(by_checked), 'actualViewedRasters': 3,
                  'boundedSourceRows': len(rows), 'NWPartialRows': len(nw), 'strictNetGain': 0}, ensure_ascii=False))
