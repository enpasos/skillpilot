"""A bounded, unapplied author proposal; current scientific records stay immutable."""
import copy
import hashlib
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

B = Path('/mnt/e/skillpilot-chemie-L7-20261017')
R = Path('/home/enpasos/projects/skillpilot')
O = B / 'NI-organics-materials-retained-target-scope-author-root-v1'
assert not O.exists()
O.mkdir()

def read(p): return json.loads(Path(p).read_text())
def digest(o): return hashlib.sha256(json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def pin(p):
    p = Path(p)
    return {'path':str(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def write(name, data):
    p = O / name
    assert not p.exists()
    p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
    return pin(p)

base = B / 'paired-twenty-foundations-and-coordinate-priors-actual-whole650-assembly-root-v1'
cp = base / 'candidate.canonical650.paired-c95-twenty-foundations-and-coordinate-priors.private.json'
vp = base / 'candidate.whole39views.paired48-plus20-foundations.private.json'
assert pin(cp)['sha256']=='48482f9f092028b1f33c41e9223c250dbeb0f00750614f42cb613b6f72cd51dd'
assert pin(vp)['sha256']=='f3989d39a8096f160de40c35b81281054cbe06012626a227439a7f5895bfd9ac'
c, views = read(cp), read(vp)
gs = {g['id']:g for g in c['goals']}
assert len(gs)==650 and len(views)==39
inventory_path = B/'actual650-paired-twenty-foundations-and-coordinate-stock-applicability-root-v1/INVENTORY.root-current149-seven-finite-packages.json'
group = [g for g in read(inventory_path)['goals'] if g['packageId']=='05-ni-organics-materials']
assert len(group)==15 and sum(g['pairCount'] for g in group)==17
ordinary = [g for g in group if g['nodeKind']!='memory']
assert len(ordinary)==13
p439 = B/'current650-post20-P439-SEM-paired-context-final-technical-b-v1/capsule/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current650-post20-final-363-one-record-technical-v1/P439.current.exact438-plus-one-paired-363-context.jsonl'
assert pin(p439)['sha256']=='469ab00b73a9b1454d853fc9ce7db6cbfce1e2c5968a5b19e9ad807875b70b3e'
records = {q['goalId']:q for q in map(json.loads,p439.read_text().splitlines())}
assert len(records)==439
teacher_id='ca216bc6-5205-5b46-abbd-fd5628e4ca5b'
source_contexts={
'afa7dae7-9378-5687-aa8d-69a04afaa0d8':([32], 'Die verbindliche Nano-Zeile ist eA. Sie nennt Größe, Oberflächeneigenschaften sowie Chancen/Risiken ausgewählter Materialien, aber keine vollständige Silber-Polyolefin-Migrations-/Antimikrobiell-Studie. Das bestehende GK-Target ist eine eigene zusätzliche Vertiefung; auch im LK bleibt der ganze konkrete Silberfall eigener Erwerbsumfang.'),
'73cbd4d8-5da1-5e54-85ce-c88e7b1613fe':([30,32], 'Makromolekülstruktur, Funktionalität und eA-Mesomerie des Benzols liefern Teilkontexte. Konjugierte leitfähige Polymere, Dotierung, Trägerdichte, Kontakte und Vierpunktkontrollen stehen nicht als ganze GK-/LK-Pflicht hier. Die beiden bereits verfassten Targets bleiben eigene fachliche Vertiefungen.'),
'f947cd04-952a-5a9d-9445-3ffc70e02c3c':([28,31,32], 'Die Tabelle nennt Polymerisation, eA-radikalische Polymerisation und verschiedene Reaktionstypen. Daraus folgt nicht der ganze Polyurethan-Polyadditionsmechanismus samt Äquivalenten, Vernetzung und Wassernebenreaktion. Dieses bestehende LK-Target ist eine eigene zusätzliche Erwerbserweiterung; keine Herstellung wird behauptet.'),
'd61ce84f-1d0d-555f-be05-aedb589225ce':([28,30], 'Induktive Effekte und eA-Erstsubstitution am Benzol sind amtlicher Kontext. Zweitsubstitutionsdirigierung mit neutralem/protoniertem Anilin, Aktivierung und Mesomerie ist eine eigene Vertiefung, keine aus Erstsubstitution abgeleitete Vollquellenpflicht.'),
'f57d53b0-5bdf-5998-81f4-8bfb2fc5bde7':([30,31,32], 'Naturstoffklassen, funktionelle Gruppen und eA-Kohlenhydrat-/Polymerkontexte verlangen nicht den vollständigen Viskose-/Acetatprozess und datenbasierten Faservergleich. Das bestehende LK-Target bleibt eigener Erwerb. Aus einer synthetischen Strukturkarte folgt keine tatsächlich ausgeführte industrielle oder Lernendenherstellung.'),
'e47b22ec-4443-5aae-bf38-71e3164b6b3e':([31,32], 'Recycling und dessen ökonomisch-ökologische eA-Bewertung sind Teilkontexte. Gegebene PLA-/Cellulose-Hydrolyse-/Enzym-/Kohlenstoffbilanzen sind eigene Vertiefungen. Kettenspaltung und teilweise CO2-Bildung ersetzen keinen Nachweis vollständiger Mineralisierung oder amtlichen Versuchsabschluss.'),
'3dbd84de-51cb-5ff7-801b-077a54520fed':([30], 'Die eA-Kompetenz zur elektrophilen Erstsubstitution liefert einen direkten Teilkontext. Ganze Paarpfeil-/Ladungs-/Nitrogen-Oktett-/Protonenübertragungsfälle dieses bestehenden Targets werden ausdrücklich selbst angeboten; keine tatsächliche Nitrierung wird behauptet.'),
'b7b5df21-78f3-5408-89f1-36deed450695':([30,31], 'eA-Erstsubstitution und Synthesewegplanung belegen keine vollständige Friedel-Crafts-Alkylierungs-/Acylierungspflicht, Carbocation-Umlagerung oder Lewis-Säure-Selektivität. Das vorhandene LK-Target ist zusätzliche eigene Theoriearbeit; keine ausgeführte Synthese oder Ausbeute.'),
'4b9810b0-5d3d-59d8-a948-c3f6dd6303c7':([21,22,28,30], 'Brönsted-Paare, pKS/pKB-Vergleiche, induktive Effekte und eA-Benzolmesomerie sind Teilkontexte. Der ganze Phenol/Alkohol- und Anilin/Cyclohexylamin-/Nitrovergleich bleibt eine eigene vorhandene LK-Vertiefung mit festgelegtem Medium/Protonierungsort. Die unverzichtbare bestehende Aciditätslehrkompetenz ca216 wird zusätzlich als echtes NI-LK-Target aufgenommen.'),
'e96771d3-fd72-59e6-8f4c-573ef8cbde0a':([28,30,31], 'Labor-/Alltagssicherheit und eA-aromatische Reaktionskontexte sind keine ganze Benzol/IARC-Expositions-/Substitutionsbewertung. Das vorhandene LK-Target bleibt eigene kriteriengeleitete Vertiefung; aus Gefahrenklasse folgt keine konkrete Erkrankungswahrscheinlichkeit und keine reale Betriebsfreigabe.'),
'14f1fe97-0585-5738-845e-9c49173d8afa':([30,32], 'Kunststofffunktionalität und Struktur/Eigenschaften sind Teilkontexte. Der ganze geometriegleiche Polymer/Metall-Widerstands-, Masse-, Biege- und Alterungsvergleich bleibt eigenes vorhandenes LK-Target und keine universelle Materialrangfolge.'),
'6eba90b5-d4a6-5625-be61-e7f30f7eb964':([30,32], 'Funktionalität und Einsatz von Kunststoffen sind amtliche Teilkontexte. Die vier ganzen Formgebungsverfahren mit Temperatur-/Geometrie-/Vernetzungsfällen werden als eigene vorhandene LK-Vertiefung erworben; aus einem Modellfenster folgt keine praktische Maschinenfreigabe.'),
'059acb11-29b3-5645-ac4c-b4214dc41a2d':([21,22,23], 'Die eA-Tabelle verlangt charakteristische Titrationspunkte und experimentelle Halbäquivalenz-Ermittlung. Das vorhandene Ziel behandelt das geeignete schwache konjugierte Paar und pKS/pKB-Bestimmung aus Daten; die ganzen G6-C1/C2-Materialien bleiben zusätzlich vollständig bereitgestellt. Papier-/pH-Datenfälle ersetzen die separat geforderte experimentelle Durchführung nicht.'),
teacher_id:([21,22,28,30], 'Die bereits bestehende Aciditätskompetenz liefert den benötigten Vergleich von Alkohol/Carbonsäure und Stabilisierung der konjugierten Base vor dem vorhandenen induktiv/mesomeren Aromatenziel. Ihre ganzen aktuellen Fälle werden als eigene begrenzte NI-LK-Grundlage angeboten. Brönsted-/pKS-, Induktions- und Mesomerieteilkontexte begründen keinen pauschalen amtlichen Vollquellenkredit.')}

goal_changes=[]
ids=[g['goalId'] for g in ordinary]+[teacher_id]
for gid in ids:
    before=gs[gid]; after=copy.deepcopy(before)
    ex=after.setdefault('extendedData',{})
    override=ex.setdefault('applicabilityOverrides',{})
    assert 'jurisdiction' not in override or 'DE-NI' not in override['jurisdiction']
    override['jurisdiction']=sorted(set(override.get('jurisdiction',[])+['DE-NI']))
    rows=next((g['viewIds'] for g in ordinary if g['goalId']==gid),['de-ni-gym-chemistry-lk'])
    pages,context=source_contexts[gid]
    extension={
        'extensionId':'package05-retained-NI-target-'+gid[:8],
        'jurisdiction':'DE-NI','stageIntent':'SekII',
        'courseProfiles':['GK','LK'] if 'de-ni-gym-chemistry-gk' in rows else ['LK'],
        'viewIds':rows,
        'role':'authored-acquisition-foundation' if gid==teacher_id else 'authored-acquisition-extension',
        'officialWholeSourceCredit':False,
        'sourceDocument':'Niedersachsen Kerncurriculum Chemie gymnasiale Oberstufe2022',
        'sourcePhysicalPDFPages':pages,
        'sourceContext':context,
        'acquisitionScope':before['description'],
        'wholeRetainedPositiveProfileDigest':digest(records[gid]['profile']),
        'scopeInputBoundary':'Only supported applicabilityOverrides.jurisdiction is added; course/stage/duration filters and every existing target/support role remain. Whole original goal and scientific profile fields are retained.',
        'topicChoiceBoundary':'Existing authored target universe before a later topic selector; no universal official duty or individual/persisted theme choice is asserted.',
        'executionBoundary':'Prospective teaching scope only. Supplied cases are not actual learner work, experiments, syntheses, measured migration/material tests, medical/workplace clearance or human approval.'}
    ex.setdefault('skillPilotAcquisitionExtensions',[]).append(extension)
    goal_changes.append({'goalId':gid,'beforeDigest':digest(before),'afterDigest':digest(after),'before':before,'after':after})

before_v=next(v for v in views if v['viewId']=='de-ni-gym-chemistry-lk')
after_v=copy.deepcopy(before_v)
def find(nodes, structure_id):
    for n in nodes:
        if n.get('id')==structure_id:return n
        found=find(n.get('children',[]),structure_id)
        if found:return found
node=find(after_v['rootNodes'],'chemistry-de-ni-lk-stoffgruppen')
assert node
assert not any(n.get('goalId')==teacher_id for n in node['children'])
index=next(i for i,n in enumerate(node['children']) if n.get('goalId')=='a3788e40-b540-5bed-be37-b33053528422')+1
node['children'].insert(index,{'kind':'goalEntry','goalId':teacher_id,'projectionRole':'target'})
view_change={'viewId':before_v['viewId'],'beforeDigest':digest(before_v),'afterDigest':digest(after_v),'before':before_v,'after':after_v}
cc=copy.deepcopy(c)
changed={g['goalId']:g['after'] for g in goal_changes}
cc['goals']=[changed.get(g['id'],g) for g in cc['goals']]
vv=[after_v if v['viewId']==after_v['viewId'] else v for v in views]
cp_after=write('candidate.canonical650.NI-retained13-plus-one-real-teacher.unapplied.json',cc)
vp_after=write('candidate.whole39views.NI-LK-one-real-teacher.unapplied.json',vv)

selected=set(ids+[g['goalId'] for g in group if g['nodeKind']=='memory'])
selected.update(['0959eef2-3c7d-5b33-a109-ddf332a5dbd9','4d9defde-d3bc-5c43-83ff-9cf6f2930643','cc5a626a-dc85-57e2-b422-259f92901545'])
def gather(gid):
    for dep in gs[gid].get('requires',[]):
        if dep not in selected:
            selected.add(dep);gather(dep)
for gid in list(selected):gather(gid)
whole_context=[gs[gid] for gid in sorted(selected)]
whole_ps=[{'goalId':gid,'wholeProfile':records[gid]['profile']} for gid in sorted(selected) if gid in records]
pdf=R/'curricula/DE/Gymnasium/input/NI/upper-secondary/KC-CH_SII_Druck.pdf'
pdf_pin=pin(pdf)
pages=[]
for number in [10,11,21,22,23,28,29,30,31,32]:
    text=subprocess.check_output(['pdftotext','-layout','-f',str(number),'-l',str(number),str(pdf),'-']).decode()
    pages.append({'physicalPDFPage':number,'literalWholeLayoutText':text,'freshExtractionSHA256':hashlib.sha256(text.encode()).hexdigest()})
material=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-acid-base-seven-positive-profile-author-shapes-technical-20261014-v1/inputs/fourteen-full-cases.bound.exact.json'
materials=read(material)
g6=[case for case in materials['cases'] if 'G6-' in json.dumps(case,ensure_ascii=False) or case.get('goalId')=='059acb11-29b3-5645-ac4c-b4214dc41a2d']
assert len(g6)==2
old_clean=read(B/'surfactants-softeners-retained-target-scope-author-v1/REVIEW-INPUT.clean-package03-whole-content.json')
deck_pins=old_clean['allSevenUnchangedActualDeckPins']
all_cards=[]
for deck_pin in deck_pins:
    assert pin(deck_pin['path'])==deck_pin
    obj=read(deck_pin['path']);all_cards.extend(obj['cards'] if isinstance(obj,dict) else obj)
cas={
    'schema':'bounded-whole-object-CAS-unapplied','packageId':'05-ni-organics-materials',
    'baseCanonical':pin(cp),'baseWhole39Views':pin(vp),'originalP439':pin(p439),
    'canonicalWholeGoalChanges':goal_changes,'wholeViewChanges':[view_change],
    'positiveProfileWholeBodyChanges':[],
    'beforeMismatchAction':'STOP; do not silently rebase, patch hashes or substitute a smaller goal',
    'noAutoApply':True,'M7':False,'HumanApproval':False}
cas_pin=write('CAS.whole14-NI-acquisition-goals-and-one-teacher-view.unapplied.json',cas)
inp={
    'role':'CLEAN_WHOLE_CONTENT_FOR_TWO_OTHER_INDEPENDENT_REVIEWERS',
    'authorIsIndependentReviewerOfThisProposal':False,'packageId':'05-ni-organics-materials',
    'baseCanonical':pin(cp),'baseWhole39Views':pin(vp),'originalP439':pin(p439),
    'currentActualInventory':pin(inventory_path),
    'wholeOriginalFifteenExcludedTargetRows':group,
    'wholeGuardedProposal':cas,'wholeCanonicalCandidate':cp_after,'whole39ViewsCandidate':vp_after,
    'wholeCurrentOrdinaryAndMemoryContextGoals':whole_context,
    'wholeCurrentPositiveProfilesContentOnly':whole_ps,
    'currentActualRecordEvidenceLevels':{gid:{k:records[gid][k] for k in ['evidenceLevel','maximumClaimScope','status','reviewAuthority']} for gid in ids},
    'evidenceLevelBoundary':'All current record levels/statuses/IDs are retained exactly; scope authorship does not upgrade a technical E0/G0 record or create a new scientific/native vote.',
    'originalNIPrimaryPDF':pdf_pin,'wholeActualPrimaryPages':pages,
    'sourceTableBoundary':'Page11 states bold competencies are eA-only. Pages23,30,32 must be visually read for column/bold boundaries. Own acquisition extensions do not turn an eA-only item into an official gA duty.',
    'originalFullG6MaterialSource':pin(material),'wholeOriginalTwoG6Cases':g6,
    'materialBoundary':'The two supplied full G6 cases support inspection of the retained half-point profile. Other existing scientific profiles are retained whole with their existing validity/statuses; this source-scope author proposal does not newly certify original historical experiments or omitted underlying datasets.',
    'allSevenExistingDeckPins':deck_pins,'wholeActualEightyExistingCards':all_cards,
    'all67ExistingMemorySelections':old_clean['all67UnchangedActualMemorySelections'],
    'twoExistingRelevantMemoryGoals':[gs[g['goalId']] for g in group if g['nodeKind']=='memory'],
    'memoryScopeBoundary':'The specific viscose unit retains its sole f57 origin/requires. The functional-group unit retains its existing reviewed origin routes, not an invented all-origin prerequisite. The proposal changes neither unit, selector, card nor deck.',
    'stockBeforeTeacherRoles':read(B/'MEASUREMENT.package05-current-C20-stock-teacher-roles.root.json'),
    'noChangedDescriptionRequiresResourcesTagsOrScientificProfiles':True,
    'newCanonicalGoals':0,'additionalExistingTeacherTargetPairs':1,
    'existingTargetViewPairsRetained':17,
    'newCards':0,'newMemoryUnits':0,'existingProjectionRolesDeletedOrDemoted':False,
    'questions':['Are the two existing GK+LK extra topics truthfully distinguished from official eA-only context?','Do the whole existing LK topic goals/Ps have a plausible explicit own acquisition scope without whole official source credit?','Is ca216 a genuine missing prior for4b981 and does the one added target preserve the actual64-goal NI-LK prerequisite closure?','Do the two unmodified Memory units derive from their real existing origin semantics without an all-origin rule?','Are source/source-course obligations and actual experiments preserved separately from synthetic data cases?'],
    'finalActualCompilerFrontendAndNativeBindingsStillOpen':True,
    'normalMainL6L7Writes':False,'M7':False,'HumanApproval':False,'HumanTrial':False,'actualLearnerPerformance':False}
inp_pin=write('REVIEW-INPUT.clean-NI-thirteen-retained-topics-one-real-teacher-and-two-Memory-routes.json',inp)
write('SELECTOR.clean-content-for-two-other-reviewers.json',{'role':'Clean selected whole content; no author/peer verdicts','reviewInput':inp_pin,'wholeGuardedCAS':cas_pin,'M7':False,'HumanApproval':False})
write('AUTHOR.DIAGNOSIS.private-not-clean-selector.json',{'role':'Author diagnosis; never independent approval','ordinaryExcludedTopics':13,'derivedMemoryExclusions':2,'existingTargetPairs':17,'genuineMissingOrdinaryTeacher':'ca216 absent from NI-LK despite actual4b981 requires; add real target and truthful own scope instead of deleting prior','scopeChanges':14,'viewChanges':1,'profileChanges':0,'technicalCurrentRecordsRemainIncludingConservativeE0G0':True,'newFullFiveGateClosures':0,'M7':False,'HumanApproval':False})
print(json.dumps({'out':str(O),'input':inp_pin,'CAS':cas_pin,'canonical':cp_after,'views':vp_after,'wholeContextGoals':len(whole_context),'wholeContextProfiles':len(whole_ps),'actualCards':len(all_cards),'wholeG6Cases':len(g6)},ensure_ascii=False))
