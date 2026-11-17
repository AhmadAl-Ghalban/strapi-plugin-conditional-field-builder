import adminAPIRoutes from "./admin";

/**
 * The plugin exposes no public (content-api) routes: the custom field is
 * stored on the host content type and served through its own REST/GraphQL API.
 */
const routes = {
  admin: adminAPIRoutes,
};

export default routes;
