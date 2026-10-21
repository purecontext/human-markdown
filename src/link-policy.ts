import * as path from 'node:path'

// Schemes opened without asking. Everything else is refused or confirmed.
const OPEN_DIRECTLY = new Set(['http', 'https', 'mailto'])

// Never opened, even with confirmation: they run code, read local files, or
// carry content inline. Defense in depth on top of the confirm prompt.
const REFUSED = new Set(['command', 'file', 'javascript', 'data', 'vbscript', 'vscode-webview'])

const SCHEME_PATTERN = /^([a-z][a-z0-9+.-]*):/i

export type LinkTarget =
  | { kind: 'fragment' }
  | { kind: 'external'; scheme: string; decision: 'open' | 'confirm' | 'refuse' }
  | { kind: 'relative'; pathPart: string }

export function classifyHref(href: string): LinkTarget {
  if (href.startsWith('#')) return { kind: 'fragment' }
  const match = SCHEME_PATTERN.exec(href)
  if (match) {
    const scheme = match[1].toLowerCase()
    const decision = OPEN_DIRECTLY.has(scheme) ? 'open' : REFUSED.has(scheme) ? 'refuse' : 'confirm'
    return { kind: 'external', scheme, decision }
  }
  // Fragment and query belong to the target document, not the file path.
  const pathPart = href.split(/[?#]/, 1)[0]
  return { kind: 'relative', pathPart }
}

export function isPathContained(
  rootFsPath: string,
  targetFsPath: string,
  pathApi: Pick<typeof path, 'relative' | 'sep' | 'isAbsolute'> = path,
): boolean {
  const relative = pathApi.relative(rootFsPath, targetFsPath)
  // On Windows a target on another drive comes back as an absolute path.
  return !(
    relative === '..' ||
    relative.startsWith(`..${pathApi.sep}`) ||
    pathApi.isAbsolute(relative)
  )
}
