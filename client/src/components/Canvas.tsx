// client/src/components/Canvas.tsx

import React, { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

// Define the data structures and props
interface DrawData {
  prevX: number;
  prevY: number;
  currX: number;
  currY: number;
  color: string;
  lineWidth: number;
}

interface CanvasProps {
  socket: Socket;
  color: string;
  lineWidth: number;
  tool: "pen" | "eraser";
}

const Canvas: React.FC<CanvasProps> = ({ socket, color, lineWidth, tool }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevPosRef = useRef<{ x: number; y: number } | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Function to clear the canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Function to draw a line
  const drawLine = (data: DrawData) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineWidth = data.lineWidth;
    ctx.lineCap = "round";
    ctx.strokeStyle = data.color;

    ctx.beginPath();
    ctx.moveTo(data.prevX, data.prevY);
    ctx.lineTo(data.currX, data.currY);
    ctx.stroke();
  };

  // Effect for handling socket events
  useEffect(() => {
    socket.on("draw", (data: DrawData) => {
      drawLine(data);
    });

    socket.on("clearCanvas", () => {
      clearCanvas();
    });

    return () => {
      socket.off("draw");
      socket.off("clearCanvas");
    };
  }, [socket]); // Dependency array includes socket

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { offsetX, offsetY } = e.nativeEvent;
    setIsDrawing(true);
    prevPosRef.current = { x: offsetX, y: offsetY };
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    prevPosRef.current = null;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = e.nativeEvent;
    const prevPos = prevPosRef.current;

    if (prevPos) {
      const colorToDraw = tool === "eraser" ? "#FFFFFF" : color;

      const drawData: DrawData = {
        prevX: prevPos.x,
        prevY: prevPos.y,
        currX: offsetX,
        currY: offsetY,
        color: colorToDraw,
        lineWidth: lineWidth,
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
      onMouseLeave={handleMouseUp}
      width={800}
      height={600}
      className="whiteboard-canvas"
    />
  );
};

export default Canvas;
