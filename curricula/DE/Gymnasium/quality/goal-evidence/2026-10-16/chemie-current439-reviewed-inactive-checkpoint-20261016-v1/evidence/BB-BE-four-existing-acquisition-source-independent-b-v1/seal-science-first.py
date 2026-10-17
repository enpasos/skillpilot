# SPDX-License-Identifier: Apache-2.0
"""Independent B source/role judgments. Does not import or execute stock checks."""
import datetime, hashlib, json, pathlib, subprocess
R = pathlib.Path('/home/enpasos/projects/skillpilot')
T = R / 'tmp/chemie-m7-resumed-20261016'
O = T / 'BB-BE-four-existing-acquisition-source-independent-b-v1'
A = T / 'BB-BE-four-crossstage-prerequisite-source-author-successor-v1'
L = T / 'chemie-shared640-recycling-native-author-capsule-L6-v1'
def read(p): return json.loads(p.read_text())
def sha(b): return 'sha256:' + hashlib.sha256(b).hexdigest()
def fp(v): return sha(json.dumps(v, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode())
def pin(p): return {'path':str(p.relative_to(R)), 'sha256':sha(p.read_bytes()),'bytes':p.stat().st_size}
def write(name, obj):
    p=O/name
    with p.open('x') as f: json.dump(obj,f,ensure_ascii=False,indent=2);f.write('\n')
    return pin(p)
cp=L/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
sp=A/'OUTPUTS.FINAL.BB-BE-four-CrossStage-source-acquisition.AUTHOR.selector.json'
cap=A/'CAS.FINAL.four-whole-BB-BE-CrossStage-views.source-supported-acquisition.AUTHOR.inactive.json'
assert pin(sp)['sha256']=='sha256:da694b05b7a7cb22059e9566a869e4db8688b7bdde0003cdab865d4aa8c8b328'
assert pin(cap)['sha256']=='sha256:bf5613e8dfd15f315b8ae5714792810a7481b27ba35972834bbc7eae9ca97f4f'
assert pin(cp)['sha256']=='sha256:37e092408007e0c8c675beda79b667e8dced936c7ec33742082340fcc77fdc80'
cas=read(cap);can=read(cp);by={g['id']:g for g in can['goals']}
ids=sorted(set(i for o in cas['operations']for i in o['expectedAddedEffectiveTargetGoalIds']))
assert len(ids)==55
pv=L/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-current439-paired-F03-private-L6-technical-20261016-v1/P439.exact438-whole-lines-plus-own-F03.for-native-model.jsonl'
prs={r['goalId']:(n,r) for n,l in enumerate(pv.read_text().splitlines(),1) if (r:=json.loads(l))}
raw=read(A/'INPUT.current-four-source-whole-cells-and-four-COMBINED-view-roles.json')
cells=[];inputs=[]
for jur in ['BB','BE']:
    for st in ['lower-secondary','upper-secondary']:
        mp=L/f'curricula/DE/Gymnasium/mapping/DE-{jur}/{st}/{jur.lower()}_chemistry_{st.replace("-","_")}_source_extraction_to_canonical_chemistry.review.json'
        m=read(mp); ep=L/m['sourceExtractionPath']; e=read(ep)
        sg={g['id']:g for g in e['sourceGoals']}; pa={p['id']:p for p in e['passages']}; dec={d['sourceGoalId']:d for d in m['decisions']}
        pp=L/e['sourceDocument']['path']
        inputs.append({'jurisdiction':'DE-'+jur,'stage':st,'mapping':pin(mp),'extraction':pin(ep),'officialPDF':pin(pp),'officialURL':e['sourceDocument'].get('url',e['sourceDocument'].get('sourceUrl'))})
        for x in raw['sourceCells']:
            if not x['cellKey'].startswith(jur+'/'+st+'/'):continue
            i=x['wholeSourceGoal']['id'];g=sg[i];d=dec[i];edges=[q for q in m['mappings']if q['legacyGoalId']==i]
            assert g==x['wholeSourceGoal'] and d==x['wholeDecision'] and edges==x['wholeEdges'] and pa[g['passageId']]==x['wholePassage']
            cells.append({'cellKey':x['cellKey'],'wholeSourceGoal':g,'wholeDecision':d,'wholeEdges':edges,'passageId':g['passageId'],'wholePassageObjectFingerprint':fp(pa[g['passageId']]),'mappingPath':str(mp.relative_to(R)),'sourceExtractionPath':str(ep.relative_to(R))})
assert len(cells)==92
for st in ['lower-secondary','upper-secondary']:
    b={x['wholeSourceGoal']['id'][3:]:x for x in cells if x['cellKey'].startswith('BB/'+st+'/')}
    e={x['wholeSourceGoal']['id'][3:]:x for x in cells if x['cellKey'].startswith('BE/'+st+'/')}
    assert b.keys()==e.keys()
    for k,x in b.items():
        y=e[k]
        for f in ['title','description','sourceText','courseLevel']:assert x['wholeSourceGoal'][f]==y['wholeSourceGoal'][f]
        assert x['wholeDecision']['canonicalGoalIds']==y['wholeDecision']['canonicalGoalIds']
        assert [(q['canonicalGoalId'],q['matchType'])for q in x['wholeEdges']]==[(q['canonicalGoalId'],q['matchType'])for q in y['wholeEdges']]
    assert next(i['officialPDF']['sha256'] for i in inputs if i['jurisdiction']=='DE-BB' and i['stage']==st)==next(i['officialPDF']['sha256'] for i in inputs if i['jurisdiction']=='DE-BE' and i['stage']==st)
sourceindex=write('INPUT.whole-92-source-rows-and-mapping-cells.read-bound.json',{'role':'Whole existing cells re-read from pinned private L6, including all partners; no new source-mapping vote. Passages remain in pinned original extractions. Inherited mapping traces are routing only.','inputs':inputs,'wholeCells':cells,'BB_BE_semanticCellsAndOriginalPDFsEqual':True})
sources={
 'I17':{'doc':'SekI2015','pages':[17],'reason':'Stoffeigenschaften, Aggregatzustände/Teilchenmodell und Struktur-Eigenschaft; Niveaustufen differenziert.'},
 'I18':{'doc':'SekI2015','pages':[18,30,31,34,37,38],'reason':'Wort-/Reaktionsgleichungen, Stoffumwandlung, einfache Atomvorstellung, Masse/Proportionen, Sauerstoff/Redox und quantitative Betrachtungen.'},
 'I20':{'doc':'SekI2015','pages':[19,20,21,22,23,24,25],'reason':'Untersuchung nach Vorgaben, Beobachtung/Deutung, Hypothesenbezug, Daten/Fehler/Protokoll, Quellen, Kriterien und situationsadäquate Schutzmaßnahmen.'},
 'I32':{'doc':'SekI2015','pages':[30,31,32,33,34,35,36,37,38],'reason':'Kern-Hülle/Lewis/Symbole, einfacher Atommodellcharakter, Luftbestandteile, Lösungsvorgänge, molare Größen; Rutherford steht als möglicher Kontext, nicht als universeller Versuch.'},
 'I39':{'doc':'SekI2015','pages':[39,40,41,42,43,44],'reason':'Indikator/pH und Arrhenius als Differenzierung; organische Stoffklassen, Strukturen/Eigenschaften und Ester/Kondensation; Differenzierungen bleiben solche.'},
 'QMETHOD':{'doc':'SekII2022','pages':[11,12,13,14],'reason':'E4–E12, K1–K13, B1–B14 tragen den vollständigen Methoden-/Daten-/Bewertungsoperator auch jenseits engerer SekI-Zellen; keine Pflicht zur Abarbeitung jeder Bewertungsdimension je Aufgabe.'},
 'EPOLICY':{'doc':'SekII2022','pages':[17],'reason':'Schulspezifische Auswahl von E-Wahlpflichtthemen für genannte Schularten, Versuche empfohlen, kursive Vertiefungen; Owner all-authored-topics ist breiterer SkillPilot-Zielumfang, keine amtliche universelle Pflicht und keine gespeicherte Schulauswahl.'},
 'E18':{'doc':'SekII2022','pages':[18],'reason':'Stoffmenge/Avogadro-Konstante/molares Gasvolumen und Quantität im ausgewählten E-Thema; konstante Bedingungen für Avogadros Deutung fachlich erforderlich, keine allgemeine PVT-Theorie genannt.'},
 'E19':{'doc':'SekII2022','pages':[19,20,21,23,24,25],'reason':'Bindungen/EPA/Wechselwirkungen, Lösung, organische Stoffgruppen, Seifen/Tenside/Micellen und Analytik; Status nach S17 bleibt erhalten.'},
 'Q26':{'doc':'SekII2022','pages':[26,27,28,29],'reason':'Gemeinsame Q-Inhalte plus zusätzliche LK-Spalte; integrierte Wiederholung von Bindung/EPA/Wechselwirkungen/Funktionsgruppen. Nicht jede ältere kanonische Phase ist eine amtliche Platzierung.'},
 'Q30':{'doc':'SekII2022','pages':[30,31,32],'reason':'GK: elektrophile Addition, Addition/Substitution als Reaktionstyp, Polymerisation/Polykondensation. LK zusätzlich: nucleophile Substitution an Halogenalkanen zu Alkoholen und Gesamtgleichungen. Keine LK-Mechanismen pauschal für GK.'},
 'Q34':{'doc':'SekII2022','pages':[34,35,36,37],'reason':'GK kinetische Teilchenenergie/Temperatur/Aggregatzustand, Solvatation und kalorimetrische Untersuchungen. Kein ausdrücklich vollständiger Gasdruck-/Kompressionsoperator.'},
 'Q38':{'doc':'SekII2022','pages':[38,39,40],'reason':'Linke GK-Spalte und Einleitung fordern radikalische Substitution Alkan/Halogen unter Licht/Wärme; gilt auch LK. LK-Zusätze betreffen quantitative Kinetik und Oberflächenkatalyse.'},
 'Q48':{'doc':'SekII2022','pages':[48,49],'reason':'Nur LK Indikatorfarbstoffe: Mesomeriemodell, π-Systeme und Modellgrenzen. Einfaches Nitrat/Carbonat ist eine fachliche Einstiegsanwendung desselben Darstellungsoperators; keine Pflicht zur benannten Ionenliste behauptet.'},
 'Q50':{'doc':'SekII2022','pages':[50,51,52],'reason':'Gemeinsame linke GK-Spalte: Oxidationszahlen/Redoxteilgleichungen, Metallverhalten, Alkanol→Säure und Fehling/Tollens-Nachweis. LK-Experiment Oxidation von Alkanolen bleibt getrennt von gemeinsamer Erklärung.'},
 'Q53':{'doc':'SekII2022','pages':[53,54,55],'reason':'GK: galvanische Quellen/Brennstoffzelle, Korrosion, theoretische und technische Elektrolyse, Energie-/Umkehrbarkeitsdeutung und Akku-Laden als Beispiel. LK zusätzlich wässrige Elektrolyse/Faraday und vertieft freiwillig/erzwungen. Enge Papiermodelle behaupten keine GK-Pflicht sämtlicher LK-Versuche.'}
}
groups=[
 ('basic','5338b54c 988888bb fcc73fb5',['I17','I32','E19','Q26'],'KEEP','Die konkreten Stoff-/Zustands-/Lösungsoperatoren sind gedeckt; kein umfassender Oberstufencluster wird verdeckt als Einzelziel referenziert.'),
 ('lab','1351706f 13d4f336 266a2b2a 416dfd33 4b6d1824 7be6f951 805a2f58 9e656697 e81a4aed ebaae4f5',['I20','QMETHOD'],'KEEP','Situationsgebundene Labor-/Schutz-/angeleitete Untersuchungskompetenz passt. Die zwei kleinen echten Cluster werden als canonicalSubtree mit beiden wirklichen Kindern erschlossen. 805 prüft vorgegebene örtliche Sammelwege, keine universelle deutsche Entsorgungschemie.'),
 ('data','4aa3a130 7d9fcc7f 9fc800d1',['I20','QMETHOD'],'KEEP','Die vollständigen Daten-/Fehler-/Hypothesen-/Dokumentationsoperatoren sind besonders durch E8–E12/K7/B3 der gemeinsamen Oberstufe gestützt; Autorlabel SekI allein wird nicht als vollständiger Beweis übernommen.'),
 ('judgment','1df17884 431a0f03 5b1bb5d9',['I20','QMETHOD'],'KEEP','Quellenerschließung, Pro/Contra und Handlungsabwägung passen zu K/B. Vollständige Mehrperspektivität und Strategiereflexion wird mit Q14 belegt; nicht bloß aus allgemeiner Applicability oder requires gewonnen.'),
 ('reaction','11bea4c6 17fe22c4 1bdaf7f2 2dae4132 8d4ef102 9b5d6326 bcf8b24b e0d05c36 e7c363d4 fa203f3a',['I18','I20','I32','Q50'],'KEEP','Echte SekI-Erwerbsziele statt unsichtbarer Vorwissen-Ersatzrollen; der gesamte Teilgleichungsoperator von11bea wird zusätzlich durch Q50 gedeckt. Daltonname ist konkrete Modelloperationalisierung; keine direkte amtliche Dalton-Namenspflicht behauptet. Luft und Verbrennung sind in S30/31/33 direkt verknüpft.'),
 ('atoms','448815cc 72236f2c 9b56d01e',['I32','E19','Q26'],'KEEP','Bindungs-/Atombau-/EPA-Modelle sind konkretes Inhaltsziel. Rutherfordkontext und EPA im gewählten E-Thema werden nicht als einzig vorgeschriebener Unterrichtsweg dargestellt.'),
 ('avogadro','1e5a4b89',['I32','EPOLICY','E18'],'KEEP','Erklärender Zusammenhang n=N/NA und V=nVm bei gleichemT,p trägt das enge Avogadroziel; kein kinetischer Stoßmechanismus gefordert. Die E-Quelle bleibt Wahlpflicht und Owner-alltopics erweitert nur den SkillPilot-Zielumfang.'),
 ('gas','5c4788a7',['I20','I32','EPOLICY','E18','Q34'],'HOLD','Das ganze aktuelle P verlangt Druck durch Wandstöße, Erwärmen bei konstantN,V und isothermeKompression bei konstantN,T. SekI33 behandelt Zustandswechsel/Differenzierung; S20 ist allgemeine Modellkompetenz; E18 verlangt Avogadro/molaresVolumen; Q34 Temperatur/kinetischeEnergie/Aggregatzustand. Daraus ist der volle Gasdruck-/Volumenoperator als amtlich gestütztes vorhandenes Topic nicht hinreichend nachgewiesen. Physikalische Richtigkeit und gültige alteP-Prüfung bleiben unbeanstandet. Alltopics ersetzt diesen fehlenden spezifischen Quellenschritt nicht.'),
 ('organic','28bb9d15 5851b53a 5a30273a 70b34ae7 858d56e0 a3788e40 d2ccd1d5',['I39','EPOLICY','E19','Q26','Q50'],'KEEP','Ganze Stoffgruppen-/Struktur-/Indikator-/Oxidations- und Esteroperatoren passen zu SekI plus integrierterQ-Wiederholung; tertiäre Alkoholgegenbeispiele sind begrenzte Vergleichsoperationalisierung, kein zusätzlicher Versuchskatalog.'),
 ('halogens','17acbdec e5aefd51',['EPOLICY','E19','Q30','Q38'],'KEEP','S38/40 stehen radikalische Halogenierung und Mechanismus tatsächlich links im GK. Vergleich zur Halogenaddition an ungesättigteVerbindungen ist begrenzte Verknüpfung zu gemeinsamem Additionsoperator und C=C-Nachweis, keine Erklärung nur aus breitemHerkunftscluster.'),
 ('addition','3fb7dea4',['Q30'],'KEEP','GK nennt elektrophileAddition ausdrücklich an Vinylchloridherstellung ausEthin/HCl. Das Ziel fordert denselben Reaktionsmechanismus an ungesättigtenKohlenwasserstoffen.'),
 ('micelles','6966df95',['EPOLICY','E19','I39'],'KEEP','E24 nennt Seifen/Tensidstruktur,Grenzflächenaktivität,Micellen und Emulgieren; die ganze enge Seifenerklärung ist gedeckt, Status bleibt Wahlpflichtthema.'),
 ('redox','22133f29',['Q50'],'KEEP','Oxidationszahlen plus ausgeglicheneTeil-/Gesamtgleichungen sind links imGK explizit. Die neue Erwerbsrolle ist CrossStage; dasSekI-Bucketlabel ist kein Beweis für volleSekI-Pflicht.'),
 ('electro','70b12d1c b759d50d c95f6059 cc803809 efa24b77',['Q34','Q50','Q53'],'KEEP','Ganze gegenständlicheOperatoren sind mit commonQ gedeckt. 70b-P liest NaCl-Schmelze und vorgegebenenCuCl2-Protokollfall, keine selbständigeallgemeineLösungsproduktvorhersage. c95 erklärt vorgegebeneFilm-/Legierungsdaten, nicht LK-Nanomaterialproduktion. efa vergleicht dieselbe geeigneteZelle und erhält geliefertePb-Gleichung; keine Gibbs-/quantitativeLK-Anforderung. cc803 verknüpft gemeinsamenDonator-Akzeptor-Stoff mit gemeinsamerKalorimetrie.'),
 ('test','973c12d9',['I39','EPOLICY','E19','Q50'],'KEEP','Die tatsächliche Nachweisleistung bleibt im ganzen P verpflichtend zukünftig unter lokal freigegebenem Protokoll; Papierdaten sind kein praktischerNachweis. Q50GK nenntFehling/Tollens, p42SekI Aldehydnachweis; einfacheKeton-/Blindkontrolle ist operationaler Vergleich, keine UniversalNegativregel.'),
 ('lk-resonance','23533087',['I32','Q48'],'KEEP','LK-Mesomerie trägt den vorhandenen Darstellungsoperator einschließlich einfacherMolekülionen als Einstiegsbeispiele; unverändertePauli/Hund-Voraussetzung bleibt außerhalb dieserAkquisitionsfreigabe offen.'),
 ('lk-sn','3899edf4 d4928773',['Q30'],'KEEP','Nur inLK neu: die rechteSpalte verlangt nucleophileSubstitution Halogenalkan→Alkohol und Gesamtgleichung; Hydroxid ist passender Donator und kein GK-Mandat.')
]
used={};rows=[]
for key, prefixes, refs, verdict, reason in groups:
    for pr in prefixes.split():
        hit=[i for i in ids if i.startswith(pr)];assert len(hit)==1,(pr,hit);i=hit[0];assert i not in used;used[i]=key
        scopes=[o['after']['viewId'] for o in cas['operations'] if i in o['expectedAddedEffectiveTargetGoalIds']]
        p=prs.get(i)
        rows.append({'goalId':i,'title':by[i]['title'],'group':key,'newTargetScopes':scopes,'decision':verdict,'reason':reason,'officialEvidenceKeys':refs,'wholeCanonicalGoalObjectFingerprint':fp(by[i]),'wholeCurrentP':None if not p else {'vector':str(pv.relative_to(R)),'line':p[0],'goalFingerprint':p[1]['goalFingerprint'],'profileFingerprint':p[1]['profileFingerprint'],'wholeRecordObjectFingerprint':fp(p[1])}})
assert set(used)==set(ids),(set(ids)-set(used))
material=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/chemie-b007-targeted-scoring-source-binding-author-successor-20261011-v7/review-inputs/twelve-whole-cases.de-en.targeted-v7.json'
science={'role':'Independent source/role scientific FIRST B; own human-readable judgments before all stock schemas/compiles/role checks; AI judgment only. No other current reviewers, root journal, or memory read.', 'frozenUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'authorSelector':pin(sp),'reviewedWholeCAS':pin(cap),'canonical':pin(cp),'P439Vector':pin(pv),'AGENTS':pin(R/'AGENTS.md'),'wholeSourceCellIndex':sourceindex,'officialEvidence':sources,'decisions':rows,'decisionCounts':{k:sum(r['decision']==k for r in rows)for k in ['KEEP','REVISE','HOLD']},'overallDecision':'HOLD exact FINAL whole-view CAS pending full source-fit resolution of5c4788 in all four scopes. Other54 distinct additions KEEP for source/role scope only. Existing authorHOLDs not closed.','requiredRevision':[{'findingId':'B-SOURCE-01','goalId':'5c4788a7-6760-53dc-894e-e04bca6f8cd9','appliesTo':['de-bb-gk','de-bb-lk','de-be-gk','de-be-lk'],'action':'Provide a precise officialBB/BE primary passage or an explicit reviewed authored extension/source decision supporting the whole kineticPVT operator; otherwise omit this newtarget from the source-supported four-view successor. Do not silently convert it to prerequisiteOnly, edit its validP, or infer coverage from requires/applicability.'}],'stageLabelCaveat':'Group names with(SekI) are inherited navigation buckets; source evidence for221/11bea and fullmethod operators also needsQ. They must never be described as proof these wholegoals are uniformly officialSekI obligations.','wholeBoundMaterialsActuallyRead':[{'file':pin(material),'caseLocalKeys':['handling-eye-splash-task','handling-dust-versus-closed-vessel','disposal-identified-local-streams','disposal-missing-identity-hold'],'conclusion':'CompleteDE/EN material,task,solution,criteria and transfer read: Q/R supplies activity-specific rules;W supplies local synthetic streams and deliberateunknown. Fits narrow4b6/805 with no universaldisposal mandate.'}],'currentWholePAdditionallyReadForScope':['17acbdec-5274-510f-8588-0eac164ebbe5','5c4788a7-6760-53dc-894e-e04bca6f8cd9','1e5a4b89-69f1-5379-811e-c8ec76faad2a','efa24b77-0f98-5835-9d82-3e539ab20253','c95f6059-d7c2-5bcd-b61e-95e3577efdb2','70b12d1c-abaf-45c6-ae9e-b571e9cbc126','23533087-89ea-5f29-8ec1-9f2e01197bb6','4b6d1824-20e4-597e-b639-fae401f740f0','805a2f58-29ce-55d0-8a85-42ee486239b3','973c12d9-d863-5292-8c68-9c80cdacf9e2'],'sourceTruthRules':['Unspecified extractedcourse does not implybothprofiles; actualprimarycolumn adjudicated.','Partial/inheritedmapping and allpartners read; no broadancestorcoverage treated aswholegoalclearance.','Owneralltopics preservesoptional/common/LK status and cannot itselfsupply absent officialoperator.','No source/mapping/P/card/image/canonicalmutation or newnationalcoverageclaim.','Valid oldD/P science retained; scope-only decisions here do not rerun orgrantD/P/A/M/V.'],'mechanicsAlreadyRun':{'stockSchemas':0,'stockCompiles':0,'APV':0,'M':0,'central':0,'builds':0,'nativeD':0},'writesOutsideOwnRoot':0,'M7Claim':False,'allRoutesClosed':False,'HumanApproval':False,'HumanTrial':False}
f=write('FIRST.independent-b.whole-source-scope-decisions.before-stock.frozen.json',science)
seal=write('SEAL.FIRST.independent-b.before-stock.json',{'role':'Immutable scientific first, created before stockmechanics','files':[sourceindex,f],'frozenUTC':datetime.datetime.now(datetime.timezone.utc).isoformat()})
print(json.dumps({'first':f,'seal':seal,'counts':science['decisionCounts'],'overall':science['overallDecision']},ensure_ascii=False))
