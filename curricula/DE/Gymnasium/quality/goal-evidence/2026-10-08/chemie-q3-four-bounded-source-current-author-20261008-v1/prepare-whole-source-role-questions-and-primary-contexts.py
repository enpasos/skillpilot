# SPDX-License-Identifier: Apache-2.0
"""Author role clarification, never an independent source or whole-partner approval."""
from pathlib import Path
import hashlib, json, os, re
from urllib.request import Request, urlopen
from concurrent.futures import ThreadPoolExecutor
from bs4 import BeautifulSoup
R=Path.cwd(); D=Path(__file__).resolve().parent
def load(p): return json.loads(Path(p).read_text())
def put(name,x):
    p=D/name; p.parent.mkdir(parents=True,exist_ok=True)
    b=x if isinstance(x,bytes) else (json.dumps(x,ensure_ascii=False,indent=2)+'\n').encode()
    if p.exists(): assert p.read_bytes()==b,p
    else:
        t=p.with_suffix(p.suffix+'.tmp');t.write_bytes(b);os.replace(t,p)
    return {'path':str(p.relative_to(R)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
idx=load(D/'primary/full-original-official-cached-inputs.portable-index.json')
sc=load(D/'scope-four.current480.whole-goals.exact.json'); ids=sc['goalIds']
ds=load(D/'source/selected106-whole-duty-current528-partner-body-contexts.json')
science=load(D/'science/whole8-material-task-model-ten-point-scoring-fresh-transfer.de-en.exact-retained.json')
role={
 ids[0]:{'targetContribution':'Kinetischer Katalysatorbeitrag: Hin- und Rückreaktion schneller, Gleichgewicht bei gleicher Temperatur unverändert; homogene/heterogene Phasenbeispiele.', 'targetCaseIds':['q3-06-a','q3-06-b'], 'doesNotCertify':'Keine selbst durchgeführte Katalyse, keine vollständige Estersynthese-Mechanistik, Enzymstruktur, koordinative Bindung, eigene Energiediagrammproduktion, industrielle Prozessabwägung oder Haber/Bosch-Geschichte.'},
 ids[1]:{'targetContribution':'Bedingte Elektrodenreaktions-/Entladungsentscheidung aus angegebenen lokalen Modellwerten, zusätzlichen Überspannungen und ohmschem Verlust.', 'targetCaseIds':['q3-08-a','q3-08-b'], 'doesNotCertify':'Keine universell pH-unabhängigen Elektrodenpotenziale, kein tatsächlich ausgeführtes Elektrolyseexperiment, keine Faraday-Stoffmengenberechnung oder Herleitung von Nernst/Gibbs-Helmholtz.'},
 ids[2]:{'targetContribution':'Sauerstoff- und Säurekorrosion am Lokalelement: bilanzierte Redox-Teilgleichungen, Metall-Elektronenweg, wässriger Ionenweg und Unterscheidung vom späteren Rost.', 'targetCaseIds':['q3-14-a','q3-14-b'], 'doesNotCertify':'Keine experimentell durchgeführten Fe²⁺-/OH⁻-Nachweise, keine allgemeine Immunität bei O₂-Mangel, kein vollständiges Korrosionsschutz-/Lebenszyklusurteil.'},
 ids[3]:{'targetContribution':'Passiver Schutzfilm und aktive galvanische Opferwirkung mit Kontakt-/Vorratsgrenzen sowie materialgestützter ökologischer und ökonomischer Abwägung.', 'targetCaseIds':['q3-17-a','q3-17-b'], 'doesNotCertify':'Keine durchgeführte Beschichtung/Passivierung/Elektrolyse, kein quantitatives Umweltgesamtranking bei fehlenden Daten und kein unbefristeter Schutz ohne Metall-/Ionenweg oder Opferanodenvorrat.'}}
manual={
 1:'BB/BE: Katalysatorbeitrag ist in der Originaltabelle Leistungskurszusatz; die vollständige Protonierung/SN-Estersynthese-Mechanistik bleibt beim eigenständigen Partner. Target6 allein schließt diese Whole-Pflicht nicht.',
 7:'Wie BB-Originalpflicht1, BE-Mapping wird als eigene Bindung mit vollständigen Partnern erhalten.',
 13:'BW Basisfach: Katalysatorbeitrag im gemeinsamen Ammoniakprozess; Temperatur/Druck/Konzentration und Ausbeuteabwägung bleiben beim Prozesspartner. Katalysator erhöht nicht die thermodynamische Gleichgewichtsausbeute.',
 15:'BW Leistungsfach: Prozessbedingungen UND Leistungen Haber/Bosch sind im ganzen Originalabsatz verbunden; Target6 trägt nur die kinetische Katalysatorerklärung, Geschichte und gesamter Prozessentscheid bleiben andere Rollen.',
 18:'BY allgemeine Sachkompetenz: Modelle/Simulationen, Stoff- und Teilchenebene und mehrere Einflussfaktoren bleiben als ganze Pflicht erhalten. Die vier Originalkurs-Vorkommen bleiben getrennt; Target6 trägt den Katalysatoraspekt, nicht sämtliche Modellkompetenz.',
 23:'HB normalisierter Energieprofil-Titel ist keine wörtliche Originalkompetenz. Die vollständige Seite24 unterscheidet fachliche Katalyse, nachhaltige Bewertung und experimentelle Beispiele. Diagramm-/Bewertungs-/Ausführungsrollen bleiben erhalten.',
 24:'HB Seite27: Enzymaufbau/Funktionsweise steht in Vertiefungen; experimentelle Proteindenaturierung ist eine andere prozessbezogene Pflicht. Allgemeine homogene/heterogene Katalyse wird nicht zur vollständigen Enzym-/Proteinfreigabe erweitert.',
 25:'HB Seite31: Erklärung der Überspannung und Faraday-Berechnungen sind getrennte LK-Pflichten; Target8 trägt nur die Entladungs-/Spannungsentscheidung. Galvanische Zell-, Mess-, Akkumulator-, Faraday- und Ausführungsrollen bleiben unverkürzt.',
 26:'HB ganze Korrosions-/Schutzpflicht: Teilchenmodell und Schutz-/Bewertungsaspekt können Targets14/17 gemeinsam tragen. Kontakt-/Verhaltenspartner15/16 bleiben als eigene Rollen und werden hier nicht neu freigegeben.',
 27:'HE G9 phys15/gedruckt14: Die Originalzeilen „Eigenschaften von Wasserstoff; Katalysatoren“ und „Kreislauf des Wassers; Wasserstoff als Energieträger“ sind im Extraktionsaspekt verbunden. Target6 trägt nur Katalysatoren. Der andere aktuelle Partner bb707… ist Luft/Verbrennung/Löschmittel, kein belegter Wasserzyklus-Träger. Gesamte Wasserzykluspflicht und diese Rollengrenze bleiben offen; keine Wortdeduplizierung als amtliche Atomisierung.',
 28:'HE Q3.1 phys46: Katalyse/einheitliche Temperatur und Phasenunterscheidung sind direkt belegt. Q3.1–3-Verbindlichkeit hängt vom Jahreserlass ab; keine neue Aussage für alle Jahrgänge und Tracks.',
 29:'HE Q3.3 phys47: Überspannung/Zersetzungsspannung im erhöhten Niveau; technische GK/LK-Tags im Graph sind keine normative Umstufung. Vollständige Pflicht und Kursgrenze behalten.',
 30:'HE Q3.5 phys48: ergänzendes Themenfeld, nicht universell verpflichtend; allgemeine Aktivierungsenergie/Katalyse-Rolle wird nicht zur obligatorischen Arrhenius-/Autokatalyse-/Enzymfreigabe.',
 31:'HH Sek I phys22: Korrosion ist ein möglicher Kontext der verbindlichen Reaktions-/Redoxinhalte; Kontextbeispiel ist keine separate landesweit verpflichtende korrosionsspezifische Whole-Pflicht.',
 32:'HH Sek II phys32: Sauerstoffkorrosion trägt Target14; Schutzkompetenz17 ist Anschluss-/Kontextpartner dieser Zeile, nicht aus Sauerstoffkorrosion allein abgeleitete komplette normative Schutzpflicht.',
 33:'HH Sek II phys32: kathodischer Schutz trägt den aktiven Teil von Target17; Target14 ist die erklärende Korrosionsvoraussetzung. Passive Schutzmaßnahmen und vollständige ökologische Abwägung nicht aus dieser Einzelzeile allein behaupten.',
 34:'MV Sek I gedruckt17/phys21: Metall/Sauerstoff, Korrosionsbegriff und wirtschaftliche Schäden im Hinweiskontext. Stoff-/Energieumwandlung und Schülerexperiment bleiben andere Rollen; keine Vertiefungsumstufung.',
 35:'MV Sek II gedruckt28/phys32: vollständige Korrosionsarten, Lokalelemente, Schutz, wirtschaftliche Schäden sowie SE/DE bleiben erhalten. Targets14/17 tragen Erklärung/Schutz, nicht die tatsächlich ausgeführten Experimente.',
 36:'MV verzinnt/verzinkt: Target14 erklärt zugrunde liegende Korrosion, Target17 Schutz-/Defektwirkung; zusätzlicher eigenständiger Verhaltenspartner16 bleibt ganze aktuelle Kompetenz.',
 39:'NI Energiediagramm darstellen: Interpretation der Barrieren in zwei geschriebenen Fällen ersetzt keine eigenständige Darstellung. Die unveränderten Diagrammpartner müssen als Rolle sichtbar bleiben.',
 40:'NI technische Katalysatorbewertung: der Titel von Target6 lautet „beurteilen“, der ganze operative Text fordert Erläutern/Beispiele. Eine ganze industrielle Bewertungsleistung wird aus dem Titel nicht behauptet; weitere aktuelle Bewertungs-/Prozesspartner behalten.',
 41:'NI Stoßtheorie mit vier Einflussfaktoren: Target6 trägt den Katalysatorbeitrag, nicht Temperatur/Druck/Konzentration samt gesamter Stoßtheorie; sämtliche Partnerrollen unverändert.',
 47:'NI phys26: zwei getrennte Durchführungs-/Nachweisoperatoren sind echte Erkenntnisgewinnung. Partner91238… nennt Planen/Durchführen/Protokollieren. Targets14/17 nur Inhalts-/Deutungskontext; keine Durchführung durch synthetische Fälle belegt und keine neue Whole-Partnerfreigabe91238….',
 48:'NI phys26: Korrosionsschutzexperimente durchführen bleibt genuine praktische Rolle bei Partner91238…; Targets14/17 sind fachlicher Kontext. Schriftliche Schutzabwägung ist keine Durchführung.',
 53:'NI phys27 eA: Spannungsdiagramme als Entscheidungshilfe verwenden bleibt erhalten. Die Zahlenmodelle von Target8 tragen begründete Entscheidungen; eigene Diagrammproduktion oder tatsächlich verwendetes graphisches Datenmaterial ist damit nicht automatisch gezeigt.',
 58:'NW metallische Bindung/hydratisierte Ionen: Target8 verwendet Leitungs-/Entladungskontext, schließt nicht die ganze Bindungs-/Leitungskompetenz; alle eigenen Bindungs-/Elektrolysepartner erhalten.',
 62:'Wie NW Grundkurs-Rolle58, der gesamte Leistungskurs-Originalabsatz und Partner bleiben separat erhalten.',
 59:'NW Brennstoffzellen-/Medienkontext: Target6 liefert heterogene Katalyse als unterstützendes Prinzip, die komplette Brennstoffzellenfunktion und Wahl geeigneter Medien bleiben getrennte Rollen.',
 63:'Wie NW Grundkurs-Rolle59, im Leistungskurs getrennt erhalten.',
 61:'NW Estersynthese: Katalysatorprinzip bei Target6, vollständige Alkanol-/Carbonsäure-Reaktion und Mechanismus bei den aktuellen organischen Partnern; nicht durch allgemeines Phasenbeispiel allein freigegeben.',
 69:'Wie NW Grundkurs-Rolle61, im Leistungskurs getrennt erhalten.',
 66:'NW Faraday berechnen: Target8 trägt nur Entladungs-/Spannungskontext. Faraday-Stoffumsatz ist eigenständige aktuelle Partnerkompetenz; kein Rechenersatz durch Zersetzungsspannung.',
 67:'NW Faraday/Nernst/Gibbs-Helmholtz aus experimentellen Daten herleiten: Target8 kann elektrochemischen Kontext geben, leistet keine vollständige Herleitung und keine experimentelle Datenerhebung.',
 68:'NW Stoffgewinnung ökologisch/ökonomisch unter Faraday bewerten: Target8 trägt entladungsbezogenen Kontext, keine quantitative vollständige industrielle/ökologische Bewertung.',
 70:'NW koordinative Bindung: Target6 trägt allgemeine Katalysatorwirkung, nicht Metallkationen-/Ligandenmechanismus; ganze Komplex-/Koordinationspartner bleiben erhalten.',
 71:'NW technisches Syntheseverfahren: Target6 ist Katalysatorbeitrag; gesamter Prozess und Fachbewertung bleiben konkrete eigene Partnerrollen.',
 88:'SN phys50: Korrosion steht im Kontextfeld zur Kinetik, nicht als alleiniger Ganzinhalt Stoßtheorie. Targets14/17 sind hier Kontext, übrige Stoßtheorie-/Kinetikrollen bleiben unverkürzt.',
 89:'SN phys50: Durchschnittsgeschwindigkeit gehört zur Kinetikpflicht. Korrosion als Kontext bei14/17 ersetzt keine Berechnung des zeitlichen Verlaufs.',
 90:'SN phys50: Katalyse in breiter Kinetikpflicht;14/17 sind Korrosionskontext, keine ganze Katalyse-Kinetikfreigabe.',
 91:'SN phys50: experimentelles Untersuchen von Temperatur/Konzentration/Katalysator ist als SE ausdrücklich erhalten. Die vier synthetischen Inhalte ersetzen keine Ausführung; passende praktische Partnerrolle muss unabhängig geprüft werden.',
 93:'SN phys56: Lokalelemente/Korrosion experimentell untersuchen bleibt SE-Ausführungsrolle. Targets14/17 tragen fachliche Erklärung/Schutz, nicht Beobachtung/Handhabung.',
 100:'ST phys56 ist zweistündiges Wahlpflichtfach; nicht als Pflicht sämtlicher gAN/eAN-Projektionen umdeuten. Wasserstoffkorrosion-Erklärung bleibt Inhalt14, Schutz17 ist nur Anschlusskontext.',
 101:'ST Wahlpflicht-Wissensbestand Wasserstoffkorrosion bleibt getrennte Kursrolle; keine zusätzliche universelle Schutzbewertungsanforderung aus dem Stichwort.',
 106:'TH phys54/gedruckt49: Schülerexperiment Fe²⁺/OH⁻ in rechter Kurs-Spalte. Alle sieben unveränderten Partner sind beschrieben, aber keiner fordert ausdrücklich diese Versuchsausführung. Targets14/17 sind fachlicher Erklärungs-/Schutzkontext. Durchführung/Nachweise und normative Spaltenzuordnung bleiben gezielte unabhängige Rollenfrage; nicht als geleistet oder universell verpflichtend behaupten.'}
rows=[]
for n,d in enumerate(ds,1):
    whole=d['wholeOriginalDuty']; src=whole['wholeRetainedExtractionGoal']; selected=[p for p in d['wholeCurrentCanonicalPartners']if p['inThisFourGoalScope']]
    docs=[x for x in idx if x['originalSourceDocument']['path']in {z['path']for z in [whole.get('sourceDocument'),*(whole.get('sourceDocuments')or[])]if isinstance(z,dict)}]
    rows.append({'sourceOrdinalInWhole106':n,'sourceKey':whole['sourceKey'],'wholeRetainedSourceText':src.get('sourceText',src.get('description')),
       'wholeRetainedExtractionGoal':src,'wordingAuthority':'retained extraction; original table/section/operator is authoritative, not synthesized description',
       'originalMappingWholeDecision':whole['wholeCurrentDecision'],'all528PartnerContextFile':'source/selected106-whole-duty-current528-partner-body-contexts.json',
       'allOriginalPartnerRows':whole['allPartnerRows'],'allPartnerWholeBodiesProvided':True,
       'selectedCurrentGoalContributions':[{'goalId':p['wholeCurrentCanonicalPartner']['id'],'originalPartnerRow':p['originalPartnerRow'],**role[p['wholeCurrentCanonicalPartner']['id']],
          'candidateRole':'bounded-content-or-prerequisite-context; not entire original-source obligation closure'}for p in selected],
       'otherCurrentPartnerIds':[p['wholeCurrentCanonicalPartner']['id']for p in d['wholeCurrentCanonicalPartners']if not p['inThisFourGoalScope']],
       'wholeOriginalPrimaryDocuments':docs,'scopeCourseAndOccurrenceFieldsRetained':True,
       'authorConcreteBoundaryDe':manual.get(n,'Den ganzen Originaloperator, Kurs und Kontext beibehalten. Erklärung, Schutz und Bewertung der ausgewählten Ziele getrennt lesen; jeden weiteren Originalaspekt den tatsächlich beschriebenen Partnern zuordnen. Aktuelle ganze Partnerbeschreibungen liegen bei. Eine erhaltene 1:n-Zeile ist keine erneute Whole-Partnerfreigabe.'),
       'twoIndependentCurrentSourceRoleVerdicts':'pending','authorIndependentSourceApproval':False,'wholeSourceUnionApproval':False})
assert len(rows)==106 and sum(len(x['allOriginalPartnerRows'])for x in rows)==528
put('source/whole106-concrete-four-goal-roles-original-operators-and-open-questions.author-candidate.json',{
 'schemaVersion':1,'authorRole':'bounded clarification author, not independent reviewer','sourceRolePairStatus':'A original pending / B original bounded PASS; independent current followups needed',
 'sourceGoalCount':106,'directEdges':155,'allPartnerRows':528,'goalRoles':role,'rows':rows,
 'activeMappingsChanged':0,'activeCanonicalGoalsChanged':0,'entire929DutyApprovalClaim':False,'nativeDOrVApprovalClaim':False,'humanApproval':False})

def fetch(x):
    name,url=x;p=D/'primary'/f'{name}.official-page.complete.html.txt'
    if p.exists(): raw=p.read_bytes()
    else:
        with urlopen(Request(url,headers={'User-Agent':'SkillPilot curriculum quality source review'}),timeout=25)as f:raw=f.read()
    assert b'LehrplanPLUS'in raw and len(raw)>20000
    h=put(f'primary/{name}.official-page.complete.html.txt',raw)
    soup=BeautifulSoup(raw,'html.parser')
    for q in soup(['script','style']):q.decompose()
    txt=soup.get_text('\n',strip=True).encode()
    t=put(f'primary/{name}.official-page.complete.text.txt',txt)
    return {'officialUrl':url,'completeCapturedHTML':h,'completeCapturedText':t,'allFourNativeCourseOccurrencesPreserved':True,
            'actualLiveHTMLFetched':True,'nativeSourceImportWholeRowApproval':False,'humanApproval':False}
urls=[(f'BY{year}-{level}',f'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/{year}/chemie/{level}')for year in [12,13]for level in ['grundlegend','erhoeht']]
with ThreadPoolExecutor(max_workers=4)as pool:actual=list(pool.map(fetch,urls))
put('primary/actual-four-course-whole-official-BY-pages.capture.json',{'documents':actual,'sourceNormalizationNotOfficialQuote':True,'newSourceApproval':False})

# Only these original physical pages were actually read during author preparation;
# all other full original texts remain available for independent whole-role checks.
reads={0:[41,42,53,54],2:[27,30,33,34,40,41],4:[24,27,31,32],5:[15,16],6:[46,47,48],7:[22],8:[32],9:[17,21],10:[28,32],11:[26,27],18:[46,47],19:[66,67],20:[43,50,56],21:[42,51,56],23:[54]}
actual_pages=[]
for n,pages in reads.items():
    x=idx[n];p=R/x['wholePortablePrimaryInput']['path'];ps=p.read_text().split('\f')
    actual_pages.append({'sourceDocument':x['originalSourceDocument'],'portableWholeText':x['wholePortablePrimaryInput'],
       'actualPhysicalPagesRead':[{'physicalPage':k,'wholeOriginalLayoutText':ps[k-1],'pageBytesSha256':hashlib.sha256(ps[k-1].encode()).hexdigest()}for k in pages],
       'allWholeDocumentPagesReviewedClaim':False})
put('primary/actual-author-primary-reading-and-normalized-wording-boundaries.receipt.json',{'actualPhysicalPagesRead':actual_pages,
 'whole106ExtractionGoalsAnd528PartnerBodiesProvided':True,'all24PrimaryDocumentsPortable':True,'fourNativeBYCoursePagesActuallyFetched':True,
 'wholeAllNationwide106OriginalDutiesScientificApprovalByAuthor':False,'actualExperimentsPerformed':False,'unchangedWholeScienceCasesRereviewedClaim':False})
print(json.dumps({'concreteRoleRows':106,'allPartnerRows':528,'directEdges':155,'primaryInputs':24,'actualLiveBYWholeCoursePages':4,'activeWrites':0,'sourcePairApproved':False}))
