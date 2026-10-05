"""Prepare exact inactive B010 future inputs using unchanged native tooling."""
from pathlib import Path
from datetime import datetime, timezone
import copy, hashlib, json, os, shutil, subprocess
ROOT=Path.cwd().resolve(); OWN=Path(__file__).parent.resolve(); REL=OWN.relative_to(ROOT)
ISO=ROOT/'tmp/chemie-b010-five-native-isolated-20261005-v1'
SOURCE=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b010-seven-source-hold-remediation-candidate-v1'
B014=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b014-five-prospective-book-current-v1'
CANON='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
QA='curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'
SEM='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
IDS=['950c73c6-4ed1-488a-9267-1142e95e0055','16a80de2-b5e0-5467-a9b3-5860730d7d8b','58486300-3f84-5aa1-9ed4-66186af62669','414489cb-453e-5de4-ab0f-0fc01175e522','1f5ee84f-245a-5a1e-a260-f960f26523e9']
BIND=['b5086548-169e-5d63-a14a-dabf631fa013','d726e00e-1f87-5ba5-8c79-76ad4022365e']
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def read(p):return json.loads(Path(p).read_text())
def write(p,j):
 p=Path(p);p.parent.mkdir(parents=True,exist_ok=True)
 if p.is_symlink():p.unlink()
 p.write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n')
def physical(p):
 p=Path(p)
 if p.is_symlink():b=p.read_bytes();p.unlink();p.write_bytes(b)
 assert not p.is_symlink()
def checkfreeze(path,key='files'):
 j=read(path)
 for r in j[key]:assert sha(ROOT/r['path'])==r['sha256'].removeprefix('sha256:'),r['path']
 return {'path':str(path.relative_to(ROOT)),'sha256':sha(path),'files':len(j[key]),'mismatches':0}
assert not (OWN/'isolation-baseline.receipt.json').exists(),'Never mutate a completed preparation'
sourcefreeze=checkfreeze(SOURCE/'author-remediation.freeze.manifest.json')
assert sourcefreeze['sha256']=='3291d5cb9e27792ae823b2ac2cfe4ca6fbf8575b9b32b13a3445318812d9fbed'
ISO.mkdir(parents=True,exist_ok=True);code=[]
for rel in ['app/scripts','scripts']:
 if not (ISO/rel).exists():shutil.copytree(ROOT/rel,ISO/rel,symlinks=False)
 for p in sorted((ROOT/rel).rglob('*')):
  if p.is_file():assert sha(p)==sha(ISO/p.relative_to(ROOT));code.append({'path':str(p.relative_to(ROOT)),'sha256':sha(p)})
for rel in ['app/src','app/node_modules','docs','contracts']:
 p=ISO/rel;p.parent.mkdir(parents=True,exist_ok=True)
 if not p.exists():p.symlink_to(ROOT/rel,target_is_directory=True)
for rel in ['curricula','app/public','backend/src/main/resources/static']:
 for base,dirs,files in os.walk(ROOT/rel,followlinks=False):
  base=Path(base);target=ISO/base.relative_to(ROOT);target.mkdir(parents=True,exist_ok=True)
  for name in files:
   p=target/name
   if not p.exists() and not p.is_symlink():p.symlink_to(base/name)
for rel in ['app/package.json','app/tsconfig.json','app/tsconfig.node.json','package.json','AGENTS.md','LICENSING.md','LICENSE']:
 if (ROOT/rel).exists() and not (ISO/rel).exists():(ISO/rel).symlink_to(ROOT/rel)
# Overlay all 69 exact B014 adopted-to-be inputs. Copy every public JPG/PNG,
# not merely this batch's images, so realpath remains inside native publicRoot.
future=read(B014/'prepared-prospective-input-tree.receipt.json')['files']
for r in future:
 src=ROOT/r['prospectiveCopyPath'];assert sha(src)==r['sha256'].removeprefix('sha256:')
 dst=ISO/r['futureActivePath'];dst.parent.mkdir(parents=True,exist_ok=True)
 if dst.is_symlink():dst.unlink()
 shutil.copy2(src,dst)
copied=[]
for p in (ISO/'app/public').rglob('*'):
 if p.is_file() and p.suffix.lower() in ['.jpg','.jpeg','.png']:
  physical(p);copied.append({'path':str(p.relative_to(ISO)),'sha256':sha(p)})
for rel in [CANON,QA,SEM]:physical(ISO/rel)
before=read(ISO/CANON);candidate=copy.deepcopy(before);goals={g['id']:g for g in candidate['goals']}
deltas=read(SOURCE/'five-description-and-provenance-deltas.json');route=read(SOURCE/'bounded-stage-route-deltas.json')
for r in deltas['descriptionDeltas']:
 g=goals[r['goalId']]
 assert {k:g.get(k) for k in r['before']}==r['before'],r['goalId']
 g.update(r['after'])
for r in deltas['provenanceDeltas']:
 assert goals[r['goalId']]['extendedData']['provenance']==r['before']
 goals[r['goalId']]['extendedData']['provenance']=r['after']
snapshot=read(SOURCE/'proposed-five-and-stage.validation-snapshot.json');snapshot_goals={g['id']:g for g in snapshot['goals']}
new=route['newCluster'];assert new['id'] not in goals
candidate['goals'].append(copy.deepcopy(new));goals[new['id']]=candidate['goals'][-1]
for r in route['containsDeltas']:
 assert goals[r['goalId']]['contains']==r['before'];goals[r['goalId']]['contains']=r['after']
for r in route['requiresDeltas']:
 assert goals[r['goalId']]['requires']==r['before'];goals[r['goalId']]['requires']=r['after']
parent=route['retainedLateClusterMetadataDelta'];g=goals[parent['goalId']]
for k,v in parent['after'].items():
 assert g[k]==parent['before'][k],k;g[k]=v
write(ISO/CANON,candidate)
view_changes=[]
for r in read(SOURCE/'five-runtime-composition-view-deltas.json')['viewDeltas']:
 v=read(ISO/r['operativePath']);assert v['rootNodes']==r['beforeRootNodes']
 v['rootNodes']=r['afterRootNodes'];write(ISO/r['operativePath'],v);view_changes.append(r['operativePath'])
# Preserve all HE source cells. Remove only the two demonstrably unrelated
# ionic-lattice tuples; preserve the genuine everyday/compound partial addition.
atlas_rel='app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json';atlas=read(ISO/atlas_rel)
oldmap=next(p for p in atlas['mappingPaths'] if '/DE-HE/lower-secondary/' in p)
mapping=read(SOURCE/'hessen-source-mapping-additive.candidate.review.json');prior=read(ISO/oldmap)
bad=['he-chem-seki-9-2-b02-a02-ee8b69e1','he-chem-seki-9-2-b02-a03-4636d596']
removed=[r for r in mapping['mappings'] if r['legacyGoalId'] in bad and r['canonicalGoalId']==IDS[0]]
assert len(removed)==2
mapping['mappings']=[r for r in mapping['mappings'] if r not in removed]
for sid in bad:
 d=next(r for r in mapping['decisions'] if r['sourceGoalId']==sid)
 d['canonicalGoalIds']=[i for i in d['canonicalGoalIds'] if i!=IDS[0]]
 d['rationale']='Inaktiver B010-Kandidat: Unpassende 950-Gitterzuordnung entfernt. '+('Alltags-/Verbindungsanteil bleibt durch 584, Metallreaktionsanteil durch bcf8 partiell gebunden. Keine neue Vollklauselfreigabe.' if sid==bad[0] else 'bcf8 und Arrhenius-Ziel 28bb bleiben als partielle Kontextziele erhalten. Wasserstoff-Halogen-Synthese und vollständige HCl-Bildung sind damit nicht vollständig nachgewiesen: residual Source-HOLD; normative Zelle unverändert erhalten.')
 d['reviewer']='codex-informed-b010-prospective-author-ai-candidate';d['reviewedAt']=datetime.now(timezone.utc).isoformat()
mapping['reviewId']='hessen-chemistry-lower-secondary-m7-b010-five-prospective-20261005-v1'
mapping['status']='candidate';mapping['summary']='Five inactive B010 future candidates; exact removal of two unrelated lattice bindings; residual hydrogen-halogen synthesis coverage HOLD.'
newmap='curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary/hessen_chemistry_lower_secondary_source_extraction_to_canonical_chemistry.m7-b010-five-prospective-20261005-v1.review.json'
write(ISO/newmap,mapping);atlas['mappingPaths']=[newmap if p==oldmap else p for p in atlas['mappingPaths']];write(ISO/atlas_rel,atlas)
write(OWN/'source-mapping-exact-removal-and-residual-hold.candidate.json',{'beforePath':oldmap,'futurePath':newmap,'removedTuples':removed,'addedTuples':[r for r in mapping['mappings'] if r not in prior['mappings']],'sourceCellsDeleted':0,'allOtherOriginalTuplesPreserved':all(r in mapping['mappings'] for r in prior['mappings'] if r not in removed),'residualSourceHolds':[{'sourceGoalId':bad[1],'component':'Hydrogen-halogen synthesis; retained partial targets do not demonstrate the complete clause'}],'newScientificClosure':0,'activeWrites':0})
# Native importer writes these actual leaf names. Physically detach before import.
prompt_before=[]
for leaf in ['prompt.de.md','image-reconstruction-prompt.de.md']:
 rel=f'curricula/DE/Gymnasium/visualizations/chemie/{IDS[0]}/{leaf}';p=ISO/rel
 if p.exists():prompt_before.append({'path':rel,'activeSHA256':sha(ROOT/rel)});physical(p)
vrel='curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-b014-titration-b010-ion-lattice-independent-v-qa-20261005-v1/independent-two-image-v-qa.receipt.json';v=read(ROOT/vrel);vr=next(r for r in v['records'] if r['goalId']==IDS[0]);assert vr['decision']=='PASS'
assert sha(ROOT/vr['assetPath'])==vr['assetSha256']=='6232e3bd9eaa7edfcc1711d669b6655c8cf535ac68c9ee7022a64916cf6be737'
args=['node','scripts/import_goal_visualization.mjs','--goal',IDS[0],'--image',str(ROOT/vr['assetPath']),'--landscape',CANON,'--subject','chemie','--lang','de','--provider',vr['provenance']['provider'],'--review-status','pilot','--license','CC-BY-4.0','--description','Schematischer räumlicher NaCl-Gitterausschnitt; inaktiver Kandidat mit exakt unabhängig geprüften Pixeln.','--alt-text',vr['metadataIntegrationRequirement']['reviewedAltText']['de'],'--prompt',str(ROOT/vr['provenance']['promptPath'])]
run=subprocess.run(args,cwd=ISO,text=True,capture_output=True);(OWN/'950-native-image-import.stdout.txt').write_text(run.stdout);(OWN/'950-native-image-import.stderr.txt').write_text(run.stderr);assert run.returncode==0,run.stderr
assert all(sha(ROOT/r['path'])==r['activeSHA256'] for r in prompt_before)
candidate=read(ISO/CANON);goals={g['id']:g for g in candidate['goals']}
# Existing four pixels stay byte exact. The metadata follows exact new text;
# visual KEEP is an informed candidate awaiting independent targeted binding.
for id in IDS[1:]:
 link=next(r for r in goals[id]['resourceLinks'] if r.get('type')=='goal-visualization' and r.get('role')=='primary')
 link['title']='Visualisierung: '+goals[id]['title'];link['description']='Visualisierung zum Lernziel: '+goals[id]['title']+'.'
write(ISO/CANON,candidate)
write(OWN/'baseline-full-canonical.snapshot.json',before)
write(OWN/'exact-goal-and-route-deltas.candidate.json',{'authority':'informed_ai_author_candidate','status':'inactive','fiveGoalIds':IDS,'targetedExistingBindingIds':BIND,'heldGoalIds':['72236f2c-771e-4ab6-933a-e549ee49d15b','e0e201bd-a1fd-5985-ab08-fd24c8655f3d'],'rows':[{'goalId':g['id'],'before':next((x for x in before['goals'] if x['id']==g['id']),None),'after':g} for g in candidate['goals'] if g!=next((x for x in before['goals'] if x['id']==g['id']),None)],'newAtomicIds':[],'newStructuralIds':[new['id']],'futureRuntimeViews':view_changes,'curricularAtomicDenominator':376,'strictClosure':0,'activeWrites':0})
book=read(ISO/'curricula/DE/Gymnasium/quality/goal-description-review/chemie/review-book-full.config.json');book['outputPath']=str(REL/'future-full.book-model.json')
batch={'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-config.schema.json','schemaVersion':1,'batchId':'chemie-b010-five-prospective-current-20261005-v1','subject':'chemie','subjectLabel':'Chemie','bookId':'de-gym-chemie-b010-five-prospective-current-20261005-v1','title':'Chemie B010 – fünf aktuelle Quellenreparaturen und gezielte bestehende Seitenbindungen','baseGoalBookConfigPath':str(REL/'book.config.json'),'goalIds':IDS+BIND,'outputDirectory':str(REL/'native-finalbook'),'feedbackBaseUrl':'https://skillpilot.com/lernziel-feedback','promptPath':'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md','criteriaPath':'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-goal-description-understanding-evidence-review-criteria-v1.md','printDerivativeProfile':'bounded-atlas'}
for name,j in [('book.config.json',book),('batch.config.json',batch)]:write(OWN/name,j);write(ISO/REL/name,j)
write(OWN/'isolation-baseline.receipt.json',{'isolationRoot':str(ISO),'B010SourceFreeze':sourcefreeze,'B014Future69ReceiptPath':str((B014/'prepared-prospective-input-tree.receipt.json').relative_to(ROOT)),'B014Future69ReceiptSHA256':sha(B014/'prepared-prospective-input-tree.receipt.json'),'B014OverlayFiles':len(future),'nativeCopiedCode':code,'physicallyCopiedPublicImages':copied,'nativeImporter':{'args':args,'actualExitCode':run.returncode},'actualPromptLeavesDetachedBeforeImport':prompt_before,'allOriginalPromptBytesPreserved':True,'fiveScientificCandidates':IDS,'existingBindingsOnly':BIND,'strictClosure':0,'humanApproval':False,'activeWrites':0})
print(json.dumps({'isolation':str(ISO),'five':IDS,'newStructure':new['id'],'copiedPublicImages':len(copied),'nativeImportExit':run.returncode,'sourceRemoved':len(removed),'activeWrites':0}))
