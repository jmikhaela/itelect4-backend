import "dotenv/config";
import "express-async-errors";
import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import mongoose from "mongoose";
import { connectDB } from "./config/db";
import authRoutes from "./routes/auth";
import sessionRoutes from "./routes/sessions";
import bookingRoutes from "./routes/bookings";
import courseRoutes from "./routes/courses";
import { aiRouter } from "./routes/ai";

export const app = express();

const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter((origin) => origin !== "");

app.use(cors({ origin: ALLOWED_ORIGINS }));

app.use(express.json());

app.use(async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB();
    next();
  } catch (err: any) {
    console.error("Database connection failed:", err);
    res.status(500).json({
      ok: false,
      error: "Database connection failed",
      message: err?.message || String(err),
      hint: "Check MONGODB_URI in Vercel environment variables and ensure 0.0.0.0/0 is added to MongoDB Atlas Network Access",
    });
  }
});

app.get("/", (_req: Request, res: Response) => {
  res.json({
    ok: true,
    message: "Backend API is running!",
  });
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true, db: mongoose.connection.readyState === 1 });
});

app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/ai", aiRouter);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    message: `No route for ${req.method} ${req.originalUrl}`,
  });
});

app.use(
  (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof mongoose.Error.ValidationError) {
      res.status(400).json({
        message: "Validation failed",
        errors: Object.values(err.errors).map((e) => e.message),
      });
      return;
    }

    if (err instanceof mongoose.Error.CastError) {
      res.status(400).json({
        message: `"${err.value}" is not a valid id`,
      });
      return;
    }

    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
);

export default app;
