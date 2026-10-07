const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
const root=path.resolve(__dirname,'../../../../../../../');
const {chromium}=require(path.join(root,'app/node_modules/playwright'));
const folder=path.resolve(__dirname,'..');
(async()=>{const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:760,height:600},deviceScaleFactor:1});const records=[];
for(const relative of process.argv.slice(2)){
 const file=path.resolve(folder,relative),key=relative.replace(/\.[^.]+$/,'').replaceAll('/','-');
 for(const width of [360,680]){
  const fixture=path.join(folder,'browser',key+'.'+width+'.html');
  fs.writeFileSync(fixture,'<!doctype html><html lang="de"><meta charset="utf-8"><title>Isolierte Autorenansicht</title><style>html,body{margin:0;background:white}img{display:block;height:auto;max-height:448px;width:'+width+'px;object-fit:contain}</style><img src="'+pathToFileURL(file).href+'">');
  await page.goto(pathToFileURL(fixture).href);await page.locator('img').evaluate(async im=>await im.decode());
  const actual=await page.locator('img').evaluate(im=>{const r=im.getBoundingClientRect(),c=getComputedStyle(im);return {imageBox:{width:r.width,height:r.height},naturalWidth:im.naturalWidth,naturalHeight:im.naturalHeight,css:{maxHeight:c.maxHeight,objectFit:c.objectFit},devicePixelRatio:window.devicePixelRatio};});
  if(actual.imageBox.width!==width||actual.css.maxHeight!=='448px'||actual.css.objectFit!=='contain')throw Error('Width/CSS mismatch');
  const screenshot=path.join(folder,'browser',key+'.'+width+'.png');await page.locator('img').screenshot({path:screenshot});records.push({relative,requestedActualWidth:width,screenshot:path.relative(folder,screenshot),fixture:path.relative(folder,fixture),...actual});
 }
}
await browser.close();const name=process.argv[2].replaceAll('/','-').replace(/\.[^.]+$/,'')+'.display.receipt.json';fs.writeFileSync(path.join(folder,'receipts',name),JSON.stringify({role:'AUTHOR actual isolated browser rendering; no independent V or app acceptance',noCssException:true,originalBytesUnchanged:true,records},null,2)+'\n');process.stdout.write(JSON.stringify({actualDisplays:records.length})+'\n');})();
