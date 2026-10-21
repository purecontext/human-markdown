// Frontmatter is untrusted document text: render it through textContent, never markup.
export function renderPlainFrontmatter(target: HTMLElement, content: string): void {
  const pre = document.createElement('pre')
  const code = document.createElement('code')
  code.textContent = content
  pre.appendChild(code)
  target.replaceChildren(pre)
}
