import { Request, Response } from 'express';
import { Session, SessionData } from 'express-session';

// Extend session to include our custom data
export interface CustomSessionData extends SessionData {
  guestId?: string;
}

export interface CustomSession extends Session, CustomSessionData {}

export interface CustomRequest extends Request {
  session: CustomSession;
}

export interface CustomResponse extends Response {}
