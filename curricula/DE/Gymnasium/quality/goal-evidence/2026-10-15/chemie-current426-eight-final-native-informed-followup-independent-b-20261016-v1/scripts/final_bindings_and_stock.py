"""Additive own final Native binding, followed separately by stock serialization."""
import hashlib
import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
OUT = Path(__file__).resolve().parents[1]
TECH = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-current426-b47-framework-P1-native8-successor-technical-20261015-v1'
SEL = TECH / 'pages-final-eight/NEUTRAL.final-eight-actual-current-pages-profiles-nineteen-cases.selector.json'
FINAL = OUT / 'FINAL.native-eight-actual-binding-amendment.before-stock.json'
RAW = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-b47-underlying-sidechain-framework-two-strings-author-successor-20261015-v1/AUTHOR.two-whole-raw-profiles.only-b47-framework-wording-successor.json'
STARTED = '2026-10-15T22:35:22Z'  # Actual clock tool observation at the beginning of this final binding task.
RUN_ID = 'chemie-current426-native8-final-own-informed-b-20261016-v1'

def now():
    return datetime.now(timezone.utc).isoformat()

def digest(b):
    return 'sha256:' + hashlib.sha256(b).hexdigest()

def pin(p):
    p = Path(p); b = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': digest(b), 'bytes': len(b)}

def write_new(p, obj):
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open('x') as f:
        json.dump(obj, f, ensure_ascii=False, indent=2); f.write('\n')
    json.loads(p.read_text())

def preserved():
    originals = [
        (ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-current426-eight-current-pages-fresh-independent-b-20261015-v1/FIRST.scientific-eight.actual-read-and-sight.json', 'c607f22a39001624df73deaf9238ece501a7a43138518d8f9f660fd39702e59c'),
        (OUT / 'FOLLOWUP.scientific-eight.before-stock.json', '30b0e9cb86bde1788331a004fb72ec11d36fa9b084991347b2242acdccf81dcc'),
        (OUT / 'RAW-PROFILE-DELTA.scientific-only-before-native.json', '4fecaef6f16c117c637d1a09744af2818802d4ba46b9b909d9e28cfab2ec9e46'),
        (OUT / 'RAW-PROFILE-TWO-STRING-FOLLOWUP.scientific-only-before-native.json', '9a21408fcb5ec1a54438ac21d187db131113357719c35c7e291b7793d45f3cf9')
    ]
    for path, expected in originals:
        assert pin(path)['sha256'] == 'sha256:' + expected
    return [pin(path) for path, _ in originals]

def seal_science():
    history = preserved()
    assert pin(SEL)['sha256'] == 'sha256:186a66f84e027d16a88b0e9cef7c045a5b1e331ff138309b40779d9c3016ceb6'
    selected = json.loads(SEL.read_text())
    assert pin(ROOT / selected['finalSealPath'])['sha256'] == 'sha256:a6cb57ab73b74ef510a30a092bc72d36863e740bf276273f8612b2b6dc5bc281'
    prior = json.loads((OUT / 'FOLLOWUP.scientific-eight.before-stock.json').read_text())
    prior_by_id = {r['goalId']: r for r in prior['decisions']}
    raw = {r['goalId']: r['profile'] for r in json.loads(RAW.read_text())['records']}
    rows = []
    for entry in selected['actualPagesAndHashes']:
        for key in ['actualWholeGoalAndPageInput','actualPagePng120dpi','actualWholePageText']:
            assert pin(ROOT / entry[key]['path']) == entry[key]
        pg = json.loads((ROOT / entry['actualWholeGoalAndPageInput']['path']).read_text())
        g = pg['actualStockDescriptionReviewInputGoal']; gid = g['goalId']; old = prior_by_id[gid]
        assert {k:g[k] for k in old['currentText']} == old['currentText']
        assert g['canonicalContext'] == old['currentCanonicalContext']
        actual_profile = g['reviewContext']['evidenceProfile']['profile']
        expected_profile = raw[gid] if gid in raw else old['currentWholeScientificProfile']
        assert actual_profile == expected_profile
        rationale = old['rationale']
        if gid.startswith('1d2e7b80'):
            rationale = 'Eigenes informiertes Followup B zur gesamten erhaltenen Urteilskette. Die Beschreibung bleibt KEEP; der frühere eigene Profilhinweis ist am tatsächlich geschriebenen und jetzt Native-gebundenen Endstand gelöst. Beide essentialUnderstanding-Sprachen erklären nun ausdrücklich Carbonylzugang über freie anomere Zentren, die Verknüpfung beider Saccharosezentren, Cu(II)/Cu(I) und die Grenzen eines positiven Nachweises. Die Fructose-/Enediolvertiefung bleibt auf die tatsächlich einschlägige Kursroute begrenzt. Durchführung, Kontrollen und unabhängiger Strukturtransfer bleiben Pflicht; es wird keine zusätzliche feste Laufquote verlangt. Das volle Profil stimmt exakt mit dem selbst geprüften Rohfolger überein. Die finale echte Seite3 wurde via view_image gesehen: unverändertes ausdrücklich benanntes Bausteinmodell, vollständiger Beschreibungstext und interner Nachfolger96. Geänderter Profil-/Page-Fingerprint und neuer Modellfußtext erzeugen keinen weiteren wissenschaftlichen Befund. Keine reale Durchführung oder Human Approval wird behauptet.'
        elif gid.startswith('b47d542d'):
            rationale = 'Eigenes informiertes Followup B zur gesamten erhaltenen Urteilskette. Die klare Beschreibung bleibt KEEP; die eigenen zuvor offenen Profilhinweise sind am tatsächlich geschriebenen und jetzt Native-gebundenen Endstand gelöst. Die essentialUnderstanding-Felder benennen jetzt Restfunktionalität, Gesamtladung, Wasserwechselwirkungen und bedingte Löslichkeitsbefunde. Die zuletzt beanstandete Behauptung unveränderter kovalenter Bindungen wurde in beiden Sprachen auf das erhaltene Restgrundgerüst präzisiert; Protonierung verändert O-H-/N-H-Bindungen, ohne dieses Grundgerüst zu ändern. Der qualitative Glutaminsäurefall bleibt ausdrücklich fiktiv und liefert keine genaue Sättigung oder isolierte Restgruppenkausalität. Die vollständigen übrigen Pflichtleistungen und Fälle sind unverändert. Das volle aktuelle Profil ist exakt der selbst gelesene Rohfolger. Die finale echte Seite6 wurde via view_image gesehen: unveränderte Alanin-/Serin-Zwitterionmodelle, ganzer Beschreibungstext und Säure-Base-Voraussetzung. Profil-/Page-Bindung und neuer Modellfußtext sind technische Änderungen, keine neue unabhängige wissenschaftliche Stimme.'
        rows.append({
            'goalId': gid, 'decision': 'keep', 'evidenceProfileRecommendation': 'none',
            'understandingEvidence': old['understandingEvidence'], 'rationale': rationale,
            'currentText': {k:g[k] for k in old['currentText']},
            'currentCanonicalContext': g['canonicalContext'],
            'currentWholeScientificProfile': actual_profile,
            'currentGoalFingerprint': g['goalFingerprint'], 'currentPageFingerprint': g['pageFingerprint'],
            'actualFinalPageBinding': entry,
            'actualViewImageCompleted': True,
            'finalPageObservation': 'Tatsächliche finale Native-Seite im letzten achtseitigen Folger via view_image vollständig gesehen; bestehender Ziel-/Bildinhalt und sichtbare Graphlinks sind erhalten, neuer BookDigest im Fußbereich geprüft.',
            'changedPageFingerprintFromOwnPreviousNative': g['pageFingerprint'] != old['actualPageBinding']['pageFingerprint'],
            'recordStatus': 'candidate', 'reviewAuthority': 'ai_candidate'
        })
    for key in ['canonical','actualBookModel','actualBookPdf','roundBInput','roundBCampaign','wholeSixTargetFourteenCases','wholeNeighborFiveCorrectedCasesAndRubrics']:
        assert pin(ROOT / selected[key]['path']) == selected[key]
    assert selected['wholeSixTargetFourteenCases'] == prior['wholeCaseBindings']['wholeSixTargetFourteenCases']
    assert selected['wholeNeighborFiveCorrectedCasesAndRubrics'] == prior['wholeCaseBindings']['wholeNeighborFiveCorrectedCasesAndRubrics']
    doc = {
        'schemaVersion': 1, 'role': 'Own final actual Native8 page/input amendment B before stock records',
        'actualFinalBindingStartedAtUtc': STARTED, 'securedAtUtc': now(),
        'preservedOwnJudgmentHistory': history,
        'finalNeutralSelector': pin(SEL), 'finalNeutralPageSeal': pin(ROOT / selected['finalSealPath']),
        'actualCurrentCanonical': selected['canonical'], 'actualCurrentBookModel': selected['actualBookModel'],
        'actualCurrentBookPdf': selected['actualBookPdf'],
        'roundBInput': selected['roundBInput'], 'roundBCampaign': selected['roundBCampaign'],
        'wholeNineteenCaseSourcesUnchanged': [selected['wholeSixTargetFourteenCases'], selected['wholeNeighborFiveCorrectedCasesAndRubrics']],
        'actuallyViewedFinalPages': 8, 'previouslyActuallyReadWholeCurrentCasesAndRubricsStillExact': 19,
        'ownPreviouslyOpenProfileIssuesNowResolved': ['1d2e essential chemistry','b47 essential chemistry','b47 protonation versus underlying side-chain framework'],
        'independence': 'Only own preserved judgments, neutral inputs, raw scientific profiles and actual pages were consulted; no peer D, P/A/V scientific verdicts, synthesis or triage was read.',
        'actualMethod': 'Informed same-reviewer followup and real final Native page sighting; no new blind independent scientific vote. Supplied technical campaign remains byte-exact and labels reviewPass first_pass; this is metadata, not a claim that own previous judgments were unseen.',
        'authority': 'candidate/ai_candidate; profiles remain needs_human_review. No HumanApproval, HumanTrial, learner mastery, real experiment, deployment, publication or central maturity closure.',
        'normalRecordsCreatedAtThisSeal': 0, 'decisions': rows
    }
    write_new(FINAL, doc)
    write_new(OUT / 'SEAL.final-native-amendment-before-stock.json', {'schemaVersion':1,'role':'Own actual Native page amendment secured before records','createdAtUtc':now(),'amendment':pin(FINAL),'ownHistoryStillExact':preserved()})
    print(json.dumps({'scientificAmendment':pin(FINAL),'currentDecisions':8,'keep':8,'profileRecommendationNone':8}))

def serialize():
    preserved()
    amendment = json.loads(FINAL.read_text())
    seal = json.loads((OUT / 'SEAL.final-native-amendment-before-stock.json').read_text())
    assert seal['amendment'] == pin(FINAL)
    selected = json.loads(SEL.read_text())
    source_input = ROOT / selected['roundBInput']['path']
    source_campaign = ROOT / selected['roundBCampaign']['path']
    inp = json.loads(source_input.read_text()); campaign = json.loads(source_campaign.read_text())
    batch = campaign['batches'][0]
    rounddir = source_campaign.parent
    bundle = rounddir / 'review-bundle-manifest.json'
    bundleobj = json.loads(bundle.read_text())
    batchfile = rounddir / 'batches' / (batch['batchId'] + '.input.jsonl')
    assert digest(batchfile.read_bytes()) == batch['batchInputFingerprint']
    byid = {r['goalId']:r for r in amendment['decisions']}
    rows = []
    for g in inp['goals']:
        own = byid[g['goalId']]
        assert g['goalFingerprint'] == own['currentGoalFingerprint'] and g['pageFingerprint'] == own['currentPageFingerprint']
        rows.append({
            '$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
            'schemaVersion':1,'recordId':RUN_ID+':'+g['goalId'],'runId':RUN_ID,
            'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],
            'bundleFingerprint':inp['bundleFingerprint'],'bookDigest':inp['bookDigest'],
            'goalId':g['goalId'],'goalFingerprint':g['goalFingerprint'],'pageFingerprint':g['pageFingerprint'],
            **own['currentText'],'decision':own['decision'],'understandingEvidence':own['understandingEvidence'],
            'rationale':own['rationale'],'evidenceProfileContract':'positive-understanding-evidence-v2',
            'evidenceProfileRecommendation':own['evidenceProfileRecommendation'],
            'recordStatus':'candidate','reviewAuthority':'ai_candidate'
        })
    results = OUT / 'normal/results'; results.mkdir(parents=True,exist_ok=True)
    recfile = results / (batch['batchId'] + '.records.jsonl')
    with recfile.open('x') as f:
        for r in rows: f.write(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n')
    assert len([json.loads(s) for s in recfile.read_text().splitlines()]) == 8
    parameters = {'actualMode':'same-reviewer informed local followup B with actual final Native8 sighting','samplingParameters':'not exposed by this Codex session','exactDeployedModelVersion':'not exposed; not invented','separateExternalApiGeneration':False}
    parameterfile = OUT / 'normal/generation-parameters.disclosure.json'; write_new(parameterfile,parameters)
    roles = ['book_pdf','book_model','review_prompt','review_criteria']
    artifacts = [{'role':a['role'],'digest':a['digest']} for a in bundleobj['artifacts'] if a['role'] in roles]
    artifacts.append({'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']})
    run = {
        '$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
        'schemaVersion':1,'runId':RUN_ID,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],
        'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint'],
        'bundleFingerprint':inp['bundleFingerprint'],'bookDigest':inp['bookDigest'],
        'provider':'OpenAI','model':'Codex (GPT-6 family; exact deployed model identifier not exposed)',
        'role':'subject_reviewer','promptFamilyId':'skillpilot-description-understanding-evidence-v2',
        'promptFingerprint':campaign['promptFingerprint'],'criteriaFingerprint':campaign['criteriaFingerprint'],
        'generationParametersFingerprint':pin(parameterfile)['sha256'],
        'independenceGroupId':campaign['independenceGroupId'],'blindToOtherRuns':True,
        'goalIds':batch['goalIds'],'inputArtifacts':artifacts,'startedAt':STARTED,'completedAt':now(),
        'status':'completed','outputDigest':pin(recfile)['sha256'],
        'toolchainVersion':'node-20.20.2+tsx-4.21.0+ajv-8.17.1'
    }
    runfile = results / (batch['batchId'] + '.run.json'); write_new(runfile,run)
    config = {
        'schemaVersion':1,'role':'Own individual stock D8 validation recipe B; no shared resolution or central integration',
        'actualReviewMethod':'Informed followup to own preserved FIRST; no new independent blind generation. Supplied unchanged campaign has technical first_pass metadata.',
        'scientificAmendmentBeforeRecords':pin(FINAL),'finalNeutralSelector':pin(SEL),
        'bundle':str(bundle.relative_to(ROOT)), 'input':str(source_input.relative_to(ROOT)),
        'campaign':str(source_campaign.relative_to(ROOT)), 'batchInput':str(batchfile.relative_to(ROOT)),
        'batchesDirectory':str((rounddir/'batches').relative_to(ROOT)),
        'records':str(recfile.relative_to(ROOT)), 'run':str(runfile.relative_to(ROOT)),
        'resultsDirectory':str(results.relative_to(ROOT)),
        'recordSchema':'contracts/goal-description-review/v1/goal-description-review-record.schema.json',
        'runIdentityDisclosure':'runId is assigned to this actual local reviewer-B execution; no external API run ID or unobserved exact model/version is claimed.',
        'generationParametersDisclosure':pin(parameterfile),
        'commands':[
            ['node','app/node_modules/tsx/dist/cli.mjs','app/scripts/validateGoalDescriptionReviewCampaign.ts','--bundle',str(bundle.relative_to(ROOT)),'--input',str(source_input.relative_to(ROOT)),'--campaign',str(source_campaign.relative_to(ROOT)),'--run',str(runfile.relative_to(ROOT)),'--batch-input',str(batchfile.relative_to(ROOT)),'--records',str(recfile.relative_to(ROOT))],
            ['node','app/node_modules/tsx/dist/cli.mjs','app/scripts/validateGoalDescriptionReviewCampaignResults.ts','--bundle',str(bundle.relative_to(ROOT)),'--input',str(source_input.relative_to(ROOT)),'--campaign',str(source_campaign.relative_to(ROOT)),'--batches-dir',str((rounddir/'batches').relative_to(ROOT)),'--results-dir',str(results.relative_to(ROOT))]
        ]
    }
    write_new(OUT/'normal/RUN-CONFIG.own-eight-final-normal.json',config)
    print(json.dumps({'records':pin(recfile),'run':pin(runfile),'runConfig':pin(OUT/'normal/RUN-CONFIG.own-eight-final-normal.json')}))

def checks():
    cfgpath=OUT/'normal/RUN-CONFIG.own-eight-final-normal.json'; cfg=json.loads(cfgpath.read_text())
    checksdir=OUT/'checks';checksdir.mkdir(exist_ok=True)
    receipts=[]
    for name,argv in zip(['01-stock-single-batch','02-stock-closed-campaign'],cfg['commands']):
        started=now();p=subprocess.run(argv,cwd=ROOT,text=True,capture_output=True)
        for suffix,content in [('stdout.txt',p.stdout),('stderr.txt',p.stderr)]:
            with (checksdir/(name+'.'+suffix)).open('x') as f:f.write(content)
        receipt={'argv':argv,'cwd':str(ROOT),'startedAtUtc':started,'completedAtUtc':now(),'returncode':p.returncode,'stdout':pin(checksdir/(name+'.stdout.txt')),'stderr':pin(checksdir/(name+'.stderr.txt'))}
        write_new(checksdir/(name+'.receipt.json'),receipt);receipts.append(receipt)
        print(name,p.returncode,p.stdout,p.stderr)
        assert p.returncode==0
    inp=json.loads((ROOT/cfg['input']).read_text());rec=[json.loads(s) for s in (ROOT/cfg['records']).read_text().splitlines()];expected=json.loads(FINAL.read_text())
    assert [r['goalId'] for r in rec]==[g['goalId'] for g in inp['goals']]
    for r,g,a in zip(rec,inp['goals'],expected['decisions']):
        for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']:assert r[k]==g[k]
        assert r['understandingEvidence']==a['understandingEvidence'] and r['rationale']==a['rationale']
        assert r['decision']=='keep' and r['evidenceProfileRecommendation']=='none'
        assert r['recordStatus']=='candidate' and r['reviewAuthority']=='ai_candidate'
    selected=json.loads(SEL.read_text());book=json.loads((ROOT/selected['actualBookModel']['path']).read_text());canon=json.loads((ROOT/selected['canonical']['path']).read_text());canonical={g['id']:g for g in canon['goals']}
    assert len(rec)==8 and len({r['goalId'] for r in rec})==8
    for g in inp['goals']:
        c=canonical[g['goalId']]
        assert g['currentDescriptionDe']==c['description'] and g['currentDescriptionEn']==c['descriptionEn']
        assert g['currentTitleDe']==c['title'] and g['currentTitleEn']==c['titleEn']
        assert g['canonicalContext']['requires']==c['requires'] and g['canonicalContext']['contains']==c['contains']
    for key in ['canonical','actualBookModel','actualBookPdf','roundBInput','roundBCampaign']:
        assert pin(ROOT/selected[key]['path'])==selected[key]
    result={'schemaVersion':1,'actualTargetBindingPassed':True,'goals':8,'uniqueGoals':8,'currentKeep':8,'profileNone':8,'actualViewedCurrentPages':8,'preservedOwnJudgmentHistory':preserved(),'recordCountAndOrderMatchCurrentInput':True,'currentCanonicalWholeTextAndRelationsMatch':True,'currentSourceInputCampaignBookAndPdfPinsMatch':True,'ownScienceExactlySerialized':True,'stockBatchAndClosedCampaignChecksPassed':all(r['returncode']==0 for r in receipts),'authority':'candidate/ai_candidate; no HumanApproval or central integration'}
    write_new(checksdir/'03-own-target-binding.actual.json',result)
    paths=[FINAL,OUT/'SEAL.final-native-amendment-before-stock.json',cfgpath,ROOT/cfg['records'],ROOT/cfg['run'],OUT/'normal/generation-parameters.disclosure.json']+sorted(checksdir.glob('*'))
    write_new(OUT/'FILES.final-own-stock-D8.seal.json',{'schemaVersion':1,'role':'Own final candidate D8 output seal after actual stock validation','createdAtUtc':now(),'files':[pin(p) for p in paths]})
    print(json.dumps(result))

if __name__=='__main__':
    {'seal':seal_science,'serialize':serialize,'checks':checks}[sys.argv[1]]()
