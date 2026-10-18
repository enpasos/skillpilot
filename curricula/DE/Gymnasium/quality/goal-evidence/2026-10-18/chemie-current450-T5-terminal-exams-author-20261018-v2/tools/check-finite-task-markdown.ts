// SPDX-License-Identifier: Apache-2.0
import {readFileSync,writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';import {resolve} from 'node:path';import {pathToFileURL} from 'node:url';import assert from 'node:assert/strict';
const req=createRequire(resolve('app/package.json'));
async function main(){
 const React=req('react'),{renderToStaticMarkup}=req('react-dom/server');
 const {default:Markdown}=await import(pathToFileURL(req.resolve('react-markdown')).href);
 const {default:gfm}=await import(pathToFileURL(req.resolve('remark-gfm')).href);
 const {default:math}=await import(pathToFileURL(req.resolve('remark-math')).href);
 const {default:katex}=await import(pathToFileURL(req.resolve('rehype-katex')).href);
 const p='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-T5-terminal-exams-author-20261018-v2/';
 const goals=JSON.parse(readFileSync(p+'AUTHOR.eight-complete-exam-goals.draft.json','utf8'));
 const records=goals.flatMap((g:any)=>['taskContent','taskContentEn','solutionContent','solutionContentEn'].map(field=>{
  const html=renderToStaticMarkup(React.createElement(Markdown,{remarkPlugins:[gfm,math],rehypePlugins:[katex]},g.examData[field]));
  assert(!html.includes('katex-error'),g.id+' '+field);
  assert(!html.includes('curricula/'),g.id+' '+field);
  if(g.id.startsWith('44af0')&&field.startsWith('task')){assert(html.includes('<table>'));assert(html.includes('AMG'));assert(html.includes('EI'))}
  if(g.id.startsWith('6ca09')&&field.startsWith('task')){assert(html.includes('265'));assert(html.includes('320'));assert(!html.includes('150 mL'))}
  return {goalId:g.id,field,renderedWithoutException:true,renderedChars:html.length,tables:(html.match(/<table>/g)||[]).length,codeOrReviewLocatorLeaks:0};
 }));
 const report={status:'PASS_FINITE_INSTALLED_MARKDOWN_STACK_SSR',renderer:'Actual installed ReactMarkdown/remark-gfm/remark-math/rehype-katex stack',examCount:goals.length,records,normalWrites:0,browserAcceptance:false};
 writeFileSync(p+'CHECK.actual-GoalCard-Markdown-plugin-SSR.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,exams:goals.length,strings:records.length}));
}main();
