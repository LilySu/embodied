import { Router } from "express";
import { eq, and, or, desc, sql } from "drizzle-orm";
import { profiles, matches, messages } from "../../shared/schema";
import { db } from "../db";
import { isAuthenticated } from "../replit_integrations/auth";
import { computeSimilarityScore } from "../utils/matching";

export const communityRoutes = Router();

communityRoutes.use(isAuthenticated);

communityRoutes.get("/profile", async (req, res) => {
  try {
    const userId = (req as any).user.claims.sub;
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId));
    res.json(profile || null);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

communityRoutes.post("/profile", async (req, res) => {
  try {
    const userId = (req as any).user.claims.sub;
    const { displayName, city, latitude, longitude, bio, goals, sessionData } =
      req.body;

    const [existing] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId));

    if (existing) {
      const [updated] = await db
        .update(profiles)
        .set({
          displayName,
          city,
          latitude,
          longitude,
          bio,
          goals,
          sessionData,
          updatedAt: new Date(),
        })
        .where(eq(profiles.userId, userId))
        .returning();
      res.json(updated);
    } else {
      const [created] = await db
        .insert(profiles)
        .values({
          userId,
          displayName,
          city,
          latitude,
          longitude,
          bio,
          goals,
          sessionData,
        })
        .returning();
      res.json(created);
    }
  } catch (error) {
    console.error("Error saving profile:", error);
    res.status(500).json({ message: "Failed to save profile" });
  }
});

communityRoutes.get("/matches", async (req, res) => {
  try {
    const userId = (req as any).user.claims.sub;
    const userMatches = await db
      .select()
      .from(matches)
      .where(
        and(
          eq(matches.status, "accepted"),
          or(eq(matches.userId1, userId), eq(matches.userId2, userId))
        )
      );

    const results = [];
    for (const match of userMatches) {
      const otherUserId =
        match.userId1 === userId ? match.userId2 : match.userId1;
      const [otherProfile] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.userId, otherUserId));
      results.push({
        ...match,
        otherProfile: otherProfile || null,
      });
    }

    res.json(results);
  } catch (error) {
    console.error("Error fetching matches:", error);
    res.status(500).json({ message: "Failed to fetch matches" });
  }
});

communityRoutes.post("/find-matches", async (req, res) => {
  try {
    const userId = (req as any).user.claims.sub;

    const [myProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId));

    if (!myProfile || !myProfile.latitude || !myProfile.longitude) {
      return res
        .status(400)
        .json({ message: "Please set your location in your profile first" });
    }

    const existingMatches = await db
      .select()
      .from(matches)
      .where(or(eq(matches.userId1, userId), eq(matches.userId2, userId)));

    const matchedUserIds = new Set<string>();
    matchedUserIds.add(userId);
    for (const m of existingMatches) {
      matchedUserIds.add(m.userId1);
      matchedUserIds.add(m.userId2);
    }

    const allProfiles = await db.select().from(profiles);

    const candidates: Array<{
      profile: typeof myProfile;
      score: number;
      distance: number;
    }> = [];

    for (const p of allProfiles) {
      if (matchedUserIds.has(p.userId)) continue;
      if (!p.latitude || !p.longitude) continue;

      const dLat = ((p.latitude - myProfile.latitude) * Math.PI) / 180;
      const dLon = ((p.longitude - myProfile.longitude) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((myProfile.latitude * Math.PI) / 180) *
          Math.cos((p.latitude * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = 6371 * c;

      if (distance > 50) continue;

      const score = computeSimilarityScore(myProfile.sessionData, p.sessionData);
      candidates.push({ profile: p, score, distance });
    }

    candidates.sort((a, b) => b.score - a.score);
    const top5 = candidates.slice(0, 5);

    const createdMatches = [];
    for (const candidate of top5) {
      const [newMatch] = await db
        .insert(matches)
        .values({
          userId1: userId,
          userId2: candidate.profile.userId,
          similarityScore: candidate.score,
          status: "pending",
        })
        .returning();
      createdMatches.push({
        ...newMatch,
        otherProfile: candidate.profile,
        distance: candidate.distance,
      });
    }

    res.json(createdMatches);
  } catch (error) {
    console.error("Error finding matches:", error);
    res.status(500).json({ message: "Failed to find matches" });
  }
});

communityRoutes.post("/matches/:matchId/accept", async (req, res) => {
  try {
    const userId = (req as any).user.claims.sub;
    const { matchId } = req.params;

    const [match] = await db
      .select()
      .from(matches)
      .where(eq(matches.id, matchId));

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    if (match.userId1 !== userId && match.userId2 !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const [updated] = await db
      .update(matches)
      .set({ status: "accepted" })
      .where(eq(matches.id, matchId))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error("Error accepting match:", error);
    res.status(500).json({ message: "Failed to accept match" });
  }
});

communityRoutes.get("/matches/:matchId/messages", async (req, res) => {
  try {
    const userId = (req as any).user.claims.sub;
    const { matchId } = req.params;

    const [match] = await db
      .select()
      .from(matches)
      .where(eq(matches.id, matchId));

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    if (match.userId1 !== userId && match.userId2 !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const matchMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.matchId, matchId))
      .orderBy(messages.createdAt);

    res.json(matchMessages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

communityRoutes.post("/matches/:matchId/messages", async (req, res) => {
  try {
    const userId = (req as any).user.claims.sub;
    const { matchId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Message content is required" });
    }

    const [match] = await db
      .select()
      .from(matches)
      .where(eq(matches.id, matchId));

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    if (match.userId1 !== userId && match.userId2 !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const [message] = await db
      .insert(messages)
      .values({
        matchId,
        senderId: userId,
        content,
      })
      .returning();

    res.json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
});
