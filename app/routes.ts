import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("diagram/:id", "routes/diagram.$id.tsx"),
    route("api/export/:id", "routes/api.export.$id.ts"),
] satisfies RouteConfig;
