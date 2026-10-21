import { createJavaScriptRegexEngine } from '@shikijs/engine-javascript'
import bash from '@shikijs/langs/bash'
import c from '@shikijs/langs/c'
import cpp from '@shikijs/langs/cpp'
import css from '@shikijs/langs/css'
import go from '@shikijs/langs/go'
import html from '@shikijs/langs/html'
import java from '@shikijs/langs/java'
import javascript from '@shikijs/langs/javascript'
import json from '@shikijs/langs/json'
import markdown from '@shikijs/langs/markdown'
import python from '@shikijs/langs/python'
import rust from '@shikijs/langs/rust'
import sql from '@shikijs/langs/sql'
import typescript from '@shikijs/langs/typescript'
import yaml from '@shikijs/langs/yaml'
import githubDark from '@shikijs/themes/github-dark'
import githubLight from '@shikijs/themes/github-light'
import { createHighlighterCore } from 'shiki/core'

// ADR-017: shiki/core with static grammar imports and the JavaScript regex
// engine. The default `shiki` entry bundles every grammar plus the WASM
// Oniguruma engine, which needs 'wasm-unsafe-eval' in the CSP.
const ready = createHighlighterCore({
  themes: [githubLight, githubDark],
  langs: [
    javascript,
    typescript,
    json,
    html,
    css,
    python,
    bash,
    markdown,
    yaml,
    sql,
    rust,
    go,
    java,
    c,
    cpp,
  ],
  engine: createJavaScriptRegexEngine(),
})
;(window as unknown as Record<string, unknown>).__shikiReady = ready
// Announce synchronously, as soon as the promise exists: views waiting on this
// event then chain on __shikiReady themselves. Firing it after the highlighter
// resolves could land after window load, which waiters treat as "unavailable".
window.dispatchEvent(new Event('shiki-ready'))
