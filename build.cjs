const esbuild = require('esbuild')

esbuild
  .build({
    bundle: true,
    entryPoints: ['src/index.ts'],
    format: 'cjs',
    legalComments: 'none',
    logLevel: 'info',
    minify: false,
    outfile: 'dist/index.js',
    platform: 'node',
    sourcemap: false,
    target: ['node24'],
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
