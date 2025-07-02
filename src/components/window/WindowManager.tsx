import type { FunctionalComponent, ComponentChildren } from "preact";
import { useState, useCallback } from "preact/hooks";
import { Window } from "@components/window/Window";
import { PostViewer } from "@/components/window/PostViewer";

interface WindowConfig {
  id: string;
  title: string;
  content: ComponentChildren;
  initialX?: number;
  initialY?: number;
  initialWidth?: number;
  initialHeight?: number;
  minimized?: boolean;
  maximized?: boolean;
}

interface App {
  icon: string;
  title: string;
  content?: ComponentChildren;
  initialWidth?: number;
  initialHeight?: number;
}

const apps: App[] = [
  {
    icon: "A",
    title: "PostViewer",
    content: <PostViewer />,
    initialWidth: 1000,
    initialHeight: 600,
  },
  {
    icon: "B",
    title: "Very long title",
    content: "Testing",
  },
];

// WindowManager component, functionally similar to desktop environments
export const WindowManager: FunctionalComponent = () => {
  const [windows, setWindows] = useState<WindowConfig[]>([]);
  const [focusedId, setFocusedId] = useState<string | null>(null);

  // Open or focus a window by icon index
  const openWindow = useCallback((iconIdx: number = 0) => {
    const app = apps[iconIdx];
    setWindows(ws => {
      const idx = ws.findIndex(w => w.title === app.title);
      if (idx !== -1) {
        const win = ws[idx];
        setFocusedId(win.id);
        return [...ws.slice(0, idx), ...ws.slice(idx + 1), win];
      }
      const id = crypto.randomUUID();
      setFocusedId(id);
      return [
        ...ws,
        {
          id,
          title: app.title,
          content: app.content,
          initialX: 120 + ws.length * 30,
          initialY: 120 + ws.length * 30,
          initialWidth: app.initialWidth,
          initialHeight: app.initialHeight,
        },
      ];
    });
  }, [apps]);

  // Close a window by id and focus the next top, un-minimized window
  const closeWindow = useCallback((id: string) => {
    setWindows(ws => {
      const newWindows = ws.filter(w => w.id !== id);
      const topWindow = [...newWindows].reverse().find(w => !w.minimized);
      setFocusedId(topWindow ? topWindow.id : null);
      return newWindows;
    });
  }, []);

  // Bring a window to front and focus
  const focusWindow = useCallback((id: string) => {
    setWindows(ws => {
      const idx = ws.findIndex(w => w.id === id);
      return (idx !== -1) ? [...ws.slice(0, idx), ...ws.slice(idx + 1), ws[idx]] : ws;
    });
    setFocusedId(id);
  }, []);

  // Toggle values in WindowData
  const toggleValue = useCallback((id: string, value: keyof WindowConfig) => {
    setWindows(ws => ws.map(w => w.id === id ? { ...w, [value] : !w[value] } : w));
  }, []);

  return (
    <div
      className="window-manager"
      onMouseDown={e => setFocusedId(e.target === e.currentTarget ? null : focusedId)}
    >
      {/* Appbar */}
      <div className="wm-appbar">
        {apps.map((app, idx) => (
          <button
            key={app.title}
            onDblClick={() => openWindow(idx)}
            className="app"
            title={app.title}
          >
            <span className="app-icon">{app.icon}</span>
            <span className="app-title">{app.title}</span>
          </button>
        ))}
      </div>
      {/* Populate Windows */}
      {windows.map((win, i) => (
        <Window
          key={win.id}
          title={win.title}
          initialX={win.initialX}
          initialY={win.initialY}
          initialWidth={win.initialWidth}
          initialHeight={win.initialHeight}
          zIndex={10 + i}
          minimized={win.minimized}
          maximized={win.maximized}
          focused={(i === windows.length - 1) && (win.id === focusedId)}  // Only focus topmost window
          onClose={() => closeWindow(win.id)}
          onFocus={() => focusWindow(win.id)}
          onToggleMinimize={() => {
            // Ensure works against maximized state
            if (win.maximized) toggleValue(win.id, "maximized");
            toggleValue(win.id, "minimized");
          }}
          onToggleMaximize={() => {
            // Ensure works against minimized state
            if (win.minimized) toggleValue(win.id, "minimized");
            toggleValue(win.id, "maximized");
          }}
        >
          {win.content}
        </Window>
      ))}
    </div>
  );
};