// client/src/App.tsx
import { useState } from "react";
import { io } from "socket.io-client";
import Canvas from "./components/Canvas";
import Toolbar from "./components/Toolbar";

const socket = io("http://localhost:3001");

function App() {
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(3);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");

  const handleClearCanvas = () => {
    socket.emit("clearCanvas");
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
        />
      </div>
    </div>
  );
}

export default App;
