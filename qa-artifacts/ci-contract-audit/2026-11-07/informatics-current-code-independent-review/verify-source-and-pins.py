from pathlib import Path
import json,gzip,hashlib,tarfile
R=Path('/home/enpasos/projects/skillpilot');D=Path(__file__).resolve().parent;P=D.parent/'informatics-e-reviewed-current-definition-candidate';W=Path('/dev/shm/informatics-e-reviewed-current-20261107');h=lambda b:hashlib.sha256(b).hexdigest()
frame=json.loads(gzip.decompress((P/'input-frame-code-pins-and-postguards.json.gz').read_bytes()));pins=frame['oldSource85AndReviewPins'];assert all(h((R/p['path']).read_bytes())==p['sha256'] for p in pins)
sourcepath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json'
with tarfile.open(D.parent/'informatics-current-e-authoring-candidate/candidate-overlay.tar.gz') as t:oldraw=t.extractfile(sourcepath).read()
newraw=(W/'candidate'/sourcepath).read_bytes();f4raw=gzip.decompress((P/'f4-e-released-source.json.gz').read_bytes())
assert h(oldraw)=='85ed339482b57f9ea19661df76acce4403ca5b7b9b9727261c1fffb1796dd48b';assert h(newraw)=='50a26163a1934216727ee178f8b0d2740c2476f62482ce32911fecbf890654e8';assert h(f4raw)=='f4a4575998460d819f34eec5bf906291b339a731740c64e35fa9a19ed5ae3e23'
old=json.loads(oldraw);new=json.loads(newraw);f4=json.loads(f4raw)
def differences(a,b,path=''):
 if type(a)!=type(b):return [path]
 if isinstance(a,dict):return [p for k in sorted(a.keys()|b.keys()) for p in ([path+'/'+k] if k not in a or k not in b else differences(a[k],b[k],path+'/'+k))]
 if isinstance(a,list):
  assert len(a)==len(b)
  return [p for i,(x,y) in enumerate(zip(a,b)) for p in differences(x,y,path+'/'+str(i))]
 return [] if a==b else [path]
delta=differences(old,new);assert len(delta)==14;assert all(p.endswith(('/examData/reviewNote','/examData/reviewStatus')) for p in delta)
assert len(differences(old,f4))==6;assert len(differences(f4,new))==8
changes=json.loads((P/'changed-files.json').read_bytes())['files'];assert all(row['afterSha256']==row['source85OverlayBeforeSha256'] for row in changes if row['path'].startswith('curricula/') and row['path']!=sourcepath)
code=(W/'candidate/app/scripts/lib/retainedAssessmentCoverage.ts').read_text();begin=code.index('const CONCRETE_BINDINGS: readonly ExactMeaningEvidence[] = ')+len('const CONCRETE_BINDINGS: readonly ExactMeaningEvidence[] = ');bindings,end=json.JSONDecoder().raw_decode(code[begin:]);assert len(bindings)==8
b=code.index('const CURRENT_INFO_REVISION = ')+len('const CURRENT_INFO_REVISION = ');rev,end=json.JSONDecoder().raw_decode(code[b:]);plan=json.loads((D.parent/'informatics-current-definition-revision-plan/proposed-revision.json').read_bytes());assert rev==plan
bindingPins={p['path']:p['sha256'] for bind in bindings for p in bind['evidencePins']};assert all(h((R/p).read_bytes())==s for p,s in bindingPins.items())
initial=(W/'candidate'/rev['initialSourceReference']['path']).read_bytes();assert h(initial)==rev['initialSourceReference']['sha256'];assert gzip.decompress(initial)==newraw
inventory=(W/'candidate'/rev['initialInventoryReference']['path']).read_bytes();assert h(inventory)==rev['initialInventoryReference']['sha256']
preexisting=json.loads(gzip.decompress((R/'contracts/curriculum-assessment-coverage/v1/informatics/historical-informatics-source.json.gz').read_bytes()))
oldids={g['id'] for g in preexisting['goals'] if g.get('examData')};newids={g['id'] for g in new['goals'] if g.get('examData')}
assert sorted(oldids&newids)==rev['survivingHistoricalGoalIds'];assert sorted(oldids-newids)==rev['retiredHistoricalGoalIds'];assert sorted(newids-oldids)==rev['introductionGoalIds'];assert sorted(newids)==rev['currentDefinitionGoalIds']
result={'status':'PASS','metadataDelta':delta,'source85ToF4ChangedFields':6,'f4To50ChangedFields':8,'allOtherCurriculumOverlayBytesRemainSource85':True,'reviewAndOldPackageFilesRechecked':len(pins),'codeRevisionExactlyMatchesSealedPlan':True,'initialArchiveExactlyContainsFinalSource':True,'codeOwnedFirstBindings':len(bindings),'evidenceFilesRechecked':bindingPins,'partition':{'survivors':len(oldids&newids),'retired':len(oldids-newids),'firsts':len(newids-oldids)},'declared':sum('coveredGoalIds' in g['examData'] for g in new['goals'] if g.get('examData')),'unknown':sum('coveredGoalIds' not in g['examData'] for g in new['goals'] if g.get('examData'))}
(D/'source-and-pins-results.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2))
