# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import json, hashlib, importlib.util, datetime
import fitz

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent.relative_to(ROOT)
AUTHOR = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-health-twelve-source-findings-targeted-author-successor-20261010-v1')

def read(p):
    return json.loads(Path(p).read_text())

def ref(p):
    p = Path(p)
    b = p.read_bytes()
    assert p.is_file() and not p.is_symlink()
    return {'path': p.as_posix(), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest(), 'bytes': len(b)}

def write(name, data):
    p = OWN / name
    p.parent.mkdir(parents=True, exist_ok=True)
    assert not p.exists()
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    assert read(p) == data

freeze = read(AUTHOR / 'FINAL.targeted-source-neutral-author.freeze.json')
bindings = [freeze['entry']] + freeze['ownBindings'] + freeze['externalBindings']
verified = []
for b in bindings:
    actual = ref(b['path'])
    assert actual == b, (actual, b)
    verified.append(actual)
addendum = read(AUTHOR / 'FINAL.source-context-precision-addendum.freeze.json')
assert ref(addendum['precisionAddendum']['path']) == addendum['precisionAddendum']
write('checks/exact-author-bindings.actual.json', {'schemaVersion': 1, 'inputFreeze': ref(AUTHOR / 'FINAL.targeted-source-neutral-author.freeze.json'), 'addendumFreeze': ref(AUTHOR / 'FINAL.source-context-precision-addendum.freeze.json'), 'verifiedBindings': verified, 'allRegularAndExact': True, 'contentInspectionOfEveryHistoricalReviewClaimed': False})

d = read(AUTHOR / 'sources/four-pair-removals-three-HH-partial-scopes-two-HB-fidelity.actual-author-deltas.json')
changed = []
partner_ids = set()
for pair in d['wholeChangedMappingPairs']:
    before_m, after_m, before_e, after_e = [read(pair[k]['path']) for k in ['beforeMapping','afterMapping','beforeExtraction','afterExtraction']]
    before_g = {g['id']:g for g in before_e['sourceGoals']}
    after_g = {g['id']:g for g in after_e['sourceGoals']}
    assert before_g.keys() == after_g.keys()
    selected_ids = set(pair['changedDecisionIds'])
    if pair['jurisdiction'] == 'DE-HB':
        selected_ids.update(r['sourceGoalId'] for r in d['hbTwoActualOperatorAndAuthoredOperationalizationCorrections'])
    for side in [before_m, after_m]:
        partner_ids.update(m['canonicalGoalId'] for m in side['mappings'] if m['legacyGoalId'] in selected_ids)
    remaining_before = [r for r in before_m['mappings'] if r['legacyGoalId'] not in selected_ids]
    remaining_after = [r for r in after_m['mappings'] if r['legacyGoalId'] not in selected_ids]
    assert remaining_before == remaining_after
    assert [r for r in before_m['decisions'] if r.get('sourceGoalId') not in selected_ids] == [r for r in after_m['decisions'] if r.get('sourceGoalId') not in selected_ids]
    changed.append({'jurisdiction':pair['jurisdiction'], 'wholeBeforeMapping':ref(pair['beforeMapping']['path']), 'wholeAfterMapping':ref(pair['afterMapping']['path']), 'wholeBeforeExtraction':ref(pair['beforeExtraction']['path']), 'wholeAfterExtraction':ref(pair['afterExtraction']['path']), 'wholeSourceGoalsCount':len(after_g), 'sourceGoalIdsExact':True, 'unselectedDecisionsAndMappingsExact':True, 'selectedWholeRecords':[{'sourceGoalId':i,'beforeWholeSourceGoal':before_g[i],'afterWholeSourceGoal':after_g[i],'beforeWholeDecisions':[r for r in before_m['decisions'] if r.get('sourceGoalId') == i],'afterWholeDecisions':[r for r in after_m['decisions'] if r.get('sourceGoalId') == i],'beforeWholeMappings':[r for r in before_m['mappings'] if r['legacyGoalId'] == i],'afterWholeMappings':[r for r in after_m['mappings'] if r['legacyGoalId'] == i]} for i in sorted(selected_ids)]})
cfg = read(AUTHOR / 'sources/after394-atlas.targeted-source.normal.config.json')
ls = read(cfg['landscapePath'])
contexts = read(AUTHOR / 'native/targeted-source-affected-complete-current-page-contexts.neutral.json')
partner_ids.update(r['goalId'] for r in contexts['records'])
goals = {g['id']:g for g in ls['goals']}
assert partner_ids <= goals.keys()
write('inputs/whole-targeted-before-after-records-and-current-partners.actual.json', {'schemaVersion':1,'role':'Independent A inspected full selected records and all bound partner descriptions; unselected history carried without renewed approval','sourcePairs':changed,'wholeCurrentLandscape':ref(cfg['landscapePath']),'wholeCurrentPartners':[goals[i] for i in sorted(partner_ids)],'wholeCurrentContexts':ref(AUTHOR / 'native/targeted-source-affected-complete-current-page-contexts.neutral.json'),'currentPartnerCount':len(partner_ids),'currentWholeContextsCount':len(contexts['records']),'newHistoricalApproval':False})

primary = read(AUTHOR / 'primary/actual-eight-whole-primary-page-author-read.receipt.json')
pages=[]
for r in primary['records']:
    pdf = r['actualWholePrimaryPdf']
    assert ref(pdf['path']) == pdf
    with fitz.open(pdf['path']) as doc:
        pg = doc[r['physicalPageOneBased']-1]
        b=pg.get_text().encode()
        assert b == Path(r['wholePhysicalPageText']['path']).read_bytes()
        pix=pg.get_pixmap(matrix=fitz.Matrix(4/3,4/3),alpha=False)
        raster=fitz.Pixmap(r['actualWholePhysicalPageRaster']['path'])
        assert (pix.width,pix.height,pix.samples)==(raster.width,raster.height,raster.samples)
    pages.append({'sourceDocumentKey':r['sourceDocumentKey'],'wholeOriginalPdf':pdf,'physicalPageOneBased':r['physicalPageOneBased'],'wholeText':ref(r['wholePhysicalPageText']['path']),'wholeRaster':ref(r['actualWholePhysicalPageRaster']['path']),'actualPdfTextExact':True,'actualPdfRasterPixelsExact':True,'wholeTextReadByIndependentA':True,'wholeRasterViewedByIndependentA':True})
write('primary/eight-whole-primary-pages-independent-a.actual.json', {'schemaVersion':1,'reviewer':'genuine-independent-a-fresh-targeted','records':pages,'humanApproved':0,'wholeCourseSourceApproval':False})

spec=importlib.util.spec_from_file_location('validator','scripts/validate_schemas.py')
module=importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
errors=module.curriculum_symlink_errors(ROOT)
assert not errors, errors
write('checks/curriculum-portability-and-ordinary-json.actual.json',{'schemaVersion':1,'normalPortabilityFunction':'scripts/validate_schemas.py:curriculum_symlink_errors','errors':errors,'ownJsonFilesNormallyParsed':[p.as_posix() for p in sorted(OWN.rglob('*.json'))],'allOwnedArtifactsRegular':all(p.is_file() and not p.is_symlink() for p in OWN.rglob('*') if not p.is_dir()),'activeWrites':[]})
print(json.dumps({'exactFrozenBindings':len(verified),'wholeChangedPairs':len(changed),'wholeCurrentPartnerDescriptions':len(partner_ids),'wholeCurrentNativeContexts':len(contexts['records']),'actualWholePrimaryPagesReadAndViewed':len(pages),'portabilityErrors':len(errors),'humanApproved':0,'strictGain':0}))
