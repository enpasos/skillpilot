from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json

REPO = Path(__file__).resolve().parents[7]
OWN = Path(__file__).resolve().parent
BASE = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-current406-final-resource-P7-native8-technical-author-20261013-v1'
ROUND = BASE / 'native-eight/round-b'

def read(path):
    return json.loads(path.read_text())

def digest(path):
    return 'sha256:' + hashlib.sha256(path.read_bytes()).hexdigest()

def write(path, obj):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')

campaign = read(ROUND / 'description-review-campaign.json')
review_input = read(ROUND / 'description-review-input.json')
bundle = read(ROUND / 'review-bundle-manifest.json')
batch = campaign['batches'][0]
run_id = 'chemie-current406-native8-fresh-independent-b-20261013-v1'

# Content judgments below were formulated after inspecting the exact bilingual
# inputs, all ten physical PDF pages, the complete context model, and case data.
# The code only serializes the review and copies its original bindings.
judgments = [
    dict(
        eu_de='Silikone besitzen ein Si–O–Si-Rückgrat mit organischen Seitengruppen. Silanolkondensation bildet Siloxanverknüpfungen und Wasser; lineare Ketten und kovalente Netzwerke verhalten sich unterschiedlich. Der Vergleich mit kohlenstoffbasierten Polymeren verbindet Rückgrat, Seitengruppen und ausgewählte Eigenschaften. Bei nanoskaligen Beschichtungen wirken Oberflächenchemie und Struktur zusammen; Silikonname oder Schichtdicke allein belegen weder Nanopartikel noch Selbstreinigung.',
        eu_en='Silicones have a Si–O–Si backbone with organic side groups. Silanol condensation forms siloxane links and water; linear chains and covalent networks behave differently. Comparison with carbon-based polymers connects backbone, side groups and selected properties. Surface chemistry and structure act together in nanoscale coatings; neither the silicone name nor film thickness alone establishes nanoparticles or self-cleaning.',
        op_de='Die lernende Person stellt eine endgruppen- und valenzrichtige endliche Silanolkondensation mit Wasserbilanz dar, erklärt den Unterschied zwischen Silikonöl und vernetztem Elastomer und vergleicht PDMS mit einem ausgewählten kohlenstoffbasierten Polymer anhand von Struktur und gegebenen Eigenschaftsinformationen. Sie erläutert an Benetzungsdaten ein begrenztes Nanotechnologiebeispiel und unterscheidet Schichtdicke, Partikelgröße und tatsächlich belegte Oberflächenleistung.',
        op_en='The learner represents a finite silanol condensation with correct end groups, valences and water balance, explains silicone oil versus a crosslinked elastomer, and compares PDMS with a selected carbon-based polymer using structure and supplied property information. They explain a bounded nanotechnology example from wetting data and distinguish film thickness, particle size and demonstrated surface performance.',
        tr_de='In einem frisch vorgelegten Beschichtungsfall mit veränderter Oberflächenstruktur oder Chemie und separat angegebenem Vernetzungszustand begründet die lernende Person, welche Benetzungs- und Formstabilitätsaussagen aus den Daten folgen, vergleicht sie mit dem angegebenen kohlenstoffbasierten Material und benennt die fehlenden Belege für eine weitergehende Nanopartikel- oder Selbstreinigungsbehauptung.',
        tr_en='In a freshly supplied coating case with changed surface structure or chemistry and a separately specified crosslinking state, the learner justifies which wetting and shape-stability statements follow from the data, compares them with the supplied carbon-based material, and identifies missing evidence for stronger nanoparticle or self-cleaning claims.',
        rationale='KEEP: Die vollständige DE/EN-Kompetenz umfasst Herstellung als Beschreibungsmodell, Molekülbau, ausgewählten Polymervergleich und Nanotechnologieanwendung. Diese Aspekte bilden eine zusammenhängende Struktur-Eigenschafts-Erklärung; die Nanotechnologie wird nicht gestrichen. Das BY-Quellziel C13-GA.4.21/C13-EA.4.23 nennt dieselbe Kette. Im vollständigen Fallpaar ist die Trimerkondensation mit zwei Wassermolekülen valenzrichtig. Das separat vorgegebene Netzwerk wird nicht fälschlich allein aus dem bifunktionellen Trimer abgeleitet. PE liefert den Rückgrat- und unpolaren Oberflächenvergleich; der Nano-Fall ändert bei gleicher Chemie Struktur und Benetzung und ergänzt die hydrophile Kontrolle. 40 nm wird korrekt als Dicke behandelt. Die Rubriken begrenzen den Schluss auf Benetzung; sie behaupten keinen beobachteten Schmutzabtrag. Die PDF-Seite 3 zeigt den vollständigen Text und das gebundene Bild. Das bestehende V2-Profil ist hierfür hinreichend; weder Illustration noch Autorstatus wurden als Freigabe verwendet. Keine Aussage über eine vollständige HE-Quellprojektion.',
        recommendation='none',
    ),
    dict(
        eu_de='Die Eignung eines Textilfarbstoffs folgt aus passenden Farbstoff-Faser-Gruppen und den Bedingungen des Färbe- und Waschbads. Ionische Anziehung, Wasserstoffbrücken, Dispersion beziehungsweise hydrophobe Aufnahme und kovalente Fixierung sind verschiedene Modelle. Löslichkeit und Fixierung beeinflussen Auswaschbarkeit; eine kovalente Bindung garantiert keine unveränderliche Farbe.',
        eu_en='Textile-dye suitability follows from matching dye and fiber groups and the conditions of dyeing and washing. Ionic attraction, hydrogen bonding, dispersion or hydrophobic uptake, and covalent fixation are distinct models. Solubility and fixation affect washout; a covalent bond does not guarantee unchanging color.',
        op_de='Die lernende Person ordnet an vorgegebenen Gruppen und Ladungen geeignete Wechselwirkungen zwischen Farbstoff und Faser zu und erklärt daraus eine bedingte Auswahl. Sie unterscheidet die zusätzliche ionische Anziehung an protonierter Wolle von möglichen Cellulose-Wasserstoffbrücken sowie kovalente Reaktivfarbstofffixierung von neutraler Dispersionsfarbstoffaufnahme in Polyester. Sie nennt konkrete Grenzen einer Beständigkeitsprognose.',
        op_en='The learner assigns suitable dye-fiber interactions from supplied groups and charges and explains a conditional choice. They distinguish added ionic attraction on protonated wool from possible cellulose hydrogen bonding, and covalent reactive-dye fixation from neutral disperse-dye uptake in polyester. They identify concrete limits of a fastness prediction.',
        tr_de='Bei einer neuen Kombination von Farbstoff, Faser oder Badbedingungen leitet die lernende Person die vorhandenen Fixierungsmöglichkeiten erneut aus den Gruppen, Ladungen und Löslichkeitsangaben ab, begründet eine passende Auswahl und korrigiert eine pauschale Übertragung der früheren Faser- oder Beständigkeitsrangfolge.',
        tr_en='For a new dye, fiber or bath-condition combination, the learner derives available fixation routes again from groups, charges and solubility information, justifies a suitable choice, and corrects an indiscriminate transfer of the earlier fiber or fastness ranking.',
        rationale='KEEP: Die beiden Sprachfassungen benennen denselben zusammenhängenden Modellierungs- und Bewertungsauftrag. BY C13-EA.2.8 nennt gerade Bindungs-/Wechselwirkungstypen und textile Eignung; die weiteren HB/RP/SH/SN-Witnesses wurden nur als begrenzte Beiträge, nicht als volle Quellfreigaben gelesen. Das vollständige Fallpaar ändert Faser, Ladung, Fixierungsweg und Löslichkeit: anionischer Farbstoff an saurer Wolle versus Baumwolle; danach Cellulose-Reaktivfarbstoff und Polyester-Dispersionsfarbstoff. Die fachlichen Aussagen sind unter den ausdrücklich idealisierten Bedingungen korrekt. Die Eignungsentscheidung ist bedingt und die kovalente Bindung wird nicht mit Schutz vor Licht- oder Faserabbau gleichgesetzt. Die Rubriken verlangen begründete Zuordnung und Auswahl, keine praktische Durchführung. PDF-Seite 4 zeigt die vollständige Beschreibung und eine passende Auswahlillustration ohne universelle Beständigkeitsrangfolge. Keine lokale Textänderung oder Profilerweiterung erforderlich.',
        recommendation='none',
    ),
    dict(
        eu_de='Bei der elektrophilen aromatischen Substitution liefert das aromatische π-System ein Elektronenpaar für die Bindung zum Elektrophil. Der σ-Komplex ist vorübergehend nicht aromatisch; Deprotonierung am angegriffenen Ringkohlenstoff stellt das π-System wieder her. Dadurch wird ein Ring-H ersetzt, während eine dauerhafte Addition das aromatische System nicht wiederherstellen würde.',
        eu_en='In electrophilic aromatic substitution, the aromatic pi system supplies an electron pair to bond to the electrophile. The sigma complex is temporarily nonaromatic; deprotonation at the attacked ring carbon restores the pi system. A ring H is thereby replaced, whereas permanent addition would not restore the aromatic system.',
        op_de='Die lernende Person konstruiert oder ergänzt an einem vorgegebenen aromatischen Ausgangssystem und Elektrophil plausible Elektronenpaarpfeile, den geladenen σ-Komplex und die rearomatisierende Deprotonierung. Sie erklärt den Zusammenhang von Bindungsbildung, vorübergehendem Aromatizitätsverlust und substituiertem Produkt statt nur die Schrittbezeichnungen zu wiederholen.',
        op_en='The learner constructs or completes plausible electron-pair arrows, the charged sigma complex and rearomatizing deprotonation for a supplied aromatic starting system and electrophile. They explain how bond formation, temporary loss of aromaticity and the substituted product are connected rather than repeating step names.',
        tr_de='In einem unabhängig vorgelegten Schema mit einem anderen Elektrophil erkennt und korrigiert die lernende Person eine fälschlich dauerhafte Additionsstruktur, stellt die notwendige Deprotonierung dar und begründet über Elektronenpaarfluss und Aromatizität, warum der gleiche Substitutionsmechanismus zum neuen Produkt führt.',
        tr_en='In an independently supplied scheme with a different electrophile, the learner identifies and corrects an incorrectly permanent addition structure, represents the required deprotonation, and uses electron-pair flow and aromaticity to explain why the same substitution mechanism produces the new product.',
        rationale='KEEP: Der knappe DE/EN-Text benennt einen klaren Reaktionsmechanismus; das aktuelle V2-Profil konkretisiert Angriff, σ-Komplex und Rearomatisierung. Bromierung und der fehlerhafte Nitrierungsabschluss prüfen dieselbe Modellidee in einer geänderten chemischen und darstellerischen Situation. Direkter Vorläufer f0f67a7a trägt Bindungsverhältnisse/Aromatizität. Im vollständigen 406-Modell und im kanonischen Payload sind 981242bb und 53db04a0 echte direkte atomare Nachfolger mit requires=[17ab1148,...]. e5941581 ist der sie enthaltende Cluster, hat selbst requires=[] und erscheint korrekt nicht als atomarer Nachfolger auf PDF-Seite 5. Die sechs tatsächlichen Rückbeziehungen bleiben nachvollziehbar; andere unveränderte Ziele wurden nicht erneut fachlich beurteilt. Der EAS-Anteil ist in den HH/NI/RP/SL/ST-Quellklauseln erkennbar, während breite geerbte Witnesses keine volle Quellabdeckung beweisen. Das orientierende Bild wird nicht als selbstständiger Elektronenpfeilnachweis gewertet. Text und Profil bleiben unverändert geeignet.',
        recommendation='none',
    ),
    dict(
        eu_de='Eine vollständige Azofarbstoffroute beginnt beim aromatischen primären Amin. Nitrosierung bildet eine N–N-Bindung; Protonenübertragungen und Wasserabspaltung führen zum Diazoniumion. Der aktivierte Kupplungsaromat greift dessen terminalen Stickstoff an, N≡N wird zu N=N, und Deprotonierung rearomatisiert den Ring. Atom- und Ladungserhaltung verbinden Diazotierung und Kupplung.',
        eu_en='A complete azo-dye route starts from an aromatic primary amine. Nitrosation forms an N–N bond; proton transfers and water loss produce the diazonium ion. The activated coupling arene attacks its terminal nitrogen, N≡N becomes N=N, and deprotonation restores ring aromaticity. Conservation of atoms and charge connects diazotization and coupling.',
        op_de='Die lernende Person stellt auf Papier den Aminangriff auf das gegebene nitrosierende Elektrophil, die geordneten N–N-Zwischenstufen bis zum Diazoniumion sowie den Kupplungsmechanismus mit Elektronenpaarfluss, σ-Komplex und Protonenabgabe dar. Sie erklärt Säure- und Wasserabspaltungsrolle und prüft ArNH₂+HNO₂+H⁺→ArN₂⁺+2H₂O sowie ArN₂⁺+Ar′H→Ar–N=N–Ar′+H⁺ auf Atom- und Ladungsbilanz.',
        op_en='On paper, the learner represents amine attack on the supplied nitrosating electrophile, the ordered N–N intermediates up to the diazonium ion, and coupling with electron-pair flow, sigma complex and proton loss. They explain the roles of acid and water loss and check ArNH₂+HNO₂+H⁺→ArN₂⁺+2H₂O and ArN₂⁺+Ar′H→Ar–N=N–Ar′+H⁺ for atom and charge balance.',
        tr_de='Mit einem neu vorgelegten aromatischen Amin und einem anderen aktivierten Kupplungspartner stellt die lernende Person die vollständige Route erneut dar und begründet bei einer angegebenen Protonierung des Aminodonors, wie das fehlende verfügbare Elektronenpaar die Ringaktivierung und damit die Kupplung verändert. Die vorausgehende Diazotierung und ihre Bilanz bleiben Teil des Nachweises.',
        tr_en='For a freshly supplied aromatic amine and a different activated coupling partner, the learner represents the complete route again and explains how specified protonation of an amino donor removes its available lone pair, changes ring activation and affects coupling. The preceding diazotization and its balance remain part of the evidence.',
        rationale='KEEP: Die gleichwertigen DE/EN-Beschreibungen verlangen ausdrücklich die ganze Route ab primärem Amin; sie wurden nicht auf Azokupplung verkürzt. Das BY-Quellziel C13-EA.2.6 liefert den Azo-Anteil der kombinierten Quelle. Die aktuelle atomare Trennung von der Triphenylmethanroute ist fachlich sinnvoll; beide haben den EAS-Vorläufer. In beiden vollständigen Fällen werden Nitrosierung, gegebene N-N-Zwischenstufen, Säure, Wasserabspaltung und die korrekte Diazotierungsbilanz geprüft: außerhalb des unveränderten Arylrests 2 N, 2 O, 4 H und Ladung +1 auf beiden Seiten. Die Kupplungsmodelle sind mit σ-Komplex und H⁺-Abgabe ebenfalls ladungsrichtig. Der zweite Fall wechselt zu einem Aminodonor und verlangt eine echte Protonierungs-/Aktivierungsbegründung; er ist mehr als ein Resttausch. Alle dazugehörigen Rubrikleistungen sind ausdrücklich verlangt. Die auf PDF-Seite 6 korrekt als vereinfachte Route bezeichnete Illustration ersetzt weder die Zwischenstufen noch den Bilanznachweis. Sammelschritte für Protonenübertragungen bewahren den vollständigen behaupteten Syntheseumfang, ohne ein unbeanspruchtes Protonentransfernetz oder Laborhandeln zu verlangen.',
        recommendation='none',
    ),
    dict(
        eu_de='Der aromatische Aldehyd liefert das zentrale Kohlenstoffatom eines Triphenylmethanfarbstoffs. Säurekatalyse ermöglicht zwei Bindungen zu aktivierten Kupplungsaromaten über Carbonylangriff, Rearomatisierung und Wasserabspaltung. Die neutrale Leukoverbindung besitzt am zentralen C drei Arylreste und H; Oxidation entfernt dieses H mit Protonen- und Elektronenabgabe und liefert das donorstabilisierte Farbstoffkation. Kondensations- und Oxidationsbilanz gehören zur selben Syntheseroute.',
        eu_en='The aromatic aldehyde supplies the central carbon atom of a triphenylmethane dye. Acid catalysis permits two bonds to activated coupling arenes through carbonyl attack, rearomatization and water loss. The neutral leuco compound has three aryl groups and H at its central carbon; oxidation removes that H with proton and electron release to give the donor-stabilized dye cation. Condensation and oxidation balances belong to the same synthetic route.',
        op_de='Die lernende Person stellt Carbonylprotonierung, ersten Ringangriff, Rearomatisierung, OH-Protonierung/Wasserabspaltung, zweiten Ringangriff und erneute Rearomatisierung bis R–CH(Ar)₂ dar. Sie erklärt die Umwandlung zur dreifach gebundenen zentralen C-Kationenstruktur und prüft RCHO+2ArH→RCH(Ar)₂+H₂O sowie RCH(Ar)₂→[RC(Ar)₂]⁺+H⁺+2e⁻ auf Stoff- und Ladungserhaltung. Die Oxidationshalbreaktion ist eine Bilanz, kein praktischer Oxidationsversuch.',
        op_en='The learner represents carbonyl protonation, first arene attack, rearomatization, OH protonation/water loss, second arene attack and renewed rearomatization up to R–CH(Ar)₂. They explain formation of the central three-bonded carbon-cation structure and check RCHO+2ArH→RCH(Ar)₂+H₂O and RCH(Ar)₂→[RC(Ar)₂]⁺+H⁺+2e⁻ for material and charge conservation. The oxidation half-equation is a balance, not a practical oxidation experiment.',
        tr_de='In einer unabhängig vorgelegten vollständigen Route mit einer chemisch bedeutsam veränderten Zwischenstufen- oder Fehlerdarstellung entscheidet und begründet die lernende Person, welche Bindungsbildung, Wasserabspaltung und Oxidation noch erforderlich sind. Beispielsweise korrigiert sie einen im Farbstoffkation fälschlich erhaltenen zentralen H-Rest und eine damit unvereinbare Ladungs-/Elektronenbilanz, rekonstruiert die Route ab Aldehyd und unterscheidet begründet Leukoverbindung und Farbstoffkation. Ein bloßer Austausch des unveränderten Arylrestnamens genügt nicht.',
        tr_en='In an independently supplied complete route with a chemically meaningful change in intermediate or error representation, the learner decides and explains which bond formation, water loss and oxidation are still required. For example, they correct an incorrectly retained central H in the dye cation and an incompatible charge/electron balance, reconstruct the route from the aldehyde, and justify the distinction between leuco compound and dye cation. Merely changing the name of an otherwise unchanged aryl group is insufficient.',
        rationale='KEEP für den vollständigen und fachlich korrekten DE/EN-Goaltext; V2-PROFIL REVISE wegen der Transferlücke. BY C13-EA.2.6 nennt den Triphenylmethan-Anteil der kombinierten Quelle. Die präzise, zusammenhängende Route ab aromatischem Aldehyd über beide Ringangriffe/Leukoverbindung bis zur Oxidation wird bewahrt; die längere Beschreibung ist auf PDF-Seite 7 vollständig. Kondensation und Oxidationshalbreaktion im vollständigen Fallpaar sind stoff- und ladungsrichtig: 0=+1+1−2. Keine praktische Synthese oder spezifizierter industrieller Oxidationsmechanismus wird eingeführt. KONKRETER OFFENER BEFUND: 53db04a0-case-2 ersetzt Ph durch p-CH₃–C₆H₄ und nennt diesen Rest ausdrücklich R; derselbe Dimethylanilinpartner, dieselbe vorgegebene para-Position, dieselben verlangten Schritte und dieselbe Bilanz bleiben bestehen. Weder Aufgabe noch Rubrik verlangen eine Folgerung aus der veränderten Methylgruppe oder einer anderen geänderten Reaktions-/Darstellungsbedingung. Die zusätzliche Leuko/Kation-Erklärung deckt Verständnis ab, macht den Resttausch aber nicht zu sinnvollem unabhängigen Transfer. Der vollständige V2-Kontrakt verlangt independentTransferRequired=true; dieses Fallpaar liefert dafür keinen belastbaren geänderten Entscheidungsfall. Einen frischen, begründet zu korrigierenden Zwischenstufen-/Ladungsfehler oder eine andere relevante, explizit verlangte Bedingungsänderung ergänzen; beide vollständigen Synthesen und ihre Rubriken bewahren. Kein verkürzter Goaltext als Ersatz für die Profilkorrektur.',
        recommendation='revise',
    ),
    dict(
        eu_de='Die Umweltfolgen von Batterie- und Akkumulatorentsorgung hängen von Stoffzusammensetzung, Freisetzung, kontrollierter Erfassung und tatsächlich erreichter Rückgewinnung ab. Sammlung ist nicht gleich Recycling und Metallrückgewinnung bedeutet keine Umweltneutralität: Energiebedarf, Elektrolyte und Reststoffe können verbleiben. Eine Bewertung trennt gegebene Umweltfolgen, Kriteriengewichtung und fehlende Informationen.',
        eu_en='Environmental impacts of battery and accumulator disposal depend on material composition, release, controlled collection and actual recovery. Collection is not recycling, and metal recovery does not mean environmental neutrality: energy demand, electrolytes and residues may remain. Assessment distinguishes supplied environmental effects, weighting of criteria and missing information.',
        op_de='Die lernende Person diskutiert für eine Primärbatterie und einen Akkumulator die gegebenen stofflichen Freisetzungsfolgen, erklärt Nutzen und Grenzen von Erfassung und Rückgewinnung und begründet unter benannter Vergleichsgrenze ein bedingtes Entsorgungs-/Recyclingurteil. Sie wägt Metallrückführung gegen Energie- und Reststofffolgen ab und widerlegt anhand der Daten eine pauschale Umweltneutralitätsbehauptung.',
        op_en='For a primary battery and an accumulator, the learner discusses supplied material-release impacts, explains benefits and limits of collection and recovery, and justifies a conditional disposal/recycling judgment within a named comparison boundary. They weigh metal recovery against energy and residue impacts and use the data to refute an unconditional environmental-neutrality claim.',
        tr_de='Bei einem neuen Akkumulatortyp oder einer geänderten Behandlungsroute überprüft die lernende Person die frühere Abwägung anhand der neuen Zusammensetzung oder Freisetzungsinformation, passt das betroffene Urteil begründet an und erklärt, warum die Änderung nicht ungeprüft für die unveränderte Primärbatterie oder alle Akkumulatoren gilt.',
        tr_en='For a new accumulator type or changed treatment route, the learner reviews the previous assessment using the new composition or release information, justifiably revises the affected judgment, and explains why the change cannot automatically be applied to the unchanged primary battery or all accumulators.',
        rationale='KEEP: Die gleichwertigen Sprachfassungen bewahren den HH/MV-Auftrag zu Batterien UND Akkumulatoren, Entsorgung/Recycling, fachlicher Diskussion und begründetem Umwelturteil. Die Primär-PDFs HH S.31 und MV S.28 wurden im Kontext gelesen; keine Elektroden-, Lade- oder industrielle Verfahrenskompetenz wurde hinzugefügt. Die zwei vollständigen Fälle unterscheiden Zink/Mangan-Primärbatterie, Bleiakkumulator und Nickel-Metallhydrid-Akkumulator. Kontrollierte Sammlung und tatsächliche Metallrückgewinnung sind klar getrennt. Energie-/Reststoffgrenzen und fehlende Primärrohstofffolgen begrenzen das Urteil. Der neue R-spezifische kritische Rest verändert die Abwägung stofflich und darf nicht auf P übertragen werden; die Rubriken verlangen gerade diese begründete Neubewertung. Das V2-Profil bildet die ganze Kompetenz ab. PDF-Seite 8 zeigt vollständige Beschreibung, passende geschlossene Quellen und externe Übungsbeziehung; das Bild ist nur Orientierung. Gemeinsame Quelle mit Rohstoffgewinnung liefert hier nur den Entsorgungs-/Recyclinganteil.',
        recommendation='none',
    ),
    dict(
        eu_de='Für ausgewählte Bestandteile elektrochemischer Spannungsquellen müssen geeignete seltene Metallrohstoffe bereitgestellt werden; seltenes Metall ist nicht gleich Seltenerdmetall. Erzgehalt, Begleitstoffe, Wasser- und Reststoffführung sowie Haupt-/Nebenproduktkontext beeinflussen die Gewinnungsfolgen. Eine fachliche Diskussion verbindet diesen Stoffbezug mit Argumenten und Grenzen vergleichbarer Daten.',
        eu_en='Suitable rare-metal raw materials are needed for selected constituents of electrochemical sources; a rare metal is not synonymous with a rare-earth metal. Ore grade, associated substances, water and residue management, and main/by-product context affect extraction impacts. Scientific discussion links these material relationships to arguments and limits of comparable data.',
        op_de='Die lernende Person erklärt den Zusammenhang zwischen gegebenem Metallbedarf und Spannungsquellenbestandteil, leitet bei gleichem nutzbarem Produktertrag aus Erzgehalt und Wasser-/Reststoffangaben Folgen der Gewinnungsoptionen ab und diskutiert sie mit Gegenargumenten. Sie erkennt ungleiche Bilanzgrenzen sowie fehlende Zurechnung bei Nebenprodukten und formuliert ein fachlich begrenztes Fazit ohne pauschale Herkunfts- oder Metallrangfolge.',
        op_en='The learner explains how supplied metal demand relates to a constituent of an electrochemical source, derives extraction-route consequences from ore grade and water/residue information at equal usable output, and discusses them with counterarguments. They recognize unequal boundaries and missing by-product allocation and give a scientifically limited conclusion without ranking all origins or metals.',
        tr_de='Nach einer frisch vorgelegten Änderung von Wasserführung, Erz-/Nebenproduktkontext oder zusätzlichem Abbau trennt die lernende Person verbesserte und unveränderte Gewinnungsfolgen, überprüft eine ältere Werbe- oder Vergleichsaussage und begründet mit den neu betroffenen Stofffolgen und fehlenden Daten ein angepasstes, bedingtes Fazit.',
        tr_en='After a freshly supplied change in water management, ore/by-product context or additional mining, the learner separates improved from unchanged extraction impacts, checks an earlier advertisement or comparison, and uses newly affected material impacts and missing data to justify an updated conditional conclusion.',
        rationale='KEEP: DE/EN verlangen fachliche Diskussion der Rohstoffgewinnung seltener Metalle für elektrochemische Spannungsquellen. Das Primär-PDF MV S.28 nennt seltene Metalle ausdrücklich; der gemeinsame Quellenabsatz wird hier auf seinen Rohstoffgewinnungsanteil begrenzt. Der Text behauptet weder eine Seltenerdgruppe noch eine vollständige Ökobilanz. Die vollständigen M/N-Fälle verbinden Quellenbedarf mit Erzgehalt, Materialbewegung, löslichen Begleitstoffen und kontrollierter Wasser-/Reststoffführung. Verbesserte B-Wasserführung beseitigt nicht den verbleibenden höheren Erzbedarf. Der zweite Fall ändert zu Nebenproduktgewinnung und neu ausgelöstem Abbau/Freisetzung: die 10/40-Indizes haben verschiedene Grenzen und begründen keinen vierfachen Gesamtenergievorteil. Aufgaben und Rubriken verlangen Argumente, Einschränkung und erneute Diskussion; sie verlangen keine unbeanspruchte metallurgische Anlage oder Reaktionsgleichung. PDF-Seite 9 nutzt Platin in einer PEM-Brennstoffzelle korrekt als orientierendes seltenes-Metall/Katalysator-Beispiel. Der einschlägige V2-Kontrakt ist vollständig und bedingt.',
        recommendation='none',
    ),
    dict(
        eu_de='Metallrecycling kann bereits genutztes Metall zurückführen und den Bedarf an neu gewonnenem Metall verringern. Bei gleicher nutzbarer Metallmenge und gleicher Bilanzgrenze kann es Energie sparen; verbleibende Verluste, Ergänzungsrohstoffe und Energiebedarf bleiben zu berücksichtigen. Diese beiden Bezüge begründen Konsum- und Entsorgungsentscheidungen gemeinsam, ohne unnötige Zusatzkäufe folgenlos zu machen.',
        eu_en='Metal recycling can return previously used metal and reduce demand for newly extracted metal. At the same usable metal quantity and comparison boundary, it can save energy; remaining losses, new-material additions and energy use still matter. Both links jointly support consumption and disposal decisions without making unnecessary extra purchases impact-free.',
        op_de='Die lernende Person beschreibt aus gegebenen Sek-I-Daten Ressourcen- und Energiebezug auf gemeinsamer Nutzbasis und begründet für eine selbst gewählte hypothetische Situation sowohl längere Nutzung beziehungsweise notwendigen Ersatz als auch spätere Erfassung des Altmetalls. Sie erklärt, weshalb Rückgewinnung keine Rohstoffneutralität und Energieeinsparung keinen Nullverbrauch bedeutet.',
        op_en='Using supplied lower-secondary data, the learner describes resource and energy relationships on a common usable-output basis and, for a self-chosen hypothetical situation, justifies both continued use or necessary replacement and later collection of discarded metal. They explain why recovery does not imply resource neutrality and energy savings do not imply zero use.',
        tr_de='In einem neuen Fall, in dem sich bei gleicher Metallrückführung der bereitgestellte Transport-/Aufbereitungsaufwand ändert, beurteilt die lernende Person Ressourcen- und Energiebezug getrennt, passt die hypothetische Konsum- und Entsorgungsentscheidung begründet an und erklärt, warum ein verbleibender Ressourcennutzen keine universelle Energie- oder Gesamtumweltrangfolge beweist.',
        tr_en='In a new case where supplied transport/treatment effort changes at the same metal return, the learner assesses resource and energy links separately, justifiably updates the hypothetical consumption and disposal decision, and explains why a remaining resource benefit does not prove a universal energy or overall environmental ranking.',
        rationale='KEEP: Die knappen gleichwertigen DE/EN-Fassungen erhalten den vollständigen NW-Sek-I-Operator: Bedeutung des Metallrecyclings für Ressourcenschonung UND Energieeinsparung beschreiben und darauf eigenes Konsum- UND Entsorgungsverhalten bewerten. Das Primär-PDF NW S.23 bestätigt diese Verknüpfung. Eigene Bewertung darf an einer frei gewählten erfundenen Alltagssituation gezeigt werden; private Haushaltsdaten sind nicht nötig. In beiden vollständigen Fällen ist die gemeinsame Nutzmenge mit Sammlung/Transportgrenze genannt. 0,8 kg Rückgewinnung plus 0,2 kg Ergänzung und positiver Energiebedarf werden korrekt erläutert. Der zweite Fall ändert den gegebenen Transport-/Aufbereitungsaufwand: R2=60 gegenüber P=55 spart innerhalb der Grenze keine Energie, bewahrt aber den Ressourcennutzen. Dies ist inhaltlicher Transfer, nicht nur ein Zahlentausch, weil die Ursache und die begründet anzupassende Konsum-/Entsorgungswahl ausdrücklich verlangt werden. Die Rubriken decken beide Entscheidungsteile und beide Bezüge ab. PDF-Seite 10 zeigt vollständigen Text und eine klar als Aluminiumbeispiel begrenzte Illustration. Keine Erweiterung auf Maschinenkunde oder Sek-II-Ökobilanz.',
        recommendation='none',
    ),
]

assert len(judgments) == len(review_input['goals']) == 8
records = []
for i, (goal, judgment) in enumerate(zip(review_input['goals'], judgments), 1):
    record = {key: goal[key] for key in [
        'goalId', 'goalFingerprint', 'pageFingerprint', 'currentTitleDe',
        'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn',
    ]}
    record.update({
        '$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
        'schemaVersion': 1,
        'recordId': f'{run_id}.record-{i:03d}',
        'runId': run_id,
        'campaignId': campaign['campaignId'],
        'roundId': campaign['roundId'],
        'bundleFingerprint': campaign['bundleFingerprint'],
        'bookDigest': campaign['bookDigest'],
        'decision': 'keep',
        'understandingEvidence': {
            'essentialUnderstandingDe': judgment['eu_de'],
            'essentialUnderstandingEn': judgment['eu_en'],
            'observablePerformanceDe': judgment['op_de'],
            'observablePerformanceEn': judgment['op_en'],
            'transferExpectationDe': judgment['tr_de'],
            'transferExpectationEn': judgment['tr_en'],
        },
        'rationale': judgment['rationale'],
        'evidenceProfileContract': 'positive-understanding-evidence-v2',
        'evidenceProfileRecommendation': judgment['recommendation'],
        'recordStatus': 'candidate',
        'reviewAuthority': 'ai_candidate',
    })
    records.append(record)

results = OWN / 'results'
results.mkdir(exist_ok=True)
records_path = results / (batch['batchId'] + '.records.jsonl')
records_path.write_text(''.join(json.dumps(record, ensure_ascii=False, separators=(',', ':')) + '\n' for record in records))
completed_at = datetime.now(timezone.utc).isoformat(timespec='seconds').replace('+00:00', 'Z')
parameters = {
    'provider': 'OpenAI',
    'model': 'GPT-6 (Codex agent; exact serving snapshot not exposed)',
    'modelVersion': None,
    'samplingControls': 'Not exposed in this agent session; no temperature, top_p, seed or snapshot version is asserted.',
    'execution': 'Actual interactive independent Codex review; tool-assisted reading and local stock validation.',
}
write(OWN / 'generation-parameters.actual.json', parameters)
artifact_roles = {
    'book_model', 'book_pdf', 'book_pdf_render_manifest',
    'review_prompt', 'review_criteria', 'run_manifest_schema',
}
run = {
    '$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
    'schemaVersion': 1,
    'runId': run_id,
    'campaignId': campaign['campaignId'],
    'roundId': campaign['roundId'],
    'batchId': batch['batchId'],
    'batchInputFingerprint': batch['batchInputFingerprint'],
    'bundleFingerprint': campaign['bundleFingerprint'],
    'bookDigest': campaign['bookDigest'],
    'provider': parameters['provider'],
    'model': parameters['model'],
    'role': 'subject_reviewer',
    'promptFamilyId': 'goal-description-understanding-evidence-review-v2',
    'promptFingerprint': campaign['promptFingerprint'],
    'criteriaFingerprint': campaign['criteriaFingerprint'],
    'generationParametersFingerprint': digest(OWN / 'generation-parameters.actual.json'),
    'independenceGroupId': campaign['independenceGroupId'],
    'blindToOtherRuns': True,
    'goalIds': batch['goalIds'],
    'inputArtifacts': [
        {'role': a['role'], 'digest': a['digest']}
        for a in bundle['artifacts'] if a['role'] in artifact_roles
    ] + [{'role': 'description_review_batch_input_jsonl', 'digest': batch['batchInputFingerprint']}],
    'startedAt': read(OWN / 'run-session.actual.json')['startedAt'],
    'completedAt': completed_at,
    'status': 'completed',
    'outputDigest': digest(records_path),
    'toolchainVersion': 'goal-description-review-campaign-v2',
}
write(results / (batch['batchId'] + '.run.json'), run)

source_base = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-three-recycling-current403-graph-source-integration-author-20261013-v4'
paths = [
    BASE / 'NEUTRAL.current406-P7-native8.exact-input-selector.json',
    BASE / 'SEAL.finite-current406-P7-native8-technical-author.actual.json',
    BASE / 'candidate/canonical531.current406.final-resources.inactive.json',
    BASE / 'models/whole406.final-resource-P7.stock-book-model.inactive.json',
    BASE / 'native-eight/bundle/book-model.json',
    BASE / 'native-eight/bundle/book.pdf',
    BASE / 'native-eight/bundle/book.pdf.render-manifest.json',
    ROUND / 'description-review-campaign.json',
    ROUND / 'description-review-input.json',
    ROUND / 'review-bundle-manifest.json',
    ROUND / 'batches' / (batch['batchId'] + '.input.jsonl'),
    ROUND / 'prompt.md', ROUND / 'criteria.md',
    ROUND / 'contracts/goal-description-review-record.schema.json',
    BASE / 'native-eight/bundle/contracts/goal-evidence-ai-run-manifest.schema.json',
    BASE / 'positive/three-current406.ai-candidate.needs-human-review.jsonl',
    BASE / 'positive/four-current406.exact-retained.ai-candidate.needs-human-review.jsonl',
    BASE / 'positive/six-current406.exact-CAS-cases.DEEN.author.json',
    REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-current403-four-profile-current-input-author-successor-20261013-v1/positive/eight-whole-cases.exact-unchanged.json',
    BASE / 'checks/eight-exact-publicRoot-source-assets.actual.json',
    source_base / 'NEUTRAL.three-recycling-graph-source.exact-input-selector.json',
    source_base / 'configs/source-atlas.portable-pure-api.config.json',
    source_base / 'checks/portable-source-API.stock-compact-receipt.actual.json',
    REPO / 'AGENTS.md',
    REPO / 'curricula/DE/Gymnasium/input/BY/gymnasium/Chemie.json',
    REPO / 'curricula/DE/Gymnasium/input/HH/chemie-gyo-2022-data.pdf',
    REPO / 'curricula/DE/Gymnasium/input/MV/Chemie_Gymnasium_11_12_Erprobungsfassung.pdf',
    REPO / 'curricula/DE/Gymnasium/input/NW/lower-secondary/g9_ch_klp_3415_2019_06_23.pdf',
]
assets = read(BASE / 'checks/eight-exact-publicRoot-source-assets.actual.json')['assets']
for a in assets:
    paths.extend(REPO / a[k]['path'] for k in ['source', 'copy'])
receipt = read(source_base / 'checks/portable-source-API.stock-compact-receipt.actual.json')
for w in receipt['witnessGroups']:
    if any(id in w['goalIds'] for id in batch['goalIds']):
        paths.append(REPO / receipt['inputBindings'][w['extractionInput']]['path'])
paths = sorted(set(paths))
inventory = {
    'schemaVersion': 1,
    'runId': run_id,
    'bindingPurpose': 'Supplemental exact sources/context/cases actually used; stock run roles remain exactly the original bundle roles.',
    'files': [{'path': p.relative_to(REPO).as_posix(), 'bytes': p.stat().st_size, 'sha256': digest(p)} for p in paths],
    'externalObjective': {'path': '/home/enpasos/.codex/attachments/c176f25a-3aea-4378-88ad-e0312e383d41/goal-objective.md', 'sha256': digest(Path('/home/enpasos/.codex/attachments/c176f25a-3aea-4378-88ad-e0312e383d41/goal-objective.md'))},
    'canonicalLearnerOrSessionDataRead': False,
}
write(OWN / 'INPUTS.actual-exact-bindings.json', inventory)
native = read(BASE / 'native-eight/bundle/book-model.json')
write(OWN / 'NATIVE8.actual-inspection-and-scientific-findings.json', {
    'schemaVersion': 1,
    'runId': run_id,
    'actualReviewCompletedAt': completed_at,
    'physicalPdfPagesInspected': list(range(1, 11)),
    'nativeGoalIdsInOriginalOrder': batch['goalIds'],
    'currentWholeContextGoalCount': 406,
    'wholeContextOther398GoalsRereviewed': False,
    'completeCaseObjectsInspected': {'P3': 6, 'P4': 8},
    'caseComponentsInspected': ['full DE/EN data', 'full DE/EN tasks', 'full DE/EN model answers', 'exact case rubrics and task boundaries', 'variation/transfer design', 'whole-goal coverage'],
    'scientificFinding': {
        'goalId': batch['goalIds'][4],
        'caseId': '53db04a0-case-2',
        'finding': 'Changing Ph to explicitly named R=p-methylphenyl, with unchanged coupling partner, specified site, mechanism and balances, supplies no demanded inference from a changed chemical or representation condition. Independent meaningful transfer remains unproved in this case pair.',
        'requiredFollowup': 'Keep both complete synthesis routes; add and grade a genuinely changed, independently reasoned intermediate/charge or relevant-condition case. Do not shorten the canonical demand.',
        'descriptionDecision': 'keep',
        'evidenceProfileRecommendation': 'revise',
        'resolved': False,
    },
    'decisionCounts': {'keep': 8, 'revise': 0, 'split_review': 0, 'block': 0},
    'evidenceProfileRecommendationCounts': {'none': 7, 'create': 0, 'revise': 1},
    'sourceInspection': 'Native eight source witnesses read as references only. Raw BY structured source and HH/MV/NW primary PDF clauses checked. Broad inherited source witnesses were not used as whole-competence or whole-projection approval.',
    'independence': {
        'round': 'b',
        'group': campaign['independenceGroupId'],
        'peerARecordsRead': False,
        'earlierDPAMVReviewsRead': False,
        'technicalAuthorFitnessVerdictsUsed': False,
        'incidentalMetadataExposure': 'One source-extraction top-level print included an aggregate 332-source-goal count baseline acceptance. It was not a D/P/A/M/V judgment on these eight and was not used as an approval oracle. No substantive previous reviewer judgment was inspected.',
    },
    'nativePageInspection': [{'goalId': p['goalId'], 'physicalPage': p['pageNumber'] + 2, 'goalFingerprint': p['goalFingerprint'], 'pageFingerprint': p['pageFingerprint'], 'imageDigest': p['visualization']['originalDigest'], 'fullTextVisible': True, 'sourceAndPublicRootAssetBytesVerified': True} for p in native['pages']],
    'visualizationApprovalClaimed': False,
    'atomicityOrMemoryVotesCreated': False,
    'strictCompletionsCreated': 0,
    'humanApprovalClaimed': False,
    'humanTrialClaimed': False,
    'activeRuntimeGitOrSettingsWrites': False,
})
print(json.dumps({'runId': run_id, 'completedAt': completed_at, 'recordCount': len(records), 'outputDigest': digest(records_path), 'scientificFindingCount': 1}, ensure_ascii=False))
