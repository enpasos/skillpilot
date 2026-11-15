import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createElement} from '../../../app/node_modules/react/index.js';
import {renderToStaticMarkup} from '../../../app/node_modules/react-dom/server.node.js';
import ReactMarkdown from '../../../app/node_modules/react-markdown/index.js';
import remarkGfm from '../../../app/node_modules/remark-gfm/index.js';
import remarkMath from '../../../app/node_modules/remark-math/index.js';
import rehypeKatex from '../../../app/node_modules/rehype-katex/index.js';
import {chromium} from '../../../app/node_modules/playwright/index.mjs';
const base=resolve('tmp/elementary-diagram-delivery-20261115'), out=resolve(base,'independent-final-review');
const defs=JSON.parse(readFileSync(resolve(base,'assessment-definitions.json'),'utf8'));
const browser=await chromium.launch({headless:true}), results=[];
for(const lang of ['de','en'])for(const width of [320,375]){
 const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1});
 const fragments=defs.map((g:any)=>renderToStaticMarkup(createElement(ReactMarkdown,{remarkPlugins:[remarkGfm,remarkMath],rehypePlugins:[rehypeKatex],children:g.examData[lang==='de'?'taskContent':'taskContentEn']})));
 let html=`<html lang="${lang}"><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{box-sizing:border-box}body{margin:0;padding:16px;font:16px/1.6 Arial;color:#13263c}article{margin-bottom:30px}h2{font-size:20px;line-height:1.3}img{width:100%;max-width:100%;height:auto;display:block}table{width:100%;border-collapse:collapse;font-size:14px}td,th{border:1px solid #64748b;padding:4px;text-align:left;overflow-wrap:anywhere}p{overflow-wrap:anywhere}</style>`+fragments.map((f:string,i:number)=>`<article><h2>${defs[i][lang==='de'?'title':'titleEn']}</h2>${f}</article>`).join('')+'</html>';
 html=html.replaceAll(/src="(\/assets\/[^"]+)"/g,(_m,p)=>`src="data:image/png;base64,${readFileSync(resolve(base,'proposed/app/public'+p)).toString('base64')}"`);
 await page.setContent(html);await page.evaluate(()=>Promise.all([...document.images].map(i=>i.decode())));
 const observations=await page.evaluate(()=>({tables:[...document.querySelectorAll('table')].map(t=>({rows:t.rows.length,cells:[...t.rows].map(r=>[...r.cells].map(c=>c.textContent)),right:t.getBoundingClientRect().right})),images:[...document.images].map(i=>({alt:i.alt,width:i.getBoundingClientRect().width,naturalWidth:i.naturalWidth,complete:i.complete})),horizontalOverflow:document.documentElement.scrollWidth>innerWidth}));
 if(observations.tables.length!==2||observations.images.length!==2||observations.horizontalOverflow||observations.tables.some(t=>t.right>width))throw Error(`Bad isolated render ${lang}/${width}`);
 await page.screenshot({path:resolve(out,`independent.${lang}.${width}.png`),fullPage:true});results.push({language:lang,viewport:width,...observations});await page.close();
}
await browser.close();writeFileSync(resolve(out,'render.actual.json'),JSON.stringify({surface:'Independent isolated task rendering with native Markdown components; 16px inset. Not full-app, backend or host acceptance.',results},null,2)+'\n');console.log(JSON.stringify(results,null,2));
