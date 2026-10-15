from pathlib import Path
import hashlib, json, subprocess, datetime
ROOT=Path.cwd()
OWN=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-three-source-duty-carriers-prospective422-fresh-independent-a-20261015-v1')
B=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-four-source-duties-explicit-compulsory-domain-carriers-author-20261014-v3')
SEL=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-source-three-goals-union-context-corrected-review-selector-root-20261014-v2')
def read(p):return json.loads(Path(p).read_text())
def bind(p):
 p=Path(p);d=p.read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(d).hexdigest(),'bytes':len(d)}
def write(n,x):(OWN/n).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
s=read(SEL/'NEUTRAL.current-three-source-goals-eleven-cases-images-and-complete-context-union.json'); a=read(s['wholeSourceAuthorNeutral']['path'])
refs=[]
def collect(x):
 if isinstance(x,dict):
  if {'path','sha256'}<=x.keys():refs.append(x)
  for v in x.values():collect(v)
 elif isinstance(x,list):
  for v in x:collect(v)
collect(s);collect(a)
# Hash checks are mechanical integrity checks, never scientific source evidence.
verified=[]
for r in refs:
 z=bind(r['path']);verified.append({'path':r['path'],'hashMatches':z['sha256']==r['sha256'],'bytesMatch':('bytes' not in r or z['bytes']==r['bytes'])})
for p in [Path(s['isolation40NewCorrectedImageSelector']['path']),Path(s['researchAndDyeNewImageSelector']['path'])]:
 collect(read(p))
verified=[]
for r in refs:
 z=bind(r['path']);verified.append({'path':r['path'],'hashMatches':z['sha256']==r['sha256'],'bytesMatch':('bytes' not in r or z['bytes']==r['bytes'])})
source=[]
for r in a['officialPhysicalPages']:
 p=r['physicalPage'];d=subprocess.check_output(['pdftotext','-layout','-f',str(p),'-l',str(p),r['path'],'-']);source.append({'pdf':r['path'],'physicalPage':p,'actualPdfExtractionMatchesBoundText':d==Path(r['actualReadExtract']['path']).read_bytes()})
old=read(SEL/'CHECK.actual-complete305-old-new-union-context-impact.json')
g0={g['id']:g for g in read(old['inputs'][0]['path'])['goals']};g1={g['id']:g for g in read(old['inputs'][1]['path'])['goals']}
closed=read(old['inputs'][2]['path'])['subjects'][0]['strictCompleteGoalIds']
def neighbors(gs,k):
 own=gs.get(k,{})
 return set(own.get('requires',[])+own.get('contains',[]))|{i for i,v in gs.items() if k in v.get('requires',[])+v.get('contains',[])}
impact=[]
for k in closed:
 changed=[n for n in sorted(neighbors(g0,k)|neighbors(g1,k)) if g0.get(n)!=g1.get(n)]
 if changed:impact.append({'goalId':k,'ownBodyChanged':g0.get(k)!=g1.get(k),'changedDirectNeighborBodies':changed})
assert impact==old['affectedPriorClosedGoals']
assert all(g0.get(k)==g1.get(k) for k in closed)
cases=read(B/'materials/eleven-complete-cases.v3.bound.author.json')['cases'];profiles=read(B/'candidate/author-profiles.three.raw.json')['profiles']
from jsonschema import Draft202012Validator
schema=read('contracts/goal-evidence/v2/goal-evidence-profile.schema.json');val=Draft202012Validator({'$ref':'#/$defs/profile','$defs':schema['$defs']})
profile_errors=[{'goalId':p['goalId'],'errors':[e.message for e in val.iter_errors(p['profile'])]} for p in profiles]
shape={'caseCount':len(cases),'rubricCount':sum(len(c['rubric']) for c in cases),'caseIds':[c['id'] for c in cases],'allCasesUnexecuted':all(c['executed'] is False and c['learnerWorkPresent'] is False for c in cases),'caseModelStatus':sorted(set((c['evidenceLevel'],c['maximumClaimScope']) for c in cases)),'profileCount':len(profiles),'expectationCount':sum(len(p['profile']['expectations']) for p in profiles),'rawProfileSchemaChecks':profile_errors}
write('CHECK.exact-inputs-cases-profile-shapes-pdf-pages-and-union-context.actual.json',{'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'bounded input integrity and structural checks only; no scientific approval','allReferenceHashesMatch':all(r['hashMatches'] and r['bytesMatch'] for r in verified),'referenceChecks':verified,'sourcePdfExtractionChecks':source,'shape':shape,'correctedUnionContext':{'priorClosed':len(closed),'allOwnBodiesUnchanged':True,'affected':impact,'unaffected':len(closed)-len(impact)},'fullBuildOrGitOrCI':False})
# Specific immutable inputs actually inspected; historical FIRST files/READMEs are excluded.
paths=[str(SEL/'NEUTRAL.current-three-source-goals-eleven-cases-images-and-complete-context-union.json'),str(SEL/'FILES.finite-own-artifacts.seal.json'),str(SEL/'CHECK.actual-complete305-old-new-union-context-impact.json'),str(B/'NEUTRAL.exact-V3-whole-author-inputs.for-two-other-reviewers.json'),str(B/'FILES.finite-author-v3.seal.json')]
for k in ['wholeSourceGoalBodiesWithImageLinks','wholeProspective422Canonical','materialsWholeElevenDEENCases','threeRawProfiles','sourceMinimalityQuestion','sourceOperatorAndScopeMatrix','requiresActualDidacticAndAcquisitionReview','wholeSixPrimaryPagesBindings','isolation40NewCorrectedImageSelector','researchAndDyeNewImageSelector']:paths.append(s[k]['path'])
for n in ['inputs/canonical551.current419.exact.json','inputs/whole-equivalence-candidates-and-prerequisite-closure.exact.json','inputs/a880.whole-current-goal.exact.json','inputs/a880.original-whole-profile-extraction.exact.json','candidate/placement-target-and-source-CAS-plan.author.json','candidate/views/de-hb-lk.view.author.json','candidate/views/de-bw-lk.view.author.json','inputs/views/de-hb-lk.view.exact.json','inputs/views/de-bw-lk.view.exact.json','inputs/source-before/HB-source.exact.json','inputs/source-before/HB-mapping.exact.json','inputs/source-before/BW-source.exact.json','inputs/source-before/BW-mapping.exact.json','candidate/sources/HB-source.author-pending.json','candidate/sources/HB-mapping.author-pending.json','candidate/sources/BW-source.author-pending.json','candidate/sources/BW-mapping.author-pending.json']:paths.append(str(B/n))
for r in a['officialWholePrimaryPdfs']:paths.append(r['path'])
for r in a['officialPhysicalPages']:paths.append(r['actualReadExtract']['path'])
i=read(s['isolation40NewCorrectedImageSelector']['path']);j=read(s['researchAndDyeNewImageSelector']['path']);images=[i['newPng']]+i['previews']+j['newPNGs']+j['actual360And680Previews']
paths += [r['path'] for r in images]
paths+=['AGENTS.md','docs/concept/skill-graph/atomic-goal-visualizations.md','docs/concept/skill-graph/learning-goal-book-and-evidence-review-pipeline.md','contracts/goal-evidence/v2/goal-evidence-profile.schema.json']
paths=list(dict.fromkeys(paths))
write('INPUTS.actual-read-inventory.before-peer.json',{'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'reviewer':'/root/source3_fresh_a_20261015','freshIndependentReviewerOfCurrentThree':True,'currentPeerOutcomesRead':False,'rootChatOrSessionLogsRead':False,'anyInputReadmeRead':False,'noNativeCurrentD3BundleExists':True,'readModes':{'whole551Canonical':'machine loaded whole canonical; relevant science independently searched across all titles/descriptions; 93 selected alternative/prerequisite bodies read in full, plus missing96d3 and98ae3 full from canonical','fullProspective422Canonical':'whole parsed and exact neighbor union compared; all3 whole goals and immediate required/context bodies read; not an assertion that every unrelated prospectively unchanged goal was scientifically rereviewed','officialWholePdfs':'exact whole PDFs hash checked and wholly extracted mechanically; actual six complete pages read from bound layout text and independently re-extracted; unrelated full-PDF pages not claimed as a new scientific review','materials':'all11 complete DE/EN material, task, answer and44 rubrics read; historical N/ST cases inspected for constraints only, no new votes','profiles':'all3 raw full profiles,12 expectations, all case links and coverage/variation contracts read','images':'all3 actual native PNG plus their actual360/680 PNG previews visually inspected with original detail','sourceProposals':'whole before/after source/view JSON parsed; exact changed source entries and target positions reviewed, no whole-course clearance'},'historicalExposure':['Author selector explicitly states formerV2A is nowV3author; no author can independently approve ownV3.','AUTHOR minimality input discloses actualV2dissent:V2B favoured bounded a880 reuse with mandatory contexts, V2A found unchanged wholeP insufficient. This is a disclosed historical hypothesis, not my evidence or current peer vote.','Image selector discloses prior B gray-count finding and correction. No original B FIRST/outcome file opened.','Whole canonical assessment objects contain prior A/B content-review claims; read as historical metadata only, no new assessment acceptance.','Original93 is described as reactivated exactV1 body; oldV1/V2 FIRST science/seal files were not opened.'],'files':[bind(p) for p in paths],'actualImageReads':[bind(r['path']) for r in images],'externalPrimaryChecks':[{'url':'https://www.basf.com/global/de/who-we-are/history/chronology/1865-1901/1897','access':'web open 2026-10-15','use':'checked supplied1897 commercialization fact only; manufacturer perspective remains bounded'},{'url':'https://www.acs.org/molecule-of-the-week/archive/i/indigo.html','access':'web open 2026-10-15','use':'checked low water solubility, soluble reduced form and air oxidation; no general ecological approval imported'}],'excludedUnopened':['currentSource3B FIRST/typed/README/results','all root chat/session logs','bound historical v2-A/B FIRST science and seals','superseded old-graph-only impact audit']})
print(json.dumps({'referenceChecks':len(verified),'allExact':all(r['hashMatches'] and r['bytesMatch'] for r in verified),'shape':shape,'affectedContexts':len(impact),'readInventoryFiles':len(paths)},ensure_ascii=False))
