import fs from 'node:fs';import crypto from 'node:crypto';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';
let input='';for await(const chunk of process.stdin)input+=chunk;const value=JSON.parse(input);
assert.equal(value.summary.status,'PASS');const hash=b=>'sha256:'+crypto.createHash('sha256').update(b).digest('hex');
const changes=[];let patch='*** Begin Patch\n';
for(const out of value.outputs){const before=fs.existsSync(out.file)?fs.readFileSync(out.file,'utf8'):null;assert.equal(before===null?null:hash(before),out.beforeSha256);
if(before===out.text)continue;
changes.push({file:out.file,beforeSha256:out.beforeSha256,afterSha256:hash(out.text)});
if(before===null){patch+='*** Add File: '+out.file+'\n'+out.text.trimEnd().split('\n').map(l=>'+'+l).join('\n')+'\n';continue;}
const diff=execFileSync('python3',['-B','-c','import json,sys,difflib; a,b=json.load(sys.stdin);sys.stdout.write("".join("@@\\n" if s.startswith("@@ ") else s for s in list(difflib.unified_diff(a.splitlines(True),b.splitlines(True),n=3))[2:]))'],{input:JSON.stringify([before,out.text]),encoding:'utf8',maxBuffer:5e6});
patch+='*** Update File: '+out.file+'\n'+diff;
}
patch+='*** End Patch';
console.log(JSON.stringify({patch,receipt:{schemaVersion:1,appliedBy:'/root',nativeCandidateChecks:value.summary.checks,leasedOperations:value.summary.leasedOperations,countDelta:value.summary.countDelta,newGoalIds:value.summary.newGoalIds,viewCount:value.summary.viewResults.length,viewErrors:value.summary.viewResults.reduce((n,v)=>n+v.preExistingErrors,0),changes,limitations:value.summary.limitations}}));
