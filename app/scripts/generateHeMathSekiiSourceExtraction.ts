import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const appRoot = process.cwd()
const repoRoot = path.resolve(appRoot, '..')
const sourcePdfPath = path.resolve(
  repoRoot,
  'curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf',
)
const outputPath = path.resolve(
  repoRoot,
  'curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_MATHEMATIK_SEKII_KC2024.source-extraction.json',
)
const canonicalMathPath = path.resolve(
  repoRoot,
  'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
)
const mappingReviewPath = path.resolve(
  repoRoot,
  'curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_math_upper_secondary_source_extraction_to_canonical_math.review.json',
)
const sourceLandscapeId = '2796fc7b-ba9d-446f-8f26-711dd6d8a9a3'
const expectedTopicCodes = [
  'E.1',
  'E.2',
  'E.3',
  'E.4',
  'E.5',
  'E.6',
  'E.7',
  'Q1.1',
  'Q1.2',
  'Q1.3',
  'Q1.4',
  'Q1.5',
  'Q2.1',
  'Q2.2',
  'Q2.3',
  'Q2.4',
  'Q2.5',
  'Q3.1',
  'Q3.2',
  'Q3.3',
  'Q3.4',
  'Q3.5',
  'Q4.1',
  'Q4.2',
  'Q4.3',
]

type Passage = {
  id: string
  topicCode: string
  title: string
  text: string
  page: number
  sourcePath: string
}

type SourceGoal = {
  id: string
  passageId: string
  topicCode: string
  bulletIndex: number
  aspectIndex: number
  title: string
  description: string
  sourceText: string
  sourceSpan: string
  parentBulletText: string
  sourceRef: string
  courseLevel: 'GK_LK' | 'LK' | 'unspecified'
  granularity: 'officialAspect'
  tags: string[]
}

type PipelineCheck = {
  id: string
  label: string
  passed: boolean
  details: string
}

type PipelineStep = {
  id: 'MAPPING-1' | 'MAPPING-2' | 'MAPPING-3'
  label: string
  status: 'complete' | 'incomplete' | 'blocked'
  dependsOn: string[]
  checks: PipelineCheck[]
}

type MappingReviewDecision = {
  sourceGoalId?: unknown
  decision?: unknown
  canonicalGoalIds?: unknown
}

type MappingReviewDocument = {
  decisions?: MappingReviewDecision[]
  mappings?: Array<{
    legacyGoalId?: unknown
    canonicalGoalId?: unknown
  }>
}

type CanonicalMathDocument = {
  goals?: Array<{
    id?: unknown
  }>
}

const toPosix = (value: string) => value.split(path.sep).join('/')
const sourcePdfRelativePath = toPosix(path.relative(repoRoot, sourcePdfPath))
const mappingReviewRelativePath = toPosix(path.relative(repoRoot, mappingReviewPath))

const readJsonIfExists = <T>(filePath: string): T | null => {
  if (!existsSync(filePath)) return null
  try {
    return JSON.parse(readFileSync(filePath, 'utf8')) as T
  } catch {
    return null
  }
}

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
    : []

const topicHeadingPattern = /^\s*((?:E|Q[1-4])(?:\.\d+){1,2}[a-z]?)\s+(.+?)\s*$/u
const chromeLinePattern = /^(?:HMKB(?: Kerncurriculum)?|Kerncurriculum|Mathematik gymnasiale Oberstufe|\d+)$/u
const q42DomainHeadingPattern = /^(?:Analysis|Analytische Geometrie|Lineare Algebra|Stochastik):?$/iu

const normalizeGermanText = (value: string): string =>
  value
    .replace(/Ã„/gu, 'Ä')
    .replace(/Ã–/gu, 'Ö')
    .replace(/Ãœ/gu, 'Ü')
    .replace(/Ã¤/gu, 'ä')
    .replace(/Ã¶/gu, 'ö')
    .replace(/Ã¼/gu, 'ü')
    .replace(/ÃŸ/gu, 'ß')
    .replace(/Â°/gu, '°')
    .replace(/Â²/gu, '²')
    .replace(/Â³/gu, '³')
    .replace(/Â·/gu, '·')
    .replace(/Â /gu, ' ')
    .replace(/Â/gu, '')
    .replace(/â€“/gu, '–')
    .replace(/â€”/gu, '—')
    .replace(/â€ž/gu, '„')
    .replace(/â€œ/gu, '“')
    .replace(/â€\u009c/gu, '“')
    .replace(/â€˜/gu, '‘')
    .replace(/â€™/gu, '’')
    .replace(/â†’/gu, '→')
    .replace(/âˆž/gu, '∞')
    .replace(/Durchschnittsund/gu, 'Durchschnitts- und')
    .normalize('NFC')

const normalizeLine = (line: string): string =>
  normalizeGermanText(line)
    .replace(/\u00a0/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim()

const normalizeMathSymbols = (value: string): string =>
  normalizeGermanText(value)
    .replace(//gu, '+')
    .replace(//gu, '-')
    .replace(//gu, '=')
    .replace(//gu, 'Φ')
    .replace(//gu, 'Ω')
    .replace(//gu, 'φ')
    .replace(//gu, 'μ')
    .replace(//gu, 'π')
    .replace(//gu, 'σ')
    .replace(/ℝ/gu, 'ℝ')
    .replace(//gu, "'")
    .replace(//gu, '∞')
    .replace(//gu, '→')
    .replace(//gu, '∩')
    .replace(//gu, '∪')
    .replace(//gu, '∈')
    .replace(//gu, '·')
    .replace(//gu, '∧')
    .replace(/[]/gu, '(')
    .replace(/[]/gu, ')')
    .replace(/[]/gu, '[')
    .replace(/[]/gu, ']')
    .replace(//gu, '∫')
    .replace(/\bZZ\b/gu, 'ℤ')
    .replace(/\bQ I\b/gu, 'ℚ')

const latexifyCurriculumMath = (input: string): string => {
  const mathSegments: string[] = []
  const math = (latex: string) => {
    const token = `@@MATH_${mathSegments.length}@@`
    mathSegments.push(latex)
    return token
  }

  let value = normalizeMathSymbols(input)
    .replace(/\b1\s*\(\s*x\s*-μ\s*\)\s*1\s*-\s*\(\s*\)\s*(Dichtefunktion)/gu, '$1')
    .replace(/,\s*2πσ2\s+Zuordnen/gu, ', Zuordnen')
    .replace(/\bx\s+(Verteilungsfunktion der Normalverteilung)/gu, '$1')
    .replace(/Wahr-\s*-∞\s*scheinlichkeiten/gu, 'Wahrscheinlichkeiten')
    .replace(/\s+\[\[\s*n\s*n\s*\]\]/gu, '')

  const replace = (pattern: RegExp, latex: string) => {
    value = value.replace(pattern, () => math(latex))
  }

  value = value.replace(
    /einfachen gebrochen rationalen Funktionen f\(x\)\s*=\s*n und von der einfachen Wurzelfunktion f\(x\)\s*=\s*x/gu,
    () => `einfachen gebrochen rationalen Funktionen ${math(String.raw`f(x)=\frac{1}{x^n}`)} und von der einfachen Wurzelfunktion ${math(String.raw`f(x)=\sqrt{x}`)}`,
  )
  value = value.replace(/Ableiten diex ser Funktionen/gu, 'Ableiten dieser Funktionen')
  value = value.replace(
    /die natürliche Logarithmusfunktion als Stammfunktion von x\b/gu,
    () => `die natürliche Logarithmusfunktion als Stammfunktion von ${math(String.raw`\frac{1}{x}`)}`,
  )

  replace(/\(n\)\s*P\(X\s*=\s*k\)\s*=\s*\(\s*\)\s*·\s*pk\s*·\s*\(1\s*-\s*p\)n-k/gu, String.raw`P(X=k)=\binom{n}{k}\cdot p^k\cdot(1-p)^{n-k}`)
  replace(/z\s*=\s*eiωt\s*=\s*cos\(ωt\)\s*\+\s*i\s*·\s*sin\(ωt\)/gu, String.raw`z=e^{i\omega t}=\cos(\omega t)+i\cdot\sin(\omega t)`)
  value = value.replace(
    /Verteilungsfunktion der Normalverteilung\s*Φμ,σ\s*\(x\)\s*=\s*∫\s*φμ,σ\s*\(t\)dt/gu,
    () => `Verteilungsfunktion der Normalverteilung ${math(String.raw`\Phi_{\mu,\sigma}(x)=\int_{-\infty}^{x}\varphi_{\mu,\sigma}(t)\,dt`)}`,
  )
  value = value.replace(
    /Dichtefunktion\s+.*?Abgrenzen/gu,
    () => `Dichtefunktion ${math(String.raw`\varphi_{\mu,\sigma}(x)=\frac{1}{\sqrt{2\pi\sigma^2}}e^{-\frac12\left(\frac{x-\mu}{\sigma}\right)^2}`)}, Abgrenzen`,
  )
  replace(/f\(x\)\s*=\s*x\s*n\s*mit\s*n\s*∈\s*ℤ\s*\\\s*\{\s*-1\}/gu, String.raw`f(x)=x^n,\ n\in\mathbb{Z}\setminus\{-1\}`)
  replace(/f\(x\)\s*=\s*x\s*n\s*mit\s*n\s*∈\s*ℤ/gu, String.raw`f(x)=x^n,\ n\in\mathbb{Z}`)
  replace(/f\(x\)\s*=\s*ln\(x\)/gu, String.raw`f(x)=\ln(x)`)
  replace(/g\(x\)\s*=\s*a\s*·\s*f\(x\)\s*\+\s*b/gu, String.raw`g(x)=a\cdot f(x)+b`)
  replace(/f\(x\)\s*=\s*a\s*·\s*b\s*x\s*\+\s*c/gu, String.raw`f(x)=a\cdot b^x+c`)
  replace(/f\(x\)\s*=\s*e\s*x/gu, String.raw`f(x)=e^x`)
  replace(/\be\s+x\b/gu, String.raw`e^x`)
  replace(/f\(x\)\s*=\s*a\s*·\s*ekx\s*\+c\s*\+\s*b/gu, String.raw`f(x)=a\cdot e^{kx+c}+b`)
  replace(/f\(x\)\s*=\s*\(ax\s*\+\s*b\)\s*·\s*ekx/gu, String.raw`f(x)=(ax+b)\cdot e^{kx}`)
  replace(/f\(x\)\s*=\s*a\s*·\s*sin\[b\s*·\s*\(x\s*-\s*c\)\]\s*\+\s*d/gu, String.raw`f(x)=a\cdot\sin(b\cdot(x-c))+d`)
  replace(/f\(x\)\s*=\s*a\s*·\s*cos\[b\s*·\s*\(x\s*-\s*c\)\]\s*\+\s*d/gu, String.raw`f(x)=a\cdot\cos(b\cdot(x-c))+d`)
  replace(/g\(x\)\s*=\s*a\s*·\s*f\(b\s*·\s*\(x\s*-\s*c\)\)\s*\+\s*d/gu, String.raw`g(x)=a\cdot f(b\cdot(x-c))+d`)
  replace(/f\(x\)\s*\+\s*g\(x\)/gu, String.raw`f(x)+g(x)`)
  replace(/f\(x\)\s*·\s*g\(x\)/gu, String.raw`f(x)\cdot g(x)`)
  replace(/f\(g\(x\)\)/gu, String.raw`f(g(x))`)
  replace(/sin\[b\s*·\s*\(x\s*-\s*c\)\]/gu, String.raw`\sin(b\cdot(x-c))`)
  replace(/cos\[b\s*·\s*\(x\s*-\s*c\)\]/gu, String.raw`\cos(b\cdot(x-c))`)
  replace(/\bsin\(x\)/gu, String.raw`\sin(x)`)
  replace(/\bcos\(x\)/gu, String.raw`\cos(x)`)
  replace(/M²/gu, String.raw`M^2`)
  replace(/\(ax\s*\+\s*b\)r\s*mit\s*r\s*∈\s*ℚ\s*\\\s*\{\s*-1\}/gu, String.raw`(ax+b)^r,\ r\in\mathbb{Q}\setminus\{-1\}`)
  replace(/g\(x\)\s*=\s*f\s*'\(x\)\s*·\s*e\s*f\s*\(\s*x\s*\)/gu, String.raw`g(x)=f'(x)\cdot e^{f(x)}`)
  replace(/eax\s*\+b/gu, String.raw`e^{ax+b}`)
  replace(/s\s*=\s*v\s*·\s*t/gu, String.raw`s=v\cdot t`)
  replace(/n\s*u1\s*=\s*0\s*∧\s*n\s*u2\s*=\s*0/gu, String.raw`\vec n\cdot\vec u_1=0\land\vec n\cdot\vec u_2=0`)
  value = value
    .replace(/Komplementärmenge A\s*=\s*Ω\s*\\\s*A\s*\)/gu, () =>
      `Komplementärmenge ${math(String.raw`\overline{A}=\Omega\setminus A`)})`)
    .replace(/A\s*\\\s*B\s*=\s*A\s*∩\s*B\s*\(Differenzmenge\)/gu, () =>
      `${math(String.raw`A\setminus B=A\cap\overline{B}`)} (Differenzmenge)`)
    .replace(/A\s*∪\s*B\s*=\s*A\s*∩\s*B/gu, () =>
      math(String.raw`\overline{A\cup B}=\overline{A}\cap\overline{B}`))
  replace(/A\s*∪\s*B/gu, String.raw`A\cup B`)
  replace(/A\s*∩\s*B/gu, String.raw`A\cap B`)
  replace(/A\s*=\s*Ω\s*\\\s*A/gu, String.raw`A=\Omega\setminus A`)
  replace(/n\s*→\s*∞/gu, String.raw`n\to\infty`)
  value = value.replace(
    /Bestimmen des Prognoseinter-\s*.*?valls\s*.*?in verschiedenen Sachzusammenhängen/gu,
    () => `Bestimmen des Prognoseintervalls ${math(String.raw`\left[p-c\sqrt{\frac{p(1-p)}{n}};\ p+c\sqrt{\frac{p(1-p)}{n}}\right]`)} in verschiedenen Sachzusammenhängen`,
  )
  value = value.replace(
    /mithilfe des Lösens der\s+p\s*·\s*\(1\s*-\s*p\)\s*Gleichung\s*hn\s*-\s*p\s*=\s*c\s*·\s*durch Quadrieren/gu,
    () => `mithilfe des Lösens der Gleichung ${math(String.raw`h_n-p=c\sqrt{\frac{p(1-p)}{n}}`)} durch Quadrieren`,
  )
  value = value.replace(
    /Betrachtung der Vereinfachung\s*n\s*hn\s*·\s*\(1\s*-\s*hn\s*\)\s*hn\s*-\s*p\s*=\s*c\s*·\s*\(symmetrisches Intervall bezüglich hn\)\s*n/gu,
    () => `Betrachtung der Vereinfachung ${math(String.raw`h_n-p=c\sqrt{\frac{h_n(1-h_n)}{n}}`)} (symmetrisches Intervall bezüglich ${math(String.raw`h_n`)})`,
  )
  value = value
    .replace(/Komplementärmenge A\s*=\s*Ω\s*\\\s*A\s*\)/gu, () =>
      `Komplementärmenge ${math(String.raw`\overline{A}=\Omega\setminus A`)})`)
    .replace(/Komplementärmenge\s+\$A=\\Omega\\setminus A\$\s*\)/gu, () =>
      `Komplementärmenge ${math(String.raw`\overline{A}=\Omega\setminus A`)})`)
    .replace(/A\s*\\\s*B\s*=\s*A\s*∩\s*B\s*\(Differenzmenge\)/gu, () =>
      `${math(String.raw`A\setminus B=A\cap\overline{B}`)} (Differenzmenge)`)
    .replace(/A\s*\\\s*B\s*=\s*\$A\\cap B\$\s*\(Differenzmenge\)/gu, () =>
      `${math(String.raw`A\setminus B=A\cap\overline{B}`)} (Differenzmenge)`)
    .replace(/A\s*∪\s*B\s*=\s*A\s*∩\s*B/gu, () =>
      math(String.raw`\overline{A\cup B}=\overline{A}\cap\overline{B}`))
    .replace(/\$A\\cup B\$\s*=\s*\$A\\cap B\$/gu, () =>
      math(String.raw`\overline{A\cup B}=\overline{A}\cap\overline{B}`))

  value = value
    .replace(/\bIR3\b/gu, () => math(String.raw`\mathbb{R}^3`))
    .replace(/ℂ/gu, () => math(String.raw`\mathbb{C}`))
    .replace(/ℝ/gu, () => math(String.raw`\mathbb{R}`))
    .replace(/ℤ/gu, () => math(String.raw`\mathbb{Z}`))
    .replace(/ℚ/gu, () => math(String.raw`\mathbb{Q}`))
    .replace(/Ω/gu, () => math(String.raw`\Omega`))
    .replace(/(\d+(?:,\d+)?)\s*σ/gu, (_, numericValue: string) =>
      math(`${numericValue.replace(',', String.raw`{,}`)}\\sigma`))

  return value.replace(/@@MATH_(\d+)@@/gu, (_, index: string) => {
    const segment = mathSegments[Number(index)] ?? ''
    return segment ? `$${segment}$` : ''
  }).replace(/\$\s+([,.;])/gu, (_, punctuation: string) => `$${punctuation}`)
}

const isChromeLine = (line: string): boolean => {
  const normalized = normalizeLine(line)
  return !normalized || chromeLinePattern.test(normalized)
}

const formatPassageText = (lines: string[]): string => {
  const joined = lines
    .filter((line) => !isChromeLine(line))
    .join('\n')
    .replace(/(\p{L})- *\n\s*(\p{Ll})/gu, '$1$2')

  const paragraphs: string[] = []
  let current = ''

  const flush = () => {
    if (current.trim()) paragraphs.push(current.trim())
    current = ''
  }

  for (const rawLine of joined.split(/\n/u)) {
    const line = normalizeLine(rawLine)
    if (!line) {
      flush()
      continue
    }
    if (/^[–-]\s/u.test(line)) {
      flush()
      current = line
      continue
    }
    if (/^(grundlegendes Niveau|erhöhtes Niveau)\b/iu.test(line)) {
      flush()
      paragraphs.push(line)
      continue
    }
    if (!current) {
      current = line
      continue
    }
    current = `${current}${current.endsWith(':') ? '\n  ' : ' '}${line}`
  }
  flush()

  return paragraphs.join('\n')
}

const detachQ42DomainHeading = (value: string): string =>
  value
    .replace(/:\s+(Analysis)\s*$/u, ':\n$1')
    .replace(/,\s+(Analytische Geometrie|Lineare Algebra|Stochastik):\s*$/u, '\n$1:')
    .replace(/\s+(Analytische Geometrie|Lineare Algebra|Stochastik):\s*$/u, '\n$1:')

const cleanPassageParagraph = (paragraph: string): string =>
  detachQ42DomainHeading(paragraph
    .replace(/\s+HMKB\s+Kerncurriculum.*$/su, '')
    .replace(/\s+Q[1-4]\s+(?:Analysis|Analytische Geometrie|Stochastik|Funktionenscharen)\b.*$/su, '')
    .replace(/\s+Hessisches Ministerium.*$/su, '')
    .replace(/\s+https?:\/\/\S+.*$/su, '')
    .replace(/Wahr-\s*(?:\(k\s*\)|k\s*)\s*scheinlichkeiten/gu, 'Wahrscheinlichkeiten')
    .replace(/\(einschließlich Mantel- und Oberflächen\)\s+Beschreiben/gu, '(einschließlich Mantel- und Oberflächen); Beschreiben')
    .replace(/\s+/gu, ' ')
    .trim())
    .replace(/:\s+/gu, ':\n  ')
    .trim()

const retainRelevantPassageText = (text: string): string => {
  const retained: string[] = []
  let current = ''

  const flush = () => {
    const cleaned = cleanPassageParagraph(current)
    if (
      cleaned
      && (/^[–-]\s/u.test(cleaned)
        || /^(grundlegendes Niveau|erhöhtes Niveau)\b/iu.test(cleaned)
        || q42DomainHeadingPattern.test(cleaned))
    ) {
      retained.push(cleaned)
    }
    current = ''
  }

  for (const line of text.split(/\n/u)) {
    if (/^[–-]\s/u.test(line)
      || /^(grundlegendes Niveau|erhöhtes Niveau)\b/iu.test(line)
      || q42DomainHeadingPattern.test(line.trim())) {
      flush()
      current = line
      continue
    }
    if (current && /^[–-]\s/u.test(current) && line.trim()) {
      current = `${current}\n${line}`
    }
  }
  flush()

  return retained.join('\n')
}

const extractPassages = (pdfText: string): Passage[] => {
  const pages = pdfText.split(/\f/u)
  const candidates: Passage[] = []
  let current: { topicCode: string; title: string; page: number; lines: string[] } | null = null

  const flush = () => {
    if (!current) return
    const text = retainRelevantPassageText(formatPassageText(current.lines))
    if (text.length >= 80 && /(^|\n)[–-]\s/u.test(text)) {
      candidates.push({
        id: `he-math-sekii:${current.topicCode}`,
        topicCode: current.topicCode,
        title: `${current.topicCode} ${current.title}`,
        text,
        page: current.page,
        sourcePath: sourcePdfRelativePath,
      })
    }
    current = null
  }

  pages.forEach((page, pageIndex) => {
    for (const line of page.split(/\n/u)) {
      const headingMatch = line.match(topicHeadingPattern)
      if (headingMatch) {
        flush()
        current = {
          topicCode: headingMatch[1] ?? '',
          title: normalizeLine(headingMatch[2] ?? ''),
          page: pageIndex + 1,
          lines: [],
        }
        continue
      }
      if (current) current.lines.push(line)
    }
  })
  flush()

  const byTopic = new Map<string, Passage>()
  for (const passage of candidates) {
    const previous = byTopic.get(passage.topicCode)
    if (!previous || passage.text.length > previous.text.length) byTopic.set(passage.topicCode, passage)
  }

  return [...byTopic.values()].sort((left, right) =>
    left.topicCode.localeCompare(right.topicCode, 'de-DE', { numeric: true }))
}

const stableId = (topicCode: string, bulletIndex: number, aspectIndex: number): string => {
  const key = `${sourceLandscapeId}:${topicCode}:${bulletIndex}:${aspectIndex}`
  return `he-math-sekii-${topicCode.toLowerCase().replace(/\./gu, '-')}-b${String(bulletIndex).padStart(2, '0')}-a${String(aspectIndex).padStart(2, '0')}-${createHash('sha1').update(key).digest('hex').slice(0, 8)}`
}

const titleFromAspect = (context: string, span: string): string => {
  const prefix = context.length > 0 && context.length <= 45 ? `${context}: ` : ''
  const basis = `${prefix}${span}`
  const cleaned = basis
    .replace(/\s+/gu, ' ')
    .replace(/[.;,]\s*$/u, '')
    .trim()
  if (cleaned.length <= 95) return cleaned
  if (cleaned.includes('$')) {
    const formulaSafe = cleaned.replace(/\$[^$]*\$/gu, 'Formel')
    if (formulaSafe.length <= 95) return formulaSafe
    return `${formulaSafe.slice(0, 92).trim()}...`
  }
  return `${cleaned.slice(0, 92).trim()}...`
}

const hasFormulaArtifactTitle = (title: string): boolean =>
  /(?:Prognoseinter-|\[\s*p\s*·|n\s+h_n\s*·|n\s+hn\s*·|\[\[\s*n\s*n\s*\]\])/u.test(title)

const hasUnbalancedInlineMath = (value: string): boolean =>
  ((value.match(/\$/gu) ?? []).length % 2) !== 0

const descriptionFromAspect = (context: string, span: string): string => {
  const contextSuffix = context ? ` im Kontext "${context}"` : ''
  return `Die lernende Person kann den offiziellen Curriculum-Aspekt "${span}"${contextSuffix} fachgerecht bearbeiten.`
}

const normalizeBullet = (bullet: string): string =>
  normalizeMathSymbols(cleanPassageParagraph(bullet))
    .replace(/^[–-]\s*/u, '')
    .replace(/Wahr-\s*-∞\s*scheinlichkeiten/gu, 'Wahrscheinlichkeiten')
    .replace(/Wahr-\s*\(k\s*\)\s*scheinlichkeiten/gu, 'Wahrscheinlichkeiten')
    .replace(/\s+/gu, ' ')
    .trim()

const stripTrailingDomainHeading = (value: string): string =>
  value.replace(/(?:,\s*|\s+)(?:Analysis|Analytische Geometrie|Lineare Algebra|Stochastik):?\s*$/iu, '').trim()

const needsFormulaProtectedAspectSplitting = (value: string): boolean =>
  /Dichtefunktion\s+.*?φμ,σ/u.test(value)
  || /Verteilungsfunktion der Normalverteilung\s+Φμ,σ/u.test(value)

const splitTopLevelEnumeration = (value: string): string[] => {
  const parts: string[] = []
  let depth = 0
  let inInlineMath = false
  let current = ''

  const push = () => {
    const cleaned = stripTrailingDomainHeading(current)
      .replace(/\s+/gu, ' ')
      .replace(/[.;,]\s*$/u, '')
      .trim()
    if (cleaned && !q42DomainHeadingPattern.test(cleaned)) parts.push(cleaned)
    current = ''
  }

  for (const char of value) {
    if (char === '$') inInlineMath = !inInlineMath
    if (!inInlineMath && (char === '(' || char === '[' || char === '{')) depth += 1
    if (!inInlineMath && (char === ')' || char === ']' || char === '}')) depth = Math.max(0, depth - 1)
    if ((char === ',' || char === ';') && depth === 0 && !inInlineMath) {
      push()
      continue
    }
    current += char
  }
  push()

  const merged: string[] = []
  for (const part of parts) {
    const previousPart = merged[merged.length - 1] ?? ''
    const shouldAttach = merged.length > 0 && (
      /^(?:insbesondere|zum Beispiel|z\. ?B\.|beziehungsweise|gegebenenfalls)\b/iu.test(part)
      || /^(?:die|der|das)\s+(?:von|durch|mit)\b/iu.test(part)
      || /^auch\s+(?:in|allgemein|durch)\b/iu.test(part)
      || /^bei denen\b/iu.test(part)
      || (/^Geraden und Ebenen(?: allgemein)?$/iu.test(part)
        && /(zwischen Punkten|Spiegeln von Punkten)$/iu.test(previousPart))
      || /^f\(x\)\s*/iu.test(part)
      || /^[a-zA-Z]\s*[=]/u.test(part)
      || part.length < 8
    )
    if (shouldAttach) {
      merged[merged.length - 1] = `${merged[merged.length - 1]}, ${part}`
    } else {
      merged.push(part)
    }
  }

  return merged.length > 0 ? merged : [value.trim()].filter(Boolean)
}

const extractAspectsFromBullet = (bullet: string): Array<{ context: string, span: string }> => {
  const normalizedBullet = normalizeBullet(bullet)
  const normalized = needsFormulaProtectedAspectSplitting(normalizedBullet)
    ? latexifyCurriculumMath(normalizedBullet)
    : normalizedBullet
  const colonIndex = normalized.indexOf(':')
  const hasContext = colonIndex > 0 && colonIndex <= 95
  const context = hasContext ? normalized.slice(0, colonIndex).trim() : ''
  const detail = hasContext ? normalized.slice(colonIndex + 1).trim() : normalized
  const spans = splitTopLevelEnumeration(detail)
  const sharedActionPrefix = spans[0]?.match(/^(Integrieren\s+von)\s+/u)?.[1]
  const sharedInvestigationPrefix = spans[0]?.match(/^(Untersuchung\s+von)\s+/u)?.[1]
  const actionCompletedSpans = sharedActionPrefix
    ? spans.map((span, index) => (index === 0 || span.startsWith(sharedActionPrefix)
      ? span
      : `${sharedActionPrefix} ${span}`))
    : spans
  const completedSpans = sharedInvestigationPrefix
    ? actionCompletedSpans.map((span, index) => (index === 0
      ? span
      : span.replace(/^sowie\s+von\s+/iu, `${sharedInvestigationPrefix} `)))
    : actionCompletedSpans

  return completedSpans
    .map(stripTrailingDomainHeading)
    .filter((span) => span.length > 0 && !q42DomainHeadingPattern.test(span))
    .map((span) => ({ context, span }))
}

const extractBulletGoals = (passage: Passage): SourceGoal[] => {
  const lines = passage.text.split(/\n/u)
  const bullets: Array<{ text: string; courseLevel: SourceGoal['courseLevel'] }> = []
  let currentLevel: SourceGoal['courseLevel'] = 'unspecified'

  for (const line of lines) {
    if (/^grundlegendes Niveau\b/iu.test(line)) {
      currentLevel = 'GK_LK'
      continue
    }
    if (/^erhöhtes Niveau\b/iu.test(line)) {
      currentLevel = 'LK'
      continue
    }
    if (q42DomainHeadingPattern.test(line.trim())) continue
    if (/^[–-]\s/u.test(line)) {
      bullets.push({ text: line, courseLevel: currentLevel })
      continue
    }
    if (bullets.length > 0) {
      const last = bullets[bullets.length - 1]
      last.text = `${last.text}\n${line}`
    }
  }

  return bullets.flatMap((bullet, index) => {
    const bulletIndex = index + 1
    const courseTags = bullet.courseLevel === 'LK'
      ? ['LK']
      : bullet.courseLevel === 'GK_LK'
        ? ['GK', 'LK']
        : []
    const aspects = extractAspectsFromBullet(bullet.text)
    return aspects.map((aspect, aspectIndexZeroBased) => {
      const aspectIndex = aspectIndexZeroBased + 1
      const id = stableId(passage.topicCode, bulletIndex, aspectIndex)
      return {
        id,
        passageId: passage.id,
        topicCode: passage.topicCode,
        bulletIndex,
        aspectIndex,
        title: titleFromAspect(aspect.context, aspect.span),
        description: descriptionFromAspect(aspect.context, aspect.span),
        sourceText: bullet.text,
        sourceSpan: aspect.span,
        parentBulletText: normalizeBullet(bullet.text),
        sourceRef: `HMKB Kerncurriculum Mathematik gymnasiale Oberstufe, ${passage.topicCode}, S. ${passage.page}, Spiegelstrich ${bulletIndex}, Aspekt ${aspectIndex}`,
        courseLevel: bullet.courseLevel,
        granularity: 'officialAspect',
        tags: ['source-goal', `topic:${passage.topicCode}`, `bullet:${bulletIndex}`, ...courseTags],
      }
    })
  })
}

const pdfText = execFileSync('pdftotext', ['-layout', sourcePdfPath, '-'], { encoding: 'utf8' })
const passages = extractPassages(pdfText)
const sourceGoals = passages.flatMap(extractBulletGoals)

const sourceGoalIdsByPassageId = new Map<string, string[]>()
for (const goal of sourceGoals) {
  const ids = sourceGoalIdsByPassageId.get(goal.passageId) ?? []
  ids.push(goal.id)
  sourceGoalIdsByPassageId.set(goal.passageId, ids)
}

const renderedPassages = passages.map((passage) => ({
  ...passage,
  rawText: passage.text,
  text: latexifyCurriculumMath(passage.text),
  sourceGoalIds: sourceGoalIdsByPassageId.get(passage.id) ?? [],
}))

const renderedSourceGoals = sourceGoals.map((goal) => {
  const renderedSourceSpan = latexifyCurriculumMath(goal.sourceSpan)
  const renderedTitle = latexifyCurriculumMath(goal.title)

  return {
    ...goal,
    rawSourceText: goal.sourceText,
    rawSourceSpan: goal.sourceSpan,
    rawParentBulletText: goal.parentBulletText,
    title: hasFormulaArtifactTitle(renderedTitle) || hasUnbalancedInlineMath(renderedTitle)
      ? titleFromAspect('', renderedSourceSpan)
      : renderedTitle,
    description: latexifyCurriculumMath(goal.description),
    sourceText: latexifyCurriculumMath(goal.sourceText),
    sourceSpan: renderedSourceSpan,
    parentBulletText: latexifyCurriculumMath(goal.parentBulletText),
  }
})

const hasSuspiciousText = (value: string): boolean =>
  /(?:Ã.|Â.|�|\uFFFD|[\uF000-\uF8FF])/u.test(value) || value !== value.normalize('NFC')

const countDuplicates = (values: string[]): string[] => {
  const counts = new Map<string, number>()
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1))
  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([value]) => value)
}

const check = (id: string, label: string, passed: boolean, details: string): PipelineCheck => ({
  id,
  label,
  passed,
  details,
})

const topicCodes = renderedPassages.map((passage) => passage.topicCode)
const missingTopicCodes = expectedTopicCodes.filter((topicCode) => !topicCodes.includes(topicCode))
const unexpectedTopicCodes = topicCodes.filter((topicCode) => !expectedTopicCodes.includes(topicCode))
const duplicateTopicCodes = countDuplicates(topicCodes)
const duplicateSourceGoalIds = countDuplicates(renderedSourceGoals.map((goal) => goal.id))
const passageIds = new Set(renderedPassages.map((passage) => passage.id))
const sourceGoalsWithMissingPassage = renderedSourceGoals
  .filter((goal) => !passageIds.has(goal.passageId))
  .map((goal) => goal.id)
const passagesWithoutSourceGoals = renderedPassages
  .filter((passage) => passage.sourceGoalIds.length === 0)
  .map((passage) => passage.topicCode)
const sourceGoalsWithIncompleteTrace = renderedSourceGoals
  .filter((goal) => !goal.sourceSpan.trim() || !goal.sourceRef.trim() || !goal.parentBulletText.trim())
  .map((goal) => goal.id)
const passageEncodingIssues = renderedPassages
  .filter((passage) => hasSuspiciousText([passage.title, passage.text].join('\n')))
  .map((passage) => passage.topicCode)
const sourceGoalEncodingIssues = renderedSourceGoals
  .filter((goal) => hasSuspiciousText([
    goal.title,
    goal.description,
    goal.sourceText,
    goal.sourceSpan,
    goal.parentBulletText,
  ].join('\n')))
  .map((goal) => goal.id)

const passageChecks = [
  check(
    'expected-topic-coverage',
    'Alle erwarteten Themenfelder sind als Lehrplanpassagen vorhanden',
    missingTopicCodes.length === 0 && unexpectedTopicCodes.length === 0,
    `${renderedPassages.length}/${expectedTopicCodes.length} Themenfelder; fehlend: ${missingTopicCodes.join(', ') || '-'}; unerwartet: ${unexpectedTopicCodes.join(', ') || '-'}`,
  ),
  check(
    'unique-topic-passages',
    'Jedes Themenfeld hat genau eine Passage',
    duplicateTopicCodes.length === 0,
    `Doppelte Themenfelder: ${duplicateTopicCodes.join(', ') || '-'}`,
  ),
  check(
    'passage-text-present',
    'Jede Passage enthält offiziellen Text',
    renderedPassages.every((passage) => passage.text.trim().length >= 80 && /(^|\n)[–-]\s/u.test(passage.text)),
    `${renderedPassages.filter((passage) => passage.text.trim().length >= 80 && /(^|\n)[–-]\s/u.test(passage.text)).length}/${renderedPassages.length} Passagen mit Spiegelstrichtext`,
  ),
  check(
    'passage-encoding-clean',
    'Umlaute/Encoding und mathematische Anzeigezeichen sind bereinigt',
    passageEncodingIssues.length === 0,
    `Auffällige Passagen: ${passageEncodingIssues.join(', ') || '-'}`,
  ),
]
const sourceGoalChecks = [
  check(
    'source-goals-exist',
    'Aus den Passagen wurden Source-Ziele erzeugt',
    renderedSourceGoals.length > 0,
    `${renderedSourceGoals.length} Source-Ziele`,
  ),
  check(
    'passage-to-source-goal-coverage',
    'Jede Passage hat mindestens ein Source-Ziel',
    passagesWithoutSourceGoals.length === 0,
    `Passagen ohne Source-Ziele: ${passagesWithoutSourceGoals.join(', ') || '-'}`,
  ),
  check(
    'source-goal-ids-unique',
    'Source-Ziel-IDs sind eindeutig',
    duplicateSourceGoalIds.length === 0,
    `Doppelte IDs: ${duplicateSourceGoalIds.join(', ') || '-'}`,
  ),
  check(
    'source-goals-reference-passages',
    'Jedes Source-Ziel referenziert eine vorhandene Passage',
    sourceGoalsWithMissingPassage.length === 0,
    `Source-Ziele ohne Passage: ${sourceGoalsWithMissingPassage.slice(0, 8).join(', ') || '-'}`,
  ),
  check(
    'source-goal-trace-complete',
    'Jedes Source-Ziel hat Source-Span, Parent-Bullet und Quellenreferenz',
    sourceGoalsWithIncompleteTrace.length === 0,
    `Unvollständige Source-Ziele: ${sourceGoalsWithIncompleteTrace.slice(0, 8).join(', ') || '-'}`,
  ),
  check(
    'source-goal-encoding-clean',
    'Source-Ziele enthalten keine kaputten Umlaute oder PDF-Private-Use-Zeichen',
    sourceGoalEncodingIssues.length === 0,
    `Auffällige Source-Ziele: ${sourceGoalEncodingIssues.slice(0, 8).join(', ') || '-'}`,
  ),
]

const mappingReview = readJsonIfExists<MappingReviewDocument>(mappingReviewPath)
const canonicalMath = readJsonIfExists<CanonicalMathDocument>(canonicalMathPath)
const sourceGoalIdSet = new Set(renderedSourceGoals.map((goal) => goal.id))
const canonicalGoalIdSet = new Set(
  (canonicalMath?.goals ?? [])
    .map((goal) => goal.id)
    .filter((goalId): goalId is string => typeof goalId === 'string' && goalId.trim().length > 0),
)
const mappingReviewDecisions = (mappingReview?.decisions ?? [])
  .filter((decision) => typeof decision.sourceGoalId === 'string')
  .map((decision) => ({
    sourceGoalId: String(decision.sourceGoalId),
    decision: String(decision.decision ?? ''),
    canonicalGoalIds: asStringArray(decision.canonicalGoalIds),
  }))
const validMappingReviewDecisions = mappingReviewDecisions
  .filter((decision) => sourceGoalIdSet.has(decision.sourceGoalId))
const reviewedSourceGoalIds = new Set(validMappingReviewDecisions.map((decision) => decision.sourceGoalId))
const mappedSourceGoalIds = new Set(
  validMappingReviewDecisions
    .filter((decision) => decision.decision === 'mapped' && decision.canonicalGoalIds.length > 0)
    .map((decision) => decision.sourceGoalId),
)
const needsCanonicalGoalIds = validMappingReviewDecisions
  .filter((decision) => decision.decision === 'needs_canonical_goal')
  .map((decision) => decision.sourceGoalId)
const needsViewPlacementReviewIds = validMappingReviewDecisions
  .filter((decision) => decision.decision === 'needs_view_placement_review')
  .map((decision) => decision.sourceGoalId)
const duplicateMappingReviewDecisionIds = Array.from(
  mappingReviewDecisions.reduce((counts, decision) => {
    counts.set(decision.sourceGoalId, (counts.get(decision.sourceGoalId) ?? 0) + 1)
    return counts
  }, new Map<string, number>()),
)
  .filter(([, count]) => count > 1)
  .map(([sourceGoalId]) => sourceGoalId)
const invalidMappingReviewSourceGoalIds = mappingReviewDecisions
  .map((decision) => decision.sourceGoalId)
  .filter((sourceGoalId) => !sourceGoalIdSet.has(sourceGoalId))
const invalidMappingReviewTargetGoalIds = Array.from(new Set(
  validMappingReviewDecisions
    .flatMap((decision) => decision.canonicalGoalIds)
    .filter((canonicalGoalId) => !canonicalGoalIdSet.has(canonicalGoalId)),
))
const mappingEntries = mappingReview?.mappings ?? []
const invalidMappingEntrySourceGoalIds = Array.from(new Set(
  mappingEntries
    .map((entry) => String(entry.legacyGoalId ?? ''))
    .filter((goalId) => !sourceGoalIdSet.has(goalId)),
))
const invalidMappingEntryTargetGoalIds = Array.from(new Set(
  mappingEntries
    .map((entry) => String(entry.canonicalGoalId ?? ''))
    .filter((goalId) => !canonicalGoalIdSet.has(goalId)),
))
const m3Checks = [
  check(
    'm3-review-file-present',
    'M3-Review-Datei ist vorhanden',
    mappingReview !== null,
    mappingReview !== null ? mappingReviewRelativePath : `Fehlt: ${mappingReviewRelativePath}`,
  ),
  check(
    'm3-review-decisions-reference-source-goals',
    'M3-Review-Entscheidungen referenzieren gültige Source-Ziele',
    duplicateMappingReviewDecisionIds.length === 0 && invalidMappingReviewSourceGoalIds.length === 0,
    `Doppelte Entscheidungen: ${duplicateMappingReviewDecisionIds.join(', ') || '-'}; unbekannte Source-Ziele: ${invalidMappingReviewSourceGoalIds.slice(0, 8).join(', ') || '-'}`,
  ),
  check(
    'm3-review-targets-exist',
    'M3-Review-Ziele referenzieren vorhandene Canonical-Ziele',
    invalidMappingReviewTargetGoalIds.length === 0 && invalidMappingEntryTargetGoalIds.length === 0,
    `Unbekannte Review-Targets: ${invalidMappingReviewTargetGoalIds.slice(0, 8).join(', ') || '-'}; unbekannte Mapping-Targets: ${invalidMappingEntryTargetGoalIds.slice(0, 8).join(', ') || '-'}`,
  ),
  check(
    'm3-mapping-entries-reference-source-goals',
    'Persistierte Mapping-Einträge referenzieren gültige Source-Ziele',
    invalidMappingEntrySourceGoalIds.length === 0,
    `Unbekannte Mapping-Source-Ziele: ${invalidMappingEntrySourceGoalIds.slice(0, 8).join(', ') || '-'}`,
  ),
  check(
    'm3-all-source-goals-reviewed',
    'Alle Source-Ziele haben eine fachliche M3-Entscheidung',
    reviewedSourceGoalIds.size === renderedSourceGoals.length,
    `${reviewedSourceGoalIds.size}/${renderedSourceGoals.length} Source-Ziele reviewed; gemappt: ${mappedSourceGoalIds.size}; Canonical-Lücken: ${needsCanonicalGoalIds.length}; Placement-Review: ${needsViewPlacementReviewIds.length}`,
  ),
  check(
    'm3-all-source-goals-covered-by-canonical',
    'Alle akzeptierten Source-Ziele sind durch SkillPilot-Ziele abgedeckt',
    mappedSourceGoalIds.size === renderedSourceGoals.length
      && needsCanonicalGoalIds.length === 0
      && needsViewPlacementReviewIds.length === 0,
    `Abgedeckt: ${mappedSourceGoalIds.size}/${renderedSourceGoals.length}; offene Canonical-Lücken: ${needsCanonicalGoalIds.slice(0, 8).join(', ') || '-'}; Placement-Review: ${needsViewPlacementReviewIds.slice(0, 8).join(', ') || '-'}`,
  ),
]

const isComplete = (checks: PipelineCheck[]): boolean => checks.every((entry) => entry.passed)
const step1Complete = isComplete(passageChecks)
const step2Complete = step1Complete && isComplete(sourceGoalChecks)
const step3Complete = step2Complete && isComplete(m3Checks)
const pipelineSteps: PipelineStep[] = [
  {
    id: 'MAPPING-1',
    label: 'Original-Lehrplanpassagen extrahiert',
    status: step1Complete ? 'complete' : 'incomplete',
    dependsOn: [],
    checks: passageChecks,
  },
  {
    id: 'MAPPING-2',
    label: 'Source-Ziele aus Lehrplanpassagen erstellt',
    status: step1Complete ? (step2Complete ? 'complete' : 'incomplete') : 'blocked',
    dependsOn: ['MAPPING-1'],
    checks: sourceGoalChecks,
  },
  {
    id: 'MAPPING-3',
    label: 'Source-Ziele auf SkillPilot-Ziele gemappt',
    status: step2Complete ? (step3Complete ? 'complete' : 'incomplete') : 'blocked',
    dependsOn: ['MAPPING-1', 'MAPPING-2'],
    checks: m3Checks,
  },
]
const nextOpenStep = pipelineSteps.find((step) => step.status !== 'complete')?.id ?? ''

const output = {
  schemaVersion: 1,
  extractionId: 'DE-HE-MATHEMATIK-SEKII-KC2024',
  sourceLandscapeId,
  jurisdiction: 'DE-HE',
  subject: 'Mathematik',
  stage: 'SekII',
  sourceDocument: {
    title: 'Kerncurriculum gymnasiale Oberstufe - Mathematik',
    path: sourcePdfRelativePath,
  },
  method: {
    passageExtraction: 'pdftotext -layout, segmented by official topic-field headings E.*, Q1.* to Q4.*',
    sourceGoalExtraction: 'one source goal per literal official aspect inside each bullet paragraph; original bullet text retained in sourceText',
  },
  expectedTopicCodes,
  pipelineStatus: {
    version: 1,
    currentStep: nextOpenStep,
    steps: pipelineSteps,
  },
  passages: renderedPassages,
  sourceGoals: renderedSourceGoals,
}

mkdirSync(path.dirname(outputPath), { recursive: true })
writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`)
console.log(`Wrote ${passages.length} passages and ${sourceGoals.length} source goals to ${toPosix(path.relative(repoRoot, outputPath))}`)
