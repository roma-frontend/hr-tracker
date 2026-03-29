/**
 * HTTP router for Convex
 */

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  path: "/test/create-automation-data",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(
      JSON.stringify({
        success: true,
        message: "HTTP router is working!",
        instruction: "Use Convex mutations to create actual data",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }),
});

export default http;
