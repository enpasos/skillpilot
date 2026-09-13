import { readFileSync, writeFileSync } from 'node:fs'
import { getPrivacyViewCopy } from '../src/utils/privacyViewCopy'

// The no-JavaScript notice and the application must never publish different terms.
const escapeHtml = (value: string): string => value.replace(/[&<>"']/gu, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]!)

const renderLanguage = (language: 'de' | 'en'): string => {
  const copy = getPrivacyViewCopy(language)
  const paragraphs = (values: string[]) => values.map(value => `<p>${escapeHtml(value)}</p>`).join('\n')
  return `<article id="${language}" lang="${language}">
<h2>${escapeHtml(copy.title)}</h2>
<p class="date">${escapeHtml(copy.effectiveDate)}</p>
${paragraphs([copy.intro])}
${copy.sections.map(section => `<section>
<h3>${escapeHtml(section.title)}</h3>
${paragraphs(section.paragraphs)}
${section.bullets ? `<ul>${section.bullets.map(bullet => `<li>${escapeHtml(bullet)}</li>`).join('\n')}</ul>` : ''}
${paragraphs(section.paragraphsAfterBullets ?? [])}
${section.links ? `<ul>${section.links.map(link => `<li><a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a></li>`).join('\n')}</ul>` : ''}
</section>`).join('\n')}
<section><h3>${escapeHtml(copy.contactTitle)}</h3>
${paragraphs([copy.contactIntro])}
<p><a href="mailto:support@skillpilot.com">support@skillpilot.com</a><br>
<a href="/imprint">${escapeHtml(copy.imprintLabel)}</a></p></section>
</article>`
}

const html = `<!doctype html>
<!-- Generated from app/src/utils/privacyViewCopy.ts by npm run build:privacy-notice. -->
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Datenschutz / Privacy — SkillPilot</title>
<link rel="canonical" href="https://skillpilot.com/privacy">
<style>
:root { color-scheme: light dark; font-family: system-ui, sans-serif; line-height: 1.65; color: #0f172a; background: #f8fafc; }
* { box-sizing: border-box; }
body { margin: 0; padding: clamp(1rem, 4vw, 2.5rem); }
main { max-width: 56rem; margin: auto; overflow-wrap: anywhere; }
nav { display: flex; flex-wrap: wrap; gap: 1rem; }
a { color: #0369a1; text-underline-offset: .2em; }
a:focus-visible { outline: 2px solid currentColor; outline-offset: 4px; }
h1 { font-size: clamp(1.7rem, 5vw, 2.4rem); line-height: 1.2; }
h2 { font-size: 1.7rem; }
h3 { font-size: 1.15rem; margin-top: 2rem; }
article { padding-block: 1rem 2rem; border-bottom: 1px solid #94a3b8; scroll-margin-top: 1rem; }
li + li { margin-top: .4rem; }
.date { color: #475569; }
@media (prefers-color-scheme: dark) { :root { color: #f1f5f9; background: #0f172a; } a { color: #7dd3fc; } .date { color: #cbd5e1; } }
</style>
</head>
<body><main>
<nav aria-label="Sprache / Language"><a href="/">SkillPilot</a><a href="#de" lang="de">Deutsch</a><a href="#en" lang="en">English</a></nav>
<h1>Datenschutz / Privacy</h1>
${renderLanguage('de')}
${renderLanguage('en')}
</main></body>
</html>
`

const destination = new URL('../public/privacy/index.html', import.meta.url)
if (process.argv.includes('--check')) {
  if (readFileSync(destination, 'utf8') !== html) {
    throw new Error('Static privacy notice is stale. Run npm run build:privacy-notice.')
  }
  console.log('Static DE/EN privacy notice matches the application copy.')
} else {
  writeFileSync(destination, html)
  console.log('Generated static DE/EN privacy notice.')
}
