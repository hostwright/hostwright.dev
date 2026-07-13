import { defineRouteMiddleware } from "@astrojs/starlight/route-data";
import type { StarlightRouteData } from "@astrojs/starlight/route-data";

// The header logo/title leaves the docs app and returns to the marketing
// landing page rather than the docs root.
export const onRequest = defineRouteMiddleware(({ locals }) => {
  const { starlightRoute } = locals as { starlightRoute: StarlightRouteData };
  starlightRoute.siteTitleHref = "/";
});
