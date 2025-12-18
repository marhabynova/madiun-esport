import { PrismaClient } from '@prisma/client'
import type { Prisma } from '@prisma/client'

declare global {
    // allow global prisma singleton in dev env

    var prisma: PrismaClient | undefined
}

const makePrisma = () => {
    const base: Prisma.PrismaClientOptions = { errorFormat: 'pretty' }
    // Use a shallow copy so we can attach __internal when requested
    const opts = { ...base } as Record<string, unknown>
    if (process.env.PRISMA_CLIENT_ENGINE === 'library') {
        opts.__internal = { engine: { type: 'library' } }
    }
    // For older Prisma clients (v4) do not set adapter/accelerateUrl here.
    // Keep __internal engine option when using the 'library' engine.
    return new PrismaClient(opts as unknown as Prisma.PrismaClientOptions)
}

export const prisma = global.prisma ?? makePrisma()
if (process.env.NODE_ENV !== 'production') global.prisma = prisma

export default prisma
