import { $nodeSchema, $remark, $view } from '@milkdown/kit/utils'
import type { Node as ProsemirrorNode } from '@milkdown/prose/model'
import type { EditorView } from '@milkdown/prose/view'
import remarkFrontmatter from 'remark-frontmatter'
import { detectTheme, getShikiHighlighter } from './code-block-view'
import { renderPlainFrontmatter } from './frontmatter-render'

let collapsed = false
let syncState: ((collapsed: boolean) => void) | null = null

export function initFrontmatterState(sync: (collapsed: boolean) => void, initial: boolean) {
  syncState = sync
  collapsed = initial
}

export const remarkFrontmatterPlugin = $remark('frontmatter', () => remarkFrontmatter, ['yaml'])

export const frontmatterNodeSchema = $nodeSchema('frontmatter', () => ({
  content: 'text*',
  group: 'block',
  marks: '',
  defining: true,
  code: true,
  attrs: {},
  parseDOM: [
    {
      tag: 'div.frontmatter-block',
      preserveWhitespace: 'full' as const,
      contentElement: 'code',
    },
  ],
  toDOM: () => ['div', { class: 'frontmatter-block' }, ['pre', ['code', 0]]] as const,
  parseMarkdown: {
    match: ({ type }: { type: string }) => type === 'yaml',
    runner: (state, node, type) => {
      const value = node.value as string
      state.openNode(type)
      if (value) state.addText(value)
      state.closeNode()
    },
  },
  toMarkdown: {
    match: (node) => node.type.name === 'frontmatter',
    runner: (state, node) => {
      state.addNode('yaml', undefined, node.textContent || '')
    },
  },
}))

export const frontmatterView = $view(frontmatterNodeSchema.node, () => {
  return (node: ProsemirrorNode, _view: EditorView, _getPos: () => number | undefined) => {
    const container = document.createElement('div')
    container.classList.add('frontmatter-block')
    if (collapsed) container.classList.add('collapsed')

    const header = document.createElement('div')
    header.classList.add('frontmatter-header')

    const toggle = document.createElement('span')
    toggle.classList.add('frontmatter-toggle')
    toggle.textContent = collapsed ? '▶' : '▼'
    header.appendChild(toggle)

    const label = document.createElement('span')
    label.classList.add('frontmatter-label')
    label.textContent = 'Frontmatter'
    header.appendChild(label)

    container.appendChild(header)

    const body = document.createElement('div')
    body.classList.add('frontmatter-body')
    if (collapsed) body.style.display = 'none'

    const rendered = document.createElement('div')
    rendered.classList.add('frontmatter-rendered')
    body.appendChild(rendered)

    const pre = document.createElement('pre')
    const code = document.createElement('code')
    pre.appendChild(code)
    body.appendChild(pre)

    container.appendChild(body)

    let lastText = node.textContent

    function updateRendered(text?: string) {
      const content = text ?? code.textContent ?? lastText
      if (!content) {
        rendered.textContent = ''
        return
      }
      lastText = content
      renderPlainFrontmatter(rendered, content)

      const ready = getShikiHighlighter()
      if (!ready) return
      ready
        .then((hl) => {
          if (container.classList.contains('editing')) return
          const highlighted = hl.codeToHtml(content, {
            lang: 'yaml',
            theme: detectTheme(),
          })
          const temp = document.createElement('div')
          temp.innerHTML = highlighted
          const newPre = temp.querySelector('pre')
          if (newPre) {
            newPre.style.background = 'none'
            newPre.removeAttribute('tabindex')
            rendered.replaceChildren(newPre)
          }
        })
        .catch((err) => {
          // The plain rendering above stays in place; only highlighting is lost.
          console.warn('[human-markdown] frontmatter highlighting failed', err)
        })
    }

    updateRendered(node.textContent)

    toggle.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      collapsed = !collapsed
      container.classList.toggle('collapsed', collapsed)
      body.style.display = collapsed ? 'none' : ''
      toggle.textContent = collapsed ? '▶' : '▼'
      syncState?.(collapsed)
    })

    let mouseDownX = 0
    let mouseDownY = 0
    rendered.addEventListener('mousedown', (e) => {
      mouseDownX = e.clientX
      mouseDownY = e.clientY
    })
    rendered.addEventListener('click', (e) => {
      const dx = e.clientX - mouseDownX
      const dy = e.clientY - mouseDownY
      if (Math.sqrt(dx * dx + dy * dy) < 3) {
        container.classList.add('editing')
        code.focus()
      }
    })

    container.addEventListener('focusin', (e) => {
      container.classList.add('editing')
      if (e.target !== code && !code.contains(e.target as Node)) {
        code.focus()
      }
    })

    container.addEventListener('focusout', (e) => {
      const related = (e as FocusEvent).relatedTarget as Node | null
      if (related && container.contains(related)) return
      container.classList.remove('editing')
      updateRendered()
    })

    function onThemeChanged() {
      if (!container.classList.contains('editing')) {
        updateRendered()
      }
    }
    window.addEventListener('theme-changed', onThemeChanged)

    return {
      dom: container,
      contentDOM: code,
      update(updatedNode: ProsemirrorNode) {
        if (updatedNode.type.name !== 'frontmatter') return false
        lastText = updatedNode.textContent
        if (!container.classList.contains('editing')) {
          updateRendered(updatedNode.textContent)
        }
        return true
      },
      ignoreMutation(mutation: { target: Node; type: string }) {
        if (rendered.contains(mutation.target)) return true
        if (header.contains(mutation.target)) return true
        if (mutation.type === 'attributes' && mutation.target === container) return true
        return false
      },
      destroy() {
        window.removeEventListener('theme-changed', onThemeChanged)
      },
    }
  }
})
