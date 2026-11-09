import { useEffect, useState } from "react";
import SchoolApp from "./SchoolApp";
import CentralPlatformApp from "./components/central-platform/CentralPlatformApp";

/**
 * The two product surfaces intentionally share one Vite/React application.
 * /platform renders the central control plane; all school routes render the
 * school-local workspace. Each surface owns its own shell and stylesheet.
 */
export default function App() {
  const [path, setPath] = useState(() => {
    const current = window.location.pathname || "/";
    if (current === "/") {
      let hasSchoolSession = false;
      try { hasSchoolSession = Boolean(window.localStorage.getItem("school-demo-user")); } catch { /* storage may be unavailable */ }
      const destination = hasSchoolSession ? "/overview" : "/login";
      window.history.replaceState({}, "", destination);
      return destination;
    }
    return current;
  });

  useEffect(() => {
    const syncPath = () => setPath(window.location.pathname || "/");
    window.addEventListener("popstate", syncPath);
    return () => window.removeEventListener("popstate", syncPath);
  }, []);

  const isCentralPlatform = path === "/platform" || path.startsWith("/platform/");
  return isCentralPlatform ? <CentralPlatformApp /> : <SchoolApp />;
}
