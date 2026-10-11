"""Own synthetic submissions and explicitly assigned rubric marks; AUTHOR only."""
import json
from pathlib import Path
O=Path(__file__).resolve().parent
# Every array is a complete two-case submission, in A1,A2,A3,B1,B2,B3 order.
W={
'c4f27b51':([
'E gibt 40, hat 30% Stimmen und bedingte 3 oder 0 Ausschüttung; K zahlt 60 aus, bekommt vereinbarten Zins 3 und Rückzahlungsanspruch, keine Stimmen.',
'E verliert 40 Beteiligungswert. K fehlen 25. Die zusätzliche Garantie bis 15 ist eine eigene Verpflichtung; bei Zahlung bleiben K 10. Verwertungsdetails lasse ich offen.',
'Kapitalhöhe gibt keine Stimmen: K gibt mehr, E hat Stimmen. Persönliche Garantie widerspricht pauschaler Risikofreiheit; ob E tatsächlich zahlen kann, weiß ich nicht.',
'S hat Information und Ausschüttung, ausdrücklich keine Stimmen. L bekommt Berichte, Zins 4 und Rückzahlung. Daher stimmenlose Beteiligung möglich.',
'S verliert 20 und ist nicht P. L fehlen 18; P zahlt nach der Karte höchstens 12, danach fehlen 6. Garantie ist nicht S-Eigenkapital.',
'Wenn P nur 5 zahlen kann, fehlen L 13. Stimmen und Informationsrechte hängen nicht an diesem Zahlungsbetrag. Weitere Vollstreckung kenne ich nicht.'],
2,{1:'E verliert 40; K verliert zunächst 25. Einen weiteren persönlichen Anspruch bespreche ich nicht.',2:'K hat mehr Geld gegeben, aber keine Stimmen. Ob das Geld wiederkommt, ist unbekannt.',4:'S verliert 20, L fehlen 18; die Kapitalgeber sind verschiedene Positionen.',5:'Informations- und Stimmrechte bleiben bei Zahlungsproblemen bestehen.'},[4,2,2,4,2,2],
'Die zusätzliche persönliche Garantie wird überall ausgelassen; Beteiligung/Forderung bleiben korrekt. s2/s5 verlieren ihren Garantieanteil, s3/s6 nur die konkret gezeigte Rechte-/Grenzleistung.'),
'ae7b3074':([
'Dienstleister: Schluss-EK 48/120=40%, Gewinn/ØEK 24/50=48%, 24/240=10%; Hersteller 240/800=30%, 40/250=16%, 40/400=10%.',
'Gleiche Umsatzmarge heißt verschiedene Kapitalbasis: Maschinen binden Vermögen, Dienstleistung eher Personal. Daraus folgt keine branchenübergreifend beste Firma.',
'Ich würde für Kreditrisiko noch Fälligkeiten und liquide Mittel prüfen. 48% ist nicht dieselbe Bezugsgröße wie 40%; keine Sicherheitsgarantie.',
'Handel 125/500=25%,30/100=30%,30/1500=2%; Beratung 75/150=50%,30/60=50%,30/300=10%. Periodengewinn und Schlussquote sind getrennt.',
'Handel kann bei geringerer Marge und höherem Umschlag denselben Gewinn haben. Ohne Umsatz-/Kapitalbasis ist gleiches Ergebnis nicht gleiche Leistungsfähigkeit.',
'Handelsgewinn 15: 25% Schlussquote unverändert,15% Rentabilität,1% Marge. Ursachen fehlen, also würde ich nicht allein daraus Insolvenz schließen.'],
1,{1:'Die Margen sind gleich; ich benutze nur die berechneten Größen, ohne Brancheninformationen.',2:'Ich benötige Fälligkeiten und liquide Mittel, bevor ich eine Garantie gebe.',4:'Beide verdienen 30; weitere Informationen fehlen.',5:'Gewinn 15 ergibt 15% Rentabilität und 1% Marge; keine sichere Insolvenz.'},[4,1,2,4,1,3],
'Alle Zahlen und allgemeine Vorsicht, aber keinerlei tatsächliche Branchen-/Geschäftsmodellinterpretation. Die bedingten Risikogrenzen ersetzen die fehlende Branchenperspektive nicht.'),
'8e8a672e':([
'A und B statisch (110−100)/2=5. Dynamisch A −1,65, B −6,61 bei 10% und Zahlungen zu Jahresenden.',
'A bekommt früh mehr; beide sind hier gegenüber Nichtinvestition negativ. Bei nur 70 statt 90 im ersten Jahr fällt A auf etwa −19,83. Keine sichere Rangfolge für alle Annahmen.',
'Schulungserfolg bleibt unsicher; qualitative Zugänglichkeit/Ergonomie ist nicht als Geld angegeben. Ich würde Bedingtheit und Mitarbeitendenbedarf prüfen, nicht erfundene Euro addieren.',
'C statisch15, D mit Rest25 statisch17,5. Dynamisch C12,81, D16,12; Restwert gehört ins zweite Jahr.',
'Ohne D-Restwert: statisch5, dynamisch−4,55. Das ist ein konkretes Restwertrisiko ohne gegebene Wahrscheinlichkeit.',
'C ist zugänglicher für Mitarbeitende. Bei unsicherem Wiederverkauf kann C trotz kleinerem Basiswert passend sein; weitere Angaben und Erprobung fehlen.'],
3,{2:'Schulungserfolg ist unsicher; ich wähle A nur bedingt auf Basis der Rechnungen.',5:'Der Restwert ist unsicher; ohne Nachweis nehme ich keine Garantie für D an.'},[4,4,2,4,4,2],
'Statische/dynamische Verfahren und Risiko vollständig, aber nicht quantifizierbare Personal-/Zugänglichkeitsfolgen überall absent; die zwei qualitative Rasteranteile fehlen.'),
'04c17efe':([
'Aktiva Maschine6000, Vorräte2500, Bank1500=10000. Passiva Darlehen4500 und EK5500=10000. Datum und EUR.',
'Aktiva verwenden Mittel, Passiva finanzieren sie. EK5500 ist keine Kasse; Kredit zählt nicht zusätzlich als Aktivposten.',
'Bank1000 ergibt Vermögen9500, EK5000 bei Schuld4500. Periodenerträge fehlen, also kein nachgewiesener Verlust aus bloßer Variante.',
'Computer4000, Forderungen2000, Kasse1000=7000; Kredit3000 und Lieferanten1500, EK2500. Forderung ist Vermögensanspruch, Lieferantenschuld Finanzierung.',
'EK2500 ist Restkapital und nicht Kasse1000. Für Auszahlung fehlen liquide Mittel; Forderung ist noch unbezahlt.',
'Einzug500: Forderung1500, Kasse1500, Computer4000. Summe7000 und Finanzierung gleich; Anspruch wird Geld, kein neuer Gewinn.'],
1,{1:'Das Geld steht in Bank1500. Ich gebe keine Erklärung der Finanzierung.',2:'Neue Bank1000, Summe9500, ausgewiesener EK5000.',4:'Kasse1000 ist der verfügbare Betrag; weitere Erklärung lasse ich weg.',5:'Forderung1500 und Kasse1500, Summe7000.'},[4,0,2,4,1,2],
'Formal ausgeglichene Zahlen, aber Mittelverwendung/-herkunft und residuale Bedeutung überall absent. Roh13 ist bereits FAIL; die Kernregel hebt es nicht zum Bestehen an.'),
'9a1a3f9b':([
'Ertrag10000−Aufwand8500=Gewinn1500; unbezahlte verdiente1500 gehören dazu, Abschreibung500 Aufwand ohne jetzige Zahlung.',
'Ein8800, aus8000, Saldo800. Die alten300 sind Forderungseinzug, nicht nochmals Ertrag; Gewinn ist1500.',
'Umsatz ist vor Kosten; Ertrag folgt Leistung nicht nur Zahlung. Anfangsbank fehlt für den Gesamtbestand.',
'6000−6500=−500. Alte Forderung1000 gehört nicht in den neuen Ertrag.',
'7000−6500=500 Geldüberschuss trotz Verlust500; kein neuer Ertrag aus altem Einzug. Verlust senkt bei ausgeschlossenen Eigentümervorgängen EK.',
'Variante6500−6500=0 Erfolg,7500−6500=1000 Geldsaldo. Die alte1000 bleibt Unterschied, kein identischer Bankbestand.'],
1,{1:'Die Zahlungsgrößen behandle ich hier nicht.',2:'Umsatz ist vor Aufwand; verdient kann auch noch unbezahlt sein.',4:'Der Verlust mindert das Eigenkapital unter ausgeschlossenen weiteren Kapitalvorgängen.',5:'Variante ergibt Erfolg0; weiteres rechne ich nicht.'},[4,0,2,4,2,2],
'Erfolg ist richtig, aber kein Vergleich zu Zahlungsüberschuss irgendwo. Roh14FAIL, echte Inhaltsabsenz bleibt ebenfalls FAIL.'),
'273809d9':([
'M acht Filialen mit einem Eigentümer bleibt ein Anbieter: Monopol. N drei selbstständige Firmen Oligopol; O60 Polypol.',
'Ein vierter N-Anbieter bleibt wenige; Filial- oder Markenzahl ist nicht automatisch Konkurrenz.',
'Ersatzgüter, Markteintritt und Preise wären nötig. Ein Monopolname beweist ohne Marktgrenze keine bestimmte Preishöhe.',
'Wassermarkt lokal einer, Geräte national vier, Onlinegut35 unabhängige Händler: mono/oligo/poly auf den gegebenen Grenzen.',
'Eine Plattform ist nicht automatisch ein Hersteller; Vermittlung und Warenanbieter zählen verschieden. Relevante Ersatzangebote fehlen.',
'Veränderte Anbieterzahl kann Kategorie ändern, wenn Unabhängigkeit und Marktgrenze klar sind. Das ersetzt keinen Wettbewerbsnachweis.'],
3,{2:'Zu Ersatzgütern und Eintritt mache ich keine Angaben.',4:'Eine Plattform ist Vermittlung, nicht automatisch der einzige Warenanbieter.',5:'Die Kategorien folgen nur den gegebenen Zahlen und Grenzen.'},[4,4,0,4,2,2],
'Alle drei Formen korrekt, aber Zusatzinformationen für ein tatsächliches Wettbewerbsurteil durchgehend absent; Roh16 wird14.'),
'489b6d7b':([
'Drei Monate Vorrat binden30; nach Auftrag8, Differenz22. Weniger Bindung erhöht Lieferabhängigkeit, nicht automatisch Standarderfüllung.',
'Ökologisch brauche ich Herkunft/Abfallbelege, sozial sichere Arbeitszeiten und vorgesehene Löhne, ethisch überprüfbare ehrliche Herkunft statt bloß Label. Das sind fiktive Karten.',
'Ich würde geringe Reserve mit überprüfbaren Lieferbedingungen kombinieren. Ohne unabhängige Nachweise ist keine faire oder sichere Lieferung garantiert.',
'Zeitgenaue Lieferung spart Vorrat, aber zwei Störungstage können stoppen. Vier-Tage-Puffer bindet12 und mindert, beseitigt nicht das Risiko.',
'Unterlieferanten brauchen dokumentierte und überprüfte Umwelt-/Arbeits-/Herkunftskriterien; direkte Vertragskarte allein beweist keine Umsetzung.',
'Reserve plus transparente Kontrollen kann passen; Aufwand und Kapitalbindung bleiben. Alternative Gewichtung bei begründeten Produktionsrisiken möglich.'],
2,{1:'Ökologisch wären Herkunft und Abfall zu prüfen; ethisch ehrliche überprüfbare Herkunft statt nur Label.',2:'Ich kombiniere Reserve mit dokumentierter Herkunft und ökologischem Nachweis; keine Garantie.',4:'Unterlieferanten brauchen Umwelt-/Herkunftsdokumentation mit Überprüfung.',5:'Reserve und transparente Herkunftskontrollen kosten Geld; eine andere Risikogewichtung ist möglich.'},[4,2,3,4,2,3],
'Soziale Lieferkettenanforderungen sind vollständig entfernt; Prozess, Umwelt und Transparenz bleiben. Roh18→14.'),
'15d18bd1':([
'Einbehaltener tatsächlich verdienter Cash45 plus Anfang5 sind innen; nach Kauf40 bleiben10 bei möglichen Rechnungen15, Lücke5. Gewinn ist nicht automatisch verfügbare Bank.',
'Neuer Kredit40 ist außen/FK. Sechs Monate sind kürzer als Projektzuflüsse18; die konkret angegebene Rückzahlungslücke12 gefährdet Liquidität.',
'Drei Jahre besser zum Verlauf, aber Zinskosten und19Zahlungen prüfen. Ich würde Fristen/Liquidität höher gewichten, ohne allen Zielen gleichen Erfolg zu garantieren.',
'Verkauf alte Maschine20 statt Buch30: Innenfreisetzung, Cash20 und Verlust10. Neue Beteiligung20 ist außen/EK mit20%Stimmen und Gewinnteilung.',
'Verkauf gibt keine zusätzlichen erwirtschafteten20; Beteiligung ohne feste Rückzahlung schont Fälligkeiten, mindert Kontrolle. Ersatzbedarf25 kann Verkauf unpassend machen.',
'Dann fehlen5 aus dem Erlös; zusätzliche Quelle und Folgekosten prüfen. Ich wähle je nach Ersatznotwendigkeit, Frist und Kontrollziel, nicht einfach nach EK-Wort.'],
0,{0:'Nach Kauf bleiben10, mögliche Rechnungen15 erzeugen Lücke5.',1:'Sechs Monate zum Projekt passen schlecht; Rückzahlungslücke12.',2:'Drei Jahre besser, aber Zinskosten und19 Zahlungen bleiben.',3:'Verkauf Cash20 bei Verlust10; Beteiligung hat20%Stimmen und Gewinnteilung.',4:'Ohne feste Tilgung andere Fälligkeiten; neue Stimmen mindern Kontrolle.',5:'Ersatz25 ist größer als Verkauf20; zusätzliche Quelle5 prüfen.'},[2,2,3,2,3,3],
'Herkunft innen/außen wird absichtlich nirgends klassifiziert, obwohl Ziel-/Liquiditätsfolgen sinnvoll sind; Roh15→14.'),
'e90586d8':([
'Eigentümer profitieren möglicherweise von geringeren Stückkosten; Beschäftigte verlieren10Routineplätze, vier neue Wartungsjobs sind nicht automatisch dieselben Qualifikationen.',
'Kunden bekommen keine sichere Preissenkung. Kommune/Region braucht Übergänge und Beschäftigung; Verantwortung heißt nachvollziehbare Weiterbildung/Übergänge prüfen.',
'Ich würde eine Pilotphase mit überprüfbaren Übergangswegen wählen. Produktion/Versorgung kann Nutzen haben, aber12%Stückkosten sind kein Sozialgesamturteil.',
'Eigentümer sparen Verpackungseinkauf10%, Kunden haben unbekannte Endpreise, alte Lieferanten verlieren Aufträge, neue erhalten sie.',
'Weniger Wiederverwertung belastet Abfallbetroffene; Versorgung und regionale Wertschöpfung sind gesellschaftlich wichtig. Herkunft und Entsorgung prüfen.',
'Ich würde Angebote mit dokumentiertem Abfall-/Kostentest vergleichen und Einsparung nicht als Garantie melden. Auch eine begründete teurere Wahl kann passen.'],
1,{1:'Kunden haben keine sichere Preissenkung; regionale Arbeitsfolgen bleiben zu ermitteln.',2:'Pilotphase kann Produktionskosten prüfen;12% sind kein Gesamtgewinn.',4:'Weniger Wiederverwertung kann Abfall erhöhen; Versorgung und regionale Aufträge sind betroffen.',5:'Ich würde nur belegte Einkaufsersparnis ausweisen; Preisfolgen bleiben unbekannt.'},[4,2,2,4,2,2],
'Mehrere Stakeholder und Bedeutung, aber keine normative gesellschaftliche Verantwortungsabwägung irgendwo; Roh16→14.'),
'53829f76':([
'Mein Modell: einfache sichere Fahrradleistungen für Mitschüler, Termine vorab, kein sicherheitskritischer Eingriff. Vier Mitarbeitende bieten240Minuten; Preis8, variable3, Fix20.',
'Buchen→Sichtprüfung/Grenze→freigegebene Arbeit→Qualitätsprüfung→Abholung/Zahlung.20Minuten je Arbeit sind12; Gewinn bei12:96−36−20=40, wenn Nachfrage wirklich12.',
'24 brauchen480Minuten, zu viel; ich würde zwei Terminfenster oder begrenzt nur12 annehmen. Nachfrage und sichere Fertigkeiten müssen geprüft werden.',
'Eigenes Vereinssetmodell: Nutzen wiederverwendbare komplette Sets,15Lagerplätze,12Buchungen, Preis/Personalaufwand noch transparent zu kalkulieren.',
'Reservieren→Ausgabe/Bestand→Rücknahme→Prüfung/Reinigung→neue Freigabe.12×10=120Reinigungsminuten; Rücklauf gehört zur Leistung, nicht nur Werbung.',
'Vier verspätet aus15:11verfügbar bei12neuen, Fehlbedarf1. Ich würde verbindliche Rückgabe und einen echten Puffer planen, ohne garantierten Gewinn.'],
1,{1:'Ich werbe für Termine und nehme Geld ein; einen Ausführungsprozess stelle ich nicht dar.',2:'24brauchen480Minuten, daher nur12Buchungen oder zwei Fenster.',4:'Es gibt Buchung und Verkauf; einen Rücklaufprozess gebe ich nicht an.',5:'Vier später:11bei12, daher ein Puffer. Kein garantierter Gewinn.'},[4,0,3,4,0,3],
'Beide Geschäftsmodelle und Kapazitätsanpassungen, aber vollständiger Kernprozess absichtlich absent; Roh14 bleibtFAIL.'),
'8328f308':([
'Eigene XLSX-before enthält8328_A: C198362/7801230, G538248/6017332, D2=C2/B2,D3=C3/B3 und zwei verknüpfte beschriftete Diagramme; rund39,33/11,18.',
'G mehr Unternehmen, C mehr Beschäftigung; jährliche Beschäftigungsverhältnisse nicht Köpfe/Median. XLSX-after erhöht nur G um100000: neue Formelzelle und unveränderte Referenz, plus rund0,186.',
'Ich erkunde konkrete Tätigkeiten/Qualifikation und örtliche Betriebe, nicht sichere Jobs aus Aggregaten. Eine Verteilungsinformation fehlt.',
'XLSX8328_B nutzt86/210 und253/388, rund40,95%/65,21% als Anteilsgrafik aus gespeicherten Formeln. Jahr2024 und rechtliche Einheiten sichtbar.',
'253→250 in tatsächlicher after-Datei ergibt64,43%, ungefähr−0,77Punkte. Gerundete Rechnung muss nicht genau40,9% ergeben; Test ist keine Revision.',
'Bau kann Erkundung nahelegen, aber konkrete Arbeit/Qualifikation bleibt offen. A-statistische versus B-rechtliche Einheit verhindert direkten Vergleich.'],
2,{2:'Zu Berufs- oder Unternehmensentscheidungen ziehe ich keinerlei Schluss.',5:'Die Einheiten unterscheiden sich; zu Berufs-/Unternehmensentscheidungen gebe ich keine Bewertung.'},[4,4,0,4,4,0],
'Genuine beide Dateien/Diagramme bleiben eingereicht, aber Berufs-/Unternehmensschluss vollständig absent; Roh16→14.'),
'83779981':([
'Taler ab1520 und viel spätere Scheine: Akzeptanz durch Handel/Umlauf versus Ausgabe/Vertrauen, Teilbarkeit über Nominale, nicht Zerschneiden.',
'Metall ist robust, hohe Summen schwer; Papier leicht, nass/gerissen problematisch. Welche Form praktisch passt, hängt vom Zahlungsbedarf ab.',
'Institutionen/Vertrauen und Handel erklären Wandel mit; neu ist nicht automatisch besser und Münzen können bleiben.',
'Zigaretten nach Krieg in Teilen des Schwarzmarkts, einzelne Einheiten tauschen; D-Mark ab20.6.1948westlich, Nominale und institutionelle Akzeptanz.',
'Beide leicht, Zigarette kann verbraucht/feucht werden, Note beschädigt. Tragbarkeit allein erklärt die Reform nicht.',
'Krise/Regeln/Vertrauen tragen Wandel; keine technische Zwangsentwicklung der Zigarette zu Banknote und nicht überall derselbe Kreis.'],
2,{1:'Große Münzbeträge sind schwer, Papier ist leichter; das hilft bei größeren Zahlungen.',4:'Beide Formen sind leicht transportierbar; Tragbarkeit allein erklärt Ausgabe/Vertrauen nicht.'},[4,2,4,4,2,4],
'Haltbarkeit wird in beiden Anwendungen vollständig ausgelassen; andere Eigenschaften und historischer Wandel bleiben. Roh20→14.'),
'685624a0':([
'Eigene XLSX685_A: Jahre2023/24/25, Umsatz100/130/150, Gewinn12/13/9. Getrennte datenverknüpfte Balken mitTausendEUR, verständlich für Auszubildende.',
'Gespeicherte after-Datei 2025-Gewinn9→18; D4=C4/B4 bleibt,6→12% bei150Umsatz. Chartreferenzen sind gleich, Eingabe wirklich geändert.',
'Umsatz steigt, letzter Gewinn fiel ursprünglich; kein belegter Grund und keine Cashmenge. Keine zweite versteckte Skala.',
'XLSX685_B gestapelt90/210vomGesamt300;30%/70%, für Lieferanten Struktur statt Gewinn. Vermögen nicht dritter Anteil.',
'after 110/190gibt weiterhin300,36,67%/63,33%. Gespeicherte Eingabezellen und Referenzen geprüft, Prozentformeln bleiben.',
'Anteil steigt, aber nicht automatisch Erfolg oder liquide Mittel; Fälligkeiten/Konditionen fehlen, Lieferant braucht weitere Belege.'],
2,{1:'Margin9/150=6% und Variante18/150=12%; die Variante rechne ich nur auf Papier, die unveränderte before-Datei bleibt.',4:'Auf Papier110/190und300ergeben36,67/63,33%. An meiner before-Datei führe ich keine Änderung aus.'},[4,2,4,4,2,4],
'Echte ursprüngliche Datei, Form/Zielgruppe/Finanzaussage korrekt, aber tatsächlich ausgeführte Mutation überall ausdrücklich absent; after-Datei ist hier nicht eingereicht. Roh20→14.'),
'860ead33':([
'Vier Ausbildungskarten: Jargon, Umsatz, unklarer Kontakt, alle-Behauptung. Tätigkeiten und Lernweg fehlen.100→150belegt keine Ausbildungsqualität.',
'Undefinierte Abkürzungen und kleiner Kontakt erschweren Info; Rückmeldung zeigt Fragen, keine Bewerbungsentscheidung.',
'Ich ersetze Jargon durch eine Tätigkeit mit Lernbegleitung, ordne Ausbildung→Beleg→Kontakt. Kurze Verständnisfragen könnten Klarheit, nicht Bewerbungsquote prüfen.',
'Drei Käuferkarten: Qualität ohne Maß,450/500=90%,460/500=92%, Foto ohne Lieferbeleg. ZweiPunkte/zehnSendungen widerlegen immer.',
'85%-Start kann vergrößern, sichtbare volle Skala und Fristdefinition helfen. Rückmeldung zeigt Unklarheit, keinen Vertragsnachweis.',
'Ich gebe definierte Lieferbedingungen und prüfbare Qualität an. Käuferfragen testen Verständlichkeit; Vertrag und Wahrheit brauchen andere Nachweise.'],
2,{2:'Ich gebe keine Verbesserung oder Prüfung der Wirkung an.',5:'Ich gebe keine Verbesserung oder Wirkungskontrolle an.'},[4,4,0,4,4,0],
'Ganze adressatenbezogene Analyse und Belegprüfung, aber konkrete Verbesserung/Wirkungsgrenze vollständig absent; Roh16→14.')}
N={}
for f in ['author_finance_business_cases.py','author_market_procurement_and_project_cases.py','author_official_data_money_and_representation_cases.py']:exec(compile((O/f).read_text(),str(O/f),'exec'),N)
S={s['prefix']:s for s in N['SPEC']};rows=[];decisions=0
for pref,(fair,missing,replacements,marks,why) in W.items():
 assert len(fair)==len(marks)==6;assert all(0<=x<=4 for x in marks)
 # Marks below are actual explicit conservative author assignments, not automatic matching to model text.
 fairmarks=[3,3,3,3,3,3]
 counter=list(fair)
 for k,v in replacements.items():counter[k]=v
 core=S[pref]['separateWholeEssentialComponents'][missing]
 attached=('8328f308','685624a0')
 rows.append(dict(wholeGoalPrefix=pref,kind='own fair imperfect two-case work',submission=dict(zip(['A1','A2','A3','B1','B2','B3'],fair)),actualStepMarks=fairmarks,rawPoints=18,essentialComponentsShown=True,finalPoints=18,result='PASS',manualJudgment='Conservative three of four per task: meaningful calculations/interpretation/transfer present; brief wording does not supply every model detail. No perfect answer or task quota required.',actualSavedArtifacts=(['own-four-spreadsheet-cases.before-actual-input-change.xlsx','own-four-spreadsheet-cases.after-actual-input-change.xlsx'] if pref in attached else [])))
 rows.append(dict(wholeGoalPrefix=pref,kind='own whole core counterwork',submission=dict(zip(['A1','A2','A3','B1','B2','B3'],counter)),actualStepMarks=marks,rawPoints=sum(marks),whollyAbsentSeparateCore=dict(de=core[0],en=core[1]),finalPoints=min(sum(marks),14),result='FAIL',manualJudgment=why,actualSavedArtifacts=(['own-four-spreadsheet-cases.before-actual-input-change.xlsx','own-four-spreadsheet-cases.after-actual-input-change.xlsx'] if pref=='8328f308' else ['own-four-spreadsheet-cases.before-actual-input-change.xlsx'] if pref=='685624a0' else [])))
 rows.append(dict(wholeGoalPrefix=pref,kind='own whole second-application omission',submission=dict(zip(['A1','A2','A3','B1','B2','B3'],fair[:3]+['Keine Bearbeitung.']*3)),actualStepMarks=[3,3,3,0,0,0],rawPoints=9,finalPoints=9,result='FAIL',manualJudgment='The entire distinct second application is absent, rather than one subtask. Partial first work stays credited.',actualSavedArtifacts=(['own-four-spreadsheet-cases.before-actual-input-change.xlsx','own-four-spreadsheet-cases.after-actual-input-change.xlsx'] if pref in attached else [])))
 decisions+=18
assert len(rows)==42 and decisions==252
p=O/'actual-own-fourteen-fair-core-counter-and-second-omission-works252-manual-step-marks.AUTHOR.json';assert not p.exists()
p.write_text(json.dumps(dict(role='AUTHOR synthetic whole works and manual marks; not independent science, learner evidence or human approval',actualWholeWorks=42,actualManualStepMarks=252,actualFairPass=14,actualCoreCounterFail=14,actualWholeSecondOmissionFail=14,wholeWorks=rows),ensure_ascii=False,indent=2)+'\n');print(json.dumps({'works':42,'manualStepMarks':252,'fairPass':14,'counterFail':28}))
