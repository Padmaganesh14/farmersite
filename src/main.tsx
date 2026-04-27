import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "leaflet/dist/leaflet.css";

console.log("API URL:", import.meta.env.VITE_API_URL);

createRoot(document.getElementById("root")!).render(<App />);
