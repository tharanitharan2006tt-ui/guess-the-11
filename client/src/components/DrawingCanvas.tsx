import React, { useRef, useEffect, useState, useCallback } from 'react';
import { DrawStroke, DrawPoint, DrawTool, SOCKET_EVENTS } from '@guess-the-11/shared';
import { socketService } from '../services/socket';
import {
  Paintbrush,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  Lock,
  Palette
} from 'lucide-react';

interface DrawingCanvasProps {
  roomCode: string;
  playerId: string;
  isDrawer: boolean;
}

const COLORS = [
  '#00F0FF', // Electric Blue
  '#C084FC', // Neon Purple
  '#F43F5E', // Hot Pink
  '#10B981', // Emerald Neon
  '#F59E0B', // Sun Gold
  '#FFFFFF', // Pure White
  '#000000', // Deep Black
  '#6366F1'  // Indigo
];

const BRUSH_SIZES = [3, 6, 12, 24];

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ roomCode, playerId, isDrawer }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tool, setTool] = useState<DrawTool>('brush');
  const [color, setColor] = useState<string>('#00F0FF');
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

    // Draw background
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render strokes
    strokeList.forEach((stroke) => {
      if (stroke.points.length === 0) return;

      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = stroke.size;
      ctx.strokeStyle = stroke.tool === 'eraser' ? '#0F172A' : stroke.color;

      const first = stroke.points[0];
      // Convert normalized (0-1) coordinates to canvas pixel space
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
          ctx.fillStyle = '#0F172A';
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
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  // Helper to extract normalized coordinates
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): DrawPoint | null => {
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

    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

    return { x, y };
  };

  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawer) return;
    const pt = getCoordinates(e);
    if (!pt) return;

    setIsDrawing(true);
    const newStroke: DrawStroke = {
      id: `stroke_${Date.now()}_${Math.random()}`,
      tool,
      color,
      size,
      points: [pt]
    };
    setCurrentStroke(newStroke);

    // Live preview
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = size;
        ctx.strokeStyle = tool === 'eraser' ? '#0F172A' : color;
        ctx.moveTo(pt.x * canvas.width, pt.y * canvas.height);
      }
    }
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawer || !isDrawing || !currentStroke) return;
    const pt = getCoordinates(e);
    if (!pt) return;

    currentStroke.points.push(pt);

    // Draw live segment
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
      // Send completed stroke to server
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
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  return (
    <div className="flex flex-col w-full h-full select-none">
      {/* Canvas Container with Glass Frame */}
      <div className="relative w-full aspect-[4/3] max-h-[55vh] md:max-h-[65vh] rounded-2xl overflow-hidden border-2 border-indigo-500/30 shadow-glass bg-slate-900 touch-none">
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
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-xs font-medium text-slate-400">
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Guesser View</span>
          </div>
        )}
      </div>

      {/* Drawer Control Toolbar */}
      {isDrawer && (
        <div className="mt-3 p-3 rounded-2xl glass-card flex flex-wrap items-center justify-between gap-3 shadow-glass animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Tool switch: Brush vs Eraser */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/50">
            <button
              onClick={() => setTool('brush')}
              className={`p-2 rounded-lg transition-all ${
                tool === 'brush'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-neon-blue'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Paintbrush"
            >
              <Paintbrush className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTool('eraser')}
              className={`p-2 rounded-lg transition-all ${
                tool === 'eraser'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-neon-purple'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Eraser"
            >
              <Eraser className="w-4 h-4" />
            </button>
          </div>

          {/* Color Palette */}
          {tool === 'brush' && (
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          )}

          {/* Brush Sizes */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/50">
            {BRUSH_SIZES.map((sz) => (
              <button
                key={sz}
                onClick={() => setSize(sz)}
                className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${
                  size === sz ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <div
                  className="rounded-full bg-current"
                  style={{ width: Math.max(3, sz / 2), height: Math.max(3, sz / 2) }}
                />
              </button>
            ))}
          </div>

          {/* Action buttons: Undo, Redo, Clear */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleUndo}
              disabled={strokes.length === 0}
              className="p-2 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700/50 transition-all"
              title="Undo"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={undoneStrokes.length === 0}
              className="p-2 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700/50 transition-all"
              title="Redo"
            >
              <Redo2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleClear}
              className="p-2 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white border border-rose-500/30 transition-all"
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
