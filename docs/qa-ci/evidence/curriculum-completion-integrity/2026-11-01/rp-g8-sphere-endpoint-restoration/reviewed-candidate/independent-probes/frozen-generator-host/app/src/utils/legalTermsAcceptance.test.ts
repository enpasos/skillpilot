import {
  acceptCurrentTerms,
  hasAcceptedCurrentTerms,
  TERMS_ACCEPTANCE_STORAGE_KEY,
} from './legalTermsAcceptance'
import { CURRENT_TERMS_VERSION } from './legalTermsVersion'

const assert = {
  equal(actual: unknown, expected: unknown, message = 'values differ') {
    if (actual !== expected) throw new Error(`${message}: ${String(actual)} !== ${String(expected)}`)
  },
  throws(action: () => void, expected: RegExp, message = 'expected action to throw') {
    try {
      action()
    } catch (error) {
      if (expected.test(String(error))) return
      throw new Error(`${message}: unexpected error ${String(error)}`)
    }
    throw new Error(message)
  },
}

const values = new Map<string, string>()
const storage = {
  getItem: (key: string) => values.get(key) ?? null,
  setItem: (key: string, value: string) => {
    values.set(key, value)
  },
}

assert.equal(hasAcceptedCurrentTerms(storage), false)

assert.equal(String(CURRENT_TERMS_VERSION) !== '1.0.0', true, 'the material update must not reuse the previous acceptance version')
values.set(TERMS_ACCEPTANCE_STORAGE_KEY, '1.0.0')
assert.equal(
  hasAcceptedCurrentTerms(storage),
  false,
  'accepting the previous published terms does not accept the September update',
)

values.set(TERMS_ACCEPTANCE_STORAGE_KEY, 'not-current')
assert.equal(
  hasAcceptedCurrentTerms(storage),
  false,
  'a different terms version must not count as current acceptance',
)

acceptCurrentTerms(storage)
assert.equal(values.get(TERMS_ACCEPTANCE_STORAGE_KEY), CURRENT_TERMS_VERSION)
assert.equal(hasAcceptedCurrentTerms(storage), true)

assert.throws(
  () => acceptCurrentTerms({ setItem: () => { throw new Error('storage blocked') } }),
  /storage blocked/u,
  'acceptance storage failures must remain fail-closed',
)

console.log('legal terms acceptance tests passed')
