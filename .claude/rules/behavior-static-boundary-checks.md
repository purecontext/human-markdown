---
paths:
  - "test/**"
  - "tests/**"
  - "**/*.test.*"
  - "**/*.spec.*"
---
# Static Boundary Checks

A test that refuses code by reading its source (a layer-import check, a forbidden-module check, a forbidden-identifier check) fails on every spelling it does not recognize. It is a static check over listed forms, not a sandbox; say so wherever it is described.

- **Allowlist what is acceptable.** Name the builtins, packages, layers or kinds that may pass and fail everything else. A denylist of known-bad names misses the next one.
- **Define each category by its exact form.** "Relative" is `./`, `../`, `.` or `..`, not "starts with a dot" (`.pnpm/…` starts with a dot). "A package" is a Node builtin or a name declared in `package.json`; `file:` URLs, `#` subpath imports and path aliases are neither. A lookup keyed by outside input uses a `Map` or `Object.hasOwn`, never a plain object, whose prototype keys answer for missing ones.
- **Enumerate the language's other spellings** of what you refuse before calling it covered: casts, `!`, parentheses and optional chains around the target; `global`/`globalThis` aliases; destructuring in declarations, assignments and default parameters; computed and template-literal keys; rest elements; tagged-template calls; the runtime's other loaders (`createRequire`, `process.getBuiltinModule`, `module.require`).
- **Test rows use spellings that compile.** Run `tsc` on the refused form; a row the compiler rejects proves nothing about code that can land. Untyped APIs (`process.binding`) only ever appear behind a cast.
- **Contortions are declared scope, not silent gaps.** Aliasing to a variable, `Reflect.get`, string-built names: list them as out of scope in the check's doc comment.

*Source: learned regression (tvforge — a layer and forbidden-module checker missed `file:`, `#`, `.pnpm/`, `cluster`/`execve`/`inspector`, destructured and cast spellings, and a plain-object lookup answered for `constructor`; 4 occurrences across two PRs).*
