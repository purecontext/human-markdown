// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createLibraryWaiter } from './library-ready'

describe('createLibraryWaiter', () => {
  let readyState: DocumentReadyState

  beforeEach(() => {
    // Views wait while the page (and its async library bundles) is still loading.
    readyState = 'loading'
    vi.spyOn(document, 'readyState', 'get').mockImplementation(() => readyState)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('re-renders once when the library announces itself', () => {
    const onReady = vi.fn()
    const waiter = createLibraryWaiter(onReady)
    waiter.wait('lib-a-ready')
    window.dispatchEvent(new Event('lib-a-ready'))
    window.dispatchEvent(new Event('lib-a-ready'))
    expect(onReady).toHaveBeenCalledTimes(1)
  })

  it('registers one listener however many renders ask', () => {
    const onReady = vi.fn()
    const waiter = createLibraryWaiter(onReady)
    for (let i = 0; i < 5; i++) waiter.wait('lib-b-ready')
    window.dispatchEvent(new Event('lib-b-ready'))
    expect(onReady).toHaveBeenCalledTimes(1)
  })

  it('can wait again after the first event fired', () => {
    const onReady = vi.fn()
    const waiter = createLibraryWaiter(onReady)
    waiter.wait('lib-c-ready')
    window.dispatchEvent(new Event('lib-c-ready'))
    waiter.wait('lib-c-ready')
    window.dispatchEvent(new Event('lib-c-ready'))
    expect(onReady).toHaveBeenCalledTimes(2)
  })

  it('reports the library unavailable if the page finishes loading first', () => {
    const onReady = vi.fn()
    const onUnavailable = vi.fn()
    const waiter = createLibraryWaiter(onReady, onUnavailable)
    waiter.wait('lib-e-ready')
    window.dispatchEvent(new Event('load'))
    window.dispatchEvent(new Event('lib-e-ready'))
    expect(onUnavailable).toHaveBeenCalledTimes(1)
    expect(onReady).not.toHaveBeenCalled()
  })

  it('reports unavailable at once when asked to wait after the page loaded', () => {
    readyState = 'complete'
    const onUnavailable = vi.fn()
    const waiter = createLibraryWaiter(vi.fn(), onUnavailable)
    waiter.wait('lib-f-ready')
    expect(onUnavailable).toHaveBeenCalledTimes(1)
  })

  it('does not report unavailable after the library arrived', () => {
    const onUnavailable = vi.fn()
    const waiter = createLibraryWaiter(vi.fn(), onUnavailable)
    waiter.wait('lib-g-ready')
    window.dispatchEvent(new Event('lib-g-ready'))
    window.dispatchEvent(new Event('load'))
    expect(onUnavailable).not.toHaveBeenCalled()
  })

  it('stops listening when disposed', () => {
    const onReady = vi.fn()
    const onUnavailable = vi.fn()
    const waiter = createLibraryWaiter(onReady, onUnavailable)
    waiter.wait('lib-d-ready')
    waiter.dispose()
    window.dispatchEvent(new Event('lib-d-ready'))
    window.dispatchEvent(new Event('load'))
    expect(onReady).not.toHaveBeenCalled()
    expect(onUnavailable).not.toHaveBeenCalled()
  })
})
