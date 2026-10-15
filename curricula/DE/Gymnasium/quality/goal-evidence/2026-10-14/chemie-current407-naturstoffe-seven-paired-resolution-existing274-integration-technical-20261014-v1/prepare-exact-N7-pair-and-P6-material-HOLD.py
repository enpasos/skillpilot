# Apache-2.0. Exact sealed D7 peer transport and bounded positive-evidence selection.
import copy, datetime, hashlib, json, pathlib, shutil
R=pathlib.Path('/home/enpasos/projects/skillpilot');E=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14';O=pathlib.Path(__file__).parent
N=E/'chemie-current407-naturstoffe-seven-shared-native-first-pass-technical-20261014-v1'
A=E/'chemie-current407-naturstoffe-seven-native-independent-a-20261014-v1';B=E/'chemie-current407-naturstoffe-seven-native-independent-b-20261014-v1'
read=lambda p:json.loads(p.read_text())
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p):return {'path':str(p.relative_to(R)),'sha256':sha(p),'bytes':p.stat().st_size}
def write(n,j):
 p=O/n;p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists(),p;p.write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n');return p
seals=[]
for root,name,expected in [(A,'SEAL.finite-nativeD7-independent-a-completed.actual.json','sha256:1e0bad63f5beeed8c0d1f46852ba048c47800fa142430b21ab471076f1b9afbd'),(B,'SEAL.finite-current407-naturstoffe-seven-native-independent-b-after-stock-PASS.actual.json','sha256:9ecdba4f')]:
 seal=root/name;assert sha(seal).startswith(expected),(seal,sha(seal))
 for entry in read(seal)['files']:
  p=R/entry['path'];p=p if p.exists() else root/entry['path'];assert sha(p)==entry['sha256'] and p.stat().st_size==entry['bytes'],p
 seals.append(bind(seal))
assert sha(A/'FIRST-SCIENCE-SEAL.nativeD7-independent-a.actual.json')=='sha256:b2fad2f21058a8861d0a44ed57c2c909c62d13c16cd6fc973092791a340c95c0'
assert sha(B/'SEAL.first-science-current407-naturstoffe-seven-independent-b.actual.json')=='sha256:572e201878abff0ca37541b377b3172269015b09b3b45a820ce501da703ac465'
cfg=read(N/'configs/native-seven.shared-first-pass.batch.config.json');ids=cfg['goalIds'];hold='68292f39-04e7-5924-b6a5-731c7f7f82ee'
cfg['outputDirectory']=str((O/'native-seven').relative_to(R));config=write('native-seven.inactive-copy.batch.config.json',cfg)
shutil.copytree(N/'native-seven',O/'native-seven',dirs_exist_ok=False)
manifest=read(O/'native-seven/batch-manifest.json');oldManifest=copy.deepcopy(manifest);manifest['configPath']=str(config.relative_to(R));manifest['configDigest']=sha(config)
(O/'native-seven/batch-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
copies=[];summary=[]
for label,root,folder,key in [('a',A,'results','first'),('b',B,'round-b/results','second')]:
 bid=manifest['artifacts']['rounds'][key]['batchId'];target=O/f'native-seven/round-{label}/results';target.mkdir(exist_ok=True)
 records=root/folder/f'{bid}.records.jsonl';run=root/folder/f'{bid}.run.json';rows=[json.loads(x) for x in records.read_text().splitlines() if x.strip()]
 assert len(rows)==7 and {x['goalId'] for x in rows}==set(ids) and all(x['decision']=='keep' for x in rows)
 for src in [records,run]:
  dst=target/src.name;assert not dst.exists();shutil.copyfile(src,dst);assert src.read_bytes()==dst.read_bytes();copies.append({'source':bind(src),'target':bind(dst),'rawOriginalBytesExact':True})
 summary.append({'round':label,'actualDecisions':[(r['goalId'],r['decision']) for r in rows],'run':read(run)})
author={'schemaVersion':1,'manifestId':cfg['batchId']+'-technical-paired-synthesis','synthesizedBy':'Codex technical integrator; genuine first-sealed A/B only; no new science vote',
 'decisions':[{'goalId':g,'resolutionDecision':'keep_current','evidenceRound':'first',
  'rationaleDe':'Technische Synthese der beiden echten unveränderten aktuellen FIRST_PASS-KEEP-Records nach beiden endgültigen unabhängigen Seals. Kein neues Fachvotum, kein P/M-/Quellen- oder Human-Grant. Der konkrete682-Formelmaterial-HOLD und die vier BB/BE-M311-Erwerbs-HOLDs bleiben getrennt erhalten.',
  'rationaleEn':'Technical synthesis of genuine unchanged current FIRST_PASS KEEP records after both final independent seals. No new scientific vote, P/M/source or human grant. The concrete682 formula-material HOLD and four BB/BE M311 acquisition HOLDs remain separate.'} for g in ids]}
write('native-seven/synthesis-authoring.technical-no-new-vote.json',author)
write('INPUTS.exact-D7-independent-seals-and-original-campaign-transport.actual.json',{
 'schemaVersion':1,'importedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'actualFinalPeerSeals':seals,
 'originalBatchManifest':bind(N/'native-seven/batch-manifest.json'),'technicalBatchManifestBefore':oldManifest,'technicalBatchManifestAfter':manifest,
 'onlyManifestKeysChanged':['configPath','configDigest'],'onlyBatchConfigKeyChanged':'outputDirectory','actualOriginalRecordsAndRuns':copies,
 'actualScientificDDecisionCounts':[{'round':s['round'],'KEEP':len(s['actualDecisions'])} for s in summary],'newScienceVotes':0,'P682HeldNotClosed':True,'M311FourScopeHoldsNotClosed':True,'activeWrites':False})

# Withhold682 from the new P selection; preserve every original positive-evidence byte.
selection=[]
for label in ['a','b']:
 c=read(O/f'config/P7.{label}.preserved-original-stock-check.config.json');rp=R/c['reviewPath'];lines=rp.read_text().splitlines(keepends=True)
 kept=[x for x in lines if json.loads(x)['goalId']!=hold];held=[x for x in lines if json.loads(x)['goalId']==hold]
 assert len(lines)==7 and len(kept)==6 and len(held)==1
 kp=O/f'P/P6.{label}.exact-original-lines-except-held682.jsonl';hp=O/f'P/HELD682.{label}.whole-original-profile-byte-exact.jsonl';kp.write_text(''.join(kept));hp.write_text(''.join(held))
 c['scope']['goalIds']=[g for g in c['scope']['goalIds'] if g!=hold];c['scope']['label']='Six preserved original P profiles;682 whole original profile withheld for missing supplied structures'
 c['reviewPath']=str(kp.relative_to(R));out=write(f'config/P6.{label}.original-science-except-held682.normal-alias.config.json',c)
 selection.append({'round':label,'wholeOriginalP7':bind(rp),'selectedExactP6':bind(kp),'heldWholeOriginal682':bind(hp),'scopedP6Config':bind(out),'statusEvidenceLevelsAndAllScientificFieldsUnchanged':True})
cases=read(N/'cases/whole-retained-v1-three-goals-six-cases-and-rubrics.exact.json');whole=next(g for g in cases['goals'] if g['goalId']==hold)
assert whole['cases'][0]['taskDemandDe']=='Vergleiche Maltose und Saccharose anhand vollständig bereitgestellter Strukturformeln im reduzierenden Nachweis.'
assert set(whole['cases'][0])=={'id','taskDemandDe','taskDemandEn','expectedPerformanceDe','expectedPerformanceEn','understandingFocusDe','understandingFocusEn'}
af=read(A/'SCIENTIFIC.nativeD7-independent-a.first-whole-verdict.actual.json')
write('HOLD.exact682-missing-supplied-Maltose-Saccharose-formula-material-and-P6-selection.actual.json',{
 'schemaVersion':1,'recordedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'kind':'Concrete task-material delivery HOLD observed in current independent D7-A, preserved separately from D KEEP',
 'goalId':hold,'whole682CaseAndRubric':whole,'actualBoundWholeCaseCarrier':bind(N/'cases/whole-retained-v1-three-goals-six-cases-and-rubrics.exact.json'),
 'actualAFirstScience':bind(A/'SCIENTIFIC.nativeD7-independent-a.first-whole-verdict.actual.json'),'actualAResiduals':af['boundedResiduals'],
 'missingMaterial':'CaseA explicitly requires fully supplied maltose/sucrose structures; the complete bound case carrier attaches no such structure formulas or referenced structure asset. Model answers and schematic current visual do not supply the promised full structures.',
 'newOperativeP682Selected':False,'originalP7AndOldJudgmentsKeptWhole':True,'actualScopedP6Selections':selection,
 'noProfileStatusOrEvidenceLevelRewrite':True,'D7_A7_V7RemainSeparate':True,
 'b4QualitativeBoundary':'The existing b4 qualitative case can support the qualitative operator without a numerical dataset. No numeric-task duty or blanket block is invented.',
 'nextNeeded':'Complete bilingual task materials with correct supplied full structures, then targeted independent P examination and ordinary integration; no automatic closure from old P votes.',
 'predictedNetGainNotCounted':True,'newScienceVoteByIntegrator':False,'humanApproval':False,'activeWrites':False})
print(json.dumps({'originalDPeerRecordsAndRunsCopiedExact':4,'D7KEEP':7,'originalP7BothPreserved':True,'operativeP6BothSelected':True,'held682Originals':2,'config':str(config.relative_to(R))}))
