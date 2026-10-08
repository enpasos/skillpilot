"""Immutable first author source-only input seal, including failed attempts."""
from pathlib import Path
import datetime,hashlib,json,subprocess
ROOT=Path.cwd();OWN=Path(__file__).parent
target=OWN/'eighteen-operative-source-v2.author-first-input.freeze.json'
assert not target.exists()
entry=json.loads((OWN/'neutral-operative-eighteen-source-review.portable.final.entry.json').read_text())
mapping=json.loads(Path(entry['mappingReviewCandidatePath']).read_text());ex=json.loads(Path(entry['sourceExtractionCandidatePath']).read_text())
assert mapping['sourceExtractionPath']==entry['sourceExtractionCandidatePath']
for p in [entry['mappingReviewCandidatePath'],entry['sourceExtractionCandidatePath']]:
 assert not Path(p).is_absolute() and Path(p).is_file() and not Path(p).is_symlink()
assert len(ex['sourceGoals'])==144 and len(mapping['decisions'])==144
files=sorted(p for p in OWN.rglob('*') if p.is_file())
assert not any(p.is_symlink() for p in OWN.rglob('*'))
ignored=subprocess.run(['git','check-ignore','--stdin'],input='\n'.join(str(p) for p in files)+'\n',capture_output=True,text=True)
assert ignored.returncode==1 and not ignored.stdout
rows=[{'path':str(p.relative_to(OWN)),'repositoryPath':str(p.relative_to(ROOT)) if p.is_absolute() else str(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size} for p in files]
readiness=json.loads((OWN/'final-author-readiness.actual.json').read_text())
assert readiness['candidateReadyForTwoIndependentTargetedSourceReviews'] and not readiness['integrationReady']
for check in readiness['retainedAMAndCandidatePActualTerminals'].values():assert check['exitCode']==0
prior=Path(entry['priorActualIndependentATwoWordPatchAndAMPPath']).parent/'independent-a.final-source-science.freeze.json'
assert hashlib.sha256(prior.read_bytes()).hexdigest()=='2db378057d882436d594beff245d6ce3f716ad2b4fcafdcc27c15109a9e11812'
seal={'schemaVersion':1,'sealedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'AUTHOR source v2 first input for two genuine targeted independent reviews; no source/science/image approval by author','fileCount':len(rows),'totalBytes':sum(r['bytes'] for r in rows),'files':rows,'operativeNeutralEntry':entry,'unchangedScientificCases':36,'selectedSourceBindingsChanged':18,'otherSourceRowsAndDecisionsExact':126,'stableSourceCollectionIdentityRetained':True,'actualNativeChecks':{'closedSourceSchemasPassed':3,'targetedSourceNativeRows':18,'actualNativePartialEdges':18,'A18':'exit0','M18':'exit0','P18':'exit0; needs_human_review AI candidate','nativeSourceViews':22,'nativeNavigationViews':1,'memoryVisibilityScopes':8,'totalViewConsumers':31,'allScopeGoalIdSetsExact':True,'semanticSourceConsumerChanges':18,'otherSemanticSourceConsumerChanges':0},'preservedFailures':['Initial P config rejected extra reportPath','Initial absolute source/mapping pointer config rejected by native atlas','Initial ordinal source-index identity comparison rejected','Full144 native release projection blocked by unchanged NeuroGK2 needs_canonical_goal'],'candidateOnly':True,'newSourceIndependentJudgments':0,'newStrictClosures':0,'restoredActiveBindings':0,'activeWrites':0,'humanApproval':False,'newPNGs':0,'fullOfficialPdfOrHtmlFilesNewlyCommitted':0,'ignoredPacketFiles':0,'aliases':0}
with target.open('x') as f:f.write(json.dumps(seal,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'firstSealPath':str(target),'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'fileCount':len(rows),'bytes':seal['totalBytes'],'sourceRowsCandidateReady':18,'independentSourceApprovals':0,'activeWrites':0}))
