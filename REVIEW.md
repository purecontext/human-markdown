# Review instructions — human-markdown

Read by `/crucible:review` from the base branch, never from a PR's own changes. It says what Important means in this repo, what to skip, and what a finding needs as evidence. Keep it short; a rule here is read on every review. Anthropic's Code Review reads a root `REVIEW.md` the same way, so this file serves both.

## What Important means here

Reserve Important for a finding that would break behavior this repo claims, corrupt or lose data, or open the local attack surface (a listener, a path from input, a spawn, outside content). Naming, shape and refactoring suggestions are Nit at most. A finding that holds the code to a stronger claim than its docs or the PR body make is a scope question for the user, not a severity.

<!-- Say what failure looks like in this repo. For a docs repo: "it lies". For a config repo: "it misroutes". For a tool: "a wrong result on a real input". -->

## Cap the nits

Report at most five Nits per review.

## Do not report

- Anything CI already enforces: lint, formatting, type errors
- Generated files and lockfiles
- Test-only code that intentionally violates production rules

## Evidence

A behavior claim needs a file and line in the source, never an inference from a name. An absence claim ("no cleanup", "no guard") needs the enclosing scope read, not the hunk.

## Always check

<!-- Repo-specific checks, one line each. "New routes have an integration test." "Log lines carry no user identifiers." -->
