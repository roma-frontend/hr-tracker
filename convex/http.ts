import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

// Google OAuth redirect relay for mobile app
// Google implicit flow puts token in URL fragment (#) which server can't read.
// This page extracts it client-side and redirects back to the app.
http.route({
  path: "/auth/google/callback",
  method: "GET",
  handler: httpAction(async () => {
    const html = `<!DOCTYPE html>
<html><head><title>Signing in...</title></head>
<body>
<p>Completing sign in...</p>
<script>
  var hash = window.location.hash.substring(1);
  var params = new URLSearchParams(hash || window.location.search.substring(1));
  var token = params.get('access_token');
  var returnBase = params.get('state') || '';

  if (token && returnBase) {
    var sep = returnBase.indexOf('?') >= 0 ? '&' : '?';
    window.location.replace(returnBase + sep + 'access_token=' + encodeURIComponent(token));
  } else {
    document.body.innerHTML = '<p>Sign in failed. Please close this window and try again.</p>';
  }
</script>
</body></html>`;
    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });
  }),
});

export default http;
