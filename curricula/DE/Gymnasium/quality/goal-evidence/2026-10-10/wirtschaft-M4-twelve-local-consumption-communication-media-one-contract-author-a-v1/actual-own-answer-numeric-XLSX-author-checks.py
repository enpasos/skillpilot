from pathlib import Path
from decimal import Decimal
from fractions import Fraction
import json,hashlib,copy,re,zipfile,xml.etree.ElementTree as ET,ast

R=Path('/home/enpasos/projects/skillpilot'); O=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-twelve-local-consumption-communication-media-one-contract-author-a-v1'
bodypath=O/'whole-twelve-readable-DEEN-whole-essential-groups.DRAFT-author-successor-v3.json'
materials=json.load(open(bodypath))['materials']; designs=json.load(open(O/'twelve-individual-full-contract-P24-essential-groups-and-six-rubric-author-designs.json'))['wholeTwelveDesigns']; dm={x['coveredGoalId']:x for x in designs}
def rec(p):
 b=p.read_bytes(); return {'path':str(p.relative_to(R)) if p.is_relative_to(R) else str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(n,x):
 p=O/n; assert not p.exists(),p; p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n'); return rec(p)

partial={
'eef95305':[
'Ich kann A nach dem Probemonat einfach behalten; diese Ausgangsposition kann die Wahl erleichtern. Eine Person kann A aber auch bewusst gut finden.',
'1 Euro mal 30 Tage sind 30 Euro. Die kleinere Tageszahl wirkt weniger belastend; ich erkläre das hier knapp und vergesse eine ausführliche Zeitraumkontrolle.',
'Ich würde bei gleicher Musik zufällig nur die Vorauswahl bzw. Tagesanzeige wechseln. Ein Effekt ist noch nicht gemessen; andere Vorlieben werden hier nur kurz erwähnt.',
'120 Euro geben einen Bezugspunkt für 48 Euro. Der Vergleichspreis ist unbelegt; seine Wirkung kenne ich noch nicht.',
'Die zufälligen Gruppen haben denselben Rucksack und Endpreis. Die Kaufanteile beider Gruppen fehlen; weitere Durchführungsdetails kann ich noch nicht nennen.',
'A startet schon gewählt, 1 Euro statt 30 Euro beschreibt denselben Aufwand anders, 120 Euro setzt einen Vergleichswert. Ein Kauf kann auch Bedarf sein; meine Begründung dazu bleibt knapp.'],
'84955a75':[
'70 von 100 sind 70 Prozent, 40 von 100 sind 40 Prozent, Unterschied 30 Prozentpunkte. Bei sonst gleichen Bedingungen kann die automatische Verlängerung die Beibehaltung begünstigen.',
'Preis, Leistung und Klickaufwand bleiben gleich. Wenn D mehr Leistung böte, könnte das auch erklären, warum mehr Personen bleiben; den Zeitraum führe ich nicht weiter aus.',
'Die Gruppe zeigt einen Unterschied. Ich kann daraus nicht wissen, weshalb jede einzelne Person blieb; die Übertragbarkeit auf andere Apps bleibt offen.',
'Der Vergleichswert 90 kann die Lampe für 36 günstig erscheinen lassen. 8 minus 5 sind drei Skalenpunkte; die Skala erläutere ich nicht vollständig.',
'Ich würde dieselbe Lampe mit gleichem Endpreis zufällig mit bzw. ohne 90-Euro-Angabe zeigen und die gleiche Bewertungsfrage stellen. Eine tatsächliche Kaufbeobachtung wäre zusätzlich nötig.',
'Bewertung ist noch kein Kauf. Einzelne Personen können die Lampe wirklich benötigen; ich kenne ihre Motive nicht, obwohl der Gruppenvergleich einen Darstellungsmechanismus plausibel macht.'],
'a60e0541':[
'Ich wähle die Reparatur für 45: Sie passt zu 75 und zum Wegbedarf; 30 bleiben. Das Zubehör behebt den Defekt nicht, beide kosten 105; die beste entgangene Verwendung benenne ich nur als Zubehörverzicht.',
'Das weiter nutzbare Fahrrad könnte Material und Geld sparen. Eine genaue Umweltbilanz kenne ich nicht; zuverlässig zur Schule kommen ist mir im fiktiven Profil wichtig.',
'Nur-heute-Werbung und Zugehörigkeit können auf Zubehör lenken. Ohne Countdown schaue ich zuerst auf Bedarf und Budget; eine genaue Vergleichsmethode fehlt.',
'X bindet 30, Y 80 sofort, beide passen zu 90. Erwartet sind es 30 pro Jahr bei X und 20 bei Y; zusätzliche Reparaturkosten sind noch offen.',
'Y passt zu langem Nutzen, X lässt mehr Geld sofort übrig. Deshalb entscheide ich mich bedingt für X bei unsicherer künftiger Kasse; Haltbarkeit und Umweltangaben prüfe ich später.',
'Neutral betrachtet ist Y pro erwartetem Jahr günstiger, X schont die aktuelle Kasse. Ein Countdown ist kein eigener Bedarfsgrund; ich entscheide nur vorläufig.'],
'e5b070d2':[
'Ich liefere die tatsächliche Original-A-Datei mit B2=240,B3=90,B4=100,B5=35,B6=SUM(B3:B4),B7=B2-B6-B5. Sie ergibt 190 Ausgaben und 15 Rest; die Tabellenbeschriftung ist knapp.',
'In der tatsächlich geänderten A-Datei steht nur B4 auf 115. Die Formeln bleiben und ergeben 205 Ausgaben und 0 Rest; eine weitere Szenarioreihe fehlt.',
'Die 35 Sparziel gehen rechnerisch, aber danach gibt es keinen Puffer. Ich könnte die variablen Ausgaben begrenzt reduzieren; unerfasste Kosten sind noch offen.',
'Meine B-Datei benutzt 360 Einnahmen,170 feste,110 variable,180 Jahreszahlung,50 Sparziel. B7=B5/12, B8=SUM(B3:B4)+B7, B9=B2-B8-B6 ergeben 15 Rücklage und 15 Rest; Beschriftung bleibt knapp.',
'Die B-Änderungsdatei setzt B5=300, unveränderte Formeln ergeben 25 Rücklage und 5 Rest. Der Monatsrest fällt um 10; andere mögliche Schwankungen prüfe ich nicht.',
'Monatlich 25 zurücklegen ist nicht schon 300 bezahlen. Der Fälligkeitstag und vorhandenes Geld fehlen; bei frühem Termin kann noch Geld fehlen, auch wenn der Monatsrest positiv ist.'],
'6e138ab0':[
'Für die Jugendgruppe empfehle ich bedingt die 45-Euro-Reparatur: 35 bleiben von 80, Ersatz110 geht ohne weitere Mittel nicht. Ich nenne mögliche Folgefehler, aber keine genaue Ausfallrechnung.',
'Eigene Karte: Reparatur prüfen,45 Euro, mögliches weiteres Jahr, keine Garantie. Eigene Text-Medientabelle: Reparatur45/Budget80/Ersatz110, daneben ein Fragezeichen für Folgen. Das ist eine einfache tatsächliche Darstellung ohne Balkengrafik.',
'Nur als ausdrücklich hypothetische Bewertungsannahme: Eine tatsächliche kurze mündliche Simulation enthält „45 im Budget“ und beantwortet die Rückfrage mit „kein garantierter Zeitraum“. Hier gibt es keine Aufnahme und keinen behaupteten beobachteten Vortrag.',
'A720,B600, Unterschied120. Bei Frist3Tagen ist A verlässlich rechtzeitig, B kann zu spät sein. Ich entscheide bedingt für A und rechne keine erfundenen Risiken.',
'Eigene Leitungsvorlage: Kosten720/600, Lieferfenster2 bzw1–8, Bedarf40 in3Tagen, Lager knapp. Ich mache eine tatsächliche Vergleichstabelle und benutze sachliche Frist-/Kostenbegriffe; ein breiter Alternativenplan fehlt.',
'Nur hypothetisch beobachtete Simulation als Bewertungsbedingung: „120 ist nur Kaufvorteil, B nicht immer besser, Frist und Risiko fehlen.“ Ohne diese tatsächliche mündliche Leistung wäre die Arbeit hier nicht bestanden.'],
'7179f558':[
'Petition bündelt Zustimmung, Verband begründete Interessen. Beide geben an das Sekretariat zum Rat; ich nenne die Beratungswirkung, aber noch keine Einzelstrategie.',
'Online ist schnell sichtbar, ohne Internet nicht erreichbar. Ein Brief und der Verband geben andere Zugänge; Zeit und Organisation bleiben nötig.',
'1200 Unterstützungen ersetzen keinen Ratsbeschluss. Ich würde bis10November eine kurze begründete Alternative einreichen; ihre Wirkung ist offen.',
'Verbände bündeln Interessen, Einzelne Erfahrungen. Stellungnahmen bis5Dezember, Modellparlament entscheidet20Dezember; Annahme ist kein Veto.',
'Hauptamtliche Kräfte können mehr Zeit und Fachwissen einsetzen. Eine leicht verständliche Briefvorlage hilft Einzelnen; gleiche Ausstattung entsteht dadurch nicht.',
'Ich verbinde eine digitale eigene Stellungnahme mit analoger Verbandssprechstunde. Das erhöht Zugangswege, garantiert aber keine Zustimmung; den Zeitaufwand schätze ich nur grob.'],
'ffe6ed04':[
'130000 minus100000 sind30000, also30Prozent. R bietet überprüfbare Daten, S keine Quelle; die Leistungsänderung berücksichtige ich nur kurz.',
'Der offene Link macht Kosten und Verantwortlichkeit nachprüfbar. Zwei Gegenpositionen sind sichtbar; weitere Stimmen können fehlen.',
'Viele Aufrufe messen Aufmerksamkeit, nicht richtige Information. Für Willensbildung brauche ich auch Kritik und Gegenpositionen; die Kriteriengewichtung bleibt kurz.',
'Das Rangverfahren bevorzugt erwartete Aufmerksamkeit, deshalb steht Zuspitzung oben. Ich leite das nur für dieses Modell ab, nicht für alle Plattformen.',
'Selten sichtbare Anwohner bekommen weniger Gehör. Obenstehen beweist keine Wahrheit; Zugang allein schafft noch keine wirkliche gleiche Beteiligung.',
'Ein Quellenfenster plus Briefzugang kann Alternativen sichtbar machen. Moderation und knappe Aufmerksamkeit bleiben nötig; der konkrete Aufwand ist offen.'],
'bd9ec397':[
'Die Untergrenze steigt2Euro mal20Stunden, also40 je Woche. Zwei Personen belegen nicht Gewinne für alle; andere Arbeitszeiten und Beschäftigung sind nicht untersucht.',
'Die Leiter zur Sonne idealisiert den Lohnanstieg, tragende Betriebe zeigen Kosten. Nebenstehende könnten Ausgeschlossene sein; eine eindeutige Absicht behaupte ich nicht.',
'Einkommensschutz stärkt sozialen Ausgleich, kann aber Freiheit und Effizienz berühren. Ich halte die Regel vorläufig für vertretbar; ohne Wirkungsdaten bleibt das bedingt.',
'100Euro sind nur betriebliche Kosten. Umweltreaktion und Verwendung der Einnahmen fehlen; die Forderung folgt daraus noch nicht.',
'Die Waage ignoriert Rauch und zeigt eine reine Gewinnsicht. Das deutet auf externe Belastung, misst sie aber nicht; die genaue Bildabsicht bleibt offen.',
'Freiheit kann begrenzt werden, Effizienz könnte durch Berücksichtigung fremder Kosten steigen, Ausgleich hängt von Kostenverteilung ab, Umwelt von Emissionsreaktion. Ich brauche Daten dafür und gebe kein endgültiges Abschaffungsurteil.'],
'b5762a90':[
'Wiederholte Montage zeigt Spezialisierung; schnelle Schnitte und Erschöpfung machen Belastung sichtbar. Eine gemessene Produktivitätswirkung liefert der Film nicht.',
'Die erzählende Person gewinnt Lohn für Wohnung, verliert gemeinsame Zeit. 60/6 und80/8 sind beide10; die innere Ambivalenz beschreibe ich nur knapp.',
'Film arbeitet mit Schnitt, Literatur mit eigener Stimme, Sachtext mit Definition/Zahlen. Modellrechnung ist keine reale Häufigkeit; genauer Formvergleich bleibt kurz.',
'Countdown und Schlange inszenieren Druck; der Dialog zeigt Zugehörigkeit und knappe Mittel. Beide können auch Ambivalenz statt eindeutiger Kritik zeigen.',
'40+30=70 über60, Kleidung lässt20 und Ausflug30. Opportunitätskosten sind die beste entgangene Alternative, nicht automatisch40; die Rangfolge ist hier unbekannt.',
'Film zeigt Druck, Dialog eine subjektive Zugehörigkeitsfrage, Sachmodell die knappe Alternative. Eine andere Deutung braucht konkrete Merkmale; über echte Käufermotive weiß ich nichts.'],
'596c02e3':[
'Mein Plan: zwei Tageskosten vergleichen, einen vorläufigen Vertreter wählen, dann vollständig aggregieren und berichten. Ich wähle zuerst B60: Einweg30,Mehrweg34 für2Tage. Das ist nur die Startannahme.',
'Neue Methode berücksichtigt beide Tage: A Einweg30/Mehrweg20,B15/17; Summe45/37. Meine tatsächlich ausgeführte Revision zählt beide14-Fixbeträge; eine ausführliche Prozessgrafik fehlt.',
'Die erste B-Prognose bevorzugte Einweg um4, die vollständige Rechnung Mehrweg um8. Der Bericht zeigt die Verzerrung durch Tagesauswahl; Rückgaben und Umwelt bleiben unbekannt.',
'Eigene Karte: bei unterstelltem Mangel Reparatur oder Lieferung wählen, gesetzliche Grenzen prüfen, Sache bereitstellen. Musteranfrage: Bitte reparieren, ich stelle die Kopfhörer bereit. Eigene Frage „Ist der Ablauf verständlich?“ ergibt laut ModellJa/Ja; Ausnahmedetails bleiben knapp.',
'Neue eigene Fragen: „Welche Abhilfe fordern Sie?“ und „Stellen Sie die Sache bereit?“ Raster je0/1: A automatische Rückzahlung nicht aus dieser Hilfe begründet/keine Bereitstellung:0/0; B Reparatur/Bereitstellung:1/1. Ich wende das tatsächlich auf beide Protokolle an.',
'Ja/Ja trennt fachliches Verstehen nicht. Das neue0/2-Raster zeigt unterschiedliche Anwendung, trotz gleicher Selbstauskunft. Die Methode wurde geändert und ausgeführt; es ist nur ein fiktiver Kleindatensatz, keine reale Befragung.'],
'72f45efc':[
'A ist BWL wegen eigener Einkaufs-/Produktionssteuerung, B VWL wegen Marktangebot/Nachfrage. Die Branche entscheidet nicht; die genauere Schnittmenge beschreibe ich kurz.',
'C erklärt allgemeine Haushaltswahl unter knappem Budget und kann Mikroökonomie sein. Eine Person macht es nicht automatisch BWL; weitere Definitionen lasse ich aus.',
'Derselbe Mehlpreis führt zu Betriebsplanung bzw. Marktfragen. Die Daten sind gleich, die Untersuchungsziele verschieden; beide können sich ergänzen.',
'A steuert den Busbetrieb, B untersucht Nachfrage und öffentliche Mittel. Deshalb BWL bzwVWL; die Wirkung günstiger Tickets ist noch eine Frage.',
'Auch eine Person kann ein mikroökonomischer Nachfragefall sein. Nur aus Unternehmens- oder Personenzahl folgt nichts; eine vollständige Methodenabgrenzung fehlt.',
'Firmendaten entscheiden die Disziplin nicht. Eigene Fragen: „Wie planen wir Schichten?“ und „Wie ändern Preise die Nachfrage?“; beide können dieselben Zahlen nutzen.'],
'f478f85e':[
'Knappheit, Budget und Anreize bestimmen menschliche Wirtschaftsentscheidungen; hier ist Wirtschaftswissenschaft eine Sozialwissenschaft. Das Gerät ist nicht entscheidend.',
'Psychologie untersucht Gewohnheiten, Soziologie den Zugang zum Bus. Beides hilft der Nachfragefrage; ich erkläre nur den Gewohnheitsbeitrag genauer.',
'Die Frage betrifft Nachfrage, die Mathematik rechnet Beziehungen, Emissionsdaten beschreiben Technik. Werkzeuge bestimmen das Fach nicht; Modellgrenzen beschreibe ich kurz.',
'Die Haushaltswahl zwischen Reparatur/Ersatz ist ökonomisch-sozialwissenschaftlich trotz Gerät. Preise und Einkommen sind relevante Bedingungen.',
'Technik prüft Reparierbarkeit, Psychologie Gewohnheit. Beide verbinden sich mit Preisen und Optionen, werden aber nicht zur gleichen Disziplin; die Verknüpfung ist knapp.',
'Rechnen heißt nicht Mathematik als Untersuchungsgegenstand; Geräte heißen nicht Naturwissenschaft als Wirtschaftsfrage. Annahmen und Daten sind nötig; eine konkrete Teststrategie fehlt.']}

# Explicit own absence counterworks: unchanged answers are own authored model answers,
# not imported independent reviewer works. Entire assembled answers are recorded below.
absence={
'eef95305':({1:'1 mal30 sind30Euro. Ich rechne nur den Preis und behaupte ausdrücklich keine Darstellungswirkung.',2:'Ich würde gleiche Musik zufällig mit und ohne Vorauswahl vergleichen. Ein Effekt ist noch nicht gemessen; individuelle Vorlieben sind eine Alternative.',5:'Voreinstellung ist eine Ausgangsoption,120 setzt einen Anker. Die Tagesanzeige wird von mir weder erklärt noch als eigene Wirkung behandelt. Kaufen kann Bedarf sein.'},[[2,2],[2,0],[2,2],[2,2],[2,2],[1,2]],'Erklärung der äquivalenten Darstellungsvariation ist im gesamten Text ausdrücklich ausgelassen. Reine Kostenrechnung ersetzt sie nicht.'),
'84955a75':({1:'Der Preis ist4 und die App hat Wetterdaten. Ob andere Leistungen und Klickkosten gleich waren, prüfe ich nicht; einen sonst gleichen Vergleich liefere ich nicht.',4:'Eine neue Käufergruppe und eine hochwertige andere Lampe könnten allgemein interessant sein. Einen kontrollierten sonst gleichen Vergleich führe ich ausdrücklich nicht aus.'},[[2,2],[0,0],[2,2],[2,2],[0,0],[2,2]],'Geeigneter sonst gleicher Vergleich vollständig fehlend; tatsächlich unterschiedliche Qualität ist kein isolierter Darstellungsvergleich.'),
'a60e0541':({2:'Ich wähle Reparatur wegen Wegbedarf und45imBudget. Werbung und neutrale Darstellung untersuche ich ausdrücklich nicht.',5:'Ich wähle Y wegen20erwartetenEuroproJahr, sofern80soforttragbar sind. Den Countdown und eine Variation der Darstellung lasse ich ausdrücklich vollständig aus.'},[[2,2],[2,2],[0,0],[2,2],[2,2],[0,0]],'Konkrete Werbe-/Verhaltenswirkung und Prüfung bei neutraler Darstellung in beiden Fällen vollständig abwesend.'),
'e5b070d2':({0:'Ich schreibe240−90−100−35=15auf. Es gibt keine Tabelle und keine Zellformeln.',1:'Ich schreibe240−90−115−35=0auf, ohne einen Tabelleneingang tatsächlich zu ändern.',3:'Ich schreibe180/12=15und360−170−110−15−50=15auf. Es gibt auch fürBkeineDatei oder Zellverknüpfung.',4:'Ich rechne auf Papier300/12=25undRest5. Keine Eingabezelle ist vorhanden oder geändert.'},[[0,0],[0,2],[2,2],[0,2],[0,2],[2,2]],'Tatsächliche verknüpfte Tabellen und ausgeführte Eingabeänderung fehlen trotz richtiger Papierergebnisse. Kein behaupteter Spreadsheetnachweis.'),
'6e138ab0':({2:'Ich liefere nur das schriftliche Transkript: keine Garantie für ein Jahr. Ein tatsächlicher Vortrag oder eine Aufnahme hat nicht stattgefunden.',5:'Ich liefere nur Folien und einen Einwandtext: B ist wegen Fristrisiko nicht immer besser. Es gibt ausdrücklich keine tatsächliche mündliche Darbietung.'},[[2,2],[2,2],[0,2],[2,2],[2,2],[0,2]],'Tatsächliche mündliche Erläuterung vollständig abwesend. Ein schriftliches Transkript ist kein Ersatz; tatsächliche Schrift-/Medienprodukte sind separat beigefügt.'),
'7179f558':({0:'Petition und Verband sammeln Interessen; im Modell entscheiden1200Unterstützungen selbst denTarif, derRat muss folgen.',2:'Ich reiche bis10November ein, weil das dem Anliegen automatischeDurchsetzung garantiert.',3:'Gewerkschaft,Arbeitgeber undIndividuen äußern sich bis5Dezember; jederBeitrag ist imModell einVeto gegen dieEntscheidung.',5:'Ein Brief plusDigitalbeitrag garantiertimModell Zustimmung, weilTeilnahmebereitsbindet.'},[[2,0],[2,2],[0,2],[2,0],[2,2],[2,0]],'Unterscheidung Teilnahme/bindende Entscheidung durchgehend falsch, trotz richtiger Wege und Ressourcenprüfung.'),
'ffe6ed04':({1:'RnenntzweiGegenpositionen,weiterekönnenfehlen. ÖffentlicheVerantwortlichkeitsprüfung undKontrollebehandleichexplizitnicht.',2:'Aufrufe sindAufmerksamkeitnichtWahrheit. FürVielfaltbraucheichAlternativen; öffentlicheKontrollelass ichaus.',5:'Quellenfenster undBriefe könnenAlternativeStimmenzeigen. Moderationbleibtnötig; zuröffentlichenKontrolleoderPrüfungvonVerantwortungtreffeichkeineAussage.'},[[2,2],[0,2],[2,2],[2,2],[2,2],[2,2]],'Öffentliche Kontrolle vollständig abwesend; Quellen sind lediglich Informationsqualität, keine angewandte Verantwortlichkeits-/Kontrollfunktion.'),
'bd9ec397':({2:'Einkommensschutz kann sozialenAusgleichstärken,unternehmerischeFreiheitbegrenzen. MeinUrteilistbedingtwegenfehlenderWirkungsdaten; Effizienzprüfeichexplizitnicht.',3:'100EurozeigenprivateKosten.Interessen,VerteilungundUmweltreaktionfehlen.DieAbschaffungistnichtbelegt;eineEffizienzfolgerunglassichexpizitaus.',5:'Freiheitkannbegrenztwerden,Ausgleichhängt vonLastenverteilungab,UmweltvonEmissionsreaktion.Effizienz wird inmeiner gesamtenArbeit wedererklärtnochabgewogen.'},[[2,2],[2,2],[1,2],[2,2],[2,2],[1,2]],'Effizienzabwägung ausdrücklich vollständig abwesend, obwohl Freiheit/Ausgleich/Umwelt und Medienanalyse vorhanden sind. Keine Ersatzwertung durch Kriterienlabels.'),
'b5762a90':({1:'60/6=10,80/8=10TeilejeStunde. DieLiteratur und ihreErzählstimmeinterpretiereichausdrücklichnicht.',2:'Film arbeitetmitSchnitt,Sachskizze mitZahlen. Die literarischeForm bleibtunbehandelt; realeHäufigkeit ist nichtbewiesen.',3:'Countdown undSchlangezeigenDringlichkeitoderZugehörigkeit imFilm. DenDialog unddieSprecherperspektivelasseichaus.',5:'IchvergleichnurFilm undBudgetmodell. DieLiteratur bleibtinbeidenFällenaußerhalb meinerDeutung,keine empirischeKaufwirkung istbewiesen.'},[[2,2],[0,2],[1,2],[2,0],[2,2],[1,2]],'Literarische Sprecher-/Innenperspektive in beiden Fällen vollständig abwesend. Zwei Formen ersetzen den geforderten Dreiformenvergleich nicht.'),
'596c02e3':({0:'MeinPlanvergleichtKioskgeldausgaben. IchwähleTagA120alsrepräsentativundrechnefür2TageEinweg60,Mehrweg40.',1:'IchbehaltedieersteMethode bei undführekeine geteilteTagesrechnungoderAggregationsrevision aus.',2:'NachdererstenPrognosewähleichMehrwegwegen20Vorteil. Umwelt undRückgaben sindunbekannt;einezweiteMethodeistnichtausgeführt.',4:'IchbehalteJa/Nein bei,beide sagenJa. NeueFallfragen,Prüfraster underneuteAnwendung werden ausdrücklichausgelassen.',5:'DieKarte erklärtNacherfüllung,beide nennenVerständlichkeit.IchberichteeinSelbsturteil;ein Methoden-/Ergebnisvergleich findetnichtstatt.'},[[2,2],[0,0],[1,1],[2,2],[0,0],[0,1]],'Tatsächlich begründete Methodenänderung mit erneuter Anwendung und Ergebnisvergleich vollständig abwesend. Plan und richtige erste Rechnung genügen nicht.'),
'72f45efc':({1:'CisteinePersonunddeshalbimmerBWL.EineindividuelleHaushaltsfragekannnachmirkeineVWL sein.',4:'CisteineeinzelnePerson,daherBWL;MikroökonomiebehandleichdurchgehendfalschalsnurMehrpersonenwirtschaft.'},[[2,2],[0,0],[2,2],[2,2],[0,0],[2,2]],'Mikroökonomie trotz einzelner Akteure durchgehend falsch; ansonsten richtige Unternehmens-/Marktzuordnung kompensiert dies nicht.'),
'f478f85e':({1:'DieNachbardisziplinen undihrekonkretenBeiträge untersucheichexplizitnicht. NachfrageundBudgetalleinbeschreibenmeinenFokus.',4:'Technische undpsychologischeBeiträgewerdenvollständig ausgelassen; ichnenne nurPreiseundknappeMittel.'},[[2,2],[0,0],[2,2],[2,2],[0,0],[2,2]],'Konkrete relevante Beiträge benachbarter Disziplinen vollständig abwesend; richtige Sozialwissenschaft-/Werkzeugabgrenzung genügt nicht.')}

works=[]
for m in materials:
 gid=m['requires'][0];pre=gid[:8];d=dm[gid];rub=m['examData']['scoring']['steps'];model=[a[0]for a in d['actualSixTaskModelAnswers']]
 # Complete reference solution is an authored solution self-check, not a fresh reviewer answer.
 for kind,answers,marks,cap,reason in [
 ('AUTHOR_MODEL_FULL_SOLUTION_SELF_CHECK',model,[[2,2]]*6,None,'Eigene vollständige Autorenlösung fachlich gegen die sechs eigenen Raster geprüft; kein unabhängiges Urteil.'),
 ('AUTHOR_OWN_FAIR_INCOMPLETE_WHOLE_ANSWER',partial[pre],[[2,1]]*6,None,'Ganze wesentliche Leistungen sind erkennbar, aber Grenzen/Begründungen und einzelne Details bleiben knapp. Kein Perfektionscap.'),
 ('AUTHOR_OWN_WHOLE_ESSENTIAL_ABSENCE_COUNTERANSWER',[absence[pre][0].get(i,a)for i,a in enumerate(model)],absence[pre][1],14,absence[pre][2])]:
  rows=[]
  for i,(answer,pair)in enumerate(zip(answers,marks)):
   assert len(pair)==2 and all(x in(0,1,2)for x in pair)
   rows.append({'stepId':rub[i]['id'],'wholeOwnAnswerDE':answer,'wholeActualPublishedRubricDE':rub[i]['description'],'individualAuthorManualMarksK1K2':pair,'stepMarks':sum(pair),'manualReason':('Beide konkreten Kriterien sind in der eigenen Autorenlösung tragfähig.'if kind.startswith('AUTHOR_MODEL')else 'K1 ist fachlich tragfähig; K2 zeigt einen nachvollziehbaren, knappen richtigen Teil gemäß veröffentlichtem Raster.'if 'FAIR_INCOMPLETE'in kind else reason+' Die vergebenen Teilpunkte beziehen sich ausschließlich auf die hier vorhandenen übrigen Kriterien.')})
  raw=sum(x['stepMarks']for x in rows);final=min(raw,cap)if cap else raw; conditional=pre=='6e138ab0'and cap is None
  works.append({'materialId':m['id'],'coveredGoalId':gid,'kind':kind,'wholeSixOwnAnswersAnd12ManualCriterionDecisions':rows,'rawMarks':raw,'wholeEssentialCap':cap,'capScientificReason':reason,'finalMarks':final,'comparisonToPublishedPassing15':'PASS_UNDER_EXPLICIT_HYPOTHETICAL_ORAL_EVIDENCE_CONDITION'if conditional else'PASS'if final>=15 else'FAIL','oralEvidenceCondition':('A positive numerical grading pattern assumes an actual oral simulation and response; this artifact contains only author-written text and records no actual voice, learner observation or human trial. It is not an observed passed attempt.'if conditional else None),'wholeSubmittedActualSpreadsheetFiles':([]if pre!='e5b070d2'or cap else['own-budget-A-input100-formulas.xlsx','own-budget-A-only-variable115-formulas.xlsx','own-budget-B-year180-formulas.xlsx','own-budget-B-only-year300-formulas.xlsx']),'humanLearningEvidence':False,'independentScienceKEEP':False})
assert len(works)==36 and sum(len(x['wholeSixOwnAnswersAnd12ManualCriterionDecisions'])*2for x in works)==432
put('actual-author-thirtysix-whole-answer-patterns432-manual-criterion-decisions.no-independent-review.json',{'role':'OWN_AUTHOR_CHECKS_NOT_FOREIGN_SCIENCE_KEEP','wholeBody':rec(bodypath),'whole36AuthorWorks':works,'actualWholeWorkObjects':36,'actualManualK1K2Decisions':432,'models12AreOwnPublishedSolutionSelfChecksNotNewIndependentAnswers':True,'ownIncomplete12AndOwnAbsence12AreCompleteWrittenWorks':True,'actualHumanOralEvidence':0,'conditionalOralPatternsExplicit':2,'passesNeverClaimObservedHumanLearning':True,'wholeAbsenceWorkFailCount':sum(w['finalMarks']<15for w in works if'ABSENCE'in w['kind']),'fairPartialNoCapCount':sum(w['wholeEssentialCap']is None and w['finalMarks']>=15for w in works if'INCOMPLETE'in w['kind'])})

checks=[]
def chk(label,actual,expected):
 a=Fraction(actual);e=Fraction(expected);checks.append({'label':label,'actualExactFraction':str(a),'expectedExactFraction':str(e),'pass':a==e});assert a==e,label
chk('Equal daily music price',1*30,30);chk('Retention D percent',Fraction(70,100)*100,70);chk('Retention O percent',Fraction(40,100)*100,40);chk('Retention difference percentage points',70-40,30);chk('Rating difference scale points',8-5,3)
chk('Bike repair remaining budget',75-45,30);chk('Accessory remaining budget',75-60,15);chk('Both options total',45+60,105);chk('X expected cost/year',Fraction(30,1),30);chk('Y expected cost/year',Fraction(80,4),20);chk('Bag X upfront remaining',90-30,60);chk('Bag Y upfront remaining',90-80,10)
chk('Budget A original spending',90+100,190);chk('Budget A original rest',240-90-100-35,15);chk('Budget A variable changed spending',90+115,205);chk('Budget A variable changed rest',240-90-115-35,0);chk('B180 yearly reserve/month',Fraction(180,12),15);chk('B180 rest',360-170-110-15-50,15);chk('B300 yearly reserve/month',Fraction(300,12),25);chk('B300 rest',360-170-110-25-50,5);chk('Annual change',300-180,120);chk('Monthly reserve/rest delta',Fraction(120,12),10)
chk('Speaker repair savings',110-45,65);chk('Speaker repair budget rest',80-45,35);chk('Supplier A40 cost',18*40,720);chk('Supplier B40 cost',15*40,600);chk('Supplier purchasing savings',720-600,120)
chk('Media municipality absolute increase',130000-100000,30000);chk('Media municipality percentage increase',Fraction(30000,100000)*100,30);chk('Model wage weekly increase/person',2*20,40)
chk('Day1 labour productivity',Fraction(60,6),10);chk('Day2 labour productivity',Fraction(80,8),10);chk('Two wants over budget',40+30,70);chk('Clothing rest',60-40,20);chk('Excursion rest',60-30,30)
chk('Kiosk A disposable',Fraction(25,100)*120,30);chk('Kiosk A reusable',14+Fraction(5,100)*120,20);chk('Kiosk B disposable',Fraction(25,100)*60,15);chk('Kiosk B reusable',14+Fraction(5,100)*60,17);chk('Full disposable sum',30+15,45);chk('Full reusable sum',20+17,37);chk('Actual full cost advantage',45-37,8);chk('Initial A representative disposable',30*2,60);chk('Initial A representative reusable',20*2,40);chk('Initial A representative advantage',60-40,20);chk('Initial B representative disposable',15*2,30);chk('Initial B representative reusable',17*2,34);chk('Initial B representative disadvantage',34-30,4)
for m in materials:chk('Rubric six4 total '+m['id'],sum(s['points']for s in m['examData']['scoring']['steps']),24)
put('actual-author-sixty-exact-Fraction-numeric-and-rubric-checks.json',{'role':'OWN_EXECUTED_AUTHOR_ARITHMETIC_NOT_FOREIGN_REVIEW','checks':checks,'actualChecks':len(checks),'actualFailures':sum(not x['pass']for x in checks),'fictionalOriginalModelData':True,'noCausalOrPopulationInference':True})

# Four genuine XLSX workbooks contain explicit cell formulas and cached values.
# Execute formulas by parsing the actual saved worksheet bytes; mutate only the requested input.
NS='http://schemas.openxmlformats.org/spreadsheetml/2006/main'
def evaluate(cells,cell,memo=None):
 memo={}if memo is None else memo
 if cell in memo:return memo[cell]
 x=cells[cell]
 if isinstance(x,(int,float,Decimal)):v=Decimal(str(x))
 else:
  expr=x[1:]
  def summ(match):
   a,b=match.group(1),match.group(2);assert a[0]==b[0];return str(sum(evaluate(cells,f'{a[0]}{i}',memo)for i in range(int(a[1:]),int(b[1:])+1)))
  expr=re.sub(r'SUM\(([A-Z][0-9]+):([A-Z][0-9]+)\)',summ,expr)
  expr=re.sub(r'\b[A-Z][0-9]+\b',lambda z:str(evaluate(cells,z.group(),memo)),expr)
  tree=ast.parse(expr,mode='eval')
  def ev(n):
   if isinstance(n,ast.Expression):return ev(n.body)
   if isinstance(n,ast.Constant):return Decimal(str(n.value))
   if isinstance(n,ast.BinOp):
    a,b=ev(n.left),ev(n.right)
    if isinstance(n.op,ast.Add):return a+b
    if isinstance(n.op,ast.Sub):return a-b
    if isinstance(n.op,ast.Mult):return a*b
    if isinstance(n.op,ast.Div):return a/b
   raise ValueError(ast.dump(n))
  v=ev(tree)
 memo[cell]=v;return v
def save_xlsx(filename,cells,labels):
 p=O/filename;assert not p.exists()
 rows=[]
 for row in sorted(int(x[1:])for x in cells):
  ref=f'B{row}';v=cells[ref];label=labels.get(row,'')
  formula=f'<f>{v[1:]}</f>'if isinstance(v,str)else''
  rows.append(f'<row r="{row}"><c r="A{row}" t="inlineStr"><is><t>{label}</t></is></c><c r="{ref}">{formula}<v>{evaluate(cells,ref)}</v></c></row>')
 contents={
 '[Content_Types].xml':'<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>',
 '_rels/.rels':'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
 'xl/workbook.xml':f'<workbook xmlns="{NS}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Budget" sheetId="1" r:id="rId1"/></sheets><calcPr calcId="191029" fullCalcOnLoad="1" forceFullCalc="1"/></workbook>',
 'xl/_rels/workbook.xml.rels':'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>',
 'xl/worksheets/sheet1.xml':f'<worksheet xmlns="{NS}"><sheetData>{"".join(rows)}</sheetData></worksheet>'}
 with zipfile.ZipFile(p,'w',zipfile.ZIP_DEFLATED)as z:
  for n,b in contents.items():z.writestr(n,b)
 with zipfile.ZipFile(p)as z:
  assert z.testzip()is None;root=ET.fromstring(z.read('xl/worksheets/sheet1.xml'));parsed={};cache={}
  for c in root.findall(f'.//{{{NS}}}c'):
   r=c.attrib['r'];f=c.find(f'{{{NS}}}f');v=c.find(f'{{{NS}}}v')
   if v is None:continue
   parsed[r]='='+f.text if f is not None else Decimal(v.text);cache[r]=Decimal(v.text)
  actual={k:str(evaluate(parsed,k))for k in parsed};assert all(Decimal(actual[k])==cache[k]for k in parsed)
 return {'file':rec(p),'actualSavedCells':parsed,'actualSavedFormulaEvaluation':actual,'formulaCount':sum(isinstance(x,str)for x in parsed.values()),'actualZipAndXMLValidation':True,'realOfficeApplicationOpened':False,'humanLearnerEvidence':False}
A={'B2':240,'B3':90,'B4':100,'B5':35,'B6':'=SUM(B3:B4)','B7':'=B2-B6-B5'};Ac=copy.deepcopy(A);Ac['B4']=115
B={'B2':360,'B3':170,'B4':110,'B5':180,'B6':50,'B7':'=B5/12','B8':'=SUM(B3:B4)+B7','B9':'=B2-B8-B6'};Bc=copy.deepcopy(B);Bc['B5']=300
spread=[save_xlsx(n,c,l)for n,c,l in[
 ('own-budget-A-input100-formulas.xlsx',A,{2:'Income',3:'Fixed spending',4:'Variable spending',5:'Saving goal',6:'Spending sum',7:'Remainder'}),
 ('own-budget-A-only-variable115-formulas.xlsx',Ac,{2:'Income',3:'Fixed spending',4:'Variable spending',5:'Saving goal',6:'Spending sum',7:'Remainder'}),
 ('own-budget-B-year180-formulas.xlsx',B,{2:'Income',3:'Fixed spending',4:'Variable spending',5:'Annual payment',6:'Saving goal',7:'Monthly reserve',8:'Spending plus reserve',9:'Remainder'}),
 ('own-budget-B-only-year300-formulas.xlsx',Bc,{2:'Income',3:'Fixed spending',4:'Variable spending',5:'Annual payment',6:'Saving goal',7:'Monthly reserve',8:'Spending plus reserve',9:'Remainder'})]]
assert [k for k in A if A[k]!=Ac[k]]==['B4'];assert [k for k in B if B[k]!=Bc[k]]==['B5']
put('actual-own-four-XLSX-linked-budget-products-parsed-formulas-and-two-real-input-mutations.json',{'role':'ACTUALLY_SAVED_AND_PARSED_OWN_AUTHOR_PRODUCTS','workbooks':spread,'actualWorkbookCount':4,'executedSavedFormulaCount':sum(x['formulaCount']for x in spread),'changedInputsOnlyA_B4_B_B5':True,'bothOriginalAndChangedFormulaStringsExact':True,'noOfficeOrHumanObservedAcceptanceClaim':True})
put('actual-own-media-two-target-audiences-written-and-table-products.no-oral-observation.json',{'role':'OWN_AUTHOR_WRITTEN_AND_MEDIA_PRODUCTS_NOT_ORAL_EVIDENCE','youthWrittenCard':'Reparatur prüfen: 45 Euro im80-Euro-Budget, möglicher weiterer Nutzen, keine Jahresgarantie. Ersatz110 braucht weitere Mittel.','youthMediaTable':{'columns':['Option','Euro','Budget fit','Uncertainty'],'rows':[['Reparatur',45,'35remaining','Follow-up defects'],['Replacement',110,'30short','No financing supplied'],['Budget',80,'Limit','Model only']]},'managementWrittenBrief':'A720/B600: Priorität ist der Bedarf von40Einheiten in3Tagen bei knappem Lager. Averlässlich2Tage,B1–8Tage. Einkaufsvorteil120istkeinGesamtvorteil; ohneRisikodatenbedingtA.','managementMediaTable':{'columns':['Supplier','Units','UnitEuro','TotalEuro','Days'],'rows':[['A',40,18,720,'2 reliable'],['B',40,15,600,'1–8']]},'actualOralRecording':False,'actualHumanTrial':False,'transcriptDoesNotReplaceActualOralPerformance':True})
print(json.dumps({'works':len(works),'marks':432,'exactChecks':len(checks),'xlsx':4,'ownScopeOrScienceApproval':False}))
