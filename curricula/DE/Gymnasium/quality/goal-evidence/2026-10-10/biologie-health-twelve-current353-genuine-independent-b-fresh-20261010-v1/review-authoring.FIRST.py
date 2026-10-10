import json, hashlib, datetime
from pathlib import Path

PREP = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-health-twelve-current353-source-raster-native-technical-preparation-20261010-v1')
AUTHOR = PREP.parent / 'biologie-health-sexuality-addiction-twelve-whole-material-raster-source-author-candidate-v1'
OUT = PREP.parent / 'biologie-health-twelve-current353-genuine-independent-b-fresh-20261010-v1'
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()
ROLE = '/root/bio12_independent_b_fresh'
RUN = 'biologie-health-twelve-current353-genuine-independent-b-fresh-20261010-v1-FIRST'

def read(p): return json.loads(p.read_text())
def sha(p): return 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()
def binding(p): return {'path': str(p), 'sha256': sha(p), 'bytes': p.stat().st_size}
def write(name, data):
    p = OUT / name
    if p.exists(): raise RuntimeError('Refusing to overwrite own FIRST output: '+str(p))
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2)+'\n')
    return p

# These paragraphs are independent, goal-specific judgments from actual reading,
# not transformations of author verdicts or inferred approvals from hashes.
J = {
'0e1065b9': {
 'understanding': ['Problemlösen, Stressbewältigung und tragfähige Beziehungen eröffnen mehrere Handlungsmöglichkeiten und Quellen von Zufriedenheit. Schutzfaktoren können Suchtrisiken vermindern, ohne Suchtfreiheit zu garantieren.', 'Problem-solving, coping with stress and supportive relationships provide several options for action and sources of satisfaction. Protective factors can reduce addiction risks without guaranteeing prevention.'],
 'performance': ['Begründet für eine fiktive Überforderungs- oder Drucksituation einen machbaren Plan, vergleicht kurzfristige Entlastung mit späteren Folgen und nennt eine passende Unterstützung.', 'Justifies a feasible plan for a fictional situation of overload or pressure, compares immediate relief with later consequences, and identifies suitable support.'],
 'transfer': ['Passt den Plan von Zeitdruck an Gruppendruck an und erklärt, welche Strategie bestehen bleibt und welche Unterstützung neu nötig wird.', 'Adapts the plan from time pressure to peer pressure and explains which strategy remains useful and which support becomes necessary.'],
 'D': 'Die DE/EN-Beschreibungen operationalisieren die aktuelle BY8-Kompetenz verständlich. Erklärung und Planableitung gehören zu einer zusammenhängenden begründeten Bewältigungsleistung; eine fiktive Bearbeitung schützt die Privatsphäre.',
 'P': 'Beide vollständigen Fälle unterscheiden Aufgabenüberlastung und Zugehörigkeitsdruck. Lösungen und Transfers begründen Planbarkeit, soziale Unterstützung und Risikogrenzen; keine Behauptung, gute Lebenskompetenzen verhinderten jede Sucht. Die 10-Punkte-Rubriken bewerten die Begründung.',
 'A': 'Eine begründete Bewältigungsstrategie ist das gemeinsame Ergebnis der erklärenden und planenden Teilhandlungen; keine semantische Aufspaltung erforderlich.',
 'M': 'Anpassbare Pläne, die Wirkung von Unterstützung und Grenzen von Schutzfaktoren verlangen situatives Verstehen. Ein verbindlicher kompakter Faktenabruf ist hier kein eigenständiger Pflichtkern.',
 'V': 'Vier große Gedankenbilder für Planen, Gespräch, Bewegung und Musik bleiben bei 360 und 680 Pixeln erkennbar. Das leere Heft beansprucht keine Messdaten oder Leserichtung. Bildsymbole illustrieren Möglichkeiten, ohne einen garantierten Gesundheitserfolg zu zeigen.'},
'17dc9671': {
 'understanding': ['Verhalten vor und während einer Schwangerschaft kann Entwicklungsrisiken beeinflussen. Vorbeugung und fachliche Beratung reduzieren vermeidbare Risiken; eine Exposition allein legt den Ausgang einer einzelnen Schwangerschaft nicht fest.', 'Behaviour before and during pregnancy can influence developmental risks. Prevention and professional advice reduce avoidable risks; one exposure alone does not determine an individual pregnancy outcome.'],
 'performance': ['Vergleicht begründet Alkoholverzicht, rauchfreie Umgebung, Beratung und eigenmächtiges Absetzen eines Arzneimittels anhand möglicher Folgen für das Kind; benennt verbleibende Unsicherheit.', 'Makes a reasoned comparison of avoiding alcohol, a smoke-free environment, consultation and stopping medication independently, considering possible consequences for the child and remaining uncertainty.'],
 'transfer': ['Prüft die Behauptung, Vorsorge sei nach früher Exposition nutzlos oder ein Mittel sei wegen einer Werbeaussage sicher, und begründet eine fachliche Klärung ohne Schuldzuweisung.', 'Examines a claim that care is pointless after earlier exposure or that an advertised product is safe, and justifies professional clarification without blame.'],
 'D': 'Der bewertende Operator und der Bezug auf mögliche Folgen sind in DE/EN erhalten; der Text behauptet keine Individualprognose. Die BY8-Kompetenz umfasst beide Zeiträume ausdrücklich.',
 'P': 'Planvergleich und rückblickende Unsicherheit sind verschiedenartige vollständige Fälle. Kein selbständiger Arzneimittelwechsel; kein Alkoholmindestwert und keine sichere Schädigungsprognose. Die Lösungen unterscheiden Reduktion vermeidbarer Risiken von Schuld und Erfolgsgarantie.',
 'A': 'Ein gesundheitlich begründetes Verhaltensurteil über denselben Entwicklungszusammenhang; die Zeiträume sind Variation, keine unabhängigen Lernziele.',
 'M': 'Die Aufgabe ist Risikoabwägung mit Unsicherheit und Beratung. Es gibt hier keinen begrenzten zu memorierenden Medikamenten- oder Dosierungskatalog.',
 'V': 'Beratung, soziale Unterstützung und Essen/Wasser sind groß genug, Alkohol und Tabak deutlich durchgestrichen. Kein Arzneimittel wird visuell zur eigenständigen Absetzung empfohlen; die Szene nennt keine Dosis und verlangt keine persönlichen Angaben.'},
'3c0f5267': {
 'understanding': ['Körperliche und psychische Pubertätsveränderungen sind individuell verlaufende Entwicklungsprozesse. Ausgewählte und bearbeitete Medienbilder liefern keine biologische Norm für Aussehen, zeitlichen Verlauf oder persönliche Reife.', 'Physical and psychological changes in puberty are individually varying developmental processes. Selected and edited media portrayals provide no biological norm for appearance, timing or personal maturity.'],
 'performance': ['Verknüpft mehrere Veränderungen und individuelle Variation mit der kritischen Prüfung einer stereotypen oder bearbeiteten Mediendarstellung; erläutert eine biologisch unbegründete Schlussfolgerung.', 'Connects several changes and individual variation to a critical examination of a stereotyped or edited portrayal, explaining a biologically unsupported inference.'],
 'transfer': ['Überträgt die Unterscheidung von Entwicklung und Medienideal auf ein anderes Rollenbild oder einen neuen bearbeiteten Ausschnitt, ohne daraus Identität oder Orientierung abzuleiten.', 'Transfers the distinction between development and media ideals to another role stereotype or newly edited image, without inferring identity or orientation.'],
 'D': 'Die integrierte BY8-Kompetenz aus Entwicklung und Medienreflexion bleibt in DE/EN erhalten. Die abstraktere Entwicklungsleistung ist gegenüber dem Nachbarziel zur reinen Merkmalsbeschreibung erkennbar.',
 'P': 'Die zwei Fälle verlangen Variation statt Entwicklungsranking und Kriterien für Medienkritik. Bearbeitung erklärt keine Hormonwirkung, und weder Aussehen noch Verhalten werden als sichere Identitätsanzeiger gewertet. Die psychische Dimension wird ausdrücklich bearbeitet.',
 'A': 'Die biologische Entwicklung ist der gemeinsame Bezugsrahmen des Medienurteils; die Teilhandlungen sind eine integrierte Leistung. Das körperliche Beschreibungsziel bleibt eine didaktische Voraussetzung, kein semantisches Duplikat.',
 'M': 'Prozesscharakterisierung und begründete Medienreflexion sind Verstehensleistungen; einzelne Begriffe allein würden den geforderten Transfer nicht nachweisen.',
 'V': 'Große Figuren, Gedanken-/Fragesymbole und ein sichtbar bearbeitetes Bild sind auch klein erkennbar. Die Pflanzen sind eine Wachstumsmethapher, keine klinische Zeitachse. Die sichtbare Bildschirmseite wird präsentiert; keine unlesbare Pflichtschrift oder feste Entwicklungsnorm.'},
'63856e48': {
 'understanding': ['Verschiedene STI besitzen unterschiedliche Erreger und Übertragungswege; fehlende Beschwerden schließen eine Infektion nicht aus. Barrieren, bestimmte Impfungen und fachliche Beratung passen zu unterschiedlichen Risiken und bieten keine vollständige Universalgarantie.', 'Different STIs have different pathogens and routes of transmission; absence of symptoms does not exclude infection. Barriers, vaccines for particular pathogens and professional advice address different risks without offering a universal guarantee.'],
 'performance': ['Verknüpft vorgegebene Kontakte und Erreger mit geeigneten Maßnahmen, erklärt symptomfreie Übertragung und begründet die Grenzen von Kondomen, Impfungen und Testaussagen.', 'Links supplied contacts and pathogens to suitable measures, explains asymptomatic transmission, and justifies the limits of condoms, vaccines and test claims.'],
 'transfer': ['Korrigiert in einem neuen Fall eine Behauptung, gutes Aussehen, eine beliebige Impfung oder ein früher Test schützten sicher, und nennt die dafür relevante Unterscheidung.', 'Corrects a new claim that healthy appearance, any vaccine or an earlier test provides certain protection, identifying the relevant distinction.'],
 'D': 'Das Ziel fordert Anwendung von Übertragungswissen zum Schutz; DE/EN stimmen fachlich überein. Das präventive Verb meint Risikominderung, wie die vollständigen Materialien ausdrücklich klarstellen.',
 'P': 'Die zwei vollständigen Fälle betreffen Übertragungsweg-Schutz-Zuordnung und Fehlschlüsse aus Symptomen/Testergebnissen. Impfungen werden erregerspezifisch behandelt; Beratung bleibt vertraulich und ersetzt kein individuelles Diagnoseschema. Material, Lösungen und Transfers sind konsistent.',
 'A': 'Die Schutzentscheidung wird aus demselben Erreger-Übertragungs-Zusammenhang begründet. Erregerwissen und Schutzanwendung sind keine voneinander unabhängigen Atome.',
 'M': 'Der verpflichtende Kern ist die Zuordnung mit Begründung und Grenzen. Erregerspezifische Information steht im Material; ein umfassender klinischer STI-Katalog wird nicht als abrufpflichtiger Unterrichtskern verlangt.',
 'V': 'Erreger, Kontakte, Kondom/Impfung und Beratung sind klar als vereinfachte Symbole erkennbar. Das große Schild ist zusammen mit der begrenzenden Bildbeschreibung als Risikoreduktion verwendbar; kein vollständiger Schutz oder falscher biologischer Messwert. Der Beratungspfeil ist kein Ansteckungsweg.'},
'6add2bde': {
 'understanding': ['Sexuelle Selbstbestimmung umfasst freiwillige Entscheidungen, persönliche Grenzen, Würde und freie Entfaltung. Medien können Rollen und Körper auswählen oder bearbeiten; eine Kritik an Druck und Darstellung bewertet nicht den Wert eines realen Körpers.', 'Sexual self-determination involves voluntary decisions, personal boundaries, dignity and free development. Media can select or edit roles and bodies; criticism of pressure and portrayal does not judge the worth of a real body.'],
 'performance': ['Beurteilt in einer fiktiven Situation Zustimmung und Druck anhand konkreter Kriterien und kritisiert bei einem Medienvergleich Manipulation, Auswahl oder aufgezwungene Normen, ohne die dargestellten Menschen abzuwerten.', 'Evaluates consent and pressure using concrete criteria in a fictional situation, and critiques manipulation, selection or imposed norms in a media comparison without devaluing the people portrayed.'],
 'transfer': ['Unterscheidet bei einer neuen selbstgewählten Darstellung freie Selbstdarstellung von coercivem Druck und passt eine begründete Schutz- oder Hilfemöglichkeit an die Situation an.', 'Distinguishes freely chosen self-presentation from coercive pressure in a new portrayal, adapting a reasoned protective or help-seeking option to the situation.'],
 'D': 'Die Beschreibungen tragen Selbstbestimmung, Würde und Medienkritik in DE/EN vollständig. Die BY8-Zielkompetenz ist eine integrierte Kriterienleistung. D kann erhalten bleiben, aber dies schließt den separat dokumentierten V-Befund nicht.',
 'P': 'Die beiden vollständigen Fälle trennen selbstgewählte Darstellung und Druck und richten Medienkritik auf Auswahl/Manipulation statt auf reale Körper. Dieser sachlich richtige Text steht jedoch im Widerspruch zur Deutbarkeit des gebundenen Rasters; P-Text ist brauchbar, Gesamtmaterial mit diesem Raster offen.',
 'A': 'Würde, Entscheidungsfreiheit und Mediennormen sind gemeinsame Kriterien desselben Urteils; keine zwangsläufige Aufteilung in unabhängige Ziele.',
 'M': 'Situationsbezogene Kriterienanwendung und respektvolles Urteilen haben keinen hier separat verbindlichen Faktenabrufkern. Ein auswendig gelerntes Schlagwort belegt diese Leistung nicht.',
 'V': 'BLOCK: Links oben tragen glamouröse Körperbilder Herzen, darunter sind Körper-/Gesichtsfotos mit roten Kreuzen versehen und landen im Papierkorb. Insbesondere das Aknegesicht und nicht idealisierte Körper können als verworfene reale Körper gelesen werden. Bildlich ist nicht erkennbar, dass nur manipulierende Botschaften kritisiert werden sollen. Die gegenteilige Bildbeschreibung repariert diese sichtbare Wertungsordnung nicht. Bei original/360/680 bleibt sie bestehen.'},
'6de6ad3b': {
 'understanding': ['Gesundheitsbezogene Entscheidungen verbinden biologische Wirkungen mit kurz- und längerfristigen Folgen, unterschiedlichen Betroffenen, Handlungsspielraum und begründeten Werten. Eine günstige Einzelentscheidung garantiert keinen individuellen Gesundheitszustand.', 'Health-related decisions connect biological effects to immediate and longer-term consequences, different people affected, practical constraints and reasoned values. A favourable single choice does not guarantee individual health.'],
 'performance': ['Vergleicht vorgegebene Handlungsoptionen mit mindestens zwei sachlich begründeten Gesundheitsfolgen, berücksichtigt eigenes und fremdes Handeln sowie Alltagshürden und begründet eine durchführbare Entscheidung.', 'Compares supplied options using at least two justified health consequences, considers personal and others’ actions and everyday constraints, and justifies a feasible decision.'],
 'transfer': ['Wendet die Abwägung auf einen veränderten Zeit-, Unterstützungs- oder Interessenkonflikt an und erklärt, weshalb eine pauschale Empfehlung angepasst werden muss.', 'Applies the comparison to changed time, support or competing interests, explaining why a blanket recommendation needs adjustment.'],
 'D': 'Ein gut prüfbares Abwägungsziel; beide Sprachen tragen eigene und fremde Verhaltensfolgen und begründete Entscheidung. BY8 und BY10 unterstützen den Kern ausdrücklich, andere Landesstellen nur in ihrer engeren Teilbedeutung.',
 'P': 'Schlaf/Arbeitszeit und Lebensbedingungen/Bewegung ergeben zwei unterschiedliche vollständige Entscheidungssituationen. Körperform ist kein Gesundheitssurrogat; strukturelle Hürden und Beziehungen werden berücksichtigt. Lösungen machen weder Diagnose noch ein perfektes Körperideal zur Bewertung.',
 'A': 'Folgenvergleich und Entscheidung bilden einen zusammenhängenden Bewertungsprozess. Die Themenbreite erzeugt Variationen, keine notwendige Liste unabhängiger Faktenziele.',
 'M': 'Die jeweils gegebenen Informationen werden begründet gewichtet. Es gibt keinen separaten Pflichtkatalog von Gesundheitsregeln oder Dosierungen, der allein durch Abruf diese Kompetenz abdecken würde.',
 'V': 'Die großen Waagschalen zeigen eine verständliche Abwägungsmetapher; Erholung, Bewegung, Ernährung, Beziehungen und Zeitaufgaben bleiben bei kleinen Breiten erkennbar. Keine gemessene Gesundheitsmenge, Normgewicht oder Uhrzeit wird behauptet.'},
'773a297d': {
 'understanding': ['Wiederholte Belohnung, Hinweisreize und Belastung können Verhalten verstärken; Entwicklung einer Sucht ist mehrfaktoriell und kein zwangsläufiger Einbahnprozess. Kontrollverlust und schädliche Folgen betreffen Gesundheit, Alltag und Beziehungen, ohne eine Person moralisch abzuwerten.', 'Repeated reward, cues and stress can reinforce behaviour; addiction develops through multiple factors rather than inevitably. Loss of control and harmful consequences affect health, everyday life and relationships without determining a person’s moral worth.'],
 'performance': ['Erklärt einen fiktiven Verlauf anhand eines vereinfachten Rückkopplungsmodells, unterscheidet Verstärkung von Determinismus und beschreibt konkrete Folgen sowie eine Modellgrenze.', 'Explains a fictional course with a simplified feedback model, distinguishes reinforcement from determinism, and describes concrete consequences and a model limit.'],
 'transfer': ['Überträgt das Modell von einer Substanz auf ein anderes belohnendes Verhalten und unterscheidet gemeinsame Mechanismen von nicht übertragbaren pharmakologischen Eigenschaften.', 'Transfers the model from a substance to another rewarding behaviour, distinguishing shared mechanisms from pharmacological properties that do not transfer.'],
 'D': 'Modellverwendung und Folgenbeschreibung sind verständlich und DE/EN-äquivalent. Die aktuelle BY8-Kompetenz wird ohne klinische Diagnoseanforderung abgebildet.',
 'P': 'Die vollständigen Fälle behandeln substanzbezogenes und anderes verstärktes Verhalten mit konkreten Rückkopplungen und Konsequenzen. Das Material vermeidet ein vermeintliches einzelnes Suchtzentrum sowie automatische Gleichsetzung von häufiger Nutzung und Diagnose. Lösungen benennen Modellgrenzen.',
 'A': 'Mechanismus und Folgen sind Teile einer Kausalerklärung desselben Phänomens; die Modellvariation rechtfertigt keine Aufspaltung.',
 'M': 'Das Verständnis der Rückkopplung und die Übertragung verlangen kausales Erklären, nicht allein den Abruf einer Liste von Substanzen oder Symptomen.',
 'V': 'Großer Hinweisreiz-Verhalten-Belohnungs-Kreis, Schlafbezug und Unterstützung sind in allen drei Größen lesbar. Der Stern im Gehirn ist ein Symbol; das Bild behauptet weder einen anatomisch scharf abgegrenzten Ort noch Zwangsläufigkeit oder die Diagnose jedes Smartphonegebrauchs.'},
'848334f3': {
 'understanding': ['Einnistung, Organbildung, Wachstum und Geburt bilden eine zeitliche Entwicklung. Plazenta und Nabelschnur ermöglichen Stoffaustausch zwischen normalerweise getrennten Kreisläufen; Entwicklungsrisiken und Geburtswege sind individuell.', 'Implantation, organ formation, growth and birth form a temporal development. The placenta and umbilical cord enable exchange between normally separate circulations; risks and delivery routes vary individually.'],
 'performance': ['Ordnet Entwicklungsphasen und beschreibt Grundphasen einer typischen vaginalen Geburt, erklärt Versorgung und benennt Risiken sowie Grenzen einer schematischen Prognose.', 'Orders developmental stages and describes the basic stages of a typical vaginal birth, explains supply, and identifies risks and the limits of a schematic prediction.'],
 'transfer': ['Unterscheidet in einer neuen Kaiserschnittdarstellung den veränderten Geburtsweg von der unveränderten vorgeburtlichen Folge und prüft eine Größen- oder Filterbehauptung am Modell.', 'Distinguishes a changed delivery route in a new caesarean portrayal from the prenatal sequence, and examines a scale or filtering claim in the model.'],
 'D': 'DE und EN behalten Schwangerschaftsverlauf, Geburt und Risiken. Die aktuelle HE-Quelle enthält den Themenkern, aber ihre Bulletliste ist kein wörtliches kompetenzgenaues Äquivalent; das aktuelle partial ist angemessen.',
 'P': 'Zeitkarten und ein Versorgungsplakat sind zwei vollständige, unterschiedliche Fälle. Der erste enthält tatsächliche Geburtsgrundphasen und Kaiserschnitttransfer, der zweite Versorgung/Prognosegrenzen. Zusammen decken sie alle drei Erwartungen; Fall 2 allein zeigt die Geburtsphasen nicht. Eine einzelne gelöste Aufgabe darf daher nicht automatisch alle Erwartungen schließen.',
 'A': 'Verlauf, Geburt und Risiko sind ein zeitlich-funktionaler Gesamtprozess; die Nachbarziele bewerten Verhalten oder erklären Zeugung tiefer. Der Beobachtungs-/Beschreibungsfokus ist eigenständig.',
 'M': 'Eine zeitliche Folge ist relevant, wird aber hier mit Versorgung, Risiken und Darstellungsgrenzen verknüpft und erklärt. Keine eigenständige Pflicht zum isolierten Terminabruf oder klinischen Katalog nachgewiesen.',
 'V': 'Drei große Stadien zeigen früher/später Schwangerschaft und betreute Versorgung nach Geburt. Keine direkte Anatomiebehauptung oder gemeinsame Blutmischung. Dieses Überblicksbild ersetzt die im P-Material tatsächlich beschriebenen Geburtsphasen nicht, widerspricht ihnen aber nicht.'},
'91f62a7b': {
 'understanding': ['Primäre Geschlechtsmerkmale gehören zu vorhandenen Fortpflanzungsorganen, sekundäre Merkmale entwickeln sich typischerweise in der Pubertät. Wachstum, Haut, Stimme und Behaarung variieren in Zeitpunkt und Ausprägung; daraus folgt keine persönliche Rangordnung oder Identität.', 'Primary sex characteristics concern existing reproductive organs; secondary characteristics typically develop during puberty. Growth, skin, voice and body hair vary in timing and expression, implying no personal ranking or identity.'],
 'performance': ['Ordnet Beispiele primären und sekundären Merkmalen zu, beschreibt weitere körperliche Veränderungen und begründet, warum einzelne sichtbare Merkmale keine vollständige Reifebeurteilung ergeben.', 'Classifies examples as primary and secondary characteristics, describes other physical changes, and explains why single visible traits do not establish an overall maturity judgement.'],
 'transfer': ['Prüft bei veränderter Reihenfolge von Brustentwicklung, Stimme oder Wachstum eine behauptete Norm und begründet individuelle Variation statt Diagnose.', 'Examines a claimed norm after changes in the order of breast development, voice changes or growth, explaining individual variation rather than making a diagnosis.'],
 'D': 'Die kurze Beschreibungsleistung ist in beiden Sprachen klar. Die aktuelle partial-HE-Zuordnung erhält die Themenquelle ohne einen erfundenen exakten Operatornachweis.',
 'P': 'Merkmalskarten und zwei fiktive Entwicklungsverläufe sind verschieden. Fall 1 prüft primäre/sekundäre Zuordnung, Fall 2 individuelle Variation; die Gesamtabdeckung ist vorhanden, aber Fall 2 allein belegt die primäre/sekundäre Unterscheidung nicht. Keine private Körperauskunft und keine Diagnose.',
 'A': 'Mehrere Merkmale sind Beispiele derselben vergleichenden Beschreibungsleistung. Biologische Beschreibung bleibt vom integrierten psychischen/medialen Entwicklungsurteil des Nachbarziels unterscheidbar.',
 'M': 'Die Zuordnung erfolgt mit im Material vorhandenen Kategorien und wird begründet; eine Pflicht zum bloßen Namensabruf aller Merkmale ist kein zusätzlicher Zielkern. Begriffskarten wären optional, nicht M-Voraussetzung.',
 'V': 'Vollständig bekleidete junge Menschen und große Symbole zeigen Wachstum, Haut, Stimme und Körperhaar. Unterschiede werden ohne Pfeil zu einem idealen Körper oder festen Alter dargestellt. Die variable Figurengröße ist kein alleiniger Reifeindikator; in 360/680 bleibt die Kernszene verständlich.'},
'a6f2bcaf': {
 'understanding': ['Aus Ei- und Samenzelle entsteht bei Befruchtung normalerweise im Eileiter eine Zygote. Teilung, Einnistung und Differenzierung gehören zu unterschiedlichen Zeitpunkten und führen zu pränataler Entwicklung mit Versorgung über Plazenta und Nabelschnur.', 'An egg and sperm normally form a zygote through fertilisation in the oviduct. Cleavage, implantation and differentiation occur at different times and lead to prenatal development supported through the placenta and umbilical cord.'],
 'performance': ['Korrigiert einen Orts-/Zeitplan, erklärt Teilung und Differenzierung und begründet Stoffaustausch zwischen getrennten Kreisläufen sowie die Grenzen einer nicht maßstäblichen Zeichnung.', 'Corrects a location and sequence plan, explains division and differentiation, and justifies exchange between separate circulations and the limits of a drawing without a shared scale.'],
 'transfer': ['Prüft eine neue Darstellung mit ausgelassenen Zwischenstadien oder unterschiedlichen Vergrößerungen und unterscheidet zulässige Vereinfachung von einem biologisch falschen unmittelbaren Sprung.', 'Examines a new portrayal with omitted intermediate stages or different magnifications, distinguishing permissible simplification from a biologically incorrect immediate jump.'],
 'D': 'Die biologische Erklärung bildet einen Prozess, in DE/EN ohne neue Leistungsanforderung. HE6.1 deckt das Thema, nicht den exakten operativen Wortlaut; partial bleibt erforderlich. Eine Pflanzen-Blütenkompetenz darf die menschliche pränatale Zielabdeckung nicht scheinbar erhöhen.',
 'P': 'Zeit-/Ortskorrektur und Versorgungsmodell ergeben zusammen alle Erwartungen mit anspruchsvollen Transfers. Der erste Fall allein prüft den Kreislaufaustausch nicht, der zweite allein die Befruchtung im Eileiter nicht. Gemeinsame Evidenz ist notwendig; einzelne Falllabels sind kein Beherrschungsnachweis.',
 'A': 'Zeugung, Empfängnis und Entwicklung sind die biologisch zusammenhängende Entstehungsfolge. Das beschreibende Schwangerschafts-/Geburtsziel und die Risikoentscheidung bleiben andere Leistungsfoki.',
 'M': 'Die Kompetenz fordert Beziehungen, zeitliche Reihenfolge und Modellkritik; Namen früher Stadien stehen in der Vorlage. Kein separates verbindliches Deck für isolierte Stadiennamen nötig.',
 'V': 'Die tatsächliche v2 zeigt getrennte Zeitfenster für Gametenverschmelzung, frühe Teilungsstadien und einen späteren eingewachsenen Embryo. Große Pfeile und Kammern bleiben bei 360/680 verständlich. Unterschiedliche Vergrößerung und eine modellhafte mittlere Zeitleiste sind keine gleichzeitigen Mehrlinge oder vermischten Kreisläufe.'},
'a6f57e17': {
 'understanding': ['Der Unterschied zwischen Genuss und Sucht hängt an Kontrolle, Vorrang und Folgen eines Verhaltens, nicht allein an Dauer, Uhrzeit oder häufiger Nutzung. Risikoreflexion kann auf fiktive Situationen bezogen werden und stellt keine klinische Diagnose dar.', 'The distinction between enjoyment and addiction concerns control, priority and consequences rather than duration, clock time or frequency alone. Risk reflection can use fictional situations and does not establish a clinical diagnosis.'],
 'performance': ['Vergleicht zwei fiktive Verläufe anhand von Kontrolle und Alltagsfolgen, trennt Hinweise von gesicherter Diagnose und begründet einen Schutz- oder Unterstützungsschritt.', 'Compares two fictional courses using control and consequences for daily life, distinguishes indications from confirmed diagnosis, and justifies a protective or supportive step.'],
 'transfer': ['Erklärt bei viel Zeit ohne Kontrollverlust oder kurzer Nutzung mit ernsten Folgen, weshalb ein bloßer Zeitgrenzwert die Bewertung nicht ersetzt.', 'Explains why a simple time threshold cannot replace assessment when lengthy use involves no loss of control or brief use has serious consequences.'],
 'D': 'DE und EN operationalisieren den BY8-Unterschied Genuss/Sucht. Die eigene Risikoaufmerksamkeit ist durch fiktive Bearbeitung prüfbar, ohne intime Angaben oder eine klinische Selbstdiagnose zu verlangen.',
 'P': 'Die vollständigen Fälle und Transfers lösen Dauer von Kontrolle und Folgen. Hilfesuche wird unterstützt, Betroffene werden nicht moralisch etikettiert. Ein Schulfalldatensatz liefert weder die klinische Dauerprüfung noch eine gesicherte Diagnose, was Material und Lösung korrekt begrenzen.',
 'A': 'Der Vergleich der Verhaltensgrenze führt unmittelbar zur begründeten Risikoaufmerksamkeit; ein integriertes Urteilsziel.',
 'M': 'Die Zielgrenze lässt sich nicht mit einem festen Mengen- oder Zeitwert memorieren. Die Anwendung der Kriterien auf abweichende Fälle ist der Pflichtkern.',
 'V': 'Große Vergleichsszenen zeigen Kontakte/Schlaf/weggelegtes Gerät gegenüber Wiederholung und Alltagsfolgen; Hilfe bleibt sichtbar. Eine gezeichnete Uhr behauptet keinen klinischen Grenzwert. Die Kernkontraste sind in allen drei Größen erkennbar.'},
'd6727804': {
 'understanding': ['Sachlich passende Sprache, Zustimmung, Privatsphäre und Respekt ermöglichen Kommunikation über Sexualität in unterschiedlichen Kontexten. Bei Grenzverletzungen richtet sich die Verantwortung an die verletzende Handlung; Hilfe oder Abstand können angemessener sein als eine direkte Konfrontation.', 'Appropriate factual language, consent, privacy and respect support communication about sexuality in different contexts. Responsibility for a violation lies with the harmful action; support or leaving can be more suitable than direct confrontation.'],
 'performance': ['Formuliert für medizinische, partnerschaftliche oder öffentliche Situationen respektvolle Aussagen und eine begründete Reaktion auf Druck oder Abwertung; berücksichtigt Sicherheit und Vertraulichkeit.', 'Formulates respectful statements for medical, relationship or public contexts and a reasoned response to pressure or degradation, considering safety and confidentiality.'],
 'transfer': ['Passt eine Antwort an eine digitale Gruppe oder ein asymmetrisches Gespräch an und begründet, wann Grenzen, Moderation, Unterstützung oder Verlassen geeignet sind.', 'Adapts a response to a digital group or an unequal conversation, explaining when boundaries, moderation, support or leaving are appropriate.'],
 'D': 'Alle aktuellen BY8-Kontexte und der angemessene Umgang mit Belästigung/Abwertung bleiben DE/EN erhalten. Angemessen heißt situationsabhängig und verpflichtet Betroffene nicht zur Konfrontation.',
 'P': 'Fiktive Dialoge und eine digitale Gruppensituation erlauben konkrete Sprachhandlungen und Sicherheitsentscheidungen. Lösungen respektieren Vertraulichkeit, Selbstbestimmung und Hilfe; die Rubriken bewerten Sprache und Begründung statt persönliche Offenlegung.',
 'A': 'Kontextvarianten betreffen dieselbe kommunikative Kompetenz mit Grenze und angemessener Reaktion; keine Pflicht zu drei separaten Kommunikationszielen.',
 'M': 'Flexible adressatengerechte Formulierung und Sicherheitsurteil sind zentral. Fest memorierte Antwortsätze wären für die abweichenden Kontexte unzureichend und kein eigenständiger Pflichtabrufkern.',
 'V': 'Zuhören, persönliche Grenze, Privatsphäre und die Zurückweisung abwertender Sprache sind durch große Figuren und Symbole klar. Die Szene zeigt Unterstützung statt Zwang zur Meldung persönlicher Erfahrungen. Kein notwendiger kleiner Bildschirmtext.'}
}

campaign = read(PREP/'native/twelve-current-native/round-b/description-review-campaign.json')
review_input = read(PREP/'native/twelve-current-native/round-b/description-review-input.json')
science = read(PREP/'science/twelve-whole-science.exact.json')
sg = {x['goalId']: x for x in science['wholeGoalsAndProfilesAndCases']}
raster = {x['goalId']: x for x in read(PREP/'inputs/twelve-current-raster-bindings.neutral.json')['records']}
records = []
for g in review_input['goals']:
    j = J[g['goalId'][:8]]
    u = {}
    for stem, k in [('essentialUnderstanding','understanding'), ('observablePerformance','performance'), ('transferExpectation','transfer')]:
        u[stem+'De'], u[stem+'En'] = j[k]
    r = {'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json', 'schemaVersion':1,
        'recordId': RUN+'.'+g['goalId'], 'runId':RUN, 'campaignId':campaign['campaignId'], 'roundId':campaign['roundId'],
        'bundleFingerprint':campaign['bundleFingerprint'], 'bookDigest':campaign['bookDigest']}
    r.update({k:g[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']})
    r.update({'decision':'keep', 'understandingEvidence':u, 'rationale':j['D'], 'evidenceProfileContract':'positive-understanding-evidence-v2',
        'evidenceProfileRecommendation':'none','recordStatus':'candidate','reviewAuthority':'ai_candidate'})
    records.append(r)
import jsonschema
schema = read(PREP/'native/twelve-current-native/round-b/contracts/goal-description-review-record.schema.json')
for r in records: jsonschema.Draft202012Validator(schema).validate(r)
p=OUT/'description-review-records.FIRST.jsonl'
if p.exists(): raise RuntimeError('No overwrite')
p.write_text(''.join(json.dumps(x,ensure_ascii=False)+'\n' for x in records))
write('description-review-run.FIRST.json', {
 'schemaVersion':1, 'runId':RUN, 'createdAt':NOW, 'reviewer':ROLE,
 'campaignId':campaign['campaignId'], 'roundId':campaign['roundId'], 'reviewerRole':campaign['reviewerRole'],
 'reviewPass':'first_pass','independenceGroupId':campaign['independenceGroupId'],'blindToOtherReviews':True,
 'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],
 'reviewInputFingerprint':campaign['reviewInputFingerprint'],'promptFingerprint':campaign['promptFingerprint'],
 'criteriaFingerprint':campaign['criteriaFingerprint'],'recordSchemaDigest':campaign['recordSchemaDigest'],
 'batchInputFingerprint':campaign['batches'][0]['batchInputFingerprint'], 'recordCount':12,
 'schemaValidatedRecords':12, 'records':binding(p), 'recordStatus':'candidate','reviewAuthority':'ai_candidate',
 'humanApproval':False,'humanApproved':0,'humanTrial':False,
 'independenceStatement':'Read author expectations and neutral technical inputs only. No other A/B judgment, root findings, resolutions, or technical operation plans were read before this FIRST seal.'})

goal_receipts=[]
native_model=read(PREP/'native/twelve-current-native/bundle/book-model.json')
pages={x['goalId']:x for x in native_model['pages']}
for g in review_input['goals']:
    gid=g['goalId']; j=J[gid[:8]]; src=sg[gid]; rb=raster[gid]
    views=[]
    for v in rb['actualRasterViews']:
        b=binding(Path(v['path']))
        assert b['sha256']==v['sha256']
        views.append(dict(b,role=v['role'],width=v['width'],height=v['height'],actuallyViewed=True))
    html=PREP/'native/captures/html-whole-pages'/f'{gid}.actual-whole-html-page.png'
    pdf=PREP/'native/captures/pdf-whole-pages'/f'{gid}.actual-whole-pdf-page.png'
    goal_receipts.append({
        'goalId':gid, 'goalFingerprint':g['goalFingerprint'], 'pageFingerprint':g['pageFingerprint'],
        'currentDeEnDescriptionDecision':'keep', 'D':j['D'],
        'P':{'decision':'keep_text_candidate', 'judgment':j['P'], 'profile':src['profile'],
          'wholeCaseIds':[c['id'] for c in src['wholeMaterialCases']],
          'actuallyReadFields':['materialDe','materialEn','taskDe','taskEn','workedSolutionDe','workedSolutionEn','freshTransferDe','freshTransferEn','freshTransferSolutionDe','freshTransferSolutionEn','limitsDe','limitsEn','rubric'],
          'actualCaseCount':len(src['wholeMaterialCases']), 'requiredExpectationIds':src['profile']['coverageExpectations']['requiredExpectationIds'],
          'evidenceLevel':'E1','maximumClaimScope':'G1','reviewAuthority':'ai_candidate','status':'needs_human_review'},
        'A':{'decision':'keep_atomic','judgment':j['A']},
        'M':{'decision':'no_memory_needed','judgment':j['M']},
        'V':{'decision':'block' if gid.startswith('6add2bde') else 'keep', 'judgment':j['V'],
          'actualViews':views,'captionDe':rb['captionDe'],'captionEn':rb['captionEn'],
          'hashUse':'Identity and exact binding only; the visual judgment was made by actual inspection.'},
        'native':{'actualWholeHtmlPage':binding(html),'actualWholePdfPage':binding(pdf),
          'actuallyViewedWholeHtmlAndPdf':True, 'pageNumber':pages[gid]['pageNumber'],
          'judgment':'Whole HTML and physical PDF page have a readable goal heading, description, breadcrumb, relationship panels and the selected raster without clipping. Internal and external prerequisites are distinguishable. Candidate/unapproved evidence labeling is truthful. '+('The visible raster defect also affects this whole page; semantic/material closure is blocked until its replacement is reviewed.' if gid.startswith('6add2bde') else 'No additional native-page defect found.'),
          'layoutDecision':'keep','semanticMaterialDecision':'block' if gid.startswith('6add2bde') else 'keep_candidate'},
        'humanApproval':False,'humanApproved':0,'humanTrial':False})
write('whole-material-P-A-M-native-raster.FIRST.review.json', {
 'schemaVersion':1,'createdAt':NOW,'reviewer':ROLE,'reviewPass':'first_pass','blindToOtherReviews':True,
 'scienceInput':binding(PREP/'science/twelve-whole-science.exact.json'),
 'normalPInput':binding(PREP/'positive/twelve-current-raster.P.pending.review.jsonl'),
 'goalCount':12,'profileCount':12,'expectationCount':36,'wholeCaseCount':24,
 'actualOriginal360680Views':36,'actualWholeGoalHtmlPages':12,'actualWholeGoalPdfPages':12,
 'records':goal_receipts,'rasterKeep':11,'rasterBlocked':1,'DKeep':12,'AKeep':12,'MNoMemoryNeeded':12,
 'humanApproved':0,'humanApproval':False,'humanTrial':False,'strictGain':0})

# Individual primary/content judgments keyed to the inspected 97 whole source goals.
SOURCE_NOTES = [
 'BY8 expressly integrates life skills, everyday coping, satisfaction and development strategies; exact semantic match.',
 'HB31 covers drug effects and strategies for avoidance, but the primary uses a naming operator. The strengthened explain/derive source extraction is not a verbatim official bullet and must be marked as operationalisation.',
 'HH27/28 cover sexual development, pregnancy and infection protection. They do not locate the drug/nervous-system overlap claimed for the three addiction goals; actual HH24 supplies drug-effects communication, not the full life-skills or addiction-boundary competence.',
 'MV24 explicitly includes drug dependence, reward, personal/social consequences and prevention; narrower overlap with the three addiction goals is supported.',
 'SN34-36 jointly cover human development, addiction risks and ethical/social health judgments. This is a broad teaching unit split across targets, not an exact whole-unit equivalence for any one goal.',
 'ST38-39 combine brain impairment, addiction discussion, risks and healthy living; relevant partial overlap without converting every nervous-system expectation into the addiction target.',
 'TH22-25 combine puberty, prenatal health, STI prevention, misuse avoidance and contextual self/social competence. Keep only the matching subset for each target; broad unit is not fully represented by any single target.',
 'BY8 explicitly evaluates behaviour before/during pregnancy with possible child-health consequences; exact semantic match.',
 'MV20 includes physical/psychosomatic development, pregnancy/birth, prenatal protection, respect and STI prevention. Partial for each integrated target; no whole-unit equivalence.',
 'RP36 applies biological knowledge to responsible behaviour and explicitly includes prevention and prenatal care; the mapped processes are relevant contexts, not four exact duplicates of this operator.',
 'ST34-35 include human reproduction, unborn-child protection, health behaviour and ethical sexual reflection; these subsets support the mapped health and developmental targets.',
 'BB32 puberty and hormonal development support physical description and development characterization, with media/context dimensions supplied by the canonical integrated goal rather than asserted as exact wording here.',
 'BE32 has byte-identical primary content to BB32; same puberty/development subset, separately bound jurisdiction, no second different primary falsely claimed.',
 'BY8 explicitly joins psychological/physical development and media-influenced ideas of beauty/sexuality; exact integrated match.',
 'HB31 organ structure/function gives factual language and biological foundations for puberty and communication. It is a narrow foundation and does not itself prove respectful handling of harassment or the complete media judgment.',
 'HB31 hormones, functions and effects include puberty foundations; relevant physical subset, not the whole psychological/media competence.',
 'HB31 mitosis/meiosis concerns genetic-information transmission. This does not directly assess the mapped puberty-as-development/media judgment; reject this target-source pair as a substantive closure witness.',
 'HB32 development from fertilisation to adulthood provides the temporal physical-development subset shared by the four mapped targets.',
 'NRW24-26 human sexual development, pregnancy and respectful language match the target subsets; canonical broader demands are not claimed as exact whole-unit wording.',
 'SH24 and32 reproduction standards include puberty, pregnancy, relationships and infection prevention. Human and genetic/plant parts must retain their scope; mapped human subsets are substantively present.',
 'SL34 physical puberty changes and primary/secondary distinction are directly present; psychological/media interpretation is beyond this narrower source bullet.',
 'ST25 puberty and media/self-determination support the human targets; the combined seed-plant portion is not human prenatal coverage. Reproduction overlap is limited to the human reproductive foundations, not the plant mechanisms.',
 'BB32 sexual-health contexts and condom model support transmission/protection; the current reviewed-source label is operationalized, not exact.',
 'BE32 shares BB bytes and condom/sexual-health contexts; separate binding uses the same inspected content, not a fictitious independent document.',
 'BW19 STI condom-protection competency directly supports the barrier subset, not vaccination or the entire canonical protection scope.',
 'BY8 expressly links STI and routes to protecting oneself and others; exact semantic match.',
 'HB29 HIV transmission and disease progression support one pathogen/protection subset; neither all-STI coverage nor complete health judgment is claimed.',
 'HB29 infection-protection measures support preventive subset of STI and health behaviours.',
 'HB32 requires evaluating STI protection and contraception. The self-determination target uses responsible-choice context but this bullet does not independently prove every dignity/media criterion.',
 'BB32 partnership, sexuality and self-determination contexts support respectful judgments; reviewed-source operationalization is narrower than an exact whole canonical performance.',
 'BE32 shares those partnership/self-determination contexts with BB; same actual primary bytes are acknowledged.',
 'BW13 respecting individual people supports the dignity and respectful-communication criteria without certifying the complete sexuality/media competency.',
 'BW20 value-neutral discussion of orientation/identity directly supports non-degrading sexual communication and judgment, not biological identity inference.',
 'BY8 expressly combines self-determination, dignity, free development and critical role/body/media portrayal judgment; exact match.',
 'HB32 discusses pregnancy termination and legal context; relevant reasoned respectful discussion, not legal advice or a standalone proof of full media/harassment response.',
 'NRW35-36 sexual responsibility, identity and pregnancy contexts substantively support the mapped subsets; broader unit remains distinct.',
 'SL35 names abuse as violence and infringement of self-determination and discusses prevention; direct subset of boundary/consent judgment.',
 'BB23/24 decision criteria and consequences are the operative evaluation standards; historical sourceRef 2.3 is not the precise location of every 2.4 decision criterion. Health-context linkage is a reviewed operationalization.',
 'BB30 nutrition/health contexts support a biological health-choice subset; no universal diet rule or full canonical scope follows.',
 'BB34 nerve/addiction context supports health-risk decisions; attribution of all life skills is wider than the listed technical content, so scope remains limited.',
 'BE23/24 are the same decision criteria and consequences as BB; same caveat concerning the old 2.3 pointer and reviewed health operationalization.',
 'BE30 shares the nutrition/health subset with BB; separate jurisdiction binding is retained without double-reading claims.',
 'BE34 shares nerve/addiction health context with BB; no strengthened universal life-skills claim follows from the broad topic alone.',
 'BW14 explicitly evaluates own actions in healthy living; partial because canonical also concerns others and different consequences.',
 'BW17 criteria for health-maintaining nutrition and planning meals are a concrete subset of the health-choice performance.',
 'BW18 eating-disorder causes/consequences supply a health-risk subset. The source wording is curriculum terminology and does not authorize diagnosing any learner or body.',
 'BW19 risks of active/passive smoking and reasoned non-smoking directly support health-consequence judgment.',
 'BW20 sensory-organ dangers and protective measures support one bounded prevention subset.',
 'BW21 diabetes causes and therapies provide health information; this is not a licence for clinical treatment advice or a whole canonical decision proof.',
 'BW21 stress causes, effects and coping connect the causal and decision aspects of health behaviour.',
 'BY8 explicitly weighs own/others behaviours and health consequences for value-informed decisions; exact core match.',
 'BY10 adds social perspectives and health decisions to the same general goal; exact core match includes no automatic coverage of every BY10 example.',
 'HB28 protective measures for pathogens/vectors give bounded preventive actions, with narrower naming operator than canonical weighing.',
 'HB29 clean-air measures give one environmental preventive subset of health action.',
 'HB29 antibiotics and appropriate use provide bounded prevention information; no individual regimen or general self-treatment is asserted.',
 'HB30 reflection on disgust when handling natural objects does not itself concern health consequences and reasoned health maintenance. Reject this pair as substantive health-target evidence.',
 'HB30 obtaining/processing illness information can inform a reasoned decision; it is an information foundation, not full health assessment.',
 'HB30 awareness of body complexity, risk factors and health measures supports the health-consequence target subset.',
 'HB31 conditions for successful learning provide only a contextual foundation (e.g. rest and environment), not a complete health weighing competence.',
 'HB31 pig-eye dissection and handling disgust assess practical observation/emotional coping, not weighing health behaviour. Reject the health-target source pair.',
 'HB32 healthy-eating criteria and assessment of own eating explicitly support the health decision subset.',
 'HH19 process-area judgment standards support the general decision operator; technical contexts remain necessary and partial.',
 'MV16 evaluation of health/social consequences supports the biological health-decision process; not full topic coverage from generic method standards.',
 'NI87 complex arguments, for example smoking, directly support a health-decision variation.',
 'NI87 short-/long-term consequences for own/others actions align with temporal/social decision criteria.',
 'NRW24-25 movement/nutrition/respiration learning includes evaluating health behaviours; retained as topic-specific reviewed overlap.',
 'NRW37-38 immunity/drugs/stress include biological reasoning about health; several distinct source topics remain subsets of canonical health judgment.',
 'RP40 explicitly assesses activity/nutrition habits for health maintenance; concrete partial context.',
 'SH19 explicitly ties judgment and health/sexuality/addiction prevention to values; process context supports canonical health decisions.',
 'SL20 includes judging dental hygiene and health; digestion details are broader source content beyond the narrow action subset.',
 'SL20 nutrition rules/disease give information for weighing nutrition choices; no all-topic equivalence.',
 'SL20 explicitly evaluates own nutrition/movement for health, supporting a reasoned choice subset.',
 'SL36 assesses active/passive smoking consequences; direct health-action subset.',
 'SL37 evaluates exercise, food, sleep and smoking with heart/circulation context; direct health-action subset.',
 'SN13-15 criteria-guided evaluation and scientific reasoning support the canonical judgment operator; human-health content is supplied by local teaching units.',
 'ST6-8/11/17 evaluation structure and informed consequences support the health judgment operator; partial methodological evidence only.',
 'TH19 explicitly includes own-health decisions and multi-perspective evaluation; direct method/context support, not whole course approval.',
 'BY8 explicitly uses models to explain addiction and describe consequences; exact semantic match.',
 'BB32 lists fertilisation, embryonic development and birth; reviewed mapping covers human developmental subsets, not every pregnancy-risk criterion exactly.',
 'BE32 uses the same actual primary for fertilisation/development/birth as BB; separate jurisdiction binding with identical content acknowledged.',
 'BW19 development of pregnancy and external influences give a descriptive-risk subset.',
 'HE physical14/printed13 contains pregnancy, prenatal dangers and birth as topics. Current partial is honest; a bullet topic is not a verbatim complete competency sentence.',
 'NI80 human individual development including womb/puberty supports the mapped developmental subsets; not a full childbirth or media-judgment competency.',
 'BW21 hormones as messengers support physical puberty foundations; broader hormone unit is not fully covered by this puberty target.',
 'HE physical14 includes puberty changes and sex characteristics as topic bullets; partial avoids a forged exact operational equivalence.',
 'RP36 research on hormone effects gives a narrower method/foundation for describing bodily changes; not full puberty competence on its own.',
 'SL34 organs, gametes and cycle support bodily characteristics and reproductive foundations; distinguish organs present before puberty from later changes.',
 'BW19 describes fertilisation and embryo arising from a fertilised egg; human reproductive-process subset.',
 'HE physical14 covers conception/fertilisation and prenatal development; the current partial preserves topic evidence without a fictitious exact sentence.',
 'NI80 human sexual reproduction and gamete fusion directly support the conception subset.',
 'SL25-26 is seed-plant flowering, pollination, fertilisation and fruit/seeds. Gamete fusion is a shared principle, but this plant-specific target does not directly prove the human conception/prenatal competency. Reject the current direct human-target witness; any prerequisite/shared-principle relation needs its own honest scope.',
 'SL34 human intercourse, fertilisation and gamete path directly support the human conception subset.',
 'BY8 expressly distinguishes enjoyment/addiction for personal-risk awareness; exact match without a time-only clinical criterion.',
 'BW20 partnership includes heterosexual and same-sex relationships; supports respectful context, not every harassment-response performance.',
 'BY8 explicitly specifies medical/social/partner language and response to media harassment/violence/degrading language; exact match.',
 'RP36 requires technical instead of everyday sexual terminology; this is the language subset, not a complete consent/safety competence.',
 'SL34 discusses puberty, roles, orientations and relationship respect without prejudice; direct communication subset.'
]
assert len(SOURCE_NOTES)==97
unique=read(OUT/'reads/unique-whole-source-goals.json')
blocked_indices={16,55,59,90}
source_records=[]
for i,(s,note) in enumerate(zip(unique,SOURCE_NOTES)):
    g=s['wholeCurrentSourceGoal']; pairs=[]
    for b in s['bindings']:
        status='block' if i in blocked_indices else 'supported_in_stated_limited_scope'
        if i==2 and b['goalId'].startswith(('0e1065b9','773a297d','a6f57e17')): status='revise_locator_and_limit_scope'
        pairs.append(dict(b,independentDecision=status,reviewAuthority='ai_candidate'))
    source_records.append({'ordinal':i,'sourceGoalId':g['id'],
       'wholeSourceGoalRead':True,'actualPrimaryLocator':g['actualPrimaryLocator'],
       'actualPrimaryRead':True, 'judgment':note, 'targetPairs':pairs,
       'sourceTextFidelityDecision':'annotate_actual_operator_and_operationalisation' if i in {1,16} else 'reviewed_scope_with_original_text_retained',
       'doesNotApproveWholeCourse':True})
write('source186.FIRST.review.json', {
 'schemaVersion':1,'createdAt':NOW,'reviewer':ROLE,'reviewPass':'first_pass','blindToOtherReviews':True,
 'actualCurrentWitnessInput':binding(PREP/'sources/current186-whole-direct-witnesses-and-selected-actual-primaries.neutral.json'),
 'wholeUniqueSourceGoalCount':97,'actualTargetPairCount':sum(len(r['targetPairs']) for r in source_records),
 'actualPrimaryReadIndex':binding(OUT/'reads/actual-source-read-index.json'),
 'records':source_records,'sourceClosureDecision':'blocked_until_targeted_resolution',
 'blockedPairs':sum(p['independentDecision']=='block' for r in source_records for p in r['targetPairs']),
 'locatorScopeRevisions':sum(p['independentDecision']=='revise_locator_and_limit_scope' for r in source_records for p in r['targetPairs']),
 'rawSourceFidelityRevisions':2,'wholeCourseSourceApproval':False,'humanApproved':0,'strictGain':0})

before=read(PREP/'native/current394-before.actual-normal-model.json')
after=read(PREP/'native/current394-after.actual-normal-model.json')
bp={x['goalId']:x for x in before['pages']};ap={x['goalId']:x for x in after['pages']}
protected=read(PREP/'inputs/current353-protected.ids.json')['current353']
altered=[k for k in bp if bp[k]!=ap[k]]
assert set(altered)==set(sg)
assert all(bp[k]==ap[k] for k in protected)
normal_p=[json.loads(x) for x in (PREP/'positive/twelve-current-raster.P.pending.review.jsonl').read_text().splitlines() if x.strip()]
assert all(r['profile']==sg[r['goalId']]['profile'] for r in normal_p)
write('native-current353-preservation.FIRST.receipt.json', {
 'schemaVersion':1,'createdAt':NOW,'reviewer':ROLE,
 'beforeWholeModel':binding(PREP/'native/current394-before.actual-normal-model.json'),
 'afterWholeModel':binding(PREP/'native/current394-after.actual-normal-model.json'),
 'wholePageCount':394, 'actualChangedPageIds':altered,
 'protectedIdInput':binding(PREP/'inputs/current353-protected.ids.json'),
 'independentlyComparedProtectedWholePages':len(protected),'all353WholePagesExact':True,
 'otherWholePagesExact':len(bp)-len(altered), 'alteredKeysByGoal':{k:[f for f in bp[k] if bp[k][f]!=ap[k][f]] for k in altered},
 'PProfilesEqualActuallyReadScienceProfiles':True,
 'actualNativeHtml':binding(PREP/'native/twelve-current-native/bundle/book.html'),
 'actualNativePdf':binding(PREP/'native/twelve-current-native/bundle/book.pdf'),
 'actualNativeModel':binding(PREP/'native/twelve-current-native/bundle/book-model.json'),
 'physicalPdfCoverAndNavigationViewed':[binding(OUT/'reads/native-cover-01.png'),binding(OUT/'reads/native-cover-02.png')],
 'nativeWholePhysicalPdfPageCountActuallyViewed':14,
 'coverAndNavigationJudgment':'Cover and navigation are readable, count 12 goals and distinguish navigation grouping from didactic ordering. Cover and contents do not certify a goal or human approval.',
 'judgment':'The actual native twelve-page rendering is coherent and protected source pages are preserved. The one visibly misleading raster still blocks its material closure; model equality is only preservation evidence.',
 'humanApproved':0,'humanApproval':False,'strictGain':0})

write('medical-actual-primary.FIRST.receipt.json', {
 'schemaVersion':1,'createdAt':NOW,'reviewer':ROLE,'actualExternalLookup':True,
 'role':'Factual educational material verification only; no clinical learner advice or clinical acceptance.',
 'sources':[
   {'url':'https://www.who.int/news-room/fact-sheets/detail/sexually-transmitted-infections-(stis)', 'title':'WHO sexually transmitted infections fact sheet', 'accessed':'2026-10-10',
    'verifiedEducationalClaims':'STIs may be asymptomatic; routes and measures vary. Condoms reduce risk without universal coverage; HPV/hepatitis-B vaccines address particular pathogens. This supports the material limits, not an individual diagnosis.'},
   {'url':'https://www.cdc.gov/fasd/about/index.html','title':'CDC about fetal alcohol spectrum disorders','accessed':'2026-10-10',
    'verifiedEducationalClaims':'No established safe pregnancy alcohol amount or period; prevention remains useful after earlier exposure. A past exposure does not determine a certain individual outcome.'},
   {'url':'https://www.cdc.gov/medicine-and-pregnancy/about/index.html','title':'CDC medicine and pregnancy overview','accessed':'2026-10-10',
    'verifiedEducationalClaims':'Starting or stopping pregnancy medication requires professional discussion; for some conditions stopping can itself cause harm. Material correctly avoids independent stopping.'},
   {'url':'https://www.who.int/news-room/questions-and-answers/item/addictive-behaviours-gaming-disorder','title':'WHO addictive behaviours: gaming disorder','accessed':'2026-10-10',
    'verifiedEducationalClaims':'Control, priority, persistence despite consequences and impairment matter; clock time alone does not establish diagnosis. The school cases make no clinical diagnosis.'}
 ],'humanApproved':0,'actualClinicalTrial':False})

findings='''# Independent B FIRST findings\n\nThis is an independently authored AI candidate review, sealed before reading any other reviewer, root findings, resolutions or operation plan. Human approval/trial and strict gain are zero.\n\n## Required targeted resolutions\n\n1. **V: 6add2bde-b647-577d-a899-6fd62497656a.** Actual original, 360 and 680 rasters assign hearts to glamour images and red crosses/trash to other body/face images, including acne. The visual may devalue real bodies, contradicting the dignity/media-critical goal and its correct P text. The caption cannot cure this. Replace or correct this raster so criticism visibly targets pressure, message or editing rather than a real body; then review the exact replacement and affected native page. Other eleven rasters were actually viewed and can stay.\n2. **SOURCE: four unsupported direct pairs.** HB mitosis/meiosis 057 → puberty-development 3c0f5267; HB disgust-reflection 037 → health-weighing 6de6ad3b; HB pig-eye/disgust 052 → health-weighing 6de6ad3b; SL seed-plant flowers/fertilisation 003 → human reproduction/prenatal a6f2bcaf. Scope them out or supply genuinely applicable normative evidence; preserve historical originals. A shared gamete-fusion principle could be modeled honestly as a foundation, but does not establish the human target's direct curricular scope.\n3. **SOURCE: HH locator/scope.** The selected HH27/28 locate sexuality but not drug/nervous-system effects. Actual HH24 contains drug-effects communication. Correct the locator and explicitly limit the three addiction mappings to the supported subset; this does not create a complete life-skills or enjoyment/addiction source competence.\n4. **SOURCE fidelity: HB051 and HB057.** The prepared raw/source text strengthens or changes actual primary operators: naming drug effects/prevention becomes explaining/deriving; describing cell division for genetic-information transmission becomes distinguishing mitosis/meiosis for growth/reproduction. Preserve history and label current source text as operationalization with truthful actual-primary operator/context; do not represent the paraphrase as a literal official competency bullet.\n\n## Substantive outcome\n\nTwelve independently authored normal D records, with six DE/EN understanding fields each, keep the descriptions. Twelve profiles/36 expectations and all 24 DE/EN cases were read in full. Their textual tasks/solutions and their integrated atomicity are sound candidates; all twelve M judgments are no_memory_needed with individual reasons.\n\nP coverage combines the supplied cases. Pregnancy/birth case 2 does not independently demonstrate childbirth stages; physical-puberty case 2 does not independently demonstrate primary/secondary classification; reproduction case 1 does not independently demonstrate prenatal exchange and case 2 does not independently demonstrate fertilisation location. This does not require an arbitrary extra-task quota: mastery must use evidence for every required aspect, not a completed case label. The blanket understandingFocus text must not be used as proof that each case assesses every expectation.\n\nAll twelve full HTML and PDF goal pages plus physical PDF cover/navigation were actually viewed. No clipping/layout issue was found; the image defect affects the corresponding page's meaning. Independent whole-model comparison confirms all 353 protected pages and the other 382 pages unchanged. This preservation check is not substantive approval.\n\nSealed receipts contain per-goal P/A/M/V/native judgments and per-source judgments for all 97 unique whole source goals and 186 current target pairs. Partial/reviewed mappings stay limited to actual overlap and never approve an entire state course.\n'''
fp=OUT/'FIRST.findings.md'
if fp.exists(): raise RuntimeError('No overwrite')
fp.write_text(findings)

inputs=[PREP/'neutral-current353-native-twelve-health.entry.json',PREP/'FINAL.current353-normal-P12-native12-source186.technical.freeze.json',
 AUTHOR/'science/twelve-whole-profiles-and-twenty-four-cases.author.json',
 PREP/'native/twelve-current-native/round-b/description-review-input.json',PREP/'native/twelve-current-native/round-b/description-review-campaign.json',
 PREP/'positive/twelve-current-raster.P.pending.review.jsonl',PREP/'sources/current186-whole-direct-witnesses-and-selected-actual-primaries.neutral.json',
 PREP/'inputs/twelve-current-raster-bindings.neutral.json']
assert sha(inputs[0])=='sha256:d4d3ec1aac63a9a3d817ebf239c91b091ee48ab837c143afa14afc392a946c16'
assert sha(inputs[1])=='sha256:6948f70567417aebc18593e0cc35f5087aba07631ec5a373fb9b569a7120bbd1'
own=[p for p in sorted(OUT.rglob('*')) if p.is_file() and p.name!='FIRST.seal.json']
seal=write('FIRST.seal.json', {
 'schemaVersion':1,'createdAt':NOW,'reviewer':ROLE,'reviewPass':'first_pass','runId':RUN,
 'status':'sealed_independent_ai_candidate_with_targeted_findings','blindToOtherReviewsAtSeal':True,
 'independenceStatement':'Own FIRST was sealed before any other independent A/B judgment, root findings, resolutions or technical operation plan was read. Author expectations, actual primary documents and empty neutral normal campaign inputs were inputs only.',
 'inputBindings':[binding(p) for p in inputs], 'ownSealedArtifacts':[binding(p) for p in own],
 'humanApproval':False,'humanApproved':0,'humanTrial':False,'actualLearnerEvidence':False,'strictGain':0,
 'DRecords':12,'wholeProfiles':12,'expectations':36,'wholeDeEnCases':24,
 'original360680ActuallyViewed':36,'goalHtmlPagesActuallyViewed':12,'physicalPdfPagesActuallyViewed':14,
 'wholeUniqueSourceGoalsActuallyRead':97,'currentTargetPairsReviewed':186,'actualPrimaryDocumentsBound':17,
 'VKeep':11,'VBlocked':1,'sourceBlockedDirectPairs':4,'HHLocatorScopeRevisions':3,
 'protected353Exact':True,'other382Exact':True,
 'activeIntegration':False,'wholeCourseSourceApproval':False,
 'nextAction':'Wait for targeted successor inputs; preserve this FIRST and all historical input bytes.'})
print(json.dumps({'seal':str(seal),'sha256':sha(seal),'ownArtifactCount':len(own),'DRecords':len(records),'sourcePairs':sum(len(r['targetPairs']) for r in source_records)},ensure_ascii=False))
