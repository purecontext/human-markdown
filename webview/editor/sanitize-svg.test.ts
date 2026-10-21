// @vitest-environment jsdom
import DOMPurify from 'dompurify'
import { describe, expect, it } from 'vitest'
import { createSvgSanitizer } from './sanitize-svg'

const sanitizeSvg = createSvgSanitizer(DOMPurify)
const SVG = 'xmlns="http://www.w3.org/2000/svg"'

// Parse the output the way the innerHTML sink will, so assertions are about
// the tree the browser builds, not substrings of the serialization.
function render(svg: string): HTMLElement {
  const host = document.createElement('div')
  host.innerHTML = sanitizeSvg(svg)
  return host
}

function allAttributes(host: HTMLElement): Array<[string, string]> {
  return [...host.querySelectorAll('*')].flatMap((el) =>
    [...el.attributes].map((attr): [string, string] => [attr.name, attr.value]),
  )
}

function expectNoExecutableMarkup(host: HTMLElement) {
  expect(host.querySelector('script, iframe, object, embed, set, animate, discard')).toBeNull()
  for (const [name, value] of allAttributes(host)) {
    expect(name.toLowerCase().startsWith('on'), `${name}=${value}`).toBe(false)
    expect(value.replace(/\s/g, '').toLowerCase()).not.toMatch(/^(javascript|data|vbscript):/)
  }
}

describe('sanitizeSvg: attacks', () => {
  it.each([
    ['script element', `<svg ${SVG}><script>alert(1)</script><rect/></svg>`],
    ['iframe/object/embed', `<svg ${SVG}><iframe/><object/><embed/><rect/></svg>`],
    ['event handlers', `<svg ${SVG}><rect onclick="alert(1)" onload="alert(2)"/></svg>`],
    ['javascript: href', `<svg ${SVG}><a href="javascript:alert(1)"><text>x</text></a></svg>`],
    [
      'data: href',
      `<svg ${SVG}><a href="data:text/html,<script>alert(1)</script>"><text>x</text></a></svg>`,
    ],
    [
      '<set> rewriting href',
      `<svg ${SVG}><a href="#ok"><set attributeName="href" to="javascript:alert(1)"/><text>x</text></a></svg>`,
    ],
    [
      '<animate> rewriting href',
      `<svg ${SVG}><a href="#ok"><animate attributeName="href" values="javascript:alert(1)"/><text>x</text></a></svg>`,
    ],
    [
      'xlink:href under another prefix',
      `<svg ${SVG} xmlns:x="http://www.w3.org/1999/xlink"><a x:href="javascript:alert(1)"><text>x</text></a></svg>`,
    ],
    ['animateMotion and discard', `<svg ${SVG}><animateMotion/><discard/><rect/></svg>`],
    [
      'script inside foreignObject',
      `<svg ${SVG}><foreignObject><div><script>alert(1)</script><p>safe</p></div></foreignObject></svg>`,
    ],
    [
      'img onerror inside foreignObject',
      `<svg ${SVG}><foreignObject><div><img src="x" onerror="alert(1)"></div></foreignObject></svg>`,
    ],
    ['malformed markup', '<svg><a href="javascript:alert(1)"><not-closed'],
    [
      'javascript: link inside foreignObject',
      `<svg ${SVG}><foreignObject><div><a href="javascript:alert(1)">x</a></div></foreignObject></svg>`,
    ],
    [
      'nested namespace confusion (mXSS)',
      '<svg><foreignObject><svg><foreignObject><math><mi><style><img src=x onerror=alert(1)></style></mi></math></foreignObject></svg></foreignObject></svg>',
    ],
    [
      'style breakout inside foreignObject',
      '<svg><foreignObject><style><img src=x onerror=alert(1)></style></foreignObject></svg>',
    ],
    [
      'iframe srcdoc and form action',
      '<svg><foreignObject><iframe srcdoc="<script>alert(1)</script>"></iframe><form action="javascript:alert(2)"><button>x</button></form></foreignObject></svg>',
    ],
  ])('neutralizes %s', (_label, input) => {
    expectNoExecutableMarkup(render(input))
  })

  it.each([
    ['image from a remote URL', `<svg ${SVG}><image href="https://evil.example/x.png"/></svg>`],
    ['use of an external document', `<svg ${SVG}><use href="https://evil.example/s.svg#a"/></svg>`],
    ['protocol-relative href', `<svg ${SVG}><use href="//evil.example/s.svg#a"/></svg>`],
  ])('drops a non-fragment reference: %s', (_label, input) => {
    const hrefs = allAttributes(render(input)).filter(([name]) => /href$/i.test(name))
    expect(hrefs).toEqual([])
  })

  it('drops remote image sources inside labels', () => {
    const host = render(
      `<svg ${SVG}><foreignObject><div><img src="https://evil.example/t.png"></div></foreignObject></svg>`,
    )
    expect(host.querySelector('img')?.getAttribute('src') ?? null).toBeNull()
  })

  it('does not leak its href hook into the shared DOMPurify instance', () => {
    expect(DOMPurify.sanitize('<a href="https://example.com">x</a>')).toContain(
      'href="https://example.com"',
    )
  })
})

describe('sanitizeSvg: what Mermaid needs', () => {
  // Shape of Mermaid flowchart output: scoped <style>, arrow markers referenced
  // by url(#…), and HTML labels in foreignObject.
  const diagram = [
    `<svg ${SVG} id="m1" viewBox="0 0 200 50" role="graphics-document document">`,
    '<style>#m1 .node rect{fill:#eee;stroke:#333;}#m1 .edgePath path{stroke:#333;}</style>',
    '<defs><marker id="m1_arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>',
    '<g class="node" id="flowchart-A-0" transform="translate(40,25)"><rect x="-30" y="-15" width="60" height="30" rx="5"/>',
    '<foreignObject width="60" height="20"><div xmlns="http://www.w3.org/1999/xhtml" style="display:inline-block"><span class="nodeLabel"><p>Start here</p></span></div></foreignObject></g>',
    '<path class="flowchart-link" d="M70,25 L130,25" marker-end="url(#m1_arrow)"/>',
    '<text x="150" y="30" class="label">Finish line</text>',
    '<use href="#m1_arrow"/>',
    '</svg>',
  ].join('')

  it('keeps styles, markers, marker references, labels and fragment hrefs', () => {
    const host = render(diagram)
    const svg = host.querySelector('svg')
    expect(svg?.getAttribute('viewBox')).toBe('0 0 200 50')
    expect(host.querySelector('style')?.textContent).toContain('.node rect')
    expect(host.querySelector('marker#m1_arrow')).not.toBeNull()
    expect(host.querySelector('path.flowchart-link')?.getAttribute('marker-end')).toBe(
      'url(#m1_arrow)',
    )
    expect(host.querySelector('foreignObject span.nodeLabel')?.textContent).toBe('Start here')
    expect(host.querySelector('text.label')?.textContent).toBe('Finish line')
    expect(host.querySelector('use')?.getAttribute('href')).toBe('#m1_arrow')
  })
})
