import { Router } from "express";
import fs from "fs";
import path from "path";
import { logger } from "../lib/logger";

const router = Router();

const workspaceRoot = process.cwd().endsWith(path.join("artifacts", "api-server"))
  ? path.resolve(process.cwd(), "../..")
  : process.cwd();

const dataDir = path.resolve(workspaceRoot, "artifacts/api-server/data");
const obrasFile = path.join(dataDir, "obras.json");

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function loadObras(): any[] {
  ensureDataDir();
  if (!fs.existsSync(obrasFile)) return [];
  try {
    return JSON.parse(fs.readFileSync(obrasFile, "utf-8"));
  } catch {
    return [];
  }
}

function saveObras(obras: any[]) {
  ensureDataDir();
  fs.writeFileSync(obrasFile, JSON.stringify(obras, null, 2));
}

// GET /api/obras
router.get("/obras", (req, res) => {
  const obras = loadObras();
  const { studentName, status } = req.query;
  let result = obras;
  if (studentName) {
    result = result.filter((o) =>
      o.studentName.toLowerCase().includes((studentName as string).toLowerCase())
    );
  }
  if (status) {
    result = result.filter((o) => o.status === status);
  }
  res.json(result);
});

// GET /api/obras/:id
router.get("/obras/:id", (req, res) => {
  const obras = loadObras();
  const obra = obras.find((o) => o.id === req.params.id);
  if (!obra) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(obra);
});

// POST /api/obras
router.post("/obras", (req, res) => {
  const { localId, studentName, title, description, category, hours, date } = req.body;

  if (!localId || !studentName || !title || !category || hours == null || !date) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const obras = loadObras();

  // Prevent duplicate submissions
  const existing = obras.find((o) => o.localId === localId);
  if (existing) {
    res.status(201).json(existing);
    return;
  }

  const obra = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    localId,
    studentName,
    title,
    description: description ?? "",
    category,
    hours: Number(hours),
    date,
    status: "pending",
    teacherComment: null,
    createdAt: new Date().toISOString(),
    reviewedAt: null,
  };

  obras.unshift(obra);
  saveObras(obras);
  logger.info({ id: obra.id, student: studentName }, "New obra submitted");
  res.status(201).json(obra);
});

// PATCH /api/obras/:id/review
router.patch("/obras/:id/review", (req, res) => {
  const obras = loadObras();
  const idx = obras.findIndex((o) => o.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const { status, teacherComment } = req.body;
  if (!["approved", "rejected"].includes(status)) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  obras[idx] = {
    ...obras[idx],
    status,
    teacherComment: teacherComment ?? null,
    reviewedAt: new Date().toISOString(),
  };

  saveObras(obras);
  logger.info({ id: req.params.id, status }, "Obra reviewed");
  res.json(obras[idx]);
});

export default router;
