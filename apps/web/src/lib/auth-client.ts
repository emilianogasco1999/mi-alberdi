import { createAuthClient } from 'better-auth/react';
import { adminClient } from 'better-auth/client/plugins';

/**
 * Better Auth client. Requests go to the same origin (`/api/auth/*`) and Next.js
 * rewrites them to the Express API (see next.config.ts), so the session cookie is
 * first-party and the Next.js proxy can read it.
 */
export const authClient = createAuthClient({
  plugins: [adminClient()],
});

export const { signIn, signOut, useSession } = authClient;
