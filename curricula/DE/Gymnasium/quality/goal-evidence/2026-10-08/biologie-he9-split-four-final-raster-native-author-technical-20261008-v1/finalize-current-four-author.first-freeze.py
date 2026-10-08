# SPDX-License-Identifier: Apache-2.0
"""Seal actual portable inactive author inputs. Generation is never approval."""
from pathlib import Path
import datetime, hashlib, json, subprocess

R=Path.cwd();D=Path(__file__).resolve().parent;DATE=D.parent
IMAGES=R/'curricula/DE/Gymnasium/quality/goal-visualization-review'
OLD='3ee4b55c-81c3-5826-9d26-1a8c22cbd0b8'
CHILDREN=['9d3f71d7-5273-5e50-b1ba-4e291edbf114','dd923eeb-eef0-5796-b372-a5d4f5be21f7']
COMPANIONS=['249f4c5d-fd23-57c7-ac62-773d62c33b49','4b7fdc2c-9dbe-5439-8d84-295abc240eec']
def read(p):return json.loads(Path(p).read_text())
def binding(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p.relative_to(R)),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(p,o):
 p.parent.mkdir(parents=True,exist_ok=True)
 b=o if isinstance(o,bytes)else (json.dumps(o,ensure_ascii=False,indent=2)+'\n').encode()
 with p.open('xb')as f:f.write(b)
guards=read(D/'exact-current-input-snapshots-and-four-author-guards.technical.json')
assert binding(R/guards['actualBaseline']['canonical']['path'])['sha256']==guards['actualBaseline']['canonical']['sha256'],'Current biology baseline drift requires targeted rebase before a current first seal'
unchanged_live_inputs=[]
for snapshot in guards['snapshots']:
 original=snapshot['original']
 if original['path'].endswith('deep-understanding-rollout/de-gymnasium-math-physics.config.json'):
  current_registry=read(R/original['path']);before_registry=read(R/snapshot['exactSnapshot']['path'])
  assert next(s for s in current_registry['subjects']if s['subject']=='biologie')==next(s for s in before_registry['subjects']if s['subject']=='biologie')
  continue
 assert binding(R/original['path'])['sha256']==original['sha256'],original['path']
 unchanged_live_inputs.append(original)
terminals=[]
for name in ['native-current-full392-four-raster-author','current-A392-retained-plus-genuine-A2','current-M392-retained-plus-genuine-M2','current-position-only-original-D-subset-proof','native-four-whole-physical-pages']:
 p=D/f'checks/{name}.terminal.actual.json';j=read(p);assert j['exitCode']==0
 terminals.append({'check':name,'terminal':binding(p),'actualExitCode':0})

# Copy exact already captured actual 360/680 images, not resized diagrams and not
# a second fabricated image review. The forthcoming reviewers inspect these.
widths=[]
for gid in CHILDREN+COMPANIONS:
 source_folder=IMAGES/('biologie-he9-two-child-image-author-root-20261008-v1'if gid in CHILDREN else 'biologie-he9-nineteen-image-author-root-20261008-v1')/'inspection-captures'/gid
 receipt=read(source_folder/'chromium-captures.actual.json')
 original=D/'selected-images'/f'{gid}.png'
 assert receipt['sourceSha256']==binding(original)['sha256']
 for name in ['actual-selected-360px.png','actual-selected-680px.png','chromium-captures.actual.json']:
  src=source_folder/name;dst=D/'width-captures'/gid/name;write(dst,src.read_bytes())
  widths.append({'goalId':gid,'actualOriginalCapture':binding(src),'exactPortableCapture':binding(dst)})
write(D/'checks/exact-original-width-captures.portable-adoption.actual.json',{'role':'Technical exact capture adoption, no new visual verdict','actualOriginalSourcePNGsExact':4,'actualCapturedWidths':[360,680],'captures':widths,'deviceOrFullApplicationAcceptance':False,'humanApproval':False,'strictGainClaimed':0})
source_reading=DATE/'biologie-he9-contraception-parenthood-scope-preserving-split-author-20261008-v1/original-HE-source-goal-and-actual-primary-reading.author.json'
write(D/'retained-whole-primary-source-and-reviewed-scope.original-author.exact.json',source_reading.read_bytes())
legacy_path=DATE/'biologie-he9-split-legacy-progress-readonly-audit-root-v1/existing-legacy-mapping-and-new-child-progress.actual-readonly-audit.json'
legacy=read(legacy_path)
for row in legacy['frozenInputs']:
 assert binding(R/row['path'])['sha256']==row['sha256']
candidate=read(D/'candidate/canonical.current476.reviewed-split.actual-raster.inactive.json')
original=read(R/legacy['frozenInputs'][-1]['path'])
actual_by={g['id']:g for g in candidate['goals']};original_by={g['id']:g for g in original['goals']}
for gid in CHILDREN:
 actual=json.loads(json.dumps(actual_by[gid]));actual.pop('resourceLinks',None)
 expected=json.loads(json.dumps(original_by[gid]));expected.pop('resourceLinks',None)
 assert actual==expected
write(D/'checks/current-child-legacy-readonly-conditioned-exact-adoption.actual.json',{'role':'Technical adoption of actual completed root code/progress audit; no new runtime review','originalAudit':binding(legacy_path),'originalAuditInputsStillExact':True,'bothReviewedChildProvenanceBodiesAndDistinctShortKeysExactExceptNewImageLink':True,'existingLegacyMappingAndRuntimeFilesUnchanged':True,'rootConditionalConclusion':legacy['conclusion'],'privateLearnerSessionChatDataRead':False,'runtimeWrites':0,'newChildMasteryInvented':False,'deploymentOrHumanTrialClaim':False})
readiness='''# HE12: aktueller nativer Vierseiten-Autorstand

Dieser inaktive technische Autorstand erhält alle 473 anderen ganzen Ziele,
390 andere A/M-Entscheidungen sowie unveränderte Karten und Sichtbarkeitsgrenzen.
Die bislang zusammengesetzte Kompetenz wird als derselbe stabile Cluster mit
zwei genuin quellengeprüften atomaren Teilzielen geführt. Der aktuelle Nenner
wächst von 391 auf 392; daraus wird hier kein strenger Abschluss abgeleitet.

Die beiden neuen Bilder sind tatsächliche PNG-Autorkandidaten. Die guten Bilder
der beiden betroffenen Kontextseiten bleiben bytegenau erhalten. Das echte
native Vierseitenbuch und beide blinden Vierer-Kampagnen sind erzeugt. Ganze
bilinguale Fälle und Profile bleiben erhalten, einschließlich ihrer Grenzen.
Positive Nachweise sind ausschließlich E1/G1, ai_candidate/needs_human_review.

Die fünf aufgeführten betroffenen technischen Prüfungen sind tatsächlich
beendet. Diese technischen Resultate sind keine fachlichen Ersturteile.
Die zwei unabhängigen finalen D/P/V-Reviews stehen aus. Historische Nachweise,
Lernendenzustand, menschliche Freigaben und aktive Dateien sind unverändert.
'''
write(D/'AUTHOR-READINESS.md',readiness.encode())
entry={
 'artifactKind':'Inactive current four-page raster/native engineering author handoff',
 'recordedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'actualBaseline':guards['actualBaseline'],
 'newChildGoalIds':CHILDREN,'trueContextCompanionGoalIds':COMPANIONS,'stableParentId':OLD,
 'operativeArtifacts':{
  'currentWholeCanonical':str((D/'candidate/canonical.current476.reviewed-split.actual-raster.inactive.json').relative_to(R)),
  'genuineScientificClassifications':str((D/'candidate/semantic-kinds.current476.actual-paired-science.inactive.json').relative_to(R)),
  'futureActiveScientificClassifications':str((D/'candidate/semantic-kinds.current476.actual-paired-science.future-active.json').relative_to(R)),
  'atlasUniformInactive':str((D/'candidate/atlas.sources.current392.uniform-view-paths.inactive.json').relative_to(R)),
  'atlasFutureActive':str((D/'candidate/atlas.sources.current392.future-active.json').relative_to(R)),
  'genuineCurrentA392Config':str((D/'candidate/A.current392.inactive.config.json').relative_to(R)),
  'genuineCurrentM392Config':str((D/'candidate/M.current392.inactive.config.json').relative_to(R)),
  'wholeFourDEENGoals':str((D/'current4-whole-DEEN-goals.actual.json').relative_to(R)),
  'wholeEightDEENCases':str((D/'four-whole-goals-eight-complete-DEEN-cases.author.json').relative_to(R)),
  'wholeEightDEENCasesMarkdown':str((D/'four-whole-goals-eight-complete-DEEN-cases.author.md').relative_to(R)),
  'positiveFourAuthorCandidates':str((D/'P4.whole-reviewed-science.actual-raster-author.candidates.json').relative_to(R)),
  'nativeP4ActualRasterBindings':str((D/'native-raster-candidate/P4.actual-raster-author.review.jsonl').relative_to(R)),
  'nativeP2OnlyNewChildBindings':str((D/'native-raster-candidate/P2.new-children.actual-raster-author.review.jsonl').relative_to(R)),
  'nativeP2InactiveAuthorConfigActualRasterRequired':str((D/'candidate/P2.actual-raster-author.inactive.config.json').relative_to(R)),
  'nativeP2FutureActiveAuthorConfigActualCurrentCanonicalKindsAndRasterRequired':str((D/'candidate/P2.actual-raster-author.future-active.config.json').relative_to(R)),
  'actualFull391Before':str((D/'native-raster-candidate/full391.before.pure.book-model.json').relative_to(R)),
  'actualFull392After':str((D/'native-raster-candidate/full392.actual-raster.pure.book-model.json').relative_to(R)),
  'actualNativeFourSubset':str((D/'native-raster-candidate/four/book-model.json').relative_to(R)),
  'actualCommittableNativePDF':str((D/'native-raster-candidate/four/bundle/book.pdf').relative_to(R)),
  'actualCommittableNativeHTML':str((D/'native-raster-candidate/four/bundle/book.html').relative_to(R)),
  'actualNeutralNativeInput':str((D/'native-raster-candidate/four/current-neutral-full-input.json').relative_to(R)),
  'firstPassA':str((D/'native-raster-candidate/four/round-a').relative_to(R)),
  'firstPassB':str((D/'native-raster-candidate/four/round-b').relative_to(R)),
  'actualPNGs':str((D/'selected-four-images.exact.json').relative_to(R)),
  'actualWidthCaptureAdoption':str((D/'checks/exact-original-width-captures.portable-adoption.actual.json').relative_to(R)),
  'conditionedExistingLegacyProgressGate':str((D/'checks/current-child-legacy-readonly-conditioned-exact-adoption.actual.json').relative_to(R)),
  'wholeOriginalPhysicalSourcePages':str((D/'whole-official-source-pages/actual-complete-page-extraction.provenance.json').relative_to(R)),
  'nativeCurrentPageImpact':str((D/'checks/full392-current-position-vs-substantive-context.actual.json').relative_to(R)),
  'originalPositionOnlyResolutionProof':str((D/'checks/current-page-position-only-exact-historical-references-and-subset-proof.technical.json').relative_to(R))},
 'alreadyGenuinePairedSourceClassAMSeals':guards['actualGenuineScienceSeals'],
 'actualAffectedTerminalChecks':terminals,
 'noRestartOfUnchangedScience':True,'exactOtherWholeGoals':473,'exactRetainedOtherAMRows':390,
 'newAtomicGoals':2,'currentAtomicDenominatorAfterPartition':392,'newPNGs':2,'KEEPExistingPNGs':2,
 'finalIndependentCurrentNativeD4P4V4':'PENDING; author engineering is not approval',
 'requiredFutureOperativePositiveConfig':'Use actual final sealed reviewId/records, current active canonical/kinds and reviewedResourceTypes=[goal-visualization]; never inherit the pre-raster source-first configuration.',
 'requiredFutureOperativeVisualizationQA':'Only after genuine final paired V records: use existing normalizeGoalVisualizationAiReview with exact current PNG hash, genuine recorded review date/reviewer and preserved human fields; run existing Biologie QA generator/--check for native serialization/order and prove unchanged390 other row objects. Author generation grants no V approval.',
 'humanApproval':False,'humanTrial':False,'realLearnerEvidence':False,
 'activeWrites':0,'strictGainClaimed':0,'newScientificClosures':0,'restoredBindingsClaimed':0,
 'firstAuthorSealPath':str((D/'current-four-raster-native-author-input.first.freeze.json').relative_to(R))}
write(D/'neutral-current-four-raster-native-author-review.entry.json',entry)

files=[];links=[];local_outputs=[]
for p in sorted(D.rglob('*')):
 if not p.is_file()and not p.is_symlink():continue
 if '__pycache__'in p.parts:continue
 ignored=subprocess.run(['git','check-ignore','-q',str(p.relative_to(R))],cwd=R).returncode==0
 if ignored:
  assert p in [D/'native-raster-candidate/four/book.pdf',D/'native-raster-candidate/four/book.html'],str(p)
  local_outputs.append({'path':str(p.relative_to(R)),'sha256':binding(p)['sha256'],'scope':'nonoperative renderer output; byte-exact portable bundle counterpart exists'})
  continue
 if p.is_symlink():
  target=p.resolve(strict=True);assert target.is_relative_to(D)
  assert subprocess.run(['git','check-ignore','-q',str(target.relative_to(R))],cwd=R).returncode!=0
  links.append({'path':str(p.relative_to(R)),'relativeTarget':str(p.readlink()),'resolvedTarget':binding(target)})
 files.append(binding(p))
freeze={'artifactKind':'Exact portable inactive current four-page AUTHOR inputs, no review or approval',
 'recordedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'frozenFiles':files,
 'containedExactRelativePNGAliases':links,'nonoperativeLocalRendererOutputs':local_outputs,
 'actualNativeBlindCampaigns':2,'actualNativeBatchSize':4,'actualWholeDEENCasePairs':8,
 'actualAffectedChecks':terminals,'firstFreezeBeforeIndependentFinalReviews':True,
 'actualCurrentBiologyInputsStillExactAtFinalization':unchanged_live_inputs,
 'activeWrites':0,'humanApproval':False,'strictGainClaimed':0}
write(D/'current-four-raster-native-author-input.first.freeze.json',freeze)
print(json.dumps({'entry':binding(D/'neutral-current-four-raster-native-author-review.entry.json'),'firstAuthorSeal':binding(D/'current-four-raster-native-author-input.first.freeze.json'),'exactPortableFiles':len(files),'containedPNGAliases':len(links),'newStrictClosures':0,'finalD4P4V4Review':'pending'}))
