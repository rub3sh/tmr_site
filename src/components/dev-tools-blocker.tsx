'use client';

import { useEffect, useState } from 'react';

const DEVTOOLS_THRESHOLD = 160;

function isDevToolsOpen(): boolean {
  return (
    window.outerWidth - window.innerWidth > DEVTOOLS_THRESHOLD ||
    window.outerHeight - window.innerHeight > DEVTOOLS_THRESHOLD
  );
}

export function DevToolsBlocker() {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    // Block keyboard shortcuts that open devtools
    function handleKeydown(e: KeyboardEvent) {
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const alt = e.altKey;
      const key = e.key;

      const isDevToolsShortcut =
        key === 'F12' ||
        (ctrl && shift && ['I', 'J', 'C', 'K'].includes(key.toUpperCase())) ||
        (ctrl && key.toUpperCase() === 'U') ||
        (ctrl && alt && key.toUpperCase() === 'I') ||
        (ctrl && alt && key.toUpperCase() === 'U');

      if (isDevToolsShortcut) {
        e.preventDefault();
        e.stopImmediatePropagation();
        setBlocked(true);
      }
    }

    // Block right-click context menu
    function handleContextMenu(e: MouseEvent) {
      e.preventDefault();
    }

    // Detect already-open devtools via window size delta
    function checkDevTools() {
      setBlocked(isDevToolsOpen());
    }

    document.addEventListener('keydown', handleKeydown, true);
    document.addEventListener('contextmenu', handleContextMenu, true);
    window.addEventListener('resize', checkDevTools);

    // Initial check + periodic re-check (handles undocked devtools drag)
    checkDevTools();
    const interval = setInterval(checkDevTools, 800);

    return () => {
      document.removeEventListener('keydown', handleKeydown, true);
      document.removeEventListener('contextmenu', handleContextMenu, true);
      window.removeEventListener('resize', checkDevTools);
      clearInterval(interval);
    };
  }, []);

  if (!blocked) return null;

  return (
    <div
      style={{ zIndex: 2147483647 }}
      className="fixed inset-0 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="flex flex-col items-center gap-6 max-w-sm text-center px-6">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-10 h-10 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>

        {/* Heading */}
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Restricted</h1>
          <p className="text-red-400 text-sm font-medium uppercase tracking-widest">
            Developer Tools Detected
          </p>
        </div>

        {/* Message */}
        <p className="text-gray-400 text-sm leading-relaxed">
          Developer tools are not permitted on this platform. Please close the
          developer console and return to the site.
        </p>

        {/* Divider */}
        <div className="w-full h-px bg-white/10" />

        {/* Instruction */}
        <p className="text-gray-500 text-xs">
          Close the developer tools panel and this message will disappear
          automatically.
        </p>
      </div>
    </div>
  );
}
