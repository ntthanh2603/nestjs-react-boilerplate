// Helper function to format the breadcrumb label with Vietnamese names
export const formatLabel = (path: string, navigationData: any) => {
  // Create a map from navigationData to look up titles by URL
  const pathToTitleMap: Record<string, string> = {};

  const buildMap = (items: any[]) => {
    items.forEach((item) => {
      if (item.url && item.url !== "#") {
        pathToTitleMap[item.url.toLowerCase()] = item.title;
      }
      if (item.items) {
        buildMap(item.items);
      }
    });
  };

  // Build map for both navMain and navSecondary
  buildMap(navigationData.navMain || []);
  buildMap(navigationData.navSecondary || []);

  // Look for the title using the full, normalized path
  const title = pathToTitleMap[path.toLowerCase()];

  if (title) {
    return title;
  }

  // Fallback for paths not found in the navigation data
  const segments = path.replace(/^\//, "").split("/");
  const lastSegment = segments[segments.length - 1];
  return lastSegment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
