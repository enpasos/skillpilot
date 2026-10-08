# SPDX-License-Identifier: Apache-2.0
"""Record genuinely observed frozen science, raster and complete-page review B.

No active curriculum writes. Hashes bind the actual reviewed material and never
substitute for the goal-specific substantive observations recorded below.
"""
import copy
import hashlib
import json
import re
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
AUTHOR = OWN.parent / 'biologie-he9-eighteen-final-raster-native-author-root-20261008-v1'
SCIENCE_AUTHOR = OWN.parent / 'biologie-he9-nineteen-current391-science-author-root-v1'
SOURCE_EXTRACT = ROOT / 'curricula/DE/Gymnasium/input/HE/lower-secondary/source-extraction/DE_HE_BIOLOGIE_SEKI_G9.source-extraction.json'
SOURCE_PDF = Path('/tmp/he9-independent-a-primary-angh7cme/g9-biologie.pdf')

def read(p): return json.loads(p.read_text())
def rows(p): return [json.loads(s) for s in p.read_text().splitlines() if s.strip()]
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p): return {'path': str(p.relative_to(ROOT)), 'sha256': sha(p), 'bytes': p.stat().st_size}
def write(p, value):
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open('x') as stream: stream.write(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
def norm(s): return re.sub(r'[\s\-\u00ad\u2010\u2011]+', '', s)

# These independent observations were written after reading every full bilingual
# case, whole original curricular section and actual original/width/native page.
SCIENCE = {
1: 'Ganzer Augen- ODER ganzer Ohrweg ist zulässige Wahl: die beiden Augenfälle verlangen räumliche Anordnung und Korrektur vertauschter Iris/Netzhaut sowie Pupille als Öffnung, keine schwarze Gewebescheibe. Die zwei getrennt konditionalen Ohrfälle sichern vollständiges Außen-/Mittel-/Innenohr mit Trommelfell, Gehörknöchelchen, Cochlea und Hörnerv; Bogengänge gehören zur Gleichgewichtsfunktion. Gemeinsamer Organ-Modell-Zusammenhang bleibt Pflicht, Teile aus beiden Wegen ersetzen keine vollständige Organleistung. Die ganze HE9.1-Quelle nennt ausdrücklich Auge oder Ohr; kein zusätzlicher Zwang zu beiden.',
2: 'Die ganze physikalisch-biologische Verständniskette unterscheidet optisch invertiertes Netzhautbild, Rezeptor-Reizumwandlung und zentrale Verarbeitung; kein innerer Betrachter sieht zwangsläufig kopfstehend. Iris regelt Lichteinfall, Akkommodation die Brechkraft bei fester Netzhautposition. Der konditionale vollständige Ohrweg trennt mechanische Übertragung von Haarzelltransduktion, Nervensignal und Wahrnehmung; A-Ausfall mechanisch, B-Ausfall Transduktion sind begrenzte Gedankenmodelle, keine Patientendiagnose. Zwei Fälle pro gewählt ganzem Weg und die gemeinsame Modellgrenze sind operativ erhalten.',
3: 'Fingerrezeptor, sensorische Bahn, Rückenmarksverschaltung, motorische Bahn und Muskel werden richtig verknüpft; der parallele aufsteigende Weg zum Gehirn steht einer lokalen Reflexverschaltung nicht entgegen. Der Ampelfall benötigt die zentrale Verarbeitung einschließlich erlernter Regeln und Situation; ein direkter Auge-Muskel-Pfeil reicht nicht. Signal wird nicht als unverändert durchlaufender äußerer Reiz verstanden, und nicht jede Reaktion muss zuerst bewusste Gehirnverarbeitung durchlaufen.',
4: 'Die begrenzten gegebenen Empfindlichkeitsfenster erlauben Unterschiede von Mensch und untersuchter Bienenart, keine Universalbehauptung über alle Insekten oder exakte subjektive Farben. Der Hund-Hörfall gibt tatsächlich gleichen äußeren Schalldruckpegel, ausdrücklich keine gleiche subjektive Lautheit;25kHz-Zugang ist modellbezogen und nicht pauschal bessere Wahrnehmung. Keine eigenen Messungen oder aus dem Bild abgeleitete tatsächliche Tiererfahrung werden behauptet.',
5: 'Beide ganzen Vignetten verbinden Schutz mit dem ganzen Reizweg: Dauer/intensiver Schall kann Rezeptoren gefährden; Augenschutz und geeigneter UV-Schutz adressieren andere Expositionen. Alkohol beziehungsweise andere psychoaktive Substanzen können zentrale Verarbeitung trotz äußerlich intakter Hornhaut oder Trommelfell beeinträchtigen. Begründete Maßnahmen werden abgefragt; weder schädlicher Selbstversuch noch sichere Dosis oder private Konsumdaten werden vorausgesetzt.',
6: 'Reife menschliche Erythrozyten sind kernlose Scheiben, Leukozyten größere verschiedenartige kernhaltige Zellen, Thrombozyten Zellfragmente und Plasma die Flüssigkeitsphase. Der ganze Zentrifugationsfall enthält einen Gerinnungshemmer: unten Erythrozyten, dünner heller Saum Leukozyten/Thrombozyten, oben Plasma, nicht reines Wasser und nicht Serum. Beide Ansichten sind synthetische Modelle, keine echte Probe oder individuelle Diagnose.',
7: 'Sauerstofftransport über Hämoglobin, weitere gelöste Transporte im Plasma, Thrombozyten/Fibrin-Gerinnung und Immunabwehr durch Zellen und Faktoren werden unterschieden und zusammengeführt. Die korrigierte A-Materialfassung schließt Leukozyten, Thrombozyten und funktionsfähige Gerinnungsproteine ausdrücklich aus; daraus folgen die begrenzten Funktionsdefizite. B ohne Erythrozyten hat stark eingeschränkte Hämoglobintransportkapazität, nicht überhaupt keinen gelösten Sauerstoff. Keine Komponente ersetzt alle Blutleistungen und kein Transfusionsversuch ist durchgeführt.',
8: 'Das vollständige Modell ist ausdrücklich Erythrozytenkonzentrat und kein Vollblut oder Plasma: A-RhD-negativer Empfänger mit Anti-B versus A-negativ/B-negativ/A-positiv erlaubt spezifische AB0- und RhD-Begründung. Anti-D ist nicht automatisch angeboren vorhanden. Anti-A-/Anti-D-positive, Anti-B-negative Typisierung ergibt A RhD-positiv. Andere Systeme und Kreuzprobe fehlen bewusst; die Schulantwort darf keine klinische Verträglichkeitsfreigabe oder Plasma-Regel ableiten.',
9: 'Die vollständige Infektionskette verbindet Phagozytose, passend aktivierte Lymphozyten, Antikörper und Gedächtnis, ohne jedes Immunverhalten nur einer Zelle zuzuschreiben. Das fremde Transplantat wird anhand seiner Gewebemerkmale erkannt und ist kein Krankheitserreger; T-Zell-Reaktion und Immunsuppression mit erhöhtem Infektionsrisiko sind korrekt gegenübergestellt. Modelle ersetzen weder Patientenbeobachtung noch eigenständige Medikamentenänderung.',
10: 'HIV-Infektion ist von fortgeschrittenem AIDS-Stadium getrennt; Vermehrung in CD4-T-Zellen und wirksame antiretrovirale Hemmung bedeuten keine pauschale Virusentfernung. Die zweite vollständige Vignette unterscheidet gewöhnlichen Alltagskontakt von relevanten Expositionen. Dauerhaft nicht nachweisbare Viruslast unter wirksamer Therapie wird präzise auf keine sexuelle Übertragung begrenzt; WHO-Primärpolicy unterstützt genau diese Bedingung, keine blanket Aussage für andere Expositionen. Würde und nicht stigmatisierende Prävention sind erhalten.',
11: 'Estradiol/Follikelphase, LH-Signal vor Ovulation, progesteronbildender Gelbkörper und fallende Ovarialhormone ohne Schwangerschaft bilden eine sachgerechte qualitative Folge. Weder universelle28Tage noch persönliche Kalendervorhersage werden behauptet. Der ganze Pubertätsfall verbindet Hypothalamus, Hypophyse, Gonaden, Transport und Rezeptor-Zielwirkung bei variablen Entwicklungsverläufen; Hormone wirken nicht nur am Bildungsort und erklären nicht allein alle psychosozialen Veränderungen.',
13: 'Die beiden nicht expliziten Vignetten betreffen Erwachsene und erfordern eine differenzierte soziale/ethische Diskussion: aktuelle freiwillige Zustimmung, Grenzen, Gesundheit, Privatsphäre, Lebensform und Verantwortung. Frühere Zustimmung erlaubt keinen aktuellen Zwang; Gruppennormen rechtfertigen weder Abwertung noch Weitergabe privater Bilder ohne Zustimmung. Biologisches Wissen ersetzt keine ethische Begründung und keine private sexuelle Selbstauskunft wird verlangt.',
14: 'Das vereinfachte TSH-Thyroxin-Modell hat gerichtete Stimulation und hemmende Rückkopplung; sinkendes Thyroxin vermindert Hemmung und kann TSH erhöhen. Der Vergleich mit zwei stimulierenden Beziehungen unterscheidet negative von positiver Rückkopplung, ohne jeden Hormonablauf universell negativ zu nennen. Ausgelassener Hypothalamus ist explizite Modellgrenze. Die ganze HE9.3-Quelle führt Regelkreismodell fakultativ; daraus folgt keine neue universelle Pflicht oder Übernahme einer sachlich problematischen Nebendrüsen-Insulin-Gleichsetzung aus der alten Quellentabelle.',
15: 'Eine Replikation vor mitotischer Teilung versus eine Replikation vor zwei meiotischen Teilungen; Mitose erhält den Satz, Meiose I trennt Homologe und II Schwesterchromatiden.2n=4 führt zu mitotisch2n=4 beziehungsweise haploidn=2; das geänderte2n=6-Modell verlangtn=3 und Korrektur der falschen Teilungszuordnung. Vier haploide Produkte sind nicht automatisch vier gleichwertige menschliche Eizellen; die ganze Antwort bewahrt diese Oogenesegrenze. Befruchtung stellt den diploiden Satz wieder her.',
16: 'Die beiden vollständigen synthetischen Ein-Locus-Pflanzenfälle liefern Aa×aa mit erwartetem1:1-Phänotypverhältnis sowie AA×aa, F1-Aa und anschließendes Aa×Aa mit1:2:1-Genotyp/3:1-Phänotypverhältnis unter vollständiger Dominanz. Allelweitergabe, Genotyp und Phänotyp bleiben getrennt; rezessives Allel bleibt in Heterozygoten erhalten. Erwartung ist keine garantierte kleine Nachkommenzahl, Dominanz kein Werturteil. Die alte Quellenbeispielidee Zungenrollen wird ausdrücklich nicht als monogener Menschenbefund übernommen.',
17: 'Im ausdrücklich vollständig ausgeprägten autosomal-rezessiven Modell erzwingt betroffenes aa-Kind unauffällige ElternAa/Aa; unauffälliges Geschwister bleibtAA oderAa.25Prozent je neuer Konzeption bedeutet keine Festlegung durch vorherige Kinder. Der ganze dominante Gegenfall ergibtDd- versusdd-Eltern und50Prozent im Modell. Vollständige Ausprägung, keine Neumutation und keine realen Familieninformationen sind benannt; Wahrscheinlichkeit ist keine Diagnose oder persönliche Bewertung.',
18: 'Geordnetes synthetisches Karyogramm mit zweiX und dreiChromosomen21 ergibt47 und Trisomie21, nicht Verwechslung mit drei Schwesterchromatiden.22Autosomalpaare plus einX ergibt45; eine kleine DNA-Sequenzänderung bei unveränderter Zahl ist davon verschieden und unter Umständen in der Karyogrammauflösung nicht sichtbar. NHGRI-Primärdefinition bestätigt Anordnung/Kopie/Zahl und Grenzen. Keine vollständige Aussage zu Gesundheit, Fähigkeiten oder Wert einer Person wird aus dem Modell abgeleitet.',
19: 'Beide vollständigen Fälle selbst sind fachlich korrekt für Gen-/Gentechnologie: Gentest amplifiziert und vergleicht ausgewählte DNA; somatische Gentherapie überträgt eine funktionelle Genkopie in bestimmte Körperzellen; DNA-Klonierung vervielfältigt ausgewählte DNA in Wirtszellen, keine ganze Person. Rekombinante Insulinproduktion nutzt intronfreie codierende DNA und passende Vektorsteuerung; Proteinverabreichung ist keine Gentherapie des Empfängers und keine Genübertragung. ABER die tatsächlich aktuelle EN-Beschreibung biotech­nology methods umfasst zusätzlich nicht gentechnische Biotechnologie. Die aktuellen zwei Fälle decken diese Erweiterung nicht ab; voller aktueller D/P-Abschluss bleibt bis echter bilingualer Korrektur HOLD. Keine angenommene zukünftige Korrektur freigegeben.'
}
VISUAL = {
1: 'Augenschnitt: vordere Hornhaut/Iris mit echter Öffnung, Linse vor Glaskörper, hintere Netzhaut und abgehender Sehnerv sind schlüssig angeordnet; Linse/Netzhaut/Sehnerv-Leader zugeordnet. Vereinfachung ist kein vollständiger histologischer Schichtatlas. Auge ist erlaubtes Wahlbeispiel, keine Verdrängung des konditionalen Ohrwegs. Hauptstrukturen und Labels bei360/680 erkennbar.',
2: 'Oberer Punkt eines aufrechten Gegenstandes wird durch Pupille/Linse auf die untere Netzhautseite geführt; kleines invertiertes Bild und Licht-zu-Signal-Inset passen zur qualitativen Kette. Kein innerer Mensch betrachtet ein umgedrehtes Bild. Kein vollständiges quantitatives Strahlendiagramm wird behauptet. Richtungen und Hauptüberschriften bei360/680 erkennbar.',
3: 'Ampel/Auge, Gehirn und Beinmuskel verbinden Reizaufnahme, zentrale Verarbeitung und Reaktion; kein direkter Auge-Muskel-Bypass. Die Verkehrsvignette ist didaktisches Signalbeispiel, keine konkrete Handlungsregel einer Fahrzeugampel für einen realen Fußgänger. Drei Hauptmotive und Signalrichtung bei360/680 erkennbar.',
4: 'Mensch-Blütenansicht und Bienen-UV-Muster sind klar getrennt und ausdrücklich Modell genannt; violette Färbung wird nicht als exakte subjektive Bienenfarbfotografie ausgegeben. Große Empfindlichkeitsmotive bleiben in360/680 sichtbar, freundliche abstrakte Darstellung.',
5: 'Person trägt tatsächlichen Augenschutz; niedriger Lautstärkeregler und Gehörschutz sind getrennte Schutzmotive. Gehirndarstellungen und Verbotssymbol illustrieren Verarbeitungseinfluss ohne tatsächlichen Drogenversuch oder behauptete Wellenmessung. Hauptrelation Schutz/Reizverarbeitung in360/680 sichtbar.',
6: 'Kernlose bikonkave Erythrozyten, größere kernhaltige Leukozyte, kleine unregelmäßige Thrombozyten und Plasma sind visuell verschieden. Beschriftungspfeile treffen passende Elemente. Röhrchen ist schematischer Rahmen, keine echte Blutprobe. Hauptformen und kurze Labels bei360/680 erkennbar.',
7: 'Drei klar getrennte Transport/Gerinnung/Abwehr-Motive: Erythrozyten mit O2-Symbolen, Thrombozytenaggregat mit Netz über Gefäßverletzung und kernhaltige Abwehrzelle mit Bakterien. O2-Symbole sind Lehrsymbole, keine frei schwebende Haupttransportbehauptung. Fibrinnetz und drei Hauptfunktionen bleiben360/680 erkennbar.',
8: 'Anti-B-Symbole bleiben an A-Zellen ohne passende Antigene ungebunden; an B-Oberflächen verbinden passende Antikörper zwei Zellen. Gezeichnete Kreuzvernetzung entspricht Agglutination und behauptet keine komplette Transfusionsfreigabe. Kein automatisches Anti-D-Schema. A/B-Motive und Antigenbindung bei360/680 sichtbar.',
9: 'Links phagozytäre Infektionsabwehr und Lymphozyte, rechts fremdes Gewebemerkmal am Transplantat und passende Immunerkennung: Organ wird nicht als Bakterium dargestellt. Gesichter sind erkennbare Comicmetapher. Zwei Kontexte und Erkennung bleiben bei360/680 verständlich.',
10: 'HIV-Piktogramm, CD4-Zielzelle und schematische Vermehrung/therapeutische Abschirmung sind kohärent; infizierte Zelle bleibt erhalten, kein universeller Heilungs- oder Eliminationspfeil. Vereinfachung bildet keinen vollständigen molekularen Replikationszyklus ab und behauptet ihn nicht. Hauptmotive bei360/680 sichtbar; nicht stigmatisierende neutrale Darstellung.',
11: 'Follikel, separat freigesetzte Eizelle bei LH und aus Follikelrest gebildeter Gelbkörper sind richtig getrennt; die Eizelle selbst wird nicht in einen Gelbkörper verwandelt. Qualitative Folge ohne universelles28-Tage-Raster. Drei Hauptschritte bleiben360/680 gut zu erkennen.',
13: 'Zwei voll bekleidete Personen, sichtbares Nein/Stopp und respektierter Abstand stellen freiwillige Grenzen ohne Sexualexplizitheit oder Zwang dar. Kleine Schilder sind Zusatzorientierung; Hauptstoppzeichen und Relation bleiben360/680 sichtbar. Keine privaten realen Personen oder Bildfreigabe dargestellt.',
14: 'Pituitäres TSH stimuliert schematische Schilddrüse; T4-Rückweg endet als hemmender Querbalken am Hypophysenbeispiel. Richtung und Vorzeichen stimmen; keine menschliche Schilddrüse am falschen Kopfbereich. Vereinfachung des vollständigen Regelkreises ist ausdrücklich im P-Modell benannt. TSH/T4 und Hemmung360/680 erkennbar.',
15: '2n=4-Ausgangszelle, zwei mitotische diploide Töchter versus zwei meiotische Verzweigungen mit viern=2-Produkten sind visuell schlüssig; Zahl und Homolog-/Chromatidenzustand passen. Das symmetrische Gametenbeispiel ist kein universeller Ablauf menschlicher Oogenese; ganze P-Antwort verneint vier gleichwertige Eizellen. Bei360 sind die zentrale2-versus4-Verzweigung und2n/n-Zahlen sichtbar; feinere Schrittwörter sind klein,680/native klarer.',
16: 'Aa×Aa mit A/a-Gameten ergibt korrektAA,Aa,Aa,aa; dominante violette versus rezessive weiße Blüte ist unter Modellannahmen richtig. Das Bild ist ein möglicher Kombinationsraum, keine garantierte Folge von vier Kindern. Großes Kreuzungsquadrat bleibt360/680 lesbar, keine menschliche Zungenrollenbehauptung.',
17: 'Unauffällige Aa-Eltern als Quadrat/Kreis, betroffenes aa-Kind und unauffälligesAA/Aa-Geschwister passen zum rezessiven Modell. Unsicherer Genotyp des Unauffälligen wird nicht als sicherer Träger ausgegeben. Modellfamilie ausdrücklich benannt, Legende unterscheidbar, keine echte Familiengeschichte. Hauptverbindungen/Genotypen360/680 erkennbar.',
18: 'Zwei versus drei Chromosomen21 sind getrennt gezählt; X-Form steht für jeweils ein repliziertes Chromosom und wird nicht als zwei Kopien gezählt. Hintergrundausschnitt ist ausdrücklich Ausschnitt, keine vollständige diagnostische Karyogrammanalyse. Bei360 sind Hauptzahl2/3 und Formen erkennbar; kleine Hintergrundtabelle ist Detail,680/native deutlicher.',
19: 'Gentest ausgewählter DNA, funktionelle Genkopie in Zielzelle und Klonierung eines DNA-Fragments in Trägerzellen sind visuell getrennt; keine ganze Person geklont, keine Proteinverabreichung als Gentherapie. Tatsächliches PNG bleibt fachlich KEEP unabhängig vom EN-Text-HOLD. Bei360 sind die drei Haupttitel, DNA-Markierung, Zielzelle und drei Trägerzellen sichtbar; kleine Zusatzwörter sind nicht komfortable Pflichtlektüre,680/native deutlicher.'
}

entry = read(AUTHOR / 'neutral-eighteen-actual-raster-native-independent-review.entry.json')
freeze_path = ROOT / entry['authorInputFreezePath']
assert sha(freeze_path) == entry['authorInputFreezeSha256']
for b in read(freeze_path)['frozenFiles']: assert bind(ROOT / b['path']) == b
images = read(ROOT / entry['actualPNGSelectionManifest'])['images']
whole = {g['id']: g for g in read(ROOT / entry['wholeGoalBodiesPath'])['goals']}
before = {g['id']: g for g in read(AUTHOR / 'candidate/canonical.before-eighteen-links.exact.json')['goals']}
future = {g['id']: g for g in read(AUTHOR / 'candidate/canonical.current474-eighteen-new-raster-author.json')['goals']}
cases = {g['goalId']: g for g in read(ROOT / entry['operativeWholeCasesJson'])['goals']}
positive = {g['goalId']: g for g in rows(ROOT / entry['operativeNativeP18'])}
campaign_dir = ROOT / entry['roundB']
actual = read(campaign_dir / 'description-review-input.json')
campaign = read(campaign_dir / 'description-review-campaign.json')
bundle = read(campaign_dir / 'review-bundle-manifest.json')
page_inputs = {g['goalId']: g for g in actual['goals']}
physical = {g['goalId']: g for g in entry['nativePhysicalGoalPages']}
assert len(images) == len(whole) == len(positive) == len(physical) == 18
assert set(SCIENCE) == set(VISUAL) == {r['ordinal'] for r in images}
assert sum(len(g['cases']) for g in cases.values()) == 40
pdf_text = subprocess.check_output(['pdftotext', '-layout', str(ROOT / entry['operativeNativePDF']), '-'], text=True)
with (OWN / 'actual-native-pdf-whole-text.independent-b.txt').open('x') as stream: stream.write(pdf_text)
pdf_pages = pdf_text.split('\f'); assert len([p for p in pdf_pages if p.strip()]) == 20
assert sha(SOURCE_PDF) == entry['wholePrimarySha256']
am_seal = ROOT / entry['retainedAMSeal']
for b in read(am_seal)['files']: assert bind(ROOT / b['path']) == b
source_by_id = {g['id']: g for g in read(SOURCE_EXTRACT)['sourceGoals']}
observed = []; science_rows = []; total_case_bindings = 0
for image in images:
    gid = image['goalId']; ordinal = image['ordinal']; g = whole[gid]
    assert g == before[gid]
    permitted = copy.deepcopy(g); permitted['resourceLinks'] = future[gid]['resourceLinks']; assert permitted == future[gid]
    source_id = g['extendedData']['provenance']['sourceGoalId']; source = source_by_id[source_id]
    p = positive[gid]; profile = p['profile']; briefs = profile['applicationCaseBriefs']
    assert len(briefs) == len(cases[gid]['cases'])
    for case, brief in zip(cases[gid]['cases'], briefs, strict=True):
        assert case['id'] == brief['id']
        for lang, suffix in [('de', 'De'), ('en', 'En')]:
            assert brief['taskDemand' + suffix] == case['material'][lang] + ' ' + case['task'][lang]
            assert brief['expectedPerformance' + suffix] == case['modelAnswer'][lang]
        total_case_bindings += 1
    gi = page_inputs[gid]; page = gi['reviewContext']['page']; physical_page = physical[gid]['physicalPage']
    text = pdf_pages[physical_page - 1]
    assert page['title'] == g['title'] and page['description'] == g['description']
    assert norm(g['title']) in norm(text) and norm(g['description']) in norm(text)
    assert re.search(r'Lernziel-ID\s+' + re.escape(gid), text)
    assert len(re.findall(r'Lernziel-ID\s+[a-f0-9-]{36}', text)) == 1
    assert gi['currentTitleEn'] == g['titleEn'] and gi['currentDescriptionEn'] == g['descriptionEn']
    assert page['visualization']['originalDigest'] == 'sha256:' + image['sha256']
    assert page['visualization']['altText'] == image['altDe']
    assert set(r['goalId'] for r in page['requires'] + page['externalPrerequisites']) == set(g['requires'])
    capt_path = ROOT / entry['actualWidthCaptureDirectory'] / gid / 'chromium-captures.actual.json'
    caps = read(capt_path)
    assert caps['sourcePath'] == image['path'] and caps['sourceSha256'] == image['sha256']
    assert [r['width'] for r in caps['captures']] == [360, 680]
    assert all(r['measured']['objectFit'] == 'contain' and r['measured']['renderedWidth'] == r['width'] for r in caps['captures'])
    for b in caps['captures']: assert sha(ROOT / b['path']) == b['sha256']
    native_png = ROOT / entry['actualNativePageCaptureDirectory'] / f'goal-page-{physical_page:02d}.png'
    observed.append({'ordinal': ordinal, 'goalId': gid, 'machineCandidateDecision': 'KEEP', 'scientificAndVisualVerdict': 'PASS',
        'actualObservedFullRaster': bind(ROOT / image['path']), 'actualObservedChromium360680': [bind(ROOT / c['path']) for c in caps['captures']],
        'actualObservedNativePdfPage': {'physicalPage': physical_page, 'capture': bind(native_png), 'wholePdf': bind(ROOT / entry['operativeNativePDF'])},
        'substantiveActualObservationsDe': VISUAL[ordinal], 'nativePageObservation': 'Actual complete physical native PDF page inspected: full current DE description, title/ID, PNG, breadcrumbs, applicability and prerequisite/successor context without clipping or overlap. Logical goal-page number has two introductory physical pages before it.',
        'nativePageFingerprint': gi['pageFingerprint'], 'goalFingerprint': gi['goalFingerprint'], 'sourceGoalId': source_id, 'sourceRef': g['sourceRef'],
        'provenance': {'provider': image['provider'], 'servingModel': image['servingModel'], 'prompt': bind(ROOT / image['promptPath']), 'actualToolReceipt': bind(ROOT / image['toolProvenancePath'])},
        'imageAndAltCorrespond': True, 'formatDecision': 'KEEP friendly clear comic PNG1672x941 approximately16:9 after actual visual review.',
        'widthScope': 'Actual Chromium element screenshots at360/680; no physical handset or full-app acceptance claim. Small supplemental inscriptions are not represented as comfortably readable mandatory text.',
        'humanApproval': False, 'humanTrial': False})
    science_rows.append({'ordinal': ordinal, 'goalId': gid, 'wholeCurrentGoal': bind(ROOT / entry['wholeGoalBodiesPath']),
        'currentTitleDe': g['title'], 'currentTitleEn': g['titleEn'], 'currentDescriptionDe': g['description'], 'currentDescriptionEn': g['descriptionEn'],
        'currentDescriptionDecision': 'REVISE_HOLD' if ordinal == 19 else 'KEEP', 'wholeCurrentPositiveCoverageVerdict': 'HOLD_EN_SCOPE' if ordinal == 19 else 'PASS_SCOPED_E1_G1',
        'wholeCaseScienceVerdict': 'PASS for all actually supplied bounded model cases; no actual learner performance',
        'wholeBilingualCaseIds': [c['id'] for c in cases[gid]['cases']], 'actualWholeCaseCount': len(cases[gid]['cases']),
        'substantiveIndependentObservationsDe': SCIENCE[ordinal], 'sourceGoalId': source_id, 'sourceRef': g['sourceRef'],
        'sourceBinding': bind(SOURCE_EXTRACT), 'normalizedSourceGoalRow': source,
        'normalizedSourceRowIsOriginalVerbatimQuote': False, 'actualOriginalSourcePdfReadSeparately': True,
        'exactNativePRow': {'goalFingerprint': p['goalFingerprint'], 'reviewInputFingerprint': p['reviewInputFingerprint'], 'profileFingerprint': p['profileFingerprint']},
        'status': p['status'], 'reviewAuthority': p['reviewAuthority'], 'evidenceLevel': p['evidenceLevel'], 'maximumClaimScope': p['maximumClaimScope'],
        'newActualLearnerEvidence': False, 'humanApproval': False})
assert total_case_bindings == 40
finding = {'findingId': 'B-D19-EN-BIOTECHNOLOGY-BROADER-SCOPE', 'goalId': '1b7f08a1-33df-5779-af66-430c91d699b7', 'ordinal': 19,
    'status': 'OPEN', 'severity': 'blocking current whole bilingual D/P closure', 'currentDE': whole['1b7f08a1-33df-5779-af66-430c91d699b7']['description'],
    'currentEN': whole['1b7f08a1-33df-5779-af66-430c91d699b7']['descriptionEn'],
    'actualDefect': 'English biotechnology methods is wider than current German gentechnische Methoden and includes methods not relying on gene technology. Current source/cases/PNG do not evidence that wider competence.',
    'boundedCorrectionProposal': {'titleEn': 'Basic Concepts of Gene Technology', 'descriptionEn': 'The learner can outline basic methods and applications of gene technology.'},
    'sourceScope': 'The whole HE9.4 primary includes Gentest, Gentherapie and Klonen under Gentechnik. Gene technology preserves this set; no fermentation competence or editing-only narrowing is required.',
    'noCorrectionAssumed': True, 'authorChangeRequiredBeforeRecheck': True, 'imageReplacementRequired': False, 'humanApproval': False}
write(OWN / 'actual-eighteen-V-first-independent-b.verdicts.json', {'schemaVersion': 1, 'artifactKind': 'independent-B-actual-eighteen-raster-width-native-page-first-verdicts',
    'recordedAt': datetime.now(timezone.utc).isoformat(), 'actualReviewer': '/root/flora_fauna_independent_a', 'assignedIndependentRole': 'B', 'records': observed,
    'actualOriginalPNG18': 18, 'actualChromium360': 18, 'actualChromium680': 18, 'actualCompleteNativeGoalPages': 18,
    'keep': 18, 'reject': 0, 'hold': 0, 'peerAReadBeforeFirstSeal': False, 'activeWrites': 0, 'strictGainClaimed': 0, 'humanApproval': False})
write(OWN / 'eighteen-whole-DEEN-source-P-science-first.independent-b.verdicts.json', {'schemaVersion': 1, 'artifactKind': 'independent-B-genuine-eighteen-whole-bilingual-source-case-science-first',
    'recordedAt': datetime.now(timezone.utc).isoformat(), 'records': science_rows, 'currentDKEEP': 17, 'currentDREVISEHOLD': 1,
    'wholeCurrentPCoveragePASS': 17, 'wholeCurrentPCoverageHOLD': 1, 'actualBoundedCaseSciencePASS': 40, 'openFindings': [finding],
    'oldExcludedSplitGoal': entry['omittedGoalId'], 'oldSplitIncludedAsNewClosure': False,
    'actualOriginalWholeSourceReading': {'url': entry['wholePrimaryUrl'], 'sha256': entry['wholePrimarySha256'], 'physicalPages': entry['physicalPrimaryPages'],
        'readBasis': 'Actual local original PDF bytes independently read through fitz on whole physical23–27, including mandatory/facultative and neighboring scope; full primary text not copied into this own dossier.',
        'wholePrimaryTextOrPdfCommitted': False},
    'supportingPrimaryScienceActuallyRead': [
        {'url': 'https://www.who.int/publications/i/item/9789240055179', 'basis': 'Actual WHO policy-brief main overview read; effective therapy and undetectable viral load support zero sexual transmission risk within stated conditions, not all exposure routes.'},
        {'url': 'https://www.genome.gov/genetics-glossary/Karyotype', 'basis': 'Actual NHGRI current definition read; arrangement and copy/number distinctions support scoped synthetic karyogram interpretation.'}],
    'retainedAMTechnicalSeal': bind(am_seal), 'retainedAMTechnical45FilesVerified': 45,
    'retainedMemoryBoundary': 'Current18 excludes the unresolved contraception/parenthood goal. Existing two memory-required goals remain blood-components and karyotype;17-card shared deck,25 ordinary-origin closure plus memory node,8 standard views and33 required visibility occurrences retained from genuine earlier technical check. No new A/M scientific decision inferred from hash matches.',
    'eyeOrEarChoiceIsReal': True, 'hormoneFeedbackScopeIsFacultative': True, 'allCountryPrimarySourceClosureClaim': False,
    'actualWholeFortyMaterialTaskAnswerBriefBindings': 40, 'PStatus': 'needs_human_review', 'reviewAuthority': 'ai_candidate', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1',
    'peerAFinalOutputsRead': False, 'activeWrites': 0, 'strictGainClaimed': 0, 'humanApproval': False, 'humanTrial': False})
write(OWN / 'open-ordinal19-bilingual-scope-finding.independent-b.actual.json', finding)
run_id = 'biologie-he9-eighteen-final-raster-native-independent-b-20261008-v1'
results = OWN / 'round-b/results'; results.mkdir(parents=True, exist_ok=True)
records = []; image_by_id = {r['goalId']: r for r in images}
for g in actual['goals']:
    gid = g['goalId']; ordinal = image_by_id[gid]['ordinal']; exp = positive[gid]['profile']['expectations']; understanding = {}
    for suffix in ['De', 'En']:
        understanding['essentialUnderstanding' + suffix] = ' '.join(x['essentialUnderstanding' + suffix] for x in exp)
        understanding['observablePerformance' + suffix] = exp[0]['observablePerformance' + suffix]
        understanding['transferExpectation' + suffix] = exp[-1]['observablePerformance' + suffix]
    row = {'$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json', 'schemaVersion': 1,
        'recordId': run_id + '.' + gid, 'runId': run_id, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'],
        'bundleFingerprint': actual['bundleFingerprint'], 'bookDigest': actual['bookDigest'],
        **{k: g[k] for k in ['goalId', 'goalFingerprint', 'pageFingerprint', 'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn']},
        'decision': 'revise' if ordinal == 19 else 'keep', 'understandingEvidence': understanding,
        'rationale': 'Eigenes unabhängiges B-Ersturteil nach tatsächlich vollständiger Lektüre der aktuellen DE/EN-Ziele,40 vollständiger Material/Aufgabe/Antwort-Fälle, ganzer gebundener HE9.1–9.4-Primärquelle und der aktuellen P-Erwartungen/Variations-/Transferverträge; Quellen-/Fallbindung zusätzlich technisch bestätigt, nicht daraus fachlich abgeleitet. ' + SCIENCE[ordinal] + ' Tatsächliche vollständige PNGs,360/680-Ansichten und ganze aktuelle native Seiten gelesen. ' + VISUAL[ordinal] + ' Vorhandene A/M-Entscheidungen samt erforderlichem gemeinsamen Deck bleiben erhalten. Keine Lernendenleistung, menschliche Freigabe oder Länder-Gesamtquellenprüfung behauptet.',
        'evidenceProfileContract': 'positive-understanding-evidence-v2', 'evidenceProfileRecommendation': 'none', 'recordStatus': 'candidate', 'reviewAuthority': 'ai_candidate'}
    if ordinal == 19:
        row.update(proposedDescriptionDe=g['currentDescriptionDe'], proposedDescriptionEn=finding['boundedCorrectionProposal']['descriptionEn'])
        row['rationale'] += ' Offener Befund ' + finding['findingId'] + '; zusätzlich passende titelEn-Empfehlung: Basic Concepts of Gene Technology. Korrektur nur Vorschlag, noch nicht eingespielt oder nachgeprüft.'
    records.append(row)
batch = campaign['batches'][0]
records_path = results / (batch['batchId'] + '.records.jsonl')
with records_path.open('x') as stream:
    for row in records: stream.write(json.dumps(row, ensure_ascii=False, separators=(',', ':')) + '\n')
started = read(OWN / 'actual-neutral-author-freeze-verification.independent-b.json').get('recordedAt', '2026-10-07T23:35:09.156418+00:00')
run = {'$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json', 'schemaVersion': 1,
    'runId': run_id, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'], 'batchId': batch['batchId'], 'batchInputFingerprint': batch['batchInputFingerprint'],
    'bundleFingerprint': actual['bundleFingerprint'], 'bookDigest': actual['bookDigest'], 'provider': 'OpenAI', 'model': 'Codex independent B; exact serving revision not exposed',
    'role': 'subject_reviewer', 'promptFamilyId': 'goal-description-understanding-evidence-v2', 'promptFingerprint': campaign['promptFingerprint'], 'criteriaFingerprint': campaign['criteriaFingerprint'],
    'generationParametersFingerprint': 'sha256:' + hashlib.sha256(b'Actual independent B whole18 science plus raster, width and native-page review; exact serving sampling parameters unavailable').hexdigest(),
    'independenceGroupId': campaign['independenceGroupId'], 'blindToOtherRuns': True, 'goalIds': batch['goalIds'],
    'inputArtifacts': [{'role': a['role'], 'digest': a['digest']} for a in bundle['artifacts'] if a['role'] in ['book_model', 'book_pdf', 'book_pdf_render_manifest', 'review_input_json', 'review_prompt', 'review_criteria']],
    'startedAt': started, 'completedAt': datetime.now(timezone.utc).isoformat(), 'outputDigest': 'sha256:' + sha(records_path), 'status': 'completed', 'toolchainVersion': 'skillpilot-goal-description-review-v1'}
run['inputArtifacts'].append({'role': 'description_review_batch_input_jsonl', 'digest': batch['batchInputFingerprint']})
write(results / (batch['batchId'] + '.run.json'), run)
config = read(SCIENCE_AUTHOR / 'P19.current-text-preimage.author.config.json')
config.update(reviewId=next(iter(positive.values()))['reviewId'], landscapePath=str((AUTHOR / 'candidate/canonical.current474-eighteen-new-raster-author.json').relative_to(ROOT)),
    semanticKindLedgerPath=str((AUTHOR / 'candidate/semantic-kinds.current474-eighteen-raster-inert.json').relative_to(ROOT)), reviewPath=entry['operativeNativeP18'])
config['scope'] = {'label': 'Independent B exact inactive P18 schema/bindings;17 whole coverage pass,19EN-scope hold kept open', 'goalIds': list(positive)}
write(OWN / 'P18.exact-inactive.native.config.json', config)
print('Actual independent B: D17 KEEP, D19 REVISE/HOLD;40 bounded cases scientifically PASS,17 whole P coverage PASS/1EN scope HOLD; V18 KEEP after18 originals+36 actual widths+18 actual native pages. First seal follows actual native D/P checks.')
