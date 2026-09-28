import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../src/styles/tokens.css";
import { HomePage } from "./HomePage";

const style = document.createElement("style");
style.textContent = `html{scroll-behavior:smooth}body{margin:0;background:#F5F7F5}section[id]{scroll-margin-top:72px}`;
document.head.appendChild(style);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HomePage />
  </StrictMode>,
);
