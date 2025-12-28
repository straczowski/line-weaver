import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { App } from "./App"
import { Tutorial } from "./Tutorial"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename="/line-weaver">
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/tutorial" element={<Tutorial />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
