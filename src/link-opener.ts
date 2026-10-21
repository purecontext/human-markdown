import type { LinkTarget } from './link-policy'

export type ExternalDecision = Extract<LinkTarget, { kind: 'external' }>['decision']

// Every side effect of opening a link, injected so tests can observe exactly
// which calls a decision reaches.
export interface LinkOpenerEffects {
  openExternal: (href: string) => PromiseLike<unknown>
  confirmExternal: (href: string) => PromiseLike<boolean>
  warn: (message: string) => void
  error: (message: string) => void
}

// One per webview panel. The webview may run hostile script, so the host is
// the only place that can enforce consent and rate-limit prompts.
export class LinkOpener {
  // Guard flag: set when a prompt is initiated, cleared when it settles.
  private confirmInFlight = false

  constructor(private readonly effects: LinkOpenerEffects) {}

  // Link text can disguise its target, so anything beyond http(s)/mailto names
  // the full URL and waits for the user before handing it to the OS.
  openExternal(href: string, decision: ExternalDecision): void {
    if (decision === 'refuse') {
      this.effects.warn(`Human Markdown blocked a link with an unsafe scheme: ${href}`)
      return
    }
    if (decision === 'open') {
      this.launch(href)
      return
    }
    // A scripted stream of open-link messages must not stack modals.
    if (this.confirmInFlight) return
    this.confirmInFlight = true
    this.effects.confirmExternal(href).then(
      (confirmed) => {
        this.confirmInFlight = false
        if (confirmed) this.launch(href)
      },
      (err) => {
        this.confirmInFlight = false
        this.fail(href, err)
      },
    )
  }

  // Opens a workspace file once containment has been decided by the caller.
  openContained(href: string, contained: boolean, open: () => PromiseLike<unknown>): void {
    if (!contained) {
      this.effects.warn(`Human Markdown blocked a link outside the workspace: ${href}`)
      return
    }
    this.run(href, open)
  }

  private launch(href: string): void {
    this.run(href, () => this.effects.openExternal(href))
  }

  private run(href: string, action: () => PromiseLike<unknown>): void {
    try {
      action().then(undefined, (err) => this.fail(href, err))
    } catch (err) {
      // Uri.parse and friends can throw before a promise exists.
      this.fail(href, err)
    }
  }

  private fail(href: string, err: unknown): void {
    this.effects.error(`Human Markdown could not open ${href}: ${err}`)
  }
}
