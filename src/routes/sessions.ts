import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import Session from "../models/Session";
import { authenticateToken, AuthRequest } from "../middleware/auth";

export const sessionRouter = Router();

// GET /api/sessions - Public route
sessionRouter.get("/", async (_req: Request, res: Response) => {
  const sessions = await Session.find().sort({ subject: 1 });
  res.json(sessions);
});

// GET /api/sessions/:id - Public route
sessionRouter.get("/:id", async (req: Request, res: Response) => {
  let session = null;
  if (mongoose.isValidObjectId(req.params.id)) {
    session = await Session.findById(req.params.id);
  }
  if (!session) {
    session = await Session.findOne({
      subject: new RegExp(`^${req.params.id}$`, "i"),
    });
  }

  if (!session) {
    res.status(404).json({
      message: `No session with id or subject "${req.params.id}"`,
    });
    return;
  }

  res.json(session);
});

// CREATE A SESSION - Private
sessionRouter.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, subject, price, duration, ratePerHour, durationMinutes } = req.body;

    if (!subject && !title) {
      res.status(400).json({
        message: "Subject is required.",
      });
      return;
    }

    const session = await Session.create({
      subject: String(subject || title).trim(),
      title: String(title || subject).trim(),
      description: description ? String(description).trim() : "",
      tutor: req.userId,
      ratePerHour: Number(ratePerHour ?? price ?? 250),
      durationMinutes: Number(durationMinutes ?? duration ?? 60),
      price: Number(price ?? ratePerHour ?? 250),
      duration: Number(duration ?? durationMinutes ?? 60),
    });

    res.status(201).json(session);
  } catch (error) {
    console.error("Create session error:", error);
    res.status(500).json({
      message: "Failed to create session.",
    });
  }
});

// UPDATE A SESSION - Private
sessionRouter.put("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({
        message: "Invalid session ID.",
      });
      return;
    }

    const session = await Session.findById(req.params.id);

    if (!session) {
      res.status(404).json({
        message: "Session not found.",
      });
      return;
    }

    Object.assign(session, req.body);
    await session.save();

    res.status(200).json(session);
  } catch (error) {
    console.error("Update session error:", error);
    res.status(500).json({
      message: "Failed to update session.",
    });
  }
});

// DELETE A SESSION - Private
sessionRouter.delete("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({
        message: "Invalid session ID.",
      });
      return;
    }

    const session = await Session.findByIdAndDelete(req.params.id);

    if (!session) {
      res.status(404).json({
        message: "Session not found.",
      });
      return;
    }

    res.status(204).end();
  } catch (error) {
    console.error("Delete session error:", error);
    res.status(500).json({
      message: "Failed to delete session.",
    });
  }
});

export default sessionRouter;
