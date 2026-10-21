import { mkdirSync, mkdtempSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { realpath } from 'node:fs/promises'
import * as os from 'node:os'
import * as path from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { classifyHref, isPathContained, isRealPathContained, resolveRealPath } from './link-policy'

describe('classifyHref', () => {
  it.each([
    'https://example.com/docs',
    'http://example.com',
    'mailto:a@b.c',
    'HTTPS://EXAMPLE.COM',
  ])('opens %s directly', (href) => {
    expect(classifyHref(href)).toMatchObject({ kind: 'external', decision: 'open' })
  })

  it.each([
    'file:///etc/passwd',
    'command:workbench.action.terminal.new',
    'javascript:alert(1)',
    'JavaScript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox',
    'vscode-webview://abc/index.html',
    'C:/Windows/System32/cmd.exe',
    'c:\\Users\\me\\secret.txt',
    'Z:relative-drive-path',
  ])('refuses %s', (href) => {
    expect(classifyHref(href)).toMatchObject({ kind: 'external', decision: 'refuse' })
  })

  it.each([
    'vscode://vscode.git/clone?url=x',
    'slack://open',
    'x-custom+app.v2:thing',
  ])('asks before opening %s', (href) => {
    expect(classifyHref(href)).toMatchObject({ kind: 'external', decision: 'confirm' })
  })

  it('lowercases the scheme it reports', () => {
    expect(classifyHref('VSCode://x')).toEqual({
      kind: 'external',
      scheme: 'vscode',
      decision: 'confirm',
    })
  })

  it('treats a bare fragment as an in-document jump', () => {
    expect(classifyHref('#local-heading')).toEqual({ kind: 'fragment' })
  })

  it('strips fragment and query from relative paths', () => {
    expect(classifyHref('docs/target.md#section')).toEqual({
      kind: 'relative',
      pathPart: 'docs/target.md',
    })
    expect(classifyHref('target.md?raw=1')).toEqual({ kind: 'relative', pathPart: 'target.md' })
  })

  it('keeps traversal segments so containment can judge them', () => {
    expect(classifyHref('../../.ssh/config')).toEqual({
      kind: 'relative',
      pathPart: '../../.ssh/config',
    })
  })

  it('returns an empty path for a query-only href', () => {
    expect(classifyHref('?x=1')).toEqual({ kind: 'relative', pathPart: '' })
  })
})

describe('isPathContained', () => {
  const root = path.resolve('/workspace/project')

  it('accepts the root itself and paths below it', () => {
    expect(isPathContained(root, root)).toBe(true)
    expect(isPathContained(root, path.join(root, 'docs', 'a.md'))).toBe(true)
  })

  it('rejects the parent and anything that climbs out', () => {
    expect(isPathContained(root, path.dirname(root))).toBe(false)
    expect(isPathContained(root, path.resolve(root, '../../.ssh/config'))).toBe(false)
    expect(isPathContained(root, path.resolve(root, '../project-sibling/a.md'))).toBe(false)
  })

  it('accepts names that merely start with two dots', () => {
    expect(isPathContained(root, path.join(root, '..notes.md'))).toBe(true)
  })

  it('rejects an unrelated absolute path', () => {
    expect(isPathContained(root, path.resolve('/etc/passwd'))).toBe(false)
  })

  it('rejects a Windows target on another drive', () => {
    expect(isPathContained('C:\\work\\project', 'D:\\secrets\\a.md', path.win32)).toBe(false)
    expect(isPathContained('C:\\work\\project', 'C:\\work\\project\\a.md', path.win32)).toBe(true)
    expect(isPathContained('C:\\work\\project', 'C:\\work\\other\\a.md', path.win32)).toBe(false)
  })
})

describe('isRealPathContained (real filesystem)', () => {
  let base: string
  let root: string

  beforeAll(() => {
    // realpath the temp dir itself: on macOS /var and /tmp are symlinks.
    base = realpathSync(mkdtempSync(path.join(os.tmpdir(), 'hm-link-policy-')))
    root = path.join(base, 'workspace')
    mkdirSync(path.join(root, 'docs'), { recursive: true })
    writeFileSync(path.join(root, 'docs', 'a.md'), 'a')
    writeFileSync(path.join(base, 'outside.md'), 'secret')
    symlinkSync(path.join(base, 'outside.md'), path.join(root, 'docs', 'escape.md'))
    symlinkSync(path.join(root, 'docs', 'a.md'), path.join(root, 'inside-link.md'))
    symlinkSync(base, path.join(root, 'up'))
  })

  afterAll(() => {
    rmSync(base, { recursive: true, force: true })
  })

  it('accepts a real file inside the root', async () => {
    expect(await isRealPathContained(root, path.join(root, 'docs', 'a.md'), realpath)).toBe(true)
  })

  it('refuses a symlinked file that points outside the root', async () => {
    expect(await isRealPathContained(root, path.join(root, 'docs', 'escape.md'), realpath)).toBe(
      false,
    )
  })

  it('refuses a path through a symlinked directory that leaves the root', async () => {
    expect(await isRealPathContained(root, path.join(root, 'up', 'outside.md'), realpath)).toBe(
      false,
    )
  })

  it('accepts a symlink that stays inside the root', async () => {
    expect(await isRealPathContained(root, path.join(root, 'inside-link.md'), realpath)).toBe(true)
  })

  it('accepts a not-yet-existing file inside the root', async () => {
    expect(await isRealPathContained(root, path.join(root, 'docs', 'new', 'b.md'), realpath)).toBe(
      true,
    )
  })

  it('refuses a not-yet-existing file under a directory symlink that leaves the root', async () => {
    expect(await isRealPathContained(root, path.join(root, 'up', 'new.md'), realpath)).toBe(false)
  })

  it('refuses a lexical escape before touching the filesystem', async () => {
    const fail = () => Promise.reject(new Error('should not be called'))
    expect(await isRealPathContained(root, path.join(base, 'outside.md'), fail)).toBe(false)
  })
})

describe('resolveRealPath', () => {
  const enoent = () => Object.assign(new Error('missing'), { code: 'ENOENT' })

  it('walks up to the nearest existing ancestor on ENOENT', async () => {
    const fake = async (p: string) => {
      if (p === '/real/dir') return '/resolved/dir'
      throw enoent()
    }
    expect(await resolveRealPath('/real/dir/new/file.md', fake, path.posix)).toBe(
      '/resolved/dir/new/file.md',
    )
  })

  it('propagates errors other than ENOENT', async () => {
    const fake = async () => {
      throw Object.assign(new Error('denied'), { code: 'EACCES' })
    }
    await expect(resolveRealPath('/x/y', fake, path.posix)).rejects.toThrow('denied')
  })

  it('treats a resolution error as not contained', async () => {
    const fake = async (p: string) => {
      if (p === '/root') return '/root'
      throw Object.assign(new Error('denied'), { code: 'EACCES' })
    }
    expect(await isRealPathContained('/root', '/root/a.md', fake, path.posix)).toBe(false)
  })
})
