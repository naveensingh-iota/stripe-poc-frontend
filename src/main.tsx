import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import Complete from "./Complete.js";
import { BrowserRouter, Routes, Route } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/complete" element={<Complete />} />
    </Routes>
  </BrowserRouter>
);
