// client/src/components/Canvas.tsx

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Socket } from "socket.io-client";

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

// Define the data structures and props
interface DrawData {
  prevX: number;
  prevY: number;
  currX: number;
  currY: number;
  color: string;
  lineWidth: number;
  tool: Tool;
}

interface ShapeData {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  lineWidth: number;
  tool: Tool;
}

interface CanvasProps {
  socket: Socket;
  color: string;
  lineWidth: number;
  tool: Tool;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

const Canvas: React.FC<CanvasProps> = ({
  socket,
  color,
  lineWidth,
  tool,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  currentPage = 0,
  onPageChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevPosRef = useRef<{ x: number; y: number } | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [isDrawingShape, setIsDrawingShape] = useState(false);
  const drawingHistoryRef = useRef<ImageData[]>([]);
  const historyStepRef = useRef<number>(-1);
  const pagesRef = useRef<ImageData[]>([]);

  // Save current page state
  const saveCurrentPage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    pagesRef.current[currentPage] = imageData;
  }, [currentPage]);

  // Function to clear the canvas
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Save current page state before clearing
    saveCurrentPage();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit("clearCanvas");
  }, [socket, saveCurrentPage]); // Removed currentPage dependency

  // Load page state
  const loadPage = useCallback(
    (pageNumber: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      saveCurrentPage();

      if (pagesRef.current[pageNumber]) {
        ctx.putImageData(pagesRef.current[pageNumber], 0, 0);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      if (onPageChange) {
        onPageChange(pageNumber);
      }
    },
    [onPageChange, saveCurrentPage],
  );


  // Function to draw a line with smooth interpolation
  const drawLine = useCallback((data: DrawData) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineWidth = data.lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = data.color;

    // Apply different styles based on tool
    if (data.tool === "pencil") {
      ctx.globalAlpha = 0.8;
      ctx.lineWidth = data.lineWidth * 0.7;
    } else if (data.tool === "sketchPen") {
      ctx.globalAlpha = 0.6;
      ctx.setLineDash([5, 3]);
    } else {
      ctx.globalAlpha = 1.0;
      ctx.setLineDash([]);
    }

    // Smooth drawing using quadratic curves
    const midX = (data.prevX + data.currX) / 2;
    const midY = (data.prevY + data.currY) / 2;

    ctx.beginPath();
    ctx.moveTo(data.prevX, data.prevY);
    ctx.quadraticCurveTo(data.prevX, data.prevY, midX, midY);
    ctx.quadraticCurveTo(data.currX, data.currY, data.currX, data.currY);
    ctx.stroke();

    // Reset styles
    ctx.globalAlpha = 1.0;
    ctx.setLineDash([]);
  }, []);

  // Function to draw shapes
  const drawShape = useCallback((data: ShapeData) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineWidth = data.lineWidth;
    ctx.strokeStyle = data.color;
    ctx.fillStyle = data.color;
    ctx.globalAlpha = 0.8;

    const width = data.endX - data.startX;
    const height = data.endY - data.startY;

    ctx.beginPath();

    switch (data.tool) {
      case "circle": {
        const radius = Math.sqrt(width * width + height * height) / 2;
        const centerX = data.startX + width / 2;
        const centerY = data.startY + height / 2;
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        break;
      }
      case "rectangle":
        ctx.rect(data.startX, data.startY, width, height);
        break;
      case "triangle":
        ctx.moveTo(data.startX + width / 2, data.startY);
        ctx.lineTo(data.startX, data.endY);
        ctx.lineTo(data.endX, data.endY);
        ctx.closePath();
        break;
      case "line":
        ctx.moveTo(data.startX, data.startY);
        ctx.lineTo(data.endX, data.endY);
        break;
    }

    ctx.stroke();
    ctx.globalAlpha = 1.0;
  }, []);

  // Save canvas state for undo/redo
  const saveCanvasState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    historyStepRef.current += 1;
    drawingHistoryRef.current = drawingHistoryRef.current.slice(
      0,
      historyStepRef.current,
    );
    drawingHistoryRef.current.push(imageData);

    if (drawingHistoryRef.current.length > 50) {
      drawingHistoryRef.current.shift();
      historyStepRef.current -= 1;
    }
  }, []);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z" && !e.shiftKey) {
          e.preventDefault();
          if (onUndo && canUndo) onUndo();
        } else if ((e.key === "z" && e.shiftKey) || e.key === "y") {
          e.preventDefault();
          if (onRedo && canRedo) onRedo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onUndo, onRedo, canUndo, canRedo]);

  // Initialize page on mount
  useEffect(() => {
    loadPage(currentPage);
  }, [currentPage, loadPage]);

  // Effect for handling socket events
  useEffect(() => {
    socket.on("draw", (data: DrawData) => {
      drawLine(data);
    });

    socket.on("drawShape", (data: ShapeData) => {
      drawShape(data);
    });

    socket.on("clearCanvas", () => {
      clearCanvas();
    });

    return () => {
      socket.off("draw");
      socket.off("drawShape");
      socket.off("clearCanvas");
    };
  }, [socket, drawLine, drawShape, clearCanvas]); // Dependency array includes socket and callbacks

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { offsetX, offsetY } = e.nativeEvent;

    if (tool === "select") {
      // Selection tool logic will be implemented later
      return;
    }

    if (
      tool === "circle" ||
      tool === "rectangle" ||
      tool === "triangle" ||
      tool === "line"
    ) {
      setIsDrawingShape(true);
      setStartPos({ x: offsetX, y: offsetY });
      saveCanvasState();
    } else {
      setIsDrawing(true);
      prevPosRef.current = { x: offsetX, y: offsetY };
      saveCanvasState();
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDrawingShape && startPos) {
      const { offsetX, offsetY } = e.nativeEvent;

      const shapeData: ShapeData = {
        startX: startPos.x,
        startY: startPos.y,
        endX: offsetX,
        endY: offsetY,
        color: color,
        lineWidth: lineWidth,
        tool: tool,
      };

      socket.emit("drawShape", shapeData);
      setIsDrawingShape(false);
      setStartPos(null);
    } else {
      setIsDrawing(false);
      prevPosRef.current = null;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { offsetX, offsetY } = e.nativeEvent;

    if (isDrawingShape && startPos) {
      // Preview shape while drawing
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Clear and redraw from history
      if (drawingHistoryRef.current.length > 0) {
        ctx.putImageData(
          drawingHistoryRef.current[drawingHistoryRef.current.length - 1],
          0,
          0,
        );
      }

      const shapeData: ShapeData = {
        startX: startPos.x,
        startY: startPos.y,
        endX: offsetX,
        endY: offsetY,
        color: color,
        lineWidth: lineWidth,
        tool: tool,
      };

      drawShape(shapeData);
    } else if (isDrawing) {
      const prevPos = prevPosRef.current;
      if (!prevPos) return;

      const colorToDraw = tool === "eraser" ? "#FFFFFF" : color;

      const drawData: DrawData = {
        prevX: prevPos.x,
        prevY: prevPos.y,
        currX: offsetX,
        currY: offsetY,
        color: colorToDraw,
        lineWidth: lineWidth,
        tool: tool,
      };

      drawLine(drawData);
      socket.emit("draw", drawData);

      prevPosRef.current = { x: offsetX, y: offsetY };
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        setIsDrawing(false);
        setIsDrawingShape(false);
        prevPosRef.current = null;
        setStartPos(null);
      }}
      width={800}
      height={600}
      className="whiteboard-canvas"
    />
  );
};

export default Canvas;
