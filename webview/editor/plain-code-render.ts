// Document text (frontmatter, code) is untrusted: render it through textContent, never markup.
export function renderPlainCode(target: HTMLElement, content: string): void {
  const pre = document.createElement('pre')
  const code = document.createElement('code')
  code.textContent = content
  pre.appendChild(code)
  target.replaceChildren(pre)
}
