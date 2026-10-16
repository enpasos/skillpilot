# SPDX-License-Identifier: Apache-2.0
"""Complete legible German counterparts for the original bilingual author case data."""
import json
from pathlib import Path
OWN=Path(__file__).resolve().parents[1]
assert not (OWN/'FILES.finite-author.seal.json').exists()
P=OWN/'materials/forty-two-whole-DE-EN-cases.author.json';D=json.loads(P.read_text());G={c['id']:c for c in D['cases']}
def fix(n,s,m,t,w,v,r):
 c=G[f'energy20-{n:02d}-{s}'];c.update(materialsDe=m,taskDe=t,workedReasoningDe=w,freshIndependentTransferDe=v)
 for a,b in zip(c['criterionToObservableRubric'],r):a['observableDe']=b

fix(5,'a',
'Eigenes Modell:Graphit-Anode,LiFePO4/FePO4-Kathode,Li+-Elektrolyt und poröser Separator. Beim Entladen wandernLi+ zur positiven Elektrode,Elektronen außen über den Motor. Packenergie60kWh,Verbrauch18kWh/100km bei20°C. Schutzschaltung gegen Überladung;keine Zellöffnung oder Kurzschlussversuche.',
'Erkläre Bauteilfunktionen und Lade-/Entladewege anLiC6+FePO4→C6+LiFePO4. Berechne die bedingte Reichweite und beurteile250km ohne Nachladen. Begründe die Ionenleitung und elektrische Trennung am Separator.',
'Beim Entladen wirdLi aus Graphit freigesetzt und positiv eingelagert;die äußeren Elektronen leisten Arbeit. Laden erzwingt die Umkehr durch Energiezufuhr. Der Separator leitet keine Elektronen.60/18×100≈333km;250km benötigen45kWh,Reserve15kWh. Alterung,Temperatur und Fahrprofil begrenzen die Prognose. Ein Kurzschluss umgeht den Arbeitspfad und kann gefährliche Erwärmung bewirken.',
'Ersetze den Separator in einer Zeichnung durch einen metallischen Verbinder. Sage Funktions- und Sicherheitsfolgen voraus;führe keinen Kurzschluss aus.',
['Lade-/Entladewege mit Interkalation eigenständig erklären.','333km und15kWh Reserve als bedingte Modellwerte herleiten.','Separator und Schutzfunktion chemisch begründen.'])
fix(5,'b',
'Modellpack aus5a:Im Winter sind80%der früheren60kWh nutzbar;Verbrauch mit Heizung24kWh/100km. TestA berichtet90%Restkapazität nach Alterung bei20°C;TestB begrenzte Leistung bei−10°C. Der80%-Winterwert enthält den hier berücksichtigten Alterungseffekt bereits. Alle Angaben sind fiktiv.',
'Bestimme die Reichweite ohne doppelten Alterungsabzug. Erkläre den Einfluss niedriger Temperatur auf Leistung und Nutzenergie bei unveränderter Redoxbilanz. Beurteile230km und fehlende Lade-/Sicherheitsdaten.',
'48kWh sind nutzbar;48/24×100=200km. Erneute Multiplikation mit90%wäre Doppelzählung.230km benötigen55,2kWh,also7,2kWh mehr. Langsamere Transport-/Elektrodenkinetik erhöht den Spannungsabfall unter Last;die Reaktionsstöchiometrie bleibt. Leistung ist nicht Energie. Ladefreigabe,Temperaturmanagement,Reserve und Stationen müssen zusätzlich geprüft werden.',
'Ein besserer Heizer senkt den Verbrauch ohne neue Zellchemie. Unterscheide eine Verbesserung des Fahrzeugverbrauchs von einer Änderung der Batterie.',
['48kWh und200km ohne Doppelzählung berechnen.','Kinetische Betriebsgrenze und Reaktionsbilanz unterscheiden.','Eine konkrete Lade-/Reserveentscheidung mit Unsicherheit begründen.'])
fix(6,'a',
'Strukturkarten:A=C12H25−O−SO3− Na+;B=C16H33−N+(CH3)3 Br−;C=C12H25−(OCH2CH2)6−OH. Jeweils unpolare Kette und polare Kopfregion. D enthältNaCl ohne Kohlenwasserstoffkette. Wasser ist Lösemittel;kein Reinstoff-Mischversuch.',
'OrdneA/B/C begründet als anionisch,kationisch oder nichtionisch zu. Markiere Kopf,Schwanz und Gegenion. Erkläre die Wechselwirkung vonC mit Wasser und warumD kein Tensid ist. Sage eine mögliche Folge einerA/B-Mischung voraus,ohne alle Mischungen als unlöslich zu behandeln.',
'A trägt den negativen Sulfatester-Kopf,Na+ist Gegenion;B den positiven quartären Ammoniumkopf mitBr−. C hat eine polare sauerstoffreiche Ethoxyregion ohne formale Ladung. Neutralität des gesamten Salzes ändert die Kopfklasse nicht. NaCl fehlt der lipophile Schwanz. Entgegengesetzte Köpfe können abhängig von Konzentration/Zusammensetzung Ionenpaare oder schwerlösliche Komplexe bilden. Die Klasse beweist keine bestimmte Waschleistung.',
'Entferne eine Ethoxyeinheit ausC und ersetzeNa+ inA durchK+. Welche Klasse bleibt,welche quantitative Eigenschaft ist ohne Daten offen?',
['Kopfladung statt Gesamtladung des Salzes klassifizieren.','Kopf,Schwanz und Gegenion richtig zuordnen.','Hydratation und Mischgrenzen ohne pauschales Leistungsranking erklären.'])
fix(6,'b',
'Eigene Karten:E=C12H25NH2,unterpH9 überwiegendC12H25NH3+;F=C12H25N+(CH3)2−CH2COO− bei Modell-pH7;G=C12H25N+(CH3)3 bleibt beipH7/12 positiv. Diese pH-Eigenschaften sind bereitgestellte Stoffdaten. Partnerziel e874 trägt den zwitterionischen Quellenanteil.',
'VergleicheE undG bei pH-Wechsel und charakterisiereF gegenüber dem nichtionischenC aus6a. Warum bedeutet Nettoladung0 nicht Ladungsfreiheit? Erhalte den zusätzlichen Quellenpartner,statt die ganze Vierklassenquelle allein d465 zuzuschreiben.',
'E wird durch Protonierung kationisch;höhererpH verschiebt zum ungeladenen Amin. G ist quartär und nicht dasselbe Säure-Base-Paar. F trägt gleichzeitig positive und negative Kopfstellen und ist zwitterionisch,nicht nichtionisch. D465 umfasst drei Klassen;derBB/BE-Vierklassenbullet bleibt nur mit dem Partner gedeckt. OhnepH istE nicht eindeutig als permanent kationisch einzuordnen.',
'Für eine neue Probe fehltpH. Welche Bedingung braucht dieE-Zuordnung,welcheG-Aussage bleibt dennoch gültig?',
['Protonierbares Amin von quartärem Ammonium unterscheiden.','Zwitterionische Ladungstrennung von Nichtionizität abgrenzen.','pH-/Stoffdatengrenze und Quellenpartner erhalten.'])
fix(7,'a',
'Fiktiver Tracerversuch:NormalesCO2 plusH2(18)O erzeugt unter Licht18O-reichesO2;C(18)O2 mit normalem Wasser liefert zunächst überwiegend unmarkiertesO2. Kurze Beobachtungszeit,Nebenaustausch vernachlässigt. ATP/NADPH vermitteln Energie und Reduktionsäquivalente;Licht liefert keine Atome.',
'Leite dieO2-Herkunft ab. Stelle Wasseroxidation undCO2-Reduktion auf derCH2O-Modellstufe dar. Erkläre die Grenze einer Nettogleichung sowie Lichtabhängigkeit und Energiespeicherung.',
'2H2O→O2+4H++4e−;CO2+4H++4e−→CH2O+H2O;nettoCO2+H2O→CH2O+O2. Tracer verknüpftO2 mit Wasseroxidation,CO2 wird reduziert. CH2O bezeichnet ein Kohlenhydratäquivalent,kein isoliertes Pflanzenprodukt Formaldehyd. Die Nettogleichung verbirgt Wasserumsatz und Zwischenreaktionen. Licht treibt Speicherung chemischer Energie;Enzyme erzeugen diese Energie nicht.',
'Im Dunkeln setzt sichCO2-Fixierung mit vorhandenenATP/NADPH kurz fort. Warum beweist das keine unbegrenzte Wasseroxidation ohne Licht?',
['Wasser als Donator undCO2 als Akzeptor durch Tracer und Bilanz verbinden.','Vier Elektronen und erhaltene Ladung korrekt bilanzieren.','Netto-,Mechanismus- und Lichtenergieaussage unterscheiden.'])
fix(7,'b',
'Eigenes Zweistufenmodell:L ist eine beleuchtete wasseroxidierende Membran,S einCO2-reduzierendes Kompartiment mit Trägerverbrauch. Daten:r1 Licht/Wasser/CO2→O2 undC-Einbau;r2 Licht/Wasser ohneCO2→anfangsO2,kein neuerC-Einbau;r3 Dunkelheit mit frischen Trägern/CO2→kurzC-Einbau,kein neuesO2. Keine Lernendenmessungen.',
'Erkläre die Daten durch gekoppelte,aber verschiedene Teilprozesse. Formuliere die Glucose-Nettoformel und ihre Grenze. Widerlege „CO2 ist der Brennstoff der Lichtreaktion,Wasser nur Lösemittel“.',
'6CO2+6H2O→C6H12O6+6O2 ist die Nettobilanz mit Lichtzufuhr. Expliziter Wasserumsatz:6CO2+12H2O→C6H12O6+6O2+6H2O. Wasseroxidation liefert Elektronen undO2,CO2-Reduktion bindetC. Die Daten zeigen Trägerkopplung,keine unbegrenzte Dunkelreaktion. Atome und Energie haben unterschiedliche Quellen. AnfangsO2 ohneCO2 ist kein Nachweis neuer Kohlenhydratsynthese.',
'ErsetzeCO2 durchN2. Welche Produktbehauptung ist trotzO2-Freisetzung unbelegt,und welche Messung prüftC-Speicherung?',
['Lichtreaktion undCO2-Reduktion kausal verbinden,ohne sie gleichzusetzen.','Glucose-Nettoformel und expliziten Wasserumsatz deuten.','C-Fixierung nicht ausO2 allein ableiten.'])
fix(8,'a',
'Fiktive Kette:100kWh Eingangsstrom→Elektrolyse70%LHV→Speicher90%Restenergie→Brennstoffzelle50%Stromwirkungsgrad. H2/O2-System,keine zusätzlichen Brennstoffe. LHV-Grenze überall gleich,Abwärme ungenutzt. Werbung behauptet „Wasser liefert100kWh“.',
'Erkläre beide Technologien mit Donator,Akzeptor und Energiefluss. Bilanziere Stoffe,berechne den Rückstrom und beurteile die Werbung. Nenne einen Speicherzweck,der nicht auf überlegener Effizienz beruhen muss.',
'Elektrolyse erzwingt2H2O→2H2+O2 mit Energiezufuhr;die Zelle nutzt2H2+O2→2H2O spontan. In der Zelle istH2 Donator,O2 Akzeptor.100×0,70×0,90×0,50=31,5kWh. Wasser ist kein Nettoenergielieferant,H2 speichert zuvor zugeführte Energie. Lange Speicherzeiten oder Transport können begründete Zwecke sein. Die übrige Energie ist nicht vernichtet,sondern überwiegend anders abgegeben.',
'EineH2-Verbrennungskraftmaschine ersetzt die Zelle. Welches Redoxpaar bleibt,und welche zusätzliche Wärme-Arbeit-Grenze entsteht?',
['Erzwungene und spontane Redoxprozesse mit ihrer Energiequelle verbinden.','31,5kWh auf gleicherLHV-Grenze herleiten.','Speicherfunktion von Primärenergieerzeugung unterscheiden.'])
fix(8,'b',
'Eigenes Flow-Modell:Zwei Tanks mitAox/Ared undBox/Bred. EntladungAred+Box→Aox+Bred bei1,20V. Ladungen:Ared−/Aox neutral,Box+/Bred neutral;je ein Elektron. Separator führt Ausgleichsionen,keine Elektronen.10kWh Eingang,Laden90%,Entladen85%;ideale Stoffrückhaltung beim Pumpen.',
'Leite Donator,Akzeptor und Teilgleichungen ab. Erkläre die erzwungene Ladeumkehr und berechne die abgebbare Energie. Vergleiche Tankvolumen und Zellleistung mitH2-Speicherung,ohne reale Materialvorteile zu erfinden.',
'Ared−→Aox+e− undBox++e−→Bred;gesamtAred−+Box+→Aox+Bred ist ladungserhalten. Laden erzwingt die Umkehr und speichert Energie.10×0,90×0,85=7,65kWh. Größere Tanks bei gleicher Konzentration können mehr Ladung bevorraten,nicht automatisch mehr Leistung;diese hängt auch von Zelle/Pumpen ab. Das abstrakte Modell belegt keine tatsächliche Toxizität,Kosten oder Marktreife.',
'Elektroden werden größer,Tanks bleiben gleich. Welche Größe kann primär steigen,welche braucht zusätzlich Stoffvorrat?',
['Donator-/Akzeptorbilanz mit richtigem Ladungserhalt entwickeln.','7,65kWh und energiegetriebene Ladeumkehr erklären.','Energie-/Ladungskapazität und Leistung unterscheiden.'])
fix(9,'a',
'Fiktive analoge KarteS(Institut,2025):Stahlmehrwegflasche2,0kgCO2e Herstellung,Reinigung0,005kg pro Nutzung. Digitaler HerstellerbogenP(2026):EinwegPET0,100kgCO2e pro Nutzung einschließlich Herstellung/Entsorgung. Beide liefern0,5L,n ist unbekannt;Kühlung nicht erfasst. Stahl ist metallisch,PET thermoplastischer Polyester;Korrosion/Dauerhaltbarkeit gelten nur unter angegebenen Bedingungen.',
'Bewerte Kunststoff und Metall mit beiden Quellenarten für dieselbe Nutzung. Leite denCO2-Breakeven ab und berücksichtige Gewicht,Reinigung und Zugang zum Wiederbefüllen,ohne fehlende Werte zu erfinden.',
'Stahl:2+0,005n;PET:0,100n kgCO2e. Gleichheit bei n=2/0,095≈21,05,ab22 Nutzungen ist Stahl hier günstiger. Gleiches Volumen sichert nicht gleiche Hygiene oder Transportmasse. Analoge Quellen sind nicht automatisch besser;Herstellerinteresse verlangt Methodik-/Grenzprüfung,keine pauschale Ablehnung. Materialstruktur begründet Eignung,CO2 allein keine vollständige Nachhaltigkeit.',
'Die Flasche geht nach5 Nutzungen verloren und der Wiederbefüllort entfällt. Revidiere das Urteil mit Daten statt mit dem Materialnamen.',
['Materialeigenschaften mit identischer Nutzfunktion verbinden.','22Nutzungen mit beiden Vorketten herleiten.','Analoge/digitale Urheberschaft,Grenzen und soziale Kriterien kritisch nutzen.'])
fix(9,'b',
'Fiktive1000h-Dienstleistung:Al-Bauteil1kg,150MJ Herstellung,2000h Testlebensdauer;PP-Verbund0,5kg,60MJ,500h. Gleiche Lastanforderung;gleichartige Ersatzteile,keine Recyclinggutschrift. Gedruckte PrüfstelleT nennt Testgrenzen;digitaler RecyclingverbandR verspricht100%Kreislauf ohne Sammelquote.',
'Berechne den Einsatz für1000h und erkläre die Unzulänglichkeit eines Vergleichs jeKilogramm. Prüfe die Kreislaufbehauptung und die Grenzen der Lebensdauerübertragung.',
'Eine bereitgestellteAl-Einheit benötigt150MJ;PP zwei Einheiten120MJ und1kg Material. Lebensdauerallokation vonAl ergäbe75MJ,ist aber eine andere ausdrücklich zu vereinbarende Grenze. Dieses Ergebnis darf nicht stillschweigend gewechselt werden. Recyclingfähigkeit garantiert keine vollständige Sammlung/Sortierung/Aufbereitung. Testlast,Umgebung und Reparatur begrenzen die Prognose;Interessen und wissenschaftliche Daten der Quellen sind getrennt zu prüfen.',
'Ein repariertesPP-Teil hält1500h,Reparatur kostet10MJ. Lege einen fairen Rand offen und entscheide erneut.',
['Gleiche Betriebsfunktion und Ersatzbedarf erhalten.','150/120MJ und die alternative75MJ-Allokation trennen.','Recyclingfähigkeit nicht mit realem Rücklauf gleichsetzen.'])
fix(10,'a',
'Fiktiv pro1kWh Stromausgang:FC50%bezogen aufH2-LHV,H2-Elektrolyse70%Strom-zu-LHV,keine Speicherverluste. Gas-Kraftwerk55%;Gasvorkette0,05kgCO2e jeAusgangs-kWh,Verbrennung0,20kg/kWhGas. H2-Strommix0,40kgCO2e/kWh. FC-Lieferkettenprüfung fehlt,Gasimportabhängigkeit ist gegeben. Kosten unbekannt.',
'Vergleiche chemische/thermische Umwandlung und Bereitstellung. BerechneCO2 und formuliere eine bedingte ökologische,ökonomische und soziale Bewertung. Benenne Nichtwissen und verwechsleH2 nicht mit Primärenergie.',
'FC braucht2kWhH2 und2/0,70=2,857kWh Vorkettenstrom:1,143kgCO2e. Gas braucht1/0,55=1,818kWh:0,364+0,05=0,414kgCO2e. Hier istFC lokal abgasarm,aber nicht klimafreundlicher. FC nutzt äußere Elektronenarbeit,Kraftwerk einen Wärme-Arbeit-Pfad. Ohne Kostenangaben kein Kostenranking. Importabhängigkeit und ungeprüfte Materiallieferketten sind verschiedene soziale Risiken. Kein universeller Sieger folgt.',
'DerH2-Strommix sinkt auf0,03kgCO2e/kWh. WelchesCO2-Urteil ändert sich,welche Kosten-/Sozialfragen bleiben offen?',
['1kWh-Ausgangsfunktion und beide Umwandlungswege erklären.','1,143gegen0,414kgCO2e mit Vorkette herleiten.','Drei Perspektiven mit belegten Kriterien und expliziten Wertungen verbinden.'])
fix(10,'b',
'EigenesKWK-Modell pro10MJ Brennstoff:FC5MJ Strom+3MJ nutzbare Wärme;Verbrennungsanlage3MJ Strom+5MJ Wärme. Winterbedarf2MJ Wärme,Sommer0MJ;keine Speicherung. FC1,60€,Verbrennung1,00€ pro Zyklus;gleiche Verfügbarkeitsklasse,FC-Wartung lokal ungesichert. Vorketten-/Klimadaten fehlen.',
'Vergleiche elektrische und tatsächlich genutzte Gesamtenergie im Winter/Sommer. Begründe eine Versorgungswahl mit Kosten und Wartungszugang und erkläre die Grenze zum vollständigen Klimavergleich.',
'Elektrisch50%/30%. Winter:FC(5+2)/10=70%,Verbrennung(3+2)/10=50%;Sommer50%/30%. Beide als80%genutzt zu bezeichnen zählt überschüssige Wärme fälschlich. Stromausbeute,Kosten und Wartungsrisiken sind abzuwägen;gleicher Dienst kann weitere Dimensionierung benötigen. Ohne Brennstoffherkunft keinCO2-Urteil. Zugang/Zuverlässigkeit sind explizit zu gewichtende soziale Kriterien.',
'Ein Wärmenetz nutzt alle5MJ der Verbrennungsanlage. Definiere eine faire Dienstleistungsgrenze und zähle dieselbe Wärme nicht doppelt gut.',
['Nominelle Wärme und tatsächlichen Bedarf trennen.','Winter70%/50% undSommer50%/30% richtig berechnen.','Kosten,soziale Grenzen und fehlende Klimavorkette offenlegen.'])

fix(14,'a',
'EigenesLCA-Modell pro1MJ Brennstoffenergie:Bioethanol Anbau20gCO2e,Verarbeitung15,Transport5;biogene Aufnahme−71gCO2,Verbrennung+71gCO2. Vollständige Nachbildung im gleichen Zeitraum angenommen,keine Landnutzungsänderung. Fossiler Vergleich95gCO2e/MJ einschließlich Nutzung. Andere Umweltkategorien sind nicht erfasst.',
'Erstelle und interpretiere die vereinfachte Bilanz. Ändere anschließend nur den Landnutzungsbeitrag auf+80gCO2e/MJ. Begründe,warum weder „Biokraftstoff immer null“noch ein allgemeiner Gegenbeweis folgt.',
'Basis20+15+5−71+71=40gCO2e/MJ,Ersparnis55g bzw57,9%gegen95g. Mit Landnutzungsbeitrag120g/MJ,25g mehr als fossil. Aufnahme und Verbrennung bleiben getrennte Flüsse;keine doppelte Gutschrift. Nachbildung,Zeithorizont und Landannahmen tragen das Ergebnis. Wasser,Biodiversität,Nahrungskonkurrenz und Motorwirkungsgrad fehlen. Gleiche Brennstoffenergie ist noch nicht gleiche Transportleistung.',
'Ein Motor braucht für gleiche Radarbeit20%mehr Bioethanolenergie. Passe die funktionale Einheit an und überprüfe den früheren Vergleich.',
['Einheit und positive/negative Kohlenstoffflüsse erklären.','40/120gegen95g und57,9% nachvollziehbar berechnen.','Annahmen und fehlende Umweltkategorien im Urteil berücksichtigen.'])
fix(14,'b',
'Fiktiv pro1kWh gespeicherterH2-LHV:Sammlung0,10kgCO2e,Umwandlung0,20,Transport0,05;Nebenwärme0,5kWh. Studie1 zieht0,40kg pauschal ab;Studie2 belegt nur0,2kWh ersetzte Wärme mit0,25kgCO2e/kWh. Gleicher Zeitraum,Reststoff ohne Anbaulast. Keine Gutschrift für hypothetische Wärmenutzung.',
'Rekonstruiere beide Ergebnisse und eine transparente zulässige Gutschrift. Bilanziere ohne Gutschrift und mit belegtem Ersatz. Was fehlt zum Vergleich von Brennstoffzellenstrom?',
'Brutto0,35kgCO2e/kWhH2. Pauschaler Abzug ergibt−0,05kg,beweist aber keine negative Umweltlast. Belegter Ersatz0,2×0,25=0,05kg,daher0,30kg. Ungenutzte0,3kWh Wärme erhalten keine Gutschrift. Allokation und Ersatz müssen ohne Doppelzählung zusammenpassen. Für1kWhFC-Strom fehlen Zellwirkungsgrad und Speicher-/Transportverluste;H2-Energie ist eine andere Funktion als Strom.',
'Die Wärme ersetzt jetzt erneuerbare Wärme mit0,02kgCO2e/kWh. Welche Gutschrift ändert sich,welche Stoffflüsse bleiben?',
['Bruttoinventar und funktionale Einheit erhalten.','0,35/−0,05/0,30kg aus verschiedenen Gutschriften unterscheiden.','Ungenutzte Wärme,Doppelzählung und Umwandlungsgrenzen erkennen.'])
fix(15,'a',
'Eigene Daten pro10kWh Sonnenstrahlung:RouteP PV20%und Elektrolyse70%LHV;RouteD direkte photokatalytische Wasserspaltung8%LHV. Beide Speicher85%Erhalt. P50gNickel,D5gseltenesMetall pro1000h;D-Freilandhaltbarkeit unbekannt. Keine aktuellen Rekorddaten,keine Gasproduktion im Lernendenversuch.',
'Vergleiche Energiepfade und Wasserbilanz. Berechne gespeicherteH2-Energie und beurteile Grundstoffe/Katalysatoren ökonomisch und ökologisch. Welche Teilanalogie zur Photosynthese besteht,welche fehlt?',
'P:10×0,20×0,70×0,85=1,19kWh;D:10×0,08×0,85=0,68kWhH2. Beide nutzen2H2O→2H2+O2 mit Energiezufuhr;P über Strom,D über direkte Lichtanregung. Das bildet lichtgetriebene Energiespeicherung ab,keine vollständigeCO2-Reduktion zu Kohlenhydraten. Kleinere Katalysatormasse bedeutet ohne Verfügbarkeit/Lebensdauer keinen geringeren Ressourcenbedarf. Kosten,Fläche,Recycling und Stabilität fehlen;Katalysatoren ändern keine Stoffbilanz und schaffen keine Energie.',
'D verdoppelt die Lichtausbeute,aber halbiert die Lebensdauer. Prüfe Energie- und Materialaussage getrennt über gleiche Betriebszeit.',
['Elektrochemischen und photokatalytischen Pfad samt Bilanz trennen.','1,19gegen0,68kWh mit gleicher Solargrenze berechnen.','Katalysatorbedarf,Lebensdauer und partielle Photosyntheseanalogie erklären.'])
fix(15,'b',
'Fiktiv:TankT beladen11kg,davon1kgH2;Beladung2kWh/kgH2,Rückgewinnung95%. HydridH beladen100kg,davon2kgH2;Beladung1kWh/kgH2,Freisetzung4kWh/kgH2Wärme,Rückgewinnung90%. LHV33,3kWh/kgH2. Herstellungs-/Rückgewinnungsdaten der Materialien fehlen. Keine Druckgas-/Hydridhandhabung.',
'Vergleiche physikalische/chemische Speicherung,Massenanteil und nutzbare Energie. Bewerte stationären und mobilen Einsatz mit Freisetzungswärme und Rohstoffbedarf. Setze Wärme und Strom nicht ungeprüft gleich.',
'T:1/11=9,09%H2 und31,635kWh proSystem,bzw2,876kWh/kgSystem. H:2%H2 und59,94kWh proSystem,bzw0,5994kWh/kg. Der Tank speichert Gas physikalisch,das Hydrid bindetH chemisch. Daraus folgt kein universelles Sicherheitsranking. H benötigt8kWh Freisetzungswärme pro voller Beladung;Temperatur und Herkunft dieser Wärme sind entscheidend. Stationär kann Gewicht weniger stören. Rohstoff- und Lebensdauerfragen bleiben offen.',
'Geeignete Abwärme ist jetzt nachweisbar verfügbar. Welche ökonomische/ökologische Grenze ändert sich,welche Massenwerte nicht?',
['Physikalische Speicherung von chemischer Hydridbindung unterscheiden.','9,09%/2% und beide Systemenergien korrekt normieren.','Freisetzungswärme,Ressourcen und anwendungsbezogene Gewichtung beurteilen.'])
fix(16,'a',
'Fiktiv:Signierter PapierberichtT bei20°C nenntBEV18kWh/100km abSteckdose;HerstellerwebseiteH15kWh/100km amMotor. Batterie60kWh,Herstellung80kgCO2e/kWh;Vergleich6L/100km und2,7kgCO2e/L einschließlich definierterVorkette. Netz400gCO2e/kWh. BEV6000€teurer,Strom0,30€/kWh,Kraftstoff1,80€/L. Wartung/Restwert fehlen;keine Kaufempfehlung.',
'Prüfe Quellenherkunft und Bilanzgrenzen. Berechne Betriebsemissionen,zusätzlicheBatterielast sowie bedingteCO2-/Energiekosten-Breakevens. Gib energetische,ökonomische und ökologische Folgerungen mit offenen Gesamtfahrzeuggrenzen an.',
'Für die Netzbilanz ist18abSteckdose passend,nicht15amMotor. BEV7,2kgCO2e/100km,Verbrenner16,2kg,Differenz0,09kg/km. Batterie4800kg zusätzlich→53333kmCO2-Breakeven bei gleichen übrigen Lasten. Energiekosten5,40gegen10,80€/100km;6000/0,054≈111111kmKosten-Breakeven. Wartung und Restwert fehlen ausdrücklich. Herstellerinteresse entwertet Daten nicht automatisch,aber Methode und Grenze müssen passen. Das ist kein vollständiges gesellschaftliches Urteil.',
'Netzstrom sinkt auf100gCO2e/kWh,Preise bleiben gleich. Berechne denCO2-Breakeven erneut und erkläre den unveränderten Kostenrand.',
['Quelleninteresse und Steckdosen-/Motorgrenze prüfen.','7,2/16,2kg,4800kg und beide Breakevens herleiten.','Bedingte ökonomische/ökologische Aussagen mit fehlenden Daten trennen.'])
fix(16,'b',
'Fiktiv:Winter-PapierberichtP nennt kleinesBEV40kWhBatterie,16kWh/100kmSteckdose. AnonymerBlogZ nutztSommer12kWh/100kmMotor ohneQuelle. Batterie70kgCO2e/kWh,also2800kg Zusatzlast. Strom1000gCO2e/kWh,Vergleichsauto14kgCO2e/100km. Strom0,40€/kWh,Verbrenner8€/100km,gleicherKaufpreis. Lebensdauerdaten fehlen.',
'Prüfe die Vergleichbarkeit und berechne Betriebs-CO2 sowie Energiekosten. Gibt es bei konstanten Daten einen positivenCO2-Breakeven? Bewerte Quellen und unterschiedliche Kosten-/Klimarichtung fair.',
'BEV16kgCO2e/100km übersteigt14kg. Mit zusätzlicher2800kgStartlast existiert hier kein positiverCO2-Breakeven. Kosten6,40gegen8€/100km sprechen dagegen für dasBEV. P passt zuRegion/Winter,Z vermischt Datenränder ohne Autor/Methode. Keine universelle Aussage folgt:Netzentwicklung,Fahrprofil und weitere Herstellung können Ergebnisse ändern. Präferenz ersetzt keine Quellenkritik.',
'Ein neuer Stromvertrag hat Herkunftslabels,aber keine zeitbezogene Erzeugungsbilanz. Welche Validitätsfrage muss vor neuerCO2-Rechnung geklärt werden?',
['Winter/Sommer undMotor/Steckdose nicht vermischen.','Den fehlenden positivenCO2-Breakeven mathematisch erklären.','Kosten- undCO2-Richtung quellenkritisch getrennt abwägen.'])
fix(18,'b',
'Eigenes Stoffmodell:Ein Tensidester hydrolysiert zu langkettiger Hydroxykomponente und Carbonsäurekomponente. Ein freigesetzter linearerC12-Alkohol CH3−(CH2)10−CH2OH oxidiert zuC12-Aldehyd undC12-Säure.β-Oxidation aktivierter Fettsäuren entfernt jeweils2C. Fremddaten:80%Ausgangstensid verschwunden nach7Tagen,aber nur30%des organischenC alsCO2;Rest unbekannt.',
'Beschreibe Hydrolyse,endständige Oxidation undβ-Oxidation mit C-Erhalt und Produktklassen. Beurteilt80%Verschwinden die Mineralisierung? Nenne weitere Messungen;dies prüft den zweitenc21-Inhalt,keine Zeolithstruktur.',
'Hydrolyse spaltet unter Wasserverbrauch die Esterbindung. Alkohol→Aldehyd→Säure erhält zunächst12C. Nach Aktivierung entstehen ideal aus einer gesättigtenC12-Kette sechsAcetyl-Einheiten über fünf Verkürzungszyklen. Das ist noch kein vollständigerCO2-Nachweis. Ausgangsstoffentfernung kann Zwischenprodukte,Sorption oder Biomasse einschließen. Benötigt werden C-Bilanz,Produkte und aquatische Wirkungen;Stoff und Bedingungen bestimmen den Weg.',
'Ein verzweigter Alkylrest ersetzt die lineare Kette. Warum dürfen Weg und Geschwindigkeit nicht ohne neue Daten übertragen werden?',
['Hydrolyse/Oxidation mit richtiger Gruppen- undC-Bilanz darstellen.','C2-Verkürzung von vollständiger Mineralisierung trennen.','80%Entfernung/30%CO2 und fehlende Zwischenproduktdaten kritisch deuten.'])
fix(19,'a',
'Eigene Modellwerte,keine Produktspezifikationen:15°C,hoheHärte,Dosisgrenze0,08g/L. A C12-Sulfat wirkt ab0,20g/L und oberhalbKrafft20°C. B linearerSulfonatkopf wirkt ab0,10g/L,Krafft8°C,härteempfindlich. C C12-Ethoxylat6EO wirkt ab0,05g/L,bei5°C im vorgegebenen Test homogen,Trübungspunkt35°C,härtetolerant. Ziel:gleiche Ölentfernung ohne Niederschlag. Keine Synthese/Umweltfreigabe.',
'Wähle eine Struktur unter allen Ziel-/Nebenbedingungen. Erkläre Kopf/Kettenwirkung und prüfe Konzentration,Temperatur,Härte getrennt. Plane eine kontrollierte Prüfung mit Wasserblank und gleicherÖlmenge statt unspezifizierter „Waschkraft“.',
'C erfüllt die angegebenen Bedingungen:0,08>0,05g/L und15°C in der angegebenen homogenen Temperaturspanne und unter demTrübungspunkt,keine angegebeneHärtestörung. A verfehltTemperatur/Dosis,B Dosis undHärte. DerEthoxykopf unterstützt Hydratation,dieKette Ölwechselwirkung;Micellen allein beweisen keine Universalwirkung. Test:Gleichdosis,Temperatur,Öl,Schüttelzeit,Blank undWiederholung. Toxizität,Abbau undKosten fehlen für eine Gesamtoptimierung.',
'Die Temperatur steigt auf45°C. PrüfeC neu und fordere für höherethoxylierte Alternativen gezielt Daten statt „mehrEO ist immer besser“.',
['Strukturwahl an Ziel und drei Nebenbedingungen binden.','A/B/C anhand gegebener Grenzwerte begründet auswählen/ausschließen.','Kontrollierte Überprüfung und offene Umweltkriterien benennen.'])
fix(19,'b',
'FiktiverFrontlader:60°C,keinNiederschlag,wenigSchaum,gleicheFettentfernung. D Ethoxykopf:Trübungspunkt80°C,Entfernung90%,Schaum10mm. E gleicheKette/andererKopf:Trübung45°C,Entfernungbei60°C70%,Schaum30mm. Hersteller schlägt kationischesF plus anionischesG ohne Verträglichkeitsdaten vor. GleicheDosis/Mechanik;Fremdmodelldaten.',
'Optimiere durch begründete Strukturwahl und nenne Zielkonflikte. Warum sind Kopfänderung und Temperatur wichtig,Schaum aber kein Entfernungsmaß? BeurteileF/G und entwickle eine Prüffrage,keine Rezeptur.',
'D erfüllt die gegebenen Bedingungen besser. E liegt über seinemTrübungspunkt und entfernt hier weniger Fett. GleicheSchwänze garantieren bei andererKopfhydratation keine gleicheLöslichkeit. WenigSchaum ist eine Maschinennebenbedingung,nicht der Reinigungsbeweis. F/G können ionisch wechselwirken;Stabilität undLeistung sind offen. Test fixiertDosis,Last undTemperatur und misstNiederschlag/Fettentfernung getrennt;kein universelles Umweltoptimum.',
'BeiHandwäsche wird Schaum erwünscht,Fettentfernung bleibtgleich. Wie ändert der Zweck die Gewichtung,ohne chemischeDaten umzuschreiben?',
['Strukturwahl als bedingte Formulierungsoptimierung erklären.','Kopfhydratation,Trübung undFettentfernung getrennt nutzen.','Schaumnebenbedingung und ungeprüfteIonenmischung beurteilen.'])
fix(20,'a',
'EigeneSeifensynthese:C12H24O2+NaOH→C12H23O2Na+H2O;M200,40,222,18g/mol. Batch200gSäure+40gNaOH+600gProzesswasser+100gLösemittel;180g isoliertesZielprodukt,RestvollständigAbfall. KeineRückgewinnung/Gutschrift,Katalysator0. Zwei getrennteRänder:mit/ohneProzesswasser. KeinVersuch.',
'Berechne Atomökonomie,Ausbeute,E-Faktor,PMI und begründe verschiedene Aussagen. PrüfePMI=E+1 für beideRänder. Warum ist dies keine Atomökonomie für bloßes Zusammenmischen einesWaschpulvers?',
'Atomökonomie222/240=92,5%;theoretisch222gProdukt,Ausbeute180/222=81,08%. MitWasserInput940g,Abfall760g:PMI5,222,E4,222. Ohne600gProzesswasserInput340g,Abfall160g:PMI1,889,E0,889. StöchiometrischesReaktionswasser bleibt im zweitenAbfallrand. PMI=E+1 gilt hier wegenInput=Produkt+Abfall;Recycling verlangt andere transparenteRänder. Atomökonomie ist theoretischreaktionsbezogen,Ausbeute tatsächlich,PMI/E prozessbezogen;Toxizität/Energie fehlen.',
'Bei gleicherReaktion wird dasLösemittelvolumen halbiert. WelcheKennzahl bleibt,welcheMassendaten brauchen eine neueBestimmung?',
['Reaktion,Ausbeute undProzessmassenrand unterscheiden.','92,5%,81,08% und beidePMI/E-Paare einschließlichReaktionswasser berechnen.','BedingtesPMI=E+1 und fehlendeReaktionsatomökonomie beimMischen erklären.'])
fix(20,'b',
'EigeneFormulierung:6kgTensid+2kgBuilder+2kgWasser werden ohneReaktion gemischt. Input10kg,Abfüllverlust0,2kg,Produkt9,8kg. KeineVerpackung/Rückgewinnung. Mögliche vorgeschalteteSynthese:C13H26O2+NaOH→C12H23O2Na+CH3OH;M214,40,222,32g/mol. Gleichwertige realeWaschleistung beiderSynthesewege ist nicht angenommen.',
'BerechnePMI/E derFormulierung. Warum ist „100%Atomökonomie beimMischen“ methodisch falsch? Berechne dieAtomökonomie derReaktion und vergleiche20a. Beweist ein größererWert stets geringereUmweltlast?',
'PMI10/9,8=1,020408,E0,2/9,8=0,020408. OhneReaktion gibt es keine entsprechendeReaktionsatomökonomie;100%verwechseltMischen undSynthese. Methylestersaponifikation:222/254=87,40%gegen92,5%beiNeutralisation. Das bewertet nur idealeStöchiometrie,keineLösemittel,Ausbeute,Energie oderGefährlichkeit. Prozesse benötigen gleicheProdukt-/Nutzränder;PMI nahe1 beweist ebenfalls keineNachhaltigkeit.',
'NurWasser geht verloren und dieProduktkonzentration ändert sich. Warum sichern gleicheMasse undPMI=E+1 jetzt keine gleicheNutzfunktion?',
['Mischen und vorgelagerteReaktion methodisch trennen.','PMI1,020408,E0,020408 und87,40% herleiten.','Massenkennzahl gegen Funktion,Toxizität undEnergiegrenze abgrenzen.'])
fix(18,'c',
'EigenesZeolithmodell:Vier feste negativeGerüstladungen werden durch vierNa+ ausgeglichen;nach Austausch sind zweiCa²+ gebunden. KonzentrierteNaCl-Lösung verschiebt imModell zurNa-Belegung. FreiesCa²+ bleibt inSalzlösung erhalten. KeineRegeneration/Entsorgung alsLernendenversuch.',
'ErkläreSättigung undRegeneration mitLadung/Gleichgewicht. BilanziereproGerüst und prüfe „entferntalleSalzefürimmer“. WelcherAbfall-/Ressourcenrand ist nötig?',
'ZeoNa4+2Ca²+⇌ZeoCa2+4Na+. EndlichePlätze erklärenSättigung;hoheNa+-Aktivität begünstigt unterModellannahmenRückaustausch. RealeSelektivität/Kinetik bleibenwichtig. Ca²+ wird verlagert,nichtvernichtet. NaCl,Spülwasser undAbwasserbehandlung gehören zurProzessbewertung. Diesbelegt keinenTensidabbau.',
'Bei gleicherPorengröße enthält dasGerüst wenigerAl. Warum garantiert dies keine gleicheAustauschkapazität?',
['Gerüstladung,Gegenionenzahl undSättigung verbinden.','2Ca²+:4Na+ und reversibleBelegung darstellen.','Salz-/Abwassergrenze ohne vorgetäuschtenStoffabbau benennen.'])
fix(18,'d',
'FiktiverAlkylphenolethoxylat-Pfad:langerEthoxykopf→kürzereHomologe→Alkylphenol. Gefahrenkarte:problematische langsamabbaubareZwischenprodukte. Tag10:90%Ausgangsstoffentfernung,10%CO2-C,Zwischenprodukte nachgewiesen. EPA dient alsPrimärbeleg für dieBewertungsdimensionen,nicht alsProduktzertifizierung.',
'Beschreibe denPfad gegenüber18b und beurteile „90%abbaubar=umweltverträglich“. WelcheMessungen/Bedingungen fehlen für eine belastbarereAussage?',
'Ethoxyverkürzung istPrimärabbau,10%CO2-C keine weitgehendeMineralisierung. ProblematischeProdukte widerlegen dieAbleitung ausAusgangsstoffentfernung allein. AromatischerKern/Verzweigung unterscheiden denStoff vomlinearenC12-Alkohol;identischeβ-Oxidation ist nichtbelegt. C-Verbleib,zeitlicheProduktkonzentration,O2,Temperatur,Inokulum undaquatischeWirkung sind erforderlich. EPA-Kriterien sind keine eigeneFreigabe.',
'Später sorbiert dasAlkylphenol anSchlamm,CO2-C bleibt niedrig. Warum müssenPhasenverteilung undchemischerAbbau getrennt gemessen werden?',
['StoffspezifischenPrimärabbau anhandgegebenerStrukturen beschreiben.','90%Entfernung/10%CO2 mitproblematischenProdukten deuten.','Mineralisierung,Toxizität undAdsorption getrennt belegen.'])

def save():
 P.write_text(json.dumps(D,ensure_ascii=False,indent=2)+'\n')
if __name__=='__main__':save()
