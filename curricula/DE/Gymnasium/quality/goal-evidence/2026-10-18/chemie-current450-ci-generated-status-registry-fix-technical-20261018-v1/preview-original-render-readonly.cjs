// SPDX-License-Identifier: Apache-2.0
const fs=require('node:fs'),path=require('node:path'),url=require('node:url'),Module=require('node:module'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const out='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-ci-generated-status-registry-fix-technical-20261018-v1/';
const generator='app/scripts/generateGeneratedStatusRegistry.ts',registry='app/scripts/generatedMarkdownNoticeRegistry.ts',output='docs/qa-ci/status/README.md';
const pin=p=>{const b=fs.readFileSync(p);return{path:p,sha256:crypto.createHash('sha256').update(b).digest('hex'),bytes:b.length}};
(async()=>{
 const inputs=[generator,registry,'app/scripts/memoryCardReviewConfigDiscovery.ts','app/package.json','curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json',output].map(pin);
 const source=fs.readFileSync(generator,'utf8'),main='const rendered = renderRegistry()';assert.equal(source.split(main).length,2);
 const executable=source.slice(0,source.indexOf(main))+'\nexport { renderRegistry, checkRegisteredArtifacts };\n',absolute=path.resolve(generator);
 const built=await require(path.resolve('app/node_modules/esbuild')).build({stdin:{contents:executable,sourcefile:absolute,resolveDir:path.dirname(absolute),loader:'ts'},bundle:true,packages:'external',platform:'node',format:'cjs',target:'node20',write:false,logLevel:'silent',define:{'import.meta.url':JSON.stringify(url.pathToFileURL(absolute).href)}});
 const probe=new Module(absolute,module);probe.filename=absolute;probe.paths=Module._nodeModulePaths(path.dirname(absolute));probe._compile(built.outputFiles[0].text,absolute);
 const failures=probe.exports.checkRegisteredArtifacts();assert.deepEqual(failures,[]);const rendered=probe.exports.renderRegistry();assert.notEqual(rendered,fs.readFileSync(output,'utf8'));
 for(const p of inputs)assert.deepEqual(pin(p.path),p,'Preview changed a normal input');
 fs.writeFileSync(out+'CANDIDATE.original-generator-render.README.md',rendered,{flag:'wx'});
 fs.writeFileSync(out+'PREVIEW.actual-original-render-and-input-pins.json',JSON.stringify({role:'READ_ONLY_ORIGINAL_RENDER_PREVIEW_BEFORE_AUTHORIZED_GENERATION',inputs,originalRenderingFunctionsUnmodified:true,originalGeneratorMainNotInvoked:true,registeredArtifactFailures:failures,renderedCandidate:pin(out+'CANDIDATE.original-generator-render.README.md'),normalWrites:0},null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({status:'PASS_PREVIEW_ONLY',registeredArtifactFailures:0,normalWrites:0,candidate:pin(out+'CANDIDATE.original-generator-render.README.md')},null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
