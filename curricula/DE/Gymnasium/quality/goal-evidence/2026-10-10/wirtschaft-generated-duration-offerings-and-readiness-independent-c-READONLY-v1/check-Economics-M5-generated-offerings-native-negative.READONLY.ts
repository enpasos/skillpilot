import fs from 'node:fs';
import {createHash} from 'node:crypto';
import Module from 'node:module';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {transformSync} from '/home/enpasos/projects/skillpilot/app/node_modules/esbuild/lib/main.js';
const repo='/home/enpasos/projects/skillpilot';const src=repo+'/app/scripts/generateGymnasiumDurationOfferings.ts';const status=repo+'/docs/qa-ci/status/curriculum-quality-status.json';const economics='605bdaf6-32d5-56fd-8d92-5a80c2fd2901';const read=fs.readFileSync;const actual=JSON.parse(read(status,'utf8'));const negative=structuredClone(actual);const econ=negative.curricula.find((c:any)=>c.landscapeId===economics);if(econ.maturity!=='M6')throw new Error('expected currentM6');econ.maturity='M5';const overlay=JSON.stringify(negative);const origWrite=process.stdout.write;const oldargv=process.argv;let collected='';
try{
 (fs as any).readFileSync=(p:any,...args:any[])=>String(p)===status?(args[0]?overlay:Buffer.from(overlay)):(read as any)(p,...args);
 process.argv=['node','in-memory-readonly-native-duration-negative'];
 (process.stdout as any).write=(s:any)=>{collected+=String(s);return true};
 const compiled=transformSync(read(src,'utf8'),{loader:'ts',format:'cjs',target:'node22',define:{'import.meta.url':JSON.stringify(pathToFileURL(src).href)}}).code;
 const m:any=new (Module as any)(src);m.filename=src;m.paths=(Module as any)._nodeModulePaths(repo+'/app/scripts');m._compile(compiled,src);
}finally{(fs as any).readFileSync=read;(process.stdout as any).write=origWrite;process.argv=oldargv;}
const head=execFileSync('git',['show','afaf584cd29003d4ce0e9e30d24d6bec1b81bbfd:app/src/generated/gymnasiumDurationOfferings.ts'],{cwd:repo,encoding:'utf8'});
if(collected!==head)throw new Error('M5 must remove only Economics and restore entire actual HEAD generated file');
const output={status:'PASS_nativeM5negative_removesOnlyEconomics_restoresWholeHEAD_foreignExact',method:'Actual unmodified generator bytes esbuild to virtual original-path module; only in-memory Economics maturity M6 to M5 overlay; main executes read-only default stdout, never --write; generated full output captured in memory.',generatorSha256:createHash('sha256').update(read(src)).digest('hex'),actualStatusSha256:createHash('sha256').update(read(status)).digest('hex'),headCommit:'afaf584cd29003d4ce0e9e30d24d6bec1b81bbfd',negativeGeneratedSha256:createHash('sha256').update(collected).digest('hex'),beforeMaturity:'M6',negativeMaturity:'M5',exactWholeHEADRestored:true,allForeignOfferingFieldsAndScaffoldingExact:true,activeWrites:0,compilerOrQualityWaivers:0,newSourceReviewClaim:false};
console.log(JSON.stringify(output,null,2));
