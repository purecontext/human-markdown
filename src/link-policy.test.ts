import * as path from 'node:path'
import { describe, expect, it } from 'vitest'
import { classifyHref, isPathContained } from './link-policy'

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
