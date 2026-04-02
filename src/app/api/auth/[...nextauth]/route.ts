import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import type { NextAuthOptions } from 'next-auth';

// ═══════════════════════════════════════════════════════��═══════
// VALIDATE ENVIRONMENT — fail fast, not silently
// ═══════════════════════════════════════════════════════════════
const requiredEnvVars = [
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
];
const missingVars = requiredEnvVars.filter((v) => !process.env[v]);

if (missingVars.length > 0) {
  console.error('[NextAuth] ❌ Missing required environment variables:', missingVars);
  // In production, this WILL break auth — throw to make it visible
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`[NextAuth] Missing required env vars: ${missingVars.join(', ')}`);
  }
}

export const authOptions: NextAuthOptions = {
  // CRITICAL: Never fall back to a hardcoded secret in production
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        // Extract name from multiple possible Google profile fields
        let name = profile.name;

        if (!name && (profile.given_name || profile.family_name)) {
          name = `${profile.given_name || ''} ${profile.family_name || ''}`.trim();
        }

        if (!name && profile.email) {
          name = profile.email.split('@')[0];
        }

        return {
          id: profile.sub,
          name: name || 'User',
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
  ],

  callbacks: {
    async signIn() {
      return true;
    },

    async jwt({ token, user, profile, trigger }) {
      // On first sign in, persist user data
      if (user) {
        let name = user.name;

        if (!name && profile) {
          const gp = profile as Record<string, string>;
          if (gp.given_name || gp.family_name) {
            name = `${gp.given_name || ''} ${gp.family_name || ''}`.trim();
          } else if (gp.name) {
            name = gp.name;
          }
        }

        if (!name && user.email) {
          name = user.email.split('@')[0];
        }

        token.name = name || 'User';
        token.email = user.email;
        token.picture = user.image;
      }

      // Fetch user role from Convex
      // Only on initial sign-in or explicit update trigger to avoid hammering Convex
      if (user || trigger === 'update') {
        try {
          const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
          const emailToQuery = user?.email || token.email;

          if (convexUrl && emailToQuery) {
            const apiUrl = convexUrl.replace(/\/api$/, '');
            const queryUrl = `${apiUrl}/api/query`;

            const response = await fetch(queryUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                path: 'users:getUserByEmail',
                args: { email: emailToQuery },
                format: 'json',
              }),
            });

            if (response.ok) {
              const data = await response.json();
              const userData = data.value || data;

              if (userData?.role) {
                token.role = userData.role;
              }
              if (userData?.organizationId) {
                token.organizationId = userData.organizationId;
              }
              if (userData?.isApproved !== undefined) {
                token.isApproved = userData.isApproved;
              }
            } else {
              console.error('[NextAuth JWT] Failed to fetch role:', response.status);
            }
          }
        } catch (error) {
          console.error('[NextAuth JWT] Error fetching user role:', error);
        }
      }

      return token;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      return baseUrl;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.email = token.email!;
        session.user.name = token.name || token.email!.split('@')[0] || 'User';
        session.user.image = token.picture as string | undefined;

        if (token.role) {
          session.user.role = token.role as 'superadmin' | 'admin' | 'supervisor' | 'employee';
        }
        if (token.organizationId) {
          session.user.organizationId = token.organizationId as string;
        }
        if (token.isApproved !== undefined) {
          session.user.isApproved = token.isApproved as boolean;
        }
      }

      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login', // ← Redirect auth errors to login, not default error page
  },

  // Debug mode in development only
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
