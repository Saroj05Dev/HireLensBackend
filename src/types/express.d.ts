import { UserRole } from "../models/User.js";

declare global {
  namespace Express {
    interface AuthUser {
      id: string;
      role: UserRole | string;
      organizationId: string;
      [key: string]: any;
    }

    interface Request {
      user?: AuthUser;
    }
  }
}

export {};