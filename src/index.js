import React from "react";
import { createRoot } from "react-dom/client";
import App from "./pages/App";
import { BrowserRouter } from "react-router-dom";

const root = createRoot(document.getElementById("root"));

root.render(
    <BrowserRouter basename="/img-compression-visualiser">
        <App />
    </BrowserRouter>,
);
