# SPDX-License-Identifier: Apache-2.0
"""Seal this reviewer's real bounded source-role judgment; no active application."""
from pathlib import Path
from datetime import datetime,timezone
import json,hashlib,subprocess,importlib.util,fitz
root=Path.cwd();own=Path(__file__).resolve().parent
author=own.parent/'chemie-q3-three-BW-practical-source-role-remediation-author-root-20261008-v1'
read=lambda p:json.loads(p.read_text())
def bind(p):
 b=p.read_bytes();return {'path':p.relative_to(root).as_posix(),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(n,x):
 with (own/n).open('x') as out:json.dump(x,out,ensure_ascii=False,indent=2);out.write('\n')
def binary(n,data):
 with (own/n).open('xb') as out:out.write(data)
entry_path=author/'neutral-practical-three-whole-source-roles.author.entry.json';seal_path=author/'practical-three-source-role-author.first-input.freeze.json'
entry=read(entry_path);seal=read(seal_path)
assert bind(entry_path)['sha256']=='7b7826b9e5cdf4dbc4fbf09b443aff601c59b39fdac673715f39ab4d27be9f29'
for b in seal['files']:assert bind(root/b['path'])==b
selected=set(entry['selectedSourceGoalIds']);oldmap=read(author/'mapping126-211.exact-before.snapshot.json');newmap=read(root/entry['candidateMapping']['path'])
oldex=read(author/'extraction126.exact-before.snapshot.json');newex=read(root/entry['candidateExtraction']['path'])
oldgoals={g['id']:g for g in oldex['sourceGoals']};newgoals={g['id']:g for g in newex['sourceGoals']}
assert len(oldgoals)==len(newgoals)==126 and oldgoals.keys()==newgoals.keys()
assert all(oldgoals[i]==newgoals[i] for i in oldgoals if i not in selected)
source_diffs=[]
for i in sorted(selected):
 diffs={k:{'before':oldgoals[i].get(k),'after':newgoals[i].get(k)} for k in oldgoals[i].keys()|newgoals[i].keys() if oldgoals[i].get(k)!=newgoals[i].get(k)}
 if diffs:source_diffs.append({'sourceGoalId':i,'diffs':diffs})
 assert not diffs or list(diffs)==['sourceRef']
assert len(source_diffs)==2
assert [d for d in oldmap['decisions'] if d['sourceGoalId'] not in selected]==[d for d in newmap['decisions'] if d['sourceGoalId'] not in selected]
assert [d for d in oldmap['mappings'] if d['legacyGoalId'] not in selected]==[d for d in newmap['mappings'] if d['legacyGoalId'] not in selected]
assert len(oldmap['mappings'])==211 and len(newmap['mappings'])==217
assert len([d for d in newmap['mappings'] if d['legacyGoalId'] in selected])==9
assert len([d for d in oldmap['mappings'] if d['legacyGoalId'] in selected])==3
for a,b in zip(oldex['passages'],newex['passages']):assert {k:v for k,v in a.items() if k!='sourcePath'}=={k:v for k,v in b.items() if k!='sourcePath'}
oldcanon=read(author/'canonical480.current-before.snapshot.json');active_path=root/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';active=read(active_path)
oldby={g['id']:g for g in oldcanon['goals']};activeby={g['id']:g for g in active['goals']}
partnerids=entry['selectedContentGoalIds']+entry['executionDataPartnerIds'];assert len(set(partnerids))==5
assert all(oldby[i]==activeby[i] for i in partnerids)
whole=read(root/entry['wholeSourcePartnerInput']['path'])
assert len(whole['rows'])==3
for r in whole['rows']:
 assert r['wholeOriginalExtractionGoal']==oldgoals[r['sourceGoalId']] and r['wholeCandidateExtractionGoal']==newgoals[r['sourceGoalId']]
 assert all(g==oldby[g['id']] for g in r['wholePartnerCanonicalGoals'])
write('actual-three-role-six-edge-two-locator-current-five-partner.delta.independent-b.json',{'schemaVersion':1,'checkedAt':datetime.now(timezone.utc).isoformat(),'authorFirstSeal':bind(seal_path),'actualSourceLocatorChanges':source_diffs,'retainedOfficialSourceGoalIDs':126,'unchangedSourceRows':123,'unchangedDecisions':123,'unchangedOldMappingRows':208,'appendedPartialPartnerRows':6,'oldThreeExactEdgesNowPartial':True,'wholeFivePartnersExactToCurrentActiveCanonical':True,'observedCurrentCanonical':bind(active_path),'allWholePassageScienceExactExceptTechnicalSourcePath':True,'sourceWordOperatorRemoval':0,'scientificClosureNotInferredFromTheseChecks':True,'currentPeerRead':False,'activeWrites':0})
pdf=root/entry['originalPrimaryPDF']['path'];assert bind(pdf)==entry['originalPrimaryPDF'];doc=fitz.open(pdf)
primary=[]
for physical,printed in [(27,25),(33,31),(41,39)]:
 originaltxt=author/f'primary-physical-{physical:03}-printed-{printed:03}.actual-whole-page.txt'
 assert doc[physical-1].get_text().encode()==originaltxt.read_bytes()
 argv=['pdftotext','-f',str(physical),'-l',str(physical),'-layout',str(pdf),'-'];r=subprocess.run(argv,capture_output=True)
 assert r.returncode==0
 n=f'BW-physical-{physical:03}-printed-{printed:03}.whole-original-layout.independent-b.actual.txt';binary(n,r.stdout)
 binary(f'BW-{physical:03}.whole-page-extraction.stderr.actual.txt',r.stderr)
 primary.append({'physicalPage':physical,'printedPage':printed,'officialURL':entry['originalOfficialURL'],'observedOriginalPDFSHA256':entry['originalPrimaryPDF']['sha256'],'actualArgv':argv,'actualExit':r.returncode,'actualWholeLayoutOutput':bind(own/n),'stderr':bind(own/f'BW-{physical:03}.whole-page-extraction.stderr.actual.txt'),'portableAuthorPyMuPDFWholeText':bind(originaltxt),'independentPyMuPDFWholeBytesEqualAuthor':True,'wholeOriginalPageActuallyRead':True,'layoutAndPyMuPDFDifferentFormattingNotScientificDrift':True})
ignore_pdf=subprocess.run(['git','check-ignore','--stdin'],input=(pdf.relative_to(root).as_posix()+'\n').encode(),capture_output=True)
assert ignore_pdf.returncode==0
write('actual-three-whole-official-pages-and-local-original-observation.independent-b.receipt.json',{'schemaVersion':1,'reviewedAt':datetime.now(timezone.utc).isoformat(),'pages':primary,'originalPDFObservation':entry['originalPrimaryPDF'],'originalOfficialURL':entry['originalOfficialURL'],'ignoredOriginalPDFLocalObservationOnly':True,'actualPDFCheckIgnoreExit':ignore_pdf.returncode,'originalPDFIsNotOwnRequiredPortableFile':True,'rawPDFNotForceAdded':True,'wholeOriginalCourseScopesActuallyRead':{'27':'Basisfach','33':'Leistungsfach','41':'Leistungsfach'},'normalizedExtractionNotQuotedAsOfficialWholePage':True,'currentPeerRead':False,'activeWrites':0})
reasons={
'bw-chem-sekii-3-3-2-b07-a01-2cd72615':{
 'officialDuty':'Experimentally investigate shifts of chemical equilibrium and explain them using Le Chatelier; Basisfach3.3.2(7), actual printed25/physical27.',
 'contentContribution':'5a24 predicts the effects of concentration, pressure and temperature and applies the principle. It contributes the explanatory concept, not the experimental investigation procedure.',
 'processContribution':'91238 genuinely includes safe planning, performing and recording qualitative/quantitative investigations, and49 genuinely includes data documentation/evaluation. They are real partial execution/data contributions.',
 'remainingGap':'The proposed three partner bodies do not require applying that investigation process to an equilibrium-shift system. Current hypotheses/investigation is broad lower-secondary/global competence; the data goal expressly allows researched rather than experimentally measured data. An unrelated investigation plus an equilibrium prediction meets those separate bodies without evidencing this particular combined duty. The candidate rationale requests contextual judgment but supplies no concrete context-bound procedural witness or reviewed coupling.',
 'minimalRemedy':'Provide an operative reviewed application/coverage binding joining a safe concrete equilibrium-shift investigation, controlled condition change, observation and Le Chatelier explanation to these existing partner goals. Establish that the BW course projection retains the required partners. If that cannot be expressed without changing the existing goals, add a bounded practical child; do not erase the original operator or make a human/performed-trial prerequisite for machine QS.'},
'bw-chem-sekii-3-4-2-b06-a01-99efae9b':{
 'officialDuty':'Perform and evaluate a model experiment of equilibrium establishment; Leistungsfach3.4.2(6), actual printed31/physical33.',
 'contentContribution':'81373 characterizes models at substance/particle level and explains static macroscopic versus dynamic microscopic equilibrium. It supports interpretation; it does not explicitly require operating a model experiment and evaluating its resulting progression.',
 'processContribution':'91238 provides broad investigation execution and optional appropriate model use;49 provides general data evaluation. These are useful partial contributions, not a concrete equilibrium model protocol.',
 'remainingGap':'Optional model use in any general investigation is not the mandatory equilibrium-establishment model experiment in this source. Whole81373 can be assessed with explanatory supplied diagrams alone; the other two can be met elsewhere. No current procedure/data sequence connects a specified reversible-transfer model, repetition toward steady macroscopic amounts, continuing two-way exchange and model-limit evaluation.',
 'minimalRemedy':'Bind a complete safe equilibrium model protocol and its successive observations/analysis to current81373 plus process91238/data49, with substance-versus-particle distinction and the limits of the analogy. This can be a truthful synthetic teacher/reviewer machine-QS case; no performed learner experiment or human approval is inferred. Otherwise retain a bounded practical gap/new-child decision.'},
'bw-chem-sekii-3-4-7-b06-a01-46c58b93':{
 'officialDuty':'Experimentally determine cell voltages of galvanic cells; Leistungsfach3.4.7(6), actual printed39/physical41.',
 'contentContribution':'8be14 interprets standard potentials, predicts redox reactions and calculates standard-condition open-circuit/cell voltage. Calculation is a meaningful contextual contribution but does not specify measuring an actual cell voltage.',
 'processContribution':'91238 can perform general investigations;49 can evaluate experimental or researched data. They do not themselves specify a galvanic measurement circuit or electrical measurement conditions.',
 'remainingGap':'A calculated Ecell from a potential table plus an unrelated general experiment or researched dataset does not cover experimental voltage determination. The packet supplies no context-bound procedure for assembling the galvanic-cell measurement, meter/polarity/open-circuit reading, conditions, recording and comparing measured with predicted voltage.',
 'minimalRemedy':'Provide a concrete reviewed context-bound measurement protocol/observable and sample data evaluation associated with the existing partners, preserving sign/polarity, conditions and open-circuit-versus-loaded distinction as appropriate. Show actual BW-LK partner visibility. A new small practical goal is needed only if the current operational bindings cannot carry the retained requirement; synthetic machine-QS is distinct from a real learner experiment.'}}
verdicts=[]
for row in whole['rows']:
 i=row['sourceGoalId'];rr=reasons[i]
 verdicts.append({'sourceGoalId':i,'decision':'HOLD_full_practical_duty_closure','operatorAndCourseScopePreserved':True,'actualWholePrimaryPageActuallyRead':True,'actualWholeOriginalAndProposedDEENPartnerBodiesActuallyRead':True,'oldSoleExactEdgeDecision':'KEEP_correction_to_partial','newExecutionDataEdgesDecision':'KEEP_as_partial_contributions_only','locatorDecision':'KEEP_actual_page_binding','substantiveIndependentReason':rr,'wholeOriginalExtractionGoal':row['wholeOriginalExtractionGoal'],'wholeCandidateExtractionGoal':row['wholeCandidateExtractionGoal'],'wholeOriginalPartners':row['wholeOriginalPartners'],'wholeCandidatePartners':row['wholeCandidatePartners'],'wholePartnerCanonicalGoals':row['wholePartnerCanonicalGoals']})
write('three-whole-practical-duties-all-partners.independent-b.first.verdicts.json',{'schemaVersion':1,'reviewedAt':datetime.now(timezone.utc).isoformat(),'reviewer':'codex-independent-b-flora_fauna','role':'Genuine targeted independent B source/operator review, not author and not current peerA','entries':verdicts,'fiveWholeCurrentPartnerGoalsActuallyRead':5,'completeOfficialPrimaryPagesActuallyRead':3,'acceptedPartialNewExecutionDataEdges':6,'acceptedSoleExactToPartialCorrections':3,'acceptedActualGoalLocatorFixes':2,'wholePracticalSourceClosuresApproved':0,'remainingWholePracticalSourceHolds':3,'other123UnchangedOfficialDutiesNotRestarted':True,'allOtherChemQ3SourceAndAtomicityHoldsRetained':True,'noMandatoryHumanExperimentAdded':True,'wholeD_P_A_M_VNotApproved':True,'currentPeerRead':False,'activeWrites':0,'strictGainClaimed':0,'humanApproval':False,'humanTrial':False})
write('candidate-original-source-path-portability-boundary.independent-b.json',{'schemaVersion':1,'actualAuthorSeal':bind(seal_path),'historicalAuthorSealVerifiedUnchangedIncludingLocalPDF':True,'authorLocalPDFIgnored':True,'authorOriginalPDFBindingPreservedAsLocalObservation':entry['originalPrimaryPDF'],'candidateExtractionSourceDocumentPath':newex['sourceDocument']['path'],'candidatePassageSourcePathsPointToLocalIgnoredPDF':[p['id'] if 'id' in p else p.get('topicCode') for p in newex['passages'] if p.get('sourcePath')==entry['originalPrimaryPDF']['path']],'operativeSourceBindingPortable':False,'minimalTechnicalRemedy':'Preserve original author seal and local original-PDF observation. Before any active use, create a new append-only portable current source binding to actual whole portable official pages/texts plus official URL and observed original PDF SHA. Do not force-add PDFs, change ignore rules, replace old seal bytes, or present normalized rows as whole official text.','scientificOperatorHoldsSeparateFromPortability':True,'currentPeerRead':False,'activeWrites':0})
spec=importlib.util.spec_from_file_location('ordinary_schema_validator',root/'scripts/validate_schemas.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);schema=read(root/'docs/landscape-runtime.schema.json')
portableauthor=[root/b['path'] for b in seal['files'] if b['path']!=entry['originalPrimaryPDF']['path']]
jsonpaths=[p for p in portableauthor if p.suffix=='.json']+[p for p in own.rglob('*.json')]
checks=[]
for p in jsonpaths:
 okay=m.validate_file(p.relative_to(root).as_posix(),schema);checks.append({'path':p.relative_to(root).as_posix(),'valid':okay});assert okay
required=[p for p in own.rglob('*') if p.is_file()]+portableauthor+[seal_path]
assert not any(p.is_symlink() for p in required)
argv=['git','check-ignore','--stdin'];result=subprocess.run(argv,input=('\n'.join(p.relative_to(root).as_posix() for p in required)+'\n').encode(),capture_output=True)
binary('required-portable-files.check-ignore.stdout.actual.txt',result.stdout);binary('required-portable-files.check-ignore.stderr.actual.txt',result.stderr)
assert result.returncode==1 and result.stdout==b''
write('actual-first-input-delta-schema-and-required-portability.independent-b.receipt.json',{'schemaVersion':1,'checkedAt':datetime.now(timezone.utc).isoformat(),'authorAll13SealedFileBytesVerifiedLocally':len(seal['files']),'rawPDFObservationExcludedFromOwnRequiredFiles':True,'normalValidatorActualFiles':checks,'normalValidatorErrors':0,'requiredPortableFilesActualCheckIgnoreArgv':argv,'requiredPortableFilesActualCheckIgnoreExit':result.returncode,'ignoredRequiredPortableFiles':0,'requiredSymlinks':0,'threeWholePageIndependentExtractionExitCodes':[0,0,0],'activeWrites':0,'currentPeerRead':False})
write('neutral-three-BW-practical-source-roles-independent-b.first.entry.json',{'schemaVersion':1,'role':'Independent genuine whole3 BW source/operator B first review with partial KEEP and honest full-closure HOLD','authorNeutralEntry':bind(entry_path),'authorHistoricalFirstSeal':bind(seal_path),'verdicts':bind(own/'three-whole-practical-duties-all-partners.independent-b.first.verdicts.json'),'actualWholePrimaryReceipt':bind(own/'actual-three-whole-official-pages-and-local-original-observation.independent-b.receipt.json'),'actualDelta':bind(own/'actual-three-role-six-edge-two-locator-current-five-partner.delta.independent-b.json'),'portabilityBoundary':bind(own/'candidate-original-source-path-portability-boundary.independent-b.json'),'normalSchemaAndPortability':bind(own/'actual-first-input-delta-schema-and-required-portability.independent-b.receipt.json'),'wholePracticalClosuresApproved':0,'wholePracticalClosureHolds':3,'sixPartialExecutionDataEdgesKEEP':True,'twoActualLocatorFixesKEEP':True,'currentPeerRead':False,'currentActiveContentUnmodified':True,'candidateOnly':True,'noD_VOrNewPApproval':True,'activeWrites':0,'strictGainClaimed':0,'humanApproval':False,'humanTrial':False})
bindings={bind(p)['path']:bind(p) for p in portableauthor+[seal_path]}
for p in sorted(own.rglob('*')):
 if p.is_file():bindings[bind(p)['path']]=bind(p)
write('three-BW-practical-source-roles-independent-b.first.freeze.json',{'schemaVersion':1,'sealedAt':datetime.now(timezone.utc).isoformat(),'kind':'Portable own first independent targeted BW3 source/operator review; historical raw-PDF author seal unchanged; current peer unread','files':sorted(bindings.values(),key=lambda b:b['path']),'localObservedOriginalPDFNotRequired':entry['originalPrimaryPDF'],'wholeSourceClosuresApproved':0,'wholeSourceClosureHolds':3,'scientificPartialRoleKEEPCount':6,'locatorFixesKEEPCount':2,'currentPeerRead':False,'candidateOnly':True,'activeWrites':0,'strictGainClaimed':0,'humanApproval':False,'humanTrial':False})
print(json.dumps({'firstSeal':bind(own/'three-BW-practical-source-roles-independent-b.first.freeze.json'),'neutralEntry':bind(own/'neutral-three-BW-practical-source-roles-independent-b.first.entry.json'),'wholeSourceClosureHolds':3,'partialRoleEdgesKEEP':6,'actualLocatorKEEP':2,'normalSchemaActual0':True,'requiredIgnoredFiles':0,'activeWrites':0},indent=2))
