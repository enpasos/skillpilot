# Apache-2.0. Immutable actual source comparison and bounded inert view authoring.
import json, hashlib, pathlib, datetime, collections
directory=pathlib.Path(__file__).resolve().parent
root=directory.parents[6]
author=root/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-q-business-macro-twenty-bilingual-author-v1'
previous=root/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-law479-independent-source-scope-decision-v1'
extraction=root/'curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/DE_BY_WIRTSCHAFT_UND_RECHT_GYMNASIUM_LEHRPLANPLUS.source-extraction.json'
read=lambda p:json.loads(p.read_text())
sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
write=lambda p,x:p.open('x').write(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
goals_path=author/'whole-goals.with-individual-taxonomy.candidate.json'
goals=read(goals_path)
rows=read(extraction)['sourceGoals']
inputs=read(author/'actual-twenty-whole-current-BY-source-bindings.input.json')['wholePerGoalSourceInputs']
by_id={r['goalId']:r for r in inputs}
basic_rows=[r for r in rows if r['topicCode'] in ['J12','J13'] and 'grundlegendes' in r['parentBulletText']]
assert len(goals)==20 and len(rows)==184 and len(basic_rows)==27
sources={
 'B12':{'url':'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/wirtschaft-und-recht/grundlegend','actualRenderingReference':'turn292view0','actualReadBounds':'whole BWL 46–111; whole VWL 116–245, including every basic expected competence and relevant content; current official HTML, not a historical PDF snapshot'},
 'E12':{'url':'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/wirtschaft-und-recht/erhoeht','actualRenderingReference':'turn295view0','actualReadBounds':'whole relevant BWL 51–270; whole relevant growth/model and income/social sections 272–429; source span J12.n is extraction ordinal, not official unit number'},
 'B13':{'url':'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/13/wirtschaft-und-recht/grundlegend','actualRenderingReference':'turn295view1','actualReadBounds':'whole money/price section 166–213'},
 'E13':{'url':'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/13/wirtschaft-und-recht/erhoeht','actualRenderingReference':'turn283view0','actualReadBounds':'whole money/price section 214–269, actually read during preceding whole substantive review'},
 'F':{'url':'https://www.lehrplanplus.bayern.de/fachprofil/gymnasium/wirtschaft-und-recht','actualRenderingReference':'turn294view0','actualReadBounds':'whole Fachprofil 47–175; especially process dimensions 69–81 and explicit basic/elevated distinctions 127–139'},
 'B10':{'url':'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/10/wirtschaft-und-recht/andere','actualRenderingReference':'turn298view1','actualReadBounds':'whole general-route market section 42–119 and business-model/project section 227–269; WWG-only extended content not substituted for all-route basics'},
 'B11':{'url':'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/11/wirtschaft-und-recht/andere','actualRenderingReference':'turn298view0','actualReadBounds':'whole general-route economic-order section 44–134 and international-policy section 188–253; WWG-only additional electives not substituted for all-route basics'}
}
# Each decision was manually made after actual complete DE/EN and source reading.
# A synthesized supported competence is not an invented identical official basic row.
manual=[
 ('complete-basic-supported','B12 WR12 LB1: 55, 83–91; F 75–78','E12 WR12 1.1: 68, 80–88','J12.1',
  'Die gesamte Zielbeschreibung bleibt innerhalb von Zielwechselwirkungen, Stakeholderperspektiven und langfristiger Orientierung. Das analytische Begründen operationalisiert diese vorhandenen Sach- und Prozessanforderungen; es fügt keine besondere erhöhte Methode hinzu.'),
 ('complete-basic-supported','B12 WR12 LB1: 60, 91–94; B10 WR10 LB3: 236–259; F 71, 78','E12 WR12 1.2: 111, 127, 134–156','J12.2',
  'Kunden-, Umwelt-, Sozial- und Ethikbezug sind schon grundlegende Beschaffungs-/Absatzinhalte. Der aktuelle Lernzieltext fordert ein begründetes Urteil zu diesen konkreten Entscheidungen, keine zusätzlichen Beschaffungsarten oder Spezialinstrumente. Die gemeinsame Beurteilungskompetenz und das eigene Geschäftsmodell tragen dieses enge Urteil. Der Operator allein rechtfertigt keinen LK-Ausschluss.'),
 ('complete-basic-supported','B12 WR12 LB1: 66, 98','E12 WR12 1.2: 121, 145–149','J12.3',
  'Die Zielbeschreibung fordert genau die Erlös-/Kosten- und Gewinnwirkung der Break-even-Analyse. Zusätzliche externe Einflussfaktoren des erhöhten Abschnitts sind nicht Bestandteil dieses Lernziels.'),
 ('elevated-only','B12 WR12 LB1: 71, 102','E12 WR12 1.4: 208, 220–228','J12.4',
  'Das gesamte Ziel verlangt ausdrücklich statische UND dynamische Verfahren. Die Grundstufe trägt nur ein statisches Verfahren. Risiko/qualitative Abwägung allein schließen diese technische Lücke nicht; die dynamische Methode ist eine eigenständige notwendige Komponente.'),
 ('complete-basic-supported','B12 WR12 LB1: 71, 83, 105; B10 WR10 LB3: 236, 259; F 129','E12 WR12 1.4: 214, 232–235','J12.4',
  'Die Beschreibung nennt zielbezogene Finanzierungsabwägung, keinen Leverage-Effekt, keine Pflichtliste aller erhöhten Detailziele und kein besonderes Finanzmodell. Grundformen von Finanzierung abzuwägen, Kapitalbedarf/Finanzierungsmöglichkeiten im Geschäftsmodell und deren betriebswirtschaftliche Zielwirkung genügen für diese gesamte allgemeine Kompetenz. Die erhöhte Herkunftszeile bleibt korrekt; eine zweite grundlegende Stütze ist eine begründete Quellensynthese.'),
 ('elevated-only','B12 WR12 LB1: 77, 109; B10 WR10 LB3: 243, 263–267','E12 WR12 1.3: 166, 179–191','J12.5',
  'Das gesamte Ziel verlangt zugleich Finanzlage UND Ertragslage mit geeigneten Kennzahlen und Tabellenkalkulation. Erfolgskennzahlen plus vereinfachte Bilanz tragen Teile, belegen aber die zusätzliche Kennzahlenanalyse der Finanzlage und die konkrete Tabellenkalkulationskompetenz nicht vollständig. Allgemeine digitale Medien ersetzen diese spezifische Breite nicht.'),
 ('complete-basic-supported','B12 WR12 LB1: 66, 77, 98, 109','E12 WR12 1.5: 247, 260','J12.3 + J12.5',
  'Verschiedene betriebswirtschaftliche Analyseinstrumente sind bereits mit Break-even-Analyse und Erfolgskennzahlen konkret vorhanden. Der ganze Lernzieltext verlangt weder SWOT ausdrücklich noch eine Vollständigkeit aller erhöhten Instrumente. Eine solche Erweiterung darf aus dem Quellenelternteil oder aus einem möglichen Aufgabenbeispiel nicht in die stabile Semantik hineingelesen werden.'),
 ('complete-basic-supported','B12 WR12 LB1: 60, 94; B10 WR10 LB3: 236, 238, 250, 259, 267; F 129','E12 WR12 1.5: 253, 264–268','J12.2; general-route J10 business-model/project rows',
  'Der gezielte erneute ganze DE/EN- und P-Fallvergleich klärt den zunächst offenen Umfang: verlangt sind mögliche Strategien und konkrete Managementbedeutung, keine Kenntnis bestimmter professioneller Strategie- oder Managementmodelle. Beide P-Fälle liefern die Strategieabgrenzungen ausdrücklich. Gemeinsame Geschäftsmodell-/Marketing-/Kapazitätsentscheidungen plus Zielsetzung, Planung und Evaluation tragen die Optionen und koordinierte Umsetzung. Das ist eine tragfähige ausdrückliche Basic-Quellensynthese für den generischen AB2-Text. Kennzahlenanalyse ist damit nicht automatisch universelle Voraussetzung; diese Kante ist ein separater Befund.'),
 ('complete-basic-supported','B12 WR12 2.2: 160, 176–203','E12 WR12 2.2: 315, 338–368','J12.7',
  'Maßnahmen, Wachstum/Beschäftigung und volkswirtschaftliche Modelle sind vollständig schon im grundlegenden Abschnitt verbunden. Der Text verlangt intendierte Wirkung, keine sichere Prognose und keine erhöhten Zusatzmethoden.'),
 ('complete-basic-supported','B12 WR12 2.2: 167, 195–206; B11 WR11 LB3: 199; F 130','E12 WR12 2.2: 326, 342, 364–372','J12.8; general-route J11 international-policy row',
  'Der grundlegende aktuelle Abschnitt trägt Perspektiven, Nachfrage-/Angebotszuordnung sowie Haushalts-/Umweltfolgen. Die ausdrücklich bereits allgemeine J11-Anforderung, politische Folgen kurz- UND langfristig aus Akteurperspektiven zu diskutieren, trägt das zeitliche Analyseverfahren. Dies ist eine ausgewiesene Synthese der gemeinsamen Vorläuferkompetenz mit den konkreten J12-Inhalten; es ist keine Behauptung, dass der J12-Basic-Einzelbullet selbst die beiden Zeithorizonte wortgleich aufzählt.'),
 ('elevated-only','B12 WR12 2.3: 216, 228–232','E12 WR12 2.3: 386, 407','J12.9',
  'Wachstum und Beschäftigung sind gemeinsam, die volle Beschreibung verlangt zusätzlich Lohn- UND Gewinnquote. Diese konkrete Verteilungsgröße wird in der grundlegenden Tarifanforderung nicht getragen. Allgemeines Gerechtigkeitsurteil ersetzt die verpflichtende Quotendimension nicht.'),
 ('complete-basic-supported','B12 WR12 2.3: 221, 236–245; B11 WR11 LB1: 69, 113; F 130','E12 WR12 2.3: 391, 414–423','J12.10; J11.3',
  'Grundlegend sind ausgewählte Sozialversicherungszweige mit heutigen/künftigen Herausforderungen und Finanzierbarkeit ausdrücklich vorhanden. Die gemeinsame J11-Anforderung beurteilt Sozialpolitik bereits hinsichtlich sozialer Gerechtigkeit und soziale Sicherung ist Inhalt. Zusammen tragen sie das ganze aktuelle Lernziel; keine Pflicht aller vier im erhöhten Abschnitt beispielhaft konkretisierten Gerechtigkeitsarten wird zusätzlich behauptet.'),
 ('elevated-only','B12 WR12 2.3: 221, 236–245; B11 WR11 LB1: 69, 113','E12 WR12 2.3: 397, 423–427','J12.10; J11.3 only partial',
  'Bewertung bestehender Versicherungszweige und allgemeine sozialpolitische Gerechtigkeit sind Teilstützen. Das gesamte Ziel verlangt darüber hinaus eigenständige alternative Sicherungskonzepte und deren Finanzierbarkeits-/Gerechtigkeitsdiskussion. Ein aktueller verpflichtender Grundkursbeleg für diese zusätzliche Konzeptbreite fehlt; der erhöhte Abschnitt fordert sie ausdrücklich.'),
 ('elevated-only','B12 WR12 LB1: 60, 94','E12 WR12 1.2: 111, 134–138','J12.2 only partial',
  'Eine nachhaltige Beschaffungsentscheidung trägt nicht die gesamte zusätzliche Analyse verschiedener Beschaffungsarten und von Standards entlang einer Lieferkette. Dies sind konkrete Inhaltskomponenten, die der erhöhte Abschnitt ausdrücklich verbindet; sie werden nicht aus allgemeinen Ökologie-/Ethikzielen automatisch abgeleitet.'),
 ('elevated-only','B12 WR12 LB1: 60, 94; B10 WR10 LB3: 236, 259','E12 WR12 1.2: 116, 142','J12.2 and business-model organization only partial',
  'Die sechs expliziten Dimensionen der Zielbeschreibung gehen über die allgemeine Organisation der Leistungserstellung hinaus. Insbesondere Durchlaufzeit, Flexibilität und Individualisierung als gemeinsam zu analysierende Prozessfolgen fehlen als volle Grundstufenanforderung. WWG-spezifische frühere Vertiefungen dürfen nicht als Pflichtbeleg für alle BY-Grundkurse eingesetzt werden.'),
 ('elevated-only','B12 WR12 LB1: 60, 94; B10 WR10 LB3: 236, 259','E12 WR12 1.2: 127, 153–156','J12.2 and J10 market-chance content only partial',
  'Kunden-/Absatzentscheidungen und Marktchancen tragen situative Teilanalyse. Das gesamte Ziel verlangt zusätzlich das Ermitteln des Produktmarktpotenzials. Ein allgemeiner Verweis auf Marktchancen belegt diese besondere Ermittlungskompetenz nicht vollständig; sie ist im erhöhten aktuellen Abschnitt ausdrücklich vorhanden.'),
 ('complete-basic-supported','B10 WR10 LB1: 73, 114; B11 WR11 LB1: 62, 76, 106–124; B12 WR12 2.2: 160, 167','E12 WR12 2.2: 321','J10.4; J11.4; J12.7 + J12.8',
  'Der verbindliche allgemeine J10-Pfad kontrastiert bereits Modellprämissen mit der Realität. J11 verbindet Marktgrenzen/staatliche Eingriffe und Kreislaufzusammenhänge, J12 setzt Modelle bei konkreten politischen Maßnahmen ein. Diese konkreten vorhandenen Methoden tragen Nutzen und Grenzen bei einer Politikanwendung. Kein bestimmtes zusätzliches erhöhtes Modell oder die Gesamtheit aller VWL-Modelle steht in der aktuellen Zielbeschreibung; die fachliche Synthese wird offen deklariert.'),
 ('complete-basic-supported','B12 WR12 2.1/2.2: 149, 160, 167, 176–206; B11 WR11 LB1: 69, 106','E12 WR12 2.2: 331, 372–376','J12.7 + J12.8; J11.3',
  'Die bereits grundlegende Kombination aus staatlicher Politik, Wachstum/Beschäftigung, Umweltfolgen und Zielbeziehungen trägt die gesamten Wechselwirkungen im generischen Lernziel. Es wird keine weitere spezielle erhöhte Umweltmethode gefordert. Ein höherer eigener Bullet ist daher kein Nachweis fehlender gesamter Grundkompetenz.'),
 ('complete-basic-supported','B13 WR13 2.1: 173, 196–208','E13 WR13 2.1: 227, 245–267','J13.9',
  'Preis-/Zinsentwicklung, alle drei Akteure und Modellgebrauch sind im grundlegenden aktuellen Geldabschnitt ausdrücklich verbunden. Das ganze Lernziel geht darüber nicht hinaus.'),
 ('complete-basic-supported','B13 WR13 2.1: 188, 208–211','E13 WR13 2.1: 238, 263–269','J13.11',
  'Die grundlegende Erwartung trägt monetäre/realwirtschaftliche Größen, EZB-Entscheidung und Mandat. Die aktuelle Kompetenz verlangt Nachvollziehen/Einordnen und keine darüber hinausgehende erhöhte Bewertung aus zusätzlichen Perspektiven.')
]
assert len(manual)==len(goals)
records=[]
for goal,(disposition,basic,elevated,raw_support,rationale) in zip(goals,manual):
 original=by_id[goal['id']]['wholeOriginalSourceRow']
 records.append({'goalId':goal['id'],'wholeCurrentIndividualTaxGoal':goal,
  'originalSourceRowId':original['id'],'originalSnapshotSourceSpan':original['sourceSpan'],
  'originalParentIsElevated':'erhöhtes' in original['parentBulletText'],
  'disposition':disposition,'currentOfficialBasicBounds':basic,'currentOfficialElevatedBounds':elevated,
  'additionalOldSnapshotBasicSupport':raw_support,'goalSpecificRationaleDe':rationale,
  'basicSupportIsExplicitAuthoredSynthesis':disposition=='complete-basic-supported' and 'erhöhtes' in original['parentBulletText'],
  'proposedAdditionalBYBasicProjectionRole':'prerequisiteOnly' if disposition=='elevated-only' else None,
  'roleInOtherJurisdictionsChanged':False,'humanApprovalClaimed':False})
excluded=[r['goalId'] for r in records if r['disposition']=='elevated-only']
open_ids=[r['goalId'] for r in records if r['disposition']=='unresolved']
source_inputs={'role':'actual_whole_owned_goal_and_original_source_inputs_for_independent_comparison',
 'wholeCurrentGoals':goals,'whole27BasicSnapshotRowsActuallyRead':basic_rows,
 'whole20HistoricalPerGoalSourceBindingsActuallyReadPreviouslyAndSourceTextsRereadNow':inputs,
 'selectedEarlierGeneralRouteSourceRowsActuallyRead':[r for r in rows if r['topicCode'] in ['J10','J11'] and 'WWG' not in r['parentBulletText'] and any(w in r['sourceText'].lower() for w in ['modell','sozial','gerecht','finanz','unternehmen'])]}
write(directory/'actual-whole-inputs-and-27-basic-source-rows.json',source_inputs)
write(directory/'twenty-individual-regional-basic-source-dispositions.actual.json',records)
view_dir=directory/'bounded-BY-pair-scope-author-candidate-v2';view_dir.mkdir()
view_inputs=[]
for profile in ['GK','LK']:
 old=previous/f'de-by-gym-economics-{profile.lower()}-479-bounded.inert.view.json'
 baseline=read(old);candidate=json.loads(json.dumps(baseline))
 if profile=='GK':
  candidate['rootNodes'][0]['children'].extend({'kind':'goalEntry','goalId':goal_id,'projectionRole':'prerequisiteOnly'} for goal_id in excluded)
 target=view_dir/f'de-by-gym-economics-{profile.lower()}-macro-bounded.inert.view.json'
 write(target,candidate)
 expected=json.loads(json.dumps(candidate))
 if profile=='GK':expected['rootNodes'][0]['children']=expected['rootNodes'][0]['children'][:-len(excluded)]
 assert expected==baseline
 view_inputs.append({'courseProfile':profile,'baselinePath':str(old.relative_to(root)),'baselineSha256':sha(old),
  'candidatePath':str(target.relative_to(root)),'candidateSha256':sha(target),
  'wholeOtherAuthoredStructureScopeAndRolesExactlyPreserved':True,
  'addedDirectPrerequisiteOnlyEntries':excluded if profile=='GK' else [],
  'previous479DecisionExactlyPreserved':True,'335RoleNotChanged':True})
paths=[goals_path,extraction,author/'positive.slug-corrected.candidates.v2.json',author/'actual-twenty-whole-current-BY-source-bindings.input.json']
guards=[{'path':str(p.relative_to(root)),'sha256':sha(p)} for p in paths]
receipt={'role':'actual_independent_twenty_regional_basic_source_comparison_and_transparently_authored_inert_projection_candidate',
 'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'provider':'OpenAI','model':'Codex session; exact serving model identifier not exposed',
 'reviewerTask':'/root/economics_visual_memory_audit','sourceComparisonIndependentOfSourceCourseAuthor':True,
 'viewCandidateAuthorship':'This reviewer authored the inert pair. These changes require a different substantive counterpart; this agent cannot claim an independent D scope review of its own new entries.',
 '335TargetedDisposition':'Initially provisionally unresolved. Resolved in this first materialized receipt only after actual whole DE/EN, both whole P cases, and current general-route business-model/project competence rereading. Supplied strategy definitions and absence of a named-model requirement matter; no verb-only or elevated-parent-only decision.',
 'actualReadSources':sources,'wholeGoalsReadDEandEN':20,'oldWholeSourceExtractionTotalRows':184,
 'oldBasicJ12J13RowsActuallyRead':27,'oldAll184WholeRowsActuallyReadClaim':False,
 'twentyOriginalRowParentCount':dict(collections.Counter('elevated' if r['originalParentIsElevated'] else 'basic' for r in records)),
 'twentyWholeGoalDispositionCounts':dict(collections.Counter(r['disposition'] for r in records)),
 'sevenAdditionalGKPrerequisiteOnlyCandidateGoalIds':excluded,'oneUnresolvedGoalIds':open_ids,
 'basis':'Whole assessable DE/EN requirements compared with current specific contents and explicit common general-route precursor/process competencies. Raw parent course, verbs, phase and requires do not decide projection roles. A combined source-support judgment is not a new exact official per-goal mapping.',
 'currentSourceCourseMetadata14Elevated6BasicNotOverturned':True,
 'viewCandidates':view_inputs,'guardedImmutableAuthorAndSourceInputs':guards,
 'sourceMappingsEdited':0,'activeRegistryCanonicalViewOrRuntimeWrites':0,
 'newStrictCompletions':0,'current303DenominatorChanged':False,'future311Activated':False,
 'P40AM20Tax20Cards3SubstantiveReviewNotRepeated':True,'currentFinalV20NotReReviewed':True,
 'fullBavarianRegionalCurriculumApprovalClaim':False,'sourceDecisionsRequireDifferentCounterpartBeforeIntegration':True,
 'humanApprovalOrLearnerEvidenceClaim':False,'privateLearnerOrSessionDataRead':False,
 'limitations':['All candidate views retain CrossStage, exactly as their accepted predecessor. They do not match an exact SekII request and do not claim an independently approved full SekII offering.','Seven elevated-only judgments concern the full present competencies for the common BY basic target; optional or WWG-specific earlier depth is not silently converted into compulsory all-route proof.','335 retains its current authored role. Its necessary prerequisites remain a separate unsettled didactic question, not silently resolved by the source classification.']}
write(directory/'actual-independent-twenty-basic-regional-source-and-inert-scope-disposition.receipt.json',receipt)
print(json.dumps({'counts':receipt['twentyWholeGoalDispositionCounts'],'seven':excluded,'unresolved':open_ids,'receiptSha256':sha(directory/'actual-independent-twenty-basic-regional-source-and-inert-scope-disposition.receipt.json')},ensure_ascii=False,indent=2))
