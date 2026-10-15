# Apache-2.0 technical finalization. Review prose is CC-BY-4.0.
import datetime,hashlib,importlib.util,json,pathlib,subprocess,sys
sys.dont_write_bytecode=True
R=pathlib.Path('/home/enpasos/projects/skillpilot');O=pathlib.Path(__file__).parent
A=O.parent/'chemie-current407-058d-d124-whole-P-operator-alignment-targeted-remediation-author-20261014-v1'
rd=lambda p:json.loads(p.read_text());now=lambda:datetime.datetime.now(datetime.timezone.utc).isoformat()
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p):return {'path':str(p.relative_to(R)),'sha256':sha(p),'bytes':p.stat().st_size}
def wr(n,x):
 p=O/n;assert not p.exists(),p;p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return p
def verify(b):
 p=R/b['path'];assert sha(p)==b['sha256'],p
 if 'bytes'in b:assert p.stat().st_size==b['bytes'],p
def verify_recurse(x):
 if isinstance(x,dict):
  if isinstance(x.get('path'),str)and isinstance(x.get('sha256'),str):verify(x)
  for v in x.values():verify_recurse(v)
 elif isinstance(x,list):
  for v in x:verify_recurse(v)
def verify_seal(p):
 s=rd(p)
 for b in s['files']:verify(b)
 assert len(s['files'])==s['fileCount']
 return {'seal':bind(p),'allBoundFilesUnchanged':len(s['files'])}
def parse_all():
 rows=[]
 for p in sorted(O.rglob('*')):
  if p.is_file()and p.suffix in('.json','.jsonl'):
   if p.suffix=='.json':rd(p);n=1
   else:
    lines=[x for x in p.read_text().splitlines()if x.strip()]
    for line in lines:json.loads(line)
    n=len(lines)
   rows.append({'path':str(p.relative_to(R)),'parsedRecords':n})
 return rows
start=rd(O/'STARTED.actual.json');science=rd(O/'SCIENTIFIC.first-sealed-current058d-d124-whole-P-independent-b.actual.json')
assert not start['peerCurrentARead']and not science['peerCurrentARead']
assert sha(O/'FIRST-SCIENCE-SEAL.current058d-d124-P2-independent-b.actual.json')=='sha256:ee5feadf6b16f43ac835a8dee4ab7ebea9d071f3189868c3c5933e537dd06718'
verify(rd(O/'FIRST-SCIENCE-SEAL.current058d-d124-P2-independent-b.actual.json')['science'])
bindings=rd(O/'inputs/EXACT.neutral-selected-whole-input-bindings.verified.json');verify_recurse(bindings)
neutral_path=R/bindings['neutral']['path'];assert sha(neutral_path)=='sha256:2959312021cb200933de03c43367084b95aebbc8c563dd58d5846b6d70274ad9'
neutral=rd(neutral_path)
rp=O/'results/P2.actual-current-independent-b.records.jsonl';mp=O/'results/P2.actual-current-independent-b.run.json';cfg=O/'config/P2.actual-current-independent-b.stock-check.config.json'
run=rd(mp);config=rd(cfg);records=[json.loads(x)for x in rp.read_text().splitlines()if x.strip()]
assert len(records)==2 and run['outputDigest']==sha(rp)
assert run['startedAt']==start['startedAt']and run['completedAt']==science['completedAt']
assert run['blindToOtherRuns']and run['independenceGroupId']==start['independenceGroup']
assert run['goalIds']==neutral['goalIds']and run['bundleFingerprint']==sha(neutral_path)
assert run['bookDigest']==sha(R/config['landscapePath'])
assert run['criteriaFingerprint']==sha(R/config['reviewCriteriaPath'])
assert run['promptFingerprint']==sha(O/'inputs/actual-targeted-independent-B-review-instruction.md')
assert run['generationParametersFingerprint']==sha(O/'inputs/actual-provider-model-and-unexposed-generation-controls.json')
assert config['reviewRunManifestPaths']==[str(mp.relative_to(R))]
assert config['reviewPath']==str(rp.relative_to(R))
original=[json.loads(x)for x in (R/neutral['newAuthorProfiles2']['path']).read_text().splitlines()if x.strip()]
for a,b in zip(original,records):
 assert a['goalId']==b['goalId']and a['profile']==b['profile']
 assert b['reviewId']==config['reviewId']and b['reviewRunIds']==[run['runId']]
 assert b['reviewAuthority']=='ai_candidate'and b['status']=='needs_human_review'and b['evidenceLevel']=='E1'and b['maximumClaimScope']=='G1'
 for k in ('goalFingerprint','profileFingerprint','reviewInputFingerprint','reviewCriteriaFingerprint'):assert a[k]==b[k]
receipt=O/'checks/CORRECTED.STOCK.actual-current-independent-b-P2.check.completed.json'
stock=rd(receipt);assert stock['exitCode']==0 and 'Blocking issues: 0'in stock['stdout']
assert rd(O/'checks/STOCK.actual-current-independent-b-P2.check.completed.json')['exitCode']==1
provenance=rd(O/'checks/CHECK.own-record-provenance-full-input-output-bindings-and-profile-preservation.actual.json');verify_recurse(provenance)
source6=verify_seal(O.parent/'chemie-source6-five-actual-current412-full-gate-author-20261014-v1/SEAL.finite-source6-five-whole-gate-author-current280-prospective412.actual.json')
residual=verify_seal(O.parent/'chemie-source-six-original-residual-duty-author-20261014-v1/SEAL.finite-six-original-residual-duty-author.actual.json')
active=[]
base=O.parent/'chemie-current407-naturstoffe-seven-paired-resolution-existing274-integration-technical-20261014-v1'
for b in rd(base/'checks/FINAL-CHECK.active-aliases-readonly-observed-bindings.json')['files']:verify(b);active.append(bind(R/b['path']))
floor=bind(R/'app/scripts/config/curriculum-maturity-floor-policy.json');assert floor['sha256']=='sha256:2d45ea95d5e40751d57a3470b99ac2fbd6f24887b1ee3c8c7d53983d028783ea'
book=rd(R/config['landscapePath']);gi={g['id']:g for g in book['goals']}
goals=rd(R/neutral['wholeCurrentGoals']['path']);assert all(gi[g['id']]==g for g in goals)
assets=[]
for g in goals:
 for link in g.get('resourceLinks',[]):
  if link['type']=='goal-visualization':
   p=R/'app/public'/link['url'].lstrip('/');assert p.is_file();assets.append({'goalId':g['id'],'url':link['url'],'actualStockAppPublicBytes':bind(p),'newVApprovalClaim':False})
wr('checks/CHECK.exact-final-normal-P2-schema-run-profile-input-asset-and-preservation-bindings.actual.json',{
 'schemaVersion':1,'checkedAt':now(),'stockNormalP2Check':bind(receipt),'stockCheckIncludesCurrentV2ProfileConfigAndV1RunSchemas':True,
 'ownOriginalRecords':bind(rp),'ownOriginalRun':bind(mp),'ownConfig':bind(cfg),'allInputBindings':bindings,
 'actualAppPublicResources':assets,'sameWholeCurrentGoalsRequiresApplicability':True,'sameWholeProfilesAndScientificFingerprints':True,
 'onlyOwnReviewerMetadataAndRunIDsDiffer':True,'allTwoRecordsE1G1AiCandidateNeedsHumanReview':True,
 'preservedFirstFailedFormatReceipt':bind(O/'checks/STOCK.actual-current-independent-b-P2.check.completed.json'),
 'unchangedSource6':source6,'unchangedResidualSix':residual,'unchangedActiveAliasObservations':active,'unchangedProtectedFloors':floor,
 'currentAResultsOrMetadataRead':False,'actualLearnerExecutions':0,'newSourceCoursePracticalHumanDAMVGrants':False,
 'HReadOnly':True,'activeGitEngineRegistryRuntimeWrites':False})
final=wr('FINAL.targeted-whole-current-P2-independent-b.manifest.json',{
 'schemaVersion':1,'completedAt':now(),'kind':'Completed fresh targeted independent P2 reviewer B; not author acceptance of own cases',
 'firstScienceSeal':bind(O/'FIRST-SCIENCE-SEAL.current058d-d124-P2-independent-b.actual.json'),
 'science':bind(O/'SCIENTIFIC.first-sealed-current058d-d124-whole-P-independent-b.actual.json'),
 'exactAuthorNeutral':bindings['neutral'],'originalOwnP2Records':bind(rp),'originalOwnStandardRunManifest':bind(mp),'normalP2Config':bind(cfg),
 'normalStockCheck':bind(receipt),'currentScopeGoals':neutral['goalIds'],'PDesignDecisions':['058d current whole P design accepted as E1/G1 ai_candidate','d124 current whole P design accepted as E1/G1 ai_candidate'],
 'currentAOutcomesAndMetadataRead':False,'peerComparisonPerformed':False,'sourceCoursePracticalHolds':'Retained; BW/TH/SN actual execution is not met by synthetic data; BY-GA evaluation-only and SH chromatography do not grant current planning/electrophoresis scope.',
 'legacySaltCaseDocumentation':'The unchanged salt case has bilingual task/model answer but a generic German-only rubric; treated as supporting solubility material, not a new actual-execution requirement or a whole-goal-alone proof.',
 'humanApproval':False,'actualLearnerWork':False,'newDAMVOrSourceGrant':False,'newStrictClosuresMeasured':0,
 'HReadOnly':True,'activeEngineRegistryRuntimeGitWrites':False})
(O/'README.md').write_text('''# Gezieltes unabhängiges P2-B-Review

Beide aktuellen ganzen Profile058d/d124 sind fachlich als **E1/G1 ai_candidate / needs_human_review** akzeptabel. Sechs ganze Fälle, Aufgabenmaterial, DE/EN-Aufgaben und Modellantworten sowie die vollständigen Rubriken und Profile wurden gegen die unveränderten ganzen Ziele, Voraussetzungen und gebundenen Quell-/Kurskontexte gelesen. Die eigene Wissenschaft ist vor jeder aktuellen A-Einsicht versiegelt. Keine aktuellen A-Metadaten oder Outcomes gelesen; keine Peer-Synthese.

058d verlangt Erklären/Ableiten; der kontrollierte synthetische Wärmevergleich, der unterstützende Aussalzfall und Enzymaktivitäts-/Kontexttransfer tragen die ganze Kompetenz. d124 prüft Planung und Auswertung in allen drei Aminosäurefällen; der pH-Transfer enthält eine echte Richtungsumkehr. Kein GA/GK-Planungsverzicht und keine zusätzliche Protein-/SDS-Pflicht im aktuellen Profil. Der alte Proteinfall bleibt vollständig historisch erhalten.

Die normale unveränderte Stock-P2-Prüfung besteht: zwei needs_human_review, null approved, null blocking issues; V2-Profile und vollständiger Standard-V1-Runmanifest sind geprüft. Ein erster technischer Configfehler (großesP im reviewId-Slug) und alle ursprünglichen Bytes sind erhalten. Die Korrektur änderte ausschließlich die eigenen Container-/Runmetadaten; Wissenschaft, Profile und fachliche Fingerprints blieben exakt.

Grenzen bleiben ausdrücklich erhalten: keine reale Labor-/Lernendenleistung; BW/TH/SN-Durchführungspflichten offen; keine neue BY-GA-Planungsquelle oder SH-Elektrophoresequelle. Die ältere Salzfall-Rubrik ist allgemein und nur deutsch; sie wird als unterstützende Löslichkeitserklärung gelesen. Kein einzelner Unterstützungsfall trägt allein die ganze Kompetenz. Kein Source-/D/A/M/V-/Human-/Releaseabschluss, keine Aktivierung und keine neue zentrale Strict-Zählung.

Fertiges Source6- und Rest6-Autorpaket sind unverändert nachgeprüft. H nur gelesen; aktive Dateien, Engine, Registry, Git und geschützte Fächer unverändert. Eigene Reviewinhalte CC-BY-4.0, technische Skripte Apache-2.0; amtliche Quellenrechte bleiben getrennt.
''')
assert not any(p.is_symlink()for p in O.rglob('*'))
spec=importlib.util.spec_from_file_location('targeted_p2_b_stock_guard',R/'scripts/validate_schemas.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
errors=mod.curriculum_symlink_errors(str(R));assert not errors,errors
names='\n'.join(str(p.relative_to(R))for p in sorted(O.rglob('*'))if p.is_file())+'\n'
ignored=subprocess.run(['git','check-ignore','--no-index','--stdin'],cwd=R,input=names,text=True,capture_output=True);assert ignored.returncode==1 and not ignored.stdout
parsed=parse_all()
wr('checks/CHECK.finite-all-JSON-JSONL-and-actual-stock-curriculum-symlink-guard.actual.json',{
 'schemaVersion':1,'checkedAt':now(),'parsedFilesBeforeThisReceipt':parsed,'parseErrors':0,
 'stockGuard':'scripts/validate_schemas.py::curriculum_symlink_errors','stockGuardErrors':errors,'ownSymlinks':0,'ignoredOwnFiles':[],
 'noIgnoredTmpCurriculumLinkIntroduced':True,'noGlobalQAOrHostCopy':True})
parse_all();files=[bind(p)for p in sorted(O.rglob('*'))if p.is_file()]
seal=wr('SEAL.finite-current058d-d124-targeted-P2-independent-b.actual.json',{
 'schemaVersion':1,'startedAt':start['startedAt'],'scienceCompletedAt':science['completedAt'],'completedAt':now(),
 'kind':'Finite genuine independent targeted P2 B review with stock-valid original records and full standard run manifest',
 'root':str(O.relative_to(R)),'fileCount':len(files),'totalBytes':sum(x['bytes']for x in files),'files':files,
 'finalManifest':bind(final),'firstScienceSeal':bind(O/'FIRST-SCIENCE-SEAL.current058d-d124-P2-independent-b.actual.json'),
 'wholeCasesRead':6,'wholeProfilesRead':2,'normalStockP2CheckExit':0,'allJSON_JSONLParse':True,'stockCurriculumSymlinkErrors':0,
 'currentAOutcomesOrMetadataRead':False,'aiCandidateE1G1Records':2,'approvedRecords':0,'actualLearnerExecutions':0,
 'newSourceCoursePracticalHumanDAMVGrant':False,'newStrictGainMeasured':0,'HReadOnly':True,'activeGitEngineRuntimeRegistryWrites':False})
verify_seal(seal);parsed=parse_all()
print(json.dumps({'root':str(O.relative_to(R)),'seal':bind(seal),'final':bind(final),'records':bind(rp),'run':bind(mp),
 'allParsedJSONJSONLIncludingSeal':len(parsed),'files':len(files),'bytes':sum(x['bytes']for x in files),'guardErrors':0},ensure_ascii=False))
