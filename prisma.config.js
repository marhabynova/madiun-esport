// ESM-compatible Prisma config. Some Prisma CLI installations parse .js as ESM,
// so provide an `export default` shape that uses the same canonical values.
// Delegate to canonical CommonJS config to avoid ESM/CommonJS parse issues
module.exports = require('./prisma.config.cjs')
