import copy
import hashlib
import json
import uuid
from pathlib import Path

BASE = Path(__file__).resolve().parent
ROOT = Path('/home/enpasos/projects/skillpilot')
read = lambda p: json.loads(Path(p).read_text())
sha = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()
def write(name, data):
    (BASE / name).write_text(json.dumps(data, ensure_ascii=False, indent=2)+'\n')
def uid(name):
    return str(uuid.uuid5(uuid.NAMESPACE_URL, 'skillpilot:economics:bounded-terminal:20261009:'+name))

def terminal(key, title, en, desc, den, phase, requires, covered, task, solution, points):
    return {'id':uid(key), 'title':title,'titleEn':en,'description':desc,'descriptionEn':den,
            'weight':1,'tags':['GK','LK','Practice','Assessment'],'contains':[],'requires':requires,
            'type':'atomic','phase':phase,'dimensionTags':{'framework':'canonical-gymnasium-economics','demandLevel':'AB3','phase':phase},
            'extendedData':{'applicabilityFromRequires':True},
            'examData':{'reviewStatus':'draft','coveredGoalIds':covered,'coveredStrands':['WW_WIRTSCHAFT'],
                        'demandLevels':['AB1','AB2','AB3'],'taskContent':task,'solutionContent':solution,
                        'scoring':{'maxPoints':sum(p[0] for p in points),'passingPoints':14 if sum(p[0] for p in points)==22 else (15 if sum(p[0] for p in points)==24 else 18),
                                   'steps':[{'id':'s'+str(i+1),'points':p[0],'description':p[1]} for i,p in enumerate(points)]}}}

conj = terminal('business-cycle-four', 'Q2: Konjunkturbefund, Prognosen und Fiskalpolitik beurteilen',
 'Q2: assess business-cycle evidence, forecasts and fiscal policy',
 'Die lernende Person kann in einem neuen Konjunkturfall Indikatoren und Prognoseannahmen prüfen, zeitlich unterschiedliche fiskalpolitische Maßnahmen vergleichen und ein bedingtes Urteil unter den vier Zielen des Stabilitäts- und Wachstumsgesetzes begründen.',
 'The learner can examine indicators and forecast assumptions in a new business-cycle case, compare fiscal measures with different timing and justify a conditional judgement under the four objectives of the Stability and Growth Act.',
 'Q2',['6f1f4654-35ab-5ba6-a329-b19b994e84cc'],
 ['a773d8a6-3b0d-5ab5-a914-ca234e7fb813','550a050a-36bb-5b9e-ae0a-1afc7f9a0df0','0e5b12a1-68bd-5838-8e70-02b3e7f2518a','6f1f4654-35ab-5ba6-a329-b19b994e84cc'],
 '''**Fall: Uneinheitliche Konjunktursignale und zwei Maßnahmen**

Alle Daten betreffen die erfundene Volkswirtschaft Novaria. Es wird eine begrenzte Beurteilung der bereitgestellten Daten verlangt, keine sichere Vorhersage oder Berechnung eines Multiplikators. Die Quartale A–D folgen direkt aufeinander.

**Material 1 – beobachtete Indikatoren:**

| Indikator | A | B | C | D |
| --- | ---: | ---: | ---: | ---: |
| Reales BIP, saisonbereinigter Index | 100 | 99 | 99,5 | 100,5 |
| Arbeitslosenquote in % | 4,5 | 5,2 | 5,6 | 5,3 |
| Auftragseingänge, saisonbereinigter Index | 97 | 95 | 103 | 107 |
| Verbraucherpreisinflation, jeweils gegenüber dem Vorjahresquartal, in % | 3,8 | 4,2 | 3,1 | 2,4 |

Auftragseingänge können zukünftige Produktion anzeigen, Aufträge können aber storniert werden. Beschäftigung reagiert häufig verzögert. Das Produktionspotenzial und die Länge eines vollständigen Zyklus sind nicht gegeben. Für das gesamte letzte Jahr beträgt der Leistungsbilanzsaldo −4 % des BIP. Kurzfristige Fremdwährungskredite sind eine wichtige Finanzierungsquelle; weitere Außenwirtschaftsdaten fehlen. Der jährliche Saldo darf nicht mit einer quartalsweisen BIP-Änderung gleichgesetzt werden.

**Material 2 – Prognoseansätze für die nächsten vier Quartale:** Prognose A schreibt allein das jüngste BIP-Wachstum zwischen C und D statistisch fort. Sie unterstellt, dass dieses Muster ohne neue Störung anhält. Prognose B verwendet ein Verhaltensmodell für Konsum, Exportnachfrage und staatliche Nachfrage. Bei unverändertem Exportumfeld und ohne neue Maßnahme ergibt ihr Szenario 0,7 % reales Jahreswachstum; bei rascher Auszahlung der Maßnahme T und gleichbleibenden anderen Bedingungen 1,5 %. Parameter und Werte sind Modellannahmen, keine beobachteten Wirkungen. Eintrittswahrscheinlichkeiten fehlen. Ein möglicher neuer Energiepreisschock wurde in keinem der Ansätze abgebildet. Die Zahlen A und B beziehen sich auf unterschiedliche Auswertungszeiträume und sind nicht unmittelbar als gleichartige Jahresprognosen zu vergleichen.

**Material 3 – fiskalpolitische Vorschläge:** Maßnahme I finanziert die bereits als notwendig festgestellte Instandsetzung öffentlicher Brücken. Der Staat erhöht seine Ausgaben und nimmt dafür Kredite auf. Wegen Planung und Vergabe beginnt die zusätzliche Bautätigkeit frühestens in neun Monaten; die heutige Baukapazität ist nahezu ausgelastet. Maßnahme T finanziert über zusätzliche Kredite eine befristete sofortige Zahlung an Haushalte mit niedrigen Einkommen. Das Material erwartet eine höhere zusätzliche Konsumneigung dieser Gruppe, ein Teil zusätzlicher Ausgaben entfällt aber auf Importe. Verlässliche Größen dieser Effekte fehlen. Beide Vorschläge können Nachfrage erhöhen; Höhe, Verteilung und Zeitlage der Wirkung sind nicht garantiert.

**Material 4 – gesetzlicher Zielrahmen, sinngemäß:** § 1 StabG verlangt bei wirtschafts- und finanzpolitischen Maßnahmen von Bund und Ländern im Rahmen der marktwirtschaftlichen Ordnung das gemeinsame Hinwirken auf stabiles Preisniveau, hohen Beschäftigungsstand, außenwirtschaftliches Gleichgewicht sowie stetiges und angemessenes Wirtschaftswachstum. Die Vorschrift nennt hier weder einen bestimmten Inflationsprozentsatz noch eine zwingend saldierte Leistungsbilanz von null. Quelle: [§ 1 StabG](https://www.gesetze-im-internet.de/stabg/__1.html), geprüft am 9. Oktober 2026. Das deutsche Gesetz wird für diese fiktive Unterrichtsbeurteilung als bereitgestellter Zielrahmen verwendet.

**Aufgaben – 30 BE:**

1. Beschreiben und deuten Sie anhand mindestens dreier unterschiedlicher Indikatoren den Konjunkturverlauf A–D. Prüfen Sie die Behauptungen „Die niedrigere Inflation in D bedeutet Deflation“ und „D beweist bereits eine dauerhafte Hochkonjunktur“. **(6 BE)**
2. Vergleichen Sie die beiden Prognoseansätze nach Informationsgrundlage und Annahmen. Erläutern Sie je eine konkrete Unsicherheit und begründen Sie, welche Aussage die beiden Szenarien von B zulassen und welche nicht. Beachten Sie die unterschiedlichen Zeitbezüge. **(8 BE)**
3. Vergleichen Sie I und T hinsichtlich Wirkungskette, Zeitverzögerung, Importeffekt und möglicher Preis-/Verschuldungsfolgen. Begründen Sie eine bedingte Entscheidung für die kurzfristige Stabilisierung; berücksichtigen Sie dabei den eigenständigen längerfristigen Brückenbedarf. **(8 BE)**
4. Wenden Sie alle vier Ziele aus Material 4 auf den Fall an. Erörtern Sie mindestens einen materialgebundenen Zielkonflikt und begründen Sie, warum der Leistungsbilanzsaldo allein weder die richtige Maßnahme noch ein gesetzliches Nullsaldoziel beweist. **(8 BE)**
''',
 '''1. BIP fällt A→B, steigt anschließend; Aufträge erholen sich schon deutlich C/D, Arbeitslosenquote steigt zunächst weiter und fällt erst D. Das passt zu Abschwächung und Anzeichen einer Erholung, nicht zu einer bewiesenen dauerhaften Hochkonjunktur. Inflation D ist mit 2,4 % weiterhin positiv; Preise steigen gegenüber dem Vorjahresquartal, nur langsamer. Ohne Potenzial, weitere Quartale und verlässliche Auftragsrealisierung ist eine feste Zyklusdiagnose begrenzt. **6 BE: drei unterschiedliche Indikatoren richtig im Verlauf mit Zusammenhang je 1 (3); positive Inflation statt Deflation 1; begründete Erholungsdeutung 1; konkrete Grenze der Dauer-/Hochkonjunkturbehauptung 1.**

2. A extrapoliert die letzte beobachtete BIP-Änderung und benötigt die Stabilität dieses Musters; B bildet angenommene Verhaltens- und Nachfragezusammenhänge unter konkreten Szenarien ab. A vernachlässigt mögliche Strukturbrüche; B kann an falschen Parametern oder verändertem Exportumfeld scheitern. Der nicht erfasste Energiepreisschock kann beide treffen. Die B-Differenz 0,8 Prozentpunkte ist ein bedingter Modellunterschied bei gleichbleibenden übrigen Annahmen, kein gemessener kausaler Effekt und keine sichere oder wahrscheinlichkeitgewichtete Prognose. Eine einzelne Quartalsrate und das Jahreswachstum sind keine direkt vergleichbaren Größen. **8 BE: unterschiedliche Grundlage und je zugehörige Annahme je 2 (4); je konkrete Unsicherheit 1 (2); bedingter Szenariounterschied statt Garantie/empirischer Wirkung 1; Zeitbezüge korrekt 1.**

3. I erhöht erst bei tatsächlicher Bautätigkeit Nachfrage und Beschäftigung; neun Monate Verzögerung und heute ausgelastete Baukapazität begrenzen den kurzfristigen Impuls und können bei unveränderter Auslastung Preis-/Verdrängungsdruck erzeugen. T wirkt über verfügbares Einkommen und zusätzlichen Konsum potenziell schneller; Importanteile schwächen die zusätzliche Inlandsnachfrage und können den außenwirtschaftlichen Saldo belasten. Beide erhöhen bei Kreditfinanzierung die Verschuldung; deren Tragfähigkeit ist ohne weitere Daten nicht entschieden. Für rasche Stabilisierung lässt sich T unter wirksamer Zielgruppenansprache und akzeptablen Preis-/Finanzierungsrisiken begründen. I bleibt wegen des angegebenen Infrastrukturbedarfs separat relevant; seine spätere Nachfragewirkung muss zur dann herrschenden Lage passen. Andere bedingte, materialgebundene Urteile gelten gleichwertig. **8 BE: je nachvollziehbare Wirkungskette 1 (2); unterschiedliche Zeitlage/Kapazitätsgrenze 2; Importmechanismus 1; Preis- und Verschuldungsgrenze 1; begründete bedingte Entscheidung einschließlich längerfristigem Brückenbedarf 2.**

4. Preisstabilität: weiterhin steigendes Preisniveau, fallende Rate und möglicher zusätzlicher Preisdruck. Hoher Beschäftigungsstand: höhere Arbeitslosigkeit als A, erste Verbesserung D; stabilisierende Nachfrage kann unterstützen. Stetiges/angemessenes Wachstum: BIP-Rückgang und beginnende Erholung, Unsicherheit über Fortsetzung und Potenzial. Außenwirtschaftliches Gleichgewicht: Defizit und kurzfristige Fremdwährungsfinanzierung sind zu prüfen; zusätzliche Importnachfrage kann Abhängigkeit/Risiko erhöhen, aber das Vorzeichen allein beweist kein pauschales Urteil. Zielkonflikt etwa kurzfristige Beschäftigungs-/Wachstumsstützung versus Preis- oder außenwirtschaftlicher Druck. § 1 setzt einen gemeinsamen Zielrahmen ohne im Material feste numerische Schwellen; daraus folgt weder zwingend ein Nullsaldo noch eine einzige Maßnahme. **8 BE: alle vier Ziele je mit sachlich passendem Fallbezug 1 (4); ein konkreter Mechanismus des Zielkonflikts 2; begrenzte Aussage des Saldos 1; kein erfundenes gesetzliches Nullsaldoziel/Alleinentscheid 1.**
''',[(6,'Mehrere Konjunkturindikatoren und begrenzte Phasendeutung'),(8,'Zwei Prognosemethoden, Zeitbezüge und bedingte Szenarien'),(8,'Fiskalpolitische Mechanismen, Verzögerungen und bedingtes Urteil'),(8,'Alle vier StabG-Ziele und tatsächlicher Zielkonflikt')])

ngo = terminal('development-trade-ngos','Q4: Handelsabhängigkeit und NGO-Beteiligung analysieren',
 'Q4: analyse trade dependence and NGO participation',
 'Die lernende Person kann in einem neuen Entwicklungsfall Handelsabhängigkeiten anhand bereitgestellter Daten darstellen, Rollen und Grenzen von NGOs und Zivilgesellschaft analysieren und eine bedingte Gestaltung der Zusammenarbeit begründen.',
 'The learner can represent trade dependencies using provided data in a new development case, analyse the roles and limits of NGOs and civil society and justify a conditional design for cooperation.',
 'Q4',['2d8cc4f2-9ee2-5d9c-a019-7d3a1e9a1db2','ac76810e-3f06-570a-b770-8b57acb55d1c'],['2d8cc4f2-9ee2-5d9c-a019-7d3a1e9a1db2','ac76810e-3f06-570a-b770-8b57acb55d1c'],
 '''**Fall: Exportabhängigkeit und ein Kooperationsangebot**

Land, Organisationen und Zahlen sind erfunden. Es geht um die im Material beschriebenen Handels- und Beteiligungsfragen; eine vollständige Entwicklungsstrategie oder eine generelle Bewertung aller NGOs wird nicht verlangt.

**Material 1 – Außenhandel des Landes Kitala:** Die jährlichen Exporterlöse betragen 100 Mio. EUR: 80 Mio. aus unverarbeitetem Kakao und 20 Mio. aus sonstigen Waren. Ein einziger ausländischer Absatzmarkt kauft 60 % der gesamten Exporterlöse. Im betrachteten Preisrückgang sinkt allein der Weltmarktpreis für den exportierten Kakao um 20 %; ausgeführte Mengen, Wechselkurs und Preise der anderen Waren bleiben unverändert. Die Werte sind Bruttoerlöse; Produktionskosten, Importe und die Verteilung auf einzelne Haushalte fehlen. Der Kakao wird bisher überwiegend unverarbeitet ausgeführt. Eine örtliche Genossenschaft schlägt Schulung und gemeinsame Vertragsverhandlungen vor; sie kann nicht selbst den Weltmarktpreis festsetzen.

**Material 2 – Beteiligte und Angebote:** Eine unabhängige NGO bietet für zwei Jahre fachliche Schulung, unabhängige verständliche Prüfung der Exportverträge und Unterstützung eines offenen örtlichen Beteiligungsausschusses an. Sie finanziert 70 % ihres Programms aus einem ausländischen befristeten Fördertopf, 30 % aus eigenen Spenden. Der Förderer verlangt halbjährlich dokumentierte Ergebnisse. Ein Exportunternehmen bietet besseren Transport und einen dreijährigen exklusiven Liefervertrag an; Erlös- und Kündigungsbedingungen müssen noch geprüft werden. Die Regierung genehmigt das Vorhaben und legt die rechtlichen Rahmenbedingungen fest. Im örtlichen Ausschuss sollen gewählte Genossenschaftsmitglieder, nicht organisierte Kleinbetriebe und Beschäftigte mitwirken. Eine Gruppe befürchtet, dass große Genossenschaftsmitglieder den Ausschuss dominieren und Schulungszeiten kleine Betriebe ausschließen. Die NGO kann beraten und Öffentlichkeit schaffen, besitzt aber keine staatliche Gesetzgebungs- oder Steuerbefugnis und keine automatische Vertretungsmacht für alle Bewohner.

**Material 3 – vorläufige Beobachtung:** Nach sechs Monaten nehmen 40 Betriebe an den freiwilligen Schulungen teil; sie berichten im Durchschnitt günstigere Vertragsbedingungen. Andere Betriebe berichten zugleich, dass ein konkurrierender Käufer neue Angebote gemacht hat. Vorherige Vertragsdaten, Auswahlgründe und eine vergleichbare Kontrollgruppe fehlen. Für die Zeit nach Förderende ist keine Anschlussfinanzierung vereinbart.

**Aufgaben – 24 BE:**

1. Stellen Sie die beiden im Material belegten Handelsabhängigkeiten dar. Berechnen und interpretieren Sie die gesamten Exporterlöse nach dem Preisrückgang und grenzen Sie ab, was über Haushaltseinkommen und eine vollständige Handelsbilanz nicht ableitbar ist. **(8 BE)**
2. Analysieren Sie konkrete Rollen und Grenzen der NGO, der Zivilgesellschaft sowie von Unternehmen und Staat. Beziehen Sie Finanzierung, Vertretung und den Interessenkonflikt in die Analyse ein; prüfen Sie die Behauptung „Unabhängige NGOs vertreten automatisch alle Betroffenen und ersetzen staatliche Aufgaben“. **(8 BE)**
3. Entwickeln Sie zwei materialgebundene Bedingungen für eine tragfähige Kooperation. Begründen Sie eine bedingte Einschätzung des exklusiven Vertrags und der NGO-Beteiligung. Erläutern Sie, welche Aussage Material 3 zur Wirksamkeit zulässt und welche zusätzliche Information erforderlich wäre. **(8 BE)**
''',
 '''1. Produktabhängigkeit: 80 % der Exporterlöse aus einem unverarbeiteten Rohstoff, anfällig für dessen Preisänderung; Absatzmarktabhängigkeit: 60 % insgesamt von einem Auslandsmarkt, dessen Ausfall oder Nachfragerückgang schwer wiegen könnte. Nach Preisschock 80·0,8=64 Mio. Kakao plus 20 Mio. andere Exporte =84 Mio.; Gesamtrückgang 16 Mio. bzw. 16 %, nicht 20 % sämtlicher Exporte. Preis und Menge müssen getrennt werden. Ohne Kosten/Verteilung ist das keine Rechnung der Nettoeinkommen einzelner Haushalte; ohne Importe ist keine vollständige Handelsbilanz berechenbar. **8 BE: zwei verschiedene Abhängigkeiten mit richtigem Datenbezug je 2 (4); Ansatz und 84 Mio./−16 % 2; Nettoeinkommensgrenze 1; fehlende Importe/Handelsbilanzgrenze 1.**

2. NGO: Wissen/Vertragsprüfung, Vermittlung und Öffentlichkeit können Informations- und Verhandlungsmöglichkeiten verbessern. Zivilgesellschaft: organisiert Interessen und Beteiligung; Repräsentation muss tatsächlich hergestellt werden und unterschiedliche Gruppen einschließen. Unternehmen: Transport und Abnahme mit eigenen Geschäftsinteressen; Exklusivität kann Zugang sichern, aber Wechselmöglichkeiten und Verhandlungsspielraum beschränken. Staat: rechtlicher Rahmen/Genehmigung, durch NGO nicht ersetzt. Befristete ausländische Finanzierung schafft Rechenschaft, aber auch Abhängigkeit und ein Anschlussrisiko; Unabhängigkeit vom Staat bedeutet nicht Interessenfreiheit oder automatische demokratische Legitimation. Die Sorge kleiner Betriebe muss konkret berücksichtigt werden. **8 BE: je konkrete Rolle/Grenze von NGO, Zivilgesellschaft, Unternehmen, Staat 1 (4); Finanzierungs-/Anschlussabhängigkeit 1; Vertretungsproblem/Interessenkonflikt 1; pauschale Automatik und Staatsersatz begründet zurückgewiesen 2.**

3. Etwa nachvollziehbare Auswahl, tatsächliche Vertretung kleiner/unorganisierter Betriebe und passende Schulungszeiten; oder transparente Vertragsprüfung mit Kündigungs-/Preisregeln und unabhängiger Beschwerdemöglichkeit; oder tragfähige Anschlussfinanzierung unter örtlicher Mitentscheidung. Zwei verschiedene Bedingungen werden konkret aus dem Material abgeleitet. Exklusivität kann Transport/Absatz ermöglichen, muss aber nach Preisbindung, Kündigung und Abhängigkeit geprüft werden; NGO-Beratung kann helfen, ohne deren Vertretung oder Erfolg zu garantieren. Die Berichte nach sechs Monaten sind ein Hinweis auf beobachtete Veränderungen bei freiwilligen Teilnehmern, kein kausaler Wirksamkeitsbeweis: Selbstselektion und neue Konkurrenzangebote sind alternative Erklärungen. Zusätzlich etwa frühere vergleichbare Vertragsdaten, Auswahlgründe und passende Vergleichsbetriebe; finanzielle Nachhaltigkeit bedarf einer eigenen Anschlussprüfung. Andere schlüssige bedingte Urteile sind gleichwertig. **8 BE: zwei konkrete Kooperationsbedingungen mit Begründung je 2 (4); materialgebundenes bedingtes Vertrags-/NGO-Urteil 2; keine gesicherte Kausalität mit Alternativerklärung 1; passende Zusatzinformation 1.**
''',[(8,'Handelsstruktur, berechneter Preisschock und Aussagegrenzen'),(8,'NGO-/Zivilgesellschaftsrollen, Interessen, Vertretung und Finanzierung'),(8,'Bedingte Kooperation und begrenzte Wirkungsevidenz')])

inputs=read(BASE/'inputs/root300.CAN389.before.json')
goals={g['id']:g for g in inputs['goals']}
old=goals['241d7c79-efdf-5425-8c03-115739dce004']['examData']
material=old['taskContent'].split('**Material 2')[1].split('**Aufgaben')[0]
material='**Material 1'+material.replace('**Material 3','**Material 2')
tasks=old['taskContent'].split('**Aufgaben')[1].split('\n2. ')[1]
tasks='1. '+tasks.replace('\n3. ','\n2. ')
solution=old['solutionContent'].split('\n\n2. ')[1]
solution='1. '+solution.replace('\n\n3. ','\n\n2. ').replace('Die getrennten Modellmodule dürfen nicht zu einer angeblichen tatsächlichen Gesamtbilanz der Investitionsentscheidung verbunden werden.','Die beiden getrennten Modellmodule dürfen nicht zu einer tatsächlichen Gesamtbilanz der Investitionsentscheidung verbunden werden.')
finance=terminal('finance-investment-and-spreadsheet','Q2: Investitionen und Finanzkennzahlen selbstständig beurteilen',
 'Q2: assess investments and financial ratios independently',
 'Die lernende Person kann in einem neuen bereitgestellten Unternehmensfall Investitionen statisch und dynamisch unter Szenario- und qualitativen Bedingungen beurteilen sowie Finanz- und Ertragslage mit überprüften Tabellenkalkulationskennzahlen darstellen und deren Aussagegrenzen erklären.',
 'The learner can assess investments using static and dynamic methods under scenario and qualitative conditions in a new supplied business case, represent financial position and performance using checked spreadsheet ratios and explain their limitations.',
 'Q2',['8e8a672e-67c6-52dd-8f87-3c1f2e874a3d','9219c58c-d178-5612-8231-feac373c87df'],['8e8a672e-67c6-52dd-8f87-3c1f2e874a3d','9219c58c-d178-5612-8231-feac373c87df'],
 '**Fall: Zwei abgegrenzte Unternehmensentscheidungen**\n\nAlle Angaben sind erfundene Unterrichtsmaterialien und keine Empfehlung für ein reales Unternehmen. Die Investitionsrechnung und der vereinfachte Jahresabschluss sind getrennte Modellmodule und dürfen nicht zu einem angeblichen tatsächlichen Gesamtabschluss der Investition verbunden werden. Steuern bleiben in beiden Modulen ausgeblendet.\n\n'+material+'**Aufgaben – 22 BE:**\n\n'+tasks,solution,
 [(14,'Vollständiger statischer/dynamischer Vergleich, schwache Szenarien, Risiko und qualitative Einflüsse'),(8,'Drei Finanz-/Ertragskennzahlen, echte Zellformeln, tatsächlicher Eingabetest und Aussagegrenze')])

assets=terminal('money-purchasing-power-investment','E: Anlagekriterien und Kaufkraft in einem Modellfall abwägen',
 'E: weigh investment criteria and purchasing power in a model case',
 'Die lernende Person kann in einem fiktiven Anlagefall Ziel und Zeithorizont mit Liquidität, Sicherheit, erwarteter Rendite und vorgegebenen ethischen Kriterien abgleichen, nominalen und realen Geldwert unterscheiden und die Geldfunktionen für ein bedingtes Urteil nutzen.',
 'The learner can relate goals and time horizon to liquidity, safety, expected return and supplied ethical criteria in a fictional investment case, distinguish nominal and real money values and use the functions of money for a conditional judgement.',
 'E',['047ce369-b605-5cc6-8363-c5d288f5e938'],['047ce369-b605-5cc6-8363-c5d288f5e938'],
 '''**Fall: Zahlungsreserve und ein langfristiges Modellangebot**

Alle Personen und Angebote sind frei erfundene Unterrichtsmodelle. Es werden keine realen Finanzprodukte, Anbieter oder individuellen Anlageentscheidungen empfohlen. Die angegebenen Eigenschaften gelten nur in den jeweiligen Modellen; reale Garantien, Kosten oder Rechtsansprüche werden daraus nicht abgeleitet.

**Material 1 – Ziel und Alternativen:** Lea benötigt eine fest eingeplante Zahlung von 1.000 EUR spätestens in drei Monaten. In diesem Fall besitzt Lea keine andere Reserve für diese Zahlung. Modell A hält die 1.000 EUR jederzeit unmittelbar verfügbar und im Modell nominal sicher; es bietet bis zum Zahlungstermin keine Verzinsung. Modell B bindet die 1.000 EUR für drei Jahre ohne vorzeitige Auszahlungsmöglichkeit. Sein Bericht erwartet höhere Erträge, weist aber ausdrücklich auch auf mögliche Verluste des Ausgangsbetrags hin; ein Ertrag wird nicht zugesagt. A erfüllt das von Lea im Modell gewählte ethische Kriterium einer offengelegten Mittelverwendung. Bei B fehlen prüfbare Angaben zur Mittelverwendung. Dass ein Betrag verfügbar ist, belegt für sich allein nicht seine Sicherheit; in A sind dies zwei gesondert vorgegebene Eigenschaften.

**Material 2 – getrennter Kaufkraftvergleich:** Unabhängig von Leas Dreimonatszahlung steigt in einem zweiten Unterrichtsmodell ein nominales Guthaben von 100 EUR auf 103 EUR innerhalb eines Jahres. Ein unveränderter Vergleichswarenkorb kostet anfangs 100 EUR, nach einem Jahr 105 EUR. Gebühren und Steuern fehlen in diesem Modell. Für den Vergleich der Kaufkraft wird derselbe Korb verwendet. Allgemeine Preissteigerung vermindert die Kaufkraft eines unveränderten Geldbetrags; eine höhere nominale Summe allein beweist noch keinen realen Gewinn. Hintergrund: [EZB, What is inflation?](https://www.ecb.europa.eu/ecb-and-you/explainers/tell-me-more/html/what_is_inflation.en.html), geprüft am 9. Oktober 2026.

**Material 3 – Geldfunktionen und Variante:** Geld dient als Zahlungsmittel, gemeinsame Recheneinheit und Mittel zur Wertaufbewahrung. Letztere Funktion garantiert keine unveränderte Kaufkraft. In einer getrennten Variante hat Lea die Dreimonatszahlung bereits anderweitig nominal sicher und verfügbar zurückgelegt. Für weitere Mittel steht nun ein längerer Zeithorizont zur Verfügung; Verlusttragfähigkeit und die fehlenden ethischen Informationen zu B sind aber noch zu klären.

**Aufgaben – 24 BE:**

1. Vergleichen Sie A und B für Leas ursprüngliches Ziel anhand von Zeithorizont, Liquidität, Sicherheit, erwarteter Rendite und dem gegebenen ethischen Kriterium. Begründen Sie ein fallgebundenes Urteil und prüfen Sie „Höhere erwartete Rendite löst das Reserveproblem immer“. **(8 BE)**
2. Berechnen und deuten Sie im getrennten Jahresmodell die nominale und die reale Änderung. Verwenden Sie den Warenkorb als Bezug und erklären Sie, warum weder +3 EUR noch −2 Prozentpunkte unmittelbar die exakte reale Änderungsrate angeben. **(8 BE)**
3. Erklären Sie alle drei Geldfunktionen am Fall. Begründen Sie, was sich im Urteil durch die Variante ändert und welche zwei Informationen für eine weitere Abwägung erforderlich bleiben. Prüfen Sie, ob ein längerer Zeithorizont B automatisch sicher oder ethisch passend macht. **(8 BE)**
''',
 '''1. Ziel ist die feststehende Zahlung in drei Monaten, nicht die Maximierung eines ungewissen Dreijahresertrags. A erfüllt nach den ausdrücklich gegebenen Modellbedingungen Verfügbarkeit und nominale Sicherheit; es bietet keinen Ertrag und erfüllt das vorgegebene Transparenzkriterium. B bleibt drei Jahre gebunden, kann Verluste bringen und liefert nur eine unsichere Ertragserwartung; seine Mittelverwendung ist unklar. Die höhere erwartete Rendite schafft weder Zugang in drei Monaten noch sicheres Zahlungskapital. Fallbezogen passt A zur notwendigen Reserve; daraus folgt keine allgemeine Rangfolge realer Produkte. Liquidität und Sicherheit sind verschiedene Kriterien. **8 BE: Ziel/Zeithorizont 1; konkrete Liquiditätsunterscheidung 1; Sicherheits-/Verlustunterscheidung 1; Erwartung statt Zusage 1; gegebenes ethisches Kriterium/Informationslücke 1; fallgebundene Reserveentscheidung mit Mechanismus 2; getrennte Liquiditäts-/Sicherheitsbegriffe 1.**

2. Nominal +3 EUR bzw. +3 %. Der Korb verteuert sich um 5 %. Anfangs kauft das Guthaben genau einen Korb, am Ende 103/105≈0,980952 Körbe. Reale Änderung gegenüber der ursprünglichen Korbmenge: 103/105−1≈−0,019048=−1,9048 %, etwa −1,9 %. Alternativ entsprechen 103 EUR etwa 98,10 EUR ursprünglicher Kaufkraft. +3 EUR beschreibt die nominale Änderung; 3−5=−2 Prozentpunkte ist eine Näherung der Realrate, nicht die exakte Quotientenrechnung. Die nominale Summe wächst, die Kaufkraft sinkt. Der getrennte Jahresvergleich darf nicht als zugesagter Ertrag von A oder B bzw. für die Dreimonatsreserve ausgegeben werden. **8 BE: nominale Änderung mit Bezugsgröße 1; Warenkorbsteigerung 1; richtiger Quotientenansatz 2; etwa −1,9 % mit Deutung 2; EUR/Prozentpunkte/exakte Rate korrekt unterschieden 1; getrennte Zeit-/Modellbindung 1.**

3. Zahlungsmittel: die fällige Zahlung benötigt verfügbares Geld. Recheneinheit: Zahlung, Guthaben und Warenkorb werden in EUR verglichen, obwohl verschiedene Zeitpunkte/nominale Kaufkraft berücksichtigt werden müssen. Wertaufbewahrung: Mittel können für spätere Verwendung gehalten werden, aber Inflation und Verlustrisiko beschränken realen Werterhalt. In der Variante ist der Reservezwang für die zusätzlichen Mittel entflochten; längere Bindung kann dort anders gewichtet werden, ohne eine Entscheidung für B zu erzwingen. Zu klären sind z. B. Verlusttragfähigkeit/weitere Verfügbarkeitsbedürfnisse und tatsächliche Mittelverwendung nach Leas Kriterium. Ein längerer Horizont beseitigt weder Verlustrisiko noch die fehlende ethische Information. **8 BE: jede Geldfunktion mit konkretem Fallbezug 1 (3); veränderter Ziel-/Zeithorizont der getrennten Zusatzmittel 1; zwei passende fehlende Informationen je 1 (2); keine automatische Sicherheit/ethische Eignung mit Begründung 2.**
''',[(8,'Ziel, Horizont, Liquidität, Sicherheit, erwartete Rendite und ethisches Kriterium'),(8,'Nominal-/Realvergleich mit korrekter Korbbezugsgröße'),(8,'Drei Geldfunktionen und bedingte Abwägung in der Variante')])

external=terminal('current-account-financial-account','Q3: Leistungsbilanz und Finanzierung eines Defizits interpretieren',
 'Q3: interpret the current account and financing of a deficit',
 'Die lernende Person kann in einem neuen Außenwirtschaftsfall Leistungsbilanzkomponenten und Kapitalbilanz bei ausdrücklich gegebener Vorzeichenkonvention verknüpfen, Stromgrößen von Vermögensbeständen unterscheiden und mögliche Defizit- oder Überschussprobleme unter unterschiedlichen Verwendungs- und Finanzierungsbedingungen begründen.',
 'The learner can relate current-account components and the financial account under an explicitly given sign convention in a new external-economy case, distinguish flows from wealth stocks and explain possible deficit or surplus problems under different use and financing conditions.',
 'Q3',['8a453b6b-4f28-54bc-8614-4ec8d5384a85'],['8a453b6b-4f28-54bc-8614-4ec8d5384a85'],
 '''**Fall: Ein Außenwirtschaftsdefizit und zwei mögliche Verwendungen**

Alle Angaben betreffen die erfundene Volkswirtschaft Selvara in einem Jahr und sind Unterrichtsmaterialien. Positive Werte in der Leistungsbilanz bedeuten Einnahmen minus Ausgaben des jeweiligen Teilbereichs. Die Kapitalbilanz ist hier die financial account nach der ausdrücklich verwendeten Konvention: Nettoerwerb ausländischer finanzieller Vermögenswerte minus Nettoaufnahme finanzieller Verbindlichkeiten gegenüber dem Ausland. Sie ist nicht die Vermögensänderungsbilanz (capital account). Letztere und der statistische Restposten sind im vereinfachten Jahresmodell null. Deshalb gilt hier Leistungsbilanzsaldo = Kapitalbilanzsaldo; die bloße Buchungsidentität beweist keine Ursache oder optimale Politik. Alle Zahlen sind Mio. EUR. Vermögensbestände am Jahresbeginn, Bewertungsänderungen und sonstige Bestandsänderungen werden nicht angegeben.

**Material 1 – Transaktionen des Jahres:**

| Leistungsbilanzbereich | Einnahmen | Ausgaben |
| --- | ---: | ---: |
| Waren | 120 | 140 |
| Dienstleistungen | 40 | 20 |
| Primäreinkommen | 10 | 20 |
| Sekundäreinkommen | 4 | 14 |

Gebietsansässige erwerben im Jahr netto 10 Mio. EUR zusätzliche finanzielle Forderungen gegenüber dem Ausland. Zugleich nehmen sie netto 30 Mio. EUR zusätzliche Kredite aus dem Ausland auf. Sonstige Finanztransaktionen sind im Modell null. Die Zahlen bezeichnen jährliche Veränderungen durch Transaktionen, keine gesamten Forderungs- oder Schuldenbestände.

**Material 2 – zwei getrennte Erklärungsvarianten für denselben Saldo:** In Variante P bestehen die den Importüberschuss begründenden zusätzlichen Einfuhren vor allem aus produktiven Anlagen. Ein plausibles Projektmodell erwartet spätere Exporterlöse; Abnehmer, Erträge und Zahlungszeitpunkte bleiben unsicher. Die entsprechenden Auslandskredite laufen langfristig und sind in der eigenen Währung vereinbart. In Variante K finanzieren dieselben Nettokapitalzuflüsse vor allem zusätzliche kurzfristige Konsumausgaben. Die Kredite sind kurzfristig in Fremdwährung vereinbart; Refinanzierung und Währungskurs sind unsicher. Das Material gibt für keine Variante einen sicheren späteren Erfolg oder Zahlungsausfall vor.

**Material 3 – Gegenfall Überschuss:** Eine zweite, getrennte Volkswirtschaft hat im selben vereinfachten Rahmen einen Leistungsbilanzüberschuss von 20 und einen Kapitalbilanzsaldo von +20. Weitere Daten über Verwendung, Verteilung, Investitionsbedarf oder ihre bisherigen Auslandsbestände fehlen. Hintergrund zur Stromrechnung und zu den Teilbilanzen: [Deutsche Bundesbank, Methodische Erläuterungen zur Zahlungsbilanz](https://www.bundesbank.de/de/statistiken/aussenwirtschaft/zahlungsbilanz/methodische-erlaeuterungen-772308), geprüft am 9. Oktober 2026. Der Zielrahmen außenwirtschaftlichen Gleichgewichts schreibt im Material keinen zwangsläufigen jährlichen Nullsaldo vor.

**Aufgaben – 24 BE:**

1. Berechnen und interpretieren Sie die vier Leistungsbilanzteilsalden sowie den Gesamtsaldo. Begründen Sie, warum das Warendefizit allein und die Summe aller Ausgaben keine vollständige Beschreibung des Leistungsbilanzsaldos liefern. **(8 BE)**
2. Berechnen und interpretieren Sie Selvaras Kapitalbilanzsaldo mit der gegebenen Konvention. Erläutern Sie den Nettokapitalzufluss und den Zusammenhang mit der Leistungsbilanz. Prüfen Sie „Defizit −20 bedeutet hier Kapitalbilanz +20“ und „Die gesamten Auslandsschulden des Landes betragen 30“. **(8 BE)**
3. Vergleichen Sie mögliche volkswirtschaftliche Probleme und Chancen der Varianten P und K. Begründen Sie je eine bedingte Einschätzung unter dem Ziel außenwirtschaftlichen Gleichgewichts und nennen Sie je eine konkrete noch nötige Information. Prüfen Sie am Gegenfall die Aussage „Ein Überschuss ist unabhängig von seiner Entstehung immer ein Erfolg“. **(8 BE)**
''',
 '''1. Waren 120−140=−20; Dienstleistungen 40−20=+20; Primäreinkommen 10−20=−10; Sekundäreinkommen 4−14=−10. Summe −20. Einnahmen insgesamt 174, Ausgaben 194, Differenz ebenfalls −20. Der Dienstleistungsüberschuss kompensiert das Warendefizit, die beiden Einkommenssalden ergeben das Gesamtdefizit. Ein Teilbereich bzw. bloße Ausgabensumme ist keine Nettogesamtgröße. **8 BE: vier richtige Teilsalden mit Vorzeichen je 1 (4); Gesamtsaldo und korrekter Zusammenhang 2; konkrete Kompensation/andere Teilbilanzen 1; Netto statt bloßer Ausgabenbetrag 1.**

2. Nach der ausdrücklich gegebenen Konvention Kapitalbilanz =10−30=−20. Verbindlichkeiten werden stärker aufgenommen als ausländische Vermögenswerte erworben; Nettokapitalzufluss bzw. Nettofinanzierung aus dem Ausland beträgt 20. Bei Vermögensänderungsbilanz und Restposten null stimmt der Kapitalbilanzsaldo mit −20 der Leistungsbilanz überein; er ist in dieser Konvention nicht +20. Das ist ein jährlicher Transaktionssaldo. 30 ist die Nettoaufnahme neuer Kredite im Jahr, nicht der gesamte vorhandene Auslandsschuldenbestand; Anfangsbestände und andere Bestandsänderungen fehlen. Die statistische Identität erklärt nicht, welche Transaktion den anderen Vorgang verursacht hat. **8 BE: Ansatz und −20 2; Nettozufluss mit Forderungs-/Verbindlichkeitsbezug 2; richtige gleiche Vorzeichen/Identität 1; Strom- statt Bestandsgröße mit konkreter fehlender Information 2; keine Kausalität aus Identität 1.**

3. P: produktive Anlagen können spätere Leistungsfähigkeit/Exporterlöse erhöhen und die Bedienung der längerfristigen Kredite unterstützen; unsichere Nachfrage/Erträge können diese Erwartung enttäuschen. Eigene Währung und längere Laufzeit mindern hier bestimmte unmittelbare Währungs-/Refinanzierungsrisiken, beseitigen aber nicht alle Probleme. Zu prüfen etwa belastbare Exportverträge und zeitlicher Schuldendienst. K: wenig angegebene künftige Ertragskapazität, kurze Laufzeit und Fremdwährung erhöhen unter den Fallbedingungen Refinanzierungs-/Währungsrisiken; dennoch ist Ausfall nicht zwangsläufig. Zu prüfen etwa konkrete Fälligkeiten, Deviseneinnahmen oder Refinanzierungszugang. Derselbe Defizitsaldo trägt also kein alleiniges Erfolgs-/Krisenurteil; Verwendung, Tragfähigkeit und Anpassungsbedingungen zählen. Ein Überschuss kann Nettoerwerb von Auslandsforderungen begleiten; ohne Entstehung, Verteilung und Investitionsbedarf belegt er keinen universellen Erfolg. Aus +20 Jahresfluss folgt kein bekannter gesamter Vermögensbestand. Andere schlüssige bedingte Einschätzungen sind gleichwertig. **8 BE: P mit Chance und konkreter Risikobedingung 2; K mit konkretem Risiko ohne Ausfallautomatik 2; je passende Zusatzinformation 1 (2); bedingter Gleichgewichtsrahmen statt Saldoautomatik 1; Überschussbehauptung konkret begrenzt 1.**
''',[(8,'Alle Leistungsbilanzkomponenten und Nettosaldo'),(8,'Kapitalbilanzkonvention, Finanzierung und Strom-/Bestandsabgrenzung'),(8,'Bedingte volkswirtschaftliche Urteile für Defizit und Überschuss')])

new=[assets,conj,finance,external,ngo]
write('whole-five-new-terminal-DRAFT-assessments.author.candidate.json',new)
nav={'id':uid('supplementary-practice-navigation'),'title':'Ergänzende materialgestützte Wirtschaftsübungen',
     'titleEn':'Supplementary material-based economics practice',
     'description':'Bündelt fünf eigenständige materialgestützte Übungsabschlüsse zu Anlagekriterien und Geldwert, Konjunkturpolitik, betrieblichen Investitionen und Kennzahlen, außenwirtschaftlichen Salden sowie Handelsabhängigkeiten und NGO-Beteiligung. Die Navigation erhebt keinen zusätzlichen fachlichen Kompetenzanspruch.',
     'descriptionEn':'Groups five independent material-based practice assessments in investment criteria and money value, business-cycle policy, business investment and ratios, external-account balances, and trade dependence and NGO participation. This navigation asserts no additional subject competence.',
     'weight':1,'tags':['GK','LK','Practice','Assessment'],'type':'cluster','contains':[g['id'] for g in new],
     'requires':[],'extendedData':{'applicabilityMappingInheritance':'boundary'}}
write('whole-one-additive-prerequisite-free-practice-navigation.author.candidate.json',nav)
write('actual-bounded-source-AB-requires-and-independent-review-obligations.author.json',{
 'schemaVersion':1,'kind':'inert-author-proposal','humanReviewStatus':'pending','independentDescriptionApproval':False,'newStrictClosures':0,
 'goals':[{'goalId':g['id'],'title':g['title'],'phase':g['phase'],'semanticKind':'practiceAssessment','directRequires':g['requires'],'examCoveredGoalIds':g['examData']['coveredGoalIds'],
           'ab1':'Recognise and represent explicitly supplied material criteria, components or model inputs.',
           'ab2':'Apply and link those criteria to the new case, compute where necessary and explain mechanisms.',
           'ab3':'Give a conditional judgement, test a false generalisation and identify actual missing information.',
           'authorStatus':'draft','humanReview':'pending','independentMaterialReview':'pending','dualDescriptionReview':'pending'} for g in new],
 'existingExamsKept':['b851482c-5d7e-4228-aea8-3d277f897297','44fb56bb-7b5a-4b34-9ca4-c4052f94da89','241d7c79-efdf-5425-8c03-115739dce004'],
 'financeExactReuse':{'originGoalId':'241d7c79-efdf-5425-8c03-115739dce004','keptMaterialBodies':'former materials 2 and 3; task/solution bodies 2 and 3 with mechanical renumbering and updated independent-module sentence only','notIncluded':'unrelated price/cost/break-even module and its prerequisite','noOriginalCourseOrReleaseChange':True},
 'actual047EvidenceInput':'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-e2-fourteen-native-preparation-technical-20261008-v1/positive-final-images.records.candidate.jsonl',
 'actual8aEvidenceInput':'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-final-nineteen-current311-after-methods20-native-preparation-20261008-v1/positive-current-final-images.review.jsonl',
 'remainingObligations':['Independent actual whole material/rubric/source review before any machine release.', 'Independent dual description reviews at the final actual ownerpage freeze; this author cannot approve its new content.', 'Recompute combined Generic10, routes and independently approved 479 ownerpage/source/P/AM/V bindings.', 'Native graph, exact target projection, route and assessment/schema checks before integration.', 'No source/course full approval, human release, empirical learning or runtime acceptance claimed.'],
 'navigation':{'goalId':nav['id'],'requires':[],'boundary':True,'proposedPureEconomicsCheckerRegistration':True,'noThresholdRelaxation':True},
 'nativeChecksCompletedAtAuthoring':False})

print(json.dumps({'base':str(BASE),'newGoalIds':[g['id'] for g in new],'navId':nav['id'],'candidateSHA':sha(BASE/'whole-five-new-terminal-DRAFT-assessments.author.candidate.json')},indent=2))
