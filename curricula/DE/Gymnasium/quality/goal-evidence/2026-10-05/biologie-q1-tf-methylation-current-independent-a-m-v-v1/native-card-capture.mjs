import {chromium} from 'playwright'
import {writeFileSync} from 'node:fs'
const browser=await chromium.launch({headless:true})
const result=[]
for(const width of [360,680])for(const goal of [0,1]){
 const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1})
 await page.goto('http://127.0.0.1:5361/review/index.html?goal='+goal,{waitUntil:'networkidle'})
 await page.waitForFunction(()=>{const i=document.querySelector('figure img');return i?.complete&&i.naturalWidth>0})
 const r=await page.locator('figure img').evaluate(i=>({src:i.getAttribute('src'),alt:i.alt,naturalWidth:i.naturalWidth,naturalHeight:i.naturalHeight,rect:{x:i.getBoundingClientRect().x,y:i.getBoundingClientRect().y,width:i.getBoundingClientRect().width,height:i.getBoundingClientRect().height},objectFit:getComputedStyle(i).objectFit,maxHeight:getComputedStyle(i).maxHeight,scrollWidth:document.documentElement.scrollWidth,viewportWidth:innerWidth}))
 const path='/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-tf-methylation-current-independent-a-m-v-v1/native-goal-card-'+goal+'-'+width+'.png'
 await page.locator('#native-review-card').screenshot({path})
 result.push({goalIndex:goal,viewportWidth:width,screenshot:path,...r});await page.close()
}
writeFileSync('/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-tf-methylation-current-independent-a-m-v-v1/native-card-inspection.metrics.json',JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify(result));await browser.close()
