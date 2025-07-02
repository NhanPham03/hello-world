import type { FunctionalComponent, ComponentChildren } from "preact";
import { useState, useRef, useEffect } from "preact/hooks";

const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(val, max));

const minWidth = 150;
const minHeight = 50;

interface WindowProps {
  title: string;
  initialX?: number;
  initialY?: number;
  initialWidth?: number;
  initialHeight?: number;
  zIndex?: number;
  minimized?: boolean;
  maximized?: boolean;
  focused?: boolean;
  onClose: () => void;
  onFocus: () => void;
  onToggleMinimize: () => void;
  onToggleMaximize: () => void;
  children?: ComponentChildren;
}

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

// Window component to be used within WindowManager
export const Window: FunctionalComponent<WindowProps> = ({
  title,
  initialX = 100,
  initialY = 100,
  initialWidth = 600,
  initialHeight = 400,
  zIndex = 10,
  minimized = false,
  maximized = false,
  focused = false,
  onClose,
  onFocus,
  onToggleMinimize,
  onToggleMaximize,
  children,
}) => {
  // Track window position/size
  const [pos, setPos] = useState<Position>({ x: initialX, y: initialY });
  const pendingPos = useRef<Position>(pos);
  const [size, setSize] = useState<Size>({ width: initialWidth, height: initialHeight });
  const pendingSize = useRef<Size>(size);

  // Mouse/touch position offset (Avoid window jumping)
  const [offset, setOffset] = useState<Position>({ x: 0, y: 0 });

  // Flags for dragging/resizing
  const [dragging, setDragging] = useState<boolean>(false);
  const [resizing, setResizing] = useState<string | null>(null);

  // Move/resize (optimized with requestAnimationFrame)
  const rafRef = useRef<number | null>(null);
  const lastResizeStart = useRef<{
    clientX: number;
    clientY: number;
    width: number;
    height: number;
    x: number;
    y: number;
  } | null>(null);

  // Handle dragging/resizing logic
  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      const { clientX, clientY } = getClientXY(e);

      if (dragging) {
        // THIS IS THE DRAG LOGIC
        const newPos = {
          x: clamp(clientX - offset.x, 50 - size.width, window.innerWidth - 50),
          y: clamp(clientY - offset.y, 0, window.innerHeight - 40),
        };
        pendingPos.current = newPos;

        if (rafRef.current === null) {
          rafRef.current = requestAnimationFrame(() => {
            setPos(pendingPos.current);
            rafRef.current = null;
          });
        }
      } else if (resizing && lastResizeStart.current) {
        // THIS IS THE RESIZE LOGIC
        let { width, height, x, y } = lastResizeStart.current;
        let newPos = { x, y };
        let newSize = { width, height };

        // Directions: [n, s, e, w, ne, nw, se, sw]
        if (resizing.includes("e")) {
          newSize.width = clamp(clientX - x, minWidth, window.innerWidth - x);
        }
        if (resizing.includes("w")) {
          newSize.width = clamp(width + (x - clientX), minWidth, width + x);
          newPos.x = clamp(clientX, 0, x + width - minWidth);
        }
        if (resizing.includes("s")) {
          newSize.height = clamp(clientY - y, minHeight, window.innerHeight - y);
        }
        if (resizing.includes("n")) {
          newSize.height = clamp(height + (y - clientY), minHeight, height + y);
          newPos.y = clamp(clientY, 0, y + height - minHeight);
        }
        pendingPos.current = newPos;
        pendingSize.current = newSize;

        // Prevent unnecessary renders
        if (rafRef.current === null) {
          rafRef.current = requestAnimationFrame(() => {
            setPos(pendingPos.current);
            setSize(pendingSize.current);
            rafRef.current = null;
          });
        }
      }
    };

    const onUp = () => {
      setDragging(false);
      setResizing(null);
      setOffset({ x: 0, y: 0 });
      lastResizeStart.current = null;
      rafRef.current && cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };

    if (dragging || resizing) {
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
      window.addEventListener("touchmove", onMove);
      window.addEventListener("touchend", onUp);
      document.body.classList.add("dragging");
      // Cleanup function
      return () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        window.removeEventListener("touchmove", onMove);
        window.removeEventListener("touchend", onUp);
        document.body.classList.remove("dragging");
        rafRef.current && cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      };
    }
    document.body.classList.remove("dragging"); // Cover edge case where class still exists
  }, [dragging, resizing]);

  const onHeaderDown = (e: MouseEvent | TouchEvent) => {
    if (maximized) return; // Prevent dragging when maximized
    const { clientX, clientY } = getClientXY(e);
    setOffset({
      x: clientX - pos.x,
      y: clientY - pos.y,
    });
    setDragging(true); // Enable flag, run drag logic (useEffect)
  };

  const onResizeDown = (dir: string, e: MouseEvent | TouchEvent) => {
    if (maximized || minimized) return; // Prevent resizing when maximized or minimized
    const { clientX, clientY } = getClientXY(e);
    lastResizeStart.current = {
      clientX,
      clientY,
      width: size.width,
      height: size.height,
      x: pos.x,
      y: pos.y,
    };
    setResizing(dir); // Enable flag, run resize logic (useEffect)
  };

  // Get mouse/touch position from event
  const getClientXY = (e: MouseEvent | TouchEvent) => {
    return {
      clientX: "touches" in e ? e.touches[0].clientX : e.clientX,
      clientY: "touches" in e ? e.touches[0].clientY : e.clientY,
    };
  };

  return (
    <div
      aria-label={title}
      className={`window${focused ? " focus" : ""}${minimized ? " minimized" : ""}${maximized ? " maximized" : ""}`}
      style={{
        left: pos.x,
        top: pos.y,
        width: size.width,
        height: size.height,
        zIndex: zIndex,
      }}
      onFocus={() => onFocus()}
      role="dialog"
      aria-modal="true"
      tabIndex={0}
    >
      {/* Header */}
      <div
        className="wd-header"
        onMouseDown={(e) => onHeaderDown(e)}
        onTouchStart={(e) => onHeaderDown(e)}
        onDblClick={() => onToggleMaximize()}
      >
        {/* Title */}
        <div className="wd-title">
          <p>{title}</p>
        </div>
        {/* Controls */}
        <div className="wd-controls">
          <button aria-label="Minimize" onClick={() => onToggleMinimize()} tabIndex={-1}>
            <span className={`ic--baseline-${minimized ? "arrow-down" : "arrow-up"}`}></span>
          </button>
          <button aria-label="Maximize" onClick={() => onToggleMaximize()} tabIndex={-1}>
            <span className={`ic--baseline-${maximized ? "zoom-in" : "zoom-out"}`}></span>
          </button>
          <button aria-label="Close" onClick={() => onClose()} tabIndex={-1}>
            <span className="ic--baseline-close"></span>
          </button>
        </div>
      </div>
      {/* Content */}
      <div className="wd-content">{children}</div>
      {/* Resize handles */}
      {!(maximized || minimized) &&
        ["n", "s", "e", "w", "ne", "nw", "se", "sw"].map((dir) => (
          <div
            key={dir}
            className={`wd-resize ${dir}`}
            onMouseDown={(e) => onResizeDown(dir, e)}
            onTouchStart={(e) => onResizeDown(dir, e)}
          ></div>
        ))}
    </div>
  );
};
