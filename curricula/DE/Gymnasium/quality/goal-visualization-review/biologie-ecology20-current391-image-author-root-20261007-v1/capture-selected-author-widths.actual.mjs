// SPDX-License-Identifier: Apache-2.0
// Actual Chromium rendering only; source artwork is preserved byte-exact.
import { chromium } from '../../../../../../app/node_modules/playwright/index.mjs';
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const own = path.dirname(fileURLToPath(import.meta.url));
const plan = JSON.parse(await readFile(path.join(own,'twenty-exact-production-prompts.author.json'),'utf8'));
const browser = await chromium.launch({headless:true});
try {
 const page = await browser.newPage({deviceScaleFactor:1});
 for (const row of plan.prompts) {
  let version='v1';
  try { await access(path.join(own,'candidates',row.goalId,'candidate-v2.png')); version='v2'; } catch {}
  const source = path.join(own,'candidates',row.goalId,`candidate-${version}.png`);
  try { await access(source); } catch { continue; }
  const bytes = await readFile(source);
  const captures=[];
  const outdir=path.join(own,'inspection-captures',row.goalId);
  await mkdir(outdir,{recursive:true});
  for(const width of [360,680]) {
   const target=path.join(outdir,`actual-${version}-${width}px.png`);
   try { await access(target); } catch {
    await page.setViewportSize({width,height:800});
    await page.setContent(`<html><body style="margin:0"><img id="asset" style="display:block;width:${width}px;height:auto" src="data:image/png;base64,${bytes.toString('base64')}"></body></html>`);
    await page.locator('#asset').evaluate(img=>img.decode());
    await page.locator('#asset').screenshot({path:target});
   }
   const capture=await readFile(target);
   captures.push({width,path:path.relative(own,target),sha256:createHash('sha256').update(capture).digest('hex')});
  }
  const receipt=path.join(outdir,`chromium-captures-${version}.actual.json`);
  try { await access(receipt); } catch {
   await writeFile(receipt,JSON.stringify({goalId:row.goalId,sourcePath:path.relative(own,source),sourceSha256:createHash('sha256').update(bytes).digest('hex'),renderer:'actual Playwright Chromium element screenshot',deviceScaleFactor:1,captures,authorInspectionOnly:true,independentApproval:'pending',humanApproval:false},null,2)+'\n');
  }
  console.log(JSON.stringify({sequence:row.sequence,goalId:row.goalId,capturedWidths:[360,680]}));
 }
} finally { await browser.close(); }
