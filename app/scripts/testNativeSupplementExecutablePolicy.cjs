const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process');
const root=path.resolve(__dirname,'../..'),scratch=fs.mkdtempSync(path.resolve(os.tmpdir(),'TEST_ONLY-native-policy-')),trace=path.resolve(scratch,'trace.jsonl');fs.writeFileSync(trace,'');
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const compiler=require.resolve('@esbuild/linux-'+process.arch+'/bin/esbuild',{paths:[path.resolve(root,'app')]}),preloader=path.resolve(root,'app/scripts/nativeAcceptanceReadTrace.cjs');
const inputs=[{role:'node',path:process.execPath,realPath:fs.realpathSync(process.execPath),sha256:hash(process.execPath)},{role:'esbuild',path:compiler,realPath:fs.realpathSync(compiler),sha256:hash(compiler)}];
const environment={...process.env,SKILLPILOT_NATIVE_TRACE_ROOT:root,SKILLPILOT_NATIVE_TRACE_FILE:trace,SKILLPILOT_NATIVE_EXECUTABLES:JSON.stringify(inputs),NODE_OPTIONS:'--require '+preloader,TSX_DISABLE_CACHE:'1'};
const invoke=source=>cp.spawnSync(process.execPath,['--require',preloader,'-e',source],{cwd:root,env:environment,encoding:'utf8'});
try{
 for(const source of [
  "require('node:child_process').spawnSync('/bin/sh',['-c','exit 0'])",
  "require('node:child_process').spawnSync(process.execPath,['--eval','process.exit(0)'])",
  "require('node:child_process').spawnSync(process.execPath,['--require','"+preloader+"','/tmp/unapproved-code.js'])",
  "require('node:child_process').spawnSync('node',['ignored'])",
  "require('node:child_process').spawnSync(process.execPath,[],{cwd:'/tmp'})",
  "require('node:child_process').spawnSync(process.execPath,[],{uid:0})",
  "require('node:child_process').execSync('true')",
  "require('node:child_process').fork('/tmp/unapproved-code.js')",
  "new(require('node:child_process').ChildProcess)().spawn({file:'/bin/sh',args:['/bin/sh','-c','true'],envPairs:[]})",
  "require('node:child_process').spawnSync('"+compiler+"',['--version'])",
 ]){const run=invoke(source);assert.notEqual(run.status,0);assert.match(run.stderr,/Unsupported|Unexpected|Unbound|ENOENT/);}
 const wrapper=path.resolve(scratch,'TEST_ONLY_wrapper');fs.writeFileSync(wrapper,'#!/bin/sh\nexit 0\n');fs.chmodSync(wrapper,0o755);
 const forged=[inputs[0],{...inputs[1],path:wrapper,realPath:wrapper,sha256:hash(wrapper)}];
 const run=cp.spawnSync(process.execPath,['--require',preloader,'-e',"require('node:child_process').spawnSync('"+wrapper+"',['--service=0.27.2'])"],{cwd:root,env:{...environment,SKILLPILOT_NATIVE_EXECUTABLES:JSON.stringify(forged)},encoding:'utf8'});assert.notEqual(run.status,0);assert.match(run.stderr,/Unexpected\/stale/);
 const cli=cp.spawnSync(process.execPath,[path.resolve(root,'app/scripts/runCompositionSupplementNativeAcceptance.cjs'),'--receipt=/tmp/untrusted'],{cwd:root,encoding:'utf8'});assert.notEqual(cli.status,0);assert.match(cli.stderr,/No author-selected/);
 console.log('Native executable policy:12 negative production-hook probes passed; no native acceptance mocked');
}finally{fs.rmSync(scratch,{recursive:true,force:true});}
