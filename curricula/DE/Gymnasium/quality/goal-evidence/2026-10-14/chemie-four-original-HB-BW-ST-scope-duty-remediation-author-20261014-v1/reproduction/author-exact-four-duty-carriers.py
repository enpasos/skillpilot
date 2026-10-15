from pathlib import Path
import json,copy,hashlib,datetime

R=Path('/home/enpasos/projects/skillpilot')
REL=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-four-original-HB-BW-ST-scope-duty-remediation-author-20261014-v1')
O=R/REL
def load(p): return json.loads((O/p).read_text())
def save(p,j):
 p=O/p;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n')
def sha(p): return hashlib.sha256((O/p).read_bytes()).hexdigest()
before=load('before/canonical539.current412.exact.json')
after=load('candidate/canonical540.current413.one-new-research-operator.author.json')
new=load('candidate/one-new-whole-atomic-goal.author.json')
G={g['id'][:8]:g['id'] for g in after['goals']}
parent=next(g for g in after['goals'] if g['id'].startswith('4a98bbee'))
parent['weight']=11
save('candidate/canonical540.current413.one-new-research-operator.author.json',after)
baseline=load('checks/BASELINE.exact-input-bindings-and-one-goal-author-only.json')
baseline['parentContainsAfter']=parent
baseline['parentWeightPreserved']=False
baseline['parentWeightDelta']={'before':10,'after':11,'reason':'derived count of eleven unique atomic children after appending the single author-only research atom; raw root weight and all other existing bodies unchanged'}
save('checks/BASELINE.exact-input-bindings-and-one-goal-author-only.json',baseline)

cases=load('cases/five-source-duty-units-ten-complete-DEEN-cases.author.json')
for unit in cases['units']:
 for c in unit['cases']:
  for k in ['materialDe','materialEn','taskDemandDe','taskDemandEn','modelAnswerDe','modelAnswerEn']:
   c[k]=c[k].replace('bezeichnet,; Reinheit98%','bezeichnet; Reinheit 98%').replace('remainder,, purity98%','remainder; purity 98%')
save('cases/five-source-duty-units-ten-complete-DEEN-cases.author.json',cases)

HB=load('before/HB-source.json')
old_hb=copy.deepcopy(HB)
specs=[
 {'key':'nano-plastic-change','topic':'3.3-4-1-KUNSTSTOFFE','page':34,'bullet':5,'title':'Kunststoffeigenschaften durch Nanotechnologie beschreiben','description':'Die lernende Person kann die Veränderung der Eigenschaften von Kunststoffen durch den Einsatz von Nanotechnologie beschreiben, einschließlich Nanostrukturierung und nanopartikelverstärkter Kunststoffe.','text':'beschreiben die Veränderung der Eigenschaften von Kunststoffen durch den Einsatz von Nanotechnologie (Nanostrukturierung, Nanopartikelverstärkte Kunststoffe).','scope':'LK-designated fachinhaltlicher Bullet within compulsory topic4.1; topic is mandatory in all courses on physical37 but the nano bullet itself is expressly LK-only','targets':['dfbccd62','2652caef','5e2eb826'],'dutyUnit':'HB-LK-nanotechnology-plastic-property-change'},
 {'key':'active-ingredient-definition-isolation','topic':'3.3-4-3-AROMATEN','page':36,'bullet':4,'title':'Wirkstoffbegriff und Isolierung aus Naturstoffen erläutern','description':'Die lernende Person kann den Begriff Wirkstoff erklären und die Isolierung von Wirkstoffen aus Naturstoffen erläutern.','text':'erklären den Begriff Wirkstoff und erläutern die Isolierung von Wirkstoffen aus Naturstoffen.','scope':'general fachinhaltlicher Bullet within topic4.3; topic4.3 is compulsory in LK according to physical37, not a newly asserted GK default','targets':['42a84bca','5a709938'],'dutyUnit':'HB-LK-active-ingredient-concept-and-natural-product-isolation'},
 {'key':'active-ingredient-research-interplay','topic':'3.3-4-3-AROMATEN','page':36,'bullet':5,'title':'Analyse, Synthese und Molecular Modelling in der Wirkstoffforschung verknüpfen','description':'Die lernende Person kann die Natur- und Wirkstoffsynthese als ein Zusammenspiel von Analyse, Synthese und Molecular Modelling beschreiben.','text':'beschreiben die Natur- und Wirkstoffsynthese als ein Zusammenspiel von Analyse, Synthese und Molecular Modelling.','scope':'general fachinhaltlicher Bullet within topic4.3; topic4.3 is compulsory in LK according to physical37, not a newly asserted GK default','targets':[new['id'][:8]],'dutyUnit':'HB-LK-analysis-synthesis-modelling-interplay'},
]
for s in specs:
 digest=hashlib.sha256(s['text'].encode()).hexdigest()[:8]
 sid=f"hb-chemistry-sekii-gyo2022-primary-{s['key']}-{digest}"
 pid=f"hb-chemistry-sekii:{s['topic']}-primary-{s['key']}"
 span=f"{s['topic']}; fachinhaltlicher Bullet{s['bullet']}; physical/printed{s['page']}; course authority physical/printed37"
 s['sourceGoalId']=sid
 g={'id':sid,'passageId':pid,'topicCode':s['topic'],'bulletIndex':s['bullet'],'aspectIndex':1,'title':s['title'],'description':s['description'],'sourceText':s['text'],'sourceSpan':span,'sourceDocumentKey':'HB-GYO-CHEMIE-2022','parentBulletText':s['text'],'sourceRef':f"Bremen Bildungsplan Chemie Gymnasiale Oberstufe2022, Thema{s['topic']}, S.{s['page']}; verbindliche Themenfolge S.37",'courseLevel':'LK','granularity':'officialCompetencyBullet','tags':['source:bremen','stage:SekII','phase:Q',f"topic:{s['topic']}",'course:LK'],'rawSourceText':s['text'],'rawSourceSpan':span,'rawParentBulletText':s['text'],'sourcePage':s['page'],'sourceScopeCondition':s['scope'],'metadata':{'fourDutyAuthorDerivation':{'status':'unreviewed_author_candidate','sourceTextRole':'dehyphenated exact original primary competency clause; whole actual page and course rule supplied','titleDescriptionRole':'derived teaching descriptor, not verbatim original text','wholeSourceUnionApproved':False}}}
 HB['sourceGoals'].append(g)
 HB['passages'].append({'id':pid,'topicCode':s['topic'],'title':s['title'],'page':s['page'],'physicalPage':s['page'],'printedPage':s['page'],'text':s['text'],'rawText':s['text'],'sourcePath':'curricula/DE/Gymnasium/input/HB/GyO_Chemie_2022.pdf','sourceDocumentKey':'HB-GYO-CHEMIE-2022','sourceGoalIds':[sid],'courseLevel':'LK','sourceColumn':s['scope']})
HB['qualityReview']['sourceGoalCountPeerBaseline']={'accepted':False,'details':'Author candidate extends the actual89 existing source goals by exactly3 previously unextracted compulsory LK clauses to92. Historical88-goal acceptance is preserved in before/HB-source.json; no current peer approval or whole-source closure asserted.'}
for step in HB['pipelineStatus']['steps']:
 if step['id']=='MAPPING-2':
  step['status']='in_progress'
  for c in step['checks']:
   if c['id']=='source-goals-created':c['details']='92 Source-Ziele:89existing exact cells +3new original-clause author cells; new cells await independent source check.'
   elif c['id']=='source-goal-count-peer-baseline':c['passed']=False;c['details']='New92-goal extraction has no renewed independent baseline approval; prior88-goal historical assertion is not carried as present approval.'
 if step['id']=='MAPPING-3':
  step['checks'].append({'id':'four-original-duty-author-source-clauses-await-independent-review','label':'Drei neue amtliche LK-Quelloperatoren und ihre eng begrenzten PARTIAL-Zuordnungen sind unabhängig zu prüfen','passed':False,'details':'; '.join(s['sourceGoalId']for s in specs)})
save('candidate/HB-source.author.json',HB)

ST=load('before/ST-source.json')
sid161=next(g['id']for g in ST['sourceGoals']if '-161-'in g['id']);sid174=next(g['id']for g in ST['sourceGoals']if '-174-'in g['id']);sid188=next(g['id']for g in ST['sourceGoals']if '-188-'in g['id'])
g188=next(g for g in ST['sourceGoals']if g['id']==sid188)
for f in ['sourceSpan','rawSourceSpan','sourceRef']:g188[f]=g188[f].replace('PDF-S. 30','PDF-S. 31')
newpid=g188['passageId']+'-primary-nanotubes-p31-author'
oldpid=g188['passageId'];g188['passageId']=newpid
ST['passages'].append({'id':newpid,'topicCode':g188['topicCode'],'title':'Schuljahrgang9, Kohlenstoff-Kontext: Nanotubes und moderne Werkstoffe; Fortsetzung auf physischer/gedruckter31','text':g188['rawSourceText'],'rawText':g188['rawSourceText'],'page':31,'sourcePath':'curricula/DE/Gymnasium/input/ST/FLP_Chemie_Gym_01082022_swd.pdf','sourceGoalIds':[sid188]})
oldp=next(q for q in ST['passages']if q['id']==oldpid)
oldp['sourceGoalIds']=[x for x in oldp['sourceGoalIds']if x!=sid188]
# Original multi-page passage text remains unchanged; its sourceGoal membership is corrected narrowly.
ST['pipelineStatus']['currentStep']='MAPPING-3'
for s in ST['pipelineStatus']['steps']:
 if s['id']=='MAPPING-3':
  s['status']='in_progress'
  for c in s['checks']:
   if c['id']in ['m3-all-source-goals-reviewed','m3-all-source-goals-covered-by-canonical']:
    c['passed']=False;c['details']='Three carbon/allotrope/nanotube source cells have new bounded author PARTIAL proposals; no renewed independent whole-source decision. Historical270/270 claim remains in before/ST-source.json.'
save('candidate/ST-source.author.json',ST)
# BW126 extraction already contains the complete original selected-material operator; byte-exact KEEP.
(O/'candidate/BW-source.unchanged.json').write_bytes((O/'before/BW-source.json').read_bytes())

proposal_rows=[]
def mapping_candidate(code,src,changes):
 m=load(f'before/{code}-mapping.json');old=copy.deepcopy(m)
 for sid,targets,rationale in changes:
  m['mappings']=[r for r in m['mappings']if r['legacyGoalId']!=sid]
  m['mappings'] += [{'legacyGoalId':sid,'canonicalGoalId':t,'matchType':'partial','reviewDecisionId':sid}for t in targets]
  m['decisions']=[d for d in m['decisions']if d['sourceGoalId']!=sid]
  s=next(s for s in src['sourceGoals']if s['id']==sid)
  # The changed row is deliberately NOT mapped/reviewed. Normal consumers must not count it as approval.
  decision={'sourceGoalId':sid,'topicCode':s['topicCode'],'sourceSpan':s['sourceSpan'],'decision':'pending_independent_review','canonicalGoalIds':targets,'matchType':'partial','rationale':rationale,'reviewedAt':'','reviewer':'','author':'Codex author successor; former independent C reviewer, not independent for this candidate','authorCreatedAt':'2026-10-14','authorOnly':True,'wholeSourceUnionApproved':False}
  m['decisions'].append(decision)
  proposal_rows.append({'jurisdiction':f'DE-{code}','sourceGoalId':sid,'oldEdges':[r for r in old['mappings']if r['legacyGoalId']==sid],'oldDecision':[d for d in old['decisions']if d['sourceGoalId']==sid],'newDecision':decision,'caseUnionRequired':True})
 m['sourceExtractionPath']=str(REL/f'candidate/{code}-source.author.json')if code!='BW'else str(REL/'candidate/BW-source.unchanged.json')
 m['status']={'state':'author_candidate_pending_independent_review','sourceGoalCount':len(src['sourceGoals']),'changedSourceGoalIds':[x[0]for x in changes],'changedDecisionsApproved':0,'existingUnchangedHistoricalDecisionsRetained':True,'notAnIntegrationGrant':True}
 save(f'candidate/{code}-mapping.author-pending.json',m)

mapping_candidate('HB',HB,[(s['sourceGoalId'],[G[t]for t in s['targets']],{
 'nano-plastic-change':'Author PARTIAL union: dfbc explains nanodimension/interface/topography and bounded use/risk;5e2 gives surface-to-volume scaling;2652 contributes only the polymer structure/property/usage setting, NOT proof that filler/topography creates new monomer/linkage chemistry. Complete HB-N1/N2 cases require BOTH nanoparticle reinforcement and surface nanostructuring in a specified plastic. LK-only.',
 'active-ingredient-definition-isolation':'Author PARTIAL union:42a84 contributes pure-substance/mixture identity;5a709 contributes separation and justified method choice. HB-I1/I2 additionally supply and assess active-ingredient definition and unchanged-molecule isolation. These theoretical cases do not prove actual execution of the stronger existing separation whole goal. Independent reviewers must check the source concept is really carried, not infer it from a cluster.',
 'active-ingredient-research-interplay':'Author PARTIAL mapping to exactly one new narrow current candidate atom because separate analysis/synthesis/model goals do not require their research feedback. HB-W1/W2 are complete supplied cases; no actual synthesis/software execution, clinical efficacy or independent D/P/A/M/V votes. Originaltopic4.3 mandatory onlyLK by page37.'
 }[s['key']])for s in specs])

mapping_candidate('ST',ST,[
 (sid161,[G['02dc29ae']],'Author replacement of the unrelated exact lab-method cluster: actual source describes carbon allotrope structures from supplied models/figures;02dc is only a partial current structure/order/property partner. ST-T1/T2 explicitly instantiate actual carbon, diamond, graphite and nanotubes; no generic cluster-only certification.'),
 (sid174,[G['02dc29ae']],'Author replacement of overbroad model/data/hypothesis performance targets: actual source explains carbon-allotrope properties with suitable models.02dc is partial; concrete ST-T1/T2 distinguish arrangement/bonds/carriers and inference limits without claiming experiments, hypothesis-testing or generic full model construction.'),
 (sid188,[G['5e2eb826'],G['dfbccd62'],G['02dc29ae']],'Author existing dimension/nanosurface partials plus explicit carbon structure/property partial. ST-T2 retains the actual rolled carbon-sheet/tube and modern-work-material context; no mandatory silver packaging, no all-tube-conductivity rule. dfbc remains only an optional LK target contribution in the reviewed view; existing5e2+02dc and supplied case carry the common SekI tube context. Correct originalpage31, not30.')])

BW=load('before/BW-source.json');bwid='bw-chem-sekii-3-4-8-b04-a01-51bba460'
mapping_candidate('BW',BW,[(bwid,[G['fa21e8e1']]+[G[t]for t in ['188bd684','61da9d34','f0ba30a8','b208b1a5','e5941581']],'Author selected-dye route for ONE further material group in Leistungsfach; the alternative original examples do not become simultaneous obligations. Historical industry, current synthesis/absorption/fibre-use, future research hypotheses/validation and bounded impact questions are linked by complete BW-B1/B2 cases. Each existing atomic contributes only part; the retained cluster is navigation only. No claim every whole existing dye operator or a generic history/future research operator is fully source-equivalent; independent review must judge the concrete union. No GK widening.')])
save('candidate/seven-exact-source-decision-proposals.author.json',{'authorOnly':True,'pendingIndependentReview':True,'newStrictClosures':0,'rows':proposal_rows})

def walk(nodes):
 for n in nodes:
  yield n
  yield from walk(n.get('children',[]))
views={name:load(f'before/{name}.view.json')for name in ['de-hb-lk','de-bw-lk','de-st-gk','de-st-lk']}
hb=views['de-hb-lk'];poly=next(n for n in walk(hb['rootNodes'])if n.get('id')=='chemistry-de-hb-lk-upper-3-3-4-1-kunststoffe');drug=next(n for n in walk(hb['rootNodes'])if n.get('id')=='chemistry-de-hb-lk-upper-3-3-4-3-aromaten')
poly['children'] += [{'kind':'goalEntry','goalId':G[x],'projectionRole':'target'}for x in ['5e2eb826','dfbccd62']]
drug['children'].append({'kind':'goalEntry','goalId':new['id'],'projectionRole':'target'})
bw=views['de-bw-lk'];dyes=next(n for n in walk(bw['rootNodes'])if n.get('id')=='chemistry-de-bw-lk-farbstoffchemie');dyes['label']='Farbstoffchemie – gewählte Forschungsroute (Leistungsfach)'
for name,v in views.items():
 if name.startswith('de-st'):(O/f'candidate/{name}.view.author.json').write_bytes((O/f'before/{name}.view.json').read_bytes())
 else:save(f'candidate/{name}.view.author.json',v)
 pub=copy.deepcopy(v);pub={'$schema':'https://skillpilot.com/schemas/curriculum-package/v1/composition-view.schema.json','viewFormatVersion':'1.0','language':'de',**pub}
 save(f'candidate/schema-only/{name}.publication-shape.author.json',pub)
save('candidate/exact-course-and-selected-family-author-conditions.json',{'authorOnly':True,'noGateVote':True,'HB':{'nano':'topic4.1 mandatory in all courses, nano bullet expressly LK; additions onlyde-hb-lk','drug':'topic4.3 mandatoryLK by37; noHB-GK claim','targetsAddedToHB-LK':[G[x]for x in ['5e2eb826','dfbccd62']]+[new['id']],'existingWholeGoalsNotRewritten':True},'BW':{'originalOperator':next(g['sourceText']for g in BW['sourceGoals']if g['id']==bwid),'course':'Leistungsfach','selectedOneFurtherFamily':'Farbstoffe','notSimultaneousDuties':['Waschmittel','Pharmazeutika','Komplexverbindungen','Silikone'],'labelBinding':{'viewId':bw['viewId'],'nodeId':dyes['id'],'label':dyes['label']},'noTargetAdded':True,'concreteRequiredCases':['BW-B1','BW-B2'],'requiredFutureAspect':'Explain research question, predicted benefit, conflicting measurements and further validation; not just a cluster link or prediction equals finding'},'ST':{'originalContext':'Schuljahrgang9 carbon allotropes/models + nanotube knowledge on31','existingCommonTargets':[G['02dc29ae'],G['5e2eb826']],'dfbcRole':'existing LK target only; not introduced into GK','noTargetAdded':True},'integrationBoundary':'Root must independently review source duty unions and full new atom before author candidates can affect active source claims, projected target universe, strict denominator or H. Source6,Rest6,M311 remain separate.'})
print(json.dumps({'packet':str(REL),'newSourceCells':3,'HBGoalsAfter':len(HB['sourceGoals']),'newCanonicalGoal':new['id'],'canonicalGoalsAfter':len(after['goals']),'changedSourceDecisionRows':len(proposal_rows),'caseUnits':len(cases['units']),'cases':sum(len(u['cases'])for u in cases['units']),'strictClosures':0}))
