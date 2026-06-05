import { Router } from "express";
import fs from "fs";
import path from "path";
import { logger } from "../lib/logger";

const router = Router();

const dataDir = path.resolve(process.cwd(), "data");
const obrasFile = path.join(dataDir, "obras.json");
const tokensFile = path.join(dataDir, "teacher-tokens.json");

function ensureDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

function loadObras(): any[] {
  ensureDir();
  if (!fs.existsSync(obrasFile)) return [];
  try { return JSON.parse(fs.readFileSync(obrasFile, "utf-8")); } catch { return []; }
}

function saveObras(obras: any[]) {
  ensureDir();
  fs.writeFileSync(obrasFile, JSON.stringify(obras, null, 2));
}

function loadTokens(): string[] {
  ensureDir();
  if (!fs.existsSync(tokensFile)) return [];
  try { return JSON.parse(fs.readFileSync(tokensFile, "utf-8")); } catch { return []; }
}

function saveTokens(tokens: string[]) {
  ensureDir();
  fs.writeFileSync(tokensFile, JSON.stringify(tokens, null, 2));
}

async function sendPushToTeachers(title: string, body: string) {
  const tokens = loadTokens();
  if (tokens.length === 0) return;
  const messages = tokens.map((to) => ({ to, title, body, sound: "default" }));
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
router.get("/obras", (req, res) => {
  const obras = loadObras();
  const { studentName, status } = req.query;
  let result = obras;
  if (studentName) result = result.filter((o) => o.studentName?.toLowerCase().includes((studentName as string).toLowerCase()));
  if (status) result = result.filter((o) => o.status === status);
  res.json(result);
});

// GET /api/obras/:id
router.get("/obras/:id", (req, res) => {
  const obra = loadObras().find((o) => o.id === req.params.id);
  if (!obra) { res.status(404).json({ error: "Not found" }); return; }
  res.json(obra);
});

// POST /api/obras
router.post("/obras", async (req, res) => {
  const { localId, studentName, title, description, category, hours, date, photo } = req.body;
  if (!localId || !studentName || !title || !category || hours == null || !date) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  const obras = loadObras();
  const existing = obras.find((o) => o.localId === localId);
  if (existing) { res.status(201).json(existing); return; }

  const obra = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    localId, studentName, title,
    description: description ?? "",
    category,
    hours: Number(hours),
    date,
    photo: photo ?? null,
    status: "pending",
    teacherComment: null,
    createdAt: new Date().toISOString(),
    reviewedAt: null,
  };

  obras.unshift(obra);
  saveObras(obras);
  logger.info({ id: obra.id, student: studentName }, "New obra submitted");

  // Push notification to teachers (fire and forget)
  sendPushToTeachers("📋 Nueva obra pendiente", `${studentName} envió "${title}"`).catch(() => {});

  res.status(201).json(obra);
});

// PATCH /api/obras/:id/review
router.patch("/obras/:id/review", (req, res) => {
  const obras = loadObras();
  const idx = obras.findIndex((o) => o.id === req.params.id);
  if (idx === -1) { res.status(404).json({ error: "Not found" }); return; }
  const { status, teacherComment } = req.body;
  if (!["approved", "rejected"].includes(status)) { res.status(400).json({ error: "Invalid status" }); return; }
  obras[idx] = { ...obras[idx], status, teacherComment: teacherComment ?? null, reviewedAt: new Date().toISOString() };
  saveObras(obras);
  logger.info({ id: req.params.id, status }, "Obra reviewed");
  res.json(obras[idx]);
});

// POST /api/teacher-tokens
router.post("/teacher-tokens", (req, res) => {
  const { token } = req.body;
  if (!token) { res.status(400).json({ error: "Token required" }); return; }
  const tokens = loadTokens();
  if (!tokens.includes(token)) {
    tokens.push(token);
    saveTokens(tokens);
    logger.info({ token: token.substring(0, 20) + "..." }, "Teacher token registered");
  }
  res.json({ ok: true });
});

export default router;
