// Exact draft fields through the application's actual Markdown/math dependencies.
import {createRequire}from'node:module';
import {readFile,writeFile}from'node:fs/promises';
import {fileURLToPath}from'node:url';
import path from'node:path';
import crypto from'node:crypto';
import assert from'node:assert/strict';
const H=path.dirname(fileURLToPath(import.meta.url)),R=path.resolve(H,'../../..'),req=createRequire(path.join(R,'app/package.json'));
const {default:React}=await import(req.resolve('react')),{renderToStaticMarkup}=await import(req.resolve('react-dom/server')),{default:ReactMarkdown}=await import(req.resolve('react-markdown')),{default:remarkGfm}=await import(req.resolve('remark-gfm')),{default:remarkMath}=await import(req.resolve('remark-math')),{default:rehypeKatex}=await import(req.resolve('rehype-katex'));
const pack=JSON.parse(await readFile(path.join(H,'author-package.json'),'utf8')),rows=[];
for(const form of pack.forms){
 const draft=JSON.parse(await readFile(path.join(H,form.goalId,'whole-form-content.draft.json'),'utf8')),sections=[];
 for(const field of['taskContent','taskContentEn','solutionContent','solutionContentEn']){
  const source=draft.examDataContent[field],rendered=renderToStaticMarkup(React.createElement(ReactMarkdown,{remarkPlugins:[remarkGfm,remarkMath],rehypePlugins:[rehypeKatex],children:source})),errors=[...rendered.matchAll(/class="katex-error"/g)].length,maths=[...rendered.matchAll(/class="katex"/g)].length;
  const images=[...rendered.matchAll(/<img /g)].length,solutionFigure=form.goalId==='8e18154d-41d6-592e-ba98-537edad338e8'&&field.startsWith('solution');
  assert.equal(errors,0,form.goalId+'/'+field);assert(maths>0);assert.equal(images,solutionFigure?1:0,'The marked reference figure belongs only to the unity solution, never to either task.');
  if(solutionFigure){const fig=JSON.parse(await readFile(path.join(H,'solution-figure-boundary.json'),'utf8'));assert(rendered.includes(`src="${fig.runtimeUrl}"`));assert.equal(crypto.createHash('sha256').update(await readFile(path.join(H,fig.sourcePng))).digest('hex'),fig.pngSha256);}
  if(field.startsWith('task'))assert(!source.includes('sixth-roots-solution-v1'));
  rows.push({goalId:form.goalId,field,sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),katexExpressions:maths,katexErrors:errors,markdownImages:images,solutionOnlyFigure:solutionFigure});sections.push(`<section><h2>${field}</h2>${rendered}</section>`);
 }
 await writeFile(path.join(H,form.goalId,'local-render-preview.html'),`<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${form.key}</title><link rel="stylesheet" href="../../../../app/node_modules/katex/dist/katex.min.css"><style>body{font:17px/1.55 system-ui;max-width:920px;margin:2rem auto;padding:0 1rem;color:#172033}section{border-top:2px solid #cad3e3;margin-top:3rem;padding-top:1rem}.katex-display{overflow-x:auto;padding:.5rem 0}table{border-collapse:collapse}td,th{border:1px solid #b7c1d0;padding:.5rem;vertical-align:top}</style><body>${sections.join('\n')}</body></html>\n`);
}
const report={status:'PASS_LOCAL_ACTUAL_DEPENDENCY_MARKDOWN_AND_KATEX_SSR_NOT_HOST_ACCEPTANCE',fields:rows,fieldCount:rows.length,katexExpressionCount:rows.reduce((n,r)=>n+r.katexExpressions,0),katexErrorCount:0,renderer:'Actual ReactMarkdown + remarkGfm + remarkMath + rehypeKatex',taskImagesRequired:false,markedUnityFigureInTask:false,markedUnityFigureOnlyInBothSolutions:true,geometryAction:'Pupil creates the unit-circle sketch; the complete marked reference figure is solution-only.',limits:'Local exact-field SSR and source asset hash/field checks; future static asset materialisation and host acceptance remain separate.'};
await writeFile(path.join(H,'author-rendering-check.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:'PASS_RENDERING',fields:rows.length,katexExpressions:report.katexExpressionCount,katexErrors:0}));
