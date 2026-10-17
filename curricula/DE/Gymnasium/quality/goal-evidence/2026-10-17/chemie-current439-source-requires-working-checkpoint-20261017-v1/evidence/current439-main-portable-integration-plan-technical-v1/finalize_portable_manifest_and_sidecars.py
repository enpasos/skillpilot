"""Prepare exact portable sidecars/payload and an executable file plan; never mutate Main/K."""
from pathlib import Path
import copy,datetime,hashlib,json,os,shutil,stat,subprocess
O=Path(__file__).resolve().parent;A=O/'native-dependency-audit';K=O.parent/'current439-remediation14-guarded-root-integration-technical-v1/capsule';M=Path('/home/enpasos/projects/skillpilot')
Q='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-portable-integration-technical-v1'
def read(p):return json.loads(Path(p).read_text())
def digest(p):
 h=hashlib.sha256()
 with Path(p).open('rb') as f:
  for b in iter(lambda:f.read(4*1024*1024),b''):h.update(b)
 return h.hexdigest()
def pin(p):return {'path':str(p),'sha256':digest(p),'bytes':Path(p).stat().st_size}
def checked(p,expected=None):
 actual=pin(p)
 if expected:
  assert actual['sha256']==expected['sha256'].removeprefix('sha256:')
  assert actual['bytes']==expected.get('bytes',expected.get('sizeBytes',actual['bytes']))
 return actual
def git(*args):return subprocess.run(['git','--no-optional-locks',*args],cwd=M,capture_output=True,text=True,check=True).stdout
base_path=A/'BASE.portable-file-plan.json';base=read(base_path)
files={e['logicalPath']:copy.deepcopy(e) for e in base['files']}
for entry in files.values():
 if isinstance(entry['gitMode'],str):entry['gitMode']=int(entry['gitMode'],8)
base_status=bytes.fromhex('') if not base['mainBefore']['status']['base64'] else __import__('base64').b64decode(base['mainBefore']['status']['base64'])
assert base['sourceGuardsAllUnchanged'] and base['mainFileGuardsAllUnchanged'] and base['mainHeadAndGitStatusByteExactBeforeAfter']
guards={};external_refs=[];history_maps=[];unresolved_historical_pins=[];technical_overlays=[]
def remember(p,expected=None):
 v=checked(p,expected);guards[v['path']]=v;return v
def before_main(rel):
 p=M/rel
 if not p.exists() and not p.is_symlink():return {'kind':'absent'}
 assert p.is_file(),str(p)
 d=pin(p);r={'kind':'file','sha256':d['sha256'],'bytes':d['bytes'],'isSymlink':p.is_symlink()}
 if p.is_symlink():r['linkTarget']=os.readlink(p)
 return r
def add(source,rel,role,expected=None,activation=False):
 source=Path(source);v=remember(source,expected)
 if rel in files:
  assert files[rel]['sha256']==v['sha256'] and files[rel]['bytes']==v['bytes'],rel
  files[rel]['roles']=sorted(set(files[rel].get('roles',[])+[role]));return rel
 assert not Path(rel).is_absolute() and '..' not in Path(rel).parts
 p=M/rel;mb=before_main(rel);same=mb['kind']=='file' and mb['sha256']==v['sha256'] and mb['bytes']==v['bytes']
 entry={'logicalPath':rel,'sha256':v['sha256'],'bytes':v['bytes'],'roles':[role],
  'sourceAbsolutePath':str(source),'mainBefore':mb,'gitMode':0o755 if source.stat().st_mode&stat.S_IXUSR else 0o644,
  'activationFile':activation,'action':'reuse-existing-main-byte-exact' if same else 'materialize-regular-exact-file'}
 if not same:
  payload=O/'payload'/rel;payload.parent.mkdir(parents=True,exist_ok=True)
  
  if not payload.exists():shutil.copyfile(source,payload)
  assert checked(payload)['sha256']==v['sha256']
  entry['payloadRelativePath']=str(payload.relative_to(O))
 files[rel]=entry;return rel
def generated(rel,obj,role):
 p=O/'generated-sidecars'/Path(rel).name;p.parent.mkdir(exist_ok=True)
 data=json.dumps(obj,ensure_ascii=False,indent=2)+'\n'
 if p.exists():assert p.read_text()==data,str(p)
 else:p.write_text(data)
 return add(p,rel,role)
def evidence_source(item,role):
 source=Path(item['path']);v=remember(source,item)
 # Reuse an already committable exact target, irrespective of its local origin.
 matches=[r for r,e in files.items() if e['sha256']==v['sha256'] and e['bytes']==v['bytes']]
 if matches:target=sorted(matches,key=lambda s:(len(s),s))[0]
 else:
  proposed=None
  for root in [K,M]:
   try:proposed=str(source.relative_to(root));break
   except ValueError:pass
  if proposed and proposed.startswith('tmp/'):proposed=None
  if proposed and subprocess.run(['git','check-ignore','-q','--',proposed],cwd=M).returncode==0:proposed=None
  if proposed and proposed not in files:target=add(source,proposed,role,v)
  else:target=add(source,Q+'/source-partners/sha256/'+v['sha256']+'/'+source.name,role,v)
 external_refs.append({'originalPath':str(source),'sha256':v['sha256'],'bytes':v['bytes'],'portableRepoPath':target,'role':role,'originalBytesRewritten':False})
 return target
def pin_objects(obj):
 if isinstance(obj,dict):
  if isinstance(obj.get('path'),str) and isinstance(obj.get('sha256'),str) and ('bytes' in obj or 'sizeBytes' in obj):yield obj
  for value in obj.values():yield from pin_objects(value)
 elif isinstance(obj,list):
  for value in obj:yield from pin_objects(value)

# Preserve original identity decisions/policies and exact original goal archive; no release/runtime feature.
identity_path=O/'IDENTITY.413-to94-existing-consolidation-and-mastery-policy.exact-source-addendum.json';identity=read(identity_path)
add(identity_path,Q+'/'+identity_path.name,'additive-existing-identity-policy-evidence')
for p in identity['sourceGuards']:evidence_source(p,'existing-413-94-authoring-review-history')
# Root's actual prepared disposition supersedes a generic duplicate policy sidecar.
disposition_root=O.parent/'current439-remediation14-guarded-root-integration-technical-v1/integration-disposition-413-root-v1'
disposition_receipt=read(disposition_root/'RECEIPT.prepared-current439-stable-id-disposition.json')
identity_paths=[]
for item in disposition_receipt['payloadFiles']:
 rel=item['path'];add(disposition_root/'payload'/rel,rel,'root-actual-existing-413-disposition-and-exact-goal-archives',item);identity_paths.append(rel)
policy_rel=next(path for path in identity_paths if '/DISPOSITION.' in path)
assert files[policy_rel]['sha256']=='fa97ed6bfc6f1038dfeca22cfa24f8b5d3017c09eb731b5c96bbdd20f2691d0c'
# All relative evidence pins in that disposition are either live current bytes or archived history.
for item in pin_objects(read(disposition_root/'payload'/policy_rel)):
 if Path(item['path']).is_absolute():evidence_source(item,'root-413-disposition-original-source-partner');continue
 rel=item['path'];expected=item['sha256'].removeprefix('sha256:')
 if rel in files and files[rel]['sha256']==expected:continue
 candidates=[K/rel,M/rel,disposition_root/'payload'/rel]
 actual=next((p for p in candidates if p.is_file() and digest(p)==expected),None)
 assert actual is not None,('unlocated exact disposition partner',item)
 evidence_source({'path':str(actual),'sha256':expected,'bytes':item['bytes']},'root-413-disposition-original-source-partner')

# Exact final current4 material assignment; previous material versions are history only.
q4='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-material4-v3-targeted-preparation-technical-v1'
selector_path=K/q4/'SELECTOR.clean-current4-v3-reviewer-inputs.sealed.json';selector=read(selector_path)
add(selector_path,q4+'/'+selector_path.name,'frozen-current4-clean-review-selector')
view=selector['view'];evidence_source(view,'frozen-current4-whole-scientific-view')
matpin=selector['wholeAuthoredMaterialReferences'][0]['pin'];material=read(matpin['path']);material_target=evidence_source(matpin,'current-nine-whole-operative-cases')
binding=selector['operativeMaterialBindings'];binding_target=evidence_source(binding,'current-v3-case-profile-assignment')
assignments=[]
for case in material['cases']:
 sp=case['sourceFile'];target=evidence_source(sp,'whole-operative-current-v3-material-source')
 assignments.append({'goalId':case['assignedGoalId'],'caseId':case['caseId'],'profileCasePointer':case.get('profileCasePointer'),
  'wholeMaterialRepoPath':target,'jsonPointer':case['sourceJsonPointer'],'wholeSourceSha256':sp['sha256'],
  'operative':True,'actualLearnerAttainmentClaim':False})
for obj in pin_objects(material):
 path=obj['path']
 if os.path.isabs(path):
  if Path(path).is_file():evidence_source(obj,'current-case-bound-original-source-history')
  else:unresolved_historical_pins.append({'pin':obj,'role':'inert historical nested pin; no operational material is selected from this unavailable path'})

# Keep the other authored R14 whole material sources exactly, with honest source-history roles.
r14=O.parent/'current439-remediation14-author-assembly-technical-v1'
safe14=read(r14/'REVIEW.remediation14.whole-scientific-content.no-review-metadata.json')
retained=[]
for ref in safe14['wholeAuthoredMaterialReferences']:
 p=ref['pin'];target=evidence_source(p,'retained-frozen14-whole-material-source-history')
 retained.append({'sourceRole':ref['role'],'portableRepoPath':target,'sha256':p['sha256'],
  'operativeBoundary':'Current4 V3 assignment above supersedes the former f85b/b8d3/188/28c assignment. Whole cf270 procedure and the5c8f whole case remain their frozen14 source materials; prior other cases retained as history.'})

# Local absolute strings in immutable native records remain inert provenance; add portable exact partners.
external=read(A/'external-provenance-path-substrings-and-sidecar-map.json')
for item in external['targets']:
 if item.get('isFile'):evidence_source({'path':item['path'],'sha256':item['sha256'],'bytes':item['sizeBytes']},'native-inert-local-path-exact-source-partner')


# Preserve existing current80-card judgments and their exact whole-card input partners.
card_path=A/'current-core-helper/current80-card-review-fingerprint-provenance-and-source-alignment-plan.json'
card=read(card_path);assert card['summary']['fingerprintMatches']==80 and card['summary']['sourceGuardAllUnchanged']
card_target=add(card_path,Q+'/memory-card-history/'+card_path.name,'actual-80-card-provenance-and-source-alignment-plan-only')
for item in card['files']:
 source=item.get('sourceAbsolutePathForMaterialization',item['absolutePath']);expected=item['sourceGuardAfter']
 evidence_source({'path':source,'sha256':expected['sha256'],'bytes':expected['sizeBytes']},'actual-current80-card-first-seal-whole-input-partner')
card_rel=generated(Q+'/MEMORY.current80-existing-paired-proof.portable-binding.json',{
 'role':'Location binding to actual existing paired AI science and whole-card content; no new science',
 'current80AuditRepoPath':card_target,'currentPrimaryCardCount':80,'fingerprintMatches':80,
 'sourceAlignmentPlansAppliedByThisArtifact':False,'newIndependentScience':False,
 'originalReviewAndCardLedgerBytesRewritten':False,'sourcePublicDriftResolutionIsSeparateOwnerTechnicalStep':True},'portable-current80-card-source-provenance-sidecar')

# Root authorized these exact bounded metadata/source successor proposals after reading their proof.
# They are staged only in this own payload; K/Main source files remain untouched.
def overlay(source,rel,role,expected,before,history_role):
 old=files.get(rel);assert old is not None,rel
 assert old['sha256']==before['sha256'].removeprefix('sha256:') and old['bytes']==before.get('bytes',before.get('sizeBytes')),rel
 oldsource=Path(before.get('path',old['sourceAbsolutePath']));remember(oldsource,before)
 archive_rel=Q+'/technical-overlay-history/'+before['sha256'].removeprefix('sha256:')+'/'+Path(rel).name
 add(oldsource,archive_rel,history_role,before)
 # A prior additive map must keep naming the original exact bytes after the live target changes.
 for mapping in external_refs:
  if mapping['portableRepoPath']==rel and mapping['sha256']==old['sha256']:mapping['portableRepoPath']=archive_rel
 del files[rel]
 add(source,rel,role,expected)
 technical_overlays.append({'targetRepoPath':rel,'beforeBaseSha256':old['sha256'],'beforeBaseBytes':old['bytes'],
  'originalByteArchiveRepoPath':archive_rel,'afterSha256':files[rel]['sha256'],'afterBytes':files[rel]['bytes'],
  'role':role,'KMutated':False,'MainMutated':False,'newScience':False})
for row in card['sourceAlignmentPlans']:
 rel=row['originalSourcePath'];before={'path':str(K/rel),'sha256':row['originalSourceBytePin']['sha256'],'bytes':row['originalSourceBytePin']['sizeBytes']}
 public=K/row['reviewedPublicPath'];expected={'sha256':row['reviewedPublicBytePin']['sha256'],'bytes':row['reviewedPublicBytePin']['sizeBytes']}
 overlay(public,rel,'root-authorized-existing-reviewed-public-bytes-as-authoring-source-successor',expected,before,'immutable-original-memory-source-before-reviewed-successor')
bycas_path=O/'proposals/BY-legacy-source-document-key-metadata-only/CAS.provenance-backed-54-legacy-document-keys-only.json'
bycas=read(bycas_path);evidence_source(pin(bycas_path),'exact-BY54-metadata-only-CAS')
overlay(bycas['candidate']['path'],bycas['targetRepoPath'],'root-authorized-explicit-original-BY54-source-document-keys-only',bycas['candidate'],bycas['before'],'immutable-BY-before-explicit-original-document-keys')
bookcas_path=O/'proposals/normal-chemistry-book-current-SEM-only/CAS.two-current-SEM-path-fields-only.json'
bookcas=read(bookcas_path);evidence_source(pin(bookcas_path),'exact-two-current-book-SEM-path-CAS')
for row in bookcas['rows']:
 overlay(row['candidate']['path'],row['targetRepoPath'],'root-authorized-normal-book-current-SEM-reference-only',row['candidate'],row['before'],'immutable-book-config-before-current-SEM-reference')
for overlay_row in technical_overlays:
 assert files[overlay_row['targetRepoPath']]['sha256']==overlay_row['afterSha256']

# Genuine stock central output is copied verbatim; no synthesized acceptance or altered seal.
proofroot=O.parent/'current439-remediation14-guarded-root-integration-technical-v1/central-current439-D113-P439V3-inherited-child-root-v2'
proof=[]
for name in ['RESULT.actual-current439-D113-P439V3.json','central.stock.stdout.json']:
 p=proofroot/name
 if name=='central.stock.stdout.json':assert digest(p)=='2c1a05fd2994708e4cf40d043aca6240f95dfb0ee0d46121f3fdfeb73dd83482'
 rel=add(p,Q+'/machine-proof/'+name,'original-actual-central-stock-proof');proof.append({'repoPath':rel,**{key:pin(p)[key] for key in ['sha256','bytes']}})

# Root-owned real global registry uses the proved Chemistry object and preserves every other subject.
global_rel='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
global_pin=remember(K/global_rel);assert global_pin['sha256']=='0218e7d05933a723846278542e8064c1b104a7fa88b71f134a85a9f8dc30bbe8'
g=read(K/global_rel);main_g=read(M/global_rel)
old_others=[s for s in main_g['subjects'] if s['subject']!='chemie'];new_others=[s for s in g['subjects'] if s['subject']!='chemie'];assert old_others==new_others
root_config=read(K/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-remediation14-guarded-root-integration-technical-v1/current4-v3-root-successor/central.current439.D113-P439V3.PROSPECTIVE.config.json')
assert next(s for s in g['subjects'] if s['subject']=='chemie')==root_config['subjects'][0]
add(K/global_rel,global_rel,'root-owned-exact-global-chemistry-registry-patch',activation=True)

material_rel=generated(Q+'/MATERIAL.current439-operative9-and-retained14.portable-bindings.json',{
 'role':'Exact current operative whole-material partners and retained history; hashes are bindings, not scientific approval',
 'currentNineWholeCaseProjectionRepoPath':material_target,'currentAssignmentSourceRepoPath':binding_target,
 'currentAssignments':assignments,'retainedOriginal14Sources':retained,'actualLearnerAttainmentClaim':False,
 'previousFourMaterialAssignmentsOperative':False,'newScientificJudgments':False},'portable-current-material-sidecar')
mapping_rel=generated(Q+'/PORTABILITY.original-local-references-to-exact-repo-partners.json',{
 'role':'Additive location sidecar; original historical files and scientific judgments remain exact',
 'references':external_refs,'absoluteLocalPathsAreInertHistoricalProvenance':True,
 'operationalFilesUseRepositoryRelativePaths':True,'originalsResealedOrRewritten':False,'unavailableInertNestedHistoricalPins':unresolved_historical_pins},'portable-provenance-sidecar')

protected=[]
for p in (M/'curricula/DE/Gymnasium/canonical').glob('*.json'):
 if p.name=='DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json':continue
 protected.append({'logicalPath':str(p.relative_to(M)),**{key:pin(p)[key] for key in ['sha256','bytes']}})
for value in guards.values():checked(value['path'],value)
assert subprocess.run(['git','--no-optional-locks','status','--porcelain=v1','-z','--untracked-files=all'],cwd=M,capture_output=True,check=True).stdout==base_status
assert git('rev-parse','HEAD').strip()==base['mainBefore']['HEAD']
changed=[e for e in files.values() if e['action']!='reuse-existing-main-byte-exact']
manifest={'schemaVersion':1,'role':'Prepared portable exact-current439 integration plan, not applied',
 'preparedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'mainRoot':str(M),'mainHEAD':git('rev-parse','HEAD').strip(),
 'mainGitStatusBefore':git('status','--porcelain=v1','--untracked-files=no'),'mainGitFullStatusBefore':base['mainBefore']['status'],'sourceCurrentCentralConfigSha256':'ab71b7955ddfedca35dba08afcb9b3e6f05e911d8a8d33904d158b94adb9bf6c',
 'files':sorted(files.values(),key=lambda e:e['logicalPath']),'changedFileCount':len(changed),'changedPayloadBytes':sum(e['bytes'] for e in changed),
 'reusedExistingMainFileCount':len(files)-len(changed),'protectedMainCanonicalFiles':protected,'otherGlobalSubjectsObjectExact':True,
 'sourceGuards':list(guards.values()),'sourceGuardsUnchanged':True,'historicalScientificBytesRewritten':False,
 'newScienceOrHumanApproval':False,'MainMutated':False,'KMutated':False,'fullGateOrBuildRun':False,
 'activationOnlyOnExplicitOwnerApply':True,'basePlan':pin(base_path),'basePayloadPins':pin(A/'BASE.payload-pins.json'),'baseOriginalSourceGuards':base['sourceGuards'],'actualMachineProof':proof,
 'portableSidecars':identity_paths+[material_rel,mapping_rel,card_rel],
 'technicalOverlays':technical_overlays,'blockingApplyPrerequisites':base.get('blockers',[]),
 'ownerPrerequisites':['Main application remains a separate explicit Root operation.','Root authorized bounded BookSEM2, BY54 metadata and three reviewed-source successors; these are staged exactly in this payload only, with original whole-byte archives and no K/Main edits.','Current80 ledger science remains exact; actual paired proof and all Main-only tmp partners are copied to committable sidecars, with no new science or approval.','Two historical b008 groups have complete native operational chains but no located original material bundle; preserve the explicit audit limitation without fabricating PDFs or reviews.'],
 'plannedPostApplyWork':['Owner runs normal schema/symlink checks and required current-config gates.','Generate current quality status and protect other-subject maturity floors.','Run registered book/source-input build/check gates after exact metadata binding decisions.','Review exact Git diff, commit/push only under separately provided authorization.']}
out=O/'MANIFEST.current439-portable-apply-plan.json';assert not out.exists();out.write_text(json.dumps(manifest,indent=2)+'\n')
for p in [out]:p.chmod(0o444)
print(json.dumps({'manifest':pin(out),'uniqueFileCount':len(files),'changedFileCount':len(changed),'changedPayloadBytes':manifest['changedPayloadBytes'],'reusedMainFiles':manifest['reusedExistingMainFileCount'],'MainMutated':False,'KMutated':False}))
