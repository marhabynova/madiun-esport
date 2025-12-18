// Prisma v7 configuration (ESM)
export default {
    datasources: {
        db: {
            provider: 'postgresql',
            url: process.env.DATABASE_URL,
        },
    },
    client: {
        engine: {
            // prefer the local library engine for Node environments used in tests/dev
            type: 'library',
        },
    },
}
