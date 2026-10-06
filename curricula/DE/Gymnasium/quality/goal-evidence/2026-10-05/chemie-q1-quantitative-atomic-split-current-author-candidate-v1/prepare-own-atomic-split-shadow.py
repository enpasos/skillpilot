#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Scoped author split; isolated current inputs, no active writes or approvals."""
from pathlib import Path
import copy,datetime,hashlib,json,shutil,subprocess
R=Path('/home/enpasos/projects/skillpilot');O=Path(__file__).resolve().parent;REL=O.relative_to(R);I=R/'tmp/chemie-q1-quantitative-atomic-split-native-isolated-20261005-v1'
OLD=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-six-source-operator-remediation-current-candidate-v1';T=OLD/'prospective-input-tree'
CAN='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';SEM='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json';QA='curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json';ATLAS='app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json'
BASE='0fd3c538b5b554606ea8b073fa8c4cd3e27c376599cc416f0e8d2452b70be3be';AG='d3cd250f-5221-589d-aa1c-44a4692d1acb';NEW='0d59b62e-d3f9-5969-b961-0c5e26316c04';PAR='47a40c98-ab20-5246-85e3-3abe5a9e95ed';COMP='70b34ae7-4481-590c-9a02-516464750832';TERM='14577339-9e0c-5b44-8e47-91e1a4947367'
ids=json.loads((O/'new-stable-child-ids.author-candidate.json').read_text())['ids'];ASC=ids['ascorbic-acid-controlled-quantification'];EST=ids['specified-paraben-ester-controlled-quantification']
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def read(p):return json.loads(Path(p).read_text())
def dump(p,v):p=Path(p);p.parent.mkdir(parents=True,exist_ok=True);assert not p.is_symlink();p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
assert sha(R/CAN)==BASE
f=OLD/'author-native-candidate.final.freeze.json';assert sha(f)=='70899d0c1f5512fbf5cdd9b5a2cba7f081ff6efca30c17f680036063c07b051b'
for row in read(f)['files']:
 p=R/row['path'];assert sha(p)==row['sha256'].removeprefix('sha256:');assert p.stat().st_size==row['bytes']
base=read(R/CAN);future=copy.deepcopy(base);G={g['id']:g for g in future['goals']};prior={g['id']:g for g in read(T/CAN)['goals']};changes=read(OLD/'six-explicit-scientific-field-deltas.candidate.json')['rows'];safe=[x['goalId'] for x in changes if x['goalId']!=AG]+[NEW]
# Adopt only frozen explicit changed fields, not a historical landscape snapshot.
deltas=[]
for row in changes:
 gid=row['goalId'];assert G[gid]==row['before']
 for key in set(G[gid])|set(prior[gid]):
  if G[gid].get(key)!=prior[gid].get(key):
   deltas.append({'goalId':gid,'field':key,'before':copy.deepcopy(G[gid].get(key)),'after':copy.deepcopy(prior[gid].get(key))});G[gid][key]=copy.deepcopy(prior[gid][key])
assert NEW not in G;G[NEW]=copy.deepcopy(prior[NEW]);future['goals'].append(G[NEW]);G[PAR]['contains']=copy.deepcopy(prior[PAR]['contains']);G[PAR]['weight']=7
assert G[COMP]==prior[COMP]
oldactive=copy.deepcopy(next(x for x in base['goals'] if x['id']==AG));oldcompound=copy.deepcopy(prior[AG]);proposal=read(R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-d3cd-quantitative-analytes-atomicity-adjudication-v1/traceable-two-child-split.scientific-proposal.json')
for spec,gid in zip(proposal['children'],[ASC,EST]):
 assert gid not in G
 child=copy.deepcopy(oldcompound)
 for key in ['title','titleEn','description','descriptionEn']:child[key]=spec[key]
 child.update(id=gid,type='atomic',contains=[],requires=spec['proposedRequires'],weight=1,examples=[],resourceLinks=[])
 prov=copy.deepcopy(oldcompound['extendedData']['provenance']);prov['splitFromStableGoalId']=AG;prov['sourceBindingReviewPath']=str(REL/'two-child-source-course-and-obligation-contract.author-candidate.json');prov['sourceBindingStatus']='informed_author_candidate_independent_source_atomicity_D_P_M_V_review_pending'
 if gid==ASC:
  prov['sourceBindingRole']='HE_Q1_5_B04_quantitative_ascorbic_component_partial_only_structural_properties_and_qualitative_reagent_tests_not_claimed_complete';prov['sourceGoalId']='he-chem-sekii-q1-5-b04-a01-6d016bf3'
 else:
  prov['historicalCompoundSourceContext']=copy.deepcopy(oldcompound['extendedData']['provenance']);prov.pop('sourceGoalId',None);prov.pop('sourceSpan',None);prov.pop('sourceExtractionSHA256',None);prov.pop('sourceExtractionPath',None);prov['sourceBindingRole']='existing_authored_LK_analytical_transfer_for_one_specified_paraben_ester_not_literal_HE_B05_use_operator';prov['normativeLiteralSourceGoalClaim']=False
 child['extendedData']['provenance']=prov;future['goals'].append(child);G[gid]=child
G[AG].update(type='cluster',contains=[ASC,EST],requires=[],weight=2)
G[AG]['extendedData']['atomicSplit']={'authorCandidatePath':str(REL),'formerAtomicGoalId':AG,'formerAtomicSemanticsPreservedByConjunctiveChildren':True,'newChildGoalIds':[ASC,EST],'noLearnerMasteryStateMigrationOrRuntimeChangeClaimed':True,'noHumanApproval':True}
G[AG]['extendedData']['applicabilityMappingInheritance']='boundary'
# Preserve conjunctive terminal burden explicitly on the content atoms.
beforeterm=copy.deepcopy(G[TERM]);idx=G[TERM]['requires'].index(AG);G[TERM]['requires'][idx:idx+1]=[ASC,EST]
assert all(AG not in x.get('requires',[]) for x in G.values())
for edge in ['contains','requires']:
 visiting=set();done=set()
 def visit(gid):
  assert gid not in visiting,('cycle',edge,gid)
  if gid in done:return
  visiting.add(gid)
  for c in G[gid].get(edge,[]):assert c in G;visit(c)
  visiting.remove(gid);done.add(gid)
 for gid in G:visit(gid)
cp=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-biologie-q1-bacteria-e7-integration-v1/integrated-central-after-e7-current.stdout.txt';assert sha(cp)=='3df0a7c379585ba86aef20f0443ec909543777873aef87ed6dbc144aac389222';txt=cp.read_text();central=json.loads(txt[txt.find('{'):]);chem=next(x for x in central['subjects'] if x['subject']=='chemie');assert chem['denominator']==376 and chem['strictComplete']==104
BG={g['id']:g for g in base['goals']};protected=[]
for gid in chem['strictCompleteGoalIds']:
 assert G[gid]==BG[gid];protected.append({'goalId':gid,'wholeCanonicalObjectExact':True,'objectSHA256':hashlib.sha256(json.dumps(BG[gid],sort_keys=True,ensure_ascii=False).encode()).hexdigest()})
# Bounded physical root: technical modules and JSON closure copied; immutable
# originals/media linked read-only. No mutable symlink or full repo copy.
I.mkdir(parents=True,exist_ok=True);physical=[];links=[]
def cpfile(src,rel):
 src=Path(src);p=I/rel;p.parent.mkdir(parents=True,exist_ok=True);assert not p.is_symlink();shutil.copy2(src,p);assert p.stat().st_ino!=src.stat().st_ino;assert sha(p)==sha(src);physical.append({'path':str(rel),'source':str(src),'sha256':sha(p),'bytes':p.stat().st_size})
def linkfile(src,rel):
 p=I/rel;p.parent.mkdir(parents=True,exist_ok=True)
 if not p.exists():p.symlink_to(src)
 links.append({'path':str(rel),'immutableSource':str(src)})
for top in ['app/scripts','app/src','scripts','contracts']:
 for p in sorted((R/top).rglob('*')):
  if p.is_file():cpfile(p,p.relative_to(R))
for p in sorted((R/'docs').rglob('*')):
 if p.is_file() and p.suffix in ['.json','.md','.yml','.yaml','.ts']:linkfile(p,p.relative_to(R))
for p in ['AGENTS.md','LICENSING.md','LICENSE','app/package.json','app/tsconfig.json','app/tsconfig.node.json','package.json']:
 if (R/p).exists():cpfile(R/p,p)
nd=I/'app/node_modules'
if not nd.exists():nd.symlink_to(R/'app/node_modules',target_is_directory=True)
seeds=[CAN,SEM,QA,ATLAS,'curricula/DE/Gymnasium/quality/goal-description-review/chemie/review-views/chemie-m7-full-canonical.view.json']
def paths(v):
 if isinstance(v,dict):
  for x in v.values():yield from paths(x)
 elif isinstance(v,list):
  for x in v:yield from paths(x)
 elif isinstance(v,str) and v.startswith(('curricula/','app/scripts/config/','contracts/')):yield v
seen=set();pending=seeds[:]
while pending:
 rel=pending.pop()
 if rel in seen:continue
 seen.add(rel);p=R/rel
 if not p.is_file():continue
 if p.suffix=='.pdf':linkfile(p,rel)
 else:
  cpfile(p,rel)
  if p.suffix=='.json':pending.extend(paths(read(p)))
# Frozen source/atlas/image deltas remain precisely scoped; canonical and
# semantic ledger are authored anew above/on real current basis, not reset.
manifest=read(OLD/'final-current104-protection-and-prospective-input-tree.actual.json')
for row in manifest['files']:
 rel=row['path']
 if rel in [CAN,SEM]:continue
 p=R/row['futurePath'];assert sha(p)==row['futureSHA256'];cpfile(p,rel)
# All unchanged media remain read-only; changed and review media are physical.
selected=set(safe+[AG,ASC,EST,COMP,"db66635f-f1d1-5f70-bcc0-fed1ae424e52"])
for top in ['curricula/DE/Gymnasium/visualizations/chemie','app/public/assets/goal-visualizations/chemie','backend/src/main/resources/static/assets/goal-visualizations/chemie']:
 for p in sorted((R/top).rglob('*')):
  if not p.is_file():continue
  rel=p.relative_to(R)
  if (I/rel).exists():continue
  if any(gid in p.parts for gid in selected):cpfile(p,rel)
  else:linkfile(p,rel)
# Old JPEG bytes remain active and retained; inside own shadow PNG primaries
# are unambiguous and historical files remain in existing frozen author tree.
for gid in [AG,'d742ecb0-0795-5446-a95d-9503d4618475','d76b80a2-5156-54f4-b3a1-546beddf0e14']:
 for top in ['curricula/DE/Gymnasium/visualizations/chemie','app/public/assets/goal-visualizations/chemie','backend/src/main/resources/static/assets/goal-visualizations/chemie']:
  for p in (I/top/gid).glob('*.jpg'):assert not p.is_symlink();p.unlink()
dump(I/CAN,future)
# A NEW HE mapping version moves only the quantitative B04 target to Asc;
# full source clause/other db666 qualitative target stay unchanged/partial.
atlas=read(I/ATLAS);oldmap=next(p for p in atlas['mappingPaths'] if '/DE-HE/upper-secondary/' in p);mapping=read(I/oldmap);beforemap=copy.deepcopy(mapping);sid='he-chem-sekii-q1-5-b04-a01-6d016bf3'
rows=[x for x in mapping['mappings'] if x.get('legacyGoalId')==sid and x.get('canonicalGoalId')==AG];assert len(rows)==1
rows[0]['canonicalGoalId']=ASC;assert rows[0]['matchType']=='partial'
d=next(x for x in mapping['decisions'] if x.get('sourceGoalId')==sid);d['canonicalGoalIds']=[ASC if x==AG else x for x in d['canonicalGoalIds']];d['reviewedAt']='2026-10-05';d['reviewer']='informed atomic-split author; independent review pending';d['rationale']='Inactive atomic-split author candidate: preserve the whole broad HE B04 clause and the existing qualitative db666 target; bind only its quantitative ascorbic component partially to the new controlled ascorbic atom. Paraben quantitative analysis is declared authored LK transfer and is not claimed as HE B04 or HE B05 literal coverage. HE B05 use remains separately and wholly bound to0d59 as in the frozen preceding candidate. Independent source/operator and description review pending.'
newmap='curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.q1-atomic-split-author-proposal-20261005-v1.review.json';mapping['reviewId']='hessen-chemistry-upper-secondary-q1-atomic-split-author-proposal-20261005-v1';dump(I/newmap,mapping);atlas['mappingPaths']=[newmap if p==oldmap else p for p in atlas['mappingPaths']];dump(I/ATLAS,atlas)
dump(O/'two-child-source-course-and-obligation-contract.author-candidate.json',{'authority':'informed author candidate only','aggregateId':AG,'newChildren':[ASC,EST],'bothChildrenRequired':True,'fullRequiredPracticalObligations':proposal['children'],'oldApplicabilityPreservedBothChildren':oldcompound['applicability'],'oldLkTagsPreservedBothChildren':oldcompound['tags'],'HEQuantitativeSource':{'sourceGoalId':sid,'beforeTargets':[x for x in beforemap['mappings'] if x['legacyGoalId']==sid],'afterTargets':[x for x in mapping['mappings'] if x['legacyGoalId']==sid],'wholeSourceClauseRetained':True,'partialRemainsPartial':True},'HEParabenUseSource':{'sourceGoalId':'he-chem-sekii-q1-5-b05-a01-e1183390','onlyUseGoal':NEW,'fullNormativeParabenAssayClaimed':False},'parabenAnalyticalTransferDeclaredAuthored':True,'priorActiveCompoundGoal':oldactive,'priorFrozenCompoundGoal':oldcompound,'terminalRequiresBefore':beforeterm['requires'],'terminalRequiresAfter':G[TERM]['requires'],'clusterUniversalAscorbicPrerequisiteRemovedBothChildDependenciesExplicit':True,'noMasteryStateMigration':True,'activeWrites':0,'newIndependentApproval':False})
# Own author classifier is separate from independent atomicity approval.
sem=read(I/SEM);priorsem=read(T/SEM);semrows={x['goalId']:x for x in sem['decisions']}
for gid in safe:
 if gid==NEW:sem['decisions'].append(copy.deepcopy(next(x for x in priorsem['decisions'] if x['goalId']==gid)))
 else:
  oldrow=semrows[gid];fp=next(x for x in priorsem['decisions'] if x['goalId']==gid)['sourceFingerprint'];oldrow['sourceFingerprint']=fp
for gid in [ASC,EST]:sem['decisions'].append({'goalId':gid,'sourceFingerprint':'sha256:'+'0'*64,'semanticKind':'curricularAtomic','decisionStatus':'authoritative','decisionBasis':'reviewed-current-pilot-curricular-atomic'})
semrows[AG]['semanticKind']='curricularArea';semrows[AG]['decisionBasis']='reviewed-current-pilot-curricular-area';sem['counts']['curricularAtomic']=378;sem['counts']['curricularArea']=61;sem['counts']['total']=477;sem['decisions'].sort(key=lambda x:x['goalId']);dump(I/SEM,sem)
# Configs select both fresh children plus the six unchanged safe candidates and
# existing ester prerequisite page affected only through reverse-context.
book=read(OLD/'book.config.json');book['outputPath']=str(REL/'prospective-full-base.book-model.json');book['evidenceReviewPaths']=[]
pcfg=read(OLD/'positive-evidence.config.json');pcfg.update(reviewId='chemie-q1-atomic-split-p-author-20261005-v1',reviewPath=str(REL/'positive-evidence.validation-only.review.jsonl'));pcfg['scope']={'label':'Eight author profiles, including two new genuinely atomic practical assay candidates; E1/G1 needsHuman only','goalIds':safe+[ASC,EST]}
batch=read(OLD/'batch.config.json');batch.update(batchId='chemie-q1-atomic-split-20261005-v1',bookId='de-gym-chemie-q1-atomic-split-20261005-v1',title='Chemie Q1 – zwei getrennte quantitative Bestimmungen und betroffene aktuelle Kontextbindungen',baseGoalBookConfigPath=str(REL/'book.config.json'),goalIds=[COMP]+safe+[ASC,EST],outputDirectory=str(REL/'native-finalbook'))
for name,v in [('book.config.json',book),('positive-evidence.config.json',pcfg),('batch.config.json',batch)]:dump(O/name,v);dump(I/REL/name,v)
dump(O/'current104-protection-and-explicit-atomic-split.actual.json',{'atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'currentCentralReportPath':str(cp.relative_to(R)),'currentCentralSHA256':sha(cp),'activeBaseCanonicalSHA256':BASE,'protectedStrictWholeObjects':protected,'strictProtectedCount':len(protected),'existingScientificFieldDeltas':deltas,'newChildren':[ASC,EST],'oldGoalNowAggregate':AG,'newUseGoal':NEW,'targetedStructuralParent':PAR,'targetedTerminalPrerequisite':TERM,'unchangedAllOtherCanonicalObjects':all(G[g['id']]==g for g in base['goals'] if g['id']not in set(x['goalId']for x in changes)|{PAR,TERM}),'candidateFutureWholeGoalCount':len(future['goals']),'candidateFutureCurricularAtomic':378,'candidateFutureCurricularArea':61,'actualKindCountStillRequiresNativeCheck':True,'candidateOwnedIsolate':str(I),'physicalInputs':physical,'readOnlyImmutableLinks':links,'independentNewChildApprovals':False,'humanApproval':False,'humanTrial':False,'activeWrites':0})
# Keep own candidates physically in the isolated native root.
for p in O.rglob('*'):
 if p.is_file():cpfile(p,REL/p.relative_to(O))
assert sha(R/CAN)==BASE
print(json.dumps({'isolate':str(I),'wholeGoals':len(future['goals']),'prospectiveAtomic':378,'protected104':len(protected),'copiedPhysicalFiles':len(physical),'immutableLinks':len(links),'activeWrites':0}))
