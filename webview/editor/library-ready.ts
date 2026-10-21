// Heavy libraries (Mermaid, Shiki, KaTeX) load as async IIFE bundles and
// announce themselves with a window event. A view that renders before its
// library arrives waits for that event once; at most one wait per view.
//
// Async scripts delay the window load event, so a view still waiting after
// load will never be served: the bundle failed to load or threw. onUnavailable
// lets the view replace its loading state with an error instead of hanging.
// Loaders must therefore dispatch their ready event synchronously while the
// bundle runs, never after an await.
export function createLibraryWaiter(onReady: () => void, onUnavailable: () => void = () => {}) {
  let pending: { event: string; ready: () => void; loaded: () => void } | null = null

  function clear() {
    if (!pending) return
    window.removeEventListener(pending.event, pending.ready)
    window.removeEventListener('load', pending.loaded)
    pending = null
  }

  return {
    wait(event: string) {
      if (pending) return
      if (document.readyState === 'complete') {
        onUnavailable()
        return
      }
      const ready = () => {
        clear()
        onReady()
      }
      const loaded = () => {
        clear()
        onUnavailable()
      }
      pending = { event, ready, loaded }
      window.addEventListener(event, ready, { once: true })
      window.addEventListener('load', loaded, { once: true })
    },
    dispose: clear,
  }
}
