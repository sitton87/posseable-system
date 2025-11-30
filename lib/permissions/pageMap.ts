type RouteConfig = {
  key: string;
  routes: string[];
};

const PAGE_ROUTE_MAP: RouteConfig[] = [
  { key: "dashboard", routes: ["/", "/dashboard"] },
  { key: "volunteers", routes: ["/volunteers"] },
  { key: "surfers", routes: ["/surfers"] },
  { key: "groups", routes: ["/groups"] },
  { key: "activities", routes: ["/activities"] },
  { key: "seasons", routes: ["/seasons"] },
  { key: "equipment", routes: ["/equipment"] },
  { key: "suppliers", routes: ["/suppliers"] },
  { key: "donors", routes: ["/donors"] },
  { key: "finance", routes: ["/finance"] },
];

export function getPageKeyFromPath(pathname: string) {
  const normalized = pathname === "" ? "/" : pathname;
  for (const config of PAGE_ROUTE_MAP) {
    for (const route of config.routes) {
      if (route === "/" && normalized === "/") {
        return config.key;
      }
      if (
        route !== "/" &&
        (normalized === route || normalized.startsWith(`${route}/`))
      ) {
        return config.key;
      }
    }
  }
  return null;
}

