from pathlib import Path
from datetime import datetime,timezone
import json,copy,hashlib,shutil
ROOT=Path.cwd().resolve();REL=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-acids-soaps-preservatives-twenty-current-candidate-v1');OWN=ROOT/REL;ISO=ROOT/'tmp/chemie-q1-acids-soaps-preservatives-twenty-native-isolated-20261005-v1'
def read(p):return json.loads(Path(p).read_text())
def sha(p):return 'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest()
def write(p,v):
 p=Path(p);p.parent.mkdir(parents=True,exist_ok=True)
 if p.is_symlink():p.unlink()
 assert not p.is_symlink();p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def put(rel,v):write(OWN/rel,v);write(ISO/REL/rel,v)
author=read(OWN/'twenty-scientific-author-judgments.candidate.json')['rows'];ready=[r for r in author if not r['openSourceOrSemanticActions']];ids=[r['goalId'] for r in ready];assert len(ids)==14
canpath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';original=read(ROOT/canpath);canonical=read(ISO/canpath);assert canonical==original,'Review the current adopted B014 baseline; do not rollback'
baseReceiptPath='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b014-five-prospective-book-current-v1/prepared-prospective-input-tree.receipt.json';base=read(ROOT/baseReceiptPath)
assert all(sha(ROOT/r['futureActivePath'])==r['sha256'] for r in base['files']),'B01469 inputs drifted; inspect'
write(OWN/'operative-b01469-base-verified.actual.receipt.json',{'observedAtUTC':datetime.now(timezone.utc).isoformat(),'receiptPath':baseReceiptPath,'all69CurrentOperativeFilesMatchPreparedFutureBytes':True,'files':base['files'],'currentCanonicalSHA256':sha(ROOT/canpath),'rootB014AandMLaterCorrectionsPreservedBelow':True,'activeWrites':0})
gmap={g['id']:g for g in canonical['goals']}
hepath='curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_CHEMIE_SEKII_KC2024.source-extraction.json';he=read(ISO/hepath);hm={g['id']:g for g in he['sourceGoals']}
by='curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/DE_BY_CHEMIE_GYMNASIUM_LEHRPLANPLUS.source-extraction.json';bys=read(ISO/by)
bindings={
 'a3788e40':['he-chem-sekii-q1-3-b01-a02-964ee2a4','he-chem-sekii-q1-3-b01-a03-391dbe4d','he-chem-sekii-q1-3-b01-a04-0bca2a93'],
 'ca216bc6':['he-chem-sekii-q1-3-b02-a01-16db9321'],
 '70b34ae7':['he-chem-sekii-q1-3-b04-a01-d23d5886'],
 '667bc303':['he-chem-sekii-q1-3-b05-a01-7525b4c3'],
 '4da0839d':['he-chem-sekii-q1-3-b06-a01-6970d349'],
 '9d97f628':['he-chem-sekii-q2-1-b15-a01-080a672c'],
 '6765f741':['he-chem-sekii-q1-4-b01-a01-08ad699c'],
 '6966df95':['he-chem-sekii-q1-4-b02-a01-154901cc','he-chem-sekii-q1-4-b03-a01-38a5c7d9'],
 '1837690e':['he-chem-sekii-q1-4-b03-a01-38a5c7d9'],
 '8a491e3b':['he-chem-sekii-q1-4-b04-a01-2e5359ea'],
 'e9ea1606':['he-chem-sekii-q4-3-b03-a01-ce0a340b','he-chem-sekii-q4-3-b05-a01-9a22c5dd'],
 '33e845cc':['he-chem-sekii-q1-5-b01-a01-88fb9066'],
 'db66635f':['he-chem-sekii-q1-5-b02-a01-bd10754f']}
deltas=[]
for row in ready:
 i=row['goalId'];g=gmap[i];before=copy.deepcopy(g)
 for field in row['changedScientificFields']:g[field]=row['afterScientificText'][field]
 if i[:8] in bindings:
  sid=bindings[i[:8]][0];old=g['extendedData']['provenance'];history=copy.deepcopy(old)
  g['extendedData']['provenance']={'sourceLandscapeId':he['sourceLandscapeId'],'sourceLandscapeTitle':he['title'],'sourceGoalId':sid,'sourceExtractionPath':hepath,'sourceExtractionSHA256':sha(ISO/hepath),'sourceSpan':hm[sid]['sourceSpan'],'sourceDocumentEdition':'Ausgabe 2024; current official Stand 21.04.2026 independently fetched 2026-10-05','sourceBindingStatus':'ai_candidate_current_source_scope','sourceBindingRole':'own_competence_component_of_complete_source_group','sourceBindingReviewPath':str(REL/'fourteen-current-source-provenance-and-complete-group-deltas.candidate.json')}
  g['extendedData']['historicalProvenanceBefore20261005Q1Candidate']=history
  g['extendedData']['currentSourceComponentBindings']=[{'sourceGoalId':s,'sourceSpan':hm[s]['sourceSpan'],'courseLevel':hm[s]['courseLevel'],'sourceText':hm[s]['sourceText'],'sourceExtractionPath':hepath,'bindingRole':'own_component_not_whole_group_approval'} for s in bindings[i[:8]]]
  if i.startswith('70b34'):g['extendedData']['currentSourceComponentBindings'].append({'sourceGoalId':'fb4e484f-8706-5617-8ee7-19874a83bea7','sourceExtractionPath':by,'sourceSpan':'C10-HG_SG_MUG_WWG_SWG.6.3 / C10-NTG.4.1','courseLevel':'unspecified','stage':'SekI','bindingRole':'actual_whole_observation_property_operator'})
 deltas.append({'goalId':i,'before':before,'after':copy.deepcopy(g),'changedFields':[k for k in g if before.get(k)!=g[k]],'changedScientificFields':row['changedScientificFields'],'scientificAuthorJudgmentPath':str(REL/'twenty-scientific-author-judgments.candidate.json'),'sourceStatus':'candidate_own_scope_only_not_global217_group_approval'})
assert len(canonical['goals'])==473 and all(g==gmap[g['id']] for g in original['goals'] if g['id'] not in ids)
write(ISO/canpath,canonical);write(OWN/'prospective-fourteen.canonical.snapshot.json',canonical)
put('fourteen-current-source-provenance-and-complete-group-deltas.candidate.json',{'authority':'informed_author_candidate','rows':deltas,'goalIds':ids,'all459OtherCanonicalGoalObjectsUnchanged':True,'sixHOLDGoalObjectsUnchangedInIsolatedOperativeCandidate':True,'strictNetDelta':0,'activeWrites':0})

# Correct only genuine current HE misroutes; all source text/bytes remain intact.
atlaspath='app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json';atlas=read(ISO/atlaspath);oldmap=next(p for p in atlas['mappingPaths'] if '/DE-HE/upper-secondary/' in p);mapping=read(ISO/oldmap);old=copy.deepcopy(mapping)
newmap='curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.m7-q1-fourteen-current-20261005-v1.review.json'
groups={
 'he-chem-sekii-q1-3-b01-a01-638d117f':([('e14abd24-a0e5-5ab5-ade3-a8ae4f49e935','exact')],'Nomenclature is carried by the actual current IUPAC atom, not recognition-only a378. Existing e14 competence remains unchanged and unclosed.'),
 'he-chem-sekii-q1-3-b01-a05-4c835e1f':([('5a30273a-98d5-5163-bb16-c250b7ed4e7f','partial')],'Molecular melting/boiling/solubility explanation is carried by the current intermolecular-property atom in a provided carboxylic-acid case. a378 does not falsely certify property reasoning; 5a remains unclosed.'),
 'he-chem-sekii-q1-3-b04-a01-d23d5886':([('70b34ae7-4481-590c-9a02-516464750832','partial'),('98ae3f8e-4800-5ff3-bd2c-89434c006143','partial')],'Formation/condensation plus the existing mechanism carrier are retained. Ester naming/structural-representation component and the existing mechanism-carrier prerequisite route have concrete separate candidate remedies below and remain HOLD; this group is not claimed completely resolved.'),
 'he-chem-sekii-q1-3-b06-a01-6970d349':([('4da0839d-ab6d-53c1-ac21-c9872555ae16','exact')],'The current LK alkaline-hydrolysis mechanism belongs to the existing unchanged4da mechanism atom, not the general667 reaction interpretation.'),
 'he-chem-sekii-q1-3-b07-a01-0a9a9589':([('bd36dc58-c93e-5247-9e82-da2f9e4e2bed','exact')],'Di/tricarboxylic structure remains the exact existing closedbd36 atom. Excludes false inherited mechanism evidence for4da; the closedbd36 goal object/scientific text is unchanged.'),
 'he-chem-sekii-q1-4-b02-a01-154901cc':([('6966df95-f125-5ecc-af8e-0442545d9f17','partial'),('1c1420c2-a8e2-520f-8015-6df637a973bd','partial')],'Amphiphilic interface/emulsion/surface-tension properties remain6966. Soap carboxylate/water proton-transfer context uses current existing Brønsted atom1c with provided dissociation/model data; no new weak-base quantitative procedure or current1c closure is claimed.'),
 'he-chem-sekii-q1-5-b02-a01-bd10754f':([('db66635f-f1d1-5f70-bcc0-fed1ae424e52','exact')],'Qualitative ascorbic antioxidant lab evidence is the existing clarifieddb666 atom, not a preservation-method-comparison atom. This exact route does not certify redoxtransfer10 or ascorbic quantitative analysis.')
}
records=[]
for sid,(targets,why) in groups.items():
 prior=[m for m in mapping['mappings'] if m['legacyGoalId']==sid];assert prior
 exemplar=prior[0];mapping['mappings']=[m for m in mapping['mappings'] if m['legacyGoalId']!=sid]
 after=[]
 for target,match in targets:
  assert target in gmap;record={**exemplar,'canonicalGoalId':target,'matchType':match};after.append(record);mapping['mappings'].append(record)
 decision=next(d for d in mapping['decisions'] if d['sourceGoalId']==sid);prev=copy.deepcopy(decision);decision['canonicalGoalIds']=[i for i,_ in targets];decision['rationale']='Current informed author candidate: '+why+' Actual primary current HE pages39/40 and complete source group inspected; native routing validation is separate from independent D/P/V and human approval.';decision['reviewedAt']='2026-10-05';decision['reviewer']='codex-informed-q1-source-candidate'
 records.append({'sourceGoalId':sid,'actualSourceGoal':hm[sid],'beforeMappings':prior,'afterMappings':after,'beforeDecision':prev,'afterDecision':copy.deepcopy(decision),'componentPreservationAndBoundary':why})
unchanged=lambda x,key:[r for r in x[key] if r.get('legacyGoalId',r.get('sourceGoalId')) not in groups]
assert unchanged(old,'mappings')==unchanged(mapping,'mappings') and unchanged(old,'decisions')==unchanged(mapping,'decisions')
mapping['reviewId']='hessen-chemistry-upper-secondary-source-extraction-to-canonical-chemistry-m7-q1-fourteen-current-20261005-v1';write(ISO/newmap,mapping);atlas['mappingPaths']=[newmap if p==oldmap else p for p in atlas['mappingPaths']];write(ISO/atlaspath,atlas)
put('seven-bounded-he-source-group-before-after.candidate.json',{'authority':'informed_author_candidate','beforeMappingPath':oldmap,'futureActiveMappingPath':newmap,'rows':records,'allOtherHEMappingsAndDecisionsUnchanged':True,'allOther31MappingFilesUnchanged':True,'allCurrentSourceExtractionBytesUnchanged':True,'unresolvedCompanionAndSupplementCasesNotCertified':True,'strictNetDelta':0,'activeWrites':0})

# New authored A decisions only for seven genuinely changed scientific records.
changed={r['goalId'] for r in ready if r['changedScientificFields']};assert len(changed)==7
replacementA=[]
for cluster in ['acids-derivatives','soaps','preservatives']:
 configpath=f'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-chemistry-q1-{cluster}.config.json';cfg=read(ROOT/configpath);records=[json.loads(s) for s in (ROOT/cfg['reviewPath']).read_text().splitlines() if s.strip()]
 for record in records:
  if record['goalId'] in changed:
   row=next(r for r in ready if r['goalId']==record['goalId']);record.update({'reviewedAt':'2026-10-05','reviewer':'codex-informed-q1-semantic-author','reason':row['findingsAndResolution'],'status':'atomic','semanticAtomic':True,'suggestedSplit':[]})
 rel=REL/f'native-a-{cluster}.review.jsonl';cfg['reviewPath']=str(rel);cfg['reportPath']=str(REL/f'native-a-{cluster}.report.md')
 for base in [ROOT,ISO]:
  p=base/rel;p.parent.mkdir(parents=True,exist_ok=True)
  if p.is_symlink():p.unlink()
  p.write_text(''.join(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n' for r in records))
 put(f'native-a-{cluster}.config.json',cfg);replacementA.append(str(REL/f'native-a-{cluster}.config.json'))
registry=read(ROOT/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json');chem=next(s for s in registry['subjects'] if s['subject']=='chemie');mpath=chem['memoryReviewConfigPath'];assert '/chemie-b014-five-current-20261005-v1/' in mpath;mcfg=read(ROOT/mpath);originalM=[json.loads(s) for s in (ROOT/mcfg['reviewPath']).read_text().splitlines() if s.strip()];assert len(originalM)==376
for record in originalM:
 if record['goalId'] in changed:
  row=next(r for r in ready if r['goalId']==record['goalId']);assert record['status']=='no_memory_needed';record.update({'reviewedAt':'2026-10-05','reviewer':'codex-informed-q1-memory-author','reason':row['memoryReason']+' Specific scope: '+row['findingsAndResolution']})
mcfg['reviewPath']=str(REL/'native-m-full.review.jsonl');mcfg['reportPath']=str(REL/'native-m-full.report.md');put('native-m-full.config.json',mcfg)
cardcopy=ISO/mcfg['cardReviewPath']
if cardcopy.is_symlink():cardcopy.unlink();shutil.copy2(ROOT/mcfg['cardReviewPath'],cardcopy)
assert not cardcopy.is_symlink(),'Native --write-fingerprints always writes the card ledger as well'
for base in [ROOT,ISO]:
 p=base/REL/'native-m-full.review.jsonl'
 if p.is_symlink():p.unlink()
 p.write_text(''.join(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n' for r in originalM))
put('a-m-substantive-judgments-before-fingerprint-binding.receipt.json',{'authority':'informed_author_candidate','actualJudgmentsWrittenBeforeNativeFingerprintMaterialization':True,'changedScienceGoalIds':sorted(changed),'nativeReplacementAConfigs':replacementA,'latest376MemoryBaselineConfigPath':mpath,'latest376MemoryBaselineReviewSHA256':sha(ROOT/read(ROOT/mpath)['reviewPath']),'latestB014ThreeRecordsPreserved':True,'all369OtherMRecordsRetainedBeforeBinding':True,'noNewMemoryGoalOrDeckCards':True,'cardReviewPathUnchanged':mcfg['cardReviewPath'],'visibilityScopesUnchanged':mcfg['visibilityScopes'],'heldSixOriginalGoalObjectsAndAandMRecordsUnchanged':True,'strictNetDelta':0,'activeWrites':0})
print(json.dumps({'preparedScientificCandidates':14,'scientificChanges':7,'metadataProvenanceChanges':13,'boundedHEGroups':7,'nativeMBase':376,'sixHOLDUnchanged':True,'strictNetDelta':0,'activeWrites':0}))
