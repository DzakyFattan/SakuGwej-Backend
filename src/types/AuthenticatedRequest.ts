import { Request } from "express";

interface AuthenticatedRequest extends Request {
  token?: string;
  token_data?: Record<any, any>;
}

export { AuthenticatedRequest };
