import {
  assertJsonValue,
  compactCanonicalJsonText,
  type JsonObject,
} from './fwuOwlFieldRegistry'

// The closed learningUnit value from offer-compiled-landscape.schema.json v1.2.
// This application extension preserves the contract, rather than asserting a
// new FWU Core competence or treating calendar structure as a learning unit.
export const learningUnitMetadataJson = (value: unknown): string => {
  assertJsonValue(value, 'learningUnit')
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('learningUnit must be an object.')
  }
  const data = value as JsonObject
  const required = ['contractId', 'revision', 'placementRevision', 'promise', 'introduction']
  const allowed = new Set([...required, 'requiredChildUnitIds'])
  for (const key of Object.keys(data)) {
    if (!allowed.has(key)) throw new Error(`Unknown learningUnit field: ${key}`)
  }
  for (const key of ['contractId', 'revision', 'placementRevision']) {
    if (typeof data[key] !== 'string' || data[key].length === 0) {
      throw new Error(`learningUnit.${key} must be a nonempty string.`)
    }
  }
  for (const key of ['promise', 'introduction']) {
    const localized = data[key]
    if (!localized || typeof localized !== 'object' || Array.isArray(localized)
      || Object.keys(localized).length === 0
      || Object.values(localized).some((text) => typeof text !== 'string' || text.length === 0)) {
      throw new Error(`learningUnit.${key} must be a nonempty localized string map.`)
    }
  }
  if (Object.hasOwn(data, 'requiredChildUnitIds')) {
    const children = data.requiredChildUnitIds
    if (!Array.isArray(children) || children.some((id) => typeof id !== 'string' || id.length === 0)
      || new Set(children).size !== children.length) {
      throw new Error('learningUnit.requiredChildUnitIds must be a unique array of nonempty strings.')
    }
  }
  const text = compactCanonicalJsonText(data)
  if (Buffer.byteLength(text, 'utf8') > 1048576) {
    throw new Error('learningUnit metadata exceeds the registered 1048576-byte limit.')
  }
  return text
}

export const assertAcquisition: (value: unknown) => asserts value is boolean = (value) => {
  if (typeof value !== 'boolean') throw new Error('Goal placement acquisition must be a boolean.')
}
