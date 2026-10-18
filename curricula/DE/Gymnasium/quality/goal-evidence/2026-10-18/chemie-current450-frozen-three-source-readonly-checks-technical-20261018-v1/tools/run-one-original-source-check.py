# SPDX-License-Identifier: Apache-2.0
"""Execute one of exactly three authorized original read-only npm scripts."""
import datetime, hashlib, json, pathlib, subprocess, sys, time
R=pathlib.Path.cwd();O=pathlib.Path(__file__).resolve().parent.parent.relative_to(R)
allowed=['check:source-landscape-registry','test:repository-source-availability','test:source-extraction-inventory']
name=sys.argv[1];assert name in allowed
def pin(p):
 p=pathlib.Path(p);b=p.read_bytes();return dict(path=p.as_posix(),sha256=hashlib.sha256(b).hexdigest(),bytes=len(b))
package=pathlib.Path('app/package.json');body=json.loads(package.read_text());implementation=body['scripts'][name]
expected={'check:source-landscape-registry':'tsx scripts/checkSourceLandscapeRegistry.ts','test:repository-source-availability':'tsx scripts/testRepositorySourceAvailability.ts','test:source-extraction-inventory':'tsx scripts/testSourceExtractionInventory.ts'}
assert implementation==expected[name]
source=pathlib.Path('app')/implementation.split()[1];before=[pin(package),pin(source)]
stem=name.replace(':','-');out=O/f'{stem}.stdout-stderr.raw.txt';receipt=O/f'RUN.{stem}.json';assert not out.exists() and not receipt.exists()
cmd=['npm','--prefix','app','run',name];start=datetime.datetime.now(datetime.timezone.utc).isoformat();mono=time.monotonic_ns()
with out.open('wb') as log:result=subprocess.run(cmd,cwd=R,stdout=log,stderr=subprocess.STDOUT,check=False)
duration=time.monotonic_ns()-mono;end=datetime.datetime.now(datetime.timezone.utc).isoformat();after=[pin(package),pin(source)];unchanged=before==after
record=dict(artifactRole='ACTUAL_ORIGINAL_READONLY_SOURCE_CHECK_EXECUTION',scriptName=name,command=cmd,commandText=' '.join(cmd),workingDirectory='repository-root',packageScriptExact=implementation,startUTC=start,endUTC=end,actualWallDurationNs=duration,actualWallDurationSeconds=duration/1e9,exitCode=result.returncode,processCompleted=True,packageAndEntryScriptBefore=before,packageAndEntryScriptAfter=after,packageAndEntryScriptUnchanged=unchanged,rawCombinedStdoutStderr=pin(out),scientificVotes=0,normalDataWritesByThisWrapper=0,buildOrCompilerOrOtherChecksInvokedByThisWrapper=0,overallM7OrCIPassClaim=False)
receipt.write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(dict(runRecord=pin(receipt),script=name,exitCode=result.returncode,actualWallDurationSeconds=record['actualWallDurationSeconds'],rawLog=pin(out),packageAndEntryScriptUnchanged=unchanged),indent=2))
assert unchanged
sys.exit(0 if result.returncode==0 else 1)
