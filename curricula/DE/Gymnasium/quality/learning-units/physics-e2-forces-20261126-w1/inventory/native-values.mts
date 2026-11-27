// SPDX-License-Identifier: Apache-2.0
// Verify parsed source/value path bindings with the repository's own serializer.
import { readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';
const [repoArg, tableArg, rootsArg] = process.argv.slice(2);
const repo=resolve(repoArg),roots={repo,...JSON.parse(rootsArg??'{}')};
const {stableGoalBookJson,parseAndValidateGoalBookModel}=await import(pathToFileURL(join(repo,'app/scripts/goalBookModel.ts')).href);
const hash=(x: string|Buffer)=>createHash('sha256').update(x).digest('hex');
const rows=readFileSync(resolve(tableArg),'utf8').split(/\r?\n/).filter(Boolean).map(s=>JSON.parse(s));
const cache=new Map<string,Buffer>();
function bytes(o:any):Buffer{
 const key=JSON.stringify(o);if(cache.has(key))return cache.get(key)!;
 let b:Buffer;
 if(o.archiveOrigin)b=execFileSync('python3',['-c','import sys,tarfile,io;t=tarfile.open(fileobj=io.BytesIO(sys.stdin.buffer.read()),mode="r:gz");sys.stdout.buffer.write(t.extractfile(sys.argv[1]).read())',o.declaredOriginalPath],{input:bytes(o.archiveOrigin),maxBuffer:64*1024*1024});
 else if(o.kind==='historical_git_raw')b=execFileSync('git',o.gitStore==='verified_local_bundle'?['--git-dir='+roots._historicalGit,'show',o.commit+':'+o.path]:['show',o.commit+':'+o.path],{cwd:repo,maxBuffer:64*1024*1024});
 else if(o.encoding==='gzip-json'||o.encoding==='gzip-raw')b=gunzipSync(readFileSync(join(roots[o.root],o.containerPath)));
 else if(o.containerPath)b=execFileSync('python3',['-c','import sys,tarfile; t=tarfile.open(sys.argv[1],"r:gz");sys.stdout.buffer.write(t.extractfile(sys.argv[2]).read())',join(roots[o.root],o.containerPath),o.declaredOriginalPath],{maxBuffer:64*1024*1024});
 else b=readFileSync(join(roots[o.root],o.path));
 if(hash(b)!==o.sha256)throw Error('Raw origin differs from inventoried bytes');cache.set(key,b);return b;
}
let parsed=0,models=0;
for(const b of rows){
 if(!['parsed_json_value_path_binding','recovered_parsed_json_value_binding'].includes(b.contract))continue;
 const raw=bytes(b.origin),p=b.origin.declaredOriginalPath??b.origin.path;
 const v=p.endsWith('.jsonl')?raw.toString().split(/\r?\n/).filter(Boolean).map(s=>JSON.parse(s)):JSON.parse(raw.toString());
 if(hash(stableGoalBookJson(v))===b.sha256){parsed++;continue;}
 if(v?.digest?.replace(/^sha256:/,'')===b.sha256){parseAndValidateGoalBookModel(v);const{digest,...payload}=v;if(hash(stableGoalBookJson(payload))!==b.sha256)throw Error('Native book payload differs');models++;continue;}
 let verified=false;
 for(const field of ['resolutionFingerprint','manifestFingerprint'])if(v?.[field]?.replace(/^sha256:/,'')===b.sha256){const{[field]:discard,...payload}=v;if(hash(stableGoalBookJson(payload))===b.sha256){parsed++;verified=true;break;}}
 if(!verified)throw Error('Unverified native value binding');
}
console.log(JSON.stringify({contract:'W1-native-parsed-source-value-binding-verification-v1',status:'PASS',parsedJsonBindings:parsed,sealedBookModelBindings:models,nativeSerializer:'stableGoalBookJson',sourceRawBytesVerified:true,scientificApprovalGranted:false}));
