from pathlib import Path
from decimal import Decimal as D
import hashlib, json, sys, zipfile, xml.etree.ElementTree as ET

R=Path('/home/enpasos/projects/skillpilot')
Q=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10'
A=Q/'wirtschaft-M4-thirteen-business-production-marketing-whole-material-author-a-v1'
O=Q/'wirtschaft-M4-five-business-whole-science-independent-root-v1'
O.mkdir(exist_ok=False)
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p): return {'path':str(p.relative_to(R)),'sha256':sha(p)}
def dump(n,j):
 p=O/n; assert not p.exists(); p.write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n'); return bind(p)
body=A/'whole-five-coherent-DEEN-thirteen-current-goal-materials.DRAFT-author-candidates.json'
assert sha(body)=='4a0b9f464b2394ca526f9ed33ce21309c01bab8526f1ca134cbc82b174c89c19'
materials=json.loads(body.read_text())
can=R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
by={g['id']:g for g in json.loads(can.read_text())['goals']}
ids=set(i for g in materials for i in g['requires']);assert len(ids)==13
book=R/'app/scripts/config/goal-books/de-gym-economics-current-canonical.json'
config=json.loads(book.read_text());pp=[R/p for p in config['evidenceReviewPaths']]
profiles={x['goalId']:x for p in pp for line in p.read_text().splitlines() if line.strip() for x in [json.loads(line)] if x['goalId'] in ids}
assert set(profiles)==ids
assert all(p['status']=='needs_human_review' and p['authority']=='ai_candidate' for p in profiles.values())
assert sum(len(p['profile']['applicationCaseBriefs'])for p in profiles.values())==27
contracts=dump('whole-thirteen-current-DEEN-goals-and-original-P27-cases.independent-read-freeze.json',{'contracts':[by[i]for i in sorted(ids)],'positiveRecords':[profiles[i]for i in sorted(ids)]})
guards=[bind(can),bind(book),bind(body)]+[bind(p)for p in pp]

# Actual independent calculations, evaluated with Decimal rather than copied
# from the author's alleged proof or detected as words in a task body.
calc=[]
def check(label,actual,expected):
 expected=D(str(expected));assert actual==expected,(label,actual,expected);calc.append({'calculation':label,'actual':str(actual),'expected':str(expected),'passed':True})
check('Snack before:100*(3-1.50)',D(100)*(D(3)-D('1.50')),150)
check('Snack after:200*(2-1.50)-80',D(200)*(D(2)-D('1.50'))-D(80),20)
check('Bike basic contribution',D(120)-D(70)-D(10),40)
check('Bike basic result',D(100)*(D(120)-D(80))-D(4000),0)
check('Bike discounted price',D(120)*(D(1)-D('.10')),108)
check('Bike discounted result',D(100)*(D(108)-D(80))-D(4000),-1200)
check('Bike direct additional-cost contribution',D(120)-D(80)-D(8),32)
check('Bike indirect additional-cost contribution',D(120)-D(80)-D(25),15)
check('Bike 120 early payment2%',D(120)*(D(1)-D('.02')),'117.60')
check('Bike128 contribution does not guarantee quantity',D(128)-D(80),48)
check('Box single-day result',D(30)*(D(13)-D(9))-D(100),20)
check('Box two-unit bundle',D(24)-D(18),6)
check('Box extra dealer contribution',D(13)-D(9)-D(3),1)
check('Website before conversion',D(10)/D(100)*D(100),10)
check('Website after conversion',D(15)/D(200)*D(100),'7.5')
check('Advertising difference in changes',(D(30)-D(20))-(D(25)-D(20)),5)
check('Own pen-price2.5 contribution',D('2.5')-D(1),'1.5')
check('Own pen actual communication25 within40',D(12)+D(13),25)
check('Own kit-price8.5 contribution',D('8.5')-D(5),'3.5')
check('Two safe repair teams capacity',D(2)*D(180)/D(30),12)
check('Own repair-price10 initial result',D(8)*D(10)-D(8)*D(3)-D(20),36)
check('Own repair-price10 maximum result',D(12)*D(10)-D(12)*D(3)-D(20),64)
check('Late kits',D(18)/D(3),6)
check('Available checked kits nextblock',D(20)-D(6),14)
check('Own rental-price20 variable4 fixed30 eightorders',D(8)*(D(20)-D(4))-D(30),98)
check('Manufacturing jobs/enterprise rounded2',(D(7801230)/D(198362)).quantize(D('.01')),'39.33')
check('Trade jobs/enterprise rounded2',(D(6017332)/D(538248)).quantize(D('.01')),'11.18')
check('Craft manufacturing roundedinputs share one decimal',(D(86)/D(210)*D(100)).quantize(D('.1')),'41.0')
check('Craft construction roundedinputs share one decimal',(D(253)/D(388)*D(100)).quantize(D('.1')),'65.2')
check('FinanceA equity plusbank',D(20000)+D(40000),60000)
check('FinanceA interest',D(40000)*D('.04'),1600)
check('FinanceA cash debt service',D(1600)+D(8000),9600)
check('FinanceA remaining principal',D(40000)-D(8000),32000)
check('FinanceA uncovered atclosure',D(32000)-D(15000),17000)
check('FinanceB equity plusbank',D(30000)+D(60000),90000)
check('FinanceB interest',D(60000)*D('.05'),3000)
check('FinanceB cash debt service',D(3000)+D(10000),13000)
check('FinanceB remaining principal',D(60000)-D(10000),50000)
check('FinanceB company uncovered',D(50000)-D(20000),30000)
check('FinanceB guarantee bounded',min(D(18000),D(30000)),18000)
check('FinanceB after full guarantee',D(30000)-D(18000),12000)
dump('actual-fortyone-independent-Decimal-calculations.json',{'checks':calc,'count':len(calc),'actualExecution':True})

# Actual spreadsheet work: visible formulas, cached independently computed
# values, and three actual chart objects with separate units/series/axes.
sys.path.insert(0,'/tmp/economics-business-independent-root-xlsxwriter')
import xlsxwriter
xlsx=O/'own-actual-2024-two-source-spreadsheet-three-charts.xlsx'
wb=xlsxwriter.Workbook(xlsx)
percent=wb.add_format({'num_format':'0.0%'});decimal=wb.add_format({'num_format':'0.00'})
ws=wb.add_worksheet('Statistische Unternehmen2024');ws.set_column('A:A',28);ws.set_column('B:D',25)
ws.write_row(0,0,['Branche','Statistische Unternehmen','Beschäftigungsverhältnisse','Je Unternehmen'])
data=[['Verarbeitendes Gewerbe',198362,7801230],['Handel einschließlich Kfz',538248,6017332]]
for i,row in enumerate(data,1):
 ws.write_row(i,0,row);ws.write_formula(i,3,f'=C{i+1}/B{i+1}',decimal,float(D(row[2])/D(row[1])))
source=json.loads((Path(Path('/tmp/economics-business-primary-independent-root-path.txt').read_text().strip())/'actual-independent-primary-reads.json').read_text())
ws.write(4,0,'Berichtsjahr2024; Stand03.08.2026; Beschäftigung im Jahresdurchschnitt, Mehrfachjobs zählen mehrfach')
ws.write_url(5,0,source[0]['url'])
for col,title,y,pos in [(1,'Unternehmen2024','Anzahl statistischer Unternehmen','F2'),(2,'Abhängige Beschäftigung2024','Beschäftigungsverhältnisse im Jahresdurchschnitt','F18')]:
 ch=wb.add_chart({'type':'column'});ch.add_series({'name':['Statistische Unternehmen2024',0,col],'categories':['Statistische Unternehmen2024',1,0,2,0],'values':['Statistische Unternehmen2024',1,col,2,col]});ch.set_title({'name':title});ch.set_x_axis({'name':'Wirtschaftsabschnitt'});ch.set_y_axis({'name':y,'min':0});ch.set_legend({'none':True});ws.insert_chart(pos,ch)
cs=wb.add_worksheet('Rechtliche Einheiten2024');cs.set_column('A:A',28);cs.set_column('B:D',23);cs.write_row(0,0,['Branche','Gesamt inTausend','Handwerk inTausend','Unternehmensanteil'])
for i,row in enumerate([['Verarbeitendes Gewerbe',210,86],['Baugewerbe',388,253]],1):
 cs.write_row(i,0,row);cs.write_formula(i,3,f'=C{i+1}/B{i+1}',percent,float(D(row[2])/D(row[1])))
cs.write(4,0,'Rechtliche Einheiten2024; Stand23.04.2026; gerundete Tausend, amtliche ungerundete Anteile40,9% und65,2%');cs.write_url(5,0,source[1]['url'])
ch=wb.add_chart({'type':'column'});ch.add_series({'name':['Rechtliche Einheiten2024',0,3],'categories':['Rechtliche Einheiten2024',1,0,2,0],'values':['Rechtliche Einheiten2024',1,3,2,3]});ch.set_title({'name':'Handwerksanteil an rechtlichen Einheiten2024'});ch.set_x_axis({'name':'Wirtschaftsabschnitt'});ch.set_y_axis({'name':'Unternehmensanteil','min':0,'max':1,'num_format':'0%'});ch.set_legend({'none':True});cs.insert_chart('F2',ch);wb.close()
ns={'m':'http://schemas.openxmlformats.org/spreadsheetml/2006/main','c':'http://schemas.openxmlformats.org/drawingml/2006/chart'}
with zipfile.ZipFile(xlsx)as z:
 chartNames=sorted(n for n in z.namelist()if n.startswith('xl/charts/chart')and n.endswith('.xml'));assert len(chartNames)==3
 charts=[ET.fromstring(z.read(n))for n in chartNames]
 assert all(len(x.findall('.//c:ser',ns))==1 for x in charts)
 sheets=[ET.fromstring(z.read(f'xl/worksheets/sheet{i}.xml'))for i in [1,2]]
 formulaRows=[{'sheet':i+1,'cell':c.attrib['r'],'formula':c.find('m:f',ns).text,'cachedValue':c.find('m:v',ns).text}for i,s in enumerate(sheets)for c in s.findall('.//m:c',ns)if c.find('m:f',ns)is not None]
 assert [r['formula']for r in formulaRows]==['C2/B2','C3/B3','C2/B2','C3/B3']
 series=[{'chart':name,'seriesFormulas':[n.text for n in ch.findall('.//c:f',ns)]}for name,ch in zip(chartNames,charts)]
 assert all(len(r['seriesFormulas'])==3 for r in series)
dump('actual-independent-native-spreadsheet-formulas-three-charts.execution.json',{'file':bind(xlsx),'formulasAndExecutedCachedValues':formulaRows,'chartObjects':series,'actualSpreadsheetCreated':True,'chartObjectsActuallyPresent':3,'unitsSeparated':True,'formulaResultsIndependentlyDecimalChecked':True,'desktopRenderOrHumanAcceptanceClaimed':False})

# Independently written whole responses to all four tasks in each package.
# These differ from the author's solution and are manually assessed below.
full=[
[
'Am Stand schneidet die sichere Person, die zweite packt fertige Portionen und bedient; vereinbarte kleine Übergabestapel und die Ausgabereihenfolge koordinieren die gemeinsame Leistung. Bei hoher Nachfrage bleibt die eine Ausgabe ein Engpass. Beim Umzug packt die sorgfältige Person, die wegkundige übernimmt Transport; alle benutzen dieselbe Zielkennzeichnung und räumen den schmalen Flur für einen Transport frei. Mein gewählter fiktiver Ablauf ist eine Schulbücherausgabe: jemand sortiert nach Jahrgang, jemand prüft Listen, jemand gibt aus; gemeinsame Kontrolle und eindeutige Übergabe verhindern Doppelvergabe. Die Listenprüfung begrenzt weiterhin die Geschwindigkeit.',
'F: Geschäftsleitung über Einkauf, Produktion, Absatz und Verwaltung; unter den Funktionen liegen eindeutig zuständige Stellen mit einem Weisungsweg. P: Leitung über Tisch- und Stuhldivision mit ihren Einkaufs-, Produktions- und Absatzstellen sowie zentraler Verwaltung. Die Kundenänderung geht vom Absatz zur Produktion und zum Einkauf und zur benannten Genehmigung; ein Datum genehmigt nichts. Produktnähe kann Abstimmung helfen, doppelte Fachstellen kosten Kapazität. L: Team unter Funktionsleitung. M: dieselben Teamrollen haben Fachweg für Standards/Personal und Projektweg für Priorität/Termin; beide gehen im Konflikt zur gemeinsamen Leitung und dokumentieren den Beschluss. Stellen sind Rollen, Personen können mehrere Rollen tragen, Aufgaben sind Tätigkeiten; spezialisierte Funktionen brauchen Koordination, zentralisierte Freigabe kann ein Engpass sein.',
'Die Kernkette der Bäckerei führt vom Kundenauftrag über Zutatenbeschaffung und Backen zur Übergabe. Lohnabrechnung und Wartung ermöglichen sie, obwohl sie nicht das verkaufte Brot sind; ein ungeprüfter ausgefallener Ofen stoppt den Kernprozess. S verkauft Entwicklung und Wartung und hat damit dieselbe IT-Arbeit als Kernleistung. R verkauft Bewirtung, interne Software unterstützt deren Bestellablauf; ihr Ausfall kann auch einen notwendigen Ablauf blockieren. Kern oder Unterstützung folgt der Kundenleistung, nicht einer festen Tätigkeitsliste.',
'Sondertische: Einzel nach Kundenwunsch in Funktionswerkstätten, Lackierung begrenzt den Durchsatz. Getränke: verwandte Sorten auf einer Linie mit Reinigung und Etikettenwechsel; falsche Daten bleiben falsch. Maschinen: begrenzte gleichartige Bohrgerätefolge und dann tatsächlich geänderter Werkzeug-/Montageablauf für Schleifgeräte, also Serie. Schrauben: dauerhaft gleiche Standardware in Fließfolge, Masse. Die kundenspezifische Halle bleibt am Ort, Ressourcen kommen: Baustelle; Montage-/Prüfteams verantworten Abschnitte als Gruppe. Ihr Zulieferer kombiniert begrenzte Serien von200Trägern und80Treppen mit tatsächlichem Verfahrenswechsel. Menge/Produkttyp und räumliche/personelle Organisation sind verschiedene Dimensionen. Material und geprüfte Freigabe müssen vor Übergaben vorliegen. Boards helfen Information und Versionsabgleich, beseitigen weder Lackierung noch Sicherheit oder fehlende Ressourcen. Beim Netzausfall nur verantwortete datierte/versionierte lokale Freigabe prüfen, nachher abgleichen; fehlende oder unsichere Freigabe bedeutet warten.'
],
[
'Für die Flasche verbinden nahe Abholung und klare Reinigungsvorführung das Angebot mit tatsächlichem Schulbedarf; Werberufe allein beseitigen schlechte Erreichbarkeit nicht. Produktqualität, Preis, Kosten und Ausführung bleiben Bedingungen. Snack: vor150, nach200*0,5-80=20 Vergleichsbeitrag;200statt100 Verkäufe steigern hier nicht den Beitrag. Spätere Bindung wäre eine offene Beobachtung, keine gesicherte isolierte Werbewirkung.',
'R hat zwei Produktgruppen; dritte Stadtgröße vertieft, Kinderräder verbreitern. Herstellung70+Service10 ergeben80, Preis120 liefert40Stückbeitrag und bei100nach4000Fixkosten0. Zehnprozent-Rabatt gibt108,28Beitrag und−1200 bei gleicher Menge. Skonto117,60statt120 entlastet den früheren Zahlungseingang, senkt den erhaltenen Betrag; tatsächliche Nachfrage unklar. Direkt32Beitrag vorFix, dreiTage; Händler15, zweiTage und lokale Hilfe; schnellerer Zugang kann mehr Käufer erreichen, Kosten und Servicekapazität bleiben offen. K hat Mittag/Abend, vierMenüs; vegan vertieft, Frühstück verbreitert. Einzelbeitrag4,30Boxen nach100Fix=20; Zweierbundle6 jeBestellung, keine Vermischung mitEinzelmenge. Händler1Beitrag jeBox und Kühlkettenrisiko, Abholung für manche schlechter zugänglich; Bundle kann für kleine Haushalte ungeeignet sein. Werbezuwachs relativ zum Vergleich fünf nur bei vergleichbaren Gruppen. Website10%gegen7,5% trotz mehrKäufen; Preis undWerbung gleichzeitig liefern keine isolierte Wirkung. Differenzierte D-Marken können unter Präferenzen Spielraum für128haben; dreiAnbieter belegen keine Absprache. Homogene jederzeit110-Alternativen inH machen128 ohne weitereDifferenz begründungsbedürftig.48Stückbeitrag garantiert keineVerkäufe. A passt mit lokaler konkreterReparaturbuchung zumPendlerziel, B eherFreizeit; fünfTermine begrenzenVersprechen. QualifizierteBuchungen je200Budget und echteKäufe prüfen, keine Überlegenheit behaupten.',
'Mein Stiftkonzept: zuverlässige nachfüllbare Stifte fürBudgetschüler, nachvollziehbarer Einführungspreis2,50unter3, Bestellung undAbholung in denzweiPausen, Vorführung mit12EuroMaterial und13EuroAushangunter40.1,50Stückbeitrag deckt noch nicht alleKosten; Ziel sind tatsächlich erfüllteBestellungen undNutzung. Mein anderesKitkonzept: eigene große bebilderteAnleitung,8,50unter9, Vorführung/Abholung in derBeratungsstelle, gedruckteEinladungen für30stattDigitalpflicht.3,50Stückbeitrag istkeinGesamtgewinn. EtablierteWare bekommt nutzerbezogenenZugang stattJugendlaunchwerbung.',
'NachSchließung frageich diezweimalwöchentlicheBibliothek nach tatsächlicherVorführkapazität undvereinbare beschränkteAbholzeiten; gedruckteInfo undBestellannahme ändern sichmit, nichtnureineWebadresse. OhneZusage bleiben Lieferoptionenoffen. BeiStiften erfüllteBestellungen, tatsächlicheKäufe, Nachfüllgebrauch undBeitragnach25Kommunikation; beiKit realeAbholungen, verstandeneAnwendung undBeitragnach30Kommunikation prüfen. Zeitraum undgleichzeitigeÄnderungen ausweisen; Reichweite,Absicht undUmsatz allein sindkeinkausalerGewinnnachweis.'
],
[
'MeinReparaturprojekt bietet nur geübte sichereKleinreparaturen fürlokaleRadnutzer: Auftragklären/Sicherheitsumfangprüfen→Zeitreservieren→Material→Ausführen→Kontrollieren→Übergabe. Leihwerkzeugpartner, vierPersonen und100EuroStartmittel sindRessourcen; zweiTeams180/30 liefernmaximal12. MeinPreis10 ergibtbei8Aufträgen80Einnahme−24Material−20Tageskosten=36 imModell; bei12aus16Anfragen120−36−20=64, vierAnfragenweiterterminieren oderan geeignetenPartnerverweisen. Vorfinanzierung44beim8erTagistunter100; Nachfrage, Zeiten,Leistungsfähigkeit undweitereKosten bleibenzutesten. KeineungeübteArbeit fürMehrumsatz.',
'MeinVerleihmodell: Vereinreserviert→Setprüfen/ausgeben→Nutzen→Rücknehmen→Reinigen/prüfen→wiederausgeben, mitLager undgeprüftemReinigungspartner. Ichnehme20Preis jeBuchung,4variableReinigung und30Blockkosten an;8realeBuchungen geben160−32−30=98vorweiterenKosten. Eine rückzahlbare10Kaution istVerbindlichkeit/Sicherung, keinErlös. Sechsvon18kommenspät,12rechtzeitig plus2unverliehene=14brauchbareSets, alsohöchstens14imFolgeblockzusagen. Buchungspuffer, klarerRückgabetermin undgeprüftePartnerbeschaffung könnenhelfen; eineStrafgebühr ersetztkeinSet. Gewinn undRücklauf nichtgarantiert.',
'C: Eigentümer könnenProduktivität/Ertrag gewinnen, Arbeitnehmer verlieren einfacheAufgaben undbrauchentatsächlichzugänglicheQualifizierung/neueStellen. Kunden könntenverläßlicherebilligereLeistungen erhalten, aberPreise undStellen sindnichtzugesagt; Kommune hatlokaleArbeit/Versorgung imBlick. Übergangsplanmit überprüfbarerSchulung, tatsächlichenArbeitsplätzen undPreisbedingungen untersuchen. V: Eigentümer sparen10%anVerpackungseinkauf, nichtamgesamtenEndpreis; Kundenpreis unbekannt. AlterLieferantverliert, neuergewinntAufträge, betroffeneAbfallgruppen tragengeringereWiederverwertbarkeit. RealeGesamtkosten, Alternativen, Recycling undregionaleFolgenbelegen, dannbedingtentscheiden stattbilligodergrünautomatisch gut.',
'Reparatur: heutige10000könnennichteinmalausgeschüttetundganzfürSchulungausgegebenwerden, kurzfristigerAuszahlung/Liquiditätskonflikt. WirksameSchulung kannlangfristigQualität/Kundenvertrauen, sichereArbeitsleistungen undErtrag unterstützen; Liquidität undWirksamkeitprüfen. Software: schnellerLaunch fürUmsatzkonkurriertmitTestzeit/Ressourcen undverursachtmöglicherweiseÜberlastung; hinreichendverlässlicheFunktionen könnenKunden/Personalbindung undtragfähigesWachstumergänzen. Eigentümer,Kunden,Beschäftigte habenverschiedeneZeithorizonte; Fehlerraten, Testwirksamkeit, Kapazität undFinanzierung müssenbekanntwerden. Langfristsicht istbegründetesRisikomanagement, keineErfolgsgarantie.'
],
[
'Ichhabe diebeigefügte tatsächlicheXLSX erstellt. InStatistischeUnternehmen2024 stehenA2:C3die198362/7801230 und538248/6017332; D2=C2/B2 undD3=C3/B3 berechnen39,33 und11,18. ZweiwirklicheDiagramme mitgetrenntenZählmaßen zeigenmehrHandelsunternehmen, mehrBeschäftigungsverhältnisse imGewerbe, Nullstart undjeweiligeEinheit/Jahr/Quelle. Durchschnitt istkeintypischerBetrieb; mehrereJobs zählenmehrfach, keineeindeutigeKopfzahl. Ichwürde lokaleTätigkeiten/Qualifikationen inbeidenFeldern erkunden, stattmeineEinstellungswahrscheinlichkeit daraus abzuleiten.',
'DasandereBlattRechtlicheEinheiten2024 hat210/86und388/253 inTausend, C/BmitProzentformat. DasdrittewirklicheDiagramm zeigt40,95%und65,21%ausgerundetenInputs, aufeineStelle41,0%und65,2%. Amtliche40,9%beruhenaufungerundetenDaten; BauhatgrößerenUnternehmensanteil, nichtsofortmehrAnteilanBeschäftigung. RechtlicheEinheiten sindnichtohnePrüfungdieStatistikunternehmen vonA, auchnichtbeigleichem2024Jahr. KonkretesHandwerk, erforderlicheAusbildung undregionaleAusbildungsplätze prüfen, keineaggregierteChanceausrechnen.',
'Alsfreiwilliggewählten fiktivenSelbstbezug nenneichFreudeansorgfältigerpraktischerArbeit undKooperation. DaspasstzurAuftragsklärung undTeamarbeit inbeidenReparaturrollen, beweistkeineSicherheitsqualifikation. SelbstständigkeitbrauchtzusätzlichAkquise, Planung undFinanzierung; daswürdeichmitBerufsgesprächen zuAngestelltenarbeitundGründung erkunden undeinekleineKalkulationsübung entwickeln. Michunsicherzufühlen bedeutetkeinefesteNichteignung.',
'FürGestaltungwähleichfiktivInteresseanklarerKommunikation undsystematischemPlanen. KundenfristenundFachgestaltung brauchenbeideRollen; AgenturergänztAkquise,Kalkulation undKoordination. DasneueTeamorganisationsinteresse führtbeiAngestelltenarbeit zuErkundunggemeinsamerProjektrollen, beiAgentur zusätzlichzuRollenplanungmiteinerkleinenTeamübungundGespräch. KeineendgültigeBerufszuweisung; amtlicheBranchengrößen liefernkeinenpersönlichenKompetenz-/Ortsnachweis.'
],
[
'A:20000EigenkapitalohnefestenRückzahlungs/Zinsanspruch, EigentümerinentscheidetundträgtErtrags/Verlustrisiko;40000KreditgibtderBankForderungundZins, hierkeineStimmrechte.1600Jahreszinsplus8000Tilgungmacht9600Liquiditätsabfluss,32000Restschuld. TilgungvermindertSchuld undistnichtZinsaufwand.',
'NachVerwertung15000fehlen17000. AhaftetwegenvorgegebenerFormpersönlichüberEinlagehinaus; Eigenkapitalverlust undeigeneSchuldhaftungsindverschieden. ObPrivateigentumtatsächlich17000deckenkannistunbekannt; HerkunfteinesFinanzierungseuroslegtHaftungnichtfest.',
'B:30000InvestitionsanteilverleihtIvereinbarteDrittelStimmrechteundDritteltatsächlichausschüttbarenGewinn, keinenfestenRendite/Rückzahlungsanspruch. Bank60000hatForderung/Zins, nichtdieseEigentümerrechte.3000Zinsplus10000Tilgung=13000Dienst,50000Restschuld; BeteiligungverlustriskantundLiquiditätbelastet.',
'Nach20000Gesellschaftsverwertungbleiben30000Schuldungedeckt. DieGesellschaftschuldet, Ikann30000Einlageverlieren, trägtabernachFallkeinepersönlicheKredithaftung. Bhat eigeneBürgschaft trotzgrundsätzlicherGesellschafterbegrenzung: imgegebenenModellbis18000nachGesellschaftsausfall, nicht0oderautomatisch30000. Wennvollbezahltbleiben12000Bankrisiko; tatsächlicheEinbringlichkeitunbekannt. AFormhaftung undBzusätzlicheSicherheit getrenntvonEigenkapitalrisikoprüfen.'
]
]
partial=[
['Stand: sicheresSchneiden spezialisiert, Verpackerkooperiert, Übergabestapelkoordiniert;Ausgabeengpass. Umzug: Packen/Transportzuweisen, gemeinsameZielcodesundfreierFlur. EigeneBücherausgabe sortieren/listenprüfen/ausgeben, gemeinsameKontrolle;keinebehaupteteGeschwindigkeitsgarantie.', 'F LeitungüberFunktionen;PüberzweiProduktdivisionenmitjeFunktionen,zentraleVerwaltung. ÄnderungAbsatz→Produktion/Einkauf→Leitungfreigabe. LFunktionsweg, MFachStandards/ProjektZeitwegmitgemeinsamerKonfliktleitung. StelleistRolle,AufgabeTätigkeit;diePersonenzahlbleibtoffen,doppelteFunktionen könnenkosten.', 'B Auftrag/Zutaten/Backen/ÜbergabeKern,Wartung/LohnUnterstützung,ohneOfenkeinBacken. SverkauftITKern,RnutztITalsHilfe,nichtentbehrlich.', 'TischeEinzelWerkstatt,GetränkeSortenLinie,MaschinenSeriemitProdukt/Prozesswechsel,SchraubenMasseFluss,HalleortsfestesBaustellenprojektmitGruppenprüfungundZuliefererSerien. Boardkoordiniert,nichtphysisch;geprüftelokaleVersionbeimAusfall,nachherabgleichen. WeitereUnterschiededesEngpassesarbeiteichnichtaus.'],
['FlaschebrauchtZugangundNutzungsinfosnebenQualität/Kosten. Snack150→20Beitrag,möglicheNachfragekeinGewinnnachweis.', 'NeueGruppeBreite,neueGröße/MenüTiefe. R40Beitrag,Nullbei100;Rabatt108und−1200,direkt32/indirekt15,SkontosenktBetragzugunstenfrühererZahlung. K4Beitragund20nachFix,Bundle6,Kanäle/Kühlkettebeachten. Quote10→7,5%,Werbefünftnurbedingt. DUnterscheidungkannPreis128tragen,Hhomogen110nichtohneGrund;AkonkretesPendlerangebotmitfünfTerminenpasstbesser. KeineKausalgarantie,DetailvergleichderNebenwirkungennichtausgeführt.', 'Stift2,50unter3,verlässlichnachfüllbar,AbholungzweiPausenundVorführ/Aushang25unter40. Kit8,50unter9,großeAnleitungundlokaleAbholung/Print30fürältereNutzer;StückmargeistkeinGewinn.', 'Beratungsstellenschließt:BibliotheksvorführkapazitätvorZusagefragen,AbholfensterundPrintänderngemeinsam. FürbeideechteKäufeundBeiträgnachKostenprüfen;Vergleichszeitraumfehlt,ReichweitekeinGewinnnachweis.'],
['MeinReparaturtag: sichereKleinreparaturen mitAuftragprüfung→Reservierung→Material→Arbeit→Prüfung/Übergabe;Leihpartner,vierteams? korrektvierPersoneninZweiTeams. Max12,Preis10 und8Anfragen geben36,16Anfragenmax12geben64,Resterstspäter.Finanzbedarf44unter100;weitereKostenoffen.', 'MeinVerleihfürVereine: reservieren/ausgeben/nutzen/zurück/reinigen/prüfen,PartnerundLager20;Preis20,variable4fix30angenommen. KautionrückzahlbarnichtErlös.6spätlassen14Sets,keinErsatzdurchStrafgebühr,Termineanpassen;ichrechneGewinnhiernichtaus.', 'C Eigentümerchance/KundenzuganggegenBeschäftigungs/Kommunalrisiko;QualifizierungundPreisenichtgarantiert,Übergang/Stellenprüfen. VVerpackungskosten10%senkennichtEndpreis10%,beideLieferantenundAbfallgruppenberücksichtigen,Alternativen/Recyclingprüfen;Zusatzdatenoffen.', 'TraininggegenheutigeAuszahlung,bedingtspätereQualität/Vertrauen/ErtragbeiLiquiditätundWirksamkeit. SoftwareLaunchgegenTestzeit/Überlastung,verlässlicheLeistungkannKunden/Personalbindungstützen. UnterschiedlicheInteressen,Fehlerrisikooffen;ausführlicherFinanzvergleichfehlt.'],
['BeigefügteechteXLSXmitD2=C2/B2,D3=C3/B3undbeidenechtenEinzelmaßdiagrammen zeigtmehrHandelsunternehmen,mehrGewerbebeschäftigung;39,33/11,18sindMittel,keinBetrieb/Kopfzahl,Mehrfachjobs. IchfrageörtlicheQualifikationen;ausführlicheErkundungfehlt.', 'AnderesXLSXBlattmitwirklichemProzentdiagramm,86/210und253/388; ichrundeerstfälschlich40,9%ausgerundetenZahlen,65,2%richtig. Amtlicheungereundete40,9%istandererInput;rechtlicheEinheitennichtunbesehenmitAzusammenzählen. IchfragekonkreteHandwerksausbildung.', 'FreiwilligerfiktiverBezug: praktischesArbeiten/Team,beideReparaturrollenbrauchenAuftragsklärungundSicherheit,GründungzusätzlichFinanzplanung. Finanzierungentwickeln,beideBerufsgesprächeführen;diegenauePassungnochunsicher.', 'Gestaltungsinteresse/KundenkommunikationbetrifftbeideRollen,AgenturmehrAkquise/Finanzierung. NeuesOrganisationinteresseänderteinenTeamübungs/BerufsgesprächsschrittinbeidenRollen;AggregatbeweisteineindividuelleChance nicht.'],
['A EigenkapitalRisiko/EntscheidungohnefestenAnspruch,KreditBankforderungkeinStimmrecht;1600Zins+8000Tilgung=9600,Rest32000.TilgungnichtZins.', '17000nach15000Verwertung;AFormpersönlichhaftend,Einlageverlustanders;Privatvermögenoffen.', 'IhatDrittelvereinbarteMitwirkungundbedingtGewinn,keineGarantie;BankForderung.3000+10000=13000,Rest50000,weitereRisikenwenignäherausgeführt.', 'GesellschaftschuldetnachVerwertung30000,IkeinExtraKreditrisikohier,BEigenbürgschaftbis18000,jedenfallnichtnulloderallgemein30000;tatsächlicheZahlbarkeitoffen.Rest12000nenneichhiernicht.']
]
maxima=[[8,16,12,20],[12,24,12,12],[16,16,16,12],[10,10,10,10],[8,7,8,7]]
partialPoints=[[5,10,7,13],[7,15,8,7],[10,10,9,8],[6,6,6,7],[5,4,5,4]]
works=[]
def add(i,name,answers,points,cap=None,reasons=None):
 assert len(answers)==len(points)==4
 raw=sum(points);effective=min(raw,cap)if cap is not None else raw;threshold=materials[i]['examData']['scoring']['passingPoints']
 works.append({'materialGoalId':materials[i]['id'],'workId':name,'wholeTaskAnswers':[{'task':k+1,'answerDe':a,'manuallyAwardedPoints':p,'maximum':maxima[i][k],'manualReason':(reasons[k]if reasons else 'Fallbezogene Leistung nach dem tatsächlich gelesenen Lösungs-/Teilpunktraster; keine Wortsuche oder Autoren-Gegenarbeitsübernahme.')}for k,(a,p)in enumerate(zip(answers,points))],'rawPoints':raw,'actualCoreAbsenceCap':cap,'finalPoints':effective,'passingPoints':threshold,'passed':effective>=threshold,'actualManualReviewBy':'independent root, AI machine QS, not a human learner'})
for i in range(5):
 add(i,f'whole-independent-alternative-full-{i}',full[i],maxima[i]);add(i,f'whole-independent-fair-incomplete-pass-{i}',partial[i],partialPoints[i])
 assert works[-1]['passed']
missingGroups=[[[0],[1],[2],[3]],[[0],[1],[2,3]],[[0,1],[2],[3]],[[0,1],[2,3]],[[0,1,2,3]]]
for i,groups in enumerate(missingGroups):
 for gi,tasks in enumerate(groups):
  answers=full[i].copy();pts=maxima[i].copy()
  for k in tasks:answers[k]='Keine fallbezogene Antwort zu dieser Aufgabe.';pts[k]=0
  add(i,f'whole-independent-one-covered-goal-entirely-absent-{gi}',answers,pts,materials[i]['examData']['scoring']['passingPoints']-1)
  assert not works[-1]['passed']
wrong=[
(0,[2],['Alle IT ist immer Unterstützung; Unterstützung ist unwichtig, die Wartung kann ausfallen ohne die Bäckereileistung zu ändern.']),
(1,[2,3],['Mein Konzept lautet für beide Produkte: Onlinewerbung, ohne Produkt-/Preis-/Zugangsentscheidung.','Wenn die Stelle schließt mache ich mehr von derselben Onlinewerbung; Budget/Zugang spielen keine Rolle.']),
(2,[2],['Gewinn der Eigentümer ist allein richtig; Beschäftigte, Kundschaft, Lieferanten und Abfallgruppen sind keine relevanten Perspektiven, eine Qualifizierungsabsicht ersetzt alle verlorenen Stellen garantiert.']),
(3,[0,1],['Unternehmen plus Beschäftigung addieren zeigt Größe; kein tatsächlich erstelltes Diagramm, Aggregat beweist sicheren persönlichen Job.','Handwerksanteil bezieht sich auf Beschäftigte, alle Einheiten/Jahre identisch; wieder kein echtes Diagramm.']),
(4,[1,3],['Eigenkapital haftet stets nur mit Einlage, persönliche Formhaftung gibt es deshalb inA nicht.','Gesellschafterbegrenzung hebt jede eigeneBürgschaft auf, alsoBnull persönlich trotzunterschriebenem18TausendVertrag.'])]
for i,tasks,texts in wrong:
 answers=full[i].copy();pts=maxima[i].copy()
 for k,text in zip(tasks,texts):answers[k]=text;pts[k]=0
 add(i,f'whole-independent-actual-consistently-false-core-{i}',answers,pts,materials[i]['examData']['scoring']['passingPoints']-1);assert not works[-1]['passed']
assert len(works)==28
dump('whole-twentyeight-independent-full-counterworks-and112-manual-task-grades.json',{'works':works,'wholeWorkCount':len(works),'manualTaskGrades':112,'fullPasses':5,'meaningfulIncompletePasses':5,'missingCoveredGoalFailures':13,'actualFalseCoreFailures':5,'aiGeneratedCounterworksNotObservedLearners':True,'gradingDoesNotChangeLearnerState':True})
dump('actual-five-whole-materials-independent-science-findings.pending-one-word-successor.json',{
 'status':'SCIENTIFIC_CONTENT_KEEP_PENDING_ONE_EXACT_READABILITY_WORD_SUCCESSOR_AND_FINAL_CURRENT_GUARDS',
 'authorWholeBodies':bind(body),'whole13ContractsAndP27':contracts,'allFiveWholeDEENTasksSolutionsScoringsActuallyRead':True,
 'originalPositiveStatusesUnchanged':True,'independentDecimalChecks':len(calc),'wholeIndependentCounterworks':28,'manualTaskGrades':112,
 'actualNativeSpreadsheetThreeCharts':bind(xlsx),'actualIndependentDestatisPrimaryHTTP200Reads':source,
 'findings':[{'id':'root-business-finance-task3-reader-word','materialGoalId':materials[4]['id'],'field':'examData.taskContent','actual':'erläututere','required':'erläutere','severity':'minor readability','status':'open author requested exact immutable successor'}],
 'coverageJudgements':[
 {'materialGoalId':materials[0]['id'],'judgement':'Four real coherent contracts: all three divided-work principles in both different everyday cases and own application; actual F/P and L/M responsibility representations; business-model-relative core/support dependence; all production quantity/organisation distinctions including serial versus variants and construction prefabrication with bounded real IT help.'},
 {'materialGoalId':materials[1]['id'],'judgement':'Two real importance cases, integrated bicycle/meal measures and explicit different market substitution/media cases; two original criterion-based marketing concepts and actual coordinated access adaptation; no sales/contribution/causality conflation.'},
 {'materialGoalId':materials[2]['id'],'judgement':'Two own complete original service/rental models with resources, core process, revenue/cost assumptions and changed capacity; two responsibility decisions with actual affected interests and two mechanism-based temporal objective relationships.'},
 {'materialGoalId':materials[3]['id'],'judgement':'Two genuinely new dated official source definitions and actual spreadsheet chart creation demanded and independently executed. Current2024 source variation is legitimate; original2023 P remains untouched as historical other variation. Two volunteered self-comparisons and changed exploration without personality verdict or private-data need.'},
 {'materialGoalId':materials[4]['id'],'judgement':'Two independent capital/claims/interest/cash/remaining principal cases and distinct form, investment loss, guarantee ceiling, company/owner actual risk; all liability terms expressly given so no unstated real law guarantee.'}],
 'boundary':{'scopeViewsAndActualCountryFields':'separate pending independent B','navigationAndSEMAndPBookInputBinding':'separate pending','humanApprovalOrTrial':False,'strictCurricularClosureGain':0,'activeMutations':0,'machinePracticeAssessmentKindAppropriate':True},'wholeActiveInputGuards':guards})
assert all(sha(R/g['path'])==g['sha256']for g in guards)
Path('/tmp/economics-business-five-independent-root-science-path.txt').write_text(str(O)+'\n')
print(json.dumps({'output':str(O),'independentCalculations':len(calc),'wholeWorks':len(works),'manualGrades':112,'actualSpreadsheetCharts':3,'wholeCurrentPcases':27,'minorReaderFindingOpen':True},indent=2))
