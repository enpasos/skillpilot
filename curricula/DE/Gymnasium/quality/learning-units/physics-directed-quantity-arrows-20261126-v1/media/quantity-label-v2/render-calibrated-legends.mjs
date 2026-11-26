// SPDX-License-Identifier: Apache-2.0
// Render the calibrated scale separately from the unchanged illustrated scene.
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'

const [subject, source, output] = process.argv.slice(2)
if (!['arrow', 'newton'].includes(subject) || !source || !output) {
  throw new Error('Usage from repository root: node render-calibrated-legends.mjs arrow|newton provider.png output.jpg')
}
const require = createRequire(resolve('app/package.json'))
const { chromium } = require('playwright')

function scaleBar(x, y, length, label, labelY) {
  const left = x - length / 2
  const right = x + length / 2
  return `<path d="M${left} ${y} H${right} M${left} ${y-15} v30 M${right} ${y-15} v30"
    fill="none" stroke="#d24531" stroke-width="9" stroke-linecap="round"/>
    <text x="${x}" y="${labelY}" fill="#152e42" text-anchor="middle" font-size="67">${label}</text>`
}
const legends = {
  // The two cart arrows measure 436 and 196 px in this 1600 px drawing.
  // Each calibration belongs to its own panel; both readings are 4 m/s.
  arrow: `<rect x="1175" width="425" height="900" fill="#fbf4e5"/>
    <path d="M1184 62 V839" stroke="#596b6c" stroke-width="4"/>
    <text x="1392" y="133" font-size="46" fill="#203646" text-anchor="middle">Geschwindigkeit</text>
    <text x="1392" y="191" font-size="46" fill="#203646" text-anchor="middle">Pfeilmaßstab</text>
    ${scaleBar(1392,364,218,'2 m/s',285)}
    ${scaleBar(1392,691,196,'4 m/s',612)}`,
  // Both forces measure 435 px from the receiver's point to the arrow tip.
  newton: `<rect y="715" width="1600" height="185" fill="#fbf4e5"/>
    ${scaleBar(800,762,435,'Kraftmaßstab: 2 N',875)}`,
}
const data = (await readFile(source)).toString('base64')
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <image href="data:image/png;base64,${data}" width="1600" height="900" preserveAspectRatio="none"/>
  <g font-family="Liberation Sans, sans-serif" font-weight="bold">${legends[subject]}</g>
</svg>`
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
try {
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 })
  await page.setContent('<html><body style="margin:0">' + svg + '</body></html>', { waitUntil: 'load' })
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: output, type: 'jpeg', quality: 94 })
} finally {
  await browser.close()
}
