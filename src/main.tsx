import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// Fonts are bundled locally: the application must work without Internet access.
import "@fontsource-variable/inter/wght.css";
import "@fontsource/ibm-plex-sans-arabic/arabic-400.css";
import "@fontsource/ibm-plex-sans-arabic/arabic-500.css";
import "@fontsource/ibm-plex-sans-arabic/arabic-600.css";
import "@fontsource/ibm-plex-sans-arabic/arabic-700.css";
import "@fontsource/jetbrains-mono/latin-400.css";
import "@fontsource/jetbrains-mono/latin-500.css";
import "./styles/theme.css";
import "./styles/tokens.css";
import "./index.css";
import "./design-system.css";
import "./styles/school-app-foundation.css";
import "./components/shell/shell.css";
import "./styles/form-drawers.css";
import "./styles/form-system.css";
import "./styles/action-system.css";
import "./styles/central-platform.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
