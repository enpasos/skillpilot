// SPDX-License-Identifier: Apache-2.0
import {readFileSync,writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const req=createRequire(resolve('app/package.json'));
async function main(){
 const React=req('react'),{renderToStaticMarkup}=req('react-dom/server');
 const {default:Markdown}=await import(pathToFileURL(req.resolve('react-markdown')).href);
 const {default:gfm}=await import(pathToFileURL(req.resolve('remark-gfm')).href);
 const {default:math}=await import(pathToFileURL(req.resolve('remark-math')).href);
 const {default:katex}=await import(pathToFileURL(req.resolve('rehype-katex')).href);
 const p='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-T2-terminal-exams-author-20261018-v5/';
 const rows=JSON.parse(readFileSync(p+'AUTHOR.new-goals.full.draft.json','utf8')).newGoals.filter((g:any)=>['95cff878','9fea3d6f','4cbc2b02','8a281a5b','987cebe4','37d2e2a5'].some(prefix=>g.id.startsWith(prefix)));
 const records=rows.flatMap((g:any)=>['taskContent','taskContentEn'].map(field=>{
  const html=renderToStaticMarkup(React.createElement(Markdown,{remarkPlugins:[gfm,math],rehypePlugins:[katex]},g.examData[field]));
  assert(!html.includes('curricula/'));assert(!html.includes('.pdf12.1'));
  const links=[...html.matchAll(/href="([^"]+)"/g)].map(m=>m[1]);
  if(g.id.startsWith('9fea3d6f'))assert(links.includes('https://www.accessdata.fda.gov/drugsatfda_docs/label/2021/022348s018lbl.pdf'));
  return {goalId:g.id,field,renderedWithoutException:true,internalReviewLocators:0,primarySourceLinks:links,brokenFDASectionConcatenations:0};
 }));
 writeFileSync(p+'CHECK.v5-six-actual-GoalCard-Markdown-plugin-SSR.json',JSON.stringify({renderer:'Actual installed ReactMarkdown/remark-gfm/remark-math/rehype-katex stack; finite12task strings only',records,normalWrites:0,browserAcceptance:false},null,2)+'\n');
 console.log(JSON.stringify({goals:rows.length,taskLanguagesRendered:records.length,brokenFDAAndInternalLocatorCount:0,normalWrites:0}));
}main();
