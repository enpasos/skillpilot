"""Write an inactive candidate only. Never write canonical/mapping/view files."""
from pathlib import Path
import json, hashlib, uuid, copy, datetime, re

ROOT=Path('/home/enpasos/projects/skillpilot')
OUT=Path(__file__).parent
CANON='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
old=json.loads((ROOT/CANON).read_text()); by={g['id']:g for g in old['goals']}
P='11bea4c6-7b8a-47e0-8293-2eb1ce34cf66'
R='22133f29-ef02-4408-8f8d-2bbea3275d91'
F='fb3bdf39-4baf-4510-a192-c8a12fbf5dba'
S='e7c363d4-e02d-4895-8750-ba62c2eb63fe'
I='4285d84a-2c9a-4d51-8250-8bed4daf2d2e'
B=str(uuid.uuid5(uuid.NAMESPACE_URL,'https://skillpilot.com/canonical/chemistry/simple-stoichiometric-equation'))
H=str(uuid.uuid5(uuid.NAMESPACE_URL,'https://skillpilot.com/canonical/chemistry/proton-transfer-partial-and-overall-equations'))

def write(name,obj):
 (OUT/name).parent.mkdir(parents=True,exist_ok=True)
 (OUT/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
def digest(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def now():return datetime.datetime.now(datetime.timezone.utc).isoformat()

basic=copy.deepcopy(by[P]);basic.update(id=B,shortKey='canonical_chemistry_simple_stoichiometric_equation',title='Einfache Stoffgleichungen aus Reaktionsschemata ableiten',titleEn='Derive simple stoichiometric equations from reaction schemes',description='Die lernende Person kann aus den benannten Edukten und Produkten eines einfachen Reaktionsschemas eine Stoffgleichung mit passenden Formeln und kleinsten ganzzahligen Koeffizienten ableiten und den Ausgleich mit der Erhaltung der Atomanzahlen begründen, ohne die Indizes der Stoffformeln zu verändern.',descriptionEn='The learner can derive a stoichiometric equation with appropriate formulas and the smallest whole-number coefficients from the named reactants and products of a simple reaction scheme and justify balancing by conservation of atom counts without changing subscripts in the substance formulas.',resourceLinks=[])
basic['dimensionTags']['topicCode']='CANONICAL.CHEMISTRY.SIMPLE_STOICHIOMETRIC_EQUATION'
basic['extendedData']={'provenance':{'kind':'inactive-split-candidate','parentGoalId':P,'note':'Original HE provenance is retained from the actual before object.'}}
basic['extendedData']['provenance'].update(by[P].get('extendedData',{}).get('provenance',{}));basic['extendedData']['provenance']['parentGoalId']=P

proton=copy.deepcopy(basic);proton.update(id=H,shortKey='canonical_chemistry_proton_transfer_partial_and_overall_equations',title='Protonen-Teilgleichungen zur Gesamtgleichung zusammenführen',titleEn='Combine proton-transfer partial equations into an overall equation',description='Die lernende Person kann für eine einfache Protonenübertragung zwischen vorgegebenen Säure- und Base-Teilchen die Gleichungen für Protonenabgabe und Protonenaufnahme aufstellen, zur Gesamtgleichung zusammenführen und die Erhaltung von Atomanzahlen und Gesamtladung prüfen.',descriptionEn='The learner can write the proton-donation and proton-acceptance equations for a simple proton transfer between specified acid and base species, combine them into the overall equation, and check conservation of atom counts and total charge.',requires=[B,I])
proton['dimensionTags']['topicCode']='CANONICAL.CHEMISTRY.PROTON_TRANSFER_PARTIAL_AND_OVERALL_EQUATIONS'
proton['dimensionTags']['area']='Protonenübertragungen'
proton['applicability']={'jurisdiction':['DE-BY','DE-SN']}
proton['extendedData']={'provenance':{'kind':'inactive-source-grounded-candidate','sourceLandscapeId':'1e86b8e6-3a95-5df3-8622-8c2afbb989e1','sourceGoalId':'sn-chem-seki-sn-ch-klassenstufe-8-lb5-037-01-4566691b','supportingSourceGoalIds':['bdf423a8-c033-555e-ac10-c9af3baae26a'],'parentGoalId':P}}

parent=copy.deepcopy(by[P]);parent.update(type='cluster',title='Reaktionsgleichungen und Teilgleichungen',titleEn='Reaction equations and partial equations',description='Überblick über das Ableiten einfacher Stoffgleichungen sowie das Beschreiben von Elektronen- und Protonenübertragungen durch Teil- und Gesamtgleichungen. Die eigenständig prüfbaren Kompetenzen stehen in den enthaltenen Zielen.',descriptionEn='Overview of deriving simple stoichiometric equations and describing electron and proton transfers through partial and overall equations. The independently assessable competencies are specified in the contained goals.',contains=[B,R,H],weight=3)
# Old overview JPG and its entire existing resourceLink remain byte-for-byte/field-for-field.
redox=copy.deepcopy(by[R]);redox['requires']=[B,'bcf8b24b-3eed-4a36-8fb3-d6bffc1e193a',I]
redox['descriptionEn']='The learner can use oxidation numbers, formulate simple redox half-equations in aqueous solutions, and write chemically correct overall redox equations.'

units=[];replacements={}
def add_unit(uid,reason,goal_after):
 gid=goal_after['id'];replacements[gid]=goal_after
 units.append({'unitId':uid,'status':'INACTIVE_CANDIDATE_REQUIRES_REVIEW','reason':reason,'canonicalPath':CANON,'before':copy.deepcopy(by.get(gid)),'after':copy.deepcopy(goal_after)})
add_unit('U01-parent-and-old-overview-KEEP','Preserve the stable original ID, complete original applicability and old overview JPG on a surviving parent; parent is no longer an atomic competency.',parent)
add_unit('U02-basic-equation-atom','Isolate formula/coefficient balancing. Requires the original formula/reaction prerequisites; neither redox nor proton equations gate this goal.',basic)
add_unit('U03-reuse-existing-redox','Reuse 22133 rather than create a second redox equation goal. Replace parent prerequisite with basic atom; require ion understanding; align English aqueous scope. Oxidation numbers and half→overall are one integrated redox-equation routine, still require independent D/A review.',redox)
add_unit('U04-new-proton-partial-equation-atom','Existing 1c142 contains protolysis equations but neither explicitly assesses donation/acceptance partial equations nor supplies a suitable early route (it requires pH calculations). The new goal isolates that equation routine; acid/base input species are specified, without adding pH/acid-strength/titration competencies.',proton)

symbol=copy.deepcopy(by[F]);symbol['contains']=[x for x in symbol['contains'] if x!=R];symbol['requires']=[];symbol['weight']=6
symbol['description']='Cluster für konstante Massenverhältnisse, Dalton-Modell, chemische Formelsprache sowie den Überblick über Stoff-, Redox- und Protonen-Teilgleichungen.'
symbol['descriptionEn']='Cluster for constant proportions, Dalton’s model, chemical formula language, and an overview of stoichiometric, redox, and proton-transfer partial equations.'
add_unit('U05-contains-and-universal-sequencing','Remove duplicate 22133 visible parent; remove universal whole-reaction-cluster prerequisite which includes later redox/protolysis. Existing atomic prerequisites retain the necessary reaction/mass/formula route.',symbol)

for gid in ['702f774d-ad93-4a6b-98f6-c53310e176c4','1e803ef8-fc76-493d-85c5-de877cd38fda','680c7dc6-9af5-58fb-86f5-e003aa78d0f5','a6a28ab1-3a0a-5095-ab51-fa3a91ae8146']:
 g=copy.deepcopy(by[gid]);g['requires']=[S if x==F else x for x in g['requires']]
 add_unit('U06-sequencing-'+gid[:8],'Replace a whole-symbolism-cluster dependency with the existing formula-language atom. Preserve other authored prerequisites. This avoids requiring later redox/proton completion for ions, atomic structure, amount of substance, or hydrocarbons.',g)
for gid in ['9f355f63-4fb7-5638-9538-6e8a246ec4b2','d726e00e-1f87-5ba5-8c79-76ad4022365e','414489cb-453e-5de4-ab0f-0fc01175e522','ddb76915-4d63-5375-901d-4e659f5e9b09']:
 g=copy.deepcopy(by[gid]);g['requires']=[B if x==P else x for x in g['requires']]
 add_unit('U07-dependent-'+gid[:8],'Retarget an original basic-equation prerequisite to the new basic atom. Lime/gypsum/elemental-analysis context-specific ionic or proton prerequisites remain a separate explicit HOLD, not an inferred completion.',g)

after=copy.deepcopy(old);after['goals']=[copy.deepcopy(replacements.get(g['id'],g))for g in old['goals']]+[basic,proton]
write('candidate-goal-units.json',{'createdAtUtc':now(),'license':'CC-BY-4.0','status':'INACTIVE_NOT_APPROVED','stableIdMethod':'UUIDv5 URL namespace with the exact semantic URI seeds below; IDs absent from current canonical snapshot','idSeeds':{B:'https://skillpilot.com/canonical/chemistry/simple-stoichiometric-equation',H:'https://skillpilot.com/canonical/chemistry/proton-transfer-partial-and-overall-equations'},'baselineDigest':digest(ROOT/CANON),'unitCount':len(units),'units':units})
write('candidate-canonical.preview.json',after)
write('candidate-ids.json',{'parent':P,'basic':B,'redox':R,'proton':H,'ions':I,'formula':S})

# Concrete complete view before/after units, with no file outside OUT touched.
vi=json.loads((OUT/'current-compiled-views.inventory.json').read_text());viewunits=[]
for row in vi['rows']:
 if next(g['role']for g in row['goalBindings']if g['goalId']==P)!='target':continue
 v=copy.deepcopy(row['beforeView']);changes=[]
 def walk(nodes,path):
  out=[]
  for j,n in enumerate(nodes):
   ptr=path+'/'+str(j)
   if n.get('kind') in ['goalEntry','canonicalSubtree'] and n.get('goalId')==R:
    changes.append({'path':ptr,'operation':'remove','before':copy.deepcopy(n),'reason':'Reused under surviving equation parent; one visible parent only.'});continue
   if n.get('kind')=='goalEntry' and n.get('goalId')==P:
    before=copy.deepcopy(n);n['kind']='canonicalSubtree';changes.append({'path':ptr,'operation':'replace','before':before,'after':copy.deepcopy(n),'reason':'Expand original goal entry into preserved parent and assessable children.'})
   if n.get('children') is not None:n['children']=walk(n['children'],ptr+'/children')
   out.append(n)
  return out
 v['rootNodes']=walk(v['rootNodes'],'/rootNodes')
 if changes:viewunits.append({'viewId':v['viewId'],'operativePath':row['path'],'beforeDigest':row['digest'],'status':'HOLD_SOURCE_AND_SCOPE_REVIEW','before':row['beforeView'],'after':v,'nodeChanges':changes})
write('candidate-view-units.json',{'method':'Provisional preservation expansion only. Do not activate source-backed country views until listed source/stage holds are resolved. No interpretation of raw applicability as source approval. Unchanged views are fully inventoried separately.','units':viewunits})

# Every affected source row gets a disposition; no legacy competency is deleted.
mi=json.loads((OUT/'current-source-bindings.inventory.json').read_text());dispositions=[]
known={'3acbc05d-09b6-5264-85d0-b1fda00ad97e':('generic','BY-C10.1'), '648db326-46bd-5e9b-8bb3-784f42dab1ed':('generic','BY-NTG-C10.1'), '9a9b3e03-be49-526d-8886-733f61c70582':('redox','BY-C10.5'), '63a78225-6b94-51b3-bc5c-52b2a7e6eae7':('redox','BY-NTG-C10.3'), 'sn-chem-seki-sn-ch-klassenstufe-8-lb4-033-02-3c753143':('redox','SN-K8-LB4'), 'sn-chem-seki-sn-ch-klassenstufe-8-lb5-037-01-4566691b':('proton','SN-K8-LB5'), 'th-chem-sekii-th-ch-sekii-4-1-5-verbindungen-bestimmen-096-01-b230e10f':('advanced-redox','TH-Q-4.1.5')}
for row in mi['rows']:
 before=row['beforeMapping'];sid=before['legacyGoalId'];binding=row.get('sourceBinding')or{};sg=binding.get('sourceGoal')or binding.get('legacyGoalObject')or{}
 text=' '.join(str(sg.get(k,''))for k in ['sourceText','description','title','parentBulletText'])
 category,clause=known.get(sid,('unverified',None))
 if category=='unverified':
  if re.search(r'Teilgleich|half.?equ|Teilreaktion',text,re.I):category='partial-equation-source-boundary'
  elif re.search(r'Proton|Protoly|Autoprotoly|Neutralisation|Säure.Base|Saeur',text,re.I):category='acid-base-source-boundary'
  elif re.search(r'Redox|Elektronen|Oxidationszahl',text,re.I):category='redox-source-boundary'
  elif re.search(r'Reaktionsgleich|Wortgleich|Reaktionsschema|reaction equation',text,re.I):category='basic-or-contextual-equation'
 afterrows=[];reason='Retain this exact source row unchanged in the inactive plan; precise clause/component/context and whole projection coverage not yet verified. No false exact remap.'
 if category=='redox':
  aft=copy.deepcopy(before);aft['canonicalGoalId']=R;afterrows=[aft];reason='Existing redox goal is the content reuse candidate; SN ionic/bulk equation wording and any non-aqueous context still require scope review.'
 elif category=='proton':
  aft=copy.deepcopy(before);aft['canonicalGoalId']=H;aft['matchType']='partial';afterrows=[aft];reason='New proton-partial atom covers the explicitly named equation routine. Complete original source row also covers contextual acid knowledge: preserve before row and review remaining coverage, not exact full-row replacement.'
 elif category=='generic':
  reason='Generic Teil-/Gesamtgleichungen are not reduced to redox. Parent/basic/redox/proton candidate covers concrete equation families, but general decomposition and any further reaction contexts need an exact completeness decision. Preserve the source row; exact→parent match must be rebound after this decision.'
 dispositions.append({'mappingPath':row['mappingPath'],'mappingIndex':row['mappingIndex'],'beforeDigest':row['mappingBytesDigest'],'before':before,'sourceGoalId':sid,'sourceClauseId':clause,'triageCategory':category,'proposedComponentRows':afterrows,'status':'HOLD_MAPPING_COMPLETENESS_AND_PROJECTION','reason':reason})
write('source-row-preservation-and-hold.inventory.json',{'rowCount':len(dispositions),'allBeforeRowsRetainedInInventory':True,'approvedRows':0,'note':'Text triage is routing only. Every row is HOLD until exact source competence and composed target coverage are checked. The 333 actual source bindings and before objects remain available; no jurisdiction discarded.','rows':dispositions})

clauses=[
 {'clauseId':'BY-C10.1','url':'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/10/chemie/ch','locator':'C10 Lernbereich 1, Kompetenz Teil-/Gesamtgleichungen and contents decomposition into partial equations','verified':'Current official HTML read with web tool during this candidate authoring','finding':'Generic partial and overall equations are required. They are not restricted by this clause to redox. The partial-equation field also intersects explicitly distinct proton and redox topic areas.','candidateTargets':[P,B,R,H],'status':'HOLD_GENERIC_CONTEXT_COMPLETENESS'},
 {'clauseId':'BY-C10.4','url':'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/10/chemie/ch','locator':'C10.4 proton transitions in reaction equations, acid/base species, reversible transitions and neutralisation','verified':'Current official HTML personally read','finding':'Supports a proton-equation competence distinct from redox. Does not itself literally demand separate proton donation/acceptance equations; that explicit requirement is verified in SN.','candidateTargets':[H,'1c1420c2-a8e2-520f-8015-6df637a973bd'],'status':'CONTENT_SUPPORT_ONLY_NOT_WHOLE_BY_PROJECTION_APPROVAL'},
 {'clauseId':'BY-C10.5','url':'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/10/chemie/ch','locator':'C10.5 oxidation numbers and rules for aqueous redox partial equations → redox equations','verified':'Current official HTML personally read','finding':'Reuse existing 22133; preserve aqueous scope in both languages; ion/charge prerequisites are necessary.','candidateTargets':[R],'status':'CONTENT_REUSE_SUPPORTED_QA_PENDING'},
 {'clauseId':'SN-K8-LB4','path':'curricula/DE/Gymnasium/input/SN/lehrplan-gymnasium-chemie-sachsen-2025.pdf','sourceDigest':digest(ROOT/'curricula/DE/Gymnasium/input/SN/lehrplan-gymnasium-chemie-sachsen-2025.pdf'),'url':'https://www.schulportal.sachsen.de/lplandb/lehrplan/file/521/lnuYavMOfLLQRd2MlehG','physicalPage':24,'printedPage':12,'viewedPng':'sn-primary-page24.png','finding':'Oxidation, reduction and redox reaction in ionic notation and bulk equation are required, with partial equations explicitly named. Metal/nonmetal reactions are not automatically identical to aqueous-only 22133.','candidateTargets':[R],'status':'HOLD_NON_AQUEOUS_AND_IONIC_BULK_CONTEXT'},
 {'clauseId':'SN-K8-LB5','path':'curricula/DE/Gymnasium/input/SN/lehrplan-gymnasium-chemie-sachsen-2025.pdf','sourceDigest':digest(ROOT/'curricula/DE/Gymnasium/input/SN/lehrplan-gymnasium-chemie-sachsen-2025.pdf'),'physicalPage':24,'printedPage':12,'viewedPng':'sn-primary-page24.png','finding':'Hydrogen chloride with water requires proton donation, proton acceptance and total reaction in ionic notation/bulk equation; partial equations explicitly named. Reusing aqueous-redox-only 22133 loses this competence.','candidateTargets':[H],'status':'EXPLICIT_PARTIAL_PROTON_CONTENT_SUPPORTED_QA_PENDING'},
 {'clauseId':'TH-Q-4.1.5','path':'curricula/DE/Gymnasium/input/TH/LP_GY_Chemie_2024.pdf','sourceDigest':digest(ROOT/'curricula/DE/Gymnasium/input/TH/LP_GY_Chemie_2024.pdf'),'url':'https://www.schulportal-thueringen.de/tip/resources/medien/63707?dateiname=Chemie_Lehrplan_AHR_2024-11-13.pdf','physicalPage':52,'printedPage':47,'viewedPng':'th-primary-page52.png','finding':'Aqueous Fe/Mn redox reactions require oxidation/reduction partial and ionic equations at upper-secondary basic and elevated level. Full context cannot be declared covered by a simple Sek-I redox label.','candidateTargets':[R,'4961130b-1ee8-58f2-a319-dff0a864db6a'],'status':'HOLD_UPPER_SECONDARY_FE_MN_COMPLETENESS'},
 {'clauseId':'HE-G9-basic-equations','path':'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-stoffmenge-ten-current-independent-review-b-v1/sources/he-g9-chemie.pdf','locator':'Printed p17 (physical18), Chemische Symbolsprache; simple reaction equations derived from reaction schemes','verified':'Personally inspected in this agent’s earlier frozen current D review; retained source bytes are reused as source evidence only, no historical review restarted','candidateTargets':[B],'status':'BASIC_CONTENT_SUPPORT_ONLY'}
]
write('primary-source-clause-audit.json',{'readDuringCandidateAuthoring':['BY official C10 HTML','SN actual physical PDF page24 printed12','TH actual physical PDF page52 printed47'],'clauses':clauses,'ntgAliasLimit':'Current operative extraction merges NTG IDs as source occurrences. Current NTG official HTML was not separately verified in this candidate round; hold rather than equate tracks.'})

write('candidate-holds.json',{'status':'HOLD_INACTIVE_NOT_APPROVED','approvals':{'D':False,'P':False,'V':False,'A':False,'M':False,'humanApproval':False},'holds':[
 {'id':'H01-generic-BY','affected':['BY-C10.1','BY-NTG-C10.1'],'reason':'Generic partial/overall equation clause is not redox-only. Verify whether parent’s proton+redox families exhaust intended contexts; general multistep/decomposition or nucleophile/electrophile contexts remain open. Do not call full source coverage preserved.'},
 {'id':'H02-SN-redox','affected':['SN-K8-LB4',R],'reason':'Existing 22133 aqueous-only wording does not prove full metal/nonmetal nonaqueous ionic/bulk equation competence. A minimal scope extension needs its own source and bilingual D/A check; retained full before source row remains open.'},
 {'id':'H03-TH-Fe-Mn','affected':['TH-Q-4.1.5',R],'reason':'Upper-secondary Fe/Mn context and stage/projection are not automatically preserved by simple redox competence. Prefer existing 496113 where exact half-equation coverage can be shown; currently held.'},
 {'id':'H04-all-source-rows','affected':['source-row-preservation-and-hold.inventory.json'],'reason':'All 333 actual mapping rows inventoried; no broad raw applicability or partial source mapping grants an entire state projection. Contextual equations, acid/base, auto-protolysis and unrelated broad source clips need clause-specific component coverage.'},
 {'id':'H05-views','affected':['candidate-view-units.json'],'reason':'27 original 11bea target views need preserved expansion. Reused redox becomes newly target in views that formerly exposed only 11bea; new proton child cannot be promoted in other states from SN/BY source evidence alone. Retain 16-jurisdiction parent/basic scope and all before projections, but resolve each per-view addition before activation.'},
 {'id':'H06-BY-projection-and-NTG','affected':['DE-BY'],'reason':'No current BY-specific authored chemistry view exists. National view fallback/routing is not validated here. The two BY proton source IDs have no direct current mapping rows. Candidate mappings/view must be chosen explicitly; do not claim full BY projection.'},
 {'id':'H07-context-dependent-prereqs','affected':['d726e00e-1f87-5ba5-8c79-76ad4022365e','414489cb-453e-5de4-ab0f-0fc01175e522','ddb76915-4d63-5375-901d-4e659f5e9b09'],'reason':'Replacing a basic-equation edge prevents aggregate prerequisites; lime/gypsum/qualitative elemental-analysis source contexts may need additional ion/proton/redox prerequisites and their own assessments. No green inferred.'},
 {'id':'H08-QA-rebinding','affected':[P,B,R,H,F],'reason':'Changed semantic fields, roles and graph edges require fresh current D/P/A/M evidence as applicable; new atomic images/evidence not approved. Old JPG remains KEEP on surviving parent only; no newly reviewed V claim.'},
 {'id':'H09-masterymigration','affected':[P,B,H],'reason':'Original ID changes atomic→cluster. Persisted learner mastery must not silently certify either new atom. Compatibility/migration policy and runtime handling of old parent mastery require separate explicit review.'},
 {'id':'H10-weights-and-global-effective-DAG','affected':['candidate-graph-check.json'],'reason':'Scoped direct/inherited routes are checked below; unrelated existing global effective dependency cycles or old cluster weight discrepancies are not machine maturity approval. Ancestor counts and visible progress must be reviewed before import.'},
 {'id':'H11-atomicity','affected':[B,H,R],'reason':'Candidate author’s integrated routines are proposals, not independent semantic atomicity verdicts. In particular reuse of redox oxidation-number/half→overall routine remains subject to current A/D review.'}
]})
print(json.dumps({'units':len(units),'viewUnits':len(viewunits),'sourceRows':len(dispositions),'ids':{'basic':B,'proton':H}}))
