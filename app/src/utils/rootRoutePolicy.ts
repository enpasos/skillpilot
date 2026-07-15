interface SessionSetupRouteContext {
  pathname: string
  hasActiveSession: boolean
  canRenderAnonymousExplorer: boolean
}

export const isRootRoute = (pathname: string) => pathname === '/'

export const shouldRunApplicationCore = (pathname: string) => !isRootRoute(pathname)

export const shouldSyncRouteStateToUrl = shouldRunApplicationCore

export const shouldRenderSessionSetup = ({
  pathname,
  hasActiveSession,
  canRenderAnonymousExplorer,
}: SessionSetupRouteContext) => (
  isRootRoute(pathname) || (!hasActiveSession && !canRenderAnonymousExplorer)
)
