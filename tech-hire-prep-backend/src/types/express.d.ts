import { UserRole } from "./user.types.ts";

declare global {
  namespace Express {
    /**
     * User attached by the authentication middleware
     * after successful JWT verification.
     */
    interface AuthenticatedUser {
      /**
       * MongoDB ObjectId converted to string.
       */
      id: string;

      /**
       * Active session id.
       */
      sessionId: string;

      /**
       * User role.
       */
      role: UserRole;
    }

    interface Request {
      /**
       * Authenticated user.
       */
      user?: AuthenticatedUser;

      /**
       * Unique request identifier.
       */
      requestId: string;

      /**
       * Raw request body.
       * Used for webhook signature verification.
       */
      rawBody?: string;
    }
  }
}

export {};