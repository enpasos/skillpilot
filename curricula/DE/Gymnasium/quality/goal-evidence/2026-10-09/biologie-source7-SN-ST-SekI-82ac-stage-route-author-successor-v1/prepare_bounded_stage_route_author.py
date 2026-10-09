# SPDX-License-Identifier: Apache-2.0
"""Additive inactive data correction of exactly one erroneous lower-stage target."""
from pathlib import Path
import json,copy,hashlib,datetime,shutil
import fitz
R=Path.cwd();D=Path(__file__).resolve().parent;P=D.relative_to(R).as_posix();B=D.parent/'biologie-evolution-sixteen-current-inactive-native-comparison-technical-b-v1';S=D.parent/'biologie-evolution-eighteen-seven-source-course-remediation-author-v1'
ID='82acfbde-9ce8-5658-892e-4dcfb1c3a1f1';BASIC='26aa47b7-e5cc-5131-8980-0ec3271758b6';NOW=datetime.datetime.now(datetime.timezone.utc).isoformat()
def read(p):return json.loads(p.read_text())
def bind(p):
 b=p.read_bytes();return {'path':p.relative_to(R).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(n,x):
 p=D/n;p.parent.mkdir(parents=True,exist_ok=True);b=x if isinstance(x,bytes) else (x if isinstance(x,str) else json.dumps(x,ensure_ascii=False,indent=2)+'\n').encode()
 assert not p.exists(),p;p.write_bytes(b);return p
verdict=D.parent/'biologie-source7-five-existing-method-owners-independent-b-v1/five-existing-method-owners.independent-b.science-FIRST.verdict.json'
v=read(verdict);assert bind(verdict)['sha256']=='sha256:dabc43578823b9d90efb96efafc4fc4ec88e59386818322f32119037e5ccefc5'
finding=next(x for x in v['findingRows'] if x['findingId']=='SRC7METHODB-VIEW-001')
atlas=read(B/'candidate/source-atlas.current479-394.only16.inputs.json');book=read(B/'candidate/book.current394.only16.inactive.config.json');canon=read(R/book['landscapePath']);g=next(g for g in canon['goals'] if g['id']==ID)
assert 'SekII' in g['tags'];put('inputs/full479-only16.canonical.exact.json',(R/book['landscapePath']).read_bytes());put('inputs/full394-only16.semantic-kinds.exact.json',(R/book['semanticKindLedgerPath']).read_bytes());put('inputs/full394-only16.visualization-qa.exact.json',(R/book['goalVisualizationQaPath']).read_bytes());put('inputs/full394-only16.normal-book.config.exact.json',(B/'candidate/book.current394.only16.inactive.config.json').read_bytes());put('inputs/full394-only16.normal-source-atlas.config.exact.json',(B/'candidate/source-atlas.current479-394.only16.inputs.json').read_bytes());put('inputs/full394-only16.normal-model.exact.json',(B/'candidate/full394-only16-corrected-source.model.json').read_bytes())
put('inputs/whole35-duty30-partner-frame.exact.json',(D.parent/'biologie-evolution-three-HE-partial-edge-scope-remediation-author-v1/neutral-inputs/whole35-duty30-partner-original-frame.exact.json').read_bytes())
put('inputs/current-whole82ac-and26aa-goals.exact.json',[x for x in canon['goals'] if x['id'] in [ID,BASIC]])
changes=[];mapping_new={};views=[];primary=[]
for state in ['SN','ST']:
 mp=S/f'candidate/mappings/{state}-whole-evolution-lower-roles.whole-successor.review.json';m=read(mp);new=copy.deepcopy(m)
 put(f'inputs/{state}-whole-lower-source7.mapping.exact.json',mp.read_bytes())
 ep=R/m['sourceExtractionPath'];e=read(ep);put(f'inputs/{state}-whole-lower-source7.extraction.exact.json',ep.read_bytes())
 pdf=R/e['sourceDocument']['path'];put(f'primary/{state}-official-whole-current.original.pdf',pdf.read_bytes());doc=fitz.open(pdf)
 pages=[13,14,15,43] if state=='SN' else [4,5,6,7,8,44,45]
 for n in pages:
  f=put(f'primary/{state}-physical-{n:03d}.whole.txt',doc[n-1].get_text());primary.append({'state':state,'physicalPage':n,'wholeText':bind(f)})
 for i,d in enumerate(new['decisions']):
  if ID in d.get('canonicalGoalIds',[]):
   before=copy.deepcopy(d);d['canonicalGoalIds']=[x for x in d['canonicalGoalIds'] if x!=ID]
   assert d['canonicalGoalIds'] and BASIC in d['canonicalGoalIds'] or state=='ST' and 'sj10-evolution' in d['sourceGoalId']
   d['reviewer']='Codex scoped data author; independent stage-route review pending';d['reviewedAt']=NOW
   d['rationale']=d.get('rationale','')+' Inaktiver gezielter Autoren-Nachfolger: 82ac ist ausdrücklich ein Sek-II-Ziel und wird aus dieser Sek-I-Target-Zuordnung entfernt. Ganze ursprüngliche Quellpflicht und alle übrigen Rollen bleiben erhalten; 26aa sowie konkrete praktische Methodenoperationen bleiben eigenständig zu prüfen. Keine gesamte Quellen- oder Kursfreigabe.'
   changes.append({'state':state,'kind':'wholeDecision','index':i,'before':before,'after':copy.deepcopy(d)})
 removed=[x for x in new['mappings'] if x.get('canonicalGoalId')==ID];new['mappings']=[x for x in new['mappings'] if x.get('canonicalGoalId')!=ID]
 assert len(removed)==(1 if state=='SN' else 2)
 assert len(m['decisions'])==len(new['decisions'])
 new['status']='author_candidate';new['reviewId']=f'biologie-source7-{state.lower()}-seki-82ac-stage-route-author-successor-v1';new['note']=new.get('note','')+' Additiver inaktiver 82ac-Sek-I-Scope-Nachfolger. Historische Originalkanten unverändert im exakten Ausgangsinput und35/30-Rahmen; nur unpassende aktuelle82ac-Sek-I-Witnesses entfernt. Sek-II-Zuordnungen unverändert. Unabhängige Prüfung offen.'
 f=put(f'candidate/mappings/{state}-whole-lower-source7.without82ac-SekI-target.review.json',new);mapping_new[mp.relative_to(R).as_posix()]=f.relative_to(R).as_posix()
 changes.append({'state':state,'kind':'invalidLowerStageContributorEdgesRemoved','wholeOldEdgeCount':len(m['mappings']),'wholeNewEdgeCount':len(new['mappings']),'removedWholeEdges':removed,'wholeSourceGoalCount':len(e['sourceGoals']),'wholeSourceGoalsDeleted':0})
 for variant,src in [('active',R/f'curricula/DE/Gymnasium/composition-views/biologie/de-{state.lower()}-gym-seki-biology.view.json'),('source7',S/f'candidate/composition-views/de-{state.lower()}-gym-seki-biology.view.json')]:
  raw=read(src);put(f'inputs/views/{state}-{variant}.whole.exact.json',src.read_bytes());newv=copy.deepcopy(raw);removednodes=[]
  def walk(nodes,pointer):
   out=[]
   for i,n in enumerate(nodes):
    ptr=pointer+'/'+str(i)
    if n.get('kind')=='goalEntry' and n.get('goalId')==ID:removednodes.append({'jsonPointer':ptr,'wholeNode':copy.deepcopy(n)});continue
    if 'children' in n:n['children']=walk(n['children'],ptr+'/children')
    out.append(n)
   return out
  newv['rootNodes']=walk(newv['rootNodes'],'/rootNodes');assert len(removednodes)==1
  f=put(f'candidate/views/{state}-{variant}.whole.without82ac-SekI-target.json',newv);views.append({'state':state,'variant':variant,'before':bind(src),'candidate':bind(f),'removedWholeNodes':removednodes,'allOtherNodeObjectsExactRetained':True,'newPrerequisiteOnlyRoleInvented':False})
newatlas=copy.deepcopy(atlas);newatlas['mappingPaths']=[mapping_new.get(x,x) for x in atlas['mappingPaths']];put('candidate/full394-source-atlas.without82ac-SN-ST-SekI-target.inputs.json',newatlas)
put('candidate/full394-book.without82ac-SN-ST-SekI-target.config.json',book)
put('candidate/exact-SN-ST-mapping-and-four-learner-view.scope-diffs.json',{'schemaVersion':1,'wholeMappingChanges':changes,'wholeLearnerViewChanges':views,'removedCanonicalGoals':0,'removedOriginalSourceDuties':0,'whole35Duty30PartnerOriginalFramePreserved':True,'allOtherMappingsAndSekIIViewsIntendedExact':True,'authorProposalOnly':True})
dependents=[x for x in canon['goals'] if ID in x.get('requires',[])]
put('author.input-FIRST.actual-source-reading-and-route-finding.json',{'schemaVersion':1,'createdAt':NOW,'role':'Author input FIRST and bounded source-role rationale; no independent scientific approval','BActualFinding':finding,'BActualVerdict':bind(verdict),'actualWholePrimaryPagesRead':primary,'whole82acGoal':g,'directRequiresDependentWholeGoals':dependents,'routeDecision':'Remove erroneous direct82ac Sek-I-target goalEntry and matching82ac source witnesses. No independent lower-stage requirement for the whole Sek-II-variable-control competence is established; practical simple operator26aa remains. No prerequisiteOnly fiction is introduced to preserve the stage error. Existing broad higher-stage PB targets/dependencies outside82ac remain explicit open limits.','wholeSourceDutiesPreserved':True,'scope':'Exactly82ac SN/ST Sek-I contributions; all Sek-II witnesses and whole479/394 universe unchanged','currentStrict299Unchanged':True,'source7WholeCourseClosureClaimed':False,'independentApproval':False,'humanApproval':False,'strictGain':0,'activeWrites':0})
print(json.dumps({'preparedWholeSourceMappings':2,'invalidContributorEdgesRemoved':3,'wholeLearnerCandidates':4,'sourceDutiesRemoved':0,'goalBodiesChanged':0,'strictGain':0}))
