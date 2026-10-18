import json, hashlib, shutil, subprocess, re
from pathlib import Path
from collections import Counter, defaultdict
from datetime import datetime, timezone

ROOT=next(p for p in Path(__file__).resolve().parents if (p/'AGENTS.md').is_file())
OUT=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-six-process-remaining-states-direct-source-author-20261018-v1'
OUT.mkdir(parents=True,exist_ok=True)
def rd(p):return json.loads((ROOT/p).read_text())
def pin(p):
 p=Path(p);p=p if p.is_absolute() else ROOT/p;b=p.read_bytes()
 return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def wr(p,x):
 p=OUT/p;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');json.loads(p.read_text());return pin(p)
def cp(p,name):
 q=OUT/name;q.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(ROOT/p,q);assert (ROOT/p).read_bytes()==q.read_bytes();return pin(q)
CAN='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
REG='curricula/DE/Gymnasium/provenance/canonical-goal-surrogate-evidence-registry.json'
DIAG='tmp/chemie450-source-gate003-diagnosis/DIAGNOSIS.CQR003.existing-bindings.json'
INP='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-BB-BE-six-process-source-author-20261018-v1/INPUT.six-whole-current-goals-and-P.json'
INDEX='tmp/chemie450-six-process-direct-source-candidates/SOURCEINDEX.current-extraction-cells.json'
G=dict(zip(['arguments','dataQuality','sources','hypothesisData','documentation','symbols'],['431a0f03-f28a-5e56-a61f-000336d0b410','4aa3a130-b517-5ac5-87b2-147fe432cadd','5b1bb5d9-07b1-5ba9-b320-cc97be917c60','7d9fcc7f-1c20-5d5b-9cf6-05f6b624dab6','9fc800d1-92d1-5ef6-81c1-33960ae034dd','e7c363d4-e02d-4895-8750-ba62c2eb63fe']))
C=rd(CAN);bygoal={g['id']:g for g in C['goals']};inputs=rd(INP)
before=[pin(CAN),pin(REG)]
for r in inputs:
 assert r['wholeGoal']==bygoal[r['wholeGoal']['id']]
 native=json.loads((ROOT/r['reviewPath']).read_text().splitlines()[r['line']-1]);assert native['profile']==r['wholeProfile']
 before.append(pin(r['reviewPath']))
cp(INP,'INPUT.six-whole-current-goals-and-P.exact.json')
registry=rd(REG)['entries'];accepted=[r for r in registry if r.get('landscapeId')==C['landscapeId'] and r.get('status')=='accepted']
assert len(accepted)>=21
accepted_pairs={(r['goalId'],r['jurisdiction']) for r in accepted}
dg=[r for r in rd(DIAG)['forwardGoals'] if r['goalId'] in G.values()]
original={(r['goalId'],s) for r in dg for s in r['jurisdictions']}
pairs=sorted(p for p in original if p[1] not in ['DE-BB','DE-BE'] and p not in accepted_pairs)
assert len(original)==78 and len(pairs)==60
assert len(original&accepted_pairs)==6
wr('INPUT.scope-selector-and-exclusions.exact.json',{'method':'Finite 6-goal slice of original CQR003 forwardGoals; subtract BB/BE and current accepted surrogate pairs. No compiler or global report.','diagnosisInput':pin(DIAG),'registryInput':pin(REG),'originalSixRows':dg,'originalPairCount':78,'excludedBBBE':sorted(p for p in original if p[1] in ['DE-BB','DE-BE']),'acceptedChemistryRegistryEntries':accepted,'acceptedWithinSix':sorted(original&accepted_pairs),'remaining60Pairs':[{'goalId':g,'jurisdiction':s} for g,s in pairs]})
idx=rd(INDEX);cells={r['goal']['id']:r for r in idx}

def ext(st,stage='upper-secondary'):
 arr=sorted({r['file'] for r in idx if r['state']==st and f'/{stage}/source-extraction/' in r['file']})
 if st=='HE' and stage=='upper-secondary':return next(p for p in arr if 'CURRENT2026' in p)
 return next(p for p in arr if '/input/' in p)
BASE={s:ext(s) for s in ['HE','HH','MV','NI','NW','RP','ST','TH']}
BASE['NI']=ext('NI','lower-secondary')
BASE['SL']=ext('SL','lower-secondary');BASE['SN']=ext('SN','lower-secondary')
BASE['BW']='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-q3-three-BW-source-adoption-technical-successor-20261010-v1/sources/whole-BW126-original-operative-document-contract.exact.json'
BASE['TH']='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/chemie-b007-targeted-scoring-source-binding-author-successor-20261011-v7/candidate/source-extraction-successors/DE_TH_CHEMIE_SEKII_LEHRPLAN_GYMNASIUM_2024.source-extraction.json'
PDF={s:rd(p)['sourceDocument']['path'] for s,p in BASE.items()}
PDF['HB']='curricula/DE/Gymnasium/input/HB/GyO_Chemie_2022.pdf'
PDF['SH']='curricula/DE/Gymnasium/input/SH/Fachanforderungen_Chemie_Sekundarstufe_2022_barrierearm.pdf'
READ={'HE':[[22,28],[30,30]],'HH':[[14,22]],'MV':[[12,17]],'RP':[[9,16]],'TH':[[20,20],[37,42]],'BW':[[11,13]],'NI':[[46,49],[51,51],[56,56]],'NW':[[17,26],[29,33]],'ST':[[8,17]],'SL':[[7,16],[19,22]],'SN':[[13,18],[22,22]],'HB':[[10,12]],'SH':[[17,21]]}
rawpages={}
for st,ranges in READ.items():
 for lo,hi in ranges:
  t=subprocess.check_output(['pdftotext','-f',str(lo),'-l',str(hi),'-layout',str(ROOT/PDF[st]),'-'],text=True)
  p=OUT/f'primary-reading/{st}.physical-p{lo}-p{hi}.pdftotext-layout.txt';p.parent.mkdir(parents=True,exist_ok=True);p.write_text(t)
  for n,page in enumerate(t.split('\f')[:hi-lo+1],lo):rawpages[st,n]=page
 before.append(pin(PDF[st]))

STAGE={s:'SekII, end of Qualifikationsphase; common GK/LK standards, course depth/self-direction differ; no whole-course completion' for s in ['HE','HH','RP','TH','MV']}
STAGE.update({'BW':'General process competencies of the Gymnasium plan; concrete content/stage and 3.2/3.3 course demands remain separate. No GK/LK full-route equivalence.','NI':'SekI process progression, section3.3.1; no SekII end-standard or performance substitution.','NW':'End of Einführungsphase, chapter2.2; angeleitet/unterstützt retained. Not GK/LK Qualifikationsphase standard completion.','ST':'Exact EP or Q column named on each added clause. No silent column or gAN/eAN conversion; practical duties on p11 remain open.','SL':'MSA-oriented competency definitions in Klasse8 plan; abstract definitions only, not subject-topic or complete SekII standards.','SN':'Klasse7 LB1 / Klasse8 LB1 as located; no SekII or full practical credit.'})
new=defaultdict(list);edges=[];used={};specific={}
def norm(t):
 t=t.replace('\x07','')
 t=re.sub(r'(\w)[-­]\s*\n\s*(\w)',r'\1\2',t)
 t=t.replace('\u00ad','')
 return re.sub(r'\s+',' ',t).strip()
def add(st,code,text,page,section,kind='numberedStandard',course='GK_LK',parent=None,targets=()):
 base=rd(BASE[st]);prefix=f'{st.lower()}-chemistry-{base["stage"].lower()}-process'
 if st=='HE':prefix='he-chemistry-sekii-kc2024-current2026'
 sid=f'{prefix}-standard-{code.lower().replace(".","-")}'
 pid=f'{prefix}:standards-{code[0].lower()}' if st=='HE' else f'{prefix}:{section.lower().replace(" ","-")}'
 # Whole source text must literally match official PDF after line-wrap/soft-hyphen normalization.
 a=norm(text);b=norm(rawpages[st,page])
 if a not in b and st=='ST':
  x,w=(135,205) if code.startswith('EP') else (340,220)
  crop=subprocess.check_output(['pdftotext','-f',str(page),'-l',str(page),'-x',str(x),'-y','0','-W',str(w),'-H','790','-layout',str(ROOT/PDF[st]),'-'],text=True)
  (OUT/f'primary-reading/ST.physical-p{page}.{code}-column.pdftotext-layout.txt').write_text(crop)
  b=norm(crop)
 assert a in b,(st,code,a,b)
 goal={'id':sid,'passageId':pid,'topicCode':section,'title':f'{code}: {text}','description':text,'sourceDocumentKey':base['sourceDocument']['key'],'sourceText':text,'parentBulletText':parent or text,'sourceRef':f'{base["sourceDocument"]["title"]}; physical PDF{page}; {section}; {code}.','sourceSpan':{'passageId':pid,'label':f'physical PDF{page}, {section}, {code}'},'courseLevel':course,'granularity':'officialCompleteNumberedStandard' if kind=='numberedStandard' else 'officialCompleteUnnumberedClause','tags':[f'jurisdiction:DE-{st}',f'stage:{base["stage"]}',f'course:{course}'],'metadata':{'officialStandardCode':code if kind=='numberedStandard' else None,'localLocatorLabel':code,'officiallyNumbered':kind=='numberedStandard','physicalPdfPage':page,'extractionMethod':'Author read whole primary section; complete clause, line wrapping only normalized; inactive additive candidate; no independent review yet.','stageCourseBoundary':STAGE[st]}}
 if st=='NW' and code.startswith('S'):
  goal['metadata']['officialStandardCode']=code.split('-')[0]
  if code.endswith('-Q'):goal['metadata']['stageCourseBoundary']='End of Qualifikationsphase, chapter2.3; common over-arching GK/LK standard; full course/content and practical/digital clauses remain separate.'
 if kind=='completeCompetenceDefinition':goal['granularity']='officialCompleteCompetenceDefinitionNotNumberedStandard'
 assert sid not in used and all(sid!=g['id'] for g in base['sourceGoals'])
 new[st].append(goal);used[sid]=(st,goal,BASE[st],page,text)
 for key in targets:link(st,key,sid)
 return sid
def link(st,key,sid,extra=''):
 assert (G[key],'DE-'+st) in pairs
 edges.append({'jurisdiction':'DE-'+st,'targetGoalId':G[key],'targetKey':key,'sourceGoalId':sid,'matchType':'partial','authorDisposition':'PROPOSE_PARTIAL','independentReviewStatus':'PENDING','extraBoundaryDe':extra})
def use(st,key,sid,page,primary=None,extra=''):
 r=cells[sid];assert r['state']==st;goal=r['goal']
 path=r['file'];assert rd(path)['sourceGoals'][[v['id'] for v in rd(path)['sourceGoals']].index(sid)]==goal
 if primary:
  raw=rawpages[st,page]
  if st=='SN' and norm(primary) not in norm(raw):
   raw=subprocess.check_output(['pdftotext','-f',str(page),'-l',str(page),'-x','0','-y','0','-W','295','-H','790','-layout',str(ROOT/PDF[st]),'-'],text=True)
   (OUT/f'primary-reading/SN.physical-p{page}.left-column.pdftotext-layout.txt').write_text(raw)
  assert norm(primary) in norm(raw),(st,sid,primary)
 used[sid]=(st,goal,path,page,primary or goal['sourceText'])
 link(st,key,sid,extra)

# Selected complete shared AHR standards: actual wording of each state is preserved.
COMMON={
 'E5':'führen qualitative und quantitative experimentelle Untersuchungen – den chemischen Arbeitsweisen und Sicherheitsregeln entsprechend – durch, protokollieren sie und werten diese aus',
 'E8':'finden in erhobenen oder recherchierten Daten Strukturen, Beziehungen und Trends, erklären diese theoriebezogen und ziehen Schlussfolgerungen',
 'K1':'recherchieren zu chemischen Sachverhalten zielgerichtet in analogen und digitalen Medien und wählen für ihre Zwecke passende Quellen aus',
 'K2':'wählen relevante und aussagekräftige Informationen und Daten zu chemischen Sachverhalten und anwendungsbezogenen Fragestellungen aus und erschließen Informationen aus Quellen mit verschiedenen, auch komplexen Darstellungsformen',
 'K5':'wählen chemische Sachverhalte und Informationen sach-, adressaten- und situationsgerecht aus',
 'K8':'strukturieren und interpretieren ausgewählte Informationen und leiten Schlussfolgerungen ab',
 'B3':'beurteilen Informationen und Daten hinsichtlich ihrer Angemessenheit, Grenzen und Tragweite',
 'B5':'entwickeln anhand relevanter Bewertungskriterien Handlungsoptionen in gesellschaftlich- oder alltagsrelevanten Entscheidungssituationen mit fachlichem Bezug und wägen sie gegeneinander ab'}
TKEY={'E5':'documentation','E8':'hypothesisData','B3':'dataQuality','B5':'arguments','K1':'sources','K2':'sources','K5':'sources','K8':'sources'}
PAGES={'HE':{'E5':24,'E8':24,'K1':26,'K2':26,'K5':26,'K8':26,'B3':27,'B5':27},'HH':{'E5':19,'E8':19,'K1':20,'K2':20,'K5':20,'K8':20,'B3':21,'B5':21},'RP':{'E5':13,'E8':13,'K1':14,'K2':14,'K5':14,'K8':14,'B3':15,'B5':16}}
for st in PAGES:
 for code,text in COMMON.items():
  if st=='HH':
   if code=='E5':text+=' (5.2, 5.3)'
   if code=='K1':text+=' (1.1, 1.2, 1.3)'
   if code=='B5':text=text.replace('gesellschaftlich- oder alltagsrelevanten','gesellschaftlich relevanten oder alltagsrelevanten')
  add(st,code,text,PAGES[st][code],'3.2' if st=='HE' else ('2.2' if st=='HH' else {'E':'2.2','K':'2.3','B':'2.4'}[code[0]]),targets=[TKEY[code]])

# One HE cell per whole standard, shared with the separate 53-pair author. No mapping votes for his goals here.
EXTRA_HE={
 'S2':(23,'leiten Voraussagen über die Eigenschaften der Stoffe auf Basis chemischer Strukturen und Gesetzmäßigkeiten begründet ab'),
 'S7':(23,'beschreiben die Umkehrbarkeit chemischer Reaktionen, das dynamische Gleichgewicht und das Donator-Akzeptor-Prinzip und wenden diese an'),
 'S15':(24,'grenzen mithilfe von Modellen den statischen Zustand auf Stoffebene vom dynamischen Zustand auf Teilchenebene ab'),
 'E4':(24,'planen, gegebenenfalls unter Berücksichtigung der Variablenkontrolle, experiment- oder modellbasierte Vorgehensweisen, auch zur Prüfung von Hypothesen, Aussagen oder Theorien'),
 'E10':(24,'reflektieren die eigenen Ergebnisse und den eigenen Prozess der Erkenntnisgewinnung'),
 'E12':(26,'reflektieren Möglichkeiten und Grenzen des konkreten Erkenntnisgewinnungsprozesses sowie der gewonnenen Erkenntnisse (zum Beispiel Reproduzierbarkeit, Falsifizierbarkeit, Intersubjektivität, logische Konsistenz, Vorläufigkeit)'),
 'B10':(27,'bewerten die gesellschaftliche Relevanz und ökologische Bedeutung der angewandten Chemie'),
 'B12':(28,'beurteilen und bewerten Auswirkungen chemischer Produkte, Methoden, Verfahren und Erkenntnisse in historischen und aktuellen gesellschaftlichen Zusammenhängen'),
 'B13':(28,'beurteilen und bewerten Auswirkungen chemischer Produkte, Methoden, Verfahren und Erkenntnisse sowie des eigenen Handelns im Sinne einer nachhaltigen Entwicklung aus ökologischer, ökonomischer und sozialer Perspektive')}
for code,(page,text) in EXTRA_HE.items():add('HE',code,text,page,'3.2',targets=[])

# TH uses infinitive wording; do not transplant Hessen's finite wording.
TH={
 'E5':(41,'qualitative und quantitative experimentelle Untersuchungen – den chemischen Arbeitsweisen und Sicherheitsregeln entsprechend – durchführen, protokollieren und auswerten'),
 'E8':(41,'in erhobenen oder recherchierten Daten Strukturen, Beziehungen und Trends finden, diese theoriebezogen erklären und Schlussfolgerungen ziehen'),
 'K1':(41,'zu chemischen Sachverhalten zielgerichtet in analogen und digitalen Medien recherchieren und für ihre Zwecke passende Quellen auswählen'),
 'K2':(41,'relevante und aussagekräftige Informationen und Daten zu chemischen Sachverhalten und anwendungsbezogenen Fragestellungen auswählen und Informationen aus Quellen mit verschiedenen, auch komplexen Darstellungsformen erschließen'),
 'K5':(42,'chemische Sachverhalte und Informationen sach-, adressaten- und situationsgerecht auswählen'),
 'K8':(42,'ausgewählte Informationen strukturieren, interpretieren und Schlussfolgerungen ableiten'),
 'B3':(42,'Informationen und Daten hinsichtlich ihrer Angemessenheit, Grenzen und Tragweite beurteilen'),
 'B5':(42,'anhand relevanter Bewertungskriterien Handlungsoptionen in gesellschaftlich- oder alltagsrelevanten Entscheidungssituationen mit fachlichem Bezug entwickeln und sie gegeneinander abwägen')}
for code,(page,text) in TH.items():add('TH',code,text,page,'4 Kompetenzerwerb Qualifikationsphase',targets=[TKEY[code]])

# MV has unnumbered complete bullets. E/K/B labels below are local locators, never claimed official numbers.
MV={
 'E-experiment-bullet2':(14,'qualitative und quantitative experimentelle Untersuchungen – den chemischen Arbeitsweisen und Sicherheitsregeln entsprechend – durchführen, protokollieren und auswerten','documentation'),
 'E-reflection-bullet1':(14,'in erhobenen oder recherchierten Daten Strukturen, Beziehungen und Trends finden und diese theoriebezogen erklären und Schlussfolgerungen ziehen','hypothesisData'),
 'K-erschliessen-bullet1':(15,'zu chemischen Sachverhalten zielgerichtet in analogen und digitalen Medien recherchieren und für ihre Zwecke passende Quellen auswählen','sources'),
 'K-erschliessen-bullet2':(15,'relevante und aussagekräftige Informationen und Daten zu chemischen Sachverhalten und anwendungsbezogenen Fragestellungen auswählen und Informationen aus Quellen mit verschiedenen, auch komplexen Darstellungsformen erschließen','sources'),
 'K-aufbereiten-bullet1':(15,'chemische Sachverhalte und Informationen sach-, adressaten- und situationsgerecht auswählen','sources'),
 'K-aufbereiten-bullet4':(15,'ausgewählte Informationen strukturieren und interpretieren und Schlussfolgerungen ableiten','sources'),
 'K-austauschen-bullet1':(15,'Fachbegriffe und -sprache korrekt verwenden','symbols'),
 'B-beurteilen-bullet3':(16,'Informationen und Daten hinsichtlich ihrer Angemessenheit, Grenzen und Tragweite beurteilen','dataQuality'),
 'B-entscheiden-bullet1':(16,'anhand relevanter Bewertungskriterien Handlungsoptionen in gesellschaftlich- oder alltagsrelevanten Entscheidungssituationen mit fachlichem Bezug entwickeln und sie gegeneinander abwägen','arguments')}
for code,(page,text,key) in MV.items():add('MV',code,text,page,'3.1 Abschlussbezogene Standards',kind='unnumberedCompleteBullet',targets=[key])

add('BW','2.1.8','aus Einzelerkenntnissen Regeln ableiten und deren Gültigkeit überprüfen',11,'2.1 Erkenntnisgewinnung',targets=['hypothesisData'])
add('BW','2.2.7','den Verlauf und die Ergebnisse ihrer Arbeit dokumentieren sowie adressatenbezogen präsentieren',12,'2.2 Kommunikation',targets=['documentation'])
add('BW','2.3.5','die Aussagekraft von Darstellungen in Medien bewerten',13,'2.3 Bewertung',targets=['dataQuality'])
add('NI','Quantifizieren-bullet3','Abweichungen von Messergebnissen beschreiben und deuten',47,'3.3.1 Prozessbezogene Kompetenzen',kind='unnumberedCompleteBullet',course='unspecified',targets=['dataQuality'])
add('NI','Quantifizieren-bullet4','Anhand gegebener oder gewonnener Daten Gesetzmäßigkeiten ableiten',47,'3.3.1 Prozessbezogene Kompetenzen',kind='unnumberedCompleteBullet',course='unspecified',targets=['hypothesisData'])
use('NI','arguments','ni-chemistry-seki-kc2015-st-9-10-6-kompetenz-011-36c47375',56)
# Add page56 below to the primary-reading inventory before use checks are applied.
use('NI','documentation','ni-chemistry-seki-kc2015-st-5-6-1-kompetenz-010-5f006309',51,extra='Nur Protokoll-Unterkompetenz; Durchführung einfacher eigener Experimente bleibt bei papiergestütztem P offen.')

for code,text in {'K1':'recherchieren angeleitet zu chemischen Sachverhalten in analogen und digitalen Medien und wählen für ihre Zwecke passende Quellen aus','K2':'wählen relevante und aussagekräftige Informationen und Daten zu chemischen Sachverhalten und anwendungsbezogenen Fragestellungen aus und erschließen Informationen aus Quellen mit verschiedenen Darstellungsformen','K5':'wählen unterstützt chemische Sachverhalte und Informationen sach-, adressaten- und situationsgerecht aus','K8':'strukturieren ausgewählte Informationen und leiten Schlussfolgerungen ab'}.items():add('NW',code,text,25,'2.2 Einführungsphase',targets=['sources'])
add('NW','S16-EP','entwickeln an ausgewählten Beispielen Reaktionsgleichungen',23,'2.2 Einführungsphase',targets=[])
add('NW','S16-Q','entwickeln Reaktionsgleichungen',33,'2.3 Qualifikationsphase, gemeinsame übergeordnete Standards GK/LK',targets=[])
add('NW','S14-Q','beschreiben ausgewählte Reaktionsmechanismen',33,'2.3 Qualifikationsphase, gemeinsame übergeordnete Standards GK/LK',targets=[])

add('ST','Q-E-Prozessgrenzen','Prozesse der Erkenntnisgewinnung beschreiben, reflektieren sowie Möglichkeiten und Grenzen ableiten',12,'Kapitel2 Erkenntnisgewinnung, Qualifikationsphase',kind='unnumberedCompleteBullet',targets=['dataQuality','hypothesisData'])
add('ST','EP-E-Experiment','selbstständig Experimente unter Beachtung von Sicherheits- und Umweltaspekten durchführen, beobachten, auswerten und protokollieren',12,'Kapitel2 Erkenntnisgewinnung, Einführungsphase',kind='unnumberedCompleteBullet',targets=['documentation'])
add('ST','Q-K-Argument','sachlogisch argumentieren und schlüssig chemische Sachverhalte und Fragestellungen begründen',14,'Kapitel2 Kommunikation, Qualifikationsphase',kind='unnumberedCompleteBullet',targets=['arguments'])
add('ST','EP-K-Zeichensprache','chemische Sachverhalte unter Verwendung der chemischen Zeichensprache und/oder mit Modellen und Darstellungen beschreiben, veranschaulichen oder erklären',14,'Kapitel2 Kommunikation, Einführungsphase',kind='unnumberedCompleteBullet',targets=['symbols'])

# SL complete competence definitions, explicitly not fabricated numbered standards.
add('SL','MSA-Erkenntnis-definition','Die Erkenntnisgewinnungskompetenz der Lernenden zeigt sich in der Kenntnis grundlegender naturwissenschaftlicher Denk- und Arbeitsweisen verbunden mit der Fähigkeit, diese zu beschreiben, zu erklären, für Erkenntnisprozesse systematisch zu nutzen und deren Möglichkeiten und Grenzen zu reflektieren. Für das Fach Chemie sind hier insbesondere Experimente, Untersuchungen sowie die Nutzung von Modellen zu nennen.',7,'Kompetenzbereiche des Fachs Chemie',kind='completeCompetenceDefinition',course='unspecified',targets=['dataQuality'])
add('SL','MSA-Kommunikation-definition','Die Kommunikationskompetenz der Lernenden zeigt sich in der Kenntnis von Fachsprache und fachtypischen Darstellungen verbunden mit der Fähigkeit, daraus fachbezogene Informationen zu erschließen, diese adressaten- und situationsgerecht aufzubereiten und sich argumentativ auszutauschen. Im Fach Chemie spielt die Nutzung der Formelsprache dabei eine wichtige Rolle.',7,'Kompetenzbereiche des Fachs Chemie',kind='completeCompetenceDefinition',course='unspecified',targets=['sources'])
add('SL','MSA-Bewertung-definition','Die Bewertungskompetenz der Lernenden zeigt sich in der Kenntnis von fachlichen und überfachlichen Perspektiven und Bewertungsverfahren, verbunden mit der Fähigkeit, Handlungsoptionen anhand verschiedener Kriterien zu beurteilen, um Entscheidungen auch auf ethischer Grundlage zu treffen, die Folgen abzuschätzen und Entscheidungsprozesse zu reflektieren.',7,'Kompetenzbereiche des Fachs Chemie',kind='completeCompetenceDefinition',course='unspecified',targets=['arguments'])
use('SL','hypothesisData','sl-chem-seki-sl-ch-seki-8-2024-p013-004-e3b97259',13,extra='Allein Trennung von Durchführung, Beobachtung und Erklärung; kein kompletter Hypothesentest oder echte Versuchsdurchführung.')
use('SL','documentation','sl-chem-seki-sl-ch-seki-8-2024-p013-005-88752ad8',13)
use('SL','symbols','sl-chem-seki-sl-ch-seki-8-2024-p019-003-09a99dd9',19,extra='Nur Elementnamen/Elementsymbole; nicht sämtliche Molekülformeln.')

add('SN','KL7-LB1-Protokollieren','Protokollieren von Experimenten',18,'Klasse7 LB1 Untersuchen von Stoffen',kind='unnumberedCompleteBullet',course='unspecified',parent='Beherrschen von einfachen Verfahren im Umgang mit Chemikalien, Geräten und dem Brenner',targets=['documentation'])
use('SN','symbols','sn-chem-seki-sn-ch-klassenstufe-8-lb1-021-02-022555db',22,'Einblick in den Bau von Sauerstoff, Stickstoff, Kohlenstoffdioxid aus Molekülen gewinnen',extra='Nur Unterscheidung Symbol–Formel an Sauerstoff/Stickstoff/Kohlenstoffdioxid; Einblick-Niveau beibehalten, keine gesamte Reaktionsgleichungsbildung. Unterpunkt Molekül; rechte Hinweisspalte: Modelle, Unterscheidung Symbol - Formel. Der operative Zellentext verknüpft Tabellenspalten, er ist kein zusammenhängendes wörtliches PDF-Zitat.')
use('TH','symbols','th-chem-seki-th-ch-seki-2-1-1-2-atombau-periodensystem-der-elemente-pse-024-01-2b552dd6',20)
use('HB','arguments','hb-chemistry-sekii-gyo2022-clause-p11-std-k-standard-k9-k13-gk_lk-02',11,'erklären chemische Sachverhalte und argumentieren fachlich schlüssig',extra='Operative Source-Zelle ist ausdrücklich als Autorenparaphrase markiert; hier zusätzlich der ganze echte K10-Wortlaut, keine Verwechslung mit wörtlichem Zellentext.')
use('HB','symbols','hb-chemistry-sekii-gyo2022-clause-p11-std-k-standard-k9-k13-gk_lk-01',11,'verwenden Fachbegriffe und -sprache korrekt',extra='Operative Zelle ist Autorenparaphrase. Formel-/Symbolbezug allein im ganzen Kommunikationskapitel PDF10 belegt; nur elementare Formelsprache, nicht gesamte Fachsprache.')

SH={
 'arguments':[('de-sh-chemie-seki-fachanforderungen-2022-2-1-2-kommunikation-013-4d782045',19),('de-sh-chemie-seki-fachanforderungen-2022-2-1-2-kommunikation-015-8a55ae02',19)],
 'dataQuality':[('de-sh-chemie-seki-fachanforderungen-2022-2-1-1-erkenntnisgewinnung-022-ed7bc4f6',18)],
 'sources':[('de-sh-chemie-seki-fachanforderungen-2022-2-1-2-kommunikation-003-00d3f7b7',19),('de-sh-chemie-seki-fachanforderungen-2022-2-1-2-kommunikation-005-3e516bb8',19),('de-sh-chemie-seki-fachanforderungen-2022-2-1-2-kommunikation-007-95c0a7f8',19),('de-sh-chemie-seki-fachanforderungen-2022-2-1-2-kommunikation-009-0e050108',19)],
 'hypothesisData':[('de-sh-chemie-seki-fachanforderungen-2022-2-1-1-erkenntnisgewinnung-020-25b956f5',18)],
 'documentation':[('de-sh-chemie-seki-fachanforderungen-2022-2-1-1-erkenntnisgewinnung-015-edafb207',18)],
 'symbols':[('de-sh-chemie-seki-fachanforderungen-2022-2-1-2-kommunikation-019-46f99048',19)]}
for key,ss in SH.items():
 for sid,page in ss:
  primary='wesentliche Informationen in angemessener Fachsprache sach- und adressatengerecht vermitteln.' if sid.endswith('009-0e050108') else None
  use('SH',key,sid,page,primary,extra='Originaler SekI-Prozessstandard; keine automatische Oberstufen-/Kurs-Vollfreigabe. Beim Vermittlungsstandard bleibt der operative OCR-Zellentext unverändert; die echte Primärseite enthält sach- und adressatengerecht.')

# Serialize only finite additions, not cloned source libraries or fabricated normal review records.
addition_pins={}
for st,goals in new.items():
 base=rd(BASE[st]);pids=sorted({g['passageId'] for g in goals});passages=[]
 for pid in pids:
  gg=[g for g in goals if g['passageId']==pid];pages=sorted({g['metadata']['physicalPdfPage'] for g in gg})
  passages.append({'id':pid,'topicCode':gg[0]['topicCode'],'title':f'{st}: selected whole process clauses, original full pages retained','text':'\n\f\n'.join(rawpages[st,p] for p in pages),'sourceDocumentKey':base['sourceDocument']['key'],'sourceRef':f'{PDF[st]}, physical PDF pages {pages}','physicalPdfPages':pages,'scope':'Full page context, selected clauses only become sourceGoals; all other standards remain unextracted context.'})
 name=f'candidate/extraction-additions/{st}'+('.current2026.complete-selected-standards.additions.json' if st=='HE' else '.complete-selected-process-clauses.additions.json')
 addition_pins[st]=wr(name,{'artifactRole':'INACTIVE_ADDITIVE_SOURCE_EXTRACTION_AUTHOR_CANDIDATE','activation':'inactive-independent-review-required','baseExtraction':pin(BASE[st]),'proposedNormalExtractionPath':BASE[st] if '/input/' in BASE[st] else None,'operativeBaseExtractionPath':BASE[st],'epochBoundary':'HE current2026 PDF and current2026 extraction only; do not attach these new cells to old KC2024 aliases.' if st=='HE' else 'Exact pinned source document and stage only.','sourceLandscapeId':base['sourceLandscapeId'],'sourceDocument':base['sourceDocument'],'sourceDocumentPin':pin(PDF[st]),'wholeOriginalSourceGoalsPreservedByReference':True,'originalSourceGoalCount':len(base['sourceGoals']),'newCompleteSelectedClauseCount':len(goals),'proposedUnionSourceGoalCount':len(base['sourceGoals'])+len(goals),'passagesToAppend':passages,'sourceGoalsToAppend':goals,'method':{'sourceGoalExtraction':'Only the complete selected official numbered standards or explicitly unnumbered complete bullets/definitions listed below. No ellipses, abbreviated operators, surrogate-only anchors or invented official numbering.','terminalListPunctuation':'Complete words/operators preserved; terminal list comma/semicolon/full stop is omitted on several numbered standards. Original full-page punctuation remains in passage text.','unselectedProcessStandards':'Retained whole-page context, not new source goals; no complete source extraction claim.','wholeSourceCoverage':'Not established. Partial proposed edges only.','historicalM3':'Base M3 status concerns its previous finite source inventory only; it cannot be extended automatically.'},'pipelineStatus':{'candidateOnly':True,'currentStep':'MAPPING-3-PENDING-INDEPENDENT-PARTIAL-REVIEW','selectedPrimaryReading':'complete-as-recorded','selectedClauseExtraction':'author-candidate','allNewSourceGoalsFullyCovered':False,'newWholeSourceApprovals':0,'newIndependentReviewDecisions':0,'historicalInventoryCount':len(base['sourceGoals']),'additionInventoryCount':len(goals),'combinedCount':len(base['sourceGoals'])+len(goals),'allOtherStandards':'context-or-unexamined; not counted or approved'},'metadataIntegrationRequirements':['Technical successor must update all method/count/status wording to the exact combined inventory.','Never reuse historic full M3/coverage claims for these new clauses; whole source obligations remain separate.']})

# Goal-specific current evidence model. These are author proposals, not new D/P/A/M/V judgments.
MODEL={
 'arguments':{'contributionDe':'Die vorhandene Route lässt eigene fachliche Pro-/Kontra-Gründe bilden, bereitgestellte Gründe vergleichen und nach selbst genannten Kriterien gewichten. F/G-Wasserbehandlung wird nach geänderter Energieangabe neu gewichtet; 90%-Grenze schließt F als Option aus. Neue E/M-Verpackungsdaten erfordern erneute, belegte Gewichtung; nicht vergleichbare Energie-/Transportgrößen werden nicht addiert.','contributionEn':'The existing route elicits original chemically grounded arguments, compares supplied arguments and weighs criteria. Updated energy data revise F/G water-treatment arguments; the 90% minimum excludes F. A new packaging case requires fresh evidence-based weighting.','limitsDe':'Keine tatsächliche Gruppendiskussion, kein reales Handeln, keine vollständige Entwicklung aller Handlungsoptionen; keine pauschale ethische/gesellschaftliche Vollkompetenz.','requiresDe':'5b bleibt ausdrückliche Informations-/Quellenvorbereitung; aktuelle Route verlangt eigene Argumente, nicht bloß eine angebotene Meinung zu wählen.'},
 'dataQuality':{'contributionDe':'X/Y-Farbnachweis: Kreuzreaktion, Blindprobe und Positivkontrollen begrenzen den Befund; Y-Ausschluss beweist X nicht absolut. Leitfähigkeitsdaten A20/A35/B35 verlangen Temperaturvergleich. Neuer Saccharose-/Matrixfall prüft, ob Ionenbeweglichkeit statt Stoffmenge den Befund erklärt und ob die vorgeschlagene Kontrolle die konkrete Schlussfolgerung trägt.','contributionEn':'Cross-reactivity, blanks and positive controls bound the colour-test inference. Temperature-controlled conductivity comparison and a fresh sucrose/matrix case require judging confounding and permissible conclusions.','limitsDe':'Papierdaten sind keine eigene Messung und keine gesamte quantitative Messunsicherheitsrechnung. Nur die tatsächlich geforderte Fehler-/Verfahrens- und Schlussfolgerungskritik trägt; keine universelle Methodologie oder komplette Modellkritik.','requiresDe':'Keine requires-Abhängigkeit. Der Daten- und Kontrollfall ist eigener direkter Kompetenzbeitrag.'},
 'sources':{'contributionDe':'Die aktuelle Route verbindet vorgegebene und selbst gesuchte, tatsächlich geöffnete und gelesene chemische Quellen. Wo die amtliche Quelle Recherche verlangt, ist eigene Suche mit Suchfrage, Fundstelle, fachlicher Auswertung und Quellenangabe obligatorisch. S/T-Informationen werden für jüngere Klasse bzw. Hausmeister adressatenbezogen ausgewählt; ein neuer Verpackungs-/Wiederverwendungsfall prüft erneute Auswahl und Strukturierung.','contributionEn':'The current route combines supplied sources with the learner’s own search, opening and reading whenever the official clause requires research. Source-based chemical information is selected, structured and adapted to a changed audience and a new packaging case.','limitsDe':'Gegebene Quellen allein erfüllen K1-Recherche nicht. Kein Nachweis der ganzen analogen UND digitalen Recherchebreite, sämtlicher komplexer Darstellungen, realer Präsentation, Gruppenarbeit oder vollständiger Urheber-/Zitatprüfung. Bei nicht geforderter Recherche wird nur Informationserschließung beansprucht.','requiresDe':'a9c ist Orientierung, keine Recherchekompetenz. Die direkte Quellenbindung beruht auf 5bs eigener Auswahl-/Strukturierungsroute, nicht auf Orientierung oder requires-Surrogat.'},
 'hypothesisData':{'contributionDe':'Die vorhandene Route liest Einheiten und Trends der 92/64/49-s-Lösedaten, trennt Lösedauer von maximaler Löslichkeit und begründet die Hypothesenstützung. Neue 50°C-Werte 80/45s müssen beide erhalten bleiben; erneute Leitfähigkeits-/Saccharosedaten erfordern Theoriebezug und begrenzte Schlussfolgerung bei Temperaturkonfundierung.','contributionEn':'The route interprets dissolution-time trends without confusing rate with maximum solubility, evaluates hypothesis support and revises its conclusion using two new 50°C observations and a separate conductivity/sucrose case.','limitsDe':'Keine eigene Datenerhebung, keine neue Experimentdurchführung und keine vollständige selbst entworfene Hypothese. Die HB-spezifische zusätzliche Diagrammerstellung wird außerhalb HB nicht behauptet. Breitere Quellenstandards tragen nur die explizite Daten-/Deutungs-Teilkompetenz.','requiresDe':'9fc liefert Dokumentation/Herkunft, aber neue Schlussfolgerungen werden am eigenen 7d-Endpunkt geprüft; keine Umbenennung eines requires-Ankers in direkte Quelle.'},
 'documentation':{'contributionDe':'R1/R2 lassen Größen, Einheiten, Herkunft und tatsächliche Bedingungen sauber protokollieren; fehlende Angaben bleiben sichtbar. Neuer W3-Datensatz bestätigt keine alte Temperaturbehauptung. Im Kalibrierfall bleiben Rohdaten A=0,290 und c=3,5mg/L erhalten; Korrektur des Verdünnungsfaktors 2→4 ändert den abgeleiteten Wert 7→14mg/L mit nachvollziehbarer Änderungsangabe.','contributionEn':'R1/R2 preserve units, provenance and actual conditions, explicitly mark missing fields and distinguish observation from interpretation. A fresh calibration correction preserves raw readings while changing the dilution-derived result from 7 to 14mg/L.','limitsDe':'Keine tatsächliche qualitative/quantitative sichere Experimentdurchführung aus vorgelegten Daten. E5 und entsprechende Mehrfachverben bleiben vollständig sichtbar; gebunden wird nur nachvollziehbare Protokollierung, ggf. Daten-/Deutungstrennung. Keine Behauptung vollständiger Präsentation.','requiresDe':'a9c ist Orientierung; die nachvollziehbare Daten- und Korrekturspur liegt direkt in 9fc.'},
 'symbols':{'contributionDe':'Die aktuelle Route deutet Elementsymbole und einfache Molekülformeln mit Teilchen-/Atomzählung, u.a. NH3, und unterscheidet Index und Koeffizient (2CO gegenüber CO2) sowie korrekte Groß-/Kleinschreibung.','contributionEn':'The current route interprets element symbols and elementary molecular formulae, including NH3, distinguishes subscripts from coefficients (2CO versus CO2) and checks chemical symbol case.','limitsDe':'Nur Symbol-/elementarer Formelanteil. Keine ganze Fachsprache, sämtliche Stoffklassen, Lewis-/Kernnotation oder vollständige Reaktionsgleichungen; spezifische Quellensubstanzen bleiben eigener Pflichtstoff.','requiresDe':'Keine requires-Abhängigkeit; direkter elementarer Zeichen-/Formelbeitrag.'}}

HOLD={G['arguments']:'Die allgemeinen SN-Fachziele nennen naturwissenschaftliches Argumentieren, enthalten im geprüften direkten Zielbestand aber keine hinreichend abgegrenzte Kriterien-/Pro-/Kontra-Abwägung. Eine generische Fachfamilie wird nicht als vollständiger Einzelstandard neu erfunden.',G['dataQuality']:'SNs geprüfte Primärteile enthalten kritisches Analysieren/Deuten und fachliche Tabellen, aber keinen hinreichend konkreten direkten Standard für Angemessenheit/Gültigkeit/Tragweite oder Verfahrensfehler dieses Endpunkts. Keine Quellenbindung allein über allgemeine Wissenschaftsprosa.',G['sources']:'Nachschlagewerke/Sachbücher/digitale Medien bei Klasse7-Präsentation sind Kontext; die vorhandenen Inhaltszellen verlangen Dokumentationen spezieller Inhalte. Der vollständige zielgerechte Quellen-Auswahl-/Adressatenprozess ist damit für 5b noch nicht konkret direkt verankert. Keine Dokumentation mit tatsächlicher Recherche verwechseln.',G['hypothesisData']:'SNs allgemeine Experimentbeschreibung nennt Arbeitshypothesen, bietet im geprüften Bestand aber keinen hinreichend konkreten direkten ganzen Standard für die aktuelle Tabellen-/Trend-/Hypothesenbewertung. Experimente oder bloße Stoffvergleiche werden dafür nicht passend umgedeutet.'}
by_pair=defaultdict(list)
for e in edges:by_pair[e['targetGoalId'],e['jurisdiction']].append(e)
rows=[]
for gid,j in pairs:
 key=next(k for k,v in G.items() if v==gid);ee=by_pair[gid,j]
 assert bool(ee) or (j=='DE-SN' and gid in HOLD),(gid,j)
 rows.append({'goalId':gid,'jurisdiction':j,'title':bygoal[gid]['title'],'authorDisposition':'PROPOSE_PARTIAL' if ee else 'HOLD','independentReviewStatus':'PENDING','wholeSourceApproval':False,'newHumanApproval':False,'sourceGoalIds':[e['sourceGoalId'] for e in ee],'currentGoalSha256':hashlib.sha256(json.dumps(bygoal[gid],ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest(),'goalHashSerialization':'UTF8 JSON ensure_ascii=false sort_keys=true separators=(comma,colon), no final newline; complete native goal','currentWholeInputLocator':{'path':str((OUT/'INPUT.six-whole-current-goals-and-P.exact.json').relative_to(ROOT)),'arrayIndex':list(G).index(key),'goalField':'wholeGoal','profileField':'wholeProfile'},'currentEvidenceModel':MODEL[key],'individualSourceDeltas':[{'sourceGoalId':e['sourceGoalId'],'directPartialContributionDe':e['extraBoundaryDe'] or 'Direkter expliziter Teilprozess des vollständigen amtlichen Standards; untenstehendes aktuelles Endpunktmodell und Grenzen gelten.','sourceStageCourseBoundary':STAGE.get(j[3:],'SekI or SekII as identified by actual original clause and page; no whole-stage completion.')} for e in ee],'holdReasonDe':None if ee else HOLD[gid],'scopeBoundary':'Pair is existing authored SkillPilot target only. Partial source contribution does not turn the full official clause, whole subject/course, optional content or practical performance into completed coverage.'})
wr('MATRIX.sixty-current-goal-country-direct-source-author.json',rows)
source_input=[]
for sid,(st,g,path,page,wording) in sorted(used.items()):
 source_input.append({'jurisdiction':'DE-'+st,'wholeSourceGoal':g,'origin':'NEW_INACTIVE_ADDITION' if any(g is gg for gg in new[st]) else 'EXISTING_OPERATIVE_SOURCE_CELL','baseExtraction':pin(path),'sourceLandscapeId':rd(path)['sourceLandscapeId'],'primaryPdf':pin(PDF[st]),'physicalPdfPage':page,'actualPrimaryWording':wording,'primaryWordingNormalization':'Only PDF line wraps/soft hyphens normalized; existing author-paraphrase cells retain their truthfully labelled sourceText.','wholeCurrentPassage':next((p for p in rd(path)['passages'] if p['id']==g['passageId']),None),'newAdditionFile':addition_pins.get(st),'stageCourseBoundary':g.get('metadata',{}).get('stageCourseBoundary',STAGE.get(st,'Full original chapter context and exact source-stage tags retained; no whole-course credit.'))})
wr('INPUT.whole-selected-operative-and-new-source-cells.json',source_input)
wr('CANDIDATE.partial-mapping-contributions.pending-independent-review.json',{'artifactRole':'INACTIVE_MAPPING_AUTHOR_PROPOSAL','activation':'inactive','sourceToTargetDirection':'legacyGoalId/sourceGoalId -> canonicalGoalId/targetGoalId','wholeSourceCredit':False,'independentReviewDecisions':0,'mappings':[{'legacyGoalId':e['sourceGoalId'],'canonicalGoalId':e['targetGoalId'],'matchType':'partial','jurisdiction':e['jurisdiction'],'authorDisposition':'PROPOSE_PARTIAL','sourceLandscapeId':rd(used[e['sourceGoalId']][2])['sourceLandscapeId'],'boundaries':MODEL[e['targetKey']]['limitsDe'],'individualBoundary':e['extraBoundaryDe']} for e in edges]})
wr('CHECK.finite-author-scope-and-current-inputs.json',{'scope':'Finite author package syntax, exact current C/P and original source-object identity only; no compiler/build/schema/full-report run.','status':'PASS','originalPairs':78,'excludedBBBE':12,'registeredChemistryPairs':len(accepted),'registeredWithinSix':6,'remainingPairs':60,'proposePartial':sum(r['authorDisposition']=='PROPOSE_PARTIAL' for r in rows),'hold':sum(r['authorDisposition']=='HOLD' for r in rows),'partialEdges':len(edges),'newSourceGoals':sum(map(len,new.values())),'newExtractionAdditions':{s:len(gs) for s,gs in new.items()},'wholeSourceApprovals':0,'independentScientificVotes':0,'allSixWholeGoalsMatchCanonical':True,'allSixWholeProfilesMatchNativeRecords':True,'allNewPrimaryWordingExactAfterDeclaredNormalization':True,'remainingSourcePairsAreOnlyOriginalSelectedScope':True,'noExcludedPairRemapped':True,'noNormalWritesPerformed':True,'notes':['HE17 includes9 additional source cells and NW7 includes3 additional source cells requested by separate author; zero edges for that author’s targets in this package.','Registered Chemistry count rose from21 to22 during authoring because root integrated MV1 outside these six goals; exactly6 registered pairs within this scope and all60 remaining pairs are unchanged.','Stage and course applicability are retained on source clauses; this author does not change views, normal scope or curricular obligations.','No existing source goal or historical decision rewritten; no inherited full M3 claim for new clauses.']})
assert all(pin(p['path'])==p for p in before),'concurrent pinned input changed; re-evaluate actual affected bytes'
wr('BEFOREPINS.actual-normal-and-native-inputs.json',list({p['path']:p for p in before}.values()))
wr('RECEIPT.actual-primary-reading-and-author-execution.json',{'actor':'OpenAI Codex assistant','modelFamily':'GPT-6 family','exactServingModelRevision':'unavailable; not invented','taskMode':'informed source author preparation; independent review pending','notBlind':True,'notHumanApproval':True,'noLearnerExecutionObservedOrClaimed':True,'wholeCurrentCPRead':'Whole six C/P actually read in immediately preceding own BB/BE review; current full-object and native-record equality checked again here. No new D/P/A/M/V vote.','priorOwnReadEvidence':'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-BB-BE-six-process-source-informed-independent-b-20261018-v1/RECEIPT.own-primary-reading-and-execution.actual.json','primaryReadPhysicalRanges':READ,'additionalOriginalReadsNotUsedAsAnchors':['NI upper PDF3-8 and55 search context','SL upper GK PDF3-10; not substituted for lower competence definitions','SN full-PDF keyword search found no exact selected data-quality/research anchor; negative finding is limited to actual inspected text/index, not an assertion that no possible future anchor exists.'],'actualViewImage':['tmp/chemie450-process-author-primary-views/ST-p12.png','tmp/chemie450-process-author-primary-views/SN-p18.png'],'toolsUsed':['exec_command: pdftotext -layout, pdftoppm, Python JSON/sha256 exact-object checks','view_image actual rendered primary ST12 and SN18','apply_patch own author serialization script'],'normalWrites':False,'compilerOrBuildOrFullReportRuns':False,'independentApproval':'not performed by this author','timestampUTC':datetime.now(timezone.utc).isoformat()})
print(json.dumps({'output':str(OUT.relative_to(ROOT)),'pairs':len(rows),'dispositions':dict(Counter(r['authorDisposition'] for r in rows)),'edges':len(edges),'newSources':{s:len(g) for s,g in new.items()},'HEaddition':addition_pins['HE']},ensure_ascii=False,indent=2))
