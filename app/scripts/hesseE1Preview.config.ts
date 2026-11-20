import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, mergeConfig, type Plugin } from 'vite'
import baseConfig from '../vite.config'
import { CURRENT_TERMS_VERSION } from '../src/utils/legalTermsVersion'

const appRoot = resolve(import.meta.dirname, '..')
const runtime = process.env.SKILLPILOT_E1_PREVIEW_DIR
if (!runtime) throw new Error('Start this preview with scripts/preview_hessen_physics_e1.py.')

const scope = JSON.parse(readFileSync(resolve(appRoot,
  '../docs/concept/skill-graph/examples/hessen-physik-e1/umfang.json'), 'utf8'))
const profileFile = resolve(runtime, 'profiles.json')

const entry: Plugin = {
  name: 'hesse-e1-synthetic-profile-entry',
  configureServer(server) {
    server.middlewares.use((request, response, next) => {
      const url = new URL(request.url ?? '/', 'http://127.0.0.1')
      const match = /^\/(nativ|testlauf)\/(G8|G9)\/(E1|[ABCD])\/?$/.exec(url.pathname)
      if (!match || request.method !== 'GET') return next()
      const [, entryType, duration, part] = match
      if (entryType === 'testlauf' && !['A', 'B'].includes(part)) return next()
      const profiles = JSON.parse(readFileSync(profileFile, 'utf8'))
      const id = profiles[duration][entryType === 'nativ' ? 'viewer' : part]
      const goals = [...scope.ownAssessmentGoalIds, ...scope.childAssessmentGoalIds]
      const goal = part === 'E1' ? profiles[duration].E1 : goals['ABCD'.indexOf(part)]
      const keys = {
        skillpilot_id: id,
        skillpilot_role: 'learner',
        skillpilot_lang: url.searchParams.get('lang') === 'en' ? 'en' : 'de',
        skillpilot_learner_landscape: 'a0e13c56-c25f-4742-9272-3a1a603ee52e',
        skillpilot_terms_accepted_version: CURRENT_TERMS_VERSION,
      }
      response.setHeader('Cache-Control', 'no-store')
      response.setHeader('Referrer-Policy', 'no-referrer')
      response.setHeader('Content-Type', 'text/html; charset=utf-8')
      response.end('<!doctype html><meta charset="utf-8"><title>SkillPilot</title><script>' +
        'for(const [key,value] of Object.entries(' + JSON.stringify(keys) + '))localStorage.setItem(key,value);' +
        'location.replace(' + JSON.stringify('/learner/' + goal) + ')</script>')
    })
  },
}

export default defineConfig(async env => {
  const base = typeof baseConfig === 'function' ? await baseConfig(env) : await baseConfig
  return mergeConfig(base, {
    root: appRoot,
    cacheDir: resolve(runtime, 'vite-cache'),
    define: { 'import.meta.env.VITE_API_BASE': JSON.stringify('') },
    plugins: [entry],
  })
})
