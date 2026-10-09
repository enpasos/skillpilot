# SPDX-License-Identifier: Apache-2.0
import datetime, hashlib, json, pathlib, shutil

base = pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09')
n = base / 'biologie-evolution-current17-and-protected-contexts-native-preparation-author-v1'
o = base / 'biologie-evolution-current17-and-protected-contexts-native-independent-b-v1'
first = json.loads((o / 'native17-context15.independent-b.science-FIRST.verdict.json').read_text())
when = datetime.datetime.now(datetime.timezone.utc).isoformat()
profiles = {x['goalId']: x for x in map(json.loads, (n / 'positive/P17.current-raster.author-candidate.review.jsonl').read_text().splitlines())}
# Own goal-specific reasoning, written after all actual full-page/source reading;
# unchanged historical P profiles are preserved, never recreated from these rows.
protected_de = [
 ('Beobachtungen liefern Rohdaten; Kriterien begrenzen die Deutung.', 'Eigene Querschnitts- und Variationsbeobachtungen werden mit Rohdaten dokumentiert.', 'Erfundene Beobachtungen ersetzen keine dokumentierten Merkmale.'),
 ('Modelle stellen ausgewählte Beziehungen dar und besitzen Grenzen.', 'Fossil-, Selektions- oder Softwaremodelle werden nach Darstellung und Grenze erklärt.', 'Herstellung und Durchführung bleiben zusätzliche Operatoren; Beschreibung allein belegt sie nicht.'),
 ('Hypothesen werden durch geplante kontrollierte Untersuchungen geprüft.', 'Planung, Durchführung, Kontrollbedingung und Protokoll werden am Untersuchungsweg unterschieden.', 'Eine neue Sek-I-Route ersetzt keine Vorbedingungen des ganzen Oberstufenziels.'),
 ('Mikroskopische Befunde brauchen wirklich präparierte und fokussierte Objekte.', 'Ein eigener Pflanzenquerschnitt wird montiert, fokussiert und mit Skala dokumentiert.', 'Erzählte Mikroskopiebilder belegen keine eigene Präparation oder Beobachtung.'),
 ('Biodiversität umfasst Vielfalt, Aussterben und Entdeckung.', 'Die unveränderten Aspekte werden im korrigierten RP-TF2-Quellkontext unterschieden.', 'Ein korrigierter Fundort von Seite25 auf26 erzeugt keine neue fachliche Leistung.'),
 ('Evolution verbindet Mutation und Rekombination mit unterschiedlichem Fortpflanzungserfolg.', 'Variationsursprung und Veränderung des Fortpflanzungserfolgs werden gemeinsam erklärt.', 'Zwei erbliche asexuelle Modelltypen ersetzen Mutation und Rekombination nicht.'),
 ('Evolutionäre Belege besitzen unterschiedliche Erklärungskraft und Grenzen.', 'Fossil- und Homologiebelege werden eingeordnet; Endosymbiose bleibt ein eigener Anteil.', 'Neue Fossilquellen rechtfertigen keine vollständige Endosymbioseabdeckung.'),
 ('Artbildung umfasst Entstehung von Fortpflanzungsisolation.', 'Allopatrische und sympatrische Wege werden nach Trennmechanismus verglichen.', 'Eine allgemeine Artbildungsklausel belegt keinen vollständigen Vergleich beider Wege.'),
 ('Hypothetische menschliche Stammbäume beruhen auf begrenzten Belegen.', 'Fossilbelege, Verzweigung und globale Ausbreitung werden unter Belegunsicherheit getrennt.', 'Eine Übersicht darf Unsicherheit und Ausbreitungsanteil nicht entfernen.'),
 ('Kulturelle Entwicklung umfasst soziale Weitergabe von Werkzeugen und Sprache.', 'Werkzeug- und Sprachentwicklung werden gegenüber genetischer Vererbung eingeordnet.', 'Ein unterer Überblick ist keine ganze fortgeschrittene Kultur-Selektions- oder Ausbreitungskompetenz.'),
 ('Vertiefte Humanevolution vergleicht Hypothesen und Belege.', 'Hominide und kulturelle Evolution werden anhand konkurrierender Deutungen differenziert erklärt.', 'Ein Sek-I-Überblick ersetzt keine vergleichende Vertiefung.'),
 ('Biologische Aussagen können gesellschaftlich missbraucht werden.', 'Sozialdarwinismus, historische NS-Instrumentalisierung und heutige Rassismusdebatte werden quellenbezogen unterschieden.', 'Heutige biologische Rassedebatten belegen nicht allein die historische NS-Analyse.'),
 ('Säugetierentwicklung und Domestikation verbinden verschiedene Prozesse.', 'Züchtung und Domestikation werden als Teilaspekte des ganzen Entwicklungsziels eingeordnet.', 'Eine Züchtungsklausel oder Wasser-Land-Zeitfolge bildet nicht die ganze Säugetierkompetenz ab.'),
 ('Reptilien- und Vogelentwicklung wird anhand vergleichbarer Entwicklungsmerkmale untersucht.', 'Wasser-Land-Kontexte werden vom vollständigen Entwicklungsvergleich getrennt.', 'Eine Wirbeltier-Evolutionsquelle ersetzt keinen Reptilien-Vogel-Entwicklungsvergleich.'),
 ('Systematik ordnet Lebewesen hierarchisch nach morphologischen und anatomischen Merkmalen.', 'Ähnlichkeitsmerkmale werden begründet einer Hierarchie zugeordnet.', 'Neue Länderzuweisungen ändern die Geltung, aber weder Zieltext noch Bedeutung der Hierarchie.')]
protected_en = [
 ('Observations produce raw data; criteria limit interpretation.', 'Own cross-section and variation observations are documented with raw data.', 'Invented observations do not replace documented traits.'),
 ('Models represent selected relationships and have limits.', 'Representation and limits are explained for fossil, selection or software models.', 'Construction and conduct remain additional operations; description does not demonstrate either.'),
 ('Hypotheses are tested through planned controlled investigations.', 'Planning, conduct, controls and records are distinguished in the investigation.', 'A new lower-stage route does not replace prerequisites of the whole upper-stage goal.'),
 ('Microscopic findings require actually prepared and focused specimens.', 'An own plant cross-section is mounted, focused and documented with scale.', 'Narrated microscope images do not demonstrate own preparation or observation.'),
 ('Biodiversity includes variety, extinction and discovery.', 'The unchanged aspects are distinguished in the corrected RP-TF2 source context.', 'Correcting a source location from page25 to26 creates no new subject performance.'),
 ('Evolution connects mutation and recombination with differential reproductive success.', 'Origins of variation and changes in reproductive success are explained together.', 'Two heritable asexual model types do not replace mutation and recombination.'),
 ('Evolutionary evidence has differing explanatory strength and limits.', 'Fossils and homology are classified; endosymbiosis remains a distinct component.', 'New fossil sources do not justify complete endosymbiosis coverage.'),
 ('Speciation includes the emergence of reproductive isolation.', 'Allopatric and sympatric routes are compared by isolation mechanism.', 'A general speciation clause does not demonstrate the complete comparison.'),
 ('Hypothetical human phylogenies rely on limited evidence.', 'Fossil evidence, branching and global spread are separated under evidential uncertainty.', 'An overview cannot delete uncertainty or the spread component.'),
 ('Cultural development includes social transmission of tools and language.', 'Tool and language development are distinguished from genetic inheritance.', 'A lower-stage overview is not a whole advanced culture-selection or spread competence.'),
 ('Advanced human evolution compares hypotheses and evidence.', 'Hominid and cultural evolution are differentiated through competing interpretations.', 'A lower-stage overview does not replace comparative depth.'),
 ('Biological claims can be socially misused.', 'Social Darwinism, historical Nazi misuse and current racism debates are distinguished by source.', 'Current biological race debates do not alone demonstrate historical Nazi analysis.'),
 ('Mammal development and domestication connect different processes.', 'Breeding and domestication are placed as components of the whole development goal.', 'A breeding clause or water-land timeline does not cover the whole mammal competence.'),
 ('Reptile and bird development is studied through comparable developmental traits.', 'Water-land contexts are distinguished from the complete development comparison.', 'A vertebrate evolution source does not replace a reptile-bird development comparison.'),
 ('Classification orders organisms hierarchically by morphology and anatomy.', 'Observed similarities are justified within a hierarchy.', 'New jurisdiction assignments change applicability, neither goal wording nor the meaning of hierarchy.')]

for selection in ['evolution17', 'protected-source-contexts']:
    src = n / 'native-subsets' / selection / 'round-b'
    dest = o / 'ordinary-D' / selection
    dest.mkdir(parents=True, exist_ok=True)
    campaign = json.loads((src / 'description-review-campaign.json').read_text())
    inp = json.loads((src / 'description-review-input.json').read_text())
    bundle = json.loads((n / 'native-subsets' / selection / 'bundle/review-bundle-manifest.json').read_text())
    runid = 'evo-native-' + selection + '-independent-b-20261009'
    ownrows = first['native17Rows' if selection == 'evolution17' else 'protected15Rows']
    records = []
    for i, (g, obs) in enumerate(zip(inp['goals'], ownrows)):
        assert g['goalId'] == obs['goalId']
        if selection == 'evolution17':
            prof = profiles[g['goalId']]['profile']
            ex = prof['expectations']
            case = prof['applicationCaseBriefs'][-1]
            chains = {key: ' '.join(x[key] for x in ex) for key in ['essentialUnderstandingDe', 'essentialUnderstandingEn', 'observablePerformanceDe', 'observablePerformanceEn']}
            chains.update(transferExpectationDe=case['expectedPerformanceDe'], transferExpectationEn=case['expectedPerformanceEn'])
            rationale = obs['ownObservation'] + ' ' + obs['layoutObservation'] + ' Eigene Science-FIRST vor Autoren-QS; vollständige Materialketten selbst fachlich geprüft, unveränderte gelesene P-Kandidatenformulierungen erhalten. Source-/Kurs-Gates getrennt, keine menschliche Freigabe.'
        else:
            chains = dict(zip(['essentialUnderstandingDe', 'observablePerformanceDe', 'transferExpectationDe'], protected_de[i]))
            chains.update(dict(zip(['essentialUnderstandingEn', 'observablePerformanceEn', 'transferExpectationEn'], protected_en[i])))
            unchanged = not g['goalId'].startswith('2ae2da43')
            rationale = obs['specificSourceBoundaryFromOwnFrozenReview'] + ' ' + obs['layoutObservation'] + ' Targeted source/page assurance only. ' + ('Ordinary complete native page/context fingerprints unchanged: preserve existing valid D/P, no restarted historical semantic review.' if unchanged else 'Actual applicability page/context change: targeted candidate supersession, unchanged goal semantics preserved; no strict restoration yet.')
        records.append({
            '$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
            'schemaVersion': 1, 'recordId': runid + '.' + g['goalId'], 'runId': runid,
            'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'],
            'bundleFingerprint': campaign['bundleFingerprint'], 'bookDigest': campaign['bookDigest'],
            **{k: g[k] for k in ['goalId', 'goalFingerprint', 'pageFingerprint', 'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn']},
            'decision': 'keep', 'understandingEvidence': chains, 'rationale': rationale,
            'evidenceProfileContract': 'positive-understanding-evidence-v2',
            'evidenceProfileRecommendation': 'create' if selection == 'evolution17' else 'none',
            'recordStatus': 'candidate', 'reviewAuthority': 'ai_candidate'})
    raw = ('\n'.join(json.dumps(x, ensure_ascii=False, separators=(',', ':')) for x in records) + '\n').encode()
    (dest / 'description-records.independent-b.jsonl').write_bytes(raw)
    batch = campaign['batches'][0]
    artifacts = [{'role': x['role'], 'digest': x['digest']} for x in bundle['artifacts'] if x['role'] in ['review_prompt', 'review_criteria', 'book_pdf', 'book_html', 'book_model']]
    artifacts.append({'role': 'description_review_batch_input_jsonl', 'digest': batch['batchInputFingerprint']})
    run = {'$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
           'schemaVersion': 1, 'runId': runid, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'],
           'batchId': batch['batchId'], 'batchInputFingerprint': batch['batchInputFingerprint'],
           'bundleFingerprint': campaign['bundleFingerprint'], 'bookDigest': campaign['bookDigest'],
           'provider': 'OpenAI', 'model': 'GPT-6 Codex; runtime sampling parameters not exposed', 'role': 'subject_reviewer',
           'promptFamilyId': 'goal-description-review-v1', 'promptFingerprint': campaign['promptFingerprint'],
           'criteriaFingerprint': campaign['criteriaFingerprint'],
           'generationParametersFingerprint': 'sha256:' + hashlib.sha256(b'Runtime generation parameters not exposed; no temperature or seed asserted.').hexdigest(),
           'independenceGroupId': campaign['independenceGroupId'], 'blindToOtherRuns': True,
           'goalIds': batch['goalIds'], 'inputArtifacts': artifacts, 'startedAt': first['createdAt'], 'completedAt': when,
           'status': 'completed', 'outputDigest': 'sha256:' + hashlib.sha256(raw).hexdigest(),
           'toolchainVersion': 'independent-b-native-science-FIRST-20261009'}
    (dest / 'run.independent-b.json').write_text(json.dumps(run, ensure_ascii=False, indent=2) + '\n')
    shutil.copyfile(src / 'description-review-campaign.json', dest / 'campaign.unchanged-author-neutral-template.json')
    print(selection, 'own records', len(records))

positive = o / 'ordinary-P17'
positive.mkdir(exist_ok=True)
reviewid = 'biologie-evolution-native17-independent-b-v1'
out = []
for r in profiles.values():
    r.update(reviewId=reviewid, reviewedAt=when, reviewer='Codex independent B; whole bilingual materials and native pages read before immutable science-FIRST',
             reason='Independent scientific review of both full bilingual cases, rubric, whole goal and actual native pages. Own immutable science-FIRST records goal-specific calculations and caveats. Exact scientifically read profile body preserved with current goal/resource bindings; needs_human_review E1/G1. No whole-source, course, native integration, actual learner experiment or human approval.',
             status='needs_human_review', reviewAuthority='ai_candidate', reviewRunIds=[])
    out.append(r)
(positive / 'P17.independent-b.candidate.review.jsonl').write_text('\n'.join(json.dumps(x, ensure_ascii=False, separators=(',', ':')) for x in out) + '\n')
cfg = json.loads((n / 'positive/P17.current-raster.inactive.config.json').read_text())
cfg.update(reviewId=reviewid, reviewPath=(positive / 'P17.independent-b.candidate.review.jsonl').as_posix(), requireApproved=False)
(positive / 'P17.independent-b.inactive.config.json').write_text(json.dumps(cfg, ensure_ascii=False, indent=2) + '\n')
print('P17 remains E1/G1 needs_human_review ai_candidate; full profiles unchanged')
