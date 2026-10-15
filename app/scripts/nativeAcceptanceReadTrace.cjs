// Fixed native producer preload. Traces bytes actually read by this process and
// its inherited native-validator subprocesses. Never an author-supplied report.
const fs=require('node:fs'), path=require('node:path'), crypto=require('node:crypto');
const {fileURLToPath}=require('node:url');
const root=process.env.SKILLPILOT_NATIVE_TRACE_ROOT, destination=process.env.SKILLPILOT_NATIVE_TRACE_FILE;
if(!root||!destination)throw new Error('Native trace requires private producer context');
const original={readFileSync:fs.readFileSync,appendFileSync:fs.appendFileSync,statSync:fs.statSync,readdirSync:fs.readdirSync,existsSync:fs.existsSync};
// Resolve only declared repository layout aliases; trace consumed dependency code,
// never recursively inventory a cache or trust an author-controlled extra root.
const declaredAliases=[['app/node_modules','app/node_modules'],['curricula','curricula'],['docs','docs'],['scripts','scripts'],['ai','ai'],['content','content']];
// Resolve direct installed package links (and one scoped-package level). This
// supports detached/linked dependencies without recursively reading any cache.
const aliasDirectoryReads=[];
const moduleRoot=path.resolve(root,'app/node_modules');
const packageNames=original.readdirSync(moduleRoot);aliasDirectoryReads.push([moduleRoot,packageNames]);
for(const name of packageNames){
 const logical='app/node_modules/'+name;declaredAliases.push([logical,logical]);
 if(name.startsWith('@')){const scope=path.resolve(moduleRoot,name);try{
  const names=original.readdirSync(scope);aliasDirectoryReads.push([scope,names]);
  for(const child of names)declaredAliases.push([logical+'/'+child,logical+'/'+child]);
 }catch(error){if(error.code!=='ENOTDIR'&&error.code!=='ENOENT')throw error;}}
}
const aliases=declaredAliases
  .map(([actual,logical])=>{try{return [fs.realpathSync(path.resolve(root,actual)),logical];}catch{return null;}}).filter(Boolean).sort((a,b)=>b[0].length-a[0].length);
const normalized=(input)=>{try{
  const absolute=path.resolve(input instanceof URL?fileURLToPath(input):String(input));if(absolute===destination)return null;
  let relative=path.relative(root,absolute);
  if(relative.startsWith('..')||path.isAbsolute(relative)){
    const alias=aliases.find(([real])=>absolute===real||absolute.startsWith(real+path.sep));
    if(!alias)return null;relative=path.join(alias[1],path.relative(alias[0],absolute));
  }
  return relative&&!relative.split(path.sep).includes('.git')?{absolute,relative:relative.split(path.sep).join('/')}:null;
}catch{return null;}};
const recordRaw=(input,kind,data)=>{const p=normalized(input);if(!p)return;let value={path:p.relative,kind};if(kind==='file')value.sha256=crypto.createHash('sha256').update(Buffer.isBuffer(data)?data:Buffer.from(data,'utf8')).digest('hex');if(kind==='directory')value.entries=data.map(v=>typeof v==='string'?v:v.name).sort();original.appendFileSync(destination,JSON.stringify(value)+'\n');};
// Node reads package metadata through internal fs bindings. Public read hooks alone
// cannot observe it. Bind package scopes/absences and resolution directories only
// along actually consumed app code/executable paths; never recursively inventory npm.
const metadataBound=new Set();
const bindResolutionContext=input=>{const p=normalized(input);if(!p||!p.relative.startsWith('app/'))return;
 let directory=path.posix.dirname(p.relative);
 while(directory==='app'||directory.startsWith('app/')){
  for(const [relative,kind]of [[directory+'/package.json','file'],[directory+'/node_modules','directory']]){
   if(metadataBound.has(relative))continue;metadataBound.add(relative);const actual=path.resolve(root,relative);
   if(!original.existsSync(actual))recordRaw(actual,'absent');
   else if(kind==='file'){if(!original.statSync(actual).isFile())throw new Error('Unsupported package metadata path: '+relative);recordRaw(actual,'file',original.readFileSync(actual));}
   else{if(!original.statSync(actual).isDirectory())throw new Error('Unsupported package resolution directory: '+relative);recordRaw(actual,'directory',original.readdirSync(actual));}
  }
  directory=path.posix.dirname(directory);
 }
};
const record=(input,kind,data)=>{recordRaw(input,kind,data);if(kind==='file')bindResolutionContext(input);};
for(const [directory,entries]of aliasDirectoryReads)record(directory,'directory',entries);
fs.readFileSync=function(input,...args){const result=original.readFileSync.call(this,input,...args);record(input,'file',result);return result;};
const callbackRead=fs.readFile;fs.readFile=function(input,...args){const callback=args.pop();return callbackRead.call(this,input,...args,(error,data)=>{if(!error)record(input,'file',data);callback(error,data);});};
const promiseRead=fs.promises.readFile.bind(fs.promises);fs.promises.readFile=async function(input,...args){const data=await promiseRead(input,...args);record(input,'file',data);return data;};
fs.readdirSync=function(input,...args){const data=original.readdirSync.call(this,input,...args);record(input,'directory',data);return data;};
const promiseDir=fs.promises.readdir.bind(fs.promises);fs.promises.readdir=async function(input,...args){const data=await promiseDir(input,...args);record(input,'directory',data);return data;};
fs.existsSync=function(input){const result=original.existsSync.call(this,input);if(!result)record(input,'absent');return result;};

// Bounded trusted-host policy: only this exact Node interpreter and the resolved
// installed esbuild ELF service. This is not kernel tracing or an arbitrary-code sandbox.
const cp=require('node:child_process');
const admitted=JSON.parse(process.env.SKILLPILOT_NATIVE_EXECUTABLES||'null');
if(!Array.isArray(admitted)||admitted.length!==2)throw new Error('Missing private executable admission context');
const byteHash=input=>crypto.createHash('sha256').update(original.readFileSync(input)).digest('hex');
const same=(input,expected)=>{const bytes=original.readFileSync(input);return bytes.length>=4&&bytes.subarray(0,4).equals(Buffer.from([127,69,76,70]))&&fs.realpathSync(input)===expected.realPath&&crypto.createHash('sha256').update(bytes).digest('hex')===expected.sha256;};
const node=admitted.find(e=>e.role==='node'),compiler=admitted.find(e=>e.role==='esbuild');
if(!node||!compiler||!same(process.execPath,node))throw new Error('Unaccepted Node executable');
const preload=path.resolve(root,'app/scripts/nativeAcceptanceReadTrace.cjs');
const expectedLoader='--require '+preload;
const cleanChildEnvironment=(provided)=>{
 const result={};for(const name of ['PATH','HOME','TMPDIR','TMP','TEMP','LANG','LC_ALL','LANGUAGE'])if(provided?.[name])result[name]=provided[name];
 return {...result,SKILLPILOT_NATIVE_ADMISSION_ACTIVE:'1',NO_COLOR:'1',TSX_DISABLE_CACHE:'1',NODE_OPTIONS:expectedLoader,SKILLPILOT_NATIVE_TRACE_ROOT:root,SKILLPILOT_NATIVE_TRACE_FILE:destination,SKILLPILOT_NATIVE_EXECUTABLES:JSON.stringify(admitted)};
};
const bindCode=input=>{let file=input;if(file.startsWith('file:'))file=fileURLToPath(file);const normalizedFile=normalized(file);if(!normalizedFile||!original.existsSync(file)||!original.statSync(file).isFile())throw new Error('Unbound Node script/loader: '+input);record(file,'file',original.readFileSync(file));};
const authorize=(command,args,options={})=>{
 const workingDirectory=options.cwd??process.cwd();
 if(typeof workingDirectory!=='string'||fs.realpathSync(path.resolve(workingDirectory))!==fs.realpathSync(root))throw new Error('Unsupported native child working directory');
 if(options.uid!==undefined||options.gid!==undefined||options.argv0!==undefined)throw new Error('Unsupported native child identity/argv0 override');
 if(typeof command!=='string'||!path.isAbsolute(command)||options.shell||options.detached)throw new Error('Unsupported native child command/shell/detached launch');
 const real=fs.realpathSync(command),entry=admitted.find(e=>e.realPath===real);
 if(!entry||!same(command,entry))throw new Error('Unexpected/stale native child executable: '+command);
 if(!Array.isArray(args)||args.some(a=>typeof a!=='string'))throw new Error('Unsupported native child arguments');
 if(entry.role==='esbuild'){
  if(!args.length||!/^--service=\d+\.\d+\.\d+$/.test(args[0])||args.slice(1).some(a=>a!=='--ping'))throw new Error('Unsupported esbuild arguments');
 }else{
  const tsxRoot=path.dirname(require.resolve('tsx/package.json',{paths:[path.resolve(root,'app')]}));
  const exact=(input,expected)=>{if(input?.startsWith('file:'))input=fileURLToPath(input);return typeof input==='string'&&path.isAbsolute(input)&&fs.realpathSync(input)===fs.realpathSync(expected);};
  let target,rest;
  if(exact(args[0],path.resolve(tsxRoot,'dist/cli.mjs'))){bindCode(args[0]);target=args[1];rest=args.slice(2);}
  else{
   if(args[0]!=='--require'||!exact(args[1],path.resolve(tsxRoot,'dist/preflight.cjs'))||args[2]!=='--import'||!exact(args[3],path.resolve(tsxRoot,'dist/loader.mjs')))throw new Error('Unsupported Node executable/loader option or script shape');
   bindCode(args[1]);bindCode(args[3]);target=args[4];rest=args.slice(5);
  }
  const allowed=['generateCompositionSupplementNativeAcceptance.ts','semanticAtomicityReview.ts','memoryCardReview.ts','generateGoalVisualizationQaLedgers.ts'];
  const script=allowed.find(name=>exact(target,path.resolve(root,'app/scripts',name)));
  if(!script)throw new Error('Unsupported native Node script/code-loader target');bindCode(target);
  if(script==='generateCompositionSupplementNativeAcceptance.ts'){
   if(rest.length!==1||rest[0]!=='--native-worker')throw new Error('Unsupported native worker arguments');
  }else if(script==='generateGoalVisualizationQaLedgers.ts'){
   if(rest.length!==2||rest[0]!=='--check'||!['--subject=mathematik','--subject=physik'].includes(rest[1]))throw new Error('Unsupported native visualization check arguments');
  }else{
   if(rest.length!==2||rest[1]!=='--mode=check'||!/^--config=curricula\/DE\/Gymnasium\/quality\/.+\.json$/.test(rest[0])||rest[0].split('/').includes('..'))throw new Error('Unsupported native review check arguments');
  }
 }

 original.appendFileSync(destination,JSON.stringify({kind:'executableLaunch',role:entry.role,path:command,realPath:entry.realPath,sha256:entry.sha256,args})+'\n');
 record(command,'file',original.readFileSync(command));
 return {...options,env:cleanChildEnvironment(options.env??process.env)};
};
const spawn=cp.spawn;cp.spawn=function(command,args,options){if(!Array.isArray(args)){options=args;args=[];}return spawn.call(this,command,args,authorize(command,args,options));};
const spawnSync=cp.spawnSync;cp.spawnSync=function(command,args,options){if(!Array.isArray(args)){options=args;args=[];}return spawnSync.call(this,command,args,authorize(command,args,options));};
const execFile=cp.execFile;cp.execFile=function(command,args,options,callback){if(!Array.isArray(args))throw new Error('Native execFile requires explicit args');if(typeof options==='function'){callback=options;options={};}return execFile.call(this,command,args,authorize(command,args,options),callback);};
const execFileSync=cp.execFileSync;cp.execFileSync=function(command,args,options){if(!Array.isArray(args))throw new Error('Native execFileSync requires explicit args');return execFileSync.call(this,command,args,authorize(command,args,options));};
for(const name of ['exec','execSync','fork'])cp[name]=function(){throw new Error('Unsupported native shell/fork launch: '+name);};
// Catch direct ChildProcess launches too; Node's normalized args include argv0.
const internalSpawn=cp.ChildProcess.prototype.spawn;cp.ChildProcess.prototype.spawn=function(options){
 if(!options||!Array.isArray(options.args)||options.args[0]!==options.file)throw new Error('Unsupported native child normalized argv0 override');
 if(!Array.isArray(options.envPairs))throw new Error('Native child requires complete sanitized environment');
 const expected=cleanChildEnvironment({}),optional=new Set(['PATH','HOME','TMPDIR','TMP','TEMP','LANG','LC_ALL','LANGUAGE']),pairs=new Map();
 for(const value of options.envPairs){
  if(typeof value!=='string'||value.includes('\0'))throw new Error('Unsupported native child environment value');
  const index=value.indexOf('=');if(index<=0)throw new Error('Unsupported native child environment pair');
  const name=value.slice(0,index),content=value.slice(index+1);
  if(pairs.has(name)||(!Object.hasOwn(expected,name)&&!optional.has(name)))throw new Error('Unsupported/duplicate native child environment key: '+name);
  pairs.set(name,content);
 }
 for(const [name,value]of Object.entries(expected))if(pairs.get(name)!==value)throw new Error('Unsupported native child sanitized context: '+name);
 const args=options.args.slice(1);authorize(options.file,args,options);
 // Authorize these exact normalized options. Never validate a reduced copy and
 // then launch the original cwd/identity/argv0/environment unchecked.
 return internalSpawn.call(this,options);
};
require('node:module').syncBuiltinESMExports();
