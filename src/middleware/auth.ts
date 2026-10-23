
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export interface AuthRequest extends Request {
  userId?: string;
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Access denied. Please provide a token.",
    });
    return;
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env.JWT_SECRET;

  if (!token || !secret) {
    res.status(401).json({
      success: false,
      message: "Invalid authentication credentials.",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret) as jwt.JwtPayload;

    if (typeof decoded.userId !== "string") {
      res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
      return;
    }

    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

export const requireAuth = authenticateToken;
