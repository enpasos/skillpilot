import json, hashlib
from pathlib import Path
from datetime import datetime, timezone

ROOT=Path('/home/enpasos/projects/skillpilot')
OUT=Path(__file__).resolve().parents[1]
BUNDLE=OUT.parent/'bundle'
ISO=Path('/tmp/skillpilot-wirtschaft-company20-native-current191-cpy8d0q4')
def digest(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,x):
    assert not p.exists(),p
    p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')

# Actual independent reviewer judgments following whole DE/EN/current-context
# reading and actual full PDF views3–22. Materialization is not inspection.
J=[
[
'Spezialisierung verteilt Aufgaben nach Fähigkeiten, Kooperation verbindet Beiträge und Koordination stimmt Reihenfolge, Zeiten und Übergaben ab. Arbeitsteilung kann Abläufe verbessern, erzeugt aber Abstimmungsbedarf.',
'Specialisation allocates tasks by capabilities, cooperation connects contributions and coordination aligns sequence, timing and handovers. Divided work can improve workflows but creates coordination needs.',
'Die Person erklärt die drei Prinzipien an einem konkreten arbeitsteiligen Alltagsablauf und begründet eine Verbesserung über Aufgabenteilung, gemeinsames Handeln und abgestimmte Übergaben.',
'The learner explains the three principles through a concrete everyday workflow and justifies an improvement through task allocation, cooperation and coordinated handovers.',
'Fällt eine beteiligte Person aus oder entsteht ein Engpass bei der Übergabe, passt die Person die Arbeitsteilung an und erklärt den veränderten Koordinationsbedarf.',
'When one participant is absent or a handover becomes a bottleneck, the learner adapts the division of work and explains changed coordination needs.',
'DE/EN verbinden Erklärung und Anwendung derselben drei arbeitsteiligen Prinzipien, ohne das spätere Unternehmensmodell vorwegzunehmen. Die ganze PDF-Seite zeigt gemeinsames Backen, Übergaben und Uhr mit offener Verbesserung. Private Klemmbrettdetails bleiben verborgen; Orientierung ist externe Grundlage, Unternehmensaufbau und Prozessanalyse sind sichtbare Nachfolger.'],
[
'Funktionsbereiche wie Beschaffung, Produktion, Absatz und Verwaltung erfüllen unterschiedliche Aufgaben und wirken über Güter, Informationen und Finanzierung zusammen. Ein Unternehmen ist mehr als eine Liste isolierter Abteilungen.',
'Functions such as procurement, production, sales and administration have different tasks and interact through goods, information and finance. A company is more than isolated departments.',
'Die Person stellt an einem Unternehmensfall zentrale Funktionsbereiche nachvollziehbar dar und erläutert ihre Beziehungen statt lediglich Fachwörter oder Kästen aufzuzählen.',
'The learner represents key functions in a company case and explains their relationships rather than merely listing terms or boxes.',
'Bei einem Dienstleistungsunternehmen oder ausgelagerter Tätigkeit passt die Person die Darstellung an und zeigt, welche Funktion weiterhin nötig ist, obwohl die Organisation anders aussieht.',
'For a service company or outsourced activity, the learner adapts the representation and shows which function remains necessary despite a different organisation.',
'Beide Fassungen verlangen Aufbau und Zusammenwirken als begrenzte Darstellungsleistung. Die ganze PDF-Seite verbindet Beschaffung, Produktion und Absatz eines Vogelhauses mit unterstützender Verwaltung; sie schreibt kein universelles Organigramm vor. Spezialisierung ist Grundlage; die folgenden Prozess-, Marketing-, Berufs- und Datenthemen bleiben getrennt.'],
[
'Kernprozesse erzeugen die angebotene Leistung; Unterstützungsprozesse ermöglichen ihre verlässliche Durchführung. Die Einordnung richtet sich nach dem jeweiligen Geschäftsmodell und dem Prozessbeitrag, nicht allein nach Abteilungsnamen.',
'Core processes create the offered output; support processes enable reliable delivery. Classification depends on the business model and process contribution rather than department names alone.',
'Die Person analysiert einen Unternehmensablauf, ordnet Schritte ihrer Funktion nach als Kern- oder Unterstützung ein und begründet, wie Unterstützungsprozesse zur Leistungserstellung beitragen.',
'The learner analyses a company workflow, classifies steps as core or support by their function and explains how support contributes to value creation.',
'In einem Unternehmen, dessen verkaufte Leistung zuvor nur Unterstützung war, überprüft die Person die Prozesszuordnung und erklärt die Abhängigkeit vom Geschäftsmodell.',
'In a company selling an activity previously treated as support, the learner reassesses the classification and explains its dependence on the business model.',
'DE/EN fokussieren die funktionale Unternehmensanalyse, nicht die nachfolgende detaillierte Produktionsgestaltung. Die ganze PDF-Seite trennt Liefer-/Back-/Verpackungs-/Verkaufsfolge von Personal, Rechnungswesen und IT und verbindet beide Ebenen. Unternehmensaufbau und Arbeitsteilung sind explizite Grundlagen; Geschäftsmodell und Bilanz sind Nachfolger.'],
[
'Ablauf, Arbeitsteilung, Produktionsgestaltung und IT beeinflussen sich im konkreten Betrieb. Eine technische Unterstützung verändert Information und Koordination; sie garantiert keine höhere Produktivität unter beliebigen Bedingungen.',
'Workflow, divided work, production design and IT interact in a concrete business. Technical support changes information and coordination but does not guarantee productivity under every condition.',
'Die Person analysiert die verbundenen Arbeitsschritte, Zuständigkeiten, Produktionsgestaltung und IT-Unterstützung eines vorgegebenen Unternehmensbeispiels und erklärt ihre funktionalen Beziehungen.',
'The learner analyses connected steps, responsibilities, production design and IT support in a supplied company case and explains their functional relationships.',
'Nach Änderung von Produktionsmenge oder Einführung einer digitalen Ablaufsteuerung erklärt die Person, welche Schritte und Übergaben sich verändern und wo neue Engpässe entstehen können.',
'After output volume changes or digital workflow control is introduced, the learner explains changed steps and handovers and possible new bottlenecks.',
'Die beiden Sprachfassungen decken dieselben vier Aspekte einer zusammenhängenden konkreten Betriebsanalyse ab. Die ganze PDF-Seite zeigt Holz-/Hockerprozess, verteilte Tätigkeiten und IT-Verbindungen; die gemeinsame Tafel ist zur Gruppe sichtbar. Kern-/Unterstützungsprozesse bilden die Voraussetzung, umfassende unternehmerische Bewertung wird hier nicht zusätzlich verlangt.'],
[
'Eine Unternehmenspräsentation wirkt abhängig von Adressaten, Inhalt, Struktur, Verständlichkeit und belegten Aussagen. Zustimmung oder attraktive Gestaltung allein beweisen weder sachliche Qualität noch tatsächlichen Geschäftserfolg.',
'A company presentation works through its audience, content, structure, clarity and supported claims. Approval or attractive design alone proves neither factual quality nor business success.',
'Die Person analysiert an einer vorgelegten Präsentation die angesprochene Zielgruppe, wahrscheinliche Wirkung und erfüllte oder verfehlte Erfolgskriterien und begründet ihre Einschätzung am Material.',
'The learner analyses the audience, plausible effects and met or unmet effectiveness criteria in a supplied presentation and grounds the assessment in the material.',
'Wechselt die Präsentation von möglichen Kunden zu Finanzierungspartnern, erklärt die Person, welche Informationen und Belege für die neue Zielgruppe anders gewichtet werden müssen.',
'When the audience changes from potential customers to financiers, the learner explains which information and evidence needs different emphasis.',
'DE/EN benennen Analyse der Adressatenwirkung und Erfolgskriterien statt eigenes Marketingkonzept oder behauptete Zuschauerwirkung. Die ganze PDF-Seite zeigt Flaschenpräsentation, Adressaten, Klarheit und offene Wirkung. Der Unternehmensaufbau liefert fachlichen Inhalt; der nachfolgende Phase-Test ist nur sichtbarer Kontext.'],
[
'Marketing verbindet ein Angebot mit Kundenbedürfnissen und Zugangsmöglichkeiten. Sein Beitrag zum Unternehmenserfolg hängt auch von Produkt, Preis, Wettbewerb und Umsetzung ab; Sichtbarkeit oder Werbung allein garantiert keinen Gewinn.',
'Marketing connects an offer with customer needs and access. Its contribution to company success also depends on product, price, competition and execution; visibility or advertising alone guarantees no profit.',
'Die Person schätzt am konkreten vertrauten Produkt begründet ein, wie Marketing Nachfrage und Erfolg unterstützen kann und welche Bedingungen eine pauschale Erfolgsbehauptung begrenzen.',
'Using a familiar concrete product, the learner explains how marketing may support demand and success and which conditions limit a blanket success claim.',
'Bei derselben Werbemaßnahme für ein Produkt mit anderer Zielgruppe oder verändertem Preis prüft die Person den erwarteten Beitrag zum Erfolg neu.',
'For the same promotion applied to another audience or changed price, the learner reassesses the expected contribution to success.',
'Die whole DE/EN-Beschreibungen begrenzen die Einschätzung auf konkrete vertraute Produkte. Aktueller Kontext AB2 passt zur begründeten Wirkungseinordnung; freie umfassende Konzeption folgt erst später. Die ganze PDF-Seite zeigt Rucksack, unterschiedliche Medien und eine offene Erfolgsfrage statt garantierter Gewinnentwicklung.'],
[
'Produkt-, Preis-, Vertriebs- und Kommunikationsmaßnahmen verfolgen Ziele über unterschiedliche Wirkungsmechanismen. Eine Maßnahme ist nach Ziel, konkreter Gestaltung und Bedingungen ihrer Wirkung zu analysieren, nicht nach ihrer Bezeichnung allein.',
'Product, pricing, distribution and communication measures pursue goals through different mechanisms. Analysis concerns the objective, concrete design and conditions of effect rather than the label alone.',
'Die Person analysiert vorgelegte Marketingmaßnahmen aus verschiedenen Bereichen, verknüpft konkrete Gestaltung mit dem jeweiligen Ziel und erklärt plausible Wirkungsmechanismen und Grenzen.',
'The learner analyses supplied measures from different marketing areas, relates design to objectives and explains plausible mechanisms and limits.',
'Bei veränderter Zielgruppe oder einem Vertriebskanalwechsel erläutert die Person, warum die Wirkung einer bisherigen Maßnahme anders ausfallen kann, ohne neue Konzeption zu behaupten.',
'When the audience or distribution channel changes, the learner explains why an existing measure may have a different effect without claiming to design a new concept.',
'Beide Fassungen verlangen die gleiche dreigliedrige Maßnahmenanalyse; die spätere abgestimmte Gesamtgestaltung ist ein eigener Nachfolger. Die ganze PDF-Seite gruppiert Produktmerkmale, Preisalternativen, Vertriebswege und Kommunikation um eine Flasche. Gedankensymbole illustrieren Bedürfnisse, ohne empirische Wirkung oder universelle Kundenreaktion zu behaupten.'],
[
'Ein Marketingkonzept stimmt Maßnahmen auf Produkt, Zielgruppe und gemeinsame Ziele ab. Einzelne attraktive Maßnahmen können einander widersprechen; eine begründete Auswahl berücksichtigt Kohärenz und verfügbare Mittel.',
'A marketing concept aligns measures with product, audience and shared objectives. Individually attractive measures can conflict; justified choices account for coherence and available means.',
'Die Person entwickelt für ein ausgewähltes Produkt ein einfaches abgestimmtes Konzept und begründet die Maßnahmen anhand nachvollziehbarer Kriterien und ihrer gegenseitigen Passung.',
'The learner develops a simple coordinated concept for a selected product and justifies measures through defensible criteria and their mutual fit.',
'Ändern sich Budget, Zielgruppe oder Absatzweg, überarbeitet die Person das Konzept und begründet, welche miteinander verbundenen Maßnahmen gemeinsam angepasst werden müssen.',
'When budget, audience or sales channel changes, the learner revises the concept and explains which connected measures must be adjusted together.',
'Die ganze DE/EN-Kompetenz verlangt eigenständige abgestimmte Konstruktion mit Kriterien; AB3 folgt dieser Auswahl-/Begründungsleistung, nicht einem bloßen Verb. Die ganze PDF-Seite zeigt Team, Zielgruppe, verbundene Maßnahmen und gemeinsame Abstimmungs-/Begründungstafel. Persönliche Tischhefte bleiben ohne gerichteten fachlichen Inhalt.'],
[
'Die Bilanz stellt Vermögensverwendung und Kapitalherkunft zu einem Zeitpunkt gegenüber. Aktiva und Passiva zeigen dieselben Gesamtmittel aus zwei Perspektiven; Passiva sind nicht ausschließlich Schulden.',
'A balance sheet compares asset use and capital sources at a point in time. Assets and financing describe the same total means from two perspectives; liabilities-and-equity are not debts alone.',
'Die Person ordnet vorgegebene Vermögenswerte, Eigenkapital und Fremdkapital korrekt zu, erstellt eine vereinfachte Bilanz und erklärt die Gleichheit beider Summen.',
'The learner classifies supplied assets, equity and debt correctly, prepares a simplified balance sheet and explains equal totals on both sides.',
'Bei einer anderen Vermögenszusammensetzung oder veränderten Kapitalquelle erstellt die Person die Bilanz erneut und trennt Bestandsdarstellung von periodischem Gewinn.',
'For a changed asset composition or capital source, the learner prepares the balance sheet again and distinguishes the stock statement from period profit.',
'DE/EN formulieren eine eindeutige Bilanzkonstruktion aus Vermögenswerten und Kapitalquellen. Die ganze PDF-Seite zeigt gleichgewichtige Aktiva/Passiva mit Maschine, Waren, Geld sowie Eigentümer- und Fremdfinanzierung; sie setzt Passiva nicht mit reinen Schulden gleich. Die Geschäftsvorfälle sind der nächste Lernschritt, GuV bleibt später getrennt.'],
[
'Ein Geschäftsvorfall verändert verbundene Bilanzpositionen unter Wahrung der Bilanzgleichheit. Doppelte Buchführung erfasst diese zusammengehörigen Veränderungen; sie bedeutet weder doppelte Einnahme noch automatisch Gewinn.',
'A transaction changes connected balance-sheet positions while preserving equality. Double-entry records these related changes; it means neither double receipts nor automatic profit.',
'Die Person stellt einfache Geschäftsvorfälle in der Bilanz dar, erklärt die korrespondierenden Veränderungen und ordnet daran das Grundprinzip doppelter Erfassung ein.',
'The learner represents simple transactions in the balance sheet, explains corresponding changes and identifies the principle of recording both connected effects in context.',
'Bei einem Aktivtausch statt einer Kreditaufnahme prüft die Person, welche Positionen sich ändern, weshalb die Bilanzsumme gleich bleiben kann und die doppelte Erfassung weiterhin gilt.',
'For an asset exchange instead of borrowing, the learner explains changed positions, why total assets may remain constant and why recording both effects still applies.',
'Die bilingualen Texte verbinden Bilanzwirkung und Grundprinzip an einfachen Geschäftsvorfällen. Die ganze PDF-Seite zeigt Kreditaufnahme: Vermögen und Schulden steigen je100000 bei gleicher Waage, ohne Ertrag zu behaupten. Bilanz ist Voraussetzung und Erfolgskonten sind Nachfolger; vollständige Buchungstechnik wird nicht hinzugefügt.'],
[
'Ertrag und Aufwand verändern den periodenbezogenen Erfolg und damit Eigenkapital; Erfolgskonten bilden diese Änderungen gesondert ab. Erfolg und Zahlungszeitpunkt sind zu unterscheiden.',
'Income and expense change period profit and hence equity; income and expense accounts record these changes separately. Profit effects and payment timing must be distinguished.',
'Die Person beschreibt die Folgen einfacher erfolgswirksamer Vorgänge, benennt Ertrag oder Aufwand und erklärt die Einordnung der Erfolgskonten unter Eigenkapital.',
'The learner explains effects of simple profit-affecting transactions, identifies income or expense and classifies the accounts as linked subaccounts of equity.',
'Bei Verkauf auf Rechnung oder späterer Zahlung erläutert die Person, warum Erfolgswirkung und Geldbewegung zeitlich auseinanderfallen können und eine Zahlung allein nicht Ertrag beweist.',
'For a credit sale or later payment, the learner explains why profit effects and cash movements may differ in timing and why payment alone proves no income.',
'Die DE/EN-Beschreibungen decken einfache Erfolgswirkung und Unterkonten des Eigenkapitals ab; die separate GuV-Ermittlung folgt danach. Die ganze PDF-Seite verbindet Ertrag/Aufwand mit Plus/Minus zum Eigenkapital und stellt Zahlung durch eine getrennte Uhrfrage dar. Kein Kredit wird als Ertrag und kein Materialeinkauf automatisch als Verbrauch ausgegeben.'],
[
'GuV ermittelt periodischen Erfolg als Erträge minus Aufwendungen. Ein positiver Saldo ist Gewinn, ein negativer Verlust; der Saldo entspricht nicht notwendig der Veränderung des Bankkontos.',
'An income statement measures period profit as income minus expenses. A positive balance is profit and a negative one loss; it need not equal the change in bank deposits.',
'Die Person ordnet die vorgegebenen Erträge und Aufwendungen einer Periode zu, stellt sie in der GuV gegenüber und berechnet und deutet Gewinn oder Verlust.',
'The learner assigns supplied income and expenses to the period, compares them in the income statement and calculates and interprets profit or loss.',
'Bei höheren Aufwendungen oder zeitlich abweichenden Zahlungen berechnet die Person den neuen Erfolg und erklärt, warum Verlust und Zahlungsbilanz getrennt betrachtet werden.',
'With higher expenses or payments at different times, the learner recalculates profit or loss and explains why loss and cash balance require separate treatment.',
'Die Beschreibungen operationalisieren die gleiche periodenbezogene Gegenüberstellung; Englisch nennt Gewinn oder Verlust ausdrücklich. Die ganze PDF-Seite zeigt als Beispiel100 minus80 gleich20 auf einer gemeinsamen Tafel, rechnerisch korrekt und ohne Cashflowgleichsetzung. Bilanz-/GuV-Kennzahlen sind ein eigener Nachfolger.'],
[
'Bilanz- und GuV-Kennzahlen setzen ausgewählte Größen ins Verhältnis. Aussagekraft hängt von Definition, Zeitraum und Branche ab; dieselbe Quote rechtfertigt ohne Vergleichskontext kein universelles Gesundheitsurteil.',
'Financial ratios relate selected balance-sheet and income-statement measures. Meaning depends on definition, period and industry; the same ratio supports no universal health judgment without context.',
'Die Person analysiert vereinfachte Rechnungsdaten, berechnet ausgewählte Kennzahlen mit passenden Bezugsgrößen und interpretiert sie am gegebenen Branchenkontext und ihren Grenzen.',
'The learner analyses simplified statements, calculates selected ratios with suitable denominators and interprets them using the given industry context and limits.',
'Bei identischer Quote in einem kapitalintensiven Betrieb und einem Dienstleistungsbetrieb erklärt die Person unterschiedliche Einordnung und welche zusätzlichen Angaben für ein Urteil fehlen.',
'For an identical ratio in capital-intensive manufacturing and services, the learner explains different interpretations and which additional information is missing for a judgment.',
'Die ganze DE/EN-Kompetenz enthält Berechnung und branchenspezifische Interpretation, statt bloßer Quotennennung oder Investempfehlung. Tatsächliche PDF-Seite zeigt Bäckerei und Industriebetrieb mit gemeinsamer Bilanz-/GuV-Lupe und offener Einordnung. Die weiterführende Finanz-/Ertragslage ist als externe Folge sichtbar und wird nicht vorweggenommen.'],
[
'Eine geeignete Grafik übersetzt Bilanzbestände oder GuV-Ströme beziehungsweise deren Entwicklung für eine Zielgruppe. Datenbezug, Einheiten, Zeitraum und Diagrammwahl bestimmen, ob sie sachlich verständlich bleibt.',
'A suitable graphic translates balance-sheet stocks or income-statement flows and their development for an audience. Data basis, units, period and chart choice determine faithful communication.',
'Die Person verwendet eine Tabellenkalkulation, wählt passende Daten und Diagramme und beschriftet die grafische Darstellung so, dass die angesprochene Zielgruppe die Rechnungsinformationen korrekt verstehen kann.',
'The learner uses spreadsheet software, selects relevant data and charts and labels the display so the intended audience can correctly understand the accounting information.',
'Bei anderer Zielgruppe oder Wechsel von Bestandsstruktur zu zeitlicher Entwicklung passt die Person Diagrammtyp und Erläuterung an und begründet die Auswahl.',
'For another audience or a change from stock composition to temporal development, the learner adapts chart type and explanation and justifies the choice.',
'DE/EN verlangen dieselbe ausdrücklich softwaregestützte zielgruppenorientierte Darstellung. Die ganze PDF-Seite zeigt Tabelle und verschiedene Diagramme auf einem gemeinsam sichtbaren Bildschirm. Unbezifferte Beispielsymbole sind Orientierung, keine echten Rechnungsdaten; Kennzahlenanalyse ist Grundlage, keine bestimmte Softwaremarke wird vorgeschrieben.'],
[
'Ein Geschäftsmodell verbindet Bedarf, angebotene Leistung, Kernprozess, Ressourcen und wirtschaftliche Grundentscheidungen. Ein systematisches Projektmodell muss diese Elemente zueinander passend darstellen, ohne wirtschaftlichen Erfolg zu garantieren.',
'A business model connects needs, offered value, core process, resources and basic business decisions. A systematic project model must present their fit without guaranteeing commercial success.',
'Die Person stellt ein eigenes Projektmodell systematisch dar und erläutert, wie Leistung, Kernprozess und grundlegende Entscheidungen die wesentlichen Bedingungen eines tragfähigen Unternehmens verbinden.',
'The learner systematically presents their own project model and explains how output, core process and basic decisions connect the main conditions for a viable business.',
'Bei verändertem Kundenbedarf oder knapperer Ressource überarbeitet die Person die betroffenen Modellelelemente und begründet ihre gemeinsame Passung statt nur ein neues Produktetikett einzusetzen.',
'With changed customer needs or scarcer resources, the learner revises affected elements and explains their fit rather than merely relabelling the product.',
'Die ganzen DE/EN-Texte verlangen ein verbundenes projektbezogenes Modell mit Kernprozess und Grundentscheidungen; das ist eine zusammenhängende Konstruktion, keine lose Kompetenzliste. Die ganze PDF-Seite zeigt Bedarf, Leistung und Ressourcen-/Finanz-/Gesellschaftsentscheidungen. Prozess- und Marketinggrundlagen sind sichtbar, Projektmanagement und Stakeholderbewertung bleiben Nachfolger.'],
[
'Interessen und Stärken lassen sich mit konkreten Anforderungen verschiedener Unternehmensrollen vergleichen. Passung ist entwickelbar und kontextabhängig; eine Reflexion ist kein unveränderlicher Persönlichkeitstest oder festgelegtes Berufsurteil.',
'Interests and strengths can be compared with concrete requirements of business roles. Fit is developable and context-dependent; reflection is no fixed personality test or predetermined career verdict.',
'Die Person vergleicht selbst gewählte Interessen und Stärken mit nachvollziehbaren Rollenanforderungen und leitet eine begründete vorläufige Orientierung oder einen nächsten Erkundungsschritt ab.',
'The learner compares chosen interests and strengths with defensible role requirements and derives a justified provisional orientation or next exploratory step.',
'Ändern sich Aufgaben einer Rolle oder entwickelt die Person eine Fähigkeit weiter, überprüft sie die bisherige Passung und begründet eine mögliche neue Orientierung.',
'When role tasks change or a capability develops, the learner reassesses previous fit and justifies a possible changed orientation.',
'Die DE/EN-Beschreibungen verlangen konkrete reflexive Vergleichsleistung für Unternehmer- und Beschäftigtenrollen, nicht die rein motivierende Orientierungsabschlussregel. Die ganze PDF-Seite zeigt Interessen, Stärken, zwei Rollen und offene Wege; das persönliche Heft ist textfrei. Sie legt keinen Persönlichkeitstyp fest und erzwingt keine sensible Datenerhebung.'],
[
'Unternehmensdaten unterscheiden etwa Firmenzahl, Beschäftigung und Branchenabgrenzung. Datenbasierte Berufs- oder Unternehmensschlüsse müssen Bezugsgröße, Zeitraum und Aggregation beachten; nationale Verteilung beweist keine individuelle Erfolgswahrscheinlichkeit.',
'Business data distinguish measures such as firm counts, employment and industry scope. Career or business conclusions must respect denominators, period and aggregation; national distribution proves no individual success probability.',
'Die Person analysiert quantitative Daten zur deutschen Unternehmenslandschaft, erstellt sachgerechte Tabellenkalkulationsdiagramme und begründet daraus begrenzte Berufs- und Unternehmensschlüsse.',
'The learner analyses quantitative data on Germany’s business landscape, creates faithful spreadsheet charts and draws bounded justified career and business conclusions.',
'Bei Wechsel von Firmenanzahl zu Beschäftigtenzahl oder einer anderen Branchenabgrenzung überprüft die Person ihre bisherige Rangfolge und Konsequenzen statt sie unverändert zu übertragen.',
'When firm counts are replaced by employment counts or industry boundaries change, the learner reassesses previous rankings and implications instead of carrying them over unchanged.',
'Die ganze DE/EN-Kompetenz verbindet Datenanalyse, Tabellenkalkulationsdiagramm und begrenzte Schlussfolgerung als einen Prozess. Tatsächliche PDF-Seite zeigt schematische Deutschlandkarte, verschiedene Betriebe und offene Schlüsse. Gezeichnete Größen sind keine amtliche Rangfolge; echte Daten-/Sektordefinitionen müssen im getrennten Material belegt werden.'],
[
'Veränderungen der Arbeitswelt können zugleich Chancen und Risiken für Beschäftigte und berufliche Wege schaffen. Ihre Beurteilung hängt von Tätigkeiten, Rahmenbedingungen und gewählten Kriterien ab, nicht von einer sicheren technologischen Zukunft.',
'Changes in work can create both opportunities and risks for employees and career paths. Evaluation depends on tasks, conditions and criteria rather than a certain technological future.',
'Die Person beurteilt anhand aktueller bereitgestellter Informationen Chancen und Risiken einer Arbeitsentwicklung, begründet die Abwägung und leitet begrenzte Konsequenzen für berufliche Orientierung ab.',
'Using supplied current information, the learner evaluates opportunities and risks of a work development, explains the trade-off and derives bounded career-orientation implications.',
'Bei verändertem Tätigkeitstyp oder neuen Rahmenbedingungen prüft die Person, ob die frühere Chance oder das Risiko weiterhin gilt, und passt Orientierungsschlüsse an.',
'For a changed task type or new conditions, the learner checks whether earlier opportunities or risks still apply and adapts career-orientation conclusions.',
'DE/EN enthalten Urteil über Chancen/Risiken und anschließende Orientierung in derselben klaren Leistung. Die ganze PDF-Seite stellt digitale Zusammenarbeit möglichen Belastungen und unsicheren Rollenentwicklungen gegenüber; dieselbe zentrale Person bleibt in den Möglichkeiten erkennbar. Kein automatischer Arbeitsplatzverlust oder vorgegebener Lebensweg wird behauptet.'],
[
'Staatliche Infrastruktur, Regeln und finanzielle Bedingungen verändern Handlungsmöglichkeiten und Kosten von Unternehmen. Wirkungen sind vom konkreten Rahmen und den betroffenen Interessen abhängig; Zulässigkeit, Anreiz und wirtschaftliche Attraktivität sind zu unterscheiden.',
'Infrastructure, rules and financial conditions change business opportunities and costs. Effects depend on the concrete framework and affected interests; legality, incentive and economic attractiveness are distinct.',
'Die Person beurteilt am bereitgestellten Unternehmensfall, wie benannte staatliche Bedingungen konkrete Entscheidungen beeinflussen, begründet Wirkungswege und wägt unterschiedliche Folgen anhand nachvollziehbarer Kriterien ab.',
'The learner evaluates how specified government conditions affect decisions in a supplied business case, explains mechanisms and weighs consequences using defensible criteria.',
'Bei Veränderung einer Regel, Infrastrukturleistung oder Förderung überprüft die Person Handlungsmöglichkeiten und Abwägung erneut und benennt, welche Bedingungen für den Vergleich gleich bleiben.',
'When a rule, infrastructure service or subsidy changes, the learner reassesses options and trade-offs and identifies conditions held constant for comparison.',
'Die ganzen DE/EN-Beschreibungen benennen dieselbe Rahmen-/Wirkungsbeurteilung; aktueller AB3-Kontext passt zur begründeten Abwägung. Die ganze PDF-Seite verbindet staatlichen Rahmen, offene Abwägung und Unternehmensalternativen. SEPARATER V-BLOCKER: Planblatt im Vordergrund ist aufrecht zum Betrachter und kopfstehend zur Unternehmerin; eigener tatsächlicher native/360/680-REJECT-Receipt liegt in inspection/65d9-targeted-current-source-view. Deshalb keine aktuelle Gesamtseiten-/Bildfreigabe; Beschreibung bleibt KEEP, neue Bild-/Seitenbindung muss gezielt nachgeprüft werden.'],
[
'Stakeholder beurteilen Unternehmenshandeln nach verschiedenen Interessen und Betroffenheiten. Ein verantwortliches Urteil berücksichtigt Unternehmenserfolg, Beschäftigung, Kundschaft und gesellschaftliche Folgen, ohne diese automatisch harmonisch gleichzusetzen.',
'Stakeholders assess business action through different interests and effects. A responsible judgment considers business success, employment, customers and societal consequences without automatically treating them as harmonious.',
'Die Person bewertet eine Unternehmensentscheidung aus mehreren Stakeholderperspektiven, begründet Interessenkonflikte und bezieht gesellschaftliche Verantwortung und wirtschaftliche beziehungsweise gesellschaftliche Unternehmensbedeutung ein.',
'The learner evaluates a business decision from several stakeholder perspectives, explains conflicts and includes social responsibility and the economic and societal role of firms.',
'Bei veränderter Entscheidung oder einer zusätzlich betroffenen Gruppe prüft die Person ihr Urteil erneut und legt offen, welche Gewichtung die Gesamtbewertung verändert.',
'For a changed decision or an additional affected group, the learner reassesses the judgment and explains which weighting changes the overall evaluation.',
'Die DE/EN-Texte verknüpfen Stakeholderbewertung, Verantwortung und Unternehmensbedeutung ohne vorgeschriebenes einheitliches Werturteil. Die ganze PDF-Seite zeigt Kunden, Beschäftigte, Eigentümer und Gemeinschaft mit unterschiedlichen Interessen und offener Waage. Eigenes Geschäftsmodell ist Grundlage; die weiterführende Zielsetzungsanalyse bleibt ein getrenntes externes Folgeziel.']
]

inp=json.loads((OUT/'description-review-input.json').read_text())
campaign=json.loads((OUT/'description-review-campaign.json').read_text())
manifest=json.loads((BUNDLE/'manifest.json').read_text())
render=json.loads((BUNDLE/'book.pdf.render-manifest.json').read_text())
assert len(J)==len(inp['goals'])==20
assert manifest['bundleFingerprint']==campaign['bundleFingerprint']=='sha256:35dd2ed268cc89d680297d4f88acdbba571e8117684a1862f1d2bd1167361a8c'
assert manifest['bookModelDigest']==campaign['bookDigest']=='sha256:7a5a48f5646f168ad0dafe64dc11c0d93d0b4e68bc7a662c025e47531147cc92'
batch=campaign['batches'][0];assert batch['goalIds']==[g['goalId'] for g in inp['goals']]
runid=campaign['roundId']+'.actual-codex-session'
now=datetime.now(timezone.utc).isoformat()
artifacts=[]
for a in manifest['artifacts']:
    assert digest(BUNDLE/a['path'])==a['digest']
    artifacts.append({'role':a['role'],'digest':a['digest']})
batchpath=OUT/'batches'/f"{batch['batchId']}.input.jsonl"
assert digest(batchpath)==batch['batchInputFingerprint']
artifacts.append({'role':'description_review_batch_input_jsonl','digest':digest(batchpath)})
records=[];inspections=[]
keys=['essentialUnderstandingDe','essentialUnderstandingEn','observablePerformanceDe','observablePerformanceEn','transferExpectationDe','transferExpectationEn']
for i,(g,j) in enumerate(zip(inp['goals'],J)):
    p=g['reviewContext']['page'];assert p['evidenceReview'] is None and g['reviewContext']['evidenceProfile'] is None
    imagepath=ISO/'app/public'/p['visualization']['url'].lstrip('/');assert digest(imagepath)==p['visualization']['originalDigest']
    pdfpage=OUT/'inspection'/f'native-page-{i+3:02}.png';assert pdfpage.exists()
    rationale=j[6]+' Legacy-Buch-P und evidenceReview sind tatsächlich null, deshalb honest create; diese D-Runde behauptet keine erneute Prüfung nicht eingebetteter P-Fälle. Raw Tags, sourceRef und Anwendbarkeit ersetzen keine eigenständig geprüfte effektive Projektion oder vollständige Quellenabdeckung.'
    records.append({'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json','schemaVersion':1,'recordId':campaign['roundId']+'.'+g['goalId'][:8],'runId':runid,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],**{k:g[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']},'decision':'keep','understandingEvidence':dict(zip(keys,j[:6])),'rationale':rationale,'evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':'create','recordStatus':'candidate','reviewAuthority':'ai_candidate'})
    asset=next(a for a in render['assets'] if a['publicPath']==p['visualization']['url'])
    assert asset['sourceSha256'] in [p['visualization']['originalDigest'],p['visualization']['originalDigest'][7:]]
    inspections.append({'goalId':g['goalId'],'goalFingerprint':g['goalFingerprint'],'pageFingerprint':g['pageFingerprint'],'physicalPdfPage':i+3,'actualWholeNativePdfPageViewed':True,'actualWholeDeEnAndCanonicalPageContextRead':True,'pdfPagePath':str(pdfpage.relative_to(ROOT)),'pdfPageSha256':digest(pdfpage),'actualBoundSourcePngPath':str(imagepath),'actualBoundSourcePngSha256':digest(imagepath),'actualRenderDerivativeMetadata':asset,'actualFinding':rationale})
rp=OUT/'results'/f"{batch['batchId']}.records.jsonl";rp.parent.mkdir(exist_ok=True);assert not rp.exists()
rp.write_text(''.join(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n' for r in records))
start=json.loads((OUT/'inspection/actual-run-start.metadata.json').read_text())
params={'modelIdentifier':'not_exposed','generationParameters':'not_exposed','interactiveSession':True}
run={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':runid,**{k:campaign[k] for k in ['campaignId','roundId','bundleFingerprint','bookDigest','promptFingerprint','criteriaFingerprint','independenceGroupId']},'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint'],'provider':'OpenAI','model':start['model'],'role':'subject_reviewer','promptFamilyId':'independent-current-description-review-positive-understanding-v2','generationParametersFingerprint':'sha256:'+hashlib.sha256(json.dumps(params,sort_keys=True).encode()).hexdigest(),'blindToOtherRuns':True,'goalIds':batch['goalIds'],'inputArtifacts':artifacts,'startedAt':start['actualStartedAt'],'completedAt':now,'status':'completed','outputDigest':digest(rp),'toolchainVersion':'codex-interactive-independent-description-review-v1'}
runpath=rp.with_name(f"{batch['batchId']}.run.json");write(runpath,run)
v=OUT/'inspection/65d9-targeted-current-source-view/independent-current-image-perspective-REJECT.actual.receipt.json'
freeze=OUT/'inspection/frozen-twenty-eight-byteexact-own-countercheck.actual.json'
receipt={'schemaVersion':1,'role':'independent_description_reviewer','provider':'OpenAI','model':start['model'],'completedAt':now,'humanApprovalClaimed':False,'blindToRoundBAndRootPositiveVerdicts':True,'previousOwnRole':start['previousOwnRole'],'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],'actualFrozenTwentyEightCountercheckPath':str(freeze.relative_to(ROOT)),'actualFrozenTwentyEightCountercheckSha256':digest(freeze),'actualWholeCurrentDeEnCanonicalAndPageContextsRead':20,'actualWholeCurrentGermanPdfPhysicalPagesViewed':list(range(3,23)),'actualWholeHtmlTextRead':True,'englishTextActuallyReadFromStructuredInput':True,'englishPdfNotClaimed':True,'actualOwnPromptCriteriaCampaignRecordRunContractRead':True,'currentDescriptionDecisions':{'KEEP':20,'REVISE':0},'bookEvidenceProfilesActual':None,'bookEvidenceReviewsActual':None,'evidenceProfileRecommendations':{'create':20},'separatePositiveCaseReinspectionNotClaimed':True,'standaloneNative360680VisualizationApprovalForAll20NotClaimed':True,'separateActualCurrentVisualFinding':{'goalId':'65d9f38e-d35d-5d84-8b66-3c05e388734f','decision':'REJECT','receiptPath':str(v.relative_to(ROOT)),'receiptSha256':digest(v),'pendingCorrectionAndFreshBoundPageReview':True},'currentAuthoritativeCurricularAtomicDenominator':303,'currentLiveStrictCountNotChangedByReview':True,'criteriaHeaderLimitation':'Frozen supplementary criteria retain the historical heading Q4 author candidate criteria but their actual paragraphs are generic whole-goal/P separation requirements. Current whole canonical phaseE context is authoritative for this D review; no Q4 placement or embedded P is inferred.','actualNativeArtifactChecks':artifacts,'goals':inspections,'actualRecordsPath':str(rp.relative_to(ROOT)),'actualRecordsSha256':digest(rp),'actualRunManifestPath':str(runpath.relative_to(ROOT)),'actualRunManifestSha256':digest(runpath),'limitations':['No actual learner evidence or human release approval.','Separate P-v2 not pretended embedded in the legacy book.','This blind D-A result is not final strict closure;65d9 current image perspective blocker stays explicit.','No new whole-source coverage or effective private learner projection proof from raw tags.']}
write(OUT/'independent-round-a-inspection.receipt.json',receipt)
print(json.dumps({'records':str(rp.relative_to(ROOT)),'recordsSha256':digest(rp),'run':str(runpath.relative_to(ROOT)),'inspectionSha256':digest(OUT/'independent-round-a-inspection.receipt.json')},ensure_ascii=False))
