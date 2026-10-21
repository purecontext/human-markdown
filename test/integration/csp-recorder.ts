// Loaded synchronously before every other webview script, and only when test
// hooks are enabled, so CSP violations raised while the async library bundles
// evaluate are recorded too. The webview's test state reports this list.
const violations: string[] = []
;(window as unknown as Record<string, unknown>).__cspViolations = violations
document.addEventListener('securitypolicyviolation', (event) => {
  violations.push(`${event.violatedDirective} ${event.blockedURI}`)
})
