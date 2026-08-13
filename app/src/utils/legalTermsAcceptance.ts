import { CURRENT_TERMS_VERSION } from './legalTermsVersion'

export const TERMS_ACCEPTANCE_STORAGE_KEY = 'skillpilot_terms_accepted_version'

type TermsAcceptanceStorage = Pick<Storage, 'getItem' | 'setItem'>

export const hasAcceptedCurrentTerms = (
  storage: Pick<TermsAcceptanceStorage, 'getItem'>,
): boolean => storage.getItem(TERMS_ACCEPTANCE_STORAGE_KEY) === CURRENT_TERMS_VERSION

export const acceptCurrentTerms = (
  storage: Pick<TermsAcceptanceStorage, 'setItem'>,
): void => storage.setItem(TERMS_ACCEPTANCE_STORAGE_KEY, CURRENT_TERMS_VERSION)
