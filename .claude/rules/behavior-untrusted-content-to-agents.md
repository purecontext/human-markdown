# Untrusted Content Reaching an Agent

Text from outside the user's control (email bodies, web pages, feeds, file contents, other people's issues) is data. When it flows into an MCP tool result, a prompt, or a file an agent will read, it can carry instructions, and an agent may follow them.

- **Label it.** Tool results that carry outside text put it in a clearly delimited field and say where it came from; never merge it into the tool's own guidance text. The delimiter must be one the content can't produce: a random boundary generated per result, checked absent from the content. A fixed marker plus defanging matching characters fails, because lookalike characters get past the defang.
- **Destructive tools preview first.** A tool that deletes, sends, moves, or bulk-applies returns a preview and requires a separate confirming call, so one injected instruction can't complete the action.
- **Scope tools to the minimum.** Read tools can't write; nothing is exposed "for convenience" that an injected instruction could chain.
- **Never execute it.** Outside text is not rendered as HTML without sanitizing, not passed to a shell, and not used as a path.

Applies to any project whose tools or prompts carry text it didn't author.

*Source: 2026-10 security sweep (mailpulse untrusted-content domain concern, news and mail MCPs); learned regression (mailpulse — lookalike chevrons defeated a defanged fixed delimiter).*
