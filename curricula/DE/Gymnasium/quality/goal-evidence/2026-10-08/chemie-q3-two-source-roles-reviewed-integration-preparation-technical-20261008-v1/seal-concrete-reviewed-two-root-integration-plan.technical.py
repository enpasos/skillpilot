# SPDX-License-Identifier: Apache-2.0
"""Seal exact technical Root plan after existing ordinary APIs/CLI pass; no active writes."""
from pathlib import Path
from datetime import datetime,timezone
import hashlib,json,shutil,subprocess,importlib.util,jsonschema
R=Path.cwd();D=Path(__file__).resolve().parent;REQ={}
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
rel=lambda p:str(Path(p).relative_to(R))
def bind(p):
 p=Path(p);assert p.is_file(),p
 if p.is_symlink():
  import os
  assert not os.path.isabs(os.readlink(p))and p.resolve(strict=True).is_relative_to(R),p
  if p.resolve(strict=True)!=p:bind(p.resolve(strict=True))
 v={'path':rel(p),'sha256':sha(p),'bytes':p.stat().st_size};REQ[v['path']]=v;return v
def read(p):bind(p);return json.loads(Path(p).read_text())
def put(name,v):
 p=D/name;p.parent.mkdir(parents=True,exist_ok=True);b=((v if isinstance(v,str)else json.dumps(v,ensure_ascii=False,indent=2))+'\n').encode()
 if p.exists():assert p.read_bytes()==b,p;return bind(p)
 p.write_bytes(b);return bind(p)
def copy(p,name):
 p=Path(p);q=D/name;q.parent.mkdir(parents=True,exist_ok=True)
 if q.exists():assert q.read_bytes()==p.read_bytes(),q
 else:shutil.copyfile(p,q)
 return bind(q)
def verify(v):
 p=R/v['path'];assert sha(p)==v['sha256'].removeprefix('sha256:')and p.stat().st_size==v['bytes'],p;return bind(p)
g=read(D/'current-two-protected-baseline-and-original-pair.technical.guard.json');ids=g['goalIds'];pair=read(D/'pending/original-seal-verification.actual.json')
for s in pair['seals'].values():
 verify(s['seal'])
 for v in s['verifiedOriginalFiles']:verify(v)
for p in ['D2-ordinary-round-a','D2-ordinary-round-b','A2-ordinary-current-whole-two']:assert read(D/'checks'/f'{p}.terminal.actual.json')['actualExitCode']==0
checks=read(D/'checks/genuine-A2-P2-QA2-and-whole-current-native-adoption.actual.json');assert checks['actualP2ClosedSchemaAndNativeSemanticErrors']==checks['actualP2ConfigSchemaErrors']==0 and checks['actualAll378WholePagesExactToA_BReviewedFrame']and checks['all379HumanFieldsExact']
d=read(D/'checks/genuine-two-native-D-direct-existing-contracts.actual.json');assert len(d['D'])==1 and len(d['D'][0]['resolutions'])==2 and all(r['nativeLowerDescriptionComplete']and not r['errors']for r in d['D'][0]['resolutions'])
for b in g['before'].values():verify(b['active']);verify(b['snapshot'])
before=read(R/g['before']['canonical']['snapshot']['path']);after=read(R/g['candidateCanonical']['path']);ob={a['id']:a for a in before['goals']};nb={a['id']:a for a in after['goals']};assert len(ob)==len(nb)==480 and set(i for i in ob if ob[i]!=nb[i])==set(ids)
qbefore=read(R/g['before']['qa']['snapshot']['path']);qafter=read(D/'candidate/visualization-qa.current378.paired-two.future-active.json');qb={a['goalId']:a for a in qbefore['records']};qn={a['goalId']:a for a in qafter['records']};assert len(qb)==len(qn)==379 and set(qb)==set(qn)
for i in qb:
 if i not in ids:assert qb[i]==qn[i]
 assert{k:v for k,v in qb[i].items()if k.startswith('human')}=={k:v for k,v in qn[i].items()if k.startswith('human')}
assert not any(g['existingSelectedD_P_AMembership'].values())
source=read(D/'source/selected49-whole259-partner-bodies.exact.json');assert len(source)==49 and sum(len(s['wholeOriginalDuty']['allPartnerRows'])for s in source)==259
sourceGuards=[]
for p in sorted({s['wholeOriginalDuty'][f]for s in source for f in ['mappingPath','sourceExtractionPath']}):sourceGuards.append(bind(R/p))
holds=read(D/'source/whole16-holds-retained-from-sealed-A-and-B.json');assert holds['holdCount']==16
for filename,original in [('current378.exact-retained.jsonl',g['retainedMemoryRows']),('current-cards.exact-retained.jsonl',g['retainedCards'])]:verify(original)
memoryConfig=read(R/g['currentMemoryConfig']['path']);assert len(memoryConfig['visibilityScopes'])==7
assert sha(R/memoryConfig['reviewPath'])==g['retainedMemoryRows']['sha256']and sha(R/memoryConfig['cardReviewPath'])==g['retainedCards']['sha256']
for v in g['allActualSevenMemoryScopes']:verify(v['original']);verify(v['copy'])
oldAsset=R/qb[ids[0]]['canonicalAssetPath'];assert sha(oldAsset)==qb[ids[0]]['assetSha256'].removeprefix('sha256:');historyJPEG=copy(oldAsset,'history/original-goal6-review-frame.jpg');oldPrompt=oldAsset.parent/'prompt.de.md';historyPrompt=copy(oldPrompt,'history/original-goal6.prompt.de.md')
oldRecon=oldAsset.parent/'image-reconstruction-prompt.de.md';historyRecon=copy(oldRecon,'history/original-goal6.image-reconstruction-prompt.de.md')if oldRecon.exists()else None
reconText='''Erzeuge eine freundliche klare Comicillustration im PNG-Querformat etwa16:9. Weiße und cremefarbene Grundflächen, kräftige lesbare schwarze Konturen und große deutsche Beschriftungen. Oben „Katalysatoren beurteilen“. Links ein großer Bereich „Einfluss auf Gleichgewichtseinstellung“ mit zwei übereinanderliegenden schematischen Energiediagrammen. Die Achsen heißen „Energie“ und „Reaktionsverlauf“. Oben ein roter unkatalysierter Weg mit hoher erster und kleinerer zweiter Barriere; unten ein grüner katalysierter Weg mit deutlich niedrigerer Barriere. Beide Wege haben dieselben Reaktanten- und Produktenergien und dieselbe Zustandsdifferenz. Ea und Ea′ werden jeweils vom tatsächlichen Reaktantenniveau bis zum Gipfel gemessen. Neben dem oberen Weg „Ohne Katalysator“, neben dem unteren „Mit Katalysator“; je ein Becher „Gleichgewichtszustand“ enthält identische Anteile blauer Reaktantenteilchen und roter Produktteilchen. Unter den Wegen ein langer grauer Zeitpfeil „Lange Zeit bis zum Gleichgewicht“ beziehungsweise ein kürzerer grüner Pfeil „Kurze Zeit bis zum Gleichgewicht“. Rechts ein Bereich „Beispiele für Katalysearten“: oben „Homogene Katalyse (gleiche Phase)“ mit Reaktanten, Produkten und grünen Katalysatorsternen in einem gemeinsamen Lösungsbecher, Beispiel „Säure in Lösung“. Darunter „Heterogene Katalyse (unterschiedliche Phasen)“ mit blauen Gas-Reaktanten, roten Gas-Produkten und einer festen Metalloberfläche, an der die Reaktion verläuft; die Fläche trägt „Fester Katalysator (Oberfläche)“, Beispiel „Gas an Metalloberfläche“. Abstrakte Stoffteilchen, keine konkreten Molekülstrukturbehauptungen. Keine technischen IDs oder Wasserzeichen.\n'''
reconstruction=put('selected-images/goal6.actual-raster.image-reconstruction-prompt.de.md',reconText)
put('selected-images/goal6.reconstruction-prompt.actual-raster-basis.receipt.json',{'actualImage':bind(D/f'selected-images/{ids[0]}.png'),'standalonePrompt':reconstruction,'derivedFromActualFullRasterOpenedByTechnicalIntegrator':True,'scope':'metadata reconstruction only, no new scientific or visual approval','originalTargetedProviderPromptAndProvenanceUnchanged':True,'humanApproval':False})
newPNG=bind(D/f'selected-images/{ids[0]}.png');ops=[];retainedImages=[]
for prefix in ['curricula/DE/Gymnasium/visualizations/chemie','app/public/assets/goal-visualizations/chemie','backend/src/main/resources/static/assets/goal-visualizations/chemie']:
 p=R/prefix/ids[0]/f'{ids[0]}.png';assert not p.exists(),p;old=R/prefix/ids[0]/f'{ids[0]}.jpg';assert sha(old)==sha(oldAsset);ops.append({'source':newPNG,'targetPath':rel(p),'expectedAbsent':True,'retainExistingJPEGExactly':bind(old),'currentPrimaryLinkWillUsePNG':True})
 keep=R/prefix/ids[1]/f'{ids[1]}.jpg';assert sha(keep)==qb[ids[1]]['assetSha256'].removeprefix('sha256:');retainedImages.append(bind(keep))
def metadataOp(source,target,history=None):
 return{'source':source,'targetPath':rel(target),'expectedAbsent':not target.exists(),'expectedBefore':bind(target)if target.exists()else None,'history':history,'doesNotCreateScientificOrHumanApproval':True}
rootReconstruction=bind(D.parent/'chemie-q3-two-source-roles-reviewed-active-integration-root-20261008-v1/goal6.image-reconstruction-prompt.actual-view.de.md')
rootReconstructionReceipt=bind(D.parent/'chemie-q3-two-source-roles-reviewed-active-integration-root-20261008-v1/goal6.actual-view-derived-reconstruction.receipt.json')
metadataOps=[metadataOp(bind(D/'selected-images/goal6.actual-original-targeted-v2.prompt.de.md'),oldPrompt,historyPrompt),metadataOp(rootReconstruction,oldRecon,historyRecon),metadataOp(bind(D/'selected-images/goal6.actual-original-v2.provenance.json'),oldAsset.parent/'provenance.json')]
indexPath=D/'native-d-two-current/resolution-index.json';index=read(indexPath);assert set(index['batchGoalIds'])==set(ids)and len(index['resolutions'])==2
pcfg=read(D/'positive/current-two.future-active.config.json');assert pcfg['reviewedResourceTypes']==['goal-visualization']and pcfg['reviewRunManifestPaths']==[]
jsonschema.Draft202012Validator(read(R/'contracts/goal-evidence/v2/goal-evidence-review-config.schema.json')).validate(pcfg)
profileSchema=read(R/'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')
for line in(D/'positive/current-two.exact-independent-a-reviewed.jsonl').read_text().splitlines():
 v=json.loads(line);jsonschema.Draft202012Validator(profileSchema).validate(v);assert v['status']=='needs_human_review'and v['reviewAuthority']=='ai_candidate'and v['evidenceLevel']=='E1'and v['maximumClaimScope']=='G1'and v['reviewRunIds']==[]
plan=put('concrete-reviewed-two-guarded-root-integration.plan.json',{
 'schemaVersion':1,'role':'Concrete Root-only guarded integration of genuine independent6/8 judgments; no technical-author active operations',
 'currentCentral':g['actualCurrentCentral'],'currentCentralTerminal0':g['actualCurrentCentralTerminal'],'protectedExactStrictIds':g['protectedStrictIds'],'beforeActiveBindings':{k:v['active']for k,v in g['before'].items()},'actualTwoGoalIds':ids,
 'canonicalMutation':{'activePath':g['before']['canonical']['active']['path'],'fullCandidate':g['candidateCanonical'],'onlyChangedGoalIds':ids,'allowedField':'resourceLinks','expectedWholeGoals':[ob[i]for i in ids],'reviewedWholeGoalsAfter':[nb[i]for i in ids],'allOther478WholeGoalsExact':True,'selectedWholeDEENAndAllNonResourceFieldsExact':True},
 'qaMutations':{'activePath':g['before']['qa']['active']['path'],'fullCandidate':bind(D/'candidate/visualization-qa.current378.paired-two.future-active.json'),'replaceOnlyGoalIds':ids,'actualRawRowCount':379,'actualCurrentAtomicRowCount':378,'other377RawRowsExact':True,'other376CurrentAtomicRowsExact':True,'extraNonCurricularWholeRowExact':True,'all379RawHumanFieldsExact':True,'expectedBeforeRows':[qb[i]for i in ids],'reviewedAfterRows':[qn[i]for i in ids]},
 'registryAppendOnly':{'activeRegistryPath':g['before']['registry']['active']['path'],'subject':'chemie','resolutionIndexPaths':[bind(indexPath)['path']],'semanticAtomicityConfigPaths':[bind(D/'atomicity/current-two.future-active.config.json')['path']],'positiveEvidenceConfigPaths':[bind(D/'positive/current-two.future-active.config.json')['path']],'existingSelectedD_P_ARecordsActuallyAbsent':True,'supersessions':[],'allOtherSubjectAndProtectedBindingsExact':True},
 'reviewedPNGCopyOperations':ops,'goodGoal8JPEGByteExactKEEP':retainedImages,'original6JPEGAndPromptHistory':{'jpeg':historyJPEG,'prompt':historyPrompt,'reconstructionPrompt':historyRecon},'sourcePromptProvenanceOperations':metadataOps,'additionalRootActualViewDerivedReconstructionPrompt':{'prompt':rootReconstruction,'receipt':rootReconstructionReceipt,'technicalOwnAlternativeRemainsHistoricalOnly':reconstruction,'neitherPromptIsNewVisualApproval':True},
 'currentSourceFileGuards':sourceGuards,'all49WholeDuties259WholePartnerRowsExact':True,'all16SourceUnionHoldsStillOpen':True,'sourceMappingOrExtractionWrites':[],
 'currentKindsAndAll378MemoryRowsCardsSevenScopesNoMutations':True,'all378WholePageObjectsExactToActualA_BNativeInput':True,
 'ordinaryOperativeNewPNGP2CLI':'PENDING actual Root guarded PNG installation; actual unchanged native API, closed schema and semantics already PASS separately',
 'candidateD2NativeCampaignDualSynthesisResolutionAndOrdinaryCLIPASS':True,'candidateA2OrdinaryCLI0':True,'candidateM378Cards7ScopesExactCurrentReuse':True,'candidateP2ExactARowsClosedNativeSchemaAndSemantics0':True,'candidateV2GenuineIndependentExactAssetApprovals':True,
 'expectedSubjectNumbersAfterActualIntegrationOnly':{'chemie':{'strict':177,'denominator':378},'biologie':{'strict':222,'denominator':392},'mathematik':{'strict':807,'denominator':807},'physik':{'strict':478,'denominator':478}},
 'actualCurrentStrictGainClaimed':0,'scientificClosuresCountedBeforeActiveCentral':0,'actualActiveWrites':0,'humanApproval':False,'humanTrial':False,
})
entry=put('neutral-two-genuine-reviewed-root-integration-ready.technical.entry.json',{'schemaVersion':1,'role':'Guarded technical integration-ready6/8 packet; genuine original A/B scientific and visual judgments remain separately sealed','goalIds':ids,'actualOriginalPair':g['originalGenuinePair'],'concreteRootPlan':plan,'nativeD2Index':bind(indexPath),'nativeA2Config':bind(D/'atomicity/current-two.future-active.config.json'),'nativeP2Config':bind(D/'positive/current-two.future-active.config.json'),'candidateCanonical':g['candidateCanonical'],'candidateQA':bind(D/'candidate/visualization-qa.current378.paired-two.future-active.json'),'current378WholeNativeModel':bind(D/'native/current378.paired-two.actual-model.json'),'actualClosedP2SchemaSemanticsErrors':0,'actualD2CampaignDualSynthesisResolutionErrors':0,'actualD2A2OrdinaryCLIExit':0,'allOther478Canon376Pages377RawQA379HumanFieldsExact':True,'all378PagesExactToActualA_BNativeInput':True,'currentM378Cards7ScopesExactReuse':True,'ordinaryNewPNGP2CLI':'PENDING Root guarded installation','all49SourceRoles259WholePartnersAnd16HoldsRetained':True,'noNewScientificReviewByTechnicalIntegrator':True,'activeWrites':0,'strictGainClaimed':0,'humanApproval':False,'humanTrial':False})
put('ROOT-INTEGRATION-READINESS.md','''# Chemie: zwei aktuell unabhängig geprüfte Ziele

Katalysatoren beurteilen und Ionenentladung/Überspannung liegen als zwei tatsächlich getrennte blinde aktuelle D/P/A/V-Urteile vor. Die originalen Urteils-, Record-, Run- und Erstsealbytes bleiben unverändert. Das zusätzliche Root-A-Atomaritätsurteil ist echt separat versiegelt; B begründet die Atomarität selbst. Die technische Materialisierung erzeugt keine weitere Fachprüfung.

Die regulären CampaignResults-, DualRound-, Synthesis- und Resolution-APIs bestehen für die echten Zweier-Campaigns. Zwei reguläre D-Auflösungen, die gewöhnlichen D-Campaign-CLI-Läufe und die gewöhnliche A2-CLI bestehen. Es werden weder neue Reviewer-Runs noch historische Reviews neu gestartet.

Die ganzen bilingualen P-Profile und vier ganzen Fälle bleiben exakt zur tatsächlich von A und B geprüften Vorlage. Die zwei kompletten A-P-Records werden bytegenau wiederverwendet; sie bleiben E1/G1, ai_candidate/needs_human_review und haben leere reviewRunIds. Die B-Urteile bleiben als tatsächlich eigene Evidenz erhalten; ihre Run-ID wird nicht zu einem P-Manifest umgedeutet. Geschlossenes v2-Schema und tatsächliche native P-Bindungssemantik bestehen. Die normale neue-PNG-CLI folgt nach der geschützten Root-Installation.

Die ganzen378 aktuell kompilierten Seitenobjekte sind exakt zur wirklichen von A/B angesehenen nativen Vorlage. Außerhalb6/8 bleiben478 ganze Canon-Ziele,376 ganze Seiten und377 QA-Rohzeilen exakt. Sämtliche379 menschlichen QA-Felder bleiben exakt. M378, Karten und alle sieben tatsächlichen Sichtmengen werden unverändert wiederverwendet. Alle49 Quellenpflichten und259 ganzen Partnerzeilen bleiben verlustfrei; alle16 vollständigen Quellenpflicht-HOLDs bleiben offen.

Der Plan enthält ausschließlich die zwei geprüften resourceLinks, zwei QA-Zeilen, drei Registry-Anhänge und die echten PNG6-/Prompt-/Rekonstruktions-/Herkunftskopien. Der gute originale JPEG8 bleibt KEEP. Der alte JPEG6 und seine Promptbytes bleiben erhalten und sind zusätzlich historisch gesichert.177/378 Chemie ist eine Erwartung bis zum wirklichen aktuellen zentralen Abschlussbericht. Dieses technische Paket zählt0 aktive Writes und0 strengen Zuwachs; menschliche Freigabe und Erprobung bleiben getrennt.
''')
spec=importlib.util.spec_from_file_location('ordinary_schema_validation',R/'scripts/validate_schemas.py');validator=importlib.util.module_from_spec(spec);spec.loader.exec_module(validator);runtime=read(R/'docs/landscape-runtime.schema.json');parsed=0
for p in sorted(D.rglob('*')):
 if not p.is_file():continue
 assert not p.is_symlink()and p.suffix not in ['.tmp','.pyc']
 if p.suffix=='.json':assert validator.validate_file(str(p),runtime),p;parsed+=1
 elif p.suffix=='.jsonl':
  for line in p.read_text().splitlines():json.loads(line)
 bind(p)
for p in list(REQ):
 if p.startswith('curricula/DE/Gymnasium/canonical/')or p.startswith('curricula/DE/Gymnasium/composition-views/')or p.startswith('app/scripts/config/')or p.startswith('app/public/')or p.startswith('backend/')or p.startswith('curricula/DE/Gymnasium/visualizations/')or p in[v['active']['path']for v in g['before'].values()]:REQ.pop(p)
ignored=subprocess.run(['git','check-ignore','--stdin'],input='\n'.join(REQ)+'\n',text=True,capture_output=True);assert ignored.returncode in[0,1]and not ignored.stdout.strip(),ignored.stdout
# Ordinary Git semantics: tracked files remain portable even when a broad ignore
# pattern also matches them. Verify actual index bytes for every such required
# file; this is independent of filenames, IDs and any curriculum exception.
patternMatched=subprocess.run(['git','check-ignore','--no-index','--stdin'],input='\n'.join(REQ)+'\n',text=True,capture_output=True);assert patternMatched.returncode in[0,1],patternMatched.stderr
indexBoundPatternMatches=[]
for path in patternMatched.stdout.splitlines():
 membership=subprocess.run(['git','ls-files','--error-unmatch','--',path],text=True,capture_output=True);assert membership.returncode==0 and membership.stdout.strip()==path,path
 blob=subprocess.run(['git','show',':'+path],capture_output=True);assert blob.returncode==0 and hashlib.sha256(blob.stdout).hexdigest()==REQ[path]['sha256']and len(blob.stdout)==REQ[path]['bytes'],path
 indexBoundPatternMatches.append({**REQ[path],'actualGitIndexMembership':True,'actualGitIndexBlobByteExact':True})
portable=put('checks/reviewed-two-root-plan-all-required-portability.actual.json',{'checkedAt':datetime.now(timezone.utc).isoformat(),'requiredFiles':list(REQ.values()),'normalOwnJSONValidated':parsed,'allOwnJSONLParsed':True,'ignoredUntrackedRequiredFiles':[],'requiredPatternMatchedFilesActuallyTrackedAndBlobExact':indexBoundPatternMatches,'targetedIndexAdmissionPreservesOriginalSeals':True,'brokenRequiredSymlinks':0,'ownRequiredFilesAllRegular':True,'normalIgnoreRulesUnchanged':True,'activeBeforePathsMetadataOnlyWithOwnImmutableCopies':True,'originalIndependentA_BAndAuthorTreesExact':True,'actualActiveWrites':0,'strictGainClaimed':0,'humanApproval':False})
seal=put('two-genuine-reviewed-root-integration-ready.technical.freeze.json',{'schemaVersion':1,'sealedAt':datetime.now(timezone.utc).isoformat(),'role':'Exact portable technical Root adoption plan for genuine blind A/B6/8 results; no new scientific review or active integration','neutralEntry':entry,'concretePlan':plan,'ownFiles':[bind(p)for p in sorted(D.rglob('*'))if p.is_file()],'requiredPortableInputs':portable,'actualOriginalSealedPair':pair['seals'],'actualD2ExistingAPIOrdinaryCLI0':True,'actualA2OrdinaryCLI0':True,'actualM378Cards7ScopesUnchangedReuse':True,'actualP2ClosedSchemaSemantics0':True,'ordinaryNewPNGP2CLIStillPending':True,'currentChem175Bio222Protected':True,'expectedChem177OnlyAfterActualRootIntegrationAndCentral':True,'actualActiveWrites':0,'strictGainClaimed':0,'humanApproval':False,'humanTrial':False})
print(json.dumps({'entry':entry,'readySeal':seal,'plan':plan,'requiredPortableFiles':len(REQ),'normalOwnJSONValidated':parsed,'ignoredRequired':0,'brokenAliases':0,'actualD2A2OrdinaryCLI0':True,'actualM378ExactReuse':True,'actualP2ClosedNativeSchemaSemantics0':True,'ordinaryNewPNGP2CLI':'pending Root guarded apply','actualActiveWrites':0,'strictGainClaimed':0}))
