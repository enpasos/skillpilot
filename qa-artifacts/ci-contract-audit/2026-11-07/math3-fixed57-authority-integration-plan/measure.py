import pathlib,json,hashlib,sys,datetime
sys.dont_write_bytecode=True
R=pathlib.Path('/home/enpasos/projects/skillpilot');W=pathlib.Path('/dev/shm/math3-fixed57-authority-plan-20261107');sys.path.insert(0,str(R/'scripts'));import visualization_review_git_capsule as k
sha=lambda p:hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
oldPath='contracts/goal-visualization-context/v1/qualified-context-index.json';capPath='qa-artifacts/ci-contract-audit/2026-11-07/visualization-qualified-context-index/capsule/capsule.json';newPath='qa-artifacts/ci-contract-audit/2026-11-07/math3-e4de-visualization-qualification/candidate-index.json';reads=pathlib.Path('/dev/shm/skillpilot-math3-e4de-v-sx8dghdk/native-three.stdout.json')
assert sha(R/oldPath)=='3421fa1a64b0c9ccac607bd283fabc3aeeb2391aec6cad0118f317d81c87742e';assert sha(R/capPath)=='e78eb4c6338340eead74d3de696da955b50cdca3f4f377160c3d9d87e3454c6b';assert sha(reads)=='d34a044ccccc3cfed71b78328c0c11f88eae5388d1f4911e325053f0c26e4900'
old=json.loads((R/oldPath).read_bytes());capsule=json.loads((R/capPath).read_bytes());new=json.loads((R/newPath).read_bytes());actual=json.loads(reads.read_bytes());anchor=new['acceptedRepositoryCommit'];assert anchor=='25a6f2164a81a7e6ae50db3557d20521fecf5124'
rows=list(old['rows']);rowkeys={(x['landscapeId'],x['goalId'])for x in rows};newrows=[]
for x in new['candidateReceipts']:
 assert sha(R/x['path'])==x['sha256'];receipt=json.loads((R/x['path']).read_bytes());row={'landscapeId':receipt['context']['landscapeId'],'goalId':receipt['context']['goalId'],'receipt':{'path':x['path'],'sha256':x['sha256']}};assert(row['landscapeId'],row['goalId'])not in rowkeys;newrows.append(row);rows.append(row)
refs={(x['gitCommit'],x['path']):dict(x)for x in old['originalReferences']}
for x in actual['originalReferences']:
 key=(x['gitCommit'],x['path']);previous=refs.get(key)
 if previous:assert previous['sha256']==x['sha256']
 refs[key]={**x,'currentCopyRequired':x['currentCopyRequired']or bool(previous and previous['currentCopyRequired'])}
merged={'schemaVersion':old['schemaVersion'],'kind':old['kind'],'acceptedRepositoryCommit':anchor,'rows':sorted(rows,key=lambda x:x['landscapeId']+':'+x['goalId']),'originalReferences':[refs[x]for x in sorted(refs)],'newReviewClaimed':False,'runtimeActivationAllowed':False}
raw=(json.dumps(merged,indent=2,ensure_ascii=False)+'\n').encode()
working={};working['PROSPECTIVE_NEW_INDEX']={'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw)}
for x in rows:
 p=x['receipt']['path'];d=x['receipt']['sha256'];assert sha(R/p)==d;working[p]={'sha256':d,'bytes':(R/p).stat().st_size}
for x in refs.values():
 if x['currentCopyRequired']:
  p=x['path'];assert sha(R/p)==x['sha256'];row={'sha256':x['sha256'],'bytes':(R/p).stat().st_size};assert p not in working or working[p]==row;working[p]=row
objects={x['oid']:x for x in capsule['objects']};oldobj=set(objects);payload={};newObjects=[]
def capture(oid,kind):
 if oid in payload:return payload[oid]
 content=k.git(R,'cat-file',kind,oid);assert k.oid(kind,content)==oid
 row={'oid':oid,'type':kind,'bytes':len(content),'sha256':hashlib.sha256(content).hexdigest()}
 if oid in objects:assert all(objects[oid][key]==v for key,v in row.items())
 else:objects[oid]=row;newObjects.append(row)
 payload[oid]=content;return content
commits=sorted({x['gitCommit']for x in refs.values()});assert all(k.git(R,'merge-base','--is-ancestor',c,anchor,check=False)==0 for c in commits)
oldest=[c for c in commits if all(k.git(R,'merge-base','--is-ancestor',c,o,check=False)==0 for o in commits)];assert len(oldest)==1
lines=k.git(R,'rev-list','--parents','--ancestry-path',oldest[0]+'..'+anchor).decode().splitlines();graph={line.split()[0]:line.split()[1:]for line in lines};boundaries=({p for ps in graph.values()for p in ps}-set(graph))|{oldest[0]};wanted=set(graph)|boundaries
oldCommits={x['oid']for x in capsule['objects']if x['type']=='commit'};assert oldCommits<=wanted
for c in sorted(wanted-oldCommits):capture(c,'commit')
# Each newly read original path is traversed by the unchanged actual inclusion kernel;
# pre-existing object lengths/hashes are required to match the accepted 54 capsule.
for x in actual['originalReferences']:k.inclusion(x,capture)
uniqueWorking=sum({x['sha256']:x['bytes']for x in working.values()}.values());objectBytes=sum(x['bytes']for x in objects.values());currentHashes={x['sha256']for x in working.values()};embedded=sum(x['bytes']for x in objects.values()if x['type']!='blob'or x['sha256']not in currentHashes)
# Authenticate the newly extended raw commit-parent graph rather than trusting only rev-list.
for c in sorted(wanted-oldCommits):
 content=capture(c,'commit');parents=[line[7:].decode()for line in content.split(b'\n\n',1)[0].splitlines()if line.startswith(b'parent ')]
 assert c in boundaries or all(p in wanted for p in parents)
result={'schemaVersion':1,'status':'read-only-finite-57-union-resource-measurement-not-generated-index-or-capsule','measuredAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'originalIndex':{'path':oldPath,'sha256':sha(R/oldPath)},'originalCapsule':{'path':capPath,'sha256':sha(R/capPath)},'newCandidateIndex':{'path':newPath,'sha256':sha(R/newPath)},'actualThreeReaderOutput':{'path':str(reads),'sha256':sha(reads)},'oldRows':54,'addedRows':newrows,'proposedRows':len(rows),'oldRowsUnchanged':all(x in rows for x in old['rows']),'oldOriginalReferences':224,'addedOriginalReferences':actual['originalReferences'],'proposedOriginalReferences':len(refs),'requiredOriginalCopies':sum(x['currentCopyRequired']for x in refs.values()),'uniqueWorkingPathsIncludingProspectiveIndex':len(working),'uniqueWorkingBytesIncludingProspectiveIndex':uniqueWorking,'prospectiveIndexSerializedBytes':len(raw),'maximumWorkingBytes':134217728,'workingHeadroomBytes':134217728-uniqueWorking,'originalObjectPayloadBytes':sum(x['bytes']for x in capsule['objects']),'proposedObjectPayloadBytes':objectBytes,'maximumObjectBytes':268435456,'objectHeadroomBytes':268435456-objectBytes,'proposedEmbeddedUncompressedBytes':embedded,'maximumEmbeddedUncompressedBytes':16777216,'embeddedHeadroomBytes':16777216-embedded,'oldObjects':len(oldobj),'addedObjects':len(newObjects),'proposedObjects':len(objects),'oldCommitObjects':len(oldCommits),'proposedCommitObjects':len(wanted),'newAncestryCommits':sorted(wanted-oldCommits),'actualOriginalReferenceCommits':commits,'acceptedRepositoryCommit':anchor,'shallowBoundaries':sorted(boundaries),'captureRawOidAndOriginalPathProofsChecked':len(payload),'reserveBytes':268435456,'requiredFreeBytesFromNativeFormula':uniqueWorking+objectBytes+268435456,'newObjects':newObjects,'fullHistoryFetch':False,'nativeCapsuleBuildOrMaterializeExecuted':False,'sourceIndexCapsuleQaWrites':False}
assert uniqueWorking<=134217728 and objectBytes<=268435456 and embedded<=16777216
(W/'measurement.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({k:v for k,v in result.items()if k not in ['newObjects','addedOriginalReferences','addedRows','newAncestryCommits']},indent=2))
