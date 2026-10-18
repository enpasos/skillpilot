// SPDX-License-Identifier: Apache-2.0
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const req=createRequire(resolve('app/package.json'));
async function main(){
 const React=req('react'),{renderToStaticMarkup}=req('react-dom/server');
 const {default:Markdown}=await import(pathToFileURL(req.resolve('react-markdown')).href);
 const {default:gfm}=await import(pathToFileURL(req.resolve('remark-gfm')).href);
 const {default:math}=await import(pathToFileURL(req.resolve('remark-math')).href);
 const {default:katex}=await import(pathToFileURL(req.resolve('rehype-katex')).href);
 const p='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-T1-terminal-exams-author-20261018-v4/';
 const g=JSON.parse(readFileSync(p+'AUTHOR.new-goals.full.draft.json','utf8')).newGoals.find((g:any)=>g.id==='8b7ac0a3-f893-5a7f-bad0-0b299c7fba6a');
 const records=['taskContent','taskContentEn'].map(field=>{const html=renderToStaticMarkup(React.createElement(Markdown,{remarkPlugins:[gfm,math],rehypePlugins:[katex]},g.examData[field]));return {field,html,preCount:(html.match(/<pre>/g)||[]).length,codeCount:(html.match(/<code>/g)||[]).length,orbitalRowsStillOnlySoftWhitespace:html.includes('hoch/high')&&!html.includes('<pre>')}});
 console.log(JSON.stringify({renderer:'Exact ReactMarkdown plugins used by GoalCard.tsx; server rendering only, no browser or learner execution',records,normalWrites:0},null,2));
}main();
