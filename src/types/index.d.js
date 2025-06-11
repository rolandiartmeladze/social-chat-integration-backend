import { Profile } from 'passport';
import 'express';

declare module 'express-session' {
  interface SessionData {
    passport?: {
      user: Profile;
    };
  }
}

declare global {
  namespace Express {
    interface User extends Profile {}

    interface Request {
      user?: Profile;
      isAuthenticated(): boolean;
    }
  }
}
