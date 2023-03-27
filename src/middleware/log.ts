import { Request, Response } from "express";

function logRequest(req: Request, res: Response, next: Function) {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
}

export { logRequest };
