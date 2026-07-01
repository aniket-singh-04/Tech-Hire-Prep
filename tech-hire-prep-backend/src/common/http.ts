import type { Response } from "express";

export const sendSuccess = <T>(res: Response, data: T, statusCode = 200) =>
  res.status(statusCode).json({ success: true, data });

export const sendMessage = (res: Response, message: string, statusCode = 200) =>
  res.status(statusCode).json({ success: true, message });

export const sendNoContent = (res: Response) => res.status(204).send();
