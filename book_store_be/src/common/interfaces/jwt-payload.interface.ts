import { Request } from 'express';

/** Payload signed into access / refresh tokens (same shape as the Express version). */
export interface JwtPayload {
  id: string;
  admin: boolean;
}

export interface RequestWithUser extends Request {
  user: JwtPayload;
}
