"""Record actually read primary sections and reuse exact current A/M decisions.

Official full texts remain local cache; this writes own summaries and references.
No active source map, curriculum, registry or review ledger is modified.
"""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json

D = Path(__file__).resolve().parent
ROOT = D.parents[6]
CACHE = Path('/tmp/skillpilot-ecology20b-current-primary-readings')
OLD = D.parent / 'biologie-ecology20-current391-author-v2'
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def rel(p): return str(p.relative_to(ROOT))
def write(name, value):
    p = D / name
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return p

whole = json.loads((D/'current20-whole-DEEN-goals.actual.json').read_text())['goals']
ids = [g['id'] for g in whole]
selected = set(ids)
canonical = ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
current = json.loads(canonical.read_text())
active_goals = {g['id']:g for g in current['goals']}
assert all(active_goals[g['id']] == g for g in whole)

materials = json.loads((D/'materials-revision-v2/twenty-whole-goals-forty-complete-DEEN-cases.author-v2.json').read_text())
md = ['# Zwanzig ganze aktuelle Ziele: 40 zweisprachige eigene Fälle, Fassung v2',
      '', 'Autorkandidaten. Keine reale Lernendenleistung und keine menschliche Freigabe. Acht Quellen-/Kurs-HOLDs werden nicht streng abgeschlossen.', '']
for n, item in enumerate(materials['goals'], 1):
    md += [f"## {n}. {item['wholeGoal']['title']} ({item['goalId']})", '', item['wholeGoal']['description'], '', item['wholeGoal']['descriptionEn'], '']
    for c in item['cases']:
        md += [f"### {c['id']}", '']
        for language in ['de','en']:
            md += [f"**{language.upper()} – Material**", '', c['material'][language], '', '**Auftrag / Task**', '', c['task'][language], '', '**Modellantwort / Model answer**', '', c['modelAnswer'][language], '']
    if 'courseBoundConditionalExtension' in item:
        md += ['### Nur BY13-EA 4.1: bedingte Lotka-Volterra-Erweiterung', '', 'Diese Erweiterung ist keine gemeinsame GK-Pflicht. Beide gemeinsamen Modellfälle oben bleiben vollständig.', '']
        c = item['courseBoundConditionalExtension']['wholeConditionalCase']
        for language in ['de','en']:
            md += [f"**{language.upper()} – Material**", '', c['material'][language], '', '**Auftrag / Task**', '', c['task'][language], '', '**Modellantwort / Model answer**', '', c['modelAnswer'][language], '']
(D/'materials-revision-v2/twenty-whole-goals-forty-complete-DEEN-cases.author-v2.md').write_text('\n'.join(md))

entries = []
def source(key, url, primary, text, sections, own_summary, boundary):
    assert primary.is_file() and text.is_file()
    entries.append({'sourceKey':key, 'officialUrl':url, 'readDate':'2026-10-07',
        'actualPrimarySha256':sha(primary), 'actualExtractedReadingSha256':sha(text),
        'actualPrimaryBytes':primary.stat().st_size,
        'sectionsActuallyRead':sections, 'ownReadingSummary':own_summary,
        'scopeBoundary':boundary, 'actualReadingMethod':'Read the indicated complete extracted sections, then compared the whole goal and both complete author cases. Hashes identify actual inputs; they are not scientific approval.',
        'localCacheOnly':True, 'rawSourceIsCommitPayload':False,
        'rehydration':'Download the exact official URL into a local cache, compare the primary SHA-256, then extract PDF with pdftotext -layout or HTML with the recorded extraction method. If primary bytes differ, treat that as a new source version and review affected scope; retain this receipt unchanged.',
        'thirdPartyRights':'Official third-party curriculum. No SkillPilot license grant, full-text redistribution clearance or human release inferred.'})

source('HE-active-atlas-2025-10', 'https://kultus.hessen.de/sites/kultus.hessen.de/files/2025-10/kerncurriculum_gymnasiale_oberstufe-biologie.pdf',
       ROOT/'curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-biologie.pdf', CACHE/'HE-active-atlas.txt',
       ['Printed pages 44–48: complete Q3 and Q4 passages, course distinctions and mandatory-field headings'],
       'Q3.1 requires trophic webs, energy and ecological relationships; LK adds exponential/logistic models, r/K and quantitative methods. Q3.3 contains heat/water regulation, LK torpor/hibernation. Q4.1 covers climate, biodiversity and cause-based management; LK adds footprint. Q4 introduction uses ecological models for decision support. Q4.2 concerns succession rather than Lotka-Volterra.',
       'HE Q3 only fields 1/2 mandatory and Q4 only field 1 mandatory. Q3.3 and Q4.2 are not universal duties. This is the actual current atlas file, distinct from the historically read 2024-11 capture; printed-page bindings are not silently inherited.')
for key, file, course, sections, summary, boundary in [
    ('BY12-GA','BY12-GA-official','12/biologie/grundlegend',['Complete 4.2 behavioural ecology contents and competences'], 'Methods, costs/benefits and optimality of behaviour, direct/indirect fitness, cooperation/aggression and reproductive investment support evolutionary interpretation of courtship, territoriality and cooperation.', 'The selected behavioural goal is a component of 4.2; no whole-passage methods or all fitness duties are claimed from two interpretation cases.'),
    ('BY13-GA','BY13-GA-official','13/biologie/grundlegend',['Complete 4.1 ecology contents and competences'], 'Food webs, energy/carbon, exponential/logistic population dynamics, actual field investigation and actual laboratory ecological-potency investigations are explicit.', 'GA model duties do not explicitly force Lotka-Volterra. Whole field/laboratory duties remain actual performance duties; model answers do not claim their completion.'),
    ('BY13-EA','BY13-EA-official','13/biologie/erhoeht',['Complete 4.1, 4.2 and 4.3 contents and competences'], 'EA 4.1 adds quantitative ecology, r/K, explicit Lotka-Volterra and nitrogen. EA 4.2 covers ecosystem-service categories and economic costs, monetarization limits and ecological/anthropocentric management judgments. EA 4.3 addresses biome interactions, sinks and anthropogenic climate/biodiversity consequences.', 'Only the explicit EA 4.1 conditional case uses required Lotka-Volterra. Endocrine pollution/management/sinks do not establish generic whole biomagnification, stochastic metapopulation, quantified selection pressure, tipping or formal resilience duties.')]:
    source(key, 'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/'+course,
           OLD/'primary-inputs'/f'{file}.html', OLD/'primary-inputs'/f'{file}.actual-text.txt', sections, summary, boundary)
source('NI-SekII-2022','https://cuvo.nibis.de/index.php?p=download&upload=359',CACHE/'NI.pdf',CACHE/'NI.txt',
       ['Printed page 19: mesophyte/xerophyte structure and method duties','Printed pages 23–24: complete ecology 3.1–3.4 contents and competences'],
       'Leaf structure/function, actual field and laboratory methods, community interactions, exponential/logistic growth and r/K, trophic biomass/energy and endocrine effects, preservation/restoration and regenerative capacity are explicit.',
       'Regenerative capacity is a relevant resilience component, not exact formal resistance/recovery-concept coverage. Hormone effects do not establish whole bioaccumulation/biomagnification. No exact advanced eight-facet proof or active map addition follows.')
source('NW-GO-2022','https://lehrplannavigator.nrw.de/system/files/media/document/file/gost_klp_bi_2022_06_07.pdf',CACHE/'NW.pdf',CACHE/'NW.txt',
       ['Printed pages 39–40: complete GK ecology contents and competences','Printed pages 49–50: complete LK ecology contents and competences'],
       'GK ecology explicitly covers webs, carbon/energy, climate, cause-based preservation/restoration management and qualitative field work. LK adds quantitative field work, r/K and logistic/exponential dynamics, nitrogen, endocrine substances and footprint.',
       'Graphical ideal/real dynamics and uncertainty do not establish specific stochastic patch models, fitness coefficients, tipping points, scenario algorithms or formal resilience. No source/map/applicability activation is performed.')
source('BB-BE-GO-2022','https://bildungsserver.berlin-brandenburg.de/fileadmin/bbb/unterricht/rahmenlehrplaene/gymnasiale_oberstufe/curricula/2022/Teil_C_RLP_GOST_2022_Biologie.pdf',CACHE/'BB-BE.pdf',CACHE/'BB-BE.txt',
       ['Printed pages 33–34: complete 3.2.2 ecology GK/LK table'],
       'GK explicitly includes Lotka-Volterra rules alongside biotic relationships and competition; management and climate include preservation/restoration. LK adds logistic/exponential dynamics, r/K, quantitative field work, nitrogen, endocrine effects, footprint and plant climate adaptation.',
       'The current selected model goal does not have BB/BE applicability. This actual GK source does not justify forcing a universal GK Lotka-Volterra obligation into its current common P expectations. Eight advanced whole facets remain unsupported.')
source('TH-AHR-2024','https://www.schulportal-thueringen.de/tip/resources/medien/63705?dateiname=Biologie_Lehrplan_AHR_2024-11-13.pdf',
       ROOT/'curricula/DE/Gymnasium/input/TH/LP_GY_Biologie_2024.pdf',CACHE/'TH.txt',
       ['Printed pages 47–48: complete ecology course content/method distinction'],
       'GK covers trophic/carbon community structure and preservation/restoration, sustainable use and biodiversity. LK covers logistic/exponential growth, r/K, self-regulation, nitrogen, succession, footprint and endocrine pollution. Actual excursion methods are qualitative GK/quantitative LK.',
       'Self-regulation and protection management are not exact whole sources for stochastic metapopulation, quantified fitness, ecological tipping or formal resilience. Actual field duties remain genuine future performance.')
source('SN-current-capture-labelled-2025','https://www.schulportal.sachsen.de/lplandb/lehrplan/file/522/OF2Vfum2JVmFeuc2FOuf',
       ROOT/'curricula/DE/Gymnasium/input/SN/lehrplan-gymnasium-biologie-sachsen-2025.pdf',CACHE/'SN.txt',
       ['Printed page 39: complete GK11 optional flowing-water ecology section','Printed page 48: complete LK11 ecology section'],
       'The actual source body carries 2022 curriculum dating. GK11 optional flowing-water investigations and LK11 ecology explicitly mention reintroduction projects. LK ecology includes LV, exponential/logistic growth, r/K, carbon/nitrogen and trophic energy, restoration/sustainable use and footprint.',
       'Reintroduction is genuinely supported in these bounded SN passages. The current reintroduction target is BY/HE-only and has no reviewed SN mapping route, so this does not resolve its current source/course binding. No generic country-wide or universal GK requirement is asserted.')

hold = {9:'Generic bioaccumulation and biomagnification plus pollutant-effect assessment are not established by endocrine-substance components.',
        10:'Whole random/stochastic population or patch-occupancy model use is not established by deterministic dynamics or uncertainty language.',
        12:'Interpreting actual fitness curves and quantifying selection pressure are not established by r/K or generic fitness/cost-benefit language.',
        15:'SN explicitly supports reintroduction but the current BY/HE-only target lacks a reviewed SN source/applicability route; restoration alone does not cover reintroduction.',
        17:'Whole demographic sources/sinks and colonization modelling are not established by biome carbon sinks or generic population dynamics.',
        18:'Nonlinear ecological tipping-point recognition and consequent management are not established by generic management/self-regulation.',
        19:'Explicit management comparison under distinct climate/land-use scenarios is not established by a generic climate or management duty alone.',
        20:'A formal resilience concept distinguishing disturbance resistance/recovery and deriving management is not established by generic stability/regeneration alone.'}
eligible=[i for i in range(1,21) if i not in hold]
receipt = {'schemaVersion':1, 'artifactKind':'actual-bounded-primary-reading-and-current-whole-source-boundaries-author-v1',
    'authorRole':'material author, not an independent reviewer', 'recordedAt':datetime.now(timezone.utc).isoformat().replace('+00:00','Z'),
    'actualCanonicalSha256AtBoundaryPreparation':sha(canonical), 'wholeSelectedGoalBodiesEqualActive':True,
    'sourceEntries':entries, 'sourceCoverageClaim':'Actually read identified sections and assessed whole selected goal obligations. No claim to have read every full curriculum book and no new active mapping coverage asserted.',
    'twelveCandidatesForIndependentWholeScienceAndActualRasterReview':[{'ordinal':i,'goalId':ids[i-1]} for i in eligible],
    'eightNotEligibleForStrictCompletion':[{'ordinal':i,'goalId':ids[i-1], 'wholeObligationSourceHold':reason, 'status':'HOLD', 'nativeImageGenerationAuthorized':False} for i,reason in hold.items()],
    'sameSourceComponentsNotWholePassageApproval':True, 'courseBoundLVOnlyBYEA':True, 'actualFieldPerformanceNotClaimed':True,
    'rawOfficialFullTextsCopiedToDossier':False, 'sourceCacheUsedAsPResource':False,
    'activeWrites':0,'strictClosuresClaimed':0,'humanApproval':False}
write('nine-actual-primary-bounded-reading-and-eight-source-HOLD.author.receipt.json',receipt)

ret = D/'retained-current-AM'
ret.mkdir(exist_ok=True)
amreceipt = {'schemaVersion':1,'artifactKind':'current-AM-exact-binding-retention-no-new-scientific-review',
             'wholeSelectedGoalBodiesEqualActive':True,'canonicalSha256':sha(canonical), 'retained':[], 'newMemoryDecks':0,'activeWrites':0}
for gate, review in [('A','curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-biology-full.review.jsonl'),('M','curricula/DE/Gymnasium/quality/memory-card-review/canonical-biology-full.review.jsonl')]:
    original=ROOT/review
    lines=original.read_text().splitlines(keepends=True)
    exact=[line for line in lines if json.loads(line)['goalId'] in selected]
    assert len(exact)==20
    rows=[json.loads(line) for line in exact]
    assert all(r['status']==('atomic' if gate=='A' else 'no_memory_needed') for r in rows)
    dest=ret/f'{gate}20.exact.rows.jsonl'
    dest.write_text(''.join(exact))
    conf=json.loads((OLD/f'{gate}20.current.native.config.json').read_text())
    conf['reviewPath']=rel(dest)
    conf['scope']={'label':'20 unchanged further ecology goals; exact valid A/M decisions retained, no new scientific judgments','leafGoalIds':ids}
    if gate=='M':
        cards=ROOT/'curricula/DE/Gymnasium/quality/memory-card-review/canonical-biology-full.cards.review.jsonl'
        cardlines=[line for line in cards.read_text().splitlines(keepends=True) if selected.intersection(json.loads(line)['originGoalIds'])]
        assert not cardlines
        carddest=ret/'M20.exact.in-scope.cards.jsonl'
        carddest.write_text('')
        conf['cardReviewPath']=rel(carddest)
        amreceipt['actualCurrentCardRecordsWhoseOriginIntersectsTwenty']=0
        amreceipt['currentWholeCardLedgerSha256']=sha(cards)
    write(f'{gate}20.current.native.config.json',conf)
    amreceipt['retained'].append({'gate':gate,'originalReviewPath':review,'originalReviewSha256':sha(original),'selectedExactRowsPath':rel(dest),'selectedExactRowsSha256':sha(dest),'records':20,'statuses':{r['goalId']:r['status'] for r in rows},'newScientificReview':False})
write('current-twenty-retained-AM.exact-binding.author.receipt.json',amreceipt)

native=json.loads((D/'native20.neutral.batch.config.json').read_text())
native['batchId']='biologie-ecology20b-twelve-source-bounded-current391-20261007'
native['bookId']='biologie-ecology20b-twelve-source-bounded-current391'
native['title']='Biologie – zwölf aktuelle quellenbegrenzte weitere Ökologieziele'
native['goalIds']=[ids[i-1] for i in eligible]
native['outputDirectory']=rel(D/'native12')
write('native12.source-bounded.neutral.batch.config.json',native)
print(json.dumps({'sourceEntriesActuallyRead':len(entries),'wholeCases':sum(len(g['cases']) for g in materials['goals']),'sourceBoundedImageCandidates':len(eligible),'sourceHOLDs':len(hold),'exactRetainedA':20,'exactRetainedM':20,'activeWrites':0}))
