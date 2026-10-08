# SPDX-License-Identifier: Apache-2.0
"""Append-only recording of a genuinely inspected one-goal native B review.

The observations below follow actual whole-body/case/profile reading, original
PNG and 360/680 viewing, and actual PDF/page inspection. Digests bind those
observations; digest agreement is neither science nor visual approval.
"""
import hashlib
import json
import re
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
AUTHOR = OWN.parent / 'biologie-he9-genetic-method19-current-raster-native-author-root-v3'
PREVIOUS = OWN.parent / 'biologie-he9-genetic-method19-targeted-English-source-class-AM-independent-b-20261008-v2'
OLD_NATIVE = OWN.parent / 'biologie-he9-eighteen-final-raster-native-independent-b-20261008-v1'
GID = '1b7f08a1-33df-5779-af66-430c91d699b7'

def read(p): return json.loads(p.read_text())
def rows(p): return [json.loads(s) for s in p.read_text().splitlines() if s.strip()]
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def rel(p): return str(p.relative_to(ROOT))
def bind(p): return {'path': rel(p), 'sha256': sha(p), 'bytes': p.stat().st_size}
def write(p, d):
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open('x') as f: f.write(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
def norm(s): return re.sub(r'[\s\-\u00ad\u2010\u2011]+', '', s)

seal = AUTHOR / 'one-current-raster-native-author-input.first.freeze.json'
assert sha(seal) == '3365fb5f1c055fad402d6d7ac4cd775c1a289a9135935e66a2b9ed9a618c2dbc'
frozen = read(seal)
for item in frozen['frozenFiles']:
    p = ROOT / item['path']
    assert p.is_file() and sha(p) == item['sha256'] and p.stat().st_size == item['bytes'], str(p)
assert len(frozen['frozenFiles']) == 92
old_seal = PREVIOUS / 'one-whole-English-source-class-AM.independent-b.science-first.freeze.json'
assert sha(old_seal) == '1ad45fc63531f91de5aaa295294aa71e1383ca80b423afb517f31f2931be1aa1'
for item in read(old_seal)['frozenFiles']:
    p = ROOT / item['path']; assert sha(p) == item['sha256'] and p.stat().st_size == item['bytes']
old_native_seal = OLD_NATIVE / 'completed-HE18-D17-HOLD19-P18-V18.independent-b.first.freeze.json'
assert sha(old_native_seal) == '34985105403d009f29e4b9360c5ff135c064f01d22998724fec03d2d20caf579'
entry = read(AUTHOR / 'neutral-one-current-raster-native-independent-review.entry.json')
candidate = read(AUTHOR / entry['wholeCurrentLandscape'])
goal = next(g for g in candidate['goals'] if g['id'] == GID)
previous_whole = read(ROOT / read(PREVIOUS / 'one-whole-English-source-class-AM-scientific-first.independent-b.verdict.json')['exactProposedWholeGoal']['path'])
previous_goal = previous_whole.get('goal', previous_whole.get('goals', [previous_whole])[0])
assert {k:v for k,v in goal.items() if k != 'resourceLinks'} == {k:v for k,v in previous_goal.items() if k != 'resourceLinks'}
assert goal['titleEn'] == 'Basic Concepts of Gene Technology'
assert goal['descriptionEn'] == 'The learner can outline basic methods and applications of gene technology.'
before = read(AUTHOR / 'candidate/canonical.before-one-links.exact.json')
old_goal = next(g for g in before['goals'] if g['id'] == GID)
changed = [k for k in sorted(set(old_goal) | set(goal)) if old_goal.get(k) != goal.get(k)]
assert set(changed) == {'titleEn', 'descriptionEn', 'resourceLinks'}, changed
assert len(candidate['goals']) == 474
assert all(g == next(x for x in before['goals'] if x['id'] == g['id']) for g in candidate['goals'] if g['id'] != GID)
whole = read(AUTHOR / entry['actualWholeCases'].replace('.md', '.json'))['goals'][0]
assert whole['goalId'] == GID and len(whole['cases']) == 2
positive = rows(AUTHOR / entry['actualPositiveProfile'])[0]
assert len(positive['profile']['applicationCaseBriefs']) == 2
old_p_config = read(OLD_NATIVE / 'P18.exact-inactive.native.config.json')
old_p = next(p for p in rows(ROOT / old_p_config['reviewPath']) if p['goalId'] == GID)
assert positive['profile'] == old_p['profile'], 'Previously genuinely read whole scientific P contract must be exact'
case_bindings = []
for case in whole['cases']:
    brief = next(b for b in positive['profile']['applicationCaseBriefs'] if b['id'] == case['id'])
    for language,suffix in [('de','De'),('en','En')]:
        assert brief['taskDemand' + suffix] == case['material'][language] + ' ' + case['task'][language]
        assert brief['expectedPerformance' + suffix] == case['modelAnswer'][language]
    case_bindings.append({'caseId': case['id'], 'wholeMaterialTaskAnswerExact': True, 'languages': ['de','en']})
campaign_dir = AUTHOR / entry['actualBlindCampaigns']['b']
review_input = read(campaign_dir / 'description-review-input.json')
campaign = read(campaign_dir / 'description-review-campaign.json')
bundle = read(campaign_dir / 'review-bundle-manifest.json')
g = review_input['goals'][0]
assert g['goalId'] == GID and g['goalFingerprint'] == positive['goalFingerprint']
for title,suffix in [('title','Title'),('description','Description')]:
    assert g['current'+suffix+'De'] == goal[title]
    assert g['current'+suffix+'En'] == goal[title+'En']
assert g['canonicalContext']['sourceRef'] == goal['sourceRef']
assert g['canonicalContext']['requires'] == goal['requires']
assert g['canonicalContext']['applicability'] == goal['applicability']
page = g['reviewContext']['page']
assert [p['goalId'] for p in page['externalPrerequisites']] == goal['requires']
assert page['pageFingerprint'] == g['pageFingerprint']
png = AUTHOR / entry['actualPNG']
assert sha(png) == '2f99ed69b15dcf1bb16328e56430a18e82b1f35593eba5540907dfdb7f3a8139'
assert page['visualization']['originalDigest'] == 'sha256:' + sha(png)
width_receipt = ROOT / entry['unchangedWidthCaptureReceipt']
widths = read(width_receipt)
assert widths['sourceSha256'] == sha(png)
for capture in widths['captures']:
    assert sha(ROOT / capture['path']) == capture['sha256']
pdf = AUTHOR / entry['actualCurrentNativePDF']
argv = ['pdftotext', '-layout', str(pdf), '-']
actual_pdf = subprocess.run(argv, capture_output=True, text=True)
assert actual_pdf.returncode == 0, actual_pdf.stderr
with (OWN / 'actual-complete-native-PDF-text.independent-b.txt').open('x') as f: f.write(actual_pdf.stdout)
assert len(actual_pdf.stdout.split('\f')) - 1 == 3
assert norm(goal['description']) in norm(actual_pdf.stdout)
assert norm(goal['title']) in norm(actual_pdf.stdout)
assert actual_pdf.stdout.count('Lernziel-ID ' + GID) == 1
for terminal in ['A1-scoped.terminal.actual.json','M1-scoped.terminal.actual.json','M-full-new-one-retained390.terminal.actual.json']:
    t=read(AUTHOR / terminal)
    assert t.get('exitCode',t.get('exit_code')) == 0, t
started = datetime.now(timezone.utc).isoformat()
write(OWN / 'exact-neutral-input-and-retained-science-bindings.independent-b.actual.json', {
    'schemaVersion':1,'artifactKind':'independent-B-one-genuine-native-targeted-input-and-old-science-retention',
    'recordedAt':started,'authorSeal':bind(seal),'frozenAuthorFilesVerified':92,
    'ownPreviousWholeSourceScienceFirstSeal':bind(old_seal),'ownOriginalHE18HoldFirstSealRetained':bind(old_native_seal),
    'wholeCurrentGoal':bind(AUTHOR / 'current1-whole-DEEN-goals.actual.json'),
    'wholeGoalComparedToOwnGenuinelyReviewedCorrection':True,'changedFromAuthorBeforeFields':changed,
    'unrelatedWholeGoalsExactRetained':473,'wholePScientificContractExactRetained':True,'wholeCases':case_bindings,
    'actualNativePInput':bind(AUTHOR / entry['actualPositiveProfile']),
    'actualRoundBInput':bind(campaign_dir / 'description-review-input.json'),
    'actualWholeThreePagePDF':bind(pdf),'actualWholePDFExtractionExit':0,'actualPhysicalGoalPage':3,
    'actualPageCapture':bind(AUTHOR / entry['actualCurrentNativePageCapture']),
    'actualPNG':bind(png),'actual360And680':[bind(ROOT / c['path']) for c in widths['captures']],
    'sourceRef':goal['sourceRef'],'sourceProvenance':goal['extendedData']['provenance'],
    'directPrerequisitesWholeSourceAndPageExact':True,'rawApplicabilityNotUniversalSourceProof':True,
    'existingActualAuthorScopedA1M1AndFullMemoryTerminals': [bind(AUTHOR / n) for n in ['A1-scoped.terminal.actual.json','M1-scoped.terminal.actual.json','M-full-new-one-retained390.terminal.actual.json']],
    'technicalTerminalsNotNewScientificJudgments':True,'peerANewNativeOutputsRead':False,
    'activeWrites':0,'strictGainClaimed':0,'humanApproval':False,'humanTrial':False})

science = 'Die tatsächlichen DE/EN-Texte nennen denselben Grundbegriffs-/Skizzenumfang der Gentechnik. Der ganze original gebundene HE9.4-Punkt nennt Gentest, Gentherapie und Klonen. Die bereits eigenständig ganz geprüfte Zwei-Fall-P-Wissenschaft ist exakt erhalten: Untersuchung und Referenzvergleich ausgewählter DNA; somatische funktionelle Genkopie in bestimmten Körperzellen; DNA-Vermehrung in Trägerzellen. Der neue rekombinante Insulinproduktionskontext trennt intronfreie codierende DNA, Expression und Proteinaufbereitung von Genübertragung in den Empfänger. Keine ganze Person kloniert, keine absolute Wirksamkeit, keine realen Labor-/Krankheitssequenzen oder Lernendenleistungen behauptet. Gene Technology führt keine allgemeine Fermentationspflicht und keine reine Editing-Einschränkung ein.'
visual = 'Tatsächlich erneut gesehen: vollständiges 1672×941-PNG, echte Chromium360/680-Ansichten sowie die neue ganze native physische Buchseite3. Drei klare Motive trennen ausgewählte DNA-Untersuchung, funktionelle Genkopie in Körperzelle und Plasmid-DNA-Kopien in Bakterien. Vorhandene DNA bleibt im Zellkern dargestellt; keine Proteinverabreichung als Gentherapie und kein Klonen ganzer Menschen. Die drei Haupttitel und Motive sind bei360 erkennbar, kleine Zusatzwörter dort nicht komfortable Pflichtlektüre; bei680 und nativer Seite lesbar. Alt-Text beschreibt genau die drei Motive. Keine handelnde Person, Heft- oder Messperspektive, keine photorealistische Neugestaltung. Seite3 enthält ganze DE-Beschreibung, Herkunftskontext, unveränderte begrenzte Geltung und beide externen Voraussetzungen ohne Beschnitt oder Text-/Bildwiderspruch.'
write(OWN / 'actual-one-PNG-widths-new-native-page-V.independent-b.first.verdict.json', {
    'schemaVersion':1,'artifactKind':'independent-B-actual-targeted-one-native-page-and-retained-raster-V-first',
    'recordedAt':started,'actualReviewer':'/root/flora_fauna_independent_a','assignedIndependentRole':'B',
    'goalId':GID,'decision':'KEEP','fachlich':'PASS','visual':'PASS','actualReasonDe':visual,
    'goalFingerprint':g['goalFingerprint'],'pageFingerprint':g['pageFingerprint'],'bookDigest':review_input['bookDigest'],
    'actualImage':bind(png),'actualPDF':bind(pdf),'actualPage':bind(AUTHOR / entry['actualCurrentNativePageCapture']),
    'physicalPage':3,'actualWidths':[bind(ROOT / c['path']) for c in widths['captures']],
    'unchangedImageWholePreviousScienceRetained':True,'newNativePageActuallyViewed':True,
    'generator':'ChatGPT/Codex built-in image_gen; original provenance retained; exact serving revision not exposed',
    'formatDecision':'KEEP native1672×941 approximately16:9; friendly clear comic raster; no replacement needed',
    'widthChecksAreFullDeviceAcceptance':False,'generationOrDigestMatchingGrantsApproval':False,
    'peerANewNativeOutputsRead':False,'activeWrites':0,'strictGainClaimed':0,'humanApproval':False,'humanTrial':False})
write(OWN / 'whole-targeted-D-P-source-class-AM-current-page.independent-b.first.verdict.json', {
    'schemaVersion':1,'artifactKind':'independent-B-current-one-whole-DEEN-native-D-P-source-class-AM-targeted-first',
    'recordedAt':started,'goalId':GID,'DDecision':'keep','wholePScienceVerdict':'PASS_SCOPED_E1_G1',
    'ownWholeSourceAndCaseScienceFirstSeal':bind(old_seal),'scienceReasonDe':science,
    'newCurrentNativeCompatibilityReasonDe':visual,
    'classificationDecisionRetained':'curricularAtomic','atomicityRetained':'atomic','memoryRetained':'no_memory_needed',
    'nativeClassificationAMGenuinePriorScienceAdoptionActuallyRead':True,
    'newCards':0,'newMemoryVisibilityObligations':0,'sharedDecksOtherGoalsUntouched':True,
    'oldFinding':'B-D19-EN-BIOTECHNOLOGY-BROADER-SCOPE',
    'oldFindingCurrentReviewedCandidateState':'resolved in actual corrected whole DE/EN native input; original first HOLD remains immutable',
    'status':'needs_human_review','reviewAuthority':'ai_candidate','evidenceLevel':'E1','maximumClaimScope':'G1',
    'newNativeSchemaChecks':'pending separately recorded actual runs','other17UnchangedGoalsNotReopened':True,
    'wholeCountryPrimarySourceClosureClaim':False,'peerANewNativeOutputsRead':False,
    'activeWrites':0,'strictGainClaimed':0,'realLearnerEvidence':False,'humanApproval':False,'humanTrial':False})

understanding = {
    'essentialUnderstandingDe':'Gentest untersucht ausgewählte DNA; somatische Gentherapie überträgt eine funktionelle Genkopie in bestimmte Körperzellen; DNA-Klonierung vermehrt einen ausgewählten Abschnitt. Herstellung und Gabe eines rekombinanten Proteins übertragen beim Empfänger kein Gen und klonieren keine ganze Person.',
    'essentialUnderstandingEn':'Genetic testing examines selected DNA; somatic gene therapy transfers a functional gene copy into selected body cells; DNA cloning multiplies a selected fragment. Producing and administering a recombinant protein transfers no gene into the recipient and clones no whole person.',
    'observablePerformanceDe':'Die lernende Person ordnet drei neue Methodenmodelle zu und skizziert jeweils Zweck, grundlegenden Umgang mit DNA und eine begründete Anwendungsgrenze; DNA-Klonierung wird von Organismusklonen unterschieden.',
    'observablePerformanceEn':'The learner identifies three new method models and outlines each purpose, basic DNA handling and a justified application limit, distinguishing DNA cloning from organism cloning.',
    'transferExpectationDe':'In einem unabhängig gestellten Insulinproduktionsmodell erklärt die lernende Person DNA-Vektor, Produktion und Proteinaufbereitung und widerlegt begründet die Verwechslungen mit einer Gentherapie des Empfängers, einem Gentest oder dem Klonen einer ganzen Person.',
    'transferExpectationEn':'In a fresh independently presented insulin-production model the learner explains the DNA vector, production and protein processing, and justifiably rejects confusion with recipient gene therapy, genetic testing or cloning an entire person.'}
run_id = 'biologie-he9-genetic-method19-current-raster-native-independent-b-20261008-v3'
batch = campaign['batches'][0]
results = OWN / 'round-b/results'; results.mkdir(parents=True, exist_ok=True)
record = {'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
    'schemaVersion':1,'recordId':run_id+'.'+GID,'runId':run_id,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],
    'bundleFingerprint':review_input['bundleFingerprint'],'bookDigest':review_input['bookDigest'],
    **{k:g[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']},
    'decision':'keep','understandingEvidence':understanding,'rationale':science+' '+visual+' Eigene erste aktuelle Kandidatenentscheidung vor Peer-A-Lektüre; alter HE18-HOLD und eigene ganze Science-B-Erstversiegelung bleiben unverändert. Klassifikation/Atomarität/Memory aus echten unabhängigen Scienceentscheidungen übernommen und aktuelle native Bindungen kontrolliert; keine Hashanpassung als neue fachliche Prüfung ausgegeben.',
    'evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':'none','recordStatus':'candidate','reviewAuthority':'ai_candidate'}
record_path = results / (batch['batchId']+'.records.jsonl')
with record_path.open('x') as f: f.write(json.dumps(record,ensure_ascii=False,separators=(',',':'))+'\n')
write(results / (batch['batchId']+'.run.json'),{
    '$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,
    'runId':run_id,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'batchId':batch['batchId'],
    'batchInputFingerprint':batch['batchInputFingerprint'],'bundleFingerprint':review_input['bundleFingerprint'],'bookDigest':review_input['bookDigest'],
    'provider':'OpenAI','model':'Codex independent B; exact serving revision not exposed','role':'subject_reviewer',
    'promptFamilyId':'goal-description-understanding-evidence-v2','promptFingerprint':campaign['promptFingerprint'],
    'criteriaFingerprint':campaign['criteriaFingerprint'],
    'generationParametersFingerprint':'sha256:'+hashlib.sha256(b'Actual independent B targeted native goal19; whole correction and retained P science plus actual PNG360680PDF; serving sampling unavailable').hexdigest(),
    'independenceGroupId':campaign['independenceGroupId'],'blindToOtherRuns':True,'goalIds':batch['goalIds'],
    'inputArtifacts':[{'role':a['role'],'digest':a['digest']} for a in bundle['artifacts'] if a['role'] in ['book_model','book_pdf','book_pdf_render_manifest','review_input_json','review_prompt','review_criteria']]+[{'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']}],
    'startedAt':started,'completedAt':datetime.now(timezone.utc).isoformat(),'outputDigest':'sha256:'+sha(record_path),
    'status':'completed','toolchainVersion':'skillpilot-goal-description-review-v1'})
config = read(ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-he9-nineteen-current391-science-author-root-v1/P19.current-text-preimage.author.config.json')
config.update(reviewId=positive['reviewId'],landscapePath=rel(AUTHOR / entry['wholeCurrentLandscape']),
    semanticKindLedgerPath=rel(AUTHOR / 'candidate/semantic-kinds.current474-one-raster-inert.json'),
    reviewPath=rel(AUTHOR / entry['actualPositiveProfile']),scope={'label':'Independent B exact inactive native P1; genuine corrected whole science retained','goalIds':[GID]})
write(OWN / 'P1.exact-inactive.native.config.json',config)
print('Independent B targeted native19 first verdict: D1 KEEP, whole P science PASS_E1_G1, actual V1 KEEP; no active writes, no human approval. Real native checks follow.')
