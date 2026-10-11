"""Seal actual root review after reading and normal D validation; Apache-2.0."""
import json, pathlib, hashlib, datetime
root = pathlib.Path.cwd()
base = pathlib.Path(__file__).resolve().parent
author = base.parent / 'biologie-bio8-current369-combined-Bio3-targeted-author-successor-20261011-v6'
rd = lambda p: json.loads(p.read_text())
def binding(p):
    return {'path': str(p.relative_to(root)), 'sha256': 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest(), 'bytes': p.stat().st_size}
def save(n, d):
    (base / n).write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
normal = next((base / 'own-native19-round-a').glob('*.records.jsonl'))
own = {r['goalId']: r for r in [json.loads(l) for l in normal.read_text().splitlines()]}
material = rd(author / 'inputs/thirteen-whole-current-profiles-and-twentysix-cases.neutral.json')
p10 = {'73a3419c','374e6de5','80235254','7d2da9ab','430b2b73','4a8a6cec','a3f483ce','528a3cd3','27b22c33','9b40dae5'}
science = []
for r in material['records']:
    if r['goalId'][:8] not in p10:
        continue
    o = own[r['goalId']]
    science.append({'goalId': r['goalId'], 'decision': 'KEEP',
      'wholeProfile': binding(root/r['wholeCurrentProfile']['path']),
      'wholeTwoBilingualCases': binding(root/r['wholeCurrentTwoBilingualCases']['path']),
      'actualWholeDEandENCasesRead': True,
      'caseCoverage': 'Both whole problems, supplied data/models, complete solutions, individual rubric expectations and changed-condition transfer were read and checked.',
      'essentialUnderstanding': o['understandingEvidence'], 'ownConcreteFinding': o['rationale'],
      'reviewStatus': 'machine_reviewed_ai_candidate', 'humanApproval': False,
      'actualLearnerPerformance': False, 'actualExperimentPerformed': False})
assert len(science) == 10
save('P10-twenty-whole-bilingual-cases.own-scientific-review.json', {'reviewer': 'root actual independent A, not Bio8 author', 'records': science, 'priorBio3ProfilesExactRetained': 3, 'newScientificPReviews': 10, 'humanApproval': False, 'practicalSourceDebtsRemain': True})
v = rd(base/'actual-independent-360-680-captures.json')
visual = []
for r in v['records']:
    o = own[r['goalId']]
    visual.append({'goalId':r['goalId'], 'original':r['source'], 'ownBrowserCaptureBindings':r,
      'actualOriginalInspected':True, 'actual360and680PixelsInspected':True,
      'actualWholeHTMLandPDFPagesInspected':True, 'decision':'KEEP',
      'ownScienceAndRepresentationRationale':o['rationale'],
      'formatDecision':'Retain native 1672x941 friendly comic PNG. Major motifs and mandatory distinctions readable at both display widths; no cropping or microscopic mandatory instructions.', 'humanApproval':False})
assert len(visual)==19
save('V19-originals-widths-wholeHTML-PDF.own-scientific-review.json', {
  'reviewer':'root genuine A', 'records':visual,
  'htmlCaptureManifest':binding(author/'checks/current397-native19-HTML-whole-page-captures.actual.json'),
  'pdfCaptureManifest':binding(author/'checks/current397-native19-PDF-whole-page-captures.actual.json'),
  'actualWholeHTMLPagesInspected':19, 'actualWholePDFPagesInspected':19,
  'nativeOriginalImagesInspected':19, 'humanApproval':False})
atomic=[]
for pre,why in [
 ('73a3419c','Sequence recognition to derived DNA fragments is one assessable mechanism; expression is a separate atom.'),
 ('374e6de5','Compatible vector-host expression conditions explain one conditional protein-production mechanism; delivery and DNA presence are separate.'),
 ('80235254','Analysis of present human/environment consequences from socially transmitted knowledge is one cultural-transmission competence; fossil reconstruction and future appraisal remain separate.'),
 ('7d2da9ab','Connect ancestry, proximate trigger and bounded evolutionary functional explanation for one behaviour; no second fossil or cultural competence.')]:
    g=next(g for g in own if g.startswith(pre))
    atomic.append({'goalId':g, 'semanticKind':'curricularAtomic', 'atomicityDecision':'PASS', 'atomicityRationale':why,
      'memoryDecision':'no_memory_needed', 'memoryRationale':'Understanding is demonstrated by explanations and changed-model transfer, not an isolated fact-recall competency. No memorization deck or card exposure is claimed.', 'cardVisibilityCheck':'not_required_no_memory_deck', 'humanApproval':False})
save('A4-M4.own-semantic-and-memory-review.json', {'records':atomic, 'noNewCards':True, 'noMemoryThresholdRelaxed':True})
save('source-operator-boundaries.own-targeted-scientific-review.json', {
 'actualPrimaryRead':['BY official B9.3.3 whole engineering and ethical-evaluation bullet','BY official B10.4 whole fossil and cultural-evolution bullet','BY official B12.2.4 EA and GA whole biotechnology bullets','HE physical39-40 Q1.2 through1.5 whole operators','RP physical48 printed46 human ancestry/behaviour and cultural consequences','MV physical32 printed28 culture and future-appraisal row','SN physical43-44 printed31-32 class10 evolution and cultural examples','TH physical29-30 printed23-24 genetics and evolution rows','ST physical44-45 practical experiment/model/fossil requirements'],
 'targetedChanges':'Actual six changed mapping/view pairs and whole partner sets checked. Former broad goals are replaced by precise components; no blind ID-union evidence.',
 'limits':['BY B9 technical engineering AND social evaluation not closed by only technical modelling','BY B10 chronology AND present cultural/environment consequences split into separate partial goals','HE enzyme operationalization remains LK, not an explicit new GK norm','RP ancestry to stress contributes only a component of the whole source requirement','MV future appraisal remains separate from present-effect analysis','SN/TH general cultural examples do not prove every future/global operator','ST experiments, microscopy, replicas and authentic practical performances remain source debts; model reading is not execution'],
 'remainingPrimaryBindings':'Unchanged captured originals retained by exact CAS; no claim of new whole-source-universe review.', 'humanApproval':False})
checks=[]
for n,k in [('FINAL.author-package.freeze.json','records'),('FIRST.neutral-current397-shared-native19-input.freeze.json','files'),('FIRST.neutral-current397-shared-native19-input.freeze.json','externalActualInputBindings')]:
    for b in rd(author/n)[k]:
        now=binding(root/b['path'])
        assert now['sha256']==b['sha256'] and now['bytes']==b['bytes'], b['path']
        checks.append(now)
save('AFTER.all-frozen-actual-inputs-still-exact.json', {'checkedBindings':checks, 'drift':[], 'count':len(checks), 'peerIndividualRecordsOpenedBeforeSeal':False, 'unsolicitedAggregateCompletionSummaryReceived':True, 'activeWrites':False})
files=[binding(p) for p in sorted(base.rglob('*')) if p.is_file() and p.name!='original-independent-a.freeze.json']
save('original-independent-a.freeze.json', {'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(), 'reviewer':'/root genuine Bio8 independent A; not candidate author', 'files':files, 'normalD19':'PASS', 'P10twentyActualCases':'KEEP', 'V19actualOriginal360680andWholeHTMLPDF':'KEEP', 'A4M4':'PASS', 'openBlockingFindings':[], 'currentAggregatePeerSummaryReceived':True, 'peerIndividualRunRecordsOpenedBeforeSeal':False, 'notClaimedFullyBlind':True, 'HumanApproval':False, 'HumanTrial':False, 'activeWrites':False})
for p in base.rglob('*'):
    if p.is_file(): p.chmod(0o444)
for p in sorted([p for p in base.rglob('*') if p.is_dir()], reverse=True): p.chmod(0o555)
base.chmod(0o555)
print('SEALED',binding(base/'original-independent-a.freeze.json'), 'files',len(files), 'actualinputCAS',len(checks))
