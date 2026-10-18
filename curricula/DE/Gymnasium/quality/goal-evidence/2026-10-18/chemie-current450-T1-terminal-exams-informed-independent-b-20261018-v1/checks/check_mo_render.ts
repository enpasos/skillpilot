// Independent execution copy of the frozen author finite renderer check; output confined to this review.
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
 const p='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-T1-terminal-exams-author-20261018-v6/';
 const g=JSON.parse(readFileSync(p+'AUTHOR.new-goals.full.draft.json','utf8')).newGoals.find((g:any)=>g.id==='8b7ac0a3-f893-5a7f-bad0-0b299c7fba6a');
 const records=['taskContent','taskContentEn'].map(field=>{
  const html=renderToStaticMarkup(React.createElement(Markdown,{remarkPlugins:[gfm,math],rehypePlugins:[katex]},g.examData[field]));
  const blocks=[...html.matchAll(/<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/g)].map(m=>m[1]);
  assert.equal(blocks.length,2);
  assert(blocks.every(b=>b.includes('sigma*2p_z')&&b.includes('pi*2p_x')&&b.includes('\n')&&!b.includes('<em>')));
  assert(blocks[0].includes('[up down]'));assert(blocks[1].includes('[up  ]'));
  return {field,html,plainCodeBlocks:blocks.length,antibondingStarsPreservedInEveryLadder:true,scientificLineBreaksPreserved:true};
 });
 writeFileSync('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-T1-terminal-exams-informed-independent-b-20261018-v1/checks/CHECK.actual-MO-GoalCard-stack-SSR.json',JSON.stringify({renderer:'Actual ReactMarkdown/remark-gfm/remark-math/rehype-katex plugin stack in GoalCard.tsx, bounded server rendering of these two task strings only',records,normalWrites:0,browserAcceptance:false},null,2)+'\n');
 console.log(JSON.stringify({languages:2,laddersPerLanguage:2,starsAndLineBreaksPreserved:true,normalWrites:0}));
}main();
