// SPDX-License-Identifier: Apache-2.0
import { readFileSync,writeFileSync,mkdirSync } from 'node:fs'
import { resolve,dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createElement } from '../../app/node_modules/react/index.js'
import { renderToStaticMarkup } from '../../app/node_modules/react-dom/server.node.js'
import ReactMarkdown from '../../app/node_modules/react-markdown/index.js'
import remarkGfm from '../../app/node_modules/remark-gfm/index.js'
import remarkMath from '../../app/node_modules/remark-math/index.js'
import rehypeKatex from '../../app/node_modules/rehype-katex/index.js'
import { chromium } from '../../app/node_modules/playwright/index.mjs'
const out=dirname(fileURLToPath(import.meta.url));const defs=JSON.parse(readFileSync(resolve(out,'assessment-definitions.json'),'utf8'));const assets=JSON.parse(readFileSync(resolve(out,'asset-manifest.actual.json'),'utf8'))
const render=(md:string)=>renderToStaticMarkup(createElement(ReactMarkdown,{remarkPlugins:[remarkGfm,remarkMath],rehypePlugins:[rehypeKatex],children:md}))
const browser=await chromium.launch({headless:true});mkdirSync(resolve(out,'inspection'),{recursive:true});const observations=[]
for(const width of [320,375])for(const lang of ['de','en']){
 const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1})
 let content=defs.map((g:any)=>`<section data-goal="${g.id}"><h2>${lang==='en'?g.titleEn:g.title}</h2><div class="task">${render(g.examData[lang==='en'?'taskContentEn':'taskContent'])}</div></section>`).join('')
 for(const a of assets)content=content.replaceAll(a.url,'data:image/png;base64,'+readFileSync(resolve(out,'proposed',a.pngPath)).toString('base64'))
 const html=`<!doctype html><html lang="${lang}"><meta name="viewport" content="width=device-width, initial-scale=1"><style>*{box-sizing:border-box}body{margin:0;padding:16px;font:16px/1.6 Arial,sans-serif;color:#13263c;background:#fff}h2{font-size:20px;line-height:1.3}section{margin-bottom:40px}.task{padding:0;max-width:100%}img{display:block;max-width:100%;width:100%;height:auto}table{border-collapse:collapse;width:100%;font-size:14px}td,th{border:1px solid #64748b;padding:4px;overflow-wrap:anywhere;text-align:left}p{overflow-wrap:anywhere}</style>${content}</html>`
 await page.setContent(html);await page.locator('img').last().waitFor({state:'visible'});await page.evaluate(()=>Promise.all([...document.images].map(i=>i.decode())))
 const tables=await page.locator('table').count();if(tables!==2)throw Error(`Expected actual two tables in ${lang}, saw ${tables}`)
 const images=await page.locator('img').count();if(images!==2)throw Error('Expected both actual localized diagram stimuli')
 const imageWidths=await page.locator('img').evaluateAll((xs:any[])=>xs.map(x=>x.getBoundingClientRect().width))
 const overflows=await page.evaluate(()=>({document:document.documentElement.scrollWidth>innerWidth,tables:[...document.querySelectorAll('table')].map(x=>x.getBoundingClientRect().right>innerWidth)}))
 await page.screenshot({path:resolve(out,`inspection/full.${lang}.viewport-${width}.png`),fullPage:true})
 const diagrams=page.locator('section').last();await diagrams.screenshot({path:resolve(out,`inspection/diagrams.${lang}.viewport-${width}.png`)})
 for(let j=0;j<2;j++)await page.locator('img').nth(j).screenshot({path:resolve(out,`inspection/${j===0?'temperature':'clubs'}.${lang}.viewport-${width}.png`)})
 observations.push({language:lang,viewportWidth:width,renderer:'Actual ReactMarkdown + remarkGfm + remarkMath + rehypeKatex as in GoalCard.tsx; Chromium, DPR 1; isolated task surface, 16px page inset. Not full app/host acceptance.',actualTables:tables,actualLocalizedImages:images,imageWidths,effectiveMinimumFontPx:imageWidths.map(x=>26*x/480),overflows})
 await page.close()
}
await browser.close();writeFileSync(resolve(out,'render-observations.actual.json'),JSON.stringify({status:'actual-rendering-awaiting-independent-final-content-review',observations},null,2)+'\n');console.log(JSON.stringify(observations,null,2))
