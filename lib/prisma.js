const { PrismaClient } = require('@prisma/client')

if (!global.prisma) {
    const opts = { errorFormat: 'pretty' }
    if (process.env.PRISMA_CLIENT_ENGINE === 'library') {
        opts.__internal = { engine: { type: 'library' } }
    }
    // For older Prisma clients (v4) do not set adapter/accelerateUrl here.
    // Keep __internal engine option when using the 'library' engine.
    global.prisma = new PrismaClient(opts)
}

module.exports = global.prisma
