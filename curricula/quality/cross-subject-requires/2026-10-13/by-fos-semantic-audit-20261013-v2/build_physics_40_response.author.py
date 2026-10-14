# SPDX-License-Identifier: Apache-2.0
"""Bind individually authored responses to 19 exact Physics review cases.

This is artifact assembly only. No classifier, graph writer or approval tool.
"""
import datetime
import hashlib
import json
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
OUT = ROOT / 'tmp/cross-subject-requires/by-fos-semantic-audit-20261013-v2'
TARGET = OUT / 'physics-40-response.author.json'
SOURCE = ROOT / 'curricula/DE/BY/Fachoberschule/Physik.json'
V1 = ROOT / 'tmp/cross-subject-requires/by-fos-semantic-audit-20261013-v1'
REVIEW = ROOT / 'tmp/cross-subject-requires/by-fos-semantic-independent-review-20261013-v1'
AGENT = '/root/physics_pending5_revision/by_fos_physics_v2_author'
INDICES = [4, 12, 15, 19, 54, 73, 80, 84, 93, 94, 111, 119, 126, 135, 143, 162, 169, 185, 189]

def sha(raw):
    return 'sha256:' + hashlib.sha256(raw).hexdigest()

def canon(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode('utf-8')

def fp(value):
    return sha(canon(value))

def binding(path):
    raw = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': sha(raw), 'bytes': len(raw)}

def read(path):
    return json.loads(path.read_bytes())

# Each record below is a personal content judgment made after the complete
# current description, actual local heading, original author record and exact
# independent critique were read. Similar descriptions have separate records;
# this code does not derive a semantic decision from matching words or indices.
NOTES = {
    4: {
        'response': 'Die Kritik wird angenommen. Das Dokumentieren dient ausdrücklich dem Vergleich derselben Bewegungen; Darstellungswahl und Deutung sind damit Teile einer möglichen zusammenhängenden physikalischen Analyse. Die erste Begründung hat ihre getrennte Prüfbarkeit zu Unrecht als Beweis für einen notwendigen Split behandelt.',
        'outcome': 'Bewegungen anhand sinnvoll dokumentierter Orts- und Geschwindigkeitsinformationen einschließlich Momentangeschwindigkeit physikalisch vergleichen.',
        'evidence': [
            'Die lernende Person dokumentiert die für den Bewegungsvergleich nötigen Daten in einer passenden, physikalisch lesbaren Darstellung mit zugeordneten Größen und Einheiten.',
            'Sie begründet den Vergleich der Ortsänderungen und Geschwindigkeiten aus dieser Darstellung und unterscheidet eine Momentangeschwindigkeit von einer bloßen Durchschnittsaussage.',
        ],
        'bounds': [
            'Bewegungsart, betrachtete Dimension, Datendichte und die zulässige Ermittlung einer Momentangeschwindigkeit sind im lokalen Text nicht präzisiert.',
            'Diagramme sind als Beispiel genannt. Eine konkrete Darstellungsform darf nicht ohne Quellen- und Assessmentbindung zum einzigen kanonischen Nachweis erklärt werden.',
        ],
        'anchor': 'um sie hinsichtlich Geschwindigkeit (auch Momentangeschwindigkeit) und Ortsänderung miteinander zu vergleichen',
    },
    12: {
        'response': 'Die Kritik wird mit einer Sprachpräzisierung angenommen: Der aktuelle Text sagt zu verschiedenen Zeitpunkten, nicht wörtlich zu beliebigen Zeitpunkten. Arbeits- und Energiebilanzen mit Reibungsverlusten können eine zusammenhängende Zustandsprognose tragen; idealer und dissipativer Fall beweisen keinen notwendigen Split. Die fehlende Verbindung zur Zeit bleibt dagegen ein konkreter Modell- und Quellenpräzisionsblocker.',
        'outcome': 'Den Bewegungszustand eines Körpers in einem begrenzten mechanischen Modell mithilfe von Arbeit und Energiebilanzen einschließlich der relevanten Reibungsverluste bestimmen und mit einer begründeten Zeitentwicklung verbinden.',
        'evidence': [
            'Die lernende Person legt System, Anfangszustand und Energiebezug fest und begründet die Bilanz der mechanischen Energie mit der tatsächlich relevanten Reibungsarbeit.',
            'Sie gewinnt daraus die zulässigen Aussagen über Ort und Momentangeschwindigkeit; für die ausdrücklich angesprochenen Zeitpunkte verwendet und begründet sie zusätzlich eine passende Zeit-Ort-Beziehung oder dynamische Lösung im abgegrenzten Modell.',
            'Sie erkennt, dass eine Energiebeziehung zwischen Ort und Geschwindigkeit allein im Allgemeinen weder die Zeitzuordnung noch eine eindeutige Bewegungslösung liefert.',
        ],
        'bounds': [
            'Das lokale Ziel nennt keine Bewegungsklasse, Anfangsbedingungen, Reibungsmodell, Zeitfunktion oder dynamische Lösungsroute; diese Angaben sind nicht durch den Lernerfolg einer einfachen Energiebilanz ersetzt.',
            'Eine nachträglich gelieferte Zeitfunktion wäre eine mögliche Assessmentstütze, ist hier aber weder im aktiven Goal ergänzt noch als normativ belegter Inhalt angenommen.',
            'Der Quellenabgleich muss klären, welche Zeit-Ort-Aussage tatsächlich gemeint ist. Die Formulierung wird hier weder verallgemeinert noch repariert.',
        ],
        'anchor': 'den Aufenthaltsort und die Momentangeschwindigkeit eines bewegten Körpers zu verschiedenen Zeitpunkten',
        'contentBlocker': 'energy_balance_alone_does_not_determine_time_dependent_position',
    },
    15: {
        'response': 'Die Kritik wird angenommen. Eine mechanische Analogie kann die Funktionsweise desselben Stromkreises verdeutlichen und ist dann eine Darstellungsroute innerhalb der Erklärung. Aus Bauteilbenennung und Analogie folgt keine notwendige Zerlegung in unabhängige Kompetenzen.',
        'outcome': 'Den Aufbau und die Funktion eines elektrischen Stromkreises fachgerecht erklären und seine Vorgänge mit einer passenden mechanischen Analogie veranschaulichen.',
        'evidence': [
            'Die lernende Person ordnet den dargestellten Bauteilen ihre Funktion im konkreten Stromkreis zu und erklärt deren Zusammenwirken statt nur Namen aufzuzählen.',
            'Sie ordnet die Elemente und Vorgänge ihrer gewählten mechanischen Analogie den elektrischen Vorgängen sachgerecht zu, ohne unzutreffende Eigenschaften des Analogiemodells als elektrische Tatsachen zu übernehmen.',
        ],
        'bounds': [
            'Der konkrete Bauteilkatalog, Stromkreistyp und die angemessene Tiefe der elektrischen Erklärung sind im lokalen Ziel offen.',
            'Die Analogie muss den gewählten Vorgang tatsächlich tragen; weder eine bestimmte mechanische Analogie noch ein zusätzlicher allgemeiner Modelltheoriekurs sind als verbindliche Inhalte belegt.',
        ],
        'anchor': 'Sie veranschaulichen die Vorgänge im elektrischen Stromkreis mithilfe mechanischer Analogien',
    },
    19: {
        'response': 'Die Kritik wird angenommen. Nachhaltige elektrische Energieversorgung ist hier der Anwendungskontext einer fachlich fundierten Argumentation. Der Text verlangt nicht ausdrücklich eine eigenständige politisch-ökonomische Bewertungskompetenz. Die bisherige interdisziplinäre Festlegung und der daraus abgeleitete Split werden durch die begrenzte Author-Deutung Physics mit Anwendungskontext ersetzt; exklusive Zuständigkeit bleibt unentschieden.',
        'outcome': 'Mögliche Wege elektrischer Energieversorgung anhand begründeter physikalischer Kriterien und transparenter Kontextinformationen auf ihre Nachhaltigkeit hin erörtern.',
        'evidence': [
            'Die lernende Person begründet ihre Argumentation mit zutreffenden physikalischen Aussagen zu den betrachteten Versorgungswegen und verbindet diese mit ausdrücklich benannten Kriterien.',
            'Sie verwendet bereitgestellte Umwelt- oder Versorgungsinformationen sachgerecht und legt offen, wie diese Informationen und die physikalischen Zusammenhänge die vertretene Einschätzung tragen.',
        ],
        'bounds': [
            'Vergleichswege, Nachhaltigkeitskriterien, Datenquellen und die verlangte Tiefe der Schlussfolgerung fehlen im lokalen Text.',
            'Eine Aufgabe mit gegebenen Kontextdaten ist konstruktiv möglich, ersetzt aber keinen Nachweis des vollständigen normativen Inhalts. Ein zusätzlicher Politik-, Wirtschafts- oder Ethik-Owner wird weder ausgeschlossen noch aus dem Wort nachhaltig abgeleitet.',
        ],
        'anchor': 'argumentieren fachlich fundiert über mögliche Wege zu einer nachhaltigen elektrischen Energieversorgung',
        'applicationContext': True,
    },
    54: {
        'response': 'Die Kritik wird angenommen. Die Berechnungen zu Arbeit, Energie, Leistung und Wirkungsgrad sollen ausdrücklich eine Einschätzung effizienter Energienutzung ermöglichen. Eine gemeinsame Energiebilanz mit begründeter Folgerung ist daher möglich. Mensch und Umwelt allein begründen weder einen eigenständigen gesellschaftlichen Inhaltsatom noch einen zweiten Fach-Owner.',
        'outcome': 'Aus einer quantitativ begründeten Beschreibung von Energietransport und Energieumwandlung die Bedeutung effizienter Energienutzung im angegebenen menschlichen und ökologischen Kontext einschätzen.',
        'evidence': [
            'Die lernende Person unterscheidet Arbeit, Energie und Leistung in der betrachteten Umwandlung, berechnet die relevanten Größen mit konsistenten Einheiten und berücksichtigt den Wirkungsgrad sachgerecht.',
            'Sie erklärt, welche Folgerung die Bilanz beispielsweise bei gleicher Nutzenergie für Energiebedarf oder Verluste erlaubt, und verbindet sie begründet mit den im Fall gegebenen Auswirkungen für Mensch und Umwelt.',
        ],
        'bounds': [
            'Umwandlungskette, Systemgrenze, betrachtete Wirkungsgrade und die konkreten menschlichen oder ökologischen Auswirkungen sind nicht benannt.',
            'Eine physikalische Effizienzrechnung beweist keine umfassende Ökobilanz. Nichtphysikalische Kontextfakten müssen gegeben oder quellengebunden erarbeitet werden; welche zusätzliche Fachkompetenz verlangt wäre, ist hier nicht festgelegt.',
        ],
        'anchor': 'um die Bedeutung der effizienten Energienutzung für Mensch und Umwelt einzuschätzen',
        'applicationContext': True,
    },
    73: {
        'response': 'Die Kritik wird angenommen. Die Qualität der eigenen Versuchsanordnung ist das gemeinsame Produkt: Konstruktion, Messergebnis und Fehlerabschätzung tragen dessen physikalische Verlässlichkeit. Die erste Fassung hat aus einzeln bewertbaren Arbeitsschritten zu früh eine notwendige Zerlegung gefolgert.',
        'outcome': 'Eine einfache Versuchsanordnung für eine vorgegebene physikalische Frage eigenständig entwickeln und die Aussagekraft der eigenen Messung mit begrenzter Fehlerbetrachtung beurteilen.',
        'evidence': [
            'Die lernende Person begründet ihre eigene Versuchsanordnung, die gewählten Versuchsbedingungen und deren Eignung zur Beantwortung der vorgegebenen physikalischen Frage.',
            'Sie bewertet Genauigkeit und Verallgemeinerbarkeit der gewonnenen Ergebnisse, identifiziert relevante systematische Messfehler qualitativ und gibt eine nachvollziehbare grobe Abschätzung der Größtfehler ihrer eigenen Messung.',
        ],
        'bounds': [
            'Einfacher Versuch, vorgegebene Fragestellung und zulässige Verallgemeinerung benötigen eine konkrete inhaltliche Grenze; das lokale Blatt benennt keinen universellen Katalog von Versuchen.',
            'Die ausdrückliche Grenze ohne intensive Fehlerrechnung bleibt erhalten. Vollständige Fehlerfortpflanzung, statistische Inferenz oder ein ganzer mathematischer Statistikbereich werden nicht zusätzlich verlangt.',
        ],
        'anchor': 'ohne intensive Fehlerrechnung grobe Abschätzungen auftretender Größtfehler bei den eigenen Messungen',
    },
    80: {
        'response': 'Die Kritik wird für diesen eigenen Aspekte-12-Eintrag angenommen. Funktionserklärung und mechanische Veranschaulichung können denselben elektrischen Stromkreis zum Gegenstand haben; die Darstellungsmethode begründet keinen notwendigen Split. Die tatsächlich andere Überschrift wird erhalten und keine semantische Gleichheit mit dem Ph10-Eintrag als Ownerentscheidung benutzt.',
        'outcome': 'Im wörtlich ausgewiesenen Aspekte-12-Kontext einen Stromkreis und die Funktionen seiner Bauteile mit Hilfe einer sachgerechten mechanischen Analogie erklären.',
        'evidence': [
            'Die lernende Person beschreibt Aufbau, Bauteilfunktionen und Zusammenwirken im behandelten elektrischen Stromkreis fachgerecht.',
            'Sie veranschaulicht die betreffenden elektrischen Vorgänge durch eine passende mechanische Analogie und hält die Zuordnung zum elektrischen Gegenstand sachlich korrekt.',
        ],
        'bounds': [
            'Stromkreistyp, Umfang der Bauteilfunktionen und die Reichweite der Analogie sind im lokalen Text nicht präzisiert.',
            'Die Überschrift nennt wörtlich erweiterndes Wahlplichtfach G,S,W, GH, IW. Das belegt weder eine normative Profilequivalenz noch gleiche Assessmenttiefe zum Jahrgang-10-Eintrag.',
        ],
        'anchor': 'Sie veranschaulichen die Vorgänge im elektrischen Stromkreis mithilfe mechanischer Analogien',
    },
    84: {
        'response': 'Die Kritik wird für den Aspekte-12-Eintrag angenommen. Der offene Nachhaltigkeitsauftrag lässt eine physikalisch fundierte Kriterienargumentation zu; ein eigenständiges gesellschaftliches Inhaltsziel steht nicht ausdrücklich im Text. Die Author-Zuordnung wird zu Physics mit Anwendungskontext korrigiert, ohne eine exklusive Fachzuordnung oder einen Split festzulegen.',
        'outcome': 'Im tatsächlich benannten Aspekte-12-Kontext mögliche Wege nachhaltiger elektrischer Energieversorgung mit nachvollziehbarer physikalischer Argumentation und explizitem Kontext beurteilen.',
        'evidence': [
            'Die lernende Person erklärt die für ihre Argumentation relevanten physikalischen Merkmale der tatsächlich betrachteten Versorgungswege und benutzt diese korrekt als Gründe.',
            'Sie verbindet ihre Gründe mit benannten Nachhaltigkeitskriterien und den für den Vergleich verfügbaren Informationen; ein bloßes allgemeines Bekenntnis zu Nachhaltigkeit genügt nicht.',
        ],
        'bounds': [
            'Konkrete Versorgungswege, Kriterien, Quellen und Beurteilungstiefe bleiben unbenannt und müssen vor einer vollständigen Assessmentfreigabe geklärt werden.',
            'Die wörtliche Wahlpflicht-/Profilüberschrift legt nicht automatisch den vollständigen Geltungsbereich oder die gleiche Anspruchstiefe wie der Ph10-Eintrag fest. Zusätzliche gesellschaftliche Fachanforderungen und Owner bleiben quellenabhängig offen.',
        ],
        'anchor': 'argumentieren fachlich fundiert über mögliche Wege zu einer nachhaltigen elektrischen Energieversorgung',
        'applicationContext': True,
    },
    93: {
        'response': 'Die Kritik wird angenommen. Verschiedene Wärmekapazitäten und Phasenübergänge sind zusätzliche Bilanzterme und Zustandsfälle innerhalb desselben Mischungsproblems. Ihr gesonderter Evidenzbedarf bleibt bestehen, ist aber kein Beweis für zwingend getrennte Inhaltsziele.',
        'outcome': 'Eine experimentell bestimmte Mischtemperatur durch eine physikalisch angemessene Energiebilanz mit unterschiedlichen spezifischen Wärmekapazitäten und relevanten Phasenübergängen überprüfen.',
        'evidence': [
            'Die lernende Person gewinnt eine Mischtemperatur experimentell und verbindet Messgrößen und Systemgrenze mit einer nachvollziehbaren Energieerhaltungsbilanz.',
            'Sie berücksichtigt die unterschiedlichen spezifischen Wärmekapazitäten sowie die beim betrachteten Fall relevante latente Wärme und prüft, welcher abschließende Phasenzustand mit der Bilanz vereinbar ist.',
        ],
        'bounds': [
            'Stoffe, Systemverluste, Messbedingungen und der Umfang der betrachteten Phasenübergänge sind offen; der Phasenwechsel darf nicht durch ausschließlich sensible Temperaturmischung übergangen werden.',
            'Ein gemeinsamer Mischungsfall kann diese Aspekte verbinden. Ob ein einzelnes abgegrenztes Assessment den vollständigen normativen Fallumfang abdeckt, bleibt ohne Quellen- und Assessmentbindung unentschieden.',
        ],
        'anchor': 'neben unterschiedlichen spezifischen Wärmekapazitäten auch Phasenübergänge',
    },
    94: {
        'response': 'Die Kritik wird angenommen. Messwertauswertung, grafische Darstellung, angeleitete Zusammenführung und Modellinterpretation entwickeln ausdrücklich dasselbe Gasgesetz. Dies ist eine mögliche zusammenhängende empirische Modellbildung; aus der Zahl ihrer Schritte folgt kein notwendiger Split.',
        'outcome': 'Aus experimentellen Druck-, Volumen- und Temperaturbeziehungen unter Anleitung die allgemeine Gasgleichung entwickeln und die Beziehungen im Modell idealer Gase interpretieren.',
        'evidence': [
            'Die lernende Person wertet die Messreihen unter Beachtung der jeweils festgehaltenen Zustandsgrößen aus und stellt die gefundenen Abhängigkeiten mit korrekt zugeordneten Größen grafisch dar.',
            'Sie verbindet die Beziehungen nachvollziehbar zur allgemeinen Gasgleichung und erläutert die zugrunde liegenden Zusammenhänge mit einer angemessenen Modellvorstellung idealer Gase statt nur eine Formel anzugeben.',
        ],
        'bounds': [
            'Die konkrete Versuchsreihe, Randbedingungen und Tiefe der idealen Gasmodellvorstellung sind nicht quellengebunden festgelegt.',
            'Unter Anleitung ist eine ausdrückliche Grenze des lokalen Textes. Eine selbständige vollständige kinetische Herleitung oder zusätzliche reale Gasmodelle dürfen daraus nicht automatisch verlangt werden.',
        ],
        'anchor': 'entwickeln daraus unter Anleitung die allgemeine Gasgleichung',
    },
    111: {
        'response': 'Die Kritik wird angenommen. Orts-, Geschwindigkeits- und Beschleunigungsverläufe gehören zu derselben harmonischen Bewegung; Zeigerdiagramme können deren Phasenbeziehungen ausdrücken. Die erste Fassung hat aus mehreren abhängigen Größen und Darstellungen einen notwendigen Split abgeleitet, der nicht belegt ist.',
        'outcome': 'Eine harmonische Körperbewegung unter Berücksichtigung ihrer Anfangsbedingungen durch zusammenpassende trigonometrische Orts-, Geschwindigkeits- und Beschleunigungsverläufe und eine sachgerechte Zeigerdarstellung modellieren.',
        'evidence': [
            'Die lernende Person bestimmt ein mit den Anfangsbedingungen vereinbares harmonisches Modell und begründet Frequenz, Amplituden sowie die Phasenbeziehungen der drei benannten kinematischen Größen.',
            'Sie beschreibt dieselbe Schwingung konsistent im Zeigerdiagramm; ein bloßer Ortsfunktionsansatz ohne die verlangten weiteren Größen und Darstellung genügt nicht für den vollständigen Nachweis.',
        ],
        'bounds': [
            'Konkrete Anfangsbedingungen, Koordinaten- und Phasenkonventionen sowie der Umfang der behandelten harmonischen Systeme fehlen im lokalen Text.',
            'Die gekoppelte Modellierung ist konstruktiv möglich, aber ihre vollständige Assessmentgrenze und native Atomizität sind ungeprüft. Trigonometrische Funktionen als Methode begründen noch keine universelle Abhängigkeit zu einem ganzen Mathematikziel.',
        ],
        'anchor': 'unter Berücksichtigung der Anfangsbedingungen die zeitliche Entwicklung von Orts‑, Geschwindigkeits‑ und Beschleunigungskoordinaten',
    },
    119: {
        'response': 'Die Kritik wird angenommen. Die Phasenlage bei fester oder loser Reflexion bestimmt die zulässigen eindimensionalen Resonanzbedingungen und damit die Eigenfrequenzen. Randbedingungen und Frequenzbestimmung können eine gemeinsame physikalische Erklärung bilden; der notwendige Split ist nicht nachgewiesen.',
        'outcome': 'Das Zustandekommen eindimensionaler Resonanzschwingungen aus Phasenausbreitung und Randreflexion erklären und die zulässigen Eigenfrequenzen quantitativ mit den Resonatorabmessungen verbinden.',
        'evidence': [
            'Die lernende Person unterscheidet feste und lose Randreflexionen physikalisch richtig und begründet ihre Bedeutung für die Phasen- beziehungsweise Resonanzbedingung.',
            'Sie entwickelt für einen angegebenen eindimensionalen Resonator den quantitativen Zusammenhang zwischen Abmessung und erlaubten Eigenfrequenzen und erklärt damit gegebenenfalls die genannte Tonerzeugungsanwendung.',
        ],
        'bounds': [
            'Welche Resonatortypen, Randkombinationen und idealisierenden Bedingungen den vollständigen Inhalt bilden, ist nicht quellengebunden angegeben.',
            'Orgelpfeifen sind als Beispiel bezeichnet. Die Interpretation einer bestimmten Pfeife darf weder den nötigen Reflexions-/Phasennachweis ersetzen noch ohne Quellennachweis zum universellen einzigen Anwendungsfall werden.',
        ],
        'anchor': 'unterscheiden sie Reflexionen am festen und losen Ende',
    },
    126: {
        'response': 'Die Kritik wird angenommen. Die Planung dient ausdrücklich der experimentellen Bestimmung charakteristischer Kondensatorgrößen; sie kann mit der Durchführung und Auswertung eine gemeinsame Messkompetenz bilden. Aus der Auswahl einer Methode und mehrerer zusammenhängender Größen folgt keine notwendige Zerlegung.',
        'outcome': 'Eine geeignete Kondensatormessung planen und sicher durchführen, um relevante charakteristische Größen aus begründeten direkten oder indirekten Beobachtungen zu gewinnen.',
        'evidence': [
            'Die lernende Person begründet eine zur physikalischen Messfrage passende Versuchsanordnung und Messstrategie und verwendet die elektronischen Messgeräte sicher.',
            'Sie gewinnt die verlangten Kondensatorgrößen nachvollziehbar aus den Messungen, legt die Beziehungen und Annahmen einer indirekten Bestimmung offen und erklärt deren physikalischen Gehalt.',
        ],
        'bounds': [
            'Entladekurve ist ein Beispiel und nicht die einzig verbindliche Versuchsmethode. Kapazität, Ladung und Energieinhalt werden mit wie als charakteristische Größen genannt; der normativ vollständige und gegebenenfalls verpflichtende Größenumfang ist noch zu binden.',
            'Apparategrenzen, Sicherheitsbedingungen und die akzeptierten Annahmen indirekter Messung sind nicht präzisiert. Keine freie Zusatzanforderung vollständiger Autonomie oder allgemeiner mathematischer Exponentialauswertung wird eingeführt.',
        ],
        'anchor': 'signifikante Größen wie Kapazität, Ladung und Energieinhalt unter sicherer Verwendung elektronischer Messgeräte',
    },
    135: {
        'response': 'Die Kritik wird für den eigenständigen Aspekte-13-Eintrag angenommen. Die dokumentierte Darstellung ist ausdrücklich Mittel zum Vergleich derselben Bewegungen. Ihre Erstellung und Interpretation können eine gemeinsame physikalische Analyse ergeben; der erste Split war deshalb stärker als belegt.',
        'outcome': 'Im wörtlich benannten Aspekte-13-Kontext Bewegungen anhand sinnvoller Darstellungen hinsichtlich Ortsänderung und Geschwindigkeit einschließlich Momentangeschwindigkeit vergleichen.',
        'evidence': [
            'Die lernende Person dokumentiert den gegebenen Bewegungssachverhalt in einer physikalisch geeigneten Darstellung mit erkennbaren Größen und Einheiten.',
            'Sie begründet Orts- und Geschwindigkeitsvergleiche aus dieser Darstellung und berücksichtigt die ausdrücklich genannte Momentangeschwindigkeit sachgerecht.',
        ],
        'bounds': [
            'Bewegungsklasse, Datenauflösung, Darstellungsform und zulässige Momentangeschwindigkeitsbestimmung sind auch hier offen.',
            'Die tatsächlich andere Wahlpflicht-/Profilüberschrift bleibt eine eigene lokale Scopebindung. Wortgleicher Inhalt begründet weder eine Aliasentscheidung noch eine automatische normative Gleichstellung mit Ph10.',
        ],
        'anchor': 'um sie hinsichtlich Geschwindigkeit (auch Momentangeschwindigkeit) und Ortsänderung miteinander zu vergleichen',
    },
    143: {
        'response': 'Die Kritik wird für den Aspekte-13-Eintrag mit derselben exakten Sprachgrenze angenommen: Der aktive Text sagt verschiedene, nicht beliebige Zeitpunkte. Arbeit, Energie und Reibungsarbeit können eine zusammenhängende Zustandsprognose tragen. Der notwendige Split wird zurückgenommen, während die aus einer Energiebilanz allein nicht gewonnene Zeit-Ort-Zuordnung ein konkreter Inhaltsblocker bleibt.',
        'outcome': 'Im tatsächlich benannten Aspekte-13-Kontext Zustände einer begrenzten mechanischen Bewegung mit Arbeit, Energie und realen Reibungsverlusten bestimmen und ihre Zuordnung zu den angesprochenen Zeitpunkten physikalisch begründen.',
        'evidence': [
            'Die lernende Person begründet die Energie- und Arbeitsbilanz aus dem gegebenen Bewegungsmodell und berücksichtigt die relevanten Reibungsverluste, statt pauschal mechanische Energieerhaltung zu behaupten.',
            'Sie bestimmt die zulässigen Orts- und Momentangeschwindigkeitsangaben und begründet mit zusätzlicher Zeitentwicklung oder Dynamik, welchem Zeitpunkt der jeweilige Bewegungszustand entspricht.',
            'Sie unterscheidet die Energierelation zwischen Zustandsgrößen von einer vollständig bestimmten zeitabhängigen Bewegungslösung.',
        ],
        'bounds': [
            'Bewegungsgesetz, Anfangszustand, Reibungsmodell und Bedingungen einer eindeutigen Zeit-Ort-Prognose sind nicht im lokalen Ziel festgelegt.',
            'Ein möglicher späterer Aufgabenhinweis oder eine Zeitfunktion ist hier keine bereits vorhandene Quellenbindung und keine Reparatur des aktiven Ziels. Die Aspekte-13-Überschrift löst diese Inhaltslücke nicht.',
        ],
        'anchor': 'den Aufenthaltsort und die Momentangeschwindigkeit eines bewegten Körpers zu verschiedenen Zeitpunkten',
        'contentBlocker': 'energy_balance_alone_does_not_determine_time_dependent_position',
    },
    162: {
        'response': 'Die Kritik wird angenommen. Resonatorspannung und Phasenverschiebung sind gekoppelte Messbelege für die begründete Resonanz- und Energieübertragungsaussage. Die gemeinsame Frequenzganganalyse ist konstruktiv; zwei Grafiken beweisen keinen notwendigen Split.',
        'outcome': 'Aus gemessenen Spannungs- und Phasenfrequenzgängen induktiv gekoppelter Schwingkreise die drahtlose Energieübertragung im Resonanzfall physikalisch begründen.',
        'evidence': [
            'Die lernende Person stellt sowohl Resonatorspannung als auch Phasenverschiebung in ihrer gemessenen Frequenzabhängigkeit korrekt dar und ordnet beide dem untersuchten Aufbau zu.',
            'Sie verwendet die grafischen Ergebnisse zusammen mit dem gekoppelten Schwingkreismodell, um die Resonanzbedingung und die behauptete optimale Übertragung unter den untersuchten Bedingungen nachvollziehbar zu begründen.',
        ],
        'bounds': [
            'Kopplung, Belastung, Dämpfung, Phasenkonvention und das Kriterium optimaler Übertragung sind im lokalen Text nicht präzisiert.',
            'Die Aussage über optimale Energieübertragung benötigt eine tragfähige physikalische Verbindung von den gemessenen Spannungs-/Phasengrößen zum gewählten Übertragungskriterium; ein bloß markiertes Spannungsmaximum ohne diese Verbindung reicht nicht.',
        ],
        'anchor': 'begründen anhand ihrer grafischen Auswertungen die optimale drahtlose Energieübertragung',
    },
    169: {
        'response': 'Die Kritik wird angenommen. Die ermittelte Gitterkonstante kann eine technische Eignungsbewertung derselben untersuchten Struktur tragen. Experiment und Anwendungsaussage sind so Teile einer gemeinsamen Untersuchung; ihre getrennte Prüfbarkeit beweist keinen zwingenden Split.',
        'outcome': 'Eine periodische optische Struktur durch eigenständig geplante und durchgeführte Interferenzmessung charakterisieren und ihre technische Eignung anhand der gewonnenen physikalischen Eigenschaften beurteilen.',
        'evidence': [
            'Die lernende Person plant und führt das Interferenzexperiment selbständig durch und gewinnt die Gitterkonstante aus begründeter optischer Geometrie und den tatsächlichen Beobachtungen.',
            'Sie begründet eine technische Anwendung oder Eignungsgrenze der untersuchten Struktur mit den ermittelten Eigenschaften und einem konkreten Anwendungskriterium.',
        ],
        'bounds': [
            'Beobachtungsgeometrie, Strukturauswahl und die normativ verlangten technischen Eignungskriterien sind nicht festgelegt.',
            'Optische Gitter und Datenträger sind Beispiele. Eine bestimmte Untersuchung kann Messung und Nutzungsaussage verbinden, bestätigt aber ohne Quellenscope nicht automatisch den vollständigen Anwendungsumfang.',
        ],
        'anchor': 'und bewerten die technischen Anwendungsmöglichkeiten der untersuchten Strukturen',
    },
    185: {
        'response': 'Die Kritik wird angenommen. Die bestimmten Abklinggrößen sollen im Satz ausdrücklich die technische Anwendungseinschätzung tragen. Grafische Auswertung, Parameterschluss und Eignungsbegründung können eine gemeinsame physikalische Daten-zu-Anwendung-Untersuchung bilden; der notwendige Split ist unbelegt.',
        'outcome': 'Experimentelle Daten eines physikalisch begrenzten exponentiellen Abklingvorgangs mit einem e-basierten Modell auswerten und aus den charakteristischen Größen eine konkrete technische Verwendung beurteilen.',
        'evidence': [
            'Die lernende Person stellt die experimentellen Messwerte mit sachgerechten Achsen dar, begründet die Verwendung eines exponentiellen Modells zur Basis e und bestimmt physikalisch interpretierte charakteristische Abklinggrößen.',
            'Sie leitet aus diesen Größen und einem ausdrücklich genannten technischen Kriterium eine nachvollziehbare Anwendungseinschätzung ab, statt die Anwendung unabhängig von der Messung nur zu nennen.',
        ],
        'bounds': [
            'Abklingprozess, Messgröße, Modellgültigkeit, möglicher Untergrund beziehungsweise Offset und technische Eignungskriterien sind im lokalen Text nicht angegeben.',
            'Die Kernphysiküberschrift liefert lokalen Kontext, aber keinen exakten Beleg, dass nur ein bestimmter radioaktiver Prozess oder ein bestimmter technischer Einsatz den gesamten Wortlaut ausschöpft. Ein mathematisch passender Fit alleine bestätigt weder den Prozess noch seine technische Tauglichkeit.',
        ],
        'anchor': 'um charakteristische Größen dieser Abklingvorgänge zu bestimmen und bewerten anhand derer technische Anwendungsmöglichkeiten',
    },
    189: {
        'response': 'Die Kritik wird angenommen. Die drei kinematischen Größen und die ausdrücklich genannten Zeiger- und Liniendiagramme können dieselbe harmonische Bewegung unter denselben Anfangsbedingungen beschreiben. Ihre abhängigen Phasenbeziehungen tragen eine gemeinsame Beschreibungskompetenz; mehrere Darstellungen beweisen keinen notwendigen Split.',
        'outcome': 'Im tatsächlich benannten ABU-Additum-13-Kontext eine harmonische Körperbewegung mit Anfangsbedingungen durch zusammenpassende trigonometrische Orts-, Geschwindigkeits- und Beschleunigungsverläufe sowie Zeiger- und Liniendiagramme beschreiben.',
        'evidence': [
            'Die lernende Person beschreibt alle drei benannten kinematischen Verläufe so, dass Frequenz, Amplituden, Phasenbeziehungen und Anfangsbedingungen derselben harmonischen Bewegung zusammenpassen.',
            'Sie ordnet Zeiger- und Liniendiagramme korrekt derselben Bewegung und den beschriebenen Größen zu; die Darstellungen ersetzen sich nicht pauschal und kein benannter Größenverlauf wird aus dem vollständigen Nachweis gestrichen.',
        ],
        'bounds': [
            'Systemwahl, Anfangsbedingungen sowie Koordinaten- und Phasenkonventionen sind nicht präzisiert. Die vollständige native Assessment- und Atomizitätsgrenze bleibt offen.',
            'Die Beschreibungsformulierung und die ABU-Additum-Überschrift bleiben exakt erhalten; weder dieselbe Anspruchstiefe wie modellieren im T-Ziel noch verpflichtende oder optionale Teilnahme wird aus Textähnlichkeit beziehungsweise dem Wort Additum abgeleitet.',
        ],
        'anchor': 'Sie verwenden für diesen Zweck auch Zeiger‑ und Liniendiagramme',
    },
}

assert set(NOTES) == set(INDICES)
assert sha(SOURCE.read_bytes()) == 'sha256:766bb61296547677d0fdd910c3d4abfdf2799010c09ecd99e134cc49ea629f12'
assert sha((REVIEW / 'manifest.independent-review-v1.json').read_bytes()) == 'sha256:de7f25457d57654cc8480eba70e3afe5367d4548835c36e477a249696d8bca1a'
assert sha((REVIEW / 'semantic-owner-scope.independent-review-v1.json').read_bytes()) == 'sha256:0f09a94f118e643a59e576002c7507f900f7eca857b0e8e508b388f49e1aad8b'
assert sha((V1 / 'semantic-role-ownership-scope.author-ledger.final.json').read_bytes()) == 'sha256:4ff56b552fd888d88e184cae669f7fab734e461f8fd105b0e8e56753063dc9e4'
source = read(SOURCE)
goals = source['goals']
previous = read(V1 / 'semantic-role-ownership-scope.author-ledger.final.json')
peer = read(REVIEW / 'semantic-owner-scope.independent-review-v1.json')
raw_author = read(V1 / 'physics-author-classifications.json')
previous_by_id = {e['goalId']: e for e in previous['entries']}
peer_by_id = {e['goalId']: e for e in peer['entries']}
raw_author_by_id = {e['goalId']: e for e in raw_author['entries']}
actual_needs_revision = sorted(e['sourceIndexZeroBased'] for e in peer['entries'] if e['sourcePath'] == str(SOURCE.relative_to(ROOT)) and e['candidateClassificationGate'] == 'needs_revision')
assert actual_needs_revision == INDICES

input_paths = [SOURCE, ROOT / 'AGENTS.md', ROOT / 'LICENSING.md',
               V1 / 'manifest.json', V1 / 'semantic-role-ownership-scope.author-ledger.final.json',
               V1 / 'physics-author-classifications.json',
               REVIEW / 'manifest.independent-review-v1.json',
               REVIEW / 'semantic-owner-scope.independent-review-v1.json']
frozen_inputs = [binding(p) for p in input_paths]
entries = []
for i in INDICES:
    goal = goals[i]
    old = previous_by_id[goal['id']]
    critique = peer_by_id[goal['id']]
    note = NOTES[i]
    assert old['sourceIndex'] == i and critique['sourceIndexZeroBased'] == i
    assert fp(goal) == old['fullGoalSha256'] == critique['fullGoalSha256']
    assert fp(old) == critique['exactAuthorEntrySha256']
    desc_pair = {'description': goal.get('description'), 'descriptionEn': goal.get('descriptionEn')}
    assert fp(desc_pair) == old['fullDescriptionSha256'] == critique['fullDescriptionPairSha256']
    assert note['anchor'] in goal['description']
    local_parents = [g for g in goals if goal['id'] in g.get('contains', [])]
    assert len(local_parents) == 1
    ancestors = []
    cursor = local_parents
    seen = {goal['id']}
    while cursor:
        nxt = []
        for parent in cursor:
            assert parent['id'] not in seen
            seen.add(parent['id'])
            ancestors.append({'goalId': parent['id'], 'title': parent['title'], 'fullCurrentGoal': parent, 'fullGoalSha256': fp(parent)})
            nxt.extend(g for g in goals if parent['id'] in g.get('contains', []))
        cursor = nxt
    assert not goal.get('contains')
    qualifier = 'with application context / nonexclusive' if note.get('applicationContext') else 'physical content interpretation / nonexclusive'
    entries.append({
        'goalId': goal['id'],
        'sourcePath': str(SOURCE.relative_to(ROOT)),
        'sourceIndexZeroBased': i,
        'sourceOrdinalOneBased': i + 1,
        'sourceFileSha256': binding(SOURCE)['sha256'],
        'fullCurrentGoal': goal,
        'fullGoalSha256': fp(goal),
        'originalTitle': goal['title'],
        'titleUtf8Sha256': sha(goal['title'].encode('utf-8')),
        'originalDescription': goal['description'],
        'originalDescriptionEn': goal.get('descriptionEn'),
        'descriptionEnFieldPresent': 'descriptionEn' in goal,
        'fullDescriptionPairSha256': fp(desc_pair),
        'descriptionDeUtf8Sha256': sha(goal['description'].encode('utf-8')),
        'descriptionEnUtf8Sha256': sha(goal['descriptionEn'].encode('utf-8')) if 'descriptionEn' in goal else None,
        'exactV1AuthorLedgerEntry': old,
        'exactV1AuthorLedgerEntrySha256': fp(old),
        'exactV1ChildAuthorEntry': raw_author_by_id[goal['id']],
        'exactV1ChildAuthorEntrySha256': fp(raw_author_by_id[goal['id']]),
        'exactIndependentV1PeerEntry': critique,
        'exactIndependentV1PeerEntrySha256': fp(critique),
        'exactIndependentV1PeerCritique': critique['individualScientificRationale'],
        'actualLocalAncestors': ancestors,
        'actualLocalAncestorsSha256': fp(ancestors),
        'literalScopeContextPreserved': old['literalScopeContext'],
        'literalScopeContextSha256': fp(old['literalScopeContext']),
        'currentDirectRequiresObservedOnly': goal.get('requires', []),
        'currentDirectContainsObservedOnly': goal.get('contains', []),
        'currentEffectivePrerequisitesPreservedFromExactV1Context': old['currentEffectivePrerequisitesObserved'],
        'currentEffectivePrerequisiteSetSha256Preserved': old['currentEffectivePrerequisiteSetSha256'],
        'actualOwnerOccurrencesPreserved': old['actualOwnerOccurrences'],
        'actualOwnerOccurrencesSha256': fp(old['actualOwnerOccurrences']),
        'inventoryAuthoritativeOwnerObservedOnly': old['inventoryAuthoritativeOwner'],
        'authoritativeOwnerChosen': False,
        'responseDisposition': 'accept_peer_critique_with_bounded_author_correction',
        'individualPeerResponse': note['response'],
        'actualSubject': 'Physics',
        'subjectInterpretationQualifier': qualifier,
        'subjectInterpretationApproved': False,
        'exclusiveSubjectOwnerApproved': False,
        'semanticRoleAuthorCandidate': 'assessable_outcome_with_open_granularity_or_content_limit',
        'cohesivePhysicsOutcomeAuthorCandidate': note['outcome'],
        'individualContentReason': note['response'] + ' Zusammenhängendes mögliches Ergebnis: ' + note['outcome'],
        'potentialAssessmentUnitsAuthorNotes': [note['outcome']],
        'learnerPhysicsEvidenceRequiredAuthorNotes': note['evidence'],
        'remainingGranularityOrContentBoundsAuthorNotes': note['bounds'],
        'granularityGapsAuthorNotes': [{'gapId': f'BY-FOS-PHYS-{i:03d}-V2-OPEN', 'status': 'author_named_open_not_mandatory_split', 'name': text, 'approvedSplit': False} for text in note['bounds']],
        'specificContentBlocker': note.get('contentBlocker'),
        'separatelyAssessablePartsProveMandatorySplit': False,
        'mandatorySplitApproved': False,
        'narrowAtomicityApproved': False,
        'anyNamedMathematicsGoalUniversallyNecessaryApproved': False,
        'nativeQualityGate': 'pending',
        'requiresGate': 'pending',
        'sourceGoalBindingGate': 'pending',
        'normativeScopeGate': 'pending',
        'granularityGate': 'pending',
        'adoptionGate': 'pending',
        'authorAgent': AGENT,
        'authorRole': 'AUTHOR',
        'fullReadWitness': {
            'readerAgent': AGENT,
            'fullCurrentTitleRead': True,
            'fullCurrentGermanDescriptionRead': True,
            'anyPresentEnglishDescriptionRead': True,
            'englishDescriptionFieldAbsent': 'descriptionEn' not in goal,
            'fullCurrentGoalRead': True,
            'actualLocalHeadingAndAncestorTitlesRead': True,
            'originalAuthorRoleReasonAndUnitsRead': True,
            'exactIndependentCritiqueRead': True,
            'descriptionCharacterCount': len(goal['description']),
            'exactContentAnchor': note['anchor'],
            'contentAnchorUtf8Sha256': sha(note['anchor'].encode('utf-8')),
            'individualReasonWitnessSha256': fp(note),
        },
        'independentReviewOfThisV2ResponseCompleted': False,
        'sourceBytesIdsEdgesOwnersChanged': False,
        'activeRegistryWritten': False,
        'activeNativeQaWritten': False,
    })

assert len(entries) == 19
assert len({e['goalId'] for e in entries}) == 19
assert all(e['nativeQualityGate'] == 'pending' and not e['mandatorySplitApproved'] and not e['narrowAtomicityApproved'] for e in entries)
assert [e['sourceIndexZeroBased'] for e in entries if e['subjectInterpretationQualifier'] == 'with application context / nonexclusive'] == [19, 54, 84]
for row in frozen_inputs:
    assert binding(ROOT / row['path']) == row

packet = {
    'schemaVersion': 1,
    'artifactId': 'by-fos-physics-19-of-40-review-responses-author-v2',
    'status': 'inert_additive_author_response_pending_separate_independent_review',
    'recordedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'authorAgent': AGENT,
    'authorRole': 'AUTHOR',
    'parentAuthorAgent': '/root/physics_pending5_revision',
    'familyId': 'by-fachoberschule',
    'indexConvention': 'sourceIndexZeroBased addresses the exact ordered goals array in the pinned Physics file; ordinal is index + 1',
    'hashConventions': {
        'file': 'SHA256 of exact file bytes; lowercase hex prefixed sha256:',
        'json': 'Python json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(comma,colon)), UTF-8 encoded; no Unicode normalization or added newline',
        'string': 'SHA256 of exact decoded JSON string encoded UTF-8; no Unicode normalization or added newline',
        'descriptionPair': 'Canonical JSON object with exactly description and descriptionEn keys; an absent field is represented by JSON null and field presence is recorded separately',
        'entry': 'The entire embedded original JSON object, not a subset or an inferred semantic projection',
    },
    'instructionFilesRead': ['AGENTS.md §§2.1–2.3, §7 conventions and §7.1 semantic atomicity, §9 author behavior, project licensing; LICENSING.md'],
    'fullReadMethod': 'Personal complete read of every one of the 19 current German descriptions, any present English text (all 19 absent), current complete title, actual local heading, original author role/reason/assessment units and exact independent critique. Artifact assembly asserts exact per-case source/author/peer bindings; assertions do not judge semantics.',
    'originalIndependentReview': binding(REVIEW / 'manifest.independent-review-v1.json'),
    'originalIndependentReviewLedger': binding(REVIEW / 'semantic-owner-scope.independent-review-v1.json'),
    'originalV1AuthorLedger': binding(V1 / 'semantic-role-ownership-scope.author-ledger.final.json'),
    'sourceFile': binding(SOURCE),
    'frozenInputs': frozen_inputs,
    'counts': {
        'allV1NeedsRevisionAcrossSubjects': 40,
        'physicsCasesInThisContribution': 19,
        'individuallyAcceptedPeerCritiquesWithBoundedCorrections': 19,
        'openGranularityOrContentLimits': 19,
        'applicationContextSubjectInterpretationCorrections': 3,
        'energyTimeModelPrecisionBlockers': 2,
        'independentV2Approvals': 0,
        'nativeApprovals': 0,
        'requiresApprovals': 0,
        'ownerChoices': 0,
        'activeEdits': 0,
    },
    'entries': entries,
    'scopeBoundary': 'Literal current headings and existing inventory/owner facts are retained as observations. No source research, legal branch/stage assertion, alias decision or independently approved semantic category is added.',
    'assessmentBoundary': 'Cohesive outcomes and evidence lists show a defensible author route, not a native assessment or an exhaustive official-source coverage proof. In particular, combined methods, calculation plus interpretation and alternative representations neither compel a split nor automatically approve narrow atomicity.',
    'actionBoundary': 'Only this fresh response file and its own builder are written. V1 author and peer artifacts, original goal text, stable IDs, source bytes, requires/contains, owners, active registries, views and native QA remain unchanged. Parent assembly and a separate independent review are still required.',
    'licensing': {
        'technicalMetadataAndBuilder': 'Apache-2.0',
        'ownDidacticAuthorResponses': 'CC-BY-4.0',
        'originalSourceAndQuotedReviewInputs': 'Retain original rights and notices. No new ownership or redistribution-right claim for inherited or third-party original text.',
        'attribution': 'SkillPilot; own author judgments by /root/physics_pending5_revision/by_fos_physics_v2_author; exact source and prior author/reviewer provenance retained per case.',
    },
}
OUT.mkdir(parents=True, exist_ok=True)
assert not TARGET.exists(), 'Refuse to overwrite an existing response packet.'
TARGET.write_text(json.dumps(packet, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'path': str(TARGET.relative_to(ROOT)), 'sha256': sha(TARGET.read_bytes()), 'bytes': len(TARGET.read_bytes()), 'cases': len(entries), 'sourceAndAll8FrozenInputsUnchanged': all(binding(ROOT / row['path']) == row for row in frozen_inputs)}, ensure_ascii=False))
