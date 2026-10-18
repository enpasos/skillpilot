# SPDX-License-Identifier: Apache-2.0
"""Execute the requested unchanged publication commands in their fixed order."""
import datetime,hashlib,json,pathlib,re,subprocess,sys,time
R=pathlib.Path.cwd();O=pathlib.Path(__file__).resolve().parent.parent.relative_to(R)
expected={'build:goal-books':'tsx scripts/buildGoalBookPublications.ts','check:goal-book-publication':'tsx scripts/checkGoalBookPublication.ts','test:goal-book-original-sources':'tsx scripts/testGoalBookOriginalSources.ts && tsx src/utils/goalBookOriginalSources.test.ts'}
name=sys.argv[1];assert name in expected
def pin(p):
 p=pathlib.Path(p);b=p.read_bytes();return dict(path=p.as_posix(),sha256=hashlib.sha256(b).hexdigest(),bytes=len(b))
def write(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
names=list(expected);ix=names.index(name)
for prior in names[:ix]:
 rec=json.loads((O/f'RUN.{prior.replace(":","-")}.json').read_text());assert rec['exitCode']==0
package=pathlib.Path('app/package.json');script=json.loads(package.read_text())['scripts'][name];assert script==expected[name]
original=[package]+[pathlib.Path('app')/p for p in re.findall(r'\btsx\s+([^ &]+)',script)];before=[pin(p)for p in original]
if ix==0:
 index=pathlib.Path('app/public/lernzielbuch/index.json');d=json.loads(index.read_text());assert len(d['books'])==5
 observations=[]
 for b in d['books']:
  stem=b['bookId'];files=[pathlib.Path('app/public/lernzielbuch')/(stem+s)for s in ['.book-model.json','.original-sources.json','.pdf','.pdf.render-manifest.json']]
  observations.append(dict(bookId=stem,indexPageCount=b['pageCount'],generatedArtifactObservations=[pin(p)for p in files]))
 write(O/'OBSERVATION.five-generated-books-before.json',dict(role='HASH_OBSERVATIONS_OF_EXISTING_IGNORED_GENERATED_OUTPUTS_NOT_REVIEW_INPUTS',index=pin(index),books=observations))
stem=name.replace(':','-');log=O/f'{stem}.stdout-stderr.raw.txt';record=O/f'RUN.{stem}.json';assert not log.exists()and not record.exists()
cmd=['npm','--prefix','app','run',name];start=datetime.datetime.now(datetime.timezone.utc).isoformat();t=time.monotonic_ns()
with log.open('wb')as out:result=subprocess.run(cmd,cwd=R,stdout=out,stderr=subprocess.STDOUT,check=False)
elapsed=time.monotonic_ns()-t;end=datetime.datetime.now(datetime.timezone.utc).isoformat();after=[pin(p)for p in original]
write(record,dict(role='ACTUAL_ORIGINAL_PUBLICATION_COMMAND_EXECUTION',command=cmd,commandText=' '.join(cmd),packageScriptExact=script,scriptName=name,startUTC=start,endUTC=end,actualWallDurationNs=elapsed,actualWallDurationSeconds=elapsed/1e9,exitCode=result.returncode,rawCombinedStdoutStderr=pin(log),packageAndOriginalEntryFilesBefore=before,packageAndOriginalEntryFilesAfter=after,originalCodeUnchanged=before==after,extraArguments=[],force=False,subjectFilter=None,scientificOrNativeVotes=0,newM7OrCIPassClaim=False))
print(json.dumps(dict(record=pin(record),command=cmd,exitCode=result.returncode,actualWallDurationSeconds=elapsed/1e9,rawLog=pin(log)),indent=2));assert before==after;sys.exit(0 if result.returncode==0 else 1)
