import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend the Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// JWT verification function
const verifyToken = async (token: string): Promise<any> => {
  try {
    // Replace 'your_jwt_secret' with your actual secret key from environment variables
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    return decoded;
  } catch (error) {
    return null;
  }
};

// Middleware to verify token
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;
  if (!token) {
    res.status(401).json({ message: "Unauthorized: No token provided" });
    return;
  }

  const decoded = await verifyToken(token);
  if (!decoded) {
    res.status(401).json({ message: "Unauthorized: Invalid token" });
    return;
  }

  req.user = decoded;
  next();
};
