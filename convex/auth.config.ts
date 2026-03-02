import Google from "@auth/core/providers/google";
import { convexAuth } from "@convex-dev/auth/server";

const config = convexAuth({
  providers: [
    Google,
  ],
});

export const { auth, signIn, signOut, store } = config;
export default config;
