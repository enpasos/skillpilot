# SPDX-License-Identifier: Apache-2.0
"""A portable concrete guarded Root plan. No active file is written here."""
from pathlib import Path
from datetime import datetime,timezone
import json,hashlib,os,shutil,subprocess,importlib.util,jsonschema
R=Path.cwd();D=Path(__file__).resolve().parent;REQ={}
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
rel=lambda p:str(Path(p).relative_to(R))
def bind(p):
 p=Path(p);v={'path':rel(p),'sha256':sha(p),'bytes':p.stat().st_size};REQ[v['path']]=v;return v
def read(p):bind(p);return json.loads(Path(p).read_text())
def put(name,v):
 p=D/name;p.parent.mkdir(parents=True,exist_ok=True);b=((v if isinstance(v,str)else json.dumps(v,ensure_ascii=False,indent=2))+'\n').encode()
 if p.exists():assert p.read_bytes()==b,p;return bind(p)
 t=p.with_suffix(p.suffix+'.tmp');t.write_bytes(b);os.replace(t,p);return bind(p)
def copy(p,name):
 p=Path(p);q=D/name;q.parent.mkdir(parents=True,exist_ok=True)
 if q.exists():assert p.read_bytes()==q.read_bytes()
 else:shutil.copyfile(p,q)
 return bind(q)
def verify(v):
 p=R/v['path'];assert sha(p)==v['sha256'].removeprefix('sha256:')and p.stat().st_size==v['bytes'],p;return bind(p)
g=read(D/'current-two-protected-baseline-and-original-pair.technical.guard.json');ids=g['goalIds'];pair=read(D/'pending/original-seal-verification.actual.json')
for s in pair['seals'].values():
 verify(s['seal'])
 for v in s['verifiedOriginalFiles']:verify(v)
author=D.parent/'chemie-q3-whole-twenty-raster-native-remediation-technical-20261008-v2';af=read(author/'final-two-current480-378-raster-native-author.first-input.freeze.json');verify(pair['authorFirstInputSeal'])
for v in af['ownFiles']:verify(v)
for p in ['D2-native-round-a','D2-native-round-b','A2-genuine-reviewed-adoption','M378-seven-current-real-scopes-retained']:assert read(D/'checks'/f'{p}.terminal.actual.json')['actualExitCode']==0
checks=read(D/'checks/genuine-A2-P2-QA2-and-whole-current-native-adoption.actual.json');assert checks['actualP2ClosedSchemaNativeSemanticErrors']==checks['actualFutureP2ConfigClosedSchemaErrors']==0 and checks['actualAll378CompiledPageObjectsExactToReviewedFrame']and checks['all379RawHumanFieldsExact'];d=read(D/'checks/genuine-two-native-D-direct-existing-contracts.actual.json');assert len(d['D'])==1 and len(d['D'][0]['resolutions'])==2 and all(r['nativeLowerDescriptionComplete']and not r['errors']for r in d['D'][0]['resolutions'])
for b in g['before'].values():assert sha(R/b['active']['path'])==b['active']['sha256'];verify(b['snapshot'])
before=read(R/g['before']['canonical']['snapshot']['path']);after=read(R/g['candidateCanonical']['path']);ob={a['id']:a for a in before['goals']};nb={a['id']:a for a in after['goals']};assert len(ob)==len(nb)==480 and[i for i in ob if ob[i]!=nb[i]]==[ids[1]]
qbefore=read(R/g['before']['qa']['snapshot']['path']);qafter=read(D/'candidate/visualization-qa.current378.paired-two.future-active.json');qb={a['goalId']:a for a in qbefore['records']};qn={a['goalId']:a for a in qafter['records']};assert len(qb)==len(qn)==379 and set(qb)==set(qn)
for i in qb:
 if i not in ids:assert qb[i]==qn[i]
 assert{k:v for k,v in qb[i].items()if k.startswith('human')}=={k:v for k,v in qn[i].items()if k.startswith('human')}
oldMembership=read(D/'checks/current-whole929-source1602-5459-and-selected-old-D-P-membership.actual.json');assert oldMembership['noSupersessionsNecessary']and not oldMembership['currentSourceDifferences'];source=read(D/'source/whole1602-929-5459.exact-retained.json');assert source['matchedEdges']==1602 and len(source['sourceGoals'])==929 and sum(len(v['allPartnerRows'])for v in source['sourceGoals'])==5459
selected=read(D/'source/two-whole-five-three-all-partners.exact-retained.json');assert[e['wholeDutyCount']for e in selected['entries']]==[5,3]
sourceGuards=[]
for p in sorted({s[f]for s in source['sourceGoals']for f in ['mappingPath','sourceExtractionPath']}):
 q=R/p;sourceGuards.append({'path':p,'sha256':sha(q),'bytes':q.stat().st_size})
imPath=R/'curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-q3-corrosion-one-typo-correction-author-root-20261008-v1/selected-one-corrosion-typo.author.json';im=read(imPath);assert im['png']['sha256']=='c2b9f04acd7d2f3fe8bfa2cde3d152e16803c364ba6d420e0d9b386ca090f35b'
for lane in ['png','prompt','provenance']:verify(im[lane])
prompt=copy(R/im['prompt']['path'],'selected-images/goal16.reviewed-correction.prompt.de.md');prov=copy(R/im['provenance']['path'],'selected-images/goal16.original-generation.provenance.json')
oldAsset=R/qb[ids[1]]['canonicalAssetPath'];assert sha(oldAsset)==qb[ids[1]]['assetSha256'].removeprefix('sha256:');historyJPEG=copy(oldAsset,'history/original-goal16-review-frame.jpg');oldPrompt=oldAsset.parent/'prompt.de.md';historyPrompt=copy(oldPrompt,'history/original-goal16.prompt.de.md')
newPNG=bind(D/f'selected-images/{ids[1]}.png');ops=[]
for prefix in ['curricula/DE/Gymnasium/visualizations/chemie','app/public/assets/goal-visualizations/chemie','backend/src/main/resources/static/assets/goal-visualizations/chemie']:
 p=R/prefix/ids[1]/f'{ids[1]}.png';assert not p.exists();old=R/prefix/ids[1]/f'{ids[1]}.jpg';assert sha(old)==sha(oldAsset);ops.append({'source':newPNG,'targetPath':rel(p),'expectedAbsent':True,'retainExistingJPEGExactly':{'path':rel(old),'sha256':sha(old),'bytes':old.stat().st_size},'currentPrimaryLinkWillUsePNG':True})
indexPath=D/'native-d-two-current/resolution-index.json';index=read(indexPath);assert set(index['batchGoalIds'])==set(ids)and len(index['resolutions'])==2
pcfg=read(D/'positive/current-two.future-active.config.json');assert not pcfg.get('reportPath')and pcfg['reviewedResourceTypes']==['goal-visualization']and pcfg['reviewRunManifestPaths']==[]
profileSchema=read(R/'contracts/goal-evidence/v2/goal-evidence-profile.schema.json');cfgSchema=read(R/'contracts/goal-evidence/v2/goal-evidence-review-config.schema.json');jsonschema.Draft202012Validator(cfgSchema).validate(pcfg)
for row in(D/'positive/current-two.paired-machine-native.jsonl').read_text().splitlines():
 v=json.loads(row);jsonschema.Draft202012Validator(profileSchema).validate(v);assert v['status']=='needs_human_review'and v['reviewAuthority']=='ai_candidate'and v['evidenceLevel']=='E1'and v['maximumClaimScope']=='G1'and v['reviewRunIds']==[]
plan=put('concrete-reviewed-two-guarded-root-integration.plan.json',{
 'schemaVersion':1,'role':'Concrete Root-only integration of actual final A/B judgments; this technical author performs no active operations',
 'currentCentral':g['actualCurrentCentral'],'currentCentralTerminal0':g['actualCurrentCentralTerminal'],'protectedExactStrictIds':g['protectedStrictIDs'],
 'beforeActiveBindings':{k:v['active']for k,v in g['before'].items()},'actualTwoGoalIds':ids,
 'canonicalMutation':{'activePath':g['before']['canonical']['active']['path'],'fullCandidate':g['candidateCanonical'],'onlyChangedGoalId':ids[1],'allowedField':'resourceLinks','expectedWholeGoal':ob[ids[1]],'reviewedWholeGoalAfter':nb[ids[1]],'allOther479WholeGoalsExact':True,'wholeSelectedDEENAndAllOtherFieldsExact':True},
 'qaMutations':{'activePath':g['before']['qa']['active']['path'],'fullCandidate':bind(D/'candidate/visualization-qa.current378.paired-two.future-active.json'),'replaceOnlyGoalIds':ids,'actualRawRowCount':379,'actualCurrentAtomicRowCount':378,'other377RawRowsExact':True,'other376CurrentAtomicRowsExact':True,'oneNonCurricularExtraWholeRowExact':True,'all379RawHumanFieldsExact':True,'expectedBeforeRows':[qb[i]for i in ids],'reviewedAfterRows':[qn[i]for i in ids]},
 'registryAppendOnly':{'activeRegistryPath':g['before']['registry']['active']['path'],'subject':'chemie','resolutionIndexPaths':[bind(indexPath)['path']],'semanticAtomicityConfigPaths':[bind(D/'atomicity/current-two.future-active.config.json')['path']],'positiveEvidenceConfigPaths':[bind(D/'positive/current-two.future-active.config.json')['path']],'existingSelectedD_P_ARecordsActuallyAbsent':True,'supersessions':[],'allOtherSubjectAndProtectedBindingsExact':True},
 'reviewedPNGCopyOperations':ops,'goodGoal15JPEGAndLinkByteExactKEEP':True,'original16JPEGAndPromptHistory':{'jpeg':historyJPEG,'prompt':historyPrompt},
 'sourcePromptProvenanceOperations':[{'source':prompt,'targetPath':rel(oldPrompt),'expectedBefore':{'sha256':sha(oldPrompt),'bytes':oldPrompt.stat().st_size},'history':historyPrompt},{'source':prov,'targetPath':rel(oldAsset.parent/'provenance.json'),'expectedAbsent':not(oldAsset.parent/'provenance.json').exists(),'generationProvenanceRemainsOriginalNoFabricatedApproval':True}],
 'allCurrentSource54FileGuards':sourceGuards,'all1602Bindings929Duties5459PartnersExact':True,'wholeSourceSelectedFiveThreeBoundedOnly':True,'allOther18HoldsAndSeparateCase12Retained':True,'sourceMappingOrExtractionWrites':[],
 'currentKindsAndAll378MemoryRowsCardsSevenScopesNoMutations':True,'ordinarySourceAtlasDerivedConsumerChecks':'Root runs ordinary generation/check only if current input digest requires derivative freshness; no source role/decision/view semantics changes prepared by this package. National Atlas359 remains a distinct view from current378.',
 'ordinaryOperativeCorrectedPNGP2CLI':'PENDING actual Root guarded PNG installation; native P2 closed schema/current actual-raster semantics0 is already verified separately. Do not use an empty resource filter.',
 'candidateMachineD2ResolutionsNativePASS':True,'candidateA2StandardCLI0':True,'candidateM378SevenScopesStandardCLI0':True,'candidateP2ClosedNativeSchemaAndSemantics0':True,'candidateQA2GenuineIndependentExactAssetApprovals':True,
 'expectedSubjectNumbersAfterActualIntegrationOnly':{'chemie':{'strict':175,'denominator':378},'biologie':{'strict':222,'denominator':392},'mathematik':{'strict':807,'denominator':807},'physik':{'strict':478,'denominator':478}},
 'actualCurrentStrictGainClaimed':0,'scientificClosuresCountedBeforeActiveCentral':0,'actualActiveWrites':0,'humanApproval':False,'humanTrial':False,
})
entry=put('neutral-two-genuine-reviewed-root-integration-ready.technical.entry.json',{'schemaVersion':1,'role':'Guarded technical integration-ready two-target packet; real scientific/visual judgments remain original independent A/B','goalIds':ids,'actualOriginalPair':g['originalGenuinePair'],'exactAuthorFirstInputSeal':pair['authorFirstInputSeal'],'concreteRootPlan':plan,'nativeD2Index':bind(indexPath),'nativeA2Config':bind(D/'atomicity/current-two.future-active.config.json'),'nativeP2Config':bind(D/'positive/current-two.future-active.config.json'),'candidateCanonical':g['candidateCanonical'],'candidateQA':bind(D/'candidate/visualization-qa.current378.paired-two.future-active.json'),'current378WholeNativeModel':bind(D/'native/current378.paired-two.actual-model.json'),'actualClosedP2SchemaSemanticsErrors':0,'actualD2CampaignDualSynthesisResolutionErrors':0,'actualA2M378StandardCLIExit':0,'allOther479CanonicalGoals377Pages376CurrentAtomicQAAnd379RawHumanFieldsExact':True,'ordinaryCorrectedPNGP2CLI':'PENDING Root guarded installation','other18OriginalHoldsRetained':True,'noNewScienceReviewByTechnicalIntegrator':True,'activeWrites':0,'strictGainClaimed':0,'humanApproval':False,'humanTrial':False})
put('ROOT-INTEGRATION-READINESS.md','''# Chemie: zwei unabhängig geprüfte Korrosionsziele

Die echten finalen A/B-Erst-/Finalurteile und nativen Record-/Runbytes bleiben unverändert. Zwei tatsächlich getrennte blinde Campaigns mit Batchgröße2 bestehen die normalen CampaignResults-/DualRound-/Synthesis-/Resolution-APIs und Standard-CLI. Beide Whole-Science-Urteile begründen die zwei jetzt technisch materialisierten Atomaritätsrecords; in den bestehenden17 A-Konfigurationen fehlten diese Ziele tatsächlich. Die normalen A2- und M378-Prüfungen bestehen mit allen sieben wirklichen Sichtmengen.

Die beiden vollständigen bilingualen P-Profile und vier ganzen Fälle bleiben exakt zur tatsächlich geprüften Fassung. Die echte vorher beanstandete deutsche Standardpotentialaussage ist fachlich behoben und von beiden unabhängigen Prüfern akzeptiert; die übrigen gültigen Fallteile bleiben erhalten. P bleibt E1/G1 ai_candidate/needs_human_review. D-Runs werden nicht als P-Manifeste ausgegeben: reviewRunIds ist leer. Die aktuellen tatsächlichen JPEG-/PNG-Bindungen bestehen das geschlossene v2-Schema und normale native Semantik. Die gewöhnliche operative PNG-CLI folgt erst nach der Root-Installation.

Der gute originale Kontaktkorrosions-JPEG bleibt KEEP. Beim Korrosionsverhalten wird ausschließlich der wirklich geprüfte minimale Feuchte-Luft-PNG-Kandidat übernommen. Alle479 anderen ganzen Ziele und377 anderen ganzen nativen Seiten sind exakt; die gepaarten378 Seitenobjekte sind exakt zum unabhängig geprüften Eingangsrahmen. Die QA-Datei enthält379 Rohzeilen, darunter378 aktuelle curriculare Atome und eine erhaltene zusätzliche Zeile. Andere377 Rohzeilen, darunter376 aktuelle Atome, sowie alle379 menschlichen Felder bleiben exakt.

Die Quelle bleibt verlustfrei:1602 Bindungen,929 ganze Pflichten und5459 Partnerrows; alle54 aktuellen Originaldateien wurden tatsächlich verglichen. Der geprüfte Scope umfasst ausschließlich fünf/drei ganze Pflichten mit allen Partnern. Die anderen18 ursprünglichen HOLDs und die separate Fall12-Korrektur werden nicht integriert. Das nationale Lernzielbuch mit359 Seiten bleibt eine andere Sicht als der aktuelle378er-Prüfumfang. Keine Quellen-/Sicht-/Runtime- oder menschliche Freigabeänderung wird daraus abgeleitet.

Der konkrete Plan nennt nur die eine aktuelle Ressourcenmutation, zwei QA-Zeilen, drei Registry-Anhänge und echte PNG-/Prompt-/Herkunftskopien. Alte JPEG-/Promptbytes bleiben zusätzlich im eigenen historischen Dossier erhalten. Root prüft und installiert diese konkreten Ergebnisse und führt danach die betroffenen gewöhnlichen Prüfungen und den zentralen Bericht aus.175/378 Chemie ist ausschließlich eine Erwartung bis zu diesem tatsächlichen terminalen Bericht; dieses Paket behauptet0 aktiven Zuwachs und0 aktive Writes.
''')
moduleSpec=importlib.util.spec_from_file_location('ordinary_schema_validation',R/'scripts/validate_schemas.py');validator=importlib.util.module_from_spec(moduleSpec);moduleSpec.loader.exec_module(validator);runtime=read(R/'docs/landscape-runtime.schema.json');parsed=0
for p in sorted(D.rglob('*')):
 if not p.is_file():continue
 if p.suffix=='.json':assert validator.validate_file(str(p),runtime);parsed+=1
 elif p.suffix=='.jsonl':
  for l in p.read_text().splitlines():json.loads(l)
 assert p.suffix not in ['.pyc','.tmp'];bind(p)
# Required review inputs are immutable own copies, original sealed histories and contracts.
# Active before bindings are metadata guards for Root; future active mutation must not invalidate history.
for p in list(REQ):
 if p.startswith('curricula/DE/Gymnasium/canonical/')or p.startswith('curricula/DE/Gymnasium/composition-views/')or p.startswith('app/scripts/config/')or p.startswith('app/public/')or p.startswith('backend/')or p.startswith('curricula/DE/Gymnasium/visualizations/')or p in [v['active']['path']for v in g['before'].values()]:REQ.pop(p)
ignored=subprocess.run(['git','check-ignore','--no-index','--stdin'],input='\n'.join(REQ)+'\n',text=True,capture_output=True);assert ignored.returncode in[0,1]and not ignored.stdout.strip(),ignored.stdout
links=[]
for p in list(REQ):
 q=R/p
 if q.is_symlink():
  target=os.readlink(q);assert not os.path.isabs(target);actual=q.resolve(strict=True);assert actual.is_relative_to(R)and rel(actual)in REQ;links.append({'path':p,'containedRelativeTarget':target,'target':bind(actual),'broken':False})
portable=put('checks/reviewed-two-root-plan-all-required-portability.actual.json',{'checkedAt':datetime.now(timezone.utc).isoformat(),'requiredFiles':list(REQ.values()),'actualContainedAliases':links,'normalOwnJSONValidated':parsed,'allOwnJSONLParsed':True,'ignoredRequiredFiles':[],'brokenRequiredSymlinks':0,'normalIgnoreRulesUnchanged':True,'activeBeforePathsMetadataOnlyWithOwnImmutableCopies':True,'originalIndependentA_BAndAuthorTreesExact':True,'actualActiveWrites':0,'strictGainClaimed':0,'humanApproval':False})
seal=put('two-genuine-reviewed-root-integration-ready.technical.freeze.json',{'schemaVersion':1,'sealedAt':datetime.now(timezone.utc).isoformat(),'role':'Exact portable guarded technical adoption plan for true A/B two-corrosion results; no new science review or active integration','neutralEntry':entry,'concretePlan':plan,'ownFiles':[bind(p)for p in sorted(D.rglob('*'))if p.is_file()],'requiredPortableInputs':portable,'actualOriginalSealedPair':pair['seals'],'actualD2ExistingNativeAPI_CLI_0':True,'actualA2_M378StandardCLI0':True,'actualP2ClosedSchemaSemantics0':True,'ordinaryOperativeCorrectedPNGP2CLIStillPending':True,'currentChem173_378Bio222_392Protected':True,'expectedChem175OnlyAfterRootActualIntegrationCentral':True,'actualActiveWrites':0,'strictGainClaimed':0,'humanApproval':False,'humanTrial':False})
print(json.dumps({'entry':entry,'readySeal':seal,'plan':plan,'requiredPortableFiles':len(REQ),'normalOwnJSONValidated':parsed,'ignoredRequired':0,'brokenAliases':0,'actualD2A2M378_0':True,'actualP2ClosedNativeSchemaSemantics0':True,'ordinaryOperativeCorrectedPNGP2CLI':'pending Root guarded apply','actualActiveWrites':0,'strictGainClaimed':0}))
