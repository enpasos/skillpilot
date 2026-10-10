import datetime
import hashlib
import json
import shutil
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
BASE = Path(__file__).resolve().parents[3]
IDENTITY = 'codex-economics-final46-independent-round-b-20261009-v1'
OWN = BASE / 'native-d-final46-ordered-pack1-scope46-v2/round-b/independent-b'
TMP = Path('/tmp/economics-final46-round-b-renders')


def sha_bytes(data):
    return hashlib.sha256(data).hexdigest()


def json_sha(value):
    # This audit hash is explicitly supplementary; native fingerprints are kept.
    return sha_bytes(json.dumps(value, ensure_ascii=False, sort_keys=True,
                               separators=(',', ':')).encode('utf-8'))


def binding(path):
    path = Path(path)
    return {'path': str(path), 'sha256': sha_bytes(path.read_bytes())}


def write(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return binding(path)


def main():
    freeze_path = BASE / 'native-d-final46-three-max20-prepared-freeze.actual.json'
    freeze = json.loads(freeze_path.read_text())
    impact_path = BASE / 'actual-full-P300-to-P311-all311-whole-ownerpage-impact.native.json'
    impact = json.loads(impact_path.read_text())
    affected = {r['goalId']: r for r in impact['affectedOwnerpages']}
    before_path = BASE / 'whole-current311-before-actual-Root300-with-P300.book-model.json'
    after_path = BASE / 'whole-current311-after-final403-with-all-P311.book-model.json'
    before_model = json.loads(before_path.read_text())
    after_model = json.loads(after_path.read_text())
    before = {p['goalId']: p for p in before_model['pages']}
    after = {p['goalId']: p for p in after_model['pages']}
    candidate_path = BASE / 'whole-current300-plus-Generic11-and-thirteen-root-material-released-terminals.inert.candidate.json'
    candidate = json.loads(candidate_path.read_text())
    goals = {g['id']: g for g in candidate['goals']}
    live_before_path = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
    live_before = {g['id']: g for g in json.loads(live_before_path.read_text())['goals']}
    assert sha_bytes(live_before_path.read_bytes()) == 'ced16a782bd880239011f33731c57cf59d54d02b923c55c31c918492610ebfaa'

    # Whole historical tasks, solutions, scoring, coverage and graph are saved
    # as before bindings only. This is no new historical material release.
    historical = {}
    for prefix in ('9a88ee21', '57984b50', 'fe55b4b3'):
        goal = next(g for g in goals.values() if g['id'].startswith(prefix))
        original = live_before[goal['id']]
        assert goal == original
        historical[goal['id']] = {
            'wholeBeforeGoal': original,
            'wholeCurrentFrozenGoal': goal,
            'wholeGoalExactlyEqual': True,
            'wholeExamDataExactlyEqual': True,
            'beforeLiveLandscape': binding(live_before_path),
            'frozenWholeCandidate': binding(candidate_path),
            'wholeGoalAuditSHA256': json_sha(goal),
            'wholeExamDataAuditSHA256': json_sha(goal['examData']),
            'taskContentUTF8SHA256': sha_bytes(goal['examData']['taskContent'].encode()),
            'solutionContentUTF8SHA256': sha_bytes(goal['examData']['solutionContent'].encode()),
            'coveredGoalIds': goal['examData']['coveredGoalIds'],
            'newMaterialReviewOrReleaseClaim': False,
        }
    hist_binding = write(OWN / 'whole-three-historical-exam-before-bindings.json', {
        'kind': 'historical-unchanged-whole-task-context-bindings-only',
        'reviewIdentity': IDENTITY,
        'auditJSONHashAlgorithm': 'sha256(UTF8(JSON sorted keys, no spaces, ensure_ascii=false))',
        'historicalExamBindings': list(historical.values()),
        'newMaterialReviewOrReleaseClaim': False,
    })

    tasks = {
        '9a88ee21': [
            {'task': 1, 'points': 7, 'actualCompetence': 'Kommission, Parlament, Rat; Zusammenwirken im ordentlichen Verfahren; Europäischer Rat versus Rat der EU.'},
            {'task': 2, 'points': 7, 'actualCompetence': 'Materialbezogene Interessen; zwei begründete Transparenz-/Zugangsregeln.'},
            {'task': 3, 'points': 8, 'actualCompetence': 'Marktliberale, ordoliberale und keynesianische Idealtypen; Wettbewerbsordnung versus Nachfragestabilisierung.'},
            {'task': 4, 'points': 8, 'actualCompetence': '120 EUR/12.000 bzw. 48.000 EUR und alternative 0,5%-Abgabe; Leistungsfähigkeit, Gleichbehandlung, Anreize, fehlende Information.'},
        ],
        '57984b50': [
            {'task': 1, 'points': 7, 'actualCompetence': 'Reales Einkommen, Elektroschrott, Pendelzeit interpretieren; Lebensqualitätsgrenzen und Zusatzinformation.'},
            {'task': 2, 'points': 8, 'actualCompetence': '60/220/300-EUR-Alternativen bei 250-EUR-Budget; Zuverlässigkeit, Werbung, Kreislaufwirtschaft und reparierbare Gestaltung.'},
            {'task': 3, 'points': 7, 'actualCompetence': 'Zwei Interessenkonflikte der Reparaturförderung und bedingte Empfehlung.'},
            {'task': 4, 'points': 8, 'actualCompetence': 'Anfänglicher Akkumangel; Nacherfüllung gegenüber Verkäufer und sachliche Reklamation; keine automatische Rückzahlung.'},
        ],
        'fe55b4b3': [
            {'task': 1, 'points': 8, 'actualCompetence': 'Lieferkettenverletzlichkeit; zwei Resilienzmaßnahmen samt Kosten/Grenzen.'},
            {'task': 2, 'points': 7, 'actualCompetence': 'Kapitalmobilität, fester Wechselkurs, autonome Zinspolitik; Trilemma und zwei Zielverzichte.'},
            {'task': 3, 'points': 8, 'actualCompetence': 'Vereinbarte 100 gegen tatsächliche 70 Stück/h; Sachmangel, Fehlerbeseitigung, Abgrenzung von Verschulden/Schadensersatz.'},
            {'task': 4, 'points': 7, 'actualCompetence': '80 EUR/6 Wochen versus 95 EUR/2 Wochen; Kosten, unbekanntes Risiko und Versorgungssicherheit; bedingter Strategiewechsel.'},
        ],
    }
    blocks = {
        '51203e8f': ('57984b50', 'Zweck, Rollen und Ablauf von Zivilprozess/Strafverfahren einschließlich offener Vorwürfe und möglicher Ergebnisse.', 'Der ganze Verbraucherrechtsfall prüft vorgerichtlichen Sachmangelanspruch und Reklamation; keine Klage-/Anklagerolle, Verfahrensfolge oder Verfahrensausgang. Ein zivilrechtlicher Anspruch ist kein Zivilprozess.'),
        '772b6d9f': ('9a88ee21', 'Sachgebietsbezogene Zuordnung zu ordentlicher, Verwaltungs-, Arbeits-, Sozial- oder Finanzgerichtsbarkeit.', 'EU-Gesetzgebung und ein hypothetischer Abgabenvergleich sind keine Gerichtszweigzuordnung. Material 4 nimmt rechtliche Zulässigkeit ausdrücklich aus; Steuerrechnung ist keine Finanzgerichtsfrage.'),
        'f7c051f4': ('9a88ee21', 'Eine konkret bereitgestellte GWÖ-Variante nach Zielen, Eigentum und Koordination mit Sozialer Marktwirtschaft vergleichen.', 'Die drei materialgebundenen Denkschulen sind keine GWÖ-Konzeption; der Body liefert weder GWÖ-Regeln noch einen Ziele-/Eigentums-/Koordinationsvergleich.'),
        '575c08d4': ('fe55b4b3', 'Relative Faktorausstattung K/L und Güterintensität unter gelieferten Modellannahmen zu einer bedingten Handelsableitung verbinden.', 'Beschaffungspreise, Wege, Störungen und unbekannte Ausfallwahrscheinlichkeiten liefern kein K/L, keine Faktorgüterintensität und keine Faktorproportionenannahmen. Der Lieferketten-/Trilemma-/Kaufrechtsbody verlangt diese Kompetenz nicht.'),
        '7a2435f2': ('9a88ee21', 'Gewichtete Portfoliorenditen berechnen und Diversifikation aus gemeinsamem Kursverlauf samt Verlustgrenze erklären.', 'Absolute und relative Abgaben sind keine Portfoliogewichte/-renditen. Kein Anlageverlauf oder gemeinsames Kursszenario ist geliefert oder gefordert.'),
        '5a72a72a': ('9a88ee21', 'Eine bedingte Spielvorhersage aus dem gelieferten Modell mit Experimentdaten vergleichen und Interpretations-/Kausalitätsgrenzen erklären.', 'Die Interessenvertretung enthält keine Auszahlungsmatrix, beste Antwort, experimentellen Anteil oder wiederholte Interaktion. Allgemeiner Interessenvergleich verlangt diesen Modell-/Datenvertrag nicht.'),
        '055ef95c': ('9a88ee21', 'R/P mit Reservekategorie und Jahresförderung berechnen und als statische Reichweite begrenzt deuten.', 'Der politische Zweck Ressourcenverbrauch begrenzen liefert weder Reserven noch Förderfluss oder Reklassifizierung. Auch die Abgabenrechnung verlangt keinen Bestands-/Flussquotienten.'),
    }

    pack_receipts = []
    all_findings = []
    for n in (1, 2, 3):
        rd = BASE / f'native-d-final46-ordered-pack{n}-scope46-v2/round-b'
        own = rd / 'independent-b'
        own.mkdir(exist_ok=True)
        inp_path = rd / 'description-review-input.json'
        inp = json.loads(inp_path.read_text())
        campaign = json.loads((rd / 'description-review-campaign.json').read_text())
        batch = campaign['batches'][0]
        records_path = rd / 'results' / (batch['batchId'] + '.records.jsonl')
        run_path = rd / 'results' / (batch['batchId'] + '.run.json')
        records = [json.loads(line) for line in records_path.read_text().splitlines()]
        record_map = {r['goalId']: r for r in records}
        owner_bindings = []
        findings = []
        for g in inp['goals']:
            gid = g['goalId']
            owner_bindings.append({
                'goalId': gid,
                'reviewScope': 'targeted genuine changed whole-ownerpage/context only' if affected[gid]['wasCurrentStrict300'] else 'whole current DEEN goal/P2/source/A-M/image/prerequisite context',
                'exactActualImpactRow': affected[gid],
                'beforeWholeOwnerPage': before[gid],
                'afterWholeOwnerPage': after[gid],
                'beforeWholeOwnerPageSupplementaryAuditSHA256': json_sha(before[gid]),
                'afterWholeOwnerPageSupplementaryAuditSHA256': json_sha(after[gid]),
                'nativeGoalFingerprint': g['goalFingerprint'],
                'nativePageFingerprint': g['pageFingerprint'],
                'recordId': record_map[gid]['recordId'],
                'decision': record_map[gid]['decision'],
            })
            if gid[:8] not in blocks:
                continue
            terminal_prefix, needed, why = blocks[gid[:8]]
            terminal = next(x for x in historical if x.startswith(terminal_prefix))
            assert gid in historical[terminal]['wholeBeforeGoal']['requires']
            assert gid not in historical[terminal]['coveredGoalIds']
            assert terminal in [x['goalId'] for x in after[gid]['externalReverseRequires']]
            finding = {
                'findingId': f'{IDENTITY}.block-{gid[:8]}-{terminal_prefix}',
                'nativeDecision': 'block',
                'affectedOwnerGoalId': gid,
                'affectedOwnerCurrentWholeGoal': goals[gid],
                'affectedOwnerBeforeWholePage': before[gid],
                'affectedOwnerAfterWholePage': after[gid],
                'actualChangedFields': affected[gid]['changedFields'],
                'nativeGoalFingerprint': g['goalFingerprint'],
                'nativePageFingerprint': g['pageFingerprint'],
                'nativeRecordId': record_map[gid]['recordId'],
                'terminalGoalId': terminal,
                'wholeHistoricalBeforeBinding': hist_binding,
                'terminalWholeBeforeGoalAuditSHA256': historical[terminal]['wholeGoalAuditSHA256'],
                'terminalWholeBeforeExamDataAuditSHA256': historical[terminal]['wholeExamDataAuditSHA256'],
                'coveredGoalIdsActual': historical[terminal]['coveredGoalIds'],
                'ownerIsDirectRequires': True,
                'ownerIsNotCoveredGoal': True,
                'actualAllFourTasks': tasks[terminal_prefix],
                'preciselyConcretizedOwnerCompetence': needed,
                'wholeTaskContextMismatch': why,
                'authorCorrectionRequired': 'Correct the actual terminal requires/context relationship and re-render precisely changed owner pages; preserve historical task bodies unless separately re-authored/reviewed.',
                'descriptionReplacementRecommended': False,
                'profileMutationRecommended': False,
                'newHistoricalMaterialReviewOrReleaseClaim': False,
            }
            findings.append(finding)
            all_findings.append(finding)
        scope_binding = write(own / 'whole-individual-owner-before-after-context-bindings.json', {
            'reviewIdentity': IDENTITY,
            'beforeWholeBookBinding': binding(before_path),
            'afterWholeBookBinding': binding(after_path),
            'inputBinding': binding(inp_path),
            'actualImpactBinding': binding(impact_path),
            'individualOwnerBindings': owner_bindings,
        })
        findings_binding = write(own / 'independent-context-block-findings.json', {
            'reviewIdentity': IDENTITY, 'campaignId': campaign['campaignId'],
            'findings': findings, 'newStrictClosures': 0,
            'historicalUnchangedExamsAreNotNewlyMaterialReleased': True,
        })
        check_path = own / 'native-campaign-check.receipt.json'
        check = json.loads(check_path.read_text())
        assert check['exitCode'] == 0
        pack_receipt = {
            'reviewIdentity': IDENTITY,
            'campaignId': campaign['campaignId'],
            'reviewerRunId': json.loads(run_path.read_text())['runId'],
            'round': 'B', 'blindToRoundAOutputs': True,
            'goalCount': len(records),
            'wholeNewGoalCount': sum(not affected[r['goalId']]['wasCurrentStrict300'] for r in records),
            'targetedExistingGoalCount': sum(affected[r['goalId']]['wasCurrentStrict300'] for r in records),
            'decisions': {d: sum(r['decision'] == d for r in records) for d in ('keep', 'block')},
            'ownRecords': binding(records_path), 'ownRun': binding(run_path),
            'wholeOwnerBindings': scope_binding,
            'ownFindings': findings_binding,
            'nativeCampaignCheck': binding(check_path),
            'nativeCampaignCheckExitCode': 0,
            'recordStatus': 'candidate', 'reviewAuthority': 'ai_candidate',
            'evidenceLevel': 'E1', 'maximumClaimScope': 'G1',
            'humanReviewAndRelease': 'open',
            'newStrictClosures': 0, 'liveWrites': [],
        }
        pack_receipts.append(write(own / 'independent-review.receipt.json', pack_receipt))

    # Preserve the actual visual observation artifacts inside this own B tree.
    # Owner pages were seen in complete-page contact sheets; new eleven sources
    # additionally at large size. Rendering alone is not marked as observation.
    visual_dir = OWN / 'observed-visuals'
    visual_dir.mkdir(exist_ok=True)
    observed_sheets = []
    for path in sorted(TMP.glob('pack*-sheet*.png')) + sorted(TMP.glob('new11-source-sheet*.png')):
        target = visual_dir / path.name
        shutil.copyfile(path, target)
        observed_sheets.append(binding(target))
    assets_before = json.loads((TMP / 'asset-hash-size-observation-inputs.json').read_text())
    assets_after = []
    for a in assets_before:
        actual = sha_bytes(Path(a['path']).read_bytes())
        assets_after.append({**a, 'afterSHA256': actual, 'sameBeforeAfterAndExpected': actual == a['sha256'] == a['expectedSHA256']})
    assert len(assets_after) == 46 and all(a['sameBeforeAfterAndExpected'] for a in assets_after)
    visual_binding = write(OWN / 'actual-pdf-and-physical-png-observation.receipt.json', {
        'reviewIdentity': IDENTITY,
        'actualPDFBindingsAndRenderPages': json.loads((TMP / 'render-receipt.json').read_text()),
        'actualPhysicalPDFPages': 52,
        'wholePageObservation': 'All 52 actual physical PDF pages were observed in complete-page contact sheets, including 6 cover pages; 46 owner images were seen in their full owner-page context and displayed small size.',
        'elevenSourceObservation': 'All eleven new whole-review goal PNGs were additionally visually inspected in the six larger source sheets; physical perspective, labels and symbols were compared to goal/P2 scope.',
        'observedPreservedContactSheets': observed_sheets,
        'physicalAssetBeforeAfterBindings': assets_after,
        'visualObservationAloneIsNoHumanOrPublicationApproval': True,
    })

    checked = []
    changed = []
    for category, rows in [('nativeFrozen', [x for p in freeze['packets'] for x in p['frozenFiles']]), ('globalInput', freeze['globalInputBindings'])]:
        for row in rows:
            p = ROOT / row['path']
            actual = sha_bytes(p.read_bytes())
            checked.append({'category': category, 'path': row['path'], 'expectedSHA256': row['sha256'], 'actualSHA256': actual})
            if actual != row['sha256']:
                changed.append(checked[-1])
    assert len(checked) == 126
    assert sha_bytes(freeze_path.read_bytes()) == '38d4edc50ac6cdcc1e7bd8e92efe6be435d93420ff85ee63ea42d0036bc65953'
    assert not changed
    guard_binding = write(OWN / 'after-input-guard.json', {
        'kind': 'independent-blind-round-b-after-review-input-guard',
        'reviewIdentity': IDENTITY,
        'createdAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'freezeBinding': binding(freeze_path),
        'beforeGuardBinding': binding(OWN / 'before-input-guard.json'),
        'nativeWholeFilesCompared': 84, 'globalInputBindingsCompared': 42,
        'physicalPNGsComparedBeforeAfter': 46,
        'changedBindings': changed,
        'allActualComparedFrozenBindings': checked,
        'blindToRoundAOutputs': True, 'newStrictClosures': 0, 'liveWrites': [],
    })
    summary = {
        'kind': 'independent-blind-native-round-b-current46-first-pass-review-receipt',
        'reviewIdentity': IDENTITY,
        'completedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'frozenInputGuardBeforeAfter': 'exact, 0 changed bindings',
        'newWholeGoalCount': 11, 'targetedPriorStrictOwnerCount': 35,
        'unchanged265OwnerpagesRestarted': False,
        'wholeCurrentCurricularAtomicDenominator': 311,
        'wholeFrozenCandidateGoals': 403,
        'sixNativeUnderstandingFieldsPresentPerGoal': True,
        'individualRationaleAndContextPresentPerGoal': True,
        'decisions': {'keep': 39, 'block': 7},
        'nativeCampaignChecks': [0, 0, 0],
        'packageReceipts': pack_receipts,
        'wholeHistoricalBeforeBindings': hist_binding,
        'blockOwnerIds': [f['affectedOwnerGoalId'] for f in all_findings],
        'visualObservation': visual_binding,
        'afterGuard': guard_binding,
        'roundAOutputsReadOrCompared': False,
        'authoringWrites': [], 'liveWrites': [], 'rootRegistryWrites': [],
        'nativeDResolutionOrSynthesisWritten': False,
        'historicalUnchangedMaterialNewlyReleased': False,
        'E1G1CandidateStatusRetained': True,
        'humanReviewAndRelease': 'open',
        'learnerDataUsed': False,
        'newStrictClosures': 0,
        'hashesAreBindingsAndNoAutomaticQualityApproval': True,
    }
    print(json.dumps(write(OWN / 'independent-round-b-final.receipt.json', summary)))


if __name__ == '__main__':
    main()
