import type { Config, DOMPurify } from 'dompurify'

// Mermaid output embedded via innerHTML. An allowlist (DOMPurify's SVG, SVG
// filter and HTML profiles; HTML covers foreignObject labels) replaces the old
// denylist, which missed <set>/<animate> rewriting href and xlink:href under
// other prefixes. Parsing as HTML matches the innerHTML sink, so the sanitizer
// and the browser see the same tree.
const SVG_CONFIG = {
  USE_PROFILES: { svg: true, svgFilters: true, html: true },
  // Mermaid draws node labels as HTML inside foreignObject. DOMPurify drops
  // both by default; these admit them while its namespace checks still apply
  // to everything inside (the HTML profile's allowlist, no handlers).
  // Mermaid's embedded images use <use href="#…">. DOMPurify bans <use> because
  // it can load external documents; the href hook below keeps it same-document.
  ADD_TAGS: ['foreignObject', 'use'],
  HTML_INTEGRATION_POINTS: { foreignobject: true },
  // <set>, <animate> and <discard>, which can rewrite attributes after
  // sanitizing, are outside DOMPurify's SVG allowlist already (see tests).
  // DOMPurify checks every attribute value against this, not only URLs: allow
  // plain values (viewBox, d, transform) and reject anything with a scheme.
  ALLOWED_URI_REGEXP: /^(?:[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  ALLOW_DATA_ATTR: false,
  RETURN_TRUSTED_TYPE: false,
} satisfies Config

// Takes the DOMPurify factory and builds a private instance, so the href hook
// never leaks into the shared instance Mermaid uses for its own labels.
export function createSvgSanitizer(purifyFactory: DOMPurify): (svg: string) => string {
  const purify = purifyFactory(window)
  // Only same-document references survive (markers, gradients, clip paths),
  // whatever prefix the xlink namespace was bound to.
  purify.addHook('uponSanitizeAttribute', (_node, data) => {
    if (/(^|:)href$/i.test(data.attrName) && !data.attrValue.trim().startsWith('#')) {
      data.keepAttr = false
    }
  })
  return (svg) => purify.sanitize(svg, SVG_CONFIG)
}
