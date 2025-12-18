import { connect } from '../../../../services/events/sseAdapter'

export async function GET() {
    const { stream } = connect()
    return new Response(stream, {
        status: 200,
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            Connection: 'keep-alive',
        },
    })
}
