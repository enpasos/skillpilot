#!/usr/bin/env python3
# Bounded inactive Chemistry author dossier; Apache-2.0.
import copy, hashlib, json, pathlib, re, shutil
ROOT=pathlib.Path.cwd()
OWN=pathlib.Path(__file__).parent
def read(p): return json.loads(pathlib.Path(p).read_text())
def write(p,x):
    p=pathlib.Path(p);p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def rel(p): return str(pathlib.Path(p).relative_to(ROOT))
def binding(p):
    p=pathlib.Path(p);b=p.read_bytes();return {'path':rel(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def freeze(p,label):
    q=OWN/'inputs'/label;q.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,q)
    return {**binding(p),'frozenWholeInput':binding(q)}
pairs=read(OWN/'INPUT.exact34-whole-goals-and-original-compiler-evidence.actual.json')['rows']
assert len(pairs)==34 and len({(p['goalId'],p['jurisdiction']) for p in pairs})==34
docs=read(OWN/'INPUT.primary-document-discovery-paths.actual.json')['documents']
canonpath=ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
canonical=read(canonpath);byid={g['id']:g for g in canonical['goals']}
SIGMA='3dbd84de-51cb-5ff7-801b-077a54520fed'
GENERIC_NANO='dfbccd62-1203-5d1b-927d-65a4ca41bbad'
inputs=[freeze(canonpath,'canonical.whole.before.json')]
base=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-current402-source-discovery-and-original-obligations-technical-20261013-v1'
for name in ['FINDING.exact58-target-scope-versus-source-evidence-and12-original-obligations.actual.json','checks/baseline.stock-source-course-and-visible-coverage.actual.json']:
    inputs.append(freeze(base/name,'original-'+pathlib.Path(name).name))
for j,path in docs.items(): inputs.append(binding(ROOT/path))
source_paths={}
for j in docs:
    paths=list((ROOT/f'curricula/DE/Gymnasium/input/{j}/upper-secondary/source-extraction').glob('*CHEMIE*.json'))
    merged=[p for p in paths if 'chemie-source-cell-merge-poly18-aro19-final-20261013-v1' in p.name]
    chosen=merged or [p for p in paths if p.name.endswith('.source-extraction.json')]
    assert len(chosen)==1,(j,chosen)
    source_paths[j]=chosen[0];inputs.append(freeze(chosen[0],f'{j}.source-extraction.whole.before.json'))
source_cell='ni-chemistry-sekii-kc2022-q-organik-3-kompetenz-014-d68a5383'
ni_source=read(source_paths['NI']);actualcell=next(g for g in ni_source['sourceGoals'] if g['id']==source_cell)
assert 'Erstsubstitution am Benzol' in actualcell['sourceText']
write(OWN/'INPUT.NI-sigma-complete-source-cell.actual.json',actualcell)
reason={
('BW','f71a2c0a'):('BW.physical41-43.full-layout.txt','LK 3.4.8(4) verlangt die Recherche zu einer weiteren gewählten Stoffklasse; Arzneimittel sind ein mögliches Beispiel. Daraus folgen weder alle OTC-Konsum-/Anwendungsrecherchen noch die drei Wirkstoffstrukturvergleiche als zusätzliches Landespflichtziel. GK hat dieses zusätzliche Wahlbeispiel nicht.','HOLD: Eine tatsächlich ausgewählte Arzneimittelklasse und eine ausdrücklich passende vollständige Aufgabenoperationalisierung könnten ein freiwilliges oder schulisch gewähltes Ziel begründen.'),
('BW','a78aacf9'):('BW.physical41-43.full-layout.txt','LK 3.4.8(4) nennt Waschmittel als eines mehrerer Beispiele für eine weitere ausgewählte Stoffklasse. Es verlangt nicht gleichzeitig sämtliche Enthärter-, Bleich-, Enzym- und Hilfsstofffunktionen als eigenes Pflichtziel. Das GK-Pflichtprogramm erweitert sich damit nicht.','HOLD: Tatsächliche Wahl Waschmittel und vollständige passende Operationalisierung nachweisen; andere Wahlpartner bleiben erhalten.'),
('BW','e56040b5'):('BW.physical41-43.full-layout.txt','LK 3.4.8(4) nennt Silikone als mögliches Beispiel einer weiteren Stoffklasse. Die separate Nano-Pflicht und ein breiter Kunststoffcluster belegen nicht automatisch die vollständige gekoppelte Silikonherstellung/Molekülbau/Kohlenstoffpolymervergleich/Nano-Anwendungsbeschreibung.','HOLD: Eine reale Silikonwahl und unabhängig belegte vollständige Verbindung der Kompetenzen sind möglich; keine automatische Wahl aller Stoffklassen.'),
('NI','f947cd04'):('NI.physical29-32.full-layout.txt','Die Makromolekülpflicht nennt Polymerisation, Polykondensation, Kunststoffklassen und Eigenschaften. Sie verlangt keine eigenständige PU-Bildung samt gezielter Reaktionsführung.','Kein fehlendes Pflichtziel aus dieser Quelle; eine zusätzliche PU-Unterrichtswahl bleibt möglich.'),
('NI','d61ce84f'):('NI.physical29-32.full-layout.txt','Die eA-Pflicht ist ausdrücklich Erstsubstitution am Benzol. Sie verlangt keine Zweitsubstitutions-Dirigenten an Toluol, Phenol, Anilin und Nitrobenzol.','Nicht von der Erstsubstitutionspflicht auf vier zusätzliche Zweitsubstitutionssysteme erweitern.'),
('NI','0278a515'):('NI.physical29-32.full-layout.txt','Allgemeine Polykondensation und Kunststoff-Struktur/Eigenschaft decken nicht die zusätzliche vollständige PLA-Synthese-, Eigenschafts- und Verwendungsbreite. Die dokumentierte Stärke-Kompost-Aufgabe ist ein Unterrichtsbeispiel, keine allgemeine PLA-Pflicht.','Ein gewähltes PLA-Beispiel braucht seine vollständige Operationalisierung; die Polykondensationspflicht bleibt durch unveränderte Träger vertreten.'),
('NI','7f8c990a'):('NI.physical29-32.full-layout.txt','Die Pflicht enthält keinen eigenständigen Copolymer/Homopolymer-Struktur-Eigenschafts-Vorteilsvergleich.','Die PLA→Copolymer→Spezialkunststoff-Kette wird nur aus dem unbelegten Default-Zielscope ausgelassen; kein kanonischer requires-Eintrag wird gelöscht.'),
('NI','9d942907'):('NI.physical47-50.full-layout.txt','„Vom Kautschuk zum High-Tech-Reifen“ ist in A6 ein ausdrücklich mögliches Unterrichtsprogramm. Das ist keine Pflicht zu synthetischem Kautschuk/Vulkanisation plus modifizierter Cellulose und ihren Eigenschaften.','HOLD: Reale Wahl allein deckt noch nicht den zusätzlichen Cellulosepartner; vollständige Beschreibung bleibt erhalten.'),
('NI','e47b22ec'):('NI.physical54-55.full-layout.txt','Die Stärke-Kompost-Beispieldokumentation ist keine landesweite zusätzliche Pflicht zur Erklärung der vollständigen Abbaumechanismen und Bedingungen von Biopolymeren.','Recycling und allgemeine Makromolekülpflicht bleiben erhalten; ausgewählter Abbaukontext kann später gezielt operationalisiert werden.'),
('NI','3dbd84de'):('NI.physical29-32.full-layout.txt','Die tatsächliche eA-Pflicht verlangt den Mechanismus der elektrophilen Erstsubstitution am Benzol. Die σ-Komplex-Zwischenstufe erklärt genau diesen Mechanismus; der Begriff ist eine fachlich notwendige Operationalisierung, kein zusätzlich erfundener amtlicher Wortlaut.','Enger Source-CAS nur für NI-LK: keine Erweiterung auf Zweitsubstitution, Friedel–Crafts oder Säurestärke.'),
('NI','b7b5df21'):('NI.physical29-32.full-layout.txt','Benzol-Erstsubstitution als Mechanismus verpflichtet nicht zur Planung und Steuerung sowohl Friedel–Crafts-Alkylierung als auch -Acylierung.','Das zusätzliche Planungs-/Steuerungsziel wird im Default-Scope ausgelassen; σ-Komplex-LK-Träger bleibt.'),
('NI','413c5ee5'):('NI.physical26-26.full-layout.txt','Die Quelle verlangt Korrosionserklärung, Opferanodenschutz und experimentelle bzw. wirtschaftliche Bezüge. Sie belegt nicht die umfassendere Bewertung verschiedener Schutzstrategien für Metalle/Legierungen.','Die vorhandenen eng passenden Korrosions-/Opferanoden-/Bewertungsträger bleiben; kein neues breites Urteilspflichtziel erzeugen.'),
('NI','4b9810b0'):('NI.physical29-32.full-layout.txt','Die Erstsubstitutionspflicht am Benzol ist kein Beleg für den eigenständigen Vergleich von Säure-/Basenstärken über kombinierte I- und M-Effekte.','Keine Übertragung aus dem Aromatencluster; vorhandene Säure/Base-Grundpflichten bleiben.'),
('NI','e96771d3'):('NI.physical29-32.full-layout.txt','Benzolmodell, aromatische Stabilität und Erstsubstitution tragen nicht die zusätzliche ganze Alltag/Industrie/Gesundheits-Kriterienbewertung aromatischer Stoffe.','Vorhandene tatsächlich belegte Bewertungs- und Gefahrkompetenzen bleiben; kein allgemeiner Capstone als Source-Beleg.'),
('NI','e56040b5'):('NI.physical29-32.full-layout.txt','Makromolekül- und Nano-Pflichten nennen nicht die ganze Silikonherstellung, den Molekülbau, den Vergleich mit Kohlenstoffpolymeren und die gekoppelte Nano-Anwendung.','Weder Kunststoffcluster noch Nano-Cluster erzeugen dieses zusätzliche spezifische Pflichtziel.'),
('NI','73cbd4d8'):('NI.physical29-32.full-layout.txt','Die Makromolekülpflicht verlangt keine Leitfähigkeitserklärung von Kunststoffen über ausgedehnte konjugierte Systeme.','Die allgemeine Polymer-Struktur/Eigenschaftskompetenz bleibt; das spezielle Leitfähigkeitsziel kann freiwillig gewählt werden.'),
('NI','14f1fe97'):('NI.physical29-32.full-layout.txt','Die Quelle verlangt keinen Anwendungs-/Grenzenvergleich leitfähiger Polymere mit Metallen.','Dieses und sein unbelegter Leitfähigkeitsvorgänger werden gemeinsam aus dem Default-Scope ausgelassen; kein verbliebener Zielkonsument wird gestrandet.'),
('NI','6eba90b5'):('NI.physical29-32.full-layout.txt','Kunststoffherstellung und Struktur/Eigenschaft sind kein vollständiger Operator für den Vergleich von Spritzgießen, Thermoformen, Kalandrieren und Extrusion.','Keine vier Verarbeitungsverfahren aus einem breiten Makromolekülcluster ableiten.'),
('HB','f71a2c0a'):('HB.physical33-36.full-layout.txt','Aspirin/weitere Medikamente und Schmerzmittel-Dünnschichtchromatografie sind optionale Kontexte/Experimente. Pflicht sind allgemeinere Arzneimittel-/Aromatenkompetenzen, nicht das vollständige OTC-Konsum-/Anwendungs- und Dreiwirkstoffziel.','HOLD: Tatsächliche schulische Kontextwahl und vollständiger Operator müssen nachgewiesen werden; keine ungeprüfte Wahlannahme.'),
('HB','e47b22ec'):('HB.physical33-36.full-layout.txt','Biologisch abbaubare Kunststoffe stehen bei möglichen Versuchen/Kontexten, nicht als vollständige zusätzliche Abbaumechanismus-/Bedingungspflicht.','HOLD für eine konkrete experimentelle Wahl; allgemeine Kunststoff-/Recyclingpflicht bleibt vertreten.'),
('HB','e56040b5'):('HB.physical33-36.full-layout.txt','Die optionale Silikonquelle verlangt Herstellung, Konstitution, Eigenschaften und Anwendung von Ölen/Harzen/Kautschuken. Sie ist kein Beleg des ganzen e560-Kohlenstoffpolymervergleichs plus Nano-Kopplung.','Die vollständige optionale Öle/Harze/Kautschuke-Pflicht wird separat durch den neuen engen HB-Silikonfamilien-Träger behandelt; Auswahl weiterhin offen.'),
('HB','73cbd4d8'):('HB.physical33-36.full-layout.txt','Die ganze Kunststoff-/Silikonquelle hat keinen Operator zur Leitfähigkeit konjugierter Polymere.','Keine Übertragung aus allgemeiner Kunststoffkunde oder optionalem Silikonkontext.'),
('HB','14f1fe97'):('HB.physical33-36.full-layout.txt','Ein vollständiger Anwendungs-/Grenzenvergleich leitfähiger Polymere mit Metallen ist nicht verlangt.','Das spezielle Vorgänger-/Nachfolgerpaar wird zusammen aus dem Default-Scope ausgelassen; bestehende Lernvoraussetzungen bleiben global intakt.'),
('HB','6eba90b5'):('HB.physical33-36.full-layout.txt','Die Quelle belegt die gesamte Vierverfahren-Verarbeitungskompetenz nicht. Herstellung ausgewählter Kunststoffe ist kein amtlicher Vierverfahren-Bullet.','HB-P19-Extraktionskorrektur ist separat: 021 sowie die operationalisierten 019/022 werden hier weder geändert noch als ganze 2652-Autorität benutzt.'),
('SH','f947cd04'):('SH.physical68-70.full-layout.txt','Die Quelle verlangt Herstellung/Eigenschaften mindestens eines Kunststoffs, in eA vertiefte Mechanismen. Sie schreibt nicht zusätzlich PU samt vollständiger Reaktionsführung vor.','HOLD: Eine tatsächliche PU-Auswahl könnte eine passende Unterrichtsoperationalisierung tragen; sie ist hier nicht belegt.'),
('MV','f947cd04'):('MV.physical20-22.full-layout.txt','Die Quelle nennt Kunststoffklassen, Polymerisation/Polykondensation, PE-Mechanismus und Recycling. Es fehlt der vollständige PU-/Reaktionsführungsoperator.','Kein zusätzlicher PU-Pflichtträger aus der allgemeinen Kunststoffliste.'),
('RP','f947cd04'):('RP.physical64-68.full-layout.txt','Polyaddition an PU/Epoxidharzen steht als optionale Vertiefung. Die vollständige PU-Bildungs-/Reaktionsführungskompetenz ist damit nicht zusätzlich Default-Pflicht.','Die getrennte neue Polyadditions-Mechanismuskompetenz bewahrt die tatsächlich optionale Quelle; schulische Wahl weiterhin offen.'),
('SL','f947cd04'):('SL.physical76-78.full-layout.txt','LK verlangt radikalische Kunststoffherstellung, Klassen, Strukturen und kritische Modernkunststoffrecherche. Das ist kein vollständiger PU-/Reaktionsführungsoperator.','Keine Ableitung aus einer offenen Recherche zu modernen Kunststoffen.'),
('SN','f947cd04'):('SN.physical57-59.full-layout.txt','LK verlangt Polymerisation/Polykondensation und radikalischen Mechanismus, nicht den ganzen PU-/Reaktionsführungsoperator.','Kein zusätzlicher PU-Pflichtträger aus einem allgemeinen Makromolekülcluster.'),
('ST','f947cd04'):('ST.physical54-57.full-layout.txt','Die Kunststoffpflicht und der eA-radikalische Mechanismus belegen keine zusätzliche ganze PU-Bildungs-/Reaktionsführungsaufgabe.','Eine offene Kunststoffbeispielliste ist keine globale PU-Pflicht.'),
}
nano_reasons={
'NI':('NI.physical29-32.full-layout.txt','eA verlangt Nanodimension, größenbedingte Eigenschaften, ausgewählte Nanostrukturen/Oberflächen und Chancen/Risiken. Die vollständige allgemeine Kompetenz dfbccd62 bleibt. Silberpartikel in Funktionskleidung sind ein mögliches Unterrichtsbeispiel; Silber in antimikrobieller Polyolefin-Verpackung ist kein zusätzlich verpflichtendes zweites Ziel. GK besitzt diesen eA-Nano-Operator nicht.'),
'RP':('RP.physical64-68.full-layout.txt','LK-Nanobausteine sind Pflicht; GK-Nanobausteine sind Wahl. Nano-Silber ist als möglicher Stoffkontext fachlich zulässig, aber antimikrobielle Polyolefin-Verpackung ist kein zusätzlich vorgeschriebenes Ziel. Die unveränderte allgemeine Kompetenz dfbccd62 trägt Struktur/Eigenschaften/Anwendung/Risiko; die separate Mindestzahl zwei Anwendungen bleibt bestehen und wird nicht durch eine Verpackung geschlossen.'),
'SN':('SN.physical57-59.full-layout.txt','Nanostrukturen/-oberflächen und Beispiele wie Lotus/Riblets verlangen nicht das ganze Silber-Verpackung-Nutzen/Risikoziel. Fotografisches AgBr-Fixieren mit Silberionen ist eine andere Pflicht und kein Nanopartikelbeleg.'),
'ST':('ST.physical31-31.full-layout.txt','Nanomaterialien/Carbon-Nanotubes im unteren Schulbereich sind kein vollständiger Operator für Ag-Nanopartikel in antimikrobieller Polyolefin-Verpackung mit Nutzen/Risiken.'),
}
for j,(p,r) in nano_reasons.items():reason[(j,'afa7dae7')]=(p,r,'HOLD: Als ausdrücklich gewähltes didaktisches Beispiel möglich; keine zusätzliche Landespflicht oder tatsächliche GK-Wahl behaupten. Kein neues enges Pflichtziel ist durch diese Quelle erforderlich.')
decisions=[]
for p in pairs:
    j=p['jurisdiction'][3:];k=(j,p['goalId'][:8]);assert k in reason,k
    primary,rationale,alternative=reason[k]
    assert p['wholeGoal']==byid[p['goalId']],p['goalId']
    decisions.append({'goalId':p['goalId'],'jurisdiction':p['jurisdiction'],'completeWholeGoalInput':p['wholeGoal'],
      'proposal':'retain-LK-and-bind-actual-first-benzene-substitution-source' if p['goalId']==SIGMA else 'omit-unsubstantiated-default-target-entry',
      'scientificRationale':rationale,'primaryWholeContext':binding(OWN/'primary'/primary),
      'boundedAlternativeOrHold':alternative,'wholeGoalDescriptionsReduced':False,'sourceOperatorOrOtherPartnersRemoved':False,
      'canonicalRequiresChanged':False,'newPrerequisiteOnlyRole':False,'operativeSelectionKnown':False,
      'authority':'unactivated agent author proposal; no independent approval or machine quality closure'})
assert len(decisions)==34 and sum(d['proposal'].startswith('retain') for d in decisions)==1
write(OWN/'AUTHOR.34-whole-goal-source-and-target-dispositions.actual.json',{
 'schemaVersion':1,'exactTupleCount':34,'retainedSourceBoundTupleCount':1,'defaultScopeCorrectionTupleCount':33,
 'cause':'Explicit old CompositionView goalEntry targets outrun the honestly bounded direct jurisdiction/source evidence; source-cluster and capstone inheritance do not justify the full additional bodies.',
 'decisions':decisions,'newMissingGoalRequiredByThis34Analysis':False,
 'preservation':'All 18 whole goal bodies, canonical requires, original source operators and partners remain. Separate six source duties and separate HB-P19 repairs are untouched.',
 'pending':'Fresh independent source and scope review, source-selection/course truth, current native D/P/A/M/V bindings and any authorized integration remain pending.',
 'strictGain':0,'activeWrites':False})
viewcas=[]
for j in docs:
    unwanted={p['goalId'] for p in pairs if p['jurisdiction']=='DE-'+j and p['goalId']!=SIGMA}
    for course in ['gk','lk']:
        p=ROOT/f'curricula/DE/Gymnasium/composition-views/chemie/de-{j.lower()}-{course}.view.json'
        before=read(p);inputs.append(freeze(p,f'{j}.{course}.view.whole.before.json'));after=copy.deepcopy(before);removed=[]
        def prune(nodes):
            out=[]
            for n in nodes:
                if n.get('kind')=='goalEntry' and n.get('goalId') in unwanted:
                    assert n.get('projectionRole','target')=='target';removed.append(copy.deepcopy(n));continue
                if n.get('kind')=='structure': n['children']=prune(n['children'])
                out.append(n)
            return out
        after['rootNodes']=prune(after['rootNodes'])
        q=OWN/'proposals'/f'{j}.{course}.view.whole.after.json';write(q,after)
        viewcas.append({'sourceFile':binding(p),'beforeFrozenWholeFile':binding(OWN/'inputs'/f'{j}.{course}.view.whole.before.json'),
          'afterInactiveWholeFile':binding(q),'removedExplicitTargetEntries':removed,
          'onlyAuthoredDefaultTargetEntriesOmitted':True,'requiresChanges':0,'prerequisiteOnlyConversions':0,
          'applyState':'unactivated conditional CAS; fresh independent scope/source review required'})
write(OWN/'CAS.18-current-whole-composition-views.author-proposals.actual.json',{'schemaVersion':1,'rows':viewcas})
mapdir=ROOT/'curricula/DE/Gymnasium/mapping/DE-NI/upper-secondary'
maps=sorted(p for p in mapdir.glob('*chemistry*.json') if '.review.' in p.name and 'chemie-source-cell-merge-poly18-aro19-final-20261013-v1' in p.name)
assert len(maps)==2,maps
mappingcas=[]
for i,p in enumerate(maps):
    before=read(p);inputs.append(freeze(p,f'NI.mapping-{i}.whole.before.json'));after=copy.deepcopy(before)
    d=next(d for d in after['decisions'] if d['sourceGoalId']==source_cell)
    originalpartners=copy.deepcopy(d['canonicalGoalIds']);assert SIGMA not in originalpartners
    d['canonicalGoalIds'].append(SIGMA)
    d['rationale']='AUTHOR-CAS ONLY: Die eA-Pflicht zur Erklärung des Mechanismus der Benzol-Erstsubstitution trägt den σ-Komplex als notwendige mechanistische Zwischenstufe. Enger zusätzlicher partial-Partner; sämtliche bisherigen Partner unverändert. Keine neue Vollabdeckung der Quelle oder Freigabe bestehender Partner behauptet. Unabhängige Source-/Kurs-/Scopeprüfung und Integration ausstehend.'
    d['reviewedAt']='2026-10-14';d['reviewer']='codex-author-unactivated-no-independent-approval'
    edge={'legacyGoalId':source_cell,'canonicalGoalId':SIGMA,'matchType':'partial','reviewDecisionId':source_cell}
    after['mappings'].append(edge)
    q=OWN/'proposals'/f'NI.mapping-{i}.whole.after.json';write(q,after)
    mappingcas.append({'sourceFile':binding(p),'beforeFrozenWholeFile':binding(OWN/'inputs'/f'NI.mapping-{i}.whole.before.json'),
      'afterInactiveWholeFile':binding(q),'completeOriginalDecision':next(d for d in before['decisions'] if d['sourceGoalId']==source_cell),
      'completeProposedDecision':d,'originalPartnersPreserved':originalpartners,'addedPartialEdge':edge,
      'applyState':'unactivated conditional CAS; author only, no approved registry/source row'})
write(OWN/'CAS.NI-LK-sigma-source-partial-partner.two-carriers.author-proposals.actual.json',{'schemaVersion':1,'actualCompletePrimarySourceCell':actualcell,'rows':mappingcas})
aftercanonical=copy.deepcopy(canonical)
g=next(g for g in aftercanonical['goals'] if g['id']==SIGMA)
assert 'DE-NI' not in g['applicability']['jurisdiction'];g['applicability']['jurisdiction'].append('DE-NI')
q=OWN/'proposals'/'canonical.whole.after.NI-sigma-applicability-only.json';write(q,aftercanonical)
write(OWN/'CAS.NI-sigma-whole-goal-applicability-only.author-proposal.actual.json',{
 'schemaVersion':1,'sourceFile':binding(canonpath),'beforeWholeGoal':byid[SIGMA],'afterWholeGoal':g,
 'inactiveWholeCanonicalAfterFile':binding(q),'change':'Only append DE-NI applicability justified by actual eA first-benzene-substitution source. Full DE/EN texts, tags, requires, examples and quality fields unchanged.',
 'applyState':'Unactivated conditional author CAS; independent source/course/scope review required. No native quality fingerprint rebinding or authority closure.'})
receipts=read(OWN/'PRIMARY.full-context-extraction-receipts.actual.json')
for p in sorted((OWN/'primary').glob('*.txt')):
    j,a,b=re.match(r'([A-Z]+)\.physical(\d+)-(\d+)\.full-layout\.txt',p.name).groups()
    if not any(c['fullContextText']==rel(p) for c in receipts['captures']):
        receipts['captures'].append({'jurisdiction':j,'boundPDF':docs[j],'PDFSHA256':binding(ROOT/docs[j])['sha256'],
          'physicalRange':[int(a),int(b)],'actualCommand':['pdftotext','-f',a,'-l',b,'-layout',docs[j],'-'],
          'fullContextText':rel(p),'sha256':binding(p)['sha256'],'bytes':p.stat().st_size})
receipts['actualCapturedWholeContextCount']=len(receipts['captures']);write(OWN/'PRIMARY.full-context-extraction-receipts.actual.json',receipts)
write(OWN/'NEUTRAL.exact34-whole-goal-source-and-scope-author-inputs.json',{
 'schemaVersion':1,'startedAt':read(OWN/'STARTED.actual.json')['startedAt'],'role':'bounded agent author',
 'exactTupleSelector':[(p['goalId'],p['jurisdiction']) for p in pairs],'tupleCount':34,'distinctWholeGoalCount':18,
 'bindings':inputs,'completeInputScope':'Exact original 34 noJurisdictionEvidence rows with whole goal bodies and compiler evidence; full original finding/baseline; complete canonical landscape; complete 18 current views; nine current complete source extractions; two NI complete mapping carriers; nine actual primary PDFs and 18 fully captured primary page-context extracts.',
 'wholePrimaryCaptures':receipts['captures'],'comparisonOutputs':[
  binding(OWN/'AUTHOR.34-whole-goal-source-and-target-dispositions.actual.json'),
  binding(OWN/'CAS.18-current-whole-composition-views.author-proposals.actual.json'),
  binding(OWN/'CAS.NI-LK-sigma-source-partial-partner.two-carriers.author-proposals.actual.json'),
  binding(OWN/'CAS.NI-sigma-whole-goal-applicability-only.author-proposal.actual.json')],
 'provenance':{'provider':'OpenAI','model':'GPT-6 (Codex agent; exact serving snapshot not exposed)','sourceAuthor':'this agent; parent supplied task bounds and a HB primary discrepancy warning, no peer verdict for this packet used','samplingControls':'not exposed; no values asserted'},
 'strictGain':0,'activeWrites':False,'humanApprovalClaim':False})
print(json.dumps({'tuples':len(decisions),'scopeCorrections':33,'sourceBoundTuple':1,'views':len(viewcas),'explicitEntriesRemoved':sum(len(c['removedExplicitTargetEntries']) for c in viewcas),'mappingCarriers':len(mappingcas),'wholePrimaryCaptures':len(receipts['captures'])}))
