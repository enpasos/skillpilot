#!/usr/bin/env python3
"""Serialize the independently authored E1 D-B text after actual input/page reading.

Functional serialization: Apache-2.0. Own curricular evidence text: CC-BY-4.0.
This script does not make a fachlicher verdict or modify canonical data.
"""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
BUNDLE = HERE.parent / 'bundle'

def sha(path):
    return 'sha256:' + hashlib.sha256(path.read_bytes()).hexdigest()

def write_new(path, value):
    if path.exists():
        raise RuntimeError(f'Preserve prior artifact: {path}')
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

# Each tuple contains independently formulated DE/EN understanding, observable
# performance, changed-case transfer, a content judgement and actual image/page note.
TEXT = {
 '8768186a-a52c-50b3-a1d7-a56084aa31e0': (
  'Gesellschaftlicher Wandel zeigt sich in veränderten Tätigkeiten, Familienarrangements und Bildungswegen. Beschreibbare Entwicklungen einer Bevölkerung sind von der Erfahrung eines einzelnen Haushalts und von einer bereits bewiesenen Ursache zu unterscheiden.',
  'Social change appears in changing occupations, family arrangements and educational pathways. Describable developments in a population differ from one household\'s experience and from an already established cause.',
  'An ausdrücklich fiktiven Zeitvergleichsmaterialien zu Berufstätigkeit, Betreuung und Bildungsbeteiligung beschreibt die lernende Person die jeweils erkennbare Veränderung in Arbeit, Familie und Bildung. Sie verknüpft die Bereiche an einem passenden Alltagsszenario und kennzeichnet, welche Aussagen über einzelne Menschen das Material nicht erlaubt.',
  'Using explicitly fictional materials comparing employment, care arrangements and educational participation over time, the learner describes the visible changes in work, family and education. They connect the areas through an appropriate everyday scenario and identify which statements about individual people the material does not support.',
  'In einer unabhängig vorgelegten fiktiven Region mit mehr beruflicher Weiterbildung und unveränderten Familienformen beschreibt sie ein anderes Muster derselben drei Bereiche. Sie erkennt, dass Wandel nicht voraussetzt, dass sich alle Bereiche gleichzeitig oder bei jedem Menschen gleich verändern.',
  'In a separately presented fictional region with more vocational continuing education but unchanged family arrangements, the learner describes a different pattern across the same three areas. They recognise that change need not occur simultaneously in all areas or identically for every individual.',
  'KEEP: DE und EN verlangen dieselbe beschreibende Kompetenz in den drei Lebensbereichen. Der Orientierungsvorgänger und der externe Arbeitsmarktbericht begrenzen die Rolle: ein verständlicher Zeitvergleich, keine vollständige Berufsberatung oder unbelegte Ursachenanalyse. Die zusammenhängende Beschreibung sozialen Wandels ist in einer Aufgabe beobachtbar; eine routinemäßige Dreifach-Splittung wäre nicht fachlich begründet. Ein aktuelles Profil ist im eingefrorenen Input nicht enthalten.',
  'Die tatsächliche PDF-Seite zeigt A/B-Alltagsarrangements mit Handwerk, Familie, Laptop und begleitetem Lernen. Das Fragezeichen sowie A/B vermeiden eine behauptete historische Universalfolge. Bild und ganzer Beschreibungssatz sind vollständig auf einer Seite sichtbar; externe Orientierung und Arbeitsmarktbericht sind dargestellt.'
 ),
 '77edbcf9-d14d-547e-8a5f-43863a3e300b': (
  'Politische Reaktionen verbinden wahrgenommene soziale Veränderungen mit Zielen, Interessen und Instrumenten. Eine beabsichtigte Entlastung oder Teilhabe ist eine Wirkungsannahme, deren Umsetzung von Ressourcen und Zugang abhängt.',
  'Political responses connect perceived social changes with objectives, interests and instruments. Intended relief or participation is an expectation about effects whose implementation depends on resources and access.',
  'In einer fiktiven Gemeinde mit veränderten Betreuungsbedarfen und mehr älteren Einwohnern erläutert die lernende Person, weshalb der Rat längere Kinderbetreuung und barrierearme Wohnangebote erwägt. Sie erklärt jeweils den Weg von der Veränderung über das politische Ziel zur Maßnahme und benennt eine notwendige Umsetzungsbedingung.',
  'In a fictional municipality with changed care needs and more older residents, the learner explains why the council considers longer childcare hours and more accessible housing. For each measure they explain the link from the change through the political objective to the instrument and identify a necessary implementation condition.',
  'Ein neuer fiktiver Fall ersetzt demografischen Wandel durch den Übergang kommunaler Angebote ins Internet. Die lernende Person erläutert die Reaktion mit analogen Zugängen und Schulungsangeboten aus den betroffenen Bedürfnissen, statt dieselbe Maßnahme unverändert zu übertragen oder ihren Erfolg vorauszusetzen.',
  'A fresh fictional case replaces demographic change with municipal services moving online. The learner explains responses involving offline access and training from the needs affected, rather than transferring the same measure unchanged or assuming that it will succeed.',
  'KEEP: Die kurze Erläuterungskompetenz ist fachlich eindeutig und in EN gleichwertig. Die nachfolgenden Sozialisation-, Migrations-, Sozialstaats- und Familienpolitikziele vertiefen einzelne politische Zusammenhänge; hier genügt die erkennbare Reaktionskette. Der Satz behauptet weder eine bestimmte Politik als einzig richtige Lösung noch bereits erreichte Wirkungen. Das fehlende eingefrorene Profil erhält create.',
  'Auf der vollständigen PDF-Seite beraten unterschiedliche Personen am Tisch; Betreuung, Weiterbildung und zugängliches Wohnen erscheinen als mögliche Maßnahmen zu veränderten Bedürfnissen. Die vier tatsächlichen direkten Nachbarlinks stimmen mit dem gelesenen Kontext überein.'
 ),
 'd7332142-0deb-518c-ab51-0e16cb6f0d1f': (
  'Politische Sozialisation umfasst den Erwerb und die Auseinandersetzung mit Orientierungen, Normen und Möglichkeiten gesellschaftlicher Beteiligung. Familie, Peers, Medien und Institutionen prägen diesen Prozess, während Menschen Einflüsse verarbeiten, widersprechen und Entscheidungen treffen können.',
  'Political socialisation involves acquiring and engaging with orientations, norms and opportunities for social participation. Family, peers, media and institutions shape this process, while people can interpret influences, disagree and make choices.',
  'An einer fiktiven Jugendbiografie mit Familiengesprächen, Medienbeiträgen und Beteiligung an einer Jugendgruppe analysiert die lernende Person, wie verschiedene Erfahrungen politische Sichtweisen und Beteiligung beeinflussen können. Sie unterscheidet soziales Umfeld, institutionelle Beteiligungsmöglichkeiten und eigene Deutung der Person; Herkunft wird nicht als festgelegte Meinung ausgegeben.',
  'Using a fictional young person\'s biography with family discussions, media content and participation in a youth group, the learner analyses how different experiences may influence political views and participation. They distinguish the social environment, institutional opportunities to participate and the person\'s own interpretations; background is not treated as a predetermined opinion.',
  'In einem unabhängig vorgelegten Fall erhält eine andere Jugendgruppe erstmals Mitsprache über einen kommunalen Treffpunkt, während der Zugang für einzelne Mitglieder erschwert bleibt. Die lernende Person analysiert den geänderten institutionellen Einfluss und die möglichen unterschiedlichen Reaktionen, einschließlich einer begründeten Abweichung von Erwartungen des Umfelds.',
  'In a separately presented case, another youth group gains a say over a municipal meeting place while some members still face access barriers. The learner analyses the changed institutional influence and possible differing responses, including a reasoned departure from expectations within the social environment.',
  'KEEP: Der Titel Politische Sozialisation macht die allgemein gehaltene Prozessbeschreibung im E1-Kontext eindeutig. Der Vergleich von Einflüssen und eigener Verarbeitung ist eine integrierte Analyse, keine neue Prüfung politischer Fachtheorien. Der politische Reaktionsvorgänger und der Sozialkapitalnachfolger passen; DE/EN fügen keinen Determinismus oder automatische politische Gleichförmigkeit hinzu. Die Profil-Lücke ist ausdrücklich create.',
  'Die tatsächliche PDF-Seite verbindet eine nachdenkliche junge Person mit Familie, Medien, Freundeskreis und Jugendgruppe. Eigene Meinung und Fragezeichen lassen Verarbeitung und Handlungsspielraum zu. Der politische Vorgänger und Sozialkapitalnachfolger sind vollständig sichtbar.'
 ),
 '43a90b29-abf8-5430-99fa-b92f3768516b': (
  'Veränderte rechtliche, technische oder wirtschaftliche Rahmenbedingungen können Unternehmen zu Änderungen an Prozessen, Organisation oder Angebot veranlassen. Die Wirkung einer Anpassung ergibt sich aus Kosten, Qualität, Flexibilität und Nachfrage, nicht aus Neuerung allein.',
  'Changed regulatory, technical or economic operating conditions may lead businesses to change processes, organisation or their offerings. The effects of adaptation depend on costs, quality, flexibility and demand, rather than on novelty alone.',
  'In einem ausdrücklich fiktiven Reparaturbetrieb mit neuen Anforderungen an Wiederverwendung erläutert die lernende Person, weshalb der Betrieb Ersatzteilprüfung, Arbeitsabläufe und Weiterbildung verändert. Sie verbindet die neue Rahmenbedingung mit der konkreten Anpassung und erklärt einen möglichen Nutzen sowie Aufwand oder Qualitätsbedingung.',
  'In an explicitly fictional repair business facing new reuse requirements, the learner explains why the business changes spare-part inspection, work processes and staff training. They connect the new operating condition with the specific adaptation and explain a possible benefit together with its effort or quality condition.',
  'Ein unabhängig vorgelegter Betrieb muss auf unzuverlässige Lieferungen reagieren statt auf eine neue Regel. Die lernende Person erläutert eine Anpassung von Beschaffung oder Prozessorganisation und zeigt, wie Lageraufwand, Lieferfähigkeit und Qualität die Entscheidung beeinflussen; Reparatur oder Automatisierung werden nicht pauschal als Lösung übernommen.',
  'A separately presented business must respond to unreliable deliveries rather than a new rule. The learner explains an adaptation in procurement or process organisation and shows how inventory effort, delivery capability and quality affect the choice; repair or automation is not adopted as a universal solution.',
  'KEEP: Die allgemeine Erläuterung unternehmerischer Anpassungen ist kurz und DE/EN-parallel. Das nachfolgende dynamische Marktziel richtet den Blick enger auf Marktveränderungen; das Arbeitsmarktziel auf Beschäftigungsstruktur. Der gemeinsame Unternehmensmechanismus darf hier erklärt werden, ohne alle Fertigungssysteme oder Kostenrechenverfahren als neue Pflicht einzuführen. Nullprofil bleibt create.',
  'Auf der tatsächlichen Seite verbindet eine Regeländerung eine Werkstatt mit Reparatur, Wiederverwendung und Weiterbildung. Die Handlungen sind plausible Anpassungsmöglichkeiten; das Bild belegt keine sichere Kostensenkung. Die Beschreibung und beide direkten Nachfolger sind ungekürzt sichtbar.'
 ),
 '7aef0e2f-ca08-5276-a432-906cdb3313b4': (
  'Sozialwissenschaftliche Modelle wählen bestimmte Merkmale und Beziehungen aus, um Gesellschaft zu beschreiben. Modelle werden am selben Gegenstand nach ihren Aussagen, Annahmen, Schwerpunkten und Grenzen verglichen; unterschiedliche Perspektiven sind kein Beleg, dass eine einzelne alles erklärt.',
  'Social-science models select particular characteristics and relationships to describe society. Models are compared on the same subject through their claims, assumptions, emphases and limits; different perspectives do not establish that one model explains everything.',
  'Für eine fiktive Nachbarschaft mit Angaben zu Einkommen, Lebensstil und Beziehungen vergleicht die lernende Person zwei ausdrücklich bereitgestellte Modellbeschreibungen, etwa ein Klassen- und ein Milieumodell. Sie zeigt an denselben Bewohnerfällen, welche Unterschiede jedes Modell hervorhebt und welche Beziehungen es nicht erfasst, statt lediglich die Namen aufzuzählen.',
  'For a fictional neighbourhood with information about income, lifestyles and relationships, the learner compares two explicitly supplied model descriptions, such as a class model and a milieu model. Using the same resident cases, they show which differences each model emphasises and which relationships it does not capture, instead of merely listing model names.',
  'Eine frische Aufgabe stellt eine fiktive, digital vernetzte Arbeitswelt und zwei neue bereitgestellte Diagnosen mit unterschiedlichen Schwerpunkten vor. Die lernende Person wendet dieselben Vergleichskriterien auf beide Erklärungen dieses einen Falls an und benennt, welche zusätzliche Beobachtung für die Prüfung ihrer unterschiedlichen Aussagen nötig wäre.',
  'A fresh task presents a fictional digitally connected world of work and two new supplied diagnoses with different emphases. The learner applies the same comparison criteria to both accounts of this one case and identifies an additional observation needed to examine their differing claims.',
  'KEEP: Vergleichen sozialwissenschaftlicher Modelle ist eine klare einzelne Kompetenz, keine Sammlung unabhängiger Theorienprüfungen. EN übernimmt den Beschreibungszweck, ohne eine Kausaltheorie als bewiesen hinzuzufügen. Der Nachfolger untersucht konkrete Ungleichheit; dieses Ziel bleibt bei einem kriteriengeleiteten Modellvergleich desselben Gegenstands. Eingefrorenes Profil fehlt, daher create.',
  'Das tatsächlich gesichtete Bild betrachtet dieselbe Nachbarschaft durch drei Lupen mit Einkommen, Lebensstil und Beziehungen. Es illustriert die Auswahl einer Perspektive und bezeichnet nicht die Symbole selbst als komplette Theorie. Beschreibung und externer Orientierungsvorgänger passen zur Seite.'
 ),
 '7a3f0ae8-370e-5fc3-afce-09e1f7f35508': (
  'Migration verändert unter konkreten institutionellen Bedingungen soziale Beziehungen, Teilhabemöglichkeiten und politische Aufgaben. Auswirkungen werden anhand nachvollziehbarer Kriterien und betroffener Interessen bewertet; Menschen mit Migrationserfahrung sind keine homogene Gruppe.',
  'Migration changes social relationships, participation opportunities and political tasks under specific institutional conditions. Effects are assessed using explicit criteria and the interests affected; people with migration experience are not a homogeneous group.',
  'An einem ausdrücklich fiktiven Gemeindefall mit neu zugezogenen Haushalten, Arbeitsangeboten und begrenzten Wohnungen bewertet die lernende Person gesellschaftliche Chancen und Herausforderungen sowie politische Reaktionen. Sie begründet ihr Urteil etwa mit Zugang zu Arbeit, Bildung und Wohnen, unterscheidet kurz- und längerfristige Bedingungen und belegt Unterschiede zwischen konkreten Betroffenen mit dem Material.',
  'Using an explicitly fictional municipality with newly arrived households, job opportunities and limited housing, the learner assesses social opportunities and challenges together with political responses. They justify their judgement through criteria such as access to work, education and housing, distinguish short- and longer-term conditions, and use the material to support differences among particular people affected.',
  'In einem neuen fiktiven Ort sind Wohnraum und Arbeitsplätze vorhanden, aber Abschlüsse schwer anerkannt und öffentliche Angebote schlecht erreichbar. Die lernende Person prüft ihre Bewertung unter diesen geänderten Zugangsbedingungen und erläutert, weshalb die Schlussfolgerung des ersten Falls nicht unverändert gilt.',
  'In a fresh fictional locality, housing and jobs are available but qualifications are difficult to recognise and public services are hard to reach. The learner re-examines the assessment under these changed access conditions and explains why the conclusion from the first case does not carry over unchanged.',
  'KEEP: Die Bewertung von gesellschaftlichen und politischen Migrationseffekten bildet einen zusammenhängenden Urteilsgang mit konkretem Material. DE und EN vermeiden bereits pauschale positive oder negative Wirkungsbehauptungen. Der politische Vorgänger und die kulturelle Vertiefung als Nachfolger begrenzen den Fall; die Herkunft einzelner Menschen wird nicht als Erklärung aller Merkmale eingesetzt. Profil im Buch null: create.',
  'Die tatsächliche Seite zeigt eine gleichberechtigte Beratung über Wohnen, Bildung und Arbeit. Das Fragezeichen benennt Chancen und Herausforderungen; weder eine homogene Migrantengruppe noch ein automatisches Erfolgsbild wird fachlich benötigt. Die beiden direkten Links sind vorhanden.'
 ),
 '5ccb466f-25c7-5802-bb0a-763ca51cdf62': (
  'Marktveränderungen betreffen Nachfrage, Wettbewerbsangebote oder Beschaffungsbedingungen. Unternehmensreaktionen verbinden diese Signale mit Angebot, Service, Lager und Kosten; eine sinnvolle Reaktion hängt vom konkreten Markt und den Fähigkeiten des Betriebs ab.',
  'Market changes affect demand, competing offerings or procurement conditions. Business responses connect these signals with products, service, inventory and costs; a suitable response depends on the particular market and the business\'s capabilities.',
  'In einer fiktiven Fahrradwerkstatt fragen Kundinnen und Kunden häufiger schnelle Reparaturen und aufgearbeitete Räder nach. Die lernende Person analysiert, weshalb Servicezeiten, Ersatzteilvorräte und das Angebot verändert werden könnten, und verbindet diese Reaktionen mit Nachfrage, Kosten und Kapazität. Sie unterscheidet den geplanten Angebotswechsel von bereits nachgewiesenem Markterfolg.',
  'In a fictional bicycle workshop, customers increasingly request fast repairs and refurbished bicycles. The learner analyses why service times, spare-part stocks and the offering might change, linking these responses to demand, costs and capacity. They distinguish a planned change in the offering from already demonstrated market success.',
  'Eine unabhängige neue Aufgabe beschreibt eine fiktive Bäckerei mit verändertem Kundenbedarf und gleichzeitig teureren Zulieferungen. Die lernende Person analysiert eine passende Reaktion in Sortiment oder Beschaffung und erklärt anhand dieser Kombination, weshalb bloße Angebotserweiterung oder Preissenkung nicht automatisch vorteilhaft ist.',
  'A separate fresh task describes a fictional bakery with changed customer demand and more expensive supplies at the same time. The learner analyses an appropriate change in the range or procurement and explains from this combination why simply expanding the offering or cutting prices is not automatically beneficial.',
  'KEEP: Die Analyse von Reaktionen auf Marktveränderungen ist präzise und in EN gleich. Der Unternehmensvorgänger trägt die allgemeine Anpassungslogik; hier ist der Marktmechanismus Gegenstand, ohne eine vollständige Nachfragekurven- oder Marketingroutine neu einzufordern. Der externe E-Assessment-Link ist ein Kontextpfad, keine Behauptung vollständiger Zielabdeckung. Nullprofil erfordert create.',
  'Die tatsächliche PDF-Seite zeigt Kundenwünsche nach Reparatur und aufgearbeiteten Fahrrädern, Serviceangebote und angepasste Vorräte. Räder/Ersatzteile sind als unterschiedliche Gegenstände erkennbar. Die Illustration unterstützt eine mögliche Reaktion und ersetzt keinen Nachweis der Rentabilität.'
 ),
 'c4c5bae8-575a-5a70-ba30-bada55f93abb': (
  'Familienarrangements und Bildungsstrukturen stehen in Beziehung zu Betreuung, Zeitverteilung und Zugängen zu Lernen. Ihre Veränderung kann unterschiedliche gesellschaftliche Folgen haben; beschriebene Strukturunterschiede erlauben keine feste Rangordnung von Familien oder sicheren individuellen Bildungserfolg.',
  'Family arrangements and education structures are related to care, time allocation and access to learning. Changes may have different social consequences; described structural differences do not establish a fixed ranking of families or guaranteed individual educational success.',
  'Aus ausdrücklich fiktiven Materialien zu veränderten Erwerbs- und Betreuungszeiten und einer ganztägigen Lernorganisation beschreibt die lernende Person den Wandel der Familien- und Bildungsstrukturen. Sie leitet am selben Fall mögliche Folgen für Vereinbarkeit, Unterstützung und Bildungszugang ab und nennt die jeweils erforderliche Koordination oder Ressource.',
  'From explicitly fictional materials about changed working and care hours and all-day learning arrangements, the learner describes changes in family and education structures. In the same case they derive possible consequences for combining responsibilities, receiving support and accessing education, identifying the coordination or resources each depends on.',
  'Eine frische fiktive Fallbeschreibung betrifft erwachsene Lernende, die Weiterbildung mit Betreuung Angehöriger verbinden. Die lernende Person beschreibt die geänderte Familien- und Bildungsorganisation und leitet deren Folgen unter anderen Kurszeiten und verfügbaren Unterstützungsangeboten ab; die Bewertung eines Familienmodells wird nicht übernommen.',
  'A fresh fictional case concerns adult learners combining continuing education with care for relatives. The learner describes the changed family and education arrangements and derives consequences under different course schedules and support available; a judgement about one family model is not carried over.',
  'KEEP: Beschreiben und Folgen ableiten gehören hier zu einer einzigen Analyse zusammenhängender Strukturänderungen. Die beiden Sprachen erfassen dieselbe Familie/Bildung-Verknüpfung. Der Orientierungsvorgänger verlangt keine zusätzlichen Rechts- oder Politikanalysen. Die Gesamtkompetenz lässt sich an einem gesellschaftlichen Fall zeigen, ohne die Detailprüfung aller Familien- und Schulsysteme zu behaupten. Fehlendes Profil: create.',
  'Die tatsächlich gesichtete Seite stellt zwei mögliche Familien-/Lernarrangements gegenüber und trennt mögliche positive Effekte von Koordinationsbedarf. Die Abbildung und vollständige Beschreibung unterstützen eine bedingte Folgenanalyse, keine universelle Verbesserung durch einen bestimmten Familientyp.'
 ),
 'af772e72-57c9-5aab-a500-7fe3ec692abc': (
  'Sozialstaatliche Antworten auf Wandel setzen an unterschiedlichen Problemen und Zeiträumen an. Qualifizierung verändert mögliche Fähigkeiten und Chancen; finanzielle Absicherung stützt verfügbare Mittel. Maßnahmen werden über denselben Bedarf und gemeinsame Vergleichskriterien beurteilt und können sich ergänzen.',
  'Social-policy responses to change address different problems and time horizons. Training changes possible capabilities and opportunities; financial protection supports available resources. Measures are compared against the same need and shared criteria and may complement one another.',
  'Bei einem ausdrücklich fiktiven Rückgang bestimmter Arbeitstätigkeiten vergleicht die lernende Person eine Qualifizierungsmaßnahme und eine zeitweise finanzielle Unterstützung nach Ziel, Wirkungspfad, Erreichbarkeit und zeitlicher Entlastung. Sie erklärt, welche Bedürfnisse beide jeweils treffen und warum eine Maßnahme die andere nicht notwendig ersetzt.',
  'In an explicitly fictional decline in particular work tasks, the learner compares a training programme and temporary financial support by their objectives, mechanisms, accessibility and timing of relief. They explain which needs each addresses and why one measure does not necessarily replace the other.',
  'Eine neue fiktive Aufgabe betrifft ältere Menschen mit wachsendem Unterstützungsbedarf. Die lernende Person vergleicht ein erreichbares Unterstützungsangebot mit einem finanziellen Zuschuss am selben Bedarf und wendet die Vergleichskriterien unter geänderten Zugangshürden an, ohne Geldzahlung und tatsächlich verfügbare Hilfe gleichzusetzen.',
  'A fresh fictional task concerns older people with increasing support needs. The learner compares an accessible support service with a financial allowance against the same need and applies the comparison criteria under changed access barriers, without equating a cash payment with help that is actually available.',
  'KEEP: Der beschreibungsseitige Operator vergleichen ist maßgeblich; der bewertende Titel wird durch einen begründeten gemeinsamen Kriterienvergleich eingelöst. DE/EN sind gleich, ohne einen zusätzlichen vollständigen Sozialstaatskatalog einzufordern. Der politische Reaktionsvorgänger passt zur Vertiefung. Die Maßnahmen können sowohl Alternativen als auch Ergänzungen sein; die Formulierung entscheidet dies nicht pauschal. Profil null: create.',
  'Die tatsächliche Seite zeigt Qualifizierung, finanzielle Unterstützung und Beratung. Der sichtbare Hinweis Beides kann sich ergänzen verhindert eine falsche zwingende Alternative. Die Waage orientiert den Vergleich, ohne metrische Gleichwertigkeit oder gesicherte Wirkung zu behaupten.'
 ),
 '3bf3a322-c8f6-58ad-a1dc-774b05b15a5a': (
  'Kultureller Wandel entsteht durch veränderte Praktiken, Erfahrungen und Austausch. Migration kann ihn beeinflussen; Integration betrifft Möglichkeiten zur Teilnahme in Institutionen und sozialen Beziehungen. Kulturelle Vielfalt und Teilhabe stehen in Wechselbeziehung, ohne dass unveränderte Gruppenkulturen oder einseitige Anpassung vorausgesetzt werden.',
  'Cultural change develops through changing practices, experiences and exchange. Migration may influence it; integration concerns opportunities to participate in institutions and social relationships. Cultural diversity and participation are interrelated without assuming unchanging group cultures or one-sided adaptation.',
  'In einem ausdrücklich fiktiven Jugendkulturprojekt erläutert die lernende Person, wie neue Mitglieder mit unterschiedlichen Erfahrungen gemeinsame Musik- und Veranstaltungspraktiken verändern. Sie erklärt am selben Fall, welche Zugänge, Verständigung und Mitgestaltung gesellschaftliche Integration unterstützen und weshalb gemeinsame kulturelle Aktivitäten allein keine gesicherte Teilhabe an Bildung oder Arbeit beweisen.',
  'In an explicitly fictional youth cultural project, the learner explains how new members with differing experiences change shared music and event practices. In the same case they explain how access, communication and a say in decisions support social integration and why shared cultural activities alone do not establish secure participation in education or work.',
  'Eine neue fiktive Bibliothek erweitert mehrsprachige Angebote, deren Nutzung durch Öffnungszeiten eingeschränkt bleibt. Die lernende Person erläutert den Zusammenhang von kulturellem Austausch, Migrationserfahrungen und institutionellem Zugang in diesem anderen Fall; sie unterscheidet vielfältige Inhalte von tatsächlicher Beteiligungsmöglichkeit.',
  'A fresh fictional library expands multilingual services while opening hours restrict their use. The learner explains the relationship between cultural exchange, migration experiences and institutional access in this different case; they distinguish diverse content from an actual opportunity to participate.',
  'KEEP: Die Beziehungen zwischen den drei Begriffen bilden eine klar beschreibbare Erklärung im Anschluss an das Migrationsziel. DE und EN behaupten keine starre Kultur oder automatische Assimilation. Eine Erläuterung eines verknüpften Falls genügt; einzelne Kulturpraktiken oder vollständige Integrationstheorien werden nicht als neue Pflicht hinzugefügt. Kein positives Profil im Input: create.',
  'Die tatsächliche Seite zeigt gemeinsames Kochen, Musik und Handwerk sowie Schule, Arbeit und gesellschaftliche Mitgestaltung. Diese zusätzlichen Teilhabesymbole begrenzen die sonst mögliche Verkürzung auf ein Fest. Die Beschreibung stellt Beziehungen dar und garantiert keinen Integrationserfolg.'
 ),
 'ae91ad7d-82cb-58e2-bf01-5ef6d9fe445b': (
  'Soziale Ungleichheit betrifft ungleiche Ressourcen und Chancen; Einkommen und Bildungsbeteiligung sind verschiedene Dimensionen. Gleiche Mittelwerte können unterschiedliche Verteilungen verdecken. Mögliche Ursachen werden über nachvollziehbare Mechanismen diskutiert, ohne Korrelation oder soziale Herkunft mit einem sicheren individuellen Ergebnis gleichzusetzen.',
  'Social inequality concerns unequal resources and opportunities; income and educational participation are different dimensions. Equal averages can conceal different distributions. Possible causes are discussed through plausible mechanisms without equating correlation or social background with a certain individual outcome.',
  'An zwei ausdrücklich fiktiven Einkommensverteilungen mit gleichem Durchschnitt und Material zu Lernressourcen beschreibt die lernende Person Konzentration und Unterschiede im Bildungszugang. Sie diskutiert Zeit, Unterstützung und institutionelle Zugänge als mögliche Ursachen und trennt beobachtete Unterschiede von kausal noch nicht nachgewiesenen Erklärungen.',
  'Using two explicitly fictional income distributions with the same average and material about learning resources, the learner describes concentration and differences in educational access. They discuss time, support and institutional access as possible causes and distinguish observed differences from explanations not yet established as causal.',
  'Ein unabhängig vorgelegter Fall enthält ähnliche Einkommen, aber unterschiedliche Wege zu Bildungsangeboten. Die lernende Person beschreibt die veränderte Ungleichheitsdimension und diskutiert passende Ursachen statt ausschließlich Einkommensunterschiede zu wiederholen oder aus Gruppenbefunden die Zukunft einer einzelnen Person abzuleiten.',
  'A separately presented case has similar incomes but different routes to educational services. The learner describes the changed dimension of inequality and discusses appropriate causes instead of repeating only income differences or inferring one individual\'s future from group findings.',
  'KEEP: Beschreiben der Verteilung und Diskussion ihrer Ursachen sind eine integrierte Ungleichheitsanalyse, keine unverbundene Routinekombination. EN übernimmt Einkommen und Bildung sowie den vorsichtigen Operator diskutieren. Der Modellvergleich als Vorgänger und regionale Arbeitsmarktbericht als Nachfolger bieten sinnvolle Kontexte. Konkrete Indizes, Ursachebeweise und individuelle Determination werden nicht erfunden. Profil create.',
  'Die tatsächlich gesichtete Seite zeigt dieselbe Jugendliche in zwei A/B-Situationen mit unterschiedlichen Lern-, Zeit- und Geldressourcen und Wegen zur gleichen Schule. Das Bild macht Bedingungen sichtbar; es etikettiert keine angeborenen Fähigkeiten oder feststehenden individuellen Ergebnisse.'
 ),
 '643cb9b3-5b7c-59f6-8383-1af413426c88': (
  'Arbeitsmarktwandel kann Beschäftigung zwischen Sektoren, Vertragsformen und Aufgaben verschieben. Digitalisierung verändert Tätigkeiten und Qualifikationsbedarf; Arbeitsort, Beschäftigungsform und wirtschaftlicher Sektor sind verschiedene Merkmale. Atypische Beschäftigung ist nicht automatisch prekär, und ein Sektorenanteil allein zeigt keine absolute Stellenzahl.',
  'Labour-market change can shift employment across sectors, contract forms and tasks. Digitalisation changes tasks and skill needs; work location, employment form and economic sector are different attributes. Non-standard employment is not automatically precarious, and a sector\'s share alone does not establish its absolute number of jobs.',
  'Aus ausdrücklich fiktiven regionalen Daten zu Industriebeschäftigung, Dienstleistungen, Befristung und digitalen Tätigkeiten analysiert die lernende Person zusammenhängende Veränderungen. Sie unterscheidet Sektor, Vertrag und veränderte Aufgabe und erläutert, welche Daten ihre Aussagen tragen. Homeoffice wird nicht allein als atypischer Vertrag und ein relativer Anteilsrückgang nicht allein als Stellenverlust eingeordnet.',
  'From explicitly fictional regional data on industrial employment, services, fixed-term work and digital tasks, the learner analyses related changes. They distinguish sector, contract and changing task and explain which data support their statements. Homeworking alone is not classified as a non-standard contract, and a decline in relative share alone is not classified as a loss of jobs.',
  'Eine neue fiktive Region zeigt mehr digitale Aufgaben innerhalb der Industrie, ohne geringere Gesamtbeschäftigung, während befristete Beschäftigung im Dienstleistungsbereich zunimmt. Die lernende Person analysiert diese andere Kombination derselben Dimensionen und begründet, weshalb Digitalisierung, Sektorenwandel und Vertragsänderung nicht zwangsläufig dieselbe Richtung nehmen.',
  'A fresh fictional region shows more digital tasks within industry without lower total employment, while fixed-term work in services increases. The learner analyses this different combination of the same dimensions and explains why digitalisation, sectoral change and contract changes need not move in the same direction.',
  'KEEP: Die drei Aspekte bilden in einem materialgebundenen Arbeitsmarktfall eine zusammenhängende Analyse. Die native Unternehmensanpassung als Vorgänger und der Arbeitsmarktbericht als Nachfolger tragen diese Funktion. EN ist semantisch gleich. Destatis bestätigt die notwendige Trennung atypisch/prekär; die Abbildung flexibler Orte wird nicht als Vertragsdefinition missverstanden. Im Input kein P, daher create.',
  'Auf der tatsächlichen PDF-Seite sind Betrieb, Dienstleistung und Zusammenarbeit von verschiedenen Orten dargestellt. Das dritte Panel ist ein Arbeitsortbeispiel, kein Beleg für Befristung oder Zeitarbeit. Die Frage nach Tätigkeiten und Bedingungen sowie vollständige Beschreibung und direkte Beziehungen sind sichtbar.'
 ),
 'f79decb1-4d32-5d99-b998-e87e34d16527': (
  'Lebenswelten und Gruppenperspektiven hängen mit Erfahrungen, Rollen, Ressourcen und Zugangsmöglichkeiten zusammen. Ein konkreter Bericht ist die Perspektive einer Person oder eines Falls, nicht automatisch eine einheitliche Meinung aller jungen, zugewanderten oder einem Geschlecht zugeordneten Menschen.',
  'Lifeworlds and group perspectives are related to experiences, roles, resources and access opportunities. A particular account expresses one person\'s or case\'s perspective, not automatically a uniform opinion of all young people, people who have migrated or people assigned to a gender.',
  'Aus ausdrücklich fiktiven Aussagen verschiedener Bewohnerinnen und Bewohner zu demselben Stadtteil stellt die lernende Person unterschiedliche Perspektiven auf Lernen, Arbeitszugang und Betreuung dar. Sie ordnet die Aussagen den im Material erkennbaren Erfahrungen zu und zeigt eine Gemeinsamkeit über Gruppen hinweg sowie eine belegte Verschiedenheit innerhalb einer Gruppe.',
  'From explicitly fictional statements by different residents about the same neighbourhood, the learner describes differing perspectives on learning, access to work and care. They relate the statements to experiences evident in the material and show a shared interest across groups and a supported difference within a group.',
  'Eine frische Aufgabe legt andere konkrete Stimmen zu einem schulischen Ganztagsangebot vor, einschließlich widersprüchlicher Wünsche zweier Jugendlicher. Die lernende Person stellt die veränderten Perspektiven aus ihren Lebenssituationen dar, statt den früheren Gruppen dieselben Interessen zuzuschreiben.',
  'A fresh task presents other specific voices about an all-day school service, including conflicting wishes from two young people. The learner describes the changed perspectives from their living situations instead of attributing the same interests to the earlier groups.',
  'KEEP: Darstellung von Gruppenperspektiven ist eine einzelne beobachtbare Kompetenz; die Klammer liefert Beispiele, keinen Pflichtkatalog dreier unabhängiger Prüfungen. Die leicht abstrakte Formulierung bleibt mit Titel und E1-Kontext verständlich. DE/EN umfassen dieselben beispielhaften Lebenswelten und keinen pauschalen Gruppendeterminismus. Keine zusätzliche normative Bewertung eingeführt. Profilempfehlung create.',
  'Die tatsächliche Seite zeigt drei Personen, die dasselbe Stadtmodell mit verschiedenen Lupen betrachten. Lernen, Arbeit/Zugang und Familie/Fürsorge sind Themen der Perspektiven, keine sichtbare Behauptung homogener sozialer Gruppen. Die externe Orientierung und das E-Assessment sind angegeben.'
 ),
 '21dd1fce-730a-5470-bcc3-76195941ee83': (
  'Digitalisierung kann Tätigkeiten erleichtern, Zusammenarbeit verändern und neue Anforderungen oder Risiken schaffen. Chancen und Belastungen entstehen über konkrete Aufgaben, Fähigkeiten, Arbeitsorganisation und Zugänge und verteilen sich nicht notwendig gleich zwischen Beschäftigten und Gesellschaft.',
  'Digitalisation can ease tasks, change collaboration and create new requirements or risks. Opportunities and burdens arise through specific tasks, skills, work organisation and access and need not be distributed equally among workers and society.',
  'In einer ausdrücklich fiktiven Werkstatt mit digitalen Hilfen diskutiert die lernende Person Entlastung bei Routinetätigkeiten, neue Kompetenzanforderungen und mögliche Belastung durch ständige Erreichbarkeit oder Kontrolle. Sie erläutert für Beschäftigte und gesellschaftlichen Bildungszugang die jeweiligen Mechanismen und benennt Bedingungen wie Schulung, Gestaltung der Arbeit und Zugang zu Technik.',
  'In an explicitly fictional workshop using digital aids, the learner discusses relief from routine tasks, new skill requirements and possible burdens from constant availability or monitoring. They explain the mechanisms for workers and for social access to education, identifying conditions such as training, work design and access to technology.',
  'Ein neuer fiktiver Pflegedienst ersetzt die Werkstatt durch digitale Einsatzplanung und Fernkommunikation. Die lernende Person diskutiert Chancen und Risiken unter veränderten Aufgaben, persönlichen Kontakten und ungleichen digitalen Zugängen und zeigt, welche frühere Beurteilung deshalb angepasst werden muss.',
  'A fresh fictional care service replaces the workshop with digital scheduling and remote communication. The learner discusses opportunities and risks under changed tasks, personal contacts and unequal digital access and shows which earlier assessment must therefore be adjusted.',
  'KEEP: DE/EN nennen eine zusammenhängende Diskussion von Chancen und Risiken für Arbeit und Gesellschaft. Die breite technische Anschlussfähigkeit fügt keine konkrete Gesetzesprüfung, sichere Beschäftigungsprognose oder neue Digitalisierungstheorie hinzu. Der externe Arbeitsmarktbericht passt, ohne die Diskussion auf Datenrechnen umzuschreiben. Rohes 16-Länder-Applicability ist Kontext, keine von mir geprüfte Quellenvollabdeckung. Profil null: create.',
  'Die tatsächliche Seite zeigt digitale Unterstützung und Fernzusammenarbeit gegenüber Zeit-, Weiterbildungs- und Sicherheitsfragen. Die Waagschalen visualisieren Abwägung, keine zahlenmäßig gemessene Gleichwertigkeit. Der ganze Satz und externer Arbeitsmarktbericht sind sichtbar.'
 ),
 '0eaf70cd-b7b9-582b-8e77-7002b414d494': (
  'Familien- und Bildungspolitik reagieren auf veränderte Betreuung, Zeitverteilung und Lernzugänge. Ihre Instrumente können unterschiedliche unmittelbare Ziele haben und über denselben gesellschaftlichen Bedarf zusammenwirken. Die Wirkungsabsicht unterscheidet sich von erreichbarer Umsetzung und tatsächlichem Ergebnis.',
  'Family and education policies respond to changes in care, time allocation and access to learning. Their instruments may have different immediate objectives and interact around the same social need. Intended effects differ from feasible implementation and actual outcomes.',
  'Bei einem ausdrücklich fiktiven Wandel von Erwerbs- und Betreuungszeiten erläutert die lernende Person längere Kinderbetreuung und ein zusätzliches schulisches Lernangebot. Sie erklärt für jede familien- bzw. bildungspolitische Maßnahme Zielgruppe, Wirkungspfad und Zugangsbedingung und stellt dar, wie sie sich am selben Fall unterscheiden und ergänzen können.',
  'In an explicitly fictional change in working and care hours, the learner explains longer childcare hours and an additional school learning service. For each family- or education-policy measure they explain its target group, mechanism and access condition and describe how the measures differ and may complement one another in the same case.',
  'Ein unabhängig vorgelegter ländlicher Fall hat ausreichende Unterrichtsangebote, aber ungünstige Schulbuszeiten und Betreuungslücken. Die lernende Person erläutert die jeweils passenden familien- und bildungspolitischen Reaktionen auf diese andere Barriere und erklärt, weshalb bloß mehr Unterricht die neue Lage nicht vollständig bearbeitet.',
  'A separately presented rural case has sufficient teaching services but inconvenient school bus schedules and care gaps. The learner explains the appropriate family- and education-policy responses to this different barrier and explains why simply adding more teaching does not fully address the new situation.',
  'KEEP: Die Beschreibung erläutert Maßnahmen aus zwei eng verbundenen Politikbereichen am selben Wandel. Der vergleichende Titel lässt sich ohne Scopeausweitung durch die unterschiedlichen Wirkungspfade verstehen. DE/EN sind gleichwertig und enthalten keine Erfolgsgarantie; ein integrierter Fall zeigt beide Aspekte. Der politische Vorgänger ist sachlich passend. Kein aktuelles Profil im Buch: create.',
  'Die tatsächlich gesichtete Seite verbindet Betreuung und Bildung über Zeit, Wissen und Zugang in einer Gesprächsrunde. Die Lern- und Betreuungsbeispiele passen zum Thema; sie sind keine behauptete bereits beschlossene Politik. Der direkte politische Vorgänger und E-Assessment-Kontext sind vorhanden.'
 ),
 '3ac589b5-f8a5-5192-b81d-ed94cde4177a': (
  'Geschlechterrollen sind gesellschaftliche Erwartungen, die sich verändern und mit institutionellen Möglichkeiten zusammenwirken. Gleichstellungspolitik kann Zugangs- und Beteiligungsbedingungen verändern; beobachtete Rollen oder Gruppendurchschnitte sind weder angeborene Fähigkeiten noch eine notwendige Entscheidung jeder einzelnen Person.',
  'Gender roles are social expectations that change and interact with institutional opportunities. Equality policies can change access and participation conditions; observed roles or group averages are neither innate abilities nor a necessary decision by every individual.',
  'Aus ausdrücklich fiktiven Materialien zu veränderter Aufteilung von Sorgearbeit, Berufswahl und einem betrieblichen Angebot offener Qualifizierung analysiert die lernende Person Veränderungen der Rollen und der Gleichstellungspolitik. Sie erklärt, wie Erwartungen, Zugang und Zeitbedingungen zusammenwirken und trennt das Ziel gleicher Chancen von einem bereits bewiesenen identischen Ergebnis aller Gruppen.',
  'From explicitly fictional materials about changing care arrangements, career choices and a workplace policy offering training openly, the learner analyses changes in roles and equality policy. They explain how expectations, access and time conditions interact and distinguish the objective of equal opportunities from already established identical outcomes for all groups.',
  'Eine frische fiktive Ausbildungsstätte führt eine neue Zugangsregel ein, während Sorgezeiten und Rollenerwartungen außerhalb der Schule bestehen bleiben. Die lernende Person analysiert den geänderten institutionellen Einfluss zusammen mit diesen Bedingungen und erklärt unterschiedliche mögliche Wirkungen, ohne Menschen aus ihrem Geschlecht feste Fähigkeiten oder Wünsche zuzuschreiben.',
  'A fresh fictional training institution introduces a new access rule while care schedules and role expectations outside the institution persist. The learner analyses the changed institutional influence together with these conditions and explains possible differing effects without assigning people fixed abilities or wishes based on gender.',
  'KEEP: Rollenwandel und Gleichstellungspolitik sind hier eine einzige Analyse ihrer Wechselbeziehung. DE/EN sind semantisch gleich. Der Orientierungsvorgänger und E-Kontext erlauben den materialgebundenen Vergleich, ohne ein bestimmtes rechtliches Instrument, zwei Geschlechtsgruppen als vollständige Ontologie oder eine Erfolgsgarantie neu einzuführen. Profil null wird als create benannt.',
  'Die tatsächliche Seite zeigt Technik, Lehren und einen betreuenden Vater neben offenen Möglichkeiten und einer Gesprächsrunde. Die ausgewogenen Symbole illustrieren gleiche Chancen, nicht zwingend identische Berufswahl. Keine dargestellte Person wird als Träger angeborener Gruppeneigenschaften benötigt.'
 ),
 'bf851227-f345-5a6e-9c6a-392d2edd1e91': (
  'Soziale Netzwerke verbinden Menschen; über Beziehungen, Vertrauen und Kooperationsmöglichkeiten können Informationen und Unterstützung mobilisiert werden. Diese sozialen Ressourcen sind nicht mit Geld oder bloßer Kontaktzahl gleichzusetzen und können Chancen eröffnen, zugleich aber ungleich zugänglich sein.',
  'Social networks connect people; information and support can be mobilised through relationships, trust and opportunities to cooperate. These social resources are not equivalent to money or simply a count of contacts and may open opportunities while remaining unequally accessible.',
  'In einem ausdrücklich fiktiven Übergang von Schule in Ausbildung beschreibt die lernende Person, wie Freunde Rückhalt geben und eine berufliche Mentorin Informationen vermittelt. Sie erklärt an den konkreten Beziehungen, welche nutzbaren Ressourcen entstehen und wie dies Teilhabe unter veränderten Anforderungen erleichtern kann, ohne einen Ausbildungsplatz zu garantieren.',
  'In an explicitly fictional transition from school to training, the learner describes how friends provide support and a professional mentor shares information. Through the specific relationships they explain which usable resources arise and how these may ease participation under changed demands without guaranteeing a training place.',
  'Eine neue fiktive Nachbarschaft organisiert Hilfe bei einer veränderten öffentlichen Versorgung. Die lernende Person beschreibt, wie verlässlicher Austausch und Verbindungen zu anderen Gruppen Unterstützung erschließen, und erkennt Unterschiede im Zugang trotz ähnlicher Kontaktzahlen; der erste Berufsfall wird nicht bloß umbenannt.',
  'A fresh fictional neighbourhood organises help after a change in public services. The learner describes how reliable exchange and ties to other groups create access to support and recognises differences in access despite similar numbers of contacts; the first career case is not merely renamed.',
  'KEEP: Der Satz verlangt die Beschreibung der Rolle von Netzwerken und Sozialkapital, keine fixe Messformel oder automatische Karrierewirkung. DE/EN haben denselben Gegenstand. Der Sozialisationsvorgänger erklärt die gesellschaftliche Einbettung. Die primär gelesene OECD-Unterscheidung von Beziehungen, Ressourcen und Kooperation stützt die notwendige Trennung von bloßer Kontaktzahl. Nullprofil bleibt ehrlich create.',
  'Die tatsächliche Seite zeigt Unterstützung durch Freunde/Familie sowie eine Lehr- oder Berufsbegleitung. Die verzweigten Wege und der explizite Hinweis auf unterschiedliche Zugänge lassen Chancen offen; das Bild zeigt keinen gesicherten Berufsabschluss. Alle Seitenelemente sind sichtbar.'
 )
}

input_doc = json.loads((HERE / 'description-review-input.json').read_text())
campaign = json.loads((HERE / 'description-review-campaign.json').read_text())
manifest = json.loads((HERE / 'review-bundle-manifest.json').read_text())
book = json.loads((BUNDLE / 'book-model.json').read_text())
batch = campaign['batches'][0]
batch_path = HERE / 'batches' / (batch['batchId'] + '.input.jsonl')
batch_rows = [json.loads(line) for line in batch_path.read_text().splitlines() if line.strip()]
assert sha(batch_path) == batch['batchInputFingerprint']
assert [g['goalId'] for g in input_doc['goals']] == batch['goalIds']
assert set(TEXT) == set(batch['goalIds'])
assert all(row['goal'] == g for row, g in zip(batch_rows, input_doc['goals']))
assert all(g['reviewContext']['page'] == p for g,p in zip(input_doc['goals'],book['pages']))
assert all(g['reviewContext']['evidenceProfile'] is None for g in input_doc['goals'])

run_id = 'wirtschaft-e1-seventeen-independent-description-round-b-codex-20261008-v1'
results = HERE / 'results'
results.mkdir(exist_ok=True)
records_path = results / (batch['batchId'] + '.records.jsonl')
run_path = results / (batch['batchId'] + '.run.json')
if records_path.exists() or run_path.exists():
    raise RuntimeError('Immutable actual review output already exists')
fields = ['essentialUnderstandingDe','essentialUnderstandingEn','observablePerformanceDe','observablePerformanceEn','transferExpectationDe','transferExpectationEn']
records = []
for i, goal in enumerate(input_doc['goals'], 1):
    authored = TEXT[goal['goalId']]
    records.append({
        '$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
        'schemaVersion':1,
        'recordId':f'{run_id}.{i:03}',
        'runId':run_id,
        'campaignId':campaign['campaignId'],
        'roundId':campaign['roundId'],
        'bundleFingerprint':input_doc['bundleFingerprint'],
        'bookDigest':input_doc['bookDigest'],
        **{field:goal[field] for field in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']},
        'decision':'keep',
        'understandingEvidence':dict(zip(fields, authored[:6])),
        'rationale':authored[6],
        'evidenceProfileContract':'positive-understanding-evidence-v2',
        'evidenceProfileRecommendation':'create',
        'recordStatus':'candidate',
        'reviewAuthority':'ai_candidate'
    })
records_path.write_text(''.join(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n' for r in records))
completed = datetime.now(timezone.utc).isoformat(timespec='seconds').replace('+00:00','Z')
parameter_path = HERE / 'observed-generation-parameters.actual.json'
write_new(parameter_path,{
    'runId':run_id,'provider':'OpenAI','model':'Codex session; exact model identifier not disclosed',
    'agentIdentity':'/root/economics_layer_a','temperature':'not exposed','seed':'not exposed',
    'method':'Actual complete DE/EN input and canonical-context reading; actual visual inspection of every native PDF goal page; independent per-goal chain authored in this session; schema serialization only by script.',
    'blindToRoundA':True,'blindToOtherE1DescriptionRecords':True,
    'priorRelatedWorkDisclosure':'This agent authored the five phase-assessment draft candidates earlier; root independently reviewed/integrated them. This agent independently reviewed E2 positive/translation candidates and E2-20 D-B. No E1-P profile or E1-D-A record was consulted for this first pass.',
    'humanReviewClaimed':False,'learnerPerformanceClaimed':False
})
used_roles = ['book_model','book_pdf','book_pdf_render_manifest','review_input_json','review_prompt','review_criteria','finding_schema','run_manifest_schema']
artifacts = [{'role':a['role'],'digest':a['digest']} for a in manifest['artifacts'] if a['role'] in used_roles]
artifacts.append({'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']})
write_new(run_path,{
    '$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
    'schemaVersion':1,'runId':run_id,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],
    'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint'],
    'bundleFingerprint':input_doc['bundleFingerprint'],'bookDigest':input_doc['bookDigest'],
    'provider':'OpenAI','model':'Codex session; exact model identifier not disclosed',
    'role':'subject_reviewer','promptFamilyId':'goal-description-understanding-evidence-review-v2',
    'promptFingerprint':campaign['promptFingerprint'],'criteriaFingerprint':campaign['criteriaFingerprint'],
    'generationParametersFingerprint':sha(parameter_path),'independenceGroupId':campaign['independenceGroupId'],
    'blindToOtherRuns':True,'goalIds':batch['goalIds'],'inputArtifacts':artifacts,
    'startedAt':'2026-10-08T07:00:00Z','completedAt':completed,'status':'completed',
    'outputDigest':sha(records_path),
    'toolchainVersion':'skillpilot-native-d-v2-input-v3-record-v1-codex-actual-tools'
})
inspection = HERE / 'independent-description-page-inspection.actual.json'
write_new(inspection,{
    'schemaVersion':1,'reviewId':run_id,'agentIdentity':'/root/economics_layer_a',
    'provider':'OpenAI','model':'Codex session; exact model identifier not disclosed','reviewAuthority':'ai_candidate',
    'actualContentReadingCompletedAt':completed,'bundleFingerprint':input_doc['bundleFingerprint'],
    'bookDigest':input_doc['bookDigest'],'inputDigest':sha(HERE/'description-review-input.json'),
    'bookPdfDigest':sha(BUNDLE/'book.pdf'),'bookModelFileDigest':sha(BUNDLE/'book-model.json'),
    'recordDigest':sha(records_path),'runManifestDigest':sha(run_path),
    'assignedGoalCount':17,'wholeDeEnGoalsRead':17,'wholeCanonicalContextsRead':17,
    'nativePdfGoalPagesActuallyViewed':17,'pdfPhysicalPages':19,'pdfFrontMatterPages':2,
    'actualReadingMethod':'Every exact own-round goal, including both title/description languages, complete canonical context, prerequisites and reverse relations, null evidenceProfile, final visualization metadata, and complete native BookModel page; actual view_image inspection of all 17 pdftoppm rasterised goal pages at scale-to 1250.',
    'independence':{'ownRound':'round-b','otherRoundRead':False,'otherE1DVerdictsRead':False,'authorPreferredVerdictRead':False,'E1PositiveProfilesRead':False,'priorRelatedWorkDisclosure':json.loads(parameter_path.read_text())['priorRelatedWorkDisclosure']},
    'sourcesActuallyConsulted':[
        {'type':'local primary curriculum PDF','path':'curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-wirtschaftswissenschaften.pdf','printedPages':[33,34,35],'reading':'Actual pdftotext layout reading of E1 context and E1.1–E1.7. Used as disciplinary curriculum orientation; not a complete current mapping/source-coverage audit.'},
        {'type':'primary statistical definition','url':'https://www.destatis.de/DE/Themen/Arbeit/Arbeitsmarkt/Glossar/atypische-beschaeftigung.html','actualReviewDate':'2026-10-08','relevantGoalId':'643cb9b3-5b7c-59f6-8383-1af413426c88','reading':'Actual official glossary reading: contract/time criteria distinguish non-standard employment; homeworking alone is not a listed criterion; non-standard and precarious are not synonyms.'},
        {'type':'primary institution publication','url':'https://www.oecd.org/en/publications/2018/11/for-good-measure_g1g98ae4/full-report/component-13.html','actualReviewDate':'2026-10-08','relevantGoalId':'bf851227-f345-5a6e-9c6a-392d2edd1e91','reading':'Actual Box 10.1 reading of relationships, accessible network support, civic engagement and cooperation; not copied as an exhaustive or uniquely binding social-capital definition.'}
    ],
    'decisions':{'keep':17,'revise':0,'split_review':0,'block':0},
    'evidenceProfileRecommendations':{'create':17,'none':0,'revise':0},
    'positiveProfileInFrozenInputs':False,
    'positiveProfileGapHandling':'Every frozen evidenceProfile is null. D records recommend create and supply independent goal-specific understanding/performance/transfer chains. They neither claim nor insert a profile into the book; separately created current P-v2, review and source/image binding require synthesis/integration outside this round.',
    'actualContentFindings':[],'unresolvedDescriptionFindings':0,
    'scopeLimits':'This D review grants no V approval, current complete source/mapping coverage, effective learner-scope verification, new A/M decision, learner-performance evidence, human approval or practical trial. Raw applicability and null sourceRefs were read as context only. Actual sources above support named distinctions only. Image approval and separate current P integration remain distinct machine lanes.',
    'strictCompletionAddedByThisUnintegratedRound':0,
    'humanReleaseGates':'Retained separately; no human release granted.',
    'pages':[
        {'goalId':g['goalId'],'pageNumber':g['reviewContext']['page']['pageNumber'],
         'pdfPhysicalPage':i+2,'goalFingerprint':g['goalFingerprint'],'pageFingerprint':g['pageFingerprint'],
         'deEnParity':'same assessable scope; actual full title and description reading',
         'canonicalContextActuallyRead':g['canonicalContext'],
         'evidenceProfileActuallyPresent':False,'recommendation':'create',
         'descriptionDecision':'keep','positiveSubjectFinding':TEXT[g['goalId']][6],
         'actualImagePageFinding':TEXT[g['goalId']][7],
         'unresolvedNegativeSubjectFindings':[],
         'visualizationAssetDigest':g['reviewContext']['page']['visualization']['originalDigest'],
         'inspectionDerivative':f'inspection/frozen-native-pdf-page-{i+2:02}.png',
         'inspectionDerivativeDigest':sha(HERE/'inspection'/f'frozen-native-pdf-page-{i+2:02}.png')}
        for i,g in enumerate(input_doc['goals'],1)
    ]
})
print(json.dumps({'recordCount':len(records),'records':str(records_path),'recordsDigest':sha(records_path),'run':str(run_path),'inspection':str(inspection),'completedAt':completed},ensure_ascii=False,indent=2))
