const fs=require('fs'),path=require('path'),{chromium}=require('/home/enpasos/projects/skillpilot/app/node_modules/playwright');
const root='/home/enpasos/projects/skillpilot',base=path.join(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12');
const author=path.join(base,'chemie-q3-thirteen-current402-four-images-author-20261012-v3'),out=path.join(base,'chemie-q3-thirteen-current402-targeted-independent-a-20261012-v3');
const join=JSON.parse(fs.readFileSync(path.join(author,'inputs/FINAL.neutral-whole402-P13-whole28-source-bounded.join.json'))),assets=new Map(join.selected13WholeTuples.map(t=>[t.imageKeepBinding.currentUrl,path.join(root,t.imageKeepBinding.currentActualAssetPath)]));
(async()=>{fs.mkdirSync(path.join(out,'native-actual-views'),{recursive:true}); const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:1024,height:1400},deviceScaleFactor:1});const errors=[];
page.on('pageerror',e=>errors.push(String(e)));
await page.route('http://review-a.local/**',async r=>{const u=new URL(r.request().url());if(u.pathname==='/whole13.html')return r.fulfill({contentType:'text/html',body:fs.readFileSync(path.join(author,'native/whole13.html'))});if(assets.has(u.pathname))return r.fulfill({contentType:u.pathname.endsWith('.png')?'image/png':'image/jpeg',body:fs.readFileSync(assets.get(u.pathname))});return r.abort();});
await page.goto('http://review-a.local/whole13.html',{waitUntil:'networkidle'});
await page.locator('article.goal-page img').evaluateAll(xs=>Promise.all(xs.map(x=>x.decode())));
const rows=[];
for(const t of join.selected13WholeTuples){const a=page.locator('article[data-goal-id="'+t.goalId+'"]');await a.scrollIntoViewIfNeeded();const p=path.join(out,'native-actual-views',t.goalId+'.whole13.native-html.png');await a.screenshot({path:p});const layout=await a.evaluate(x=>({clientHeight:x.clientHeight,scrollHeight:x.scrollHeight,imageNaturalWidth:x.querySelector('img').naturalWidth,imageNaturalHeight:x.querySelector('img').naturalHeight}));rows.push({goalId:t.goalId,path:path.relative(root,p),boundingBox:await a.boundingBox(),layout});}
await browser.close();fs.writeFileSync(path.join(out,'checks/own-actual-whole13-native-capture.receipt.json'),JSON.stringify({role:'independent_A_actual_normal_whole13_native_capture',sourceHtmlPath:path.relative(root,path.join(author,'native/whole13.html')),exactOriginalHtmlServed:true,actualAssetBytesServed:true,goalPages:rows,errors,humanApproval:false},null,2)+'\n');})();

