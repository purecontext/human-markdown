import DOMPurify from 'dompurify'
import mermaid from 'mermaid'
import { createSvgSanitizer } from './sanitize-svg'

mermaid.initialize({ startOnLoad: false })
;(window as unknown as Record<string, unknown>).__mermaid = mermaid
// Shipped in this bundle so the sanitizer reuses Mermaid's own DOMPurify copy
// instead of adding one to the main webview bundle.
;(window as unknown as Record<string, unknown>).__sanitizeSvg = createSvgSanitizer(DOMPurify)
