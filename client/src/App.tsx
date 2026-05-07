// client/src/App.tsx
import { useState } from "react";
import { io } from "socket.io-client";
import Canvas from "./components/Canvas";
import Toolbar from "./components/Toolbar";

type Tool =
  | "pen"
  | "pencil"
  | "sketchPen"
  | "eraser"
  | "circle"
  | "rectangle"
  | "triangle"
  | "line"
  | "select";

const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";
const socket = io(serverUrl);

function App() {
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(3);
  const [tool, setTool] = useState<Tool>("pen");
  const [history] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [currentPage, setCurrentPage] = useState(0);
  const maxPages = 10;

  const handleClearCanvas = () => {
    socket.emit("clearCanvas");
  };

  const handleUndo = () => {
    if (historyStep > 0) {
      const newStep = historyStep - 1;
      setHistoryStep(newStep);
      // This would restore the canvas state
    }
  };

  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      const newStep = historyStep + 1;
      setHistoryStep(newStep);
      // This would restore the canvas state
    }
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, maxPages - 1));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const AnimatedHeading = () => (
    <h1 className="app-heading">
      {"WhiteBoard".split("").map((char, index) => (
        <span
          key={index}
          className="wave-char"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {char}
        </span>
      ))}
    </h1>
  );

  return (
    <div className="app-container">
      <div className="w-full">
        <AnimatedHeading />
      </div>

      <div className="main-content">
        <div className="canvas-container">
          <Canvas
            socket={socket}
            color={color}
            lineWidth={lineWidth}
            tool={tool}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={historyStep > 0}
            canRedo={historyStep < history.length - 1}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
        <Toolbar
          color={color}
          setColor={setColor}
          lineWidth={lineWidth}
          setLineWidth={setLineWidth}
          tool={tool}
          setTool={setTool}
          handleClearCanvas={handleClearCanvas}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={historyStep > 0}
          canRedo={historyStep < history.length - 1}
          currentPage={currentPage}
          onNextPage={handleNextPage}
          onPreviousPage={handlePreviousPage}
          maxPages={maxPages}
        />
      </div>
    </div>
  );
}

export default App;
