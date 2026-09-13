import { Request } from 'express';

export interface JwtPayload {
  id: string;
  admin: boolean;
}

export interface RequestWithUser extends Request {
  user: JwtPayload;
}
