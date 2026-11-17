import json,hashlib,collections
from pathlib import Path
BASE=Path(__file__).parent
R=Path.cwd()
raw=json.loads((BASE/'bindings.actual.json').read_text())
rows={(r['state'],r['goalId'][:8]):r for r in raw['rows']}
# Independent human review of original page content against the full canonical atom.
# P=whole atom has only partial support; U=no adequate lower content; E=upper E10;
# S=lower content supports an ordinary operationalization; O=explicit optional extension.
def ev(file,pages,printed=None):return {'file':file,'pdfPages':pages,'printedPages':printed or pages}
HH='curricula/DE/Gymnasium/input/HH/physik-gym-seki-data.pdf'
MV='curricula/DE/Gymnasium/input/MV/Physik_Gymnasium_7_10_2022.pdf'
SL7='curricula/DE/Gymnasium/input/SL/LP_PH_gym9_7_2023.pdf'
SL8='curricula/DE/Gymnasium/input/SL/LP_PH_gym9_8_NW_Zweig_2024.pdf'
SL9='curricula/DE/Gymnasium/input/SL/LP_PH_gym9_9_nw_Zweig_2024.pdf'
SL10='curricula/DE/Gymnasium/input/SL/LP_PH_gym9_10_nw_Zweig_2026.pdf'
SN='curricula/DE/Gymnasium/input/SN/lehrplan-gymnasium-physik-sachsen-2025.pdf'
ST='curricula/DE/Gymnasium/input/ST/FLP_Physik_Gym_01082022_swd.pdf'
TH='curricula/DE/Gymnasium/input/TH/LP_GY_Physik_2012.pdf'
D={}
def add(state,ids,status,note,evidence,patterns=()):
 for id in ids.split():D[state,id]=(status,note,evidence,patterns)
add('HH','3b50255a','S','Original verlangt Erstellen von Zerfallsreihen mit dem Periodensystem; Prüfen von Massenzahl/Kernladung ist eine passende Operationalisierung.',[ev(HH,[22])])
add('HH','bfea7a23','S','Original verlangt qualitative Umwandlung Masse/Energie in beide Richtungen. Kanonische Ruheenergieformel ist erklärende Operationalisierung, keine zusätzlich wörtlich belegte Formelpflicht.',[ev(HH,[22])])
add('MV','09029573 e4b38061','E','Vollständiger Bewegungsgesetz-/Freifallinhalt steht ausdrücklich J10/E10. J7-Beschleunigungsarbeit trägt keine Kinematik-/Freifallkompetenz und darf E10 nicht zu SekI machen.',[ev(MV,[43,44],[39,40])],('j10-beschleunigt-',))
add('MV','156edddc','E','Gravitationsfeldstärke und radiale Feldlinien sind ausdrücklich J10/E10. Frühere magnetische Feldlinien sind keine Gravitationsfeld-Evidenz.',[ev(MV,[46],[42])],('j10-gravitation-002','j10-gravitation-003'))
add('MV','ec7a0a68','E','J9 behandelt Bahngeschwindigkeit/Umlaufzeit; die kanonisch zusätzlich verpflichtende Winkelgeschwindigkeit steht erst J10/E10. Stromkreis-Mappings tragen den Inhalt nicht.',[ev(MV,[41,46],[37,42])],('j9-ebike-006','j10-gravitation-004'))
add('MV','84ddb244','O','J8 nennt Bildentstehung am Auge und Strahlenmodelle/Simulationen verbindlich. Die im kanonischen Atom enthaltene Linsengleichung steht ausdrücklich unter Vorschlägen zur Vertiefung; kein universelles Pflichtniveau behaupten.',[ev(MV,[29],[25])],('j8-licht-005',))
add('MV','bf8517a9','P','J9 E-Bike nennt Momentan-/Durchschnittsgeschwindigkeit. Kanonische Sekanten- und Tangentensteigungen werden dort nicht voll abgedeckt; feinere Momentanbetrachtung folgt J10/E10.',[ev(MV,[40,41,43],[36,37,39])],('j9-ebike-004','j9-bewegung-005','j10-beschleunigt-004'))
add('MV','e918b31f','P','Radialkraftformel und Abhängigkeiten werden J9 E-Bike behandelt. Eine Herleitung der Formel (Teil des kanonischen Atoms) ist dort nicht belegt. Frühere Stromkreiszeilen sind falsch.',[ev(MV,[41],[37])],('j9-ebike-007',))
add('MV','eb30189c','O','J9 enthält Gleichstrommotor/Lorentzkraft; eigener Motorbau ist ausdrücklich ein Vorschlag zur Vertiefung. Als eigene gewählte Erweiterung möglich, keine allgemeine Pflicht.',[ev(MV,[37,39],[33,35])],('j9-magnetismus-008','j9-induktion-001'))
add('SL','09029573 e4b38061','U','Direkte Zuordnungen stammen u.a. aus Einfallswinkel/Einfallslot, falls-Logik und Beschleunigungsarbeit. Die vier Lower-Pläne enthalten keine entsprechende Freifall-/Dreidiagramm-Kinematik.',[ev(SL7,[20]),ev(SL8,[22]),ev(SL9,[12,13]),ev(SL10,[36,37,38])])
add('SL','156edddc','P','Ortsfaktor g=Fg/m und Recherche anderer Himmelskörper sind J8 belegt. Das gesamte ortsabhängige Vektorfeld samt radialen Gravitationsfeldlinien ist nicht belegt; magnetische/elektrische Radialfelder ersetzen diesen Nachweis nicht.',[ev(SL8,[13]),ev(SL9,[23])],('8-nw-2024-p13-006',))
add('SL','2b700858','P','Astronomie ist J10 ein Wahlthema/Praktikum mit Sternkarte, Parallaxe und Helligkeit. Teleskopoptik existiert J9; eine astronomische Spektroskopie als weiterer Pflichtteil dieses Atoms ist nicht belegt.',[ev(SL9,[15]),ev(SL10,[33,34])],('10-nw-2026-p33-','10-nw-2026-p34-'))
add('SL','4a7cbe83','S','J9 ordnet sichtbares Licht/IR/UV sowie Radio- und Röntgenstrahlung nach Wellenlänge und behandelt Anwendungen/Eigenschaften.',[ev(SL9,[15,16])],('9-nw-2024-p16-',))
add('SL','51de4fd9','S','J8 Temperaturmessung, Genauigkeit und Kalibrierung eines elektrischen Thermometers tragen die Messkompetenz.',[ev(SL8,[32,33])],('8-nw-2024-p33-002',))
add('SL','84ddb244','S','J9 NW S.14 enthält Linsengleichung, experimentelle Prüfung, menschliches Auge als optisches System und Sehfehler. Anders als falsche Augenmaß-Zeilen ist dies eine passende Vollbindung.',[ev(SL9,[13,14])],('9-nw-2024-p14-005','9-nw-2024-p14-006'))
add('SL','af1094c1','S','J10 NW enthält Induktion, Spannungs- UND Stromübersetzungsverhältnis, Anwendungen und Energieübertragung.',[ev(SL10,[13,14])],('10-nw-2026-p13-007','10-nw-2026-p13-009','10-nw-2026-p14-001'))
add('SL','b60f63b6','S','J8 enthält Ausdehnung fester/flüssiger/gasförmiger Stoffe und Temperaturabhängigkeit.',[ev(SL8,[32,33])],('8-nw-2024-p32-001','8-nw-2024-p33-007'))
add('SL','bf8517a9','P','J7 S.25 fordert lediglich mittlere Geschwindigkeit aus Delta s/Delta t; weder Momentangeschwindigkeit noch Tangentensteigung als vollständiger Atomumfang.',[ev(SL7,[25])],('7-2023-p25-005',))
add('SL','e6a50c74','U','Die beiden direkten Mappingzeilen betreffen thermische Materialausdehnung bzw. Vergrößerungsgeräte. Sie enthalten überhaupt keine Strahlendosis, erst recht keine Energie-/Äquivalent-/Effektivdosisberechnung.',[ev(SL8,[33]),ev(SL9,[15])])
add('SL','e918b31f ec7a0a68','U','Stromkreis, elektrisches Radialfeld und thermodynamischer Kreisprozess wurden fälschlich zu Kreisbewegung ausgeweitet. Keine passende Radialkraft-/Winkelgeschwindigkeitsanforderung in diesen vier Lower-Plänen.',[ev(SL7,[14,15]),ev(SL9,[23]),ev(SL10,[23,24])])
add('SL','eb30189c','P','J10 NW S.11 fordert Aufbau beschreiben und Funktion des Gleichstrommotors per UVW-Regel erklären; der eigene Motorbau mit Parametervariation aus dem kanonischen Atom ist nicht gefordert. Leiterschaukelbau ist kein Motorbau.',[ev(SL10,[11])],('10-nw-2026-p11-009',))
add('SN','09029573 e4b38061','S','J9 LB3 enthält beschleunigte Bewegung, Bewegungsgesetze, Diagramme und freien Fall sowie experimentelle Prüfung. Gegenüber den falschen frühen Zeilen ist dies eine tragfähige untere Bindung.',[ev(SN,[36,37],[24,25])],('klassenstufe-9-lb3-',))
add('SN','156edddc','P','J10 Kosmos nennt Gravitationsgesetz/inverses Quadrat, jedoch kein ortsabhängiges Gravitationsvektorfeld und dessen radiale Feldlinien. Gravitationsfeld erscheint erst im oberen Kursteil.',[ev(SN,[42,64],[30,52])],('klassenstufe-10-lb2-',))
add('SN','2b700858','S','J10 Kosmos benennt ausdrücklich Teleskopbeobachtung und Spektralanalyse astronomischer Informationen.',[ev(SN,[42],[30])],('klassenstufe-10-lb2-',))
add('SN','4a7cbe83','S','J10 elektromagnetische Wellen/Licht behandelt Spektrum, Frequenz/Wellenlänge und Anwendungen.',[ev(SN,[43],[31])],('klassenstufe-10-lb3-',))
add('SN','84ddb244','P','J6 Wahlbereich Sehen/Fotografieren enthält Auge/Kamera und qualitative experimentelle Modelle, aber keine quantitative Linsengleichung. Dies trägt nicht den vollständigen kanonischen Atomumfang.',[ev(SN,[23],[11])],('klassenstufe-6-wb1-',))
add('SN','8ac61062','P','J10 Akustik enthält qualitative Lautstärke-Amplitude, Hörbereich und Lärmwirkung. Mathematische Schalldruck-/Pegelbewertung und quantitative Hörrisiken des Atoms sind nicht belegt; ältere Hooke-/Halbleitermappings sind fachfremd.',[ev(SN,[41],[29])],('klassenstufe-10-lb1-',))
add('SN','ad62f563','S','J6 experimentelle Geschwindigkeitsbestimmung fordert Protokollieren; spätere selbstständige Experimente stützen die strukturierte Dokumentation.',[ev(SN,[21,32],[9,20])],('klassenstufe-6-lb2-010-09',))
add('SN','af1094c1','P','J9 nennt Spannungsübersetzung/Wirkungsgrad, Energieübertragung und im Praktikum belasteten Transformator. Stromübersetzungsverhältnis als eigener Teil des kanonischen Atoms ist nicht explizit ausgeführt; passende didaktische Operationalisierung müsste eigens begründet werden.',[ev(SN,[36,38],[24,26])],('klassenstufe-9-lb2-','klassenstufe-9-lb4-'))
add('SN','bf8517a9','P','J9 nennt Durchschnitts-/Momentangeschwindigkeit; die ausgewerteten direkten Mappingzeilen stammen jedoch aus J6-Durchschnittsgeschwindigkeit. Keine vollständige t-s-Sekanten/Tangentenkompetenz im unteren Original belegt.',[ev(SN,[21,37],[9,25])])
add('SN','bfea7a23','P','J10 Kosmos nennt Energiefreisetzung durch Kernfusion, nicht Masse-Energie-Äquivalenz oder E0=mc². Der formale Zusammenhang steht erst im oberen Kurs. Fusion allein ist kein Vollbeleg.',[ev(SN,[42,49,59],[30,37,47])],('klassenstufe-10-lb2-089-03',))
add('SN','e6a50c74','P','J9 Wahlbereich Radioaktivität enthält Dosimeter, Durchdringung/Reichweite und qualitative Schutzfolgerungen. Energie-/Äquivalent-/Effektivdosis unterscheiden und berechnen ist nicht belegt.',[ev(SN,[38],[26])],('klassenstufe-9-wb1-079-03',))
add('SN','e918b31f','P','J9 Wahlbereich3 nennt Radialkraftformel und Anwendung. Die im vollständigen Atom enthaltene Herleitung ist nicht gefordert; optionale Stellung darf nicht als allgemeine Pflicht ausgegeben werden.',[ev(SN,[39],[27])],('klassenstufe-9-wb3-081-02',))
add('SN','eb30189c','P','J7 vergleicht Energiewandler und experimentiert mit Solarzelle/Motor; J8 beschreibt Wärmekraftmaschinen. Eigener Lorentzmotorbau mit Variation ist in keiner dieser Bindungen belegt.',[ev(SN,[28,31],[16,19])],('klassenstufe-7-lb3-041','klassenstufe-8-lb2-051'))
add('SN','ec7a0a68','P','J9 Wahlbereich3 verwendet Bahngeschwindigkeit und Umlaufzeit, aber keine Winkelgeschwindigkeit; diese steht erst im oberen GK-Kurs. Der vollständige kombinierte Atomumfang ist daher nicht lower belegt.',[ev(SN,[39,48],[27,36])],('klassenstufe-9-wb3-081-01',))
add('ST','51de4fd9','S','J6 verlangt ausdrücklich geeignetes Thermometer auswählen und sachgerecht verwenden sowie Temperaturmessungen durchführen.',[ev(ST,[30])],('6-temperatur-und-warme-075','6-temperatur-und-warme-077'))
add('ST','ad62f563','S','J6 Strahlenoptik fordert Protokolle ausgewählter Experimente nach vorgegebenem Schema; echte Dokumentationskompetenz.',[ev(ST,[26,32])],('6-strahlenoptik-023',))
add('ST','b60f63b6','S','J6 Temperatur/Wärme enthält Längen-/Volumenänderung von Stoffen bei Temperaturänderung mit Teilchenmodell.',[ev(ST,[30])],('6-temperatur-und-warme-069',))
add('ST','bf8517a9','P','J6 Wissensbestand nennt Momentan-/Durchschnittsgeschwindigkeit; Rechenanforderung und Diagrammaufträge betreffen Durchschnitt/Ablesen. Keine kanonische Tangentensteigungsberechnung belegt.',[ev(ST,[28,29,45])])
add('TH','37013646','E','PhysikLP2.2.2 beginnt ausdrücklich Klassenstufe10 (S.21); Gezeiten stehen S.22. Amtliche Oberstufenbroschüre S.4–5/PDF6–7 ordnet das reguläre Gymnasium E10 zu. Der pauschale Generatorbucket2.2→SekI9/10 ist kein Gegenbeleg.',[ev(TH,[21,22]),ev(str(BASE/'th-gymnasiale-oberstufe-1.pdf'),[6,7],[4,5])])
add('TH','ad62f563','S','Klassen7/8 verlangen ausdrücklich Dokumentieren physikalischer Erkenntnisse/Beobachtungen in Fachsprache. Retained Seitenanker12/18 liegen vor dem tatsächlichen Wortlaut13/19; Originalseiten sind hier maßgeblich.',[ev(TH,[13,15,19])])
assert set(D)==set(rows),(set(rows)-set(D),set(D)-set(rows))
labels={'S':'supported_lower_operationalization','O':'explicit_optional_lower_extension','P':'partial_lower_not_complete_atom','U':'unsupported_new_lower_supplement','E':'upper_e10_not_lower_supplement'}
result=[]
for key in sorted(rows):
 r=rows[key];status,note,evidence,patterns=D[key]
 for e in evidence:
  f=Path(e['file']);assert f.exists(),f;e['sha256']=hashlib.sha256(f.read_bytes()).hexdigest()
 examples=[b['sourceGoalId'] for b in r['bindings'] if not patterns or any(p in b['sourceGoalId'] for p in patterns)]
 result.append({'state':r['state'],'goalId':r['goalId'],'title':r['title'],'canonicalDescription':r['canonicalDescription'],'originalLowerMembership':r['originalLowerMembership'],'allNewSupplement':not any(r['originalLowerMembership'].values()),'classification':labels[status],'review':note,'primaryEvidence':evidence,'bindingGoalIds':examples,'completeBindingInventory':'bindings.actual.json','mappingPath':r['mappingPath'],'extractionPath':r['extractionPath'],'recommendation':{'S':'Retain with genuine source and ordinary operationalization; repair actual assessment gap if any.','O':'May retain as explicitly reviewed optional extension; do not claim universal official requirement.','P':'Do not treat current partial mapping as full-atom source proof; independently decide narrow scope correction versus explicitly reviewed own extension.','U':'Exclude this newly added lower supplement, preserving original CrossStage targets and retained sources.','E':'Exclude this newly added lower supplement; keep genuine E10 placement and original CrossStage targets.'}[status]})
assert len(result)==45 and all(x['allNewSupplement'] for x in result)
pins=dict(raw['inputPins']);pins['scripts/generate_laender_physics_stage_views.memberships.json']=hashlib.sha256(Path('scripts/generate_laender_physics_stage_views.memberships.json').read_bytes()).hexdigest();pins['scripts/generate_laender_physics_stage_views.py']=hashlib.sha256(Path('scripts/generate_laender_physics_stage_views.py').read_bytes()).hexdigest()
drift=[f for f,h in raw['inputPins'].items() if hashlib.sha256(Path(f).read_bytes()).hexdigest()!=h]
report={'schema':'independent-original-physics-lower-source-review-v1','scope':'19 distinct atoms / 45 Land-atom pairs; original retained PDF pages, whole canonical atom descriptions and exact mapping rows; no source/view/goal mutations','counts':{'pairs':len(result),'atoms':len({r['goalId'] for r in result}),'classifications':dict(collections.Counter(r['classification'] for r in result))},'inputPins':pins,'inputDrift':drift,'stageAuthority':{'TH':{'url':'https://schulportal-thueringen.de/services/lib/download.action?id=1391568','download':'th-gymnasiale-oberstufe-1.pdf','printedPages':[4,5],'pdfPages':[6,7],'finding':'Reguläres Gymnasium E10; LP2012 Kapitel3 E11 betrifft explizit andere Zugänge.'},'MV':{'finding':'J10→E10 established current stage authority, and generator source_unit already maps J10 to E10. A competing false lower mapping must not defeat that source restriction.'}},'limitations':['S means source-compatible operationalization, not every canonical word quoted verbatim in the original.','P is an unresolved full-atom source claim, not evidence that the topic is entirely absent; no automatic catalog deletion is proposed.','No original CrossStage target or canonical prerequisite changes are justified by this review.','Assessment-route inventory is a separate question from source membership.','SN filename2025 does not mean every retained content page is a2025revision; original page edition labels remain2009/2019.'],'rows':result}
(BASE/'independent-original-review.actual.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
lines=['# Unabhängiger Originalquellencheck: neue Physik-SekI-Ergänzungen','','19 Atome,45 Land/Atom-Kombinationen. Alle45 sind neue Supplements und fehlen in beiden ursprünglichen Lower-Mitgliedschaftsmengen. Originale Quellen, CrossStage-Targets und kanonische Prerequisites wurden nicht geändert.','','|Land|Ziel|Befund|Originalseiten|','|---|---|---|---|']
for r in result:
 pages='; '.join(Path(e['file']).name+': '+','.join(map(str,e['printedPages'])) for e in r['primaryEvidence'])
 lines.append('|'+r['state']+'|'+r['goalId']+' '+r['title']+'|'+r['classification']+': '+r['review']+'|'+pages+'|')
lines+=['','Vollständige IDs, Quellbindungen, PDF-Hashes und Klassifikationsgrenzen: independent-original-review.actual.json. Unzureichender Vollbeleg (partial) ist keine Behauptung, dass der gesamte Themenbereich fehlt.']
(BASE/'independent-original-review.md').write_text('\n'.join(lines)+'\n')
print(json.dumps(report['counts'],ensure_ascii=False));print('inputDrift',drift)
