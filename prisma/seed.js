const prisma = require('../lib/prisma')

async function main() {
    await prisma.game.upsert({
        where: { key: 'mlbb' },
        update: {},
        create: { key: 'mlbb', name: 'Mobile Legends: Bang Bang' }
    })
    await prisma.game.upsert({
        where: { key: 'free-fire' },
        update: {},
        create: { key: 'free-fire', name: 'Free Fire' }
    })
    await prisma.game.upsert({
        where: { key: 'point-blank' },
        update: {},
        create: { key: 'point-blank', name: 'Point Blank' }
    })

    console.log('Seed completed')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
