import pathlib,json,hashlib,datetime
from PIL import Image
B=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09')
D=B/'biology-molecular-genetics-one-crossing-over-remedy-independent-v-a-v1'
N=B/'biologie-molecular-genetics-twenty-three-whole-author-v1/images-author-v1/all-twenty-three-current-crossing-over-successor-v4/neutral-one-actual-crossing-over-raster-successor.author-review.entry.json'
n=json.loads(N.read_bytes());r=n['entries'][0];A=pathlib.Path(r['path']).parent
P=D/'one-crossing-over-actual-raster.pixel-FIRST.independent-A.verdict.json';pix=json.loads(P.read_bytes());p=pix['rows'][0]
def bind(path):
 path=pathlib.Path(path);b=path.read_bytes();return {'path':str(path),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def eq(ref):
 b=bind(ref['path']);return b['sha256']==ref['sha256'].removeprefix('sha256:') and b['bytes']==ref['bytes']
def write(path,value):
 assert not path.exists(),path
 path.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
checks=[]
def ck(name,value):checks.append({'check':name,'pass':bool(value)})
ck('exact selected raster actually viewed in own FIRST',bind(r['path'])==p['selectedOriginal'])
ck('exact selected neutral binding',eq(r['assetBinding']))
ck('exact original prompt binding',eq(r['originalPromptBinding']))
ck('exact selected edit prompt binding',eq(r['selectedEditPromptBinding']))
ck('exact current reconstruction binding',eq(r['reconstructionPromptBinding']))
ck('historical own held v2 raster retained',eq(n['historicalRaster']))
ck('actual selected PNG dimensions',Image.open(r['path']).format=='PNG' and Image.open(r['path']).size==(1672,941))
ck('actual selected version',r['selectedVersion']=='candidate-v5.png')
ck('current whole goal same as own FIRST',r['wholeCurrentGoal']==p['wholeCurrentGoal'])
ck('metadata current goal URL',r['resourceLinkCandidate']['skillpilotId']==r['goalId'] and r['resourceLinkCandidate']['url']==f"/assets/goal-visualizations/biologie/{r['goalId']}/{r['goalId']}.png")
ck('caption and alt exact link bodies',r['resourceLinkCandidate']['description']==r['descriptionDe'] and r['resourceLinkCandidate']['altText']==r['altTextDe'])
ck('candidate machine pilot status and own content license',r['resourceLinkCandidate']['reviewStatus']=='pilot' and r['resourceLinkCandidate']['license']=='CC-BY-4.0')
pr=r['actualGenerationProvenance']
ck('actual raw selected output exact bytes',pathlib.Path(pr['actualGeneratedFile']).read_bytes()==pathlib.Path(r['path']).read_bytes())
ck('actual current generation reference v4',pr['actualReference']['path']==str(A/'candidate-v4.png') and eq(pr['actualReference']))
ck('actual current reference agrees exposed reference',pr['actualReference']==r['referenceOriginalImageBinding'])
ck('current selected edit agrees actual generation prompt',pr['originalEditPrompt']==r['selectedEditPromptBinding'])
ck('historic predecessor binding is previous selected v2, not actual edit reference',r['predecessorActualRasterBinding']==n['historicalRaster'])
ck('unexposed model not invented',r['model'] is None and pr['model'] is None)
prompts=[]
for name,role in [('generation-v1.original.prompt.en.md','original_generation'),('generation-v2.targeted-edit.prompt.en.md','historical_v2_edit'),('edit-v3.original.prompt.en.md','historical_v3_edit'),('edit-v4.original.prompt.en.md','actual_v4_edit'),('edit-v5.original.prompt.en.md','selected_v5_edit'),('reconstruction-v5.actual-view.de.md','current_actual_view_reconstruction_not_generation')]:
 pp=A/name;prompts.append({'binding':bind(pp),'role':role,'wholeBodyActuallyReadAfterPixelFirst':pp.read_text(),'readBeforePixelFirst':False})
chains=[]
for version,name in [(1,'actual-generated-file.local-provenance.json'),(2,'actual-generated-file.local-provenance.v2.json'),(3,'generation-v3.actual-author-hold.receipt.json'),(4,'generation-v4.actual-author-inspection.receipt.json'),(5,'generation-v5.actual.receipt.json')]:
 pp=A/name;raw=json.loads(pp.read_bytes())
 # Author inspection/decision fields were not read as review input and are not copied here.
 allow={k:v for k,v in raw.items() if k not in ['actualOriginalSeen','status','selected','actualFinding','selectedCandidate','humanApproval','independentApproval','independentReviewPending']}
 saved=A/f'candidate-v{version}.png';actual=raw.get('actualGeneratedFile',raw.get('originalGeneratedFile'))
 ck(f'v{version} preserved raw generated output bytes',pathlib.Path(actual).read_bytes()==saved.read_bytes())
 ref=raw.get('actualReference',raw.get('referencedActualImage'));refpath=ref['path'] if isinstance(ref,dict) else ref
 expected={2:'candidate-v1.png',3:'candidate-v2.png',4:'candidate-v2.png',5:'candidate-v4.png'}.get(version)
 if version>1:ck(f'v{version} honest actual image reference',pathlib.Path(refpath).name==expected)
 chains.append({'receiptBinding':bind(pp),'physicalProvenanceFieldsOnly':allow,'actualRawOutputBinding':bind(actual),'preservedSavedRasterBinding':bind(saved),'actualReferenceBinding':bind(refpath) if refpath else None,'historicalOrIntermediatePixelsRejudged':False})
W=pathlib.Path(n['whole23Entry']['path']);w=json.loads(W.read_bytes());ck('actual whole23 selected-entry binding',eq(n['whole23Entry']))
M=B/'biologie-molecular-genetics-twenty-three-whole-author-v1/images-author-v1/all-twenty-three-current-readable-metadata-v3/neutral-all23-current-selected-images-and-visible-content-metadata-v3.author-review.entry.json';m=json.loads(M.read_bytes());wm={x['ordinal']:x for x in w['entries']};mm={x['ordinal']:x for x in m['entries']}
unaffected=[]
for o in range(1,24):
 if o==15:continue
 a,b=wm[o],mm[o]
 keys=['goalId','wholeCurrentGoal','assetBinding','descriptionDe','altTextDe','resourceLinkCandidate','originalPromptBinding','actualGenerationProvenance','reconstructionPromptBinding']
 ok=all(a[k]==b[k] for k in keys);ck(f'other{o} current selected raster and relevant metadata exact retained',ok);unaffected.append({'ordinal':o,'selectedRasterBinding':a['assetBinding'],'relevantFieldsExactRetained':ok,'newPixelReviewClaimed':False})
scRef=w['wholeScienceMaterialCases'];sc=json.loads(pathlib.Path(scRef['path']).read_bytes());cur=next(x for x in sc['entries'] if x['goalId']==r['goalId'])
O=B/'biologie-molecular-genetics-twenty-three-whole-author-v1/twenty-three-whole46-bilingual-cases-and-P.author-candidate.json';old=next(x for x in json.loads(O.read_bytes())['entries'] if x['goalId']==r['goalId'])
def core(c):return {k:v for k,v in c.items() if k not in ['rubric','rubricScope','rubricReference']}
ck('current ScienceV5 actual input binding',eq(scRef))
ck('current whole15 goal exact own prior science body',cur['wholeCurrentGoal']==old['wholeCurrentGoal']==r['wholeCurrentGoal'])
ck('whole15 profile exact own prior science reading',cur['wholeProfile']==old['wholeProfile'])
ck('both whole15 cases exact own prior science core except honest pair rubrics',[core(x) for x in cur['newAuthoredWholeCases']]==[core(x) for x in old['newAuthoredWholeCases']])
ck('current original38duty44partner actual binding',eq(w['source38Partners44OriginalInput']))
errors=[c for c in checks if not c['pass']]
assert not errors,errors
common={'reviewAuthority':'ai_candidate','status':'needs_human_review','evidenceLevel':'E1','maximumClaimScope':'G1','freshPeerVRead':False,'authorInspectionLabelsRead':False,'currentNativeVApproved':False,'newWholeScience23Approval':False,'newP15Approval':False,'wholeSourceCourseApproval':False,'actualLearnerPerformance':False,'actualExperimentPerformed':False,'humanApproval':False,'humanTrial':False,'activeWrites':False,'strictGain':0}
T=D/'one-crossing-over-exact-metadata-prompts-provenance.AFTER-first.independent-A.json'
write(T,{'schemaVersion':1,'role':'actual_metadata_prompt_provenance_followup_after_own_pixel_FIRST','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'ownPixelFirst':bind(P),'neutralInput':bind(N),'selectedWhole23Entry':bind(W),'ordinal':15,'goalId':r['goalId'],'selectedRaster':bind(r['path']),'wholeDescriptionDeActuallyRead':r['descriptionDe'],'wholeAltTextDeActuallyRead':r['altTextDe'],'wholeResourceLinkCandidate':r['resourceLinkCandidate'],'provider':r['provider'],'tool':r['tool'],'model':r['model'],'modelDisclosure':r['modelDisclosure'],'actuallyReadWholePromptBodiesAfterFirst':prompts,'originalPromptCount':1,'actualEditPromptCount':4,'actualCurrentReconstructionPromptCount':1,'actualPhysicalReferenceChain':chains,'actualCaptionAltAndReconstructionReasoning':'The caption calls this a schematic reciprocal distal-segment exchange and explicitly excludes a literal scaled chiasma. The alt and reconstruction describe four separately traceable rods, opposed exchange arrows, two unchanged and two recombined marker combinations. Upper-locus yellow/purple and lower-locus green/gold-orange markers stay at their own corresponding loci. The lower paternal warm-gold band is termed orange in the prompts and alt; this colour wording does not introduce an extra allele or change a locus. All visible marker pairs and grouping match the actual FIRST reconstruction. The butterflies are abstract variation imagery without a specific Mendelian butterfly phenotype map. Caption explicitly says recombination creates combinations, not new alleles. No actual patient/experiment or guaranteed speciation claim.','captionAltPass':True,'currentReconstructionFidelityPass':True,'originalVersusEditVersusReconstructionRolesHonest':True,'rawCurrentPNGByteExact':True,'actualSelectedGenerationReference':'v4; v4 itself genuinely edited v2 and bypassed v3, preserved as a separate intermediate history','historicalSelectedPredecessor':'v2, distinct from immediate actual generation reference v4','actualChecks':checks,'errors':errors,**common})
C=D/'one-crossing-over-current-source-P-and22retained-context.independent-A.json'
write(C,{'schemaVersion':1,'role':'current_visual_relation_and_honest_exact_prior_science_reuse','currentWholeScienceMaterialBinding':scRef,'originalWholeScienceMaterial':bind(O),'ownPriorWholeScienceFirst':bind(B/'biologie-molecular-genetics-twenty-three-whole-independent-a-v1/whole23-science-source-scope-P.first.independent-A.verdict.json'),'currentWholeGoalProfileAndCaseCoresExactPriorReading':True,'exactReuseOnlyOrdinal':15,'rubricReferenceExcludedFromSemanticCoreComparison':True,'source38Partners44OriginalBinding':w['source38Partners44OriginalInput'],'sourceDutiesNotWaived':True,'unaffectedOther22RastersAndMetadata':unaffected,'newPixelReviewOfOther22':False,**common})
L=D/'actual-one-crossing-over-original360680.independent-A.view-log.json'
write(L,{'schemaVersion':1,'actualTool':'view_image','actualForwarding':'image original','actualViewCount':3,'freshViewsBeforePixelFirst':True,'views':p['actualViews'],'priorHeldRasterRejudged':False,**common})
R=D/'one-crossing-over-bounded-candidate-V.independent-A.records.jsonl'
record={'schemaVersion':1,'reviewId':D.name,'ordinal':15,'goalId':r['goalId'],'wholeCurrentGoal':r['wholeCurrentGoal'],'assetBinding':r['assetBinding'],'resourceLinkCandidate':r['resourceLinkCandidate'],'decision':p['pixelVerdict'],'firstPixelJudgment':bind(P),'firstPixelSeal':bind(D/'one-crossing-over-actual-raster.pixel-FIRST.independent-A.freeze.json'),'ownConcretePixelNotes':{k:p[k] for k in ['scienceAndGeometryReasoning','actualReadabilityReasoning','perspectiveAndScopeLimits']},'actualViewLog':bind(L),'metadataPromptFollowup':bind(T),'currentSourcePContext':bind(C),'freshPeerReadBeforeFirst':False,'findings':[],**common}
assert not R.exists();R.write_text(json.dumps(record,ensure_ascii=False)+'\n')
S=D/'historical-V9-A-001-targeted-new-raster-candidate.resolution.independent-A.json'
write(S,{'schemaVersion':1,'role':'targeted_bounded_candidate_resolution_without_rewriting_historical_FIRST','findingId':'V9-A-001','goalId':r['goalId'],'originalOwnHeldFirst':bind(B/'biology-molecular-genetics-eight-to-sixteen-independent-v-a-v1/nine-actual-rasters.pixel-FIRST.independent-A.verdict.json'),'originalRowPointer':'#/rows/7','historicalHeldRaster':n['historicalRaster'],'newActualViewedRaster':bind(r['path']),'followupFirst':bind(P),'followupRowPointer':'#/rows/0','afterFirstMetadata':bind(T),'resolution':'RESOLVED_FOR_THIS_NEW_BOUNDED_VISUAL_CANDIDATE','concreteRemedy':'Four full separate chromatid paths now remain traceable; exchange only between two inner non-sisters; no merged arm or upper-purple band on a lower locus. Both nonparticipants and all original per-locus marker counts remain. The two reciprocal arrows have opposite directions.','originalFirstVerdictAndSealChanged':False,'historicalRasterApprovedByThisResolution':False,'currentNativeVApprovedByThisResolution':False,**common})
E=D/'neutral-completed-one-crossing-over-remedy-independent-A.review.entry.json'
write(E,{'schemaVersion':1,'role':'neutral_completed_targeted_one_actual_crossing_over_visual_review_A','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'neutralAuthorInput':bind(N),'ownInputFirstFreeze':bind(D/'one-crossing-over-actual-raster-input.first.freeze.json'),'ownPixelFirst':bind(P),'ownPixelFirstSeal':bind(D/'one-crossing-over-actual-raster.pixel-FIRST.independent-A.freeze.json'),'actual3ViewLog':bind(L),'exactMetadataPromptProvenanceFollowup':bind(T),'wholePSourceExactOwnReuseContext':bind(C),'boundedVRecord':bind(R),'targetedHistoricalFindingResolution':bind(S),'boundedCandidateDecision':p['pixelVerdict'],'actualViewCount':3,'actualPromptBodyCount':6,'bindingAndModelChecksCount':len(checks),'errors':errors,'oldFirstHistoryImmutable':True,'noOther22RasterReviewClaim':True,**common})
F=D/'one-crossing-over-independent-A.completed.final.freeze.json'
write(F,{'schemaVersion':1,'role':'own_completed_final_freeze','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'entry':bind(E),'outputBindings':[bind(x) for x in sorted(D.rglob('*')) if x.is_file()],'ownPixelFirstUnchanged':True,**common})
print(json.dumps({'entry':bind(E),'finalSeal':bind(F),'checks':len(checks),'errors':errors},indent=2))
