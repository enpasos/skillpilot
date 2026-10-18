# SPDX-License-Identifier: Apache-2.0
"""Selected NI/SL lower mapping CAS only; preserve every preexisting source object/tail."""
import pathlib,json,hashlib,copy,datetime,importlib.util
R=pathlib.Path.cwd();O=pathlib.Path(__file__).resolve().parent.parent;N=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18');A=N/'chemie-current450-NI-SL-three-conditional-profile-source-author-successor-20261018-v2';B=N/'chemie-current450-NI-SL-three-conditional-contexts-informed-independent-b-20261018-v1';C=pathlib.Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
def J(p):return json.loads(pathlib.Path(p).read_text())
def H(b):return hashlib.sha256(b).hexdigest()
def D(x):return H(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode())
def pin(p):p=pathlib.Path(p);b=p.read_bytes();return {'path':str(p.relative_to(R) if p.is_absolute() else p),'sha256':H(b),'bytes':len(b)}
def verify(x):assert pin(x['path'])==x

def put(n,x):p=O/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return pin(p)
assert not (O/'RECEIPT.actual-three-P-source-relations-normal-integrated.json').exists()
for s in [A/'SEAL.inactive-three-conditional-profile-source-author-successor.json',B/'SEAL.own-informed-three-conditional-context-review.json']:
 for f in J(s)['files']:verify(f)
assert pin(B/'FIRST.actual-v2-three-conditional-whole-P-atomicity-and-source.informed-independent-b.json')['sha256']=='61e47477e31b5b8279f87a8b7f996796346c06051aef2678c20e4529ba6e2c39'
a=J(A/'AUTHOR.three-whole-current-profile-source-successors.inactive.json');science=J(B/'FIRST.actual-v2-three-conditional-whole-P-atomicity-and-source.informed-independent-b.json');firstpin=pin(B/'FIRST.actual-v2-three-conditional-whole-P-atomicity-and-source.informed-independent-b.json');central=J(C);chem=next(x for x in central['subjects'] if x['subject']=='chemie');assert len(chem['positiveEvidenceConfigPaths'])==138;canon=J(chem['landscapePath']);cg={g['id']:g for g in canon['goals']};native={}
for c in chem['positiveEvidenceConfigPaths']:
 cfg=J(c)
 for line in pathlib.Path(cfg['reviewPath']).read_text().splitlines():
  if line.strip():
   r=json.loads(line)
   if r['goalId'] in [x['goalId'] for x in a['records']]:assert r['goalId'] not in native;native[r['goalId']]={'config':pin(c),'review':pin(cfg['reviewPath']),'record':r}
assert len(native)==3
writepaths=sorted({x['file']['path'] for r in a['records'] for x in r['selectedAliases']});assert len(writepaths)==4
assert all(('/mapping/DE-NI/lower-secondary/'in p or '/mapping/DE-SL/lower-secondary/'in p) for p in writepaths)
before={p:pathlib.Path(p).read_bytes() for p in writepaths};original={p:json.loads(before[p]) for p in writepaths};after=copy.deepcopy(original);selected={p:set() for p in writepaths};contributions=[];protected={str(C):pin(C),chem['landscapePath']:pin(chem['landscapePath']),chem['semanticKindLedgerPath']:pin(chem['semanticKindLedgerPath']),chem['visualizationQaPath']:pin(chem['visualizationQaPath'])}
for cfg in native.values():protected[cfg['config']['path']]=cfg['config'];protected[cfg['review']['path']]=cfg['review']
remainingDe=[
 'Keine pH-Logarithmusrechnung, Messung, eigene Versuchsdurchführung oder benachbarte qualitative Nachweisexperimente; keine ganze NI-Quelle oder neunstoffige amtliche Vollpflicht.',
 'Nur Vermeidung unnötig zusätzlich kupferbelasteten Abfallvolumens und passende lokale Risikobegründung; keine Behauptung geringeren Gesamtmüllvolumens, sicherer Lösemittelwahl, aller Green-Chemistry-Prinzipien oder tatsächlich freigegebener Entsorgung.',
 'Nur Deutung vollständig gegebener Koeffizienten/Legende und konstantes Produktmassenverhältnis; keine Formel-/Gleichungsableitung, neue Requires-Kante, gesamte Stöchiometrie oder ausgeführte Synthese.'
]
acceptedDe=[
 'Anhand der vollständig bereitgestellten qualitativen pH-Skala bei25°C wässrig sauer/neutral/alkalisch unterscheiden und mit dem jeweiligen Überwiegen von H3O+/OH− beziehungsweise Gleichheit verknüpfen; Grenzfall unbekannte Säure/trockenes Gas begründet einordnen.',
 'Bei der begründeten Auswahl örtlich vorgegebener Sammelwege ein bereitgestelltes Abfall-/Risikovermeidungsprinzip nennen und unnötige Kupferverunreinigung der bisher unbelasteten Salzfraktion vermeiden; U zur Lehrkraft zurückstellen.',
 'Die vorgegebenen FeS-Gleichungsdarstellungen1Fe+1S→1FeS und2Fe+2S→2FeS als Skalierung gleicher Stoffportionen mit56:32=112:64=168:96=7:4 deuten; Stoffindizes und Produktmenge unterscheiden, ohne eine Gleichung herzuleiten.'
]
for i,r in enumerate(a['records']):
 gid=r['goalId'];s=r['source'];sg=s['wholeCell'];ex=J(s['extraction']['path']);actual=next(x for x in ex['sourceGoals'] if x['id']==sg['id']);assert actual==sg;protected[s['extraction']['path']]=pin(s['extraction']['path']);protected[s['primaryPDF']['path']]=pin(s['primaryPDF']['path']);assert cg[gid]==r['wholeCurrentGoal'];assert native[gid]['record']['profile']==r['wholeCandidateProfile'];assert science['records'][i]['sourceVerdict']=='ACCEPT_PARTIAL'
 material=pin(A/'MATERIAL.three-complete-bilingual-source-context-cases.json');protected[material['path']]=material
 contribution={'canonicalGoalId':gid,'matchType':'partial','independentAcceptedRef':{**firstpin,'jsonPointer':f'/records/{i}'},'independentSeal':pin(B/'SEAL.own-informed-three-conditional-context-review.json'),'operativeRootAuthorSeal':pin(A/'SEAL.inactive-three-conditional-profile-source-author-successor.json'),'currentWholeGoalSHA256':D(cg[gid]),'currentWholeProfileSHA256':D(r['wholeCandidateProfile']),'actualCurrentPositiveOwner':{'config':native[gid]['config'],'review':native[gid]['review'],'goalId':gid,'profileFingerprint':native[gid]['record']['profileFingerprint']},'wholePrimaryCellSHA256':D(sg),'primaryPDF':s['primaryPDF'],'physicalPageOneBased':s['physicalPageOneBased'],'wholeBilingualMaterial':{**material,'jsonPointer':f'/cases/{i}'},'acceptedPartDe':acceptedDe[i],'acceptedPartEn':science['records'][i]['sourceSupportedPart'],'remainingDutiesDe':remainingDe[i],'remainingDutiesEn':science['records'][i]['sourceRemaining'],'wholeSourceApproval':False,'officialWholeGoalRequirementClaim':False,'actualLearnerExecutionClaim':False,'newScientificVoteByTechnicalIntegrator':False}
 assert gid not in [x.get('canonicalGoalId') for al in r['selectedAliases'] for x in after[al['file']['path']]['mappings'] if x.get('legacyGoalId')==sg['id']]
 for al in r['selectedAliases']:
  p=al['file']['path'];d=after[p];old=original[p]
  assert [x for x in old['mappings'] if x.get('legacyGoalId')==sg['id']]==al['currentSourceRows']
  assert [x for x in old.get('decisions',[]) if x.get('sourceGoalId')==sg['id']]==al['currentSourceDecisions']
  row={'legacyGoalId':sg['id'],'canonicalGoalId':gid,'matchType':'partial','reviewDecisionId':sg['id']};d['mappings'].append(row)
  ds=[(j,x) for j,x in enumerate(d.get('decisions',[])) if x.get('sourceGoalId')==sg['id']]
  if ds:
   assert len(ds)==1;j,dec=ds[0];assert dec['decision']=='mapped';assert gid not in dec['canonicalGoalIds'];dec['canonicalGoalIds'].append(gid);dec['matchType']='partial';assert not any(z.get('canonicalGoalId')==gid for z in dec.get('additionalAcceptedPartialContributions',[]));dec.setdefault('additionalAcceptedPartialContributions',[]).append(copy.deepcopy(contribution));selected[p].add(j)
 contributions.append({'goalId':gid,'jurisdiction':r['jurisdiction'],'sourceGoalId':sg['id'],'wholeCurrentSource':{'file':pin(s['extraction']['path']),'pointer':s['pointer'],'wholeObjectSHA256':D(sg)},'wholeContribution':contribution,'aliases':[x['file']['path'] for x in r['selectedAliases']]})
# Check entire arrays/tails/metadata in memory before any normal mutation.
checks=[]
for p in writepaths:
 b=original[p];d=after[p];assert d['mappings'][:len(b['mappings'])]==b['mappings'];assert len({(r['legacyGoalId'],r['canonicalGoalId']) for r in d['mappings']})==len({(r['legacyGoalId'],r['canonicalGoalId']) for r in b['mappings']})+len(d['mappings'])-len(b['mappings'])
 for k,v in b.items():
  if k not in ['mappings','decisions']:assert d[k]==v
 for j,z in enumerate(b.get('decisions',[])):
  if j not in selected[p]:assert d['decisions'][j]==z
  else:
   dz=d['decisions'][j]
   for k,v in z.items():
    if k not in ['canonicalGoalIds','matchType','additionalAcceptedPartialContributions']:assert dz[k]==v
   assert dz['canonicalGoalIds'][:len(z['canonicalGoalIds'])]==z['canonicalGoalIds'];oldc=z.get('additionalAcceptedPartialContributions',[]);assert dz['additionalAcceptedPartialContributions'][:len(oldc)]==oldc
 checks.append({'fileBefore':pin(p),'oldMappingsRetainedAsExactPrefix':len(b['mappings']),'newPartialMappings':len(d['mappings'])-len(b['mappings']),'selectedDecisionIndexes':sorted(selected[p]),'allOtherWholeDecisionsAndMetadataExact':True,'allOldRationaleAndContributionTailsExact':True})
plan=put('PLAN.exact-four-alias-selected-row-CAS.json',{'role':'Actual bounded NI/SL lower-only integration plan','normalWritePaths':[pin(p) for p in writepaths],'sourceGoalRelations':contributions,'preWritePureChecks':checks,'independentExistingFIRST':firstpin,'newScientificVotes':0,'normalRegistryCanonicalPViewsWrites':0})
protected.update({firstpin['path']:firstpin,'scripts/validate_schemas.py':pin('scripts/validate_schemas.py')})
put('BEFORE.protected-C-P-QA-source-primary-and-science-pins.json',{'files':[protected[k] for k in sorted(protected)],'allRemainUnchanged':True})
for i,p in enumerate(writepaths):
 verify(checks[i]['fileBefore']);backup=O/f'history/{i+1:02d}.{pathlib.Path(p).name}.before-exact.json';backup.parent.mkdir(exist_ok=True);backup.write_bytes(before[p])
for p in writepaths:pathlib.Path(p).write_text(json.dumps(after[p],ensure_ascii=False,indent=2)+'\n')
for p in writepaths:assert J(p)==after[p]
for f in protected.values():verify(f)
# Unchanged stock symlink routine only, not full schema/QA/compiler.
spec=importlib.util.spec_from_file_location('bounded_curriculum_schema_contract',R/'scripts/validate_schemas.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod);symlink=mod.curriculum_symlink_errors(str(R));assert symlink==[],symlink
# Portable refs in the six actual appended tuples and three actual source contributions.
for c in contributions:
 for f in [c['wholeCurrentSource']['file'],c['wholeContribution']['independentAcceptedRef'],c['wholeContribution']['independentSeal'],c['wholeContribution']['operativeRootAuthorSeal'],c['wholeContribution']['primaryPDF'],c['wholeContribution']['wholeBilingualMaterial']]:
  assert not pathlib.Path(f['path']).is_absolute();assert pathlib.Path(f['path']).is_file();assert H(pathlib.Path(f['path']).read_bytes())==f['sha256']
 for al in c['aliases']:
  d=J(al);assert sum(x.get('legacyGoalId')==c['sourceGoalId'] and x.get('canonicalGoalId')==c['goalId'] and x.get('matchType')=='partial' for x in d['mappings'])==1
receipt=put('RECEIPT.actual-three-P-source-relations-normal-integrated.json',{'role':'ACTUAL_TECHNICAL_INTEGRATION_OF_THREE_ALREADY_ACCEPTED_PARTIAL_RELATIONS','atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'plan':plan,'wholeCurrentNativeP138SelectionRetained':pin(C),'normalWrittenFiles':[{'before':checks[i]['fileBefore'],'after':pin(p),'partialTuplesAdded':checks[i]['newPartialMappings'],'selectedDecisions':checks[i]['selectedDecisionIndexes']} for i,p in enumerate(writepaths)],'counts':{'normalMappingAliasFiles':4,'newPartialMappingTuples':6,'independentAlreadyAcceptedSourceRelations':3,'selectedWholeDecisionObjects':3,'newSourceCells':0,'newScientificVotes':0},'actualFinitePure':{'allSixExpectedTuplesPresentExactlyOnceAsPartial':True,'wholeCurrentThreeSourceCellsAndProfilesExact':True,'wholeOldMappingPrefixesAndAllUnselectedDecisionMetadataExact':True,'oldRationalesAndContributionTailsExact':True,'decisionMappedAndMatchTypePartial':True,'sourceWholeCreditAdded':False},'actualPortableReferences':'All current selected primary/extraction/material/science refs repo-relative, exist and SHA-exact. Correct SL Klasse9 original PDF for p18 coefficient operator retained despite merged source inventory.','actualStockCurriculumSymlinkErrors':symlink,'actualCheckCommands':['python3 '+str(pathlib.Path(__file__).relative_to(R)),'Unchanged scripts.validate_schemas.curriculum_symlink_errors(repo_root) invoked directly; no full schema validation run.'],'allProtectedCentralCanonicalSEM_QA_P_SourceAndPrimaryFilesExact':True,'normalRegistryCanonicalPViewsWrites':0,'APCompilerBuildRuns':0,'newScientificVotes':0,'newDPAMVReviews':0,'wholeM7OrFullCQRPassClaim':False,'humanApprovalOrTrial':False,'actualLearnerPerformance':False})
print(json.dumps({'DONE':receipt,'normalWriteFiles':4,'newPartialTuples':6,'selectedDecisionObjects':3,'stockSymlinkErrors':0,'normalCentralUnchanged':pin(C)},indent=2))
