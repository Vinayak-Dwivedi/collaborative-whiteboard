// client/src/components/Toolbar.tsx
import React from "react";

interface ToolbarProps {
  color: string;
  setColor: (color: string) => void;
  lineWidth: number;
  setLineWidth: (width: number) => void;
  tool: "pen" | "eraser";
  setTool: (tool: "pen" | "eraser") => void;
  handleClearCanvas: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  color,
  setColor,
  lineWidth,
  setLineWidth,
  tool,
  setTool,
  handleClearCanvas,
}) => {
  return (
    <div className="toolbar">
      <h3 className="toolbar-heading">Tools</h3>

      <div className="tool-section">
        <label htmlFor="colorPicker" className="tool-label">
          Color
        </label>
        <div className="color-picker-wrapper">
          <input
            type="color"
            id="colorPicker"
            value={color}
            onChange={(e) => {
              setColor(e.target.value);
              setTool("pen");
            }}
            className="color-picker-input"
          />
          <span className="color-code">{color}</span>
        </div>
      </div>

      <div className="tool-section">
        <label htmlFor="lineWidth" className="tool-label">
          Brush Width ({lineWidth})
        </label>
        <input
          type="range"
          id="lineWidth"
          min="1"
          max="20"
          value={lineWidth}
          onChange={(e) => setLineWidth(Number(e.target.value))}
          className="slider"
        />
      </div>

      <div className="tool-section">
        <label className="tool-label">Mode</label>
        <div className="button-grid">
          <button
            onClick={() => setTool("pen")}
            className={`tool-button ${tool === "pen" ? "active" : ""}`}
          >
            Pen
          </button>
          <button
            onClick={() => setTool("eraser")}
            className={`tool-button ${tool === "eraser" ? "active" : ""}`}
          >
            Eraser
          </button>
        </div>
      </div>

      <div className="tool-section bordered">
        <button onClick={handleClearCanvas} className="clear-button">
          Clear Canvas
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
