import { PrismaClient } from '@prisma/client'

declare global {
    // allow global prisma singleton in dev env

    var prisma: PrismaClient | undefined
}

const makePrisma = () => {
    const opts: any = { errorFormat: 'pretty' }
    if (process.env.PRISMA_CLIENT_ENGINE === 'library') {
        opts.__internal = { engine: { type: 'library' } }
    }
    // For older Prisma clients (v4) do not set adapter/accelerateUrl here.
    // Keep __internal engine option when using the 'library' engine.
    return new PrismaClient(opts)
}

export const prisma = global.prisma ?? makePrisma()
if (process.env.NODE_ENV !== 'production') global.prisma = prisma

export default prisma
