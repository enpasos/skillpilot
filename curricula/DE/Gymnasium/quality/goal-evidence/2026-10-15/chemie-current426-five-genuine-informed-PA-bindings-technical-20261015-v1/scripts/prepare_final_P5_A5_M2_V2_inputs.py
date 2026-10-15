# SPDX-License-Identifier: Apache-2.0
"""Finale echte Quellen transportieren; P/A/M-Fingerprints folgen Stockfunktionen."""
from pathlib import Path
import copy,hashlib,json,os,shutil
R=Path.cwd();O=Path(__file__).resolve().parents[1];E=O.parent
def load(p):return json.loads(p.read_text())
def ref(p):
 b=p.read_bytes();return {'path':p.relative_to(R).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verify(r):
 p=R/r['path'];assert ref(p)==r,p;return p
def put(p,d):
 assert not p.exists(),p;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
raw=load(O/'PREPARED.raw-five-PA-two-texts-awaiting-genuine-context-and-final-bindings.json');hostplan=load(O/'REBUILD.prepared-new-informed-PA-final8-host.awaiting-context.json');H=R/hostplan['executionHost'];old=load(verify(raw['baseNative8Selector']))
vp=E/'chemie96-negative-caption-successor-informed-independent-V1-20261015-v1/OUTPUTS.finite96-caption-successor-informed-independent-V1.selector.json';assert ref(vp)['sha256']=='sha256:03141374880f2d50b4f4591f8e6f545d2a73fb5d141a061f9861f85ac6bfda78';vs=load(vp)
for r in load(R/vs['sealPath'])['files']:verify(r)
va=load(verify(vs['authorSelector']));v96=load(verify(vs['FIRSTV1']));assert v96['verdict']=='KEEP'
final96=load(verify(va['wholeGoal']));candidate=load(verify(raw['canonicalCandidate']));by={g['id']:g for g in candidate['goals']}
assert {k:v for k,v in by[final96['id']].items() if k!='resourceLinks'}=={k:v for k,v in final96.items() if k!='resourceLinks'};assert final96==v96['wholeGoal'];by[final96['id']]=final96
candidate['goals']=[copy.deepcopy(by[g['id']]) for g in candidate['goals']];cp=O/'candidate/canonical570.current426.final-two-texts-and-genuine96-PNG.inactive.json';put(cp,candidate)
baseby={g['id']:g for g in load(verify(old['canonical']))['goals']};assert sum(baseby[g]==by[g] for g in by)==568
shutil.copyfile(cp,H/hostplan['normalCanonicalPath'])
ctxp=E/'chemie-two-local-text-successors-informed-PAV-context-20261015-v1/OUTPUTS.finite-two-local-texts-informed-PAV-context.selector.json';ctx=load(ctxp);assert ref(ctxp)['sha256']=='sha256:3054d17cc3eaca9e44db51ca5d74d6654363afb832c5929d38d53e62608a93d8'
vcontext=load(verify(ctx['FIRSTV2']));v0b=next(r for r in vcontext['records'] if r['goalId'].startswith('0b534'));assert v0b['verdict']=='KEEP' and v0b['wholeGoal']==by[v0b['goalId']]
qa=load(verify(old['visualizationQA']));qr={r['goalId']:r for r in qa['records']}
for record,whole,source in [(v96,v96,vs['FIRSTV1']),(v0b,vcontext,ctx['FIRSTV2'])]:
 gid=record['goalId'];g=by[gid];link=next(l for l in g['resourceLinks'] if l['type']=='goal-visualization' and l.get('role','primary')=='primary');image=record.get('actualPNG',record.get('image'));verify(image)
 r=qr[gid];r.update(title=g['title'],description=g['description'],imageUrl=link['url'],publicAssetPath='app/public'+link['url'],canonicalAssetPath='curricula/DE/Gymnasium/visualizations/'+link['url'].split('/assets/goal-visualizations/',1)[1],assetSha256=image['sha256'],aiApproved='yes',aiApprovedAssetSha256=image['sha256'],aiReviewer=whole['reviewer'],aiReviewedAt=whole['reviewedAtUTC'],aiNotes=json.dumps({'sourceFIRST':source,'originalWholeIndependentVRecord':record,'technicalBoundary':'Genuine aktuelle Kontextsicht, keine Humanfreigabe/keine neue P/A/M/D-Wissenschaft.'},ensure_ascii=False,separators=(',',':')))
qaseed=O/'qa/QA443.final-two-genuine-context-bindings.seed-before-stock.json';put(qaseed,qa)
alias=H/hostplan['normalQAPath'];assert alias.is_symlink();alias.unlink();shutil.copyfile(qaseed,alias)
image=verify(va['image']);link=final96['resourceLinks'][0];normal_public='app/public'+link['url'];normal_canonical='curricula/DE/Gymnasium/visualizations/'+link['url'].split('/assets/goal-visualizations/',1)[1]
def install_image(rel,hardlink):
 q=H/rel;q.parent.mkdir(parents=True,exist_ok=True)
 if q.is_file() or q.is_symlink():q.unlink()
 if hardlink:os.link(image.resolve(),q)
 else:q.symlink_to(image)
install_image(normal_public,True);install_image(normal_canonical,False)
mapping=load(O/'INPUTS.genuine-original-P5-A5-science-records.no-final-bindings.json');source_rows={r['goalId']:r for r in mapping['records']};ids=list(source_rows)
four=load(R/raw['fourUnaffectedRawProfiles']['path']);profiles={r['goalId']:copy.deepcopy(r) for r in four};profiles.update({r['goalId']:r for r in load(O/'inputs/old-96-and0b-raw-author-profiles.awaiting-genuine-text-context.json')})
review_id='chemie-current426-five-genuine-informed-P-technical-20261015-v1';atomic_id='chemie-current426-five-genuine-informed-A-technical-20261015-v1'
P=[];A=[];provenance=[]
for gid in ids:
 source=source_rows[gid];pr=source['P']['wholeOriginalRecord'];ar=source['A']['wholeOriginalRecord'];r=copy.deepcopy(profiles[gid])
 if gid.startswith(('96d33','0b534')):parts=[pr['actualTextDelta'],pr['wholeProfileFit'],pr.get('practicalAndQuantitativeBoundary',pr.get('causalAndAcquisitionBoundary')),pr['sourceAndMemoryBoundary']]
 elif gid.startswith('b47'):parts=[pr['wholeProfileApplicability']['conclusion'],pr['case2ScientificJudgment']['missingMaterialResolved']['conclusion'],pr['case2ScientificJudgment']['acquisitionAndEvidenceBoundary']]
 elif gid.startswith('ffec'):parts=[pr['retainedScientificContent'],pr['changedContextReview'],pr['practicalAcquisition'],pr['remainingSourceBoundary']]
 else:parts=[pr['wholeThreeCaseProfileApplicability']['conclusion'],pr['wholeThreeCaseProfileApplicability']['executionMeaning']]+pr['remainingLimits']
 reason='\n\n'.join(parts);assert len(reason)<=2000
 r.update(reviewId=review_id,status='needs_human_review',reviewAuthority='ai_candidate',reviewedAt=source['P']['originalObservedAt'],reviewer=source['P']['originalReviewer'],reason=reason,evidenceLevel='E1',maximumClaimScope='G1',reviewRunIds=[],dissent=[])
 P.append(r)
 aparts=[ar[k] for k in ['minimalityReason','reason','deltaAndSeparabilityCheck','minimalityCheck','practicalBoundary','boundary','scopeBoundary','contextBoundary'] if k in ar]
 A.append({'schemaVersion':1,'reviewId':atomic_id,'ruleVersion':'semantic-atomicity-v1','landscapeId':candidate['landscapeId'],'goalId':gid,'fingerprint':'sha256:'+'0'*64,'status':'atomic','semanticAtomic':True,'reviewedAt':source['A']['originalObservedAt'],'reviewer':source['A']['originalReviewer'],'reason':'\n\n'.join(aparts)})
 provenance.append({'goalId':gid,'POriginal':source['P'],'AOriginal':source['A'],'normalPReasonOriginalParagraphs':parts,'normalAReasonOriginalParagraphs':aparts,'noNewRunOrModelClaim':True})
put(O/'positive/P5.genuine-original-science.seed-before-mechanical-fingerprints.json',P)
ap=O/'atomicity/A5.original-genuine-atomic-decisions.before-stock-FP.jsonl';ap.parent.mkdir();ap.write_text(''.join(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n' for r in A))
pcfg={'$schema':'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json','schemaVersion':2,'reviewId':review_id,'goalFingerprintRuleVersion':'goal-evidence-v1','profileRuleVersion':'positive-understanding-evidence-v2','landscapeId':candidate['landscapeId'],'landscapePath':hostplan['normalCanonicalPath'],'semanticKindLedgerPath':hostplan['normalSemanticPath'],'reviewCriteriaPath':'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md','reviewPath':(O/'positive/P5.genuine-informed-current-E1G1.normal.jsonl').relative_to(R).as_posix(),'reviewedResourceTypes':['goal-visualization'],'requireApproved':False,'scope':{'label':'Fünf genuine informierte E1/G1-Designprofile, keine Human-/Ausführungsfreigabe','goalIds':ids}}
acfg={'schemaVersion':1,'reviewId':atomic_id,'ruleVersion':'semantic-atomicity-v1','landscapeId':candidate['landscapeId'],'landscapePath':hostplan['normalCanonicalPath'],'reviewPath':ap.relative_to(R).as_posix(),'scope':{'label':'Fünf genuine aktuelle Atomicity-Entscheidungen; nur technischer Transport','leafGoalIds':ids}}
put(O/'config/P5.genuine-informed-current.normal.config.json',pcfg);put(O/'config/A5.genuine-informed-current.normal.config.json',acfg)
mem=load(O/'inputs/M2.exact-original-decisions-and-explicit-local-text-deltas.no-new-memory-science.json');morig=load(verify(mem['originalConfig']));mp=O/'memory/M2.exact-original-decisions.before-stock-FP.jsonl';mp.parent.mkdir();mp.write_text(''.join(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n' for r in mem['originalTwoWholeRecords']));cards=O/'memory/cards75.original-whole-bytes.working-copy.jsonl';shutil.copyfile(verify(mem['originalCardsReview']),cards)
mcfg=copy.deepcopy(morig);mcfg.update(reviewPath=mp.relative_to(R).as_posix(),cardReviewPath=cards.relative_to(R).as_posix(),reportPath=(O/'memory/M2.report.not-written.md').relative_to(R).as_posix(),scope={'label':'Nur zwei dokumentierte Textdelta-Fingerprintbindungen, gleiche ursprüngliche M- und Kartenentscheidungen','leafGoalIds':['96d33fb6-ed14-50ab-b5c7-5ce0559d518a','0b5342b9-512d-573f-90d5-7522aee35efa','31148286-b8db-57a7-8da2-2e0479240a2c','0f0c6c98-13dc-5347-ac95-5b50c9c17bb6']});put(O/'config/M2.original-decisions-current-text-binding.config.json',mcfg)
put(O/'TRANSPORT.genuine-informed-P5-A5-context-sources.no-new-science.json',{'schemaVersion':1,'role':'Rein technische informierte Serialisierung tatsächlicher FIRSTs; keine neue unabhängige Wissenschaft','records':provenance,'contextScienceSource':ref(ctxp),'actualFinal96VSource':ref(vp),'actualFinal96ImageAuthorSource':vs['authorSelector'],'normalReviewRunIds':[],'runClaim':'Das geschlossene V2-Schema erlaubt leere RunIDs ausdrücklich ohne Laufbehauptung. Keine Modellidentität, keine Blindheit und kein unbekannter Runtime-Zeitraum erfunden.','normalPAuthority':'ai_candidate / needs_human_review, ausschließlich E1/G1-Design','P5ScienceAndContextSourcesDocumentedSeparately':True,'M2KeepsOriginalScientificDecisionsAndCards':True,'newScienceVotes':0,'newDRecords':0})
put(O/'INPUTS.final-P5-A5-M2-V2-before-targeted-stock-checks.json',{'schemaVersion':1,'canonical':ref(cp),'baselineSemantic':old['semantic'],'baselineQA':old['visualizationQA'],'qaSeed':ref(qaseed),'stockHostPlan':ref(O/'REBUILD.prepared-new-informed-PA-final8-host.awaiting-context.json'),'final96VSelector':ref(vp),'twoTextContextSelector':ref(ctxp),'new96Image':va['image'],'new96PublicAlias':normal_public,'new96CanonicalAlias':normal_canonical,'P5Config':ref(O/'config/P5.genuine-informed-current.normal.config.json'),'A5Config':ref(O/'config/A5.genuine-informed-current.normal.config.json'),'M2Config':ref(O/'config/M2.original-decisions-current-text-binding.config.json'),'P5OriginalScienceSeed':ref(O/'positive/P5.genuine-original-science.seed-before-mechanical-fingerprints.json'),'finalNative8StillWaitingForNeighborP2Scope':True,'normalRunClaims':0,'newScienceVotes':0})
print(json.dumps({'wholeGoals':570,'other568Exact':True,'P5Seed':5,'A5Seed':5,'M2Originals':2,'genuineCurrentVBindings':2,'normalRunClaims':0,'new96Image':va['image']['sha256'],'stockChecks':0,'NativeRenders':0}),flush=True)
