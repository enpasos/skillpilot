from pathlib import Path
import json,hashlib,datetime
out=Path(__file__).parent;sp=Path('/mnt/e/skillpilot-chemie-L7-20261017/current439-HB-whole-primary-source-inventory-author-successor-v3/SELECTOR.clean-HB232-v3-six-row-fidelity-targeted-source-review.sealed.json');s=json.loads(sp.read_text());old=json.loads(Path(s['previousScientificView']['path']).read_text());cur=json.loads(Path(s['scientificView']['path']).read_text());fp=out/'FIRST.HB232-v3-six-row-informed-A.scientific-findings.sealed.json';raw=json.loads(fp.read_text());assert hashlib.sha256(fp.read_bytes()).hexdigest()=='a98def09e9c7dcb2a7dd37356ef586dd6556fb739c3e19e0902f78943b04e8e0'
pin=lambda p:{'path':str(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
valueDigest=lambda v:hashlib.sha256(json.dumps(v,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
def diff(a,b,path=''):
 if type(a)!=type(b):return [{'pointer':path,'old':a,'new':b}]
 if isinstance(a,dict):
  result=[]
  for k in sorted(set(a)|set(b)):
   if k not in a or k not in b:result.append({'pointer':path+'/'+k,'old':a.get(k),'new':b.get(k)})
   else:result.extend(diff(a[k],b[k],path+'/'+k))
  return result
 if isinstance(a,list):
  if len(a)!=len(b):return [{'pointer':path,'old':a,'new':b}]
  return [x for i,(aa,bb) in enumerate(zip(a,b)) for x in diff(aa,bb,path+'/'+str(i))]
 return [] if a==b else [{'pointer':path,'old':a,'new':b}]
assert len(old['sourceGoals'])==len(cur['sourceGoals'])==232;target=set(s['targetedSourceGoalIndices']);assert len(target)==6
unchanged=[];changed=[]
for i,(a,b) in enumerate(zip(old['sourceGoals'],cur['sourceGoals'])):
 assert a['id']==b['id']
 if i in target:
  paths=diff(a,b);assert paths and all(x['pointer'][1:] in {'title','description','sourceText','parentBulletText'} for x in paths);changed.append({'index':i,'candidateId':b['id'],'fields':paths,'unchangedNonTextFields':all(a.get(k)==b.get(k) for k in set(a)|set(b) if k not in {'title','description','sourceText','parentBulletText'})})
 else:
  assert a==b;unchanged.append({'index':i,'candidateId':b['id'],'exactValueEqual':True,'oldValueSha256':valueDigest(a),'currentValueSha256':valueDigest(b)})
assert len(unchanged)==226
assert [cur['sourceGoals'][i]['id'] for i in s['targetedSourceGoalIndices']]==s['targetedSourceGoalIds']
partners=[]
for k in sorted(set(old)|set(cur)):
 if k in {'sourceGoals','passages'}:continue
 assert old[k]==cur[k],k
 partners.append({'field':k,'exactValueEqual':True,'oldValueSha256':valueDigest(old[k]),'currentValueSha256':valueDigest(cur[k]),'itemCount':len(cur[k]) if isinstance(cur[k],(list,dict)) else None})
passages=[];assert len(old['passages'])==len(cur['passages'])==28
for a,b in zip(old['passages'],cur['passages']):
 assert a['id']==b['id'];ds=diff(a,b)
 if b['id'] in s['changedPassageIds']:assert len(ds)==1 and ds[0]['pointer']=='/text'
 else:assert a==b
 passages.append({'passageId':b['id'],'exactValueEqual':a==b,'changedFields':ds})
assert sum(not p['exactValueEqual'] for p in passages)==5
allDiff=diff(old,cur);assert len(allDiff)==28
assert all((x['pointer'].startswith('/sourceGoals/') or x['pointer'].startswith('/passages/')) for x in allDiff)
guards=[]
for k in ['scientificView','previousScientificView','actualPrimary','authorCandidateSourceBinding']:
 expected=s[k];actual=pin(Path(expected['path']));assert actual['sha256']==expected['sha256'] and actual['bytes']==expected['bytes'];guards.append({'input':k,**actual,'matchesFrozenInput':True})
assert pin(sp)['sha256']=='695e9180e2c233f63dd6cb5b1b6b5cc4a2b45b69018e26ce975c266f367c3d88'
priorFirst=Path('/mnt/e/skillpilot-chemie-L7-20261017/current439-HB-primary232-inventory-informed-independent-a-v1/FIRST.HB232-informed-A.scientific-findings.sealed.json');assert pin(priorFirst)['sha256']=='f6c4ee34c53dfa167e6107992c35ec6c2468cbd2332052cc6961e6f8e7c90035'
receipt={'role':'Post-FIRST exact-value scope and unchanged-input proof only; scientific acceptance is in frozen FIRST','atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scientificFIRST':pin(fp),'previousFIRSTUnchanged':pin(priorFirst),'unchanged226CompleteGoalBodies':unchanged,'changedSixGoalBodies':changed,'allOtherRootScientificFieldsUnchanged':partners,'all28PassagesComparison':passages,'fullExactDifferenceCount':28,'fullExactDifferences':allDiff,'inputGuards':guards,'noUnexpectedChanges':True,'noMainKSourceOrInputMutation':True,'noFullBuildOrGlobalCheck':True}
cp=out/'CHECK.exact226-plus-partners-and-inputs.json';cp.write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
records=[]
for x in raw['sixFindings']:
 records.append({'recordId':'chemie-HB232-v3-six-row-informed-independent-a-20261017-v1.'+x['candidateId'],'recordStatus':'candidate','reviewAuthority':'ai_candidate','evidenceLevel':'E1','maximumClaimScope':'G1','reviewMode':'informedFollowup','scientificFIRST':pin(fp),**x})
rp=out/'HB232-v3.six-targeted-source-A.candidate-records.jsonl';rp.write_text(''.join(json.dumps(x,ensure_ascii=False,separators=(',',':'))+'\n' for x in records))
sel={'role':'Sealed finite informed independent SOURCE A followup: six actual corrections accepted, bounded inactive HB232 source inventory accepted; all canonical mappings remain OPEN','atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'inputSelector':pin(sp),'scientificFIRST':pin(fp),'sixTargetedRecords':pin(rp),'exactUnchangedScopeProof':pin(cp),'targetedDecisions':{x['candidateId']:x['decision'] for x in records},'wholeInactiveInventoryDecision':'accepted_bounded_inactive_primary_inventory','wholeInactiveInventoryReason':'Own earlier positive whole inventory findings retained only because exact226 complete bodies and every other scientific partner set are unchanged; the6 changed bodies/5 companion passages were independently checked against actual original pages. The4 prior local wording findings are resolved.','exactComparisonSummary':{'unchangedOtherGoalBodies':226,'changedGoalBodies':6,'changedPassageTextFields':5,'unchangedOtherPassages':23,'all232Provenance':True,'all27Termsets':True,'all113OptionalSuggestions':True,'all40DerivedEntries':True,'all14OverlapRecords':True,'allScopeFrameworkMethodAndOtherRootScientificValues':True,'unexpectedDifferences':0,'totalChangedLeafValues':28},'uniqueDutyCount':'undetermined;232 locator/fragment records do not imply232 independent duties or232 minus14 unique duties','limits':raw['limits'],'reviewerAndExposure':raw['reviewer'],'previousFIRSTUnchanged':pin(priorFirst),'noPairedSynthesisOrOtherReviewerOutputRead':True,'allInputsUnchanged':True,'noSourceActivation':True}
p=out/'SELECTOR.HB232-v3-six-row-informed-independent-A.sealed.json';p.write_text(json.dumps(sel,ensure_ascii=False,indent=2)+'\n')
for f in [cp,rp,p]:f.chmod(0o444)
(out/'SELECTOR.HB232-v3-six-row-informed-independent-A.sealed.sha256').write_text(pin(p)['sha256']+'  '+p.name+'\n')
print(json.dumps({'selector':pin(p),'FIRST':pin(fp),'records':pin(rp),'checks':pin(cp),'summary':sel['exactComparisonSummary']},ensure_ascii=False,indent=2))
