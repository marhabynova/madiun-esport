import type { Prisma, PrismaClient, Match } from '@prisma/client'

type ModelLike = {
    findMany?: (args?: unknown) => Promise<unknown[]>
}

// Helper implementations for finalize/revise flows.
// These are intentionally simple and deterministic. Replace with full domain logic later.

export async function validateStatsForMatch(matchId: string, prisma: PrismaClient): Promise<boolean> {
    const client = prisma
    // Basic validation: match must exist
    const match = await client.match.findUnique({ where: { id: matchId } })
    if (!match) return false

    // If StatDefinition model exists in schema, prefer validating against stat records
    const hasStatDefinitionModel = typeof (client as unknown as Record<string, unknown>).statDefinition !== 'undefined'

    // Helper: check dynamic stat models for any records related to this match
    const statModelNames = ['matchPlayerStats', 'matchTeamStats', 'matchExtra']
    let foundStatRecords = false
    for (const name of statModelNames) {
        const modelCandidate = (client as unknown as Record<string, unknown>)[name]
        const model = modelCandidate as ModelLike | undefined
        if (model && typeof model.findMany === 'function') {
            try {
                const recs = await model.findMany?.({ where: { matchId } })
                if (Array.isArray(recs) && recs.length > 0) {
                    foundStatRecords = true
                    break
                }
            } catch {
                // ignore model-specific errors and continue
            }
        }
    }

    // If StatDefinition exists, require stat records (preferred) or scores as fallback
    if (hasStatDefinitionModel) {
        if (foundStatRecords) return true
        // fallback to scores if stat records missing
        return match.scoreA != null && match.scoreB != null
    }

    // No stat definition model — use pragmatic rules:
    // require non-null scores OR some stat records (if models present)
    if (match.scoreA == null || match.scoreB == null) {
        return foundStatRecords
    }
    return true
}

export async function createRevisionForMatch(
    tx: Prisma.TransactionClient | PrismaClient,
    match: Match,
    actorId?: string,
    reason?: string
): Promise<void> {
    // store a snapshot of the match before modification
    await tx.revision.create({
        data: {
            entityType: 'MATCH',
            entityId: match.id,
            payload: match as Prisma.JsonValue,
            actorId: actorId ?? null,
            reason: reason ?? null,
        },
    })
}

export async function createAuditLogForMatch(
    tx: Prisma.TransactionClient | PrismaClient,
    match: Match,
    actorId?: string,
    reason?: string
): Promise<void> {
    const meta = { before: match, reason: reason ?? null }
    await tx.auditLog.create({
        data: {
            action: 'FINALIZE_MATCH',
            entityType: 'MATCH',
            entityId: match.id,
            actorId: actorId ?? null,
            meta,
        },
    })
}

export async function recalcAggregatesForTournament(tx: Prisma.TransactionClient | PrismaClient, tournamentId: string): Promise<void> {
    // Deterministic, simple aggregate: count completed matches and total scores per tournament
    const matches = await tx.match.findMany({ where: { tournamentId, status: 'COMPLETED' } })
    const totalMatches = matches.length
    const totals = matches.reduce(
        (acc, m) => {
            acc.scoreA += m.scoreA ?? 0
            acc.scoreB += m.scoreB ?? 0
            return acc
        },
        { scoreA: 0, scoreB: 0 }
    )

    const payload = { totalMatches, totals }

    // upsert leaderboard aggregate for tournament
    await tx.leaderboardAggregate.upsert({
        where: { tournamentId },
        create: { tournamentId, payload },
        update: { payload },
    })
}

import { emitEvent } from '../events/emitter'

export async function emitMatchFinalizedEvent(matchId: string): Promise<void> {
    // Delegate to event emitter adapters. Do not let adapters' failures
    // block the finalization flow.
    try {
        await emitEvent('match.finalized', { matchId, at: new Date().toISOString() })
    } catch (err) {
        // emitEvent itself guards adapters, but keep defensive handling here

        console.error('emitMatchFinalizedEvent failed', err)
    }
}

