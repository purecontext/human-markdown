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
    // A one-letter "scheme" is a Windows drive path (C:/…), which the OS would open as a local file.
    const refused = REFUSED.has(scheme) || scheme.length === 1
    const decision = OPEN_DIRECTLY.has(scheme) ? 'open' : refused ? 'refuse' : 'confirm'
    return { kind: 'external', scheme, decision }
  }
  // Fragment and query belong to the target document, not the file path.
  const pathPart = href.split(/[?#]/, 1)[0]
  return { kind: 'relative', pathPart }
}

type PathApi = Pick<
  typeof path,
  'relative' | 'sep' | 'isAbsolute' | 'dirname' | 'basename' | 'join'
>
type Realpath = (p: string) => Promise<string>

// Resolves symlinks. A target that doesn't exist yet resolves through its
// nearest existing ancestor, so a link to a new file is judged by where it
// would land. Errors other than ENOENT propagate.
export async function resolveRealPath(
  fsPath: string,
  realpath: Realpath,
  pathApi: PathApi = path,
): Promise<string> {
  try {
    return await realpath(fsPath)
  } catch (err) {
    const parent = pathApi.dirname(fsPath)
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT' || parent === fsPath) throw err
    return pathApi.join(await resolveRealPath(parent, realpath, pathApi), pathApi.basename(fsPath))
  }
}

// Containment by where the path really points: a symlink inside the root that
// targets a file outside it is not contained. Any resolution error refuses.
export async function isRealPathContained(
  rootFsPath: string,
  targetFsPath: string,
  realpath: Realpath,
  pathApi: PathApi = path,
): Promise<boolean> {
  if (!isPathContained(rootFsPath, targetFsPath, pathApi)) return false
  try {
    const [root, target] = await Promise.all([
      resolveRealPath(rootFsPath, realpath, pathApi),
      resolveRealPath(targetFsPath, realpath, pathApi),
    ])
    return isPathContained(root, target, pathApi)
  } catch {
    return false
  }
}

export function isPathContained(
  rootFsPath: string,
  targetFsPath: string,
  pathApi: Pick<PathApi, 'relative' | 'sep' | 'isAbsolute'> = path,
): boolean {
  const relative = pathApi.relative(rootFsPath, targetFsPath)
  // On Windows a target on another drive comes back as an absolute path.
  return !(
    relative === '..' ||
    relative.startsWith(`..${pathApi.sep}`) ||
    pathApi.isAbsolute(relative)
  )
}
