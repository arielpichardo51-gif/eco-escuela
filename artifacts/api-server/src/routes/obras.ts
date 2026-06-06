import { Router } from "express";
import { db } from "@workspace/db";
import { obrasTable, teacherTokensTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

async function sendPushToTeachers(title: string, body: string) {
  const rows = await db.select().from(teacherTokensTable);
  if (rows.length === 0) return;
  const messages = rows.map((r) => ({ to: r.token, title, body, sound: "default" }));
  try {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(messages),
    });
    logger.info({ count: messages.length }, "Push notifications sent to teachers");
  } catch (err) {
    logger.warn({ err }, "Failed to send push notifications");
  }
}

// GET /api/obras
router.get("/obras", async (req, res) => {
  try {
    const { studentName, status } = req.query;
    let rows = await db
      .select()
      .from(obrasTable)
      .orderBy(desc(obrasTable.createdAt));

    if (studentName) {
      rows = rows.filter((o) =>
        o.studentName.toLowerCase().includes((studentName as string).toLowerCase())
      );
    }
    if (status) {
      rows = rows.filter((o) => o.status === status);
    }
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Error listing obras");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/obras/:id
router.get("/obras/:id", async (req, res) => {
  try {
    const [obra] = await db
      .select()
      .from(obrasTable)
      .where(eq(obrasTable.id, req.params.id));
    if (!obra) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(obra);
  } catch (err) {
    req.log.error({ err }, "Error getting obra");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/obras
router.post("/obras", async (req, res) => {
  try {
    const { localId, studentName, title, description, category, hours, date, photo } = req.body;
    if (!localId || !studentName || !title || !category || hours == null || !date) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    // Idempotent: return existing if same localId
    const [existing] = await db
      .select()
      .from(obrasTable)
      .where(eq(obrasTable.localId, localId));
    if (existing) {
      res.status(201).json(existing);
      return;
    }

    const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    const [obra] = await db
      .insert(obrasTable)
      .values({
        id,
        localId,
        studentName,
        title,
        description: description ?? "",
        category,
        hours: Number(hours),
        date,
        photo: photo ?? null,
        status: "pending",
      })
      .returning();

    logger.info({ id: obra.id, student: studentName }, "New obra submitted");

    // Push notification — fire and forget
    sendPushToTeachers(
      "📋 Nueva obra pendiente",
      `${studentName} envió "${title}"`
    ).catch(() => {});

    res.status(201).json(obra);
  } catch (err) {
    req.log.error({ err }, "Error submitting obra");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/obras/:id/review
router.patch("/obras/:id/review", async (req, res) => {
  try {
    const { status, teacherComment } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }

    const [updated] = await db
      .update(obrasTable)
      .set({
        status,
        teacherComment: teacherComment ?? null,
        reviewedAt: new Date(),
      })
      .where(eq(obrasTable.id, req.params.id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    logger.info({ id: req.params.id, status }, "Obra reviewed");
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Error reviewing obra");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/teacher-tokens
router.post("/teacher-tokens", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      res.status(400).json({ error: "Token required" });
      return;
    }
    await db
      .insert(teacherTokensTable)
      .values({ token })
      .onConflictDoNothing();
    logger.info({ token: token.substring(0, 20) + "..." }, "Teacher token registered");
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Error registering teacher token");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
