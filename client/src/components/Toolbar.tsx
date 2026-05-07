// client/src/components/Toolbar.tsx
import React from "react";

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

interface ToolbarProps {
  color: string;
  setColor: (color: string) => void;
  lineWidth: number;
  setLineWidth: (width: number) => void;
  tool: Tool;
  setTool: (tool: Tool) => void;
  handleClearCanvas: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  currentPage?: number;
  onNextPage?: () => void;
  onPreviousPage?: () => void;
  maxPages?: number;
}

const Toolbar: React.FC<ToolbarProps> = ({
  color,
  setColor,
  lineWidth,
  setLineWidth,
  tool,
  setTool,
  handleClearCanvas,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  currentPage = 0,
  onNextPage,
  onPreviousPage,
  maxPages = 10,
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
              if (tool !== "select" && tool !== "eraser") {
                setTool("pen");
              }
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
        <label className="tool-label">Drawing Tools</label>
        <div className="button-grid">
          <button
            onClick={() => setTool("pen")}
            className={`tool-button ${tool === "pen" ? "active" : ""}`}
          >
            Pen
          </button>
          <button
            onClick={() => setTool("pencil")}
            className={`tool-button ${tool === "pencil" ? "active" : ""}`}
          >
            Pencil
          </button>
          <button
            onClick={() => setTool("sketchPen")}
            className={`tool-button ${tool === "sketchPen" ? "active" : ""}`}
          >
            Sketch
          </button>
          <button
            onClick={() => setTool("eraser")}
            className={`tool-button ${tool === "eraser" ? "active" : ""}`}
          >
            Eraser
          </button>
        </div>
      </div>

      <div className="tool-section">
        <label className="tool-label">Shapes</label>
        <div className="button-grid">
          <button
            onClick={() => setTool("circle")}
            className={`tool-button ${tool === "circle" ? "active" : ""}`}
          >
            Circle
          </button>
          <button
            onClick={() => setTool("rectangle")}
            className={`tool-button ${tool === "rectangle" ? "active" : ""}`}
          >
            Rectangle
          </button>
          <button
            onClick={() => setTool("triangle")}
            className={`tool-button ${tool === "triangle" ? "active" : ""}`}
          >
            Triangle
          </button>
          <button
            onClick={() => setTool("line")}
            className={`tool-button ${tool === "line" ? "active" : ""}`}
          >
            Line
          </button>
        </div>
      </div>

      <div className="tool-section">
        <label className="tool-label">Selection</label>
        <div className="button-grid">
          <button
            onClick={() => setTool("select")}
            className={`tool-button ${tool === "select" ? "active" : ""}`}
          >
            Select
          </button>
        </div>
      </div>

      <div className="tool-section">
        <label className="tool-label">Actions</label>
        <div className="button-grid">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`tool-button ${!canUndo ? "disabled" : ""}`}
          >
            Undo
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`tool-button ${!canRedo ? "disabled" : ""}`}
          >
            Redo
          </button>
        </div>
      </div>

      <div className="tool-section">
        <label className="tool-label">Pages</label>
        <div className="page-info">
          <span className="page-indicator">
            Page {currentPage + 1} / {maxPages}
          </span>
        </div>
        <div className="button-grid">
          <button
            onClick={onPreviousPage}
            disabled={currentPage === 0}
            className={`tool-button ${currentPage === 0 ? "disabled" : ""}`}
          >
            Previous
          </button>
          <button
            onClick={onNextPage}
            disabled={currentPage === maxPages - 1}
            className={`tool-button ${currentPage === maxPages - 1 ? "disabled" : ""}`}
          >
            Next
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
