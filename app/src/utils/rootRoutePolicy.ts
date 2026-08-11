interface SessionSetupRouteContext {
  pathname: string
  hasActiveSession: boolean
  canRenderAnonymousExplorer: boolean
}

export const isRootRoute = (pathname: string) => pathname === '/'

const CORELESS_PUBLIC_PATHS = new Set(['/lernzielbuch', '/lernziel-feedback'])

export const shouldRunApplicationCore = (pathname: string) => (
  !isRootRoute(pathname) && !CORELESS_PUBLIC_PATHS.has(pathname.replace(/\/+$/u, ''))
)

export const shouldSyncRouteStateToUrl = shouldRunApplicationCore

export const shouldRenderSessionSetup = ({
  pathname,
  hasActiveSession,
  canRenderAnonymousExplorer,
}: SessionSetupRouteContext) => (
  isRootRoute(pathname) || (!hasActiveSession && !canRenderAnonymousExplorer)
)
