import type { WebviewState, WebviewToExtensionMessage } from './messages'

// The webview renders untrusted markdown, so every message it posts is
// untrusted input to the extension host. Each parser rebuilds the message from
// known fields only and returns undefined for anything malformed.

const MAX_HREF_LENGTH = 8192

type Fields = Record<string, unknown>
type MessageType = WebviewToExtensionMessage['type']
type MessageOf<T extends MessageType> = Extract<WebviewToExtensionMessage, { type: T }>

const isString = (value: unknown): value is string => typeof value === 'string'
const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean'
const isSafeInteger = (value: unknown): value is number => Number.isSafeInteger(value)

function optionalRequestId(fields: Fields): { requestId?: number } | undefined {
  if (fields.requestId === undefined) return {}
  return isSafeInteger(fields.requestId) ? { requestId: fields.requestId } : undefined
}

function parseState(value: unknown): WebviewState | undefined {
  if (typeof value !== 'object' || value === null) return undefined
  const { scrollTop, mode } = value as Fields
  if (typeof scrollTop !== 'number' || !Number.isFinite(scrollTop)) return undefined
  if (mode !== 'preview' && mode !== 'raw') return undefined
  return { scrollTop, mode }
}

const parsers: { [T in MessageType]: (fields: Fields) => MessageOf<T> | undefined } = {
  ready: () => ({ type: 'ready' }),
  edit: (f) => {
    if (!isString(f.content) || !isSafeInteger(f.revision)) return undefined
    if (f.origin !== undefined && f.origin !== 'history' && f.origin !== 'edit') return undefined
    return {
      type: 'edit',
      content: f.content,
      revision: f.revision,
      ...(f.origin ? { origin: f.origin } : {}),
    }
  },
  'dirty-state': (f) =>
    isBoolean(f.isDirty) ? { type: 'dirty-state', isDirty: f.isDirty } : undefined,
  'accept-external': () => ({ type: 'accept-external' }),
  'keep-mine': (f) => (isString(f.content) ? { type: 'keep-mine', content: f.content } : undefined),
  'save-state': (f) => {
    const state = parseState(f.state)
    return state ? { type: 'save-state', state } : undefined
  },
  'open-link': (f) =>
    isString(f.href) && f.href.length <= MAX_HREF_LENGTH
      ? { type: 'open-link', href: f.href }
      : undefined,
  'resolve-image-uri': (f) =>
    isString(f.src) && f.src.length <= MAX_HREF_LENGTH
      ? { type: 'resolve-image-uri', src: f.src }
      : undefined,
  save: (f) => {
    const requestId = optionalRequestId(f)
    if (!isString(f.content) || !requestId) return undefined
    return { type: 'save', content: f.content, ...requestId }
  },
  'auto-save-changed': (f) =>
    isBoolean(f.enabled) ? { type: 'auto-save-changed', enabled: f.enabled } : undefined,
  // Test reporter payloads are only accepted when test hooks are enabled (see
  // parseWebviewMessage); their extra fields are diagnostic and passed through.
  'test-event': (f) =>
    isString(f.name) ? ({ ...f, type: 'test-event' } as MessageOf<'test-event'>) : undefined,
}

export function parseWebviewMessage(
  raw: unknown,
  testHooksEnabled: boolean,
): WebviewToExtensionMessage | undefined {
  if (typeof raw !== 'object' || raw === null) return undefined
  const fields = raw as Fields
  const type = fields.type
  if (!isString(type) || !Object.hasOwn(parsers, type)) return undefined
  if (type === 'test-event' && !testHooksEnabled) return undefined
  return parsers[type as MessageType](fields)
}
