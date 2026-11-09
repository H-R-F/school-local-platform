import { useEffect, useState } from "react";
import SchoolApp from "./SchoolApp";
import CentralPlatformApp from "./components/central-platform/CentralPlatformApp";

/** One React application with two isolated product workspaces. */
export default function App() {
  const [path, setPath] = useState(() => {
    const current = window.location.pathname || "/";
    if (current === "/") {
      let signedIn = false;
      try { signedIn = Boolean(window.localStorage.getItem("school-demo-user")); } catch { /* storage unavailable */ }
      const destination = signedIn ? "/overview" : "/login";
      window.history.replaceState({}, "", destination);
      return destination;
    }
    return current;
  });

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname || "/");
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return path === "/platform" || path.startsWith("/platform/")
    ? <CentralPlatformApp />
    : <SchoolApp />;
}
