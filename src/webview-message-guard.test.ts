import { describe, expect, it } from 'vitest'
import type { WebviewToExtensionMessage } from './messages'
import { parseWebviewMessage } from './webview-message-guard'

const parse = (raw: unknown) => parseWebviewMessage(raw, false)

describe('parseWebviewMessage', () => {
  it.each<WebviewToExtensionMessage>([
    { type: 'ready' },
    { type: 'edit', content: 'A\n', revision: 3 },
    { type: 'edit', content: 'A\n', revision: 3, origin: 'history' },
    { type: 'dirty-state', isDirty: true },
    { type: 'accept-external' },
    { type: 'keep-mine', content: 'mine' },
    { type: 'save-state', state: { scrollTop: 12.5, mode: 'raw' } },
    { type: 'open-link', href: 'https://example.com' },
    { type: 'resolve-image-uri', src: 'img/a.png' },
    { type: 'save', content: 'A\n', requestId: 42 },
    { type: 'save', content: 'A\n' },
    { type: 'auto-save-changed', enabled: false },
  ])('accepts a well-formed $type message unchanged', (msg) => {
    expect(parse(msg)).toEqual(msg)
  })

  it.each([
    ['null', null],
    ['a string', 'save'],
    ['an object without type', { content: 'x' }],
    ['an unknown type', { type: 'run-command', command: 'x' }],
    ['an inherited property name', { type: 'toString' }],
    ['save without content', { type: 'save' }],
    ['save with non-string content', { type: 'save', content: 42 }],
    ['save with a fractional requestId', { type: 'save', content: 'x', requestId: 1.5 }],
    ['save with a string requestId', { type: 'save', content: 'x', requestId: '1' }],
    ['edit with a NaN revision', { type: 'edit', content: 'x', revision: Number.NaN }],
    ['edit with an unknown origin', { type: 'edit', content: 'x', revision: 1, origin: 'evil' }],
    ['dirty-state with a truthy string', { type: 'dirty-state', isDirty: 'yes' }],
    ['keep-mine without content', { type: 'keep-mine' }],
    ['save-state without state', { type: 'save-state' }],
    [
      'save-state with Infinity',
      { type: 'save-state', state: { scrollTop: Infinity, mode: 'raw' } },
    ],
    ['save-state with an unknown mode', { type: 'save-state', state: { scrollTop: 0, mode: 'x' } }],
    ['open-link with a non-string href', { type: 'open-link', href: ['https://x'] }],
    [
      'open-link with an oversized href',
      { type: 'open-link', href: `https://x/${'a'.repeat(9000)}` },
    ],
    ['resolve-image-uri without src', { type: 'resolve-image-uri' }],
    [
      'resolve-image-uri with an oversized src',
      { type: 'resolve-image-uri', src: 'a'.repeat(9000) },
    ],
    ['auto-save-changed with a string', { type: 'auto-save-changed', enabled: 'false' }],
  ])('drops %s', (_label, raw) => {
    expect(parse(raw)).toBeUndefined()
  })

  it('strips fields the host does not read', () => {
    expect(
      parse({ type: 'save', content: 'x', requestId: 1, path: '/etc/passwd', __proto__: {} }),
    ).toEqual({ type: 'save', content: 'x', requestId: 1 })
    expect(parse({ type: 'ready', extra: true })).toEqual({ type: 'ready' })
  })

  it('drops test-event messages unless test hooks are enabled', () => {
    const event = { type: 'test-event', name: 'state', requestId: 7, content: 'x' }
    expect(parseWebviewMessage(event, false)).toBeUndefined()
    expect(parseWebviewMessage(event, true)).toEqual(event)
    expect(parseWebviewMessage({ type: 'test-event' }, true)).toBeUndefined()
  })
})
