// SPDX-License-Identifier: Apache-2.0
// Independent, bounded reviewer execution of the frozen GK24 draft sources.
// Run with a private writable output directory inside a read-only, offline namespace.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import { pathToFileURL } from 'node:url';

const [repo, output] = process.argv.slice(2);
assert(repo && output, 'Pass repository and private output directory');
const prefix = 'docs/dev/ci-graph-repairs/informatics-gk24-terminal-draft-2026-11-06';
const pins = {
  '.task.md': 'aac9fe49b71430fbb40abdeb85b5ede0c920bcc18001ec8cf3478a39810c5fa7',
  '.solution.md': '731212704993a78aaf1f76e7cc931c58670f720e543893a303fa39ca09d00b91',
  '.exam-data.json': '6a99cf279e353aeba72ac841b2104d35c4086b37fb53e412477bf806e98b8899',
};
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const inputs = Object.fromEntries(Object.entries(pins).map(([suffix, expected]) => {
  const raw = readFileSync(resolve(repo, prefix + suffix));
  assert.equal(sha(raw), expected, suffix);
  return [suffix, raw.toString('utf8')];
}));
const solution = inputs['.solution.md'];
const task = inputs['.task.md'];
const exam = JSON.parse(inputs['.exam-data.json']);
assert.equal(exam.taskContent, task);
assert.equal(exam.solutionContent, solution);
const blocks = (text, language) => [...text.matchAll(new RegExp('```' + language + '\\n([\\s\\S]*?)\\n```', 'g'))].map(match => match[1]);
const [finalHtml, firstHtml] = blocks(solution, 'html');
const [secondModule, cryptoModule] = blocks(solution, 'javascript');
const oldModule = blocks(task, 'javascript').find(source => source.includes('export function reserveV0'));
const finalScript = finalHtml.match(/<script>\n([\s\S]*?)\n<\/script>/)[1];
assert.equal((finalScript.match(/installForm\(document\);/g) ?? []).length, 1);
const finalCore = finalScript.replace('installForm(document);', '');
const plain = value => JSON.parse(JSON.stringify(value));
const evaluation = (source, names) => vm.runInNewContext(source.replace(/^export /gm, '') + '\n({' + names.join(',') + '})', { console: { log() {} } });
const final = evaluation(finalCore, ['initialCourses', 'priceCents', 'available', 'reserve', 'availableCourses', 'book']);
const second = evaluation(secondModule, ['initialCourses', 'priceCents', 'reserve', 'book']);
const old = evaluation(oldModule, ['reserveV0', 'priceV0']);
const crypto = evaluation(cryptoModule, ['caesar', 'vigenere', 'recoverVigenereKey']);
const cases = [];
function check(id, action) { action(); cases.push({ id, status: 'pass' }); }
const normal = { name: 'Jana Jung', email: 'jana@example.test', course: 'robotik', places: '2', confirmTestData: true };
check('state-sequence-and-explicit-loop', () => {
  const courses = final.initialCourses();
  assert.deepEqual(plain(final.availableCourses(courses)), [{ id: 'robotik', free: 3 }, { id: 'laser', free: 4 }]);
  assert.equal(final.book(courses, normal).priceCents, 600);
  assert.equal(courses[0].reserved, 5);
  assert.equal(final.book(courses, normal).ok, false);
  assert.equal(courses[0].reserved, 5);
  assert.equal(final.book(courses, { ...normal, places: '1' }).ok, true);
  assert.equal(courses[0].reserved, 6);
  assert.deepEqual(plain(final.availableCourses(courses)), [{ id: 'laser', free: 4 }]);
});
for (const places of [0, -1, 1.5, 7, NaN]) check('invalid-amount-' + String(places), () => {
  const courses = final.initialCourses(); const before = JSON.stringify(courses);
  assert.equal(final.reserve(courses[0], places), false);
  assert.equal(JSON.stringify(courses), before);
  assert.equal(final.book(courses, { ...normal, places }).ok, false);
  assert.equal(JSON.stringify(courses), before);
  assert.throws(() => final.priceCents(places));
});
for (const [field, value] of [['name', ''], ['email', 'bad'], ['course', 'unknown'], ['places', '2x'], ['confirmTestData', false]]) {
  check('invalid-field-' + field, () => {
    const courses = final.initialCourses(); const before = JSON.stringify(courses);
    assert.equal(final.book(courses, { ...normal, [field]: value }).ok, false);
    assert.equal(JSON.stringify(courses), before);
  });
}
check('full-course-no-mutation', () => {
  const courses = final.initialCourses(); const before = JSON.stringify(courses);
  assert.equal(final.book(courses, { ...normal, course: 'medien', places: '1' }).ok, false);
  assert.equal(JSON.stringify(courses), before);
});
check('tariff-and-real-version-difference', () => {
  assert.deepEqual([1, 3, 4, 6].map(final.priceCents), [300, 900, 1000, 1600]);
  assert.equal(second.priceCents(4), 1200);
  assert.equal(old.priceV0(4), 1200);
  assert.equal(final.book(final.initialCourses(), { ...normal, course: 'laser', places: '4' }).priceCents, 1000);
  assert(!firstHtml.includes('<script>'));
  assert.match(firstHtml, /<button[^>]*disabled/);
  assert.notEqual(sha(firstHtml), sha(finalHtml));
});
const oldNegatives = [
  { places: 2, expectedOk: true, expectedReserved: 5 },
  { places: 3, expectedOk: true, expectedReserved: 6 },
  { places: 4, expectedOk: false, expectedReserved: 3 },
].map(expected => {
  const course = { capacity: 6, reserved: 3 };
  const actualOk = old.reserveV0(course, expected.places);
  assert(actualOk !== expected.expectedOk || course.reserved !== expected.expectedReserved, 'Old code must violate each expected outcome');
  const repaired = { capacity: 6, reserved: 3 };
  assert.equal(final.reserve(repaired, expected.places), expected.expectedOk);
  assert.equal(repaired.reserved, expected.expectedReserved);
  return { ...expected, actualOk, actualReserved: course.reserved, expectedOldFailureObserved: true, repairedPass: true };
});
check('C1-caesar-apply-and-invert', () => { assert.equal(crypto.caesar('TREFFENAMTOR', 5), 'YWJKKJSFRYTW'); assert.equal(crypto.caesar('YWJKKJSFRYTW', -5), 'TREFFENAMTOR'); });
check('C2-all-caesar-keys-and-controlled-key', () => { assert.equal(new Set(Array.from({ length: 26 }, (_, k) => crypto.caesar('CANOONWDVINQW', -k))).size, 26); assert.equal(crypto.caesar('CANOONWDVINQW', -9), 'TREFFENUMZEHN'); assert.equal(crypto.caesar('TREFFENUMZEHN', 9), 'CANOONWDVINQW'); });
check('C3-vigenere-apply-and-invert', () => { assert.equal(crypto.vigenere('SCHULTAG', 'UNI'), 'MPPOYBUT'); assert.equal(crypto.vigenere('MPPOYBUT', 'UNI', -1), 'SCHULTAG'); });
check('C4-known-prefix-recover-and-invert', () => { assert.equal(crypto.recoverVigenereKey('ANMELDUNG', 'ATJERAUTDRUYOZFK', 3), 'AGX'); assert.equal(crypto.vigenere('ATJERAUTDRUYOZFK', 'AGX', -1), 'ANMELDUNGROBOTIK'); assert.equal(crypto.vigenere('ANMELDUNGROBOTIK', 'AGX'), 'ATJERAUTDRUYOZFK'); assert.throws(() => crypto.recoverVigenereKey('BNMELDUNG', 'ATJERAUTDRUYOZFK', 3)); assert.throws(() => crypto.recoverVigenereKey('AN', 'ATJERAUTDRUYOZFK', 3)); });
check('smtp-token-and-http-body', () => {
  assert.equal(Buffer.from('AGFndXNlcgBkZW1vLXBhc3M=', 'base64').toString(), '\0aguser\0demo-pass');
  const body = 'name=Jana+Jung&email=jana%40example.test&course=robotik&places=2&testdata=on';
  assert.equal(Buffer.byteLength(body), 76);
  assert.equal(new URLSearchParams(body).get('email'), 'jana@example.test');
});
check('all24-required-no-compensation', () => {
  assert.equal(exam.scoring.maxPoints, 24); assert.equal(exam.scoring.passingPoints, 24);
  assert.equal(exam.scoring.steps.length, 24); assert.equal(new Set(exam.coveredGoalIds).size, 24);
  assert(!exam.coveredGoalIds.includes('e3e5c851-39d8-569f-9f0a-d516c729ed36'));
  for (let index = 0; index < 24; index++) { assert.equal(exam.scoring.steps[index].points, 1); assert.equal(exam.scoring.steps.reduce((total, step, i) => total + (i === index ? 0 : step.points), 0), 23); }
});
writeFileSync(resolve(output, 'gk24-final.html'), finalHtml);
writeFileSync(resolve(output, 'gk24-v1.html'), firstHtml);
writeFileSync(resolve(output, 'gk24-v2.mjs'), secondModule);
writeFileSync(resolve(output, 'gk24-crypto.mjs'), cryptoModule);
const require = createRequire(resolve(repo, 'app/package.json'));
const { chromium } = require('playwright');
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const browserRows = [];
try {
  for (const width of [320, 767, 768, 1024]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 } });
    const errors = []; const networkAttempts = [];
    page.on('pageerror', error => errors.push(String(error)));
    await page.route(/^https?:\/\//, route => { networkAttempts.push(route.request().url()); return route.abort(); });
    await page.goto(pathToFileURL(resolve(output, 'gk24-final.html')).href);
    const layout = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, grid: getComputedStyle(document.querySelector('.cards')).gridTemplateColumns, cards: document.querySelectorAll('article.card').length }));
    assert.equal(layout.cards, 3); assert.equal(layout.grid.split(/\s+/).length, width < 768 ? 1 : 3); assert(layout.scrollWidth <= width);
    await page.locator('#name').fill('Jana Jung'); await page.locator('#email').fill('jana@example.test'); await page.locator('#testdata').check(); await page.locator('#places').fill('2');
    await page.locator('button[type=submit]').click();
    assert.match(await page.locator('#status').innerText(), /6,00 EUR; noch 1 frei/); assert.equal(await page.locator('[data-free-for=robotik]').innerText(), '1');
    await page.locator('button[type=submit]').click();
    assert.match(await page.locator('#status').innerText(), /Nicht genügend Plätze/); assert.equal(await page.locator('[data-free-for=robotik]').innerText(), '1');
    await page.locator('#places').fill('1'); await page.locator('button[type=submit]').click();
    assert.equal(await page.locator('[data-free-for=robotik]').innerText(), '0');
    await page.locator('#course').selectOption('laser'); await page.locator('#places').fill('4'); await page.locator('button[type=submit]').click();
    assert.match(await page.locator('#status').innerText(), /10,00 EUR; noch 0 frei/); assert.equal(await page.locator('[data-free-for=laser]').innerText(), '0');
    const store = await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }));
    assert.deepEqual(store, { local: 0, session: 0 }); assert.deepEqual(networkAttempts, []); assert.deepEqual(errors, []);
    if (width === 320 || width === 1024) await page.screenshot({ path: resolve(output, `gk24-${width}.png`), fullPage: true });
    browserRows.push({ width, layout, realFormSequence: 'pass', networkAttempts, pageErrors: errors, storage: store });
    await page.close();
  }
} finally { await browser.close(); }
for (const [suffix, expected] of Object.entries(pins)) assert.equal(sha(readFileSync(resolve(repo, prefix + suffix))), expected);
const result = { status: 'bounded-independent-GK24-reviewer-reference-checks-pass', authorRunClaimed: false, oldLkRunsReusedAsNewPass: false, learnerEffectivenessClaimed: false, sourceOrDraftWrites: false, inputPins: pins, coreCases: cases, oldCodeNegatives: oldNegatives, browserVersion: browser.version(), browserRows, extractedFiles: ['gk24-final.html', 'gk24-v1.html', 'gk24-v2.mjs', 'gk24-crypto.mjs', 'gk24-320.png', 'gk24-1024.png'].map(path => { const bytes = readFileSync(resolve(output, path)); return { path, bytes: bytes.length, sha256: sha(bytes) }; }) };
writeFileSync(resolve(output, 'reference-result.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ status: result.status, coreCases: cases.length, oldCodeNegatives: oldNegatives.length, browserWidths: browserRows.map(x => x.width) }));
