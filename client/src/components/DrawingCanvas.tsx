import React, { useRef, useEffect, useState, useCallback } from 'react';
import { DrawStroke, DrawPoint, DrawTool, SOCKET_EVENTS } from '@guess-the-11/shared';
import { socketService } from '../services/socket';
import {
  Paintbrush,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  Lock
} from 'lucide-react';

interface DrawingCanvasProps {
  roomCode: string;
  playerId: string;
  isDrawer: boolean;
}

const COLORS = [
  '#000000', // Deep Black
  '#64748B', // Slate
  '#FF647C', // Coral Red
  '#F97316', // Sunset Orange
  '#FFC857', // Gold Warning
  '#28DFA5', // Emerald Mint
  '#28C7E8', // Electric Cyan
  '#3B82F6', // Royal Blue
  '#7655F7', // Primary Purple
  '#EC4899', // Pink
  '#854D0E', // Brown
  '#FFFFFF'  // Pure White
];

const BRUSH_SIZES = [3, 6, 12, 22];

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ roomCode, playerId, isDrawer }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tool, setTool] = useState<DrawTool>('brush');
  const [color, setColor] = useState<string>('#000000');
  const [size, setSize] = useState<number>(6);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentStroke, setCurrentStroke] = useState<DrawStroke | null>(null);

  // History for undo/redo locally for drawer
  const [strokes, setStrokes] = useState<DrawStroke[]>([]);
  const [undoneStrokes, setUndoneStrokes] = useState<DrawStroke[]>([]);

  // Redraw complete canvas from stroke history
  const redrawAll = useCallback((strokeList: DrawStroke[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw clean paper background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render strokes
    strokeList.forEach((stroke) => {
      if (stroke.points.length === 0) return;

      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = stroke.size;
      ctx.strokeStyle = stroke.tool === 'eraser' ? '#FFFFFF' : stroke.color;

      const first = stroke.points[0];
      ctx.moveTo(first.x * canvas.width, first.y * canvas.height);

      for (let i = 1; i < stroke.points.length; i++) {
        const pt = stroke.points[i];
        ctx.lineTo(pt.x * canvas.width, pt.y * canvas.height);
      }
      ctx.stroke();
    });
  }, []);

  // Listen for socket events
  useEffect(() => {
    const socket = socketService.getSocket();

    const handleStrokeStart = (stroke: DrawStroke) => {
      setStrokes((prev) => {
        const next = [...prev, stroke];
        redrawAll(next);
        return next;
      });
    };

    const handleUndoBroadcast = (data: { drawingHistory: DrawStroke[] }) => {
      setStrokes(data.drawingHistory);
      redrawAll(data.drawingHistory);
    };

    const handleRedoBroadcast = (data: { stroke: DrawStroke }) => {
      setStrokes((prev) => {
        const next = [...prev, data.stroke];
        redrawAll(next);
        return next;
      });
    };

    const handleClearBroadcast = () => {
      setStrokes([]);
      setUndoneStrokes([]);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
    };

    const handleFullSync = (history: DrawStroke[]) => {
      setStrokes(history);
      redrawAll(history);
    };

    socket.on(SOCKET_EVENTS.DRAW_STROKE_START, handleStrokeStart);
    socket.on(SOCKET_EVENTS.DRAW_UNDO_ALL, handleUndoBroadcast);
    socket.on(SOCKET_EVENTS.DRAW_REDO_ALL, handleRedoBroadcast);
    socket.on(SOCKET_EVENTS.DRAW_CLEAR_ALL, handleClearBroadcast);
    socket.on(SOCKET_EVENTS.DRAW_FULL_SYNC, handleFullSync);

    return () => {
      socket.off(SOCKET_EVENTS.DRAW_STROKE_START, handleStrokeStart);
      socket.off(SOCKET_EVENTS.DRAW_UNDO_ALL, handleUndoBroadcast);
      socket.off(SOCKET_EVENTS.DRAW_REDO_ALL, handleRedoBroadcast);
      socket.off(SOCKET_EVENTS.DRAW_CLEAR_ALL, handleClearBroadcast);
      socket.off(SOCKET_EVENTS.DRAW_FULL_SYNC, handleFullSync);
    };
  }, [redrawAll]);

  // Initial canvas fill
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  // Coordinate normalizer (0 to 1)
  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ): DrawPoint | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;

    return {
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y))
    };
  };

  // Drawing event handlers
  const handlePointerDown = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawer) return;
    const pt = getCoordinates(e);
    if (!pt) return;

    setIsDrawing(true);
    const newStroke: DrawStroke = {
      id: `${playerId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      tool,
      color,
      size,
      points: [pt]
    };
    setCurrentStroke(newStroke);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = size;
        ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
        ctx.moveTo(pt.x * canvas.width, pt.y * canvas.height);
      }
    }
  };

  const handlePointerMove = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawer || !isDrawing || !currentStroke) return;
    const pt = getCoordinates(e);
    if (!pt) return;

    currentStroke.points.push(pt);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineTo(pt.x * canvas.width, pt.y * canvas.height);
        ctx.stroke();
      }
    }
  };

  const handlePointerUp = () => {
    if (!isDrawer || !isDrawing || !currentStroke) return;
    setIsDrawing(false);

    if (currentStroke.points.length > 0) {
      socketService.emitDrawStroke(roomCode, playerId, currentStroke);
      setStrokes((prev) => [...prev, currentStroke]);
      setUndoneStrokes([]);
    }
    setCurrentStroke(null);
  };

  const handleUndo = () => {
    if (!isDrawer || strokes.length === 0) return;
    socketService.emitDrawUndo(roomCode, playerId);
    const popped = strokes[strokes.length - 1];
    setUndoneStrokes((prev) => [...prev, popped]);
    const next = strokes.slice(0, -1);
    setStrokes(next);
    redrawAll(next);
  };

  const handleRedo = () => {
    if (!isDrawer || undoneStrokes.length === 0) return;
    socketService.emitDrawRedo(roomCode, playerId);
    const restored = undoneStrokes[undoneStrokes.length - 1];
    setUndoneStrokes((prev) => prev.slice(0, -1));
    const next = [...strokes, restored];
    setStrokes(next);
    redrawAll(next);
  };

  const handleClear = () => {
    if (!isDrawer) return;
    socketService.emitDrawClear(roomCode, playerId);
    setStrokes([]);
    setUndoneStrokes([]);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  return (
    <div className="flex flex-col w-full h-full select-none">
      {/* Canvas Paper Container */}
      <div className="relative w-full aspect-[4/3] max-h-[55vh] md:max-h-[62vh] rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] bg-white touch-none">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className={`w-full h-full object-contain ${isDrawer ? 'cursor-crosshair' : 'cursor-default'}`}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        />

        {/* Non-drawer lock indicator */}
        {!isDrawer && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full glass-card border border-white/10 text-xs font-semibold text-slate-200 shadow-md">
            <Lock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Guesser View</span>
          </div>
        )}
      </div>

      {/* Drawer Control Toolbar */}
      {isDrawer && (
        <div className="mt-3 p-3 rounded-2xl glass-card border border-white/10 flex flex-wrap items-center justify-between gap-2.5 shadow-xl">
          {/* Tool switch: Brush vs Eraser */}
          <div className="flex items-center gap-1 bg-[#080B16] p-1 rounded-xl border border-white/[0.08]">
            <button
              onClick={() => setTool('brush')}
              className={`p-2 rounded-lg transition-all ${
                tool === 'brush'
                  ? 'bg-[#7655F7] text-white font-semibold shadow-md shadow-[#7655F7]/30'
                  : 'text-[#929BB3] hover:text-white'
              }`}
              title="Paintbrush"
            >
              <Paintbrush className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTool('eraser')}
              className={`p-2 rounded-lg transition-all ${
                tool === 'eraser'
                  ? 'bg-[#FF647C] text-white font-semibold shadow-md shadow-[#FF647C]/30'
                  : 'text-[#929BB3] hover:text-white'
              }`}
              title="Eraser"
            >
              <Eraser className="w-4 h-4" />
            </button>
          </div>

          {/* Color Palette (12 Studio Colors) */}
          {tool === 'brush' && (
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform border border-white/20 ${
                    color === c
                      ? 'scale-125 ring-2 ring-[#28C7E8] ring-offset-2 ring-offset-[#080B16]'
                      : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          )}

          {/* Brush Sizes */}
          <div className="flex items-center gap-1.5 bg-[#080B16] p-1.5 rounded-xl border border-white/[0.08]">
            {BRUSH_SIZES.map((sz) => (
              <button
                key={sz}
                onClick={() => setSize(sz)}
                className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${
                  size === sz ? 'bg-[#7655F7] text-white font-bold shadow-sm' : 'text-[#929BB3] hover:text-white'
                }`}
                title={`Size ${sz}`}
              >
                <div
                  className="rounded-full bg-current"
                  style={{ width: Math.max(3, sz / 2.5), height: Math.max(3, sz / 2.5) }}
                />
              </button>
            ))}
          </div>

          {/* Action buttons: Undo, Redo, Clear */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleUndo}
              disabled={strokes.length === 0}
              className="p-2 rounded-xl bg-[#181E32] text-[#F4F5FF] hover:bg-white/[0.1] disabled:opacity-30 disabled:cursor-not-allowed border border-white/[0.08] transition-all cursor-pointer"
              title="Undo"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={undoneStrokes.length === 0}
              className="p-2 rounded-xl bg-[#181E32] text-[#F4F5FF] hover:bg-white/[0.1] disabled:opacity-30 disabled:cursor-not-allowed border border-white/[0.08] transition-all cursor-pointer"
              title="Redo"
            >
              <Redo2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleClear}
              className="p-2 rounded-xl bg-[#FF647C]/15 text-[#FF647C] hover:bg-[#FF647C]/25 border border-[#FF647C]/30 transition-all cursor-pointer"
              title="Clear Canvas"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
