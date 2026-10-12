# SPDX-License-Identifier: Apache-2.0
# Emitted own goal/task/rubric content is CC-BY-4.0; cited sources retain their rights.
import json,pathlib,copy,hashlib,unicodedata,re,shutil,subprocess
R=pathlib.Path.cwd();BP='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q2-naturstoffe-current402-author-20261012-v2';B=R/BP;V=R/BP.replace('-v2','-v1')
def read(p):return json.loads(p.read_text())
def write(p,v):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def jl(p):return [json.loads(x) for x in p.read_text().splitlines() if x.strip()]
def wjl(p,v):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(''.join(json.dumps(x,ensure_ascii=False,separators=(',',':'))+'\n' for x in v))
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
live=R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';land=read(live);baseline=copy.deepcopy(land);g={x['id']:x for x in land['goals']}
scope=read(V/'scope31.current402.author.actual.json');ids=scope['goalIds'];prefix={x[:8]:x for x in g}
def G(p):return g[prefix[p]]
# Keep the existing v1 science and its eight accepted author PNGs as exact input material.
v1land=read(V/'candidate/canonical523.two-text-eight-PNG-author.inactive.json');v1g={x['id']:x for x in v1land['goals']}
for p in ['7b477c2b','978a6f25']:
 for k in ['description','descriptionEn']:G(p)[k]=v1g[prefix[p]][k]
for id in scope['deferredVisualizationGoalIds']:g[id]['resourceLinks']=copy.deepcopy(v1g[id]['resourceLinks'])
delta=[]
def textdelta(p,**fields):
 x=G(p); before={k:x.get(k) for k in fields};x.update(fields);delta.append({'goalId':x['id'],'before':before,'after':fields})
textdelta('64a5bb87',description='Die lernende Person kann tierische und pflanzliche Proteinquellen recherchieren und anhand von Zusammensetzung, Funktion und Nachhaltigkeitskriterien vergleichen und bewerten.',descriptionEn='The learner can research animal and plant protein sources and compare and evaluate them using composition, function and sustainability criteria.')
textdelta('978a6f25',title='Chromatografie anwenden und auswerten',titleEn='Apply and evaluate chromatography')
textdelta('d1244f5d',description='Die lernende Person kann Versuchsergebnisse der Elektrophorese von Aminosäuren und Proteinen auswerten und deren Wanderung anhand von Nettoladung und pH-Wert erklären; in Lehrplanrouten mit Planungsauftrag kann sie eine entsprechende Trennung planen.',descriptionEn='The learner can evaluate amino-acid and protein electrophoresis results and explain migration through net charge and pH; in curriculum routes requiring planning, the learner can plan a corresponding separation.')
# MM remains the same counted competency. An explicit own enrichment proposal replaces a false claim of literal curriculum coverage.
mm=G('c245d5fd');mm.setdefault('extendedData',{})['authoringSourceProposal']={'kind':'ownEnrichment','license':'CC-BY-4.0','description':'Eigenständige quantitative Vertiefung des Enzymmodells. Keine geprüfte Lehrplanklausel nennt hier ausdrücklich das Michaelis-Menten-Modell. Unabhängige Quell-/Scopeentscheidung offen.','preserveExistingAtomicCount':True}
splits=read(V/'atomicity/four-bounded-concrete-split-options.author-inactive.json')['proposals'];children={}; parent_children={}
for s in splits:
 p=g[s['parentGoalId']];cs=[]
 for c in s['proposedChildren']:
  n=copy.deepcopy(p);n['id']=c['proposedId'];n.pop('resourceLinks',None);n.pop('shortKey',None);n.update({k:c[k] for k in ['title','titleEn','description','descriptionEn']});n.update(type='atomic',contains=[],requires=[],weight=1)
  n.setdefault('dimensionTags',{}).update(area='Naturstoffe',topicCode='Q2.1.SPLIT.'+n['id'][:8]);n.setdefault('extendedData',{})['splitOriginGoalId']=p['id'];land['goals'].append(n);g[n['id']]=n;prefix[n['id'][:8]]=n['id'];children[n['id']]=n;cs.append(n['id'])
 p.update(type='cluster',contains=cs,requires=[],weight=len(cs));parent_children[p['id']]=cs
# Preserve all existing aspects; execution is explicit on the assay competencies.
textdelta('1d2e7b80',title='Reduzierende Kohlenhydrate nachweisen und erklären',titleEn='Detect and explain reducing carbohydrates',description='Die lernende Person kann kontrollierte Fehling- beziehungsweise in der Lehrplanroute verlangte Benedict-Nachweise durchführen, auswerten und positive sowie negative Kohlenhydratbefunde durch zugängliche Carbonylformen und die Verknüpfung anomerer Zentren erklären.',descriptionEn='The learner can carry out and evaluate controlled Fehling assays, or Benedict assays required by the curriculum route, and explain positive and negative carbohydrate results through accessible carbonyl forms and anomeric-centre linkages.')
textdelta('cf270aaf',title='Proteine mit der Biuret-Reaktion nachweisen und erklären',titleEn='Detect and explain proteins using the biuret assay',description='Die lernende Person kann kontrollierte Biuret-Nachweise durchführen, positive und negative Befunde auswerten und die violette Färbung als Koordination von Kupfer(II)-Ionen durch geeignete Peptidgruppen erklären.',descriptionEn='The learner can carry out controlled biuret assays, evaluate positive and negative results and explain the violet colour through copper(II) coordination by suitable peptide groups.')
textdelta('ee359c2e',description='Die lernende Person kann einen kontrollierten Ammonium-Nachweis über Ammoniakfreisetzung durchführen und mit der Säure-Base-Reaktion erklären sowie Befunde im Kontext von Proteinabbau begrenzt deuten.',descriptionEn='The learner can carry out a controlled ammonium assay through ammonia release, explain its acid-base reaction and interpret results within bounded protein-degradation contexts.')
reqs={'e9d34f34':['ca216bc6','a9c22adc'],'d8eeed29':['85342a45','a9c22adc'],'684ffe86':['a9c22adc'],'dfaef897':['684ffe86'],'1d2e7b80':['973c12d9','684ffe86'],'cf270aaf':['197bc2c5','065d764c'],'ee359c2e':['e9d34f34'],'2f3cdec5':['70b34ae7','a9c22adc'],'7371c82e':['2f3cdec5']}
# Resolve the established general stereochemistry prerequisite by actual title if its UUID prefix differs.
stereo=next(x['id'] for x in land['goals'] if x['id'] in G('f4d5a02d')['requires'] and x['id'] not in parent_children)
reqs['d8eeed29']=[stereo,'a9c22adc']
for p,rs in reqs.items():G(p)['requires']=[prefix.get(x,x) for x in rs]
specific={('62149f36','f4d5a02d'):['d8eeed29'],('8761cfd2','f4d5a02d'):['dfaef897'],('8761cfd2','a76ab487'):['684ffe86'],('8761cfd2','7b477c2b'):['684ffe86','dfaef897'],('8761cfd2','96d33fb6'):['1d2e7b80'],('bebea164','e64a79df'):['2f3cdec5','7371c82e']}
aggregate={'14577339','e6cb2efa','8872d828','31148286'};edge=[]
for x in land['goals']:
 if x['id'] in parent_children or x['id'] in children:continue
 before=list(x.get('requires',[]));out=[]
 for r in before:
  if r not in parent_children:out.append(r);continue
  ps=r[:8];xp=x['id'][:8]
  use=parent_children[r] if xp in aggregate else [prefix[y] for y in specific.get((ps,xp),[parent_children[r][0][:8]])]
  out.extend(use)
 x['requires']=list(dict.fromkeys(out))
 if before!=out:edge.append({'goalId':x['id'],'before':before,'after':x['requires'],'reason':'Preserve aggregate duties on capstone/practice/memory; select the necessary separated competence for ordinary successors.'})
write(B/'author/precise-four-split-proposal-and-requires-deltas.json',{'parents':parent_children,'childGoals':list(children.values()),'incomingRequiresDeltas':edge,'denominatorBefore':402,'denominatorCandidate':407,'activeWrites':False,'strictClosures':0})
write(B/'author/targeted-text-deltas.json',delta)
write(B/'candidate/canonical532.split9-targeted-text.inactive.json',land)
write(B/'checks/live-input-at-author-build.json',{'path':str(live.relative_to(R)),'sha256':sha(live),'goals':len(baseline['goals'])})
# Broad source mappings remain intact. Child bindings expose complete literal parent contributions, with operator obligations assessed separately.
sources=read(V/'sources/current31-source-contributions-and-bounded-official-operators.author.json')
write(B/'sources/parent31.exact-source-contributions.json',sources)
write(B/'sources/split9.source-binding-proposals.json',{'schemaVersion':1,'parentToChildren':parent_children,'parentContributionFile':str((B/'sources/parent31.exact-source-contributions.json').relative_to(R)),'sourcePreservation':'All existing parent sources and source mappings remain on the retained aggregate. Each child inherits the parent context; literal content and operator duties must be reviewed against its explicit child task/profile. A source union alone does not approve an operator.','childGoals':[{k:c[k] for k in ['id','title','description','descriptionEn']} for c in children.values()]})
# Prepare only actual affected source-navigation references. All untouched scopes remain exact live inputs.
mcfg=read(V/'baseline/memory-config.exact.json');views=[]
for ix,v in enumerate(mcfg['visibilityScopes']):
 p=R/v['viewPath'];data=read(p);changes=[]
 def walk(z):
  if isinstance(z,dict):
   if z.get('kind')=='goalEntry' and z.get('goalId') in parent_children:z['kind']='canonicalSubtree';changes.append(z['goalId'])
   for a in z.values():walk(a)
  elif isinstance(z,list):
   for a in z:walk(a)
 walk(data)
 if changes:
  dest=B/'candidate/views'/p.name;write(dest,data);views.append({'original':str(p.relative_to(R)),'candidate':str(dest.relative_to(R)),'changedParentReferences':changes});v['viewPath']=str(dest.relative_to(R))
write(B/'author/visibility-reference-deltas.json',views)
# Memory retains all card wording and IDs. Only two actual origins move to the acid-base child.
deckpath=R/'app/public/data/de_gymnasium_chemistry_flashcards_natural_q2.de.json';deck=read(deckpath)
for c in deck['cards']:
 c['tags']=[t.replace('goal:'+prefix['62149f36'],'goal:'+prefix['e9d34f34']) for t in c['tags']]
dp=B/'memory/de_gymnasium_chemistry_flashcards_natural_q2.de.json';write(dp,deck)
mg=G('31148286');
def replacepaths(z):
 if isinstance(z,dict):
  for k,v in z.items():
   if isinstance(v,str) and 'de_gymnasium_chemistry_flashcards_natural_q2.de.json' in v:z[k]=str(dp.relative_to(R))
   else:replacepaths(v)
 elif isinstance(z,list):
  for v in z:replacepaths(v)
replacepaths(mg);write(B/'candidate/canonical532.split9-targeted-text.inactive.json',land)
write(B/'memory/config.author.inactive.json',{**mcfg,'landscapePath':str((B/'candidate/canonical532.split9-targeted-text.inactive.json').relative_to(R)),'reviewPath':str((B/'memory/current407.author.necessity.jsonl').relative_to(R)),'cardReviewPath':str((B/'memory/current75.author.cards.jsonl').relative_to(R)),'reportPath':str((B/'checks/memory407.normal.author.actual.md').relative_to(R))})
print(json.dumps({'wholeCandidateGoals':len(land['goals']),'newChildren':len(children),'incomingRequiresDeltas':len(edge),'textDeltas':len(delta),'visibilityViewsAffected':len(views)}))
