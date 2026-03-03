import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // OAuth sign in successful
      // User will be created/updated in Convex via client-side hook
      return true;
    },
    async jwt({ token, user, account, profile, trigger }) {
      // On first sign in, persist user data and fetch role
      if (user) {
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
        
        // Fetch user role from Convex
        try {
          const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
          if (convexUrl && user.email) {
            // Use the HTTP API to query Convex
            const apiUrl = convexUrl.replace('/api', ''); // Remove /api if present
            const queryUrl = `${apiUrl}/api/query`;
            
            const response = await fetch(queryUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                path: 'users:getUserByEmail',
                args: { email: user.email },
                format: 'json',
              }),
            });
            
            if (response.ok) {
              const data = await response.json();
              // Convex returns data in 'value' field or directly
              const userData = data.value || data;
              if (userData?.role) {
                token.role = userData.role;
                console.log('[NextAuth] Set role in token:', userData.role, 'for', user.email);
              } else {
                console.warn('[NextAuth] No role found for user:', user.email);
              }
            } else {
              console.error('[NextAuth] Failed to fetch user role:', response.status, response.statusText);
            }
          }
        } catch (error) {
          console.error('[NextAuth] Error fetching user role:', error);
          // Don't block login if role fetch fails
        }
      }
      
      // On subsequent calls, role is already in token
      // If you need to refresh role, add logic here based on trigger === "update"
      
      return token;
    },
    async redirect({ url, baseUrl }) {
      // Allow redirects to any internal URL
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Only redirect to dashboard for external URLs or as fallback
      return baseUrl;
    },
    async session({ session, token }) {
      // Add user info to session
      if (session.user) {
        session.user.id = token.sub!;
        session.user.email = token.email!;
        session.user.name = token.name || token.email!.split("@")[0];
        session.user.image = token.picture as string | undefined;
        session.user.role = token.role as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
