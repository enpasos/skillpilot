# SPDX-License-Identifier: Apache-2.0
import datetime,hashlib,json,sys
from pathlib import Path
R=Path('tmp/cross-subject-requires/by-fos-semantic-audit-20261013-v1')
sha=lambda p:'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest()
read=lambda p:json.loads(Path(p).read_text())
manifest_path=R/'manifest.json'
if '--check'in sys.argv:
    m=read(manifest_path)
    for x in m['sealedArtifacts']+m['frozenInputFiles']:assert sha(x['path'])==x['sha256'],x['path']
    print(json.dumps({'sealedManifestSha256':sha(manifest_path),'sealedArtifactsChecked':len(m['sealedArtifacts']),'frozenInputsChecked':len(m['frozenInputFiles']),'allHashesMatch':True}))
else:
    ledger_path=R/'semantic-role-ownership-scope.author-ledger.final.json';ledger=read(ledger_path)
    context=read(R/'full-read-ownership-scope.context.exact.json');origins=read(R/'current-effective-requires.full-origin-paths.json');fresh=read(R/'inventory-freshness.validation.receipt.json')
    frozen={x['path']:x['sha256']for x in context['frozenInputs']+origins['frozenInputFiles']+fresh['activeInputFiles']}
    for p,h in frozen.items():assert sha(p)==h,p
    artifacts=[{'path':str(p),'sha256':sha(p),'bytes':p.stat().st_size,'license':'Apache-2.0'if p.suffix in {'.py','.ts'}or p.name.endswith('.schema.json')or 'validation.receipt'in p.name or p.name=='current-effective-requires.full-origin-paths.json'else'CC-BY-4.0 for own educational annotations; existing source text rights/status retained'}for p in sorted(R.iterdir())if p.is_file()and p.name!='manifest.json']
    m={'schemaVersion':1,'artifactId':'by-fos-semantic-audit-20261013-v1-author-only','status':'sealed_inert_author_candidate_pending_separate_independent_review','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'familyId':'by-fachoberschule','authorAgent':'/root/physics_pending5_revision','authorContributors':ledger['authorContributors'],'primaryLedgerPath':str(ledger_path),'primaryLedgerSha256':sha(ledger_path),'exactInventoryPath':context['inventoryPath'],'exactInventorySha256':context['inventorySha256'],'counts':ledger['counts'],'fullDescriptionReadWitness':context['fullDescriptionReadWitness'],'literalTopicHeadings':101,'literalCompatibilitySegments':21,'actualSourceBindingRecordCount':0,'sharedStableIdsWithUnresolvedAuthoritativeOwner':2,'reusedLandscapeIdentifierDocumentCounts':[3,6],'actualFullEffectiveOriginContainsPaths':1085,'sealedArtifactCount':len(artifacts),'sealedArtifacts':artifacts,'frozenInputFileCount':len(frozen),'frozenInputFiles':[{'path':p,'sha256':h}for p,h in sorted(frozen.items())],'validationEvidencePaths':[str(R/'schema-hash-integrity-validation.receipt.json'),str(R/'inventory-freshness.validation.receipt.json')],'differentIdentityIndependentContentReviewCompleted':False,'nativeM7Approval':False,'requiresDecisionsApproved':0,'activeGoalsCreated':0,'activeSemanticRegistriesWritten':0,'activeViewsWritten':0,'activeSourceFilesChanged':[],'runtimeCollisionProved':False,'priorSealedPhysicsPackagesRebound':False,'remainingBlocks':'All 539 author role/subject/scope judgments require separate complete-content review. Source/page bindings absent; 225 content bundles need granularity review, one integral payload is lost, ten actual project objects and two shared motivator authoritative owners unresolved. Native atomicity, exact necessary Math requires, source authenticity, placements and applicability are not approved by this inventory.','licensing':{'ownEducationalAnnotations':'CC-BY-4.0','technicalSchemasAndValidation':'Apache-2.0','sourceText':'Existing source rights/status retained; no new authenticity or rights clearance claim.','attribution':'SkillPilot contributors'}}
    with manifest_path.open('x')as f:f.write(json.dumps(m,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'manifestPath':str(manifest_path),'manifestSha256':sha(manifest_path),'ledgerSha256':sha(ledger_path),'artifacts':len(artifacts),'frozenInputFiles':len(frozen)},indent=2))
