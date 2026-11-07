import pathlib,json,hashlib,os
W=pathlib.Path('/dev/shm/informatics-q2-implementation-20261107');M=pathlib.Path('/dev/shm/informatics-material-candidate-20261107/native-examData.json');d=json.loads(M.read_text());print('format',type(d),list(d)[:5]);source=W/'candidate/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json';s=json.loads(source.read_text());by={x['id']:x for x in s['goals']};A=json.loads((W/'shared-author-input.json').read_text());changed=[]
for i,data in d.items():
 if i not in by:continue
 assert by[i]['examData']['coveredGoalIds']==data['coveredGoalIds'] or set(by[i]['examData']['coveredGoalIds'])==set(data['coveredGoalIds']),i
 by[i]['examData']=data;by[i].setdefault('extendedData',{})['materialAuthorStatus']='draft; independent review required';changed.append(i)
t=source.with_name(source.name+'.private-new');t.write_text(json.dumps(s,ensure_ascii=False,indent=2)+'\n');os.replace(t,source)
(W/'material-integration-pin.json').write_text(json.dumps({'path':str(M),'sha256':hashlib.sha256(M.read_bytes()).hexdigest(),'integratedExamIds':changed,'heldHEExamId':'f37f2d37-7686-5ed7-9c20-6f83d4fd2254','allDraft':all(x['reviewStatus']=='draft'for x in d.values())},indent=2)+'\n');print('integrated',changed)
