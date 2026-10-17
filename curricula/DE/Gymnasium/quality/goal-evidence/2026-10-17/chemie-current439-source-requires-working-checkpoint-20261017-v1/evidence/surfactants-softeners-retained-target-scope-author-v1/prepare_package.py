import copy
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT=Path('/home/enpasos/projects/skillpilot')
OUT=Path('/mnt/e/skillpilot-chemie-L7-20261017/surfactants-softeners-retained-target-scope-author-v1')
CAN=Path('/mnt/e/skillpilot-chemie-L7-20261017/paired-c95-BB-BE-own-scope-actual-whole650-assembly-technical-v1/candidate.canonical650.paired-concentration-foundations-and-c95-BB-BE.private.json')
VIEWS=CAN.parent/'candidate.whole39views.unchanged-paired48-foundations.private.json'
INV=Path('/mnt/e/skillpilot-chemie-L7-20261017/actual650-current-concentration-and-foundations-stock-applicability-root-v1/INVENTORY.independent-b.current153-grouped-goal-view-cause.v2.json')
CAP=Path('/mnt/e/skillpilot-chemie-L7-20261017/current650-P35-SEM-candidate-bindings-independent-b-v1/capsule')
P439=CAP/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current650-P35-and-SEM-inactive-technical-candidate-v1/P439.actual-current-candidate.404-plus9-plus24-plus2.jsonl'
CLUSTER='c21d430b-424d-5b13-adf6-999f2490d2dc'
ZEO='2d16528c-1424-5999-b3d2-af4593a147fc'
DEG='cc5a626a-dc85-57e2-b422-259f92901545'
MEM='21066929-2b7f-5d31-924b-338677053238'
A78='a78aacf9-92ea-5627-8776-a595111f754c'
JURIS=['DE-HH','DE-MV','DE-RP','DE-SH','DE-SL','DE-SN','DE-ST','DE-TH']
VIEW_IDS=['de-'+j[3:].lower()+'-gym-chemistry-lk' for j in JURIS]

def pin(p):
    p=Path(p)
    if not p.is_absolute():p=ROOT/p
    with p.open('rb') as f:sha=hashlib.file_digest(f,'sha256').hexdigest()
    return {'path':str(p),'sha256':sha,'bytes':p.stat().st_size}

def digest(x):
    return hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()

def write(name,obj):
    p=OUT/name
    if p.exists():
        assert json.loads(p.read_text())==obj
        return p
    with p.open('x') as f:json.dump(obj,f,ensure_ascii=False,indent=2);f.write('\n')
    assert json.loads(p.read_text())==obj
    return p

assert pin(CAN)['sha256']=='e95b2c1a8fd6d4f500598157ea0ae1c3f35b3c8932e492461d377de2824bdcb8'
assert pin(VIEWS)['sha256']=='e922a8d5667c6453fb04f0431c2fba02fbf088caaf8656fad04166abbfb91a60'
assert pin(INV)['sha256']=='7efdd351199547b6199b37f058843641aa698dad2b107f341ec47c84526270f5'
assert pin(P439)['sha256']=='f6c111722952d3cfa2ccb0c49995fd096be2b3ba215dfe6c0dbefe89594e93aa'
canonical=json.loads(CAN.read_text());goals={x['id']:x for x in canonical['goals']}
views=json.loads(VIEWS.read_text());view_by_id={x['viewId']:x for x in views}
inventory=json.loads(INV.read_text());ir={x['goalId']:x for x in inventory['goals'] if x['packageId']=='03-surfactants-softeners'}
assert set(ir)=={CLUSTER,ZEO,DEG,MEM}
for gid,row in ir.items():assert row['wholeCurrentGoal']==goals[gid]
profiles={}
for line in P439.read_text().splitlines():
    row=json.loads(line);profiles[row['goalId']]=row['profile']

pages={'DE-HH':[25],'DE-MV':[35],'DE-RP':[27,29,71],'DE-SH':[68,69,70],
       'DE-SL':[72],'DE-SN':[47,54,55],'DE-ST':[53,54],'DE-TH':[43,55,56],'DE-HE':[42,50,51]}
source_bounds={
 'DE-HH':'S1–4/1.2, physisch/gedruckt25: Fette/Ester/Hydrolyse im gemeinsamen Inhaltsteil, zusätzliche Mechanismus-/Kennzahlanforderungen im erhöhten Niveau. Nachhaltige Waschmittel können im BNE-Kontext thematisiert werden. Daraus folgt weder eine spezielle Zeolithpflicht noch die vollständige biologische Tensidabbaukompetenz. Beide vorhandenen LK-Ziele werden als eigene fachliche Vertiefung dieses bereits verfassten Waschmittelpfades angeboten.',
 'DE-MV':'Physisch35/gedruckt31: allgemeine Mengenrechnung steht vor der LK-Abgrenzung. Unter zusätzlich LK stehen Komplexverbindungen; Wasserhärte/Wasserenthärtung erscheinen in der rechten Hinweisspalte als zusätzlich mögliche Experimente. Das ist weder eine Zeolithstrukturvorschrift noch ein biologischer Abbauwegauftrag. Die beiden bestehenden Ziele sind eigene begrenzte Vertiefungen; kein zusätzlich mögliches Experiment wird als durchgeführt oder universell Pflicht erklärt.',
 'DE-RP':'Physisch/gedruckt27,29,71:16.1 und16.2 sind für Grund- und Leistungsfach als W markiert; im LK-Wahlpool stehen beide mit4h. Stoffgruppen, Härteempfindlichkeit von Seifen, moderne Waschmittel und ökologische Aspekte liefern Kontext. Weder individuelle Auswahl noch die vollständigen Zeolith-/Abbau-Fälle folgen daraus. SkillPilot behält die bereits verfassten LK-Targets gemäß dem Themen-vor-Auswahl-Fluss als eigene Erwerbserweiterung; der amtliche Wahlstatus bleibt erhalten.',
 'DE-SH':'Physisch/gedruckt68–70: Das Sachgebiet funktionale Stoffe lässt Themenwahl zu.69 nennt die verbindlichen Grenzen; grenzflächenaktive Stoffe werden nicht zur universellen LK-Einzelpflicht erklärt.70 beschreibt Struktur/Eigenschaften von Tensiden, Waschmittelbestandteile und kritische Inhaltsstoffbetrachtung. Spezifische Zeolithkapazität und die ganzen mikrobiellen Abbau-/Mineralisierungsfälle sind eigene Erweiterungen des vorhandenen Targets, kein Vollquellenkredit und keine angenommene Lernerwahl.',
 'DE-SL':'Die tatsächlich betrachtete Fassung ist Hauptphase Chemie LK2023, ab Abitur2027, redaktionell2025. Physisch/gedruckt72 trennt Kompetenzerwartungen links und Vorschläge/Hinweise rechts. Fette als Ausgangsstoffe für Seifen/Tenside stehen rechts bei Verwendung. Daraus folgen die beiden ganzen Detailkompetenzen nicht. Der eigene LK-Erwerbsumfang wird ausdrücklich zusätzlich beibehalten; Einführungsphasen- und Grundkursdateien werden nicht ersatzweise als LK-Beleg verwendet.',
 'DE-SN':'Der gepinnte Gymnasiallehrplan trägt die Fassung bis2025; physisch47/gedruckt35 nennt allgemeine LK-Ziele für11/12, physisch54–55/gedruckt42–43 liegen in LK-Wahlbereichen. Silicattetraeder/Chromatographie und Soda/Seifenherstellung sind begrenzte Kontexte, keine amtliche Vollforderung der beiden Ziele. Eigener Erwerbsumfang für bestehende LK-Targets; keine Wahlbereichswahl oder gesamte Zeolith-/Tensidabbaupflicht wird erfunden.',
 'DE-ST':'Physisch/gedruckt53–54 sind ausdrücklich11/12 eAN. Praktikum, organische Reaktions-/Strukturmodelle, Alkanoloxidation und Estermechanismus tragen allgemeine Kontexte. Die ganzen Zeolith-/biologischen Tensidabbaufälle werden daraus nicht exakt als amtliche Pflicht abgeleitet. Eigene LK-Ergänzung; sämtliche dortigen echten Schülerexperimente bleiben separate praktische Anforderungen.',
 'DE-TH':'Physisch43/gedruckt38 erklärt links grundlegendes+erhöhtes Niveau und rechts zusätzliche erhöhte Anforderungen. Physisch55–56/gedruckt50–51 nennt organische Stoffklassen, Esterbildung/-spaltung und rechts enzymatische/basenkatalysierte Fettspaltung. Die besonderen Zeolith-/Tensidabbauroutinen sind eigene LK-Erweiterungen; die höhere Anforderungsspalte wird nicht auf GK übertragen und eine Estersynthese nicht aus dem Papierfall als durchgeführt abgeleitet.',
 'DE-HE':'Bestehender Ursprung: Q4.3 physisch/gedruckt50–51; die erhöhten Inhalte auf51 nennen vereinfachte Struktur/Funktion eines ionentauschenden Enthärters, z.B.ZeolithA, sowie biologische Tensidabbauwege mit Hydrolyse, endständiger Oxidation und mikrobiellerβ-Oxidation. Die bislang vorhandene HE-Quelle/partielle Bindung bleibt unverändert. Das liefert keinen automatischen Vollkredit für sämtliche eigenen Kapazitäts-, Regenerations-, Mineralisierungs- oder Umweltfälle in anderen Ländern.'}
discovery=json.loads((OUT/'PRIMARY-SOURCE-DISCOVERY.json').read_text())
src={x['jurisdiction']:x for x in discovery}
src['DE-SL']=json.loads((OUT/'PRIMARY-SL-LK-DISCOVERY.json').read_text())
he=json.loads((OUT/'PRIMARY-HE-ORIGIN-DISCOVERY.json').read_text())
src['DE-HE']={'jurisdiction':'DE-HE','actualPDF':he['actualPDF'],
 'sourceDocument':{'title':'Hessen Kerncurriculum Chemie gymnasiale Oberstufe, retained current origin document','path':he['actualPDF']['path'],
  'url':'https://kultus.hessen.de/unterricht/kerncurricula-und-lehrplaene/kerncurricula/gymnasiale-oberstufe'},
 'workingText':str(OUT/'source-DE-HE-origin.whole.layout.txt')}
sources=[]
for j in JURIS+['DE-HE']:
    s=src[j];actual=pin(s['actualPDF']['path']);assert actual==s['actualPDF']
    texts=Path(s['workingText']).read_text().split('\f')
    whole_pages=[]
    for n in pages[j]:
        text=texts[n-1];p=OUT/f'{j}-physical-{n:02d}.layout.txt'
        if p.exists():assert p.read_text()==text+'\n'
        else:
            with p.open('x') as f:f.write(text+'\n')
        whole_pages.append({'physicalPDFPage':n,'literalWholeLayoutText':text,'ownExtractionPin':pin(p)})
    sources.append({'jurisdiction':j,'officialDocumentReference':s['sourceDocument'],'actualOriginalPDF':actual,
       'pageConvention':'physical PDF pages one-based; printed page noted in boundary text','wholePrimaryPages':whole_pages,
       'sourceAndCourseBoundary':source_bounds[j],
       'wholeTargetOfficialSourceCredit':False if j!='DE-HE' else 'existing partial source bindings unchanged'})

newcanonical=copy.deepcopy(canonical)
newgoals={x['id']:x for x in newcanonical['goals']}
goal_changes=[]
for gid in [ZEO,DEG]:
    before=copy.deepcopy(goals[gid]);after=newgoals[gid]
    assert 'applicabilityOverrides' not in after['extendedData']
    assert 'skillPilotAcquisitionExtensions' not in after['extendedData']
    after['extendedData']['applicabilityOverrides']={'jurisdiction':JURIS}
    after['extendedData']['skillPilotAcquisitionExtensions']=[]
    for j,vid in zip(JURIS,VIEW_IDS):
        after['extendedData']['skillPilotAcquisitionExtensions'].append({
         'extensionId':'package03-retained-lk-target-'+j+'-'+gid[:8], 'jurisdiction':j,
         'stageIntent':'SekII','courseProfiles':['LK'],'viewIds':[vid],'role':'authored-acquisition-extension',
         'officialWholeSourceCredit':False,'sourceContext':source_bounds[j],
         'acquisitionScope':('Whole existing ordinary zeolite goal and whole P: fixed aluminosilicate framework charge, mobile counterions,1Ca2+:2Na+ exchange, finite capacity, competition, saturation/regeneration and stated resource/effluent limits.' if gid==ZEO else 'Whole existing ordinary surfactant-degradation goal and whole P, with the separately guarded terminology successor: functional-group-specific hydrolysis/oxidation/chain shortening, primary functional loss versus parent removal, intermediates, mineralisation and sorption, plus fresh structural/phase transfer.'),
         'scopeInputBoundary':'Only supported applicabilityOverrides.jurisdiction input is used. This adds no courseProfile, stage or duration override. Current whole views remain CrossStage and retain their LK filter and all existing projection roles.',
         'topicChoiceBoundary':'Own broader retained target before a later topic selector; no universal official duty or persisted/individual learner theme selection is asserted.',
         'executionBoundary':'All supplied cases are prospective synthetic teaching models; no actual ion exchange, regeneration, biodegradation test, chemical assay or learner performance is established.'})
    restored=copy.deepcopy(after)
    restored['extendedData'].pop('applicabilityOverrides');restored['extendedData'].pop('skillPilotAcquisitionExtensions')
    assert restored==before
    goal_changes.append({'goalId':gid,'beforeDigest':digest(before),'afterDigest':digest(after),'before':before,'after':copy.deepcopy(after),
                         'changedFields':['extendedData.applicabilityOverrides','extendedData.skillPilotAcquisitionExtensions']})
for gid in goals:
    if gid not in [ZEO,DEG]:assert goals[gid]==newgoals[gid]
assert goals[CLUSTER]==newgoals[CLUSTER] and goals[MEM]==newgoals[MEM]
candidate_path=write('candidate.canonical650.package03.private.json',newcanonical)

# A narrow bilingual successor; no card is changed to accommodate the old error.
before_profile=copy.deepcopy(profiles[DEG]);after_profile=copy.deepcopy(before_profile);profile_edits=[]
de_old='Ethoxyverkürzung ist Primärabbau,10%CO2-C keine weitgehende Mineralisierung.'
de_new='Die Ethoxyverkürzung beschreibt im gegebenen biologischen Pfad eine Strukturumwandlung; Primärabbau im hier verwendeten Tensidsinn setzt zusätzlich den Verlust der Oberflächenaktivität voraus. Dieser Funktionsverlust ist im Material nicht gemessen und folgt nicht allein aus der90%igen Ausgangsstoffentfernung.10%CO2-C belegen keine weitgehende Mineralisierung.'
en_old='Ethoxy-chain shortening is primary degradation;10%CO2-carbon does not show extensive mineralisation.'
en_new='Ethoxy-chain shortening describes structural transformation in the supplied biological pathway; primary degradation in the surfactant sense used here additionally requires loss of surface activity. That functional loss is not measured in the material and does not follow solely from90%parent removal.10%CO2-carbon does not show extensive mineralisation.'
def replace_leaves(v,path=''):
    if isinstance(v,dict):
        for k,x in list(v.items()):
            if isinstance(x,str):
                y=x.replace(de_old,de_new).replace(en_old,en_new).replace('80%primary disappearance can include intermediates, sorption/biomass','80%parent-substance disappearance can include intermediates, sorption/biomass')
                if y!=x:v[k]=y;profile_edits.append({'jsonPointer':path+'/'+k,'before':x,'after':y})
            else:replace_leaves(x,path+'/'+k)
    elif isinstance(v,list):
        for i,x in enumerate(v):replace_leaves(x,path+'/'+str(i))
replace_leaves(after_profile)
case=next(x for x in after_profile['applicationCaseBriefs'] if x['id']=='energy20-18-d-split-current')
for field,extra in [('taskDemandDe',' Prüfe außerdem, ob die vorgegebenen Daten den Verlust der Oberflächenaktivität bereits belegen oder welche Funktionsmessung dafür fehlt. Eine nur gemessene Ausgangsstoffentfernung ist nicht mit diesem Funktionsverlust gleichzusetzen.'),
                    ('taskDemandEn',' Also assess whether the supplied data establish loss of surface activity or which functional measurement is missing. Measured parent-substance removal alone must not be equated with that functional loss.')]:
    old=case[field];case[field]=old+extra
    profile_edits.append({'jsonPointer':'/applicationCaseBriefs/1/'+field,'before':old,'after':case[field]})
assert len(profile_edits)==8,len(profile_edits)
assert after_profile['coverageExpectations']==before_profile['coverageExpectations']
assert after_profile['variationAxes']==before_profile['variationAxes']
assert 'Ethoxyverkürzung ist Primärabbau' not in json.dumps(after_profile,ensure_ascii=False)
assert 'Gefahrenkarte ist ausdrücklich ein fiktiver Aufgabenbestandteil' in json.dumps(after_profile,ensure_ascii=False)
profile_change={'goalId':DEG,'beforeDigest':digest(before_profile),'afterDigest':digest(after_profile),
 'before':before_profile,'after':after_profile,'exactChangedLeafFields':profile_edits,
 'guardedField':'profile body only; original ledger decision/binding fields are not updated by this package'}
write('P.cc5a.whole-body.proposed-successor.json',after_profile)

cfg_path=CAP/'curricula/DE/Gymnasium/quality/memory-card-review/canonical-chemistry-full.config.json'
cfg=json.loads(cfg_path.read_text());m_path=CAP/cfg['reviewPath'];card_path=CAP/cfg['cardReviewPath']
m_rows=[json.loads(x) for x in m_path.read_text().splitlines() if x.strip()]
card_rows=[json.loads(x) for x in card_path.read_text().splitlines() if x.strip()]
role_rows=[{'goalId':x['goalId'],'currentInputRole':x['status'],'memoryGoalIds':x.get('memoryGoalIds',[]),'deckIds':x.get('deckIds',[]),'existingInputRoleNotNewScienceVote':True} for x in m_rows if x.get('goalId') in [ZEO,DEG]]
related_mem_ids=set([MEM])
for r in role_rows:related_mem_ids.update(r['memoryGoalIds'])
origins={mid:sorted({x['goalId'] for x in m_rows if x.get('status')=='memory_required' and mid in x.get('memoryGoalIds',[])}) for mid in related_mem_ids}
assert origins[MEM]==[DEG]
decks={}
deck_pins=[]
for p in sorted((CAP/'curricula/DE/Gymnasium/memory-decks').glob('*.json')):
    deck=json.loads(p.read_text());decks[deck['deckId']]=(p,deck);deck_pins.append(pin(p))
exclude={'structure','root','module','lesson','vocabulary','grammar','practice','memorization','A1','A2','B1','B2','C1','C2'}
selections=[]
for g in goals.values():
    if g.get('nodeKind')!='memory' and 'memorization' not in g.get('tags',[]):continue
    tags=g.get('tags',[]);filters=[x for x in tags if x.startswith('select:')]
    if not filters:filters=[x for x in tags if not x.startswith('srs-deck') and x not in exclude]
    deck_id=next(x.split(':',1)[1] for x in tags if x.startswith('srs-deck:'))
    p,deck=decks[deck_id]
    chosen=[x for x in deck['cards'] if not filters or set(x.get('tags',[]))&set(filters)]
    selections.append({'goalId':g['id'],'deckId':deck_id,'actualFilterTags':filters,'selectionSemantics':'existing select tags take priority; otherwise OR intersection of existing tags; unchanged',
                       'selectedCardIds':[x['id'] for x in chosen],'actualDeckPin':pin(p)})
assert len(selections)==67
selected=next(x for x in selections if x['goalId']==MEM)
assert selected['selectedCardIds']==['chem_split_tensid_primary_vs_mineralisation']
relevant_card_ids=set()
for x in selections:
    if x['goalId'] in related_mem_ids:relevant_card_ids.update(x['selectedCardIds'])
card_bindings=[{'deckId':x['deckId'],'cardId':x['cardId'],'currentInputRole':x['status'],'necessary':x.get('necessary'),'originGoalIds':x.get('originGoalIds',[]),'existingInputRoleNotNewScienceVote':True} for x in card_rows if x.get('cardId') in relevant_card_ids]
selected_cards=[copy.deepcopy(c) for p,deck in decks.values() for c in deck['cards'] if c['id'] in relevant_card_ids]

def walk(nodes):
    for n in nodes:
        yield n
        yield from walk(n.get('children',[]))
def projection(v):
    claims={}
    def subtree(gid,role,distance,path=()):
        assert gid not in path
        claims.setdefault(gid,[]).append((-distance,role))
        for q in goals[gid].get('contains',[]):subtree(q,role,distance+1,path+(gid,))
    for n in walk(v['rootNodes']):
        if n['kind']=='goalEntry':claims.setdefault(n['goalId'],[]).append((1000000,n.get('projectionRole','target')))
        elif n['kind']=='canonicalSubtree':subtree(n['goalId'],n.get('projectionRole','target'),0)
    result={}
    for gid,r in claims.items():
        top=max(s for s,role in r);roles={role for s,role in r if s==top};result[gid]='target' if 'target' in roles else 'prerequisiteOnly'
    return result
closure=set();stack=[A78]
while stack:
    gid=stack.pop()
    if gid in closure:continue
    closure.add(gid);stack.extend(goals[gid].get('requires',[]))
context_ids=closure|{CLUSTER,ZEO,DEG,MEM}|related_mem_ids
for mid in related_mem_ids:context_ids.update(goals[mid].get('requires',[]))
teacher_rows=[]
for vid in VIEW_IDS:
    proj=projection(view_by_id[vid])
    assert all(proj.get(gid)=='target' for gid in [CLUSTER,ZEO,DEG,MEM])
    missing=[gid for gid in sorted(closure) if not goals[gid].get('contains') and goals[gid].get('semanticKind')!='orientation' and proj.get(gid)!='target']
    teacher_rows.append({'viewId':vid,'scope':view_by_id[vid]['scope'],'directTeacherGoalId':A78,'directTeacherRole':proj.get(A78,'absent'),
     'separateOrdinaryTeacherTargetsStillAbsent':[{'goalId':gid,'title':goals[gid]['title'],'role':proj.get(gid,'absent')} for gid in missing],
     'existingSupportRoles':[{'goalId':gid,'title':goals[gid]['title']} for gid,r in proj.items() if r=='prerequisiteOnly'],
     'allRelevantExistingMemoryRoles':[{'goalId':mid,'role':proj.get(mid,'absent')} for mid in sorted(related_mem_ids)],
     'rawOriginalTargetsUntouched':True})

material=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-energy20-four-defects-targeted-material-author-successor-20261015-v1/materials/forty-two-whole-DE-EN-cases.four-defects-successor.author.json'
assert pin(material)['sha256']=='5762a8f53db8ff2a6f44f98f1495959132bc04541e0af85c0088ace5e9da21fe'
original_cases=[x for x in json.loads(material.read_text())['cases'] if x['id'].startswith('energy20-18-') or x['id'] in ['energy20-11-a','energy20-11-b']]
assert len(original_cases)==6
inputs=[pin(p) for p in [CAN,VIEWS,INV,P439,cfg_path,m_path,card_path,material,ROOT/'app/scripts/applicabilityCompiler.ts',ROOT/'app/src/utils/srsTags.ts',ROOT/'app/src/components/srs/FlashcardDrill.tsx',OUT/'TERMINOLOGY.primary-reading.json']]
inputs+=deck_pins
guards={'schema':'whole-object compare-and-swap proposal; unapplied', 'packageId':'03-surfactants-softeners',
 'baseCanonical':pin(CAN),'baseWhole39Views':pin(VIEWS),'originalP439':pin(P439),
 'canonicalWholeGoalChanges':goal_changes,'positiveProfileWholeBodyChange':profile_change,
 'entireBaseMismatchAction':'abort/rebase; do not partially apply','perObjectMismatchAction':'abort; never patch around a failed whole-object guard',
 'unchangedProtectedWholeGoals':[{'goalId':gid,'digest':digest(goals[gid]),'wholeGoal':goals[gid]} for gid in [CLUSTER,MEM]],
 'noAutoApply':True,'normalL6L7WritesAuthorized':False}
cas_path=write('CAS.whole-two-ordinary-goals-and-one-P-body.unapplied.json',guards)
clean={
 'role':'CLEAN_WHOLE_CONTENT_FOR_TWO_OTHER_INDEPENDENT_REVIEWERS','authorIsIndependentReviewerOfThisProposal':False,
 'packageId':'03-surfactants-softeners','inputPins':inputs,'baseCanonical':pin(CAN),'baseWhole39Views':pin(VIEWS),
 'guardedWholeObjectProposal':guards,'ownNewWholeCanonicalCandidate':pin(candidate_path),
 'wholeEightUnchangedViews':[view_by_id[x] for x in VIEW_IDS],
 'wholeCurrentOrdinaryGoalsAndRelatedContext':[goals[gid] for gid in sorted(context_ids)],
 'wholeCurrentPositiveProfilesContentOnly':[{'goalId':gid,'wholeProfile':profiles[gid]} for gid in sorted(context_ids) if gid in profiles],
 'wholeProposedChangedPositiveProfileContentOnly':{'goalId':DEG,'wholeProfile':after_profile},
 'originalMaterialSource':pin(material),'wholeOriginalSixDEENCases':original_cases,
 'originalMaterialBoundary':'Retained historical original cases are not silently rewritten. In particular the current positive-profile cases already corrected historical EPA/branching overclaims and remain the operative whole-model material; the new candidate only adds the separately guarded primary-degradation terminology correction. Original answer keys do not establish learner performance.',
 'wholePrimarySourcesAndPages':sources,'primaryTerminologyReading':json.loads((OUT/'TERMINOLOGY.primary-reading.json').read_text()),
 'wholeExistingRelatedMemoryGoals':[goals[mid] for mid in sorted(related_mem_ids)],
 'actualCurrentMemoryRequirementInputs':role_rows,'actualReviewedOriginRoutesByMemoryGoal':origins,
 'actualSelectedRelevantWholeCards':selected_cards,'actualCurrentCardOriginInputs':card_bindings,
 'all67UnchangedActualMemorySelections':selections,'allSevenUnchangedActualDeckPins':deck_pins,
 'compilerSemantics':{'actualSourcePin':pin(ROOT/'app/scripts/applicabilityCompiler.ts'),'supportedOverrideDimensionOnly':'jurisdiction',
   'clusterRoute':'Unmodified child-union from actual contains children; no cluster override proposed.',
   'memoryRoute':'Unmodified union over actual current memory-required origin references;2106 has exactly current cc5a origin. No all-of change and no memory override proposed.',
   'currentStockInventoryBindings':[{k:v for k,v in ir[gid].items() if k in ['goalId','compiledApplicability','evidenceJurisdictionsByKind','relations']} for gid in [CLUSTER,ZEO,DEG,MEM]],
   'predictedBoundedEffectNotActualCompilerAcceptance':{'ordinaryOverrideGoals':[ZEO,DEG],'addedJurisdictions':JURIS,'clusterChildren':[ZEO,DEG],'memoryOrigin':DEG,'authoredTargetViewPairsUnderReview':32},
   'newCompilerInvocation':False},
 'wholeUnchangedTeacherRoleContext':teacher_rows,
 'questions':[
  'Do the whole ordinary capabilities and current/proposed whole P support this own retained LK acquisition scope in each named view, with the actual official course/choice boundaries and without invented whole-source credit?',
  'Are the exact two supported jurisdiction additions justified by the actual goals, source readings and owned acquisition intent, rather than by the size of a filter failure alone?',
  'Does the unmodified cluster really derive its visibility from the two actual children, and does existing2106 retain exactly its current origin/one-card filter and union semantics?',
  'Does the proposed whole cc5a P correct the unsupported primary-degradation assertion in DE/EN while preserving every other existing requirement, material/transfer limit, fictional-source correction and all execution boundaries?',
  'Which separate ordinary acquisition-teacher or final-binding questions remain open? No whole-route completion follows from this finite applicability candidate.'
 ],
 'newOrdinaryGoals':[],'newCards':[],'goalTextRequiresTagsImagesChanged':False,'positiveProfileChanges':[DEG],
 'currentCurricularAtomicBaseline':439,'baseCanonicalRecordCount':650,'baseWholeViewCount':39,
 'existingTargetsSupportsMemoryRolesDeletedOrDemoted':False,'officialOptionalityRemoved':False,
 'normalDataCapsuleOrOtherCandidateMutation':False,'nativeDReviewOrFullAPVOrBuildPerformed':False,
 'M7':False,'HumanApproval':False,'HumanTrial':False,'actualLearnerPerformance':False,'hostAcceptance':False}
clean_path=write('REVIEW-INPUT.clean-package03-whole-content.json',clean)
selector={'role':'CLEAN_CONTENT_ONLY_FOR_TWO_OTHER_INDEPENDENT_REVIEWERS','authorIsIndependentReviewer':False,
 'reviewInput':pin(clean_path),'wholeGuardedCAS':pin(cas_path),
 'noAuthorOrPeerVerdictsInSelectedInput':True,'noDesiredVerdict':'Evaluate the complete goals, P bodies, primary sources, concrete cards and actual roles independently.',
 'M7':False,'HumanApproval':False,'normalL6L7Writes':False}
selector_path=write('SELECTOR.clean-content-for-two-other-reviewers.json',selector)

rationale={
 'role':'AUTHOR_RATIONALE_NOT_FOR_REVIEWERS_BEFORE_THEIR_FIRST','createdAtUtc':datetime.now(timezone.utc).isoformat(),
 'packageId':'03-surfactants-softeners','status':'ai_candidate','humanReviewStatus':'needs_human_review',
 'ordinaryContentDecision':{ZEO:'KEEP whole existing goal/P',DEG:'KEEP whole existing goal; propose one narrowly guarded P terminology successor'},
 'sourceRouteDecision':'Own acquisition scope for two already retained targets, not fabricated official exact/full mappings. Existing HE source bindings are untouched.',
 'scientificRationaleDe':[
  'Zeolith: Der Austausch beruht auf fester negativer Alumosilikat-Gerüstladung und mobilen Gegenionen;1Ca2+ ersetzt2Na+.2g bei1mmolCa2+/g bieten2mmol Kapazität, bei3mmolCa2+ bleibt1mmol und4mmolNa+ werden frei. Mg-Konkurrenz begrenzt ohne Selektivitätsdaten die exakte Ca-Verteilung. Weniger Al bedeutet weniger Gerüstladung; gleiche Porenweite genügt nicht. Regeneration ist ein idealer Gleichgewichts-/Ressourcenfall, keine allgemeine praktische Waschmittelzeolith-Rückgewinnungsbehauptung.',
  'Tensidabbau: Esterhydrolyse und terminale Oxidation erhalten zunächst den C12-Kohlenstoffbestand. Im bereitgestellten aktivierten gesättigten Modell ergeben fünfβ-Verkürzungszyklen sechs Acetyl-Einheiten, noch keinen gemessenenCO2-Abbau. Verzweigung, aromatischer Kern, Inokulum, Sauerstoff und Temperatur begrenzen Transfer. Sorption verlagert Phase und ist keine Molekülzerstörung.',
  'Konkreter P-Fehler: Die aktuelle Antwort setzt Ethoxyverkürzung unbedingt mit Primärabbau gleich. Die unveränderte vorhandene Karte und die tatsächlich gelesene datierte Primärdefinition verlangen im Tensidkontext Verlust der Oberflächenaktivität. Elternstoffentfernung und Zwischenproduktnachweis messen diese Funktion nicht. Die acht geänderten DE/EN-Felder trennen Transformation, nachzuweisenden Funktionsverlust und Mineralisierung; alle bisherigen Zahlen/Transfers und die korrigierte fiktive Gefahrenkarte bleiben erhalten. Eine alte englische Verwechslung primary disappearance wird ebenfalls zu parent-substance disappearance präzisiert.',
  'Die acht Zielansichten enthalten beide Ziele samt Cluster und Abruf bereits als Targets. Fachlich sind sie konkrete fortgeschrittene Anwendungen des bereits verfassten Waschmittel-, Ladungs-/Gleichgewichts- und Funktionsgruppenpfads. Der eigene Erwerbsumfang ist ausdrücklich zusätzlich und nicht als amtliche universelle Norm ausgegeben. Je zwei echte ordinary Scope-Eingaben tragen beide Ableitungen; pauschale vier unabhängige Overrides würden die Ursache verbergen.',
  'Memory:2106 wählt exakt chem_split_tensid_primary_vs_mineralisation aus dem tatsächlichen Organicdeck. Die Karte bleibt fachlich unverändert und wird nicht passend zur falschen Antwort gemacht. Sie unterstützt begrifflichen Abruf nach cc5a, nicht dessen vollständige Modell-/Umweltleistung. Zeolith behält seine bisherigen breiten und engen Ionenkartenrouten; keine Wahl zwischen bisherigen Memoryalternativen wird zu einem all-of umgebaut.'
 ],
 'sourceAndCourseReadings':[{ 'jurisdiction':s['jurisdiction'],'pages':[p['physicalPDFPage'] for p in s['wholePrimaryPages']],'boundary':s['sourceAndCourseBoundary']} for s in sources],
 'separateTeacherRoleGaps':teacher_rows,'scopeInputBoundary':'Only the existing supported jurisdiction override is authored. LK and CrossStage are retained view/course facts, not invented supported compiler dimensions.',
 'notEstablished':['two foreign independent FIRSTs','actual compiler acceptance of this candidate','final source/P/M/V/native bindings after composition','actual learner work','real ion exchange or microbial biodegradation assay','full path closure','M7','Human Approval','Human Trial','host acceptance'],
 'mainOtherCapsulesCandidatesOrL6L7Touched':False,'mathPhysicsBiologyM7Touched':False}
rationale_path=write('AUTHOR.scientific-rationale.separate.json',rationale)
lines=['# Paket03 – Autorenbegründung, vor fremdem FIRST getrennt halten','',
 '`ai_candidate` / `needs_human_review`. Dieser Autor kann den eigenen neuen Stand nicht später unabhängig freigeben.','',
 'Vorschlag: zwei vorhandene gewöhnliche Ziele erhalten je acht explizite, eigene jurisdiction-Erwerbszusätze. Cluster und Memory bleiben unverändert und folgen ihren tatsächlichen bestehenden Ableitungen. Kein amtlicher Vollquellenkredit, keine individuelle Themenwahl und keine ausgeführte Messung werden behauptet.','']
for p in rationale['scientificRationaleDe']:lines.extend([p,''])
lines+=['Die datierte Begriffsquelle ist [EUR-Lex, Art.2(7), Fassung01.06.2015](https://eur-lex.europa.eu/eli/reg/2004/648/2015-06-01/eng). Sie wird als wissenschaftlicher Terminologiebeleg genutzt; eine gegenwärtige Rechtsgeltung oder Compliance wird nicht beurteilt. Der tatsächlich gelesene Definitionskern und die konkrete Fassung sind im separaten Terminologiedatensatz gepinnt; eine blockierte lokale PDF-Binärdatei wird nicht vorgetäuscht.','',
 'Die vollständigen fremden Reviewinhalte stehen ausschließlich hinter dem sauberen Selektor. Der Guard verlangt die exakten vollständigen Beforeobjekte. Es gibt keine automatische Anwendung und keine Änderung von Normaldaten oder fremden Capsules.','',
 'Separate aktuelle Teacher-Grenzen:']
for r in teacher_rows:
    lines.append('')
    lines.append(r['viewId']+': direkter Waschmittelvorgänger '+r['directTeacherRole']+'; noch fehlende gewöhnliche Targetplätze: '+(', '.join(x['goalId']+' ('+x['title']+')' for x in r['separateOrdinaryTeacherTargetsStillAbsent']) or 'keine in dieser begrenzten bestehenden requires-Kette')+'.')
lines+=['','Alle bisherigen Rollen und praktischen Pflichten bleiben bestehen. Vollständige Pfadschließung, finale native Bindungen, M7, Human und Host bleiben offen.']
md=OUT/'AUTHOR.scientific-rationale.separate.md'
with md.open('x') as f:f.write('\n'.join(lines)+'\n')

technical={'role':'bounded local preparation checks, not final compiler/native acceptance',
 'inputPins':inputs,'goalsChangedOnly':[ZEO,DEG],'newScopeInputsPerOrdinaryGoal':JURIS,
 'unchangedClusterWholeDigest':digest(goals[CLUSTER]),'unchangedMemoryWholeDigest':digest(goals[MEM]),
 'unchangedProfilesCountExcludingOneProposedBody':len(profiles)-1,'wholeProfileChangedLeafFieldCount':len(profile_edits),
 'all67MemorySelectionsRetained':True,'wholeEightViewsRetained':True,'all39ViewBytesReusedViaPinnedBase':True,
 'normalMainL6L7OtherCapsulesMutation':False,'fullAPVNativeBuildInvocations':0,
 'parseChecks':True,'baseline439Unchanged':True,'predictedPairs32NotClaimedAccepted':True}
techpath=write('CHECK.bounded-preparation-not-acceptance.json',technical)
seal={'role':'AUTHOR_PACKAGE_SEAL_NOT_INDEPENDENT_APPROVAL','sealedAtUtc':datetime.now(timezone.utc).isoformat(),
 'packageId':'03-surfactants-softeners','status':'ai_candidate','humanReviewStatus':'needs_human_review',
 'cleanSelector':pin(selector_path),'cleanInput':pin(clean_path),'wholeCAS':pin(cas_path),
 'authorRationaleSeparate':[pin(rationale_path),pin(md)],'localPreparationCheck':pin(techpath),
 'allNewFilesBeforeSeal':[pin(p) for p in sorted(OUT.iterdir()) if p.is_file() and p.name not in ['SEAL.author-package03.json','SEAL.sha256']],
 'sourceInputPins':inputs,'subsequentEditsRequireAdditiveSuccessor':True,
 'M7':False,'HumanApproval':False,'actualLearnerPerformance':False,'hostAcceptance':False}
sealpath=write('SEAL.author-package03.json',seal)
with (OUT/'SEAL.sha256').open('x') as f:f.write(pin(sealpath)['sha256']+'  SEAL.author-package03.json\n')
for p in OUT.iterdir():
    if p.is_file():p.chmod(0o444)
for row in seal['allNewFilesBeforeSeal']+seal['sourceInputPins']:assert pin(row['path'])==row
print(json.dumps({'selector':pin(selector_path),'reviewInput':pin(clean_path),'CAS':pin(cas_path),'seal':pin(sealpath),
 'candidateCanonical':pin(candidate_path),'teacherRoleGaps':[{'viewId':r['viewId'],'missingOrdinaryTargets':r['separateOrdinaryTeacherTargetsStillAbsent']} for r in teacher_rows]},ensure_ascii=False,indent=2))
