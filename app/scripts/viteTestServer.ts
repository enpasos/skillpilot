import { createServer as createHttpServer } from 'node:http'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createServer as createViteServer, type Plugin } from 'vite'

export const startViteTestServer = async (
  root: string,
  fixtureEntry: string,
  options: { plugins?: Plugin[] } = {},
) => {
  const cacheDir = await mkdtemp(join(tmpdir(), 'skillpilot-vite-test-'))
  let vite: Awaited<ReturnType<typeof createViteServer>>
  try {
    vite = await createViteServer({
      root,
      cacheDir,
      configFile: false,
      plugins: options.plugins ?? [],
      appType: 'custom',
      logLevel: 'error',
      // Discover dependencies from the fixture only. Scanning the production
      // index would pull in virtual PWA modules that this isolated server does
      // not own, while disabling discovery breaks CommonJS dependency interop.
      optimizeDeps: {
        entries: [fixtureEntry],
      },
      server: {
        middlewareMode: true,
        hmr: false,
        ws: false,
      },
    })
  } catch (error) {
    await rm(cacheDir, { recursive: true, force: true })
    throw error
  }
  const fixtureUrl = `/${fixtureEntry.replaceAll('\\', '/')}`
  const fixturePath = join(root, fixtureEntry)
  const http = createHttpServer(async (request, response) => {
    const pathname = new URL(request.url ?? '/', 'http://127.0.0.1').pathname
    if (pathname === '/@vite/client') {
      response.statusCode = 200
      response.setHeader('Content-Type', 'text/javascript; charset=utf-8')
      response.end(`
        const hotContext = {
          data: {},
          accept() {},
          acceptExports() {},
          dispose() {},
          prune() {},
          decline() {},
          invalidate() {},
          on() {},
          off() {},
          send() {},
        }
        export const createHotContext = () => hotContext
        export const injectQuery = (url) => url
        const styles = new Map()
        export const updateStyle = (id, content) => {
          let style = styles.get(id)
          if (!style) {
            style = document.createElement('style')
            style.setAttribute('data-vite-dev-id', id)
            document.head.appendChild(style)
            styles.set(id, style)
          }
          style.textContent = content
        }
        export const removeStyle = (id) => {
          const style = styles.get(id)
          style?.remove()
          styles.delete(id)
        }
      `)
      return
    }
    if (pathname === fixtureUrl) {
      try {
        const html = await readFile(fixturePath)
        response.statusCode = 200
        response.setHeader('Content-Type', 'text/html; charset=utf-8')
        response.end(html)
      } catch {
        response.statusCode = 500
        response.end('Unable to load Vite test fixture')
      }
      return
    }
    vite.middlewares(request, response)
  })

  try {
    await new Promise<void>((resolve, reject) => {
      const handleError = (error: Error) => reject(error)
      http.once('error', handleError)
      http.listen(0, '127.0.0.1', () => {
        http.off('error', handleError)
        resolve()
      })
    })
  } catch (error) {
    await vite.close()
    await rm(cacheDir, { recursive: true, force: true })
    throw error
  }

  const address = http.address()
  if (!address || typeof address === 'string') {
    await new Promise<void>((resolve) => http.close(() => resolve()))
    await vite.close()
    await rm(cacheDir, { recursive: true, force: true })
    throw new Error('Vite test server did not expose a TCP port')
  }

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: async () => {
      let closeError: unknown = null
      try {
        await new Promise<void>((resolve, reject) => {
          http.close((error) => error ? reject(error) : resolve())
        })
      } catch (error) {
        closeError = error
      }
      try {
        await vite.close()
      } catch (error) {
        closeError ??= error
      } finally {
        await rm(cacheDir, { recursive: true, force: true })
      }
      if (closeError) throw closeError
    },
  }
}
