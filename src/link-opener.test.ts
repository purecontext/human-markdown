import { describe, expect, it, vi } from 'vitest'
import { LinkOpener, type LinkOpenerEffects } from './link-opener'

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (err: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

function setup(confirm: () => PromiseLike<boolean> = () => Promise.resolve(false)) {
  const effects = {
    openExternal: vi.fn((_href: string) => Promise.resolve()),
    confirmExternal: vi.fn((_href: string) => confirm()),
    warn: vi.fn(),
    error: vi.fn(),
  } satisfies LinkOpenerEffects
  return { effects, opener: new LinkOpener(effects) }
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

describe('LinkOpener.openExternal', () => {
  it('opens allowlisted links without asking', async () => {
    const { effects, opener } = setup()
    opener.openExternal('https://example.com', 'open')
    await flush()
    expect(effects.openExternal).toHaveBeenCalledWith('https://example.com')
    expect(effects.confirmExternal).not.toHaveBeenCalled()
  })

  it('never opens or prompts for a refused link, and says why', async () => {
    const { effects, opener } = setup(() => Promise.resolve(true))
    opener.openExternal('command:evil', 'refuse')
    await flush()
    expect(effects.openExternal).not.toHaveBeenCalled()
    expect(effects.confirmExternal).not.toHaveBeenCalled()
    expect(effects.warn).toHaveBeenCalledWith(expect.stringContaining('command:evil'))
  })

  it('opens a confirm link only after the user accepts', async () => {
    const { effects, opener } = setup(() => Promise.resolve(true))
    opener.openExternal('vscode://x', 'confirm')
    await flush()
    expect(effects.confirmExternal).toHaveBeenCalledWith('vscode://x')
    expect(effects.openExternal).toHaveBeenCalledWith('vscode://x')
  })

  it('does not open a confirm link the user declines', async () => {
    const { effects, opener } = setup(() => Promise.resolve(false))
    opener.openExternal('vscode://x', 'confirm')
    await flush()
    expect(effects.confirmExternal).toHaveBeenCalledTimes(1)
    expect(effects.openExternal).not.toHaveBeenCalled()
  })

  it('drops confirm requests while a prompt is open, then allows the next one', async () => {
    const prompt = deferred<boolean>()
    const { effects, opener } = setup(() => prompt.promise)
    for (let i = 0; i < 50; i++) opener.openExternal(`x-spam:${i}`, 'confirm')
    expect(effects.confirmExternal).toHaveBeenCalledTimes(1)

    prompt.resolve(false)
    await flush()
    effects.confirmExternal.mockImplementation(() => Promise.resolve(false))
    opener.openExternal('x-next:1', 'confirm')
    expect(effects.confirmExternal).toHaveBeenCalledTimes(2)
  })

  it('reports a failed prompt and releases the guard', async () => {
    const { effects, opener } = setup(() => Promise.reject(new Error('prompt broke')))
    opener.openExternal('vscode://x', 'confirm')
    await flush()
    expect(effects.error).toHaveBeenCalledWith(expect.stringContaining('prompt broke'))
    expect(effects.openExternal).not.toHaveBeenCalled()
    opener.openExternal('vscode://y', 'confirm')
    expect(effects.confirmExternal).toHaveBeenCalledTimes(2)
  })

  it('reports an openExternal rejection', async () => {
    const { effects, opener } = setup()
    effects.openExternal.mockImplementation(() => Promise.reject(new Error('no handler')))
    opener.openExternal('https://example.com', 'open')
    await flush()
    expect(effects.error).toHaveBeenCalledWith(expect.stringContaining('no handler'))
  })

  it('reports a synchronous throw before any promise exists', () => {
    const { effects, opener } = setup()
    effects.openExternal.mockImplementation(() => {
      throw new Error('bad uri')
    })
    opener.openExternal('https://example.com', 'open')
    expect(effects.error).toHaveBeenCalledWith(expect.stringContaining('bad uri'))
  })
})

describe('LinkOpener.fail', () => {
  it('reports through the error effect with the href', () => {
    const { effects, opener } = setup()
    opener.fail('docs/a.md', new Error('containment broke'))
    expect(effects.error).toHaveBeenCalledWith(
      expect.stringMatching(/docs\/a\.md.*containment broke/),
    )
  })
})

describe('LinkOpener.openContained', () => {
  it('opens a contained file', async () => {
    const { effects, opener } = setup()
    const open = vi.fn(() => Promise.resolve())
    opener.openContained('docs/a.md', true, open)
    await flush()
    expect(open).toHaveBeenCalledTimes(1)
    expect(effects.warn).not.toHaveBeenCalled()
  })

  it('refuses an uncontained file without calling open', () => {
    const { effects, opener } = setup()
    const open = vi.fn(() => Promise.resolve())
    opener.openContained('../../x', false, open)
    expect(open).not.toHaveBeenCalled()
    expect(effects.warn).toHaveBeenCalledWith(expect.stringContaining('outside the workspace'))
  })

  it('reports a failed open', async () => {
    const { effects, opener } = setup()
    opener.openContained('a.md', true, () => Promise.reject(new Error('gone')))
    await flush()
    expect(effects.error).toHaveBeenCalledWith(expect.stringContaining('gone'))
  })
})
