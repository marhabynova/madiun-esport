-- Migration: add stats models (MatchPlayerStats, MatchTeamStats, MatchExtra, StatDefinition)
-- Generated: 2025-12-17

CREATE TABLE IF NOT EXISTS "MatchPlayerStats" (
  "id" TEXT PRIMARY KEY,
  "matchId" TEXT NOT NULL,
  "playerId" TEXT NOT NULL,
  "stats" JSONB NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "MatchTeamStats" (
  "id" TEXT PRIMARY KEY,
  "matchId" TEXT NOT NULL,
  "teamId" TEXT NOT NULL,
  "stats" JSONB NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "MatchExtra" (
  "id" TEXT PRIMARY KEY,
  "matchId" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "StatDefinition" (
  "id" TEXT PRIMARY KEY,
  "key" TEXT UNIQUE NOT NULL,
  "label" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "required" BOOLEAN DEFAULT false,
  "meta" JSONB,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes to help lookups
CREATE INDEX IF NOT EXISTS idx_matchplayerstats_matchId ON "MatchPlayerStats" ("matchId");
CREATE INDEX IF NOT EXISTS idx_matchteamstats_matchId ON "MatchTeamStats" ("matchId");
CREATE INDEX IF NOT EXISTS idx_matchextra_matchId ON "MatchExtra" ("matchId");
