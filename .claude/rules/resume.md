# Session Resume Context

## Working on
Fixing bugs reported by felixontv (issues #133, #134, #135)

## Completed
- Investigated all three issues from felixontv against Cursor previewer-swap hypothesis — none are Cursor-related (user is on VS Code on Linux)
- Fixed #135 (checkbox save failure): stale-content guard in `saveWebviewContent` rejected source-spliced saves from the same webview. Added `lastAppliedSource` tracking so the guard only rejects saves from a *different* webview panel.

## Next
- #134 (frontmatter/H1 edits intermittently not registered): likely a timing window in the `markdownUpdated` listener guards. Needs investigation of the debounce + guard flag interaction.
- #133 (git diff gutter missing): known platform limitation — VS Code diff decorations are a TextEditor/Monaco feature, not available in CustomTextEditorProvider webviews. Document as a known limitation.
