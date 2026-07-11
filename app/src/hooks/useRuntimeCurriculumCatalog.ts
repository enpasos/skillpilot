import { useEffect, useState } from 'react'
import {
  loadRuntimeCurriculumCatalog,
  type RuntimeCurriculumCatalogState,
} from '../utils/runtimeCurriculumCatalog'

let cachedCatalogState: Promise<RuntimeCurriculumCatalogState> | null = null
const ALLOW_REPOSITORY_FALLBACK = import.meta.env.MODE !== 'package-consumer'

const loadCatalogState = (): Promise<RuntimeCurriculumCatalogState> => {
  if (!cachedCatalogState) {
    const apiBase = (import.meta.env.VITE_API_BASE ?? '').trim().replace(/\/+$/u, '')
    cachedCatalogState = loadRuntimeCurriculumCatalog(fetch, apiBase, {
      allowRepositoryFallback: ALLOW_REPOSITORY_FALLBACK,
    })
  }
  return cachedCatalogState
}

export const useRuntimeCurriculumCatalog = (): RuntimeCurriculumCatalogState => {
  const [state, setState] = useState<RuntimeCurriculumCatalogState>({ mode: 'loading' })

  useEffect(() => {
    let active = true
    void loadCatalogState().then((next) => {
      if (active) setState(next)
    })
    return () => {
      active = false
    }
  }, [])

  return state
}

export const resetRuntimeCurriculumCatalogCacheForTests = (): void => {
  cachedCatalogState = null
}
