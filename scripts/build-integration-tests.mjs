import * as esbuild from 'esbuild'

await esbuild.build({
  entryPoints: ['test/integration/suite.ts'],
  bundle: true,
  outfile: 'dist/integration/suite.js',
  external: ['vscode'],
  format: 'cjs',
  platform: 'node',
  target: 'node22',
  sourcemap: true,
})

await esbuild.build({
  entryPoints: ['test/integration/csp-recorder.ts'],
  bundle: true,
  outfile: 'dist/integration/csp-recorder.js',
  format: 'iife',
  platform: 'browser',
  target: 'es2022',
})

console.log('Integration test bundle complete.')
