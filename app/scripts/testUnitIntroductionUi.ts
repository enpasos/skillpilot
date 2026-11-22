import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { chromium } from 'playwright'
import { createServer } from 'vite'

const root = fileURLToPath(new URL('../', import.meta.url))
const cacheDir = await mkdtemp(join(tmpdir(), 'skillpilot-introduction-'))
const server = await createServer({ root, cacheDir, configFile: false, logLevel: 'error', plugins: [react(), {
  name: 'unit-introduction-browser-contract', configureServer(server) {
    server.middlewares.use((request, response, next) => {
      if (!request.url?.startsWith('/__unit-introduction')) return next()
      response.setHeader('Content-Type', 'text/html')
      const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><div id="root"></div>
      <script type="module">
      import React, {useState} from 'react';
      import {createRoot} from 'react-dom/client';
      import {UnitIntroduction} from '/src/components/UnitIntroduction.tsx';
      const language = new URL(location.href).searchParams.get('lang') || 'de';
      const credited = new URL(location.href).searchParams.get('credit') === '1';
      const deferUntilRequested = new URL(location.href).searchParams.get('exam') === '1';
      const text = {de:{question:'Wie kommt eine Nachricht an?',promise:'Du erklärst den Weg einer Nachricht.',scene:'Ein Brief wartet am ersten Knoten.',imageUrl:'/intro-image.svg',imageAlt:'Brief und zwei verbundene Stationen',topics:['Nachrichten aufteilen','Wege vergleichen']},en:{question:'How does a message arrive?',promise:'Explain the path of a message.',scene:'A letter waits at the first node.',imageUrl:'/intro-image.svg',imageAlt:'Letter and two connected stations',topics:['Split messages','Compare routes']}};
      const material={unit:{landscapeId:'informatics',compositionNodeId:'networks',viewIds:['test'],orientationGoalId:'network-intro'},intro:text,exercises:[]};
      function App(){const [complete,setComplete]=useState(false),[active,setActive]=useState(false),[handoffs,setHandoffs]=useState(0);
      return React.createElement(React.Fragment,null,
      React.createElement('button',{onClick:()=>setActive(true)},'Show active unit'),
      React.createElement('button',{onClick:()=>setComplete(true)},'Receive confirmed coach result'),
      React.createElement('output',null,'Handoffs: '+handoffs),
      React.createElement(UnitIntroduction,{material,language,context:['Informatik','Netzwerke'],completed:complete,credited,deferUntilRequested,active,nextStep:{title:'Nachrichten aufteilen',open:()=>{}},onContinue:async id=>{if(id!=='network-intro')throw Error('wrong ID');setHandoffs(value=>value+1)}}));}
      createRoot(document.getElementById('root')).render(React.createElement(App));
      </script></body></html>`
      void server.transformIndexHtml(request.url, html).then(body => response.end(body))
    })
  },
}], optimizeDeps: { entries: [], include: ['react', 'react-dom/client', 'react/jsx-dev-runtime'] }, server: { host: '127.0.0.1', port: 0, hmr: false } })
await server.listen()
const address = server.httpServer!.address()
assert(address && typeof address !== 'string')
const browser = await chromium.launch({ headless: true })
try {
  for (const language of ['de', 'en']) for (const width of [390, 1100]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' })
    const errors: string[] = [], writes: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.route('**/intro-image.svg', route => route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240"><rect width="400" height="240" fill="white"/><path d="M50 120h300" stroke="gray"/></svg>' }))
    await page.route('**/api/**', route => { writes.push(route.request().method()); return route.abort() })
    await page.goto(`http://127.0.0.1:${address.port}/__unit-introduction?lang=${language}`)
    const intro = page.getByTestId('unit-introduction')
    const button = intro.getByRole('button', { name: language === 'de' ? 'Lernen starten' : 'Start Learning', exact: true })
    await intro.getByRole('img').waitFor()
    assert.equal(await button.isEnabled(), false, 'A background map cannot offer the handoff')
    assert.equal(await page.getByText('Handoffs: 0', { exact: true }).isVisible(), true)
    assert.deepEqual(await intro.getByTestId('unit-introduction-topics').getByRole('listitem').allTextContents(),
      language === 'de' ? ['Nachrichten aufteilen', 'Wege vergleichen'] : ['Split messages', 'Compare routes'])
    await page.getByRole('button', { name: 'Show active unit', exact: true }).click()
    await button.click()
    await page.getByText('Handoffs: 1', { exact: true }).waitFor()
    assert.equal(await intro.getAttribute('data-state'), 'orientation', 'Handoff is not completion')
    assert.equal(await intro.locator('svg').count(), 0, 'The introduction has no shield or result icon')
    await page.getByRole('button', { name: 'Receive confirmed coach result', exact: true }).click()
    await intro.getByText(language === 'de' ? 'Einstieg abgeschlossen.' : 'Introduction completed.', { exact: true }).waitFor()
    assert.equal(await intro.getByRole('img').count(), 0, 'A return visit starts with the short overview')
    assert.equal(await intro.getByRole('heading').count(), 0, 'A return visit does not repeat the question or learning promise')
    await intro.getByRole('button', { name: (language === 'de' ? 'Nächster Schritt: ' : 'Next step: ') + 'Nachrichten aufteilen', exact: true }).waitFor()
    await intro.getByRole('button', { name: language === 'de' ? 'Einstieg noch einmal ansehen' : 'View introduction again', exact: true }).click()
    await intro.getByRole('img').waitFor()
    assert.equal(await button.count(), 0, 'Reviewing a completed introduction does not start another completion')
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
    await page.addStyleTag({ content: ':root { --chat-bg: #343541; --text-primary: #ececf1; --text-secondary: #c5c5d2; }' })
    assert.deepEqual(await intro.evaluate(element => ({ color: getComputedStyle(element).color, background: getComputedStyle(element).backgroundColor })),
      { color: 'rgb(236, 236, 241)', background: 'rgb(52, 53, 65)' }, 'The full introduction keeps a readable background in dark mode')
    assert.deepEqual(errors, [])
    assert.deepEqual(writes, [], 'Presentation, handoff and reviewing never write mastery')
    console.log(`Unit introduction ${language} ${width}px: image/alt, context, promise, immediate topics, active-only handoff, independent confirmation and compact return passed.`)
    await page.close()
  }
  const credited = await browser.newPage()
  await credited.goto(`http://127.0.0.1:${address.port}/__unit-introduction?lang=de&credit=1`)
  await credited.getByText('Einstieg durch eine Prüfung angerechnet.', { exact: true }).waitFor()
  assert.equal(await credited.getByText('Einstieg abgeschlossen.', { exact: true }).count(), 0)
  assert.equal(await credited.getByTestId('unit-introduction').getByRole('heading').count(), 0)
  await credited.close()
  const alternative = await browser.newPage()
  await alternative.route('**/intro-image.svg', route => route.fulfill({ status: 404, body: '' }))
  await alternative.goto(`http://127.0.0.1:${address.port}/__unit-introduction?lang=en`)
  const alternativeIntro = alternative.getByTestId('unit-introduction')
  await alternativeIntro.locator('figcaption').getByText('Letter and two connected stations', { exact: true }).waitFor()
  await alternative.getByRole('button', { name: 'Show active unit', exact: true }).click()
  await alternativeIntro.getByTestId('unit-introduction-continue').click()
  await alternative.getByText('Handoffs: 1', { exact: true }).waitFor()
  assert.equal(await alternativeIntro.getAttribute('data-state'), 'orientation')
  await alternative.close()
  const directExam = await browser.newPage()
  await directExam.route('**/intro-image.svg', route => route.fulfill({ status: 404, body: '' }))
  await directExam.goto(`http://127.0.0.1:${address.port}/__unit-introduction?lang=en&exam=1`)
  const deferred = directExam.getByTestId('unit-introduction')
  await deferred.getByText('The unit introduction is still open.', { exact: true }).waitFor()
  assert.equal(await deferred.getByRole('img').count(), 0, 'Assessment navigation keeps room for the actual task')
  assert.equal(await deferred.getAttribute('data-state'), 'orientation', 'Deferring a scene never claims completion')
  await deferred.getByRole('button', { name: 'View introduction', exact: true }).click()
  await deferred.getByRole('heading', { name: 'How does a message arrive?', exact: true }).waitFor()
  assert.equal(await deferred.getAttribute('data-state'), 'orientation')
  await directExam.close()
} finally { await browser.close(); await server.close(); await rm(cacheDir, { recursive: true, force: true }) }
