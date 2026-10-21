import { mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { runTests } from '@vscode/test-electron'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const extensionDevelopmentPath = path.resolve(__dirname, '..')
const extensionTestsPath = path.resolve(extensionDevelopmentPath, 'dist', 'integration', 'suite.js')
const tempRoot = mkdtempSync('/tmp/hm-it-')
const workspacePath = path.join(tempRoot, 'workspace')
const userDataPath = path.join(tempRoot, 'user-data')
const extensionsPath = path.join(tempRoot, 'extensions')

mkdirSync(workspacePath)

try {
  await runTests({
    extensionDevelopmentPath,
    extensionTestsPath,
    extensionTestsEnv: {
      HUMAN_MARKDOWN_TEST_HOOKS: '1',
      // Optional substring filter on test names, e.g. HM_IT_GREP=mermaid.
      HM_IT_GREP: process.env.HM_IT_GREP ?? '',
    },
    launchArgs: [
      workspacePath,
      `--user-data-dir=${userDataPath}`,
      `--extensions-dir=${extensionsPath}`,
    ],
  })
} finally {
  rmSync(tempRoot, { recursive: true, force: true })
}
