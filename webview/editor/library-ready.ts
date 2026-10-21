// Heavy libraries (Mermaid, Shiki, KaTeX) load as async IIFE bundles and
// announce themselves with a window event. A view that renders before its
// library arrives waits for that event once; at most one wait per view.
export function createLibraryWaiter(onReady: () => void) {
  let pending: { event: string; listener: () => void } | null = null
  return {
    wait(event: string) {
      if (pending) return
      const listener = () => {
        pending = null
        onReady()
      }
      pending = { event, listener }
      window.addEventListener(event, listener, { once: true })
    },
    dispose() {
      if (pending) window.removeEventListener(pending.event, pending.listener)
      pending = null
    },
  }
}
