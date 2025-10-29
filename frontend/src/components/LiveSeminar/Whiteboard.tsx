import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { WhiteboardDrawing, User } from '../../types/seminar.types';

interface WhiteboardProps {
    drawings: WhiteboardDrawing[];
    user: User | null;
    isInstructor: boolean;
    onSaveDrawing: (drawingData: string, drawnBy: string) => Promise<void>;
    onClearWhiteboard: () => Promise<void>;
}

interface DrawingSettings {
    brushColor: string;
    brushSize: number;
    tool: 'pen' | 'eraser';
}

interface DrawingState {
    isDrawing: boolean;
    lastX: number;
    lastY: number;
}

interface DrawingPoint {
    x: number;
    y: number;
}

interface DrawingPath {
    color: string;
    size: number;
    points: DrawingPoint[];
}

interface ParsedDrawingData {
    paths: DrawingPath[];
}

const Whiteboard: React.FC<WhiteboardProps> = ({
                                                   drawings,
                                                   user,
                                                   isInstructor,
                                                   onSaveDrawing,
                                                   onClearWhiteboard
                                               }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [settings, setSettings] = useState<DrawingSettings>({
        brushColor: '#000000',
        brushSize: 3,
        tool: 'pen'
    });
    const [drawingState, setDrawingState] = useState<DrawingState>({
        isDrawing: false,
        lastX: 0,
        lastY: 0
    });

    // Canvas Setup
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        canvas.width = 800;
        canvas.height = 600;

        // Set default styles
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }, []);

    // Redraw canvas when drawings change
    useEffect(() => {
        redrawCanvas();
    }, [drawings]);

    const redrawCanvas = useCallback((): void => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Redraw all drawings
        drawings.forEach(drawing => {
            try {
                const drawingData: ParsedDrawingData = JSON.parse(drawing.drawingData);
                if (drawingData.paths) {
                    drawingData.paths.forEach((path: DrawingPath) => {
                        ctx.beginPath();
                        ctx.strokeStyle = path.color || '#000000';
                        ctx.lineWidth = path.size || 3;
                        ctx.lineCap = 'round';

                        if (path.points && path.points.length > 0) {
                            ctx.moveTo(path.points[0].x, path.points[0].y);
                            path.points.forEach((point: DrawingPoint) => {
                                ctx.lineTo(point.x, point.y);
                            });
                            ctx.stroke();
                        }
                    });
                }
            } catch (error) {
                console.error('Fehler beim Wiederherstellen der Zeichnung:', error);
            }
        });
    }, [drawings]);

    const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number } => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>): void => {
        if (!isInstructor) return;

        const pos = getMousePos(e);
        setDrawingState({
            isDrawing: true,
            lastX: pos.x,
            lastY: pos.y
        });
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>): void => {
        if (!drawingState.isDrawing || !isInstructor) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const pos = getMousePos(e);

        ctx.beginPath();
        ctx.moveTo(drawingState.lastX, drawingState.lastY);
        ctx.lineTo(pos.x, pos.y);

        if (settings.tool === 'pen') {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = settings.brushColor;
        } else {
            ctx.globalCompositeOperation = 'destination-out';
        }

        ctx.lineWidth = settings.brushSize;
        ctx.stroke();

        setDrawingState(prev => ({
            ...prev,
            lastX: pos.x,
            lastY: pos.y
        }));
    };

    const stopDrawing = (): void => {
        if (!drawingState.isDrawing) return;

        setDrawingState(prev => ({ ...prev, isDrawing: false }));

        // Save drawing
        if (canvasRef.current && user) {
            const drawingData = canvasRef.current.toDataURL();
            onSaveDrawing(drawingData, user.username);
        }
    };

    const clearCanvas = async (): Promise<void> => {
        if (!isInstructor) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await onClearWhiteboard();
    };

    const handleColorChange = (color: string): void => {
        setSettings(prev => ({ ...prev, brushColor: color, tool: 'pen' }));
    };

    const handleSizeChange = (size: number): void => {
        setSettings(prev => ({ ...prev, brushSize: size }));
    };

    const handleToolChange = (tool: 'pen' | 'eraser'): void => {
        setSettings(prev => ({ ...prev, tool }));
    };

    return (
        <div className="whiteboard">
            {/* Toolbar - nur für Instructors */}
    {isInstructor && (
        <div className="whiteboard-toolbar">
        <div className="tool-group">
            <label>Werkzeug:</label>
    <button
        className={`tool-btn ${settings.tool === 'pen' ? 'active' : ''}`}
        onClick={() => handleToolChange('pen')}
        title="Stift"
            >
                            ✏️
                        </button>
                        <button
        className={`tool-btn ${settings.tool === 'eraser' ? 'active' : ''}`}
        onClick={() => handleToolChange('eraser')}
        title="Radierer"
            >
                            🧽
                        </button>
                        </div>

                        <div className="tool-group">
        <label>Farbe:</label>
    <div className="color-palette">
        {['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'].map(color => (
        <button
            key={color}
        className={`color-btn ${settings.brushColor === color ? 'active' : ''}`}
        style={{ backgroundColor: color }}
        onClick={() => handleColorChange(color)}
        title={color}
        />
    ))}
        <input
            type="color"
        value={settings.brushColor}
        onChange={(e) => handleColorChange(e.target.value)}
        className="color-picker"
            />
            </div>
            </div>

            <div className="tool-group">
        <label>Größe: {settings.brushSize}px</label>
    <input
        type="range"
        min="1"
        max="20"
        value={settings.brushSize}
        onChange={(e) => handleSizeChange(parseInt(e.target.value))}
        className="size-slider"
            />
            </div>

            <div className="tool-group">
    <button
        onClick={clearCanvas}
        className="clear-btn"
        title="Whiteboard löschen"
            >
                            🗑️ Löschen
    </button>
    </div>
    </div>
    )}

    {/* Canvas */}
    <div className="canvas-container">
    <canvas
        ref={canvasRef}
    className={`whiteboard-canvas ${!isInstructor ? 'readonly' : ''}`}
    onMouseDown={startDrawing}
    onMouseMove={draw}
    onMouseUp={stopDrawing}
    onMouseLeave={stopDrawing}
    style={{
        cursor: isInstructor
            ? settings.tool === 'pen'
                ? 'crosshair'
                : 'grab'
            : 'default'
    }}
    />

    {!isInstructor && (
        <div className="readonly-overlay">
            <p>👀 Nur-Lesen Modus</p>
    </div>
    )}
    </div>
    </div>
);
};

export default Whiteboard;