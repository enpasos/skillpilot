import json, hashlib, subprocess
from pathlib import Path
from datetime import datetime, timezone
from collections import Counter

BASE=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18')
P=BASE/'chemie-current450-recycling-atomicity-source-author-20261018-v2'
V1=BASE/'chemie-current450-recycling-atomicity-source-author-20261018-v1'
OUT=BASE/'chemie-current450-recycling-source-successor-independent-c-20261018-v1'
OUT.mkdir(exist_ok=True)
initial_check=OUT/'CHECKS.independent-bounded-current-body-preservation.json'
if initial_check.exists() and json.loads(initial_check.read_text()).get('failures') and not (OUT/'CHECKS.initial-helper-comparison.raw.json').exists():
    (OUT/'CHECKS.initial-helper-comparison.raw.json').write_bytes(initial_check.read_bytes())
    (OUT/'SEAL.initial-helper-run.raw.json').write_bytes((OUT/'SEAL.independent-c.json').read_bytes())
used={}
def pin(path):
    p=Path(path); b=p.read_bytes()
    d={'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
    used[str(p)]=d
    return d
def read(path):
    pin(path)
    return json.loads(Path(path).read_text())
def dump(name,value):
    path=OUT/name
    path.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
    json.loads(path.read_text())
def resolve(o,pointer):
    for k in pointer.strip('/').split('/') if pointer else []:
        k=k.replace('~1','/').replace('~0','~')
        o=o[int(k)] if isinstance(o,list) else o[k]
    return o
def diff(a,b,path=''):
    if type(a)!=type(b):return [path]
    if isinstance(a,dict):
        r=[]
        for k in a.keys()|b.keys():
            r+=diff(a[k],b[k],path+'/'+k) if k in a and k in b else [path+'/'+k]
        return r
    if isinstance(a,list):
        if len(a)!=len(b):return [path]
        return [p for i,(x,y) in enumerate(zip(a,b)) for p in diff(x,y,path+'/'+str(i))]
    return [] if a==b else [path]
common={'role':'INDEPENDENT_INFORMED_SCIENTIFIC_REVIEWER_C','active':False,'reviewAuthority':'ai_candidate','humanApproval':False,'blindInitialDVote':False,'nativeDSerializationClaim':False,'nativeVClaim':False,'M7Claim':False,'assessmentReleaseClaim':False,'actualLearnerPerformanceRecorded':False}
checks=[]
def ck(name,result,details=None):
    checks.append({'check':name,'pass':bool(result),'details':details})

pin('AGENTS.md')
inp=read(P/'INPUTS.actual-pins.json')
pin_fail=[]
for declared in inp['pins']:
    actual=pin(declared['path'])
    if any(actual[k]!=declared[k] for k in ['sha256','bytes']):pin_fail.append({'declared':declared,'actual':actual})
ck('All declared author input pins match current exact bytes',not pin_fail,{'count':len(inp['pins']),'failures':pin_fail})

src=read(P/'operations/source-whole-array-and-clause.exact-CAS.pending.json')
v1src=read(V1/'operations/source-mapping-and-decisions.exact-CAS.pending.json')
members=read(P/'AUTHOR.all-direct-members-of-eleven-unions.pending.json')['memberDecisions']
unions=src['wholeChangedUnions']
ids={u['sourceGoalId'] for u in unions}
ck('Exactly eleven original unions and97 declared edge decisions',len(ids)==11 and len(members)==97)
ck('Exactly79 proposed removed direct edges',sum(d['decision']=='remove_false_direct_contribution_only' for d in members)==79)
outside=[]; refs=[]; all_before=[]; all_after=[]
for i,op in enumerate(src['operations']):
    current=read(op['targetPath'])
    ck('Exact source CAS before '+str(i),resolve(current,op['jsonPointer'])==op['before'])
    if op['jsonPointer'] in ['/mappings','/decisions']:
        def sid(r):return r.get('sourceGoalId',r.get('legacyGoalId'))
        before=[r for r in op['before'] if sid(r) not in ids]
        after=[r for r in op['after'] if sid(r) not in ids]
        # The array transaction explicitly combines two earlier disjoint V1 clauses.
        inherited_ids={x.get('before',{}).get('sourceGoalId',x.get('before',{}).get('legacyGoalId')) for x in src['inheritedV1DisjointOperations'] if x.get('path')==op['targetPath']}
        inherited_rp_ids={x.get('before',{}).get('sourceGoalId') for x in v1src['operations'] if x.get('path')==op['targetPath'] and x.get('jsonPointer','').startswith('/decisions/')}
        inherited_ids|=inherited_rp_ids
        before=[r for r in before if sid(r) not in inherited_ids]
        after=[r for r in after if sid(r) not in inherited_ids]
        outside.append({'path':op['targetPath'],'pointer':op['jsonPointer'],'unrelatedRows':len(before),'exact':before==after})
        for r in before:
            for key,value in r.items():
                if 'scientific' in key.lower():refs.append({'sourceGoalId':sid(r),'key':key,'preservedExactly':any(x==r for x in after)})
        if op['jsonPointer']=='/mappings':all_before+=op['before'];all_after+=op['after']
ck('All unaffected mapping/decision bodies exactly preserved excluding explicitly inherited V1 clauses',all(r['exact'] for r in outside),outside)
ck('Every valid unchanged scientificEvidence body in affected files remains exact',all(r['preservedExactly'] for r in refs),{'referenceBearingFields':len(refs),'fields':refs})
def scientific_fields(value,path=''):
    result={}
    if isinstance(value,dict):
        for k,v in value.items():
            if 'scientific' in k.lower():result[path+'/'+k]=v
            result.update(scientific_fields(v,path+'/'+k))
    elif isinstance(value,list):
        for i,v in enumerate(value):result.update(scientific_fields(v,path+'/'+str(i)))
    return result
nested_refs=[]
for op in src['operations']:
    if op['jsonPointer']!='/decisions':continue
    aft={r['sourceGoalId']:r for r in op['after']}
    for before in op['before']:
        sf=scientific_fields(before)
        if sf:
            af=scientific_fields(aft[before['sourceGoalId']])
            nested_refs.append({'sourceGoalId':before['sourceGoalId'],'fields':list(sf),'exact':all(af.get(k)==v for k,v in sf.items())})
ck('All nested ScientificRef and scientificEvidence field bodies preserved even within combined RP clause',all(r['exact'] for r in nested_refs),nested_refs)
rp_v1=next(x for x in v1src['operations'] if 'DE-RP/' in x.get('path','') and x['jsonPointer'].startswith('/decisions/'))
rp_new=next(r for op in src['operations'] if 'DE-RP/' in op['targetPath'] and op['jsonPointer']=='/decisions' for r in op['after'] if r['sourceGoalId']==rp_v1['before']['sourceGoalId'])
ck('Combined disjoint RP broad clause exactly equals bound V1 after body',rp_new==rp_v1['after'])
for u in unions:
    old=[r for r in all_before if r.get('legacyGoalId')==u['sourceGoalId']]
    new=[r for r in all_after if r.get('legacyGoalId')==u['sourceGoalId']]
    ck('Union arrays reproduce declared whole union '+str(u['inventoryIndex']),old==u['beforeWholeDirectUnion'] and new==u['afterWholeDirectUnion'])
    actual={(x['canonicalGoalId']) for x in old+new}
    declared={x['canonicalGoalId'] for x in members if x['inventoryIndex']==u['inventoryIndex']}
    ck('Every direct old/new edge reviewed '+str(u['inventoryIndex']),actual==declared)

goals=read(P/'candidates/whole-goals.before-after.pending.json')
profiles=read(P/'candidates/whole-profiles.before-after.pending.json')
isolated=read(P/'candidates/hydrolysis-one-field-only.whole-profile-container.after.pending.json')
v1profiles=read(V1/'candidates/whole-profiles.before-after.pending.json')
two=read(P/'AUTHOR.first-secured-hydrolysis-main-chain-judgment.json')
ck('Isolated hydrolysis container changes exactly one German profile field',diff(v1profiles,isolated)==['/after/1/profile/applicationCaseBriefs/1/expectedPerformanceDe'],diff(v1profiles,isolated))
told=read(V1/'materials/polymer-hydrolysis.teacher.DE-EN.pending.json')
tnew=read(P/'materials/polymer-hydrolysis.teacher.DE-EN.pending.json')
ck('Hydrolysis teacher changes exactly German fresh solution',diff(told,tnew)==['/solutions/freshDe'],diff(told,tnew))
newp={x['goalId']:x['profile'] for x in profiles['after']}
oldp={x['goalId']:x['profile'] for x in v1profiles['after']}
recy='8721d943-8368-5304-bd3c-7d7944099662'
hydro='69f2ecbb-ac0a-5d3a-8084-2142706e1161'
ck('All old recycling required expectations preserved as required prefix',newp[recy]['coverageExpectations']['requiredExpectationIds'][:-1]==oldp[recy]['coverageExpectations']['requiredExpectationIds'])
ck('All old recycling whole expectations and cases exact unchanged prefix',newp[recy]['expectations'][:-1]==oldp[recy]['expectations'] and newp[recy]['applicationCaseBriefs'][:-2]==oldp[recy]['applicationCaseBriefs'])
ck('No fixed new task quota and fresh/independent requirements retained',all(newp[recy]['coverageExpectations'][k]==oldp[recy]['coverageExpectations'][k] for k in ['minimumIndependentDemonstrations','freshVariationRequired','independentTransferRequired','alternativeExpectationGroups']))
reuse=read(P/'inputs/current-reuse-whole-goals-and-P.json')
canon=read(reuse['canonical']['path'])
for r in reuse['records']:
    ck('Current full reuse goal '+r['goalId'],resolve(canon,r['canonicalPointer'])==r['wholeCurrentGoal'])
    if 'wholeCurrentPRecord' in r:
        f=Path(r['review']['path']); pin(f)
        record=json.loads(f.read_text().splitlines()[r['line']-1])
        ck('Current full reuse P '+r['goalId'],record==r['wholeCurrentPRecord'])
bp=next(r['wholeCurrentPRecord']['profile'] for r in reuse['records'] if r['goalId'].startswith('b759'))
bn=newp['b759d50d-0e82-5b10-89a2-fe5271106e50']
ck('PEM complete required coverage unchanged',bp['coverageExpectations']==bn['coverageExpectations'])
ck('PEM all old cases retained with original task/solution prefixes',all(all(bn['applicationCaseBriefs'][i][k].startswith(c[k]) for k in ['taskDemandDe','taskDemandEn','expectedPerformanceDe','expectedPerformanceEn']) for i,c in enumerate(bp['applicationCaseBriefs'])))
materials=[]
for f in sorted((P/'materials').glob('*.json')):materials.append({'path':str(f),'object':read(f)})
read(P/'inputs/current-six-complete-recycling-carrier-cases.json')
read(P/'inputs/current-whole-polarimetry-operative-material.json')
read(P/'inputs/eleven-current-whole-unions.before.json')
read(P/'candidates/material-and-source-component-bindings.pending.json')
oldbind=read(V1/'candidates/material-and-evidence-bindings.pending.json')
for x in oldbind['originalWholeMaterials']:read(x['path'])
for x in oldbind['newMaterialFiles']:read(x['path'])
read(V1/'materials/polymer-hydrolysis.learner.DE-EN.pending.json')
read(V1/'materials/recycling-source-cards.learner.DE-EN.pending.json')
views=read(P/'candidates/whole41-view-after.pending.json')
oldviews=read(V1/'inputs/current41-whole-view-bodies.json')
ck('41 complete candidate view bodies',len(views['records'])==41)
def nodes(view):
    out={}
    def visit(ns,parent=None):
        for n in ns:
            key=n.get('id') or n.get('goalId')
            if key:out[(n['kind'],key)]={'parent':parent,**{k:v for k,v in n.items() if k!='children'}}
            visit(n.get('children',[]),key)
    visit(view['rootNodes'])
    return out
viewdeltas=[]
for i,r in enumerate(views['records']):
    before=oldviews['views'][i]['before']; after=r['after']
    bn1,an1=nodes(before),nodes(after)
    lost=[k for k in bn1 if k not in an1]
    changed=[k for k in bn1 if k in an1 and bn1[k]!=an1[k]]
    added=[{'kind':k[0],'id':k[1],**an1[k]} for k in an1 if k not in bn1]
    viewdeltas.append({'viewId':after['viewId'],'scopeExact':before['scope']==after['scope'],'lostExplicitEntries':lost,'changedOldEntries':changed,'addedExplicitEntries':added})
ck('No original explicit view entry, role, stable parent or scope lost/changed',all(x['scopeExact'] and not x['lostExplicitEntries'] and not x['changedOldEntries'] for x in viewdeltas),viewdeltas)
viewops=read(P/'operations/three-qualified-existing-target-view-CAS.pending.json')
compiled=read(P/'checks/actual-all41-production-composition-compiler.json')
ck('Bound author compiler receipt reports zero old target/role/semantic-parent loss',not compiled['failures'] and all(not x['lostTargets'] and not x['lostPrerequisiteOnly'] and not x['roleChanges'] and not x['oldParentChanges'] and not x['afterCompilerErrors'] for x in compiled['rows']),{'receiptOnlyNotIndependentCompilerRun':True})
hold=read(P/'AUTHOR.three-remaining-SN-source-HOLDs.pending.json')
ck('Exactly original SN103,108,114 source HOLDs persist',sorted(x['inventoryIndex'] for x in hold['holds'])==[103,108,114])

primary=read(P/'AUTHOR.actual-primary-source-reading.json')
sources=[]
for s in primary['sources']:
    actual=pin(s['pdf']['path'])
    ck('Primary original PDF exact pin '+s['sourceKey'],actual==s['pdf'])
    sources.append({'sourceKey':s['sourceKey'],'pdf':actual,'physicalPagesOneBased':s['physicalPagesOneBased'],'printedPages':s['printedPages'],'method':'Independent reviewer actually read complete local original pages via pdftotext -layout to stdout. No full-page extraction saved in this package.','scientificAuthority':'original official source, not the author narrative'})

dump('CHECKS.independent-bounded-current-body-preservation.json',{**common,'checks':checks,'passCount':sum(c['pass'] for c in checks),'failures':[c for c in checks if not c['pass']],'globalChecksRun':False,'compilerRunByThisReviewer':False})
dump('PRIMARY.actual-independent-source-reading.json',{**common,'sources':sources,'webVerification':{'SN':'https://www.schulportal.sachsen.de/lplandb/lehrplan/file/521/lnuYavMOfLLQRd2MlehG','SNOriginalReachable':True,'THAndBWWebOpen':'tool fetch failed; pinned whole local originals read directly'},'noPrimaryPageTextSaved':True})

components=[
('hydrolysis-two-main-chain-labels','accept','Die (CH2)4- und (CH2)2-Segmente liegen entlang der linearen Hauptkette. Butan-1,4-diol und Bernsteinsäure sind die passenden neutral dargestellten Hydrolyseprodukte; PET ergibt Ethandiol/Terephthalsäure. Zwei deutsche Benennungen werden korrigiert; Struktur, Produkte, übrige DE/EN-Felder bleiben im isolierten Delta exakt. PE besitzt im gegebenen Gerüst keine Esterstellen; die Negativaussage ist auf diesen Weg begrenzt.'),
('BW5-BW6-composting-complete-goal-P-material','accept','Die Originale verlangen auf gedruckt28/38 vier Verwertungswege. Beide vollständig gegebenen DE/EN-Fälle unterscheiden Stoffrückführung, Energiegewinnung und aeroben Abbau. C-Anteile90/5/5 sind keine Gesamt-Abfallmassen; Rohstoffherkunft und Esterstellen garantieren keine Kompostierung. Frischer PE-Fall wechselt Stoff, Anlagenbedingungen und Quellenzuständigkeit. Alle alten Pflichtfelder/PE-/HB-Energie-/Quellenfälle bleiben erhalten; Hydrolyse wird getrennt nachgewiesen. Dies ist genau BW-Quellbeleg plus ausdrücklich breiterer eigener Zielumfang, keine bundesweite amtliche Vierwegepflicht.'),
('HH16-current-battery-disposal-carrier','accept','Original31 nennt Entsorgung/Recycling von Batterien und Akkumulatoren. Ganzes f9e6-P und beide kompletten Fälle verbinden jeweils Primärbatterie und Akku mit Freisetzungen, Sammlung/Rückgewinnung und positiven Rest-/Energieaufwänden; frischer NiMH-Kontext verhindert pauschale Übertragung. Elektrodenbau wird durch diese konkrete Klausel nicht als eigene Leistung gefordert.'),
('MV32-two-current-thematic-carriers','accept','Original gedruckt28 verlangt Umweltproblematik bei Entsorgung, Rohstoffgewinnung seltener Metalle und Recycling zu diskutieren. f9e6 und f54b decken diese thematischen Komponenten mit ganzen aktuellen P/Fällen. Seltene Metalle werden nicht zu Seltenerdmetallen umgedeutet; Grenzen gemeinsamer Produkte, Erzgehalte und Bilanzgrenzen sind erklärt.'),
('MV32-delete-b632-partial','revise','Die bestehende partial-Kante zum ganzen Quellen-/Argumentecluster b632 ist nicht sachfremd: Der vollständige aktuelle Körper nennt ausdrücklich Bewertungskriterien erkennen und Pro-/Kontra-Argumente abwägen. Dies ist ein direkter methodischer Teil des Originaloperators diskutieren. Dass dieselbe Quelle nicht zusätzlich alle Recherche-, Zitat- und Medienpräsentationsleistungen dieses breiteren Clusters verlangt, widerlegt nur eine Vollzuordnung, nicht den bestehenden partiellen Beitrag. Die V2-Löschbegründung verwendet hier den falschen Vollständigkeitsmaßstab. Eng begrenzte partial-Kante zum argumentativen Diskutieren erhalten; keine neue ganze Quellenvaliditäts-/Recherchepflicht und keine Vollfreigabe des Clusters ableiten.'),
('RP61-polarimetry-current-whole-carrier-material-and-LK-scope','accept','Original36 führt Polarimetrie als Vertiefungs-/Verzahnungsmöglichkeit;35 markiert Spektroskopie W. Der ganze f4d5-Körper/P und komplette Geräte-/Glucose-/Fructosefälle enthalten Polarisator/Probe/Analysator, Leerwert, Winkel, Weglänge, Konzentration und Modellgrenzen. 40,0±0,5g/L und30,0g/L passen zu den vorgegebenen Größen. Die zusätzliche ganze eigene LK-Zielbindung ist ausdrücklich lokal und behauptet keine amtliche Universalpflicht oder persönliche Themenwahl. Bloße Protein-/Zuckernachbarschaft belegt keine Polarimeterroutine.'),
('SL87-SL92-complete-PEM-successor','accept','Original45 bzw64/65 nennt Kathode, Anode, Bipolar-/Trägerplatte, Gasdiffusionslage, katalytische Elektrodenschichten und protonenleitende Membran. Die neuen getrennten DE/EN-Karten erklären alle Bauteile kausal mit Gas-, Wärme-, Elektronen- und Protonenwegen; Gleichungen sind atom-/ladungserhaltend. Frischer Rechts/Links- und blockierter-Ionenweg-Fall prüft das Prinzip. Die vorgegebenen ersten Halbgleichungen gelten nicht als ungelenkte Eigenleistung. Bestehende P-Pflichten bleiben erhalten; Polymersynthese ist keine PEM-Aufbauleistung.'),
('TH136-completed-original-clause-current-battery-carrier-and-GK-LK-placements','accept','Original phys53/gedruckt48 enthält den vollständig reparierten Satz zum Diskutieren von Bedeutung/Problemen des Recyclings elektrochemischer Spannungsquellen. Er gilt über beide Spalten. f9e6-D/P und ganze Fälle passen; die zusätzlichen beiden TH-Zielplatzierungen erhalten getrennte GK-/LK-Sichten und die vollständige eigene Kompetenz.'),
('SN103-pupil-cementation','HOLD','Original phys43/gedruckt31 fordert experimentelles Untersuchen elektrochemischer Fällungsreaktionen und nennt SE/Zementation. 04fa/496 liefern echte theoretische Redox-/Bilanzanteile,16da ausdrücklich vorgegebene Beobachtungs-/Messdaten. Ganze e81-P besitzt keine konkrete gebundene Zementationsvorschrift. Tatsächliche eigene sichere beaufsichtigte Handlung und eigenes Rohprotokoll bleiben offen; Papierdaten erfüllen sie nicht.'),
('SN108-aluminium-choice-component','HOLD','Original phys46/gedruckt34 bezeichnet Wahlbereich2 und nennt Eigenschaften/Einsatz von Aluminium mit Leichtbau, Verpackung/TetraPak und Recycling. Allgemeine Elektrolyse fd79 ist nur übergeordneter Teilbeitrag. Ganzes b7ae-P enthält generische Metall-X/Y-Daten, keine spezifische Aluminium-/Verbundverpackungsbindung; Kunststoffeinteilung/-hydrolyse decken das nicht. Amtlicher Wahlstatus und breiteres eigenes Target bleiben erhalten.'),
('SN114-pupil-cementation','HOLD','Original phys56/gedruckt44 nennt Redoxreihe und elektrochemische Fällung, SE/Zementation. Redoxrollen/Bilanz/abgeleitete Reihe sind passende theoretische Teilbeiträge; vorgeschriebene Schülerhandlung, eigenes Rohprotokoll und Stoff-/Aufsichtsbindung sind weiterhin nicht durch Papierdaten ersetzt.'),
('scope-and-old-scientific-reference-preservation','accept','Exakte ganze Vorher-/Nachher-Vergleiche erhalten sämtliche außerhalb der elf Klauseln liegenden Mapping-/Entscheidungsobjekte einschließlich ScientificEvidence; ausdrücklich übernommene disjunkte V1-Operationen wurden als solche abgegrenzt. Keine neue pauschale6134-Quellenfreigabe.41 vollständige Sichtkörper verlieren keine alte explizite Referenz, Rolle, stabile Elternposition oder Scopefelder. Die gebundene Produktionscompilerquittung berichtet37 Hydrolyse- und3 zusätzliche bestehende Zielplatzierungen, keinen alten Targetverlust; dies ist keine eigene Compilerdurchführung oder fachliche Globalfreigabe.')
]
dump('REVIEW.component-decisions.independent-c.json',{**common,'overallDecision':'revise_one_partial_edge_with_three_SN_HOLDs','sourceClauseBodiesScientificallyAccepted':[5,6,16,32,61,87,92,136],'components':[{'component':c,'decision':d,'reasonDe':r} for c,d,r in components],'blockingRevisionCount':1,'residualSNHoldCount':3,'newIndependentBlindDVoteCount':0})

byid={g['id']:g for g in canon['goals']}
remove_reasons={
'3aef6d91':'Glasübergang/Schmelzverhalten der Makromoleküle erklärt keine der konkreten Batterieentsorgungs-, Polarimetrie-, PEM- oder Zementations-/Aluminiumleistungen.',
'3e9eb5d0':'Die allgemeine Einteilung Thermoplast/Duroplast/Elastomer ist keine direkte Leistung dieser konkreten Nicht-Kunststoffklausel; Werkstoffnachbarschaft allein reicht nicht.',
'6eb14e47':'Radikalischer Synthesemechanismus ist weder Quellenentsorgung noch optische Winkelanalyse, PEM-Zellaufbau oder Metallreaktion. Aus einer Polymermembran folgt keine Synthesepflicht.',
'8721d943':'Der vollständige alte und neue Körper8721 begrenzt seine Stoff-/Energie-/Quellenurteile auf Kunststoffkreisläufe. Er enthält keine spezifische Batterieentsorgungs-, Polarimetrie-, PEM- oder Al-/Zementationsleistung.',
'c8844ac6':'Ganzes Ziel/P beurteilt Bau/Reaktionen und Typen von Primärzellen. Die konkrete Quellzeile verlangt Entsorgung bzw andere chemische Funktion; die übrigen Bauklauseln des Quellkapitels bleiben erhalten.',
'f0939f88':'Ganzes Ziel/P behandelt getrennte galvanische Halbzellen, Ladungsausgleich und Spannung. Das ist hier nur fachliche Grundlage, keine unmittelbare Entsorgungs-, Aluminium-Einsatz- oder Zementations-Eigenhandlung.',
'fd7977bf':'Die erzwungene Elektrolyse ist ein anderer Prozess als freiwillige Brennstoffzelle/Zementation oder Entsorgungs-/Polarimetrieurteil; kein konkreter technischer Recyclingprozess wird aus dem Wort Recycling hinzugefügt.',
'1f30d81c':'Vergleich Elektronen-/Protonenübertragung ist ein anderer Lernnachweis als die konkrete Metall-/Metallionen-Zementation. Passende Elektronenrollen und Bilanz bleiben mit04fa/496 erhalten.',
'065d764c':'Protein-Faltungsstufen und Stabilisierung sind keine Polarimeterfunktion, keine optische Winkelmessung und keine Konzentrationsauswertung; der Querverweis verlangt keine ganze Proteinstrukturkompetenz.',
'127e2fc9':'Ernährungs-/Alltagsbewertung von Zuckern ersetzt keine optische Aktivität oder Geräteleistung der konkreten Polarimetriezeile.',
'197bc2c5':'Peptidverknüpfung ist keine optische Geräte-/Drehwinkelanalyse; ein Verweis auf Proteine erhebt nicht die gesamte Syntheseroutine zur unmittelbaren Polarimetriepflicht.',
'3d3231f9':'Schmelzen/Sieden/Löslichkeit aus Wechselwirkungen sind andere beobachtbare Leistungen als optische Aktivität und Polarimeterfunktion.',
'747c5777':'Permanente Bindungs-/Molekülpolarität ist von linearer Lichtpolarisation und optischer Drehung zu unterscheiden; das aktuelle P leistet keine Polarimetrie.',
'62149f36':'Chiralitäts-/Enantiomerie-/Fischer-D/L-Darstellungen sind strukturelle Grundlagen. Ganze optische Aktivität wird im passenden f4d5-Körper geprüft; allein solche Darstellungen liefern keine direkte Wirkung auf polarisiertes Licht und kein Polarimeterprinzip. Kein Aminosäure- oder Säure/Baseumfang wird aus dem optionalen Querverweis als Pflicht konstruiert.',
'8761cfd2':'Kohlenhydratklassen, Fischer/Haworth, D/L/Anomere und Fehling-Probe sind von einer optischen Winkel-/Geräteleistung verschieden; im ganzen aktuellen Körper ist keine Polarimetrie enthalten.',
'96d33fb6':'Benedict/enzymatische Glucosenachweise mit eigener Durchführung sind andere Analysen. Ihre Erhaltung im Target bleibt unabhängig von der hier sachfremden Polarimetriezuordnung.',
'eb7537dd':'Intermolekulare Kräfte erklären Siede-/Löslichkeitsfälle, nicht die optische Polarimeterwirkung. Ein bloß gemeinsamer Molekülkontext ist kein direkter Teilnachweis.',
'1df17884':'Ethische/ökonomische/soziale Entscheidungsabwägung ist eine andere Leistung als die hier verlangte kausale PEM-Aufbau-/Funktionsbeschreibung.',
'49235cbe':'Atomare Unterenergiestufen/Spektren sind keine PEM-Bauteil- oder Elektrodenfunktion.',
'72236f2c':'Rutherford/Kern-Hülle/Atombausteine sind allgemeine Grundlagen und keine direkte Erklärung des PEM-Aufbaus.',
'93b914d4':'Ganzes P verlangt Herstellung, physikalische/chemische Speicherung und Ketteneffizienz. Die PEM-Zeile verlangt Aufbau/Funktionsweise; der hierfür tatsächlich passende Brennstoffzellenträger bleibt erhalten.',
'f4fa58e7':'Der ganze Cluster Energie/Nachhaltigkeit mit Waschmittel-/Thermodynamikzweigen ist keine direkte PEM-Aufbaupflicht; keine pauschale Kapitelfreigabe.'}
edge_reviews=[]
for m in members:
    idx=m['inventoryIndex']; gid=m['canonicalGoalId']; status='accept'
    if gid.startswith('b632'):
        status='revise'; reason=components[4][2]
    elif m['decision']=='remove_false_direct_contribution_only':reason=remove_reasons[gid[:8]]
    elif gid==recy:reason='Explizite BW-Vierwegeklausel; der ganze Nachfolger8721/P und vollständige Kompostierungs-/PE-Fälle decken genau den Bewertungsoperator. Die bestehende Kante bleibt; kein bundesweiter amtlicher Umfang folgt.'
    elif gid.startswith('b759'):reason='Der vollständige PEM-Funktions-/Reaktionskörper und neue Bauteilzusatz erfüllen unmittelbar den benannten Brennstoffzellenaufbau; die retained-Kante ist sachlich nötig.'
    elif gid.startswith('f093'):reason='Hier SL-PEM: Die galvanische Kopplung getrennter Oxidation/Reduktion sowie äußerer Elektronen- und innerer Ionenweg sind ein echter partieller Funktionsbeitrag. Vollständiger PEM-Bauteilnachweis liegt zusätzlich bei b759.'
    elif gid.startswith('04fa'):reason='Metallzementation enthält Elektronenabgabe/-aufnahme und Donator-/Akzeptorrollen. Diese theoretische Teilkompetenz ist direkt passend und bleibt; Durchführung folgt daraus nicht.'
    elif gid.startswith('4961'):reason='Metall-/Metallionenreaktionen erfordern korrekte Atom-/Ladungs-/Elektronenbilanz. Die erhaltene allgemeine Bilanzierung ist ein wirklicher theoretischer Teilbeitrag, keine SE-Ersatzhandlung.'
    elif gid.startswith('16da'):reason='Ganzes aktuelles P bietet kontrollierte Metallabscheidungen und eine frische andere Reihe. Das passt als Beobachtungs-/Redoxreihenauswertung; die ausdrücklich gelieferten Daten schließen die separate praktische SE-Lücke nicht.'
    elif gid.startswith('fd79'):reason='SN108 nennt im übergeordneten Operator technisch bedeutende Elektrolysen. Das Elektrolyseprinzip trägt diese allgemeine Komponente partiell; Aluminium-Eigenschaften/Einsatz/TetraPak-Recycling bleiben HOLD.'
    elif gid.startswith('f9e6'):reason='Der vollständig gelesene vorhandene Ziel-/P-/Fallkörper behandelt genau Batterien/Akkus, kontrollierte Sammlung, tatsächliche Rückgewinnung und Umweltfolgen mit frischem Materialtransfer. Der neue direkte spezifische Träger ersetzt die Kunststofffehlkante.'
    elif gid.startswith('f54b'):reason='OriginalMV nennt ausdrücklich Gewinnung seltener Metalle. Das aktuelle ganze Ziel/P und beide vollständigen M/N-Fälle diskutieren bedingte Rohstoffgewinnung mit Folgewirkungen und Vergleichsgrenzen.'
    elif gid.startswith('f4d5'):reason='OriginalRP nennt optische Aktivität, Polarimeteraufbau/-funktion und Drehwinkel. Ganzes bestehendes P plus vollständige Geräte-/Glucose-/Fructosematerialien decken diese Leistung einschließlich frischem Geräte-/Bedingungstransfer.'
    else:raise RuntimeError(gid)
    u=next(u for u in unions if u['inventoryIndex']==idx)
    edge_reviews.append({'inventoryIndex':idx,'sourceGoalId':m['sourceGoalId'],'canonicalGoalId':gid,'candidateAction':m['decision'],'independentDecision':status,'reasonDe':reason,'currentWholeGoalLocator':reuse['canonical']['path']+'#'+next('/goals/'+str(i) for i,g in enumerate(canon['goals']) if g['id']==gid),'sourceObjectLocator':m['currentSourceObjectLocator'],'boundCandidateEdgePointer':'AUTHOR.all-direct-members-of-eleven-unions.pending.json#/memberDecisions/'+str(members.index(m))})
dump('REVIEW.all97-direct-edge-decisions.independent-c.json',{**common,'count':97,'decisions':edge_reviews,'decisionCounts':dict(Counter(x['independentDecision'] for x in edge_reviews)),'proposedDeletionResults':dict(Counter(x['independentDecision'] for x in edge_reviews if x['candidateAction']=='remove_false_direct_contribution_only'))})

dump('INPUTS.exact-actually-checked-pins.independent-c.json',{**common,'baseGitCommit':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),'authorV2Package':str(P),'pins':sorted(used.values(),key=lambda x:x['path']),'peerReviewBodyRead':False,'V1Use':'bound input and predecessor only; no authority for scientific judgments','metadataExposure':'Current goal bodies and mapping ScientificEvidence contain existing review identifiers/paths. Those referenced peer QA bodies were not opened. The V2 author narrative is visible and this is informed independent review, not blind D.'})

readme='''# Unabhängige informierte Quellen-/Komponentenprüfung C

Gesamtentscheidung: **REVISE für genau eine partial-Kantenlöschung; drei SN-HOLDs bleiben offen.** Die acht reparierten Klauselkörper sind fachlich gedeckt. Dies ist ein inaktiver KI-Prüfkandidat, keine blinde D-Erststimme, native D/P/V-Freigabe, M7-, Human- oder Assessmentfreigabe.

Die konkrete Revision betrifft MV32 → b6327e98: Der aktuelle ganze Quellen-/Argumentekörper enthält ausdrücklich Bewertungskriterien und Pro-/Kontra-Abwägung. Dieser methodische Teil passt zum Originaloperator „diskutieren“. Dass andere Teile der breiten Kompetenz hier nicht amtlich verlangt werden, rechtfertigt keine Löschung der bestehenden **partial**-Kante. Sie soll eng begrenzt erhalten bleiben. Von 79 vorgeschlagenen Löschungen werden78 bestätigt und diese eine zur Revision gegeben; insgesamt sind96 von97 konkreten Kantenentscheidungen bestätigt.

Bestätigt sind die zwei Hauptkettenkorrekturen, vollständige Kompostierungs-/PEM-Nachfolger, vorhandene Batterie-/Rohstoff- und Polarimetriekörper mit kompletten Materialien sowie die genaue TH-Satzvervollständigung. Amtlicher BW-Vierwegeumfang, optionaler RP-Vertiefungsstatus, technische lokale RP-LK-Bindung, getrennte TH-GK/LK-Sichten und der amtliche SN-Aluminium-Wahlbereich bleiben unterschieden. Alle alten Recycling-/HB-Energie-/PE-Kreislauf-/Quellenpflichten bleiben zusätzlich erhalten.

SN103 und114 brauchen weiterhin tatsächliche eigene beaufsichtigte Zementation mit eigenem Rohprotokoll;16da-Papierdaten leisten nur Theorie/Auswertung. SN108 braucht die spezifische Aluminium-Eigenschafts-/Einsatz-/Verpackungsrecyclingkomponente. Der generische Metallträgerb7ae und allgemeine Elektrolyse schließen sie nicht.

Original-PDF-Seiten wurden vollständig lokal gelesen; vollständige Seitenextraktionen werden hier nicht gespeichert. Die maschinellen Prüfungen sind auf exakte Inputs, ganze betroffene Körper und Erhaltung begrenzt. Der vorhandene Compilerbericht ist ein gebundener Autorenbeleg, keine eigene Compilerdurchführung. Keine neue Gesamtfreigabe der6134Quellen und kein Umschreiben gültiger unveränderter ScientificRefs. Keine Normal-/Registry-/Framework-/Runtimeänderung und keine Fullchecks.

Artefakte: `REVIEW.component-decisions.independent-c.json`, `REVIEW.all97-direct-edge-decisions.independent-c.json`, `PRIMARY.actual-independent-source-reading.json`, `CHECKS.independent-bounded-current-body-preservation.json`, `INPUTS.exact-actually-checked-pins.independent-c.json`, `SEAL.independent-c.json`.

Der erste technische Erhaltungsvergleich übersah bei der Abgrenzung die ausdrücklich kombinierte alte RP-Hydrolyse-Teilklausel aus V1. Dieser Fehlvergleich und sein damaliger Roh-Seal bleiben als `CHECKS.initial-helper-comparison.raw.json` und `SEAL.initial-helper-run.raw.json` archiviert; sie sind keine gültige aktuelle Versiegelung. Die korrigierte Abgrenzung vergleicht diese RP-Zeile exakt mit dem gebundenen V1-Nachherkörper und sämtliche alten verschachtelten ScientificRefs separat. Das wissenschaftliche MV32-REVISE wurde dadurch nicht geändert.
'''
(OUT/'README.md').write_text(readme)
dump('LICENSE-and-attribution.json',{'ownScientificReviewText':'CC-BY-4.0','technicalValidationCode':'Apache-2.0','officialPrimarySources':'Referenced only; no third-party source rights or full primary page text relicensed.'})
helper=OUT/'helpers'/'independent_bounded_evidence_check.py'
helper.parent.mkdir(exist_ok=True)
helper.write_bytes(Path(__file__).read_bytes())
outputs=[]
for f in sorted(OUT.rglob('*')):
    if f.is_file() and f.name!='SEAL.independent-c.json':
        b=f.read_bytes();outputs.append({'path':str(f),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)})
dump('SEAL.independent-c.json',{**common,'sealedUTC':datetime.now(timezone.utc).isoformat(),'overallDecision':'revise_one_partial_edge_with_three_SN_HOLDs','scientificallyAcceptedClauseBodies':8,'edgeDecisions':97,'acceptedEdgeDecisions':96,'edgeRevisions':1,'proposedRemovedEdges':79,'acceptedRemovals':78,'residualSNHoldCount':3,'boundedMechanicalCheckCount':len(checks),'boundedMechanicalFailures':[c for c in checks if not c['pass']],'outputPins':outputs,'helperScriptPin':pin(helper),'normalWrites':False,'globalChecksRun':False,'newPeerQARead':False,'model':'GPT-6 Codex; no further exact model metadata exposed','generationParameters':'not exposed'})
print(json.dumps({'out':str(OUT),'checkCount':len(checks),'failures':[c for c in checks if not c['pass']],'inputPins':len(used),'outputPins':len(outputs),'seal':hashlib.sha256((OUT/'SEAL.independent-c.json').read_bytes()).hexdigest()},ensure_ascii=False,indent=2))
