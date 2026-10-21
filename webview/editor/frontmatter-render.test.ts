// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { renderPlainFrontmatter } from './frontmatter-render'

describe('renderPlainFrontmatter', () => {
  it.each([
    'title: </code></pre><img src=x onerror="alert(1)">',
    'title: <script>alert(1)</script>',
    'link: <a href="javascript:alert(1)">x</a>',
    'svg: <svg onload="alert(1)"></svg>',
  ])('renders hostile frontmatter as inert text: %s', (content) => {
    const target = document.createElement('div')
    renderPlainFrontmatter(target, content)

    expect(target.querySelectorAll('pre > code')).toHaveLength(1)
    expect(target.querySelector('code')?.textContent).toBe(content)
    // Only the wrapper elements exist, and none carries an attribute a handler could hide in.
    const elements = [...target.querySelectorAll('*')]
    expect(elements.map((el) => el.tagName)).toEqual(['PRE', 'CODE'])
    expect(elements.every((el) => el.attributes.length === 0)).toBe(true)
    const inner = target.innerHTML.replace(/^<pre><code>/, '').replace(/<\/code><\/pre>$/, '')
    expect(inner).not.toContain('<')
  })

  it('replaces previous content instead of appending', () => {
    const target = document.createElement('div')
    renderPlainFrontmatter(target, 'a: 1')
    renderPlainFrontmatter(target, 'b: 2')
    expect(target.children).toHaveLength(1)
    expect(target.textContent).toBe('b: 2')
  })
})
