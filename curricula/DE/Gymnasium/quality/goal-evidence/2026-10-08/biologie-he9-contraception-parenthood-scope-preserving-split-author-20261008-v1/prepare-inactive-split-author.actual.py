import json,hashlib,uuid,copy,subprocess
from pathlib import Path
from datetime import datetime,timezone
root=Path('/home/enpasos/projects/skillpilot')
own=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-he9-contraception-parenthood-scope-preserving-split-author-20261008-v1')
gid='3ee4b55c-81c3-5826-9d26-1a8c22cbd0b8';now=datetime.now(timezone.utc).isoformat()
canonical=Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
def read(p):return json.loads((root/p).read_text())
def digest(p):
 b=(root/p).read_bytes();return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(p,obj):
 p=root/own/p;assert not p.exists(),str(p);p.parent.mkdir(parents=True,exist_ok=True);p.write_text(obj if isinstance(obj,str) else json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
def snapshot(p):
 dest=own/'input-snapshots'/p;out=root/dest;assert not out.exists();out.parent.mkdir(parents=True,exist_ok=True);out.write_bytes((root/p).read_bytes());return str(dest)
landscape=read(canonical);by={x['id']:x for x in landscape['goals']};old=by[gid]
assert len(landscape['goals'])==474 and old['contains']==[] and old['type']=='atomic'
keys=['canonical_biology_sek1_contraception_method_assessment','canonical_biology_sek1_responsible_parenthood_reflection']
childids=[str(uuid.uuid5(uuid.UUID(gid),k)) for k in keys]
assert all(x not in by for x in childids)
children=[]
for i,(cid,key) in enumerate(zip(childids,keys)):
 child=copy.deepcopy(old);child.update(id=cid,shortKey=key,weight=1,contains=[],requires=list(old['requires']))
 child['title']=['Verhütungsmethoden beurteilen','Verantwortliche Elternschaft reflektieren'][i]
 child['titleEn']=['Assess Methods of Contraception','Reflect on Responsible Parenthood'][i]
 child['description']=['Die lernende Person kann Methoden der Empfängnisregelung beurteilen.','Die lernende Person kann verantwortliche Elternschaft reflektieren.'][i]
 child['descriptionEn']=['The learner can assess methods of contraception.','The learner can reflect on responsible parenthood.'][i]
 child['dimensionTags']['topicCode']=['CANONICAL.BIOLOGY.SEK1.CONTRACEPTION_METHOD_ASSESSMENT','CANONICAL.BIOLOGY.SEK1.RESPONSIBLE_PARENTHOOD_REFLECTION'][i]
 child['extendedData']['provenance']['canonicalSplitOriginGoalId']=gid
 children.append(child)
cluster=copy.deepcopy(old);cluster.update(type='cluster',contains=childids,weight=2)
candidate=copy.deepcopy(landscape)
idx=next(i for i,x in enumerate(candidate['goals']) if x['id']==gid)
candidate['goals'][idx]=cluster;candidate['goals'][idx+1:idx+1]=children
assert len(candidate['goals'])==476
assert [g for g in candidate['goals'] if g['id'] not in childids+[gid]]==[g for g in landscape['goals'] if g['id']!=gid]
write(Path('candidate/canonical.476-split-author.json'),candidate)
write(Path('whole-stable-cluster-and-two-child-goals.author.json'),{'role':'Unapproved inactive author candidate','originalWholeGoal':old,'proposedStableCluster':cluster,'proposedTwoWholeAtomicChildren':children,'idDerivation':{'method':'UUIDv5','namespaceStableParentId':gid,'names':keys,'children':childids},'denominator':{'before':391,'afterProposed':392,'canonicalBefore':474,'canonicalAfterProposed':476},'newPrerequisitesBetweenChildren':False,'existingPrerequisiteRetainedForBothChildren':old['requires'],'existingRequiresConsumersUnchanged':[g for g in landscape['goals'] if gid in g.get('requires',[])],'activeWrites':0,'independentVariantApproval':False})
paths=[canonical,Path('curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'),Path('curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json'),Path('curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-biology-full.review.jsonl'),Path('curricula/DE/Gymnasium/quality/memory-card-review/canonical-biology-full.review.jsonl'),Path('curricula/DE/Gymnasium/quality/memory-card-review/canonical-biology-full.config.json'),Path('curricula/DE/Gymnasium/quality/memory-card-review/canonical-biology-full.cards.review.jsonl'),Path('app/scripts/config/curriculum-maturity-floor-policy.json'),Path('docs/qa-ci/status/curriculum-quality-status.json'),Path('app/scripts/config/goal-books/de-gym-biology-national-atlas.sources.json'),Path('curricula/DE/Gymnasium/provenance/gymnasium-duration-model-policy.json')]
manifest=read(paths[-2]);views=list((root/'curricula/DE/Gymnasium/composition-views/biologie').glob('*.json'))+[root/p for p in manifest['sourcePaths']]+[root/manifest['navigationViewPath']]
paths+=sorted(set(p.relative_to(root) for p in views))
inputs=[];forbidden_active=[]
for p in dict.fromkeys(paths):inputs.append({**digest(p),'snapshotPath':snapshot(p)})
viewproposals=[]
for p in sorted(set(p.relative_to(root) for p in views)):
 v=read(p);proposed=copy.deepcopy(v);changes=[]
 def walk(o,pointer=''):
  if isinstance(o,dict):
   if o.get('kind')=='goalEntry' and o.get('goalId')==gid:
    before=copy.deepcopy(o);o['kind']='canonicalSubtree';changes.append({'jsonPointer':pointer,'before':before,'after':copy.deepcopy(o),'allOtherNodeFieldsExact':True})
   for k,value in o.items():walk(value,pointer+'/'+k)
  elif isinstance(o,list):
   for i,value in enumerate(o):walk(value,pointer+'/'+str(i))
 walk(proposed)
 if changes:
  dest=Path('candidate/views')/p;write(dest,proposed);viewproposals.append({'activePath':str(p),'candidatePath':str(own/dest),'changes':changes})
write(Path('scope-preserving-view-reference-proposals.author.json'),{'proposals':viewproposals,'changedViewFileCount':len(viewproposals),'purpose':'Expose the same former whole scope as the two children; goalEntry would hide children of the new cluster. Preserve scope/role/id/order/labels.','activeWrites':0,'approval':'candidate pending independent source/scope review'})
candidateManifest=copy.deepcopy(manifest);candidateManifest['expectedCurricularAtomicGoalCount']=392
vpathmap={x['activePath']:x['candidatePath'] for x in viewproposals}
candidateManifest['sourcePaths']=sorted(vpathmap.get(p,str(own/'input-snapshots'/p)) for p in manifest['sourcePaths'])
candidateManifest['navigationViewPath']=vpathmap.get(manifest['navigationViewPath'],str(own/'input-snapshots'/manifest['navigationViewPath']))
candidateManifest['durationModelPolicyPath']=str(own/'input-snapshots'/manifest['durationModelPolicyPath'])
write(Path('candidate/atlas.sources.392-author.json'),candidateManifest)
# Public authoring and quality consumers only. No learner or session files read.
searchpaths=['app/src','app/scripts/config','app/public/data','backend/src/main/resources','backend/src/test/java','scripts','curricula/DE/Gymnasium/canonical','curricula/DE/Gymnasium/composition-views','curricula/DE/Gymnasium/mapping','curricula/DE/Gymnasium/provenance','curricula/DE/Gymnasium/memory-decks']
hit=subprocess.run(['rg','-l',gid,*searchpaths],cwd=root,capture_output=True,text=True)
assert hit.returncode in [0,1,2]
consumers=[]
for name in hit.stdout.splitlines():
 p=Path(name);matches=[]
 if p.suffix=='.json':
  data=read(p)
  def collect(o,pointer=''):
   if isinstance(o,dict):
    if any(value==gid or isinstance(value,list) and gid in value for value in o.values()):matches.append({'jsonPointer':pointer,'completeDirectReferenceObject':o})
    for k,value in o.items():collect(value,pointer+'/'+k)
   elif isinstance(o,list):
    for i,value in enumerate(o):collect(value,pointer+'/'+str(i))
  collect(data)
 else:
  matches=[{'lineNumber':i,'text':line} for i,line in enumerate((root/p).read_text().splitlines(),1) if gid in line]
 consumers.append({**digest(p),'role':'derived published/build artifact remains untouched' if 'backend/src/main/resources/static' in name or 'source-projection.receipt' in name else 'retained source mapping; stable parent preserves original whole scope, child source-route approval pending' if '/mapping/' in name else 'canonical/view/test consumer','matches':matches})
write(Path('all-active-public-consumer-references.actual.json'),{'observedAt':now,'searchPaths':searchpaths,'exactConsumers':consumers,'consumerFileCount':len(consumers),'containsParents':[g for g in landscape['goals'] if gid in g.get('contains',[])],'requiresConsumers':[g for g in landscape['goals'] if gid in g.get('requires',[])],'noPrivateLearnerDataRead':True,'activeWrites':0})
oldA=next(json.loads(s) for s in (root/paths[3]).read_text().splitlines() if json.loads(s)['goalId']==gid)
oldM=next(json.loads(s) for s in (root/paths[4]).read_text().splitlines() if json.loads(s)['goalId']==gid)
oldPpath=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-he9-nineteen-targeted-alternatives-and-materials-author-root-v2/P19.targeted-or-and-materials-closed-contract.author.candidates.json')
oldP=next(x for x in read(oldPpath)['goals'] if x['goalId']==gid)
oldCasePath=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-he9-nineteen-targeted-alternatives-and-materials-author-root-v2/nineteen-whole-goals-forty-two-complete-DEEN-cases.author.json')
oldCases=next(x for x in read(oldCasePath)['goals'] if x['goalId']==gid)
write(Path('retained-original-whole-P-cases-A-M.actual.json'),{'originalWholeGoal':old,'wholeOriginalPositiveCandidate':oldP,'wholeOriginalCases':oldCases,'historicalExactAtomicityRecord':oldA,'historicalExactMemoryRecord':oldM,'historyOnly':'Existing A atomic and M no_memory_needed decisions remain untouched history; they are not transferred as approvals to new children or the changed cluster.','originalPBinding':digest(oldPpath),'originalCasesBinding':digest(oldCasePath)})
sourcepaths=[Path('curricula/DE/Gymnasium/input/HE/lower-secondary/source-json/DE_HES_S_GYM_1_BIOLOGIE.de.json.snapshot'),Path('curricula/DE/Gymnasium/input/HE/lower-secondary/source-extraction/DE_HE_BIOLOGIE_SEKI_G9.source-extraction.json'),Path('curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary/hessen_biology_lower_secondary_to_canonical_biology.json'),Path('curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary/hessen_biology_lower_secondary_source_extraction_to_canonical_biology.review.json')]
sourcegoal=next(g for g in read(sourcepaths[0])['goals'] if g['id']=='73fec5f9-c553-4252-9905-72dfca8c8ffe')
write(Path('original-HE-source-goal-and-actual-primary-reading.author.json'),{'wholeOriginalHEGoal':sourcegoal,'exactSourceAndMappings':[digest(p) for p in sourcepaths],'actualOfficialPDF':{'url':'https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-06/g9-biologie.pdf','sha256':'93257f9be96e9bd288d187eb63e3e33ca28debdb2511dcd068e9abf82bc5b5f1','wholePhysicalPageRead':26,'printedPage':25,'fullOfficialTextNotRedistributed':True},'sourceScope':'WholeHE9.3 source separates contraceptive family planning/parenthood and social/emotional perspectives. Optional hormone feedback stays optional. Adjacent pregnancy/birth/abortion or other endocrine topics are not silently added to the split children.','conditionalSTIScope':'The original reviewed P already separates pregnancy prevention and STI protection. In the bounded HE teaching context, originalHE9.2 HIV prevention and supplied institutional method information support this criterion. No whole-country obligation is inferred from copied raw applicability.','additionalActualInstitutionalMethodPages':['https://www.who.int/news-room/fact-sheets/detail/condoms','https://www.who.int/news-room/fact-sheets/detail/oral-contraceptives'],'nationalRouteApproval':'pending genuine source/scope reviews; existing16-jurisdiction applicability is unchanged target metadata, not fresh per-country approval'})
human=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-human20-reviewed-active-integration-root-v1/active-after-human20-central.actual.json')
strict=read(human)['subjects'];bio=next(x for x in strict if x['subject']=='biologie');assert bio['strictComplete']==154 and bio['denominator']==391 and gid not in bio['strictCompleteGoalIds']
write(Path('protected-current154-and-other-subject-baseline.actual.json'),{'protectedMachineBaselineReport':digest(human),'protectedBiology154GoalIds':bio['strictCompleteGoalIds'],'currentBodiesExactForProtected154':True,'all473ExistingOtherGoalBodiesExact':True,'allExisting473OtherGoalBodiesExact':True,'wholeOldTargetFieldsRetainedExceptTypeContainsWeight':True,'historical454OrWhole391EvidenceNeverWholesaleRebound':True,'mathCanonical':digest(Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json')),'physicsCanonical':digest(Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json')),'chemistryCanonical':digest(Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')),'protectedOtherStrictBaseline':{'mathematik':'807/807','physik':'478/478','chemie':'173/378'},'maturityFloorPolicyBinding':digest(paths[7]),'noActiveChanges':True,'futureSameStrictCountsNotClaimed':'Native position/context and rebound checks still required; adding two pending children does not create completion.','pending392Denominator':True})
write(Path('author-input-snapshot-manifest.actual.json'),{'recordedAt':now,'inputs':inputs,'sourceInputs':[digest(p) for p in sourcepaths],'oldPAndCases':[digest(oldPpath),digest(oldCasePath)],'baselineHumanReport':digest(human),'canonicalSnapshotSha256':digest(canonical)['sha256'],'activeWrites':0,'rebaseRequiredAfterOther18':'Apply this isolated structural proposal to the then-current canonical/view/source/QA baseline after the separate18 current391 package stabilizes. Never overwrite its images or review bindings from these snapshots.'})
print(json.dumps({'canonicalBefore':474,'canonicalCandidate':476,'atomicBefore':391,'atomicCandidate':392,'childIds':childids,'existingOtherBodiesExact':473,'changedViewsCandidate':len(viewproposals),'publicConsumerFiles':len(consumers),'inputSnapshots':len(inputs),'activeWrites':0}))
