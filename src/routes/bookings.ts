import { Router, Response } from "express";
import mongoose from "mongoose";
import Booking from "../models/Booking";
import { authenticateToken, AuthRequest } from "../middleware/auth";

export const bookingRouter = Router();

// Require auth for all bookings routes
bookingRouter.use(authenticateToken);

// GET /api/bookings - get user's bookings
bookingRouter.get("/", async (req: AuthRequest, res: Response) => {
  const bookings = await Booking.find({ tuteeId: req.userId }).sort({
    createdAt: -1,
  });
  res.json(bookings);
});

// POST /api/bookings - create a booking
bookingRouter.post("/", async (req: AuthRequest, res: Response) => {
  const { sessionId, time, durationMinutes } = req.body;

  if (!sessionId || !time || !durationMinutes) {
    res.status(400).json({
      message: "sessionId, time, and durationMinutes are required.",
    });
    return;
  }

  const booking = await Booking.create({
    sessionId,
    tuteeId: req.userId,
    time: String(time).trim(),
    durationMinutes: Number(durationMinutes),
  });

  res.status(201).json(booking);
});

// DELETE /api/bookings/:id - delete a booking
bookingRouter.delete("/:id", async (req: AuthRequest, res: Response) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    // If not valid ObjectId, try finding by other id representation
    const deleted = await Booking.findOneAndDelete({
      _id: req.params.id,
      tuteeId: req.userId,
    });
    if (!deleted) {
      res.status(404).json({ message: "Booking not found." });
      return;
    }
    res.status(204).end();
    return;
  }

  const booking = await Booking.findOneAndDelete({
    _id: req.params.id,
    tuteeId: req.userId,
  });

  if (!booking) {
    res.status(404).json({ message: "Booking not found." });
    return;
  }

  res.status(204).end();
});

export default bookingRouter;
