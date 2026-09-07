import { useState } from "react";
import TerminalPortfolio from "./components/TerminalPortfolio";
import CustomCursor from "./components/CustomCursor";

export default function App() {
  const [cursorMode, setCursorMode] = useState(() => {
    return localStorage.getItem("hafil_cursor_mode") || "reticle";
  });

  const handleCursorChange = (mode) => {
    setCursorMode(mode);
    localStorage.setItem("hafil_cursor_mode", mode);
  };

  return (
    <>
      <CustomCursor mode={cursorMode} />
      <TerminalPortfolio
        cursorMode={cursorMode}
        onCursorModeChange={handleCursorChange}
      />
    </>
  );
}