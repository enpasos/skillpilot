#!/usr/bin/env python3
"""Own informed finite source review. Writes only to this evidence directory."""
from pathlib import Path
import json
import hashlib
import datetime
import subprocess

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
AUTHOR = OUT.parent / 'chemie-current450-BB-BE-six-process-source-author-20261018-v1'

def read(p):
    return json.loads(Path(p).read_text())

def pin(p):
    p = Path(p).resolve()
    b = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': hashlib.sha256(b).hexdigest(), 'bytes': len(b)}

def oh(v):
    return hashlib.sha256(json.dumps(v, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

def write(name, data):
    p = OUT / name
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    return pin(p)

receiptpath = AUTHOR / 'RECEIPT.author-twenty-six-source-standards.pending-review.json'
matrixpath = AUTHOR / 'MATRIX.twenty-six-whole-standards-and-twelve-goal-country-relations.author.json'
goalpath = AUTHOR / 'INPUT.six-whole-current-goals-and-P.json'
receipt, matrix, goals = read(receiptpath), read(matrixpath), read(goalpath)
assert len(matrix) == 26 and len(goals) == 6
canonical_path = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
canonical = {g['id']: g for g in read(canonical_path)['goals']}
normalpins = {pin(canonical_path)['path']: pin(canonical_path)}
inputpins = [pin(receiptpath), pin(matrixpath), pin(goalpath)]
bygoal = {}
for i, r in enumerate(goals):
    gid = r['wholeGoal']['id']
    assert canonical[gid] == r['wholeGoal']
    native = ROOT / r['reviewPath']
    line = json.loads(native.read_text().splitlines()[r['line'] - 1])
    assert line['goalId'] == gid and line['profile'] == r['wholeProfile']
    bygoal[gid] = (i, r, line)
    for p in [native, ROOT / r['configPath']]:
        normalpins[pin(p)['path']] = pin(p)
for p in receipt['currentPRecordPins']:
    assert pin(ROOT / p['path']) == p
sources, mappings, structure = {}, {}, []
for change in receipt['changes']:
    before, after = change['normalBefore'], change['candidateAfter']
    assert pin(ROOT / before['path']) == before
    assert pin(ROOT / after['path']) == after
    normalpins[before['path']] = before
    inputpins.append(after)
    old, new = read(ROOT / before['path']), read(ROOT / after['path'])
    is_source = 'sourceGoals' in old
    j = old['jurisdiction'] if is_source else ('DE-BB' if '/DE-BB/' in before['path'] else 'DE-BE')
    rows = [r for r in matrix if r['jurisdiction'] == j]
    assert len(rows) == 13
    if is_source:
        assert len(old['sourceGoals']) == 203 and len(new['sourceGoals']) == 216
        assert old['sourceGoals'] == new['sourceGoals'][:203]
        assert new['sourceGoals'][203:] == [r['sourceGoal'] for r in rows]
        assert {k: v for k, v in old.items() if k != 'sourceGoals'} == {k: v for k, v in new.items() if k != 'sourceGoals'}
        assert not any(str(g.get('topicCode', '')).startswith('2.') for g in old['sourceGoals'])
        sources[j] = (after, new)
        structure.append({'jurisdiction': j, 'kind': 'source-extraction', 'beforePin': before, 'candidatePin': after,
                          'old203GoalsAndAllOtherFieldsExact': True, 'addedWholeStandards': 13,
                          'wholeRetainedPassagesUnchanged': True})
    else:
        assert old['mappings'] == new['mappings'][:len(old['mappings'])]
        assert old['decisions'] == new['decisions'][:len(old['decisions'])]
        assert new['mappings'][len(old['mappings']):] == [r['mapping'] for r in rows]
        assert {k: v for k, v in old.items() if k not in ['mappings', 'decisions', 'summary']} == {k: v for k, v in new.items() if k not in ['mappings', 'decisions', 'summary']}
        assert new['summary'] == {**old['summary'], 'sourceGoals': 216, 'mappedSourceGoals': 216, 'partialMappings': 116}
        added = new['decisions'][len(old['decisions']):]
        assert len(added) == 13
        for a, r in zip(added, rows):
            assert a['sourceGoalId'] == r['sourceGoal']['id']
            assert a['canonicalGoalIds'] == [r['targetGoalId']]
            assert a['rationale'] == r['authorRationaleDe'] + ' Dies ist nur eine partielle Quellenbeziehung; keine Ganzquellenfreigabe und keine tatsächliche Lernendenleistung.'
        mappings[j] = (after, new)
        structure.append({'jurisdiction': j, 'kind': 'mapping', 'beforePin': before, 'candidatePin': after,
                          'old317MappingsAndOld203DecisionsExact': True, 'addedPartialMappings': 13,
                          'addedAuthorDecisionRecords': 13, 'exactMappingsStill100': True})

for p in receipt['primaryDocuments']:
    assert pin(ROOT / p['path']) == p
    normalpins[p['path']] = p
assert receipt['primaryDocuments'][0]['sha256'] == receipt['primaryDocuments'][1]['sha256'] == '2fa91c684e7a8735cb21f05c9106260ce22b34f3614ee22cd5c8c7deb10c3ad5'
primary = OUT / 'primary-readings'
primary.mkdir(exist_ok=True)
sharedpdf = ROOT / receipt['primaryDocuments'][0]['path']
for page in [9, 11, 12, 13, 14]:
    subprocess.run(['pdftotext', '-f', str(page), '-l', str(page), '-layout', str(sharedpdf), str(primary / f'shared-original-page-{page}.actual-pdftotext.txt')], check=True, capture_output=True)

# Scientific decisions are this reviewer's reading, not derived from hashes or
# author decisions. Each is approved only as the specifically bounded partial
# contribution below. A repeated shared standard has a separate country record.
SCIENCE = {
 'E5': {
   'contributionDe': 'Nachvollziehbares Protokollieren als fachliche Teilkompetenz einer experimentellen Untersuchung.',
   'currentEvidenceDe': '9fc verlangt eine eigene strukturierte R1-Tabelle mit unveränderten Rohwerten, Einheiten, Quelle, Bedingungen und sichtbaren Fehlstellen. R2 wird als neues getrenntes Ereignis dokumentiert. Im D2-Fall bleiben Rohabsorbanz und nachträglich berechnete Konzentration sowie Faktor-2-/Faktor-4-Versionen getrennt. Damit ist das Dokumentationshandwerk konkret vorhanden.',
   'scientificReasonDe': 'Der vollständige E5-Standard enthält Protokollierung als eigenen Verbteil. Das aktuelle Ziel trägt diesen Anteil und dessen Erwerbsgrundlage fachlich. Seine transparent als fiktiv/gegeben markierten Daten bleiben gültige Papierübungen für die Dokumentationskompetenz.',
   'sourceRemainderOpenDe': 'E5 fordert die sichere reale qualitative UND quantitative Untersuchung einschließlich Durchführung und Auswertung. Das Dokumentieren gegebener oder recherchierter Daten ist kein eigenes experimentelles Protokoll eines tatsächlich selbst ausgeführten Versuchs; der praktische E5-Vollzug, konkrete Sicherheit und die ganze Auswertung bleiben unbestätigt.',
   'profileLocators': ['/expectations/0', '/expectations/1', '/expectations/2', '/applicationCaseBriefs/0', '/applicationCaseBriefs/1']},
 'E8': {
   'contributionDe': 'Strukturen/Trends aus Daten gewinnen, fachlich erklären und begrenzte Hypothesenschlüsse ziehen.',
   'currentEvidenceDe': '7d9 verlangt eigene Tabellen/Diagramme, Mittelwerte 92/64/49 s und Erhalt der Wiederholungen. Der 50-°C-Transfer behält 80/45 s statt eines passend gewählten Einzelwerts. Die Leitfähigkeitsreihe wird mit mobilen Ionen gegenüber weitgehend ungeladener Saccharose theoriebezogen erklärt; bei einer wärmeren Einzelprobe wird die Konzentrationsaussage begrenzt.',
   'scientificReasonDe': 'E8 erlaubt ausdrücklich erhobene ODER recherchierte Daten. Das aktuelle Profil verbindet Darstellung, Zusammenhang, chemische Erklärung und Schlussfolgerung; es reduziert den Standard nicht auf Ablesen. Ein vorgegebenes Ausgangshypothesenmodell ist mit diesem Standard vereinbar.',
   'sourceRemainderOpenDe': 'Die begrenzten Modellfälle belegen keinen vollständigen SekII-E8-Abschluss über alle Themen/Komplexitäten, keine eigene Messung und keine universelle Pflicht, selbst Hypothesen aufzustellen. Der zusätzliche HB-SekI-Diagrammauftrag wird nicht auf BB/BE übertragen.',
   'profileLocators': ['/expectations/0', '/expectations/1', '/expectations/2', '/applicationCaseBriefs/0', '/applicationCaseBriefs/1']},
 'E12': {
   'contributionDe': 'Möglichkeiten und Grenzen konkreter Datengewinnung und daraus zulässiger Erkenntnisse reflektieren.',
   'currentEvidenceDe': '4aa prüft am X/Y-Farbtest Selektivität, Blind-/Positivkontrollen und unvollständige Probenbehandlung. Y-Ausschluss wird nicht zum absoluten X-Nachweis. Der Temperatur-/Saccharose-Transfer verlangt geeignete Kontrollen, Matrixbezug und Trennung von Wiederholstreuung und Gesamtunsicherheit.',
   'scientificReasonDe': 'Diese Fälle bearbeiten gerade die Abhängigkeit der Erkenntnis von Messprinzip und Untersuchungsbedingungen. Das unterstützt den konkreten Grenzen-/Reichweitenanteil von E12 und seine verlangte Reflexion.',
   'sourceRemainderOpenDe': 'Der ganze E12-Standard einschließlich der Breite von Reproduzierbarkeit, Falsifizierbarkeit, Intersubjektivität, logischer Konsistenz und Vorläufigkeit wird nicht durch die beiden Fälle abgeschlossen. Eine Mess- oder Validierungsdurchführung wird nicht behauptet.',
   'profileLocators': ['/expectations/0', '/expectations/1', '/expectations/2', '/applicationCaseBriefs/0', '/applicationCaseBriefs/1']},
 'K1': {
   'contributionDe': 'Zielgerichtetes eigenes Recherchieren, tatsächliches Lesen und zweckgerechte Quellenauswahl.',
   'currentEvidenceDe': '5b1 verlangt im tatsächlich recherchepflichtigen Quellenkontext zusätzlich zu gegebenen S/T-Quellen eine selbst bestimmte offene Frage, eigene Suche/Navigation, Öffnen/Lesen, Suchpfad, Urheber/Titel, genaue Fundstelle und eigene fachliche Paraphrase. Die Recherchestrecke wird auch im frischen Zielgruppen-/Mehrwegfall verlangt; Autorenbeispiele zählen nicht als eigene Recherche.',
   'scientificReasonDe': 'Der hier neu gebundene BB-/BE-K1-Kontext ist tatsächlich recherchepflichtig. Daher ist die vorhandene konditionale P-Route in diesem Kontext verbindlich: gegebene UND selbst gesuchte/gelesene Quellen. Das kanonische ODER gewährt hier keinen Abschluss allein mit gegebenen Quellen.',
   'sourceRemainderOpenDe': 'Ein konkreter eigener digitaler Beleg beweist nicht schon die gesamte im Standard verlangte Breite analoger und digitaler Recherche, alle Oberstufenniveaus oder tatsächliche Lernendenrecherche. Keine pharmazeutische oder andere thematisch neue Recherchepflicht. Das Verhältnis von beiden Medienarten bleibt für ganze Quellenerfüllung offen.',
   'profileLocators': ['/expectations/0/observablePerformanceDe', '/variationAxes/2', '/applicationCaseBriefs/0/taskDemandDe', '/applicationCaseBriefs/1/taskDemandDe']},
 'K2': {
   'contributionDe': 'Chemisch relevante Informationen auswählen und unterschiedliche Darstellungen fachlich erschließen.',
   'currentEvidenceDe': '5b1 trennt im Reinigungsfall Säure-Carbonat-Erklärung, Sicherheitsangaben, konkrete Vergleichsdaten und Werbung. Beim Verpackungsfall werden Stoffeigenschaften aus Text, Massen aus Tabelle und Prozessbezug zusammengeführt; gleiche 250-mL-Nutzleistung und fehlende Kreislaufdaten bleiben sichtbar.',
   'scientificReasonDe': 'Die Auswahl wird an der chemischen Frage und Aussagekraft begründet, und Darstellungen liefern unterschiedliche Informationen. Das ist ein konkreter fachlicher Teilbeitrag zu K2.',
   'sourceRemainderOpenDe': 'Die Arbeit an diesen Text-/Tabellen-/Prozessfällen schließt nicht jede komplexe Darstellungsform und nicht das erhöhte SekII-Anforderungsniveau insgesamt ab. Eigene reale Untersuchungsdaten werden nicht aus Lehrmodellen abgeleitet.',
   'profileLocators': ['/expectations/0', '/expectations/1', '/applicationCaseBriefs/0', '/applicationCaseBriefs/1']},
 'K5': {
   'contributionDe': 'Sach-, adressaten- und situationsgerechte Auswahl chemischer Informationen.',
   'currentEvidenceDe': '5b1 verlangt eine strukturierte Information für jüngere Lernende, danach selbstständig eine angepasste Fassung für das Hausmeisterteam und im anderen Fall die Schülerzeitung. Der Transfer benennt für einen realen Reinigungszweck fehlende Materialverträglichkeit und Herstellervorgaben; ein Werbespruch wird nicht in eine Anwendungsempfehlung umgewandelt.',
   'scientificReasonDe': 'Zweck und Adressat bestimmen konkret, welche chemischen Angaben gewählt und wie die Grenzen kommuniziert werden. Dieser Auswahlanteil entspricht K5 unmittelbar.',
   'sourceRemainderOpenDe': 'Die beschriebenen Lehrprodukte sind keine beobachtete Kommunikation mit allen Zielgruppen, keine komplette SekII-K5-Zertifizierung und keine reale Reinigungsfreigabe.',
   'profileLocators': ['/expectations/0', '/expectations/2', '/variationAxes/0', '/applicationCaseBriefs/0', '/applicationCaseBriefs/1']},
 'K8': {
   'contributionDe': 'Ausgewählte Informationen strukturieren, chemisch interpretieren und begrenzte Schlüsse daraus ziehen.',
   'currentEvidenceDe': '5b1 strukturiert chemische Erklärung, Vergleichsbefund und Sicherheit getrennt. Aus weniger Rückstand nach fünf Minuten folgt nur eine bedingte Vergleichsaussage; aus 200/N g Gefäßmasse je Nutzung folgt keine vollständige Umweltbilanz. Fehlende Rücklauf-, Wasch- und Transportdaten werden begründet benannt.',
   'scientificReasonDe': 'Die Schlussfolgerungen werden aus den konkreten Quellen und gemeinsamen Bezugsgrößen entwickelt und in ihrer Reichweite begrenzt. Das ist fachlich passend für den K8-Teilauftrag.',
   'sourceRemainderOpenDe': 'Kein Abschluss aller Informationskontexte oder der ganzen Kommunikationskompetenz. Eine strukturierte Modellantwort ist weder Recherchevollzug noch Anwendungserfolg.',
   'profileLocators': ['/expectations/1', '/expectations/2', '/applicationCaseBriefs/0', '/applicationCaseBriefs/1']},
 'K9': {
   'contributionDe': 'Elementare chemische Symbol-/Formelschreibweise als begrenzter Teil korrekter Fachkommunikation.',
   'currentEvidenceDe': 'e7 unterscheidet Elementsymbol, Molekülformel, Index und Koeffizient. Eigene Formelbildung NH3 aus einem Teilchenbild sowie der frische Vergleich 2 CO gegenüber CO2 verlangen korrekte Stoff- und Atomzahlbezüge, keine bloße Wiederholung eines Etiketts.',
   'scientificReasonDe': 'K9 nennt Formeln nicht selbst ausdrücklich. Der vollständig gelesene Abschnitt 2.2.3, Seite12, verankert chemische Formeln und Reaktionsgleichungen jedoch ausdrücklich unter den zu erlernenden fachtypischen Repräsentationsformen. In diesem Kapitelkontext ist der elementare Notationsanteil eine sachlich begründete partielle Beziehung; eine wortgleiche oder ganze K9-Deckung wird daraus nicht gemacht.',
   'sourceRemainderOpenDe': 'Keine gesamte Fachsprache, kein umfassendes Fachvokabular, keine ganzen Reaktionsgleichungen und keine volle Oberstufen-Repräsentationskompetenz. SekI-Tag und GLOBAL-Phase des kanonischen Grundlagenziels werden durch diesen SekII-Teilbeleg nicht umgedeutet.',
   'profileLocators': ['/expectations/0', '/applicationCaseBriefs/0', '/applicationCaseBriefs/1']},
 'K10': {
   'contributionDe': 'Eigene fachlich gestützte Argumente entwickeln, begründen und kriterienbezogen verbinden.',
   'currentEvidenceDe': '431 bildet eigene Pro-/Kontra-Argumente zu Wasserbehandlung und Verpackung, vergleicht ein pauschales Gegenargument und begründet Gewichtungen mit Entfernung, Energie, Rückstand und Nutzungsbedingungen. Der 18-kWh-Transfer muss das eigene Energieargument neu entwickeln und Kosten-/Rückstandsgrenzen erhalten.',
   'scientificReasonDe': 'Die verlangte Leistung argumentiert aus chemisch relevanten Belegen schlüssig und überprüft die Reichweite. Ein bloßer Vergleich fertiger Pro-/Kontra-Listen würde das aktuelle Profil und diesen Teil von K10 nicht erfüllen.',
   'sourceRemainderOpenDe': 'Die fallgebundene Argumentation ersetzt nicht jede chemische Erklärung, alle abstrakteren LK-Darstellungen oder einen vollständigen K10-Abschluss. Keine tatsächliche Lernendenausführung ist belegt.',
   'profileLocators': ['/expectations/0', '/expectations/1', '/expectations/2', '/applicationCaseBriefs/0', '/applicationCaseBriefs/1']},
 'K12': {
   'contributionDe': 'Verwendete Quellen und ihre Urheber/Fundstellen nachvollziehbar kenntlich machen.',
   'currentEvidenceDe': '5b1 verlangt S1/S3/S4 bzw. T1/T2/T3/T4 getrennt als Herkunft der Aussagen und zusätzlich auf der Rechercheroute Urheber/Titel, genaue URL, Datum/Abruf und konkrete Fundstelle. Eigene Paraphrase und originale Lehrmodellzahlen bleiben unterscheidbar.',
   'scientificReasonDe': 'Die verlangten Quellenbelege und Zuordnungen tragen einen konkreten Teil des vollständigen K12-Standards. Eine Quelle nur zu nennen wäre schwächer als das tatsächlich verlangte präzise Quellenprodukt.',
   'sourceRemainderOpenDe': 'Die kritische Prüfung der Urheberschaft und das sichere Kennzeichnen tatsächlicher wörtlicher Zitate sind durch dieses Profil nicht insgesamt nachgewiesen. Diese expliziten K12-Teile bleiben offen; es geht nicht bloß um optionale Zitierformalia. Eigene Recherche oder Zitatgebrauch wird nicht aus einem Autorenbeispiel behauptet.',
   'profileLocators': ['/expectations/0', '/applicationCaseBriefs/0/taskDemandDe', '/applicationCaseBriefs/1/taskDemandDe']},
 'K13': {
   'contributionDe': 'Einen eigenen chemisch begründeten Standpunkt reflektieren und bei neuen Belegen konkret korrigieren.',
   'currentEvidenceDe': '431 fordert eigene Gewichtung, Vergleich mit pauschalen vorgegebenen Argumenten und die begründete Aktualisierung des eigenen Urteils, wenn G nun 18 statt 40 kWh benötigt. Beim Verpackungstransfer werden nicht addierbare Einheiten und fehlende gemeinsame Folgenindikatoren gegen ein vorschnelles Urteil gehalten.',
   'scientificReasonDe': 'Reflexion und gegebenenfalls Korrektur des eigenen Standpunkts sind ausdrückliche Bestandteile von K13. Die individuelle aktuelle Abwägung trägt diesen Subanteil fachlich.',
   'sourceRemainderOpenDe': 'K13 verlangt ausdrücklich konstruktiven Austausch MIT ANDEREN. Das individuelle Aufgabenprofil oder der Vergleich mit gelieferten Argumenten zeigt keine echte Gruppendiskussion, Antwort auf reale Gegenargumente oder sonstige Sozialinteraktion. Der vollständige interaktive Standard bleibt offen.',
   'profileLocators': ['/expectations/1', '/expectations/2', '/applicationCaseBriefs/0', '/applicationCaseBriefs/1']},
 'B3': {
   'contributionDe': 'Angemessenheit, Grenzen und Tragweite konkreter chemischer Informationen/Daten beurteilen.',
   'currentEvidenceDe': '4aa unterscheidet positive Farbreaktion von eindeutiger Stoffidentifikation, prüft Blind-/Positivkontrollen und fehlende Probenbedingungen. Die temperaturgleichen Leitfähigkeitskontrollen und die frische Saccharosematrix begrenzen Konzentrationsschlüsse; Streuung wird nicht als Gesamtunsicherheit ausgegeben.',
   'scientificReasonDe': 'Die aktuelle Zielbeschreibung und sämtliche P-Erwartungen verlangen ein eigenes begründetes Datenurteil und benennen genau die für B3 zentralen Angemessenheits-/Reichweitengrenzen.',
   'sourceRemainderOpenDe': 'Kein pauschaler Abschluss jeder chemischen Datenbewertung auf GK-/LK-Endniveau und keine erfolgreiche Methodendurchführung. Die zusätzlichen BW-EDTA-Kontexte des ganzen Goals werden nicht zu BB-/BE-Quellenpflichten.',
   'profileLocators': ['/expectations/0', '/expectations/1', '/expectations/2', '/applicationCaseBriefs/0', '/applicationCaseBriefs/1']},
 'B5': {
   'contributionDe': 'Chemisch relevante Bewertungskriterien entwickeln und Handlungsoptionen damit begründet gegeneinander abwägen.',
   'currentEvidenceDe': '431 entwickelt Kriterien und eigene belegte Argumente zu den gegebenen Wasserbehandlungs-/Verpackungsoptionen. Ein 90-%-Mindestziel kann F ausschließen; ohne dieses Ziel bleibt die Gewichtung begründungsbedürftig. Neue Energieangaben und tatsächliche Umlaufzahl verändern bestimmte Argumente, nicht beliebig alle Folgen.',
   'scientificReasonDe': 'Die konkrete kriteriengeleitete Abwägung gesellschafts-/alltagsbezogener Optionen entspricht einem klaren Teil von B5 und wird nicht auf unverbundene Faktenlisten reduziert.',
   'sourceRemainderOpenDe': 'Die Alternativen F/G bzw. E/M sind vorgegeben. Eigenständiges Entwickeln völlig neuer Handlungsoptionen, alle ethischen/gesellschaftlichen Perspektiven und die Umsetzung einer realen Entscheidung sind hier nicht vollständig nachgewiesen. Kein ganzer B5- oder Bewertungskompetenz-Abschluss.',
   'profileLocators': ['/expectations/0', '/expectations/1', '/expectations/2', '/applicationCaseBriefs/0', '/applicationCaseBriefs/1']}
}

records = []
for i, r in enumerate(matrix):
    sg, gid, j = r['sourceGoal'], r['targetGoalId'], r['jurisdiction']
    code = sg['metadata']['standardCode']
    assert code in SCIENCE and r['mapping']['matchType'] == 'partial'
    sp, sd = sources[j]
    mp, md = mappings[j]
    si = next(k for k, x in enumerate(sd['sourceGoals']) if x['id'] == sg['id'])
    mi = next(k for k, x in enumerate(md['mappings']) if x == r['mapping'])
    di = next(k for k, x in enumerate(md['decisions']) if x['sourceGoalId'] == sg['id'])
    pi = next(k for k, x in enumerate(sd['passages']) if x['id'] == sg['passageId'])
    gi, g, native = bygoal[gid]
    for loc in SCIENCE[code]['profileLocators']:
        v = g['wholeProfile']
        for part in loc.split('/')[1:]:
            v = v[int(part)] if isinstance(v, list) else v[part]
    records.append({
      'relationId': f'{j}::{sg["id"]}::{gid}', 'jurisdiction': j, 'sourceStandardCode': code,
      'decision': 'APPROVE', 'approvedMatchType': 'partial',
      'wholeSourceStandardWordedFaithfully': True,
      'scopeOfApproval': 'The explicitly bounded scientific partial relation only; no whole official-source fulfillment or normal activation.',
      'wholeSourceGoal': sg, 'proposedMapping': r['mapping'],
      'sourceBinding': {'candidateFile': sp, 'sourceGoalPointer': f'/sourceGoals/{si}', 'wholeSourceGoalHash': oh(sg),
                        'wholeRetainedPassagePointer': f'/passages/{pi}', 'wholeRetainedPassageHash': oh(sd['passages'][pi]),
                        'mappingFile': mp, 'mappingPointer': f'/mappings/{mi}', 'authorDecisionPointer': f'/decisions/{di}',
                        'authorMatrix': pin(matrixpath), 'matrixPointer': f'/{i}'},
      'wholeCurrentTarget': {'goalId': gid, 'title': g['wholeGoal']['title'], 'inputFile': pin(goalpath),
                             'wholeGoalPointer': f'/{gi}/wholeGoal', 'wholeProfilePointer': f'/{gi}/wholeProfile',
                             'wholeGoalHash': oh(g['wholeGoal']), 'wholeProfileHash': oh(g['wholeProfile']),
                             'actualNativeProfileFile': pin(ROOT / g['reviewPath']), 'actualNativeLine': g['line'],
                             'nativeProfileFingerprint': native['profileFingerprint']},
      'primaryReading': {'jurisdictionPDF': next(p for p in receipt['primaryDocuments'] if f'/{j[3:]}/' in p['path']),
                         'wholeStandardPage': sg['metadata']['officialPdfPage'], 'fullSectionPagesRead': [11, 12, 13, 14],
                         'stageAndCourseContextPage': 9, 'K9AdditionalChapterContextPage': 12 if code == 'K9' else None},
      **SCIENCE[code],
      'stageCourseJudgmentDe': f'Die neue {j}-Quellenrelation gehört zur SekII, Ende der Qualifikationsphase. Seite9 erklärt die Standards für GK und LK gemeinsam und behält Unterschiede in Umfang/Tiefe, Komplexität und Selbststeuerung. Der hier gebundene elementare Teilbeitrag deckt kein volles GK-/LK-Endniveau; kanonische SekI-/GLOBAL-Tags werden nicht automatisch zu SekII-Tags oder umgekehrt. Bestehende CrossStage-Platzierung ist keine zusätzliche amtliche Stage-Evidenz.',
      'wholeOfficialSourceCredit': False, 'sourceStandardFullyFulfilled': False,
      'actualLearnerExecutionCertified': False, 'actualGroupDiscussionCertified': False,
      'humanApproval': False, 'newDPAMVVote': False, 'normalActivationAuthorized': False,
    })

review = {
 'reviewId': OUT.name, 'reviewMode': 'informed_independent_primary_source_partial_binding_review',
 'reviewerId': '/root/chemie450_caption1_native_fresh_b',
 'reviewer': {'agent': 'OpenAI Codex', 'modelFamily': 'GPT-6', 'exactModelRevision': None,
              'disclosure': 'Exact serving model revision is not exposed; none is invented.'},
 'atUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'roleDe': 'Eigene informierte wissenschaftliche Quellenprüfung des Root-Autorenkandidaten; kein blinder Urreview und keine menschliche Freigabe.',
 'counts': {'relations': 26, 'sharedStandards': 13, 'uniqueCurrentGoalsProfiles': 6, 'goalCountryPairs': 12,
            'APPROVE': 26, 'HOLD': 0, 'REJECT': 0, 'partialRelations': 26, 'wholeSourceCredits': 0},
 'objectHashRule': 'sha256 of UTF-8 JSON with sort_keys=True, ensure_ascii=False, separators=(comma,colon), array order preserved; distinct from stock profileFingerprint.',
 'sourceScopeDe': 'Die beiden gepinnten amtlichen PDF-Dateien sind bytegleich. Die ganze gemeinsame Originalfassung, Abschnitte2.2.2–2.2.4 auf Seiten11–14, wurde frisch gelesen; zusätzlich Seite9 zur Stage-/Kursgrenze. Seiten12/13 wurden tatsächlich gerendert und mit view_image inspiziert. Es wird keine doppelte unabhängige Lesung eines identischen Plans behauptet.',
 'competenceVerbBoundaryDe': 'Seite9 unterscheidet die Verben der Kompetenzstandards ausdrücklich von Aufgabenoperatoren. Die vollständigen nummerierten Standards bleiben Kompetenzformulierungen; dieses Review erzeugt keine Prüfungsoperatoren.',
 'wholeCandidateFileApproval': False,
 'technicalMetadataRest': {
   'status': 'OPEN_STALE_METADATA_REQUIRES_TECHNICAL_SUCCESSOR',
   'candidateFields': ['/method/notes', '/pipelineStatus/steps/1/checks/0', '/pipelineStatus/steps/1/checks/1', '/pipelineStatus/steps/1/checks/4', '/pipelineStatus/steps/2/checks'],
   'findingDe': 'Die aktuell gepinnten Vollkandidaten behalten alte Texte zu nur203 Source-Zielen, nur Inhaltszellen, allen Standards als bloßem Passagekontext und 0/203 M3-Reviews. Diese Texte beschreiben nicht den aktuellen216-Zellen-Kandidaten und werden nicht als sachlich richtige aktuelle Diagnose freigegeben.',
   'requiredBoundaryDe': 'Ein technischer Nachfolger muss je Land 216 insgesamt = 203 alte Inhaltszellen + 13 ausgewählte vollständige Standards unterscheiden. Nicht ausgewählte Standards bleiben Kontext. Der frühere HE/BW-Medianvergleich betrifft nur die 203 Inhaltszellen, nicht vollständige Standardextraktion oder heutige Qualitätsfreigabe. M3-/Gesamtquellenerfüllung darf nicht aus 26 partiellen Beziehungen auf complete gesetzt werden.',
   'scientificScopeUnaffectedDe': 'Die 26 Einzelvoten betreffen genau die gepinnten SourceGoal-Objekte, Beziehungen und aktuellen C/P. Sie sind keine Blindfreigabe der übrigen Metadaten. Ein späterer Datei-Nachfolger ist nicht allein durch Namensähnlichkeit oder dieses Votum gebunden; exakte unveränderte 26 SourceGoals/Edges und ganze C/P sind separat nachzuweisen.'
 },
 'scopeLimits': ['No normal files or canonical/P bodies changed.', 'No compiler, build, schema/global run or D/P/A/M/V vote.',
                 'No whole official-source duty fulfillment, new stage/course relabeling, actual learner execution, actual discussion or human approval.',
                 'View-membership and syntax checks are separate technical work by Root; they are not substituted for scientific judgment.'],
 'inputPins': inputpins,
 'primaryPins': receipt['primaryDocuments'],
 'decisions': records,
}
assert len({r['relationId'] for r in records}) == 26
assert len({(r['jurisdiction'], r['wholeCurrentTarget']['goalId']) for r in records}) == 12
reviewpin = write('REVIEW.twenty-six-partial-source-relations.informed-independent-b.json', review)
checks = {'result': 'PASS', 'kind': 'Finite exact input/binding checks, not scientific proof or a global validator.',
          'allFourBeforeAndCandidatePinsMatch': True, 'allOldSourceGoalsMappingsAndDecisionsUnchanged': True,
          'newFullSourceStandards': 26, 'newPartialMappingEdges': 26, 'oldExactMappingsPerCountryStill100': True,
          'allSixWholeCurrentGoalsMatchCanonical': True, 'allSixWholePMatchActualNativeRows': True,
          'allTwentySixSourcesAndEdgesMatchAuthorMatrix': True,
          'allProfileEvidencePointersResolve': True, 'allSourcePassagePointersResolve': True,
          'sharedBBBEPrimaryBytesExact': True, 'compilerOrBuildExecuted': False,
          'wholeCandidateMetadataApproved': False,
          'stalePipelineAndMethodMetadataRemainOpen': True,
          'normalInputsStillMatch': all(pin(ROOT / p['path']) == p for p in normalpins.values()),
          'structure': structure, 'normalInputPins': list(normalpins.values())}
assert checks['normalInputsStillMatch']
checkpin = write('CHECK.finite-source-candidate-bindings.actual.json', checks)
ownreceipt = {
 'reviewerId': review['reviewerId'], 'reviewMode': review['reviewMode'], 'blindReviewClaim': False,
 'wholeSixCurrentGoalsAndProfilesActuallyRead': True, 'allTwentySixWholeMatrixRowsAndIndividualBoundariesActuallyRead': True,
 'currentPeerScientificResultsRead': False, 'exactModelRevisionKnown': False,
 'primaryActuallyRead': {'sharedPDF': receipt['primaryDocuments'], 'fullSectionsPages': [11, 12, 13, 14],
                        'additionalScopePage': 9, 'PDFTextReadVia': 'pdftotext -layout on actual pinned PDF',
                        'actualRenderedPagesViewedWithViewImage': [12, 13], 'BBBEDuplicateReadingClaim': False},
 'candidateReadingDe': 'Alle vier Kandidaten-Dateien vollständig als JSON geparst und gegen ihre Beforepins verglichen. Die 26 neuen ganzen SourceGoals, Mappingkanten und Autor-Decision-Records wurden gegen die ganz gelesene Matrix gebunden. Die übrigen203 alten Inhaltsziele je Land wurden unverändert geprüft, nicht neu fachlich reviewt.',
 'currentCPReadingDe': 'Alle sechs ganzen C-Objekte einschließlich deutscher/englischer Beschreibungen und Scope-Metadaten sowie alle ganzen P-Bodies mit sämtlichen Erwartungen, Variationsachsen und Aufgabenbriefen gelesen. Native Profile unverändert. Keine eigene neue P-Qualitätsentscheidung.',
 'scientificMethodDe': 'Jede Beziehung anhand vollständigem Originalstandard, Kapitelkontext, aktuellem Ziel-/P-Leistungsprodukt und offenem Quellenrest entschieden. Teilbeitrag und Ganzquellenpflicht getrennt. Hashes und Syntaxbefunde dienen nur der Identität.',
 'noNormalWrites': True, 'noCompilerBuildOrLargeRun': True, 'noDPAMVVote': True,
 'technicalMetadataReadingDe': 'Die ganzen unveränderten pipelineStatus- und method-Objekte beider aktuellen Kandidaten wurden gezielt nachgelesen. Ihre veralteten203-/Kontext-/0review-Texte sind als offener technischer Rest im eigenen Urteil ausdrücklich abgegrenzt.',
 'review': reviewpin, 'finiteCheck': checkpin,
 'primaryReadingArtifacts': [pin(p) for p in sorted(primary.iterdir()) if p.is_file()],
 'normalInputPins': list(normalpins.values()),
}
ownreceiptpin = write('RECEIPT.own-primary-reading-and-execution.actual.json', ownreceipt)
for p in OUT.rglob('*.json'):
    read(p)
print(json.dumps({'review': reviewpin, 'check': checkpin, 'receipt': ownreceiptpin, 'counts': review['counts']}, ensure_ascii=False))
