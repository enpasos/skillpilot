import collections
import datetime
import hashlib
import json
from pathlib import Path

BASE = Path('tmp/cross-subject-requires/tum-bsc-physics-audit-20261013-v1')
read = lambda p: json.loads(Path(p).read_text())
sha = lambda p: 'sha256:' + hashlib.sha256(Path(p).read_bytes()).hexdigest()
fp = lambda obj: 'sha256:' + hashlib.sha256(json.dumps(obj, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
role = read(BASE / 'role-ownership.author.json')
recipes = read(BASE / 'requires-recipes.author.json')
bridge = read(BASE / 'source-code-bridge.followup.author.json')
now = datetime.datetime.now(datetime.timezone.utc).isoformat()
identity = {'agentCanonicalName': '/root/requires_canonical_review', 'model': 'GPT-6.1 Sol', 'reasoningEffort': 'Ultra', 'role': 'independent_scientific_reviewer', 'authorIsDifferentAgent': '/root/noncanonical_subject_scope', 'authority': 'ai_candidate', 'humanApproval': False}

# These are the reviewer's individual scientific findings after reading actual
# original DE/EN definitions, local full extracts and recipes. They are not an
# import of the author's verdicts or a content-classification regex.
MODULE = {
 'CH1104': 'Periodensystem, Bindung, Säure/Base, chemisches Gleichgewicht und Kinetik bilden einen Chemie-Outcome. Thermodynamische Begriffe machen das ganze Bündel nicht zu Physik; numerische Gleichgewichts-/Kinetikziele müssen separat operationalisiert werden.',
 'CIT513016': 'Lineare Strukturen, Isomorphismen, Matrizen, Eigenwerte und Skalarprodukträume sind Mathematik. Die abstrakte Outcome-Anwendung benötigt kein vorab beherrschtes physikalisches Modell. Allgemeine Geometrie, Einheitenrechnung und Tensorrechnung sind durch diesen Quellentext nicht als ganze eigene Kompetenzen belegt.',
 'CIT513017': 'Der vollständige Stoffplan nennt Folgen/Reihen, einvariable Analysis, Integration, Taylor-/Fourierreihen und einfache ODE; das aktuelle Blatt beschreibt nur Approximation und einfache Anwendungen. Diese Kompetenz bleibt mathematisch, nicht durch parallel besuchte Mechanik fachlich abhängig.',
 'CIT513018': 'Mehrdimensionale Analysis, implizite Funktionen, Extremwerte, Kurvenintegrale/Vektoranalysis und ODE sind ausdrücklich Inhalt. Konkrete und abstrakte Anwendungen sind zugelassen; kinematische Interpretation kann ein neues Anwendungsziel sein, kein allgemeiner Physik-Eingangstest.',
 'CIT513019': 'Integration im R^n, Integralsätze, Fouriertransformation, Funktionentheorie, Hilberträume und einfache PDE sind Mathematik zur Vorbereitung theoretischer Physik. Vorbereitung ist keine umgekehrte Voraussetzung. Funktionentheorie bleibt im Katalog der 46 Fähigkeiten noch unvollständig erfasst.',
 'PH0001': 'Der tatsächliche erste Outcome betrifft Messmethodik. Die vollständige Quelle enthält sieben experimentelle und drei zusätzliche mathematische Outcome-Zeilen; mehrvariable Ableitungen, ein-/mehrdimensionale Integrale und einfache ODE sind hier ausdrücklich Lernziele. Keine vollständige spätere Analysis darf den integrierten Einstieg blockieren.',
 'PH0002': 'Das aktuelle Blatt enthält nur Elektro-/Magnetostatik und Strom-Grundlagen; zeitveränderliche Felder, Schwingungen/Wellen, Elektrochemie und Relativität fehlen. Historische MA920-Voraussetzungen und der Lehramtsweg sind verschiedene Quellkontexte, keine bewiesene CIT-Identität.',
 'PH0003': 'Der erhaltene breite Optik-/Quanten-Outcome verbindet Strahlenoptik, Interferenz/Beugung und Quantenphänomene. Fouriertransformation wird im Modulstoff selbst eingeführt. Ein separat voraussetzender Fourieroptik-Anwendungsatom ist möglich, keine Rückprojektion dieser Methode auf jedes Optikziel.',
 'PH0004': 'Das aktuelle breite Blatt ist Atom-/Molekülphysik; der vollständige eigenständige Thermodynamik-Outcome fehlt. Beschreibungen von Übergängen und quantitative Eigenfunktionslösungen brauchen verschiedene Vorleistungen. Die zwei Stoffanteile sind Scope-Beschreibung, kein eigenes Mastery-Ziel.',
 'PH0005': 'Der aktuelle Outcome ist nur eine leere Einleitung. Vollständige Quelle nennt dynamische Formulierung, Auswahl Lagrange I/II, energetische Interpretation und relativistische Grenzen. Erst Wiederherstellung/Split liefert assessable Ziele; Methodenvoraussetzungen dürfen nicht an den leeren Satz angehängt werden.',
 'PH0006': 'Der sechsteilige Outcome enthält sowohl physikalische Feld-/Wellen-/Bezugssystemaufgaben als auch ausdrücklich mathematische Tensor- und Kugelflächenmethoden. Primäres Modulfach Physik ist vertretbar, einzelne mathematische Kinder brauchen eigene Semantik. Neu zu lernende Tensor-/Kugelflächenmethoden dürfen sich nicht voraussetzen.',
 'PH0007': 'Das aktuelle Blatt enthält die ersten fünf Quanten-Outcomes. Quelle enthält zusätzlich Zwei-Niveau-Systeme, Näherungsverfahren und Dichtematrix/Verschränkung. Endliche Zustandsräume und kontinuierliche Potentialprobleme brauchen unterschiedliche Mathematik; kein AND aller Wege.',
 'PH0008': 'Temperatur/Wärme, statistische Mechanik, Quantengase, wechselwirkende Systeme und qualitativer Nichtgleichgewichtsüberblick sind verschiedene Teilziele. Zustandssummen brauchen passende Summen/Normierung; ein eigener mathematischer Wahrscheinlichkeitsprovider ist nicht als geprüftes Atom vorhanden.',
 'PH0009': 'Der erste Outcome verlangt Experimentdurchführung in Mechanik/Thermodynamik. Berichte, mathematische Unsicherheiten, Modellbezug und manuelle/Software-Datenanalyse sind weitere verlorene Outcomes. PH0001 ist empfohlen; der konkrete Versuch entscheidet tatsächliche Vorleistungen.',
 'PH0010': 'Der erste Outcome verlangt Experimentdurchführung in Thermodynamik/Elektrodynamik/Magnetismus. Die weiteren Analyse-/Unsicherheits-/Berichtsoutcomes fehlen. Die empfohlenen PH0001/2/9 sind kein universelles AND aller Kurskompetenzen.',
 'PH0011': 'Der deutsche erste Outcome nennt Optik, Atom- und Kernphysik. Im englischen Content steht abweichend molecular physics, während der englische Outcome nuclear physics nennt; Quellfassung/Langabgleich bleiben offen. Analyse-/Unsicherheitsoutcomes fehlen und Vorläufer sind nur empfohlen.',
 'PH0014': 'Strukturiertes Standardmodellwissen und Verständnis moderner Experimente ist ein physikalisches Bündel. Quantitative Streuung oder komplexe Gruppendarstellungen sind mögliche Quellenkinder, aber nicht durch jedes einfache Anwendungs-/Detektorverständnis universell verlangt.',
 'PH0015': 'Schwache Wechselwirkung, Symmetriebrechung, Kerne/Zerfälle und Kosmologie sind ein breites Physikbündel. Matrix-Mixing steht im Content, nicht als universeller Zahlenauftrag jedes erhaltenen Satzes. PH0014 als Hintergrund erzeugt keine transitive Mathematik-Mastery.',
 'PH0016': 'Der erhaltene erste Outcome verlangt konzeptionelles Beschleuniger-/Detektorverständnis. Weitere vier Intro-Outcomes fehlen. Gleichnamige englische Alternative darf nicht als vollständige Inhaltsidentität gelten: die lokale PH8016-Astrophysikfassung nennt andere Einzelthemen.',
 'PH0017': 'Der erhaltene Outcome ist leer. Quelle besitzt fünf substantive Outcomes einschließlich quantitativer klassischer/quantenmechanischer/thermodynamischer Erklärungen und Transfer. Kristall-, Gitter- und Wärmemodelle müssen einzeln authored werden.',
 'PH0018': 'Das erste Blatt erklärt Struktur-/Bandstruktur-Eigenschaftsbeziehungen. Quelle enthält weitere Materialklassen, Experimente, quantitative Modellierung, Transfer und Bauelemente. Numerische komplexe Antwort/Spinwellen sind eigene spätere Kinder, keine Voraussetzung aller qualitativen Erklärungen.',
 'PH0019': 'Der erhaltene erste Outcome ordnet Bindungsarten Stoffen zu. Alle weiteren Struktur-/Gitter-/Transport-/Magnet-/Dielektrik-Outcomes sind verloren. Keine notwendige Mathematik folgt aus dieser reinen Zuordnung; Expertenmethoden dürfen den Intro-Kern nicht verengen.',
 'PH0020': 'Der erste Quell-Outcome beschreibt Lebensbausteine Zucker/DNA/Proteine und chemische Beziehungen. Dies ist biochemisch/interdisziplinär; allein der Biophysik-Modulkontext beweist keine primäre Physikkompetenz dieses erhaltenen Blatts. Die späteren quantitativ biophysikalischen Outcomes fehlen.',
 'PH0021': 'Energie-/Exergiewirkungsgrade bestimmen ist tatsächlich quantitative Physik; mit gegebenen Strömen reichen Quotienten und passende physikalische Bedeutungen. Stationäre Fließbilanz, Brennstoffzellen, Solarthermie und Solarzellen sind getrennte verlorene Outcomes; eigene Exergiedefinition darf kein identisches Vorziel werden.',
 'PH0022': 'Mikro-/Nanostruktur, Eigenschaften, Phasen und Materialwahl bilden ein breites Materialphysikbündel mit Chemieanteilen. Die Quelle bietet Intro-Festkörper oder kondensierte Materie I als alternative Grundlagen. Graphregionen lesen ist kein Beweis für gesamte Funktions-/Exponential-/Logarithmuskompetenz.',
 'PH0023': 'Der erste Outcome beschreibt Strukturuntersuchungsmethoden. Die acht weiteren quantitativen Transport-/Elektrolyt-/Membran-/Muster- und Bildgebungsoutcomes fehlen. Optik ist nur für einen konkret optischen/Beugungsweg nötig; statische Nernst-Gleichung und dynamische Pulse sind unterschiedliche Routen.',
 'PH0024': 'Das erhaltene Fermi-Regel-Ziel fordert echte Herleitung und Anwendung. Komplexe Amplituden, Matrixelemente und zeitabhängige Integration stützen die Herleitung; eine Rechnung mit fertig gegebenen Matrixelementen braucht deren Berechnung nicht erneut. Weitere sieben Streu-/Übergangsoutcomes fehlen.',
 'PH0031': 'Das erhaltene Ziel betrifft weitgehend selbständige Versuchsvorbereitung. Die fünf weiteren Durchführungs-/Protokoll-/Auswertungs-/Recherche-/Vortragsoutcomes fehlen. FOPRA wählt sechs Versuche aus einem dezentralen Katalog; nicht die Vereinigung aller mathematischen Methoden ist universell nötig.',
 'PH8016': 'Das erhaltene englische Beschleuniger-/Detektor-Outcome ist Physik. Der aktuelle Studienplan bietet PH8016 alternativ zu PH0016. Die lokalen ganzen Astro-Outcomes sind dennoch verschieden; Sprach-/Katalogalternative beweist keine byte- oder masterygleiche Vollkompetenz.',
 'PH8019': 'Das erhaltene Bindungszuordnungsziel ist wie PH0019 konzeptionell, mit chemischen Überschneidungen. Der lokale gesamte Stoffplan ergänzt unkonventionelle Supraleiter und Soft-Matter-Themen; alternative Sprache rechtfertigt keine automatische Gleichsetzung aller Outcomes oder IDs.'
}

# Explicit per-recipe disposition: A = acceptable bounded didactic proposal,
# R = needs revised target/prerequisite scope. Neither creates an approved edge.
R = {}
def add(key, verdict, reason):
    assert key not in R
    R[key] = {'disposition': 'accepted_bounded_authoring_recipe' if verdict == 'A' else 'needs_revision', 'scientificRationale': reason}
add('d.chem.equilibrium','R','Das Teilziel nennt allgemeines quantitatives Gleichgewicht, nicht pH. Logarithmen/Inverse/Graphen des ganzen m.functions sind nicht notwendig für jede Quotienten-/Konzentrationsrechnung; Gleichgewichts- und pH-Rezepte trennen.')
add('d.chem.kinetics','R','Eine vorgegebene einfache Kinetik kann linear sein; das ganze m.functions-Bündel ist zu breit. Exakten Raten-/Zeitfunktionsweg und nötige arithmetische Operationen festlegen.')
add('d.la.linear','A','Algebraische Gleichungsoperationen tragen die ausdrücklich geplante Matrix-/LGS-Anwendung; kein physikalischer Modellbegriff ist nötig. m.algebra muss in passende kleinere Vorziele zerlegt werden.')
add('d.la.orthogonal','R','m.vectors enthält bereits Skalarprodukt, während das Ziel Skalarprodukt neu nutzen soll; Basiswechsel/Projektion sind getrennte Leistungen. Vorleistungsanteile und neu gelehrte Definition/Operation trennen, keine zirkuläre Überlappung.')
add('d.a1.derivative','A','Funktionsverständnis ist für Differentiation/Approximation nötig. Das ganze Exponential-/Log-/Inverse-Bündel ist noch kein akzeptierter Atom; Eingangsfunktionskompetenz enger definieren.')
add('d.a1.taylor','A','Ableitungen bilden Taylor-Koeffizienten und die lokale Approximation wird hier gelernt. Rest-/Gültigkeitskriterium muss im neuen Target erhalten bleiben; kein Physikgate.')
add('d.a2.partial','R','Einvariable Differentiation trägt den Koordinatenschnitt, aber vollständiges LGS-Lösen/lineare Abbildungen ist nicht für jede partielle Ableitung nötig. Jacobische lineare Approximation und skalare Koordinatenableitung in verschiedene Zielansprüche aufteilen.')
add('d.a2.ode','A','Für ausdrücklich als System dargestellte ODE sind passende skalare ODE-Grundlagen und lineare Systemdarstellung eine plausible Vorleistung; keine Physik-Mastery als Voraussetzung. Eigenmethoden müssen erst beim konkreten Verfahren geprüft werden.')
add('d.a2.kinematic-interpretation','A','Kinematische Bedeutungen sind nur erforderlich, wenn das neue Anwendungsziel diese unabhängig voraussetzt und physikalisch interpretiert. Der ursprüngliche abstrakte Analysis-Outcome erhält keinen Physikgate.')
add('d.a3.multipleintegral','A','Eigenständiger Koordinatenwechsel/Jacobian und Integration verlangen passende einvariable Integral-, Ableitungs- und lineare Operationsanteile. Das ist ein neuer klarer Methodenweg; keine vollständigen Module erforderlich.')
add('d.a3.hilbert','R','Einfache Hilberträume können reell und endlichdimensional sein; dann weder Integration noch komplexe Zahlen notwendig. Reelle/endliche und komplexe/kontinuierliche Beispiele trennen statt deren Vereinigung als AND.')
add('d.a3.flux-interpretation','A','Der mathematische Integralsatz bleibt physikunabhängig. Nur ein separat ausgewiesener physikalischer Fluss-/Feld-Anwendungsatom braucht die vorausgesetzten Feldgrößen; allgemeines p.em muss passend eingegrenzt werden.')
add('d.exp1.measurement','A','Der aktuelle methodische Erst-Outcome verlangt keine bestimmte Rechnung. Kein vorausgesetzter Analysisalgorithmus, während konkrete Messgrößen/Unsicherheitsbegriffe im Physikdelta erhalten bleiben.')
add('d.exp1.motion','R','Berechnen einer Massepunktbewegung kann mit gegebenem Orts-/Zeitgesetz und Algebra erfolgen; Ableitung ist nicht universell. Differenzialmodell-Auswertung ausdrücklich zum eigenen Teilziel machen; integrierte Mathematik darf erst davor vermittelt werden.')
add('d.exp1.ode','A','Die Quelle erklärt einfache ODE selbst als Lernziel. Algebra kann vorliegen; Kinematik nur bei unabhängig verlangter physikalischer Interpretation. Kein Selbstgate m.ode und kein universeller Physikgate für abstraktes Lösen.')
add('d.exp2.static-quantities','A','Für ausdrücklich quantitative elementare Größen-/Gesetzanwendung sind Formel-/Quotientenoperationen plausibel. Der deskriptive aktuelle Outcome darf diesen neuen Rechenanspruch nicht automatisch erben.')
add('d.exp2.distributed-field','A','Eigenständige vektorielle Integration einer tatsächlich kontinuierlichen Ladungsverteilung ist eine konkrete Route mit passenden Vektor-/Integralanteilen. Symmetrie-/fertige Formelvarianten brauchen getrennte Targets.')
add('d.exp2.oscillation','R','Das Ziel sagt nur quantitativ auswerten; m.ode setzt dagegen eigenständiges Differentialgleichungslösen voraus. Sinusgesetz auswerten und ODE herleiten/lösen trennen. Mechanische Schwingung ist hilfreiche Analogie, nicht bewiesen universeller Physikgate.')
add('d.exp3.rays','A','Geometrische und quantitative Abbildung kann Strahlenverhältnisse plus passende Linsengleichung verlangen. Ein enger Geometrieatom ist nötig, nicht alle Winkel-/Trigonometrie-/Strahlensatzkompetenzen gemeinsam.')
add('d.exp3.interference','A','Das Rezept nennt die komplexe Route selbst ausdrücklich methodenabhängig und verweigert ein universelles AND mit der trigonometrischen Route. Vor Aktivierung einen einzigen vollständigen Rechenanspruch oder getrennte Kinder authoren.')
add('d.exp3.fourier-optics','A','Ausdrücklich Fourieroptische Rechnung benötigt Transformation und passende Integraloperationen. Der Provider PH0003 lehrt die Methode selbst; der Methodenatom muss zuvor eigenständig authored sein, kein Rückgate desselben Outcomes.')
add('d.exp4.states','R','Ein einfaches Atom-/Molekülmodell legt nicht fest, ob stationärer reeller 1D-, separierter radialer oder allgemein mehrdimensionaler Weg gemeint ist. m.complex+ODE+Integral als universelles Bündel ist nicht belegt; Zustandsinterpretation darf kein nahezu identisches Vorziel sein.')
add('d.exp4.selection','R','Eine vorgegebene Auswahlregel aus gegebener Paritätsinformation kann durch Vorzeichen/Zuordnung angewendet werden. Das ganze Größen-/Bruch-/Einheiten-/Gleichungsalgebra-Bündel ist dafür keine notwendige Vorleistung.')
add('d.exp4.thermo','R','Der Zieltext fordert Beschreibung; die Begründung führt quantitative Bilanzen ein. Ein echtes Rechenkind authoren oder den zusätzlichen harten Algebra-Anspruch entfernen, ohne qualitative Hauptsatz-/Prozesskompetenz zu schwächen.')
add('d.theory1.newton','R','Nicht jedes Newton-Anfangsdatenproblem verlangt Vektoren und eigene ODE-Lösung. Den tatsächlich vektoriellen Differenzialmodellweg explizit festlegen; p.newton in bekannte Gesetzbedeutung statt das eigene Formulieren/Lösen zerlegen.')
add('d.theory1.lagrange','A','Für das Aufstellen von Lagrangegleichungen sind lokale partielle/Zeit-Ableitungsoperationen und kinetische/potentielle Energie plausibel. Der Lagrangeformalismus selbst wird hier gelernt; kein komplettes Analysis-2-Gate.')
add('d.theory1.normalmodes','A','Explizite Normalkoordinaten eines linearen dynamischen Systems verlangen passenden Eigen-/Matrix-/ODE-Systemweg. Die capability bundles müssen weiter in notwendigen Matrizenkalkül und Modeninterpretation aufgeteilt werden.')
add('d.theory2.maxwell','R','Feldberechnung mit Maxwell legt weder Integralsatz- noch Mehrfachintegrationsmethode universell fest. Differential-, Symmetrie-/Integral- und Randwertrouten sind Alternativen; deren ganze Vereinigung als AND ist hier unbegründet.')
add('d.theory2.boundary','A','Ein festgelegtes Randwertverfahren darf passende PDE-Vorleistung und physikalische Randbedeutung benötigen. Die noch nicht benannte Methode ist eine Scope-/Atom-Lücke, keine Freigabe aller PDE-Verfahren.')
add('d.theory2.waves','A','Eigenständiges Lösen einer Wellengleichung verlangt passende Ableitungs- und ausgewählte PDE-Operationen. Der konkrete Wave-Methodenatom bleibt zu authoren; PDE-Mastery erzeugt keine automatische Ableitungs-Mastery.')
add('d.theory2.green','R','Bei gegebenem Green-Kern reicht passende Integral-/Quellenoperation; allgemeines PDE-Lösen ist nicht zwingend. Den Kernel bestimmen und einen gegebenen Kernel physikalisch anwenden getrennt prüfen; Green-Methode ist neues Target.')
add('d.theory2.frame','A','Komponenten zwischen vorgegebenen gleichförmig bewegten Frames transformieren nutzt lineare Operationsanteile und Feldbedeutung. Tensorformalismus ist ausdrücklich ein neu gelehrter Outcome, kein identisches Vorziel.')
add('d.theory2.spherical','R','Kugelflächenfunktionen erlernen/anwenden sagt nicht, ob eigene ODE-Herleitung oder nur gegebenes Funktionensystem gemeint ist. Orthogonalität kann Integral-/Flächenelementanteile brauchen. Den neuen Methodenanspruch konkretisieren und eigene Targetanteile von Vorwissen trennen.')
add('d.qm1.bra-ket','A','Passend normierte komplexe endliche Zustände brauchen komplexe Koeffizienten und ein Skalarprodukt, nicht zwingend kontinuierliche Integration. Die dokumentierte Zustandsraumalternative ist fachlich richtig; m.innerproduct ist noch zu breit.')
add('d.qm1.1d','R','Stationäre gebundene 1D-Probleme können mit reellen Funktionen bearbeitet werden. ODE/Matching/Normierungsanteile sind plausibel, komplexes Rechnen aber nicht durch jedes einfache Potentialproblem universell verlangt. Den tatsächlichen Zustands-/Zeitanspruch benennen.')
add('d.qm1.hydrogen','R','Ein bereits separierter Ansatz kann radialer ODE plus gegebenen Winkelfunktionen genügen. Allgemeine PDE-Lösung darf nicht zusätzlich jede separierte Anwendung sperren; Ansatz selbst herleiten und im gegebenen Ansatz lösen trennen.')
add('d.qm1.two-level','A','Ein ausdrücklich komplexes Matrix-Eigenproblem trägt lineare, Eigenwert- und komplexe Operationsanteile. Der verlorene sechste Quell-Outcome muss neu authored werden; ein nur reelles Beispiel würde eine engere Variante erlauben.')
add('d.stat.thermopotential','A','Für konkret vorgegebene Zustandsvariablenableitungen sind partielle Operationsanteile und thermodynamische Größenbedeutung plausibel. m.functions nicht als gesamte Graph-/Exponential-/Logkompetenz übernehmen; Targetfunktion entscheidet.')
add('d.stat.partition','A','Eine echte Zustandssumme und daraus abgeleitete Größen benötigen Summen/Normierung, Exponentialwerte und passende Ableitungen. Der unabhängige Wahrscheinlichkeitsatom fehlt; PH0008-Provider muss von seinem neu gelehrten Ensemble-Target getrennt werden.')
add('d.stat.quantumgas','A','Das explizit gegebene Zustandsdichte-/Besetzungsmodell trägt Integral- und Funktionswerte. Nur benötigte Quantenzustands-/Ensemblebegriffe voraussetzen, nicht deren gesamte Katalogkompetenz oder alle möglichen Gase.')
add('d.stat.nonequilibrium-overview','A','Ein erklärter qualitativer Einblick verlangt keine eigenständige Boltzmann-/Diffusions-PDE-Lösung. Eigenständige Erklärung/Transfer muss im neuen P erhalten bleiben; Numerik ist ein anderes Kind.')
for lab in ['1','2','3']:
    add('d.lab'+lab+'.prepare','A','Für eine ausdrücklich quantitative Versuchsvorbereitung ist passende Formel-/Einheitenarbeit plausibel. Das konkrete Modell muss vorliegen; dieser Gate gilt nicht automatisch für den allgemeinen Durchführungserst-Outcome.')
    add('d.lab'+lab+'.evaluate','R','Eine konkrete Messgrößenrechnung verlangt nicht alle Graph-/Exponential-/Log-/Inverse-Anteile von m.functions. Nötige arithmetische und ausgewählte Funktionsoperationen am realen Versuch festlegen; Unsicherheitsmethoden werden hier erst gelehrt.')
    add('d.lab'+lab+'.apparatus','A','Sachgerechte Durchführung ohne spezifizierte Zahlenauswertung beweist keinen gemeinsamen Mathematikalgorithmus. Versuchssicherheit und physikalische Handhabung bleiben eigenständig; spätere Auswertung erhält eigene Vorleistungen.')
add('d.kta1.detectors','A','Für einen tatsächlich feldbasierten Beschleuniger braucht es die jeweiligen Kraft-/Feldbegriffe. p.em als gesamtes Ladungs-/Strom-/Feldbündel ist noch zu breit und für jeden möglichen Detektor nicht universell.')
add('d.kta1.scattering','R','Eine gegebene einfache Wirkungsquerschnittsaufgabe kann direkt Rate/Fluss verwenden; Winkelintegration und Quantenzustände sind nicht universell. Differential-zu-totaler Querschnitt und quantenmechanische Amplitudenroute explizit authoren.')
add('d.kta1.symmetry','R','Eine einfache Symmetrie-Einordnung kann reelle Permutationen oder diskrete Paritätsinformation verwenden. Komplexe lineare Darstellungen müssen ausdrücklich die gewählte quantitative Route sein, nicht universelles AND für jede eingeführte Symmetrie.')
add('d.kta2.mixing','A','Ein tatsächlich komplexes Amplituden-/Matrix-Mixing benötigt passende Matrixoperationen und Zustandsbedeutung. Die neue quantitative Quelle-Operationalisierung ist noch zu belegen; p.particles darf nicht das gesamte Standardmodell vorab fordern.')
add('d.kta2.decay','A','Bei vorgegebenem Zerfallsgesetz sind passende Exponential-/Log-/Formeloperationen plausibel. Die Ratengleichung selbst lösen wäre eine weitere ODE-Kompetenz, die dieses Rezept richtig getrennt hält.')
add('d.kta2.cosmology','A','Konzeptionelle Stern-/Kosmologieprinzipien implizieren keine Friedmann-/relativistische PDE-Lösung. Modellbedeutung und Begründung müssen eigenständig bleiben; kein automatisch leeres Physik-Vorwissen.')
for prefix in ['d.ktaintro','d.ktaintroen']:
    add(prefix+'.operation','A','Konzeptionelles Geräteverständnis benötigt nur die konkret benutzten physikalischen Prinzipien. Zahlen-/Fourier-/ODE-Kompetenz wird vom tatsächlichen erhaltenen Intro-Outcome nicht universell verlangt.')
    add(prefix+'.numeric-optional','A','Eine explizit neue quantitative Bahnaufgabe ist klar als zusätzliche zukünftige Anwendung begrenzt. Der konkrete vektorielle Modellweg muss zum späteren Atom passen; keine Ausweitung des bestehenden konzeptionellen Blatts.')
add('d.km1.reciprocal','A','Für selbst bestimmte reziproke Basis plus quantitativ geometrische Beugungsbedingung sind passende Vektor-/Matrix-/Winkelanteile plausibel. Keine komplette lineare Algebra oder alle Geometriealgorithmen; der derzeitige leere Outcome muss ersetzt/aufgeteilt werden.')
add('d.km1.lattice','A','Normale Gitterschwingungen im ausdrücklich linearen dynamischen Modell tragen Eigen- und ODE-Systemanteile. Bindungszuordnung ist ein anderes vorheriges oder paralleles Konzept, kein schwerer Methoden-Gate.')
add('d.km1.thermal','A','Bei einem ausdrücklich kontinuierlichen Phononenzustandsdichtemodell sind Integration und thermische Funktionswerte sachlich passend. Diskrete Einstein-Modelle brauchen eine eigene engere Route; allgemeines p.ensembles bleibt zu zerlegen.')
add('d.km2.structure','A','Eine qualitative Band-/Strukturzuordnung benutzt eingeführte Festkörperbegriffe. Keine allgemeine PDE- oder Fourierrechnung folgt daraus; p.solid muss die konkreten vorherigen Begriffe identifizieren.')
add('d.km2.response','R','Eine Antwortfunktion kann reell/statisch vorliegen. Komplexe Rechenoperationen sind nur bei explizit komplexer dynamischer Antwort erforderlich. Den methodischen Scope vor dem harten Gate präzisieren.')
add('d.km2.spinwaves','A','Die ausdrücklich linearisierte dynamische Modenroute trägt Eigen-/ODE-Systemoperationen und konkrete Spinbedeutung. Das neue Kind ist nicht eine nachträgliche Pflicht jeder ersten Struktur-/Eigenschaftserklärung.')
for prefix in ['d.kmintro','d.kmintroen']:
    add(prefix+'.bonding','A','Stoffe gegebenen Bindungsarten zuordnen benötigt keine eigenständige mathematische Rechnung. Der tatsächliche Intro-Kern ist erhalten, unabhängig von späteren Expertenmodellen.')
    add(prefix+'.phonon-numeric','A','Numerische Eigen-/ODE-Gitterdynamik ist ausdrücklich nur ein zukünftiger Modellatom, nicht die existierende Bindungszuordnung. Methode und Lehranspruch müssen vor neuem Gate authored werden.')
add('d.bio.parts','R','Kein mathematischer Gate ist für Lebensbausteine/chemische Beziehungen nötig; diese negative Entscheidung ist richtig. Das Rezept ist aber als math-to-physics einsortiert, obwohl der erste Outcome fachlich biochemisch/interdisziplinär ist; Fachzuordnung korrigieren.')
add('d.bio.enzymes','A','Eine ausdrücklich quantitative Michaelis-Menten-artige Analyse trägt rationale Funktions-/Konzentrationsoperationen. Allgemeine zeitabhängige ODE dürfen nicht unbemerkt dazu kommen; Gesamtfach kann biophysikalisch/interdisziplinär bleiben.')
add('d.bio.patterns','R','Ein gegebenes Reaktions-Diffusionsmodell zu behandeln legt weder lineare Stabilitäts-ODE-Systeme noch eigenständige PDE-Lösung universell fest. Mechanismus-/PDE-Lösen und Moden-Stabilitätsanalyse als getrennte neue quantitative Kinder authoren.')
add('d.bio.simulation','A','Die Quelle verlangt Beschreibung von Methoden, Möglichkeiten und Grenzen; keine Implementierung oder Zufallsstichprobenroutine folgt universell. Erklärung und Limitdiagnose dürfen trotzdem nicht auf bloße Wiederholung schrumpfen.')
add('d.energy.efficiency','A','Mit gegebenen Strömen ist passende Quotientenrechnung plus unabhängige Nutzen-/Eingangsbilanz nötig. Ein Voratom muss nur Exergiebedeutung enthalten; p.exergy darf nicht die eigene Effizienz-/Bilanzkompetenz erneut verlangen.')
add('d.energy.cycle','A','Der neue Target fordert kontinuierliche Arbeit/Wärme ausdrücklich integrieren. Passende Integraloperationen und Zustands-/Prozessbedeutung sind nötig, während sie bei gelieferten numerischen Strömen optional bleiben.')
add('d.energy.steady','A','Auswertung einer konkret vorgegebenen stationären Fließbilanz verlangt die benutzten algebraischen Operationen und thermodynamischen Termbedeutungen. Der verlorene Quellenoutcome ist eigenständig wiederherzustellen.')
add('d.materials.diagram','R','Ein Phasendiagramm besteht auch aus mehrdimensionalen Regionen; Koordinaten/Regionen lesen ist nicht das ganze m.functions mit Exponential-/Logarithmus-/Inversen. Nötige Darstellungskompetenz benennen statt falscher Funktionsbarriere.')
add('d.materials.selection','R','Vergleichen gelieferter Tabellenwerte/Belastungsgrenzen verlangt nicht universell Formel- oder Bruchgleichungsumformung. Quantitative eigene Belastungsrechnung von begründeter Auswahl auf gelieferten Daten trennen.')
add('d.materials.micro','A','Qualitativer Mikrostruktur-/Eigenschaftstransfer benötigt konkrete Materialbegriffe, keine gesamte Tensor-/Elastikwellenrechnung. Die zwei Quellen-Einstiegsrouten bleiben echte Alternativen.')
add('d.biointro.structure','A','p.optics ist ausdrücklich nur für eine konkret gewählte optische/Beugungsmethode vorgesehen. Andere Strukturbestimmungswege haben andere Prinzipien; keine universelle Optik-/PDE-Barriere für den erhaltenen Methodenbeschreibungssatz.')
add('d.biointro.diffusion','A','Eine konkret selbst zu lösende einfache Diffusionsgleichung hat passende Raum-/Zeit-PDE-Anteile. Gelieferte Lösung nur auszuwerten ist ein engerer Target; molekulare Motoren bleiben ein anderer Modellweg.')
add('d.biointro.membrane','A','Statische Nernstrelation und dynamischer Nervenpuls sind korrekt als Methodenalternativen markiert. Der jetzige hardPrerequisite-Platzhalter darf erst nach Split/Methode aktiv werden; niemals Log- und ODE-Routenunion als universelles AND.')
add('d.qmadv.golden','A','Die tatsächliche Herleitung braucht zeitabhängige komplexe Amplituden, passende Integrale und Matrixelement-/Zustandsoperationen. Störungsansatz/Regel sind das neu gelehrte Target, kein nachträglich vorausgesetzter vollständiger QM-Kurs.')
add('d.qmadv.transition','R','Matrixelemente und Zustandsdichte sind gegeben; eigenständige Skalarprodukt-/Projektions-/Basisberechnung ist dann nicht erforderlich. Algebra, gegebenenfalls Betragsquadrat, Normierung/Rate-vs-Wahrscheinlichkeit und physikalische Interpretation getrennt prüfen.')
add('d.qmadv.scattering','R','Born-/Fourier- und Partialwellenwege sind korrekt als Alternativen notiert, aber das gemeinsame Rezept verlangt weiterhin pauschal m.innerproduct und Integral. Methodenanspruch und tatsächlich notwendige Operationen pro Weg neu binden; keine automatisch gemeinsame Projektions-/Orthonormalbasisroutine.')
add('d.fsq.preparation','A','Auswahl eines bestimmten fortgeschrittenen Versuchs bestimmt nötige Inhalte; die allgemeine Vorbereitungsfähigkeit hat kein gemeinsames höheres Matheverfahren. Literatur-/Modellverständnis muss unabhängig überprüfbar bleiben.')
add('d.fsq.analysis','A','Quantitative Modell-/Datenanalyse kann passende arithmetische/Funktions-/Unsicherheitsanteile voraussetzen, wenn diese tatsächlich in früheren Laboratomen gelernt wurden. Kein ganzes Labor oder alle Funktionen; konkreter Versuch und Auswerteanspruch müssen authored sein.')
add('d.fsq.presentation','A','Wissenschaftliche Darstellung eines ausgewählten Ergebnisses hat keine universelle Fourier-/PDE-/Eigenwertvorleistung. Physikalische Ergebnis-/Literaturkenntnis gehört zum ausgewählten Thema, nicht zu allen möglichen FOPRA-Versuchen.')

# Technical corroboration is intentionally separate from scientific decisions.
documents = {b['path']: read(b['path']) for b in role['landscapeBindings']}
actual_groups = collections.defaultdict(list)
for path, doc in documents.items():
    for g in doc['goals']:
        actual_groups[g['id']].append((path, doc['landscapeId'] if 'landscapeId' in doc else doc['id'], g))
assert set(actual_groups) == {g['goalId'] for g in role['goals']}
bindings = []
for b in role['inputBindings']:
    bindings.append({'path': b['path'], 'expectedSha256': b['sha256'], 'actualSha256': sha(b['path']), 'matches': sha(b['path']) == b['sha256']})
for b in role['landscapeBindings']:
    bindings.append({'path': b['path'], 'expectedSha256': b['fileSha256'], 'actualSha256': sha(b['path']), 'matches': sha(b['path']) == b['fileSha256']})
for b in role['sourceEvidence'].values():
    bindings.append({'path': b['localExtractPath'], 'expectedSha256': b['localExtractSha256'], 'actualSha256': sha(b['localExtractPath']), 'matches': sha(b['localExtractPath']) == b['localExtractSha256']})

occurrence_checks = []
for row in role['goals']:
    actual = {p: g for p, lid, g in actual_groups[row['goalId']]}
    assert set(actual) == {o['path'] for o in row['occurrences']}
    for o in row['occurrences']:
        doc = documents[o['path']]
        local = {g['id']: g for g in doc['goals']}
        parents = collections.defaultdict(set)
        for g in local.values():
            for child in g.get('contains', []): parents[child.split(':')[-1]].add(g['id'])
        memo, visiting = {}, set()
        def effective_origins(node):
            assert node not in visiting, 'Unexpected contains cycle'
            if node in memo: return memo[node]
            visiting.add(node)
            result = []
            for ref in local[node].get('requires', []):
                key = ref if ':' in ref else o['landscapeId'] + ':' + ref
                result.append({'prerequisiteKey': key, 'declaredByKey': o['landscapeId'] + ':' + node, 'reference': ref, 'inherited': False})
            for parent in sorted(parents[node]):
                result.extend({**origin, 'inherited': True} for origin in effective_origins(parent))
            # Current compatibility semantics filters the same stable goal ID at
            # every inheritance step. Raw direct declarations remain preserved
            # and this does not excuse an actual direct self-requires cycle.
            result = [origin for origin in result if origin['prerequisiteKey'].split(':')[-1] != node]
            memo[node] = list({json.dumps(origin, sort_keys=True): origin for origin in result}.values())
            visiting.remove(node)
            return memo[node]
        origins = effective_origins(row['goalId'])
        actual_origins = {json.dumps(x, sort_keys=True) for x in origins}
        bound_origins = {json.dumps(x, sort_keys=True) for x in o['resolvedPrerequisiteOrigins']}
        effective = {x['prerequisiteKey'] for x in origins}
        occurrence_checks.append({'goalId': row['goalId'], 'path': o['path'], 'actualDefinitionSha256': fp(actual[o['path']]), 'definitionMatches': actual[o['path']] == o['originalDefinition'] and fp(actual[o['path']]) == o['definitionSha256'], 'effectiveRequiresRecomputed': sorted(effective), 'effectiveMatches': effective == set(o['resolvedEffectiveRequires']), 'originsMatch': actual_origins == bound_origins, 'requiresTransitiveClosureUsed': False})

goal_decisions = []
for row in role['goals']:
    proposed = row['roleAndOwnershipAuthorProposal']
    owner = proposed['ownerPath']
    g = next(g for g in documents[owner]['goals'] if g['id'] == row['goalId'])
    code = proposed['moduleCode']
    classification = proposed['semanticRole']
    gaps = ['No source version/retrieval date or approved individual binding; classification does not approve curriculum scope, native QA or mastery.'] if code else ['Degree placement/choice/terminal coverage needs an explicit program scope; classification alone does not approve completion.']
    if classification == 'orientation':
        reason = 'Der tatsächlich gelesene Big-Picture-Satz motiviert Fachrelevanz und Curriculumsweg. Dies ist als Orientierung zu klassifizieren; erläutern dürfen, aber keine fachliche Begriffs-/Rechen-/Korrektheitsprüfung und keine numerische Kompetenz-Mastery daraus ableiten.'
        gaps += ['The generic TUM-Module label needs a real subject-specific motivation before native learner-facing QA; the present can-explain wording is not proof of compliant ungraded orientation behavior.']
    elif classification in ['programStructure', 'programDegreeContainer']:
        reason = 'Die tatsächliche Definition ordnet ' + g['title'] + ' als Studienphase/Semester/Abschluss oder Wahlbereich ein; sie spezifiziert keine atomare fachliche Handlung. contains bleibt eine Programmbündelung und darf angebotene Alternativen nicht in gleichzeitige Pflichtkompetenzen umdeuten.'
    elif classification == 'programModuleContainer':
        reason = 'Die tatsächliche Definition bündelt das Modul ' + str(code) + ' und seine unterschiedlichen Outcome-/Stofffragmente. ECTS/Moduleinteilung sind keine atomare Kompetenz; authoring ownership in der eigenen Moduldatei ist sachlich plausibel, ohne Live-Collision-Regel oder Vollmodul-Mastery zu behaupten.'
        gaps += ['Shared module and degree copies have different orientation requires/contains; exact single-definition reconciliation must keep placement context separate.']
    elif classification == 'assessableOutcomeCandidate':
        reason = MODULE[code]
        gaps += ['The actual outcome needs observable criteria and, where broad, separate assessed children; no curricularAtomic authority or new hard requires is approved here.']
    else:
        reason = 'Der tatsächlich erhaltene Text „' + g['description'][:130] + '“ beschreibt eine Stoffzeile, Lehre, Aktivität, Gewichtung oder einen abgebrochenen Abschnitt. Er enthält keinen ausreichend bestimmten eigenen Lernerfolg; die vorgeschlagene Rolle ' + classification + ' ist als Fragment-/Kontextklassifikation vertretbar.'
        gaps += ['Recover source meaning before creating new assessed goals; retaining this non-assessable fragment is not source-outcome restoration.']
    if code: reason += ' ' + MODULE[code]
    if code and g.get('descriptionEn') == g.get('description'):
        gaps += ['DE/EN fields repeat the same retained source text; complete bilingual learner-facing authoring/native QA has not been established.']
    status = 'approved_classification_only'
    subject_status = 'accepted_as_proposed_primary_or_contextual_subject_not_atomic_owner_activation'
    if row['goalId'] == '8f8d7eda-3827-56d0-b3db-a15ea373618f':
        status = 'needs_revision'
        subject_status = 'interdisciplinary_biochemistry_scope_unresolved'
        gaps += ['Do not count this current first outcome as an unqualified Physics atom solely because PH0020 is named Biophysics. Its source English first line identifies chemical relations of life building blocks. Retain module authoring owner but revise competencySubject/subjectComponents or explicitly author a physics-model relation.']
    occurrences = [x for x in occurrence_checks if x['goalId'] == row['goalId']]
    conflict_fields = [k for k in set().union(*(set(x[2]) for x in actual_groups[row['goalId']])) if len({json.dumps(x[2].get(k), sort_keys=True, ensure_ascii=False) for x in actual_groups[row['goalId']]}) > 1]
    goal_decisions.append({'goalId': row['goalId'], 'title': g['title'], 'decision': status, 'proposedRoleReviewed': classification, 'competencySubjectDecision': subject_status, 'actualGoalDescriptionSha256': fp({'description': g.get('description'), 'descriptionEn': g.get('descriptionEn')}), 'actualOwnerDefinitionSha256': fp(g), 'authorProposalSha256': fp(proposed), 'ownerRecommendation': 'accepted_inert_authoring_unit_only', 'ownerPath': owner, 'scientificRationale': reason, 'sourceModuleRead': code, 'sourceModuleBinding': {'path': role['sourceEvidence'][code]['localExtractPath'], 'sha256': sha(role['sourceEvidence'][code]['localExtractPath'])} if code else {'path': role['inputBindings'][-1]['path'], 'sha256': sha(role['inputBindings'][-1]['path'])}, 'actualOccurrenceBindings': [{'path': x['path'], 'definitionSha256': x['actualDefinitionSha256'], 'effectiveRequires': x['effectiveRequiresRecomputed']} for x in occurrences], 'conflictFieldsActuallyRecomputed': sorted(conflict_fields), 'conflictResolutionDecision': 'context_separation_supported_shared_definition_activation_pending' if conflict_fields else 'no_different_definition_fields_recomputed', 'openSourceScopeGranularityGaps': gaps, 'activeEdgeApproval': False, 'nativeQualityApproval': False})

recipe_decisions = []
assert len(R) == 89, len(R)
for record in recipes['individualRequiresDecisions']:
    for r in record['individualAtomicAuthoringRecipes']:
        key = r['proposedDependentCapabilityId']
        judgement = R[key]
        prerequisites = r['hardPrerequisiteCapabilityIds']
        physics_only = bool(prerequisites) and all(x.startswith('p.') for x in prerequisites)
        direction_note = 'physics-internal; author math-to-physics category is a recipe bucket, not this actual edge direction' if physics_only and r['edgeDirection'] == 'math-to-physics' else 'Per-prerequisite direction must be derived from the actual future atomic goal subjects; this recipe label alone is not an activated edge.'
        recipe_decisions.append({'parentGoalId': record['goalId'], 'moduleCode': record['moduleCode'], 'proposedDependentCapabilityId': key, 'exactRecipeSha256': fp(r), 'exactRecipe': r, **judgement, 'directionFinding': direction_note, 'universalityDecision': 'only_the_explicit_future_method_scope_after_required_revision_and_atomic_mapping', 'activationApproved': False, 'blockingGaps': ['No reviewed atomic stable ID for target or prerequisite; full capability definitions can overstate exact needed operations.', 'Local source version and individual goal/source bindings remain unresolved.', 'Independent review of future complete goal/P cases and global DAG/scope is still required.']})

CAP = {
 'm.algebra': 'Source/provider gap: units, fractions and general formula rearrangement are not explicit full CIT513016/17 outcome competences. These are mostly prior-school/integrated mathematical skills; verify a real smaller provider rather than allocating by module title.',
 'm.functions': 'One-variable analysis supports functions, but full graph/exponential/log/inverse bundle is broader than many nominated targets. Exact elementary function skills/provider definitions need source and atomic review.',
 'm.geometry': 'No explicit whole angle/Strahlensatz/trigonometry target exists in the cited CIT513016/17 extracts. General school admission knowledge does not prove this provider competence; mark source-provider gap.',
 'm.tensor': 'PH0006 explicitly targets tensor algebra. CIT513016 supports matrices/basis changes but does not explicitly certify full tensor-component transformation; separate provider evidence and newly learned math target.',
 'm.probability': 'PH0008 source provides statistical ensembles/equal-probability/partition functions. This is not an already reviewed independent Math provider for normalization and arbitrary expectation values; split taught probability from subsequent physical application.',
 'm.uncertainty': 'PH0009–11 explicitly teach mathematical uncertainties and data analysis. The error rule must be concrete; this target is not an automatic prerequisite of those same intro-lab outcomes.',
 'p.thermo': 'PH0004 source has a separate thermodynamics outcome, absent from the current stored atom/molecule leaf. Never use that current stable ID as certified thermodynamics competence.',
 'p.solid': 'PH0017 source supports solid-state concepts, but its current outcome ID is only a preamble. A new genuine provider must be restored; no prerequisite on an empty goal.',
 'p.exergy': 'PH0021 current outcome determines efficiency; catalog exergy-balance competence overlaps with that same target. Author a genuinely earlier exergy-definition/flow-identification atom, not a self gate.',
 'p.kinematics': 'PH0001 full source supports kinematics; its current first leaf contains only measurement methodology. Provider candidate is a source anchor, not existing mastery proof.',
 'p.newton': 'PH0001 source supports point-mass laws, but the current measurement leaf does not. Separate earlier law meaning from new Newton problem solving.',
 'p.oscillation': 'PH0001 source explicitly includes calculating mechanical oscillations, missing from the current leaf. General oscillation meaning can support later application, but analogy is not universally necessary for every EM oscillation.',
 'p.workenergy': 'PH0001 full mechanics source supports physical energy context, not its current measurement leaf. Define the exact work/energy meaning needed by Lagrange rather than whole mechanics mastery.',
 'p.mechanicsmodel': 'PH0005 source provides Lagrange/Hamilton models, but current outcome is empty. Restoration and split are required before provider/edge use.',
 'p.ensembles': 'PH0008 supports ensembles, but source learning of partition/occupation is broad. An earlier concept atom must not duplicate the downstream partition-function target.',
 'm.fourier': 'CIT513019 explicitly provides Fourier transformation; PH0003 content introduces Fourier optics itself. Teach a distinct mathematical transformation atom before its application; no self-gate on the broad optics leaf.',
 'm.partial': 'CIT513018 and the PH0001 integrated outcomes explicitly support partial differentiation. The catalog additionally combines the full multidimensional chain rule; source/whole-skill evidence and minimum target need must be checked separately.',
 'm.multipleintegral': 'CIT513019 and PH0001 integrated outcomes explicitly support multidimensional integrals. Coordinate changes and arbitrary surface/volume choices still need exact authored atomic scope.',
 'm.hilbert': 'CIT513019 explicitly names Hilbert theory. Simple real/finite examples do not need every integral/complex method; define the state space before outgoing prerequisites.',
 'm.pde': 'CIT513019 explicitly names simple PDE. A catalog of all suitable procedures is not a universally mastered method atom; identify equation, conditions and allowed method.',
 'm.separation': 'Separation is a plausible didactic method for the source simple-PDE scope, but not quoted explicitly in the retained source. Source-backed didactic operationalization must still be authored and independently reviewed.',
 'm.spherical': 'PH0006 explicitly lists spherical-function computation as new target. Do not require this method of its own introduction or infer that a complete theory-physics atom certifies mathematics.',
 'p.quantumstates': 'PH0007 explicitly supports states/operators/time evolution. It is a broad physical bundle; preceding state meaning and later solution/operator computations must be separate atoms.',
 'p.labbasics': 'PH0009 first outcome supports carrying out selected experiments. Report, uncertainty and all data-analysis skills remain distinct lost source outcomes, not mastered automatically.',
 'p.measurement': 'PH0001 actual first outcome supports measurement-methodology knowledge, though observable performance is not yet explicit. It does not certify advanced calculus or uncertainty algorithms.',
 'p.em': 'PH0002 actual first outcome supports static field/current foundations. Later changing-field/wave/relativity meanings are absent and cannot be inferred from that retained leaf.',
 'p.optics': 'PH0003 actual broad outcome supports optical principles, but method-specific structure analysis should require only the selected relevant principles, not all optics and quantum topics.',
 'p.atomic': 'PH0004 actual atom/molecule bundle supports state/transition concepts and applications. An introductory concept provider must be split from the same subsequent solution competence.',
 'p.maxwell': 'PH0006 actual field-computation outcome supports Maxwell models; the introductory equations/physical boundary meanings must be separated from a downstream Green/PDE solution target.',
 'p.particles': 'PH0014 actual Standard Model bundle supports particle/interactions meaning. A particular mixing task does not require mastery of every detector/nuclear/astrophysical aspect.'
}
for key, note in {
 'm.vectors':'CIT513016 explicitly includes vector spaces and scalar products; geometric components/dot product can be derived subgoals, while full module outcome remains broad.',
 'm.linear':'CIT513016 explicitly includes linear maps, matrices, basis changes and LGS; the catalog combines several assessable skills needing separate children.',
 'm.eigen':'CIT513016 explicitly includes eigenvalue theory and diagonalization; compute eigenpairs and decide diagonalizability are distinct actual skills.',
 'm.innerproduct':'CIT513016 explicitly includes scalar-product spaces, orthogonal bases and projection. Many physics targets need only inner-product/betragsquadrat, not every projection/best-approximation skill.',
 'm.complex':'CIT513017 and PH0001 mathematical supplements explicitly mention complex numbers/exponential functions. Real or stationary routes should not receive this whole method as an automatic gate.',
 'm.derivative':'CIT513017 and PH0001 integrated calculus explicitly provide differentiation. Function calculus and rate interpretation need precise atomic scope rather than full course tokens.',
 'm.integral':'CIT513017 and PH0001 explicitly provide integration. Given kernels/physical quantities and independently found antiderivatives are different demands.',
 'm.ode':'CIT513017 and PH0001 explicitly teach simple ODE; the current PH0001 leaf does not contain this outcome and must not stand in for it.',
 'm.series':'CIT513017 explicitly names convergence of sequences/series. The complete convergence criterion/operation must be authored before becoming a prerequisite.',
 'm.taylor':'CIT513017/18 explicitly name Taylor expansion/series; approximation order and justified validity need separate measurable evidence.',
 'm.fourierseries':'CIT513017 explicitly names Fourier series. Periodic expansion and norm/convergence claims need authored scope; this is not interchangeable with arbitrary Fourier transform mastery.',
 'm.extrema':'CIT513018 explicitly includes extremum problems/implicit functions. Constraint handling is a didactic operationalization needing exact methods and domains.',
 'm.lineintegral':'CIT513018 explicitly names curve integrals. Scalar versus vector line integrals and parameterization are different smaller assessed skills.',
 'm.vectorcalculus':'CIT513018 names elements of vector analysis; gradient/divergence/curl in arbitrary suitable coordinates is broader than the literal heading. Treat as didactic candidate requiring complete method/source scope.',
 'm.odesystems':'CIT513018 names ODE theory; systems and selected solution algorithms are a plausible operationalization, not yet a reviewed atom.',
 'm.integraltheorems':'CIT513019 explicitly names integral theorems. Exact Gauss/Stokes hypotheses and application modes must be preserved and individually authored.'
}.items(): CAP[key] = note
assert set(CAP) == {c['capabilityId'] for c in recipes['capabilityCatalog']}
capability_decisions = [{'capabilityId': c['capabilityId'], 'exactCapabilitySha256': fp(c), 'scientificRationale': CAP[c['capabilityId']], 'decision': 'needs_provider_scope_revision' if c['capabilityId'] in ['m.algebra','m.functions','m.geometry','m.tensor','m.probability','p.thermo','p.solid','p.exergy'] else 'accepted_source_anchored_capability_concept_with_granularity_gap', 'reviewedAtomicProviderApproved': False, 'providerCandidatesRemainSourceAnchorsOnly': True} for c in recipes['capabilityCatalog']]

author_artifacts = [{'path': str(BASE / name), 'sha256': sha(BASE / name)} for name in ['index.author.json','role-ownership.author.json','requires-recipes.author.json','validation.integrity.json','source-code-bridge.followup.author.json']]
review = {'schemaVersion': 1, 'reviewId': 'tum-bsc-physics-independent-scientific-20261013-v2', 'reviewer': identity, 'completedAt': now, 'exactAuthorArtifacts': author_artifacts, 'status': 'classification_review_complete_requires_recipes_partly_need_revision_no_activation', 'scope': {'stableIdsActuallyRead': len(goal_decisions), 'actualOccurrencesReadAndRecomputed': len(occurrence_checks), 'originalLandscapesActuallyRead': len(documents), 'fullLocalModuleExtractsActuallyRead': len(MODULE), 'capabilityConceptsReviewed': len(capability_decisions), 'individualRecipesReviewed': len(recipe_decisions)}, 'semantics': {'classificationApprovalIsNotNativeQualityApproval': True, 'landscapeIsNotSubject': True, 'ownerSelectionDoesNotActivateOrReconcileDefinitions': True, 'requiresIsAND': True, 'requiresTransitiveMastery': False, 'stableIdsRetained': True, 'noPrerequisiteMasteryInferredFromDependent': True, 'noActiveMutation': True}, 'summary': {'goalDecisions': dict(collections.Counter(x['decision'] for x in goal_decisions)), 'recipeDecisions': dict(collections.Counter(x['disposition'] for x in recipe_decisions)), 'activatedEdges': 0, 'reviewedRuntimeRequiresEdges': 0}, 'goalDecisions': goal_decisions, 'capabilityDecisions': capability_decisions, 'recipeDecisions': recipe_decisions, 'crosswalkDecision': {'decision': 'accepted_only_as_unproven_inert_investigation_candidate', 'exactAuthorBridgeSha256': sha(BASE / 'source-code-bridge.followup.author.json'), 'pairingsReviewed': [{'historicalCode': x['historicalCode'], 'currentDegreeCode': x['currentDegreeCode'], 'status': 'source_scope_gap_formal_alias_and_mastery_equivalence_not_proved'} for x in bridge['proposedBridgeCandidates']], 'rationale': 'The current official degree uses CIT513016–19; the official QST table identifies MA9201–4 with corresponding titles. This supports candidate title/sequence pairing, not formal renaming, version equality or atomic mastery equivalence. Teacher-training codes remain separate. Module shells did not provide complete current bodies.'}, 'wholeFamilyCompletionApproved': False, 'nativeHumanOrHostAcceptanceClaimed': False}

receipt = {'schemaVersion': 1, 'receiptId': 'tum-bsc-physics-independent-actual-read-20261013-v1', 'reviewer': identity, 'completedAt': now, 'reviewNature': 'Substantive scientific reading plus separately corroborated technical binding. Hash checks alone are not content approval.', 'sourceReadFindingsPerModule': [{'moduleCode': code, 'path': role['sourceEvidence'][code]['localExtractPath'], 'fileSha256': sha(role['sourceEvidence'][code]['localExtractPath']), 'sectionsActuallyRead': ['full original content','full DE/EN outcomes where supplied','full preconditions'], 'scientificFinding': note, 'currentOfficialFullBodyVerified': False} for code,note in MODULE.items()], 'inputBindingsCheckedIndependently': bindings, 'occurrenceChecks': occurrence_checks, 'technicalIntegrity': {'boundInputsChecked': len(bindings), 'allExpectedInputBytesMatch': all(x['matches'] for x in bindings), 'actualDefinitionsCompared': len(occurrence_checks), 'allDefinitionsMatch': all(x['definitionMatches'] for x in occurrence_checks), 'effectiveDirectPlusContainsContextsRecomputed': len(occurrence_checks), 'allEffectiveContextsMatch': all(x['effectiveMatches'] and x['originsMatch'] for x in occurrence_checks), 'noRequiresTransitiveClosure': True}, 'officialWebInspectionActuallyPerformed': [{'url': 'https://academics.nat.tum.de/bsc/ph/curriculum', 'checkedAtDate': '2026-10-13', 'finding': 'Current CIT mathematics sequence, integrated first-year mathematical supplements, catalog alternatives, PH0041/40 and NAT3070 are visible; selected modeled family does not cover the whole degree.'}, {'url': 'https://academics.nat.tum.de/msc/qst/bewerbung', 'checkedAtDate': '2026-10-13', 'finding': 'The mathematics admission table uses MA9201–4 and their linear-algebra/Analysis1–3 titles as BSc Physics examples; it does not state formal identity with CIT codes.'}, *[{'url': 'https://academics.nat.tum.de/org/mh/details/mod/'+code, 'checkedAtDate': '2026-10-13', 'finding': 'Tool text retrieval returned module-description site shell without the module body; this does not prove the site lacks a body or validate the retained local source version.'} for code in ['CIT513016','CIT513017','CIT513018','CIT513019','PH0005']], {'url': 'https://www.moodle.tum.de/course/search.php?perpage=all&search=analysis', 'checkedAtDate': '2026-10-13', 'finding': 'Public search page is available; course-title occurrences are not formal module-version or whole-competence equivalence evidence.'}], 'sourceRightsBoundary': 'Sources remain third-party evidence. Only references, hashes and own review findings are saved; no relicensing or new native source approval.'}

def write(name, obj):
    path = BASE / name
    with path.open('x') as f: f.write(json.dumps(obj, ensure_ascii=True, indent=2)+'\n')
    return {'path': str(path), 'sha256': sha(path)}
correction = {'earlierOwnReviewArtifacts': [{'path': str(BASE / name), 'sha256': sha(BASE / name)} for name in ['role-requires.independent-review.json','actual-read.independent-receipt.json','index.independent-review.json']], 'reason': 'The first own technical recomputation did not filter inherited stable-ID self-requires of orientation nodes. Current runtime filters self at each contains inheritance step. This additive version recomputes all 238 contexts using that exact semantics, leaving the original author artifacts and the substantive per-goal/per-recipe decisions unchanged. It additionally records identical DE/EN source-text gaps.', 'semanticsSource': {'path': 'app/scripts/lib/crossLandscapeGraph.ts', 'sha256': sha('app/scripts/lib/crossLandscapeGraph.ts'), 'locator': 'computeEffective; stable goal ID self-filter at each inheritance step'}, 'scientificDispositionsChanged': False}
review['additiveTechnicalCorrection'] = correction
receipt['additiveTechnicalCorrection'] = correction
outputs = [write('role-requires.independent-review-v2.json', review), write('actual-read.independent-receipt-v2.json', receipt)]
manifest = {'schemaVersion': 1, 'reviewer': identity, 'completedAt': now, 'status': review['status'], 'authorArtifacts': author_artifacts, 'reviewArtifacts': outputs, 'technicalIntegrity': receipt['technicalIntegrity'], 'summary': review['summary'], 'futureAction': 'Revise named subject/method/provider scopes and author source-version-bound atomic goals. A separate new exact review is required for any active edge or native QA successor. Current source/QA/runtime/canonical goals were untouched.'}
manifest['additiveTechnicalCorrection'] = correction
outputs += [write('index.independent-review-v2.json', manifest)]
print(json.dumps({'outputs': outputs, 'summary': review['summary'], 'technicalIntegrity': receipt['technicalIntegrity']}, indent=2))
