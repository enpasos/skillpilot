# SPDX-License-Identifier: Apache-2.0
"""Inactive whole-source locator and one genuine prerequisite successor, never approval."""
from pathlib import Path
import copy, datetime, hashlib, json
import fitz

R=Path.cwd();D=Path(__file__).resolve().parent;P=D.relative_to(R).as_posix()
OLD=D.parent/'biologie-source7-SN-ST-SekI-82ac-stage-route-author-successor-v1'
H='82acfbde-9ce8-5658-892e-4dcfb1c3a1f1';Q='328fd9d3-d3c3-5731-a8da-a909143d3962'
NOW=datetime.datetime.now(datetime.timezone.utc).isoformat()
def read(f):return json.loads(f.read_text())
def bind(f):
 b=f.read_bytes();return {'path':f.relative_to(R).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(n,x):
 f=D/n;f.parent.mkdir(parents=True,exist_ok=True);assert not f.exists(),f
 f.write_bytes(x if isinstance(x,bytes) else (x if isinstance(x,str) else json.dumps(x,ensure_ascii=False,indent=2)+'\n').encode());return f
def diff(a,b,p=''):
 if a==b:return []
 if isinstance(a,dict) and isinstance(b,dict):
  return [row for k in sorted(a.keys()|b.keys()) for row in (diff(a[k],b[k],p+'/'+k) if k in a and k in b else [{'pointer':p+'/'+k,'before':a.get(k),'after':b.get(k)}])]
 return [{'pointer':p,'before':a,'after':b}]

before=read(OLD/'inputs/full479-only16.canonical.exact.json');after=copy.deepcopy(before)
assert len(before['goals'])==479
g=next(x for x in after['goals'] if x['id']==Q);assert g['requires']==[H,'2d451684-6e53-565e-a987-f362da919d2c']
g['requires']=[x for x in g['requires'] if x!=H]
put('inputs/whole479-before.exact.json',(OLD/'inputs/full479-only16.canonical.exact.json').read_bytes())
put('candidate/whole479-one-digital-prerequisite-removed.inactive.json',after)
for n,o in [('whole394-kinds.exact.json','full394-only16.semantic-kinds.exact.json'),('whole394-qa.exact.json','full394-only16.visualization-qa.exact.json')]:put('inputs/'+n,(OLD/'inputs'/o).read_bytes())
put('inputs/full394-narrow-SNST-after.normal-model.exact.json',(OLD/'native/full394-after82ac-route.normal-model.actual.json').read_bytes())
put('inputs/whole-two-current-goals-and-original-requires.exact.json',[x for x in before['goals'] if x['id'] in [H,Q]])
put('candidate/whole-two-goals.proposed-requires-successor.json',[x for x in after['goals'] if x['id'] in [H,Q]])
put('candidate/exact-semantic-canonical-value-diff.json',{'schemaVersion':1,'whole479Before':bind(D/'inputs/whole479-before.exact.json'),'whole479Candidate':bind(D/'candidate/whole479-one-digital-prerequisite-removed.inactive.json'),'valueDiff':diff(before,after),'changedWholeGoalIds':[Q],'unchangedOther478WholeGoals':True,'goalsDeleted':0,'goalTextChanges':0,'sourceTagRuleUsed':False})

atlas=read(OLD/'candidate/full394-source-atlas.without82ac-SN-ST-SekI-target.inputs.json')
put('inputs/whole394-narrow-SNST-source-atlas.exact.config.json',atlas)
book=read(OLD/'candidate/full394-book.without82ac-SN-ST-SekI-target.config.json');put('inputs/whole394-before-book.exact.config.json',book)
cfg=copy.deepcopy(atlas);cfg['landscapePath']=P+'/candidate/whole479-one-digital-prerequisite-removed.inactive.json';cfg['semanticKindLedgerPath']=P+'/inputs/whole394-kinds.exact.json'
book['landscapePath']=cfg['landscapePath'];book['semanticKindLedgerPath']=cfg['semanticKindLedgerPath'];book['goalVisualizationQaPath']=P+'/inputs/whole394-qa.exact.json'
put('candidate/whole394-after-book.inactive.config.json',book)

normal=read(OLD/'checks/completed-normal-full394-source-atlas-and-stage-route.actual.json')
rows=[x for x in normal['ordinaryAtlasRuns'][1]['scopeRoles'] if '/SekI/' in x['key'] and x['contains82ac']]
assert len(rows)==9
primary_specs={
 'BB':('BB/lower-secondary/Teil_C_Biologie_2015_11_10.pdf',[13,15,16,18,19,20,21]),
 'BE':('BE/lower-secondary/Teil_C_Biologie_2015_11_10.pdf',[9,10,11,18,19,20,21]),
 'BW':('BW/BP2016BW_ALLG_GYM_BIO_V2.pdf',[5,8,10,12,13]),
 'HH':('HH/biologie-gym-seki-data.pdf',[11,18,19,22,23]),
 'MV':('MV/Biologie_Gymnasium_Gesamtschule_7_10.pdf',[8,14,15,16]),
 'NI':('NI/lower-secondary/kc_naturwissenschaften_gymnasium_sek_i_2015.pdf',[69,70,71,75,76,77,78]),
 'NW':('NW/lower-secondary/g9_bi_klp_-3413_2019_06_23_0.pdf',[19,20,27,28,29]),
 'SH':('SH/Fachanforderungen_Biologie_Sekundarstufe_2023_barrierearm.pdf',[12,13,16,17,18]),
 'TH':('TH/LP_GY_Biologie_2024.pdf',[3,4,12,13,17,18,19,20])}
primary=[];witnesses=[];changes=[];mapping_replacements={}
snapshots={x['path']:x for x in atlas['sourceDocumentSnapshots']}
for state,(name,pages) in primary_specs.items():
 src=R/'curricula/DE/Gymnasium/input'/name;pdf=put(f'primary/{state}-whole-current.original.pdf',src.read_bytes());assert bind(src)['sha256']==snapshots[src.relative_to(R).as_posix()]['sha256']
 doc=fitz.open(src)
 fs=[{'physicalPage':n,'wholeActualText':bind(put(f'primary/{state}-physical-{n:03d}.whole.txt',doc[n-1].get_text()))} for n in pages]
 primary.append({'state':state,'originalSource':bind(src),'portableActualWholePDF':bind(pdf),'officialSnapshot':snapshots[src.relative_to(R).as_posix()],'wholePages':fs,'reusedValidCurrentBytes':True})
 row=next(x for x in rows if x['key']==f'DE-{state}/SekI/');mps={w['mappingPath'] for w in row['whole82acWitnesses']};assert len(mps)==1
 mp=R/next(iter(mps));m=read(mp);ep=R/m['sourceExtractionPath'];e=read(ep)
 put(f'inputs/{state}-whole-operative.mapping.exact.json',mp.read_bytes());put(f'inputs/{state}-whole-operative.extraction.exact.json',ep.read_bytes())
 for w in row['whole82acWitnesses']:
  si=next(i for i,x in enumerate(e['sourceGoals']) if x['id']==w['sourceGoalId']);di=next(i for i,x in enumerate(m['decisions']) if x['sourceGoalId']==w['sourceGoalId'])
  edges=[{'index':i,'wholeEdge':x} for i,x in enumerate(m.get('mappings',[])) if x.get('sourceGoalId')==w['sourceGoalId']]
  witnesses.append({'state':state,'wholeWitness':w,'sourceGoalIndex':si,'decisionIndex':di,'wholeSourceGoal':e['sourceGoals'][si],'wholeDecision':m['decisions'][di],'wholeContributorEdges':edges,'allOriginalDutyCount':len(e['sourceGoals']),'allOriginalDecisionCount':len(m['decisions']),'allOriginalPartnerEdgeCount':len(m.get('mappings',[]))})
 if state not in ['BB','BE','NI']:continue
 en=copy.deepcopy(e);mn=copy.deepcopy(m)
 # Pure primary transport preserves actual bytes. These paths are operative portable successors.
 en['sourceDocument']['path']=pdf.relative_to(R).as_posix()
 for document in en.get('sourceDocuments',[]):
  if document.get('path')==e['sourceDocument']['path']:document['path']=pdf.relative_to(R).as_posix()
 for x in en['sourceGoals']:
  if 'sourcePath' in x:x['sourcePath']=pdf.relative_to(R).as_posix()
 if state in ['BB','BE']:
  wid=row['whole82acWitnesses'][0]['sourceGoalId'];a=next(x for x in en['sourceGoals'] if x['id']==wid)
  locator='RLP Berlin/Brandenburg Biologie 2015, Teil C, 2.2.1-2.2.3 und 2.3.2, S. 18-21; Gymnasium-Niveaustufen nach '+('S. 13-16' if state=='BB' else 'S. 9-11')
  a['sourceRef']=locator
  b=next(x for x in mn['decisions'] if x['sourceGoalId']==wid);b['sourceSpan']=locator
  b['rationale']=b['rationale']+' Additiver Autoren-Locatornachfolger: Der tatsächliche Methodenbeleg steht nicht in2.1/Fachwissen.2.2.2 verlangt Hypothesenexperimente und Kontrolle einschließlich Variablenkontrolle;2.2.1/2.2.3 tragen Beobachten/Vergleichen und Modelle,2.3.2 selbstständiges Protokollieren. Ganze ursprüngliche Partner und Pflichten bleiben. Die einzelne Methoden-Zuordnung zertifiziert nicht sämtliche anderen Partner; unabhängige Whole-Scope-Prüfung offen.'
 else:
  wid='ni-biology-seki-kc2015-eg1-5-6-006-037ec038';a=next(x for x in en['sourceGoals'] if x['id']==wid);assert a['metadata']['sourcePage']==75
  a['metadata']['sourcePage']=76;a['sourceRef']=a['sourceRef'].replace('S. 75.','S. 76.')
  b=next(x for x in mn['decisions'] if x['sourceGoalId']==wid)
  b['rationale']=b['rationale']+' Additiver tatsächlicher Seiten-Locator: Skizzieren einfacher Versuchsaufbauten steht aufS.76, nicht75. Dieser5/6-Skizzenoperator bleibt ein partieller Beitrag und behauptet keine selbstständige vollständige Hypothesen-/Kontrolluntersuchung. Eigenständiges Planen/Kontrollieren/Durchführen/Protokollieren wird in den zusätzlichen7/8-Spalten und Modellarbeit aufS.76-77 separat verlangt. Alle bisherigen Partner und ganzen Pflichten erhalten.'
 b['reviewer']='Codex whole primary locator author; independent review pending';b['reviewedAt']=NOW
 ef=put(f'candidate/source-extractions/{state}-whole-primary-locator.inactive.json',en);mn['sourceExtractionPath']=ef.relative_to(R).as_posix()
 mf=put(f'candidate/mappings/{state}-whole-primary-locator.inactive.review.json',mn);mapping_replacements[mp.relative_to(R).as_posix()]=mf.relative_to(R).as_posix()
 assert m['mappings']==mn['mappings'] and all(x['canonicalGoalIds']==y['canonicalGoalIds'] for x,y in zip(m['decisions'],mn['decisions']))
 changes.append({'state':state,'wholeBeforeMapping':bind(mp),'wholeCandidateMapping':bind(mf),'wholeBeforeExtraction':bind(ep),'wholeCandidateExtraction':bind(ef),'allSemanticAndTransportValueDiffs':{'mapping':diff(m,mn),'extraction':diff(e,en)},'allOriginalSourceGoalIdsExact': [x['id'] for x in e['sourceGoals']]==[x['id'] for x in en['sourceGoals']],'allOriginalPartnersExact':True,'wholeDutyCount':len(e['sourceGoals']),'wholePartnerEdgeCount':len(m.get('mappings',[]))})
cfg['mappingPaths']=[mapping_replacements.get(p,p) for p in cfg['mappingPaths']]
put('candidate/whole394-source-atlas.primary-locators-and-one-prerequisite.inactive.config.json',cfg)
put('inputs/nine-lower-whole-operators-witnesses-partners-and-primary-frame.exact.json',{'schemaVersion':1,'wholeMappedOperators':witnesses,'wholePrimaryFrame':primary,'nineActualLowerScopes':rows,'elevenOriginal82acContributors':len(witnesses),'removedOriginalSourceGoals':0,'removedOriginalPartnerEdges':0,'stageInferredFromTags':False})
put('candidate/exact-whole-locator-source-and-mapping-value-diffs.json',{'schemaVersion':1,'actualChanges':changes,'removedSourceGoals':0,'removedPartnerEdges':0,'allNine82acSourceAtlasTargetSetsIntendedUnchanged':True,'wholeOriginal35Duty30PartnerFrameUnchanged':True})

for state in ['SN','ST']:
 pdf=put(f'primary/{state}-whole-current.original.pdf',(OLD/f'primary/{state}-official-whole-current.original.pdf').read_bytes());doc=fitz.open(pdf)
 pages=[13,14,15,19,20,21,27,30,31] if state=='SN' else [3,4,5,6,7,8,11,12,17,18,19,33,34,39,40,42]
 for n in pages:put(f'primary/{state}-physical-{n:03d}.whole.txt',doc[n-1].get_text())
 for typ in ['mapping','extraction']:
  put(f'inputs/{state}-whole-narrow-proposed.{typ}.exact.json',(OLD/f'candidate/mappings/{state}-whole-lower-source7.without82ac-SekI-target.review.json').read_bytes() if typ=='mapping' else (OLD/f'inputs/{state}-whole-lower-source7.extraction.exact.json').read_bytes())
 for variant in ['active','source7']:
  put(f'inputs/views/{state}-{variant}.whole-narrow-proposed.exact.json',(OLD/f'candidate/views/{state}-{variant}.whole.without82ac-SekI-target.json').read_bytes())

validconfig=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-upper-science-fourteen-reviewed-integration-root-v1/positive/P12.paired-current.future-active.config.json'
pc=read(validconfig);pr=[json.loads(x) for x in (R/pc['reviewPath']).read_text().splitlines() if x.strip()];oldprofiles=[next(x for x in pr if x['goalId']==id) for id in [H,Q]]
put('inputs/whole-two-current-valid-P-profiles.exact.json',oldprofiles)
put('inputs/whole82ac-method5-appended-profile.exact.json',(OLD/'inputs/whole82ac-preserved-original-profile-plus-method-appendices.exact.json').read_bytes())
put('inputs/wholeMethod5-materials.exact.json',(OLD/'inputs/five-whole-method-material-cases.exact-retained.json').read_bytes())
put('positive/criteria.exact.md',(R/pc['reviewCriteriaPath']).read_bytes())
rid='biologie-two-source-locator-and-digital-prerequisite-author-current-v1';pc['reviewId']=rid;pc['landscapePath']=P+'/candidate/whole479-one-digital-prerequisite-removed.inactive.json';pc['semanticKindLedgerPath']=P+'/inputs/whole394-kinds.exact.json';pc['reviewCriteriaPath']=P+'/positive/criteria.exact.md';pc['reviewPath']=P+'/positive/P2-whole-current-technical-author.review.jsonl';pc['reviewRunManifestPaths']=[];pc['scope']={'label':'Whole valid original P2 material retained; one actual requires change. Technical author binding, no new science verdict.','goalIds':[H,Q]}
put('positive/P2-whole-current-technical-author.config.json',pc)
put('positive/P2-whole-original-material.candidate.json',{'schemaVersion':1,'authoringContract':'positive-understanding-evidence-candidates-v1','reviewId':rid,'reviewedAt':NOW,'reviewer':'Codex scoped technical material binder, independent review pending','goals':[{'goalId':x['goalId'],'reason':'Exact whole original independently reviewed bilingual profile retained. Primary locator and source/relations candidate only; no new independent/human approval.','evidenceLevel':'E1','maximumClaimScope':'G1','profile':x['profile']} for x in oldprofiles]})
put('author.input-FIRST.whole-primary-and-scoped-operator-rationale.json',{'schemaVersion':1,'role':'Genuine author rationale; no independent approval','actualNineWholeMappedSourceOperatorsRead':witnesses,'actualPrimaryPagesRead':[{'state':x['state'],'wholePages':x['wholePages']} for x in primary],'twoWholeOriginalGoals':[x for x in before['goals'] if x['id'] in [H,Q]],'actualRequiresFinding':{'dependentGoalId':Q,'removedPrerequisiteGoalId':H,'why':'Digital qualitative/quantitative acquisition and evaluation need not presuppose all hypothesis-led observation/comparison/experiment/model design and variable-control operators. SN5/6 specifies digital temperature/light recording; ST9 specifies data-supported digital ecological evaluation. A provided safe observation protocol with recorded units, raw data and bounded evaluation can fulfill the entire data operator without designing the whole hypothesis investigation.','boundedCounterexampleDe':'Nach vorgegebenem sicheren Ablauf werden Temperaturwerte aus einem digitalen Sensor mit Zeit/Ort/Einheit gespeichert, qualitativen Beobachtungen zugeordnet und als Tabelle/Diagramm begrenzt ausgewertet. Keine neue Hypothese, kein kausaler Beweis und keine Modellplanung werden behauptet.','boundedCounterexampleEn':'Following a provided safe protocol, temperature readings from a digital sensor are saved with time/location/unit, paired with qualitative observations and evaluated within limits using a table/chart. This claims no new hypothesis, causal proof or model design.','sourceGradeBoundary':'SN5/6 and7 digital examples are actual lower clauses; ST9 is actual lower. ST10 is explicitly Einfuehrungsphase; ST12 endE/Q table is not used as a universal SekI witness.','roleFictionCreated':False},'nineOtherRoutes':'No blanket lower-target removal. Primary methods/controls genuinely occur in SekI. Individual partial source contribution is not automatically whole goal proof. Separate detailed operator matrix remains independently reviewable.','oldValidWholeP2ProfilesExact':True,'wholeMethod5PreservedSeparately':True,'newScienceApproval':False,'humanApproval':False,'activeWrites':0,'strictGain':0})
print(json.dumps({'wholeCanonicalGoals':479,'actualGoalRelationChanges':1,'newGoals':0,'nineWholeLowerScopes':9,'actualContributors':len(witnesses),'wholeLocatorSuccessors':3,'partnerEdgesDeleted':0,'activeWrites':0,'strictGain':0}))
