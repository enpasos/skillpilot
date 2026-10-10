# SPDX-License-Identifier: Apache-2.0
import pathlib,json,hashlib,datetime,tempfile,os,shutil
R=pathlib.Path('/home/enpasos/projects/skillpilot');BASE=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10');P=BASE/'biologie-neuro-ten-current343-dual-D-P-V-inactive-integration-technical-root-20261010-v1';O=BASE/'biologie-neuro-ten-reviewed-active-adoption-technical-root-v1'
def read(p):return json.loads((R/p).read_text())
def ref(p):p=pathlib.Path(p);b=(R/p).read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verify(x):assert ref(x['path'])=={k:x[k] for k in ['path','sha256','bytes']},x['path']
def put(p,x):f=R/O/p;f.parent.mkdir(parents=True,exist_ok=True);assert not f.exists();f.write_bytes(x if isinstance(x,bytes) else (json.dumps(x,ensure_ascii=False,indent=2)+'\n').encode());return ref(O/p)
def atomic(dst,data):
 dst.parent.mkdir(parents=True,exist_ok=True)
 with tempfile.NamedTemporaryFile(dir=dst.parent,prefix='.m7-bio10-',suffix='.tmp',delete=False) as f:f.write(data);tmp=f.name
 os.replace(tmp,dst)
assert not (R/O).exists();entry=P/'current343-ten-reviewed-inactive.completed.entry.json';freeze=P/'FINAL.current343-ten-reviewed-inactive.technical.freeze.json';j=read(entry);assert j['status']=='INACTIVE_VERIFIED_READY_FOR_ROOT_CURRENT_ADOPTION';assert j['candidateStrictBiology']==353 and j['actualCurrentActiveStrictBiology']==343
f=read(freeze)
for x in f['ownFiles']+f['immutableExternalFiles']:verify(x)
planpath=P/'ROOT.current343-ten-reviewed-final-copy-plan.inactive.json';plan=read(planpath);ops=plan['operations'];assert len(ops)==44 and len({x['target'] for x in ops})==44
for op in ops:
 verify(op['source'])
 if op.get('expectedCurrentTarget'):verify(op['expectedCurrentTarget'])
 elif (R/op['target']).exists():assert ref(op['target'])['sha256']==op['source']['sha256'],op['target']
ids=set(j['goalIds']);CAN=pathlib.Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json');QA=pathlib.Path('curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json');REG=pathlib.Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json');SRC=pathlib.Path('app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json');K=pathlib.Path('curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json');L=pathlib.Path('curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json')
unchanged=[ref(K),ref(L),ref('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')];byold={x['id']:x for x in read(CAN)['goals']};bynew={x['id']:x for x in read(pathlib.Path(ops[0]['source']['path']))['goals']};assert byold.keys()==bynew.keys() and len(byold)==479;delta={k:sorted(f for f in set(v)|set(bynew[k]) if v.get(f)!=bynew[k].get(f)) for k,v in byold.items() if v!=bynew[k]};assert set(delta)==ids and all(v==['resourceLinks'] for v in delta.values())
oldreg=read(REG);bioold=next(x for x in oldreg['subjects'] if x['subject']=='biologie');regop=next(x for x in ops if x['target']==str(REG));bionew=read(pathlib.Path(regop['source']['path']));keys={'positiveEvidenceConfigPaths','resolutionIndexPaths'};assert {k:v for k,v in bioold.items() if k not in keys}=={k:v for k,v in bionew.items() if k not in keys}
for k in keys:assert bionew[k][:-1]==bioold[k] and len(bionew[k])==len(bioold[k])+1
for path,name in [(CAN,'whole479'),(QA,'QA394'),(REG,'registry'),(SRC,'source-config'),(pathlib.Path('docs/legal/ai-transparency-inventory.json'),'AI-inventory')]:put('before/'+name+'.exact.json',(R/path).read_bytes())
put('adoption.preflight.actual.json',{'schemaVersion':1,'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'entry':ref(entry),'freeze':ref(freeze),'copyPlan':ref(planpath),'verifiedOwnFiles':len(f['ownFiles']),'verifiedImmutableExternalFiles':len(f['immutableExternalFiles']),'onlyTenResourceLinkDeltas':delta,'normalInactiveCentral353Exit0':j['normalFinalCentralTerminal'],'genuineSourceAandB':j['actualCompletedCurrentSourceAandB'],'unchangedKindsLedgerChemistry':unchanged,'protectedPrior343RetainedInActualInactiveCentral':True,'humanApproval':False,'writesBeforeThisPreflight':[]})
for op in ops:
 dst=R/op['target'];data=(R/op['source']['path']).read_bytes()
 if op['target']==str(REG):
  new=json.loads(json.dumps(oldreg));new['subjects']=[bionew if s['subject']=='biologie' else s for s in oldreg['subjects']];data=(json.dumps(new,ensure_ascii=False,indent=2)+'\n').encode()
 atomic(dst,data)
 if op['target']!=str(REG):assert ref(op['target'])['sha256']==op['source']['sha256']
assert [ref(x['path']) for x in unchanged]==unchanged
put('actual-reviewed-ten-active-adoption.receipt.json',{'schemaVersion':1,'adoptedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'Technical exact transfer of completed genuine independent A/B D/P/V and targeted SOURCE reviews; not further independent science','goalIds':sorted(ids),'wholeGoalCount':479,'curricularAtomicDenominator':394,'onlyTenResourceLinkDeltas':delta,'pairedVisualizationGoals':10,'newPConfigAdded':1,'newDIndexAdded':1,'twoSourcePairsAndTwoRealBYPrimariesAdopted':True,'sourceAtlasOutputsStillPending':True,'unchangedKindsLedgerChemistry':unchanged,'allOtherSubjectRegistryObjectsExact':True,'PStatus':'needs_human_review','PAuthority':'ai_candidate','approved':0,'machineScope':'E1/G1','copies':[ref(op['target']) for op in ops],'strictCountPendingRootNormalCentral':True,'strictCompletionClaim':0,'fullStableChecksPending':True,'humanApproval':False,'humanTrial':False,'gitGithubWrites':[]})
shutil.copyfile(pathlib.Path(__file__),R/O/'adopt-ten.actual.py');print(json.dumps({'adoptedGoalCount':10,'copies':44,'protected343InactiveProof':True,'normalRootCentralPending':True,'humanApproval':False}))
