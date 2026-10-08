# SPDX-License-Identifier: Apache-2.0
"""A neutral, immutable first author input; no independent verdicts are invented."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib, json, os, subprocess, jsonschema, importlib.util
R=Path.cwd();D=Path(__file__).resolve().parent;REQ={}
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
rel=lambda p:str(Path(p).relative_to(R))
def bind(p):
 p=Path(p);v={'path':rel(p),'sha256':sha(p),'bytes':p.stat().st_size};REQ[v['path']]=v;return v
def read(p):bind(p);return json.loads(Path(p).read_text())
def verify(v,base=R):
 p=base/v.get('relativePath',v.get('path'));assert sha(p)==v['sha256'].removeprefix('sha256:'),p
 assert 'bytes'not in v or p.stat().st_size==v['bytes'];return bind(p)
def put(name,v):
 p=D/name;p.parent.mkdir(exist_ok=True,parents=True);assert not p.exists(),p;b=((v if isinstance(v,str)else json.dumps(v,ensure_ascii=False,indent=2))+'\n').encode();t=p.with_suffix(p.suffix+'.tmp');t.write_bytes(b);os.replace(t,p);return bind(p)
g=read(D/'current24-author-inputs-and-lossless-source-AM.guard.json');verify(g['rootEntry']);rootEntry=read(R/g['rootEntry']['path']);ids=g['selected24GoalIds'];assert len(ids)==24 and not set(ids)&set(rootEntry['separateEvolution18GoalIds'])
verify(g['current476CanonicalSnapshot']);verify(g['current476KindsSnapshot']);verify(g['positiveCriteriaSnapshot']);verify(g['futureReviewed18SourceMappingBaseline']);verify(g['futureReviewed18SourceExtractionBaseline'])
for v in read(D/'checks/initial-declared-inputs.author.json')['files']:verify(v)
active=R/rootEntry['current476Whole392AtomicCanonical']['path'];assert sha(active)==rootEntry['current476Whole392AtomicCanonical']['sha256'];bind(active);assert active.read_bytes()==(R/g['current476CanonicalSnapshot']['path']).read_bytes()
assert sha(R/rootEntry['actualCurrent204CentralBaseline']['path'])==rootEntry['actualCurrent204CentralBaseline']['sha256'];bind(R/rootEntry['actualCurrent204CentralBaseline']['path'])
nativeChecks=[]
for n in ['A392-retained-native','M392-retained-native','P14-source-only-standard-materializer','P14-source-only-standard-review']:
 t=read(D/'checks'/f'{n}.terminal.actual.json');assert t['actualExitCode']==0;nativeChecks.append(t)
P=read(D/'checks/P14-source-only-closed-v2-schema-fingerprint-case-bindings.actual.json');assert P['actualErrors']==0 and P['approved']==0 and P['humanReviewPending']==14 and not P['actualRasterReviewed']
for lane,n in [('A','semantic-atomicity'),('M','memory-card-review')]:
 cfg=read(R/f'curricula/DE/Gymnasium/quality/{n}/canonical-biology-full.config.json');assert (R/cfg['reviewPath']).read_bytes()==(D/f'AM/{lane}.whole392.current-reviewed.exact.jsonl').read_bytes();bind(R/cfg['reviewPath'])
lines=(D/'AM/M.whole392.current-reviewed.exact.jsonl').read_text().splitlines();assert len(lines)==392
source=read(D/'source/whole24-all-current-regional-source-duties-all-1n-partners.lossless.json');assert source['matchedEdges']==50 and source['uniqueSourceDuties']==45 and source['allPartnerRows']==293
assert sum(len(s['allPartnerRows'])for s in source['sourceGoals'])==293
for pair in source['mappingExtractionGuards']:verify(pair['mapping']);verify(pair['extraction'])
for duty in source['sourceGoals']:
 m=read(R/duty['mappingPath']);e=read(R/duty['sourceExtractionPath']);sid=duty['wholeRetainedExtractionGoal']['id'];assert duty['wholeRetainedExtractionGoal']==next(s for s in e['sourceGoals']if s['id']==sid);assert duty['wholeCurrentDecision']==next(s for s in m['decisions']if s['sourceGoalId']==sid);assert duty['allPartnerRows']==[s for s in m['mappings']if s['legacyGoalId']==sid]
assert not any(s['relevanceToSelected24']for s in source['existingPartnerDecisionDifferences'])
proposals=read(D/'source/whole24.actual-primary-components-source-kind-operator-atom.author-proposals.json');assert len(proposals['whole24Proposals'])==24 and not proposals['whole144ReleaseClaim']
before=read(R/g['futureReviewed18SourceExtractionBaseline']['path']);assert len(before['sourceGoals'])==144
beforeBy={s['id']:s for s in before['sourceGoals']}
for p in proposals['whole24Proposals']:
 assert p['wholeExactCurrentSourceRow']==beforeBy[p['sourceGoalId']]and not p['mandatoryNamedWholeGoalClaim']and not p['wholeCandidateApproval']
 for c in p['actualPrimaryComponents']:
  file=R/c['wholeOriginalPagePath'];assert sha(file)==c['wholeOriginalPageSha256'].removeprefix('sha256:');bind(file);literal='\n'.join(file.read_text().splitlines()[c['firstTextLine1Based']-1:c['lastTextLine1Based']]);assert literal==c['originalText'];assert hashlib.sha256(literal.encode()).hexdigest()==c['originalTextSha256'].removeprefix('sha256:')
assert [p['ordinal']for p in proposals['whole24Proposals']if p['sourceStatus']=='atom_hold']==[8,16]
futureSourceSeals=[]
for folder,name,digest in [
 ('biologie-he-evolution-eighteen-decision-locators-independent-a-20261008-v3','independent-a.decision-locators-v3.final.freeze.json','d2da6ffcf26a9f3faefeb09590e59748cce12fb1554b2ae5da655a952368de3d'),
 ('biologie-he-evolution-eighteen-decision-locators-independent-b-20261008-v3','eighteen-source-v3-independent-b.final-portable.freeze.json','b78017bdcda64e4670d38595d10a89c88cdcf4f8bef5599897b0f26b57855bc1')]:
 p=D.parent/folder/name;assert sha(p)==digest;f=read(p)
 for v in f['files']:
  base=R if v['path'].startswith('curricula/')else p.parent;verify(v,base)
 futureSourceSeals.append({'seal':bind(p),'actuallyVerifiedFrozenFiles':len(f['files']),'reuseBoundary':'Only unchanged genuine evolution18 source-v3 baseline. Not new approval of these24 source/science proposals or full144.'})
whole=read(D/'whole48.material-task-model-scoring-independent-fresh-transfer.DEEN.author.json');assert len(whole['cases'])==48 and whole['goalCount']==24
can=read(R/g['current476CanonicalSnapshot']['path']);by={a['id']:a for a in can['goals']};assert len(by)==476
for c in whole['cases']:
 assert c['wholeCurrentGoal']==by[c['goalId']]and c['evidence']['level']=='E1'and c['evidence']['maximumClaimScope']=='G1'and not c['evidence']['humanTrial']and not c['evidence']['actualLearnerPerformance']and not c['evidence']['performedExperiment']
 assert sum(a['points']for a in c['scoring']['criteria'])==c['scoring']['maximumPoints']==10 and len(c['scoring']['criteria'])==5
 assert c['freshTransfer']['task']!=c['task']and not c['freshTransfer']['performed']
schema=read(R/'contracts/goal-evidence/v2/goal-evidence-profile.schema.json');profileValidator=jsonschema.Draft202012Validator({'$schema':schema['$schema'],'$defs':schema['$defs'],'$ref':'#/$defs/profile'});candidates=read(D/'P24.whole48-complete-DEEN-author.candidates.json');assert len(candidates['goals'])==24
for p in candidates['goals']:profileValidator.validate(p['profile']);assert p['evidenceLevel']=='E1'and p['maximumClaimScope']=='G1'
jsonschema.Draft202012Validator(read(R/'docs/landscape-runtime.schema.json')).validate(can)
arith={'fitnessFirstRelative':[1/4,2/4,4/4],'fitnessSecondContributions':[.8*2,.6*4],'fitnessSecondRelativeA':(.8*2)/(.6*4),'occupancyExpected':4-4*.1+6*.2,'scenarioEqualMeans':[(80+20)/2,(60+50)/2],'scenarioReweightedMeans':[.9*80+.1*20,.9*60+.1*50],'regressionPredictions':[100-5*(t-15)for t in [16,20,24]],'regressionResiduals':[94-95,77-75,54-55]}
assert abs(arith['occupancyExpected']-4.8)<1e-12 and arith['scenarioReweightedMeans']==[74,59]and arith['regressionResiduals']==[-1,2,-1]
put('checks/actual-whole48-author-arithmetic-primary-component-and-native-contract-checks.json',{'role':'Author internal consistency only, not independent science approval','actual24ProfileBodiesClosedSchemaErrors':0,'actualRuntime476SchemaErrors':0,'actual48CasePoints10Each':True,'actual48SeparateFreshConceptTransfers':True,'actualPrimaryComponentBodiesAndCourseHeadersChecked':True,'modelArithmetic':arith,'nativeAffectedTerminalChecks':nativeChecks,'P14SourceOnlyClosedV2Errors':0,'actualP14Approved':0,'actualP14NeedsHumanReview':14,'sourceHoldsRemain':[8,16],'source144NeuroGK2HoldRetained':True,'imagesD_VReviewed':False,'activeWrites':0,'strictGainClaimed':0})
entry=put('neutral-whole24-source-science-and-whole48-independent-review.author.entry.json',{
 'schemaVersion':1,'role':'First neutral AUTHOR candidate for two genuinely independent whole24 source/science/P reviewers',
 'goalIds':ids,'rootSelection':g['rootEntry'],'wholeCurrentCanonical476':g['current476CanonicalSnapshot'],'current392SemanticKindLedger':g['current476KindsSnapshot'],
 'wholeCurrent24DEENGoalsParentsPrerequisitesConsumers':rel(D/'selected24.current-whole-goals.context.author.json'),
 'whole48CompleteBilingualMaterialTasksModels10PointAndFreshTransfers':rel(D/'whole48.material-task-model-scoring-independent-fresh-transfer.DEEN.author.json'),
 'whole24AuthorProfiles':rel(D/'P24.whole48-complete-DEEN-author.candidates.json'),
 'nativeP14SourceOnlyCandidates':rel(D/'P14.clear-current-source-only.author.review.jsonl'),
 'nativeP14SourceOnlyConfig':rel(D/'P14.clear-current-source-only.author.config.json'),
 'source24ActualPrimaryOperatorAtomProposals':rel(D/'source/whole24.actual-primary-components-source-kind-operator-atom.author-proposals.json'),
 'allCurrentRegionalSourceDutiesAndEveryPartner':rel(D/'source/whole24-all-current-regional-source-duties-all-1n-partners.lossless.json'),
 'sourcePoolCounts':{'sourceDuties':45,'matchedGoalBindings':50,'allPartnerRows':293},
 'whole144Future18ReviewedBaseline':g['futureReviewed18SourceExtractionBaseline'],'whole144Future18v3Mapping':g['futureReviewed18SourceMappingBaseline'],
 'genuineUnchangedSourceV3BaselineABSeals':futureSourceSeals,
 'originalPrimaryFullPagesAndScopeReading':rel(D/'primary/actual-primary-original-page-and-scope-reading.author.receipt.json'),
 'explicitSourceAtomHoldsOrdinals':[8,16],
 'authoredNonmandatoryModelExtensionsOrdinals':[11,12,13,14,17,18,19,24],
 'wholeCurrentSource24OriginalNumericOfficialLabelsNotCopiedAsAuthority':True,
 'keepWholeOriginalTextsAndOneEnglishProposal':rel(D/'whole24.keep-originals-and-one-English-wording-proposal.author.json'),
 'EnglishProposalApplied':False,'allOtherGoalBodiesExact':True,
 'A392M392ExistingNativeChecksActual0':True,'noNewAtomApprovalFromRetainedChecks':True,
 'nativeP14MaterializerAndOrdinaryCLIPassedSourceOnly':True,'nativeP14RasterReviewed':False,'P14Approved':0,'P14HumanReviewPending':14,
 'current204StrictBindingsProtected':True,'currentMath807Phys478Chem173FloorsUnchangedByAuthor':True,
 'reviewerInstructions':'Read each complete current DE/EN goal, prerequisites, parents and consumers, all two whole bilingual synthetic cases, each 10-point scoring rule and separate changed concept transfer. Independently judge factual correctness, whole-goal coverage and material adequacy; do not count model answers as learner or experiment performance. Inspect actual original primary full HE pages and native BY scopes, plus every exact regional 1:n partner/operator duty. Distinguish actual mandatory original content from bounded operationalization and optional authored model elaboration. Preserve evolution18 source-v3 judgments and full144 NeuroGK2 HOLD; this packet is not full144 release. Resolve or retain the explicit fermentation explanation-plus-execution and endocrine-plus-persistence atomicity/source holds. Give your own source-kind/role and A/M judgments for any concrete text proposals; exact retained A/M0 is not a new scientific endorsement. Write and seal your own first conclusions before seeing the other reviewer. No current D/V/native raster review exists here. Roots image generation and native current D/P/V preparation follow only the genuinely clear subset.',
 'independentReviewResultsPending':2,'authorApproval':False,'reviewerRunsOrVerdictPlaceholders':0,
 'actualLearnerEvidence':False,'performedExperiments':0,'humanApproval':False,'humanTrial':False,'activeWrites':0,'strictGainClaimed':0,
})
put('AUTHOR-READINESS.md','''# Biologie: 24 ganze Autorenkandidaten zu Stoffwechsel und Ökologie

Die feste aktuelle Auswahl enthält 24 unveränderte ganze DE/EN-Ziele mit allen direkten Eltern, Voraussetzungen und Verbrauchern. Alle 48 vollständigen bilingualen synthetischen Fälle enthalten Material, Aufgabe, Modellantwort, vier fachliche 2-Punkte-Kriterien und einen separat gestellten echten Konzepttransfer für weitere 2 Punkte. Die Aufgabenmodelle sind E1/G1, ai_candidate und needs_human_review; keine Lernendenleistung, Labor-/Feldarbeit, Tierstudie oder menschliche Erprobung wird behauptet.

Die Quellenbasis behält die echten reviewed-future Evolution18v3-Entscheidungen und alle 144 HE-IDs. Für die neue Auswahl werden 45 ganze aktuelle regionale Pflichten mit 50 Zielbindungen und sämtlichen 293 Partnerrows ohne Verlust eingefroren. Die 24 konkreten Quellenvorschläge enthalten echte volle HE-Seiten und exakte unnormalisierte Originalkomponenten mit tatsächlichen Seiten-/Zeilen-/Niveauangaben. Aktuelle BY13EA/GA und relevante BY12GA-Scope-Texte sind vollständig erhalten. Alte normalisierte Q3/Q4-Zählung und officialCompetency-Labels sind keine Originalzitate. Andere 120 Quellenzeilen und die reviewed Evolution18-Bedeutung werden nicht geändert; ein Ganz144-Abschluss und der bestehende NeuroGK2-HOLD werden nicht behauptet oder aufgehoben.

Fermentationskonzepte plus experimentelle Untersuchung sowie endokrine Disruption plus Schadstoffpersistenz sind explizite offene Atom-/Quellenbefunde. Schriftliche Planung und Datenauswertung sind keine durchgeführte Untersuchung. Stochastik, Metapopulation, Bioinformatik, Kipppunkte und Resilienz sowie zusätzliche Artkonzept-/Fitnessmodellierung werden als konkrete Autorenvertiefungen behandelt, soweit die Originalquelle sie nicht ausdrücklich benennt. Keine Pflichtpunktbehauptung wird aus allgemeinen Modelltexten oder Semester-Routing abgeleitet.

Eine kleine tatsächliche englische Formulierungskorrektur zu Tracerexperimenten wird separat vorgeschlagen; sie ist nicht aktiv und nicht auf die originalen P-/AM-Kandidaten angewendet. Andere Texte bleiben unverändert. Zwei echte unabhängige Whole-Science-/Source-Reviews sind der nächste Schritt; sie entscheiden klaren Scope und Grenzfälle. Danach erst folgen tatsächliche Bilder und native aktuelle D/P/V-Reviews durch getrennte Prüfer.

Reguläre betroffene native Checks bestehen: unveränderte vollständige A392/M392, standardmäßiger Source-only-P14-Materializer und -Checker sowie geschlossene v2-Profil-/Fingerprint-/Fallbindungen. Die 14 P-Kandidaten bleiben vollständig needs_human_review, Approved0. Source-only bedeutet ausdrücklich keine Bildbindung oder Rasterfreigabe. Alle 24 Profilkörper und die vollständige 476er-Kopie bestehen Schema; 48 Punktebilanzen und die tatsächlichen Zahlenbeispiele wurden geprüft. Keine D-/V-Records, Reviewruns, Resolutionen, Rasterbilder oder KI-/Human-Freigaben sind aus diesem Paket entstanden. Strenger Nettozuwachs und aktive Writes sind0.
''')
spec=importlib.util.spec_from_file_location('normal_schema_validator',R/'scripts/validate_schemas.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
runtimeSchema=read(R/'docs/landscape-runtime.schema.json');parsed=0
for p in sorted(D.rglob('*')):
 if not p.is_file():continue
 if p.suffix=='.json':assert module.validate_file(str(p),runtimeSchema);parsed+=1
 elif p.suffix=='.jsonl':
  for line in p.read_text().splitlines():json.loads(line)
 if p.suffix in ['.pyc','.tmp']:raise AssertionError(('Unneeded generated own cache must not become required',p))
 bind(p)
ignored=subprocess.run(['git','check-ignore','--no-index','--stdin'],input='\n'.join(REQ)+'\n',capture_output=True,text=True);assert ignored.returncode in [0,1]and not ignored.stdout.strip(),ignored.stdout
links=[]
for path in list(REQ):
 p=R/path
 if p.is_symlink():
  t=os.readlink(p);assert not os.path.isabs(t);resolved=p.resolve(strict=True);assert resolved.is_relative_to(R)and rel(resolved)in REQ;links.append({'path':path,'containedRelativeTarget':t,'target':bind(resolved),'broken':False})
portable=put('checks/first-author-whole24-required-portability-and-genuine-baseline-history.actual.json',{'checkedAt':datetime.now(timezone.utc).isoformat(),'requiredFiles':list(REQ.values()),'actualContainedRelativeAliases':links,'ignoredRequiredFiles':[],'brokenRequiredSymlinks':0,'actualGitCheckIgnoreExit':ignored.returncode,'allOwnJSONActualNormalValidatorParsed':parsed,'allOwnJSONLParsed':True,'rawPrimaryPDFHTMLNotRequired':'Primary locators/digests are metadata, complete portable official text/components are actual new review inputs. All other current regional extractions/mappings/partner bodies retained without blanket new approval.','authorNoImagesD_VRunsOrResolution':True,'independentScienceSourceReviewsPending':2,'activeWrites':0,'strictGainClaimed':0,'humanApproval':False})
seal=put('whole24-source-science-P14-author.first-input.freeze.json',{'schemaVersion':1,'sealedAt':datetime.now(timezone.utc).isoformat(),'kind':'First immutable neutral whole24 author science/source/P candidate for two genuine independent reviewers','ownFiles':[bind(p)for p in sorted(D.rglob('*'))if p.is_file()],'requiredPortableInputs':portable,'neutralEntry':entry,'genuineUnchangedEvolution18SourceV3BaselineABSeals':futureSourceSeals,'wholeCurrentCanonical476Atomic392':True,'wholeCurrent24DEENBodiesExact':True,'wholeComplete48DEENScoringFreshTransfers':True,'all45SourceDuties293PartnerRowsExact':True,'full144SourceNotApproved':True,'sourceAtomHoldsRemain':[8,16],'nativeAM392ExactCheck0':True,'nativeP14SourceOnlyMaterializerCLIClosedSchemaSemantics0':True,'P14Approved':0,'P14HumanReviewPending':14,'rasterD_VReviewOrApproval':False,'reviewerRunVerdictOrResolutionPlaceholders':0,'activeWrites':0,'strictGainClaimed':0,'humanApproval':False,'humanTrial':False})
print(json.dumps({'neutralEntry':entry,'firstAuthorSeal':seal,'requiredPortableFiles':len(REQ),'normalOwnJSONParsed':parsed,'ignoredRequired':0,'brokenAliases':0,'whole24Complete48CasesTrue':True,'nativeSourceOnlyP14_0':True,'nativeExactAM392_0':True,'sourceAtomHolds':[8,16],'activeWrites':0,'strictGainClaimed':0}))
