import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const startedAt = new Date().toISOString();
const root = dirname(fileURLToPath(import.meta.url));
const campaign = JSON.parse(readFileSync(join(root, 'description-review-campaign.json'), 'utf8'));
const bundle = JSON.parse(readFileSync(join(root, 'review-bundle-manifest.json'), 'utf8'));
const batch = campaign.batches[0];
const input = readFileSync(join(root, 'batches', `${batch.batchId}.input.jsonl`), 'utf8')
  .trim().split('\n').map((line) => JSON.parse(line));

// Each entry is an independently authored decision in the assigned page order.
const reviews = [
  {
    decision: 'keep',
    rationale: 'Die vorhandenen Texte benennen die Dichte, beide Parameter und deren Deutung bereits präzise; die Eigenschaften können im separaten Evidenzprofil konkretisiert werden.',
    eDe: 'Die Normaldichte ist nichtnegativ und hat Gesamtfläche eins; μ verschiebt ihre Mitte, während ein positives σ ihre Streuung und Gipfelhöhe verändert.',
    eEn: 'The normal density is nonnegative and has total area one; μ shifts its center, while a positive σ changes its spread and peak height.',
    oDe: 'Die lernende Person gibt die Dichte mit σ > 0 an, skizziert oder vergleicht zwei Dichtegraphen und erklärt an ihnen die Wirkung von μ und σ.',
    oEn: 'The learner states the density with σ > 0, sketches or compares two density graphs, and explains on them the effects of μ and σ.',
    tDe: 'Bei einer neuen Kombination von Lage und Streuung sagt die lernende Person Lage, Breite und Höhe des Dichtegraphen voraus und prüft diese an der Funktionsform.',
    tEn: 'For a new combination of location and spread, the learner predicts the density graph’s position, width, and height and checks them against the function form.'
  },
  {
    decision: 'keep',
    rationale: 'Wahrscheinlichkeit als Fläche beziehungsweise digital bestimmter Wert und ihre Kontextdeutung sind im aktuellen Ziel zusammenhängend und zweisprachig klar.',
    eDe: 'Bei einer stetigen Normalverteilung entspricht die Wahrscheinlichkeit eines Werteintervalls der Fläche unter der Dichte über diesem Intervall; der Wert ist auf das Ereignis im Sachkontext bezogen.',
    eEn: 'For a continuous normal distribution, the probability of a value interval equals the area under the density over that interval; the value refers to the event in context.',
    oDe: 'Die lernende Person formuliert das Ereignis als Intervall, markiert die zugehörige Dichtefläche, bestimmt die Wahrscheinlichkeit mit einem geeigneten Werkzeug oder Flächenargument und interpretiert sie.',
    oEn: 'The learner expresses the event as an interval, marks the corresponding density area, determines the probability using an appropriate tool or area argument, and interprets it.',
    tDe: 'Bei einer neuen Kontextfrage mit zweiseitiger statt einseitiger Begrenzung zerlegt die lernende Person die gesuchte Fläche richtig und deutet das Ergebnis für das neue Ereignis.',
    tEn: 'For a new context question with two bounds instead of one, the learner identifies the required area correctly and interprets the result for the new event.'
  },
  {
    decision: 'split_review',
    rationale: 'Eine unbekannte Intervallgrenze und ein unbekannter Verteilungsparameter sind verschiedenartige inverse Probleme mit eigenständig prüfbaren Lösungswegen; ein einzelner Wortlaut würde die Atomizitätsfrage verdecken.',
    eDe: 'Inverse Normalfragen kehren die Zuordnung von Verteilungswerten zu Grenzen beziehungsweise von Wahrscheinlichkeiten zu Modellparametern um; die unbekannte Größe bestimmt Gleichung und Zulässigkeitsbedingungen.',
    eEn: 'Inverse normal questions reverse the mapping from cumulative values to bounds or from probabilities to model parameters; the unknown quantity determines the equation and admissibility conditions.',
    oDe: 'Die lernende Person erkennt in einer gegebenen Wahrscheinlichkeit, welche Größe gesucht ist, stellt eine passende Normalgleichung auf und überprüft die gefundene Grenze oder den Parameter im Kontext.',
    oEn: 'The learner identifies which quantity is unknown from a given probability, sets up a suitable normal equation, and checks the resulting bound or parameter in context.',
    tDe: 'In einer neu formulierten Frage wechselt die unbekannte Größe von einer Intervallgrenze zu einem Verteilungsparameter; die lernende Person passt Gleichung und Plausibilitätsprüfung an.',
    tEn: 'In a newly framed question, the unknown changes from an interval bound to a distribution parameter; the learner adapts the equation and plausibility check.'
  },
  {
    decision: 'keep',
    rationale: 'Wertebereich und Wahrscheinlichkeitsbeschreibung sind die entscheidenden Merkmale; das begründete Zuordnen von Beispielen bleibt dieselbe Unterscheidungskompetenz.',
    eDe: 'Diskrete Zufallsgrößen nehmen einzelne mögliche Werte mit zuordenbaren Punktwahrscheinlichkeiten an; stetige Zufallsgrößen werden über Bereiche und Dichten beschrieben, wobei ein Einzelwert keine positive Wahrscheinlichkeit hat.',
    eEn: 'Discrete random variables take separate possible values with assignable point probabilities; continuous random variables are described through intervals and densities, with no positive probability at a single value.',
    oDe: 'Die lernende Person klassifiziert beschriebene Zufallsgrößen und begründet anhand möglicher Werte und der passenden Wahrscheinlichkeitsaussage, warum eine Zählgröße oder Messgröße diskret oder stetig ist.',
    oEn: 'The learner classifies described random variables and uses their possible values and suitable probability statements to justify why a count or measurement is discrete or continuous.',
    tDe: 'Bei einer neuen Größe, etwa einer gerundeten Messung statt der ungerundeten Größe, prüft die lernende Person erneut Wertebereich und sinnvolle Wahrscheinlichkeitsbeschreibung.',
    tEn: 'For a new variable, such as a rounded measurement rather than the unrounded measurement, the learner reassesses the range and meaningful probability description.'
  },
  {
    decision: 'keep',
    rationale: 'Der Integralwert als angesammelte Wahrscheinlichkeit und sein Bezug zur Dichtefläche sind fachlich präzise und bilden eine zusammenhängende Deutung.',
    eDe: 'Die Verteilungsfunktion Φ(x) sammelt die Dichtefläche von links bis x; deshalb ist sie eine kumulierte Wahrscheinlichkeit und wächst mit einer nichtnegativen Dichte.',
    eEn: 'The cumulative distribution function Φ(x) accumulates density area from the left up to x; it is therefore a cumulative probability and increases for a nonnegative density.',
    oDe: 'Die lernende Person markiert zu einer Grenze x die passende Fläche am Normaldichtegraphen, ordnet ihr Φ(x) zu und erläutert die Änderung des Werts bei verschobener Grenze.',
    oEn: 'The learner marks the area corresponding to a bound x on a normal density graph, associates it with Φ(x), and explains how the value changes when the bound moves.',
    tDe: 'Bei einer neuen Grenze auf der anderen Seite der Verteilungsmitte verknüpft die lernende Person die neue Dichtefläche mit dem zugehörigen Verteilungswert.',
    tEn: 'For a new bound on the opposite side of the distribution center, the learner links the new density area to its cumulative value.'
  },
  {
    decision: 'revise',
    proposedDescriptionDe: 'Die lernende Person kann in stochastischen Situationen anhand ihrer Entstehung und Verteilungsform begründet einschätzen, ob eine Zufallsgröße annähernd normalverteilt ist.',
    proposedDescriptionEn: 'The learner can use how a random variable arises and the shape of its distribution to judge whether it is approximately normally distributed in a stochastic situation.',
    rationale: '„Erkennen und untersuchen“ lässt das entscheidende Urteil offen. Die lokale Präzisierung auf Entstehung und Verteilungsform macht die bereits beanspruchte Prüfung beobachtbar, ohne eine neue Verteilungsmethode einzuführen.',
    eDe: 'Eine annähernde Normalform ist eine Modellbehauptung über die Entstehung und Form der Zufallsgröße, nicht allein über einen glockenförmigen Einzelgraphen; deutliche Schiefe oder mehrere Häufungen sprechen dagegen.',
    eEn: 'Approximate normality is a model claim about how a random variable arises and the shape of its distribution, not merely about one bell-shaped graph; marked skew or several clusters count against it.',
    oDe: 'Die lernende Person untersucht eine beschriebene Zufallsgröße und eine Verteilungsdarstellung, benennt Merkmale für oder gegen eine annähernde Normalverteilung und begründet ein vorsichtiges Urteil.',
    oEn: 'The learner examines a described random variable and a distribution display, identifies features for or against approximate normality, and justifies a cautious judgment.',
    tDe: 'Bei einer veränderten Entstehung oder einer sichtbar schiefen statt annähernd symmetrischen Verteilung passt die lernende Person ihre Einschätzung begründet an.',
    tEn: 'When the generating situation changes or the distribution is visibly skewed rather than roughly symmetric, the learner revises the judgment with reasons.'
  },
  {
    decision: 'revise',
    proposedDescriptionDe: 'Die lernende Person kann das Skalarprodukt zweier Vektoren mithilfe einer orthogonalen Projektion als Produkt einer Vektorlänge und der vorzeichenbehafteten Projektionslänge des anderen Vektors geometrisch veranschaulichen und erläutern.',
    proposedDescriptionEn: 'The learner can use an orthogonal projection to visualize and explain the dot product of two vectors geometrically as the product of one vector’s length and the other vector’s signed projection length.',
    rationale: 'Der aktuelle Text nennt die Projektion, aber nicht die zu veranschaulichende Produktbeziehung. Der Ersatz macht genau diese definierende Beziehung einschließlich Vorzeichen sichtbar.',
    eDe: 'Für einen von null verschiedenen Bezugsvektor ist das Skalarprodukt seine Länge mal die vorzeichenbehaftete Länge der Projektion des anderen Vektors auf seine Richtung; Winkelrichtung und Orthogonalität erklären das Vorzeichen.',
    eEn: 'For a nonzero reference vector, the dot product is its length times the signed projection length of the other vector onto its direction; angle direction and orthogonality explain the sign.',
    oDe: 'Die lernende Person zeichnet eine orthogonale Projektion, kennzeichnet die vorzeichenbehaftete Projektionslänge und erläutert daraus Betrag oder Vorzeichen des Skalarprodukts.',
    oEn: 'The learner draws an orthogonal projection, marks the signed projection length, and uses it to explain the magnitude or sign of the dot product.',
    tDe: 'Bei einer neuen Vektoranordnung mit stumpfem statt spitzem Winkel überträgt die lernende Person die Projektionsdeutung und erklärt den Vorzeichenwechsel.',
    tEn: 'For a new vector arrangement with an obtuse rather than acute angle, the learner transfers the projection interpretation and explains the sign change.'
  },
  {
    decision: 'split_review',
    rationale: '„Abstände und Längen“ sowie „zwischen Punkten und Geraden“ bündeln mehrere Konfigurationen; Punkt-Gerade-Abstand ist zusätzlich ein eigenes Nachbarziel. Die Identität und Abgrenzung der eigenständig prüfbaren Teilkompetenzen muss geklärt werden.',
    eDe: 'Ein räumlicher Abstand ist die Länge einer kürzesten Verbindungsstrecke; je nach beteiligten Punkten oder Geraden entsteht diese über Koordinatendifferenzen oder eine orthogonale Projektion.',
    eEn: 'A distance in space is the length of a shortest connecting segment; depending on the points or lines involved, it comes from coordinate differences or an orthogonal projection.',
    oDe: 'Die lernende Person identifiziert in einer räumlichen Konfiguration die gesuchte Länge, stellt eine passende Koordinaten- oder Projektionsbeziehung auf und deutet das Ergebnis geometrisch.',
    oEn: 'The learner identifies the required length in a spatial configuration, sets up a suitable coordinate or projection relation, and interprets the result geometrically.',
    tDe: 'Bei einem Wechsel von zwei Punkten zu einem Punkt und einer Geraden prüft die lernende Person, welche kürzeste Verbindung und welches Verfahren nun gelten; diese Teilfälle bedürfen getrennter Zielprüfung.',
    tEn: 'When the configuration changes from two points to a point and a line, the learner determines the new shortest connection and method; these subcases need separate goal review.'
  },
  {
    decision: 'keep',
    rationale: 'Der Punkt-Gerade-Abstand ist klar abgegrenzt; Projektion, Lot und analytische Darstellung sind zusammengehörige Wege zur selben Distanz.',
    eDe: 'Der Abstand eines Punkts von einer Geraden ist die Länge der Lotstrecke; die Projektion auf die Geradenrichtung liefert den Lotfuß und trennt parallele und senkrechte Anteile.',
    eEn: 'The distance from a point to a line is the length of the perpendicular segment; projection onto the line direction gives the foot of the perpendicular and separates parallel and perpendicular components.',
    oDe: 'Die lernende Person stellt Punkt und Gerade analytisch dar, findet eine Lotbeziehung oder Projektion, berechnet die Lotlänge und erklärt deren geometrische Bedeutung.',
    oEn: 'The learner represents the point and line analytically, finds a perpendicular relation or projection, calculates the perpendicular length, and explains its geometric meaning.',
    tDe: 'Bei einer schräg liegenden statt achsenparallelen Geraden überträgt die lernende Person das Lotprinzip und prüft, dass der gefundene Verbindungsvektor senkrecht zur Geraden ist.',
    tEn: 'For an oblique rather than axis-parallel line, the learner applies the perpendicular principle and checks that the connecting vector is perpendicular to the line.'
  },
  {
    decision: 'keep',
    rationale: 'Der Kern ist eine begründete Auswahl und Anwendung eines Abstandsverfahrens für die gegebene Konfiguration; die Bandbreite der Fälle ist die notwendige Vergleichsbasis dieser Methodenkompetenz.',
    eDe: 'Ein analytisches Abstandsverfahren muss zur Art und Lage von Punkt, Gerade oder Ebene passen; entscheidend ist jeweils eine kürzeste beziehungsweise senkrechte Verbindung und die Zulässigkeit der gewählten Darstellung.',
    eEn: 'An analytic distance method must fit the type and relative position of point, line, or plane; the key is a shortest or perpendicular connection and whether the chosen representation applies.',
    oDe: 'Die lernende Person erkennt die Konfiguration, begründet die Wahl eines geeigneten Verfahrens, führt die Rechnung aus und prüft das Resultat anhand der räumlichen Lage.',
    oEn: 'The learner identifies the configuration, justifies the choice of a suitable method, carries out the calculation, and checks the result against the spatial arrangement.',
    tDe: 'Bei einer neuen Konfiguration mit geänderter Lagebeziehung wechselt die lernende Person das Verfahren, falls das bisherige nicht passt, und begründet die neue Wahl.',
    tEn: 'For a new configuration with a changed positional relationship, the learner changes method if the previous one no longer fits and justifies the new choice.'
  },
  {
    decision: 'keep',
    rationale: 'Achsen und Koordinatenebenen bilden zusammen die gemeinte Untersuchung besonderer Geradenlagen; rechnerische Begründung und geometrische Deutung sind präzise benannt.',
    eDe: 'Richtungsvektor und Stützpunkt einer Geraden kodieren, ob sie zu einer Koordinatenachse oder -ebene parallel ist, darin liegt oder sie schneidet; Nullkoordinaten haben dabei unterschiedliche Rollen.',
    eEn: 'A line’s direction vector and point of support encode whether it is parallel to, lies in, or intersects a coordinate axis or plane; zero coordinates play different roles.',
    oDe: 'Die lernende Person prüft an einer Geradengleichung die relevanten Koordinaten, begründet eine besondere Lage rechnerisch und stellt sie in einer Skizze oder verbalen Raumdeutung dar.',
    oEn: 'The learner checks the relevant coordinates of a line equation, justifies a special position algebraically, and depicts it in a sketch or verbal spatial interpretation.',
    tDe: 'Bei einer geänderten Stützpunktkoordinate bei gleichem Richtungsvektor unterscheidet die lernende Person erneut zwischen Parallelität und tatsächlichem Liegen in einer Koordinatenebene.',
    tEn: 'When a point coordinate changes but the direction vector stays the same, the learner distinguishes anew between being parallel to a coordinate plane and lying in it.'
  },
  {
    decision: 'keep',
    rationale: 'Bestimmen, Vergleichen und Begründen beziehen sich hier auf dieselben Volumenverhältnisse; die konkrete räumliche Variation gehört in das Evidenzprofil.',
    eDe: 'Ein Volumenverhältnis vergleicht Teilvolumina desselben räumlichen Körpers oder verwandter Körper; gleiche Höhen, Grundflächenverhältnisse und geometrische Teilungen können das Verhältnis bestimmen.',
    eEn: 'A volume ratio compares parts of the same solid or related solids; equal heights, base-area ratios, and geometric divisions can determine that ratio.',
    oDe: 'Die lernende Person zerlegt oder vergleicht eine räumliche Figur, berechnet die betroffenen Teilvolumina oder nutzt eine gemeinsame Höhenbeziehung und begründet das resultierende Verhältnis.',
    oEn: 'The learner partitions or compares a spatial figure, calculates the relevant partial volumes or uses a common-height relation, and justifies the resulting ratio.',
    tDe: 'Wenn die Teilung in einer neuen Figur an anderer Stelle erfolgt, bestimmt die lernende Person das veränderte Teilvolumenverhältnis und erklärt, welche geometrische Größe es steuert.',
    tEn: 'When the division occurs at a different position in a new figure, the learner determines the changed partial-volume ratio and explains which geometric quantity controls it.'
  },
  {
    decision: 'keep',
    rationale: 'Cavalieri ist ausdrücklich die beanspruchte Methode und die Formel für das schiefe Prisma wird als Plausibilisierung, nicht als strenger Beweis, gefordert.',
    eDe: 'Schiefe und gerade Prismen mit gleicher Grundfläche und Höhe besitzen in jeder entsprechenden Höhe gleich große Querschnitte; nach Cavalieri haben sie daher gleiches Volumen G mal h.',
    eEn: 'Oblique and right prisms with the same base area and height have equal-sized cross-sections at every corresponding height; by Cavalieri they therefore have the same volume G times h.',
    oDe: 'Die lernende Person vergleicht die Querschnitte eines schiefen und eines geraden Prismas, erläutert die Voraussetzungen von Cavalieri und begründet damit die Plausibilität von V = G mal h.',
    oEn: 'The learner compares cross-sections of an oblique and a right prism, explains Cavalieri’s conditions, and uses them to make V = G times h plausible.',
    tDe: 'Bei einem neu gezeichneten schiefen Prisma mit anderer Scherrichtung prüft die lernende Person erneut Grundfläche, senkrechte Höhe und Querschnittsgleichheit.',
    tEn: 'For a newly drawn oblique prism slanted in another direction, the learner checks base area, perpendicular height, and cross-sectional equality again.'
  },
  {
    decision: 'keep',
    rationale: 'Der Faktor ein Drittel, Grundfläche und senkrechte Höhe sind bereits als zusammenhängende Begründungskompetenz formuliert; Zerlegung und Vergleich sind zulässige Wege.',
    eDe: 'Bei gleicher Grundfläche G und senkrechter Höhe h hat eine Pyramide ein Drittel des Volumens eines entsprechenden Prismas; der Faktor stammt aus einer geometrischen Zerlegung oder einem tragfähigen Vergleich.',
    eEn: 'With the same base area G and perpendicular height h, a pyramid has one third of the volume of a corresponding prism; the factor comes from a geometric decomposition or sound comparison.',
    oDe: 'Die lernende Person entwickelt eine passende Zerlegung oder einen Volumenvergleich, erklärt die Bedeutung des Faktors ein Drittel und bezieht G und h auf die Figur.',
    oEn: 'The learner develops a suitable decomposition or volume comparison, explains the meaning of the one-third factor, and relates G and h to the figure.',
    tDe: 'Bei einer schiefen statt geraden Pyramide prüft die lernende Person, dass die senkrechte Höhe entscheidend bleibt, und passt die Begründung an.',
    tEn: 'For an oblique rather than right pyramid, the learner checks that perpendicular height still matters and adapts the justification.'
  },
  {
    decision: 'revise',
    proposedDescriptionDe: 'Die lernende Person kann bei einer mathematischen Aufgabe unter Randbedingungen wie Zeit, Hilfsmitteln und Zielgenauigkeit eine Lösungsstrategie auswählen und ihre Eignung nachvollziehbar begründen.',
    proposedDescriptionEn: 'For a mathematical task, the learner can choose a solution strategy under constraints such as time, available tools, and target accuracy and clearly justify why it is suitable.',
    rationale: '„Eine Strategie“ bleibt ohne Aufgabenbezug zu allgemein. Der Ersatz präzisiert die bestehende mathematische Entscheidungsleistung und erhält alle drei Randbedingungen.',
    eDe: 'Eine mathematische Strategie ist unter Zeit-, Hilfsmittel- und Genauigkeitsbedingungen nur dann geeignet, wenn Aufwand und zu erwartende Güte zum Ziel der Aufgabe passen.',
    eEn: 'A mathematical strategy is suitable under time, tool, and accuracy constraints only when its effort and expected quality fit the task’s goal.',
    oDe: 'Die lernende Person vergleicht zwei plausible Lösungswege für eine Aufgabe, nennt die maßgebliche Randbedingung und begründet ihre Wahl anhand von Aufwand und Zielgenauigkeit.',
    oEn: 'The learner compares two plausible solution paths for a task, names the decisive constraint, and justifies the choice using effort and target accuracy.',
    tDe: 'Bei derselben mathematischen Frage mit kürzerer Zeit oder höherer geforderter Genauigkeit überprüft die lernende Person die Wahl neu und erklärt einen möglichen Strategiewechsel.',
    tEn: 'For the same mathematical question with less time or a higher accuracy requirement, the learner reassesses the choice and explains a possible change of strategy.'
  },
  {
    decision: 'keep',
    rationale: 'Der Text verbindet Aussagekraft, konkrete Grenzen durch Skalierung und Datenlage sowie mögliche Verbesserungen klar zu einer Bewertungskompetenz.',
    eDe: 'Eine Visualisierung kann Muster zeigen, aber Maßstab, Achsenwahl und Datenbasis beeinflussen, welche Aussagen begründet sind und welche nur scheinbar nahegelegt werden.',
    eEn: 'A visualization can reveal patterns, but scale, axis choices, and data basis affect which claims are justified and which are merely suggested.',
    oDe: 'Die lernende Person beschreibt eine durch ein Diagramm gestützte Aussage, zeigt eine Grenze durch Skalierung oder Datenlage und schlägt eine passende Darstellungsverbesserung vor.',
    oEn: 'The learner describes a claim supported by a diagram, shows a limitation caused by scaling or data quality, and suggests an appropriate improvement to the display.',
    tDe: 'Bei derselben Datenlage mit veränderter Achsenskalierung überprüft die lernende Person die frühere Interpretation und beurteilt, welche Aussage weiterhin tragfähig ist.',
    tEn: 'For the same data shown with a changed axis scale, the learner rechecks the earlier interpretation and judges which claim remains defensible.'
  },
  {
    decision: 'keep',
    rationale: 'Aufwand und Genauigkeit sind konkrete Vergleichsdimensionen; die Verfahrenwahl ist einem Nachbarziel vorbehalten und wird hier nicht vorweggenommen.',
    eDe: 'Der Aufwand eines Verfahrens zeigt sich in Rechenschritten oder Rechenzeit, während Genauigkeit die Nähe beziehungsweise Verlässlichkeit des Ergebnisses beschreibt; ein Vergleich braucht dieselbe Aufgabenstellung und geeignete Kriterien.',
    eEn: 'A method’s effort appears in steps or computation time, while accuracy describes how close or reliable its result is; comparison requires the same task and suitable criteria.',
    oDe: 'Die lernende Person stellt zwei Verfahren für dieselbe mathematische Aufgabe gegenüber, nennt messbare Aufwands- und Genauigkeitskriterien und erläutert einen Unterschied.',
    oEn: 'The learner compares two methods for the same mathematical task, names measurable effort and accuracy criteria, and explains a difference.',
    tDe: 'Bei veränderter Zielgenauigkeit oder größerem Eingabefall überprüft die lernende Person, ob der bisherige Aufwand-Genauigkeits-Vergleich noch gilt.',
    tEn: 'When the target accuracy changes or the input case grows, the learner reassesses whether the earlier effort-accuracy comparison still holds.'
  },
  {
    decision: 'keep',
    rationale: 'Extrempunkte einer Schar bestimmen, den Parameter eliminieren und die Ortskurve herleiten sind eine zusammenhängende Konstruktionsfolge; der Text ist präzise.',
    eDe: 'Extrempunkte einer Funktionenschar hängen vom Parameter ab; die Elimination verbindet ihre Koordinaten zu einer Ortskurve, deren zulässige Punkte zusätzlich durch Parameterbereich und Extremum-Bedingung begrenzt sein können.',
    eEn: 'Extrema of a function family depend on its parameter; eliminating the parameter relates their coordinates in a locus, whose valid points may also be restricted by the parameter domain and extremum condition.',
    oDe: 'Die lernende Person bestimmt die Extrempunktkoordinaten in Abhängigkeit vom Parameter, eliminiert ihn und überprüft, welche Punkte der entstehenden Kurve tatsächlich Extrempunkte der Schar sind.',
    oEn: 'The learner finds extremum coordinates as functions of the parameter, eliminates it, and checks which points on the resulting curve are actually extrema of the family.',
    tDe: 'Bei einer neuen Funktionenschar mit eingeschränktem Parameterbereich leitet die lernende Person die Ortskurve her und grenzt den tatsächlich durchlaufenen Kurvenabschnitt ab.',
    tEn: 'For a new function family with a restricted parameter domain, the learner derives the locus and identifies the portion actually traced.'
  },
  {
    decision: 'keep',
    rationale: 'Der Text nennt die zusammengehörigen Schritte für Wendepunkte einer Funktionenschar klar und grenzt sie gegenüber Extrempunkt-Ortskurven ab.',
    eDe: 'Wendepunktkoordinaten einer Funktionenschar hängen vom Parameter ab; die Elimination ergibt eine mögliche Ortskurvengleichung, doch nur Parameterwerte mit tatsächlichem Krümmungswechsel gehören zur Ortskurve.',
    eEn: 'Inflection-point coordinates of a function family depend on its parameter; elimination yields a possible locus equation, but only parameter values with an actual change in concavity belong to the locus.',
    oDe: 'Die lernende Person prüft den Krümmungswechsel, bestimmt die Wendepunktkoordinaten parameterabhängig, eliminiert den Parameter und kontrolliert die zulässigen Punkte der Ortskurve.',
    oEn: 'The learner checks the change in concavity, finds inflection-point coordinates as functions of the parameter, eliminates the parameter, and checks the valid points of the locus.',
    tDe: 'Bei einer neuen Schar, deren formale Gleichung auch Punkte ohne Krümmungswechsel zulässt, beschränkt die lernende Person die Ortskurve auf echte Wendepunkte.',
    tEn: 'For a new family whose formal equation also permits points without a concavity change, the learner restricts the locus to actual inflection points.'
  },
  {
    decision: 'keep',
    rationale: '„Ohne Sprung und ohne Knick“ beschreibt eine einheitliche Modellierungsaufgabe am Anschluss; die Übersetzung und fachliche Deutung sind angemessen.',
    eDe: 'Ein Anschluss ohne Sprung verlangt gleiche Funktionswerte am Übergang, ein Anschluss ohne Knick zusätzlich gleiche erste Ableitungen; diese Bedingungen bestimmen die Koeffizienten geeigneter Polynome.',
    eEn: 'A join without a jump requires equal function values at the transition, and a join without a kink additionally requires equal first derivatives; these conditions constrain suitable polynomial coefficients.',
    oDe: 'Die lernende Person übersetzt einen Anschluss in Wert- und Steigungsbedingungen, bestimmt passende Koeffizienten einer ganzrationalen Funktion und prüft beide Bedingungen am Übergang.',
    oEn: 'The learner translates a join into value and slope conditions, determines suitable coefficients of a polynomial function, and checks both conditions at the transition.',
    tDe: 'Bei einem neuen Anschluss mit veränderter Übergangsstelle und Steigung stellt die lernende Person die neuen Bedingungen auf und konstruiert ein dazu passendes Polynom.',
    tEn: 'For a new join with a changed transition point and slope, the learner sets up the new conditions and constructs a matching polynomial.'
  }
];

if (reviews.length !== input.length) throw new Error(`Expected ${input.length} reviews, got ${reviews.length}`);
const runId = `${campaign.roundId}.batch-001-run-a`;
const records = input.map((item, index) => {
  const g = item.goal;
  const r = reviews[index];
  const record = {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
    schemaVersion: 1,
    recordId: `${campaign.roundId}.${g.goalId}`,
    runId,
    campaignId: campaign.campaignId,
    roundId: campaign.roundId,
    bundleFingerprint: item.bundleFingerprint,
    bookDigest: item.bookDigest,
    goalId: g.goalId,
    goalFingerprint: g.goalFingerprint,
    pageFingerprint: g.pageFingerprint,
    currentTitleDe: g.currentTitleDe,
    currentTitleEn: g.currentTitleEn,
    currentDescriptionDe: g.currentDescriptionDe,
    currentDescriptionEn: g.currentDescriptionEn,
    decision: r.decision,
    ...(r.decision === 'revise' ? {
      proposedDescriptionDe: r.proposedDescriptionDe,
      proposedDescriptionEn: r.proposedDescriptionEn
    } : {}),
    understandingEvidence: {
      essentialUnderstandingDe: r.eDe,
      essentialUnderstandingEn: r.eEn,
      observablePerformanceDe: r.oDe,
      observablePerformanceEn: r.oEn,
      transferExpectationDe: r.tDe,
      transferExpectationEn: r.tEn
    },
    rationale: r.rationale,
    evidenceProfileContract: 'positive-understanding-evidence-v2',
    evidenceProfileRecommendation: 'create',
    recordStatus: 'candidate',
    reviewAuthority: 'ai_candidate'
  };
  return record;
});

const resultsDir = join(root, 'results');
mkdirSync(resultsDir, { recursive: true });
const recordsBytes = records.map((r) => JSON.stringify(r)).join('\n') + '\n';
writeFileSync(join(resultsDir, `${batch.batchId}.records.jsonl`), recordsBytes);
const sha256 = (value) => `sha256:${createHash('sha256').update(value).digest('hex')}`;
const artifacts = new Map(bundle.artifacts.map(({ role, digest }) => [role, digest]));
const run = {
  $schema: 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
  schemaVersion: 1,
  runId,
  campaignId: campaign.campaignId,
  roundId: campaign.roundId,
  batchId: batch.batchId,
  batchInputFingerprint: batch.batchInputFingerprint,
  bundleFingerprint: campaign.bundleFingerprint,
  bookDigest: campaign.bookDigest,
  provider: 'openai',
  model: 'gpt-6',
  role: 'subject_reviewer',
  promptFamilyId: 'goal-description-understanding-evidence-review-v2',
  promptFingerprint: campaign.promptFingerprint,
  criteriaFingerprint: campaign.criteriaFingerprint,
  generationParametersFingerprint: sha256(JSON.stringify({ mode: 'independent-manual-review', boundRound: campaign.roundId })),
  independenceGroupId: campaign.independenceGroupId,
  blindToOtherRuns: true,
  goalIds: batch.goalIds,
  inputArtifacts: [
    { role: 'review_input_json', digest: artifacts.get('review_input_json') },
    { role: 'review_prompt', digest: artifacts.get('review_prompt') },
    { role: 'review_criteria', digest: artifacts.get('review_criteria') },
    { role: 'description_review_batch_input_jsonl', digest: batch.batchInputFingerprint }
  ],
  startedAt,
  completedAt: new Date().toISOString(),
  status: 'completed',
  outputDigest: sha256(recordsBytes),
  toolchainVersion: 'codex-manual-review-v1'
};
writeFileSync(join(resultsDir, `${batch.batchId}.run.json`), `${JSON.stringify(run, null, 2)}\n`);
console.log(JSON.stringify({ runId, records: records.length, decisions: records.reduce((a, r) => (a[r.decision] = (a[r.decision] || 0) + 1, a), {}) }));
