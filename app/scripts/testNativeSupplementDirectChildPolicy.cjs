// Test-only direct launch regressions. No native acceptance or receipt is mocked.
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process');
const root=path.resolve(process.argv[2]||path.resolve(__dirname,'../..')),scratch=fs.mkdtempSync(path.resolve(os.tmpdir(),'TEST_ONLY-direct-child-policy-')),trace=path.resolve(scratch,'trace.jsonl');fs.writeFileSync(trace,'');
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const compiler=require.resolve('@esbuild/linux-'+process.arch+'/bin/esbuild',{paths:[path.resolve(root,'app')]}),preloader=path.resolve(root,'app/scripts/nativeAcceptanceReadTrace.cjs');
const inputs=[{role:'node',path:process.execPath,realPath:fs.realpathSync(process.execPath),sha256:hash(process.execPath)},{role:'esbuild',path:compiler,realPath:fs.realpathSync(compiler),sha256:hash(compiler)}];
const environment={PATH:process.env.PATH,HOME:process.env.HOME,SKILLPILOT_NATIVE_ADMISSION_ACTIVE:'1',NO_COLOR:'1',SKILLPILOT_NATIVE_TRACE_ROOT:root,SKILLPILOT_NATIVE_TRACE_FILE:trace,SKILLPILOT_NATIVE_EXECUTABLES:JSON.stringify(inputs),NODE_OPTIONS:'--require '+preloader,TSX_DISABLE_CACHE:'1'};
const invoke=source=>cp.spawnSync(process.execPath,['--require',preloader,'-e',source],{cwd:root,env:environment,encoding:'utf8'});
const direct=(extra={},pairs="Object.entries(process.env).map(([key,value])=>key+'='+value)")=>`
 const cp=require('node:child_process'),child=new cp.ChildProcess();
 child.on('error',error=>{console.error(error);process.exitCode=2});
 child.on('exit',code=>{console.log('childExit='+code);process.exitCode=code});
 child.spawn({...${JSON.stringify({file:compiler,args:[compiler,'--service=0.27.2','--ping'],cwd:root,stdio:['pipe','pipe','pipe']})},...${JSON.stringify(extra)},envPairs:${pairs}});
 child.stdout?.resume();child.stderr?.resume();child.stdin?.end();`;
try{
 const positive=invoke(direct());assert.equal(positive.status,0,positive.stderr);assert.match(positive.stdout,/childExit=0/);
 const cases=[
  ['cwd',direct({cwd:os.tmpdir()})],['inherited-cwd',"process.chdir("+JSON.stringify(os.tmpdir())+");"+direct({cwd:null})],['uid',direct({uid:0})],['gid',direct({gid:0})],
  ['argv0',direct({args:['TEST_ONLY_custom_argv0','--service=0.27.2','--ping']})],
  ['detached',direct({detached:true})],['shell',direct({shell:true})],
  ...['LD_PRELOAD','TSX_TSCONFIG_PATH','NODE_PATH','ESBUILD_BINARY_PATH','NODE_V8_COVERAGE'].map(name=>[name,direct({},"Object.entries({...process.env,"+JSON.stringify(name)+":'/TEST_ONLY/unapproved'}).map(([key,value])=>key+'='+value)")]),
  ['duplicate-env',direct({},"[...Object.entries(process.env).map(([key,value])=>key+'='+value),'PATH=/TEST_ONLY/duplicate']")],
  ['private-context',direct({},"Object.entries({...process.env,SKILLPILOT_NATIVE_TRACE_FILE:'/TEST_ONLY/other-trace'}).map(([key,value])=>key+'='+value)")],
  ['missing-private',direct({},"Object.entries(process.env).filter(([key])=>key!=='SKILLPILOT_NATIVE_ADMISSION_ACTIVE').map(([key,value])=>key+'='+value)")],
 ];
 let failed=0;
 for(const [name,source]of cases){const run=invoke(source);try{assert.notEqual(run.status,0,'permitted compiler bypass '+name);assert.match(run.stderr,/Unsupported|Unexpected|Unbound|sanitized/);console.log('PASS direct policy rejects '+name);}catch(error){failed++;console.error('FAIL '+name+': '+error.message+'; stdout='+run.stdout+'; stderr='+run.stderr);}}
 const publicPositive=invoke("const run=require('node:child_process').spawnSync("+JSON.stringify(compiler)+",['--service=0.27.2','--ping'],{env:{...process.env,LD_PRELOAD:'/TEST_ONLY/hostile',TSX_TSCONFIG_PATH:'/TEST_ONLY/hostile'},encoding:'utf8'});if(run.status!==0)throw new Error(run.stderr)");
 assert.equal(publicPositive.status,0,publicPositive.stderr);console.log('PASS public spawn sanitizes hostile compiler/loader environment');
 const rows=fs.readFileSync(trace,'utf8').trim().split('\n').filter(Boolean).map(line=>JSON.parse(line));
 assert(rows.some(row=>row.kind==='file'&&row.path==='app/node_modules/@esbuild/linux-'+process.arch+'/package.json'),'platform package metadata must be read-bound');
 assert(rows.some(row=>row.kind==='absent'&&row.path==='app/node_modules/@esbuild/linux-'+process.arch+'/bin/package.json'),'nearer absent package scope must be bound');
 console.log('PASS actual compiler package metadata and nearer scope absence are bound');
 assert.equal(failed,0,'direct launch regression(s) failed');console.log('Direct native policy:15 negative,2 positive launches and package-scope evidence passed');
}finally{fs.rmSync(scratch,{recursive:true,force:true});}
