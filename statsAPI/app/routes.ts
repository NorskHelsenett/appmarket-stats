import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [index("routes/dashboard.tsx"),
      route("app/:id", "routes/appDetails.tsx")
] satisfies RouteConfig;
