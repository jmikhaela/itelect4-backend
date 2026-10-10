
import { Router, Response } from "express";
import mongoose from "mongoose";
import Session from "../models/Session";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();

// GET ALL AVAILABLE SESSIONS
router.get("/", async (_req, res) => {
  try {
    const sessions = await Session.find({ isAvailable: true })
      .populate("tutor", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: sessions.length,
      sessions,
    });
  } catch (error) {
    console.error("Fetch sessions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sessions.",
    });
  }
});

// GET A SESSION BY ID
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({
        success: false,
        message: "Invalid session ID.",
      });
      return;
    }

    const session = await Session.findById(req.params.id)
      .populate("tutor", "name email");

    if (!session) {
      res.status(404).json({
        success: false,
        message: "Session not found.",
      });
      return;
    }

    res.status(200).json({ success: true, session });
  } catch (error) {
    console.error("Fetch session error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch session.",
    });
  }
});

// CREATE A SESSION
router.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, subject, price, duration } = req.body;

    if (!title || !subject || price === undefined || duration === undefined) {
      res.status(400).json({
        success: false,
        message: "Title, subject, price, and duration are required.",
      });
      return;
    }

    if (
      !Number.isFinite(Number(price)) ||
      Number(price) < 0 ||
      !Number.isInteger(Number(duration)) ||
      Number(duration) < 1
    ) {
      res.status(400).json({
        success: false,
        message: "Price must be non-negative and duration must be a positive integer.",
      });
      return;
    }

    const session = await Session.create({
      title: String(title).trim(),
      description: description ? String(description).trim() : "",
      subject: String(subject).trim(),
      tutor: req.userId,
      price: Number(price),
      duration: Number(duration),
    });

    res.status(201).json({
      success: true,
      message: "Session created successfully.",
      session,
    });
  } catch (error) {
    console.error("Create session error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create session.",
    });
  }
});

// UPDATE A SESSION
router.put("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({
        success: false,
        message: "Invalid session ID.",
      });
      return;
    }

    const session = await Session.findOne({
      _id: req.params.id,
      tutor: req.userId,
    });

    if (!session) {
      res.status(404).json({
        success: false,
        message: "Session not found or you are not its owner.",
      });
      return;
    }

    const allowedFields = ["title", "description", "subject", "price", "duration", "isAvailable"];
    const updates = req.body as Record<string, unknown>;

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        if (["title", "subject"].includes(field) && !String(updates[field]).trim()) {
          res.status(400).json({
            success: false,
            message: `${field} cannot be empty.`,
          });
          return;
        }

        if (field === "price") {
          if (!Number.isFinite(Number(updates[field])) || Number(updates[field]) < 0) {
            res.status(400).json({
              success: false,
              message: "Price must be non-negative.",
            });
            return;
          }
          session.price = Number(updates[field]);
        } else if (field === "duration") {
          if (!Number.isInteger(Number(updates[field])) || Number(updates[field]) < 1) {
            res.status(400).json({
              success: false,
              message: "Duration must be a positive integer.",
            });
            return;
          }
          session.duration = Number(updates[field]);
        } else if (field === "isAvailable") {
          if (typeof updates[field] !== "boolean") {
            res.status(400).json({
              success: false,
              message: "isAvailable must be true or false.",
            });
            return;
          }
          session.isAvailable = updates[field];
        } else if (field === "title" || field === "subject" || field === "description") {
          session.set(field, String(updates[field]).trim());
        }
      }
    }

    await session.save();

    res.status(200).json({
      success: true,
      message: "Session updated successfully.",
      session,
    });
  } catch (error) {
    console.error("Update session error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update session.",
    });
  }
});

// DELETE A SESSION
router.delete("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({
        success: false,
        message: "Invalid session ID.",
      });
      return;
    }

    const session = await Session.findOneAndDelete({
      _id: req.params.id,
      tutor: req.userId,
    });

    if (!session) {
      res.status(404).json({
        success: false,
        message: "Session not found or you are not its owner.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Session deleted successfully.",
    });
  } catch (error) {
    console.error("Delete session error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete session.",
    });
  }
});

export default router;
