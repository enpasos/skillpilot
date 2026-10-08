# SPDX-License-Identifier: Apache-2.0
"""Prepare inactive native inputs after actual independent source/class/A/M science.

This preserves all original reviews and every unrelated goal. It does not
create a description review, visual approval, human approval or strict closure.
"""
from pathlib import Path
import copy
import hashlib
import json
import os
import re
import shutil

D = Path(__file__).resolve().parent
R = D.parents[6]
GID = '1b7f08a1-33df-5779-af66-430c91d699b7'
OLD = D.parent / 'biologie-he9-eighteen-final-raster-native-author-root-20261008-v1'
SCIENCE = D.parent / 'biologie-he9-genetic-method19-targeted-English-whole-science-author-root-v2'
read = lambda p: json.loads(p.read_text())
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()

def write(p, data):
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open('x') as f:
        f.write(data if isinstance(data, str) else json.dumps(data, ensure_ascii=False, indent=2) + '\n')

seals = []
for folder, name, expected in [
    ('biologie-he9-genetic-method19-targeted-English-source-class-AM-independent-a-20261008-v2',
     'first-whole19-English-source-class-AM-science.independent-a.exact.freeze.json',
     '5bc619ed56b98f9c28a1f799e2831ed5c3adf33d5d12857edefd1684d83c2b88'),
    ('biologie-he9-genetic-method19-targeted-English-source-class-AM-independent-b-20261008-v2',
     'one-whole-English-source-class-AM.independent-b.science-first.freeze.json',
     '1ad45fc63531f91de5aaa295294aa71e1383ca80b423afb517f31f2931be1aa1'),
]:
    p = D.parent / folder / name
    assert sha(p) == expected
    payload = read(p)
    for row in payload['frozenFiles']:
        f = R / row['path']
        assert sha(f) == row['sha256'].removeprefix('sha256:')
        assert f.stat().st_size == row['bytes']
    seals.append({'path': str(p.relative_to(R)), 'sha256': expected,
                  'actualReviewedFiles': len(payload['frozenFiles'])})
assert read(D.parent / seals[0]['path'].split('/')[-2] / seals[0]['path'].split('/')[-1])['whole19SourceEnglishSciencePASS'] is True
assert read(R / seals[1]['path'])['correctedWholeGoalSourceScienceVerdict'] == 'PASS'
for p in [R / s['path'] for s in seals]:
    payload = read(p)
    assert payload.get('semanticKind', payload.get('semanticKindScientificDecision')) == 'curricularAtomic'
    assert payload.get('memory', payload.get('memoryScientificDecision')) == 'no_memory_needed'

canonical_path = R / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
current = read(canonical_path)
original = read(SCIENCE / 'original-whole-current-DEEN-goal.exact.json')['goal']
proposed = read(SCIENCE / 'proposed-whole-current-DEEN-goal.targeted-English.author.json')['goal']
assert [g for g in current['goals'] if g['id'] == GID] == [original]
assert [k for k in set(original) | set(proposed) if original.get(k) != proposed.get(k)] == ['titleEn', 'descriptionEn'] or {k for k in set(original) | set(proposed) if original.get(k) != proposed.get(k)} == {'titleEn', 'descriptionEn'}
assert len(current['goals']) == 474
candidate = copy.deepcopy(current)
goal = next(g for g in candidate['goals'] if g['id'] == GID)
goal.clear(); goal.update(proposed)
image = read(SCIENCE / 'actual-unchanged-PNG-width-and-native-original-page.exact.json')['image']
image_path = R / image['path']
assert sha(image_path) == image['sha256']
assert not any(l.get('type') == 'goal-visualization' for l in goal.get('resourceLinks', []))
url = f'/assets/goal-visualizations/biologie/{GID}/{GID}.png'
goal['resourceLinks'] = goal.get('resourceLinks', []) + [{
    'type': 'goal-visualization', 'resourceType': 'image', 'role': 'primary',
    'skillpilotId': GID, 'title': 'Visualisierung: ' + goal['title'], 'url': url,
    'provider': image['provider'], 'description': image['altDe'], 'altText': image['altDe'],
    'lang': 'de', 'license': 'CC-BY-4.0', 'reviewStatus': 'pilot',
}]
selected = D / 'selected-images' / f'{GID}.png'
selected.parent.mkdir(parents=True, exist_ok=True)
assert not selected.exists(); shutil.copyfile(image_path, selected)
alias = D / url.lstrip('/')
alias.parent.mkdir(parents=True, exist_ok=True)
alias.symlink_to(os.path.relpath(selected, alias.parent))
assert alias.resolve(strict=True) == selected
qa_path = R / 'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json'
oldqa = read(qa_path); qa = copy.deepcopy(oldqa)
q = next(q for q in qa['records'] if q['goalId'] == GID)
assert q['visualizationState'] == 'missing'
q.update(visualizationState='available', missingReason='', imageUrl=url,
         publicAssetPath=str(selected.relative_to(R)), canonicalAssetPath=str(selected.relative_to(R)),
         assetSha256='sha256:' + image['sha256'], umlautsCorrectChatGpt='no',
         contentApprovedChatGpt='no', chatGptReviewedAt=None, chatGptReviewer='',
         chatGptNotes='Actual unchanged raster with newly reviewed English scope; current native D/P/V binding reviews pending.')
kinds = read(R / 'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json')
assert kinds['counts']['total'] == 474 and kinds['counts']['curricularAtomic'] == 391
for name, value in [
    ('canonical.before-one-links.exact.json', current),
    ('canonical.current474-one-new-raster-author.json', candidate),
    ('semantic-kinds.before-one-links.exact.json', kinds),
    ('semantic-kinds.current-source.exact.json', kinds),
    ('visualization-qa.before-one-links.exact.json', oldqa),
    ('visualization-qa.current391-one-raster-author.json', qa),
]: write(D / 'candidate' / name, value)
write(D / 'current1-whole-DEEN-goals.actual.json', {'goals': [proposed], 'activeWrites': 0})
write(D / 'actual-paired-science-class-AM-adoption-input.json', {
    'genuineIndependentScienceSeals': seals,
    'sourceLandscapeBeforeSha256': sha(canonical_path), 'wholeUnrelatedGoalBodiesRetained': 473,
    'reviewedTextChangeFields': ['titleEn', 'descriptionEn'],
    'genuineClassification': 'curricularAtomic', 'genuineAtomicity': 'atomic',
    'genuineMemory': 'no_memory_needed', 'newCards': 0,
    'nativeCurrentD1P1V1BindingApproval': 'pending', 'activeWrites': 0,
    'strictGainClaimed': 0, 'humanApproval': False,
})
for kind in ['semantic-atomicity', 'memory-card-review']:
    path = R / f'curricula/DE/Gymnasium/quality/{kind}/canonical-biology-full.review.jsonl'
    shutil.copyfile(path, D / 'candidate' / f'{kind}.before.exact.jsonl')
    config = read(R / f'curricula/DE/Gymnasium/quality/{kind}/canonical-biology-full.config.json')
    config['landscapePath'] = str((D / 'candidate/canonical.current474-one-new-raster-author.json').relative_to(R))
    config['reviewPath'] = str((D / 'candidate' / f'{kind}.current-full-reviewed.jsonl').relative_to(R))
    config['reportPath'] = str((D / 'native-raster-candidate' / f'{kind}.actual-native-report.md').relative_to(R))
    write(D / 'candidate' / f'{kind}.full.inactive.config.json', config)
    one = copy.deepcopy(config)
    one['scope'] = {'label': 'One genuinely independently reviewed current gene-technology goal', 'leafGoalIds': [GID]}
    write(D / 'candidate' / f'{kind}.one.inactive.config.json', one)

profile = read(SCIENCE / 'one-whole-positive-profile.unchanged.exact.json')
old_candidates = read(OLD / 'eighteen-current-closed-contract.author.candidates.json')
old_candidates['goals'] = [profile]
write(D / 'one-current-closed-contract.author.candidates.json', old_candidates)
case = read(SCIENCE / 'two-whole-complete-DEEN-cases.unchanged.exact.json')
write(D / 'one-whole-goal-two-complete-DEEN-cases.exact.json', {'goals': [case]})
md = ['# Gentechnik: ein aktuelles ganzes Ziel, zwei vollständige bilinguale Fälle', '',
      'Eigene synthetische Materialien; keine tatsächliche Lernendenleistung oder menschliche Freigabe.', '']
for c in case['cases']:
    md += ['## ' + c['id'], '']
    for lang in ['de', 'en']:
        md += ['### ' + lang.upper(), '', c['material'][lang], '', c['task'][lang], '', c['modelAnswer'][lang], '']
write(D / 'one-whole-goal-two-complete-DEEN-cases.exact.md', '\n'.join(md) + '\n')
config = read(OLD / 'native18.neutral.batch.config.json')
config.update(batchId='biologie-he9-genetic-method19-one-current391-author-v3-20261008',
              bookId='biologie-he9-genetic-method19-one-current391-author-v3',
              title='Biologie – Grundbegriffe der Gentechnik',
              goalIds=[GID], outputDirectory=str((D / 'native-raster-candidate').relative_to(R)))
write(D / 'native1.neutral.batch.config.json', config)

native = (OLD / 'materialize-final-eighteen-native-author.mts').read_text()
native = native.replace('biologie-he9-eighteen', 'biologie-he9-genetic-method19-v3')
native = native.replace('current18', 'current1').replace('native18', 'native1').replace('P18', 'P1')
native = native.replace('eighteen', 'one').replace('373', '390')
native = re.sub(r'\b18\b', '1', native)
native = re.sub(r'\b40\b', '2', native)
native = native.replace('achtzehn aktuelle Ziele zu Flora und Fauna', 'Grundbegriffe der Gentechnik')
native = native.replace("// Source-fingerprint fields are unchanged: linking pictures never becomes a new A/M verdict.",
                        "// Exact new classification is adopted only after real independent whole-source science A and B.")
needle = "for(const decision of kinds.decisions)assert.equal(decision.sourceFingerprint,fingerprintSemanticKindSourceGoal(by.get(decision.goalId)))"
replacement = """const adoption=read(resolve(own,'actual-paired-science-class-AM-adoption-input.json'))
assert.equal(adoption.genuineClassification,'curricularAtomic')
const targetId=ids[0]
for(const decision of kinds.decisions){
  if(decision.goalId===targetId)decision.sourceFingerprint=fingerprintSemanticKindSourceGoal(by.get(targetId))
  else assert.equal(decision.sourceFingerprint,fingerprintSemanticKindSourceGoal(by.get(decision.goalId)))
}
const normalized=(v:any)=>String(v??'').normalize('NFKC').replace(/\\s+/g,' ').trim()
const stable=(v:any):string=>Array.isArray(v)?'['+v.map(stable).join(',')+']':v&&typeof v==='object'?'{'+Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,x])=>JSON.stringify(k)+':'+stable(x)).join(',')+'}':JSON.stringify(v)
for(const kind of ['semantic-atomicity','memory-card-review']){
  const rows=readFileSync(resolve(own,'candidate/'+kind+'.before.exact.jsonl'),'utf8').trim().split('\\n').map(s=>JSON.parse(s))
  const row=rows.find((r:any)=>r.goalId===targetId);assert.ok(row)
  const g=by.get(targetId),rule=row.ruleVersion
  const payload={ruleVersion:rule,goalId:g.id,shortKey:g.shortKey??'',title:normalized(g.title),titleEn:normalized(g.titleEn),description:normalized(g.description),descriptionEn:normalized(g.descriptionEn),phase:normalized(g.dimensionTags?.phase),area:normalized(g.dimensionTags?.area),topicCode:normalized(g.dimensionTags?.topicCode),nodeKind:normalized(g.nodeKind)}
  row.fingerprint=sha(stable(payload));row.reviewedAt=new Date().toISOString()
  row.reviewer='technical-adoption-of-genuine-independent-whole-science-A-and-B'
  row.reason=kind==='semantic-atomicity'?'Both independent whole-source reviews confirm one bounded gene-technology comparison and principle sketch using the complete two bilingual cases. Gentest, somatic gene therapy and DNA cloning are comparisons within this performance; no three complete laboratory-procedure mastery claim. Exact science seals: '+adoption.genuineIndependentScienceSeals.map((s:any)=>s.path).join('; '):'Both independent whole-goal reviews require understanding, method comparison, justified limits and independent transfer. Isolated facts do not show this goal; no necessary memory card or new deck. Exact science seals: '+adoption.genuineIndependentScienceSeals.map((s:any)=>s.path).join('; ')
  if(kind==='semantic-atomicity'){row.status='atomic';row.semanticAtomic=true}else{row.status='no_memory_needed';row.memoryUseful=false}
  write(resolve(own,'candidate/'+kind+'.current-full-reviewed.jsonl'),rows.map((r:any)=>JSON.stringify(r)).join('\\n')+'\\n')
}
write(resolve(own,'candidate/semantic-kinds.current-reviewed-full.future-active.json'),{...kinds,sourceLandscapePath:'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'})
write(resolve(own,'actual-source-class-AM-current-native-bindings.adoption.json'),{...adoption,standardFingerprintBindingsAdoptedAfterRealScientificReviews:true,unrelatedClassificationRowsRetained:473,unrelatedAMRowsRetained:true,nativeAMChecks:'pending',humanApproval:false})"""
assert native.count(needle) == 1
native = native.replace(needle, replacement)
native = native.replace('allCurrentSemanticClassificationDecisionRowsRetained:true,retainedClassificationRows:by.size,all391AMDecisionsRetained:true,goalTextChanges:0',
                        'unrelatedSemanticClassificationRowsRetained:473,reviewedNewClassificationRows:1,newReviewedAMRows:1,goalTextChanges:1')
native = native.replace("goalIds:ordered})", "goalIds:ordered})")
native = native.replace("retained-one-AM.actual-boundary.json", "actual-paired-science-class-AM-adoption-input.json")
write(D / 'materialize-one-current-native-author.mts', native)
print(json.dumps({'inactiveWholeGoals': 474, 'wholeGoalChanges': 1, 'genuineScienceSeals': seals,
                  'newImageGeneration': False, 'nativeD1P1V1StillPending': True, 'activeWrites': 0}))
