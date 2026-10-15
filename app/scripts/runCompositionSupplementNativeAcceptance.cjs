// Trusted bootstrap: plain CJS executes before any tsx/compiler code. Repository-only.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process'),os=require('node:os');
const root=path.resolve(__dirname,'../..'),hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a<b?-1:a>b?1:0).map(([k,x])=>[k,canonical(x)])):v;
const digest=v=>hash(JSON.stringify(canonical(v)));
if(process.argv.length!==2)throw new Error('No author-selected receipt/configuration/executable argument is accepted');
if(process.platform!=='linux')throw new Error('Native acceptance executable policy currently supports Linux ELF only');
const elf=file=>{const bytes=fs.readFileSync(file);if(bytes.length<4||!bytes.subarray(0,4).equals(Buffer.from([127,69,76,70])))throw new Error('Native executable must be supported ELF, not a shell/wrapper: '+file);return hash(bytes)};
const clean={};for(const name of ['PATH','HOME','TMPDIR','TMP','TEMP','LANG','LC_ALL','LANGUAGE'])if(process.env[name])clean[name]=process.env[name];
clean.TSX_DISABLE_CACHE='1';clean.NO_COLOR='1';
const preloader=path.resolve(root,'app/scripts/nativeAcceptanceReadTrace.cjs');
const worker=path.resolve(root,'app/scripts/generateCompositionSupplementNativeAcceptance.ts');
const tsx=path.resolve(root,'app/node_modules/tsx/dist/cli.mjs');
// These package exports are consulted by Node before the traced worker exists.
// Bind their exact metadata before the first resolution, not after execution.
const metadataPaths=['app/node_modules/tsx/package.json','app/node_modules/esbuild/package.json','app/node_modules/@esbuild/linux-'+process.arch+'/package.json'];
const metadataBefore=new Map(metadataPaths.map(file=>[file,hash(fs.readFileSync(path.resolve(root,file)))]));
const esbuild=require.resolve('@esbuild/linux-'+process.arch+'/bin/esbuild',{paths:[path.resolve(root,'app')]});
const executableInputs=[{role:'node',path:process.execPath,realPath:fs.realpathSync(process.execPath),sha256:elf(process.execPath)},
 {role:'esbuild',path:esbuild,realPath:fs.realpathSync(esbuild),sha256:elf(esbuild)}];
const fileIdentity=file=>{const stat=fs.statSync(file,{bigint:true});return [fs.realpathSync(file),stat.dev,stat.ino,stat.size,stat.mtimeNs,stat.ctimeNs].join(':')};
const executableIdentities=new Map(executableInputs.map(executable=>[executable.path,fileIdentity(executable.path)]));
const scratch=fs.mkdtempSync(path.resolve(os.tmpdir(),'skillpilot-native-executable-admission-')),trace=path.resolve(scratch,'reads.jsonl');fs.writeFileSync(trace,'');
const codePaths=['app/scripts/runCompositionSupplementNativeAcceptance.cjs','app/scripts/nativeAcceptanceReadTrace.cjs','app/scripts/generateCompositionSupplementNativeAcceptance.ts','app/scripts/reportDeepUnderstandingRollout.ts','app/package.json','app/package-lock.json'];
const codeBefore=new Map([...metadataBefore,...codePaths.map(file=>[file,hash(fs.readFileSync(path.resolve(root,file)))])]);
try{
 const environment={...clean,SKILLPILOT_NATIVE_ADMISSION_ACTIVE:'1',SKILLPILOT_NATIVE_TRACE_ROOT:root,SKILLPILOT_NATIVE_TRACE_FILE:trace,SKILLPILOT_NATIVE_EXECUTABLES:JSON.stringify(executableInputs),NODE_OPTIONS:'--require '+preloader};
 fs.appendFileSync(trace,JSON.stringify({kind:'executableLaunch',...executableInputs[0],args:['--require',preloader,tsx,worker,'--native-worker']})+'\n');
 const run=cp.spawnSync(process.execPath,['--require',preloader,tsx,worker,'--native-worker'],{cwd:root,encoding:'utf8',maxBuffer:100*1024*1024,env:environment});
 if(run.status!==0)throw new Error('Registered native executable/pipeline validation failed: '+String(run.stderr).slice(-8000));
 const body=JSON.parse(run.stdout.trim()),entries=new Map(),launches=[];
 for(const line of fs.readFileSync(trace,'utf8').trim().split('\n').filter(Boolean)){
  const row=JSON.parse(line);if(row.kind==='executableLaunch'){launches.push(row);continue;}
  const key=row.kind+':'+row.path,old=entries.get(key);if(old&&JSON.stringify(old)!==JSON.stringify(row))throw new Error('Native input changed during validation: '+row.path);entries.set(key,row);
 }
 for(const [file,before]of codeBefore){if(hash(fs.readFileSync(path.resolve(root,file)))!==before)throw new Error('Native producer code drift');entries.set('file:'+file,{path:file,kind:'file',sha256:before});}
 for(const executable of executableInputs){if(fileIdentity(executable.path)!==executableIdentities.get(executable.path)||fs.realpathSync(executable.path)!==executable.realPath||elf(executable.path)!==executable.sha256)throw new Error('Actually supported executable changed during native validation: '+executable.path);}
 if(!launches.some(l=>l.role==='esbuild')||!launches.some(l=>l.role==='node'))throw new Error('Actual Node/compiler launch closure not observed; caches are unsupported');
 for(const launch of launches){const input=executableInputs.find(e=>e.role===launch.role);if(!input||input.realPath!==launch.realPath||input.sha256!==launch.sha256)throw new Error('Unknown executable launch identity');}
 const sourceInputs=[...entries.values()].sort((a,b)=>String(a.path).localeCompare(String(b.path),'en')||String(a.kind).localeCompare(String(b.kind),'en'));
 for(const row of sourceInputs){const file=path.resolve(root,row.path);if(row.kind==='file'&&hash(fs.readFileSync(file))!==row.sha256)throw new Error('Native source drift: '+row.path);if(row.kind==='absent'&&fs.existsSync(file))throw new Error('Native absence drift: '+row.path);if(row.kind==='directory'&&JSON.stringify(fs.readdirSync(file).sort())!==JSON.stringify(row.entries))throw new Error('Native directory drift: '+row.path);}
 const receipt={...body,producerContract:'registered-gymnasium-native-acceptance-v2',receiptFormatVersion:'2.0',runtime:{nodeVersion:process.version,nodeExecutable:process.execPath,nodeExecutableSha256:executableInputs[0].sha256},executableInputs,executableLaunches:launches,sourceInputs};
 process.stdout.write(JSON.stringify({receipt,receiptSha256:digest(receipt)})+'\n');
}finally{fs.rmSync(scratch,{recursive:true,force:true});}
