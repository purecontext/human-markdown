---
paths:
  - "webview/editor/*-plugin.ts"
---

# MDAST Metadata Must Live in ProseMirror Attrs

Content round-trips MDAST → ProseMirror → MDAST. `parseMarkdown` runners pass only the attrs declared in the `$nodeSchema` to `openNode`, and `toMarkdown` runners read only `node.attrs`. Any MDAST property a remark plugin sets that isn't mirrored into a declared attr disappears after the first edit, and the serialized markdown changes format the user never touched.

When a remark plugin records anything that affects serialization (marker style, inline vs. block form, original spelling), declare it as an attr in the node schema, copy it in `parseMarkdown`, and read it back in `toMarkdown`. Add a round-trip fixture that would change bytes if the attr were dropped.

Check: every MDAST field a custom `toMarkdown` depends on has a matching schema attr.
