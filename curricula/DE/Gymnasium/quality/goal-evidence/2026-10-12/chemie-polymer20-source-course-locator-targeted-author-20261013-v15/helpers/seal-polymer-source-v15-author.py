# Apache-2.0. Seal only new inactive source-author input files, with unchanged external science references.
from pathlib import Path
import datetime,hashlib,json,shutil
R=Path('/home/enpasos/projects/skillpilot');E=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12';N=E/'chemie-polymer20-source-course-locator-targeted-author-20261013-v15';OLD=E/'chemie-f947-three-primary-source-and-nucleophile-case-remediation-author-20261013-v13';D=OLD/'source/converged-polymer20-source-author';P=E/'chemie-polymers17-original-native-current231-inactive-adoption-root-20261013-v9';V=E/'chemie-f947-mobile-clear-actual-V-independent-20261013-v10'
rd=lambda p:json.loads(p.read_text());rel=lambda p:str(p.relative_to(R));sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest();bind=lambda p:{'path':rel(p),'sha256':sha(p),'bytes':p.stat().st_size}
def own(p,d):
 assert p.is_relative_to(N) and not p.exists(),p;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
for name in ['finalize-polymer-source-v15-author.py','seal-polymer-source-v15-author.py']:
 dst=N/'helpers'/name;assert not dst.exists();shutil.copyfile(R/'tmp'/name,dst)
sn=R/'tmp/sn-polymer-source-reader-v15/source-literals.author-input.json';dst=N/'neutral/SN.actual-delimited-left-column-and-separate-recycling-row.author-input.json';assert not dst.exists();shutil.copyfile(sn,dst)
priorSeal=OLD/'FINAL.converged-polymer-source-and-F947-ne-author-preflight.freeze.json';assert sha(priorSeal)=='sha256:05f032a94ff2fad248f377845ab640795eedd441a9169d2453cdfec12cb84c9b'
for b in rd(priorSeal)['files']:assert sha(R/b['path'])==b['sha256'],b['path']
plan=rd(N/'SOURCE_COURSE_LOCATOR_AUTHOR.pending-exact-preflight-verification.json');impact=rd(N/'checks/current402-protected231-polymer20-source-course-page-impact.author.actual.json');transport=rd(N/'checks/prospective64-historical-byte-exact-transport-before36-alias-retirement.actual.json')
external={}
def add(p):
 assert p.is_file(),p;external[rel(p)]=bind(p);return bind(p)
for b in [plan['sealedPriorAuthorRoot'],plan['currentCanonicalBase']]:add(R/b['path'])
for p in plan['sourceExtractionSuccessors']+plan['mappingSuccessors']:
 add(R/p['originalLiveBinding']['path']);add(R/p['priorAuthorOrOriginalBinding']['path'])
for p in plan['sourceExtractionSuccessors']:
 data=rd(R/p['candidateBinding']['path'])
 for doc in data.get('sourceDocuments',[]):
  if doc.get('path') and (R/doc['path']).is_file():add(R/doc['path'])
for name in ['P1.author.inactive.config.json','P17.original-author.inactive.config.json','A17.original-independentA.inactive.config.json','M402.original-retained.inactive.config.json','whole402.converged-source-and-ne.author.inactive.config.json']:
 cfg=rd(N/'configs'/name)
 for field in ['reviewPath','reviewCriteriaPath','cardReviewPath','compositionViewPath','goalVisualizationQaPath']:
  if cfg.get(field):add(R/cfg[field])
 for p in cfg.get('evidenceReviewPaths',[]):add(R/p)
 for s in cfg.get('visibilityScopes',[]):add(R/s['viewPath'])
cases=OLD/'positive/whole-two-cases.nucleophile-electrophile.author-successor.json';p1=D/'positive/P1.primary-and-NE.author.normal.jsonl';image=E/'chemie-f947-mobile-clear-PU-raster-author-20261013-v9/candidate/f947cd04-952a-5a9d-9445-3ffc70e02c3c.png'
assert sha(image)=='sha256:1704dabc275aea63e09ed793fe211d110a45a30a0ab09b013d32231a74dd7372'
for p in [cases,p1,image,D/'neutral/selected-polymer20-and-shared-protected-source-literals-passages-partners-courses.actual.json',D/'neutral/actual-compiled-polymer20-and-three-protected-goal-evidence-paths.json',D/'models/whole402.converged-source-and-ne.author.normal.json',R/'app/scripts/config/goal-books/source-views/de-gym-chemistry-national-atlas/source-projection.receipt.json']:add(p)
for file in P.glob('FINAL*.json'):add(file)
for file in V.glob('FINAL*.json'):add(file)
for name in ['applicabilityCompiler.ts','goalBookSourceAtlasInputs.ts','goalBookModel.ts','validateGoalDescriptionReviewCampaign.ts','positiveGoalEvidenceProfileModel.ts','positiveGoalEvidenceReview.ts','semanticAtomicityReview.ts','memoryCardReview.ts','buildGoalBookModel.ts']:add(R/'app/scripts'/name)
for p in transport['links']:add(R/p['candidateRegularFileBinding']['path'])
selector={'schemaVersion':1,'kind':'Neutral targeted actual-primary course/locator/operator recheck input; no author or peer verdict prose','scope':{'existingSourceGoalIds31':sorted({r['sourceGoalId'] for r in plan['sourceCellCASOperations']}),'sourceCarrierCells42':42,'newSeparateActualSNRecyclingSourceGoalId':plan['newExactSeparateSNRecyclingSourceGoalId'],'canonicalPolymerGoalIds20':[r['goalId'] for r in impact['polymer20']],'protected231ChangedConsumedSourceCellGoalIds19':impact['protected231AffectedConsumedSourceCellGoalIds'],'protected231SourceScopeSetChangedGoalIds5':impact['protected231SourceScopeSetChangedGoalIds'],'targetedReviewMustIncludeProtectedSourceAttachments':True},'inputs':{'exactCurrentAndCandidateConsumedSourceCells':bind(N/'neutral/targeted-consumed-source-cell-and-course-locator-fix-inputs.actual.json'),'actualCurrentAndCandidateWitnesses':bind(N/'neutral/actual402-source-course-witness-matrix.current-and-candidate.json'),'actualAllAliasCompilerPaths':bind(N/'neutral/actual-compiled-polymer20-and-three-protected-goal-evidence-paths.json'),'prior52Substantive110TransportRetentionDelta':bind(N/'neutral/prior52-substantive-and110-transport-cells.current-targeted-delta.actual.json'),'actualSNDelimitersAndIndependentRecyclingOperator':bind(dst),'normalSourceProjection':bind(N/'checks/final-stock-source-atlas-targeted-course-locator.author.actual.json'),'boundedImpactMatrix':bind(N/'checks/current402-protected231-polymer20-source-course-page-impact.author.actual.json'),'whole402NormalModel':bind(N/'models/whole402.source-course-locator-and-valid-ne.author.normal.json'),'unchangedFinalBilingualNECases':add(cases),'unchangedNormalP1Candidate':add(p1),'unchangedActualPNG':add(image),'priorNeutralActualSourceCellsAndWitnesses':add(D/'neutral/selected-polymer20-and-shared-protected-source-literals-passages-partners-courses.actual.json')},'sourceSourceTextConsumedFieldIsActualDelimitedLiteral':True,'recommendedSNRemarksSeparateAndNonbinding':True,'existingSourcePrimaryFiles':sorted([b for b in external.values() if b['path'].endswith('.pdf')],key=lambda x:x['path']),'sourceCourseScopesAreActualExplicitAttachmentsNotReviewBookPageInferences':True,'allCaseDataModelRubricProfileInputsUnchangedToN13':True,'normalSnapshot':impact['normalSourceCounts'],'snapshot381IsNotM7QualityThreshold':True,'strictCurrentAtomicDenominator':402,'currentStrictCompleted231NotChangedByInactiveAuthorInputs':True,'knownLimits':['HB optional silicone source079 remains unmapped; no compulsory profile inferred','Optional RP mechanism remains bounded/held according to actual source context','413/9d coverage is not fabricated to meet an obsolete counter','Full source/sibling/practical-execution union remains unapproved','Fresh final paired D/source judgment still required before any active adoption'],'noIndependentScientificVerdictIncluded':True,'peerVerdictProseExcluded':True,'nativeRenderAfterTargetedSourceStabilityOnly':True,'newNativeRenders':0,'newScientificVotes':0,'humanApproval':False}
sel=N/'neutral/REVIEW_INPUTS.targeted-course-locator-source-fixes.pending-independent.json';own(sel,selector)
readme=N/'AUTHOR.README.md';assert not readme.exists();readme.write_text('''# Polymerquellen: gebündelter Autorstand v15

Inaktiver Quellen-Autorkandidat für die gezielte unabhängige Nachprüfung der tatsächlichen Primärquellen. Keine neue wissenschaftliche Stimme, keine aktive Integration und kein neues PDF.

## Konkret korrigiert

- 31 bestehende Quellen-IDs in 42 Trägerzellen: TH eAN/LK, gemeinsames TH-Herstellungsexperiment, BB/BE ausdrücklich LK, SN physische/gedruckte Seiten und getrennte linke Pflichttexte/rechte Empfehlungen; HB079 bleibt optionale ungemappte Vertiefung ohne erfundenes exklusives LK.
- SN-Herstellung und tatsächliche Recycling-Stellungnahme sind getrennte Quellenzeilen. Nur der bisher fälschlich im Herstellungsrecord geführte Recyclingpartner8721 wird auf die neue tatsächliche Source-ID übertragen; alle anderen Partner bleiben erhalten.
- Sieben neue Extraktionsträger und36 Mapping-Nachfolger sind für eine spätere Zell-CAS-Zusammenführung vorbereitet. Ganze gemeinsam bearbeitete Dateien dürfen nicht überschrieben werden.

## Tatsächliche Wirkung

Normaler Compiler: alle523 Länder-Sets und der gesamte kanonische Kandidat exakt v13. Normaler Atlas:402 aktuelle atomare Ziele,381 in der Quellenprojektion,482 offene Quellen-Scope-Entscheidungen,21 ausgelassen. Dies sind gemessene Snapshotzahlen, keine M7-Mindestgrenze.

Alle402 Reviewseiten sind exakt v13; bei den geschützten231 sind kanonischer Zielkörper, Seite, rawSEM und kanonischer D-Kontext unverändert. Dennoch sind19 geschützte Ziele durch korrigierte konsumierte Quellzellen betroffen, davon5 mit tatsächlicher Kursscope-Änderung. Die neutrale Matrix enthält alle IDs und Quellenattachments. Unveränderte Reviewseiten belegen keine unveränderte curriculare Geltung.

P17/A17/M402 und unverändertes P1 bestanden die normalen gezielten Checker. Das volle402-Modell wurde einmal gebaut. Die bestehenden N/E-Fälle, Modelle, Rubriken, Profile, Karten und sieben tatsächlich geprüften PNG bleiben erhalten. Endgültige D-/Quellenfreigaben werden daraus nicht abgeleitet.

Von den früher110 exakten Transportzellen bleiben92 exakt;18 liegen jetzt im ausdrücklich angeforderten Quellenfix-Scope. Die vorher52 fachlichen Deltas bleiben erhalten; nur die ausdrücklich dokumentierte SN-Operatortrennung ändert ein vorhandenes Partnerset.

## Historische Bytes und Grenzen

Vor einer späteren36-Alias-Ablösung müssen64 historische Inputverknüpfungen mit ihren bereits aufgelösten exakten Bytes zu regulären Dateien werden. Alle64 sind privat erfolgreich simuliert, einschließlich8 zusätzlicher BB/BE-Inputträger in zwei Wirtschaft-Snapshots. Vor/nach-SHA sind identisch; Modus120000→100644. Dort werden keine Review-, Seal-, SEM- oder Case-JSON umgeschrieben und keine Wirtschaft-QS geändert. Der vollständige Transportplan enthält jeden Pfad, Parent-CAS und Originalpayload.

Der frühere v9-SEM-Schreibdurchgriff ist in alten Seals dokumentiert und vollständig zurückgesetzt. v15 nutzt ausschließlich private reguläre Schreibeltern; aktive kanonische/SEM-CAS sind exakt9a685/1d9. Die vorangegangenen Seals bleiben unverändert. Offene optionale Silikon-/RP-/413-Fälle sowie vollständige praktische Quellenunions bleiben ausdrücklich offen. Menschliche Prüfung und Erprobung werden nicht behauptet.
''')
files=sorted([bind(p) for p in N.rglob('*') if p.is_file()],key=lambda x:x['path'])
for p in N.rglob('*.json'):rd(p)
seal=N/'FINAL.targeted-polymer-source-course-locator-author.freeze.json';own(seal,{'schemaVersion':1,'kind':'Frozen inactive targeted primary source course locator/operator author successor; no scientific closure','sealedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'fileCount':len(files),'files':files,'neutralSelectorBinding':bind(sel),'scientificAndTechnicalExternalBindings':sorted(external.values(),key=lambda x:x['path']),'currentAtomicDenominator':402,'currentStrictCompletedGoals':231,'protected231CanonicalPageRawSEMCanonicalDContextChangedGoalCount':0,'protected231ChangedConsumedSourceCellGoalCount':19,'protected231SourceScopeSetChangedGoalCount':5,'all402ReviewPagesExactToN13':True,'currentSourceProjectionSnapshot':impact['normalSourceCounts'],'historical64ByteExactTransportPrivatelyPassed':True,'currentLiveAndHistoricPathsNotModifiedInV15':True,'earlierV9SEMSymlinkWriteIncidentAlreadyDisclosedAndRestored':True,'nextStep':'Same independent reader verifies the exact consumed source/course/locator fixes and nineteen protected attachments before any new native/final paired D round','newNativeRenders':0,'newScientificVotes':0,'newScientificCompletions':0,'humanApproval':False,'humanTrial':False})
for b in rd(seal)['files']:assert sha(R/b['path'])==b['sha256'],b['path']
print(json.dumps({'seal':bind(seal),'selector':bind(sel),'ownFileCount':len(files),'sourceInputsStableAwaitTargetedScientificCheck':True,'newNativeRenders':0,'newScientificVotes':0}))
