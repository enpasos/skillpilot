from pathlib import Path
from decimal import Decimal as D
import json, hashlib, datetime
import jsonschema

ROOT = Path('/home/enpasos/projects/skillpilot')
BASE = Path(__file__).resolve().parent
MATERIAL = BASE / 'whole-nine-coherent-E40-materials.DRAFT-terminal-goals.candidate.json'
WHOLE = json.loads(MATERIAL.read_text())
FROZEN = json.loads((BASE / 'actual-nine-DRAFT-whole-materials-after-authoring-before-numeric-and-native-checks.freeze.receipt.json').read_text())
for row in FROZEN['frozenWholeMaterialAndPerformanceFiles']:
    assert hashlib.sha256((ROOT / row['path']).read_bytes()).hexdigest() == row['sha256']

checks = []
def check(label, actual, expected):
    a, e = D(str(actual)), D(str(expected))
    assert a == e, (label, a, e)
    checks.append({'check': label, 'actualDecimalResult': str(a), 'expectedResult': str(e), 'pass': True})

check('single-carer percentage-point change', D(30)-20, 10)
check('dual-employed-carer percentage-point change', D(40)-25, 15)
check('late-care demand change', D(45)-20, 25)
check('care supply after programme A', D(25)+20, 45)
check('care gap without expansion', D(45)-25, 20)
check('care gap after actual usable expansion', D(45)-25-20, 0)
check('overall higher-qualification percentage-point change', D(55)-40, 15)
check('low-income baseline percent', D(4)/20*100, 20)
check('low-income final percent', D(7)/20*100, 35)
check('language-class gap', D(25)-20, 5)
check('online total rather than headline', D(36)+6, 42)
check('local premium with earlier access', D(44)-42, 2)
check('equal stated thirty-day frame', D('1.40')*30, 42)
check('per-unit efficiency improvement percent', (D(10)-8)/10*100, 20)
check('model production growth percent', (D(125)-100)/100*100, 25)
check('baseline total energy', D(100)*10, 1000)
check('efficiency scenario total energy', D(125)*8, 1000)
check('sufficiency scenario total energy', D(95)*10, 950)
check('total energy change in E', D(125)*8-D(100)*10, 0)
check('filter versus process initial difference', D(12000)-10000, 2000)
check('process versus filter annual comparison', D(500)+300, 800)
check('optional undiscounted simple offset, not required investment competency', D(2000)/800, '2.5')
check('cash remaining after debt service, plan', D(18000)-12000, 6000)
check('cash shortfall, stress', D(12000)-9000, 3000)
check('equity funding percentage rounded', (D(30)/90*100).quantize(D('.1')), '33.3')
check('debt funding percentage rounded', (D(60)/90*100).quantize(D('.1')), '66.7')
check('new equity percentage', D(45)/90*100, 50)
check('new debt percentage', D(45)/90*100, 50)
check('funding sum is the given balance total', D(30)+60, 90)
check('updated funding sum is the same total', D(45)+45, 90)
check('last profit correction', D(18)-12, 6)
check('sensor pilot downtime reduction', D(80)-56, 24)
check('sensor pilot downtime percentage', (D(80)-56)/80*100, 30)
check('current official manufacturing mean rounded', (D(7801230)/198362).quantize(D('.001')), '39.328')
check('current official trade mean rounded', (D(6017332)/538248).quantize(D('.001')), '11.179')

# Whole counteranswers are author-written fictional samples, not learners.
# Each score uses the actual six-point material step and the stated reason.
# They do not replace a later independent rubric/material review.
bad = [
    ('care-education-and-role-change',
     '1. Kleinere Familien sind schlechter und höhere Abschlüsse garantieren allen Erfolg. 2.45 neue Familien brauchen45 neue Plätze; A beweist Erfolg. 3. Gutscheine schaffen automatisch45 Plätze. 4. Geräte und Beratung sind dasselbe;30 Kinder haben sicher beide Probleme. 5. Mütter sind natürlicherweise für Betreuung zuständig; Abendanwesenheit beweist Fachkompetenz.',
     [0,0,0,0,0],
     ['Stereotyp und falscher Erfolgsschluss, keine korrekte Datenanalyse.','Kein korrekter Angebots-/Bedarfsbezug oder Bedingung.','Geldtransfer mit Kapazität verwechselt.','Leistungen verwechselt, Überschneidung erfunden.','Kein fachlicher Normwandel/Mechanismus, stereotype Eignungsbehauptung.'],
     '1. Höhere Abschlüsse steigen40auf55 und die Teilgruppe4auf7; daraus folgen sichere Stellen. 2. A erweitert Betreuung auf45; Personal ist nötig. 3. A ist besser, B bringt Geld, andere Zugänge interessieren nicht. 4. A hilft bei Betreuung, Geräte helfen beim Lernen; Ausgabe garantiert Erfolg. 5. Fachkriterien sind transparenter; jetzt werden automatisch alle Geschlechter gleich oft befördert.',
     [3,3,2,2,2],
     ['Teilweise richtige Bildungsentwicklung, jedoch keine Familienanalyse/institutionellen Folgen und falscher Erfolgsschluss.','Richtiger Teilmechanismus/Bedingung, aber Bedarf-/Wandelanalyse und Wirkungsgrenze unvollständig.','Ein Unterschied/bedingungsloser Rang, keine Kapazitäts-/Zielgenauigkeitsabwägung.','Bedarf grob erkannt, Komplementarität/Überschneidung/Ergebnisgrenze fehlen.','Eine Instrumenteigenschaft, aber kein Rollenwandel, zwei Kriterien oder notwendige Ergebnisdaten.']),
    ('environment-wealth-and-frameworks',
     '1. Betriebe haben Umsatzverluste bewiesen, Bewohner sind gefühlsgeleitet. 2. E senkt Gesamtenergie20%; E/S/K sind alle dasselbe und Gewinn beweist Nachhaltigkeit. 3. BIP und HDI sind gleiche Messgrößen; A liegt überall vorne. 4. F ist nach deutschem Recht verboten; höhere Investition beweist schlechteste Wirtschaftlichkeit.',
     [0,0,0,0],
     ['Sach-/Wert-/Prognosegrenzen falsch.','Hebel und Gesamtbezug falsch, soziale Dimension ignoriert.','Indikatoren und A/B-Befund falsch.','Modell/Recht verwechselt, F/P-Regeln und Wirkungen falsch.'],
     '1. Bewohner wollen Gesundheit, Betriebe geringe Kosten; man muss einen Kompromiss finden. 2. E ist effizient und K ein Kreislauf; Gesamtenergie sinkt20%. 3. A hat mehr BIP, B mehr HDI und weniger Emissionen; alle Bewohner B profitieren gleich. 4. F braucht weniger Geld und P spart laufend; P ist immer richtig.',
     [2,2,3,2],
     ['Interessen grob erkannt, Messbeleg/Prognose, Wertgewichtung und konkrete Lastenfrage fehlen.','Zwei richtige Hebel, Suffizienz/Totalprüfung und Dimensionen fehlen bzw.falsch.','Konkreter Indikatorvergleich teilweise richtig, Verteilungs-/Ergänzungsprüfung falsch.','Teilweise Kostenvergleich, öffentlicher Rahmen und bedingte Entscheidung/Prüfangaben fehlen.']),
    ('finance-liability-and-spreadsheet-accounts',
     '1. Beide Kapitalarten verlangen gleiche Rückzahlung und gleiche Stimmen. 2. GmbH bedeutet risikofreie Einlage und die Bürgschaft schützt Privatvermögen. 3.9.000 decken12.000, ein Kredit ist immer am besten. 4. Ich habe eine Grafik erstellt; Vermögen90, EK30 und Schulden60 sind drei gleichartige Anteile. Eine Datei gibt es nicht.',
     [0,0,0,0],
     ['Vertrag/Kapitalarten falsch.','Risiko und Bürgschaft falsch.','Liquidität falsch und keine kritische Variation.','Keine reale datenverknüpfte Grafik, Bezugsgröße falsch.'],
     '1.30.000 sind Eigenkapital und60.000 Kredit; E hat Stimmen, K Zins/Rückzahlung. 2. Bei Ausfall verliert die Bank Geld; die Gesellschafterin kann die Einlage verlieren. 3. Im Plan bleiben6.000; ohne Bürgschaft ist alles risikolos. 4. Umsatz steigt, Gewinn sinkt zuletzt; Kapitalanteile sind etwa33/67%. Ich habe keine Tabellenkalkulation verwendet.',
     [4,3,2,2],
     ['Kapitalarten/Rechte korrekt, Cash-/Gewinn-/Haftungsabgrenzung fehlt.','Zwei Verlustarten erkannt, Pflichten und persönliche Bürgschaft fehlen.','Plan richtig, Stress und Garantierisiko falsch/unvollständig.','Teilweise Datendeutung, aber keine zwei realen Grafiken/Änderungen; explizite Artefaktgrenze2.']),
    ('production-innovation-and-career-exploration',
     '1. Jede IT beseitigt physische Engpässe, beide Firmen fertigen gleich. 2.30% weniger Ausfall beweist30% mehr Absatz und ebenso viel Arbeitsplatzabbau. 3. BAuA beweist, dass KI jede Arbeit einfacher macht und alle hybrid arbeiten können. 4. Kreative Menschen müssen gründen; Zurückhaltende sind ungeeignet.',
     [0,1,0,0],
     ['Produktionsgestaltung/IT-Grenze falsch.','Nur korrekter isolierter30%-Befund, Wirkungskette und Grenzen falsch.','Keine Evidenz-/Falltrennung oder Tätigkeitsspezifik.','Stereotyp statt freiwilliger reflektierter Orientierung.'],
     '1. V hat Werkstätten, L eine Linie, Board zeigt Aufgaben. 2. Ausfall sinkt30%, Kunden könnten schneller beliefert werden; Absatz ist unbekannt. 3. Assistenz erleichtert Suche und Hybrid spart Pendeln; ich erkunde einen Beruf. 4. Ich mag Organisation; Gründung benötigt Finanzierung und Beschäftigung Zusammenarbeit.',
     [3,3,2,2],
     ['Teilweise richtige Form/IT, keine Arbeitsteilung/beiden Grenzen und problembezogenen Ansätze.','Befund und ein bedingter Weg, aber übergreifende Ketten/Zielkonflikte unvollständig.','Nur Chancen, Risiken/amtliche Abgrenzung und spezifischer eigener Schritt fehlen.','Ein Bezug/Anforderung, jedoch keine zwei eigenen Bezüge, entwickelbarer Bereich oder konkreter offener Schritt.']),
    ('actual-team-company-data-project',
     '1. Ich würde ein Projekt planen; es ist dadurch durchgeführt. 2. Ich würde ein Board installieren, damit ist Teamarbeit bewiesen. 3. Handel hat mehr Unternehmen, darum sind dort sichere Jobs für mich; ein Diagramm existiert nur in meiner Beschreibung. 4. Fachkürzel sind immer überzeugend und alle werden sich bewerben.',
     [0,0,0,0],
     ['Kein tatsächlicher Plan/Produkt/Ausführung/Evaluation.','Toolabsicht ist keine Rollen-/Abhängigkeitsanwendung.','Keine Datei/korrekte Verhältnis-/Abgrenzungsanalyse, individuelle Chancen falsch.','Kein kriterienspezifischer Whole-Präsentationsread.'],
     '1. Frage ist die Berufserkundung; ich plane Datenprüfung, Grafik und Bericht. Ich habe sie nicht durchgeführt. 2. Rollen Daten/Grafik/Redaktion und Vertretung bei Ausfall stehen im Plan, eine Abstimmung/Umsetzung fehlt. 3. Mehr Handelsfirmen, mehr Beschäftigung in der Industrie; ich habe etwa39,328und11,179 berechnet, aber kein Spreadsheet. 4. Tabelle braucht Jahr/Quelle und Fachkürzel Erklärung; damit bewerben sich sicher alle.',
     [2,2,2,3],
     ['Nur Plan, ausdrückliche Ausführungs-/Artefaktgrenze2.','Nur Plan, keine echte Abstimmung/Rollenausführung, Grenze2.','Teilweise korrekte Fakten/Rechnung, keine Grafiken und Abgrenzung/Schluss; Grenze2.','Zwei Teilverbesserungen, aber ganze Zielgruppe/Belege und Wirkungsgrenze fehlen bzw.falsch.']),
    ('youth-public-law',
     '1. A begeht eine Straftat und erhält sicher500EUR Geldstrafe; C bezahlt automatisch den Eigentümer. 2. Jedes Mitnehmen ist Diebstahl, Erlaubnis/Vorsatz sind unwichtig und Fahrlässigkeit ist immer303. 3. Jugendliche bekommen automatisch Haft, Opfer müssen am Ausgleich teilnehmen. 4. Neue Technik beweist, dass Altersgrenzen aufgehoben werden müssen.',
     [0,0,0,0],
     ['Falsche Kategorien/erfundene Sanktion, keine Trennung.','Keine zutreffende Subsumtion oder Variante.','Erziehungs-/Zumutbarkeits-/Rechtsgrenzen falsch.','Keine Funktionen/Gerechtigkeit/prüfbare Regelidee.'],
     '1. A ist eine Ordnungswidrigkeit, C vorsätzliche Sachbeschädigung; Höhe und Ersatz bleiben zu prüfen. 2. B nimmt ein fremdes Fahrrad und ist15; dauerhafte Absicht besteht, Erlaubnis ändert nichts. C2 ist trotzdem vorsätzlich. 3. Training kann Konfliktbewältigung fördern; Haft ist bei Wiederholung immer nötig. 4. Regeln schützen Sicherheit und Jugendliche benötigen Erziehung; neue Geräte sind problematisch.',
     [4,2,2,2],
     ['Kategorien/Trennung teilweise korrekt, Norm-/Reife-/Erziehungsbezug lückenhaft.','Teilmerkmale, aber strukturierte Wegnahme/Reife und beide Varianten falsch.','Ein Lernmechanismus, Opfer/Zumutbarkeit/Kategorien und bedingtes Urteil fehlen.','Einzelne Funktionen, keine differenzierte Gerechtigkeit/Wandel-/Kontrollfrage.']),
    ('participation-migration-and-networks',
     '1. Alle Zugezogenen haben gleiche Wünsche, Jo repräsentiert alle Einheimischen. 2. Politische Positionen sind unveränderlich von Familie geerbt. 3. Neue Einwohner verursachen ausschließlich Probleme; die Zahlen sind65 zusätzliche Probleme. 4. Integration bedeutet gleiche Kultur für alle. 5.500 Kontakte beweisen garantierte Ausbildungsstellen.',
     [0,0,0,0,0],
     ['Keine individuelle Perspektivenprüfung, pauschale Gruppenannahme.','Aktive Sozialisation und andere Instanzen ignoriert.','Keine Kriterien/Chancen, unbekannte Überschneidung addiert.','Wechselseitigkeit/Zugang falsch.','Kontaktzahl mit Ressource/Erfolg verwechselt.'],
     '1. Nuri braucht Beratung, Jo Radwege, Mila Musik; alle wollen teilhaben. 2. Familie und Schule beeinflussen Jo, Jo diskutiert. 3. Wohnungen fehlen und freie Stellen sind eine Chance; Beratung ist immer beste Lösung. 4. Neue und alte Bewohner gestalten gemeinsam Veranstaltungen. 5. Das geschlossene Netzwerk hilft und die Liste hat viele Kontakte; Öffnung löst jede Zugangshürde.',
     [3,2,3,2,2],
     ['Stimmen/Gemeinsamkeit erkannt, Unterschiede/Handlungsbedingungen/Verallgemeinerungsgrenze fehlen.','Zwei Einflüsse/aktive Rolle teilweise, keine drei Mechanismen/Forumwirkung.','Chance/Herausforderung erkannt, Kriterien/bedingte Priorität und Prüfbedarf fehlen.','Wechselseitiger Impuls erkannt, Mitgestaltung versus Anwesenheit/Zugang fehlt.','Teilressource erkannt, Ausschluss/Kontaktgrenze und Bedingungen fehlen.']),
    ('online-consumption-bias-and-ethics',
     '1. Online kostet nur36 und Sterne beweisen Qualität. 2. Jede Voreinstellung beweist unbewussten Kauf, Vergleichspreis ist tatsächlicher Rabatt. 3.1,40proTag ist billiger als42für30Tage; alle Varianten sind Anchoring. 4. Jede vorhandene Abwahl ist fair und Klimaziele erlauben jede Manipulation.',
     [0,0,0,0],
     ['Gesamtkosten/Information falsch.','Mechanismen mit bewiesenem Verhalten/Preisnachweis verwechselt.','Äquivalenz und Klassifikation falsch.','Keine informierte Entscheidungs-/Transparenzprüfung.'],
     '1. Online kostet42und örtlich44, ich kaufe örtlich für morgen; Sterne werden geprüft. 2. Standard kann Entscheidung beeinflussen,90kann Anker sein. 3. A/B Statusquo,C/DFraming,E/FAnker; ich vergleiche zwei verschiedene Produkte. 4. Shop will Gewinn, Kommune Klimaschutz; leichte Abwahl ist wichtig, Erfolg ist garantiert.',
     [4,2,3,2],
     ['Kosten/Bedarf korrekt, Informationsprüfung/zweites Angebot/konkrete Schritte begrenzt.','Zwei Stichwortmechanismen, keine Gleichheits-/Hypothesengrenze.','Klassifikation korrekt, Äquivalenzrechnung und kontrollierter Vergleich fehlen/falsch.','Zwei Interessen/Teiltransparenz erkannt, Grenze/Bedürfnisse/prüfbare Evaluation fehlen.']),
    ('competition-platform-and-market-failure',
     '1. Werbung schafft Reparierbarkeit und3EURMehrkosten beweisen Erfolg. 2. Jede Fusion senkt Preis5EUR und ist wegen Größe verboten. 3. Werbung beseitigt Schnittstellenbarrieren, Veräußerung an A selbst schafft Konkurrenz. 4. Gleiche Preise beweisen Kartell. 5. Warnsignal ist rivalisierend und jeder Informationsunterschied ineffizient. 6. Mehr Nutzer bedeuten sicheren Wettbewerb; Gebühren sind kostenlos.',
     [0,0,0,0,0,0],
     ['Leistung/Nachfrage/Kosten falsch.','Effizienzweitergabe/Unzulässigkeit falsch.','Problem-/Instrumentmechanismen falsch.','Absprachebeweis/Strukturprüfung falsch.','Drei Mechanismen nicht zutreffend.','Netzwerk/Gebühren/Bindung falsch.'],
     '1. Ersatzteile verbessern Reparatur, Werbung kommuniziert und kostet weniger. 2. Gemeinsame Geräte können sparen, kleinere Anbieter bleiben, Preis sinkt garantiert. 3. Untersagung erhält Anbieter; Werbung hilft kleinen Werkstätten. 4. Kartell ist Absprache, Fusion Zusammenschluss; beide immer verboten. 5. Käufer wissen weniger; Warnsignal kann alle erreichen; Monopol hat Marktmacht. 6. Plattform verbessert Reichweite und verlangt10%, Bewertungen halten Nutzer dort.',
     [3,2,2,2,3,3],
     ['Teilweise tatsächliche Reaktion/Kosten, keine bedingte Absatz-/Nachfrageprüfung.','Effizienz/Alternativen teilweise, Risiken/Weitergabegrenze fehlen/falsch.','Ein Instrument teilweise, Zugangssperre/Unabhängigkeit und Bedingungen nicht geprüft.','Begriffe richtig, konkrete Rechtfertigungen/Grenzen falsch.','Je Form Etikett/Teilmerkmal1, keine vollständigen Wirkungsmechanismen.','Mehrere Merkmale, aber keine Kundendaten-/Netzwerk-/Urteilskriterienauswertung.']),
]

counterrows = []
key_to_goal = {}
mapping = json.loads((BASE / 'actual-nine-materials-forty-current-performance-contracts-minimal-requires-and-course.author-mapping.json').read_text())
for row in mapping['actualPerformanceAndMaterialMappings']:
    key_to_goal[row['key']] = next(g for g in WHOLE if g['id'] == row['examGoalId'])
for key, answer_a, scores_a, reasons_a, answer_b, scores_b, reasons_b in bad:
    g = key_to_goal[key]
    for index, answer, scores, reasons in [(1, answer_a, scores_a, reasons_a), (2, answer_b, scores_b, reasons_b)]:
        assert len(scores) == len(g['examData']['scoring']['steps']) == len(reasons)
        assert all(0 <= x <= 6 for x in scores)
        total = sum(scores)
        assert total < g['examData']['scoring']['passingPoints']
        counterrows.append({'examGoalId': g['id'], 'caseId': key + '-author-synthetic-counteranswer-' + str(index), 'wholeSyntheticAnswerDe': answer, 'authorCreatedNotActualLearner': True, 'actualOwnPerStepScores': [{'stepId': s['id'], 'maxPoints': s['points'], 'awardedPoints': n, 'actualOwnRubricReason': r} for s,n,r in zip(g['examData']['scoring']['steps'], scores, reasons)], 'actualOwnTotal': total, 'passingPoints': g['examData']['scoring']['passingPoints'], 'belowPassing': True, 'independentEvaluation': False})
assert len(counterrows) == 18

schema_path = ROOT / 'docs/landscape-runtime.schema.json'
schema = json.loads(schema_path.read_text())
jsonschema.Draft202012Validator.check_schema(schema)
validator = jsonschema.Draft202012Validator({'$schema': schema['$schema'], '$defs': schema['$defs'], '$ref': '#/$defs/goal'})
schema_rows = []
for g in WHOLE:
    errors = list(validator.iter_errors(g))
    assert not errors, [str(e) for e in errors]
    assert g['requires'] == g['examData']['coveredGoalIds']
    assert sum(s['points'] for s in g['examData']['scoring']['steps']) == g['examData']['scoring']['maxPoints']
    schema_rows.append({'goalId': g['id'], 'actualOriginalGoalSchemaErrors': [], 'directRequiresEqualsActualCoveredGoalIds': True, 'actualScoringSum': sum(s['points'] for s in g['examData']['scoring']['steps']), 'wholeBodyRemainsDraft': g['examData']['reviewStatus'] == 'draft'})

for row in FROZEN['frozenWholeMaterialAndPerformanceFiles']:
    assert hashlib.sha256((ROOT / row['path']).read_bytes()).hexdigest() == row['sha256']
out = BASE / 'actual-own-thirtyfive-Decimal-eighteen-synthetic-counteranswers-and-original-schema.author-QS.receipt.json'
assert not out.exists()
out.write_text(json.dumps({'schemaVersion': 1, 'createdAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'wholeNineMaterialSHA256': hashlib.sha256(MATERIAL.read_bytes()).hexdigest(), 'actualOwnDecimalChecks': checks, 'actualOwnWholeCounteranswersWithRubricScores': counterrows, 'actualOriginalGoalSchemaSHA256': hashlib.sha256(schema_path.read_bytes()).hexdigest(), 'actualOriginalGoalSchemaChecks': schema_rows, 'all11FrozenWholeMaterialAndPerformanceFilesExactBeforeAndAfter': True, 'authorQSOnlyNotIndependentMaterialApproval': True, 'allNineStatusesDraft': True, 'humanReview': 'pending', 'newDOrVOrWholeCourseOrSourceApproval': False, 'newStrictClosures': 0, 'liveWrites': []}, ensure_ascii=False, indent=2) + '\n')
json.loads(out.read_text())
print(json.dumps({'actualDecimalChecks': len(checks), 'actualFullSyntheticCounteranswers': len(counterrows), 'actualBelowPassing': sum(r['belowPassing'] for r in counterrows), 'actualOriginalGoalSchemasPass': len(schema_rows), 'wholeMaterialSHA256': hashlib.sha256(MATERIAL.read_bytes()).hexdigest(), 'receiptSHA256': hashlib.sha256(out.read_bytes()).hexdigest()}))
