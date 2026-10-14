# SPDX-License-Identifier: Apache-2.0
import datetime,hashlib,json,sys
from pathlib import Path
R=Path('tmp/cross-subject-requires/by-fos-semantic-audit-20261013-v2')
V1=Path('tmp/cross-subject-requires/by-fos-semantic-audit-20261013-v1')
P=Path('tmp/cross-subject-requires/by-fos-semantic-independent-review-20261013-v1')
read=lambda p:json.loads(Path(p).read_text())
sha=lambda p:'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest()
target=R/'manifest.author-v2.json'
if '--check'in sys.argv:
    m=read(target)
    for x in m['sealedArtifacts']+m['frozenInputFiles']:assert sha(x['path'])==x['sha256'],x['path']
    print(json.dumps({'manifestSha256':sha(target),'sealedArtifactsChecked':len(m['sealedArtifacts']),'frozenInputsChecked':len(m['frozenInputFiles']),'allHashesExact':True}))
else:
    vm=read(V1/'manifest.json');pm=read(P/'manifest.independent-review-v1.json')
    frozen={x['path']:x['sha256']for x in vm['frozenInputFiles']+vm['sealedArtifacts']+pm['artifacts']}
    more=[V1/'manifest.json',P/'manifest.independent-review-v1.json']
    source_dir=Path('tmp/cross-subject-requires/by-fos-math-integral-source-20261013')
    more += [source_dir/p for p in ['source-recovery.root-author.json','source-formula-images.index.json','official-page-0.original.html','actual-fetch-attempts.json']]
    more += [source_dir/f'integral-form-{i}.{suffix}'for i in [1,2,3]for suffix in ['source.svg','inspection.png']]
    identity_dir=Path('tmp/cross-subject-requires/by-identity-runtime-probe-20261013')
    more += [identity_dir/p for p in ['findings-and-plan.json','probe.stdout.json','probe-inputs.json','ByIdentityProbe.java','run_probe.py']]
    for p in more:frozen[str(p)]=sha(p)
    for p,h in frozen.items():assert sha(p)==h,p
    ledger_path=R/'semantic-role-ownership-scope.author-ledger.v2.json';ledger=read(ledger_path)
    artifacts=[{'path':str(p),'sha256':sha(p),'bytes':p.stat().st_size,'license':'Apache-2.0'if p.suffix in {'.py','.ts'}or p.name.endswith('.schema.json')or 'receipt'in p.name or p.name=='unchanged499.preservation-witness.json'else'CC-BY-4.0 for own educational judgments; original source rights/status retained'}for p in sorted(R.iterdir())if p.is_file()and p!=target]
    m={'schemaVersion':2,'artifactId':'by-fos-semantic-audit-20261013-v2-author-only','status':'fresh_sealed_inert_author_revision_pending_exact_separate_independent_review','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'familyId':'by-fachoberschule','authorAgent':'/root/physics_pending5_revision','authorContributors':ledger['authorContributors'],'primaryLedgerPath':str(ledger_path),'primaryLedgerSha256':sha(ledger_path),'exactV1AuthorManifest':{'path':str(V1/'manifest.json'),'sha256':sha(V1/'manifest.json')},'exactV1IndependentReviewManifest':{'path':str(P/'manifest.independent-review-v1.json'),'sha256':sha(P/'manifest.independent-review-v1.json')},'exactInventoryPath':ledger['exactInventoryPath'],'exactInventorySha256':ledger['exactInventorySha256'],'counts':ledger['counts'],'exact40RevisionRegisterPath':str(R/'forty-cases.author-response.register.json'),'exact40RevisionRegisterSha256':sha(R/'forty-cases.author-response.register.json'),'exact499UnchangedWitnessPath':str(R/'unchanged499.preservation-witness.json'),'exact499UnchangedWitnessSha256':sha(R/'unchanged499.preservation-witness.json'),'affectedCurrentCompleteDescriptionsReread':40,'parentAlsoPersonallyReadAll19PhysicsAuthorResponses':True,'original539FullReadContextAnd558InputsPreserved':True,'literalTopicHeadingsPreserved':101,'literalAggregateScopeContextsPreserved':21,'stableGoalIdsPreserved':539,'technicalLeavesObserved':428,'all40ResponsesAuthorOnly':True,'differentIdentityExactV2Review':'pending','priorIndependentV1TriageAcceptanceReboundToNewV2Inputs':False,'nativeAtomicityApproved':0,'nativeM7Approved':0,'requiresApproved':0,'authoritativeOwnerChoices':0,'mandatorySplitsApproved':0,'activeSourceEdits':[],'activeGoalOrRegistryOrViewEdits':[],'allFosAdoptionInertUntilIdentityMigration':True,'separateActuallyReproducedRuntimeCollisionEvidence':ledger['liveAdoptionBoundary'],'separateFormulaRecoveryBoundary':ledger['separateFormulaSourceRecoveryBoundary'],'contentPrecisionChecksPassed':14,'negativeIntegrityChecksPassed':16,'sealedArtifactCount':len(artifacts),'sealedArtifacts':artifacts,'frozenInputFileCount':len(frozen),'frozenInputFiles':[{'path':p,'sha256':h}for p,h in sorted(frozen.items())],'remainingBlocks':'Fresh v2 content review required for all 40 revised scientific interpretations; 499 supported inert triage entries are preserved exactly. All539 native/source/scope/owner/requires gates pending.34 revised cases retain open granularity/content limits;6 Math narrow candidates are not native atomicity approvals. Cramer singular cardinality and Physics various-times model assumptions remain explicit precision/source gaps. Active integral249 remains incomplete despite separate source-family recovery. All FOS adoption blocked until explicit runtime identity/shared orientation ownership migration.','licensing':{'technical':'Apache-2.0','ownDidacticJudgments':'CC-BY-4.0','sourceAndExternalEvidence':'Original rights/status unchanged; full official source pages/images remain only in tmp.','attribution':'SkillPilot contributors'}}
    with target.open('x')as f:f.write(json.dumps(m,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'manifestPath':str(target),'manifestSha256':sha(target),'ledgerSha256':sha(ledger_path),'artifacts':len(artifacts),'frozenInputFiles':len(frozen)},indent=2))
