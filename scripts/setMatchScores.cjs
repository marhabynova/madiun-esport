/* eslint-disable @typescript-eslint/no-require-imports */
#!/usr/bin / env node
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const id = process.argv[2]
    if (!id) {
        console.error('Usage: node scripts/setMatchScores.cjs <matchId>')
        process.exit(1)
    }
    try {
        await prisma.match.update({ where: { id }, data: { scoreA: 3, scoreB: 2 } })
        console.log('updated')
    } catch (e) {
        console.error(e)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

if (require.main === module) main()
