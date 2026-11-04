// Exact proposed fields, actual application Markdown/math dependencies; local SSR.
import {createRequire}from'node:module';
import {readFile,writeFile}from'node:fs/promises';
import {fileURLToPath}from'node:url';
import path from'node:path';
import crypto from'node:crypto';
const H=path.dirname(fileURLToPath(import.meta.url)),R=path.resolve(H,'../../..');
const req=createRequire(path.join(R,'app/package.json'));
const {default:React}=await import(req.resolve('react'));
const {renderToStaticMarkup}=await import(req.resolve('react-dom/server'));
const {default:ReactMarkdown}=await import(req.resolve('react-markdown'));
const {default:remarkGfm}=await import(req.resolve('remark-gfm'));
const {default:remarkMath}=await import(req.resolve('remark-math'));
const {default:rehypeKatex}=await import(req.resolve('rehype-katex'));
const pack=JSON.parse(await readFile(path.join(H,'author-package.json'),'utf8'));
const rows=[];
for(const form of pack.forms){
 const id=form.goalId,goal=JSON.parse(await readFile(path.join(H,id,'proposed-whole-goal.draft.json'),'utf8'));
 const sections=[];
 for(const field of['taskContent','taskContentEn','solutionContent','solutionContentEn']){
  const source=goal.examData[field];
  const rendered=renderToStaticMarkup(React.createElement(ReactMarkdown,{remarkPlugins:[remarkGfm,remarkMath],rehypePlugins:[rehypeKatex],children:source}));
  const errors=[...rendered.matchAll(/class="katex-error"/g)].length,maths=[...rendered.matchAll(/class="katex"/g)].length;
  if(errors||!maths)throw new Error(`${id}/${field}: ${errors} errors, ${maths} formulas`);
  rows.push({goalId:id,field,sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),katexExpressions:maths,katexErrors:errors});
  sections.push(`<section><h2>${field}</h2>${rendered}</section>`);
 }
 await writeFile(path.join(H,id,'local-render-preview.html'),`<!doctype html><html lang="de"><meta charset="utf-8"><title>${goal.title}</title><link rel="stylesheet" href="../../../../app/node_modules/katex/dist/katex.min.css"><style>body{font:17px/1.55 system-ui;max-width:920px;margin:2rem auto;padding:0 1rem;color:#172033}section{border-top:2px solid #cad3e3;margin-top:3rem;padding-top:1rem}.katex-display{overflow-x:auto;padding:.5rem 0}table{border-collapse:collapse}td,th{border:1px solid #b7c1d0;padding:.5rem;vertical-align:top}</style><body><h1>${goal.title}</h1>${sections.join('\n')}</body></html>\n`);
}
const report={status:'PASS_LOCAL_CURRENT_DEPENDENCY_SSR_NOT_BROWSER_OR_HOST_ACCEPTANCE',fields:rows,fieldCount:rows.length,katexExpressionCount:rows.reduce((s,r)=>s+r.katexExpressions,0),katexErrorCount:0,rendererContract:'Actual ReactMarkdown + remarkGfm/remarkMath + rehypeKatex application dependencies'};
await writeFile(path.join(H,'author-rendering-check.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:'PASS',fields:rows.length,katexExpressions:report.katexExpressionCount,katexErrors:0}));
