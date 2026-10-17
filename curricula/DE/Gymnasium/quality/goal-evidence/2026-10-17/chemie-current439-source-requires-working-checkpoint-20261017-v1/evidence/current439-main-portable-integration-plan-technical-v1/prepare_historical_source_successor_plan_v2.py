"""Prepare a separate corrected plan. Never write Main/K or edit a frozen source/review."""
from pathlib import Path
import copy,datetime,hashlib,json,os,stat,subprocess
O=Path(__file__).resolve().parent;M=Path('/home/enpasos/projects/skillpilot');K=O.parent/'current439-remediation14-guarded-root-integration-technical-v1/capsule'
Q='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-portable-integration-technical-v1'
def load(p):return json.loads(Path(p).read_text())
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def pin(p):return {'path':str(p),'sha256':sha(p),'bytes':Path(p).stat().st_size}
base=load(O/'MANIFEST.current439-portable-apply-plan.json');assert sha(O/'MANIFEST.current439-portable-apply-plan.json')=='39d5c9e6ee89ac2e85174b3aef1ed54a70119ad3f6b6156e114968e48d938669'
manifest=copy.deepcopy(base);files={e['logicalPath']:e for e in manifest['files']};sources=[];guards=[]
def staged_path(entry):return O/entry['payloadRelativePath'] if entry['action']!='reuse-existing-main-byte-exact' else M/entry['logicalPath']
def before(rel):
 p=M/rel
 if not p.exists():assert not p.is_symlink();return {'kind':'absent'}
 return {'kind':'file','sha256':sha(p),'bytes':p.stat().st_size,'isSymlink':p.is_symlink(),'linkTarget':os.readlink(p) if p.is_symlink() else None}
def put_bytes(rel,data,role,origin):
 path=O/'payload-v2'/rel;path.parent.mkdir(parents=True,exist_ok=True)
 assert not path.exists();path.write_bytes(data);v=pin(path);b=before(rel)
 files[rel]={'logicalPath':rel,'sha256':v['sha256'],'bytes':v['bytes'],'roles':[role], 'action':'materialize-regular-exact-file','payloadRelativePath':str(path.relative_to(O)),'gitMode':0o644,'mainBefore':b,'sourceAbsolutePath':str(origin)}
 return rel

def stable(x):return json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':'))
pairs=[
 ('BW','curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-q3-three-BW-source-adoption-technical-successor-20261010-v1/sources/whole-BW126-original-operative-document-contract.exact.json','curricula/DE/Gymnasium/mapping/DE-BW/upper-secondary/bw_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json'),
 ('NW','curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/chemie-b007-targeted-scoring-source-binding-author-successor-20261011-v7/candidate/source-extraction-successors/DE_NW_CHEMIE_SEKI_KLP2019.source-extraction.json','curricula/DE/Gymnasium/mapping/DE-NW/lower-secondary/nrw_chemistry_lower_secondary_source_extraction_to_canonical_chemistry.b007-normal-source-scope-20261011-v1.review.json')]
# Original preparatory map is additive, uncommitted technical data; its own frozen v1 bytes stay in O.
map_rel=Q+'/PORTABILITY.original-local-references-to-exact-repo-partners.json';locmap=load(staged_path(files[map_rel]))
for jurisdiction,source_rel,mapping_rel in pairs:
 current_source=copy.deepcopy(files[source_rel]);current_mapping=copy.deepcopy(files[mapping_rel]);old_main=before(source_rel)
 assert old_main['kind']=='file' and old_main['sha256']!=current_source['sha256']
 source_successor=Q+'/current-source-successors/'+jurisdiction+'.whole-source-current-byteexact.'+current_source['sha256']+'.json'
 successor=copy.deepcopy(current_source);successor.update(logicalPath=source_successor,mainBefore=before(source_successor),roles=['additive-byteexact-current-source-successor-preserving-original-history']);files[source_successor]=successor
 # The original historical path now reuses the exact pre-existing Main file.
 restored=copy.deepcopy(current_source);restored.update(sha256=old_main['sha256'],bytes=old_main['bytes'],roles=['immutable-original-historical-scientific-source-preserved'],action='reuse-existing-main-byte-exact',mainBefore=old_main,sourceAbsolutePath=str(M/source_rel));restored.pop('payloadRelativePath',None);files[source_rel]=restored
 guards.extend([pin(M/source_rel),pin(K/source_rel)])
 # Retain the whole original current mapping body before its purely locational successor.
 mapping_archive=Q+'/current-source-successors/original-current-mapping-byte-archives/'+current_mapping['sha256']+'/'+Path(mapping_rel).name
 archived=copy.deepcopy(current_mapping);archived.update(logicalPath=mapping_archive,mainBefore=before(mapping_archive),roles=['immutable-current-mapping-body-before-technical-locator-successor']);files[mapping_archive]=archived
 mapping=load(staged_path(current_mapping));assert mapping['sourceExtractionPath']==source_rel
 new_mapping=copy.deepcopy(mapping);new_mapping['sourceExtractionPath']=source_successor
 assert stable(mapping.get('decisions'))==stable(new_mapping.get('decisions'))
 assert stable(mapping.get('mappings'))==stable(new_mapping.get('mappings'))
 assert {k:v for k,v in mapping.items() if k!='sourceExtractionPath'}=={k:v for k,v in new_mapping.items() if k!='sourceExtractionPath'}
 put_bytes(mapping_rel,(json.dumps(new_mapping,ensure_ascii=False,indent=2)+'\n').encode(),'current-operative-mapping-source-location-only-successor',staged_path(current_mapping))
 for row in locmap['references']:
  if row['portableRepoPath']==source_rel and row['sha256']==current_source['sha256']:row['portableRepoPath']=source_successor
  if row['portableRepoPath']==mapping_rel and row['sha256']==current_mapping['sha256']:row['portableRepoPath']=mapping_archive
 locmap['references'].extend([
  {'originalPath':str(K/source_rel),'sha256':current_source['sha256'],'bytes':current_source['bytes'],'portableRepoPath':source_successor,'role':'exact-current-source-successor-preserving-original-historical-path','originalBytesRewritten':False},
  {'originalPath':str(K/mapping_rel),'sha256':current_mapping['sha256'],'bytes':current_mapping['bytes'],'portableRepoPath':mapping_archive,'role':'whole-current-mapping-before-technical-path-successor','originalBytesRewritten':False}])
 sources.append({'jurisdiction':jurisdiction,'originalHistoricalRepoPath':source_rel,'originalMainBytePin':old_main,'exactCurrentSourceSuccessorRepoPath':source_successor,'exactCurrentSourceSha256':current_source['sha256'],'exactCurrentSourceBytes':current_source['bytes'],'operativeMappingRepoPath':mapping_rel,'operativeMappingOriginalByteArchiveRepoPath':mapping_archive,'operativeMappingAfterSha256':files[mapping_rel]['sha256'],'onlyMappingJsonPointerChanged':'/sourceExtractionPath','mappingDecisionsMappingsAndAllOtherFieldsUnchanged':True,'newScientificJudgments':False})
for row in locmap['references']:
 entry=files[row['portableRepoPath']];assert entry['sha256']==row['sha256'] and entry['bytes']==row['bytes'],row
put_bytes(map_rel,(json.dumps(locmap,ensure_ascii=False,indent=2)+'\n').encode(),'additive-original-path-hash-to-correct-portable-successor-map',O/'MANIFEST.current439-portable-apply-plan.json')
# Current actual registry selects no canonical binding audits; do not invent locator/review rows.
global_rel='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';g=load(staged_path(files[global_rel]));chem=next(s for s in g['subjects'] if s['subject']=='chemie')
assert not chem.get('currentCanonicalBindingAuditPaths') and not chem.get('currentCanonicalBindingAuditGoalIds')
# Normal source atlas still selects the same two operative mapping reviews.
normal=load(staged_path(files['app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json']))
assert normal['mappingPaths'][5]==pairs[0][2] and normal['mappingPaths'][18]==pairs[1][2]
sidecar={'role':'Additive technical current-source location successor; no scientific bodies or votes changed','preparedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'pairs':sources,'selectedCurrentCanonicalBindingAuditPaths':[],'originalHistoricalSourceFilesPreservedAtExactMainPaths':True,'currentSourceBodiesByteExactK':True,'normalAtlasMappingSelectorPathsUnchanged':True,'oldSourceProjectionReceiptUnchangedHistoricalOutput':True,'current12OriginalMaterialProofPending':True,'MainMutated':False,'KMutated':False}
sidecar_rel=Q+'/PORTABILITY.two-historical-source-partners.current-successors-v2.json';put_bytes(sidecar_rel,(json.dumps(sidecar,ensure_ascii=False,indent=2)+'\n').encode(),'actual-two-historical-source-preserving-technical-successor-binding',Path(__file__))
for v in guards:assert pin(v['path'])==v
assert subprocess.run(['git','--no-optional-locks','status','--porcelain=v1','--untracked-files=no'],cwd=M,capture_output=True,text=True,check=True).stdout==base['mainGitStatusBefore']
changed=[e for e in files.values() if e['action']!='reuse-existing-main-byte-exact']
manifest.update(role='Prepared current439 successor integration plan; blocked pending current12 evidence restoration',preparedAtUTC=datetime.datetime.now(datetime.timezone.utc).isoformat(),files=sorted(files.values(),key=lambda e:e['logicalPath']),changedFileCount=len(changed),changedPayloadBytes=sum(e['bytes'] for e in changed),reusedExistingMainFileCount=len(files)-len(changed),supersededUnsafePreparedPlan=pin(O/'MANIFEST.current439-portable-apply-plan.json'),historicalScientificBytesRewritten=False,historicalTwoSourcesPreservedAtOriginalMainPaths=True,sourcePartnerLocationSuccessors=sources,sourcePartnerLocationGuardPins=guards,blockingApplyPrerequisites=['Current12 terminal b008 evidence restoration must be completed/bound or owner must document exact proof of whole original material availability.'],current12ProofGapExplicit=True,portableSidecars=base['portableSidecars']+[sidecar_rel])
manifest['ownerPrerequisites']=[v for v in manifest['ownerPrerequisites'] if not v.startswith('Two historical b008 groups')]+['The two old b008 groups still own12 current terminal goals. Original inline pages/P/context exist; original rendered book containers are not located. A new frozen current12 independent evidence restoration is being prepared; this plan does not activate before proof closure.']
p=O/'MANIFEST.current439-portable-apply-plan.historical-source-successor-v2.json';assert not p.exists();p.write_text(json.dumps(manifest,indent=2)+'\n');p.chmod(0o444)
print(json.dumps({'manifest':pin(p),'uniqueFiles':len(files),'writeFiles':len(changed),'writeBytes':manifest['changedPayloadBytes'],'reusedMain':manifest['reusedExistingMainFileCount'],'blockingApplyPrerequisites':manifest['blockingApplyPrerequisites'],'MainMutated':False,'KMutated':False}))
