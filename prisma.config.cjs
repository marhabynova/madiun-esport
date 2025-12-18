// Canonical Prisma CLI config (CommonJS) for local dev
// Uses DATABASE_URL from env or fallback to local postgres
module.exports = {
    datasources: {
        db: {
            provider: 'postgresql',
            url: process.env.DATABASE_URL || 'postgresql://madira:madira1922@localhost:5433/madira',
        },
    },
    client: {
        engine: {
            type: process.env.PRISMA_CLIENT_ENGINE || 'library',
        },
    },
}
