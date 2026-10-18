# SPDX-License-Identifier: Apache-2.0
"""Check only four SN goal/profile bindings, six source units and seven append tuples."""
from pathlib import Path
import hashlib,importlib.util,json,re,subprocess
R=Path.cwd();O=Path(__file__).resolve().parent.parent;A=O.parent/'chemie-current450-SN-four-held-process-source-author-successor-20261018-v1';OLD=O.parent/'chemie-current450-six-process-remaining-states-direct-source-informed-independent-a-20261018-v1'
read=lambda p:json.loads(Path(p).read_text())
def pin(p):
 p=Path(p);b=p.read_bytes();return {'path':p.resolve().relative_to(R).as_posix(),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verify(p):assert pin(p['path'])==p,p

def digest(x):return hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def norm(s):return re.sub(r'\s+',' ',re.sub(r'(?<=\w)-\s*\n\s*(?=\w)','',s)).strip()
seal=A/'SEAL.inactive-SN4-author-successor.json';assert pin(seal)['sha256']=='d7b8f5dbd223f8c46d7ddef003d6fc8b971ef8a522ac3640e91d930895e3a250'
for p in read(seal)['files']:verify(p)
prior=OLD/'FIRST.independent-a.sixty-source-pairs-and-seventy-eight-partial-relations.json';assert pin(prior)['sha256']=='a327abf047cc239bf8c8e96c3821d635b9ad95a253617612474b9461c754c7a9'
oldInput=read(O.parent/'chemie-current450-six-process-remaining-states-direct-source-author-20261018-v1/INPUT.six-whole-current-goals-and-P.exact.json');old={w['wholeGoal']['id']:w for w in oldInput};held={x['goalId']:x for x in read(prior)['pairDecisions'] if x['jurisdiction']=='DE-SN' and x['decision']=='HOLD'};assert len(held)==4
w=read(A/'INPUT.four-whole-actual-current-C-and-native-P.json');rows=read(A/'AUTHOR.four-SN-pairs-seven-bounded-partial-contributions.INACTIVE.json')['rows'];cpath=Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json');C={g['id']:g for g in read(cpath)['goals']};reg=Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json');subject=next(s for s in read(reg)['subjects'] if s['subject']=='chemie');cp=[]
for x in w:
 gid=x['goalId'];assert gid in held;assert C[gid]==x['wholeCurrentGoal']==old[gid]['wholeGoal'];native=json.loads(Path(x['reviewPath']).read_text().splitlines()[x['lineOneBased']-1]);assert native==x['wholeCurrentNativeRecord'];assert native['profile']==old[gid]['wholeProfile'];cfg=read(x['currentConfigPath']);assert x['currentConfigPath'] in subject['positiveEvidenceConfigPaths'];assert gid in cfg['scope']['goalIds'] and cfg['reviewPath']==x['reviewPath'];r=next(v for v in rows if v['goalId']==gid);assert r['wholeCurrentGoal']==C[gid] and r['wholeCurrentNativeProfile']==native['profile'];assert digest(C[gid])==r['currentGoalSha256']==held[gid]['wholeCurrentGoalSha256'];assert digest(native['profile'])==r['currentProfileBodySha256']==held[gid]['wholeCurrentProfileSha256'];cp.append({'goalId':gid,'wholeCExactlyUnchangedSinceOwnFirstReading':True,'wholePExactlyUnchangedSinceOwnFirstReading':True,'wholeGoalSha256':digest(C[gid]),'wholeProfileSha256':digest(native['profile']),'activeConfig':pin(x['currentConfigPath']),'nativeReview':pin(x['reviewPath']),'lineOneBased':x['lineOneBased']})
assert len(cp)==4
add=read(A/'candidate/SN.six-complete-general-competence-cells.additions.INACTIVE.json');verify(add['sourceDocumentPin']);pdf=add['sourceDocumentPin']['path'];pages={n:subprocess.check_output(['pdftotext','-f',str(n),'-l',str(n),'-layout',pdf,'-']).decode() for n in (4,7,12,13,14)};cells=add['sourceGoalsToAppend'];assert len(cells)==6;byId={x['id']:x for x in cells};assert len(byId)==6;literal=[]
for x in cells:
 n=x['metadata']['physicalPdfPage'];assert norm(x['sourceText']) in norm(pages[n]),x['id'];assert x['sourceText']==x['description'];assert x['courseLevel']=='unspecified' and x['metadata']['officiallyNumbered'] is False;assert x['metadata']['sourceTextIsWholeSelectedUnit'];literal.append({'sourceGoalId':x['id'],'physicalPdfPage':n,'printedPage':x['metadata']['printedPage'],'wholeSourceGoalSha256':digest(x),'wholeSelectedUnitLiterallyMatchedAfterLineWrapNormalization':True})
for r in rows:
 for s in r['actualSelectedWholeSourceDescriptors']:assert s['wholeSourceGoal']==byId[s['sourceGoalId']]
for p in (add['baseExtraction'],add['otherCurrentSameDocumentExtraction']):verify(p)
base=read(add['baseExtraction']['path']);assert len(base['sourceGoals'])==177;assert not set(byId).intersection(x['id'] for x in base['sourceGoals']);assert all(x['sourceDocumentKey']=='SN-CH-2025' for x in cells);upper=read(add['otherCurrentSameDocumentExtraction']['path']);assert not set(byId).intersection(x['id'] for x in upper['sourceGoals'])
maps=read(A/'candidate/SEVEN.partial-mapping-contributions.INACTIVE.json')['mappings'];assert len(maps)==7;tuples={(m['legacyGoalId'],m['canonicalGoalId'],m['matchType']) for m in maps};assert len(tuples)==7
for m in maps:
 assert m['matchType']=='partial' and not m['wholeSourceCredit'] and not m['actualLearnerExecutionClaim'];assert m['legacyGoalId'] in byId and m['canonicalGoalId'] in held
aliases=[]
for item in read(A/'BEFORE.finite-current-source-C-P-and-normal-alias-pins.json')['normalMappingAliasPins']:
 p=item['path'];d=read(p);existing={(m['legacyGoalId'],m['canonicalGoalId'],m['matchType']) for m in d['mappings']};assert not tuples.intersection(existing)
 aliases.append({'currentPin':pin(p),'authorPinUnchanged':pin(p)==item,'selectedNewTupleCountCurrentlyPresent':len(tuples.intersection(existing)),'operativeForProposedLowerFoundationInventory':p.endswith(('sn_chemistry_lower_secondary_to_canonical_chemistry.json','sn_chemistry_lower_secondary_source_extraction_to_canonical_chemistry.review.json'))})
materials=read(A/'INPUT.eight-whole-existing-teaching-cases.read-only.json')['cases'];assert len(materials)==8
for m in materials:
 verify(m['sourceFile']);v=read(m['sourceFile']['path'])
 for part in m['jsonPointer'].strip('/').split('/'):v=v[int(part)] if isinstance(v,list) else v[part]
 assert v==m['wholeMaterial']
research=read(A/'INPUT.actual-own-research-material-locators-and-boundary.json')
for k in ('routeInstructions','blankResearchRecord'):verify(research[k])
spec=importlib.util.spec_from_file_location('validate_schemas',R/'scripts/validate_schemas.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod);allErrors=mod.curriculum_symlink_errors(R);ownErrors=[e for e in allErrors if O.relative_to(R).as_posix() in e];assert not ownErrors
out={'status':'PASS','scope':'Exactly four SN pairs/six new whole source units/seven bounded partial relations; no broad evaluator','authorSeal':pin(seal),'authorMatrix':pin(A/'AUTHOR.four-SN-pairs-seven-bounded-partial-contributions.INACTIVE.json'),'historicalOwnFirstRetained':pin(prior),'historicalOwnReadingReceipt':pin(OLD/'RECEIPT.actual-independent-reads-and-execution.json'),'fourActiveExactWholeCAndP':cp,'wholePrimaryUnits':literal,'primaryPdf':add['sourceDocumentPin'],'actualWholePrimaryPagesRead':[4,7,12,13,14],'currentSourceInventories':[{'pin':pin(add['baseExtraction']['path']),'wholeSourceGoals':177,'proposedAppendOnlyCount':6},{'pin':pin(add['otherCurrentSameDocumentExtraction']['path']),'wholeSourceGoals':302,'proposedAppendOnlyCount':0}],'currentAliases':aliases,'wholeExistingMaterialObjectsVerified':8,'wholeConditionalResearchFilesVerified':2,'actualGlobalStockSymlinkErrorCount':len(allErrors),'ownScopedStockSymlinkErrors':ownErrors,'currentCentralConfigPin':pin(reg),'normalWrites':0,'newDPAMVVotes':0,'compilerAPBuildOrWholeChecks':0}
print(json.dumps(out,ensure_ascii=False,indent=2))
