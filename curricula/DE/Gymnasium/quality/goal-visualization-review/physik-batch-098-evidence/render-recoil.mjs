import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const here = dirname(fileURLToPath(import.meta.url))
const require = createRequire(resolve(process.cwd(), 'app/package.json'))
const { chromium } = require('playwright')
const scene = await readFile(resolve(here, 'recoil-background.png'))
if (createHash('sha256').update(scene).digest('hex') !== '2f2c37ad6d3faf78e7f9549d7de1c076a6e998e2838343e0ce59d3d0cf213731') {
  throw new Error('The original generated scene does not match the reviewed background.')
}
const output = process.argv[2]
if (!output) throw new Error('Supply the output JPEG path.')
const vectors = await readFile(resolve(here, 'recoil-vectors.svg'), 'utf8')
const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 })
  await page.setContent(`<style>body{margin:0} img,svg{position:absolute;inset:0;width:1600px;height:900px}</style>
    <img alt="" src="data:image/png;base64,${scene.toString('base64')}">${vectors}`)
  await page.locator('img').evaluate(image => image.decode())
  await page.screenshot({ path: output, type: 'jpeg', quality: 92 })
} finally {
  await browser.close()
}
