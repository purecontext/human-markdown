// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { createLibraryWaiter } from './library-ready'

describe('createLibraryWaiter', () => {
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

  it('stops listening when disposed', () => {
    const onReady = vi.fn()
    const waiter = createLibraryWaiter(onReady)
    waiter.wait('lib-d-ready')
    waiter.dispose()
    window.dispatchEvent(new Event('lib-d-ready'))
    expect(onReady).not.toHaveBeenCalled()
  })
})
