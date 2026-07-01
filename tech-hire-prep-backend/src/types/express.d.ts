import "express";

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      rawBody?: string;
      user?: {
        id: string;
        role: "student" | "admin";
      };
    }
  }
}

export {};
