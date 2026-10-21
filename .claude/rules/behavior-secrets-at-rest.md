# Secrets at Rest

Credentials the app stores (OAuth tokens, API keys, bank or sync credentials) live in the OS keychain, or in a file outside the repo created with mode `0600`. Never in the repo, in a world-readable data dir, in config the UI echoes back, or in logs.

- **Never log them.** Redact tokens, auth headers, and credential fields in log lines and error messages, including errors from the library that used them.
- **Never return them.** API responses and MCP tool results expose whether a credential exists and its scope, not its value.
- **Gitignore the data dir** before the first write, and check that `git status` doesn't show it.

Test-only fixtures with fake values are fine in the repo.

*Source: 2026-10 security sweep (finpulse SimpleFIN credentials, mailpulse Gmail tokens).*
