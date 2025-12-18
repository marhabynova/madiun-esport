import { PrismaClient } from '@prisma/client'
import prisma from '../../lib/prisma'
import { AppError } from '../../lib/errors'
import {
    validateStatsForMatch,
    createRevisionForMatch,
    createAuditLogForMatch,
    recalcAggregatesForTournament,
    emitMatchFinalizedEvent,
} from './helpers'

// use shared client from lib/prisma

/**
 * Service: finalizeMatch
 * Implements the steps from SERVICE_CONTRACTS.md
 * - Validate preconditions
 * - Validate stats via StatDefinition
 * - Create revision & audit log inside a transaction
 * - Set match status to COMPLETED
 * - Recalculate aggregates
 * - Emit domain event
 */
export async function finalizeMatch(matchId: string, actorId?: string, reason?: string): Promise<void> {
    // 1. Load match
    const match = await prisma.match.findUnique({ where: { id: matchId } })
    if (!match) throw new AppError.NotFound('Match not found')

    // 2. Preconditions
    if (match.status === 'COMPLETED') throw new AppError.Conflict('Match already completed')

    // 3. Validate stats (stat definitions enforced in service layer)
    const statsValid = await validateStatsForMatch(matchId, prisma)
    if (!statsValid) throw new AppError.Validation('Match stats are invalid or incomplete')

    // 4. Transaction: create revision, audit log, set status, recalc aggregates
    await prisma.$transaction(async (tx) => {
        // create revision
        await createRevisionForMatch(tx, match, actorId, reason)

        // create audit log
        await createAuditLogForMatch(tx, match, actorId, reason)

        // update match status
        await tx.match.update({ where: { id: matchId }, data: { status: 'COMPLETED' } })

        // recalc aggregates
        await recalcAggregatesForTournament(tx, match.tournamentId)
    })

    // 5. Emit domain event (SSE/WebSocket) from service layer
    // Emit domain event; do not fail finalize if emit fails
    await emitMatchFinalizedEvent(matchId).catch((emitErr) => {
        // log and continue

        console.error('emitMatchFinalizedEvent error', emitErr)
    })
}
