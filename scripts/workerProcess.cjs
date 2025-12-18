require('dotenv/config')
const { main } = require('./processAuditSubmissions.cjs')

const INTERVAL_MS = Number(process.env.PROCESS_SUBMISSIONS_INTERVAL_MS) || 60_000

async function loop() {
    console.log('Worker started, running processor every', INTERVAL_MS, 'ms')
    while (true) {
        try {
            await main()
        } catch (err) {
            console.error('Processor run failed', err)
        }
        await new Promise((r) => setTimeout(r, INTERVAL_MS))
    }
}

loop()
