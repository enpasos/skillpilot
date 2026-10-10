from pathlib import Path
import json,hashlib,copy,os,shutil
from jsonschema import Draft202012Validator
R=Path('/home/enpasos/projects/skillpilot');Q=R/'curricula/DE/Gymnasium/quality/goal-evidence';O=Q/'2026-10-10/wirtschaft-M4-twelve-local-consumption-communication-media-one-contract-author-a-v1';C=Path('/tmp/economics-next-local-author-a-path.txt').read_text().strip();C=Path(C).resolve();B=Q/'2026-10-10/wirtschaft-current597-legal-social-qualified577-fieldwise-combined-author-a-v1'
CAN=Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json');REG=Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
def rec(p):
 b=p.read_bytes();return {'path':str(p.relative_to(R))if p.is_relative_to(R)else str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b),'symlink':p.is_symlink()}
def put(n,x):
 p=O/n;assert not p.exists();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return rec(p)
def private_copy(rel):
 src=R/rel;dst=C/rel;dst.parent.mkdir(parents=True,exist_ok=True)
 assert dst.resolve().is_relative_to(C)and not dst.is_symlink()
 assert not dst.exists()or not os.path.samefile(src,dst)
 dst.write_bytes(src.read_bytes());assert dst.read_bytes()==src.read_bytes();return rec(src)
assert C!=R and not C.is_relative_to(R);active=json.load(open(R/CAN));wholeold=json.load(open(B/'whole-current597-legal7-social13-five-old-field-successors.INERT-author-candidate.json'));assert active==wholeold and len(active['goals'])==597
bodypath=O/'whole-twelve-readable-DEEN-whole-essential-groups.DRAFT-author-successor-v3.json';new=json.load(open(bodypath))['materials'];ids=[m['requires'][0]for m in new];gm={g['id']:g for g in active['goals']};oldP=json.load(open(B/'whole-current577-original336-positive-profiles685-cases-and43-configbindings.author-reuse.json'))['actual336WholeOriginalPObjects'];oldPm={p['goalId']:p for p in oldP}
reg=json.load(open(R/REG));econ=next(s for s in reg['subjects']if s['subject']=='wirtschaftswissenschaften');cfgbindings=[];allP=[];profilepaths={};copyrels={CAN,REG,Path(econ['semanticKindLedgerPath'])}
for rel in econ['positiveEvidenceConfigPaths']:
 p=R/rel;cfg=json.load(open(p));r=R/cfg['reviewPath'];objs=[json.loads(line)for line in r.read_text().splitlines()if line.strip()];allP.extend(objs);cfgbindings.extend([rec(p),rec(r)])
 for row in objs:profilepaths[row['goalId']]={'config':rec(p),'reviewFile':rec(r)}
 copyrels.update([Path(rel),Path(cfg['reviewPath']),Path(cfg['reviewCriteriaPath'])])
assert len(econ['positiveEvidenceConfigPaths'])==43 and len(allP)==336 and sum(len(p['profile']['applicationCaseBriefs'])for p in allP)==685
pm={p['goalId']:p for p in allP};assert pm==oldPm
designs=json.load(open(O/'twelve-individual-full-contract-P24-essential-groups-and-six-rubric-author-designs.json'))['wholeTwelveDesigns'];dm={d['coveredGoalId']:d for d in designs}
rows=[]
intake=json.load(open('/tmp/economics-next-local-all81-current597-intake.json'));assert len(intake['all81WholeCurrentGoalRows'])==81
for mid in ids:
 assert gm[mid]==dm[mid]['wholeCurrentGoal']and pm[mid]==dm[mid]['wholeOriginalP'];gap=next(x for x in intake['all81WholeCurrentGoalRows']if x['goalId']==mid)
 rows.append({'goalId':mid,'wholeCurrentDEENGoal':gm[mid],'wholeOriginalPositiveV2Record':pm[mid],'originalPConfigAndReviewWholeBindings':profilepaths[mid],'actualOriginalCaseCount':len(pm[mid]['profile']['applicationCaseBriefs']),'originalNeedsHumanReviewAndAiCandidatePreserved':pm[mid]['status']=='needs_human_review'and pm[mid]['reviewAuthority']=='ai_candidate','actualNativeMissingWholeContextRows':gap['actualDirectMissingScopes'],'actualMissingWholeContextCount':gap['actualMissingOccurrenceCount'],'authorNewMaterialId':next(m['id']for m in new if m['requires']==[mid]),'newContractAndAssessmentAreDifferentSemanticKinds':True})
intakefile=put('actual-whole-current597-native512-81-readonly-missing-context-intake.exact.json',intake)
wholeP=put('whole-twelve-current597-DEEN-contracts24-original-P-cases-and-current43-bindings.exact-author-intake.json',{'role':'WHOLE_CURRENT_AUTHOR_INTAKE_WITHOUT_HISTORICAL_REVIEW_RESTART','actual12Rows':rows,'actualPCaseCount':24,'wholeOriginal336P685ObjectsExactToOwn577And597PriorFrame':True,'actualWhole86CurrentConfigAndReviewFiles':cfgbindings,'wholeActiveRegistry':rec(R/REG),'wholeActiveSEM597':rec(R/econ['semanticKindLedgerPath']),'wholeActiveCAN597':rec(R/CAN),'wholeOriginalFrozenNative512_81':intakefile,'original24ProfileStatusesUnchanged':True,'noNewSourceClaimOrOfficialWholeGKCourseClaim':True})
p=O/'whole-current597-actual-active-before609-DRAFT.frozen.json';assert not p.exists();p.write_bytes((R/CAN).read_bytes())
candidate=copy.deepcopy(active);candidate['goals'].extend(new);assert len(candidate['goals'])==609 and candidate['goals'][:597]==active['goals'];errors=list(Draft202012Validator(json.load(open(R/'docs/landscape-runtime.schema.json'))).iter_errors(candidate));assert not errors
candidatefile=put('whole-current609-twelve-whole-DRAFTs-active597-exact-fieldwise.INERT-author-final-v4.json',candidate)
views=list((R/'curricula/DE/Gymnasium/composition-views/wirtschaft').glob('*.json'));assert len(views)==35;copyrels.update(Path(p.relative_to(R))for p in views)
copies=[private_copy(rel)for rel in sorted(copyrels)]
prod=R/'app/scripts/generateCurriculumQualityStatus.ts';capprod=C/'app/scripts/generateCurriculumQualityStatus.ts';assert capprod.read_bytes().startswith(prod.read_bytes());assert hashlib.sha256(prod.read_bytes()).hexdigest()=='656084b7cd9d6cb5324361b927b9f761596c572d7e4f616c7b13da061f4b1336'
put('actual-current597-P685-private-physical-capsule-input-freeze-and609-closed-schema.json',{'role':'AUTHOR_PHYSICAL_CAPSULE_WITHOUT_ACTIVE_OR_RELEASE_EDITS','wholeActive597':rec(R/CAN),'wholeFrozenBefore597':rec(p),'wholeFinal609DRAFTCandidate':candidatefile,'wholeScientificTwelveBody':rec(bodypath),'whole24OriginalPIntake':wholeP,'actualPrivateInputCopies':copies,'actualPrivateCapsule':str(C),'samefileAndResolveChecksBeforeEveryCopy':True,'wholeExecutedProductionPrefix':rec(prod),'capsuleProductionPrefixExact':True,'native609ClosedSchemaErrors':len(errors),'all597OriginalGoalObjectsExact':True,'old336P685WholeExact':True,'newNavOrViewsOrSourceOrCards':0,'foreignWholeScienceStillRequired':True,'ownWholeScienceKEEP':False,'humanReviewClaim':False})
receipt=json.load(open('/tmp/economics-next-local-BGB439-own-get.json'));put('actual-one-bounded-official-BGB439-primary-read-and-fictional-source-boundaries.author.json',{'role':'ACTUAL_OWN_PRIMARY_READING_NOT_FOREIGN_RELEASE','officialURL':'https://www.gesetze-im-internet.de/bgb/__439.html','retrieval':receipt,'readAt':'2026-10-10','actuallyReadWholeSubsections':[1,2,3,4,5,6],'materialUsesOnlyBoundedSubsections':[1,4,5],'ownBoundedParaphrase':'For the exercise, an initial remediable defect, legal cure entitlement and practical repair are expressly assumed. The buyer chooses repair or delivery of a defect-free item; statutory disproportionate-cost refusal limits consider defect-free value, significance and significant disadvantages of the other cure. The buyer makes the item available. This aid does not establish immediate refund or a full rescission test.','webOpenTimeoutAndOfficialSearchThenOwnGET200':True,'originalOfficialFullTextOnlyPrivateCache':'/tmp/economics-next-local-BGB439-original.html','noThirdPartyFullTextArchivedInRepository':True,'allOtherDataProceduresAndCulturalMiniaturesOwnFictional':True,'noCurrentRealMinimumWageClaim':True,'participationProceduresExplicitlyFictionalNotActualConstitutionalLaw':True,'oralWorkOwnSimulationOnlyActualDeliveryRequiredNoContactWithThirdParties':True,'humanTrialOrPrivateLearnerData':False})
print(json.dumps({'active':rec(R/CAN),'whole12P24Exact':True,'copiedPrivateFiles':len(copies),'schema609Errors':0,'candidate':candidatefile}))
