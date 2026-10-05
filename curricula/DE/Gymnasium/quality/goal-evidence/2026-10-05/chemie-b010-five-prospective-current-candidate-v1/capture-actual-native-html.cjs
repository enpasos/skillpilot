const {chromium}=require('../../../../../../../app/node_modules/playwright')
const {readFileSync,writeFileSync}=require('node:fs')
const {resolve}=require('node:path')
const {createHash}=require('node:crypto')
const http=require('node:http')
const root=process.cwd(),own=__dirname,iso=resolve(root,'tmp/chemie-b010-five-native-isolated-20261005-v1')
const model=JSON.parse(readFileSync(resolve(own,'native-finalbook/bundle/book-model.json'),'utf8'))
const htmlPath=resolve(own,'native-finalbook/bundle/book.html'),sha=b=>createHash('sha256').update(b).digest('hex')
;(async()=>{
 const server=http.createServer((req,res)=>{try{const u=new URL(req.url,'http://localhost'),p=u.pathname==='/book.html'?htmlPath:resolve(iso,'app/public','.'+u.pathname);const bytes=readFileSync(p);res.setHeader('Content-Type',p.endsWith('.html')?'text/html; charset=utf-8':p.endsWith('.png')?'image/png':'image/jpeg');res.end(bytes)}catch{res.statusCode=404;res.end()}})
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const port=server.address().port,browser=await chromium.launch({headless:true}),rows=[]
 try{
  const page=await browser.newPage({viewport:{width:980,height:1400},deviceScaleFactor:1});page.setDefaultTimeout(15000);console.log('Opened local Chromium');await page.goto(`http://127.0.0.1:${port}/book.html`,{waitUntil:'networkidle'});console.log('Loaded exact native HTML')
  await page.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())))
  if(await page.locator('.goal-page').count()!==9)throw new Error('Expected nine actual HTML goal sections')
  for(const goal of model.pages){const section=page.locator('#'+goal.anchor),image=section.locator('img');const text=await section.innerText();if(!text.includes(goal.title)||!text.includes(goal.description))throw new Error('Actual HTML text differs')
   const data=await image.evaluate(i=>({url:i.getAttribute('src'),alt:i.alt,width:i.naturalWidth,height:i.naturalHeight,loaded:i.complete&&i.naturalWidth>0}));if(!data.loaded||data.alt!==goal.visualization.altText||data.url!==goal.visualization.url)throw new Error('Actual rendered HTML asset differs')
   const file=resolve(own,`actual-html-${goal.goalId.slice(0,8)}.png`);await section.evaluate(e=>e.scrollIntoView({block:'start'}));const box=await section.boundingBox();if(!box)throw new Error('HTML section has no bounds');await page.screenshot({path:file,clip:box,animations:'disabled'});rows.push({goalId:goal.goalId,actualRenderedSectionTextMatches:true,actualRenderedImage:data,screenshotPath:file.replace(root+'/',''),screenshotSHA256:sha(readFileSync(file))});console.log('Captured '+goal.goalId)
  }
 }finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r))}
 writeFileSync(resolve(own,'actual-native-html-render-and-text.receipt.json'),JSON.stringify({method:'Local headless Chromium, exact exported native HTML and isolated public assets, 980 CSS pixels, deviceScaleFactor1; no device/client acceptance',htmlPath:htmlPath.replace(root+'/',''),htmlSHA256:sha(readFileSync(htmlPath)),modelDigest:model.digest,rows,humanApproval:false,activeWrites:0},null,2)+'\n');console.log(JSON.stringify({actualHTMLSections:rows.length,allImagesLoaded:true,modelDigest:model.digest}))
})().catch(e=>{console.error(e);process.exitCode=1})
