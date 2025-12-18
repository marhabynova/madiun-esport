/* eslint-disable @typescript-eslint/no-require-imports */
// CommonJS runner to load TypeScript test with ts-node register
try {
    require('dotenv/config')
    require('ts-node/register/transpile-only')
    // Import the TS test file
    require('./testFinalizeMatch.ts')
} catch (err) {
    // Fail loudly and preserve stack
    console.error(err)
    process.exit(1)
}
