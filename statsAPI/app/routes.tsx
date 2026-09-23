import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [index("components/dashboard.tsx"),
      route(":id", "components/appDetails.tsx"),
      route("about", "components/about.tsx")
] satisfies RouteConfig;
