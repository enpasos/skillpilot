#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Check only this inactive existing-carrier proposal and exact dependencies."""
import copy,datetime,hashlib,importlib.util,json,pathlib,subprocess,jsonschema
ROOT=pathlib.Path(__file__).resolve().parents[7];BASE=pathlib.Path(__file__).resolve().parent;REL=BASE.relative_to(ROOT).as_posix();checks=[]
def read(p):return json.loads((ROOT/p).read_text())
def objsha(o):return hashlib.sha256(json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def pin(p):
 p=ROOT/p;b=p.read_bytes();return {'path':p.relative_to(ROOT).as_posix(),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def ok(n,c):checks.append({'check':n,'passed':bool(c)});assert c,n
src=read(REL+'/inputs/e81.whole-current-goal-and-selected-P.EXACT.json');g=src['goal'];gid=g['id'];owner=src['selectedOwner'];old=owner['record'];new=json.loads((BASE/'candidates/P.one-whole-profile.pending.jsonl').read_text());bp=old['profile'];ap=new['profile'];ls=read(src['landscape']['path']);current=next(x for x in ls['goals'] if x['id']==gid)
ok('whole current goal exact',g==current);ok('SN already applicable','DE-SN' in g['applicability']['jurisdiction']);ok('whole old P exact selected owner',json.loads((ROOT/owner['recordPath']).read_text().splitlines()[owner['line']-1])==old)
for key,n in [('expectations',7),('variationAxes',7),('applicationCaseBriefs',5)]:
 ok('old full '+key+' prefix exact',len(bp[key])==n and ap[key][:n]==bp[key] and len(ap[key])==n+1)
 for i,b in enumerate(bp[key]):ok('old whole '+key+' item exact '+b['id'],b==ap[key][i])
expected=copy.deepcopy(bp)
for key in ['expectations','variationAxes','applicationCaseBriefs']:expected[key].append(ap[key][-1])
expected['coverageExpectations']['requiredExpectationIds'].append(ap['expectations'][-1]['id']);ok('only four append locations in whole P',ap==expected)
for key in ['minimumIndependentDemonstrations','freshVariationRequired','independentTransferRequired','alternativeExpectationGroups']:ok('existing coverage rule exact '+key,ap['coverageExpectations'][key]==bp['coverageExpectations'][key])
ok('old requiredIDs retained whole in order',ap['coverageExpectations']['requiredExpectationIds'][:-1]==bp['coverageExpectations']['requiredExpectationIds']);ok('min2 retained',ap['coverageExpectations']['minimumIndependentDemonstrations']==2)
for key in ['goalFingerprint','reviewInputFingerprint','reviewCriteriaFingerprint','evidenceLevel','maximumClaimScope']:ok('unchanged native binding '+key,new[key]==old[key])
ok('AI author only not approval',new['reviewAuthority']=='ai_candidate' and new['status']=='needs_human_review');jsonschema.validate(new,read('contracts/goal-evidence/v2/goal-evidence-profile.schema.json'));ok('complete whole P schema',True);ok('whole P matches production candidate input',ap==read(REL+'/candidates/P.one-candidate-set.pending.json')['goals'][0]['profile'])
(BASE/'operations/P.whole-old-and-new-owner-CAS.pending.json').write_text(json.dumps({'role':'Inactive one whole existing e81 P successor; no writer/selection mutation','goalId':gid,'existingOwner':{'config':pin(owner['configPath']),'wholeConfig':read(owner['configPath']),'recordFile':pin(owner['recordPath']),'line':owner['line']},'before':old,'after':new,'beforeObjectSHA256':objsha(old),'afterObjectSHA256':objsha(new),'newCandidateConfig':pin(REL+'/candidates/P.one-author.config.json'),'activationBoundary':'After foreign review select the coherent new config/record together; do not overwrite the old record under its old mismatching reviewId config. Preserve all other selected450 goal owners; no new goal or duplicate selection.','normalWrite':False},ensure_ascii=False,indent=2)+'\n')
for r in read(REL+'/inputs/actual-input-pins.json')['pins']:ok('actual input pin '+r['path'],pin(r['path'])==r)
bind=read(REL+'/candidates/SN-scoped-material-bindings.exact.pending.json')
for r in bind['reused']:ok('unchanged whole original copy '+r['exactCopy']['path'],pin(r['original']['path'])==r['original'] and pin(r['exactCopy']['path'])==r['exactCopy'] and (ROOT/r['original']['path']).read_bytes()==(ROOT/r['exactCopy']['path']).read_bytes())
for key in ['additiveLearnerOverlay','additiveHypothesisBlank','additiveTeacherCriteria']:ok('new exact scoped binding '+key,pin(bind[key]['path'])==bind[key])
def allnull(v):return all(allnull(x) for x in v.values()) if isinstance(v,dict) else all(allnull(x) for x in v) if isinstance(v,list) else v is None
blank=read(bind['additiveHypothesisBlank']['path']);ok('new hypothesis record wholly empty',allnull(blank['before']) and allnull(blank['after']))
oldblank=read(REL+'/reused/observation-protocol.EMPTY.DE-EN.json')
for k in ['localRelease','actualConditions','initialState','endComparison','ownActions','returnAndDisposal','interpretation','freshPaperTransfer']:ok('old actual observation fields remain null '+k,allnull(oldblank[k]))
for r in oldblank['observations']:ok('old actual observations null time'+str(r['nominalTimeMin']),allnull({k:v for k,v in r.items() if k!='nominalTimeMin'}))
selection=read(REL+'/AUTHOR.selection-and-boundaries.pending.json');ok('ce0 explicitly unselected no denominator increase',selection['previousCandidate']['selection']=='UNSELECTED_DO_NOT_INTEGRATE' and selection['ordinaryDenominatorDelta']==0)
for name,sealpath in [('ce0 original',selection['previousCandidate']['seal']['path']),('recycling V2','curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-recycling-atomicity-source-author-20261018-v2/SEAL.author-source-successor.pending-independent-review.json')]:
 seal=read(sealpath)
 for r in seal['outputs']:ok(name+' sealed output unchanged '+r['path'],pin(r['path'])==r)
source=read(REL+'/operations/source.two-SN-unions.on-recycling-v2.whole-CAS.pending.json');normal=read(source['normalInput']['path']);rec=read(source['requiredPredecessor']['path']);base=copy.deepcopy(normal)
for r in rec['operations']:
 if r['targetPath']==source['normalInput']['path']:
  key=r['jsonPointer'].lstrip('/');ok('exact Recycling V2 precondition '+key,normal[key]==r['before']);base[key]=copy.deepcopy(r['after'])
ops={r['jsonPointer'].lstrip('/'):r for r in source['operations']};ok('only full mappings/decisions containers proposed',set(ops)=={'mappings','decisions'})
for key,r in ops.items():ok('source whole predecessor exact '+key,r['before']==base[key] and objsha(r['before'])==r['beforeObjectSHA256'] and objsha(r['after'])==r['afterObjectSHA256'])
ok('all previous mappings preserved exact, append only2',ops['mappings']['after'][:-2]==base['mappings'] and len(ops['mappings']['after'])==len(base['mappings'])+2)
changed=[]
for i,(before,after) in enumerate(zip(base['decisions'],ops['decisions']['after'])):
 if before!=after:changed.append(i)
 else:ok('unrelated full Recycling V2 decision retained '+str(i),before==after)
ok('only two specified source decisions change',changed==[68,207] and len(base['decisions'])==len(ops['decisions']['after']))
for r in source['wholeChangedUnions']:
 sid=r['sourceGoalId'];b=r['recyclingV2BeforeWholeDecision'];a=r['afterWholeDecision'];ok('existing3 theory contributors remain '+sid,a['canonicalGoalIds']==b['canonicalGoalIds']+[gid]);ok('exact old theory union retained '+sid,r['afterWholeDirectUnion'][:-1]==r['recyclingV2BeforeWholeDirectUnion']);ok('only existing e81 partial added '+sid,r['addedMapping']['canonicalGoalId']==gid and r['addedMapping']['matchType']=='partial');ok('source successor no whole completion claim '+sid,a['authorCandidate']['wholeSourceCompletionClaim'] is False and r['wholeOfficialDutyDeleted'] is False)
no=read(REL+'/operations/goal-and-SN-views.exact-NOOP.pending.json');ok('whole e81 goal exact no-op',no['wholeGoalBefore']==no['wholeGoalAfter']==g)
for r in no['wholeSNViews']:ok('whole SN view exact no-op '+r['path'],read(r['path'])==r['before']==r['after'] and pin(r['path'])==r['input'])
native=read(REL+'/checks/CHECK.native-current41-and-unchanged-DAGs.actual.json');ok('actual native41 current compiler clean',native['allChemistryViews']==41 and not native['failures']);ok('both SN current targets',len(native['bothSNViewsAlreadyTarget'])==2 and all(v['e81Role']=='target' for v in native['bothSNViewsAlreadyTarget']))
for k,r in native['graphs'].items():ok('unchanged current '+k+' DAG',not r['cycles'] and not r['missing'])
spec=importlib.util.spec_from_file_location('validate',ROOT/'scripts/validate_schemas.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module);symlink=module.curriculum_symlink_errors(ROOT);ok('AGENTS7.4 curriculum portability',not symlink)
parsed=[]
for f in sorted(BASE.rglob('*')):
 if f.suffix=='.json':json.loads(f.read_text());parsed.append(f.relative_to(ROOT).as_posix())
 elif f.suffix=='.jsonl':
  for line in f.read_text().splitlines():
   if line.strip():json.loads(line)
  parsed.append(f.relative_to(ROOT).as_posix())
ok('no complete third-party page or source PDF/HTML publicly copied',not list(BASE.rglob('*.pdf')) and not list(BASE.rglob('*.html')) and all(f.parent.name=='checks' for f in BASE.rglob('*.txt')))
ok('no tracked normal writes',not subprocess.check_output(['git','diff','--name-only'],cwd=ROOT,text=True).strip())
r={'role':'Bounded author consistency/schema/whole-prefix/CAS/portability checks, not independent content approval','checkedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'goalId':gid,'checksPassed':len(checks),'checks':checks,'failures':[],'oldWholePExactPrefix':{'expectations':7,'variationAxes':7,'applicationCaseBriefs':5,'minimumIndependentDemonstrations':2,'fresh':True,'independentTransfer':True},'newCounts':[8,8,6],'canonicalEdits':0,'viewEdits':0,'ordinaryDenominatorDelta':0,'allJSONandJSONLParsed':parsed,'curriculumSymlinkErrors':symlink,'normalWrites':False,'fullCheckRun':False,'newIndependentOrHumanApproval':False,'realTeacherPretestOrLearnerPerformanceClaim':False}
(BASE/'checks/CHECK.bounded-retention-CAS-material-pins.actual.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'checksPassed':len(checks),'wholeOldPExactlyPreserved':True,'existingGoalId':gid,'newOrdinaryAtoms':0,'canonicalAndViewEdits':0,'normalWrites':False}))
