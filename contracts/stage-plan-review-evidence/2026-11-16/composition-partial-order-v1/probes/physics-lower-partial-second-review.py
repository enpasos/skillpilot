import json,hashlib,functools
from pathlib import Path
R=Path.cwd();OUT=Path(__file__).parent
first=json.loads((OUT/'independent-original-review.actual.json').read_text())
canon=R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json';goals={}
for f in (R/'curricula/DE/Gymnasium/canonical').glob('*.json'):goals.update({g['id']:g for g in json.loads(f.read_text())['goals']})
memfile=R/'scripts/generate_laender_physics_stage_views.memberships.json';mem=json.loads(memfile.read_text())['views']
frozen=R/'tmp/pipeline/laender-stufen/gesamt/physics/frozen-v33';manifest=json.loads((frozen/'manifest.json').read_text());expected={v['file']:v['sha256'] for v in manifest['views']}
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
@functools.cache
def atoms(i):return frozenset().union(*(atoms(c.split(':')[-1]) for c in goals[i]['contains'])) if goals[i].get('contains') else frozenset([i])
@functools.cache
def lower(state):
 f=frozen/'views'/f'de-{state.lower()}-seki.view.json';assert sha(f)==expected[f.name];d=json.loads(f.read_text());occ={}
 def walk(nodes,role='target',path=()):
  for n in nodes:
   r=n.get('projectionRole',role)
   if n['kind']=='structure':walk(n['children'],r,path+((n['id'],n['label']),))
   elif r=='target':
    for i in atoms(n['goalId']):occ.setdefault(i,[]).append({'path':path,'reference':n})
 walk(d['rootNodes']);return f,occ

def gid(prefix):
 ids=[i for i in goals if i.startswith(prefix)];assert len(ids)==1;return ids[0]
choices={
 ('MV','bf8517a9'):('ae67bcf1','Vorhandene qualitative Diagrammkompetenz; kein zusätzlicher reiner Durchschnitts-/Momentanatom ohne Tangentenanspruch im bestehenden S gefunden.'),
 ('MV','e918b31f'):('','Kein engeres Kreis-/Radialkraftatom im bestehenden Lower-S gefunden. accb1d9e ist nicht in S und würde außerdem das strittige e918 als Voraussetzung benötigen.'),
 ('SL','156edddc'):('9c328f68','Vorhandene Masse/Gewichtskraft-Unterscheidung deckt den engeren g-/Gewichtskraftkontext; kein neues Vektorfeldziel hinzufügen.'),
 ('SL','2b700858'):('6367d45e','Vorhandener Fernrohr-/Mikroskopaufbau passt zum optischen Beobachtungsteil. Keine vollständige Astronomie-/Spektroskopieabdeckung behaupten.'),
 ('SL','bf8517a9'):('ae67bcf1','Vorhandene qualitative Diagrammkompetenz; ersetzt keine vollständige Momentan-/Tangentenforderung.'),
 ('SL','eb30189c'):('a5f652cc','Nur vorhandene Teilgrundlage Stromwirkungen, kein gleichwertiger eigener Motorfunktions-/Motorbauatom im Lower-S.'),
 ('SN','156edddc'):('9c328f68','Vorhandene Masse/Gewichtskraft-Unterscheidung ist enger; kein Feldmodell behaupten.'),
 ('SN','84ddb244'):('90e1e6cf 078ce4d2','Vorhandener qualitativer Sehvorgang und Linsenabbildung passen zum qualitativen Wahlbereich ohne quantitative Linsengleichung.'),
 ('SN','8ac61062'):('10aad90e da0837c7','Vorhandene Frequenz/Amplitude-Unterscheidung und Lärmbelastung decken den engeren qualitativen Inhalt, ohne logarithmische Schalldruckmathematik.'),
 ('SN','bf8517a9'):('ae67bcf1','Vorhandene qualitative Diagrammkompetenz; keine neue Tangentenkompetenz.'),
 ('SN','bfea7a23'):('50877233','Vorhandene qualitative Kernfusion/Kernspaltung trägt den konkreten Fusionsinhalt; keine neue relativistische Ruheenergiepflicht.'),
 ('SN','e6a50c74'):('861ba00a 979e0d0d 25d91cc0','Vorhandene biologische Wirkungen/Schutz, qualitative Nutzen-Risiko-Abwägung und Nachweisprinzipien decken den engeren Radioaktivitätsbereich.'),
 ('SN','e918b31f'):('','Kein engeres Radialkraftatom im bestehenden Lower-S gefunden. Keine neue Aufnahme des Anwendungsatoms accb1d9e vorgeschlagen; dessen requires würde e918 wieder verlangen.'),
 ('SN','eb30189c'):('a5f652cc','Nur vorhandene Teilgrundlage Stromwirkungen. Kein eigener enger Motorfunktionsatom im Lower-S gefunden; keinen bauen.'),
 ('SN','ec7a0a68'):('','Kein isolierter Bahngeschwindigkeit-/Umlaufzeitatom im bestehenden Lower-S gefunden; vorhandenes ec7 koppelt dies bereits an Winkelgeschwindigkeit.'),
 ('ST','bf8517a9'):('ae67bcf1','Vorhandene qualitative Diagrammkompetenz entspricht dem engeren Ablese-/Vergleichsauftrag; keine neue Tangentenkompetenz.')}
rows=[];inputpaths=[canon,memfile,frozen/'manifest.json',OUT/'independent-original-review.actual.json']
for r in first['rows']:
 if r['classification']!='partial_lower_not_complete_atom' or r['goalId'].startswith('af1094c1'):continue
 key=(r['state'],r['goalId'][:8]);pres,note=choices[key];file,occ=lower(r['state']);inputpaths.append(file);alts=[]
 for pre in pres.split():
  i=gid(pre);g=goals[i];assert i in occ
  old={v:i in mem[v]['sourceSelectedLowerAtomicGoalIds'] for v in r['originalLowerMembership']};assert all(old.values())
  assert {'GK','LK'} <= set(g.get('tags',[]));assert 'DE-'+r['state'] in g['applicability']['jurisdiction']
  alts.append({'goalId':i,'title':g['title'],'description':g['description'],'alreadyInOriginalGkLkLowerS':old,'alreadyTargetInFrozenV33SekIView':True,'occurrences':occ[i],'noViewMutationRequired':True})
 rows.append({'state':r['state'],'excludedNewFullAtom':r['goalId'],'recommendation':'Exclude only the newly introduced full-atom direct_lower supplement; preserve old scope and required closure.','existingNarrowerContent':alts,'qualification':note,'frozenView':str(file.relative_to(R)),'sha256':sha(file)})
assert len(rows)==16
snfile,snocc=lower('SN');basics=[]
for pre in ['b92827a7','46e42b07','f7f2c254']:
 i=gid(pre);g=goals[i];assert i in snocc
 old={v:i in mem[v]['sourceSelectedLowerAtomicGoalIds'] for v in ['de-sn-gym-physics-gk','de-sn-gym-physics-lk']};assert all(old.values())
 basics.append({'goalId':i,'title':g['title'],'originalLowerS':old,'currentV33LowerTarget':True,'occurrences':snocc[i]})
pdf=R/'curricula/DE/Gymnasium/input/SN/lehrplan-gymnasium-physik-sachsen-2025.pdf';ex=R/'curricula/DE/Gymnasium/input/SN/lower-secondary/source-extraction/DE_SN_PHYSIK_SEKI_LEHRPLAN_GYMNASIUM_2025.source-extraction.json';source=json.loads(ex.read_text());sg={g['id']:g for g in source['sourceGoals']};inputpaths.extend([pdf,ex,snfile])
sourceids=['sn-phys-seki-sn-klassenstufe-7-lb3-040-01-755f2bf6','sn-phys-seki-sn-klassenstufe-8-lb3-056-01-02d6f9a5','sn-phys-seki-sn-klassenstufe-9-lb2-068-02-5204ce86','sn-phys-seki-sn-klassenstufe-9-lb4-077-01-fed75172','sn-phys-seki-sn-klassenstufe-9-lb4-078-02-2a69b495'];assert all(i in sg for i in sourceids)
transformer={'state':'SN','goalId':gid('af1094c1'),'decision':'RETAIN_AS_REVIEWED_MODEL_OPERATIONALIZATION','officialExplicit':[{'printedPage':16,'pdfPage':28,'content':'J7 Leistung als Energie pro Zeit, Energiebilanzen, Wirkungsgrad.'},{'printedPage':20,'pdfPage':32,'content':'J8 explizit E=U*I*t und P=U*I; elektrische Energie und Leistung anwenden.'},{'printedPage':23,'pdfPage':35,'content':'J9 Energieerhaltung/Umwandlung und elektromagnetische Induktion.'},{'printedPage':24,'pdfPage':36,'content':'J9 Transformator, U1/U2=N1/N2, Wirkungsgrad und Hochspannungs-Energieübertragung.'},{'printedPage':26,'pdfPage':38,'content':'J9 Praktikum: Gesetze am Transformator und Erklärungsprobleme am belasteten Transformator.'}],'ownOperationalization':{'statement':'Das verlustfreie ideale Modell verbindet die ausdrücklich vermittelten Spannungsübersetzung und Leistungs-/Energiegrundlagen; die gegenläufige Stromübersetzung ist eine angemessene eigene didaktische Folgerung.','assumptions':['Ideale magnetische Kopplung, vernachlässigte Verluste und Magnetisierungsleistung.','Stationärer Betrieb mit für das einfache Schulmodell passend gewählter Last; P=U*I wird ohne verborgenen Leistungsfaktor benutzt.','Keine Behauptung, dass ein realer belasteter Transformator Wirkungsgrad1 besitzt.'],'derivation':['P1=P2','U1*I1=U2*I2','I1/I2=U2/U1=N2/N1'],'notAnExplicitOfficialQuote':'Das Stromübersetzungsverhältnis ist auf den geprüften Originalseiten nicht als eigene Pflichtformel gedruckt. Es wird hier unabhängig als SkillPilot-Operationalisierung geprüft, nicht als wortgetreue EXACT-Quellbindung behauptet.'},'retainedSourceGoalIds':sourceids,'existingLowerFoundations':basics,'scopeChange':'No new atom, no altered requires; keep the already-authored af1094c1 supplement with honest provenance.'}
report={'schema':'independent-physics-lower-partial-second-review-v1','scope':'17 previous partial pairs: one model-operationalization judgment plus16 bounded existing-content checks','transformer':transformer,'otherPartialCases':rows,'counts':{'otherPairs':len(rows),'withExistingNarrowerOrPartialFoundation':sum(bool(x['existingNarrowerContent']) for x in rows),'withoutExistingNarrowerLowerAtom':sum(not x['existingNarrowerContent'] for x in rows),'newGoalsOrScopeEdits':0},'pins':{str(f.relative_to(R)):sha(f) for f in sorted(set(inputpaths))},'limits':['Existing narrower content does not claim replacement of every part of the excluded full atom.','Scope evidence binds original reviewed GK/LK lower seed inventories and unchanged V33 dedicated SekI target references, plus jurisdiction/course tags; this is not a fresh backend capture.','Existing requires closure is untouched. Excluding a direct seed does not authorize removing a necessary atom from L.','No new task/goal/reference/view or retained source mutation.']}
(OUT/'partial-second-review.actual.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(report['counts']));print('SN transformer:',transformer['decision'])
