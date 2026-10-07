import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve, relative } from 'node:path'
const root=process.cwd()
const { chromium }=await import(resolve(root,'app/node_modules/playwright/index.mjs'))
const out=resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-ecology20b-current391-independent-b-20261007-v1/visual-five-corrected-v2')
const author=resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-ecology20b-current391-author-v1')
const imageAuthor=resolve(root,'curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-ecology20b-current391-image-author-root-20261007-v1')
const goals=JSON.parse(readFileSync(resolve(author,'current20-whole-DEEN-goals.actual.json'),'utf8')).goals
const sha=b=>createHash('sha256').update(b).digest('hex')
const browser=await chromium.launch({headless:true})
const rows=[]
try{
 for(const ordinal of [1,2,4,6,16]){
  const goal=goals[ordinal-1]
  const source=resolve(imageAuthor,'candidates',goal.id,'candidate-v2.png')
  const bytes=readFileSync(source)
  const captures=[]
  for(const width of [360,680]){
   const page=await browser.newPage({viewport:{width,height:1200},deviceScaleFactor:1})
   await page.setContent('<!doctype html><html lang="de"><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:#fff}img{display:block;width:100%;height:auto}</style></head><body><img id="actual" src="data:image/png;base64,'+bytes.toString('base64')+'"></body></html>')
   await page.locator('#actual').evaluate(i=>i.decode())
   const dimensions=await page.locator('#actual').evaluate(i=>({naturalWidth:i.naturalWidth,naturalHeight:i.naturalHeight,renderedWidth:i.clientWidth,renderedHeight:i.clientHeight}))
   const path=resolve(out,`ordinal-${String(ordinal).padStart(2,'0')}.actual-browser-${width}.png`)
   await page.locator('#actual').screenshot({path})
   captures.push({width,path:relative(root,path),sha256:sha(readFileSync(path)),dimensions,actualBrowserRendered:true,deviceScaleFactor:1})
   await page.close()
  }
  rows.push({ordinal,goalId:goal.id,wholeGoalTitle:goal.title,sourcePath:relative(root,source),sourceSha256:sha(bytes),captures,finalSelectionShaConfirmationPending:true})
 }
}finally{await browser.close()}
writeFileSync(resolve(out,'five-actual-browser-captures.independent-b.manifest.json'),JSON.stringify({role:'Own actual browser captures for five actual corrected current v2 candidates; not approval and not final selection',command:['node',relative(root,resolve(out,'capture-actual-five-widths.independent-b.mjs'))],actualExecution:true,rows,strictGain:0,humanApproval:false},null,2)+'\n')
console.log('Five actual source PNGs rendered at360/680; final selection and visual judgment pending')
